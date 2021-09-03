const {
  assertAliases,
  definitionFile,
  singletonFunctions,
  transformableMethods,
} = require('../babel-plugins/log-module-metadata');

const selector = Object.keys(transformableMethods)
  .map((name) => `CallExpression[callee.property.name=${name}]`)
  .concat(assertAliases.map((name) => `CallExpression[callee.name=${name}]`))
  .join(',');

module.exports = {
  create(context) {
    return {
      [selector]: function (node) {
        // Don't evaluate or transform log.js
        if (context.getFilename().endsWith(definitionFile)) {
          return;
        }

        let methodInvokedName;

        // Make sure that callee is a CallExpression as well.

        const {callee} = node;

        // userAssert() and devAssert() aliases
        if (
          callee.type == 'Identifier' &&
          assertAliases.includes(callee.name)
        ) {
          methodInvokedName = 'assert';
        } else {
          // dev().assert() // enforce rule
          // dev.assert() // ignore
          const calleeObject = callee.object;
          if (!calleeObject || calleeObject.type !== 'CallExpression') {
            return;
          }

          // Make sure that the CallExpression is one of dev() or user().
          if (!singletonFunctions.includes(calleeObject.callee.name)) {
            return;
          }

          methodInvokedName = callee.property.name;
        }

        // Find the position of the argument we care about.
        const metadata = transformableMethods[methodInvokedName];

        // If there's no metadata, this is most likely a test file running
        // private methods on log.
        if (!metadata) {
          return;
        }

        const {messageArgPos} = metadata;

        const argToEval = node.arguments[messageArgPos];
        if (!argToEval || argToEval.type != 'ArrayExpression') {
          return;
        }

        const errMsg =
          `Don't pass an array to ${methodInvokedName}. ` +
          'Array syntax is to be used by compiled output only. ' +
          'Use variadic or sprintf (%s) syntax.';

        context.report({
          node: argToEval,
          message: errMsg,
        });
      },
    };
  },
};
