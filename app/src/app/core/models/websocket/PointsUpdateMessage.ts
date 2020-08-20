import { Point } from '../Point';

export interface PointsUpdateMessage {
  points: Point[];
  message_type: string;
  sender?: string;
}
