import ytdl from '@distube/ytdl-core';
import ytsr from '@distube/ytsr';
import { TrackData } from '@models/track';
import 'dotenv/config';
import { injectable } from 'tsyringe';

@injectable()
export class YoutubeService {
  async download(query: string): Promise<TrackData> {
    return query.startsWith('http')
      ? this.downloadFromUrl(query)
      : this.downloadByQuery(query);
  }

  private async downloadByQuery(query: string): Promise<TrackData> {
    const { items } = await ytsr(query, { limit: 1 });

    if (!items.length) {
      throw new Error('No Results found');
    }

    const { duration: durationSc, name: title, url } = items[0];

    const duration = durationSc
      .split(':')
      .map((d) => d.padStart(2, '0'))
      .join(':');

    return {
      data: ytdl(url, { filter: 'audioonly' }),
      duration,
      title,
      url,
    };
  }

  private async downloadFromUrl(url: string): Promise<TrackData> {
    const parsed = new URL(url);
    const videoId = parsed.searchParams.get('v');

    if (!videoId) {
      throw new Error('Invalid URL');
    }

    return this.downloadByQuery(videoId);
  }
}
