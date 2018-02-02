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

/**
 * The property on `window` where we will store whether we are currently
 * performing the mutate-phase.
 *
 * @const {string}
 */
export const IN_MUTATE_PHASE_PROP = 'VSYNC_IN_MUTATE_PHASE';

/**
 * DO NOT EVER USE. I"M SERIOUS, I"LL PUNCH YOU.
 * Creates a "mutation" phase regardless of vsync's async batching.
 *
 * @param {!Window} win
 * @return {boolean}
 */
export function dangerousSyncMutate(win) {
  const prev = win[IN_MUTATE_PHASE_PROP];
  win[IN_MUTATE_PHASE_PROP] = true;
  return prev;
}

/**
 * DO NOT EVER USE. I"M SERIOUS, I"LL PUNCH YOU.
 * Stops the "mutation" phase regardless of vsync's async batching.
 *
 * @param {!Window} win
 * @param {boolean} prev
 */
export function dangerousSyncMutateStop(win, prev) {
  win[IN_MUTATE_PHASE_PROP] = prev;
}

