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
import { iterateCursor } from "./core/dom";
import { ancestorElementsByTag } from "./core/dom/query";

/** @const {string} */
var FORM_PROP_ = '__AMP_FORM';

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
  var elements = form.elements;
  var data =
  /** @type {!JsonObject} */
  {};
  // <button> is handled separately
  var submittableTagsRegex = /^(?:input|select|textarea)$/i;
  // type=submit is handled separately
  var unsubmittableTypesRegex = /^(?:submit|button|image|file|reset)$/i;
  var checkableType = /^(?:checkbox|radio)$/i;

  var _loop = function _loop(i) {
    var input = elements[i];
    var checked = input.checked,
        multiple = input.multiple,
        name = input.name,
        options = input.options,
        tagName = input.tagName,
        type = input.type,
        value = input.value;

    if (!name || isDisabled(input) || !submittableTagsRegex.test(tagName) || unsubmittableTypesRegex.test(type) || checkableType.test(type) && !checked) {
      return "continue";
    }

    if (data[name] === undefined) {
      data[name] = [];
    }

    if (multiple) {
      iterateCursor(options, function (option) {
        if (option.selected) {
          data[name].push(option.value);
        }
      });
      return "continue";
    }

    data[name].push(value);
  };

  for (var i = 0; i < elements.length; i++) {
    var _ret = _loop(i);

    if (_ret === "continue") continue;
  }

  var submitButton = getSubmitButtonUsed(form);

  if (submitButton && submitButton.name) {
    var name = submitButton.name;

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
  Object.keys(data).forEach(function (key) {
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
  var elements = form.elements;
  var length = elements.length;
  var activeElement = form.ownerDocument.activeElement;
  var firstSubmitButton = null;

  for (var i = 0; i < length; i++) {
    var element = elements[i];

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
  var tagName = element.tagName,
      type = element.type;
  return tagName == 'BUTTON' || type == 'submit';
}

/**
 * Checks if a field is disabled.
 * @param {!Element} element
 * @return {boolean}
 */
export function isDisabled(element) {
  if (element.disabled) {
    return true;
  }

  var ancestors = ancestorElementsByTag(element, 'fieldset');

  for (var i = 0; i < ancestors.length; i++) {
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
      var options = field.options;

      for (var j = 0; j < options.length; j++) {
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
 * Checks if a form field is empty. It expects a form field element,
 * i.e. `<input>`, `<textarea>`, or `<select>`.
 * @param {!Element} field
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
      throw new Error("isFieldEmpty: " + field.tagName + " is not a supported field element.");
  }
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImZvcm0uanMiXSwibmFtZXMiOlsiaXRlcmF0ZUN1cnNvciIsImFuY2VzdG9yRWxlbWVudHNCeVRhZyIsIkZPUk1fUFJPUF8iLCJmb3JtT3JOdWxsRm9yRWxlbWVudCIsImVsZW1lbnQiLCJzZXRGb3JtRm9yRWxlbWVudCIsImZvcm0iLCJnZXRGb3JtQXNPYmplY3QiLCJlbGVtZW50cyIsImRhdGEiLCJzdWJtaXR0YWJsZVRhZ3NSZWdleCIsInVuc3VibWl0dGFibGVUeXBlc1JlZ2V4IiwiY2hlY2thYmxlVHlwZSIsImkiLCJpbnB1dCIsImNoZWNrZWQiLCJtdWx0aXBsZSIsIm5hbWUiLCJvcHRpb25zIiwidGFnTmFtZSIsInR5cGUiLCJ2YWx1ZSIsImlzRGlzYWJsZWQiLCJ0ZXN0IiwidW5kZWZpbmVkIiwib3B0aW9uIiwic2VsZWN0ZWQiLCJwdXNoIiwibGVuZ3RoIiwic3VibWl0QnV0dG9uIiwiZ2V0U3VibWl0QnV0dG9uVXNlZCIsIk9iamVjdCIsImtleXMiLCJmb3JFYWNoIiwia2V5IiwiYWN0aXZlRWxlbWVudCIsIm93bmVyRG9jdW1lbnQiLCJmaXJzdFN1Ym1pdEJ1dHRvbiIsImlzU3VibWl0QnV0dG9uIiwiZGlzYWJsZWQiLCJhbmNlc3RvcnMiLCJpc0ZpZWxkRGVmYXVsdCIsImZpZWxkIiwiaiIsImRlZmF1bHRTZWxlY3RlZCIsImRlZmF1bHRDaGVja2VkIiwiZGVmYXVsdFZhbHVlIiwiaXNGaWVsZEVtcHR5IiwiRXJyb3IiXSwibWFwcGluZ3MiOiJBQUFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUVBLFNBQVFBLGFBQVI7QUFDQSxTQUFRQyxxQkFBUjs7QUFFQTtBQUNBLElBQU1DLFVBQVUsR0FBRyxZQUFuQjs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLE9BQU8sU0FBU0Msb0JBQVQsQ0FBOEJDLE9BQTlCLEVBQXVDO0FBQzVDLFNBQU9BLE9BQU8sQ0FB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OztBQUNEOztBQUNGLFNBQUssVUFBTDtBQUNBLFNBQUssT0FBTDtBQUNFLGFBQU9GLEtBQUssQ0FBQzNCLE9BQU4sS0FBa0IyQixLQUFLLENBQUNHLGNBQS9COztBQUNGO0FBQ0UsYUFBT0gsS0FBSyxDQUFDckIsS0FBTixLQUFnQnFCLEtBQUssQ0FBQ0ksWUFBN0I7QUFkSjs7QUFnQkEsU0FBTyxJQUFQO0FBQ0Q7O0FBRUQ7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxPQUFPLFNBQVNDLFlBQVQsQ0FBc0JMLEtBQXRCLEVBQTZCO0FBQ2xDLFVBQVFBLEtBQUssQ0FBQ3ZCLE9BQWQ7QUFDRSxTQUFLLE9BQUw7QUFDRSxVQUFJdUIsS0FBSyxDQUFDdEIsSUFBTixJQUFjLFVBQWQsSUFBNEJzQixLQUFLLENBQUN0QixJQUFOLElBQWMsT0FBOUMsRUFBdUQ7QUFDckQsZUFBTyxDQUFDc0IsS0FBSyxDQUFDM0IsT0FBZDtBQUNELE9BRkQsTUFFTztBQUNMLGVBQU8sQ0FBQzJCLEtBQUssQ0FBQ3JCLEtBQWQ7QUFDRDs7QUFDSCxTQUFLLFVBQUw7QUFDRSxhQUFPLENBQUNxQixLQUFLLENBQUNyQixLQUFkOztBQUNGLFNBQUssUUFBTDtBQUNFO0FBQ0EsYUFBTyxLQUFQOztBQUNGO0FBQ0UsWUFBTSxJQUFJMkIsS0FBSixvQkFDYU4sS0FBSyxDQUFDdkIsT0FEbkIsd0NBQU47QUFiSjtBQWlCRCIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQ29weXJpZ2h0IDIwMTcgVGhlIEFNUCBIVE1MIEF1dGhvcnMuIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogTGljZW5zZWQgdW5kZXIgdGhlIEFwYWNoZSBMaWNlbnNlLCBWZXJzaW9uIDIuMCAodGhlIFwiTGljZW5zZVwiKTtcbiAqIHlvdSBtYXkgbm90IHVzZSB0aGlzIGZpbGUgZXhjZXB0IGluIGNvbXBsaWFuY2Ugd2l0aCB0aGUgTGljZW5zZS5cbiAqIFlvdSBtYXkgb2J0YWluIGEgY29weSBvZiB0aGUgTGljZW5zZSBhdFxuICpcbiAqICAgICAgaHR0cDovL3d3dy5hcGFjaGUub3JnL2xpY2Vuc2VzL0xJQ0VOU0UtMi4wXG4gKlxuICogVW5sZXNzIHJlcXVpcmVkIGJ5IGFwcGxpY2FibGUgbGF3IG9yIGFncmVlZCB0byBpbiB3cml0aW5nLCBzb2Z0d2FyZVxuICogZGlzdHJpYnV0ZWQgdW5kZXIgdGhlIExpY2Vuc2UgaXMgZGlzdHJpYnV0ZWQgb24gYW4gXCJBUy1JU1wiIEJBU0lTLFxuICogV0lUSE9VVCBXQVJSQU5USUVTIE9SIENPTkRJVElPTlMgT0YgQU5ZIEtJTkQsIGVpdGhlciBleHByZXNzIG9yIGltcGxpZWQuXG4gKiBTZWUgdGhlIExpY2Vuc2UgZm9yIHRoZSBzcGVjaWZpYyBsYW5ndWFnZSBnb3Zlcm5pbmcgcGVybWlzc2lvbnMgYW5kXG4gKiBsaW1pdGF0aW9ucyB1bmRlciB0aGUgTGljZW5zZS5cbiAqL1xuXG5pbXBvcnQge2l0ZXJhdGVDdXJzb3J9IGZyb20gJy4vY29yZS9kb20nO1xuaW1wb3J0IHthbmNlc3RvckVsZW1lbnRzQnlUYWd9IGZyb20gJy4vY29yZS9kb20vcXVlcnknO1xuXG4vKiogQGNvbnN0IHtzdHJpbmd9ICovXG5jb25zdCBGT1JNX1BST1BfID0gJ19fQU1QX0ZPUk0nO1xuXG4vKipcbiAqIEBwYXJhbSB7IUVsZW1lbnR9IGVsZW1lbnRcbiAqIEByZXR1cm4gey4uL2V4dGVuc2lvbnMvYW1wLWZvcm0vMC4xL2FtcC1mb3JtLkFtcEZvcm19XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBmb3JtT3JOdWxsRm9yRWxlbWVudChlbGVtZW50KSB7XG4gIHJldHVybiBlbGVtZW50W0ZPUk1fUFJPUF9dIHx8IG51bGw7XG59XG5cbi8qKlxuICogQHBhcmFtIHshRWxlbWVudH0gZWxlbWVudFxuICogQHBhcmFtIHshLi4vZXh0ZW5zaW9ucy9hbXAtZm9ybS8wLjEvYW1wLWZvcm0uQW1wRm9ybX0gZm9ybVxuICovXG5leHBvcnQgZnVuY3Rpb24gc2V0Rm9ybUZvckVsZW1lbnQoZWxlbWVudCwgZm9ybSkge1xuICBlbGVtZW50W0ZPUk1fUFJPUF9dID0gZm9ybTtcbn1cblxuLyoqXG4gKiBSZXR1cm5zIGZvcm0gZGF0YSBpbiB0aGUgcGFzc2VkLWluIGZvcm0gYXMgYW4gb2JqZWN0LlxuICogSW5jbHVkZXMgZm9jdXNlZCBzdWJtaXQgYnV0dG9ucy5cbiAqIEBwYXJhbSB7IUhUTUxGb3JtRWxlbWVudH0gZm9ybVxuICogQHJldHVybiB7IUpzb25PYmplY3R9XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBnZXRGb3JtQXNPYmplY3QoZm9ybSkge1xuICBjb25zdCB7ZWxlbWVudHN9ID0gZm9ybTtcbiAgY29uc3QgZGF0YSA9IC8qKiBAdHlwZSB7IUpzb25PYmplY3R9ICovICh7fSk7XG4gIC8vIDxidXR0b24+IGlzIGhhbmRsZWQgc2VwYXJhdGVseVxuICBjb25zdCBzdWJtaXR0YWJsZVRhZ3NSZWdleCA9IC9eKD86aW5wdXR8c2VsZWN0fHRleHRhcmVhKSQvaTtcbiAgLy8gdHlwZT1zdWJtaXQgaXMgaGFuZGxlZCBzZXBhcmF0ZWx5XG4gIGNvbnN0IHVuc3VibWl0dGFibGVUeXBlc1JlZ2V4ID0gL14oPzpzdWJtaXR8YnV0dG9ufGltYWdlfGZpbGV8cmVzZXQpJC9pO1xuICBjb25zdCBjaGVja2FibGVUeXBlID0gL14oPzpjaGVja2JveHxyYWRpbykkL2k7XG5cbiAgZm9yIChsZXQgaSA9IDA7IGkgPCBlbGVtZW50cy5sZW5ndGg7IGkrKykge1xuICAgIGNvbnN0IGlucHV0ID0gZWxlbWVudHNbaV07XG4gICAgY29uc3Qge2NoZWNrZWQsIG11bHRpcGxlLCBuYW1lLCBvcHRpb25zLCB0YWdOYW1lLCB0eXBlLCB2YWx1ZX0gPSBpbnB1dDtcbiAgICBpZiAoXG4gICAgICAhbmFtZSB8fFxuICAgICAgaXNEaXNhYmxlZChpbnB1dCkgfHxcbiAgICAgICFzdWJtaXR0YWJsZVRhZ3NSZWdleC50ZXN0KHRhZ05hbWUpIHx8XG4gICAgICB1bnN1Ym1pdHRhYmxlVHlwZXNSZWdleC50ZXN0KHR5cGUpIHx8XG4gICAgICAoY2hlY2thYmxlVHlwZS50ZXN0KHR5cGUpICYmICFjaGVja2VkKVxuICAgICkge1xuICAgICAgY29udGludWU7XG4gICAgfVxuXG4gICAgaWYgKGRhdGFbbmFtZV0gPT09IHVuZGVmaW5lZCkge1xuICAgICAgZGF0YVtuYW1lXSA9IFtdO1xuICAgIH1cblxuICAgIGlmIChtdWx0aXBsZSkge1xuICAgICAgaXRlcmF0ZUN1cnNvcihvcHRpb25zLCAob3B0aW9uKSA9PiB7XG4gICAgICAgIGlmIChvcHRpb24uc2VsZWN0ZWQpIHtcbiAgICAgICAgICBkYXRhW25hbWVdLnB1c2gob3B0aW9uLnZhbHVlKTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgICBjb250aW51ZTtcbiAgICB9XG4gICAgZGF0YVtuYW1lXS5wdXNoKHZhbHVlKTtcbiAgfVxuXG4gIGNvbnN0IHN1Ym1pdEJ1dHRvbiA9IGdldFN1Ym1pdEJ1dHRvblVzZWQoZm9ybSk7XG4gIGlmIChzdWJtaXRCdXR0b24gJiYgc3VibWl0QnV0dG9uLm5hbWUpIHtcbiAgICBjb25zdCB7bmFtZX0gPSBzdWJtaXRCdXR0b247XG4gICAgaWYgKGRhdGFbbmFtZV0gPT09IHVuZGVmaW5lZCkge1xuICAgICAgZGF0YVtuYW1lXSA9IFtdO1xuICAgIH1cbiAgICBkYXRhW3N1Ym1pdEJ1dHRvbi5uYW1lXS5wdXNoKHN1Ym1pdEJ1dHRvbi52YWx1ZSk7XG4gIH1cblxuICAvLyBXYWl0IHVudGlsIHRoZSBlbmQgdG8gcmVtb3ZlIHRoZSBlbXB0eSB2YWx1ZXMsIHNpbmNlXG4gIC8vIHdlIGRvbid0IGtub3cgd2hlbiBldmFsdWF0aW5nIGFueSBvbmUgaW5wdXQgd2hldGhlclxuICAvLyB0aGVyZSB3aWxsIGJlIG9yIGhhdmUgYWxyZWFkeSBiZWVuIGlucHV0cyB3aXRoIHRoZSBzYW1lIG5hbWVzLlxuICAvLyBlLmcuIFdlIHdhbnQgdG8gcmVtb3ZlIGVtcHR5IDxzZWxlY3QgbXVsdGlwbGUgbmFtZT14PiBidXRcbiAgLy8gdGhlcmUgY291bGQgYWxzbyBiZSBhbiA8aW5wdXQgbmFtZT14Pi4gQXQgdGhlIGVuZCB3ZSBrbm93IGlmIGFuIGVtcHR5IG5hbWVcbiAgLy8gY2FuIGJlIGRlbGV0ZWQuXG4gIE9iamVjdC5rZXlzKGRhdGEpLmZvckVhY2goKGtleSkgPT4ge1xuICAgIGlmIChkYXRhW2tleV0ubGVuZ3RoID09IDApIHtcbiAgICAgIGRlbGV0ZSBkYXRhW2tleV07XG4gICAgfVxuICB9KTtcblxuICByZXR1cm4gZGF0YTtcbn1cblxuLyoqXG4gKiBHZXRzIHRoZSBzdWJtaXQgYnV0dG9uIHVzZWQgdG8gc3VibWl0IHRoZSBmb3JtLlxuICogVGhpcyBzZWFyY2hlcyB0aHJvdWdoIHRoZSBmb3JtIGVsZW1lbnRzIHRvIGZpbmQ6XG4gKiAxLiBUaGUgZmlyc3Qgc3VibWl0IGJ1dHRvbiBlbGVtZW50IE9SXG4gKiAyLiBhIGZvY3VzZWQgc3VibWl0IGJ1dHRvbiwgaW5kaWNhdGluZyBpdCB3YXMgc3BlY2lmaWNhbGx5IHVzZWQgdG8gc3VibWl0LlxuICogMy4gbnVsbCwgaWYgbmVpdGhlciBvZiB0aGUgYWJvdmUgaXMgZm91bmQuXG4gKiBAcGFyYW0geyFIVE1MRm9ybUVsZW1lbnR9IGZvcm1cbiAqIEByZXR1cm4gez9FbGVtZW50fVxuICovXG5leHBvcnQgZnVuY3Rpb24gZ2V0U3VibWl0QnV0dG9uVXNlZChmb3JtKSB7XG4gIGNvbnN0IHtlbGVtZW50c30gPSBmb3JtO1xuICBjb25zdCB7bGVuZ3RofSA9IGVsZW1lbnRzO1xuICBjb25zdCB7YWN0aXZlRWxlbWVudH0gPSBmb3JtLm93bmVyRG9jdW1lbnQ7XG4gIGxldCBmaXJzdFN1Ym1pdEJ1dHRvbiA9IG51bGw7XG5cbiAgZm9yIChsZXQgaSA9IDA7IGkgPCBsZW5ndGg7IGkrKykge1xuICAgIGNvbnN0IGVsZW1lbnQgPSBlbGVtZW50c1tpXTtcblxuICAgIGlmICghaXNTdWJtaXRCdXR0b24oZWxlbWVudCkpIHtcbiAgICAgIGNvbnRpbnVlO1xuICAgIH1cblxuICAgIGlmICghZmlyc3RTdWJtaXRCdXR0b24pIHtcbiAgICAgIGZpcnN0U3VibWl0QnV0dG9uID0gZWxlbWVudDtcbiAgICB9XG5cbiAgICBpZiAoYWN0aXZlRWxlbWVudCA9PSBlbGVtZW50KSB7XG4gICAgICByZXR1cm4gYWN0aXZlRWxlbWVudDtcbiAgICB9XG4gIH1cbiAgcmV0dXJuIGZpcnN0U3VibWl0QnV0dG9uO1xufVxuXG4vKipcbiAqIFRydWUgaWYgdGhlIGdpdmVuIGJ1dHRvbiBjYW4gc3VibWl0IGEgZm9ybS5cbiAqIEBwYXJhbSB7IUVsZW1lbnR9IGVsZW1lbnRcbiAqIEByZXR1cm4ge2Jvb2xlYW59XG4gKi9cbmZ1bmN0aW9uIGlzU3VibWl0QnV0dG9uKGVsZW1lbnQpIHtcbiAgY29uc3Qge3RhZ05hbWUsIHR5cGV9ID0gZWxlbWVudDtcbiAgcmV0dXJuIHRhZ05hbWUgPT0gJ0JVVFRPTicgfHwgdHlwZSA9PSAnc3VibWl0Jztcbn1cblxuLyoqXG4gKiBDaGVja3MgaWYgYSBmaWVsZCBpcyBkaXNhYmxlZC5cbiAqIEBwYXJhbSB7IUVsZW1lbnR9IGVsZW1lbnRcbiAqIEByZXR1cm4ge2Jvb2xlYW59XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBpc0Rpc2FibGVkKGVsZW1lbnQpIHtcbiAgaWYgKGVsZW1lbnQuZGlzYWJsZWQpIHtcbiAgICByZXR1cm4gdHJ1ZTtcbiAgfVxuXG4gIGNvbnN0IGFuY2VzdG9ycyA9IGFuY2VzdG9yRWxlbWVudHNCeVRhZyhlbGVtZW50LCAnZmllbGRzZXQnKTtcbiAgZm9yIChsZXQgaSA9IDA7IGkgPCBhbmNlc3RvcnMubGVuZ3RoOyBpKyspIHtcbiAgICBpZiAoYW5jZXN0b3JzW2ldLmRpc2FibGVkKSB7XG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG4gIH1cbiAgcmV0dXJuIGZhbHNlO1xufVxuXG4vKipcbiAqIENoZWNrcyBpZiBhIGZvcm0gZmllbGQgaXMgaW4gaXRzIGRlZmF1bHQgc3RhdGUuXG4gKiBAcGFyYW0geyFFbGVtZW50fSBmaWVsZFxuICogQHJldHVybiB7Ym9vbGVhbn1cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGlzRmllbGREZWZhdWx0KGZpZWxkKSB7XG4gIHN3aXRjaCAoZmllbGQudHlwZSkge1xuICAgIGNhc2UgJ3NlbGVjdC1tdWx0aXBsZSc6XG4gICAgY2FzZSAnc2VsZWN0LW9uZSc6XG4gICAgICBjb25zdCB7b3B0aW9uc30gPSBmaWVsZDtcbiAgICAgIGZvciAobGV0IGogPSAwOyBqIDwgb3B0aW9ucy5sZW5ndGg7IGorKykge1xuICAgICAgICBpZiAob3B0aW9uc1tqXS5zZWxlY3RlZCAhPT0gb3B0aW9uc1tqXS5kZWZhdWx0U2VsZWN0ZWQpIHtcbiAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgJ2NoZWNrYm94JzpcbiAgICBjYXNlICdyYWRpbyc6XG4gICAgICByZXR1cm4gZmllbGQuY2hlY2tlZCA9PT0gZmllbGQuZGVmYXVsdENoZWNrZWQ7XG4gICAgZGVmYXVsdDpcbiAgICAgIHJldHVybiBmaWVsZC52YWx1ZSA9PT0gZmllbGQuZGVmYXVsdFZhbHVlO1xuICB9XG4gIHJldHVybiB0cnVlO1xufVxuXG4vKipcbiAqIENoZWNrcyBpZiBhIGZvcm0gZmllbGQgaXMgZW1wdHkuIEl0IGV4cGVjdHMgYSBmb3JtIGZpZWxkIGVsZW1lbnQsXG4gKiBpLmUuIGA8aW5wdXQ+YCwgYDx0ZXh0YXJlYT5gLCBvciBgPHNlbGVjdD5gLlxuICogQHBhcmFtIHshRWxlbWVudH0gZmllbGRcbiAqIEB0aHJvd3Mge0Vycm9yfVxuICogQHJldHVybiB7Ym9vbGVhbn1cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGlzRmllbGRFbXB0eShmaWVsZCkge1xuICBzd2l0Y2ggKGZpZWxkLnRhZ05hbWUpIHtcbiAgICBjYXNlICdJTlBVVCc6XG4gICAgICBpZiAoZmllbGQudHlwZSA9PSAnY2hlY2tib3gnIHx8IGZpZWxkLnR5cGUgPT0gJ3JhZGlvJykge1xuICAgICAgICByZXR1cm4gIWZpZWxkLmNoZWNrZWQ7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXR1cm4gIWZpZWxkLnZhbHVlO1xuICAgICAgfVxuICAgIGNhc2UgJ1RFWFRBUkVBJzpcbiAgICAgIHJldHVybiAhZmllbGQudmFsdWU7XG4gICAgY2FzZSAnU0VMRUNUJzpcbiAgICAgIC8vIGRyb3Bkb3duIG1lbnUgaGFzIGF0IGxlYXN0IG9uZSBvcHRpb24gYWx3YXlzIHNlbGVjdGVkXG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgZGVmYXVsdDpcbiAgICAgIHRocm93IG5ldyBFcnJvcihcbiAgICAgICAgYGlzRmllbGRFbXB0eTogJHtmaWVsZC50YWdOYW1lfSBpcyBub3QgYSBzdXBwb3J0ZWQgZmllbGQgZWxlbWVudC5gXG4gICAgICApO1xuICB9XG59XG4iXX0=
// /Users/mszylkowski/src/amphtml/src/form.js