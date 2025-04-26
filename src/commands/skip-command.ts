import { Command } from '@utils/command';
import {
  ChatInputCommandInteraction,
  GuildMember,
  InteractionResponse,
  MessageFlags,
  VoiceBasedChannel,
} from 'discord.js';
import { inject, injectable } from 'tsyringe';

import { PlayerFacadeService } from '../services/player-facade-service';

/**
 * Command to skip the currently playing song
 */
@injectable()
export class SkipCommand extends Command {
  /**
   * Creates a new instance of the SkipCommand
   * @param playerFacade The player facade service for managing music playback
   */
  constructor(
    @inject(PlayerFacadeService)
    private readonly playerFacade: PlayerFacadeService,
  ) {
    super('skip', 'Skip the current song');
  }

  /**
   * Executes the skip command to skip the currently playing song
   * @param interaction The Discord interaction that triggered this command
   * @returns A Discord interaction response with the result
   */
  async execute(
    interaction: ChatInputCommandInteraction,
  ): Promise<InteractionResponse> {
    try {
      const voiceChannel = this.getVoiceChannel(interaction);

      if (!voiceChannel) {
        return await interaction.reply({
          embeds: [this.playerFacade.getVoiceChannelNotConnectedEmbed()],
        });
      }

      const member = interaction.member as GuildMember;
      const embed = this.playerFacade.skipSong(member, voiceChannel);

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

  /**
   * Gets the voice channel that the user is currently connected to
   * @param interaction The Discord interaction that triggered this command
   * @returns The voice channel or null if the user is not in a voice channel
   */
  private getVoiceChannel(
    interaction: ChatInputCommandInteraction,
  ): null | VoiceBasedChannel {
    const member = interaction.member as GuildMember;
    return member.voice.channel;
  }
}
