const {addNamed} = require('@babel/helper-module-imports');
const {dirname, relative} = require('path');

const importSource = `${process.cwd()}/src/config/urls`;

/**
 * @param {import('@babel/core')} babel
 * @return {import('@babel/core').PluginObj}
 */
module.exports = function (babel) {
  let importSourceRelative;
  const {template, types: t} = babel;
  const buildNamespace = template(
    `const NAMESPACE = /* #__PURE__ */ GETTER()`,
    {preserveComments: true}
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
          importSourceRelative = relative(dirname(filename), importSource);
        },
      },
      ImportDeclaration(path) {
        const {source} = path.node;
        if (!t.isStringLiteral(source, {value: importSourceRelative})) {
          return;
        }
        let getter;
        for (const specifier of path.get('specifiers')) {
          if (!specifier.isImportNamespaceSpecifier()) {
            throw specifier.buildCodeFrameError(
              `Unresolvable specifier. You must import \`urls\` as a namespace:\n` +
                `\`import * as urls from '${source.value}';\``
            );
          }
          getter ??= addNamed(
            path,
            'ampConfigUrlsDoNotImportMeUseConfigUrlsInstead',
            '#core/amp-config-urls'
          );
          const namespace = specifier.node.local.name;
          path.insertAfter(
            buildNamespace({
              NAMESPACE: namespace,
              GETTER: getter.name,
            })
          );
        }
        path.remove();
      },
    },
  };
};
