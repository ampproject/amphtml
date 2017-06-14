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

import '../amp-ad-exit';
import * as sinon from 'sinon';
import {toggleExperiment} from '../../../../src/experiments';

const EXIT_CONFIG = {
  targets: {
    simple: {'finalUrl': 'http://localhost:8000/simple'},
    twoSecondDelay: {
      'finalUrl': 'http://localhost:8000/simple',
      'filters': ['twoSecond'],
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
      ],
      vars: {
        _foo: {
          defaultValue: 'foo-default',
        },
        _bar: {
          defaultValue: 'bar-default',
        },
      },
    },
  },
  filters: {
    'twoSecond': {
      type: 'clickDelay',
      delay: 2000,
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

  function makeClickEvent(time = 0, x = 0, y = 0) {
    sandbox.clock.tick(time);
    return {
      preventDefault: sandbox.spy(),
      clientX: x,
      clientY: y,
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
    el.build();
    return el;
  }

  beforeEach(() => {
    sandbox = sinon.sandbox.create({useFakeTimers: true});
    win = env.win;
    toggleExperiment(win, 'amp-ad-exit', true);
    element = makeElementWithConfig(EXIT_CONFIG);
  });

  afterEach(() => {
    sandbox.restore();
    env.win.document.body.removeChild(element);
    element = undefined;
  });

  it('should reject non-JSON children', () => {
    const el = win.document.createElement('amp-ad-exit');
    el.appendChild(win.document.createElement('p'));
    win.document.body.appendChild(el);
    expect(() => el.build()).to.throw(/application\/json/);
  });

  it('should do nothing for missing targets', () => {
    const open = sandbox.stub(win, 'open');
    try {
      element.implementation_.executeAction({
        method: 'exit',
        args: {target: 'not-a-real-target'},
        event: makeClickEvent(1001),
      });
      expect(open).to.not.have.been.called;
    } catch (expected) {}
  });

  it('should stop event propagation', () => {
    const event = makeClickEvent();
    element.implementation_.executeAction({
      method: 'exit',
      args: {target: 'simple'},
      event,
    });
    expect(event.preventDefault).to.have.been.called;
  });

  it('should reject fast clicks', () => {
    const open = sandbox.stub(win, 'open');

    element.implementation_.executeAction({
      method: 'exit',
      args: {target: 'simple'},
      event: makeClickEvent(999),
    });

    element.implementation_.executeAction({
      method: 'exit',
      args: {target: 'twoSecondDelay'},
      event: makeClickEvent(1000),  // 1000 ms + 999 from the previous exit.
    });

    expect(open).to.not.have.been.called;
  });

  it('should attempt new-tab navigation', () => {
    const open = sandbox.stub(win, 'open', () => {
      return {name: 'fakeWin'};
    });

    element.implementation_.executeAction({
      method: 'exit',
      args: {target: 'simple'},
      event: makeClickEvent(1001),
    });

    expect(open).to.have.been.calledOnce;
    expect(open).to.have.been.calledWith(
        EXIT_CONFIG.targets.simple.finalUrl, '_blank');
  });

  it('should fall back to top navigation', () => {
    const open = sandbox.stub(win, 'open', () => null);

    element.implementation_.executeAction({
      method: 'exit',
      args: {target: 'simple'},
      event: makeClickEvent(1001),
    });

    expect(open).to.have.been.calledTwice;
    expect(open).to.have.been.calledWith(
        EXIT_CONFIG.targets.simple.finalUrl, '_blank');
    expect(open).to.have.been.calledWith(
        EXIT_CONFIG.targets.simple.finalUrl, '_top');
  });

  it('should ping tracking URLs with sendBeacon', () => {
    const open = sandbox.stub(win, 'open', () => {
      return {name: 'fakeWin'};
    });
    const sendBeacon = sandbox.stub(win.navigator, 'sendBeacon', () => true);

    element.implementation_.executeAction({
      method: 'exit',
      args: {target: 'tracking'},
      event: makeClickEvent(1001),
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
    const open = sandbox.stub(win, 'open', () => {
      return {name: 'fakeWin'};
    });

    let sendBeacon;
    if (win.navigator.sendBeacon) {
      sendBeacon = sandbox.stub(win.navigator, 'sendBeacon', () => true);
    }
    const createElement = sandbox.spy(win.document, 'createElement');

    element.implementation_.executeAction({
      method: 'exit',
      args: {target: 'tracking'},
      event: makeClickEvent(1001),
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
    const open = sandbox.stub(win, 'open', () => {
      return {name: 'fakeWin'};
    });

    const sendBeacon = sandbox.stub(win.navigator, 'sendBeacon', () => false);
    const createElement = sandbox.spy(win.document, 'createElement');

    element.implementation_.executeAction({
      method: 'exit',
      args: {target: 'tracking'},
      event: makeClickEvent(1001),
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
    const el = makeElementWithConfig(config);

    const open = sandbox.stub(win, 'open', () => {
      return {name: 'fakeWin'};
    });

    const sendBeacon = sandbox.stub(win.navigator, 'sendBeacon', () => true);
    const createElement = sandbox.spy(win.document, 'createElement');

    el.implementation_.executeAction({
      method: 'exit',
      args: {target: 'tracking'},
      event: makeClickEvent(1001),
    });

    expect(open).to.have.been.calledOnce;
    expect(sendBeacon).to.not.have.been.called;
    expect(createElement.withArgs('img')).to.have.been.calledThrice;
    const imgs = createElement.withArgs('img').returnValues;
    expect(imgs[0].src).to.equal('http://localhost:8000/tracking?1');
    expect(imgs[1].src).to.equal('http://localhost:8000/tracking?2');
    expect(imgs[2].src).to.equal('http://localhost:8000/tracking?3');
  });

  it('should replace standard URL variables', () => {
    const open = sandbox.stub(win, 'open', () => {
      return {name: 'fakeWin'};
    });

    if (!win.navigator) {
      win.navigator = {sendBeacon: () => false};
    }
    const sendBeacon =
        sandbox.stub(win.navigator, 'sendBeacon', () => true);

    element.implementation_.executeAction({
      method: 'exit',
      args: {target: 'variables'},
      event: makeClickEvent(1001, 101, 102),
    });

    const urlMatcher = sinon.match(new RegExp(
        'http:\\/\\/localhost:8000\\/vars\\?' +
        'foo=bar&ampdoc=AMPDOC_HOST&r=[0-9\\.]+&x=101&y=102'));
    expect(open).to.have.been.calledWith(urlMatcher, '_blank');

    const trackingMatcher = sinon.match(
        /http:\/\/localhost:8000\/tracking\?r=[0-9\.]+&x=101&y=102/);
    expect(sendBeacon).to.have.been.calledWith(trackingMatcher, '');
  });

  it('should replace custom URL variables', () => {
    const open = sandbox.stub(win, 'open', () => {
      return {name: 'fakeWin'};
    });

    if (!win.navigator) {
      win.navigator = {sendBeacon: () => false};
    }
    const sendBeacon =
        sandbox.stub(win.navigator, 'sendBeacon', () => true);

    element.implementation_.executeAction({
      method: 'exit',
      args: {target: 'customVars', _foo: 'foo', _bar: 'bar'},
      event: makeClickEvent(1001, 101, 102),
    });

    expect(open).to.have.been.calledWith(
        'http://localhost:8000/vars?foo=foo', '_blank');
    expect(sendBeacon)
        .to.have.been.calledWith(
        'http://localhost:8000/tracking?bar=bar', '');
  });
});
