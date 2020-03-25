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

const average = array => {
  if (!array || array.length == 0) {
    return 0;
  }
  return array.reduce((a, b) => a + b) / array.length;
};

const sort = array => {
  return array.sort((a, b) => {
    return a - b;
  });
};

const median = array => {
  sort(array);
  const {length} = array;
  const isEven = length % 2 == 0;
  if (isEven) {
    return average([array[length / 2], array[length / 2 + 1]]);
  }
  return array[length / 2];
};

const q1 = array => {
  sort(array);
  const mid = Math.ceil(array.length / 2);
  const half = array.slice(0, mid);
  return median(half);
};

const q3 = array => {
  sort(array);
  const mid = Math.ceil(array.length / 2);
  const half = array.slice(mid);
  return median(half);
};

/**
 * Takes two numbers and generates a string representing the difference as
 * a percent for use in printing the results
 *
 * @param {number} a
 * @param {number} b
 * @return {string} String representing the change as a percent
 */
function percent(a, b) {
  if (a === 0) {
    return b === 0 ? 'n/a' : `-${100 - Math.round((a / b) * 100)}`;
  } else {
    return `${100 - Math.round((b / a) * 100)}%`;
  }
}

/**
 * Given an array, identify outliers using the Tukey method,
 * and return the average after removing them.
 *
 * @param {Array<*>} results
 * @param {string} metric
 * @return {number}
 */
function averageNoOutliers(results, metric) {
  const array = results.map(a => a[metric]);
  const stats = {
    q1: q1(array),
    q3: q3(array),
  };
  const lowerFence = stats.q1 - 1.5 * (stats.q3 - stats.q1);
  const upperFence = stats.q3 + 1.5 * (stats.q3 - stats.q1);
  const arrayNoOutliers = array.filter(a => a >= lowerFence && a <= upperFence);

  return Math.round(average(arrayNoOutliers));
}

module.exports = {
  averageNoOutliers,
  percent,
};
