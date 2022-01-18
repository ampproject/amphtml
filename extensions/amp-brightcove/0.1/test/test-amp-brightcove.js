import '../amp-brightcove';
import {CommonSignals_Enum} from '#core/constants/common-signals';
import {CONSENT_POLICY_STATE} from '#core/constants/consent-state';
import {createElementWithAttributes} from '#core/dom';
import {whenUpgradedToCustomElement} from '#core/dom/amp-element-helpers';

import {listenOncePromise} from '#utils/event-helper';

import {macroTask} from '#testing/helpers';

import {BaseElement} from '../../../../src/base-element';
import * as consent from '../../../../src/consent';
import {parseUrlDeprecated} from '../../../../src/url';
import {VideoEvents_Enum} from '../../../../src/video-interface';

describes.realWin(
  'amp-brightcove',
  {
    amp: {
      extensions: ['amp-brightcove'],
      runtimeOn: true,
    },
  },
  (env) => {
    let win, doc;

    beforeEach(() => {
      win = env.win;
      doc = win.document;

      // make sync
      env.sandbox
        .stub(BaseElement.prototype, 'mutateElement')
        .callsFake((mutator) => {
          mutator();
        });
    });

    async function getBrightcoveBuild(attributes) {
      const element = createElementWithAttributes(doc, 'amp-brightcove', {
        width: '111',
        height: '222',
        ...attributes,
      });

      doc.body.appendChild(element);

      await whenUpgradedToCustomElement(element);
      await element.whenBuilt();

      return element;
    }

    async function getBrightcove(attributes) {
      const element = await getBrightcoveBuild(attributes);
      const impl = await element.getImpl(false);

      await element.signals().whenSignal(CommonSignals_Enum.LOAD_START);

      // Wait for the promise in layoutCallback() to resolve
      await macroTask();

      try {
        fakePostMessage(impl, {event: 'ready'});
      } catch (_) {
        // This fails when the iframe is not available (after layoutCallback
        // fails) in which case awaiting the LOAD_END sigal below will throw.
      }

      await element.signals().whenSignal(CommonSignals_Enum.LOAD_END);

      return element;
    }

    function fakePostMessage(impl, info) {
      impl.handlePlayerMessage_({
        origin: 'https://players.brightcove.net',
        source: impl.element.querySelector('iframe').contentWindow,
        data: JSON.stringify(info),
      });
    }

    it('should not remove `dock`', async () => {
      const element = await getBrightcoveBuild({
        'data-account': '1290862519001',
        'data-video-id': 'ref:amp-test-video',
        'dock': '',
      });
      expect(element.hasAttribute('dock')).to.be.true;
    });

    it('renders', () => {
      return getBrightcove({
        'data-account': '1290862519001',
        'data-video-id': 'ref:amp-test-video',
      }).then((bc) => {
        const iframe = bc.querySelector('iframe');
        expect(iframe).to.not.be.null;
        expect(iframe.tagName).to.equal('IFRAME');
        expect(iframe.src).to.equal(
          'https://players.brightcove.net/1290862519001/default_default' +
            '/index.html?amp=1' +
            '&videoId=ref:amp-test-video&playsinline=true'
        );
      });
    });

    it('removes iframe after unlayoutCallback', async () => {
      const bc = await getBrightcove({
        'data-account': '1290862519001',
        'data-video-id': 'ref:amp-test-video',
      });
      const obj = await bc.getImpl();
      const iframe = bc.querySelector('iframe');
      expect(iframe).to.not.be.null;
      obj.unlayoutCallback();
      expect(bc.querySelector('iframe')).to.be.null;
      expect(obj.iframe_).to.be.null;
    });

    it('should pass data-param-* attributes to the iframe src', () => {
      return getBrightcove({
        'data-account': '1290862519001',
        'data-video-id': 'ref:amp-test-video',
        'data-param-my-param': 'hello world',
      }).then((bc) => {
        const iframe = bc.querySelector('iframe');
        const params = parseUrlDeprecated(iframe.src).search.split('&');
        expect(params).to.contain('myParam=hello%20world');
      });
    });

    it('should exclude data-param-autoplay attribute', () => {
      return getBrightcove({
        'data-account': '1290862519001',
        'data-video-id': 'ref:amp-test-video',
        'data-param-autoplay': 'muted',
      }).then((bc) => {
        const iframe = bc.querySelector('iframe');
        const params = parseUrlDeprecated(iframe.src).search.split('&');
        expect(params).to.not.contain('autoplay');
      });
    });

    it('should propagate mutated attributes', () => {
      return getBrightcove({
        'data-account': '1290862519001',
        'data-video-id': 'ref:amp-test-video',
      }).then((bc) => {
        const iframe = bc.querySelector('iframe');

        expect(iframe.src).to.equal(
          'https://players.brightcove.net/1290862519001/default_default' +
            '/index.html?amp=1' +
            '&videoId=ref:amp-test-video&playsinline=true'
        );

        bc.setAttribute('data-account', '12345');
        bc.setAttribute('data-video-id', 'abcdef');
        bc.mutatedAttributesCallback({
          'data-account': '12345',
          'data-video-id': 'abcdef',
        });

        expect(iframe.src).to.equal(
          'https://players.brightcove.net/' +
            '12345/default_default/index.html?amp=1' +
            '&videoId=abcdef&playsinline=true'
        );
      });
    });

    it('should give precedence to playlist id', () => {
      return getBrightcove({
        'data-account': '1290862519001',
        'data-video-id': 'ref:amp-test-video',
        'data-playlist-id': 'ref:test-playlist',
      }).then((bc) => {
        const iframe = bc.querySelector('iframe');

        expect(iframe.src).to.contain('playlistId=ref:test-playlist');
        expect(iframe.src).not.to.contain('videoId');
      });
    });

    it('should allow both playlist and video id to be unset', () => {
      return getBrightcove({
        'data-account': '1290862519001',
      }).then((bc) => {
        const iframe = bc.querySelector('iframe');

        expect(iframe.src).not.to.contain('&playlistId');
        expect(iframe.src).not.to.contain('&videoId');
      });
    });

    it('should pass referrer', () => {
      return getBrightcove({
        'data-account': '1290862519001',
        'data-referrer': 'COUNTER',
      }).then((bc) => {
        const iframe = bc.querySelector('iframe');

        expect(iframe.src).to.contain('referrer=1');
      });
    });

    it('should force playsinline', () => {
      return getBrightcove({
        'data-account': '1290862519001',
        'data-video-id': 'ref:amp-test-video',
        'data-param-playsinline': 'false',
      }).then((bc) => {
        const iframe = bc.querySelector('iframe');

        expect(iframe.src).to.contain('playsinline=true');
      });
    });

    it('should forward events', async () => {
      const bc = await getBrightcove({
        'data-account': '1290862519001',
        'data-video-id': 'ref:amp-test-video',
      });
      const impl = await bc.getImpl();
      return Promise.resolve()
        .then(() => {
          const p = listenOncePromise(bc, VideoEvents_Enum.LOAD);
          fakePostMessage(impl, {event: 'ready', muted: false, playing: false});
          return p;
        })
        .then(() => {
          const p = listenOncePromise(bc, VideoEvents_Enum.LOADEDMETADATA);
          fakePostMessage(impl, {
            event: 'loadedmetadata',
            muted: false,
            playing: false,
          });
          return p;
        })
        .then(() => {
          const p = listenOncePromise(bc, VideoEvents_Enum.AD_START);
          fakePostMessage(impl, {
            event: 'ads-ad-started',
            muted: false,
            playing: false,
          });
          return p;
        })
        .then(() => {
          const p = listenOncePromise(bc, VideoEvents_Enum.AD_END);
          fakePostMessage(impl, {
            event: 'ads-ad-ended',
            muted: false,
            playing: false,
          });
          return p;
        })
        .then(() => {
          const p = listenOncePromise(bc, VideoEvents_Enum.PLAYING);
          fakePostMessage(impl, {
            event: 'playing',
            muted: false,
            playing: true,
          });
          return p;
        })
        .then(() => {
          const p = listenOncePromise(bc, VideoEvents_Enum.MUTED);
          fakePostMessage(impl, {
            event: 'volumechange',
            muted: true,
            playing: true,
          });
          return p;
        })
        .then(() => {
          const p = listenOncePromise(bc, VideoEvents_Enum.UNMUTED);
          fakePostMessage(impl, {
            event: 'volumechange',
            muted: false,
            playing: true,
          });
          return p;
        })
        .then(() => {
          const p = listenOncePromise(bc, VideoEvents_Enum.PAUSE);
          fakePostMessage(impl, {event: 'pause', muted: false, playing: false});
          return p;
        })
        .then(() => {
          const p = listenOncePromise(bc, VideoEvents_Enum.ENDED);
          fakePostMessage(impl, {event: 'ended', muted: false, playing: false});
          return p;
        });
    });

    it('should propagate consent state to iframe', () => {
      env.sandbox
        .stub(consent, 'getConsentPolicyState')
        .resolves(CONSENT_POLICY_STATE.SUFFICIENT);
      env.sandbox
        .stub(consent, 'getConsentPolicySharedData')
        .resolves({a: 1, b: 2});
      env.sandbox.stub(consent, 'getConsentPolicyInfo').resolves('abc');

      return getBrightcove({
        'data-account': '1290862519001',
        'data-video-id': 'ref:amp-test-video',
        'data-block-on-consent': '_till_accepted',
      }).then((bc) => {
        const iframe = bc.querySelector('iframe');

        expect(iframe.src).to.contain(
          `ampInitialConsentState=${CONSENT_POLICY_STATE.SUFFICIENT}`
        );
        expect(iframe.src).to.contain(
          `ampConsentSharedData=${encodeURIComponent(
            JSON.stringify({a: 1, b: 2})
          )}`
        );
        expect(iframe.src).to.contain('ampInitialConsentValue=abc');
      });
    });

    it('should distinguish autoplay', async () => {
      const bc = await getBrightcove({
        'data-account': '1290862519001',
        'data-video-id': 'ref:amp-test-video',
      });
      const impl = await bc.getImpl();
      const spy = env.sandbox.spy(impl, 'sendCommand_');

      impl.play(true);
      expect(spy).to.be.calledWith('play', true);

      impl.play(false);
      expect(spy).to.be.calledWith('play', false);
    });
  }
);
