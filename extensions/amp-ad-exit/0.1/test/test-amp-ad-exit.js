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

import {AmpAdExit} from '../amp-ad-exit';
import {FilterType} from '../filters/filter';
import {IFRAME_TRANSPORTS} from '../../../amp-analytics/0.1/iframe-transport-vendors';
import {installPlatformService} from '../../../../src/service/platform-impl';
import {installTimerService} from '../../../../src/service/timer-impl';
import {setParentWindow} from '../../../../src/service';
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
          iframeTransportSignal: `IFRAME_TRANSPORT_SIGNAL(${TEST_3P_VENDOR},collected-data)`,
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
    clickTargetTest: {
      'finalUrl': 'http://localhost:8000/simple',
      'behaviors': {
        'clickTarget': '_top',
      },
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

describes.realWin(
  'amp-ad-exit',
  {
    amp: {
      ampdoc: 'single',
      extensions: ['amp-ad-exit'],
    },
  },
  (env) => {
    let win;
    let element;
    let clock;

    function makeClickEvent(
      time = 0,
      x = 0,
      y = 0,
      target = win.document.body
    ) {
      clock.tick(time);
      return {
        preventDefault: env.sandbox.spy(),
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
    }

    function pointTo(target) {
      element.implementation_.executeAction({
        method: 'setVariable',
        args: {name: 'indirect', target},
        satisfiesTrust: () => true,
      });
    }

    function exitIndirect() {
      element.implementation_.executeAction({
        method: 'exit',
        args: {variable: 'indirect', default: 'simple'},
        event: makeClickEvent(1001),
        satisfiesTrust: () => true,
      });
    }

    beforeEach(() => {
      clock = env.sandbox.useFakeTimers();
      win = env.win;
      toggleExperiment(win, 'amp-ad-exit', true);
      addAdDiv();
      // TEST_3P_VENDOR must be in IFRAME_TRANSPORTS
      // *before* makeElementWithConfig
      IFRAME_TRANSPORTS[TEST_3P_VENDOR] = '/nowhere.html';
      return makeElementWithConfig(EXIT_CONFIG).then((el) => {
        element = el;
      });
    });

    afterEach(() => {
      env.win.document.body.removeChild(element);
      env.win.document.body.removeChild(env.win.document.getElementById('ad'));
      element = undefined;
      // Without the following, will break amp-analytics' test-vendor.js
      delete IFRAME_TRANSPORTS[TEST_3P_VENDOR];
    });

    it('should reject non-JSON children', () => {
      const el = win.document.createElement('amp-ad-exit');
      el.appendChild(win.document.createElement('p'));
      win.document.body.appendChild(el);
      let promise;
      allowConsoleError(() => (promise = el.build()));
      return promise.should.be.rejectedWith(/application\/json/);
    });

    it('should do nothing for missing targets', () => {
      const open = env.sandbox.stub(win, 'open');
      try {
        allowConsoleError(() =>
          element.implementation_.executeAction({
            method: 'exit',
            args: {target: 'not-a-real-target'},
            event: makeClickEvent(1001),
            satisfiesTrust: () => true,
          })
        );
        expect(open).to.not.have.been.called;
      } catch (expected) {}
    });

    it('should stop event propagation', () => {
      const event = makeClickEvent(1001);
      element.implementation_.executeAction({
        method: 'exit',
        args: {target: 'twoSecondDelay'},
        event,
        satisfiesTrust: () => true,
      });
      expect(event.preventDefault).to.have.been.called;
    });

    it('should reject fast clicks', () => {
      const open = env.sandbox.stub(win, 'open');

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

    it('should use options.startTimingEvent', () => {
      return makeElementWithConfig({
        targets: {
          navStart: {
            'finalUrl': 'http://localhost:8000/simple',
            'filters': ['twoSecond'],
          },
        },
        options: {'startTimingEvent': 'navigationStart'},
        filters: {
          'twoSecond': {
            type: 'clickDelay',
            delay: 2000,
          },
        },
      }).then((el) => {
        expect(el.implementation_.defaultFilters_.length).to.equal(2);
        let clickFilter = el.implementation_.defaultFilters_[0];
        expect(clickFilter.spec.type).to.equal(FilterType.CLICK_DELAY);
        expect(clickFilter.spec.startTimingEvent).to.equal('navigationStart');
        clickFilter = el.implementation_.userFilters_['twoSecond'];
        expect(clickFilter).to.be.ok;
        expect(clickFilter.spec.type).to.equal(FilterType.CLICK_DELAY);
        expect(clickFilter.spec.startTimingEvent).to.equal('navigationStart');
      });
    });

    it('should attempt new-tab navigation', () => {
      const open = env.sandbox.stub(win, 'open').callsFake(() => {
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
        EXIT_CONFIG.targets.simple.finalUrl,
        '_blank'
      );
    });

    it('should fall back to top navigation', () => {
      const open = env.sandbox.stub(win, 'open').callsFake(() => null);

      element.implementation_.executeAction({
        method: 'exit',
        args: {target: 'simple'},
        event: makeClickEvent(1001),
        satisfiesTrust: () => true,
      });

      expect(open).to.have.been.calledTwice;
      expect(open).to.have.been.calledWith(
        EXIT_CONFIG.targets.simple.finalUrl,
        '_blank'
      );
      expect(open).to.have.been.calledWith(
        EXIT_CONFIG.targets.simple.finalUrl,
        '_top'
      );
    });

    it('should attempt same-tab navigation', () => {
      const open = env.sandbox.stub(win, 'open').callsFake(() => {
        return {name: 'fakeWin'};
      });

      element.implementation_.executeAction({
        method: 'exit',
        args: {target: 'clickTargetTest'},
        event: makeClickEvent(1001),
        satisfiesTrust: () => true,
      });

      expect(open).to.have.been.calledOnce;
      expect(open).to.have.been.calledWith(
        EXIT_CONFIG.targets.clickTargetTest.finalUrl,
        '_top'
      );
    });

    it('should ping tracking URLs with sendBeacon', () => {
      const open = env.sandbox.stub(win, 'open').callsFake(() => {
        return {name: 'fakeWin'};
      });
      const sendBeacon = env.sandbox
        .stub(win.navigator, 'sendBeacon')
        .callsFake(() => true);

      element.implementation_.executeAction({
        method: 'exit',
        args: {target: 'tracking'},
        event: makeClickEvent(1001),
        satisfiesTrust: () => true,
      });

      expect(open).to.have.been.calledOnce;
      expect(sendBeacon).to.have.been.calledThrice;
      expect(sendBeacon).to.have.been.calledWith(
        'http://localhost:8000/tracking?1',
        ''
      );
      expect(sendBeacon).to.have.been.calledWith(
        'http://localhost:8000/tracking?2',
        ''
      );
      expect(sendBeacon).to.have.been.calledWith(
        'http://localhost:8000/tracking?3',
        ''
      );
    });

    it('should ping tracking URLs with image requests (no sendBeacon)', () => {
      const open = env.sandbox.stub(win, 'open').callsFake(() => {
        return {name: 'fakeWin'};
      });

      let sendBeacon;
      if (win.navigator.sendBeacon) {
        sendBeacon = env.sandbox
          .stub(win.navigator, 'sendBeacon')
          .callsFake(() => true);
      }
      const createElement = env.sandbox.spy(win.document, 'createElement');

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
      const open = env.sandbox.stub(win, 'open').callsFake(() => {
        return {name: 'fakeWin'};
      });

      const sendBeacon = env.sandbox
        .stub(win.navigator, 'sendBeacon')
        .callsFake(() => false);
      const createElement = env.sandbox.spy(win.document, 'createElement');

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
      return makeElementWithConfig(config).then((el) => {
        const open = env.sandbox.stub(win, 'open').callsFake(() => {
          return {name: 'fakeWin'};
        });

        const sendBeacon = env.sandbox
          .stub(win.navigator, 'sendBeacon')
          .callsFake(() => true);
        const createElement = env.sandbox.spy(win.document, 'createElement');

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
      const open = env.sandbox.stub(win, 'open').callsFake(() => {
        return {name: 'fakeWin'};
      });

      if (!win.navigator) {
        win.navigator = {sendBeacon: () => false};
      }
      const sendBeacon = env.sandbox
        .stub(win.navigator, 'sendBeacon')
        .callsFake(() => true);

      element.implementation_.executeAction({
        method: 'exit',
        args: {target: 'variables'},
        event: makeClickEvent(1001, 101, 102),
        satisfiesTrust: () => true,
      });

      const urlMatcher = env.sandbox.match(
        new RegExp(
          'http:\\/\\/localhost:8000\\/vars\\?' +
            'foo=bar&ampdoc=AMPDOC_HOST&r=[0-9\\.]+&x=101&y=102'
        )
      );
      expect(open).to.have.been.calledWith(urlMatcher, '_blank');

      const trackingMatcher = env.sandbox.match(
        /http:\/\/localhost:8000\/tracking\?r=[0-9\.]+&x=101&y=102/
      );
      expect(sendBeacon).to.have.been.calledWith(trackingMatcher, '');
    });

    it('should replace custom URL variables with vars', () => {
      const open = env.sandbox.stub(win, 'open').callsFake(() => {
        return {name: 'fakeWin'};
      });

      if (!win.navigator) {
        win.navigator = {sendBeacon: () => false};
      }
      const sendBeacon = env.sandbox
        .stub(win.navigator, 'sendBeacon')
        .callsFake(() => true);

      element.implementation_.executeAction({
        method: 'exit',
        args: {
          target: 'customVars',
          _foo: 'foo',
          _bar: 'bar',
          _numVar: 0,
          _boolVar: false,
        },
        event: makeClickEvent(1001, 101, 102),
        satisfiesTrust: () => true,
      });

      expect(open).to.have.been.calledWith(
        'http://localhost:8000/vars?foo=foo',
        '_blank'
      );
      expect(sendBeacon).to.have.been.calledWith(
        'http://localhost:8000/tracking?bar=bar',
        ''
      );
      expect(sendBeacon).to.have.been.calledWith(
        'http://localhost:8000/tracking?numVar=0&boolVar=false',
        ''
      );
    });

    it('border protection', () => {
      const open = env.sandbox.stub(win, 'open').callsFake(() => {
        return {name: 'fakeWin'};
      });

      win.innerWidth = 1000;
      win.innerHeight = 2000;
      // Replace the getVsync function so that the measure can happen at once.
      element.implementation_.getVsync = () => {
        return {measure: (callback) => callback()};
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

      // The click is within the left border but left border protection is not
      // set.
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
        EXIT_CONFIG.targets.borderProtection.finalUrl,
        '_blank'
      );
    });

    it('border protection relative to div', () => {
      const open = env.sandbox.stub(win, 'open').callsFake(() => {
        return {name: 'fakeWin'};
      });

      // Replace the getVsync function so that the measure can happen at once.
      element.implementation_.getVsync = () => {
        return {measure: (callback) => callback()};
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

      // The click is within the left border but left border protection is not
      // set.
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
        EXIT_CONFIG.targets.borderProtection.finalUrl,
        '_blank'
      );
    });

    it('should not trigger for amp-carousel buttons', () => {
      const open = env.sandbox.stub(win, 'open');
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
      const open = env.sandbox.stub(win, 'open');
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
      const open = env.sandbox.stub(win, 'open').returns({name: 'fakeWin'});

      element.implementation_.executeAction({
        method: 'exit',
        args: {target: 'variableFrom3pAnalytics'},
        event: makeClickEvent(1004),
        satisfiesTrust: () => true,
      });

      expect(open).to.have.been.calledWith(
        'http://localhost:8000/vars?foo=foo-default',
        '_blank'
      );
    });

    it('should replace custom URL variables with 3P Analytics signals', () => {
      const open = env.sandbox.stub(win, 'open').callsFake(() => {
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
        'http://localhost:8000/vars?foo=abc123',
        '_blank'
      );
    });

    it('should reject unrecognized 3P Analytics vendors', () => {
      const unkVendor = JSON.parse(JSON.stringify(EXIT_CONFIG));
      unkVendor.targets.variableFrom3pAnalytics.vars._foo.vendorAnalyticsSource =
        'nonexistent_vendor';

      expect(makeElementWithConfig(unkVendor)).to.eventually.be.rejectedWith(
        /Unknown vendor/
      );
    });

    it('getAmpAdResourceId_ should reference AMP top window', () => {
      const frame = win.document.createElement('iframe');
      win.document.body.appendChild(frame);
      const doc = frame.contentDocument;
      const ampAd = doc.createElement('amp-ad');
      ampAd.getResourceId = () => 12345;
      doc.body.appendChild(ampAd);
      const adFrame = doc.createElement('iframe');
      ampAd.appendChild(adFrame);
      const ampAdExitElement = adFrame.contentDocument.createElement(
        'amp-ad-exit'
      );
      adFrame.contentDocument.body.appendChild(ampAdExitElement);
      installTimerService(frame.contentWindow);
      installPlatformService(frame.contentWindow);
      setParentWindow(adFrame.contentWindow, frame.contentWindow);
      expect(new AmpAdExit(ampAdExitElement).getAmpAdResourceId_()).to.equal(
        '12345'
      );
    });

    it('should exit to the default target if varible target is never set', () => {
      const open = env.sandbox.stub(win, 'open').callsFake(() => {
        return {name: 'fakeWin'};
      });
      exitIndirect();
      expect(open).to.have.been.calledOnce;
      expect(open).to.have.been.calledWith(
        EXIT_CONFIG.targets.simple.finalUrl,
        '_blank'
      );
    });

    it('should cause error when variable target is never set and default value is not provided', () => {
      try {
        allowConsoleError(() => {
          element.implementation_.executeAction({
            method: 'exit',
            args: {
              variable: 'indirect',
            },
            event: makeClickEvent(1001),
            satisfiesTrust: () => true,
          });
        });
      } catch (expected) {
        return;
      }
      expect.fail();
    });

    it('should cause error when variable target was pointed to an invalid target', () => {
      try {
        allowConsoleError(() => {
          pointTo('not-a-real-target');
        });
      } catch (expected) {
        return;
      }
      expect.fail();
    });

    it('should cause error when exiting to an invalid variable target', () => {
      try {
        allowConsoleError(() => {
          element.implementation_.executeAction({
            method: 'exit',
            args: {variable: 'not-a-real-target', default: 'not-a-real-target'},
            event: makeClickEvent(1001),
            satisfiesTrust: () => true,
          });
        });
      } catch (expected) {
        return;
      }
      expect.fail();
    });

    it('should cause error when neither "target" nor "variable" is provided in arguments', () => {
      try {
        allowConsoleError(() => {
          element.implementation_.executeAction({
            method: 'exit',
            args: {},
            event: makeClickEvent(1001),
            satisfiesTrust: () => true,
          });
        });
      } catch (expected) {
        return;
      }
      expect.fail();
    });

    it('should cause error when both "target" and "variable" are provided in arguments', () => {
      try {
        allowConsoleError(() => {
          element.implementation_.executeAction({
            method: 'exit',
            args: {
              target: 'customVars',
              variable: 'indirect',
              default: 'simple',
            },
            event: makeClickEvent(1001),
            satisfiesTrust: () => true,
          });
        });
      } catch (expected) {
        return;
      }
      expect.fail();
    });

    it('should exit to the pointed-to target and work with custom URL variables', () => {
      const open = env.sandbox.stub(win, 'open').callsFake(() => {
        return {name: 'fakeWin'};
      });
      if (!win.navigator) {
        win.navigator = {sendBeacon: () => false};
      }
      const sendBeacon = env.sandbox
        .stub(win.navigator, 'sendBeacon')
        .callsFake(() => true);

      pointTo('clickTargetTest');
      exitIndirect();
      expect(open).to.have.been.calledOnce;
      expect(open).to.have.been.calledWith(
        EXIT_CONFIG.targets.clickTargetTest.finalUrl,
        '_top'
      );

      pointTo('customVars');
      element.implementation_.executeAction({
        method: 'exit',
        args: {
          variable: 'indirect',
          _foo: 'foo',
          _bar: 'bar',
          _numVar: 0,
          _boolVar: false,
        },
        event: makeClickEvent(1001, 101, 102),
        satisfiesTrust: () => true,
      });
      expect(open).to.have.been.calledTwice;
      expect(open).to.have.been.calledWith(
        'http://localhost:8000/vars?foo=foo',
        '_blank'
      );
      expect(sendBeacon).to.have.been.calledWith(
        'http://localhost:8000/tracking?bar=bar',
        ''
      );
      expect(sendBeacon).to.have.been.calledWith(
        'http://localhost:8000/tracking?numVar=0&boolVar=false',
        ''
      );
    });
  }
);
