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
import {platform} from '../../src/platform';


describe('Viewer', () => {

  let sandbox;
  let windowMock;
  let viewer;
  let windowApi;
  let timeouts;

  beforeEach(() => {
    sandbox = sinon.sandbox.create();
    timeouts = [];
    const WindowApi = function() {};
    WindowApi.prototype.setTimeout = function(handler) {
      timeouts.push(handler);
    };
    windowApi = new WindowApi();
    windowApi.location = {
      hash: '',
      href: '/test/viewer',
      ancestorOrigins: null,
    };
    windowApi.document = {
      referrer: '',
      body: {style: {}},
      documentElement: {style: {}},
    };
    windowMock = sandbox.mock(windowApi);
    viewer = new Viewer(windowApi);
  });

  afterEach(() => {
    viewer = null;
    windowMock.verify();
    windowMock = null;
    sandbox.restore();
    sandbox = null;
  });

  it('should configure as natural viewport by default', () => {
    expect(viewer.getViewportType()).to.equal('natural');
    expect(viewer.getViewportWidth()).to.equal(0);
    expect(viewer.getViewportHeight()).to.equal(0);
    expect(viewer.getScrollTop()).to.equal(0);
    expect(viewer.getPaddingTop()).to.equal(0);
  });

  it('should configure correctly based on window name and hash', () => {
    windowApi.name = '__AMP__viewportType=virtual&width=222&height=333' +
        '&scrollTop=15';
    windowApi.location.hash = '#width=111&paddingTop=17&other=something';
    const viewer = new Viewer(windowApi);
    expect(viewer.getViewportType()).to.equal('virtual');
    expect(viewer.getViewportWidth()).to.equal(111);
    expect(viewer.getViewportHeight()).to.equal(333);
    expect(viewer.getScrollTop()).to.equal(15);
    expect(viewer.getPaddingTop()).to.equal(17);

    // All of the startup params are also available via getParam.
    expect(viewer.getParam('paddingTop')).to.equal('17');
    expect(viewer.getParam('width')).to.equal('111');
    expect(viewer.getParam('other')).to.equal('something');
  });

  it('should configure visibilityState visible by default', () => {
    expect(viewer.getVisibilityState()).to.equal('visible');
    expect(viewer.isVisible()).to.equal(true);
    expect(viewer.getPrerenderSize()).to.equal(1);
  });

  it('should configure visibilityState and prerender', () => {
    windowApi.location.hash = '#visibilityState=hidden&prerenderSize=3';
    const viewer = new Viewer(windowApi);
    expect(viewer.getVisibilityState()).to.equal('hidden');
    expect(viewer.isVisible()).to.equal(false);
    expect(viewer.getPrerenderSize()).to.equal(3);
  });

  it('should configure correctly for iOS embedding', () => {
    windowApi.name = '__AMP__viewportType=natural';
    windowApi.parent = {};
    sandbox.mock(platform).expects('isIos').returns(true).once();
    const viewer = new Viewer(windowApi);

    expect(viewer.getViewportType()).to.equal('natural-ios-embed');
  });

  it('should NOT configure for iOS embedding if not embedded', () => {
    windowApi.name = '__AMP__viewportType=natural';
    windowApi.parent = windowApi;
    sandbox.mock(platform).expects('isIos').returns(true).once();
    expect(new Viewer(windowApi).getViewportType()).to.equal('natural');

    windowApi.parent = null;
    expect(new Viewer(windowApi).getViewportType()).to.equal('natural');
  });

  it('should receive viewport event', () => {
    let viewportEvent = null;
    viewer.onViewportEvent(event => {
      viewportEvent = event;
    });
    viewer.receiveMessage('viewport', {
      scrollTop: 11,
      scrollLeft: 12,
      width: 13,
      height: 14,
      paddingTop: 19
    });
    expect(viewportEvent).to.not.equal(null);
    expect(viewer.getScrollTop()).to.equal(11);
    expect(viewer.getViewportWidth()).to.equal(13);
    expect(viewer.getViewportHeight()).to.equal(14);
    expect(viewer.getPaddingTop()).to.equal(19);
  });

  it('should receive visibilitychange event', () => {
    let visEvent = null;
    viewer.onVisibilityChanged(event => {
      visEvent = event;
    });
    viewer.receiveMessage('visibilitychange', {
      state: 'other',
      prerenderSize: 4
    });
    expect(visEvent).to.not.equal(null);
    expect(viewer.getVisibilityState()).to.equal('other');
    expect(viewer.isVisible()).to.equal(false);
    expect(viewer.getPrerenderSize()).to.equal(4);
  });

  it('should post documentLoaded event', () => {
    viewer.postDocumentReady(11, 12);
    const m = viewer.messageQueue_[0];
    expect(m.eventType).to.equal('documentLoaded');
    expect(m.data.width).to.equal(11);
    expect(m.data.height).to.equal(12);
  });

  it('should post documentResized event', () => {
    viewer.postDocumentResized(13, 14);
    const m = viewer.messageQueue_[0];
    expect(m.eventType).to.equal('documentResized');
    expect(m.data.width).to.equal(13);
    expect(m.data.height).to.equal(14);
  });

  it('should post request/cancelFullOverlay event', () => {
    viewer.requestFullOverlay();
    viewer.cancelFullOverlay();
    expect(viewer.messageQueue_[0].eventType).to.equal('requestFullOverlay');
    expect(viewer.messageQueue_[1].eventType).to.equal('cancelFullOverlay');
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
    viewer.broadcast({type: 'type1'});
    const m = viewer.messageQueue_[0];
    expect(m.eventType).to.equal('broadcast');
    expect(m.data.type).to.equal('type1');
  });

  it('should queue non-dupe events', () => {
    viewer.postDocumentReady(11, 12);
    viewer.postDocumentResized(13, 14);
    viewer.postDocumentResized(15, 16);
    expect(viewer.messageQueue_.length).to.equal(2);
    expect(viewer.messageQueue_[0].eventType).to.equal('documentLoaded');
    const m = viewer.messageQueue_[1];
    expect(m.eventType).to.equal('documentResized');
    expect(m.data.width).to.equal(15);
    expect(m.data.height).to.equal(16);
  });

  it('should dequeue events when deliverer set', () => {
    viewer.postDocumentReady(11, 12);
    viewer.postDocumentResized(13, 14);
    expect(viewer.messageQueue_.length).to.equal(2);

    const delivered = [];
    viewer.setMessageDeliverer((eventType, data) => {
      delivered.push({eventType: eventType, data: data});
    }, 'https://acme.com');

    expect(viewer.messageQueue_.length).to.equal(0);
    expect(delivered.length).to.equal(2);
    expect(delivered[0].eventType).to.equal('documentLoaded');
    expect(delivered[0].data.width).to.equal(11);
    expect(delivered[1].eventType).to.equal('documentResized');
    expect(delivered[1].data.width).to.equal(13);
  });

  describe('isTrustedViewer', () => {

    function test(origin, toBeTrusted) {
      const viewer = new Viewer(windowApi);
      expect(viewer.isTrustedViewerOrigin_(origin)).to.equal(toBeTrusted);
    }

    it('should consider non-trusted when not iframed', () => {
      windowApi.parent = windowApi;
      windowApi.location.ancestorOrigins = ['https://google.com'];
      return new Viewer(windowApi).isTrustedViewer().then(res => {
        expect(res).to.be.false;
      });
    });

    it('should consider trusted by ancestor', () => {
      windowApi.parent = {};
      windowApi.location.ancestorOrigins = ['https://google.com'];
      return new Viewer(windowApi).isTrustedViewer().then(res => {
        expect(res).to.be.true;
      });
    });

    it('should consider non-trusted without ancestor', () => {
      windowApi.parent = {};
      windowApi.location.ancestorOrigins = [];
      return new Viewer(windowApi).isTrustedViewer().then(res => {
        expect(res).to.be.false;
      });
    });

    it('should consider non-trusted with wrong ancestor', () => {
      windowApi.parent = {};
      windowApi.location.ancestorOrigins = ['https://untrusted.com'];
      return new Viewer(windowApi).isTrustedViewer().then(res => {
        expect(res).to.be.false;
      });
    });

    it('should decide trusted on connection with origin', () => {
      windowApi.parent = {};
      windowApi.location.ancestorOrigins = null;
      const viewer = new Viewer(windowApi);
      viewer.setMessageDeliverer(() => {}, 'https://google.com');
      return viewer.isTrustedViewer().then(res => {
        expect(res).to.be.true;
      });
    });

    it('should decide non-trusted on connection without origin', () => {
      windowApi.parent = {};
      windowApi.location.ancestorOrigins = null;
      const viewer = new Viewer(windowApi);
      viewer.setMessageDeliverer(() => {});
      return viewer.isTrustedViewer().then(res => {
        expect(res).to.be.false;
      });
    });

    it('should decide non-trusted on connection with wrong origin', () => {
      windowApi.parent = {};
      windowApi.location.ancestorOrigins = null;
      const viewer = new Viewer(windowApi);
      viewer.setMessageDeliverer(() => {}, 'https://untrusted.com');
      return viewer.isTrustedViewer().then(res => {
        expect(res).to.be.false;
      });
    });

    it('should give precedence to ancestor', () => {
      windowApi.parent = {};
      windowApi.location.ancestorOrigins = ['https://google.com'];
      const viewer = new Viewer(windowApi);
      viewer.setMessageDeliverer(() => {}, 'https://untrusted.com');
      return viewer.isTrustedViewer().then(res => {
        expect(res).to.be.true;
      });
    });

    it('should trust domain variations', () => {
      test('https://google.com', true);
      test('https://www.google.com', true);
      test('https://news.google.com', true);
      test('https://www.google.co.uk', true);
      test('https://www.google.co.au', true);
      test('https://news.google.co.uk', true);
      test('https://news.google.co.au', true);
      test('https://google.de', true);
      test('https://www.google.de', true);
      test('https://news.google.de', true);
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
    });
  });

  describe('referrer', () => {

    it('should return document referrer if not overriden', () => {
      windowApi.parent = {};
      windowApi.location.hash = '#';
      windowApi.document.referrer = 'https://acme.org/docref';
      const viewer = new Viewer(windowApi);
      expect(viewer.getUnconfirmedReferrerUrl())
          .to.equal('https://acme.org/docref');
      return viewer.getReferrerUrl().then(referrerUrl => {
        expect(referrerUrl).to.equal('https://acme.org/docref');
        expect(timeouts).to.have.length(0);
      });
    });

    it('should NOT allow override if not iframed', () => {
      windowApi.parent = windowApi;
      windowApi.location.hash = '#referrer=' +
          encodeURIComponent('https://acme.org/viewer');
      windowApi.document.referrer = 'https://acme.org/docref';
      const viewer = new Viewer(windowApi);
      expect(viewer.getUnconfirmedReferrerUrl())
          .to.equal('https://acme.org/docref');
      return viewer.getReferrerUrl().then(referrerUrl => {
        expect(referrerUrl).to.equal('https://acme.org/docref');
        expect(timeouts).to.have.length(0);
      });
    });

    it('should NOT allow override if not trusted', () => {
      windowApi.parent = {};
      windowApi.location.hash = '#referrer=' +
          encodeURIComponent('https://acme.org/viewer');
      windowApi.document.referrer = 'https://acme.org/docref';
      windowApi.location.ancestorOrigins = ['https://untrusted.com'];
      const viewer = new Viewer(windowApi);
      expect(viewer.getUnconfirmedReferrerUrl())
          .to.equal('https://acme.org/docref');
      return viewer.getReferrerUrl().then(referrerUrl => {
        expect(referrerUrl).to.equal('https://acme.org/docref');
        expect(timeouts).to.have.length(0);
      });
    });

    it('should NOT allow override if ancestor is empty', () => {
      windowApi.parent = {};
      windowApi.location.hash = '#referrer=' +
          encodeURIComponent('https://acme.org/viewer');
      windowApi.document.referrer = 'https://acme.org/docref';
      windowApi.location.ancestorOrigins = [];
      const viewer = new Viewer(windowApi);
      expect(viewer.getUnconfirmedReferrerUrl())
          .to.equal('https://acme.org/docref');
      return viewer.getReferrerUrl().then(referrerUrl => {
        expect(referrerUrl).to.equal('https://acme.org/docref');
        expect(timeouts).to.have.length(0);
      });
    });

    it('should allow partial override if async not trusted', () => {
      windowApi.parent = {};
      windowApi.location.hash = '#referrer=' +
          encodeURIComponent('https://acme.org/viewer');
      windowApi.document.referrer = 'https://acme.org/docref';
      const viewer = new Viewer(windowApi);
      // Unconfirmed referrer is overriden, but not confirmed yet.
      expect(viewer.getUnconfirmedReferrerUrl())
          .to.equal('https://acme.org/viewer');
      viewer.setMessageDeliverer(() => {}, 'https://untrusted.com');
      return viewer.getReferrerUrl().then(referrerUrl => {
        expect(referrerUrl).to.equal('https://acme.org/docref');
        // Unconfirmed referrer is reset. Async error is thrown.
        expect(viewer.getUnconfirmedReferrerUrl())
            .to.equal('https://acme.org/docref');
        expect(timeouts).to.have.length(1);
        expect(timeouts[0]).to.throw(/Untrusted viewer referrer override/);
      });
    });

    it('should allow full override if async trusted', () => {
      windowApi.parent = {};
      windowApi.location.hash = '#referrer=' +
          encodeURIComponent('https://acme.org/viewer');
      windowApi.document.referrer = 'https://acme.org/docref';
      const viewer = new Viewer(windowApi);
      // Unconfirmed referrer is overriden and will be confirmed next.
      expect(viewer.getUnconfirmedReferrerUrl())
          .to.equal('https://acme.org/viewer');
      viewer.setMessageDeliverer(() => {}, 'https://google.com');
      return viewer.getReferrerUrl().then(referrerUrl => {
        expect(referrerUrl).to.equal('https://acme.org/viewer');
        // Unconfirmed is confirmed and kept.
        expect(viewer.getUnconfirmedReferrerUrl())
            .to.equal('https://acme.org/viewer');
        expect(timeouts).to.have.length(0);
      });
    });

    it('should allow override if iframed and trusted', () => {
      windowApi.parent = {};
      windowApi.location.hash = '#referrer=' +
          encodeURIComponent('https://acme.org/viewer');
      windowApi.document.referrer = 'https://acme.org/docref';
      windowApi.location.ancestorOrigins = ['https://google.com'];
      const viewer = new Viewer(windowApi);
      expect(viewer.getUnconfirmedReferrerUrl())
          .to.equal('https://acme.org/viewer');
      return viewer.getReferrerUrl().then(referrerUrl => {
        expect(referrerUrl).to.equal('https://acme.org/viewer');
        expect(timeouts).to.have.length(0);
      });
    });

    it('should allow override to empty if iframed and trusted', () => {
      windowApi.parent = {};
      windowApi.location.hash = '#referrer=';
      windowApi.document.referrer = 'https://acme.org/docref';
      windowApi.location.ancestorOrigins = ['https://google.com'];
      const viewer = new Viewer(windowApi);
      expect(viewer.getUnconfirmedReferrerUrl())
          .to.equal('');
      return viewer.getReferrerUrl().then(referrerUrl => {
        expect(referrerUrl).to.equal('');
        expect(timeouts).to.have.length(0);
      });
    });
  });
});
