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

import {ActionTrust} from '../action-trust';
import {KeyCodes} from '../utils/key-codes';
import {Services} from '../services';
import {debounce, throttle} from '../utils/rate-limit';
import {dev, user} from '../log';
import {isArray, isFiniteNumber, toWin} from '../types';
import {isEnabled} from '../dom';
import {getMode} from '../mode';
import {getValueForExpr} from '../json';
import {map} from '../utils/object';
import {
  registerServiceBuilderForDoc,
  installServiceInEmbedScope,
} from '../service';

/**
 * ActionInfoDef args key that maps to the an unparsed object literal string.
 * @const {string}
 */
export const OBJECT_STRING_ARGS_KEY = '__AMP_OBJECT_STRING__';

/** @const {string} */
const TAG_ = 'Action';

/** @const {string} */
const ACTION_MAP_ = '__AMP_ACTION_MAP__' + Math.random();

/** @const {string} */
const ACTION_QUEUE_ = '__AMP_ACTION_QUEUE__';

/** @const {string} */
const ACTION_HANDLER_ = '__AMP_ACTION_HANDLER__';

/** @const {string} */
const DEFAULT_METHOD_ = 'activate';

/** @const {number} */
const DEFAULT_DEBOUNCE_WAIT = 300; // ms

/** @const {number} */
const DEFAULT_THROTTLE_INTERVAL = 100; // ms

/** @const {!Object<string,!Array<string>>} */
const ELEMENTS_ACTIONS_MAP_ = {
  'form': ['submit'],
};

/**
 * An expression arg value, e.g. `foo.bar` in `e:t.m(arg=foo.bar)`.
 * @typedef {{expression: string}}
 */
let ActionInfoArgExpressionDef;

/**
 * An arg value.
 * @typedef {(boolean|number|string|ActionInfoArgExpressionDef)}
 */
let ActionInfoArgValueDef;

/**
 * Map of arg names to their values, e.g. {arg: 123} in `e:t.m(arg=123)`.
 * @typedef {Object<string, ActionInfoArgValueDef>}
 */
let ActionInfoArgsDef;

/**
 * @typedef {{
 *   event: string,
 *   target: string,
 *   method: string,
 *   args: ?ActionInfoArgsDef,
 *   str: string
 * }}
 */
export let ActionInfoDef;

/**
 * Function called when an action is invoked.
 *
 * Optionally, takes this action's position within all actions triggered by
 * the same event, as well as said action array, as params.
 *
 * If the action is chainable, returns a Promise which resolves when the
 * action is complete. Otherwise, returns null.
 *
 * @typedef {function(
 *     !ActionInvocation, number=, !Array<!ActionInfoDef>=):?Promise}
 */
let ActionHandlerDef;

/**
 * @typedef {Event|DeferredEvent}
 */
export let ActionEventDef;

/**
 * The structure that contains all details of the action method invocation.
 * @struct
 * @const
 * TODO(dvoytenko): add action arguments here as well.
 * @package For type.
 */
export class ActionInvocation {
  /**
   * @param {!Node} target
   * @param {string} method
   * @param {?JsonObject} args
   * @param {?Element} source Element where the action was triggered.
   * @param {?Element} caller Element where the action is being handled.
   * @param {?ActionEventDef} event
   * @param {ActionTrust} trust
   */
  constructor(target, method, args, source, caller, event, trust) {
    /** @const {!Node} */
    this.target = target;
    /** @const {string} */
    this.method = method;
    /** @const {?JsonObject} */
    this.args = args;
    /** @const {?Element} */
    this.source = source;
    /** @const {?Element} */
    this.caller = caller;
    /** @const {?ActionEventDef} */
    this.event = event;
    /** @const {ActionTrust} */
    this.trust = trust;
  }

  /**
   * Returns true if the trigger event has a trust equal to or greater than
   * `minimumTrust`. Otherwise, logs a user error and returns false.
   * @param {ActionTrust} minimumTrust
   * @returns {boolean}
   */
  satisfiesTrust(minimumTrust) {
    // Sanity check.
    if (!isFiniteNumber(this.trust)) {
      dev().error(TAG_, `Invalid trust for '${this.method}': ${this.trust}`);
      return false;
    }
    if (this.trust < minimumTrust) {
      user().error(TAG_, `Trust for '${this.method}' (${this.trust}) ` +
          `insufficient (min: ${minimumTrust}).`);
      return false;
    }
    return true;
  }
}

/**
 * TODO(dvoytenko): consider splitting this class into two:
 * 1. A class that has a method "trigger(element, eventType, data)" and
 *    simply can search target in DOM and trigger methods on it.
 * 2. A class that configures event recognizers and rules and then
 *    simply calls action.trigger.
 * @implements {../service.EmbeddableService}
 */
export class ActionService {

  /**
   * @param {!./ampdoc-impl.AmpDoc} ampdoc
   * @param {(!Document|!ShadowRoot)=} opt_root
   */
  constructor(ampdoc, opt_root) {
    /** @const {!./ampdoc-impl.AmpDoc} */
    this.ampdoc = ampdoc;

    /** @const {!Document|!ShadowRoot} */
    this.root_ = opt_root || ampdoc.getRootNode();

    /** @const @private {!Object<string, ActionHandlerDef>} */
    this.globalTargets_ = map();

    /**
     * @const @private {!Object<string, {
      *   handler: ActionHandlerDef,
      *   minTrust: ActionTrust,
      * }>}
      */
    this.globalMethodHandlers_ = map();

    /** @private {!./vsync-impl.Vsync} */
    this.vsync_ = Services.vsyncFor(ampdoc.win);

    // Add core events.
    this.addEvent('tap');
    this.addEvent('submit');
    this.addEvent('change');
    this.addEvent('input-debounced');
    this.addEvent('input-throttled');
    this.addEvent('valid');
    this.addEvent('invalid');
  }

  /** @override */
  adoptEmbedWindow(embedWin) {
    installServiceInEmbedScope(embedWin, 'action',
        new ActionService(this.ampdoc, embedWin.document));
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
      this.root_.addEventListener('click', event => {
        if (!event.defaultPrevented) {
          const element = dev().assertElement(event.target);
          this.trigger(element, name, event, ActionTrust.HIGH);
        }
      });
      this.root_.addEventListener('keydown', event => {
        const element = dev().assertElement(event.target);
        const keyCode = event.keyCode;
        if (keyCode == KeyCodes.ENTER || keyCode == KeyCodes.SPACE) {
          if (!event.defaultPrevented &&
              element.getAttribute('role') == 'button') {
            event.preventDefault();
            this.trigger(element, name, event, ActionTrust.HIGH);
          }
        }
      });
    } else if (name == 'submit') {
      this.root_.addEventListener(name, event => {
        const element = dev().assertElement(event.target);
        this.trigger(element, name, event, ActionTrust.HIGH);
      });
    } else if (name == 'change') {
      this.root_.addEventListener(name, event => {
        const element = dev().assertElement(event.target);
        this.addTargetPropertiesAsDetail_(event);
        this.trigger(element, name, event, ActionTrust.HIGH);
      });
    } else if (name == 'input-debounced') {
      const debouncedInput = debounce(this.ampdoc.win, event => {
        const target = dev().assertElement(event.target);
        this.trigger(target, name, /** @type {!ActionEventDef} */ (event),
            ActionTrust.HIGH);
      }, DEFAULT_DEBOUNCE_WAIT);

      this.root_.addEventListener('input', event => {
        // Create a DeferredEvent to avoid races where the browser cleans up
        // the event object before the async debounced function is called.
        const deferredEvent = new DeferredEvent(event);
        this.addTargetPropertiesAsDetail_(deferredEvent);
        debouncedInput(deferredEvent);
      });
    } else if (name == 'input-throttled') {
      const throttledInput = throttle(this.ampdoc.win, event => {
        const target = dev().assertElement(event.target);
        this.trigger(target, name, /** @type {!ActionEventDef} */ (event),
            ActionTrust.HIGH);
      }, DEFAULT_THROTTLE_INTERVAL);

      this.root_.addEventListener('input', event => {
        const deferredEvent = new DeferredEvent(event);
        this.addTargetPropertiesAsDetail_(deferredEvent);
        throttledInput(deferredEvent);
      });
    } else if (name == 'valid' || name == 'invalid') {
      this.root_.addEventListener(name, event => {
        const element = dev().assertElement(event.target);
        this.trigger(element, name, event, ActionTrust.HIGH);
      });
    }
  }

  /**
   * Registers the action target that will receive all designated actions.
   * @param {string} name
   * @param {ActionHandlerDef} handler
   */
  addGlobalTarget(name, handler) {
    this.globalTargets_[name] = handler;
  }

  /**
   * Registers the action handler for a common method.
   * @param {string} name
   * @param {ActionHandlerDef} handler
   * @param {ActionTrust} minTrust
   */
  addGlobalMethodHandler(name, handler, minTrust = ActionTrust.HIGH) {
    this.globalMethodHandlers_[name] = {handler, minTrust};
  }

  /**
   * Triggers the specified event on the target element.
   * @param {!Element} target
   * @param {string} eventType
   * @param {?ActionEventDef} event
   * @param {ActionTrust} trust
   */
  trigger(target, eventType, event, trust) {
    this.action_(target, eventType, event, trust);
  }

  /**
   * Triggers execution of the method on a target/method.
   * @param {!Element} target
   * @param {string} method
   * @param {?JsonObject} args
   * @param {?Element} source
   * @param {?Element} caller
   * @param {?ActionEventDef} event
   * @param {ActionTrust} trust
   */
  execute(target, method, args, source, caller, event, trust) {
    const invocation = new ActionInvocation(
        target, method, args, source, caller, event, trust);
    this.invoke_(invocation, /* actionInfo */ null);
  }

  /**
   * Installs action handler for the specified element.
   * @param {!Element} target
   * @param {ActionHandlerDef} handler
   * @param {ActionTrust} minTrust
   */
  installActionHandler(target, handler, minTrust = ActionTrust.HIGH) {
    // TODO(dvoytenko, #7063): switch back to `target.id` with form proxy.
    const targetId = target.getAttribute('id') || '';
    const debugid = target.tagName + '#' + targetId;
    dev().assert((targetId && targetId.substring(0, 4) == 'amp-') ||
        target.tagName.toLowerCase() in ELEMENTS_ACTIONS_MAP_,
    'AMP element or a whitelisted target element is expected: %s', debugid);

    if (target[ACTION_HANDLER_]) {
      dev().error(TAG_, `Action handler already installed for ${target}`);
      return;
    }

    /** @const {Array<!ActionInvocation>} */
    const currentQueue = target[ACTION_QUEUE_];

    target[ACTION_HANDLER_] = {handler, minTrust};

    // Dequeue the current queue.
    if (isArray(currentQueue)) {
      Services.timerFor(toWin(target.ownerDocument.defaultView)).delay(() => {
        // TODO(dvoytenko, #1260): dedupe actions.
        currentQueue.forEach(invocation => {
          try {
            if (invocation.satisfiesTrust(
                /** @type {ActionTrust} */ (minTrust))) {
              handler(invocation);
            }
          } catch (e) {
            dev().error(TAG_, 'Action execution failed:', invocation, e);
          }
        });
        target[ACTION_QUEUE_].length = 0;
      }, 1);
    }
  }

  /**
   * @param {!Element} source
   * @param {string} actionEventType
   * @param {?ActionEventDef} event
   * @param {ActionTrust} trust
   * @private
   */
  action_(source, actionEventType, event, trust) {
    const action = this.findAction_(source, actionEventType);
    if (!action) {
      // TODO(dvoytenko): implement default (catch-all) actions.
      return;
    }

    // Invoke actions serially, where each action waits for its predecessor
    // to complete. `currentPromise` is the i'th promise in the chain.
    let currentPromise = null;

    action.actionInfos.forEach((actionInfo, i) => {
      // Replace any variables in args with data in `event`.
      const args = dereferenceExprsInArgs(actionInfo.args, event);

      const invoke = () => {
        // Global target, e.g. `AMP`.
        const globalTarget = this.globalTargets_[actionInfo.target];
        if (globalTarget) {
          const invocation = new ActionInvocation(this.root_, actionInfo.method,
              args, source, action.node, event, trust);
          return globalTarget(invocation, i, action.actionInfos);
        }

        // Element target via `id` attribute.
        const target = this.root_.getElementById(actionInfo.target);
        if (target) {
          const invocation = new ActionInvocation(target, actionInfo.method,
              args, source, action.node, event, trust);
          return this.invoke_(invocation, actionInfo);
        } else {
          this.actionInfoError_('target not found', actionInfo, target);
        }
      };

      // Wait for the previous action, if applicable.
      currentPromise = (currentPromise)
        ? currentPromise.then(invoke)
        : invoke();
    });
  }

  /**
   * The errors that are a result of action definition.
   * @param {string} s
   * @param {?ActionInfoDef} actionInfo
   * @param {?Element} target
   * @private
   */
  actionInfoError_(s, actionInfo, target) {
    // Method not found "activate" on ' + target
    user().assert(false, 'Action Error: ' + s +
        (actionInfo ? ' in [' + actionInfo.str + ']' : '') +
        (target ? ' on [' + target + ']' : ''));
  }

  /**
   * @param {!ActionInvocation} invocation
   * @param {?ActionInfoDef} actionInfo TODO(choumx): Remove this param.
   * @return {?Promise}
   * @private visible for testing
   */
  invoke_(invocation, actionInfo) {
    const target = dev().assertElement(invocation.target);
    const method = invocation.method;

    // Try a global method handler first.
    const globalMethod = this.globalMethodHandlers_[method];
    if (globalMethod && invocation.satisfiesTrust(globalMethod.minTrust)) {
      return globalMethod.handler(invocation);
    }

    const lowerTagName = target.tagName.toLowerCase();
    // AMP elements.
    if (lowerTagName.substring(0, 4) == 'amp-') {
      if (target.enqueAction) {
        target.enqueAction(invocation);
      } else {
        this.actionInfoError_('Unrecognized AMP element "' +
            lowerTagName + '". ' +
            'Did you forget to include it via <script custom-element>?',
        actionInfo, target);
      }
      return null;
    }

    // Special elements with AMP ID or known supported actions.
    const supportedActions = ELEMENTS_ACTIONS_MAP_[lowerTagName];
    // TODO(dvoytenko, #7063): switch back to `target.id` with form proxy.
    const targetId = target.getAttribute('id') || '';
    if ((targetId && targetId.substring(0, 4) == 'amp-') ||
        (supportedActions && supportedActions.indexOf(method) > -1)) {
      const holder = target[ACTION_HANDLER_];
      if (holder) {
        const {handler, minTrust} = holder;
        if (invocation.satisfiesTrust(minTrust)) {
          handler(invocation);
        }
      } else {
        target[ACTION_QUEUE_] = target[ACTION_QUEUE_] || [];
        target[ACTION_QUEUE_].push(invocation);
      }
      return null;
    }

    // Unsupported target.
    this.actionInfoError_('Target element does not support provided action',
        actionInfo, target);

    return null;
  }

  /**
   * @param {!Element} target
   * @param {string} actionEventType
   * @return {?{node: !Element, actionInfos: !Array<!ActionInfoDef>}}
   */
  findAction_(target, actionEventType) {
    // Go from target up the DOM tree and find the applicable action.
    let n = target;
    while (n) {
      const actionInfos = this.matchActionInfos_(n, actionEventType);
      if (actionInfos && isEnabled(n)) {
        return {node: n, actionInfos: dev().assert(actionInfos)};
      }
      n = n.parentElement;
    }
    return null;
  }

  /**
   * @param {!Element} node
   * @param {string} actionEventType
   * @return {?Array<!ActionInfoDef>}
   */
  matchActionInfos_(node, actionEventType) {
    const actionMap = this.getActionMap_(node);
    if (!actionMap) {
      return null;
    }
    return actionMap[actionEventType] || null;
  }

  /**
   * @param {!Element} node
   * @return {?Object<string, !Array<!ActionInfoDef>>}
   */
  getActionMap_(node) {
    let actionMap = node[ACTION_MAP_];
    if (actionMap === undefined) {
      actionMap = null;
      if (node.hasAttribute('on')) {
        actionMap = parseActionMap(node.getAttribute('on'), node);
      }
      node[ACTION_MAP_] = actionMap;
    }
    return actionMap;
  }

  /**
   * Resets a node's actions with those defined in the given actions string.
   * @param {!Element} node
   * @param {string} actionsStr
   */
  setActions(node, actionsStr) {
    node.setAttribute('on', actionsStr);

    // Clear cache.
    delete node[ACTION_MAP_];
  }

  /**
   * Given a browser 'change' or 'input' event, add `details` property to it
   * containing whitelisted properties of the target element.
   * @param {!ActionEventDef} event
   * @private
   */
  addTargetPropertiesAsDetail_(event) {
    const detail = /** @type {!JsonObject} */ (map());
    const target = event.target;

    if (target.value !== undefined) {
      detail['value'] = target.value;
    }

    // Check tagName instead since `valueAsNumber` isn't supported on IE.
    if (target.tagName == 'INPUT') {
      // Probably supported natively but convert anyways for consistency.
      detail['valueAsNumber'] = Number(target.value);
    }

    if (target.checked !== undefined) {
      detail['checked'] = target.checked;
    }

    if (target.min !== undefined || target.max !== undefined) {
      detail['min'] = target.min;
      detail['max'] = target.max;
    }

    if (Object.keys(detail).length > 0) {
      event.detail = detail;
    }
  }
}


/**
 * A clone of an event object with its function properties replaced.
 * This is useful e.g. for event objects that need to be passed to an async
 * context, but the browser might have cleaned up the original event object.
 * This clone replaces functions with error throws since they won't behave
 * normally after the original object has been destroyed.
 * @private visible for testing
 */
export class DeferredEvent {
  /**
   * @param {!Event} event
   */
  constructor(event) {
    /** @type {?Object} */
    this.detail = null;

    cloneWithoutFunctions(event, this);
  }
}


/**
 * Clones an object and replaces its function properties with throws.
 * @param {!T} original
 * @param {!T=} opt_dest
 * @return {!T}
 * @template T
 * @private
 */
function cloneWithoutFunctions(original, opt_dest) {
  const clone = opt_dest || map();
  for (const prop in original) {
    const value = original[prop];
    if (typeof value === 'function') {
      clone[prop] = notImplemented;
    } else {
      clone[prop] = original[prop];
    }
  }
  return clone;
}


/** @private */
function notImplemented() {
  dev().assert(null, 'Deferred events cannot access native event functions.');
}


/**
 * @param {string} s
 * @param {!Element} context
 * @return {?Object<string, !Array<!ActionInfoDef>>}
 * @private Visible for testing only.
 */
export function parseActionMap(s, context) {
  const assertAction = assertActionForParser.bind(null, s, context);
  const assertToken = assertTokenForParser.bind(null, s, context);

  let actionMap = null;

  const toks = new ParserTokenizer(s);
  let tok;
  let peek;
  do {
    tok = toks.next();
    if (tok.type == TokenType.EOF ||
            tok.type == TokenType.SEPARATOR && tok.value == ';') {
      // Expected, ignore.
    } else if (tok.type == TokenType.LITERAL || tok.type == TokenType.ID) {

      // Format: event:target.method

      // Event: "event:"
      const event = tok.value;

      // Target: ":target." separator
      assertToken(toks.next(), [TokenType.SEPARATOR], ':');

      const actions = [];

      // Handlers for event
      do {
        const target = assertToken(
            toks.next(), [TokenType.LITERAL, TokenType.ID]).value;

        // Method: ".method". Method is optional.
        let method = DEFAULT_METHOD_;
        let args = null;

        peek = toks.peek();
        if (peek.type == TokenType.SEPARATOR && peek.value == '.') {
          toks.next(); // Skip '.'
          method = assertToken(
              toks.next(), [TokenType.LITERAL, TokenType.ID]).value || method;

          // Optionally, there may be arguments: "(key = value, key = value)".
          peek = toks.peek();
          if (peek.type == TokenType.SEPARATOR && peek.value == '(') {
            toks.next(); // Skip '('
            args = tokenizeMethodArguments(toks, assertToken, assertAction);
          }
        }

        actions.push({
          event,
          target,
          method,
          args: (args && getMode().test && Object.freeze) ?
            Object.freeze(args) : args,
          str: s,
        });

        peek = toks.peek();

      } while (peek.type == TokenType.SEPARATOR && peek.value == ','
          && toks.next()); // skip "," when found

      if (!actionMap) {
        actionMap = map();
      }

      actionMap[event] = actions;
    } else {
      // Unexpected token.
      assertAction(false, `; unexpected token [${tok.value || ''}]`);
    }

  } while (tok.type != TokenType.EOF);

  return actionMap;
}

/**
 * Tokenizes and returns method arguments, e.g. target.method(arguments).
 * @param {!ParserTokenizer} toks
 * @param {!Function} assertToken
 * @param {!Function} assertAction
 * @return {ActionInfoArgsDef}
 * @private
 */
function tokenizeMethodArguments(toks, assertToken, assertAction) {
  let peek = toks.peek();
  let tok;
  let args = null;
  // Object literal. Format: {...}
  if (peek.type == TokenType.OBJECT) {
    // Don't parse object literals. Tokenize as a single expression
    // fragment and delegate to specific action handler.
    args = map();
    const value = toks.next().value;
    args[OBJECT_STRING_ARGS_KEY] = value;
    assertToken(toks.next(), [TokenType.SEPARATOR], ')');
  } else {
    // Key-value pairs. Format: key = value, ....
    do {
      tok = toks.next();
      const type = tok.type;
      const value = tok.value;
      if (type == TokenType.SEPARATOR && (value == ',' || value == ')')) {
        // Expected: ignore.
      } else if (type == TokenType.LITERAL || type == TokenType.ID) {
        // Key: "key = "
        assertToken(toks.next(), [TokenType.SEPARATOR], '=');
        // Value is either a literal or an expression: "foo.bar.baz"
        tok = assertToken(toks.next(/* convertValue */ true),
            [TokenType.LITERAL, TokenType.ID]);
        const argValueTokens = [tok];
        // Expressions have one or more dereferences: ".identifier"
        if (tok.type == TokenType.ID) {
          for (peek = toks.peek();
            peek.type == TokenType.SEPARATOR && peek.value == '.';
            peek = toks.peek()) {
            toks.next(); // Skip '.'.
            tok = assertToken(toks.next(false), [TokenType.ID]);
            argValueTokens.push(tok);
          }
        }
        const argValue = argValueForTokens(argValueTokens);
        if (!args) {
          args = map();
        }
        args[value] = argValue;
        peek = toks.peek();
        assertAction(
            peek.type == TokenType.SEPARATOR &&
            (peek.value == ',' || peek.value == ')'),
            'Expected either [,] or [)]');
      } else {
        // Unexpected token.
        assertAction(false, `; unexpected token [${tok.value || ''}]`);
      }
    } while (!(tok.type == TokenType.SEPARATOR && tok.value == ')'));
  }
  return args;
}

/**
 * @param {Array<!TokenDef>} tokens
 * @return {?ActionInfoArgValueDef}
 * @private
 */
function argValueForTokens(tokens) {
  if (tokens.length == 0) {
    return null;
  } else if (tokens.length == 1) {
    return /** @type {(boolean|number|string)} */ (tokens[0].value);
  } else {
    const values = tokens.map(token => token.value);
    const expression = values.join('.');
    return /** @type {ActionInfoArgExpressionDef} */ ({expression});
  }
}

/**
 * Dereferences expression args in `args` using data in `event`.
 * @param {?ActionInfoArgsDef} args
 * @param {?ActionEventDef} event
 * @return {?JsonObject}
 * @private
 * @visibleForTesting
 */
export function dereferenceExprsInArgs(args, event) {
  if (!args) {
    return args;
  }
  const data = map();
  if (event && event.detail) {
    data['event'] = event.detail;
  }
  const applied = map();
  Object.keys(args).forEach(key => {
    let value = args[key];
    if (typeof value == 'object' && value.expression) {
      const expr =
          /** @type {ActionInfoArgExpressionDef} */ (value).expression;
      const exprValue = getValueForExpr(data, expr);
      // If expr can't be found in data, use null instead of undefined.
      value = (exprValue === undefined) ? null : exprValue;
    }
    applied[key] = value;
  });
  return applied;
}

/**
 * @param {string} s
 * @param {!Element} context
 * @param {?T} condition
 * @param {string=} opt_message
 * @return T
 * @template T
 * @private
 */
function assertActionForParser(s, context, condition, opt_message) {
  return user().assert(condition, 'Invalid action definition in %s: [%s] %s',
      context, s, opt_message || '');
}

/**
 * @param {string} s
 * @param {!Element} context
 * @param {!TokenDef} tok
 * @param {Array<TokenType>} types
 * @param {*=} opt_value
 * @return {!TokenDef}
 * @private
 */
function assertTokenForParser(s, context, tok, types, opt_value) {
  if (opt_value !== undefined) {
    assertActionForParser(s, context,
        types.includes(tok.type) && tok.value == opt_value,
        `; expected [${opt_value}]`);
  } else {
    assertActionForParser(s, context, types.includes(tok.type));
  }
  return tok;
}

/**
 * @enum {number}
 */
const TokenType = {
  INVALID: 0,
  EOF: 1,
  SEPARATOR: 2,
  LITERAL: 3,
  ID: 4,
  OBJECT: 5,
};

/**
 * @typedef {{type: TokenType, value: *}}
 */
let TokenDef;

/** @private @const {string} */
const WHITESPACE_SET = ' \t\n\r\f\v\u00A0\u2028\u2029';

/** @private @const {string} */
const SEPARATOR_SET = ';:.()=,|!';

/** @private @const {string} */
const STRING_SET = '"\'';

/** @private @const {string} */
const OBJECT_SET = '{}';

/** @private @const {string} */
const SPECIAL_SET =
    WHITESPACE_SET + SEPARATOR_SET + STRING_SET + OBJECT_SET;

/** @private */
class ParserTokenizer {
  /**
   * @param {string} str
   */
  constructor(str) {
    /** @private @const {string} */
    this.str_ = str;

    /** @private {number} */
    this.index_ = -1;
  }

  /**
   * Returns the next token and advances the position.
   * @param {boolean=} opt_convertValues
   * @return {!TokenDef}
   */
  next(opt_convertValues) {
    const tok = this.next_(opt_convertValues || false);
    this.index_ = tok.index;
    return tok;
  }

  /**
   * Returns the next token but keeps the current position.
   * @param {boolean=} opt_convertValues
   * @return {!TokenDef}
   */
  peek(opt_convertValues) {
    return this.next_(opt_convertValues || false);
  }

  /**
   * @param {boolean} convertValues
   * @return {!{type: TokenType, value: *, index: number}}
   */
  next_(convertValues) {
    let newIndex = this.index_ + 1;
    if (newIndex >= this.str_.length) {
      return {type: TokenType.EOF, index: this.index_};
    }

    let c = this.str_.charAt(newIndex);

    // Whitespace: standard set.
    if (WHITESPACE_SET.indexOf(c) != -1) {
      newIndex++;
      for (; newIndex < this.str_.length; newIndex++) {
        if (WHITESPACE_SET.indexOf(this.str_.charAt(newIndex)) == -1) {
          break;
        }
      }
      if (newIndex >= this.str_.length) {
        return {type: TokenType.EOF, index: newIndex};
      }
      c = this.str_.charAt(newIndex);
    }

    // A numeric. Notice that it steals the `.` from separators.
    if (convertValues && (isNum(c) ||
            c == '.' && newIndex + 1 < this.str_.length &&
            isNum(this.str_[newIndex + 1]))) {
      let hasFraction = c == '.';
      let end = newIndex + 1;
      for (; end < this.str_.length; end++) {
        const c2 = this.str_.charAt(end);
        if (c2 == '.') {
          hasFraction = true;
          continue;
        }
        if (!isNum(c2)) {
          break;
        }
      }
      const s = this.str_.substring(newIndex, end);
      const value = hasFraction ? parseFloat(s) : parseInt(s, 10);
      newIndex = end - 1;
      return {type: TokenType.LITERAL, value, index: newIndex};
    }

    // Different separators.
    if (SEPARATOR_SET.indexOf(c) != -1) {
      return {type: TokenType.SEPARATOR, value: c, index: newIndex};
    }

    // String literal.
    if (STRING_SET.indexOf(c) != -1) {
      let end = -1;
      for (let i = newIndex + 1; i < this.str_.length; i++) {
        if (this.str_.charAt(i) == c) {
          end = i;
          break;
        }
      }
      if (end == -1) {
        return {type: TokenType.INVALID, index: newIndex};
      }
      const value = this.str_.substring(newIndex + 1, end);
      newIndex = end;
      return {type: TokenType.LITERAL, value, index: newIndex};
    }

    // Object literal.
    if (c == '{') {
      let numberOfBraces = 1;
      let end = -1;
      for (let i = newIndex + 1; i < this.str_.length; i++) {
        const char = this.str_[i];
        if (char == '{') {
          numberOfBraces++;
        } else if (char == '}') {
          numberOfBraces--;
        }
        if (numberOfBraces <= 0) {
          end = i;
          break;
        }
      }
      if (end == -1) {
        return {type: TokenType.INVALID, index: newIndex};
      }
      const value = this.str_.substring(newIndex, end + 1);
      newIndex = end;
      return {type: TokenType.OBJECT, value, index: newIndex};
    }

    // Advance until next special character.
    let end = newIndex + 1;
    for (; end < this.str_.length; end++) {
      if (SPECIAL_SET.indexOf(this.str_.charAt(end)) != -1) {
        break;
      }
    }
    const s = this.str_.substring(newIndex, end);
    newIndex = end - 1;

    // Boolean literal.
    if (convertValues && (s == 'true' || s == 'false')) {
      const value = (s == 'true');
      return {type: TokenType.LITERAL, value, index: newIndex};
    }

    // Identifier.
    if (!isNum(s.charAt(0))) {
      return {type: TokenType.ID, value: s, index: newIndex};
    }

    // Key.
    return {type: TokenType.LITERAL, value: s, index: newIndex};
  }
}


/**
 * Tests whether a chacter is a number.
 * @param {string} c
 * @return {boolean}
 */
function isNum(c) {
  return c >= '0' && c <= '9';
}


/**
 * @param {!./ampdoc-impl.AmpDoc} ampdoc
 */
export function installActionServiceForDoc(ampdoc) {
  registerServiceBuilderForDoc(
      ampdoc,
      'action',
      ActionService,
      /* opt_instantiate */ true);
}
