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
  assertMutationRecordFormat,
  getElementsFromMutationRecordSelector,
  MUTATION_TYPES
} from './mutation-record';
import {user} from '../../../src/log';

const TAG = 'amp-experiment mutation';

/** @const {number} */
const MAX_MUTATIONS = 70;

/**
 * Passes the given experiment and variant pairs to the correct handler,
 * to apply the experiment to the document.
 * Experiment with no variant assigned (null) will be skipped.
 *
 * For example, the `experimentToVariant` object looks like:
 * {
 *   'appliedExperimentName': 'chosenVariantName',
 *   'anotherAppliedExperimentName': 'chosenVariantName'
 * }
 * Which is a simplified version of the config and
 * represents what variant of each experiment
 * should be applied.
 *
 * @param {!../../../src/service/ampdoc-impl.AmpDoc} ampdoc
 * @param {!JsonObject} config
 * @param {!Object<string, ?string>} experimentToVariant
 * @return {!Promise<!Object<string, ?string>>} a promise of the original
 *     param passed in
 * @private
 */
export function applyExperimentToVariant(ampdoc, config, experimentToVariant) {

  // Get all of our mutation records across all experiments
  // That are being applied
  let mutationRecords = [];
  for (const experimentName in experimentToVariant) {
    const variantName = experimentToVariant[experimentName];
    if (variantName) {
      const variantObject = config[experimentName]['variants'][variantName];
      mutationRecords = mutationRecords.concat(variantObject.mutations);
    }
  }

  // Assert the formats of the mutation record,
  // find its respective elements,
  // count the number of mutations that will applied
  const mutationRecordsAndElements = [];
  let totalMutations = 0;
  mutationRecords.forEach(mutationRecord => {
    assertMutationRecordFormat(mutationRecord);

    // Select the elements from the mutation record
    const elements = getElementsFromMutationRecordSelector(ampdoc.win.document, mutationRecord);
    totalMutations += elements.length;
    mutationRecordsAndElements.push({
      mutationRecord,
      elements
    });
  });

  if (totalMutations > MAX_MUTATIONS) {
    const numMutationsError =
      'Max number of mutations for the total ' +
      `applied experiments exceeded: ${totalMutations} > ` +
      MAX_MUTATIONS;
    user().error(TAG, numMutationsError);
    throw new Error(numMutationsError);
  }

  // TODO: Make the mutation


  // TODO: Apply the mutation


  return ampdoc.whenReady().then(() => {
    // TODO: Apply all the mutations
    return experimentToVariant;
  });
}

