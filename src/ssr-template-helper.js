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

import {Capability} from './service/viewer-impl';
import {getMode} from './mode';

/** The attributes we allow to be sent to the viewer. */
const ATTRS_TO_SEND_TO_VIEWER = {
  'amp-list': ['src', 'single-item', 'max-items'],
  'amp-form': ['action-xhr'],
};

/**
 * Helper, that manages the proxying of template rendering to the viewer.
 */
export class SsrTemplateHelper {

  /**
   * @param {string} sourceComponent
   * @param {!./service/viewer-impl.Viewer} viewer
   * @param {!./service/templates-impl.Templates} templates
   */
  constructor(sourceComponent, viewer, templates) {

    /** @private */
    this.viewer_ = viewer;

    /** @private */
    this.templates_ = templates;

    /** @private {!XMLSerializer} */
    this.xmls_ = new XMLSerializer();

    this.sourceComponent = sourceComponent;

    /** @private {?Promise} */
    this.renderTemplatePromise_ = null;
  }

  /**
   * Whether the viewer can render templates.
   * @return {boolean}
   */
  isSupported() {
    return this.viewer_.canRenderTemplates();
  }

  /**
   * Proxies xhr and template rendering to the viewer and renders
   * the response.
   * @param {!Element} element
   *     viewer to determine the component responsible for proxying the
   *     request.
   * @param {?function():Promise<?>} onSuccess
   * @param {?function():Promise<?>} onFailure
   * return {!Promise}
   */
  fetchAndRenderTemplate(
    element,
    onSuccess,
    onFailure) {
    const inputsAsJson = this.getElementInputsAsJson_(element);
    const elementAttrsAsJson =
        this.getElementAttributesAsJson_(this.sourceComponent, element);
    elementAttrsAsJson.inputData = inputsAsJson;
    const mustacheTemplate = this.xmls_.serializeToString(
        this.templates_.findTemplate(element));
    let p = null;
    return this.viewer_.sendMessageAwaitResponse(
        Capability.VIEWER_RENDER_TEMPLATE,
        {
          data: elementAttrsAsJson,
          mustacheTemplate,
          'sourceAmpComponent': this.sourceComponent,
        })
        .then(resp => {
          if (onSuccess) {
            onSuccess(resp).then(() => {
              p = this.templates_.findAndRenderTemplate(
                  element, resp.renderedHtml);
              if (getMode().test) {
                this.renderTemplatePromise_ = p;
              }
            });
          } else {
            return resp;
          }
        }, errorResponseJson => {
          if (onFailure) {
            onFailure(errorResponseJson).then(() => {
              p = this.templates_.findAndRenderTemplate(
                  element, errorResponseJson || {});
              if (getMode().test) {
                this.renderTemplatePromise_ = p;
              }
            });
          } else {
            return errorResponseJson;
          }
        });
  }

  /**
   * Returns a promise that resolves when tempalte render finishes. The promise
   * will be null if the template render has not started.
   * @visibleForTesting
   */
  renderTemplatePromiseForTesting() {
    return this.renderTemplatePromise_;
  }

  /**
   * Returns the element's contained inputs and values in json format.
   * @param {!HtmlElement} element
   * @return {!JsonObject}
   */
  getElementInputsAsJson_(element) {
    const inputs = element.querySelectorAll('input');
    const inputsAsJson = {};
    inputs.forEach(input => {
      inputsAsJson[input.name] = input.value;
    });
    return inputsAsJson;
  }

  /**
   * Returns the element's attributes in json format.
   * @param {string} sourceComponent
   * @param {!HtmlElement} element
   * @return {!JsonObject}
   */
  getElementAttributesAsJson_(sourceComponent, element) {
    const attrsAsJson = {};
    if (element.attributes) {
      const {attributes} = element;
      // Include commonly shared allowed attributes.
      const whiteList = ATTRS_TO_SEND_TO_VIEWER[sourceComponent]
          .concat('inputData', 'mustacheTemplate');
      for (let i = 0, len = attributes.length; i < len; i++) {
        const keyValue = attributes[i];
        if (whiteList.includes(keyValue.name)) {
          attrsAsJson[keyValue.name] = keyValue.value;
        }
      }
    }
    return attrsAsJson;
  }

}
