import { Readable } from 'node:stream';

export interface TrackData {
  data: Readable;
  duration: string;
  thumbnail: string;
  title: string;
  url: string;
}
