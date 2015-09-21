/**
 * Copyright 2015 The AMP HTML Authors. All Rights Reserved.
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

import {log} from './log';
import {platform} from './platform';
import {timer} from './timer';

let TAG_ = 'Action';

let ACTION_MAP_ = '__AMP_ACTION_MAP__' + Math.random();
let DEFAULT_EVENT_ = 'tap';
let DEFAULT_METHOD_ = 'activate';


/**
 * @typedef {{
 *   event: string,
 *   target: string,
 *   method: string,
 *   str: string
 * }}
 */
class ActionInfo_ {};


/**
 * TODO(dvoytenko): consider splitting this class into two:
 * 1. A class that has a method "trigger(element, eventType, data)" and
 *    simply can search target in DOM and trigger methods on it.
 * 2. A class that configures event recognizers and rules and then
 *    simply calls action.trigger.
 */
export class Action {

  /**
   * @param {!Window} win
   */
  constructor(win) {
    /** @const {!Window} */
    this.win = win;
  }

  /**
   * @param {string} name
   * TODO(dvoytenko): switch to a system where the event recognizers are
   * registered with Action instead, e.g. "doubletap", "tap to zoom".
   */
  addEvent(name) {
    if (name == 'tap') {
      // TODO(dvoytenko): if needed, also configure touch-based tap, e.g. for
      // fast-click.
      this.win.document.addEventListener('click', (event) => {
        if (!event.defaultPrevented) {
          this.action_('tap', event);
        }
      });
    }
  }

  /**
   * @param {string} actionEventType
   * @param {!Event} event
   * @private
   */
  action_(actionEventType, event) {
    let action = this.findAction_(event.target, actionEventType);
    if (!action) {
      return;
    }

    var target = document.getElementById(action.actionInfo.target);
    if (target) {
      this.invoke_(target, action.actionInfo);
    } else {
      this.actionInfoError_('target not found', action.actionInfo, target);
    }
  }

  /**
   * The errors that are a result of action definition.
   * @param {string} s
   * @param {?ActionInfo} actionInfo
   * @param {?Element} target
   * @private
   */
  actionInfoError_(s, actionInfo, target) {
    // Method not found "activate" on ' + target
    throw new Error('Action Error: ' + s +
        (actionInfo ? ' in [' + actionInfo.str + ']' : '') +
        (target ? ' on [' + target + ']' : ''));
  }

  /**
   * @param {!Element} target
   * @param {!ActionInfo} actionInfo
   */
  invoke_(target, actionInfo) {
    let method = actionInfo.method;
    // TODO(dvoytenko): introduce two systems:
    // 1. Action.registerMethod('toggleClass'): we can add arbitrary
    //    actions to all elements. toggleClass is a good example.
    // 2. CustomElement.registerAction(name, function): this way elements
    //    can register any methods that they want to expose to Action.
    // TODO(dvoytenko): promise for not-yet-upgraded event.
    if (method == 'activate') {
      if (target.activate) {
        target.activate();
      } else {
        this.actionInfoError_('method not found', actionInfo, target);
      }
    } else {
      this.actionInfoError_('not implemented', actionInfo, target);
    }
  }

  /**
   * @param {!Element} target
   * @param {string} actionEventType
   * @return {?{node: !Element, actionInfo: !ActionInfo_}}
   */
  findAction_(target, actionEventType) {
    // Go from target up the DOM tree and find the applicable action.
    let n = target;
    let actionInfo = null;
    while (n) {
      actionInfo = this.matchActionInfo_(n, actionEventType);
      if (actionInfo) {
        return {node: n, actionInfo: actionInfo};
      }
      n = n.parentElement;
    }
    return null;
  }

  /**
   * @param {!Element} node
   * @param {string} actionEventType
   * @return {?ActionInfo_}
   */
  matchActionInfo_(node, actionEventType) {
    let actionMap = this.getActionMap_(node);
    if (!actionMap) {
      return null;
    }
    return actionMap[actionEventType] || null;
  }

  /**
   * @param {!Element} node
   * @return {?Object<string, ActionInfo_>}
   */
  getActionMap_(node) {
    let actionMap = node[ACTION_MAP_];
    if (actionMap === undefined) {
      actionMap = null;
      if (node.hasAttribute('on')) {
        actionMap = this.parseActionMap_(node.getAttribute('on'));
      }
      node[ACTION_MAP_] = actionMap;
    }
    return actionMap;
  }

  /**
   * @param {string} s
   * @return {?Object<string, ActionInfo_>}
   */
  parseActionMap_(s) {
    let actionMap = null;
    let actions = s.split(';');
    if (actions && actions.length > 0) {
      for (let i = 0; i < actions.length; i++) {
        let actionStr = actions[i];
        let actionInfo = this.parseAction_(actionStr);
        if (actionInfo) {
          if (!actionMap) {
            actionMap = {};
          }
          actionMap[actionInfo.event] = actionInfo;
        }
      }
    }
    return actionMap;
  }

  /**
   * @param {string} s
   * @return {?ActionInfo_}
   */
  parseAction_(s) {
    s = s.trim();
    if (!s) {
      return null;
    }

    let eventSep = s.indexOf(':');
    let methodSep = s.indexOf('.', eventSep + 1);
    let event = (eventSep != -1 ? s.substring(0, eventSep) : '').toLowerCase().
        trim() || DEFAULT_EVENT_;
    let target = s.substring(eventSep + 1, methodSep != -1 ? methodSep :
        s.length).trim();
    let method = (methodSep != -1 ? s.substring(methodSep + 1) : '').
        trim() || DEFAULT_METHOD_;

    if (!target) {
      // TODO(dvoytenko): report action info parse errors separately
      log.error(TAG_, 'invalid action definition: ' + s);
      return null;
    }
    return {event: event, target: target, method: method, str: s};
  }
};


export const action = new Action(window);
