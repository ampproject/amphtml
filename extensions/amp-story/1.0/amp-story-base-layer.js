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
 */

import {Layout} from '../../../src/layout';
import {StateProperty, getStoreService} from './amp-story-store-service';
import {escapeCssSelectorIdent} from '../../../src/css';
import {parseQueryString} from '../../../src/url';
import {px, setStyles} from '../../../src/style';

/**
 * Base layer template.
 */
export class AmpStoryBaseLayer extends AMP.BaseElement {
  /** @param {!AmpElement} element */
  constructor(element) {
    super(element);

    /** @private {?boolean} */
    this.isPrerenderActivePage_ = null;

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
   * Returns true if the page should be prerendered (for being an active page or first page)
   * @protected
   * @return {boolean}
   */
  isPrerenderActivePage() {
    if (this.isPrerenderActivePage_ != null) {
      return this.isPrerenderActivePage_;
    }
    const hashId = parseQueryString(this.win.location.href)['page'];
    let selector = 'amp-story-page:first-of-type';
    if (hashId) {
      selector += `, amp-story-page#${escapeCssSelectorIdent(hashId)}`;
    }
    const selectorNodes = this.win.document.querySelectorAll(selector);
    this.isPrerenderActivePage_ =
      selectorNodes[selectorNodes.length - 1] === this.element.parentElement;
    return this.isPrerenderActivePage_;
  }

  /** @protected */
  initializeAspectRatioListeners() {
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
