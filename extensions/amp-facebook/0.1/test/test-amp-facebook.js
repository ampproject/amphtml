import '../amp-facebook';
import {expect} from 'chai';

import {facebook} from '#3p/facebook';

import * as log from '#utils/log';

import {setDefaultBootstrapBaseUrlForTesting} from '../../../../src/3p-frame';
import {resetServiceForTesting} from '../../../../src/service-helpers';

describes.realWin(
  'amp-facebook',
  {
    amp: {
      extensions: ['amp-facebook'],
      canonicalUrl: 'https://foo.bar/baz',
    },
  },
  function (env) {
    this.timeout(5000);

    const fbPostHref = 'https://www.facebook.com/zuck/posts/10102593740125791';
    const fbVideoHref =
      'https://www.facebook.com/zuck/videos/10102509264909801/';
    const fbCommentHref =
      'https://www.facebook.com/zuck/posts/10102735452532991?comment_id=1070233703036185';
    let win, doc;

    beforeEach(() => {
      win = env.win;
      doc = win.document;
    });

    async function getAmpFacebook(href, opt_embedAs, opt_locale) {
      const ampFB = doc.createElement('amp-facebook');
      ampFB.setAttribute('data-href', href);
      ampFB.setAttribute('width', '111');
      ampFB.setAttribute('height', '222');
      if (opt_embedAs) {
        ampFB.setAttribute('data-embed-as', opt_embedAs);
      }
      if (opt_locale) {
        ampFB.setAttribute('data-locale', opt_locale);
      } else {
        ampFB.setAttribute('data-locale', 'en_US');
      }
      doc.body.appendChild(ampFB);
      await ampFB.buildInternal();
      await ampFB.layoutCallback();
      return ampFB;
    }

    it('renders iframe in amp-facebook', async () => {
      const ampFB = await getAmpFacebook(fbPostHref);
      const iframe = ampFB.firstChild;
      expect(iframe).to.not.be.null;
      expect(iframe.tagName).to.equal('IFRAME');
      expect(iframe.className).to.match(/i-amphtml-fill-content/);
    });

    it('ensures iframe is not sandboxed in amp-facebook', async () => {
      // We sandbox all 3P iframes however facebook embeds completely break in
      // sandbox mode since they need access to document.domain, so we
      // exclude facebook.
      const ampFB = await getAmpFacebook(fbPostHref);
      const iframe = ampFB.firstChild;
      expect(iframe).to.not.be.null;
      expect(iframe.tagName).to.equal('IFRAME');
      expect(iframe.hasAttribute('sandbox')).to.be.false;
    });

    it('renders iframe in amp-facebook with video', async () => {
      const ampFB = await getAmpFacebook(fbVideoHref, 'video');
      const iframe = ampFB.firstChild;
      expect(iframe).to.not.be.null;
      expect(iframe.tagName).to.equal('IFRAME');
      expect(iframe.className).to.match(/i-amphtml-fill-content/);

      const context = JSON.parse(iframe.getAttribute('name'));
      expect(context.attributes.embedAs).to.equal('video');
    });

    it('warns unsupported data-embed-as value: comment', async () => {
      const warn = env.sandbox.spy();
      env.sandbox.stub(log, 'user').returns({warn});
      expect(warn).not.to.be.called;
      await getAmpFacebook(fbCommentHref, 'comment');
      expect(warn).to.be.calledOnce;
    });

    it('rejects other supported and unsupported data-embed-as types', async () => {
      expectAsyncConsoleError(/.*/);
      await expect(getAmpFacebook(fbVideoHref, 'comments')).to.be.rejectedWith(
        /Attribute data-embed-as for <amp-facebook> value is wrong, should be "post" or "video" but was: comments/
      );
      await expect(getAmpFacebook(fbVideoHref, 'like')).to.be.rejectedWith(
        /Attribute data-embed-as for <amp-facebook> value is wrong, should be "post" or "video" but was: like/
      );
      await expect(getAmpFacebook(fbVideoHref, 'page')).to.be.rejectedWith(
        /Attribute data-embed-as for <amp-facebook> value is wrong, should be "post" or "video" but was: page/
      );
      await expect(
        getAmpFacebook(fbVideoHref, 'unsupported')
      ).to.be.rejectedWith(
        /Attribute data-embed-as for <amp-facebook> value is wrong, should be "post" or "video" but was: unsupported/
      );
    });

    it('renders amp-facebook with detected locale', async () => {
      const ampFB = await getAmpFacebook(fbVideoHref, 'post');
      expect(ampFB).not.to.be.undefined;
      expect(ampFB.getAttribute('data-locale')).to.equal('en_US');

      const iframe = ampFB.firstChild;
      expect(iframe).to.not.be.null;
      expect(iframe.tagName).to.equal('IFRAME');

      const context = JSON.parse(iframe.getAttribute('name'));
      expect(context.attributes.embedAs).to.equal('post');
    });

    it('renders amp-facebook with specified locale', async () => {
      const ampFB = await getAmpFacebook(fbVideoHref, 'post', 'fr_FR');
      expect(ampFB).not.to.be.undefined;
      expect(ampFB.getAttribute('data-locale')).to.equal('fr_FR');
    });

    it('adds loading element correctly', async () => {
      const ampFB = await getAmpFacebook(fbVideoHref, 'post');
      const impl = await ampFB.getImpl(false);
      expect(impl.toggleLoadingCounter_).to.equal(1);
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

    it("retains fb-video element with `data-embed-as='video'`", () => {
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

    it("retains fb-video element with `data-embed-as='post'`", () => {
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

    it('removes iframe after unlayoutCallback', async () => {
      const ampFB = await getAmpFacebook(fbPostHref);
      const obj = await ampFB.getImpl(false);
      const iframe = ampFB.querySelector('iframe');
      expect(iframe).to.not.be.null;
      obj.unlayoutCallback();
      expect(ampFB.querySelector('iframe')).to.be.null;
      expect(obj.iframe_).to.be.null;
      expect(obj.unlayoutOnPause()).to.be.true;
    });

    describes.realWin(
      'resize',
      {
        amp: {
          extensions: ['amp-facebook'],
          canonicalUrl: 'https://foo.bar/baz',
        },
        allowExternalResources: true,
      },
      function (env) {
        beforeEach(() => {
          win = env.win;
          doc = win.document;
        });

        it('resizes facebook posts', async () => {
          const iframeSrc =
            'http://ads.localhost:' +
            location.port +
            '/test/fixtures/served/iframe.html';
          resetServiceForTesting(win, 'bootstrapBaseUrl');
          setDefaultBootstrapBaseUrlForTesting(iframeSrc);
          const ampFB = await getAmpFacebook(fbPostHref);
          const impl = await ampFB.getImpl(false);
          return new Promise((resolve, unusedReject) => {
            const {firstChild: iframe} = ampFB;
            impl.forceChangeHeight = (newHeight) => {
              expect(newHeight).to.equal(666);
              resolve(ampFB);
            };
            const message = {
              type: 'requestHeight',
              is3p: true,
              height: 666,
            };
            message['sentinel'] = iframe.getAttribute('data-amp-3p-sentinel');
            iframe.contentWindow.postMessage(message, '*');
          });
        });
      }
    );
  }
);
