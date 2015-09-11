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

import {Layout} from '../../../src/layout';
import {timer} from '../../../src/timer';
import * as st from '../../../src/style';


(window.AMP = window.AMP || []).push(function(AMP) {
  class AmpLightbox extends AMP.BaseElement {

    /** @override */
    isLayoutSupported(layout) {
      return layout == Layout.NODISPLAY;
    }

    /** @override */
    isReadyToBuild() {
      return this.element.firstChild != null;
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

      let children = this.getRealChildren();

      /** @private {!Element} */
      this.container_ = document.createElement('div');
      this.applyFillContent(this.container_);
      this.element.appendChild(this.container_);
      children.forEach((child) => {
        this.container_.appendChild(child);
      });

      // TODO(dvoytenko): configure how to close. Or maybe leave it completely
      // up to "on" element.
      this.element.addEventListener('click', () => this.close());
    }

    /** @override */
    layoutCallback() {
      return Promise.resolve();
    }

    /** @override */
    activate() {
      this.element.style.display = '';
      this.element.style.opacity = 0;

      let transLayer = null;

      // TODO(dvoytenko): This is definitely not great. Instead would be better
      // to pass in the action's event or do this via auto-lightbox API.
      let from = this.element.hasAttribute('from') ? document.getElementById(
          this.element.getAttribute('from')) : null;
      if (from) {
        let rect = from.getBoundingClientRect();
        let clone = from.cloneNode(true);
        clone.style.position = 'absolute';
        clone.style.top = rect.top;
        clone.style.left = rect.left;
        clone.style.bottom = rect.bottom;
        clone.style.right = rect.right;

        transLayer = document.createElement('div');
        transLayer.style.pointerEvents = 'none';
        transLayer.style.position = 'fixed';
        transLayer.style.zIndex = 1001;
        transLayer.style.top = 0;
        transLayer.style.left = 0;
        transLayer.style.bottom = 0;
        transLayer.style.right = 0;
        transLayer.appendChild(clone);
        document.body.appendChild(transLayer);

        this.container_.style.opacity = 0;
      }

      this.element.style.transition = 'opacity 0.1s ease-in';
      requestAnimationFrame(() => {
        this.element.style.opacity = '';
        if (transLayer) {
          this.container_.style.transition = 'opacity 0.1s ease-in';
          transLayer.style.transition = 'opacity 0.1s ease-out';
          // TODO(dvoytenko): onAnimationEnd
          timer.delay(() => {
            requestAnimationFrame(() => {
              this.container_.style.opacity = '';
              transLayer.style.opacity = 0;
              timer.delay(() => {
                document.body.removeChild(transLayer);
              }, 100);
            });
          }, 100);
        }
      });

      this.scheduleLayout(this.container_);
      this.updateInViewport(this.container_, true);
    }

    close() {
      this.element.style.display = 'none';
    }
  }

  AMP.registerElement('amp-lightbox', AmpLightbox);
});
