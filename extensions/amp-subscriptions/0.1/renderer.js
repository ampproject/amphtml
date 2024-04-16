import {createElementWithAttributes} from '#core/dom';
import {childElementByTag} from '#core/dom/query';

import {Services} from '#service';

const CSS_PREFIX = 'i-amphtml-subs';

export class Renderer {
  /**
   * @param {!../../../src/service/ampdoc-impl.AmpDoc} ampdoc
   */
  constructor(ampdoc) {
    /** @const @private */
    this.ampdoc_ = ampdoc;

    /** @const @private {!../../../src/service/mutator-interface.MutatorInterface} */
    this.mutator_ = Services.mutatorForDoc(ampdoc);

    // Initial state is "unknown".
    this.setGrantState(null);
    this.getBodyElement_().classList.add(`${CSS_PREFIX}-ready`);

    // Check and add progress bar.
    this.addLoadingBar();
  }

  /**
   * @return {!Element}
   * @private
   */
  getBodyElement_() {
    return this.ampdoc_.getBody();
  }

  /**
   * @param {string} type
   * @param {?boolean} state
   * @private
   */
  setState_(type, state) {
    this.mutator_.mutateElement(this.ampdoc_.getBody(), () => {
      this.getBodyElement_().classList.toggle(
        `${CSS_PREFIX}-${type}-unk`,
        state === null
      );
      this.getBodyElement_().classList.toggle(
        `${CSS_PREFIX}-${type}-yes`,
        state === true
      );
      this.getBodyElement_().classList.toggle(
        `${CSS_PREFIX}-${type}-no`,
        state === false
      );
    });
  }

  /**
   * Adds a loading bar.
   *
   * @return {!Promise}
   */
  addLoadingBar() {
    return this.ampdoc_.whenReady().then(() => {
      const body = this.ampdoc_.getBody();
      if (!body.querySelector('[subscriptions-section=loading]')) {
        const element = createElementWithAttributes(
          this.ampdoc_.win.document,
          'div',
          {
            'class': 'i-amphtml-subs-progress',
            'subscriptions-section': 'loading',
          }
        );
        // The loading indicator will be either inserted right before the
        // `<footer>` node or appended as the last child.
        body.insertBefore(element, childElementByTag(body, 'footer'));
      }
    });
  }

  /**
   * @param {string} type
   * @param {boolean} state
   * @private
   */
  toggleState_(type, state) {
    this.mutator_.mutateElement(this.ampdoc_.getBody(), () => {
      this.getBodyElement_().classList.toggle(`${CSS_PREFIX}-${type}`, state);
    });
  }

  /**
   * @param {?boolean} state
   */
  setGrantState(state) {
    this.setState_('grant', state);
  }

  /**
   * @param {boolean} loading
   */
  toggleLoading(loading) {
    this.toggleState_('loading', loading);
  }
}
