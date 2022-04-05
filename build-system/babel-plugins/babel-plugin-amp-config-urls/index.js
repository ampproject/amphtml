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
  const buildNamed = template(
    `const LOCAL = /* #__PURE__ */ GETTER('IMPORTED')`,
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
        if (
          !t.isStringLiteral(path.node.source, {value: importSourceRelative})
        ) {
          return;
        }
        const getter = addNamed(
          path,
          'ampConfigUrlsDoNotImportMeUseConfigUrlsInstead',
          '#core/amp-config-urls'
        );
        for (const specifier of path.get('specifiers')) {
          if (specifier.isImportNamespaceSpecifier()) {
            const namespace = specifier.node.local.name;
            path.insertAfter(
              buildNamespace({
                NAMESPACE: namespace,
                GETTER: getter,
              })
            );
          } else if (specifier.isImportSpecifier()) {
            const {imported, local} = specifier.node;
            path.insertAfter(
              buildNamed({
                LOCAL: local.name,
                IMPORTED: t.isIdentifier(imported)
                  ? imported.name
                  : imported.value,
                GETTER: getter,
              })
            );
          } else {
            throw specifier.buildCodeFrameError('Unresolvable specifier');
          }
        }
        path.remove();
      },
    },
  };
};
