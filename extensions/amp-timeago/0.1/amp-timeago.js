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

import {user} from '../../../src/log';
import {Layout} from '../../../src/layout';
import {timeago} from './third_party/timeagojs/timeago';
import {ar} from './third_party/timeagojs/locales/ar';
import {be} from './third_party/timeagojs/locales/be';
import {bg} from './third_party/timeagojs/locales/bg';
import {ca} from './third_party/timeagojs/locales/ca';
import {da} from './third_party/timeagojs/locales/da';
import {de} from './third_party/timeagojs/locales/de';
import {el} from './third_party/timeagojs/locales/el';
import {en} from './third_party/timeagojs/locales/en';
import {enShort} from './third_party/timeagojs/locales/enShort';
import {es} from './third_party/timeagojs/locales/es';
import {eu} from './third_party/timeagojs/locales/eu';
import {fi} from './third_party/timeagojs/locales/fi';
import {fr} from './third_party/timeagojs/locales/fr';
import {he} from './third_party/timeagojs/locales/he';
import {hu} from './third_party/timeagojs/locales/hu';
import {inBG} from './third_party/timeagojs/locales/inBG';
import {inHI} from './third_party/timeagojs/locales/inHI';
import {inID} from './third_party/timeagojs/locales/inID';
import {it} from './third_party/timeagojs/locales/it';
import {ja} from './third_party/timeagojs/locales/ja';
import {ko} from './third_party/timeagojs/locales/ko';
import {ml} from './third_party/timeagojs/locales/ml';
import {nbNO} from './third_party/timeagojs/locales/nbNO';
import {nl} from './third_party/timeagojs/locales/nl';
import {nnNO} from './third_party/timeagojs/locales/nnNO';
import {pl} from './third_party/timeagojs/locales/pl';
import {ptBR} from './third_party/timeagojs/locales/ptBR';
import {ro} from './third_party/timeagojs/locales/ro';
import {ru} from './third_party/timeagojs/locales/ru';
import {sv} from './third_party/timeagojs/locales/sv';
import {ta} from './third_party/timeagojs/locales/ta';
import {th} from './third_party/timeagojs/locales/th';
import {tr} from './third_party/timeagojs/locales/tr';
import {uk} from './third_party/timeagojs/locales/uk';
import {vi} from './third_party/timeagojs/locales/vi';
import {zhCN} from './third_party/timeagojs/locales/zhCN';
import {zhTW} from './third_party/timeagojs/locales/zhTW';

timeago.register('ar', ar);
timeago.register('be', be);
timeago.register('bg', bg);
timeago.register('ca', ca);
timeago.register('da', da);
timeago.register('de', de);
timeago.register('el', el);
timeago.register('en', en);
timeago.register('enShort', enShort);
timeago.register('es', es);
timeago.register('eu', eu);
timeago.register('fi', fi);
timeago.register('fr', fr);
timeago.register('he', he);
timeago.register('hu', hu);
timeago.register('inBG', inBG);
timeago.register('inHI', inHI);
timeago.register('inID', inID);
timeago.register('it', it);
timeago.register('ja', ja);
timeago.register('ko', ko);
timeago.register('ml', ml);
timeago.register('nbNO', nbNO);
timeago.register('nl', nl);
timeago.register('nnNO', nnNO);
timeago.register('pl', pl);
timeago.register('ptBR', ptBR);
timeago.register('ro', ro);
timeago.register('ru', ru);
timeago.register('sv', sv);
timeago.register('ta', ta);
timeago.register('th', th);
timeago.register('tr', tr);
timeago.register('uk', uk);
timeago.register('vi', vi);
timeago.register('zhCN', zhCN);
timeago.register('zhTW', zhTW);

export class AmpTimeAgo extends AMP.BaseElement {

  /** @param {!AmpElement} element */
  constructor(element) {
    super(element);

    /** @private {string} */
    this.datetime_ = '';

    /** @private {string} */
    this.locale_ = '';

    /** @private {string} */
    this.title_ = '';
  }

  /** @override */
  buildCallback() {
    user().assert(this.element.textContent.length > 0,
        'Content cannot be empty. Found in: %s', this.element);

    this.datetime_ = this.element.getAttribute('datetime');
    this.locale_ = this.element.getAttribute('locale') ||
      this.win.document.documentElement.lang;
    this.title_ = this.element.textContent;

    this.element.title = this.title_;
    this.element.textContent = '';

    const timeElement = document.createElement('time');
    timeElement.setAttribute('datetime', this.datetime_);
    timeElement.textContent = timeago(this.datetime_, this.locale_);
    this.element.appendChild(timeElement);
  }

  /** @override */
  isLayoutSupported(layout) {
    return layout === Layout.FIXED;
  }
}

AMP.registerElement('amp-timeago', AmpTimeAgo);
