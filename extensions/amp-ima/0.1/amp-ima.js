/**
 * Copyright 2015 The AMP HTML Authors. All Rights Reserved.
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

import {getIframe} from '../../../src/3p-frame';
import {isLayoutSizeDefined} from '../../../src/layout';
import {loadPromise} from '../../../src/event-helper';


class AmpIma extends AMP.BaseElement {
  /** @override */
  preconnectCallback(onLayout) {
    this.preconnect.prefetch('//vjs.zencdn.net/5.3/video.min.js', onLayout);
    this.preconnect.prefetch('//imasdk.googleapis.com/js/sdkloader/ima3.js', onLayout);
    this.preconnect.prefetch('http://gvabox.com/sbusolits/amp/js/videojs.ads.js', onLayout);
    this.preconnect.prefetch('http://gvabox.com/sbusolits/amp/js/videojs.ima.js', onLayout);
  }

  /** @override */
  isLayoutSupported(layout) {
    return isLayoutSizeDefined(layout);
  }

  /** @override */
  layoutCallback() {
    const iframe = getIframe(this.element.ownerDocument.defaultView, this.element, 'ima');
    this.applyFillContent(iframe);
    this.element.appendChild(iframe);
    return loadPromise(iframe);
  }
};

AMP.registerElement('amp-ima', AmpIma);
