import '../amp-soundcloud';
import {htmlFor} from '#core/dom/static-template';

import {toggleExperiment} from '#experiments';

import {waitFor} from '#testing/helpers/service';

describes.realWin(
  'amp-soundcloud-v1.0',
  {
    amp: {
      extensions: ['amp-soundcloud:1.0'],
    },
  },
  (env) => {
    let win;
    let html;
    let doc;

    let element;

    // Perform before every testcase
    beforeEach(async () => {
      win = env.win;
      doc = win.document;
      html = htmlFor(doc);
      toggleExperiment(env.win, 'bento-soundcloud', true, true);
    });

    /**
     * Wait for iframe to be mounted
     */
    const waitForRender = async () => {
      await element.buildInternal();
      const loadPromise = element.layoutCallback();
      const {shadowRoot} = element;
      await waitFor(() => shadowRoot.querySelector('iframe'), 'iframe mounted');
      await loadPromise;
    };

    it('renders fixed-height', async () => {
      element = html`
        <amp-soundcloud
          data-trackid="243169232"
          layout="fixed-height"
          height="340"
        ></amp-soundcloud>
      `;

      // Add to Document
      doc.body.appendChild(element);

      // Wait till rendering is finished
      await waitForRender();

      // Extract iframe
      const iframe = element.shadowRoot.querySelector('iframe');

      // Make sure iframe is available
      expect(iframe).to.not.be.null;

      // Check element for correct layout class
      expect(element.className).to.match(/i-amphtml-layout-fixed-height/);
    });

    it('renders responsively', async () => {
      element = html`
        <amp-soundcloud
          data-trackid="243169232"
          width="480"
          height="340"
          layout="responsive"
        ></amp-soundcloud>
      `;

      // Add to Document
      doc.body.appendChild(element);

      // Wait till rendering is finished
      await waitForRender();

      // Extract iframe
      const iframe = element.shadowRoot.querySelector('iframe');

      // Make sure iframe is available
      expect(iframe).to.not.be.null;

      // Check element for correct layout class
      expect(element.className).to.match(/i-amphtml-layout-responsive/);
    });
  }
);
