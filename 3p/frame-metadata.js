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

import {dev} from '../src/log';
import {dict} from '../src/utils/object.js';
import {getMode} from '../src/mode';
import {once} from '../src/utils/function.js';
import {parseJson} from '../src/json';
import {parseUrl} from '../src/url';


/**
 * @typedef {{
 *  ampcontextFilepath: ?string,
 *  ampcontextVersion: ?string,
 *  canary: ?boolean,
 *  canonicalUrl: ?string,
 *  clientId: ?string,
 *  container: ?string,
 *  domFingerprint: ?string,
 *  hidden: ?boolean,
 *  initialIntersection: ?IntersectionObserverEntry,
 *  initialLayoutRect:
 *      ?{left: number, top: number, width: number, height: number},
 *  pageViewId: ?string,
 *  referrer: ?string,
 *  sentinel: ?string,
 *  sourceUrl: ?string,
 *  startTime: ?number,
 *  tagName: ?string,
 * }}
 */
export let ContextStateDef;


/** @const {!JsonObject} */
const FALLBACK = dict({
  'attributes': dict({}),
  'context': dict({}),
  'config': dict({}),
});


const createFromWindowName = once(() => FrameMetadata.fromString(window.name));


function parseSerialized(serializedData) {
  try {
    return parseJson(serializedData);
  } catch (err) {
    if (!getMode().test) {
      dev().info(
          'INTEGRATION', 'Could not parse context from:', serializedData);
    }
    return FALLBACK;
  }
}


export class FrameMetadata {
  /** @return {!FrameMetadata} */
  static fromWindowName() {
    // Defined indirectly since `once()` cannot be used with `static`.
    return createFromWindowName();
  }

  /**
   * @param {string} serializedData
   * @return {!FrameMetadata}
   */
  static fromString(serializedData) {
    return FrameMetadata.fromObj(parseSerialized(serializedData));
  }

  /**
   * @param {!JsonObject} obj
   * @return {!FrameMetadata}
   */
  static fromObj(obj) {
    return new FrameMetadata(obj);
  }

  /**
   * @param {!JsonObject} obj
   */
  constructor(obj) {
    /** @private @const {!JsonObject} */
    this.obj_ = obj;
  }

  /** @return {{mode: !Object, experimentToggles: !Object}} */
  getAmpConfig() {
    return {
      mode: this.obj_['config'].mode,
      experimentToggles: this.obj_['config'].experimentToggles,
    };
  }

  /** @return {!JsonObject} */
  getAttributeData() {
    return this.obj_['attributes'];
  }

  /** @retun {string} */
  getLocation() {
    return parseUrl(this.obj_['context']['location']['href']);
  }

  /** @return {!ContextStateDef} */
  getContextState() {
    const rawContext = this.obj_['context'];

    return /** @type {!ContextStateDef} */ ({
      ampcontextFilepath: rawContext['ampcontextFilepath'],
      ampcontextVersion: rawContext['ampcontextVersion'],
      canary: rawContext['canary'],
      canonicalUrl: rawContext['canonicalUrl'],
      clientId: rawContext['clientId'],
      container: rawContext['container'],
      domFingerprint: rawContext['domFingerprint'],
      hidden: rawContext['hidden'],
      initialIntersection: rawContext['initialIntersection'],
      initialLayoutRect: rawContext['initialLayoutRect'],
      pageViewId: rawContext['pageViewId'],
      referrer: rawContext['referrer'],
      sentinel: rawContext['sentinel'],
      sourceUrl: rawContext['sourceUrl'],
      startTime: rawContext['startTime'],
      tagName: rawContext['tagName'],
    });
  }

  /** @return {string} */
  getEmbedType() {
    return this.obj_['type'];
  }

  /** @return {?string} */
  getSentinelOptional() {
    return this.obj_['context']['sentinel'] || null;
  }
}
