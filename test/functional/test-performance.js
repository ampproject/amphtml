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

import * as sinon from 'sinon';
import {Performance, performanceFor} from '../../src/performance';
import {getService, resetServiceForTesting} from '../../src/service';
import {resourcesFor} from '../../src/resources';
import {viewerFor} from '../../src/viewer';


describe('performance', () => {
  let sandbox;
  let perf;
  let clock;

  beforeEach(() => {
    sandbox = sinon.sandbox.create();
    clock = sandbox.useFakeTimers();
    perf = new Performance(window);
  });

  afterEach(() => {
    perf = null;
    clock = null;
    sandbox.restore();
    sandbox = null;
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
      expect(perf.events_.length).to.equal(2);
      expect(perf.events_[0])
          .to.be.jsonEqual({label: '_test', from: null, value: 1000});
      expect(perf.events_[1]).to.be.jsonEqual({
        label: 'test',
        from: '_test',
        value: 1099,
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
        from: null,
        value: 150,
      });
    });

    it('should save all 3 arguments as queued tick event if present', () => {
      clock.tick(150);
      perf.tick('start0', 'start1', 300);

      expect(perf.events_[0]).to.be.jsonEqual({
        label: 'start0',
        from: 'start1',
        value: 300,
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
        from: null,
        value: tickTime,
      });

      clock.tick(1);
      perf.tick('start50');

      expect(perf.events_[0]).to.be.jsonEqual({
        label: 'start1',
        from: null,
        value: tickTime,
      });
      expect(perf.events_[49]).to.be.jsonEqual({
        label: 'start50',
        from: null,
        value: tickTime + 1,
      });
    });
  });

  describe('when viewer is ready,', () => {
    let tickSpy;
    let flushTicksSpy;
    let viewer;

    beforeEach(() => {
      viewer = viewerFor(window);
      tickSpy = sandbox.stub(viewer, 'tick');
      flushTicksSpy = sandbox.stub(viewer, 'flushTicks');
    });

    it('should forward all queued tick events', () => {
      perf.tick('start0');
      clock.tick(1);
      perf.tick('start1', 'start0');

      expect(perf.events_.length).to.equal(2);

      perf.coreServicesAvailable();

      expect(tickSpy.firstCall.args[0]).to.be.jsonEqual({
        label: 'start0',
        from: null,
        value: 0,
      });
      expect(tickSpy.secondCall.args[0]).to.be.jsonEqual({
        label: 'start1',
        from: 'start0',
        value: 1,
      });
    });

    it('should have no more queued tick events after flush', () => {
      perf.tick('start0');
      perf.tick('start1');

      expect(perf.events_.length).to.equal(2);

      perf.coreServicesAvailable();

      expect(perf.events_.length).to.equal(0);
    });

    it('should forward tick events', () => {
      perf.coreServicesAvailable();

      clock.tick(100);
      perf.tick('start0');
      perf.tick('start1', 'start0', 300);

      expect(tickSpy.firstCall.args[0]).to.be.jsonEqual({
        label: 'start0',
        from: null,
        value: 100,
      });
      expect(tickSpy.secondCall.args[0]).to.be.jsonEqual({
        label: 'start1',
        from: 'start0',
        value: 300,
      });
    });

    it('should call the flush callback', () => {
      expect(flushTicksSpy.callCount).to.equal(0);
      // coreServicesAvailable calls flush once.
      perf.coreServicesAvailable();
      expect(flushTicksSpy.callCount).to.equal(1);
      perf.flush();
      expect(flushTicksSpy.callCount).to.equal(2);
      perf.flush();
      expect(flushTicksSpy.callCount).to.equal(3);
    });
  });

  describe('coreServicesAvailable', () => {
    let tickSpy;
    let viewer;
    let whenFirstVisiblePromise;
    let whenFirstVisibleResolve;
    let whenReadyToRetrieveResourcesPromise;
    let whenReadyToRetrieveResourcesResolve;
    let whenViewportLayoutCompletePromise;
    let whenViewportLayoutCompleteResolve;

    function stubHasBeenVisible(visibility) {
      sandbox.stub(viewer, 'hasBeenVisible')
          .returns(visibility);
    }

    beforeEach(() => {
      viewer = viewerFor(window);
      resources = resourcesFor(window);

      tickSpy = sandbox.spy(perf, 'tick');

      whenFirstVisiblePromise = new Promise(resolve => {
        whenFirstVisibleResolve = resolve;
      });

      whenReadyToRetrieveResourcesPromise = new Promise(resolve => {
        whenReadyToRetrieveResourcesResolve = resolve;
      });

      whenViewportLayoutCompletePromise = new Promise(resolve => {
        whenViewportLayoutCompleteResolve = resolve;
      });

      sandbox.stub(viewer, 'whenFirstVisible')
          .returns(whenFirstVisiblePromise);
      sandbox.stub(perf, 'whenReadyToRetrieveResources_')
          .returns(whenReadyToRetrieveResourcesPromise);
      sandbox.stub(perf, 'whenViewportLayoutComplete_')
          .returns(whenViewportLayoutCompletePromise);
    });

    describe('document started in prerender', () => {

      beforeEach(() => {
        clock.tick(100);
        stubHasBeenVisible(false);
        perf.coreServicesAvailable();
      });

      it('should tick `pc` with opt_value=400 when user request document ' +
         'to be visible before before first viewport completion', () => {
        clock.tick(100);
        whenFirstVisibleResolve();
        return viewer.whenFirstVisible().then(() => {
          clock.tick(400);
          whenReadyToRetrieveResourcesResolve();
          whenViewportLayoutCompleteResolve();
          return perf.whenViewportLayoutComplete_().then(() => {
            expect(tickSpy.callCount).to.equal(2);
            expect(tickSpy.firstCall.args[0]).to.equal('_pc');
            expect(tickSpy.secondCall.args[0]).to.equal('pc');
            expect(tickSpy.secondCall.args[1]).to.equal('_pc');
            expect(Number(tickSpy.firstCall.args[2])).to.equal(1000);
            expect(Number(tickSpy.secondCall.args[2])).to.equal(1400);
          });
        });
      });

      it('should tick `pc` with `opt_value=0` when viewport is complete ' +
         'before user request document to be visible', () => {
        clock.tick(300);
        whenReadyToRetrieveResourcesResolve();
        whenViewportLayoutCompleteResolve();
        return perf.whenViewportLayoutComplete_().then(() => {
          expect(tickSpy.callCount).to.equal(2);
          expect(tickSpy.firstCall.args[0]).to.equal('_pc');
          expect(tickSpy.secondCall.args[0]).to.equal('pc');
          expect(tickSpy.secondCall.args[1]).to.equal('_pc');
          expect(Number(tickSpy.firstCall.args[2])).to.equal(1000);
          expect(Number(tickSpy.secondCall.args[2])).to.equal(1001);
        });
      });
    });

    describe('document did not start in prerender', () => {

      beforeEach(() => {
        stubHasBeenVisible(true);
        perf.coreServicesAvailable();
      });

      it('should tick `pc` with `opt_value=undefined` when user requests ' +
         'document to be visible', () => {
        clock.tick(300);
        whenReadyToRetrieveResourcesResolve();
        whenViewportLayoutCompleteResolve();
        return perf.whenViewportLayoutComplete_().then(() => {
          expect(tickSpy.callCount).to.equal(1);
          expect(tickSpy.firstCall.args[0]).to.equal('pc');
          expect(tickSpy.firstCall.args[2]).to.be.undefined;
        });
      });
    });
  });

  it('should setFlushParams', () => {
    const perf = performanceFor(window);
    const viewer = viewerFor(window);
    sandbox.stub(perf, 'whenViewportLayoutComplete_')
        .returns(Promise.resolve());
    const setFlushParamsSpy = sandbox.stub(viewer, 'setFlushParams');
    perf.coreServicesAvailable();
    resetServiceForTesting(window, 'documentInfo');
    const info = {
      canonicalUrl: 'https://foo.bar/baz',
      pageViewId: 12345,
      sourceUrl: 'https://hello.world/baz/#development'
    };
    getService(window, 'documentInfo', () => info);

    const ad1 = document.createElement('amp-ad');
    ad1.setAttribute('type', 'abc');
    const ad2 = document.createElement('amp-ad');
    ad2.setAttribute('type', 'xyz');
    const ad3 = document.createElement('amp-ad');
    sandbox.stub(perf.resources_, 'get').returns([
      {element: document.createElement('amp-img')},
      {element: document.createElement('amp-img')},
      {element: document.createElement('amp-anim')},
      {element: ad1},
      {element: ad2},
      {element: ad3},
    ]);

    return perf.setDocumentInfoParams_().then(() => {
      expect(setFlushParamsSpy.lastCall.args[0]).to.be.jsonEqual({
        sourceUrl: 'https://hello.world/baz/',
        'amp-img': 2,
        'amp-anim': 1,
        'amp-ad': 3,
        'ad-abc': 1,
        'ad-xyz': 1,
        'ad-null': 1,
      });
    });
  });
});
