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

import {
  AMP_LIVE_LIST_CUSTOM_SLOT_ID,
  LiveListManager,
} from '../live-list-manager';

const XHR_BUFFER_SIZE = 2;

describes.fakeWin('LiveListManager', {amp: true}, (env) => {
  const jitterOffset = 1000;
  let win, doc;
  let ampdoc;
  let manager;
  let liveList;
  let xhrs;
  let clock;
  let ready;

  beforeEach(() => {
    win = env.win;
    doc = win.document;
    ampdoc = env.ampdoc;

    clock = env.sandbox.useFakeTimers();
    xhrs = setUpMockXhrs(env.sandbox);

    manager = new LiveListManager(ampdoc);
    const docReadyPromise = new Promise((resolve) => {
      ready = resolve;
    });
    env.sandbox.stub(manager, 'whenDocReady_').returns(docReadyPromise);
    env.sandbox
      .stub(LiveListManager, 'forDoc')
      .returns(Promise.resolve(manager));

    liveList = getLiveList({'data-sort-time': '1111'});
    env.sandbox.stub(liveList, 'getInterval').callsFake(() => 5000);
  });

  function setUpMockXhrs(sandbox) {
    const mockXhr = sandbox.useFakeXMLHttpRequest();
    const xhrs = [];
    const xhrResolvers = [];
    for (let i = 0; i < XHR_BUFFER_SIZE; i++) {
      xhrs[i] = new Promise((resolve) => (xhrResolvers[i] = resolve));
    }
    let xhrCount = 0;
    mockXhr.onCreate = function (xhr) {
      xhrResolvers[xhrCount++](xhr);
    };
    return xhrs;
  }

  /** @implements {!LiveListInterface} */
  class AmpLiveListMock {
    constructor(el) {
      this.element = el;
    }

    buildCallback() {
      manager.register(this.element.getAttribute('id'), this);
      this.updateTime_ = Number(this.element.getAttribute('data-sort-time'));
    }

    getInterval() {
      return Number(this.element.getAttribute('data-poll-interval'));
    }

    update() {}

    isEnabled() {
      return !this.element.hasAttribute('disabled');
    }

    toggle(value) {
      if (value) {
        this.element.removeAttribute('disabled');
      } else {
        this.element.setAttribute('disabled', '');
      }
    }

    getUpdateTime() {
      return this.updateTime_;
    }

    hasCustomSlot() {
      return !!this.element[AMP_LIVE_LIST_CUSTOM_SLOT_ID];
    }
  }

  function getLiveList(attrs = {}, opt_id) {
    const el = doc.createElement('amp-live-list');
    el.setAttribute('id', opt_id || 'id-1');
    el.setAttribute('data-max-items-per-page', '10');
    const updateSlot = doc.createElement('div');
    const itemsSlot = doc.createElement('div');
    updateSlot.setAttribute('update', '');
    itemsSlot.setAttribute('items', '');
    el.appendChild(updateSlot);
    el.appendChild(itemsSlot);
    for (const key in attrs) {
      el.setAttribute(key, attrs[key]);
    }

    if (!('data-poll-interval' in attrs)) {
      el.setAttribute('data-poll-interval', 8000);
    }
    return new AmpLiveListMock(el);
  }

  it('should register new amp-live-list', () => {
    ready();
    liveList.buildCallback();
    expect(manager.liveLists_['id-1']).to.equal(liveList);
  });

  it('should start poller when doc is ready', () => {
    env.sandbox.stub(ampdoc, 'isVisible').returns(true);
    expect(manager.poller_).to.be.null;
    liveList.buildCallback();
    ready();
    return manager.whenDocReady_().then(() => {
      expect(manager.poller_.isRunning()).to.be.true;
    });
  });

  it('should not start poller when no live-list is registered', () => {
    env.sandbox.stub(ampdoc, 'isVisible').returns(true);
    expect(manager.poller_).to.be.null;
    ready();
    return manager.whenDocReady_().then(() => {
      expect(manager.poller_.isRunning()).to.be.false;
    });
  });

  it('should get the minimum interval from multiple live-lists', () => {
    const liveList2 = getLiveList({'data-poll-interval': '8000'}, 'id-2');
    liveList.buildCallback();
    liveList2.buildCallback();
    expect(manager.interval_).to.equal(15000);
    ready();
    return manager.whenDocReady_().then(() => {
      expect(manager.interval_).to.equal(5000);
    });
  });

  it(
    'should use custom containers for live-lists dynamically appended ' +
      'in the client',
    () => {
      const customSlot = document.createElement('div');
      customSlot.setAttribute('id', 'custom-slot');

      const fromServer = doc.createElement('div');
      fromServer.appendChild(customSlot);
      fromServer.getElementById = () => {};
      env.sandbox.stub(fromServer, 'getElementById').callsFake((id) => {
        return fromServer.querySelector(`#${id}`);
      });

      ready();
      const clientLiveList = getLiveList(
        {
          'data-poll-interval': '9000',
          'sort': 'ascending',
          'disable-scrolling': '',
          'disable-pagination': '',
          'auto-insert': '',
        },
        'i-amphtml-custom-slot-dynamic-list'
      );
      clientLiveList.element[AMP_LIVE_LIST_CUSTOM_SLOT_ID] = customSlot.id;
      clientLiveList.buildCallback();

      return manager.whenDocReady_().then(() => {
        expect(manager.getCustomSlots_(fromServer)).to.have.length(1);
      });
    }
  );

  it('should get the amp_latest_update_time on doc ready', () => {
    env.sandbox.stub(Math, 'random').callsFake(() => 1);
    ready();
    const liveList2 = getLiveList({'data-sort-time': '2222'}, 'id-2');
    liveList.buildCallback();
    liveList2.buildCallback();
    return manager.whenDocReady_().then(() => {
      const interval = liveList.getInterval();
      const tick = interval - jitterOffset;
      expect(manager.poller_.isRunning()).to.be.true;
      clock.tick(tick);
      return xhrs[0].then((xhr) =>
        expect(xhr.url).to.match(/amp_latest_update_time=2222/)
      );
    });
  });

  it("should not poll if all amp-live-list's are disabled on register", () => {
    const liveList2 = getLiveList({'data-poll-interval': '8000'}, 'id-2');

    liveList.toggle(false);
    liveList2.toggle(false);
    ready();
    // Important that we set this before build since then is when they register
    liveList.buildCallback();
    liveList2.buildCallback();
    expect(liveList.isEnabled()).to.be.false;
    expect(liveList2.isEnabled()).to.be.false;
    return manager.whenDocReady_().then(() => {
      expect(manager.poller_.isRunning()).to.be.false;
    });
  });

  it(
    'should not poll if live-story-disabled is present and other live-lists ' +
      'are also disabled',
    () => {
      const liveList2 = getLiveList({'data-poll-interval': '8000'}, 'id-2');

      ready();
      // Important that we set this before build since then is when they register
      liveList.buildCallback();
      liveList2.buildCallback();
      expect(liveList.isEnabled()).to.be.true;
      expect(liveList2.isEnabled()).to.be.true;
      return manager.whenDocReady_().then(() => {
        expect(manager.poller_.isRunning()).to.be.true;

        const fromServer1 = doc.createElement('div');
        const fromServer1List1 = doc.createElement('amp-live-list');
        fromServer1List1.setAttribute('id', 'id-1');
        const fromServer1List2 = doc.createElement('amp-live-list');
        fromServer1List2.setAttribute('id', 'id-2');
        fromServer1List2.setAttribute('live-story-disabled', '');
        fromServer1.appendChild(fromServer1List1);
        fromServer1.appendChild(fromServer1List2);

        expect(liveList.isEnabled()).to.be.true;
        expect(liveList2.isEnabled()).to.be.true;

        manager.updateLiveLists_(fromServer1);

        // Still polls since at least one live list can still receive updates.
        expect(liveList.isEnabled()).to.be.true;
        expect(liveList2.isEnabled()).to.be.false;
        expect(manager.poller_.isRunning()).to.be.true;

        const fromServer2 = doc.createElement('div');
        const fromServer2List1 = doc.createElement('amp-live-list');
        fromServer2List1.setAttribute('id', 'id-1');
        fromServer2List1.setAttribute('disabled', '');
        fromServer2.appendChild(fromServer2List1);

        manager.updateLiveLists_(fromServer2);

        expect(liveList.isEnabled()).to.be.false;
        expect(liveList2.isEnabled()).to.be.false;
        // At this point nothing can ever turn this back on since we stopped
        // polling altogether.
        expect(manager.poller_.isRunning()).to.be.false;
      });
    }
  );

  it(
    "should poll if at least one amp-live-list's is still active after " +
      'register and a live-story-disabled attribute is used',
    () => {
      const liveList2 = getLiveList({'data-poll-interval': '8000'}, 'id-2');

      ready();
      // Important that we set this before build since then is when they register
      liveList.buildCallback();
      liveList2.buildCallback();
      expect(liveList.isEnabled()).to.be.true;
      expect(liveList2.isEnabled()).to.be.true;
      return manager.whenDocReady_().then(() => {
        expect(manager.poller_.isRunning()).to.be.true;

        const fromServer1 = doc.createElement('div');
        const fromServer1List1 = doc.createElement('amp-live-list');
        fromServer1List1.setAttribute('id', 'id-1');
        const fromServer1List2 = doc.createElement('amp-live-list');
        fromServer1List2.setAttribute('id', 'id-2');
        fromServer1List2.setAttribute('live-story-disabled', '');
        fromServer1.appendChild(fromServer1List1);
        fromServer1.appendChild(fromServer1List2);

        expect(liveList.isEnabled()).to.be.true;
        expect(liveList2.isEnabled()).to.be.true;

        manager.updateLiveLists_(fromServer1);

        // Still polls since at least one live list can still receive updates.
        expect(liveList.isEnabled()).to.be.true;
        expect(liveList2.isEnabled()).to.be.false;
        expect(manager.poller_.isRunning()).to.be.true;

        const fromServer2 = doc.createElement('div');
        const fromServer2List1 = doc.createElement('amp-live-list');
        fromServer2List1.setAttribute('id', 'id-1');
        fromServer2.appendChild(fromServer2List1);

        manager.updateLiveLists_(fromServer2);

        expect(liveList.isEnabled()).to.be.true;
        expect(liveList2.isEnabled()).to.be.false;
        expect(manager.poller_.isRunning()).to.be.true;
      });
    }
  );

  it(
    "should poll if at least one amp-live-list's is still active after  " +
      'register',
    () => {
      const liveList2 = getLiveList({'data-poll-interval': '8000'}, 'id-2');

      ready();
      // Important that we set this before build since then is when they register
      liveList.buildCallback();
      liveList2.buildCallback();
      liveList.toggle(false);
      liveList2.toggle(true);
      return manager.whenDocReady_().then(() => {
        liveList.toggle(false);
        liveList2.toggle(true);
        expect(manager.poller_.isRunning()).to.be.true;
      });
    }
  );

  it(
    "should not poll if no amp-live-list's is still active after  " +
      'register',
    () => {
      const liveList2 = getLiveList({'data-poll-interval': '8000'}, 'id-2');

      ready();
      // Important that we set this before build since then is when they register
      liveList.buildCallback();
      liveList2.buildCallback();
      liveList.toggle(false);
      liveList2.toggle(false);
      return manager.whenDocReady_().then(() => {
        liveList.toggle(false);
        liveList2.toggle(false);
        expect(manager.poller_.isRunning()).to.be.false;
      });
    }
  );

  it("should not poll if all amp-live-list's are disabled after updates", () => {
    const liveList2 = getLiveList({'data-poll-interval': '8000'}, 'id-2');

    ready();
    // Important that we set this before build since then is when they register
    liveList.buildCallback();
    liveList2.buildCallback();
    expect(liveList.isEnabled()).to.be.true;
    expect(liveList2.isEnabled()).to.be.true;
    return manager.whenDocReady_().then(() => {
      expect(manager.poller_.isRunning()).to.be.true;

      const fromServer1 = doc.createElement('div');
      const fromServer1List1 = doc.createElement('amp-live-list');
      fromServer1List1.setAttribute('id', 'id-1');
      const fromServer1List2 = doc.createElement('amp-live-list');
      fromServer1List2.setAttribute('id', 'id-2');
      fromServer1List2.setAttribute('disabled', '');
      fromServer1.appendChild(fromServer1List1);
      fromServer1.appendChild(fromServer1List2);

      expect(liveList.isEnabled()).to.be.true;
      expect(liveList2.isEnabled()).to.be.true;

      manager.updateLiveLists_(fromServer1);

      // Still polls since at least one live list can still receive updates.
      expect(liveList.isEnabled()).to.be.true;
      expect(liveList2.isEnabled()).to.be.false;
      expect(manager.poller_.isRunning()).to.be.true;

      const fromServer2 = doc.createElement('div');
      const fromServer2List1 = doc.createElement('amp-live-list');
      fromServer2List1.setAttribute('id', 'id-1');
      fromServer2List1.setAttribute('disabled', '');
      fromServer2.appendChild(fromServer2List1);

      manager.updateLiveLists_(fromServer2);

      expect(liveList.isEnabled()).to.be.false;
      expect(liveList2.isEnabled()).to.be.false;
      // At this point nothing can ever turn this back on since we stopped
      // polling altogether.
      expect(manager.poller_.isRunning()).to.be.false;
    });
  });

  it('should respect `disabled` property on amp-live-list', () => {
    const liveList2 = getLiveList({'data-poll-interval': '8000'}, 'id-2');
    liveList.buildCallback();
    liveList2.buildCallback();
    liveList2.toggle(false);
    const updateSpy1 = env.sandbox.spy(liveList, 'update');
    const updateSpy2 = env.sandbox.spy(liveList2, 'update');

    expect(liveList.isEnabled()).to.be.true;
    expect(liveList2.isEnabled()).to.be.false;

    const fromServer1 = doc.createElement('div');
    const fromServer1List1 = doc.createElement('amp-live-list');
    fromServer1List1.setAttribute('id', 'id-1');
    const fromServer1List2 = doc.createElement('amp-live-list');
    fromServer1List2.setAttribute('id', 'id-2');
    // We have to set this here so that it actually is disabled
    fromServer1List2.setAttribute('disabled', '');
    fromServer1.appendChild(fromServer1List1);
    fromServer1.appendChild(fromServer1List2);

    expect(updateSpy1).to.have.not.been.called;
    expect(updateSpy2).to.have.not.been.called;

    manager.updateLiveLists_(fromServer1);

    expect(updateSpy1).to.be.calledOnce;
    expect(updateSpy2).to.have.not.been.called;

    const fromServer2 = doc.createElement('div');
    const fromServer2List1 = doc.createElement('amp-live-list');
    fromServer2List1.setAttribute('id', 'id-1');
    // No disabled attribute here which re-enables updates to
    // amp-live-list#id-2
    const fromServer2List2 = doc.createElement('amp-live-list');
    fromServer2List2.setAttribute('id', 'id-2');
    fromServer2.appendChild(fromServer2List1);
    fromServer2.appendChild(fromServer2List2);

    expect(updateSpy1).to.be.calledOnce;
    expect(updateSpy2).to.have.not.been.called;

    manager.updateLiveLists_(fromServer2);

    expect(updateSpy1).to.have.callCount(2);
    expect(updateSpy2).to.be.calledOnce;
  });

  it('should back off on transient 415 response', () => {
    env.sandbox.stub(Math, 'random').callsFake(() => 1);
    ready();
    const fetchSpy = env.sandbox.spy(manager, 'work_');
    liveList.buildCallback();
    return manager.whenDocReady_().then(() => {
      const interval = liveList.getInterval();
      const tick = interval - jitterOffset;
      expect(manager.poller_.isRunning()).to.be.true;
      expect(fetchSpy).to.have.not.been.called;
      clock.tick(tick);
      expect(fetchSpy).to.be.calledOnce;
      xhrs[0].then((xhr) =>
        xhr.respond(
          200,
          {
            'Content-Type': 'text/xml',
          },
          '<html></html>'
        )
      );

      return manager.poller_.lastWorkPromise_.then(() => {
        expect(manager.poller_.isRunning()).to.be.true;
        clock.tick(tick);
        xhrs[1].then((xhr) =>
          xhr.respond(
            415,
            {
              'Content-Type': 'text/xml',
            },
            '<html></html>'
          )
        );
        expect(fetchSpy).to.have.callCount(2);
        expect(manager.poller_.backoffClock_).to.be.null;
        return manager.poller_.lastWorkPromise_.then(() => {
          expect(manager.poller_.isRunning()).to.be.true;
          expect(manager.poller_.backoffClock_).to.be.a('function');
        });
      });
    });
  });

  it('should back off on transient 500 response', () => {
    env.sandbox.stub(Math, 'random').callsFake(() => 1);
    ready();
    const fetchSpy = env.sandbox.spy(manager, 'work_');
    liveList.buildCallback();
    return manager.whenDocReady_().then(() => {
      const interval = liveList.getInterval();
      const tick = interval - jitterOffset;
      expect(manager.poller_.isRunning()).to.be.true;
      expect(fetchSpy).to.have.not.been.called;
      clock.tick(tick);
      expect(fetchSpy).to.be.calledOnce;
      xhrs[0].then((xhr) =>
        xhr.respond(
          200,
          {
            'Content-Type': 'text/xml',
          },
          '<html></html>'
        )
      );

      return manager.poller_.lastWorkPromise_.then(() => {
        expect(manager.poller_.isRunning()).to.be.true;
        clock.tick(tick);
        xhrs[1].then((xhr) =>
          xhr.respond(
            500,
            {
              'Content-Type': 'text/xml',
            },
            '<html></html>'
          )
        );
        expect(fetchSpy).to.have.callCount(2);
        expect(manager.poller_.backoffClock_).to.be.null;
        return manager.poller_.lastWorkPromise_.then(() => {
          expect(manager.poller_.isRunning()).to.be.true;
          expect(manager.poller_.backoffClock_).to.be.a('function');
        });
      });
    });
  });

  it('should recover after transient 415 response', () => {
    env.sandbox.stub(Math, 'random').callsFake(() => 1);
    env.sandbox.stub(ampdoc, 'isVisible').returns(true);
    ready();
    const fetchSpy = env.sandbox.spy(manager, 'work_');
    liveList.buildCallback();
    return manager.whenDocReady_().then(() => {
      const interval = liveList.getInterval();
      const tick = interval - jitterOffset;
      expect(manager.poller_.isRunning()).to.be.true;
      expect(fetchSpy).to.have.not.been.called;
      clock.tick(tick);
      expect(fetchSpy).to.be.calledOnce;
      expect(manager.poller_.backoffClock_).to.be.null;
      xhrs[0].then((xhr) =>
        xhr.respond(
          415,
          {
            'Content-Type': 'text/xml',
          },
          '<html></html>'
        )
      );
      return manager.poller_.lastWorkPromise_.then(() => {
        expect(manager.poller_.isRunning()).to.be.true;
        expect(manager.poller_.backoffClock_).to.be.a('function');
        // tick 1 max initial backoff with random = 1
        clock.tick(700);
        expect(fetchSpy).to.have.callCount(2);
        xhrs[1].then((xhr) =>
          xhr.respond(
            200,
            {
              'Content-Type': 'text/xml',
            },
            '<html></html>'
          )
        );
        return manager.poller_.lastWorkPromise_.then(() => {
          expect(manager.poller_.isRunning()).to.be.true;
          expect(manager.poller_.backoffClock_).to.be.null;
        });
      });
    });
  });

  it(
    'should stop all polling if ampdoc is not visible ' +
      'and immediately fetch when visible',
    () => {
      ready();
      const fetchSpy = env.sandbox.spy(manager, 'work_');
      expect(fetchSpy).to.have.not.been.called;
      liveList.buildCallback();
      return manager.whenDocReady_().then(() => {
        expect(ampdoc.isVisible()).to.be.true;
        expect(manager.poller_.isRunning()).to.be.true;
        ampdoc.overrideVisibilityState('hidden');
        expect(fetchSpy).to.have.not.been.called;
        expect(manager.poller_.isRunning()).to.be.false;
        ampdoc.overrideVisibilityState('visible');
        expect(fetchSpy).to.be.calledOnce;
        expect(manager.poller_.isRunning()).to.be.true;
        ampdoc.overrideVisibilityState('inactive');
        expect(fetchSpy).to.be.calledOnce;
        expect(manager.poller_.isRunning()).to.be.false;
        ampdoc.overrideVisibilityState('visible');
        expect(fetchSpy).to.have.callCount(2);
        expect(manager.poller_.isRunning()).to.be.true;
        ampdoc.overrideVisibilityState('prerender');
        expect(fetchSpy).to.have.callCount(2);
        expect(manager.poller_.isRunning()).to.be.false;
        clock.tick(20000);
        expect(fetchSpy).to.have.callCount(2);
      });
    }
  );

  it("should not poll if all amp-live-list's are disabled on visible", () => {
    const fetchSpy = env.sandbox.spy(manager, 'work_');
    const liveList2 = getLiveList({'data-poll-interval': '8000'}, 'id-2');

    liveList.toggle(false);
    liveList2.toggle(false);
    ready();
    // Important that we set this before build since then is when they register
    liveList.buildCallback();
    liveList2.buildCallback();
    expect(liveList.isEnabled()).to.be.false;
    expect(liveList2.isEnabled()).to.be.false;
    return manager.whenDocReady_().then(() => {
      expect(ampdoc.isVisible()).to.be.true;
      expect(manager.poller_.isRunning()).to.be.false;
      ampdoc.overrideVisibilityState('hidden');
      expect(fetchSpy).to.have.not.been.called;
      expect(manager.poller_.isRunning()).to.be.false;
      ampdoc.overrideVisibilityState('visible');
      expect(manager.poller_.isRunning()).to.be.false;
      ampdoc.overrideVisibilityState('inactive');
      expect(manager.poller_.isRunning()).to.be.false;
      ampdoc.overrideVisibilityState('visible');
      expect(fetchSpy).to.have.not.been.called;
      expect(manager.poller_.isRunning()).to.be.false;
      ampdoc.overrideVisibilityState('prerender');
      expect(fetchSpy).to.have.not.been.called;
      expect(manager.poller_.isRunning()).to.be.false;
      clock.tick(20000);
      expect(fetchSpy).to.have.not.been.called;
    });
  });

  it('should fetch with url', () => {
    env.sandbox.stub(Math, 'random').callsFake(() => 1);
    env.sandbox.stub(ampdoc, 'isVisible').returns(true);
    manager.url_ = 'www.example.com/foo/bar?hello=world#dev=1';
    ready();
    const fetchSpy = env.sandbox.spy(manager, 'work_');
    liveList.buildCallback();
    return manager.whenDocReady_().then(() => {
      const interval = liveList.getInterval();
      const tick = interval - jitterOffset;
      expect(manager.poller_.isRunning()).to.be.true;
      expect(fetchSpy).to.have.not.been.called;
      clock.tick(tick);
      expect(fetchSpy).to.be.calledOnce;
      return xhrs[0].then((xhr) => {
        expect(xhr.url).to.match(/^www\.example\.com\/foo\/bar\?hello=world/);
        expect(xhr.url).to.match(/#dev=1/);
        expect(xhr.url).to.match(/amp_latest_update_time/);
      });
    });
  });

  it(
    'should fetch with url from the cache if on publisher origin ' +
      'and is transformed',
    () => {
      env.sandbox.stub(Math, 'random').callsFake(() => 1);
      env.sandbox.stub(ampdoc, 'isVisible').returns(true);
      manager.url_ = 'https://www.example.com/foo/bar?hello=world#dev=1';
      manager.isTransformed_ = true;
      ready();
      const fetchSpy = env.sandbox.spy(manager, 'work_');
      liveList.buildCallback();
      return manager.whenDocReady_().then(() => {
        const interval = liveList.getInterval();
        const tick = interval - jitterOffset;
        expect(manager.poller_.isRunning()).to.be.true;
        expect(fetchSpy).to.have.not.been.called;
        clock.tick(tick);
        expect(fetchSpy).to.be.calledOnce;
        return xhrs[0].then((xhr) => {
          expect(xhr.url).to.match(
            /^https:\/\/cdn\.ampproject\.org\/c\/www\.example\.com\/foo\/bar\?hello=world/
          );
          expect(xhr.url).to.match(/#dev=1/);
          expect(xhr.url).to.match(/amp_latest_update_time/);
        });
      });
    }
  );

  it(
    'should not fetch with url from the cache if on cache origin ' +
      'and is not transformed',
    () => {
      env.sandbox.stub(Math, 'random').callsFake(() => 1);
      env.sandbox.stub(ampdoc, 'isVisible').returns(true);
      manager.url_ = 'www.example.com/foo/bar?hello=world#dev=1';
      manager.isTransformed_ = false;
      manager.location_ =
        'https://cdn.ampproject.org' +
        '/c/s/www.example.com/foo/bar?hello=world#dev=1';
      ready();
      const fetchSpy = env.sandbox.spy(manager, 'work_');
      liveList.buildCallback();
      return manager.whenDocReady_().then(() => {
        const interval = liveList.getInterval();
        const tick = interval - jitterOffset;
        expect(manager.poller_.isRunning()).to.be.true;
        expect(fetchSpy).to.have.not.been.called;
        clock.tick(tick);
        expect(fetchSpy).to.be.calledOnce;
        return xhrs[0].then((xhr) => {
          expect(xhr.url).to.match(/^www\.example\.com\/foo\/bar\?hello=world/);
          expect(xhr.url).to.match(/#dev=1/);
          expect(xhr.url).to.match(/amp_latest_update_time/);
        });
      });
    }
  );

  it('should find highest "update time" from amp-live-list elements', () => {
    const doc = {};
    const list1 = getLiveList(undefined, 'id1');
    const list2 = getLiveList(undefined, 'id2');
    env.sandbox.stub(list1, 'update').returns(1000);
    env.sandbox.stub(list2, 'update').returns(2000);
    doc.getElementsByTagName = () => {
      return [list1.element, list2.element];
    };
    doc.querySelectorAll = () => [];
    list1.buildCallback();
    list2.buildCallback();
    expect(manager.latestUpdateTime_).to.equal(0);
    manager.updateLiveLists_(doc);
    expect(manager.latestUpdateTime_).to.equal(2000);
  });

  it('should add amp_latest_update_time on requests', () => {
    env.sandbox.stub(Math, 'random').callsFake(() => 1);
    env.sandbox.stub(ampdoc, 'isVisible').returns(true);
    manager.url_ = 'www.example.com/foo/bar?hello=world#dev=1';
    env.sandbox.stub(liveList, 'update').returns(2500);
    ready();
    liveList.buildCallback();
    const fetchSpy = env.sandbox.spy(manager, 'work_');
    return manager.whenDocReady_().then(() => {
      const interval = liveList.getInterval();
      const tick = interval - jitterOffset;
      expect(manager.poller_.isRunning()).to.be.true;
      expect(fetchSpy).to.have.not.been.called;
      clock.tick(tick);
      expect(fetchSpy).to.be.calledOnce;
      xhrs[0].then((xhr) => {
        expect(xhr.url).to.match(/amp_latest_update_time=1111/);
        xhr.respond(
          200,
          {
            'Content-Type': 'text/xml',
          },
          '<html><amp-live-list id="id-1"></amp-live-list></html>'
        );
      });
      return manager.poller_.lastWorkPromise_.then(() => {
        clock.tick(tick);
        expect(fetchSpy).to.have.callCount(2);
        return xhrs[1].then((xhr) =>
          expect(xhr.url).to.match(/amp_latest_update_time=2500/)
        );
      });
    });
  });
});

describes.realWin(
  'install scripts',
  {
    amp: true,
    fakeRegisterElement: true,
  },
  (env) => {
    let manager;
    let ampdoc;
    let win;
    let doc;
    let extensions;

    beforeEach(function () {
      win = env.win;
      doc = win.document;
      ampdoc = env.ampdoc;
      extensions = env.extensions;
      manager = new LiveListManager(ampdoc);
      env.sandbox
        .stub(LiveListManager, 'forDoc')
        .returns(Promise.resolve(manager));
    });

    it('should install newly discovered script tags on xhr doc', () => {
      // Emulate doc
      const div = document.createElement('div');
      const script1 = document.createElement('script');
      const script2 = document.createElement('script');
      script1.setAttribute('custom-element', 'amp-test');
      env.sandbox
        .stub(script1, 'src')
        .value('https://cdn.ampproject.org/v0/amp-test-0.2.js');
      script2.setAttribute('custom-template', 'amp-template');
      env.sandbox
        .stub(script2, 'src')
        .value('https://cdn.ampproject.org/v0/amp-template-0.2.js');
      div.appendChild(script1);
      div.appendChild(script2);

      expect(
        doc.head.querySelectorAll('[custom-element="amp-test"]')
      ).to.have.length(0);
      expect(extensions.extensions_['amp-test:0.2']).to.be.undefined;

      expect(
        doc.head.querySelectorAll('[custom-template="amp-template"]')
      ).to.have.length(0);
      expect(extensions.extensions_['amp-template:0.2']).to.be.undefined;

      manager.installExtensionsForDoc_(div);

      expect(
        doc.head.querySelectorAll('[custom-element="amp-test"][src*="-0.2"]')
      ).to.have.length(1);
      expect(extensions.extensions_['amp-test:0.2'].scriptPresent).to.be.true;

      expect(
        doc.head.querySelectorAll(
          '[custom-element="amp-template"][src*="-0.2"]'
        )
      ).to.have.length(1);
      expect(extensions.extensions_['amp-template:0.2'].scriptPresent).to.be
        .true;
    });
  }
);
