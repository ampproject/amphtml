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

import {evaluateBindExpr} from '../../extensions/amp-bind/0.1/bind-expr';
import {fromClassForDoc} from '../service';
import {user} from '../log';

export class Bind {
  /**
   * @param {!./ampdoc-impl.AmpDoc}
   */
  constructor(ampdoc) {
    /** @const {!./ampdoc-impl.AmpDoc} */
    this.ampdoc = ampdoc;

    this.bindings_ = [];

    this.scope_ = Object.create(null);

    this.ampdoc.whenBodyAvailable().then(body => {
      this.scanForBindings_(body);
      this.digest_(true);
    });
  }

  /**
   * @param body {!Element}
   * @private
   */
  scanForBindings_(body) {
    const elements = body.getElementsByTagName('*');
    for (let i = 0; i < elements.length; i++) {
      const el = elements[i];
      const attributes = el.attributes;
      for (let j = 0; j < attributes.length; j++) {
        const binding = this.bindingForAttribute_(attributes[j], el);
        if (binding) {
          this.bindings_.push(binding);
        }
      }
    }
  }

  /**
   * @param attribute {!Attr}
   * @param element {!Element}
   * @return {?Object}
   * @private
   */
  bindingForAttribute_(attribute, element) {
    if (attribute.name.length <= 2) {
      return null;
    }
    const name = attribute.name;
    if (name.charAt(0) === '[' && name.charAt(name.length - 1) === ']') {
      return {
        property: name.substr(1, name.length - 2),
        expression: attribute.value,
        element: element,
      };
    }
  }

  /**
   * @param onlyVerify {bool}
   * @private
   */
  digest_(onlyVerify) {
    for (let i = 0; i < this.bindings_.length; i++) {
      const binding = this.bindings_[i];

      const result = evaluateBindExpr(binding.expression, this.scope_);
      if (result === null) {
        continue;
      }
      
      if (onlyVerify) {
        if (!this.verify_(binding, result)) {
          user().error(`Inconsistent initial value for [${binding.property}].`);
        }
      } else {
        this.apply_(binding, result);
      }
    }
  }

  /**
   * @param binding {!Object}
   * @param result {!(Object|string|number)}
   * @private
   */
  apply_(binding, result) {
    const {property, expression, element} = binding;
    
    if (property === 'text') {
      element.textContent = result;
    } else if (property === 'class') {
      throw new Error('Class binding not implemented yet.');
    } else {
      element.setAttribute(attribute, result);
    }
  }

 /**
  * @param binding {!Object}
  * @param result {!(Object|string|number)}
  * @private
  */
 verify_(binding, result) {
   const {property, expression, element} = binding;
   
   if (property === 'text') {
     return element.textContent === result;
   } else if (property === 'class') {
     throw new Error('Class binding not implemented yet.');
   } else {
     return element.getAttribute(attribute) === result;
   }
 }
}
