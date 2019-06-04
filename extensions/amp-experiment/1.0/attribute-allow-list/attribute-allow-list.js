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
  DefaultAllowedURLAttributeMutationEntry,
  DefaultStyleAllowedAttributeMutationEntry,
} from './allowed-attribute-mutation-entry';
import {user, userAssert} from '../../../../src/log';

const TAG = 'amp-experiment allowed-mutations';

/**
 * Function to validate the attribute mutation
 * should be allowed, and return its mutation
 * @param {!Object} mutationRecord
 * @param {!Element} element
 * @param {string} stringifiedMutation
 * @return {!./allowed-attribute-mutation-entry.AllowedAttributeMutationEntry}
 */
export function getAllowedAttributeMutationEntry(
  mutationRecord,
  element,
  stringifiedMutation,
) {
  // Assert the mutation attribute is one of the following keys
  const mutationAttributeName = mutationRecord['attributeName'];
  userAssert(
    attributeMutationAllowList[mutationAttributeName] !== undefined,
    'Mutation %s has an unsupported attributeName.',
    stringifiedMutation
  );

  // Find our allow list entry
  const mutationTagName = element.tagName.toLowerCase();

  // Search through the allow list for our
  // Allowed attribute entry
  let allowedAttributeMutationEntry;
  if (attributeMutationAllowList[mutationAttributeName][mutationTagName]) {
    allowedAttributeMutationEntry =
      attributeMutationAllowList[mutationAttributeName][mutationTagName];
  } else if (attributeMutationAllowList[mutationAttributeName]['*']) {
    allowedAttributeMutationEntry =
      attributeMutationAllowList[mutationAttributeName]['*'];
  }

  if (!allowedAttributeMutationEntry) {
    const error = `Mutation ${stringifiedMutation} has an unsupported attributeName` +
      ` for the element ${element}.`;
    user().error(TAG, error);
    throw new Error(error);
  }

  return allowedAttributeMutationEntry;
}

export const attributeMutationAllowList = {
  'style': {
    '*': new DefaultStyleAllowedAttributeMutationEntry(),
  },
  'src': {
    '*': new DefaultAllowedURLAttributeMutationEntry(),
  },
  'href': {
    '*': new DefaultAllowedURLAttributeMutationEntry(),
  },
};
