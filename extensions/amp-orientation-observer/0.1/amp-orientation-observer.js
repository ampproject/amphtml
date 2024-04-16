import {ActionTrust_Enum} from '#core/constants/action-constants';
import {clamp, sum} from '#core/math';

import {Services} from '#service';

import {createCustomEvent} from '#utils/event-helper';
import {userAssert} from '#utils/log';

const TAG = 'amp-orientation-observer';
/**
 * @const {!Array<string>}
 */
const AXES = ['alpha', 'beta', 'gamma'];
/**
 * @const {{[key: string]: number}}
 */
const DEFAULT_REST_VALUES = {
  'alpha': 180,
  'beta': 0,
  'gamma': 0,
};
/**
 * @const {{[key: string]: !Array<number>}}
 */
const DEFAULT_RANGES = {
  'alpha': [0, 360],
  'beta': [-180, 180],
  'gamma': [-90, 90],
};
/**
 * @const {number}
 */
const DELTA_CONST = 0.1;
/**
 * @const {number}
 */
const DEFAULT_SMOOTHING_PTS = 4;

export class AmpOrientationObserver extends AMP.BaseElement {
  /** @param {!AmpElement} element */
  constructor(element) {
    super(element);

    /** @private @const */
    this.ampdoc_ = Services.ampdoc(this.element);

    /** @private {?../../../src/service/action-impl.ActionService} */
    this.action_ = null;

    /** @private {{[key: string]: !Array<number>}} */
    this.range_ = {...DEFAULT_RANGES};

    /** @private {{[key: string]: number}} */
    this.computedValue_ = {...DEFAULT_REST_VALUES};

    /** @private {{[key: string]: number}} */
    this.restValues_ = {...DEFAULT_REST_VALUES};

    /** @private {{[key: string]: !Array<number>}} */
    this.smoothingPoints_ = {beta: [], alpha: [], gamma: []};

    /** @private {?number} */
    this.smoothing_ = null;
  }

  /** @override */
  buildCallback() {
    // Since this is a functional component and not visual,
    // layoutCallback is meaningless. We delay the heavy work until
    // we become visible.
    this.action_ = Services.actionServiceForDoc(this.element);
    this.ampdoc_.whenFirstVisible().then(this.init_.bind(this));
  }

  /**
   * @private
   */
  init_() {
    userAssert(
      this.win.DeviceOrientationEvent,
      "The current browser doesn't support the " +
        '`window.DeviceOrientationEvent`'
    );

    AXES.forEach((axis) => {
      this.range_[axis] = this.parseAttributes_(
        `${axis}-range`,
        this.range_[axis]
      );
    });

    this.smoothing_ = this.element.hasAttribute('smoothing')
      ? Number(this.element.getAttribute('smoothing')) || DEFAULT_SMOOTHING_PTS
      : null;

    this.win.addEventListener(
      'deviceorientation',
      (event) => {
        this.deviceOrientationHandler_(event);
      },
      true
    );
  }

  /**
   * Parses the provided ranges
   * @param {string} rangeName
   * @param {!Array<number>} originalRange
   * @return {!Array<number>}
   * @private
   */
  parseAttributes_(rangeName, originalRange) {
    const providedRange = this.element.getAttribute(rangeName);
    if (providedRange) {
      const rangeArray = providedRange.trim().split(' ');
      return [parseInt(rangeArray[0], 10), parseInt(rangeArray[1], 10)];
    }
    return originalRange;
  }

  /**
   * @param {!Event} event
   * @private
   */
  deviceOrientationHandler_(event) {
    if (event instanceof DeviceOrientationEvent) {
      const {screen} = this.win;

      const {alpha} = event;
      let {beta, gamma} = event;

      // Detect the implementation of orientation angle
      const angle =
        'orientation' in screen ? screen.orientation.angle : screen.orientation;

      // Reverse gamma/beta if the device is in landscape
      if (this.win.orientation == 90 || this.win.orientation == -90) {
        const tmp = gamma;
        gamma = beta;
        beta = tmp;
      }

      // Flip signs of the angles if the phone is in 'reverse landscape' or
      // 'reverse portrait'
      if (angle < 0) {
        gamma = -gamma;
        beta = -beta;
      }

      const currentValue = {
        alpha,
        beta,
        gamma,
      };

      AXES.forEach((axis) => {
        if (
          Math.abs(currentValue[axis] - this.computedValue_[axis]) > DELTA_CONST
        ) {
          if (this.smoothing_) {
            this.computedValue_[axis] = this.smoothedValue_(
              axis,
              /** @type {number} */ (currentValue[axis])
            );
          } else {
            this.computedValue_[axis] = /** @type {number} */ (
              currentValue[axis]
            );
          }
          this.triggerEvent_(
            axis,
            this.computedValue_[axis],
            this.range_[axis]
          );
        }
      });
    }
  }

  /**
   * Calculates a moving average over previous values of the beta value
   * @param {string} axis
   * @param {number} value
   * @return {number}
   */
  smoothedValue_(axis, value) {
    if (this.smoothingPoints_[axis].length > this.smoothing_) {
      this.smoothingPoints_[axis].shift();
    }
    this.smoothingPoints_[axis].push(value);
    const avg = sum(this.smoothingPoints_[axis]) / this.smoothing_;
    if (
      this.smoothingPoints_[axis].length > this.smoothing_ &&
      this.restValues_[axis] == DEFAULT_REST_VALUES[axis]
    ) {
      this.restValues_[axis] = avg;
    }
    return avg - this.restValues_[axis];
  }

  /**
   * Dispatches the event to signify change in the device orientation
   * along a certain axis.
   * @param {string} eventName
   * @param {number} eventValue
   * @param {Array} eventRange
   * @private
   */
  triggerEvent_(eventName, eventValue, eventRange) {
    const percentValue =
      eventRange[0] < 0
        ? eventValue.toFixed() - eventRange[0]
        : eventValue.toFixed();
    const event = createCustomEvent(this.win, `${TAG}.${eventName}`, {
      'angle': clamp(eventValue, eventRange[0], eventRange[1]).toFixed(),
      'percent': percentValue / (eventRange[1] - eventRange[0]),
    });
    this.action_.trigger(this.element, eventName, event, ActionTrust_Enum.LOW);
  }
}
AMP.extension(TAG, '0.1', (AMP) => {
  AMP.registerElement(TAG, AmpOrientationObserver);
});
