import {createElementWithAttributes} from '#core/dom';

import {
  RANDOM_NUMBER_GENERATORS,
  experimentToggles,
  forceExperimentBranch,
  getActiveExperimentBranches,
  getBinaryType,
  getExperimentBranch,
  getExperimentTogglesForTesting,
  isCanary,
  isExperimentOn,
  randomlySelectUnsetExperiments,
  resetExperimentTogglesForTesting,
  toggleExperiment,
} from '#experiments';

function fakeLocalStorage(initial = {}) {
  const state = {...initial};
  return {
    getItem: (key) => (key in state ? state[key] : null),
    setItem: (key, value) => (state[key] = value),
  };
}

describes.sandboxed('experimentToggles', {}, () => {
  it('should return experiment status map', () => {
    const win = {
      AMP_CONFIG: {
        exp1: 1, // Initialized here
        exp2: 0, // Initialized here
        exp3: 1, // Initialized here
        exp4: 0, // Initialized here
        exp5: 1, // Initialized here
        exp6: 0, // Initialized here
        v: '12345667',
      },
      AMP_EXP: {
        exp3: 0, // Overrides AMP_CONFIG
        exp4: 1, // Overrides AMP_CONFIG
        exp5: 0, // Overrides AMP_CONFIG
        exp6: 1, // Overrides AMP_CONFIG
        exp7: 1, // Initialized here
        exp8: 0, // Initialized here
        exp9: 1, // Initialized here
        exp10: 0, // Initialized here
      },
      localStorage: fakeLocalStorage({
        'amp-experiment-toggles': [
          'exp5', // Overrides AMP_CONFIG and AMP_EXP
          '-exp6', // Overrides AMP_CONFIG and AMP_EXP
          '-exp9', // Overrides AMP_EXP
          'exp10', // Overrides AMP_EXP
          'exp11', // Initialized here
          '-exp12', // Initialized here
        ].join(','),
      }),
    };
    resetExperimentTogglesForTesting(window);
    expect(experimentToggles(win)).to.deep.equal({
      exp1: true,
      exp2: false,
      exp3: false,
      exp4: true,
      exp5: true,
      exp6: false,
      exp7: true,
      exp8: false,
      exp9: false,
      exp10: true,
      exp11: true,
      exp12: false,
      // "v" should not appear here
    });
  });

  it('should cache experiment toggles on window', () => {
    const win = {
      localStorage: fakeLocalStorage({
        'amp-experiment-toggles': '-exp3,exp4,exp5',
      }),
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

    expect(win['__AMP__EXPERIMENT_TOGGLES']).to.deep.equal({
      exp1: true,
      exp2: false,
      exp3: false,
      exp4: true,
      exp5: true,
    });

    win['__AMP__EXPERIMENT_TOGGLES'].exp1 = false;

    expect(experimentToggles(win)).to.deep.equal({
      exp1: false,
      exp2: false,
      exp3: false,
      exp4: true,
      exp5: true,
    });
  });
});

describes.sandboxed('isExperimentOn', {}, (env) => {
  let win;

  beforeEach(() => {
    win = {
      localStorage: fakeLocalStorage(),
      AMP_CONFIG: {},
      location: {
        hash: '',
        href: 'http://foo.bar',
      },
    };
  });

  function expectExperiment(storedString, experimentId) {
    resetExperimentTogglesForTesting(win);
    win.localStorage.setItem('amp-experiment-toggles', storedString);
    // eslint-disable-next-line chai-expect/missing-assertion
    return expect(isExperimentOn(win, /*OK*/ experimentId));
  }

  describe('with only cookie flag', () => {
    it('should return "off" with no cookies, malformed or empty', () => {
      expectExperiment(null, 'e1').to.be.false;
      expectExperiment(undefined, 'e1').to.be.false;
      expectExperiment('', 'e1').to.be.false;
    });

    it('should return "off" when value is not in the list', () => {
      expectExperiment('e1a,e2', 'e1').to.be.false;
    });

    it('should return "on" when value is in the list', () => {
      expectExperiment('e1', 'e1').to.be.true;
      expectExperiment('e1,e2', 'e1').to.be.true;
      expectExperiment('e2,e1', 'e1').to.be.true;
      expectExperiment('e2 , e1', 'e1').to.be.true;
    });

    it('should return "off" when disabling value is in the list', () => {
      expectExperiment('-e1', 'e1').to.be.false;
      expectExperiment('e2,-e1', 'e1').to.be.false;
      expectExperiment('-e1,e2', 'e1').to.be.false;
      expectExperiment('e2 , -e1', 'e1').to.be.false;
    });
  });

  describe('with global flag', () => {
    it('should prioritize cookie flag', () => {
      win.AMP_CONFIG['e1'] = true;
      expectExperiment('e1', 'e1').to.be.true;
    });

    it('should fall back to global flag', () => {
      const cookie = 'e2,e4';
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
      expectExperiment('-e1', 'e1').to.be.false;
    });

    it('should return "off" when not in cookie flag or global flag', () => {
      expectExperiment('', 'e1').to.be.false;
    });

    it('should calc if experiment should be "on"', () => {
      win.AMP_CONFIG['e1'] = 1;
      expectExperiment('', 'e1').to.be.true;

      win.AMP_CONFIG['e2'] = 0;
      expectExperiment('', 'e2').to.be.false;

      env.sandbox.stub(Math, 'random').returns(0.5);
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
      env.sandbox.stub(Math, 'random').returns(0.4);
      win.AMP_CONFIG['e1'] = 0.5;
      win.AMP_CONFIG['e2'] = 0.1;

      expectExperiment('', 'e1').to.be.true;
      expectExperiment('', 'e2').to.be.false;
    });
  });
});

describes.sandboxed('toggleExperiment', {}, (env) => {
  let clock;

  beforeEach(() => {
    clock = env.sandbox.useFakeTimers();
    clock.tick(1);
  });

  afterEach(() => {
    resetExperimentTogglesForTesting(window);
  });

  function expectToggle(storedString, experimentId, opt_on) {
    resetExperimentTogglesForTesting(window);
    const win = {
      document: {},
      localStorage: fakeLocalStorage({'amp-experiment-toggles': storedString}),
      location: {
        hostname: 'test.test',
        href: 'https://test.test/test.html',
      },
    };
    const on = toggleExperiment(win, experimentId, opt_on);
    const newString = win.localStorage.getItem('amp-experiment-toggles');
    // eslint-disable-next-line chai-expect/missing-assertion
    return expect(`${on}; ${newString}`);
  }

  it('should toggle to "on" with no cookies, malformed or empty', () => {
    expectToggle(null, 'e1').to.equal('true; e1');
    expectToggle(undefined, 'e2').to.equal('true; e2');
    expectToggle('', 'e3').to.equal('true; e3');
    expectToggle('', 'e4').to.equal('true; e4');
  });

  it('should toggle "on" when value is not in the list', () => {
    expectToggle('e1a,e2', 'e1').to.equal('true; e1a,e2,e1');
  });

  it('should toggle "off" when value is in the list', () => {
    expectToggle('e1', 'e1').to.equal('false; -e1');
    expectToggle('e1,e2', 'e1').to.equal('false; -e1,e2');
    expectToggle('e2,e1', 'e1').to.equal('false; e2,-e1');
  });

  it('should set "on" when requested', () => {
    expectToggle('e2', 'e1', true).to.equal('true; e2,e1');
    expectToggle('e1', 'e1', true).to.equal('true; e1');
  });

  it('should set "off" when requested', () => {
    expectToggle('e2,e1', 'e1', false).to.equal('false; e2,-e1');
    expectToggle('e1', 'e1', false).to.equal('false; -e1');
  });

  it('should not set localStorage when transientExperiment==true', () => {
    const win = {
      localStorage: fakeLocalStorage(),
    };
    toggleExperiment(win, 'e1', true, true);
    expect(win.localStorage.getItem('amp-experiment-toggles')).to.equal(null);
    toggleExperiment(win, 'e2', false, true);
    expect(win.localStorage.getItem('amp-experiment-toggles')).to.equal(null);
    toggleExperiment(win, 'e3', undefined, true);
    expect(win.localStorage.getItem('amp-experiment-toggles')).to.equal(null);
    // But all of those experiment states should be durable in the window
    // environment.
    expect(isExperimentOn(win, 'e1'), 'e1 is on').to.be.true;
    expect(isExperimentOn(win, 'e2'), 'e2 is off').to.be.false;
    expect(isExperimentOn(win, 'e3'), 'e3 is on').to.be.true;
    toggleExperiment(win, 'e1', false, true);
    expect(win.localStorage.getItem('amp-experiment-toggles')).to.equal(null);
    toggleExperiment(win, 'e2', true, true);
    expect(win.localStorage.getItem('amp-experiment-toggles')).to.equal(null);
    toggleExperiment(win, 'e3', undefined, true);
    expect(win.localStorage.getItem('amp-experiment-toggles')).to.equal(null);
    expect(isExperimentOn(win, 'e1'), 'e1 is off').to.be.false;
    expect(isExperimentOn(win, 'e2'), 'e2 is on').to.be.true;
    expect(isExperimentOn(win, 'e3'), 'e3 is off').to.be.false;
  });

  it('should set localStorage when !transientExperiment', () => {
    const win = {
      localStorage: fakeLocalStorage(),
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

    expect(getExperimentTogglesForTesting(win)).to.not.have.property(
      'transient'
    );
    expect(getExperimentTogglesForTesting(win)).to.have.property('e1', true);
    expect(getExperimentTogglesForTesting(win)).to.have.property('e2', true);
    expect(getExperimentTogglesForTesting(win)).to.have.property('e3', true);
    expect(getExperimentTogglesForTesting(win)).to.have.property('e4', true);

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

    expect(getExperimentTogglesForTesting(win)).to.not.have.property(
      'transient'
    );
    expect(getExperimentTogglesForTesting(win)).to.have.property('e1', false);
    expect(getExperimentTogglesForTesting(win)).to.have.property('e2', false);
    expect(getExperimentTogglesForTesting(win)).to.have.property('e3', false);
    expect(getExperimentTogglesForTesting(win)).to.have.property('e4', false);

    expect(isExperimentOn(win, 'transient'), 'transient is on').to.be.false;
    expect(isExperimentOn(win, 'e1'), 'e1 is on').to.be.false;
    expect(isExperimentOn(win, 'e2'), 'e2 is on').to.be.false;
    expect(isExperimentOn(win, 'e3'), 'e3 is on').to.be.false;
    expect(isExperimentOn(win, 'e4'), 'e4 is on').to.be.false;
  });

  it('should not mess up localStorage when transientExperiment==true ', () => {
    const win = {
      localStorage: fakeLocalStorage(),
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
    expect(win.localStorage.getItem('amp-experiment-toggles')).to.contain('e0');
    expect(win.localStorage.getItem('amp-experiment-toggles')).to.contain('e1');
    expect(win.localStorage.getItem('amp-experiment-toggles')).to.contain('e2');
    expect(win.localStorage.getItem('amp-experiment-toggles')).to.contain('e3');
    expect(isExperimentOn(win, 'e0'), 'e0').to.be.true;
    expect(isExperimentOn(win, 'e1'), 'e1').to.be.true;
    expect(isExperimentOn(win, 'e2'), 'e2').to.be.true;
    expect(isExperimentOn(win, 'e3'), 'e3').to.be.true;
    toggleExperiment(win, 'x0', false, true);
    toggleExperiment(win, 'x1', true, true);
    toggleExperiment(win, 'x2', undefined, true);
    expect(win.localStorage.getItem('amp-experiment-toggles')).to.contain('e0');
    expect(win.localStorage.getItem('amp-experiment-toggles')).to.contain('e1');
    expect(win.localStorage.getItem('amp-experiment-toggles')).to.contain('e2');
    expect(win.localStorage.getItem('amp-experiment-toggles')).to.contain('e3');
    expect(win.localStorage.getItem('amp-experiment-toggles')).to.not.contain(
      'x0'
    );
    expect(win.localStorage.getItem('amp-experiment-toggles')).to.not.contain(
      'x1'
    );
    expect(win.localStorage.getItem('amp-experiment-toggles')).to.not.contain(
      'x2'
    );
    expect(isExperimentOn(win, 'x0'), 'x0').to.be.false;
    expect(isExperimentOn(win, 'x1'), 'x1').to.be.true;
    expect(isExperimentOn(win, 'x2'), 'x2').to.be.true;
    // The toggle(win, foo, false) cases here should hit the 'foo not in
    // EXPERIMENT_TOGGLES' cases in toggleExperiments.
    toggleExperiment(win, 'e4', false);
    toggleExperiment(win, 'e5', true);
    toggleExperiment(win, 'e6', false);
    expect(win.localStorage.getItem('amp-experiment-toggles')).to.contain('e0');
    expect(win.localStorage.getItem('amp-experiment-toggles')).to.contain('e1');
    expect(win.localStorage.getItem('amp-experiment-toggles')).to.contain('e2');
    expect(win.localStorage.getItem('amp-experiment-toggles')).to.contain('e3');
    expect(win.localStorage.getItem('amp-experiment-toggles')).to.not.contain(
      'e4'
    );
    expect(win.localStorage.getItem('amp-experiment-toggles')).to.contain('e5');
    expect(win.localStorage.getItem('amp-experiment-toggles')).to.not.contain(
      'e6'
    );
    expect(isExperimentOn(win, 'e4'), 'e4').to.be.false;
    expect(isExperimentOn(win, 'e5'), 'e5').to.be.true;
    expect(isExperimentOn(win, 'e6'), 'e6').to.be.false;
  });

  it('should override global settings', () => {
    const win = {
      'AMP_CONFIG': {
        'e1': 1,
      },
      localStorage: fakeLocalStorage(),
      location: {
        hostname: 'test.test',
        href: 'http://foo.bar',
      },
    };

    // e1 is on, according to the AMP_CONFIG global setting
    expect(isExperimentOn(win, 'e1')).to.be.true;
    // toggleExperiment should override the global setting
    expect(toggleExperiment(win, 'e1')).to.be.false;
    expect(isExperimentOn(win, 'e1')).to.be.false;

    // Calling cache reset testing function clears cookies on window object
    // it is called with.
    resetExperimentTogglesForTesting(win);
    expect(isExperimentOn(win, 'e1')).to.be.true;

    // Now let's explicitly toggle to true
    expect(toggleExperiment(win, 'e1', true)).to.be.true;
    expect(isExperimentOn(win, 'e1')).to.be.true;
    resetExperimentTogglesForTesting(win);
    expect(isExperimentOn(win, 'e1')).to.be.true;

    // Toggle transiently should still work
    expect(toggleExperiment(win, 'e1', false, true)).to.be.false;
    expect(isExperimentOn(win, 'e1')).to.be.false;
    resetExperimentTogglesForTesting(win); // cache reset should bring it back to true
    expect(isExperimentOn(win, 'e1')).to.be.true;

    // Sanity check, the global setting should never be changed.
    expect(win.AMP_CONFIG.e1).to.equal(1);
  });
});

describes.realWin('meta override', {}, (env) => {
  let win;

  beforeEach(() => {
    win = env.win;
  });

  it('should allow override iff the experiment is allowlisted', () => {
    win.AMP_CONFIG = {
      'allow-doc-opt-in': ['e1', 'e3'],
      e1: 0,
      e2: 0,
    };

    win.document.head.appendChild(
      createElementWithAttributes(win.document, 'meta', {
        name: 'amp-experiments-opt-in',
        content: 'e1,e2,e3',
      })
    );

    resetExperimentTogglesForTesting(window);

    expect(isExperimentOn(win, 'e1')).to.be.true;
    expect(isExperimentOn(win, 'e2')).to.be.false; // e2 is not allowlisted
    expect(isExperimentOn(win, 'e3')).to.be.true;

    toggleExperiment(win, 'e1', false);
    toggleExperiment(win, 'e2', true);
    toggleExperiment(win, 'e3', false);
    expect(isExperimentOn(win, 'e1')).to.be.false;
    expect(isExperimentOn(win, 'e2')).to.be.true;
    expect(isExperimentOn(win, 'e3')).to.be.false;
  });
});

describes.fakeWin('url override', {}, (env) => {
  let win;

  beforeEach(() => {
    win = env.win;
  });

  it('should allow override iff the experiment is allowlisted', () => {
    win.AMP_CONFIG = {
      'allow-url-opt-in': ['e1', 'e3', 'e4', 'e6', 'e7', 'e8'],
      e1: 0,
      e2: 0,
      e4: 1,
      e5: 1,
    };
    delete win.location.originalHash;
    win.location.href =
      '#e-e1=1&e-e2=1&e-e3=1&e-e4=0&e-e5=0&e-e6=0&e-e7=1&e-e8=0';
    win.document.cookie = 'AMP_EXP=-e7,e8';

    resetExperimentTogglesForTesting(window);

    expect(isExperimentOn(win, 'e1')).to.be.true;
    expect(isExperimentOn(win, 'e2')).to.be.false; // e2 is not allowlisted
    expect(isExperimentOn(win, 'e3')).to.be.true;
    expect(isExperimentOn(win, 'e4')).to.be.false;
    expect(isExperimentOn(win, 'e5')).to.be.true; // e5 is not allowlisted
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

describes.sandboxed('isCanary', {}, () => {
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

describes.sandboxed('getBinaryType', {}, () => {
  it('should return correct type', () => {
    const win = {
      AMP_CONFIG: {
        type: 'production',
      },
    };
    expect(getBinaryType(win)).to.equal('production');
    win.AMP_CONFIG.type = 'experimental';
    expect(getBinaryType(win)).to.equal('experimental');
    win.AMP_CONFIG.type = 'control';
    expect(getBinaryType(win)).to.equal('control');
    win.AMP_CONFIG.type = 'rc';
    expect(getBinaryType(win)).to.equal('rc');
    delete win.AMP_CONFIG.type;
    expect(getBinaryType(win)).to.equal('unknown');
  });
  it('should return "unknown"', () => {
    expect(getBinaryType({})).to.equal('unknown');
  });
});

describes.sandboxed('experiment branch tests', {}, (env) => {
  describe('#randomlySelectUnsetExperiments', () => {
    let accurateRandomStub;
    let cachedAccuratePrng;
    let testExperimentList;

    beforeEach(() => {
      const experimentFrequency = 1.0;
      testExperimentList = [
        {
          experimentId: 'testExperimentId',
          isTrafficEligible: () => true,
          branches: ['branch1_id', 'branch2_id'],
        },
      ];
      env.sandbox.win = {
        location: {
          hostname: 'test.server.name.com',
        },
        localStorage: fakeLocalStorage(),
        AMP_CONFIG: {
          testExperimentId: experimentFrequency,
        },
        document: {
          querySelector: () => {},
        },
      };
      accurateRandomStub = env.sandbox.stub().returns(-1);
      cachedAccuratePrng = RANDOM_NUMBER_GENERATORS.accuratePrng;
      RANDOM_NUMBER_GENERATORS.accuratePrng = accurateRandomStub;
    });

    afterEach(() => {
      RANDOM_NUMBER_GENERATORS.accuratePrng = cachedAccuratePrng;
    });

    it('handles empty experiments list', () => {
      // Opt out of experiment.
      toggleExperiment(env.sandbox.win, 'testExperimentId', false, true);
      randomlySelectUnsetExperiments(env.sandbox.win, []);
      expect(
        isExperimentOn(env.sandbox.win, 'testExperimentId'),
        'experiment is on'
      ).to.be.false;
      expect(env.sandbox.win.__AMP_EXPERIMENT_BRANCHES).to.be.empty;
    });

    it('handles experiment not diverted path', () => {
      // Opt out of experiment.
      toggleExperiment(env.sandbox.win, 'testExperimentId', false, true);
      randomlySelectUnsetExperiments(env.sandbox.win, testExperimentList);
      expect(
        isExperimentOn(env.sandbox.win, 'testExperimentId'),
        'experiment is on'
      ).to.be.false;
      expect(getExperimentBranch(env.sandbox.win, 'testExperimentId')).to.not.be
        .ok;
    });

    it('handles experiment diverted path 1', () => {
      // Force experiment on.
      toggleExperiment(env.sandbox.win, 'testExperimentId', true, true);
      // force the control branch to be chosen by making the accurate PRNG
      // return a value < 0.5.
      RANDOM_NUMBER_GENERATORS.accuratePrng.onFirstCall().returns(0.3);
      randomlySelectUnsetExperiments(env.sandbox.win, testExperimentList);
      expect(
        isExperimentOn(env.sandbox.win, 'testExperimentId'),
        'experiment is on'
      ).to.be.true;
      expect(getExperimentBranch(env.sandbox.win, 'testExperimentId')).to.equal(
        'branch1_id'
      );
    });

    it('handles experiment diverted path 2', () => {
      // Force experiment on.
      toggleExperiment(env.sandbox.win, 'testExperimentId', true, true);
      // Force the experiment branch to be chosen by making the accurate PRNG
      // return a value > 0.5.
      RANDOM_NUMBER_GENERATORS.accuratePrng.onFirstCall().returns(0.6);
      randomlySelectUnsetExperiments(env.sandbox.win, testExperimentList);
      expect(
        isExperimentOn(env.sandbox.win, 'testExperimentId'),
        'experiment is on'
      ).to.be.true;
      expect(getExperimentBranch(env.sandbox.win, 'testExperimentId')).to.equal(
        'branch2_id'
      );
    });

    it('picks a branch if traffic eligible', () => {
      toggleExperiment(env.sandbox.win, 'expt_0', true, true);
      env.sandbox.win.trafficEligible = true;
      const experimentInfo = [
        {
          experimentId: 'expt_0',
          isTrafficEligible: (win) => {
            return win.trafficEligible;
          },
          branches: ['0_0', '0_1'],
        },
      ];
      RANDOM_NUMBER_GENERATORS.accuratePrng.returns(0.3);
      randomlySelectUnsetExperiments(env.sandbox.win, experimentInfo);
      expect(isExperimentOn(env.sandbox.win, 'expt_0')).to.be.true;
      expect(getExperimentBranch(env.sandbox.win, 'expt_0')).to.equal('0_0');
    });

    it("doesn't pick a branch if traffic ineligible", () => {
      toggleExperiment(env.sandbox.win, 'expt_0', true, true);
      env.sandbox.win.trafficEligible = false;
      const experimentInfo = [
        {
          experimentId: 'expt_0',
          isTrafficEligible: (win) => {
            return win.trafficEligible;
          },
          branches: ['0_0', '0_1'],
        },
      ];
      RANDOM_NUMBER_GENERATORS.accuratePrng.returns(0.3);
      randomlySelectUnsetExperiments(env.sandbox.win, experimentInfo);
      expect(isExperimentOn(env.sandbox.win, 'expt_0')).to.be.true;
      expect(getExperimentBranch(env.sandbox.win, 'expt_0')).to.be.null;
    });

    it("doesn't pick a branch if no traffic eligibility function", () => {
      toggleExperiment(env.sandbox.win, 'expt_0', true, true);
      const experimentInfo = [
        {
          experimentId: 'expt_0',
          isTrafficEligible: undefined,
          branches: ['0_0', '0_1'],
        },
      ];
      RANDOM_NUMBER_GENERATORS.accuratePrng.returns(0.3);
      randomlySelectUnsetExperiments(env.sandbox.win, experimentInfo);
      expect(isExperimentOn(env.sandbox.win, 'expt_0')).to.be.true;
      expect(getExperimentBranch(env.sandbox.win, 'expt_0')).to.be.null;
    });

    it(
      "doesn't pick a branch if traffic becomes eligible after first " +
        'diversion',
      () => {
        toggleExperiment(env.sandbox.win, 'expt_0', true, true);
        env.sandbox.win.trafficEligible = false;
        const experimentInfo = [
          {
            experimentId: 'expt_0',
            isTrafficEligible: (win) => {
              return win.trafficEligible;
            },
            branches: ['0_0', '0_1'],
          },
        ];
        RANDOM_NUMBER_GENERATORS.accuratePrng.returns(0.3);

        randomlySelectUnsetExperiments(env.sandbox.win, experimentInfo);
        expect(isExperimentOn(env.sandbox.win, 'expt_0')).to.be.true;
        expect(getExperimentBranch(env.sandbox.win, 'expt_0')).to.be.null;

        env.sandbox.win.trafficEligible = true;

        randomlySelectUnsetExperiments(env.sandbox.win, experimentInfo);
        expect(isExperimentOn(env.sandbox.win, 'expt_0')).to.be.true;
        expect(getExperimentBranch(env.sandbox.win, 'expt_0')).to.be.null;
      }
    );

    it('handles multiple experiments', () => {
      toggleExperiment(env.sandbox.win, 'expt_0', true, true);
      toggleExperiment(env.sandbox.win, 'expt_1', false, true);
      toggleExperiment(env.sandbox.win, 'expt_2', true, true);
      toggleExperiment(env.sandbox.win, 'expt_3', true, true);

      const experimentInfo = [
        {
          experimentId: 'expt_0',
          isTrafficEligible: () => true,
          branches: ['0_c', '0_e'],
        },
        {
          experimentId: 'expt_1',
          isTrafficEligible: () => true,
          branches: ['1_c', '1_e'],
        },
        {
          experimentId: 'expt_2',
          isTrafficEligible: () => true,
          branches: ['2_c', '2_e'],
        },
        // expt_3 omitted.
      ];
      RANDOM_NUMBER_GENERATORS.accuratePrng.returns(0.6);
      randomlySelectUnsetExperiments(env.sandbox.win, experimentInfo);
      expect(isExperimentOn(env.sandbox.win, 'expt_0'), 'expt_0 is on').to.be
        .true;
      expect(isExperimentOn(env.sandbox.win, 'expt_1'), 'expt_1 is on').to.be
        .false;
      expect(isExperimentOn(env.sandbox.win, 'expt_2'), 'expt_2 is on').to.be
        .true;
      // Note: calling isExperimentOn('expt_3') would actually evaluate the
      // frequency for expt_3, possibly enabling it.  Since we wanted it to be
      // omitted altogether, we'll evaluate it only via its branch.
      expect(getExperimentBranch(env.sandbox.win, 'expt_0')).to.equal('0_e');
      expect(getExperimentBranch(env.sandbox.win, 'expt_1')).to.not.be.ok;
      expect(getExperimentBranch(env.sandbox.win, 'expt_2')).to.equal('2_e');
      expect(getExperimentBranch(env.sandbox.win, 'expt_3')).to.not.be.ok;
    });

    it('handles multi-way branches', () => {
      toggleExperiment(env.sandbox.win, 'expt_0', true, true);
      const experimentInfo = [
        {
          experimentId: 'expt_0',
          isTrafficEligible: () => true,
          branches: ['0_0', '0_1', '0_2', '0_3', '0_4'],
        },
      ];
      RANDOM_NUMBER_GENERATORS.accuratePrng.returns(0.7);
      randomlySelectUnsetExperiments(env.sandbox.win, experimentInfo);
      expect(isExperimentOn(env.sandbox.win, 'expt_0'), 'expt_0 is on').to.be
        .true;
      expect(getExperimentBranch(env.sandbox.win, 'expt_0')).to.equal('0_3');
    });

    it('handles multiple experiments with multi-way branches', () => {
      toggleExperiment(env.sandbox.win, 'expt_0', true, true);
      toggleExperiment(env.sandbox.win, 'expt_1', false, true);
      toggleExperiment(env.sandbox.win, 'expt_2', true, true);
      toggleExperiment(env.sandbox.win, 'expt_3', true, true);

      const experimentInfo = [
        {
          experimentId: 'expt_0',
          isTrafficEligible: () => true,
          branches: ['0_0', '0_1', '0_2', '0_3', '0_4'],
        },
        {
          experimentId: 'expt_1',
          isTrafficEligible: () => true,
          branches: ['1_0', '1_1', '1_2', '1_3', '1_4'],
        },
        {
          experimentId: 'expt_2',
          isTrafficEligible: () => true,
          branches: ['2_0', '2_1', '2_2', '2_3', '2_4'],
        },
      ];
      RANDOM_NUMBER_GENERATORS.accuratePrng.onFirstCall().returns(0.7);
      RANDOM_NUMBER_GENERATORS.accuratePrng.onSecondCall().returns(0.3);
      randomlySelectUnsetExperiments(env.sandbox.win, experimentInfo);
      expect(isExperimentOn(env.sandbox.win, 'expt_0'), 'expt_0 is on').to.be
        .true;
      expect(isExperimentOn(env.sandbox.win, 'expt_1'), 'expt_1 is on').to.be
        .false;
      expect(isExperimentOn(env.sandbox.win, 'expt_2'), 'expt_2 is on').to.be
        .true;
      // Note: calling isExperimentOn('expt_3') would actually evaluate the
      // frequency for expt_3, possibly enabling it.  Since we wanted it to be
      // omitted altogether, we'll evaluate it only via its branch.
      expect(getExperimentBranch(env.sandbox.win, 'expt_0')).to.equal('0_3');
      expect(getExperimentBranch(env.sandbox.win, 'expt_1')).to.not.be.ok;
      expect(getExperimentBranch(env.sandbox.win, 'expt_2')).to.equal('2_1');
      expect(getExperimentBranch(env.sandbox.win, 'expt_3')).to.not.be.ok;
    });

    it('should not process the same experiment twice', () => {
      const exptAInfo = [
        {
          experimentId: 'fooExpt',
          isTrafficEligible: () => true,
          branches: ['012345', '987654'],
        },
      ];
      const exptBInfo = [
        {
          experimentId: 'fooExpt',
          isTrafficEligible: () => true,
          branches: ['246810', '108642'],
        },
      ];
      toggleExperiment(env.sandbox.win, 'fooExpt', false, true);
      randomlySelectUnsetExperiments(env.sandbox.win, exptAInfo);
      randomlySelectUnsetExperiments(env.sandbox.win, exptBInfo);
      // Even though we tried to set up a second time, using a config
      // parameter that should ensure that the experiment was activated, the
      // experiment framework should evaluate each experiment only once per
      // page and should not enable it.
      expect(isExperimentOn(env.sandbox.win, 'fooExpt')).to.be.false;
      expect(getExperimentBranch(env.sandbox.win, 'fooExpt')).to.not.be.ok;
    });

    it('returns empty experiments map', () => {
      // Opt out of experiment.
      toggleExperiment(env.sandbox.win, 'testExperimentId', false, true);
      const exps = randomlySelectUnsetExperiments(env.sandbox.win, []);
      expect(exps).to.be.empty;
    });

    it('returns map with experiment diverted path 1', () => {
      // Force experiment on.
      toggleExperiment(env.sandbox.win, 'testExperimentId', true, true);
      // force the control branch to be chosen by making the accurate PRNG
      // return a value < 0.5.
      RANDOM_NUMBER_GENERATORS.accuratePrng.onFirstCall().returns(0.3);
      const exps = randomlySelectUnsetExperiments(
        env.sandbox.win,
        testExperimentList
      );
      expect(exps).to.deep.equal({'testExperimentId': 'branch1_id'});
    });

    it('returns map with multiple experiments with multi-way branches', () => {
      toggleExperiment(env.sandbox.win, 'expt_0', true, true);
      toggleExperiment(env.sandbox.win, 'expt_1', false, true);
      toggleExperiment(env.sandbox.win, 'expt_2', true, true);
      toggleExperiment(env.sandbox.win, 'expt_3', true, true);

      const experimentInfo = [
        {
          experimentId: 'expt_0',
          isTrafficEligible: () => true,
          branches: ['0_0', '0_1', '0_2', '0_3', '0_4'],
        },
        {
          experimentId: 'expt_1',
          isTrafficEligible: () => true,
          branches: ['1_0', '1_1', '1_2', '1_3', '1_4'],
        },
        {
          experimentId: 'expt_2',
          isTrafficEligible: () => true,
          branches: ['2_0', '2_1', '2_2', '2_3', '2_4'],
        },
      ];
      RANDOM_NUMBER_GENERATORS.accuratePrng.onFirstCall().returns(0.7);
      RANDOM_NUMBER_GENERATORS.accuratePrng.onSecondCall().returns(0.3);
      const exps = randomlySelectUnsetExperiments(
        env.sandbox.win,
        experimentInfo
      );

      expect(exps).to.deep.equal({
        'expt_0': '0_3',
        'expt_2': '2_1',
      });
    });
  });
});

describes.fakeWin('getActiveExperimentBranches', {}, (env) => {
  it('should return an empty object if no active branches', () => {
    expect(getActiveExperimentBranches(env.win)).to.eql({});
  });

  it('should return obj containing all branches', () => {
    forceExperimentBranch(env.win, 'exp1', '1234');
    forceExperimentBranch(env.win, 'exp2', '5678');
    expect(getActiveExperimentBranches(env.win)).to.eql({
      exp1: '1234',
      exp2: '5678',
    });
  });
});
