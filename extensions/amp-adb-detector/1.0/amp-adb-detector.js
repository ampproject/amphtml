import {ActionTrust} from '#core/constants/action-constants';
import {dict} from '#core/types/object';

import {isExperimentOn} from '#experiments';

import {Services} from '#service';

import {userAssert} from '#utils/log';

import {BaseElement} from './base-element';

import {CSS} from '../../../build/amp-adb-detector-1.0.css';

/** @const {string} */
const TAG = 'amp-adb-detector';

class AmpAdbDetector extends BaseElement {
  /** @override */
  init() {
    this.actions_ = Services.actionServiceForDoc(this.element);
    return dict({
      // Extra props passed by wrapper AMP component
      'onBlock': () => {
        this.actions_.trigger(this.element, 'onblock');
      },
    });
  }
  /** @override */
  isLayoutSupported(layout) {
    userAssert(
      isExperimentOn(this.win, 'bento') ||
        isExperimentOn(this.win, 'bento-adb-detector'),
      'expected global "bento" or specific "bento-adb-detector" experiment to be enabled'
    );
    return super.isLayoutSupported(layout);
  }
}

AMP.extension(TAG, '1.0', (AMP) => {
  AMP.registerElement(TAG, AmpAdbDetector, CSS);
});
