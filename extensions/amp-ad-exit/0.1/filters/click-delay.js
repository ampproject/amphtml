import {dev, userAssert} from '#utils/log';

import {Filter, FilterType} from './filter';

/** @type {string} */
const TAG = 'amp-ad-exit';

export class ClickDelayFilter extends Filter {
  /**
   * @param {string} name The user-defined name of the filter.
   * @param {!../config.ClickDelayConfig} spec
   * @param {!Window} win
   */
  constructor(name, spec, win) {
    super(name, spec.type);
    userAssert(
      spec.type == FilterType.CLICK_DELAY &&
        typeof spec.delay == 'number' &&
        spec.delay > 0,
      'Invalid ClickDelay spec'
    );

    /**
     * @const {!../config.ClickDelayConfig}
     * @visibleForTesting
     */
    this.spec = spec;

    /**
     * @type {number}
     * @visibleForTesting
     */
    this.intervalStart = Date.now();

    if (spec.startTimingEvent) {
      if (!win['performance'] || !win['performance']['timing']) {
        dev().warn(
          TAG,
          'Browser does not support performance timing, ' +
            'falling back to now'
        );
      } else if (
        win['performance']['timing'][spec.startTimingEvent] == undefined
      ) {
        dev().warn(
          TAG,
          `Invalid performance timing event type ${spec.startTimingEvent}` +
            ', falling back to now'
        );
      } else {
        this.intervalStart =
          win['performance']['timing'][spec.startTimingEvent];
      }
    }
  }

  /** @override */
  filter() {
    return Date.now() - this.intervalStart >= this.spec.delay;
  }
}

/**
 * @param {number} delay
 * @param {string=} startTimingEvent
 * @return {!../config.ClickDelayConfig}
 */
export function makeClickDelaySpec(delay, startTimingEvent = undefined) {
  return {type: FilterType.CLICK_DELAY, delay, startTimingEvent};
}
