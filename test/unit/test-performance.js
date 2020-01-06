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

import * as IniLoad from '../../src/ini-load';
import * as lolex from 'lolex';
import {Services} from '../../src/services';
import {VisibilityState} from '../../src/visibility-state';
import {getMode} from '../../src/mode';
import {installPerformanceService} from '../../src/service/performance-impl';
import {installPlatformService} from '../../src/service/platform-impl';
import {installRuntimeServices} from '../../src/service/core-services';

describes.realWin('performance', {amp: true}, env => {
  let perf;
  let clock;
  let win;
  let ampdoc;

  beforeEach(() => {
    win = env.win;
    ampdoc = env.ampdoc;
    clock = lolex.install({
      target: win,
      toFake: ['Date', 'setTimeout', 'clearTimeout'],
    });
    installPlatformService(env.win);
    installPerformanceService(env.win);
    perf = Services.performanceFor(env.win);
  });

  afterEach(() => {
    clock.uninstall();
  });

  describe('when viewer is not ready', () => {
    it('should queue up tick events', () => {
      expect(perf.events_.length).to.equal(0);

      perf.tick('start');
      expect(perf.events_.length).to.equal(1);

      perf.tick('startEnd');
      expect(perf.events_.length).to.equal(2);
    });

    it('should map tickDelta to tick', () => {
      expect(perf.events_.length).to.equal(0);

      perf.tickDelta('test', 99);
      expect(perf.events_.length).to.equal(1);
      expect(perf.events_[0]).to.be.jsonEqual({
        label: 'test',
        delta: 99,
      });
    });

    it('should map tickDelta to non-zero tick', () => {
      let c = 0;
      expect(perf.events_.length).to.equal(c);

      perf.tickDelta('test1', 0);
      expect(perf.events_.length).to.equal(c + 1);
      expect(perf.events_[c]).to.be.jsonEqual({
        label: 'test1',
        delta: 0,
      });

      c++;
      perf.tickDelta('test2', -1);
      expect(perf.events_.length).to.equal(c + 1);
      expect(perf.events_[c]).to.be.jsonEqual({
        label: 'test2',
        delta: 0,
      });

      c++;
      perf.tickDelta('test3', 2);
      expect(perf.events_.length).to.equal(c + 1);
      expect(perf.events_[c]).to.be.jsonEqual({
        label: 'test3',
        delta: 2,
      });
    });

    it('should have max 50 queued events', () => {
      expect(perf.events_.length).to.equal(0);

      for (let i = 0; i < 200; i++) {
        perf.tick(`start${i}`);
      }

      expect(perf.events_.length).to.equal(50);
    });

    it(
      'should add default optional relative start time on the ' +
        'queued tick event',
      () => {
        clock.tick(150);
        perf.tick('start0');

        expect(perf.events_[0]).to.be.jsonEqual({
          label: 'start0',
          value: 150,
        });
      }
    );

    it('should drop events in the head of the queue', () => {
      const tickTime = 100;
      clock.tick(tickTime);

      expect(perf.events_.length).to.equal(0);

      for (let i = 0; i < 50; i++) {
        perf.tick(`start${i}`);
      }

      expect(perf.events_.length).to.equal(50);
      expect(perf.events_[0]).to.be.jsonEqual({
        label: 'start0',
        value: tickTime,
      });

      clock.tick(1);
      perf.tick('start50');

      expect(perf.events_[0]).to.be.jsonEqual({
        label: 'start1',
        value: tickTime,
      });
      expect(perf.events_[49]).to.be.jsonEqual({
        label: 'start50',
        value: tickTime + 1,
      });
    });
  });

  describe
    .configure()
    .skipFirefox()
    .run('when viewer is ready,', () => {
      let viewer;
      let viewerSendMessageStub;

      beforeEach(() => {
        viewer = Services.viewerForDoc(ampdoc);
        viewerSendMessageStub = env.sandbox.stub(viewer, 'sendMessage');
      });

      describe('config', () => {
        it(
          'should configure correctly when viewer is embedded and supports ' +
            'csi',
          () => {
            env.sandbox
              .stub(viewer, 'getParam')
              .withArgs('csi')
              .returns('1');
            env.sandbox.stub(viewer, 'isEmbedded').returns(true);
            perf.coreServicesAvailable().then(() => {
              expect(perf.isPerformanceTrackingOn()).to.be.true;
            });
          }
        );

        it(
          'should configure correctly when viewer is embedded and does ' +
            'NOT support csi',
          () => {
            env.sandbox
              .stub(viewer, 'getParam')
              .withArgs('csi')
              .returns('0');
            env.sandbox.stub(viewer, 'isEmbedded').returns(true);
            perf.coreServicesAvailable().then(() => {
              expect(perf.isPerformanceTrackingOn()).to.be.false;
            });
          }
        );

        it(
          'should configure correctly when viewer is embedded and does ' +
            'NOT support csi',
          () => {
            env.sandbox
              .stub(viewer, 'getParam')
              .withArgs('csi')
              .returns(null);
            env.sandbox.stub(viewer, 'isEmbedded').returns(true);
            perf.coreServicesAvailable().then(() => {
              expect(perf.isPerformanceTrackingOn()).to.be.false;
            });
          }
        );

        it('should configure correctly when viewer is not embedded', () => {
          env.sandbox
            .stub(viewer, 'getParam')
            .withArgs('csi')
            .returns(null);
          env.sandbox.stub(viewer, 'isEmbedded').returns(false);
          perf.coreServicesAvailable().then(() => {
            expect(perf.isPerformanceTrackingOn()).to.be.false;
          });
        });
      });

      describe('channel established', () => {
        it('should flush events when channel is ready', () => {
          env.sandbox
            .stub(viewer, 'getParam')
            .withArgs('csi')
            .returns(null);
          env.sandbox
            .stub(viewer, 'whenMessagingReady')
            .returns(Promise.resolve());
          expect(perf.isMessagingReady_).to.be.false;
          const promise = perf.coreServicesAvailable();
          expect(perf.events_.length).to.equal(0);

          perf.tick('start');
          expect(perf.events_.length).to.equal(1);

          perf.tick('startEnd');
          expect(perf.events_.length).to.equal(2);
          expect(perf.isMessagingReady_).to.be.false;

          const flushSpy = env.sandbox.spy(perf, 'flush');
          expect(flushSpy).to.have.callCount(0);
          perf.flush();
          expect(flushSpy).to.have.callCount(1);
          expect(perf.events_.length).to.equal(2);

          perf.isPerformanceTrackingOn_ = true;
          clock.tick(1);
          return promise.then(() => {
            expect(perf.isMessagingReady_).to.be.true;
            const msrCalls = viewerSendMessageStub.withArgs(
              'tick',
              env.sandbox.match(arg => arg.label == 'msr')
            );
            expect(msrCalls).to.be.calledOnce;
            expect(msrCalls.args[0][1]).to.be.jsonEqual({
              label: 'msr',
              delta: 1,
            });
            expect(flushSpy).to.have.callCount(5);
            expect(perf.events_.length).to.equal(0);
          });
        });
      });

      describe('channel not established', () => {
        it('should not flush anything', () => {
          env.sandbox.stub(viewer, 'whenMessagingReady').returns(null);
          expect(perf.isMessagingReady_).to.be.false;

          expect(perf.events_.length).to.equal(0);

          perf.tick('start');
          expect(perf.events_.length).to.equal(1);

          perf.tick('startEnd');
          expect(perf.events_.length).to.equal(2);
          expect(perf.isMessagingReady_).to.be.false;

          const flushSpy = env.sandbox.spy(perf, 'flush');
          expect(flushSpy).to.have.callCount(0);
          perf.flush();
          expect(flushSpy).to.have.callCount(1);
          expect(perf.events_.length).to.equal(2);

          return Promise.all([
            perf.coreServicesAvailable(),
            ampdoc.whenFirstVisible(),
          ]).then(() => {
            expect(flushSpy).to.have.callCount(4);
            expect(perf.isMessagingReady_).to.be.false;
            const count = 5;
            expect(perf.events_.length).to.equal(count);
          });
        });
      });

      describe('tickSinceVisible', () => {
        let tickDeltaStub;
        let firstVisibleTime;

        beforeEach(() => {
          tickDeltaStub = env.sandbox.stub(perf, 'tickDelta');
          firstVisibleTime = null;
          env.sandbox
            .stub(ampdoc, 'getFirstVisibleTime')
            .callsFake(() => firstVisibleTime);
        });

        it('should always be zero before viewer is set', () => {
          clock.tick(10);
          perf.tickSinceVisible('test');

          expect(tickDeltaStub).to.have.been.calledOnce;
          expect(tickDeltaStub.firstCall.args[1]).to.equal(0);
        });

        it('should always be zero before visible', () => {
          perf.coreServicesAvailable();

          clock.tick(10);
          perf.tickSinceVisible('test');

          expect(tickDeltaStub).to.have.been.calledOnce;
          expect(tickDeltaStub.firstCall.args[1]).to.equal(0);
        });

        it('should calculate after visible', () => {
          perf.coreServicesAvailable();
          firstVisibleTime = 5;

          clock.tick(10);
          perf.tickSinceVisible('test');

          expect(tickDeltaStub).to.have.been.calledOnce;
          expect(tickDeltaStub.firstCall.args[1]).to.equal(5);
        });

        it('should be zero after visible but for earlier event', () => {
          perf.coreServicesAvailable();
          firstVisibleTime = 5;

          // An earlier event, since event time (4) is less than visible time (5).
          clock.tick(4);
          perf.tickSinceVisible('test');

          expect(tickDeltaStub).to.have.been.calledOnce;
          expect(tickDeltaStub.firstCall.args[1]).to.equal(0);
        });
      });

      describe('and performanceTracking is off', () => {
        beforeEach(() => {
          env.sandbox
            .stub(viewer, 'getParam')
            .withArgs('csi')
            .returns(null);
          env.sandbox.stub(viewer, 'isEmbedded').returns(false);
        });

        it('should not forward queued ticks', () => {
          perf.tick('start0');
          clock.tick(1);
          perf.tick('start1', 'start0');

          expect(perf.events_.length).to.equal(2);

          return perf.coreServicesAvailable().then(() => {
            perf.flushQueuedTicks_();
            perf.flush();
            expect(perf.events_.length).to.equal(0);

            expect(viewerSendMessageStub.withArgs('tick')).to.not.be.called;
            expect(
              viewerSendMessageStub.withArgs(
                'sendCsi',
                undefined,
                /* cancelUnsent */ true
              )
            ).to.not.be.called;
          });
        });

        it('should ignore all calls to tick', () => {
          perf.tick('start0');
          return perf.coreServicesAvailable().then(() => {
            expect(viewerSendMessageStub.withArgs('tick')).to.not.be.called;
          });
        });

        it('should ignore all calls to flush', () => {
          perf.tick('start0');
          perf.flush();
          return perf.coreServicesAvailable().then(() => {
            expect(
              viewerSendMessageStub.withArgs(
                'sendCsi',
                undefined,
                /* cancelUnsent */ true
              )
            ).to.not.be.called;
          });
        });
      });

      describe('and performanceTracking is on', () => {
        beforeEach(() => {
          env.sandbox
            .stub(viewer, 'getParam')
            .withArgs('csi')
            .returns('1');
          env.sandbox.stub(viewer, 'isEmbedded').returns(true);
          env.sandbox
            .stub(viewer, 'whenMessagingReady')
            .returns(Promise.resolve());
        });

        it('should forward all queued tick events', () => {
          perf.tick('start0');
          clock.tick(1);
          perf.tick('start1');

          expect(perf.events_.length).to.equal(2);

          return perf.coreServicesAvailable().then(() => {
            expect(
              viewerSendMessageStub.withArgs('tick').getCall(0).args[1]
            ).to.be.jsonEqual({
              label: 'start0',
              value: 0,
            });
            expect(
              viewerSendMessageStub.withArgs('tick').getCall(1).args[1]
            ).to.be.jsonEqual({
              label: 'start1',
              value: 1,
            });
            expect(
              viewerSendMessageStub.withArgs('tick').getCall(4).args[1]
            ).to.be.jsonEqual({
              label: 'msr',
              delta: 1,
            });
          });
        });

        it('should have no more queued tick events after flush', () => {
          perf.tick('start0');
          perf.tick('start1');

          expect(perf.events_.length).to.equal(2);

          return perf.coreServicesAvailable().then(() => {
            expect(perf.events_.length).to.equal(0);
          });
        });

        it('should forward tick events', () => {
          return perf.coreServicesAvailable().then(() => {
            clock.tick(100);
            perf.tick('start0');
            perf.tick('start1', 300);

            expect(
              viewerSendMessageStub.withArgs(
                'tick',
                env.sandbox.match(arg => arg.label == 'start0')
              ).args[0][1]
            ).to.be.jsonEqual({
              label: 'start0',
              value: 100,
            });
            expect(
              viewerSendMessageStub.withArgs(
                'tick',
                env.sandbox.match(arg => arg.label == 'start1')
              ).args[0][1]
            ).to.be.jsonEqual({
              label: 'start1',
              delta: 300,
            });
          });
        });

        it('should call the flush callback', () => {
          // Make sure "first visible" arrives after "channel ready".
          const firstVisiblePromise = new Promise(() => {});
          env.sandbox
            .stub(ampdoc, 'whenFirstVisible')
            .returns(firstVisiblePromise);
          expect(viewerSendMessageStub.withArgs('sendCsi')).to.have.callCount(
            0
          );
          // coreServicesAvailable calls flush once.
          return perf.coreServicesAvailable().then(() => {
            expect(viewerSendMessageStub.withArgs('sendCsi')).to.have.callCount(
              1
            );
            perf.flush();
            expect(viewerSendMessageStub.withArgs('sendCsi')).to.have.callCount(
              2
            );
            perf.flush();
            expect(viewerSendMessageStub.withArgs('sendCsi')).to.have.callCount(
              3
            );
          });
        });

        it('should flush with the story experiment enabled', () => {
          const storyEl = win.document.createElement('amp-story');
          const bodyEl = win.document.body;
          bodyEl.insertBefore(storyEl, bodyEl.firstElementChild || null);

          return perf.coreServicesAvailable().then(() => {
            expect(viewerSendMessageStub.withArgs('sendCsi')).to.have.callCount(
              1
            );
            const call = viewerSendMessageStub.withArgs('sendCsi').getCall(0);
            expect(call.args[1]).to.have.property('ampexp');
            expect(call.args[1].ampexp).to.contain('story');
          });
        });
      });
    });

  it('should wait for visible resources', () => {
    const resources = Services.resourcesForDoc(ampdoc);
    env.sandbox.stub(resources, 'whenFirstPass').returns(Promise.resolve());
    const whenContentIniLoadStub = env.sandbox
      .stub(IniLoad, 'whenContentIniLoad')
      .returns(Promise.resolve());
    perf.resources_ = resources;

    return perf.whenViewportLayoutComplete_().then(() => {
      expect(whenContentIniLoadStub).to.be.calledWith(
        perf.win.document.documentElement,
        perf.win,
        env.sandbox.match(
          arg =>
            arg.left == 0 &&
            arg.top == 0 &&
            arg.width == perf.win.innerWidth &&
            arg.height == perf.win.innerHeight
        ),
        /* inPrerender */ true
      );
    });
  });

  describe('coreServicesAvailable', () => {
    let tickSpy;
    let viewer;
    let viewerSendMessageStub;
    let whenFirstVisiblePromise;
    let whenFirstVisibleResolve;
    let whenViewportLayoutCompletePromise;
    let whenViewportLayoutCompleteResolve;

    function stubHasBeenVisible(visibility) {
      env.sandbox.stub(ampdoc, 'hasBeenVisible').returns(visibility);
    }

    function getPerformanceMarks() {
      return win.performance.getEntriesByType('mark').map(entry => entry.name);
    }

    beforeEach(() => {
      viewer = Services.viewerForDoc(ampdoc);
      env.sandbox.stub(viewer, 'whenMessagingReady').returns(Promise.resolve());
      viewerSendMessageStub = env.sandbox.stub(viewer, 'sendMessage');

      tickSpy = env.sandbox.spy(perf, 'tick');

      whenFirstVisiblePromise = new Promise(resolve => {
        whenFirstVisibleResolve = resolve;
      });

      whenViewportLayoutCompletePromise = new Promise(resolve => {
        whenViewportLayoutCompleteResolve = resolve;
      });

      env.sandbox
        .stub(ampdoc, 'whenFirstVisible')
        .returns(whenFirstVisiblePromise);
      env.sandbox
        .stub(perf, 'whenViewportLayoutComplete_')
        .returns(whenViewportLayoutCompletePromise);
      return viewer.whenMessagingReady();
    });

    describe('document started in prerender', () => {
      beforeEach(() => {
        clock.tick(100);
        stubHasBeenVisible(false);
        return perf.coreServicesAvailable();
      });

      it('should call prerenderComplete on viewer', () => {
        clock.tick(100);
        whenFirstVisibleResolve();
        env.sandbox
          .stub(viewer, 'getParam')
          .withArgs('csi')
          .returns('1');
        env.sandbox.stub(viewer, 'isEmbedded').returns(true);
        return ampdoc.whenFirstVisible().then(() => {
          clock.tick(400);
          whenViewportLayoutCompleteResolve();
          return perf.whenViewportLayoutComplete_().then(() => {
            expect(
              viewerSendMessageStub.withArgs('prerenderComplete').firstCall
                .args[1].value
            ).to.equal(400);

            expect(getPerformanceMarks()).to.have.members([
              'dr',
              'ol',
              'visible',
              'ofv',
              'pc',
            ]);
          });
        });
      });

      it('should call prerenderComplete on viewer even if csi is off', () => {
        clock.tick(100);
        whenFirstVisibleResolve();
        env.sandbox
          .stub(viewer, 'getParam')
          .withArgs('csi')
          .returns(null);
        return ampdoc.whenFirstVisible().then(() => {
          clock.tick(400);
          whenViewportLayoutCompleteResolve();
          return perf.whenViewportLayoutComplete_().then(() => {
            expect(
              viewerSendMessageStub.withArgs('prerenderComplete').firstCall
                .args[1].value
            ).to.equal(400);
          });
        });
      });

      it(
        'should tick `pc` with delta=400 when user request document ' +
          'to be visible before before first viewport completion',
        () => {
          clock.tick(100);
          whenFirstVisibleResolve();
          expect(tickSpy).to.have.callCount(3);
          return ampdoc.whenFirstVisible().then(() => {
            clock.tick(400);
            expect(tickSpy).to.have.callCount(4);
            whenViewportLayoutCompleteResolve();
            return perf.whenViewportLayoutComplete_().then(() => {
              expect(tickSpy).to.have.callCount(4);
              expect(tickSpy.withArgs('ofv')).to.be.calledOnce;
              return whenFirstVisiblePromise.then(() => {
                expect(tickSpy).to.have.callCount(5);
                expect(tickSpy.withArgs('pc')).to.be.calledOnce;
                expect(Number(tickSpy.withArgs('pc').args[0][1])).to.equal(400);
              });
            });
          });
        }
      );

      it(
        'should tick `pc` with `delta=0` when viewport is complete ' +
          'before user request document to be visible',
        () => {
          clock.tick(300);
          whenViewportLayoutCompleteResolve();
          return perf.whenViewportLayoutComplete_().then(() => {
            expect(tickSpy.withArgs('ol')).to.be.calledOnce;
            expect(tickSpy.withArgs('pc')).to.have.callCount(0);
            whenFirstVisibleResolve();
            return whenFirstVisiblePromise.then(() => {
              expect(tickSpy.withArgs('pc')).to.be.calledOnce;
              expect(Number(tickSpy.withArgs('pc').args[0][1])).to.equal(0);
              expect(getPerformanceMarks()).to.have.members([
                'dr',
                'ol',
                'pc',
                'visible',
                'ofv',
              ]);
            });
          });
        }
      );
    });

    describe('document did not start in prerender', () => {
      beforeEach(() => {
        stubHasBeenVisible(true);
        perf.coreServicesAvailable();
      });

      it('should call prerenderComplete on viewer', () => {
        env.sandbox
          .stub(viewer, 'getParam')
          .withArgs('csi')
          .returns('1');
        env.sandbox.stub(viewer, 'isEmbedded').returns(true);
        clock.tick(300);
        whenViewportLayoutCompleteResolve();
        return perf.whenViewportLayoutComplete_().then(() => {
          expect(
            viewerSendMessageStub.withArgs('prerenderComplete').firstCall
              .args[1].value
          ).to.equal(300);
          expect(getPerformanceMarks()).to.deep.equal(['dr', 'ol', 'pc']);
        });
      });

      it(
        'should tick `pc` with `opt_value=undefined` when user requests ' +
          'document to be visible',
        () => {
          clock.tick(300);
          whenViewportLayoutCompleteResolve();
          return perf.whenViewportLayoutComplete_().then(() => {
            expect(tickSpy.withArgs('ol')).to.be.calledOnce;
            expect(tickSpy.withArgs('pc')).to.be.calledOnce;
            expect(tickSpy.withArgs('pc').args[0][2]).to.be.undefined;
            expect(getPerformanceMarks()).to.deep.equal(['dr', 'ol', 'pc']);
          });
        }
      );
    });
  });
});

describes.realWin('performance with experiment', {amp: true}, env => {
  let win;
  let perf;
  let viewerSendMessageStub;

  beforeEach(() => {
    win = env.win;
    const viewer = Services.viewerForDoc(env.ampdoc);
    viewerSendMessageStub = env.sandbox.stub(viewer, 'sendMessage');
    env.sandbox.stub(viewer, 'whenMessagingReady').returns(Promise.resolve());
    env.sandbox
      .stub(viewer, 'getParam')
      .withArgs('csi')
      .returns('1');
    env.sandbox.stub(viewer, 'isEmbedded').returns(true);
    installPlatformService(win);
    installPerformanceService(win);
    perf = Services.performanceFor(win);
  });

  it('rtvVersion experiment', () => {
    return perf.coreServicesAvailable().then(() => {
      viewerSendMessageStub.reset();
      perf.flush();
      expect(viewerSendMessageStub.lastCall.args[0]).to.equal('sendCsi');
      expect(viewerSendMessageStub.lastCall.args[1].ampexp).to.equal(
        'rtv-' + getMode(win).rtvVersion
      );
    });
  });

  it('addEnabledExperiment should work', () => {
    return perf.coreServicesAvailable().then(() => {
      perf.addEnabledExperiment('experiment-a');
      perf.addEnabledExperiment('experiment-b');
      perf.addEnabledExperiment('experiment-a'); // duplicated entry
      viewerSendMessageStub.reset();
      perf.flush();
      expect(viewerSendMessageStub).to.be.calledWith(
        'sendCsi',
        env.sandbox.match(payload => {
          const experiments = payload.ampexp.split(',');
          expect(experiments).to.have.length(3);
          expect(experiments).to.have.members([
            'rtv-' + getMode(win).rtvVersion,
            'experiment-a',
            'experiment-b',
          ]);
          return true;
        })
      );
    });
  });
});

describes.realWin('PeformanceObserver metrics', {amp: true}, env => {
  // A fake implementation of PerformanceObserver.
  class PerformanceObserverImpl {
    constructor(callback) {
      this.options = {};
      this.callback_ = callback;
      this.isObserving = false;
    }

    observe(options) {
      this.options = options;
      this.isObserving = true;
    }

    disconnect() {
      this.isObserving = false;
    }

    /**
     * Trigger the Observer's callback.
     * @param {!Array} entries
     */
    triggerCallback(entries) {
      this.callback_(entries, this);
    }
  }

  let fakeWin;
  let windowEventListeners;
  let performanceObserver;
  let viewerVisibilityState;

  function setupFakesForVisibilityStateManipulation() {
    // Fake window to fake `document.visibilityState`.
    // TODO: Consider how we can replace this with the fake window object
    // offered in fake-dom.js. We can't immediately because
    // document.visibilityState is a read-only property in that object.
    fakeWin = {
      Date: env.win.Date,
      PerformanceObserver: env.sandbox.stub(),
      addEventListener: env.sandbox.stub(),
      removeEventListener: env.win.removeEventListener,
      dispatchEvent: env.win.dispatchEvent,
      document: {
        addEventListener: env.sandbox.stub(),
        hidden: false,
        readyState: 'complete',
        removeEventListener: env.sandbox.stub(),
        visibilityState: 'visible',
      },
      location: env.win.location,
      navigator: env.win.navigator,
      performance: {
        getEntriesByType: env.sandbox.stub(),
      },
    };

    // Fake window.addEventListener to fake `visibilitychange` and
    // `beforeunload` events.
    windowEventListeners = {};
    fakeWin.addEventListener.callsFake((eventType, handler) => {
      if (!windowEventListeners[eventType]) {
        windowEventListeners[eventType] = [];
      }
      windowEventListeners[eventType].push(handler);
    });

    // Fake the PerformanceObserver implementation so we can send
    // fake PerformanceEntry objects to listeners.
    fakeWin.PerformanceObserver.callsFake(callback => {
      performanceObserver = new PerformanceObserverImpl(callback);
      return performanceObserver;
    });

    // Install services on fakeWin so some behaviors can be stubbed.
    installRuntimeServices(fakeWin);

    const unresolvedPromise = new Promise(() => {});
    const viewportSize = {width: 0, height: 0};
    env.sandbox.stub(Services, 'ampdoc').returns({
      hasBeenVisible: () => {},
      onVisibilityChanged: () => {},
      whenFirstVisible: () => unresolvedPromise,
      getVisibilityState: () => viewerVisibilityState,
    });
    env.sandbox.stub(Services, 'viewerForDoc').returns({
      isEmbedded: () => {},
      whenMessagingReady: () => {},
    });
    env.sandbox.stub(Services, 'resourcesForDoc').returns({
      getResourcesInRect: () => unresolvedPromise,
      whenFirstPass: () => Promise.resolve(),
    });
    env.sandbox.stub(Services, 'viewportForDoc').returns({
      getSize: () => viewportSize,
    });
  }

  function getPerformance() {
    installPerformanceService(fakeWin);
    return Services.performanceFor(fakeWin);
  }

  function toggleVisibility(win, on) {
    win.document.visibilityState = on ? 'visible' : 'hidden';
    fireEvent('visibilitychange');
  }

  function fireEvent(eventName) {
    const event = new Event(eventName);
    (windowEventListeners[eventName] || []).forEach(cb => cb(event));
  }

  describe('should forward paint metrics for performance entries', () => {
    it('created before performance service registered', () => {
      // Pretend that the PaintTiming API exists.
      env.win.PerformancePaintTiming = true;

      const entries = [
        {
          duration: 1,
          entryType: 'paint',
          name: 'first-paint',
          startTime: 10,
        },
        {
          duration: 5,
          entryType: 'paint',
          name: 'first-contentful-paint',
          startTime: 10,
        },
      ];
      const getEntriesByType = env.sandbox.stub();
      getEntriesByType.withArgs('paint').returns(entries);
      getEntriesByType.returns([]);
      env.sandbox
        .stub(env.win.performance, 'getEntriesByType')
        .callsFake(getEntriesByType);

      installPerformanceService(env.win);

      const perf = Services.performanceFor(env.win);

      expect(perf.events_.length).to.equal(2);
      expect(perf.events_[0]).to.be.jsonEqual(
        {
          label: 'fp',
          delta: 11,
        },
        {
          label: 'fcp',
          delta: 15,
        }
      );

      delete env.win.PerformancePaintTiming;
    });

    it('created after performance service registered', () => {
      // Pretend that the PaintTiming API exists.
      env.win.PerformancePaintTiming = true;

      // Stub and fake the PerformanceObserver constructor.
      const PerformanceObserverStub = env.sandbox.stub();

      let performanceObserver;
      PerformanceObserverStub.callsFake(callback => {
        performanceObserver = new PerformanceObserverImpl(callback);
        return performanceObserver;
      });
      env.sandbox
        .stub(env.win, 'PerformanceObserver')
        .callsFake(PerformanceObserverStub);

      installPerformanceService(env.win);

      const perf = Services.performanceFor(env.win);

      const entries = [
        {
          duration: 1,
          entryType: 'paint',
          name: 'first-paint',
          startTime: 10,
        },
        {
          duration: 5,
          entryType: 'paint',
          name: 'first-contentful-paint',
          startTime: 10,
        },
      ];
      const list = {
        getEntries() {
          return entries;
        },
      };
      // Fake a triggering of the firstInput event.
      performanceObserver.triggerCallback(list);
      expect(perf.events_.length).to.equal(2);
      expect(perf.events_[0]).to.be.jsonEqual(
        {
          label: 'fp',
          delta: 11,
        },
        {
          label: 'fcp',
          delta: 15,
        }
      );
    });
  });

  describe('should forward largest-contentful-paint metric for performance entries', () => {
    beforeEach(() => {
      setupFakesForVisibilityStateManipulation();
    });
    it('after performance service registered', () => {
      // Fake the Performance API.
      fakeWin.PerformanceObserver.supportedEntryTypes = [
        'largest-contentful-paint',
      ];

      installPerformanceService(fakeWin);
      const perf = Services.performanceFor(fakeWin);
      perf.coreServicesAvailable();
      viewerVisibilityState = VisibilityState.INACTIVE;

      expect(perf.events_.length).to.equal(0);

      // Fake a largest-contentful-paint entry specifying a loadTime,
      // simulating an image on a different origin without a proper
      // Timing-Allow-Origin header.
      performanceObserver.triggerCallback({
        getEntries() {
          return [
            {
              entryType: 'largest-contentful-paint',
              loadTime: 10,
            },
          ];
        },
      });

      // Fake a largest-contentful-paint entry specifying a renderTime,
      // simulating an image on the same origin or with a proper
      // Timing-Allow-Origin header.
      performanceObserver.triggerCallback({
        getEntries() {
          return [
            {
              entryType: 'largest-contentful-paint',
              renderTime: 23,
            },
          ];
        },
      });

      // The document has become hidden, e.g. via the user switching tabs.
      toggleVisibility(fakeWin, false);

      expect(perf.events_.length).to.equal(2);
      expect(perf.events_[0]).to.be.jsonEqual({
        label: 'lcpl',
        delta: 10,
      });

      expect(perf.events_[1]).to.be.jsonEqual({
        label: 'lcpr',
        delta: 23,
      });
    });
  });

  describe('should forward first input metrics for performance entries', () => {
    let PerformanceObserverConstructorStub, performanceObserver;
    beforeEach(() => {
      // Stub and fake the PerformanceObserver constructor.
      const PerformanceObserverStub = env.sandbox.stub();

      PerformanceObserverStub.callsFake(callback => {
        performanceObserver = new PerformanceObserverImpl(callback);
        return performanceObserver;
      });
      PerformanceObserverConstructorStub = env.sandbox.stub(
        env.win,
        'PerformanceObserver'
      );
      PerformanceObserverConstructorStub.callsFake(PerformanceObserverStub);
    });
    it('created before performance service registered', () => {
      // Pretend that the EventTiming API exists.
      PerformanceObserverConstructorStub.supportedEntryTypes = ['firstInput'];

      const entries = [
        {
          cancelable: true,
          duration: 8,
          entryType: 'firstInput',
          name: 'mousedown',
          processingEnd: 105,
          processingStart: 103,
          startTime: 100,
        },
      ];
      const getEntriesByType = env.sandbox.stub();
      getEntriesByType.withArgs('firstInput').returns(entries);
      getEntriesByType.returns([]);
      env.sandbox
        .stub(env.win.performance, 'getEntriesByType')
        .callsFake(getEntriesByType);

      installPerformanceService(env.win);

      const perf = Services.performanceFor(env.win);

      expect(perf.events_.length).to.equal(1);
      expect(perf.events_[0]).to.be.jsonEqual({
        label: 'fid',
        delta: 3,
      });
    });

    it('created after performance service registered', () => {
      // Pretend that the EventTiming API exists.
      PerformanceObserverConstructorStub.supportedEntryTypes = ['firstInput'];

      installPerformanceService(env.win);

      const perf = Services.performanceFor(env.win);

      const entries = [
        {
          cancelable: true,
          duration: 8,
          entryType: 'firstInput',
          name: 'mousedown',
          processingEnd: 105,
          processingStart: 103,
          startTime: 100,
        },
      ];
      const list = {
        getEntries() {
          return entries;
        },
      };
      // Fake a triggering of the firstInput event.
      performanceObserver.triggerCallback(list);
      expect(perf.events_.length).to.equal(1);
      expect(perf.events_[0]).to.be.jsonEqual({
        label: 'fid',
        delta: 3,
      });
    });

    it('created before performance service registered for Chrome 77', () => {
      // Pretend that the EventTiming API exists.
      PerformanceObserverConstructorStub.supportedEntryTypes = ['first-input'];

      installPerformanceService(env.win);

      const perf = Services.performanceFor(env.win);

      // Fake fid that occured before the Performance service is started.
      performanceObserver.triggerCallback({
        getEntries() {
          return [
            {
              cancelable: true,
              duration: 8,
              entryType: 'firstInput',
              name: 'mousedown',
              processingEnd: 105,
              processingStart: 103,
              startTime: 100,
            },
          ];
        },
      });

      expect(perf.events_.length).to.equal(1);
      expect(perf.events_[0]).to.be.jsonEqual({
        label: 'fid',
        delta: 3,
      });
    });
  });

  it('forwards first-input-delay polyfill metric', () => {
    const previousPerfMetrics = env.win.perfMetrics;
    // Fake window to pretend that the polyfill exists.
    env.win.perfMetrics = env.win.perfMetrics || {};
    const callbacks = [];
    env.win.perfMetrics.onFirstInputDelay = env.sandbox.stub();
    env.win.perfMetrics.onFirstInputDelay.callsFake(callback => {
      callbacks.push(callback);
    });

    installPerformanceService(env.win);
    const perf = Services.performanceFor(env.win);

    // Send a fake first input event.
    const delay = 30;
    const evt = new Event('touchstart');
    callbacks.forEach(callback => {
      callback(delay, evt);
    });

    expect(perf.events_.length).to.equal(1);
    expect(perf.events_[0]).to.be.jsonEqual({
      label: 'fid-polyfill',
      delta: 30,
    });

    // Restore previous window value.
    if (typeof previousPerfMetrics === 'undefined') {
      delete env.win.perfMetrics;
    } else {
      env.win.perfMetrics = previousPerfMetrics;
    }
  });

  describe('forwards layout jank metric', () => {
    beforeEach(() => {
      setupFakesForVisibilityStateManipulation();
      fakeWin.PerformanceLayoutJank = true;
    });
    it('for browsers that support the visibilitychange event', () => {
      // Specify an Android Chrome user agent, which supports the
      // visibilitychange event.
      env.sandbox
        .stub(Services.platformFor(fakeWin), 'isAndroid')
        .returns(true);
      env.sandbox.stub(Services.platformFor(fakeWin), 'isChrome').returns(true);
      env.sandbox
        .stub(Services.platformFor(fakeWin), 'isSafari')
        .returns(false);

      // Document should be initially visible.
      expect(fakeWin.document.visibilityState).to.equal('visible');

      // Fake layoutJank that occured before the Performance service is started.
      fakeWin.performance.getEntriesByType.withArgs('layoutJank').returns([
        {entryType: 'layoutJank', fraction: 0.25},
        {entryType: 'layoutJank', fraction: 0.3},
      ]);

      const perf = getPerformance();
      // visibilitychange/beforeunload listeners are now added.
      perf.coreServicesAvailable();

      // The document has become hidden, e.g. via the user switching tabs.
      toggleVisibility(fakeWin, false);
      expect(perf.events_.length).to.equal(1);
      expect(perf.events_[0]).to.be.jsonEqual({
        label: 'lj',
        delta: 0.55,
      });

      // The user returns to the tab, and more layout jank occurs.
      toggleVisibility(fakeWin, true);
      const list = {
        getEntries() {
          return [
            {entryType: 'layoutJank', fraction: 1},
            {entryType: 'layoutJank', fraction: 0.0001},
          ];
        },
      };
      performanceObserver.triggerCallback(list);

      toggleVisibility(fakeWin, false);
      expect(perf.events_.length).to.equal(2);
      expect(perf.events_[1]).to.be.jsonEqual({
        label: 'lj-2',
        delta: 1.5501,
      });

      // Any more layout jank shouldn't be reported.
      toggleVisibility(fakeWin, true);
      performanceObserver.triggerCallback(list);

      toggleVisibility(fakeWin, false);
      expect(perf.events_.length).to.equal(2);
    });

    it('forwards layout jank metric on viewer visibility change to inactive', () => {
      // Specify an Android Chrome user agent.
      env.sandbox
        .stub(Services.platformFor(fakeWin), 'isAndroid')
        .returns(true);
      env.sandbox.stub(Services.platformFor(fakeWin), 'isChrome').returns(true);
      env.sandbox
        .stub(Services.platformFor(fakeWin), 'isSafari')
        .returns(false);

      // Fake layoutJank that occured before the Performance service is started.
      fakeWin.performance.getEntriesByType.withArgs('layoutJank').returns([
        {entryType: 'layoutJank', fraction: 0.25},
        {entryType: 'layoutJank', fraction: 0.3},
      ]);
      const perf = getPerformance();
      perf.coreServicesAvailable();
      viewerVisibilityState = VisibilityState.INACTIVE;
      perf.onAmpDocVisibilityChange_();

      expect(perf.events_.length).to.equal(1);
      expect(perf.events_[0]).to.be.jsonEqual({
        label: 'lj',
        delta: 0.55,
      });
    });
  });

  describe('forwards cumulative layout shift metric', () => {
    beforeEach(() => {
      setupFakesForVisibilityStateManipulation();
    });

    function getPerformance() {
      installPerformanceService(fakeWin);
      return Services.performanceFor(fakeWin);
    }

    function toggleVisibility(win, on) {
      win.document.visibilityState = on ? 'visible' : 'hidden';
      fireEvent('visibilitychange');
    }

    function fireEvent(eventName) {
      const event = new Event(eventName);
      (windowEventListeners[eventName] || []).forEach(cb => cb(event));
    }

    it('for Chrome 76', () => {
      // Specify an Android Chrome user agent, which supports the
      // visibilitychange event.
      env.sandbox
        .stub(Services.platformFor(fakeWin), 'isAndroid')
        .returns(true);
      env.sandbox.stub(Services.platformFor(fakeWin), 'isChrome').returns(true);
      env.sandbox
        .stub(Services.platformFor(fakeWin), 'isSafari')
        .returns(false);

      // Fake the Performance API.
      fakeWin.PerformanceObserver.supportedEntryTypes = ['layoutShift'];

      // Document should be initially visible.
      expect(fakeWin.document.visibilityState).to.equal('visible');

      // Fake layoutShift that occured before the Performance service is started.
      fakeWin.performance.getEntriesByType.withArgs('layoutShift').returns([
        {entryType: 'layoutShift', value: 0.25},
        {entryType: 'layoutShift', value: 0.3},
      ]);

      const perf = getPerformance();
      // visibilitychange/beforeunload listeners are now added.
      perf.coreServicesAvailable();

      // The document has become hidden, e.g. via the user switching tabs.
      toggleVisibility(fakeWin, false);
      expect(perf.events_.length).to.equal(1);
      expect(perf.events_[0]).to.be.jsonEqual({
        label: 'cls',
        delta: 0.55,
      });

      // The user returns to the tab, and more layout shift occurs.
      toggleVisibility(fakeWin, true);
      performanceObserver.triggerCallback({
        getEntries() {
          return [
            {entryType: 'layoutShift', value: 1},
            {entryType: 'layoutShift', value: 0.0001},
          ];
        },
      });

      toggleVisibility(fakeWin, false);
      expect(perf.events_.length).to.equal(2);
      expect(perf.events_[1]).to.be.jsonEqual({
        label: 'cls-2',
        delta: 1.5501,
      });

      // Any more layout shift shouldn't be reported.
      toggleVisibility(fakeWin, true);
      performanceObserver.triggerCallback({
        getEntries() {
          return [{entryType: 'layoutShift', value: 2}];
        },
      });

      toggleVisibility(fakeWin, false);
      expect(perf.events_.length).to.equal(2);
    });

    it('for Chrome 77', () => {
      // Specify an Android Chrome user agent, which supports the
      // visibilitychange event.
      env.sandbox
        .stub(Services.platformFor(fakeWin), 'isAndroid')
        .returns(true);
      env.sandbox.stub(Services.platformFor(fakeWin), 'isChrome').returns(true);
      env.sandbox
        .stub(Services.platformFor(fakeWin), 'isSafari')
        .returns(false);

      // Fake the Performance API.
      fakeWin.PerformanceObserver.supportedEntryTypes = ['layout-shift'];

      // Document should be initially visible.
      expect(fakeWin.document.visibilityState).to.equal('visible');

      const perf = getPerformance();
      // visibilitychange/beforeunload listeners are now added.
      perf.coreServicesAvailable();

      // Fake layout-shift that occured before the Performance service is started.
      performanceObserver.triggerCallback({
        getEntries() {
          return [
            {entryType: 'layout-shift', value: 0.25, hadRecentInput: false},
            {entryType: 'layout-shift', value: 0.3, hadRecentInput: false},
          ];
        },
      });

      // The document has become hidden, e.g. via the user switching tabs.
      toggleVisibility(fakeWin, false);
      expect(perf.events_.length).to.equal(1);
      expect(perf.events_[0]).to.be.jsonEqual({
        label: 'cls',
        delta: 0.55,
      });

      // The user returns to the tab, and more layout shift occurs.
      toggleVisibility(fakeWin, true);
      performanceObserver.triggerCallback({
        getEntries() {
          return [
            {entryType: 'layout-shift', value: 1, hadRecentInput: false},
            {entryType: 'layout-shift', value: 0.0001, hadRecentInput: false},
          ];
        },
      });

      // User input occurs which triggers layout shift, which is ignored.
      performanceObserver.triggerCallback({
        getEntries() {
          return [
            {entryType: 'layout-shift', value: 0.3, hadRecentInput: true},
          ];
        },
      });

      toggleVisibility(fakeWin, false);
      expect(perf.events_.length).to.equal(2);
      expect(perf.events_[1]).to.be.jsonEqual({
        label: 'cls-2',
        delta: 1.5501,
      });

      // Any more layout shift shouldn't be reported.
      toggleVisibility(fakeWin, true);
      performanceObserver.triggerCallback({
        getEntries() {
          return [{entryType: 'layout-shift', value: 2, hadRecentInput: false}];
        },
      });

      toggleVisibility(fakeWin, false);
      expect(perf.events_.length).to.equal(2);
    });

    it('when the viewer visibility changes to inactive', () => {
      // Specify an Android Chrome user agent.
      env.sandbox
        .stub(Services.platformFor(fakeWin), 'isAndroid')
        .returns(true);
      env.sandbox.stub(Services.platformFor(fakeWin), 'isChrome').returns(true);
      env.sandbox
        .stub(Services.platformFor(fakeWin), 'isSafari')
        .returns(false);

      // Fake the Performance API.
      fakeWin.PerformanceObserver.supportedEntryTypes = ['layout-shift'];

      const perf = getPerformance();
      perf.coreServicesAvailable();

      // Fake layout-shift that occured before the Performance service is started.
      performanceObserver.triggerCallback({
        getEntries() {
          return [
            {entryType: 'layout-shift', value: 0.25, hadRecentInput: false},
            {entryType: 'layout-shift', value: 0.3, hadRecentInput: false},
          ];
        },
      });

      viewerVisibilityState = VisibilityState.INACTIVE;
      perf.onAmpDocVisibilityChange_();

      expect(perf.events_.length).to.equal(1);
      expect(perf.events_[0]).to.be.jsonEqual({
        label: 'cls',
        delta: 0.55,
      });
    });
  });
});
