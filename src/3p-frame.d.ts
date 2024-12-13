/**
 * Returns a randomized sentinel value for 3p iframes.
 * The format is "%d-%d" with the first value being the depth of current
 * window in the window hierarchy and the second a random integer.
 */
export const generateSentinel: (win: Window) => string;

/** Returns the base URL for 3p bootstrap iframes. */
export const getDefaultBootstrapBaseUrl: (
  parentWin: Window,
  ampdoc?: any,
  strictForUnitTest?: boolean
) => string;

/** Get the bootstrap script URL for iframe. */
export const getBootstrapUrl: (type: string) => string;
