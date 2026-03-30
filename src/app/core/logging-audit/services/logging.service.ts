import { inject, Injectable } from '@angular/core';
import { LogLevel } from '../models/log-level.model';
import { LOG_LEVEL } from '../tokens/logging.tokens';

@Injectable({
  providedIn: 'root',
})
export class LoggingService {
  
  private readonly minLevel = inject(LOG_LEVEL);

  debug(message: string, ...optionalParams: unknown[]): void {
    this.writeToLog(LogLevel.debug, message, optionalParams);
  }

  info(message: string, ...optionalParams: unknown[]): void {
    this.writeToLog(LogLevel.info, message, optionalParams);
  }

  warn(message: string, ...optionalParams: unknown[]): void {
    this.writeToLog(LogLevel.warn, message, optionalParams);
  }

  error(message: string, ...optionalParams: unknown[]): void {
    this.writeToLog(LogLevel.error, message, optionalParams);
  }

  private writeToLog(level: LogLevel, message: string, params: unknown[]): void {
    if (level < this.minLevel) {
      return;
    }

    const logMessage = `[${LogLevel[level].toUpperCase()}] ${message}`;

    switch (level) {
      case LogLevel.debug:
        console.debug(logMessage, ...params);
        break;
      case LogLevel.info:
        console.info(logMessage, ...params);
        break;
      case LogLevel.warn:
        console.warn(logMessage, ...params);
        break;
      case LogLevel.error:
        console.error(logMessage, ...params);
        break;
      default:
        console.log(logMessage, ...params);
    }
  }
}
