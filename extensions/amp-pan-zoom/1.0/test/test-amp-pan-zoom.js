import '../amp-pan-zoom';
import {htmlFor} from '#core/dom/static-template';

import {toggleExperiment} from '#experiments';

import {waitFor} from '#testing/helpers/service';

const CONTENTS = 'div > div';

describes.realWin(
  'amp-pan-zoom-v1.0',
  {
    amp: {
      extensions: ['amp-pan-zoom:1.0'],
    },
  },
  (env) => {
    let win;
    let doc;
    let html;

    beforeEach(async () => {
      win = env.win;
      doc = win.document;
      html = htmlFor(doc);
      toggleExperiment(win, 'bento-pan-zoom', true, true);
    });

    async function mountElement(element) {
      doc.body.appendChild(element);
      await element.buildInternal();
      await waitFor(() => element.isConnected, 'element connected');
      return element;
    }

    it('example renders', async () => {
      const element = await mountElement(html`
        <amp-pan-zoom>
          <div style="width: 1000px; height: 1000px;"></div>
        </amp-pan-zoom>
      `);

      expect(element.shadowRoot).to.be.not.null;
    });
  }
);
