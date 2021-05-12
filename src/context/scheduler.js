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

/**
 * Creates a scheduling function that executes the callback based on the
 * scheduler, but only one task at a time.
 *
 * @param {function()} handler
 * @param {?function(!Function)} defaultScheduler
 * @return {function(function(!Function)=)}
 */
export function throttleTail(handler, defaultScheduler = null) {
  let scheduled = false;
  const handleAndUnschedule = () => {
    scheduled = false;
    handler();
  };
  /**
   * @param {function(!Function)=} opt_scheduler
   */
  const scheduleIfNotScheduled = (opt_scheduler) => {
    if (!scheduled) {
      scheduled = true;
      const scheduler = opt_scheduler || defaultScheduler;
      scheduler(handleAndUnschedule);
    }
  };
  return scheduleIfNotScheduled;
}
