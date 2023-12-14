import {CONSENT_POLICY_STATE} from '#core/constants/consent-state';
import {getChildJsonConfig} from '#core/dom';
import {childElementByTag} from '#core/dom/query';
import {deepMerge, hasOwn, map} from '#core/types/object';

import {Services} from '#service';

import {devAssert, user, userAssert} from '#utils/log';

import {CMP_CONFIG} from './cmps';
import {getConsentStateManager} from './consent-state-manager';

import {GEO_IN_GROUP} from '../../amp-geo/0.1/amp-geo-in-group';

const TAG = 'amp-consent/consent-config';
const AMP_STORY_CONSENT_TAG = 'amp-story-consent';

const ALLOWED_DEPR_CONSENTINSTANCE_ATTRS = {
  'promptUI': true,
  'checkConsentHref': true,
  // `promptIfUnknownForGeoGroup` is legacy field
  'promptIfUnknownForGeoGroup': true,
  'onUpdateHref': true,
};

/** @const @type {!{[key: string]: boolean}} */
const CONSENT_VARS_ALLOWED_LIST = {
  'CANONICAL_URL': true,
  'PAGE_VIEW_ID': true,
  'PAGE_VIEW_ID_64': true,
  'SOURCE_URL': true,
};

/** @const @type {string} */
export const CID_SCOPE = 'AMP-CONSENT';

export class ConsentConfig {
  /** @param {!Element} element */
  constructor(element) {
    /** @private {!Element} */
    this.element_ = element;

    /** @private {?string} */
    this.matchedGeoGroup_ = null;

    /** @private {?Promise<!JsonObject>} */
    this.configPromise_ = null;
  }

  /**
   * Read validate and return the config
   * @return {!Promise<!JsonObject>}
   */
  getConsentConfigPromise() {
    if (!this.configPromise_) {
      this.configPromise_ = this.validateAndParseConfig_();
    }
    return this.configPromise_;
  }

  /**
   * Returns the matched geoGroup. Call after getConsentConfigPromise
   * has resolved.
   * @return {?string}
   */
  getMatchedGeoGroup() {
    return this.matchedGeoGroup_;
  }

  /**
   * Convert the inline config to new format
   * @param {!JsonObject} config
   * @return {!Object}
   */
  convertInlineConfigFormat_(config) {
    const consentsConfigDepr = config['consents'];

    if (!config['consents']) {
      // New format, return
      return config;
    }
    // Assert single consent instance
    const keys = Object.keys(consentsConfigDepr);

    userAssert(
      keys.length <= 1,
      '%s: only single consent instance is supported',
      TAG
    );

    if (keys.length > 0) {
      config['consentInstanceId'] = keys[0];
      // Copy config['consents']['key'] to config
      const consentInstanceConfigDepr = config['consents'][keys[0]];
      const attrs = Object.keys(consentInstanceConfigDepr);
      for (let i = 0; i < attrs.length; i++) {
        const attr = attrs[i];
        if (!config[attr] && ALLOWED_DEPR_CONSENTINSTANCE_ATTRS[attr]) {
          // Do not override if has been specified, or the attr is not supported
          // in consent instance before
          config[attrs[i]] = consentInstanceConfigDepr[attrs[i]];
        }
      }
    }

    delete config['consents'];
    return config;
  }

  /**
   * Read and parse consent config
   * An example valid config json looks like
   * {
   *  "consentInstanceId": "ABC",
   *  "checkConsentHref": "https://fake.com"
   * }
   * @return {!Promise<!JsonObject>}
   */
  validateAndParseConfig_() {
    const inlineConfig = this.convertInlineConfigFormat_(
      /** @type {!JsonObject} */ (
        userAssert(this.getInlineConfig_(), '%s: Inline config not found')
      )
    );

    const cmpConfig = this.getCMPConfig_();

    const config = /** @type {!JsonObject} */ (
      deepMerge(cmpConfig || {}, inlineConfig || {}, 1)
    );

    userAssert(
      config['consentInstanceId'],
      '%s: consentInstanceId to store consent info is required',
      TAG
    );

    if (config['policy']) {
      // Only respect 'default' consent policy;
      const keys = Object.keys(config['policy']);
      // TODO (@zhouyx): Validate waitFor value
      for (let i = 0; i < keys.length; i++) {
        if (keys[i] != 'default') {
          user().warn(
            TAG,
            'policy %s is currently not supported and will be ignored',
            keys[i]
          );
          delete config['policy'][keys[i]];
        }
      }
    }

    // `promptIfUnknownForGeoGroup` is legacy field
    const group = config['promptIfUnknownForGeoGroup'];
    if (typeof group === 'string') {
      config['consentRequired'] = false;
      config['geoOverride'] = {
        [group]: {
          'consentRequired': true,
        },
      };
    } else if (
      config['consentRequired'] === undefined &&
      config['checkConsentHref']
    ) {
      config['consentRequired'] = 'remote';
    }

    return this.mergeGeoOverride_(config)
      .then((mergedConfig) => this.validateMergedGeoOverride_(mergedConfig))
      .then((validatedConfig) => this.checkStoryConsent_(validatedConfig));
  }

  /**
   * Merge correct geoOverride object into toplevel config.
   * @param {!JsonObject} config
   * @return {!Promise<!JsonObject>}
   */
  mergeGeoOverride_(config) {
    if (!config['geoOverride']) {
      return Promise.resolve(config);
    }
    return Services.geoForDocOrNull(this.element_).then((geoService) => {
      userAssert(
        geoService,
        '%s: requires <amp-geo> to use `geoOverride`',
        TAG
      );
      const mergedConfig = map(config);
      const geoGroups = Object.keys(config['geoOverride']);
      // Stop at the first group that the geoService says we're in and then merge configs.
      for (let i = 0; i < geoGroups.length; i++) {
        if (geoService.isInCountryGroup(geoGroups[i]) === GEO_IN_GROUP.IN) {
          const geoConfig = config['geoOverride'][geoGroups[i]];
          if (hasOwn(geoConfig, 'consentInstanceId')) {
            user().error(
              TAG,
              'consentInstanceId cannot be overriden in geoGroup:',
              geoGroups[i]
            );
            delete geoConfig['consentInstanceId'];
          }
          deepMerge(mergedConfig, geoConfig, 1);
          this.matchedGeoGroup_ = geoGroups[i];
          break;
        }
      }
      delete mergedConfig['geoOverride'];
      return mergedConfig;
    });
  }

  /**
   * Validate merged geoOverride
   * @param {!JsonObject} mergedConfig
   * @return {!JsonObject}
   */
  validateMergedGeoOverride_(mergedConfig) {
    const consentRequired = mergedConfig['consentRequired'];
    userAssert(
      typeof consentRequired === 'boolean' || consentRequired === 'remote',
      '`consentRequired` is required',
      TAG
    );
    if (consentRequired === 'remote') {
      userAssert(
        mergedConfig['checkConsentHref'],
        '%s: `checkConsentHref` must be specified if `consentRequired` is remote',
        TAG
      );
    }
    return mergedConfig;
  }

  /**
   * Validate if story consent then no promptUiSrc
   * @param {!JsonObject} config
   * @return {!JsonObject}
   */
  checkStoryConsent_(config) {
    if (childElementByTag(this.element_, AMP_STORY_CONSENT_TAG)) {
      userAssert(
        !config['promptUISrc'],
        '%s: `promptUiSrc` cannot be specified while using %s.',
        TAG,
        AMP_STORY_CONSENT_TAG
      );
    }
    return config;
  }

  /**
   * Read the inline config from publisher
   * @return {?JsonObject}
   */
  getInlineConfig_() {
    // All consent config within the amp-consent component. There will be only
    // one single amp-consent allowed in page.
    try {
      return getChildJsonConfig(this.element_);
    } catch (e) {
      throw user(this.element_).createError(TAG, e);
    }
  }

  /**
   * Read and format the CMP config
   * The returned CMP config should looks like
   * {
   *  "consentInstanceId": "foo",
   *  "checkConsentHref": "https://fake.com",
   *  "promptUISrc": "https://fake.com/promptUI.html",
   *  "uiConfig": {
   *    "overlay": true
   *   }
   * }
   * @return {?JsonObject}
   */
  getCMPConfig_() {
    const type = this.element_.getAttribute('type');
    if (!type) {
      return null;
    }
    userAssert(CMP_CONFIG[type], '%s: invalid CMP type %s', TAG, type);
    const importConfig = CMP_CONFIG[type];
    this.validateCMPConfig_(importConfig);
    return importConfig;
  }

  /**
   * Check if the CMP config is valid
   * @param {!JsonObject} config
   */
  validateCMPConfig_(config) {
    const assertValues = [
      'consentInstanceId',
      'checkConsentHref',
      'promptUISrc',
    ];
    for (let i = 0; i < assertValues.length; i++) {
      const attribute = assertValues[i];
      devAssert(config[attribute], 'CMP config must specify %s', attribute);
    }
  }
}

/**
 * Expand consent endpoint url
 * @param {!Element|!ShadowRoot} element
 * @param {string} url
 * @param {{[key: string]: *}=} opt_vars
 * @return {!Promise<string>}
 */
export function expandConsentEndpointUrl(element, url, opt_vars) {
  const vars = {
    'CLIENT_ID': getConsentCID(element),
    'CONSENT_PAGE_VIEW_ID_64': () =>
      getConsentStateManager(element).then((consentStateManager) =>
        consentStateManager.consentPageViewId64()
      ),
    ...opt_vars,
  };
  return Services.urlReplacementsForDoc(element).expandUrlAsync(url, vars, {
    ...vars,
    ...CONSENT_VARS_ALLOWED_LIST,
  });
}

/**
 * Return AMP CONSENT scoped CID
 * @param {!Element|!ShadowRoot|!../../../src/service/ampdoc-impl.AmpDoc} node
 * @return {!Promise<string>}
 */
export function getConsentCID(node) {
  return Services.cidForDoc(node).then((cid) => {
    return cid.get(
      {scope: CID_SCOPE, createCookieIfNotPresent: true},
      /** consent */ Promise.resolve()
    );
  });
}

/**
 * Expand the passed in policyConfig and generate predefined policy entires
 * @param {!JsonObject} policyConfig
 * @param {string} consentId
 * @return {!JsonObject}
 */
export function expandPolicyConfig(policyConfig, consentId) {
  // Generate default policy
  const defaultWaitForItems = {};

  defaultWaitForItems[consentId] = undefined;

  const defaultPolicy = {
    'waitFor': defaultWaitForItems,
  };

  // TODO(@zhouyx): unblockOn is internal now.
  const unblockOnAll = [
    CONSENT_POLICY_STATE.UNKNOWN,
    CONSENT_POLICY_STATE.SUFFICIENT,
    CONSENT_POLICY_STATE.INSUFFICIENT,
    CONSENT_POLICY_STATE.UNKNOWN_NOT_REQUIRED,
  ];

  const predefinedNone = {
    'waitFor': defaultWaitForItems,
    // Experimental config, do not expose
    'unblockOn': unblockOnAll,
  };

  const rejectAllOnZero = {
    'waitFor': defaultWaitForItems,
    'timeout': {
      'seconds': 0,
      'fallbackAction': 'reject',
    },
    'unblockOn': unblockOnAll,
  };

  policyConfig['_till_responded'] = predefinedNone;

  policyConfig['_till_accepted'] = defaultPolicy;

  policyConfig['_auto_reject'] = rejectAllOnZero;

  if (policyConfig && policyConfig['default']) {
    return policyConfig;
  }

  policyConfig['default'] = defaultPolicy;

  return policyConfig;
}
