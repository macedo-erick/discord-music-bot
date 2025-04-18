import { defaultAvatar } from '@configs/bot-config.json';
import { YoutubeService } from '@services/youtube-service';
import { Command } from '@utils/command';
import { PlayerBuilder } from '@utils/player-builder';
import { VoiceChannelNotConnectedEmbed } from '@utils/voice-channel-not-connected-embed';
import {
  ChatInputCommandInteraction,
  EmbedBuilder,
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
        return await interaction.reply({
          embeds: [new VoiceChannelNotConnectedEmbed()],
        });
      }

      const query = interaction.options.getString('query', true);
      const song = await this.youtubeService.download(query);

      const player = this.playerBuilder.get(channel);
      const queuePosition = player.play(song);

      const embed = new EmbedBuilder()
        .setColor(0x1ed760)
        .setAuthor({
          iconURL:
            interactionMember.user.avatarURL({ size: 16 }) ?? defaultAvatar,
          name: `Adding the Song to Queue #${queuePosition}`,
        })
        .setDescription(song.title);

      return await interaction.reply({ embeds: [embed] });
    } catch (err) {
      console.error(err);

      return await interaction.reply({
        content: 'Something went wrong',
        flags: MessageFlags.Ephemeral,
      });
    }
  }
}
