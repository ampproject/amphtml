const {dirname, join, relative, resolve} = require('path').posix;

/**
 * Returns a new Map<string, {detected: boolean, removeable: Array<string>}
 * key is a valid callee name to potentially remove.
 * value.detected indicates if the callee name (key) was imported into the current module.
 * value.removeable is the array of property names that can be removed.
 * Example: ['dev', {detected: false, removeable: ['fine']}] would mean ... `dev().fine(...)` can be removed.
 * @return {Map<string, {detected: boolean, removeable: Array<string>}>}
 */
function defaultCalleeToPropertiesMap() {
  return new Map([
    [
      'dev',
      {
        detected: false,
        removeable: ['info', 'fine', 'warn'],
      },
    ],
    [
      'user',
      {
        detected: false,
        removeable: ['info', 'fine', 'warn'],
      },
    ],
  ]);
}

// This Babel Plugin removes
// - `dev().(info|fine|warn)(...)`
// - `user().(info|fine|warn)(...)`
// CallExpressions for production ESM builds.
module.exports = function () {
  let calleeToPropertiesMap = defaultCalleeToPropertiesMap();
  let parseCallExpressions = false;
  return {
    visitor: {
      Program: {
        exit() {
          // After each program exits, return the values per module back to false.
          // Otherwise, once changed to true... all future modules will remove these call expressions.
          calleeToPropertiesMap = defaultCalleeToPropertiesMap();
          parseCallExpressions = false;
        },
      },
      ImportDeclaration({node}, state) {
        // Only remove the CallExpressions if this module imported the correct method ('dev') from '/log'.
        const {source, specifiers} = node;
        if (!source.value.endsWith('/log')) {
          return;
        }
        specifiers.forEach((specifier) => {
          if (specifier.imported) {
            const filepath = relative(
              join(__dirname, '../../../'),
              resolve(dirname(state.file.opts.filename), source.value)
            );

            if (filepath.endsWith('utils/log')) {
              const propertyMapped = calleeToPropertiesMap.get(
                specifier.imported.name
              );
              if (propertyMapped) {
                propertyMapped.detected = true;
                parseCallExpressions = true;
              }
            }
          }
        });
      },
      CallExpression(path) {
        if (!parseCallExpressions) {
          return;
        }

        const {node} = path;
        const {callee} = node;
        if (callee.type === 'MemberExpression') {
          const {object: obj, property} = callee;
          const {callee: memberCallee} = obj;
          if (memberCallee) {
            const propertyMapped = calleeToPropertiesMap.get(memberCallee.name);
            if (
              propertyMapped &&
              propertyMapped.detected &&
              propertyMapped.removeable.includes(property.name)
            ) {
              path.remove();
            }
          }
        }
      },
    },
  };
};
