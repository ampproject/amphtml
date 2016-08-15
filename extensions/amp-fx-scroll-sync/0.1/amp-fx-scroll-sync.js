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
import {installScrollSyncService} from './scroll-sync-service';
import {getLengthNumeral} from '../../../src/layout';

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

    this.effectName_ = this.element.getAttribute('name');
    dev().fine(TAG, 'effectName_: ' + this.effectName_);

    let config = {};
    let scrollSyncEffect = null;
    const element = this.element.parentElement;
    if (this.effectName_ == 'dock-top') {
      scrollSyncEffect = new ScrollSyncStickyTopEffect(element, config);
    } else if (this.effectName_ == 'scale') {
      config['end-scale'] = getLengthNumeral(this.element
          .getAttribute('end-scale'));
      config['starting-position'] = getLengthNumeral(this.element
          .getAttribute('starting-position'));
      config['ending-position'] = getLengthNumeral(this.element
          .getAttribute('ending-position'));
      config['scale-origin'] = this.element
          .getAttribute('scale-origin');
      scrollSyncEffect = new ScrollSyncScaleEffect(element, config);
    } else if (this.effectName_ == 'rotate') {
      config['rotate-angle'] = getLengthNumeral(this.element
          .getAttribute('rotate-angle'));
      config['starting-position'] = getLengthNumeral(this.element
          .getAttribute('starting-position'));
      config['ending-position'] = getLengthNumeral(this.element
          .getAttribute('ending-position'));
      scrollSyncEffect = new ScrollSyncRotateEffect(element, config);
    } else if (this.effectName_ == 'scroll-away') {
      scrollSyncEffect = new ScrollSyncScrollAwayEffect(element, config);
    }
    /** @private */
    this.scrollSyncService_ = installScrollSyncService(this.win);
    this.scrollSyncService_.addEffect(scrollSyncEffect);
  }
}

AMP.registerElement('amp-fx-scroll-sync', AmpScrollSync);
