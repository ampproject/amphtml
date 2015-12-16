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
import {installCidService} from '../../../src/service/cid-impl';
import {Layout} from '../../../src/layout';
import {log} from '../../../src/log';
import {loadPromise} from '../../../src/event-helper';
import {urlReplacementsFor} from '../../../src/url-replacements';
import {expandTemplate} from '../../../src/string';

import {addListener} from './instrumentation';
import {ANALYTICS_CONFIG} from './vendors';


installCidService(AMP.win);

/**
 * A request template object, extracted from an amp-analytics config block.
 * @typedef {{host: string, path: string, data: string}}
 */
let RequestData;


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
  layoutCallback() {
    if (!this.isExperimentOn_()) {
      return Promise.resolve();
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
     * @private {Object<string, !RequestData>} Maps request names to configs.
     */
    this.requests_ = {};

    this.element.setAttribute('aria-hidden', 'true');

    if (this.hasOptedOut_()) {
      // Nothing to do when the user has opted out.
      log.fine(this.getName_(), 'User has opted out. No hits will be sent.');
      return Promise.resolve();
    }

    this.generateRequests_();

    if (!Array.isArray(this.config_['triggers'])) {
      log.error(this.getName_(), 'No triggers were found in the config. No ' +
          'analytics data will be sent.');
      return Promise.resolve();
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
    return Promise.resolve();
  }

  /**
   * Merges various sources of configs and stores them in a member variable.
   *
   * Order of precedence for configs from highest to lowest:
   * - Remote config: specified through an attribute of the tag.
   * - Inline config: specified insize the tag.
   * - Predefined config: Defined as part of the platform.
   * - Default config: Built-in config shared by all amp-analytics tags.
   *
   * @return {!JSONObject} the merged config.
   * @private
   */
  mergeConfigs_() {
    // TODO(btownsend, #871): Implement support for remote configuration.
    const remoteConfig = {};
    let inlineConfig = {};
    try {
      const children = this.element.children;
      if (children.length == 1) {
        const child = children[0];
        if (child.tagName.toUpperCase() == 'SCRIPT' &&
            child.getAttribute('type').toUpperCase() == 'APPLICATION/JSON') {
          inlineConfig = JSON.parse(children[0].textContent);
        } else {
          log.warn(this.getName_(), 'The analytics config should be put in a ' +
              '<script> tag with type=application/json');
        }
      } else if (children.length > 1) {
        log.warn(this.getName_(),
            'The tag should contain only one <script> child.');
      }
    }
    catch (er) {
      log.warn(this.getName_(), 'Analytics config could not be parsed. ' +
          'Is it in a valid JSON format?', er);
    }

    const config = {};
    const defaultConfig = this.predefinedConfig_['default'] || {};
    const typeConfig = this.predefinedConfig_[
      this.element.getAttribute('type')] || {};

    config['vars'] = config['vars'] || {};

    this.mergeObjects_(defaultConfig, config);
    this.mergeObjects_(typeConfig, config);
    this.mergeObjects_(inlineConfig, config);
    this.mergeObjects_(remoteConfig, config);
    return config;
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
        requests[k] = this.normalizeRequest_(
            this.config_['requests'][k],
            this.config_['host'],
            this.config_['path'] || '');
      }
    }
    this.requests_ = requests;

    // Expand any placeholders. For requests, we expand each string up to 5
    // times to support nested requests. Leave any unresolved placeholders.
    for (const k in this.requests_) {
      this.requests_[k].data = expandTemplate(this.requests_[k].data, key => {
        return this.requests_[key] && this.requests_[key].data ||
            '${' + key + '}';
      }, 5);
    }
  }

  /**
   * The amp-analytics config block supports two formats for specifying a
   * request template - either a single string value, or an object specifying
   * a host, path, and data strings. This method normalizes both forms into
   * a RequestData object.
   * @param {string} request The request value from config.
   * @param {string} defaultHost The default host value to use if the given
   *   request does not provide an overridden host.
   * @param {string} defaultPath The default path value to use if the given
   *   request does not provide an overriden path.
   * @return {!RequestData}
   */
  normalizeRequest_(request, defaultHost, defaultPath) {
    if (request['host'] || request['path'] || request['data']) {
      return {
        host: request['host'] || defaultHost,
        path: request['path'] || defaultPath,
        data: request['data'] || ''
      };
    } else {
      return {host: defaultHost, path: defaultPath, data: request};
    }
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
    const request = this.requests_[trigger['request']];
    if (!request) {
      log.warn(this.getName_(),
          'No request template found matching trigger.request value: ',
          trigger['request']);
      return;
    }

    // Replace placeholders with URI encoded values.
    // Precedence is trigger.vars > config.vars.
    // Nested expansion not supported.
    const data = expandTemplate(request.data, key => {
      const match = key.match(/([^(]*)(\([^)]*\))?/);
      const name = match[1];
      const argList = match[2] || '';
      const val = encodeURIComponent(
          (trigger['vars'] && trigger['vars'][name]) ||
          (this.config_['vars'] && this.config_['vars'][name]) || '');
      return val + argList;
    });

    // For consistentcy with amp-pixel we also expand any url replacements.
    urlReplacementsFor(this.getWin()).expand(data).then(data => {
      this.sendRequest_({host: request.host, path: request.path, data: data});
    });
  }

  /**
   * @param {!RequestData}
   * @private
   */
  sendRequest_(request) {
    if (!request.host) {
      log.warn(this.getName_(),
          'Failed to send request. No host specified in config.');
      return;
    }
    const transport = this.config_['transport'] || 'image';
    if (transport == 'image') {
      this.sendRequestUsingImage_(
          'https://' + request.host + request.path + request.data);
    } else if (transport == 'beacon') {
      this.sendRequestUsingBeacon_(
          'https://' + request.host + request.path, request.data);
    } else {
      log.warn(this.getName_(),
          'Failed to send request. Unsupported transport: ', transport);
    }
  }

  /**
   * Transmits a POST request using navigator.sendBeacon.
   * @param {string} url
   * @param {string} data
   * @private
   */
  sendRequestUsingBeacon_(url, data) {
    this.getWin().navigator.sendBeacon(url, data);
    log.fine(this.getName_(), 'Sent beacon: ', url, data);
  }

  /**
   * Transmits a GET request using an Image tag.
   * @param {string} url The full url to load.
   * @private
   */
  sendRequestUsingImage_(url) {
    const image = new Image();
    image.src = url;
    image.width = 1;
    image.height = 1;
    loadPromise(image).then(() => {
      log.fine(this.getName_(), 'Sent request: ', url);
    }).catch(() => {
      log.warn(this.getName_(), 'Failed to send request: ', url);
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
