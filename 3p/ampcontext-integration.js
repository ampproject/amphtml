import {dev, user, userAssert} from '#utils/log';

import {computeInPrimaryFrame} from './3p';
import {AbstractAmpContext} from './ampcontext';

/**
 * Returns the "primary frame" for all widgets of a given type.
 * This frame should be used to e.g. fetch scripts that can
 * be reused across frames.
 * once experiment is removed.
 * @param {!Window} win
 * @param {string} type
 * @return {!Window}
 */
export function primarySelection(win, type) {
  type = type.toLowerCase();
  // The primary has a special name.
  const primaryName = 'frame_' + type + '_primary';
  let primary;
  try {
    // Try to get the primary from the parent. If it does not
    // exist yet we get a security exception that we catch
    // and ignore.
    primary = win.parent.frames[primaryName];
  } catch (expected) {
    /* ignore */
  }
  if (!primary) {
    // No primary yet, rename ourselves to be primary. Yaihh.
    win.name = primaryName;
    primary = win;
  }
  return primary;
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
  get primary() {
    return this.primary_();
  }

  /** @return {!Window} */
  primary_() {
    return primarySelection(this.win_, dev().assertString(this.embedType_));
  }

  /** @return {boolean} */
  get isPrimary() {
    return this.isPrimary_();
  }

  /** @return {boolean} */
  isPrimary_() {
    return this.primary == this.win_;
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
   * given type and the provide the respective value to all frames.
   * @param {!Window} global Your window
   * @param {string} taskId Must be not conflict with any other global variable
   *     you use. Must be the same for all callers from all frames that want
   *     the same result.
   * @param {function(function(*))} work Function implementing the work that
   *     is to be done. Receives a second function that should be called with
   *     the result when the work is done.
   * @param {function(*)} cb Callback function that is called when the work is
   *     done. The first argument is the result.
   */
  computeInPrimaryFrame(global, taskId, work, cb) {
    computeInPrimaryFrame(global, taskId, work, cb);
  }
}
