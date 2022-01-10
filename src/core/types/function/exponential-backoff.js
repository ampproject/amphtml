/**
 * @param {number=} opt_base Exponential base. Defaults to 2.
 * @return {function(function()): ReturnType<typeof setTimeout>} Function that when invoked will
 *     call the passed in function. On every invocation the next
 *     invocation of the passed in function will be exponentially
 *     later. Returned function returns timeout id.
 */
export function exponentialBackoff(opt_base) {
  const getTimeout = exponentialBackoffClock(opt_base);
  return (work) => setTimeout(work, getTimeout());
}

/**
 * @param {number=} opt_base Exponential base. Defaults to 2.
 * @return {function(): number} Function that when invoked will return
 *    a number that exponentially grows per invocation.
 */
export function exponentialBackoffClock(opt_base) {
  const base = opt_base || 2;
  let count = 0;
  return () => {
    let wait = Math.pow(base, count++);
    wait += getJitter(wait);
    return wait * 1000;
  };
}

/**
 * Add jitter to avoid the thundering herd. This can e.g. happen when
 * we poll a backend and it fails for everyone at the same time.
 * We add up to 30% (default) longer or shorter than the given time.
 *
 * @param {number} wait the amount if base milliseconds
 * @param {number=} opt_perc the min/max percentage to add or sutract
 * @return {number}
 */
export function getJitter(wait, opt_perc) {
  opt_perc = opt_perc || 0.3;
  let jitter = wait * opt_perc * Math.random();
  if (Math.random() > 0.5) {
    jitter *= -1;
  }
  return jitter;
}
