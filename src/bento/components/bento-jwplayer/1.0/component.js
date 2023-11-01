import {JwplayerToDom, makeJwplayerIframeSrc} from '#bento/apis/jwplayer-api';
import {VideoIframe} from '#bento/components/bento-video/1.0/video-iframe';

import {dispatchCustomEvent} from '#core/dom';
import {tryParseJson} from '#core/types/object/json';

import * as Preact from '#preact';
import {useCallback, useMemo, useRef} from '#preact';
import {forwardRef} from '#preact/compat';

import {isJsonOrObj, objOrParseJson} from '../../../../iframe-video';

const JWPLAYER_ORIGIN = /https:\/\/content\.jwplatform\.com/;

/**
 * Checks if the current browser supports requesting fullscreen
 * @param {Window} win
 * @return {boolean}
 */
function hasFullScreenApi(win) {
  return !!win.document.body.requestFullscreen;
}

/**
 * @param {!BentoJwplayerDef.Props} props
 * @param {{current: ?VideoWrapperDef.Api}} ref
 * @return {PreactDef.Renderable}
 */
export function BentoJwplayerWithRef(props, ref) {
  const {
    adCustParams,
    adMacros,
    autoplay,
    config,
    consentParams = {},
    contentBackfill = true,
    contentRecency,
    contentSearch,
    mediaId,
    onLoad,
    onPlayingState,
    playerId,
    playlistId,
    queryParams,
    ...rest
  } = props;
  const playerStateRef = useRef({});
  const src = useMemo(() => {
    return makeJwplayerIframeSrc(
      playerId,
      playlistId,
      mediaId,
      contentSearch,
      contentRecency,
      contentBackfill,
      queryParams,
      consentParams
    );
  }, [
    playerId,
    playlistId,
    mediaId,
    contentSearch,
    contentRecency,
    contentBackfill,
    queryParams,
    consentParams,
  ]);

  const onMessage = useCallback(
    (e) =>
      onMessage_(e, {
        config,
        adCustParams,
        adMacros,
        onPlayingState,
        onLoad,
        playerStateRef,
      }),
    [config, adCustParams, adMacros, onPlayingState, onLoad]
  );

  const makeMethodMessage = useCallback(
    (method) => makeMessage(method, {autoplay}),
    [autoplay]
  );
  const makeFullscreenMessage = useMemo(
    () =>
      !hasFullScreenApi(window)
        ? () =>
            JSON.stringify({
              method: 'setFullscreen',
              optParams: true,
            })
        : null,
    []
  );

  if (!checkProps(props)) {
    return false;
  }

  return (
    <VideoIframe
      ref={ref}
      playerStateRef={playerStateRef}
      src={src}
      makeMethodMessage={makeMethodMessage}
      makeFullscreenMessage={makeFullscreenMessage}
      onMessage={onMessage}
      origin={JWPLAYER_ORIGIN}
      controls
      {...rest}
    />
  );
}

const BentoJwplayer = forwardRef(BentoJwplayerWithRef);
BentoJwplayer.displayName = 'BentoJwPlayer'; // Make findable for tests.
export {BentoJwplayer};

/**
 * Makes message to handle different media methods
 * @param {string} apiMethod
 * @param {*} options
 * @return {string} message to post to video iframe
 */
function makeMessage(apiMethod, options) {
  let jwplayerMethod, optParams;
  switch (apiMethod) {
    case 'play': {
      const {autoplay} = options;
      if (autoplay) {
        optParams = true;
      }
      jwplayerMethod = 'play';
      break;
    }
    case 'pause': {
      jwplayerMethod = 'pause';
      break;
    }
    case 'mute': {
      jwplayerMethod = 'setMute';
      optParams = true;
      break;
    }
    case 'unmute': {
      jwplayerMethod = 'setMute';
      optParams = false;
      break;
    }
    case 'showControls': {
      jwplayerMethod = 'setControls';
      optParams = true;
      break;
    }
    case 'hideControls': {
      jwplayerMethod = 'setControls';
      optParams = false;
      break;
    }
  }
  const message = {method: jwplayerMethod, optParams};
  return JSON.stringify(message);
}

/**
 *
 * @param {Oject} event
 * @param {{adCustParams: string, adMacros: Object, config: Object, onLoad: OnLoadCb, onPlayingState: OnPlayingStateCb, playerStateRef: {current: Object}}} options
 */
function onMessage_(event, options) {
  const {currentTarget, data: messageData} = event;
  const {
    adCustParams,
    adMacros,
    config,
    onLoad,
    onPlayingState,
    playerStateRef,
  } = options;
  if (!isJsonOrObj(messageData)) {
    return;
  }

  const data = objOrParseJson(messageData);
  const {detail: eventDetail, event: eventType} = data;

  if (eventType === 'setup') {
    onSetup(currentTarget, config, adCustParams, adMacros);
    return;
  }

  if (eventType === 'ready' && eventDetail) {
    onReady(currentTarget, eventDetail, onLoad);
    return;
  }

  /** update playing state */
  switch (eventType) {
    case 'play':
    case 'adPlay': {
      onPlayingState?.(true);
      break;
    }
    case 'pause':
    case 'complete': {
      onPlayingState?.(false);
      break;
    }
  }

  /**
   * sync player state to propagate values to videowrapper handle
   */
  if (eventDetail.currentTime) {
    playerStateRef.current.currentTime = eventDetail.currentTime;
  }
  if (eventDetail.duration) {
    playerStateRef.current.duration = eventDetail.duration;
  }

  /** redispatch jwplayer events */
  if (eventType in JwplayerToDom) {
    dispatchCustomEvent(currentTarget, JwplayerToDom[eventType]);
  }
}

/**
 * @param {HTMLIFrameElement} iframe
 * @param {{json: string}} config
 * @param {string} adCustParamsJson
 * @param {object} adMacros
 */
function onSetup(iframe, config, adCustParamsJson, adMacros) {
  /** get all data-config-* */
  const {json: jsonConfig, ...restConfig} = config || {};
  const config_ = {
    ...(tryParseJson(jsonConfig) || {}),
    ...restConfig,
  };

  /** get data-ad-macro-* */
  if (adMacros && Object.keys(adMacros).length !== 0) {
    config_.adMacros = adMacros;
  }

  /** get data-ad-cust-params as json */
  if (adCustParamsJson) {
    config_.adCustParams = tryParseJson(adCustParamsJson);
  }

  postCommandMessage(iframe, 'setupConfig', config_);
}

/**
 * @param {object} currentTarget
 * @param {{muted: boolean, playlistItem: Object}} readyOptions
 * @param {OnLoadCallback} onLoad
 */
function onReady(currentTarget, readyOptions, onLoad) {
  const {muted} = readyOptions;
  dispatchCustomEvent(currentTarget, 'canplay');
  onLoad?.();
  if (muted) {
    dispatchCustomEvent(currentTarget, 'muted');
  }
  dispatchCustomEvent(currentTarget, 'load');
}

/**
 * @param {HTMLIFrameElement} iframe
 * @param {string} method
 * @param {*} [optParams]
 * @private
 */
function postCommandMessage(iframe, method, optParams) {
  if (!iframe || !iframe.contentWindow) {
    return;
  }

  iframe.contentWindow./*OK*/ postMessage(
    JSON.stringify({
      'method': method,
      'optParams': optParams,
    }),
    '*'
  );
}

/**
 * @param {!BentoJwplayerDef.Props} props
 * @return {boolean}
 */
function checkProps(props) {
  const {mediaId, playerId, playlistId} = props;
  const requiredProps = playerId && (mediaId || playlistId);
  if (!requiredProps) {
    console /*OK*/
      .warn(
        'playerId and one of: mediaId or playlistId are required for <Jwplayer>'
      );

    return false;
  }

  return true;
}
