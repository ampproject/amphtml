import {parseQueryString} from '#core/types/string/url';

import {Services} from '#service';
import {installDocService} from '#service/ampdoc-impl';
import {installDocumentInfoServiceForDoc} from '#service/document-info-impl';
import {installPlatformService} from '#service/platform-impl';
import {installTimerService} from '#service/timer-impl';
import {ViewerImpl} from '#service/viewer-impl';

import {dev} from '#utils/log';

import {FakePerformance} from '#testing/fake-dom';

import {parseUrlDeprecated, removeFragment} from '../../src/url';

describes.sandboxed('Viewer', {}, (env) => {
  let windowMock;
  let viewer;
  let windowApi;
  let ampdoc;
  let clock;
  let events;
  let errorStub;
  let expectedErrorStub;
  let params;

  /**
   * Change the current visibility state.
   * @param {string} vis The visibility state.
   */
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

  /** @param {string} href */
  function setUrl(href) {
    const url = parseUrlDeprecated(href);
    windowApi.location.href = url.href;
    windowApi.location.search = url.search;
    windowApi.location.hash = url.hash;
    if (url.hash) {
      Object.assign(params, parseQueryString(url.hash));
    }
  }

  beforeEach(() => {
    clock = env.sandbox.useFakeTimers();
    events = {};
    const WindowApi = function () {};
    windowApi = new WindowApi();
    windowApi.Math = window.Math;
    windowApi.crypto = window.crypto;
    windowApi.setTimeout = window.setTimeout;
    windowApi.clearTimeout = window.clearTimeout;
    windowApi.Promise = window.Promise;
    windowApi.location = {
      hash: '#origin=g.com',
      href: '/test/viewer',
      ancestorOrigins: null,
      search: '',
    };
    windowApi.performance = new FakePerformance(window);
    windowApi.addEventListener = (type, listener) => {
      events[type] = listener;
    };
    windowApi.removeEventListener = (type, listener) => {
      expect(events[type]).to.equal(listener);
      delete events[type];
    };
    windowApi.document = {
      nodeType: /* DOCUMENT */ 9,
      defaultView: windowApi,
      hidden: false,
      visibilityState: 'visible',
      addEventListener(type, listener) {
        events[type] = listener;
      },
      referrer: '',
      body: {style: {}},
      documentElement: {style: {}},
      title: 'Awesome doc',
      getRootNode() {
        return windowApi.document;
      },
      querySelector() {
        return parseUrlDeprecated('http://www.example.com/');
      },
      head: {
        nodeType: /* ELEMENT */ 1,
        querySelector() {
          return null;
        },
        querySelectorAll() {
          return [];
        },
      },
    };
    windowApi.navigator = window.navigator;
    windowApi.history = {
      replaceState: () => {},
    };
    env.sandbox
      .stub(windowApi.history, 'replaceState')
      .callsFake((state, title, url) => {
        windowApi.location.href = url;
      });
    installDocService(windowApi, /* isSingleDoc */ true);
    ampdoc = Services.ampdocServiceFor(windowApi).getSingleDoc();

    params = {'origin': 'g.com'};
    env.sandbox
      .stub(ampdoc, 'getParam')
      .callsFake((name) => (name in params ? params[name] : null));

    installPlatformService(windowApi);
    installTimerService(windowApi);
    installDocumentInfoServiceForDoc(windowApi.document);
    errorStub = env.sandbox.stub(dev(), 'error');
    expectedErrorStub = env.sandbox.stub(dev(), 'expectedError');
    windowMock = env.sandbox.mock(windowApi);
    viewer = new ViewerImpl(ampdoc);
  });

  afterEach(() => {
    windowMock.verify();
  });

  it('should configure correctly based on ampdoc', () => {
    params['paddingTop'] = '17';
    params['other'] = 'something';
    const viewer = new ViewerImpl(ampdoc);
    expect(viewer.getParam('paddingTop')).to.equal('17');
    expect(viewer.getParam('other')).to.equal('something');
  });

  it('should expose viewer capabilities', () => {
    params['cap'] = 'foo,bar';
    const viewer = new ViewerImpl(ampdoc);
    expect(viewer.hasCapability('foo')).to.be.true;
    expect(viewer.hasCapability('bar')).to.be.true;
    expect(viewer.hasCapability('other')).to.be.false;
  });

  it('should not clear fragment in non-embedded mode', () => {
    windowApi.parent = windowApi;
    setUrl('http://www.example.com#test=1');
    const viewer = new ViewerImpl(ampdoc);
    expect(windowApi.history.replaceState).to.have.not.been.called;
    expect(viewer.getParam('test')).to.equal('1');
    expect(viewer.hasCapability('foo')).to.be.false;
  });

  it('should not clear fragment in embedded mode', () => {
    windowApi.parent = {};
    setUrl('http://www.example.com#origin=g.com&test=1');
    const viewer = new ViewerImpl(ampdoc);
    expect(windowApi.history.replaceState).to.not.be.called;
    expect(viewer.getParam('test')).to.equal('1');
  });

  it('should set ampshare fragment within custom tab', function* () {
    windowApi.parent = windowApi;
    setUrl('http://www.example.com/?amp_gsa=1&amp_js_v=a0');
    // windowApi.location.href = 'http://www.example.com/';
    // windowApi.location.search = '?amp_gsa=1&amp_js_v=a0';
    // windowApi.location.hash = '';
    const viewer = new ViewerImpl(ampdoc);
    expect(viewer.isCctEmbedded()).to.be.true;
    yield ampdoc.whenFirstVisible();
    expect(windowApi.history.replaceState).to.be.calledWith(
      {},
      '',
      '#ampshare=http%3A%2F%2Fwww.example.com%2F'
    );
  });

  it('should merge fragments within custom tab', function* () {
    windowApi.parent = windowApi;
    setUrl('http://www.example.com/?amp_gsa=1&amp_js_v=a0#test=1');
    const viewer = new ViewerImpl(ampdoc);
    expect(viewer.getParam('test')).to.equal('1');
    expect(viewer.isCctEmbedded()).to.be.true;
    yield ampdoc.whenFirstVisible();
    expect(windowApi.history.replaceState).to.be.calledWith(
      {},
      '',
      '#test=1&ampshare=http%3A%2F%2Fwww.example.com%2F'
    );
  });

  it('should not duplicate ampshare when merging', function* () {
    windowApi.parent = windowApi;
    setUrl(
      'http://www.example.com/' +
        '?amp_gsa=1&amp_js_v=a0' +
        '#test=1&ampshare=old'
    );
    const viewer = new ViewerImpl(ampdoc);
    expect(viewer.getParam('test')).to.equal('1');
    expect(viewer.isCctEmbedded()).to.be.true;
    yield ampdoc.whenFirstVisible();
    expect(windowApi.history.replaceState).to.be.calledWith(
      {},
      '',
      '#test=1&ampshare=http%3A%2F%2Fwww.example.com%2F'
    );
  });

  it('should remove multiple ampshares when merging', function* () {
    windowApi.parent = windowApi;
    setUrl(
      'http://www.example.com/?amp_gsa=1&amp_js_v=a0' +
        '#test=1&ampshare=a&ampshare=b&ampshare=c'
    );
    const viewer = new ViewerImpl(ampdoc);
    expect(viewer.getParam('test')).to.equal('1');
    expect(viewer.isCctEmbedded()).to.be.true;
    yield ampdoc.whenFirstVisible();
    expect(windowApi.history.replaceState).to.be.calledWith(
      {},
      '',
      '#test=1&ampshare=http%3A%2F%2Fwww.example.com%2F'
    );
  });

  it("should remove extra ampshare even when it's first", function* () {
    windowApi.parent = windowApi;
    setUrl(
      'http://www.example.com/' +
        '?amp_gsa=1&amp_js_v=a0' +
        '#ampshare=old&test=1'
    );
    // windowApi.location.href = 'http://www.example.com/#ampshare=old&test=1';
    // windowApi.location.hash = '#ampshare=old&test=1';
    // windowApi.location.search = '?amp_gsa=1&amp_js_v=a0';
    // params['test'] = '1';
    // params['ampshare'] = 'old';
    const viewer = new ViewerImpl(ampdoc);
    expect(viewer.getParam('test')).to.equal('1');
    expect(viewer.isCctEmbedded()).to.be.true;
    yield ampdoc.whenFirstVisible();
    expect(windowApi.history.replaceState).to.be.calledWith(
      {},
      '',
      '#ampshare=http%3A%2F%2Fwww.example.com%2F&test=1'
    );
  });

  it("should remove extra ampshare even when it's sandwiched", function* () {
    windowApi.parent = windowApi;
    setUrl(
      'http://www.example.com/' +
        '?amp_gsa=1&amp_js_v=a0' +
        '#note=ok&ampshare=old&test=1'
    );
    const viewer = new ViewerImpl(ampdoc);
    expect(viewer.getParam('test')).to.equal('1');
    expect(viewer.getParam('note')).to.equal('ok');
    expect(viewer.isCctEmbedded()).to.be.true;
    yield ampdoc.whenFirstVisible();
    expect(windowApi.history.replaceState).to.be.calledWith(
      {},
      '',
      '#note=ok&ampshare=http%3A%2F%2Fwww.example.com%2F&test=1'
    );
  });

  it('should clear fragment when click param is present', () => {
    windowApi.parent = windowApi;
    setUrl('http://www.example.com/#click=abc');
    const viewer = new ViewerImpl(ampdoc);
    expect(windowApi.history.replaceState).to.be.calledOnce;
    const replace = windowApi.history.replaceState.lastCall;
    expect(replace.args).to.jsonEqual([{}, '', 'http://www.example.com/']);
    expect(viewer.getParam('click')).to.equal('abc');
  });

  it('should restore fragment within custom tab with click param', function* () {
    windowApi.parent = windowApi;
    setUrl('http://www.example.com/?amp_gsa=1&amp_js_v=a0#click=abc');
    const viewer = new ViewerImpl(ampdoc);
    expect(windowApi.history.replaceState).to.be.calledWith(
      {},
      '',
      'http://www.example.com/?amp_gsa=1&amp_js_v=a0'
    );
    expect(viewer.getParam('click')).to.equal('abc');
    yield ampdoc.whenFirstVisible();
    expect(windowApi.history.replaceState).to.be.calledWith(
      {},
      '',
      '#ampshare=http%3A%2F%2Fwww.example.com%2F'
    );
  });

  it('should return promise that resolve on visible', function* () {
    const viewer = new ViewerImpl(ampdoc);
    expect(ampdoc.isVisible()).to.be.true;
    let promise = ampdoc.whenNextVisible();
    yield promise;
    viewer.receiveMessage('visibilitychange', {
      state: 'hidden',
    });
    promise = ampdoc.whenNextVisible();
    expect(ampdoc.isVisible()).to.be.false;
    viewer.receiveMessage('visibilitychange', {
      state: 'visible',
    });
    return promise;
  });

  // TODO(#37245): Fix failing test
  it.skip('should initialize firstVisibleTime when doc becomes visible', () => {
    const viewer = new ViewerImpl(ampdoc);
    expect(ampdoc.isVisible()).to.be.true;
    // We don't live during the unix epoch, so time is always positive.
    expect(ampdoc.getFirstVisibleTime()).to.equal(1);
    expect(ampdoc.getLastVisibleTime()).to.equal(1);

    // Becomes invisible.
    clock.tick(1);
    viewer.receiveMessage('visibilitychange', {
      state: 'hidden',
    });
    expect(ampdoc.isVisible()).to.be.false;
    expect(ampdoc.getFirstVisibleTime()).to.equal(1);
    expect(ampdoc.getLastVisibleTime()).to.equal(1);

    // Back to visible.
    clock.tick(1);
    viewer.receiveMessage('visibilitychange', {
      state: 'visible',
    });
    expect(ampdoc.isVisible()).to.be.true;
    expect(ampdoc.getFirstVisibleTime()).to.equal(1);
    expect(ampdoc.getLastVisibleTime()).to.equal(2);

    // Back to invisible again.
    clock.tick(1);
    viewer.receiveMessage('visibilitychange', {
      state: 'hidden',
    });
    expect(ampdoc.isVisible()).to.be.false;
    expect(ampdoc.getFirstVisibleTime()).to.equal(1);
    expect(ampdoc.getLastVisibleTime()).to.equal(2);
  });

  it('should receive viewport event', () => {
    let viewportEvent = null;
    viewer.onMessage('viewport', (event) => {
      viewportEvent = event;
    });
    viewer.receiveMessage('viewport', {
      paddingTop: 19,
    });
    expect(viewportEvent).to.not.equal(null);
  });

  describe('replaceUrl', () => {
    it('should replace URL for the same non-proxy origin', () => {
      const fragment = '#replaceUrl=http://www.example.com/two%3Fa%3D1&b=1';
      setUrl('http://www.example.com/one' + fragment);
      const viewer = new ViewerImpl(ampdoc);
      viewer.replaceUrl(viewer.getParam('replaceUrl'));
      expect(windowApi.history.replaceState).to.be.calledOnce;
      expect(windowApi.history.replaceState).to.be.calledWith(
        {},
        '',
        'http://www.example.com/two?a=1' + fragment
      );
      expect(ampdoc.getUrl()).to.equal(
        'http://www.example.com/two?a=1' + fragment
      );
      expect(windowApi.location.originalHref).to.equal(
        'http://www.example.com/one' + fragment
      );
    });

    it('should ignore replacement fragment', () => {
      const fragment = '#replaceUrl=http://www.example.com/two%23b=2&b=1';
      setUrl('http://www.example.com/one' + fragment);
      const viewer = new ViewerImpl(ampdoc);
      viewer.replaceUrl(viewer.getParam('replaceUrl'));
      expect(windowApi.history.replaceState).to.be.calledOnce;
      expect(windowApi.history.replaceState).to.be.calledWith(
        {},
        '',
        'http://www.example.com/two' + fragment
      );
      expect(windowApi.location.originalHref).to.equal(
        'http://www.example.com/one' + fragment
      );
    });

    it('should replace relative URL for the same non-proxy origin', () => {
      const fragment = '#replaceUrl=/two&b=1';
      setUrl(removeFragment(window.location.href) + fragment);
      const viewer = new ViewerImpl(ampdoc);
      viewer.replaceUrl(viewer.getParam('replaceUrl'));
      expect(windowApi.history.replaceState).to.be.calledOnce;
      expect(windowApi.history.replaceState).to.be.calledWith(
        {},
        '',
        window.location.origin + '/two' + fragment
      );
      expect(windowApi.location.originalHref).to.equal(
        removeFragment(window.location.href) + fragment
      );
    });

    it('should fail to replace URL for a wrong non-proxy origin', () => {
      const fragment = '#replaceUrl=http://other.example.com/two&b=1';
      setUrl('http://www.example.com/one' + fragment);
      const viewer = new ViewerImpl(ampdoc);
      viewer.replaceUrl(viewer.getParam('replaceUrl'));
      expect(windowApi.history.replaceState).to.not.be.called;
      expect(windowApi.location.originalHref).to.be.undefined;
    });

    it('should tolerate errors when trying to replace URL', () => {
      const fragment = '#replaceUrl=http://www.example.com/two&b=1';
      setUrl('http://www.example.com/one' + fragment);
      windowApi.history.replaceState.restore();
      env.sandbox.stub(windowApi.history, 'replaceState').callsFake(() => {
        throw new Error('intentional');
      });
      const viewer = new ViewerImpl(ampdoc);
      expect(() => {
        viewer.replaceUrl(viewer.getParam('replaceUrl'));
      }).to.not.throw();
      expect(windowApi.location.originalHref).to.be.undefined;
    });

    it('should replace URL for the same source origin on proxy', () => {
      const fragment =
        '#replaceUrl=https://cdn.ampproject.org/c/www.example.com/two&b=1';
      setUrl('https://cdn.ampproject.org/c/www.example.com/one' + fragment);
      const viewer = new ViewerImpl(ampdoc);
      viewer.replaceUrl(viewer.getParam('replaceUrl'));
      expect(windowApi.history.replaceState).to.be.calledOnce;
      expect(windowApi.history.replaceState).to.be.calledWith(
        {},
        '',
        'https://cdn.ampproject.org/c/www.example.com/two' + fragment
      );
      expect(windowApi.location.originalHref).to.equal(
        'https://cdn.ampproject.org/c/www.example.com/one' + fragment
      );
    });

    it('should fail replace URL for wrong source origin on proxy', () => {
      const fragment =
        '#replaceUrl=https://cdn.ampproject.org/c/other.example.com/two&b=1';
      setUrl('https://cdn.ampproject.org/c/www.example.com/one' + fragment);
      const viewer = new ViewerImpl(ampdoc);
      viewer.replaceUrl(viewer.getParam('replaceUrl'));
      expect(windowApi.history.replaceState).to.not.be.called;
      expect(windowApi.location.originalHref).to.be.undefined;
    });

    it('should NOT replace URL in shadow doc', () => {
      const fragment = '#replaceUrl=http://www.example.com/two&b=1';
      setUrl('http://www.example.com/one' + fragment);
      env.sandbox.stub(ampdoc, 'isSingleDoc').callsFake(() => false);
      const viewer = new ViewerImpl(ampdoc);
      viewer.replaceUrl(viewer.getParam('replaceUrl'));
      expect(windowApi.history.replaceState).to.not.be.called;
    });
  });

  describe('should receive the visibilitychange event', () => {
    it('should change visibilityState', () => {
      viewer.receiveMessage('visibilitychange', {
        state: 'paused',
      });
      expect(ampdoc.getVisibilityState()).to.equal('paused');
    });

    it('should receive "paused" visibilityState', () => {
      viewer.receiveMessage('visibilitychange', {
        state: 'paused',
      });
      expect(ampdoc.getVisibilityState()).to.equal('paused');
    });

    it('should receive "inactive" visibilityState', () => {
      viewer.receiveMessage('visibilitychange', {
        state: 'inactive',
      });
      expect(ampdoc.getVisibilityState()).to.equal('inactive');
    });

    it('should parse "hidden" as "prerender" before first visible', () => {
      env.sandbox.stub(ampdoc, 'getLastVisibleTime').callsFake(() => null);
      viewer.receiveMessage('visibilitychange', {
        state: 'hidden',
      });
      expect(ampdoc.getVisibilityState()).to.equal('prerender');
    });

    it('should parse "hidden" as "inactive" after first visible', () => {
      env.sandbox.stub(ampdoc, 'getLastVisibleTime').callsFake(() => 1);
      viewer.receiveMessage('visibilitychange', {
        state: 'hidden',
      });
      expect(ampdoc.getVisibilityState()).to.equal('inactive');
    });

    it('should reject unknown values', () => {
      viewer.receiveMessage('visibilitychange', {
        state: 'paused',
      });
      allowConsoleError(() => {
        expect(() => {
          viewer.receiveMessage('visibilitychange', {
            state: 'what is this',
          });
        }).to.throw('Assertion failed');
      });
      expect(ampdoc.getVisibilityState()).to.equal('paused');
    });

    it('should be inactive when the viewer tells us we are inactive', () => {
      viewer.receiveMessage('visibilitychange', {
        state: 'inactive',
      });
      expect(ampdoc.getVisibilityState()).to.equal('inactive');
      changeVisibility('hidden');
      expect(ampdoc.getVisibilityState()).to.equal('inactive');
    });

    it('should be prerender when the viewer tells us we are prerender', () => {
      viewer.receiveMessage('visibilitychange', {
        state: 'prerender',
      });
      expect(ampdoc.getVisibilityState()).to.equal('prerender');
      changeVisibility('visible');
      expect(ampdoc.getVisibilityState()).to.equal('prerender');
    });

    it('should be hidden when the browser document is hidden', () => {
      changeVisibility('hidden');
      viewer.receiveMessage('visibilitychange', {
        state: 'visible',
      });
      expect(ampdoc.getVisibilityState()).to.equal('hidden');
      viewer.receiveMessage('visibilitychange', {
        state: 'paused',
      });
      expect(ampdoc.getVisibilityState()).to.equal('hidden');
      viewer.receiveMessage('visibilitychange', {
        state: 'visible',
      });
      expect(ampdoc.getVisibilityState()).to.equal('hidden');
    });

    it(
      'should be paused when the browser document is visible but viewer is' +
        'paused',
      () => {
        changeVisibility('visible');
        viewer.receiveMessage('visibilitychange', {
          state: 'paused',
        });
        expect(ampdoc.getVisibilityState()).to.equal('paused');
      }
    );

    it('should be visible when the browser document is visible', () => {
      changeVisibility('visible');
      viewer.receiveMessage('visibilitychange', {
        state: 'visible',
      });
      expect(ampdoc.getVisibilityState()).to.equal('visible');
    });

    it('should change visibility on visibilitychange event', () => {
      changeVisibility('hidden');
      expect(ampdoc.getVisibilityState()).to.equal('hidden');
      changeVisibility('visible');
      expect(ampdoc.getVisibilityState()).to.equal('visible');

      clock.tick(1);
      viewer.receiveMessage('visibilitychange', {
        state: 'hidden',
      });
      changeVisibility('hidden');
      expect(ampdoc.getVisibilityState()).to.equal('inactive');
      changeVisibility('visible');
      expect(ampdoc.getVisibilityState()).to.equal('inactive');

      viewer.receiveMessage('visibilitychange', {
        state: 'inactive',
      });
      changeVisibility('hidden');
      expect(ampdoc.getVisibilityState()).to.equal('inactive');
      changeVisibility('visible');
      expect(ampdoc.getVisibilityState()).to.equal('inactive');

      viewer.receiveMessage('visibilitychange', {
        state: 'paused',
      });
      changeVisibility('hidden');
      expect(ampdoc.getVisibilityState()).to.equal('hidden');
      changeVisibility('visible');
      expect(ampdoc.getVisibilityState()).to.equal('paused');

      viewer.receiveMessage('visibilitychange', {
        state: 'visible',
      });
      changeVisibility('hidden');
      expect(ampdoc.getVisibilityState()).to.equal('hidden');
      changeVisibility('visible');
      expect(ampdoc.getVisibilityState()).to.equal('visible');
    });
  });

  describe('User action makes doc visible', () => {
    const eventTest = (eventName) => {
      ampdoc.overrideVisibilityState('prerender');
      viewer = new ViewerImpl(ampdoc);
      expect(ampdoc.getVisibilityState()).to.equal('prerender');

      expect(events.touchstart).to.not.be.undefined;
      expect(events.keydown).to.not.be.undefined;
      expect(events.mousedown).to.not.be.undefined;

      events[eventName]();
      expect(ampdoc.getVisibilityState()).to.equal('visible');
      expect(events.touchstart).to.be.undefined;
      expect(events.keydown).to.be.undefined;
      expect(events.mousedown).to.be.undefined;
    };

    it(
      'should become visible on touchstart',
      eventTest.bind(null, 'touchstart')
    );

    it('should become visible on mousedown', eventTest.bind(null, 'mousedown'));

    it('should become visible on keydown', eventTest.bind(null, 'keydown'));

    it('should not become visible when not a single doc', () => {
      env.sandbox.stub(ampdoc, 'isSingleDoc').callsFake(() => false);
      ampdoc.overrideVisibilityState('prerender');

      viewer = new ViewerImpl(ampdoc);

      expect(ampdoc.getVisibilityState()).to.equal('prerender');
      expect(events.touchstart).to.be.undefined;
      expect(events.keydown).to.be.undefined;
      expect(events.mousedown).to.be.undefined;
    });
  });

  describe('Messaging not embedded', () => {
    it('should not expect messaging', () => {
      expect(viewer.messagingReadyPromise_).to.be.null;
    });

    it('should fail sendMessageAwaitResponse', () => {
      return viewer.sendMessageAwaitResponse('event', {}).then(
        () => {
          throw new Error('should not succeed');
        },
        (error) => {
          expect(error.message).to.match(/No messaging channel/);
        }
      );
    });

    it('should do nothing in sendMessage but not fail', () => {
      viewer.sendMessage('event', {});
      expect(viewer.messageQueue_.length).to.equal(0);
    });

    it('should post broadcast event but not fail', () => {
      viewer.broadcast({type: 'type1'});
      expect(viewer.messageQueue_.length).to.equal(0);
    });
  });

  describe('Messaging embedded', () => {
    beforeEach(() => {
      windowApi.parent = {};
      viewer = new ViewerImpl(ampdoc);
    });

    it('should receive broadcast event', () => {
      let broadcastMessage = null;
      viewer.onBroadcast((message) => {
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
        return Promise.resolve();
      }, 'https://www.example.com');
      viewer.broadcast({type: 'type1'});
      expect(viewer.messageQueue_.length).to.equal(0);
      return viewer.messagingReadyPromise_.then(() => {
        expect(delivered.length).to.equal(1);
        const m = delivered[0];
        expect(m.eventType).to.equal('broadcast');
        expect(m.data.type).to.equal('type1');
      });
    });

    it('should post broadcast event but not fail w/o messaging', () => {
      expectAsyncConsoleError(/No messaging channel/);
      const result = viewer.broadcast({type: 'type1'});
      expect(viewer.messageQueue_.length).to.equal(0);
      clock.tick(20001);
      return expect(result).eventually.to.be.false;
    });

    it('sendMessageAwaitResponse should wait for messaging channel', () => {
      let mResolved = false;
      const m = viewer.sendMessageAwaitResponse('event', {}).then(() => {
        mResolved = true;
      });
      return Promise.resolve()
        .then(() => {
          // Not resolved yet.
          expect(mResolved).to.be.false;

          // Set message deliverer.
          viewer.setMessageDeliverer(() => {
            return Promise.resolve();
          }, 'https://www.example.com');
          expect(mResolved).to.be.false;

          return m;
        })
        .then(() => {
          // All resolved now.
          expect(mResolved).to.be.true;
        });
    });

    it('should timeout messaging channel', () => {
      expectAsyncConsoleError(/No messaging channel/);
      let mResolved = false;
      const m = viewer.sendMessageAwaitResponse('event', {}).then(() => {
        mResolved = true;
      });
      return Promise.resolve()
        .then(() => {
          // Not resolved yet.
          expect(mResolved).to.be.false;

          // Timeout.
          clock.tick(20001);
          return m;
        })
        .then(
          () => {
            throw new Error('must never be here');
          },
          () => {
            // Not resolved ever.
            expect(mResolved).to.be.false;
          }
        );
    });

    describe('sendMessage', () => {
      it('should send event when deliverer is set', () => {
        const delivered = [];
        viewer.setMessageDeliverer((eventType, data) => {
          delivered.push({eventType, data});
          return Promise.resolve();
        }, 'https://www.example.com');
        viewer.sendMessage('event', {value: 1});
        expect(viewer.messageQueue_.length).to.equal(0);
        expect(delivered.length).to.equal(1);
        expect(delivered[0].eventType).to.equal('event');
      });
    });

    describe('sendMessage with cancelUnsent', () => {
      it('should queue non-dupe events', () => {
        viewer.sendMessage('event-a', {value: 1}, /* cancelUnsent*/ true);
        viewer.sendMessage('event-b', {value: 2}, /* cancelUnsent*/ true);
        expect(viewer.messageQueue_.length).to.equal(2);
        expect(viewer.messageQueue_[0].eventType).to.equal('event-a');
        expect(viewer.messageQueue_[0].data.value).to.equal(1);
        expect(viewer.messageQueue_[1].eventType).to.equal('event-b');
        expect(viewer.messageQueue_[1].data.value).to.equal(2);
      });

      it('should queue dupe events', () => {
        viewer.sendMessage('event', {value: 1}, /* cancelUnsent*/ true);
        viewer.sendMessage('event', {value: 2}, /* cancelUnsent*/ true);
        expect(viewer.messageQueue_.length).to.equal(1);
        expect(viewer.messageQueue_[0].eventType).to.equal('event');
        expect(viewer.messageQueue_[0].data.value).to.equal(2);
      });

      it('should dequeue events when deliverer is set', () => {
        viewer.sendMessage('event-a', {value: 1}, /* cancelUnsent*/ true);
        viewer.sendMessage('event-b', {value: 2}, /* cancelUnsent*/ true);
        expect(viewer.messageQueue_.length).to.equal(2);

        const delivered = [];
        viewer.setMessageDeliverer((eventType, data) => {
          delivered.push({eventType, data});
          return Promise.resolve();
        }, 'https://www.example.com');

        expect(viewer.messageQueue_.length).to.equal(0);
        expect(delivered.length).to.equal(2);
        expect(delivered[0].eventType).to.equal('event-a');
        expect(delivered[1].eventType).to.equal('event-b');
      });

      it('should return undefined', () => {
        const response = viewer.sendMessage(
          'event',
          {value: 1},
          /* cancelUnsent */ true
        );
        expect(response).to.be.undefined;
      });
    });

    describe('sendMessageAwaitResponse', () => {
      it('should send event when deliverer is set', () => {
        const delivered = [];
        viewer.setMessageDeliverer((eventType, data) => {
          delivered.push({eventType, data});
          return Promise.resolve();
        }, 'https://www.example.com');
        viewer.sendMessageAwaitResponse('event', {value: 'foo'}).then(() => {
          expect(viewer.messageQueue_.length).to.equal(0);
          expect(delivered.length).to.equal(1);
          expect(delivered[0].eventType).to.equal('event');
        });
      });
    });

    describe('sendMessageAwaitResponse with cancelUnsent', () => {
      it('should send queued messages', () => {
        viewer.sendMessageAwaitResponse(
          'event-a',
          {value: 1},
          /* cancelUnsent */ true
        );
        viewer.sendMessageAwaitResponse(
          'event-b',
          {value: 2},
          /* cancelUnsent */ true
        );
        viewer.sendMessageAwaitResponse(
          'event-a',
          {value: 3},
          /* cancelUnsent */ true
        );

        const delivererSpy = env.sandbox.stub();
        delivererSpy.returns(Promise.resolve());

        viewer.setMessageDeliverer(delivererSpy, 'https://www.example.com');
        env.sandbox.assert.callOrder(
          delivererSpy.withArgs('event-b', {value: 2}, true),
          delivererSpy.withArgs('event-a', {value: 3}, true)
        );
        expect(delivererSpy).to.not.be.calledWith('event-a', {value: 1}, true);

        viewer.sendMessageAwaitResponse(
          'event-a',
          {value: 4},
          /* cancelUnsent */ true
        );
        expect(delivererSpy).to.be.calledWith('event-a', {value: 4}, true);
      });

      it('should return promise that resolves on response', () => {
        const response1 = viewer.sendMessageAwaitResponse(
          'event-a',
          {value: 1},
          /* cancelUnsent */ true
        );
        const response2 = viewer.sendMessageAwaitResponse(
          'event-a',
          {value: 2},
          /* cancelUnsent */ true
        );

        const delivererSpy = env.sandbox.stub();
        delivererSpy
          .withArgs('event-a', {value: 2}, true)
          .returns(Promise.resolve('result-2'));
        delivererSpy
          .withArgs('event-a', {value: 3}, true)
          .returns(Promise.resolve('result-3'));
        viewer.setMessageDeliverer(delivererSpy, 'https://www.example.com');

        const response3 = viewer.sendMessageAwaitResponse(
          'event-a',
          {value: 3},
          /* cancelUnsent */ true
        );
        return expect(
          Promise.all([response1, response2, response3])
        ).to.eventually.deep.equal(['result-2', 'result-2', 'result-3']);
      });
    });
  });

  describe('isEmbedded', () => {
    it('should NOT be embedded when not iframed', () => {
      windowApi.parent = windowApi;
      params = {'origin': 'g.com'};
      expect(new ViewerImpl(ampdoc).isEmbedded()).to.be.false;
    });

    it('should be embedded when iframed w/ "origin" in URL hash', () => {
      windowApi.parent = {};
      params = {'origin': 'g.com'};
      expect(new ViewerImpl(ampdoc).isEmbedded()).to.be.true;
    });

    it('should be embedded when iframed w/ "visibilityState"', () => {
      windowApi.parent = {};
      params = {'visibilityState': 'hidden'};
      expect(new ViewerImpl(ampdoc).isEmbedded()).to.be.true;
    });

    it('should NOT be embedded when iframed w/o "origin" param', () => {
      windowApi.parent = {};
      params = {};
      expect(new ViewerImpl(ampdoc).isEmbedded()).to.be.false;
    });

    it('should be embedded with "webview=1" param', () => {
      windowApi.parent = windowApi;
      params = {'webview': '1'};
      expect(new ViewerImpl(ampdoc).isEmbedded()).to.be.true;
    });

    it('should be embedded with query param', () => {
      windowApi.parent = {};
      windowApi.location.search = '?amp_js_v=1';
      expect(new ViewerImpl(ampdoc).isEmbedded()).to.be.true;
    });

    it('should be embedded when isCctEmbedded', () => {
      windowApi.parent = {};
      windowApi.location.search = '?amp_gsa=1&amp_js_v=a0';
      expect(new ViewerImpl(ampdoc).isEmbedded()).to.be.true;
    });
  });

  describe('isWebviewEmbedded', () => {
    it('should be webview w/ "webview=1"', () => {
      windowApi.parent = windowApi;
      params = {'webview': '1'};
      expect(new ViewerImpl(ampdoc).isWebviewEmbedded()).to.be.true;
    });

    it('should NOT be webview w/o "webview=1"', () => {
      windowApi.parent = windowApi;
      params = {'foo': '1'};
      expect(new ViewerImpl(ampdoc).isWebviewEmbedded()).to.be.false;
    });

    it('should NOT be webview w/ "webview=0"', () => {
      windowApi.parent = windowApi;
      params = {'webview': '0'};
      expect(new ViewerImpl(ampdoc).isWebviewEmbedded()).to.be.false;
    });

    it('should NOT be webview if iframed regardless of "webview=1"', () => {
      windowApi.parent = {};
      params = {'webview': '1'};
      expect(new ViewerImpl(ampdoc).isEmbedded()).to.be.false;
    });
  });

  describe('isCctEmbedded', () => {
    it('should be CCT embedded with "amp_gsa=1" and "amp_js_v=a\\d*"', () => {
      windowApi.parent = windowApi;
      windowApi.location.search = '?amp_gsa=1&amp_js_v=a0';
      expect(new ViewerImpl(ampdoc).isCctEmbedded()).to.be.true;
    });

    it('should NOT be CCT embedded w/o "amp_gsa=1"', () => {
      windowApi.parent = windowApi;
      windowApi.location.search = '?amp_js_v=a0';
      expect(new ViewerImpl(ampdoc).isCctEmbedded()).to.be.false;
    });

    it('should NOT be CCT embedded w/ "amp_gsa=0"', () => {
      windowApi.parent = windowApi;
      windowApi.location.search = '?amp_gsa=0&amp_js_v=a0';
      expect(new ViewerImpl(ampdoc).isCctEmbedded()).to.be.false;
    });

    it('should NOT be CCT embedded w/ "amp_js_v" not starting with "a"', () => {
      windowApi.parent = windowApi;
      windowApi.location.search = '?amp_gsa=1&amp_js_v=0';
      expect(new ViewerImpl(ampdoc).isCctEmbedded()).to.be.false;
    });

    it('should NOT be CCT embedded if iframed regardless of "amp_gsa=1"', () => {
      windowApi.parent = {};
      windowApi.location.search = '?amp_gsa=0&amp_js_v=a0';
      expect(new ViewerImpl(ampdoc).isCctEmbedded()).to.be.false;
    });
  });

  describe('isTrustedViewer', () => {
    it('should consider non-trusted when not iframed', () => {
      windowApi.parent = windowApi;
      windowApi.location.ancestorOrigins = ['https://google.com'];
      return new ViewerImpl(ampdoc).isTrustedViewer().then((res) => {
        expect(res).to.be.false;
      });
    });

    it('should consider trusted by ancestor', () => {
      windowApi.parent = {};
      windowApi.location.ancestorOrigins = ['https://google.com'];
      return new ViewerImpl(ampdoc).isTrustedViewer().then((res) => {
        expect(res).to.be.true;
      });
    });

    it('should consider trusted by ancestor', () => {
      windowApi.parent = {};
      windowApi.location.ancestorOrigins = ['https://gmail.dev'];
      return new ViewerImpl(ampdoc).isTrustedViewer().then((res) => {
        expect(res).to.be.true;
      });
    });

    it('should consider non-trusted without ancestor', () => {
      windowApi.parent = {};
      windowApi.location.ancestorOrigins = [];
      return new ViewerImpl(ampdoc).isTrustedViewer().then((res) => {
        expect(res).to.be.false;
      });
    });

    it('should consider non-trusted with wrong ancestor', () => {
      windowApi.parent = {};
      windowApi.location.ancestorOrigins = ['https://untrusted.com'];
      return new ViewerImpl(ampdoc).isTrustedViewer().then((res) => {
        expect(res).to.be.false;
      });
    });

    it('should decide trusted on connection with origin', () => {
      windowApi.parent = {};
      windowApi.location.ancestorOrigins = null;
      const viewer = new ViewerImpl(ampdoc);
      viewer.setMessageDeliverer(() => {}, 'https://google.com');
      return viewer.isTrustedViewer().then((res) => {
        expect(res).to.be.true;
      });
    });

    it('should NOT allow channel without origin', () => {
      windowApi.parent = {};
      windowApi.location.ancestorOrigins = null;
      const viewer = new ViewerImpl(ampdoc);
      expect(() => {
        viewer.setMessageDeliverer(() => {});
      }).to.throw(/message channel must have an origin/);
    });

    it('should allow channel without origin thats an empty string', () => {
      windowApi.parent = {};
      windowApi.location.ancestorOrigins = null;
      const viewer = new ViewerImpl(ampdoc);
      expect(() => {
        viewer.setMessageDeliverer(() => {}, '');
      }).to.not.throw(/message channel must have an origin/);
    });

    it('should decide non-trusted on connection with wrong origin', () => {
      windowApi.parent = {};
      windowApi.location.ancestorOrigins = null;
      const viewer = new ViewerImpl(ampdoc);
      viewer.setMessageDeliverer(() => {}, 'https://untrusted.com');
      return viewer.isTrustedViewer().then((res) => {
        expect(res).to.be.false;
      });
    });

    it('should give precedence to ancestor', () => {
      windowApi.parent = {};
      windowApi.location.ancestorOrigins = ['https://google.com'];
      const viewer = new ViewerImpl(ampdoc);
      viewer.setMessageDeliverer(() => {}, 'https://untrusted.com');
      return viewer.isTrustedViewer().then((res) => {
        expect(res).to.be.true;
      });
    });

    describe('when in webview', () => {
      it('should decide trusted on connection with origin', () => {
        windowApi.parent = windowApi;
        params = {'webview': '1'};
        windowApi.location.ancestorOrigins = [];
        const viewer = new ViewerImpl(ampdoc);
        viewer.setMessageDeliverer(() => {}, 'https://google.com');
        return viewer.isTrustedViewer().then((res) => {
          expect(res).to.be.true;
        });
      });

      it('should NOT allow channel without origin', () => {
        windowApi.parent = windowApi;
        params = {'webview': '1'};
        windowApi.location.ancestorOrigins = [];
        const viewer = new ViewerImpl(ampdoc);
        expect(() => {
          viewer.setMessageDeliverer(() => {});
        }).to.throw(/message channel must have an origin/);
      });

      it('should decide non-trusted on connection with wrong origin', () => {
        windowApi.parent = windowApi;
        params = {'webview': '1'};
        windowApi.location.ancestorOrigins = [];
        const viewer = new ViewerImpl(ampdoc);
        viewer.setMessageDeliverer(() => {}, 'https://untrusted.com');
        return viewer.isTrustedViewer().then((res) => {
          expect(res).to.be.false;
        });
      });

      it('should NOT give precedence to ancestor', () => {
        windowApi.parent = windowApi;
        params = {'webview': '1'};
        windowApi.location.ancestorOrigins = ['https://google.com'];
        const viewer = new ViewerImpl(ampdoc);
        viewer.setMessageDeliverer(() => {}, 'https://untrusted.com');
        return viewer.isTrustedViewer().then((res) => {
          expect(res).to.be.false;
        });
      });
    });

    describe('when isCctEmbedded', () => {
      it('should decide trusted on connection with origin', () => {
        windowApi.parent = windowApi;
        windowApi.location.search = '?amp_gsa=1&amp_js_v=a0';
        windowApi.location.ancestorOrigins = [];
        const viewer = new ViewerImpl(ampdoc);
        viewer.setMessageDeliverer(() => {}, 'https://google.com');
        return viewer.isTrustedViewer().then((res) => {
          expect(res).to.be.true;
        });
      });

      it('should NOT allow channel without origin', () => {
        windowApi.parent = windowApi;
        windowApi.location.search = '?amp_gsa=1&amp_js_v=a0';
        windowApi.location.ancestorOrigins = [];
        const viewer = new ViewerImpl(ampdoc);
        expect(() => {
          viewer.setMessageDeliverer(() => {});
        }).to.throw(/message channel must have an origin/);
      });

      it('should decide non-trusted on connection with wrong origin', () => {
        windowApi.parent = windowApi;
        windowApi.location.search = '?amp_gsa=1&amp_js_v=a0';
        windowApi.location.ancestorOrigins = [];
        const viewer = new ViewerImpl(ampdoc);
        viewer.setMessageDeliverer(() => {}, 'https://untrusted.com');
        return viewer.isTrustedViewer().then((res) => {
          expect(res).to.be.false;
        });
      });

      it('should NOT give precedence to ancestor', () => {
        windowApi.parent = windowApi;
        windowApi.location.search = '?amp_gsa=1&amp_js_v=a0';
        windowApi.location.ancestorOrigins = ['https://google.com'];
        const viewer = new ViewerImpl(ampdoc);
        viewer.setMessageDeliverer(() => {}, 'https://untrusted.com');
        return viewer.isTrustedViewer().then((res) => {
          expect(res).to.be.false;
        });
      });
    });

    describe('when in a fake webview (a bad actor iframe)', () => {
      it('should consider trusted by ancestor', () => {
        windowApi.parent = {};
        params = {'origin': 'g.com', 'webview': '1'};
        windowApi.location.ancestorOrigins = ['https://google.com'];
        return new ViewerImpl(ampdoc).isTrustedViewer().then((res) => {
          expect(res).to.be.true;
        });
      });

      it('should consider non-trusted without ancestor', () => {
        windowApi.parent = {};
        params = {'origin': 'g.com', 'webview': '1'};
        windowApi.location.ancestorOrigins = [];
        return new ViewerImpl(ampdoc).isTrustedViewer().then((res) => {
          expect(res).to.be.false;
        });
      });

      it('should consider non-trusted with wrong ancestor', () => {
        windowApi.parent = {};
        params = {'origin': 'g.com', 'webview': '1'};
        windowApi.location.ancestorOrigins = ['https://untrusted.com'];
        return new ViewerImpl(ampdoc).isTrustedViewer().then((res) => {
          expect(res).to.be.false;
        });
      });

      it('should decide trusted on connection with origin', () => {
        windowApi.parent = {};
        params = {'origin': 'g.com', 'webview': '1'};
        windowApi.location.ancestorOrigins = null;
        const viewer = new ViewerImpl(ampdoc);
        viewer.setMessageDeliverer(() => {}, 'https://google.com');
        return viewer.isTrustedViewer().then((res) => {
          expect(res).to.be.true;
        });
      });

      it('should NOT allow channel without origin', () => {
        windowApi.parent = {};
        params = {'origin': 'g.com', 'webview': '1'};
        windowApi.location.ancestorOrigins = null;
        const viewer = new ViewerImpl(ampdoc);
        expect(() => {
          viewer.setMessageDeliverer(() => {});
        }).to.throw(/message channel must have an origin/);
      });

      it('should decide non-trusted on connection with wrong origin', () => {
        windowApi.parent = {};
        params = {'origin': 'g.com', 'webview': '1'};
        windowApi.location.ancestorOrigins = null;
        const viewer = new ViewerImpl(ampdoc);
        viewer.setMessageDeliverer(() => {}, 'https://untrusted.com');
        return viewer.isTrustedViewer().then((res) => {
          expect(res).to.be.false;
        });
      });

      it('should give precedence to ancestor', () => {
        windowApi.parent = {};
        params = {'origin': 'g.com', 'webview': '1'};
        windowApi.location.ancestorOrigins = ['https://google.com'];
        const viewer = new ViewerImpl(ampdoc);
        viewer.setMessageDeliverer(() => {}, 'https://untrusted.com');
        return viewer.isTrustedViewer().then((res) => {
          expect(res).to.be.true;
        });
      });
    });

    /**
     * Tests whether two URLs have the same origin according to our
     * simple heuristic.
     * @param {string} first The first URL.
     * @param {string} second The second URL.
     */
    function testHasRoughlySameOrigin(first, second) {
      it('should find ' + first + ' and ' + second + ' to match', () => {
        const viewer = new ViewerImpl(ampdoc);
        expect(viewer.hasRoughlySameOrigin_(first, second)).to.be.true;
      });
    }

    /**
     * Tests whether two URLs have different origins according to our simple
     * heuristic.
     * @param {string} first The first URL.
     * @param {string} second The second URL.
     */
    function testHasRoughlyDifferentOrigin(first, second) {
      it('should NOT find ' + first + ' and ' + second + ' to match', () => {
        const viewer = new ViewerImpl(ampdoc);
        expect(viewer.hasRoughlySameOrigin_(first, second)).to.be.false;
      });
    }

    describe('should be able to roughly compare origins', () => {
      testHasRoughlySameOrigin('http://google.com', 'http://google.com');
      testHasRoughlySameOrigin('https://google.com', 'https://google.com');
      testHasRoughlySameOrigin('https://www.google.com', 'https://google.com');
      testHasRoughlySameOrigin('https://www.google.net', 'https://google.net');
      testHasRoughlySameOrigin(
        'https://www.google.co.uk',
        'https://google.co.uk'
      );
      testHasRoughlySameOrigin(
        'https://www.google.co.uk:80',
        'https://google.co.uk:80'
      );
      testHasRoughlySameOrigin(
        'https://www.www.google.com',
        'https://google.com'
      );
      testHasRoughlySameOrigin(
        'https://www.www.www.google.com',
        'https://google.com'
      );
      testHasRoughlySameOrigin(
        'http://www.www.www.google.com:1337',
        'http://google.com:1337'
      );
      testHasRoughlySameOrigin('https://amp.google.com', 'https://google.com');
      testHasRoughlySameOrigin(
        'https://www.amp.google.com',
        'https://google.com'
      );
      testHasRoughlySameOrigin(
        'https://amp.www.google.com',
        'https://google.com'
      );
      testHasRoughlySameOrigin(
        'https://mobile.google.com',
        'https://google.com'
      );
      testHasRoughlySameOrigin('https://m.google.com', 'https://google.com');
      testHasRoughlySameOrigin(
        'https://amp.m.google.com',
        'https://google.com'
      );
      testHasRoughlySameOrigin(
        'https://amp.mobile.google.com',
        'https://google.com'
      );
      testHasRoughlySameOrigin(
        'https://amp.mobile.google.co.uk',
        'https://google.co.uk'
      );
      testHasRoughlySameOrigin(
        'https://www1.www2.www3.google.com',
        'https://google.com'
      );
      testHasRoughlySameOrigin(
        'https://www.xyz.google.com',
        'https://xyz.google.com'
      );
      testHasRoughlySameOrigin(
        'https://xyz.www.xyz.google.com',
        'https://xyz.www.xyz.google.com'
      );
      testHasRoughlyDifferentOrigin('http://google.com', 'https://google.com');
      testHasRoughlyDifferentOrigin('https://google.com', 'https://google.net');
      testHasRoughlyDifferentOrigin(
        'https://www.google.com',
        'http://google.com'
      );
      testHasRoughlyDifferentOrigin(
        'https://google.com:80',
        'https://google.com:81'
      );
      testHasRoughlyDifferentOrigin(
        'https://xyz.google.com',
        'https://google.com'
      );
      testHasRoughlyDifferentOrigin(
        'https://xyz.google.com',
        'http://xyz.google.com'
      );
      testHasRoughlyDifferentOrigin(
        'https://xyz.google.com:80',
        'https://xyz.google.com:81'
      );
    });

    /**
     * Tests trust determination by origin.
     *
     * @param {string} origin URL under test.
     * @param {boolean} toBeTrusted The expected outcome.
     * @param {boolean=} opt_inWebView Whether doc is in a web view.
     */
    function test(origin, toBeTrusted, opt_inWebView) {
      it('testing ' + origin, () => {
        const viewer = new ViewerImpl(ampdoc);
        viewer.isWebviewEmbedded_ = !!opt_inWebView;
        expect(viewer.isTrustedViewerOrigin_(origin)).to.equal(toBeTrusted);
      });
    }

    describe('should trust trusted viewer origins', () => {
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
      test('x-thread://', true);
    });

    describe('should not trust host as referrer with http', () => {
      test('http://google.com', false);
    });

    describe('should NOT trust wrong or non-allowlisted domain variations', () => {
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
      setUrl('#');
      windowApi.document.referrer = 'https://acme.org/docref';
      const viewer = new ViewerImpl(ampdoc);
      expect(viewer.getUnconfirmedReferrerUrl()).to.equal(
        'https://acme.org/docref'
      );
      return viewer.getReferrerUrl().then((referrerUrl) => {
        expect(referrerUrl).to.equal('https://acme.org/docref');
        expect(errorStub).to.have.not.been.called;
      });
    });

    it('should NOT allow override if not iframed', () => {
      windowApi.parent = windowApi;
      setUrl('#referrer=' + encodeURIComponent('https://acme.org/viewer'));
      windowApi.document.referrer = 'https://acme.org/docref';
      const viewer = new ViewerImpl(ampdoc);
      expect(viewer.getUnconfirmedReferrerUrl()).to.equal(
        'https://acme.org/docref'
      );
      return viewer.getReferrerUrl().then((referrerUrl) => {
        expect(referrerUrl).to.equal('https://acme.org/docref');
        expect(errorStub).to.have.not.been.called;
      });
    });

    it('should NOT allow override if not trusted', () => {
      windowApi.parent = {};
      windowApi.location.hash =
        '#origin=g.com&referrer=' +
        encodeURIComponent('https://acme.org/viewer');
      windowApi.document.referrer = 'https://acme.org/docref';
      windowApi.location.ancestorOrigins = ['https://untrusted.com'];
      const viewer = new ViewerImpl(ampdoc);
      expect(viewer.getUnconfirmedReferrerUrl()).to.equal(
        'https://acme.org/docref'
      );
      return viewer.getReferrerUrl().then((referrerUrl) => {
        expect(referrerUrl).to.equal('https://acme.org/docref');
        expect(errorStub).to.have.not.been.called;
      });
    });

    it('should NOT allow override if ancestor is empty', () => {
      windowApi.parent = {};
      windowApi.location.hash =
        '#origin=g.com&referrer=' +
        encodeURIComponent('https://acme.org/viewer');
      windowApi.document.referrer = 'https://acme.org/docref';
      windowApi.location.ancestorOrigins = [];
      const viewer = new ViewerImpl(ampdoc);
      expect(viewer.getUnconfirmedReferrerUrl()).to.equal(
        'https://acme.org/docref'
      );
      return viewer.getReferrerUrl().then((referrerUrl) => {
        expect(referrerUrl).to.equal('https://acme.org/docref');
        expect(errorStub).to.have.not.been.called;
      });
    });

    it('should allow partial override if async not trusted', () => {
      windowApi.parent = {};
      setUrl(
        '#origin=g.com&referrer=' +
          encodeURIComponent('https://acme.org/viewer')
      );
      windowApi.document.referrer = 'https://acme.org/docref';
      const viewer = new ViewerImpl(ampdoc);
      // Unconfirmed referrer is overriden, but not confirmed yet.
      expect(viewer.getUnconfirmedReferrerUrl()).to.equal(
        'https://acme.org/viewer'
      );
      viewer.setMessageDeliverer(() => {}, 'https://untrusted.com');
      return viewer.getReferrerUrl().then((referrerUrl) => {
        expect(referrerUrl).to.equal('https://acme.org/docref');
        // Unconfirmed referrer is reset. Async error is thrown.
        expect(viewer.getUnconfirmedReferrerUrl()).to.equal(
          'https://acme.org/docref'
        );
        expect(expectedErrorStub).to.be.calledOnce;
        expect(
          expectedErrorStub.calledWith(
            'Viewer',
            env.sandbox.match((arg) => {
              return !!arg.match(/Untrusted viewer referrer override/);
            })
          )
        ).to.be.true;
      });
    });

    it('should allow full override if async trusted', () => {
      windowApi.parent = {};
      setUrl(
        '#origin=g.com&referrer=' +
          encodeURIComponent('https://acme.org/viewer')
      );
      windowApi.document.referrer = 'https://acme.org/docref';
      const viewer = new ViewerImpl(ampdoc);
      // Unconfirmed referrer is overriden and will be confirmed next.
      expect(viewer.getUnconfirmedReferrerUrl()).to.equal(
        'https://acme.org/viewer'
      );
      viewer.setMessageDeliverer(() => {}, 'https://google.com');
      return viewer.getReferrerUrl().then((referrerUrl) => {
        expect(referrerUrl).to.equal('https://acme.org/viewer');
        // Unconfirmed is confirmed and kept.
        expect(viewer.getUnconfirmedReferrerUrl()).to.equal(
          'https://acme.org/viewer'
        );
        expect(errorStub).to.have.not.been.called;
      });
    });

    it('should allow override if iframed and trusted', () => {
      windowApi.parent = {};
      setUrl(
        '#origin=g.com&referrer=' +
          encodeURIComponent('https://acme.org/viewer')
      );
      windowApi.document.referrer = 'https://acme.org/docref';
      windowApi.location.ancestorOrigins = ['https://google.com'];
      const viewer = new ViewerImpl(ampdoc);
      expect(viewer.getUnconfirmedReferrerUrl()).to.equal(
        'https://acme.org/viewer'
      );
      return viewer.getReferrerUrl().then((referrerUrl) => {
        expect(referrerUrl).to.equal('https://acme.org/viewer');
        expect(errorStub).to.have.not.been.called;
      });
    });

    it('should allow override to empty if iframed and trusted', () => {
      windowApi.parent = {};
      setUrl('#origin=g.com&referrer=');
      windowApi.document.referrer = 'https://acme.org/docref';
      windowApi.location.ancestorOrigins = ['https://google.com'];
      const viewer = new ViewerImpl(ampdoc);
      expect(viewer.getUnconfirmedReferrerUrl()).to.equal('');
      return viewer.getReferrerUrl().then((referrerUrl) => {
        expect(referrerUrl).to.equal('');
        expect(errorStub).to.have.not.been.called;
      });
    });
  });

  describe('viewerUrl', () => {
    it('should initially always return current location', () => {
      setUrl('https://acme.org/doc1#hash');
      const viewer = new ViewerImpl(ampdoc);
      expect(viewer.getResolvedViewerUrl()).to.equal('https://acme.org/doc1');
    });

    it('should always return current location for top-level window', () => {
      windowApi.parent = windowApi;
      setUrl('https://acme.org/doc1#hash');
      const viewer = new ViewerImpl(ampdoc);
      expect(viewer.getResolvedViewerUrl()).to.equal('https://acme.org/doc1');
      return viewer.getViewerUrl().then((viewerUrl) => {
        expect(viewerUrl).to.equal('https://acme.org/doc1');
        expect(viewer.getResolvedViewerUrl()).to.equal('https://acme.org/doc1');
        expect(expectedErrorStub).to.have.not.been.called;
      });
    });

    it('should NOT allow override if not iframed', () => {
      windowApi.parent = windowApi;
      setUrl(
        'https://acme.org/doc1#origin=g.com&viewerUrl=' +
          encodeURIComponent('https://acme.org/viewer')
      );
      const viewer = new ViewerImpl(ampdoc);
      expect(viewer.getResolvedViewerUrl()).to.equal('https://acme.org/doc1');
      return viewer.getViewerUrl().then((viewerUrl) => {
        expect(viewerUrl).to.equal('https://acme.org/doc1');
        expect(viewer.getResolvedViewerUrl()).to.equal('https://acme.org/doc1');
        expect(expectedErrorStub).to.have.not.been.called;
      });
    });

    it('should NOT allow override if not trusted', () => {
      windowApi.parent = {};
      setUrl(
        'https://acme.org/doc1#origin=g.com&viewerUrl=' +
          encodeURIComponent('https://acme.org/viewer')
      );
      windowApi.location.ancestorOrigins = ['https://untrusted.com'];
      const viewer = new ViewerImpl(ampdoc);
      expect(viewer.getResolvedViewerUrl()).to.equal('https://acme.org/doc1');
      return viewer.getViewerUrl().then((viewerUrl) => {
        expect(viewerUrl).to.equal('https://acme.org/doc1');
        expect(viewer.getResolvedViewerUrl()).to.equal('https://acme.org/doc1');
        expect(expectedErrorStub).to.be.calledOnce;
        expect(
          expectedErrorStub.calledWith(
            'Viewer',
            env.sandbox.match((arg) => {
              return !!arg.match(/Untrusted viewer url override/);
            })
          )
        ).to.be.true;
      });
    });

    it('should NOT allow override if ancestor is empty', () => {
      windowApi.parent = {};
      setUrl(
        'https://acme.org/doc1#origin=g.com&viewerUrl=' +
          encodeURIComponent('https://acme.org/viewer')
      );
      windowApi.location.ancestorOrigins = [];
      const viewer = new ViewerImpl(ampdoc);
      expect(viewer.getResolvedViewerUrl()).to.equal('https://acme.org/doc1');
      return viewer.getViewerUrl().then((viewerUrl) => {
        expect(viewerUrl).to.equal('https://acme.org/doc1');
        expect(viewer.getResolvedViewerUrl()).to.equal('https://acme.org/doc1');
        expect(expectedErrorStub).to.be.calledOnce;
        expect(
          expectedErrorStub.calledWith(
            'Viewer',
            env.sandbox.match((arg) => {
              return !!arg.match(/Untrusted viewer url override/);
            })
          )
        ).to.be.true;
      });
    });

    it('should allow partial override if async not trusted', () => {
      windowApi.parent = {};
      setUrl(
        'https://acme.org/doc1#origin=g.com&viewerUrl=' +
          encodeURIComponent('https://acme.org/viewer')
      );
      const viewer = new ViewerImpl(ampdoc);
      expect(viewer.getResolvedViewerUrl()).to.equal('https://acme.org/doc1');
      viewer.setMessageDeliverer(() => {}, 'https://untrusted.com');
      return viewer.getViewerUrl().then((viewerUrl) => {
        expect(viewerUrl).to.equal('https://acme.org/doc1');
        expect(viewer.getResolvedViewerUrl()).to.equal('https://acme.org/doc1');
        expect(expectedErrorStub).to.be.calledOnce;
        expect(
          expectedErrorStub.calledWith(
            'Viewer',
            env.sandbox.match((arg) => {
              return !!arg.match(/Untrusted viewer url override/);
            })
          )
        ).to.be.true;
      });
    });

    it('should allow full override if async trusted', () => {
      windowApi.parent = {};
      setUrl(
        'https://acme.org/doc1#origin=g.com&viewerUrl=' +
          encodeURIComponent('https://acme.org/viewer')
      );
      const viewer = new ViewerImpl(ampdoc);
      expect(viewer.getResolvedViewerUrl()).to.equal('https://acme.org/doc1');
      viewer.setMessageDeliverer(() => {}, 'https://google.com');
      return viewer.getViewerUrl().then((viewerUrl) => {
        expect(viewerUrl).to.equal('https://acme.org/viewer');
        expect(viewer.getResolvedViewerUrl()).to.equal(
          'https://acme.org/viewer'
        );
        expect(expectedErrorStub).to.have.not.been.called;
      });
    });

    it('should allow override if iframed and trusted', () => {
      windowApi.parent = {};
      setUrl(
        'https://acme.org/doc1#origin=g.com&viewerUrl=' +
          encodeURIComponent('https://acme.org/viewer')
      );
      windowApi.location.ancestorOrigins = ['https://google.com'];
      const viewer = new ViewerImpl(ampdoc);
      expect(viewer.getResolvedViewerUrl()).to.equal('https://acme.org/doc1');
      return viewer.getViewerUrl().then((viewerUrl) => {
        expect(viewerUrl).to.equal('https://acme.org/viewer');
        expect(viewer.getResolvedViewerUrl()).to.equal(
          'https://acme.org/viewer'
        );
        expect(expectedErrorStub).to.have.not.been.called;
      });
    });

    it('should ignore override to empty if iframed and trusted', () => {
      windowApi.parent = {};
      setUrl('https://acme.org/doc1#origin=g.com&viewerUrl=');
      windowApi.location.ancestorOrigins = ['https://google.com'];
      const viewer = new ViewerImpl(ampdoc);
      expect(viewer.getResolvedViewerUrl()).to.equal('https://acme.org/doc1');
      return viewer.getViewerUrl().then((viewerUrl) => {
        expect(viewerUrl).to.equal('https://acme.org/doc1');
        expect(viewer.getResolvedViewerUrl()).to.equal('https://acme.org/doc1');
        expect(expectedErrorStub).to.have.not.been.called;
      });
    });
  });

  describe('viewerOrigin', () => {
    it('should return empty string if origin is not known', () => {
      const viewer = new ViewerImpl(ampdoc);
      return viewer.getViewerOrigin().then((viewerOrigin) => {
        expect(viewerOrigin).to.equal('');
      });
    });

    it('should return ancestor origin if known', () => {
      windowApi.parent = {};
      windowApi.location.ancestorOrigins = ['https://google.com'];
      const viewer = new ViewerImpl(ampdoc);
      return viewer.getViewerOrigin().then((viewerOrigin) => {
        expect(viewerOrigin).to.equal('https://google.com');
      });
    });

    it('should return viewer origin if set via handshake', () => {
      windowApi.parent = {};
      const viewer = new ViewerImpl(ampdoc);
      const result = viewer.getViewerOrigin().then((viewerOrigin) => {
        expect(viewerOrigin).to.equal('https://foobar.com');
      });
      viewer.setMessageDeliverer(() => {}, 'https://foobar.com');
      return result;
    });

    it('should return empty string if handshake does not happen', () => {
      windowApi.parent = {};
      const viewer = new ViewerImpl(ampdoc);
      const result = viewer.getViewerOrigin().then((viewerOrigin) => {
        expect(viewerOrigin).to.equal('');
      });
      clock.tick(1010);
      return result;
    });
  });

  describe('onMessage', () => {
    it('should fire observer on event', () => {
      const onMessageSpy = env.sandbox.spy();
      viewer.onMessage('event', onMessageSpy);
      viewer.receiveMessage('event', {foo: 'bar'});
      expect(onMessageSpy).to.have.been.calledOnceWithExactly({foo: 'bar'});
    });

    it('should not fire observer on other events', () => {
      const onMessageSpy = env.sandbox.spy();
      viewer.onMessage('event', onMessageSpy);
      viewer.receiveMessage('otherevent', {foo: 'bar'});
      expect(onMessageSpy).to.not.have.been.called;
    });

    it('should fire observer with queued messages on handler registration', () => {
      const onMessageSpy = env.sandbox.spy();
      viewer.receiveMessage('event', {foo: 'bar'});
      viewer.onMessage('event', onMessageSpy);
      expect(onMessageSpy).to.have.been.calledOnceWithExactly({foo: 'bar'});
    });

    it('should empty queued messages after first handler registration', () => {
      const onMessageSpy = env.sandbox.spy();
      viewer.receiveMessage('event', {foo: 'bar'});
      viewer.onMessage('event', onMessageSpy);
      viewer.onMessage('event', onMessageSpy);
      expect(onMessageSpy).to.have.been.calledOnceWithExactly({foo: 'bar'});
    });

    it('should cap the max number of queued messages', () => {
      const onMessageSpy = env.sandbox.spy();
      for (let i = 0; i < 55; i++) {
        viewer.receiveMessage('event', {foo: 'bar'});
      }
      viewer.onMessage('event', onMessageSpy);
      expect(onMessageSpy).to.have.callCount(50);
    });
  });

  describe('onMessageRespond', () => {
    it('should call responder on event', () => {
      const onMessageRespondStub = env.sandbox.stub().resolves();
      viewer.onMessageRespond('event', onMessageRespondStub);
      viewer.receiveMessage('event', {foo: 'bar'});
      expect(onMessageRespondStub).to.have.been.calledOnceWithExactly({
        foo: 'bar',
      });
    });

    it('should not call responder on other events', () => {
      const onMessageRespondStub = env.sandbox.stub().resolves();
      viewer.onMessageRespond('event', onMessageRespondStub);
      viewer.receiveMessage('otherevent', {foo: 'bar'});
      expect(onMessageRespondStub).to.not.have.been.called;
    });

    it('should call responder with queued messages on responder registration', () => {
      const onMessageRespondStub = env.sandbox.stub().resolves();
      viewer.receiveMessage('event', {foo: 'bar'});
      viewer.onMessageRespond('event', onMessageRespondStub);
      expect(onMessageRespondStub).to.have.been.calledOnceWithExactly({
        foo: 'bar',
      });
    });

    it('should empty queued messages after first responder registration', () => {
      const onMessageRespondStub = env.sandbox.stub().resolves();
      viewer.receiveMessage('event', {foo: 'bar'});
      viewer.onMessageRespond('event', onMessageRespondStub);
      viewer.onMessageRespond('event', onMessageRespondStub);
      expect(onMessageRespondStub).to.have.been.calledOnceWithExactly({
        foo: 'bar',
      });
    });

    it('should return responder response when enqueing message on responder registration', async () => {
      const onMessageRespondStub = env.sandbox.stub().resolves('response');
      const promise = viewer.receiveMessage('event', {foo: 'bar'});
      viewer.onMessageRespond('event', onMessageRespondStub);
      expect(await promise).to.equal('response');
    });
  });
});
