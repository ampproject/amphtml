/**
 * Copyright 2021 The AMP HTML Authors. All Rights Reserved.
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
import ampDoc from './ampdoc-impl';

const key = '__BENTO_ANALYTICS_SERVICES';

self[key] = Object.create(null);

// For now, we don't care:
// - All services are sync/bundled
// - All services are instantiated on register
// - The only window is the top window
// - No friendly iframes

/**
 * @param {!Window} win
 * @return {!Window}
 */
export function getTopWindow(win) {
  return win;
}

/**
 * @return {null}
 */
export function getParentWindowFrameElement() {
  return null;
}

/**
 * @param {*} unusedElementOrAmpDoc
 * @param {string} serviceName
 * @return {!Promise<!Object>}
 */
export function getServicePromiseForDoc(unusedElementOrAmpDoc, serviceName) {
  // eslint-disable-next-line local/no-forbidden-terms
  return Promise.resolve(getServiceForDoc(unusedElementOrAmpDoc, serviceName));
}

/* eslint-disable local/no-forbidden-terms */
/**
 * @param {*} unusedElementOrAmpDoc
 * @param {string} serviceName
 * @return {!Object}
 */
export function getServiceForDoc(unusedElementOrAmpDoc, serviceName) {
  /* eslint-enable local/no-forbidden-terms */
  return getService(self, serviceName);
}

/**
 * @param {*} unusedWin
 * @param {string} id
 * @return {!Object}
 */
export function getService(unusedWin, id) {
  return self[key][id];
}

/**
 * @param {*} unusedNodeOrAmpDoc
 * @param {string} id of the service.
 * @param {function(new:Object, typeof ampDoc)} constructor
 * @param {boolean=} unusedInstantiate unused, always instantiated
 */
export function registerServiceBuilderForDoc(
  unusedNodeOrAmpDoc,
  id,
  constructor,
  unusedInstantiate
) {
  registerServiceBuilder(self, id, constructor);
}

/**
 * @param {*} unusedWin
 * @param {string} id of the service.
 * @param {function(new:Object, typeof ampDoc)} constructor
 * @param {boolean=} unusedInstantiate unused, always instantiated
 */
export function registerServiceBuilder(
  unusedWin,
  id,
  constructor,
  unusedInstantiate
) {
  self[key][id] = new constructor(ampDoc);
}

/**
 * @param {*} unusedWin
 * @param {string} id
 * @return {!Object}
 */
export function getServicePromise(unusedWin, id) {
  return Promise.resolve(self[key][id]);
}

/**
 * @return {typeof ampDoc}
 */
export function getAmpdoc() {
  return ampDoc;
}

/**
 * Installs a service override on amp-doc level.
 * @param {!./service/ampdoc-impl.AmpDoc} ampdoc
 * @param {string} id
 * @param {!Object} service The service.
 */
export function installServiceInEmbedDoc(ampdoc, id, service) {
  // TODO(alanorozco): Do we ever hit this?
}
