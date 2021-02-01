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

import {TCF_POST_MESSAGE_API_COMMANDS} from './consent-info';
import {isEnumValue, isObject} from '../../../src/types';
import {user} from '../../../src/log';

const TAG = 'amp-consent';

/**
 * @param {!Object} payload
 */
export function handleTcfCommand(payload) {
  const {command} = payload;

  switch (command) {
    case TCF_POST_MESSAGE_API_COMMANDS.GET_TC_DATA:
    case TCF_POST_MESSAGE_API_COMMANDS.PING:
    case TCF_POST_MESSAGE_API_COMMANDS.ADD_EVENT_LISTENER:
    case TCF_POST_MESSAGE_API_COMMANDS.REMOVE_EVENT_LISTENER:
    default:
      return;
  }
}

/**
 * Checks if the payload from the `tcfapiCall` is valid.
 * @param {JsonObject} payload
 * @return {boolean}
 */
export function isValidTcfApiCall(payload) {
  if (!isObject(payload)) {
    user().error(TAG, `"tcfapiCall" is not an object: ${payload}`);
    return false;
  }
  const {command, parameter, version} = payload;
  if (!isEnumValue(TCF_POST_MESSAGE_API_COMMANDS, command)) {
    user().error(TAG, `Unsupported command found in "tcfapiCall": ${command}`);
    return false;
  }
  if (parameter !== undefined) {
    user().error(
      TAG,
      `Unsupported parameter found in "tcfapiCall": ${parameter}`
    );
    return false;
  }
  if (version != '2') {
    user().error(TAG, `Found incorrect version in "tcfapiCall": ${version}`);
    return false;
  }
  return true;
}
