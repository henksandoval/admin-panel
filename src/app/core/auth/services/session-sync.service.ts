import { Injectable, signal } from '@angular/core';

export interface SessionSyncEvent {
  readonly type: 'SESSION_CLEARED';
}

@Injectable({ providedIn: 'root' })
export class SessionSyncService {
  private readonly _syncEvent = signal<SessionSyncEvent | null>(null);
  readonly syncEvent = this._syncEvent.asReadonly();

  private channel: BroadcastChannel | null = null;
  private readonly isSupported = typeof BroadcastChannel !== 'undefined';

  constructor() {
    if (this.isSupported) {
      try {
        this.channel = new BroadcastChannel('session');
        this.channel.addEventListener('message', (event) => {
          this._syncEvent.set(event.data as SessionSyncEvent);
        });
      } catch {
        this.channel = null;
      }
    }
  }

  broadcast(_eventType: 'logout'): void {
    if (!this.channel) return;
    const event: SessionSyncEvent = { type: 'SESSION_CLEARED' };
    this.channel.postMessage(event);
  }
}
