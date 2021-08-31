import * as Preact from '#preact';
import {forwardRef} from '#preact/compat';
import {useMemo} from '#preact';
import {dispatchCustomEvent} from '#core/dom';
import {
  DAILYMOTION_VIDEO_EVENTS,
  DailymotionEvents,
  getDailymotionIframeSrc,
  makeDailymotionMessage,
} from '../dailymotion-api';
import {VideoIframe} from '../../amp-video/1.0/video-iframe';
import {parseQueryString} from '#core/types/string/url';

/**
 * @param {string} method
 * @return {string}
 */
function makeMethodMessage(method) {
  switch (method) {
    case 'mute':
      return makeDailymotionMessage('muted', [true]);
    case 'unmute':
      return makeDailymotionMessage('muted', [false]);
    case 'showControls':
      return makeDailymotionMessage('controls', [true]);
    case 'hideControls':
      return makeDailymotionMessage('controls', [false]);
    default:
      return makeDailymotionMessage(method);
  }
}

/**
 * @param {MessageEvent} event
 */
function onMessage({currentTarget, data}) {
  const parsedData = parseQueryString(/** @type {string} */ (data));
  const event = parsedData?.['event'];
  if (event === DailymotionEvents.PAUSE) {
    dispatchCustomEvent(currentTarget, 'pause');
  } else if (event === DailymotionEvents.PLAY) {
    dispatchCustomEvent(currentTarget, 'playing');
  } else if (event === DailymotionEvents.END) {
    dispatchCustomEvent(currentTarget, 'pause');
    dispatchCustomEvent(currentTarget, 'end');
  } else if (event === DailymotionEvents.API_READY) {
    dispatchCustomEvent(currentTarget, 'canplay');
  }
}

/**
 * @param {!DailymotionDef.Props} props
 * @param {{current: ?VideoWrapperDef.Api}} ref
 * @return {PreactDef.Renderable}
 */
export function DailymotionWithRef(
  {
    autoplay,
    endscreenEnable,
    info,
    mute,
    sharingEnable,
    start,
    uiHighlight,
    uiLog,
    videoId,
    ...rest
  },
  ref
) {
  const src = useMemo(
    () =>
      getDailymotionIframeSrc(
        window,
        videoId,
        autoplay,
        endscreenEnable,
        info,
        mute,
        sharingEnable,
        start,
        uiHighlight,
        uiLog
      ),
    [
      videoId,
      autoplay,
      endscreenEnable,
      info,
      mute,
      sharingEnable,
      start,
      uiHighlight,
      uiLog,
    ]
  );

  return (
    <VideoIframe
      autoplay={autoplay}
      controls
      ref={ref}
      {...rest}
      src={src}
      makeMethodMessage={makeMethodMessage}
      onMessage={onMessage}
    />
  );
}

const Dailymotion = forwardRef(DailymotionWithRef);
Dailymotion.displayName = 'Dailymotion';
export {Dailymotion};
