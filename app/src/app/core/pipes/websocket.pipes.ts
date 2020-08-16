import { catchError, concatMap, delay, retryWhen, tap } from 'rxjs/operators';
import {
  EMPTY,
  iif,
  MonoTypeOperatorFunction,
  of,
  pipe,
  throwError,
} from 'rxjs';
import { SpinnerOverlayService } from '../services/spinner-overlay.service';

const reconnectSpinnerShown = () => {
  SpinnerOverlayService.instance.show('Trwa próba połączenia');
};

const reconnectSpinnerHidden = () => {
  SpinnerOverlayService.instance.hide();
};

export const retryPipe: MonoTypeOperatorFunction<unknown> = pipe(
  tap({
    next: reconnectSpinnerShown,
    error: reconnectSpinnerShown,
  }),
  retryWhen((errors) =>
    errors.pipe(
      concatMap((e, i) =>
        // Executes a conditional Observable depending on the result
        // of the first argument
        iif(
          () => i > 2,
          // If the condition is true we throw the error (the last error)
          throwError(e),
          // Otherwise we pipe this back into our stream and delay the retry
          of(e).pipe(delay(4000))
        )
      )
    )
  ),
  tap({
    next: reconnectSpinnerHidden,
    error: reconnectSpinnerHidden,
  })
);
