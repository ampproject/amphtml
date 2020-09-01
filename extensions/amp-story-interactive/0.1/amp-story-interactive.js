/**
 * Copyright 2020 The AMP HTML Authors. All Rights Reserved.
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

import {AmpStoryInteractiveBinaryPoll} from './amp-story-interactive-binary-poll';
import {AmpStoryInteractivePoll} from './amp-story-interactive-poll';
import {AmpStoryInteractiveQuiz} from './amp-story-interactive-quiz';
import {AmpStoryInteractiveResults} from './amp-story-interactive-results';

/**
 * This extension imports the interactive components into amp-story.
 */

AMP.extension('amp-story-interactive', '0.1', (AMP) => {
  AMP.registerElement(
    'amp-story-interactive-binary-poll',
    AmpStoryInteractiveBinaryPoll
  );
  AMP.registerElement('amp-story-interactive-poll', AmpStoryInteractivePoll);
  AMP.registerElement('amp-story-interactive-quiz', AmpStoryInteractiveQuiz);
  AMP.registerElement(
    'amp-story-interactive-results',
    AmpStoryInteractiveResults
  );
});
