import {polarToCartesian} from '../../../src/utils/math';

/**
 * Copyright 2019 The AMP HTML Authors. All Rights Reserved.
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
 * The number of frames to generate for each part of the animation. This and
 * svgSize correspond to the translate values for the animation in the CSS.
 */
const steps = 30;

/**
 * The width/height of the SVG''s viewbox. This and steps correspond to the
 * translate values for the animation in the CSS.
 */
const svgSize = 48;

/**
 * The radius for the spinner.
 */
const radius = 22;

/**
 * @param {number} x The x coordinate of the center of a circle.
 * @param {number} y The y coordinate of the center of a circle.
 * @param {number} radius The radius of a circle.
 * @param {number} startAngle The starting angle for the arc.
 * @param {number} endAngle The ending angle for the arc.
 * @return {string} The path for the arc.
 */
function getCircleArcPath(x, y, radius, startAngle, endAngle) {
  const start = polarToCartesian(x, y, radius, endAngle);
  const end = polarToCartesian(x, y, radius, startAngle);
  const deltaX = end.x - start.x;
  const deltaY = end.y - start.y;

  const largeArcFlag =
    endAngle > startAngle != Math.abs(endAngle - startAngle) <= 180 ? 1 : 0;

  return getArcPathCommands(
    start.x,
    start.y,
    radius,
    largeArcFlag,
    deltaX,
    deltaY
  );
}

/**
 * @param {number} x The start x position.
 * @param {number} y The start y position.
 * @param {number} r The x/y radius of the arc.
 * @param {number} l The large arc flag.
 * @param {number} dx The x delta for the end position.
 * @param {number} dy The y delta for the end position.
 * @return {string} The commands for the desired arc as a string.
 */
function getArcPathCommands(x, y, r, l, dx, dy) {
  return (
    `M ${x.toFixed(2)} ${y.toFixed(2)} ` +
    `a ${r} ${r} 0 ${l} 0 ${dx.toFixed(2)} ${dy.toFixed(2)}`
  );
}

/**
 * @return {string}
 */
function getSpinnerPath() {
  const center = svgSize / 2;

  // The `d` command for the path we are building up.
  let pathD = '';

  // The offset for each frame of the animation.
  let xOffset = 0;

  // The current start angle for the arc.
  let startAngle = -45;

  // The current end angle for the arc.
  let endAngle = -45;

  /**
   * Creates one phase of the animation, changing the start/end angles by the
   * desired delta values.
   * @param {number} startAngleDelta
   * @param {number} endAngleDelta
   * @param {number} startStep
   */
  const createPhase = (startAngleDelta, endAngleDelta, startStep = 0) => {
    for (let i = 0; i < steps; i++) {
      if (i >= startStep) {
        pathD +=
          getCircleArcPath(
            center + xOffset,
            center,
            radius,
            startAngle,
            endAngle
          ) + '\n';
      }

      startAngle += startAngleDelta / steps;
      endAngle += endAngleDelta / steps;
      xOffset += svgSize;
    }
  };

  // The initial arc needs to be described seprately, since it is a circle and
  // the normal code path does not generate this correctly.
  pathD += getArcPathCommands(center, center - radius, radius, 1, 0.01, 0);
  createPhase(360, 90, 1);
  createPhase(90, 270);
  createPhase(270, 90);

  return pathD;
}

/**
 * @param {function(!Array<string>):!Element} html
 * @return {!Element}
 */
export function createSpinnerDom(html) {
  // Extra wrapping div here is to workaround:
  // https://bugs.chromium.org/p/chromium/issues/detail?id=1002748
  const content = html`
    <div class="i-amphtml-new-loader-spinner-wrapper">
      <svg class="i-amphtml-new-loader-spinner" viewbox="0 0 48 48">
        <path class="i-amphtml-new-loader-spinner-path" fill="none"></path>
      </svg>
    </div>
  `;

  // We create the path with code, rather than inline it above, as it is
  // significantly smaller as code.
  content.querySelector('path').setAttribute('d', getSpinnerPath());

  return content;
}
