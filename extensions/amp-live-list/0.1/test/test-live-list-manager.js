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

  function getLiveList(attrs = {}, opt_id) {
    const el = document.createElement('amp-live-list');
    el.setAttribute('id', opt_id || 'id-1');
    el.setAttribute('data-max-items-per-page', '10');
    const updateSlot = document.createElement('div');
    const itemsSlot = document.createElement('div');
    updateSlot.setAttribute('update', '');
    itemsSlot.setAttribute('items', '');
    el.appendChild(updateSlot);
    el.appendChild(itemsSlot);
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

  it('should fetch with url', () => {
    sandbox.stub(Math, 'random', () => 1);
    sandbox.stub(viewer, 'isVisible').returns(true);
    manager.url_ = 'www.example.com/foo/bar?hello=world#dev=1';
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
      expect(requests[0].url).to.match(/^www\.example\.com\/foo\/bar/);
      expect(requests[0].url).to.not.match(/amp_latest_update_time/);
    });
  });

  it('should find highest "update time" from amp-live-list elements', () => {
    const doc = [];
    const list1 = getLiveList(undefined, 'id1');
    const list2 = getLiveList(undefined, 'id2');
    sandbox.stub(list1, 'update').returns(1000);
    sandbox.stub(list2, 'update').returns(2000);
    doc.getElementsByTagName = () => {
      return [list1.element, list2.element];
    };
    list1.buildCallback();
    list2.buildCallback();
    expect(manager.latestUpdateTime_).to.equal(0);
    manager.getLiveLists_(doc);
    expect(manager.latestUpdateTime_).to.equal(2000);
  });

  it('should add amp_latest_update_time on requests', () => {
    sandbox.stub(Math, 'random', () => 1);
    sandbox.stub(viewer, 'isVisible').returns(true);
    manager.url_ = 'www.example.com/foo/bar?hello=world#dev=1';
    manager.latestUpdateTime_ = 2000;
    sandbox.stub(liveList, 'update').returns(2500);
    ready();
    liveList.buildCallback();
    const fetchSpy = sandbox.spy(manager, 'work_');
    return manager.whenDocReady_().then(() => {
      const interval = liveList.getInterval();
      const tick = interval - jitterOffset;
      expect(manager.poller_.isRunning()).to.be.true;
      expect(fetchSpy.callCount).to.equal(0);
      clock.tick(tick);
      expect(fetchSpy.callCount).to.equal(1);
      expect(requests[0].url).to.match(/amp_latest_update_time=2000/);
      requests[0].respond(200, {
        'Content-Type': 'text/xml',
      }, '<html><amp-live-list id="id-1"></amp-live-list></html>');
      return manager.poller_.lastWorkPromise_.then(() => {
        clock.tick(tick);
        expect(fetchSpy.callCount).to.equal(2);
        expect(requests[1].url).to.match(/amp_latest_update_time=2500/);
      });
    });
  });
});
