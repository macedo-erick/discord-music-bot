import 'reflect-metadata';
import { CommandsBuilder } from '@builders/commands-builder';
import { PlayerBuilder } from '@builders/player-builder';
import { ClearCommand } from '@commands/clear-command';
import { NowPlayingCommand } from '@commands/now-playing-command';
import { PauseCommand } from '@commands/pause-command';
import { PlayCommand } from '@commands/play-command';
import { ResumeCommand } from '@commands/resume-command';
import { SkipCommand } from '@commands/skip-command';
import { Client } from '@utils/client';
import 'dotenv/config';
import { Events, GatewayIntentBits, REST, Routes } from 'discord.js';
import { container } from 'tsyringe';

const TOKEN = String(process.env.APP_TOKEN);
const CLIENT_ID = String(process.env.CLIENT_ID);
const GUILD_ID = String(process.env.GUILD_ID);
const IS_PROD = process.env.NODE_ENV === 'production';
const CLIENT_INTENTS = [
  GatewayIntentBits.Guilds,
  GatewayIntentBits.GuildVoiceStates,
];
const REST_API_VERSION = '10';

function createRestClient(): REST {
  return new REST({ version: REST_API_VERSION }).setToken(TOKEN);
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
  const clearChannelCommand = container.resolve(ClearCommand);
  const pauseCommand = container.resolve(PauseCommand);
  const resumeCommand = container.resolve(ResumeCommand);
  const skipCommand = container.resolve(SkipCommand);
  const nowPlayingCommand = container.resolve(NowPlayingCommand);

  commandsBuilder
    .add(playCommand)
    .add(clearChannelCommand)
    .add(pauseCommand)
    .add(resumeCommand)
    .add(skipCommand)
    .add(nowPlayingCommand)
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

  await client.login(TOKEN);
}

async function registerCommands(rest: REST, commands: CommandsBuilder) {
  const route = IS_PROD
    ? Routes.applicationCommands(CLIENT_ID)
    : Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID);

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
