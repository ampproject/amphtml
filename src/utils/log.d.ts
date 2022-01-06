export interface Logger {
  warn: (...args: any[]) => void;
  error: (...args: any[]) => void;
  assertString: (...args: any[]) => void;
}

export const user: () => Logger;
export const dev: () => Logger;
