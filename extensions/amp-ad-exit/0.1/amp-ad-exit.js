/**
 * Copyright 2017 The AMP HTML Authors. All Rights Reserved.
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

import {ClickDelayFilter} from './filters/click-delay';
import {assertConfig, TransportMode} from './config';
import {createFilter} from './filters/factory';
import {isExperimentOn} from '../../../src/experiments';
import {isJsonScriptTag, openWindowDialog} from '../../../src/dom';
import {urlReplacementsForDoc} from '../../../src/services';
import {user} from '../../../src/log';

const TAG = 'amp-ad-exit';

/**
 * @typedef {{
 *   finalUrl: string,
 *   trackingUrls: !Array<string>,
 *   vars: !./config.Variables,
 *   filters: !Array<!./filters/filter.Filter>
 * }}
 */
let NavigationTarget;  // eslint-disable-line no-unused-vars

export class AmpAdExit extends AMP.BaseElement {
  /** @param {!AmpElement} element */
  constructor(element) {
    super(element);

    /**
     * @private @const {!Object<string, !NavigationTarget>}
     */
    this.targets_ = {};

    /**
     * Filters to apply to every target.
     * @private @const {!Array<!./filters/filter.Filter>}
     */
    this.defaultFilters_ = [new ClickDelayFilter('minDelay', 1000)];

    /** @private @struct */
    this.transport_ = {
      beacon: true,
      image: true,
    };

    this.registerAction('exit', this.exit.bind(this));
  }

  /**
   * @param {!../../../src/service/action-impl.ActionInvocation} invocation
   */
  exit({args, event}) {
    user().assert(
        isExperimentOn(this.win, 'amp-ad-exit'),
        'amp-ad-exit experiment is off.');

    const target = this.targets_[args.target];
    user().assert(target, `Exit target not found: '${args.target}'`);

    event.preventDefault();
    if (!this.filter_(this.defaultFilters_, event) ||
        !this.filter_(target.filters, event)) {
      return;
    }
    const substituteVariables =
        this.getUrlVariableRewriter_(args, event, target);
    if (target.trackingUrls) {
      target.trackingUrls.map(substituteVariables)
          .forEach(url => this.pingTrackingUrl_(url));
    }
    openWindowDialog(this.win, substituteVariables(target.finalUrl), '_blank');
  }


  /**
   * @param {!Object<string, string|number|boolean>} args
   * @param {!../../../src/service/action-impl.ActionEventDef} event
   * @param {!NavigationTarget} target
   * @return {function(string): string}
   */
  getUrlVariableRewriter_(args, event, target) {
    const vars = {
      'CLICK_X': () => event.clientX,
      'CLICK_Y': () => event.clientY,
    };
    const whitelist = {
      'RANDOM': true,
      'CLICK_X': true,
      'CLICK_Y': true,
    };
    if (target.vars) {
      for (const customVar in target.vars) {
        if (customVar[0] == '_') {
          vars[customVar] = () =>
              args[customVar] || target.vars[customVar].defaultValue;
          whitelist[customVar] = true;
        }
      }
    }
    const replacements = urlReplacementsForDoc(this.getAmpDoc());
    return url => replacements.expandUrlSync(
        url, vars, undefined /* opt_collectVars */, whitelist);
  }

  /**
   * Attemts to issue a request to `url` to report the click. The request method
   * depends on the exit config's transport property. navigator.sendBeacon will
   * be tried if transport.beacon is `true` or `undefined`. Otherwise, or if
   * sendBeacon returns false, an image request will be made.
   * @param {string} url
   */
  pingTrackingUrl_(url) {
    user().fine(TAG, `pinging ${url}`);
    if (this.transport_.beacon &&
        this.win.navigator.sendBeacon &&
        this.win.navigator.sendBeacon(url, '')) {
      return;
    }
    if (this.transport_.image) {
      const req = this.win.document.createElement('img');
      req.src = url;
      return;
    }
  }

  /**
   * Checks the click event against the given filters. Returns true if the event
   * passes.
   * @param {!Array<!./filters/filter.Filter>} filters
   * @param {!../../../src/service/action-impl.ActionEventDef} event
   * @returns {boolean}
   */
  filter_(filters, event) {
    return filters.every(filter => {
      const result = filter.filter(event);
      user().info(TAG, `Filter '${filter.name}': ${result ? 'pass' : 'fail'}`);
      return result;
    });
  }

  /** @override */
  buildCallback() {
    this.element.setAttribute('aria-hidden', 'true');

    this.defaultFilters_.forEach(f => f.buildCallback());

    const children = this.element.children;
    if (children.length != 1) {
      throw new Error('The tag should contain exactly one <script> child.');
    }
    const child = children[0];
    if (!isJsonScriptTag(child)) {
      throw new Error(
          'The amp-ad-exit config should ' +
          'be put in a <script> tag with type="application/json"');
    }
    try {
      const config = assertConfig(JSON.parse(child.textContent));
      const userFilters = {};
      for (const name in config.filters) {
        const filter = createFilter(name, config.filters[name]);
        filter.buildCallback();
        userFilters[name] = filter;
      }
      for (const name in config.targets) {
        const target = config.targets[name];
        this.targets_[name] = {
          finalUrl: target.finalUrl,
          trackingUrls: target.trackingUrls || [],
          vars: target.vars || {},
          filters:
              (target.filters || []).map(f => userFilters[f]).filter(f => f),
        };
      }
      this.transport_.beacon = config.transport[TransportMode.BEACON] !== false;
      this.transport_.image = config.transport[TransportMode.IMAGE] !== false;
    } catch (e) {
      user().error(TAG, 'Invalid JSON config', e);
      throw e;
    }
  }

  /** @override */
  isLayoutSupported(unused) {
    return true;
  }
}

AMP.registerElement('amp-ad-exit', AmpAdExit);
