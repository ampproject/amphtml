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
import {
  UrlReplacementPolicy,
  batchFetchJsonFor,
} from '../../../src/batched-json';
import {assertConfig} from './config';
import {
  childElementsByAttr,
  childElementsByTag,
  isJsonScriptTag,
  removeElement,
} from '../../../src/dom';
import {getServicePromiseForDoc} from '../../../src/service';
import {getSourceOrigin} from '../../../src/url';
import {isExperimentOn} from '../../../src/experiments';
import {tryParseJson} from '../../../src/json';
import {user} from '../../../src/log';

const TAG = 'amp-next-page';

const SERVICE_ID = 'next-page';

export class AmpNextPage extends AMP.BaseElement {

  /** @override */
  isLayoutSupported(layout) {
    return layout == Layout.CONTAINER;
  }

  /** @override */
  buildCallback() {
    user().assert(isExperimentOn(this.win, 'amp-next-page'),
        'Experiment amp-next-page disabled');

    const separatorElements = childElementsByAttr(this.element, 'separator');
    user().assert(separatorElements.length <= 1,
        `${TAG} should contain at most one <div separator> child`);

    let separator = null;
    if (separatorElements.length === 1) {
      separator = separatorElements[0];
      removeElement(separator);
    }

    return nextPageServiceForDoc(this.getAmpDoc()).then(service => {
      if (service.isActive()) {
        return;
      }

      const {element} = this;
      element.classList.add('i-amphtml-next-page');

      const src = element.getAttribute('src');
      if (src) {
        return this.fetchConfig_().then(
            config => this.register_(service, config, separator),
            error => user().error(TAG, 'error fetching config', error));
      } else {
        const scriptElements = childElementsByTag(element, 'SCRIPT');
        user().assert(scriptElements.length === 1,
            `${TAG} should contain only one <script> child, or a URL specified `
            + 'in [src]');
        const scriptElement = scriptElements[0];
        user().assert(isJsonScriptTag(scriptElement),
            `${TAG} config should ` +
            'be inside a <script> tag with type="application/json"');
        const configJson = tryParseJson(scriptElement.textContent, error => {
          user().error(TAG, 'failed to parse config', error);
        });
        this.register_(service, configJson, separator);
      }
    });
  }

  /**
   * Verifies the specified config as a valid {@code NextPageConfig} and
   * registers the {@link NextPageService} for this document.
   * @param {!NextPageService} service Service to register with.
   * @param {*} configJson Config JSON object.
   * @param {?Element} separator Optional custom separator element.
   * @private
   */
  register_(service, configJson, separator) {
    const {element} = this;
    const urlService = Services.urlForDoc(element);

    const url = urlService.parse(this.getAmpDoc().getUrl());
    const sourceOrigin = getSourceOrigin(url);

    const config = assertConfig(element, configJson, url.origin, sourceOrigin);

    if (urlService.isProxyOrigin(url)) {
      config.pages.forEach(rec => {
        rec.ampUrl = rec.ampUrl.replace(sourceOrigin, url.origin);
      });
    }

    service.register(element, config, separator);
    service.setAppendPageHandler(element => this.appendPage_(element));
  }

  /**
   * Appends the element too page
   * @param {!Element} element
   */
  appendPage_(element) {
    return this.mutateElement(() => this.element.appendChild(element));
  }

  /**
   * Fetches the element config from the URL specified in [src].
   * @private
   */
  fetchConfig_() {
    const ampdoc = this.getAmpDoc();
    const policy = UrlReplacementPolicy.ALL;
    return batchFetchJsonFor(
        ampdoc, this.element, /* opt_expr */ undefined, policy);
  }
}

/**
 * @param {!Element|!../../../src/service/ampdoc-impl.AmpDoc} elementOrAmpDoc
 * @return {!Promise<!NextPageService>}
 */
function nextPageServiceForDoc(elementOrAmpDoc) {
  return /** @type {!Promise<!NextPageService>} */ (
    getServicePromiseForDoc(elementOrAmpDoc, SERVICE_ID));
}

AMP.extension(TAG, '0.1', AMP => {
  const service = new NextPageService();
  AMP.registerServiceForDoc(SERVICE_ID, () => service);
  AMP.registerElement(TAG, AmpNextPage, CSS);
});
