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
import { injectable } from 'tsyringe';

import { Song } from '../models/song';

@injectable()
export class PlayerService {
  private connection: null | VoiceConnection = null;
  private player = createAudioPlayer({
    behaviors: {
      noSubscriber: NoSubscriberBehavior.Pause,
    },
  });

  constructor(channel: VoiceBasedChannel) {
    this.connection = joinVoiceChannel({
      adapterCreator: channel.guild.voiceAdapterCreator,
      channelId: channel.id,
      guildId: channel.guild.id,
    });

    this.connection.on(VoiceConnectionStatus.Ready, () => {
      this.connection?.subscribe(this.player);
    });

    this.connection.on('error', console.error);
  }

  disconnect() {
    this.connection?.destroy();
  }

  pause() {
    this.player.pause();
  }

  play(song: Song) {
    this.player.play(
      createAudioResource(song.data, {
        inputType: StreamType.Arbitrary,
      }),
    );
  }

  unpause() {
    this.player.unpause();
  }
}
