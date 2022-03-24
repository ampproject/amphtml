import {CSS} from '#build/bento-vimeo-1.0.css';

import {BaseElement as BentoVimeo} from '#bento/components/bento-vimeo/1.0/base-element';
import {adoptStyles} from '#bento/util/unit-helpers';

import {htmlFor} from '#core/dom/static-template';

import {defineBentoElement} from '#preact/bento-ce';

import {waitFor} from '#testing/helpers/service';

describes.realWin(
  'bento-vimeo-v1.0',
  {
    amp: false,
  },
  (env) => {
    let html;

    const waitForRender = async (element) => {
      await element.getApi();
      const {shadowRoot} = element;
      await waitFor(() => shadowRoot.querySelector('iframe'), 'iframe mounted');
    };

    beforeEach(async () => {
      html = htmlFor(env.win.document);

      defineBentoElement('bento-vimeo', BentoVimeo, env.win);
      adoptStyles(env.win, CSS);
    });

    it('renders', async () => {
      const element = html` <bento-vimeo></bento-vimeo> `;
      env.win.document.body.appendChild(element);

      await waitForRender(element);

      const iframe = element.shadowRoot.querySelector('iframe');
      expect(iframe).to.not.be.null;
    });

    it('should pass the data-loading attribute to the underlying iframe', async () => {
      const element = html` <bento-vimeo data-loading="lazy"></bento-vimeo> `;
      env.win.document.body.appendChild(element);
      await waitForRender(element);

      const iframe = element.shadowRoot.querySelector('iframe');
      expect(iframe.getAttribute('loading')).to.equal('lazy');
    });

    it('should set data-loading="auto" if no value is specified', async () => {
      const element = html` <bento-vimeo></bento-vimeo> `;
      env.win.document.body.appendChild(element);
      await waitForRender(element);

      const iframe = element.shadowRoot.querySelector('iframe');
      expect(iframe.getAttribute('loading')).to.equal('auto');
    });
  }
);
