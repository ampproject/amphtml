/**
 * Copyright 2020 The AMP HTML Authors. All Rights Reserved.
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

import {AmpStoryEmbed} from './amp-story-embed';

/** @const {string} */
const SCROLL_THROTTLE_MS = 500;

export class AmpStoryEmbedManager {
  /**
   * Fallback for when IntersectionObserver is not supported. Calls layoutCallback
   * on the embed when it is close to the viewport.
   * @param {!AmpStoryEmbed} embedImpl
   */
  layoutFallback_(embedImpl) {
    let tick = true;

    self.addEventListener('scroll', () => {
      if (!tick) {
        return;
      }

      setTimeout(() => {
        tick = true;

        this.layoutIfVisible_(embedImpl);
      }, SCROLL_THROTTLE_MS);

      tick = false;
    });

    // Calls it once it in case scroll event never fires.
    this.layoutIfVisible_(embedImpl);
  }

  /**
   * Checks if embed is close to the viewport and calls layoutCallback when it is.
   * @param {!AmpStoryEmbed} embedImpl
   */
  layoutIfVisible_(embedImpl) {
    const embedTop = embedImpl.getElement()./*OK*/ getBoundingClientRect().top;
    if (self./*OK*/ innerHeight * 2 > embedTop) {
      embedImpl.layoutCallback();
    }
  }

  /**
   * Calls layoutCallback on the embed when it is close to the viewport.
   * @param {!AmpStoryEmbed} embedImpl
   * @visibleForTesting
   */
  layoutEmbed(embedImpl) {
    if (IntersectionObserver && self === self.parent) {
      const intersectingCallback = entries => {
        entries.forEach(entry => {
          if (!entry.isIntersecting) {
            return;
          }
          embedImpl.layoutCallback();
        });
      };

      const observer = new IntersectionObserver(intersectingCallback, {
        rootMargin: '100%',
      });
      observer.observe(embedImpl.getElement());
      return;
    }

    this.layoutFallback_(embedImpl);
  }

  /**
   * Builds and layouts the embeds when appropiate.
   */
  loadEmbeds() {
    const doc = self.document;
    const embeds = doc.getElementsByTagName('amp-story-embed');
    for (let i = 0; i < embeds.length; i++) {
      const embedEl = embeds[i];
      const embedImpl = new AmpStoryEmbed(self, embedEl);
      embedImpl.buildCallback();
      this.layoutEmbed(embedImpl);
    }
  }
}
