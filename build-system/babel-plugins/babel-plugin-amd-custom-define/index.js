const {readFileSync} = require('fs');
const {join: pathJoin, relative} = require('path');

const pathToModuleName = (filename) =>
  filename.replace(/^(\.\/)?dist\//, '').replace(/(\.max)?\.m?js$/, '');

let defineTemplate;

module.exports = function (babel) {
  const {types: t} = babel;

  /** @return {string} */
  function getTemplate() {
    if (!defineTemplate) {
      defineTemplate = readFileSync(
        pathJoin(__dirname, 'define-template.js'),
        'utf8'
      );
    }
    return defineTemplate;
  }

  return {
    name: 'amd-custom-define',
    visitor: {
      CallExpression(path, state) {
        const callee = path.get('callee');
        if (!callee.isIdentifier({name: 'define'})) {
          return;
        }
        const [deps] = path.node.arguments;
        if (!t.isArrayExpression(deps)) {
          return;
        }
        const filename = relative(process.cwd(), state.filename);
        for (const dep of deps.elements) {
          if (dep.value !== 'exports') {
            dep.value = pathToModuleName(dep.value);
          }
        }
        const template = getTemplate();
        path.replaceWith(
          babel.template(template, {
            placeholderPattern: /^__[A-Z0-9_]+__$/,
          })({
            __ARGS__: path.node.arguments,
            __MODULE_NAME__: `'${pathToModuleName(filename)}'`,
            __ONLY_DEP__:
              deps.elements.length === 1
                ? `'${deps.elements[0].value}'`
                : 'null',
            __HAS_EXPORTS__: String(deps.elements[0]?.value === 'exports'),
          })
        );
      },
    },
  };
};
