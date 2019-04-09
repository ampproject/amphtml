/**
 * Copyright 2017 The AMP HTML Authors. All Rights Reserved.
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

import * as mode from '../../../../src/mode';
import {AmpWebPushHelperFrame} from '../amp-web-push-helper-frame';
import {NotificationPermission} from '../vars';
import {WebPushConfigAttributes} from '../amp-web-push-config';
import {WebPushService} from '../web-push-service';
import {WebPushWidgetVisibilities} from '../amp-web-push-widget';
import {WindowMessenger} from '../window-messenger';

const FAKE_IFRAME_URL =
  '//ads.localhost:9876/test/fixtures/served/iframe-stub.html#';


describes.realWin('web-push-service environment support', {
  amp: true,
}, env => {
  let webPush;

  beforeEach(() => {
    webPush = new WebPushService(env.ampdoc);
  });

  it('should report supported environment', () => {
    expect(webPush.environmentSupportsWebPush()).to.eq(true);
  });

  it('should not support environment missing Notification API', () => {
    Object.defineProperty(env.win, 'Notification', {
      enumerable: false,
      configurable: false,
      writable: false,
      value: undefined,
    });
    expect(webPush.environmentSupportsWebPush()).to.eq(false);
  });

  it('should not support environment missing Service Worker API', () => {
    Object.defineProperty(env.win.navigator, 'serviceWorker', {
      enumerable: false,
      configurable: false,
      writable: false,
      value: undefined,
    });
    expect(webPush.environmentSupportsWebPush()).to.eq(false);
  });

  it('should not support environment missing PushManager API', () => {
    Object.defineProperty(env.win, 'PushManager', {
      enumerable: false,
      configurable: false,
      writable: false,
      value: undefined,
    });
    expect(webPush.environmentSupportsWebPush()).to.eq(false);
  });

  it('an unsupported environment should prevent initializing', () => {
    // Cause push to not be supported on this environment
    Object.defineProperty(env.win, 'PushManager', {
      enumerable: false,
      configurable: false,
      writable: false,
      value: undefined,
    });
    // Should not error out
    return webPush.start().should.eventually.be
        .rejectedWith(/Web push is not supported/);
  });
});

describes.fakeWin('web-push-service environment support', {
  amp: true,
}, env => {
  it('should not support HTTP location', () => {
    env.ampdoc.win.location.resetHref('http://site.com/');
    sandbox.stub(mode, 'getMode').callsFake(() => {
      return {development: false, test: false};
    });
    expect(env.ampdoc.win.location.href).to.be.equal(
        'http://site.com/');
    const webPush = new WebPushService(env.ampdoc);
    sandbox./*OK*/stub(
        webPush,
        'arePushRelatedApisSupported_').callsFake(
        () => true
    );
    expect(webPush.environmentSupportsWebPush()).to.eq(false);
  });
});

describes.fakeWin('web-push-service environment support', {
  amp: true,
}, env => {
  it('should support localhost HTTP location', () => {
    env.ampdoc.win.location.resetHref('http://localhost/');
    expect(env.ampdoc.win.location.href).to.be.equal(
        'http://localhost/');
    const webPush = new WebPushService(env.ampdoc);
    sandbox./*OK*/stub(
        webPush,
        'arePushRelatedApisSupported_').callsFake(
        () => true
    );
    expect(webPush.environmentSupportsWebPush()).to.eq(true);
  });
});

describes.fakeWin('web-push-service environment support', {
  amp: true,
}, env => {
  it('should support localhost HTTP location with port', () => {
    env.ampdoc.win.location.resetHref('http://localhost:8000/');
    const webPush = new WebPushService(env.ampdoc);
    sandbox./*OK*/stub(
        webPush,
        'arePushRelatedApisSupported_').callsFake(
        () => true
    );
    expect(env.ampdoc.win.location.href).to.be.equal(
        'http://localhost:8000/');
    expect(webPush.environmentSupportsWebPush()).to.eq(true);
  });
});

describes.fakeWin('web-push-service environment support', {
  amp: true,
}, env => {
  it('should support 127.0.0.1 HTTP location', () => {
    env.ampdoc.win.location.resetHref('http://127.0.0.1/');
    const webPush = new WebPushService(env.ampdoc);
    sandbox./*OK*/stub(
        webPush,
        'arePushRelatedApisSupported_').callsFake(
        () => true
    );
    expect(env.ampdoc.win.location.href).to.be.equal(
        'http://127.0.0.1/');
    expect(webPush.environmentSupportsWebPush()).to.eq(true);
  });
});

describes.fakeWin('web-push-service environment support', {
  amp: true,
}, env => {
  it('should support 127.0.0.1 HTTP location with port', () => {
    env.ampdoc.win.location.resetHref('http://localhost:9000/');
    const webPush = new WebPushService(env.ampdoc);
    sandbox./*OK*/stub(
        webPush,
        'arePushRelatedApisSupported_').callsFake(
        () => true
    );
    expect(env.ampdoc.win.location.href).to.be.equal(
        'http://localhost:9000/');
    expect(webPush.environmentSupportsWebPush()).to.eq(true);
  });
});

describes.realWin('web-push-service helper frame messaging', {
  amp: true,
}, env => {
  let webPush;
  const webPushConfig = {};
  let iframeWindow = null;

  function setDefaultConfigParams_() {
    webPushConfig[WebPushConfigAttributes.HELPER_FRAME_URL] =
      FAKE_IFRAME_URL;
    webPushConfig[WebPushConfigAttributes.PERMISSION_DIALOG_URL] =
      FAKE_IFRAME_URL;
    webPushConfig[WebPushConfigAttributes.SERVICE_WORKER_URL] =
      FAKE_IFRAME_URL;
    webPushConfig[WebPushConfigAttributes.SERVICE_WORKER_SCOPE] =
      FAKE_IFRAME_URL;
  }

  function setupHelperIframe() {
    webPush.initializeConfig(webPushConfig);
    return webPush.installHelperFrame(webPushConfig).then(() => {
      const helperIframe = getHelperIframe();
      iframeWindow = helperIframe.contentWindow;
      iframeWindow.WindowMessenger = WindowMessenger;
      iframeWindow.AmpWebPushHelperFrame = AmpWebPushHelperFrame;
      iframeWindow._ampWebPushHelperFrame =
        new iframeWindow.AmpWebPushHelperFrame({
          debug: true,
          windowContext: iframeWindow,
        });
      iframeWindow._ampWebPushHelperFrame
          .run(env.win.location.ancestorOrigins[0]);
      return webPush.frameMessenger_.connect(
          iframeWindow,
          '*'
      );
    });
  }

  /**
   * Returns the iframe in this testing AMP iframe that partially matches the
   * URL set in the test config. Partial matches are possible only since query
   * parameters are appended to the iframe URL.
   */
  function getHelperIframe() {
    return env.win.document.querySelector('iframe');
  }

  beforeEach(() => {
    setDefaultConfigParams_();
    webPush = new WebPushService(env.ampdoc);
  });

  it('should create helper iframe on document', () => {
    webPush.initializeConfig(webPushConfig);
    return webPush.installHelperFrame(webPushConfig).then(() => {
      expect(getHelperIframe()).to.not.be.null;
    });
  });

  // TODO(jasonpang): This fails on master under headless Chrome.
  it.skip('should receive reply from helper iframe for permission query',
      () => {
        return setupHelperIframe().then(() => {
          return webPush.queryNotificationPermission();
        }).then(permission => {
          expect(permission).to.eq(NotificationPermission.DEFAULT);
        });
      });
});


describes.realWin('web-push-service widget visibilities', {
  amp: true,
}, env => {
  let webPush;
  const webPushConfig = {};
  let iframeWindow = null;

  function setDefaultConfigParams_() {
    webPushConfig[WebPushConfigAttributes.HELPER_FRAME_URL] =
      FAKE_IFRAME_URL;
    webPushConfig[WebPushConfigAttributes.PERMISSION_DIALOG_URL] =
      FAKE_IFRAME_URL;
    webPushConfig[WebPushConfigAttributes.SERVICE_WORKER_URL] =
      FAKE_IFRAME_URL;
    webPushConfig[WebPushConfigAttributes.SERVICE_WORKER_SCOPE] =
      FAKE_IFRAME_URL;
  }

  function setupHelperIframe() {
    webPush.initializeConfig(webPushConfig);
    return webPush.installHelperFrame(webPushConfig).then(() => {
      const helperIframe = getHelperIframe();
      iframeWindow = helperIframe.contentWindow;
      iframeWindow.WindowMessenger = WindowMessenger;
      iframeWindow.AmpWebPushHelperFrame = AmpWebPushHelperFrame;
      iframeWindow._ampWebPushHelperFrame =
        new iframeWindow.AmpWebPushHelperFrame({
          debug: true,
          windowContext: iframeWindow,
        });
      iframeWindow._ampWebPushHelperFrame
          .run(env.win.location.ancestorOrigins[0]);
      return webPush.frameMessenger_.connect(
          iframeWindow,
          '*'
      );
    });
  }

  /**
   * Returns the iframe in this testing AMP iframe that partially matches the
   * URL set in the test config. Partial matches are possible only since query
   * parameters are appended to the iframe URL.
   */
  function getHelperIframe() {
    return env.win.document.querySelector('iframe');
  }

  beforeEach(() => {
    setDefaultConfigParams_();
    webPush = new WebPushService(env.ampdoc);
  });

  it('should show blocked widget if permission query returns blocked', () => {
    let spy = null;
    return setupHelperIframe().then(() => {
      spy = sandbox./*OK*/spy(webPush, 'setWidgetVisibilities');

      sandbox./*OK*/stub(
          webPush,
          'isQuerySupported_').callsFake(
          () => Promise.resolve(true)
      );

      sandbox./*OK*/stub(
          webPush,
          'getCanonicalFrameStorageValue_').callsFake(
          () => Promise.resolve(NotificationPermission.DENIED)
      );

      sandbox./*OK*/stub(
          webPush,
          'doesWidgetCategoryMarkupExist_').callsFake(
          () => true
      );
      // We've mocked default notification permissions
      return webPush.updateWidgetVisibilities();
    }).then(() => {
      expect(spy.withArgs(WebPushWidgetVisibilities.UNSUBSCRIBED, false)
          .calledOnce).to.eq(true);
      expect(spy.withArgs(WebPushWidgetVisibilities.SUBSCRIBED, false)
          .calledOnce).to.eq(true);
      expect(spy.withArgs(WebPushWidgetVisibilities.BLOCKED, true)
          .calledOnce).to.eq(true);
    });
  });

  it('should show unsubscription widget if reachable SW returns subscribed',
      () => {
        let spy = null;

        return setupHelperIframe().then(() => {
          spy = sandbox./*OK*/spy(webPush, 'setWidgetVisibilities');

          sandbox./*OK*/stub(
              webPush, 'querySubscriptionStateRemotely').callsFake(
              () => Promise.resolve(true)
          );
          sandbox./*OK*/stub(
              webPush, 'isServiceWorkerActivated').callsFake(
              () => Promise.resolve(true)
          );
          sandbox./*OK*/stub(
              webPush, 'queryNotificationPermission').callsFake(
              () => Promise.resolve(NotificationPermission.DEFAULT)
          );

          // We've mocked default notification permissions
          return webPush.updateWidgetVisibilities();
        }).then(() => {
          expect(spy.withArgs(WebPushWidgetVisibilities.UNSUBSCRIBED, false)
              .calledOnce).to.eq(true);
          expect(spy.withArgs(WebPushWidgetVisibilities.SUBSCRIBED, true)
              .calledOnce).to.eq(true);
          expect(spy.withArgs(WebPushWidgetVisibilities.BLOCKED, false)
              .calledOnce).to.eq(true);
        });
      });

  it('should show subscription widget if permission query returns default',
      () => {
        let spy = null;

        return setupHelperIframe().then(() => {
          spy = sandbox./*OK*/spy(webPush, 'setWidgetVisibilities');

          sandbox./*OK*/stub(
              webPush,
              'isServiceWorkerActivated').callsFake(
              () => Promise.resolve(false)
          );
          sandbox./*OK*/stub(
              webPush,
              'queryNotificationPermission').callsFake(
              () => Promise.resolve(NotificationPermission.DEFAULT)
          );

          // We've mocked default notification permissions
          return webPush.updateWidgetVisibilities();
        }).then(() => {
          expect(spy.withArgs(WebPushWidgetVisibilities.UNSUBSCRIBED, true)
              .calledOnce).to.eq(true);
          expect(spy.withArgs(WebPushWidgetVisibilities.SUBSCRIBED, false)
              .calledOnce).to.eq(true);
          expect(spy.withArgs(WebPushWidgetVisibilities.BLOCKED, false)
              .calledOnce).to.eq(true);
        });
      });

  it('should show subscription widget if SW returns unsubscribed', () => {
    let spy = null;

    return setupHelperIframe().then(() => {
      spy = sandbox./*OK*/spy(webPush, 'setWidgetVisibilities');

      sandbox./*OK*/stub(
          webPush,
          'querySubscriptionStateRemotely').callsFake(
          () => Promise.resolve(false)
      );
      sandbox./*OK*/stub(
          webPush,
          'isServiceWorkerActivated').callsFake(
          () => Promise.resolve(true)
      );
      sandbox./*OK*/stub(
          webPush,
          'queryNotificationPermission').callsFake(
          () => Promise.resolve(NotificationPermission.DEFAULT)
      );

      // We've mocked default notification permissions
      return webPush.updateWidgetVisibilities();
    }).then(() => {
      expect(spy.withArgs(WebPushWidgetVisibilities.UNSUBSCRIBED, true)
          .calledOnce).to.eq(true);
      expect(spy.withArgs(WebPushWidgetVisibilities.SUBSCRIBED, false)
          .calledOnce).to.eq(true);
      expect(spy.withArgs(WebPushWidgetVisibilities.BLOCKED, false)
          .calledOnce).to.eq(true);
    });
  });

  it('service worker URLs should match except for query params', () => {
    // Identical URLs
    expect(
        webPush.isUrlSimilarForQueryParams(
            'https://site.com/worker-a.js?a=1&b=2',
            'https://site.com/worker-a.js?a=1&b=2'
        )
    ).to.eq(true);

    // Identical URLs except URL to test is allowed to have more than the
    // first's query params
    expect(
        webPush.isUrlSimilarForQueryParams(
            'https://site.com/worker-a.js?a=1&b=2',
            'https://site.com/worker-a.js?a=1&b=2&c=3&d=4'
        )
    ).to.eq(true);

    // URL to test is missing one of the first URL's query params
    expect(
        webPush.isUrlSimilarForQueryParams(
            'https://site.com/worker-a.js?a=1&b=2',
            'https://site.com/worker-a.js?a=1&c=3&d=4'
        )
    ).to.eq(false);

    // URL to test is missing all query params
    expect(
        webPush.isUrlSimilarForQueryParams(
            'https://site.com/worker-a.js?a=1&b=2',
            'https://site.com/worker-a.js'
        )
    ).to.eq(false);

    // URL to test has the wrong scheme
    expect(
        webPush.isUrlSimilarForQueryParams(
            'https://site.com/worker-a.js?a=1&b=2',
            'http://site.com/worker-a.js?a=1&b=2'
        )
    ).to.eq(false);

    // URL to test has the wrong hostname
    expect(
        webPush.isUrlSimilarForQueryParams(
            'https://site.com/worker-a.js?a=1&b=2',
            'https://another-site.com/worker-a.js?a=1&b=2'
        )
    ).to.eq(false);

    // URL to test has the wrong port
    expect(
        webPush.isUrlSimilarForQueryParams(
            'https://site.com/worker-a.js?a=1&b=2',
            'https://site:8000.com/worker-a.js?a=1&b=2'
        )
    ).to.eq(false);

    // URL to test has the wrong pathname
    expect(
        webPush.isUrlSimilarForQueryParams(
            'https://site.com/worker-a.js?a=1&b=2',
            'https://site.com/another-worker-b.js?a=1&b=2'
        )
    ).to.eq(false);
  });

  // TODO(dvoytenko, #12476): Make this test work with sinon 4.0.
  it.skip('should forward amp-web-push-subscription-state ' +
      'message to SW', done => {
    let iframeWindowControllerMock = null;

    return setupHelperIframe().then(() => {
      sandbox./*OK*/stub(
          webPush,
          'isServiceWorkerActivated').callsFake(
          () => Promise.resolve(true)
      );
      sandbox./*OK*/stub(
          webPush,
          'queryNotificationPermission',
          () => Promise.resolve(NotificationPermission.GRANTED)
      );

      iframeWindowControllerMock =
        sandbox./*OK*/mock(iframeWindow._ampWebPushHelperFrame);
      iframeWindowControllerMock.expects('waitUntilWorkerControlsPage')
          .returns(Promise.resolve(true));
      sandbox./*OK*/stub(
          iframeWindow._ampWebPushHelperFrame,
          'messageServiceWorker').callsFake(
          message => {
            if (message.topic === 'amp-web-push-subscription-state') {
              done();
            }
          });
      return webPush.updateWidgetVisibilities();
    });
  });
});

describes.realWin('web-push-service subscribing', {
  amp: true,
}, env => {
  let webPush;
  const webPushConfig = {};
  let iframeWindow = null;

  function setDefaultConfigParams_() {
    webPushConfig[WebPushConfigAttributes.HELPER_FRAME_URL] =
      FAKE_IFRAME_URL;
    webPushConfig[WebPushConfigAttributes.PERMISSION_DIALOG_URL] =
      FAKE_IFRAME_URL;
    webPushConfig[WebPushConfigAttributes.SERVICE_WORKER_URL] =
      FAKE_IFRAME_URL;
    webPushConfig[WebPushConfigAttributes.SERVICE_WORKER_SCOPE] =
      FAKE_IFRAME_URL;
  }

  function setupHelperIframe() {
    webPush.initializeConfig(webPushConfig);
    return webPush.installHelperFrame(webPushConfig).then(() => {
      const helperIframe = getHelperIframe();
      iframeWindow = helperIframe.contentWindow;
      iframeWindow.WindowMessenger = WindowMessenger;
      iframeWindow.AmpWebPushHelperFrame = AmpWebPushHelperFrame;
      iframeWindow._ampWebPushHelperFrame =
        new iframeWindow.AmpWebPushHelperFrame({
          debug: true,
          windowContext: iframeWindow,
        });
      iframeWindow._ampWebPushHelperFrame
          .run(env.win.location.ancestorOrigins[0]);
      return webPush.frameMessenger_.connect(
          iframeWindow,
          '*'
      );
    });
  }

  /**
   * Returns the iframe in this testing AMP iframe that partially matches the
   * URL set in the test config. Partial matches are possible only since query
   * parameters are appended to the iframe URL.
   */
  function getHelperIframe() {
    return env.win.document.querySelector('iframe');
  }

  beforeEach(() => {
    setDefaultConfigParams_();
    webPush = new WebPushService(env.ampdoc);
  });

  it('should register service worker', () => {
    let helperFrameSwMessageMock = null;
    const swUrl = webPushConfig[WebPushConfigAttributes.SERVICE_WORKER_URL];
    const swScope = webPushConfig[WebPushConfigAttributes.SERVICE_WORKER_SCOPE];

    return setupHelperIframe().then(() => {
      helperFrameSwMessageMock = sandbox./*OK*/mock(
          iframeWindow.navigator.serviceWorker
      );
      helperFrameSwMessageMock.expects('register')
          .once()
          .withArgs(swUrl, {scope: swScope})
          .returns(Promise.resolve(true));
      return webPush.registerServiceWorker();
    }).then(() => {
      helperFrameSwMessageMock.verify();
    });
  });

  it('should forward amp-web-push-subscribe message to SW', () => {
    let iframeWindowControllerMock = null;

    return setupHelperIframe().then(() => {
      iframeWindowControllerMock =
        sandbox./*OK*/mock(iframeWindow._ampWebPushHelperFrame);
      iframeWindowControllerMock.expects('waitUntilWorkerControlsPage')
          .returns(Promise.resolve(true));
      sandbox./*OK*/stub(
          iframeWindow._ampWebPushHelperFrame,
          'messageServiceWorker').callsFake(
          message => {
            if (message.topic === 'amp-web-push-subscribe') {
              return Promise.resolve();
            }
          });
      webPush.subscribeForPushRemotely();
    });
  });

  it('should try opening popup as a window and then as a redirect', () => {
    let openWindowMock = null;

    return setupHelperIframe().then(() => {
      openWindowMock = sandbox./*OK*/mock(env.win);
      const returningPopupUrl =
        env.win.location.href +
        '?' +
        WebPushService.PERMISSION_POPUP_URL_FRAGMENT;
      openWindowMock.expects('open')
          .withArgs(
              webPushConfig['permission-dialog-url'] +
          `?return=${encodeURIComponent(returningPopupUrl)}`, '_blank')
          .onFirstCall()
          .returns();
      openWindowMock.expects('open')
          .withArgs(
              webPushConfig['permission-dialog-url'] +
          `?return=${encodeURIComponent(returningPopupUrl)}`, '_top')
          .onSecondCall()
          .returns();

      webPush.openPopupOrRedirect();
      openWindowMock.verify();
    });
  });

  it('should detect continuing subscription from permission dialog redirect',
      () => {
        env.ampdoc.win.testLocation.href =
        'https://a.com/?' + WebPushService.PERMISSION_POPUP_URL_FRAGMENT;
        expect(webPush.isContinuingSubscriptionFromRedirect()).to.eq(true);
      });

  it('should remove url fragment if continuing subscription', () => {
    webPush.initializeConfig(webPushConfig);

    const urlWithSingleParam =
      'https://a.com/?' + WebPushService.PERMISSION_POPUP_URL_FRAGMENT;
    const newUrlWithSingleParam =
      webPush.removePermissionPopupUrlFragmentFromUrl(urlWithSingleParam);
    expect(newUrlWithSingleParam).to.eq('https://a.com/');

    const urlWithMultipleParams =
      'https://a.com/?a=1&' + WebPushService.PERMISSION_POPUP_URL_FRAGMENT +
      '&b=2';
    const newUrlWithMultipleParams =
      webPush.removePermissionPopupUrlFragmentFromUrl(urlWithMultipleParams);
    expect(newUrlWithMultipleParams).to.eq('https://a.com/?a=1&b=2');
  });
});

describes.realWin('web-push-service unsubscribing', {
  amp: true,
}, env => {
  let webPush;
  const webPushConfig = {};
  let iframeWindow = null;

  function setDefaultConfigParams_() {
    webPushConfig[WebPushConfigAttributes.HELPER_FRAME_URL] =
      FAKE_IFRAME_URL;
    webPushConfig[WebPushConfigAttributes.PERMISSION_DIALOG_URL] =
      FAKE_IFRAME_URL;
    webPushConfig[WebPushConfigAttributes.SERVICE_WORKER_URL] =
      FAKE_IFRAME_URL;
    webPushConfig[WebPushConfigAttributes.SERVICE_WORKER_SCOPE] =
      FAKE_IFRAME_URL;
  }

  function setupHelperIframe() {
    webPush.initializeConfig(webPushConfig);
    return webPush.installHelperFrame(webPushConfig).then(() => {
      const helperIframe = getHelperIframe();
      iframeWindow = helperIframe.contentWindow;
      iframeWindow.WindowMessenger = WindowMessenger;
      iframeWindow.AmpWebPushHelperFrame = AmpWebPushHelperFrame;
      iframeWindow._ampWebPushHelperFrame =
        new iframeWindow.AmpWebPushHelperFrame({
          debug: true,
          windowContext: iframeWindow,
        });
      iframeWindow._ampWebPushHelperFrame
          .run(env.win.location.ancestorOrigins[0]);
      return webPush.frameMessenger_.connect(
          iframeWindow,
          '*'
      );
    });
  }

  /**
   * Returns the iframe in this testing AMP iframe that partially matches the
   * URL set in the test config. Partial matches are possible only since query
   * parameters are appended to the iframe URL.
   */
  function getHelperIframe() {
    return env.win.document.querySelector('iframe');
  }

  beforeEach(() => {
    setDefaultConfigParams_();
    webPush = new WebPushService(env.ampdoc);
  });

  it('should forward amp-web-push-unsubscribe message to SW', () => {
    let iframeWindowControllerMock = null;

    return setupHelperIframe().then(() => {
      iframeWindowControllerMock =
        sandbox./*OK*/mock(iframeWindow._ampWebPushHelperFrame);
      iframeWindowControllerMock.expects('waitUntilWorkerControlsPage')
          .returns(Promise.resolve(true));
      sandbox./*OK*/stub(
          iframeWindow._ampWebPushHelperFrame,
          'messageServiceWorker').callsFake(
          message => {
            if (message.topic === 'amp-web-push-unsubscribe') {
              return Promise.resolve();
            }
          });
      webPush.unsubscribeFromPushRemotely();
    });
  });

  it('should update widget visibilities after unsubscribing', () => {
    let unsubscribeStub = null;
    let updateWidgetStub = null;

    return setupHelperIframe().then(() => {
      unsubscribeStub = sandbox./*OK*/stub(
          webPush,
          'unsubscribeFromPushRemotely').callsFake(
          () => Promise.resolve()
      );
      updateWidgetStub = sandbox./*OK*/stub(
          webPush,
          'updateWidgetVisibilities').callsFake(
          () => Promise.resolve()
      );

      // We've mocked default notification permissions
      return webPush.unsubscribe();
    }).then(() => {
      expect(unsubscribeStub.calledOnce).to.eq(true);
      expect(updateWidgetStub.calledOnce).to.eq(true);
    });
  });
});
