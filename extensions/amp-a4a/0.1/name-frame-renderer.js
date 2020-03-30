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
import {createElementWithAttributes} from '../../../src/dom';
import {dict} from '../../../src/utils/object';
import {getContextMetadata} from '../../../src/iframe-attributes';
import {getDefaultBootstrapBaseUrl} from '../../../src/3p-frame';
import {utf8Decode} from '../../../src/utils/bytes';

/**
 * Render a non-AMP creative into a NameFrame.
 */
export class NameFrameRenderer extends Renderer {
  /** @override */
  render(context, element, crossDomainData) {
    crossDomainData = /** @type {!./amp-ad-type-defs.CrossDomainDataDef} */ (crossDomainData);

    if (!crossDomainData.creative && !crossDomainData.rawCreativeBytes) {
      // No creative, nothing to do.
      return Promise.resolve();
    }

    const creative =
      crossDomainData.creative ||
      // rawCreativeBytes must exist; if we're here, then `creative` must not
      // exist, but the if-statement above guarantees that at least one of
      // `creative` || `rawCreativeBytes` exists.
      utf8Decode(
        /** @type {!ArrayBuffer} */ (crossDomainData.rawCreativeBytes)
      );
    const srcPath = getDefaultBootstrapBaseUrl(context.win, 'nameframe');
    const contextMetadata = getContextMetadata(
      context.win,
      element,
      context.sentinel,
      crossDomainData.additionalContextMetadata
    );
    contextMetadata['creative'] = creative;
    const attributes = dict({
      'src': srcPath,
      'name': JSON.stringify(contextMetadata),
      'height': context.size.height,
      'width': context.size.width,
      'frameborder': '0',
      'allowfullscreen': '',
      'allowtransparency': '',
      'scrolling': 'no',
      'marginwidth': '0',
      'marginheight': '0',
    });
    if (crossDomainData.sentinel) {
      attributes['data-amp-3p-sentinel'] = crossDomainData.sentinel;
    }
    const iframe = createElementWithAttributes(
      /** @type {!Document} */ (element.ownerDocument),
      'iframe',
      /** @type {!JsonObject} */ (attributes)
    );
    // TODO(glevitzky): Ensure that applyFillContent or equivalent is called.
    element.appendChild(iframe);
    return Promise.resolve();
  }
}
