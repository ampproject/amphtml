import {Deferred} from '#core/data-structures/promise';
import {isIframed} from '#core/dom';
import {memo} from '#core/types/object';
import {getWin} from '#core/window';

import {getMode} from '../../../src/mode';

const OBSERVERS_MAP_PROP = '__AMP_A4A_VP_MAP';

/**
 * Resolves when the underlying element is within the given viewport range.
 * @param {!Element} element
 * @param {number} viewportNum
 * @return {!Promise}
 */
export function whenWithinViewport(element, viewportNum) {
  // This can only fully be implemented when `root=document` is polyfilled
  // everywhere.
  if (!(WITHIN_VIEWPORT_INOB || getMode().localDev || getMode().test)) {
    return Promise.reject('!WITHIN_VIEWPORT_INOB');
  }

  const win = getWin(element);
  const observersMap = memo(win, OBSERVERS_MAP_PROP, createObserversMap);

  let observer = observersMap.get(viewportNum);
  if (!observer) {
    observer = createObserver(win, viewportNum);
    observersMap.set(viewportNum, observer);
  }
  return observer(element);
}

/** @return {!Map<string, function(!Element):!Promise>} */
const createObserversMap = () => new Map();

/**
 * @param {!Window} win
 * @param {number} viewportNum
 * @return {function(!Element):!Promise}
 */
function createObserver(win, viewportNum) {
  const elements = new WeakMap();

  const callback = (records) => {
    for (let i = 0; i < records.length; i++) {
      const {isIntersecting, target: element} = records[i];
      const deferred = elements.get(element);
      if (deferred && isIntersecting) {
        deferred.resolve();
        observer.unobserve(element);
        elements.delete(element);
      }
    }
  };

  const iframed = isIframed(win);
  const root = /** @type {?Element} */ (
    iframed ? /** @type {*} */ (win.document) : null
  );
  const observer = new win.IntersectionObserver(callback, {
    root,
    rootMargin: `${(viewportNum - 1) * 100}%`,
  });

  return (element) => {
    let deferred = elements.get(element);
    if (!deferred) {
      deferred = new Deferred();
      elements.set(element, deferred);
      observer.observe(element);
    }
    return deferred.promise;
  };
}
