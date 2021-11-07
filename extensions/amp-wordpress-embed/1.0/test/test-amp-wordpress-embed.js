import '../amp-wordpress-embed';
import {createElementWithAttributes} from '#core/dom';

import {toggleExperiment} from '#experiments';

import {waitFor} from '#testing/helpers/service';
import {doNotLoadExternalResourcesInTest} from '#testing/iframe';

describes.realWin(
  'amp-wordpress-embed-v1.0',
  {
    amp: {
      extensions: ['amp-wordpress-embed:1.0'],
    },
  },
  (env) => {
    let win;
    let doc;
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
      toggleExperiment(win, 'bento-wordpress-embed', true, true);
      // Override global window here because Preact uses global `createElement`.
      doNotLoadExternalResourcesInTest(window, env.sandbox);
    });

    it('renders', async () => {
      element = createElementWithAttributes(
        win.document,
        'amp-wordpress-embed',
        {
          'data-url': 'https://wordpress.org/news/2021/06/gutenberg-highlights',
          'height': 200,
          'width': 500,
          'layout': 'responsive',
        }
      );
      doc.body.appendChild(element);
      await waitForRender();

      expect(element.shadowRoot.querySelector('iframe').src).to.equal(
        'https://wordpress.org/news/2021/06/gutenberg-highlights?embed=true'
      );
    });

    it("container's height is changed", async () => {
      const initialHeight = 300;
      element = createElementWithAttributes(
        win.document,
        'amp-wordpress-embed',
        {
          'data-url': 'https://wordpress.org/news/2021/06/gutenberg-highlights',
          'height': initialHeight,
          'width': 500,
          'layout': 'responsive',
        }
      );
      doc.body.appendChild(element);
      await waitForRender();

      const impl = await element.getImpl(false);
      const attemptChangeHeightStub = env.sandbox.stub(
        impl,
        'attemptChangeHeight'
      );
      attemptChangeHeightStub.returns(Promise.resolve());

      const mockEvent = new CustomEvent('message');
      mockEvent.origin = 'https://wordpress.org';
      mockEvent.data = {
        message: 'height',
        value: 1000,
      };
      mockEvent.source =
        element.shadowRoot.querySelector('iframe').contentWindow;
      win.dispatchEvent(mockEvent);

      expect(attemptChangeHeightStub).to.be.calledOnce.calledWith(1000);
    });

    it('should show a warning message for invalid url', async () => {
      const originalWarn = console.warn;
      const consoleOutput = [];
      const mockedWarn = (output) => consoleOutput.push(output);
      console.warn = mockedWarn;

      element = createElementWithAttributes(
        win.document,
        'amp-wordpress-embed',
        {}
      );
      doc.body.appendChild(element);

      await element.buildInternal();
      await element.layoutCallback();

      expect(consoleOutput.length).to.equal(1);
      expect(consoleOutput[0]).to.equal('Please provide a valid url');

      console.warn = originalWarn;
    });
  }
);
