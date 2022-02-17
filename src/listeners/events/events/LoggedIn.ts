import { Event } from 'decorator-events';
import { Chat } from '../../../data-types/Chat';

export class LoggedIn extends Event {
  /**
   * Whether the login attempt should be denied
   */
  public denied = false;
  public denyReason?: string | Chat;

  constructor(
    public readonly username: string,
    public readonly uuid: Buffer,
    public readonly entityId: number, // TODO: Add more details
  ) {
    super();
  }

  deny(reason?: string | Chat) {
    this.denied = true;
    if (reason !== undefined) this.denyReason = reason;
  }

  allow() {
    this.denied = false;
  }
}
