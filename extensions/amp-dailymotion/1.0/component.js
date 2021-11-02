import * as Preact from '#preact';
import {forwardRef} from '#preact/compat';
import {useMemo} from '#preact';
import {dispatchCustomEvent} from '#core/dom';
import {
  DAILYMOTION_EVENTS_ENUM,
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
  if (event === DAILYMOTION_EVENTS_ENUM.PAUSE) {
    dispatchCustomEvent(currentTarget, 'pause');
  } else if (event === DAILYMOTION_EVENTS_ENUM.PLAY) {
    dispatchCustomEvent(currentTarget, 'playing');
  } else if (event === DAILYMOTION_EVENTS_ENUM.END) {
    dispatchCustomEvent(currentTarget, 'pause');
    dispatchCustomEvent(currentTarget, 'end');
  } else if (event === DAILYMOTION_EVENTS_ENUM.API_READY) {
    dispatchCustomEvent(currentTarget, 'canplay');
  }
}

/**
 * @param {!BentoDailymotionDef.Props} props
 * @param {{current: ?VideoWrapperDef.Api}} ref
 * @return {PreactDef.Renderable}
 */
export function BentoDailymotionWithRef(
  {
    autoplay,
    endscreenEnable,
    info,
    mute,
    sharingEnable,
    start,
    uiHighlight,
    uiLogo,
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
        uiLogo
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
      uiLogo,
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

const BentoDailymotion = forwardRef(BentoDailymotionWithRef);
BentoDailymotion.displayName = 'BentoDailymotion';
export {BentoDailymotion};
