import {logger} from '#preact/logger';
import {platformUtils} from '#preact/utils/platform';

import {getIOSAppInfo} from '../utils/ios';

describes.sandboxed('BentoAppBanner preact component v1.0', {}, (env) => {
  describe('getIOSAppInfo', () => {
    describe('when no meta header is present', () => {
      it('should return null when no meta header is present', () => {
        allowConsoleError(() => {
          const iosInfo = getIOSAppInfo();
          expect(iosInfo).to.be.null;
        });
        expect(logger.error).calledWith(
          'BENTO-APP-BANNER',
          'Not rendering bento-app-banner:',
          'could not find a <meta name="apple-itunes-app" /> tag'
        );
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

      let clock;
      beforeEach(() => {
        clock = env.sandbox.useFakeTimers();
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
        env.sandbox.stub(platformUtils, 'isSafari').returns(true);
        expect(getIOSAppInfo()).to.be.null;
        expect(logger.info).calledWith(
          'BENTO-APP-BANNER',
          'Not rendering bento-app-banner:',
          'Browser supports builtin banners.'
        );
      });

      it('should load the app when clicked', () => {
        env.sandbox.stub(window, 'open');
        const appInfo = getIOSAppInfo();
        appInfo.openOrInstall();
        expect(window.open).to.have.callCount(1);
        expect(window.open).to.have.calledWith(appInfo.openInAppUrl, '_top');

        clock.tick(5_000);
        expect(window.open).to.have.callCount(2);
        expect(window.open).to.have.calledWith(appInfo.installAppUrl, '_top');
      });

      it('should warn if the app-argument is missing', () => {
        document
          .getElementById('TEST_META')
          .setAttribute('content', 'app-id=11111111');
        const appInfo = getIOSAppInfo();
        expect(appInfo?.installAppUrl).to.equal(
          'https://itunes.apple.com/us/app/id11111111'
        );
        expect(appInfo.openInAppUrl).to.equal(appInfo.installAppUrl);
        expect(logger.warn).calledWith(
          'BENTO-APP-BANNER',
          '<meta name="apple-itunes-app">\'s content should contain app-argument to allow opening an already installed application on iOS.'
        );
      });
    });
  });
});
