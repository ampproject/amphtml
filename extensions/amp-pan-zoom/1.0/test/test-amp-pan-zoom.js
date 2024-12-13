import '../amp-pan-zoom';
import {htmlFor} from '#core/dom/static-template';

import {toggleExperiment} from '#experiments';

import {sleep} from '#testing/helpers';
import {cleanHtml} from '#testing/helpers/cleanHtml';
import {waitFor} from '#testing/helpers/service';

function snapshot(element) {
  if (!element) {
    return element;
  }
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

    afterEach(async () => {
      // Avoids "ResizeObserver loop limit exceeded" errors.
      while (doc.lastChild) {
        doc.lastChild.remove();
      }
      await sleep(50);
    });

    async function mountElement(element) {
      doc.body.appendChild(element);
      await element.buildInternal();
      await waitFor(() => element.isConnected, 'element connected');
      return element;
    }

    function findParts(element) {
      // These selectors are pretty generic, but works for now:
      return {
        container: element.shadowRoot.querySelector('[data-test-id=container]'),
        content: element.shadowRoot.querySelector('[data-test-id=content]'),
        zoomButton: element.shadowRoot.querySelector('[aria-label="Zoom in"]'),
      };
    }

    it('renders the contents, and a zoom button', async () => {
      const element = await mountElement(html`
        <amp-pan-zoom>
          <div style="width: 1000px; height: 1000px;"></div>
        </amp-pan-zoom>
      `);

      expect(findParts(element).container).to.be.not.null;
      expect(findParts(element).content).to.be.not.null;
      expect(findParts(element).zoomButton).to.be.not.null;
    });

    it('initially renders the elements with appropriate zoom styles', async () => {
      const element = await mountElement(html`
        <amp-pan-zoom>
          <div style="width: 1000px; height: 1000px;"></div>
        </amp-pan-zoom>
      `);

      expect(snapshot(findParts(element).zoomButton)).to.equal(
        `<button></button>`
      );
      expect(findParts(element).content.getAttribute('style')).to.equal(
        `transform-origin: 0px 0px; transform: translate(0px, 0px) scale(1);`
      );
    });

    it('should render the initial state', async () => {
      const element = await mountElement(html`
        <amp-pan-zoom initial-x="555" initial-y="444" initial-scale="3">
          <div style="width: 1000px; height: 1000px;"></div>
        </amp-pan-zoom>
      `);

      expect(findParts(element).content.getAttribute('style')).to.equal(
        `transform-origin: 0px 0px; transform: translate(555px, 444px) scale(3);`
      );
    });
  }
);
