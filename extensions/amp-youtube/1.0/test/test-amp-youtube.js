import '../amp-youtube';
import {createElementWithAttributes} from '#core/dom';

import {toggleExperiment} from '#experiments';

import {waitFor} from '#testing/helpers/service';
import {doNotLoadExternalResourcesInTest} from '#testing/iframe';

describes.realWin(
  'amp-youtube-v1.0',
  {
    amp: {
      extensions: ['amp-youtube:1.0'],
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
      toggleExperiment(env.win, 'bento-youtube', true, true);
      // Override global window here because Preact uses global `createElement`.
      doNotLoadExternalResourcesInTest(window, env.sandbox);
    });

    it('renders', async () => {
      element = createElementWithAttributes(win.document, 'amp-youtube', {
        'data-videoid': 'IAvf-rkzNck',
        'amp': true,
        'height': 500,
        'width': 500,
        'layout': 'responsive',
      });
      doc.body.appendChild(element);
      await waitForRender();

      expect(element.shadowRoot.querySelector('iframe').src).to.equal(
        'https://www.youtube.com/embed/IAvf-rkzNck?enablejsapi=1&amp=1&playsinline=1'
      );
    });

    it('should pass the data-loading attribute to the underlying iframe', async () => {
      element = createElementWithAttributes(win.document, 'amp-youtube', {
        'data-videoid': 'IAvf-rkzNck',
        'data-loading': 'lazy',
        'amp': true,
        'height': 500,
        'width': 500,
        'layout': 'responsive',
      });
      doc.body.appendChild(element);
      await waitForRender();

      const iframe = element.shadowRoot.querySelector('iframe');
      expect(iframe.getAttribute('loading')).to.equal('lazy');
    });

    it('should set loading="auto" if no value is specified', async () => {
      element = createElementWithAttributes(win.document, 'amp-youtube', {
        'data-videoid': 'IAvf-rkzNck',
        'amp': true,
        'height': 500,
        'width': 500,
        'layout': 'responsive',
      });
      doc.body.appendChild(element);
      await waitForRender();

      expect(
        element.shadowRoot.querySelector('iframe').getAttribute('loading')
      ).to.equal('auto');
    });
  }
);
