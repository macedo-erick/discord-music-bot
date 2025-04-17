import { Command } from '@commands/command';
import { ChatInputCommandInteraction } from 'discord.js';

export class PauseCommand extends Command {
  constructor() {
    super('pause', 'Pauses the currently playing track');
  }

  async execute(interaction: ChatInputCommandInteraction): Promise<void> {
    await interaction.reply('Oi');
  }
}
