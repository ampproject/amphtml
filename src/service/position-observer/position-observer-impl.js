import {debounce} from '#core/types/function';

import {Services} from '#service';

import {dev} from '#utils/log';

import {
  PositionObserverFidelity_Enum, // eslint-disable-line @typescript-eslint/no-unused-vars
  PositionObserverWorker,
} from './position-observer-worker';

import {registerServiceBuilderForDoc} from '../../service-helpers';

/** @const @private */
const TAG = 'POSITION_OBSERVER';

/** @const @private */
const SCROLL_TIMEOUT = 500;

export class PositionObserver {
  /**
   * @param {!../ampdoc-impl.AmpDoc} ampdoc
   */
  constructor(ampdoc) {
    /** @private {!../ampdoc-impl.AmpDoc} */
    this.ampdoc_ = ampdoc;

    /** @private {!Window} */
    this.win_ = ampdoc.win;

    /** @private {!Array<!PositionObserverWorker>} */
    this.workers_ = [];

    /** @private {!../vsync-impl.Vsync} */
    this.vsync_ = Services.vsyncFor(this.win_);

    /** @private {!../viewport/viewport-interface.ViewportInterface} */
    this.viewport_ = Services.viewportForDoc(ampdoc);

    /** @private {Array<function()>} */
    this.unlisteners_ = [];

    /** @private {boolean} */
    this.inScroll_ = false;

    /** @private {boolean} */
    this.measure_ = false;

    /** @private {boolean} */
    this.callbackStarted_ = false;

    /** @private {function()} */
    this.boundStopScroll_ = debounce(
      this.win_,
      () => {
        this.inScroll_ = false;
      },
      SCROLL_TIMEOUT
    );
  }

  /**
   * @param {!Element} element
   * @param {!PositionObserverFidelity_Enum} fidelity
   * @param {function(?./position-observer-worker.PositionInViewportEntryDef)} handler
   * @return {!UnlistenDef}
   */
  observe(element, fidelity, handler) {
    const worker = new PositionObserverWorker(
      this.ampdoc_,
      element,
      fidelity,
      handler
    );

    this.workers_.push(worker);

    if (!this.callbackStarted_) {
      this.startCallback_();
    }

    worker.update();

    return () => {
      for (let i = 0; i < this.workers_.length; i++) {
        if (this.workers_[i] == worker) {
          this.removeWorker_(i);
          return;
        }
      }
    };
  }

  /**
   * @param {!Element} element
   */
  unobserve(element) {
    for (let i = 0; i < this.workers_.length; i++) {
      if (this.workers_[i].element == element) {
        this.removeWorker_(i);
        return;
      }
    }
    dev().error(TAG, 'cannot unobserve unobserved element');
  }

  /**
   * @param {number} index
   * @private
   */
  removeWorker_(index) {
    this.workers_.splice(index, 1);
    if (this.workers_.length == 0) {
      this.stopCallback_();
    }
  }

  /**
   * Callback function that gets called when start to observe the first element.
   * @private
   */
  startCallback_() {
    this.callbackStarted_ = true;
    // listen to viewport scroll event to help pass determine if need to
    this.unlisteners_.push(
      this.viewport_.onScroll(() => {
        this.onScrollHandler_();
      })
    );
    this.unlisteners_.push(
      this.viewport_.onResize(() => {
        this.onResizeHandler_();
      })
    );
  }

  /**
   * Callback function that gets called when unobserve last observed element.
   * @private
   */
  stopCallback_() {
    this.callbackStarted_ = false;
    while (this.unlisteners_.length) {
      const unlisten = this.unlisteners_.pop();
      unlisten();
    }
  }

  /**
   * This should always be called in vsync.
   * @param {boolean=} opt_force
   * @visibleForTesting
   */
  updateAllEntries(opt_force) {
    for (let i = 0; i < this.workers_.length; i++) {
      const worker = this.workers_[i];
      worker.update(opt_force);
    }
  }

  /**
   * Handle viewport scroll event
   * @private
   */
  onScrollHandler_() {
    this.boundStopScroll_();
    this.inScroll_ = true;
    if (!this.measure_) {
      this.schedulePass_();
    }
  }

  /**
   * Handle viewport resize event
   * @private
   */
  onResizeHandler_() {
    this.updateAllEntries(true);
  }

  /**
   * Update all entries during scroll
   * @private
   */
  schedulePass_() {
    // TODO (@zhouyx, #9208):
    // P1: account for effective fidelity using this.effectiveFidelity
    // P2: do passes on onDomMutation (if available using MutationObserver
    // mostly for in-a-box host, since most DOM mutations are constraint to the
    // AMP elements).
    this.updateAllEntries();
    this.measure_ = true;
    if (!this.inScroll_) {
      // Stop measure if viewport is no longer scrolling
      this.measure_ = false;
      return;
    }
    this.vsync_.measure(() => {
      this.schedulePass_();
    });
  }
}

/**
 * @param {!../ampdoc-impl.AmpDoc} ampdoc
 */
export function installPositionObserverServiceForDoc(ampdoc) {
  registerServiceBuilderForDoc(ampdoc, 'position-observer', PositionObserver);
}
