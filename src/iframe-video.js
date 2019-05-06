/**
 * Copyright 2018 The AMP HTML Authors. All Rights Reserved.
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
import {Services} from './services';
import {VideoEvents} from './video-interface';
import {dev} from './log';
import {htmlFor} from './static-template';
import {isArray, isObject} from './types';
import {startsWith} from './string';
import {tryParseJson} from './json';


/** @enum {string} */
export const SandboxOptions = {
  ALLOW_SCRIPTS: 'allow-scripts',
  ALLOW_SAME_ORIGIN: 'allow-same-origin',
  ALLOW_POPUPS: 'allow-popups',
  ALLOW_POPUPS_TO_ESCAPE_SANDBOX: 'allow-popups-to-escape-sandbox',
  ALLOW_TOP_NAVIGATION_BY_USER_ACTIVATION:
    'allow-top-navigation-by-user-activation',
};


/**
 * @param {!Event} event
 * @param {?Element} iframe
 * @param {string|!RegExp} host
 * @return {boolean}
 */
export function originMatches(event, iframe, host) {
  if (!iframe || event.source != iframe.contentWindow) {
    return false;
  }
  if (typeof host === 'string') {
    return host == event.origin;
  }
  return host.test(event.origin);
}


/**
 * Re-dispatches an event received from postMessage as an event in the host
 * document.
 *
 * @param {!AmpElement} element
 * @param {string} event
 * @param {!Object<string, (string|?Array<string>)>} events
 * @return {boolean}
 */
export function redispatch(element, event, events) {
  if (events[event] == null) {
    return false;
  }
  const dispatchEvent = events[event];
  (isArray(dispatchEvent) ? dispatchEvent : [dispatchEvent]).forEach(e => {
    element.dispatchCustomEvent(dev().assertString(e));
  });
  return true;
}


/**
 * @param {!./base-element.BaseElement} video
 * @param {string} src
 * @param {string=} opt_name
 * @param {!Array<!SandboxOptions>=} opt_sandbox
 * @return {!Element}
 */
export function createFrameFor(video, src, opt_name, opt_sandbox) {
  const {element} = video;
  const frame =
      htmlFor(element)`<iframe frameborder=0 allowfullscreen></iframe>`;

  if (opt_name) {
    frame.setAttribute('name', opt_name);
  }

  if (opt_sandbox) {
    frame.setAttribute('sandbox', opt_sandbox.join(' '));
  }

  // Will propagate for every component, but only validation rules will actually
  // allow the attribute to be set.
  video.propagateAttributes(['referrerpolicy'], frame);

  frame.src = Services.urlForDoc(element).assertHttpsUrl(src, element);

  video.applyFillContent(frame);
  element.appendChild(frame);

  return frame;
}


/**
 * @param {?} anything
 * @return {boolean}
 */
export function isJsonOrObj(anything) {
  if (!anything) {
    return false;
  }
  return isObject(anything) ||
    startsWith(/** @type {string} */ (anything), '{');
}


/**
 * @param {?JsonObject|string|undefined} objOrStr
 * @return {?JsonObject|undefined}
 */
export function objOrParseJson(objOrStr) {
  if (isObject(objOrStr)) {
    return /** @type {!JsonObject} */ (objOrStr);
  }
  return tryParseJson(objOrStr);
}


/**
 * @param {boolean} isMuted
 * @return {string}
 */
export function mutedOrUnmutedEvent(isMuted) {
  return isMuted ? VideoEvents.MUTED : VideoEvents.UNMUTED;
}


/**
 * TEMPORARY workaround for M72-M75 user-activation breakage.
 * If this function is still here in June 2019, please ping `@aghassemi` and
 * `@alanorozco`.
 *
 * - Used directly ONLY by trusted video players: amp-ima-video and amp-youtube.
 * - Used indirectly ONLY through the `VideoManager` on execution of a
 *   high-trust common action on an iframe player component.
 *
 * See https://github.com/ampproject/amphtml/issues/21242 for details.
 * TODO(aghassemi, #21247)
 *
 * @param {Element} iframe
 */
export function addUnsafeAllowAutoplay(iframe) {
  const allow = iframe.getAttribute('allow') || '';
  if (allow.indexOf('autoplay') >= 0) {
    return;
  }
  const delimited = allow.replace(/([^;])$/, '$1;');
  iframe.setAttribute('allow', `${delimited}autoplay;`);
}
