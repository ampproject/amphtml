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

import {assertHttpsUrl} from '../../../src/url';
import {isObject} from '../../../src/types';
import {user, userAssert} from '../../../src/log';

/**
 * Function to validate that the mutation
 * is a mutation record.
 * @param {!Object} mutationRecord
 * @param {string} stringifiedMutation
 * @return {!Boolean}
 */
export function assertAttributeMutationIsAllowed(mutationRecord, stringifiedMutation) {



  return false;
}

/**
 * Base class for allowed attribute assertions.
 * This should be extended to ensure the service
 * is properly handled
 *
 * @interface
 */
class AllowedAttributeEntry {

  constructor(opt_tags) {

  }

  /**
   * Function to validate the value
   * for the attribute change. Subclasses
   * may override.
   * @param {string} value
   * @return {!Boolean}
   */
  validate(value) {
    if (value) {
      return true;
    }
  }

  /**
   * Function to apply the mutation.
   * Subclasses may override
   * @param {!Object} mutationRecord
   */
  mutation(mutationRecord) {
    mutationRecord['targetElement'].setAttribute(
      mutationRecord['attributeName'],
      mutationRecord['value']
    );
  }
}

const attributeMutationAllowList = {
  'style': {
    '*': {
      tags: ['*'],
      validation: (value) => {
        // Do not allow Important or HTML Comments
        if (value.match(/(!\s*important|<!--)/)) {
          return false;
        }

        // Allow Color
        if (value.match(/^color:\s*#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3});?$/)) {
          return true;
        }

        // Allow Background color
        if (value.match(/^background-color:\s*#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3});?$/)) {
          return true;
        }

        return false;
      },
      mutation: (mutationRecord) => applyDefaultAttributeMutation(mutationRecord)
    }
  },
  'src': {
    '*': {
      tags: ['*'],

    }
  },
  'href': {
    '*': {
      tags: ['*']
    }
  }
};
