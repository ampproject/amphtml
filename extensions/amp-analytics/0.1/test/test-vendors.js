/**
 * Copyright 2017 The AMP HTML Authors. All Rights Reserved.
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

import {ANALYTICS_CONFIG, ANALYTICS_IFRAME_TRANSPORT_CONFIG} from '../vendors';

describe('analytics vendors', () => {
  it('googleanalytics & googleanalytics-alpha should be identical', () => {
    const gaConfig = ANALYTICS_CONFIG['googleanalytics'];
    expect(gaConfig).to
        .deep.equal(ANALYTICS_CONFIG['googleanalytics-alpha']);
  });

  it('should contain only iframe transport in ' +
      'ANALYTICS_IFRAME_TRANSPORT_CONFIG', () => {
    for (const vendor in ANALYTICS_IFRAME_TRANSPORT_CONFIG) {
      const vendorEntry = ANALYTICS_IFRAME_TRANSPORT_CONFIG[vendor];
      expect(Object.keys(vendorEntry).length).to.equal(1);
      expect(vendorEntry.transport).to.not.be.null;
      expect(Object.keys(vendorEntry.transport).length).to.equal(1);
      expect(vendorEntry.transport.iframe).to.not.be.null;
    }
  });

  it('should not contain iframe transport in ANALYTICS_CONFIG (other than' +
      ' those in ANALYTICS_IFRAME_TRANSPORT_CONFIG)', () => {
    for (const vendor in ANALYTICS_CONFIG) {
      const vendorEntry = ANALYTICS_CONFIG[vendor];
      if (vendorEntry.hasOwnProperty('transport') &&
          vendorEntry.transport.hasOwnProperty('iframe')) {
        expect(ANALYTICS_IFRAME_TRANSPORT_CONFIG[vendor]).to.not.be.null;
        expect(ANALYTICS_IFRAME_TRANSPORT_CONFIG[vendor].transport)
            .to.not.be.null;
        expect(ANALYTICS_IFRAME_TRANSPORT_CONFIG[vendor].transport.iframe)
            .to.not.be.null;
      }
    }
  });
});
