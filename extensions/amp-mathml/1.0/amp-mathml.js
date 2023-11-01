import {isExperimentOn} from '#experiments';

import {AmpPreactBaseElement, setSuperClass} from '#preact/amp-base-element';

import {userAssert} from '#utils/log';

import {BaseElement} from './base-element';
import {TYPE} from './utils';

import {CSS} from '../../../build/amp-mathml-1.0.css';
import {getBootstrapBaseUrl, getBootstrapUrl} from '../../../src/3p-frame';

/** @const {string} */
const TAG = 'amp-mathml';

class AmpMathml extends setSuperClass(BaseElement, AmpPreactBaseElement) {
  /** @override  */
  static getPreconnects(element) {
    const ampdoc = element.getAmpDoc();
    const {win} = ampdoc;
    const urls = [
      // Base URL for 3p bootstrap iframes
      getBootstrapBaseUrl(win, ampdoc),
      // Script URL for iframe
      getBootstrapUrl(TYPE),
    ];
    return urls;
  }

  /** @override */
  isLayoutSupported(layout) {
    userAssert(
      isExperimentOn(this.win, 'bento') ||
        isExperimentOn(this.win, 'bento-mathml'),
      'expected global "bento" or specific "bento-mathml" experiment to be enabled'
    );
    return super.isLayoutSupported(layout);
  }
}

AMP.extension(TAG, '1.0', (AMP) => {
  AMP.registerElement(TAG, AmpMathml, CSS);
});
