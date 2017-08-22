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
import {AmpWebPushPermissionDialog} from '../amp-web-push-permission-dialog';
import {WebPushService} from '../web-push-service';
import {WebPushConfigAttributes} from '../amp-web-push-config';
import {parseUrl} from '../../../../src/url';

const FAKE_IFRAME_URL =
  '//ads.localhost:9876/test/fixtures/served/iframe-stub.html#';


describes.realWin('web-push-permission-dialog', {
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
  }

  /**
   * Returns the iframe in this testing AMP iframe that partially matches the
   * URL set in the test config. Partial matches are possible only since query
   * parameters are appended to the iframe URL.
   */
  function getHelperIframe() {
    return env.win.document.querySelector('iframe');
  }

  function setupPermissionDialogFrame() {
    webPush.initializeConfig(webPushConfig);
    return webPush.installHelperFrame(webPushConfig).then(() => {
      const helperIframe = getHelperIframe();
      iframeWindow = helperIframe.contentWindow;
      iframeWindow.WindowMessenger = WindowMessenger;
      iframeWindow.AmpWebPushPermissionDialog = AmpWebPushPermissionDialog;
      iframeWindow._ampWebPushPermissionDialog =
        new iframeWindow.AmpWebPushPermissionDialog({
          debug: true,
          windowContext: iframeWindow,
        });
    });
  }

  beforeEach(() => {
    setDefaultConfigParams_();
    webPush = new WebPushService(env.ampdoc);
  });

  it('should detect opened as popup', () => {
    return setupPermissionDialogFrame().then(() => {
      sandbox./*OK*/stub(iframeWindow, 'opener', true);
      sandbox./*OK*/stub(
          iframeWindow._ampWebPushPermissionDialog,
          'requestNotificationPermission',
          () => Promise.resolve()
      );
      const spy = sandbox./*OK*/spy(
          iframeWindow._ampWebPushPermissionDialog,
          'isCurrentDialogPopup'
      );
      iframeWindow._ampWebPushPermissionDialog.run();
      expect(spy.returned(true)).to.eq(true);
    });
  });

  it('should detect opened from redirect', () => {
    return setupPermissionDialogFrame().then(() => {
      sandbox./*OK*/stub(iframeWindow, 'opener', false);
      iframeWindow.fakeLocation = parseUrl('https://test.com/?return=' +
        encodeURIComponent('https://another-site.com'));
      sandbox./*OK*/stub(
          iframeWindow._ampWebPushPermissionDialog,
          'requestNotificationPermission',
          () => Promise.resolve()
      );
      const spy = sandbox./*OK*/spy(
          iframeWindow._ampWebPushPermissionDialog,
          'isCurrentDialogPopup'
      );
      iframeWindow._ampWebPushPermissionDialog.run();
      expect(spy.returned(true)).to.eq(false);
    });
  });

  it('should request notification permissions, when opened as popup', () => {
    return setupPermissionDialogFrame().then(() => {
      sandbox./*OK*/stub(
          iframeWindow._ampWebPushPermissionDialog,
          'isCurrentDialogPopup',
          () => true
      );
      const permissionStub = sandbox./*OK*/stub(
          iframeWindow.Notification,
          'requestPermission',
          () => Promise.resolve('default')
      );
      iframeWindow._ampWebPushPermissionDialog.run();
      expect(permissionStub.calledOnce).to.eq(true);
    });
  });

  it('should request notification permissions when redirected', () => {
    return setupPermissionDialogFrame().then(() => {
      sandbox./*OK*/stub(
          iframeWindow._ampWebPushPermissionDialog,
          'isCurrentDialogPopup',
          () => false
      );
      iframeWindow.fakeLocation = parseUrl('https://test.com/?return=' +
        encodeURIComponent('https://another-site.com'));
      const permissionStub = sandbox./*OK*/stub(
          iframeWindow.Notification,
          'requestPermission',
          () => Promise.resolve('default')
      );
      iframeWindow._ampWebPushPermissionDialog.run();
      expect(permissionStub.calledOnce).to.eq(true);
    });
  });

  it('should close popup, when opened as popup', () => {
    let closeStub = null;
    return setupPermissionDialogFrame().then(() => {
      sandbox./*OK*/stub(
          iframeWindow._ampWebPushPermissionDialog,
          'isCurrentDialogPopup', () => true
      );
      sandbox./*OK*/stub(
          iframeWindow._ampWebPushPermissionDialog,
          'requestNotificationPermission',
          () => Promise.resolve()
      );
      closeStub = sandbox./*OK*/stub(
          iframeWindow,
          'close',
          null);
      sandbox./*OK*/stub(
          iframeWindow.Notification,
          'requestPermission',
          () => Promise.resolve('default')
      );
      sandbox./*OK*/stub(
          iframeWindow._ampWebPushPermissionDialog.ampMessenger_,
          'send',
          () => Promise.resolve([{closeFrame: true}])
      );
      return iframeWindow._ampWebPushPermissionDialog.run();
    }).then(() => {
      expect(closeStub.calledOnce).to.eq(true);
    });
  });

  it('should redirect back to original site, when redirected', () => {
    let spy = null;
    return setupPermissionDialogFrame().then(() => {
      sandbox./*OK*/stub(
          iframeWindow._ampWebPushPermissionDialog,
          'isCurrentDialogPopup',
          () => false
      );
      iframeWindow.fakeLocation = parseUrl('https://test.com/?return=' +
        encodeURIComponent('https://another-site.com'));
      sandbox./*OK*/stub(
          iframeWindow._ampWebPushPermissionDialog,
          'requestNotificationPermission',
          () => Promise.resolve()
      );
      sandbox./*OK*/stub(
          iframeWindow.Notification,
          'requestPermission',
          () => Promise.resolve('default')
      );
      spy = sandbox./*OK*/spy(
          iframeWindow._ampWebPushPermissionDialog,
          'redirectToUrl'
      );
      return iframeWindow._ampWebPushPermissionDialog.run();
    }).then(() => {
      expect(spy.withArgs('https://another-site.com').calledOnce).to.eq(true);
    });
  });
});
