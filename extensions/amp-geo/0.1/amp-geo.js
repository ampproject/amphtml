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
import {getMode} from '../../../src/mode';
import {isArray, isObject} from '../../../src/types';
import {isCanary} from '../../../src/experiments';
import {isJsonScriptTag} from '../../../src/dom';
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
const COUNTRY = '{{AMP_ISO_COUNTRY_HOTPATCH}}';
const COUNTRY_PREFIX = 'amp-iso-country-';
const GROUP_PREFIX = 'amp-geo-group-';
const PRE_RENDER_REGEX = new RegExp(`${COUNTRY_PREFIX}(\\w+)`);
const GEO_ID = 'ampGeo';

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
    // All geo config within the amp-geo component.
    // The validator only allows one amp-geo per page
    const children = this.element.children;

    if (children.length) {
      user().assert(children.length === 1 &&
        isJsonScriptTag(children[0]),
      `${TAG} can only have one <script type="application/json"> child`);
    }

    /** @private @const {!Promise<!Object<string, (string|Array<string>)>>} */
    const geo = this.addToBody_(
        children.length ?
          parseJson(children[0].textContent) : {});

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
      this.country_ = getMode(this.win).geoOverride ;
    }
  }
  /**
   * Find matching country groups
   * @param {Object} config
   */
  matchCountryGroups_(config) {
    /* ISOCountryGroups are optional but if specified at least one must exist  */
    /** @private @const {!Object<string, Array<string>>} */
    const ISOCountryGroups = config.ISOCountryGroups;
    const errorPrefix = '<amp-geo> ISOCountryGroups'; // code size
    if (ISOCountryGroups) {
      user().assert(
          isObject(ISOCountryGroups),
          `${errorPrefix} must be an object`);
      Object.keys(ISOCountryGroups).forEach(group => {
        user().assert(
            /^[a-z]+[a-z0-9]*$/i.test(group) &&
            !/^amp/.test(group),
            `${errorPrefix}[${group}] name is invalid`);
        user().assert(
            isArray(ISOCountryGroups[group]),
            `${errorPrefix}[${group}] must be an array`);
        if (ISOCountryGroups[group].includes(this.country_)) {
          this.matchedGroups_.push(group);
        }
      });
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
   * @return {!Promise<!Object<string, (string|Array<string>)>>} service response
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

          // Only include amp state if user requests it to avoid validator issue
          // with missing amp-bind js
          if (config.AmpBind) {
            const state = doc.createElement('amp-state');
            const confScript = doc.createElement('script');
            confScript.setAttribute('type', 'application/json');
            confScript.textContent =
                JSON.stringify(/** @type {!JsonObject} */(states)) ;
            state.appendChild(confScript);
            state.id = GEO_ID;
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
