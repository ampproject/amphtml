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

import {Renderer} from './amp-ad-type-defs';
import {devAssert} from '../../../src/log';
import {renderCreativeIntoFriendlyFrame} from './friendly-frame-util';

/**
 * @typedef {{
 *   creativeMetadata: ./amp-ad-type-defs.CreativeMetaDataDef,
 * }}
 */
export let CreativeData;

/**
 * Render a validated AMP creative directly in the parent page.
 */
export class FriendlyFrameRenderer extends Renderer {
  /**
   * Constructs a FriendlyFrameRenderer instance. The instance values here are
   * used by TemplateRenderer, which inherits from FriendlyFrameRenderer.
   */
  constructor() {
    super();
  }

  /** @override */
  render(context, element, creativeData) {
    creativeData = /** @type {CreativeData} */ (creativeData);

    const {size, adUrl} = context;
    const {creativeMetadata} = creativeData;

    devAssert(size, 'missing creative size');
    devAssert(adUrl, 'missing ad request url');

    return renderCreativeIntoFriendlyFrame(
      adUrl,
      size,
      element,
      creativeMetadata
    );
  }
}
