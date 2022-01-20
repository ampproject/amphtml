/**
 * This file contains functions related to GMA SDK on mobile app
 * environments.
 */

import {dev} from '#utils/log';

import {getRandom} from './3p-frame';

function getPawSignalsSdkRefWindow(win) {
  // Check if the APIs are available, if not, see if they can be found in
  // parent window (mostly relevant in hybrid wrappers).
  if (!!win.gmaSdk || !!win.webkit?.messageHandlers.getGmaViewSignals) {
    return win;
  }
  try {
    const parentWindow = win.parent;
    if (
      !!parentWindow.gmaSdk ||
      !!parentWindow.webkit?.messageHandlers.getGmaViewSignals
    ) {
      return parentWindow;
    }
  } catch (err) {}
  return null;
}

function triggerPawGmaPostmessage(
  win,
  messageHandler,
  extraParams,
  successCallback,
  failCallback,
  maxDelayMs
) {
  const pawId = getRandom(win);
  let timeoutId = 0;
  const pawClickSignalCallback = (postMessageEvent) => {
    try {
      const pawMessage =
        typeof postMessageEvent.data === 'object'
          ? postMessageEvent.data
          : JSON.parse(postMessageEvent.data);
      if (pawId === pawMessage.paw_id) {
        win.clearTimeout(timeoutId);
        win.removeEventListener('message', pawClickSignalCallback);
        if (pawMessage.signal) {
          successCallback(pawMessage.signal);
        } else if (pawMessage.error) {
          failCallback(pawMessage.error);
        }
      }
    } catch (err) {
      dev().error('AMP-A4A', 'Error parsing PAW message', err);
    }
  };

  win.addEventListener('message', (e) => {
    pawClickSignalCallback(e);
  });

  messageHandler.postMessage({'paw_id': pawId, ...extraParams});

  timeoutId = win.setTimeout(() => {
    win.removeEventListener('message', pawClickSignalCallback);
    failCallback('PAW GMA postmessage timed out.');
  }, maxDelayMs);
}

export function getPawSignal(win, maxDelayMs) {
  return new Promise((resolve) => {
    const pawSignalsWindow = getPawSignalsSdkRefWindow(win);
    if (pawSignalsWindow?.gmaSdk?.getViewSignals != null) {
      const gmaViewSignals = pawSignalsWindow?.gmaSdk?.getViewSignals();
      resolve(gmaViewSignals);
    } else if (
      pawSignalsWindow?.webkit?.messageHandlers.getGmaViewSignals != null
    ) {
      triggerPawGmaPostmessage(
        win,
        pawSignalsWindow?.webkit?.messageHandlers.getGmaViewSignals,
        {},
        (signal) => {
          resolve(signal);
        },
        () => {},
        maxDelayMs
      );
    }
  });
}
