/**
 * Copyright 2020 The AMP HTML Authors. All Rights Reserved.
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

import {LayoutPriority} from '../layout';
import {READY_SCAN_SIGNAL} from './resources-interface';
import {VisibilityState} from '../visibility-state';
import {getServiceForDoc, registerServiceBuilderForDoc} from '../service';
import {hasNextNodeInDocumentOrder, isIframed} from '../dom';
import {removeItem} from '../utils/array';

const ID = 'builder';

/** @implements {../service.Disposable} */
export class Builder {
  /** @param {!./ampdoc-impl.AmpDoc} ampdoc  */
  constructor(ampdoc) {
    /** @private @const */
    this.ampdoc_ = ampdoc;

    const {win} = ampdoc;

    /** @private @const {!IntersectionObserver} */
    this.observer_ = new win.IntersectionObserver((e) => this.observed_(e), {
      // Root bounds are not important, so we can use the `root:null` for a
      // top-level window.
      root: isIframed(win) ? win.document : null,
      rootMargin: '250% 31.25%',
      threshold: 0.001,
    });

    /** @private @const {!Map<!AmpElement, {asap: boolean, isIntersecting: boolean}>} */
    this.targets_ = new Map();

    /** @private {?Array<!AmpElement>} */
    this.parsingTargets_ = [];

    /** @private {boolean} */
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

    if (target.deferredBuild()) {
      this.targets_.set(target, {asap: false, isIntersecting: false});
      this.observer_.observe(target);
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

    if (this.parsingTargets_) {
      removeItem(this.parsingTargets_, target);
      this.checkParsing_();
    }
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
      vs == VisibilityState.VISIBLE ||
      vs == VisibilityState.HIDDEN ||
      vs == VisibilityState.PRERENDER
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
      const {target, isIntersecting} = entries[i];

      const current = this.targets_.get(target);
      if (!current) {
        continue;
      }

      this.targets_.set(target, {asap: current.asap, isIntersecting});
      if (isIntersecting) {
        this.maybeBuild_(target);
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
      (vs == VisibilityState.VISIBLE ||
        // Hidden (hidden tab) allows full build.
        vs == VisibilityState.HIDDEN ||
        // Prerender can only proceed when allowed.
        (vs == VisibilityState.PRERENDER && target.prerenderAllowed()));
    if (!toBuild) {
      return;
    }

    this.unschedule(target);

    // The high-priority elements are scheduled via `setTimeout`. All other
    // elements are scheduled via the `requestIdleCallback`.
    const {win} = this.ampdoc_;
    const scheduler =
      asap || target.getBuildPriority() <= LayoutPriority.CONTENT
        ? win.setTimeout
        : win.requestIdleCallback || win.setTimeout;
    scheduler(() => target.buildInternal());
  }
}

/**
 * @param {!./ampdoc-impl.AmpDoc} ampdoc
 * @return {!Builder}
 */
export function getBuilderForDoc(ampdoc) {
  registerServiceBuilderForDoc(ampdoc, ID, Builder);
  return /** @type {!Builder} */ (getServiceForDoc(ampdoc, ID));
}
