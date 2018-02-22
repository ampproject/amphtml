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

import {Services} from '../../../src/services';
import {createElementWithAttributes} from '../../../src/dom';
import {setImportantStyles, toggle} from '../../../src/style';


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
     * @private @const {!../../../src/service/viewport/viewport-impl.Viewport}
     */
    this.viewport_ = Services.viewportForDoc(ampdoc);

    /** @private {boolean} */
    this.visible_ = false;

    /** @private {?Element} */
    this.content_ = null;

    const doc = this.ampdoc_.win.document;

    this.wrapper_ = createElementWithAttributes(
        doc,
        'amp-subscriptions-dialog', {
          'role': 'dialog',
        });

    /** @private @const {!Element} */
    this.closeButton_ = createElementWithAttributes(
        doc,
        'button', {
          'class': 'i-amphtml-subs-dialog-close-button',
        });
    this.showCloseAction(false);
    this.wrapper_.appendChild(this.closeButton_);
    this.closeButton_.addEventListener('click', () => this.close());

    // Start hidden.
    this.ampdoc_.getBody().appendChild(this.wrapper_);
    setImportantStyles(this.wrapper_, {
      display: 'none',
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
    return this.vsync_.mutatePromise(() => {
      setImportantStyles(this.wrapper_, {
        display: 'block',
      });
      this.showCloseAction(showCloseAction);
    }).then(() => {
      // Animate to display.
      return this.vsync_.mutatePromise(() => {
        setImportantStyles(this.wrapper_, {
          transform: 'translateY(0)',
        });
        return this.timer_.promise(300);
      });
    }).then(() => {
      // Update page layout.
      let offsetHeight;
      return this.vsync_.runPromise({
        measure: () => {
          offsetHeight = this.wrapper_.offsetHeight;
        },
        mutate: () => {
          this.viewport_.updatePaddingBottom(offsetHeight);
        },
      });
    });
  }

  /**
   * Closes the dialog.
   * @return {!Promise}
   */
  close() {
    if (!this.visible_) {
      return Promise.resolve();
    }
    return this.vsync_.mutatePromise(() => {
      setImportantStyles(this.wrapper_, {
        transform: 'translateY(100%)',
      });
      return this.timer_.promise(300);
    }).then(() => {
      return this.vsync_.mutatePromise(() => {
        setImportantStyles(this.wrapper_, {
          display: 'none',
        });
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
