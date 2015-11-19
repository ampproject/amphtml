/**
 * Copyright 2015 The AMP HTML Authors. All Rights Reserved.
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
 * @param {opt_base} opt_base Exponential base. Defaults to 2.
 * @return {function(function())} Function that when invoked will
 *     call the passed in function. On every invocation the next
 *     invocation of the passed in function will be exponentially
 *     later.
 */
export function exponentialBackoff(opt_base) {
  let count = 0;
  return work => {
    let wait = Math.pow(opt_base || 2, count++);
    // Add jitter to avoid the thundering herd. This can e.g. happen when
    // we poll a backend and it fails for everyone at the same time.
    // We wait up to 30% longer or shorter than the time otherwise
    // given for this cycle.
    let jitter = wait * .3 * Math.random();
    if (Math.random() > .5) {
      jitter *= -1;
    }
    wait += jitter;
    setTimeout(work, Math.round(wait * 1000));
  };
}
