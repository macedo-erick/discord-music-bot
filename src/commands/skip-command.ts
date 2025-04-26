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
export class SkipCommand extends Command {
  private static readonly EMBED_COLOR = 0x1ed760;

  constructor(
    @inject(PlayerBuilder) private readonly playerService: PlayerBuilder,
  ) {
    super('skip', 'Skip the current song');
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

      const player = this.playerService.get(voiceChannel);
      player.skip();

      return await interaction.reply({
        embeds: [this.buildSkipEmbed(interaction, player.nowPlaying)],
      });
    } catch (err) {
      console.error('Failed to execute skip command:', err);

      return interaction.reply({
        content: 'Something went wrong.',
        flags: MessageFlags.Ephemeral,
      });
    }
  }

  private buildSkipEmbed(
    interaction: ChatInputCommandInteraction,
    song: null | TrackData,
  ): EmbedBuilder {
    const member = interaction.member as GuildMember;
    const avatarURL =
      member.user.avatarURL({ size: 16 }) ?? process.env.DEFAULT_AVATAR;

    return new EmbedBuilder()
      .setColor(SkipCommand.EMBED_COLOR)
      .setAuthor({
        iconURL: avatarURL,
        name: song
          ? 'Nothing is Playing!'
          : 'Skipped the song to the next one in queue',
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
    return member.voice.channel;
  }
}
