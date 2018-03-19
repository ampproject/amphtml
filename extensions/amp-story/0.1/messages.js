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
import {closest} from '../../../src/dom';


/**
 * A unique identifier for each message.  Message IDs should:
 *
 *   - Maintain alphabetical order
 *   - Be prefixed with the name of the extension that uses the message
 *     (e.g. "AMP_STORY_"), or with "AMP_" if they are general
 *   - NOT be reused; to deprecate an ID, comment it out and prefix its key with
 *     the string "DEPRECATED_"
 *
 * Next ID: 21
 *
 * @const @enum {number}
 */
export const MessageId = {
  // amp-story
  AMP_STORY_EXPERIMENT_ENABLE_BUTTON_LABEL: 0,
  AMP_STORY_EXPERIMENT_ENABLED_TEXT: 1,
  AMP_STORY_HINT_UI_NEXT_LABEL: 2,
  AMP_STORY_HINT_UI_PREVIOUS_LABEL: 3,
  AMP_STORY_SHARING_CLIPBOARD_FAILURE_TEXT: 4,
  AMP_STORY_SHARING_CLIPBOARD_SUCCESS_TEXT: 5,
  AMP_STORY_SHARING_PROVIDER_NAME_EMAIL: 6,
  AMP_STORY_SHARING_PROVIDER_NAME_FACEBOOK: 7,
  AMP_STORY_SHARING_PROVIDER_NAME_GOOGLE_PLUS: 8,
  AMP_STORY_SHARING_PROVIDER_NAME_LINK: 9,
  AMP_STORY_SHARING_PROVIDER_NAME_LINKEDIN: 10,
  AMP_STORY_SHARING_PROVIDER_NAME_PINTEREST: 11,
  AMP_STORY_SHARING_PROVIDER_NAME_SMS: 12,
  AMP_STORY_SHARING_PROVIDER_NAME_SYSTEM: 13,
  AMP_STORY_SHARING_PROVIDER_NAME_TUMBLR: 14,
  AMP_STORY_SHARING_PROVIDER_NAME_TWITTER: 15,
  AMP_STORY_SHARING_PROVIDER_NAME_WHATSAPP: 16,
  AMP_STORY_SYSTEM_LAYER_SHARE_WIDGET_LABEL: 17,
  AMP_STORY_WARNING_DESKTOP_SIZE_TEXT: 18,
  AMP_STORY_WARNING_EXPERIMENT_DISABLED_TEXT: 19,
  AMP_STORY_WARNING_LANDSCAPE_ORIENTATION_TEXT: 20,
  AMP_STORY_WARNING_UNSUPPORTED_BROWSER_TEXT: 21,
};


/**
 * @typedef {{
 *   message: string,
 *   description: string,
 * }}
 */
let MessageDef;


/**
 * @typedef {!Object<!MessageId, !MessageDef>}
 */
export let MessageBundleDef;


/**
 * Language code used if there is no language code specified by the document.
 * @const {string}
 */
const DEFAULT_LANGUAGE_CODE = 'default';


/**
 * @const {!RegExp}
 */
const LANGUAGE_CODE_CHUNK_REGEX = /\w+/gi;


/**
 * @param {string} languageCode
 * @return {!Array<string>} A list of language codes.
 */
export function getLanguageCodesFromString(languageCode) {
  const matches = languageCode.match(LANGUAGE_CODE_CHUNK_REGEX) || [];
  return matches.reduce((fallbackLanguageCodeList, chunk, index) => {
    const fallbackLanguageCode = matches.slice(0, index + 1)
        .join('-')
        .toLowerCase();
    fallbackLanguageCodeList.unshift(fallbackLanguageCode);
    return fallbackLanguageCodeList;
  }, [DEFAULT_LANGUAGE_CODE]);
}


/**
 * Gets the message matching the specified message ID in the language specified.
 * @param {!Object<string, MessageBundleDef>} messageBundles
 * @param {!Array<string>} languageCodes
 * @param {!MessageId} messageId
 */
function findMessage(messageBundles, languageCodes, messageId) {
  let message = null;

  languageCodes.some(languageCode => {
    const messageBundle = messageBundles[languageCode];
    if (messageBundle && messageBundle[messageId] &&
        messageBundle[messageId].message) {
      message = messageBundle[messageId].message;
      return true;
    }

    return false;
  });

  return message;
}


export class MessageService {
  /**
   * @param {!Window} win
   */
  constructor(win) {
    const rootEl = win.document.documentElement;

    /**
     * @private @const {!Array<string>}
     */
    this.rootLanguageCodes_ = this.getLanguageCodesForElement_(rootEl);

    /**
     * A mapping of language code to message bundle.
     * @private @const {!Object<string, !MessageBundleDef>}
     */
    this.messageBundles_ = {};
  }


  /**
   * @param {!Element} element
   * @return {!Array<string>}
   * @private
   */
  getLanguageCodesForElement_(element) {
    const languageEl = closest(element, el => el.hasAttribute('lang'));
    const languageCode = languageEl ? languageEl.getAttribute('lang') : null;
    return getLanguageCodesFromString(languageCode || '');
  }


  /**
   * @param {string} languageCode The language code to associate with the
   *     specified message bundle.
   * @param {!MessageBundleDef} messageBundle The message bundle to register.
   */
  registerMessageBundle(languageCode, messageBundle) {
    if (!this.messageBundles_[languageCode]) {
      this.messageBundles_[languageCode] = {};
    }

    Object.assign(this.messageBundles_[languageCode], messageBundle);
  }


  /**
   * @param {!MessageId} messageId
   * @param {!Element=} opt_elementToUse The element where the message will be
   *     used.  The language is based on the language at that part of the
   *     document.  If unspecified, will use the document-level language, if
   *     one exists, or the default otherwise.
   */
  getMessage(messageId, elementToUse = undefined) {
    const languageCodes = elementToUse ?
      this.getLanguageCodesForElement_(elementToUse) :
      this.rootLanguageCodes_;

    return findMessage(this.messageBundles_, languageCodes, messageId);
  }
}
