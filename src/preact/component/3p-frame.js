import {getOptionalSandboxFlags, getRequiredSandboxFlags} from '#core/3p-frame';
import {sequentialIdGenerator} from '#core/data-structures/id-generator';
import {includes} from '#core/types/string';

import * as Preact from '#preact';
import {
  useEffect,
  useImperativeHandle,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from '#preact';
import {forwardRef} from '#preact/compat';

import {IframeEmbed} from './iframe';

import {
  generateSentinel,
  getBootstrapUrl,
  getDefaultBootstrapBaseUrl,
} from '../../3p-frame';
import {parseUrlDeprecated} from '../../url';

/** @type {{[key: string]: function():void}} 3p frames for that type. */
export const countGenerators = {};

// Block synchronous XHR in ad. These are very rare, but super bad for UX
// as they block the UI thread for the arbitrary amount of time until the
// request completes.
const BLOCK_SYNC_XHR = "sync-xhr 'none'";

// TODO(wg-bento): UA check for required flags without iframe element
const DEFAULT_SANDBOX =
  getRequiredSandboxFlags().join(' ') +
  ' ' +
  getOptionalSandboxFlags().join(' ');

/**
 * Creates the iframe for the embed. Applies correct size and passes the embed
 * attributes to the frame via JSON inside the fragment.
 * @param {import('./types').IframeEmbedProps} props
 * @param {import('preact').RefObject<import('./types').IframeEmbedApi>} ref
 * @return {import('preact').VNode}
 */
function ProxyIframeEmbedWithRef(
  {
    allow = BLOCK_SYNC_XHR,
    excludeSandbox,
    name: nameProp,
    messageHandler,
    options,
    sandbox = DEFAULT_SANDBOX,
    src: srcProp,
    type,
    title = type,
    ...rest
  },
  ref
) {
  if (!includes(allow, BLOCK_SYNC_XHR)) {
    throw new Error(
      `'allow' prop must contain "${BLOCK_SYNC_XHR}". Found "${allow}".`
    );
  }

  /** @type {import('preact/hooks').MutableRef<any>} */
  const contentRef = useRef(null);
  // TODO: this should be IFrameEmbedApi, but it causes some minor type issues.
  /** @type {import('preact/hooks').MutableRef<any>} */
  const iframeRef = useRef(null);
  const count = useMemo(() => {
    if (!countGenerators[type]) {
      countGenerators[type] = sequentialIdGenerator();
    }
    return countGenerators[type]();
  }, [type]);

  const [nameAndSrc, setNameAndSrc] = useState({name: nameProp, src: srcProp});
  const {name, src} = nameAndSrc;
  /** @type {import('preact/hooks').MutableRef<string?>} */
  const sentinelRef = useRef(null);

  useLayoutEffect(() => {
    const win = contentRef.current?.ownerDocument?.defaultView;
    const src =
      srcProp ?? (win ? getDefaultBootstrapBaseUrl(win) : 'about:blank');
    if (nameProp) {
      setNameAndSrc({name: nameProp, src});
      return;
    }
    if (!win) {
      return;
    }
    if (!sentinelRef.current) {
      sentinelRef.current = generateSentinel(win);
    }
    const context = Object.assign({
      'location': {
        'href': win.location.href,
      },
      'sentinel': sentinelRef.current,
    });
    const attrs = {
      'title': title,
      'type': type,
      '_context': context,
      ...options,
    };
    setNameAndSrc({
      name: JSON.stringify({
        'host': parseUrlDeprecated(src).hostname,
        'bootstrap': getBootstrapUrl(type),
        'type': type,
        // "name" must be unique across iframes, so we add a count.
        // See: https://github.com/ampproject/amphtml/pull/2955
        'count': count,
        'attributes': attrs,
      }),
      src,
    });
  }, [count, nameProp, options, srcProp, title, type]);

  useEffect(() => {
    const iframe = iframeRef.current?.node;
    if (!iframe) {
      return;
    }
    const parent = iframe.parentNode;
    parent.insertBefore(iframe, iframe.nextSibling);
  }, [name]);

  // Component API: IframeEmbedDef.Api.
  useImperativeHandle(
    ref,
    () => ({
      // Standard Bento
      get readyState() {
        return iframeRef.current?.readyState;
      },
      get node() {
        return iframeRef.current?.node;
      },
    }),
    []
  );

  return (
    <IframeEmbed
      {...rest}
      allow={allow}
      contentRef={contentRef}
      messageHandler={messageHandler}
      name={name}
      ref={iframeRef}
      ready={!!name}
      sandbox={excludeSandbox ? undefined : sandbox}
      src={src}
      title={title}
    />
  );
}

const ProxyIframeEmbed = forwardRef(ProxyIframeEmbedWithRef);
ProxyIframeEmbed.displayName = 'ProxyIframeEmbed'; // Make findable for tests.
export {ProxyIframeEmbed};
