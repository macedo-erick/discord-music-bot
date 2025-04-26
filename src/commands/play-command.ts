import { YoutubeService } from '@services/youtube-service';
import { Command } from '@utils/command';
import { VoiceChannelNotConnectedEmbed } from '@utils/embed';
import {
  ChatInputCommandInteraction,
  GuildMember,
  MessageFlags,
  VoiceBasedChannel,
} from 'discord.js';
import { inject, injectable } from 'tsyringe';

import { PlayerBuilder } from '../builders/player-builder';
import { EmbedService } from '../services/embed-service';

@injectable()
export class PlayCommand extends Command {
  constructor(
    @inject(YoutubeService) private readonly youtubeService: YoutubeService,
    @inject(PlayerBuilder) private readonly playerService: PlayerBuilder,
    @inject(EmbedService) private readonly embedService: EmbedService,
  ) {
    super('play', 'Give the song name or URL to start playing', (builder) =>
      builder.addStringOption((option) =>
        option
          .setName('query')
          .setDescription('Give the song name or URL to start playing')
          .setRequired(true),
      ),
    );
  }

  async execute(interaction: ChatInputCommandInteraction) {
    try {
      const voiceChannel = this.getVoiceChannel(interaction);
      if (!voiceChannel) {
        return await interaction.reply({
          embeds: [new VoiceChannelNotConnectedEmbed()],
        });
      }

      const query = interaction.options.getString('query', true);
      const song = await this.youtubeService.download(query);

      const player = this.playerService.get(voiceChannel);
      const queuePosition = player.play(song) + 1;

      const member = interaction.member as GuildMember;
      const embed = this.embedService.createPlayEmbed(
        member,
        song,
        queuePosition,
      );

      return await interaction.reply({ embeds: [embed] });
    } catch (err) {
      console.error('Failed to execute play command:', err);

      return await interaction.reply({
        content: 'Something went wrong.',
        flags: MessageFlags.Ephemeral,
      });
    }
  }

  private getVoiceChannel(
    interaction: ChatInputCommandInteraction,
  ): null | VoiceBasedChannel {
    const member = interaction.member as GuildMember;
    return member.voice.channel;
  }
}
