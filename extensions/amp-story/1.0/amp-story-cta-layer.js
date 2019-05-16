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
import {addAttributesToElement, matches, removeElement} from '../../../src/dom';
import {dict} from '../../../src/utils/object';
import {setTextBackgroundColor} from './utils';
import {user} from '../../../src/log';

/**
 * @type {string}
 * @const
 */
const TAG = 'amp-story-cta-layer';

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
    this.setOrOverwriteAttributes_();
    this.setDescendentCssTextStyles_();
    this.checkAndRemoveLayerIfOnFirstPage_();
  }

  /**
   * Overwrite or set target attributes that are cta-layer-specific.
   * @private
   */
  setOrOverwriteAttributes_() {
    const ctaLinks = this.element.querySelectorAll('a');
    for (let i = 0; i < ctaLinks.length; i++) {
      addAttributesToElement(ctaLinks[i], dict({'target': '_blank'}));

      if (!ctaLinks[i].getAttribute('role')) {
        addAttributesToElement(ctaLinks[i], dict({'role': 'link'}));
      }
    }

    const ctaButtons = this.element.querySelectorAll('button');
    for (let i = 0; i < ctaButtons.length; i++) {
      if (!ctaButtons[i].getAttribute('role')) {
        addAttributesToElement(ctaButtons[i], dict({'role': 'button'}));
      }
    }
  }

  /**
   * Sets text styles for descendants of the
   * <amp-story-cta-layer> element.
   * @private
   */
  setDescendentCssTextStyles_() {
    this.mutateElement(() => {
      setTextBackgroundColor(this.element);
    });
  }

  /**
   * CTA links or buttons are not allowed on the first amp-story page. Remove
   * the amp-story-cta-layer if it is found on the first page of the story.
   * @private
   */
  checkAndRemoveLayerIfOnFirstPage_() {
    if (
      matches(
        this.element,
        'amp-story-page:first-of-type > amp-story-cta-layer'
      )
    ) {
      removeElement(this.element);
      user().error(
        TAG,
        'amp-story-cta-layer is not allowed on the first page' +
          ' of an amp-story.'
      );
    }
  }
}
