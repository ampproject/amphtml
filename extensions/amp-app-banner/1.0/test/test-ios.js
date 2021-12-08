import {platformService} from '#preact/services/platform';
import {getIOSAppInfo} from '../component/ios';

describes.sandboxed('BentoAppBanner preact component v1.0', {}, (env) => {
  describe('getIOSAppInfo', () => {
    describe('when no meta header is present', () => {
      it('should return null when no meta header is present', () => {
        const iosInfo = getIOSAppInfo();
        expect(iosInfo).to.be.null;
      });
    });

    describe('when meta header is present', () => {
      beforeEach(() => {
        // Inject a tag like: <meta name="apple-itunes-app" content="..." />
        const meta = document.createElement('meta');
        meta.setAttribute('id', 'TEST_META');
        meta.setAttribute('name', 'apple-itunes-app');
        meta.setAttribute(
          'content',
          'app-id=11111111,app-argument=https://test.com/deep-link'
        );
        document.head.appendChild(meta);
      });
      afterEach(() => {
        document.getElementById('TEST_META').remove();
      });

      it('should parse the meta header and determine appropriate urls', () => {
        const iosInfo = getIOSAppInfo();
        expect(iosInfo).to.not.be.null;
        expect(iosInfo).to.have.property('openOrInstall');
        expect(iosInfo.installAppUrl).to.equal(
          'https://itunes.apple.com/us/app/id11111111'
        );
        expect(iosInfo.openInAppUrl).to.equal('https://test.com/deep-link');
      });

      it('should not show the banner if the built-in banner can be shown', () => {
        env.sandbox.stub(platformService, 'isSafari').returns(true);
        expect(getIOSAppInfo()).to.be.null;
      });

      it('should load the app when clicked', () => {
        env.sandbox.stub(window, 'open');
        const appInfo = getIOSAppInfo();
        appInfo.openOrInstall();
        expect(window.open).to.have.been.calledWith(
          appInfo.openInAppUrl,
          '_top',
          undefined
        );
      });

      it('should warn if the app-argument is missing', () => {
        document
          .getElementById('TEST_META')
          .setAttribute('content', 'app-id=11111111');
        expectAsyncConsoleError(/... should contain app-argument to allow .../);
        const appInfo = getIOSAppInfo();
        expect(appInfo?.installAppUrl).to.equal(
          'https://itunes.apple.com/us/app/id11111111'
        );
        expect(appInfo.openInAppUrl).to.equal(appInfo.installAppUrl);
      });
    });
  });
});
