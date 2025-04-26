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
export class NowPlayingCommand extends Command {
  constructor(
    @inject(PlayerBuilder) private readonly playerService: PlayerBuilder,
    @inject(EmbedService) private readonly embedService: EmbedService,
  ) {
    super('now-playing', 'Show the current playing song');
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

      const embed = this.embedService.createNowPlayingEmbed(voiceChannel);

      return await interaction.reply({ embeds: [embed] });
    } catch (error) {
      console.error('Error executing NowPlayingCommand:', error);
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
    if (!member.voice.channel) return null;
    return member.voice.channel;
  }
}
