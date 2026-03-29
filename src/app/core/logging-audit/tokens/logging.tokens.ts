import { InjectionToken } from "@angular/core";
import { LogLevel } from '../models/log-level.model';

export const LOG_LEVEL = new InjectionToken<LogLevel>(LogLevel[LogLevel.info]);