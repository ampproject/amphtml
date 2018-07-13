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
} from './amp-ad-type-defs';
import {AmpAdNetworkBase} from './amp-ad-network-base';
import {NameFrameRenderer} from './name-frame-renderer';
import {NetworkRegistry} from './template-config';
import {Services} from '../../../src/services';
import {TemplateRenderer} from './template-renderer';
import {TemplateValidator} from './template-validator';
import {camelCaseToDash, startsWith} from '../../../src/string';
import {dev} from '../../../src/log';

// These have no side-effects, and so may be reused between all instances.
const validator = new TemplateValidator();
const nameFrameRenderer = new NameFrameRenderer();

export const DATA_REQUEST_VAR_PREFIX = 'request-var-';

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
    this.networkType_ = element.getAttribute('type');
    dev().assert(this.networkType_,
        'Template amp-ad elements must specify a type');

    const networkConfig = NetworkRegistry[this.networkType_];
    dev().assert(networkConfig, `Invalid network type ${this.networkType_}`);

    /** @const {string} */
    this.requestUrl_ = networkConfig.requestUrl;
    dev().assert(this.requestUrl_,
        'Invalid network configuration: no request URL specified');

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
    const substitutions = {
      width: this.getContext().size.width,
      height: this.getContext().size.height,
    };
    // We collect all fields in the dataset of the form
    // 'data-request-var-<field_name>=<val>`, and add <field_name>: <val> to
    // the substitution object to be inserted into the URL during expansion.
    Object.keys(this.element.dataset).forEach(dataField => {
      const dataFieldInDash = camelCaseToDash(dataField);
      if (startsWith(dataFieldInDash, DATA_REQUEST_VAR_PREFIX)) {
        const requestVarName = dataFieldInDash.slice(
            DATA_REQUEST_VAR_PREFIX.length, dataFieldInDash.length);
        substitutions[requestVarName] = this.element.dataset[dataField];
      }
    });
    const url = Services.urlReplacementsForDoc(this.element)
        .expandUrlSync(this.requestUrl_, substitutions);
    this.getContext().adUrl = url;
    return url;
  }
}
