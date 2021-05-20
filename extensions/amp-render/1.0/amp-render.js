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
import {isArray} from '../../../src/core/types/array';

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
  }

  /** @override */
  isLayoutSupported(layout) {
    userAssert(
      isExperimentOn(this.win, 'amp-render'),
      'Experiment "amp-render" is not turned on.'
    );
    return super.isLayoutSupported(layout);
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
      'getJson': this.getFetchJsonFn(),
      'onLoading': () => {
        this.toggleLoading(true);
      },
      'onReady': () => {
        this.toggleLoading(false);
        this.togglePlaceholder(false);
      },
      'onRefresh': () => {
        this.togglePlaceholder(true);
        this.toggleFallback(false);
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
  buildCallback() {
    super.buildCallback();
    if (!this.element.hasAttribute('aria-live')) {
      this.element.setAttribute('aria-live', 'polite');
    }
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
            if (this.element.getAttribute('binding') === 'no') {
              return templates
                .renderTemplateAsString(dev().assertElement(template), data)
                .then((html) => dict({'__html': html}));
            }

            let element;
            return templates
              .renderTemplate(dev().assertElement(template), data)
              .then((el) => {
                element = el;
                return Services.bindForDocOrNull(this.element);
              })
              .then((bind) => {
                const bindingAttrValue = this.element.getAttribute('binding');
                return bind.rescan([element], [], {
                  'fast': true,
                  'update':
                    // update should be true if:
                    // 1. no binding is specified (default is binding=always) or
                    // 2. binding=always is specified or
                    // 3. binding=refresh and is not the initial render
                    !bindingAttrValue ||
                    bindingAttrValue === 'always' ||
                    (bindingAttrValue === 'refresh' &&
                      // bind.signals().get('FIRST_MUTATE') gives the timestamp (in ms) when mutation
                      // occured, which is null for the initial render
                      bind.signals().get('FIRST_MUTATE') !== null),
                });
              })
              .then(() => {
                return dict({__html: element.innerHTML}); // or outerHTML?
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
