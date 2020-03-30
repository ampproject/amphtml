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

import {AttributeMutationDefaultClass} from './mutation/attribute-mutation-default-class';
import {AttributeMutationDefaultStyle} from './mutation/attribute-mutation-default-style';
import {AttributeMutationDefaultUrl} from './mutation/attribute-mutation-default-url';
import {CharacterDataMutation} from './mutation/character-data-mutation';
import {
  assertMutationRecordFormat,
  getElementsFromMutationRecordSelector,
} from './mutation-record';
import {user, userAssert} from '../../../src/log';

const TAG = 'amp-experiment apply-experiment';

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
 * @return {!Promise}
 */
export function applyExperimentToVariant(ampdoc, config, experimentToVariant) {
  // Get all of our mutation records across all experiments
  // That are being applied
  const mutationRecords = getMutationRecordsFromExperimentToVariant(
    config,
    experimentToVariant
  );

  // Need to wait until the document is ready
  // before selecting and mutating from the document.
  return ampdoc.whenReady().then(() => {
    // Assert the formats of the mutation record,
    // find its respective elements,
    // count the number of mutations that will applied
    const mutationRecordsAndElements = [];
    let totalMutations = 0;
    mutationRecords.forEach((mutationRecord) => {
      assertMutationRecordFormat(mutationRecord);

      // Select the elements from the mutation record
      const elements = getElementsFromMutationRecordSelector(
        ampdoc.win.document,
        mutationRecord
      );
      totalMutations += elements.length;
      mutationRecordsAndElements.push({
        mutationRecord,
        elements,
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

    // Create the mutations
    const mutations = createMutationsFromMutationRecordsAndElements(
      mutationRecordsAndElements
    );

    // Parse and validate all mutations
    mutations.forEach((mutation) => {
      userAssert(
        mutation.parseAndValidate(),
        'Mutation %s has an an unsupported value.',
        mutation.toString()
      );
    });

    // Apply all the mutations
    mutations.forEach((mutation) => {
      mutation.mutate();
    });
  });
}

/**
 *  Get all of our mutation records across all chosen variants
 *  in the respected experiments
 *
 * @param {!JsonObject} config
 * @param {!Object<string, ?string>} experimentToVariant
 * @return {!Array<!JsonObject>}
 */
export function getMutationRecordsFromExperimentToVariant(
  config,
  experimentToVariant
) {
  /** {Array<JsonObject>} */
  let mutationRecords = [];
  for (const experimentName in experimentToVariant) {
    const variantName = experimentToVariant[experimentName];
    if (variantName) {
      const variantObject = config[experimentName]['variants'][variantName];
      mutationRecords = mutationRecords.concat(variantObject['mutations']);
    }
  }

  return mutationRecords;
}

/**
 * Function to convert all of the individual JSON
 * mutation records, and their selected elements,
 * Into Mutation objects.
 *
 * @param {!Array<Object>} mutationRecordsAndElements
 * @return {!Array<Object>}
 */
export function createMutationsFromMutationRecordsAndElements(
  mutationRecordsAndElements
) {
  const mutations = [];
  mutationRecordsAndElements.forEach((mutationRecordAndElements) => {
    const {mutationRecord, elements} = mutationRecordAndElements;

    let mutation = undefined;
    if (mutationRecord['type'] === 'characterData') {
      mutation = new CharacterDataMutation(mutationRecord, elements);
    } else if (mutationRecord['type'] === 'attributes') {
      if (mutationRecord['attributeName'] === 'style') {
        mutation = new AttributeMutationDefaultStyle(mutationRecord, elements);
      } else if (
        mutationRecord['attributeName'] === 'href' ||
        mutationRecord['attributeName'] === 'src'
      ) {
        mutation = new AttributeMutationDefaultUrl(mutationRecord, elements);
      } else if (mutationRecord['attributeName'] === 'class') {
        mutation = new AttributeMutationDefaultClass(mutationRecord, elements);
      } else {
        // Did not find a supported attributeName
        throw new Error(
          `Mutation ${JSON.stringify(
            mutationRecord
          )} has an unsupported attributeName.`
        );
      }
    } else {
      user().error(
        TAG,
        'childList mutations not supported in the current experiment state.'
      );

      // TODO: Allow for innerHTML mutations
      // Therefore, return a noop mutation.
      mutation = {
        parseAndValidate: () => true,
        mutate: () => {},
      };
    }

    mutations.push(mutation);
  });
  return mutations;
}
