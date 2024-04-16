export interface Logger {
  warn: (...args: any[]) => void;
  error: (...args: any[]) => void;
  assertString: (...args: any[]) => void;
}

export const user: () => Logger;
export const dev: () => Logger;

export type LogLevel_Enum = {
  OFF: 0;
  ERROR: 1;
  WARN: 2;
  INFO: 3;
  FINE: 4;
};
