import {htmlFor} from '#core/dom/static-template';

import {toggleExperiment} from '#experiments';

import {logger} from '#preact/logger';
import {platformUtils} from '#preact/utils/platform';

import {waitFor} from '#testing/helpers/service';
import '../amp-app-banner';

describes.realWin(
  'amp-app-banner-v1.0',
  {
    amp: {
      extensions: ['amp-app-banner:1.0'],
    },
  },
  (env) => {
    let doc;
    let html;

    beforeEach(async () => {
      doc = env.win.document;
      html = htmlFor(doc);
      toggleExperiment(env.win, 'bento-app-banner', true, true);

      // Mock the platform:
      env.sandbox.stub(platformUtils, 'isIos').returns(true);
      env.sandbox.stub(platformUtils, 'isSafari').returns(false);

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
      // Remove the injected <meta> tag:
      document.getElementById('TEST_META').remove();
    });

    async function mountElement(element) {
      doc.body.appendChild(element);
      await element.buildInternal();
      await waitFor(() => element.isConnected, 'element connected');
      return element;
    }

    const missingButtonError = `BENTO-APP-BANNER Component children should contain a <button open-button>`;

    it('should warn when id is missing', async () => {
      expectAsyncConsoleError(missingButtonError);
      await mountElement(html`<amp-app-banner></amp-app-banner>`);
      expect(logger.warn).calledWith(
        'BENTO-APP-BANNER',
        'component should have an id'
      );
    });

    it('should log an error if <button open-button> is missing', async () => {
      expectAsyncConsoleError(missingButtonError);
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

      it('the light dom is visible', () => {
        expect(element.querySelector('h2')).to.be.not.null;
        expect(element.querySelector('button[open-button]')).to.be.not.null;
      });

      it('the shadow dom is mounted', () => {
        expect(element.shadowRoot.querySelector('div')).to.be.not.null;
        expect(element.shadowRoot.querySelector('button[aria-label="Dismiss"]'))
          .to.be.not.null;
      });
    });
  }
);
