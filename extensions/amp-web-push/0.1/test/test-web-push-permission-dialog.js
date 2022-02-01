import {parseUrlDeprecated} from '../../../../src/url';
import {WebPushConfigAttributes} from '../amp-web-push-config';
import {AmpWebPushPermissionDialog} from '../amp-web-push-permission-dialog';
import {WebPushService} from '../web-push-service';
import {WindowMessenger} from '../window-messenger';

const FAKE_IFRAME_URL =
  '//ads.localhost:9876/test/fixtures/served/iframe-stub.html#';

describes.realWin(
  'web-push-permission-dialog',
  {
    amp: true,
  },
  (env) => {
    let webPush;
    const webPushConfig = {};
    let iframeWindow = null;

    function setDefaultConfigParams_() {
      webPushConfig[WebPushConfigAttributes.HELPER_FRAME_URL] = FAKE_IFRAME_URL;
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

    // TODO(dvoytenko, #12476): Make this test work with sinon 4.0.
    it.skip('should detect opened as popup', () => {
      return setupPermissionDialogFrame().then(() => {
        env.sandbox./*OK*/ stub(iframeWindow, 'opener').callsFake(true);
        const isCurrentDialogPopup =
          iframeWindow._ampWebPushPermissionDialog.isCurrentDialogPopup();
        expect(isCurrentDialogPopup).to.eq(true);
      });
    });

    it('should detect opened from redirect', () => {
      return setupPermissionDialogFrame().then(() => {
        env.sandbox./*OK*/ stub(iframeWindow, 'opener').callsFake(false);
        iframeWindow.fakeLocation = parseUrlDeprecated(
          'https://test.com/?return=' +
            encodeURIComponent('https://another-site.com')
        );
        env.sandbox
          ./*OK*/ stub(
            iframeWindow._ampWebPushPermissionDialog,
            'requestNotificationPermission'
          )
          .callsFake(() => Promise.resolve());
        const spy = env.sandbox./*OK*/ spy(
          iframeWindow._ampWebPushPermissionDialog,
          'isCurrentDialogPopup'
        );
        iframeWindow._ampWebPushPermissionDialog.run();
        expect(spy.returned(true)).to.eq(false);
      });
    });

    // TODO(jasonpang): This fails during CI under headless Chrome.
    it.skip('should request notification permissions, when opened as popup', () => {
      return setupPermissionDialogFrame().then(() => {
        env.sandbox
          ./*OK*/ stub(
            iframeWindow._ampWebPushPermissionDialog,
            'isCurrentDialogPopup'
          )
          .callsFake(() => true);
        const permissionStub = env.sandbox
          ./*OK*/ stub(iframeWindow.Notification, 'requestPermission')
          .callsFake(() => Promise.resolve('default'));
        iframeWindow._ampWebPushPermissionDialog.run();
        expect(permissionStub).to.have.been.calledOnce;
      });
    });

    // TODO(jasonpang): This fails during CI under headless Chrome.
    it.skip('should request notification permissions when redirected', () => {
      return setupPermissionDialogFrame().then(() => {
        env.sandbox
          ./*OK*/ stub(
            iframeWindow._ampWebPushPermissionDialog,
            'isCurrentDialogPopup'
          )
          .callsFake(() => false);
        iframeWindow.fakeLocation = parseUrlDeprecated(
          'https://test.com/?return=' +
            encodeURIComponent('https://another-site.com')
        );
        const permissionStub = env.sandbox
          ./*OK*/ stub(iframeWindow.Notification, 'requestPermission')
          .callsFake(() => Promise.resolve('default'));
        iframeWindow._ampWebPushPermissionDialog.run();
        expect(permissionStub).to.have.been.calledOnce;
      });
    });

    // TODO(jasonpang): This fails during CI under headless Chrome.
    it.skip('should redirect back to original site, when redirected', () => {
      let spy = null;
      return setupPermissionDialogFrame()
        .then(() => {
          env.sandbox
            ./*OK*/ stub(
              iframeWindow._ampWebPushPermissionDialog,
              'isCurrentDialogPopup'
            )
            .callsFake(() => false);
          iframeWindow.fakeLocation = parseUrlDeprecated(
            'https://test.com/?return=' +
              encodeURIComponent('https://another-site.com')
          );
          env.sandbox
            ./*OK*/ stub(
              iframeWindow._ampWebPushPermissionDialog,
              'requestNotificationPermission'
            )
            .callsFake(() => Promise.resolve());
          env.sandbox
            ./*OK*/ stub(iframeWindow.Notification, 'requestPermission')
            .callsFake(() => Promise.resolve('default'));
          spy = env.sandbox./*OK*/ spy(
            iframeWindow._ampWebPushPermissionDialog,
            'redirectToUrl'
          );
          return iframeWindow._ampWebPushPermissionDialog.run();
        })
        .then(() => {
          expect(spy.withArgs('https://another-site.com')).to.have.been
            .calledOnce;
        });
    });

    it('should hide preload section and show postload section', () => {
      return setupPermissionDialogFrame().then(() => {
        const preTestString = '<div id="preload"/><div id="postload"/>';
        iframeWindow.document.body.innerHTML = preTestString;
        iframeWindow._ampWebPushPermissionDialog.showPostloadSection_();
        const {document} = iframeWindow;
        const preloadDom = document.querySelector('#preload');
        const postloadDom = document.querySelector('#postload');
        expect(preloadDom.classList.contains('invisible')).to.eq(true);
        expect(postloadDom.classList.contains('invisible')).to.eq(false);
      });
    });

    it('should show target permission section', () => {
      return setupPermissionDialogFrame().then(() => {
        env.sandbox.defineProperty(iframeWindow.Notification, 'permission', {
          enumerable: false,
          writable: false,
          value: 'granted',
        });
        const preTestString =
          '<div permission="default"/>' +
          '<div permission="granted"/>' +
          '<div permission="denied"/>';
        iframeWindow.document.body.innerHTML = preTestString;
        iframeWindow._ampWebPushPermissionDialog.showTargetPermissionSection_();
        const {document} = iframeWindow;
        const defaultElement = document.querySelector('[permission=default]');
        const grantedElement = document.querySelector('[permission=granted]');
        const deniedElement = document.querySelector('[permission=denied]');
        expect(defaultElement.classList.contains('invisible')).to.eq(true);
        expect(grantedElement.classList.contains('invisible')).to.eq(false);
        expect(deniedElement.classList.contains('invisible')).to.eq(true);
      });
    });

    it('should store notification permission', () => {
      return setupPermissionDialogFrame().then(() => {
        expect(
          localStorage.getItem('amp-web-push-notification-permission')
        ).to.eq(null);

        env.sandbox.defineProperty(iframeWindow.Notification, 'permission', {
          enumerable: false,
          writable: false,
          value: 'granted',
        });

        iframeWindow._ampWebPushPermissionDialog.storeNotificationPermission_();
        expect(
          localStorage.getItem('amp-web-push-notification-permission')
        ).to.eq('granted');
      });
    });

    // (#19990) filed issue for failing test
    it.skip('clicking close icon should attempt to close dialog', () => {
      let spy = null;
      return setupPermissionDialogFrame().then(() => {
        const preTestString = '<div id="close"/>';
        iframeWindow.document.body.innerHTML = preTestString;
        iframeWindow._ampWebPushPermissionDialog.onCloseIconClick_();
        const {document} = iframeWindow;
        const closeElement = document.querySelector('#close');
        spy = env.sandbox./*OK*/ spy(
          iframeWindow._ampWebPushPermissionDialog,
          'closeDialog'
        );
        closeElement.click();
        expect(spy).to.have.been.calledOnce;
      });
    });
  }
);
