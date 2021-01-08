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
import {LocalizedStringId} from '../../../src/localized-strings'; // eslint-disable-line no-unused-vars
import {createElementWithAttributes} from '../../../src/dom';
import {devAssert} from '../../../src/log';
import {getLocalizationService} from './amp-story-localization-service';
import {hasOwn} from '../../../src/utils/object';
import {isArray} from '../../../src/types';

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
export let ElementDef;

/**
 * @param {!Document} doc
 * @param {!ElementDef|!Array<!ElementDef>} elementsDef
 * @return {!Node}
 */
export function renderSimpleTemplate(doc, elementsDef) {
  if (isArray(elementsDef)) {
    return renderMulti(doc, /** @type {!Array<!ElementDef>} */ (elementsDef));
  }
  return renderSingle(doc, /** @type {!ElementDef} */ (elementsDef));
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
  const fragment = doc.createDocumentFragment();
  elementsDef.forEach((elementDef) =>
    fragment.appendChild(renderSingle(doc, elementDef))
  );
  return fragment;
}

/**
 * @param {!Document} doc
 * @param {!ElementDef} elementDef
 * @return {!Element}
 */
function renderSingle(doc, elementDef) {
  const el = hasOwn(elementDef, 'attrs')
    ? createElementWithAttributes(
        doc,
        elementDef.tag,
        /** @type {!JsonObject} */ (elementDef.attrs)
      )
    : doc.createElement(elementDef.tag);

  const hasLocalizedTextContent = hasOwn(elementDef, 'localizedStringId');
  const hasLocalizedLabel = hasOwn(elementDef, 'localizedLabelId');
  if (hasLocalizedTextContent || hasLocalizedLabel) {
    const localizationService = getLocalizationService(devAssert(doc.body));
    devAssert(localizationService, 'Could not retrieve LocalizationService.');

    if (hasLocalizedTextContent) {
      el.textContent = localizationService.getLocalizedString(
        /** @type {!LocalizedStringId} */ (elementDef.localizedStringId)
      );
    }

    if (hasLocalizedLabel) {
      const labelString = localizationService.getLocalizedString(
        /** @type {!LocalizedStringId} */ (elementDef.localizedLabelId)
      );
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
      renderMulti(doc, /** @type {!Array<!ElementDef>} */ (elementDef.children))
    );
  }

  return el;
}
