import * as fakeTimers from '@sinonjs/fake-timers';

import {VisibilityState_Enum} from '#core/constants/visibility-state';
import {base64UrlDecodeToBytes} from '#core/types/string/base64';

import {toggleExperiment} from '#experiments';

import {Services} from '#service';
import {installRuntimeServices} from '#service/core-services';
import {
  ELEMENT_TYPE_ENUM,
  Performance,
  installPerformanceService,
} from '#service/performance-impl';
import {installPlatformService} from '#service/platform-impl';

import * as IniLoad from '../../src/ini-load';
import {getMode} from '../../src/mode';

describes.realWin('performance', {amp: false}, (env) => {
  it('should be resilient to unsupported PerformanceObserver entry types', () => {
    env.sandbox.stub(env.win.PerformanceObserver.prototype, 'observe').throws();
    allowConsoleError(() => {
      expect(() => {
        new Performance(env.win);
      }).to.not.throw();
    });
  });
});

describes.realWin('performance', {amp: true}, (env) => {
  let perf;
  let clock;
  let win;
  let ampdoc;
  const timeOrigin = 100;

  beforeEach(() => {
    win = env.win;
    ampdoc = env.ampdoc;
    toggleExperiment(win, 'interaction-to-next-paint', true);
    clock = fakeTimers.withGlobal(win).install({
      toFake: ['Date', 'setTimeout', 'clearTimeout'],
      // set initial Date.now to 100, so that we can differentiate between time relative to epoch and relative to process start (value vs. delta).
      now: timeOrigin,
    });
    Object.defineProperty(win.performance, 'timeOrigin', {value: timeOrigin}); // timeOrigin is read-only.
    win.performance.now = clock.performance.now;
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

    it('should add default absolute start time on the queued tick event', () => {
      clock.tick(150);
      perf.tick('start0');

      expect(perf.events_[0]).to.be.jsonEqual({
        label: 'start0',
        value: timeOrigin + 150,
      });
    });

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
        value: timeOrigin + tickTime,
      });

      clock.tick(1);
      perf.tick('start50');

      expect(perf.events_[0]).to.be.jsonEqual({
        label: 'start1',
        value: timeOrigin + tickTime,
      });
      expect(perf.events_[49]).to.be.jsonEqual({
        label: 'start50',
        value: timeOrigin + tickTime + 1,
      });
    });
  });

  describe('when viewer is ready,', () => {
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
          env.sandbox.stub(viewer, 'getParam').withArgs('csi').returns('1');
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
          env.sandbox.stub(viewer, 'getParam').withArgs('csi').returns('0');
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
          env.sandbox.stub(viewer, 'getParam').withArgs('csi').returns(null);
          env.sandbox.stub(viewer, 'isEmbedded').returns(true);
          perf.coreServicesAvailable().then(() => {
            expect(perf.isPerformanceTrackingOn()).to.be.false;
          });
        }
      );

      it('should configure correctly when viewer is not embedded', () => {
        env.sandbox.stub(viewer, 'getParam').withArgs('csi').returns(null);
        env.sandbox.stub(viewer, 'isEmbedded').returns(false);
        perf.coreServicesAvailable().then(() => {
          expect(perf.isPerformanceTrackingOn()).to.be.false;
        });
      });
    });

    describe('channel established', () => {
      it('should flush events when channel is ready', () => {
        env.sandbox.stub(viewer, 'getParam').withArgs('csi').returns(null);
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
            env.sandbox.match((arg) => arg.label === 'msr')
          );
          expect(msrCalls).to.be.calledOnce;
          expect(msrCalls.args[0][1]).to.be.jsonEqual({
            label: 'msr',
            delta: 1,
          });

          const timeOriginCall = viewerSendMessageStub.withArgs(
            'tick',
            env.sandbox.match((arg) => arg.label === 'timeOrigin')
          );
          expect(timeOriginCall).to.be.calledOnce;
          expect(timeOriginCall).calledWithMatch('tick', {
            label: 'timeOrigin',
            value: 100,
          });

          expect(flushSpy).to.have.callCount(6);
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
          expect(flushSpy).to.have.callCount(5);
          expect(perf.isMessagingReady_).to.be.false;
          const count = 6;
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
        perf.coreServicesAvailable();
        perf.viewer_ = {isEmbedded: () => true};
      });

      it('should not offset by visible time when viewer is not set', () => {
        perf.viewer_ = {isEmbedded: () => false};
        clock.tick(10);
        perf.tickSinceVisible('test');

        expect(tickDeltaStub).to.have.been.calledOnce;
        expect(tickDeltaStub.firstCall.args[1]).to.equal(10);
      });

      it('should always be zero before visible', () => {
        clock.tick(10);
        perf.tickSinceVisible('test');

        expect(tickDeltaStub).to.have.been.calledOnce;
        expect(tickDeltaStub.firstCall.args[1]).to.equal(0);
      });

      it('should calculate after visible', () => {
        firstVisibleTime = timeOrigin + 5;

        clock.tick(10);
        perf.tickSinceVisible('test');

        expect(tickDeltaStub).to.have.been.calledOnce;
        expect(tickDeltaStub.firstCall.args[1]).to.equal(5);
      });

      it('should be zero after visible but for earlier event', () => {
        firstVisibleTime = timeOrigin + 5;

        // An earlier event, since event time (4) is less than visible time (5).
        clock.tick(4);
        perf.tickSinceVisible('test');

        expect(tickDeltaStub).to.have.been.calledOnce;
        expect(tickDeltaStub.firstCall.args[1]).to.equal(0);
      });
    });

    describe('and performanceTracking is off', () => {
      beforeEach(() => {
        env.sandbox.stub(viewer, 'getParam').withArgs('csi').returns(null);
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
        env.sandbox.stub(viewer, 'getParam').withArgs('csi').returns('1');
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
            value: timeOrigin,
          });
          expect(
            viewerSendMessageStub.withArgs('tick').getCall(1).args[1]
          ).to.be.jsonEqual({
            label: 'start1',
            value: timeOrigin + 1,
          });
          expect(
            viewerSendMessageStub.withArgs('tick').getCall(4).args[1]
          ).to.be.jsonEqual({
            label: 'inp',
            delta: 40,
          });
          expect(
            viewerSendMessageStub.withArgs('tick').getCall(5).args[1]
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
              env.sandbox.match((arg) => arg.label == 'start0')
            ).args[0][1]
          ).to.be.jsonEqual({
            label: 'start0',
            value: timeOrigin + 100,
          });
          expect(
            viewerSendMessageStub.withArgs(
              'tick',
              env.sandbox.match((arg) => arg.label == 'start1')
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
        expect(viewerSendMessageStub.withArgs('sendCsi')).to.have.callCount(0);
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
          (arg) =>
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
      return win.performance
        .getEntriesByType('mark')
        .map((entry) => entry.name);
    }

    beforeEach(() => {
      viewer = Services.viewerForDoc(ampdoc);
      env.sandbox.stub(viewer, 'whenMessagingReady').returns(Promise.resolve());
      viewerSendMessageStub = env.sandbox.stub(viewer, 'sendMessage');

      tickSpy = env.sandbox.spy(perf, 'tick');

      whenFirstVisiblePromise = new Promise((resolve) => {
        whenFirstVisibleResolve = resolve;
      });

      whenViewportLayoutCompletePromise = new Promise((resolve) => {
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
        env.sandbox.stub(viewer, 'getParam').withArgs('csi').returns('1');
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
        env.sandbox.stub(viewer, 'getParam').withArgs('csi').returns(null);
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
          const initialCount = tickSpy.callCount;
          return ampdoc.whenFirstVisible().then(() => {
            clock.tick(400);
            expect(tickSpy).to.have.callCount(initialCount + 1);
            whenViewportLayoutCompleteResolve();
            return perf.whenViewportLayoutComplete_().then(() => {
              expect(tickSpy).to.have.callCount(initialCount + 1);
              expect(tickSpy.withArgs('ofv')).to.be.calledOnce;
              return whenFirstVisiblePromise.then(() => {
                expect(tickSpy).to.have.callCount(initialCount + 2);
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

      it('should call prerenderComplete on viewer', async () => {
        env.sandbox.stub(viewer, 'getParam').withArgs('csi').returns('1');
        env.sandbox.stub(viewer, 'isEmbedded').returns(true);
        clock.tick(100);
        whenFirstVisibleResolve();
        await whenFirstVisiblePromise.then(() => {
          clock.tick(300);
        });
        whenViewportLayoutCompleteResolve();
        return perf.whenViewportLayoutComplete_().then(() => {
          expect(
            viewerSendMessageStub.withArgs('prerenderComplete').firstCall
              .args[1].value
          ).to.equal(300);
          expect(getPerformanceMarks()).to.have.members([
            'dr',
            'ol',
            'visible',
            'ofv',
            'pc',
          ]);
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

describes.realWin('performance with experiment', {amp: true}, (env) => {
  let win;
  let perf;
  let viewerSendMessageStub;

  beforeEach(() => {
    win = env.win;
    const viewer = Services.viewerForDoc(env.ampdoc);
    viewerSendMessageStub = env.sandbox.stub(viewer, 'sendMessage');
    env.sandbox.stub(viewer, 'whenMessagingReady').returns(Promise.resolve());
    env.sandbox.stub(viewer, 'getParam').withArgs('csi').returns('1');
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
        env.sandbox.match((payload) => {
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

  it('adds ssr experiments', () => {
    env.sandbox
      .stub(env.ampdoc, 'getMetaByName')
      .withArgs('amp-usqp')
      .returns('1=1,2=0');
    return perf.coreServicesAvailable().then(() => {
      viewerSendMessageStub.reset();
      perf.flush();
      expect(viewerSendMessageStub).to.be.calledWith(
        'sendCsi',
        env.sandbox.match((payload) => {
          const experiments = payload.ampexp.split(',');
          expect(experiments).to.have.length(3);
          expect(experiments).to.have.members([
            'rtv-' + getMode(win).rtvVersion,
            'ssr-1=1',
            'ssr-2=0',
          ]);
          return true;
        })
      );
    });
  });
});

describes.realWin('PeformanceObserver metrics', {amp: true}, (env) => {
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

  let performanceObserver;
  let viewerVisibilityState;

  function setupFakesForVisibilityStateManipulation() {
    env.sandbox.stub(env.win, 'PerformanceObserver');

    // Fake the PerformanceObserver implementation so we can send
    // fake PerformanceEntry objects to listeners.
    env.win.PerformanceObserver.callsFake((callback) => {
      performanceObserver = new PerformanceObserverImpl(callback);
      return performanceObserver;
    });

    installRuntimeServices(env.win);

    const unresolvedPromise = new Promise(() => {});
    const viewportSize = {width: 0, height: 0};
    env.sandbox.stub(Services, 'ampdoc').returns({
      hasBeenVisible: () => {},
      onVisibilityChanged: () => {},
      whenFirstVisible: () => Promise.resolve(),
      getVisibilityState: () => viewerVisibilityState,
      getFirstVisibleTime: () => 0,
      isSingleDoc: () => true,
    });
    env.sandbox.stub(Services, 'viewerForDoc').returns({
      isEmbedded: () => {},
      whenMessagingReady: () => {},
    });
    env.sandbox.stub(Services, 'resourcesForDoc').returns({
      getResourcesInRect: () => unresolvedPromise,
      whenFirstPass: () => Promise.resolve(),
      getSlowElementRatio: () => 1,
    });
    env.sandbox.stub(Services, 'viewportForDoc').returns({
      getSize: () => viewportSize,
    });
    env.sandbox.stub(Services, 'documentInfoForDoc').returns({
      canonicalUrl: 'https://example.com/amp.html',
    });
  }

  async function toggleVisibility(perf, on) {
    viewerVisibilityState = on
      ? VisibilityState_Enum.VISIBLE
      : VisibilityState_Enum.HIDDEN;
    perf.onAmpDocVisibilityChange_();
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

      expect(perf.events_.length).to.equal(3);
      expect(perf.events_[0]).to.be.jsonEqual(
        {
          label: 'fp',
          delta: 11,
        },
        {
          label: 'fcp',
          delta: 15,
        },
        {
          label: 'fcpv',
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
      PerformanceObserverStub.callsFake((callback) => {
        performanceObserver = new PerformanceObserverImpl(callback);
        return performanceObserver;
      });
      env.sandbox
        .stub(env.win, 'PerformanceObserver')
        .callsFake(PerformanceObserverStub);

      env.sandbox.stub(env.ampdoc, 'getFirstVisibleTime').callsFake(() => null);

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
      // Fake a triggering of the first-input event.
      performanceObserver.triggerCallback(list);
      expect(perf.events_.length).to.equal(3);
      expect(perf.events_[0]).to.be.jsonEqual(
        {
          label: 'fp',
          delta: 11,
        },
        {
          label: 'fcp',
          delta: 15,
        },
        {
          label: 'fcpv',
          delta: 15,
        }
      );
    });
  });

  describe('should forward largest-contentful-paint metric for performance entries', () => {
    beforeEach(() => {
      setupFakesForVisibilityStateManipulation();
    });

    it('after performance service registered', async () => {
      // Fake the Performance API.
      env.win.PerformanceObserver.supportedEntryTypes = [
        'largest-contentful-paint',
      ];

      installPerformanceService(env.win);
      const perf = Services.performanceFor(env.win);
      perf.coreServicesAvailable();
      expect(perf.events_.length).to.equal(0);

      // Fake a largest-contentful-paint entry specifying a renderTime/startTime,
      // simulating an image on the same origin or with a Timing-Allow-Origin header.
      performanceObserver.triggerCallback({
        getEntries() {
          return [
            {
              entryType: 'largest-contentful-paint',
              loadTime: 10,
              renderTime: 12,
              startTime: 12,
            },
          ];
        },
      });

      // Fake a largest-contentful-paint entry with a loadTime/startTime
      // simulating an image on a different origin without a Timing-Allow-Origin header.
      performanceObserver.triggerCallback({
        getEntries() {
          return [
            {
              entryType: 'largest-contentful-paint',
              loadTime: 23,
              renderTime: undefined,
              startTime: 23,
            },
          ];
        },
      });

      // The document has become hidden, e.g. via the user switching tabs.
      toggleVisibility(perf, false);

      const lcpEvents = perf.events_.filter(({label}) => label === 'lcp');
      expect(lcpEvents.length).to.equal(2);
      expect(lcpEvents).deep.include({
        label: 'lcp',
        delta: 12,
      });
      expect(lcpEvents).deep.include({
        label: 'lcp',
        delta: 23,
      });
    });

    it('should include lcp type', async () => {
      // Fake the Performance API.
      env.win.PerformanceObserver.supportedEntryTypes = [
        'largest-contentful-paint',
      ];

      installPerformanceService(env.win);
      const perf = Services.performanceFor(env.win);
      perf.coreServicesAvailable();
      expect(perf.events_.length).to.equal(0);

      // Fake an img being the LCP Element
      performanceObserver.triggerCallback({
        getEntries() {
          return [
            {
              entryType: 'largest-contentful-paint',
              startTime: 12,
              element: document.createElement('img'),
            },
          ];
        },
      });
      // Flush LCP
      toggleVisibility(perf, false);
      toggleVisibility(perf, true);

      // Fake an amp-img nested within an amp-carousel.
      const parent = document.createElement('amp-carousel');
      const child = document.createElement('amp-img');
      parent.appendChild(child);
      performanceObserver.triggerCallback({
        getEntries() {
          return [
            {
              entryType: 'largest-contentful-paint',
              loadTime: 23,
              renderTime: undefined,
              startTime: 23,
              element: child,
            },
          ];
        },
      });
      // Flush LCP again.
      toggleVisibility(perf, false);

      // A textual paragraph
      const p = document.createElement('p');
      p.textContent = 'hello';
      performanceObserver.triggerCallback({
        getEntries() {
          return [
            {
              entryType: 'largest-contentful-paint',
              startTime: 25,
              element: p,
            },
          ];
        },
      });
      // Flush LCP again.
      toggleVisibility(perf, false);

      const lcptEvents = perf.events_.filter(({label}) =>
        label.startsWith('lcpt')
      );
      expect(lcptEvents).deep.include({
        label: 'lcpt',
        delta: ELEMENT_TYPE_ENUM.image,
      });
      expect(lcptEvents).deep.include({
        label: 'lcpt',
        delta: ELEMENT_TYPE_ENUM.carousel,
      });
      expect(lcptEvents).deep.include({
        label: 'lcpt',
        delta: ELEMENT_TYPE_ENUM.text,
      });
    });
  });

  describe('should forward first input metrics for performance entries', () => {
    let PerformanceObserverConstructorStub, performanceObserver;
    beforeEach(() => {
      // Stub and fake the PerformanceObserver constructor.
      const PerformanceObserverStub = env.sandbox.stub();

      PerformanceObserverStub.callsFake((callback) => {
        performanceObserver = new PerformanceObserverImpl(callback);
        return performanceObserver;
      });
      PerformanceObserverConstructorStub = env.sandbox.stub(
        env.win,
        'PerformanceObserver'
      );
      PerformanceObserverConstructorStub.callsFake(PerformanceObserverStub);
    });

    it('created before performance service registered for Chromium 77', () => {
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
              entryType: 'first-input',
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

  describe('forwards cumulative layout shift metric', () => {
    beforeEach(() => {
      setupFakesForVisibilityStateManipulation();
    });

    function getPerformance() {
      installPerformanceService(env.win);
      return Services.performanceFor(env.win);
    }

    it('should not throw when layout-shift occurs before core services available', () => {
      // Fake the Performance API.
      env.win.PerformanceObserver.supportedEntryTypes = ['layout-shift'];
      const perf = getPerformance();

      // Fake layout-shift that occured before core services registered
      performanceObserver.triggerCallback({
        getEntries() {
          return [
            {entryType: 'layout-shift', value: 0.3, hadRecentInput: false},
          ];
        },
      });
      perf.coreServicesAvailable();
    });

    it('when the viewer visibility changes to inactive', () => {
      // Specify an Android Chrome user agent.
      env.sandbox
        .stub(Services.platformFor(env.win), 'isAndroid')
        .returns(true);
      env.sandbox.stub(Services.platformFor(env.win), 'isChrome').returns(true);
      env.sandbox
        .stub(Services.platformFor(env.win), 'isSafari')
        .returns(false);

      // Fake the Performance API.
      env.win.PerformanceObserver.supportedEntryTypes = ['layout-shift'];

      const perf = getPerformance();
      perf.coreServicesAvailable();
      toggleVisibility(perf, true);

      const parent = document.createElement('amp-carousel');
      const child = document.createElement('amp-img');
      parent.appendChild(child);

      // Fake layout-shift that occured before the Performance service is started.
      performanceObserver.triggerCallback({
        getEntries() {
          return [
            {
              entryType: 'layout-shift',
              value: 0.3,
              startTime: 1,
              hadRecentInput: false,
              sources: [{node: child}],
            },
            {
              entryType: 'layout-shift',
              value: 0.25,
              startTime: 6000,
              hadRecentInput: false,
              sources: [{node: parent}],
            },
          ];
        },
      });

      viewerVisibilityState = VisibilityState_Enum.INACTIVE;
      perf.onAmpDocVisibilityChange_();

      const clsEvents = perf.events_.filter((evt) =>
        evt.label.startsWith('cls')
      );
      expect(clsEvents.length).to.equal(3);
      expect(perf.events_).deep.include({
        label: 'cls',
        delta: 0.3,
      });
      expect(perf.events_).deep.include({
        label: 'clstu',
        delta: 8,
      });
      expect(perf.events_).deep.include({
        label: 'cls-1',
        delta: 0.55,
      });
    });
  });

  describe('getMetric', () => {
    beforeEach(() => {
      setupFakesForVisibilityStateManipulation();
    });

    function getPerformance() {
      installPerformanceService(env.win);
      return Services.performanceFor(env.win);
    }

    it('returns a promise that resolves to the value', async () => {
      const perf = getPerformance();
      perf.tick('mbv', 1);
      const value = await perf.getMetric('mbv');
      expect(value).to.eq(1);
    });
  });

  describe('forwards navigation metrics', () => {
    let PerformanceObserverConstructorStub, performanceObserver;
    beforeEach(() => {
      // Stub and fake the PerformanceObserver constructor.
      const PerformanceObserverStub = env.sandbox.stub();
      PerformanceObserverStub.callsFake((callback) => {
        performanceObserver = new PerformanceObserverImpl(callback);
        return performanceObserver;
      });
      PerformanceObserverConstructorStub = env.sandbox.stub(
        env.win,
        'PerformanceObserver'
      );
      PerformanceObserverConstructorStub.callsFake(PerformanceObserverStub);
    });

    it('after performance service registered', () => {
      // Pretend that the Navigation API exists.
      PerformanceObserverConstructorStub.supportedEntryTypes = ['navigation'];

      installPerformanceService(env.win);

      const perf = Services.performanceFor(env.win);

      // Fake fid that occured before the Performance service is started.
      performanceObserver.triggerCallback({
        getEntries() {
          return [
            {
              entryType: 'navigation',
              domComplete: 0,
              domContentLoadedEventEnd: 1,
              domContentLoadedEventStart: 2,
              domInteractive: 3,
              loadEventEnd: 4,
              loadEventStart: 5,
              requestStart: 6,
              responseStart: 7,
            },
          ];
        },
      });

      expect(perf.events_.length).to.equal(8);
      expect(perf.events_).to.be.jsonEqual([
        {
          label: 'domComplete',
          delta: 0,
        },
        {
          label: 'domContentLoadedEventEnd',
          delta: 1,
        },
        {
          label: 'domContentLoadedEventStart',
          delta: 2,
        },
        {
          label: 'domInteractive',
          delta: 3,
        },
        {
          label: 'loadEventEnd',
          delta: 4,
        },
        {
          label: 'loadEventStart',
          delta: 5,
        },
        {
          label: 'requestStart',
          delta: 6,
        },
        {
          label: 'responseStart',
          delta: 7,
        },
      ]);
    });
  });

  describe('forwards INP metrics', () => {
    let PerformanceObserverConstructorStub, performanceObserver;
    beforeEach(() => {
      toggleExperiment(env.win, 'interaction-to-next-paint', true);

      // Stub and fake the PerformanceObserver constructor.
      const PerformanceObserverStub = env.sandbox.stub();
      PerformanceObserverStub.callsFake((callback) => {
        performanceObserver = new PerformanceObserverImpl(callback);
        return performanceObserver;
      });
      PerformanceObserverConstructorStub = env.sandbox.stub(
        env.win,
        'PerformanceObserver'
      );
      PerformanceObserverConstructorStub.callsFake(PerformanceObserverStub);
    });

    it('after performance service registered', () => {
      // Pretend that the Navigation API exists.
      PerformanceObserverConstructorStub.supportedEntryTypes = ['event'];

      installPerformanceService(env.win);

      const perf = Services.performanceFor(env.win);
      perf.ampdoc_ = env.ampdoc;
      perf.registerPerformanceObserver_();

      // Fake interaction events.
      perf.tickInteractionToNextPaint_(38);

      expect(perf.events_.length).to.equal(1);
      expect(perf.events_).to.be.jsonEqual([
        {
          label: 'inp',
          delta: 38,
        },
      ]);

      perf.tickInteractionToNextPaint_(380);
      expect(perf.events_.length).to.equal(2);
      expect(perf.events_).to.be.jsonEqual([
        {
          label: 'inp',
          delta: 38,
        },
        {
          label: 'inp',
          delta: 380 - 38,
        },
      ]);

      perf.tickInteractionToNextPaint_(30);
      expect(perf.events_.length).to.equal(2);
      expect(perf.events_).to.be.jsonEqual([
        {
          label: 'inp',
          delta: 38,
        },
        {
          label: 'inp',
          delta: 380 - 38,
        },
      ]);
    });
  });

  describe('forwards INP metrics', () => {
    let PerformanceObserverConstructorStub, performanceObserver;
    beforeEach(() => {
      // Stub and fake the PerformanceObserver constructor.
      toggleExperiment(env.win, 'interaction-to-next-paint', true);

      const PerformanceObserverStub = env.sandbox.stub();
      PerformanceObserverStub.callsFake((callback) => {
        performanceObserver = new PerformanceObserverImpl(callback);
        return performanceObserver;
      });
      PerformanceObserverConstructorStub = env.sandbox.stub(
        env.win,
        'PerformanceObserver'
      );
      PerformanceObserverConstructorStub.callsFake(PerformanceObserverStub);
    });

    it('after performance service registered', () => {
      // Pretend that the Navigation API exists.
      PerformanceObserverConstructorStub.supportedEntryTypes = ['event'];

      installPerformanceService(env.win);

      const perf = Services.performanceFor(env.win);
      perf.ampdoc_ = env.ampdoc;
      perf.registerPerformanceObserver_();

      // Fake interaction events.
      perf.tickInteractionToNextPaint_(38);

      expect(perf.events_.length).to.equal(1);
      expect(perf.events_).to.be.jsonEqual([
        {
          label: 'inp',
          delta: 38,
        },
      ]);

      perf.tickInteractionToNextPaint_(380);
      expect(perf.events_.length).to.equal(2);
      expect(perf.events_).to.be.jsonEqual([
        {
          label: 'inp',
          delta: 38,
        },
        {
          label: 'inp',
          delta: 380 - 38,
        },
      ]);

      perf.tickInteractionToNextPaint_(30);
      expect(perf.events_.length).to.equal(2);
      expect(perf.events_).to.be.jsonEqual([
        {
          label: 'inp',
          delta: 38,
        },
        {
          label: 'inp',
          delta: 380 - 38,
        },
      ]);
    });
  });

  describe('inabox environment', () => {
    let PerformanceObserverConstructorStub;

    beforeEach(() => {
      PerformanceObserverConstructorStub = env.sandbox.stub(
        env.win,
        'PerformanceObserver'
      );
    });

    it('disables many observers', () => {
      PerformanceObserverConstructorStub.supportedEntryTypes = [
        'navigation',
        'largest-contentful-paint',
        'first-input',
        'layout-shift',
      ];
      installPerformanceService(env.win);
      env.win.__AMP_MODE.runtime = 'inabox';
      Services.performanceFor(env.win);
      // Each supported entryType currently leads to creation of new observer.
      expect(PerformanceObserverConstructorStub).not.to.be.called;
    });
  });
});

describes.realWin('log extraParams', {amp: true}, (env) => {
  let win;
  let perf;
  let viewerSendMessageStub;
  const canonicalUrl = 'https://example.com/amp.html';

  beforeEach(() => {
    win = env.win;
    const viewer = Services.viewerForDoc(env.ampdoc);
    viewerSendMessageStub = env.sandbox.stub(viewer, 'sendMessage');
    env.sandbox.stub(viewer, 'whenMessagingReady').returns(Promise.resolve());
    env.sandbox.stub(viewer, 'getParam').withArgs('csi').returns('1');
    env.sandbox.stub(viewer, 'isEmbedded').returns(true);
    env.sandbox.stub(Services, 'documentInfoForDoc').returns({canonicalUrl});
    installPlatformService(win);
    installPerformanceService(win);
    perf = Services.performanceFor(win);
  });

  it('should add the canonical URL to sendCsi messages', () => {
    return perf.coreServicesAvailable().then(() => {
      viewerSendMessageStub.reset();
      perf.flush();
      expect(viewerSendMessageStub.lastCall.args[0]).to.equal('sendCsi');
      expect(viewerSendMessageStub.lastCall.args[1].canonicalUrl).to.equal(
        canonicalUrl
      );
    });
  });

  it('should add the random eventid to sendCsi', () => {
    return perf.coreServicesAvailable().then(() => {
      viewerSendMessageStub.reset();
      perf.flush();
      expect(viewerSendMessageStub.lastCall.args[0]).to.equal('sendCsi');
      const {eventid} = viewerSendMessageStub.lastCall.args[1];
      expect(() => {
        base64UrlDecodeToBytes(eventid);
      }).not.to.throw();
    });
  });
});
