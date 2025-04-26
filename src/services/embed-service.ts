import { TrackData } from '@models/track';
import {
  EmbedBuilder as DiscordEmbedBuilder,
  GuildMember,
  VoiceBasedChannel,
} from 'discord.js';
import { inject, injectable } from 'tsyringe';
import 'dotenv/config';

import { PlayerBuilder } from '../builders/player-builder';
import { PlayerState } from './player-service';

@injectable()
export class EmbedService {
  private static readonly DEFAULT_AVATAR_URL = process.env.DEFAULT_AVATAR || '';
  private static readonly DEFAULT_COLOR = 0x1ed760;
  private static readonly ERROR_COLOR = 0xff0000;

  constructor(
    @inject(PlayerBuilder) private readonly playerBuilder: PlayerBuilder,
  ) {}

  /**
   * Creates an error embed
   * @param title The error title
   * @param description The error description
   * @returns A Discord EmbedBuilder
   */
  createErrorEmbed(title: string, description: string): DiscordEmbedBuilder {
    return new DiscordEmbedBuilder()
      .setColor(EmbedService.ERROR_COLOR)
      .setAuthor({
        iconURL: EmbedService.DEFAULT_AVATAR_URL,
        name: title,
      })
      .setDescription(description);
  }

  /**
   * Creates a now playing embed
   * @param voiceChannel The voice channel to check for playing status
   * @returns A Discord EmbedBuilder
   */
  createNowPlayingEmbed(voiceChannel: VoiceBasedChannel): DiscordEmbedBuilder {
    try {
      const player = this.playerBuilder.get(voiceChannel);
      const song = player.nowPlaying;

      if (!song || player.state === PlayerState.IDLE) {
        return this.createNothingPlayingEmbed();
      }

      return new DiscordEmbedBuilder()
        .setColor(EmbedService.DEFAULT_COLOR)
        .setAuthor({
          iconURL: EmbedService.DEFAULT_AVATAR_URL,
          name: 'Now Playing',
        })
        .setDescription(`Now playing ${song.title} [${song.duration}]`);
    } catch (error) {
      console.error('Error creating now playing embed:', error);
      return this.createNothingPlayingEmbed();
    }
  }

  /**
   * Creates a pause embed
   * @param member The guild member who paused the song
   * @param voiceChannel The voice channel to check for playing status
   * @returns A Discord EmbedBuilder
   */
  createPauseEmbed(
    member: GuildMember,
    voiceChannel: VoiceBasedChannel,
  ): DiscordEmbedBuilder {
    try {
      const player = this.playerBuilder.get(voiceChannel);
      const song = player.nowPlaying;

      if (!song || player.state === PlayerState.IDLE) {
        return this.createNothingPlayingEmbed();
      }

      const avatarURL =
        member.user.avatarURL({ size: 16 }) ?? EmbedService.DEFAULT_AVATAR_URL;

      return new DiscordEmbedBuilder()
        .setColor(EmbedService.DEFAULT_COLOR)
        .setAuthor({
          iconURL: avatarURL,
          name: 'Paused',
        })
        .setDescription('The current song has been paused.');
    } catch (error) {
      console.error('Error creating pause embed:', error);
      return this.createNothingPlayingEmbed();
    }
  }

  /**
   * Creates a play embed
   * @param member The guild member who added the song
   * @param song The song that was added
   * @param queuePosition The position in the queue
   * @returns A Discord EmbedBuilder
   */
  createPlayEmbed(
    member: GuildMember,
    song: TrackData,
    queuePosition: number,
  ): DiscordEmbedBuilder {
    const avatarURL =
      member.user.avatarURL({ size: 16 }) ?? EmbedService.DEFAULT_AVATAR_URL;

    return new DiscordEmbedBuilder()
      .setColor(EmbedService.DEFAULT_COLOR)
      .setAuthor({
        iconURL: avatarURL,
        name: `Adding the song to queue #${queuePosition}`,
      })
      .setDescription(`${song.title} [${song.duration}]`);
  }

  /**
   * Creates a resume embed
   * @param member The guild member who resumed the song
   * @param voiceChannel The voice channel to check for playing status
   * @returns A Discord EmbedBuilder
   */
  createResumeEmbed(
    member: GuildMember,
    voiceChannel: VoiceBasedChannel,
  ): DiscordEmbedBuilder {
    try {
      const player = this.playerBuilder.get(voiceChannel);
      const song = player.nowPlaying;

      if (!song || player.state === PlayerState.IDLE) {
        return this.createNothingPlayingEmbed();
      }

      const avatarURL =
        member.user.avatarURL({ size: 16 }) ?? EmbedService.DEFAULT_AVATAR_URL;

      return new DiscordEmbedBuilder()
        .setColor(EmbedService.DEFAULT_COLOR)
        .setAuthor({
          iconURL: avatarURL,
          name: 'Resumed',
        })
        .setDescription('The current song has been resumed.');
    } catch (error) {
      console.error('Error creating resume embed:', error);
      return this.createNothingPlayingEmbed();
    }
  }

  /**
   * Creates a skip embed
   * @param member The guild member who skipped the song
   * @param voiceChannel The voice channel to check for playing status
   * @returns A Discord EmbedBuilder
   */
  createSkipEmbed(
    member: GuildMember,
    voiceChannel: VoiceBasedChannel,
  ): DiscordEmbedBuilder {
    try {
      const player = this.playerBuilder.get(voiceChannel);
      const song = player.nowPlaying;

      if (!song || player.state === PlayerState.IDLE) {
        return this.createNothingPlayingEmbed();
      }

      const avatarURL =
        member.user.avatarURL({ size: 16 }) ?? EmbedService.DEFAULT_AVATAR_URL;

      return new DiscordEmbedBuilder()
        .setColor(EmbedService.DEFAULT_COLOR)
        .setAuthor({
          iconURL: avatarURL,
          name: 'Skipped the song to the next one in queue',
        })
        .setDescription(`Now playing ${song.title} [${song.duration}]`);
    } catch (error) {
      console.error('Error creating skip embed:', error);
      return this.createNothingPlayingEmbed();
    }
  }

  /**
   * Creates a "nothing is playing" embed
   * @returns A Discord EmbedBuilder
   */
  private createNothingPlayingEmbed(): DiscordEmbedBuilder {
    return new DiscordEmbedBuilder()
      .setColor(EmbedService.DEFAULT_COLOR)
      .setAuthor({
        iconURL: EmbedService.DEFAULT_AVATAR_URL,
        name: 'Nothing is Playing!',
      })
      .setDescription(
        'Songs must be playing to use that command. The queue is currently empty! Add songs using: /play command.',
      );
  }
}
