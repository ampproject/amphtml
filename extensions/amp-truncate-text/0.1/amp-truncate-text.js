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
import {
  CSS as ShadowCSS,
} from '../../../build/amp-truncate-text-shadow-0.1.css';
import {dev} from '../../../src/log';
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

    /** @private {?MutationObserver} */
    this.mutationObserver_ = null;

    /** @private {boolean} */
    this.truncateRequested_ = false;
  }

  /** @override */
  buildCallback() {
    this.useShadow_ = !!this.element.attachShadow &&
      isExperimentOn(this.win, 'amp-truncate-text-shadow');

    if (this.useShadow_) {
      this.buildShadow_();
    } else {
      this.build_();
    }

    if ('MutationObserver' in window) {
      this.mutationObserver_ = new MutationObserver(() => {
        this.truncate_();
      });
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
    this.expandSlot_ = this.content_
        .querySelector('.i-amphtml-truncate-expand-slot');
    this.collapseSlot_ = this.content_
        .querySelector('.i-amphtml-truncate-collapse-slot');

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
    // TODO(sparhami) Where is the right place to put this? Runtime? What about
    // SSR?
    const sizer = this.element.querySelector('i-amphtml-sizer');
    if (sizer) {
      sizer.setAttribute('slot', 'sizer');
    }

    // TODO(sparhami) Is there a shared place to add logic for creating
    // shadow roots with styles? Might make sense to have it create the style
    // as well as a slot for the sizer.
    const sr = this.element.attachShadow({mode: 'open'});
    const style = document.createElement('style');
    style.textContent = ShadowCSS;
    const html = htmlFor(this.element);
    const content = html`
      <div>
        <div class="content">
          <slot></slot>
          <slot class="expand-slot" name="expand"></slot>
          <slot class="collapse-slot" name="collapse"></slot>
        </div>
        <slot name="sizer"></slot>
      </div>
    `;

    sr.appendChild(style);
    sr.appendChild(content);

    this.content_ = null;
    this.expandSlot_ = content.querySelector('.expand-slot');
    this.collapseSlot_ = content.querySelector('.collapse-slot');
  }

  /** @override */
  layoutCallback() {
    if (isExperimentOn(this.win, 'amp-truncate-text')) {
      this.truncate_();
    }

    return Promise.resolve();
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
   * Stops listening for mutations, if we have a `MutationObserver`.
   * @private
   */
  unlistenForMutations_() {
    if (this.mutationObserver_) {
      this.mutationObserver_.disconnect();
    }
  }

  /**
   * Starts listening for mutations, if we have a `MutationObserver`.
   * @private
   */
  listenForMutations_() {
    if (this.mutationObserver_) {
      this.mutationObserver_.observe(this.element, {
        attributes: true,
        characterData: true,
        childList: true,
        subtree: true,
      });
    }
  }

  /**
   * Truncates the content of the element. This is debounced as runtime will do
   * a mutation (add a class) right after `layoutCallback`. We want to make
   * sure we do not truncate twice as a result. TODO(sparhami) Try to find a
   * better solution for this.
   * @private
   */
  truncate_() {
    if (this.truncateRequested_) {
      return;
    }

    this.truncateRequested_ = true;

    Promise.resolve()
        .then(() => {
        // Runtime will actually trigger another mutation one microtask after
        // layoutCallback finishes, so we need to delay one additional
        // microtask for that.
        })
        .then(() => {
          this.truncateRequested_ = false;

          const container = dev().assertElement(
              this.useShadow_ ? this.element : this.content_);
          const overflowElement = this.useShadow_ ?
            this.element.querySelector('[slot="expand"]') :
            this.element.querySelector('.i-amphtml-truncate-expand-slot');

          // Make sure mutations from truncateing do not trigger truncateing.
          this.unlistenForMutations_();
          truncateText({
            container,
            overflowElement,
          });
          // Listen to all changes, since they may change layout and require
          // retruncateing.
          this.listenForMutations_();
        });
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
