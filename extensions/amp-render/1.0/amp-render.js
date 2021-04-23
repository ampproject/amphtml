/**
 * Copyright 2021 The AMP HTML Authors. All Rights Reserved.
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

import {BaseElement} from './base-element';
import {
  BatchFetchOptionsDef,
  UrlReplacementPolicy,
  batchFetchJsonFor,
} from '../../../src/batched-json';
import {Services} from '../../../src/services';
import {dev, user, userAssert} from '../../../src/log';
import {dict} from '../../../src/core/types/object';
import {getSourceOrigin, isAmpScriptUri} from '../../../src/url';
import {isExperimentOn} from '../../../src/experiments';

/** @const {string} */
const TAG = 'amp-render';

const AMP_STATE_URI_SCHEME = 'amp-state:';

/**
 * Returns true if element's src points to amp-state.
 * @param {?string} src
 * @return {boolean}
 */
const isAmpStateSrc = (src) => src && src.startsWith(AMP_STATE_URI_SCHEME);

/**
 * Gets the json from an "amp-state:" uri. For example, src="amp-state:json.path".
 *
 * TODO: this is similar to the implementation in amp-list. Move it
 * to a common file and import it.
 *
 * @param {!AmpElement} element
 * @param {string} src
 * @return {Promise<!JsonObject>}
 */
const getAmpStateJson = (element, src) => {
  return Services.bindForDocOrNull(element)
    .then((bind) => {
      userAssert(bind, '"amp-state:" URLs require amp-bind to be installed.');
      const ampStatePath = src.slice(AMP_STATE_URI_SCHEME.length);
      return bind.getStateAsync(ampStatePath).catch((err) => {
        const stateKey = ampStatePath.split('.')[0];
        user().error(
          TAG,
          `'amp-state' element with id '${stateKey}' was not found.`
        );
        throw err;
      });
    })
    .then((json) => {
      userAssert(
        json !== undefined,
        `[amp-render] No data was found at provided uri: ${src}`
      );
      return json;
    });
};

/**
 * @param {!AmpElement} element
 * @param {?string} initialSrc
 * @return {!UrlReplacementPolicy}
 */
function getUrlReplacementPolicy(element, initialSrc) {
  const src = element.getAttribute('src');
  // Require opt-in for URL variable replacements on CORS fetches triggered
  // by [src] mutation. @see spec/amp-var-substitutions.md
  let policy = UrlReplacementPolicy.OPT_IN;
  if (
    src === initialSrc ||
    getSourceOrigin(src) === getSourceOrigin(element.getAmpDoc().win.location)
  ) {
    policy = UrlReplacementPolicy.ALL;
  }
  return policy;
}

/**
 * @param {!AmpElement} element
 * @param {boolean} shouldRefresh true to force refresh of browser cache.
 * @param urlReplacementPolicy
 * @return {!BatchFetchOptionsDef} options object to pass to `batchFetchJsonFor` method.
 */
function buildOptionsObject(
  element,
  shouldRefresh = false,
  urlReplacementPolicy = null
) {
  return {
    xssiPrefix: element.getAttribute('xssi-prefix'),
    expr: element.getAttribute('key') ?? '.',
    refresh: shouldRefresh,
    urlReplacement: urlReplacementPolicy,
  };
}

/**
 * Returns a function to fetch json from remote url, amp-state or
 * amp-script.
 *
 * @param {!AmpElement} element
 * @param urlReplacementPolicy
 * @return {Function}
 */
export function getJsonFn(element, urlReplacementPolicy) {
  console.log({urlReplacementPolicy});
  const src = element.getAttribute('src');
  if (!src) {
    // TODO(dmanek): assert that src is provided instead of silently failing below.
    return () => {};
  }
  if (isAmpStateSrc(src)) {
    return (src) => getAmpStateJson(element, src);
  }
  if (isAmpScriptUri(src)) {
    return (src) =>
      Services.scriptForDocOrNull(element).then((ampScriptService) => {
        userAssert(ampScriptService, 'AMP-SCRIPT is not installed');
        return ampScriptService.fetch(src);
      });
  }
  return (unusedSrc, shouldRefresh = false) =>
    batchFetchJsonFor(
      element.getAmpDoc(),
      element,
      buildOptionsObject(element, shouldRefresh, urlReplacementPolicy)
    );
}

export class AmpRender extends BaseElement {
  /** @param {!AmpElement} element */
  constructor(element) {
    super(element);

    // console.log('constr');

    /** @private {?../../../src/service/template-impl.Templates} */
    this.templates_ = null;

    /** @private {?Element} */
    this.template_ = null;

    /** @private {?string} */
    this.initialSrc_ = this.element.getAttribute('src');

    // /** @private {UrlReplacementPolicy} */
    // this.urlReplacementPolicy_ = UrlReplacementPolicy.OPT_IN;
  }

  /** @override */
  isLayoutSupported(layout) {
    userAssert(
      isExperimentOn(this.win, 'amp-render'),
      'Experiment "amp-render" is not turned on.'
    );
    return super.isLayoutSupported(layout);
  }

  /** @override */
  init() {
    // console.log('init');
    this.registerApiAction('refresh', (api) => {
      const src = this.element.getAttribute('src');
      // There is an alternative way to do this using `mutationObserverCallback` while using a boolean
      // variable `canRefresh`. See https://github.com/ampproject/amphtml/pull/33776#discussion_r614087734
      // for more context. This approach may be better if src does not mutate often. But the alternative might
      // be better if src mutatates often and component user does not use `refresh` action.
      if (!src || isAmpStateSrc(src) || isAmpScriptUri(src)) {
        return;
      }
      api.refresh();
    });

    return dict({
      // 'getJson': this.getJsonFn_(this.element),
      'getJson': this.getJsonFn_(),
    });
  }

  /** @override */
  mutationObserverCallback() {
    const src = this.element.getAttribute('src');
    console.log(
      src === this.initialSrc_,
      getSourceOrigin(src) ==
        getSourceOrigin(this.element.getAmpDoc().win.location)
    );
  }

  /**
   *
   * @return {Function}
   * @private
   */
  getJsonFn_() {
    const src = this.element.getAttribute('src');
    // this.urlReplacementPolicy_ = this.getUrlReplacementPolicy(src);
    return getJsonFn(this.element, this.getUrlReplacementPolicy_(src));
  }

  /**
   *
   * @param {string} src
   * @return {UrlReplacementPolicy}
   * @private
   */
  getUrlReplacementPolicy_(src) {
    return src === this.initialSrc_ ||
      getSourceOrigin(src) == getSourceOrigin(this.getAmpDoc().win.location)
      ? UrlReplacementPolicy.ALL
      : UrlReplacementPolicy.OPT_IN;
  }

  // mutationObserverCallback() {
  // console.log('mobcb');
  // const src = this.element.getAttribute('src');
  // console.log(
  //   src,
  //   src === this.initialSrc_,
  //   getSourceOrigin(src) ==
  //     getSourceOrigin(this.element.getAmpDoc().win.location)
  // );
  // }

  /**
   * TODO: this implementation is identical to one in amp-date-display &
   * amp-date-countdown. Move it to a common file and import it.
   *
   * @override
   */
  checkPropsPostMutations() {
    const templates =
      this.templates_ ||
      (this.templates_ = Services.templatesForDoc(this.element));
    const template = templates.maybeFindTemplate(this.element);
    if (template === this.template_) {
      return;
    }
    this.template_ = template;
    if (!template) {
      this.mutateProps(dict({'render': null}));
      return;
    }
    // Only overwrite `render` when template is ready to minimize FOUC.
    templates.whenReady(template).then(() => {
      if (template != this.template_) {
        // A new template has been set while the old one was initializing.
        return;
      }
      this.mutateProps(
        dict({
          'render': (data) => {
            return templates
              .renderTemplateAsString(dev().assertElement(template), data)
              .then((html) => dict({'__html': html}));
          },
        })
      );
    });
  }

  /**
   * TODO: this implementation is identical to one in amp-date-display &
   * amp-date-countdown. Move it to a common file and import it.
   *
   * @override
   */
  isReady(props) {
    // If a template is specified, then it must be available.
    return !this.template_ || 'render' in props;
  }
}

AmpRender['props'] = {
  ...BaseElement['props'],
  'getJson': {attrs: ['src'], parseAttrs: getJsonFn},
};

AMP.extension(TAG, '1.0', (AMP) => {
  AMP.registerElement(TAG, AmpRender);
});
