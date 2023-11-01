import {Loading_Enum} from '#core/constants/loading-instructions';
import {ReadyState_Enum} from '#core/constants/ready-state';

import * as Preact from '#preact';
import {
  useCallback,
  useEffect,
  useImperativeHandle,
  useLayoutEffect,
  useRef,
} from '#preact';
import {forwardRef} from '#preact/compat';
import {ContainWrapper, useValueRef} from '#preact/component';
import {useAmpContext, useLoading} from '#preact/context';

const DEFAULT_MATCHES_MESSAGING_ORIGIN = () => false;
const ABOUT_BLANK = 'about:blank';

/**
 * iframe.src = iframe.src forces an iframe reload,
 * EXCEPT when the iframe.src contains a fragment.
 * With a fragment it just thinks it's a hash change.
 * @param {string} src
 * @return {boolean}
 * */
const canResetSrc = (src) =>
  !!(src && src != ABOUT_BLANK && !src.includes('#'));

/**
 * @param {import('./types').IframeEmbedProps} props
 * @param {import('preact').RefObject<import('./types').IframeEmbedApi>} ref
 * @return {import('preact').VNode}
 */
export function IframeEmbedWithRef(
  {
    allow,
    allowFullScreen,
    iframeStyle,
    loading: loadingProp,
    matchesMessagingOrigin = DEFAULT_MATCHES_MESSAGING_ORIGIN,
    messageHandler,
    name,
    onReadyState,
    ready = true,
    sandbox,
    src,
    title,
    ...rest
  },
  ref
) {
  const {playable} = useAmpContext();
  const loading = useLoading(loadingProp);
  const mount = loading !== Loading_Enum.UNLOAD;

  const loadedRef = useRef(false);
  // The `onReadyStateRef` is passed via a ref to avoid the changed values
  // of `onReadyState` re-triggering the side effects.
  const onReadyStateRef = useValueRef(onReadyState);
  const setLoaded = useCallback(
    /** @param {boolean} value */
    (value) => {
      if (value !== loadedRef.current) {
        loadedRef.current = value;
        const onReadyState = onReadyStateRef.current;
        onReadyState?.(
          value ? ReadyState_Enum.COMPLETE : ReadyState_Enum.LOADING
        );
      }
    },
    [onReadyStateRef]
  );

  /** @type {import('preact/hooks').MutableRef<HTMLIFrameElement?>} */
  const iframeRef = useRef(null);

  // Component API: IframeEmbedDef.Api.
  useImperativeHandle(
    ref,
    () => ({
      // Standard Bento
      get readyState() {
        return loadedRef.current
          ? ReadyState_Enum.COMPLETE
          : ReadyState_Enum.LOADING;
      },
      get node() {
        return iframeRef.current;
      },
    }),
    []
  );

  // Reset readyState to "loading" when an iframe is unloaded. Has to be
  // a `useLayoutEffect` to avoid race condition with a future "load" event.
  // A race condition can happen when a `useEffect` would be executed
  // after a future "load" is dispatched.
  useLayoutEffect(() => {
    if (!mount) {
      setLoaded(false);
    }
  }, [mount, setLoaded]);

  // Pause if the post goes into a "paused" context.
  useEffect(() => {
    const iframe = iframeRef.current;
    if (!playable && iframe) {
      const {src} = iframe;
      // Resetting the `src` will reset the iframe and pause it. It will force
      // the reload of the whole iframe. But it's the only reliable option
      // to force pause.
      if (canResetSrc(src)) {
        iframe.src = iframe.src;
      } else {
        const parent = iframe.parentNode;
        parent?.insertBefore(iframe, iframe.nextSibling);
      }
    }
  }, [playable]);

  useLayoutEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe || !mount) {
      return;
    }

    /** @param {MessageEvent} event */
    const handler = (event) => {
      const iframe = iframeRef.current;
      if (
        !iframe ||
        event.source != iframe.contentWindow ||
        !matchesMessagingOrigin(event.origin)
      ) {
        return;
      }
      messageHandler(event);
    };

    const {defaultView} = iframe.ownerDocument;
    defaultView?.addEventListener('message', handler);
    return () => defaultView?.removeEventListener('message', handler);
  }, [matchesMessagingOrigin, messageHandler, mount, ready]);

  return (
    <ContainWrapper {...rest} layout size paint>
      {mount && ready && (
        <iframe
          allow={allow}
          allowFullScreen={allowFullScreen}
          // TODO: is it frameborder or frameBorder?
          frameBorder="0"
          // TODO: ensure loading is not "auto" or "unload".
          loading={/** @type {*} */ (loading)}
          name={name}
          onLoad={() => setLoaded(true)}
          // TODO: what should be here?
          // @ts-ignore
          part="iframe"
          ref={iframeRef}
          sandbox={sandbox}
          scrolling="no"
          src={src}
          style={{
            ...iframeStyle,
            width: '100%',
            height: '100%',
            contentVisibility: 'auto',
          }}
          title={title}
        />
      )}
    </ContainWrapper>
  );
}

const IframeEmbed = forwardRef(IframeEmbedWithRef);
IframeEmbed.displayName = 'IframeEmbed'; // Make findable for tests.
export {IframeEmbed};
