import { Readable } from 'node:stream';

export interface Song {
  data: Readable;
  duration: string;
  thumbnail: string;
  title: string;
  url: string;
}
