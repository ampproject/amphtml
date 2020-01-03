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

import {devAssert} from './log';

/**
 * Key string in an action arguments map for an unparsed object literal string.
 *
 * E.g. for the action in <p on="tap:AMP.setState({foo: 'bar'})",
 * then `args[RAW_OBJECT_ARGS_KEY]` is the string "{foo: 'bar'}".
 *
 * The action service delegates parsing of object literals to the corresponding
 * extension (in the example above, amp-bind).
 *
 * @see ./service/action-impl.ActionInfoDef
 * @const {string}
 */
export const RAW_OBJECT_ARGS_KEY = '__AMP_OBJECT_STRING__';

/**
 * Identifier for an element's default action.
 *
 * @const {string}
 */
export const DEFAULT_ACTION = 'activate';

/**
 * Corresponds to degree of user intent, i.e. events triggered with strong
 * user intent have high trust.
 *
 * @enum {number}
 */
export const ActionTrust = {
  /**
   * Events that are triggered without a user gesture, or triggered by a user
   * gesture with weak intent (e.g. scroll) are "low trust".
   *
   * Actions that have low impact on the page's visual state should require
   * "low trust" (e.g. pausing a video).
   */
  LOW: 1,
  /**
   * Events that are triggered nearly immediately (up to a few seconds) after
   * a user gesture with strong intent (e.g. tap or swipe) are "default trust".
   *
   * Actions that can modify the page's visual state (e.g. content jumping)
   * should require "default trust". This is the default required trust level
   * for actions.
   */
  DEFAULT: 2,
  /**
   * Events that are triggered immediately after a user gesture with
   * strong intent (e.g. tap or swipe) are "high trust".
   *
   * There are no actions yet that require high trust.
   */
  HIGH: 3,
};

/**
 * @param {!ActionTrust} actionTrust
 * @return {string}
 */
export function actionTrustToString(actionTrust) {
  switch (actionTrust) {
    case ActionTrust.LOW:
      return 'low';
    case ActionTrust.HIGH:
      return 'high';
    default:
      devAssert(actionTrust === ActionTrust.DEFAULT);
      return 'default';
  }
}
