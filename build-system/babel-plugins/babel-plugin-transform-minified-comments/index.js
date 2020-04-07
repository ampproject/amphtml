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

// Ensure comments in minified build output is minimal.
module.exports = function () {
  return {
    visitor: {
      Statement(path) {
        const {node} = path;
        const {trailingComments} = node;
        if (!trailingComments || trailingComments.length <= 0) {
          return;
        }

        const next = path.getNextSibling();
        if (!next) {
          return;
        }

        node.trailingComments = null;
        const formattedComments = (trailingComments || []).map((comment) => ({
          ...comment,
          value: comment.value.replace(/\n +/g, `\n`),
        }));
        next.addComments('leading', formattedComments);
      },
    },
  };
};
