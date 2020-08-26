import { User } from './User';

export interface ScoreBoard {
  player: User;
  points: { [p: string]: string | number };
  sum: number;
  shipyardBoard?: any;
}
