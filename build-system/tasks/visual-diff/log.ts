import {green, red, yellow} from 'kleur/colors';
import minimist from 'minimist';
import type puppeteer from 'puppeteer';

import {log as logBase} from '../../common/logging';

const argv = minimist(process.argv.slice(2));

type Mode = 'info' | 'warning' | 'error' | 'fatal' | 'verbose';

/**
 * Logs a message to the console.
 */
export function log(mode: Mode, ...messages: Array<any>): void {
  switch (mode) {
    case 'verbose':
      if (argv.verbose) {
        logBase(green('VERBOSE:'), ...messages);
      }
      break;
    case 'info':
      logBase(green('INFO:'), ...messages);
      break;
    case 'warning':
      logBase(yellow('WARNING:'), ...messages);
      break;
    case 'error':
      logBase(red('ERROR:'), ...messages);
      break;
    case 'fatal':
      process.exitCode = 1;
      logBase(red('FATAL:'), ...messages);
      throw new Error(messages.join(' '));
  }
}

/**
 * Pretty-prints the current test status of each page.
 */
export function drawBoxes(
  allPages: Array<puppeteer.Page>,
  availablePages: Array<puppeteer.Page>,
  thisPage: puppeteer.Page,
  thisPageText: string
): string {
  return (
    '[' +
    allPages
      .map((page) => {
        if (page === thisPage) {
          return thisPageText;
        } else if (availablePages.includes(page)) {
          return ' ';
        } else {
          return yellow('█');
        }
      })
      .join(' ') +
    ']'
  );
}
