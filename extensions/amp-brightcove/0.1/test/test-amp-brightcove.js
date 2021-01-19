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
import {
  expectRealIframeSrcEquals,
  getRealSrcFromTestingUrl,
  getVideoIframeTestHelpers,
} from '../../../../testing/iframe-video';
import {macroTask} from '../../../../testing/yield';
import {parseUrlDeprecated} from '../../../../src/url';

const TAG = 'amp-brightcove';

describes.realWin(TAG, {amp: {extensions: [TAG], runtimeOn: true}}, (env) => {
  const {fakePostMessage, listenToForwardedEvent} = getVideoIframeTestHelpers(
    env,
    TAG,
    {
      origin: 'https://players.brightcove.net',
      serializeMessage: JSON.stringify,
      layoutMessage: {event: 'ready'},
    }
  );

  async function getAmpBrightcove(attributes) {
    const element = createElementWithAttributes(
      env.win.document,
      'amp-brightcove',
      {
        width: '111',
        height: '222',
        ...attributes,
      }
    );

    env.win.document.body.appendChild(element);

    await whenUpgradedToCustomElement(element);

    await element.signals().whenSignal(CommonSignals.LOAD_START);

    // Wait for the promise in layoutCallback() to resolve
    await macroTask();

    try {
      fakePostMessage(element, {event: 'ready'});
    } catch (_) {
      // This fails when the iframe is not available (after layoutCallback
      // fails) in which case awaiting the LOAD_END sigal below will throw.
    }

    await element.signals().whenSignal(CommonSignals.LOAD_END);

    return element;
  }

  // function fakePostMessage(element, info) {
  //   element.implementation_.handleMessage_({
  //     origin: 'https://players.brightcove.net',
  //     source: element.querySelector('iframe').contentWindow,
  //     data: JSON.stringify(info),
  //   });
  // }

  // function listenToEventFromMessage(element, event, message) {
  //   const promise = listenOncePromise(element, event);
  //   fakePostMessage(element, message);
  //   return promise;
  // }

  it('renders', async () => {
    const element = await getAmpBrightcove({
      'data-account': '1290862519001',
      'data-video-id': 'ref:amp-test-video',
    });
    const iframe = element.querySelector('iframe');
    expect(iframe).to.not.be.null;
    expect(iframe.tagName).to.equal('IFRAME');
    expectRealIframeSrcEquals(
      iframe,
      'https://players.brightcove.net/1290862519001/default_default' +
        '/index.html?videoId=ref:amp-test-video&playsinline=true'
    );
  });

  it('requires data-account', () => {
    const expectedError = /The data-account attribute is required for/;
    expectAsyncConsoleError(expectedError, 1);
    return getAmpBrightcove({}).should.eventually.be.rejectedWith(
      expectedError
    );
  });

  it('removes iframe after unlayoutCallback', async () => {
    const element = await getAmpBrightcove({
      'data-account': '1290862519001',
      'data-video-id': 'ref:amp-test-video',
    });
    const iframe = element.querySelector('iframe');
    expect(iframe).to.not.be.null;
    const obj = element.implementation_;
    obj.unlayoutCallback();
    expect(element.querySelector('iframe')).to.be.null;
    expect(obj.iframe_).to.be.null;
  });

  it('should pass data-param-* attributes to the iframe src', async () => {
    const element = await getAmpBrightcove({
      'data-account': '1290862519001',
      'data-video-id': 'ref:amp-test-video',
      'data-param-my-param': 'hello world',
    });
    const iframe = element.querySelector('iframe');
    const params = parseUrlDeprecated(
      getRealSrcFromTestingUrl(iframe)
    ).search.split('&');
    expect(params).to.contain('myParam=hello%20world');
  });

  it('should propagate mutated attributes', async () => {
    const element = await getAmpBrightcove({
      'data-account': '1290862519001',
      'data-video-id': 'ref:amp-test-video',
    });
    const iframe = element.querySelector('iframe');

    expectRealIframeSrcEquals(
      iframe,
      'https://players.brightcove.net/1290862519001/default_default' +
        '/index.html?videoId=ref:amp-test-video&playsinline=true'
    );

    element.setAttribute('data-account', '12345');
    element.setAttribute('data-video-id', 'abcdef');
    element.mutatedAttributesCallback({
      'data-account': '12345',
      'data-video-id': 'abcdef',
    });

    expectRealIframeSrcEquals(
      iframe,
      'https://players.brightcove.net/' +
        '12345/default_default/index.html?videoId=abcdef&playsinline=true'
    );
  });

  it('should give precedence to playlist id', async () => {
    const element = await getAmpBrightcove({
      'data-account': '1290862519001',
      'data-video-id': 'ref:amp-test-video',
      'data-playlist-id': 'ref:test-playlist',
    });
    const iframe = element.querySelector('iframe');
    expect(iframe.src).to.contain('playlistId=ref:test-playlist');
    expect(iframe.src).not.to.contain('videoId');
  });

  it('should allow both playlist and video id to be unset', async () => {
    const element = await getAmpBrightcove({
      'data-account': '1290862519001',
    });
    const iframe = element.querySelector('iframe');
    expect(iframe.src).not.to.contain('&playlistId');
    expect(iframe.src).not.to.contain('&videoId');
  });

  it('should pass referrer', async () => {
    const element = await getAmpBrightcove({
      'data-account': '1290862519001',
      'data-referrer': 'COUNTER',
    });
    const iframe = element.querySelector('iframe');
    expect(iframe.src).to.contain('referrer=1');
  });

  it('should force playsinline', async () => {
    const element = await getAmpBrightcove({
      'data-account': '1290862519001',
      'data-video-id': 'ref:amp-test-video',
      'data-param-playsinline': 'false',
    });
    const iframe = element.querySelector('iframe');
    expect(iframe.src).to.contain('playsinline=true');
  });

  it('should forward events', async () => {
    const element = await getAmpBrightcove({
      'data-account': '1290862519001',
      'data-video-id': 'ref:amp-test-video',
    });

    await listenToForwardedEvent(element, VideoEvents.LOAD, {
      event: 'ready',
      muted: false,
      playing: false,
    });

    await listenToForwardedEvent(element, VideoEvents.LOADEDMETADATA, {
      event: 'loadedmetadata',
      muted: false,
      playing: false,
    });

    await listenToForwardedEvent(element, VideoEvents.AD_START, {
      event: 'ads-ad-started',
      muted: false,
      playing: false,
    });

    await listenToForwardedEvent(element, VideoEvents.AD_END, {
      event: 'ads-ad-ended',
      muted: false,
      playing: false,
    });

    await listenToForwardedEvent(element, VideoEvents.PLAYING, {
      event: 'playing',
      muted: false,
      playing: true,
    });

    await listenToForwardedEvent(element, VideoEvents.MUTED, {
      event: 'volumechange',
      muted: true,
      playing: true,
    });

    await listenToForwardedEvent(element, VideoEvents.UNMUTED, {
      event: 'volumechange',
      muted: false,
      playing: true,
    });

    await listenToForwardedEvent(element, VideoEvents.PAUSE, {
      event: 'pause',
      muted: false,
      playing: false,
    });

    await listenToForwardedEvent(element, VideoEvents.ENDED, {
      event: 'ended',
      muted: false,
      playing: false,
    });
  });

  it('should propagate consent state to iframe', async () => {
    env.sandbox
      .stub(consent, 'getConsentPolicyState')
      .resolves(CONSENT_POLICY_STATE.SUFFICIENT);
    env.sandbox
      .stub(consent, 'getConsentPolicySharedData')
      .resolves({a: 1, b: 2});
    env.sandbox.stub(consent, 'getConsentPolicyInfo').resolves('abc');

    const element = await getAmpBrightcove({
      'data-account': '1290862519001',
      'data-video-id': 'ref:amp-test-video',
      'data-block-on-consent': '_till_accepted',
    });
    const iframe = element.querySelector('iframe');

    expect(iframe.src).to.contain(
      `ampInitialConsentState=${CONSENT_POLICY_STATE.SUFFICIENT}`
    );
    expect(iframe.src).to.contain(
      `ampConsentSharedData=${encodeURIComponent(JSON.stringify({a: 1, b: 2}))}`
    );
    expect(iframe.src).to.contain('ampInitialConsentValue=abc');
  });
});
