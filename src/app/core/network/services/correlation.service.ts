import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class CorrelationService {
  private _id: string = crypto.randomUUID();

  get id(): string {
    return this._id;
  }

  rotate(): void {
    this._id = crypto.randomUUID();
  }
}
