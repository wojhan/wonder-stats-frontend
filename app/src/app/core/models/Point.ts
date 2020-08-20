import { PointUpdate } from '@wonder/core/models/PointUpdate';

export interface Point extends PointUpdate {
  game: number;
  player: number;
}
