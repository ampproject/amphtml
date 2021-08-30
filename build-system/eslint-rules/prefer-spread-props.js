'use strict';

// This warns when using Object.assign where an object spread is better. Note
// that using Object.assign to mutate an already existing object is still
// allowed.
//
// Good:
// ```
// const foo = {...obj};
// const bar = {foo: 1, ...obj};
// const baz = Object.assign(someObject, obj);
// ```
//
// Bad:
// ```
// const foo = Object.assign({}, obj);
// const bar = Object.assign({foo: 1}, obj);
// ```
module.exports = {
  meta: {
    fixable: 'code',
  },

  create(context) {
    const sourceCode = context.getSourceCode();

    return {
      'CallExpression[callee.object.name="Object"][callee.property.name="assign"]':
        function (node) {
          const args = node.arguments;
          if (args.length <= 1) {
            return;
          }

          const first = args[0];
          if (first.type !== 'ObjectExpression') {
            return;
          }
          for (const arg of args) {
            if (arg.type === 'SpreadElement') {
              return;
            }
          }

          context.report({
            node,
            message: 'Prefer using object literals with spread property syntax',

            fix(fixer) {
              const texts = args.map((arg) => `...${sourceCode.getText(arg)}`);
              if (first.properties.length === 0) {
                texts.shift();
              }

              return fixer.replaceText(node, `({${texts.join(',')}})`);
            },
          });
        },
    };
  },
};
