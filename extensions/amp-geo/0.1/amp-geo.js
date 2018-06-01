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
import {getMode} from '../../../src/mode';
import {isArray, isObject} from '../../../src/types';
import {isCanary} from '../../../src/experiments';
import {isJsonScriptTag} from '../../../src/dom';
import {parseJson} from '../../../src/json';
import {user} from '../../../src/log';
import {waitForBodyPromise} from '../../../src/dom';

/**
 * @enum {number}
 */
export const GEO_IN_GROUP = {
  NOT_DEFINED: 1,
  IN: 2,
  NOT_IN: 3,
};

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


export class AmpGeo extends AMP.BaseElement {
  /** @param {!AmpElement} element */
  constructor(element) {
    super(element);

    /** @private {number} */
    this.mode_ = mode.GEO_HOT_PATCH;
    /** @private {string} */
    this.country_ = 'unknown';
    /** @private {Array<string>} */
    this.matchedGroups_ = [];
    /** @private {Array<string>} */
    this.definedGroups_ = [];
    /** @Private {} */
  }

  /** @override */
  buildCallback() {
    // All geo config within the amp-geo component.
    // The validator only allows one amp-geo per page
    const {children} = this.element;

    if (children.length) {
      user().assert(children.length === 1 &&
        isJsonScriptTag(children[0]),
      `${TAG} can only have one <script type="application/json"> child`);
    }

    /** @type {!Promise<!Object<string, (string|Array<string>)>>} */
    const geo = this.addToBody_(
        children.length ?
          parseJson(children[0].textContent) : {});

    /* resolve the service promise singleton we stashed earlier */
    geoDeferred.resolve(geo);
  }


  /**
   * findCountry_, sets this.country_ and this.mode_
   * @param {Document} doc
   */
  findCountry_(doc) {
    // First see if we've been pre-rendered with a country, if so set it
    const preRenderMatch = doc.body.className.match(PRE_RENDER_REGEX);

    if (preRenderMatch &&
        !Services.urlForDoc(doc).isProxyOrigin(doc.location)) {
      this.mode_ = mode.GEO_PRERENDER;
      this.country_ = preRenderMatch[1];
    } else {
      this.mode_ = mode.GEO_HOT_PATCH;
      this.country_ = COUNTRY.trim();
      // If we got a country code it will be 2 characters
      // If the lengths is 0 the country is unknown
      // If the length is > 2 we didn't get patched
      // (probably local dev) so we treat it as unknown.
      if (this.country_.length !== 2) {
        this.country_ = 'unknown';
      }
    }

    // Are we in debug override?
    // match to \w characters only to prevent xss vector
    if (getMode(this.win).geoOverride &&
      (isCanary(this.win) || getMode(this.win).localDev) &&
      /^\w+$/.test(getMode(this.win).geoOverride)) {
      this.mode_ = mode.GEO_OVERRIDE;
      this.country_ = getMode(this.win).geoOverride.toLowerCase();
    }
  }
  /**
   * Find matching country groups
   * @param {Object} config
   */
  matchCountryGroups_(config) {
    // ISOCountryGroups are optional but if specified at least one must exist
    const ISOCountryGroups = /** @type {!Object<string, Array<string>>} */(
      config.ISOCountryGroups);
    const errorPrefix = '<amp-geo> ISOCountryGroups'; // code size

    if (ISOCountryGroups) {
      user().assert(
          isObject(ISOCountryGroups),
          `${errorPrefix} must be an object`);
      this.definedGroups_ = Object.keys(ISOCountryGroups);
      this.definedGroups_.forEach(group => {
        user().assert(
            /^[a-z]+[a-z0-9]*$/i.test(group) &&
            !/^amp/.test(group),
            `${errorPrefix}[${group}] name is invalid`);
        user().assert(
            isArray(ISOCountryGroups[group]),
            `${errorPrefix}[${group}] must be an array`);
        ISOCountryGroups[group] = ISOCountryGroups[group]
            .map(country => country.toLowerCase());
        if (ISOCountryGroups[group].includes(this.country_)) {
          this.matchedGroups_.push(group);
        }
      });
    }
  }

  /**
   * clearPreRender_()
   * Returns a list of classes to remove if pre-render has
   * been invalidated by way of being on an amp cache
   * @param {Document} doc
   * @return {Array<string>}
   */
  clearPreRender_(doc) {
    const {classList} = doc.body;
    const classesToRemove = [];
    const stripRe = new RegExp('^' + COUNTRY_PREFIX + '|^' + GROUP_PREFIX ,'i');
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
   * @return {!Promise<!Object<string, (string|Array<string>)>>} service response
   * @private
   */
  addToBody_(config) {
    const doc = this.win.document;
    /** @type {Object} */
    const states = {};
    const self = this;

    // Wait for the body before we figure antying out becasue we might be
    // prerendered and we know that from body classes
    return waitForBodyPromise(doc).then(() => {
      self.findCountry_(doc);
      self.matchCountryGroups_(config);

      let classesToRemove = [];

      switch (self.mode_) {
        case mode.GEO_OVERRIDE:
          classesToRemove = self.clearPreRender_(doc);
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

          states.ISOCountryGroups = self.matchedGroups_;
          classesToAdd.push(COUNTRY_PREFIX + this.country_);

          // Let the runtime know we're mutating the doc.body
          // Actual change happens in callback to runtime can
          // optimize dom mutations.
          self.mutateElement(() => {
            const {classList} = doc.body;
            // Always remove the pending class
            classesToRemove.push('amp-geo-pending');
            classesToRemove.forEach(toRemove => classList.remove(toRemove));

            // add the new classes to <body>
            classesToAdd.forEach(toAdd => classList.add(toAdd));

            // Only include amp state if user requests it to
            // avoid validator issue with missing amp-bind js
            if (config.AmpBind) {
              const geoState = doc.getElementById(GEO_ID);
              if (geoState) {
                geoState.parentNode.removeChild(geoState);
              }
              const state = doc.createElement('amp-state');
              const confScript = doc.createElement('script');
              confScript.setAttribute('type', 'application/json');
              confScript.textContent =
                  JSON.stringify(/** @type {!JsonObject} */(states)) ;
              state.appendChild(confScript);
              state.id = GEO_ID;
              doc.body.appendChild(state);
            }
          }, doc.body);

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
        /**
         * Temp still return old interface to avoid version skew
         * with consuming extensions.  This will go away don't use it!
         * replace with matchedISOCountryGroups or use the isInCountryGroup
         * API
         */
        ISOCountryGroups: self.matchedGroups_,
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
    if (targets.filter(group => {
      return this.definedGroups_.indexOf(group) >= 0;
    }).length !== targets.length) {
      return GEO_IN_GROUP.NOT_DEFINED;
    }

    // If any of the groups match it's a match
    if (targets.filter(group => {
      return this.matchedGroups_.indexOf(group) >= 0;
    }).length > 0) {
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
