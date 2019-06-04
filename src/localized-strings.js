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
import {parseJson} from './json';

/**
 * A unique identifier for each localized string.  Localized string IDs should:
 *
 *   - Maintain alphabetical order, by component
 *   - Be prefixed with the name of the extension that uses the string
 *     (e.g. "AMP_STORY_"), or with "AMP_" if they are general
 *   - NOT be reused; to deprecate an ID, comment it out and prefix its key with
 *     the string "DEPRECATED_"
 *
 * Next ID: 64
 *
 * @const @enum {string}
 */
export const LocalizedStringId = {
  // amp-story
  AMP_STORY_AUDIO_MUTE_BUTTON_TEXT: '31',
  AMP_STORY_AUDIO_UNMUTE_SOUND_TEXT: '32',
  AMP_STORY_AUDIO_UNMUTE_NO_SOUND_TEXT: '33',
  AMP_STORY_BOOKEND_MORE_TO_READ_LABEL: '30',
  AMP_STORY_BOOKEND_PRIVACY_SETTINGS_TITLE: '29',
  AMP_STORY_BOOKEND_PRIVACY_SETTINGS_BUTTON_LABEL: '28',
  AMP_STORY_CONSENT_ACCEPT_BUTTON_LABEL: '22',
  AMP_STORY_CONSENT_DECLINE_BUTTON_LABEL: '23',
  AMP_STORY_CONTINUE_ANYWAY_BUTTON_LABEL: '27',
  AMP_STORY_DOMAIN_DIALOG_HEADING_LABEL: '25',
  AMP_STORY_DOMAIN_DIALOG_HEADING_LINK: '26',
  AMP_STORY_HINT_UI_NEXT_LABEL: '2',
  AMP_STORY_HINT_UI_PREVIOUS_LABEL: '3',
  AMP_STORY_PAGE_ATTACHMENT_OPEN_LABEL: '35',
  AMP_STORY_PAGE_PLAY_VIDEO: '34',
  AMP_STORY_SHARING_CLIPBOARD_FAILURE_TEXT: '4',
  AMP_STORY_SHARING_CLIPBOARD_SUCCESS_TEXT: '5',
  AMP_STORY_SHARING_PAGE_LABEL: '62',
  AMP_STORY_SHARING_PROVIDER_NAME_EMAIL: '6',
  AMP_STORY_SHARING_PROVIDER_NAME_FACEBOOK: '7',
  AMP_STORY_SHARING_PROVIDER_NAME_GOOGLE_PLUS: '8',
  AMP_STORY_SHARING_PROVIDER_NAME_LINE: '63',
  AMP_STORY_SHARING_PROVIDER_NAME_LINK: '9',
  AMP_STORY_SHARING_PROVIDER_NAME_LINKEDIN: '10',
  AMP_STORY_SHARING_PROVIDER_NAME_PINTEREST: '11',
  AMP_STORY_SHARING_PROVIDER_NAME_SMS: '12',
  AMP_STORY_SHARING_PROVIDER_NAME_SYSTEM: '13',
  AMP_STORY_SHARING_PROVIDER_NAME_TUMBLR: '14',
  AMP_STORY_SHARING_PROVIDER_NAME_TWITTER: '15',
  AMP_STORY_SHARING_PROVIDER_NAME_WHATSAPP: '16',
  AMP_STORY_TOOLTIP_EXPAND_TWEET: '36',
  AMP_STORY_WARNING_DESKTOP_HEIGHT_SIZE_TEXT: '37',
  AMP_STORY_WARNING_DESKTOP_SIZE_TEXT: '18',
  AMP_STORY_WARNING_DESKTOP_WIDTH_SIZE_TEXT: '38',
  AMP_STORY_WARNING_EXPERIMENT_DISABLED_TEXT: '19',
  AMP_STORY_WARNING_LANDSCAPE_ORIENTATION_TEXT: '20',
  AMP_STORY_WARNING_UNSUPPORTED_BROWSER_TEXT: '21',

  // amp-story-auto-ads
  AMP_STORY_AUTO_ADS_BUTTON_LABEL_APPLY_NOW: '39',
  AMP_STORY_AUTO_ADS_BUTTON_LABEL_BOOK_NOW: '40',
  AMP_STORY_AUTO_ADS_BUTTON_LABEL_BUY_TICKETS: '41',
  AMP_STORY_AUTO_ADS_BUTTON_LABEL_DOWNLOAD: '42',
  AMP_STORY_AUTO_ADS_BUTTON_LABEL_EXPLORE: '43',
  AMP_STORY_AUTO_ADS_BUTTON_LABEL_GET_NOW: '44',
  AMP_STORY_AUTO_ADS_BUTTON_LABEL_INSTALL: '45',
  AMP_STORY_AUTO_ADS_BUTTON_LABEL_LEARN_MORE: '46',
  AMP_STORY_AUTO_ADS_BUTTON_LABEL_LISTEN: '47',
  AMP_STORY_AUTO_ADS_BUTTON_LABEL_MORE: '48',
  AMP_STORY_AUTO_ADS_BUTTON_LABEL_OPEN_APP: '49',
  AMP_STORY_AUTO_ADS_BUTTON_LABEL_ORDER_NOW: '50',
  AMP_STORY_AUTO_ADS_BUTTON_LABEL_PLAY: '51',
  AMP_STORY_AUTO_ADS_BUTTON_LABEL_READ: '52',
  AMP_STORY_AUTO_ADS_BUTTON_LABEL_SHOP: '53',
  AMP_STORY_AUTO_ADS_BUTTON_LABEL_SHOW: '54',
  AMP_STORY_AUTO_ADS_BUTTON_LABEL_SHOWTIMES: '55',
  AMP_STORY_AUTO_ADS_BUTTON_LABEL_SIGN_UP: '56',
  AMP_STORY_AUTO_ADS_BUTTON_LABEL_SUBSCRIBE: '57',
  AMP_STORY_AUTO_ADS_BUTTON_LABEL_USE_APP: '58',
  AMP_STORY_AUTO_ADS_BUTTON_LABEL_VIEW: '59',
  AMP_STORY_AUTO_ADS_BUTTON_LABEL_WATCH: '60',
  AMP_STORY_AUTO_ADS_BUTTON_LABEL_WATCH_EPISODE: '61',

  // TODO(#14357): Comment these out once amp-story:0.1 no longer depends on
  // them.
  DEPRECATED_AMP_STORY_EXPERIMENT_ENABLE_BUTTON_LABEL: '0',
  DEPRECATED_AMP_STORY_EXPERIMENT_ENABLED_TEXT: '1',
  DEPRECATED_AMP_STORY_CONSENT_DISMISS_DIALOG_BUTTON_LABEL: '24',
  DEPRECATED_AMP_STORY_SYSTEM_LAYER_SHARE_WIDGET_LABEL: '17',
};

/**
 * @typedef {{
 *   string: string,
 *   description: string,
 * }}
 */
export let LocalizedStringDef;

/**
 * @typedef {!Object<!LocalizedStringId, !LocalizedStringDef>}
 */
export let LocalizedStringBundleDef;

/**
 * Creates a deep copy of the specified LocalizedStringBundle.
 * @param {!LocalizedStringBundleDef} localizedStringBundle
 * @return {!LocalizedStringBundleDef}
 */
function cloneLocalizedStringBundle(localizedStringBundle) {
  return /** @type {!LocalizedStringBundleDef} */ (parseJson(
    JSON.stringify(/** @type {!JsonObject} */ (localizedStringBundle))
  ));
}

/**
 * Creates a pseudo locale by applying string transformations (specified by the
 * localizationFn) to an existing string bundle, without modifying the original.
 * @param {!LocalizedStringBundleDef} localizedStringBundle The localized
 *     string bundle to be transformed.
 * @param {function(string): string} localizationFn The transformation to be
 *     applied to each string in the bundle.
 * @return {!LocalizedStringBundleDef} The new strings.
 */
export function createPseudoLocale(localizedStringBundle, localizationFn) {
  /** @type {!LocalizedStringBundleDef} */
  const pseudoLocaleStringBundle = cloneLocalizedStringBundle(
    localizedStringBundle
  );

  Object.keys(pseudoLocaleStringBundle).forEach(localizedStringIdAsStr => {
    const localizedStringId = /** @type {!LocalizedStringId} */ (localizedStringIdAsStr);
    pseudoLocaleStringBundle[localizedStringId].string = localizationFn(
      localizedStringBundle[localizedStringId].string
    );
    pseudoLocaleStringBundle[localizedStringId].fallback = localizationFn(
      localizedStringBundle[localizedStringId].fallback
    );
  });

  return pseudoLocaleStringBundle;
}
