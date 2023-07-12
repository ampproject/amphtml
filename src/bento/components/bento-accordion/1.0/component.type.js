/** @externs */

/** @const */
var BentoAccordionDef = {};

/**
 * @typedef {{
 *   as: (string|PreactDef.FunctionalComponent|undefined),
 *   expandSingleSection: (boolean|undefined),
 *   animate: (boolean|undefined),
 *   id: (string|undefined),
 *   children: (?PreactDef.Renderable|undefined),
 * }}
 */
BentoAccordionDef.BentoAccordionProps;

/**
 * @typedef {{
 *   as: (string|PreactDef.FunctionalComponent|undefined),
 *   expanded: (boolean|undefined),
 *   animate: (boolean|undefined),
 *   id: (string|undefined),
 *   children: (?PreactDef.Renderable|undefined),
 *   onExpandStateChange: (function(boolean):undefined|undefined),
 * }}
 */
BentoAccordionDef.BentoAccordionSectionProps;

/**
 * @typedef {{
 *   as: (string|PreactDef.FunctionalComponent|undefined),
 *   role: (string|undefined),
 *   class: (string|undefined),
 *   tabindex: (number|string|undefined),
 *   tabIndex: (number|string|undefined),
 *   id: (string|undefined),
 *   children: (?PreactDef.Renderable|undefined),
 * }}
 * (We support tabindex and tabIndex equally, see tabindexFromProps())
 */
BentoAccordionDef.BentoAccordionHeaderProps;

/**
 * @typedef {{
 *   as: (string|PreactDef.FunctionalComponent|undefined),
 *   role: (string|undefined),
 *   class: (string|undefined),
 *   id: (string|undefined),
 *   children: (?PreactDef.Renderable|undefined),
 * }}
 */
BentoAccordionDef.BentoAccordionContentProps;

/**
 * This is not a public API, it exists to define properties for reference
 * that are used in the HeaderShim defined in amp-accordion
 * @typedef {{
 *   id: (string),
 *   role: (string),
 *   onClick: (function()|undefined),
 *   aria-controls: (string),
 *   aria-expanded: (string),
 *   children: (?PreactDef.Renderable|undefined),
 * }}
 */
BentoAccordionDef.HeaderShimProps;

/**
 * This is not a public API, it exists to define properties for reference
 * that are used in the ContentShim defined in amp-accordion
 * @typedef {{
 *   id: (string),
 *   role: (string),
 *   aria-labelledby: (string),
 *   children: (?PreactDef.Renderable|undefined),
 * }}
 */
BentoAccordionDef.ContentShimProps;

/**
 * @typedef {{
 *   registerSection: (function(string)|undefined),
 *   isExpanded: (function(string, boolean):boolean),
 *   toggleExpanded: (function(string)|undefined),
 *   animate: (boolean|undefined),
 *   prefix: (string),
 * }}
 */
BentoAccordionDef.AccordionContext;

/**
 * @typedef {{
 *   animate: (boolean),
 *   contentId: (string),
 *   headerId: (string),
 *   expanded: (boolean),
 *   expandHandler: (function()),
 *   setContentId: (function(string)),
 *   setHeaderId: (function(string)),
 * }}
 */
BentoAccordionDef.SectionContext;

/** @interface */
BentoAccordionDef.BentoAccordionApi = class {
  /**
   * @param {string|undefined} section
   */
  toggle(section) {}

  /**
   * @param {string|undefined} section
   */
  expand(section) {}

  /**
   * @param {string|undefined} section
   */
  collapse(section) {}
};
