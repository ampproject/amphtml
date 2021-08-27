import * as Preact from '#preact';
import {ProxyIframeEmbed} from '#preact/component/3p-frame';
import {MessageType, deserializeMessage} from '#core/3p-frame-messaging';
import {forwardRef} from '#preact/compat';
import {useCallback, useMemo, useState} from '#preact';
import {useValueRef} from '#preact/component';

/** @const {string} */
const TYPE = 'twitter';
const FULL_HEIGHT = '100%';
const MATCHES_MESSAGING_ORIGIN = () => true;

/**
 * @param {!TwitterDef.Props} props
 * @param {{current: (!TwitterDef.Api|null)}} ref
 * @return {PreactDef.Renderable}
 */
function TwitterWithRef(
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
      if (data['type'] == MessageType.EMBED_SIZE) {
        const height = data['height'];
        if (requestResize) {
          requestResize(height);
          setHeight(FULL_HEIGHT);
        } else {
          setHeight(height);
        }

        onLoadRef.current?.();
      } else if (data['type'] === MessageType.NO_CONTENT) {
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
      allowFullscreen
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

const Twitter = forwardRef(TwitterWithRef);
Twitter.displayName = 'Twitter'; // Make findable for tests.
export {Twitter};
