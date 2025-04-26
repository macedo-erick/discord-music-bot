import { Command } from '@utils/command';
import { VoiceChannelNotConnectedEmbed } from '@utils/embed';
import {
  ChatInputCommandInteraction,
  GuildMember,
  MessageFlags,
  VoiceBasedChannel,
} from 'discord.js';
import { inject, injectable } from 'tsyringe';

import { PlayerBuilder } from '../builders/player-builder';
import { EmbedService } from '../services/embed-service';

@injectable()
export class ResumeCommand extends Command {
  constructor(
    @inject(PlayerBuilder) private readonly playerService: PlayerBuilder,
    @inject(EmbedService) private readonly embedService: EmbedService,
  ) {
    super('resume', 'Resume the current song');
  }

  async execute(interaction: ChatInputCommandInteraction) {
    try {
      const voiceChannel = this.getVoiceChannel(interaction);

      if (!voiceChannel) {
        return await interaction.reply({
          embeds: [new VoiceChannelNotConnectedEmbed()],
        });
      }

      const player = this.playerService.get(voiceChannel);
      player.unpause();

      const member = interaction.member as GuildMember;
      const embed = this.embedService.createResumeEmbed(member, voiceChannel);

      return await interaction.reply({ embeds: [embed] });
    } catch (err) {
      console.error('Failed to execute resume command:', err);

      return await interaction.reply({
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
