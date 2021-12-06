import { getAndroidAppInfo } from "../component/android";
import { docInfoService } from "#preact/services/document";
import { xhrService } from "#preact/services/xhr";

describes.sandboxed('BentoAppBanner preact component v1.0', {}, (env) => {
  let xhrServiceStub;
  let canonicalUrlStub;
  beforeEach(() => {
    xhrServiceStub = env.sandbox.stub(xhrService);
    canonicalUrlStub = env.sandbox.stub(docInfoService, 'canonicalUrl');
  });

  describe("getAndroidAppInfo", () => {
    describe("when no manifest link is present", () => {
      it("should return null when no meta header is present", () => {
        const appInfo = getAndroidAppInfo();
        expect(appInfo).to.be.null;
      });
    });

    describe("when manifest link is present", () => {
      beforeEach(() => {
        // Inject a tag like: <link rel="manifest" href="..." />
        const link = document.createElement('link');
        link.setAttribute('rel', 'manifest');
        link.setAttribute('href', 'https://test.com/manifest');
        document.head.appendChild(link);
      });

      beforeEach(() => {
        const mockManifest = {
          "related_applications": [
            { platform: "play", id: "11111111" }
          ]
        };
        xhrServiceStub.fetchJson.returns(Promise.resolve(mockManifest))

        canonicalUrlStub.get(() => 'https://test.com/canonicalUrl');
      });

      it("should parse the meta header and determine appropriate urls", async () => {
        const appInfo = getAndroidAppInfo();
        expect(appInfo).to.not.be.null;
        expect(appInfo).to.have.property('openOrInstall');
        const manifestInfo = await appInfo.promise;

        expect(manifestInfo.installAppUrl).to.equal('https://play.google.com/store/apps/details?id=11111111');
        expect(manifestInfo.openInAppUrl).to.equal('android-app://11111111/https/test.com/canonicalUrl');
      });
    });

  });
});
