import {dev, user, userAssert} from '#utils/log';

import {computeInCoordinatingFrame} from './3p';
import {AbstractAmpContext} from './ampcontext';

/**
 * Returns the "coordinator frame" for all widgets of a given type.
 * This frame should be used to e.g. fetch scripts that can
 * be reused across frames.
 *
 * @param {!Window} win
 * @param {string} type
 * @return {!Window}
 */
export function coordinatorSelection(win, type) {
  type = type.toLowerCase();
  // The coordinator has a special name.
  const coordinatorName = 'frame_' + type + '_coordinator';
  let coordinator;
  try {
    // Try to get the coordinator from the parent. If it does not
    // exist yet we get a security exception that we catch
    // and ignore.
    coordinator = win.parent.frames[coordinatorName];
  } catch (expected) {
    /* ignore */
  }
  if (!coordinator) {
    // No coordinator yet, rename ourselves to be coordinator.
    win.name = coordinatorName;
    coordinator = win;
  }
  return coordinator;
}

export class IntegrationAmpContext extends AbstractAmpContext {
  /** @override */
  isAbstractImplementation_() {
    return false;
  }

  /**
   * @return {boolean}
   * @protected
   */
  updateDimensionsEnabled_() {
    // Only make this available to selected embeds until the generic solution is
    // available.
    return (
      this.embedType_ === 'facebook' ||
      this.embedType_ === 'twitter' ||
      this.embedType_ === 'github' ||
      this.embedType_ === 'mathml' ||
      this.embedType_ === 'reddit' ||
      this.embedType_ === 'yotpo' ||
      this.embedType_ === 'embedly'
    );
  }

  /** @return {!Window} */
  get coordinator() {
    return this.coordinator_();
  }

  /** @return {!Window} */
  coordinator_() {
    return coordinatorSelection(this.win_, dev().assertString(this.embedType_));
  }

  /** @return {boolean} */
  get isCoordinator() {
    return this.isCoordinator_();
  }

  /** @return {boolean} */
  isCoordinator_() {
    return this.coordinator == this.win_;
  }

  /**
   * @param {number} width
   * @param {number} height
   */
  updateDimensions(width, height) {
    userAssert(this.updateDimensionsEnabled_(), 'Not available.');
    this.requestResize(width, height);
  }

  /**
   * Sends bootstrap loaded message.
   */
  bootstrapLoaded() {
    this.client_.sendMessage('bootstrap-loaded');
  }

  /**
   * @param {!JsonObject=} opt_data Fields: width, height
   */
  renderStart(opt_data) {
    this.client_.sendMessage('render-start', opt_data);
  }

  /**
   * Reports the "entity" that was rendered to this frame to the parent for
   * reporting purposes.
   * The entityId MUST NOT contain user data or personal identifiable
   * information. One example for an acceptable data item would be the
   * creative id of an ad, while the user's location would not be
   * acceptable.
   * TODO(alanorozco): Remove duplicate in 3p/integration.js once this
   * implementation becomes canonical.
   * @param {string} entityId See comment above for content.
   */
  reportRenderedEntityIdentifier(entityId) {
    this.client_.sendMessage('entity-id', {
      'id': user().assertString(entityId),
    });
  }

  /**
   * Performs a potentially asynchronous task exactly once for all frames of a
   * given type and provides the respective value to all frames.
   * @param {!Window} global Your window
   * @param {string} taskId Must not conflict with any other global variable
   *     you use. Must be the same for all callers from all frames that want
   *     the same result.
   * @param {function(function(*))} work Function implementing the work that
   *     is to be done. Receives a second function that should be called with
   *     the result when the work is done.
   * @param {function(*)} cb Callback function that is called when the work is
   *     done. The first argument is the result.
   */
  computeInCoordinatingFrame(global, taskId, work, cb) {
    computeInCoordinatingFrame(global, taskId, work, cb);
  }
}

// -----------------------------------------------
// Global patch: alias context.master → context.coordinator
// -----------------------------------------------
if (self.context) {
  if (self.context.master && !self.context.coordinator) {
    self.context.coordinator = self.context.master;
  }
}
