/**
 * Copyright 2016 The AMP HTML Authors. All Rights Reserved.
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

import {dev} from '../../../src/log';
import {ScrollSyncRotateEffect} from './scroll-sync-rotate-effect';
import {ScrollSyncStickyTopEffect} from './scroll-sync-sticky-top-effect';
import {ScrollSyncScaleEffect} from './scroll-sync-scale-effect';
import {ScrollSyncScrollAwayEffect} from './scroll-sync-scroll-away-effect';
import {ScrollSyncTranslateXEffect} from './scroll-sync-translate-x-effect';
import {installScrollSyncService} from './scroll-sync-service';

/** @private @const {string} */
const TAG = 'amp-fx-scroll-sync';

class AmpScrollSync extends AMP.BaseElement {

  /** @override */
  isLayoutSupported(unusedLayout) {
    return true;
  }

  /** @override */
  buildCallback() {
    dev().fine(TAG, 'building');

    this.effectType_ = this.element.getAttribute('type');
    dev().fine(TAG, 'effectType_: ' + this.effectType_);

    let scrollSyncEffect = null;
    const element = this.element.parentElement;
    if (this.effectType_ == 'dock-top') {
      scrollSyncEffect = new ScrollSyncStickyTopEffect(element);
    } else if (this.effectType_ == 'scale') {
      scrollSyncEffect = new ScrollSyncScaleEffect(element);
    } else if (this.effectType_ == 'rotate') {
      scrollSyncEffect = new ScrollSyncRotateEffect(element);
    } else if (this.effectType_ == 'translate-x') {
      scrollSyncEffect = new ScrollSyncTranslateXEffect(element);
    } else if (this.effectType_ == 'scroll-away') {
      scrollSyncEffect = new ScrollSyncScrollAwayEffect(element);
    }
    /** @private */
    this.scrollSyncService_ = installScrollSyncService(this.win);
    this.scrollSyncService_.addEffect(scrollSyncEffect);
  }
}

AMP.registerElement('amp-fx-scroll-sync', AmpScrollSync);
