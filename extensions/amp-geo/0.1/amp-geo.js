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
 * @fileoverview Sets location specific CSS, bind variables, and attributes on AMP pages
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

import {Layout} from '../../../src/layout';
import {childElementsByTag, isJsonScriptTag} from '../../../src/dom';
import {getMode} from '../../../src/mode';
import {isArray, isObject} from '../../../src/types';
import {isCanary} from '../../../src/experiments';
import {isProxyOrigin} from '../../../src/url';
import {parseJson} from '../../../src/json';
import {registerServiceBuilder} from '../../../src/service';
import {user} from '../../../src/log';
import {waitForBodyPromise} from '../../../src/dom';


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
const COUNTRY = 'AMP_ISO_COUNTRY_HOTPATCH';
const COUNTRY_PREFIX = 'amp-iso-country-';
const GROUP_PREFIX = 'amp-geo-group-';
const PRE_RENDER_REGEX = new RegExp(`${COUNTRY_PREFIX}(\\w+)`);
const GEO_ID = 'ampGeo';
const defaultLen = COUNTRY.length;

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
    /** @Private {} */
  }

  /** @override */
  isLayoutSupported(layout) {
    return layout == Layout.NODISPLAY;
  }

  /** @override */
  buildCallback() {
    // All geo config within the amp-geo component. There will be only
    // one single amp-geo allowed in page.
    const scripts = childElementsByTag(this.element, 'script');
    user().assert(scripts.length == 1,
        `${TAG} should have exactly one <script> child`);
    const script = scripts[0];
    user().assert(isJsonScriptTag(script),
        `${TAG} consent instance config should be put in a <script>` +
        'tag with type= "application/json"');
    const config = parseJson(script.textContent);

    /** @private @const {!Promise<!Object<string, (string|boolean)>>} */
    const geo = this.addToBody_(config);

    registerServiceBuilder(this.win, 'geo', function() {
      return geo;
    });
  }

  /**
   * findCountry_, sets this.country_ and this.mode_
   */
  findCountry_(doc) {
    // First see if we've been pre-rendered with a country, if so set it
    const preRenderMatch = doc.body.className.match(PRE_RENDER_REGEX);

    if (preRenderMatch && !isProxyOrigin(doc.location)) {
      this.mode_ = mode.GEO_PRERENDER;
      /** @private {string} */
      this.country_ = preRenderMatch[1];
    } else {
      this.mode_ = mode.GEO_HOT_PATCH;
      this.country_ = COUNTRY.trim();
      // Catch the case where we didn't get patched or we are on a local system
      // Note we can't use a string compare becasue it will get overwritten when
      // the AMP_ISO_COUNTRY default is hot patched to the actual country.
      if (this.country_.length === defaultLen) {
        this.country_ = 'unknown';
      }
    }

    // Are we in debug override?
    // match to \w+ to prevent xss vector
    if (getMode(this.win).geoOverride &&
      (isCanary(this.win) || getMode(this.win).localDev) &&
      getMode(this.win).geoOverride.match(/\w+/)) {
      this.mode_ = mode.GEO_OVERRIDE;
      this.country_ = getMode(this.win).geoOverride ;
    }
  }
  /**
   * Find matching country groups
   * @param {Object} config
   */
  matchCountryGroups_(config) {
    /* ISOCountryGroups are optional but if specified at least one must exist  */
    if (config.ISOCountryGroups) {
      user().assert(
          isObject(config.ISOCountryGroups),
          '<amp-geo> ISOCountryGroups must be an Object');
      const groups = Object.keys(config.ISOCountryGroups);
      for (let i = 0; i < groups.length; i++) {
        user().assert(
            /[a-z]+[a-z0-9]*/i.test(groups[i]) &&
            !/^amp/.test(groups[i]),
            '<amp-geo> ISOCountryGroups[' + groups[i] + '] name is invalid');
        user().assert(
            isArray(config.ISOCountryGroups[groups[i]]),
            '<amp-geo> ISOCountryGroups[' + groups[i] + '] must be an array'
        );
        if (config.ISOCountryGroups[groups[i]].indexOf(this.country_) >= 0) {
          this.matchedGroups_.push(groups[i]);
        }
      }
    }
  }

  /**
   * clearPreRender_()
   * Removes classes and amp-state block addred by server side
   * pre-render when debug override is in effect
   */
  clearPreRender_(doc) {
    const klasses = doc.body.classList;
    const stripRe = new RegExp('^' + COUNTRY_PREFIX + '|^' + GROUP_PREFIX ,'i');
    for (let i = klasses.length - 1; i > 0; i--) {
      if (stripRe.test(klasses[i])) {
        doc.body.classList.remove(klasses[i]);
      }
    }
    const geoState = doc.getElementById(GEO_ID);
    if (geoState) {
      geoState.parentNode.removeChild(geoState);
    }
  }

  /**
   * Adds the given country groups to HTML element as classes
   * @param {Object} config
   * @return {!Promise<!Object<string, (string | boolean)>>} service response
   * @private
   */
  addToBody_(config) {
    const doc = this.win.document;
    /** @private {Object} */
    const states = {};
    const self = this;

    // Wait for the body before we figure antying out becasue we might be
    // prerendered and we know that from body classes
    return waitForBodyPromise(doc).then(() => {
      self.findCountry_(doc);
      self.matchCountryGroups_(config);

      switch (self.mode_) {
        case mode.GEO_OVERRIDE:
          self.clearPreRender_(doc);
          // Intentionally fall through.
        case mode.GEO_HOT_PATCH:
          // Build the AMP State, add classes
          states.ISOCountry = self.country_;

          for (let group = 0; group < self.matchedGroups_.length; group++) {
            doc.body.classList.add(GROUP_PREFIX + self.matchedGroups_[group]);
            states[self.matchedGroups_[group]] = true;
          }
          doc.body.classList.add(COUNTRY_PREFIX + this.country_);
          states.ISOCountryGroups = self.matchedGroups_;

          // Add the AMP state to the doc
          const state = doc.createElement('amp-state');
          state./*OK*/innerHTML = '<script type="application/json">' +
          JSON.stringify(/** @type {!JsonObject} */(states)) + '</script>';
          state.id = GEO_ID;

          // Only include amp state if user requests it to avoid validator issue
          // with missing amp-bind js
          if (config.AmpBind) {
            doc.body.appendChild(state);
          }
          break;
        case mode.GEO_PRERENDER:
          break;
      }

      return {ISOCountry: self.country_, ISOCountryGroups: self.matchedGroups_};
    });
  }
}

AMP.registerElement(TAG, AmpGeo);
