/**
 * Copyright 2019 The AMP HTML Authors. All Rights Reserved.
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
import {AutocompleteBindingDef} from './autocomplete-binding-def';
import {AutocompleteBindingInline} from './autocomplete-binding-inline';
import {AutocompleteBindingSingle} from './autocomplete-binding-single';
import {CSS} from '../../../build/amp-autocomplete-0.1.css';
import {Keys} from '../../../src/utils/key-codes';
import {Layout} from '../../../src/layout';
import {Services} from '../../../src/services';
import {SsrTemplateHelper} from '../../../src/ssr-template-helper';
import {
  UrlReplacementPolicy,
  batchFetchJsonFor,
  requestForBatchFetch,
} from '../../../src/batched-json';
import {createCustomEvent} from '../../../src/event-helper';
import {dev, user, userAssert} from '../../../src/log';
import {dict, hasOwn, map, ownProperty} from '../../../src/utils/object';
import {getValueForExpr, tryParseJson} from '../../../src/json';
import {includes, startsWith} from '../../../src/string';
import {isArray, isEnumValue, toArray} from '../../../src/types';
import {isExperimentOn} from '../../../src/experiments';
import {mod} from '../../../src/utils/math';
import {once} from '../../../src/utils/function';
import {removeChildren, tryFocus} from '../../../src/dom';
import {
  setupAMPCors,
  setupInput,
  setupJsonFetchInit,
} from '../../../src/utils/xhr-utils';
import {toggle} from '../../../src/style';
import fuzzysearch from '../../../third_party/fuzzysearch/index';

const TAG = 'amp-autocomplete';

/**
 * Different filtering options.
 * @enum {string}
 */
export const FilterType = {
  SUBSTRING: 'substring',
  PREFIX: 'prefix',
  TOKEN_PREFIX: 'token-prefix',
  FUZZY: 'fuzzy',
  CUSTOM: 'custom',
  NONE: 'none',
};

export class AmpAutocomplete extends AMP.BaseElement {
  /** @param {!AmpElement} element */
  constructor(element) {
    super(element);

    /** @private {AutocompleteBindingDef} */
    this.binding_ = null;

    /**
     * The data extracted from the <script> tag optionally provided
     * as a child. For use with static data.
     * @private {?Array<!JsonObject|string>}
     */
    this.sourceData_ = null;

    /**
     * The reference to the <input> or <textarea> provided as a child.
     * @private {?HTMLInputElement}
     */
    this.inputElement_ = null;

    /**
     * The partial user input used to generate suggestions.
     * @private {string}
     */
    this.userInput_ = '';

    /**
     * The value of the "filter" attribute on <autocomplete>.
     * @private {string}
     */
    this.filter_ = '';

    /**
     * The value of the "min-characters" attribute on <autocomplete>.
     * @private {number}
     */
    this.minChars_ = 1;

    /**
     * The value of the "max-entries" attribute on <autocomplete>.
     * @private {?number}
     */
    this.maxEntries_ = null;

    /**
     * If the "suggest-first" attribute is present on <autocomplete>.
     */
    this.shouldSuggestFirst_ = false;

    /**
     * Whether or not the "Backspace" key has recently been fired.
     * Only used when "suggest-first" is present on amp-autocomplete.
     *
     * This is used in conjunction between the "keydown" and "input" events
     * on the input element. The reason the inputHandler_() does not alone
     * read the "inputType" on the "input" to make the same discernment is
     * because that event property is not compatible in all browsers.
     */
    this.detectBackspace_ = false;

    /**
     * If the "highlight-user-entry" attribute is present on <autocomplete>.
     */
    this.highlightUserEntry_ = false;

    /**
     * The base value obtained from the "src" attribute on amp-autocomplete.
     * Used for creating static network endpoints. See generateSrc_.
     * @private {string}
     */
    this.srcBase_ = '';

    /**
     * The value of the "query" attribute on amp-autocomplete.
     * @private {string}
     */
    this.queryKey_ = '';

    /**
     * The index of the active suggested item.
     * @private {number}
     */
    this.activeIndex_ = -1;

    /**
     * The reference to the <div> of the active suggested item.
     * @private {?Element}
     */
    this.activeElement_ = null;

    /**
     * The element id if present or random number.
     * @private {number|string}
     */
    this.prefix_ = element.id ? element.id : Math.floor(Math.random() * 100);

    /**
     * The reference to the <div> that contains template-rendered children.
     * @private {?Element}
     */
    this.container_ = null;

    /** @private {boolean} */
    this.fallbackDisplayed_ = false;

    /**
     * The developer specified value of the 'autocomplete' attribute on the
     * <form> ancestor that contains <amp-autocomplete>. Used to reset the
     * attribute on blurring the input field. 'on' by default, according to
     * common browser practices.
     * @private {?string}
     */
    this.initialAutocompleteAttr_ = null;

    /** @const @private {!../../../src/service/template-impl.Templates} */
    this.templates_ = Services.templatesFor(this.win);

    /**
     * Whether a <template> or <script type="text/plain"> tag is present.
     * @private {boolean}
     */
    this.hasTemplate_ = false;

    /**
     * @const {function():!../../../src/ssr-template-helper.SsrTemplateHelper}
     */
    this.getSsrTemplateHelper = once(
      () =>
        new SsrTemplateHelper(
          TAG,
          Services.viewerForDoc(this.element),
          this.templates_
        )
    );

    /**
     * Whether server-side rendering is required.
     * @private {boolean}
     */
    this.isSsr_ = false;

    /** @private {?../../../src/service/action-impl.ActionService} */
    this.action_ = null;

    /** @private {?../../../src/service/viewport/viewport-interface.ViewportInterface} */
    this.viewport_ = null;

    /** @private {boolean} */
    this.interacted_ = false;
  }

  /** @override */
  buildCallback() {
    this.action_ = Services.actionServiceForDoc(this.element);
    this.viewport_ = Services.viewportForDoc(this.element);

    this.inputElement_ = this.getSingleInputOrTextarea_();
    const inputType = this.inputElement_.getAttribute('type');
    userAssert(
      !this.inputElement_.hasAttribute('type') ||
        inputType === 'text' ||
        inputType === 'search',
      '%s requires the "type" attribute to be "text" or "search" if present on <input>. %s',
      TAG,
      this.element
    );
    this.binding_ = this.createBinding_();

    this.queryKey_ = this.element.getAttribute('query');
    this.srcBase_ = this.element.getAttribute('src');
    userAssert(
      !this.queryKey_ || isExperimentOn(this.win, 'amp-autocomplete'),
      'Experiment %s is not turned on for "query" attr. %s',
      TAG,
      this.element
    );

    const jsonScript = this.element.querySelector(
      'script[type="application/json"]'
    );
    if (jsonScript) {
      this.sourceData_ = this.getInlineData_(jsonScript);
    } else if (!this.element.hasAttribute('src')) {
      user().warn(
        TAG,
        'Expected a <script type="application/json"> child or ' +
          'a URL specified in "src".'
      );
    }

    this.inputElement_.setAttribute('dir', 'auto');
    this.inputElement_.setAttribute('aria-autocomplete', 'both');
    this.inputElement_.setAttribute('role', 'combobox');

    userAssert(
      this.inputElement_.form,
      '%s should be inside a <form> tag. %s',
      TAG,
      this.element
    );
    if (this.inputElement_.form.hasAttribute('autocomplete')) {
      this.initialAutocompleteAttr_ = this.inputElement_.form.getAttribute(
        'autocomplete'
      );
    }

    // When SSR is supported, it is required.
    this.isSsr_ = this.getSsrTemplateHelper().isEnabled();
    this.hasTemplate_ = this.templates_.hasTemplate(
      this.element,
      'template, script[template]'
    );
    if (this.isSsr_) {
      userAssert(
        this.srcBase_,
        '%s requires data to be provided via "src" attribute for server-side rendering. %s',
        TAG,
        this.element
      );
      userAssert(
        this.hasTemplate_,
        `${TAG} should provide a <template> or <script type="plain/text"> element.`
      );
      userAssert(
        !this.element.hasAttribute('filter'),
        `${TAG} does not support client-side filter when server-side render is required.`
      );
      this.filter_ = FilterType.NONE;
    } else {
      this.filter_ = userAssert(
        this.element.getAttribute('filter'),
        '%s requires "filter" attribute. %s',
        TAG,
        this.element
      );
      userAssert(
        isEnumValue(FilterType, this.filter_),
        'Unexpected filter: %s. %s',
        this.filter_,
        this.element
      );
    }

    // Read configuration attributes
    this.minChars_ = this.element.hasAttribute('min-characters')
      ? parseInt(this.element.getAttribute('min-characters'), 10)
      : 1;
    this.maxEntries_ = this.element.hasAttribute('max-entries')
      ? parseInt(this.element.getAttribute('max-entries'), 10)
      : null;
    this.shouldSuggestFirst_ = this.binding_.shouldSuggestFirst();
    this.highlightUserEntry_ = this.element.hasAttribute(
      'highlight-user-entry'
    );

    // Set accessibility attributes
    this.element.setAttribute('aria-haspopup', 'listbox');
    this.container_ = this.createContainer_();
    this.element.appendChild(this.container_);

    return Promise.resolve();
  }

  /**
   * amp-autocomplete expects exactly one nested input or textarea.
   * @return {!HTMLInputElement}
   */
  getSingleInputOrTextarea_() {
    const possibleElements = this.element.querySelectorAll('input,textarea');
    userAssert(
      possibleElements.length == 1,
      '%s should contain exactly one <input> or <textarea> descendant %s',
      TAG,
      this.element
    );
    return /** @type {!HTMLInputElement} */ (possibleElements[0]);
  }

  /**
   * Creates a binding associated with singular autocomplete or
   * inline autocomplete depending on the presence of the given element's "inline" attribute.
   * @return {AutocompleteBindingDef}
   */
  createBinding_() {
    return this.element.hasAttribute('inline')
      ? new AutocompleteBindingInline(this)
      : new AutocompleteBindingSingle(this);
  }

  /**
   * Reads the 'items' data from the child <script> element.
   * For use with static local data.
   * @param {!Element} script
   * @return {!Array<!JsonObject|string>}
   * @private
   */
  getInlineData_(script) {
    const json = tryParseJson(script.textContent, error => {
      throw error;
    });
    const itemsExpr = this.element.getAttribute('items') || 'items';
    const items = getValueForExpr(/**@type {!JsonObject}*/ (json), itemsExpr);
    if (!items) {
      user().warn(
        TAG,
        'Expected key "%s" in data but found nothing. Rendering empty results.',
        itemsExpr
      );
      return [];
    }
    return user().assertArray(items);
  }

  /**
   * Reads the 'items' data from the URL provided in the 'src' attribute.
   * For use with remote data.
   * @return {!Promise<!Array<string>>}
   * @private
   */
  getRemoteData_() {
    const ampdoc = this.getAmpDoc();
    const policy = UrlReplacementPolicy.ALL;
    const itemsExpr = this.element.getAttribute('items') || 'items';
    this.maybeSetSrcFromInput_();
    if (this.isSsr_) {
      return requestForBatchFetch(
        this.element,
        policy,
        /* refresh */ false
      ).then(request => {
        request.xhrUrl = setupInput(this.win, request.xhrUrl, request.fetchOpt);
        request.fetchOpt = setupAMPCors(
          this.win,
          request.xhrUrl,
          request.fetchOpt
        );
        setupJsonFetchInit(request.fetchOpt);

        const attributes = dict({
          'ampAutocompleteAttributes': {
            'items': itemsExpr,
          },
        });
        return this.getSsrTemplateHelper().ssr(
          this.element,
          request,
          /* opt_templates */ null,
          attributes
        );
      });
    } else {
      return batchFetchJsonFor(ampdoc, this.element, {
        expr: itemsExpr,
        urlReplacement: policy,
      }).catch(() => {
        user().warn(
          TAG,
          'Expected key "%s" in data but found nothing. Rendering empty results.',
          itemsExpr
        );
        return [];
      });
    }
  }

  /**
   * Update value of "src" attribute if the "query" attribute is provided.
   */
  maybeSetSrcFromInput_() {
    if (!this.queryKey_) {
      return;
    }
    const src = this.generateSrc_(this.userInput_);
    this.element.setAttribute('src', src);
  }

  /**
   * Takes the given input and returns the constructed server endpoint for it.
   * For use when publishers provide "src" and "query" attributes.
   * @param {string} opt_query
   * @return {string}
   * @private
   */
  generateSrc_(opt_query = '') {
    const encodedQueryKey = encodeURIComponent(this.queryKey_);
    const encodedQuery = encodeURIComponent(opt_query);
    return `${this.srcBase_}?${encodedQueryKey}=${encodedQuery}`;
  }

  /**
   * Creates and returns <div> that contains the template-rendered children.
   * Should be called in a measureMutate context.
   * @return {!Element}
   * @private
   */
  createContainer_() {
    const container = this.element.ownerDocument.createElement('div');
    container.classList.add('i-amphtml-autocomplete-results');
    if (this.shouldRenderAbove_()) {
      container.classList.add('i-amphtml-autocomplete-results-up');
    }
    container.setAttribute('role', 'listbox');
    toggle(container, false);
    return container;
  }

  /** @override */
  layoutCallback() {
    // Disable autofill in browsers.
    this.inputElement_.setAttribute('autocomplete', 'off');

    // Register event handlers.
    this.inputElement_.addEventListener(
      'touchstart',
      () => {
        this.checkFirstInteractionAndMaybeFetchData_();
      },
      {passive: true}
    );
    this.inputElement_.addEventListener('input', () => {
      this.inputHandler_();
    });
    this.inputElement_.addEventListener('keydown', e => {
      this.keyDownHandler_(e);
    });
    this.inputElement_.addEventListener('focus', () => {
      this.checkFirstInteractionAndMaybeFetchData_().then(() => {
        const display = this.binding_.shouldShowOnFocus();
        this.toggleResultsHandler_(display);
      });
    });
    this.inputElement_.addEventListener('blur', () => {
      this.toggleResultsHandler_(false);
    });
    this.container_.addEventListener('mousedown', e => {
      this.selectHandler_(e);
    });

    return this.autocomplete_(this.sourceData_, this.userInput_);
  }

  /** @override */
  mutatedAttributesCallback(mutations) {
    const src = mutations['src'];
    if (src === undefined || src === null) {
      return Promise.resolve();
    }
    if (typeof src === 'string') {
      return this.getRemoteData_().then(
        remoteData => {
          this.sourceData_ = remoteData || [];
          this.autocomplete_(this.sourceData_, this.userInput_);
        },
        e => {
          this.displayFallback_(e);
        }
      );
    }
    if (typeof src === 'object') {
      this.sourceData_ = src['items'] || [];
      return this.autocomplete_(this.sourceData_, this.userInput_);
    }
    user().error(TAG, 'Unexpected "src" type: ' + src);
  }

  /**
   * Create and return <div> element from given plan-text item.
   * @param {string} item
   * @param {string=} substring
   * @return {!Element}
   * @private
   */
  createElementFromItem_(item, substring = '') {
    const element = this.element.ownerDocument.createElement('div');
    element.classList.add('i-amphtml-autocomplete-item');
    element.setAttribute('role', 'option');
    element.setAttribute('data-value', item);
    element.setAttribute('dir', 'auto');
    element.textContent = item;
    const text = element.childNodes[0];
    const lowerCaseItem = item.toLocaleLowerCase();
    const lowerCaseSubstring = substring.toLocaleLowerCase();
    if (
      this.highlightUserEntry_ &&
      substring &&
      substring.length <= item.length &&
      includes(lowerCaseItem, lowerCaseSubstring)
    ) {
      const loc = lowerCaseItem.indexOf(lowerCaseSubstring);
      const span = this.element.ownerDocument.createElement('span');
      span.classList.add('autocomplete-partial');
      span.appendChild(
        this.element.ownerDocument.createTextNode(
          // Preserve any capitalization from the original item.
          item.slice(loc, loc + substring.length)
        )
      );
      const textToRemove = text.splitText(loc);
      textToRemove.splitText(substring.length);
      element.replaceChild(span, textToRemove);
    }
    return element;
  }

  /**
   * Displays autocomplete suggestions on user input if appropriate.
   * @return {!Promise}
   * @private
   */
  inputHandler_() {
    if (
      this.binding_.shouldAutocomplete(dev().assertElement(this.inputElement_))
    ) {
      return this.maybeFetchAndAutocomplete_();
    }

    return this.mutateElement(() => {
      this.clearAllItems_();
    });
  }

  /**
   * First fetches if data is dynamic, then updates user input and
   * displays autocomplete suggestions against it.
   * @return {!Promise}
   */
  maybeFetchAndAutocomplete_() {
    // If the input is the first entry in the field.
    const isFirstInteraction =
      this.userInput_.length === 0 && this.inputElement_.value.length === 1;
    this.userInput_ = this.binding_.getUserInputForUpdate(
      dev().assertElement(this.inputElement_)
    );

    // Fetch if autocomplete data is dynamic.
    // Required when server-side rendering or otherwise relies on a query key.
    const maybeFetch =
      this.isSsr_ || this.queryKey_
        ? this.getRemoteData_()
        : Promise.resolve(this.sourceData_);
    return maybeFetch.then(data => {
      this.sourceData_ = data;
      return this.mutateElement(() => {
        this.autocomplete_(this.sourceData_, this.userInput_).then(() => {
          this.displaySuggestions_(isFirstInteraction);
        });
      });
    });
  }

  /**
   * Toggle the container of suggestions to show.
   * If the publisher has opted to autosuggest the first option, do this as well.
   * @param {boolean} isFirstInteraction
   */
  displaySuggestions_(isFirstInteraction) {
    this.toggleResults_(true);

    // Detecting backspace enables "suggest-first" to respect user deletion.
    if (this.shouldSuggestFirst_) {
      if (!this.detectBackspace_ || isFirstInteraction) {
        this.updateActiveItem_(1);
      }
      this.detectBackspace_ = false;
    }
  }

  /**
   * Handle selecting items on user mousedown.
   * @param {!Event} event
   * @return {!Promise}
   * @private
   */
  selectHandler_(event) {
    return this.mutateElement(() => {
      const element = dev().assertElement(event.target);
      this.selectItem_(this.getItemElement_(element));
    });
  }

  /**
   * Display autocomplete suggestions and render it in the results container_.
   * When client side rendering, filter the source data according to the given opt_input.
   * @param {?Array<!JsonObject|string>} data
   * @param {string} opt_input
   * @return {!Promise}
   * @private
   */
  autocomplete_(data, opt_input = '') {
    this.clearAllItems_();
    if (opt_input.length < this.minChars_ || !data) {
      return Promise.resolve();
    } else if (this.isSsr_) {
      return hasOwn(data, 'html')
        ? this.renderResults_(
            data,
            dev().assertElement(this.container_),
            opt_input
          )
        : Promise.resolve();
    } else {
      return this.filterDataAndRenderResults_(data, opt_input);
    }
  }

  /**
   * Client-side filter the source data according to the given opt_input
   * and render it in the results container_.
   * @param {?Array<!JsonObject|string>} sourceData
   * @param {string} input
   * @return {!Promise}
   * @private
   */
  filterDataAndRenderResults_(sourceData, input) {
    if (!sourceData.length) {
      return Promise.resolve();
    }
    const filteredData = this.filterData_(sourceData, input);
    return this.renderResults_(
      filteredData,
      dev().assertElement(this.container_),
      input
    );
  }

  /**
   * Render the given data into item elements in the given container element.
   * @param {!Array<!JsonObject|string>} filteredData
   * @param {!Element} container
   * @param {string} input
   * @return {!Promise}
   * @private
   */
  renderResults_(filteredData, container, input) {
    let renderPromise = Promise.resolve();
    this.resetActiveElement_();
    if (this.hasTemplate_) {
      renderPromise = this.getSsrTemplateHelper()
        .applySsrOrCsrTemplate(this.element, filteredData)
        .then(rendered => {
          const elements = isArray(rendered)
            ? rendered
            : toArray(rendered.children);
          elements.forEach(child => {
            if (child.hasAttribute('data-disabled')) {
              child.setAttribute('aria-disabled', 'true');
            } else if (!child.hasAttribute('data-value')) {
              user().warn(
                TAG,
                'Expected a "data-value" or "data-disabled" attribute on the rendered template item. %s',
                child
              );
            }
            child.classList.add('i-amphtml-autocomplete-item');
            child.setAttribute('role', 'option');
            container.appendChild(child);
          });
        });
    } else {
      filteredData.forEach(item => {
        userAssert(
          typeof item === 'string',
          '%s data must provide template for non-string items. %s',
          TAG,
          this.element
        );
        container.appendChild(
          this.createElementFromItem_(/** @type {string} */ (item), input)
        );
      });
    }
    return renderPromise;
  }

  /**
   * Apply the filter to the given data based on the given input.
   * @param {!Array<!JsonObject|string>} data
   * @param {string} input
   * @return {!Array<!JsonObject|string>}
   * @private
   */
  filterData_(data, input) {
    // Server-side filtering.
    if (this.filter_ === FilterType.NONE) {
      return this.truncateToMaxEntries_(data);
    }

    // Client-side filtering.
    input = input.toLocaleLowerCase();
    const itemsExpr = this.element.getAttribute('filter-value') || 'value';
    const filteredData = data.filter(item => {
      if (typeof item === 'object') {
        item = getValueForExpr(/** @type {!JsonObject} */ (item), itemsExpr);
      }
      userAssert(
        typeof item === 'string',
        '%s data property "%s" must map to string type. %s',
        TAG,
        itemsExpr,
        this.element
      );
      item = item.toLocaleLowerCase();
      switch (this.filter_) {
        case FilterType.SUBSTRING:
          return includes(item, input);
        case FilterType.PREFIX:
          return startsWith(item, input);
        case FilterType.TOKEN_PREFIX:
          return this.tokenPrefixMatch_(item, input);
        case FilterType.FUZZY:
          return fuzzysearch(input, item);
        case FilterType.CUSTOM:
          throw new Error(
            'Filter not yet supported: %s',
            this.filter_,
            this.element
          );
        default:
          throw new Error('Unexpected filter: %s', this.filter_, this.element);
      }
    });

    return this.truncateToMaxEntries_(filteredData);
  }

  /**
   * Returns true if the given input string is a token-prefix match on the
   * given item string. Assumes toLocaleLowerCase() has been performed on both
   * parameters.
   *
   * Matches:
   * washington dc, dc
   * washington dc, wash
   * washington dc, dc washington
   * new york ny, new york
   *
   * Non-matches:
   * washington dc, district of columbia
   * washington dc, washington d c
   * washington dc, ashington dc
   *
   * @param {string} item
   * @param {string} input
   * @return {boolean}
   * @private
   */
  tokenPrefixMatch_(item, input) {
    if (input === '') {
      return true;
    }

    const itemTokens = this.tokenizeString_(item);
    const inputTokens = this.tokenizeString_(input);

    // Match each input token (except the last one) to an item token
    const itemTokensMap = this.mapFromTokensArray_(itemTokens);
    const lastInputToken = inputTokens[inputTokens.length - 1];
    inputTokens.splice(inputTokens.length - 1, 1);
    let match = true;
    for (let i = 0; i < inputTokens.length; i++) {
      const token = inputTokens[i];
      if (token === '') {
        continue;
      }
      if (!hasOwn(itemTokensMap, token)) {
        match = false;
        break;
      }
      const count = Number(ownProperty(itemTokensMap, token));
      if (count > 1) {
        itemTokensMap[token] = count - 1;
      } else {
        delete itemTokensMap[token];
      }
    }

    // Return that the last input token is a prefix of one of the item tokens
    const remainingItemTokens = Object.keys(itemTokensMap);
    return (
      match &&
      (lastInputToken === '' ||
        remainingItemTokens.some(itemToken => {
          return startsWith(itemToken, lastInputToken);
        }))
    );
  }

  /**
   * Takes a string, removes '.', and splits by special characters.
   * Returns the resulting array of tokens.
   * @param {string} inputStr
   * @return {!Array<string>}
   * @private
   */
  tokenizeString_(inputStr) {
    inputStr = inputStr.replace(/[\.]+/g, '');
    return inputStr.split(/[`~(){}_|+\-;:\'",\[\]\\\/ ]+/g);
  }

  /**
   * Returns the given tokens array as a dictionary of key: token (str) and
   * value: number of occurrences.
   * @param {!Array<string>} tokens
   * @return {!Object<string, number>}
   * @private
   */
  mapFromTokensArray_(tokens) {
    const tokensMap = map();
    tokens.forEach(token => {
      const count = hasOwn(tokensMap, token)
        ? ownProperty(tokensMap, token) + 1
        : 1;
      tokensMap[token] = count;
    });
    return tokensMap;
  }

  /**
   * Truncate the given data to a maximum length of the max-entries attribute.
   * @param {!Array<!JsonObject|string>} data
   * @return {!Array<!JsonObject|string>}
   * @private
   */
  truncateToMaxEntries_(data) {
    if (this.maxEntries_ && this.maxEntries_ < data.length) {
      data = data.slice(0, this.maxEntries_);
    }
    return data;
  }

  /**
   * Shows or hides the results container_.
   * @param {boolean} display
   * @private
   */
  toggleResults_(display) {
    this.inputElement_.setAttribute('aria-expanded', display);
    toggle(dev().assertElement(this.container_), display);
  }

  /**
   * Disables or re-enables the browser autofill on the autocomplete input.
   * Then handles showing or hiding results on user focus/blur.
   * @param {boolean} display
   * @return {!Promise}
   * @private
   */
  toggleResultsHandler_(display) {
    // Set/reset "autocomplete" attribute on the <form> ancestor.
    if (display) {
      this.inputElement_.form.setAttribute('autocomplete', 'off');
    } else if (this.initialAutocompleteAttr_) {
      this.inputElement_.form.setAttribute(
        'autocomplete',
        this.initialAutocompleteAttr_
      );
    } else {
      this.inputElement_.form.removeAttribute('autocomplete');
    }

    // Toggle results.
    let renderAbove = false;
    return this.measureMutateElement(
      () => {
        renderAbove = this.shouldRenderAbove_();
      },
      () => {
        if (!display) {
          this.userInput_ = this.inputElement_.value;
          this.autocomplete_(this.sourceData_, this.userInput_);
          this.resetActiveElement_();
        }
        this.setResultDisplayDirection_(renderAbove);
        this.toggleResults_(display);
      }
    );
  }

  /**
   * Requests remote data source, if provided, on first user interaction.
   * @return {!Promise}
   * @private
   */
  checkFirstInteractionAndMaybeFetchData_() {
    if (this.interacted_ || !this.element.hasAttribute('src')) {
      return Promise.resolve();
    }
    this.interacted_ = true;
    return this.getRemoteData_().then(
      remoteData => {
        this.sourceData_ = remoteData;
        this.autocomplete_(this.sourceData_);
      },
      e => {
        this.displayFallback_(e);
      }
    );
  }

  /**
   * Display results upwards or downwards based on location in the viewport.
   * Should be called in a measureMutate context.
   * @param {boolean} renderAbove
   * @private
   */
  setResultDisplayDirection_(renderAbove) {
    this.container_.classList.toggle(
      'i-amphtml-autocomplete-results-up',
      renderAbove
    );
  }

  /**
   * Returns true if the input is in the bottom half of the viewport.
   * Should be called in a measureMutate context.
   * @return {boolean}
   * @private
   */
  shouldRenderAbove_() {
    const viewHeight = this.viewport_.getHeight() || 0;
    return (
      this.inputElement_./*OK*/ getBoundingClientRect().top > viewHeight / 2
    );
  }

  /**
   * Returns true if the results are visible and has items.
   * @return {boolean}
   * @private
   */
  areResultsDisplayed_() {
    return (
      !this.container_.hasAttribute('hidden') &&
      this.container_.children.length > 0
    );
  }

  /**
   * Returns the nearest ancestor element that is a suggested item.
   * @param {?Element} element
   * @return {?Element}
   * @private
   */
  getItemElement_(element) {
    if (element === null) {
      return null;
    }
    if (element.classList.contains('i-amphtml-autocomplete-item')) {
      return element;
    }
    return this.getItemElement_(element.parentElement);
  }

  /**
   * Writes the selected value into the input field.
   * @param {?Element} element
   * @private
   */
  selectItem_(element) {
    if (element === null || element.hasAttribute('data-disabled')) {
      return;
    }
    const selectedValue =
      element.getAttribute('data-value') || element.textContent;

    this.fireSelectEvent_(selectedValue);
    this.clearAllItems_();
    this.toggleResults_(false);

    this.inputElement_.value = this.binding_.getUserInputForUpdateWithSelection(
      selectedValue,
      this.inputElement_,
      this.userInput_
    );
    this.userInput_ = this.binding_.getUserInputForUpdate(this.inputElement_);
  }

  /**
   * Triggers a 'select' event with the given value as the value emitted.
   * @param {string} value
   * @private
   */
  fireSelectEvent_(value) {
    const name = 'select';
    const selectEvent = createCustomEvent(
      this.win,
      `amp-autocomplete.${name}`,
      /** @type {!JsonObject} */ ({value})
    );
    this.action_.trigger(this.element, name, selectEvent, ActionTrust.HIGH);
  }

  /**
   * Given a delta between the current active item and the desired active item,
   * marks the desired active item as active. Loops to the beginning.
   * @param {number} delta
   * @return {!Promise}
   * @private
   */
  updateActiveItem_(delta) {
    if (
      delta === 0 ||
      !this.areResultsDisplayed_() ||
      this.fallbackDisplayed_
    ) {
      return Promise.resolve();
    }
    // Active element logic
    const keyUpWhenNoneActive = this.activeIndex_ === -1 && delta < 0;
    const index = keyUpWhenNoneActive ? delta : this.activeIndex_ + delta;
    const enabledElements = this.getEnabledItems_();
    if (enabledElements.length === 0) {
      return Promise.resolve();
    }
    const activeIndex = mod(index, enabledElements.length);
    const newActiveElement = enabledElements[activeIndex];
    const newValue = newActiveElement.getAttribute('data-value');

    this.binding_.displayActiveItemInInput(
      dev().assertElement(this.inputElement_),
      newValue,
      this.userInput_
    );

    // Element visibility logic
    let shouldScroll, newTop;

    return this.measureMutateElement(
      () => {
        const {offsetTop: itemTop, offsetHeight: itemHeight} = newActiveElement;
        const {
          scrollTop: resultTop,
          offsetHeight: resultHeight,
        } = this.container_;
        shouldScroll =
          resultTop > itemTop ||
          resultTop + resultHeight < itemTop + itemHeight;
        newTop = delta > 0 ? itemTop + itemHeight - resultHeight : itemTop;
      },
      () => {
        if (shouldScroll) {
          this.container_./*OK*/ scrollTop = newTop;
        }
        this.resetActiveElement_();
        newActiveElement.classList.add('i-amphtml-autocomplete-item-active');
        newActiveElement.setAttribute('aria-selected', 'true');
        let elementId = newActiveElement.getAttribute('id');
        if (!elementId) {
          // To ensure that we pass Accessibility audits -
          // we need to make sure that each item element has a unique ID.
          // In case the autocomplete doesn't have an ID we use a
          // random number to ensure uniqueness.
          elementId = this.prefix_ + '_AMP_content_' + activeIndex;
          newActiveElement.setAttribute('id', elementId);
        }
        this.inputElement_.setAttribute('aria-activedescendant', elementId);
        this.activeIndex_ = activeIndex;
        this.activeElement_ = newActiveElement;
        tryFocus(dev().assertElement(this.activeElement_));
      }
    );
  }

  /** Returns all item elements in the results container that do not have the
   * 'data-disabled' attribute.
   * @return {!NodeList}
   * @private
   */
  getEnabledItems_() {
    return this.container_.querySelectorAll(
      '.i-amphtml-autocomplete-item:not([data-disabled])'
    );
  }

  /**
   * Displays the user's partial input in the input field.
   * @private
   */
  displayUserInput_() {
    this.binding_.resetInputOnWrapAround(
      this.userInput_,
      dev().assertElement(this.inputElement_)
    );
    this.resetActiveElement_();
  }

  /**
   * Resets the activeIndex_, activeElement_ and removes its 'active' class.
   * Should be called in a measureMutate context.
   * @private
   */
  resetActiveElement_() {
    if (!this.activeElement_) {
      return;
    }
    this.activeElement_.classList.toggle(
      'i-amphtml-autocomplete-item-active',
      false
    );
    this.activeElement_.removeAttribute('aria-selected');
    if (this.activeElement_.getAttribute('id') === 'autocomplete-selected') {
      this.activeElement_.removeAttribute('id');
    }
    this.inputElement_.removeAttribute('aria-activedescendent');
    this.activeElement_ = null;
    this.activeIndex_ = -1;
  }

  /**
   * Delete all children to the container_
   * @private
   */
  clearAllItems_() {
    this.fallbackDisplayed_ = false;
    removeChildren(dev().assertElement(this.container_));
  }

  /**
   * Handles keyboard events.
   * @param {!Event} event
   * @return {!Promise}
   * @private
   */
  keyDownHandler_(event) {
    switch (event.key) {
      case Keys.DOWN_ARROW:
        event.preventDefault();
        if (this.areResultsDisplayed_()) {
          // Disrupt loop around to display user input.
          if (this.activeIndex_ === this.getEnabledItems_().length - 1) {
            this.displayUserInput_();
            return Promise.resolve();
          }
          return this.updateActiveItem_(1);
        }
        return this.mutateElement(() => {
          this.autocomplete_(this.sourceData_, this.userInput_);
          this.toggleResults_(true);
        });
      case Keys.UP_ARROW:
        event.preventDefault();
        // Disrupt loop around to display user input.
        if (this.activeIndex_ === 0) {
          this.displayUserInput_();
          return Promise.resolve();
        }
        return this.updateActiveItem_(-1);
      case Keys.ENTER:
        const shouldPreventSubmit = this.binding_.shouldPreventFormSubmissionOnEnter(
          !!this.activeElement_
        );
        if (this.areResultsDisplayed_() && shouldPreventSubmit) {
          event.preventDefault();
        }
        this.binding_.removeSelectionHighlighting(this.inputElement_);
        return this.mutateElement(() => {
          if (this.areResultsDisplayed_() && !!this.activeElement_) {
            this.selectItem_(this.activeElement_);
            this.resetActiveElement_();
            return Promise.resolve();
          }
          this.toggleResults_(false);
        });
      case Keys.ESCAPE:
        // Select user's partial input and hide results.
        return this.mutateElement(() => {
          if (!this.fallbackDisplayed_) {
            event.preventDefault();
            this.displayUserInput_();
            this.toggleResults_(false);
          }
        });
      case Keys.TAB:
        if (this.areResultsDisplayed_() && this.activeElement_) {
          event.preventDefault();
          this.selectItem_(this.activeElement_);
        }
        return Promise.resolve();
      case Keys.BACKSPACE:
        this.detectBackspace_ = this.shouldSuggestFirst_;
        return Promise.resolve();
      default:
        return Promise.resolve();
    }
  }

  /**
   * If a fallback element is provided, displays it instead of suggestions.
   * Otherwise, throws given error. Must be called in a mutate context.
   * @param {*=} error
   * @throws {!Error} If fallback element is not present.
   * @private
   */
  displayFallback_(error) {
    if (this.fallbackDisplayed_) {
      return;
    }
    this.clearAllItems_();
    const fallback = this.getFallback();
    if (fallback) {
      this.fallbackDisplayed_ = true;
      this.toggleFallback(true);
    } else {
      throw error;
    }
  }

  /** @override */
  isLayoutSupported(layout) {
    return layout == Layout.CONTAINER;
  }
}

AMP.extension(TAG, '0.1', AMP => {
  AMP.registerElement(TAG, AmpAutocomplete, CSS);
});
