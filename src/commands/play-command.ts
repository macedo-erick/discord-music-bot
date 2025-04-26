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
 * Command to play a song from a query or URL
 */
@injectable()
export class PlayCommand extends Command {
  /**
   * Creates a new instance of the PlayCommand
   * @param playerFacade The player facade service for managing music playback
   */
  constructor(
    @inject(PlayerFacadeService)
    private readonly playerFacade: PlayerFacadeService,
  ) {
    super('play', 'Give the song name or URL to start playing', (builder) =>
      builder.addStringOption((option) =>
        option
          .setName('query')
          .setDescription('Give the song name or URL to start playing')
          .setRequired(true),
      ),
    );
  }

  /**
   * Executes the play command to add a song to the queue and start playback
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

      const query = interaction.options.getString('query', true);
      const member = interaction.member as GuildMember;
      const embed = await this.playerFacade.playSong(
        member,
        voiceChannel,
        query,
      );

      return await interaction.reply({ embeds: [embed] });
    } catch (err) {
      console.error('Failed to execute play command:', err);

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
