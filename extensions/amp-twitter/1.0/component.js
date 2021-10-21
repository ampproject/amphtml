import * as Preact from '#preact';
import {ProxyIframeEmbed} from '#preact/component/3p-frame';
import {MessageType, deserializeMessage} from '#core/3p-frame-messaging';
import {forwardRef} from '#preact/compat';
import {useCallback, useMemo, useState} from '#preact';
import {useIntersectionObserver, useValueRef} from '#preact/component';
import {useMergeRefs} from '#preact/utils';

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
  const [inView, setinView] = useState(false);
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

  // eslint-disable-next-line prefer-const
  let observerCb;
  const ioCallback = useCallback(
    ({isIntersecting}) => {
      setinView(true);
      if (!isIntersecting) {
        setRender(true);
        // unobserve element once it's rendered
        observerCb(null);
      }
    },
    [observerCb]
  );

  observerCb = useIntersectionObserver(ioCallback);
  // Need to create custom callback ref because ProxyIframeEmbed uses an imperative handle with an property for the node.
  const observerCbRef = (proxyIframeEmbedHandle) => {
    const {node: iframeNode} = proxyIframeEmbedHandle;
    // Observe grandparent div instead of iframe because iframe keeps changing height
    observerCb(iframeNode?.parentNode.parentNode);
  };

  const proxyIframeEmbedRef = useMergeRefs([ref, observerCbRef]);

  return (
    <ProxyIframeEmbed
      allowfullscreen
      ref={proxyIframeEmbedRef}
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
