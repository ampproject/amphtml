import {facebook} from '#3p/facebook';

import {CSS} from '#build/bento-embedly-card-1.0.css';

import {defineElement} from '#bento/components/bento-facebook/1.0/web-component';
import {adoptStyles} from '#bento/util/unit-helpers';

import {createElementWithAttributes} from '#core/dom';

import {doNotLoadExternalResourcesInTest} from '#testing/iframe';

describes.realWin(
  'bento-facebook',
  {
    amp: false,
  },
  function (env) {
    let win, doc, element;

    const fbPostHref =
      'https://www.facebook.com/NASA/photos/a.67899501771/10159193669016772/';
    const fbVideoHref = 'https://www.facebook.com/NASA/videos/846648316199961/';
    const fbCommentsHref =
      'http://www.directlyrics.com/adele-25-complete-album-lyrics-news.html';

    beforeEach(() => {
      win = env.win;
      doc = win.document;

      defineElement(win);
      adoptStyles(win, CSS);

      // Override global window here because Preact uses global `createElement`.
      doNotLoadExternalResourcesInTest(window, env.sandbox);
    });

    it('renders', async () => {
      element = createElementWithAttributes(doc, 'bento-facebook', {
        'data-href': fbPostHref,
      });
      doc.body.appendChild(element);
      await element.getApi();

      const iframe = element.shadowRoot.querySelector('iframe');
      expect(iframe.src).to.equal(
        'http://ads.localhost:9876/dist.3p/current/frame.max.html'
      );
    });

    it('renders iframe in bento-facebook with video', async () => {
      element = createElementWithAttributes(doc, 'bento-facebook', {
        'data-href': fbPostHref,
        'data-embed-as': 'video',
      });
      doc.body.appendChild(element);
      await element.getApi();

      const iframe = element.shadowRoot.querySelector('iframe');
      expect(iframe.src).to.equal(
        'http://ads.localhost:9876/dist.3p/current/frame.max.html'
      );
    });

    it('ensures iframe is not sandboxed in bento-facebook', async () => {
      element = createElementWithAttributes(doc, 'bento-facebook', {
        'data-href': fbPostHref,
      });
      doc.body.appendChild(element);
      await element.getApi();

      const iframe = element.shadowRoot.querySelector('iframe');
      expect(iframe.hasAttribute('sandbox')).to.be.false;
    });

    it('renders bento-facebook with detected locale', async () => {
      element = createElementWithAttributes(doc, 'bento-facebook', {
        'data-href': fbPostHref,
      });
      doc.body.appendChild(element);
      await element.getApi();

      const iframe = element.shadowRoot.querySelector('iframe');
      expect(iframe.getAttribute('name')).to.contain('"locale":"en_US"');
    });

    it('renders bento-facebook with specified locale', async () => {
      element = createElementWithAttributes(doc, 'bento-facebook', {
        'data-href': fbPostHref,
        'data-locale': 'fr_FR',
      });
      doc.body.appendChild(element);
      await element.getApi();

      const iframe = element.shadowRoot.querySelector('iframe');
      expect(iframe.getAttribute('name')).to.contain('"locale":"fr_FR"');
    });

    it('adds fb-post element correctly', () => {
      const div = document.createElement('div');
      div.setAttribute('id', 'c');
      doc.body.appendChild(div);

      facebook(win, {
        href: fbPostHref,
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
      });
      const fbComments = doc.body.getElementsByClassName('fb-comments')[0];
      expect(fbComments).not.to.be.undefined;
      expect(fbComments.getAttribute('data-href')).to.equal(fbCommentsHref);
    });

    it('should pass the data-loading attribute to the underlying iframe', async () => {
      element = createElementWithAttributes(doc, 'bento-facebook', {
        'data-loading': 'lazy',
        'data-href': fbPostHref,
      });
      doc.body.appendChild(element);
      await element.getApi();

      const iframe = element.shadowRoot.querySelector('iframe');
      expect(iframe.getAttribute('loading')).to.equal('lazy');
    });

    it('should set data-loading="auto" if no value is specified', async () => {
      element = createElementWithAttributes(doc, 'bento-facebook', {
        'data-href': fbPostHref,
      });
      doc.body.appendChild(element);
      await element.getApi();

      const iframe = element.shadowRoot.querySelector('iframe');
      expect(iframe.getAttribute('loading')).to.equal('auto');
    });
  }
);
