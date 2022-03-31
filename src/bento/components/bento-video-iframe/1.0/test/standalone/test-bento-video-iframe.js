import {CSS} from '#build/bento-video-iframe-1.0.css';

import {BaseElement as BentoVideoIframe} from '#bento/components/bento-video-iframe/1.0/base-element';
import {adoptStyles} from '#bento/util/unit-helpers';

import {dispatchCustomEvent} from '#core/dom';
import {htmlFor} from '#core/dom/static-template';

import {defineBentoElement} from '#preact/bento-ce';

import {waitFor} from '#testing/helpers/service';

describes.realWin(
  'bento-video-iframe-v1.0',
  {
    amp: false,
  },
  (env) => {
    let html;
    let element;

    const waitForRender = async () => {
      await element.getApi();
      const shadow = element.shadowRoot;
      await waitFor(() => shadow.querySelector('iframe'), 'iframe mounted');
      const iframe = shadow.querySelector('iframe');
      dispatchCustomEvent(iframe, 'canplay', null, {bubbles: false});
    };

    beforeEach(() => {
      html = htmlFor(env.win.document);
      defineBentoElement('bento-video-iframe', BentoVideoIframe, env.win);
      adoptStyles(env.win, CSS);
    });

    it('renders iframe', async () => {
      element = html` <bento-video-iframe></bento-video-iframe> `;

      element.setAttribute(
        'src',
        `http://localhost:${location.port}/test/fixtures/served/blank.html#`
      );

      env.win.document.body.appendChild(element);

      await waitForRender();

      const iframe = element.shadowRoot.querySelector('iframe');
      expect(iframe).to.not.be.null;
    });

    it('should pass the loading attribute to the underlying iframe', async () => {
      element = html`
        <bento-video-iframe data-loading="lazy"></bento-video-iframe>
      `;

      env.win.document.body.appendChild(element);

      await waitForRender();

      const iframe = element.shadowRoot.querySelector('iframe');
      expect(iframe.getAttribute('loading')).to.equal('lazy');
    });

    it('should set data-loading="auto" if no value is specified', async () => {
      element = html` <bento-video-iframe></bento-video-iframe> `;

      env.win.document.body.appendChild(element);

      await waitForRender();

      const iframe = element.shadowRoot.querySelector('iframe');
      expect(iframe.getAttribute('loading')).to.equal('auto');
    });
  }
);
