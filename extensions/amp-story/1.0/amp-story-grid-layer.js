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

/**
 * @fileoverview This is a layer that lays its children out into a grid. Its
 * implementation is based off of the CSS Grid Spec.
 *
 * Example:
 * <code>
 * <amp-story-grid-layer template="fill">
 *   ...
 * </amp-story-grid-layer>
 * </code>
 */

import {AmpStoryBaseLayer} from './amp-story-base-layer';
import {assertDoesNotContainDisplay, setStyles} from '../../../src/style';
import {
  createElementWithAttributes,
  matches,
  scopedQuerySelectorAll,
} from '../../../src/dom';

/**
 * A mapping of attribute names we support for grid layers to the CSS Grid
 * properties they control.
 * @private @const {!Object<string, string>}
 */
const SUPPORTED_CSS_GRID_ATTRIBUTES = {
  'align-content': 'alignContent',
  'align-items': 'alignItems',
  'align-self': 'alignSelf',
  'grid-area': 'gridArea',
  'justify-content': 'justifyContent',
  'justify-items': 'justifyItems',
  'justify-self': 'justifySelf',
};

/**
 * Converts the keys of the SUPPORTED_CSS_GRID_ATTRIBUTES object above into a
 * selector for the specified attributes.
 * (e.g. [align-content], [align-items], ...)
 * @private @const {string}
 */
const SUPPORTED_CSS_GRID_ATTRIBUTES_SELECTOR =
    Object.keys(SUPPORTED_CSS_GRID_ATTRIBUTES)
        .map(key => `[${key}]`)
        .join(',');

/**
 * The attribute name for text background color
 * @private @const {string}
 */
const TEXT_BACKGROUND_COLOR_ATTRIBUTE_NAME = 'text-background-color';

/**
 * The selector for text background color
 * @private @const {string}
 */
const TEXT_BACKGROUND_COLOR_SELECTOR =
    `[${TEXT_BACKGROUND_COLOR_ATTRIBUTE_NAME}]`;

/**
 * The attribute name for grid layer templates.
 * @private @const {string}
 */
const TEMPLATE_ATTRIBUTE_NAME = 'template';

/**
 * A mapping of template attribute values to CSS class names.
 * @const {!Object<string, string>}
 */
export const GRID_LAYER_TEMPLATE_CLASS_NAMES = {
  'fill': 'i-amphtml-story-grid-template-fill',
  'vertical': 'i-amphtml-story-grid-template-vertical',
  'horizontal': 'i-amphtml-story-grid-template-horizontal',
  'thirds': 'i-amphtml-story-grid-template-thirds',
};

/**
 * Grid layer template templating system.
 */
export class AmpStoryGridLayer extends AmpStoryBaseLayer {
  /** @param {!AmpElement} element */
  constructor(element) {
    super(element);

    /** @private {boolean} */
    this.prerenderAllowed_ = false;
  }

  /** @override */
  firstAttachedCallback() {
    // Only prerender if child of the first page.
    this.prerenderAllowed_ = matches(this.element,
        'amp-story-page:first-of-type amp-story-grid-layer');
  }

  /** @override */
  buildCallback() {
    super.buildCallback();
    this.applyTemplateClassName_();
    this.setOwnCssGridStyles_();
    this.setDescendentCssGridStyles_();
    this.setDescendentCssTextStyles_();
  }

  /** @override */
  prerenderAllowed() {
    return this.prerenderAllowed_;
  }

  /**
   * Applies internal CSS class names for the template attribute, so that styles
   * can use the class name instead of compound
   * amp-story-grid-layer[template="..."] selectors, since the latter increases
   * CSS specificity and can prevent users from being able to override styles.
   * @private
   */
  applyTemplateClassName_() {
    if (this.element.hasAttribute(TEMPLATE_ATTRIBUTE_NAME)) {
      const templateName = this.element.getAttribute(TEMPLATE_ATTRIBUTE_NAME);
      const templateClassName = GRID_LAYER_TEMPLATE_CLASS_NAMES[templateName];
      this.element.classList.add(templateClassName);
    }
  }

  /**
   * Copies the whitelisted CSS grid styles for descendants of the
   * <amp-story-grid-layer> element.
   * @private
   */
  setDescendentCssGridStyles_() {
    const elementsToUpgradeStyles = scopedQuerySelectorAll(this.element,
        SUPPORTED_CSS_GRID_ATTRIBUTES_SELECTOR);

    Array.prototype.forEach.call(elementsToUpgradeStyles, element => {
      this.setCssGridStyles_(element);
    });
  }

  /**
   * Styles text with a background color based on the value of
   * the text-background-color attribute
   * @private
   */
  setDescendentCssTextStyles_() {
    const elementsToUpgradeStyles = scopedQuerySelectorAll(this.element,
        TEXT_BACKGROUND_COLOR_SELECTOR);

    Array.prototype.forEach.call(elementsToUpgradeStyles, element => {
      const color = element.getAttribute(TEXT_BACKGROUND_COLOR_ATTRIBUTE_NAME);
      const spanEl =
          createElementWithAttributes(this.element.ownerDocument, 'span',
              {'style': `background-color:${color}`});
      spanEl.textContent = element.textContent;
      element.textContent = null;
      element.appendChild(spanEl);
    });
  }

  /**
   * Copies the whitelisted CSS grid styles for the <amp-story-grid-layer>
   * element itself.
   * @private
   */
  setOwnCssGridStyles_() {
    this.setCssGridStyles_(this.element);
  }

  /**
   * Copies the values of an element's attributes to its styles, if the
   * attributes/properties are in the whitelist.
   *
   * @param {!Element} element The element whose styles should be copied from
   *     its attributes.
   */
  setCssGridStyles_(element) {
    const styles = {};
    for (let i = element.attributes.length - 1; i >= 0; i--) {
      const attribute = element.attributes[i];
      const attributeName = attribute.name.toLowerCase();
      const propertyName = SUPPORTED_CSS_GRID_ATTRIBUTES[attributeName];
      if (propertyName) {
        styles[propertyName] = attribute.value;
        element.removeAttribute(attributeName);
      }
    }
    setStyles(element, assertDoesNotContainDisplay(styles));
  }
}
