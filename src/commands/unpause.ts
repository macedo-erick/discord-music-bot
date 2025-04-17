import { Command } from '@commands/command';
import {
  ChatInputCommandInteraction,
  InteractionResponse,
  Message,
} from 'discord.js';
import { inject, injectable } from 'tsyringe';

import { PlayerService } from '../services/player-service';

@injectable()
export class UnpauseCommand extends Command {
  constructor(
    @inject(PlayerService) private readonly playerService: PlayerService,
  ) {
    super('unpause', 'Unpause the current song');
  }

  async execute(
    interaction: ChatInputCommandInteraction,
  ): Promise<InteractionResponse | Message> {
    try {
      this.playerService.unpause();

      return await interaction.reply('Unpause');
    } catch (err) {
      return await interaction.reply(`Something went wrong: ${err}`);
    }
  }
}
