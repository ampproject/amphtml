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

import {WindowMessenger} from '../window-messenger';
import {AmpWebPushHelperFrame} from '../amp-web-push-helper-frame';
import {WebPushService} from '../web-push-service';
import {WebPushWidgetVisibilities} from '../amp-web-push-widget';
import {TAG, NotificationPermission} from '../vars';
import {toggleExperiment} from '../../../../src/experiments';
import {WebPushConfigAttributes} from '../amp-web-push-config';
import * as sinon from 'sinon';

const FAKE_IFRAME_URL =
  '//ads.localhost:9876/test/fixtures/served/iframe-stub.html#';

describes.realWin('web-push-service environment support', {
  amp: true,
}, env => {
  let webPush;

  beforeEach(() => {
    toggleExperiment(env.win, TAG, true);
    webPush = new WebPushService(env.ampdoc);
  });

  afterEach(() => {
    toggleExperiment(env.win, TAG, false);
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
});

describes.realWin('web-push-service helper frame messaging', {
  amp: true,
}, env => {
  let webPush;
  const webPushConfig = {};
  let iframeWindow = null;
  let sandbox = null;

  function setDefaultConfigParams_() {
    webPushConfig[WebPushConfigAttributes.HELPER_FRAME_URL] =
      FAKE_IFRAME_URL;
    webPushConfig[WebPushConfigAttributes.PERMISSION_DIALOG_URL] =
      FAKE_IFRAME_URL;
    webPushConfig[WebPushConfigAttributes.SERVICE_WORKER_URL] =
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
    toggleExperiment(env.win, TAG, true);
    webPush = new WebPushService(env.ampdoc);
    sandbox = sinon.sandbox.create();
  });

  afterEach(() => {
    toggleExperiment(env.win, TAG, false);
    sandbox.restore();
  });

  it('should create helper iframe on document', () => {
    webPush.initializeConfig(webPushConfig);
    return webPush.installHelperFrame(webPushConfig).then(() => {
      expect(getHelperIframe()).to.not.be.null;
    });
  });

  it('should receive reply from helper iframe for permission query', () => {
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
  let sandbox = null;

  function setDefaultConfigParams_() {
    webPushConfig[WebPushConfigAttributes.HELPER_FRAME_URL] =
      FAKE_IFRAME_URL;
    webPushConfig[WebPushConfigAttributes.PERMISSION_DIALOG_URL] =
      FAKE_IFRAME_URL;
    webPushConfig[WebPushConfigAttributes.SERVICE_WORKER_URL] =
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
    toggleExperiment(env.win, TAG, true);
    webPush = new WebPushService(env.ampdoc);
    sandbox = sinon.sandbox.create();
  });

  afterEach(() => {
    toggleExperiment(env.win, TAG, false);
    sandbox.restore();
  });

  it('should show blocked widget if permission query returns blocked', () => {
    let spy = null;
    return setupHelperIframe().then(() => {
      spy = sandbox./*OK*/spy(webPush, 'setWidgetVisibilities');

      sandbox./*OK*/stub(
          webPush,
          'queryNotificationPermission',
          () => Promise.resolve(NotificationPermission.DENIED)
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
              webPush, 'querySubscriptionStateRemotely',
              () => Promise.resolve(true)
      );
          sandbox./*OK*/stub(
              webPush, 'isServiceWorkerActivated',
              () => Promise.resolve(true)
      );
          sandbox./*OK*/stub(
              webPush, 'queryNotificationPermission',
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
              'isServiceWorkerActivated',
              () => Promise.resolve(false)
      );
          sandbox./*OK*/stub(
              webPush,
              'queryNotificationPermission',
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
          'querySubscriptionStateRemotely',
          () => Promise.resolve(false)
      );
      sandbox./*OK*/stub(
          webPush,
          'isServiceWorkerActivated',
          () => Promise.resolve(true)
      );
      sandbox./*OK*/stub(
          webPush,
          'queryNotificationPermission',
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

  it('should forward amp-web-push-subscription-state message to SW', done => {
    let iframeWindowControllerMock = null;

    return setupHelperIframe().then(() => {
      sandbox./*OK*/stub(
          webPush,
          'isServiceWorkerActivated',
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
          'messageServiceWorker',
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
  let sandbox = null;

  function setDefaultConfigParams_() {
    webPushConfig[WebPushConfigAttributes.HELPER_FRAME_URL] =
      FAKE_IFRAME_URL;
    webPushConfig[WebPushConfigAttributes.PERMISSION_DIALOG_URL] =
      FAKE_IFRAME_URL;
    webPushConfig[WebPushConfigAttributes.SERVICE_WORKER_URL] =
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
    toggleExperiment(env.win, TAG, true);
    webPush = new WebPushService(env.ampdoc);
    sandbox = sinon.sandbox.create();
  });

  afterEach(() => {
    toggleExperiment(env.win, TAG, false);
    sandbox.restore();
  });

  it('should register service worker', () => {
    let helperFrameSwMessageMock = null;

    return setupHelperIframe().then(() => {
      helperFrameSwMessageMock = sandbox./*OK*/mock(
          iframeWindow.navigator.serviceWorker
      );
      helperFrameSwMessageMock.expects('register')
          .once()
          .withArgs(
          webPushConfig[WebPushConfigAttributes.SERVICE_WORKER_URL],
          {
            scope: '/',
          })
          .returns(Promise.resolve(true));

      return webPush.registerServiceWorker();
    }).then(() => {
      helperFrameSwMessageMock.verify();
    });
  });

  it('should forward amp-web-push-subscribe message to SW', done => {
    let iframeWindowControllerMock = null;

    return setupHelperIframe().then(() => {
      iframeWindowControllerMock =
        sandbox./*OK*/mock(iframeWindow._ampWebPushHelperFrame);
      iframeWindowControllerMock.expects('waitUntilWorkerControlsPage')
          .returns(Promise.resolve(true));
      sandbox./*OK*/stub(
          iframeWindow._ampWebPushHelperFrame,
          'messageServiceWorker',
          message => {
            if (message.topic === 'amp-web-push-subscribe') {
              done();
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
  let sandbox = null;

  function setDefaultConfigParams_() {
    webPushConfig[WebPushConfigAttributes.HELPER_FRAME_URL] =
      FAKE_IFRAME_URL;
    webPushConfig[WebPushConfigAttributes.PERMISSION_DIALOG_URL] =
      FAKE_IFRAME_URL;
    webPushConfig[WebPushConfigAttributes.SERVICE_WORKER_URL] =
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
    toggleExperiment(env.win, TAG, true);
    webPush = new WebPushService(env.ampdoc);
    sandbox = sinon.sandbox.create();
  });

  afterEach(() => {
    toggleExperiment(env.win, TAG, false);
    sandbox.restore();
  });

  it('should forward amp-web-push-unsubscribe message to SW', done => {
    let iframeWindowControllerMock = null;

    return setupHelperIframe().then(() => {
      iframeWindowControllerMock =
        sandbox./*OK*/mock(iframeWindow._ampWebPushHelperFrame);
      iframeWindowControllerMock.expects('waitUntilWorkerControlsPage')
          .returns(Promise.resolve(true));
      sandbox./*OK*/stub(
          iframeWindow._ampWebPushHelperFrame,
          'messageServiceWorker',
          message => {
            if (message.topic === 'amp-web-push-unsubscribe') {
              done();
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
          'unsubscribeFromPushRemotely',
          () => Promise.resolve()
      );
      updateWidgetStub = sandbox./*OK*/stub(
          webPush,
          'updateWidgetVisibilities',
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
