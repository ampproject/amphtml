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
import {parseUrl} from '../../../src/url';
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
   * Returns rendered byte count of base page. This may not be what was sent on the network.
   * @return {!Promise<string|undefined>}
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
   * Returns number of resources in ResourceTiming.
   * @return {!Promise<string|undefined>}
   */
  getResourceCount() {
    const res = this.getResources_();
    return (res && typeof res.length === 'number') ?
        Promise.resolve(String(res.length)) : Promise.resolve();
  }

  /**
   * Returns number of DOM nodes on the page.
   * @return {!Promise<string|undefined>}
   */
  getDomNodeCount() {
    const nodes = this.getNodes_('*');
    return (nodes && typeof nodes.length === 'number') ?
        Promise.resolve(String(nodes.length)) : Promise.resolve();
  }

  /**
   * Returns number of image nodes on the page.
   * @return {!Promise<string|undefined>}
   */
  getDomImgCount() {
    const nodes = this.getNodes_('img');
    return (nodes && typeof nodes.length === 'number') ?
        Promise.resolve(String(nodes.length)) : Promise.resolve();
  }

  /**
   * Returns number of image nodes on the page that referenced external URLs.
   * @return {!Promise<string|undefined>}
   */
  getDomExtImgCount() {
    const nodes = this.getNodes_('img', el =>
        { return el.src && !el.src.match(/^(?:about:|javascript:|data:|#)/); });
    return (nodes && typeof nodes.length === 'number') ?
        Promise.resolve(String(nodes.length)) : Promise.resolve();
  }

  /**
   * Returns number of script nodes on the page.
   * @return {!Promise<string|undefined>}
   */
  getDomScriptCount() {
    const nodes = this.getNodes_('script');
    return (nodes && typeof nodes.length === 'number') ?
        Promise.resolve(String(nodes.length)) : Promise.resolve();
  }

  /**
   * Returns number of script nodes on the page that referenced external URLs.
   * @return {!Promise<string|undefined>}
   */
  getDomExtScriptCount() {
    const nodes = this.getNodes_('script', el =>
        { return el.src && !el.src.match(/^(?:about:|javascript:|#)/); });
    return (nodes && typeof nodes.length === 'number') ?
        Promise.resolve(String(nodes.length)) : Promise.resolve();
  }

  /**
   * Returns number of distinct domains referenced from the page.
   * @return {!Promise<string|undefined>}
   */
  getDomainCount() {
    const res = this.getResources_();
    const doms = {};
    let urlInfo;
    if (res === null) {
      return Promise.resolve();
    }

    [].forEach.call(res, r => {
      urlInfo = parseUrl(r.name);
      if (urlInfo.hostname) {
        doms[urlInfo.hostname] = true;
      }
    });

    return Promise.resolve(String(Object.keys(doms).length));
  }

  /**
   * Returns compressed resource timing data.
   * @return {!Promise<string|undefined>}
   */
  getResourceTiming() {
    let rt;
    this.from_ = Date.now();
    rt = rtcGetResourceTiming(this.win_);
    return (rt && Object.keys(rt).length > 0) ? Promise.resolve(JSON.stringify(rt)) : Promise.resolve();
  }

  /**
   * Get ResourceTiming entries.
   * @return {Array<PerformanceResourceTiming>}
   * @private
   */
  getResources_() {
    const p = ('performance' in this.win_) && this.win_['performance'];
    if (!p || typeof p['getEntriesByType'] !== 'function') {
      // ResourceTiming interface is not supported.
      return null;
    }
    return p.getEntriesByType('resource');
  }

  /**
   * Get DOM elements that match type and filter.
   * @param {String} element type
   * @param {function(Object)=} filter
   * @return {Array<HTMLElement>} DOM elements
   * @private
   */
  getNodes_(type, filter) {
    const d = this.win_['document'];
    let nodes, node, result = [], i = -1, length;
    if (!d || typeof d['getElementsByTagName'] !== 'function') {
      return null;
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
 */
export function installAmpAnalyticsResourcesService(window) {
  return getService(window, 'analytics-resources', () => {
    return new AnalyticsResourcesService(window);
  });
};
