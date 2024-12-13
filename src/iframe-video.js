import {dispatchCustomEvent} from '#core/dom';
import {applyFillContent} from '#core/dom/layout';
import {propagateAttributes} from '#core/dom/propagate-attributes';
import {htmlFor} from '#core/dom/static-template';
import {isArray, isObject} from '#core/types';
import {tryParseJson} from '#core/types/object/json';

import {Services} from '#service';

import {dev} from '#utils/log';

import {VideoEvents_Enum} from './video-interface';

/** @enum {string} */
export const SandboxOptions_Enum = {
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
 * @param {!{[key: string]: (string|?Array<string>)}} events
 * @return {boolean}
 */
export function redispatch(element, event, events) {
  if (events[event] == null) {
    return false;
  }
  const dispatchEvent = events[event];
  (isArray(dispatchEvent) ? dispatchEvent : [dispatchEvent]).forEach((e) => {
    dispatchCustomEvent(element, dev().assertString(e));
  });
  return true;
}

/**
 * @param {!./base-element.BaseElement} video
 * @param {string} src
 * @param {string=} opt_name
 * @param {!Array<!SandboxOptions_Enum>=} opt_sandbox
 * @return {!Element}
 */
export function createFrameFor(video, src, opt_name, opt_sandbox) {
  const {element} = video;
  const frame = htmlFor(
    element
  )`<iframe frameborder=0 allowfullscreen></iframe>`;

  if (opt_name) {
    frame.setAttribute('name', opt_name);
  }

  if (opt_sandbox) {
    frame.setAttribute('sandbox', opt_sandbox.join(' '));
  }

  // Will propagate for every component, but only validation rules will actually
  // allow the attribute to be set.
  propagateAttributes(['referrerpolicy'], video.element, frame);

  frame.src = Services.urlForDoc(element).assertHttpsUrl(src, element);

  applyFillContent(frame);
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
  return isObject(anything) || /** @type {string} */ (anything).startsWith('{');
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
  return isMuted ? VideoEvents_Enum.MUTED : VideoEvents_Enum.UNMUTED;
}

/**
 * TEMPORARY workaround for M72-M74 user-activation breakage.
 * If this method is still here in May 2019, please ping @aghassemi
 * Only used by trusted video players: IMA and YouTube.
 * See https://github.com/ampproject/amphtml/issues/21242 for details.
 * TODO(aghassemi, #21247)
 * @param {Element} iframe
 */
export function addUnsafeAllowAutoplay(iframe) {
  let val = iframe.getAttribute('allow') || '';
  val += 'autoplay;';
  iframe.setAttribute('allow', val);
}

/**
 * @param {?HTMLIFrameElement=} iframe
 * @param {*} message
 */
export function postMessageWhenAvailable(iframe, message) {
  iframe?.contentWindow?./*OK*/ postMessage(message, '*');
}
