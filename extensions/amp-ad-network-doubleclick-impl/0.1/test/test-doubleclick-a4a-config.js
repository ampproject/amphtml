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

import * as sinon from 'sinon';
import {
  DOUBLECLICK_EXPERIMENT_FEATURE,
  DOUBLECLICK_UNCONDITIONED_EXPERIMENTS,
  DoubleclickA4aEligibility,
  UNCONDITIONED_CANONICAL_FF_HOLDBACK_EXP_NAME,
  URL_EXPERIMENT_MAPPING,
  dfDepRollbackExperiment,
  doubleclickIsA4AEnabled,
} from '../doubleclick-a4a-config';
import {EXPERIMENT_ATTRIBUTE} from '../../../../ads/google/a4a/utils';
import {
  MANUAL_EXPERIMENT_ID,
  isInExperiment,
} from '../../../../ads/google/a4a/traffic-experiments';
import {createIframePromise} from '../../../../testing/iframe';
import {parseUrl} from '../../../../src/url';
import {toggleExperiment} from '../../../../src/experiments';

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

    it('should use Fast Fetch if useRemoteHtml is true and no RTC', () => {
      // Ensure no selection in order to very experiment attribute.
      sandbox.stub(DoubleclickA4aEligibility.prototype, 'maybeSelectExperiment')
          .returns(null);
      mockWin.location = parseUrl(
          'https://cdn.ampproject.org/some/path/to/content.html');
      const elem = testFixture.doc.createElement('div');
      testFixture.doc.body.appendChild(elem);
      const useRemoteHtml = true;
      expect(
          doubleclickIsA4AEnabled(mockWin, elem, useRemoteHtml)).to.be.true;
      expect(elem.getAttribute(EXPERIMENT_ATTRIBUTE)).to.not.be.ok;
    });


    it('should use DF if useRemoteHtml is true and no RTC, in rollback', () => {
      toggleExperiment(
          mockWin, dfDepRollbackExperiment, true);
      // Ensure no selection in order to very experiment attribute.
      sandbox.stub(DoubleclickA4aEligibility.prototype, 'maybeSelectExperiment')
          .returns(null);
      mockWin.location = parseUrl(
          'https://cdn.ampproject.org/some/path/to/content.html');
      const elem = testFixture.doc.createElement('div');
      testFixture.doc.body.appendChild(elem);
      const useRemoteHtml = true;
      expect(
          doubleclickIsA4AEnabled(mockWin, elem, useRemoteHtml)).to.be.false;
      expect(elem.getAttribute(EXPERIMENT_ATTRIBUTE)).to.not.be.ok;
    });

    it('should use FF if useRemoteHtml=true, RTC is set, in rollback', () => {
      toggleExperiment(
          mockWin, dfDepRollbackExperiment, true);
      // Ensure no selection in order to very experiment attribute.
      sandbox.stub(DoubleclickA4aEligibility.prototype,
          'maybeSelectExperiment')
          .returns(null);
      mockWin.location = parseUrl(
          'https://cdn.ampproject.org/some/path/to/content.html');
      const elem = testFixture.doc.createElement('div');
      elem.setAttribute('rtc-config', '{"urls": ["https://www.foo.com/"]}');
      testFixture.doc.body.appendChild(elem);
      const useRemoteHtml = true;
      expect(
          doubleclickIsA4AEnabled(mockWin, elem, useRemoteHtml)).to.be.true;
      expect(elem.getAttribute(EXPERIMENT_ATTRIBUTE)).to.not.be.ok;
    });


    it('should use Fast Fetch if useRemoteHtml is true and RTC is set', () => {
      // Ensure no selection in order to very experiment attribute.
      sandbox.stub(DoubleclickA4aEligibility.prototype, 'maybeSelectExperiment')
          .returns(null);
      mockWin.location = parseUrl(
          'https://cdn.ampproject.org/some/path/to/content.html');
      const elem = testFixture.doc.createElement('div');
      elem.setAttribute('rtc-config', '{"urls": ["https://www.foo.com/"]}');
      testFixture.doc.body.appendChild(elem);
      const useRemoteHtml = true;
      expect(
          doubleclickIsA4AEnabled(mockWin, elem, useRemoteHtml)).to.be.true;
      expect(elem.getAttribute(EXPERIMENT_ATTRIBUTE)).to.not.be.ok;
    });

    it('should enable a4a when native crypto is supported', () => {
      const elem = testFixture.doc.createElement('div');
      testFixture.doc.body.appendChild(elem);
      expect(doubleclickIsA4AEnabled(mockWin, elem)).to.be.true;
    });

    it('should enable a4a when native crypto is not supported not CDN', () => {
      sandbox.stub(DoubleclickA4aEligibility.prototype,
          'isCdnProxy').callsFake(() => false);
      const elem = testFixture.doc.createElement('div');
      testFixture.doc.body.appendChild(elem);
      expect(doubleclickIsA4AEnabled(mockWin, elem)).to.be.true;
    });

    it('should allow FF on non-CDN pages', () => {
      sandbox.stub(DoubleclickA4aEligibility.prototype,
          'isCdnProxy').callsFake(() => false);
      const elem = testFixture.doc.createElement('div');
      testFixture.doc.body.appendChild(elem);
      const isA4aEnabled = doubleclickIsA4AEnabled(mockWin, elem);
      expect(isA4aEnabled).to.be.true;
      expect(elem.getAttribute(EXPERIMENT_ATTRIBUTE).includes(
          DOUBLECLICK_EXPERIMENT_FEATURE.CANONICAL_EXPERIMENT)).to.be.true;
    });

    it('should honor url forced FF on non-CDN', () => {
      mockWin.AMP_MODE = {test: false, localDev: true};
      mockWin.location = parseUrl(
          'https://foo.com/some/path/to/content.html?exp=a4a:-1');
      sandbox.stub(DoubleclickA4aEligibility.prototype,
          'isCdnProxy').callsFake(() => false);
      const elem = testFixture.doc.createElement('div');
      testFixture.doc.body.appendChild(elem);
      expect(doubleclickIsA4AEnabled(mockWin, elem)).to.be.true;
      expect(elem.getAttribute(EXPERIMENT_ATTRIBUTE)).to.equal(
          MANUAL_EXPERIMENT_ID);
    });

    /**
     * UseSameDomainRenderingUntilDeprecated is a flag that publishers can
     * specify that will force them out of Fast Fetch, and force that GPT is
     * used, not Glade. There have been many issues with this flag not being
     * correctly honored in the past. This test checks multiple different
     * ways that this test could be specified to assure they all work.
     */
    it('should use FF if useSameDomainRenderingUntilDeprecated in use', () => {
      // Ensure no selection in order to very experiment attribute.
      sandbox.stub(DoubleclickA4aEligibility.prototype, 'maybeSelectExperiment')
          .returns(null);
      mockWin.location = parseUrl(
          'https://cdn.ampproject.org/some/path/to/content.html');

      const elem1 = testFixture.doc.createElement('div');
      elem1.setAttribute(
          'json', '{"useSameDomainRenderingUntilDeprecated": 1}');
      testFixture.doc.body.appendChild(elem1);
      expect(doubleclickIsA4AEnabled(mockWin, elem1)).to.be.true;
      expect(elem1.getAttribute(EXPERIMENT_ATTRIBUTE)).to.not.be.ok;

      const elem2 = testFixture.doc.createElement('div');
      elem2.setAttribute(
          'data-use-same-domain-rendering-until-deprecated', '1');
      testFixture.doc.body.appendChild(elem2);
      expect(doubleclickIsA4AEnabled(mockWin, elem2)).to.be.true;
      expect(elem2.getAttribute(EXPERIMENT_ATTRIBUTE)).to.not.be.ok;
    });

    it('should use DF if USDRUD in use and in rollback', () => {
      toggleExperiment(
          mockWin, dfDepRollbackExperiment, true);
      // Ensure no selection in order to very experiment attribute.
      sandbox.stub(DoubleclickA4aEligibility.prototype, 'maybeSelectExperiment')
          .returns(null);
      mockWin.location = parseUrl(
          'https://cdn.ampproject.org/some/path/to/content.html');

      const elem1 = testFixture.doc.createElement('div');
      elem1.setAttribute(
          'json', '{"useSameDomainRenderingUntilDeprecated": 1}');
      testFixture.doc.body.appendChild(elem1);
      expect(doubleclickIsA4AEnabled(mockWin, elem1)).to.be.false;
      expect(elem1.getAttribute(EXPERIMENT_ATTRIBUTE)).to.not.be.ok;

      const elem2 = testFixture.doc.createElement('div');
      elem2.setAttribute(
          'data-use-same-domain-rendering-until-deprecated', '1');
      testFixture.doc.body.appendChild(elem2);
      expect(doubleclickIsA4AEnabled(mockWin, elem2)).to.be.false;
      expect(elem2.getAttribute(EXPERIMENT_ATTRIBUTE)).to.not.be.ok;
    });

    it('should use FF: DF_DEP HLDBK EXP | useRemoteHtml=false | ' +
       'hasUSDRUD=false', () => {
      // Ensure no selection in order to very experiment attribute.
      sandbox.stub(DoubleclickA4aEligibility.prototype, 'maybeSelectExperiment')
          .returns(null);
      mockWin.location = parseUrl(
          'https://cdn.ampproject.org/content.html?exp=da:6');
      const useRemoteHtml = false;
      const elem1 = testFixture.doc.createElement('div');
      elem1.setAttribute('type', 'doubleclick');
      testFixture.doc.body.appendChild(elem1);
      expect(doubleclickIsA4AEnabled(mockWin, elem1, useRemoteHtml)).to.be.true;
      expect(elem1.getAttribute(EXPERIMENT_ATTRIBUTE)).to.equal(
          DOUBLECLICK_EXPERIMENT_FEATURE.DF_DEP_HOLDBACK_EXPERIMENT);
    });

    it('should use DF: DF_DEP HLDBK EXP | useRemoteHtml=false | ' +
       'hasUSDRUD=true', () => {
      // Ensure no selection in order to very experiment attribute.
      sandbox.stub(DoubleclickA4aEligibility.prototype, 'maybeSelectExperiment')
          .returns(null);
      mockWin.location = parseUrl(
          'https://cdn.ampproject.org/content.html?exp=da:6');
      const useRemoteHtml = false;
      const elem1 = testFixture.doc.createElement('div');
      elem1.setAttribute('type', 'doubleclick');
      elem1.setAttribute(
          'json', '{"useSameDomainRenderingUntilDeprecated": 1}');
      testFixture.doc.body.appendChild(elem1);
      expect(doubleclickIsA4AEnabled(mockWin, elem1, useRemoteHtml)
      ).to.be.false;
      expect(elem1.getAttribute(EXPERIMENT_ATTRIBUTE)).to.equal(
          DOUBLECLICK_EXPERIMENT_FEATURE.DF_DEP_HOLDBACK_EXPERIMENT);
    });

    it('should use DF: DF_DEP HLDBK EXP | useRemoteHtml=true | ' +
       'hasUSDRUD=false', () => {
      // Ensure no selection in order to very experiment attribute.
      sandbox.stub(DoubleclickA4aEligibility.prototype, 'maybeSelectExperiment')
          .returns(null);
      mockWin.location = parseUrl(
          'https://cdn.ampproject.org/content.html?exp=da:6');
      const useRemoteHtml = true;
      const elem1 = testFixture.doc.createElement('div');
      elem1.setAttribute('type', 'doubleclick');
      testFixture.doc.body.appendChild(elem1);
      expect(doubleclickIsA4AEnabled(mockWin, elem1, useRemoteHtml)
      ).to.be.false;
      expect(elem1.getAttribute(EXPERIMENT_ATTRIBUTE)).to.equal(
          DOUBLECLICK_EXPERIMENT_FEATURE.DF_DEP_HOLDBACK_EXPERIMENT);
    });

    it('should use DF: DF_DEP HLDBK EXP | useRemoteHtml=true | ' +
       'hasUSDRUD=true', () => {
      // Ensure no selection in order to very experiment attribute.
      sandbox.stub(DoubleclickA4aEligibility.prototype, 'maybeSelectExperiment')
          .returns(null);
      mockWin.location = parseUrl(
          'https://cdn.ampproject.org/content.html?exp=da:6');
      const useRemoteHtml = true;
      const elem1 = testFixture.doc.createElement('div');
      elem1.setAttribute('type', 'doubleclick');
      elem1.setAttribute(
          'json', '{"useSameDomainRenderingUntilDeprecated": 1}');
      testFixture.doc.body.appendChild(elem1);
      expect(doubleclickIsA4AEnabled(mockWin, elem1, useRemoteHtml)
      ).to.be.false;
      expect(elem1.getAttribute(EXPERIMENT_ATTRIBUTE)).to.equal(
          DOUBLECLICK_EXPERIMENT_FEATURE.DF_DEP_HOLDBACK_EXPERIMENT);
    });

    Object.keys(URL_EXPERIMENT_MAPPING).forEach(expFlagValue => {
      it(`exp flag=${expFlagValue} should set eid attribute`, () => {
        mockWin.location = parseUrl(
            'https://cdn.ampproject.org/some/path/to/content.html?exp=a4a:' +
            String(expFlagValue));
        const elem = testFixture.doc.createElement('div');
        testFixture.doc.body.appendChild(elem);
        expect(doubleclickIsA4AEnabled(mockWin, elem)).to.be.true;
        if (expFlagValue == 0) {
          expect(elem.getAttribute(EXPERIMENT_ATTRIBUTE)).to.not.be.ok;
        } else {
          expect(elem.getAttribute(EXPERIMENT_ATTRIBUTE)).to.be.ok;
          expect(isInExperiment(elem, URL_EXPERIMENT_MAPPING[expFlagValue]))
              .to.be.true;
        }
      });
    });

    it('should select into unconditioned canonical holdback exp', () => {
      sandbox.stub(DoubleclickA4aEligibility.prototype,
          'isCdnProxy').callsFake(() => false);
      const elem = testFixture.doc.createElement('div');
      testFixture.doc.body.appendChild(elem);
      sandbox.stub(
          DoubleclickA4aEligibility.prototype,
          'maybeSelectExperiment').withArgs(
          mockWin, elem, [
            DOUBLECLICK_UNCONDITIONED_EXPERIMENTS.CANONICAL_HLDBK_CTL,
            DOUBLECLICK_UNCONDITIONED_EXPERIMENTS.CANONICAL_HLDBK_EXP],
          UNCONDITIONED_CANONICAL_FF_HOLDBACK_EXP_NAME)
          .returns(DOUBLECLICK_UNCONDITIONED_EXPERIMENTS.CANONICAL_HLDBK_EXP);
      expect(doubleclickIsA4AEnabled(mockWin, elem)).to.be.false;
      expect(elem.getAttribute(EXPERIMENT_ATTRIBUTE)).to.equal(
          DOUBLECLICK_UNCONDITIONED_EXPERIMENTS.CANONICAL_HLDBK_EXP);
    });
    it('should select into unconditioned canonical holdback ctl', () => {
      sandbox.stub(DoubleclickA4aEligibility.prototype,
          'isCdnProxy').callsFake(() => false);
      const elem = testFixture.doc.createElement('div');
      testFixture.doc.body.appendChild(elem);
      sandbox.stub(
          DoubleclickA4aEligibility.prototype,
          'maybeSelectExperiment').withArgs(
          mockWin, elem, [
            DOUBLECLICK_UNCONDITIONED_EXPERIMENTS.CANONICAL_HLDBK_CTL,
            DOUBLECLICK_UNCONDITIONED_EXPERIMENTS.CANONICAL_HLDBK_EXP],
          UNCONDITIONED_CANONICAL_FF_HOLDBACK_EXP_NAME)
          .returns(DOUBLECLICK_UNCONDITIONED_EXPERIMENTS.CANONICAL_HLDBK_CTL);
      expect(doubleclickIsA4AEnabled(mockWin, elem)).to.be.true;
      expect(elem.getAttribute(EXPERIMENT_ATTRIBUTE).includes(
          DOUBLECLICK_EXPERIMENT_FEATURE.CANONICAL_EXPERIMENT)).to.be.true;
      expect(elem.getAttribute(EXPERIMENT_ATTRIBUTE).includes(
          DOUBLECLICK_UNCONDITIONED_EXPERIMENTS.CANONICAL_HLDBK_CTL)
      ).to.be.true;
    });
  });
});
