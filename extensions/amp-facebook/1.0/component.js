import * as Preact from '#preact';
import {ProxyIframeEmbed} from '#preact/component/3p-frame';
import {dashToUnderline} from '#core/types/string';
import {MessageType, deserializeMessage} from '#core/3p-frame-messaging';
import {forwardRef} from '#preact/compat';
import {tryParseJson} from '#core/types/object/json';
import {useCallback, useLayoutEffect, useMemo, useState} from '#preact';

/** @const {string} */
const TYPE = 'facebook';
const FULL_HEIGHT = '100%';
const MATCHES_MESSAGING_ORIGIN = () => true;
const DEFAULT_TITLE = 'Facebook comments';

/**
 * @param {!FacebookDef.Props} props
 * @param {{current: ?FacebookDef.Api}} ref
 * @return {PreactDef.Renderable}
 */
function FacebookWithRef(
  {
    action,
    colorscheme,
    embedAs,
    hideCover,
    hideCta,
    href,
    includeCommentParent,
    kdSite,
    layout,
    locale: localeProp,
    numPosts,
    onReady,
    orderBy,
    refLabel,
    requestResize,
    share,
    showFacepile,
    showText,
    size,
    smallHeader,
    style,
    tabs,
    title = DEFAULT_TITLE,
    ...rest
  },
  ref
) {
  const [height, setHeight] = useState(null);
  const messageHandler = useCallback(
    (event) => {
      const data = tryParseJson(event.data) ?? deserializeMessage(event.data);
      if (data['action'] == 'ready') {
        onReady?.();
      }
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
    [requestResize, onReady]
  );

  const [locale, setLocale] = useState(localeProp);
  useLayoutEffect(() => {
    if (localeProp) {
      setLocale(localeProp);
      return;
    }
    const win = ref?.current?.ownerDocument?.defaultView;
    if (!win) {
      return;
    }
    setLocale(dashToUnderline(win.navigator.language));
  }, [localeProp, ref]);

  const options = useMemo(
    () => ({
      action,
      colorscheme,
      embedAs,
      hideCover,
      hideCta,
      href,
      includeCommentParent,
      'kd_site': kdSite,
      layout,
      locale,
      numPosts,
      orderBy,
      ref: refLabel,
      share,
      showFacepile,
      showText,
      size,
      smallHeader,
      tabs,
    }),
    [
      action,
      colorscheme,
      embedAs,
      hideCover,
      hideCta,
      href,
      includeCommentParent,
      kdSite,
      layout,
      locale,
      numPosts,
      orderBy,
      refLabel,
      share,
      showFacepile,
      showText,
      size,
      smallHeader,
      tabs,
    ]
  );

  return (
    <ProxyIframeEmbed
      options={options}
      ref={ref}
      title={title}
      {...rest}
      /* non-overridable props */
      // We sandbox all 3P iframes however facebook embeds completely break in
      // sandbox mode since they need access to document.domain, so we
      // exclude facebook.
      excludeSandbox
      matchesMessagingOrigin={MATCHES_MESSAGING_ORIGIN}
      messageHandler={messageHandler}
      type={TYPE}
      style={height ? {...style, height} : style}
    />
  );
}

const Facebook = forwardRef(FacebookWithRef);
Facebook.displayName = 'Facebook'; // Make findable for tests.
export {Facebook};
