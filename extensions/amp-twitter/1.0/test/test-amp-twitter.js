import '../amp-twitter';
import {serializeMessage} from '#core/3p-frame-messaging';
import {createElementWithAttributes} from '#core/dom';

import {toggleExperiment} from '#experiments';

import {waitFor} from '#testing/helpers/service';
import {doNotLoadExternalResourcesInTest} from '#testing/iframe';

describes.realWin(
  'amp-twitter-v1.0',
  {
    amp: {
      extensions: ['amp-twitter:1.0'],
    },
  },
  (env) => {
    let win, doc, element;

    const waitForRender = async () => {
      await element.buildInternal();
      const loadPromise = element.layoutCallback();
      const shadow = element.shadowRoot;
      await waitFor(() => shadow.querySelector('iframe'), 'iframe mounted');
      await loadPromise;
    };

    beforeEach(async function () {
      win = env.win;
      doc = win.document;
      toggleExperiment(win, 'bento-twitter', true, true);
      // Override global window here because Preact uses global `createElement`.
      doNotLoadExternalResourcesInTest(window, env.sandbox);
    });

    it("container's height is changed", async () => {
      const initialHeight = 300;
      element = createElementWithAttributes(win.document, 'amp-twitter', {
        'data-tweetid': '585110598171631616',
        'height': initialHeight,
        'width': 500,
        'layout': 'responsive',
      });
      doc.body.appendChild(element);
      await waitForRender();

      const impl = await element.getImpl(false);
      const attemptChangeHeightStub = env.sandbox.stub(
        impl,
        'attemptChangeHeight'
      );
      attemptChangeHeightStub.returns(Promise.resolve());

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

    it('should test toggling placeholder off', async () => {
      element = createElementWithAttributes(doc, 'amp-twitter', {
        'data-tweetid': '585110598171631616',
      });
      doc.body.appendChild(element);
      await waitForRender();

      const impl = await element.getImpl(false);
      const togglePlaceholderStub = env.sandbox.stub(impl, 'togglePlaceholder');

      const iframe = element.shadowRoot.querySelector('iframe');
      const {sentinel} = JSON.parse(iframe.getAttribute('name')).attributes;
      const mockEvent = new CustomEvent('message');
      mockEvent.data = serializeMessage('embed-size', sentinel, {
        height: '1000',
      });
      mockEvent.source = iframe.contentWindow;
      win.dispatchEvent(mockEvent);

      expect(togglePlaceholderStub).to.be.calledOnce.calledWith(false);
    });

    it('should test toggling placeholder on', async () => {
      element = createElementWithAttributes(doc, 'amp-twitter', {
        'data-tweetid': '585110598171631616',
      });
      doc.body.appendChild(element);
      await waitForRender();

      const impl = await element.getImpl(false);
      const togglePlaceholderStub = env.sandbox.stub(impl, 'togglePlaceholder');

      const iframe = element.shadowRoot.querySelector('iframe');
      const {sentinel} = JSON.parse(iframe.getAttribute('name')).attributes;
      const mockEvent = new CustomEvent('message');
      mockEvent.data = serializeMessage('no-content', sentinel);
      mockEvent.source = iframe.contentWindow;
      win.dispatchEvent(mockEvent);

      expect(togglePlaceholderStub).to.be.calledOnce.calledWith(true);
    });
  }
);
