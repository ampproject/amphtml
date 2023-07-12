/**
 * @fileoverview This is a layer that lays its children out into a grid. Its
 * implementation is based off of the CSS Grid Spec.
 *
 * Example:
 * <code>
 * <amp-story-grid-layer template="fill">
 *   ...
 * </amp-story-grid-layer>
 * </code>
 */

import {scopedQuerySelectorAll} from '#core/dom/query';
import {
  assertDoesNotContainDisplay,
  setImportantStyles,
  setStyles,
} from '#core/dom/style';

import {AmpStoryBaseLayer} from './amp-story-base-layer';
import {isPrerenderActivePage} from './prerender-active-page';

/**
 * A mapping of attribute names we support for grid layers to the CSS Grid
 * properties they control.
 * @private @const {!{[key: string]: string}}
 */
const SUPPORTED_CSS_GRID_ATTRIBUTES = {
  'align-content': 'alignContent',
  'align-items': 'alignItems',
  'align-self': 'alignSelf',
  'grid-area': 'gridArea',
  'justify-content': 'justifyContent',
  'justify-items': 'justifyItems',
  'justify-self': 'justifySelf',
};

/**
 * Converts the keys of the SUPPORTED_CSS_GRID_ATTRIBUTES object above into a
 * selector for the specified attributes.
 * (e.g. [align-content], [align-items], ...)
 * @private @const {string}
 */
const SUPPORTED_CSS_GRID_ATTRIBUTES_SELECTOR = Object.keys(
  SUPPORTED_CSS_GRID_ATTRIBUTES
)
  .map((key) => `[${key}]`)
  .join(',');

/**
 * @typedef {{
 *  aspect-ratio: string,
 *  scaling-factor: ?float,
 * }}
 */
export let PresetDetails;

/**
 * Grid layer template templating system.
 */
export class AmpStoryGridLayer extends AmpStoryBaseLayer {
  /** @override  */
  static prerenderAllowed(element) {
    return isPrerenderActivePage(element.parentElement);
  }

  /** @override  */
  static previewAllowed() {
    return true;
  }

  /** @param {!AmpElement} element */
  constructor(element) {
    super(element);
  }

  /** @override */
  buildCallback() {
    super.buildCallback();
    this.applyAspectRatioAttributes_();
    this.setOwnCssGridStyles_();
    this.setDescendentCssGridStyles_();
  }

  /**
   * Grab the aspect-ratio attribute and apply to CSS variable as a fraction.
   * @private
   */
  applyAspectRatioAttributes_() {
    if (!this.element.hasAttribute('aspect-ratio')) {
      return;
    }
    setImportantStyles(this.element, {
      '--aspect-ratio': this.element
        .getAttribute('aspect-ratio')
        .replace(':', '/'),
    });
  }

  /**
   * Copies the allowlisted CSS grid styles for descendants of the
   * <amp-story-grid-layer> element.
   * @private
   */
  setDescendentCssGridStyles_() {
    const elementsToUpgradeStyles = scopedQuerySelectorAll(
      this.element,
      SUPPORTED_CSS_GRID_ATTRIBUTES_SELECTOR
    );

    elementsToUpgradeStyles.forEach((element) => {
      this.setCssGridStyles_(element);
    });
  }

  /**
   * Copies the allowlisted CSS grid styles for the <amp-story-grid-layer>
   * element itself.
   * @private
   */
  setOwnCssGridStyles_() {
    this.setCssGridStyles_(this.element);
  }

  /**
   * Copies the values of an element's attributes to its styles, if the
   * attributes/properties are in the allowlist.
   *
   * @param {!Element} element The element whose styles should be copied from
   *     its attributes.
   */
  setCssGridStyles_(element) {
    const styles = {};
    for (let i = element.attributes.length - 1; i >= 0; i--) {
      const attribute = element.attributes[i];
      const attributeName = attribute.name.toLowerCase();
      const propertyName = SUPPORTED_CSS_GRID_ATTRIBUTES[attributeName];
      if (propertyName) {
        styles[propertyName] = attribute.value;
        element.removeAttribute(attributeName);
      }
    }
    setStyles(element, assertDoesNotContainDisplay(styles));
  }
}
