import {CSS} from '#build/bento-wordpress-embed-1.0.css';

import {adoptStyles} from '#bento/util/unit-helpers';

import {createElementWithAttributes} from '#core/dom';

import {defineBentoElement} from '#preact/bento-ce';

import {waitFor} from '#testing/helpers/service';
import {doNotLoadExternalResourcesInTest} from '#testing/iframe';

import {BaseElement as BentoWordpressEmbed} from '../../base-element';

describes.realWin(
  'bento-wordpress-embed-v1.0',
  {
    amp: false,
  },
  (env) => {
    let win;
    let doc;
    let element;

    const waitForRender = async () => {
      await element.getApi();
      const shadow = element.shadowRoot;
      await waitFor(() => shadow.querySelector('iframe'), 'iframe mounted');
    };

    beforeEach(() => {
      win = env.win;
      doc = win.document;

      defineBentoElement('bento-wordpress-embed', BentoWordpressEmbed, win);
      adoptStyles(win, CSS);
      // Override global window here because Preact uses global `createElement`.
      doNotLoadExternalResourcesInTest(window, env.sandbox);
    });

    it('renders', async () => {
      element = createElementWithAttributes(
        win.document,
        'bento-wordpress-embed',
        {
          'data-url': 'https://wordpress.org/news/2021/06/gutenberg-highlights',
        }
      );
      doc.body.appendChild(element);
      await waitForRender();

      expect(element.shadowRoot.querySelector('iframe').src).to.equal(
        'https://wordpress.org/news/2021/06/gutenberg-highlights?embed=true'
      );
    });

    it('should show a warning message for invalid url', async () => {
      const originalWarn = console.warn;
      const consoleOutput = [];
      const mockedWarn = (output) => consoleOutput.push(output);
      console.warn = mockedWarn;

      element = createElementWithAttributes(
        win.document,
        'bento-wordpress-embed',
        {}
      );
      doc.body.appendChild(element);
      await waitForRender();

      expect(consoleOutput.length).to.equal(1);
      expect(consoleOutput[0]).to.equal('Please provide a valid url');

      console.warn = originalWarn;
    });
  }
);
