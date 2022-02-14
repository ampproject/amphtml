import '../amp-google-read-aloud-player';

import {createElementWithAttributes} from '#core/dom';

import {Services} from '#service';

import {macroTask} from '#testing/helpers';

const IFRAME_BASE_URL =
  'https://www.gstatic.com/readaloud/player/web/api/iframe/index.html';

const API_KEY = 'YOUR_API_KEY';
const TRACKING_IDS = 'YOUR_TRACKING_IDS';
const URL = 'http://www.example.com';
const CALL_TO_ACTION_LABEL = 'Listen to this article';
const LOCALE = 'en';
const INTRO = 'http://www.example.com/intro.mp3';
const OUTRO = 'http://www.example.com/outro.mp3';
const AD_TAG_URL = 'http://www.example.com/ad';
const VOICE = 'SOME_VOICE';
const BASE_SRC = 'https://localhost:8080/';

const LAYOUT_ATTRS = {
  height: 60,
};

describes.realWin(
  'amp-google-read-aloud-player',
  {
    amp: {
      extensions: ['amp-google-read-aloud-player'],
    },
  },
  (env) => {
    let win;
    let doc;
    let videoManagerStub;

    beforeEach(() => {
      win = env.win;
      doc = win.document;

      videoManagerStub = {
        register: env.sandbox.spy(),
      };

      env.sandbox
        .stub(Services, 'videoManagerForDoc')
        .returns(videoManagerStub);
    });

    function createGoogleReadAloudPlayer(attrs = {}) {
      const el = createElementWithAttributes(
        doc,
        'amp-google-read-aloud-player',
        {
          ...attrs,
          ...LAYOUT_ATTRS,
        }
      );
      doc.body.appendChild(el);
      return el;
    }

    function createAndRenderGoogleReadAloudPlayer(attrs = {}) {
      const element = createGoogleReadAloudPlayer(attrs);

      return element
        .buildInternal()
        .then(() => {
          element.layoutCallback();
        })
        .then(() => element);
    }

    async function createAndRenderBasicGoogleReadAloudPlayer() {
      return createAndRenderGoogleReadAloudPlayer({
        'data-api-key': API_KEY,
        'data-tracking-ids': TRACKING_IDS,
        'data-voice': VOICE,
      });
    }

    async function stubPostMessage(element) {
      const impl = await element.getImpl(false);
      return env.sandbox./*OK*/ stub(impl, 'postMessage_');
    }

    describe('#layoutCallback', () => {
      it('sets required params in iframe src', async () => {
        const canonicalUrl = 'foo.html';
        const sourceUrl = 'bar.html';
        env.sandbox.stub(Services, 'documentInfoForDoc').returns({
          canonicalUrl,
          sourceUrl,
        });

        const element = await createAndRenderBasicGoogleReadAloudPlayer();

        const iframe = element.querySelector('iframe');
        expect(iframe).to.not.be.null;
        expect(iframe.src).to.contain(
          `${IFRAME_BASE_URL}?` +
            `apiKey=${API_KEY}&` +
            `trackingIds=${TRACKING_IDS}&` +
            `voice=${VOICE}`
        );
      });

      it('sets optional params in iframe src', async () => {
        const element = await createAndRenderGoogleReadAloudPlayer({
          'data-api-key': API_KEY,
          'data-tracking-ids': TRACKING_IDS,
          'data-voice': VOICE,
          'data-url': URL,
          'data-speakable': '',
          'data-call-to-action-label': CALL_TO_ACTION_LABEL,
          'data-locale': LOCALE,
          'data-intro': INTRO,
          'data-outro': OUTRO,
          'data-ad-tag-url': AD_TAG_URL,
        });

        const iframe = element.querySelector('iframe');
        expect(iframe).to.not.be.null;
        expect(iframe.src).to.contain(
          `${IFRAME_BASE_URL}?` +
            `apiKey=${API_KEY}&` +
            `trackingIds=${TRACKING_IDS}&` +
            `voice=${VOICE}&` +
            `url=${encodeURIComponent(URL)}&` +
            `speakable=&` +
            `callToActionLabel=${encodeURIComponent(CALL_TO_ACTION_LABEL)}&` +
            `locale=${LOCALE}&` +
            `intro=${encodeURIComponent(INTRO)}&` +
            `outro=${encodeURIComponent(OUTRO)}&` +
            `adTagUrl=${encodeURIComponent(AD_TAG_URL)}`
        );
      });

      it('sets optional iframe base src', async () => {
        const element = await createAndRenderGoogleReadAloudPlayer({
          'data-api-key': API_KEY,
          'data-tracking-ids': TRACKING_IDS,
          'data-voice': VOICE,
          'src': BASE_SRC,
        });

        const iframe = element.querySelector('iframe');
        expect(iframe).to.not.be.null;
        expect(iframe.src).to.contain(
          `${BASE_SRC}?` +
            `apiKey=${API_KEY}&` +
            `trackingIds=${TRACKING_IDS}&` +
            `voice=${VOICE}`
        );
      });

      it('sets metadata in iframe name — with jsonLd', async () => {
        const canonicalUrl = 'foo.html';
        const sourceUrl = 'bar.html';
        env.sandbox.stub(Services, 'documentInfoForDoc').returns({
          canonicalUrl,
          sourceUrl,
        });

        const jsonLd = {jsonLd: 'blah'};
        const jsonLdScript = win.document.createElement('script');
        jsonLdScript.type = 'application/ld+json';
        jsonLdScript.text = JSON.stringify(jsonLd);

        win.document.head.appendChild(jsonLdScript);

        const element = await createAndRenderBasicGoogleReadAloudPlayer();

        const iframe = element.querySelector('iframe');
        expect(iframe).to.not.be.null;
        expect(JSON.parse(iframe.name)).to.deep.equal({
          canonicalUrl,
          sourceUrl,
          jsonLd,
        });
      });

      it('sets ampGoogleReadAloudPlayer=1 fragment in src', async () => {
        const element = await createAndRenderBasicGoogleReadAloudPlayer();

        const iframe = element.querySelector('iframe');
        expect(iframe).to.not.be.null;
        expect(iframe.src).to.match(/.*#ampGoogleReadAloudPlayer=1$/);
      });
    });

    const implementedVideoInterfaceMethods = [
      'play',
      'pause',
      'mute',
      'unmute',
    ];

    implementedVideoInterfaceMethods.forEach((method) => {
      describe(`#${method}`, () => {
        const lowercaseMethod = method.toLowerCase();

        it(`should post '${lowercaseMethod}'`, async () => {
          const element = await createAndRenderBasicGoogleReadAloudPlayer();

          const postMessage = await stubPostMessage(element);

          const impl = await element.getImpl(false);
          impl[method]();

          await macroTask();

          expect(postMessage.withArgs(lowercaseMethod)).to.have.been.calledOnce;
        });
      });
    });

    it('unlayoutCallback', async () => {
      const element = await createAndRenderBasicGoogleReadAloudPlayer();

      const impl = await element.getImpl(false);
      expect(impl.unlayoutCallback()).to.be.true;

      const iframe = element.querySelector('iframe');
      expect(iframe).to.be.null;
      expect(impl.iframe).to.be.undefined;
    });

    it('pauseCallback', async () => {
      const element = await createAndRenderBasicGoogleReadAloudPlayer();
      const impl = await element.getImpl(false);
      env.sandbox.spy(impl, 'pause');

      impl.pauseCallback();
      expect(impl.pause.withArgs()).to.have.been.calledOnce;
    });

    it('resumeCallback', async () => {
      const element = await createAndRenderBasicGoogleReadAloudPlayer();
      const impl = await element.getImpl(false);
      env.sandbox.spy(impl, 'play');

      impl.resumeCallback();
      expect(impl.play.withArgs(false)).to.have.been.calledOnce;
    });
  }
);
