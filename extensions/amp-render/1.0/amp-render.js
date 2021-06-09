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
import {computedStyle, setStyle, setStyles} from '../../../src/style';
import {Layout} from '../../../src/layout';
import {measureIntersection} from '../../../src/utils/intersection';

/** @const {string} */
const TAG = 'amp-render';

/** @const {string} */
const AMP_STATE_URI_SCHEME = 'amp-state:';

/** @enum {string}  */
const Binding = {
  ALWAYS: 'always',
  REFRESH: 'refresh',
  NEVER: 'never',
  NO: 'no',
};

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
 * @param {string} bindingValue
 * @param {boolean} isFirstMutation
 * @return {boolean} Whether bind should evaluate and apply changes.
 */
function getUpdateValue(bindingValue, isFirstMutation) {
  if (!bindingValue || bindingValue === Binding.REFRESH) {
    // default is 'refresh', so check that its not the first mutation
    return !isFirstMutation;
  }
  if (bindingValue === Binding.ALWAYS) {
    // TODO(dmanek): add link to amp-render docs that elaborates on performance implications of "always"
    user().warn(TAG, 'binding="always" has performance implications.');
    return true;
  }
  return false;
}

export class AmpRender extends BaseElement {
  /** @param {!AmpElement} element */
  constructor(element) {
    super(element);

    /** @private {?../../../src/service/template-impl.Templates} */
    this.templates_ = null;

    /** @private {?Element} */
    this.template_ = null;

    /** @private {?string} */
    this.initialSrc_ = null;

    /** @private {?string} */
    this.src_ = null;

    this.heightPromise_ = null;
  }

  /**
   * @return {!UrlReplacementPolicy}
   * @private
   */
  getPolicy_() {
    const src = this.element.getAttribute('src');
    // Require opt-in for URL variable replacements on CORS fetches triggered
    // by [src] mutation. @see spec/amp-var-substitutions.md
    // TODO(dmanek): Update spec/amp-var-substitutions.md with this information
    // and add a `Substitution` sections in this component's markdown file.
    let policy = UrlReplacementPolicy.OPT_IN;
    if (
      src == this.initialSrc_ ||
      getSourceOrigin(src) == getSourceOrigin(this.getAmpDoc().win.location)
    ) {
      policy = UrlReplacementPolicy.ALL;
    }
    return policy;
  }

  /**
   * @param {boolean} shouldRefresh true to force refresh of browser cache.
   * @return {!BatchFetchOptionsDef} options object to pass to `batchFetchJsonFor` method.
   * @private
   */
  buildOptionsObject_(shouldRefresh = false) {
    return {
      xssiPrefix: this.element.getAttribute('xssi-prefix'),
      expr: this.element.getAttribute('key') ?? '.',
      refresh: shouldRefresh,
      urlReplacement: this.getPolicy_(),
    };
  }

  /**
   * Returns a function to fetch json from remote url, amp-state or
   * amp-script.
   *
   * @return {Function}
   */
  getFetchJsonFn() {
    const {element} = this;
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
        this.buildOptionsObject_(shouldRefresh)
      );
  }

  /** @override */
  init() {
    this.initialSrc_ = this.element.getAttribute('src');
    this.src_ = this.initialSrc_;

    const hasAriaLive = this.element.hasAttribute('aria-live');
    if (!hasAriaLive) {
      this.element.setAttribute('aria-live', 'polite');
    }

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
      'ariaLiveValue': hasAriaLive
        ? this.element.getAttribute('aria-live')
        : 'polite',
      'getJson': this.getFetchJsonFn(),
      'onLoading': () => {
        this.toggleLoading(true);
      },
      'onDataReady': () => {
        if (this.element.getAttribute('layout') !== Layout.CONTAINER) {
          return;
        }
        if (!this.getPlaceholder()) {
          user().warn(TAG, 'placeholder required with layout="container"');
          return;
        }

        let height;
        this.measureMutateElement(
          () => {
            height = computedStyle(
              this.getAmpDoc().win,
              this.element
            ).getPropertyValue('height');
          },
          () => {
            setStyles(this.element, {
              'overflow': 'hidden',
              'height': height,
            });
          }
        );
      },
      'onReady': () => {
        this.toggleLoading(false);
        let containerHeight;
        this.measureMutateElement(
          () => {
            containerHeight = this.element.querySelector(
              '[i-amphtml-rendered]'
            ).scrollHeight;
          },
          () => {
            this.attemptChangeHeight(containerHeight)
              .then(() => {
                this.togglePlaceholder(false);
                setStyles(this.element, {
                  'overflow': '',
                });
              })
              .catch(() => {
                this.togglePlaceholder(false);
              });
          }
        );
      },
      'onError': () => {
        this.toggleLoading(false);
        // If the content fails to load and there's a fallback element, display the fallback.
        // Otherwise, continue displaying the placeholder.
        if (this.getFallback()) {
          this.togglePlaceholder(false);
          this.toggleFallback(true);
        } else {
          this.togglePlaceholder(true);
        }
      },
    });
  }

  /** @override */
  mutationObserverCallback() {
    const src = this.element.getAttribute('src');
    if (src === this.src_) {
      return;
    }
    this.src_ = src;
    this.mutateProps(dict({'getJson': this.getFetchJsonFn()}));
  }

  /**
   * @param {!JsonObject} data
   * @return {!Promise<!Element>}
   * @private
   */
  renderTemplateAsString_(data) {
    return this.templates_
      .renderTemplateAsString(dev().assertElement(this.template_), data)
      .then((html) => dict({'__html': html}));
  }

  /** @override */
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
            const bindingValue = this.element.getAttribute('binding');
            if (bindingValue === Binding.NEVER || bindingValue === Binding.NO) {
              return this.renderTemplateAsString_(data);
            }
            return Services.bindForDocOrNull(this.element).then((bind) => {
              if (!bind) {
                return this.renderTemplateAsString_(data);
              }
              return templates
                .renderTemplate(dev().assertElement(template), data)
                .then((element) => {
                  return bind
                    .rescan([element], [], {
                      'fast': true,
                      'update': getUpdateValue(
                        bindingValue,
                        // bind.signals().get('FIRST_MUTATE') returns timestamp (in ms) when first
                        // mutation occured, which is null for the initial render
                        bind.signals().get('FIRST_MUTATE') === null
                      ),
                    })
                    .then(() => dict({'__html': element./* OK */ innerHTML}));
                });
            });
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

AMP.extension(TAG, '1.0', (AMP) => {
  AMP.registerElement(TAG, AmpRender);
});
