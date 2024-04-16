import '../amp-instagram';
import {createElementWithAttributes} from '#core/dom';

import {toggleExperiment} from '#experiments';

import {waitFor} from '#testing/helpers/service';
import {doNotLoadExternalResourcesInTest} from '#testing/iframe';

describes.realWin(
  'amp-instagram-v1.0',
  {
    amp: {
      extensions: ['amp-instagram:1.0'],
    },
  },
  (env) => {
    let win, doc;
    let element;

    const waitForRender = async () => {
      await element.buildInternal();
      const loadPromise = element.layoutCallback();
      const shadow = element.shadowRoot;
      await waitFor(() => shadow.querySelector('iframe'), 'iframe mounted');
      await loadPromise;
    };

    beforeEach(() => {
      win = env.win;
      doc = win.document;
      toggleExperiment(win, 'bento-instagram', true, true);
      // Override global window here because Preact uses global `createElement`.
      doNotLoadExternalResourcesInTest(window, env.sandbox);
    });

    it('renders', async () => {
      element = createElementWithAttributes(win.document, 'amp-instagram', {
        'data-shortcode': 'B8QaZW4AQY_',
        'amp': true,
        'height': 500,
        'width': 500,
        'layout': 'responsive',
      });
      doc.body.appendChild(element);
      await waitForRender();

      expect(element.shadowRoot.querySelector('iframe').src).to.equal(
        'https://www.instagram.com/p/B8QaZW4AQY_/embed/?cr=1&v=12'
      );
    });

    it('renders with caption', async () => {
      element = createElementWithAttributes(win.document, 'amp-instagram', {
        'data-shortcode': 'B8QaZW4AQY_',
        'data-captioned': true,
        'amp': true,
        'height': 500,
        'width': 500,
        'layout': 'responsive',
      });
      doc.body.appendChild(element);
      await waitForRender();

      expect(element.shadowRoot.querySelector('iframe').src).to.equal(
        'https://www.instagram.com/p/B8QaZW4AQY_/embed/captioned/?cr=1&v=12'
      );
    });

    it("container's height is changed", async () => {
      const initialHeight = 300;
      element = createElementWithAttributes(win.document, 'amp-instagram', {
        'data-shortcode': 'B8QaZW4AQY_',
        'amp': true,
        'height': initialHeight,
        'width': 500,
        'layout': 'responsive',
      });
      doc.body.appendChild(element);
      await waitForRender();

      const impl = await element.getImpl(false);
      const attemptChangeHeightStub = env.sandbox.stub(
        impl,
        'attemptChangeHeight'
      );
      attemptChangeHeightStub.returns(Promise.resolve());

      const mockEvent = new CustomEvent('message');
      mockEvent.origin = 'https://www.instagram.com';
      mockEvent.data = JSON.stringify({
        'type': 'MEASURE',
        'details': {
          'height': 1000,
        },
      });
      mockEvent.source =
        element.shadowRoot.querySelector('iframe').contentWindow;
      win.dispatchEvent(mockEvent);

      expect(attemptChangeHeightStub).to.be.calledOnce.calledWith(1000);
    });
  }
);
