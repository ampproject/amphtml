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

/** @const {string} */
const TAG_ = 'Action';

/** @const {string} */
const ACTION_MAP_ = '__AMP_ACTION_MAP__' + Math.random();

/** @const {string} */
const DEFAULT_METHOD_ = 'activate';


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
 * The structure that contains all details of the action method invocation.
 * @struct
 * @const
 * TODO(dvoytenko): add action arguments here as well.
 */
class ActionInvocation {
  /**
   * @param {!Element} target
   * @param {string} method
   * @param {?Element} source
   * @param {?Event} event
   */
  constructor(target, method, source, event) {
    /** @const {!Element} */
    this.target = target;
    /** @const {string} */
    this.method = method;
    /** @const {?Element} */
    this.source = source;
    /** @const {?Event} */
    this.event = event;
  }
}



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
      this.win.document.addEventListener('click', event => {
        if (!event.defaultPrevented) {
          this.trigger(event.target, 'tap', event);
        }
      });
    }
  }

  /**
   * Triggers the specified event on the target element.
   * @param {!Element} target
   * @param {string} eventType
   * @param {?Event} event
   */
  trigger(target, eventType, event) {
    this.action_(target, eventType, event);
  }

  /**
   * Triggers execution of the method on a target/method.
   * @param {!Element} target
   * @param {string} method
   * @param {?Element} source
   * @param {?Event} event
   */
  execute(target, method, source, event) {
    this.invoke_(target, method, source, event, null);
  }

  /**
   * @param {!Element} source
   * @param {string} actionEventType
   * @param {!Event} event
   * @private
   */
  action_(source, actionEventType, event) {
    const action = this.findAction_(source, actionEventType);
    if (!action) {
      // TODO(dvoytenko): implement default (catch-all) actions.
      return;
    }

    const target = document.getElementById(action.actionInfo.target);
    if (!target) {
      this.actionInfoError_('target not found', action.actionInfo, target);
      return;
    }

    this.invoke_(target, action.actionInfo.method,
        action.node, event, action.actionInfo);
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
   * @param {string} method
   * @param {?Element} source
   * @param {?Event} event
   * @param {?ActionInfo} actionInfo
   */
  invoke_(target, method, source, event, actionInfo) {
    const invocation = new ActionInvocation(target, method, source, event);

    // TODO(dvoytenko): implement common method handlers, e.g. "toggleClass"

    // Only amp elements are allowed to proceed further.
    if (target.tagName.toLowerCase().substring(0, 4) != 'amp-') {
      this.actionInfoError_('Target must be an AMP element', actionInfo,
          target);
      return;
    }

    if (!target.enqueAction) {
      this.actionInfoError_('Unrecognized AMP element "' +
          target.tagName.toLowerCase() + '". ' +
          'Did you forget to include it via <script custom-element>?',
          actionInfo, target);
      return;
    }

    target.enqueAction(invocation);
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
    const actionMap = this.getActionMap_(node);
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
    const actions = s.split(';');
    if (actions && actions.length > 0) {
      for (let i = 0; i < actions.length; i++) {
        const actionStr = actions[i];
        const actionInfo = this.parseAction_(actionStr);
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

    const eventSep = s.indexOf(':');
    const methodSep = s.indexOf('.', eventSep + 1);
    const event = (eventSep != -1 ? s.substring(0, eventSep) : '').toLowerCase()
        .trim() || null;
    const target = s.substring(eventSep + 1, methodSep != -1 ? methodSep :
        s.length).trim();
    const method = (methodSep != -1 ? s.substring(methodSep + 1) : '')
        .trim() || DEFAULT_METHOD_;

    if (!event || !target) {
      log.error(TAG_, 'invalid action definition: ' + s);
      return null;
    }
    return {event: event, target: target, method: method, str: s};
  }
};


export const action = new Action(window);
