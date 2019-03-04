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
} from '../../../../src/service/localization';


/**
 * Localized string bundle used for English strings.
 * @const {!LocalizedStringBundleDef}
 */
export default /** @const {!LocalizedStringBundleDef} */ ({
  [LocalizedStringId.AMP_STORY_AUDIO_MUTE_BUTTON_TEXT]: {
    string: 'Sound off',
    description: 'Text that informs users that the sound is off after they ' +
          'click the mute button',
  },
  [LocalizedStringId.AMP_STORY_AUDIO_UNMUTE_SOUND_TEXT]: {
    string: 'Sound on',
    description: 'Text that informs users that the sound is on after they ' +
          'click the unmute button on a page with sound',
  },
  [LocalizedStringId.AMP_STORY_AUDIO_UNMUTE_NO_SOUND_TEXT]: {
    string: 'This page has no sound',
    description: 'Text that informs users that the sound is on after they ' +
          'click the unmute button on a page without sound',
  },
  [LocalizedStringId.AMP_STORY_BOOKEND_MORE_TO_READ_LABEL]: {
    string: 'More to read',
    description: 'Label to be placed as a title on top of related articles ' +
        'at the end of a story.',
  },
  [LocalizedStringId.AMP_STORY_BOOKEND_PRIVACY_SETTINGS_TITLE]: {
    string: 'Privacy settings',
    description: 'Title for a section that allows the user to configure ' +
        'their privacy settings',
  },
  [LocalizedStringId.AMP_STORY_BOOKEND_PRIVACY_SETTINGS_BUTTON_LABEL]: {
    string: 'Change data privacy settings',
    description: 'Label for a button that allows the user to change their ' +
        'choice to consent to providing their cookie access.',
  },
  [LocalizedStringId.AMP_STORY_CONSENT_ACCEPT_BUTTON_LABEL]: {
    string: 'Accept',
    description: 'Label for a button that allows the user to consent to ' +
        'providing their cookie access.',
  },
  [LocalizedStringId.AMP_STORY_CONSENT_DECLINE_BUTTON_LABEL]: {
    string: 'Decline',
    description: 'Label for a button that allows the user to disconsent to ' +
        'providing their cookie access.',
  },
  [LocalizedStringId.AMP_STORY_CONTINUE_ANYWAY_BUTTON_LABEL]: {
    string: 'Continue Anyway',
    description: 'Button label to allow the user to continue even if they ' +
        'are not using a supportive browser.',
  },
  [LocalizedStringId.AMP_STORY_DOMAIN_DIALOG_HEADING_LABEL]: {
    string: 'View on original domain:',
    description: 'Label for a heading of a dialog that shows the user the ' +
        'domain from which the story is served.',
  },
  [LocalizedStringId.AMP_STORY_DOMAIN_DIALOG_HEADING_LINK]: {
    string: 'More about AMP results',
    description: 'Label for a link to documentation on how AMP links are ' +
        'handled.',
  },
  [LocalizedStringId.AMP_STORY_PAGE_ATTACHMENT_OPEN_LABEL]: {
    string: 'Swipe up',
    description: 'Label for a button to open a drawer containing additional ' +
        'content via a "swipe up" user gesture.',
  },
  [LocalizedStringId.AMP_STORY_PAGE_PLAY_VIDEO]: {
    string: 'Play video',
    description: 'Label for a button to play the video visible on the page.',
  },
  [LocalizedStringId.AMP_STORY_HINT_UI_NEXT_LABEL]: {
    string: 'Tap Next',
    description: 'Label indicating that users can navigate to the next ' +
        'page, in the amp-story hint UI.',
  },
  [LocalizedStringId.AMP_STORY_HINT_UI_PREVIOUS_LABEL]: {
    string: 'Tap Back',
    description: 'Label indicating that users can navigate to the previous ' +
        'page, in the amp-story hint UI.',
  },
  [LocalizedStringId.AMP_STORY_SHARING_PAGE_LABEL]: {
    string: 'Share starting from this page',
    description: 'Checkbox label when the branching experiment is turned on ' +
        ' and the story is in landscape mode; checking the checkbox lets the ' +
        'user share the story from the current page.',
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
    string: 'WhatsApp',
    description: 'Button label for the share target that shares a link via ' +
        'WhatsApp.',
  },
  [LocalizedStringId.AMP_STORY_TOOLTIP_EXPAND_TWEET]: {
    string: 'Expand Tweet',
    description: 'Label in the tooltip text for when a Twitter embed is ' +
        'expandable.',
  },
  [LocalizedStringId.AMP_STORY_WARNING_DESKTOP_HEIGHT_SIZE_TEXT]: {
    string: 'Expand the height of your window to view this experience',
    description: 'Text for a warning screen that informs the user that ' +
        'stories are only supported in taller browser windows.',
  },
  [LocalizedStringId.AMP_STORY_WARNING_DESKTOP_SIZE_TEXT]: {
    string: 'Expand both the height and width of your window to view this ' +
        'experience',
    description: 'Text for a warning screen that informs the user that ' +
        'stories are only supported in larger browser windows.',
  },
  [LocalizedStringId.AMP_STORY_WARNING_DESKTOP_WIDTH_SIZE_TEXT]: {
    string: 'Expand the width of your window to view this experience',
    description: 'Text for a warning screen that informs the user that ' +
        'stories are only supported in wider browser windows.',
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

  // TODO(#21253): Move these to amp-story-auto-ads code.
  [LocalizedStringId.AMP_STORY_AUTO_ADS_BUTTON_LABEL_APPLY_NOW]: {
    string: 'Apply Now',
    description: 'Button label for an ad call to action button that asks ' +
        'users to apply for something.',
  },
  [LocalizedStringId.AMP_STORY_AUTO_ADS_BUTTON_LABEL_BOOK_NOW]: {
    string: 'Book',
    description: 'Button label for an ad call to action button that asks ' +
        'users to book transaction.',
  },
  [LocalizedStringId.AMP_STORY_AUTO_ADS_BUTTON_LABEL_BUY_TICKETS]: {
    string: 'Buy Tickets',
    description: 'Button label for an ad call to action button that asks ' +
        'users to purchase tickets.',
  },
  [LocalizedStringId.AMP_STORY_AUTO_ADS_BUTTON_LABEL_DOWNLOAD]: {
    string: 'Download',
    description: 'Button label for an ad call to action button that asks ' +
        'users to download content.',
  },
  [LocalizedStringId.AMP_STORY_AUTO_ADS_BUTTON_LABEL_EXPLORE]: {
    string: 'Explore',
    description: 'Button label for an ad call to action button that asks ' +
        'users to explore content.',
  },
  [LocalizedStringId.AMP_STORY_AUTO_ADS_BUTTON_LABEL_GET_NOW]: {
    string: 'Get Now',
    description: 'Button label for an ad call to action button that asks ' +
        'users to obtain content.',
  },
  [LocalizedStringId.AMP_STORY_AUTO_ADS_BUTTON_LABEL_INSTALL]: {
    string: 'Install Now',
    description: 'Button label for an ad call to action button that asks ' +
        'users to install content.',
  },
  [LocalizedStringId.AMP_STORY_AUTO_ADS_BUTTON_LABEL_LEARN_MORE]: {
    string: 'Learn More',
    description: 'Button label for an ad call to action button that asks ' +
        'users to learn more about some content.',
  },
  [LocalizedStringId.AMP_STORY_AUTO_ADS_BUTTON_LABEL_LISTEN]: {
    string: 'Listen',
    description: 'Button label for an ad call to action button that asks ' +
        'users to listen to content.',
  },
  [LocalizedStringId.AMP_STORY_AUTO_ADS_BUTTON_LABEL_MORE]: {
    string: 'More',
    description: 'Button label for an ad call to action button that asks ' +
        'users to see more content.',
  },
  [LocalizedStringId.AMP_STORY_AUTO_ADS_BUTTON_LABEL_OPEN_APP]: {
    string: 'Open App',
    description: 'Button label for an ad call to action button that asks ' +
        'users to open an application.',
  },
  [LocalizedStringId.AMP_STORY_AUTO_ADS_BUTTON_LABEL_ORDER_NOW]: {
    string: 'Order Now',
    description: 'Button label for an ad call to action button that asks ' +
        'users to place an order.',
  },
  [LocalizedStringId.AMP_STORY_AUTO_ADS_BUTTON_LABEL_PLAY]: {
    string: 'Play',
    description: 'Button label for an ad call to action button that asks ' +
        'users to play content.',
  },
  [LocalizedStringId.AMP_STORY_AUTO_ADS_BUTTON_LABEL_READ]: {
    string: 'Read',
    description: 'Button label for an ad call to action button that asks ' +
        'users to read content.',
  },
  [LocalizedStringId.AMP_STORY_AUTO_ADS_BUTTON_LABEL_SHOP]: {
    string: 'Shop',
    description: 'Button label for an ad call to action button that asks ' +
        'users to shop for something.',
  },
  [LocalizedStringId.AMP_STORY_AUTO_ADS_BUTTON_LABEL_SHOW]: {
    string: 'Show',
    description: 'Button label for an ad call to action button that asks ' +
        'users to show content.',
  },
  [LocalizedStringId.AMP_STORY_AUTO_ADS_BUTTON_LABEL_SHOWTIMES]: {
    string: 'Showtimes',
    description: 'Button label for an ad call to action button that asks ' +
        'users to see showtimes.',
  },
  [LocalizedStringId.AMP_STORY_AUTO_ADS_BUTTON_LABEL_SIGN_UP]: {
    string: 'Sign Up',
    description: 'Button label for an ad call to action button that asks ' +
        'users to sign up for something.',
  },
  [LocalizedStringId.AMP_STORY_AUTO_ADS_BUTTON_LABEL_SUBSCRIBE]: {
    string: 'Subscribe Now',
    description: 'Button label for an ad call to action button that asks ' +
        'users to subscribe to something.',
  },
  [LocalizedStringId.AMP_STORY_AUTO_ADS_BUTTON_LABEL_USE_APP]: {
    string: 'Use App',
    description: 'Button label for an ad call to action button that asks ' +
        'users to use an application.',
  },
  [LocalizedStringId.AMP_STORY_AUTO_ADS_BUTTON_LABEL_VIEW]: {
    string: 'View',
    description: 'Button label for an ad call to action button that asks ' +
        'users to view content.',
  },
  [LocalizedStringId.AMP_STORY_AUTO_ADS_BUTTON_LABEL_WATCH]: {
    string: 'Watch',
    description: 'Button label for an ad call to action button that asks ' +
        'users to watch content.',
  },
  [LocalizedStringId.AMP_STORY_AUTO_ADS_BUTTON_LABEL_WATCH_EPISODE]: {
    string: 'Watch Episode',
    description: 'Button label for an ad call to action button that asks ' +
        'users to watch an episode of something.',
  },
});
