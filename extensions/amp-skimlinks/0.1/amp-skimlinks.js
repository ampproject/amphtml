// import { getIframe, preloadBootstrap } from '../../../src/3p-frame';

import {CommonSignals} from '../../../src/common-signals';
import {CustomEventReporterBuilder} from '../../../src/extension-analytics.js';
import {Services} from '../../../src/services';
import {startSkimcore} from './skimcore.js';

export const TRACKING_API_URL = 'https://t.skimresources.com/api';

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
    this.setupAnalyticsEvents();
    const context = {
      xhr: Services.xhrFor(this.win),
      analytics: this.analytics_,
    };
    const signals = this.signals();
    signals.whenSignal(CommonSignals.LOAD_START).then(() => console.log('LOAD_START'));
    startSkimcore(context);
  }

  setupAnalyticsEvents() {
    // "layoutCallback" from custom-element base class needs be executed in order to have analytics working.
    // Analytics are not setup until CommonSignals.LOAD_START is triggered.
    const analyticsBuilder = new CustomEventReporterBuilder(this.element);
    analyticsBuilder.track('page_impressions', `${TRACKING_API_URL}/page?\${test}`);
    analyticsBuilder.track('link_impressions', `${TRACKING_API_URL}/link?\${test}`);
    this.analytics_ = analyticsBuilder.build();
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
