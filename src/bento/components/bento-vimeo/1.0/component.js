import {
  VIMEO_EVENTS,
  getVimeoIframeSrc,
  getVimeoOriginRegExp,
  listenToVimeoEvents,
  makeVimeoMessage,
} from '#bento/apis/vimeo-api';
import {VideoIframe} from '#bento/components/bento-video/1.0/video-iframe';

import {dispatchCustomEvent} from '#core/dom';

import * as Preact from '#preact';
import {useCallback, useMemo, useRef} from '#preact';
import {forwardRef} from '#preact/compat';
import {useValueRef} from '#preact/component';

import {
  objOrParseJson,
  postMessageWhenAvailable,
} from '../../../../iframe-video';

/**
 * @param {!HTMLIframeElement} iframe
 * @param {string} type
 */
function dispatchEvent(iframe, type) {
  dispatchCustomEvent(iframe, type, null, {
    bubbles: true,
    cancelable: false,
  });
}

/**
 * @param {string} method
 * @return {string}
 */
function makeMethodMessage(method) {
  if (method === 'mute') {
    return makeVimeoMessage('setVolume', '0');
  }
  if (method === 'unmute') {
    return makeVimeoMessage('setVolume', '1');
  }
  return makeVimeoMessage(method);
}

/**
 * @param {!VimeoDef.Props} props
 * @param {{current: ?T}} ref
 * @return {PreactDef.Renderable}
 * @template T
 */
function BentoVimeoWithRef(
  {autoplay = false, doNotTrack = false, onLoad, videoid, ...rest},
  ref
) {
  const origin = useMemo(getVimeoOriginRegExp, []);
  const src = useMemo(
    () => getVimeoIframeSrc(videoid, autoplay, doNotTrack),
    [videoid, doNotTrack, autoplay]
  );

  const readyIframeRef = useRef(null);
  const onLoadRef = useValueRef(onLoad);

  const onReadyMessage = useCallback((iframe) => {
    if (readyIframeRef.current === iframe) {
      return;
    }
    readyIframeRef.current = iframe;
    dispatchEvent(iframe, 'canplay');
    listenToVimeoEvents(iframe);
  }, []);

  const onMessage = useCallback(
    (e) => {
      const {currentTarget} = e;
      const data = objOrParseJson(e.data);
      if (!data) {
        return;
      }
      const event = data['event'];
      if (event == 'ready' || data['method'] == 'ping') {
        onReadyMessage(currentTarget);
        return;
      }
      if (VIMEO_EVENTS[event]) {
        dispatchEvent(currentTarget, VIMEO_EVENTS[event]);
        onLoadRef.current?.();
        return;
      }
    },
    [onReadyMessage, onLoadRef]
  );

  const onIframeLoad = useCallback((e) => {
    postMessageWhenAvailable(e.currentTarget, makeVimeoMessage('ping'));
  }, []);

  return (
    <VideoIframe
      ref={ref}
      {...rest}
      origin={origin}
      autoplay={autoplay}
      src={src}
      onMessage={onMessage}
      makeMethodMessage={makeMethodMessage}
      onIframeLoad={onIframeLoad}
      // Vimeo API does not have a way to hide controls, so they're always set
      controls
    />
  );
}

const BentoVimeo = forwardRef(BentoVimeoWithRef);
BentoVimeo.displayName = 'BentoVimeo'; // Make findable for tests.
export {BentoVimeo};
