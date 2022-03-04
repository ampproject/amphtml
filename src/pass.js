import {Services} from '#service';

import {PassBase} from './pass-base';

/**
 * This class is the same as PassBase but injects the Timer Service
 */
export class Pass extends PassBase {
  constructor(win, handler, opt_defaultDelay) {
    super(win, handler, opt_defaultDelay, Services.timerFor(win));
  }
}
