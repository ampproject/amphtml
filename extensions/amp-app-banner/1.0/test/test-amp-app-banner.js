import {htmlFor} from '#core/dom/static-template';

import {toggleExperiment} from '#experiments';

import '../amp-app-banner';
import {platformService} from '#preact/services/platform';
import {waitFor} from '#testing/helpers/service';

describes.realWin(
  'amp-app-banner-v1.0',
  {
    amp: {
      extensions: ['amp-app-banner:1.0'],
    },
  },
  (env) => {
    let win;
    let doc;
    let html;

    beforeEach(async () => {
      win = env.win;
      doc = win.document;
      html = htmlFor(doc);
      toggleExperiment(win, 'bento-app-banner', true, true);
    });

    // Mock the platform:
    beforeEach(() => {
      env.sandbox.stub(platformService, 'isIos').returns(true);
      env.sandbox.stub(platformService, 'isSafari').returns(false);
    });
    // Add necessary meta tag:
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

    async function mountElement(element) {
      doc.body.appendChild(element);
      await element.buildInternal();
      await waitFor(() => element.isConnected, 'element connected');
      await waitFor(
        () => element.shadowRoot.querySelector('div'),
        'shadow root ready'
      );
      return element;
    }

    it('should not render an element without an id', async () => {
      const err = /bento-app-banner should have an id/;
      expectAsyncConsoleError(err, 2);
      await expect(
        mountElement(html`<amp-app-banner></amp-app-banner>`)
      ).to.be.rejectedWith(err);
    });

    it('should log an error if <button open-button> is missing', async () => {
      const err =
        /bento-app-banner should contain a <button open-button> child/;
      expectAsyncConsoleError(err, 2);
      await mountElement(html`<amp-app-banner id="TEST"></amp-app-banner>`);
    });

    describe('when the element is rendered', () => {
      /**
       * @type {Element}
       */
      let element;
      beforeEach(async () => {
        element = await mountElement(html`
          <amp-app-banner nodisplay="true" id="TEST">
            <h2>Our app is way better</h2>
            <button open-button>Get the app</button>
          </amp-app-banner>
        `);
      });

      it('the light dom is visible', async () => {
        expect(element.querySelector('h2')).to.be.not.null;
        expect(element.querySelector('button[open-button]')).to.be.not.null;
      });

      it('the shadow dom is mounted', async () => {
        expect(element.shadowRoot.querySelector('div')).to.be.not.null;
        expect(element.shadowRoot.querySelector('button[aria-label="Dismiss"]'))
          .to.be.not.null;
      });
    });
  }
);
