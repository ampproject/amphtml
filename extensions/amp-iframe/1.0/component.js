import {MessageType_Enum} from '#core/3p-frame-messaging';
import {setStyle} from '#core/dom/style';
import {getWin} from '#core/window';

import * as Preact from '#preact';
import {useCallback, useEffect, useMemo, useRef} from '#preact';
import {ContainWrapper} from '#preact/component';
import {useIntersectionObserver} from '#preact/component/intersection-observer';
import {useMergeRefs} from '#preact/utils';

import {
  DEFAULT_THRESHOLD,
  cloneEntryForCrossOrigin,
} from '#utils/intersection-observer-3p-host';

import {postMessage} from '../../../src/iframe-helper';

const NOOP = () => {};

/**
 * @param {!BentoIframeDef.Props} props
 * @return {PreactDef.Renderable}
 */
export function BentoIframe({
  allowFullScreen,
  allowPaymentRequest,
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
  const observerRef = useRef(null);
  const targetOriginRef = useRef(null);

  const viewabilityCb = (entries) => {
    const iframe = iframeRef.current;
    const targetOrigin = targetOriginRef.current;
    if (!iframe || !targetOrigin) {
      return;
    }
    postMessage(
      iframe,
      MessageType_Enum.INTERSECTION,
      {'changes': entries.map(cloneEntryForCrossOrigin)},
      targetOrigin
    );
  };

  const handleSendIntersectionsPostMessage = useCallback((event) => {
    const iframe = iframeRef.current;
    if (!iframe) {
      return;
    }
    if (
      event.source !== iframe.contentWindow ||
      event.data?.type !== MessageType_Enum.SEND_INTERSECTIONS
    ) {
      return;
    }
    targetOriginRef.current = event.origin;
    const win = getWin(iframe);
    observerRef.current = new win.IntersectionObserver(viewabilityCb, {
      threshold: DEFAULT_THRESHOLD,
    });
    observerRef.current.observe(iframe);
  }, []);

  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe) {
      return;
    }
    const win = getWin(iframe);
    win.addEventListener('message', handleSendIntersectionsPostMessage);
    let observer = observerRef.current;

    return () => {
      observer?.unobserve(iframe);
      observer = null;
      win.removeEventListener('message', handleSendIntersectionsPostMessage);
    };
  }, [handleSendIntersectionsPostMessage]);

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

  const handleEmbedSizePostMessage = useCallback(
    (event) => {
      if (event.data?.type !== MessageType_Enum.EMBED_SIZE) {
        return;
      }
      dataRef.current = event.data;
      // We only allow resizing when the iframe is outside the viewport,
      // to guarantee CLS compliance. This may have the side effect of the iframe
      // not resizing on `embed-size` postMessage while it's within the viewport
      // where an author wants to resize the iframe. In that
      // case remove this check & call `attemptResize` directly.
      if (isIntersectingRef.current === false) {
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
    const win = getWin(iframe);
    if (!win) {
      return;
    }

    win.addEventListener('message', handleEmbedSizePostMessage);

    return () => {
      win.removeEventListener('message', handleEmbedSizePostMessage);
    };
  }, [handleEmbedSizePostMessage]);

  const ioCallback = useCallback(
    ({isIntersecting}) => {
      if (isIntersecting === isIntersectingRef.current) {
        return;
      }
      isIntersectingRef.current = isIntersecting;
      if (!isIntersecting && dataRef.current) {
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
      referrerPolicy,
      onLoad,
    ]
  );

  return (
    <ContainWrapper
      contentAs="iframe"
      contentProps={contentProps}
      contentRef={useMergeRefs([iframeRef, measureRef])}
      contentStyle={{'box-sizing': 'border-box', ...iframeStyle}}
      ref={containerRef}
      size
      layout
      paint
      {...rest}
    />
  );
}
