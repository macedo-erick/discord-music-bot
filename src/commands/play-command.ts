import { Command } from '@commands/command';
import { YoutubeService } from '@services/youtube-service';
import { PlayerBuilder } from '@utils/player-builder';
import {
  ChatInputCommandInteraction,
  GuildMember,
  MessageFlags,
} from 'discord.js';
import { inject, injectable } from 'tsyringe';

@injectable()
export class PlayCommand extends Command {
  constructor(
    @inject(YoutubeService) private readonly youtubeService: YoutubeService,
    @inject(PlayerBuilder) private readonly playerBuilder: PlayerBuilder,
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
      const interactionMember = interaction.member as GuildMember;
      const channel = interactionMember.voice.channel;

      if (!channel) {
        return await interaction.reply(
          'You are not connected to a voice channel!',
        );
      }

      const query = interaction.options.getString('query', true);
      const song = await this.youtubeService.download(query);

      const player = this.playerBuilder.get(channel);
      player.play(song);

      await interaction.deferReply();

      return await interaction.followUp(`**enqueued !**`);
    } catch (err) {
      console.error(err);

      return await interaction.reply({
        content: 'Something went wrong',
        flags: MessageFlags.Ephemeral,
      });
    }
  }
}
