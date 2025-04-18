import { EmbedBuilder } from 'discord.js';

export class VoiceChannelNotConnectedEmbed extends EmbedBuilder {
  private static readonly DESCRIPTION =
    'You must be connected to a voice channel on this server to use this command!';
  private static readonly ERROR_COLOR = 0xff0000;
  private static readonly ICON_URL =
    'https://raw.githubusercontent.com/macedo-erick/discord-bot/refs/heads/master/src/assets/avatar.png';
  private static readonly TITLE = 'Voice Channel Required';

  constructor() {
    super();
    this.setColor(VoiceChannelNotConnectedEmbed.ERROR_COLOR)
      .setDescription(VoiceChannelNotConnectedEmbed.DESCRIPTION)
      .setAuthor({
        iconURL: VoiceChannelNotConnectedEmbed.ICON_URL,
        name: VoiceChannelNotConnectedEmbed.TITLE,
      });
  }
}
