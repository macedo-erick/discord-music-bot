import { Command } from '@commands/command';
import {
  createAudioPlayer,
  createAudioResource,
  joinVoiceChannel,
  NoSubscriberBehavior,
  StreamType,
  VoiceConnectionStatus,
} from '@discordjs/voice';
import {
  ChatInputCommandInteraction,
  GuildMember,
  MessageFlags,
} from 'discord.js';
import { inject, injectable } from 'tsyringe';

import { YoutubeService } from '../services/youtube';

@injectable()
export class PlayCommand extends Command {
  constructor(
    @inject(YoutubeService) private readonly youtubeService: YoutubeService,
  ) {
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
      const data = await this.youtubeService.download(query);

      const connection = joinVoiceChannel({
        adapterCreator: channel.guild.voiceAdapterCreator,
        channelId: channel.id,
        guildId: channel.guild.id,
      });

      await interaction.deferReply();

      connection.on(VoiceConnectionStatus.Ready, () => {
        const player = createAudioPlayer({
          behaviors: {
            noSubscriber: NoSubscriberBehavior.Pause,
          },
        });

        const audioResource = createAudioResource(data, {
          inputType: StreamType.Arbitrary,
        });

        player.play(audioResource);
        connection.subscribe(player);
      });

      return await interaction.followUp(`**enqueued !**`);
    } catch (err) {
      console.error(err);

      return await interaction.reply({
        content: 'Something went wrong',
        flags: MessageFlags.Ephemeral,
      });
    }
  }
}
