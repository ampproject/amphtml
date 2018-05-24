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

import * as sinon from 'sinon';
import {EXPERIMENT_ATTRIBUTE} from '../../../../ads/google/a4a/utils';
import {
  URL_EXPERIMENT_MAPPING,
  adsenseIsA4AEnabled,
} from '../adsense-a4a-config';
import {createIframePromise} from '../../../../testing/iframe';
import {
  isInExperiment,
} from '../../../../ads/google/a4a/traffic-experiments';
import {isProxyOrigin, parseUrl} from '../../../../src/url';
import {urls} from '../../../../src/config';

describe('adsense-a4a-config', () => {
  let sandbox;
  let mockWin;
  // Captures the fixture built by createIframePromise().
  let testFixture;

  beforeEach(() => {
    sandbox = sinon.sandbox.create();
    mockWin = {
      location: parseUrl('https://nowhere.org/a/place/page.html?s=foo&q=bar'),
      document: {
        querySelector: unused => {return null;},
      },
      crypto: {
        subtle: true,
        webkitSubtle: true,
      },
    };
    return createIframePromise().then(i => { testFixture = i; });
  });
  afterEach(() => {
    sandbox.restore();
  });

  describe('#adsenseIsA4AEnabled', () => {

    it('should not enable a4a when missing data-ad-client', () => {
      mockWin.location = parseUrl(
          'https://cdn.ampproject.org/some/path/to/content.html');
      const elem = testFixture.doc.createElement('div');
      testFixture.doc.body.appendChild(elem);
      expect(adsenseIsA4AEnabled(mockWin, elem)).to.be.false;
    });

    it('should not enable a4a when useRemoteHtml is true', () => {
      mockWin.location = parseUrl(
          'https://cdn.ampproject.org/some/path/to/content.html');
      sandbox.stub(urls, 'cdnProxyRegex').callsFake(
          /^https:\/\/([a-zA-Z0-9_-]+\.)?cdn\.ampproject\.org/);
      const elem = testFixture.doc.createElement('div');
      elem.setAttribute('data-ad-client', 'ca-pub-somepub');
      testFixture.doc.body.appendChild(elem);
      const useRemoteHtml = true;
      expect(adsenseIsA4AEnabled(mockWin, elem, useRemoteHtml)).to.be.false;
    });

    // TODO(bradfrizzell, #12476): Make this test work with sinon 4.0.
    it.skip('should not enable a4a when on a non-Google AMP cache', () => {
      mockWin.location = parseUrl(
          'https://amp.cloudflare.com/some/path/to/content.html');
      sandbox.stub(urls, 'cdnProxyRegex').callsFake(
          /^https:\/\/([a-zA-Z0-9_-]+\.)?amp\.cloudflare\.com/);
      expect(isProxyOrigin(mockWin.location)).to.be.true;
      const elem = testFixture.doc.createElement('div');
      elem.setAttribute('data-ad-client', 'ca-pub-somepub');
      testFixture.doc.body.appendChild(elem);
      expect(adsenseIsA4AEnabled(mockWin, elem)).to.be.false;
    });

    Object.keys(URL_EXPERIMENT_MAPPING).forEach(expFlagValue => {
      it(`exp flag=${expFlagValue} should set eid attribute`, () => {
        mockWin.location = parseUrl(
            'https://cdn.ampproject.org/some/path/to/content.html?exp=aa:' +
            String(expFlagValue));
        const elem = testFixture.doc.createElement('div');
        elem.setAttribute('data-ad-client', 'ca-pub-somepub');
        testFixture.doc.body.appendChild(elem);
        // Enabled for all
        expect(adsenseIsA4AEnabled(mockWin, elem)).to.be.true;
        if (expFlagValue == 0) {
          expect(elem.getAttribute(EXPERIMENT_ATTRIBUTE)).to.not.be.ok;
        } else {
          expect(elem.getAttribute(EXPERIMENT_ATTRIBUTE)).to.be.ok;
          expect(isInExperiment(elem, URL_EXPERIMENT_MAPPING[expFlagValue]))
              .to.be.true;
        }
      });
    });
  });
});
