/**
 * Copyright 2016 The AMP HTML Authors. All Rights Reserved.
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
import {installLiveListManager, LiveListManager} from '../live-list-manager';
import {installViewerService} from '../../../../src/service/viewer-impl';
import {resetServiceForTesting} from '../../../../src/service';
import {toggleExperiment} from '../../../../src/experiments';

describe('LiveListManager', () => {
  const jitterOffset = 1000;
  let manager;
  let sandbox;
  let liveList;
  let requests;
  let clock;
  let viewer;
  let ready;

  beforeEach(() => {
    toggleExperiment(window, 'amp-live-list', true);
    sandbox = sinon.sandbox.create();
    const docReadyPromise = new Promise(resolve => { ready = resolve; });
    sandbox.stub(LiveListManager.prototype, 'whenDocReady_')
        .returns(docReadyPromise);
    clock = sandbox.useFakeTimers();
    const mockXhr = sandbox.useFakeXMLHttpRequest().xhr;
    requests = [];
    mockXhr.onCreate = function(xhr) {
      requests.push(xhr);
    };
    viewer = installViewerService(window);
    manager = installLiveListManager(window);
    liveList = getLiveList();
    sandbox.stub(liveList, 'getInterval', () => 5000);
  });

  afterEach(() => {
    toggleExperiment(window, 'amp-live-list', false);
    resetServiceForTesting(window, 'liveListManager');
    sandbox.restore();
  });

  function getLiveList(attrs = {}) {
    const el = document.createElement('amp-live-list');
    el.setAttribute('id', 'id-1');
    el.setAttribute('data-max-items-per-page', '10');
    el.appendChild(document.createElement('amp-live-list-update'));
    el.appendChild(document.createElement('amp-live-list-items'));
    for (const key in attrs) {
      el.setAttribute(key, attrs[key]);
    }

    /** @implements {!LiveListInterface} */
    class AmpLiveListMock {
      constructor(el) {
        this.element = el;
      }
      buildCallback() {
        this.manager_ = installLiveListManager(window);
        this.manager_.register(this.element.getAttribute('id'), this);
      }
      getInterval() {
        return Number(this.element.getAttribute('data-poll-interval'));
      }
      update() {}
    }
    const impl = new AmpLiveListMock(el);
    return impl;
  }

  it('should register new amp-live-list', () => {
    ready();
    liveList.buildCallback();
    expect(manager.liveLists_['id-1']).to.equal(liveList);
  });

  it('should start poller when document is ready', () => {
    sandbox.stub(viewer, 'isVisible').returns(true);
    expect(manager.poller_).to.be.null;
    ready();
    return manager.whenDocReady_().then(() => {
      expect(manager.poller_.isRunning()).to.be.true;
    });
  });

  it('should get the minimum interval from multiple live-lists', () => {
    const liveList2 = getLiveList({'data-poll-interval': '8000'});
    liveList.buildCallback();
    liveList2.buildCallback();
    expect(manager.interval_).to.equal(15000);
    ready();
    return manager.whenDocReady_().then(() => {
      expect(manager.interval_).to.equal(5000);
    });
  });

  it('should back off on transient 415 response', () => {
    sandbox.stub(Math, 'random', () => 1);
    ready();
    const fetchSpy = sandbox.spy(manager, 'work_');
    liveList.buildCallback();
    return manager.whenDocReady_().then(() => {
      const interval = liveList.getInterval();
      const tick = interval - jitterOffset;
      expect(manager.poller_.isRunning()).to.be.true;
      expect(fetchSpy.callCount).to.equal(0);
      clock.tick(tick);
      expect(fetchSpy.callCount).to.equal(1);
      requests[0].respond(200, {
        'Content-Type': 'text/xml',
      }, '<html></html>');

      return manager.poller_.lastWorkPromise_.then(() => {
        expect(manager.poller_.isRunning()).to.be.true;
        clock.tick(tick);
        requests[1].respond(415, {
          'Content-Type': 'text/xml',
        }, '<html></html>');
        expect(fetchSpy.callCount).to.equal(2);
        expect(manager.poller_.backoffClock_).to.be.null;
        return manager.poller_.lastWorkPromise_.then(() => {
          expect(manager.poller_.isRunning()).to.be.true;
          expect(manager.poller_.backoffClock_).to.be.a('function');
        });
      });
    });
  });

  it('should back off on transient 500 response', () => {
    sandbox.stub(Math, 'random', () => 1);
    ready();
    const fetchSpy = sandbox.spy(manager, 'work_');
    liveList.buildCallback();
    return manager.whenDocReady_().then(() => {
      const interval = liveList.getInterval();
      const tick = interval - jitterOffset;
      expect(manager.poller_.isRunning()).to.be.true;
      expect(fetchSpy.callCount).to.equal(0);
      clock.tick(tick);
      expect(fetchSpy.callCount).to.equal(1);
      requests[0].respond(200, {
        'Content-Type': 'text/xml',
      }, '<html></html>');

      return manager.poller_.lastWorkPromise_.then(() => {
        expect(manager.poller_.isRunning()).to.be.true;
        clock.tick(tick);
        requests[1].respond(500, {
          'Content-Type': 'text/xml',
        }, '<html></html>');
        expect(fetchSpy.callCount).to.equal(2);
        expect(manager.poller_.backoffClock_).to.be.null;
        return manager.poller_.lastWorkPromise_.then(() => {
          expect(manager.poller_.isRunning()).to.be.true;
          expect(manager.poller_.backoffClock_).to.be.a('function');
        });
      });
    });
  });

  it('should recover after transient 415 response', () => {
    sandbox.stub(Math, 'random', () => 1);
    sandbox.stub(viewer, 'isVisible').returns(true);
    ready();
    const fetchSpy = sandbox.spy(manager, 'work_');
    liveList.buildCallback();
    return manager.whenDocReady_().then(() => {
      const interval = liveList.getInterval();
      const tick = interval - jitterOffset;
      expect(manager.poller_.isRunning()).to.be.true;
      expect(fetchSpy.callCount).to.equal(0);
      clock.tick(tick);
      expect(fetchSpy.callCount).to.equal(1);
      expect(manager.poller_.backoffClock_).to.be.null;
      requests[0].respond(415, {
        'Content-Type': 'text/xml',
      }, '<html></html>');
      return manager.poller_.lastWorkPromise_.then(() => {
        expect(manager.poller_.isRunning()).to.be.true;
        expect(manager.poller_.backoffClock_).to.be.a('function');
        // tick 1 max initial backoff with random = 1
        clock.tick(700);
        expect(fetchSpy.callCount).to.equal(2);
        requests[1].respond(200, {
          'Content-Type': 'text/xml',
        }, '<html></html>');
        return manager.poller_.lastWorkPromise_.then(() => {
          expect(manager.poller_.isRunning()).to.be.true;
          expect(manager.poller_.backoffClock_).to.be.null;
        });
      });
    });
  });

  it('should stop all polling if viewer is not visible ' +
    'and immediately fetch when visible', () => {
    ready();
    const fetchSpy = sandbox.spy(manager, 'work_');
    expect(fetchSpy.callCount).to.equal(0);
    liveList.buildCallback();
    return manager.whenDocReady_().then(() => {
      expect(viewer.isVisible()).to.be.true;
      expect(manager.poller_.isRunning()).to.be.true;
      viewer.receiveMessage('visibilitychange', {
        state: 'hidden',
      });
      expect(fetchSpy.callCount).to.equal(0);
      expect(manager.poller_.isRunning()).to.be.false;
      viewer.receiveMessage('visibilitychange', {
        state: 'visible',
      });
      expect(fetchSpy.callCount).to.equal(1);
      expect(manager.poller_.isRunning()).to.be.true;
      viewer.receiveMessage('visibilitychange', {
        state: 'inactive',
      });
      expect(fetchSpy.callCount).to.equal(1);
      expect(manager.poller_.isRunning()).to.be.false;
      viewer.receiveMessage('visibilitychange', {
        state: 'visible',
      });
      expect(fetchSpy.callCount).to.equal(2);
      expect(manager.poller_.isRunning()).to.be.true;
      viewer.receiveMessage('visibilitychange', {
        state: 'prerender',
      });
      expect(fetchSpy.callCount).to.equal(2);
      expect(manager.poller_.isRunning()).to.be.false;
      clock.tick(20000);
      expect(fetchSpy.callCount).to.equal(2);
    });
  });
});
