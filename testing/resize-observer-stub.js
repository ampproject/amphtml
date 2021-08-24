/**
 * @param {!Object} sandbox
 * @param {!Window} window
 * @return {!ResizeObservers}
 */
export function installResizeObserverStub(sandbox, win) {
  return new ResizeObservers(sandbox, win);
}

class ResizeObservers {
  constructor(sandbox, win) {
    const observers = new Set();
    this.observers = observers;

    sandbox.stub(win, 'ResizeObserver').value(function (callback) {
      const observer = new ResizeObserverStub(callback, () => {
        observers.delete(observer);
      });
      observers.add(observer);
      return observer;
    });
  }

  /**
   * @param {!Element} target
   * @return {boolean}
   */
  isObserved(target) {
    return Array.from(this.observers).some((observer) =>
      observer.elements.has(target)
    );
  }

  notifySync(entryOrEntries) {
    const entries = Array.isArray(entryOrEntries)
      ? entryOrEntries
      : [entryOrEntries];
    this.observers.forEach((observer) => {
      const subEntries = entries.filter(({target}) =>
        observer.elements.has(target)
      );
      if (subEntries.length > 0) {
        observer.callback(subEntries);
      }
    });
  }
}

class ResizeObserverStub {
  constructor(callback, onDisconnect) {
    this.onDisconnect_ = onDisconnect;
    this.callback = callback;
    this.elements = new Set();
  }

  disconnect() {
    const onDisconnect = this.onDisconnect_;
    onDisconnect();
  }

  observe(element) {
    this.elements.add(element);
  }

  unobserve(element) {
    this.elements.delete(element);
  }
}
