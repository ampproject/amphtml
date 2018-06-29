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

    /** @const @private {boolean} */
    this.viewerCanRenderTemplate_ = this.viewer_.canRenderTemplates();
  }

  /**
   * Whether the viewer can render templates.
   * @return {boolean}
   */
  isSupported() {
    return this.viewerCanRenderTemplate_;
  }

  /**
   * Proxies xhr and template rendering to the viewer and renders
   * the response.
   * @param {!Element} element
   *     viewer to determine the component responsible for proxying the
   *     request.
   * @param {?function():Promise<?>} renderTemplateSuccessCallback
   * @param {?function():Promise<?>} renderTemplateFailureCallback
   * return {!Promise}
   */
  fetchAndRenderTemplate(
    element,
    renderTemplateSuccessCallback,
    renderTemplateFailureCallback) {
    const inputsAsJson = this.getElementInputsAsJson_(element);
    const elementAttrsAsJson = this.getElementAttributesAsJson_(element);
    elementAttrsAsJson.inputData = inputsAsJson;
    const mustacheTemplate = this.xmls_.serializeToString(
        this.templates_.findTemplate(element));
    return this.viewer_.sendMessageAwaitResponse(
        Capability.VIEWER_RENDER_TEMPLATE,
        {
          data: elementAttrsAsJson,
          mustacheTemplate,
          'sourceAmpComponent': this.sourceComponent,
        })
        .then(resp => {
          if (renderTemplateSuccessCallback) {
            renderTemplateSuccessCallback()
                .then(() => {
                  this.templates_.findAndRenderTemplate(
                      element, resp.renderedHtml);
                });
          } else {
            return resp;
          }
        }, errorResponseJson => {
          if (renderTemplateFailureCallback) {
            renderTemplateFailureCallback()
                .then(() => {
                  this.templates_.findAndRenderTemplate(
                      element, errorResponseJson || {});
                });
          } else {
            return errorResponseJson;
          }
        });
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
   * @param {!HtmlElement} element
   * @return {!JsonObject}
   */
  getElementAttributesAsJson_(element) {
    const attrsAsJson = {};
    if (element.attributes) {
      const {attributes} = element;
      for (let i = 0, len = attributes.length; i < len; i++) {
        const keyValue = attributes[i];
        attrsAsJson[keyValue.name] = keyValue.value;
      }
    }
    return attrsAsJson;
  }

}
