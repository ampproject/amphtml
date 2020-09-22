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

import {registerServiceBuilderForDoc} from '../service';

/**
 * This is Resources v2 but much more taregtted. It deals only with questions
 * of loading.
 *
 * @implements {../service.Disposable}
 */
export class LoadScheduler {
  /**
   * @param {./ampdoc-impl.AmpDoc} ampdoc
   */
  constructor(ampdoc) {
    /** @const */
    this.ampdoc = ampdoc;

    /** @private @const */
    this.io_ = new IntersectionObserver(this.handleIntersections_.bind(this), {
      root: ampdoc.win.document,
      rootMargin: '100% 25%',
    });
  }

  /** @override */
  dispose() {
    this.io_.disconnect();
  }

  /**
   * @param {!AmpElement} element
   */
  schedule(element) {
    this.io_.observe(element);
  }

  /**
   * @param {!AmpElement} element
   */
  unschedule(element) {
    this.io_.unobserve(element);
  }

  /**
   * @param {!Array<!IntersectionObserverEntry>} records
   * @private
   */
  handleIntersections_(records) {
    records.forEach(({target, isIntersecting}) => {
      if (isIntersecting) {
        this.io_.unobserve(target);
        setTimeout(() => {
          target.load();
        }, 2000);
      }
    });
  }
}

/**
 * @param {!./ampdoc-impl.AmpDoc} ampdoc
 */
export function installLoadScheduler(ampdoc) {
  registerServiceBuilderForDoc(ampdoc, 'loadScheduler', LoadScheduler);
}
