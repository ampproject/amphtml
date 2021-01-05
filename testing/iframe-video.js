/**
 * Copyright 2021 The AMP HTML Authors. All Rights Reserved.
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

import {createElementWithAttributes} from '../src/dom';
import {getTestingBlankDocumentUrl} from '../src/iframe-video';
import {listenOncePromise} from '../src/event-helper';

export function expectRealIframeSrcEquals(iframe, src) {
  expect(getRealSrcFromTestingUrl(iframe)).to.equal(src);
}

export function getRealSrcFromTestingUrl(iframe) {
  if (!iframe.src.startsWith(getTestingBlankDocumentUrl(location.origin))) {
    return iframe.src;
  }
  return iframe.src.replace(/^[^#]+#/, '');
}

/**
 * @param {*} env
 * @param {*} TAG
 * @param {*} config
 */
export function getVideoIframeTestHelpers(env, TAG, config) {
  const resolvedConfig = {
    // Default attributes to set on test elements. These are overridable.
    attributes: {width: 16, height: 9, layout: 'responsive'},

    // Origin to set on mocked postMessage events.
    origin: 'https://configure-this-origin.localhost',

    // Some players wait to receive a "ready message" to complete layout.
    // Optionally mock a postMessage with this data to complete layout.
    layoutMessage: null,

    // Player tests may optionally serialize mocked postMessage data, like
    // into a JSON string, or concatenating a default value.
    serializeMessage: (data) => data,

    ...config,
  };

  /**
   * @param {*} attributes
   * @return {!Promise<Element>}
   */
  async function buildElement(attributes) {
    const element = createElementWithAttributes(env.win.document, TAG, {
      ...resolvedConfig.attributes,
      ...attributes,
    });
    env.win.document.body.appendChild(element);
    await element.build();
    return element;
  }

  /**
   * @param {*} attributes
   * @return {!Promise<Element>}
   */
  async function buildLayoutElement(attributes) {
    return layoutElement(await buildElement(attributes));
  }

  /**
   *
   * @param {*} element
   */
  async function layoutElement(element) {
    const laidOut = element.layoutCallback();
    if (resolvedConfig.layoutMessage) {
      try {
        fakePostMessage(element, resolvedConfig.layoutMessage);
      } catch (_) {
        // This may fail if the iframe is not available.
        // In this case, awaiting for layout will in turn timeout.
      }
    }
    await laidOut;
    return element;
  }

  /**
   * @param {!Element} element
   * @param {string} event
   * @param {*} messageData
   * @return {!Promise<Event>}
   */
  function listenToForwardedEvent(element, event, messageData) {
    const promise = listenOncePromise(element, event);
    fakePostMessage(element, messageData);
    return promise;
  }

  /**
   * @param {*} element
   * @param {*} data
   */
  function fakePostMessage(element, data) {
    element.implementation_.handleMessage_({
      origin: resolvedConfig.origin,
      source: element.querySelector('iframe').contentWindow,
      data: resolvedConfig.serializeMessage(data),
    });
  }

  return {
    buildElement,
    buildLayoutElement,
    layoutElement,
    listenToForwardedEvent,
    fakePostMessage,
  };
}
