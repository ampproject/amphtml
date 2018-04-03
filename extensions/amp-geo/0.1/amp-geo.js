/**
 * Copyright 2015 The AMP HTML Authors. All Rights Reserved.
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
import {parseJson} from '../../../src/json';
import {parseQueryString_} from '../../../src/url-parse-query-string';
import {registerServiceBuilder} from '../../../src/service';
import {user} from '../../../src/log';
import {waitForBodyPromise} from '../../../src/dom';


/** @const */
const TAG = 'amp-geo';
/**
 * COUNTRY is a special const the magic string AMP_ISO_COUNTRY
 * is replaced at serving time with the two letter country code or
 * error value padded to length to avoid breaking .map files.  We
 * then trim it and store is as this.country_
 *
 * So don't change the magic string!
 */
const COUNTRY = 'AMP_ISO_COUNTRY';
const COUNTRY_PREFIX = 'amp-iso-country-';
const BIND_COUNTRY = 'ISOCountry';
const defaultLen = COUNTRY.length;

class AmpGeo extends AMP.BaseElement {

  /** @param {!AmpElement} element */
  constructor(element) {
    super(element);

    /** @private {Array<string>} */
    this.matchedGroups_ = [];
  }

  /** @override */
  isLayoutSupported(layout) {
    return layout == Layout.NODISPLAY;
  }

  /** @override */
  buildCallback() {
    const hashQuery = parseQueryString_(
        // location.originalHash is set by the viewer when it removes the fragment
        // from the URL.
        this.win.location.originalHash || this.win.location.hash);

    /** @private {string} */
    this.country_ = hashQuery['amp-geo'] &&
      (isCanary(this.win) || getMode(this.win).localDev) ?
      hashQuery['amp-geo'] : COUNTRY.trim();

    // Catch the case where we didn't get patched or we are on a local system
    // Note we can't use a string comparte becasue it will get overwritten when
    // the AMP_ISO_COUNTRY default is hot patched to the actual country.
    if (this.country_.length === defaultLen) {
      this.country_ = 'unknown';
    }

    // All geo config within the amp-geo component. There will be only
    // one single amp-geo allowed in page.
    const scripts = childElementsByTag(this.element, 'script');
    user().assert(scripts.length == 1,
        `${TAG} should have (only) one <script> child`);
    const script = scripts[0];
    user().assert(isJsonScriptTag(script),
        `${TAG} consent instance config should be put in a <script>` +
        'tag with type= "application/json"');
    const config = parseJson(script.textContent);

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
        if (config.ISOCountryGroups[groups[i]].includes(this.country_)) {
          this.matchedGroups_.push(groups[i]);
        }
      }
    }

    /** @private @const {!Promise<!Object<string, (string|bool)>>} */
    const geo = this.addToBody_(this.country_, this.matchedGroups_);

    registerServiceBuilder(this.win, 'geo', function() {
      return geo;
    });
  }


  /**
   * Adds the given country groups to HTML element as classes
   * @param {string} country
   * @param {!Array<string>} matchedGroups
   * @return {!Promise<Object<string, (string | bool)>>} service response
   * @private
   */
  addToBody_(country, matchedGroups) {
    const doc = this.win.document;
    const states = {};
    states[BIND_COUNTRY] = country;
    states.ISOCountryGroups = matchedGroups;
    return waitForBodyPromise(doc).then(() => {
      for (const group in matchedGroups) {
        doc.body.classList.add(matchedGroups[group]);
        states[matchedGroups[group]] = true;
      }
      doc.body.classList.add(COUNTRY_PREFIX + country);
      states.ISOCountryGroups = matchedGroups;
      const state = doc.createElement('amp-state');
      state.innerHTML = '<script type="application/json">' +
        JSON.stringify(states) + '</script>';
      state.id = 'ampGeo';
      doc.body.appendChild(state);
      //* TODO - lifecycle for amp-state ?/???

      return {ISOCountry: country, ISOCountryGroups: matchedGroups};
    });
  }
}

AMP.registerElement(TAG, AmpGeo);
