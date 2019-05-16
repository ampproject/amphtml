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

import {
  DefaultStyleAllowedAttributeEntry,
  DefaultAllowedURLAttributeEntry
} from './allowed-attribute-entry';
import {user, userAssert} from '../../../src/log';

const TAG = 'amp-experiment allowed-mutations';

/**
 * Function to validate the attribute mutation
 * should be allowed, and return its mutation
 * @param {!Object} mutationRecord
 * @param {string} stringifiedMutation
 * @return {!Function}
 */
export function getAllowedAttributeMutation(mutationRecord, stringifiedMutation) {

  // Assert the mutation attribute is one of the following keys
  const mutationAttributeName = mutationRecord['attributeName'];
  userAssert(
      attributeMutationAllowListKeys.indexOf(mutationAttributeName) >= 0,
      'Mutation %s has an unsupported attributeName.',
      stringifiedMutation
  );

  // Find our allow list entry
  const mutationTagName = mutationRecord['targetElement']
    .tagName.toLowerCase();

  // Search through the allow list for our
  // Allowed attribute entry
  let allowedAttributeEntry = undefined;
  if (attributeMutationAllowList[mutationAttributeName][mutationTagName]) {
    allowedAttributeEntry =
      attributeMutationAllowList[mutationAttributeName][mutationTagName];
  } else if (attributeMutationAllowList[mutationAttributeName]['*']) {
    allowedAttributeEntry = attributeMutationAllowList[mutationAttributeName]['*'];

    if (!allowedAttributeEntry.tags.includes[mutationTagName] &&
      !allowedAttributeEntry.tags.includes['*']) {
      allowedAttributeEntry = undefined;
    }
  }

  if (!allowedAttributeEntry) {
    user().error(
      TAG,
      'Mutation %s has an unsupported attributeName.',
      stringifiedMutation
    );
  }

  // Assert the mutation attribute passes it's check
  userAssert(
      allowedAttributeEntry.validate(
          mutationRecord['value']
      ),
      'Mutation %s has an an unsupported value.',
      stringifiedMutation
  );

  // Return the corresponding mutation
  return allowedAttributeEntry.mutate.bind(this, mutationRecord);
}

const attributeMutationAllowList = {
  'style': {
    '*': new DefaultStyleAllowedAttributeEntry()
  }
  'src': {
    '*': new DefaultAllowedURLAttributeEntry()
  },
  'href': {
    '*': new DefaultAllowedURLAttributeEntry()
  }
};

const attributeMutationAllowListKeys =
  Object.keys(attributeMutationAllowList);
