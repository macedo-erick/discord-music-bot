import { Command } from '@commands/command';
import { ChatInputCommandInteraction } from 'discord.js';

export class PlayCommand extends Command {
  constructor() {
    super('play', 'Give the song name or URL to start playing', (builder) =>
      builder.addStringOption((option) =>
        option
          .setName('query')
          .setDescription('Give the song name or URL to start playing')
          .setRequired(true),
      ),
    );
  }

  async execute(interaction: ChatInputCommandInteraction): Promise<void> {
    await interaction.reply('Oi');
  }
}
