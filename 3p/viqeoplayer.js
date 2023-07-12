import {tryPlay} from '#core/dom/video';
import {tryDecodeUriComponent} from '#core/types/string/url';

import {getData} from '#utils/event-helper';

import {loadScript} from './3p';

/**
 * @param {Window} global
 * @param {object} VIQEO
 * @private
 */
function viqeoPlayerInitLoaded(global, VIQEO) {
  const {canonicalUrl, pageViewId, sourceUrl} = global.context;
  const data = getData(global.context);
  let viqeoPlayerInstance;
  VIQEO['setConfig']({url: sourceUrl, amp: {pageViewId, canonicalUrl}});
  VIQEO['subscribeTracking']((params) => {
    viqeoPlayerInstance = params['player'];
  }, 'Player:added');
  VIQEO['subscribeTracking'](() => {
    sendMessage('updatePlayedRanges', viqeoPlayerInstance['getPlayedRanges']());
    sendMessage('updateCurrentTime', viqeoPlayerInstance['getCurrentTime']());
  }, 'Player:currentTimeUpdated');
  VIQEO['subscribeTracking'](() => {
    sendMessage('updateDuration', viqeoPlayerInstance['getDuration']());
  }, 'Player:durationUpdated');
  VIQEO['createPlayer']({
    videoId: data['videoid'],
    profileId: data['profileid'],
    parent: global.document.getElementById('c'),
  });

  global.addEventListener('message', parseMessage, false);

  subscribe('ready', 'ready');
  subscribe('paused', 'pause');
  subscribe('started', 'play');
  subscribe('played', 'play');
  subscribe('replayed', 'play');
  subscribe('ended', 'end');
  subscribe('advStarted', 'startAdvert');
  subscribe('advEnded', 'endAdvert');
  subscribe('muted', 'mute');
  subscribe('unmuted', 'unmute');

  /**
   * Subscribe on viqeo's events
   * @param {string} playerEventName
   * @param {string} targetEventName
   * @private
   */
  function subscribe(playerEventName, targetEventName) {
    VIQEO['subscribeTracking'](() => {
      sendMessage(targetEventName);
    }, `Player:${playerEventName}`);
  }

  const sendMessage = (eventName, value = null) => {
    const {parent} = global;
    const message = /** @type {JsonObject} */ ({
      source: 'ViqeoPlayer',
      action: eventName,
      value,
    });
    parent./*OK*/ postMessage(message, '*');
  };

  /**
   * Parse events data for viqeo
   * @param {!Event|{data: !JsonObject}} event
   */
  function parseMessage(event) {
    const eventData = getData(event);
    const action = eventData['action'];
    if (!action) {
      return;
    }
    if (action === 'play') {
      tryPlay(viqeoPlayerInstance);
    } else if (action === 'pause') {
      viqeoPlayerInstance.pause();
    } else if (action === 'stop') {
      viqeoPlayerInstance.stop();
    } else if (action === 'mute') {
      viqeoPlayerInstance.setVolume(0);
    } else if (action === 'unmute') {
      viqeoPlayerInstance.setVolume(1);
    }
  }
}

/**
 * Prepare and return viqeo instance
 * @param {!Window} global
 */
export function viqeoplayer(global) {
  const data = getData(global.context);
  const kindIsProd = data['data-kind'] !== 'stage';

  let scriptPlayerInit = data['script-url'];
  scriptPlayerInit =
    (scriptPlayerInit && tryDecodeUriComponent(scriptPlayerInit)) ||
    (kindIsProd
      ? 'https://cdn.viqeo.tv/js/vq_starter.js'
      : 'https://static.viqeo.tv/js/vq_player_init.js?branch=dev1');

  global['onViqeoLoad'] = (VIQEO) => viqeoPlayerInitLoaded(global, VIQEO);
  loadScript(global, scriptPlayerInit);
}
