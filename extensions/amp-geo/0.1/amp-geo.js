/**
 * @fileoverview Sets location specific CSS, bind variables, and attributes on
 * AMP pages
 * Example:
 * <code>
 * <amp-geo>
 *  <script type="application-json">
 *  {
 *    ISOCountryGroups: {
 *      "anz": [ "au", "nz" ],
 *      "nafta": [' "ca", "mx", "us", "unknown" ],
 *      "iceland": [ "is" ]
 *    }
 *  }
 *  </script>
 * </amp-geo>
 * </code>
 *
 * the amp-geo element's layout type is nodisplay.
 */

import {Deferred} from '#core/data-structures/promise';
import {isJsonScriptTag, iterateCursor} from '#core/dom';
import {isArray, isObject} from '#core/types';
import {tryParseJson} from '#core/types/object/json';
import {getHashParams} from '#core/types/string/url';

import {isCanary, isExperimentOn} from '#experiments';

import {Services} from '#service';

/**
 * GOOGLE AND THE AMP PROJECT ARE PROVIDING THIS INFORMATION AS A COURTESY BUT
 * DO NOT GUARANTEE THE ACCURACY OR COMPLETENESS OF ANY INFORMATION CONTAINED
 * HEREIN. THIS INFORMATION IS PROVIDED "AS IS" AND WITHOUT ANY EXPRESS OR
 * IMPLIED WARRANTIES, INCLUDING, WITHOUT LIMITATION, THE IMPLIED WARRANTIES OF
 * MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE.
 */
import {dev, user, userAssert} from '#utils/log';

import {GEO_IN_GROUP} from './amp-geo-in-group';
import {ampGeoPresets} from './amp-geo-presets';

import * as urls from '../../../src/config/urls';
import {getMode} from '../../../src/mode';

/** @const */
const TAG = 'amp-geo';
/**
 * COUNTRY is a special const the magic string AMP_ISO_COUNTRY_HOTPATCH
 * is replaced at serving time with the two letter country code or
 * error value padded to length to avoid breaking .map files.  We
 * then trim it and store is as this.country_
 *
 * So don't change the magic string!
 */
const COUNTRY = '{{AMP_ISO_COUNTRY_HOTPATCH}}';
const COUNTRY_PREFIX = 'amp-iso-country-';
const SUBDIVISION_PREFIX = 'amp-iso-subdivision-';
const GROUP_PREFIX = 'amp-geo-group-';
const PRE_RENDER_REGEX = new RegExp(`${COUNTRY_PREFIX}(\\w+)`);
const PRE_RENDER_SUBDIVISION_REGEX = new RegExp(
  `${SUBDIVISION_PREFIX}(\\w{2}-\\w{1,3})`
);
const GEO_ID = 'ampGeo';
const SERVICE_TAG = 'geo';
const API_TIMEOUT = 60; // Seconds
const GEO_HOTPATCH_STR_REGEX = /^(?:(\w{2})(?:\s(\w{2}-\w{1,3}))?)?\s*/;

const STRIP_RE = new RegExp(
  '^' + COUNTRY_PREFIX + '|^' + GROUP_PREFIX + '|^' + SUBDIVISION_PREFIX,
  'i'
);

/**
 * Operating Mode
 * @enum {number}
 */
const mode = {
  GEO_HOT_PATCH: 0, // Default mode, geo is patched by GFE when js is served
  GEO_PRERENDER: 1, // We've been prerendered by an AMP Cache or publisher CMS
  GEO_OVERRIDE: 2, //  We've been overriden in test by #amp-geo=xx
  GEO_API: 3, //       Query API when cache patching unavailable
};

const VALUE_UNKNOWN = 'unknown';

// TODO(zhouyx@): Rename if we have generic subdivision group support
/**
 * @typedef {{
 *   ISOCountry: string,
 *   ISOSubdivision: string,
 *   matchedISOCountryGroups: !Array<string>,
 *   allISOCountryGroups: !Array<string>,
 *   isInCountryGroup: (function(string):GEO_IN_GROUP),
 * }}
 */
export let GeoDef;

export class AmpGeo extends AMP.BaseElement {
  /** @override  */
  static prerenderAllowed() {
    return true;
  }

  /** @param {!AmpElement} element */
  constructor(element) {
    super(element);

    /** @private {number} */
    this.mode_ = mode.GEO_HOT_PATCH;
    /** @private {boolean} */
    this.error_ = false;
    /** @private {string} */
    this.country_ = VALUE_UNKNOWN;
    /** @private {string} */
    this.subdivision_ = VALUE_UNKNOWN;
    /** @private {Array<string>} */
    this.matchedGroups_ = [];
    /** @private {Array<string>} */
    this.definedGroups_ = [];
  }

  /** @override */
  buildCallback() {
    // All geo config within the amp-geo component.
    // The validator only allows one amp-geo per page
    const {children} = this.element;

    if (children.length) {
      this.assertWithErrorReturn_(
        children.length === 1 && isJsonScriptTag(children[0]),
        `${TAG} can only have one <script type="application/json"> child`
      );
    }

    const config = children.length
      ? tryParseJson(children[0].textContent, () =>
          this.assertWithErrorReturn_(false, `${TAG} Unable to parse JSON`)
        )
      : {};

    /** @type {!Promise<!GeoDef>} */
    const geo = this.addToHtmlAndBody_(config || {});

    /* resolve the service promise singleton we stashed earlier */
    geoDeferred.resolve(geo);
  }

  /**
   * resolves geoDeferred with null if not shouldBeTrueish and then calls
   * userAssert() to deal with the error as normal.
   * @param {T} shouldBeTrueish The value to assert.
   *  The assert fails if it does not evaluate to true.
   * @param {string=} opt_message The assertion message
   * @return {T} The value of shouldBeTrueish.
   * @template T
   * @private
   */
  assertWithErrorReturn_(shouldBeTrueish, opt_message) {
    if (!shouldBeTrueish) {
      geoDeferred.resolve(null);
      return userAssert(shouldBeTrueish, opt_message);
    }
    return shouldBeTrueish;
  }

  /**
   * @return {string}
   * @private
   */
  getHotPatchCountry_() {
    return COUNTRY;
  }

  /**
   * findCountry_, sets this.country_ and this.mode_
   * @param {!../../../src/service/ampdoc-impl.AmpDoc} ampdoc
   * @return {Promise}
   */
  findCountry_(ampdoc) {
    const bodyElem = ampdoc.getBody();
    /** @type {?Element|undefined} */
    const docElem = ampdoc.getRootNode().documentElement;
    // Flag to see if we've been pre-rendered with a country
    // Prioritize the prerender hinting classes found in `html` over `body`
    // though we do not drop support for detecting in `body` for backwards
    // compatibility. We make sure that docElem exists at it can be undefined
    // in shadow mode.
    const preRenderMatch =
      docElem?.className.match(PRE_RENDER_REGEX) ||
      bodyElem.className.match(PRE_RENDER_REGEX);

    // Trim the spaces off the patched country.
    // This is guaranteed to always match
    // - Correctly patched will have the two-char country code and whitespace.
    // - Unknown country will not have the country code, but will match all
    //   whitespace.
    // - Unpatched will match, but will not have a country code nor whitespace.

    // 'xx        ': trimmedGeoMatch is ["xx        ", "xx", undefined]
    // 'xx xx-xx  ': trimmedGeoMatch is ["xx xx-xx  ", "xx", "xx-xx"];
    // '          ': trimmedGeoMatch is ["          ", undefined, undefined];
    // '{{AMP_ISO_COUNTRY_HOTPATCH}}':  ["", undefined, undefined]
    const trimmedGeoMatch = GEO_HOTPATCH_STR_REGEX.exec(
      this.getHotPatchCountry_()
    );

    // default country is 'unknown' which is also the zero length case
    const geoOverride = getHashParams(this.win)['amp-geo'];
    if (geoOverride && (isCanary(this.win) || getMode(this.win).localDev)) {
      // debug override case, only works in canary or localdev
      // match to \w characters only to prevent xss vector
      const overrideGeoMatch = GEO_HOTPATCH_STR_REGEX.exec(
        geoOverride.toLowerCase()
      );

      if (overrideGeoMatch[1]) {
        this.country_ = overrideGeoMatch[1];

        if (overrideGeoMatch[2]) {
          this.subdivision_ = overrideGeoMatch[2];
        }

        this.mode_ = mode.GEO_OVERRIDE;
      }
    } else if (
      preRenderMatch &&
      (!Services.urlForDoc(this.element).isProxyOrigin(this.win.location) ||
        isExperimentOn(this.win, 'amp-geo-ssr'))
    ) {
      // pre-rendered by a publisher case or cache case.
      this.mode_ = mode.GEO_PRERENDER;
      this.country_ = preRenderMatch[1];

      const preRenderSubdivisionMatch =
        docElem?.className.match(PRE_RENDER_SUBDIVISION_REGEX) ||
        bodyElem.className.match(PRE_RENDER_SUBDIVISION_REGEX);

      if (preRenderSubdivisionMatch) {
        this.subdivision_ = preRenderSubdivisionMatch[1];
      }
    } else if (trimmedGeoMatch[1]) {
      // We have a valid 2 letter ISO country
      this.mode_ = mode.GEO_HOT_PATCH;
      this.country_ = trimmedGeoMatch[1].toLowerCase();

      if (trimmedGeoMatch[2]) {
        this.subdivision_ = trimmedGeoMatch[2].toLowerCase();
      }
    } else if (trimmedGeoMatch[0] === '' && urls.geoApi) {
      // We were not patched, but an API is available
      this.mode_ = mode.GEO_API;
    } else if (trimmedGeoMatch[0] === '' && !getMode(this.win).localDev) {
      // We were not patched, if we're not in dev this is an error
      // and we leave the country at the default 'unknown'
      this.error_ = true;
      dev().error(
        TAG,
        'GEONOTPATCHED: amp-geo served unpatched, ISO country not set'
      );
    }

    return this.mode_ !== mode.GEO_API
      ? Promise.resolve()
      : this.fetchCountry_().then((data) => {
          if (data) {
            const {country, subdivision} = data;
            // Country is required and guaranteed to exist if data is available.
            this.country_ = country;

            if (subdivision) {
              this.subdivision_ = `${country}-${subdivision}`;
            }
          } else {
            // if API request fails, leave the country at the default 'unknown'
            this.error_ = true;
            dev().error(
              TAG,
              'GEONOTPATCHED: amp-geo served unpatched and API response not valid, ISO country not set'
            );
          }
        });
  }

  /**
   * Ensure API URL definition is usable and cast its type
   * @param {*} url
   * @return {?string}
   * @private
   */
  validateApiUrl_(url) {
    if (typeof url !== 'string') {
      user().error(TAG, 'geoApiUrl must be a string URL');
      return null;
    }

    if (!Services.urlForDoc(this.element).isSecure(url)) {
      user().error(TAG, 'geoApiUrl must be secure (https)');
      return null;
    }

    return url;
  }

  /**
   * Fetch country from API defined in config.urls
   *
   * JSON schema of Geo API response - version 0.2:
   * {
   *   "$schema": "http://json-schema.org/draft-07/schema#",
   *   "type": "object",
   *   "properties": {
   *     "country": {
   *       "type": "string",
   *       "title": "ISO 3166-1 alpha-2 (case insensitive) country code of client request",
   *       "default": "",
   *       "pattern": "^[a-zA-Z]{2}$"
   *     },
   *     "subdivision": {
   *       "type": "string",
   *       "title": "Subdivision part of ISO 3166-2 (case insensitive) country-subdivision code of client request",
   *       "default": "",
   *       "pattern": "^[a-zA-Z0-9]{1,3}$"
   *     }
   *   },
   *   "required": [
   *     "country"
   *   ]
   * }
   *
   * Sample response - country only:
   * {
   *   "country": "de"
   * }
   *
   * Sample response - country and subdivision:
   * {
   *   "country": "us",
   *   "subdivision": "ca"
   * }
   *
   * @return {Promise<?{[key: string]: ?string}>}
   * @private
   */
  fetchCountry_() {
    const url = this.validateApiUrl_(urls.geoApi);
    if (!url) {
      return Promise.resolve(null);
    }

    user().info(
      TAG,
      'API request is being used for country, this may result in FOUC'
    );

    return Services.timerFor(this.win)
      .timeoutPromise(
        API_TIMEOUT * 1000,
        Services.xhrFor(this.win)
          .fetchJson(url, {
            mode: 'cors',
            method: 'GET',
            credentials: 'omit',
          })
          .then((res) => res.json())
          .then((json) => {
            if (!/^[a-z]{2}$/i.test(json['country'])) {
              user().error(
                TAG,
                'Invalid API response, expected schema not matched for property "country"'
              );
              return null;
            }
            return {
              country: json['country'].toLowerCase(),
              subdivision: /^[a-z0-9]{1,3}$/i.test(json['subdivision'])
                ? json['subdivision'].toLowerCase()
                : null,
            };
          })
          .catch((reason) => {
            user().error(TAG, 'XHR country request failed', reason);
            return null;
          }),
        `Timeout (${API_TIMEOUT} sec) reached waiting for API response`
      )
      .catch((error) => {
        user().error(TAG, error);
        return null;
      });
  }

  /**
   * Find matching country groups
   * @param {object} config
   */
  matchCountryGroups_(config) {
    // ISOCountryGroups are optional but if specified at least one must exist
    const ISOCountryGroups = /** @type {!{[key: string]: !Array<string>}} */ (
      config['ISOCountryGroups']
    );
    const errorPrefix = '<amp-geo> ISOCountryGroups'; // code size
    if (ISOCountryGroups) {
      // TODO(zhouyx@): Change the name with generic ISO subdivision support
      this.assertWithErrorReturn_(
        isObject(ISOCountryGroups),
        `${errorPrefix} must be an object`
      );
      this.definedGroups_ = Object.keys(ISOCountryGroups);
      this.definedGroups_.forEach((group) => {
        this.assertWithErrorReturn_(
          /^[a-z]+[a-z0-9]*$/i.test(group) && !/^amp/.test(group),
          `${errorPrefix}[${group}] name is invalid`
        );
        this.assertWithErrorReturn_(
          isArray(ISOCountryGroups[group]),
          `${errorPrefix}[${group}] must be an array`
        );

        if (this.checkGroup_(ISOCountryGroups[group])) {
          this.matchedGroups_.push(group);
        }
      });
    }
  }

  /**
   * checkGroup_() does this.country_ match the group
   * after expanding any presets and forceing to lower case.
   * @param {!Array<string>} countryGroup The group to match against
   * @return {boolean}
   */
  checkGroup_(countryGroup) {
    /** @type {!Array<string>} */
    const expandedGroup = countryGroup
      .reduce((countries, country) => {
        // If it's a valid preset then we expand it.
        if (/^preset-/.test(country)) {
          this.assertWithErrorReturn_(
            isArray(ampGeoPresets[country]),
            `<amp-geo> preset ${country} not found`
          );

          return countries.concat(ampGeoPresets[country]);
        }

        // Otherwise we add the country to the list
        if (
          country === VALUE_UNKNOWN ||
          /^[a-zA-Z]{2}(?:-[0-9a-zA-Z]{1,3})?$/.test(country)
        ) {
          countries.push(country);
        } else {
          user().error(TAG, ' country %s not valid, will be ignored', country);
        }
        return countries;
      }, [])
      .map((c) => c.toLowerCase());
    return (
      expandedGroup.includes(this.country_) ||
      (this.subdivision_ !== VALUE_UNKNOWN &&
        expandedGroup.includes(this.subdivision_))
    );
  }

  /**
   * clearPreRender_()
   * Returns a list of classes to remove if pre-render has
   * been invalidated by way of an override.
   * @param {!Element} body
   * @param {?Element|undefined} docElem
   * @return {!Array<string>}
   */
  clearPreRender_(body, docElem) {
    const classesToRemove = new Set();

    if (docElem) {
      const {classList: docElemClassList} = docElem;
      iterateCursor(docElemClassList, (el) => {
        if (STRIP_RE.test(el)) {
          classesToRemove.add(el);
        }
      });
    }

    const {classList: bodyClassList} = body;
    iterateCursor(bodyClassList, (el) => {
      if (STRIP_RE.test(el)) {
        classesToRemove.add(el);
      }
    });
    return classesToRemove;
  }

  /**
   * Adds the given country groups to HTML element as classes
   * @param {object} config
   * @return {!Promise<!GeoDef>} service response
   * @private
   */
  addToHtmlAndBody_(config) {
    const ampdoc = this.getAmpDoc();
    /** @type {object} */
    const states = {};

    // Wait for the body before we figure anything out because we might be
    // prerendered and we know that from body classes
    return ampdoc
      .whenReady()
      .then(() => ampdoc.waitForBodyOpen())
      .then((body) => {
        return this.findCountry_(ampdoc).then(() => body);
      })
      .then((body) => {
        /** @type {?Element|undefined} */
        const docElem = ampdoc.getRootNode().documentElement;
        this.matchCountryGroups_(config);

        let classesToRemove = new Set();

        switch (this.mode_) {
          case mode.GEO_OVERRIDE:
            classesToRemove = this.clearPreRender_(body, docElem);
          // Intentionally fall through.
          case mode.GEO_HOT_PATCH:
          case mode.GEO_API:
            // Build the AMP State, add classes
            states.ISOCountry = this.country_;
            states.ISOSubdivision = this.subdivision_;

            const classesToAdd = this.matchedGroups_.map((group) => {
              states[group] = true;
              return GROUP_PREFIX + group;
            });

            if (!this.matchedGroups_.length) {
              classesToAdd.push('amp-geo-no-group');
            }

            if (this.error_) {
              classesToAdd.push('amp-geo-error');
            }

            states.ISOCountryGroups = this.matchedGroups_;
            classesToAdd.push(COUNTRY_PREFIX + this.country_);

            if (this.subdivision_ !== VALUE_UNKNOWN) {
              classesToAdd.push(SUBDIVISION_PREFIX + this.subdivision_);
            }

            // Let the runtime know we're mutating the AMP body
            // Actual change happens in callback so runtime can
            // optimize dom mutations.
            this.mutateElement(() => {
              const docElemClassList = docElem && docElem.classList;
              const {classList: bodyClassList} = body;
              // Always remove the pending class
              classesToRemove.add('amp-geo-pending');
              classesToRemove.forEach((toRemove) => {
                /** @type {!DOMTokenList} */ (bodyClassList).remove(toRemove);

                if (docElemClassList) {
                  /** @type {!DOMTokenList} */ (docElemClassList).remove(
                    toRemove
                  );
                }
              });

              // add the new classes to <html> and <<body>
              classesToAdd.forEach((toAdd) => {
                if (docElemClassList) {
                  docElemClassList.add(toAdd);
                }
                bodyClassList.add(toAdd);
              });

              // Only include amp state if user requests it to
              // avoid validator issue with missing amp-bind js
              if (config['AmpBind']) {
                const geoState = ampdoc.getElementById(GEO_ID);
                if (geoState) {
                  geoState.parentNode.removeChild(geoState);
                }
                const state = ampdoc.win.document.createElement('amp-state');
                const confScript = ampdoc.win.document.createElement('script');
                confScript.setAttribute('type', 'application/json');
                confScript.textContent = JSON.stringify(
                  /** @type {!JsonObject} */ (states)
                );
                state.appendChild(confScript);
                state.id = GEO_ID;
                body.appendChild(state);
              }
            }, docElem);

            break;
          case mode.GEO_PRERENDER:
            break;
        }

        return {
          ISOCountry: this.country_,
          ISOSubdivision: this.subdivision_,
          matchedISOCountryGroups: this.matchedGroups_,
          allISOCountryGroups: this.definedGroups_,
          /* API */
          isInCountryGroup: this.isInCountryGroup.bind(this),
        };
      });
  }

  /**
   * isInCountryGroup API
   * @param {string} targetGroup group or comma delimited list of groups
   * @return {GEO_IN_GROUP}
   * @public
   */
  isInCountryGroup(targetGroup) {
    const targets = targetGroup.trim().split(/,\s*/);

    // If any of the group are missing it's an error
    if (
      targets.filter((group) => {
        return this.definedGroups_.indexOf(group) >= 0;
      }).length !== targets.length
    ) {
      return GEO_IN_GROUP.NOT_DEFINED;
    }

    // If any of the groups match it's a match
    if (
      targets.filter((group) => {
        return this.matchedGroups_.indexOf(group) >= 0;
      }).length > 0
    ) {
      return GEO_IN_GROUP.IN;
    }

    // If we got here nothing matched
    return GEO_IN_GROUP.NOT_IN;
  }
}

/**
 * Create the service promise at load time to prevent race between extensions
 */

/** singleton */
let geoDeferred = null;

AMP.extension('amp-geo', '0.1', (AMP) => {
  geoDeferred = new Deferred();
  AMP.registerElement(TAG, AmpGeo);
  AMP.registerServiceForDoc(SERVICE_TAG, function () {
    return geoDeferred.promise;
  });
});
