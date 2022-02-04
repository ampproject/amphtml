/** @typedef {function(function():*):void} SchedulerDef */

/**
 * Creates a scheduling function that executes the callback based on the
 * scheduler, but only one task at a time.
 *
 * @param {function():*} handler
 * @param {SchedulerDef} defaultScheduler
 * @return {function(SchedulerDef=):void}
 */
export function throttleTail(handler, defaultScheduler) {
  let scheduled = false;
  const handleAndUnschedule = () => {
    scheduled = false;
    handler();
  };
  /** @param {SchedulerDef=} opt_scheduler */
  const scheduleIfNotScheduled = (opt_scheduler) => {
    if (!scheduled) {
      scheduled = true;
      const scheduler = opt_scheduler || defaultScheduler;
      scheduler(handleAndUnschedule);
    }
  };
  return scheduleIfNotScheduled;
}
