import '../amp-facebook-comments';
import {serializeMessage} from '#core/3p-frame-messaging';
import {createElementWithAttributes} from '#core/dom';

import {doNotLoadExternalResourcesInTest} from '#testing/iframe';

import {setDefaultBootstrapBaseUrlForTesting} from '../../../../src/3p-frame';
import {resetServiceForTesting} from '../../../../src/service-helpers';

describes.realWin(
  'amp-facebook-comments',
  {
    amp: {
      extensions: ['amp-facebook-comments:0.1'],
    },
  },
  (env) => {
    let win, doc, element;
    const href = 'https://cdn.ampproject.org/';

    beforeEach(async function () {
      win = env.win;
      doc = win.document;
      // Override global window here because Preact uses global `createElement`.
      doNotLoadExternalResourcesInTest(window, env.sandbox);
    });

    it('renders', async () => {
      element = createElementWithAttributes(doc, 'amp-facebook-comments', {
        'data-href': href,
        'height': 500,
        'width': 500,
        'layout': 'responsive',
      });
      doc.body.appendChild(element);
      await element.buildInternal();
      await element.layoutCallback();

      const iframe = element.querySelector('iframe');
      expect(iframe.src).to.equal(
        'http://ads.localhost:9876/dist.3p/current/frame.max.html'
      );
    });

    it('ensures iframe is not sandboxed in amp-facebook-comments', async () => {
      element = createElementWithAttributes(doc, 'amp-facebook-comments', {
        'data-href': href,
        'height': 500,
        'width': 500,
        'layout': 'responsive',
      });
      doc.body.appendChild(element);
      await element.buildInternal();
      await element.layoutCallback();

      const iframe = element.querySelector('iframe');
      expect(iframe.hasAttribute('sandbox')).to.be.false;
    });

    it('renders amp-facebook-comments with specified locale', async () => {
      element = createElementWithAttributes(doc, 'amp-facebook-comments', {
        'data-href': href,
        'data-locale': 'fr_FR',
        'height': 500,
        'width': 500,
        'layout': 'responsive',
      });
      doc.body.appendChild(element);
      await element.buildInternal();
      await element.layoutCallback();

      const iframe = element.querySelector('iframe');
      expect(iframe.getAttribute('name')).to.contain('"locale":"fr_FR"');
    });

    it('renders with correct embed type', async () => {
      element = createElementWithAttributes(doc, 'amp-facebook-comments', {
        'data-href': href,
        'height': 500,
        'width': 500,
        'layout': 'responsive',
      });
      doc.body.appendChild(element);
      await element.buildInternal();
      await element.layoutCallback();

      const iframe = element.querySelector('iframe');
      const context = JSON.parse(iframe.getAttribute('name'));
      expect(context.attributes.embedAs).to.equal('comments');
    });

    it("container's height is changed", async () => {
      const iframeSrc =
        'http://ads.localhost:' +
        location.port +
        '/test/fixtures/served/iframe.html';
      resetServiceForTesting(win, 'bootstrapBaseUrl');
      setDefaultBootstrapBaseUrlForTesting(iframeSrc);

      const initialHeight = 300;
      element = createElementWithAttributes(doc, 'amp-facebook-comments', {
        'data-href': '585110598171631616',
        'height': initialHeight,
        'width': 500,
        'layout': 'responsive',
      });
      doc.body.appendChild(element);
      await element.buildInternal();
      await element.layoutCallback();

      const impl = await element.getImpl(false);
      const forceChangeHeightStub = env.sandbox.stub(impl, 'forceChangeHeight');

      const mockEvent = new CustomEvent('message');
      const sentinel = JSON.parse(
        element.querySelector('iframe').getAttribute('name')
      )['attributes']['_context']['sentinel'];
      mockEvent.data = serializeMessage('embed-size', sentinel, {
        'height': 1000,
      });
      mockEvent.source = element.querySelector('iframe').contentWindow;
      win.dispatchEvent(mockEvent);
      expect(forceChangeHeightStub).to.be.calledOnce.calledWith(1000);
    });
  }
);
