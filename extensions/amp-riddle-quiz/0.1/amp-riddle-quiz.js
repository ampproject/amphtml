/**
 * Copyright 2017 The AMP HTML Authors. All Rights Reserved.
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

import {
    Layout
} from '../../../src/layout';

export class AmpRiddleQuiz extends AMP.BaseElement {

    /** @param {!AmpElement} element */
    constructor(element) {
        super(element);

        /** @private {?Promise} */
        this.iframePromise_ = null;

        /** @private {?boolean} */
        this.iframeLoaded_ = false;

        /** @private {?number} */
        this.itemHeight_ = 300; //default

        /** @private {?number} */
        this.riddleId_ = null;

        /** @private {!Element} */
        this.container_ = this.win.document.createElement('div');
    }

    onWindowMessage(event) {
        if (typeof event.data != "object") {
            return;
        }

        if (event.data.riddleId != undefined && event.data.riddleId == this.riddleId_) {
            this.riddleHeightChanged_(event.data.riddleHeight);
        }
    }

    /** @override */
    buildCallback() {
        // this.container_.textContent = this.myText_;
        // this.element.appendChild(this.container_);
        // this.applyFillContent(this.container_, /* replacedContent */ true);
        this.riddleId_ = this.element.getAttribute('data-riddle-id');
        // listen for resize events coming from riddles
        window.addEventListener("message", this.onWindowMessage.bind(this), false);
    }

    /** @override */
    isLayoutSupported(layout) {
        return layout == Layout.RESPONSIVE;
    }

    /** @override */
    layoutCallback() {
        const iframe = this.element.ownerDocument.createElement('iframe');
        this.iframe_ = iframe;
        iframe.setAttribute('scrolling', 'no');
        iframe.setAttribute('frameborder', '0');
        iframe.setAttribute('allowtransparency', 'true');
        iframe.setAttribute('allowfullscreen', 'true');
        iframe.src = "https://www.riddle.com/a/iframe/" + this.riddleId_;

        this.applyFillContent(iframe);
        this.element.appendChild(iframe);

        return this.iframePromise_ = this.loadPromise(iframe).then(function() {
            this.iframeLoaded_ = true;
            this.attemptChangeHeight(this.itemHeight_).catch(() => { /* die */ });
        }.bind(this));
    }

    /**
     * @param {number} height
     */
    riddleHeightChanged_(height) {

        if (isNaN(height) || height === this.itemHeight_) {
            return;
        }

        this.itemHeight_ = height; //Save new height

        if (this.iframeLoaded_) {
            this.attemptChangeHeight(this.itemHeight_).catch(() => { /* die */ });
        }
    }
}

AMP.extension('amp-riddle-quiz', '0.1', AMP => {
  AMP.registerElement('amp-riddle-quiz', AmpRiddleQuiz, false);
});
