import '../amp-tiktok';
import * as dom from '#core/dom';
import {computedStyle} from '#core/dom/style';

import {Services} from '#service';

const VIDEOID = '6948210747285441798';

describes.realWin(
  'amp-tiktok',
  {
    amp: {
      extensions: ['amp-tiktok'],
    },
  },
  (env) => {
    let win;
    let doc;
    let createElementWithAttributes;

    beforeEach(() => {
      win = env.win;
      doc = win.document;
      createElementWithAttributes = dom.createElementWithAttributes;

      env.sandbox
        .stub(dom, 'createElementWithAttributes')
        .callsFake((document, tagName, attributes) => {
          if (tagName === 'iframe' && attributes.src) {
            // Serve a blank page, since these tests don't require an actual page.
            // hash # at the end so path is not affected by param concat
            attributes.src = `http://localhost:${location.port}/test/fixtures/served/blank.html#${attributes.src}`;
          }
          return createElementWithAttributes(document, tagName, attributes);
        });

      const oEmbedJsonResponse = {
        'thumbnail_url': '/examples/img/ampicon.png',
        'title': 'Test TikTok Title',
      };
      env.sandbox
        .stub(Services.xhrFor(win), 'fetchJson')
        .resolves({json: () => Promise.resolve(oEmbedJsonResponse)});
    });

    function getTiktokBuildOnly(attrs = {}) {
      const tiktok = dom.createElementWithAttributes(
        win.document,
        'amp-tiktok',
        {
          layout: 'responsive',
          width: '325px',
          height: '730px',
          ...attrs,
        }
      );
      doc.body.appendChild(tiktok);
      return tiktok.buildInternal().then(() => tiktok);
    }

    async function getTiktok(attrs = {}) {
      const tiktok = await getTiktokBuildOnly(attrs);
      const impl = await tiktok.getImpl();
      return impl.layoutCallback().then(() => tiktok);
    }

    it('renders with videoId', async () => {
      const player = await getTiktok({'data-src': VIDEOID});
      const iframe = player.querySelector('iframe');
      expect(iframe).to.not.be.null;
      expect(iframe.getAttribute('src')).to.contain(VIDEOID);
      expect(iframe.getAttribute('src')).to.contain('en-US');
    });

    it('renders with video src url', async () => {
      const videoSrc =
        'https://www.tiktok.com/@scout2015/video/6948210747285441798';
      const player = await getTiktok({'data-src': videoSrc});
      const iframe = player.querySelector('iframe');
      expect(iframe).to.not.be.null;
      expect(iframe.getAttribute('src')).to.contain(VIDEOID);
      expect(iframe.getAttribute('src')).to.contain('en-US');
    });

    it('renders with videoId and locale', async () => {
      const player = await getTiktok({
        'data-src': VIDEOID,
        'data-locale': 'fr-FR',
      });
      const iframe = player.querySelector('iframe');
      expect(iframe).to.not.be.null;
      expect(iframe.getAttribute('src')).to.contain(VIDEOID);
      expect(iframe.getAttribute('src')).to.contain('fr-FR');
    });

    it('resizes using the fallback mechanism when no messages are received', async () => {
      // Stub timeoutPromise to skip 1000ms wait before catch statement executes.
      env.sandbox.stub(Services.timerFor(win), 'timeoutPromise').rejects();
      const player = await getTiktok({'data-src': VIDEOID});

      const playerIframe = player.querySelector('iframe');
      expect(computedStyle(win, playerIframe).height).to.equal('775.25px');
    });

    it('should resolve messages received before load', async () => {
      const tiktok = await getTiktokBuildOnly({height: '600'});
      const impl = await tiktok.getImpl();

      // ensure that loadPromise is never resolved
      env.sandbox.stub(impl, 'loadPromise').returns(new Promise(() => {}));
      impl.layoutCallback();

      // ensure that resolver is set after layoutCallback
      expect(impl.resolveReceivedFirstMessage_).to.be.ok;
      const firstMessageStub = env.sandbox.stub(
        impl,
        'resolveReceivedFirstMessage_'
      );
      impl.handleTiktokMessages_({
        origin: 'https://www.tiktok.com',
        source: tiktok.querySelector('iframe').contentWindow,
        data: JSON.stringify({height: 555}),
      });
      expect(firstMessageStub).to.be.calledOnce;
    });

    it('renders placeholder', async () => {
      const videoSrc =
        'https://www.tiktok.com/@scout2015/video/6948210747285441798';
      const player = await getTiktok({'data-src': videoSrc});
      const placeholder = player.querySelector('img');
      expect(placeholder).to.not.be.null;
      expect(placeholder.getAttribute('src')).to.equal(
        '/examples/img/ampicon.png'
      );
    });

    it('renders aria title without oEmbed Request', async () => {
      // Stub timeoutPromise to skip 1000ms wait before catch statement executes.
      env.sandbox.stub(Services.timerFor(win), 'timeoutPromise').rejects();
      const player = await getTiktok({'data-src': VIDEOID});

      const playerIframe = player.querySelector('iframe');
      expect(playerIframe.title).to.equal('TikTok');
    });

    it('renders aria title with oEmbed request', async () => {
      const videoSrc =
        'https://www.tiktok.com/@scout2015/video/6948210747285441798';
      const player = await getTiktok({'data-src': videoSrc});
      const impl = await player.getImpl();
      // Replace debounced function with function which is called directly to avoid 1000ms wait.
      impl.resizeOuterDebounced_ = impl.resizeOuter_;

      const playerIframe = player.querySelector('iframe');
      expect(playerIframe.title).to.equal('TikTok: Test TikTok Title');
    });

    it('removes iframe after unlayoutCallback', async () => {
      const player = await getTiktok({'data-src': VIDEOID});
      const playerIframe = player.querySelector('iframe');
      expect(playerIframe).to.not.be.null;

      const impl = await player.getImpl(false);
      impl.unlayoutCallback();
      expect(player.querySelector('iframe')).to.be.null;
      expect(impl.iframe_).to.be.null;
    });
  }
);
