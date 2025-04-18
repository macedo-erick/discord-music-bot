import { PlayerService } from '@services/player-service';
import { Client as BaseClient } from 'discord.js';

export class Client extends BaseClient {
  players = new Map<string, PlayerService>();
}
