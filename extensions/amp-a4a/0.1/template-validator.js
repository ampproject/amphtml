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

import {AmpAdTemplateHelper} from '../../amp-a4a/0.1/amp-ad-template-helper';
import {Services} from '../../../src/services';
import {Validator, ValidatorResult} from './amp-ad-type-defs';
import {getAmpAdMetadata} from './amp-ad-utils';
import {pushIfNotExist} from '../../../src/utils/array';
import {tryParseJson} from '../../../src/json';
import {utf8Decode} from '../../../src/utils/bytes';

/** @const {string} */
export const AMP_TEMPLATED_CREATIVE_HEADER_NAME = 'AMP-template-amp-creative';

/** {?AmpAdTemplateHelper} */
let ampAdTemplateHelper;

/**
 * Returns the global template helper.
 * @param {!Window} win
 * @return {!AmpAdTemplateHelper}
 * @visibleForTesting
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

    const creativeData = {};
    const body = utf8Decode(/** @type {!ArrayBuffer} */ (unvalidatedBytes));

    if (!headers ||
        headers.get(AMP_TEMPLATED_CREATIVE_HEADER_NAME) !== 'amp-mustache') {
      creativeData['creative'] = body;
      return Promise.resolve(
          /** @type {!./amp-ad-type-defs.ValidatorOutput} */ ({
            creativeData,
            adResponseType: 'template',
            type: ValidatorResult.NON_AMP,
          }));
    }

    const parsedResponseBody =
        /** @type {!./amp-ad-type-defs.AmpTemplateCreativeDef} */ (
        tryParseJson(body) || {});
    return getAmpAdTemplateHelper()
        .fetch(parsedResponseBody.templateUrl)
        .then(template => {
          const metadata = getAmpAdMetadata(template);
          if (parsedResponseBody.analytics) {
            pushIfNotExist(
                metadata['customElementExtensions'], 'amp-analytics');
          }
          pushIfNotExist(metadata['customElementExtensions'], 'amp-mustache');

          const extensions = Services.extensionsFor(context.win);
          metadata.customElementExtensions.forEach(
              extensionId => extensions./*OK*/preloadExtension(extensionId));
          // TODO(levitzky) Add preload logic for fonts / images.
          creativeData.templateData = parsedResponseBody;
          creativeData.creativeMetadata = metadata;
          return Promise.resolve(
              /** @type {!./amp-ad-type-defs.ValidatorOutput} */ ({
                creativeData,
                adResponseType: 'template',
                type: ValidatorResult.AMP,
              }));
        });
  }
}
