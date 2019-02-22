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
 * Localized string bundle used for Russian strings.
 * @const {!LocalizedStringBundleDef}
 */
export default /** @const {!LocalizedStringBundleDef} */ ({
  [LocalizedStringId.AMP_STORY_CONSENT_ACCEPT_BUTTON_LABEL]: {
    string: 'Принять',
  },
  [LocalizedStringId.AMP_STORY_CONSENT_DECLINE_BUTTON_LABEL]: {
    string: 'Отказаться',
  },
  [LocalizedStringId.AMP_STORY_DOMAIN_DIALOG_HEADING_LABEL]: {
    string: 'См. источник:',
  },
  [LocalizedStringId.AMP_STORY_DOMAIN_DIALOG_HEADING_LINK]: {
    string: 'Подробнее о результатах AMP',
  },
  [LocalizedStringId.AMP_STORY_HINT_UI_NEXT_LABEL]: {
    string: 'Вперёд',
  },
  [LocalizedStringId.AMP_STORY_HINT_UI_PREVIOUS_LABEL]: {
    string: 'Назад',
  },
  [LocalizedStringId.AMP_STORY_SHARING_CLIPBOARD_FAILURE_TEXT]: {
    string: 'Не удалось скопировать ссылку в буфер обмена :(',
  },
  [LocalizedStringId.AMP_STORY_SHARING_CLIPBOARD_SUCCESS_TEXT]: {
    string: 'Ссылка скопирована!',
  },
  [LocalizedStringId.AMP_STORY_SHARING_PROVIDER_NAME_EMAIL]: {
    string: 'Эл. почта',
  },
  [LocalizedStringId.AMP_STORY_SHARING_PROVIDER_NAME_FACEBOOK]: {
    string: 'Facebook',
  },
  [LocalizedStringId.AMP_STORY_SHARING_PROVIDER_NAME_GOOGLE_PLUS]: {
    string: 'Google+',
  },
  [LocalizedStringId.AMP_STORY_SHARING_PROVIDER_NAME_LINK]: {
    string: 'Копировать ссылку',
  },
  [LocalizedStringId.AMP_STORY_SHARING_PROVIDER_NAME_LINKEDIN]: {
    string: 'LinkedIn',
  },
  [LocalizedStringId.AMP_STORY_SHARING_PROVIDER_NAME_PINTEREST]: {
    string: 'Pinterest',
  },
  [LocalizedStringId.AMP_STORY_SHARING_PROVIDER_NAME_SMS]: {
    string: 'СМС',
  },
  [LocalizedStringId.AMP_STORY_SHARING_PROVIDER_NAME_SYSTEM]: {
    string: 'Ещё',
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
  [LocalizedStringId.AMP_STORY_WARNING_DESKTOP_SIZE_TEXT]: {
    fallback: 'Полный просмотр возможен только при развернутом окне браузера',
  },
  [LocalizedStringId.AMP_STORY_WARNING_EXPERIMENT_DISABLED_TEXT]: {
    string: 'Для дальнейшего просмотра вы должны загрузить amp-story ' +
        'эксперимент',
  },
  [LocalizedStringId.AMP_STORY_WARNING_LANDSCAPE_ORIENTATION_TEXT]: {
    string: 'Для оптимального просмотра выберите портретный режим',
  },
  [LocalizedStringId.AMP_STORY_WARNING_UNSUPPORTED_BROWSER_TEXT]: {
    string: 'Извините, похоже, ваш браузер не поддерживает эту функцию',
  },
});
