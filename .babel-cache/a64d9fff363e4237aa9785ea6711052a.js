/**
 * Copyright 2017 The AMP HTML Authors. All Rights Reserved.
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
import { LocalizedStringId } from "../../../src/service/localization/strings"; // eslint-disable-line no-unused-vars
import { createElementWithAttributes } from "../../../src/core/dom";
import { devAssert } from "../../../src/log";
import { getLocalizationService } from "./amp-story-localization-service";
import { hasOwn } from "../../../src/core/types/object";
import { isArray } from "../../../src/core/types";

/**
 * @typedef {{
 *   tag: string,
 *   attrs: (!JsonObject|undefined),
 *   localizedStringId: (!LocalizedStringId|undefined),
 *   unlocalizedString: (string|undefined),
 *   localizedLabelId: (!LocalizedStringId|undefined),
 *   children: (!Array<!ElementDef>|undefined),
 * }}
 */
export var ElementDef;

/**
 * @param {!Document} doc
 * @param {!ElementDef|!Array<!ElementDef>} elementsDef
 * @return {!Node}
 */
export function renderSimpleTemplate(doc, elementsDef) {
  if (isArray(elementsDef)) {
    return renderMulti(doc, /** @type {!Array<!ElementDef>} */(elementsDef));
  }
  return renderSingle(doc, /** @type {!ElementDef} */(elementsDef));
}

/**
 * @param {!Document} doc
 * @param {!ElementDef} elementDef
 * @return {!Element}
 */
export function renderAsElement(doc, elementDef) {
  return renderSingle(doc, elementDef);
}

/**
 * @param {!Document} doc
 * @param {!Array<!ElementDef>} elementsDef
 * @return {!Node}
 */
function renderMulti(doc, elementsDef) {
  var fragment = doc.createDocumentFragment();
  elementsDef.forEach(function (elementDef) {return (
      fragment.appendChild(renderSingle(doc, elementDef)));});

  return fragment;
}

/**
 * @param {!Document} doc
 * @param {!ElementDef} elementDef
 * @return {!Element}
 */
function renderSingle(doc, elementDef) {
  var el = hasOwn(elementDef, 'attrs') ?
  createElementWithAttributes(
  doc,
  elementDef.tag,
  /** @type {!JsonObject} */(elementDef.attrs)) :

  doc.createElement(elementDef.tag);

  var hasLocalizedTextContent = hasOwn(elementDef, 'localizedStringId');
  var hasLocalizedLabel = hasOwn(elementDef, 'localizedLabelId');
  if (hasLocalizedTextContent || hasLocalizedLabel) {
    var localizationService = getLocalizationService(devAssert(doc.body));
    devAssert(localizationService);

    if (hasLocalizedTextContent) {
      el.textContent = localizationService.getLocalizedString(
      /** @type {!LocalizedStringId} */(elementDef.localizedStringId));

    }

    if (hasLocalizedLabel) {
      var labelString = localizationService.getLocalizedString(
      /** @type {!LocalizedStringId} */(elementDef.localizedLabelId));

      if (labelString) {
        el.setAttribute('aria-label', labelString);
      }
    }
  }

  if (hasOwn(elementDef, 'unlocalizedString')) {
    el.textContent = elementDef.unlocalizedString;
  }

  if (hasOwn(elementDef, 'children')) {
    el.appendChild(
    renderMulti(doc, /** @type {!Array<!ElementDef>} */(elementDef.children)));

  }

  return el;
}
// /Users/mszylkowski/src/amphtml/extensions/amp-story/1.0/simple-template.js