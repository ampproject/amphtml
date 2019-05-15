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
import {createCustomEvent} from '../../../src/event-helper';
import {dev, devAssert, userAssert} from '../../../src/log';
import {dict, map} from '../../../src/utils/object';
import {getSourceOrigin} from '../../../src/url';
import {getViewerAuthTokenIfAvailable} from '../../../src/utils/xhr-utils';
import {isJsonScriptTag} from '../../../src/dom';
import {toggle} from '../../../src/style';
import {tryParseJson} from '../../../src/json';

export class AmpState extends AMP.BaseElement {
  /**
   * @param {!Element} element
   */
  constructor(element) {
    super(element);

    /**
     * JSON in child <script>, if any.
     * - `undefined` if the script has never been parsed.
     * - `null` or `!JsonObject` once the script has been parsed.
     * @private {?JsonObject|undefined}
     */
    this.localData_ = undefined;
  }

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
  buildCallback() {
    toggle(this.element, /* opt_display */ false);
    this.element.setAttribute('aria-hidden', 'true');

    const {element} = this;
    if (element.hasAttribute('overridable')) {
      Services.bindForDocOrNull(element).then(bind => {
        devAssert(bind);
        bind.addOverridableKey(element.getAttribute('id'));
      });
    }
    // Parse child <script> tag and/or fetch JSON from `src` attribute.
    // The latter is allowed to overwrite the former.
    this.parseAndUpdate();
    if (this.element.hasAttribute('src')) {
      this.fetchAndUpdate_(/* isInit */ true);
    }

    this.registerAction('refresh', () => {
      userAssert(this.element.hasAttribute('src'),
          'Can\'t refresh <amp-state> without "src" attribute.');
      this.fetchAndUpdate_(/* isInit */ false, /* opt_refresh */ true);
    }, ActionTrust.HIGH);
  }

  /** @override */
  mutatedAttributesCallback(mutations) {
    const viewer = Services.viewerForDoc(this.element);
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

  /**
   * Parses JSON in child <script> and updates state.
   * @return {!Promise}
   */
  parseAndUpdate() {
    if (this.localData_ === undefined) {
      this.localData_ = this.parse_();
      if (this.localData_) {
        return this.updateState_(this.localData_, /* isInit */ true);
      }
    }
    return Promise.resolve();
  }

  /**
   * Parses JSON in child <script> and returns it.
   * @return {?JsonObject}
   * @private
   */
  parse_() {
    const {children} = this.element;
    if (children.length == 0) {
      return null;
    }
    const TAG = this.getName_();
    if (children.length != 1) {
      this.user().error(TAG, 'Should contain exactly one <script> child.');
      return null;
    }
    const firstChild = children[0];
    if (!isJsonScriptTag(firstChild)) {
      this.user().error(TAG,
          'State should be in a <script> tag with type="application/json".');
      return null;
    }
    return tryParseJson(firstChild.textContent, e => {
      this.user().error(TAG, 'Failed to parse state. Is it valid JSON?', e);
    });
  }

  /**
   * Wrapper to stub during testing.
   * @param {!../../../src/service/ampdoc-impl.AmpDoc} ampdoc
   * @param {!UrlReplacementPolicy} policy
   * @param {boolean=} opt_refresh
   * @param {string=} token
   * @return {!Promise<!JsonObject|!Array<JsonObject>>}
   * @private
   */
  fetch_(ampdoc, policy, opt_refresh, token = undefined) {
    return batchFetchJsonFor(ampdoc, this.element, /* opt_expr */ undefined,
        policy, opt_refresh, token);
  }

  /**
   * Transforms and prepares the fetch request.
   * @param {boolean} isInit
   * @param {boolean=} opt_refresh
   * @return {!Promise<!JsonObject|!Array<JsonObject>>}
   */
  prepareAndSendFetch_(isInit, opt_refresh) {
    const {element} = this;
    const ampdoc = this.getAmpDoc();

    const src = element.getAttribute('src');
    const isCorsFetch =
        (getSourceOrigin(src) !== getSourceOrigin(ampdoc.win.location));
    // Require opt-in for URL variable replacements on CORS fetches triggered
    // by [src] mutation. @see spec/amp-var-substitutions.md
    const policy = (isCorsFetch && !isInit)
      ? UrlReplacementPolicy.OPT_IN
      : UrlReplacementPolicy.ALL;

    return getViewerAuthTokenIfAvailable(element).then(token =>
      this.fetch_(ampdoc, policy, opt_refresh, token).catch(error => {
        const event = error
          ? createCustomEvent(this.win, 'amp-state.error',
              dict({'response': error.response}))
          : null;
        // Trigger "fetch-error" event on fetch failure.
        const actions = Services.actionServiceForDoc(element);
        actions.trigger(element, 'fetch-error', event, ActionTrust.LOW);
      })
    );
  }

  /**
   * @param {boolean} isInit
   * @param {boolean=} opt_refresh
   * @return {!Promise<undefined>}
   * @private
   */
  fetchAndUpdate_(isInit, opt_refresh) {
    // Don't fetch in prerender mode.
    const viewer = Services.viewerForDoc(this.element);
    return viewer.whenFirstVisible()
        .then(() => this.prepareAndSendFetch_(isInit, opt_refresh))
        .then(json => this.updateState_(json, isInit));
  }

  /**
   * @param {*} json
   * @param {boolean} isInit
   * @return {!Promise}
   * @private
   */
  updateState_(json, isInit) {
    if (json === undefined || json === null) {
      return Promise.resolve();
    }
    const id = userAssert(this.element.id, '<amp-state> must have an id.');
    return Services.bindForDocOrNull(this.element).then(bind => {
      devAssert(bind);
      const state = /** @type {!JsonObject} */ (map());
      state[id] = json;
      // As a rule, initialization should skip evaluation.
      // If we're not initializing then this must be a mutation, so we must
      // skip <amp-state> evaluation to prevent update cycles.
      bind.setState(state, /* skipEval */ isInit, /* skipAmpState */ !isInit);
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
