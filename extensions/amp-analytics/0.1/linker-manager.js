import {AMPDOC_SINGLETON_NAME_ENUM} from '#core/constants/enums';
import {createElementWithAttributes} from '#core/dom';
import {isObject} from '#core/types';
import {WindowInterface} from '#core/window/interface';

import {Services} from '#service';
import {Priority_Enum} from '#service/navigation';

import {user} from '#utils/log';

import {createLinker} from './linker';
import {ExpansionOptions, variableServiceForDoc} from './variables';

import {getHighestAvailableDomain} from '../../../src/cookies';
import {addMissingParamsToUrl, addParamToUrl} from '../../../src/url';

/** @const {string} */
const TAG = 'amp-analytics/linker-manager';

export class LinkerManager {
  /**
   * @param {!../../../src/service/ampdoc-impl.AmpDoc} ampdoc
   * @param {!JsonObject} config
   * @param {?string} type
   * @param {!Element} element
   */
  constructor(ampdoc, config, type, element) {
    /** @const @private {!../../../src/service/ampdoc-impl.AmpDoc} */
    this.ampdoc_ = ampdoc;

    /** @private {?JsonObject|undefined} */
    this.config_ = config['linkers'];

    /** @const @private {!JsonObject} */
    this.vars_ = config['vars'] || {};

    /** @const @private {?string} */
    this.type_ = type;

    /** @const @private {!Element} */
    this.element_ = element;

    /** @const @private {!JsonObject} */
    this.resolvedIds_ = {};

    /** @const @private {!../../../src/service/url-impl.Url} */
    this.urlService_ = Services.urlForDoc(this.element_);

    /** @const @private {!Promise<../../amp-form/0.1/form-submit-service.FormSubmitService>} */
    this.formSubmitService_ = Services.formSubmitForDoc(ampdoc);

    /** @private {?UnlistenDef} */
    this.formSubmitUnlistener_ = null;

    /** @const @private {!./variables.VariableService} */
    this.variableService_ = variableServiceForDoc(this.ampdoc_);

    /** @private {?string} */
    this.highestAvailableDomain_ = null;
  }

  /**
   * Start resolving any macros that may exist in the linker configuration
   * and register the callback with the navigation service. Since macro
   * resolution is asynchronous the callback may be looking for these values
   * before they are ready.
   * init() is asynchronouse and non blocking.
   * Return a promise for testing only.
   * @return {!Promise}
   */
  init() {
    if (!isObject(this.config_)) {
      return Promise.resolve();
    }

    this.highestAvailableDomain_ = getHighestAvailableDomain(this.ampdoc_.win);

    this.config_ = this.processConfig_(
      /** @type {!JsonObject} */ (this.config_)
    );
    // Each linker config has it's own set of macros to resolve.
    const allLinkerPromises = Object.keys(this.config_).map((name) => {
      const ids = this.config_[name]['ids'];
      // Keys for linker data.
      const keys = Object.keys(ids);
      // Expand the value of each key value pair (if necessary).
      const valuePromises = keys.map((key) => {
        const expansionOptions = new ExpansionOptions(
          this.vars_,
          /* opt_iterations */ undefined,
          /* opt_noencode */ true
        );
        return this.expandTemplateWithUrlParams_(ids[key], expansionOptions);
      });

      return Promise.all(valuePromises).then((values) => {
        // Rejoin each key with its expanded value.
        const expandedIds = {};
        values.forEach((value, i) => {
          // Omit pair if value resolves to empty.
          if (value) {
            expandedIds[keys[i]] = value;
          }
        });
        this.resolvedIds_[name] = expandedIds;
        return expandedIds;
      });
    });

    if (allLinkerPromises.length) {
      const navigation = Services.navigationForDoc(this.ampdoc_);
      navigation.registerAnchorMutator((element, event) => {
        if (!element.href || event.type !== 'click') {
          return;
        }
        element.href = this.applyLinkers_(element.href);
      }, Priority_Enum.ANALYTICS_LINKER);
      navigation.registerNavigateToMutator(
        (url) => this.applyLinkers_(url),
        Priority_Enum.ANALYTICS_LINKER
      );
    }

    this.enableFormSupport_();

    return Promise.all(allLinkerPromises);
  }

  /**
   * Remove any listeners created to manage form submission.
   */
  dispose() {
    if (this.formSubmitUnlistener_) {
      this.formSubmitUnlistener_();
    }
  }

  /**
   * @param {!JsonObject} config
   * @return {!JsonObject}
   * @private
   */
  processConfig_(config) {
    const processedConfig = {};
    const defaultConfig = {
      enabled: this.isLegacyOptIn_() && this.isSafari12OrAbove_(),
    };
    const linkerNames = Object.keys(config).filter((key) => {
      const value = config[key];
      const isLinkerConfig = isObject(value);
      if (!isLinkerConfig) {
        defaultConfig[key] = value;
      }
      return isLinkerConfig;
    });

    const location = WindowInterface.getLocation(this.ampdoc_.win);
    const isProxyOrigin = this.urlService_.isProxyOrigin(location);
    linkerNames.forEach((name) => {
      const mergedConfig = {...defaultConfig, ...config[name]};

      if (mergedConfig['enabled'] !== true) {
        user().info(
          TAG,
          'linker config for %s is not enabled and will be ignored.',
          name
        );
        return;
      }

      if (!isProxyOrigin && mergedConfig['proxyOnly'] !== false) {
        return;
      }

      if (!mergedConfig['ids']) {
        user().error(TAG, '"ids" is a required field for use of "linkers".');
        return;
      }

      processedConfig[name] = mergedConfig;
    });
    return processedConfig;
  }

  /**
   * Expands spec using provided expansion options and applies url replacement
   * if necessary.
   * @param {string} template Expression that needs to be expanded.
   * @param {!ExpansionOptions} expansionOptions Expansion options.
   * @return {!Promise<string>} expanded template.
   */
  expandTemplateWithUrlParams_(template, expansionOptions) {
    const bindings = this.variableService_.getMacros(this.element_);
    return this.variableService_
      .expandTemplate(template, expansionOptions, this.element_)
      .then((expanded) => {
        const urlReplacements = Services.urlReplacementsForDoc(this.element_);
        return urlReplacements.expandUrlAsync(expanded, bindings);
      });
  }

  /**
   * If the document has existing cid meta tag they do not need to explicitly
   * opt-in to use linker.
   * @return {boolean}
   * @private
   */
  isLegacyOptIn_() {
    if (this.type_ !== 'googleanalytics') {
      return false;
    }

    if (
      this.ampdoc_.getMetaByName('amp-google-client-id-api') !==
      'googleanalytics'
    ) {
      return false;
    }

    return this.ampdoc_.registerSingleton(AMPDOC_SINGLETON_NAME_ENUM.LINKER);
  }

  /**
   * If the browser is Safari 12 or above.
   * @return {boolean}
   * @private
   */
  isSafari12OrAbove_() {
    const platform = Services.platformFor(this.ampdoc_.win);
    return platform.isSafari() && platform.getMajorVersion() >= 12;
  }

  /**
   * Apply linkers to the given url. Linker params are appended if there
   * are matching linker configs.
   *
   * @param {string} url
   * @return {string}
   * @private
   */
  applyLinkers_(url) {
    const linkerConfigs = this.config_;
    for (const linkerName in linkerConfigs) {
      // The linker param is created asynchronously. This callback should be
      // synchronous, so we skip if value is not there yet.
      if (this.resolvedIds_[linkerName]) {
        url = this.maybeAppendLinker_(
          url,
          linkerName,
          linkerConfigs[linkerName]
        );
      }
    }
    return url;
  }

  /**
   * Appends the linker param if the given url falls within rules defined in
   * linker configuration.
   * @param {string} url
   * @param {string} name
   * @param {!Object} config
   * @return {string}
   * @private
   */
  maybeAppendLinker_(url, name, config) {
    const location = this.urlService_.parse(url);
    if (
      this.isDomainMatch_(location, name, config) &&
      this.isProtocolMatch_(location)
    ) {
      const linkerValue = createLinker(
        /* version */ '1',
        this.resolvedIds_[name]
      );
      if (linkerValue) {
        const params = {};
        params[name] = linkerValue;
        return addMissingParamsToUrl(url, params);
      }
    }
    return url;
  }

  /**
   * Check to see if the url is a match for the given set of domains.
   * @param {Location} location
   * @param {string} name Name given in linker config.
   * @param {!Object} config
   * @return {boolean}
   */
  isDomainMatch_(location, name, config) {
    const /** @type {Array} */ domains = config['destinationDomains'];
    const {hostname} = location;
    // Don't append linker for exact domain match, relative urls, or
    // fragments.
    const winHostname = WindowInterface.getHostname(this.ampdoc_.win);
    const sameDomain = config['sameDomainEnabled'];
    if (!Boolean(sameDomain) && winHostname === hostname) {
      return false;
    }

    // If given domains, but not in the right format.
    if (domains && !Array.isArray(domains)) {
      user().warn(TAG, '%s destinationDomains must be an array.', name);
      return false;
    }

    // If destinationDomain is specified specifically, respect it.
    if (domains) {
      return this.destinationDomainsMatch_(domains, hostname);
    }

    // Fallback to default behavior
    const {canonicalUrl, sourceUrl} = Services.documentInfoForDoc(this.ampdoc_);
    const canonicalOrigin = this.urlService_.parse(canonicalUrl).hostname;
    const isFriendlyCanonicalOrigin = areFriendlyDomains(
      canonicalOrigin,
      hostname
    );
    // Default to all subdomains matching (if there's one) plus canonicalOrigin

    if (this.highestAvailableDomain_) {
      const destinationDomain = [
        this.highestAvailableDomain_,
        '*' + this.highestAvailableDomain_,
      ];
      return (
        this.destinationDomainsMatch_(destinationDomain, hostname) ||
        isFriendlyCanonicalOrigin
      );
    }

    // In the case where highestAvailableDomain cannot be found.
    // (proxyOrigin, no <meta name='amp-cookie-scope'> found)
    // default to friendly domain matching.
    const sourceOrigin = this.urlService_.parse(sourceUrl).hostname;
    return (
      areFriendlyDomains(sourceOrigin, hostname) || isFriendlyCanonicalOrigin
    );
  }

  /**
   * Only matching protocols should use Linker parameters.
   * @param {Location} location
   * @return {boolean}
   */
  isProtocolMatch_(location) {
    return location.protocol === 'https:' || location.protocol === 'http:';
  }

  /**
   * Helper method to find out if hostname match the destinationDomain array.
   * @param {Array<string>} domains
   * @param {string} hostname
   * @return {boolean}
   */
  destinationDomainsMatch_(domains, hostname) {
    for (let i = 0; i < domains.length; i++) {
      const domain = domains[i];
      // Exact match.
      if (domain === hostname) {
        return true;
      }
      // Allow wildcard subdomain matching.
      if (domain.indexOf('*') !== -1 && isWildCardMatch(hostname, domain)) {
        return true;
      }
    }
    return false;
  }

  /**
   * Register callback that will handle form sumbits.
   */
  enableFormSupport_() {
    if (this.formSubmitUnlistener_) {
      return;
    }

    this.formSubmitService_.then((formService) => {
      this.formSubmitUnlistener_ = formService.beforeSubmit(
        this.handleFormSubmit_.bind(this)
      );
    });
  }

  /**
   * Check to see if any linker configs match this form's url, if so, send
   * along the resolved linker value
   * @param {!../../amp-form/0.1/form-submit-service.FormSubmitEventDef} event
   */
  handleFormSubmit_(event) {
    const {actionXhrMutator, form} = event;

    for (const linkerName in this.config_) {
      const config = this.config_[linkerName];

      const url =
        form.getAttribute('action-xhr') || form.getAttribute('action');
      const location = this.urlService_.parse(url);
      if (this.isDomainMatch_(location, linkerName, config)) {
        this.addDataToForm_(form, actionXhrMutator, linkerName);
      }
    }
  }

  /**
   * Add the linker data to form. If action-xhr is present we can update the
   * action-xhr, if not we fallback to adding hidden inputs.
   * @param {!Element} form
   * @param {function(string)} actionXhrMutator
   * @param {string} linkerName
   * @return {*} TODO(#23582): Specify return type
   */
  addDataToForm_(form, actionXhrMutator, linkerName) {
    const ids = this.resolvedIds_[linkerName];
    if (!ids) {
      // Form was clicked before macros resolved.
      return;
    }

    const linkerValue = createLinker(/* version */ '1', ids);

    // Runtime controls submits with `action-xhr`, so we can append the linker
    // param
    const actionXhrUrl = form.getAttribute('action-xhr');
    if (actionXhrUrl) {
      const decoratedUrl = addParamToUrl(actionXhrUrl, linkerName, linkerValue);
      return actionXhrMutator(decoratedUrl);
    }

    // If we are not using `action-xhr` it must be a GET request using the
    // standard action attribute. Browsers will not let you change this in the
    // middle of a submit, so we add the input hidden attributes.
    this.addHiddenInputs_(form, linkerName, linkerValue);
  }

  /**
   * Add the linker pairs as <input> elements to form.
   * @param {!Element} form
   * @param {string} linkerName
   * @param {string} linkerValue
   */
  addHiddenInputs_(form, linkerName, linkerValue) {
    const attrs = {
      'type': 'hidden',
      'name': linkerName,
      'value': linkerValue,
    };

    const inputEl = createElementWithAttributes(
      /** @type {!Document} */ (form.ownerDocument),
      'input',
      attrs
    );
    form.appendChild(inputEl);
  }
}

/**
 * Domains are considered to be friends if they are identical
 * after removing these prefixes: m. www. amp.
 * URL scheme & port are not taken into consideration.
 *
 * Note that this algorithm will break corner cases like
 *   www.com vs amp.com vs m.com
 * Or
 *   amp.wordpress.com vs www.wordpress.com
 *
 * @param {string} domain1
 * @param {string} domain2
 * @return {boolean}
 * @visibleForTesting
 */
export function areFriendlyDomains(domain1, domain2) {
  return getBaseDomain(domain1) === getBaseDomain(domain2);
}

/**
 * Strips out all prefixing m. www. amp. from a domain name.
 * @param {string} domain
 * @return {string}
 */
function getBaseDomain(domain) {
  return domain.replace(/^(?:www\.|m\.|amp\.)+/, '');
}

/**
 * Escape any regex flags other than `*`
 * @param {string} str
 * @return {*} TODO(#23582): Specify return type
 */
function regexEscape(str) {
  return str.replace(/[-\/\\^$+?.()|[\]{}]/g, '\\$&');
}

/**
 * Allows specified wildcard matching of domains.
 * Example:
 *    `*.foo.com` matches `amp.foo.com`
 *    `*.foo.com*` matches `amp.foo.com.uk`
 * @param {string} hostname
 * @param {string} domain
 * @return {boolean}
 * @visibleForTesting
 */
export function isWildCardMatch(hostname, domain) {
  const escaped = regexEscape(domain);
  const regex = escaped.replace(/\*/g, '.*');
  return new RegExp('^' + regex + '$').test(hostname);
}
