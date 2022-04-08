const {dirname, join, posix, relative, sep} = require('path');

const urlsImportSource = join(process.cwd(), 'src', 'config', 'urls');
const urlsReference = 'self.AMP.config.urls';

const getModeFilename = join(process.cwd(), 'src', 'mode.js');
const getModeFunction = `function getMode(win) {
  return (win || self).__AMP_MODE;
}`;

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
  const buildUrlsDeclarator = template.statement(
    `const name = /* #__PURE__ */ (() => ${urlsReference})()`,
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
          importSourceRelative = relativeModule(filename, urlsImportSource);
        },
      },
      FunctionDeclaration(path, state) {
        const {filename} = state;
        if (filename === getModeFilename) {
          if (t.isIdentifier(path.node.id, {name: 'getMode'})) {
            path.replaceWithSourceString(getModeFunction);
          }
        }
      },
      ImportDeclaration(path) {
        return;
        //
        //
        //
        //

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
          path.replaceWith(buildUrlsDeclarator({name}));
        }
      },
    },
  };
};
