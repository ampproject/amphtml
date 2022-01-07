import {devAssert} from '#core/assert';

/**
 * Key string in an action arguments map for an unparsed object literal string.
 *
 * E.g. for the action in <p on="tap:AMP.setState({foo: 'bar'})",
 * then `args[RAW_OBJECT_ARGS_KEY]` is the string "{foo: 'bar'}".
 *
 * The action service delegates parsing of object literals to the corresponding
 * extension (in the example above, amp-bind).
 *
 * See ./service/action-impl.ActionInfoDef
 * TODO(rcebulko): Revert to @see once type is available
 *
 * @type {string}
 * @const
 */
export const RAW_OBJECT_ARGS_KEY = '__AMP_OBJECT_STRING__';

/**
 * Identifier for an element's default action.
 *
 * @type {string}
 * @const
 */
export const DEFAULT_ACTION = 'activate';

/**
 * Corresponds to degree of user intent, i.e. events triggered with strong
 * user intent have high trust.
 *
 * @enum {number}
 */
export const ActionTrust_Enum = {
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
 * @param {ActionTrust_Enum} actionTrust
 * @return {string}
 */
export function actionTrustToString(actionTrust) {
  switch (actionTrust) {
    case ActionTrust_Enum.LOW:
      return 'low';
    case ActionTrust_Enum.HIGH:
      return 'high';
    default:
      devAssert(actionTrust === ActionTrust_Enum.DEFAULT);
      return 'default';
  }
}
