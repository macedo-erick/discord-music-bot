import ytdl from '@distube/ytdl-core';
import ytsr from '@distube/ytsr';
import { Song } from '@models/song';
import { injectable } from 'tsyringe';

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
      videoDetails: { lengthSeconds, thumbnails, title },
    } = await ytdl.getBasicInfo(url);

    const hours = Math.floor(parseInt(lengthSeconds) / 3600);
    const minutes = Math.floor((parseInt(lengthSeconds) % 3600) / 60);
    const seconds = parseInt(lengthSeconds) % 60;

    const duration = [
      hours > 0 ? hours.toString().padStart(2, '0') : null,
      minutes.toString().padStart(2, '0'),
      seconds.toString().padStart(2, '0'),
    ]
      .filter(Boolean)
      .join(':');

    return {
      data: ytdl(url, { filter: 'audioonly' }),
      duration,
      thumbnail: thumbnails[0].url,
      title,
      url,
    };
  }
}
