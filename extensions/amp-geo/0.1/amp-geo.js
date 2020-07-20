/**
 * Copyright 2018 The AMP HTML Authors. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS-IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

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
 *  </scirpt>
 * </amp-geo>
 * </code>
 *
 * the amp-geo element's layout type is nodisplay.
 */

import {Deferred} from '../../../src/utils/promise';
import {Services} from '../../../src/services';

/**
 * GOOGLE AND THE AMP PROJECT ARE PROVIDING THIS INFORMATION AS A COURTESY BUT
 * DO NOT GUARANTEE THE ACCURACY OR COMPLETENESS OF ANY INFORMATION CONTAINED
 * HEREIN. THIS INFORMATION IS PROVIDED "AS IS" AND WITHOUT ANY EXPRESS OR
 * IMPLIED WARRANTIES, INCLUDING, WITHOUT LIMITATION, THE IMPLIED WARRANTIES OF
 * MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE.
 */
import {US_CA_CODE, ampGeoPresets} from './amp-geo-presets';

import {GEO_IN_GROUP} from './amp-geo-in-group';
import {dev, user, userAssert} from '../../../src/log';
import {getMode} from '../../../src/mode';
import {isArray, isObject} from '../../../src/types';
import {isCanary} from '../../../src/experiments';
import {isJsonScriptTag} from '../../../src/dom';
import {tryParseJson} from '../../../src/json';
import {urls} from '../../../src/config';

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
const GROUP_PREFIX = 'amp-geo-group-';
const PRE_RENDER_REGEX = new RegExp(`${COUNTRY_PREFIX}(\\w+)`);
const GEO_ID = 'ampGeo';
const SERVICE_TAG = 'geo';
const API_TIMEOUT = 60; // Seconds
const GEO_HOTPATCH_STR_REGEX = /^(?:(\w{2})(?:\s(\w{2}-\w{2}))?)?\s*/;

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

// TODO(zhouyx@): Rename if we have generic subdivision group support
/**
 * @typedef {{
 *   ISOCountry: string,
 *   matchedISOCountryGroups: !Array<string>,
 *   allISOCountryGroups: !Array<string>,
 *   isInCountryGroup: (function(string):GEO_IN_GROUP),
 * }}
 */
export let GeoDef;

export class AmpGeo extends AMP.BaseElement {
  /** @param {!AmpElement} element */
  constructor(element) {
    super(element);

    /** @private {number} */
    this.mode_ = mode.GEO_HOT_PATCH;
    /** @private {boolean} */
    this.error_ = false;
    /** @private {string} */
    this.country_ = 'unknown';
    /** @private {string} */
    this.subdivision_ = 'unknown';
    /** @private {Array<string>} */
    this.matchedGroups_ = [];
    /** @private {Array<string>} */
    this.definedGroups_ = [];
  }

  /** @override */
  prerenderAllowed() {
    return true;
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
    const geo = this.addToBody_(config || {});

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
   * findCountry_, sets this.country_ and this.mode_
   * @param {!../../../src/service/ampdoc-impl.AmpDoc} ampdoc
   * @return {Promise}
   */
  findCountry_(ampdoc) {
    // Flag to see if we've been pre-rendered with a country
    const preRenderMatch = ampdoc.getBody().className.match(PRE_RENDER_REGEX);
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
    const trimmedGeoMatch = GEO_HOTPATCH_STR_REGEX.exec(COUNTRY);

    // default country is 'unknown' which is also the zero length case
    if (
      getMode(this.win).geoOverride &&
      (isCanary(this.win) || getMode(this.win).localDev)
    ) {
      // debug override case, only works in canary or localdev
      // match to \w characters only to prevent xss vector
      const overrideGeoMatch = GEO_HOTPATCH_STR_REGEX.exec(
        getMode(this.win).geoOverride.toLowerCase()
      );
      if (overrideGeoMatch[1]) {
        this.country_ = overrideGeoMatch[1].toLowerCase();
        if (overrideGeoMatch[2]) {
          // Allow subdivision_ to be customized for testing, not checking us-ca
          this.subdivision_ = overrideGeoMatch[2].toLowerCase();
        }
        this.mode_ = mode.GEO_OVERRIDE;
      }
    } else if (
      preRenderMatch &&
      !Services.urlForDoc(this.element).isProxyOrigin(this.win.location)
    ) {
      // pre-rendered by a publisher case, if we're a cache we ignore that
      // since there is no way the publisher could know the geo of the client.
      // When caches start pre-rendering geo we'll need to add specifc code
      // to handle that.
      this.mode_ = mode.GEO_PRERENDER;
      this.country_ = preRenderMatch[1];
    } else if (trimmedGeoMatch[1]) {
      // We have a valid 2 letter ISO country
      this.mode_ = mode.GEO_HOT_PATCH;
      this.country_ = trimmedGeoMatch[1].toLowerCase();
      if (
        trimmedGeoMatch[2] &&
        trimmedGeoMatch[2].toLowerCase() === US_CA_CODE
      ) {
        // Has subdivision code support (us-ca only)
        this.subdivision_ = US_CA_CODE;
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
            // Subdivision is optional and only us-ca is currently supported.
            if (subdivision && `${country}-${subdivision}` === US_CA_CODE) {
              this.subdivision_ = US_CA_CODE;
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
   * @return {Promise<?Object.<string, ?string>>}
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
   * @param {Object} config
   */
  matchCountryGroups_(config) {
    // ISOCountryGroups are optional but if specified at least one must exist
    const ISOCountryGroups = /** @type {!Object<string, !Array<string>>} */ (config[
      'ISOCountryGroups'
    ]);
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
        if (country == 'unknown' || /^[a-zA-Z]{2}$/.test(country)) {
          countries.push(country);
        } else {
          user().error(TAG, ' country %s not valid, will be ignored', country);
        }
        return countries;
      }, [])
      .map((c) => c.toLowerCase());
    return (
      expandedGroup.includes(this.country_) ||
      (expandedGroup.includes(US_CA_CODE) && this.subdivision_ == US_CA_CODE)
    );
  }

  /**
   * clearPreRender_()
   * Returns a list of classes to remove if pre-render has
   * been invalidated by way of being on an amp cache
   * @param {Element} body
   * @return {Array<string>}
   */
  clearPreRender_(body) {
    const {classList} = body;
    const classesToRemove = [];
    const stripRe = new RegExp('^' + COUNTRY_PREFIX + '|^' + GROUP_PREFIX, 'i');
    for (let i = classList.length - 1; i > 0; i--) {
      if (stripRe.test(classList[i])) {
        classesToRemove.push(classList[i]);
      }
    }
    return classesToRemove;
  }

  /**
   * Adds the given country groups to HTML element as classes
   * @param {Object} config
   * @return {!Promise<!GeoDef>} service response
   * @private
   */
  addToBody_(config) {
    const ampdoc = this.getAmpDoc();
    /** @type {Object} */
    const states = {};
    const self = this;

    // Wait for the body before we figure anything out because we might be
    // prerendered and we know that from body classes
    return ampdoc
      .whenReady()
      .then(() => ampdoc.waitForBodyOpen())
      .then((body) => {
        return self.findCountry_(ampdoc).then(() => body);
      })
      .then((body) => {
        self.matchCountryGroups_(config);

        let classesToRemove = [];

        switch (self.mode_) {
          case mode.GEO_OVERRIDE:
            classesToRemove = self.clearPreRender_(body);
          // Intentionally fall through.
          case mode.GEO_HOT_PATCH:
          case mode.GEO_API:
            // Build the AMP State, add classes
            states.ISOCountry = self.country_;

            const classesToAdd = self.matchedGroups_.map((group) => {
              states[group] = true;
              return GROUP_PREFIX + group;
            });

            if (!self.matchedGroups_.length) {
              classesToAdd.push('amp-geo-no-group');
            }

            if (self.error_) {
              classesToAdd.push('amp-geo-error');
            }

            states.ISOCountryGroups = self.matchedGroups_;
            classesToAdd.push(COUNTRY_PREFIX + this.country_);

            // Let the runtime know we're mutating the AMP body
            // Actual change happens in callback so runtime can
            // optimize dom mutations.
            self.mutateElement(() => {
              const {classList} = body;
              // Always remove the pending class
              classesToRemove.push('amp-geo-pending');
              classesToRemove.forEach((toRemove) => {
                /** @type {!DOMTokenList} */ (classList).remove(toRemove);
              });

              // add the new classes to <body>
              classesToAdd.forEach((toAdd) => classList.add(toAdd));

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
            }, body);

            break;
          case mode.GEO_PRERENDER:
            break;
        }

        return {
          ISOCountry: self.country_,
          matchedISOCountryGroups: self.matchedGroups_,
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
