/**
 * Copyright 2018 The AMP HTML Authors. All Rights Reserved.
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

console.log(html`html ${foo}`);
console.log(html`html ${foo} another`);
console.log(html`html ${foo} another ${bar} thing`);
console.log(htmlFor(element)`htmlFor ${foo}`);
console.log(htmlFor(element)`html ${foo} another`);
console.log(htmlFor(element)`html ${foo} another ${bar} thing`);
console.log(svg`svg ${foo}`);
console.log(svg`svg ${foo} another`);
console.log(svg`svg ${foo} another ${bar} thing`);
console.log(svgFor(element)`svgFor ${foo}`);
console.log(svgFor(element)`svg ${foo} another`);
console.log(svgFor(element)`svg ${foo} another ${bar} thing`);
