import { FinishGameMessage } from './FinishGameMessage';
import { GameInfoMessage } from './GameInfoMessage';
import { PointUpdateMessage } from './PointUpdateMessage';

export interface GameMessageReceiver {
  onPointUpdate(message: PointUpdateMessage): void;
  onGameInfoMessage(message: GameInfoMessage): void;
  onFinishGameMessage(message: FinishGameMessage): void;
}
