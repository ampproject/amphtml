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
import {getMode} from '../mode';
import {user} from '../log';

const TAG = 'AMP-BIND';

export class Bind {
  /**
   * @param {!./ampdoc-impl.AmpDoc}
   */
  constructor(ampdoc) {
    /** @const {!./ampdoc-impl.AmpDoc} */
    this.ampdoc = ampdoc;

    /** @const {!Array} */
    this.bindings_ = [];

    /** @const {!Object} */
    this.scope_ = Object.create(null);

    this.ampdoc.whenBodyAvailable().then(body => {
      this.scanForBindings_(body);

      // Trigger verify-only digest in development.
      if (getMode().development) {
        this.digest_(true);
      }
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
        this.verify_(binding, result);
      } else {
        this.apply_(binding, result);
      }
    }
  }

  /**
   * @param binding {!Object}
   * @param newValue {!(Object|string|number)}
   * @private
   */
  apply_(binding, newValue) {
    const {property, expression, element} = binding;
    
    if (property === 'text') {
      element.textContent = newValue;
    } else if (property === 'class') {
      throw new Error('Class binding not implemented yet.');
    } else {
      element.setAttribute(attribute, newValue);
    }
  }

  /**
   * @param binding {!Object}
   * @param expectedValue {!(Object|string|number)}
   * @private
   */
  verify_(binding, expectedValue) {
    const {property, expression, element} = binding;
    let initialValue;

    if (property === 'text') {
      initialValue = element.textContent;
    } else if (property === 'class') {
      throw new Error('Class binding not implemented yet.');
    } else {
      initialValue = element.getAttribute(attribute);
    }

    if (initialValue !== expectedValue) {
      user().error(TAG,
        `<${element.tagName}> element [${property}] binding's ` +
        `default value (${initialValue}) does not match first expression ` +
        `result (${expectedValue}).`);
    }
  }
}
