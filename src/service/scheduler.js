import {VisibilityState_Enum} from '#core/constants/visibility-state';
import {
  containsNotSelf,
  hasNextNodeInDocumentOrder,
  isIframed,
} from '#core/dom';
import {LayoutPriority_Enum} from '#core/dom/layout';
import {removeItem} from '#core/types/array';

import {READY_SCAN_SIGNAL} from './resources-interface';

import {
  getServiceForDoc,
  registerServiceBuilderForDoc,
} from '../service-helpers';

const ID = 'scheduler';

const ROOT_MARGIN = '250% 31.25%';

/** @implements {../service.Disposable} */
export class Scheduler {
  /** @param {!./ampdoc-impl.AmpDoc} ampdoc  */
  constructor(ampdoc) {
    /** @private @const */
    this.ampdoc_ = ampdoc;

    const {win} = ampdoc;

    /** @private @const {!IntersectionObserver} */
    this.observer_ = new win.IntersectionObserver((e) => this.observed_(e), {
      // Root bounds are not important, so we can use the `root:null` for a
      // top-level window.
      root: isIframed(win) ? /** @type {?} */ (win.document) : null,
      rootMargin: ROOT_MARGIN,
    });

    /** @private @const {!Map<!Element, !IntersectionObserver>} */
    this.containerMap_ = new Map();

    /** @private @const {!Map<!AmpElement, {asap: boolean, isIntersecting: boolean}>} */
    this.targets_ = new Map();

    /** @private {?Array<!AmpElement>} */
    this.parsingTargets_ = [];

    /** @private {boolean} */
    this.scheduledReady_ = false;

    ampdoc.whenReady().then(() => this.checkParsing_());

    /** @private {?UnlistenDef} */
    this.visibilityUnlisten_ = ampdoc.onVisibilityChanged(() =>
      this.docVisibilityChanged_()
    );
  }

  /** @override */
  dispose() {
    this.observer_.disconnect();
    this.targets_.clear();
    if (this.visibilityUnlisten_) {
      this.visibilityUnlisten_();
      this.visibilityUnlisten_ = null;
    }
  }

  /**
   * @param {!AmpElement} target
   */
  scheduleAsap(target) {
    this.targets_.set(target, {asap: true, isIntersecting: false});
    this.waitParsing_(target);
  }

  /**
   * @param {!AmpElement} target
   */
  schedule(target) {
    if (this.targets_.has(target)) {
      return;
    }

    if (target.deferredMount()) {
      this.targets_.set(target, {asap: false, isIntersecting: false});
      this.observer_.observe(target);
      if (this.containerMap_.size > 0) {
        this.containerMap_.forEach((observer, container) => {
          if (containsNotSelf(container, target)) {
            observer.observe(target);
          }
        });
      }
    } else {
      this.targets_.set(target, {asap: false, isIntersecting: true});
    }

    this.waitParsing_(target);
  }

  /**
   * @param {!AmpElement} target
   */
  unschedule(target) {
    if (!this.targets_.has(target)) {
      return;
    }

    this.targets_.delete(target);

    this.observer_.unobserve(target);
    if (this.containerMap_.size > 0) {
      this.containerMap_.forEach((observer) => {
        observer.unobserve(target);
      });
    }

    if (this.parsingTargets_) {
      removeItem(this.parsingTargets_, target);
      this.checkParsing_();
    }
  }

  /**
   * Adds the observer for the specified container. The first observer to
   * find an intersection will trigger the element's mount.
   *
   * @param {!Element} container
   * @param {!Element=} opt_scroller
   */
  setContainer(container, opt_scroller) {
    if (this.containerMap_.has(container)) {
      return;
    }

    // Create observer.
    const {win} = this.ampdoc_;
    const observer = new win.IntersectionObserver((e) => this.observed_(e), {
      root: opt_scroller || container,
      rootMargin: ROOT_MARGIN,
    });
    this.containerMap_.set(container, observer);

    // Subscribe all pending children. Ignore `asap` targets since they
    // will be scheduled immediately and do not need an intersection
    // observer input.
    this.targets_.forEach(({asap}, target) => {
      if (!asap && containsNotSelf(container, target)) {
        observer.observe(target);
      }
    });
  }

  /**
   * Removes the container and its observer that were set by the `setContainer`.
   *
   * @param {!Element} container
   */
  removeContainer(container) {
    const observer = this.containerMap_.get(container);
    if (!observer) {
      return;
    }

    // Disconnect. All children will be unobserved automatically.
    observer.disconnect();
    this.containerMap_.delete(container);
  }

  /** @private*/
  signalScanReady_() {
    if (this.ampdoc_.isReady() && !this.scheduledReady_) {
      this.scheduledReady_ = true;
      const {win} = this.ampdoc_;
      win.setTimeout(() => {
        // This signal mainly signifies that some of the elements have been
        // discovered and scheduled.
        this.ampdoc_.signals().signal(READY_SCAN_SIGNAL);
      }, 50);
    }
  }

  /** @private */
  docVisibilityChanged_() {
    const vs = this.ampdoc_.getVisibilityState();
    if (
      vs == VisibilityState_Enum.VISIBLE ||
      vs == VisibilityState_Enum.HIDDEN ||
      vs == VisibilityState_Enum.PRERENDER ||
      vs == VisibilityState_Enum.PREVIEW
    ) {
      this.targets_.forEach((_, target) => this.maybeBuild_(target));
    }
  }

  /**
   * @param {!AmpElement} target
   * @private
   */
  waitParsing_(target) {
    const parsingTargets = this.parsingTargets_;
    if (parsingTargets) {
      if (!parsingTargets.includes(target)) {
        parsingTargets.push(target);
      }
      this.checkParsing_();
    } else {
      this.maybeBuild_(target);
    }
  }

  /** @private */
  checkParsing_() {
    const documentReady = this.ampdoc_.isReady();
    const parsingTargets = this.parsingTargets_;
    if (parsingTargets) {
      for (let i = 0; i < parsingTargets.length; i++) {
        const target = parsingTargets[i];
        if (
          documentReady ||
          hasNextNodeInDocumentOrder(target, this.ampdoc_.getRootNode())
        ) {
          parsingTargets.splice(i--, 1);

          this.maybeBuild_(target);
        }
      }
    }
    if (documentReady) {
      this.parsingTargets_ = null;
      this.signalScanReady_();
    }
  }

  /**
   * @param {!Array<!IntersectionObserverEntry>} entries
   * @private
   */
  observed_(entries) {
    for (let i = 0; i < entries.length; i++) {
      const {isIntersecting: isThisIntersecting, target} = entries[i];
      const ampTarget = /** @type {!AmpElement} */ (target);

      const current = this.targets_.get(ampTarget);
      if (!current) {
        continue;
      }

      const isIntersecting = isThisIntersecting || current.isIntersecting;
      if (isIntersecting !== current.isIntersecting) {
        this.targets_.set(ampTarget, {asap: current.asap, isIntersecting});
      }
      if (isIntersecting) {
        this.maybeBuild_(ampTarget);
      }
    }
  }

  /**
   * @param {!AmpElement} target
   * @private
   */
  maybeBuild_(target) {
    const parsingTargets = this.parsingTargets_;
    const parsed = !(parsingTargets && parsingTargets.includes(target));
    const {asap, isIntersecting} = this.targets_.get(target) || {
      asap: false,
      isIntersecting: false,
    };
    const vs = this.ampdoc_.getVisibilityState();
    const toBuild =
      parsed &&
      (asap || isIntersecting) &&
      (vs == VisibilityState_Enum.VISIBLE ||
        // Hidden (hidden tab) allows full build.
        vs == VisibilityState_Enum.HIDDEN ||
        // Prerender can only proceed when allowed.
        (vs == VisibilityState_Enum.PRERENDER && target.prerenderAllowed()) ||
        // Preview can only proceed when allowed.
        (vs == VisibilityState_Enum.PREVIEW && target.previewAllowed()));
    if (!toBuild) {
      return;
    }

    this.unschedule(target);

    // The high-priority elements are scheduled via `setTimeout`. All other
    // elements are scheduled via the `requestIdleCallback`.
    const {win} = this.ampdoc_;
    const scheduler =
      asap || target.getBuildPriority() <= LayoutPriority_Enum.CONTENT
        ? win.setTimeout
        : win.requestIdleCallback || win.setTimeout;
    scheduler(() => target.mountInternal());
  }
}

/**
 * @param {!./ampdoc-impl.AmpDoc} ampdoc
 * @return {!Scheduler}
 */
export function getSchedulerForDoc(ampdoc) {
  registerServiceBuilderForDoc(ampdoc, ID, Scheduler);
  return /** @type {!Scheduler} */ (getServiceForDoc(ampdoc, ID));
}
