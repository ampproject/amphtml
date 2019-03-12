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

import {
  AdResponseType,
  Validator,
  ValidatorResult,
} from './amp-ad-type-defs';
import {AmpAdTemplateHelper} from '../../amp-a4a/0.1/amp-ad-template-helper';
import {Services} from '../../../src/services';
import {getAmpAdMetadata} from './amp-ad-utils';
import {pushIfNotExist} from '../../../src/utils/array';
import {tryParseJson} from '../../../src/json';
import {utf8Decode} from '../../../src/utils/bytes';

/** @const {string} */
export const AMP_TEMPLATED_CREATIVE_HEADER_NAME = 'AMP-Ad-Template-Extension';
export const DEPRECATED_AMP_TEMPLATED_CREATIVE_HEADER_NAME =
  'AMP-template-amp-creative';

/** @type {?AmpAdTemplateHelper} */
let ampAdTemplateHelper;

/**
 * Returns the global template helper.
 * @param {!Window} win
 * @return {!AmpAdTemplateHelper}
 */
export function getAmpAdTemplateHelper(win) {
  return ampAdTemplateHelper ||
      (ampAdTemplateHelper = new AmpAdTemplateHelper(win));
}

/**
 * Validator for Template ads.
 */
export class TemplateValidator extends Validator {
  /** @override */
  validate(context, unvalidatedBytes, headers) {

    const body = utf8Decode(/** @type {!ArrayBuffer} */ (unvalidatedBytes));
    const parsedResponseBody =
    /** @type {./amp-ad-type-defs.AmpTemplateCreativeDef} */ (
        tryParseJson(body));

    // If we're missing the relevant header, or headers altogether, we cannot
    // proceed. In this case, we return a NON_AMP response, since we cannot
    // ensure this template will be valid AMP. We will pass the body of the
    // response as the creative, and downstream renderers may attempt to render
    // it as a non-AMP creative within a cross-domain iframe.
    if (false && (!parsedResponseBody || !headers ||
        (headers.get(AMP_TEMPLATED_CREATIVE_HEADER_NAME) !== 'amp-mustache' &&
         headers.get(DEPRECATED_AMP_TEMPLATED_CREATIVE_HEADER_NAME) !==
           'amp-mustache'))) {
      return Promise.resolve(
          /** @type {!./amp-ad-type-defs.ValidatorOutput} */ ({
            creativeData: {
              creative: body,
            },
            adResponseType: AdResponseType.TEMPLATE,
            type: ValidatorResult.NON_AMP,
          }));
    }

    return getAmpAdTemplateHelper(context.win)
        .fetch(parsedResponseBody.templateUrl)
        .then(template => {
          debugger;
          const creativeMetadata = getAmpAdMetadata(template);
          if (parsedResponseBody.analytics) {
            pushIfNotExist(
                creativeMetadata['customElementExtensions'], 'amp-analytics');
          }
          pushIfNotExist(
              creativeMetadata['customElementExtensions'], 'amp-mustache');

          const extensions = Services.extensionsFor(context.win);
          creativeMetadata.customElementExtensions.forEach(
              extensionId => extensions./*OK*/preloadExtension(extensionId));
          // TODO(levitzky) Add preload logic for fonts / images.
          return Promise.resolve(
              /** @type {!./amp-ad-type-defs.ValidatorOutput} */ ({
                creativeData: {
                  templateData: parsedResponseBody,
                  creativeMetadata,
                },
                adResponseType: AdResponseType.TEMPLATE,
                type: ValidatorResult.AMP,
              }));
        });
  }
}
