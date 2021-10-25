import {isIframed} from '#core/dom';

import {Services} from '#service';
import {READY_SCAN_SIGNAL} from '#service/resources-interface';

/** @const {!Array<string>} */
const EXCLUDE_INI_LOAD = [
  'AMP-AD',
  'AMP-ANALYTICS',
  'AMP-PIXEL',
  'AMP-AD-EXIT',
];

/**
 * Returns the promise that will be resolved when all content elements
 * have been loaded in the initially visible set.
 * @param {!Element|!./service/ampdoc-impl.AmpDoc} elementOrAmpDoc
 * @param {!Window} hostWin
 * @param {!./layout-rect.LayoutRectDef} rect
 * @param {boolean=} opt_prerenderableOnly signifies if we are in prerender mode.
 * @return {!Promise}
 */
export function whenContentIniLoad(
  elementOrAmpDoc,
  hostWin,
  rect,
  opt_prerenderableOnly
) {
  if (INI_LOAD_INOB) {
    return whenContentIniLoadInOb(elementOrAmpDoc, opt_prerenderableOnly);
  }
  return whenContentIniLoadMeasure(
    elementOrAmpDoc,
    hostWin,
    rect,
    opt_prerenderableOnly
  );
}

/**
 * A legacy way using direct measurement.
 * Used by inabox runtime, and will be moved there after #31915.
 *
 * @param {!Element|!./service/ampdoc-impl.AmpDoc} elementOrAmpDoc
 * @param {!Window} hostWin
 * @param {!./layout-rect.LayoutRectDef} rect
 * @param {boolean=} opt_prerenderableOnly signifies if we are in prerender mode.
 * @return {!Promise}
 */
export function whenContentIniLoadMeasure(
  elementOrAmpDoc,
  hostWin,
  rect,
  opt_prerenderableOnly
) {
  const ampdoc = Services.ampdoc(elementOrAmpDoc);
  return getMeasuredResources(ampdoc, hostWin, (r) => {
    // TODO(jridgewell): Remove isFixed check here once the position
    // is calculted correctly in a separate layer for embeds.
    if (
      !r.isDisplayed() ||
      (!r.overlaps(rect) && !r.isFixed()) ||
      (opt_prerenderableOnly && !r.prerenderAllowed())
    ) {
      return false;
    }
    return true;
  }).then((resources) => {
    const promises = [];
    resources.forEach((r) => {
      if (!EXCLUDE_INI_LOAD.includes(r.element.tagName)) {
        promises.push(r.loadedOnce());
      }
    });
    return Promise.all(promises);
  });
}

/**
 * A new way using direct measurement.
 *
 * @param {!Element|!./service/ampdoc-impl.AmpDoc} elementOrAmpDoc
 * @param {boolean=} opt_prerenderableOnly signifies if we are in prerender mode.
 * @return {!Promise}
 * @visibleForTesting
 * TODO(#31915): remove visibility
 */
export function whenContentIniLoadInOb(elementOrAmpDoc, opt_prerenderableOnly) {
  const ampdoc = Services.ampdoc(elementOrAmpDoc);
  // First, wait for the `ready-scan` signal. Waiting for each element
  // individually is too expensive and `ready-scan` will cover most of
  // the initially parsed elements.
  const whenReady = ampdoc.signals().whenSignal(READY_SCAN_SIGNAL);
  return whenReady.then(() => {
    // Filter elements.
    const resources = Services.resourcesForDoc(ampdoc);
    const elements = resources
      .get()
      .filter((r) => {
        if (opt_prerenderableOnly && !r.prerenderAllowed()) {
          return false;
        }
        return !EXCLUDE_INI_LOAD.includes(r.element.tagName);
      })
      .map((r) => r.element);

    if (elements.length === 0) {
      return Promise.resolve([]);
    }

    // Find intersecting elements.
    return new Promise((resolve) => {
      const {win} = ampdoc;
      const io = new win.IntersectionObserver(
        (entries) => {
          io.disconnect();
          const intersecting = [];
          for (let i = 0; i < entries.length; i++) {
            const {isIntersecting, target} = entries[i];
            if (isIntersecting) {
              intersecting.push(target);
            }
          }
          resolve(intersecting);
        },
        {
          // We generally always want `root: document` here. However, in
          // many browsers this is still polyfilled and `{root: null}` is
          // a lot faster.
          root: isIframed(win) ? /** @type {?} */ (win.document) : null,
          threshold: 0.01,
        }
      );
      // Limit check to the first 100 elements.
      for (let i = 0; i < Math.min(elements.length, 100); i++) {
        io.observe(elements[i]);
      }
    }).then((elements) => {
      return Promise.all(elements.map((element) => element.whenLoaded()));
    });
  });
}

/**
 * Returns a subset of resources which are (1) belong to the specified host
 * window, and (2) meet the filterFn given.
 *
 * @param {!./service/ampdoc-impl.AmpDoc} ampdoc
 * @param {!Window} hostWin
 * @param {function(!./service/resource.Resource):boolean} filterFn
 * @return {!Promise<!Array<!./service/resource.Resource>>}
 */
export function getMeasuredResources(ampdoc, hostWin, filterFn) {
  // First, wait for the `ready-scan` signal. Waiting for each element
  // individually is too expensive and `ready-scan` will cover most of
  // the initially parsed elements.
  return ampdoc
    .signals()
    .whenSignal(READY_SCAN_SIGNAL)
    .then(() => {
      // Second, wait for any left-over elements to complete measuring.
      const measurePromiseArray = [];
      const resources = Services.resourcesForDoc(ampdoc);
      resources.get().forEach((r) => {
        if (!r.hasBeenMeasured() && r.hostWin == hostWin && !r.hasOwner()) {
          measurePromiseArray.push(r.ensureMeasured());
        }
      });
      return Promise.all(measurePromiseArray);
    })
    .then(() => {
      const resources = Services.resourcesForDoc(ampdoc);
      return resources.get().filter((r) => {
        return (
          r.hostWin == hostWin &&
          !r.hasOwner() &&
          r.hasBeenMeasured() &&
          filterFn(r)
        );
      });
    });
}
