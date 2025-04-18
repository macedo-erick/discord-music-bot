/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { PlayerService } from '@services/player-service';
import { Client } from '@utils/client';
import { VoiceBasedChannel } from 'discord.js';
import { singleton } from 'tsyringe';

@singleton()
export class PlayerBuilder {
  private client?: Client;

  get(channel: VoiceBasedChannel): PlayerService {
    const guildId = channel.guild.id;
    if (!this.client) throw new Error('PlayerBuilder not installed');

    if (!this.client.players.has(guildId)) {
      const player = new PlayerService(channel);
      this.client.players.set(guildId, player);
    }

    return this.client.players.get(guildId)!;
  }

  install(client: Client) {
    this.client = client;

    client.players = new Map();

    return this;
  }
}
