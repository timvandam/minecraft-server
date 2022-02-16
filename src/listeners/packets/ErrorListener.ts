import { EventHandler, UncaughtErrorEvent } from 'decorator-events';

export class ErrorListener {
  @EventHandler
  errorHandler(error: UncaughtErrorEvent) {
    console.error('something went wrong:', error.error);
  }
}
