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
  isCanary,
  isExperimentOn,
  experimentToggles,
  toggleExperiment,
  resetExperimentTogglesForTesting,
  getExperimentToglesFromCookieForTesting,
} from '../../src/experiments';
import {createElementWithAttributes} from '../../src/dom';
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

