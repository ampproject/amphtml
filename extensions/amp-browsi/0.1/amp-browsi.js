/**
 * Copyright 2019 The AMP HTML Authors. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS-IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import {BrowsiEngagementService} from './engagement';
import {BrowsiUtils} from './BrowsiUtils';
import {BrowsiViewability} from './viewability';
import {Layout} from '../../../src/layout';
import {Prediction} from './Prediction';
import {sendPublisherAdFound} from './eventService';

export class AmpBrowsi extends AMP.BaseElement {
  /** @param {!AmpElement} element */
  constructor(element) {
    super(element);
  }

  /** @override */
  buildCallback() {
    const ampdoc = this.getAmpDoc();
    const pubKey = this.element.getAttribute('pub-key');
    const siteKey = this.element.getAttribute('site-key');
    if (!pubKey || !siteKey) {
      return;
    }
    BrowsiUtils.pubKey = pubKey;
    BrowsiUtils.siteKey = siteKey;
    const predictionService = new Prediction(ampdoc.win, pubKey, siteKey);
    predictionService.setRtc();
    this.collectAndSendPublisherData(ampdoc);
    const engagementService = new BrowsiEngagementService(ampdoc);
    engagementService.assignEngagementReports();
  }

  /** @override */
  isLayoutSupported(layout) {
    return layout === Layout.NODISPLAY;
  }

  /**
   * Collect data about publisher ads on page
   * send publisher ad found event for each ad
   * @param {!../../../src/service/ampdoc-impl.AmpDoc} ampDoc
   */
  collectAndSendPublisherData(ampDoc) {
    this.collectPublisherData(ampDoc).then(adsData => {
      sendPublisherAdFound(adsData);
    });
  }
  /**
   * Collect data about publisher ads on page
   * @param {!../../../src/service/ampdoc-impl.AmpDoc} ampDoc
   * @return {Promise}
   */
  collectPublisherData(ampDoc) {
    const adsData = [];
    const ads = ampDoc.win.document.getElementsByTagName('amp-ad');
    for (let i = 0; i < ads.length; i++) {
      const ad = ads[i];
      const additionalObj = {
        adIndex: ad.getAttribute('data-amp-slot-index'),
        adGoogleQuery: ad.getAttribute('data-google-query-id'),
      };
      const adData = BrowsiUtils.buildAdData(ad, ampDoc, additionalObj);
      adsData.push(adData);
      new BrowsiViewability(ad, ampDoc);
    }
    const embeds = ampDoc.win.document.getElementsByTagName('amp-embed');
    for (let i = 0; i < embeds.length; i++) {
      const embed = embeds[i];
      const adData = BrowsiUtils.buildAdData(embed, ampDoc, {});
      adsData.push(adData);
    }
    return Promise.all(adsData);
  }
}

AMP.extension('amp-browsi', '0.1', AMP => {
  AMP.registerElement('amp-browsi', AmpBrowsi);
});
