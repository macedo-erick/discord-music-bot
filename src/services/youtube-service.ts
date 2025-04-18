import ytdl from '@distube/ytdl-core';
import ytsr from '@distube/ytsr';
import { injectable } from 'tsyringe';

import { Song } from '../models/song';

@injectable()
export class YoutubeService {
  async download(query: string): Promise<Song> {
    return query.startsWith('http')
      ? this.downloadFromUrl(query)
      : this.downloadByQuery(query);
  }

  private async downloadByQuery(query: string): Promise<Song> {
    const { items } = await ytsr(query, { limit: 1 });

    if (!items.length) {
      throw new Error('No Results found');
    }

    const { url } = items[0];

    return this.downloadFromUrl(url);
  }

  private async downloadFromUrl(url: string): Promise<Song> {
    const {
      videoDetails: { thumbnails, title },
    } = await ytdl.getBasicInfo(url);

    return {
      data: ytdl(url, { filter: 'audioonly' }),
      thumbnail: thumbnails[0].url,
      title,
      url,
    };
  }
}
