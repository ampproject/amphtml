import {ActionTrust_Enum} from '#core/constants/action-constants';
import {Deferred} from '#core/data-structures/promise';
import {isJsonScriptTag} from '#core/dom';
import {LayoutPriority_Enum} from '#core/dom/layout';
import {toggle} from '#core/dom/style';
import {map} from '#core/types/object';
import {tryParseJson} from '#core/types/object/json';

import {Services} from '#service';

import {createCustomEvent} from '#utils/event-helper';
import {dev, devAssert, userAssert} from '#utils/log';

import {
  UrlReplacementPolicy_Enum,
  batchFetchJsonFor,
} from '../../../src/batched-json';
import {getSourceOrigin} from '../../../src/url';

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

    /** @private {!Deferred} */
    this.loadingDeferred_ = new Deferred();
  }

  /** @override */
  getLayoutPriority() {
    // Loads after other content.
    return LayoutPriority_Enum.METADATA;
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
      Services.bindForDocOrNull(element).then((bind) => {
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
      userAssert(
        this.element.hasAttribute('src'),
        'Can\'t refresh <amp-state> without "src" attribute.'
      );
      this.fetchAndUpdate_(/* isInit */ false, /* opt_refresh */ true);
    });
  }

  /** @override */
  mutatedAttributesCallback(mutations) {
    if (!this.getAmpDoc().hasBeenVisible()) {
      const TAG = this.getName_();
      dev().error(TAG, 'ampdoc must be visible before mutation.');
      return;
    }
    // "src" attribute may be missing if mutated with a non-primitive.
    if (mutations['src'] !== undefined && this.element.hasAttribute('src')) {
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
      if (this.localData_ !== null) {
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
      this.user().error(
        TAG,
        'State should be in a <script> tag with type="application/json".'
      );
      return null;
    }
    return tryParseJson(firstChild.textContent, (e) => {
      this.user().error(TAG, 'Failed to parse state. Is it valid JSON?', e);
    });
  }

  /**
   * Wrapper to stub during testing.
   * @param {!../../../src/service/ampdoc-impl.AmpDoc} ampdoc
   * @param {!UrlReplacementPolicy_Enum} policy
   * @param {boolean=} opt_refresh
   * @return {!Promise<!JsonObject|!Array<JsonObject>>}
   * @private
   */
  fetch_(ampdoc, policy, opt_refresh) {
    return batchFetchJsonFor(ampdoc, this.element, {
      urlReplacement: policy,
      refresh: opt_refresh,
    });
  }

  /**
   * Transforms and prepares the fetch request.
   * @param {boolean} isInit
   * @param {boolean=} opt_refresh
   * @return {!Promise<!JsonObject|!Array<JsonObject>|undefined>}
   */
  prepareAndSendFetch_(isInit, opt_refresh) {
    const {element} = this;
    const ampdoc = this.getAmpDoc();

    const src = element.getAttribute('src');
    const isCorsFetch =
      getSourceOrigin(src) !== getSourceOrigin(ampdoc.win.location);
    // Require opt-in for URL variable replacements on CORS fetches triggered
    // by [src] mutation. @see spec/amp-var-substitutions.md
    const policy =
      isCorsFetch && !isInit
        ? UrlReplacementPolicy_Enum.OPT_IN
        : UrlReplacementPolicy_Enum.ALL;

    return this.fetch_(ampdoc, policy, opt_refresh).catch((error) => {
      const event = error
        ? createCustomEvent(this.win, 'amp-state.error', {
            'response': error.response,
          })
        : null;
      // Trigger "fetch-error" event on fetch failure.
      const actions = Services.actionServiceForDoc(element);
      actions.trigger(element, 'fetch-error', event, ActionTrust_Enum.LOW);
    });
  }

  /**
   * @param {boolean} isInit
   * @param {boolean=} opt_refresh
   * @return {!Promise}
   * @private
   */
  fetchAndUpdate_(isInit, opt_refresh) {
    // On init, we reuse the deferred created in the constructor.
    if (!isInit) {
      this.loadingDeferred_ = new Deferred();
    }

    // Store the deferred locally, in case a new fetch overwrites
    // it before resolution.
    const loadingDeferred = this.loadingDeferred_;

    // Don't fetch in prerender mode.
    return this.getAmpDoc()
      .whenFirstVisible()
      .then(() => this.prepareAndSendFetch_(isInit, opt_refresh))
      .then((json) => this.updateState_(json, isInit))
      .then(() => loadingDeferred.resolve())
      .catch((err) => {
        loadingDeferred.resolve();
        throw err;
      });
  }

  /**
   * For an "amp-state" with a src attribute, this returns a promise that
   * resolves after the fetch and update completes. For non-src "amp-state"s,
   * return a resolved promise.
   *
   * @return {!Promise}
   */
  getFetchingPromise() {
    if (!this.element.hasAttribute('src')) {
      return Promise.resolve();
    }
    return this.loadingDeferred_.promise;
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
    return Services.bindForDocOrNull(this.element).then((bind) => {
      devAssert(bind);
      const state = /** @type {!JsonObject} */ (map());
      state[id] = json;
      // As a rule, initialization should skip evaluation.
      // If we're not initializing then this must be a mutation, so we must
      // skip <amp-state> evaluation to prevent update cycles.
      bind.setState(state, {skipEval: isInit, skipAmpState: !isInit});
    });
  }

  /**
   * @return {string} Returns a string to identify this tag. May not be unique
   *     if the element id is not unique.
   * @private
   */
  getName_() {
    return '<amp-state> ' + (this.element.getAttribute('id') || '<unknown id>');
  }
}
