import {Gestures as GesturesBase} from './gesture-base';
import {Pass} from './pass';

export {GestureRecognizer, Gesture} from './gesture-base';

export class Gestures extends GesturesBase {
  static get = GesturesBase.get;

  /**
   * @override
   */
  getPass_() {
    return Pass;
  }
}
