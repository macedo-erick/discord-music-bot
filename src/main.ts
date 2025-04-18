import 'reflect-metadata';
import { ClearChannelCommand } from '@commands/clear-channel-command';
import { PauseCommand } from '@commands/pause-command';
import { PlayCommand } from '@commands/play-command';
import { ResumeCommand } from '@commands/resume-command';
import { clientId, guildId, token } from '@configs/bot-config.json';
import { Client } from '@utils/client';
import { CommandsBuilder } from '@utils/commands-builder';
import { PlayerBuilder } from '@utils/player-builder';
import { Events, GatewayIntentBits, REST, Routes } from 'discord.js';
import { container } from 'tsyringe';
import 'dotenv/config';

const IS_PROD = process.env.NODE_ENV === 'production';
const CLIENT_INTENTS = [
  GatewayIntentBits.Guilds,
  GatewayIntentBits.GuildVoiceStates,
];
const REST_API_VERSION = '10';

function createRestClient(): REST {
  return new REST({ version: REST_API_VERSION }).setToken(token);
}

function initializeClientEvents(client: Client) {
  client.once(Events.ClientReady, (readyClient) => {
    console.log(`✅ Logged in as ${readyClient.user.tag}`);
  });
}

async function main() {
  const client = new Client({ intents: CLIENT_INTENTS });
  const commandsBuilder = new CommandsBuilder();

  const playCommand = container.resolve(PlayCommand);
  const clearChannelCommand = container.resolve(ClearChannelCommand);
  const pauseCommand = container.resolve(PauseCommand);
  const resumeCommand = container.resolve(ResumeCommand);

  commandsBuilder
    .add(playCommand)
    .add(clearChannelCommand)
    .add(pauseCommand)
    .add(resumeCommand)
    .install(client);

  container.resolve(PlayerBuilder).install(client);

  initializeClientEvents(client);

  const rest = createRestClient();

  try {
    await registerCommands(rest, commandsBuilder);
  } catch (error) {
    console.error(
      'An unexpected error occurred while registering commands.',
      error,
    );
  }

  await client.login(token);
}

async function registerCommands(rest: REST, commands: CommandsBuilder) {
  const route = IS_PROD
    ? Routes.applicationCommands(clientId)
    : Routes.applicationGuildCommands(clientId, guildId);

  const scope = IS_PROD ? 'global' : 'guild';

  try {
    await rest.put(route, { body: commands.toJSON() });
    console.log(`✅ Successfully registered ${scope} commands`);
  } catch (error) {
    console.error(`❌ Failed to register ${scope} commands:`, error);
    throw error;
  }
}

main().catch((error: unknown) => {
  console.error('❌ An error occurred during execution:', error);
});
