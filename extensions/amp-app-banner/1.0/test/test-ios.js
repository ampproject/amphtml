import {getIOSAppInfo} from '../component/ios';

describes.sandboxed('BentoAppBanner preact component v1.0', {}, () => {
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
        meta.setAttribute('name', 'apple-itunes-app');
        meta.setAttribute(
          'content',
          'app-id=11111111,app-argument=https://test.com/deep-link'
        );
        document.head.appendChild(meta);
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
    });
  });
});
