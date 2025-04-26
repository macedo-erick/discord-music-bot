import {
  AudioPlayerStatus,
  createAudioPlayer,
  createAudioResource,
  joinVoiceChannel,
  NoSubscriberBehavior,
  StreamType,
  VoiceConnection,
  VoiceConnectionStatus,
} from '@discordjs/voice';
import { TrackData } from '@models/track';
import { VoiceBasedChannel } from 'discord.js';
import { injectable } from 'tsyringe';

/**
 * Enum representing the possible states of the player
 */
export enum PlayerState {
  DISCONNECTED = 'DISCONNECTED',
  ERROR = 'ERROR',
  IDLE = 'IDLE',
  PAUSED = 'PAUSED',
  PLAYING = 'PLAYING',
}

@injectable()
export class PlayerService {
  /**
   * Get a copy of the current queue
   */
  get currentQueue(): TrackData[] {
    return [...this.queue];
  }

  /**
   * Get the current track being played
   */
  get nowPlaying(): null | TrackData {
    return this.currentTrack;
  }

  /**
   * Get the current state of the player
   */
  get state(): PlayerState {
    return this._state;
  }

  private _state: PlayerState = PlayerState.IDLE;

  private channel: VoiceBasedChannel;

  private connection: null | VoiceConnection = null;

  private currentTrack: null | TrackData = null;

  private player = createAudioPlayer({
    behaviors: {
      noSubscriber: NoSubscriberBehavior.Pause,
    },
  });

  private queue: TrackData[] = [];

  constructor(channel: VoiceBasedChannel) {
    this.channel = channel;
    this.initializeEventListeners();
  }

  /**
   * Clear the queue
   */
  clearQueue(): void {
    this.queue = [];
  }

  /**
   * Disconnect from the voice channel
   */
  disconnect(): void {
    try {
      if (this.state === PlayerState.DISCONNECTED) {
        return;
      }

      this.connection?.destroy();
      this.setState(PlayerState.DISCONNECTED);
    } catch (error) {
      this.handleError('Failed to disconnect', error);
    }
  }

  /**
   * Pause the current track
   */
  pause(): void {
    try {
      // If not connected or not playing, do nothing
      if (!this.connection || this.state !== PlayerState.PLAYING) {
        return;
      }

      this.player.pause();
      // State will be updated by the player event listener
    } catch (error) {
      this.handleError('Failed to pause', error);
    }
  }

  /**
   * Add a track to the queue and start playing if idle
   * @returns The position of the track in the queue
   */
  play(song: TrackData): number {
    try {
      if (
        this.state === PlayerState.DISCONNECTED ||
        this.state === PlayerState.ERROR
      ) {
        throw new Error(`Cannot play in state: ${this.state}`);
      }

      // Initialize connection if not already connected
      if (!this.connection) {
        this.initializeConnection(this.channel);
      }

      const isIdle = this.player.state.status === AudioPlayerStatus.Idle;

      if (isIdle) {
        this.playResource(song);
        return 0;
      }

      return this.queue.push(song);
    } catch (error) {
      this.handleError('Failed to play track', error);
      return -1;
    }
  }

  /**
   * Skip the current track and play the next one in queue
   */
  skip(): void {
    try {
      // If not connected or no current track, do nothing
      if (
        !this.connection ||
        (this.state !== PlayerState.PLAYING &&
          this.state !== PlayerState.PAUSED)
      ) {
        return;
      }

      const next = this.queue.shift();

      if (next) {
        this.playResource(next);
      } else {
        this.player.stop();
        this.setState(PlayerState.IDLE);
      }
    } catch (error) {
      this.handleError('Failed to skip track', error);
    }
  }

  /**
   * Resume playback after pausing
   */
  unpause(): void {
    try {
      // If not connected or not paused, do nothing
      if (!this.connection || this.state !== PlayerState.PAUSED) {
        return;
      }

      this.player.unpause();
      // State will be updated by the player event listener
    } catch (error) {
      this.handleError('Failed to unpause', error);
    }
  }

  /**
   * Handle errors by setting the error state
   */
  private handleError(message: string, error: unknown): void {
    console.error(`${message}:`, error);
    this.setState(PlayerState.ERROR);
  }

  /**
   * Initialize the voice connection
   */
  private initializeConnection(channel: VoiceBasedChannel): void {
    try {
      this.connection = joinVoiceChannel({
        adapterCreator: channel.guild.voiceAdapterCreator,
        channelId: channel.id,
        guildId: channel.guild.id,
      });

      // Set up connection event listeners
      this.connection.on(VoiceConnectionStatus.Ready, () => {
        this.connection?.subscribe(this.player);
      });

      this.connection.on(VoiceConnectionStatus.Disconnected, () => {
        this.setState(PlayerState.DISCONNECTED);
      });

      this.connection.on('error', (error) => {
        this.handleError('Connection error', error);
      });

      this.setState(PlayerState.IDLE);
    } catch (error) {
      this.handleError('Failed to initialize connection', error);
    }
  }

  /**
   * Initialize event listeners for the player and connection
   */
  private initializeEventListeners(): void {
    // Player events
    this.player.on(AudioPlayerStatus.Idle, () => {
      this.currentTrack = null;

      const next = this.queue.shift();

      if (next) {
        this.playResource(next);
      } else {
        this.setState(PlayerState.IDLE);
      }
    });

    this.player.on(AudioPlayerStatus.Playing, () => {
      this.setState(PlayerState.PLAYING);
    });

    this.player.on(AudioPlayerStatus.Paused, () => {
      this.setState(PlayerState.PAUSED);
    });

    this.player.on('error', (error) => {
      this.handleError('Player error', error);
    });
  }

  /**
   * Play a resource
   */
  private playResource(song: TrackData): void {
    try {
      const resource = createAudioResource(song.data, {
        inputType: StreamType.Arbitrary,
      });

      this.currentTrack = song;
      this.player.play(resource);
    } catch (error) {
      this.handleError('Failed to play resource', error);
    }
  }

  /**
   * Set the player state
   */
  private setState(newState: PlayerState): void {
    this._state = newState;
  }
}
