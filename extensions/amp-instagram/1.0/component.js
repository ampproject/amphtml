

import {dict} from '#core/types/object';
import {parseJson} from '#core/types/object/json';

import * as Preact from '#preact';
import {useCallback, useState} from '#preact';
import {forwardRef} from '#preact/compat';
import {IframeEmbed} from '#preact/component/iframe';

import {getData} from '../../../src/event-helper';

const NO_HEIGHT_STYLE = dict();
const MATCHES_MESSAGING_ORIGIN = (origin) =>
  origin === 'https://www.instagram.com';

/**
 * @param {!InstagramDef.Props} props
 * @param {{current: ?InstagramDef.Api}} ref
 * @return {PreactDef.Renderable}
 */
function InstagramWithRef(
  {captioned, requestResize, shortcode, title = 'Instagram', ...rest},
  ref
) {
  const [heightStyle, setHeightStyle] = useState(NO_HEIGHT_STYLE);
  const [opacity, setOpacity] = useState(0);

  const messageHandler = useCallback(
    (event) => {
      const data = parseJson(getData(event));
      if (data['type'] == 'MEASURE' && data['details']) {
        const height = data['details']['height'];
        if (requestResize) {
          requestResize(height);
        }
        setHeightStyle(dict({'height': height}));
        setOpacity(1);
      }
    },
    [requestResize]
  );

  return (
    <IframeEmbed
      allowTransparency
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

const Instagram = forwardRef(InstagramWithRef);
Instagram.displayName = 'Instagram'; // Make findable for tests.
export {Instagram};
