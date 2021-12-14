export interface Logger {
  warn: (...args: any[]) => void;
  error: (...args: any[]) => void;
  assertString: (...args: any[]) => void;
}

declare module '#utils/log' {
  user: () => Logger;
  dev: () => Logger;
}
