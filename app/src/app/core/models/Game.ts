import {User} from './User';

export interface Game {
  id: number;
  created_at: Date;
  finished_at: Date;
  players: User[];
}
