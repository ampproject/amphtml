import '../amp-gist';
import {createElementWithAttributes} from '#core/dom';

import {toggleExperiment} from '#experiments';

import {waitFor} from '#testing/helpers/service';
import {doNotLoadExternalResourcesInTest} from '#testing/iframe';

describes.realWin(
  'amp-gist-v1.0',
  {
    amp: {
      extensions: ['amp-gist:1.0'],
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

    beforeEach(async () => {
      win = env.win;
      doc = win.document;
      toggleExperiment(win, 'bento-gist', true, true);

      // Override global window here because Preact uses global `createElement`.
      doNotLoadExternalResourcesInTest(window, env.sandbox);
    });

    it('renders', async () => {
      element = createElementWithAttributes(win.document, 'amp-gist', {
        'data-gistid': 'b9bb35bc68df68259af94430f012425f',
        'height': 500,
        'layout': 'fixed-height',
      });
      doc.body.appendChild(element);
      await waitForRender();

      expect(element.shadowRoot.querySelector('iframe').src).not.to.be.null;
    });

    it('renders with specific file', async () => {
      element = createElementWithAttributes(win.document, 'amp-gist', {
        'data-gistid': 'a19e811dcd7df10c4da0931641538497',
        'data-file': 'index.js',
        'height': 500,
        'layout': 'fixed-height',
      });
      doc.body.appendChild(element);
      await waitForRender();

      expect(element.shadowRoot.querySelector('iframe').src).not.to.be.null;
    });
  }
);
