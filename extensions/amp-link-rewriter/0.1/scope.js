import {closestAncestorElementBySelector} from '#core/dom/query';

/**
 *
 * @param {?../../../src/service/ampdoc-impl.AmpDoc} ampDoc
 * @param {!Object} configOpts
 * @return {!Array<!Element>}
 */
export function getScopeElements(ampDoc, configOpts) {
  const doc = ampDoc.getRootNode();
  let cssSelector = configOpts.section.join(' a, ');
  let selection = doc.querySelectorAll('a');
  const filteredSelection = [];

  if (configOpts.section.length !== 0) {
    cssSelector = cssSelector + ' a';
    selection = doc.querySelectorAll(cssSelector);
  }

  selection.forEach((element) => {
    if (hasAttributeValues(element, configOpts)) {
      filteredSelection.push(element);
    }
  });

  return filteredSelection;
}

/**
 * @param {!Node} htmlElement
 * @param {?Object} configOpts
 * @return {boolean}
 */
export function isElementInScope(htmlElement, configOpts) {
  return (
    !!hasAttributeValues(htmlElement, configOpts) &&
    isBelongsToContainer(htmlElement, configOpts)
  );
}

/**
 * Check if the element has a parent container specified in config.
 *
 * @param {!Node} htmlElement
 * @param {!Object} configOpts
 * @return {boolean}
 */
function isBelongsToContainer(htmlElement, configOpts) {
  if (configOpts.section.length === 0) {
    return true;
  }

  return !!closestAncestorElementBySelector(
    htmlElement,
    configOpts.section.join(',')
  );
}

/**
 * Match attributes of the anchor if have been defined in config
 * compare every attribute defined in config as regex with its
 * corresponding value of the anchor element attribute
 * @param {!Node} htmlElement
 * @param {!Object} configOpts
 * @return {*} TODO(#23582): Specify return type
 */
function hasAttributeValues(htmlElement, configOpts) {
  const anchorAttr = configOpts.attribute;
  const attrKeys = Object.keys(anchorAttr);

  return attrKeys.every((key) => {
    const reg = new RegExp(anchorAttr[key]);

    return reg.test(htmlElement.getAttribute(key));
  });
}
