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
  doubleclickIsA4AEnabled,
  DOUBLECLICK_A4A_EXTERNAL_EXPERIMENT_BRANCHES,
  DOUBLECLICK_A4A_BETA_BRANCHES,
  BETA_ATTRIBUTE,
} from '../doubleclick-a4a-config';
import {
  isInManualExperiment,
  isInExperiment,
} from '../../../../ads/google/a4a/traffic-experiments';
import {EXPERIMENT_ATTRIBUTE} from '../../../../ads/google/a4a/utils';
import {parseUrl} from '../../../../src/url';
import {createIframePromise} from '../../../../testing/iframe';
import * as sinon from 'sinon';

describe('doubleclick-a4a-config', () => {
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

  describe('#doubleclickIsA4AEnabled', () => {
    it('should enable a4a when requested and on CDN', () => {
      mockWin.location = parseUrl(
          'https://cdn.ampproject.org/some/path/to/content.html');
      const elem = testFixture.doc.createElement('div');
      elem.setAttribute(BETA_ATTRIBUTE, 'true');
      testFixture.doc.body.appendChild(elem);
      expect(doubleclickIsA4AEnabled(mockWin, elem)).to.be.true;
      expect(elem.getAttribute(EXPERIMENT_ATTRIBUTE)).to.equal(
          DOUBLECLICK_A4A_BETA_BRANCHES.experiment);
    });

    it('should enable a4a when requested and in local dev', () => {
      const elem = testFixture.doc.createElement('div');
      elem.setAttribute(BETA_ATTRIBUTE, 'true');
      mockWin.AMP_MODE = {localDev: true};
      testFixture.doc.body.appendChild(elem);
      expect(doubleclickIsA4AEnabled(mockWin, elem)).to.be.true;
      expect(elem.getAttribute(EXPERIMENT_ATTRIBUTE)).to.equal(
          DOUBLECLICK_A4A_BETA_BRANCHES.experiment);
    });

    it('should not enable a4a, even if requested, when on bad origin', () => {
      const elem = testFixture.doc.createElement('div');
      elem.setAttribute(BETA_ATTRIBUTE, 'true');
      testFixture.doc.body.appendChild(elem);
      expect(doubleclickIsA4AEnabled(mockWin, elem)).to.be.false;
      expect(elem.getAttribute(EXPERIMENT_ATTRIBUTE)).to.not.be.ok;
    });

    it('should not enable a4a if useSameDomainRenderingUntilDeprecated', () => {
      const elem = testFixture.doc.createElement('div');
      elem.setAttribute('useSameDomainRenderingUntilDeprecated', 'true');
      testFixture.doc.body.appendChild(elem);
      expect(doubleclickIsA4AEnabled(mockWin, elem)).to.be.false;
      expect(elem.getAttribute(EXPERIMENT_ATTRIBUTE)).to.not.be.ok;
    });

    [-1, 0, 1, 2].forEach(expFlagValue => {
      it(`exp flag=${expFlagValue} should set eid attribute`, () => {
        mockWin.location = parseUrl(
            'https://cdn.ampproject.org/some/path/to/content.html?exp=a4a:' +
            String(expFlagValue));
        const expectedEnabledState =
            (expFlagValue == -1 || expFlagValue == 2);
        const elem = testFixture.doc.createElement('div');
        testFixture.doc.body.appendChild(elem);
        expect(doubleclickIsA4AEnabled(mockWin, elem)).to.equal(
            expectedEnabledState);
        if (expFlagValue == 0) {
          expect(elem.getAttribute(EXPERIMENT_ATTRIBUTE)).to.not.be.ok;
        } else {
          expect(elem.getAttribute(EXPERIMENT_ATTRIBUTE)).to.be.ok;
          expect(isInExperiment(elem,
              DOUBLECLICK_A4A_BETA_BRANCHES.experiment)).to.be.false;
          expect(isInExperiment(elem,
              DOUBLECLICK_A4A_BETA_BRANCHES.control)).to.be.false;
        }
      });

    });

    [0, 1, 2].forEach(expFlagValue => {
      it(`force a4a attribute should preempt exp flag=${expFlagValue}`, () => {
        mockWin.location = parseUrl(
            'https://cdn.ampproject.org/some/path/to/content.html?exp=a4a:' +
            String(expFlagValue));
        const elem = testFixture.doc.createElement('div');
        elem.setAttribute(BETA_ATTRIBUTE, 'true');
        testFixture.doc.body.appendChild(elem);
        expect(doubleclickIsA4AEnabled(mockWin, elem)).to.be.true;
        expect(elem.getAttribute(EXPERIMENT_ATTRIBUTE)).to.equal(
            DOUBLECLICK_A4A_BETA_BRANCHES.experiment);
      });
    });

    it('manual experiment should win over beta force a4a attribute', () => {
      mockWin.location = parseUrl(
          'https://cdn.ampproject.org/some/path/to/content.html?exp=a4a:-1');
      const elem = testFixture.doc.createElement('div');
      elem.setAttribute(BETA_ATTRIBUTE, 'true');
      testFixture.doc.body.appendChild(elem);
      expect(doubleclickIsA4AEnabled(mockWin, elem)).to.be.true;
      expect(isInManualExperiment(elem)).to.be.true;
      expect(isInExperiment(elem, DOUBLECLICK_A4A_BETA_BRANCHES.experiment))
          .to.be.false;
      expect(isInExperiment(elem, DOUBLECLICK_A4A_BETA_BRANCHES.control))
          .to.be.false;
    });

    it('should not switch on other slot on page', () => {
      const doc = testFixture.doc;
      mockWin.location = parseUrl(
          'https://cdn.ampproject.org/some/path/to/content.html?exp=a4a:0');
      const elem0 = doc.createElement('div');
      elem0.setAttribute(BETA_ATTRIBUTE, 'true');
      doc.body.appendChild(elem0);
      const elem1 = doc.createElement('div');
      doc.body.appendChild(elem1);
      expect(doubleclickIsA4AEnabled(mockWin, elem0)).to.be.true;
      expect(elem0.getAttribute(EXPERIMENT_ATTRIBUTE)).to.equal(
          DOUBLECLICK_A4A_BETA_BRANCHES.experiment);
      expect(doubleclickIsA4AEnabled(mockWin, elem1)).to.be.false;
      expect(elem1.getAttribute(EXPERIMENT_ATTRIBUTE)).to.not.be.ok;
    });

    it('should not interfere with other slot on page', () => {
      const doc = testFixture.doc;
      mockWin.location = parseUrl(
          'https://cdn.ampproject.org/some/path/to/content.html?exp=a4a:2');
      const elem0 = doc.createElement('div');
      elem0.setAttribute(BETA_ATTRIBUTE, 'true');
      doc.body.appendChild(elem0);
      const elem1 = doc.createElement('div');
      doc.body.appendChild(elem1);
      expect(doubleclickIsA4AEnabled(mockWin, elem0)).to.be.true;
      expect(elem0.getAttribute(EXPERIMENT_ATTRIBUTE)).to.equal(
          DOUBLECLICK_A4A_BETA_BRANCHES.experiment);
      expect(doubleclickIsA4AEnabled(mockWin, elem1)).to.be.true;
      expect(isInExperiment(elem1,
          DOUBLECLICK_A4A_EXTERNAL_EXPERIMENT_BRANCHES.experiment)).to.be.true;
    });
  });
});
