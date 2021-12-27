import {MessageType_Enum, deserializeMessage} from '#core/3p-frame-messaging';
import {tryParseJson} from '#core/types/object/json';

import * as Preact from '#preact';
import {useCallback, useMemo, useState} from '#preact';
import {forwardRef} from '#preact/compat';
import {useValueRef} from '#preact/component';
import {ProxyIframeEmbed} from '#preact/component/3p-frame';

const TYPE = 'beopinion';
const FULL_HEIGHT = '100%';
const MATCHES_MESSAGING_ORIGIN = () => true;
const DEFAULT_TITLE = 'BeOpinion content';

/**
 * @param {!BentoBeopinionDef.Props} props
 * @param {{current: ?BentoBeopinionDef.Api}} ref
 * @return {PreactDef.Renderable}
 */
export function BentoBeopinionWithRef(
  {
    account,
    content,
    myContent,
    name,
    onError,
    onLoad,
    requestResize,
    style,
    title = DEFAULT_TITLE,
    ...rest
  },
  ref
) {
  const [height, setHeight] = useState(null);
  const onLoadRef = useValueRef(onLoad);
  const onErrorRef = useValueRef(onError);

  const messageHandler = useCallback(
    (event) => {
      const data = tryParseJson(event.data) ?? deserializeMessage(event.data);
      if (data['type'] == MessageType_Enum.EMBED_SIZE) {
        const eventHeight = data['height'];
        if (requestResize) {
          requestResize(eventHeight);
          setHeight(FULL_HEIGHT);
        } else {
          setHeight(eventHeight);
        }

        onLoadRef.current?.();
      } else if (data['type'] === MessageType_Enum.NO_CONTENT) {
        onErrorRef.current?.();
      }
    },
    [requestResize, onErrorRef, onLoadRef]
  );

  const options = useMemo(
    () => ({
      account,
      content,
      name,
      myContent,
      onError,
      onLoad,
      requestResize,
      title,
    }),
    [account, content, name, myContent, onError, onLoad, requestResize, title]
  );

  return (
    <ProxyIframeEmbed
      options={options}
      ref={ref}
      title={title}
      {...rest}
      matchesMessagingOrigin={MATCHES_MESSAGING_ORIGIN}
      messageHandler={messageHandler}
      type={TYPE}
      style={height ? {...style, height} : style}
    />
  );
}

const BentoBeopinion = forwardRef(BentoBeopinionWithRef);
BentoBeopinion.displayName = 'BentoBeopinion'; // Make findable for tests.
export {BentoBeopinion};
