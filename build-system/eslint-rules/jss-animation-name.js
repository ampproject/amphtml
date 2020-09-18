/**
 * Copyright 2020 The AMP HTML Authors. All Rights Reserved.
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
'use strict';

/**
 * Prevents animation/animationName from using global names. They should
 * always be scoped with $.
 *
 * Bad:
 *   const JSS = {
 *     foo: {animationName: 'bar-global'},
 *     foo: {animation: '0.5s bar-global infinite'},
 *   };
 * Good:
 *   const JSS = {
 *     foo: {animationName: '$bar-local'},
 *     foo: {animation: '0.5s $bar-local infinite'},
 *   };
 * @return {!Object}
 */
module.exports = function (context) {
  return {
    Property(node) {
      if (!/\.jss.js$/.test(context.getFilename())) {
        return;
      }
      // Could be {key: val} identifier or {'key': val} string
      const keyName = node.key.name || node.key.value;
      const isAnimation = keyName === 'animation';
      const isAnimationName =
        keyName === 'animationName' || keyName === 'animation-name';
      if (!isAnimationName && !isAnimation) {
        return;
      }
      if (typeof node.value.value !== 'string') {
        context.report({
          node: node.value,
          message:
            `Use string literals for ${keyName} values.` +
            (isAnimation
              ? '\n(animation-* properties other than animation-name are exempt from this rule.)'
              : ''),
        });
        return;
      }
      if (
        (isAnimationName && !/^\$/.test(node.value.value)) ||
        (isAnimation && !/(^| )\$/.test(node.value.value))
      ) {
        context.report({
          node: node.value,
          message: `The animation name in property ${keyName} should start with $${
            isAnimationName ? ` (e.g. $${node.value.value})` : ''
          }.\nThis scopes it to a @keyframes rule present in this module.`,
        });
      }
    },
  };
};
