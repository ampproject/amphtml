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
  [LocalizedStringId.AMP_STORY_HINT_UI_NEXT_LABEL]: {
    'message': 'Next',
    'description': 'Label indicating that users can navigate to the next ' +
        'page, in the amp-story hint UI.',
  },
  [LocalizedStringId.AMP_STORY_HINT_UI_PREVIOUS_LABEL]: {
    'message': 'Back',
    'description': 'Label indicating that users can navigate to the previous ' +
        'page, in the amp-story hint UI.',
  },
  [LocalizedStringId.AMP_STORY_SHARING_CLIPBOARD_FAILURE_TEXT]: {
    'message': 'Could not copy link to clipboard :(',
    'description': 'Message shown in a toast to inform the user that a link ' +
        'could not be successfully copied to their clipboard.',
  },
  [LocalizedStringId.AMP_STORY_SHARING_CLIPBOARD_SUCCESS_TEXT]: {
    'message': 'Link copied!',
    'description': 'Message shown in a toast to confirm that the user has ' +
        'successfully copied a link to their clipboard.',
  },
  [LocalizedStringId.AMP_STORY_SHARING_PROVIDER_NAME_EMAIL]: {
    'message': 'Email',
    'description': 'Button label for the share target that shares a link via ' +
        'email.',
  },
  [LocalizedStringId.AMP_STORY_SHARING_PROVIDER_NAME_FACEBOOK]: {
    'message': 'Facebook',
    'description': 'Button label for the share target that shares a link via ' +
        'Facebook.',
  },
  [LocalizedStringId.AMP_STORY_SHARING_PROVIDER_NAME_GOOGLE_PLUS]: {
    'message': 'Google+',
    'description': 'Button label for the share target that shares a link via ' +
        'Google+.',
  },
  [LocalizedStringId.AMP_STORY_SHARING_PROVIDER_NAME_LINK]: {
    'message': 'Get Link',
    'description': 'Button label for the share target that shares a link via ' +
        'by copying it to the user\'s clipboard.',
  },
  [LocalizedStringId.AMP_STORY_SHARING_PROVIDER_NAME_LINKEDIN]: {
    'message': 'LinkedIn',
    'description': 'Button label for the share target that shares a link via ' +
        'LinkedIn.',
  },
  [LocalizedStringId.AMP_STORY_SHARING_PROVIDER_NAME_PINTEREST]: {
    'message': 'Pinterest',
    'description': 'Button label for the share target that shares a link via ' +
        'Pinterest.',
  },
  [LocalizedStringId.AMP_STORY_SHARING_PROVIDER_NAME_SMS]: {
    'message': 'SMS',
    'description': 'Button label for the share target that shares a link via ' +
        'SMS.',
  },
  [LocalizedStringId.AMP_STORY_SHARING_PROVIDER_NAME_SYSTEM]: {
    'message': 'More',
    'description': 'Button label for the share target that shares a link via ' +
        'deferral to the operating system\'s native sharing handler.',
  },
  [LocalizedStringId.AMP_STORY_SHARING_PROVIDER_NAME_TUMBLR]: {
    'message': 'Tumblr',
    'description': 'Button label for the share target that shares a link via ' +
        'Tumblr.',
  },
  [LocalizedStringId.AMP_STORY_SHARING_PROVIDER_NAME_TWITTER]: {
    'message': 'Twitter',
    'description': 'Button label for the share target that shares a link via ' +
        'Twitter.',
  },
  [LocalizedStringId.AMP_STORY_SHARING_PROVIDER_NAME_WHATSAPP]: {
    'message': 'Whatsapp',
    'description': 'Button label for the share target that shares a link via ' +
        'Whatsapp.',
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
