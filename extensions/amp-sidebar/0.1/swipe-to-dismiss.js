import {setStyles} from '#core/dom/style';

import {dev} from '#utils/log';

import {delayAfterDeferringToEventLoop} from './utils';

import {SwipeDef} from '../../../src/gesture-recognizers';

/**
 * The distance needed to dismiss the swipe element, as fraction of its length.
 */
const SWIPE_TO_CLOSE_DISTANCE_THRESHOLD = 0.5;
/**
 * The velocity at which to close element from a swipe, regardless of distance.
 */
const SWIPE_TO_CLOSE_VELOCITY_THRESHOLD = 0.65;
/**
 * How much distance to cover, based on the velocity, when a user releases a
 * swipe to close gesture.
 */
const SWIPE_TO_CLOSE_VELOCITY_TO_DISTANCE_FACTOR = 22.5;
/**
 * How much time to spend, based on the distance to travel, when moving to the
 * final location of a swipe (after the user has released).
 */
const SWIPE_TO_CLOSE_DISTANCE_TO_TIME_FACTOR = 0.75;
/**
 * How much time to spend, based on the distance to travel, when snapping back
 * after an cancelled swipe to close gesture.
 */
const SWIPE_TO_CLOSE_SNAP_BACK_TIME_FACTOR = 0.8;
/**
 * The timing function to use when carrying momentum after releasing a swipe to
 * close gesture. This closely approximates an expontential decay of velocity.
 */
const SWIPE_TO_CLOSE_MOMENTUM_TIMING = 'cubic-bezier(0.15, .55, .3, 0.95)';

/**
 * Direction in which swipe to dismiss is allowed.
 * @const @enum {string}
 */
export const Direction = {
  BACKWARD: 'backward',
  FORWARD: 'forward',
};

/**
 * Orientation in which swipe to dismiss is allowed.
 * @const @enum {string}
 */
export const Orientation = {
  HORIZONTAL: 'horizontal',
  VERTICAL: 'vertical',
};

/**
 * Maintains state and updates the UI for a swipe to dismiss gesture.
 */
export class SwipeToDismiss {
  /**
   * @param {!Window} win
   * @param {function(function())} mutateElement
   * @param {function()} onclose
   */
  constructor(win, mutateElement, onclose) {
    /** @private @const */
    this.win_ = win;

    /** @private @const */
    this.mutateElement_ = mutateElement;

    /** @private @const */
    this.onclose_ = onclose;

    /** @private {!Direction} */
    this.direction_ = Direction.BACKWARD;

    /** @private {!Orientation} */
    this.orientation_ = Orientation.HORIZONTAL;

    /**
     * The element that is moving with the swipe to dismiss.
     * @private {?Element}
     */
    this.swipeElement_ = null;

    /**
     * A background mask element behind the swipe element.
     * @private {?Element}
     */
    this.mask_ = null;
  }

  /**
   * Get the swipe element's width or height, depending on orientation of swipe.
   * @return {number} length in pixels
   */
  getSwipeElementLength_() {
    return this.orientation_ == Orientation.HORIZONTAL
      ? this.swipeElement_./*OK*/ offsetWidth
      : this.swipeElement_./*OK*/ offsetHeight;
  }

  /**
   * Caps the amount to shift swipe element based on orientation and direction.
   * @param {number} deltaX
   * @param {number} deltaY
   * @return {number} The absolute shift distance in pixels.
   */
  capDistance_(deltaX, deltaY) {
    const delta = this.orientation_ == Orientation.HORIZONTAL ? deltaX : deltaY;
    return this.direction_ == Direction.BACKWARD
      ? -Math.min(delta, 0)
      : Math.max(delta, 0);
  }

  /**
   * Builds a string for the transform property that translates by given amount.
   * @param {number} value
   * @param {string} unit
   * @return {string}
   */
  translateBy_(value, unit = '') {
    const distance = this.direction_ == Direction.BACKWARD ? -value : value;
    const x =
      this.orientation_ == Orientation.HORIZONTAL ? `${distance}${unit}` : 0;
    const y =
      this.orientation_ == Orientation.HORIZONTAL ? 0 : `${distance}${unit}`;
    return `translate(${x}, ${y})`;
  }

  /**
   * Handles the start of a swipe.
   * @param {{
   *   swipeElement: !Element,
   *   mask: !Element,
   * }} config
   */
  startSwipe(config) {
    const {direction, mask, orientation, swipeElement} = config;
    this.swipeElement_ = swipeElement;
    this.mask_ = mask;
    this.direction_ = direction;
    this.orientation_ = orientation;
  }

  /**
   * Handles a swipe move.
   * @param {!SwipeDef} data
   */
  swipeMove(data) {
    this.swipeMove_(data, false);
  }

  /**
   * Handles the end of a swipe.
   * @param {!SwipeDef} data
   */
  endSwipe(data) {
    this.swipeMove_(data, true);
  }

  /**
   * Carries momentum for the swipe forwards to a final destination, with the
   * duration depending on the velocity.
   * @param {number} distance How far we should keep moving.
   * @param {number} velocity The current velocity.
   * @return {Promise} A Promise that resolves once momentum based movement ends.
   * @private
   */
  carrySwipeMomentum_(distance, velocity) {
    const duration = velocity * SWIPE_TO_CLOSE_DISTANCE_TO_TIME_FACTOR;

    setStyles(dev().assertElement(this.swipeElement_), {
      transform: this.translateBy_(distance, 'px'),
      transition: `${duration}ms transform ${SWIPE_TO_CLOSE_MOMENTUM_TIMING}`,
    });

    return delayAfterDeferringToEventLoop(this.win_, duration);
  }

  /**
   * Snaps back to the starting point, with the duration based on the distance
   * that needs to be travelled.
   * @param {number} finalDistance
   * @return {Promise} A Promise that resolves once the snapping has completed.
   * @private
   */
  snapBackFromSwipe_(finalDistance) {
    const duration = finalDistance * SWIPE_TO_CLOSE_SNAP_BACK_TIME_FACTOR;

    return this.mutateElement_(() => {
      setStyles(dev().assertElement(this.swipeElement_), {
        transform: this.translateBy_(0),
        transition: `${duration}ms transform ease-in`,
      });
      setStyles(dev().assertElement(this.mask_), {
        opacity: '',
        transition: `${duration}ms opacity ease-in`,
      });
    }).then(() => {
      return delayAfterDeferringToEventLoop(this.win_, duration);
    });
  }

  /**
   * Animate element to close position, with the duration based on the distance
   * that needs to be travelled.
   * @param {number} finalDistance
   * @return {!Promise} A Promise that resolves once dismissal has completed.
   * @private
   */
  dismissFromSwipe_(finalDistance) {
    const remainingDistance = this.getSwipeElementLength_() - finalDistance;
    const duration = remainingDistance * SWIPE_TO_CLOSE_DISTANCE_TO_TIME_FACTOR;

    return this.mutateElement_(() => {
      setStyles(dev().assertElement(this.swipeElement_), {
        transform: this.translateBy_(100, '%'),
        transition: `${duration}ms transform ease-out`,
      });
      setStyles(dev().assertElement(this.mask_), {
        opacity: 0,
        transition: `${duration}ms opacity ease-out`,
      });
    })
      .then(() => delayAfterDeferringToEventLoop(this.win_, duration))
      .then(() => this.onclose_());
  }

  /**
   * Adjusts the UI elements for the current swipe position in a swipe to
   * dismiss gesture. This should be called in a mutate context.
   * @param {string} swipeElementTransform How to transform the swiping
   *    element.
   * @param {number|string} maskOpacity The opacity for the mask element.
   *    container.
   * @private
   */
  adjustForSwipePosition_(swipeElementTransform = '', maskOpacity = '') {
    setStyles(dev().assertElement(this.swipeElement_), {
      transform: swipeElementTransform,
      transition: '',
    });
    setStyles(dev().assertElement(this.mask_), {
      opacity: maskOpacity,
      transition: '',
    });
  }

  /**
   * Releases the user's swipe to dismiss gesture. This carries the momentum
   * forwards and either closes the lightbox or snaps back based on the speed
   * and distance. This should be called in a mutate context.
   * @param {number} velocityX The X velocity when the swipe was released.
   * @param {number} velocityY The Y velocity when the swipe was released.
   * @param {number} deltaX The x distance when the swipe was released.
   * @param {number} deltaY The y distance when the swipe was released.
   * @return {!Promise} A Promise that resolves once the release is completed,
   *    either snapping back to the start or closing the carousel.
   * @private
   */
  releaseSwipe_(velocityX, velocityY, deltaX, deltaY) {
    const distanceX = velocityX * SWIPE_TO_CLOSE_VELOCITY_TO_DISTANCE_FACTOR;
    const distanceY = velocityY * SWIPE_TO_CLOSE_VELOCITY_TO_DISTANCE_FACTOR;
    const finalDeltaX = distanceX + deltaX;
    const finalDeltaY = distanceY + deltaY;
    // We want to figure out the final distance we will rest at if the user
    // flicked the element and use that to determine we should animate to. We
    // will then use that resting position to determine if we should snap back
    // or close.
    const finalDistance = this.capDistance_(finalDeltaX, finalDeltaY);
    const finalVelocity = this.capDistance_(velocityX, velocityY);

    const swipeToCloseDistance =
      this.getSwipeElementLength_() * SWIPE_TO_CLOSE_DISTANCE_THRESHOLD;
    if (
      finalDistance < swipeToCloseDistance &&
      finalVelocity < SWIPE_TO_CLOSE_VELOCITY_THRESHOLD
    ) {
      return this.carrySwipeMomentum_(finalDistance, finalVelocity).then(() =>
        this.snapBackFromSwipe_(finalDistance)
      );
    }

    return this.dismissFromSwipe_(finalDistance);
  }

  /**
   *
   * @param {!SwipeDef} data The data for the swipe.
   * @param {boolean} isLast If this move is the last movement for the swipe.
   */
  swipeMove_(data, isLast) {
    const {deltaX, deltaY, velocityX, velocityY} = data;

    this.mutateElement_(() => {
      if (isLast) {
        this.releaseSwipe_(velocityX, velocityY, deltaX, deltaY).then(() => {
          this.adjustForSwipePosition_();
        });
        return;
      }

      const swipeDistance = this.capDistance_(deltaX, deltaY);
      const swipeFraction = swipeDistance / this.getSwipeElementLength_();
      const maskOpacity = Math.max(0, 1 - swipeFraction);

      this.adjustForSwipePosition_(
        this.translateBy_(swipeDistance, 'px'),
        maskOpacity
      );
    });
  }
}
