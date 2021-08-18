import {deserializeMessage} from '#core/3p-frame-messaging';

import * as Preact from '#preact';
import {useCallback, useContext, useState} from '#preact';
import {forwardRef} from '#preact/compat';
import {MessageType, ProxyIframeEmbed} from '#preact/component/3p-frame';

import {EmbedlyContext} from './embedly-context';

/**
 * Attribute name used to set api key with name
 * expected by embedly.
 * @const {string}
 */
const API_KEY_ATTR_NAME = 'data-card-key';

const FULL_HEIGHT = '100%';

/**
 * @param {!EmbedlyCardDef.Props} props
 * @param {{current: ?EmbedlyCardDef.Api}} ref
 * @return {PreactDef.Renderable}
 */
export function EmbedlyCardWithRef(
  {requestResize, style, title, url, ...rest},
  ref
) {
  const [height, setHeight] = useState(null);
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

  const {apiKey} = useContext(EmbedlyContext);

  // Check for valid props
  if (!checkProps(url)) {
    displayWarning('url prop is required for EmbedlyCard');
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

const EmbedlyCard = forwardRef(EmbedlyCardWithRef);
EmbedlyCard.displayName = 'EmbedlyCard'; // Make findable for tests.
export {EmbedlyCard};
