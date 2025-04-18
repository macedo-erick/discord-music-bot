import { Command } from '@commands/command';
import { PlayerBuilder } from '@utils/player-builder';
import {
  ChatInputCommandInteraction,
  GuildMember,
  InteractionResponse,
  Message,
  MessageFlags,
} from 'discord.js';
import { inject, injectable } from 'tsyringe';

@injectable()
export class ResumeCommand extends Command {
  constructor(
    @inject(PlayerBuilder) private readonly playerBuilder: PlayerBuilder,
  ) {
    super('resume', 'Resume the current song');
  }

  async execute(
    interaction: ChatInputCommandInteraction,
  ): Promise<InteractionResponse | Message> {
    try {
      const interactionMember = interaction.member as GuildMember;
      const channel = interactionMember.voice.channel;

      if (!channel) {
        return await interaction.reply(
          'You are not connected to a voice channel!',
        );
      }

      this.playerBuilder.get(channel).unpause();

      return await interaction.reply(`Resumed`);
    } catch (err) {
      console.error(err);

      return await interaction.reply({
        content: 'Something went wrong',
        flags: MessageFlags.Ephemeral,
      });
    }
  }
}
