import 'reflect-metadata';
import { ClearChannel } from '@commands/clear-channel';
import { PauseCommand } from '@commands/pause-command';
import { PlayCommand } from '@commands/play-command';
import { ResumeCommand } from '@commands/resume-command';
import { Client } from '@utils/client';
import { CommandsBuilder } from '@utils/commands-builder';
import { PlayerBuilder } from '@utils/player-builder';
import { Events, GatewayIntentBits, REST, Routes } from 'discord.js';
import { container } from 'tsyringe';

import { clientId, token } from './configs/bot-config.json';

async function main() {
  const client = new Client({
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildVoiceStates],
  });

  const commands = new CommandsBuilder()
    .add(container.resolve(PlayCommand))
    .add(container.resolve(ClearChannel))
    .add(container.resolve(PauseCommand))
    .add(container.resolve(ResumeCommand))
    .install(client);

  container.resolve(PlayerBuilder).install(client);

  client.once(Events.ClientReady, (readyClient) => {
    console.log(`Logged in as ${readyClient.user.tag}`);
  });

  const rest = new REST({ version: '10' }).setToken(token);

  try {
    console.log('Registering commands on Discord');

    await rest.put(Routes.applicationCommands(clientId), {
      body: commands.toJSON(),
    });
  } catch (err) {
    console.error('Something fail on registering commands:', err);
  }

  await client.login(token);
}

main().catch((err: unknown) => {
  console.error(err);
  process.exit(1);
});
