import {docInfoService} from '#preact/services/document';
import {platformService} from '#preact/services/platform';
import {xhrService} from '#preact/services/xhr';

import {getAndroidAppInfo} from '../component/android';

describes.sandboxed('BentoAppBanner preact component v1.0', {}, (env) => {
  let xhrServiceStub;
  let canonicalUrlStub;
  beforeEach(() => {
    xhrServiceStub = env.sandbox.stub(xhrService);
    canonicalUrlStub = env.sandbox.stub(docInfoService, 'canonicalUrl');
  });

  describe('getAndroidAppInfo', () => {
    describe('when no manifest link is present', () => {
      it('should return null when no meta header is present', () => {
        const appInfo = getAndroidAppInfo();
        expect(appInfo).to.be.null;
      });
    });

    describe('when manifest link is present', () => {
      // Mock <link> manifest:
      beforeEach(() => {
        // Inject a tag like: <link rel="manifest" href="..." />
        const link = document.createElement('link');
        link.setAttribute('rel', 'manifest');
        link.setAttribute('href', 'https://test.com/manifest');
        document.head.appendChild(link);
      });

      // Mock data fetching:
      beforeEach(() => {
        const mockManifest = {
          'related_applications': [{platform: 'play', id: '11111111'}],
        };
        xhrServiceStub.fetchJson.resolves(mockManifest);

        canonicalUrlStub.get(() => 'https://test.com/canonicalUrl');
      });

      it('should not show a banner if a built-in banner can be shown', async () => {
        env.sandbox.stub(platformService, 'isChrome').returns(true);
        env.sandbox.stub(platformService, 'isAndroid').returns(true);
        const appInfo = getAndroidAppInfo();
        expect(appInfo).to.be.null;
      });

      it('should parse the meta header and determine appropriate urls', async () => {
        const appInfo = getAndroidAppInfo();
        expect(appInfo).to.not.be.null;
        expect(appInfo).to.have.property('openOrInstall');
        const manifestInfo = await appInfo.promise;

        expect(manifestInfo.installAppUrl).to.equal(
          'https://play.google.com/store/apps/details?id=11111111'
        );
        expect(manifestInfo.openInAppUrl).to.equal(
          'android-app://11111111/https/test.com/canonicalUrl'
        );
      });

      it('clicking "Open" should open the app URL', async () => {
        env.sandbox.stub(window, 'open');

        const appInfo = getAndroidAppInfo();
        const manifestInfo = await appInfo.promise;
        await appInfo.openOrInstall();
        expect(window.open).to.have.been.calledWith(
          manifestInfo.openInAppUrl,
          '_top',
          undefined
        );
      });

      it('should not show a banner if the manifest is missing data', async () => {
        xhrServiceStub.fetchJson.resolves({});
        expect(await getAndroidAppInfo().promise).to.be.null;

        xhrServiceStub.fetchJson.resolves({
          'related_applications': [{platform: 'INVALID'}],
        });
        expect(await getAndroidAppInfo().promise).to.be.null;
      });
    });
  });
});
