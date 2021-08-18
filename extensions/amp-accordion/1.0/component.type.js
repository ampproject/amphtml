

/** @externs */

/** @const */
var AccordionDef = {};

/**
 * @typedef {{
 *   as: (string|PreactDef.FunctionalComponent|undefined),
 *   expandSingleSection: (boolean|undefined),
 *   animate: (boolean|undefined),
 *   id: (string|undefined),
 *   children: (?PreactDef.Renderable|undefined),
 * }}
 */
AccordionDef.AccordionProps;

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
AccordionDef.AccordionSectionProps;

/**
 * @typedef {{
 *   as: (string|PreactDef.FunctionalComponent|undefined),
 *   role: (string|undefined),
 *   className: (string|undefined),
 *   tabIndex: (number|string|undefined),
 *   id: (string|undefined),
 *   children: (?PreactDef.Renderable|undefined),
 * }}
 */
AccordionDef.AccordionHeaderProps;

/**
 * @typedef {{
 *   as: (string|PreactDef.FunctionalComponent|undefined),
 *   role: (string|undefined),
 *   className: (string|undefined),
 *   id: (string|undefined),
 *   children: (?PreactDef.Renderable|undefined),
 * }}
 */
AccordionDef.AccordionContentProps;

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
AccordionDef.HeaderShimProps;

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
AccordionDef.ContentShimProps;

/**
 * @typedef {{
 *   registerSection: (function(string)|undefined),
 *   isExpanded: (function(string, boolean):boolean),
 *   toggleExpanded: (function(string)|undefined),
 *   animate: (boolean|undefined),
 *   prefix: (string),
 * }}
 */
AccordionDef.AccordionContext;

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
AccordionDef.SectionContext;

/** @interface */
AccordionDef.AccordionApi = class {
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
