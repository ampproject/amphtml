/**
 * Use logger for intentionally logging messages in production code.
 *
 * (console should only be used for debugging, and should never be committed)
 *
 * Only exposes the 'info', 'warn', and 'error' logging methods.
 *
 * @type {{
 *   info: Console['info'],
 *   warn: Console['warn'],
 *   error: Console['error'],
 * }}
 */
export const logger = console;
