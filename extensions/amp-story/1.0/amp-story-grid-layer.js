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
import {StateProperty, getStoreService} from './amp-story-store-service';
import {assertDoesNotContainDisplay, px, setStyles} from '../../../src/style';
import {isPrerenderActivePage} from './prerender-active-page';
import {scopedQuerySelectorAll} from '../../../src/dom';

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
const SUPPORTED_CSS_GRID_ATTRIBUTES_SELECTOR = Object.keys(
  SUPPORTED_CSS_GRID_ATTRIBUTES
)
  .map((key) => `[${key}]`)
  .join(',');

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
 * The attribute name for grid layer presets.
 * @private @const {string}
 */
const PRESET_ATTRIBUTE_NAME = 'preset';

/**
 * @typedef {{
 *  aspect-ratio: string,
 *  scaling-factor: ?float,
 * }}
 */
export let PresetDetails;

/**
 * The attributes that will be applied for each preset.
 * @private @const {!Object<string, !PresetDetails>}
 */
const GRID_LAYER_PRESET_DETAILS = {
  '2021-background': {
    'aspect-ratio': '69:116',
    'scaling-factor': 1.142,
  },
  '2021-foreground': {
    'aspect-ratio': '69:116',
  },
};

/**
 * Grid layer template templating system.
 */
export class AmpStoryGridLayer extends AmpStoryBaseLayer {
  /** @override @nocollapse */
  static prerenderAllowed(element) {
    return isPrerenderActivePage(element.parentElement);
  }

  /** @param {!AmpElement} element */
  constructor(element) {
    super(element);

    /** @private {?{horiz: number, vert: number}} */
    this.aspectRatio_ = null;

    /** @private {number} */
    this.scalingFactor_ = 1;
  }

  /** @override */
  buildCallback() {
    super.buildCallback();
    this.applyResponsivenessPresets_();
    this.applyTemplateClassName_();
    this.setOwnCssGridStyles_();
    this.setDescendentCssGridStyles_();
    this.initializeListeners_();
  }

  /**
   * Applies the attributes to the layer from the preset specified in the [preset] attribute.
   * @private
   */
  applyResponsivenessPresets_() {
    if (!this.element.hasAttribute(PRESET_ATTRIBUTE_NAME)) {
      return;
    }
    const preset = this.element.getAttribute(PRESET_ATTRIBUTE_NAME);
    const presetDetails = GRID_LAYER_PRESET_DETAILS[preset];
    if (!presetDetails) {
      return;
    }
    Object.entries(presetDetails).forEach((keyValue) =>
      this.element.setAttribute(keyValue[0], keyValue[1])
    );
  }

  /** @private */
  initializeListeners_() {
    const aspectRatio = this.element.getAttribute('aspect-ratio');
    const scalingFactorFloat = parseFloat(
      this.element.getAttribute('scaling-factor')
    );
    if (scalingFactorFloat && scalingFactorFloat > 0) {
      this.scalingFactor_ = scalingFactorFloat;
    }
    if (aspectRatio) {
      const aspectRatioSplits = aspectRatio.split(':');
      const horiz = parseInt(aspectRatioSplits[0], 10);
      const vert = parseInt(aspectRatioSplits[1], 10);
      if (horiz > 0 && vert > 0) {
        this.aspectRatio_ = {horiz, vert};
        const storeService = getStoreService(this.win);
        storeService.subscribe(
          StateProperty.PAGE_SIZE,
          this.updatePageSize_.bind(this),
          true /* callToInitialize */
        );
      }
    }
  }

  /**
   * @param {?{width: number, height: number}} pageSize
   * @private
   */
  updatePageSize_(pageSize) {
    if (!pageSize) {
      return;
    }
    const {width: vw, height: vh} = pageSize;
    const {horiz, vert} = this.aspectRatio_;
    const width = Math.min(vw, (vh * horiz) / vert);
    const height = Math.min(vh, (vw * vert) / horiz);
    if (width > 0 && height > 0) {
      this.getVsync().mutate(() => {
        this.element.classList.add('i-amphtml-story-grid-template-aspect');
        setStyles(this.element, {
          '--i-amphtml-story-layer-width': px(width * this.scalingFactor_),
          '--i-amphtml-story-layer-height': px(height * this.scalingFactor_),
        });
      });
    }
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
   * Copies the allowlisted CSS grid styles for descendants of the
   * <amp-story-grid-layer> element.
   * @private
   */
  setDescendentCssGridStyles_() {
    const elementsToUpgradeStyles = scopedQuerySelectorAll(
      this.element,
      SUPPORTED_CSS_GRID_ATTRIBUTES_SELECTOR
    );

    Array.prototype.forEach.call(elementsToUpgradeStyles, (element) => {
      this.setCssGridStyles_(element);
    });
  }

  /**
   * Copies the allowlisted CSS grid styles for the <amp-story-grid-layer>
   * element itself.
   * @private
   */
  setOwnCssGridStyles_() {
    this.setCssGridStyles_(this.element);
  }

  /**
   * Copies the values of an element's attributes to its styles, if the
   * attributes/properties are in the allowlist.
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
