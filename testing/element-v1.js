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

import {BaseElement} from '../src/base-element';

/**
 * @type {!Array<{
 *   name: string,
 *   test: function(typeof BaseElement):boolean,
 * }>}
 */
const RULES = [
  {
    name: 'V1=true',
    test: (implClass) => implClass.V1() === true,
  },

  {
    name: 'If has getLayoutPriority, must also have getBuildPriority',
    test: (implClass) => {
      const hasLayoutPriority =
        implClass.prototype.getLayoutPriority !==
        BaseElement.prototype.getLayoutPriority;
      const hasBuildPriority =
        implClass.getBuildPriority !== BaseElement.getBuildPriority;
      return !hasLayoutPriority || hasBuildPriority;
    },
  },

  {
    name: 'If has preconnectCallback, must also have getPreconnects',
    test: (implClass) => {
      const hasPreconnectCallback =
        implClass.prototype.preconnectCallback !==
        BaseElement.prototype.preconnectCallback;
      const hasGetPreconnects =
        implClass.getPreconnects !== BaseElement.getPreconnects;
      return !hasPreconnectCallback || hasGetPreconnects;
    },
  },

  {
    name: 'If has layoutCallback, must also have ensureLoaded',
    test: (implClass) => {
      const hasLayoutCallback =
        implClass.prototype.layoutCallback !==
        BaseElement.prototype.layoutCallback;
      const hasEnsureLoaded =
        implClass.prototype.ensureLoaded !== BaseElement.prototype.ensureLoaded;
      return !hasLayoutCallback || hasEnsureLoaded;
    },
  },

  {
    name: 'Must not use getLayoutBox',
    test: (implClass) => {
      return !sourceIncludes(implClass, 'getLayoutBox');
    },
  },
  {
    name: 'Must not use getLayoutSize',
    test: (implClass) => {
      return !sourceIncludes(implClass, 'getLayoutSize');
    },
  },

  {
    name: 'Must not have renderOutsideViewport',
    test: (implClass) => {
      const hasCallback =
        implClass.prototype.renderOutsideViewport !==
        BaseElement.prototype.renderOutsideViewport;
      return !hasCallback;
    },
  },
  {
    name: 'Must not have idleRenderOutsideViewport',
    test: (implClass) => {
      const hasCallback =
        implClass.prototype.idleRenderOutsideViewport !==
        BaseElement.prototype.idleRenderOutsideViewport;
      return !hasCallback;
    },
  },
  {
    name: 'Must not have isRelayoutNeeded',
    test: (implClass) => {
      const hasCallback =
        implClass.prototype.isRelayoutNeeded !==
        BaseElement.prototype.isRelayoutNeeded;
      return !hasCallback;
    },
  },
];

/**
 * @param {typeof BaseElement} implClass
 * @param {{
 *   exceptions: (!Array<string>|undefined),
 * }=} options
 */
export function testElementV1(implClass, options = {}) {
  const exceptions = options.exceptions || [];
  RULES.forEach(({name, test}) => {
    if (exceptions.includes(name)) {
      expect(test(implClass), 'unused exception: ' + name).to.be.false;
    } else {
      expect(test(implClass), name).to.be.true;
    }
  });
}

/**
 * Returns `true` if the class's source contains the given substring.
 *
 * @param {typeof BaseElement} implClass
 * @param {string} substring
 * @return {boolean}
 */
function sourceIncludes(implClass, substring) {
  const code = [];
  code.push(implClass.toString());
  const classProps = Object.getOwnPropertyDescriptors(implClass);
  for (const k in classProps) {
    const desc = classProps[k];
    if (typeof desc.value == 'function') {
      code.push(desc.value.toString());
    }
  }
  const protoProps = Object.getOwnPropertyDescriptors(implClass.prototype);
  for (const k in protoProps) {
    const desc = protoProps[k];
    if (typeof desc.value == 'function') {
      code.push(desc.value.toString());
    }
  }
  return code.filter((code) => code.includes(substring)).length > 0;
}
