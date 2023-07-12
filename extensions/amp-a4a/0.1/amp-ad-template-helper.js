import {LruCache} from '#core/data-structures/lru-cache';
import {createElementWithAttributes} from '#core/dom';
import {isArray} from '#core/types';

import {Services} from '#service';

import {devAssert} from '#utils/log';

import * as urls from '../../../src/config/urls';
import {getMode} from '../../../src/mode';
import {
  getServiceForDoc,
  registerServiceBuilderForDoc,
} from '../../../src/service-helpers';
import {parseUrlDeprecated} from '../../../src/url';

/** @private {!{[key: string]: string|boolean}} */
const TEMPLATE_CORS_CONFIG = {
  mode: 'cors',
  method: 'GET',
  // This should be cached across publisher domains, so don't append
  // __amp_source_origin to the URL.
  ampCors: false,
  credentials: 'omit',
};

const SERVICE_ID = 'AmpAdTemplateHelper';

export class AmpAdTemplateHelper {
  /**
   * @param {!../../../src/service/ampdoc-impl.AmpDoc} ampdoc
   */
  constructor(ampdoc) {
    /** @private @const */
    this.parentAmpdoc_ = ampdoc;

    /** @private {LruCache} */
    this.cache_ = new LruCache(5);
  }

  /**
   * Fetch and parse template from AMP cache.  Result is stored in global in
   * order to reduce overhead when template is used multiple times.
   * @param {string} templateUrl Canonical URL to template.
   * @return {!Promise<string>}
   */
  fetch(templateUrl) {
    const {win} = this.parentAmpdoc_;
    const proxyUrl =
      getMode(win).localDev && !isNaN(templateUrl)
        ? `http://ads.localhost:${win.location.port}` +
          `/a4a_template/adzerk/${templateUrl}`
        : this.getTemplateProxyUrl_(templateUrl);
    let templatePromise = this.cache_.get(proxyUrl);
    if (!templatePromise) {
      templatePromise = Services.xhrFor(win)
        .fetchText(proxyUrl, TEMPLATE_CORS_CONFIG)
        .then((response) => response.text());
      this.cache_.put(proxyUrl, templatePromise);
    }
    devAssert(templatePromise);
    return /** @type {!Promise<string>} */ (templatePromise);
  }

  /**
   * @param {!JsonObject} templateValues The values to macro in.
   * @param {!Element} element Parent element containing template.
   * @return {!Promise<!Element>} Promise which resolves after rendering completes.
   */
  render(templateValues, element) {
    return Services.templatesForDoc(element).findAndRenderTemplate(
      element,
      templateValues
    );
  }

  /**
   * @param {!Element} element
   * @param {!Array|!JsonObject} analyticsValue
   */
  insertAnalytics(element, analyticsValue) {
    analyticsValue = /**@type {!Array}*/ (
      isArray(analyticsValue) ? analyticsValue : [analyticsValue]
    );
    for (let i = 0; i < analyticsValue.length; i++) {
      const config = analyticsValue[i];
      const analyticsEle = element.ownerDocument.createElement('amp-analytics');
      if (config['remote']) {
        analyticsEle.setAttribute('config', config['remote']);
      }
      if (config['type']) {
        analyticsEle.setAttribute('type', config['type']);
      }
      if (config['inline']) {
        const scriptElem = createElementWithAttributes(
          element.ownerDocument,
          'script',
          {
            'type': 'application/json',
          }
        );
        scriptElem.textContent = JSON.stringify(config['inline']);
        analyticsEle.appendChild(scriptElem);
      }
      element.appendChild(analyticsEle);
    }
  }

  /**
   * Converts the canonical template URL to the CDN proxy URL.
   * @param {string} url
   * @return {string}
   */
  getTemplateProxyUrl_(url) {
    const cdnUrlSuffix = urls.cdn.slice(8);
    const loc = parseUrlDeprecated(url);
    return loc.origin.indexOf(cdnUrlSuffix) > 0
      ? url
      : 'https://' +
          loc.hostname.replace(/-/g, '--').replace(/\./g, '-') +
          '.' +
          cdnUrlSuffix +
          '/ad/s/' +
          loc.hostname +
          loc.pathname;
  }
}

/**
 * @param {!Element|!../../../src/service/ampdoc-impl.AmpDoc} target
 * @return {!AmpAdTemplateHelper}
 */
export function getAmpAdTemplateHelper(target) {
  registerServiceBuilderForDoc(target, SERVICE_ID, AmpAdTemplateHelper);
  return /** @type {!AmpAdTemplateHelper} */ (
    getServiceForDoc(target, SERVICE_ID)
  );
}
