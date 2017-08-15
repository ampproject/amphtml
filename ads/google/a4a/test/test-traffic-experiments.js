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
  addExperimentIdToElement,
  isInExperiment,
  validateExperimentIds,
  googleAdsIsA4AEnabled,
} from '../traffic-experiments';
import {
  RANDOM_NUMBER_GENERATORS,
  toggleExperiment,
} from '../../../../src/experiments';
import {EXPERIMENT_ATTRIBUTE} from '../utils';

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
          origin: 'https://cdn.ampproject.org',
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
    });

    it('should use AdSense specific A4A experiment from URL', () => {
      element.setAttribute('type', 'adsense');
      const externalBranches = {control: '12', experiment: '34'};
      const internalBranches = {control: '56', experiment: '78'};
      const externalDelayedBranches = {control: '90', experiment: '13'};

      sandbox.win.location.search = '?exp=a4a:1,aa:2,da:0';

      const renderViaA4a = googleAdsIsA4AEnabled(
          sandbox.win, element, 'exp_name', externalBranches, internalBranches,
          externalDelayedBranches);
      expect(renderViaA4a).to.be.true;
      expect(isInExperiment(element, '12')).to.be.false;
      expect(isInExperiment(element, '34')).to.be.true;
    });

    it('should use Doubleclick specific A4A experiment from URL', () => {
      element.setAttribute('type', 'doubleclick');
      const externalBranches = {control: '12', experiment: '34'};
      const internalBranches = {control: '56', experiment: '78'};
      const externalDelayedBranches = {control: '90', experiment: '13'};

      sandbox.win.location.search = '?exp=a4a:0,aa:1,da:2';

      const renderViaA4a = googleAdsIsA4AEnabled(
          sandbox.win, element, 'exp_name', externalBranches, internalBranches,
          externalDelayedBranches);
      expect(renderViaA4a).to.be.true;
      expect(isInExperiment(element, '12')).to.be.false;
      expect(isInExperiment(element, '34')).to.be.true;
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
});
