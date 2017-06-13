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

import {ampdocServiceFor} from '../../../../src/ampdoc';
import {installDocService} from '../../../../src/service/ampdoc-impl';
import {
  addExperimentIdToElement,
  isInExperiment,
  isExternallyTriggeredExperiment,
  isInternallyTriggeredExperiment,
  validateExperimentIds,
  googleAdsIsA4AEnabled,
} from '../traffic-experiments';
import {
  RANDOM_NUMBER_GENERATORS,
  toggleExperiment,
  forceExperimentBranch,
} from '../../../../src/experiments';
import {installPlatformService} from '../../../../src/service/platform-impl';
import {installViewerServiceForDoc} from '../../../../src/service/viewer-impl';
import {
  registerServiceBuilder,
  resetServiceForTesting,
} from '../../../../src/service';
import {
  installDocumentStateService,
} from '../../../../src/service/document-state';
import {
  DOUBLECLICK_A4A_EXTERNAL_EXPERIMENT_BRANCHES_PRE_LAUNCH,
  DOUBLECLICK_A4A_INTERNAL_EXPERIMENT_BRANCHES_PRE_LAUNCH,
  DOUBLECLICK_A4A_EXTERNAL_EXPERIMENT_BRANCHES_POST_LAUNCH,
  DOUBLECLICK_A4A_INTERNAL_EXPERIMENT_BRANCHES_POST_LAUNCH,
  DOUBLECLICK_A4A_EXTERNAL_DELAYED_EXPERIMENT_BRANCHES_PRE_LAUNCH,
} from '../../../../extensions/amp-ad-network-doubleclick-impl/0.1/doubleclick-a4a-config.js'; // eslint-disable-line
import {EXPERIMENT_ATTRIBUTE} from '../utils';
import * as sinon from 'sinon';

describe('all-traffic-experiments-tests', () => {

  describes.realWin('#googleAdsIsA4AEnabled', {
    amp: {
      runtimeOn: true,
      ampdoc: 'single',
    },
  }, env => {
    let sandbox;
    let accurateRandomStub;
    let cachedAccuratePrng;
    let element;

    beforeEach(() => {
      const experimentFrequency = 1.0;
      sandbox = env.sandbox;
      sandbox.win = {
        location: {
          hostname: 'test.server.name.com',
        },
        AMP_CONFIG: {
          testExperimentId: experimentFrequency,
        },
        document: {
          cookie: null,
          querySelector: () => {},
        },
        crypto: {
          subtle: {},
        },
      };
      accurateRandomStub = sandbox.stub().returns(-1);
      cachedAccuratePrng = RANDOM_NUMBER_GENERATORS.accuratePrng;
      RANDOM_NUMBER_GENERATORS.accuratePrng = accurateRandomStub;

      element = document.createElement('div');
      env.win.document.body.appendChild(element);
    });

    afterEach(() => {
      sandbox.restore();
      RANDOM_NUMBER_GENERATORS.accuratePrng = cachedAccuratePrng;
    });

    it('should enable the external A4A experiment from the URL', () => {
      const externalBranches = {control: '12', experiment: '34'};
      const internalBranches = {control: '56', experiment: '78'};
      const externalDelayedBranches = {control: '90', experiment: '13'};

      sandbox.win.location.search = '?exp=a4a:2';

      const renderViaA4a = googleAdsIsA4AEnabled(
          sandbox.win, element, 'exp_name', externalBranches, internalBranches,
          externalDelayedBranches);
      expect(renderViaA4a).to.be.true;
      expect(isInExperiment(element, '12')).to.be.false;
      expect(isInExperiment(element, '34')).to.be.true;
      expect(isInExperiment(element, '56')).to.be.false;
      expect(isInExperiment(element, '78')).to.be.false;
      expect(isExternallyTriggeredExperiment(element)).to.be.true;
      expect(isInternallyTriggeredExperiment(element)).to.be.false;
    });

    it('should enable the external A4A control from the URL', () => {
      const externalBranches = {control: '12', experiment: '34'};
      const internalBranches = {control: '56', experiment: '78'};
      const externalDelayedBranches = {control: '90', experiment: '13'};

      sandbox.win.location.search = '?exp=a4a:1';

      const renderViaA4a = googleAdsIsA4AEnabled(
          sandbox.win, element, 'exp_name', externalBranches, internalBranches,
          externalDelayedBranches);
      expect(renderViaA4a).to.be.false;
      expect(isInExperiment(element, '12')).to.be.true;
      expect(isInExperiment(element, '34')).to.be.false;
      expect(isInExperiment(element, '56')).to.be.false;
      expect(isInExperiment(element, '78')).to.be.false;
      expect(isExternallyTriggeredExperiment(element)).to.be.true;
      expect(isInternallyTriggeredExperiment(element)).to.be.false;
    });

    it('should enable the internal A4A experiment', () => {
      toggleExperiment(sandbox.win, 'exp_name', true, true);
      const externalBranches = {control: '12', experiment: '34'};
      const internalBranches = {control: '56', experiment: '78'};
      const externalDelayedBranches = {control: '90', experiment: '13'};

      RANDOM_NUMBER_GENERATORS.accuratePrng.onFirstCall().returns(0.6);

      const renderViaA4a = googleAdsIsA4AEnabled(
          sandbox.win, element, 'exp_name', externalBranches, internalBranches,
          externalDelayedBranches);
      expect(renderViaA4a).to.be.true;
      expect(isInExperiment(element, '12')).to.be.false;
      expect(isInExperiment(element, '34')).to.be.false;
      expect(isInExperiment(element, '56')).to.be.false;
      expect(isInExperiment(element, '78')).to.be.true;
      expect(isExternallyTriggeredExperiment(element)).to.be.false;
      expect(isInternallyTriggeredExperiment(element)).to.be.true;
    });

    it('should enable the internal A4A control', () => {
      toggleExperiment(sandbox.win, 'exp_name', true, true);
      const externalBranches = {control: '12', experiment: '34'};
      const internalBranches = {control: '56', experiment: '78'};
      const externalDelayedBranches = {control: '90', experiment: '13'};

      RANDOM_NUMBER_GENERATORS.accuratePrng.onFirstCall().returns(0.3);

      const renderViaA4a = googleAdsIsA4AEnabled(
          sandbox.win, element, 'exp_name', externalBranches, internalBranches,
          externalDelayedBranches);
      expect(renderViaA4a).to.be.false;
      expect(isInExperiment(element, '12')).to.be.false;
      expect(isInExperiment(element, '34')).to.be.false;
      expect(isInExperiment(element, '56')).to.be.true;
      expect(isInExperiment(element, '78')).to.be.false;
      expect(isExternallyTriggeredExperiment(element)).to.be.false;
      expect(isInternallyTriggeredExperiment(element)).to.be.true;
    });
  });

  describe('#validateExperimentIds', () => {
    it('should return true for empty list', () => {
      expect(validateExperimentIds([])).to.be.true;
    });

    it('should return true for a singleton numeric list', () => {
      expect(validateExperimentIds(['3'])).to.be.true;
    });

    it('should return false for a singleton non-numeric list', () => {
      expect(validateExperimentIds(['blargh'])).to.be.false;
      expect(validateExperimentIds([''])).to.be.false;
    });

    it('should return true for a multi-item valid list', () => {
      expect(validateExperimentIds(['0', '1', '2', '3'])).to.be.true;
    });

    it('should return false for a multi-item invalid list', () => {
      expect(validateExperimentIds(['0', '1', 'k2', '3'])).to.be.false;
    });
  });

  describe('#addExperimentIdToElement', () => {
    it('should add attribute when there is none present to begin with', () => {
      const element = document.createElement('div');
      expect(element.getAttribute(EXPERIMENT_ATTRIBUTE)).to.not.be.ok;
      addExperimentIdToElement('3', element);
      expect(element.getAttribute(EXPERIMENT_ATTRIBUTE)).to.equal('3');
    });

    it('should append experiment to already valid single experiment', () => {
      const element = document.createElement('div');
      element.setAttribute(EXPERIMENT_ATTRIBUTE, '99');
      addExperimentIdToElement('3', element);
      expect(element.getAttribute(EXPERIMENT_ATTRIBUTE)).to.equal('99,3');
    });

    it('should append experiment to already valid multiple experiments', () => {
      const element = document.createElement('div');
      element.setAttribute(EXPERIMENT_ATTRIBUTE, '99,77,11,0122345');
      addExperimentIdToElement('3', element);
      expect(element.getAttribute(EXPERIMENT_ATTRIBUTE)).to.equal(
          '99,77,11,0122345,3');
    });

    it('should should replace existing invalid experiments', () => {
      const element = document.createElement('div');
      element.setAttribute(EXPERIMENT_ATTRIBUTE, '99,14,873,k,44');
      addExperimentIdToElement('3', element);
      expect(element.getAttribute(EXPERIMENT_ATTRIBUTE)).to.equal('3');
    });
  });

  describe('#isInExperiment', () => {
    it('should return false for empty element and any query', () => {
      const element = document.createElement('div');
      expect(isInExperiment(element, '')).to.be.false;
      expect(isInExperiment(element, null)).to.be.false;
      expect(isInExperiment(element, 'frob')).to.be.false;
    });
    it('should return false for empty attribute and any query', () => {
      const element = document.createElement('div');
      element.setAttribute(EXPERIMENT_ATTRIBUTE, '');
      expect(isInExperiment(element, '')).to.be.false;
      expect(isInExperiment(element, null)).to.be.false;
      expect(isInExperiment(element, 'frob')).to.be.false;
    });
    it('should return false for real data string but mismatching query', () => {
      const element = document.createElement('div');
      element.setAttribute(EXPERIMENT_ATTRIBUTE, 'frob,gunk,zort');
      expect(isInExperiment(element, 'blub')).to.be.false;
      expect(isInExperiment(element, 'ort')).to.be.false;
      expect(isInExperiment(element, 'fro')).to.be.false;
      expect(isInExperiment(element, 'gunk,zort')).to.be.false;
    });
    it('should return true for singleton data and matching query', () => {
      const element = document.createElement('div');
      element.setAttribute(EXPERIMENT_ATTRIBUTE, 'frob');
      expect(isInExperiment(element, 'frob')).to.be.true;
    });
    it('should return true for matching query', () => {
      const element = document.createElement('div');
      element.setAttribute(EXPERIMENT_ATTRIBUTE, 'frob,gunk,zort');
      expect(isInExperiment(element, 'frob')).to.be.true;
      expect(isInExperiment(element, 'gunk')).to.be.true;
      expect(isInExperiment(element, 'zort')).to.be.true;
    });
  });

  describe('A4A Launch Flags', () => {
    let sandbox;
    let win;
    let events;
    let element;
    let addEnabledExperimentSpy;

    beforeEach(() => {
      sandbox = sinon.sandbox.create();
      win = {
        AMP_MODE: {
          localDev: true,
        },
        location: {
          href: 'https://cdn.ampproject.org/fnord',
          pathname: '/fnord',
          origin: 'https://cdn.ampproject.org',
          hash: '',
          hostname: 'cdn.ampproject.org',
        },
        document: {
          nodeType: /* DOCUMENT */ 9,
          hidden: false,
          cookie: null,
          visibilityState: 'visible',
          addEventListener(type, listener) {
            events[type] = listener;
          },
        },
        crypto: {
          subtle: true,
          webkitSubtle: true,
        },
        navigator: window.navigator,
        pageExperimentBranches: {},
      };
      win.document.defaultView = win;
      installDocService(win, /* isSingleDoc */ true);
      const ampdoc = ampdocServiceFor(win).getAmpDoc();
      events = {};
      installDocumentStateService(win);
      installPlatformService(win);
      installViewerServiceForDoc(ampdoc);
      element = document.createElement('div');
      document.body.appendChild(element);
      addEnabledExperimentSpy = sandbox.stub();
      registerServiceBuilder(win, 'performance', function() {
        return {
          addEnabledExperiment: addEnabledExperimentSpy,
        };
      });
    });

    afterEach(() => {
      resetServiceForTesting(win, 'viewer');
      sandbox.restore();
      document.body.removeChild(element);
    });

    function expectCorrectBranchOnly(element, expectedBranchId) {
      const branchIds = [
        DOUBLECLICK_A4A_EXTERNAL_EXPERIMENT_BRANCHES_PRE_LAUNCH.control,
        DOUBLECLICK_A4A_EXTERNAL_EXPERIMENT_BRANCHES_PRE_LAUNCH.experiment,
        DOUBLECLICK_A4A_EXTERNAL_EXPERIMENT_BRANCHES_POST_LAUNCH.control,
        DOUBLECLICK_A4A_EXTERNAL_EXPERIMENT_BRANCHES_POST_LAUNCH.experiment,
        DOUBLECLICK_A4A_INTERNAL_EXPERIMENT_BRANCHES_PRE_LAUNCH.control,
        DOUBLECLICK_A4A_INTERNAL_EXPERIMENT_BRANCHES_PRE_LAUNCH.experiment,
        DOUBLECLICK_A4A_INTERNAL_EXPERIMENT_BRANCHES_POST_LAUNCH.control,
        DOUBLECLICK_A4A_INTERNAL_EXPERIMENT_BRANCHES_POST_LAUNCH.experiment,
      ];
      for (const bId in branchIds) {
        expect(isInExperiment(element, bId)).to.equal(bId === expectedBranchId);
      }
    }

    const tests = [
      {
        branchType: 'filler',
        adType: 'doubleclick',
        hasLaunched: false,
        shouldServeFastFetch: false,
        branchId: null,
      },
      {
        branchType: 'control',
        adType: 'doubleclick',
        hasLaunched: false,
        shouldServeFastFetch: false,
        branchId:
          DOUBLECLICK_A4A_EXTERNAL_EXPERIMENT_BRANCHES_PRE_LAUNCH.control,
      },
      {
        branchType: 'experiment',
        adType: 'doubleclick',
        hasLaunched: false,
        shouldServeFastFetch: true,
        branchId:
          DOUBLECLICK_A4A_EXTERNAL_EXPERIMENT_BRANCHES_PRE_LAUNCH.experiment,
      },
      {
        adType: 'doubleclick',
        hasLaunched: true,
        shouldServeFastFetch: true,
        branchType: 'filler',
        branchId: null,
      },
      {
        adType: 'doubleclick',
        hasLaunched: true,
        shouldServeFastFetch: true,
        branchType: 'control',
        branchId:
          DOUBLECLICK_A4A_EXTERNAL_EXPERIMENT_BRANCHES_POST_LAUNCH.control,
      },
      {
        adType: 'doubleclick',
        hasLaunched: true,
        shouldServeFastFetch: false,
        branchType: 'experiment',
        branchId:
          DOUBLECLICK_A4A_EXTERNAL_EXPERIMENT_BRANCHES_POST_LAUNCH.experiment,
      },
      {
        adType: 'doubleclick',
        hasLaunched: false,
        shouldServeFastFetch: false,
        urlParam: '?exp=a4a:0',
        branchType: 'filler',
        branchId: null,
      },
      {
        adType: 'doubleclick',
        hasLaunched: false,
        shouldServeFastFetch: false,
        urlParam: '?exp=a4a:1',
        branchType: 'control',
        branchId:
          DOUBLECLICK_A4A_EXTERNAL_EXPERIMENT_BRANCHES_PRE_LAUNCH.control,
      },
      {
        adType: 'doubleclick',
        hasLaunched: false,
        shouldServeFastFetch: true,
        urlParam: '?exp=a4a:2',
        branchType: 'experiment',
        branchId:
          DOUBLECLICK_A4A_EXTERNAL_EXPERIMENT_BRANCHES_PRE_LAUNCH.experiment,
      },
      {
        adType: 'doubleclick',
        hasLaunched: true,
        shouldServeFastFetch: true,
        urlParam: '?exp=a4a:0',
        branchType: 'filler',
        branchId: null,
      },
      {
        adType: 'doubleclick',
        hasLaunched: true,
        shouldServeFastFetch: true,
        urlParam: '?exp=a4a:1',
        branchType: 'control',
        branchId:
          DOUBLECLICK_A4A_EXTERNAL_EXPERIMENT_BRANCHES_POST_LAUNCH.control,
      },
      {
        adType: 'doubleclick',
        hasLaunched: true,
        shouldServeFastFetch: false,
        urlParam: '?exp=a4a:2',
        branchType: 'experiment',
        branchId:
          DOUBLECLICK_A4A_EXTERNAL_EXPERIMENT_BRANCHES_POST_LAUNCH.experiment,
      },
      // TODO(jonkeller): Need AdSense tests also
    ];

    tests.forEach(test => {
      const desc = 'should serve ' +
        `${test.shouldServeFastFetch ? 'Fast' : 'Delayed'} Fetch to ` +
        `${test.hasLaunched ? 'launched' : 'unlaunched'} ` +
        `${test.adType} ${test.branchType} ` +
        `${test.urlParam ? 'via URL ' : ''}`;
      it(desc, () => {
        element.setAttribute('type', test.adType);
        toggleExperiment(win, 'a4aFastFetchDoubleclickLaunched',
          test.hasLaunched, true);
        if (test.urlParam) {
          win.location.search = test.urlParam;
        } else if (test.branchId != null) {
          toggleExperiment(win, 'expDoubleclickA4A', true, true);
          forceExperimentBranch(win, 'expDoubleclickA4A', test.branchId);
        }
        const external = test.hasLaunched ?
          DOUBLECLICK_A4A_EXTERNAL_EXPERIMENT_BRANCHES_POST_LAUNCH :
          DOUBLECLICK_A4A_EXTERNAL_EXPERIMENT_BRANCHES_PRE_LAUNCH;
        const internal = test.hasLaunched ?
          DOUBLECLICK_A4A_INTERNAL_EXPERIMENT_BRANCHES_POST_LAUNCH :
          DOUBLECLICK_A4A_INTERNAL_EXPERIMENT_BRANCHES_PRE_LAUNCH;
        expect(googleAdsIsA4AEnabled(win, element, 'expDoubleclickA4A',
          external, internal,
          DOUBLECLICK_A4A_EXTERNAL_DELAYED_EXPERIMENT_BRANCHES_PRE_LAUNCH))
            .to.equal(test.shouldServeFastFetch);
        expectCorrectBranchOnly(element, test.branchId);
        expect(win.document.cookie).to.be.null;
        if (test.branchId) {
          expect(addEnabledExperimentSpy)
              .to.be.calledWith('expDoubleclickA4A-' + test.branchId);
        } else {
          expect(addEnabledExperimentSpy).to.not.be.called;
        }
      });
    });
  });
});
