'use strict';

// We need a full database of possible Chai assertions to figure out what to
// lint for.
const chai = require('chai');
chai.use(require('chai-as-promised'));
chai.use(require('sinon-chai'));
chai.Assertion.addMethod('attribute');
chai.Assertion.addMethod('class');
chai.Assertion.addMethod('display');
chai.Assertion.addMethod('jsonEqual');
chai.Assertion.addProperty('visible');
chai.Assertion.addProperty('hidden');

const methods = [
  ...Object.entries(Object.getOwnPropertyDescriptors(chai.Assertion.prototype)),
]
  // We're looking for method assertions, which are defined as real methods on the prototype.
  // Property assertions (like `expect().to.be.ok`) are defined as getters.
  .filter(([, desc]) => !!desc.value)
  .map(([key]) => key);

// Langauge chains don't actually assert anything, they're just there to make
// sentences out of the tests.
// https://github.com/chaijs/chai/blob/41ff363e26021433ae7e713b14c8f68fafc1c936/lib/chai/core/assertions.js#L13-L48
const chaiLanguageChains = [
  'to',
  'be',
  'been',
  'is',
  'that',
  'which',
  'and',
  'has',
  'have',
  'with',
  'at',
  'of',
  'same',
  'but',
  'does',
  'still',

  // Should isn't actually a language chain, but the start of the chain.
  'should',
];

// Finds Chai method assertions that are not invoked, and fixes them.
//
// Good:
// expect(() => {}).not.to.throw();
//
// Bad:
// expect(() => {}).not.to.throw;
module.exports = {
  meta: {
    fixable: 'code',
  },

  create(context) {
    // We have to look for both `expect()` and `.should` assertion forms.
    // This will find `expect().to.be.METHOD` and `expect().to.be.METHOD()`.
    const methodMembers = methods.map(
      (prop) => `MemberExpression[property.name=${prop}]`
    );
    const languageMembers = chaiLanguageChains.map(
      (prop) => `MemberExpression[property.name=${prop}]`
    );
    const selector = `
        :matches(${methodMembers}) :matches(
          CallExpression[callee.name=expect],
          ${languageMembers}
        )
      `
      .replace(/\s+/g, ' ')
      .trim();

    return {
      [selector](node) {
        const ancestors = context.getAncestors().slice().reverse();
        let ancestor = node;
        let last = node;
        let found = 0;
        let index = 0;
        let method;

        // The matched node is the `expect()` call. We then traverse upwards
        // until we leave the chain. In our example, we'd traverse:
        // 1. expect().to
        // 2. expect().to.be
        // 3. expect().to.be.METHOD
        // 4. expect().to.be.METHOD()
        //
        // We're trying to figure out if we actually find the METHOD in the
        // current chain (we could have found a `expect(() => {
        // expect().something }).to.be.METHOD()`), and what the topmost node is
        // before breaking out of the chain.
        for (; index < ancestors.length; index++) {
          last = ancestor;
          ancestor = ancestors[index];

          if (ancestor.type === 'MemberExpression') {
            const {name} = ancestor.property;
            if (ancestor.object === last) {
              if (method || chaiLanguageChains.includes(name)) {
                break;
              }

              if (methods.includes(name)) {
                if (index < ancestors.length - 2) {
                  const parent = ancestors[index + 1];
                  if (
                    parent.type === 'CallExpression' &&
                    parent.callee === ancestor
                  ) {
                    continue;
                  }
                }
                method = name;
                found = index;
              }

              continue;
            }
          }

          if (ancestor.type === 'CallExpression' && ancestor.callee === last) {
            continue;
          }

          break;
        }

        // If the topmost node is a CallExpression, then the dev properly used
        // the assertion.
        if (last.type === 'CallExpression') {
          return;
        }

        if (!method) {
          return;
        }

        if (found < index - 1) {
          return;
        }

        context.report({
          node,
          message: [
            `Chai assertion method "${method}" must be called!`,
            `Do \`expect(foo).to.${method}();\` instead of \`expect(foo).to.${method};\``,
            `(Confusingly, Chai doesn't invoke every assertion as a property getter)`,
          ].join('\n\t'),

          fix(fixer) {
            return fixer.insertTextAfter(last, '()');
          },
        });
      },
    };
  },
};
