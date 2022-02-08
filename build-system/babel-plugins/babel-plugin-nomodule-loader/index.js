const {hasExports, isModule} = require('@babel/helper-module-transforms');
const {
  default: normalizeAndLoadMetadata,
} = require('@babel/helper-module-transforms/lib/normalize-and-load-metadata');
const {readFileSync} = require('fs');
const {join: pathJoin, posix, relative} = require('path');

let wrapperTemplate;

module.exports = function (babel) {
  const {template, types: t} = babel;

  const pathToModuleName = (filename) =>
    filename.replace(/^(\.\/)?dist\//, '').replace(/(\.max)?\.m?js$/, '');

  const resolveModuleName = (filename, source) =>
    pathToModuleName(posix.join(posix.dirname(filename), source));

  /**
   * @param {Object} replacements
   * @return {babel.Node}
   */
  function buildWrapper(replacements) {
    if (!wrapperTemplate) {
      const templateSource = readFileSync(
        pathJoin(__dirname, 'define-template.js'),
        'utf8'
      );
      wrapperTemplate = template(templateSource, {
        placeholderPattern: /^__[A-Z0-9_]+__$/,
      });
    }
    return wrapperTemplate(replacements);
  }

  /**
   * @param {babel.NodePath<import('@babel/types').Program>} path
   * @param {babel.Node} wrapper
   */
  function injectWrapper(path, wrapper) {
    const {body, directives} = path.node;
    path.node.directives = [];
    path.node.body = [];
    const wrapperPath = path.pushContainer('body', wrapper)[0];
    const callback = wrapperPath
      .get('expression.arguments')
      // @ts-ignore
      .filter((arg) => arg.isFunctionExpression())[0]
      .get('body');
    callback.pushContainer('directives', directives);
    callback.pushContainer('body', body);
  }

  return {
    name: 'nomodule-async',
    visitor: {
      Program: {
        exit(path, state) {
          if (!isModule(path)) {
            throw new Error();
          }
          const filename = relative(process.cwd(), state.filename);
          const meta = normalizeAndLoadMetadata(path, 'exports', {});
          const importNames = [];
          const callbackArgs = [];
          const metaHasExports = hasExports(meta);
          if (metaHasExports) {
            importNames.push(t.stringLiteral(''));
            callbackArgs.push(t.identifier(meta.exportName));
          }
          for (const [source, metadata] of meta.source) {
            importNames.push(
              t.stringLiteral(resolveModuleName(filename, source))
            );
            callbackArgs.push(t.identifier(metadata.name));
          }
          if (importNames.length < 1) {
            return;
          }
          injectWrapper(
            path,
            buildWrapper({
              __MODULE_NAME__: t.stringLiteral(pathToModuleName(filename)),
              __HAS_EXPORTS__: t.booleanLiteral(metaHasExports),
              __ONLY_EXPORTS__: t.booleanLiteral(
                metaHasExports && importNames.length === 1
              ),
              __IMPORT_NAMES__: t.arrayExpression(importNames),
              __SINGLE_IMPORT_NAME__:
                importNames.length === 1 && !metaHasExports
                  ? t.cloneNode(importNames[0])
                  : t.nullLiteral(),
              __CALLBACK_ARGS__: callbackArgs,
            })
          );
        },
      },
    },
  };
};
