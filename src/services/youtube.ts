import ytdl from '@distube/ytdl-core';
import ytsr from '@distube/ytsr';
import { Readable } from 'node:stream';
import { injectable } from 'tsyringe';

@injectable()
export class YoutubeService {
  async download(query: string): Promise<Readable> {
    return query.startsWith('http')
      ? this.downloadFromUrl(query)
      : this.downloadByQuery(query);
  }

  private async downloadByQuery(query: string): Promise<Readable> {
    const { items } = await ytsr(query, { limit: 1 });

    if (!items.length) {
      throw new Error('No Results found');
    }

    const { url } = items[0];

    return this.downloadFromUrl(url);
  }

  private downloadFromUrl(url: string): Readable {
    return ytdl(url, { filter: 'audioonly' });
  }
}
