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
import {dev, devAssert, userAssert} from '../../../src/log';
import {getSourceOrigin} from '../../../src/url';
import {getViewerAuthTokenIfAvailable} from '../../../src/utils/xhr-utils';
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
    const {children} = element;
    if (children.length > 0) {
      // Bind relies on this happening synchronously in buildCallback().
      this.parseAndUpdate_();
    }
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
   * @private
   */
  parseAndUpdate_() {
    const TAG = this.getName_();
    const {children} = this.element;
    if (children.length != 1) {
      this.user().error(TAG, 'Should contain exactly one <script> child.');
      return;
    }
    const firstChild = children[0];
    if (!isJsonScriptTag(firstChild)) {
      this.user().error(TAG,
          'State should be in a <script> tag with type="application/json".');
      return;
    }
    const json = tryParseJson(firstChild.textContent, e => {
      this.user().error(TAG, 'Failed to parse state. Is it valid JSON?', e);
    });
    this.updateState_(json, /* isInit */ true);
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
      this.fetch_(ampdoc, policy, opt_refresh, token).catch(() => {
        // Trigger "fetch-error" event on fetch failure.
        const actions = Services.actionServiceForDoc(element);
        actions.trigger(element, 'fetch-error', null, ActionTrust.LOW);
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
   * @private
   */
  updateState_(json, isInit) {
    if (json === undefined || json === null) {
      return;
    }
    const id = userAssert(this.element.id, '<amp-state> must have an id.');
    Services.bindForDocOrNull(this.element).then(bind => {
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
