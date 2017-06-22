/**
 * Copyright 2015 The AMP HTML Authors. All Rights Reserved.
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
  publicJwk,
  correctToken,
  tokenWithBadVersion,
  tokenWithBadConfigLength,
  tokenWithBadSignature,
  tokenWithExpiredExperiment,
} from './testdata-experiments';
import {cryptoFor} from '../../src/crypto';
import {installCryptoService} from '../../src/service/crypto-impl';
import {
  enableExperimentsForOriginTrials,
  isCanary,
  isExperimentOn,
  isExperimentOnForOriginTrial,
  experimentToggles,
  toggleExperiment,
  resetExperimentTogglesForTesting,
  getExperimentToglesFromCookieForTesting,
  RANDOM_NUMBER_GENERATORS,
  getExperimentBranch,
  randomlySelectUnsetExperiments,
} from '../../src/experiments';
import {createElementWithAttributes} from '../../src/dom';
import {user} from '../../src/log';
import * as sinon from 'sinon';

describe('experimentToggles', () => {
  it('should return experiment status map', () => {
    const win = {
      document: {
        cookie: 'AMP_EXP=-exp3,exp4,exp5',
      },
      AMP_CONFIG: {
        exp1: 1,
        exp2: 0,
        exp3: 1,
        exp4: 0,
        v: '12345667',
      },
    };
    resetExperimentTogglesForTesting(window);
    expect(experimentToggles(win)).to.deep.equal({
      exp1: true,
      exp2: false,
      exp3: false, // overridden in cookie
      exp4: true, // overridden in cookie
      exp5: true,
      // "v" should not appear here
    });
  });
});

describe('isExperimentOn', () => {
  let win;
  let sandbox;

  beforeEach(() => {
    sandbox = sinon.sandbox.create();
    win = {
      document: {
        cookie: '',
      },
      AMP_CONFIG: {},
      location: {
        hash: '',
      },
    };
  });

  afterEach(() => {
    sandbox.restore();
  });

  function expectExperiment(cookieString, experimentId) {
    resetExperimentTogglesForTesting(window);
    win.document.cookie = cookieString;
    return expect(isExperimentOn(win, experimentId));
  }

  describe('with only cookie flag', () => {

    it('should return "off" with no cookies, malformed or empty', () => {
      expectExperiment(null, 'e1').to.be.false;
      expectExperiment(undefined, 'e1').to.be.false;
      expectExperiment('', 'e1').to.be.false;
      expectExperiment('AMP_EXP', 'e1').to.be.false;
      expectExperiment('AMP_EXP=', 'e1').to.be.false;
    });

    it('should return "off" when value is not in the list', () => {
      expectExperiment('AMP_EXP=e1a,e2', 'e1').to.be.false;
    });

    it('should return "on" when value is in the list', () => {
      expectExperiment('AMP_EXP=e1', 'e1').to.be.true;
      expectExperiment('AMP_EXP=e1,e2', 'e1').to.be.true;
      expectExperiment('AMP_EXP=e2,e1', 'e1').to.be.true;
      expectExperiment('AMP_EXP=e2 , e1', 'e1').to.be.true;
    });

    it('should return "off" when disabling value is in the list', () => {
      expectExperiment('AMP_EXP=-e1', 'e1').to.be.false;
      expectExperiment('AMP_EXP=e2,-e1', 'e1').to.be.false;
      expectExperiment('AMP_EXP=-e1,e2', 'e1').to.be.false;
      expectExperiment('AMP_EXP=e2 , -e1', 'e1').to.be.false;
    });
  });

  describe('with global flag', () => {

    it('should prioritize cookie flag', () => {
      win.AMP_CONFIG['e1'] = true;
      expectExperiment('AMP_EXP=e1', 'e1').to.be.true;
    });

    it('should fall back to global flag', () => {
      const cookie = 'AMP_EXP=e2,e4';
      win.AMP_CONFIG['e1'] = 1;
      win.AMP_CONFIG['e2'] = 1;
      win.AMP_CONFIG['e3'] = 0;
      win.AMP_CONFIG['e4'] = 0;
      expectExperiment(cookie, 'e1').to.be.true;
      expectExperiment(cookie, 'e2').to.be.true;
      expectExperiment(cookie, 'e3').to.be.false;
      expectExperiment(cookie, 'e4').to.be.true;
    });

    it('should return "off" when disabling value is in the list', () => {
      win.AMP_CONFIG['e1'] = true;
      expectExperiment('AMP_EXP=-e1', 'e1').to.be.false;
    });

    it('should return "off" when not in cookie flag or global flag', () => {
      expectExperiment('AMP_EXP=', 'e1').to.be.false;
    });

    it('should calc if experiment should be "on"', () => {
      win.AMP_CONFIG['e1'] = 1;
      expectExperiment('', 'e1').to.be.true;

      win.AMP_CONFIG['e2'] = 0;
      expectExperiment('', 'e2').to.be.false;

      sandbox.stub(Math, 'random').returns(0.5);
      win.AMP_CONFIG['e3'] = 0.3;
      expectExperiment('', 'e3').to.be.false;

      win.AMP_CONFIG['e4'] = 0.6;
      expectExperiment('', 'e4').to.be.true;

      win.AMP_CONFIG['e5'] = 0.5;
      expectExperiment('', 'e5').to.be.false;

      win.AMP_CONFIG['e6'] = 0.51;
      expectExperiment('', 'e6').to.be.true;
    });

    it('should cache calc value', () => {
      sandbox.stub(Math, 'random').returns(0.4);
      win.AMP_CONFIG['e1'] = 0.5;
      win.AMP_CONFIG['e2'] = 0.1;

      expectExperiment('', 'e1').to.be.true;
      expectExperiment('', 'e2').to.be.false;
    });
  });
});

describe('toggleExperiment', () => {

  let sandbox;
  let clock;
  let expTime;

  beforeEach(() => {
    sandbox = sinon.sandbox.create();
    clock = sandbox.useFakeTimers();
    clock.tick(1);
    expTime = new Date(1 + 180 * 24 * 60 * 60 * 1000).toUTCString();
  });

  afterEach(() => {
    sandbox.restore();
    resetExperimentTogglesForTesting(window);
  });

  function expectToggle(cookiesString, experimentId, opt_on) {
    const doc = {
      cookie: cookiesString,
    };
    resetExperimentTogglesForTesting(window);
    const on = toggleExperiment({
      document: doc,
      location: {
        hostname: 'test.test',
        href: 'https://test.test/test.html',
      },
    }, experimentId, opt_on);
    const parts = doc.cookie.split(/\s*;\s*/g);
    if (parts.length > 1) {
      expect(parts[1]).to.equal('path=/');
      expect(parts[2]).to.equal('domain=test.test');
      expect(parts[3]).to.equal('expires=' + expTime);
    }
    return expect(`${on}; ${decodeURIComponent(parts[0])}`);
  }

  it('should toggle to "on" with no cookies, malformed or empty', () => {
    expectToggle(null, 'e1').to.equal('true; AMP_EXP=e1');
    expectToggle(undefined, 'e2').to.equal('true; AMP_EXP=e2');
    expectToggle('', 'e3').to.equal('true; AMP_EXP=e3');
    expectToggle('AMP_EXP', 'e4').to.equal('true; AMP_EXP=e4');
    expectToggle('AMP_EXP=', 'e5').to.equal('true; AMP_EXP=e5');
  });

  it('should toggle "on" when value is not in the list', () => {
    expectToggle('AMP_EXP=e1a,e2', 'e1').to.equal('true; AMP_EXP=e1a,e2,e1');
  });

  it('should toggle "off" when value is in the list', () => {
    expectToggle('AMP_EXP=e1', 'e1').to.equal('false; AMP_EXP=-e1');
    expectToggle('AMP_EXP=e1,e2', 'e1').to.equal('false; AMP_EXP=-e1,e2');
    expectToggle('AMP_EXP=e2,e1', 'e1').to.equal('false; AMP_EXP=e2,-e1');
  });

  it('should set "on" when requested', () => {
    expectToggle('AMP_EXP=e2', 'e1', true).to.equal('true; AMP_EXP=e2,e1');
    expectToggle('AMP_EXP=e1', 'e1', true).to.equal('true; AMP_EXP=e1');
  });

  it('should set "off" when requested', () => {
    expectToggle(
        'AMP_EXP=e2,e1', 'e1', false).to.equal('false; AMP_EXP=e2,-e1');
    expectToggle('AMP_EXP=e1', 'e1', false).to.equal('false; AMP_EXP=-e1');
  });

  it('should not set cookies when toggling and transientExperiment', () => {
    const win = {
      document: {
        cookie: '',
      },
    };
    toggleExperiment(win, 'e1', true, true);
    expect(win.document.cookie).to.equal('');
    toggleExperiment(win, 'e2', false, true);
    expect(win.document.cookie).to.equal('');
    toggleExperiment(win, 'e3', undefined, true);
    expect(win.document.cookie).to.equal('');
    // But all of those experiment states should be durable in the window
    // environment.
    expect(isExperimentOn(win, 'e1'), 'e1 is on').to.be.true;
    expect(isExperimentOn(win, 'e2'), 'e2 is off').to.be.false;
    expect(isExperimentOn(win, 'e3'), 'e3 is on').to.be.true;
    toggleExperiment(win, 'e1', false, true);
    expect(win.document.cookie).to.equal('');
    toggleExperiment(win, 'e2', true, true);
    expect(win.document.cookie).to.equal('');
    toggleExperiment(win, 'e3', undefined, true);
    expect(win.document.cookie).to.equal('');
    expect(isExperimentOn(win, 'e1'), 'e1 is off').to.be.false;
    expect(isExperimentOn(win, 'e2'), 'e2 is on').to.be.true;
    expect(isExperimentOn(win, 'e3'), 'e3 is off').to.be.false;
  });

  it('should set cookies when toggling and !transientExperiment', () => {
    const win = {
      document: {
        cookie: '',
      },
      location: {
        hostname: 'test.test',
        href: 'https://test.test/test.html',
      },
    };
    toggleExperiment(win, 'transient', true, true);
    toggleExperiment(win, 'e1', true);
    toggleExperiment(win, 'e2', true, false);
    toggleExperiment(win, 'e3', true, undefined);
    toggleExperiment(win, 'e4', undefined, false);

    expect(getExperimentToglesFromCookieForTesting(win))
        .to.not.have.property('transient');
    expect(getExperimentToglesFromCookieForTesting(win))
        .to.have.property('e1', true);
    expect(getExperimentToglesFromCookieForTesting(win))
        .to.have.property('e2', true);
    expect(getExperimentToglesFromCookieForTesting(win))
        .to.have.property('e3', true);
    expect(getExperimentToglesFromCookieForTesting(win))
        .to.have.property('e4', true);

    // All of those experiment states should be durable in the window
    // environment.
    expect(isExperimentOn(win, 'transient'), 'transient is on').to.be.true;
    expect(isExperimentOn(win, 'e1'), 'e1 is on').to.be.true;
    expect(isExperimentOn(win, 'e2'), 'e2 is on').to.be.true;
    expect(isExperimentOn(win, 'e3'), 'e3 is on').to.be.true;
    expect(isExperimentOn(win, 'e4'), 'e4 is on').to.be.true;

    toggleExperiment(win, 'transient', false, true);
    toggleExperiment(win, 'e1', false);
    toggleExperiment(win, 'e2', false, false);
    toggleExperiment(win, 'e3', false, undefined);
    toggleExperiment(win, 'e4', undefined, false);

    expect(getExperimentToglesFromCookieForTesting(win))
        .to.not.have.property('transient');
    expect(getExperimentToglesFromCookieForTesting(win))
        .to.have.property('e1', false);
    expect(getExperimentToglesFromCookieForTesting(win))
        .to.have.property('e2', false);
    expect(getExperimentToglesFromCookieForTesting(win))
        .to.have.property('e3', false);
    expect(getExperimentToglesFromCookieForTesting(win))
        .to.have.property('e4', false);

    expect(isExperimentOn(win, 'transient'), 'transient is on').to.be.false;
    expect(isExperimentOn(win, 'e1'), 'e1 is on').to.be.false;
    expect(isExperimentOn(win, 'e2'), 'e2 is on').to.be.false;
    expect(isExperimentOn(win, 'e3'), 'e3 is on').to.be.false;
    expect(isExperimentOn(win, 'e4'), 'e4 is on').to.be.false;
  });

  it('should not mess up cookies when toggling w/o setting cookie ', () => {
    const win = {
      document: {
        cookie: '',
      },
      location: {
        hostname: 'test.test',
        href: 'https://test.test/test.html',
      },
    };
    // Make sure some experiments are enabled in the cookie.
    toggleExperiment(win, 'e0', true);
    toggleExperiment(win, 'e1', true);
    toggleExperiment(win, 'e2', true);
    toggleExperiment(win, 'e3', true);
    expect(win.document.cookie).to.contain('e0');
    expect(win.document.cookie).to.contain('e1');
    expect(win.document.cookie).to.contain('e2');
    expect(win.document.cookie).to.contain('e3');
    expect(isExperimentOn(win, 'e0'), 'e0').to.be.true;
    expect(isExperimentOn(win, 'e1'), 'e1').to.be.true;
    expect(isExperimentOn(win, 'e2'), 'e2').to.be.true;
    expect(isExperimentOn(win, 'e3'), 'e3').to.be.true;
    toggleExperiment(win, 'x0', false, true);
    toggleExperiment(win, 'x1', true, true);
    toggleExperiment(win, 'x2', undefined, true);
    expect(win.document.cookie).to.contain('e0');
    expect(win.document.cookie).to.contain('e1');
    expect(win.document.cookie).to.contain('e2');
    expect(win.document.cookie).to.contain('e3');
    expect(win.document.cookie).to.not.contain('x0');
    expect(win.document.cookie).to.not.contain('x1');
    expect(win.document.cookie).to.not.contain('x2');
    expect(isExperimentOn(win, 'x0'), 'x0').to.be.false;
    expect(isExperimentOn(win, 'x1'), 'x1').to.be.true;
    expect(isExperimentOn(win, 'x2'), 'x2').to.be.true;
    // The toggle(win, foo, false) cases here should hit the 'foo not in
    // EXPERIMENT_TOGGLES' cases in toggleExperiments.
    toggleExperiment(win, 'e4', false);
    toggleExperiment(win, 'e5', true);
    toggleExperiment(win, 'e6', false);
    expect(win.document.cookie).to.contain('e0');
    expect(win.document.cookie).to.contain('e1');
    expect(win.document.cookie).to.contain('e2');
    expect(win.document.cookie).to.contain('e3');
    expect(win.document.cookie).to.not.contain('e4');
    expect(win.document.cookie).to.contain('e5');
    expect(win.document.cookie).to.not.contain('e6');
    expect(isExperimentOn(win, 'e4'), 'e4').to.be.false;
    expect(isExperimentOn(win, 'e5'), 'e5').to.be.true;
    expect(isExperimentOn(win, 'e6'), 'e6').to.be.false;
  });

  it('should override global settings', () => {
    const win = {
      document: {
        cookie: '',
      },
      'AMP_CONFIG': {
        'e1': 1,
      },
      location: {
        hostname: 'test.test',
      },
    };

    // e1 is on, according to the AMP_CONFIG global setting
    expect(isExperimentOn(win, 'e1')).to.be.true;
    // toggleExperiment should override the global setting
    expect(toggleExperiment(win, 'e1')).to.be.false;
    expect(isExperimentOn(win, 'e1')).to.be.false;

    // The new setting should be persisted in cookie, so cache reset should not
    // affect its status.
    resetExperimentTogglesForTesting(window);
    expect(isExperimentOn(win, 'e1')).to.be.false;

    // Now let's explicitly toggle to true
    expect(toggleExperiment(win, 'e1', true)).to.be.true;
    expect(isExperimentOn(win, 'e1')).to.be.true;
    resetExperimentTogglesForTesting(window);
    expect(isExperimentOn(win, 'e1')).to.be.true;

    // Toggle transiently should still work
    expect(toggleExperiment(win, 'e1', false, true)).to.be.false;
    expect(isExperimentOn(win, 'e1')).to.be.false;
    resetExperimentTogglesForTesting(window); // cache reset should bring it back to true
    expect(isExperimentOn(win, 'e1')).to.be.true;

    // Sanity check, the global setting should never be changed.
    expect(win.AMP_CONFIG.e1).to.equal(1);
  });
});

describes.realWin('meta override', {}, env => {

  let win;

  beforeEach(() => {
    win = env.win;
  });

  it('should allow override iff the experiment is whitelisted', () => {
    win.AMP_CONFIG = {
      'allow-doc-opt-in': ['e1', 'e3'],
      e1: 0,
      e2: 0,
    };

    win.document.head.appendChild(
        createElementWithAttributes(win.document, 'meta', {
          name: 'amp-experiments-opt-in',
          content: 'e1,e2,e3',
        }));

    resetExperimentTogglesForTesting(window);

    expect(isExperimentOn(win, 'e1')).to.be.true;
    expect(isExperimentOn(win, 'e2')).to.be.false; // e2 is not whitelisted
    expect(isExperimentOn(win, 'e3')).to.be.true;

    toggleExperiment(win, 'e1', false);
    toggleExperiment(win, 'e2', true);
    toggleExperiment(win, 'e3', false);
    expect(isExperimentOn(win, 'e1')).to.be.false;
    expect(isExperimentOn(win, 'e2')).to.be.true;
    expect(isExperimentOn(win, 'e3')).to.be.false;
  });
});

describes.fakeWin('url override', {}, env => {

  let win;

  beforeEach(() => {
    win = env.win;
  });

  it('should allow override iff the experiment is whitelisted', () => {
    win.AMP_CONFIG = {
      'allow-url-opt-in': ['e1', 'e3', 'e4', 'e6', 'e7', 'e8'],
      e1: 0,
      e2: 0,
      e4: 1,
      e5: 1,
    };
    delete win.location.originalHash;
    win.location.href = '#e-e1=1&e-e2=1&e-e3=1&e-e4=0&e-e5=0&e-e6=0&e-e7=1' +
        '&e-e8=0';
    win.document.cookie = 'AMP_EXP=-e7,e8';

    resetExperimentTogglesForTesting(window);

    expect(isExperimentOn(win, 'e1')).to.be.true;
    expect(isExperimentOn(win, 'e2')).to.be.false; // e2 is not whitelisted
    expect(isExperimentOn(win, 'e3')).to.be.true;
    expect(isExperimentOn(win, 'e4')).to.be.false;
    expect(isExperimentOn(win, 'e5')).to.be.true; // e5 is not whitelisted
    expect(isExperimentOn(win, 'e6')).to.be.false;
    expect(isExperimentOn(win, 'e7')).to.be.true; // overrides cookies
    expect(isExperimentOn(win, 'e8')).to.be.false; // overrides cookies

    toggleExperiment(win, 'e1', false);
    toggleExperiment(win, 'e2', true);
    toggleExperiment(win, 'e3', false);
    toggleExperiment(win, 'e4', true);
    toggleExperiment(win, 'e5', false);
    toggleExperiment(win, 'e6', true);
    toggleExperiment(win, 'e7', false);
    toggleExperiment(win, 'e8', true);
    expect(isExperimentOn(win, 'e1')).to.be.false;
    expect(isExperimentOn(win, 'e2')).to.be.true;
    expect(isExperimentOn(win, 'e3')).to.be.false;
    expect(isExperimentOn(win, 'e4')).to.be.true;
    expect(isExperimentOn(win, 'e5')).to.be.false;
    expect(isExperimentOn(win, 'e6')).to.be.true;
    expect(isExperimentOn(win, 'e7')).to.be.false;
    expect(isExperimentOn(win, 'e8')).to.be.true;
  });
});

describe('isCanary', () => {

  it('should return value based on binary version', () => {
    const win = {
      AMP_CONFIG: {
        canary: 0,
      },
    };
    expect(isCanary(win)).to.be.false;
    win.AMP_CONFIG.canary = 1;
    expect(isCanary(win)).to.be.true;
  });
});

describe('experiment branch tests', () => {

  describe('#randomlySelectUnsetExperiments', () => {
    let sandbox;
    let accurateRandomStub;
    let cachedAccuratePrng;
    let testExperimentSet;

    beforeEach(() => {
      const experimentFrequency = 1.0;
      testExperimentSet = {
        testExperimentId: {
          isTrafficEligible: () => true,
          branches: ['branch1_id', 'branch2_id'],
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
          querySelector: () => {},
        },
      };
      accurateRandomStub = sandbox.stub().returns(-1);
      cachedAccuratePrng = RANDOM_NUMBER_GENERATORS.accuratePrng;
      RANDOM_NUMBER_GENERATORS.accuratePrng = accurateRandomStub;
    });

    afterEach(() => {
      sandbox.restore();
      RANDOM_NUMBER_GENERATORS.accuratePrng = cachedAccuratePrng;
    });

    it('handles empty experiments list', () => {
      // Opt out of experiment.
      toggleExperiment(sandbox.win, 'testExperimentId', false, true);
      randomlySelectUnsetExperiments(sandbox.win, {});
      expect(isExperimentOn(sandbox.win, 'testExperimentId'),
          'experiment is on').to.be.false;
      expect(sandbox.win.experimentBranches).to.be.empty;
    });

    it('handles experiment not diverted path', () => {
      // Opt out of experiment.
      toggleExperiment(sandbox.win, 'testExperimentId', false, true);
      randomlySelectUnsetExperiments(sandbox.win, testExperimentSet);
      expect(isExperimentOn(sandbox.win, 'testExperimentId'),
          'experiment is on').to.be.false;
      expect(getExperimentBranch(sandbox.win,
          'testExperimentId')).to.not.be.ok;
    });

    it('handles experiment diverted path 1', () => {
      // Force experiment on.
      toggleExperiment(sandbox.win, 'testExperimentId', true, true);
      // force the control branch to be chosen by making the accurate PRNG
      // return a value < 0.5.
      RANDOM_NUMBER_GENERATORS.accuratePrng.onFirstCall().returns(0.3);
      randomlySelectUnsetExperiments(sandbox.win, testExperimentSet);
      expect(isExperimentOn(sandbox.win, 'testExperimentId'),
          'experiment is on').to.be.true;
      expect(getExperimentBranch(sandbox.win, 'testExperimentId')).to.equal(
          'branch1_id');
    });

    it('handles experiment diverted path 2', () => {
      // Force experiment on.
      toggleExperiment(sandbox.win, 'testExperimentId', true, true);
      // Force the experiment branch to be chosen by making the accurate PRNG
      // return a value > 0.5.
      RANDOM_NUMBER_GENERATORS.accuratePrng.onFirstCall().returns(0.6);
      randomlySelectUnsetExperiments(sandbox.win, testExperimentSet);
      expect(isExperimentOn(sandbox.win, 'testExperimentId'),
          'experiment is on').to.be.true;
      expect(getExperimentBranch(sandbox.win, 'testExperimentId')).to.equal(
          'branch2_id');
    });

    it('picks a branch if traffic eligible', () => {
      toggleExperiment(sandbox.win, 'expt_0', true, true);
      sandbox.win.trafficEligible = true;
      const experimentInfo = {
        'expt_0': {
          isTrafficEligible: win => { return win.trafficEligible; },
          branches: ['0_0', '0_1'],
        },
      };
      RANDOM_NUMBER_GENERATORS.accuratePrng.returns(0.3);
      randomlySelectUnsetExperiments(sandbox.win, experimentInfo);
      expect(isExperimentOn(sandbox.win, 'expt_0')).to.be.true;
      expect(getExperimentBranch(sandbox.win, 'expt_0')).to.equal('0_0');
    });

    it('doesn\'t pick a branch if traffic ineligible', () => {
      toggleExperiment(sandbox.win, 'expt_0', true, true);
      sandbox.win.trafficEligible = false;
      const experimentInfo = {
        'expt_0': {
          isTrafficEligible: win => { return win.trafficEligible; },
          branches: ['0_0', '0_1'],
        },
      };
      RANDOM_NUMBER_GENERATORS.accuratePrng.returns(0.3);
      randomlySelectUnsetExperiments(sandbox.win, experimentInfo);
      expect(isExperimentOn(sandbox.win, 'expt_0')).to.be.true;
      expect(getExperimentBranch(sandbox.win, 'expt_0')).to.be.null;
    });

    it('doesn\'t pick a branch if no traffic eligibility function', () => {
      toggleExperiment(sandbox.win, 'expt_0', true, true);
      const experimentInfo = {
        'expt_0': {
          isTrafficEligible: undefined,
          branches: ['0_0', '0_1'],
        },
      };
      RANDOM_NUMBER_GENERATORS.accuratePrng.returns(0.3);
      randomlySelectUnsetExperiments(sandbox.win, experimentInfo);
      expect(isExperimentOn(sandbox.win, 'expt_0')).to.be.true;
      expect(getExperimentBranch(sandbox.win, 'expt_0')).to.be.null;
    });

    it('doesn\'t pick a branch if traffic becomes eligible after first ' +
        'diversion', () => {
      toggleExperiment(sandbox.win, 'expt_0', true, true);
      sandbox.win.trafficEligible = false;
      const experimentInfo = {
        'expt_0': {
          isTrafficEligible: win => { return win.trafficEligible; },
          branches: ['0_0', '0_1'],
        },
      };
      RANDOM_NUMBER_GENERATORS.accuratePrng.returns(0.3);

      randomlySelectUnsetExperiments(sandbox.win, experimentInfo);
      expect(isExperimentOn(sandbox.win, 'expt_0')).to.be.true;
      expect(getExperimentBranch(sandbox.win, 'expt_0')).to.be.null;

      sandbox.win.trafficEligible = true;

      randomlySelectUnsetExperiments(sandbox.win, experimentInfo);
      expect(isExperimentOn(sandbox.win, 'expt_0')).to.be.true;
      expect(getExperimentBranch(sandbox.win, 'expt_0')).to.be.null;
    });

    it('handles multiple experiments', () => {
      toggleExperiment(sandbox.win, 'expt_0', true, true);
      toggleExperiment(sandbox.win, 'expt_1', false, true);
      toggleExperiment(sandbox.win, 'expt_2', true, true);
      toggleExperiment(sandbox.win, 'expt_3', true, true);

      const experimentInfo = {
        'expt_0': {
          isTrafficEligible: () => true,
          branches: ['0_c', '0_e'],
        },
        'expt_1': {
          isTrafficEligible: () => true,
          branches: ['1_c', '1_e'],
        },
        'expt_2': {
          isTrafficEligible: () => true,
          branches: ['2_c', '2_e'],
        },
        // expt_3 omitted.
      };
      RANDOM_NUMBER_GENERATORS.accuratePrng.returns(0.6);
      randomlySelectUnsetExperiments(sandbox.win, experimentInfo);
      expect(isExperimentOn(sandbox.win, 'expt_0'),
          'expt_0 is on').to.be.true;
      expect(isExperimentOn(sandbox.win, 'expt_1'),
          'expt_1 is on').to.be.false;
      expect(isExperimentOn(sandbox.win, 'expt_2'),
          'expt_2 is on').to.be.true;
      // Note: calling isExperimentOn('expt_3') would actually evaluate the
      // frequency for expt_3, possibly enabling it.  Since we wanted it to be
      // omitted altogether, we'll evaluate it only via its branch.
      expect(getExperimentBranch(sandbox.win, 'expt_0')).to.equal(
          '0_e');
      expect(getExperimentBranch(sandbox.win, 'expt_1')).to.not.be.ok;
      expect(getExperimentBranch(sandbox.win, 'expt_2')).to.equal(
          '2_e');
      expect(getExperimentBranch(sandbox.win, 'expt_3')).to.not.be.ok;
    });

    it('handles multi-way branches', () => {
      toggleExperiment(sandbox.win, 'expt_0', true, true);
      const experimentInfo = {
        'expt_0': {
          isTrafficEligible: () => true,
          branches: ['0_0', '0_1', '0_2', '0_3', '0_4'],
        },
      };
      RANDOM_NUMBER_GENERATORS.accuratePrng.returns(0.7);
      randomlySelectUnsetExperiments(sandbox.win, experimentInfo);
      expect(isExperimentOn(sandbox.win, 'expt_0'),
          'expt_0 is on').to.be.true;
      expect(getExperimentBranch(sandbox.win, 'expt_0')).to.equal(
          '0_3');
    });

    it('handles multiple experiments with multi-way branches', () => {
      toggleExperiment(sandbox.win, 'expt_0', true, true);
      toggleExperiment(sandbox.win, 'expt_1', false, true);
      toggleExperiment(sandbox.win, 'expt_2', true, true);
      toggleExperiment(sandbox.win, 'expt_3', true, true);

      const experimentInfo = {
        'expt_0': {
          isTrafficEligible: () => true,
          branches: ['0_0', '0_1', '0_2', '0_3', '0_4'],
        },
        'expt_1': {
          isTrafficEligible: () => true,
          branches: ['1_0', '1_1', '1_2', '1_3', '1_4'],
        },
        'expt_2': {
          isTrafficEligible: () => true,
          branches: ['2_0', '2_1', '2_2', '2_3', '2_4'],
        },
      };
      RANDOM_NUMBER_GENERATORS.accuratePrng.onFirstCall().returns(0.7);
      RANDOM_NUMBER_GENERATORS.accuratePrng.onSecondCall().returns(0.3);
      randomlySelectUnsetExperiments(sandbox.win, experimentInfo);
      expect(isExperimentOn(sandbox.win, 'expt_0'),
          'expt_0 is on').to.be.true;
      expect(isExperimentOn(sandbox.win, 'expt_1'),
          'expt_1 is on').to.be.false;
      expect(isExperimentOn(sandbox.win, 'expt_2'),
          'expt_2 is on').to.be.true;
      // Note: calling isExperimentOn('expt_3') would actually evaluate the
      // frequency for expt_3, possibly enabling it.  Since we wanted it to be
      // omitted altogether, we'll evaluate it only via its branch.
      expect(getExperimentBranch(sandbox.win, 'expt_0')).to.equal(
          '0_3');
      expect(getExperimentBranch(sandbox.win, 'expt_1')).to.not.be.ok;
      expect(getExperimentBranch(sandbox.win, 'expt_2')).to.equal(
          '2_1');
      expect(getExperimentBranch(sandbox.win, 'expt_3')).to.not.be.ok;
    });

    it('should not process the same experiment twice', () => {
      const exptAInfo = {
        'fooExpt': {
          isTrafficEligible: () => true,
          branches: ['012345', '987654'],
        },
      };
      const exptBInfo = {
        'fooExpt': {
          isTrafficEligible: () => true,
          branches: ['246810', '108642'],
        },
      };
      toggleExperiment(sandbox.win, 'fooExpt', false, true);
      randomlySelectUnsetExperiments(sandbox.win, exptAInfo);
      randomlySelectUnsetExperiments(sandbox.win, exptBInfo);
      // Even though we tried to set up a second time, using a config
      // parameter that should ensure that the experiment was activated, the
      // experiment framework should evaluate each experiment only once per
      // page and should not enable it.
      expect(isExperimentOn(sandbox.win, 'fooExpt')).to.be.false;
      expect(getExperimentBranch(sandbox.win, 'fooExpt')).to.not.be.ok;
    });
  });
});

describes.realWin('isExperimentOnForOriginTrial', {amp: true}, env => {

  let win;
  let sandbox;
  let crypto;

  let warnStub;

  beforeEach(() => {
    win = {
      document: env.win.document,
      location: {
        href: 'https://www.google.com',
      },
      crypto: env.win.crypto,
    };
    sandbox = env.sandbox;

    installCryptoService(win);
    crypto = cryptoFor(win);

    warnStub = sandbox.stub(user(), 'warn');

    // Ensure that tests don't appear to pass because fake window object
    // doesn't have crypto when the window actually has it.
    installCryptoService(env.win);
    expect(cryptoFor(env.win).isPkcsAvailable())
        .to.equal(cryptoFor(win).isPkcsAvailable());
  });

  afterEach(() => {
    sandbox.restore();
  });

  function setupMetaTagWith(token) {
    const meta = document.createElement('meta');
    meta.setAttribute('name', 'amp-experiment-token');
    meta.setAttribute('content', token);
    win.document.head.appendChild(meta);
  }

  it('should return false if no token is found', () => {
    // No meta tag ever added
    const p = isExperimentOnForOriginTrial(win, 'amp-expires-later', publicJwk);
    return expect(p).to.eventually.be.false;
  });

  it('should return false if public key is not present', () => {
    setupMetaTagWith(correctToken);
    const p = isExperimentOnForOriginTrial(win, 'amp-expires-later', publicJwk);
    return expect(p).to.eventually.be.false;
  });

  it('should return false if crypto is unavailable', () => {
    sandbox.stub(crypto, 'isPkcsAvailable').returns(false);
    const p = isExperimentOnForOriginTrial(win, 'amp-expires-later', publicJwk);
    return expect(p).to.eventually.be.false;
  });

  it('should throw for missing token', () => {
    if (!crypto.isPkcsAvailable()) { return; }
    setupMetaTagWith('');
    return enableExperimentsForOriginTrials(win, publicJwk).then(() => {
      return isExperimentOnForOriginTrial(win, 'amp-expires-later', publicJwk);
    }).then(result => {
      expect(result).to.be.false;
      expect(warnStub).to.have.been
          .calledWith('experiments', 'Unable to read experiments token');
    });
  });

  it('should throw for an unknown token version number', () => {
    if (!crypto.isPkcsAvailable()) { return; }
    setupMetaTagWith(tokenWithBadVersion);
    return enableExperimentsForOriginTrials(win, publicJwk).then(() => {
      return isExperimentOnForOriginTrial(win, 'amp-expires-later', publicJwk);
    }).then(result => {
      expect(result).to.be.false;
      expect(warnStub).to.have.been.calledWith(
          'experiments',
          sinon.match({
            message: sinon.match(/Unrecognized experiments token version/),
          }));
    });
  });

  it('should throw if config length exceeds byte length', () => {
    if (!crypto.isPkcsAvailable()) { return; }
    setupMetaTagWith(tokenWithBadConfigLength);
    return enableExperimentsForOriginTrials(win, publicJwk).then(() => {
      return isExperimentOnForOriginTrial(win, 'amp-expires-later', publicJwk);
    }).then(result => {
      expect(result).to.be.false;
      expect(warnStub).to.have.been.calledWith(
          'experiments',
          sinon.match({message: 'Specified len extends past end of buffer'}));
    });
  });

  it('should throw if signature cannot be verified', () => {
    if (!crypto.isPkcsAvailable()) { return; }
    setupMetaTagWith(tokenWithBadSignature);
    return enableExperimentsForOriginTrials(win, publicJwk).then(() => {
      return isExperimentOnForOriginTrial(win, 'amp-expires-later', publicJwk);
    }).then(result => {
      expect(result).to.be.false;
      expect(warnStub).to.have.been.calledWith(
          'experiments',
          sinon.match({message: 'Failed to verify config signature'}));
    });
  });

  it('should throw if approved origin is not current origin', () => {
    if (!crypto.isPkcsAvailable()) { return; }
    setupMetaTagWith(correctToken);
    win.location.href = 'https://www.not-google.com';
    return enableExperimentsForOriginTrials(win, publicJwk).then(() => {
      return isExperimentOnForOriginTrial(win, 'amp-expires-later', publicJwk);
    }).then(result => {
      expect(result).to.be.false;
      expect(warnStub).to.have.been.calledWith(
          'experiments',
          sinon.match({message: 'Config does not match current origin'}));
    });
  });

  it('should return false if requested experiment is not in config', () => {
    if (!crypto.isPkcsAvailable()) { return; }
    setupMetaTagWith(correctToken);
    return enableExperimentsForOriginTrials(win, publicJwk).then(() => {
      const p =
          isExperimentOnForOriginTrial(win, 'amp-not-in-config', publicJwk);
      return expect(p).to.eventually.be.false;
    });
  });

  it('should return false if trial has expired', () => {
    if (!crypto.isPkcsAvailable()) { return; }
    setupMetaTagWith(tokenWithExpiredExperiment);
    return enableExperimentsForOriginTrials(win, publicJwk).then(() => {
      return isExperimentOnForOriginTrial(win, 'amp-expired', publicJwk);
    }).then(result => {
      expect(result).to.be.false;
      expect(warnStub).to.have.been.calledWith(
          'experiments',
          sinon.match({message: 'Experiment amp-expired has expired'}));
    });
  });

  it('should return true for a well-formed token for an experiment ' +
     'that has not yet expired', () => {
    if (!crypto.isPkcsAvailable()) { return; }
    setupMetaTagWith(correctToken);
    return enableExperimentsForOriginTrials(win, publicJwk).then(() => {
      const p =
          isExperimentOnForOriginTrial(win, 'amp-expires-later', publicJwk);
      return expect(p).to.eventually.be.true;
    });
  });

  it('should return true for a correct token if the approved origin has ' +
     'a trailing slash', () => {
    if (!crypto.isPkcsAvailable()) { return; }
    setupMetaTagWith(correctToken);
    win.location.href = 'https://www.google.com/';
    return enableExperimentsForOriginTrials(win, publicJwk).then(() => {
      const p =
          isExperimentOnForOriginTrial(win, 'amp-expires-later', publicJwk);
      return expect(p).to.eventually.be.true;
    });
  });
});
