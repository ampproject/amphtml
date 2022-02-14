import {AmpEvents_Enum} from '#core/constants/amp-events';
import {Keys_Enum} from '#core/constants/key-codes';
import {isConnectedNode, isRTL, tryFocus} from '#core/dom';
import {Layout_Enum} from '#core/dom/layout';
import {setModalAsClosed, setModalAsOpen} from '#core/dom/modal';
import {
  closest,
  closestAncestorElementBySelector,
  scopedQuerySelector,
  scopedQuerySelectorAll,
} from '#core/dom/query';
import {mod} from '#core/math';
import {toArray} from '#core/types/array';

import {Services} from '#service';

import {dev, userAssert} from '#utils/log';

import {CSS} from '../../../build/amp-mega-menu-0.1.css';

/** @const {string} */
const TAG = 'amp-mega-menu';

/** @const {string} */
const ARIA_LABEL_CLOSE = 'Close the menu';

/**
 * A mega menu component suitable for displaying large collections of links on
 * desktop/tablets. An amp-list can be nested inside this component to enable
 * template rendering via dynamically fetched data.
 */
export class AmpMegaMenu extends AMP.BaseElement {
  /** @override  */
  static prerenderAllowed() {
    return true;
  }

  /** @param {!AmpElement} element */
  constructor(element) {
    super(element);

    /** @private {!Array<!Element>} */
    this.items_ = [];

    /** @private {number} */
    this.itemCount_ = 0;

    /** @private {?Element} */
    this.expandedItem_ = null;

    /** @private {?Element} */
    this.maskElement_ = null;

    /** @private @const {!Document} */
    this.document_ = this.win.document;

    /** @private @const {!Element} */
    this.documentElement_ = this.document_.documentElement;

    /** @private {?../../../src/service/action-impl.ActionService} */
    this.action_ = null;

    /** @private {number|string} */
    this.prefix_ = element.id || Math.floor(Math.random() * 100);

    /** @private {function(!Event)} */
    this.domUpdateHandler_ = this.registerMenuItems_.bind(this);

    /** @private {function(!Event)} */
    this.rootClickHandler_ = this.handleRootClick_.bind(this);

    /** @private {function(!Event)} */
    this.rootKeyDownHandler_ = this.handleRootKeyDown_.bind(this);
  }

  /** @override */
  isLayoutSupported(layout) {
    return layout === Layout_Enum.FIXED_HEIGHT;
  }

  /** @override */
  buildCallback() {
    this.action_ = Services.actionServiceForDoc(this.element);
  }

  /** @override */
  layoutCallback() {
    this.registerMenuItems_();
    // items may not be present after build if dynamically rendered via amp-list,
    // in which case register them after DOM update instead.
    this.element.addEventListener(
      AmpEvents_Enum.DOM_UPDATE,
      this.domUpdateHandler_
    );

    if (!this.maskElement_) {
      this.maskElement_ = this.createMaskElement_();
    }

    return Promise.resolve();
  }

  /** @override */
  unlayoutCallback() {
    this.element.removeEventListener(
      AmpEvents_Enum.DOM_UPDATE,
      this.domUpdateHandler_
    );
    // Ensure that menu is closed when hidden via media query.
    this.collapse_();
    return true;
  }

  /**
   * Create a new mask element and append it to the header if present,
   * otherwise to the component itself.
   * @return {!Element} the mask that was created.
   * @private
   */
  createMaskElement_() {
    const mask = this.document_.createElement('div');
    mask.classList.add('i-amphtml-mega-menu-mask');
    mask.setAttribute('aria-hidden', 'true');
    // append mask to header so that all children of header appear above the mask
    const maskParent =
      closestAncestorElementBySelector(this.element, 'header') || this.element;
    maskParent.classList.add('i-amphtml-mega-menu-mask-parent');
    maskParent.appendChild(mask);
    return mask;
  }

  /**
   * Find all menu items under this mega menu and register them if they are not
   * already registered.
   * @private
   */
  registerMenuItems_() {
    this.items_ = toArray(scopedQuerySelectorAll(this.element, 'nav > * > li'));
    // first filter out items that have already been registered.
    this.items_
      .filter((item) => !item.classList.contains('i-amphtml-mega-menu-item'))
      .forEach((item) => {
        // if item has only one child, then use that as the heading element.
        if (item.childElementCount == 1) {
          const heading = dev().assertElement(item.firstElementChild);
          this.registerMenuItem_(item, heading, null);
          return;
        }
        const heading =
          scopedQuerySelector(item, '> button') ||
          scopedQuerySelector(item, '> [role=button]');
        const content = scopedQuerySelector(item, '> [role=dialog]');
        userAssert(
          heading,
          `${TAG} requires each expandable item to include a button that toggles it.`
        );
        this.registerMenuItem_(item, heading, content);
      });
  }

  /**
   * Register the given menu item by adding appropriate classes, accessibility
   * attributes and event listeners to its children.
   * @param {!Element} item
   * @param {!Element} heading
   * @param {?Element} content
   * @private
   */
  registerMenuItem_(item, heading, content) {
    item.classList.add('i-amphtml-mega-menu-item');
    this.itemCount_++;

    heading.classList.add('i-amphtml-mega-menu-heading');
    if (!heading.hasAttribute('tabindex')) {
      heading.setAttribute('tabindex', 0);
    }
    heading.addEventListener('click', (e) => this.handleHeadingClick_(e));
    heading.addEventListener('keydown', (e) => this.handleHeadingKeyDown_(e));

    // Skip if item does not have a submenu or its heading already has tap action.
    if (!content || this.action_.hasAction(heading, 'tap', item)) {
      return;
    }
    content.classList.add('i-amphtml-mega-menu-content');
    content.setAttribute('aria-modal', 'false');
    let contentId = content.getAttribute('id');
    if (!contentId) {
      // For accessibility, we need to make sure that each item has a unique ID.
      // If ID is absent, we use a random number to ensure uniqueness.
      contentId = this.prefix_ + '_AMP_content_' + this.itemCount_;
      content.setAttribute('id', contentId);
    }
    // add invisible close buttons at the start and end of each content element.
    content.insertBefore(
      this.createScreenReaderCloseButton_(),
      content.firstChild
    );
    content.appendChild(this.createScreenReaderCloseButton_());

    // haspopup value not set to menu since content can contain more than links.
    heading.setAttribute('aria-haspopup', 'dialog');
    heading.setAttribute('aria-controls', contentId);
    heading.setAttribute('aria-expanded', 'false');
  }

  /**
   * Handle click event on document element to collapse mega menu if opened;
   * do nothing if click is inside the expanded content element.
   * @param {!Event} event click event.
   * @private
   */
  handleRootClick_(event) {
    const target = dev().assertElement(event.target);
    if (
      this.expandedItem_ &&
      !this.expandedItem_.contains(target) &&
      // since amp-video immediately removes its mask on first click, this check
      // prevents menu from collapsing due to target no longer being attached.
      isConnectedNode(target)
    ) {
      this.collapse_();
    }
  }

  /**
   * Handle keydown event on document element to collapse mega menu on ESC.
   * @param {!Event} event keydown event.
   * @private
   */
  handleRootKeyDown_(event) {
    if (event.key === Keys_Enum.ESCAPE && this.collapse_()) {
      event.preventDefault();
    }
  }

  /**
   * Handler for item heading's on-click event to expand/collapse its content.
   * @param {!Event} event click event.
   * @private
   */
  handleHeadingClick_(event) {
    if (!this.shouldHandleClick_(event)) {
      return;
    }
    event.preventDefault();
    event.stopPropagation();
    const item = dev().assertElement(event.currentTarget.parentElement);
    const previousItem = this.collapse_();
    if (item != previousItem) {
      this.expand_(item);
    }
  }

  /**
   * We should support clicks on any children of the heading except for on
   * links or elements with tap targets, which should not have their default
   * behavior overidden.
   * @param {!Event} event
   * @return {boolean}
   * @private
   */
  shouldHandleClick_(event) {
    const target = dev().assertElement(event.target);
    const currentTarget = dev().assertElement(event.currentTarget);
    const hasAnchor = !!closest(target, (e) => e.tagName == 'A', currentTarget);
    if (hasAnchor) {
      return false;
    }
    const hasTapAction = this.action_.hasAction(target, 'tap', currentTarget);
    if (hasTapAction) {
      return false;
    }
    // do not handle click if heading has no associated content element.
    return currentTarget.hasAttribute('aria-haspopup');
  }

  /**
   * Handler for key presses on an item heading.
   * @param {!Event} event keydown event.
   * @private
   */
  handleHeadingKeyDown_(event) {
    if (event.defaultPrevented) {
      return;
    }
    const {key} = event;
    switch (key) {
      case Keys_Enum.LEFT_ARROW: /* fallthrough */
      case Keys_Enum.RIGHT_ARROW:
        this.handleNavigationKeyDown_(event);
        return;
      case Keys_Enum.ENTER: /* fallthrough */
      case Keys_Enum.SPACE:
        if (event.target == event.currentTarget) {
          this.handleHeadingClick_(event);
        }
        return;
    }
  }

  /**
   * Handler for arrow key presses to navigate between menu items.
   * @param {!Event} event keydown event.
   * @private
   */
  handleNavigationKeyDown_(event) {
    const item = dev().assertElement(event.currentTarget.parentElement);
    const index = this.items_.indexOf(item);
    if (index !== -1) {
      event.preventDefault();
      let dir = event.key == Keys_Enum.LEFT_ARROW ? -1 : 1;
      // Left is 'previous' in LTR and 'next' in RTL; vice versa for Right.
      if (isRTL(this.document_)) {
        dir = -dir;
      }
      // If user navigates one past the beginning or end, wrap around.
      const newIndex = mod(index + dir, this.items_.length);
      tryFocus(this.getItemHeading_(this.items_[newIndex]));
    }
  }

  /**
   * Expand the given item to show its menu content.
   * @param {!Element} item
   * @private
   */
  expand_(item) {
    this.mutateElement(() => {
      // Wait for mutateElement, so that the element has been transfered to the
      // fixed layer. This is needed to hide the correct elements.
      const content = this.getItemContent_(item);
      setModalAsOpen(content);
      content.setAttribute('aria-modal', 'true');
    });
    item.setAttribute('open', '');
    this.element.setAttribute('open', '');
    this.maskElement_.setAttribute('open', '');
    const heading = this.getItemHeading_(item);
    heading.setAttribute('aria-expanded', 'true');
    const screenReaderCloseButton = dev().assertElement(
      item.querySelector('.i-amphtml-screen-reader')
    );
    tryFocus(screenReaderCloseButton);
    // add event listeners on the html element for closing the menu
    this.documentElement_.addEventListener('click', this.rootClickHandler_);
    this.documentElement_.addEventListener('keydown', this.rootKeyDownHandler_);
    this.expandedItem_ = item;
  }

  /**
   * Collapse any expanded item inside the mega menu.
   * @return {?Element} the item that was previously expanded, if any.
   * @private
   */
  collapse_() {
    if (!this.expandedItem_) {
      return null;
    }
    const item = dev().assertElement(this.expandedItem_);
    this.mutateElement(() => {
      const content = this.getItemContent_(item);
      setModalAsClosed(content);
      content.setAttribute('aria-modal', 'false');
    });
    item.removeAttribute('open');
    this.element.removeAttribute('open');
    this.maskElement_.removeAttribute('open');
    const heading = this.getItemHeading_(item);
    heading.setAttribute('aria-expanded', 'false');
    // shift focus to heading only if it's currently inside the item.
    if (item.contains(this.document_.activeElement)) {
      tryFocus(heading);
    }
    // remove event listeners on the html element
    this.documentElement_.removeEventListener('click', this.rootClickHandler_);
    this.documentElement_.removeEventListener(
      'keydown',
      this.rootKeyDownHandler_
    );
    this.expandedItem_ = null;
    return item;
  }

  /**
   * Return the heading of given menu item.
   * @param {!Element} item
   * @return {!Element}
   * @private
   */
  getItemHeading_(item) {
    const heading = scopedQuerySelector(item, '> .i-amphtml-mega-menu-heading');
    return dev().assertElement(heading);
  }

  /**
   * Return the expandable content of given menu item.
   * @param {!Element} item
   * @return {!Element}
   * @private
   */
  getItemContent_(item) {
    const content = scopedQuerySelector(item, '> .i-amphtml-mega-menu-content');
    return dev().assertElement(content);
  }

  /**
   * Creates an "invisible" close button for screen readers to collapse the
   * mega menu.
   * @return {!Element}
   * @private
   */
  createScreenReaderCloseButton_() {
    const ariaLabel =
      this.element.getAttribute('data-close-button-aria-label') ||
      ARIA_LABEL_CLOSE;

    // Invisible close button at the end of menu content for screen-readers.
    const screenReaderCloseButton = this.document_.createElement('button');

    screenReaderCloseButton.textContent = ariaLabel;
    screenReaderCloseButton.classList.add('i-amphtml-screen-reader');
    screenReaderCloseButton.addEventListener('click', () => this.collapse_());

    return screenReaderCloseButton;
  }
}

AMP.extension(TAG, '0.1', (AMP) => {
  AMP.registerElement(TAG, AmpMegaMenu, CSS);
});
