import * as Preact from '#preact';
import {Deferred} from '#core/data-structures/promise';
import {VideoWrapper} from './component';
import {forwardRef} from '#preact/compat';
import {
  useCallback,
  useImperativeHandle,
  useLayoutEffect,
  useMemo,
  useRef,
} from '#preact';

const DEFAULT_SANDBOX = [
  'allow-scripts',
  'allow-same-origin',
  'allow-popups',
  'allow-popups-to-escape-sandbox',
  'allow-top-navigation-by-user-activation',
].join(' ');

/**
 * @param {T} prop
 * @return {{current: ?T}}
 * @template T
 */
function usePropRef(prop) {
  const ref = useRef(null);
  ref.current = prop;
  return ref;
}

/**
 * @param {!VideoIframeDef.Props} props
 * @param {{current: ?T}} ref
 * @return {PreactDef.Renderable}
 * @template T
 */
function VideoIframeInternalWithRef(
  {
    loading,
    unloadOnPause = false,
    sandbox = DEFAULT_SANDBOX,
    muted = false,
    controls = false,
    origin,
    onCanPlay,
    onMessage,
    playerStateRef,
    makeMethodMessage: makeMethodMessageProp,
    onIframeLoad,
    ...rest
  },
  ref
) {
  const iframeRef = useRef(null);

  const readyDeferred = useMemo(() => new Deferred(), []);

  // Only use the first instance of `makeMethodMessage` to avoid resetting this
  // callback all the time.
  const makeMethodMessageRef = useRef(makeMethodMessageProp);
  const postMethodMessage = useCallback(
    (method) => {
      if (!iframeRef.current || !iframeRef.current.contentWindow) {
        return;
      }
      const makeMethodMessage = makeMethodMessageRef.current;
      readyDeferred.promise.then(() => {
        const message = makeMethodMessage(method);
        iframeRef.current.contentWindow./*OK*/ postMessage(message, '*');
      });
    },
    [readyDeferred.promise]
  );

  useImperativeHandle(
    ref,
    () => ({
      get currentTime() {
        return playerStateRef?.current?.['currentTime'] ?? NaN;
      },
      get duration() {
        return playerStateRef?.current?.['duration'] ?? NaN;
      },
      requestFullscreen: () => {
        return readyDeferred.promise.then(() =>
          iframeRef.current.requestFullscreen()
        );
      },
      play: () => postMethodMessage('play'),
      pause: () => {
        if (unloadOnPause) {
          const iframe = iframeRef.current;
          if (iframe) {
            iframe.src = iframe.src;
          }
        } else {
          postMethodMessage('pause');
        }
      },
    }),
    [playerStateRef, postMethodMessage, readyDeferred.promise, unloadOnPause]
  );

  // Keep `onMessage` in a ref to prevent re-listening on every render.
  // This could otherwise occur when the passed `onMessage` is not memoized.
  const onMessageRef = usePropRef(onMessage);

  useLayoutEffect(() => {
    if (!iframeRef.current) {
      return;
    }

    /** @param {Event} event */
    function handleMessage(event) {
      if (!onMessageRef.current) {
        return;
      }

      if (
        (origin && !origin.test(event.origin)) ||
        event.source != iframeRef.current.contentWindow
      ) {
        return;
      }

      // Triggers like an HTMLMediaElement, so we give it an iframe handle
      // to dispatch events from. They're caught from being set on {...rest} so
      // setting onPlay, etc. props should just work.
      onMessageRef.current({
        // Event
        currentTarget: iframeRef.current,
        target: iframeRef.current,

        // MessageEvent
        data: event.data,
      });
    }

    const {defaultView} = iframeRef.current.ownerDocument;
    defaultView.addEventListener('message', handleMessage);
    return () => defaultView.removeEventListener('message', handleMessage);
  }, [origin, onMessageRef]);

  useLayoutEffect(() => {
    postMethodMessage(muted ? 'mute' : 'unmute');
  }, [muted, postMethodMessage]);

  useLayoutEffect(() => {
    postMethodMessage(controls ? 'showControls' : 'hideControls');
  }, [controls, postMethodMessage]);

  return (
    <iframe
      {...rest}
      ref={iframeRef}
      allowfullscreen
      frameborder="0"
      sandbox={sandbox}
      loading={loading}
      onCanPlay={() => {
        if (onCanPlay) {
          readyDeferred.promise.then(onCanPlay);
        }
        readyDeferred.resolve();
      }}
      onLoad={(event) => {
        if (onIframeLoad) {
          onIframeLoad(event);
        }
      }}
    />
  );
}

/** @visibleForTesting */
const VideoIframeInternal = forwardRef(VideoIframeInternalWithRef);
VideoIframeInternal.displayName = 'VideoIframeInternal';
export {VideoIframeInternal};

/**
 * VideoWrapper using an <iframe> for implementation.
 * Usable on the AMP layer through VideoBaseElement.
 * @param {VideoIframeDef.Props} props
 * @param {{current: (?T)}} ref
 * @return {PreactDef.Renderable}
 * @template T
 */
function VideoIframeWithRef(props, ref) {
  return <VideoWrapper ref={ref} {...props} component={VideoIframeInternal} />;
}

/**
 * VideoWrapper using an <iframe> for implementation.
 * Usable on the AMP layer through VideoBaseElement.
 * @param {VideoIframeDef.Props} props
 * @return {PreactDef.Renderable}=
 */
const VideoIframe = forwardRef(VideoIframeWithRef);
VideoIframe.displayName = 'VideoIframe';
export {VideoIframe};
