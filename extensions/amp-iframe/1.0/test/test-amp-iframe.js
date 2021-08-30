import '../amp-iframe';
import {htmlFor} from '#core/dom/static-template';
import {toggleExperiment} from '#experiments';
import {waitFor} from '#testing/test-helper';
import {whenUpgradedToCustomElement} from '#core/dom/amp-element-helpers';

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
      await element.buildInternal();
      await waitFor(() => element.isConnected, 'element connected');
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

      expect(element.parentNode).to.equal(doc.body);
      expect(element.getAttribute('src')).to.equal('https://www.wikipedia.org');
    });
  }
);
