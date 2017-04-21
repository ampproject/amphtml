import {registerServiceBuilderForDoc} from '../service';
import {viewportForDoc, vsyncFor} from '../services';
import {getMode} from '../mode';
import {dev} from '../log';
import {
  moveLayoutRect,
  layoutRectEquals,
  layoutRectsOverlap,
} from '../layout-rect';
import {IframeMessagingClient} from '../../3p/iframe-messaging-client';
import {MessageType} from '../../src/3p-frame-messaging';


/** @const @private */
const TAG = 'POSITION_OBSERVER';

/**
 * The positionObserver returned position value
 *
 * @typedef {{
 *  positionRect: ?../layout-rect.LayoutRectDef,
 *  viewportRect: !../layout-rect.LayoutRectDef,
 * }}
 */
export let PositionInViewportEntryDef;

/** @enum {number} */
export const PositionObserverFidelity = {
  HIGH: 1,
  LOW: 0,
};

/** @const @private */
const LOW_FEDELITY_FRAME_COUNT = 2;

class AbstractPositionObserver {

  /** @param {!./ampdoc-impl.AmpDoc} ampdoc */
  constructor(ampdoc) {
    /** @const {!./ampdoc-impl.AmpDoc} */
    this.ampdoc_ = ampdoc;

    /** @private {!Array<!Object>} */
    this.entries_ = [];

    /** @private {!./vsync-impl.Vsync} */
    this.vsync_ = vsyncFor(ampdoc.win);

    /** @private {!./viewport-impl.Viewport} */
    this.viewport_ = viewportForDoc(ampdoc);

  }

  /**
   * @param {!Element} element
   * @param {PositionObserverFidelity} fidelity
   * @param {function(PositionInViewportEntryDef)} handler
   * @return {?Object}
   */
  observe(element, fidelity, handler) {
    // If the element already exists in current observeEntries, do nothing
    for (let i = 0; i < this.entries_.length; i++) {
      if (this.entries_[i].element === element) {
        dev().error(TAG, 'should observe same element only once');
        return null;
      }
    }

    // make entry into a class
    const entry = {
      element,
      handler,
      fidelity,
      position: null,
      turn: (fidelity == PositionObserverFidelity.LOW) ?
          Math.floor(Math.random() * LOW_FEDELITY_FRAME_COUNT) : 0,
      trigger: function(position) {
        const prePos = entry.position;
        if (prePos
            && layoutRectEquals(prePos.positionRect, position.positionRect)
            && layoutRectEquals(prePos.viewportRect, position.viewportRect)) {
          // position doesn't change, do nothing.
          return;
        }
        if (layoutRectsOverlap(position.positionRect, position.viewportRect)) {
          entry.position = position;
          // Only call handler if entry element overlap with viewport.
          try {
            entry.handler(position);
          } catch(err) {}
        } else if (entry.position) {
          // Need to notify that element gets outside viewport
          // NOTE: This is required for inabox position observer.
          entry.position = null;
          position.positionRect = null;
          entry.handler(position);
        }
      },
    };

    this.entries_.push(entry);

    if (this.entries_.length == 1) {
      this.startCallback();
    }
    this.updateEntryPosition_(entry);
    return entry;
  }

  /**
   * @param {!Element} element
   * @param {PositionObserverFidelity} fidelity
   */
  changeFidelity(element, fidelity) {
    for (let i = 0; i < this.entries_.length; i++) {
      const entry = this.entries_[i];
      if (entry.element === element) {
        entry.fidelity = fidelity;
        if (fidelity == PositionObserverFidelity.HIGH) {
          entry.turn = 0;
        }
        return;
      }
    }
    dev().error(TAG, 'cannot change fidelity on unobserved element');
  }

  /**
   * @param {!Element} element
   */
  unobserve(element) {
    for (let i = 0; i < this.entries_.length; i++) {
      if (this.entries_[i].element === element) {
        this.entries_[i].handler = null;
        this.entries_.splice(i, 1);
        if (this.entries_.length == 0) {
          this.stopCallback();
        }
        return;
      }
    }
    dev().error(TAG, 'cannot unobserve unobserved element');
  }

  /** @param {!Object} unusedEntry */
  updateEntryPosition_(unusedEntry) {}

  startCallback() {}

  stopCallback() {}

  increaseFidelityCallback() {}

  decreaseFidelityCallback() {}
}

export class AmpPagePositionObserver extends AbstractPositionObserver {

  /** @param {!./ampdoc-impl.AmpDoc} ampdoc */
  constructor(ampdoc) {

    super(ampdoc);

    /** @private {boolean} */
    this.inScroll_ = false;

    /** @private {boolean} */
    this.measure_ = false;

    /** @private {number} */
    this.scrollTimer_ = Date.now();

    /** @private {Array<function()>} */
    this.unlisteners_ = [];
  }

  /* @override */
  startCallback() {
    // listen to viewport scroll event to help pass determine if need to
    this.unlisteners_.push(this.viewport_.onScroll(() => {
      this.inScroll_ = true;
      this.scrollTimer_ = Date.now();
      this.schedulePass_();
      setTimeout(() => {
        if (Date.now() - this.scrollTimer_ < 100) {
          // viewport scroll in the last 100 ms, wait
          return;
        }
        // assume scroll stops, if no scroll event in the last 100,
        this.inScroll_ = false;
      }, 100);
    }));
    this.unlisteners_.push(this.viewport_.onChanged(() => {
      this.vsync_.measure(() => {
        this.pass_(true);
      });
    }));
  }

  /* @override */
  stopCallback() {
    while(this.unlisteners_.length) {
      const unlisten = this.unlisteners_.pop();
      unlisten();
    }
  }

  /** @param {boolean=} recursive */
  schedulePass_(recursive) {
    // TODO:
    // P1: account for effective fidelity using this.effectiveFidelity
    // P1[done]: use every vsyn measure() for HIGH
    // P2[done]: use every 1 in 3 vsyn measure() for LOW
    // P1[done]: only do this while user is scrolling.
    // P1: also do passes for onResize,
    // P2: do passes on onDomMutation (if available using MutationObserver)
    if (!recursive && this.measure_) {
      // call of schedulePass_ from viewport onScroll
      // Do nothing if currently measure with calling schedulePass recursively
      return;
    }
    this.measure_ = true;
    if (!this.inScroll_) {
      // not in scroll, do not need to measure
      this.measure_ = false;
      return;
    }
    this.vsync_.measure(() => {
      this.pass_();
      this.schedulePass_(true);
    });
  }

  /**
   * @param {boolean=} force
   * @private
  */
  pass_(force) {
    for (let i = 0; i < this.entries_.length; i++) {
      const entry = this.entries_[i];
      if (!force && entry.turn != 0) {
        // Not ready for their turn yet.
        entry.turn--;
        continue;
      }
      // Reset entry.turn value.
      if (!force) {
        entry.turn = (entry.fidelity == PositionObserverFidelity.LOW) ?
          LOW_FEDELITY_FRAME_COUNT : 0;
      }

      this.updateEntryPosition_(entry);
    }
  }

  /** @override */
  updateEntryPosition_(entry) {
    // get layoutBoxes relative to doc.
    let elementBox = this.viewport_.getLayoutRect(entry.element);
    let viewportBox = this.viewport_.getRect();

    // Adjust relative coordinate to viewport
    // TODO(@zhouyx): We did one move when in #getLayoutRect.
    // Optimize the code to avoid duplicate moveLayoutRect
    elementBox = moveLayoutRect(elementBox,
        -viewportBox.left, -viewportBox.top);
    viewportBox = moveLayoutRect(viewportBox,
        -viewportBox.left, -viewportBox.top);

    // Return { positionRect: <LayoutRectDef>, viewportRect: <LayoutRectDef>}
    entry.trigger(/** @type {PositionInViewportEntryDef}*/ ({
      positionRect: elementBox,
      viewportRect: viewportBox,
    }));
  }
}

export class InaboxPositionObserver extends AbstractPositionObserver {
  /** @param {!./ampdoc-impl.AmpDoc} ampdoc */
  constructor(ampdoc) {
    super(ampdoc);

    /** @private {!AmpPagePositionObserver} */
    this.positionObserver_ = new AmpPagePositionObserver(ampdoc);

    // TODO(@zhouyx) support fidelity
    this.effectiveFidelity_ = PositionObserverFidelity.LOW;

    /** @private {?PositionInViewportEntryDef} */
    this.iframePosition_ = null;

    /** @private {?function()} */
    this.unlistenHost_ = null;

    /** @private {!IframeMessagingClient} */
    this.iframeClient_ = new IframeMessagingClient(ampdoc.win);
    this.iframeClient_.setSentinel(String(ampdoc.win.Math.random()).substr(2));
  }

  /** @override */
  observe(element, fidelity, handler) {
    super.observe(element, fidelity, handler);
    this.positionObserver_.observe(element, fidelity, position => {
      element.inIframePositionRect = position.positionRect;
    });
  }

  /** @override */
  unobserve(element) {
    super.unobserve(element);
    this.positionObserver_.unobserve(element);
  }

  /** @override */
  startCallback() {
    // TODO(@zhouyx) need to add support for AMP host
    this.unlistenHost_ = this.iframeClient_.makeRequest(
        MessageType.SEND_POSITIONS, MessageType.POSITION,
        position => {
          this.onMessageReceivedHandler_(
              /** @type {PositionInViewportEntryDef} */ (position));
        });
  }

  /** @override */
  stopCallback() {
    if (this.unlistenHost_) {
      this.unlistenHost_();
      this.unlistenHost_ = null;
    }
  }

  /**
   * @param {!PositionInViewportEntryDef} iframePosition
   * @private
   */
  onMessageReceivedHandler_(iframePosition) {
    // iframe position change. recalculate element position.
    // Cache iframe position for later usage.
    this.iframePosition_ = iframePosition;

    // do this in vsyn.measure
    this.vsync_.measure(() => {
      this.pass_();
    });
  }

  /** @private */
  pass_() {
    for(let i = 0; i < this.entries_.length; i++) {
      const entry = this.entries_[i];
      this.updateEntryPosition_(entry);
    }
  }

  /** @override */
  updateEntryPosition_(entry) {
    if (!this.iframePosition_ || !this.iframePosition_.positionRect) {
      // If not receive iframe position from host, or if iframe is outside vp
      return;
    }
    if (!entry.element.inIframePositionRect) {
      // Not receive element position in iframe from ampPagePositionObserver
      return;
    }
    const iframeBox = this.iframePosition_.positionRect;
    const viewportBox = this.iframePosition_.viewportRect;
    // Adjust element rect relative to viewportBox
    let elementBox = entry.element.inIframePositionRect;
    elementBox = moveLayoutRect(elementBox, iframeBox.left, iframeBox.top);
    entry.trigger(/** @type {PositionInViewportEntryDef}*/ ({
      positionRect: elementBox,
      viewportRect: viewportBox,
    }));
  }
}

/**
 * @param {!./ampdoc-impl.AmpDoc} ampdoc
 */
export function installPositionObserverServiceForDoc(ampdoc) {
  registerServiceBuilderForDoc(ampdoc, 'position-observer', () => {
    if (getMode(ampdoc.win).runtime != 'inabox') {
      return new AmpPagePositionObserver(ampdoc);
    } else {
      return new InaboxPositionObserver(ampdoc);
    }
  });
}
