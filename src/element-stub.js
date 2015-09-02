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

import {BaseElement} from './base-element';
import {Layout} from './layout';


export const stubbedElements = [];

export class ElementStub extends BaseElement {
  constructor(element) {
    super(element);
    this.calledFirstAttachedCallback_ = false;
    this.calledLoadContent_ = false;
    this.calledLoadIdleContent_ = false;
    stubbedElements.push(this);
    /** @private {?Function} */
    this.loadPromiseResolve_ = null;
    /** @private {?Function} */
    this.loadPromiseReject_ = null;
  }

  /** @override */
  isLayoutSupported(layout) {
    // Always returns true and will eventually call this method on the actual
    // element.
    return true;
  }

  createdCallback() {
    this.element.classList.add('amp-unresolved');
    this.element.classList.add('-amp-unresolved');
  }

  upgrade(newImpl) {
    // TODO(dvoytenko): this might be too early given that the children may
    // not be available yet.
    this.element.classList.remove('amp-unresolved');
    this.element.classList.remove('-amp-unresolved');
    newImpl.createdCallback();
    try {
      if (this.getLayout() != Layout.NODISPLAY &&
            !newImpl.isLayoutSupported(this.getLayout())) {
        throw new Error('Layout not supported: ' + this.getLayout());
      }
      newImpl.layout_ = this.getLayout();
      if (this.calledFirstAttachedCallback_) {
        newImpl.firstAttachedCallback();
        this.element.dispatchCustomEvent('amp:attached');
      }
    } catch(e) {
      let msg = '' + e;
      // TODO(dvoytenko): only do this in dev mode
      this.element.classList.add('-amp-element-error');
      this.element.textContent = msg;
      throw e;
    }
    if (this.calledLoadContent_) {
      var promise = newImpl.loadContent();
      promise.then(this.loadPromiseResolve_, this.loadPromiseReject_);
      this.element.dispatchCustomEvent('amp:load:start');
    }
    if (this.calledLoadIdleContent_) {
      newImpl.loadIdleContent();
    }
  }

  /** @override */
  firstAttachedCallback() {
    this.calledFirstAttachedCallback_ = true;
  }

  /** @override */
  loadContent() {
    // TODO(malteubl): Implement prefetching.
    this.calledLoadContent_ = true;
    return new Promise((resolve, reject) => {
      this.loadPromiseResolve_ = resolve;
      this.loadPromiseReject_ = reject;
    });
  }

  /** @override */
  loadIdleContent() {
    this.calledLoadIdleContent_ = true;
  }
}
