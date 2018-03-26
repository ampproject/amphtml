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
 * Localized string bundle used for English strings.
 * @const {!LocalizedStringBundleDef}
 */
export default {
  [LocalizedStringId.AMP_STORY_EXPERIMENT_ENABLE_BUTTON_LABEL]: {
    string: 'Enable',
    description: 'Label for a button that enables the amp-story experiment.',
  },
  [LocalizedStringId.AMP_STORY_EXPERIMENT_ENABLED_TEXT]: {
    string: 'Experiment enabled.  Please reload.',
    description: 'Text that is shown once the amp-story experiment has ' +
        'been successfully enabled.',
  },
  [LocalizedStringId.AMP_STORY_HINT_UI_NEXT_LABEL]: {
    string: 'Next',
    description: 'Label indicating that users can navigate to the next ' +
        'page, in the amp-story hint UI.',
  },
  [LocalizedStringId.AMP_STORY_HINT_UI_PREVIOUS_LABEL]: {
    string: 'Back',
    description: 'Label indicating that users can navigate to the previous ' +
        'page, in the amp-story hint UI.',
  },
  [LocalizedStringId.AMP_STORY_SHARING_CLIPBOARD_FAILURE_TEXT]: {
    string: 'Could not copy link to clipboard :(',
    description: 'String shown in a failure message to inform the user that ' +
        'a link could not be successfully copied to their clipboard.',
  },
  [LocalizedStringId.AMP_STORY_SHARING_CLIPBOARD_SUCCESS_TEXT]: {
    string: 'Link copied!',
    description: 'String shown in a confirmation message to inform the user ' +
        'that a link was successfully copied to their clipboard.',
  },
  [LocalizedStringId.AMP_STORY_SHARING_PROVIDER_NAME_EMAIL]: {
    string: 'Email',
    description: 'Button label for the share target that shares a link via ' +
        'email.',
  },
  [LocalizedStringId.AMP_STORY_SHARING_PROVIDER_NAME_FACEBOOK]: {
    string: 'Facebook',
    description: 'Button label for the share target that shares a link via ' +
        'Facebook.',
  },
  [LocalizedStringId.AMP_STORY_SHARING_PROVIDER_NAME_GOOGLE_PLUS]: {
    string: 'Google+',
    description: 'Button label for the share target that shares a link via ' +
        'Google+.',
  },
  [LocalizedStringId.AMP_STORY_SHARING_PROVIDER_NAME_LINK]: {
    string: 'Get Link',
    description: 'Button label for the share target that shares a link via ' +
        'by copying it to the user\'s clipboard.',
  },
  [LocalizedStringId.AMP_STORY_SHARING_PROVIDER_NAME_LINKEDIN]: {
    string: 'LinkedIn',
    description: 'Button label for the share target that shares a link via ' +
        'LinkedIn.',
  },
  [LocalizedStringId.AMP_STORY_SHARING_PROVIDER_NAME_PINTEREST]: {
    string: 'Pinterest',
    description: 'Button label for the share target that shares a link via ' +
        'Pinterest.',
  },
  [LocalizedStringId.AMP_STORY_SHARING_PROVIDER_NAME_SMS]: {
    string: 'SMS',
    description: 'Button label for the share target that shares a link via ' +
        'SMS.',
  },
  [LocalizedStringId.AMP_STORY_SHARING_PROVIDER_NAME_SYSTEM]: {
    string: 'More',
    description: 'Button label for the share target that shares a link via ' +
        'deferral to the operating system\'s native sharing handler.',
  },
  [LocalizedStringId.AMP_STORY_SHARING_PROVIDER_NAME_TUMBLR]: {
    string: 'Tumblr',
    description: 'Button label for the share target that shares a link via ' +
        'Tumblr.',
  },
  [LocalizedStringId.AMP_STORY_SHARING_PROVIDER_NAME_TWITTER]: {
    string: 'Twitter',
    description: 'Button label for the share target that shares a link via ' +
        'Twitter.',
  },
  [LocalizedStringId.AMP_STORY_SHARING_PROVIDER_NAME_WHATSAPP]: {
    string: 'Whatsapp',
    description: 'Button label for the share target that shares a link via ' +
        'Whatsapp.',
  },
  [LocalizedStringId.AMP_STORY_SYSTEM_LAYER_SHARE_WIDGET_LABEL]: {
    string: 'Share',
    description: 'Label for the expandable share widget shown in the ' +
        'desktop UI.',
  },
  [LocalizedStringId.AMP_STORY_WARNING_DESKTOP_SIZE_TEXT]: {
    string: 'Expand your window to view this experience',
    description: 'Text for a warning screen that informs the user that ' +
        'stories are only supported in larger browser windows.',
  },
  [LocalizedStringId.AMP_STORY_WARNING_EXPERIMENT_DISABLED_TEXT]: {
    string: 'You must enable the amp-story experiment to view this content.',
    description: 'Text for a warning screen that informs the user that ' +
        'they must enable an experiment to use stories.',
  },
  [LocalizedStringId.AMP_STORY_WARNING_LANDSCAPE_ORIENTATION_TEXT]: {
    string: 'The page is best viewed in portrait mode',
    description: 'Text for a warning screen that informs the user that ' +
        'stories are only supported in portrait orientation.',
  },
  [LocalizedStringId.AMP_STORY_WARNING_UNSUPPORTED_BROWSER_TEXT]: {
    string: 'We\'re sorry, it looks like your browser doesn\'t support ' +
        'this experience',
    description: 'Text for a warning screen that informs the user that ' +
        'their browser does not support stories.',
  },
};
