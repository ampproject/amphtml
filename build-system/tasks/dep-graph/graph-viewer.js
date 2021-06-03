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
 * @param filter
 */

function getEdges(filter) {
  return Array.from(document.querySelectorAll('.edge')).map((el) => {
    const [title, edge, arrow] = el.children;
    const [src, dest] = title.textContent.trim().split('->');
    return {edge, arrow, src, dest};
  });
}

function applyColorToEdge(color, {edge, arrow}) {
  edge.style.stroke = color;
  arrow.style.fill = color;
  arrow.style.stroke = color;
}

// Dependency predicates for coloring
function isDepOnSrcRoot({dest}) {
  return /^src(\/[^/]+\.js)?$/.test(dest);
}
function isSubmoduleImport({src, dest}) {
  const srcDir = src.split('/').slice(0, -1).join('/');
  return dest.startsWith(`${srcDir}/`);
}
function isCoreImport({dest}) {
  return dest.startsWith('src/core/');
}
function is3pImport({dest}) {
  return dest.startsWith('third_party/') || dest.startsWith('node_modules/');
}

const edgeColors = new Map([
  // ['#006', isSubmoduleImport],
  // ['#066', is3pImport],
  // ['#F00', isDepOnSrcRoot],
]);

function applyColors() {
  const edges = getEdges();
  edgeColors.forEach((predicate, color) => {
    edges.filter(predicate).map(applyColorToEdge.bind(null, color));
  });
}
