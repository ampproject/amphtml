import {areEqualOrdered} from '#core/types/array';

/**
 * @param {!Object} sandbox
 * @param {!Window} window
 * @return {!IntersectionObservers}
 */
export function installIntersectionObserverStub(sandbox, win) {
  return new IntersectionObservers(sandbox, win);
}

class IntersectionObservers {
  /**
   * @param {!Object} sandbox
   * @param {!Window} win
   */
  constructor(sandbox, win) {
    const observers = new Set();
    this.observers = observers;

    sandbox
      .stub(win, 'IntersectionObserver')
      .value(function (callback, options) {
        const observer = new IntersectionObserverStub(callback, options, () => {
          observers.delete(observer);
        });
        observers.add(observer);
        return observer;
      });
  }

  /**
   * @param {!Element} target
   * @param {{
   *   root: (!Document|!Element|undefined),
   *   rootMargin: (string|undefined),
   *   thresholds: (number|!Array<number>|undefined),
   * }=} options
   * @return {boolean}
   */
  isObserved(target, options = {}) {
    return Array.from(this.observers).some((observer) => {
      if (!observer.elements.has(target)) {
        return false;
      }
      return matchesObserver(observer, options);
    });
  }

  /**
   * @param {!IntersectionObserverEntry|!Array<IntersectionObserverEntry>} entryOrEntries
   * @param {{
   *   root: (!Document|!Element|undefined),
   *   rootMargin: (string|undefined),
   *   thresholds: (number|!Array<number>|undefined),
   * }=} options
   */
  notifySync(entryOrEntries, options = {}) {
    const entries = Array.isArray(entryOrEntries)
      ? entryOrEntries
      : [entryOrEntries];
    this.observers.forEach((observer) => {
      if (!matchesObserver(observer, options)) {
        return;
      }
      const subEntries = entries.filter(({target}) =>
        observer.elements.has(target)
      );
      if (subEntries.length > 0) {
        observer.callback(subEntries);
      }
    });
  }
}

class IntersectionObserverStub {
  constructor(callback, options, onDisconnect) {
    this.onDisconnect_ = onDisconnect;
    this.callback = callback;
    this.elements = new Set();

    options = options || {};
    this.root = options.root || null;
    this.rootMargin = options.rootMargin || '0px';
    this.thresholds =
      options.threshold != null ? [].concat(options.threshold) : [0];
  }

  disconnect() {
    const onDisconnect = this.onDisconnect_;
    onDisconnect();
  }

  /**
   * @param {!Element} element
   */
  observe(element) {
    this.elements.add(element);
  }

  /**
   * @param {!Element} element
   */
  unobserve(element) {
    this.elements.delete(element);
  }
}

/**
 * @param {!IntersectionObserverStub} observer
 * @param {{
 *   root: (!Document|!Element|undefined),
 *   rootMargin: (string|undefined),
 *   thresholds: (number|!Array<number>|undefined),
 * }} options
 */
function matchesObserver(observer, options) {
  const {root, rootMargin, thresholds} = options;
  return (
    (root === undefined || root == observer.root) &&
    (rootMargin === undefined || rootMargin == observer.rootMargin) &&
    (thresholds === undefined ||
      areEqualOrdered(thresholds, observer.thresholds))
  );
}
