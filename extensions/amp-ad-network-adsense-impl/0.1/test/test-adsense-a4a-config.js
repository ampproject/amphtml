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

import {
  adsenseIsA4AEnabled,
  ADSENSE_A4A_EXPERIMENT_NAME,
  ADSENSE_EXPERIMENT_FEATURE,
  URL_EXPERIMENT_MAPPING,
  fastFetchDelayedRequestEnabled,
} from '../adsense-a4a-config';
import {
  isInExperiment,
} from '../../../../ads/google/a4a/traffic-experiments';
import {EXPERIMENT_ATTRIBUTE} from '../../../../ads/google/a4a/utils';
import {urls} from '../../../../src/config';
import {forceExperimentBranch} from '../../../../src/experiments';
import {isProxyOrigin, parseUrl} from '../../../../src/url';
import {createIframePromise} from '../../../../testing/iframe';
import * as sinon from 'sinon';

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

    it('should not enable a4a when on a non-Google AMP cache', () => {
      mockWin.location = parseUrl(
          'https://amp.cloudflare.com/some/path/to/content.html');
      sandbox.stub(
          urls, 'cdnProxyRegex',
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
        // Enabled for all but holdback & sfg.
        expect(adsenseIsA4AEnabled(mockWin, elem)).to.equal(
            expFlagValue != '2');
        if (expFlagValue == 0) {
          expect(elem.getAttribute(EXPERIMENT_ATTRIBUTE)).to.not.be.ok;
        } else {
          expect(elem.getAttribute(EXPERIMENT_ATTRIBUTE)).to.be.ok;
          expect(isInExperiment(elem, URL_EXPERIMENT_MAPPING[expFlagValue]))
              .to.be.true;
        }
      });
    });

    it('should select random branch, holdback', () => {
      mockWin.location = parseUrl(
          'https://cdn.ampproject.org/some/path/to/content.html');
      forceExperimentBranch(mockWin, ADSENSE_A4A_EXPERIMENT_NAME,
          ADSENSE_EXPERIMENT_FEATURE.HOLDBACK_INTERNAL);
      const elem = testFixture.doc.createElement('div');
      elem.setAttribute('data-ad-client', 'ca-pub-somepub');
      testFixture.doc.body.appendChild(elem);
      expect(adsenseIsA4AEnabled(mockWin, elem)).to.be.false;
      expect(elem.getAttribute(EXPERIMENT_ATTRIBUTE)).to.equal(
          ADSENSE_EXPERIMENT_FEATURE.HOLDBACK_INTERNAL);
    });

    it('should select random branch, control', () => {
      mockWin.location = parseUrl(
          'https://cdn.ampproject.org/some/path/to/content.html');
      forceExperimentBranch(
          mockWin, ADSENSE_A4A_EXPERIMENT_NAME, '2092615');
      const elem = testFixture.doc.createElement('div');
      elem.setAttribute('data-ad-client', 'ca-pub-somepub');
      testFixture.doc.body.appendChild(elem);
      expect(adsenseIsA4AEnabled(mockWin, elem)).to.be.true;
      expect(elem.getAttribute(EXPERIMENT_ATTRIBUTE)).to.equal('2092615');
    });
  });

  describe('#fastFetchDelayedRequestEnabled', () => {
    [
      [ADSENSE_EXPERIMENT_FEATURE.DELAYED_REQUEST_HOLDBACK_CONTROL, {
        layer: ADSENSE_A4A_EXPERIMENT_NAME,
        result: true,
      }],
      [ADSENSE_EXPERIMENT_FEATURE.DELAYED_REQUEST_HOLDBACK_EXTERNAL, {
        layer: ADSENSE_A4A_EXPERIMENT_NAME,
        result: false,
      }],
    ].forEach(item => {
      it(`should return ${item[1].result} if in ${item[0]} experiment`, () => {
        forceExperimentBranch(mockWin, item[1].layer, item[0]);
        expect(fastFetchDelayedRequestEnabled(mockWin)).to.equal(
            item[1].result);
      });
    });

    it('should return true if not in any experiments', () => {
      expect(fastFetchDelayedRequestEnabled(mockWin)).to.be.true;
    });
  });
});
