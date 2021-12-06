class TimerService {
  delay(cb, timeout = 0) {
    if (timeout > 0) {
      setTimeout(cb, timeout);
    } else {
      // Use the async queue, because it'll run before the event queue:
      Promise.resolve().then(cb);
    }
  }
}

export const timerService = new TimerService();
