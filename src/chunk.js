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
import {isExperimentOn} from './experiments';
import {makeBodyVisible} from './style-installer';
import {viewerPromiseForDoc} from './viewer';

/**
 * @const {boolean}
 */
const shouldNotUseMacroTask = /nochunking/.test(self.location.href);

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
  const service = fromClassForDoc(nodeOrAmpDoc, 'chunk', Chunk);
  service.run_(fn);
};


class Chunk {
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
    this.active_ = isExperimentOn(this.win_, 'chunked-amp')
        && !shouldNotUseMacroTask;

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
   */
  run_(fn) {
    this.tasks_.push(fn);
    this.schedule_();
  }

  /**
   * Run a task.
   * Schedule the next round if there are more tasks.
   */
  execute_() {
    const t = this.tasks_.shift();
    if (!t) {
      return;
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
      dev().fine('chunk', t.displayName || t.name,
          'Duration', Date.now() - before);
    }
  }

  /**
   * Schedule running a task.
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
   */
  isVisible_() {
    // Ask the viewer or try to infer whether we are visible.
    return this.viewer_
        ? this.viewer_.isVisible()
        : !(/visibilityState=hidden/.test(this.win_.location.hash));
  }
}

/**
 * @return {!Promise}
 */
export function resolvedObjectforTesting() {
  return resolved;
}
