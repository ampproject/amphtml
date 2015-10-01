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

import {getLengthNumeral, isLayoutSizeDefined} from '../../../src/layout';
import {loadPromise} from '../../../src/event-helper';
import {parseSrcset} from '../../../src/srcset';
import * as st from '../../../src/style';

class AmpAnim extends AMP.BaseElement {

  var supported_mimetypes = Object.create(null); // cache of supported mime types

  /** @override */
  isLayoutSupported(layout) {
    return isLayoutSizeDefined(layout);
  }

  /** @override */
  isReadyToBuild() {
    return this.element.firstChild != null;
  }

  /** @override */
  buildCallback() {
    /** @private @const {?Element} */
    this.placeholder_ = this.getPlaceholder();

    // We want to be able to support <source> children that represent either
    // images or videos, and select the most performant one amongst them.  
    //
    // This is because some web developers will create a gif, webm, and mp4
    // file representing the same animated image, and dynamically display the
    // most performant one amongst these supported by the User Agent.
    // 
    // We rely on the source tags to already be in preferred order, so all 
    // we need to do is select the first one that's supported, create the 
    // corresponding amp-image/amp-video tag, and move the source tag under
    // that tag, and delete the other source tags.
    //
    // We only check for children if no "src" tag is present.
    //

    if (this.attributes.src == null) { 
      // run through all SOURCE tags, if they're playable, create a
      // corresponding amp-img/amp-video tag and move all children under that
      // tag, then delete all later source tags
      // if it's not playable, eat it
      
        // typemap:
        //    uppercased mime-type type (before slash) => tag to create
        var typemap = {
          "IMAGE": "amp-img",
          "VIDEO": "amp-video"
        };

      this.getRealChildNodes().forEach( () => {
        if (child.nodeType !== Node.ELEMENT_NODE)
          return; 
        if (child.tagName != 'SOURCE')
          return;
        // eat the <source>
        if (child.attributes.type === null) {
          // XXX warning
          return;
        }
        // we do want to pass any optional parameters in the typeval media type through to typeSupported.
        var type = child.attributes.type.trim().slice(0, typeval.indexOf('/'));
        if (!type in typemap) {
          // only image and video types are supported
          return;
        }
        if (mimetypeSupported(typeval, type)) {
            // create a corresponding amp-img/video tag
            var media_tag = 'amp-' + type.toLowerCase();
            // XXX create tag, move source under it, escape, delete parent tag
        }
      });
    }

    /** @private @const {!Element} */
    this.img_ = new Image();
    this.propagateAttributes(['alt'], this.img_);
    this.applyFillContent(this.img_);
    this.img_.width = getLengthNumeral(this.element.getAttribute('width'));
    this.img_.height = getLengthNumeral(this.element.getAttribute('height'));

    // The image shown/hidden depends on placeholder.
    st.toggle(this.img_, !this.placeholder_);

    this.element.appendChild(this.img_);

    /** @private @const {!Srcset} */
    this.srcset_ = parseSrcset(this.element.getAttribute('srcset') ||
        this.element.getAttribute('src'));

    /** @private */
    isTypeSupported(typeval, type) {
      if (!typeval in this.supported_types) {
        // we haven't seen this mimetype yet
        this.supported_types[type] =
          document.createElement('video').canPlayType(type);
      }
      return this.supported_mimetypes[mimetype];
    }

    /** @private {?Promise} */
    this.loadPromise_ = null;
  }

  /** @override */
  isRelayoutNeeded() {
    return true;
  }

  /** @override */
  layoutCallback() {
    return this.updateImageSrc_();
  }

  /** @override */
  viewportCallback(inViewport) {
    if (this.placeholder_) {
      if (!inViewport || !this.loadPromise_) {
        this.updateInViewport_(inViewport);
      } else {
        this.loadPromise_.then(() => this.updateInViewport_(inViewport));
      }
    }
  }

  /** @private */
  updateInViewport_() {
    let inViewport = this.isInViewport();
    this.placeholder_.classList.toggle('hidden', inViewport);
    st.toggle(this.img_, inViewport);
  }

  /**
   * @return {!Promise}
   * @private
   */
  updateImageSrc_() {
    let src = this.srcset_.select(this.element.offsetWidth,
        this.getDpr()).url;
    if (src == this.img_.getAttribute('src')) {
      return Promise.resolve();
    }
    this.img_.setAttribute('src', src);
    this.loadPromise_ = loadPromise(this.img_);
    return this.loadPromise_;
  }
}

AMP.registerElement('amp-anim', AmpAnim);
