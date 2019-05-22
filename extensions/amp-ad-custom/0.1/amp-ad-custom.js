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
  ValidatorResult,
} from '../../amp-a4a/0.1/amp-ad-type-defs';
import {AmpAdNetworkBase} from '../../amp-a4a/0.1/amp-ad-network-base';
import {NameFrameRenderer} from '../../amp-a4a/0.1/name-frame-renderer';
import {TemplateRenderer} from '../../amp-a4a/0.1/template-renderer';
import {TemplateValidator} from '../../amp-a4a/0.1/template-validator';
import {addParamToUrl} from '../../../src/url';
import {devAssert} from '../../../src/log';
import {startsWith} from '../../../src/string';

// These have no side-effects, and so may be reused between all instances.
const validator = new TemplateValidator();
const nameFrameRenderer = new NameFrameRenderer();

export const DATA_REQUEST_PARAM_PREFIX = 'requestParam';

export class AmpAdTemplate extends AmpAdNetworkBase {
  /**
   * @param {!Element} element
   */
  constructor(element) {
    super(element);

    this.registerValidator(validator, AdResponseType.TEMPLATE);
    this.registerRenderer(new TemplateRenderer(), ValidatorResult.AMP);
    this.registerRenderer(nameFrameRenderer, ValidatorResult.NON_AMP);

    /** @const {string} */
    this.baseRequestUrl_ = this.element.getAttribute('src');
    devAssert(
      this.baseRequestUrl_,
      'Invalid network configuration: no request URL specified'
    );

    this.getContext().win = this.win;
  }

  /** @override */
  buildCallback() {
    this.getContext().size = {
      // TODO(levitzky) handle non-numeric values.
      width: this.element.getAttribute('width'),
      height: this.element.getAttribute('height'),
      layout: this.element.getAttribute('layout'),
    };
  }

  /** @override */
  getRequestUrl() {
    let url = this.baseRequestUrl_;
    // We collect all fields in the dataset of the form
    // 'data-request-param-<field_name>=<val>`, and append &<field_name>=<val>
    // to the add request URL.
    Object.keys(this.element.dataset).forEach(dataField => {
      if (startsWith(dataField, DATA_REQUEST_PARAM_PREFIX)) {
        const requestParamName = dataField.slice(
          DATA_REQUEST_PARAM_PREFIX.length,
          dataField.length
        );
        if (requestParamName) {
          // Set the first character to lower case, as reading it in camelCase
          // will automatically put it into upper case.
          const finalParamName =
            requestParamName.charAt(0).toLowerCase() +
            requestParamName.slice(1);
          url = addParamToUrl(
            url,
            finalParamName,
            this.element.dataset[dataField]
          );
        }
      }
    });
    this.getContext().adUrl = url;
    return url;
  }
}

const TAG = 'amp-ad-custom';

AMP.extension(TAG, '0.1', AMP => {
  AMP.registerElement(TAG, AmpAdTemplate);
});
