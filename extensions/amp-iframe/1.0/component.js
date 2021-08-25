import * as Preact from '#preact';
import {useCallback, useEffect, useMemo, useRef} from '#preact';
import {MessageType} from '#preact/component/3p-frame';
import {toWin} from '#core/window';
import {ContainWrapper} from '#preact/component';
import {setStyle} from '#core/dom/style';

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
  // const containerRef = useRef(null);
  const dataRef = useRef(null);
  const isIntersectingRef = useRef(null);

  const attemptResize = useCallback(() => {
    // const container = containerRef.current;
    // if (!container) {
    //   return;
    // }
    const iframe = iframeRef.current;
    let height = Number(dataRef.current.height);
    let width = Number(dataRef.current.width);
    if (!height && !width) {
      console./*OK*/ error(
        'Ignoring resize request because width and height value is invalid'
      );
      return;
    }
    // TODO(dmanek): Calculate width and height of the container to include padding.
    if (!height) {
      height = iframe./*OK*/ offsetHeight;
    }
    if (!width) {
      width = iframe./*OK*/ offsetWidth;
    }
    if (requestResize) {
      // Currently `requestResize` is called twice:
      // 1. when post message is received in viewport
      // 2. when exiting viewport
      // This could be optimized by reducing to one call by assessing when to call.
      requestResize(height, width).then(() => {
        // iframe.height = FULL_HEIGHT;
        // iframe.width = FULL_HEIGHT;
        setStyle(iframe, 'width', width, 'px');
        setStyle(iframe, 'height', height, 'px');
      });
    } else if (isIntersectingRef.current === false) {
      const iframe = iframeRef.current;
      // attemptResize can be called before the IntersectionObserver starts observing
      // the component if an event is fired immediately. Therefore we check
      // isIntersectingRef has changed via isIntersectingRef.current === false.
      if (width) {
        setStyle(iframe, 'width', width, 'px');
      }
      if (height) {
        setStyle(iframe, 'height', height, 'px');
      }
    }
  }, [requestResize]);

  const handlePostMessage = useCallback(
    (event) => {
      if (event.data?.type !== MessageType.EMBED_SIZE) {
        return;
      }
      dataRef.current = event.data;
      attemptResize();
    },
    [attemptResize]
  );

  useEffect(() => {
    const iframe = iframeRef.current;
    // const container = containerRef.current;
    if (!iframe /*|| !container*/) {
      return;
    }
    const win = iframe && toWin(iframe.ownerDocument.defaultView);
    if (!win) {
      return;
    }
    const io = new win.IntersectionObserver((entries) => {
      const last = entries[entries.length - 1];
      isIntersectingRef.current = last.isIntersecting;
      if (last.isIntersecting || !dataRef.current || !win) {
        return;
      }
      attemptResize();
    });
    io.observe(iframe);
    win.addEventListener('message', handlePostMessage);

    return () => {
      io.unobserve(iframe);
      win.removeEventListener('message', handlePostMessage);
    };
  }, [attemptResize, handlePostMessage]);

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
      contentRef={iframeRef}
      contentStyle={iframeStyle}
      size={false}
      layout={false}
      paint={false}
    />
  );
}
