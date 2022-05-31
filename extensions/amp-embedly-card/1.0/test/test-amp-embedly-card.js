import '../amp-embedly-card';
import {createElementWithAttributes} from '#core/dom';
import {computedStyle} from '#core/dom/style';

import {toggleExperiment} from '#experiments';

import {waitFor} from '#testing/helpers/service';
import {doNotLoadExternalResourcesInTest} from '#testing/iframe';

describes.realWin(
  'amp-embedly-card-v1.0',
  {
    amp: {
      extensions: ['amp-embedly-card:1.0'],
    },
  },
  (env) => {
    let win;
    let doc;
    let element;
    let consoleWarnSpy;
    let consoleWarn;

    beforeEach(async () => {
      win = env.win;
      doc = win.document;
      toggleExperiment(win, 'bento-embedly-card', true, true);
      // Override global window here because Preact uses global `createElement`.
      doNotLoadExternalResourcesInTest(window, env.sandbox);

      // Disable warnings and check against spy when needed
      consoleWarn = console.warn;
      console.warn = () => true;
      consoleWarnSpy = env.sandbox.spy(console, 'warn');
    });

    afterEach(() => {
      console.warn = consoleWarn;
    });

    /**
     * Wait for iframe to be mounted
     */
    const waitForRender = async () => {
      await element.buildInternal();
      const loadPromise = element.layoutCallback();
      const shadow = element.shadowRoot;
      await waitFor(() => shadow.querySelector('iframe'), 'iframe mounted');
      await loadPromise;
    };

    it('renders responsively', async () => {
      // Prepare Bento Tag
      element = createElementWithAttributes(doc, 'amp-embedly-card', {
        'data-url': 'https://www.youtube.com/watch?v=lBTCB7yLs8Y',
        'height': 200,
        'width': 300,
        'layout': 'responsive',
      });

      // Add to Document
      doc.body.appendChild(element);

      // Wait till rendering is finished
      await waitForRender();

      //Extract iframe
      const iframe = element.shadowRoot.querySelector('iframe');

      //Make sure iframe is available
      expect(iframe).to.not.be.null;

      // Check iframe for correct scr URL
      expect(element.className).to.match(/i-amphtml-layout-responsive/);

      // Check that the iframe is styled with width: 100%; height: 100%
      expect(computedStyle(win, iframe).width).to.equal(
        computedStyle(win, element).width
      );
      expect(computedStyle(win, iframe).height).to.equal(
        computedStyle(win, element).height
      );
    });

    it('throws when data-url is not given', async () => {
      // Prepare Bento Tag
      element = createElementWithAttributes(doc, 'amp-embedly-card', {
        'height': 200,
        'width': 300,
        layout: 'responsive',
      });

      // Add to Document
      doc.body.appendChild(element);

      // Wait till rendering is finished
      await waitForRender();

      // Check for console.warning
      expect(consoleWarnSpy).to.be.calledOnce;
    });
  }
);
