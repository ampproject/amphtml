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
  LocalizedStringBundleDef,
  LocalizedStringId,
} from '../../../../src/service/localization';

/**
 * Localized string bundle used for mr strings.
 * @const {!LocalizedStringBundleDef}
 */
const strings = {
  [LocalizedStringId.AMP_STORY_AUDIO_MUTE_BUTTON_TEXT]: {
    string: 'आवाज बंद',
  },
  [LocalizedStringId.AMP_STORY_AUDIO_UNMUTE_NO_SOUND_TEXT]: {
    string: 'या पेजमध्ये आवाज नाही',
  },
  [LocalizedStringId.AMP_STORY_AUDIO_UNMUTE_SOUND_TEXT]: {
    string: 'आवाज सुरू',
  },
  [LocalizedStringId.AMP_STORY_BOOKEND_MORE_TO_READ_LABEL]: {
    string: 'वाचण्यासाठी आणखी',
  },
  [LocalizedStringId.AMP_STORY_BOOKEND_PRIVACY_SETTINGS_BUTTON_LABEL]: {
    string: 'डेटा गोपनीयता सेटिंग्ज बदला',
  },
  [LocalizedStringId.AMP_STORY_BOOKEND_PRIVACY_SETTINGS_TITLE]: {
    string: 'गोपनीयता सेटिंग्ज',
  },
  [LocalizedStringId.AMP_STORY_CONSENT_ACCEPT_BUTTON_LABEL]: {
    string: 'स्वीकारा',
  },
  [LocalizedStringId.AMP_STORY_CONSENT_DECLINE_BUTTON_LABEL]: {
    string: 'नकार द्या',
  },
  [LocalizedStringId.AMP_STORY_CONTINUE_ANYWAY_BUTTON_LABEL]: {
    string: 'तरीही सुरू ठेवा',
  },
  [LocalizedStringId.AMP_STORY_DOMAIN_DIALOG_HEADING_LABEL]: {
    string: 'मूळ डोमेनवर पाहा:',
  },
  [LocalizedStringId.AMP_STORY_DOMAIN_DIALOG_HEADING_LINK]: {
    string: 'AMP परिणामांविषयी आणखी',
  },
  [LocalizedStringId.AMP_STORY_HINT_UI_NEXT_LABEL]: {
    string: 'पुढीलवर टॅप करा',
  },
  [LocalizedStringId.AMP_STORY_HINT_UI_PREVIOUS_LABEL]: {
    string: 'मागेवर टॅप करा',
  },
  [LocalizedStringId.AMP_STORY_PAGE_ATTACHMENT_OPEN_LABEL]: {
    string: 'वर स्वाइप करा',
  },
  [LocalizedStringId.AMP_STORY_PAGE_PLAY_VIDEO]: {
    string: 'व्हिडिओ प्ले करा',
  },
  [LocalizedStringId.AMP_STORY_SHARING_CLIPBOARD_FAILURE_TEXT]: {
    string: 'लिंक क्लिपबोर्डवर कॉपी करता आली नाही :(',
  },
  [LocalizedStringId.AMP_STORY_SHARING_CLIPBOARD_SUCCESS_TEXT]: {
    string: 'लिंक कॉपी केली!',
  },
  [LocalizedStringId.AMP_STORY_SHARING_PROVIDER_NAME_EMAIL]: {
    string: 'ईमेल',
  },
  [LocalizedStringId.AMP_STORY_SHARING_PROVIDER_NAME_FACEBOOK]: {
    string: 'Facebook',
  },
  [LocalizedStringId.AMP_STORY_SHARING_PROVIDER_NAME_GOOGLE_PLUS]: {
    string: 'Google+',
  },
  [LocalizedStringId.AMP_STORY_SHARING_PROVIDER_NAME_LINK]: {
    string: 'लिंक मिळवा',
  },
  [LocalizedStringId.AMP_STORY_SHARING_PROVIDER_NAME_LINKEDIN]: {
    string: 'LinkedIn',
  },
  [LocalizedStringId.AMP_STORY_SHARING_PROVIDER_NAME_PINTEREST]: {
    string: 'Pinterest',
  },
  [LocalizedStringId.AMP_STORY_SHARING_PROVIDER_NAME_SMS]: {
    string: 'एसएमएस',
  },
  [LocalizedStringId.AMP_STORY_SHARING_PROVIDER_NAME_TUMBLR]: {
    string: 'Tumblr',
  },
  [LocalizedStringId.AMP_STORY_SHARING_PROVIDER_NAME_TWITTER]: {
    string: 'Twitter',
  },
  [LocalizedStringId.AMP_STORY_SHARING_PROVIDER_NAME_WHATSAPP]: {
    string: 'WhatsApp',
  },
  [LocalizedStringId.AMP_STORY_TOOLTIP_EXPAND_TWEET]: {
    string: 'ट्वीट विस्तृत करा',
  },
  [LocalizedStringId.AMP_STORY_WARNING_DESKTOP_HEIGHT_SIZE_TEXT]: {
    string: 'हा प्रयोग पाहाण्यासाठी तुमच्या विंडोच्या उंचीचा विस्तार करा',
  },
  [LocalizedStringId.AMP_STORY_WARNING_DESKTOP_SIZE_TEXT]: {
    string:
      'हा प्रयोग पाहाण्यासाठी तुमच्या विंडोची उंची आणि रूंदी दोन्हींचा ' +
      'विस्तार करा',
  },
  [LocalizedStringId.AMP_STORY_WARNING_DESKTOP_WIDTH_SIZE_TEXT]: {
    string: 'हा प्रयोग पाहाण्यासाठी तुमच्या विंडोची रूंदीचा विस्तार करा',
  },
  [LocalizedStringId.AMP_STORY_WARNING_EXPERIMENT_DISABLED_TEXT]: {
    string:
      'तुम्ही हा आशय पाहाण्यासाठी AMP स्टोरी प्रयोग सुरू करणे आवश्यक आहे.',
  },
  [LocalizedStringId.AMP_STORY_WARNING_LANDSCAPE_ORIENTATION_TEXT]: {
    string: 'पेज पोर्ट्रेट मोडमध्ये उत्तम पाहिले जाते',
  },
  [LocalizedStringId.AMP_STORY_WARNING_UNSUPPORTED_BROWSER_TEXT]: {
    string:
      'आम्ही क्षमस्व आहोत, तुमचा ब्राउझर या प्रयोगाला सपोर्ट करत ' +
      'नसल्याचे दिसते',
  },
};

export default strings;
