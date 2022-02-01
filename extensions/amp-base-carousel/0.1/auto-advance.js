import {debounce} from '#core/types/function';

import {getDetail, listen, listenOnce} from '#utils/event-helper';

import {ActionSource} from './action-source';
import {CarouselEvents} from './carousel-events';

const MIN_AUTO_ADVANCE_INTERVAL = 1000;

/**
 * @typedef {{
 *   advance: function(number, {
 *     actionSource: (!ActionSource|undefined),
 *     allowWrap: (boolean|undefined),
 *   }),
 * }}
 */
let AdvanceDef;

/**
 * Handles auto advance for a carousel. This pauses autoadvance whenever a
 * scroll / touch  occurs and resumes it when it ends.
 *
 * When the auto advance timer expires, it tells the provided Advanceable to
 * advance by the configured auto advance count.
 */
export class AutoAdvance {
  /**
   * @param {{
   *   win: !Window,
   *   element: !Element,
   *   scrollContainer: !Element,
   *   advanceable: !AdvanceDef
   * }} config
   */
  constructor(config) {
    const {advanceable, element, scrollContainer, win} = config;
    /** @private @const */
    this.win_ = win;

    /** @private @const */
    this.scrollContainer_ = scrollContainer;

    /** @private @const */
    this.advanceable_ = advanceable;

    /** @private {number} */
    this.advances_ = 0;

    /** @private {boolean} */
    this.autoAdvance_ = false;

    /** @private {number} */
    this.autoAdvanceCount_ = 1;

    /** @private {number} */
    this.autoAdvanceInterval_ = MIN_AUTO_ADVANCE_INTERVAL;

    /** @private {boolean} */
    this.paused_ = false;

    /** @private {boolean} */
    this.stopped_ = false;

    /** @private {?function()} */
    this.debouncedAdvance_ = null;

    /** @private {number} */
    this.maxAdvances_ = Number.POSITIVE_INFINITY;

    /** @private {!../../../src/service/ampdoc-impl.AmpDoc} */
    this.ampdoc_ = element.getAmpDoc();

    this.createDebouncedAdvance_(this.autoAdvanceInterval_);
    this.scrollContainer_.addEventListener(
      'scroll',
      () => this.handleScroll_(),
      true
    );
    listen(
      this.scrollContainer_,
      'touchstart',
      () => this.handleTouchStart_(),
      {capture: true, passive: true}
    );
    listen(element, CarouselEvents.INDEX_CHANGE, (event) => {
      this.handleIndexChange_(event);
    });
  }

  /**
   * Stops the auto advance. Once stopped, auto advance cannot be started
   * again. This  sets the `stopped_` flag, which is checked in
   * `shouldAutoAdvance_`.
   */
  stop() {
    this.stopped_ = true;
  }

  /**
   * Pauses the auto advance. It can be resumed again by calling `resume`. This
   * sets the `paused_` flag, which is checked in `shouldAutoAdvance_`.
   *
   * This should only be used internally, rather than by an external developer.
   * If the functionallity is desired, `stop` shoould be used instead.
   */
  pause() {
    this.paused_ = true;
  }

  /**
   * Resumes the auto advance as long as it is not stopped. This clears the
   * `paused_` flag, which is checked in `shouldAutoAdvance_`.
   *
   * This should only be used internally, rather than by an external developer
   * If the functionallity is desired, a `start` function, undoing
   * `stop` should be implemented instead.
   */
  resume() {
    this.paused_ = false;
    this.resetAutoAdvance_();
  }

  /**
   * @param {boolean} autoAdvance Whether or not to autoadvance. Changing this
   *    will start or stop autoadvance.
   */
  updateAutoAdvance(autoAdvance) {
    this.autoAdvance_ = autoAdvance;
    this.resetAutoAdvance_();
  }

  /**
   * @param {number} autoAdvanceCount How many items to advance by. A positive
   *    number advances forwards, a negative number advances backwards.
   */
  updateAutoAdvanceCount(autoAdvanceCount) {
    this.autoAdvanceCount_ = autoAdvanceCount;
    this.resetAutoAdvance_();
  }

  /**
   * @param {number} autoAdvanceInterval How much time between auto advances.
   *    This time starts counting from when scrolling has stopped.
   */
  updateAutoAdvanceInterval(autoAdvanceInterval) {
    this.autoAdvanceInterval_ = Math.max(
      autoAdvanceInterval,
      MIN_AUTO_ADVANCE_INTERVAL
    );
    this.createDebouncedAdvance_(this.autoAdvanceInterval_);
    this.resetAutoAdvance_();
  }

  /**
   * @param {number} maxAdvances The maximum number of advances that should be
   *    performed.
   */
  updateMaxAdvances(maxAdvances) {
    this.maxAdvances_ = maxAdvances;
  }

  /**
   * Creates a debounced advance function.
   * @param {number} interval
   * @private
   */
  createDebouncedAdvance_(interval) {
    const debouncedAdvance = debounce(
      this.win_,
      () => {
        if (debouncedAdvance != this.debouncedAdvance_) {
          return;
        }

        this.advance_();
      },
      interval
    );
    this.debouncedAdvance_ = debouncedAdvance;
  }

  /**
   * Handles touchstart, pausing the autoadvance until the user lets go.
   */
  handleTouchStart_() {
    this.pause();

    listenOnce(
      window,
      'touchend',
      () => {
        this.resume();
      },
      {capture: true, passive: true}
    );
  }

  /**
   * @return {boolean} Whether or not autodadvancing should occur.
   * @private
   */
  shouldAutoAdvance_() {
    return (
      this.autoAdvance_ &&
      this.ampdoc_.isVisible() &&
      !this.paused_ &&
      !this.stopped_ &&
      this.advances_ < this.maxAdvances_
    );
  }

  /**
   * Handles scroll, resetting the auto advance.
   */
  handleScroll_() {
    this.resetAutoAdvance_();
  }

  /**
   * @param {!Event} event
   */
  handleIndexChange_(event) {
    const detail = getDetail(event);
    const actionSource = detail['actionSource'];

    if (actionSource && actionSource !== ActionSource.AUTOPLAY) {
      this.stop();
    }
  }

  /**
   * Advances, as long as we should still auto advance.
   */
  advance_() {
    if (!this.shouldAutoAdvance_()) {
      return;
    }

    this.advanceable_.advance(this.autoAdvanceCount_, {
      actionSource: ActionSource.AUTOPLAY,
      allowWrap: true,
    });
    this.advances_ += this.autoAdvanceCount_;
  }

  /**
   * Resets auto advance. If auto advance is disabled, this is a no-op. If it
   * is enabled, it starts a debounced timer for advancing.
   */
  resetAutoAdvance_() {
    if (!this.shouldAutoAdvance_()) {
      return;
    }

    // For auto advance, we simply set a timeout to advance once. When
    // scrolling stops, we will get called again. This makes sure we do not
    // advance while the user is scrolling (either by touching, mousewheel or
    // momentum).
    this.debouncedAdvance_();
  }
}
