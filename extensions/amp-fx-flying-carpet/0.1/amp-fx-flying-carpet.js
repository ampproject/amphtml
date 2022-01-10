import {CommonSignals_Enum} from '#core/constants/common-signals';
import {Layout_Enum} from '#core/dom/layout';
import {realChildElements, realChildNodes} from '#core/dom/query';
import {setStyle} from '#core/dom/style';

import {Services} from '#service';

import {dev, userAssert} from '#utils/log';

import {CSS} from '../../../build/amp-fx-flying-carpet-0.1.css';

const TAG = 'amp-fx-flying-carpet';

export class AmpFlyingCarpet extends AMP.BaseElement {
  /** @param {!AmpElement} element */
  constructor(element) {
    super(element);

    /**
     * Preserved so that we may keep track of the "good" children. When an
     * element collapses, we remove it from the list.
     *
     * @type {!Array<!Element>}
     * @private
     */
    this.children_ = [];

    /**
     * The number of non-empty child nodes left that are still "good". If no
     * more are left, we attempt to collapse the flying carpet.
     * Note that this may not be the number for child elements, since Text also
     * appears inside the flying carpet.
     *
     * @type {number}
     * @private
     */
    this.totalChildren_ = 0;

    /**
     * A cached reference to the container, used to set its width to match
     * the flying carpet's.
     * @type {?Element}
     * @private
     */
    this.container_ = null;

    /** @private {boolean} */
    this.initialPositionChecked_ = false;
  }

  /** @override */
  isLayoutSupported(layout) {
    return layout == Layout_Enum.FIXED_HEIGHT;
  }

  /** @override */
  isRelayoutNeeded() {
    return true;
  }

  /** @override */
  buildCallback() {
    const doc = this.element.ownerDocument;
    const container = doc.createElement('div');

    this.children_ = realChildElements(this.element);
    this.container_ = container;

    const childNodes = realChildNodes(this.element);
    this.totalChildren_ = this.visibileChildren_(childNodes).length;

    const owners = Services.ownersForDoc(this.element);
    this.children_.forEach((child) => owners.setOwner(child, this.element));

    const clip = doc.createElement('div');
    clip.setAttribute('class', 'i-amphtml-fx-flying-carpet-clip');
    container.setAttribute('class', 'i-amphtml-fx-flying-carpet-container');

    childNodes.forEach((child) => container.appendChild(child));
    clip.appendChild(container);
    this.element.appendChild(clip);

    // Make the fixed-layer track the container, but never transfer it out of
    // this DOM tree. Tracking allows us to compensate for the Viewer's header,
    // but transferring would break the clipping UI.
    this.getViewport().addToFixedLayer(
      container,
      /* opt_forceTransfer */ false
    );
  }

  /**
   * Asserts that the flying carpet does not appear in the first or last
   * viewport.
   * @private
   */
  assertPosition_() {
    const layoutBox = this.element.getLayoutBox();
    const viewport = this.getViewport();
    const viewportHeight = viewport.getHeight();
    // TODO(jridgewell): This should really be the parent scroller, not
    // necessarily the root. But, flying carpet only works as a child of the
    // root scroller, for now.
    const docHeight = viewport.getScrollHeight();
    // Hmm, can the page height change and affect us?
    const minTop = viewportHeight * 0.75;
    const maxTop = docHeight - viewportHeight * 0.95;
    userAssert(
      layoutBox.top >= minTop,
      '<amp-fx-flying-carpet> elements must be positioned after the 75% of' +
        ' first viewport: %s Current position: %s. Min: %s',
      this.element,
      layoutBox.top,
      minTop
    );
    userAssert(
      layoutBox.top <= maxTop,
      '<amp-fx-flying-carpet> elements must be positioned before the last ' +
        'viewport: %s Current position: %s. Max: %s',
      this.element,
      layoutBox.top,
      maxTop
    );
  }

  /** @override */
  layoutCallback() {
    if (!this.initialPositionChecked_) {
      try {
        this.assertPosition_();
      } catch (e) {
        // Collapse the element if the effect is broken by the viewport location.
        this./*OK*/ collapse();
        throw e;
      }
      this.initialPositionChecked_ = true;
    }

    const {width} = this.element.getLayoutSize();
    setStyle(this.container_, 'width', width, 'px');
    Services.ownersForDoc(this.element).scheduleLayout(
      this.element,
      this.children_
    );
    this.observeNewChildren_();
    this.forceClipDraw_();
    return Promise.resolve();
  }

  /**
   * Something causes browsers to forget to redraw the content of the container when they become visible.
   * @private
   */
  forceClipDraw_() {
    const inob = new this.win.IntersectionObserver(
      (entries) => {
        const last = entries[entries.length - 1];
        this.container_.classList.toggle(
          'i-amphtml-fx-flying-carpet-container-fix',
          last.isIntersecting
        );
      },
      {threshold: 0.01}
    );
    inob.observe(this.element);
  }

  /**
   * Makes sure we schedule layout for elements as they are added
   * to the flying carpet.
   * @private
   */
  observeNewChildren_() {
    const observer = new MutationObserver((changes) => {
      for (let i = 0; i < changes.length; i++) {
        const {addedNodes} = changes[i];
        if (!addedNodes) {
          continue;
        }
        for (let n = 0; n < addedNodes.length; n++) {
          const node = addedNodes[n];
          if (!node.signals) {
            continue;
          }
          node
            .signals()
            .whenSignal(CommonSignals_Enum.BUILT)
            .then(this.layoutBuiltChild_.bind(this, node));
        }
      }
    });
    observer.observe(this.element, {
      childList: true,
      subtree: true,
    });
  }

  /**
   * Listens for children element to be built, and schedules their layout.
   * Necessary since not all children will be built by the time the
   * flying-carpet has its #layoutCallback called.
   * @param {!Node} node
   * @private
   */
  layoutBuiltChild_(node) {
    const child = dev().assertElement(node);
    if (child.getOwner() === this.element) {
      Services.ownersForDoc(this.element).scheduleLayout(this.element, child);
    }
  }

  /** @override */
  collapsedCallback(child) {
    const index = this.children_.indexOf(child);
    if (index > -1) {
      this.children_.splice(index, 1);
      this.totalChildren_--;
      if (this.totalChildren_ == 0) {
        return this.attemptCollapse().catch(() => {});
      }
    }
  }

  /**
   * Returns our discovered children
   * @return {!Array<!Element>}
   */
  getChildren() {
    return this.children_;
  }

  /**
   * Determines the child nodes that are "visible". We purposefully ignore Text
   * nodes that only contain whitespace since they do not contribute anything
   * visually, only their surrounding Elements or non-whitespace Texts do.
   * @param {!Array<!Node>} nodes
   * @return {*} TODO(#23582): Specify return type
   * @private
   */
  visibileChildren_(nodes) {
    return nodes.filter((node) => {
      if (node.nodeType === /* Element */ 1) {
        return true;
      }

      if (node.nodeType === /* Text */ 3) {
        // Is there a non-whitespace character?
        return /\S/.test(node.textContent);
      }

      return false;
    });
  }
}

AMP.extension(TAG, '0.1', (AMP) => {
  AMP.registerElement(TAG, AmpFlyingCarpet, CSS);
});
