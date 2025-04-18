import { Song } from './song';

export interface QueueItem {
  position: number;
  song: Song;
}
