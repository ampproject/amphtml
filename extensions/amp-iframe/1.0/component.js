import * as Preact from '#preact';
import {useCallback, useEffect, useRef} from '#preact';
import {MessageType} from '#core/3p-frame-messaging';
import {toWin} from '#core/window';

const NOOP = () => {};
const FULL_HEIGHT = '100%';

/**
 * @param {!IframeDef.Props} props
 * @return {PreactDef.Renderable}
 */
export function Iframe({
  allowFullScreen,
  allowPaymentRequest,
  allowTransparency,
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

  const attemptResize = useCallback(() => {
    const iframe = iframeRef.current;
    if (!iframe) {
      return;
    }
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
        iframe.height = FULL_HEIGHT;
        iframe.width = FULL_HEIGHT;
      });
    } else if (isIntersectingRef.current === false) {
      // attemptResize can be called before the IntersectionObserver starts observing
      // the component if an event is fired immediately. Therefore we check
      // isIntersectingRef has changed via isIntersectingRef.current === false.
      if (width) {
        iframe.width = width;
      }
      if (height) {
        iframe.height = height;
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
    if (!iframe) {
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

  return (
    <iframe
      ref={iframeRef}
      src={src}
      srcdoc={srcdoc}
      sandbox={sandbox}
      allowfullscreen={allowFullScreen}
      allowpaymentrequest={allowPaymentRequest}
      allowtransparency={allowTransparency}
      referrerpolicy={referrerPolicy}
      onload={onLoad}
      frameBorder="0"
      {...rest}
    ></iframe>
  );
}
