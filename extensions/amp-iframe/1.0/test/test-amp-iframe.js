import '../amp-iframe';
import {whenUpgradedToCustomElement} from '#core/dom/amp-element-helpers';
import {htmlFor} from '#core/dom/static-template';

import {toggleExperiment} from '#experiments';

import {waitFor} from '#testing/helpers/service';
import {flush} from '#testing/preact';

describes.realWin(
  'amp-iframe-v1.0',
  {
    amp: {
      extensions: ['amp-iframe:1.0'],
    },
  },
  (env) => {
    let win, doc, html, element;

    async function waitRendered() {
      await whenUpgradedToCustomElement(element);
      await element.mount();
      await flush();
      await waitFor(() => element.shadowRoot.querySelector('iframe'));
    }

    beforeEach(() => {
      win = env.win;
      doc = win.document;
      html = htmlFor(doc);
      toggleExperiment(win, 'bento-iframe', true, true);
    });

    it('should render', async () => {
      element = html`
        <amp-iframe src="https://www.wikipedia.org"></amp-iframe>
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
