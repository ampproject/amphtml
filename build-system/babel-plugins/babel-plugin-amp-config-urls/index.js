const {addNamed} = require('@babel/helper-module-imports');

/**
 * @param {import('@babel/core')} babel
 * @return {import('@babel/core').PluginObj}
 */
module.exports = function (babel) {
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
      ImportDeclaration(path) {
        if (
          !t.isStringLiteral(path.node.source) ||
          // TODO: real path
          !path.node.source.value.endsWith('/config/urls')
        ) {
          return;
        }
        let named = [];
        let namespace;
        for (const specifier of path.node.specifiers) {
          if (t.isImportNamespaceSpecifier(specifier)) {
            namespace = specifier.local.name;
          } else if (t.isImportSpecifier(specifier)) {
            named = named || [];
            named.push(specifier);
          }
        }
        if (!namespace && !named.length) {
          return;
        }
        const getter = addNamed(
          path,
          'ampConfigUrlsDoNotImportMeUseConfigUrlsInstead',
          '#core/amp-config-urls'
        );
        if (namespace) {
          path.insertAfter(
            buildNamespace({
              NAMESPACE: namespace,
              GETTER: getter,
            })
          );
        }
        for (const {imported, local} of named) {
          path.insertAfter(
            buildNamed({
              LOCAL: local.name,
              IMPORTED: imported.name,
              GETTER: getter,
            })
          );
        }
        path.remove();
      },
    },
  };
};
