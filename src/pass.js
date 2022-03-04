import {Services} from '#service';

import {Pass as PassBase} from './pass-base';

export class Pass extends PassBase {
  constructor(win, handler, opt_defaultDelay) {
    super(win, handler, opt_defaultDelay, Services.timerFor(win));
  }
}
