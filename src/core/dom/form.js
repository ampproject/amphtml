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

import {iterateCursor} from '#core/dom';
import {ancestorElementsByTag} from '#core/dom/query';
import {toArray} from '#core/types/array';
import {dict} from '#core/types/object';

/**
 * Stub type until an AmpForm interface is available in typechecked-land.
 * Should be satisfied by `#extensions/amp-form/0.1/amp-form.AmpForm`
 * @typedef {?}
 */
let AmpFormDef;

/** @const {string} */
const FORM_PROP_ = '__AMP_FORM';

/**
 * @param {!Element} element
 * @return {AmpFormDef}
 */
export function formOrNullForElement(element) {
  return element[FORM_PROP_] || null;
}

/**
 * @param {!Element} element
 * @param {!AmpFormDef} form
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
  const data = dict();
  // <button> is handled separately
  const submittableTagsRegex = /^(?:input|select|textarea)$/i;
  // type=submit is handled separately
  const unsubmittableTypesRegex = /^(?:submit|button|image|file|reset)$/i;
  const checkableType = /^(?:checkbox|radio)$/i;

  for (let i = 0; i < elements.length; i++) {
    /**
     * Real type is one of several, but we treat as any old object since we're
     * testing which (if any) it matches
     * https://developer.mozilla.org/en-US/docs/Web/API/HTMLFormElement/elements
     * @type {?}
     */
    const input = elements[i];
    const {checked, multiple, name, options, tagName, type, value} = input;
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
      iterateCursor(options, (option) => {
        if (option.selected) {
          data[name].push(option.value);
        }
      });
      continue;
    }
    data[name].push(value);
  }

  const submitButton = getSubmitButtonUsed(form);
  if (submitButton?.name) {
    const {name, value} = submitButton;
    if (data[name] === undefined) {
      data[name] = [];
    }
    data[name].push(value);
  }

  // Wait until the end to remove the empty values, since
  // we don't know when evaluating any one input whether
  // there will be or have already been inputs with the same names.
  // e.g. We want to remove empty <select multiple name=x> but
  // there could also be an <input name=x>. At the end we know if an empty name
  // can be deleted.
  Object.keys(data).forEach((key) => {
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
 * @return {?HTMLButtonElement}
 */
export function getSubmitButtonUsed(form) {
  const {elements} = form;
  const {activeElement} = form.ownerDocument;

  const submitBtns = /** @type {!Array<!HTMLButtonElement>} */ (
    toArray(elements).filter(isSubmitButton)
  );
  return submitBtns.includes(/** @type {?} */ (activeElement))
    ? /** @type {HTMLButtonElement} */ (activeElement)
    : submitBtns[0] || null;
}

/**
 * True if the given button can submit a form.
 * @param {!Element} element
 * @return {boolean}
 */
function isSubmitButton(element) {
  const {tagName, type} = /** @type {!HTMLButtonElement} */ (element);
  return tagName == 'BUTTON' || type == 'submit';
}

/**
 * Checks if a field is disabled.
 * @param {!HTMLInputElement} element
 * @return {boolean}
 */
export function isDisabled(element) {
  return (
    element.disabled ||
    ancestorElementsByTag(element, 'fieldset').some(
      (el) => /** @type {!HTMLFieldSetElement} */ (el).disabled
    )
  );
}

/**
 * Checks if a form field is in its default state.
 * @param {!HTMLInputElement|!HTMLSelectElement} field
 * @return {boolean}
 */
export function isFieldDefault(field) {
  switch (field.type) {
    case 'select-multiple':
    case 'select-one':
      return toArray(/** @type {!HTMLSelectElement} */ (field).options).every(
        ({defaultSelected, selected}) => selected === defaultSelected
      );
    case 'checkbox':
    case 'radio':
      return field.checked === field.defaultChecked;
    default:
      return field.value === field.defaultValue;
  }
}

/**
 * Checks if a form field is empty. It expects a form field element,
 * i.e. `<input>`, `<textarea>`, or `<select>`.
 * @param {!HTMLInputElement} field
 * @throws {Error}
 * @return {boolean}
 */
export function isFieldEmpty(field) {
  switch (field.tagName) {
    case 'INPUT':
      if (field.type == 'checkbox' || field.type == 'radio') {
        return !field.checked;
      } else {
        return !field.value;
      }
    case 'TEXTAREA':
      return !field.value;
    case 'SELECT':
      // dropdown menu has at least one option always selected
      return false;
    default:
      throw new Error(
        `isFieldEmpty: ${field.tagName} is not a supported field element.`
      );
  }
}
