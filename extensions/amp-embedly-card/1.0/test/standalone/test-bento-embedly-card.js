import {CSS} from '#build/bento-embedly-card-1.0.css';

import {adoptStyles} from '#bento/util/unit-helpers';

import {createElementWithAttributes} from '#core/dom';

import {doNotLoadExternalResourcesInTest} from '#testing/iframe';

import {defineElement} from '../../web-component';

describes.realWin(
  'bento-embedly-card-v1.0',
  {
    amp: false,
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
      defineElement(win);
      adoptStyles(win, CSS);

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
      await element.getApi();
    };

    it('renders responsively', async () => {
      // Prepare Bento Tag
      element = createElementWithAttributes(doc, 'bento-embedly-card', {
        'data-url': 'https://www.youtube.com/watch?v=lBTCB7yLs8Y',
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
      // todo(kvchari): check that it shouldn't be i-amphtml-layout-responsive
      expect(element.className).to.match(/i-amphtml-built/);
    });

    it('throws when data-url is not given', async () => {
      // Prepare Bento Tag
      element = createElementWithAttributes(doc, 'bento-embedly-card');

      // Add to Document
      doc.body.appendChild(element);

      // Wait till rendering is finished
      await waitForRender();

      // Check for console.warning
      expect(consoleWarnSpy).to.be.calledOnce;
    });
  }
);
