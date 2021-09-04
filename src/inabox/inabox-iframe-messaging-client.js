import {IframeMessagingClient} from '#3p/iframe-messaging-client';

import {tryParseJson} from '#core/types/object/json';

import {canInspectWindow} from '../iframe-helper';
import {
  getExistingServiceOrNull,
  registerServiceBuilder,
} from '../service-helpers';

/**
 * @param {!Window} win
 * @return {?../../3p/iframe-messaging-client.IframeMessagingClient}
 */
export function iframeMessagingClientFor(win) {
  return /** @type {?../../3p/iframe-messaging-client.IframeMessagingClient} */ (
    getExistingServiceOrNull(win, 'iframeMessagingClient')
  );
}

/**
 * @param {!Window} win
 */
export function installIframeMessagingClient(win) {
  if (!canInspectWindow(win.top)) {
    registerServiceBuilder(
      win,
      'iframeMessagingClient',
      createIframeMessagingClient.bind(null, win),
      /* opt_instantiate */ true
    );
  }
}

/**
 * @param {!Window} win
 * @return {!../../3p/iframe-messaging-client.IframeMessagingClient}
 */
function createIframeMessagingClient(win) {
  const iframeClient = new IframeMessagingClient(win);
  //  Try read sentinel from window first.
  const dataObject = tryParseJson(win.name);
  let sentinel = null;
  if (dataObject && dataObject['_context']) {
    sentinel = dataObject['_context']['sentinel'];
  }
  iframeClient.setSentinel(sentinel || getRandom(win));
  return iframeClient;
}

/**
 * @param {!Window} win
 * @return {string}
 */
function getRandom(win) {
  return String(win.Math.random()).substr(2);
}
