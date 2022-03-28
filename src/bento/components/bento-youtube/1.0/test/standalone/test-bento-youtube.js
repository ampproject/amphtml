import {CSS} from '#build/bento-youtube-1.0.css';

import {BaseElement as BentoYoutube} from '#bento/components/bento-youtube/1.0/base-element';
import {adoptStyles} from '#bento/util/unit-helpers';

import {createElementWithAttributes} from '#core/dom';

import {defineBentoElement} from '#preact/bento-ce';

import {waitFor} from '#testing/helpers/service';
import {doNotLoadExternalResourcesInTest} from '#testing/iframe';

describes.realWin(
  'bento-youtube-v1.0',
  {
    amp: false,
  },
  (env) => {
    let win, doc;
    let element;

    const waitForRender = async () => {
      await element.getApi();
      const shadow = element.shadowRoot;
      await waitFor(() => shadow.querySelector('iframe'), 'iframe mounted');
    };

    beforeEach(() => {
      win = env.win;
      doc = win.document;
      defineBentoElement('bento-youtube', BentoYoutube, win);
      adoptStyles(win, CSS);
      // Override global window here because Preact uses global `createElement`.
      doNotLoadExternalResourcesInTest(window, env.sandbox);
    });

    it('renders', async () => {
      element = createElementWithAttributes(win.document, 'bento-youtube', {
        'data-videoid': 'IAvf-rkzNck',
        'amp': true,
      });
      doc.body.appendChild(element);
      await waitForRender();

      expect(element.shadowRoot.querySelector('iframe').src).to.equal(
        'https://www.youtube.com/embed/IAvf-rkzNck?enablejsapi=1&amp=1&playsinline=1'
      );
    });

    it('should pass the data-loading attribute to the underlying iframe', async () => {
      element = createElementWithAttributes(win.document, 'bento-youtube', {
        'data-videoid': 'IAvf-rkzNck',
        'data-loading': 'lazy',
        'amp': true,
      });
      doc.body.appendChild(element);
      await waitForRender();

      const iframe = element.shadowRoot.querySelector('iframe');
      expect(iframe.getAttribute('loading')).to.equal('lazy');
    });

    it('should set loading="auto" if no value is specified', async () => {
      element = createElementWithAttributes(win.document, 'bento-youtube', {
        'data-videoid': 'IAvf-rkzNck',
        'amp': true,
      });
      doc.body.appendChild(element);
      await waitForRender();

      expect(
        element.shadowRoot.querySelector('iframe').getAttribute('loading')
      ).to.equal('auto');
    });
  }
);
