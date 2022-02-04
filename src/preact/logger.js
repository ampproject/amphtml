/**
 * Use logger for intentionally logging messages in production code.
 */
export const logger = {
  info: console.info.bind(console),
  warn: console.warn.bind(console),
  error: console.error.bind(console),
};
