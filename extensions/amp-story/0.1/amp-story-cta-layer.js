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
 * @fileoverview This is a layer that allows a call to action in a story page.
 * With this, a user could link to an external site from inside a story using
 * the call to action layer, for example.
 *
 * Example:
 * ...
 * <amp-story-page>
 *   <amp-story-cta-layer>
 *     <a href="wwww.google.com"> Visit my site! </a>
 *   </amp-story-cta-layer>
 * <amp-story-page>
 * ...
 */

import {AmpStoryBaseLayer} from './amp-story-base-layer';

/**
 * Call to action button layer template.
 *
 * No pre-rendering to let more computing-intensive elements (like
 * videos) get pre-rendered first. Since this layer will not contain
 * computing-intensive resources such as videos, we can just risk rendering
 * while the user is looking.
 */
export class AmpStoryCtaLayer extends AmpStoryBaseLayer {
  /** @override */
  buildCallback() {
    super.buildCallback();
    this.setOrOverwriteTargetAttribute_();
  }

  /**
   * Overwrite or set target attribute to _blank in call-to-action links.
   * @private
   */
  setOrOverwriteTargetAttribute_() {
    const ctaLinks = this.element.querySelectorAll('a');
    for (let i = 0; i < ctaLinks.length; i++) {
      ctaLinks[i].setAttribute('target', '_blank');
    }
  }
}
