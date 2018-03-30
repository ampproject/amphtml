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
      const vendorITEntry = ANALYTICS_IFRAME_TRANSPORT_CONFIG[vendor];
      expect(Object.keys(vendorITEntry).length).to.equal(1);
      expect(vendorITEntry.transport).to.exist;
      expect(Object.keys(vendorITEntry.transport).length).to.equal(1);
      expect(vendorITEntry.transport.iframe).to.exist;
    }
  });

  it('Should not contain iframe transport in ANALYTICS_CONFIG (other than' +
      ' those in ANALYTICS_IFRAME_TRANSPORT_CONFIG)', () => {
    for (const vendor in ANALYTICS_CONFIG) {
      const vendorEntry = ANALYTICS_CONFIG[vendor];
      if (vendorEntry.hasOwnProperty('transport') &&
          vendorEntry.transport.hasOwnProperty('iframe')) {
        const vendorITEntry = ANALYTICS_IFRAME_TRANSPORT_CONFIG[vendor];
        if (typeof vendorITEntry === 'undefined') {
          expect('ANALYTICS_IFRAME_TRANSPORT_CONFIG[' + vendor +
              '] is undefined').to.equal(vendorITEntry);
        }
        expect(vendorITEntry).to.exist;
        if (typeof vendorITEntry.transport === 'undefined') {
          expect('ANALYTICS_IFRAME_TRANSPORT_CONFIG[' + vendor +
              '].transport is undefined').to.equal(vendorITEntry.transport);
        }
        expect(vendorITEntry.transport).to.exist;
        if (typeof vendorITEntry.transport.iframe === 'undefined') {
          expect('ANALYTICS_IFRAME_TRANSPORT_CONFIG[' + vendor +
              '].transport.iframe is undefined')
              .to.equal(vendorITEntry.transport.iframe);
        }
        expect(vendorITEntry.transport.iframe).to.exist;
      }
    }
  });

  it('temp debugging test', () => {
    expect(JSON.stringify(ANALYTICS_IFRAME_TRANSPORT_CONFIG))
        .to.equal('ANALYTICS_IFRAME_TRANSPORT_CONFIG');
  });
});
