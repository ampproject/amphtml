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
  ancestorElementsByTag,
  iterateCursor,
} from './dom';

/** @const {string} */
const FORM_PROP_ = '__AMP_FORM';

/**
 * @param {!Element} element
 * @return {../extensions/amp-form/0.1/amp-form.AmpForm}
 */
export function formOrNullForElement(element) {
  return element[FORM_PROP_] || null;
}

/**
 * @param {!Element} element
 * @param {!../extensions/amp-form/0.1/amp-form.AmpForm} form
 */
export function setFormForElement(element, form) {
  element[FORM_PROP_] = form;
}

/**
 * Returns form data in the passed-in form as an object.
 * @param {!HTMLFormElement} form
 * @return {!JsonObject}
 */
export function getFormAsObject(form) {
  const data = /** @type {!JsonObject} */ ({});
  const inputs = form.elements;
  const submittableTagsRegex = /^(?:input|select|textarea)$/i;
  const unsubmittableTypesRegex = /^(?:button|image|file|reset)$/i;
  const checkableType = /^(?:checkbox|radio)$/i;
  for (let i = 0; i < inputs.length; i++) {
    const input = inputs[i];
    const {name} = input;
    if (!name || isDisabled(input) ||
        !submittableTagsRegex.test(input.tagName) ||
        unsubmittableTypesRegex.test(input.type) ||
        (checkableType.test(input.type) && !input.checked)) {
      continue;
    }

    if (data[name] === undefined) {
      data[name] = [];
    }

    if (input.multiple) {
      iterateCursor(input.options, option => {
        if (option.selected) {
          data[name].push(option.value);
        }
      });
    } else {
      data[name].push(input.value);
    }
  }

  // Wait until the end to remove the empty values, since
  // we don't know when evaluating any one input whether
  // there will be or have already been inputs with the same names.
  // e.g. We want to remove empty <select multiple name=x> but
  // there could also be an <input name=x>. At the end we know if an empty name
  // can be deleted.
  Object.keys(data).forEach(key => {
    if (data[key].length == 0) {
      delete data[key];
    }
  });

  return data;
}

/**
 * Checks if a field is disabled.
 * @param {!Element} element
 * @private
 */
function isDisabled(element) {
  if (element.disabled) {
    return true;
  }

  const ancestors = ancestorElementsByTag(element, 'fieldset');
  for (let i = 0; i < ancestors.length; i++) {
    if (ancestors[i].disabled) {
      return true;
    }
  }
  return false;
}
