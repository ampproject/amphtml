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

import {ancestorElementsByTag, iterateCursor} from './dom';

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
 * Includes focused submit buttons.
 * @param {!HTMLFormElement} form
 * @return {!JsonObject}
 */
export function getFormAsObject(form) {
  const {elements} = form;
  const data = /** @type {!JsonObject} */ ({});
  // <button> is handled separately
  const submittableTagsRegex = /^(?:input|select|textarea)$/i;
  // type=submit is handled separately
  const unsubmittableTypesRegex = /^(?:submit|button|image|file|reset)$/i;
  const checkableType = /^(?:checkbox|radio)$/i;

  for (let i = 0; i < elements.length; i++) {
    const input = elements[i];
    const {checked, name, multiple, options, tagName, type, value} = input;
    if (
      !name ||
      isDisabled(input) ||
      !submittableTagsRegex.test(tagName) ||
      unsubmittableTypesRegex.test(type) ||
      (checkableType.test(type) && !checked)
    ) {
      continue;
    }

    if (data[name] === undefined) {
      data[name] = [];
    }

    if (multiple) {
      iterateCursor(options, option => {
        if (option.selected) {
          data[name].push(option.value);
        }
      });
      continue;
    }
    data[name].push(value);
  }

  const submitButton = getSubmitButtonUsed(form);
  if (submitButton && submitButton.name) {
    const {name} = submitButton;
    if (data[name] === undefined) {
      data[name] = [];
    }
    data[submitButton.name].push(submitButton.value);
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
 * Gets the submit button used to submit the form.
 * This searches through the form elements to find:
 * 1. The first submit button element OR
 * 2. a focused submit button, indicating it was specifically used to submit.
 * 3. null, if neither of the above is found.
 * @param {!HTMLFormElement} form
 * @return {?Element}
 */
export function getSubmitButtonUsed(form) {
  const {elements} = form;
  const {length} = elements;
  const {activeElement} = form.ownerDocument;
  let firstSubmitButton = null;

  for (let i = 0; i < length; i++) {
    const element = elements[i];

    if (!isSubmitButton(element)) {
      continue;
    }

    if (!firstSubmitButton) {
      firstSubmitButton = element;
    }

    if (activeElement == element) {
      return activeElement;
    }
  }
  return firstSubmitButton;
}

/**
 * True if the given button can submit a form.
 * @param {!Element} element
 * @return {boolean}
 */
function isSubmitButton(element) {
  const {tagName, type} = element;
  return tagName == 'BUTTON' || type == 'submit';
}

/**
 * Checks if a field is disabled.
 * @param {!Element} element
 */
export function isDisabled(element) {
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

/**
 * Checks if a form field is in its default state.
 * @param {!Element} field
 * @return {boolean}
 */
export function isFieldDefault(field) {
  switch (field.type) {
    case 'select-multiple':
    case 'select-one':
      const {options} = field;
      for (let j = 0; j < options.length; j++) {
        if (options[j].selected !== options[j].defaultSelected) {
          return false;
        }
      }
      break;
    case 'checkbox':
    case 'radio':
      return field.checked === field.defaultChecked;
    default:
      return field.value === field.defaultValue;
  }
  return true;
}

/**
 * Checks if a form field is empty.
 * @param {!Element} field
 * @return {boolean}
 */
export function isFieldEmpty(field) {
  switch (field.type) {
    case 'select-multiple':
    case 'select-one':
      // dropdown menu has at least one option always selected
      return false;
    case 'checkbox':
    case 'radio':
      return !field.checked;
    default:
      return !field.value;
  }

  return true;
}
