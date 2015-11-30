/**
 * Copyright 2015 The AMP HTML Authors. All Rights Reserved.
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

import {Gestures} from '../../../src/gesture';
import {Layout} from '../../../src/layout';
import {SwipeXYRecognizer, TapRecognizer}
    from '../../../src/gesture-recognizers';
import {historyFor} from '../../../src/history';
import {timer} from '../../../src/timer';
import * as st from '../../../src/style';


class AmpLightbox extends AMP.BaseElement {

  /** @override */
  isLayoutSupported(layout) {
    return layout == Layout.NODISPLAY;
  }

  /** @override */
  isReadyToBuild() {
    // Always defer building until DOMReady.
    return false;
  }

  /** @override */
  buildCallback() {
    st.setStyles(this.element, {
      position: 'fixed',
      zIndex: 1000,
      top: 0,
      left: 0,
      bottom: 0,
      right: 0
    });

    const children = this.getRealChildren();

    /** @private {!Element} */
    this.container_ = document.createElement('div');
    this.applyFillContent(this.container_);
    this.element.appendChild(this.container_);
    children.forEach(child => {
      this.container_.appendChild(child);
    });

    const gestures = Gestures.get(this.element);
    // TODO(dvoytenko): configure how to close. Or maybe leave it completely
    // up to "on" element.
    this.element.addEventListener('click', () => this.close());
    gestures.onGesture(TapRecognizer, () => this.close());
    gestures.onGesture(SwipeXYRecognizer, () => {
      // Consume to block scroll events and side-swipe.
    });

    /** @private {number} */
    this.historyId_ = -1;
  }

  /** @override */
  layoutCallback() {
    return Promise.resolve();
  }

  /** @override */
  activate() {
    this.requestFullOverlay();
    this.getViewport().resetTouchZoom();
    this.element.style.display = '';
    this.element.style.opacity = 0;

    // TODO(dvoytenko): use new animations support instead.
    this.element.style.transition = 'opacity 0.1s ease-in';
    requestAnimationFrame(() => {
      this.element.style.opacity = '';
    });

    this.scheduleLayout(this.container_);
    this.updateInViewport(this.container_, true);

    this.getHistory_().push(this.close.bind(this)).then(historyId => {
      this.historyId_ = historyId;
    });
  }

  close() {
    this.cancelFullOverlay();
    this.element.style.display = 'none';
    if (this.historyId_ != -1) {
      this.getHistory_().pop(this.historyId_);
    }
  }

  getHistory_() {
    return historyFor(this.element.ownerDocument.defaultView);
  }
}

AMP.registerElement('amp-lightbox', AmpLightbox);
