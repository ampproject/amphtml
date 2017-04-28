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
import {timeagoFactory as timeago} from './lib/timeago/timeago';
import {ar} from './lib/timeago/locales/ar';
import {be} from './lib/timeago/locales/be';
import {bg} from './lib/timeago/locales/bg';
import {ca} from './lib/timeago/locales/ca';
import {da} from './lib/timeago/locales/da';
import {de} from './lib/timeago/locales/de';
import {el} from './lib/timeago/locales/el';
import {en} from './lib/timeago/locales/en';
import {enShort} from './lib/timeago/locales/enShort';
import {es} from './lib/timeago/locales/es';
import {eu} from './lib/timeago/locales/eu';
import {fi} from './lib/timeago/locales/fi';
import {fr} from './lib/timeago/locales/fr';
import {he} from './lib/timeago/locales/he';
import {hu} from './lib/timeago/locales/hu';
import {inBG} from './lib/timeago/locales/inBG';
import {inHI} from './lib/timeago/locales/inHI';
import {inID} from './lib/timeago/locales/inID';
import {it} from './lib/timeago/locales/it';
import {ja} from './lib/timeago/locales/ja';
import {ko} from './lib/timeago/locales/ko';
import {ml} from './lib/timeago/locales/ml';
import {nbNO} from './lib/timeago/locales/nbNO';
import {nl} from './lib/timeago/locales/nl';
import {nnNO} from './lib/timeago/locales/nnNO';
import {pl} from './lib/timeago/locales/pl';
import {ptBR} from './lib/timeago/locales/ptBR';
import {ro} from './lib/timeago/locales/ro';
import {ru} from './lib/timeago/locales/ru';
import {sv} from './lib/timeago/locales/sv';
import {ta} from './lib/timeago/locales/ta';
import {th} from './lib/timeago/locales/th';
import {tr} from './lib/timeago/locales/tr';
import {uk} from './lib/timeago/locales/uk';
import {vi} from './lib/timeago/locales/vi';
import {zhCN} from './lib/timeago/locales/zhCN';
import {zhTW} from './lib/timeago/locales/zhTW';

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

/** @private @const {string} */
const DEFAULT_LOCALE_ = 'en';

export class AmpTimeAgo extends AMP.BaseElement {

  /** @override */
  buildCallback() {
    /** @private @const {string} */
    this.datetime_ = this.element.getAttribute('datetime');

    /** @private @const {string} */
    this.locale_ = this.element.getAttribute('locale') || DEFAULT_LOCALE_;

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

}

AMP.registerElement('amp-timeago', AmpTimeAgo);
