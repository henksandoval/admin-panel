import { InjectionToken } from "@angular/core";
import { LogLevel } from "./log-level.model";

export const LOG_LEVEL = new InjectionToken<LogLevel>(LogLevel[LogLevel.info]);