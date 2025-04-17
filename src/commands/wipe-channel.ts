import { Command } from '@commands/command';
import {
  Channel,
  ChatInputCommandInteraction,
  MessageFlags,
  PermissionFlagsBits,
  TextChannel,
} from 'discord.js';

export class WipeChannelCommand extends Command {
  constructor() {
    super('wipe-channel', 'Clear messages from text channel', (builder) =>
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

  async execute(interaction: ChatInputCommandInteraction) {
    const channel = interaction.channel as Channel;
    const amount = interaction.options.getString('amount', true);

    if (channel.isVoiceBased()) {
      return interaction.reply({
        content: 'This command works only in text channels',
        flags: MessageFlags.Ephemeral,
      });
    }

    try {
      const deleted = await (channel as TextChannel).bulkDelete(
        Number(amount),
        true,
      );

      return await interaction.reply({
        content: `Deleted ${deleted.size} messages.`,
        flags: MessageFlags.Ephemeral,
      });
    } catch (err) {
      console.log(err);

      return interaction.reply({
        content: `Could not delete messages.`,
        flags: MessageFlags.Ephemeral,
      });
    }
  }
}
