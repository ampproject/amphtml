/**
 * Copyright 2016 The AMP HTML Authors. All Rights Reserved.
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


/** @const */
Const EXPERIMENT = ‘amp-messaging-protocol’;


/** @const */
Const TAG = ‘amp-messaging-protocol’;


export class AmpMessagingProtocol extends AMP.BaseElement {


  /** @param {!AmpElement} element */
  constructor(element) {
    super(element);


    // declare instance variables with type annotations.
  }


  /** @override */
  isLayoutSupported(layout) {
     return layout == LAYOUT.FIXED;
  }


  /** @override */
  buildCallback() {
    // get attributes, assertions of values, assign instance variables.
    // build lightweight dom and append to this.element.
  }


  /** @override */
  layoutCallback() {
    // actually load your resource or render more expensive resources.
  }
}


AMP.registerElement(‘amp-messaging-protocol’, AmpMessagingProtocol, CSS);