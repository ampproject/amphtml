import '../amp-pan-zoom';
import {htmlFor} from '#core/dom/static-template';

import {toggleExperiment} from '#experiments';

import {cleanHtml} from '#testing/helpers/cleanHtml';
import {waitFor} from '#testing/helpers/service';

const CONTENTS = 'div > div';
function snapshot(element) {
  const keep = ['style'];
  const html = element.outerHTML;
  return cleanHtml(html, keep);
}

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

    function findParts(element) {
      const contents = element.shadowRoot.querySelector(CONTENTS);
      const contentWrapper = element.shadowRoot.querySelector(
        'div > div > div > div > div'
      );
      return {
        hammerEl: contents.firstChild,
        zoomButton: contents.lastChild,
        contentWrapper,
      };
    }

    it('renders the contents, and a zoom button', async () => {
      const element = await mountElement(html`
        <amp-pan-zoom>
          <div style="width: 1000px; height: 1000px;"></div>
        </amp-pan-zoom>
      `);

      expect(findParts(element).hammerEl).to.be.not.null;
      expect(findParts(element).zoomButton).to.be.not.null;
      expect(findParts(element).contentWrapper).to.be.not.null;
    });

    it('initially renders the elements with appropriate zoom styles', async () => {
      const element = await mountElement(html`
        <amp-pan-zoom>
          <div style="width: 1000px; height: 1000px;"></div>
        </amp-pan-zoom>
      `);

      expect(findParts(element).hammerEl.getAttribute('style')).to.equal(
        'touch-action: pan-x pan-y; user-select: none; -webkit-user-drag: none; -webkit-tap-highlight-color: rgba(0, 0, 0, 0);'
      );
      expect(snapshot(findParts(element).zoomButton)).to.equal(
        `<button></button>`
      );
      expect(findParts(element).contentWrapper.getAttribute('style')).to.equal(
        `transform-origin: 0px 0px; transform: translate(0px, 0px) scale(1);`
      );
    });
  }
);
