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
import {Services} from '../../../src/services';
import {batchFetchJsonFor} from '../../../src/batched-json';
import {dev, user, userAssert} from '../../../src/log';
import {dict} from '../../../src/core/types/object';
import {isExperimentOn} from '../../../src/experiments';

/** @const {string} */
const TAG = 'amp-render';

const AMP_STATE_URI_SCHEME = 'amp-state:';
const AMP_SCRIPT_URI_SCHEME = 'amp-script:';

/**
 * Returns true if element's src points to amp-state.
 * @param {?string} src
 * @return {boolean}
 */
const isAmpStateSrc = (src) => src && src.startsWith(AMP_STATE_URI_SCHEME);

/**
 * Returns true if element's src points to an amp-script function.
 * @param {?string} src
 * @return {boolean}
 */
const isAmpScriptSrc = (src) => src && src.startsWith(AMP_SCRIPT_URI_SCHEME);

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
 * Gets the json from an amp-script uri.
 * TODO: this is similar to the implementation in amp-list. Move it
 * to a common file and import it.
 *
 * @param {!../../../src/service/ampdoc-impl.AmpDoc} ampdoc
 * @param {string} src
 * @return {Promise<!JsonObject>}
 */
function getAmpScriptJson(ampdoc, src) {
  return Promise.resolve()
    .then(() => {
      const args = src.slice('amp-script:'.length).split('.');
      userAssert(
        args.length === 2 && args[0].length > 0 && args[1].length > 0,
        '[amp-render]: "amp-script" URIs must be of the format "scriptId.functionIdentifier".'
      );

      const ampScriptId = args[0];
      const fnIdentifier = args[1];
      const ampScriptEl = ampdoc.getElementById(ampScriptId);
      userAssert(
        ampScriptEl && ampScriptEl.tagName === 'AMP-SCRIPT',
        `[amp-render]: could not find <amp-script> with script set to ${ampScriptId}`
      );

      return ampScriptEl.getImpl().then((impl) => {
        return impl.callFunction(fnIdentifier);
      });
    })
    .then((json) => {
      userAssert(
        json !== undefined,
        `[amp-render] ${src} must return json, but instead returned: ${typeof json}`
      );
      return json;
    });
}

/**
 * @param {!AmpElement} element
 * @param {boolean} shouldRefresh true to force refresh of browser cache.
 * @return {!Object} options object to pass to `batchFetchJsonFor` method.
 */
function buildOptionsObject(element, shouldRefresh = false) {
  return {
    xssiPrefix: element.getAttribute('xssi-prefix'),
    expr: element.getAttribute('key') ?? '.',
    refresh: shouldRefresh,
  };
}

/**
 * Returns a function to fetch json from remote url, amp-state or
 * amp-script.
 *
 * @param {!AmpElement} element
 * @return {Function}
 */
export const getJsonFn = (element) => {
  const src = element.getAttribute('src');
  if (!src?.length) {
    // TODO(dmanek): assert that src is provided instead of silently failing below.
    return () => {};
  }
  if (isAmpStateSrc(src)) {
    return (src) => getAmpStateJson(element, src);
  }
  if (isAmpScriptSrc(src)) {
    return (src) => getAmpScriptJson(element.getAmpDoc(), src);
  }
  return (unusedSrc, shouldRefresh = false) =>
    batchFetchJsonFor(
      element.getAmpDoc(),
      element,
      buildOptionsObject(element, shouldRefresh)
    );
};

export class AmpRender extends BaseElement {
  /** @param {!AmpElement} element */
  constructor(element) {
    super(element);

    /** @private {?../../../src/service/template-impl.Templates} */
    this.templates_ = null;

    /** @private {?Element} */
    this.template_ = null;
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
    this.registerApiAction('refresh', (api) => {
      const src = this.element.getAttribute('src');
      // There is an alternative way to do this using `mutationObserverCallback` while using a boolean
      // variable `canRefresh`. See https://github.com/ampproject/amphtml/pull/33776#discussion_r614087734
      // for more context. This approach may be better if src does not mutate often. But the alternative might
      // be better if src mutatates often and component user does not use `refresh` action.
      if (!src?.length || isAmpStateSrc(src) || isAmpScriptSrc(src)) {
        return;
      }
      api.refresh();
    });

    return dict({
      'getJson': getJsonFn(this.element),
    });
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
