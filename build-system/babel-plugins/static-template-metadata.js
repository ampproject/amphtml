/** Metadata for static template functions `htmlFor` and `svgFor`. */

/**
 * Maps of factory functions to enforced declared tag name.
 * @type {{[key: string]: string}}
 */
exports.staticTemplateFactories = {
  'htmlFor': 'html',
  'svgFor': 'svg',
};

/**
 * Names of tags, like `html` and `svg`.
 * @type {Set<string>}
 */
exports.staticTemplateTags = new Set(
  Object.values(exports.staticTemplateFactories)
);

/**
 * Names of tag factory functions, like `htmlFor` and `svgFor`.
 * @type {Set<string>}
 */
exports.staticTemplateFactoryFns = new Set(
  Object.keys(exports.staticTemplateFactories)
);
