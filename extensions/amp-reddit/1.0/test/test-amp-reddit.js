import '../amp-reddit';
import {serializeMessage} from '#core/3p-frame-messaging';
import {htmlFor} from '#core/dom/static-template';

import {toggleExperiment} from '#experiments';

import {waitFor} from '#testing/test-helper';

describes.realWin(
  'amp-reddit-v1.0',
  {
    amp: {
      extensions: ['amp-reddit:1.0'],
    },
  },
  (env) => {
    let win;
    let doc;
    let html;

    const waitForRender = async (element) => {
      await element.buildInternal();
      const loadPromise = element.layoutCallback();
      const {shadowRoot} = element;
      await waitFor(() => shadowRoot.querySelector('iframe'), 'iframe mounted');
      await loadPromise;
    };

    beforeEach(async () => {
      win = env.win;
      doc = win.document;
      html = htmlFor(doc);
      toggleExperiment(win, 'bento-reddit', true, true);
    });

    it('renders', async () => {
      const element = html`
        <amp-reddit
          layout="responsive"
          width="300"
          height="400"
          data-embedtype="post"
          data-src="https://www.reddit.com/r/me_irl/comments/52rmir/me_irl/?ref=share&amp;ref_source=embed"
        ></amp-reddit>
      `;
      env.win.document.body.appendChild(element);
      await waitForRender(element);

      const iframe = element.shadowRoot.querySelector('iframe');
      expect(iframe).to.not.be.null;
      expect(iframe.src).to.equal(
        'http://ads.localhost:9876/dist.3p/current/frame.max.html'
      );
    });

    it("container's height is changed", async () => {
      const initialHeight = 300;
      const element = html`
        <amp-reddit
          layout="responsive"
          width="300"
          height="400"
          data-embedtype="post"
          data-src="https://www.reddit.com/r/me_irl/comments/52rmir/me_irl/?ref=share&amp;ref_source=embed"
        ></amp-reddit>
      `;
      env.win.document.body.appendChild(element);
      await waitForRender(element);

      const impl = await element.getImpl(false);
      const attemptChangeHeightStub = env.sandbox
        .stub(impl, 'attemptChangeHeight')
        .resolves();

      const mockEvent = new CustomEvent('message');
      const sentinel = JSON.parse(
        element.shadowRoot.querySelector('iframe').getAttribute('name')
      )['attributes']['sentinel'];
      mockEvent.data = serializeMessage('embed-size', sentinel, {
        'height': 1000,
      });
      mockEvent.source =
        element.shadowRoot.querySelector('iframe').contentWindow;
      win.dispatchEvent(mockEvent);
      expect(attemptChangeHeightStub).to.be.calledOnce.calledWith(1000);
    });
  }
);
