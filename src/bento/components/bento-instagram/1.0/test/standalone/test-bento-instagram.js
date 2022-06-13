import {CSS} from '#build/bento-instagram-1.0.css';

import {BaseElement as BentoInstagram} from '#bento/components/bento-instagram/1.0/base-element';
import {adoptStyles} from '#bento/util/unit-helpers';

import {createElementWithAttributes} from '#core/dom';

import {defineBentoElement} from '#preact/bento-ce';

import {waitFor} from '#testing/helpers/service';
import {doNotLoadExternalResourcesInTest} from '#testing/iframe';

describes.realWin(
  'bento-instagram-v1.0',
  {
    amp: false,
  },
  (env) => {
    let win, doc;
    let element;

    beforeEach(() => {
      win = env.win;
      doc = win.document;

      defineBentoElement('bento-instagram', BentoInstagram, win);
      adoptStyles(win, CSS);

      // Override global window here because Preact uses global `createElement`.
      doNotLoadExternalResourcesInTest(window, env.sandbox);
    });

    const waitForRender = async () => {
      await element.getApi();
      const shadow = element.shadowRoot;
      await waitFor(() => shadow.querySelector('iframe'), 'iframe mounted');
    };

    it('renders', async () => {
      element = createElementWithAttributes(win.document, 'bento-instagram', {
        'data-shortcode': 'B8QaZW4AQY_',
        'amp': true,
        style: 'height: 500px; width: 500px',
      });
      doc.body.appendChild(element);
      await waitForRender();

      expect(element.shadowRoot.querySelector('iframe').src).to.equal(
        'https://www.instagram.com/p/B8QaZW4AQY_/embed/?cr=1&v=12'
      );
    });

    it('renders with caption', async () => {
      element = createElementWithAttributes(win.document, 'bento-instagram', {
        'data-shortcode': 'B8QaZW4AQY_',
        'data-captioned': true,
        'amp': true,
        style: 'height: 500px; width: 500px',
      });
      doc.body.appendChild(element);
      await waitForRender();

      expect(element.shadowRoot.querySelector('iframe').src).to.equal(
        'https://www.instagram.com/p/B8QaZW4AQY_/embed/captioned/?cr=1&v=12'
      );
    });
  }
);
