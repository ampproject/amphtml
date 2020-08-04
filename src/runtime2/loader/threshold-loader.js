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

import {LoaderSetter} from './loader-interface';
import {mountComponent} from '../../context';

/** @implements {../loader-interface.LoaderInterface} */
export class ThresholdLoader {
  /**
   * @param {!Node} root
   */
  constructor(root) {
    this.io_ = new IntersectionObserver(this.handleIntersections_.bind(this), {
      root,
      rootMargin: '100% 25%',
    });
  }

  /** @override */
  dispose() {
    this.io_.disconnect();
  }

  /** @override */
  scheduleLoad(element) {
    // console.log('ThresholdLoader.scheduleLoad: ', element);
    this.io_.observe(element);
    return () => {
      this.io_.unobserve(element);
      // console.log('ThresholdLoader.scheduleLoad: cleanup');
    };
  }

  /**
   * @param {!IntersectionObserverEntry} records
   * @private
   */
  handleIntersections_(records) {
    records.forEach(({target, isIntersecting}) => {
      // console.log('ThresholdLoader.handleIntersections_: ', target, isIntersecting);
      if (isIntersecting) {
        // console.log('ThresholdLoader.handleIntersections_: load: ', target);
        this.io_.unobserve(target);
        setTimeout(() => {
          target.load();
        }, 2000);
      }
    });
  }
}

/**
 * @param {!Node} rootNode
 */
export function installThresholdLoader(rootNode) {
  mountComponent(rootNode, LoaderSetter, ThresholdLoader);
}
