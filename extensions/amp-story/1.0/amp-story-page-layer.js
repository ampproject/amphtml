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

/**
 * @fileoverview This is a page layer that takes the full page size.
 * It supports aspect-ratio, anchoring and scaling factors to fill a bleed-zone.
 * It does not contain any pre-existing styles.
 *
 * Example:
 * <code>
 * <amp-story-page-layer style="display: flex; align-items: center">
 *   <h1>This is a title</h1>
 *   ...
 * </amp-story-page-layer>
 * </code>
 */

import {AmpStoryBaseLayer} from './amp-story-base-layer';
import {setStyle} from '../../../src/style';
import {user} from '../../../src/log';

const ASPECT_RATIO_PRESET_ATTRIBUTE = 'aspect-ratio';
const SCALING_FACTOR_PRESET_ATTRIBUTE = 'scaling-factor';
const SCALING_FACTOR_CSS_VAR = '--i-amphtml-story-layer-scale';

const LAYER_PRESETS = {
  'preset-2021-background': {
    [ASPECT_RATIO_PRESET_ATTRIBUTE]: '69:116',
    [SCALING_FACTOR_PRESET_ATTRIBUTE]: '1.142',
  },
  'preset-2021-foreground': {
    [ASPECT_RATIO_PRESET_ATTRIBUTE]: '69:116',
  },
};

export class AmpStoryPageLayer extends AmpStoryBaseLayer {
  /** @param {!AmpElement} element */
  constructor(element) {
    super(element);
  }

  /** @override */
  buildCallback() {
    super.buildCallback();
    this.applyPresets_();
    this.applyTemplateClassName_();
    this.initializeAspectRatioListeners_();
  }

  /** @override */
  prerenderAllowed() {
    return this.isFirstPage();
  }

  /**
   * Applies the attributes to the layer from the preset specified in the [preset] attribute.
   */
  applyPresets_() {
    if (!this.element.hasAttribute('preset')) {
      return;
    }
    const preset = this.element.getAttribute('preset');
    const presetDetails = LAYER_PRESETS[preset];
    user().assert(
      presetDetails,
      `Preset not found for amp-story-grid-layer: ${preset}`
    );
    Object.entries(presetDetails).forEach((keyValue) =>
      this.element.setAttribute(keyValue[0], keyValue[1])
    );
    if (this.element.hasAttribute(SCALING_FACTOR_PRESET_ATTRIBUTE)) {
      setStyle(
        this.element,
        SCALING_FACTOR_CSS_VAR,
        this.element.getAttribute(SCALING_FACTOR_PRESET_ATTRIBUTE)
      );
    }
  }
}
