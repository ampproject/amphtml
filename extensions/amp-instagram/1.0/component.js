import {parseJson} from '#core/types/object/json';

import * as Preact from '#preact';
import {useCallback, useState} from '#preact';
import {forwardRef} from '#preact/compat';
import {useValueRef} from '#preact/component';
import {IframeEmbed} from '#preact/component/iframe';

import {getData} from '#utils/event-helper';

const NO_HEIGHT_STYLE = {};
const MATCHES_MESSAGING_ORIGIN = (origin) =>
  origin === 'https://www.instagram.com';

/**
 * @param {!BentoInstagramDef.Props} props
 * @param {{current: ?BentoInstagramDef.Api}} ref
 * @return {PreactDef.Renderable}
 */
function BentoInstagramWithRef(
  {captioned, onLoad, requestResize, shortcode, title = 'Instagram', ...rest},
  ref
) {
  const [heightStyle, setHeightStyle] = useState(NO_HEIGHT_STYLE);
  const [opacity, setOpacity] = useState(0);
  const onLoadRef = useValueRef(onLoad);

  const messageHandler = useCallback(
    (event) => {
      const data = parseJson(getData(event));
      if (data['type'] == 'MEASURE' && data['details']) {
        const height = data['details']['height'];
        if (requestResize) {
          requestResize(height);
        }
        setHeightStyle({'height': height});
        setOpacity(1);

        onLoadRef.current?.();
      }
    },
    [requestResize, onLoadRef]
  );

  return (
    <IframeEmbed
      iframeStyle={{opacity}}
      matchesMessagingOrigin={MATCHES_MESSAGING_ORIGIN}
      messageHandler={messageHandler}
      ref={ref}
      src={
        'https://www.instagram.com/p/' +
        encodeURIComponent(shortcode) +
        '/embed/' +
        (captioned ? 'captioned/' : '') +
        '?cr=1&v=12'
      }
      title={title}
      wrapperStyle={heightStyle}
      {...rest}
    />
  );
}

const BentoInstagram = forwardRef(BentoInstagramWithRef);
BentoInstagram.displayName = 'Instagram'; // Make findable for tests.
export {BentoInstagram};
