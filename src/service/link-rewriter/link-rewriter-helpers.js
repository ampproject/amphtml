/**
 * Copyright 2018 The AMP HTML Authors. All Rights Reserved.
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

import {hasOwn} from '../../utils/object';
import {user} from '../../log';

/**
 * Create a response object for 'resolveUnknownAnchors()' function
 * in the format expected by LinkRewriter.
 *
 * Some replacement urls may be determined synchronously but others may need an
 * asynchronous call. Being able to return a sync and async response offers
 * flexibility to handle all these scenarios:
 *
 * - If you don't need any api calls to determine your replacement url.
 *   Use: createTwoStepsResponse(syncResponse)
 *
 * - If you need a an api call to determine your replacement url
 *   Use: createTwoStepsResponse(null, asyncResponse)
 *
 * - If you need an api call to determine your replacement url but
 *   have implemented a synchronous cache system.
 *   Use: createTwoStepsResponse(syncResponse, asyncResponse);
 *
 * - If you want to return a temporary replacement url until you get the
 *   real replacement url from your api call.
 *   Use:  createTwoStepsResponse(syncResponse, asyncResponse)
 *
 * @param {?./link-rewriter.AnchorReplacementList} syncResponse
 * @param {?Promise<!./link-rewriter.AnchorReplacementList>} asyncResponse
 * @return {./link-rewriter.TwoStepsResponse} - "two steps response" {syncResponse, asyncResponse}
 */
export function createTwoStepsResponse(syncResponse, asyncResponse) {
  if (asyncResponse) {
    user().assert(
        asyncResponse instanceof Promise,
        'createTwoStepsResponse(syncResponse, asyncResponse), if provided, ' +
        'second argument needs to be a promise'
    );
  }
  return {
    syncResponse,
    asyncResponse,
  };
}

/**
 *
 * @param {*} twoStepsResponse
 */
export function isTwoStepsResponse(twoStepsResponse) {
  const isValid =
    twoStepsResponse &&
    (hasOwn(twoStepsResponse, 'syncResponse') ||
      hasOwn(twoStepsResponse, 'asyncResponse'));

  return Boolean(isValid);
}
