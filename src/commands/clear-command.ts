import { PlayerFacadeService } from '@services/player-facade-service';
import { Command } from '@utils/command';
import {
  ChatInputCommandInteraction,
  GuildMember,
  InteractionResponse,
  MessageFlags,
  VoiceBasedChannel,
} from 'discord.js';
import { inject, injectable } from 'tsyringe';

/**
 * Command to clear the current song queue
 */
@injectable()
export class ClearCommand extends Command {
  /**
   * Creates a new instance of the ClearCommand
   * @param playerFacade The player facade service for managing music playback
   */
  constructor(
    @inject(PlayerFacadeService)
    private readonly playerFacade: PlayerFacadeService,
  ) {
    super('clear', 'Clear the current queue');
  }

  /**
   * Executes the clear command to remove all songs from the queue
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
      const embed = this.playerFacade.clearQueue(member, voiceChannel);

      return await interaction.reply({ embeds: [embed] });
    } catch (error) {
      console.error('Error executing ClearCommand:', error);
      return await interaction.reply({
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
    if (!member.voice.channel) return null;
    return member.voice.channel;
  }
}
