import {MessageType_Enum, deserializeMessage} from '#core/3p-frame-messaging';

import * as Preact from '#preact';
import {useCallback, useEffect, useMemo, useRef, useState} from '#preact';
import {ProxyIframeEmbed} from '#preact/component/3p-frame';

const TYPE = 'github';
const DEFAULT_TITLE = 'Github gist';
const FULL_HEIGHT = '100%';

/**
 * @param {!BentoGist.Props} props
 * @return {PreactDef.Renderable}
 */
export function BentoGist({
  gistId,
  title = DEFAULT_TITLE,
  requestResize,
  style,
  ...rest
}) {
  const iframeRef = useRef(null);

  const [height, setHeight] = useState(FULL_HEIGHT);
  const messageHandler = useCallback(
    (event) => {
      const data = deserializeMessage(event.data);
      if (data['type'] == MessageType_Enum.EMBED_SIZE) {
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
  useEffect(() => {
    /** Unmount Procedure */
    return () => {
      // Release iframe resources
      iframeRef.current = null;
    };
  }, []);
  const options = useMemo(
    () => ({
      gistid: gistId,
    }),
    [gistId]
  );
  return (
    <ProxyIframeEmbed
      title={title}
      options={options}
      ref={iframeRef}
      type={TYPE}
      messageHandler={messageHandler}
      style={height ? {...style, height} : style}
      {...rest}
    />
  );
}
