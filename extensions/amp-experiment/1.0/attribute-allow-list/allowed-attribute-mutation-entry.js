/**
 * Copyright 2019 The AMP HTML Authors. All Rights Reserved.
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

import {assertHttpsUrl} from '../../../../src/url';

/**
 * Base class for allowed attribute assertions.
 * This should be extended to ensure the service
 * is properly handled
 */
export class AllowedAttributeMutationEntry {
  /**
   * Function to validate the value
   * for the attribute change. Subclasses
   * may override.
   * @param {!Object} mutationRecord
   * @return {boolean}
   */
  validate(mutationRecord) {
    return !!mutationRecord['value'];
  }

  /**
   * Function to apply the mutation.
   * Subclasses may override
   * @param {!Object} mutationRecord
   */
  mutate(mutationRecord) {
    mutationRecord['targetElement'].setAttribute(
      mutationRecord['attributeName'],
      mutationRecord['value']
    );
  }
}

/**
 * Class for handling ['style']['*'] attribute
 * mutations
 */
export class DefaultStyleAllowedAttributeMutationEntry extends AllowedAttributeMutationEntry {
  /** @override */
  validate(mutationRecord) {
    const value = mutationRecord['value'];

    // Do not allow Important or HTML Comments
    if (value.match(/(!\s*important|<!--)/)) {
      return false;
    }

    // Allow Color
    if (value.match(/^color:\s*#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3});?$/)) {
      return true;
    }

    // Allow Background color
    if (
      value.match(/^background-color:\s*#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3});?$/)
    ) {
      return true;
    }

    return false;
  }
}

/**
 * Class for handling URL type attribute
 * mutations. E.g ['href']['*']
 */
export class DefaultAllowedURLAttributeMutationEntry extends AllowedAttributeMutationEntry {
  /** @override */
  validate(mutationRecord) {
    assertHttpsUrl(
      mutationRecord['value'],
      mutationRecord['target'],
      'attributes mutation'
    );
    return true;
  }
}

/**
 * Class for handling class type attribute
 * mutations. E.g ['class']['*']
 */
export class DefaultClassAllowedAttributeMutationEntry extends AllowedAttributeMutationEntry {
  /** @override */
  validate(mutationRecord) {
    const value = mutationRecord['value'];

    // Don't allow the .i-amphtml class
    // Should stay in sync with
    // `validator/validator-main.protoascii`
    if (value.match(/(^|\\W)i-amphtml-/)) {
      return false;
    }

    return true;
  }
}
