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
import {ampGeoPresets} from './amp-geo-presets';

import {GEO_IN_GROUP} from './amp-geo-in-group';
import {dev, userAssert} from '../../../src/log';
import {getMode} from '../../../src/mode';
import {isArray, isObject} from '../../../src/types';
import {isCanary} from '../../../src/experiments';
import {isJsonScriptTag} from '../../../src/dom';
import {tryParseJson} from '../../../src/json';

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

/**
 * Operating Mode
 * @enum {number}
 */
const mode = {
  GEO_HOT_PATCH: 0, // Default mode, geo is patched by GFE when js is served
  GEO_PRERENDER: 1, // We've been prerendered by an AMP Cache or publisher CMS
  GEO_OVERRIDE: 2, //  We've been overriden in test by #amp-geo=xx
};

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
    /** @private {Array<string>} */
    this.matchedGroups_ = [];
    /** @private {Array<string>} */
    this.definedGroups_ = [];
    /** @Private {} */
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
    const trimmedCountryMatch = /^(\w{2})?\s*/.exec(COUNTRY);

    // default country is 'unknown' which is also the zero length case

    if (
      getMode(this.win).geoOverride &&
      (isCanary(this.win) || getMode(this.win).localDev) &&
      /^\w+$/.test(getMode(this.win).geoOverride)
    ) {
      // debug override case, only works in canary or localdev
      // match to \w characters only to prevent xss vector
      this.mode_ = mode.GEO_OVERRIDE;
      this.country_ = getMode(this.win).geoOverride.toLowerCase();
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
    } else if (trimmedCountryMatch[1]) {
      // We have a valid 2 letter ISO country
      this.mode_ = mode.GEO_HOT_PATCH;
      this.country_ = trimmedCountryMatch[1];
    } else if (trimmedCountryMatch[0] === '' && !getMode(this.win).localDev) {
      // We were not patched, if we're not in dev this is an error
      // and we leave the country at the default 'unknown'
      this.error_ = true;
      dev().error(
        TAG,
        'GEONOTPATCHED: amp-geo served unpatched, ISO country not set'
      );
    }
  }

  /**
   * Find matching country groups
   * @param {Object} config
   */
  matchCountryGroups_(config) {
    // ISOCountryGroups are optional but if specified at least one must exist
    const ISOCountryGroups =
      /** @type {!Object<string, !Array<string>>} */ (config[
        'ISOCountryGroups'
      ]);
    const errorPrefix = '<amp-geo> ISOCountryGroups'; // code size
    if (ISOCountryGroups) {
      this.assertWithErrorReturn_(
        isObject(ISOCountryGroups),
        `${errorPrefix} must be an object`
      );
      this.definedGroups_ = Object.keys(ISOCountryGroups);
      this.definedGroups_.forEach(group => {
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
        countries.push(country);
        return countries;
      }, [])
      .map(c => c.toLowerCase());
    return expandedGroup.includes(this.country_);
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
    return ampdoc.whenBodyAvailable().then(body => {
      self.findCountry_(ampdoc);
      self.matchCountryGroups_(config);

      let classesToRemove = [];

      switch (self.mode_) {
        case mode.GEO_OVERRIDE:
          classesToRemove = self.clearPreRender_(body);
        // Intentionally fall through.
        case mode.GEO_HOT_PATCH:
          // Build the AMP State, add classes
          states.ISOCountry = self.country_;

          const classesToAdd = self.matchedGroups_.map(group => {
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
            classesToRemove.forEach(toRemove => classList.remove(toRemove));

            // add the new classes to <body>
            classesToAdd.forEach(toAdd => classList.add(toAdd));

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
      targets.filter(group => {
        return this.definedGroups_.indexOf(group) >= 0;
      }).length !== targets.length
    ) {
      return GEO_IN_GROUP.NOT_DEFINED;
    }

    // If any of the groups match it's a match
    if (
      targets.filter(group => {
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

AMP.extension('amp-geo', '0.1', AMP => {
  geoDeferred = new Deferred();
  AMP.registerElement(TAG, AmpGeo);
  AMP.registerServiceForDoc(SERVICE_TAG, () => geoDeferred.promise);
});
