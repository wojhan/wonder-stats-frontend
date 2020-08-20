import { Message } from '@wonder/core/models/websocket/Message';

export interface PointUpdateMessage extends Message {
  player: number;
  point_type: number;
  value: number;
}
