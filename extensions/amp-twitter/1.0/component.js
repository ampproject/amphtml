import {MessageType_Enum, deserializeMessage} from '#core/3p-frame-messaging';
import {setStyles} from '#core/dom/style';

import * as Preact from '#preact';
import {useCallback, useEffect, useMemo, useRef, useState} from '#preact';
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
  const iframeRef = useRef(ref);

  const messageHandler = useCallback(
    (event) => {
      const data = deserializeMessage(event.data);
      if (data['type'] == MessageType_Enum.EMBED_SIZE) {
        const height = data['height'];
        if (requestResize) {
          requestResize(height);

          // Remove the position style from embed after the resize is complete.
          setStyles(iframeRef.current.node.getRootNode().host, {
            position: '',
            opacity: '',
            top: '',
            bottom: '',
            left: '',
            right: '',
            pointerEvents: '',
          });
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

  useEffect(() => {
    // This style is added as part of a workaround to fix the component resizing issue because
    // the resizing happens only when the embed comes into viewport and most of the time the
    // attemptChangeHeight request is gets rejected.
    setStyles(iframeRef.current.node.getRootNode().host, {
      position: 'fixed',
      opacity: '0',
      top: '0',
      bottom: '0',
      left: '0',
      right: '0',
      pointerEvents: 'none',
    });
  }, [iframeRef]);

  return (
    <ProxyIframeEmbed
      allowfullscreen
      ref={iframeRef}
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
