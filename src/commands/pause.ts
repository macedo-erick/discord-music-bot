import { Command } from '@commands/command';
import { ChatInputCommandInteraction } from 'discord.js';

export class PauseCommand extends Command {
  constructor() {
    super('pause', 'Give the song name or URL to start playing');
  }

  async execute(interaction: ChatInputCommandInteraction): Promise<void> {
    await interaction.reply('Oi');
  }
}
