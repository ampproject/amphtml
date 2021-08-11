function _typeof(obj) {"@babel/helpers - typeof";if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") {_typeof = function _typeof(obj) {return typeof obj;};} else {_typeof = function _typeof(obj) {return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;};}return _typeof(obj);}function _classCallCheck(instance, Constructor) {if (!(instance instanceof Constructor)) {throw new TypeError("Cannot call a class as a function");}}function _defineProperties(target, props) {for (var i = 0; i < props.length; i++) {var descriptor = props[i];descriptor.enumerable = descriptor.enumerable || false;descriptor.configurable = true;if ("value" in descriptor) descriptor.writable = true;Object.defineProperty(target, descriptor.key, descriptor);}}function _createClass(Constructor, protoProps, staticProps) {if (protoProps) _defineProperties(Constructor.prototype, protoProps);if (staticProps) _defineProperties(Constructor, staticProps);return Constructor;} /**
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

import {
ActionTrust,
DEFAULT_ACTION,
RAW_OBJECT_ARGS_KEY,
actionTrustToString } from "../core/constants/action-constants";

import { Keys } from "../core/constants/key-codes";
import { isEnabled } from "../core/dom";
import { isFiniteNumber } from "../core/types";
import { isArray, toArray } from "../core/types/array";
import { debounce, throttle } from "../core/types/function";
import { dict, getValueForExpr, hasOwn, map } from "../core/types/object";
import { toWin } from "../core/window";

import { Services } from "./";

import { reportError } from "../error-reporting";
import { getDetail } from "../event-helper";
import { isAmp4Email } from "../format";
import { dev, devAssert, user, userAssert } from "../log";
import { getMode } from "../mode";
import { registerServiceBuilderForDoc } from "../service-helpers";

/** @const {string} */
var TAG_ = 'Action';

/** @const {string} */
var ACTION_MAP_ = '__AMP_ACTION_MAP__' + Math.random();

/** @const {string} */
var ACTION_QUEUE_ = '__AMP_ACTION_QUEUE__';

/** @const {string} */
var ACTION_HANDLER_ = '__AMP_ACTION_HANDLER__';

/** @const {number} */
var DEFAULT_DEBOUNCE_WAIT = 300; // ms

/** @const {number} */
var DEFAULT_THROTTLE_INTERVAL = 100; // ms

/** @const {!Object<string,!Array<string>>} */
var NON_AMP_ELEMENTS_ACTIONS_ = {
  'form': ['submit', 'clear'] };


var DEFAULT_EMAIL_ALLOWLIST = [
{ tagOrTarget: 'AMP', method: 'setState' },
{ tagOrTarget: '*', method: 'focus' },
{ tagOrTarget: '*', method: 'hide' },
{ tagOrTarget: '*', method: 'show' },
{ tagOrTarget: '*', method: 'toggleClass' },
{ tagOrTarget: '*', method: 'toggleVisibility' }];


/**
 * Interactable widgets which should trigger tap events when the user clicks
 * or activates via the keyboard. Not all are here, e.g. progressbar, tabpanel,
 * since they are text inputs, readonly, or composite widgets that shouldn't
 * need to trigger tap events from spacebar or enter on their own.
 * See https://www.w3.org/TR/wai-aria-1.1/#widget_roles
 * @const {!Object<boolean>}
 */
export var TAPPABLE_ARIA_ROLES = {
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
  'treeitem': true };


/**
 * An expression arg value, e.g. `foo.bar` in `e:t.m(arg=foo.bar)`.
 * @typedef {{expression: string}}
 */
var ActionInfoArgExpressionDef;

/**
 * An arg value.
 * @typedef {(boolean|number|string|ActionInfoArgExpressionDef)}
 */
var ActionInfoArgValueDef;

/**
 * Map of arg names to their values, e.g. {arg: 123} in `e:t.m(arg=123)`.
 * @typedef {Object<string, ActionInfoArgValueDef>}
 */
var ActionInfoArgsDef;

/**
 * @typedef {{
 *   event: string,
 *   target: string,
 *   method: string,
 *   args: ?ActionInfoArgsDef,
 *   str: string
 * }}
 */
export var ActionInfoDef;

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
var ActionHandlerDef;

/**
 * @typedef {Event|DeferredEvent}
 */
export var ActionEventDef;

/**
 * The structure that contains all details of the action method invocation.
 * @struct @const @package For type.
 */
export var ActionInvocation = /*#__PURE__*/function () {
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
   * `actionEventType` is "tap".
   * `trust` depends on whether this action was a result of a user gesture.
   * `tagOrTarget` is "amp-form".
   * `sequenceId` is a pseudo-UUID.
   *
   * @param {!Node} node Element whose action is being invoked.
   * @param {string} method Name of the action being invoked.
   * @param {?JsonObject} args Named action arguments.
   * @param {?Element} source Element that generated the `event`.
   * @param {?Element} caller Element containing the on="..." action handler.
   * @param {?ActionEventDef} event The event object that triggered this action.
   * @param {!ActionTrust} trust The trust level of this invocation's trigger.
   * @param {?string} actionEventType The AMP event name that triggered this.
   * @param {?string} tagOrTarget The global target name or the element tagName.
   * @param {number} sequenceId An identifier for this action's sequence (all
   *   actions triggered by one event e.g. "tap:form1.submit, form2.submit").
   */
  function ActionInvocation(
  node,
  method,
  args,
  source,
  caller,
  event,
  trust)



  {var actionEventType = arguments.length > 7 && arguments[7] !== undefined ? arguments[7] : '?';var tagOrTarget = arguments.length > 8 && arguments[8] !== undefined ? arguments[8] : null;var sequenceId = arguments.length > 9 && arguments[9] !== undefined ? arguments[9] : Math.random();_classCallCheck(this, ActionInvocation);
    /** @type {!Node} */
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
    /** @const {!ActionTrust} */
    this.trust = trust;
    /** @const {?string} */
    this.actionEventType = actionEventType;
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
   */_createClass(ActionInvocation, [{ key: "satisfiesTrust", value:
    function satisfiesTrust(minimumTrust) {
      // Sanity check.
      if (!isFiniteNumber(this.trust)) {
        dev().error(TAG_, "Invalid trust for '".concat(this.method, "': ").concat(this.trust));
        return false;
      }
      if (this.trust < minimumTrust) {
        var t = actionTrustToString(this.trust);
        user().error(
        TAG_,
        "\"".concat(this.actionEventType, "\" event with \"").concat(t, "\" trust is not allowed to ") + "invoke \"".concat(
        this.tagOrTarget.toLowerCase(), ".").concat(this.method, "\"."));

        return false;
      }
      return true;
    } }]);return ActionInvocation;}();


/**
 * TODO(dvoytenko): consider splitting this class into two:
 * 1. A class that has a method "trigger(element, eventType, data)" and
 *    simply can search target in DOM and trigger methods on it.
 * 2. A class that configures event recognizers and rules and then
 *    simply calls action.trigger.
 */
export var ActionService = /*#__PURE__*/function () {
  /**
   * @param {!./ampdoc-impl.AmpDoc} ampdoc
   * @param {(!Document|!ShadowRoot)=} opt_root
   */
  function ActionService(ampdoc, opt_root) {_classCallCheck(this, ActionService);
    /** @const {!./ampdoc-impl.AmpDoc} */
    this.ampdoc = ampdoc;

    /** @const {!Document|!ShadowRoot} */
    this.root_ = opt_root || ampdoc.getRootNode();

    /** @const {boolean} */
    this.isEmail_ =
    this.ampdoc.isSingleDoc() &&
    isAmp4Email( /** @type {!Document} */(this.root_));

    /**
     * Optional allowlist of actions, e.g.:
     *
     *     [{tagOrTarget: 'AMP', method: 'navigateTo'},
     *      {tagOrTarget: 'AMP-FORM', method: 'submit'},
     *      {tagOrTarget: '*', method: 'show'}]
     *
     * If not null, any actions that are not in the allowlist will be ignored
     * and throw a user error at invocation time. Note that `tagOrTarget` is
     * always the canonical uppercased form (same as
     * `Element.prototype.tagName`). If `tagOrTarget` is the wildcard '*', then
     * the allowlisted method is allowed on any tag or target.
     *
     * For AMP4Email format documents, allowed actions are autogenerated.
     * @private {?Array<{tagOrTarget: string, method: string}>}
     */
    this.allowlist_ = this.isEmail_ ? DEFAULT_EMAIL_ALLOWLIST : null;

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

  /**
   * @param {string} name
   * TODO(dvoytenko): switch to a system where the event recognizers are
   * registered with Action instead, e.g. "doubletap", "tap to zoom".
   */_createClass(ActionService, [{ key: "addEvent", value:
    function addEvent(name) {var _this = this;
      if (name == 'tap') {
        // TODO(dvoytenko): if needed, also configure touch-based tap, e.g. for
        // fast-click.
        this.root_.addEventListener('click', function (event) {
          if (!event.defaultPrevented) {
            var element = /** @type {!Element} */(event.target);
            _this.trigger(element, name, event, ActionTrust.HIGH);
          }
        });
        this.root_.addEventListener('keydown', function (event) {
          var key = event.key,target = event.target;
          var element = /** @type {!Element} */(target);
          if (key == Keys.ENTER || key == Keys.SPACE) {
            var role = element.getAttribute('role');
            var isTapEventRole =
            role && hasOwn(TAPPABLE_ARIA_ROLES, role.toLowerCase());
            if (!event.defaultPrevented && isTapEventRole) {
              var hasAction = _this.trigger(
              element,
              name,
              event,
              ActionTrust.HIGH);

              // Only if the element has an action do we prevent the default.
              // In the absence of an action, e.g. on="[event].method", we do not
              // want to stop default behavior.
              if (hasAction) {
                event.preventDefault();
              }
            }
          }
        });
      } else if (name == 'submit') {
        this.root_.addEventListener(name, function (event) {
          var element = /** @type {!Element} */(event.target);
          // For get requests, the delegating to the viewer needs to happen
          // before this.
          _this.trigger(element, name, event, ActionTrust.HIGH);
        });
      } else if (name == 'change') {
        this.root_.addEventListener(name, function (event) {
          var element = /** @type {!Element} */(event.target);
          _this.addTargetPropertiesAsDetail_(event);
          _this.trigger(element, name, event, ActionTrust.HIGH);
        });
      } else if (name == 'input-debounced') {
        var debouncedInput = debounce(
        this.ampdoc.win,
        function (event) {
          var target = /** @type {!Element} */(event.target);
          _this.trigger(
          target,
          name,
          /** @type {!ActionEventDef} */(event),
          ActionTrust.HIGH);

        },
        DEFAULT_DEBOUNCE_WAIT);


        this.root_.addEventListener('input', function (event) {
          // Create a DeferredEvent to avoid races where the browser cleans up
          // the event object before the async debounced function is called.
          var deferredEvent = new DeferredEvent(event);
          _this.addTargetPropertiesAsDetail_(deferredEvent);
          debouncedInput(deferredEvent);
        });
      } else if (name == 'input-throttled') {
        var throttledInput = throttle(
        this.ampdoc.win,
        function (event) {
          var target = /** @type {!Element} */(event.target);
          _this.trigger(
          target,
          name,
          /** @type {!ActionEventDef} */(event),
          ActionTrust.HIGH);

        },
        DEFAULT_THROTTLE_INTERVAL);


        this.root_.addEventListener('input', function (event) {
          var deferredEvent = new DeferredEvent(event);
          _this.addTargetPropertiesAsDetail_(deferredEvent);
          throttledInput(deferredEvent);
        });
      } else if (name == 'valid' || name == 'invalid') {
        this.root_.addEventListener(name, function (event) {
          var element = /** @type {!Element} */(event.target);
          _this.trigger(element, name, event, ActionTrust.HIGH);
        });
      }
    }

    /**
     * Registers the action target that will receive all designated actions.
     * @param {string} name
     * @param {ActionHandlerDef} handler
     */ }, { key: "addGlobalTarget", value:
    function addGlobalTarget(name, handler) {
      this.globalTargets_[name] = handler;
    }

    /**
     * Registers the action handler for a common method.
     * @param {string} name
     * @param {ActionHandlerDef} handler
     * @param {ActionTrust} minTrust
     */ }, { key: "addGlobalMethodHandler", value:
    function addGlobalMethodHandler(name, handler) {var minTrust = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : ActionTrust.DEFAULT;
      this.globalMethodHandlers_[name] = { handler: handler, minTrust: minTrust };
    }

    /**
     * Triggers the specified event on the target element.
     * @param {!Element} target
     * @param {string} eventType
     * @param {?ActionEventDef} event
     * @param {!ActionTrust} trust
     * @param {?JsonObject=} opt_args
     * @return {boolean} true if the target has an action.
     */ }, { key: "trigger", value:
    function trigger(target, eventType, event, trust, opt_args) {
      return this.action_(target, eventType, event, trust, opt_args);
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
     */ }, { key: "execute", value:
    function execute(target, method, args, source, caller, event, trust) {
      var invocation = new ActionInvocation(
      target,
      method,
      args,
      source,
      caller,
      event,
      trust);

      this.invoke_(invocation);
    }

    /**
     * Installs action handler for the specified element. The action handler is
     * responsible for checking invocation trust.
     *
     * For AMP elements, use base-element.registerAction() instead.
     *
     * @param {!Element} target
     * @param {ActionHandlerDef} handler
     */ }, { key: "installActionHandler", value:
    function installActionHandler(target, handler) {
      // TODO(dvoytenko, #7063): switch back to `target.id` with form proxy.
      var targetId = target.getAttribute('id') || '';

      devAssert(
      isAmpTagName(targetId) ||
      target.tagName.toLowerCase() in NON_AMP_ELEMENTS_ACTIONS_);




      if (target[ACTION_HANDLER_]) {
        dev().error(TAG_, "Action handler already installed for ".concat(target));
        return;
      }
      target[ACTION_HANDLER_] = handler;

      /** @const {Array<!ActionInvocation>} */
      var queuedInvocations = target[ACTION_QUEUE_];
      if (isArray(queuedInvocations)) {
        // Invoke and clear all queued invocations now handler is installed.
        Services.timerFor(toWin(target.ownerDocument.defaultView)).delay(function () {
          // TODO(dvoytenko, #1260): dedupe actions.
          queuedInvocations.forEach(function (invocation) {
            try {
              handler(invocation);
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
     * @param {!Element} element
     * @param {string} actionEventType
     * @param {!Element=} opt_stopAt
     * @return {boolean}
     */ }, { key: "hasAction", value:
    function hasAction(element, actionEventType, opt_stopAt) {
      return !!this.findAction_(element, actionEventType, opt_stopAt);
    }

    /**
     * Checks if the given element's registered action resolves to at least one
     * existing element by id or a global target (e.g. "AMP").
     * @param {!Element} element
     * @param {string} actionEventType
     * @param {!Element=} opt_stopAt
     * @return {boolean}
     */ }, { key: "hasResolvableAction", value:
    function hasResolvableAction(element, actionEventType, opt_stopAt) {var _this2 = this;
      var action = this.findAction_(element, actionEventType, opt_stopAt);
      if (!action) {
        return false;
      }
      return action.actionInfos.some(function (action) {
        var target = action.target;
        return !!_this2.getActionNode_(target);
      });
    }

    /**
     * Checks if the given element's registered action resolves to at least one
     * existing element by id or a global target (e.g. "AMP").
     * @param {!Element} element
     * @param {string} actionEventType
     * @param {!Element} targetElement
     * @param {!Element=} opt_stopAt
     * @return {boolean}
     */ }, { key: "hasResolvableActionForTarget", value:
    function hasResolvableActionForTarget(
    element,
    actionEventType,
    targetElement,
    opt_stopAt)
    {var _this3 = this;
      var action = this.findAction_(element, actionEventType, opt_stopAt);
      if (!action) {
        return false;
      }
      return action.actionInfos.some(function (actionInfo) {
        var target = actionInfo.target;
        return _this3.getActionNode_(target) == targetElement;
      });
    }

    /**
     * For global targets e.g. "AMP", returns the document root. Otherwise,
     * `target` is an element id and the corresponding element is returned.
     * @param {string} target
     * @return {?Document|?Element|?ShadowRoot}
     * @private
     */ }, { key: "getActionNode_", value:
    function getActionNode_(target) {
      return this.globalTargets_[target] ?
      this.root_ :
      this.root_.getElementById(target);
    }

    /**
     * Sets the action allowlist. Can be used to clear it.
     * @param {!Array<{tagOrTarget: string, method: string}>} allowlist
     */ }, { key: "setAllowlist", value:
    function setAllowlist(allowlist) {
      devAssert(
      allowlist.every(function (v) {return v.tagOrTarget && v.method;}));


      this.allowlist_ = allowlist;
    }

    /**
     * Adds an action to the allowlist.
     * @param {string} tagOrTarget The tag or target to allowlist, e.g.
     *     'AMP-LIST', '*'.
     * @param {string|Array<string>} methods The method(s) to allowlist, e.g. 'show', 'hide'.
     * @param {Array<string>=} opt_forFormat
     */ }, { key: "addToAllowlist", value:
    function addToAllowlist(tagOrTarget, methods, opt_forFormat) {var _this4 = this;
      // TODO(wg-performance): When it becomes possible to getFormat(),
      // we can store `format_` instead of `isEmail_` and check
      // (opt_forFormat && !opt_forFormat.includes(this.format_))
      if (opt_forFormat && opt_forFormat.includes('email') !== this.isEmail_) {
        return;
      }
      if (!this.allowlist_) {
        this.allowlist_ = [];
      }
      if (!isArray(methods)) {
        methods = [methods];
      }
      methods.forEach(function (method) {
        if (
        _this4.allowlist_.some(
        function (v) {return v.tagOrTarget == tagOrTarget && v.method == method;}))

        {
          return;
        }
        _this4.allowlist_.push({ tagOrTarget: tagOrTarget, method: method });
      });
    }

    /**
     * @param {!Element} source
     * @param {string} actionEventType
     * @param {?ActionEventDef} event
     * @param {!ActionTrust} trust
     * @param {?JsonObject=} opt_args
     * @return {boolean} True if the element has an action.
     * @private
     */ }, { key: "action_", value:
    function action_(source, actionEventType, event, trust, opt_args) {var _this5 = this;
      var action = this.findAction_(source, actionEventType);
      if (!action) {
        return false;
      }
      // Use a pseudo-UUID to uniquely identify this sequence of actions.
      // A sequence is all actions triggered by a single event.
      var sequenceId = Math.random();
      // Invoke actions serially, where each action waits for its predecessor
      // to complete. `currentPromise` is the i'th promise in the chain.
      /** @type {?Promise} */
      var currentPromise = null;
      action.actionInfos.forEach(function (actionInfo) {
        var args = actionInfo.args,method = actionInfo.method,str = actionInfo.str,target = actionInfo.target;
        var dereferencedArgs = dereferenceArgsVariables(args, event, opt_args);
        var invokeAction = function invokeAction() {
          var node = _this5.getActionNode_(target);
          if (!node) {
            _this5.error_("Target \"".concat(target, "\" not found for action [").concat(str, "]."));
            return;
          }
          var invocation = new ActionInvocation(
          node,
          method,
          dereferencedArgs,
          source,
          action.node,
          event,
          trust,
          actionEventType,
          node.tagName || target,
          sequenceId);

          return _this5.invoke_(invocation);
        };
        // Wait for the previous action, if any.
        currentPromise = currentPromise ?
        currentPromise.then(invokeAction) :
        invokeAction();
      });

      return action.actionInfos.length >= 1;
    }

    /**
     * @param {string} message
     * @param {?Element=} opt_element
     * @private
     */ }, { key: "error_", value:
    function error_(message, opt_element) {
      if (opt_element) {
        // reportError() supports displaying the element in dev console.
        var e = user().createError("[".concat(TAG_, "] ").concat(message));
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
     */ }, { key: "invoke_", value:
    function invoke_(invocation) {
      var method = invocation.method,tagOrTarget = invocation.tagOrTarget;

      // Check that this action is allowlisted (if a allowlist is set).
      if (this.allowlist_) {
        if (!isActionAllowlisted(invocation, this.allowlist_)) {
          this.error_("\"".concat(
          tagOrTarget, ".").concat(method, "\" is not allowlisted ").concat(JSON.stringify(
          this.allowlist_), "."));


          return null;
        }
      }

      // Handle global targets e.g. "AMP".
      var globalTarget = this.globalTargets_[tagOrTarget];
      if (globalTarget) {
        return globalTarget(invocation);
      }

      // Subsequent handlers assume that invocation target is an Element.
      var node = /** @type {!Element} */(invocation.node);

      // Handle global actions e.g. "<any-element-id>.toggle".
      var globalMethod = this.globalMethodHandlers_[method];
      if (globalMethod && invocation.satisfiesTrust(globalMethod.minTrust)) {
        return globalMethod.handler(invocation);
      }

      // Handle element-specific actions.
      var lowerTagName = node.tagName.toLowerCase();
      if (isAmpTagName(lowerTagName)) {
        if (node.enqueAction) {
          node.enqueAction(invocation);
        } else {
          this.error_("Unrecognized AMP element \"".concat(lowerTagName, "\"."), node);
        }
        return null;
      }

      // Special non-AMP elements with AMP ID or known supported actions.
      var nonAmpActions = NON_AMP_ELEMENTS_ACTIONS_[lowerTagName];
      // TODO(dvoytenko, #7063): switch back to `target.id` with form proxy.
      var targetId = node.getAttribute('id') || '';
      if (
      isAmpTagName(targetId) || (
      nonAmpActions && nonAmpActions.indexOf(method) > -1))
      {
        var handler = node[ACTION_HANDLER_];
        if (handler) {
          handler(invocation);
        } else {
          node[ACTION_QUEUE_] = node[ACTION_QUEUE_] || [];
          node[ACTION_QUEUE_].push(invocation);
        }
        return null;
      }

      // Unsupported method.
      this.error_("Target (".concat(
      tagOrTarget, ") doesn't support \"").concat(method, "\" action."),
      invocation.caller);


      return null;
    }

    /**
     * @param {!Element} target
     * @param {string} actionEventType
     * @param {!Element=} opt_stopAt
     * @return {?{node: !Element, actionInfos: !Array<!ActionInfoDef>}}
     */ }, { key: "findAction_", value:
    function findAction_(target, actionEventType, opt_stopAt) {
      // Go from target up the DOM tree and find the applicable action.
      var n = target;
      while (n) {
        if (opt_stopAt && n == opt_stopAt) {
          return null;
        }
        var actionInfos = this.matchActionInfos_(n, actionEventType);
        if (actionInfos && isEnabled(n)) {
          return { node: n, actionInfos: devAssert(actionInfos) };
        }
        n = n.parentElement;
      }
      return null;
    }

    /**
     * @param {!Element} node
     * @param {string} actionEventType
     * @return {?Array<!ActionInfoDef>}
     */ }, { key: "matchActionInfos_", value:
    function matchActionInfos_(node, actionEventType) {
      var actionMap = this.getActionMap_(node, actionEventType);
      if (!actionMap) {
        return null;
      }
      return actionMap[actionEventType] || null;
    }

    /**
     * @param {!Element} node
     * @param {string} actionEventType
     * @return {?Object<string, !Array<!ActionInfoDef>>}
     */ }, { key: "getActionMap_", value:
    function getActionMap_(node, actionEventType) {
      var actionMap = node[ACTION_MAP_];
      if (actionMap === undefined) {
        actionMap = null;
        if (node.hasAttribute('on')) {
          var action = node.getAttribute('on');
          actionMap = parseActionMap(action, node);
          node[ACTION_MAP_] = actionMap;
        } else if (node.hasAttribute('execute')) {
          var _action = node.getAttribute('execute');
          actionMap = parseActionMap("".concat(actionEventType, ":").concat(_action), node);
          node[ACTION_MAP_] = actionMap;
        }
      }
      return actionMap;
    }

    /**
     * Resets a node's actions with those defined in the given actions string.
     * @param {!Element} node
     * @param {string} actionsStr
     */ }, { key: "setActions", value:
    function setActions(node, actionsStr) {
      node.setAttribute('on', actionsStr);

      // Clear cache.
      delete node[ACTION_MAP_];
    }

    /**
     * Given a browser 'change' or 'input' event, add `detail` property to it
     * containing allowlisted properties of the target element. Noop if `detail`
     * is readonly.
     * @param {!ActionEventDef} event
     * @private
     */ }, { key: "addTargetPropertiesAsDetail_", value:
    function addTargetPropertiesAsDetail_(event) {
      var detail = /** @type {!JsonObject} */(map());
      var target = event.target;

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

      if (target.files) {
        detail['files'] = toArray(target.files).map(function (file) {return ({
            'name': file.name,
            'size': file.size,
            'type': file.type });});

      }

      if (Object.keys(detail).length > 0) {
        try {
          event.detail = detail;
        } catch (_unused) {}
      }
    } }]);return ActionService;}();


/**
 * @param {string} lowercaseTagName
 * @return {boolean}
 * @private
 */
function isAmpTagName(lowercaseTagName) {
  return lowercaseTagName.substring(0, 4) === 'amp-';
}

/**
 * Returns `true` if the given action invocation is allowlisted in the given
 * allowlist. Default actions' alias, 'activate', are automatically
 * allowlisted if their corresponding registered alias is allowlisted.
 * @param {!ActionInvocation} invocation
 * @param {!Array<{tagOrTarget: string, method: string}>} allowlist
 * @return {boolean}
 * @private
 */
function isActionAllowlisted(invocation, allowlist) {
  var method = invocation.method;
  var node = invocation.node,tagOrTarget = invocation.tagOrTarget;
  // Use alias if default action is invoked.
  if (
  method === DEFAULT_ACTION &&
  typeof node.getDefaultActionAlias == 'function')
  {
    method = node.getDefaultActionAlias();
  }
  var lcMethod = method.toLowerCase();
  var lcTagOrTarget = tagOrTarget.toLowerCase();
  return allowlist.some(function (w) {
    if (
    w.tagOrTarget.toLowerCase() === lcTagOrTarget ||
    w.tagOrTarget === '*')
    {
      if (w.method.toLowerCase() === lcMethod) {
        return true;
      }
    }
    return false;
  });
}

/**
 * A clone of an event object with its function properties replaced.
 * This is useful e.g. for event objects that need to be passed to an async
 * context, but the browser might have cleaned up the original event object.
 * This clone replaces functions with error throws since they won't behave
 * normally after the original object has been destroyed.
 * @private visible for testing
 */
export var DeferredEvent =
/**
 * @param {!Event} event
 */
function DeferredEvent(event) {_classCallCheck(this, DeferredEvent);
  /** @type {?Object} */
  this.detail = null;

  cloneWithoutFunctions(event, this);
};


/**
 * Clones an object and replaces its function properties with throws.
 * @param {!T} original
 * @param {!T=} opt_dest
 * @return {!T}
 * @template T
 * @private
 */
function cloneWithoutFunctions(original, opt_dest) {
  var clone = opt_dest || map();
  for (var prop in original) {
    var value = original[prop];
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
  devAssert(null);
}

/**
 * @param {string} action
 * @param {!Element} context
 * @return {?Object<string, !Array<!ActionInfoDef>>}
 * @private Visible for testing only.
 */
export function parseActionMap(action, context) {
  var assertAction = assertActionForParser.bind(null, action, context);
  var assertToken = assertTokenForParser.bind(null, action, context);

  var actionMap = null;

  var toks = new ParserTokenizer(action);
  var tok;
  var peek;
  do {
    tok = toks.next();
    if (
    tok.type == TokenType.EOF || (
    tok.type == TokenType.SEPARATOR && tok.value == ';'))
    {
      // Expected, ignore.
    } else if (tok.type == TokenType.LITERAL || tok.type == TokenType.ID) {
      // Format: event:target.method

      // Event: "event:"
      var event = tok.value;

      // Target: ":target." separator
      assertToken(toks.next(), [TokenType.SEPARATOR], ':');

      var actions = [];

      // Handlers for event.
      do {
        var target = assertToken(toks.next(), [
        TokenType.LITERAL,
        TokenType.ID]).
        value;

        // Method: ".method". Method is optional.
        var method = DEFAULT_ACTION;
        var args = null;

        peek = toks.peek();
        if (peek.type == TokenType.SEPARATOR && peek.value == '.') {
          toks.next(); // Skip '.'
          method =
          assertToken(toks.next(), [TokenType.LITERAL, TokenType.ID]).value ||
          method;

          // Optionally, there may be arguments: "(key = value, key = value)".
          peek = toks.peek();
          if (peek.type == TokenType.SEPARATOR && peek.value == '(') {
            toks.next(); // Skip '('
            args = tokenizeMethodArguments(toks, assertToken, assertAction);
          }
        }

        actions.push({
          event: event,
          target: target,
          method: method,
          args:
          args && false && Object.freeze ?
          Object.freeze(args) :
          args,
          str: action });


        peek = toks.peek();
      } while (
      peek.type == TokenType.SEPARATOR &&
      peek.value == ',' &&
      toks.next());
      // skip "," when found

      if (!actionMap) {
        actionMap = map();
      }

      actionMap[event] = actions;
    } else {
      // Unexpected token.
      assertAction(false, "; unexpected token [".concat(tok.value || '', "]"));
    }
  } while (tok.type != TokenType.EOF);

  return actionMap;
}

/**
 * Tokenizes and returns method arguments, e.g. target.method(arguments).
 * @param {!ParserTokenizer} toks
 * @param {!Function} assertToken
 * @param {!Function} assertAction
 * @return {?ActionInfoArgsDef}
 * @private
 */
function tokenizeMethodArguments(toks, assertToken, assertAction) {
  var peek = toks.peek();
  var tok;
  var args = null;
  // Object literal. Format: {...}
  if (peek.type == TokenType.OBJECT) {
    // Don't parse object literals. Tokenize as a single expression
    // fragment and delegate to specific action handler.
    args = map();
    var _toks$next = toks.next(),value = _toks$next.value;
    args[RAW_OBJECT_ARGS_KEY] = value;
    assertToken(toks.next(), [TokenType.SEPARATOR], ')');
  } else {
    // Key-value pairs. Format: key = value, ....
    do {
      tok = toks.next();
      var _tok = tok,type = _tok.type,_value = _tok.value;
      if (type == TokenType.SEPARATOR && (_value == ',' || _value == ')')) {
        // Expected: ignore.
      } else if (type == TokenType.LITERAL || type == TokenType.ID) {
        // Key: "key = "
        assertToken(toks.next(), [TokenType.SEPARATOR], '=');
        // Value is either a literal or an expression: "foo.bar.baz"
        tok = assertToken(toks.next( /* convertValue */true), [
        TokenType.LITERAL,
        TokenType.ID]);

        var argValueTokens = [tok];
        // Expressions have one or more dereferences: ".identifier"
        if (tok.type == TokenType.ID) {
          for (
          peek = toks.peek();
          peek.type == TokenType.SEPARATOR && peek.value == '.';
          peek = toks.peek())
          {
            toks.next(); // Skip '.'.
            tok = assertToken(toks.next(false), [TokenType.ID]);
            argValueTokens.push(tok);
          }
        }
        var argValue = argValueForTokens(argValueTokens);
        if (!args) {
          args = map();
        }
        args[_value] = argValue;
        peek = toks.peek();
        assertAction(
        peek.type == TokenType.SEPARATOR && (
        peek.value == ',' || peek.value == ')'),
        'Expected either [,] or [)]');

      } else {
        // Unexpected token.
        assertAction(false, "; unexpected token [".concat(tok.value || '', "]"));
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
    return (/** @type {(boolean|number|string)} */(tokens[0].value));
  } else {
    var values = tokens.map(function (token) {return token.value;});
    var expression = values.join('.');
    return (/** @type {ActionInfoArgExpressionDef} */({ expression: expression }));
  }
}

/**
 * Dereferences expression args in `args` using values in data.
 * @param {?ActionInfoArgsDef} args
 * @param {?ActionEventDef} event
 * @param {?JsonObject=} opt_args
 * @return {?JsonObject}
 * @private
 */
export function dereferenceArgsVariables(args, event, opt_args) {
  if (!args) {
    return args;
  }
  var data = opt_args || dict({});
  if (event) {
    var detail = getDetail( /** @type {!Event} */(event));
    if (detail) {
      data['event'] = detail;
    }
  }
  var applied = map();
  Object.keys(args).forEach(function (key) {
    var value = args[key];
    // Only JSON expression strings that contain dereferences (e.g. `foo.bar`)
    // are processed as ActionInfoArgExpressionDef. We also support
    // dereferencing strings like `foo` iff there is a corresponding key in
    // `data`. Otherwise, `foo` is treated as a string "foo".
    if (_typeof(value) == 'object' && value.expression) {
      var expr = /** @type {ActionInfoArgExpressionDef} */(value).expression;
      var exprValue = getValueForExpr(data, expr);
      // If expr can't be found in data, use null instead of undefined.
      value = exprValue === undefined ? null : exprValue;
    }
    if (data[value]) {
      applied[key] = data[value];
    } else {
      applied[key] = value;
    }
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
  return userAssert(
  condition,
  'Invalid action definition in %s: [%s] %s',
  context,
  s,
  opt_message || '');

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
    assertActionForParser(
    s,
    context,
    types.includes(tok.type) && tok.value == opt_value, "; expected [".concat(
    opt_value, "]"));

  } else {
    assertActionForParser(s, context, types.includes(tok.type));
  }
  return tok;
}

/**
 * @enum {number}
 */
var TokenType = {
  INVALID: 0,
  EOF: 1,
  SEPARATOR: 2,
  LITERAL: 3,
  ID: 4,
  OBJECT: 5 };


/**
 * @typedef {{type: TokenType, value: *}}
 */
var TokenDef;

/** @private @const {string} */
var WHITESPACE_SET = " \t\n\r\f\x0B\xA0\u2028\u2029";

/** @private @const {string} */
var SEPARATOR_SET = ';:.()=,|!';

/** @private @const {string} */
var STRING_SET = '"\'';

/** @private @const {string} */
var OBJECT_SET = '{}';

/** @private @const {string} */
var SPECIAL_SET = WHITESPACE_SET + SEPARATOR_SET + STRING_SET + OBJECT_SET;

/** @private */var
ParserTokenizer = /*#__PURE__*/function () {
  /**
   * @param {string} str
   */
  function ParserTokenizer(str) {_classCallCheck(this, ParserTokenizer);
    /** @private @const {string} */
    this.str_ = str;

    /** @private {number} */
    this.index_ = -1;
  }

  /**
   * Returns the next token and advances the position.
   * @param {boolean=} opt_convertValues
   * @return {!TokenDef}
   */_createClass(ParserTokenizer, [{ key: "next", value:
    function next(opt_convertValues) {
      var tok = this.next_(opt_convertValues || false);
      this.index_ = tok.index;
      return tok;
    }

    /**
     * Returns the next token but keeps the current position.
     * @param {boolean=} opt_convertValues
     * @return {!TokenDef}
     */ }, { key: "peek", value:
    function peek(opt_convertValues) {
      return this.next_(opt_convertValues || false);
    }

    /**
     * @param {boolean} convertValues
     * @return {!{type: TokenType, value: *, index: number}}
     */ }, { key: "next_", value:
    function next_(convertValues) {
      var newIndex = this.index_ + 1;
      if (newIndex >= this.str_.length) {
        return { type: TokenType.EOF, index: this.index_ };
      }

      var c = this.str_.charAt(newIndex);

      // Whitespace: standard set.
      if (WHITESPACE_SET.indexOf(c) != -1) {
        newIndex++;
        for (; newIndex < this.str_.length; newIndex++) {
          if (WHITESPACE_SET.indexOf(this.str_.charAt(newIndex)) == -1) {
            break;
          }
        }
        if (newIndex >= this.str_.length) {
          return { type: TokenType.EOF, index: newIndex };
        }
        c = this.str_.charAt(newIndex);
      }

      // A numeric. Notice that it steals the `.` from separators.
      if (
      convertValues && (
      isNum(c) || (
      c == '.' &&
      newIndex + 1 < this.str_.length &&
      isNum(this.str_[newIndex + 1]))))
      {
        var hasFraction = c == '.';
        var _end = newIndex + 1;
        for (; _end < this.str_.length; _end++) {
          var c2 = this.str_.charAt(_end);
          if (c2 == '.') {
            hasFraction = true;
            continue;
          }
          if (!isNum(c2)) {
            break;
          }
        }
        var _s = this.str_.substring(newIndex, _end);
        var value = hasFraction ? parseFloat(_s) : parseInt(_s, 10);
        newIndex = _end - 1;
        return { type: TokenType.LITERAL, value: value, index: newIndex };
      }

      // Different separators.
      if (SEPARATOR_SET.indexOf(c) != -1) {
        return { type: TokenType.SEPARATOR, value: c, index: newIndex };
      }

      // String literal.
      if (STRING_SET.indexOf(c) != -1) {
        var _end2 = -1;
        for (var i = newIndex + 1; i < this.str_.length; i++) {
          if (this.str_.charAt(i) == c) {
            _end2 = i;
            break;
          }
        }
        if (_end2 == -1) {
          return { type: TokenType.INVALID, index: newIndex };
        }
        var _value2 = this.str_.substring(newIndex + 1, _end2);
        newIndex = _end2;
        return { type: TokenType.LITERAL, value: _value2, index: newIndex };
      }

      // Object literal.
      if (c == '{') {
        var numberOfBraces = 1;
        var _end3 = -1;
        for (var _i = newIndex + 1; _i < this.str_.length; _i++) {
          var char = this.str_[_i];
          if (char == '{') {
            numberOfBraces++;
          } else if (char == '}') {
            numberOfBraces--;
          }
          if (numberOfBraces <= 0) {
            _end3 = _i;
            break;
          }
        }
        if (_end3 == -1) {
          return { type: TokenType.INVALID, index: newIndex };
        }
        var _value3 = this.str_.substring(newIndex, _end3 + 1);
        newIndex = _end3;
        return { type: TokenType.OBJECT, value: _value3, index: newIndex };
      }

      // Advance until next special character.
      var end = newIndex + 1;
      for (; end < this.str_.length; end++) {
        if (SPECIAL_SET.indexOf(this.str_.charAt(end)) != -1) {
          break;
        }
      }
      var s = this.str_.substring(newIndex, end);
      newIndex = end - 1;

      // Boolean literal.
      if (convertValues && (s == 'true' || s == 'false')) {
        var _value4 = s == 'true';
        return { type: TokenType.LITERAL, value: _value4, index: newIndex };
      }

      // Identifier.
      if (!isNum(s.charAt(0))) {
        return { type: TokenType.ID, value: s, index: newIndex };
      }

      // Key.
      return { type: TokenType.LITERAL, value: s, index: newIndex };
    } }]);return ParserTokenizer;}();


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
  /* opt_instantiate */true);

}
// /Users/mszylkowski/src/amphtml/src/service/action-impl.js