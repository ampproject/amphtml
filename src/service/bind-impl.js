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
import {vsyncFor} from '../vsync'

const TAG_ = 'AMP-BIND';

/**
 * @typedef {{
 *   property: !string,
 *   expression: !string,
 *   element: !Element
 * }}
 */
let BindingDef;

export class Bind {
  /**
   * @param {!./ampdoc-impl.AmpDoc}
   */
  constructor(ampdoc) {
    /** @const {!./ampdoc-impl.AmpDoc} */
    this.ampdoc = ampdoc;

    /** @const {!Array<BindingDef>} */
    this.bindings_ = [];

    /** @const {!Object} */
    this.scope_ = Object.create(null);

    /** @const {!./vsync-impl.Vsync} */
    this.vsync_ = vsyncFor(ampdoc.win);

    /** @const {!Array<string>} */
    this.protocolWhitelist_ = ['http', 'https'];

    this.ampdoc.whenBodyAvailable().then(body => {
      this.scanForBindings_(body);

      // Trigger verify-only digest in development.
      if (getMode().development) {
        this.digest_(true);
      }
    });
  }

  /** @param state {!Object} */
  setState(state) {
    Object.assign(this.scope_, state);

    this.digest_();
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
   * @return {?BindingDef}
   * @private
   */
  bindingForAttribute_(attribute, element) {
    // TODO: Disallow binding to blacklisted attributes.

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
   * @param opt_verifyOnly {bool}
   * @private
   */
  digest_(opt_verifyOnly) {
    for (let i = 0; i < this.bindings_.length; i++) {
      const binding = this.bindings_[i];

      /** {!VsyncTaskSpecDef} */
      const task = {
        measure: (state) => {
          state.result = evaluateBindExpr(binding.expression, this.scope_);
        },
        mutate: (state) => {
          if (opt_verifyOnly) {
            this.verifyBinding_(binding, state.result);
          } else {
            this.applyBinding_(binding, state.result);
          }
        },
      };
      this.vsync_.run(task, {});
    }
  }

  /**
   * @param binding {!BindingDef}
   * @param newValue {!(Object|string|number)}
   * @private
   */
  applyBinding_(binding, newValue) {
    const {property, expression, element} = binding;

    // TODO: Support arrays for classes and objects for attributes?

    if (property === 'text') {
      element.textContent = newValue;
    } else if (property === 'class') {
      element.classList = newValue;
    } else {
      if (newValue === false) {
        element.removeAttribute(property);
      } else {
        const sanitizedValue = this.sanitizeAttribute_(newValue);
        element.setAttribute(property, sanitizedValue);
      }
    }

    // TODO: Update AMP component state and queue relayout if necessary.
  }

  /**
   * @param binding {!BindingDef}
   * @param expectedValue {!(Object|string|number)}
   * @private
   */
  verifyBinding_(binding, expectedValue) {
    const {property, expression, element} = binding;
    let initialValue;

    if (property === 'text') {
      initialValue = element.textContent;
    } else if (property === 'class') {
      initialValue = element.classList;
    } else {
      const attribute = element.getAttribute(property);
      // A value of `false` means the attribute should be missing.
      if (expectedValue === false) {
        initialValue = (attribute !== null);
      } else {
        initialValue = attribute;
      }
    }

    if (initialValue != expectedValue) {
      user().error(TAG_,
        `<${element.tagName}> element [${property}] binding ` +
        `default value (${initialValue}) does not match first expression ` +
        `result (${expectedValue}).`);
    }
  }

  /**
   * @param value
   * @return {string}
   * @private
   */
  sanitizeAttribute_(value) {
    if (typeof value === 'string') {
      const protocol = newValue.split(':')[0];
      if (this.protocolWhitelist_.indexOf(protocol) < 0) {
        return 'unsafe:' + newValue;
      }
    }
    return value;
  }
}
