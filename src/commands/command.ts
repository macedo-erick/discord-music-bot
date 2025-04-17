import {
  ChatInputCommandInteraction,
  InteractionResponse,
  Message,
  SlashCommandBuilder,
} from 'discord.js';

export abstract class Command {
  public readonly data: SlashCommandBuilder;

  protected constructor(
    name: string,
    description: string,
    configure?: (builder: SlashCommandBuilder) => void,
  ) {
    this.data = new SlashCommandBuilder()
      .setName(name)
      .setDescription(description);

    if (configure) configure(this.data);
  }

  abstract execute(
    interaction: ChatInputCommandInteraction,
  ): Promise<InteractionResponse | Message>;
}
