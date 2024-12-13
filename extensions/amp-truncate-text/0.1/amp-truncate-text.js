import {
  closestAncestorElementBySelector,
  realChildNodes,
} from '#core/dom/query';
import {htmlFor} from '#core/dom/static-template';
import {toArray} from '#core/types/array';

import {isExperimentOn} from '#experiments';

import {Services} from '#service';

import {dev} from '#utils/log';

import {createShadowRoot} from './shadow-utils';
import {truncateText} from './truncate-text';

import {CSS} from '../../../build/amp-truncate-text-0.1.css';
import {CSS as ShadowCSS} from '../../../build/amp-truncate-text-shadow-0.1.css';

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
  /**
   * Sets up the actions supported by this element.
   * @private
   */
  setupActions_() {
    this.registerAction('expand', () => this.expand_());
    this.registerAction('collapse', () => this.collapse_());
  }

  /** @param {!AmpElement} element */
  constructor(element) {
    super(element);

    /** @private {?Element} */
    this.content_ = null;

    /** @private {?Element} */
    this.collapsedSlot_ = null;

    /** @private {?Element} */
    this.expandedSlot_ = null;

    /** @private {?Element} */
    this.persistentSlot_ = null;

    /** @private {boolean} */
    this.useShadow_ = false;

    /** @private {!MutationObserver} */
    this.mutationObserver_ = new this.win.MutationObserver(() => {
      this.truncate_();
    });
  }

  /** @override */
  buildCallback() {
    this.mutationObserver_.observe(this.element, {
      attributes: true,
      characterData: true,
      childList: true,
      subtree: true,
    });

    this.useShadow_ =
      !!this.element.attachShadow &&
      isExperimentOn(this.win, 'amp-truncate-text-shadow');

    if (this.useShadow_) {
      this.buildShadow_();
    } else {
      this.build_();
    }

    this.setupActions_();
    this.collapsedSlot_.addEventListener('click', (event) => {
      this.maybeExpand_(event);
    });
    this.expandedSlot_.addEventListener('click', (event) => {
      this.maybeCollapse_(event);
    });
  }

  /**
   * Builds the component when not using Shadow DOM.
   */
  build_() {
    const html = htmlFor(this.element);
    this.content_ = html`
      <div class="i-amphtml-truncate-content">
        <span class="i-amphtml-default-slot"></span>
        <span class="i-amphtml-truncate-collapsed-slot" name="collapsed"></span>
        <span class="i-amphtml-truncate-expanded-slot" name="expanded"></span>
        <span
          class="i-amphtml-truncate-persistent-slot"
          name="persistent"
        ></span>
      </div>
    `;

    const defaultSlot = this.content_.querySelector('.i-amphtml-default-slot');

    this.collapsedSlot_ = this.content_.querySelector(
      '.i-amphtml-truncate-collapsed-slot'
    );
    this.expandedSlot_ = this.content_.querySelector(
      '.i-amphtml-truncate-expanded-slot'
    );
    this.persistentSlot_ = this.content_.querySelector(
      '.i-amphtml-truncate-persistent-slot'
    );

    this.element.querySelectorAll('[slot="collapsed"]').forEach((el) => {
      this.collapsedSlot_.appendChild(el);
    });
    this.element.querySelectorAll('[slot="expanded"]').forEach((el) => {
      this.expandedSlot_.appendChild(el);
    });
    this.element.querySelectorAll('[slot="persistent"]').forEach((el) => {
      this.persistentSlot_.appendChild(el);
    });
    realChildNodes(this.element).forEach((node) => {
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
          <slot class="collapsed-slot" name="collapsed"></slot>
          <slot class="expanded-slot" name="expanded"></slot>
          <slot class="persistent-slot" name="persistent"></slot>
        </div>
      `
    );

    this.content_ = null;
    this.collapsedSlot_ = sr.querySelector('.collapsed-slot');
    this.expandedSlot_ = sr.querySelector('.expanded-slot');
    this.persistentSlot_ = sr.querySelector('.persistent-slot');
  }

  /** @override */
  layoutCallback() {
    return this.mutateElement(() => {
      this.truncate_();
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
   * @return {!Array<!Node>} The nodes to show when overflowing.
   */
  getNodesForOverflow_() {
    if (this.useShadow_) {
      return toArray(
        this.element.querySelectorAll('[slot="persistent"], [slot="collapsed"]')
      );
    }

    return toArray(
      this.element.querySelectorAll(
        '.i-amphtml-truncate-persistent-slot, .i-amphtml-truncate-collapsed-slot'
      )
    );
  }

  /**
   * Truncates the content of the element.
   * @private
   */
  truncate_() {
    const container = dev().assertElement(
      this.useShadow_ ? this.element : this.content_
    );
    const overflowNodes = this.getNodesForOverflow_();

    truncateText({
      container,
      overflowNodes,
    });
    // Take the records to clear them out. This prevents mutations from
    // the truncation from invoking the observer's callback.
    this.mutationObserver_.takeRecords();
  }

  /**
   * Expands the component, unless the event came from an element that is
   * actionable.
   * @param {!Event} event
   */
  maybeExpand_(event) {
    this.maybeToggle_(event, true);
  }

  /**
   * Collapses the component, unless the event came from an element that is
   * actionable.
   * @param {!Event} event
   */
  maybeCollapse_(event) {
    this.maybeToggle_(event, false);
  }

  /**
   * Expand/collapses the component unless the element already has an
   * associated action or will navigate.
   * @param {!Event} event
   * @param {boolean} expand Whether to expand or collapse.
   */
  maybeToggle_(event, expand) {
    const target = dev().assertElement(event.target);
    const actionService = Services.actionServiceForDoc(this.element);

    // If we have a tap action on any ancestor, then skip expansion.
    if (actionService.hasAction(target, 'tap')) {
      return;
    }

    // If we have an ancestor anchor (either for the slotted element, or
    // wrapping the whole amp-truncate-text). skip expansion.
    if (closestAncestorElementBySelector(target, 'a[href]')) {
      return;
    }

    if (expand) {
      this.expand_();
    } else {
      this.collapse_();
    }
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

AMP.extension('amp-truncate-text', '0.1', (AMP) => {
  AMP.registerElement('amp-truncate-text', AmpTruncateText, CSS);
});
