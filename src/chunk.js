/**
 * Copyright 2016 The AMP HTML Authors. All Rights Reserved.
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

import {dev} from './log';
import {fromClassForDoc} from './service';
import {isExperimentOnAllowUrlOverride} from './experiments';
import {makeBodyVisible} from './style-installer';
import {viewerPromiseForDoc} from './viewer';

/**
 * @type {boolean}
 */
let deactivated = /nochunking=1/.test(self.location.hash);

/**
 * @const {!Promise}
 */
const resolved = Promise.resolve();

/**
 * Run the given function. For visible documents the function will be
 * called in a micro task (Essentially ASAP). If the document is
 * not visible, tasks will yield to the event loop (to give the browser
 * time to do other things) and may even be further delayed until
 * there is time.
 *
 * @param {!Node|!./service/ampdoc-impl.AmpDoc} nodeOrAmpDoc
 * @param {function()} fn Function that will be called as a "chunk".
 */
export function chunk(nodeOrAmpDoc, fn) {
  if (deactivated) {
    resolved.then(fn);
    return;
  }
  const service = fromClassForDoc(nodeOrAmpDoc, 'chunk', Chunks);
  service.run_(fn);
};

/**
 * Use a standard micro task for every invocation. This should only
 * be called from the AMP bootstrap script if it is known that
 * chunking makes no sense. In particular this is the case when
 * AMP runs in the `amp-shadow` multi document mode.
 */
export function deactivateChunking() {
  deactivated = true;
};

export function activateChunkingForTesting() {
  deactivated = false;
};

/**
 * Runs all currently scheduled chunks.
 * Independent of errors it will unwind the queue. Will afterwards
 * throw the first encountered error.
 * @param {!Node|!./service/ampdoc-impl.AmpDoc} nodeOrAmpDoc
 */
export function runChunksForTesting(nodeOrAmpDoc) {
  const service = fromClassForDoc(nodeOrAmpDoc, 'chunk', Chunks);
  const errors = [];
  while (true) {
    try {
      if (!service.execute_()) {
        break;
      }
    } catch (e) {
      errors.push(e);
    }
  }
  if (errors.length) {
    throw errors[0];
  }
}

class Chunks {
  /**
   * @param {!./service/ampdoc-impl.AmpDoc} ampDoc
   */
  constructor(ampDoc) {
    /** @private @const */
    this.ampDoc_ = ampDoc;
    /** @private @const {!Window} */
    this.win_ = ampDoc.win;
    /** @private @const {!Array<function()>} */
    this.tasks_ = [];
    /** @private {?./service/viewer-impl.Viewer} */
    this.viewer_ = null;
    /** @private @const {function()} */
    this.boundExecute_ = () => this.execute_();
    /** @private @const {boolean} */
    this.active_ = isExperimentOnAllowUrlOverride(this.win_, 'chunked-amp');

    if (!this.active_) {
      return;
    }
    if (!this.win_.requestIdleCallback) {
      this.win_.addEventListener('message', this.boundExecute_);
    }
    viewerPromiseForDoc(ampDoc).then(viewer => {
      this.viewer_ = viewer;
      viewer.onVisibilityChanged(() => {
        if (viewer.isVisible()) {
          this.execute_();
        }
      });
      if (viewer.isVisible()) {
        this.execute_();
      }
    });
  }

  /**
   * Run fn as a "chunk". It'll run in a micro task when the doc is visible
   * and otherwise run it after having yielded to the event queue once.
   * @param {function()} fn
   * @private
   */
  run_(fn) {
    this.tasks_.push(fn);
    this.schedule_();
  }

  /**
   * Run a task.
   * Schedule the next round if there are more tasks.
   * @return {boolean} Whether anything was executed.
   * @private
   */
  execute_() {
    const t = this.tasks_.shift();
    if (!t) {
      return false;
    }
    const before = Date.now();
    try {
      t();
    } catch (e) {
      // We run early in init. All errors should show the doc.
      makeBodyVisible(self.document);
      throw e;
    } finally {
      if (this.tasks_.length) {
        this.schedule_();
      }
      dev().fine('CHUNK', t.displayName || t.name,
          'Duration', Date.now() - before);
    }
    return true;
  }

  /**
   * Schedule running a task.
   * @private
   */
  schedule_() {
    if (!this.active_ || this.isVisible_()) {
      resolved.then(this.boundExecute_);
      return;
    }
    // If requestIdleCallback exists, schedule a task with it, but
    // do not wait longer than one second.
    if (this.win_.requestIdleCallback) {
      this.win_.requestIdleCallback(this.boundExecute_, {
        timeout: 1000,
      });
      return;
    }
    // The message doesn't actually matter.
    this.win_.postMessage/*OK*/('amp-macro-task', '*');
  }

  /**
   * @return {boolean}
   * @private
   */
  isVisible_() {
    // Ask the viewer first.
    if (this.viewer_) {
      return this.viewer_.isVisible();
    }
    // There is no viewer yet. Lets try to guess whether we are visible.
    if (this.win_.document.hidden) {
      return false;
    }
    // Viewers send a URL param if we are not visible.
    return !(/visibilityState=(hidden|prerender)/.test(
        this.win_.location.hash));
  }
}

/**
 * @return {!Promise}
 */
export function resolvedObjectforTesting() {
  return resolved;
}
