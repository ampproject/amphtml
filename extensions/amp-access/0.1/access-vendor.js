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


/**
 * This interface is intended to be implemented by AMP Access vendors to
 * provide authorization and pingback.
 * @interface
 */
export class AccessVendor {

  /**
   * Requests authorization from the vendor. Returns a promise that yields
   * a JSON authorization response.
   * @return {!Promise<!JsonObject>}
   */
  authorize() {}

  /**
   * Registeres the "viewed" event as a pingback to the authorization vendor.
   * This signal can be used to count-down quotas.
   * @return {!Promise}
   */
  pingback() {}
}
