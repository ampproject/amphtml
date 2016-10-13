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

import {Viewer} from '../../src/service/viewer-impl';
import {dev} from '../../src/log';
import {platformFor} from '../../src/platform';
import {installDocService} from '../../src/service/ampdoc-impl';
import {installPlatformService} from '../../src/service/platform-impl';
import {installPerformanceService} from '../../src/service/performance-impl';
import {resetServiceForTesting} from '../../src/service';
import {timerFor} from '../../src/timer';
import {installTimerService} from '../../src/service/timer-impl';
import * as sinon from 'sinon';


describe('Viewer', () => {

  let sandbox;
  let windowMock;
  let viewer;
  let windowApi;
  let ampdoc;
  let clock;
  let events;
  let errorStub;
  let platform;

  function changeVisibility(vis) {
    windowApi.document.hidden = vis !== 'visible';
    windowApi.document.visibilityState = vis;
    if (events.visibilitychange) {
      events.visibilitychange({
        target: windowApi.document,
        type: 'visibilitychange',
        bubbles: false,
        cancelable: false,
      });
    }
  }

  beforeEach(() => {
    sandbox = sinon.sandbox.create();
    clock = sandbox.useFakeTimers();
    const WindowApi = function() {};
    windowApi = new WindowApi();
    installPerformanceService(windowApi);
    installPerformanceService(window);
    windowApi.setTimeout = window.setTimeout;
    windowApi.clearTimeout = window.clearTimeout;
    windowApi.location = {
      hash: '',
      href: '/test/viewer',
      ancestorOrigins: null,
    };
    windowApi.document = {
      nodeType: /* DOCUMENT */ 9,
      defaultView: windowApi,
      hidden: false,
      visibilityState: 'visible',
      addEventListener: function(type, listener) {
        events[type] = listener;
      },
      referrer: '',
      body: {style: {}},
      documentElement: {style: {}},
      title: 'Awesome doc',
    };
    windowApi.navigator = window.navigator;
    windowApi.history = {
      replaceState: sandbox.spy(),
    };
    const ampdocService = installDocService(windowApi, /* isSingleDoc */ true);
    ampdoc = ampdocService.getAmpDoc();
    installPlatformService(windowApi);
    installTimerService(windowApi);
    events = {};
    errorStub = sandbox.stub(dev(), 'error');
    windowMock = sandbox.mock(windowApi);
    platform = platformFor(windowApi);
    viewer = new Viewer(ampdoc);
  });

  afterEach(() => {
    resetServiceForTesting(windowApi, 'performance');
    resetServiceForTesting(window, 'performance');
    windowMock.verify();
    sandbox.restore();
  });

  it('should configure as natural viewport by default', () => {
    expect(viewer.getViewportType()).to.equal('natural');
    expect(viewer.getPaddingTop()).to.equal(0);
  });

  it('should configure correctly based on window name and hash', () => {
    windowApi.name = '__AMP__viewportType=natural';
    windowApi.location.hash = '#paddingTop=17&other=something';
    const viewer = new Viewer(ampdoc);
    expect(viewer.getViewportType()).to.equal('natural');
    expect(viewer.getPaddingTop()).to.equal(17);

    // All of the startup params are also available via getParam.
    expect(viewer.getParam('paddingTop')).to.equal('17');
    expect(viewer.getParam('other')).to.equal('something');
  });

  it('should configure ignore name and hash with explicit params', () => {
    const params = {
      'paddingTop': '171',
    };
    windowApi.name = '__AMP__other=something';
    windowApi.location.hash = '#paddingTop=17';
    const viewer = new Viewer(ampdoc, params);
    expect(viewer.getPaddingTop()).to.equal(171);

    // All of the startup params are also available via getParam.
    expect(viewer.getParam('paddingTop')).to.equal('171');
    expect(viewer.getParam('other')).to.not.exist;
  });

  it('should expose viewer capabilities', () => {
    windowApi.name = '__AMP__viewportType=natural';
    windowApi.location.hash = '#paddingTop=17&cap=foo,bar';
    const viewer = new Viewer(ampdoc);
    expect(viewer.hasCapability('foo')).to.be.true;
    expect(viewer.hasCapability('bar')).to.be.true;
    expect(viewer.hasCapability('other')).to.be.false;
  });

  it('should not clear fragment in non-embedded mode', () => {
    windowApi.parent = windowApi;
    windowApi.location.href = 'http://www.example.com#test=1';
    windowApi.location.hash = '#test=1';
    const viewer = new Viewer(ampdoc);
    expect(windowApi.history.replaceState.callCount).to.equal(0);
    expect(viewer.getParam('test')).to.equal('1');
    expect(viewer.hasCapability('foo')).to.be.false;
  });

  it('should clear fragment in embedded mode', () => {
    windowApi.parent = {};
    windowApi.location.href = 'http://www.example.com#test=1';
    windowApi.location.hash = '#test=1';
    const viewer = new Viewer(ampdoc);
    expect(windowApi.history.replaceState.callCount).to.equal(1);
    const replace = windowApi.history.replaceState.lastCall;
    expect(replace.args).to.jsonEqual([{}, '', 'http://www.example.com']);
    expect(viewer.getParam('test')).to.equal('1');
  });

  it('should clear fragment when click param is present', () => {
    windowApi.parent = windowApi;
    windowApi.location.href = 'http://www.example.com#click=abc';
    windowApi.location.hash = '#click=abc';
    const viewer = new Viewer(ampdoc);
    expect(windowApi.history.replaceState.callCount).to.equal(1);
    const replace = windowApi.history.replaceState.lastCall;
    expect(replace.args).to.jsonEqual([{}, '', 'http://www.example.com']);
    expect(viewer.getParam('click')).to.equal('abc');
  });

  it('should configure visibilityState visible by default', () => {
    expect(viewer.getVisibilityState()).to.equal('visible');
    expect(viewer.isVisible()).to.equal(true);
    expect(viewer.getPrerenderSize()).to.equal(1);
    expect(viewer.getFirstVisibleTime()).to.equal(0);
  });

  it('should initialize firstVisibleTime for initially visible doc', () => {
    clock.tick(1);
    const viewer = new Viewer(ampdoc);
    expect(viewer.isVisible()).to.be.true;
    expect(viewer.getFirstVisibleTime()).to.equal(1);
  });

  it('should initialize firstVisibleTime when doc becomes visible', () => {
    clock.tick(1);
    windowApi.location.hash = '#visibilityState=prerender&prerenderSize=3';
    const viewer = new Viewer(ampdoc);
    expect(viewer.isVisible()).to.be.false;
    expect(viewer.getFirstVisibleTime()).to.be.null;

    viewer.receiveMessage('visibilitychange', {
      state: 'visible',
    });
    expect(viewer.isVisible()).to.be.true;
    expect(viewer.getFirstVisibleTime()).to.equal(1);
  });

  it('should configure visibilityState and prerender', () => {
    windowApi.location.hash = '#visibilityState=prerender&prerenderSize=3';
    const viewer = new Viewer(ampdoc);
    expect(viewer.getVisibilityState()).to.equal('prerender');
    expect(viewer.isVisible()).to.equal(false);
    expect(viewer.getPrerenderSize()).to.equal(3);
  });

  it('should configure performance tracking', () => {
    windowApi.location.hash = '';
    let viewer = new Viewer(ampdoc);
    viewer.messagingMaybePromise_ = Promise.resolve();
    expect(viewer.isPerformanceTrackingOn()).to.be.false;

    windowApi.location.hash = '#csi=1';
    viewer = new Viewer(ampdoc);
    viewer.messagingMaybePromise_ = Promise.resolve();
    expect(viewer.isPerformanceTrackingOn()).to.be.true;

    windowApi.location.hash = '#csi=0';
    viewer = new Viewer(ampdoc);
    viewer.messagingMaybePromise_ = Promise.resolve();
    expect(viewer.isPerformanceTrackingOn()).to.be.false;

    windowApi.location.hash = '#csi=1';
    viewer = new Viewer(ampdoc);
    viewer.messagingMaybePromise_ = null;
    expect(viewer.isPerformanceTrackingOn()).to.be.false;

    windowApi.location.hash = '#csi=0';
    viewer = new Viewer(ampdoc);
    viewer.messagingMaybePromise_ = null;
    expect(viewer.isPerformanceTrackingOn()).to.be.false;
  });

  it('should get fragment from the url in non-embedded mode', () => {
    windowApi.parent = windowApi;
    windowApi.location.hash = '#foo';
    const viewer = new Viewer(ampdoc);
    return viewer.getFragment().then(fragment => {
      expect(fragment).to.be.equal('foo');
    });
  });

  it('should get fragment from the viewer in embedded mode' +
      'if the viewer has capability of getting fragment', () => {
    windowApi.parent = {};
    windowApi.location.hash = '#foo&cap=fragment';
    const viewer = new Viewer(ampdoc);
    sandbox.stub(viewer, 'sendMessageUnreliable_', name => {
      expect(name).to.equal('fragment');
      return Promise.resolve('from-viewer');
    });
    return viewer.getFragment().then(fragment => {
      expect(fragment).to.be.equal('from-viewer');
    });
  });

  it('should NOT get fragment from the viewer in embedded mode' +
      'if the viewer does NOT have capability of getting fragment', () => {
    windowApi.parent = {};
    windowApi.location.hash = '#foo';
    const viewer = new Viewer(ampdoc);
    sandbox.stub(viewer, 'sendMessageUnreliable_', name => {
      expect(name).to.equal('fragment');
      return Promise.resolve('from-viewer');
    });
    return viewer.getFragment().then(fragment => {
      expect(fragment).to.equal('');
    });
  });

  it('should NOT get fragment from the viewer in embedded mode' +
      'if the viewer does NOT return a fragment', () => {
    windowApi.parent = {};
    windowApi.location.hash = '#foo';
    const viewer = new Viewer(ampdoc);
    sandbox.stub(viewer, 'sendMessageUnreliable_', name => {
      expect(name).to.equal('fragment');
      return Promise.resolve();
    });
    return viewer.getFragment().then(fragment => {
      expect(fragment).to.equal('');
    });
  });

  it('should configure correctly for iOS embedding', () => {
    windowApi.name = '__AMP__viewportType=natural';
    windowApi.parent = {};
    sandbox.mock(platform).expects('isIos').returns(true).atLeast(1);
    const viewer = new Viewer(ampdoc);

    expect(viewer.getViewportType()).to.equal('natural-ios-embed');
  });

  it('should NOT configure for iOS embedding if not embedded', () => {
    windowApi.name = '__AMP__viewportType=natural';
    windowApi.parent = windowApi;
    sandbox.mock(platform).expects('isIos').returns(true).atLeast(1);
    windowApi.AMP_MODE = {
      localDev: false,
      development: false,
    };
    const viewportType = new Viewer(ampdoc).getViewportType();
    expect(viewportType).to.equal('natural');
  });

  it('should receive viewport event', () => {
    let viewportEvent = null;
    viewer.onViewportEvent(event => {
      viewportEvent = event;
    });
    viewer.receiveMessage('viewport', {
      paddingTop: 19,
    });
    expect(viewportEvent).to.not.equal(null);
    expect(viewer.getPaddingTop()).to.equal(19);
  });

  describe('should receive the visibilitychange event', () => {
    it('should change prerenderSize', () => {
      viewer.receiveMessage('visibilitychange', {
        prerenderSize: 4,
      });
      expect(viewer.getPrerenderSize()).to.equal(4);
    });

    it('should change visibilityState', () => {
      viewer.receiveMessage('visibilitychange', {
        state: 'paused',
      });
      expect(viewer.getVisibilityState()).to.equal('paused');
      expect(viewer.isVisible()).to.equal(false);
    });

    it('should receive "paused" visibilityState', () => {
      viewer.receiveMessage('visibilitychange', {
        state: 'paused',
      });
      expect(viewer.getVisibilityState()).to.equal('paused');
      expect(viewer.isVisible()).to.equal(false);
    });

    it('should receive "inactive" visibilityState', () => {
      viewer.receiveMessage('visibilitychange', {
        state: 'inactive',
      });
      expect(viewer.getVisibilityState()).to.equal('inactive');
      expect(viewer.isVisible()).to.equal(false);
    });

    it('should parse "hidden" as "prerender" before first visible', () => {
      viewer.hasBeenVisible_ = false;
      viewer.receiveMessage('visibilitychange', {
        state: 'hidden',
      });
      expect(viewer.getVisibilityState()).to.equal('prerender');
      expect(viewer.isVisible()).to.equal(false);
    });

    it('should parse "hidden" as "inactive" after first visible', () => {
      viewer.hasBeenVisible_ = true;
      viewer.receiveMessage('visibilitychange', {
        state: 'hidden',
      });
      expect(viewer.getVisibilityState()).to.equal('inactive');
      expect(viewer.isVisible()).to.equal(false);
    });

    it('should reject unknown values', () => {
      viewer.receiveMessage('visibilitychange', {
        state: 'paused',
      });
      expect(() => {
        viewer.receiveMessage('visibilitychange', {
          state: 'what is this',
        });
      }).to.throw('Unknown VisibilityState value');
      expect(viewer.getVisibilityState()).to.equal('paused');
      expect(viewer.isVisible()).to.equal(false);
    });

    it('should be inactive when the viewer tells us we are inactive', () => {
      viewer.receiveMessage('visibilitychange', {
        state: 'inactive',
      });
      expect(viewer.getVisibilityState()).to.equal('inactive');
      expect(viewer.isVisible()).to.equal(false);
      changeVisibility('hidden');
      expect(viewer.getVisibilityState()).to.equal('inactive');
      expect(viewer.isVisible()).to.equal(false);
    });

    it('should be prerender when the viewer tells us we are prerender', () => {
      viewer.receiveMessage('visibilitychange', {
        state: 'prerender',
      });
      expect(viewer.getVisibilityState()).to.equal('prerender');
      expect(viewer.isVisible()).to.equal(false);
      changeVisibility('visible');
      expect(viewer.getVisibilityState()).to.equal('prerender');
      expect(viewer.isVisible()).to.equal(false);
    });

    it('should be hidden when the browser document is hidden', () => {
      changeVisibility('hidden');
      viewer.receiveMessage('visibilitychange', {
        state: 'visible',
      });
      expect(viewer.getVisibilityState()).to.equal('hidden');
      expect(viewer.isVisible()).to.equal(false);
      viewer.receiveMessage('visibilitychange', {
        state: 'paused',
      });
      expect(viewer.getVisibilityState()).to.equal('hidden');
      expect(viewer.isVisible()).to.equal(false);
      viewer.receiveMessage('visibilitychange', {
        state: 'visible',
      });
      expect(viewer.getVisibilityState()).to.equal('hidden');
      expect(viewer.isVisible()).to.equal(false);
    });

    it('should be paused when the browser document is visible but viewer is' +
       'paused', () => {
      changeVisibility('visible');
      viewer.receiveMessage('visibilitychange', {
        state: 'paused',
      });
      expect(viewer.getVisibilityState()).to.equal('paused');
      expect(viewer.isVisible()).to.equal(false);
    });

    it('should be visible when the browser document is visible', () => {
      changeVisibility('visible');
      viewer.receiveMessage('visibilitychange', {
        state: 'visible',
      });
      expect(viewer.getVisibilityState()).to.equal('visible');
      expect(viewer.isVisible()).to.equal(true);
    });

    it('should be hidden when the browser document is unknown state', () => {
      changeVisibility('what is this');
      expect(viewer.getVisibilityState()).to.equal('hidden');
      expect(viewer.isVisible()).to.equal(false);
      viewer.receiveMessage('visibilitychange', {
        state: 'paused',
      });
      expect(viewer.getVisibilityState()).to.equal('hidden');
      expect(viewer.isVisible()).to.equal(false);
    });

    it('should change visibility on visibilitychange event', () => {
      changeVisibility('hidden');
      expect(viewer.getVisibilityState()).to.equal('hidden');
      expect(viewer.isVisible()).to.equal(false);
      changeVisibility('visible');
      expect(viewer.getVisibilityState()).to.equal('visible');
      expect(viewer.isVisible()).to.equal(true);

      viewer.receiveMessage('visibilitychange', {
        state: 'hidden',
      });
      changeVisibility('hidden');
      expect(viewer.getVisibilityState()).to.equal('inactive');
      expect(viewer.isVisible()).to.equal(false);
      changeVisibility('visible');
      expect(viewer.getVisibilityState()).to.equal('inactive');
      expect(viewer.isVisible()).to.equal(false);

      viewer.receiveMessage('visibilitychange', {
        state: 'inactive',
      });
      changeVisibility('hidden');
      expect(viewer.getVisibilityState()).to.equal('inactive');
      expect(viewer.isVisible()).to.equal(false);
      changeVisibility('visible');
      expect(viewer.getVisibilityState()).to.equal('inactive');
      expect(viewer.isVisible()).to.equal(false);

      viewer.receiveMessage('visibilitychange', {
        state: 'paused',
      });
      changeVisibility('hidden');
      expect(viewer.getVisibilityState()).to.equal('hidden');
      expect(viewer.isVisible()).to.equal(false);
      changeVisibility('visible');
      expect(viewer.getVisibilityState()).to.equal('paused');
      expect(viewer.isVisible()).to.equal(false);

      viewer.receiveMessage('visibilitychange', {
        state: 'visible',
      });
      changeVisibility('hidden');
      expect(viewer.getVisibilityState()).to.equal('hidden');
      expect(viewer.isVisible()).to.equal(false);
      changeVisibility('visible');
      expect(viewer.getVisibilityState()).to.equal('visible');
      expect(viewer.isVisible()).to.equal(true);
    });
  });

  it('should post documentLoaded event', () => {
    viewer.postDocumentReady();
    const m = viewer.messageQueue_[0];
    expect(m.eventType).to.equal('documentLoaded');
    expect(m.data.title).to.equal('Awesome doc');
  });

  it('should post scroll event', () => {
    viewer.postScroll(111);
    const m = viewer.messageQueue_[0];
    expect(m.eventType).to.equal('scroll');
    expect(m.data.scrollTop).to.equal(111);
  });

  it('should post request/cancelFullOverlay event', () => {
    viewer.requestFullOverlay();
    viewer.cancelFullOverlay();
    expect(viewer.messageQueue_[0].eventType).to.equal('requestFullOverlay');
    expect(viewer.messageQueue_[1].eventType).to.equal('cancelFullOverlay');
  });

  it('should queue non-dupe events', () => {
    viewer.postDocumentReady();
    viewer.postDocumentReady();
    expect(viewer.messageQueue_.length).to.equal(1);
    expect(viewer.messageQueue_[0].eventType).to.equal('documentLoaded');
  });

  describe('baseCid', () => {
    const cidData = JSON.stringify({
      time: 100,
      cid: 'cid-123',
    });
    let trustedViewer;
    let persistedCidData;
    let shouldTimeout;

    beforeEach(() => {
      shouldTimeout = false;
      clock.tick(100);
      trustedViewer = true;
      persistedCidData = cidData;
      sandbox.stub(viewer, 'isTrustedViewer',
          () => Promise.resolve(trustedViewer));
      sandbox.stub(viewer, 'sendMessage', (message, payload) => {
        if (message != 'cid') {
          return Promise.reject();
        }
        if (shouldTimeout) {
          return timerFor(window).promise(15000);
        }
        if (payload) {
          persistedCidData = payload;
        }
        return Promise.resolve(persistedCidData);
      });
    });

    it('should return CID', () => {
      const p = expect(viewer.baseCid()).to.eventually.equal(cidData);
      p.then(() => {
        // This should not trigger a timeout.
        clock.tick(100000);
      });
      return p;
    });

    it('should not request cid for untrusted viewer', () => {
      trustedViewer = false;
      return expect(viewer.baseCid()).to.eventually.be.undefined;
    });

    it('should convert CID returned by legacy API to new format', () => {
      persistedCidData = 'cid-123';
      return expect(viewer.baseCid()).to.eventually.equal(cidData);
    });

    it('should send message to store cid', () => {
      const newCidData = JSON.stringify({time: 101, cid: 'cid-456'});
      return expect(viewer.baseCid(newCidData))
          .to.eventually.equal(newCidData);
    });

    it('should time out', () => {
      shouldTimeout = true;
      const p = expect(viewer.baseCid()).to.eventually.be.undefined;
      Promise.resolve().then(() => {
        clock.tick(9999);
        Promise.resolve().then(() => {
          clock.tick(1);
        });
      });
      return p.then(() => {
        // Ticked 100 at start.
        expect(Date.now()).to.equal(10100);
      });
    });
  });

  it('should dequeue events when deliverer set', () => {
    viewer.postDocumentReady();
    expect(viewer.messageQueue_.length).to.equal(1);

    const delivered = [];
    viewer.setMessageDeliverer((eventType, data) => {
      delivered.push({eventType, data});
    }, 'https://acme.com');

    expect(viewer.messageQueue_.length).to.equal(0);
    expect(delivered.length).to.equal(1);
    expect(delivered[0].eventType).to.equal('documentLoaded');
  });

  describe('Messaging not embedded', () => {

    it('should not expect messaging', () => {
      expect(viewer.messagingReadyPromise_).to.be.null;
      expect(viewer.messagingMaybePromise_).to.be.null;
    });

    it('should fail sendMessage', () => {
      return viewer.sendMessage('message1', {}, /* awaitResponse */ false)
          .then(() => {
            throw new Error('should not succeed');
          }, error => {
            expect(error.message).to.match(/No messaging channel/);
          });
    });

    it('should post broadcast event but not fail', () => {
      viewer.broadcast({type: 'type1'});
      expect(viewer.messageQueue_.length).to.equal(0);
    });
  });

  describe('Messaging', () => {
    beforeEach(() => {
      windowApi.parent = {};
      viewer = new Viewer(ampdoc);
    });

    it('should receive broadcast event', () => {
      let broadcastMessage = null;
      viewer.onBroadcast(message => {
        broadcastMessage = message;
      });
      viewer.receiveMessage('broadcast', {type: 'type1'});
      expect(broadcastMessage).to.exist;
      expect(broadcastMessage.type).to.equal('type1');
    });

    it('should post broadcast event', () => {
      const delivered = [];
      viewer.setMessageDeliverer((eventType, data) => {
        delivered.push({eventType, data});
      }, 'https://acme.com');
      viewer.broadcast({type: 'type1'});
      expect(viewer.messageQueue_.length).to.equal(0);
      return viewer.messagingMaybePromise_.then(() => {
        expect(delivered.length).to.equal(1);
        const m = delivered[0];
        expect(m.eventType).to.equal('broadcast');
        expect(m.data.type).to.equal('type1');
      });
    });

    it('should post broadcast event but not fail w/o messaging', () => {
      viewer.broadcast({type: 'type1'});
      expect(viewer.messageQueue_.length).to.equal(0);
      clock.tick(20001);
      return viewer.messagingReadyPromise_.then(() => 'OK', () => 'ERROR')
          .then(res => {
            expect(res).to.equal('ERROR');
            return viewer.messagingMaybePromise_;
          }).then(() => {
            expect(viewer.messageQueue_.length).to.equal(0);
          });
    });

    it('should wait for messaging channel', () => {
      let m1Resolved = false;
      let m2Resolved = false;
      const m1 = viewer.sendMessage('message1', {}, /* awaitResponse */ false)
          .then(() => {
            m1Resolved = true;
          });
      const m2 = viewer.sendMessage('message2', {}, /* awaitResponse */ true)
          .then(() => {
            m2Resolved = true;
          });
      return Promise.resolve().then(() => {
        // Not resolved yet.
        expect(m1Resolved).to.be.false;
        expect(m2Resolved).to.be.false;

        // Set message deliverer.
        viewer.setMessageDeliverer(() => {
          return Promise.resolve();
        }, 'https://acme.com');
        expect(m1Resolved).to.be.false;
        expect(m2Resolved).to.be.false;

        return Promise.all([m1, m2]);
      }).then(() => {
        // All resolved now.
        expect(m1Resolved).to.be.true;
        expect(m2Resolved).to.be.true;
      });
    });

    it('should timeout messaging channel', () => {
      let m1Resolved = false;
      let m2Resolved = false;
      const m1 = viewer.sendMessage('message1', {}, /* awaitResponse */ false)
          .then(() => {
            m1Resolved = true;
          });
      const m2 = viewer.sendMessage('message2', {}, /* awaitResponse */ true)
          .then(() => {
            m2Resolved = true;
          });
      return Promise.resolve().then(() => {
        // Not resolved yet.
        expect(m1Resolved).to.be.false;
        expect(m2Resolved).to.be.false;

        // Timeout.
        clock.tick(20001);
        return Promise.all([m1, m2]);
      }).then(() => {
        throw new Error('must never be here');
      }, () => {
        // Not resolved ever.
        expect(m1Resolved).to.be.false;
        expect(m2Resolved).to.be.false;
      });
    });
  });

  describe('isEmbedded', () => {
    it('should NOT be embedded when not iframed or w/o "origin"', () => {
      windowApi.parent = windowApi;
      expect(new Viewer(ampdoc).isEmbedded()).to.be.false;
    });

    it('should be embedded when iframed', () => {
      windowApi.parent = {};
      expect(new Viewer(ampdoc).isEmbedded()).to.be.true;
    });

    it('should be embedded with "origin" param', () => {
      windowApi.parent = windowApi;
      windowApi.location.hash = '#webview=1';
      expect(new Viewer(ampdoc).isEmbedded()).to.be.true;
    });
  });

  describe('isTrustedViewer', () => {

    function test(origin, toBeTrusted) {
      const viewer = new Viewer(ampdoc);
      expect(viewer.isTrustedViewerOrigin_(origin)).to.equal(toBeTrusted);
    }

    it('should consider non-trusted when not iframed', () => {
      windowApi.parent = windowApi;
      windowApi.location.ancestorOrigins = ['https://google.com'];
      return new Viewer(ampdoc).isTrustedViewer().then(res => {
        expect(res).to.be.false;
      });
    });

    it('should consider trusted by ancestor', () => {
      windowApi.parent = {};
      windowApi.location.ancestorOrigins = ['https://google.com'];
      return new Viewer(ampdoc).isTrustedViewer().then(res => {
        expect(res).to.be.true;
      });
    });

    it('should consider non-trusted without ancestor', () => {
      windowApi.parent = {};
      windowApi.location.ancestorOrigins = [];
      return new Viewer(ampdoc).isTrustedViewer().then(res => {
        expect(res).to.be.false;
      });
    });

    it('should consider non-trusted with wrong ancestor', () => {
      windowApi.parent = {};
      windowApi.location.ancestorOrigins = ['https://untrusted.com'];
      return new Viewer(ampdoc).isTrustedViewer().then(res => {
        expect(res).to.be.false;
      });
    });

    it('should decide trusted on connection with origin', () => {
      windowApi.parent = {};
      windowApi.location.ancestorOrigins = null;
      const viewer = new Viewer(ampdoc);
      viewer.setMessageDeliverer(() => {}, 'https://google.com');
      return viewer.isTrustedViewer().then(res => {
        expect(res).to.be.true;
      });
    });

    it('should NOT allow channel without origin', () => {
      windowApi.parent = {};
      windowApi.location.ancestorOrigins = null;
      const viewer = new Viewer(ampdoc);
      expect(() => {
        viewer.setMessageDeliverer(() => {});
      }).to.throw(/message channel must have an origin/);
    });

    it('should decide non-trusted on connection with wrong origin', () => {
      windowApi.parent = {};
      windowApi.location.ancestorOrigins = null;
      const viewer = new Viewer(ampdoc);
      viewer.setMessageDeliverer(() => {}, 'https://untrusted.com');
      return viewer.isTrustedViewer().then(res => {
        expect(res).to.be.false;
      });
    });

    it('should give precedence to ancestor', () => {
      windowApi.parent = {};
      windowApi.location.ancestorOrigins = ['https://google.com'];
      const viewer = new Viewer(ampdoc);
      viewer.setMessageDeliverer(() => {}, 'https://untrusted.com');
      return viewer.isTrustedViewer().then(res => {
        expect(res).to.be.true;
      });
    });

    it('should trust domain variations', () => {
      test('https://google.com', true);
      test('https://www.google.com', true);
      test('https://news.google.com', true);
      test('https://google.co', true);
      test('https://www.google.co', true);
      test('https://news.google.co', true);
      test('https://www.google.co.uk', true);
      test('https://www.google.co.au', true);
      test('https://news.google.co.uk', true);
      test('https://news.google.co.au', true);
      test('https://google.de', true);
      test('https://www.google.de', true);
      test('https://news.google.de', true);
      test('https://abc.www.google.com', true);
      test('https://google.cat', true);
      test('https://www.google.cat', true);
    });

    it('should not trust host as referrer with http', () => {
      test('http://google.com', false);
    });

    it('should NOT trust wrong or non-whitelisted domain variations', () => {
      test('https://google.net', false);
      test('https://google.other.com', false);
      test('https://www.google.other.com', false);
      test('https://withgoogle.com', false);
      test('https://acme.com', false);
      test('https://google', false);
      test('https://www.google', false);
    });
  });

  describe('referrer', () => {

    it('should return document referrer if not overriden', () => {
      windowApi.parent = {};
      windowApi.location.hash = '#';
      windowApi.document.referrer = 'https://acme.org/docref';
      const viewer = new Viewer(ampdoc);
      expect(viewer.getUnconfirmedReferrerUrl())
          .to.equal('https://acme.org/docref');
      return viewer.getReferrerUrl().then(referrerUrl => {
        expect(referrerUrl).to.equal('https://acme.org/docref');
        expect(errorStub.callCount).to.equal(0);
      });
    });

    it('should NOT allow override if not iframed', () => {
      windowApi.parent = windowApi;
      windowApi.location.hash = '#referrer=' +
          encodeURIComponent('https://acme.org/viewer');
      windowApi.document.referrer = 'https://acme.org/docref';
      const viewer = new Viewer(ampdoc);
      expect(viewer.getUnconfirmedReferrerUrl())
          .to.equal('https://acme.org/docref');
      return viewer.getReferrerUrl().then(referrerUrl => {
        expect(referrerUrl).to.equal('https://acme.org/docref');
        expect(errorStub.callCount).to.equal(0);
      });
    });

    it('should NOT allow override if not trusted', () => {
      windowApi.parent = {};
      windowApi.location.hash = '#referrer=' +
          encodeURIComponent('https://acme.org/viewer');
      windowApi.document.referrer = 'https://acme.org/docref';
      windowApi.location.ancestorOrigins = ['https://untrusted.com'];
      const viewer = new Viewer(ampdoc);
      expect(viewer.getUnconfirmedReferrerUrl())
          .to.equal('https://acme.org/docref');
      return viewer.getReferrerUrl().then(referrerUrl => {
        expect(referrerUrl).to.equal('https://acme.org/docref');
        expect(errorStub.callCount).to.equal(0);
      });
    });

    it('should NOT allow override if ancestor is empty', () => {
      windowApi.parent = {};
      windowApi.location.hash = '#referrer=' +
          encodeURIComponent('https://acme.org/viewer');
      windowApi.document.referrer = 'https://acme.org/docref';
      windowApi.location.ancestorOrigins = [];
      const viewer = new Viewer(ampdoc);
      expect(viewer.getUnconfirmedReferrerUrl())
          .to.equal('https://acme.org/docref');
      return viewer.getReferrerUrl().then(referrerUrl => {
        expect(referrerUrl).to.equal('https://acme.org/docref');
        expect(errorStub.callCount).to.equal(0);
      });
    });

    it('should allow partial override if async not trusted', () => {
      windowApi.parent = {};
      windowApi.location.hash = '#referrer=' +
          encodeURIComponent('https://acme.org/viewer');
      windowApi.document.referrer = 'https://acme.org/docref';
      const viewer = new Viewer(ampdoc);
      // Unconfirmed referrer is overriden, but not confirmed yet.
      expect(viewer.getUnconfirmedReferrerUrl())
          .to.equal('https://acme.org/viewer');
      viewer.setMessageDeliverer(() => {}, 'https://untrusted.com');
      return viewer.getReferrerUrl().then(referrerUrl => {
        expect(referrerUrl).to.equal('https://acme.org/docref');
        // Unconfirmed referrer is reset. Async error is thrown.
        expect(viewer.getUnconfirmedReferrerUrl())
            .to.equal('https://acme.org/docref');
        expect(errorStub.callCount).to.equal(1);
        expect(errorStub.calledWith('Viewer',
            sinon.match(arg => {
              return !!arg.match(/Untrusted viewer referrer override/);
            }))).to.be.true;
      });
    });

    it('should allow full override if async trusted', () => {
      windowApi.parent = {};
      windowApi.location.hash = '#referrer=' +
          encodeURIComponent('https://acme.org/viewer');
      windowApi.document.referrer = 'https://acme.org/docref';
      const viewer = new Viewer(ampdoc);
      // Unconfirmed referrer is overriden and will be confirmed next.
      expect(viewer.getUnconfirmedReferrerUrl())
          .to.equal('https://acme.org/viewer');
      viewer.setMessageDeliverer(() => {}, 'https://google.com');
      return viewer.getReferrerUrl().then(referrerUrl => {
        expect(referrerUrl).to.equal('https://acme.org/viewer');
        // Unconfirmed is confirmed and kept.
        expect(viewer.getUnconfirmedReferrerUrl())
            .to.equal('https://acme.org/viewer');
        expect(errorStub.callCount).to.equal(0);
      });
    });

    it('should allow override if iframed and trusted', () => {
      windowApi.parent = {};
      windowApi.location.hash = '#referrer=' +
          encodeURIComponent('https://acme.org/viewer');
      windowApi.document.referrer = 'https://acme.org/docref';
      windowApi.location.ancestorOrigins = ['https://google.com'];
      const viewer = new Viewer(ampdoc);
      expect(viewer.getUnconfirmedReferrerUrl())
          .to.equal('https://acme.org/viewer');
      return viewer.getReferrerUrl().then(referrerUrl => {
        expect(referrerUrl).to.equal('https://acme.org/viewer');
        expect(errorStub.callCount).to.equal(0);
      });
    });

    it('should allow override to empty if iframed and trusted', () => {
      windowApi.parent = {};
      windowApi.location.hash = '#referrer=';
      windowApi.document.referrer = 'https://acme.org/docref';
      windowApi.location.ancestorOrigins = ['https://google.com'];
      const viewer = new Viewer(ampdoc);
      expect(viewer.getUnconfirmedReferrerUrl())
          .to.equal('');
      return viewer.getReferrerUrl().then(referrerUrl => {
        expect(referrerUrl).to.equal('');
        expect(errorStub.callCount).to.equal(0);
      });
    });
  });

  describe('viewerUrl', () => {

    it('should initially always return current location', () => {
      windowApi.location.href = 'https://acme.org/doc1#hash';
      const viewer = new Viewer(ampdoc);
      expect(viewer.getResolvedViewerUrl()).to.equal('https://acme.org/doc1');
    });

    it('should always return current location for top-level window', () => {
      windowApi.parent = windowApi;
      windowApi.location.href = 'https://acme.org/doc1#hash';
      const viewer = new Viewer(ampdoc);
      expect(viewer.getResolvedViewerUrl()).to.equal('https://acme.org/doc1');
      return viewer.getViewerUrl().then(viewerUrl => {
        expect(viewerUrl).to.equal('https://acme.org/doc1');
        expect(viewer.getResolvedViewerUrl()).to.equal('https://acme.org/doc1');
        expect(errorStub.callCount).to.equal(0);
      });
    });

    it('should NOT allow override if not iframed', () => {
      windowApi.parent = windowApi;
      windowApi.location.href = 'https://acme.org/doc1';
      windowApi.location.hash = '#viewerUrl=' +
          encodeURIComponent('https://acme.org/viewer');
      const viewer = new Viewer(ampdoc);
      expect(viewer.getResolvedViewerUrl()).to.equal('https://acme.org/doc1');
      return viewer.getViewerUrl().then(viewerUrl => {
        expect(viewerUrl).to.equal('https://acme.org/doc1');
        expect(viewer.getResolvedViewerUrl()).to.equal('https://acme.org/doc1');
        expect(errorStub.callCount).to.equal(0);
      });
    });

    it('should NOT allow override if not trusted', () => {
      windowApi.parent = {};
      windowApi.location.href = 'https://acme.org/doc1';
      windowApi.location.hash = '#viewerUrl=' +
          encodeURIComponent('https://acme.org/viewer');
      windowApi.location.ancestorOrigins = ['https://untrusted.com'];
      const viewer = new Viewer(ampdoc);
      expect(viewer.getResolvedViewerUrl()).to.equal('https://acme.org/doc1');
      return viewer.getViewerUrl().then(viewerUrl => {
        expect(viewerUrl).to.equal('https://acme.org/doc1');
        expect(viewer.getResolvedViewerUrl()).to.equal('https://acme.org/doc1');
        expect(errorStub.callCount).to.equal(1);
        expect(errorStub.calledWith('Viewer',
            sinon.match(arg => {
              return !!arg.match(/Untrusted viewer url override/);
            }))).to.be.true;
      });
    });

    it('should NOT allow override if ancestor is empty', () => {
      windowApi.parent = {};
      windowApi.location.href = 'https://acme.org/doc1';
      windowApi.location.hash = '#viewerUrl=' +
          encodeURIComponent('https://acme.org/viewer');
      windowApi.location.ancestorOrigins = [];
      const viewer = new Viewer(ampdoc);
      expect(viewer.getResolvedViewerUrl()).to.equal('https://acme.org/doc1');
      return viewer.getViewerUrl().then(viewerUrl => {
        expect(viewerUrl).to.equal('https://acme.org/doc1');
        expect(viewer.getResolvedViewerUrl()).to.equal('https://acme.org/doc1');
        expect(errorStub.callCount).to.equal(1);
        expect(errorStub.calledWith('Viewer',
            sinon.match(arg => {
              return !!arg.match(/Untrusted viewer url override/);
            }))).to.be.true;
      });
    });

    it('should allow partial override if async not trusted', () => {
      windowApi.parent = {};
      windowApi.location.href = 'https://acme.org/doc1';
      windowApi.location.hash = '#viewerUrl=' +
          encodeURIComponent('https://acme.org/viewer');
      const viewer = new Viewer(ampdoc);
      expect(viewer.getResolvedViewerUrl()).to.equal('https://acme.org/doc1');
      viewer.setMessageDeliverer(() => {}, 'https://untrusted.com');
      return viewer.getViewerUrl().then(viewerUrl => {
        expect(viewerUrl).to.equal('https://acme.org/doc1');
        expect(viewer.getResolvedViewerUrl()).to.equal('https://acme.org/doc1');
        expect(errorStub.callCount).to.equal(1);
        expect(errorStub.calledWith('Viewer',
            sinon.match(arg => {
              return !!arg.match(/Untrusted viewer url override/);
            }))).to.be.true;
      });
    });

    it('should allow full override if async trusted', () => {
      windowApi.parent = {};
      windowApi.location.href = 'https://acme.org/doc1';
      windowApi.location.hash = '#viewerUrl=' +
          encodeURIComponent('https://acme.org/viewer');
      const viewer = new Viewer(ampdoc);
      expect(viewer.getResolvedViewerUrl()).to.equal('https://acme.org/doc1');
      viewer.setMessageDeliverer(() => {}, 'https://google.com');
      return viewer.getViewerUrl().then(viewerUrl => {
        expect(viewerUrl).to.equal('https://acme.org/viewer');
        expect(viewer.getResolvedViewerUrl())
            .to.equal('https://acme.org/viewer');
        expect(errorStub.callCount).to.equal(0);
      });
    });

    it('should allow override if iframed and trusted', () => {
      windowApi.parent = {};
      windowApi.location.href = 'https://acme.org/doc1';
      windowApi.location.hash = '#viewerUrl=' +
          encodeURIComponent('https://acme.org/viewer');
      windowApi.location.ancestorOrigins = ['https://google.com'];
      const viewer = new Viewer(ampdoc);
      expect(viewer.getResolvedViewerUrl()).to.equal('https://acme.org/doc1');
      return viewer.getViewerUrl().then(viewerUrl => {
        expect(viewerUrl).to.equal('https://acme.org/viewer');
        expect(viewer.getResolvedViewerUrl())
            .to.equal('https://acme.org/viewer');
        expect(errorStub.callCount).to.equal(0);
      });
    });

    it('should ignore override to empty if iframed and trusted', () => {
      windowApi.parent = {};
      windowApi.location.href = 'https://acme.org/doc1';
      windowApi.location.hash = '#viewerUrl=';
      windowApi.location.ancestorOrigins = ['https://google.com'];
      const viewer = new Viewer(ampdoc);
      expect(viewer.getResolvedViewerUrl()).to.equal('https://acme.org/doc1');
      return viewer.getViewerUrl().then(viewerUrl => {
        expect(viewerUrl).to.equal('https://acme.org/doc1');
        expect(viewer.getResolvedViewerUrl()).to.equal('https://acme.org/doc1');
        expect(errorStub.callCount).to.equal(0);
      });
    });
  });

  describe('viewerOrigin', () => {

    it('should return empty string if origin is not known', () => {
      const viewer = new Viewer(ampdoc);
      return viewer.getViewerOrigin().then(viewerOrigin => {
        expect(viewerOrigin).to.equal('');
      });
    });

    it('should return ancestor origin if known', () => {
      windowApi.parent = {};
      windowApi.location.ancestorOrigins = ['https://google.com'];
      const viewer = new Viewer(ampdoc);
      return viewer.getViewerOrigin().then(viewerOrigin => {
        expect(viewerOrigin).to.equal('https://google.com');
      });
    });

    it('should return viewer origin if set via handshake', () => {
      windowApi.parent = {};
      const viewer = new Viewer(ampdoc);
      const result = viewer.getViewerOrigin().then(viewerOrigin => {
        expect(viewerOrigin).to.equal('https://foobar.com');
      });
      viewer.setMessageDeliverer(() => {}, 'https://foobar.com');
      return result;
    });

    it('should return empty string if handshake does not happen', () => {
      windowApi.parent = {};
      const viewer = new Viewer(ampdoc);
      const result = viewer.getViewerOrigin().then(viewerOrigin => {
        expect(viewerOrigin).to.equal('');
      });
      clock.tick(1010);
      return result;
    });
  });

  describe('navigateTo', () => {
    const ampUrl = 'https://cdn.ampproject.org/test/123';
    it('should initiate a2a navigation', () => {
      windowApi.location.hash = '#cap=a2a';
      windowApi.top = {
        location: {},
      };
      const viewer = new Viewer(ampdoc);
      const send = sandbox.stub(viewer, 'sendMessage');
      viewer.navigateTo(ampUrl, 'abc123');
      expect(send.lastCall.args[0]).to.equal('a2a');
      expect(send.lastCall.args[1]).to.jsonEqual({
        url: ampUrl,
        requestedBy: 'abc123',
      });
      expect(windowApi.top.location.href).to.be.undefined;
    });

    it('should fail for non-amp url', () => {
      windowApi.location.hash = '#cap=a2a';
      const viewer = new Viewer(ampdoc);
      sandbox.stub(viewer, 'sendMessage');
      expect(() => {
        viewer.navigateTo('http://www.test.com', 'abc123');
      }).to.throw(/Invalid A2A URL/);
    });

    it('should perform fallback navigation', () => {
      windowApi.top = {
        location: {},
      };
      const viewer = new Viewer(ampdoc);
      const send = sandbox.stub(viewer, 'sendMessage');
      viewer.navigateTo(ampUrl, 'abc123');
      expect(send.callCount).to.equal(0);
      expect(windowApi.top.location.href).to.equal(ampUrl);
    });
  });
});
