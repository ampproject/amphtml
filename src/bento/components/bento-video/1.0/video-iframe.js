import {Deferred} from '#core/data-structures/promise';

import * as Preact from '#preact';
import {
  useCallback,
  useImperativeHandle,
  useLayoutEffect,
  useMemo,
  useRef,
} from '#preact';
import {forwardRef} from '#preact/compat';

import {VideoWrapper} from './component';

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
 * Posts message to frame when ready promise resolves
 * @param {HTMLIFrameElement} iframe
 * @param {Promise<void>} ready
 * @param {function():string} makeMessageCb
 */
function postWhenReady(iframe, ready, makeMessageCb) {
  if (!iframe || !iframe.contentWindow) {
    return;
  }
  ready.then(() => {
    iframe.contentWindow./*OK*/ postMessage(makeMessageCb(), '*');
  });
}

/**
 * @param {!VideoIframeDef.Props} props
 * @param {{current: ?T}} ref
 * @return {PreactDef.Renderable}
 * @template T
 */
function VideoIframeInternalWithRef(
  {
    controls = false,
    loading,
    makeFullscreenMessage: makeFullscreenMessageProp,
    makeMethodMessage: makeMethodMessageProp,
    muted = false,
    onCanPlay,
    onIframeLoad,
    onMessage,
    origin,
    playerStateRef,
    sandbox = DEFAULT_SANDBOX,
    unloadOnPause = false,
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
      postWhenReady(iframeRef?.current, readyDeferred.promise, () =>
        makeMethodMessageRef.current(method)
      );
    },
    [readyDeferred.promise]
  );
  const makeFullscreenMessageRef = useRef(makeFullscreenMessageProp);
  const postFullscreenMessage = useCallback(
    () =>
      postWhenReady(
        iframeRef?.current,
        readyDeferred.promise,
        makeFullscreenMessageRef.current
      ),
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
        if (makeFullscreenMessageRef.current) {
          postFullscreenMessage();
        } else {
          return readyDeferred.promise.then(() => {
            iframeRef.current.requestFullscreen();
          });
        }
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
    [
      playerStateRef,
      postMethodMessage,
      postFullscreenMessage,
      readyDeferred.promise,
      unloadOnPause,
    ]
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
        onIframeLoad?.(event);
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
 * Usable on the AMP layer through AmpVideoBaseElement.
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
 * Usable on the AMP layer through AmpVideoBaseElement.
 * @param {VideoIframeDef.Props} props
 * @return {PreactDef.Renderable}=
 */
const VideoIframe = forwardRef(VideoIframeWithRef);
VideoIframe.displayName = 'VideoIframe';
export {VideoIframe};
