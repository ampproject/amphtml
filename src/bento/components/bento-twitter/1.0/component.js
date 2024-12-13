import {MessageType_Enum, deserializeMessage} from '#core/3p-frame-messaging';

import * as Preact from '#preact';
import {useCallback, useMemo, useState} from '#preact';
import {forwardRef} from '#preact/compat';
import {useValueRef} from '#preact/component';
import {ProxyIframeEmbed} from '#preact/component/3p-frame';

/** @const {string} */
const TYPE = 'twitter';
const FULL_HEIGHT = '100%';
const MATCHES_MESSAGING_ORIGIN = () => true;

/**
 * @param {!BentoTwitterDef.Props} props
 * @param {{current: (!BentoTwitterDef.Api|null)}} ref
 * @return {PreactDef.Renderable}
 */
function BentoTwitterWithRef(
  {
    cards,
    conversation,
    limit,
    momentid,
    onError,
    onLoad,
    options: optionsProps,
    requestResize,
    style,
    timelineScreenName,
    timelineSourceType,
    timelineUserId,
    title,
    tweetLimit,
    tweetid,
    ...rest
  },
  ref
) {
  const [height, setHeight] = useState(null);
  const onLoadRef = useValueRef(onLoad);
  const onErrorRef = useValueRef(onError);

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

        onLoadRef.current?.();
      } else if (data['type'] === MessageType_Enum.NO_CONTENT) {
        onErrorRef.current?.();
      }
    },
    [requestResize, onLoadRef, onErrorRef]
  );
  const options = useMemo(
    () => ({
      cards,
      conversation,
      limit,
      momentid,
      timelineScreenName,
      timelineSourceType,
      timelineUserId,
      tweetLimit,
      tweetid,
      ...optionsProps,
    }),
    [
      cards,
      conversation,
      limit,
      momentid,
      optionsProps,
      timelineScreenName,
      timelineSourceType,
      timelineUserId,
      tweetLimit,
      tweetid,
    ]
  );

  return (
    <ProxyIframeEmbed
      allowfullscreen
      ref={ref}
      title={title}
      {...rest}
      // non-overridable props
      matchesMessagingOrigin={MATCHES_MESSAGING_ORIGIN}
      messageHandler={messageHandler}
      options={options}
      type={TYPE}
      style={height ? {...style, height} : style}
    />
  );
}

const BentoTwitter = forwardRef(BentoTwitterWithRef);
BentoTwitter.displayName = 'BentoTwitter'; // Make findable for tests.
export {BentoTwitter};
