import * as Preact from '#preact';
import {ProxyIframeEmbed} from '#preact/component/3p-frame';
import {MessageType, deserializeMessage} from '#core/3p-frame-messaging';
import {forwardRef} from '#preact/compat';
import {useCallback, useEffect, useMemo, useRef, useState} from '#preact';
import {useValueRef} from '#preact/component';
import {getWin} from '#core/window';
import {setStyle} from '#core/dom/style';
import {useStyles} from './component.jss';

/** @const {string} */
const TYPE = 'twitter';
const FULL_HEIGHT = '100%';
const MATCHES_MESSAGING_ORIGIN = () => true;

/**
 * @param {!BentoTwitterDef.Props} props
 * @return {PreactDef.Renderable}
 */
function BentoTwitterWithRef({
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
}) {
  const [height, setHeight] = useState(null);
  const [inView, setinView] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const onLoadRef = useValueRef(onLoad);
  const onErrorRef = useValueRef(onError);
  const bentoTwitterRef = useRef(null);
  const classes = useStyles();

  const setComponentHeight = useCallback(
    (height) => {
      if (!bentoTwitterRef.current) {
        return;
      }

      setStyle(bentoTwitterRef.current, 'height', height, 'px');
    },
    [bentoTwitterRef]
  );

  const messageHandler = useCallback(
    (event) => {
      const data = deserializeMessage(event.data);
      if (data['type'] == MessageType.EMBED_SIZE) {
        const height = data['height'];
        if (requestResize) {
          requestResize(height);
          setHeight(FULL_HEIGHT);
        } else {
          setIsLoading(false);
          setHeight(height);
          setComponentHeight(height);
        }

        onLoadRef.current?.();
      } else if (data['type'] === MessageType.NO_CONTENT) {
        onErrorRef.current?.();
      }
    },
    [requestResize, onLoadRef, onErrorRef, setComponentHeight]
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

  const handleScroll = useCallback(() => {
    setinView(true);

    // Remove event listener once element is rendered.
    const iframeContainer = containerRef.current;
    if (!iframeContainer) {
      return;
    }
    const win = getWin(iframeContainer);
    win.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const iframeContainer = containerRef.current;

    if (!iframeContainer) {
      return;
    }

    /**
     * Need the reference to the <bento-twitter> element to be able to resize the embed.
     * As the twitter embed size can vary based on the content, the resizing is required to
     * avoid showing the cut off content.
     */
    bentoTwitterRef.current = iframeContainer./*REVIEW*/ offsetParent;

    const win = getWin(iframeContainer);
    const boundingClientRect =
      iframeContainer./*REVIEW*/ getBoundingClientRect();
    const isInViewPort = boundingClientRect.top < win./*REVIEW*/ innerHeight;

    if (isInViewPort) {
      setinView(true);
    } else {
      win.addEventListener('scroll', handleScroll);
    }
  }, [handleScroll]);

  const containerRef = useRef(null);

  return (
    <div ref={containerRef}>
      {isLoading && (
        <div class={classes.loaderWrapper}>
          <div class={classes.loader}></div>
        </div>
      )}
      {inView && (
        <ProxyIframeEmbed
          allowfullscreen
          title={title}
          {...rest}
          // non-overridable props
          matchesMessagingOrigin={MATCHES_MESSAGING_ORIGIN}
          messageHandler={messageHandler}
          options={options}
          type={TYPE}
          style={height ? {...style, height} : style}
        />
      )}
    </div>
  );
}

const BentoTwitter = forwardRef(BentoTwitterWithRef);
BentoTwitter.displayName = 'BentoTwitter'; // Make findable for tests.
export {BentoTwitter};
