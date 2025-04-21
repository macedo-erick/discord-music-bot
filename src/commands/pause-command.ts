import { Command } from '@utils/command';
import { VoiceChannelNotConnectedEmbed } from '@utils/embed';
import {
  ChatInputCommandInteraction,
  GuildMember,
  MessageFlags,
} from 'discord.js';
import { inject, injectable } from 'tsyringe';

import { PlayerBuilder } from '../builders/player-builder';

@injectable()
export class PauseCommand extends Command {
  constructor(
    @inject(PlayerBuilder) private readonly playerBuilder: PlayerBuilder,
  ) {
    super('pause', 'Pause the current song');
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

      this.playerBuilder.get(channel).pause();

      return await interaction.reply(`Paused`);
    } catch (err) {
      console.error(err);

      return await interaction.reply({
        content: 'Something went wrong',
        flags: MessageFlags.Ephemeral,
      });
    }
  }
}
