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

import {assertConfig, TransportMode} from './config';
import {user} from '../../../src/log';
import {urlReplacementsForDoc} from '../../../src/services';
import {isJsonScriptTag, openWindowDialog} from '../../../src/dom';
import {FilterType} from './filters/filter';
import {ClickDelayFilter, makeClickDelaySpec} from './filters/click-delay';

const TAG = 'amp-ad-exit';

export class AmpAdExit extends AMP.BaseElement {
  /** @param {!AmpElement} element */
  constructor(element) {
    super(element);

    /** @private {!./config.AmpAdExitConfig} */
    this.config_ = {targets: {}, filters: {}};

    this.defaultFilterSpecs_ = {
      'mindelay': makeClickDelaySpec(1000),
    };

    this.clickDelayFilter_ = new ClickDelayFilter();

    this.registerAction('exit', this.exit.bind(this));
  }

  /**
   * @param {!../../../src/service/action-impl.ActionInvocation} invocation
   */
  exit({args, event}) {
    event.preventDefault();
    const targetName = args.target;
    const target = this.config_.targets[targetName];
    if (!target) {
      user().error(TAG, `Exit target not found: '${targetName}'`);
      return;
    }
    if (!this.filter_(
            Object.keys(this.defaultFilterSpecs_), this.defaultFilterSpecs_,
            event) ||
        !this.filter_(target.filters, this.config_.filters, event)) {
      user().info(TAG, 'Click deemed unintenful');
      return;
    }
    const substituteVariables =
        this.getUrlVariableRewriter_(args, event, target);
    if (target.tracking_urls) {
      target.tracking_urls.map(substituteVariables)
          .forEach(url => this.pingTrackingUrl_(url));
    }
    openWindowDialog(this.win, substituteVariables(target.final_url), '_blank');
  }


  /**
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
        if (customVar.startsWith('_')) {
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

  pingTrackingUrl_(url) {
    user().fine(TAG, `pinging ${url}`);
    const useBeacon = this.config_.transport[TransportMode.BEACON] == true ||
        !this.config_.transport.hasOwnProperty(TransportMode.BEACON);
    if (useBeacon &&
        this.win.navigator.sendBeacon &&
        this.win.navigator.sendBeacon(url, '')) {
      return;
    }
    const req = this.win.document.createElement('img');
    req.src = url;
  }

  /**
   * Checks the click event against the given filters. Returns true if the event
   * passes.
   * @param {!Array<string>} names
   * @param {!Object<string, !./config.FilterConfig>} specs
   * @param {!Event} event
   * @returns {boolean}
   */
  filter_(names, specs, event) {
    if (!names) { return true; }
    return names.every(name => {
      const spec = specs[name];
      if (!spec) {
        user().warn(TAG, `Filter '${name}' not found`);
        return true;
      }
      const filter = this.findFilterForType_(spec.type);
      if (!filter) {
        user().warn(
            TAG, `Invalid filter type '${spec.type}' for filter '${name}'`);
        return true;
      }
      const result = filter.filter(spec, event);
      user().info(TAG, `Filter '${name}': ${result ? 'pass' : 'fail'}`);
      return result;
    });
  }

  /** @return {?./filters/filter.Filter} */
  findFilterForType_(type) {
    switch (type) {
      case FilterType.CLICK_DELAY:
        return this.clickDelayFilter_;
      case FilterType.CLICK_LOCATION:
        // TODO(clawr): implement this.
      default:
        return null;
    }
  }

  /** @override */
  buildCallback() {
    this.element.setAttribute('aria-hidden', 'true');

    try {
      const children = this.element.children;
      if (children.length != 1) {
        throw new Error('The tag should contain exactly one <script> child.');
      }
      const child = children[0];
      if (isJsonScriptTag(child)) {
        this.config_ = assertConfig(JSON.parse(child.textContent));
      } else {
        throw new Error(
            'The amp-ad-exit config should ' +
            'be put in a <script> tag with type="application/json"');
      }
    }
    catch (e) {
      user().error(TAG, 'Invalid JSON config', e);
      throw e;
    }
  }

  /** @override */
  viewportCallback(inViewport) {
    if (inViewport) {
      this.clickDelayFilter_.resetClock();
    }
  }

  /** @override */
  isLayoutSupported(unused) {
    return true;
  }
}

AMP.registerElement('amp-ad-exit', AmpAdExit);
