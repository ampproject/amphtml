/**
 * Copyright 2015 The AMP HTML Authors. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS-IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import '../amp-brightcove';
import * as consent from '../../../../src/consent';
import {CONSENT_POLICY_STATE} from '../../../../src/consent-state';
import {CommonSignals} from '../../../../src/common-signals';
import {VideoEvents} from '../../../../src/video-interface';
import {
  createElementWithAttributes,
  whenUpgradedToCustomElement,
} from '../../../../src/dom';
import {listenOncePromise} from '../../../../src/event-helper';
import {macroTask} from '../../../../testing/yield';
import {parseUrlDeprecated} from '../../../../src/url';

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
    });

    async function getBrightcove(attributes) {
      const element = createElementWithAttributes(doc, 'amp-brightcove', {
        width: '111',
        height: '222',
        ...attributes,
      });

      doc.body.appendChild(element);

      await whenUpgradedToCustomElement(element);

      const impl = await element.getImpl(false);

      await element.signals().whenSignal(CommonSignals.LOAD_START);

      // Wait for the promise in layoutCallback() to resolve
      await macroTask();

      try {
        fakePostMessage(impl, {event: 'ready'});
      } catch (_) {
        // This fails when the iframe is not available (after layoutCallback
        // fails) in which case awaiting the LOAD_END sigal below will throw.
      }

      await element.signals().whenSignal(CommonSignals.LOAD_END);

      return element;
    }

    function fakePostMessage(impl, info) {
      impl.handlePlayerMessage_({
        origin: 'https://players.brightcove.net',
        source: impl.element.querySelector('iframe').contentWindow,
        data: JSON.stringify(info),
      });
    }

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
            '/index.html?videoId=ref:amp-test-video&playsinline=true'
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

    it('should propagate mutated attributes', () => {
      return getBrightcove({
        'data-account': '1290862519001',
        'data-video-id': 'ref:amp-test-video',
      }).then((bc) => {
        const iframe = bc.querySelector('iframe');

        expect(iframe.src).to.equal(
          'https://players.brightcove.net/1290862519001/default_default' +
            '/index.html?videoId=ref:amp-test-video&playsinline=true'
        );

        bc.setAttribute('data-account', '12345');
        bc.setAttribute('data-video-id', 'abcdef');
        bc.mutatedAttributesCallback({
          'data-account': '12345',
          'data-video-id': 'abcdef',
        });

        expect(iframe.src).to.equal(
          'https://players.brightcove.net/' +
            '12345/default_default/index.html?videoId=abcdef&playsinline=true'
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
          const p = listenOncePromise(bc, VideoEvents.LOAD);
          fakePostMessage(impl, {event: 'ready', muted: false, playing: false});
          return p;
        })
        .then(() => {
          const p = listenOncePromise(bc, VideoEvents.LOADEDMETADATA);
          fakePostMessage(impl, {
            event: 'loadedmetadata',
            muted: false,
            playing: false,
          });
          return p;
        })
        .then(() => {
          const p = listenOncePromise(bc, VideoEvents.AD_START);
          fakePostMessage(impl, {
            event: 'ads-ad-started',
            muted: false,
            playing: false,
          });
          return p;
        })
        .then(() => {
          const p = listenOncePromise(bc, VideoEvents.AD_END);
          fakePostMessage(impl, {
            event: 'ads-ad-ended',
            muted: false,
            playing: false,
          });
          return p;
        })
        .then(() => {
          const p = listenOncePromise(bc, VideoEvents.PLAYING);
          fakePostMessage(impl, {
            event: 'playing',
            muted: false,
            playing: true,
          });
          return p;
        })
        .then(() => {
          const p = listenOncePromise(bc, VideoEvents.MUTED);
          fakePostMessage(impl, {
            event: 'volumechange',
            muted: true,
            playing: true,
          });
          return p;
        })
        .then(() => {
          const p = listenOncePromise(bc, VideoEvents.UNMUTED);
          fakePostMessage(impl, {
            event: 'volumechange',
            muted: false,
            playing: true,
          });
          return p;
        })
        .then(() => {
          const p = listenOncePromise(bc, VideoEvents.PAUSE);
          fakePostMessage(impl, {event: 'pause', muted: false, playing: false});
          return p;
        })
        .then(() => {
          const p = listenOncePromise(bc, VideoEvents.ENDED);
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
  }
);
