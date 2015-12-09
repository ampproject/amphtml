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

import {isExperimentOn} from '../../../src/experiments';
import {Layout} from '../../../src/layout';
import {log} from '../../../src/log';
import {loadPromise} from '../../../src/event-helper';
import {urlReplacementsFor} from '../../../src/url-replacements';

import {addListener} from './instrumentation';
import {ANALYTICS_CONFIG} from './vendors';


/** @const */
const EXPERIMENT = 'amp-analytics';

export class AmpAnalytics extends AMP.BaseElement {

  /**
   * @return {boolean}
   * @private
   */
  isExperimentOn_() {
    return isExperimentOn(this.getWin(), EXPERIMENT);
  }

  /** @override */
  isLayoutSupported(layout) {
    return true;
  }

  /**
   * @override
   */
  createdCallback() {
    if (!this.isExperimentOn_()) {
      return;
    }

    /**
     * @const {!JSONObject} Copied here for tests.
     * @private
     */
    this.predefinedConfig_ = ANALYTICS_CONFIG;
  }

  /** @override */
  buildCallback() {
    if (!this.isExperimentOn_()) {
      return;
    }

    /**
     * @private {!JSONObject} The analytics config associated with the tag
     */
    this.config_ = this.mergeConfigs_();

    /**
     * @private {?string} Predefinedtype associated with the tag. If specified,
     * the config from the predefined type is merged with the inline config
     */
    this.type_ = null;

    /**
     * @private {Object<string, string>} A map of request names to the request
     * format string used by the tag to send data
     */
    this.requests_ = {};
    this.element.setAttribute('aria-hidden', 'true');

    if (this.hasOptedOut_()) {
      // Nothing to do when the user has opted out.
      log.fine(this.getName_(), "User has opted out. No hits will be sent.");
      return;
    }

    this.generateRequests_();

    if (!Array.isArray(this.config_['triggers'])) {
      log.error(this.getName_(), 'No triggers were found in the config. No ' +
          'analytics data will be sent.');
      return;
    }

    // Trigger callback can be synchronous. Do the registration at the end.
    for (let k = 0; k < this.config_['triggers'].length; k++) {
      const trigger = this.config_['triggers'][k];
      if (!trigger['on'] || !trigger['request']) {
        log.warn(this.getName_(), '"on" and "request" attributes are ' +
            'required for data to be collected.');
        continue;
      }
      addListener(this.getWin(), trigger['on'],
          this.handleEvent_.bind(this, trigger));
    }
  }

  /**
   * Merges various sources of configs and stores them in a member variable.
   *
   * Order of precedence for configs from highest to lowest:
   * - Remote config: specified through an attribute of the tag.
   * - Inline config: specified insize the tag.
   * - Predefined config: Defined as part of the platform.
   *
   * @return {!JSONObject} the merged config.
   * @private
   */
  mergeConfigs_() {
    // TODO(btownsend, #871): Implement support for remote configuration.
    const remote = {};

    let inline = {};
    try {
      inline = JSON.parse(this.element.textContent);
    }
    catch (er) {
      log.warn(this.getName(), "Analytics config could not be parsed.");
    }
    const config = this.predefinedConfig_[this.element.getAttribute('type')]
        || {};
    return this.mergeObjects_(remote, this.mergeObjects_(inline, config));
  }

  /**
   * @return {boolean} true if the user has opted out.
   */
  hasOptedOut_() {
    if (!this.config_['optout']) {
      return false;
    }

    const props = this.config_['optout'].split('.');
    let k = this.getWin();
    for (let i = 0; i < props.length; i++) {
      if (!k) {
        return false;
      }
      k = k[props[i]];
    }
    return k();
  }

  /**
   * Goes through all the requests in predefined vendor config and tag's config
   * and creates a map of request name to request template. These requests can
   * then be used while sending a request to a server.
   *
   * @private
   */
  generateRequests_() {
    const requests = {};
    if (!this.config_ || !this.config_['requests']) {
      log.error(this.getName_(), 'No request strings defined. Analytics data ' +
          'will not be sent from this page.');
      return;
    }

    for (const k in this.config_['requests']) {
      if (this.config_['requests'].hasOwnProperty(k)) {
        requests[k] = this.config_['requests'][k];
      }
    }
    this.requests_ = requests;

    // Now replace any request templates with their values.
    const all = Object.keys(this.requests_).join('|');
    const requestExpr = new RegExp('\{(' + all + ')\}', 'g');
    for (const k in this.requests_) {
      this.requests_[k] = this.expandRequest_(this.requests_[k], requestExpr,
          this.requests_, 5);
    }
  }

  /**
   * Replaces template variables corresponding to a request with the value of
   * that request. If no request is found, an empty string is inserted instead.
   *
   * @param {string} formatString The request string to be expanded
   * @param {!RegExp} expression The regular expression used to detect request
   *          templates
   * @param {!Object<string, string> requests Map of requests to lookup template
   *          values from
   * @param {number} depth Depth of recursion for nested templates
   * @return {string} the expanded request string
   * @private
   */
  expandRequest_(formatString, expression, requests, depth) {
    if (depth <= 0) {
      return '';
    }
    depth--;
    return formatString.replace(expression, (match, name) => {
      return this.expandRequest_(requests[name], expression, requests, depth) ||
          '';
    });
  }

  /**
   * Callback for events that are registered by the config's triggers. This
   * method generates the request and sends the request out.
   *
   * @param {!JSONObject} trigger JSON config block that resulted in this event.
   * @param {!Object} event Object with details about the event.
   * @private
   */
  handleEvent_(trigger, event) {
    const host = this.config_['host'];
    let request = this.requests_[trigger['request']];
    if (!host || !request) {
      return;
    }

    // TODO(btownsend, #871): Add support for variables from inline config.
    request = urlReplacementsFor(this.getWin()).expand(request);

    // TODO(btownsend, #1061): Add support for sendBeacon.
    if (host && request) {
      this.sendRequest_('https://' + host + request);
    }
  }

  /**
   * Sends a request via GET method.
   *
   * @param {!string} request The request to be sent over wire.
   * @private
   */
  sendRequest_(request) {
    const image = new Image();
    image.src = request;
    image.width = 1;
    image.height = 1;
    loadPromise(image).then(() => {
      log.fine(this.getName_(), 'Sent request: ', request);
    }).catch(() => {
      log.warn(this.getName_(), 'Failed to send request: ', request);
    });
  }

  /**
   * @return {string} Returns a string to identify this tag. May not be unique
   * if the element id is not unique.
   * @private
   */
  getName_() {
    return 'AmpAnalytics ' +
        (this.element.getAttribute('id') || '<unknown id>');
  }

  /**
   * Merges two objects. If the value is array or plain object, the values are
   * merged otherwise the value is overwritten.
   *
   * @param {Object|Array} from Object or array to merge from
   * @param {Object|Array} to Object or Array to merge into
   * @private
   */
  mergeObjects_(from, to) {
    // Checks if the given object is a plain object.
    const isObject = function(someObj) {
      return Object.prototype.toString.call(someObj) === '[object Object]';
    };

    if (to === null || to === undefined) {
      return from;
    }

    for (const property in from) {
      if (from.hasOwnProperty(property)) {
        // Only deal with own properties.
        if (Array.isArray(from[property])) {
          if (!Array.isArray(to[property])) {
            to[property] = [];
          }
          to[property] = this.mergeObjects_(from[property], to[property]);
        } else if (isObject(from[property])) {
          if (!isObject(to[property])) {
            to[property] = {};
          }
          to[property] = this.mergeObjects_(from[property],
              to[property]);
        } else {
          to[property] = from[property];
        }
      }
    }
    return to;
  }
}

AMP.registerElement('amp-analytics', AmpAnalytics);
