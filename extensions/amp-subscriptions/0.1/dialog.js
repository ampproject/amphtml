import {createElementWithAttributes} from '#core/dom';
import {setImportantStyles, toggle} from '#core/dom/style';

import {Services} from '#service';

export class Dialog {
  /**
   * @param {!../../../src/service/ampdoc-impl.AmpDoc} ampdoc
   */
  constructor(ampdoc) {
    /** @private @const {!../../../src/service/ampdoc-impl.AmpDoc} */
    this.ampdoc_ = ampdoc;

    /** @private @const {!../../../src/service/vsync-impl.Vsync} */
    this.vsync_ = Services.vsyncFor(ampdoc.win);

    /** @private @const {!../../../src/service/timer-impl.Timer} */
    this.timer_ = Services.timerFor(ampdoc.win);

    /**
     * @private @const {!../../../src/service/viewport/viewport-interface.ViewportInterface}
     */
    this.viewport_ = Services.viewportForDoc(ampdoc);

    /** @private {boolean} */
    this.visible_ = false;

    /** @private {?Element} */
    this.content_ = null;

    /** @private {!Promise} */
    this.lastAction_ = Promise.resolve();

    const doc = this.ampdoc_.win.document;

    /** @private @const {!Element} */
    this.wrapper_ = createElementWithAttributes(
      doc,
      'amp-subscriptions-dialog',
      /** @type {!JsonObject} */ ({
        'role': 'dialog',
      })
    );
    toggle(this.wrapper_, false);

    /** @private @const {!Element} */
    this.closeButton_ = createElementWithAttributes(
      doc,
      'button',
      /** @type {!JsonObject} */ ({
        'class': 'i-amphtml-subs-dialog-close-button',
      })
    );
    this.showCloseAction(false);
    this.wrapper_.appendChild(this.closeButton_);
    this.closeButton_.addEventListener('click', () => {
      this.close();
    });

    // Start hidden.
    this.ampdoc_.getBody().appendChild(this.wrapper_);
    setImportantStyles(this.wrapper_, {
      transform: 'translateY(100%)',
    });
  }

  /**
   * @return {!Element}
   */
  getRoot() {
    return this.wrapper_;
  }

  /**
   * @return {boolean}
   */
  isVisible() {
    return this.visible_;
  }

  /**
   * Opens the dialog with the specified content.
   * @param {!Element} content
   * @param {boolean=} showCloseAction
   * @return {!Promise}
   */
  open(content, showCloseAction = true) {
    return this.action_(() => this.open_(content, showCloseAction));
  }

  /**
   * Closes the dialog.
   * @return {!Promise}
   */
  close() {
    return this.action_(() => this.close_());
  }

  /**
   * @param {!Function} action
   * @return {!Promise}
   * @private
   */
  action_(action) {
    return (this.lastAction_ = this.lastAction_.then(action));
  }

  /**
   * Opens the dialog with the specified content.
   * @param {!Element} content
   * @param {boolean=} showCloseAction
   * @return {!Promise}
   * @private
   */
  open_(content, showCloseAction = true) {
    if (this.content_) {
      this.wrapper_.replaceChild(content, this.content_);
    } else {
      this.wrapper_.appendChild(content);
    }
    this.content_ = content;
    if (this.visible_) {
      return Promise.resolve();
    }
    this.visible_ = true;
    return this.vsync_
      .mutatePromise(() => {
        toggle(this.wrapper_, true);
        this.showCloseAction(/** @type {boolean} */ (showCloseAction));
      })
      .then(() => {
        // Animate to display.
        return this.vsync_
          .mutatePromise(() => {
            setImportantStyles(this.wrapper_, {
              transform: 'translateY(0)',
            });
          })
          .then(() => this.timer_.promise(300));
      })
      .then(() => {
        // Update page layout.
        let offsetHeight;
        return this.vsync_.runPromise({
          measure: () => {
            offsetHeight = this.wrapper_./*OK*/ offsetHeight;
          },
          mutate: () => {
            this.viewport_.updatePaddingBottom(offsetHeight);
            this.viewport_.addToFixedLayer(this.wrapper_, true);
          },
        });
      });
  }

  /**
   * Closes the dialog.
   * @return {!Promise}
   * @private
   */
  close_() {
    if (!this.visible_) {
      return Promise.resolve();
    }
    return this.vsync_
      .mutatePromise(() => {
        setImportantStyles(this.wrapper_, {
          transform: 'translateY(100%)',
        });
      })
      .then(() => {
        return this.timer_.promise(300);
      })
      .then(() => {
        return this.vsync_.mutatePromise(() => {
          toggle(this.wrapper_, false);
          this.viewport_.updatePaddingBottom(0);
          this.visible_ = false;
        });
      });
  }

  /**
   * Renders or hides the "Close" action button. For some flows, this button
   * should be hidden.
   * @param {boolean} show
   */
  showCloseAction(show) {
    toggle(this.closeButton_, show);
  }
}
