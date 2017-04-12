/**
 * Copyright 2016 The AMP HTML Authors. All Rights Reserved.
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

import {
  additionalDimensions,
  extractAmpAnalyticsConfig,
  extractGoogleAdCreativeAndSignature,
  googleAdUrl,
} from '../utils';
import {createElementWithAttributes} from '../../../../src/dom';
import {base64UrlDecodeToBytes} from '../../../../src/utils/base64';
import {
  installExtensionsService,
} from '../../../../src/service/extensions-impl';
import {
  MockA4AImpl,
} from '../../../../extensions/amp-a4a/0.1/test/utils';
import '../../../../extensions/amp-ad/0.1/amp-ad-xorigin-iframe-handler';
import {installDocService} from '../../../../src/service/ampdoc-impl';
import {createIframePromise} from '../../../../testing/iframe';

function setupForAdTesting(fixture) {
  installDocService(fixture.win, /* isSingleDoc */ true);
  installExtensionsService(fixture.win);
  const doc = fixture.doc;
  // TODO(a4a-cam@): This is necessary in the short term, until A4A is
  // smarter about host document styling.  The issue is that it needs to
  // inherit the AMP runtime style element in order for shadow DOM-enclosed
  // elements to behave properly.  So we have to set up a minimal one here.
  const ampStyle = doc.createElement('style');
  ampStyle.setAttribute('amp-runtime', 'scratch-fortesting');
  doc.head.appendChild(ampStyle);
}

describe('Google A4A utils', () => {

  describe('#extractGoogleAdCreativeAndSignature', () => {
    it('should return body and signature', () => {
      const creative = 'some test data';
      const headerData = {
        'X-AmpAdSignature': 'AQAB',
      };
      const headers = {
        has: h => { return h in headerData; },
        get: h => { return headerData[h]; },
      };
      return expect(extractGoogleAdCreativeAndSignature(creative, headers))
          .to.eventually.deep.equal({
            creative,
            signature: base64UrlDecodeToBytes('AQAB'),
            size: null,
          });
    });

    it('should return body and signature and size', () => {
      const creative = 'some test data';
      const headerData = {
        'X-AmpAdSignature': 'AQAB',
        'X-CreativeSize': '320x50',
      };
      const headers = {
        has: h => { return h in headerData; },
        get: h => { return headerData[h]; },
      };
      return expect(extractGoogleAdCreativeAndSignature(creative, headers))
          .to.eventually.deep.equal({
            creative,
            signature: base64UrlDecodeToBytes('AQAB'),
            size: {width: 320, height: 50},
          });
    });

    it('should return null when no signature header is present', () => {
      const creative = 'some test data';
      const headers = {
        has: unused => { return false; },
        get: h => { throw new Error('Tried to get ' + h); },
      };
      return expect(extractGoogleAdCreativeAndSignature(creative, headers))
          .to.eventually.deep.equal({
            creative,
            signature: null,
            size: null,
          });
    });
  });

  //TODO: Add tests for other utils functions.

  describe('#additionalDimensions', () => {
    it('should return the right value when fed mocked inputs', () => {
      const fakeWin = {
        screenX: 1,
        screenY: 2,
        screenLeft: 3,
        screenTop: 4,
        outerWidth: 5,
        outerHeight: 6,
        screen: {
          availWidth: 11,
          availTop: 12,
        },
      };
      const fakeSize = {
        width: '100px',
        height: '101px',
      };
      return expect(additionalDimensions(fakeWin, fakeSize)).to.equal(
        '3,4,1,2,11,12,5,6,100px,101px');
    });
  });

  describe('#ActiveView AmpAnalytics integration', () => {
    it('should extract correct config from header', () => {
      return createIframePromise().then(fixture => {
        setupForAdTesting(fixture);
        let url;
        const headers = {
          get: function(name) {
            if (name == 'X-AmpAnalytics') {
              return JSON.stringify({url});
            }
            if (name == 'X-QQID') {
              return 'qqid_string';
            }
          },
          has: function(name) {
            if (name == 'X-AmpAnalytics') {
              return true;
            }
            if (name == 'X-QQID') {
              return true;
            }
          },
        };
        const element = createElementWithAttributes(fixture.doc, 'amp-a4a', {
          'width': '200',
          'height': '50',
          'type': 'adsense',
        });
        const a4a = new MockA4AImpl(element);
        url = 'not an array';
        expect(extractAmpAnalyticsConfig(a4a, headers)).to.not.be.ok;
        expect(extractAmpAnalyticsConfig(a4a, headers)).to.be.null;
        url = [];
        expect(extractAmpAnalyticsConfig(a4a, headers)).to.not.be.ok;
        expect(extractAmpAnalyticsConfig(a4a, headers)).to.be.null;

        url = ['https://foo.com?hello=world', 'https://bar.com?a=b'];
        const config = extractAmpAnalyticsConfig(a4a, headers);
        const iniLoadCsiRequest = config.requests.iniLoadCsi;
        const renderStartCsiRequest = config.requests.renderStartCsi;
        expect(iniLoadCsiRequest).to.not.be.null;
        expect(renderStartCsiRequest).to.not.be.null;
        // We expect slotId == null, since no real element is created, and so
        // no slot index is ever set.
        expect(iniLoadCsiRequest).to.match(new RegExp(
            '^https://csi\\.gstatic\\.com/csi\\?' +
            's=a4a&c=[0-9]+&slotId=null&qqid\\.null=[a-zA-Z_]+' +
            '&met\\.a4a\\.null=iniLoadCsi\\.[0-9]+$'));
        expect(renderStartCsiRequest).to.match(new RegExp(
            '^https://csi\\.gstatic\\.com/csi\\?' +
            's=a4a&c=[0-9]+&slotId=null&qqid\\.null=[a-zA-Z_]+' +
            '&met\\.a4a\\.null=renderStartCsi\\.[0-9]+$'));
        // Need to remove this request as it will vary in test execution.
        delete config.requests.iniLoadCsi;
        delete config.requests.renderStartCsi;
        expect(config).to.deep.equal({
          transport: {beacon: false, xhrpost: false},
          requests: {
            visibility1: url[0],
            visibility2: url[1],
          },
          triggers: {
            continuousVisible: {
              on: 'visible',
              request: ['visibility1', 'visibility2'],
              visibilitySpec: {
                selector: 'amp-ad',
                selectionMethod: 'closest',
                visiblePercentageMin: 50,
                continuousTimeMin: 1000,
              },
            },
            continuousVisibleIniLoad: {
              on: 'ini-load',
              request: 'iniLoadCsi',
              selector: 'amp-ad',
              selectionMethod: 'closest',
            },
            continuousVisibleRenderStart: {
              on: 'render-start',
              request: 'renderStartCsi',
              selector: 'amp-ad',
              selectionMethod: 'closest',
            },
          },
        });
        headers.has = function(name) {
          expect(name).to.equal('X-AmpAnalytics');
          return false;
        };
        expect(extractAmpAnalyticsConfig(a4a, headers)).to.not.be.ok;
      });
    });
  });

  describe('#googleAdUrl', () => {
    it('should have the correct ifi numbers', function() {
      // Reset counter for purpose of this test.
      delete window['ampAdGoogleIfiCounter'];
      return createIframePromise().then(fixture => {
        setupForAdTesting(fixture);
        const doc = fixture.doc;
        const elem = createElementWithAttributes(doc, 'amp-a4a', {
          'type': 'adsense',
          'width': '320',
          'height': '50',
        });
        const impl = new MockA4AImpl(elem);
        impl.getAmpDoc = () => doc;

        // Because of the way the element is constructed, it doesn't have all of
        // the machinery that AMP expects it to have, so just no-op the
        // irrelevant functions.
        const noop = () => {};
        elem.build = noop;
        elem.getPlaceholder = noop;
        elem.createPlaceholder = noop;
        elem.getLayoutBox = () => {
          return {top: 0, left: 0, right: 0, bottom: 0, width: 0, height: 0};
        };
        return fixture.addElement(elem).then(() => {
          return googleAdUrl(impl, '', 0, [], []).then(url1 => {
            expect(url1).to.match(/ifi=1/);
            return googleAdUrl(impl, '', 0, [], []).then(url2 => {
              expect(url2).to.match(/ifi=2/);
              return googleAdUrl(impl, '', 0, [], []).then(url3 => {
                expect(url3).to.match(/ifi=3/);
              });
            });
          });
        });
      });
    });
  });
});
