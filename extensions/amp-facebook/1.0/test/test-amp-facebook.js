import '../amp-facebook';
import {facebook} from '#3p/facebook';

import {serializeMessage} from '#core/3p-frame-messaging';
import {createElementWithAttributes} from '#core/dom';

import {toggleExperiment} from '#experiments';

import {waitFor} from '#testing/helpers/service';
import {doNotLoadExternalResourcesInTest} from '#testing/iframe';

import {setDefaultBootstrapBaseUrlForTesting} from '../../../../src/3p-frame';
import {resetServiceForTesting} from '../../../../src/service-helpers';

describes.realWin(
  'amp-facebook',
  {
    amp: {
      extensions: ['amp-facebook:1.0'],
    },
  },
  function (env) {
    let win, doc, element;

    const waitForRender = async () => {
      await element.buildInternal();
      const loadPromise = element.layoutCallback();
      const shadow = element.shadowRoot;
      await waitFor(() => shadow.querySelector('iframe'), 'iframe mounted');
      await loadPromise;
    };

    const fbPostHref =
      'https://www.facebook.com/NASA/photos/a.67899501771/10159193669016772/';
    const fbVideoHref = 'https://www.facebook.com/NASA/videos/846648316199961/';
    const fbCommentsHref =
      'http://www.directlyrics.com/adele-25-complete-album-lyrics-news.html';

    beforeEach(() => {
      win = env.win;
      doc = win.document;
      toggleExperiment(win, 'bento-facebook', true, true);
      // Override global window here because Preact uses global `createElement`.
      doNotLoadExternalResourcesInTest(window, env.sandbox);
    });

    it('renders', async () => {
      element = createElementWithAttributes(doc, 'amp-facebook', {
        'data-href': fbPostHref,
        'height': 500,
        'width': 500,
        'layout': 'responsive',
      });
      doc.body.appendChild(element);
      await waitForRender();

      const iframe = element.shadowRoot.querySelector('iframe');
      expect(iframe.src).to.equal(
        'http://ads.localhost:9876/dist.3p/current/frame.max.html'
      );
    });

    it('renders iframe in amp-facebook with video', async () => {
      element = createElementWithAttributes(doc, 'amp-facebook', {
        'data-href': fbPostHref,
        'data-embed-as': 'video',
        'height': 500,
        'width': 500,
        'layout': 'responsive',
      });
      doc.body.appendChild(element);
      await waitForRender();

      const iframe = element.shadowRoot.querySelector('iframe');
      expect(iframe.src).to.equal(
        'http://ads.localhost:9876/dist.3p/current/frame.max.html'
      );
    });

    it('ensures iframe is not sandboxed in amp-facebook', async () => {
      element = createElementWithAttributes(doc, 'amp-facebook', {
        'data-href': fbPostHref,
        'height': 500,
        'width': 500,
        'layout': 'responsive',
      });
      doc.body.appendChild(element);
      await waitForRender();

      const iframe = element.shadowRoot.querySelector('iframe');
      expect(iframe.hasAttribute('sandbox')).to.be.false;
    });

    it('renders amp-facebook with detected locale', async () => {
      element = createElementWithAttributes(doc, 'amp-facebook', {
        'data-href': fbPostHref,
        'height': 500,
        'width': 500,
        'layout': 'responsive',
      });
      doc.body.appendChild(element);
      await waitForRender();

      const iframe = element.shadowRoot.querySelector('iframe');
      expect(iframe.getAttribute('name')).to.contain('"locale":"en_US"');
    });

    it('renders amp-facebook with specified locale', async () => {
      element = createElementWithAttributes(doc, 'amp-facebook', {
        'data-href': fbPostHref,
        'data-locale': 'fr_FR',
        'height': 500,
        'width': 500,
        'layout': 'responsive',
      });
      doc.body.appendChild(element);
      await waitForRender();

      const iframe = element.shadowRoot.querySelector('iframe');
      expect(iframe.getAttribute('name')).to.contain('"locale":"fr_FR"');
    });

    it('adds fb-post element correctly', () => {
      const div = document.createElement('div');
      div.setAttribute('id', 'c');
      doc.body.appendChild(div);

      facebook(win, {
        href: fbPostHref,
        width: 111,
        height: 222,
      });
      const fbPost = doc.body.getElementsByClassName('fb-post')[0];
      expect(fbPost).not.to.be.undefined;
      expect(fbPost.getAttribute('data-href')).to.equal(fbPostHref);
    });

    it('adds fb-video element correctly', () => {
      const div = doc.createElement('div');
      div.setAttribute('id', 'c');
      doc.body.appendChild(div);

      facebook(win, {
        href: fbVideoHref,
        width: 111,
        height: 222,
        embedAs: 'video',
      });
      const fbVideo = doc.body.getElementsByClassName('fb-video')[0];
      expect(fbVideo).not.to.be.undefined;
      expect(fbVideo.getAttribute('data-href')).to.equal(fbVideoHref);
    });

    it(
      'adds fb-video element with `data-embed-as` and `data-show-text` ' +
        'attributes set correctly',
      () => {
        const div = doc.createElement('div');
        div.setAttribute('id', 'c');
        doc.body.appendChild(div);

        facebook(win, {
          href: fbVideoHref,
          width: 111,
          height: 222,
        });
        const fbVideo = doc.body.getElementsByClassName('fb-video')[0];
        expect(fbVideo).not.to.be.undefined;
        expect(fbVideo.classList.contains('fb-video')).to.be.true;
        expect(fbVideo.getAttribute('data-embed-as')).to.equal('video');
        expect(fbVideo.getAttribute('data-show-text')).to.equal('true');
      }
    );

    it("renders fb-video element with `data-embed-as='video'`", () => {
      const div = doc.createElement('div');
      div.setAttribute('id', 'c');
      doc.body.appendChild(div);

      facebook(win, {
        embedAs: 'video',
        href: fbVideoHref,
        width: 111,
        height: 222,
      });
      const fbVideo = doc.body.getElementsByClassName('fb-video')[0];
      expect(fbVideo).not.to.be.undefined;
      expect(fbVideo.classList.contains('fb-video')).to.be.true;
    });

    it("renders fb-video element with `data-embed-as='post'`", () => {
      const div = doc.createElement('div');
      div.setAttribute('id', 'c');
      doc.body.appendChild(div);

      facebook(win, {
        embedAs: 'post',
        href: fbVideoHref,
        width: 111,
        height: 222,
      });
      const fbVideo = doc.body.getElementsByClassName('fb-post')[0];
      expect(fbVideo).not.to.be.undefined;
      expect(fbVideo.classList.contains('fb-post')).to.be.true;
    });

    it('adds fb-comments element correctly', () => {
      const div = doc.createElement('div');
      div.setAttribute('id', 'c');
      doc.body.appendChild(div);

      facebook(win, {
        href: fbCommentsHref,
        embedAs: 'comments',
        width: 111,
        height: 222,
      });
      const fbComments = doc.body.getElementsByClassName('fb-comments')[0];
      expect(fbComments).not.to.be.undefined;
      expect(fbComments.getAttribute('data-href')).to.equal(fbCommentsHref);
    });

    it("container's height is changed", async () => {
      const iframeSrc =
        'http://ads.localhost:' +
        location.port +
        '/test/fixtures/served/iframe.html';
      resetServiceForTesting(win, 'bootstrapBaseUrl');
      setDefaultBootstrapBaseUrlForTesting(iframeSrc);

      const initialHeight = 300;
      element = createElementWithAttributes(doc, 'amp-facebook', {
        'data-href': '585110598171631616',
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
      )['attributes']['_context']['sentinel'];
      mockEvent.data = serializeMessage('embed-size', sentinel, {
        'height': 1000,
      });
      mockEvent.source =
        element.shadowRoot.querySelector('iframe').contentWindow;
      win.dispatchEvent(mockEvent);
      expect(attemptChangeHeightStub).to.be.calledOnce.calledWith(1000);
    });

    it('should pass the data-loading attribute to the underlying iframe', async () => {
      element = createElementWithAttributes(doc, 'amp-facebook', {
        'data-loading': 'lazy',
        'data-href': fbPostHref,
        'height': 500,
        'width': 500,
        'layout': 'responsive',
      });
      doc.body.appendChild(element);
      await waitForRender();

      const iframe = element.shadowRoot.querySelector('iframe');
      expect(iframe.getAttribute('loading')).to.equal('lazy');
    });

    it('should set data-loading="auto" if no value is specified', async () => {
      element = createElementWithAttributes(doc, 'amp-facebook', {
        'data-href': fbPostHref,
        'height': 500,
        'width': 500,
        'layout': 'responsive',
      });
      doc.body.appendChild(element);
      await waitForRender();

      const iframe = element.shadowRoot.querySelector('iframe');
      expect(iframe.getAttribute('loading')).to.equal('auto');
    });
  }
);
