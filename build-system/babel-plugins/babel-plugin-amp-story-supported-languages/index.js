const fastGlob = require('fast-glob');
const pathMod = require('path');
const LOCALES_DIR = 'extensions/amp-story/1.0/_locales/*.json';
const AMP_STORY_SUPPORTED_LANGUAGES = fastGlob.sync(LOCALES_DIR).map((x) => {
  return pathMod.basename(x, '.json');
});

/**
 * @interface {babel.PluginPass}
 * @param {babel} babel
 * @return {babel.PluginObj}
 */
module.exports = function ({types: t}) {
  return {
    name: 'amp-story-supported-languages',
    visitor: {
      ReferencedIdentifier(path) {
        if (path.get('name').node !== 'AMP_STORY_SUPPORTED_LANGUAGES') {
          return;
        }

        path.replaceWith(
          t.arrayExpression(
            AMP_STORY_SUPPORTED_LANGUAGES.map((x) => t.stringLiteral(x))
          )
        );
      },
    },
  };
};
