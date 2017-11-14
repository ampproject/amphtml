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

import {Animation} from '../../../src/animation';
import {CSS} from '../../../build/amp-image-lightbox-0.1.css';
import {
  SwipeXYRecognizer,
  TapRecognizer,
} from '../../../src/gesture-recognizers';
import {Gestures} from '../../../src/gesture';
import {KeyCodes} from '../../../src/utils/key-codes';
import {Layout} from '../../../src/layout';
import {bezierCurve} from '../../../src/curve';
import {Services} from '../../../src/services';
import {isLoaded} from '../../../src/event-helper';
import {layoutRectFromDomRect} from '../../../src/layout-rect';
import {ImageViewer} from '../../../src/image-viewer';
import {user, dev} from '../../../src/log';
import {startsWith} from '../../../src/string';
import * as dom from '../../../src/dom';
import * as st from '../../../src/style';
import * as tr from '../../../src/transition';

const TAG = 'amp-image-lightbox';

/** @private @const {!Object<string, boolean>} */
const SUPPORTED_ELEMENTS_ = {
  'amp-img': true,
  'amp-anim': true,
};

/** @private @const {!../../../src/curve.CurveDef} */
const ENTER_CURVE_ = bezierCurve(0.4, 0, 0.2, 1);

/** @private @const {!../../../src/curve.CurveDef} */
const EXIT_CURVE_ = bezierCurve(0.4, 0, 0.2, 1);

/**
 * This class implements "amp-image-lightbox" extension element.
 */
class AmpImageLightbox extends AMP.BaseElement {

  /** @param {!AmpElement} element */
  constructor(element) {
    super(element);

    /** @private {number} */
    this.historyId_ = -1;

    /** @private {boolean} */
    this.active_ = false;

    /** @private {boolean} */
    this.entering_ = false;

    /** @private {?Element} */
    this.sourceElement_ = null;

    /** @private {?Element} */
    this.sourceImage_ = null;

    /** @private {?UnlistenDef} */
    this.unlistenViewport_ = null;

    /** @private {?Element} */
    this.container_ = null;

    /** @private {?ImageViewer} */
    this.imageViewer_ = null;

    /** @private {?Element} */
    this.captionElement_ = null;

    /** @private {function(this:AmpImageLightbox, Event)} */
    this.boundCloseOnEscape_ = this.closeOnEscape_.bind(this);
  }

  /** @override */
  isLayoutSupported(layout) {
    return layout == Layout.NODISPLAY;
  }

  /**
  * Lazily builds the image-lightbox DOM on the first open.
  * @private
  * */
  buildLightbox_() {
    if (this.container_) {
      return;
    }
    this.container_ = this.element.ownerDocument.createElement('div');
    this.container_.classList.add('i-amphtml-image-lightbox-container');
    this.element.appendChild(this.container_);

    this.imageViewer_ = new ImageViewer(this, this.win,
        this.loadPromise.bind(this));
    this.container_.appendChild(this.imageViewer_.getElement());

    this.captionElement_ = this.element.ownerDocument.createElement('div');

    // Set id to the captionElement_ for accessibility reason
    this.captionElement_.setAttribute('id', this.element.getAttribute('id')
        + '-caption');

    this.captionElement_.classList.add('amp-image-lightbox-caption');
    this.captionElement_.classList.add('i-amphtml-image-lightbox-caption');
    this.container_.appendChild(this.captionElement_);

    // Invisible close button at the end of lightbox for screen-readers.
    const screenReaderCloseButton = this.element.ownerDocument
        .createElement('button');
    // TODO(aghassemi, #4146) i18n
    const ariaLabel = this.element.getAttribute('data-close-button-aria-label')
        || 'Close the lightbox';
    screenReaderCloseButton.textContent = ariaLabel;
    screenReaderCloseButton.classList.add('i-amphtml-screen-reader');

    // This is for screen-readers only, should not get a tab stop.
    screenReaderCloseButton.tabIndex = -1;
    screenReaderCloseButton.addEventListener('click', () => {
      this.close();
    });
    this.element.appendChild(screenReaderCloseButton);

    const gestures = Gestures.get(this.element);
    this.element.addEventListener('click', e => {
      if (!this.entering_ &&
            !this.imageViewer_.getImage().contains(/** @type {?Node} */ (
                e.target))) {
        this.close();
      }
    });
    gestures.onGesture(TapRecognizer, () => {
      if (!this.entering_) {
        this.close();
      }
    });
    gestures.onGesture(SwipeXYRecognizer, () => {
      // Consume to block scroll events and side-swipe.
    });
  }

  /** @override */
  activate(invocation) {
    if (this.active_) {
      return;
    }
    this.buildLightbox_();

    const source = invocation.source;
    user().assert(source && SUPPORTED_ELEMENTS_[source.tagName.toLowerCase()],
        'Unsupported element: %s', source.tagName);

    this.active_ = true;
    this.reset_();
    this.init_(source);

    this.win.document.documentElement.addEventListener(
        'keydown', this.boundCloseOnEscape_);

    // Prepare to enter in lightbox
    this.getViewport().enterLightboxMode();

    this.enter_();

    this.unlistenViewport_ = this.getViewport().onChanged(() => {
      if (this.active_) {
        // In IOS 10.3, the measured size of an element is incorrect if the
        // element size depends on window size directly and the measurement
        // happens in window.resize event. Adding a timeout for correct
        // measurement. See https://github.com/ampproject/amphtml/issues/8479
        if (startsWith(
            Services.platformFor(this.win).getIosVersionString(), '10.3')) {
          Services.timerFor(this.win).delay(() => {
            this.imageViewer_.measure();
          }, 500);
        } else {
          this.imageViewer_.measure();
        }
      }
    });

    this.getHistory_().push(this.close.bind(this)).then(historyId => {
      this.historyId_ = historyId;
    });
  }

  /**
   * Handles closing the lightbox when the ESC key is pressed.
   * @param {!Event} event.
   * @private
   */
  closeOnEscape_(event) {
    if (event.keyCode == KeyCodes.ESCAPE) {
      this.close();
    }
  }

  /**
   * Closes the lightbox.
   */
  close() {
    if (!this.active_) {
      return;
    }
    this.active_ = false;
    this.entering_ = false;

    this.exit_();

    if (this.unlistenViewport_) {
      this.unlistenViewport_();
      this.unlistenViewport_ = null;
    }

    this.getViewport().leaveLightboxMode();
    if (this.historyId_ != -1) {
      this.getHistory_().pop(this.historyId_);
    }
    this.win.document.documentElement.removeEventListener(
        'keydown', this.boundCloseOnEscape_);
  }

  /**
   * Toggles the view mode.
   * @param {boolean=} opt_on
   */
  toggleViewMode(opt_on) {
    if (opt_on !== undefined) {
      this.container_.classList.toggle(
          'i-amphtml-image-lightbox-view-mode', opt_on);
    } else {
      this.container_.classList.toggle('i-amphtml-image-lightbox-view-mode');
    }
  }

  /**
   * @param {!Element} sourceElement
   * @private
   */
  init_(sourceElement) {
    this.sourceElement_ = sourceElement;

    // Initialize the viewer.
    this.sourceImage_ = dom.elementByTag(sourceElement, 'img');
    this.imageViewer_.init(this.sourceElement_, this.sourceImage_);

    // Discover caption.
    let caption = null;

    // 1. Check <figure> and <figcaption>.
    if (!caption) {
      const figure = dom.closestByTag(sourceElement, 'figure');
      if (figure) {
        caption = dom.elementByTag(figure, 'figcaption');
      }
    }

    // 2. Check "aria-describedby".
    if (!caption) {
      const describedBy = sourceElement.getAttribute('aria-describedby');
      caption = this.element.ownerDocument.getElementById(describedBy);
    }

    if (caption) {
      dom.copyChildren(caption, dev().assertElement(this.captionElement_));
      this.imageViewer_.getImage().setAttribute('aria-describedby',
          this.captionElement_.getAttribute('id'));
    }

    this.captionElement_.classList.toggle('i-amphtml-empty', !caption);
  }

  /** @private */
  reset_() {
    this.imageViewer_.reset();
    dom.removeChildren(dev().assertElement(this.captionElement_));
    this.sourceElement_ = null;
    this.sourceImage_ = null;
    this.toggleViewMode(false);
  }

  /**
   * @return {!Promise}
   * @private
   */
  enter_() {
    this.entering_ = true;

    st.setStyles(this.element, {
      opacity: 0,
      display: '',
    });
    this.imageViewer_.measure();

    const anim = new Animation(this.element);
    const dur = 500;

    // Lightbox background fades in.
    anim.add(0, tr.setStyles(this.element, {
      opacity: tr.numeric(0, 1),
    }), 0.6, ENTER_CURVE_);

    // Try to transition from the source image.
    let transLayer = null;
    if (this.sourceImage_ && isLoaded(this.sourceImage_) &&
            this.sourceImage_.src) {
      transLayer = this.element.ownerDocument.createElement('div');
      transLayer.classList.add('i-amphtml-image-lightbox-trans');
      this.element.ownerDocument.body.appendChild(transLayer);

      const rect = layoutRectFromDomRect(this.sourceImage_
          ./*OK*/getBoundingClientRect());
      const imageBox = this.imageViewer_.getImageBox();
      const clone = this.sourceImage_.cloneNode(true);
      clone.className = '';
      st.setStyles(clone, {
        position: 'absolute',
        top: st.px(rect.top),
        left: st.px(rect.left),
        width: st.px(rect.width),
        height: st.px(rect.height),
        transformOrigin: 'top left',
        willChange: 'transform',
      });
      transLayer.appendChild(clone);

      this.sourceImage_.classList.add('i-amphtml-ghost');

      // Move and resize the image to the location given by the lightbox.
      const dx = imageBox.left - rect.left;
      const dy = imageBox.top - rect.top;
      const scaleX = rect.width != 0 ? imageBox.width / rect.width : 1;
      // Duration will be somewhere between 0.2 and 0.8 depending on how far
      // the image needs to move.
      const motionTime = Math.max(0.2, Math.min(0.8, Math.abs(dy) / 250 * 0.8));
      anim.add(0, tr.setStyles(clone, {
        transform: tr.concat([
          tr.translate(tr.numeric(0, dx), tr.numeric(0, dy)),
          tr.scale(tr.numeric(1, scaleX)),
        ]),
      }), motionTime, ENTER_CURVE_);

      // Fade in the container. This will mostly affect the caption.
      st.setStyles(dev().assertElement(this.container_), {opacity: 0});
      anim.add(0.8, tr.setStyles(dev().assertElement(this.container_), {
        opacity: tr.numeric(0, 1),
      }), 0.1, ENTER_CURVE_);

      // At the end, fade out the transition image.
      anim.add(0.9, tr.setStyles(transLayer, {
        opacity: tr.numeric(1, 0.01),
      }), 0.1, EXIT_CURVE_);
    }

    return anim.start(dur).thenAlways(() => {
      this.entering_ = false;
      st.setStyles(this.element, {opacity: ''});
      st.setStyles(dev().assertElement(this.container_), {opacity: ''});
      if (transLayer) {
        this.element.ownerDocument.body.removeChild(transLayer);
      }
    });
  }

  /**
   * @return {!Promise}
   * @private
   */
  exit_() {
    const image = this.imageViewer_.getImage();
    const imageBox = this.imageViewer_.getImageBoxWithOffset();

    const anim = new Animation(this.element);
    let dur = 500;

    // Lightbox background fades out.
    anim.add(0, tr.setStyles(this.element, {
      opacity: tr.numeric(1, 0),
    }), 0.9, EXIT_CURVE_);

    // Try to transition to the source image.
    let transLayer = null;
    if (isLoaded(image) && image.src && this.sourceImage_) {
      transLayer = this.element.ownerDocument.createElement('div');
      transLayer.classList.add('i-amphtml-image-lightbox-trans');
      this.element.ownerDocument.body.appendChild(transLayer);

      const rect = layoutRectFromDomRect(this.sourceImage_
          ./*OK*/getBoundingClientRect());
      const clone = image.cloneNode(true);
      st.setStyles(clone, {
        position: 'absolute',
        top: st.px(imageBox.top),
        left: st.px(imageBox.left),
        width: st.px(imageBox.width),
        height: st.px(imageBox.height),
        transform: '',
        transformOrigin: 'top left',
        willChange: 'transform',
      });
      transLayer.appendChild(clone);

      // Fade out the container.
      anim.add(0, tr.setStyles(dev().assertElement(this.container_), {
        opacity: tr.numeric(1, 0),
      }), 0.1, EXIT_CURVE_);

      // Move and resize the image back to where it is in the article.
      const dx = rect.left - imageBox.left;
      const dy = rect.top - imageBox.top;
      const scaleX = imageBox.width != 0 ? rect.width / imageBox.width : 1;
      /** @const {!TransitionDef<void>} */
      const moveAndScale = tr.setStyles(clone, {
        transform: tr.concat([
          tr.translate(tr.numeric(0, dx), tr.numeric(0, dy)),
          tr.scale(tr.numeric(1, scaleX)),
        ]),
      });

      // Duration will be somewhere between 0.2 and 0.8 depending on how far
      // the image needs to move. Start the motion later too, but no later
      // than 0.2.
      const motionTime = Math.max(0.2, Math.min(0.8, Math.abs(dy) / 250 * 0.8));
      anim.add(Math.min(0.8 - motionTime, 0.2), (time, complete) => {
        moveAndScale(time);
        if (complete) {
          this.sourceImage_.classList.remove('i-amphtml-ghost');
        }
      }, motionTime, EXIT_CURVE_);

      // Fade out the transition image.
      anim.add(0.8, tr.setStyles(transLayer, {
        opacity: tr.numeric(1, 0.01),
      }), 0.2, EXIT_CURVE_);

      // Duration will be somewhere between 300ms and 700ms depending on
      // how far the image needs to move.
      dur = Math.max(Math.min(Math.abs(dy) / 250 * dur, dur), 300);
    }

    return anim.start(dur).thenAlways(() => {
      if (this.sourceImage_) {
        this.sourceImage_.classList.remove('i-amphtml-ghost');
      }
      this./*OK*/collapse();
      st.setStyles(this.element, {
        opacity: '',
      });
      st.setStyles(dev().assertElement(this.container_), {opacity: ''});
      if (transLayer) {
        this.element.ownerDocument.body.removeChild(transLayer);
      }
      this.reset_();
    });
  }

  /** @private @return {!../../../src/service/history-impl.History} */
  getHistory_() {
    return Services.historyForDoc(this.getAmpDoc());
  }
}


AMP.extension(TAG, '0.1', AMP => {
  AMP.registerElement(TAG, AmpImageLightbox, CSS);
});
