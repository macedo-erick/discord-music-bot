import { PlayerFacadeService } from '@services/player-facade-service';
import { Command } from '@utils/command';
import {
  ChatInputCommandInteraction,
  GuildMember,
  MessageFlags,
  VoiceBasedChannel,
} from 'discord.js';
import { inject, injectable } from 'tsyringe';

/**
 * Command to pause the currently playing song
 */
@injectable()
export class PauseCommand extends Command {
  /**
   * Creates a new instance of the PauseCommand
   * @param playerFacade The player facade service for managing music playback
   */
  constructor(
    @inject(PlayerFacadeService)
    private readonly playerFacade: PlayerFacadeService,
  ) {
    super('pause', 'Pause the current song');
  }

  /**
   * Executes the pause command to pause the currently playing song
   * @param interaction The Discord interaction that triggered this command
   * @returns A Discord interaction response with the result
   */
  async execute(interaction: ChatInputCommandInteraction) {
    try {
      const voiceChannel = this.getVoiceChannel(interaction);
      if (!voiceChannel) {
        return await interaction.reply({
          embeds: [this.playerFacade.getVoiceChannelNotConnectedEmbed()],
        });
      }

      const member = interaction.member as GuildMember;
      const embed = this.playerFacade.pauseSong(member, voiceChannel);

      return await interaction.reply({ embeds: [embed] });
    } catch (err) {
      console.error('Failed to execute pause command:', err);

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
    return member.voice.channel;
  }
}
