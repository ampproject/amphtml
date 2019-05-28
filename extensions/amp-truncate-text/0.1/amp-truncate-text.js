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

import {CSS} from '../../../build/amp-truncate-text-0.1.css';
import {CSS as ShadowCSS} from '../../../build/amp-truncate-text-shadow-0.1.css';
import {createShadowRoot} from './shadow-utils';
import {dev, userAssert} from '../../../src/log';
import {htmlFor} from '../../../src/static-template';
import {isExperimentOn} from '../../../src/experiments';
import {iterateCursor} from '../../../src/dom';
import {truncateText} from './truncate-text';

/**
 * TODO(sparhami) List of stuff to do / consider:
 * - Delay truncateing for things outside of the viewport
 * - Only truncate a few things in a single pass, and defer others
 * - If estimation + mutation takes too long, fall back to gradient
 *   or perhaps nothing and position absolute the button on top of
 *   text
 *     * Maybe let the developer specify the gradient
 * - If we had some rough bucket of performance, maybe just fallback
 *   immediately to gradient / hard cut off.
 * - Custom fonts can cause truncation to end up being wrong
 *   when they load
 *     * Can we just wait to layout if we know a font is loading?
 *       Since all fonts are statically declared in AMP, this is just a
 *       one time thing
 */
export class AmpTruncateText extends AMP.BaseElement {
  /** @param {!AmpElement} element */
  constructor(element) {
    super(element);

    /** @private {?Element} */
    this.content_ = null;

    /** @private {?Element} */
    this.expandSlot_ = null;

    /** @private {?Element} */
    this.collapseSlot_ = null;

    /** @private {boolean} */
    this.useShadow_ = false;

    /** @private {!MutationObserver} */
    this.mutationObserver_ = new this.win.MutationObserver(() => {
      this.truncate_();
    });
  }

  /** @override */
  buildCallback() {
    userAssert(
      isExperimentOn(this.win, 'amp-truncate-text'),
      'The amp-truncate-text experiment must be enabled to use this ' +
        'component.'
    );

    this.useShadow_ =
      !!this.element.attachShadow &&
      isExperimentOn(this.win, 'amp-truncate-text-shadow');

    if (this.useShadow_) {
      this.buildShadow_();
    } else {
      this.build_();
    }

    this.expandSlot_.addEventListener('click', () => this.expand_());
    this.collapseSlot_.addEventListener('click', () => this.collapse_());
  }

  /**
   * Builds the component when not using Shadow DOM.
   */
  build_() {
    const html = htmlFor(this.element);
    this.content_ = html`
      <div class="i-amphtml-truncate-content">
        <span class="i-amphtml-default-slot"></span>
        <span class="i-amphtml-truncate-expand-slot" name="expand"></span>
        <span class="i-amphtml-truncate-collapse-slot" name="collapse"></span>
      </div>
    `;

    const defaultSlot = this.content_.querySelector('.i-amphtml-default-slot');
    this.expandSlot_ = this.content_.querySelector(
      '.i-amphtml-truncate-expand-slot'
    );
    this.collapseSlot_ = this.content_.querySelector(
      '.i-amphtml-truncate-collapse-slot'
    );

    iterateCursor(this.element.querySelectorAll('[slot="expand"]'), el => {
      this.expandSlot_.appendChild(el);
    });
    iterateCursor(this.element.querySelectorAll('[slot="collapse"]'), el => {
      this.collapseSlot_.appendChild(el);
    });
    this.getRealChildNodes().forEach(node => {
      defaultSlot.appendChild(node);
    });

    this.element.appendChild(this.content_);
  }

  /**
   * Builds the component when using Shadow DOM.
   */
  buildShadow_() {
    const html = htmlFor(this.element);
    const sr = createShadowRoot(
      this.element,
      ShadowCSS,
      html`
        <div class="content">
          <slot></slot>
          <slot class="expand-slot" name="expand"></slot>
          <slot class="collapse-slot" name="collapse"></slot>
        </div>
      `
    );

    this.content_ = null;
    this.expandSlot_ = sr.querySelector('.expand-slot');
    this.collapseSlot_ = sr.querySelector('.collapse-slot');
  }

  /** @override */
  layoutCallback() {
    return this.mutateElement(() => {
      this.truncate_();
    });
  }

  /** @override */
  firstAttachedCallback() {
    this.mutationObserver_.observe(this.element, {
      attributes: true,
      characterData: true,
      childList: true,
      subtree: true,
    });
  }

  /** @override */
  isRelayoutNeeded() {
    return true;
  }

  /** @override */
  isLayoutSupported() {
    return true;
  }

  /**
   * Truncates the content of the element.
   * @private
   */
  truncate_() {
    const container = dev().assertElement(
      this.useShadow_ ? this.element : this.content_
    );
    const overflowElement = this.useShadow_
      ? this.element.querySelector('[slot="expand"]')
      : this.element.querySelector('.i-amphtml-truncate-expand-slot');

    truncateText({
      container,
      overflowElement,
    });
    // Take the records to clear them out. This prevents mutations from
    // the truncation from invoking the observer's callback.
    this.mutationObserver_.takeRecords();
  }

  /**
   * Expands the component by removing any height restriction via CSS.
   */
  expand_() {
    this.element.setAttribute('i-amphtml-truncate-expanded', '');
  }

  /**
   * Collapses the component by undoing the effects of `expand_()`.
   */
  collapse_() {
    this.element.removeAttribute('i-amphtml-truncate-expanded');
  }
}

AMP.extension('amp-truncate-text', '0.1', AMP => {
  AMP.registerElement('amp-truncate-text', AmpTruncateText, CSS);
});
