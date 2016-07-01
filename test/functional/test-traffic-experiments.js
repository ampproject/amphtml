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
  EXPERIMENT_ATTRIBUTE,
  RANDOM_NUMBER_GENERATORS,
  addExperimentIdToElement,
  getPageExperimentBranch,
  mergeExperimentIds,
  setupPageExperiments,
  validateExperimentIds,
} from '../../ads/google/a4a/traffic-experiments';
import {
  isExperimentOn,
  resetExperimentToggles_,
} from '../../src/experiments';
import {dev} from '../../src/log';
import * as sinon from 'sinon';

/** @private @const Tag used in dev log messages */
const TAG_ = 'test-amp-ad';

describe('all-traffic-experiments-tests', () => {

  describe('#setupPageExperiments', () => {
    let sandbox;
    let accurateRandomStub;
    let cachedAccuratePrng;
    let testExperimentSet;
    beforeEach(() => {
      const experimentFrequency = 1.0;
      testExperimentSet = {
        testExperimentId: {
          control: 'control_branch_id',
          experiment: 'experiment_branch_id',
        },
      };
      sandbox = sinon.sandbox.create();
      sandbox.win = {
        location: {
          hostname: 'test.server.name.com',
        },
        AMP_CONFIG: {
          testExperimentId: experimentFrequency,
        },
        document: {
          cookie: null,
        },
      };
      accurateRandomStub = sandbox.stub().returns(-1);
      cachedAccuratePrng = RANDOM_NUMBER_GENERATORS.accuratePrng;
      RANDOM_NUMBER_GENERATORS.accuratePrng = accurateRandomStub;
      // Clear any experiment state that happens to be left around.
      resetExperimentToggles_();
    });
    afterEach(() => {
      sandbox.restore();
      RANDOM_NUMBER_GENERATORS.accuratePrng = cachedAccuratePrng;
    });

    it('handles empty experiments list', () => {
      // Opt out of experiment.
      sandbox.win.AMP_CONFIG['testExperimentId'] = 0.0;
      setupPageExperiments(sandbox.win, {});
      expect(isExperimentOn(sandbox.win, 'testExperimentId'),
          'experiment is on').to.be.false;
      expect(sandbox.win.pageExperimentBranches).to.be.empty;
    });
    it('handles experiment not diverted path', () => {
      // Opt out of experiment.
      sandbox.win.AMP_CONFIG['testExperimentId'] = 0.0;
      setupPageExperiments(sandbox.win, testExperimentSet);
      expect(isExperimentOn(sandbox.win, 'testExperimentId'),
          'experiment is on').to.be.false;
      expect(getPageExperimentBranch(sandbox.win,
          'testExperimentId')).to.not.be.ok;
    });
    it('handles experiment diverted path: control', () => {
      // Force experiment on by setting its triggering probability to 1, then
      // force the control branch to be chosen by making the accurate PRNG
      // return a value < 0.5.
      sandbox.win.AMP_CONFIG['testExperimentId'] = 1.0;
      RANDOM_NUMBER_GENERATORS.accuratePrng.onFirstCall().returns(0.3);
      setupPageExperiments(sandbox.win, testExperimentSet);
      expect(isExperimentOn(sandbox.win, 'testExperimentId'),
          'experiment is on').to.be.true;
      expect(getPageExperimentBranch(sandbox.win, 'testExperimentId')).to.equal(
          testExperimentSet['testExperimentId'].control);
    });
    it('handles experiment diverted path: experiment', () => {
      // Force experiment on by setting its triggering probability to 1, then
      // force the experiment branch to be chosen by making the accurate PRNG
      // return a value > 0.5.
      sandbox.win.AMP_CONFIG['testExperimentId'] = 1.0;
      RANDOM_NUMBER_GENERATORS.accuratePrng.onFirstCall().returns(0.6);
      setupPageExperiments(sandbox.win, testExperimentSet);
      expect(isExperimentOn(sandbox.win, 'testExperimentId'),
          'experiment is on').to.be.true;
      expect(getPageExperimentBranch(sandbox.win, 'testExperimentId')).to.equal(
          testExperimentSet['testExperimentId'].experiment);
    });
    it('handles multiple experiments', () => {
      sandbox.win.AMP_CONFIG = {};
      const config = sandbox.win.AMP_CONFIG;
      config['expt_0'] = 1.0;
      config['expt_1'] = 0.0;
      config['expt_2'] = 1.0;
      config['expt_3'] = 1.0;
      const experimentInfo = {
        'expt_0': {
          control: '0_c',
          experiment: '0_e',
        },
        'expt_1': {
          control: '1_c',
          experiment: '1_e',
        },
        'expt_2': {
          control: '2_c',
          experiment: '2_e',
        },
        // expt_3 omitted.
      };
      RANDOM_NUMBER_GENERATORS.accuratePrng.returns(0.6);
      setupPageExperiments(sandbox.win, experimentInfo);
      expect(isExperimentOn(sandbox.win, 'expt_0'),
          'expt_0 is on').to.be.true;
      expect(isExperimentOn(sandbox.win, 'expt_1'),
          'expt_1 is on').to.be.false;
      expect(isExperimentOn(sandbox.win, 'expt_2'),
          'expt_2 is on').to.be.true;
      // Note: calling isExperimentOn('expt_3') would actually evaluate the
      // frequency for expt_3, possibly enabling it.  Since we wanted it to be
      // omitted altogether, we'll evaluate it only via its branch.
      expect(getPageExperimentBranch(sandbox.win, 'expt_0')).to.equal(
          '0_e');
      expect(getPageExperimentBranch(sandbox.win, 'expt_1')).to.not.be.ok;
      expect(getPageExperimentBranch(sandbox.win, 'expt_2')).to.equal(
          '2_e');
      expect(getPageExperimentBranch(sandbox.win, 'expt_3')).to.not.be.ok;
    });
    it('handles multi-way branches', () => {
      dev.info(TAG_, 'Testing multi-way branches');
      sandbox.win.AMP_CONFIG = {};
      const config = sandbox.win.AMP_CONFIG;
      config['expt_0'] = 1.0;
      const experimentInfo = {
        'expt_0': {
          b0: '0_0',
          b1: '0_1',
          b2: '0_2',
          b3: '0_3',
          b4: '0_4',
        },
      };
      RANDOM_NUMBER_GENERATORS.accuratePrng.returns(0.7);
      setupPageExperiments(sandbox.win, experimentInfo);
      expect(isExperimentOn(sandbox.win, 'expt_0'),
          'expt_0 is on').to.be.true;
      expect(getPageExperimentBranch(sandbox.win, 'expt_0')).to.equal(
          '0_3');
    });
    it('handles multiple experiments with multi-way branches', () => {
      sandbox.win.AMP_CONFIG = {};
      const config = sandbox.win.AMP_CONFIG;
      config['expt_0'] = 1.0;
      config['expt_1'] = 0.0;
      config['expt_2'] = 1.0;
      config['expt_3'] = 1.0;
      const experimentInfo = {
        'expt_0': {
          b0: '0_0',
          b1: '0_1',
          b2: '0_2',
          b3: '0_3',
          b4: '0_4',
        },
        'expt_1': {
          b0: '1_0',
          b1: '1_1',
          b2: '1_2',
          b3: '1_3',
          b4: '1_4',
        },
        'expt_2': {
          b0: '2_0',
          b1: '2_1',
          b2: '2_2',
          b3: '2_3',
          b4: '2_4',
        },
      };
      RANDOM_NUMBER_GENERATORS.accuratePrng.onFirstCall().returns(0.7);
      RANDOM_NUMBER_GENERATORS.accuratePrng.onSecondCall().returns(0.3);
      setupPageExperiments(sandbox.win, experimentInfo);
      expect(isExperimentOn(sandbox.win, 'expt_0'),
          'expt_0 is on').to.be.true;
      expect(isExperimentOn(sandbox.win, 'expt_1'),
          'expt_1 is on').to.be.false;
      expect(isExperimentOn(sandbox.win, 'expt_2'),
          'expt_2 is on').to.be.true;
      // Note: calling isExperimentOn('expt_3') would actually evaluate the
      // frequency for expt_3, possibly enabling it.  Since we wanted it to be
      // omitted altogether, we'll evaluate it only via its branch.
      expect(getPageExperimentBranch(sandbox.win, 'expt_0')).to.equal(
          '0_3');
      expect(getPageExperimentBranch(sandbox.win, 'expt_1')).to.not.be.ok;
      expect(getPageExperimentBranch(sandbox.win, 'expt_2')).to.equal(
          '2_1');
      expect(getPageExperimentBranch(sandbox.win, 'expt_3')).to.not.be.ok;
    });

    it('should not process the same experiment twice', () => {
      const exptAInfo = {
        'fooExpt': {
          control: '012345',
          experiment: '987654',
        },
      };
      const exptBInfo = {
        'fooExpt': {
          control: '246810',
          experiment: '108642',
        },
      };
      sandbox.win.AMP_CONFIG = {};
      const config = sandbox.win.AMP_CONFIG;
      config['fooExpt'] = 0.0;
      setupPageExperiments(sandbox.win, exptAInfo);
      config['fooExpt'] = 1.0;
      setupPageExperiments(sandbox.win, exptBInfo);
      // Even though we tried to set up a second time, using a config
      // parameter that should ensure that the experiment was activated, the
      // experiment framework should evaluate each experiment only once per
      // page and should not enable it.
      expect(isExperimentOn(sandbox.win, 'fooExpt')).to.be.false;
      expect(getPageExperimentBranch(sandbox.win, 'fooExpt')).to.not.be.ok;
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

  describe('#mergeExperimentIds', () => {
    it('should merge a single id to itself', () => {
      expect(mergeExperimentIds('12345')).to.equal('12345');
    });
    it('should merge a single ID to a list', () => {
      expect(mergeExperimentIds('12345', '3,4,5,6')).to.equal('3,4,5,6,12345');
    });
    it('should discard invalid ID', () => {
      expect(mergeExperimentIds('frob', '3,4,5,6')).to.equal('3,4,5,6');
    });
    it('should return empty string for invalid input', () => {
      expect(mergeExperimentIds('frob')).to.equal('');
    });
  });
});
