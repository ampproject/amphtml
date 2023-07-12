import {MessageType_Enum, deserializeMessage} from '#core/3p-frame-messaging';

import * as Preact from '#preact';
import {useCallback, useContext, useState} from '#preact';
import {forwardRef} from '#preact/compat';
import {useValueRef} from '#preact/component';
import {ProxyIframeEmbed} from '#preact/component/3p-frame';

import {BentoEmbedlyContext} from './embedly-context';

/**
 * Attribute name used to set api key with name
 * expected by embedly.
 * @const {string}
 */
const API_KEY_ATTR_NAME = 'data-card-key';

const FULL_HEIGHT = '100%';

/**
 * @param {!BentoEmbedlyCardDef.Props} props
 * @param {{current: ?BentoEmbedlyCardDef.Api}} ref
 * @return {PreactDef.Renderable}
 */
export function BentoEmbedlyCardWithRef(
  {onLoad, requestResize, style, title, url, ...rest},
  ref
) {
  const [height, setHeight] = useState(null);
  const onLoadRef = useValueRef(onLoad);
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

        onLoadRef.current?.();
      }
    },
    [requestResize, onLoadRef]
  );

  const {apiKey} = useContext(BentoEmbedlyContext);

  // Check for valid props
  if (!checkProps(url)) {
    displayWarning('url prop is required for BentoEmbedlyCard');
  }

  // Prepare options for ProxyIframeEmbed
  const iframeOptions = {
    url,
  };

  // Add embedly key
  if (apiKey) {
    iframeOptions[API_KEY_ATTR_NAME] = apiKey;
  }

  return (
    <ProxyIframeEmbed
      options={iframeOptions}
      ref={ref}
      title={title || 'Embedly card'}
      type="embedly"
      {...rest}
      // non-overridable props
      messageHandler={messageHandler}
      style={height ? {...style, height} : style}
    />
  );
}

/**
 * Verify required props and throw error if necessary.
 * @param {string|undefined} url URL to check
 * @return {boolean} true on valid
 */
function checkProps(url) {
  // Perform manual checking as assertion is not available for Bento: Issue #32739
  return !!url;
}

/**
 * Display warning in browser console
 * @param {?string} message Warning to be displayed
 */
function displayWarning(message) {
  console /*OK*/
    .warn(message);
}

const BentoEmbedlyCard = forwardRef(BentoEmbedlyCardWithRef);
BentoEmbedlyCard.displayName = 'BentoEmbedlyCard'; // Make findable for tests.
export {BentoEmbedlyCard};
