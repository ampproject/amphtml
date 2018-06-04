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

import {CSS} from '../../../build/amp-next-page-0.1.css';
import {Layout} from '../../../src/layout';
import {NextPageService} from './next-page-service';
import {Services} from '../../../src/services';
import {assertConfig} from './config';
import {
  childElementsByAttr,
  childElementsByTag,
  isJsonScriptTag,
} from '../../../src/dom';
import {getService} from '../../../src/service';
import {getSourceOrigin, isProxyOrigin, parseUrlDeprecated} from '../../../src/url';
import {isExperimentOn} from '../../../src/experiments';
import {tryParseJson} from '../../../src/json';
import {user} from '../../../src/log';

const TAG = 'amp-next-page';

const SERVICE_ID = 'next-page';

export class AmpNextPage extends AMP.BaseElement {

  /** @param {!AmpElement} element */
  constructor(element) {
    super(element);

    /** @private {!./next-page-service.NextPageService} */
    this.service_ = getService(this.win, SERVICE_ID);
  }

  /** @override */
  isLayoutSupported(layout) {
    return layout == Layout.CONTAINER;
  }

  /** @override */
  buildCallback() {
    user().assert(isExperimentOn(this.win, TAG), `Experiment ${TAG} disabled`);
    if (this.service_.isActive()) {
      return;
    }

    this.element.classList.add('i-amphtml-next-page');

    // TODO(peterjosling): Read config from another source.

    const scriptElements = childElementsByTag(this.element, 'SCRIPT');
    user().assert(scriptElements.length == 1,
        `${TAG} should contain only one <script> child.`);
    const scriptElement = scriptElements[0];
    user().assert(isJsonScriptTag(scriptElement),
        `${TAG} config should ` +
            'be inside a <script> tag with type="application/json"');
    const configJson = tryParseJson(scriptElement.textContent, error => {
      user().error(TAG, 'failed to parse config', error);
    });

    const docInfo = Services.documentInfoForDoc(this.element);
    const url = parseUrlDeprecated(docInfo.url);
    const sourceOrigin = getSourceOrigin(url);
    const config = assertConfig(configJson, url.origin, sourceOrigin);

    if (isProxyOrigin(url)) {
      config.pages.forEach(rec => {
        rec.ampUrl = rec.ampUrl.replace(sourceOrigin, url.origin);
      });
    }

    const separatorElements = childElementsByAttr(this.element, 'separator');
    user().assert(separatorElements.length <= 1,
        `${TAG} should contain at most one <div separator> child`);

    let separator = null;
    if (separatorElements.length === 1) {
      separator = separatorElements[0];
    }

    this.service_.register(this.element, config, separator);
    this.service_.setAppendPageHandler(element => this.appendPage_(element));
  }

  appendPage_(element) {
    return this.mutateElement(() => this.element.appendChild(element));
  }
}

AMP.extension(TAG, '0.1', AMP => {
  const service = new NextPageService();
  AMP.registerServiceForDoc(SERVICE_ID, () => service);
  AMP.registerElement(TAG, AmpNextPage, CSS);
});
