import {dict} from '#core/types/object';

import {isExperimentOn} from '#experiments';

import {Services} from '#service';

import {userAssert} from '#utils/log';

import {BaseElement} from './base-element';

/** @const {string} */
const TAG = 'amp-gpt';

class AmpGpt extends BaseElement {
  /** @override */
  init() {
    // DO NOT SUBMIT: This is example code only.
    this.registerApiAction('exampleToggle', (api) =>
      api./*OK*/ exampleToggle()
    );

    return dict({
      // Extra props passed by wrapper AMP component
      'actions_': Services.actionServiceForDoc(this.element),
      'exampleTagNameProp': this.element.tagName,
    });
  }

  /** @override */
  isLayoutSupported(layout) {
    userAssert(
      isExperimentOn(this.win, 'bento') ||
        isExperimentOn(this.win, 'bento-gpt'),
      'expected global "bento" or specific "bento-gpt" experiment to be enabled'
    );
    return super.isLayoutSupported(layout);
  }
}

AMP.extension(TAG, '1.0', (AMP) => {
  AMP.registerElement(TAG, AmpGpt);
});
