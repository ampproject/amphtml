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

import {doubleclickIsA4AEnabled} from '../doubleclick-a4a-config';
import {
  EXPERIMENT_ATTRIBUTE,
} from '../../../../ads/google/a4a/traffic-experiments';
import {resetExperimentToggles_} from '../../../../src/experiments';
import {parseUrl} from '../../../../src/url';
import {createIframePromise} from '../../../../testing/iframe';
import * as sinon from 'sinon';

describe('doubleclick-a4a-config', () => {
  let sandbox;
  let mockWin;
  let iframe;

  beforeEach(() => {
    sandbox = sinon.sandbox.create();
    mockWin = {
      location: parseUrl('https://nowhere.org/a/place/page.html?s=foo&q=bar'),
      document: {
        querySelector: x => {return null;}
      },
      crypto: {
        subtle: true,
        webkitSubtle: true,
      },
    };
    iframe = createIframePromise();
  });
  afterEach(() => {
    sandbox.restore();
    resetExperimentToggles_();
  });

  describe('#doubleclickIsA4AEnabled', () => {
    it('should enable a4a when requested and on CDN', () => {
      return iframe.then(fixture => {
        mockWin.location = parseUrl(
            'https://cdn.ampproject.org/some/path/to/content.html');
        const elem = document.createElement('div');
        elem.setAttribute('data-use-experimental-a4a-implementation', 'true');
        expect(doubleclickIsA4AEnabled(mockWin, elem)).to.be.true;
        expect(elem.getAttribute(EXPERIMENT_ATTRIBUTE)).to.not.be.ok;
      });
    });

    it('should enable a4a when requested and in local dev', () => {
      return iframe.then(fixture => {
        const elem = document.createElement('div');
        elem.setAttribute('data-use-experimental-a4a-implementation', 'true');
        mockWin.AMP_MODE = {localDev: true};
        expect(doubleclickIsA4AEnabled(mockWin, elem)).to.be.true;
        expect(elem.getAttribute(EXPERIMENT_ATTRIBUTE)).to.not.be.ok;
      });
    });

    it('should not enable a4a, even if requested, when on bad origin', () => {
      return iframe.then(fixture => {
        const elem = fixture.doc.createElement('div');
        elem.setAttribute('data-use-experimental-a4a-implementation', 'true');
        fixture.doc.body.appendChild(elem);
        expect(doubleclickIsA4AEnabled(mockWin, elem)).to.be.false;
        expect(elem.getAttribute(EXPERIMENT_ATTRIBUTE)).to.not.be.ok;
      });
    });

    it('should carve out remote.html, in spite of experiment override', () => {
      return iframe.then(fixture => {
        const doc = fixture.doc;
        mockWin.location = parseUrl(
            'https://cdn.ampproject.org/some/path/to/content.html');
        mockWin.document.querySelector = doc.querySelector.bind(doc);
        const remoteTag = doc.createElement('meta');
        remoteTag.setAttribute('name', 'amp-3p-iframe-src');
        doc.head.appendChild(remoteTag);
        const elem = doc.createElement('div');
        elem.setAttribute('data-use-experimental-a4a-implementation', 'true');
        doc.body.appendChild(elem);
        expect(doubleclickIsA4AEnabled(mockWin, elem)).to.be.false;
        expect(elem.getAttribute(EXPERIMENT_ATTRIBUTE)).to.not.be.ok;
      });
    });

    [-1, 0, 1, 2].forEach(expFlagValue => {
      it(`exp flag=${expFlagValue} should set eid attribute`, () => {
        return iframe.then(fixture => {
          mockWin.location = parseUrl(
              'https://cdn.ampproject.org/some/path/to/content.html?exp=a4a:' +
              String(expFlagValue));
          const expectedEnabledState =
              (expFlagValue == -1 || expFlagValue == 2);
          const elem = fixture.doc.createElement('div');
          fixture.doc.body.appendChild(elem);
          expect(doubleclickIsA4AEnabled(mockWin, elem)).to.equal(
              expectedEnabledState);
          if (expFlagValue == 0) {
            expect(elem.getAttribute(EXPERIMENT_ATTRIBUTE)).to.not.be.ok;
          } else {
            expect(elem.getAttribute(EXPERIMENT_ATTRIBUTE)).to.be.ok;
          }
        });
      });

      it(`force a4a attribute should preempt exp flag=${expFlagValue}`, () => {
        return iframe.then(fixture => {
          mockWin.location = parseUrl(
              'https://cdn.ampproject.org/some/path/to/content.html?exp=a4a:' +
              String(expFlagValue));
          const elem = fixture.doc.createElement('div');
          elem.setAttribute('data-use-experimental-a4a-implementation', 'true');
          fixture.doc.body.appendChild(elem);
          expect(doubleclickIsA4AEnabled(mockWin, elem)).to.be.true;
          expect(elem.getAttribute(EXPERIMENT_ATTRIBUTE)).to.not.be.ok;
        });
      });

      it(`should carve out remote.html, in spite of exp flag=${expFlagValue}`,
          () => {
            return iframe.then(fixture => {
              const doc = fixture.doc;
              mockWin.location = parseUrl(
                  'https://cdn.ampproject.org/some/path/to/content.html?exp=a4a:' +
                  String(expFlagValue));
              mockWin.document.querySelector = doc.querySelector.bind(doc);
              const remoteTag = doc.createElement('meta');
              remoteTag.setAttribute('name', 'amp-3p-iframe-src');
              doc.head.appendChild(remoteTag);
              const elem = doc.createElement('div');
              doc.body.appendChild(elem);
              expect(doubleclickIsA4AEnabled(mockWin, elem)).to.be.false;
              expect(elem.getAttribute(EXPERIMENT_ATTRIBUTE)).to.not.be.ok;
            });
      });
    });
  });
});
