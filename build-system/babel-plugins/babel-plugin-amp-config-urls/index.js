/**
 * @fileoverview
 * Replaces imports of `src/config/urls` into references to self.AMP.config.urls
 * This allows us to re-use the value defined by the runtime in extensions.
 * Binaries that don't depend on the runtime should not use this transform, so
 * that they can directly use the values from `src/config/urls`.
 */
const {dirname, join, posix, relative, sep} = require('path');

const importSource = join(process.cwd(), 'src', 'config', 'urls');
const reference = 'self.AMP.config.urls';

/**
 * @param {string} fromFilename
 * @param {string} toModule
 * @return {string}
 */
function relativeModule(fromFilename, toModule) {
  const resolved = relative(dirname(fromFilename), toModule);
  const resolvedPosix = resolved.split(sep).join(posix.sep);
  return resolvedPosix.startsWith('.') ? resolvedPosix : `./${resolvedPosix}`;
}

/**
 * @param {import('@babel/core')} babel
 * @return {import('@babel/core').PluginObj}
 */
module.exports = function (babel) {
  let importSourceRelative;
  const {template, types: t} = babel;
  const buildNamespace = template.statement(
    `const name = /* #__PURE__ */ (() => ${reference})()`,
    {preserveComments: true, placeholderPattern: /^name$/}
  );
  return {
    name: 'amp-config-urls',
    visitor: {
      Program: {
        enter(_, state) {
          const {filename} = state;
          if (!filename) {
            throw new Error(
              'babel-plugin-amp-config-urls must be called with a filename'
            );
          }
          importSourceRelative = relativeModule(filename, importSource);
        },
      },
      ImportDeclaration(path) {
        const {source} = path.node;
        if (!t.isStringLiteral(source, {value: importSourceRelative})) {
          return;
        }
        for (const specifier of path.get('specifiers')) {
          if (!specifier.isImportNamespaceSpecifier()) {
            throw specifier.buildCodeFrameError(
              `Unresolvable specifier. You must import \`urls\` as a namespace:\n` +
                `\`import * as urls from '${source.value}';\``
            );
          }
          const {name} = specifier.node.local;
          path.replaceWith(buildNamespace({name}));
        }
      },
    },
  };
};
