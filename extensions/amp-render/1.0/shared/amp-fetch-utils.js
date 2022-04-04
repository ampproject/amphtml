import {Services} from '#service';

import {user, userAssert} from '#utils/log';

import {
  UrlReplacementPolicy_Enum,
  batchFetchJsonFor,
} from '../../../../src/batched-json';
import {getSourceOrigin, isAmpScriptUri} from '../../../../src/url';

const AMP_STATE_URI_SCHEME = 'amp-state:';
/**
 * Returns true if element's src points to amp-state.
 * @param {?string} src
 * @return {boolean}
 */
export function isAmpStateSrc(src) {
  return src && src.startsWith(AMP_STATE_URI_SCHEME);
}

export class FetchJsonUtil {
  /**
   *
   * @param {string} TAG
   * @param {Element} element
   * @param {string} initialSrc
   */
  constructor(TAG, element, initialSrc) {
    this.TAG = TAG;
    this.element = element;
    this.initialSrc = initialSrc;
  }

  /**
   * Gets the json from an "amp-state:" uri. For example, src="amp-state:json.path".
   * @param {string} src
   * @return {Promise<!JsonObject>}
   */
  getAmpStateJson(src) {
    const {TAG, element} = this;
    return Services.bindForDocOrNull(element)
      .then((bind) => {
        userAssert(bind, '"amp-state:" URLs require amp-bind to be installed.');
        const ampStatePath = src.slice(AMP_STATE_URI_SCHEME.length);
        return bind.getStateAsync(ampStatePath).catch((err) => {
          const stateKey = ampStatePath.split('.')[0];
          user().error(
            TAG,
            `'amp-state' element with id '${stateKey}' was not found.`
          );
          throw err;
        });
      })
      .then((json) => {
        userAssert(
          json !== undefined,
          `[${TAG}] No data was found at provided uri: ${src}`
        );
        return json;
      });
  }

  /**
   * Returns a function to fetch json from remote url, amp-state or
   * amp-script.
   *
   * @return {Function}
   */
  getFetchJsonCallback() {
    const {element} = this;
    const src = element.getAttribute('src');
    if (!src) {
      return () => Promise.resolve(null);
    }
    if (isAmpStateSrc(src)) {
      return (src) => this.getAmpStateJson(src);
    }
    if (isAmpScriptUri(src)) {
      return (src) =>
        Services.scriptForDocOrNull(element).then((ampScriptService) => {
          userAssert(ampScriptService, 'AMP-SCRIPT is not installed');
          return ampScriptService.fetch(src);
        });
    }
    return (src, shouldRefresh = false) => {
      return batchFetchJsonFor(
        element.getAmpDoc(),
        element,
        this.buildOptionsObject_(src, shouldRefresh)
      );
    };
  }

  /**
   * @return {!UrlReplacementPolicy_Enum}
   * @private
   */
  getPolicy_() {
    const {element, initialSrc} = this;
    const src = element.getAttribute('src');
    // Require opt-in for URL variable replacements on CORS fetches triggered
    // by [src] mutation. @see spec/amp-var-substitutions.md
    // TODO(dmanek): Update spec/amp-var-substitutions.md with this information
    // and add a `Substitution` sections in this component's markdown file.
    let policy = UrlReplacementPolicy_Enum.OPT_IN;
    if (
      src === initialSrc ||
      getSourceOrigin(src) === getSourceOrigin(element.getAmpDoc().win.location)
    ) {
      policy = UrlReplacementPolicy_Enum.ALL;
    }
    return policy;
  }

  /**
   * @param {string} url
   * @param {boolean} shouldRefresh true to force refresh of browser cache.
   * @return {!BatchFetchOptionsDef} options object to pass to `batchFetchJsonFor` method.
   * @private
   */
  buildOptionsObject_(url, shouldRefresh) {
    const {element} = this;
    return {
      xssiPrefix: element.getAttribute('xssi-prefix'),
      expr: element.getAttribute('key') ?? '.',
      refresh: shouldRefresh,
      urlReplacement: this.getPolicy_(),
      url,
    };
  }
}
