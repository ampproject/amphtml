/**
 * Copyright 2021 The AMP HTML Authors. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS-IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * Ensures that extended `BaseElement` classes are named `BentoBaseElement`.
 * This causes `local/restrict-this-access` to match classes that extend from
 * `PreactBaseElement` indirectly.
 * @param {import('eslint').Rule.RuleContext} context
 * @return {import('eslint').Rule.RuleListener}
 */
function create(context) {
  const fromClassName = 'BaseElement';
  const toClassName = 'BentoBaseElement';
  return {
    [[
      `ClassDeclaration[superClass.name="${fromClassName}"]`,
      `ClassExpression[superClass.name="${fromClassName}"]`,
    ].join(',')]: function (node) {
      const {variableScope} = context.getScope();
      const variable = variableScope.set.get(node.superClass.name);
      if (!variable) {
        return;
      }
      const [def] = variable.defs;
      if (def?.type !== 'ImportBinding') {
        return;
      }
      if (!def.parent.source.value.startsWith('./base-element')) {
        return;
      }
      context.report({
        node,
        message: `Imported ${node.superClass.name} should be named ${toClassName}`,
        fix(fixer) {
          return [
            fixer.replaceText(node.superClass, toClassName),
            fixer.replaceText(
              def.node,
              `${def.node.imported.name} as ${toClassName}`
            ),
          ];
        },
      });
    },
  };
}

module.exports = {
  meta: {fixable: 'code'},
  create,
};
