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

import {dev} from '../../../src/log';
import {
  isJsonScriptTag,
  scopedQuerySelector,
  scopedQuerySelectorAll,
} from '../../../src/dom';
import {tryParseJson} from '../../../src/json';

/** @visibleForTesting */
export const CONFIG_KEY = 'verificationGroups';

/**
 * @typedef {{
 *    name:string,
 *    message:string
 *  }}
 */
let VerificationErrorDef;

/**
 * @typedef {{
 *    errors:!Array<!VerificationErrorDef>
 *  }}
 */
let VerificationErrorResponseDef;

/**
 * Construct the correct form verifier based on whether
 * a config block is present.
 * @param {!HTMLFormElement} form
 * @param {function():Promise<!../../../src/service/xhr-impl.FetchResponse>} xhr
 */
export function getFormVerifier(form, xhr) {
  const configTag = getConfig_(form);
  if (configTag) {
    const config = dev().assert(parseConfig_(configTag));
    return new AsyncVerifier(form, config, xhr);
  } else {
    return new DefaultVerifier(form, [], xhr);
  }
}

/**
 * @param {!HTMLFormElement} form
 * @return {?Element}
 * @private
 */
function getConfig_(form) {
  return form.getElementsByTagName('script')[0];
}

/**
 * @param {!Element} script
 * @return {!Array<!VerificationGroup>}
 * @private
 */
function parseConfig_(script) {
  if (isJsonScriptTag(script)) {
    const json = tryParseJson(script.textContent, () => {
      throw new Error('Failed to parse amp-form config. Is it valid JSON?');
    });
    const config = json && json[CONFIG_KEY];
    if (!config.length) {
      throw new Error(`The amp-form verification config should contain an array
        property ${CONFIG_KEY} with at least one element`);
    }
    return config.map(group => {
      const selector = group.elements.join(',');
      const form = dev().assertElement(script.parentElement);
      const elements = Array.prototype.slice.call(
          scopedQuerySelectorAll(form, selector));
      return new VerificationGroup(elements);
    });
  } else {
    throw new Error('The amp-form verification config should ' +
        'be put in a <script> tag with type="application/json"');
  }
}

/**
 * An interface for a form verifier. Implementations could check for duplicate
 * usernames on a remote server, check against an in-memory cache to verify
 * data in ways not possible with standard form validation, or check
 * values against sets of data too large to fit in browser memory
 * e.g. ensuring zip codes match with cities.
 * @visibleForTesting
 */
export class FormVerifier {
  /**
   * @param {!HTMLFormElement} form
   * @param {!Array<!VerificationGroup>} config
   * @param {function():Promise<!../../../src/service/xhr-impl.FetchResponse>} xhr
   */
  constructor(form, config, xhr) {
    /** @protected @const */
    this.form_ = form;

    /** @protected @const {!Array<!VerificationGroup>} */
    this.groups_ = config;

    /** @protected @const*/
    this.doXhr_ = xhr;
  }

  /**
   * Called when the user has modified the value in the input,
   * e.g. the input's 'input' event
   * @param {!Element} unusedInput
   */
  onMutate(unusedInput) {}

  /**
   * Called when the user has fully set a value to be verified,
   * e.g. the input's 'change' event
   * @param {!Element} unusedInput
   * @param {!function(!Array<!Element>)} unusedAfterVerify
   */
  onCommit(unusedInput, unusedAfterVerify) {}
}

/**
 * A no-op verifier.
 * @visibleForTesting
 */
export class DefaultVerifier extends FormVerifier { }

/**
 * A verifier that verifies values via an XHR
 * @visibleForTesting
 */
export class AsyncVerifier extends FormVerifier {
  /** @override */
  onMutate(input) {
    const group = this.getGroup_(input);
    if (group) {
      group.setDirty(true);
      group.clearErrors();
    }
  }

  /** @override */
  onCommit(input, afterVerify) {
    if (this.isVerificationElement_(input)) {
      this.maybeVerify_(afterVerify);
    }
  }

  /**
   * Sends the verify request if any group is ready to verify.
   * @param {!function(!Array<!Element>)} afterVerify
   * @private
   */
  maybeVerify_(afterVerify) {
    if (this.shouldVerify_()) {
      this.doXhr_().then(() => {
        return [];
      }, error => {
        return getResponseErrorData_(/** @type {!Error} */ (error));
      })
      .then(errors => this.verify_(errors))
      .then(updatedElements => afterVerify(updatedElements));
    }
  }

  /**
   * Set errors on elements that failed verification, and clear any
   * verification state for elements that passed verification.
   * @param {!Array<!VerificationErrorDef>} errors
   * @private
   */
  verify_(errors) {
    const errorElements = [];
    let updatedElements = [];

    // Set the error message on each element that caused an error.
    for (let i = 0; i < errors.length; i++) {
      const error = errors[i];
      const element = scopedQuerySelector(this.form_, `[name="${error.name}"]`);
      if (element && element.checkValidity()) {
        element.setCustomValidity(error.message);
        errorElements.push(element);
      }
    }

    // Remove the dirty flag from the successful groups that have values.
    for (let i = 0; i < this.groups_.length; i++) {
      const group = this.groups_[i];
      if (group.isFilledOut() && group.containsNoElementOf(errorElements)) {
        group.setDirty(false);
        updatedElements = updatedElements.concat(group.getElements());
      }
    }

    return errorElements.concat(updatedElements);
  }

  /**
   * Check if any group in the form needs to be verified.
   * @return {boolean}
   * @private
   */
  shouldVerify_() {
    return this.groups_.some(group => group.shouldVerify());
  }

  /**
   * Check if an element is a member of a verification group.
   * @param {!Element} element
   * @return {boolean}
   * @private
   */
  isVerificationElement_(element) {
    return !!this.getGroup_(element);
  }

  /**
   * Get the group that contains the given element.
   * @param {!Element} element
   * @return {?VerificationGroup}
   * @private
   */
  getGroup_(element) {
    for (let i = 0; i < this.groups_.length; i++) {
      const group = this.groups_[i];
      if (group.containsElement(element)) {
        return group;
      }
    }
    return null;
  }
}

/**
 * Encapsulates a list of related inputs and a "dirty" flag to
 * help determine when to send a verification request. Provides methods
 * for querying the state of the grouped elements.
 * @private
 */
class VerificationGroup {
  /**
   * @param {!Array<!Element>} elements
   */
  constructor(elements) {
    /** @private @const */
    this.elements_ = elements;

    /** @private */
    this.dirty_ = false;
  }

  /**
   * Get the list of elements in this verification group
   * @return {!Array<!Element>}
   */
  getElements() {
    return this.elements_;
  }

  /**
   * Set the dirty flag to indicate if the user has changed the value since
   * the last verification.
   * @param {boolean} dirty
   */
  setDirty(dirty) {
    this.dirty_ = dirty;
  }

  /**
   * Get the dirty flag value.
   * @return {boolean}
   */
  isDirty() {
    return this.dirty_;
  }

  /**
   * Check if this group contains the given element.
   * @param {!Element} element
   * @return {boolean}
   */
  containsElement(element) {
    return this.elements_.includes(element);
  }

  /**
   * Check if this group contains none of the given elements
   * @param {!Array<!Element>} elements
   * @return {boolean}
   */
  containsNoElementOf(elements) {
    return !elements.some(element => this.containsElement(element));
  }

  /**
   * Check if the group is eligible for verification.
   */
  shouldVerify() {
    return this.isDirty() && this.isFilledOut();
  }

  /**
   * Check if every required element in the group has a value,
   * and that those values are valid.
   */
  isFilledOut() {
    return this.elements_.every(element => element.checkValidity());
  }

  /**
   * Clear the validity state of this group's elements.
   */
  clearErrors() {
    this.elements_.forEach(element => element.setCustomValidity(''));
  }
}

/**
 * @param {!Error} error
 * @return {!Array<VerificationErrorDef>}
 * @private
 */
function getResponseErrorData_(error) {
  const json = /** @type {?VerificationErrorResponseDef} */ (
      error.responseJson && error.responseJson);
  if (json && json.errors) {
    return json.errors;
  } else {
    return [];
  }
}
