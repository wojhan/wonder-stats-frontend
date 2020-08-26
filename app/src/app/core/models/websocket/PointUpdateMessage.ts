import { Message } from '@wonder/core/models/websocket/Message';
import { PointType } from '@wonder/core/models/point-type';

export interface PointUpdateMessage extends Message {
  player: number;
  point_type: PointType;
  value: number;
}
