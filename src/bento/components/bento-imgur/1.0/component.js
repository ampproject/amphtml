import {ReadyState_Enum} from '#core/constants/ready-state';
import {isObject} from '#core/types';
import {tryParseJson} from '#core/types/object/json';

import * as Preact from '#preact';
import {useEffect, useRef, useState} from '#preact';
import {forwardRef} from '#preact/compat';
import {IframeEmbed} from '#preact/component/iframe';
import {logger} from '#preact/logger';

const TAG = 'bento-imgur';
const MATCHES_MESSAGING_ORIGIN = (origin) => origin === 'https://imgur.com';

/**
 * @param {!BentoImgurDef.Props} props
 * @param {{current: ?BentoInstagramDef.Api}} ref
 * @return {PreactDef.Renderable}
 */
export function BentoImgurWithRef(
  {imgurId, title = 'imgur post', ...rest},
  ref
) {
  const [readyState, setReadyState] = useState(ReadyState_Enum.LOADING);
  const [heightStyle, setHeightStyle] = useState({});

  const messageReceived = useRef(false);
  const messageHandler = (ev) => {
    messageReceived.current = true;
    const data = getEventData(ev) || {};
    if (data.message === 'resize_imgur') {
      setHeightStyle({height: Number(data.height)});
    }
  };

  useEffect(() => {
    // Once we're loaded, ensure a message is received soon.
    // Otherwise, report an error:
    if (readyState === ReadyState_Enum.LOADING) {
      messageReceived.current = false;
    }
    if (readyState === ReadyState_Enum.COMPLETE) {
      const id = setTimeout(() => {
        if (!messageReceived.current) {
          logger.error(TAG, `Failed to load.  Is "${imgurId}" a correct id?`);
        }
      }, 500);
      return () => clearTimeout(id);
    }
  }, [readyState, imgurId]);

  const src = getImgurSrc(imgurId);

  return (
    <IframeEmbed
      ref={ref}
      allowFullScreen
      onReadyState={setReadyState}
      title={title}
      src={src}
      matchesMessagingOrigin={MATCHES_MESSAGING_ORIGIN}
      messageHandler={messageHandler}
      wrapperStyle={heightStyle}
      {...rest}
    />
  );
}

const BentoImgur = forwardRef(BentoImgurWithRef);
BentoImgur.displayName = 'Imgur';
export {BentoImgur};

/**
 * Returns the event data as an object, or null
 * @param {{ data: object | string }} ev
 * @return {object|null}
 */
function getEventData(ev) {
  return isObject(ev.data) ? ev.data : tryParseJson(ev.data);
}

/**
 * Ensures the imgurId is properly encoded
 * @param {string} imgurId
 * @return {string}
 */
function sanitizeId(imgurId) {
  return imgurId.replace(
    /^(a\/)?(.*)/,
    (unusedMatch, aSlash, rest) => (aSlash || '') + encodeURIComponent(rest)
  );
}

/**
 * Returns the imgur URL
 * @param {string} imgurId
 * @return {string}
 */
function getImgurSrc(imgurId) {
  const id = sanitizeId(imgurId);
  return `https://imgur.com/${id}/embed?pub=true`;
}
