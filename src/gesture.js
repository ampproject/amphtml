import {Gestures as GesturesBase} from './gesture-base';
import {Pass} from './pass';

export {GestureRecognizer, Gesture} from './gesture-base';

export class Gestures extends GesturesBase {
  static get = GesturesBase.get;

  /**
   * @param {!Element} element
   * @param {boolean} shouldNotPreventDefault
   * @param {boolean} shouldStopPropagation
   */
  constructor(element, shouldNotPreventDefault, shouldStopPropagation) {
    super(
      element,
      shouldNotPreventDefault,
      shouldStopPropagation,
      Pass // Override the default
    );
  }
}
