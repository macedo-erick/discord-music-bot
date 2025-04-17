import { Command } from '@commands/command';
import {
  ActionRowBuilder,
  ChatInputCommandInteraction,
  ComponentType,
  StringSelectMenuBuilder,
  StringSelectMenuOptionBuilder,
} from 'discord.js';
import { inject, injectable } from 'tsyringe';

import { YoutubeService } from '../services/youtube';

@injectable()
export class PlayCommand extends Command {
  constructor(@inject(YoutubeService) private youtubeService: YoutubeService) {
    super('play', 'Give the song name or URL to start playing', (builder) =>
      builder.addStringOption((option) =>
        option
          .setName('query')
          .setDescription('Give the song name or URL to start playing')
          .setRequired(true),
      ),
    );
  }

  async execute(interaction: ChatInputCommandInteraction): Promise<void> {
    const query = interaction.options.getString('query', true);

    const select = new StringSelectMenuBuilder()
      .setCustomId('type')
      .setPlaceholder('Choose media type')
      .addOptions(
        new StringSelectMenuOptionBuilder().setLabel('Video').setValue('video'),
        new StringSelectMenuOptionBuilder().setLabel('Audio').setValue('audio'),
      );

    const actionRow =
      new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(select);

    await interaction.reply({
      components: [actionRow],
      withResponse: true,
    });

    const message = await interaction.fetchReply();

    try {
      const confirmation = await message.awaitMessageComponent({
        componentType: ComponentType.StringSelect,
        filter: (i) => i.user.id === interaction.user.id,
        time: 10_000,
      });

      const [type] = confirmation.values;

      this.youtubeService.download(query);

      await confirmation.update({
        components: [],
        content: `Playing ${type} for ${query}`,
      });
    } catch (err) {
      console.error(err);

      await interaction.editReply({
        components: [],
        content: 'Confirmation not received within 10 seconds, cancelling',
      });
    }
  }
}
