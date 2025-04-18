import { Readable } from 'node:stream';

export interface Song {
  data: Readable;
  thumbnail: string;
  title: string;
  url: string;
}
