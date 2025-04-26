import { Command } from '@utils/command';
import { VoiceChannelNotConnectedEmbed } from '@utils/embed';
import {
  ChatInputCommandInteraction,
  GuildMember,
  InteractionResponse,
  MessageFlags,
  VoiceBasedChannel,
} from 'discord.js';
import { inject, injectable } from 'tsyringe';

import { PlayerBuilder } from '../builders/player-builder';
import { EmbedService } from '../services/embed-service';

@injectable()
export class SkipCommand extends Command {
  constructor(
    @inject(PlayerBuilder) private readonly playerService: PlayerBuilder,
    @inject(EmbedService) private readonly embedService: EmbedService,
  ) {
    super('skip', 'Skip the current song');
  }

  async execute(
    interaction: ChatInputCommandInteraction,
  ): Promise<InteractionResponse> {
    try {
      const voiceChannel = this.getVoiceChannel(interaction);

      if (!voiceChannel) {
        return await interaction.reply({
          embeds: [new VoiceChannelNotConnectedEmbed()],
        });
      }

      const player = this.playerService.get(voiceChannel);
      player.skip();

      const member = interaction.member as GuildMember;
      const embed = this.embedService.createSkipEmbed(member, voiceChannel);

      return await interaction.reply({
        embeds: [embed],
      });
    } catch (err) {
      console.error('Failed to execute skip command:', err);

      return interaction.reply({
        content: 'Something went wrong.',
        flags: MessageFlags.Ephemeral,
      });
    }
  }

  private getVoiceChannel(
    interaction: ChatInputCommandInteraction,
  ): null | VoiceBasedChannel {
    const member = interaction.member as GuildMember;
    return member.voice.channel;
  }
}
