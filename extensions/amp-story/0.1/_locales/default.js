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
import {LocalizedStringBundleDef, LocalizedStringId} from '../localization';


/**
 * Message bundle used for English messages.
 * @const {!LocalizedStringBundleDef}
 */
export default {
  [LocalizedStringId.AMP_STORY_EXPERIMENT_ENABLE_BUTTON_LABEL]: {
    'message': 'Enable',
    'description': 'Label for a button that enables the amp-story experiment.',
  },
  [LocalizedStringId.AMP_STORY_EXPERIMENT_ENABLED_TEXT]: {
    'message': 'Experiment enabled.  Please reload.',
    'description': 'Text that is shown once the amp-story experiment has ' +
        'been successfully enabled.',
  },
  [LocalizedStringId.AMP_STORY_SHARING_CLIPBOARD_FAILURE_TEXT]: {
    'message': ':(',
    'description': 'Message shown in a toast to inform the user that a link ' +
        'could not be successfully copied to their clipboard.',
  },
  [LocalizedStringId.AMP_STORY_SYSTEM_LAYER_SHARE_WIDGET_LABEL]: {
    'message': 'Share',
    'description': 'Label for the expandable share widget shown in the ' +
        'desktop UI.',
  },
  [LocalizedStringId.AMP_STORY_WARNING_DESKTOP_SIZE_TEXT]: {
    'message': 'Expand your window to view this experience',
    'description': 'Text for a warning screen that informs the user that ' +
        'stories are only supported in larger browser windows.',
  },
  [LocalizedStringId.AMP_STORY_WARNING_EXPERIMENT_DISABLED_TEXT]: {
    'message': 'You must enable the amp-story experiment to view this content.',
    'description': 'Text for a warning screen that informs the user that ' +
        'they must enable an experiment to use stories.',
  },
  [LocalizedStringId.AMP_STORY_WARNING_LANDSCAPE_ORIENTATION_TEXT]: {
    'message': 'The page is best viewed in portrait mode',
    'description': 'Text for a warning screen that informs the user that ' +
        'stories are only supported in portrait orientation.',
  },
  [LocalizedStringId.AMP_STORY_WARNING_UNSUPPORTED_BROWSER_TEXT]: {
    'message': 'We\'re sorry, it looks like your browser doesn\'t support ' +
        'this experience',
    'description': 'Text for a warning screen that informs the user that ' +
        'their browser does not support stories.',
  },
};
