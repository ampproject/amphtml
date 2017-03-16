/**
 * Copyright 2017 The AMP HTML Authors. All Rights Reserved.
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

import timeago from './lib/timeago/timeago';

/** @private @const {string} */
const DEFAULT_LOCALE_ = 'en';

export class AmpTimeAgo extends AMP.BaseElement {

  /** @override */
  buildCallback() {
    /** @private @const {string} */
    this.datetime_ = this.element.getAttribute('datetime');

    /** @private @const {string} */
    this.locale_ = this.element.getAttribute('locale') || DEFAULT_LOCALE_;
    this.loadLocale_(this.locale_);

    /** @private @const {string} */
    this.timeago_ = timeago().format(this.datetime_, this.locale_);

    /** @private @const {string} */
    this.title_ = this.element.textContent;

    this.element.title = this.title_;
    this.element.textContent = this.timeago_;
  }

  /** @override */
  isLayoutSupported() {
    return true;
  }

  /**
   * Loads the required locale from the timeago plugin.
   * Unfortunately it doesn't seem possible to do this as a loop.
   * http://stackoverflow.com/questions/37241662/using-require-with-a-variable-vs-using-a-string-in-webpack/37241982
   * @private
   */
  loadLocale_(locale) {
    if (locale === 'ar') timeago.register('ar', require('./lib/timeago/locales/ar'));
    if (locale === 'be') timeago.register('be', require('./lib/timeago/locales/be'));
    if (locale === 'bg') timeago.register('bg', require('./lib/timeago/locales/bg'));
    if (locale === 'ca') timeago.register('ca', require('./lib/timeago/locales/ca'));
    if (locale === 'da') timeago.register('da', require('./lib/timeago/locales/da'));
    if (locale === 'de') timeago.register('de', require('./lib/timeago/locales/de'));
    if (locale === 'el') timeago.register('el', require('./lib/timeago/locales/el'));
    if (locale === 'en_short') timeago.register('en_short', require('./lib/timeago/locales/en_short'));
    if (locale === 'es') timeago.register('es', require('./lib/timeago/locales/es'));
    if (locale === 'eu') timeago.register('eu', require('./lib/timeago/locales/eu'));
    if (locale === 'fi') timeago.register('fi', require('./lib/timeago/locales/fi'));
    if (locale === 'fr') timeago.register('fr', require('./lib/timeago/locales/fr'));
    if (locale === 'he') timeago.register('he', require('./lib/timeago/locales/he'));
    if (locale === 'hu') timeago.register('hu', require('./lib/timeago/locales/hu'));
    if (locale === 'in_BG') timeago.register('in_BG', require('./lib/timeago/locales/in_BG'));
    if (locale === 'in_HI') timeago.register('in_HI', require('./lib/timeago/locales/in_HI'));
    if (locale === 'in_ID') timeago.register('in_ID', require('./lib/timeago/locales/in_ID'));
    if (locale === 'it') timeago.register('it', require('./lib/timeago/locales/it'));
    if (locale === 'ja') timeago.register('ja', require('./lib/timeago/locales/ja'));
    if (locale === 'ko') timeago.register('ko', require('./lib/timeago/locales/ko'));
    if (locale === 'ml') timeago.register('ml', require('./lib/timeago/locales/ml'));
    if (locale === 'nb_NO') timeago.register('nb_NO', require('./lib/timeago/locales/nb_NO'));
    if (locale === 'nl') timeago.register('nl', require('./lib/timeago/locales/nl'));
    if (locale === 'nn_NO') timeago.register('nn_NO', require('./lib/timeago/locales/nn_NO'));
    if (locale === 'pl') timeago.register('pl', require('./lib/timeago/locales/pl'));
    if (locale === 'pt_BR') timeago.register('pt_BR', require('./lib/timeago/locales/pt_BR'));
    if (locale === 'ro') timeago.register('ro', require('./lib/timeago/locales/ro'));
    if (locale === 'ru') timeago.register('ru', require('./lib/timeago/locales/ru'));
    if (locale === 'sv') timeago.register('sv', require('./lib/timeago/locales/sv'));
    if (locale === 'ta') timeago.register('ta', require('./lib/timeago/locales/ta'));
    if (locale === 'th') timeago.register('th', require('./lib/timeago/locales/th'));
    if (locale === 'tr') timeago.register('tr', require('./lib/timeago/locales/tr'));
    if (locale === 'uk') timeago.register('uk', require('./lib/timeago/locales/uk'));
    if (locale === 'vi') timeago.register('vi', require('./lib/timeago/locales/vi'));
    if (locale === 'zh_TW') timeago.register('zh_TW', require('./lib/timeago/locales/zh_TW'));
  }

}

AMP.registerElement('amp-timeago', AmpTimeAgo);
