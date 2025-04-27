import { Readable } from 'node:stream';

export interface TrackData {
  data: Readable;
  duration: string;
  title: string;
  url: string;
}
