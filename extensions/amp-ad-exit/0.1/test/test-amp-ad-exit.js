/**
 * Copyright 2017 The AMP HTML Authors. All Rights Reserved.
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
import {ANALYTICS_CONFIG} from '../../../amp-analytics/0.1/vendors';
import {AmpAdExit} from '../amp-ad-exit';
import {toggleExperiment} from '../../../../src/experiments';

const TEST_3P_VENDOR = '3p-vendor';

const EXIT_CONFIG = {
  targets: {
    simple: {'finalUrl': 'http://localhost:8000/simple'},
    twoSecondDelay: {
      'finalUrl': 'http://localhost:8000/simple',
      'filters': ['twoSecond'],
    },
    borderProtection: {
      'finalUrl': 'http://localhost:8000/simple',
      'filters': ['borderProtection'],
    },
    borderProtectionRelativeTo: {
      'finalUrl': 'http://localhost:8000/simple',
      'filters': ['borderProtectionRelativeTo'],
    },

    tracking: {
      'finalUrl': 'http://localhost:8000/tracking-test',
      'trackingUrls': [
        'http://localhost:8000/tracking?1',
        'http://localhost:8000/tracking?2',
        'http://localhost:8000/tracking?3',
      ],
    },
    variables: {
      'finalUrl':
          'http://localhost:8000/vars?foo=bar&ampdoc=AMPDOC_HOST&r=RANDOM&x=CLICK_X&y=CLICK_Y',
      'trackingUrls': [
        'http://localhost:8000/tracking?r=RANDOM&x=CLICK_X&y=CLICK_Y',
      ],
    },
    customVars: {
      'finalUrl': 'http://localhost:8000/vars?foo=_foo',
      'trackingUrls': [
        'http://localhost:8000/tracking?bar=_bar',
        'http://localhost:8000/tracking?numVar=_numVar&boolVar=_boolVar',
      ],
      vars: {
        _foo: {
          defaultValue: 'foo-default',
        },
        _bar: {
          defaultValue: 'bar-default',
        },
        _numVar: {
          defaultValue: 3,
        },
        _boolVar: {
          defaultValue: true,
        },
      },
    },
    variableFrom3pAnalytics: {
      'finalUrl': 'http://localhost:8000/vars?foo=_foo',
      vars: {
        _foo: {
          defaultValue: 'foo-default',
          iframeTransportSignal:
              `IFRAME_TRANSPORT_SIGNAL(${TEST_3P_VENDOR},collected-data)`,
        },
        _bar: {
          defaultValue: 'bar-default',
        },
      },
    },
    inactiveElementTest: {
      'finalUrl': 'http://localhost:8000/simple',
      'filters': ['unclickableFilter'],
    },
  },
  filters: {
    'twoSecond': {
      type: 'clickDelay',
      delay: 2000,
    },
    'borderProtection': {
      type: 'clickLocation',
      top: 10,
      right: 20,
      bottom: 30,
    },
    'borderProtectionRelativeTo': {
      type: 'clickLocation',
      top: 10,
      right: 20,
      bottom: 30,
      relativeTo: '#ad',
    },
    unclickableFilter: {
      type: 'inactiveElement',
      selector: '#unclickable',
    },
  },
};

describes.realWin('amp-ad-exit', {
  amp: {
    ampdoc: 'single',
    extensions: ['amp-ad-exit'],
  },
}, env => {
  let sandbox;
  let win;
  let element;

  function makeClickEvent(time = 0, x = 0, y = 0, target = win.document.body) {
    sandbox.clock.tick(time);
    return {
      preventDefault: sandbox.spy(),
      clientX: x,
      clientY: y,
      target,
    };
  }

  function makeElementWithConfig(config) {
    const el = win.document.createElement('amp-ad-exit');
    el.id = 'exit-api';
    const json = win.document.createElement('script');
    json.textContent = JSON.stringify(config);
    json.setAttribute('type', 'application/json');
    el.appendChild(json);
    win.document.body.appendChild(el);
    return el.build().then(() => el);
  }

  // Ad ad div or the relativeTo element cannot be found.
  function addAdDiv() {
    const adDiv = win.document.createElement('div');
    adDiv.id = 'ad';
    adDiv.style.position = 'absolute';
    adDiv.style.left = '100px';
    adDiv.style.top = '200px';
    adDiv.style.width = '200px';
    adDiv.style.height = '200px';
    win.document.body.appendChild(adDiv);
    // TODO(jonkeller): Long-term, test with amp-ad-exit enclosed inside amp-ad,
    // so we don't have to do this hack.
    sandbox.stub(AmpAdExit.prototype, 'getAmpAdResourceId_').callsFake(
        () => String(Math.round(Math.random() * 10000)));
  }

  beforeEach(() => {
    sandbox = sinon.sandbox.create({useFakeTimers: true});
    win = env.win;
    toggleExperiment(win, 'amp-ad-exit', true);
    addAdDiv();
    // TODO(jonkeller): Remove after rebase
    win.top.document.body.getResourceId = () => '6789';
    // TEST_3P_VENDOR must be in ANALYTICS_CONFIG *before* makeElementWithConfig
    ANALYTICS_CONFIG[TEST_3P_VENDOR] = ANALYTICS_CONFIG[TEST_3P_VENDOR] || {
      transport: {
        iframe: '/nowhere.html',
      },
    };
    return makeElementWithConfig(EXIT_CONFIG).then(el => {
      element = el;
    });
  });

  afterEach(() => {
    sandbox.restore();
    env.win.document.body.removeChild(element);
    env.win.document.body.removeChild(env.win.document.getElementById('ad'));
    element = undefined;
  });

  it('should reject non-JSON children', () => {
    const el = win.document.createElement('amp-ad-exit');
    el.appendChild(win.document.createElement('p'));
    win.document.body.appendChild(el);
    return el.build().then(() => {
      throw new Error('must have failed');
    }, error => {
      expect(error.message).to.match(/application\/json/);
    });
  });

  it('should do nothing for missing targets', () => {
    const open = sandbox.stub(win, 'open');
    try {
      element.implementation_.executeAction({
        method: 'exit',
        args: {target: 'not-a-real-target'},
        event: makeClickEvent(1001),
        satisfiesTrust: () => true,
      });
      expect(open).to.not.have.been.called;
    } catch (expected) {}
  });

  it('should stop event propagation', () => {
    const event = makeClickEvent(1001);
    element.implementation_.executeAction({
      method: 'exit',
      args: {target: 'simple'},
      event,
      satisfiesTrust: () => true,
    });
    expect(event.preventDefault).to.have.been.called;
  });

  it('should reject fast clicks', () => {
    const open = sandbox.stub(win, 'open');

    element.implementation_.executeAction({
      method: 'exit',
      args: {target: 'simple'},
      event: makeClickEvent(999),
      satisfiesTrust: () => true,
    });

    element.implementation_.executeAction({
      method: 'exit',
      args: {target: 'twoSecondDelay'},
      event: makeClickEvent(1000), // 1000 ms + 999 from the previous exit.
      satisfiesTrust: () => true,
    });

    expect(open).to.not.have.been.called;
  });

  it('should attempt new-tab navigation', () => {
    const open = sandbox.stub(win, 'open').callsFake(() => {
      return {name: 'fakeWin'};
    });

    element.implementation_.executeAction({
      method: 'exit',
      args: {target: 'simple'},
      event: makeClickEvent(1001),
      satisfiesTrust: () => true,
    });

    expect(open).to.have.been.calledOnce;
    expect(open).to.have.been.calledWith(
        EXIT_CONFIG.targets.simple.finalUrl, '_blank');
  });

  it('should fall back to top navigation', () => {
    const open = sandbox.stub(win, 'open').callsFake(() => null);

    element.implementation_.executeAction({
      method: 'exit',
      args: {target: 'simple'},
      event: makeClickEvent(1001),
      satisfiesTrust: () => true,
    });

    expect(open).to.have.been.calledTwice;
    expect(open).to.have.been.calledWith(
        EXIT_CONFIG.targets.simple.finalUrl, '_blank');
    expect(open).to.have.been.calledWith(
        EXIT_CONFIG.targets.simple.finalUrl, '_top');
  });

  it('should ping tracking URLs with sendBeacon', () => {
    const open = sandbox.stub(win, 'open').callsFake(() => {
      return {name: 'fakeWin'};
    });
    const sendBeacon = sandbox.stub(win.navigator, 'sendBeacon').callsFake(
        () => true);

    element.implementation_.executeAction({
      method: 'exit',
      args: {target: 'tracking'},
      event: makeClickEvent(1001),
      satisfiesTrust: () => true,
    });

    expect(open).to.have.been.calledOnce;
    expect(sendBeacon).to.have.been.calledThrice;
    expect(sendBeacon)
        .to.have.been.calledWith('http://localhost:8000/tracking?1', '');
    expect(sendBeacon)
        .to.have.been.calledWith('http://localhost:8000/tracking?2', '');
    expect(sendBeacon)
        .to.have.been.calledWith('http://localhost:8000/tracking?3', '');
  });

  it('should ping tracking URLs with image requests (no sendBeacon)', () => {
    const open = sandbox.stub(win, 'open').callsFake(() => {
      return {name: 'fakeWin'};
    });

    let sendBeacon;
    if (win.navigator.sendBeacon) {
      sendBeacon = sandbox.stub(win.navigator, 'sendBeacon').callsFake(
          () => true);
    }
    const createElement = sandbox.spy(win.document, 'createElement');

    element.implementation_.executeAction({
      method: 'exit',
      args: {target: 'tracking'},
      event: makeClickEvent(1001),
      satisfiesTrust: () => true,
    });

    expect(open).to.have.been.calledOnce;
    if (win.navigator.sendBeacon) {
      expect(sendBeacon).to.have.been.calledThrice;
    } else {
      expect(createElement.withArgs('img')).to.have.been.calledThrice;
      const imgs = createElement.withArgs('img').returnValues;
      expect(imgs[0].src).to.equal('http://localhost:8000/tracking?1');
      expect(imgs[1].src).to.equal('http://localhost:8000/tracking?2');
      expect(imgs[2].src).to.equal('http://localhost:8000/tracking?3');
    }
  });

  it('should ping tracking URLs with image requests (sendBeacon fails)', () => {
    const open = sandbox.stub(win, 'open').callsFake(() => {
      return {name: 'fakeWin'};
    });

    const sendBeacon = sandbox.stub(win.navigator, 'sendBeacon').callsFake(
        () => false);
    const createElement = sandbox.spy(win.document, 'createElement');

    element.implementation_.executeAction({
      method: 'exit',
      args: {target: 'tracking'},
      event: makeClickEvent(1001),
      satisfiesTrust: () => true,
    });

    expect(open).to.have.been.calledOnce;
    expect(sendBeacon).to.have.been.calledThrice;
    expect(createElement.withArgs('img')).to.have.been.calledThrice;
    const imgs = createElement.withArgs('img').returnValues;
    expect(imgs[0].src).to.equal('http://localhost:8000/tracking?1');
    expect(imgs[1].src).to.equal('http://localhost:8000/tracking?2');
    expect(imgs[2].src).to.equal('http://localhost:8000/tracking?3');
  });

  it('should ping tracking URLs with image requests (transport)', () => {
    const config = {
      targets: EXIT_CONFIG.targets,
      filters: EXIT_CONFIG.filters,
      transport: {
        beacon: false,
      },
    };
    return makeElementWithConfig(config).then(el => {
      const open = sandbox.stub(win, 'open').callsFake(() => {
        return {name: 'fakeWin'};
      });

      const sendBeacon = sandbox.stub(win.navigator, 'sendBeacon').callsFake(
          () => true);
      const createElement = sandbox.spy(win.document, 'createElement');

      el.implementation_.executeAction({
        method: 'exit',
        args: {target: 'tracking'},
        event: makeClickEvent(1001),
        satisfiesTrust: () => true,
      });

      expect(open).to.have.been.calledOnce;
      expect(sendBeacon).to.not.have.been.called;
      expect(createElement.withArgs('img')).to.have.been.calledThrice;
      const imgs = createElement.withArgs('img').returnValues;
      expect(imgs[0].src).to.equal('http://localhost:8000/tracking?1');
      expect(imgs[1].src).to.equal('http://localhost:8000/tracking?2');
      expect(imgs[2].src).to.equal('http://localhost:8000/tracking?3');
    });
  });

  it('should replace standard URL variables', () => {
    const open = sandbox.stub(win, 'open').callsFake(() => {
      return {name: 'fakeWin'};
    });

    if (!win.navigator) {
      win.navigator = {sendBeacon: () => false};
    }
    const sendBeacon = sandbox.stub(win.navigator, 'sendBeacon').callsFake(
        () => true);

    element.implementation_.executeAction({
      method: 'exit',
      args: {target: 'variables'},
      event: makeClickEvent(1001, 101, 102),
      satisfiesTrust: () => true,
    });

    const urlMatcher = sinon.match(new RegExp(
        'http:\\/\\/localhost:8000\\/vars\\?' +
        'foo=bar&ampdoc=AMPDOC_HOST&r=[0-9\\.]+&x=101&y=102'));
    expect(open).to.have.been.calledWith(urlMatcher, '_blank');

    const trackingMatcher = sinon.match(
        /http:\/\/localhost:8000\/tracking\?r=[0-9\.]+&x=101&y=102/);
    expect(sendBeacon).to.have.been.calledWith(trackingMatcher, '');
  });

  it('should replace custom URL variables with vars', () => {
    const open = sandbox.stub(win, 'open').callsFake(() => {
      return {name: 'fakeWin'};
    });

    if (!win.navigator) {
      win.navigator = {sendBeacon: () => false};
    }
    const sendBeacon = sandbox.stub(win.navigator, 'sendBeacon').callsFake(
        () => true);

    element.implementation_.executeAction({
      method: 'exit',
      args: {target: 'customVars', _foo: 'foo', _bar: 'bar', _numVar: 0,
        _boolVar: false},
      event: makeClickEvent(1001, 101, 102),
      satisfiesTrust: () => true,
    });

    expect(open).to.have.been.calledWith(
        'http://localhost:8000/vars?foo=foo', '_blank');
    expect(sendBeacon)
        .to.have.been.calledWith(
            'http://localhost:8000/tracking?bar=bar', '');
    expect(sendBeacon)
        .to.have.been.calledWith(
            'http://localhost:8000/tracking?numVar=0&boolVar=false', '');
  });

  it('border protection', () => {
    const open = sandbox.stub(win, 'open').callsFake(() => {
      return {name: 'fakeWin'};
    });

    win.innerWidth = 1000;
    win.innerHeight = 2000;
    // Replace the getVsync function so that the measure can happen at once.
    element.implementation_.getVsync = () => {
      return {measure: callback => callback()};
    };
    element.implementation_.onLayoutMeasure();

    // The click is within the top border.
    element.implementation_.executeAction({
      method: 'exit',
      args: {target: 'borderProtection'},
      event: makeClickEvent(1001, 500, 8),
      satisfiesTrust: () => true,
    });

    // The click is within the right border.
    element.implementation_.executeAction({
      method: 'exit',
      args: {target: 'borderProtection'},
      event: makeClickEvent(1001, 993, 500),
      satisfiesTrust: () => true,
    });

    // The click is within the bottom border.
    element.implementation_.executeAction({
      method: 'exit',
      args: {target: 'borderProtection'},
      event: makeClickEvent(1001, 500, 1992),
      satisfiesTrust: () => true,
    });

    expect(open).to.not.have.been.called;

    // The click is within the left border but left border protection is not set.
    element.implementation_.executeAction({
      method: 'exit',
      args: {target: 'borderProtection'},
      event: makeClickEvent(1001, 8, 500),
      satisfiesTrust: () => true,
    });

    // THe click is not within the border area.
    element.implementation_.executeAction({
      method: 'exit',
      args: {target: 'borderProtection'},
      event: makeClickEvent(1001, 500, 500),
      satisfiesTrust: () => true,
    });
    expect(open).to.have.been.calledTwice;
    expect(open).to.have.been.calledWith(
        EXIT_CONFIG.targets.borderProtection.finalUrl, '_blank');
  });

  it('border protection relative to div', () => {
    const open = sandbox.stub(win, 'open').callsFake(() => {
      return {name: 'fakeWin'};
    });

    // Replace the getVsync function so that the measure can happen at once.
    element.implementation_.getVsync = () => {
      return {measure: callback => callback()};
    };
    element.implementation_.onLayoutMeasure();

    // The click is within the top border.
    element.implementation_.executeAction({
      method: 'exit',
      args: {target: 'borderProtectionRelativeTo'},
      event: makeClickEvent(1001, 200, 208),
      satisfiesTrust: () => true,
    });

    // The click is within the right border.
    element.implementation_.executeAction({
      method: 'exit',
      args: {target: 'borderProtectionRelativeTo'},
      event: makeClickEvent(1001, 293, 300),
      satisfiesTrust: () => true,
    });

    // The click is within the bottom border.
    element.implementation_.executeAction({
      method: 'exit',
      args: {target: 'borderProtectionRelativeTo'},
      event: makeClickEvent(1001, 200, 392),
      satisfiesTrust: () => true,
    });

    expect(open).to.not.have.been.called;

    // The click is within the left border but left border protection is not set.
    element.implementation_.executeAction({
      method: 'exit',
      args: {target: 'borderProtectionRelativeTo'},
      event: makeClickEvent(1001, 103, 300),
      satisfiesTrust: () => true,
    });

    // THe click is not within the border area.
    element.implementation_.executeAction({
      method: 'exit',
      args: {target: 'borderProtectionRelativeTo'},
      event: makeClickEvent(1001, 200, 300),
      satisfiesTrust: () => true,
    });
    expect(open).to.have.been.calledTwice;
    expect(open).to.have.been.calledWith(
        EXIT_CONFIG.targets.borderProtection.finalUrl, '_blank');
  });

  it('should not trigger for amp-carousel buttons', () => {
    const open = sandbox.stub(win, 'open');
    const fakeCarouselButton = document.createElement('div');
    fakeCarouselButton.classList.add('amp-carousel-button');
    element.implementation_.executeAction({
      method: 'exit',
      args: {target: 'simple'},
      event: makeClickEvent(1001, 200, 300, fakeCarouselButton),
      satisfiesTrust: () => true,
    });
    expect(open).to.not.have.been.called;
  });

  it('should not trigger for elements matching InactiveElementFilter', () => {
    const open = sandbox.stub(win, 'open');
    const unclickable = document.createElement('span');
    unclickable.id = 'unclickable';
    element.implementation_.executeAction({
      method: 'exit',
      args: {target: 'inactiveElementTest'},
      event: makeClickEvent(1001, 200, 300, unclickable),
      satisfiesTrust: () => true,
    });
    expect(open).to.not.have.been.called;
    element.implementation_.executeAction({
      method: 'exit',
      args: {target: 'inactiveElementTest'},
      event: makeClickEvent(1001, 200, 300, win.document.body),
      satisfiesTrust: () => true,
    });
    expect(open).to.have.been.called;
  });

  it('should replace custom URL variables with 3P Analytics defaults', () => {
    const open = sandbox.stub(win, 'open').returns({name: 'fakeWin'});

    element.implementation_.executeAction({
      method: 'exit',
      args: {target: 'variableFrom3pAnalytics'},
      event: makeClickEvent(1004),
      satisfiesTrust: () => true,
    });

    expect(open).to.have.been.calledWith(
        'http://localhost:8000/vars?foo=foo-default', '_blank');
  });

  it('should replace custom URL variables with 3P Analytics signals', () => {
    const open = sandbox.stub(win, 'open').callsFake(() => {
      return {name: 'fakeWin'};
    });

    element.implementation_.vendorResponses_[TEST_3P_VENDOR] = {
      'unused': 'unused',
      'collected-data': 'abc123',
    };

    element.implementation_.executeAction({
      method: 'exit',
      args: {target: 'variableFrom3pAnalytics'},
      event: makeClickEvent(1005),
      satisfiesTrust: () => true,
    });

    expect(open).to.have.been.calledWith(
        'http://localhost:8000/vars?foo=abc123', '_blank');
  });

  it('should reject unrecognized 3P Analytics vendors', () => {
    const unkVendor = JSON.parse(JSON.stringify(EXIT_CONFIG));
    unkVendor.targets.variableFrom3pAnalytics.vars._foo.vendorAnalyticsSource =
        'nonexistent_vendor';

    expect(makeElementWithConfig(unkVendor))
        .to.eventually.be.rejectedWith(/Unknown vendor/);
  });
});

