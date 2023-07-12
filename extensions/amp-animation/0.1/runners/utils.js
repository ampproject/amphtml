import {userAssert} from '#utils/log';

/**
 * @param {!Array<!../web-animation-types.InternalWebAnimationRequestDef>} requests
 * @return {number} total duration in milliseconds.
 * @throws {Error} If timeline is infinite.
 */
export function getTotalDuration(requests) {
  let maxTotalDuration = 0;
  for (let i = 0; i < requests.length; i++) {
    const {timing} = requests[i];

    userAssert(
      isFinite(timing.iterations),
      'Animation has infinite ' +
        'timeline, we can not seek to a relative position within an infinite ' +
        'timeline. Use "time" for seekTo or remove infinite iterations'
    );

    const iteration = timing.iterations - timing.iterationStart;
    const totalDuration =
      timing.duration * iteration + timing.delay + timing.endDelay;

    if (totalDuration > maxTotalDuration) {
      maxTotalDuration = totalDuration;
    }
  }

  return maxTotalDuration;
}
