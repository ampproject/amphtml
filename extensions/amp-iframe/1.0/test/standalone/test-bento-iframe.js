import {CSS} from '#build/bento-iframe-1.0.css';

import {adoptStyles} from '#bento/util/unit-helpers';

import {htmlFor} from '#core/dom/static-template';

import {defineBentoElement} from '#preact/bento-ce';

import {waitFor} from '#testing/helpers/service';

import {BaseElement as BentoIframe} from '../../base-element';

describes.realWin(
  'bento-iframe-v1.0',
  {
    amp: false,
  },
  (env) => {
    let win, doc, html, element;

    async function waitRendered() {
      await element.getApi();
      await waitFor(() => element.shadowRoot.querySelector('iframe'));
    }

    beforeEach(() => {
      win = env.win;
      doc = win.document;
      defineBentoElement('bento-iframe', BentoIframe, win);
      adoptStyles(win, CSS);
      html = htmlFor(doc);
    });

    it('should render', async () => {
      element = html`
        <bento-iframe src="https://www.wikipedia.org"></bento-iframe>
      `;
      doc.body.appendChild(element);

      await waitRendered();
      const iframe = element.shadowRoot.querySelector('iframe');

      expect(element.parentNode).to.equal(doc.body);
      expect(element.getAttribute('src')).to.equal('https://www.wikipedia.org');
      expect(iframe.getAttribute('src')).to.equal('https://www.wikipedia.org');
    });
  }
);
