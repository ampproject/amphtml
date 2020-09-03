/**
 * Copyright 2017 The AMP HTML Authors. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS-IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import {AbstractAmpContext} from './ampcontext';
import {adConfig} from '../ads/_config';
import {computeInMasterFrame} from './3p';
import {dev, user, userAssert} from '../src/log';
import {dict} from '../src/utils/object';

/**
 * Returns the "master frame" for all widgets of a given type.
 * This frame should be used to e.g. fetch scripts that can
 * be reused across frames.
 * once experiment is removed.
 * @param {!Window} win
 * @param {string} type
 * @return {!Window}
 */
export function masterSelection(win, type) {
  type = type.toLowerCase();
  const configType =
    adConfig[type] && adConfig[type]['masterFrameAccessibleType'];
  // The master has a special name.
  const masterName = 'frame_' + (configType || type) + '_master';
  let master;
  try {
    // Try to get the master from the parent. If it does not
    // exist yet we get a security exception that we catch
    // and ignore.
    master = win.parent.frames[masterName];
  } catch (expected) {
    /* ignore */
  }
  if (!master) {
    // No master yet, rename ourselves to be master. Yaihh.
    win.name = masterName;
    master = win;
  }
  return master;
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
  get master() {
    return this.master_();
  }

  /** @return {!Window} */
  master_() {
    return masterSelection(this.win_, dev().assertString(this.embedType_));
  }

  /** @return {boolean} */
  get isMaster() {
    return this.isMaster_();
  }

  /** @return {boolean} */
  isMaster_() {
    return this.master == this.win_;
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
    this.client_.sendMessage(
      'entity-id',
      dict({
        'id': user().assertString(entityId),
      })
    );
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
  computeInMasterFrame(global, taskId, work, cb) {
    computeInMasterFrame(global, taskId, work, cb);
  }
}
