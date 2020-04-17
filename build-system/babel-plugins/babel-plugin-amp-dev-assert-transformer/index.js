/**
 * Copyright 2020 The AMP HTML Authors. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS-IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * Is a MemberExpression "thenable", `foo().then(() => {});`
 *
 * @param {babel.MemberExpression} memberExpression
 * @return {boolean}
 */
function isThenable(memberExpression) {
  return memberExpression.get('property').isIdentifier({name: 'then'});
}

/**
 * Does a MemberExpression have a inner CallExpression? Return it.
 *
 * @param {babel.MemberExpression} memberExpression
 * @return {undefined | babel.CallExpression}
 */
function getMatchingInnerCallExpression(memberExpression) {
  const memberObject = memberExpression.get('object');

  if (
    memberObject.isCallExpression() &&
    memberObject.get('callee').isIdentifier({name: 'devAssert'})
  ) {
    return memberObject;
  }

  return undefined;
}

/**
 * Extend babel's path.evaluate with extra confidence for very specific scenarios in this transform.
 *
 * @param {babel.CallExpression} callExpression
 * @return {babel.Evaluation}
 */
function evaluateDevAssert(callExpression) {
  const argument = callExpression.get('arguments.0');
  if (argument.isMemberExpression()) {
    return {confident: true};
  }
  if (argument.isStringLiteral()) {
    return {confident: true, value: argument.node.value};
  }

  return argument.evaluate();
}

module.exports = function ({types: t}) {
  /**
   * Given a potentially literal value, attempt to create a babel AST Literal Node for it.
   *
   * @param {*} value to try and create a babel literal for.
   * @return {undefined | babel.NumericLiteral | babel.StringLiteral | babel.BooleanLiteral} value
   */
  function usableEvaluateValue(value) {
    switch (typeof value) {
      case 'number':
        return t.numericLiteral(value);
      case 'string':
        return t.stringLiteral(value);
      case 'boolean':
        return t.booleanLiteral(value);
      case 'object':
        if (String(value) === 'null') {
          return t.nullLiteral();
        }
        return undefined;
      default:
        return undefined;
    }
  }

  /**
   * Given a wrapping CallExpression and inner MemberExpression.
   * Attempt to find and replace the contents of a CallExpression inside the MemberExpression.
   *
   * @param {babel.CallExpression} callExpression
   * @param {babel.MemberExpression} memberExpression
   * @return {boolean}
   */
  function handleInnerMemberExpression(callExpression, memberExpression) {
    const innerCallExpression = getMatchingInnerCallExpression(
      memberExpression
    );
    if (innerCallExpression) {
      const evalutedDevAssert = evaluateDevAssert(innerCallExpression);
      if (!evalutedDevAssert.confident) {
        return;
      }

      // MemberExpression has an inner CallExpression with a removable `devAssert`.
      if (isThenable(memberExpression)) {
        // MemberExpression is thenable, so removing the `devAssert` means thenabling the first argument of `devAssert`.
        const newCallee = innerCallExpression.get('arguments.0');
        const newArguments = callExpression.get('arguments.0');
        const newCallExpression = t.callExpression(
          t.cloneDeep(newCallee.node),
          [t.cloneDeep(newArguments.node)]
        );

        callExpression.replaceWith(newCallExpression);
        return true;
      }

      return false;
    }

    return true;
  }

  return {
    visitor: {
      CallExpression(path) {
        const callee = path.get('callee');

        if (callee.isMemberExpression()) {
          handleInnerMemberExpression(path, callee);
          return;
        }

        if (callee.isIdentifier({name: 'devAssert'})) {
          const evaluatedDevAssert = evaluateDevAssert(path);

          if (
            evaluatedDevAssert.confident &&
            evaluatedDevAssert.value !== undefined
          ) {
            const replacement = usableEvaluateValue(evaluatedDevAssert.value);
            if (replacement !== undefined) {
              if (t.isExpressionStatement(path.parent)) {
                // When the direct parent of a `devAssert` is a ExpressionStatement, it can safely be removed.
                // This is only true when the replacement was statically analyseable.
                path.remove();
                return;
              }

              // Given the replacement can be statically analysed, replace the value with the static replacement.
              path.replaceWith(replacement);
              return;
            }
          }

          // In other conditions, simply remove the `devAssert()` wrapper and allow the first argument to exist.
          path.replaceWith(path.get('arguments.0'));
        }
      },
    },
  };
};
