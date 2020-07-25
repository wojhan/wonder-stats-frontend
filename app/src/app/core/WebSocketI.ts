import { WebSocketSubject } from 'rxjs/internal-compatibility';
import { Observable, Subscription } from 'rxjs';

export interface WebSocketI {
  webSocketSubject: WebSocketSubject<unknown>;
  webSocketListener: Observable<any>;
  webSocketSubscription: Subscription;

  onMessage(message): void;
  onError(error): void;
  onComplete(): void;
  close(): void;
}
