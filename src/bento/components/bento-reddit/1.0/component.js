import {MessageType_Enum, deserializeMessage} from '#core/3p-frame-messaging';

import * as Preact from '#preact';
import {useCallback, useMemo, useState} from '#preact';
import {forwardRef} from '#preact/compat';
import {ProxyIframeEmbed} from '#preact/component/3p-frame';

/** @const {string} */
const TYPE = 'reddit';
const FULL_HEIGHT = '100%';
const MATCHES_MESSAGING_ORIGIN = () => true;

/**
 * @param {!BentoRedditDef.Props} props
 * @param {{current: (!BentoRedditDef.Api|null)}} ref
 * @return {PreactDef.Renderable}
 */
export function RedditWithRef(
  {
    embedCreated,
    embedLive,
    embedParent,
    embedType,
    requestResize,
    src,
    style,
    title = 'Reddit',
    uuid,
    ...rest
  },
  ref
) {
  const [height, setHeight] = useState(FULL_HEIGHT);
  const messageHandler = useCallback(
    (event) => {
      const data = deserializeMessage(event.data);
      if (data['type'] == MessageType_Enum.EMBED_SIZE) {
        const height = data['height'];
        if (requestResize) {
          requestResize(height);
          setHeight(FULL_HEIGHT);
        } else {
          setHeight(height);
        }
      }
    },
    [requestResize]
  );

  const options = useMemo(
    () => ({
      embedCreated,
      embedLive,
      embedParent,
      embedType,
      requestResize,
      src,
      title,
      uuid,
    }),
    [
      embedCreated,
      embedLive,
      embedParent,
      embedType,
      requestResize,
      src,
      title,
      uuid,
    ]
  );

  return (
    <ProxyIframeEmbed
      ref={ref}
      title={title}
      {...rest}
      // non-overridable props
      options={options}
      type={TYPE}
      matchesMessagingOrigin={MATCHES_MESSAGING_ORIGIN}
      messageHandler={messageHandler}
      style={height ? {...style, height} : style}
    />
  );
}
const BentoReddit = forwardRef(RedditWithRef);
BentoReddit.displayName = 'BentoReddit';
export {BentoReddit};
