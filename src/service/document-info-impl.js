import {isArray} from '#core/types';
import {map} from '#core/types/object';
import {parseQueryString} from '#core/types/string/url';

import {getRandomString64} from './cid-impl';

import {registerServiceBuilderForDoc} from '../service-helpers';
import {getProxyServingType, getSourceUrl, parseUrlDeprecated} from '../url';

/** @private @const {!Array<string>} */
const filteredLinkRels = ['prefetch', 'preload', 'preconnect', 'dns-prefetch'];

/**
 * Properties:
 *     - sourceUrl: the source url of an amp document.
 *     - canonicalUrl: The doc's canonical.
 *     - pageViewId: Id for this page view. Low entropy but should be unique
 *     - pageViewId64: Id for this page view. High entropy but should be unique
 *       for concurrent page views of a user().
 *     - linkRels: A map object of link tag's rel (key) and corresponding
 *       hrefs (value). rel could be 'canonical', 'icon', etc.
 *     - viewport: The global doc's viewport.
 *     - replaceParams: A map object of extra query string parameter names (key)
 *       to corresponding values, used for custom analytics.
 *       Null if not applicable.
 *
 * @typedef {{
 *   sourceUrl: string,
 *   canonicalUrl: string,
 *   pageViewId: string,
 *   pageViewId64: !Promise<string>,
 *   linkRels: !{[key: string]: string|!Array<string>},
 *   viewport: ?string,
 *   replaceParams: ?{[key: string]: string|!Array<string>}
 * }}
 */
export let DocumentInfoDef;

/**
 * @param {!Node|!./ampdoc-impl.AmpDoc} nodeOrDoc
 * @return {*} TODO(#23582): Specify return type
 */
export function installDocumentInfoServiceForDoc(nodeOrDoc) {
  return registerServiceBuilderForDoc(nodeOrDoc, 'documentInfo', DocInfo);
}

export class DocInfo {
  /**
   * @param {!./ampdoc-impl.AmpDoc} ampdoc
   */
  constructor(ampdoc) {
    /** @private @const  */
    this.ampdoc_ = ampdoc;
    /** @private {?DocumentInfoDef} */
    this.info_ = null;
    /** @private {?Promise<string>} */
    this.pageViewId64_ = null;
  }

  /** @return {!DocumentInfoDef} */
  get() {
    if (this.info_) {
      return this.info_;
    }
    const ampdoc = this.ampdoc_;
    const url = ampdoc.getUrl();
    const sourceUrl = getSourceUrl(url);
    const rootNode = ampdoc.getRootNode();
    let canonicalUrl = rootNode && rootNode.AMP && rootNode.AMP.canonicalUrl;
    if (!canonicalUrl) {
      const canonicalTag = rootNode.querySelector('link[rel=canonical]');
      canonicalUrl = canonicalTag
        ? parseUrlDeprecated(canonicalTag.href).href
        : sourceUrl;
    }
    const pageViewId = getPageViewId(ampdoc.win);
    const linkRels = getLinkRels(ampdoc.win.document);
    const viewport = getViewport(ampdoc.win.document);
    const replaceParams = getReplaceParams(ampdoc);

    return (this.info_ = {
      /** @return {string} */
      get sourceUrl() {
        return getSourceUrl(ampdoc.getUrl());
      },
      canonicalUrl,
      pageViewId,
      get pageViewId64() {
        // Must be calculated async since getRandomString64() can load the
        // amp-crypto-polyfill on some browsers, and extensions service
        // may not be registered yet.
        if (!this.pageViewId64_) {
          this.pageViewId64_ = getRandomString64(ampdoc.win);
        }
        return this.pageViewId64_;
      },
      linkRels,
      viewport,
      replaceParams,
    });
  }
}

/**
 * Returns a relatively low entropy random string.
 * This should be called once per window and then cached for subsequent
 * access to the same value to be persistent per page.
 * @param {!Window} win
 * @return {string}
 */
function getPageViewId(win) {
  return String(Math.floor(win.Math.random() * 10000));
}

/**
 * Returns a map object of link tag relations in document head.
 * Key is the link rel, value is a list of corresponding hrefs.
 * @param {!Document} doc
 * @return {!JsonObject<string, string|!Array<string>>}
 */
function getLinkRels(doc) {
  const linkRels = map();
  if (doc.head) {
    const links = doc.head.querySelectorAll('link[rel]');
    for (let i = 0; i < links.length; i++) {
      const link = links[i];
      const {href} = link;
      const rels = link.getAttribute('rel');
      if (!rels || !href) {
        continue;
      }

      rels.split(/\s+/).forEach((rel) => {
        if (filteredLinkRels.indexOf(rel) != -1) {
          return;
        }

        let value = linkRels[rel];
        if (value) {
          // Change to array if more than one href for the same rel
          if (!isArray(value)) {
            value = linkRels[rel] = [value];
          }
          value.push(href);
        } else {
          linkRels[rel] = href;
        }
      });
    }
  }
  return linkRels;
}

/**
 * Returns the viewport of the document. Note that this is the viewport of the
 * host document for AmpDocShadow instances.
 * @param {!Document} doc
 * @return {?string}
 */
function getViewport(doc) {
  const viewportEl = doc.head.querySelector('meta[name="viewport"]');
  return viewportEl ? viewportEl.getAttribute('content') : null;
}

/**
 * Attempts to retrieve extra parameters from the "amp_r" query param,
 * returning null if invalid.
 * @param {!./ampdoc-impl.AmpDoc} ampdoc
 * @return {?JsonObject<string, string|!Array<string>>}
 */
function getReplaceParams(ampdoc) {
  // The "amp_r" parameter is only supported for ads.
  if (
    !ampdoc.isSingleDoc() ||
    getProxyServingType(ampdoc.win.location.href) != 'a'
  ) {
    return null;
  }
  const url = parseUrlDeprecated(ampdoc.win.location.href);
  const replaceRaw = parseQueryString(url.search)['amp_r'];
  if (replaceRaw === undefined) {
    // Differentiate the case between empty replace params and invalid result
    return null;
  }
  return parseQueryString(replaceRaw);
}
