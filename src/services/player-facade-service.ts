import { PlayerBuilder } from '@builders/player-builder';
import { TrackData } from '@models/track';
import { PlayerState } from '@services/player-service';
import { YoutubeService } from '@services/youtube-service';
import { EmbedBuilder, GuildMember, VoiceBasedChannel } from 'discord.js';
import { inject, injectable } from 'tsyringe';

import { EmbedService } from './embed-service';

/**
 * Facade service that encapsulates player operations and embed creation
 * This service acts as an intermediary between commands and the player/embed services
 */
@injectable()
export class PlayerFacadeService {
  constructor(
    @inject(PlayerBuilder) private readonly playerBuilder: PlayerBuilder,
    @inject(EmbedService) private readonly embedService: EmbedService,
    @inject(YoutubeService) private readonly youtubeService: YoutubeService,
  ) {}

  /**
   * Checks if there's a song playing and if there's a next song in the queue
   * @param voiceChannel The voice channel where the player is active
   * @returns An object with the current song, next song, and player state
   */
  checkPlayerState(voiceChannel: VoiceBasedChannel): {
    currentSong: null | TrackData;
    nextSong: null | TrackData;
    state: PlayerState;
  } {
    const player = this.playerBuilder.get(voiceChannel);
    const currentSong = player.nowPlaying;
    const nextSong =
      player.currentQueue.length > 0 ? player.currentQueue[0] : null;

    return {
      currentSong,
      nextSong,
      state: player.state,
    };
  }

  /**
   * Clears the current song queue and skips the current song
   * @param member The guild member who cleared the queue
   * @param voiceChannel The voice channel where the player is active
   * @returns A Discord EmbedBuilder with the result
   */
  clearQueue(member: GuildMember, voiceChannel: VoiceBasedChannel) {
    try {
      const player = this.playerBuilder.get(voiceChannel);
      const song = player.nowPlaying;

      if (!song || player.state === PlayerState.IDLE) {
        return this.embedService.createNothingPlayingEmbed();
      }

      const avatarURL =
        member.user.avatarURL({ size: 16 }) ?? EmbedService.DEFAULT_AVATAR_URL;

      const queueLength = player.currentQueue.length;

      player.clearQueue();
      player.skip();

      return this.embedService.createClearQueueEmbed(avatarURL, queueLength);
    } catch (error) {
      console.error('Error clearing queue:', error);
      return this.embedService.createNothingPlayingEmbed();
    }
  }

  /**
   * Gets the current playing song embed
   * @param voiceChannel The voice channel where the player is active
   * @returns A Discord EmbedBuilder with the current song information
   */
  getNowPlayingEmbed(voiceChannel: VoiceBasedChannel): EmbedBuilder {
    try {
      const player = this.playerBuilder.get(voiceChannel);
      const song = player.nowPlaying;

      if (!song || player.state === PlayerState.IDLE) {
        return this.embedService.createNothingPlayingEmbed();
      }

      return this.embedService.createNowPlayingEmbed(song);
    } catch (error) {
      console.error('Error getting now playing embed:', error);
      return this.embedService.createNothingPlayingEmbed();
    }
  }

  /**
   * Gets an embed for when a user is not connected to a voice channel
   * @returns A Discord EmbedBuilder with an error message
   */
  getVoiceChannelNotConnectedEmbed(): EmbedBuilder {
    return this.embedService.createVoiceChannelNotConnectedEmbed();
  }

  /**
   * Pauses the current song and returns an embed with the result
   * @param member The guild member who paused the song
   * @param voiceChannel The voice channel where the player is active
   * @returns A Discord EmbedBuilder with the result
   */
  pauseSong(
    member: GuildMember,
    voiceChannel: VoiceBasedChannel,
  ): EmbedBuilder {
    try {
      const player = this.playerBuilder.get(voiceChannel);
      const song = player.nowPlaying;

      if (!song || player.state === PlayerState.IDLE) {
        return this.embedService.createNothingPlayingEmbed();
      }

      // Perform the pause operation
      player.pause();

      // Get the avatar URL
      const avatarURL =
        member.user.avatarURL({ size: 16 }) ?? EmbedService.DEFAULT_AVATAR_URL;

      // Create the embed after pausing
      return this.embedService.createPauseEmbed(avatarURL);
    } catch (error) {
      console.error('Error in pauseSong:', error);
      return this.embedService.createErrorEmbed(
        'Error',
        'Failed to pause the song. Please try again.',
      );
    }
  }

  /**
   * Plays a song and returns an embed with the result
   * @param member The guild member who added the song
   * @param voiceChannel The voice channel where the player is active
   * @param query The song query or URL to play
   * @returns A Discord EmbedBuilder with the result
   */
  async playSong(
    member: GuildMember,
    voiceChannel: VoiceBasedChannel,
    query: string,
  ): Promise<EmbedBuilder> {
    try {
      // Download the song using the YouTube service
      const song = await this.youtubeService.download(query);

      const player = this.playerBuilder.get(voiceChannel);

      // Add the song to the queue and get its position
      const queuePosition = player.play(song) + 1;

      // Get the avatar URL
      const avatarURL =
        member.user.avatarURL({ size: 16 }) ?? EmbedService.DEFAULT_AVATAR_URL;

      // Create the embed with the queue position
      return this.embedService.createPlayEmbed(avatarURL, song, queuePosition);
    } catch (error) {
      console.error('Error in playSong:', error);
      return this.embedService.createErrorEmbed(
        'Error',
        'Failed to play the song. Please try again.',
      );
    }
  }

  /**
   * Resumes the current song and returns an embed with the result
   * @param member The guild member who resumed the song
   * @param voiceChannel The voice channel where the player is active
   * @returns A Discord EmbedBuilder with the result
   */
  resumeSong(
    member: GuildMember,
    voiceChannel: VoiceBasedChannel,
  ): EmbedBuilder {
    try {
      const player = this.playerBuilder.get(voiceChannel);
      const song = player.nowPlaying;

      if (!song || player.state === PlayerState.IDLE) {
        return this.embedService.createNothingPlayingEmbed();
      }

      // Perform the unpause operation
      player.unpause();

      // Get the avatar URL
      const avatarURL =
        member.user.avatarURL({ size: 16 }) ?? EmbedService.DEFAULT_AVATAR_URL;

      // Create the embed after unpausing
      return this.embedService.createResumeEmbed(avatarURL);
    } catch (error) {
      console.error('Error in resumeSong:', error);
      return this.embedService.createErrorEmbed(
        'Error',
        'Failed to resume the song. Please try again.',
      );
    }
  }

  /**
   * Skips the current song and returns an embed with the result
   * @param member The guild member who skipped the song
   * @param voiceChannel The voice channel where the player is active
   * @returns A Discord EmbedBuilder with the result
   */
  skipSong(member: GuildMember, voiceChannel: VoiceBasedChannel): EmbedBuilder {
    try {
      const player = this.playerBuilder.get(voiceChannel);

      // Check player state before skipping
      const { currentSong, nextSong } = this.checkPlayerState(voiceChannel);

      // If there's no current song or the player is idle, return nothing playing embed
      if (!currentSong || player.state === PlayerState.IDLE) {
        return this.embedService.createNothingPlayingEmbed();
      }

      // Get the avatar URL
      const avatarURL =
        member.user.avatarURL({ size: 16 }) ?? EmbedService.DEFAULT_AVATAR_URL;

      // Create the embed with information about the next song
      const embed = this.embedService.createSkipEmbed(avatarURL, nextSong);

      // Perform the skip operation
      player.skip();

      return embed;
    } catch (error) {
      console.error('Error in skipSong:', error);
      return this.embedService.createErrorEmbed(
        'Error',
        'Failed to skip the song. Please try again.',
      );
    }
  }
}
