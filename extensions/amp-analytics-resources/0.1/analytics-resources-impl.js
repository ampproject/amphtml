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

import {getService} from '../../../src/service';
import {
  getResourceTiming as rtcGetResourceTiming,
} from 'resourcetiming-compression/src/resourcetiming-compression';

/** @private Visible for testing. */
export class AnalyticsResourcesService {
  constructor(window) {
    /** @const {!Window} */
    this.win_ = window;
  }

  /**
   * Rendered byte count of base page. This may not be what was sent on the network.
   */
  getDocumentLength() {
    const innerHTML = this.win_['document'] &&
        this.win_['document']['documentElement'] &&
        this.win_['document']['documentElement']['innerHTML'];
    if (!innerHTML || typeof innerHTML.length !== 'number') {
      return Promise.resolve();
    }
    return Promise.resolve(String(innerHTML.length));
  }

  /**
   * Number of resources in ResourceTiming.
   */
  getResourceCount() {
    const res = this.getResources_();
    return (res && res.length) ?
        Promise.resolve(String(res.length)) : Promise.resolve('0');
  }

  /**
   * Returns number of DOM nodes on the page.
   */
  getDomNodeCount() {
    const nodes = this.getNodes_('*');
    return (nodes && nodes.length) ?
        Promise.resolve(String(nodes.length)) : Promise.resolve('0');
  }

  /**
   * Returns number of image nodes on the page.
   */
  getDomImgCount() {
    const nodes = this.getNodes_('img');
    return (nodes && nodes.length) ?
        Promise.resolve(String(nodes.length)) : Promise.resolve('0');
  }

  /**
   * Returns number of image nodes on the page that referenced external URLs.
   */
  getDomExtImgCount() {
    const nodes = this.getNodes_('img', el =>
        { return el.src && !el.src.match(/^(?:about:|javascript:|data:|#)/); });
    return (nodes && nodes.length) ?
        Promise.resolve(String(nodes.length)) : Promise.resolve('0');
  }

  /**
   * Returns number of script nodes on the page.
   */
  getDomScriptCount() {
    const nodes = this.getNodes_('script');
    return (nodes && nodes.length) ?
        Promise.resolve(String(nodes.length)) : Promise.resolve('0');
  }

  /**
   * Returns number of script nodes on the page that referenced external URLs.
   */
  getDomExtScriptCount() {
    const nodes = this.getNodes_('script', el =>
        { return el.src && !el.src.match(/^(?:about:|javascript:|#)/); });
    return (nodes && nodes.length) ?
        Promise.resolve(String(nodes.length)) : Promise.resolve('0');
  }

  /**
   * Returns number of distinct domains referenced from the page.
   */
  getDomainCount() {
    const res = this.getResources_();
    const doms = {};
    let a;
    if (!res || !this.win_['document']
        || typeof this.win_['document']['createElement'] !== 'function') {
      return Promise.resolve();
    }

    // use an 'a' element to do the url parsing
    a = this.win_.document.createElement('a');
    [].forEach.call(res, r => {
      a.href = r.name;
      doms[a.hostname] = true;
    });

    return Promise.resolve(String(Object.keys(doms).length));
  }

  /**
   * Returns the compressed resource timing data.
   */
  getResourceTiming() {
    this.from_ = Date.now();
    return Promise.resolve(
        JSON.stringify(rtcGetResourceTiming(this.win_))
    );
  }

  /**
   * Get ResourceTiming entries
   * @return {!Array} array of PerformanceResourceTiming entries
   * @private
   */
  getResources_() {
    const p = ('performance' in this.win_) && this.win_['performance'];
    if (!p || typeof p['getEntriesByType'] !== 'function') {
      // ResourceTiming interface is not supported.
      return [];
    }
    return p.getEntriesByType('resource');
  }

  /**
   * Get DOM elements that match type and filter
   * @param {String} element type
   * @param {function(Object)=} filter
   * @return {!Array} array of DOM elements
   * @private
   */
  getNodes_(type, filter) {
    const d = this.win_['document'];
    let nodes, node, result = [], i = -1, length;
    if (!d || typeof d['getElementsByTagName'] !== 'function') {
      return Promise.resolve();
    }
    nodes = d.getElementsByTagName(type);
    if (nodes && typeof filter === 'function') {
      length = nodes.length;
      while (++i < length) {
        node = nodes[i];
        if (filter(node)) {
          result[result.length] = node;
        }
      }
    }
    else {
      result = nodes;
    }
    return result;
  }
}

/**
 * @param {!Window} win
 * @return {!Object} All services need to return an object to "load".
 * @visiblefortesting
 */
export function installAmpAnalyticsResourcesService(window) {
  return getService(window, 'analytics-resources', () => {
    return new AnalyticsResourcesService(window);
  });
};
