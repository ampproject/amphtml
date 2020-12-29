/**
 * Copyright 2018 The AMP HTML Authors. All Rights Reserved.
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
 * @fileoverview Base layer from which other layers in a story page extend from.
 * Contains functionality to listen for page size changes and mantain aspect-ratio.
 */

import {Layout} from '../../../src/layout';
import {StateProperty, getStoreService} from './amp-story-store-service';
import {matches} from '../../../src/dom';
import {px, setStyles} from '../../../src/style';

/**
 * The attribute name for grid layer templates.
 * @private @const {string}
 */
const TEMPLATE_ATTRIBUTE_NAME = 'template';

/**
 * A mapping of template attribute values to CSS class names.
 * @const {!Object<string, string>}
 */
export const LAYER_TEMPLATE_CLASS_NAMES = {
  'fill': 'i-amphtml-story-layer-template-fill',
  'vertical': 'i-amphtml-story-layer-template-vertical',
  'horizontal': 'i-amphtml-story-layer-template-horizontal',
  'thirds': 'i-amphtml-story-layer-template-thirds',
};

/**
 * Base layer template.
 */
export class AmpStoryBaseLayer extends AMP.BaseElement {
  /** @param {!AmpElement} element */
  constructor(element) {
    super(element);

    /** @private {?boolean} */
    this.isFirstPage_ = null;

    /** @private {?{horiz: number, vert: number}} */
    this.aspectRatio_ = null;
  }

  /** @override */
  isLayoutSupported(layout) {
    return layout == Layout.CONTAINER;
  }

  /** @override */
  buildCallback() {
    this.element.classList.add('i-amphtml-story-layer');
  }

  /**
   * Returns true if a child of the first page.
   * @return {boolean}
   */
  isFirstPage() {
    if (this.isFirstPage_ === null) {
      this.isFirstPage_ = matches(
        this.element,
        'amp-story-page:first-of-type > *'
      );
    }
    return this.isFirstPage_;
  }

  /**
   * Applies internal CSS class names for the template attribute, so that styles
   * can use the class name instead of compound
   * amp-story-grid-layer[template="..."] selectors, since the latter increases
   * CSS specificity and can prevent users from being able to override styles.
   * @protected
   */
  applyTemplateClassName_() {
    if (this.element.hasAttribute(TEMPLATE_ATTRIBUTE_NAME)) {
      const templateName = this.element.getAttribute(TEMPLATE_ATTRIBUTE_NAME);
      const templateClassName = LAYER_TEMPLATE_CLASS_NAMES[templateName];
      this.element.classList.add(templateClassName);
    }
  }

  /** @protected */
  initializeAspectRatioListeners_() {
    const aspectRatio = this.element.getAttribute('aspect-ratio');
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
        this.element.classList.add('i-amphtml-story-layer-template-aspect');
        setStyles(this.element, {
          '--i-amphtml-story-layer-width': px(width),
          '--i-amphtml-story-layer-height': px(height),
        });
      });
    }
  }
}
