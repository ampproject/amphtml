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

import {Observable} from '../observable';
import {
  addDocumentVisibilityChangeListener,
  getDocumentVisibilityState,
  isDocumentHidden,
} from '../utils/document-visibility';
import {registerServiceBuilder} from '../service';

/**
 * INTENT TO DEPRECATE.
 * TODO(#22733): deprecate/remove when ampdoc-fie is launched.
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

    /** @private @const {!Observable} */
    this.visibilityObservable_ = new Observable();

    /** @private @const {!Function} */
    this.boundOnVisibilityChanged_ = this.onVisibilityChanged_.bind(this);
    addDocumentVisibilityChangeListener(
      this.document_,
      this.boundOnVisibilityChanged_
    );
  }

  /**
   * Returns the value of "document.hidden" property. The reasons why it may
   * not be visible include document in a non-active tab or when the document
   * is being pre-rendered via link with rel="prerender".
   * @return {boolean}
   */
  isHidden() {
    return isDocumentHidden(this.document_);
  }

  /**
   * Returns the value of "document.visibilityState" property. Possible values
   * are: 'hidden', 'visible', 'prerender', and 'unloaded'.
   * @return {string}
   */
  getVisibilityState() {
    return getDocumentVisibilityState(this.document_);
  }

  /**
   * @param {function()} handler
   * @return {!UnlistenDef}
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
 */
export function installGlobalDocumentStateService(window) {
  registerServiceBuilder(window, 'documentState', DocumentState);
}
