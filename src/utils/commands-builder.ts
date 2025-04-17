/* eslint-disable @typescript-eslint/no-misused-promises */
import { Command } from '@commands/command';
import { Client, Collection, Events } from 'discord.js';

type CommandCtor = new () => Command;

export class CommandsBuilder {
  #commands = new Collection<string, Command>();

  public add(command: Command | CommandCtor): this {
    const cmd = typeof command === 'function' ? new command() : command;

    const name = cmd.data.name;

    if (!name) {
      throw new Error('Command name must be defined');
    }

    if (this.#commands.has(name)) {
      throw new Error(`A command with given name [${name}] already exists`);
    }

    this.#commands.set(name, cmd);

    return this;
  }

  public install(client: Client): this {
    client.on(Events.InteractionCreate, async (interaction) => {
      if (!interaction.isChatInputCommand()) return;

      const command = this.#commands.get(interaction.commandName);

      if (!command) return;

      try {
        await command.execute(interaction);
      } catch (err) {
        console.error(
          `Could not execute command ${interaction.commandName}`,
          err,
        );

        if (!interaction.replied) {
          await interaction.reply({
            content: 'Could not execute this command.',
            ephemeral: true,
          });
        }
      }
    });

    return this;
  }

  public toJSON() {
    return this.#commands.map((command) => command.data.toJSON());
  }
}
