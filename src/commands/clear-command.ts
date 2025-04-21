import { Command } from '@utils/command';
import {
  Channel,
  ChatInputCommandInteraction,
  MessageFlags,
  PermissionFlagsBits,
  TextChannel,
} from 'discord.js';

export class ClearCommand extends Command {
  private static readonly DELETE_FAIL_MESSAGE = 'Could not delete messages.';
  private static readonly TEXT_CHANNEL_ONLY_MESSAGE =
    'This command works only in text channels';

  constructor() {
    super('clear', 'ClearCommand messages from text channel', (builder) =>
      builder
        .addStringOption((option) =>
          option
            .setName('amount')
            .setDescription('Amount of messages to be deleted')
            .setRequired(true),
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),
    );
  }

  private static readonly DELETE_SUCCESS_MESSAGE = (count: number): string =>
    `Deleted ${count} messages.`;

  async execute(interaction: ChatInputCommandInteraction) {
    const channel = interaction.channel as Channel;

    if (!this.isTextChannel(channel)) {
      return interaction.reply({
        content: ClearCommand.TEXT_CHANNEL_ONLY_MESSAGE,
        flags: MessageFlags.Ephemeral,
      });
    }

    try {
      const amount = Number(interaction.options.getString('amount', true));
      const deletedMessages = await channel.bulkDelete(amount, true);

      return await interaction.reply({
        content: ClearCommand.DELETE_SUCCESS_MESSAGE(deletedMessages.size),
        flags: MessageFlags.Ephemeral,
      });
    } catch (error) {
      console.error(error);

      return interaction.reply({
        content: ClearCommand.DELETE_FAIL_MESSAGE,
        flags: MessageFlags.Ephemeral,
      });
    }
  }

  private isTextChannel(channel: Channel): channel is TextChannel {
    return channel.isTextBased() && !channel.isVoiceBased();
  }
}
