import 'reflect-metadata';
import { PauseCommand } from '@commands/pause';
import { PlayCommand } from '@commands/play-command';
import { WipeChannelCommand } from '@commands/wipe-channel';
import { CommandsBuilder } from '@utils/commands-builder';
import { Client, Events, GatewayIntentBits, REST, Routes } from 'discord.js';
import { container } from 'tsyringe';

import { clientId, guildId, token } from './configs/bot-config.json';

async function main() {
  const playCommand = container.resolve(PlayCommand);
  const pauseCommand = container.resolve(PauseCommand);
  const wipeChannelCommand = container.resolve(WipeChannelCommand);

  const client = new Client({ intents: [GatewayIntentBits.Guilds] });

  const commands = new CommandsBuilder()
    .add(playCommand)
    .add(pauseCommand)
    .add(wipeChannelCommand)
    .install(client);

  client.once(Events.ClientReady, (readyClient) => {
    console.log(`Ready! Logged in as ${readyClient.user.tag}`);
  });

  const rest = new REST({ version: '10' }).setToken(token);

  try {
    console.log('Registering commands on Discord');

    await rest.put(Routes.applicationGuildCommands(clientId, guildId), {
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
