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
import {Gestures} from '../../../src/gesture';
import {DoubletapRecognizer, SwipeXYRecognizer, TapRecognizer,
    TapzoomRecognizer} from '../../../src/gesture-recognizers';
import {Layout} from '../../../src/layout';
import {assert} from '../../../src/asserts';
import {bezierCurve} from '../../../src/curve';
import {continueMotion} from '../../../src/motion';
import {historyFor} from '../../../src/history';
import {isLoaded, loadPromise} from '../../../src/event-helper';
import {layoutRectFromDomRect, layoutRectLtwh} from '../../../src/layout-rect';
import {parseSrcset} from '../../../src/srcset';
import {timer} from '../../../src/timer';
import * as dom from '../../../src/dom';
import * as st from '../../../src/style';
import * as tr from '../../../src/transition';


/** @private @const {!Object<string, boolean>} */
const SUPPORTED_ELEMENTS_ = {
  'amp-img': true,
  'amp-anim': true
};

/** @private @const {!Curve} */
const ENTER_CURVE_ = bezierCurve(0.4, -0.3, 0.2, 1);

/** @private @const {!Curve} */
const EXIT_CURVE_ = bezierCurve(0.4, 0, 0.2, 1);

/** @private @const {!Curve} */
const PAN_ZOOM_CURVE_ = bezierCurve(0.4, 0, 0.2, 1.4);


/**
 * This class is responsible providing all operations necessary for viewing
 * an image, such as full-bleed display, zoom and pan, etc.
 * @package  Visible for testing only!
 * TODO(dvoytenko): move to the separate file once build system is ready.
 */
export class ImageViewer {
  /**
   * @param {!AmpImageLightbox} lightbox
   */
  constructor(lightbox) {
    /** @private {!AmpImageLightbox} */
    this.lightbox_ = lightbox;

    /** @private {!Element} */
    this.viewer_ = document.createElement('div');
    this.viewer_.classList.add('-amp-image-lightbox-viewer');

    /** @private {!Element} */
    this.image_ = document.createElement('img');
    this.image_.classList.add('-amp-image-lightbox-viewer-image');
    this.viewer_.appendChild(this.image_);

    /** @private {?Srcset} */
    this.srcset_ = null;

    /** @private {number} */
    this.sourceWidth_ = 0;

    /** @private {number} */
    this.sourceHeight_ = 0;

    /** @private {!LayoutRect} */
    this.viewerBox_ = layoutRectLtwh(0, 0, 0, 0);

    /** @private {!LayoutRect} */
    this.imageBox_ = layoutRectLtwh(0, 0, 0, 0);

    /** @private {number} */
    this.scale_ = 1;

    /** @private {number} */
    this.maxSeenScale_ = 1;
  }

  /**
   * Returns the root element of the image viewer.
   * @return {!Element}
   */
  getElement() {
    return this.viewer_;
  }

  /**
   * Returns the img element of the image viewer.
   * @return {!Element}
   */
  getImage() {
    return this.image_;
  }

  /**
   * Returns the boundaries of the viewer.
   * @return {!LayoutRect}
   */
  getViewerBox() {
    return this.viewerBox_;
  }

  /**
   * Returns the boundaries of the image element.
   * @return {!LayoutRect}
   */
  getImageBox() {
    return this.imageBox_;
  }

  /**
   * Resets the image viewer to the initial state.
   */
  reset() {
    this.image_.setAttribute('src', '');
    this.srcset_ = null;
    this.imageBox_ = layoutRectLtwh(0, 0, 0, 0);
    this.sourceWidth_ = 0;
    this.sourceHeight_ = 0;
    this.maxSeenScale_ = 1;
  }

  /**
   * Initializes the image viewer to the target image element such as
   * "amp-img". The target image element may or may not yet have the img
   * element initialized.
   * @param {!Element} sourceElement
   * @param {?Element} sourceImage
   */
  init(sourceElement, sourceImage) {
    this.sourceWidth_ = sourceElement.offsetWidth;
    this.sourceHeight_ = sourceElement.offsetHeight;
    this.srcset_ = parseSrcset(sourceElement.getAttribute('srcset') ||
        sourceElement.getAttribute('src'));
    if (sourceImage && isLoaded(sourceImage) && sourceImage.src) {
      // Set src provisionally to the known loaded value for fast display.
      // It will be updated later.
      this.image_.setAttribute('src', sourceImage.src);
    }
  }

  /**
   * Measures the image viewer and image sizes and positioning.
   * @return {!Promise}
   */
  measure() {
    this.viewerBox_ = layoutRectFromDomRect(this.viewer_.
        getBoundingClientRect());

    let sf = Math.min(this.viewerBox_.width / this.sourceWidth_,
        this.viewerBox_.height / this.sourceHeight_);
    let width = Math.min(this.sourceWidth_ * sf, this.viewerBox_.width);
    let height = Math.min(this.sourceHeight_ * sf, this.viewerBox_.height);

    // TODO(dvoytenko): This is to reduce very small expansions that often
    // look like a stutter. To be evaluated if this is still the right
    // idea.
    if (width - this.sourceWidth_ <= 16) {
      width = this.sourceWidth_;
      height = this.sourceHeight_;
    }

    this.imageBox_ = layoutRectLtwh(
        Math.round((this.viewerBox_.width - width) / 2),
        Math.round((this.viewerBox_.height - height) / 2),
        Math.round(width),
        Math.round(height));

    st.setStyles(this.image_, {
      top: st.px(this.imageBox_.top),
      left: st.px(this.imageBox_.left),
      width: st.px(this.imageBox_.width),
      height: st.px(this.imageBox_.height)
    });

    // TODO(dvoytenko): update pan/zoom info.

    return this.updateSrc_();
  }

  /**
   * @return {!Promise}
   * @private
   */
  updateSrc_() {
    this.maxSeenScale_ = Math.max(this.maxSeenScale_, this.scale_);
    let width = this.imageBox_.width * this.maxSeenScale_;
    let src = this.srcset_.select(width, this.lightbox_.getDpr()).url;
    if (src == this.image_.getAttribute('src')) {
      return Promise.resolve();
    }
    // Notice that we will wait until the next event cycle to set the "src".
    // This ensures that the already available image will show immediately
    // and then naturally upgrade to a higher quality image.
    return timer.promise(1).then(() => {
      this.image_.setAttribute('src', src);
      return loadPromise(this.image_);
    });
  }
}


/**
 * This class implements "amp-image-lightbox" extension element.
 */
class AmpImageLightbox extends AMP.BaseElement {

  /** @override */
  isLayoutSupported(layout) {
    return layout == Layout.NODISPLAY;
  }

  /** @override */
  isReadyToBuild() {
    return true;
  }

  /** @override */
  buildCallback() {

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

    /** @private {?Unlisten} */
    this.unlistenViewport_ = null;

    /** @private {!Element} */
    this.container_ = document.createElement('div');
    this.container_.classList.add('-amp-image-lightbox-container');
    this.element.appendChild(this.container_);

    /** @private {!ImageViewer} */
    this.imageViewer_ = new ImageViewer(this);
    this.container_.appendChild(this.imageViewer_.getElement());

    /** @private {!Element} */
    this.captionElement_ = document.createElement('div');
    this.captionElement_.classList.add('amp-image-lightbox-caption');
    this.captionElement_.classList.add('-amp-image-lightbox-caption');
    this.container_.appendChild(this.captionElement_);

    this.element.addEventListener('click', (e) => {
      if (!this.entering_ &&
            !this.imageViewer_.getImage().contains(e.target)) {
        this.close();
      }
    });
  }

  /** @override */
  activate(invocation) {
    if (this.active_) {
      return;
    }

    let source = invocation.source;
    assert(source && SUPPORTED_ELEMENTS_[source.tagName.toLowerCase()],
        'Unsupported element: %s', source.tagName);

    this.active_ = true;
    this.reset_();
    this.init_(source);

    // Prepare to enter in lightbox
    this.requestFullOverlay();

    this.enter_();

    this.unlistenViewport_ = this.getViewport().onChanged(() => {
      if (this.active_) {
        this.imageViewer_.measure();
      }
    });

    this.getHistory_().push(this.close.bind(this)).then((historyId) => {
      this.historyId_ = historyId;
    });
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

    this.cancelFullOverlay();
    if (this.historyId_ != -1) {
      this.getHistory_().pop(this.historyId_);
    }
  }

  /**
   * Toggles the view mode.
   * @param {boolean=} opt_on
   */
  toggleViewMode(opt_on) {
    if (opt_on !== undefined) {
      this.container_.classList.toggle('-amp-image-lightbox-view-mode', opt_on);
    } else {
      this.container_.classList.toggle('-amp-image-lightbox-view-mode');
    }
  }

  /**
   * @param {!Element} sourceElement
   * @param {!Element} sourceImage
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
      let figure = dom.closestByTag(sourceElement, 'figure');
      if (figure) {
        caption = dom.elementByTag(figure, 'figcaption');
      }
    }

    // 2. Check "aria-describedby".
    if (!caption) {
      let describedBy = sourceElement.getAttribute('aria-describedby');
      caption = document.getElementById(describedBy);
    }

    if (caption) {
      dom.copyChildren(caption, this.captionElement_);
    }
  }

  /** @private */
  reset_() {
    this.imageViewer_.reset();
    dom.removeChildren(this.captionElement_);
    this.sourceElement_ = null;
    this.sourceImage_ = null;
  }

  /**
   * @return {!Promise}
   * @private
   */
  enter_() {
    this.entering_ = true;

    st.setStyles(this.element, {
      opacity: 0,
      display: ''
    });
    this.imageViewer_.measure();

    let anim = new Animation();
    let dur = 700;

    // Lightbox background fades in.
    anim.add(0, tr.setStyles(this.element, {
      opacity: tr.numeric(0, 1)
    }), 0.6, ENTER_CURVE_);

    // Try to transition from the source image.
    let transLayer = null;
    if (this.sourceImage_ && isLoaded(this.sourceImage_) &&
            this.sourceImage_.src) {
      transLayer = document.createElement('div');
      transLayer.classList.add('-amp-image-lightbox-trans');
      document.body.appendChild(transLayer);

      let rect = layoutRectFromDomRect(this.sourceImage_.
          getBoundingClientRect());
      let clone = this.sourceImage_.cloneNode(true);
      st.setStyles(clone, {
        position: 'absolute',
        top: st.px(rect.top),
        left: st.px(rect.left),
        width: st.px(rect.width),
        height: st.px(rect.height)
      });
      transLayer.appendChild(clone);

      this.sourceImage_.classList.add('-amp-ghost');

      // Move the image to the location given by the lightbox.
      let imageBox = this.imageViewer_.getImageBox();
      let dx = imageBox.left - rect.left;
      let dy = imageBox.top - rect.top;
      anim.add(0, tr.setStyles(clone, {
        transform: tr.translate(tr.numeric(0, dx), tr.numeric(0, dy))
      }), 0.8, ENTER_CURVE_);

      // Fade in the container. This will mostly affect the caption.
      st.setStyles(this.container_, {opacity: 0});
      anim.add(0.8, tr.setStyles(this.container_, {
        opacity: tr.numeric(0, 1)
      }), 0.1, ENTER_CURVE_);

      // At the end, fade out the transition image.
      anim.add(0.9, tr.setStyles(transLayer, {
        opacity: tr.numeric(1, 0.01)
      }), 0.1, EXIT_CURVE_);

      // Duration will be somewhere between 300ms and 700ms depending on
      // how far the image needs to move.
      dur = Math.max(Math.min(Math.abs(dy) / 250 * dur, dur), 300);
    }

    return anim.start(dur).thenAlways(() => {
      this.entering_ = false;
      st.setStyles(this.element, {opacity: ''});
      st.setStyles(this.container_, {opacity: ''});
      if (transLayer) {
        document.body.removeChild(transLayer);
      }
    });
  }

  /**
   * @return {!Promise}
   * @private
   */
  exit_() {
    let image = this.imageViewer_.getImage();
    let imageBox = this.imageViewer_.getImageBox();

    let anim = new Animation();
    let dur = 600;

    // Lightbox background fades out.
    anim.add(0, tr.setStyles(this.element, {
      opacity: tr.numeric(1, 0)
    }), 0.9, EXIT_CURVE_);

    // Try to transition to the source image.
    let transLayer = null;
    if (isLoaded(image) && image.src && this.sourceImage_) {
      transLayer = document.createElement('div');
      transLayer.classList.add('-amp-image-lightbox-trans');
      document.body.appendChild(transLayer);

      let rect = layoutRectFromDomRect(this.sourceImage_.
          getBoundingClientRect());
      let newLeft = imageBox.left + (imageBox.width - rect.width) / 2;
      let newTop = imageBox.top + (imageBox.height - rect.height) / 2;
      let clone = image.cloneNode(true);
      st.setStyles(clone, {
        position: 'absolute',
        top: st.px(newTop),
        left: st.px(newLeft),
        width: st.px(rect.width),
        height: st.px(rect.height),
        transform: ''
      });
      transLayer.appendChild(clone);

      // Fade out the container.
      anim.add(0, tr.setStyles(this.container_, {
        opacity: tr.numeric(1, 0)
      }), 0.1, EXIT_CURVE_);

      // Move the image back to where it is in the article.
      let dx = rect.left - newLeft;
      let dy = rect.top - newTop;
      let move = tr.setStyles(clone, {
        transform: tr.translate(tr.numeric(0, dx), tr.numeric(0, dy))
      });
      anim.add(0.1, (time, complete) => {
        move(time);
        if (complete) {
          this.sourceImage_.classList.remove('-amp-ghost');
        }
      }, 0.7, EXIT_CURVE_);

      // Fade out the transition image.
      anim.add(0.8, tr.setStyles(transLayer, {
        opacity: tr.numeric(1, 0.01)
      }), 0.2, EXIT_CURVE_);

      // Duration will be somewhere between 300ms and 700ms depending on
      // how far the image needs to move.
      dur = Math.max(Math.min(Math.abs(dy) / 250 * dur, dur), 300);
    }

    return anim.start(dur).thenAlways(() => {
      if (this.sourceImage_) {
        this.sourceImage_.classList.remove('-amp-ghost');
      }
      st.setStyles(this.element, {
        display: 'none',
        opacity: ''
      });
      st.setStyles(this.container_, {opacity: ''});
      document.body.removeChild(transLayer);
      this.reset_();
    });
  }

  /** @private {!History} */
  getHistory_() {
    return historyFor(this.element.ownerDocument.defaultView);
  }
}

AMP.registerElement('amp-image-lightbox', AmpImageLightbox, $CSS$);
