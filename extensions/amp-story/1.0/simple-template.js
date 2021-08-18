
import {LocalizedStringId} from '#service/localization/strings'; // eslint-disable-line no-unused-vars
import {createElementWithAttributes} from '#core/dom';
import {devAssert} from '../../../src/log';
import {getLocalizationService} from './amp-story-localization-service';
import {hasOwn} from '#core/types/object';
import {isArray} from '#core/types';

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
