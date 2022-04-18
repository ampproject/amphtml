const fastGlob = require('fast-glob');
const pathMod = require('path');
const LOCALES_DIR = 'extensions/amp-story/1.0/_locales/*.json';
const AMP_STORY_SUPPORTED_LANGUAGES = fastGlob.sync(LOCALES_DIR).map((x) => {
  return pathMod.basename(x, '.json');
});

/**
 * @fileoverview
 * We need to ensure that the language files we request from the Google AMP
 * cache is supported on the client before making the request. To do this
 * we embed the supported list of language codes through this symbol
 * replacement which can be used anywhere in the codebase.
 */

/**
 * @interface {babel.PluginPass}
 * @param {babel} babel
 * @return {babel.PluginObj}
 */
module.exports = function ({types: t}) {
  return {
    name: 'amp-story-supported-languages',
    visitor: {
      // Ignore 'ReferencedIdentifier' does not exist in type 'Visitor<PluginPass>'.
      // The tests prove that this type of visitor works with the current
      // version of babel we use.
      // @ts-ignore
      ReferencedIdentifier(path) {
        if (path.get('name').node !== 'AMP_STORY_SUPPORTED_LANGUAGES') {
          return;
        }

        path.replaceWith(t.valueToNode(AMP_STORY_SUPPORTED_LANGUAGES));
      },
    },
  };
};
