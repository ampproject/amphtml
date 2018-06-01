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

import {ActionTrust} from '../action-constants';
import {KeyCodes} from '../utils/key-codes';
import {RAW_OBJECT_ARGS_KEY} from '../action-constants';
import {Services} from '../services';
import {debounce, throttle} from '../utils/rate-limit';
import {dev, user} from '../log';
import {getMode} from '../mode';
import {getValueForExpr} from '../json';
import {hasOwn, map} from '../utils/object';
import {
  installServiceInEmbedScope,
  registerServiceBuilderForDoc,
} from '../service';
import {isArray, isFiniteNumber, toWin} from '../types';
import {isEnabled} from '../dom';
import {reportError} from '../error';

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
  'form': ['submit', 'clear'],
};

/**
 * Interactable widgets which should trigger tap events when the user clicks
 * or activates via the keyboard. Not all are here, e.g. progressbar, tabpanel,
 * since they are text inputs, readonly, or composite widgets that shouldn't
 * need to trigger tap events from spacebar or enter on their own.
 * See https://www.w3.org/TR/wai-aria-1.1/#widget_roles
 * @const {!Object<boolean>}
 */
export const TAPPABLE_ARIA_ROLES = {
  'button': true,
  'checkbox': true,
  'link': true,
  'listbox': true,
  'menuitem': true,
  'menuitemcheckbox': true,
  'menuitemradio': true,
  'option': true,
  'radio': true,
  'scrollbar': true,
  'slider': true,
  'spinbutton': true,
  'switch': true,
  'tab': true,
  'treeitem': true,
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
 * @typedef {function(!ActionInvocation, number=, !Array<!ActionInfoDef>=):?Promise}
 */
let ActionHandlerDef;

/**
 * @typedef {Event|DeferredEvent}
 */
export let ActionEventDef;

/**
 * The structure that contains all details of the action method invocation.
 * @struct @const @package For type.
 */
export class ActionInvocation {
  /**
   * For example:
   *
   *   <div id="div" on="tap:myForm.submit(foo=bar)">
   *     <button id="btn">Submit</button>
   *   </div>
   *
   * `node` is #myForm.
   * `method` is "submit".
   * `args` is {'foo': 'bar'}.
   * `source` is #btn.
   * `caller` is #div.
   * `event` is a "click" Event object.
   * `trust` depends on whether this action was a result of a user gesture.
   * `tagOrTarget` is "amp-form".
   * `sequenceId` is a pseudo-UUID.
   *
   * @param {!Node} node Element whose action is being invoked.
   * @param {string} method Name of the action being invoked.
   * @param {?JsonObject} args Named action arguments.
   * @param {?Element} source Element that generated the `event`.
   * @param {?Element} caller Element containing the on="..." action handler.
   * @param {?ActionEventDef} event The event that triggered this action.
   * @param {ActionTrust} trust The trust level of this invocation's trigger.
   * @param {?string} tagOrTarget The global target name or the element tagName.
   * @param {number} sequenceId An identifier for this action's sequence (all
   *   actions triggered by one event e.g. "tap:form1.submit, form2.submit").
   */
  constructor(node, method, args, source, caller, event, trust,
    tagOrTarget = null, sequenceId = Math.random()) {
    /** @const {!Node} */
    this.node = node;
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
    /** @const {string} */
    this.tagOrTarget = tagOrTarget || node.tagName;
    /** @const {number} */
    this.sequenceId = sequenceId;
  }

  /**
   * Returns true if the trigger event has a trust equal to or greater than
   * `minimumTrust`. Otherwise, logs a user error and returns false.
   * @param {ActionTrust} minimumTrust
   * @return {boolean}
   */
  satisfiesTrust(minimumTrust) {
    // Sanity check.
    if (!isFiniteNumber(this.trust)) {
      dev().error(TAG_, `Invalid trust for '${this.method}': ${this.trust}`);
      return false;
    }
    if (this.trust < minimumTrust) {
      user().error(TAG_, `Insufficient trust for "${this.method}" ` +
          `(${this.trust} < ${minimumTrust}).`);
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

    /**
     * Optional whitelist of actions e.g. ["AMP.navigateTo", "amp-form.submit"].
     * If not null, any actions that are not in the whitelist will be ignored
     * and throw a user error at invocation time.
     * @private {?Array<string>}
     */
    this.whitelist_ = this.queryWhitelist_();

    /** @const @private {!Object<string, ActionHandlerDef>} */
    this.globalTargets_ = map();

    /**
     * @const @private {!Object<string, {handler: ActionHandlerDef, minTrust: ActionTrust}>}
     */
    this.globalMethodHandlers_ = map();

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
        const {keyCode} = event;
        if (keyCode == KeyCodes.ENTER || keyCode == KeyCodes.SPACE) {
          const role = element.getAttribute('role');
          const isTapEventRole =
              (role && hasOwn(TAPPABLE_ARIA_ROLES, role.toLowerCase()));
          if (!event.defaultPrevented && isTapEventRole) {
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
    this.invoke_(invocation);
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
   * Checks if the given element has registered a particular action type.
   * @param {!Element} target
   * @param {string} actionEventType
   * @param {!Element=} opt_stopAt
   * @return {boolean}
   */
  hasAction(target, actionEventType, opt_stopAt) {
    return !!this.findAction_(target, actionEventType, opt_stopAt);
  }

  /**
   * Overwrites the current action whitelist (if any). Takes an array of strings
   * of the form "<tagOrTarget>.<method>" e.g. "amp-form.submit" or "AMP.print".
   * @param {!Array<string>} whitelist
   */
  setWhitelist(whitelist) {
    this.whitelist_ = whitelist;
  }

  /**
   * Adds an action to the whitelist. Takes one string of the form
   * "<tagOrTarget>.<method>", e.g. "amp-form.submit" or "AMP.print".
   * @param {string} action
   */
  addToWhitelist(action) {
    if (!this.whitelist_) {
      this.whitelist_ = [];
    }
    this.whitelist_.push(action);
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
      return;
    }
    // Use a pseudo-UUID to uniquely identify this sequence of actions.
    // A sequence is all actions triggered by a single event.
    const sequenceId = Math.random();
    // Invoke actions serially, where each action waits for its predecessor
    // to complete. `currentPromise` is the i'th promise in the chain.
    let currentPromise = null;
    action.actionInfos.forEach(actionInfo => {
      const {target} = actionInfo;
      // Replace any variables in args with data in `event`.
      const args = dereferenceExprsInArgs(actionInfo.args, event);
      const invokeAction = () => {
        // For global targets e.g. "AMP, `node` is the document root. Otherwise,
        // `target` is an element id and `node` is the corresponding element.
        const node = (this.globalTargets_[target])
          ? this.root_
          : this.root_.getElementById(target);
        if (node) {
          const invocation = new ActionInvocation(node, actionInfo.method,
              args, source, /* caller */ action.node, event, trust,
              node.tagName || target, sequenceId);
          return this.invoke_(invocation);
        } else {
          this.error_(`Target "${target}" not found for action ` +
              `[${actionInfo.str}].`);
        }
      };
      // Wait for the previous action, if any.
      currentPromise = (currentPromise)
        ? currentPromise.then(invokeAction)
        : invokeAction();
    });
  }

  /**
   * @param {string} message
   * @param {?Element=} opt_element
   * @private
   */
  error_(message, opt_element) {
    if (opt_element) {
      // reportError() supports displaying the element in dev console.
      const e = user().createError(`[${TAG_}] ${message}`);
      reportError(e, opt_element);
      throw e;
    } else {
      user().error(TAG_, message);
    }
  }

  /**
   * @param {!ActionInvocation} invocation
   * @return {?Promise}
   * @private
   */
  invoke_(invocation) {
    const {method, tagOrTarget} = invocation;

    // Check that this action is whitelisted (if a whitelist is set).
    if (this.whitelist_) {
      const id = `${tagOrTarget}.${method}`;
      if (!this.whitelist_.includes(id)) {
        this.error_(`"${id}" is not whitelisted (${this.whitelist_}).`);
        return null;
      }
    }

    // Handle global targets e.g. "AMP".
    const globalTarget = this.globalTargets_[tagOrTarget];
    if (globalTarget) {
      return globalTarget(invocation);
    }

    // Subsequent handlers assume that invocation target is an Element.
    const node = dev().assertElement(invocation.node);

    // Handle global actions e.g. "<any-element-id>.toggle".
    const globalMethod = this.globalMethodHandlers_[method];
    if (globalMethod && invocation.satisfiesTrust(globalMethod.minTrust)) {
      return globalMethod.handler(invocation);
    }

    // Handle element-specific actions.
    const lowerTagName = node.tagName.toLowerCase();
    if (lowerTagName.substring(0, 4) == 'amp-') {
      if (node.enqueAction) {
        node.enqueAction(invocation);
      } else {
        this.error_(`Unrecognized AMP element "${lowerTagName}".`, node);
      }
      return null;
    }

    // Special elements with AMP ID or known supported actions.
    const supportedActions = ELEMENTS_ACTIONS_MAP_[lowerTagName];
    // TODO(dvoytenko, #7063): switch back to `target.id` with form proxy.
    const targetId = node.getAttribute('id') || '';
    if ((targetId && targetId.substring(0, 4) == 'amp-') ||
        (supportedActions && supportedActions.indexOf(method) > -1)) {
      const holder = node[ACTION_HANDLER_];
      if (holder) {
        const {handler, minTrust} = holder;
        if (invocation.satisfiesTrust(minTrust)) {
          handler(invocation);
        }
      } else {
        node[ACTION_QUEUE_] = node[ACTION_QUEUE_] || [];
        node[ACTION_QUEUE_].push(invocation);
      }
      return null;
    }

    // Unsupported method.
    this.error_(`Target (${tagOrTarget}) doesn't support "${method}" action.`,
        invocation.caller);

    return null;
  }

  /**
   * @param {!Element} target
   * @param {string} actionEventType
   * @param {!Element=} opt_stopAt
   * @return {?{node: !Element, actionInfos: !Array<!ActionInfoDef>}}
   */
  findAction_(target, actionEventType, opt_stopAt) {
    // Go from target up the DOM tree and find the applicable action.
    let n = target;
    while (n) {
      if (opt_stopAt && n == opt_stopAt) {
        return null;
      }
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
   * Searches for a whitelist meta tag, parses and returns its contents.
   *
   * For example:
   * <meta name="amp-action-whitelist" content="AMP.setState, amp-form.submit">
   *
   * Returns:
   * ["AMP.setState", "amp-form.submit"]
   *
   * @return {?Array<string>}
   * @private
   */
  queryWhitelist_() {
    const {head} = this.ampdoc.getRootNode();
    if (!head) {
      return null;
    }
    const meta = head.querySelector('meta[name="amp-action-whitelist"]');
    if (!meta) {
      return null;
    }
    return meta.getAttribute('content').split(',').map(action => action.trim());
  }

  /**
   * Given a browser 'change' or 'input' event, add `details` property to it
   * containing whitelisted properties of the target element.
   * @param {!ActionEventDef} event
   * @private
   */
  addTargetPropertiesAsDetail_(event) {
    const detail = /** @type {!JsonObject} */ (map());
    const {target} = event;

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
    const {value} = toks.next();
    args[RAW_OBJECT_ARGS_KEY] = value;
    assertToken(toks.next(), [TokenType.SEPARATOR], ')');
  } else {
    // Key-value pairs. Format: key = value, ....
    do {
      tok = toks.next();
      const {type, value} = tok;
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
 * @return {T}
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
