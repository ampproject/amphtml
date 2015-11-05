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

import {isLayoutSizeDefined} from '../../../src/layout';


class AmpRender extends AMP.BaseElement {

  /** @override */
  isLayoutSupported(layout) {
    return isLayoutSizeDefined(layout);
  }

  /** @override */
  layoutCallback() {
    return AMP.findAndRenderTemplate(this.element, {
            name: 'Dima',
            time: new Date(),
            imageUrl: 'https://lh4.googleusercontent.com/-okOlNNHeoOc/VbYyrlFYFII/AAAAAAABYdA/La-3j3c-QQI/w600-h400-no/PANO_20150726_171347%257E2.jpg',
            inline: 'before <b><i>inline<br>and <img> <p>more</p>',
        }).
        then(element => {
          this.applyFillContent(element);
          this.element.appendChild(element);
        });
  }
}

AMP.registerElement('amp-render', AmpRender);
