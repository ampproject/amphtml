import '../amp-beopinion';
import {htmlFor} from '#core/dom/static-template';
import {createElementWithAttributes} from '#core/dom';
import {doNotLoadExternalResourcesInTest} from '#testing/iframe';
import {serializeMessage} from '#core/3p-frame-messaging';
import {toggleExperiment} from '#experiments';
import {waitFor} from '#testing/helpers/service';

describes.realWin(
  'amp-beopinion-v1.0',
  {
    amp: {
      extensions: ['amp-beopinion:1.0'],
    },
  },
  (env) => {
    let win;
    let doc;
    let element;
    let html;

    const waitForRender = async () => {
      await element.buildInternal();
      const loadPromise = element.layoutCallback();
      const shadow = element.shadowRoot;
      await waitFor(() => shadow.querySelector('iframe'), 'iframe mounted');
      await loadPromise;
    };

    beforeEach(async () => {
      win = env.win;
      doc = win.document;
      html = htmlFor(doc);
      toggleExperiment(win, 'bento-beopinion', true, true);
      // Override global window here because Preact uses global `createElement`.
      doNotLoadExternalResourcesInTest(window, env.sandbox);
    });

    it('renders', async () => {
      element = createElementWithAttributes(doc, 'amp-beopinion', {
        account: '589446dd42ee0d6fdd9c3dfd',
        content: '5a703a2f46e0fb00016d51b3',
        'height': 500,
        'width': 500,
        'layout': 'responsive',
      });
      doc.body.appendChild(element);
      await waitForRender();

      expect(element.shadowRoot.querySelector('iframe').src).to.equal(
        // 'http://ads.localhost:9876/dist.3p/current/frame.max.html'
        'http://ads.localhost:8000/dist.3p/current/frame.max.html' // for local only
      );
    });

    it("container's height is changed", async () => {
      const initialHeight = 300;
      element = createElementWithAttributes(doc, 'amp-beopinion', {
        account: '589446dd42ee0d6fdd9c3dfd',
        content: '5a703a2f46e0fb00016d51b3',
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
      element = createElementWithAttributes(doc, 'amp-beopinion', {
        account: '589446dd42ee0d6fdd9c3dfd',
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
      element = createElementWithAttributes(doc, 'amp-beopinion', {
        account: '589446dd42ee0d6fdd9c3dfd',
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
