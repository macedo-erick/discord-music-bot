import { TrackData } from '@models/track';
import { EmbedBuilder as DiscordEmbedBuilder } from 'discord.js';
import 'dotenv/config';
import { injectable } from 'tsyringe';

@injectable()
export class EmbedService {
  public static readonly DEFAULT_AVATAR_URL =
    'https://static.vecteezy.com/system/resources/thumbnails/036/280/651/small_2x/default-avatar-profile-icon-social-media-user-image-gray-avatar-icon-blank-profile-silhouette-illustration-vector.jpg';
  private static readonly DEFAULT_COLOR = 0x1ed760;
  private static readonly ERROR_COLOR = 0xff0000;

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
   * Creates a "nothing is playing" embed
   * @returns A Discord EmbedBuilder
   */
  createNothingPlayingEmbed(): DiscordEmbedBuilder {
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

  /**
   * Creates a now playing embed
   * @param song The song that is currently playing
   * @returns A Discord EmbedBuilder
   */
  createNowPlayingEmbed(song: TrackData): DiscordEmbedBuilder {
    return new DiscordEmbedBuilder()
      .setColor(EmbedService.DEFAULT_COLOR)
      .setAuthor({
        iconURL: EmbedService.DEFAULT_AVATAR_URL,
        name: 'Now Playing',
      })
      .setDescription(`Now playing ${song.title} [${song.duration}]`);
  }

  /**
   * Creates a pause embed
   * @param avatarURL The URL of the user's avatar
   * @returns A Discord EmbedBuilder
   */
  createPauseEmbed(avatarURL: string): DiscordEmbedBuilder {
    return new DiscordEmbedBuilder()
      .setColor(EmbedService.DEFAULT_COLOR)
      .setAuthor({
        iconURL: avatarURL,
        name: 'Paused',
      })
      .setDescription('The current song has been paused.');
  }

  /**
   * Creates a play embed
   * @param avatarURL The URL of the user's avatar
   * @param song The song that was added
   * @param queuePosition The position in the queue
   * @returns A Discord EmbedBuilder
   */
  createPlayEmbed(
    avatarURL: string,
    song: TrackData,
    queuePosition: number,
  ): DiscordEmbedBuilder {
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
   * @param avatarURL The URL of the user's avatar
   * @returns A Discord EmbedBuilder
   */
  createResumeEmbed(avatarURL: string): DiscordEmbedBuilder {
    return new DiscordEmbedBuilder()
      .setColor(EmbedService.DEFAULT_COLOR)
      .setAuthor({
        iconURL: avatarURL,
        name: 'Resumed',
      })
      .setDescription('The current song has been resumed.');
  }

  /**
   * Creates a skip embed
   * @param avatarURL The URL of the user's avatar
   * @param nextSong The next song in the queue (if any)
   * @returns A Discord EmbedBuilder
   */
  createSkipEmbed(
    avatarURL: string,
    nextSong: null | TrackData,
  ): DiscordEmbedBuilder {
    const embed = new DiscordEmbedBuilder()
      .setColor(EmbedService.DEFAULT_COLOR)
      .setAuthor({
        iconURL: avatarURL,
        name: 'Skipped the song',
      });

    if (nextSong) {
      embed.setDescription(
        `Now playing ${nextSong.title} [${nextSong.duration}]`,
      );
    } else {
      embed.setDescription(
        'The queue is now empty. Add more songs using: /play command.',
      );
    }

    return embed;
  }

  /**
   * Creates an embed for when a user is not connected to a voice channel
   * @returns A Discord EmbedBuilder
   */
  createVoiceChannelNotConnectedEmbed(): DiscordEmbedBuilder {
    return new DiscordEmbedBuilder()
      .setColor(EmbedService.ERROR_COLOR)
      .setDescription(
        'You must be connected to a voice channel on this server to use this command!',
      )
      .setAuthor({
        iconURL: EmbedService.DEFAULT_AVATAR_URL,
        name: 'Voice Channel Required',
      });
  }
}
