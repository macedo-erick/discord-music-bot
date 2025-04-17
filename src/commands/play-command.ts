import { Command } from '@commands/command';
import { useMainPlayer } from 'discord-player';
import {
  ChatInputCommandInteraction,
  GuildMember,
  MessageFlags,
} from 'discord.js';
import { injectable } from 'tsyringe';

@injectable()
export class PlayCommand extends Command {
  constructor() {
    super('play', 'Give the song name or URL to start playing', (builder) =>
      builder.addStringOption((option) =>
        option
          .setName('query')
          .setDescription('Give the song name or URL to start playing')
          .setRequired(true),
      ),
    );
  }

  async execute(interaction: ChatInputCommandInteraction) {
    const interactionMember = interaction.member as GuildMember;
    const channel = interactionMember.voice.channel;

    if (!channel) {
      return interaction.reply('You are not connected to a voice channel!');
    }

    try {
      const query = interaction.options.getString('query', true);
      const player = useMainPlayer();

      await interaction.deferReply();

      const { track } = await player.play(channel, query, {
        nodeOptions: { metadata: interaction },
      });

      return await interaction.followUp(`**${track.cleanTitle}** enqueued!`);
    } catch (err) {
      console.error(err);

      return await interaction.reply({
        content: 'Something went wrong',
        flags: MessageFlags.Ephemeral,
      });
    }
  }
}
