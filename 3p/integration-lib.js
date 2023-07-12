import * as mode from '#core/mode';
import {parseJson} from '#core/types/object/json';
import {endsWith} from '#core/types/string';

import {
  initLogConstructor,
  isUserErrorMessage,
  setReportError,
  userAssert,
} from '#utils/log';

import {run, setExperimentToggles} from './3p';
import {IntegrationAmpContext} from './ampcontext-integration';
import {installEmbedStateListener, manageWin} from './environment';
import {getAmpConfig, getEmbedType, getLocation} from './frame-metadata';

import * as urls from '../src/config/urls';
import {getSourceUrl, isProxyOrigin, parseUrlDeprecated} from '../src/url';

/**
 * Whether the embed type may be used with amp-embed tag.
 * @const {!{[key: string]: boolean}}
 */
const AMP_EMBED_ALLOWED = {
  _ping_: true,
  '1wo': true,
  '24smi': true,
  adskeeper: true,
  adsloom: true,
  adstyle: true,
  bringhub: true,
  colombiafeed: true,
  dable: true,
  engageya: true,
  epeex: true,
  firstimpression: true,
  forkmedia: true,
  gecko: true,
  glomex: true,
  idealmedia: true,
  insticator: true,
  jubna: true,
  kuadio: true,
  'mantis-recommend': true,
  mediaad: true,
  mgid: true,
  miximedia: true,
  myua: true,
  mywidget: true,
  nativery: true,
  lentainform: true,
  opinary: true,
  outbrain: true,
  plista: true,
  postquare: true,
  ppstudio: true,
  pubexchange: true,
  pulse: true,
  rbinfox: true,
  rcmwidget: true,
  readmo: true,
  recreativ: true,
  runative: true,
  smartclip: true,
  smi2: true,
  speakol: true,
  strossle: true,
  svknative: true,
  taboola: true,
  temedya: true,
  trafficstars: true,
  vlyby: true,
  whopainfeed: true,
  yahoofedads: true,
  yahoonativeads: true,
  yektanet: true,
  zen: true,
  zergnet: true,
};

// For backward compat, we always allow these types without the iframe
// opting in.
const defaultAllowedTypesInCustomFrame = [
  // Entries must be reasonably safe and not allow overriding the injected
  // JS URL.
  // Each custom iframe can override this through the second argument to
  // draw3p. See amp-ad docs.
  'facebook',
  'twitter',
  'doubleclick',
  'yieldbot',
  '_ping_',
];

/**
 * Initialize 3p frame.
 * @param {!Window} win
 */
export function init(win) {
  initLogConstructor();
  const config = getAmpConfig();

  // Overriding to short-circuit src/mode#getMode()
  win.__AMP_MODE = config.mode;

  setReportError(console.error.bind(console));

  setExperimentToggles(config.experimentToggles);
}

/**
 * Visible for testing.
 * Draws a 3p embed to the window. Expects the data to include the 3p type.
 * @param {!Window} win
 * @param {!Object} data
 * @param {function(!Object, function(!Object))|undefined} configCallback
 *     Optional callback that allows user code to manipulate the incoming
 *     configuration. See
 *     https://github.com/ampproject/amphtml/issues/1210 for some context
 *     on this.
 */
export function draw3pInternal(win, data, configCallback) {
  const type = data['type'];

  userAssert(
    isTagNameAllowed(type, win.context.tagName),
    'Embed type %s not allowed with tag %s',
    type,
    win.context.tagName
  );
  if (configCallback) {
    configCallback(data, (data) => {
      userAssert(data, 'Expected configuration to be passed as first argument');
      run(type, win, data);
    });
  } else {
    run(type, win, data);
  }
}

/**
 * Draws an embed, optionally synchronously, to the DOM.
 * @param {function(!Object, function(!Object))} opt_configCallback If provided
 *     will be invoked with two arguments:
 *     1. The configuration parameters supplied to this embed.
 *     2. A callback that MUST be called for rendering to proceed. It takes
 *        no arguments. Configuration is expected to be modified in-place.
 * @param {!Array<string>=} opt_allowed3pTypes List of advertising network
 *     types you expect.
 * @param {!Array<string>=} opt_allowedEmbeddingOrigins List of domain suffixes
 *     that are allowed to embed this frame.
 */
export function draw3p(
  opt_configCallback,
  opt_allowed3pTypes,
  opt_allowedEmbeddingOrigins
) {
  try {
    const location = getLocation();

    ensureFramed(window);
    validateParentOrigin(window, location);
    validateAllowedTypes(window, getEmbedType(), opt_allowed3pTypes);
    if (opt_allowedEmbeddingOrigins) {
      validateAllowedEmbeddingOrigins(window, opt_allowedEmbeddingOrigins);
    }
    window.context = new IntegrationAmpContext(window);
    manageWin(window);
    installEmbedStateListener();

    // Ugly type annotation is due to Event.prototype.data being denylisted
    // and the compiler not being able to discern otherwise
    // TODO(alanorozco): Do this more elegantly once old impl is cleaned up.
    draw3pInternal(
      window,
      /** @type {!IntegrationAmpContext} */ (window.context).data || {},
      opt_configCallback
    );

    window.context.bootstrapLoaded();
  } catch (e) {
    if (window.context && window.context.report3pError) {
      // window.context has initiated yet
      if (e.message && isUserErrorMessage(e.message)) {
        // report user error to parent window
        window.context.report3pError(e);
      }
    }

    const c = window.context || {mode: {test: false}};
    if (!c.mode.test) {
      lightweightErrorReport(e, c.canary);
      throw e;
    }
  }
}

/**
 * Throws if the current frame's parent origin is not equal to
 * the claimed origin.
 * Only check for browsers that support ancestorOrigins
 * @param {!Window} window
 * @param {!Location} parentLocation
 * @visibleForTesting
 */
export function validateParentOrigin(window, parentLocation) {
  const ancestors = window.location.ancestorOrigins;
  // Currently only webkit and blink based browsers support
  // ancestorOrigins. In that case we proceed but mark the origin
  // as non-validated.
  if (!ancestors || !ancestors.length) {
    return;
  }
  userAssert(
    ancestors[0] == parentLocation.origin,
    'Parent origin mismatch: %s, %s',
    ancestors[0],
    parentLocation.origin
  );
}

/**
 * Check that this iframe intended this particular ad type to run.
 * @param {!Window} window
 * @param {string} type 3p type
 * @param {!Array<string>|undefined} allowedTypes May be undefined.
 * @visibleForTesting
 */
export function validateAllowedTypes(window, type, allowedTypes) {
  const thirdPartyHost = parseUrlDeprecated(urls.thirdParty).hostname;

  // Everything allowed in default iframe.
  if (window.location.hostname == thirdPartyHost) {
    return;
  }
  if (urls.thirdPartyFrameRegex.test(window.location.hostname)) {
    return;
  }
  if (window.location.hostname == 'ads.localhost') {
    return;
  }
  if (defaultAllowedTypesInCustomFrame.indexOf(type) != -1) {
    return;
  }
  userAssert(
    allowedTypes && allowedTypes.indexOf(type) != -1,
    '3p type for custom iframe not allowed: %s',
    type
  );
}

/**
 * Check that parent host name was allowed.
 * @param {!Window} window
 * @param {!Array<string>} allowedHostnames Suffixes of allowed host names.
 * @visibleForTesting
 */
export function validateAllowedEmbeddingOrigins(window, allowedHostnames) {
  if (!window.document.referrer) {
    throw new Error('Referrer expected: ' + window.location.href);
  }
  const ancestors = window.location.ancestorOrigins;
  // We prefer the unforgable ancestorOrigins, but referrer is better than
  // nothing.
  const ancestor = ancestors ? ancestors[0] : window.document.referrer;
  let {hostname} = parseUrlDeprecated(ancestor);
  if (isProxyOrigin(ancestor)) {
    // If we are on the cache domain, parse the source hostname from
    // the referrer. The referrer is used because it should be
    // trustable.
    hostname = parseUrlDeprecated(
      getSourceUrl(window.document.referrer)
    ).hostname;
  }
  for (let i = 0; i < allowedHostnames.length; i++) {
    // Either the hostname is allowed
    if (allowedHostnames[i] == hostname) {
      return;
    }
    // Or it ends in .$hostname (aka is a sub domain of an allowed domain.
    if (endsWith(hostname, '.' + allowedHostnames[i])) {
      return;
    }
  }
  throw new Error(
    'Invalid embedding hostname: ' + hostname + ' not in ' + allowedHostnames
  );
}

/**
 * Throws if this window is a top level window.
 * @param {!Window} window
 * @visibleForTesting
 */
export function ensureFramed(window) {
  if (window == window.parent) {
    throw new Error('Must be framed: ' + window.location.href);
  }
}

/**
 * Expects the fragment to contain JSON.
 * @param {string} fragment Value of location.fragment
 * @return {?JsonObject}
 * @visibleForTesting
 */
export function parseFragment(fragment) {
  try {
    let json = fragment.substr(1);
    // Some browser, notably Firefox produce an encoded version of the fragment
    // while most don't. Since we know how the string should start, this is easy
    // to detect.
    if (json.startsWith('{%22')) {
      json = decodeURIComponent(json);
    }
    return /** @type {!JsonObject} */ (json ? parseJson(json) : {});
  } catch (err) {
    return null;
  }
}

/**
 * Not all types of embeds are allowed to be used with all tag names on the
 * AMP side. This function checks whether the current usage is permissible.
 * @param {string} type
 * @param {string|undefined} tagName The tagName that was used to embed this
 *     3p-frame.
 * @return {boolean}
 */
export function isTagNameAllowed(type, tagName) {
  if (tagName == 'AMP-EMBED') {
    return !!AMP_EMBED_ALLOWED[type];
  }
  return true;
}

/**
 * Reports an error to the server. Must only be called once per page.
 * Not for use in event handlers.
 *
 * We don't use the default error in error.js handler because it has
 * too many deps for this small JS binary.
 *
 * @param {!Error} e
 * @param {boolean} isCanary
 */
function lightweightErrorReport(e, isCanary) {
  new Image().src =
    urls.errorReporting +
    '?3p=1&v=' +
    encodeURIComponent(mode.version()) +
    '&m=' +
    encodeURIComponent(e.message) +
    '&ca=' +
    (isCanary ? 1 : 0) +
    '&r=' +
    encodeURIComponent(document.referrer) +
    '&s=' +
    encodeURIComponent(e.stack || '');
}
