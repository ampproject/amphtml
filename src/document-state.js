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

import {Observable} from './observable';
import {getService} from './service';
import {getVendorJsPropertyName} from './style';


/**
 * Whether the document is ready.
 * @param {!Document} doc
 * @return {boolean}
 */
export function isDocumentReady(doc) {
  return doc.readyState != 'loading';
}


/**
 * Calls the callback when document is ready.
 * @param {!Document} doc
 * @param {!Function} callback
 */
export function onDocumentReady(doc, callback) {
  let ready = isDocumentReady(doc);
  if (ready) {
    callback();
  } else {
    const readyListener = () => {
      if (doc.readyState != 'loading') {
        if (!ready) {
          ready = true;
          callback();
        }
        doc.removeEventListener('readystatechange', readyListener);
      }
    };
    doc.addEventListener('readystatechange', readyListener);
  }
}


/**
 */
export class DocumentState {
  /**
   * @param {!Window} win
   */
  constructor(win) {
    /** @const {!Window} */
    this.win = win;

    /** @private @const {!Document} */
    this.document_ = win.document;

    /** @private @const {string|null} */
    this.hiddenProp_ = getVendorJsPropertyName(this.document_, 'hidden', true);
    if (this.document_[this.hiddenProp_] === undefined) {
      this.hiddenProp_ = null;
    }

    /** @private @const {string|null} */
    this.visibilityStateProp_ = getVendorJsPropertyName(this.document_,
        'visibilityState', true);
    if (this.document_[this.visibilityStateProp_] === undefined) {
      this.visibilityStateProp_ = null;
    }

    /** @private @const */
    this.visibilityObservable_ = new Observable();

    /** @private @const {string|null} */
    this.visibilityChangeEvent_ = null;
    if (this.hiddenProp_) {
      this.visibilityChangeEvent_ = 'visibilitychange';
      const vendorStop = this.hiddenProp_.indexOf('Hidden');
      if (vendorStop != -1) {
        this.visibilityChangeEvent_ =
            this.hiddenProp_.substring(0, vendorStop) + 'Visibilitychange';
      }
    }

    /** @private @const {!Function} */
    this.boundOnVisibilityChanged_ = this.onVisibilityChanged_.bind(this);
    if (this.visibilityChangeEvent_) {
      this.document_.addEventListener(this.visibilityChangeEvent_,
          this.boundOnVisibilityChanged_);
    }
  }

  /** @private */
  cleanup_() {
    if (this.visibilityChangeEvent_) {
      this.document_.removeEventListener(this.visibilityChangeEvent_,
          this.boundOnVisibilityChanged_);
    }
  }

  /**
   * Whether the document is ready.
   * @return {boolean}
   */
  isReady() {
    return isDocumentReady(this.document_);
  }

  /**
   * Calls the callback when document is ready.
   * @param {!Function} callback
   */
  onReady(callback) {
    return onDocumentReady(this.document_, callback);
  }

  /**
   * Returns the value of "document.hidden" property. The reasons why it may
   * not be visible include document in a non-active tab or when the document
   * is being pre-rendered via link with rel="prerender".
   * @return {boolean}
   */
  isHidden() {
    if (!this.hiddenProp_) {
      return false;
    }
    return this.document_[this.hiddenProp_];
  }

  /**
   * Returns the value of "document.visibilityState" property. Possible values
   * are: 'hidden', 'visible', 'prerender', and 'unloaded'.
   * @return {string}
   */
  getVisibilityState() {
    if (!this.visibilityStateProp_) {
      return !this.isHidden() ? 'visible' : 'hidden';
    }
    return this.document_[this.visibilityStateProp_];
  }

  /**
   * @param {function()} handler
   * @return {!Unlisten}
   */
  onVisibilityChanged(handler) {
    return this.visibilityObservable_.add(handler);
  }

  /** @private */
  onVisibilityChanged_() {
    this.visibilityObservable_.fire();
  }
}


/**
 * @param {!Window} window
 * @return {!DocumentState}
 * @private
 */
function createDocumentState_(window) {
  return new DocumentState(window);
}


/**
 * @param {!Window} window
 * @return {!DocumentState}
 */
export function documentStateFor(window) {
  return getService(window, 'documentState', () => {
    return createDocumentState_(window);
  });
};
