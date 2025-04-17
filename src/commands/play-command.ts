import { Command } from '@commands/command';
import {
  ChatInputCommandInteraction,
  GuildMember,
  MessageFlags,
} from 'discord.js';
import { inject, injectable } from 'tsyringe';

import { PlayerService } from '../services/player-service';
import { YoutubeService } from '../services/youtube-service';

@injectable()
export class PlayCommand extends Command {
  constructor(
    @inject(YoutubeService) private readonly youtubeService: YoutubeService,
    @inject(PlayerService) private readonly playerService: PlayerService,
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
    const interactionMember = interaction.member as GuildMember;
    const channel = interactionMember.voice.channel;

    if (!channel) {
      return interaction.reply('You are not connected to a voice channel!');
    }

    try {
      const query = interaction.options.getString('query', true);
      const data = await this.youtubeService.download(query);

      this.playerService.connect(channel);
      this.playerService.play(data);

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
