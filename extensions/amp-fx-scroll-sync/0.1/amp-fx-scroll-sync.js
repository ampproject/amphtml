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
import {ScrollSyncEffect} from './scroll-sync-effect';
import {ScrollSyncStickyTopEffect} from './scroll-sync-sticky-top-effect';
import {ScrollSyncScaleEffect} from './scroll-sync-scale-effect';
import {ScrollSyncScrollAwayEffect} from './scroll-sync-scroll-away-effect';
import {installScrollSyncService} from './scroll-sync-service';
import {getService} from '../../../src/service';

/** @private @const {string} */
const TAG = 'amp-fx-scroll-sync';

class AmpScrollSync extends AMP.BaseElement {

  /** @override */
  isLayoutSupported(layout) {
    return true;
  }

  /** @override */
  buildCallback() {
    dev().fine(TAG, 'building');

    this.effectName_ = this.element.getAttribute('name');
    dev().fine(TAG, 'effectName_: '+ this.effectName_);

    let config = {};
    let scrollSyncEffect = null;
    if(this.effectName_ == 'dock-top') {
      scrollSyncEffect = new ScrollSyncStickyTopEffect(this, config);
    } else if (this.effectName_ == 'scale') {
      config['end-scale'] = this.element.getAttribute('end-scale');
      config['starting-position'] = this.element.getAttribute('starting-position');
      config['ending-position'] = this.element.getAttribute('ending-position');
      scrollSyncEffect = new ScrollSyncScaleEffect(this, config);
    } else if (this.effectName_ == 'scroll-away') {
      scrollSyncEffect = new ScrollSyncScrollAwayEffect(this, config);
    }
    /** @private */
    this.scrollSyncService_ = installScrollSyncService(this.win);
    this.scrollSyncService_.addEffect(scrollSyncEffect);
  }
}

AMP.registerElement('amp-fx-scroll-sync', AmpScrollSync);
