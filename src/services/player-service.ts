import {
  createAudioPlayer,
  createAudioResource,
  joinVoiceChannel,
  NoSubscriberBehavior,
  StreamType,
  VoiceConnection,
  VoiceConnectionStatus,
} from '@discordjs/voice';
import { VoiceBasedChannel } from 'discord.js';
import { Readable } from 'node:stream';
import { singleton } from 'tsyringe';

// TODO: Improve singleton to manage multiple guilds

@singleton()
export class PlayerService {
  private connection: null | VoiceConnection = null;

  private player = createAudioPlayer({
    behaviors: {
      noSubscriber: NoSubscriberBehavior.Pause,
    },
  });

  connect(channel: VoiceBasedChannel): this {
    this.connection = joinVoiceChannel({
      adapterCreator: channel.guild.voiceAdapterCreator,
      channelId: channel.id,
      guildId: channel.guild.id,
    });

    this.connection.on(VoiceConnectionStatus.Ready, () => {
      this.connection?.subscribe(this.player);
    });

    this.connection.on('error', console.error);

    return this;
  }

  disconnect() {
    this.connection?.destroy();
    this.connection = null;
  }

  pause() {
    if (!this.connection) {
      throw new Error('Not connected');
    }

    this.player.pause();
  }

  play(stream: Readable) {
    this.player.play(
      createAudioResource(stream, {
        inputType: StreamType.Arbitrary,
      }),
    );
  }

  unpause() {
    if (!this.connection) {
      throw new Error('Not connected');
    }

    this.player.unpause();
  }
}
