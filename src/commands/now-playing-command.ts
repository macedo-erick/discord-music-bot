import { TrackData } from '@models/track';
import { Command } from '@utils/command';
import { VoiceChannelNotConnectedEmbed } from '@utils/embed';
import {
  ChatInputCommandInteraction,
  EmbedBuilder,
  GuildMember,
  InteractionResponse,
  MessageFlags,
  VoiceBasedChannel,
} from 'discord.js';
import { inject, injectable } from 'tsyringe';

import { PlayerBuilder } from '../builders/player-builder';

@injectable()
export class NowPlayingCommand extends Command {
  private static readonly DEFAULT_AVATAR_URL = process.env.DEFAULT_AVATAR || '';
  private static readonly EMBED_COLOR = 0x1ed760;

  constructor(
    @inject(PlayerBuilder) private readonly playerService: PlayerBuilder,
  ) {
    super('now-playing', 'Show the current playing song');
  }

  async execute(
    interaction: ChatInputCommandInteraction,
  ): Promise<InteractionResponse> {
    try {
      const voiceChannel = this.getVoiceChannel(interaction);
      if (!voiceChannel) {
        return await interaction.reply({
          embeds: [new VoiceChannelNotConnectedEmbed()],
        });
      }

      const song = this.playerService.get(voiceChannel).nowPlaying;
      const embed = this.createNowPlayingEmbed(song);

      return await interaction.reply({ embeds: [embed] });
    } catch (error) {
      console.error('Error executing NowPlayingCommand:', error);
      return interaction.reply({
        content: 'Something went wrong.',
        flags: MessageFlags.Ephemeral,
      });
    }
  }

  private createNowPlayingEmbed(song: null | TrackData): EmbedBuilder {
    return new EmbedBuilder()
      .setColor(NowPlayingCommand.EMBED_COLOR)
      .setAuthor({
        iconURL: NowPlayingCommand.DEFAULT_AVATAR_URL,
        name: song ? `Now Playing` : 'Nothing is Playing!',
      })
      .setDescription(
        song
          ? `Now playing ${song.title} [${song.duration}]`
          : 'Songs must be playing to use that command. The queue is currently empty! Add songs using: /play command.',
      );
  }

  private getVoiceChannel(
    interaction: ChatInputCommandInteraction,
  ): null | VoiceBasedChannel {
    const member = interaction.member as GuildMember;
    if (!member.voice.channel) return null;
    return member.voice.channel;
  }
}
