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
 * A unique identifier for each message.  Maintain alphabetical order.
 *
 * @const @enum {string}
 */
export const MessageId = {
  AMP_STORY_EXPERIMENT_ENABLE_BUTTON_LABEL: 'msg_experiment_enable_button_label',
  AMP_STORY_EXPERIMENT_ENABLED_TEXT: 'msg_experiment_enabled_text',
  AMP_STORY_HINT_UI_NEXT_LABEL: 'msg_hint_ui_next_label',
  AMP_STORY_HINT_UI_PREVIOUS_LABEL: 'msg_hint_ui_previous_label',
  AMP_STORY_SHARING_CLIPBOARD_FAILURE_TEXT: 'msg_sharing_clipboard_failure_text',
  AMP_STORY_SHARING_CLIPBOARD_SUCCESS_TEXT: 'msg_sharing_clipboard_success_text',
  AMP_STORY_SHARING_PROVIDER_NAME_EMAIL: 'msg_sharing_provider_name_email',
  AMP_STORY_SHARING_PROVIDER_NAME_FACEBOOK: 'msg_sharing_provider_name_facebook',
  AMP_STORY_SHARING_PROVIDER_NAME_GOOGLE_PLUS: 'msg_sharing_provider_name_google_plus',
  AMP_STORY_SHARING_PROVIDER_NAME_LINK: 'msg_sharing_provider_name_link',
  AMP_STORY_SHARING_PROVIDER_NAME_LINKEDIN: 'msg_sharing_provider_name_linkedin',
  AMP_STORY_SHARING_PROVIDER_NAME_NATIVE: 'msg_sharing_provider_name_native',
  AMP_STORY_SHARING_PROVIDER_NAME_PINTEREST: 'msg_sharing_provider_name_pinterest',
  AMP_STORY_SHARING_PROVIDER_NAME_SMS: 'msg_sharing_provider_name_sms',
  AMP_STORY_SHARING_PROVIDER_NAME_TUMBLR: 'msg_sharing_provider_name_tumblr',
  AMP_STORY_SHARING_PROVIDER_NAME_TWITTER: 'msg_sharing_provider_name_twitter',
  AMP_STORY_SHARING_PROVIDER_NAME_WHATSAPP: 'msg_sharing_provider_name_whatsapp',
  AMP_STORY_SYSTEM_LAYER_SHARE_WIDGET_LABEL: 'msg_system_layer_share_widget_label',
  AMP_STORY_WARNING_EXPERIMENT_DISABLED_TEXT: 'msg_warning_experiment_disabled_text',
  AMP_STORY_WARNING_LANDSCAPE_ORIENTATION_TEXT: 'msg_warning_landscape_orientation_text',
  AMP_STORY_WARNING_UNSUPPORTED_BROWSER_TEXT: 'msg_warning_unsupported_browser_text',
};
