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
  BETA_ATTRIBUTE,
  BETA_EXPERIMENT_ID,
  DFP_CANONICAL_FF_EXPERIMENT_NAME,
  DOUBLECLICK_A4A_EXPERIMENT_NAME,
  DOUBLECLICK_EXPERIMENT_FEATURE,
  URL_EXPERIMENT_MAPPING,
  DoubleclickA4aEligibility,
} from '../doubleclick-a4a-config';
import {
  isInExperiment,
  MANUAL_EXPERIMENT_ID,
} from '../../../../ads/google/a4a/traffic-experiments';
import {EXPERIMENT_ATTRIBUTE} from '../../../../ads/google/a4a/utils';
import {forceExperimentBranch} from '../../../../src/experiments';
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
    it('should enable a4a on AMP cache w/o experiments selected', () => {
      // Ensure no selection in order to very experiment attribute.
      sandbox.stub(DoubleclickA4aEligibility.prototype, 'maybeSelectExperiment')
          .returns(null);
      mockWin.location = parseUrl(
          'https://cdn.ampproject.org/some/path/to/content.html');
      const elem = testFixture.doc.createElement('div');
      testFixture.doc.body.appendChild(elem);
      expect(doubleclickIsA4AEnabled(mockWin, elem)).to.be.true;
      expect(elem.getAttribute(EXPERIMENT_ATTRIBUTE)).to.not.be.ok;
    });

    it('should enable a4a when native crypto is supported', () => {
      forceExperimentBranch(mockWin, DFP_CANONICAL_FF_EXPERIMENT_NAME,
          DOUBLECLICK_EXPERIMENT_FEATURE.CANONICAL_EXPERIMENT);
      const elem = testFixture.doc.createElement('div');
      testFixture.doc.body.appendChild(elem);
      expect(doubleclickIsA4AEnabled(mockWin, elem)).to.be.true;
    });

    it('should not enable a4a when native crypto is not supported', () => {
      sandbox.stub(DoubleclickA4aEligibility.prototype,
          'supportsCrypto', () => false);
      const elem = testFixture.doc.createElement('div');
      testFixture.doc.body.appendChild(elem);
      expect(doubleclickIsA4AEnabled(mockWin, elem)).to.be.false;
    });

    it('should select into canonical AMP experiment when not on CDN', () => {
      sandbox.stub(DoubleclickA4aEligibility.prototype,
          'isCdnProxy', () => false);
      const maybeSelectExperimentSpy = sandbox.spy(
          DoubleclickA4aEligibility.prototype, 'maybeSelectExperiment');
      const elem = testFixture.doc.createElement('div');
      testFixture.doc.body.appendChild(elem);
      doubleclickIsA4AEnabled(mockWin, elem);
      expect(maybeSelectExperimentSpy).to.be.calledWith(mockWin, elem, [
        DOUBLECLICK_EXPERIMENT_FEATURE.CANONICAL_CONTROL,
        DOUBLECLICK_EXPERIMENT_FEATURE.CANONICAL_EXPERIMENT,
      ], DFP_CANONICAL_FF_EXPERIMENT_NAME) ;
      expect(maybeSelectExperimentSpy.callCount).to.equal(1);

    });

    it('should select into non-SSL canonical AMP experiment when not on CDN',
        () => {
          sandbox.stub(DoubleclickA4aEligibility.prototype,
              'isCdnProxy', () => false);
          sandbox.stub(DoubleclickA4aEligibility.prototype,
              'supportsCrypto', () => false);
          const maybeSelectExperimentSpy = sandbox.spy(
              DoubleclickA4aEligibility.prototype, 'maybeSelectExperiment');
          const elem = testFixture.doc.createElement('div');
          testFixture.doc.body.appendChild(elem);
          doubleclickIsA4AEnabled(mockWin, elem);
          expect(maybeSelectExperimentSpy).to.be.calledWith(mockWin, elem, [
            DOUBLECLICK_EXPERIMENT_FEATURE.CANONICAL_HTTP_CONTROL,
            DOUBLECLICK_EXPERIMENT_FEATURE.CANONICAL_HTTP_EXPERIMENT,
          ], DFP_CANONICAL_FF_EXPERIMENT_NAME) ;
          expect(maybeSelectExperimentSpy.callCount).to.equal(1);
        });

    it('should return false if no canonical AMP experiment branch', () => {
      forceExperimentBranch(mockWin, DFP_CANONICAL_FF_EXPERIMENT_NAME, null);
      sandbox.stub(DoubleclickA4aEligibility.prototype,
          'isCdnProxy', () => false);
      const elem = testFixture.doc.createElement('div');
      testFixture.doc.body.appendChild(elem);
      expect(doubleclickIsA4AEnabled(mockWin, elem)).to.be.false;
      expect(elem.getAttribute(EXPERIMENT_ATTRIBUTE)).to.not.be.ok;
    });

    it('should honor url forced FF on non-CDN', () => {
      mockWin.AMP_MODE = {test: false, localDev: true};
      mockWin.location = parseUrl(
          'https://foo.com/some/path/to/content.html?exp=a4a:-1');
      sandbox.stub(DoubleclickA4aEligibility.prototype,
          'isCdnProxy', () => false);
      const elem = testFixture.doc.createElement('div');
      testFixture.doc.body.appendChild(elem);
      expect(doubleclickIsA4AEnabled(mockWin, elem)).to.be.true;
      expect(elem.getAttribute(EXPERIMENT_ATTRIBUTE)).to.equal(
          MANUAL_EXPERIMENT_ID);
    });

    it('should not honor url forced FF on non-CDN if prod', () => {
      // Ensure no selection in order to very experiment attribute.
      const maybeSelectExperimentStub = sandbox.stub(
          DoubleclickA4aEligibility.prototype, 'maybeSelectExperiment')
          .returns(undefined);
      mockWin.AMP_MODE = {test: false, localDev: false};
      mockWin.location = parseUrl(
          'https://somepub.com/some/path/to/content.html?exp=a4a:-1');
      const elem = testFixture.doc.createElement('div');
      testFixture.doc.body.appendChild(elem);
      expect(doubleclickIsA4AEnabled(mockWin, elem)).to.be.false;
      expect(elem.getAttribute(EXPERIMENT_ATTRIBUTE)).to.not.be.ok;
      expect(maybeSelectExperimentStub).to.be.calledOnce;
    });

    it('should not enable if data-use-same-domain-rendering-until-deprecated',
        () => {
          const elem = testFixture.doc.createElement('div');
          elem.setAttribute(
              'data-use-same-domain-rendering-until-deprecated', '');
          testFixture.doc.body.appendChild(elem);
          expect(doubleclickIsA4AEnabled(mockWin, elem)).to.be.false;
          expect(elem.getAttribute(EXPERIMENT_ATTRIBUTE)).to.not.be.ok;
        });

    it('should honor beta over url experiment id', () => {
      mockWin.location = parseUrl(
          'https://cdn.ampproject.org/some/path/to/content.html?exp=a4a:2');
      const elem = testFixture.doc.createElement('div');
      elem.setAttribute(BETA_ATTRIBUTE, 'true');
      testFixture.doc.body.appendChild(elem);
      expect(doubleclickIsA4AEnabled(mockWin, elem)).to.be.true;
      expect(elem.getAttribute(EXPERIMENT_ATTRIBUTE)).to.equal(
          BETA_EXPERIMENT_ID);
    });

    Object.keys(URL_EXPERIMENT_MAPPING).forEach(expFlagValue => {
      it(`exp flag=${expFlagValue} should set eid attribute`, () => {
        mockWin.location = parseUrl(
            'https://cdn.ampproject.org/some/path/to/content.html?exp=a4a:' +
            String(expFlagValue));
        const elem = testFixture.doc.createElement('div');
        testFixture.doc.body.appendChild(elem);
        // Enabled for all but holdback & sfg.
        expect(doubleclickIsA4AEnabled(mockWin, elem)).to.equal(
            !['2', '5', '6'].includes(expFlagValue));
        if (expFlagValue == 0) {
          expect(elem.getAttribute(EXPERIMENT_ATTRIBUTE)).to.not.be.ok;
        } else {
          expect(elem.getAttribute(EXPERIMENT_ATTRIBUTE)).to.be.ok;
          expect(isInExperiment(elem, URL_EXPERIMENT_MAPPING[expFlagValue]))
              .to.be.true;
          // Should not be in beta.
          expect(isInExperiment(elem, BETA_EXPERIMENT_ID)).to.be.false;
        }
      });
    });

    it('should select random branch, holdback', () => {
      mockWin.location = parseUrl(
          'https://cdn.ampproject.org/some/path/to/content.html');
      forceExperimentBranch(mockWin, DOUBLECLICK_A4A_EXPERIMENT_NAME,
          DOUBLECLICK_EXPERIMENT_FEATURE.HOLDBACK_INTERNAL);
      const elem = testFixture.doc.createElement('div');
      testFixture.doc.body.appendChild(elem);
      expect(doubleclickIsA4AEnabled(mockWin, elem)).to.be.false;
      expect(elem.getAttribute(EXPERIMENT_ATTRIBUTE)).to.equal(
          DOUBLECLICK_EXPERIMENT_FEATURE.HOLDBACK_INTERNAL);
    });

    it('should select random branch, control', () => {
      mockWin.location = parseUrl(
          'https://cdn.ampproject.org/some/path/to/content.html');
      forceExperimentBranch(
          mockWin, DOUBLECLICK_A4A_EXPERIMENT_NAME, '2092613');
      const elem = testFixture.doc.createElement('div');
      testFixture.doc.body.appendChild(elem);
      expect(doubleclickIsA4AEnabled(mockWin, elem)).to.be.true;
      expect(elem.getAttribute(EXPERIMENT_ATTRIBUTE)).to.equal('2092613');
    });
  });
});
