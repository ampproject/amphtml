import * as Preact from '#preact';
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from '#preact';
import {forwardRef} from '#preact/compat';
import {ProxyIframeEmbed} from '#preact/component/3p-frame';

const FULL_HEIGHT = '100%';
const MATCHES_MESSAGING_ORIGIN = () => true;

/**
 * @param {!RedditDef.Props} props
 * @param ref
 * @return {PreactDef.Renderable}
 */
export function RedditWithRef({embedtype, requestResize, src, ...rest}, ref) {
  const onMessage = useCallback((event) => {
    console.log(event);
    const data = deserializeMessage(event.data);
    // console.log(e);
  }, []);

  const [height, setHeight] = useState(FULL_HEIGHT);
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
      }
    },
    [requestResize]
  );

  const options = useMemo(() => ({src}), [src]);

  return (
    <ProxyIframeEmbed ref={ref} options={options} type="reddit" {...rest} />
  );
}

const Reddit = forwardRef(RedditWithRef);
Reddit.displayName = 'Reddit';
export {Reddit};
