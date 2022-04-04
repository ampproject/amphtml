import {getDataParamsFromAttributes} from '#core/dom';

import {Services} from '#service';

import {getConfigOpts} from './config-options';
import {getScopeElements, isElementInScope} from './scope';

const WL_ANCHOR_ATTR = ['href', 'id', 'rel', 'rev'];
const PREFIX_DATA_ATTR = /^vars(.+)/;
const REG_DOMAIN_URL = /^(?:https?:)?(?:\/\/)?([^\/?]+)/i;
const PAGE_PROP_ALLOWLIST = {
  'SOURCE_URL': true,
  'DOCUMENT_REFERRER': true,
  'AMP_GEO': true,
};

export class LinkRewriter {
  /**
   * @param {string} referrer
   * @param {!AmpElement} ampElement
   * @param {!../../../src/service/ampdoc-impl.AmpDoc} ampDoc
   */
  constructor(referrer, ampElement, ampDoc) {
    /** @private {!../../../src/service/ampdoc-impl.AmpDoc} */
    this.ampDoc_ = ampDoc;

    /** @private {?Object} */
    this.configOpts_ = getConfigOpts(ampElement);

    /** @private {Array<!Element>} */
    this.listElements_ = getScopeElements(this.ampDoc_, this.configOpts_);

    /** @private {string} */
    this.referrer_ = referrer;

    /** @private {string} */
    this.rewrittenUrl_ = '';

    /** @private {!../../../src/service/url-replacements-impl.UrlReplacements} */
    this.urlReplacementService_ = Services.urlReplacementsForDoc(ampElement);
  }

  /**
   * @param {!Element} anchor
   */
  handleClick(anchor) {
    if (!anchor) {
      return;
    }

    this.rewrittenUrl_ = this.configOpts_.output;

    if (this.isRewritten_(anchor)) {
      return;
    }
    if (!this.isNotFiltered_(anchor)) {
      return;
    }
    const sourceTrimmedDomain = Services.documentInfoForDoc(
      this.ampDoc_
    ).sourceUrl.match(REG_DOMAIN_URL)[1];

    const canonicalTrimmedDomain = Services.documentInfoForDoc(
      this.ampDoc_
    ).canonicalUrl.match(REG_DOMAIN_URL)[1];

    if (
      this.isInternalLink_(anchor, [
        sourceTrimmedDomain,
        canonicalTrimmedDomain,
      ])
    ) {
      return;
    }

    this.setRedirectUrl_(anchor);
  }

  /**
   * Check if the anchor element was already shifted
   * @param {!Element} anchor
   * @return {boolean}
   * @private
   */
  isRewritten_(anchor) {
    return (
      anchor.href.match(REG_DOMAIN_URL)[1] ===
      this.rewrittenUrl_.match(REG_DOMAIN_URL)[1]
    );
  }

  /**
   * Check if anchor is not filtered by attribute or section scope
   *
   * @param {!Element} anchor
   * @return {boolean}
   * @private
   */
  isNotFiltered_(anchor) {
    if (!this.configOpts_.scopeDocument) {
      return isElementInScope(anchor, this.configOpts_);
    }

    return this.isListed_(anchor);
  }

  /**
   * @param {!Element} anchor
   * @return {boolean}
   */
  isListed_(anchor) {
    if (this.listElements_ === null || this.listElements_.length === 0) {
      return true;
    }

    const filtered = this.listElements_.filter((element) => {
      return element === anchor;
    });

    if (filtered.length > 0) {
      return true;
    }

    return false;
  }

  /**
   * Check if the anchor element leads to an internal link
   * @param {?Element} htmlElement
   * @param {?Array<string>=} trimmedDomains
   * @return {boolean}
   */
  isInternalLink_(htmlElement, trimmedDomains) {
    const {href} = htmlElement;

    return trimmedDomains.some((domain) => {
      const domainHrefMatch = href.match(REG_DOMAIN_URL);
      if (!domainHrefMatch) {
        return true;
      }
      return REG_DOMAIN_URL.test(href) && domainHrefMatch[1] === domain;
    });
  }

  /**
   * @param {!Element} htmlElement
   */
  setRedirectUrl_(htmlElement) {
    this.rewrittenUrl_ = this.replacePageProp_();

    const {vars} = this.configOpts_;

    if (vars instanceof Object) {
      htmlElement.href = this.replaceVars_(htmlElement, vars);
    }
  }

  /**
   * @return {string}
   */
  replacePageProp_() {
    return this.urlReplacementService_.expandUrlSync(
      this.rewrittenUrl_,
      /** expandUrlSync doesn't fill DOCUMENT_REFERRER so we pass it*/
      {DOCUMENT_REFERRER: this.referrer_},
      PAGE_PROP_ALLOWLIST
    );
  }

  /**
   * @param {!Element} htmlElement
   * @param {!Object} vars
   * @return {string}
   */
  replaceVars_(htmlElement, vars) {
    /**
     * Merge vars with attributes of the anchor element
     */
    WL_ANCHOR_ATTR.forEach((val) => {
      if (htmlElement.getAttribute(val)) {
        vars[val] = htmlElement.getAttribute(val);
      }
    });

    /**
     * Merge with vars object properties and values set on the element
     * 'data attributes' in case these have the save name that the
     * 'vars config property', 'data attributes' values will
     * overwrite 'vars config values'
     */
    const dataset = getDataParamsFromAttributes(
      htmlElement,
      /* computeParamNameFunc */ undefined,
      PREFIX_DATA_ATTR
    );

    Object.assign(vars, dataset);

    /** add a random value to be use in the output pattern */
    vars['random'] = Math.random().toString(32).substr(2);

    /**
     * Replace placeholders for properties of the document, anchor attributes
     * and 'vars config property' all of them merged in vars
     */
    Object.keys(vars).forEach((key) => {
      if (vars[key]) {
        this.rewrittenUrl_ = this.rewrittenUrl_.replace(
          '${' + key + '}',
          encodeURIComponent(vars[key])
        );
      }
    });

    /**
     * Finally to clean up we leave empty all placeholders that
     * were not replace in previous steps
     */
    this.rewrittenUrl_ = this.rewrittenUrl_.replace(/\${[A-Za-z0-9]+}+/, () => {
      return '';
    });
    return this.rewrittenUrl_;
  }
}
