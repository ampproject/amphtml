/**
 * Copyright 2018 The AMP HTML Authors. All Rights Reserved.
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
  LocalizedStringBundleDef,
  LocalizedStringId,
} from '../../../../src/localized-strings';

/**
 * Localized string bundle used for English strings.
 * @const {!LocalizedStringBundleDef}
 */
const strings = {
  [LocalizedStringId.AMP_STORY_QUIZ_ANSWER_CHOICE_A]: {
    string: 'A',
    description:
      'Label for the first answer choice from a multiple choice quiz (e.g. A in A/B/C/D)',
  },
  [LocalizedStringId.AMP_STORY_QUIZ_ANSWER_CHOICE_B]: {
    string: 'B',
    description:
      'Label for the second answer choice from a multiple choice quiz (e.g. B in A/B/C/D)',
  },
  [LocalizedStringId.AMP_STORY_QUIZ_ANSWER_CHOICE_C]: {
    string: 'C',
    description:
      'Label for the third answer choice from a multiple choice quiz (e.g. C in A/B/C/D)',
  },
  [LocalizedStringId.AMP_STORY_QUIZ_ANSWER_CHOICE_D]: {
    string: 'D',
    description:
      'Label for the fourth answer choice from a multiple choice quiz (e.g. D in A/B/C/D)',
  },
};

export default strings;
