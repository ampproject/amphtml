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

import * as lolex from 'lolex';
import * as sinon from 'sinon';
import {Services} from '../../src/services';
import {getMode} from '../../src/mode';
import {installPerformanceService} from '../../src/service/performance-impl';


describes.realWin('performance', {amp: true}, env => {
  let sandbox;
  let perf;
  let clock;
  let win;
  let ampdoc;

  beforeEach(() => {
    win = env.win;
    sandbox = env.sandbox;
    ampdoc = env.ampdoc;
    clock = lolex.install({
      target: win, toFake: ['Date', 'setTimeout', 'clearTimeout']});
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
      expect(perf.events_[0])
          .to.be.jsonEqual({
            label: 'test',
            delta: 99,
          });
    });

    it('should map tickDelta to non-zero tick', () => {
      let c = 0;
      expect(perf.events_.length).to.equal(c);

      perf.tickDelta('test1', 0);
      expect(perf.events_.length).to.equal(c + 1);
      expect(perf.events_[c])
          .to.be.jsonEqual({
            label: 'test1',
            delta: 0,
          });

      c++;
      perf.tickDelta('test2', -1);
      expect(perf.events_.length).to.equal(c + 1);
      expect(perf.events_[c])
          .to.be.jsonEqual({
            label: 'test2',
            delta: 0,
          });

      c++;
      perf.tickDelta('test3', 2);
      expect(perf.events_.length).to.equal(c + 1);
      expect(perf.events_[c])
          .to.be.jsonEqual({
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

    it('should add default optional relative start time on the ' +
       'queued tick event', () => {
      clock.tick(150);
      perf.tick('start0');

      expect(perf.events_[0]).to.be.jsonEqual({
        label: 'start0',
        value: 150,
      });
    });

    it('should drop events in the head of the queue', () => {
      const tickTime = 100;
      clock.tick(tickTime);

      expect(perf.events_.length).to.equal(0);

      for (let i = 0; i < 50 ; i++) {
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

  describe('when viewer is ready,', () => {
    let viewer;
    let viewerSendMessageStub;

    beforeEach(() => {
      viewer = Services.viewerForDoc(ampdoc);
      viewerSendMessageStub = sandbox.stub(viewer, 'sendMessage');
    });


    describe('config', () => {
      it('should configure correctly when viewer is embedded and supports ' +
          'csi', () => {
        sandbox.stub(viewer, 'getParam').withArgs('csi').returns('1');
        sandbox.stub(viewer, 'isEmbedded').returns(true);
        perf.coreServicesAvailable().then(() => {
          expect(perf.isPerformanceTrackingOn()).to.be.true;
        });
      });

      it('should configure correctly when viewer is embedded and does ' +
          'NOT support csi', () => {
        sandbox.stub(viewer, 'getParam').withArgs('csi').returns('0');
        sandbox.stub(viewer, 'isEmbedded').returns(true);
        perf.coreServicesAvailable().then(() => {
          expect(perf.isPerformanceTrackingOn()).to.be.false;
        });
      });

      it('should configure correctly when viewer is embedded and does ' +
          'NOT support csi', () => {
        sandbox.stub(viewer, 'getParam').withArgs('csi').returns(null);
        sandbox.stub(viewer, 'isEmbedded').returns(true);
        perf.coreServicesAvailable().then(() => {
          expect(perf.isPerformanceTrackingOn()).to.be.false;
        });
      });

      it('should configure correctly when viewer is not embedded', () => {
        sandbox.stub(viewer, 'getParam').withArgs('csi').returns(null);
        sandbox.stub(viewer, 'isEmbedded').returns(false);
        perf.coreServicesAvailable().then(() => {
          expect(perf.isPerformanceTrackingOn()).to.be.false;
        });
      });
    });

    describe('channel established', () => {

      it('should flush events when channel is ready', () => {
        sandbox.stub(viewer, 'getParam').withArgs('csi').returns(null);
        sandbox.stub(viewer, 'whenMessagingReady')
            .returns(Promise.resolve());
        expect(perf.isMessagingReady_).to.be.false;
        const promise = perf.coreServicesAvailable();
        expect(perf.events_.length).to.equal(0);

        perf.tick('start');
        expect(perf.events_.length).to.equal(1);

        perf.tick('startEnd');
        expect(perf.events_.length).to.equal(2);
        expect(perf.isMessagingReady_).to.be.false;

        const flushSpy = sandbox.spy(perf, 'flush');
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
              sinon.match(arg => arg.label == 'msr'));
          expect(msrCalls).to.be.calledOnce;
          expect(msrCalls.args[0][1]).to.be.jsonEqual({
            label: 'msr',
            delta: 1,
          });
          expect(flushSpy).to.have.callCount(4);
          expect(perf.events_.length).to.equal(0);
        });
      });
    });

    describe('channel not established', () => {

      it('should not flush anything', () => {
        sandbox.stub(viewer, 'whenMessagingReady').returns(null);
        expect(perf.isMessagingReady_).to.be.false;

        expect(perf.events_.length).to.equal(0);

        perf.tick('start');
        expect(perf.events_.length).to.equal(1);

        perf.tick('startEnd');
        expect(perf.events_.length).to.equal(2);
        expect(perf.isMessagingReady_).to.be.false;

        const flushSpy = sandbox.spy(perf, 'flush');
        expect(flushSpy).to.have.callCount(0);
        perf.flush();
        expect(flushSpy).to.have.callCount(1);
        expect(perf.events_.length).to.equal(2);

        return perf.coreServicesAvailable().then(() => {
          expect(flushSpy).to.have.callCount(3);
          expect(perf.isMessagingReady_).to.be.false;
          const count = 4;
          expect(perf.events_.length).to.equal(count);
        });
      });
    });

    describe('tickSinceVisible', () => {

      let tickDeltaStub;
      let firstVisibleTime;

      beforeEach(() => {
        tickDeltaStub = sandbox.stub(perf, 'tickDelta');
        firstVisibleTime = null;
        sandbox.stub(viewer, 'getFirstVisibleTime').callsFake(
            () => firstVisibleTime);
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
        sandbox.stub(viewer, 'getParam').withArgs('csi').returns(null);
        sandbox.stub(viewer, 'isEmbedded').returns(false);
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
          expect(viewerSendMessageStub.withArgs('sendCsi', undefined,
              /* cancelUnsent */true)).to.not.be.called;
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
          expect(viewerSendMessageStub.withArgs('sendCsi', undefined,
              /* cancelUnsent */true)).to.not.be.called;
        });
      });
    });

    describe('and performanceTracking is on', () => {

      beforeEach(() => {
        sandbox.stub(viewer, 'getParam').withArgs('csi').returns('1');
        sandbox.stub(viewer, 'isEmbedded').returns(true);
        sandbox.stub(viewer, 'whenMessagingReady')
            .returns(Promise.resolve());
      });

      it('should forward all queued tick events', () => {
        perf.tick('start0');
        clock.tick(1);
        perf.tick('start1');

        expect(perf.events_.length).to.equal(2);

        return perf.coreServicesAvailable().then(() => {
          expect(viewerSendMessageStub.withArgs('tick').getCall(0).args[1])
              .to.be.jsonEqual({
                label: 'msr',
                delta: 1,
              });
          expect(viewerSendMessageStub.withArgs('tick').getCall(1).args[1])
              .to.be.jsonEqual({
                label: 'start0',
                value: 0,
              });
          expect(viewerSendMessageStub.withArgs('tick').getCall(2).args[1])
              .to.be.jsonEqual({
                label: 'start1',
                value: 1,
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

          expect(viewerSendMessageStub.withArgs(
              'tick', sinon.match(arg => arg.label == 'start0')).args[0][1])
              .to.be.jsonEqual({
                label: 'start0',
                value: 100,
              });
          expect(viewerSendMessageStub.withArgs(
              'tick', sinon.match(arg => arg.label == 'start1')).args[0][1])
              .to.be.jsonEqual({
                label: 'start1',
                delta: 300,
              });
        });
      });

      it('should call the flush callback', () => {
        expect(viewerSendMessageStub.withArgs('sendCsi')).to.have.callCount(0);
        // coreServicesAvailable calls flush once.
        return perf.coreServicesAvailable().then(() => {
          expect(viewerSendMessageStub.withArgs('sendCsi'))
              .to.have.callCount(1);
          perf.flush();
          expect(viewerSendMessageStub.withArgs('sendCsi'))
              .to.have.callCount(2);
          perf.flush();
          expect(viewerSendMessageStub.withArgs('sendCsi'))
              .to.have.callCount(3);
        });
      });
    });
  });

  it('should wait for visible resources', () => {
    function resource() {
      const res = {
        loadedComplete: false,
      };
      res.loadedOnce = () => Promise.resolve().then(() => {
        res.loadedComplete = true;
      });
      return res;
    }

    const resources = Services.resourcesForDoc(ampdoc);
    const resourcesMock = sandbox.mock(resources);
    perf.resources_ = resources;

    const res1 = resource();
    const res2 = resource();

    resourcesMock
        .expects('getResourcesInRect')
        .withExactArgs(
            perf.win,
            sinon.match(arg =>
              arg.left == 0 &&
                arg.top == 0 &&
                arg.width == perf.win.innerWidth &&
                arg.height == perf.win.innerHeight),
            /* inPrerender */ true)
        .returns(Promise.resolve([res1, res2]))
        .once();

    return perf.whenViewportLayoutComplete_().then(() => {
      expect(res1.loadedComplete).to.be.true;
      expect(res2.loadedComplete).to.be.true;
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
      sandbox.stub(viewer, 'hasBeenVisible')
          .returns(visibility);
    }

    function getPerformanceMarks() {
      return win.performance.getEntriesByType('mark').map(entry => entry.name);
    }

    beforeEach(() => {
      viewer = Services.viewerForDoc(ampdoc);
      sandbox.stub(viewer, 'whenMessagingReady')
          .returns(Promise.resolve());
      viewerSendMessageStub = sandbox.stub(viewer,
          'sendMessage');

      tickSpy = sandbox.spy(perf, 'tick');

      whenFirstVisiblePromise = new Promise(resolve => {
        whenFirstVisibleResolve = resolve;
      });

      whenViewportLayoutCompletePromise = new Promise(resolve => {
        whenViewportLayoutCompleteResolve = resolve;
      });

      sandbox.stub(viewer, 'whenFirstVisible')
          .returns(whenFirstVisiblePromise);
      sandbox.stub(perf, 'whenViewportLayoutComplete_')
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
        sandbox.stub(viewer, 'getParam').withArgs('csi').returns('1');
        sandbox.stub(viewer, 'isEmbedded').returns(true);
        return viewer.whenFirstVisible().then(() => {
          clock.tick(400);
          whenViewportLayoutCompleteResolve();
          return perf.whenViewportLayoutComplete_().then(() => {
            expect(viewerSendMessageStub.withArgs(
                'prerenderComplete').firstCall.args[1].value).to.equal(400);

            expect(getPerformanceMarks()).to.deep.equal(
                ['ol', 'ofv', 'pc']);
          });
        });
      });

      it('should call prerenderComplete on viewer even if csi is ' +
        'off', () => {
        clock.tick(100);
        whenFirstVisibleResolve();
        sandbox.stub(viewer, 'getParam').withArgs('csi').returns(null);
        return viewer.whenFirstVisible().then(() => {
          clock.tick(400);
          whenViewportLayoutCompleteResolve();
          return perf.whenViewportLayoutComplete_().then(() => {
            expect(viewerSendMessageStub.withArgs(
                'prerenderComplete').firstCall.args[1].value).to.equal(400);
          });
        });
      });

      it('should tick `pc` with delta=400 when user request document ' +
         'to be visible before before first viewport completion', () => {
        clock.tick(100);
        whenFirstVisibleResolve();
        expect(tickSpy).to.have.callCount(2);
        return viewer.whenFirstVisible().then(() => {
          clock.tick(400);
          expect(tickSpy).to.have.callCount(3);
          whenViewportLayoutCompleteResolve();
          return perf.whenViewportLayoutComplete_().then(() => {
            expect(tickSpy).to.have.callCount(3);
            expect(tickSpy.withArgs('ofv')).to.be.calledOnce;
            return whenFirstVisiblePromise.then(() => {
              expect(tickSpy).to.have.callCount(4);
              expect(tickSpy.withArgs('pc')).to.be.calledOnce;
              expect(Number(tickSpy.withArgs('pc').args[0][1])).to.equal(400);
            });
          });
        });
      });

      it('should tick `pc` with `delta=0` when viewport is complete ' +
         'before user request document to be visible', () => {
        clock.tick(300);
        whenViewportLayoutCompleteResolve();
        return perf.whenViewportLayoutComplete_().then(() => {
          expect(tickSpy.withArgs('ol')).to.be.calledOnce;
          expect(tickSpy.withArgs('pc')).to.have.callCount(0);
          whenFirstVisibleResolve();
          return whenFirstVisiblePromise.then(() => {
            expect(tickSpy.withArgs('pc')).to.be.calledOnce;
            expect(Number(tickSpy.withArgs('pc').args[0][1])).to.equal(0);
            expect(getPerformanceMarks()).to.deep.equal(
                ['ol', 'pc', 'ofv']);
          });
        });
      });
    });

    describe('document did not start in prerender', () => {

      beforeEach(() => {
        stubHasBeenVisible(true);
        perf.coreServicesAvailable();
      });

      it('should call prerenderComplete on viewer', () => {
        sandbox.stub(viewer, 'getParam').withArgs('csi').returns('1');
        sandbox.stub(viewer, 'isEmbedded').returns(true);
        clock.tick(300);
        whenViewportLayoutCompleteResolve();
        return perf.whenViewportLayoutComplete_().then(() => {
          expect(viewerSendMessageStub.withArgs(
              'prerenderComplete').firstCall.args[1].value).to.equal(300);
          expect(getPerformanceMarks()).to.deep.equal(['ol', 'pc']);
        });
      });

      it('should tick `pc` with `opt_value=undefined` when user requests ' +
         'document to be visible', () => {
        clock.tick(300);
        whenViewportLayoutCompleteResolve();
        return perf.whenViewportLayoutComplete_().then(() => {
          expect(tickSpy.withArgs('ol')).to.be.calledOnce;
          expect(tickSpy.withArgs('pc')).to.be.calledOnce;
          expect(tickSpy.withArgs('pc').args[0][2]).to.be.undefined;
          expect(getPerformanceMarks()).to.deep.equal(['ol', 'pc']);
        });
      });
    });
  });
});

describes.realWin('performance with experiment', {amp: true}, env => {

  let win;
  let perf;
  let viewerSendMessageStub;
  let sandbox;

  beforeEach(() => {
    win = env.win;
    sandbox = env.sandbox;
    const viewer = Services.viewerForDoc(env.ampdoc);
    viewerSendMessageStub = sandbox.stub(viewer, 'sendMessage');
    sandbox.stub(viewer, 'whenMessagingReady').returns(Promise.resolve());
    sandbox.stub(viewer, 'getParam').withArgs('csi').returns('1');
    sandbox.stub(viewer, 'isEmbedded').returns(true);
    installPerformanceService(win);
    perf = Services.performanceFor(win);
  });

  it('rtvVersion experiment', () => {
    return perf.coreServicesAvailable().then(() => {
      viewerSendMessageStub.reset();
      perf.flush();
      expect(viewerSendMessageStub.lastCall.args[0]).to.equal('sendCsi');
      expect(viewerSendMessageStub.lastCall.args[1].ampexp).to.equal(
          'rtv-' + getMode(win).rtvVersion);
    });
  });

  it('addEnabledExperiment should work', () => {
    return perf.coreServicesAvailable().then(() => {
      perf.addEnabledExperiment('experiment-a');
      perf.addEnabledExperiment('experiment-b');
      perf.addEnabledExperiment('experiment-a'); // duplicated entry
      viewerSendMessageStub.reset();
      perf.flush();
      expect(viewerSendMessageStub).to.be.calledWith('sendCsi',
          sandbox.match(payload => {
            const experiments = payload.ampexp.split(',');
            expect(experiments).to.have.length(3);
            expect(experiments).to.have.members([
              'rtv-' + getMode(win).rtvVersion,
              'experiment-a',
              'experiment-b',
            ]);
            return true;
          }));
    });
  });
});
