// import { getIframe, preloadBootstrap } from '../../../src/3p-frame';

import {Services} from '../../../src/services';
import {startSkimcore} from './skimcore.js';

export class AmpSkimlinks extends AMP.BaseElement {
  // /** @override */
  // preconnectCallback() {
  //     console.log("preconnect", this)
  //     this.preconnect.preload('https://s.skimresources.com/js/68019X1559797.skimlinks.js', 'script');
  //     preloadBootstrap(this.win, this.preconnect);
  // }

  /** @override */
  isLayoutSupported() {
    return true;
  }

  /**
   * @override
   */
  buildCallback() {
    console.log('Build callback', this);
    const context = {
      xhr: Services.xhrFor(this.win),
    };
    startSkimcore(context);
  }

  /** @override */
  layoutCallback() {
    console.log('LAYOUT CALLBACK');
    // actually load your resource or render more expensive resources.
  }
}


AMP.extension('amp-skimlinks', '0.1', AMP => {
  AMP.registerElement('amp-skimlinks', AmpSkimlinks);
});
