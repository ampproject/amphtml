/**
 * Copyright 2016 The AMP HTML Authors. All Rights Reserved.
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

import {ActionTrust} from '../../../src/action-constants';
import {LayoutPriority} from '../../../src/layout';
import {Services} from '../../../src/services';
import {
  UrlReplacementPolicy,
  batchFetchJsonFor,
} from '../../../src/batched-json';
import {dev, user} from '../../../src/log';
import {getSourceOrigin} from '../../../src/url';
import {isJsonScriptTag} from '../../../src/dom';
import {map} from '../../../src/utils/object';
import {toggle} from '../../../src/style';
import {tryParseJson} from '../../../src/json';

export class AmpState extends AMP.BaseElement {
  /** @override */
  getLayoutPriority() {
    // Loads after other content.
    return LayoutPriority.METADATA;
  }

  /** @override */
  isAlwaysFixed() {
    return true;
  }

  /** @override */
  isLayoutSupported(unusedLayout) {
    return true;
  }

  /** @override */
  activate(unusedInvocation) {
    // TODO(choumx): Remove this after a few weeks in production.
    const TAG = this.getName_();
    this.user().error(TAG,
        'Please use AMP.setState() action explicitly, e.g. ' +
        'on="submit-success:AMP.setState({myAmpState: event.response})"');
  }

  /** @override */
  buildCallback() {
    toggle(this.element, /* opt_display */ false);
    this.element.setAttribute('aria-hidden', 'true');

    // Don't parse or fetch in prerender mode.
    const viewer = Services.viewerForDoc(this.getAmpDoc());
    viewer.whenFirstVisible().then(() => this.initialize_());
  }

  /** @override */
  mutatedAttributesCallback(mutations) {
    const viewer = Services.viewerForDoc(this.getAmpDoc());
    if (!viewer.hasBeenVisible()) {
      const TAG = this.getName_();
      dev().error(TAG, 'Viewer must be visible before mutation.');
      return;
    }
    const src = mutations['src'];
    if (src !== undefined) {
      this.fetchAndUpdate_(/* isInit */ false);
    }
  }

  /** @override */
  renderOutsideViewport() {
    // We want the state data to be available wherever it is in the document.
    return true;
  }

  /** @private */
  initialize_() {
    const {element} = this;
    if (element.hasAttribute('overridable')) {
      Services.bindForDocOrNull(element).then(bind => {
        dev().assert(bind, 'Bind service can not be found.');
        bind.makeStateKeyOverridable(element.getAttribute('id'));
      });
    }
    // Parse child script tag and/or fetch JSON from endpoint at `src`
    // attribute, with the latter taking priority.
    const {children} = element;
    if (children.length > 0) {
      this.parseChildAndUpdateState_();
    }
    if (this.element.hasAttribute('src')) {
      this.fetchAndUpdate_(/* isInit */ true);
    }
    this.registerAction('refresh', () => {
      this.fetchAndUpdate_(/* isInit */ false, /* opt_refresh */ true);
    }, ActionTrust.HIGH);
  }


  /**
   * Parses JSON in child script element and updates state.
   * @private
   */
  parseChildAndUpdateState_() {
    const TAG = this.getName_();
    const {children} = this.element;
    if (children.length != 1) {
      this.user().error(
          TAG, 'Should contain exactly one <script> child.');
      return;
    }
    const firstChild = children[0];
    if (!isJsonScriptTag(firstChild)) {
      this.user().error(TAG,
          'State should be in a <script> tag with type="application/json".');
      return;
    }
    const json = tryParseJson(firstChild.textContent, e => {
      this.user().error(
          TAG, 'Failed to parse state. Is it valid JSON?', e);
    });
    this.updateState_(json, /* isInit */ true);
  }

  /**
   * Wrapper to stub during testing.
   * @param {!../../../src/service/ampdoc-impl.AmpDoc} ampdoc
   * @param {!Element} element
   * @param {boolean} isInit
   * @param {boolean=} opt_refresh
   * @return {!Promise}
   */
  fetch_(ampdoc, element, isInit, opt_refresh) {
    const src = element.getAttribute('src');

    // Require opt-in for URL variable replacements on CORS fetches triggered
    // by [src] mutation. @see spec/amp-var-substitutions.md
    let policy = UrlReplacementPolicy.OPT_IN;
    if (isInit ||
      (getSourceOrigin(src) == getSourceOrigin(ampdoc.win.location))) {
      policy = UrlReplacementPolicy.ALL;
    }
    return batchFetchJsonFor(
        ampdoc, element, /* opt_expr */ undefined, policy, opt_refresh);
  }

  /**
   * @param {boolean} isInit
   * @param {boolean=} opt_refresh
   * @return {!Promise}
   * @private
   */
  fetchAndUpdate_(isInit, opt_refresh) {
    const ampdoc = this.getAmpDoc();
    return this.fetch_(ampdoc, this.element, isInit, opt_refresh)
        .then(json => {
          this.updateState_(json, isInit);
        });
  }

  /**
   * @param {*} json
   * @param {boolean} isInit
   * @private
   */
  updateState_(json, isInit) {
    if (json === undefined || json === null) {
      return;
    }
    const id = user().assert(this.element.id, '<amp-state> must have an id.');
    const state = /** @type {!JsonObject} */ (map());
    state[id] = json;
    Services.bindForDocOrNull(this.element).then(bind => {
      dev().assert(bind, 'Bind service can not be found.');
      bind.setState(state,
          /* opt_skipEval */ isInit, /* opt_isAmpStateMutation */ !isInit);
    });
  }

  /**
   * @return {string} Returns a string to identify this tag. May not be unique
   *     if the element id is not unique.
   * @private
   */
  getName_() {
    return '<amp-state> ' +
        (this.element.getAttribute('id') || '<unknown id>');
  }
}
