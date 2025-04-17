import { Command } from '@commands/command';
import {
  ChatInputCommandInteraction,
  InteractionResponse,
  Message,
} from 'discord.js';
import { inject, injectable } from 'tsyringe';

import { PlayerService } from '../services/player-service';

@injectable()
export class PauseCommand extends Command {
  constructor(
    @inject(PlayerService) private readonly playerService: PlayerService,
  ) {
    super('pause', 'Pause the current song');
  }

  async execute(
    interaction: ChatInputCommandInteraction,
  ): Promise<InteractionResponse | Message> {
    try {
      this.playerService.pause();

      return await interaction.reply('Paused');
    } catch (err) {
      return await interaction.reply(`Something went wrong: ${err}`);
    }
  }
}
