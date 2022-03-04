import {Services} from '#service';

import {Pass as PassBase} from './pass-base';

export class Pass extends PassBase {
  /**
   * @override
   */
  getTimer_(win) {
    return Services.timerFor(win);
  }
}
