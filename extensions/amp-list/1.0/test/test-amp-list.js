import '../amp-list';
import {htmlFor} from '#core/dom/static-template';

import {toggleExperiment} from '#experiments';

import {Services} from '#service';

import {sleep} from '#testing/helpers';
import {cleanHtml} from '#testing/helpers/cleanHtml';
import {waitFor, whenCalled} from '#testing/helpers/service';

import '../../../amp-mustache/0.2/amp-mustache';

const CONTENTS = 'div > div'; // TODO: find a better way to find the component's contents
function snapshot(element) {
  const keep = ['aria-label'];
  return cleanHtml(element.shadowRoot.querySelector(CONTENTS).innerHTML, keep);
}

describes.realWin(
  'amp-list-v1.0',
  {
    amp: {
      extensions: ['amp-mustache:0.2', 'amp-list:1.0'],
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
      toggleExperiment(win, 'bento-list', true, true);
    });

    async function mountElement(element) {
      doc.body.appendChild(element);
      await element.buildInternal();
      await waitFor(() => element.isConnected, 'element connected');
      await waitFor(
        () => element.shadowRoot.querySelector(CONTENTS).innerHTML,
        'element initial render'
      );
      return element;
    }

    let fetchJson;
    beforeEach(() => {
      const xhr = Services.batchedXhrFor(env.win);

      fetchJson = env.sandbox.stub().resolves({items: ['one', 'two', 'three']});
      env.sandbox.stub(xhr, 'fetchJson').callsFake(async (...args) => {
        await sleep(50); // Ensure enough time to catch the "Loading" state
        return {json: () => fetchJson(...args)};
      });
    });

    const expectedLoading = '<div><span aria-label="Loading"></span></div>';
    const expectedPage1 = `<div><span>one</span><span>two</span><span>three</span></div>`;

    it('renders the Loading state, then renders the results', async () => {
      const element = await mountElement(
        html`<amp-list src="test.json">
          <template type="amp-mustache">{{.}}</template>
        </amp-list>`
      );

      expect(snapshot(element)).to.equal(expectedLoading);

      await whenCalled(fetchJson);

      expect(snapshot(element)).to.equal(expectedPage1);
    });
    it('renders the template for each item', async () => {
      fetchJson.resolves({
        items: [
          {first: 'A', second: 'B', third: 'C'},
          {first: '1', second: '2', third: '3'},
          {first: 'do', second: 're', third: 'mi'},
        ],
      });
      const element = await mountElement(
        html`<amp-list src="test.json">
          <template type="amp-mustache">
            <h1>{{first}}</h1>
            <h2>{{second}}</h2>
            <h3>{{third}}</h3>
          </template>
        </amp-list>`
      );
      await whenCalled(fetchJson);

      expect(snapshot(element)).to.equal(
        cleanHtml(`
          <div><span>
            <h1>A</h1>
            <h2>B</h2>
            <h3>C</h3>
          </span><span>
            <h1>1</h1>
            <h2>2</h2>
            <h3>3</h3>
          </span><span>
            <h1>do</h1>
            <h2>re</h2>
            <h3>mi</h3>
          </span></div>
        `)
      );
    });
  }
);
