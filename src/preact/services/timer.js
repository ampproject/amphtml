class TimerService {
  /**
   * @param {function(): void} cb
   * @param {number} [timeout]
   */
  delay(cb, timeout = 0) {
    if (timeout > 0) {
      setTimeout(cb, timeout);
    } else {
      // Use the async queue, because it'll run before the event queue:
      Promise.resolve().then(cb);
    }
  }
}

// eslint-disable-next-line local/no-export-side-effect
export const timerService = new TimerService();
