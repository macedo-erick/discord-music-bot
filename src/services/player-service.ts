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
import { Song } from '@models/song';
import { VoiceBasedChannel } from 'discord.js';
import { injectable } from 'tsyringe';

@injectable()
export class PlayerService {
  private connection: null | VoiceConnection = null;
  private player = createAudioPlayer({
    behaviors: {
      noSubscriber: NoSubscriberBehavior.Pause,
    },
  });

  private queue: Song[] = [];

  constructor(channel: VoiceBasedChannel) {
    this.connection = joinVoiceChannel({
      adapterCreator: channel.guild.voiceAdapterCreator,
      channelId: channel.id,
      guildId: channel.guild.id,
    });

    this.connection.on(VoiceConnectionStatus.Ready, () => {
      this.connection?.subscribe(this.player);
    });

    this.player.on(AudioPlayerStatus.Idle, () => {
      const next = this.queue.shift();

      if (next) {
        this._playResource(next);
      }
    });

    this.connection.on('error', console.error);
  }

  disconnect() {
    this.connection?.destroy();
  }

  pause() {
    this.player.pause();
  }

  play(song: Song): number {
    const isIdle = this.player.state.status === AudioPlayerStatus.Idle;

    if (isIdle) {
      this._playResource(song);
      return 1;
    }

    this.queue.push(song);

    return this.queue.length + 1;
  }

  unpause() {
    this.player.unpause();
  }

  private _playResource(song: Song) {
    const resource = createAudioResource(song.data, {
      inputType: StreamType.Arbitrary,
    });
    this.player.play(resource);
  }

  // TODO: Add method to skip the player
  // TODO: Add method to display now playing
}
