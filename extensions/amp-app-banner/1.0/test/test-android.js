import {WindowInterface} from '#core/window/interface';

import {docInfo} from '#preact/utils/docInfo';
import {platformUtils} from '#preact/utils/platform';
import {xhrUtils} from '#preact/utils/xhr';

import {getAndroidAppInfo} from '../utils/android';

describes.sandboxed('BentoAppBanner preact component v1.0', {}, (env) => {
  let xhrServiceStub;
  beforeEach(() => {
    xhrServiceStub = env.sandbox.stub(xhrUtils);
    env.sandbox
      .stub(docInfo, 'canonicalUrl')
      .get(() => 'https://test.com/canonicalUrl');
  });

  describe('getAndroidAppInfo', () => {
    describe('when no manifest link is present', () => {
      it('should return null when no meta header is present', () => {
        const appInfo = getAndroidAppInfo();
        expect(appInfo).to.be.null;
      });
    });

    describe('when manifest link is present', () => {
      let clock;
      beforeEach(() => {
        clock = env.sandbox.useFakeTimers();

        // Mock data fetching:
        const mockManifest = {
          'related_applications': [{platform: 'play', id: '11111111'}],
        };
        xhrServiceStub.fetchJson.resolves(mockManifest);

        // Mock the <link> manifest:
        const link = document.createElement('link');
        link.setAttribute('id', 'TEST_LINK');
        link.setAttribute('rel', 'manifest');
        link.setAttribute('href', 'https://test.com/manifest');
        document.head.appendChild(link);
      });
      afterEach(() => {
        document.getElementById('TEST_LINK').remove();
      });

      it('should not show a banner if a built-in banner can be shown', async () => {
        env.sandbox.stub(platformUtils, 'isChrome').returns(true);
        env.sandbox.stub(platformUtils, 'isAndroid').returns(true);
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
        const location = {assign: env.sandbox.stub()};
        env.sandbox.stub(window, 'open');
        env.sandbox.stub(WindowInterface, 'getTop').returns({location});

        const appInfo = getAndroidAppInfo();
        const manifest = await appInfo.promise;
        await appInfo.openOrInstall();
        expect(window.open)
          .to.have.callCount(1)
          .calledWith(manifest.openInAppUrl, '_top');

        clock.tick(5_000);

        expect(location.assign)
          .to.have.callCount(1)
          .calledWith(manifest.installAppUrl);
      });

      const invalidManifest1 = `BENTO-APP-BANNER Invalid manifest: related_applications is missing from manifest.json file`;
      const invalidManifest2 = `BENTO-APP-BANNER Invalid manifest: Could not find a platform=play app in manifest`;

      it('should not show a banner if the manifest is missing data', async () => {
        expectAsyncConsoleError(invalidManifest1);
        xhrServiceStub.fetchJson.resolves({});
        expect(await getAndroidAppInfo().promise).to.be.null;

        expectAsyncConsoleError(invalidManifest2);
        xhrServiceStub.fetchJson.resolves({
          'related_applications': [{platform: 'INVALID'}],
        });
        expect(await getAndroidAppInfo().promise).to.be.null;
      });
    });
  });
});
