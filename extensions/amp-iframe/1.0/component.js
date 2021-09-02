import * as Preact from '#preact';
import {useCallback, useEffect, useMemo, useRef} from '#preact';
import {MessageType} from '#core/3p-frame-messaging';
import {toWin} from '#core/window';
import {ContainWrapper, useIntersectionObserver} from '#preact/component';
import {setStyle} from '#core/dom/style';
import {refs} from '#preact/utils';

const NOOP = () => {};

/**
 * @param {!IframeDef.Props} props
 * @return {PreactDef.Renderable}
 */
export function Iframe({
  allowFullScreen,
  allowPaymentRequest,
  allowTransparency,
  iframeStyle,
  onLoad = NOOP,
  referrerPolicy,
  requestResize,
  sandbox,
  src,
  srcdoc,
  ...rest
}) {
  const iframeRef = useRef();
  const dataRef = useRef(null);
  const isIntersectingRef = useRef(null);
  const containerRef = useRef(null);

  const updateContainerSize = (height, width) => {
    const container = containerRef.current;
    if (!container) {
      return;
    }
    setStyle(container, 'width', width, 'px');
    setStyle(container, 'height', height, 'px');
  };

  const attemptResize = useCallback(() => {
    let height = Number(dataRef.current?.height);
    let width = Number(dataRef.current?.width);
    dataRef.current = null;
    if (!height && !width) {
      console./*OK*/ error(
        'Ignoring resize request because width and height value is invalid'
      );
      return;
    }
    const iframe = iframeRef.current;
    // TODO(dmanek): Calculate width and height of the container to include padding.
    if (!height) {
      height = iframe./*OK*/ offsetHeight;
    }
    if (!width) {
      width = iframe./*OK*/ offsetWidth;
    }
    if (requestResize) {
      // Currently `requestResize` is called twice when:
      // 1. post message is received in viewport
      // 2. exiting viewport
      // This could be optimized by reducing to one call.
      requestResize(height, width);
    } else if (isIntersectingRef.current === false) {
      // attemptResize can be called before the IntersectionObserver starts observing
      // the component if an event is fired immediately. Therefore we check
      // isIntersectingRef has changed via isIntersectingRef.current === false.
      updateContainerSize(height, width);
    }
  }, [requestResize]);

  const handlePostMessage = useCallback(
    (event) => {
      if (event.data?.type !== MessageType.EMBED_SIZE) {
        return;
      }
      dataRef.current = event.data;
      if (isIntersectingRef.current !== null) {
        attemptResize();
      }
    },
    [attemptResize]
  );

  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe) {
      return;
    }
    const win = toWin(iframe.ownerDocument.defaultView);
    if (!win) {
      return;
    }

    win.addEventListener('message', handlePostMessage);

    return () => {
      win.removeEventListener('message', handlePostMessage);
    };
  }, [handlePostMessage]);

  const ioCallback = useCallback(
    ({isIntersecting}) => {
      if (isIntersecting === isIntersectingRef.current) {
        return;
      }
      isIntersectingRef.current = isIntersecting;
      if (!isIntersecting) {
        attemptResize();
      }
    },
    [attemptResize]
  );

  const measureRef = useIntersectionObserver(ioCallback);

  const contentProps = useMemo(
    () => ({
      src,
      srcdoc,
      sandbox,
      allowFullScreen,
      allowPaymentRequest,
      allowTransparency,
      referrerPolicy,
      onLoad,
      frameBorder: '0',
    }),
    [
      src,
      srcdoc,
      sandbox,
      allowFullScreen,
      allowPaymentRequest,
      allowTransparency,
      referrerPolicy,
      onLoad,
    ]
  );

  return (
    <ContainWrapper
      contentAs="iframe"
      contentProps={contentProps}
      contentRef={refs(iframeRef, measureRef)}
      contentStyle={{'box-sizing': 'border-box', ...iframeStyle}}
      ref={containerRef}
      size
      layout
      paint
      {...rest}
    />
  );
}
