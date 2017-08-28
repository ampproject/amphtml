import {Signals} from '../utils/signals';
import {dev, user} from '../log';

/**
 * This class represents a single ampdoc. `AmpDocService` can contain only one
 * global ampdoc or multiple, depending on the runtime mode: single-doc or
 * shadow-doc.
 * @abstract
 */
export class AmpDoc {
  /**
   * @param {!Window} win
   */
  constructor(win) {
    /** @public @const {!Window} */
    this.win = win;

    /** @private @const */
    this.signals_ = new Signals();
  }

  /**
   * Whether the runtime in the single-doc mode. Alternative is the shadow-doc
   * mode that supports multiple documents per a single window.
   * @return {boolean}
   */
  isSingleDoc() {
    return /** @type {?} */ (dev().assert(null, 'not implemented'));
  }

  /**
   * DO NOT CALL. Retained for backward compat during rollout.
   * @return {!Window}
   * @deprecated. Use `ampdoc.win` instead.
   */
  getWin() {
    return this.win;
  }

  /** @return {!Signals} */
  signals() {
    return this.signals_;
  }

  /**
   * Returns the root node for this ampdoc. It will either be a `Document` for
   * the single-doc runtime mode, or a `ShadowRoot` for shadow-doc mode. This
   * node can be used, among other things, to add ampdoc-wide event listeners.
   *
   * @return {!Document|!ShadowRoot}
   */
  getRootNode() {
    return /** @type {?} */ (dev().assert(null, 'not implemented'));
  }

  /**
   * Returns the head node. It's either an element or a shadow root.
   * @return {!Element|!ShadowRoot}
   * @abstract
   */
  getHeadNode() {}

  /**
   * Returns `true` if the ampdoc's body is available.
   *
   * @return {boolean}
   */
  isBodyAvailable() {
    return /** @type {?} */ (dev().assert(false, 'not implemented'));
  }

  /**
   * Returns the ampdoc's body. Requires the body to already be available.
   *
   * See `isBodyAvailable` and `whenBodyAvailable`.
   *
   * @return {!Element}
   */
  getBody() {
    return dev().assertElement(null, 'not implemented');
  }

  /**
   * Returns a promise that will be resolved when the ampdoc's body is
   * available.
   * @return {!Promise<!Element>}
   */
  whenBodyAvailable() {
    return /** @type {?} */ (dev().assert(null, 'not implemented'));
  }

  /**
   * Returns `true` if document is ready.
   *
   * See `whenReady`.
   *
   * @return {boolean}
   */
  isReady() {
    return /** @type {?} */ (dev().assert(null, 'not implemented'));
  }

  /**
   * Returns a promise that will be resolved when the ampdoc's DOM is fully
   * ready.
   * @return {!Promise}
   */
  whenReady() {
    return /** @type {?} */ (dev().assert(null, 'not implemented'));
  }

  /**
   * Returns the URL from which the document was loaded.
   * @return {string}
   */
  getUrl() {
    return dev().assertString(null, 'not implemented');
  }

  /**
   * Locates an element with the specified ID within the ampdoc. In the
   * shadow-doc mode, when multiple documents could be present, this method
   * localizes search only to the DOM subtree specific to this ampdoc.
   *
   * @param {string} id
   * @return {?Element}
   */
  getElementById(id) {
    return this.getRootNode().getElementById(id);
  }

  /**
   * Whether the node is currently contained in the DOM of the root.
   * @param {?Node} node
   * @return {boolean}
   */
  contains(node) {
    return this.getRootNode().contains(node);
  }

  user() {
    return user(this);
  }
}
