import { htmlFor } from "#core/dom/static-template";
import { toggleExperiment } from "#experiments";
import "../amp-app-banner";
import { waitFor } from "#testing/helpers/service";

describes.realWin(
  "amp-app-banner-v1.0",
  {
    amp: {
      extensions: [ "amp-app-banner:1.0" ]
    }
  },
  (env) => {
    let win;
    let doc;
    let html;

    beforeEach(async () => {
      win = env.win;
      doc = win.document;
      html = htmlFor(doc);
      toggleExperiment(win, "bento-app-banner", true, true);
    });

    async function mountElement(element) {
      doc.body.appendChild(element);
      await element.buildInternal();
      await waitFor(() => element.isConnected, 'element connected');
      return element;
    }

    it("should not render an element without an id", async () => {
      const err = /bento-app-banner should have an id/;
      expectAsyncConsoleError(err, 2);
      await expect(mountElement(html`
        <amp-app-banner />
      `)).to.be.rejectedWith(err);
    });

    it("renders the element", async () => {
      const element = await mountElement(html`
        <amp-app-banner id="TEST">
          <h2>Our app is way better</h2>
          <button open-button>Get the app</button>
        </amp-app-banner>
      `);

      // TODO: add assertions here
    });
  }
);
