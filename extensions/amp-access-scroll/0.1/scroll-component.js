import {createElementWithAttributes} from '#core/dom';
import {assertDoesNotContainDisplay, px, setStyles} from '#core/dom/style';
import {hasOwn} from '#core/types/object';

import {Services} from '#service';

import {devAssert} from '#utils/log';

/** @abstract */
export class ScrollComponent {
  /**
   * @param {!../../../src/service/ampdoc-impl.AmpDoc} doc
   */
  constructor(doc) {
    /** @protected {!../../../src/service/ampdoc-impl.AmpDoc} */
    this.doc_ = doc;

    /** @protected @property {?function(Window):undefined} */
    this.setWindow_ = null;

    /** @protected {?Element} */
    this.root_ = null;

    /** @protected {?HTMLIFrameElement} */
    this.frame_ = null;

    /** @protected {ScrollComponent.HorizontalLayout} */
    this.layout_ = {
      'width': null,
      'left': null,
      'right': null,
    };

    /** @type {Promise<Window>} */
    this.window = new Promise((resolve) => {
      /** @protected */
      this.setWindow_ = resolve;
    });
  }

  /**
   * Create an element with attributes and optional children.
   * @param {string} elementName
   * @param {!JsonObject} attrs
   * @param {Array<Element>=} children
   * @return {!Element}
   * @protected
   */
  el(elementName, attrs, children) {
    const e = createElementWithAttributes(
      this.doc_.win.document,
      elementName,
      attrs
    );
    if (Array.isArray(children)) {
      children.forEach((c) => e.appendChild(c));
    }
    return e;
  }

  /**
   * Add element to doc and promote to fixed layer.
   * @protected
   * */
  mount() {
    const root = devAssert(this.root_);
    this.doc_.getBody().appendChild(root);
    Services.viewportForDoc(this.doc_).addToFixedLayer(root);
  }

  /**
   * Enqueues a DOM mutation managed by the window's Vsync
   * @param {function():undefined} mutator
   * @protected
   */
  mutate(mutator) {
    Services.vsyncFor(this.doc_.win).mutate(mutator);
  }

  /**
   *
   * @param {string} className
   * @param {boolean} condition
   * @protected
   */
  toggleClass(className, condition) {
    const classes = devAssert(this.root_).classList;
    if (condition) {
      classes.add(className);
    } else {
      classes.remove(className);
    }
  }

  /**
   * Action toggleChecked.
   * @param {boolean} condition
   * @protected
   */
  toggleChecked(condition) {
    const input = devAssert(this.root_);
    if (condition) {
      input.checked = true;
    } else {
      input.checked = false;
    }
  }

  /**
   * @param {object} updates
   * @return {boolean} true if changed
   * @protected
   */
  updateHorizontalLayout(updates) {
    let changed = false;
    // only update styles already set in the layout, updates in place
    Object.keys(this.layout_).forEach((key) => {
      if (!hasOwn(updates, key)) {
        return;
      }
      const size = this.cssSize(updates[key]);
      if (this.layout_[key] !== size) {
        this.layout_[key] = size;
        changed = true;
      }
    });
    return changed;
  }

  /**
   * This method should only be called inside of a mutate() callback.
   *
   * @protected
   */
  renderHorizontalLayout() {
    setStyles(devAssert(this.root_), assertDoesNotContainDisplay(this.layout_));
  }

  /**
   * @param {string|number} size
   * @return {string}
   */
  cssSize(size) {
    return typeof size === 'number' ? px(size) : size;
  }
}

/**
 * Anything affecting vertical layout (height, top, bottom) is ommitted.
 * @typedef {{
 *    width: ?string,
 *    left: ?string,
 *    right: ?string
 * }}
 */
ScrollComponent.HorizontalLayout;
