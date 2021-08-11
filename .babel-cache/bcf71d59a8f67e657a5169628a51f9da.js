function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

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
import { ActionTrust, DEFAULT_ACTION, RAW_OBJECT_ARGS_KEY, actionTrustToString } from "../core/constants/action-constants";
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
var DEFAULT_DEBOUNCE_WAIT = 300;
// ms

/** @const {number} */
var DEFAULT_THROTTLE_INTERVAL = 100;
// ms

/** @const {!Object<string,!Array<string>>} */
var NON_AMP_ELEMENTS_ACTIONS_ = {
  'form': ['submit', 'clear']
};
var DEFAULT_EMAIL_ALLOWLIST = [{
  tagOrTarget: 'AMP',
  method: 'setState'
}, {
  tagOrTarget: '*',
  method: 'focus'
}, {
  tagOrTarget: '*',
  method: 'hide'
}, {
  tagOrTarget: '*',
  method: 'show'
}, {
  tagOrTarget: '*',
  method: 'toggleClass'
}, {
  tagOrTarget: '*',
  method: 'toggleVisibility'
}];

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
  'treeitem': true
};

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
  function ActionInvocation(node, method, args, source, caller, event, trust, actionEventType, tagOrTarget, sequenceId) {
    if (actionEventType === void 0) {
      actionEventType = '?';
    }

    if (tagOrTarget === void 0) {
      tagOrTarget = null;
    }

    if (sequenceId === void 0) {
      sequenceId = Math.random();
    }

    _classCallCheck(this, ActionInvocation);

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
   */
  _createClass(ActionInvocation, [{
    key: "satisfiesTrust",
    value: function satisfiesTrust(minimumTrust) {
      // Sanity check.
      if (!isFiniteNumber(this.trust)) {
        dev().error(TAG_, "Invalid trust for '" + this.method + "': " + this.trust);
        return false;
      }

      if (this.trust < minimumTrust) {
        var t = actionTrustToString(this.trust);
        user().error(TAG_, "\"" + this.actionEventType + "\" event with \"" + t + "\" trust is not allowed to " + ("invoke \"" + this.tagOrTarget.toLowerCase() + "." + this.method + "\"."));
        return false;
      }

      return true;
    }
  }]);

  return ActionInvocation;
}();

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
  function ActionService(ampdoc, opt_root) {
    _classCallCheck(this, ActionService);

    /** @const {!./ampdoc-impl.AmpDoc} */
    this.ampdoc = ampdoc;

    /** @const {!Document|!ShadowRoot} */
    this.root_ = opt_root || ampdoc.getRootNode();

    /** @const {boolean} */
    this.isEmail_ = this.ampdoc.isSingleDoc() && isAmp4Email(
    /** @type {!Document} */
    this.root_);

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
   */
  _createClass(ActionService, [{
    key: "addEvent",
    value: function addEvent(name) {
      var _this = this;

      if (name == 'tap') {
        // TODO(dvoytenko): if needed, also configure touch-based tap, e.g. for
        // fast-click.
        this.root_.addEventListener('click', function (event) {
          if (!event.defaultPrevented) {
            var element = dev().assertElement(event.target);

            _this.trigger(element, name, event, ActionTrust.HIGH);
          }
        });
        this.root_.addEventListener('keydown', function (event) {
          var key = event.key,
              target = event.target;
          var element = dev().assertElement(target);

          if (key == Keys.ENTER || key == Keys.SPACE) {
            var role = element.getAttribute('role');
            var isTapEventRole = role && hasOwn(TAPPABLE_ARIA_ROLES, role.toLowerCase());

            if (!event.defaultPrevented && isTapEventRole) {
              var hasAction = _this.trigger(element, name, event, ActionTrust.HIGH);

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
          var element = dev().assertElement(event.target);

          // For get requests, the delegating to the viewer needs to happen
          // before this.
          _this.trigger(element, name, event, ActionTrust.HIGH);
        });
      } else if (name == 'change') {
        this.root_.addEventListener(name, function (event) {
          var element = dev().assertElement(event.target);

          _this.addTargetPropertiesAsDetail_(event);

          _this.trigger(element, name, event, ActionTrust.HIGH);
        });
      } else if (name == 'input-debounced') {
        var debouncedInput = debounce(this.ampdoc.win, function (event) {
          var target = dev().assertElement(event.target);

          _this.trigger(target, name,
          /** @type {!ActionEventDef} */
          event, ActionTrust.HIGH);
        }, DEFAULT_DEBOUNCE_WAIT);
        this.root_.addEventListener('input', function (event) {
          // Create a DeferredEvent to avoid races where the browser cleans up
          // the event object before the async debounced function is called.
          var deferredEvent = new DeferredEvent(event);

          _this.addTargetPropertiesAsDetail_(deferredEvent);

          debouncedInput(deferredEvent);
        });
      } else if (name == 'input-throttled') {
        var throttledInput = throttle(this.ampdoc.win, function (event) {
          var target = dev().assertElement(event.target);

          _this.trigger(target, name,
          /** @type {!ActionEventDef} */
          event, ActionTrust.HIGH);
        }, DEFAULT_THROTTLE_INTERVAL);
        this.root_.addEventListener('input', function (event) {
          var deferredEvent = new DeferredEvent(event);

          _this.addTargetPropertiesAsDetail_(deferredEvent);

          throttledInput(deferredEvent);
        });
      } else if (name == 'valid' || name == 'invalid') {
        this.root_.addEventListener(name, function (event) {
          var element = dev().assertElement(event.target);

          _this.trigger(element, name, event, ActionTrust.HIGH);
        });
      }
    }
    /**
     * Registers the action target that will receive all designated actions.
     * @param {string} name
     * @param {ActionHandlerDef} handler
     */

  }, {
    key: "addGlobalTarget",
    value: function addGlobalTarget(name, handler) {
      this.globalTargets_[name] = handler;
    }
    /**
     * Registers the action handler for a common method.
     * @param {string} name
     * @param {ActionHandlerDef} handler
     * @param {ActionTrust} minTrust
     */

  }, {
    key: "addGlobalMethodHandler",
    value: function addGlobalMethodHandler(name, handler, minTrust) {
      if (minTrust === void 0) {
        minTrust = ActionTrust.DEFAULT;
      }

      this.globalMethodHandlers_[name] = {
        handler: handler,
        minTrust: minTrust
      };
    }
    /**
     * Triggers the specified event on the target element.
     * @param {!Element} target
     * @param {string} eventType
     * @param {?ActionEventDef} event
     * @param {!ActionTrust} trust
     * @param {?JsonObject=} opt_args
     * @return {boolean} true if the target has an action.
     */

  }, {
    key: "trigger",
    value: function trigger(target, eventType, event, trust, opt_args) {
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
     */

  }, {
    key: "execute",
    value: function execute(target, method, args, source, caller, event, trust) {
      var invocation = new ActionInvocation(target, method, args, source, caller, event, trust);
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
     */

  }, {
    key: "installActionHandler",
    value: function installActionHandler(target, handler) {
      // TODO(dvoytenko, #7063): switch back to `target.id` with form proxy.
      var targetId = target.getAttribute('id') || '';
      devAssert(isAmpTagName(targetId) || target.tagName.toLowerCase() in NON_AMP_ELEMENTS_ACTIONS_, 'AMP or special element expected: %s', target.tagName + '#' + targetId);

      if (target[ACTION_HANDLER_]) {
        dev().error(TAG_, "Action handler already installed for " + target);
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
     */

  }, {
    key: "hasAction",
    value: function hasAction(element, actionEventType, opt_stopAt) {
      return !!this.findAction_(element, actionEventType, opt_stopAt);
    }
    /**
     * Checks if the given element's registered action resolves to at least one
     * existing element by id or a global target (e.g. "AMP").
     * @param {!Element} element
     * @param {string} actionEventType
     * @param {!Element=} opt_stopAt
     * @return {boolean}
     */

  }, {
    key: "hasResolvableAction",
    value: function hasResolvableAction(element, actionEventType, opt_stopAt) {
      var _this2 = this;

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
     */

  }, {
    key: "hasResolvableActionForTarget",
    value: function hasResolvableActionForTarget(element, actionEventType, targetElement, opt_stopAt) {
      var _this3 = this;

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
     */

  }, {
    key: "getActionNode_",
    value: function getActionNode_(target) {
      return this.globalTargets_[target] ? this.root_ : this.root_.getElementById(target);
    }
    /**
     * Sets the action allowlist. Can be used to clear it.
     * @param {!Array<{tagOrTarget: string, method: string}>} allowlist
     */

  }, {
    key: "setAllowlist",
    value: function setAllowlist(allowlist) {
      devAssert(allowlist.every(function (v) {
        return v.tagOrTarget && v.method;
      }), 'Action allowlist entries should be of shape { tagOrTarget: string, method: string }');
      this.allowlist_ = allowlist;
    }
    /**
     * Adds an action to the allowlist.
     * @param {string} tagOrTarget The tag or target to allowlist, e.g.
     *     'AMP-LIST', '*'.
     * @param {string|Array<string>} methods The method(s) to allowlist, e.g. 'show', 'hide'.
     * @param {Array<string>=} opt_forFormat
     */

  }, {
    key: "addToAllowlist",
    value: function addToAllowlist(tagOrTarget, methods, opt_forFormat) {
      var _this4 = this;

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
        if (_this4.allowlist_.some(function (v) {
          return v.tagOrTarget == tagOrTarget && v.method == method;
        })) {
          return;
        }

        _this4.allowlist_.push({
          tagOrTarget: tagOrTarget,
          method: method
        });
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
     */

  }, {
    key: "action_",
    value: function action_(source, actionEventType, event, trust, opt_args) {
      var _this5 = this;

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
        var args = actionInfo.args,
            method = actionInfo.method,
            str = actionInfo.str,
            target = actionInfo.target;
        var dereferencedArgs = dereferenceArgsVariables(args, event, opt_args);

        var invokeAction = function invokeAction() {
          var node = _this5.getActionNode_(target);

          if (!node) {
            _this5.error_("Target \"" + target + "\" not found for action [" + str + "].");

            return;
          }

          var invocation = new ActionInvocation(node, method, dereferencedArgs, source, action.node, event, trust, actionEventType, node.tagName || target, sequenceId);
          return _this5.invoke_(invocation);
        };

        // Wait for the previous action, if any.
        currentPromise = currentPromise ? currentPromise.then(invokeAction) : invokeAction();
      });
      return action.actionInfos.length >= 1;
    }
    /**
     * @param {string} message
     * @param {?Element=} opt_element
     * @private
     */

  }, {
    key: "error_",
    value: function error_(message, opt_element) {
      if (opt_element) {
        // reportError() supports displaying the element in dev console.
        var e = user().createError("[" + TAG_ + "] " + message);
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

  }, {
    key: "invoke_",
    value: function invoke_(invocation) {
      var method = invocation.method,
          tagOrTarget = invocation.tagOrTarget;

      // Check that this action is allowlisted (if a allowlist is set).
      if (this.allowlist_) {
        if (!isActionAllowlisted(invocation, this.allowlist_)) {
          this.error_("\"" + tagOrTarget + "." + method + "\" is not allowlisted " + JSON.stringify(this.allowlist_) + ".");
          return null;
        }
      }

      // Handle global targets e.g. "AMP".
      var globalTarget = this.globalTargets_[tagOrTarget];

      if (globalTarget) {
        return globalTarget(invocation);
      }

      // Subsequent handlers assume that invocation target is an Element.
      var node = dev().assertElement(invocation.node);
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
          this.error_("Unrecognized AMP element \"" + lowerTagName + "\".", node);
        }

        return null;
      }

      // Special non-AMP elements with AMP ID or known supported actions.
      var nonAmpActions = NON_AMP_ELEMENTS_ACTIONS_[lowerTagName];
      // TODO(dvoytenko, #7063): switch back to `target.id` with form proxy.
      var targetId = node.getAttribute('id') || '';

      if (isAmpTagName(targetId) || nonAmpActions && nonAmpActions.indexOf(method) > -1) {
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
      this.error_("Target (" + tagOrTarget + ") doesn't support \"" + method + "\" action.", invocation.caller);
      return null;
    }
    /**
     * @param {!Element} target
     * @param {string} actionEventType
     * @param {!Element=} opt_stopAt
     * @return {?{node: !Element, actionInfos: !Array<!ActionInfoDef>}}
     */

  }, {
    key: "findAction_",
    value: function findAction_(target, actionEventType, opt_stopAt) {
      // Go from target up the DOM tree and find the applicable action.
      var n = target;

      while (n) {
        if (opt_stopAt && n == opt_stopAt) {
          return null;
        }

        var actionInfos = this.matchActionInfos_(n, actionEventType);

        if (actionInfos && isEnabled(n)) {
          return {
            node: n,
            actionInfos: devAssert(actionInfos)
          };
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

  }, {
    key: "matchActionInfos_",
    value: function matchActionInfos_(node, actionEventType) {
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
     */

  }, {
    key: "getActionMap_",
    value: function getActionMap_(node, actionEventType) {
      var actionMap = node[ACTION_MAP_];

      if (actionMap === undefined) {
        actionMap = null;

        if (node.hasAttribute('on')) {
          var action = node.getAttribute('on');
          actionMap = parseActionMap(action, node);
          node[ACTION_MAP_] = actionMap;
        } else if (node.hasAttribute('execute')) {
          var _action = node.getAttribute('execute');

          actionMap = parseActionMap(actionEventType + ":" + _action, node);
          node[ACTION_MAP_] = actionMap;
        }
      }

      return actionMap;
    }
    /**
     * Resets a node's actions with those defined in the given actions string.
     * @param {!Element} node
     * @param {string} actionsStr
     */

  }, {
    key: "setActions",
    value: function setActions(node, actionsStr) {
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
     */

  }, {
    key: "addTargetPropertiesAsDetail_",
    value: function addTargetPropertiesAsDetail_(event) {
      var detail =
      /** @type {!JsonObject} */
      map();
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
        detail['files'] = toArray(target.files).map(function (file) {
          return {
            'name': file.name,
            'size': file.size,
            'type': file.type
          };
        });
      }

      if (Object.keys(detail).length > 0) {
        try {
          event.detail = detail;
        } catch (_unused) {}
      }
    }
  }]);

  return ActionService;
}();

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
  var node = invocation.node,
      tagOrTarget = invocation.tagOrTarget;

  // Use alias if default action is invoked.
  if (method === DEFAULT_ACTION && typeof node.getDefaultActionAlias == 'function') {
    method = node.getDefaultActionAlias();
  }

  var lcMethod = method.toLowerCase();
  var lcTagOrTarget = tagOrTarget.toLowerCase();
  return allowlist.some(function (w) {
    if (w.tagOrTarget.toLowerCase() === lcTagOrTarget || w.tagOrTarget === '*') {
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
function DeferredEvent(event) {
  _classCallCheck(this, DeferredEvent);

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
  devAssert(null, 'Deferred events cannot access native event functions.');
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

    if (tok.type == TokenType.EOF || tok.type == TokenType.SEPARATOR && tok.value == ';') {// Expected, ignore.
    } else if (tok.type == TokenType.LITERAL || tok.type == TokenType.ID) {
      // Format: event:target.method
      // Event: "event:"
      var event = tok.value;
      // Target: ":target." separator
      assertToken(toks.next(), [TokenType.SEPARATOR], ':');
      var actions = [];

      // Handlers for event.
      do {
        var target = assertToken(toks.next(), [TokenType.LITERAL, TokenType.ID]).value;
        // Method: ".method". Method is optional.
        var method = DEFAULT_ACTION;
        var args = null;
        peek = toks.peek();

        if (peek.type == TokenType.SEPARATOR && peek.value == '.') {
          toks.next();
          // Skip '.'
          method = assertToken(toks.next(), [TokenType.LITERAL, TokenType.ID]).value || method;
          // Optionally, there may be arguments: "(key = value, key = value)".
          peek = toks.peek();

          if (peek.type == TokenType.SEPARATOR && peek.value == '(') {
            toks.next();
            // Skip '('
            args = tokenizeMethodArguments(toks, assertToken, assertAction);
          }
        }

        actions.push({
          event: event,
          target: target,
          method: method,
          args: args && getMode().test && Object.freeze ? Object.freeze(args) : args,
          str: action
        });
        peek = toks.peek();
      } while (peek.type == TokenType.SEPARATOR && peek.value == ',' && toks.next());

      // skip "," when found
      if (!actionMap) {
        actionMap = map();
      }

      actionMap[event] = actions;
    } else {
      // Unexpected token.
      assertAction(false, "; unexpected token [" + (tok.value || '') + "]");
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

    var _toks$next = toks.next(),
        value = _toks$next.value;

    args[RAW_OBJECT_ARGS_KEY] = value;
    assertToken(toks.next(), [TokenType.SEPARATOR], ')');
  } else {
    // Key-value pairs. Format: key = value, ....
    do {
      tok = toks.next();
      var _tok = tok,
          type = _tok.type,
          _value = _tok.value;

      if (type == TokenType.SEPARATOR && (_value == ',' || _value == ')')) {// Expected: ignore.
      } else if (type == TokenType.LITERAL || type == TokenType.ID) {
        // Key: "key = "
        assertToken(toks.next(), [TokenType.SEPARATOR], '=');
        // Value is either a literal or an expression: "foo.bar.baz"
        tok = assertToken(toks.next(
        /* convertValue */
        true), [TokenType.LITERAL, TokenType.ID]);
        var argValueTokens = [tok];

        // Expressions have one or more dereferences: ".identifier"
        if (tok.type == TokenType.ID) {
          for (peek = toks.peek(); peek.type == TokenType.SEPARATOR && peek.value == '.'; peek = toks.peek()) {
            toks.next();
            // Skip '.'.
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
        assertAction(peek.type == TokenType.SEPARATOR && (peek.value == ',' || peek.value == ')'), 'Expected either [,] or [)]');
      } else {
        // Unexpected token.
        assertAction(false, "; unexpected token [" + (tok.value || '') + "]");
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
    return (
      /** @type {(boolean|number|string)} */
      tokens[0].value
    );
  } else {
    var values = tokens.map(function (token) {
      return token.value;
    });
    var expression = values.join('.');
    return (
      /** @type {ActionInfoArgExpressionDef} */
      {
        expression: expression
      }
    );
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
    var detail = getDetail(
    /** @type {!Event} */
    event);

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
    if (typeof value == 'object' && value.expression) {
      var expr =
      /** @type {ActionInfoArgExpressionDef} */
      value.expression;
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
  return userAssert(condition, 'Invalid action definition in %s: [%s] %s', context, s, opt_message || '');
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
    assertActionForParser(s, context, types.includes(tok.type) && tok.value == opt_value, "; expected [" + opt_value + "]");
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
  OBJECT: 5
};

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

/** @private */
var ParserTokenizer = /*#__PURE__*/function () {
  /**
   * @param {string} str
   */
  function ParserTokenizer(str) {
    _classCallCheck(this, ParserTokenizer);

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
  _createClass(ParserTokenizer, [{
    key: "next",
    value: function next(opt_convertValues) {
      var tok = this.next_(opt_convertValues || false);
      this.index_ = tok.index;
      return tok;
    }
    /**
     * Returns the next token but keeps the current position.
     * @param {boolean=} opt_convertValues
     * @return {!TokenDef}
     */

  }, {
    key: "peek",
    value: function peek(opt_convertValues) {
      return this.next_(opt_convertValues || false);
    }
    /**
     * @param {boolean} convertValues
     * @return {!{type: TokenType, value: *, index: number}}
     */

  }, {
    key: "next_",
    value: function next_(convertValues) {
      var newIndex = this.index_ + 1;

      if (newIndex >= this.str_.length) {
        return {
          type: TokenType.EOF,
          index: this.index_
        };
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
          return {
            type: TokenType.EOF,
            index: newIndex
          };
        }

        c = this.str_.charAt(newIndex);
      }

      // A numeric. Notice that it steals the `.` from separators.
      if (convertValues && (isNum(c) || c == '.' && newIndex + 1 < this.str_.length && isNum(this.str_[newIndex + 1]))) {
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
        return {
          type: TokenType.LITERAL,
          value: value,
          index: newIndex
        };
      }

      // Different separators.
      if (SEPARATOR_SET.indexOf(c) != -1) {
        return {
          type: TokenType.SEPARATOR,
          value: c,
          index: newIndex
        };
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
          return {
            type: TokenType.INVALID,
            index: newIndex
          };
        }

        var _value2 = this.str_.substring(newIndex + 1, _end2);

        newIndex = _end2;
        return {
          type: TokenType.LITERAL,
          value: _value2,
          index: newIndex
        };
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
          return {
            type: TokenType.INVALID,
            index: newIndex
          };
        }

        var _value3 = this.str_.substring(newIndex, _end3 + 1);

        newIndex = _end3;
        return {
          type: TokenType.OBJECT,
          value: _value3,
          index: newIndex
        };
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

        return {
          type: TokenType.LITERAL,
          value: _value4,
          index: newIndex
        };
      }

      // Identifier.
      if (!isNum(s.charAt(0))) {
        return {
          type: TokenType.ID,
          value: s,
          index: newIndex
        };
      }

      // Key.
      return {
        type: TokenType.LITERAL,
        value: s,
        index: newIndex
      };
    }
  }]);

  return ParserTokenizer;
}();

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
  registerServiceBuilderForDoc(ampdoc, 'action', ActionService,
  /* opt_instantiate */
  true);
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImFjdGlvbi1pbXBsLmpzIl0sIm5hbWVzIjpbIkFjdGlvblRydXN0IiwiREVGQVVMVF9BQ1RJT04iLCJSQVdfT0JKRUNUX0FSR1NfS0VZIiwiYWN0aW9uVHJ1c3RUb1N0cmluZyIsIktleXMiLCJpc0VuYWJsZWQiLCJpc0Zpbml0ZU51bWJlciIsImlzQXJyYXkiLCJ0b0FycmF5IiwiZGVib3VuY2UiLCJ0aHJvdHRsZSIsImRpY3QiLCJnZXRWYWx1ZUZvckV4cHIiLCJoYXNPd24iLCJtYXAiLCJ0b1dpbiIsIlNlcnZpY2VzIiwicmVwb3J0RXJyb3IiLCJnZXREZXRhaWwiLCJpc0FtcDRFbWFpbCIsImRldiIsImRldkFzc2VydCIsInVzZXIiLCJ1c2VyQXNzZXJ0IiwiZ2V0TW9kZSIsInJlZ2lzdGVyU2VydmljZUJ1aWxkZXJGb3JEb2MiLCJUQUdfIiwiQUNUSU9OX01BUF8iLCJNYXRoIiwicmFuZG9tIiwiQUNUSU9OX1FVRVVFXyIsIkFDVElPTl9IQU5ETEVSXyIsIkRFRkFVTFRfREVCT1VOQ0VfV0FJVCIsIkRFRkFVTFRfVEhST1RUTEVfSU5URVJWQUwiLCJOT05fQU1QX0VMRU1FTlRTX0FDVElPTlNfIiwiREVGQVVMVF9FTUFJTF9BTExPV0xJU1QiLCJ0YWdPclRhcmdldCIsIm1ldGhvZCIsIlRBUFBBQkxFX0FSSUFfUk9MRVMiLCJBY3Rpb25JbmZvQXJnRXhwcmVzc2lvbkRlZiIsIkFjdGlvbkluZm9BcmdWYWx1ZURlZiIsIkFjdGlvbkluZm9BcmdzRGVmIiwiQWN0aW9uSW5mb0RlZiIsIkFjdGlvbkhhbmRsZXJEZWYiLCJBY3Rpb25FdmVudERlZiIsIkFjdGlvbkludm9jYXRpb24iLCJub2RlIiwiYXJncyIsInNvdXJjZSIsImNhbGxlciIsImV2ZW50IiwidHJ1c3QiLCJhY3Rpb25FdmVudFR5cGUiLCJzZXF1ZW5jZUlkIiwidGFnTmFtZSIsIm1pbmltdW1UcnVzdCIsImVycm9yIiwidCIsInRvTG93ZXJDYXNlIiwiQWN0aW9uU2VydmljZSIsImFtcGRvYyIsIm9wdF9yb290Iiwicm9vdF8iLCJnZXRSb290Tm9kZSIsImlzRW1haWxfIiwiaXNTaW5nbGVEb2MiLCJhbGxvd2xpc3RfIiwiZ2xvYmFsVGFyZ2V0c18iLCJnbG9iYWxNZXRob2RIYW5kbGVyc18iLCJhZGRFdmVudCIsIm5hbWUiLCJhZGRFdmVudExpc3RlbmVyIiwiZGVmYXVsdFByZXZlbnRlZCIsImVsZW1lbnQiLCJhc3NlcnRFbGVtZW50IiwidGFyZ2V0IiwidHJpZ2dlciIsIkhJR0giLCJrZXkiLCJFTlRFUiIsIlNQQUNFIiwicm9sZSIsImdldEF0dHJpYnV0ZSIsImlzVGFwRXZlbnRSb2xlIiwiaGFzQWN0aW9uIiwicHJldmVudERlZmF1bHQiLCJhZGRUYXJnZXRQcm9wZXJ0aWVzQXNEZXRhaWxfIiwiZGVib3VuY2VkSW5wdXQiLCJ3aW4iLCJkZWZlcnJlZEV2ZW50IiwiRGVmZXJyZWRFdmVudCIsInRocm90dGxlZElucHV0IiwiaGFuZGxlciIsIm1pblRydXN0IiwiREVGQVVMVCIsImV2ZW50VHlwZSIsIm9wdF9hcmdzIiwiYWN0aW9uXyIsImludm9jYXRpb24iLCJpbnZva2VfIiwidGFyZ2V0SWQiLCJpc0FtcFRhZ05hbWUiLCJxdWV1ZWRJbnZvY2F0aW9ucyIsInRpbWVyRm9yIiwib3duZXJEb2N1bWVudCIsImRlZmF1bHRWaWV3IiwiZGVsYXkiLCJmb3JFYWNoIiwiZSIsImxlbmd0aCIsIm9wdF9zdG9wQXQiLCJmaW5kQWN0aW9uXyIsImFjdGlvbiIsImFjdGlvbkluZm9zIiwic29tZSIsImdldEFjdGlvbk5vZGVfIiwidGFyZ2V0RWxlbWVudCIsImFjdGlvbkluZm8iLCJnZXRFbGVtZW50QnlJZCIsImFsbG93bGlzdCIsImV2ZXJ5IiwidiIsIm1ldGhvZHMiLCJvcHRfZm9yRm9ybWF0IiwiaW5jbHVkZXMiLCJwdXNoIiwiY3VycmVudFByb21pc2UiLCJzdHIiLCJkZXJlZmVyZW5jZWRBcmdzIiwiZGVyZWZlcmVuY2VBcmdzVmFyaWFibGVzIiwiaW52b2tlQWN0aW9uIiwiZXJyb3JfIiwidGhlbiIsIm1lc3NhZ2UiLCJvcHRfZWxlbWVudCIsImNyZWF0ZUVycm9yIiwiaXNBY3Rpb25BbGxvd2xpc3RlZCIsIkpTT04iLCJzdHJpbmdpZnkiLCJnbG9iYWxUYXJnZXQiLCJnbG9iYWxNZXRob2QiLCJzYXRpc2ZpZXNUcnVzdCIsImxvd2VyVGFnTmFtZSIsImVucXVlQWN0aW9uIiwibm9uQW1wQWN0aW9ucyIsImluZGV4T2YiLCJuIiwibWF0Y2hBY3Rpb25JbmZvc18iLCJwYXJlbnRFbGVtZW50IiwiYWN0aW9uTWFwIiwiZ2V0QWN0aW9uTWFwXyIsInVuZGVmaW5lZCIsImhhc0F0dHJpYnV0ZSIsInBhcnNlQWN0aW9uTWFwIiwiYWN0aW9uc1N0ciIsInNldEF0dHJpYnV0ZSIsImRldGFpbCIsInZhbHVlIiwiTnVtYmVyIiwiY2hlY2tlZCIsIm1pbiIsIm1heCIsImZpbGVzIiwiZmlsZSIsInNpemUiLCJ0eXBlIiwiT2JqZWN0Iiwia2V5cyIsImxvd2VyY2FzZVRhZ05hbWUiLCJzdWJzdHJpbmciLCJnZXREZWZhdWx0QWN0aW9uQWxpYXMiLCJsY01ldGhvZCIsImxjVGFnT3JUYXJnZXQiLCJ3IiwiY2xvbmVXaXRob3V0RnVuY3Rpb25zIiwib3JpZ2luYWwiLCJvcHRfZGVzdCIsImNsb25lIiwicHJvcCIsIm5vdEltcGxlbWVudGVkIiwiY29udGV4dCIsImFzc2VydEFjdGlvbiIsImFzc2VydEFjdGlvbkZvclBhcnNlciIsImJpbmQiLCJhc3NlcnRUb2tlbiIsImFzc2VydFRva2VuRm9yUGFyc2VyIiwidG9rcyIsIlBhcnNlclRva2VuaXplciIsInRvayIsInBlZWsiLCJuZXh0IiwiVG9rZW5UeXBlIiwiRU9GIiwiU0VQQVJBVE9SIiwiTElURVJBTCIsIklEIiwiYWN0aW9ucyIsInRva2VuaXplTWV0aG9kQXJndW1lbnRzIiwidGVzdCIsImZyZWV6ZSIsIk9CSkVDVCIsImFyZ1ZhbHVlVG9rZW5zIiwiYXJnVmFsdWUiLCJhcmdWYWx1ZUZvclRva2VucyIsInRva2VucyIsInZhbHVlcyIsInRva2VuIiwiZXhwcmVzc2lvbiIsImpvaW4iLCJkYXRhIiwiYXBwbGllZCIsImV4cHIiLCJleHByVmFsdWUiLCJzIiwiY29uZGl0aW9uIiwib3B0X21lc3NhZ2UiLCJ0eXBlcyIsIm9wdF92YWx1ZSIsIklOVkFMSUQiLCJUb2tlbkRlZiIsIldISVRFU1BBQ0VfU0VUIiwiU0VQQVJBVE9SX1NFVCIsIlNUUklOR19TRVQiLCJPQkpFQ1RfU0VUIiwiU1BFQ0lBTF9TRVQiLCJzdHJfIiwiaW5kZXhfIiwib3B0X2NvbnZlcnRWYWx1ZXMiLCJuZXh0XyIsImluZGV4IiwiY29udmVydFZhbHVlcyIsIm5ld0luZGV4IiwiYyIsImNoYXJBdCIsImlzTnVtIiwiaGFzRnJhY3Rpb24iLCJlbmQiLCJjMiIsInBhcnNlRmxvYXQiLCJwYXJzZUludCIsImkiLCJudW1iZXJPZkJyYWNlcyIsImNoYXIiLCJpbnN0YWxsQWN0aW9uU2VydmljZUZvckRvYyJdLCJtYXBwaW5ncyI6Ijs7Ozs7O0FBQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBRUEsU0FDRUEsV0FERixFQUVFQyxjQUZGLEVBR0VDLG1CQUhGLEVBSUVDLG1CQUpGO0FBTUEsU0FBUUMsSUFBUjtBQUNBLFNBQVFDLFNBQVI7QUFDQSxTQUFRQyxjQUFSO0FBQ0EsU0FBUUMsT0FBUixFQUFpQkMsT0FBakI7QUFDQSxTQUFRQyxRQUFSLEVBQWtCQyxRQUFsQjtBQUNBLFNBQVFDLElBQVIsRUFBY0MsZUFBZCxFQUErQkMsTUFBL0IsRUFBdUNDLEdBQXZDO0FBQ0EsU0FBUUMsS0FBUjtBQUVBLFNBQVFDLFFBQVI7QUFFQSxTQUFRQyxXQUFSO0FBQ0EsU0FBUUMsU0FBUjtBQUNBLFNBQVFDLFdBQVI7QUFDQSxTQUFRQyxHQUFSLEVBQWFDLFNBQWIsRUFBd0JDLElBQXhCLEVBQThCQyxVQUE5QjtBQUNBLFNBQVFDLE9BQVI7QUFDQSxTQUFRQyw0QkFBUjs7QUFFQTtBQUNBLElBQU1DLElB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MEI7QUFJMUI7QUFBc0IsTUFKSSxDQUE1QjtBQU1EIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBDb3B5cmlnaHQgMjAxNSBUaGUgQU1QIEhUTUwgQXV0aG9ycy4gQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBMaWNlbnNlZCB1bmRlciB0aGUgQXBhY2hlIExpY2Vuc2UsIFZlcnNpb24gMi4wICh0aGUgXCJMaWNlbnNlXCIpO1xuICogeW91IG1heSBub3QgdXNlIHRoaXMgZmlsZSBleGNlcHQgaW4gY29tcGxpYW5jZSB3aXRoIHRoZSBMaWNlbnNlLlxuICogWW91IG1heSBvYnRhaW4gYSBjb3B5IG9mIHRoZSBMaWNlbnNlIGF0XG4gKlxuICogICAgICBodHRwOi8vd3d3LmFwYWNoZS5vcmcvbGljZW5zZXMvTElDRU5TRS0yLjBcbiAqXG4gKiBVbmxlc3MgcmVxdWlyZWQgYnkgYXBwbGljYWJsZSBsYXcgb3IgYWdyZWVkIHRvIGluIHdyaXRpbmcsIHNvZnR3YXJlXG4gKiBkaXN0cmlidXRlZCB1bmRlciB0aGUgTGljZW5zZSBpcyBkaXN0cmlidXRlZCBvbiBhbiBcIkFTLUlTXCIgQkFTSVMsXG4gKiBXSVRIT1VUIFdBUlJBTlRJRVMgT1IgQ09ORElUSU9OUyBPRiBBTlkgS0lORCwgZWl0aGVyIGV4cHJlc3Mgb3IgaW1wbGllZC5cbiAqIFNlZSB0aGUgTGljZW5zZSBmb3IgdGhlIHNwZWNpZmljIGxhbmd1YWdlIGdvdmVybmluZyBwZXJtaXNzaW9ucyBhbmRcbiAqIGxpbWl0YXRpb25zIHVuZGVyIHRoZSBMaWNlbnNlLlxuICovXG5cbmltcG9ydCB7XG4gIEFjdGlvblRydXN0LFxuICBERUZBVUxUX0FDVElPTixcbiAgUkFXX09CSkVDVF9BUkdTX0tFWSxcbiAgYWN0aW9uVHJ1c3RUb1N0cmluZyxcbn0gZnJvbSAnI2NvcmUvY29uc3RhbnRzL2FjdGlvbi1jb25zdGFudHMnO1xuaW1wb3J0IHtLZXlzfSBmcm9tICcjY29yZS9jb25zdGFudHMva2V5LWNvZGVzJztcbmltcG9ydCB7aXNFbmFibGVkfSBmcm9tICcjY29yZS9kb20nO1xuaW1wb3J0IHtpc0Zpbml0ZU51bWJlcn0gZnJvbSAnI2NvcmUvdHlwZXMnO1xuaW1wb3J0IHtpc0FycmF5LCB0b0FycmF5fSBmcm9tICcjY29yZS90eXBlcy9hcnJheSc7XG5pbXBvcnQge2RlYm91bmNlLCB0aHJvdHRsZX0gZnJvbSAnI2NvcmUvdHlwZXMvZnVuY3Rpb24nO1xuaW1wb3J0IHtkaWN0LCBnZXRWYWx1ZUZvckV4cHIsIGhhc093biwgbWFwfSBmcm9tICcjY29yZS90eXBlcy9vYmplY3QnO1xuaW1wb3J0IHt0b1dpbn0gZnJvbSAnI2NvcmUvd2luZG93JztcblxuaW1wb3J0IHtTZXJ2aWNlc30gZnJvbSAnI3NlcnZpY2UnO1xuXG5pbXBvcnQge3JlcG9ydEVycm9yfSBmcm9tICcuLi9lcnJvci1yZXBvcnRpbmcnO1xuaW1wb3J0IHtnZXREZXRhaWx9IGZyb20gJy4uL2V2ZW50LWhlbHBlcic7XG5pbXBvcnQge2lzQW1wNEVtYWlsfSBmcm9tICcuLi9mb3JtYXQnO1xuaW1wb3J0IHtkZXYsIGRldkFzc2VydCwgdXNlciwgdXNlckFzc2VydH0gZnJvbSAnLi4vbG9nJztcbmltcG9ydCB7Z2V0TW9kZX0gZnJvbSAnLi4vbW9kZSc7XG5pbXBvcnQge3JlZ2lzdGVyU2VydmljZUJ1aWxkZXJGb3JEb2N9IGZyb20gJy4uL3NlcnZpY2UtaGVscGVycyc7XG5cbi8qKiBAY29uc3Qge3N0cmluZ30gKi9cbmNvbnN0IFRBR18gPSAnQWN0aW9uJztcblxuLyoqIEBjb25zdCB7c3RyaW5nfSAqL1xuY29uc3QgQUNUSU9OX01BUF8gPSAnX19BTVBfQUNUSU9OX01BUF9fJyArIE1hdGgucmFuZG9tKCk7XG5cbi8qKiBAY29uc3Qge3N0cmluZ30gKi9cbmNvbnN0IEFDVElPTl9RVUVVRV8gPSAnX19BTVBfQUNUSU9OX1FVRVVFX18nO1xuXG4vKiogQGNvbnN0IHtzdHJpbmd9ICovXG5jb25zdCBBQ1RJT05fSEFORExFUl8gPSAnX19BTVBfQUNUSU9OX0hBTkRMRVJfXyc7XG5cbi8qKiBAY29uc3Qge251bWJlcn0gKi9cbmNvbnN0IERFRkFVTFRfREVCT1VOQ0VfV0FJVCA9IDMwMDsgLy8gbXNcblxuLyoqIEBjb25zdCB7bnVtYmVyfSAqL1xuY29uc3QgREVGQVVMVF9USFJPVFRMRV9JTlRFUlZBTCA9IDEwMDsgLy8gbXNcblxuLyoqIEBjb25zdCB7IU9iamVjdDxzdHJpbmcsIUFycmF5PHN0cmluZz4+fSAqL1xuY29uc3QgTk9OX0FNUF9FTEVNRU5UU19BQ1RJT05TXyA9IHtcbiAgJ2Zvcm0nOiBbJ3N1Ym1pdCcsICdjbGVhciddLFxufTtcblxuY29uc3QgREVGQVVMVF9FTUFJTF9BTExPV0xJU1QgPSBbXG4gIHt0YWdPclRhcmdldDogJ0FNUCcsIG1ldGhvZDogJ3NldFN0YXRlJ30sXG4gIHt0YWdPclRhcmdldDogJyonLCBtZXRob2Q6ICdmb2N1cyd9LFxuICB7dGFnT3JUYXJnZXQ6ICcqJywgbWV0aG9kOiAnaGlkZSd9LFxuICB7dGFnT3JUYXJnZXQ6ICcqJywgbWV0aG9kOiAnc2hvdyd9LFxuICB7dGFnT3JUYXJnZXQ6ICcqJywgbWV0aG9kOiAndG9nZ2xlQ2xhc3MnfSxcbiAge3RhZ09yVGFyZ2V0OiAnKicsIG1ldGhvZDogJ3RvZ2dsZVZpc2liaWxpdHknfSxcbl07XG5cbi8qKlxuICogSW50ZXJhY3RhYmxlIHdpZGdldHMgd2hpY2ggc2hvdWxkIHRyaWdnZXIgdGFwIGV2ZW50cyB3aGVuIHRoZSB1c2VyIGNsaWNrc1xuICogb3IgYWN0aXZhdGVzIHZpYSB0aGUga2V5Ym9hcmQuIE5vdCBhbGwgYXJlIGhlcmUsIGUuZy4gcHJvZ3Jlc3NiYXIsIHRhYnBhbmVsLFxuICogc2luY2UgdGhleSBhcmUgdGV4dCBpbnB1dHMsIHJlYWRvbmx5LCBvciBjb21wb3NpdGUgd2lkZ2V0cyB0aGF0IHNob3VsZG4ndFxuICogbmVlZCB0byB0cmlnZ2VyIHRhcCBldmVudHMgZnJvbSBzcGFjZWJhciBvciBlbnRlciBvbiB0aGVpciBvd24uXG4gKiBTZWUgaHR0cHM6Ly93d3cudzMub3JnL1RSL3dhaS1hcmlhLTEuMS8jd2lkZ2V0X3JvbGVzXG4gKiBAY29uc3QgeyFPYmplY3Q8Ym9vbGVhbj59XG4gKi9cbmV4cG9ydCBjb25zdCBUQVBQQUJMRV9BUklBX1JPTEVTID0ge1xuICAnYnV0dG9uJzogdHJ1ZSxcbiAgJ2NoZWNrYm94JzogdHJ1ZSxcbiAgJ2xpbmsnOiB0cnVlLFxuICAnbGlzdGJveCc6IHRydWUsXG4gICdtZW51aXRlbSc6IHRydWUsXG4gICdtZW51aXRlbWNoZWNrYm94JzogdHJ1ZSxcbiAgJ21lbnVpdGVtcmFkaW8nOiB0cnVlLFxuICAnb3B0aW9uJzogdHJ1ZSxcbiAgJ3JhZGlvJzogdHJ1ZSxcbiAgJ3Njcm9sbGJhcic6IHRydWUsXG4gICdzbGlkZXInOiB0cnVlLFxuICAnc3BpbmJ1dHRvbic6IHRydWUsXG4gICdzd2l0Y2gnOiB0cnVlLFxuICAndGFiJzogdHJ1ZSxcbiAgJ3RyZWVpdGVtJzogdHJ1ZSxcbn07XG5cbi8qKlxuICogQW4gZXhwcmVzc2lvbiBhcmcgdmFsdWUsIGUuZy4gYGZvby5iYXJgIGluIGBlOnQubShhcmc9Zm9vLmJhcilgLlxuICogQHR5cGVkZWYge3tleHByZXNzaW9uOiBzdHJpbmd9fVxuICovXG5sZXQgQWN0aW9uSW5mb0FyZ0V4cHJlc3Npb25EZWY7XG5cbi8qKlxuICogQW4gYXJnIHZhbHVlLlxuICogQHR5cGVkZWYgeyhib29sZWFufG51bWJlcnxzdHJpbmd8QWN0aW9uSW5mb0FyZ0V4cHJlc3Npb25EZWYpfVxuICovXG5sZXQgQWN0aW9uSW5mb0FyZ1ZhbHVlRGVmO1xuXG4vKipcbiAqIE1hcCBvZiBhcmcgbmFtZXMgdG8gdGhlaXIgdmFsdWVzLCBlLmcuIHthcmc6IDEyM30gaW4gYGU6dC5tKGFyZz0xMjMpYC5cbiAqIEB0eXBlZGVmIHtPYmplY3Q8c3RyaW5nLCBBY3Rpb25JbmZvQXJnVmFsdWVEZWY+fVxuICovXG5sZXQgQWN0aW9uSW5mb0FyZ3NEZWY7XG5cbi8qKlxuICogQHR5cGVkZWYge3tcbiAqICAgZXZlbnQ6IHN0cmluZyxcbiAqICAgdGFyZ2V0OiBzdHJpbmcsXG4gKiAgIG1ldGhvZDogc3RyaW5nLFxuICogICBhcmdzOiA/QWN0aW9uSW5mb0FyZ3NEZWYsXG4gKiAgIHN0cjogc3RyaW5nXG4gKiB9fVxuICovXG5leHBvcnQgbGV0IEFjdGlvbkluZm9EZWY7XG5cbi8qKlxuICogRnVuY3Rpb24gY2FsbGVkIHdoZW4gYW4gYWN0aW9uIGlzIGludm9rZWQuXG4gKlxuICogT3B0aW9uYWxseSwgdGFrZXMgdGhpcyBhY3Rpb24ncyBwb3NpdGlvbiB3aXRoaW4gYWxsIGFjdGlvbnMgdHJpZ2dlcmVkIGJ5XG4gKiB0aGUgc2FtZSBldmVudCwgYXMgd2VsbCBhcyBzYWlkIGFjdGlvbiBhcnJheSwgYXMgcGFyYW1zLlxuICpcbiAqIElmIHRoZSBhY3Rpb24gaXMgY2hhaW5hYmxlLCByZXR1cm5zIGEgUHJvbWlzZSB3aGljaCByZXNvbHZlcyB3aGVuIHRoZVxuICogYWN0aW9uIGlzIGNvbXBsZXRlLiBPdGhlcndpc2UsIHJldHVybnMgbnVsbC5cbiAqXG4gKiBAdHlwZWRlZiB7ZnVuY3Rpb24oIUFjdGlvbkludm9jYXRpb24sIG51bWJlcj0sICFBcnJheTwhQWN0aW9uSW5mb0RlZj49KTo/UHJvbWlzZX1cbiAqL1xubGV0IEFjdGlvbkhhbmRsZXJEZWY7XG5cbi8qKlxuICogQHR5cGVkZWYge0V2ZW50fERlZmVycmVkRXZlbnR9XG4gKi9cbmV4cG9ydCBsZXQgQWN0aW9uRXZlbnREZWY7XG5cbi8qKlxuICogVGhlIHN0cnVjdHVyZSB0aGF0IGNvbnRhaW5zIGFsbCBkZXRhaWxzIG9mIHRoZSBhY3Rpb24gbWV0aG9kIGludm9jYXRpb24uXG4gKiBAc3RydWN0IEBjb25zdCBAcGFja2FnZSBGb3IgdHlwZS5cbiAqL1xuZXhwb3J0IGNsYXNzIEFjdGlvbkludm9jYXRpb24ge1xuICAvKipcbiAgICogRm9yIGV4YW1wbGU6XG4gICAqXG4gICAqICAgPGRpdiBpZD1cImRpdlwiIG9uPVwidGFwOm15Rm9ybS5zdWJtaXQoZm9vPWJhcilcIj5cbiAgICogICAgIDxidXR0b24gaWQ9XCJidG5cIj5TdWJtaXQ8L2J1dHRvbj5cbiAgICogICA8L2Rpdj5cbiAgICpcbiAgICogYG5vZGVgIGlzICNteUZvcm0uXG4gICAqIGBtZXRob2RgIGlzIFwic3VibWl0XCIuXG4gICAqIGBhcmdzYCBpcyB7J2Zvbyc6ICdiYXInfS5cbiAgICogYHNvdXJjZWAgaXMgI2J0bi5cbiAgICogYGNhbGxlcmAgaXMgI2Rpdi5cbiAgICogYGV2ZW50YCBpcyBhIFwiY2xpY2tcIiBFdmVudCBvYmplY3QuXG4gICAqIGBhY3Rpb25FdmVudFR5cGVgIGlzIFwidGFwXCIuXG4gICAqIGB0cnVzdGAgZGVwZW5kcyBvbiB3aGV0aGVyIHRoaXMgYWN0aW9uIHdhcyBhIHJlc3VsdCBvZiBhIHVzZXIgZ2VzdHVyZS5cbiAgICogYHRhZ09yVGFyZ2V0YCBpcyBcImFtcC1mb3JtXCIuXG4gICAqIGBzZXF1ZW5jZUlkYCBpcyBhIHBzZXVkby1VVUlELlxuICAgKlxuICAgKiBAcGFyYW0geyFOb2RlfSBub2RlIEVsZW1lbnQgd2hvc2UgYWN0aW9uIGlzIGJlaW5nIGludm9rZWQuXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBtZXRob2QgTmFtZSBvZiB0aGUgYWN0aW9uIGJlaW5nIGludm9rZWQuXG4gICAqIEBwYXJhbSB7P0pzb25PYmplY3R9IGFyZ3MgTmFtZWQgYWN0aW9uIGFyZ3VtZW50cy5cbiAgICogQHBhcmFtIHs/RWxlbWVudH0gc291cmNlIEVsZW1lbnQgdGhhdCBnZW5lcmF0ZWQgdGhlIGBldmVudGAuXG4gICAqIEBwYXJhbSB7P0VsZW1lbnR9IGNhbGxlciBFbGVtZW50IGNvbnRhaW5pbmcgdGhlIG9uPVwiLi4uXCIgYWN0aW9uIGhhbmRsZXIuXG4gICAqIEBwYXJhbSB7P0FjdGlvbkV2ZW50RGVmfSBldmVudCBUaGUgZXZlbnQgb2JqZWN0IHRoYXQgdHJpZ2dlcmVkIHRoaXMgYWN0aW9uLlxuICAgKiBAcGFyYW0geyFBY3Rpb25UcnVzdH0gdHJ1c3QgVGhlIHRydXN0IGxldmVsIG9mIHRoaXMgaW52b2NhdGlvbidzIHRyaWdnZXIuXG4gICAqIEBwYXJhbSB7P3N0cmluZ30gYWN0aW9uRXZlbnRUeXBlIFRoZSBBTVAgZXZlbnQgbmFtZSB0aGF0IHRyaWdnZXJlZCB0aGlzLlxuICAgKiBAcGFyYW0gez9zdHJpbmd9IHRhZ09yVGFyZ2V0IFRoZSBnbG9iYWwgdGFyZ2V0IG5hbWUgb3IgdGhlIGVsZW1lbnQgdGFnTmFtZS5cbiAgICogQHBhcmFtIHtudW1iZXJ9IHNlcXVlbmNlSWQgQW4gaWRlbnRpZmllciBmb3IgdGhpcyBhY3Rpb24ncyBzZXF1ZW5jZSAoYWxsXG4gICAqICAgYWN0aW9ucyB0cmlnZ2VyZWQgYnkgb25lIGV2ZW50IGUuZy4gXCJ0YXA6Zm9ybTEuc3VibWl0LCBmb3JtMi5zdWJtaXRcIikuXG4gICAqL1xuICBjb25zdHJ1Y3RvcihcbiAgICBub2RlLFxuICAgIG1ldGhvZCxcbiAgICBhcmdzLFxuICAgIHNvdXJjZSxcbiAgICBjYWxsZXIsXG4gICAgZXZlbnQsXG4gICAgdHJ1c3QsXG4gICAgYWN0aW9uRXZlbnRUeXBlID0gJz8nLFxuICAgIHRhZ09yVGFyZ2V0ID0gbnVsbCxcbiAgICBzZXF1ZW5jZUlkID0gTWF0aC5yYW5kb20oKVxuICApIHtcbiAgICAvKiogQHR5cGUgeyFOb2RlfSAqL1xuICAgIHRoaXMubm9kZSA9IG5vZGU7XG4gICAgLyoqIEBjb25zdCB7c3RyaW5nfSAqL1xuICAgIHRoaXMubWV0aG9kID0gbWV0aG9kO1xuICAgIC8qKiBAY29uc3Qgez9Kc29uT2JqZWN0fSAqL1xuICAgIHRoaXMuYXJncyA9IGFyZ3M7XG4gICAgLyoqIEBjb25zdCB7P0VsZW1lbnR9ICovXG4gICAgdGhpcy5zb3VyY2UgPSBzb3VyY2U7XG4gICAgLyoqIEBjb25zdCB7P0VsZW1lbnR9ICovXG4gICAgdGhpcy5jYWxsZXIgPSBjYWxsZXI7XG4gICAgLyoqIEBjb25zdCB7P0FjdGlvbkV2ZW50RGVmfSAqL1xuICAgIHRoaXMuZXZlbnQgPSBldmVudDtcbiAgICAvKiogQGNvbnN0IHshQWN0aW9uVHJ1c3R9ICovXG4gICAgdGhpcy50cnVzdCA9IHRydXN0O1xuICAgIC8qKiBAY29uc3Qgez9zdHJpbmd9ICovXG4gICAgdGhpcy5hY3Rpb25FdmVudFR5cGUgPSBhY3Rpb25FdmVudFR5cGU7XG4gICAgLyoqIEBjb25zdCB7c3RyaW5nfSAqL1xuICAgIHRoaXMudGFnT3JUYXJnZXQgPSB0YWdPclRhcmdldCB8fCBub2RlLnRhZ05hbWU7XG4gICAgLyoqIEBjb25zdCB7bnVtYmVyfSAqL1xuICAgIHRoaXMuc2VxdWVuY2VJZCA9IHNlcXVlbmNlSWQ7XG4gIH1cblxuICAvKipcbiAgICogUmV0dXJucyB0cnVlIGlmIHRoZSB0cmlnZ2VyIGV2ZW50IGhhcyBhIHRydXN0IGVxdWFsIHRvIG9yIGdyZWF0ZXIgdGhhblxuICAgKiBgbWluaW11bVRydXN0YC4gT3RoZXJ3aXNlLCBsb2dzIGEgdXNlciBlcnJvciBhbmQgcmV0dXJucyBmYWxzZS5cbiAgICogQHBhcmFtIHtBY3Rpb25UcnVzdH0gbWluaW11bVRydXN0XG4gICAqIEByZXR1cm4ge2Jvb2xlYW59XG4gICAqL1xuICBzYXRpc2ZpZXNUcnVzdChtaW5pbXVtVHJ1c3QpIHtcbiAgICAvLyBTYW5pdHkgY2hlY2suXG4gICAgaWYgKCFpc0Zpbml0ZU51bWJlcih0aGlzLnRydXN0KSkge1xuICAgICAgZGV2KCkuZXJyb3IoVEFHXywgYEludmFsaWQgdHJ1c3QgZm9yICcke3RoaXMubWV0aG9kfSc6ICR7dGhpcy50cnVzdH1gKTtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gICAgaWYgKHRoaXMudHJ1c3QgPCBtaW5pbXVtVHJ1c3QpIHtcbiAgICAgIGNvbnN0IHQgPSBhY3Rpb25UcnVzdFRvU3RyaW5nKHRoaXMudHJ1c3QpO1xuICAgICAgdXNlcigpLmVycm9yKFxuICAgICAgICBUQUdfLFxuICAgICAgICBgXCIke3RoaXMuYWN0aW9uRXZlbnRUeXBlfVwiIGV2ZW50IHdpdGggXCIke3R9XCIgdHJ1c3QgaXMgbm90IGFsbG93ZWQgdG8gYCArXG4gICAgICAgICAgYGludm9rZSBcIiR7dGhpcy50YWdPclRhcmdldC50b0xvd2VyQ2FzZSgpfS4ke3RoaXMubWV0aG9kfVwiLmBcbiAgICAgICk7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICAgIHJldHVybiB0cnVlO1xuICB9XG59XG5cbi8qKlxuICogVE9ETyhkdm95dGVua28pOiBjb25zaWRlciBzcGxpdHRpbmcgdGhpcyBjbGFzcyBpbnRvIHR3bzpcbiAqIDEuIEEgY2xhc3MgdGhhdCBoYXMgYSBtZXRob2QgXCJ0cmlnZ2VyKGVsZW1lbnQsIGV2ZW50VHlwZSwgZGF0YSlcIiBhbmRcbiAqICAgIHNpbXBseSBjYW4gc2VhcmNoIHRhcmdldCBpbiBET00gYW5kIHRyaWdnZXIgbWV0aG9kcyBvbiBpdC5cbiAqIDIuIEEgY2xhc3MgdGhhdCBjb25maWd1cmVzIGV2ZW50IHJlY29nbml6ZXJzIGFuZCBydWxlcyBhbmQgdGhlblxuICogICAgc2ltcGx5IGNhbGxzIGFjdGlvbi50cmlnZ2VyLlxuICovXG5leHBvcnQgY2xhc3MgQWN0aW9uU2VydmljZSB7XG4gIC8qKlxuICAgKiBAcGFyYW0geyEuL2FtcGRvYy1pbXBsLkFtcERvY30gYW1wZG9jXG4gICAqIEBwYXJhbSB7KCFEb2N1bWVudHwhU2hhZG93Um9vdCk9fSBvcHRfcm9vdFxuICAgKi9cbiAgY29uc3RydWN0b3IoYW1wZG9jLCBvcHRfcm9vdCkge1xuICAgIC8qKiBAY29uc3QgeyEuL2FtcGRvYy1pbXBsLkFtcERvY30gKi9cbiAgICB0aGlzLmFtcGRvYyA9IGFtcGRvYztcblxuICAgIC8qKiBAY29uc3QgeyFEb2N1bWVudHwhU2hhZG93Um9vdH0gKi9cbiAgICB0aGlzLnJvb3RfID0gb3B0X3Jvb3QgfHwgYW1wZG9jLmdldFJvb3ROb2RlKCk7XG5cbiAgICAvKiogQGNvbnN0IHtib29sZWFufSAqL1xuICAgIHRoaXMuaXNFbWFpbF8gPVxuICAgICAgdGhpcy5hbXBkb2MuaXNTaW5nbGVEb2MoKSAmJlxuICAgICAgaXNBbXA0RW1haWwoLyoqIEB0eXBlIHshRG9jdW1lbnR9ICovICh0aGlzLnJvb3RfKSk7XG5cbiAgICAvKipcbiAgICAgKiBPcHRpb25hbCBhbGxvd2xpc3Qgb2YgYWN0aW9ucywgZS5nLjpcbiAgICAgKlxuICAgICAqICAgICBbe3RhZ09yVGFyZ2V0OiAnQU1QJywgbWV0aG9kOiAnbmF2aWdhdGVUbyd9LFxuICAgICAqICAgICAge3RhZ09yVGFyZ2V0OiAnQU1QLUZPUk0nLCBtZXRob2Q6ICdzdWJtaXQnfSxcbiAgICAgKiAgICAgIHt0YWdPclRhcmdldDogJyonLCBtZXRob2Q6ICdzaG93J31dXG4gICAgICpcbiAgICAgKiBJZiBub3QgbnVsbCwgYW55IGFjdGlvbnMgdGhhdCBhcmUgbm90IGluIHRoZSBhbGxvd2xpc3Qgd2lsbCBiZSBpZ25vcmVkXG4gICAgICogYW5kIHRocm93IGEgdXNlciBlcnJvciBhdCBpbnZvY2F0aW9uIHRpbWUuIE5vdGUgdGhhdCBgdGFnT3JUYXJnZXRgIGlzXG4gICAgICogYWx3YXlzIHRoZSBjYW5vbmljYWwgdXBwZXJjYXNlZCBmb3JtIChzYW1lIGFzXG4gICAgICogYEVsZW1lbnQucHJvdG90eXBlLnRhZ05hbWVgKS4gSWYgYHRhZ09yVGFyZ2V0YCBpcyB0aGUgd2lsZGNhcmQgJyonLCB0aGVuXG4gICAgICogdGhlIGFsbG93bGlzdGVkIG1ldGhvZCBpcyBhbGxvd2VkIG9uIGFueSB0YWcgb3IgdGFyZ2V0LlxuICAgICAqXG4gICAgICogRm9yIEFNUDRFbWFpbCBmb3JtYXQgZG9jdW1lbnRzLCBhbGxvd2VkIGFjdGlvbnMgYXJlIGF1dG9nZW5lcmF0ZWQuXG4gICAgICogQHByaXZhdGUgez9BcnJheTx7dGFnT3JUYXJnZXQ6IHN0cmluZywgbWV0aG9kOiBzdHJpbmd9Pn1cbiAgICAgKi9cbiAgICB0aGlzLmFsbG93bGlzdF8gPSB0aGlzLmlzRW1haWxfID8gREVGQVVMVF9FTUFJTF9BTExPV0xJU1QgOiBudWxsO1xuXG4gICAgLyoqIEBjb25zdCBAcHJpdmF0ZSB7IU9iamVjdDxzdHJpbmcsIEFjdGlvbkhhbmRsZXJEZWY+fSAqL1xuICAgIHRoaXMuZ2xvYmFsVGFyZ2V0c18gPSBtYXAoKTtcblxuICAgIC8qKlxuICAgICAqIEBjb25zdCBAcHJpdmF0ZSB7IU9iamVjdDxzdHJpbmcsIHtoYW5kbGVyOiBBY3Rpb25IYW5kbGVyRGVmLCBtaW5UcnVzdDogQWN0aW9uVHJ1c3R9Pn1cbiAgICAgKi9cbiAgICB0aGlzLmdsb2JhbE1ldGhvZEhhbmRsZXJzXyA9IG1hcCgpO1xuXG4gICAgLy8gQWRkIGNvcmUgZXZlbnRzLlxuICAgIHRoaXMuYWRkRXZlbnQoJ3RhcCcpO1xuICAgIHRoaXMuYWRkRXZlbnQoJ3N1Ym1pdCcpO1xuICAgIHRoaXMuYWRkRXZlbnQoJ2NoYW5nZScpO1xuICAgIHRoaXMuYWRkRXZlbnQoJ2lucHV0LWRlYm91bmNlZCcpO1xuICAgIHRoaXMuYWRkRXZlbnQoJ2lucHV0LXRocm90dGxlZCcpO1xuICAgIHRoaXMuYWRkRXZlbnQoJ3ZhbGlkJyk7XG4gICAgdGhpcy5hZGRFdmVudCgnaW52YWxpZCcpO1xuICB9XG5cbiAgLyoqXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBuYW1lXG4gICAqIFRPRE8oZHZveXRlbmtvKTogc3dpdGNoIHRvIGEgc3lzdGVtIHdoZXJlIHRoZSBldmVudCByZWNvZ25pemVycyBhcmVcbiAgICogcmVnaXN0ZXJlZCB3aXRoIEFjdGlvbiBpbnN0ZWFkLCBlLmcuIFwiZG91YmxldGFwXCIsIFwidGFwIHRvIHpvb21cIi5cbiAgICovXG4gIGFkZEV2ZW50KG5hbWUpIHtcbiAgICBpZiAobmFtZSA9PSAndGFwJykge1xuICAgICAgLy8gVE9ETyhkdm95dGVua28pOiBpZiBuZWVkZWQsIGFsc28gY29uZmlndXJlIHRvdWNoLWJhc2VkIHRhcCwgZS5nLiBmb3JcbiAgICAgIC8vIGZhc3QtY2xpY2suXG4gICAgICB0aGlzLnJvb3RfLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKGV2ZW50KSA9PiB7XG4gICAgICAgIGlmICghZXZlbnQuZGVmYXVsdFByZXZlbnRlZCkge1xuICAgICAgICAgIGNvbnN0IGVsZW1lbnQgPSBkZXYoKS5hc3NlcnRFbGVtZW50KGV2ZW50LnRhcmdldCk7XG4gICAgICAgICAgdGhpcy50cmlnZ2VyKGVsZW1lbnQsIG5hbWUsIGV2ZW50LCBBY3Rpb25UcnVzdC5ISUdIKTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgICB0aGlzLnJvb3RfLmFkZEV2ZW50TGlzdGVuZXIoJ2tleWRvd24nLCAoZXZlbnQpID0+IHtcbiAgICAgICAgY29uc3Qge2tleSwgdGFyZ2V0fSA9IGV2ZW50O1xuICAgICAgICBjb25zdCBlbGVtZW50ID0gZGV2KCkuYXNzZXJ0RWxlbWVudCh0YXJnZXQpO1xuICAgICAgICBpZiAoa2V5ID09IEtleXMuRU5URVIgfHwga2V5ID09IEtleXMuU1BBQ0UpIHtcbiAgICAgICAgICBjb25zdCByb2xlID0gZWxlbWVudC5nZXRBdHRyaWJ1dGUoJ3JvbGUnKTtcbiAgICAgICAgICBjb25zdCBpc1RhcEV2ZW50Um9sZSA9XG4gICAgICAgICAgICByb2xlICYmIGhhc093bihUQVBQQUJMRV9BUklBX1JPTEVTLCByb2xlLnRvTG93ZXJDYXNlKCkpO1xuICAgICAgICAgIGlmICghZXZlbnQuZGVmYXVsdFByZXZlbnRlZCAmJiBpc1RhcEV2ZW50Um9sZSkge1xuICAgICAgICAgICAgY29uc3QgaGFzQWN0aW9uID0gdGhpcy50cmlnZ2VyKFxuICAgICAgICAgICAgICBlbGVtZW50LFxuICAgICAgICAgICAgICBuYW1lLFxuICAgICAgICAgICAgICBldmVudCxcbiAgICAgICAgICAgICAgQWN0aW9uVHJ1c3QuSElHSFxuICAgICAgICAgICAgKTtcbiAgICAgICAgICAgIC8vIE9ubHkgaWYgdGhlIGVsZW1lbnQgaGFzIGFuIGFjdGlvbiBkbyB3ZSBwcmV2ZW50IHRoZSBkZWZhdWx0LlxuICAgICAgICAgICAgLy8gSW4gdGhlIGFic2VuY2Ugb2YgYW4gYWN0aW9uLCBlLmcuIG9uPVwiW2V2ZW50XS5tZXRob2RcIiwgd2UgZG8gbm90XG4gICAgICAgICAgICAvLyB3YW50IHRvIHN0b3AgZGVmYXVsdCBiZWhhdmlvci5cbiAgICAgICAgICAgIGlmIChoYXNBY3Rpb24pIHtcbiAgICAgICAgICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIH0gZWxzZSBpZiAobmFtZSA9PSAnc3VibWl0Jykge1xuICAgICAgdGhpcy5yb290Xy5hZGRFdmVudExpc3RlbmVyKG5hbWUsIChldmVudCkgPT4ge1xuICAgICAgICBjb25zdCBlbGVtZW50ID0gZGV2KCkuYXNzZXJ0RWxlbWVudChldmVudC50YXJnZXQpO1xuICAgICAgICAvLyBGb3IgZ2V0IHJlcXVlc3RzLCB0aGUgZGVsZWdhdGluZyB0byB0aGUgdmlld2VyIG5lZWRzIHRvIGhhcHBlblxuICAgICAgICAvLyBiZWZvcmUgdGhpcy5cbiAgICAgICAgdGhpcy50cmlnZ2VyKGVsZW1lbnQsIG5hbWUsIGV2ZW50LCBBY3Rpb25UcnVzdC5ISUdIKTtcbiAgICAgIH0pO1xuICAgIH0gZWxzZSBpZiAobmFtZSA9PSAnY2hhbmdlJykge1xuICAgICAgdGhpcy5yb290Xy5hZGRFdmVudExpc3RlbmVyKG5hbWUsIChldmVudCkgPT4ge1xuICAgICAgICBjb25zdCBlbGVtZW50ID0gZGV2KCkuYXNzZXJ0RWxlbWVudChldmVudC50YXJnZXQpO1xuICAgICAgICB0aGlzLmFkZFRhcmdldFByb3BlcnRpZXNBc0RldGFpbF8oZXZlbnQpO1xuICAgICAgICB0aGlzLnRyaWdnZXIoZWxlbWVudCwgbmFtZSwgZXZlbnQsIEFjdGlvblRydXN0LkhJR0gpO1xuICAgICAgfSk7XG4gICAgfSBlbHNlIGlmIChuYW1lID09ICdpbnB1dC1kZWJvdW5jZWQnKSB7XG4gICAgICBjb25zdCBkZWJvdW5jZWRJbnB1dCA9IGRlYm91bmNlKFxuICAgICAgICB0aGlzLmFtcGRvYy53aW4sXG4gICAgICAgIChldmVudCkgPT4ge1xuICAgICAgICAgIGNvbnN0IHRhcmdldCA9IGRldigpLmFzc2VydEVsZW1lbnQoZXZlbnQudGFyZ2V0KTtcbiAgICAgICAgICB0aGlzLnRyaWdnZXIoXG4gICAgICAgICAgICB0YXJnZXQsXG4gICAgICAgICAgICBuYW1lLFxuICAgICAgICAgICAgLyoqIEB0eXBlIHshQWN0aW9uRXZlbnREZWZ9ICovIChldmVudCksXG4gICAgICAgICAgICBBY3Rpb25UcnVzdC5ISUdIXG4gICAgICAgICAgKTtcbiAgICAgICAgfSxcbiAgICAgICAgREVGQVVMVF9ERUJPVU5DRV9XQUlUXG4gICAgICApO1xuXG4gICAgICB0aGlzLnJvb3RfLmFkZEV2ZW50TGlzdGVuZXIoJ2lucHV0JywgKGV2ZW50KSA9PiB7XG4gICAgICAgIC8vIENyZWF0ZSBhIERlZmVycmVkRXZlbnQgdG8gYXZvaWQgcmFjZXMgd2hlcmUgdGhlIGJyb3dzZXIgY2xlYW5zIHVwXG4gICAgICAgIC8vIHRoZSBldmVudCBvYmplY3QgYmVmb3JlIHRoZSBhc3luYyBkZWJvdW5jZWQgZnVuY3Rpb24gaXMgY2FsbGVkLlxuICAgICAgICBjb25zdCBkZWZlcnJlZEV2ZW50ID0gbmV3IERlZmVycmVkRXZlbnQoZXZlbnQpO1xuICAgICAgICB0aGlzLmFkZFRhcmdldFByb3BlcnRpZXNBc0RldGFpbF8oZGVmZXJyZWRFdmVudCk7XG4gICAgICAgIGRlYm91bmNlZElucHV0KGRlZmVycmVkRXZlbnQpO1xuICAgICAgfSk7XG4gICAgfSBlbHNlIGlmIChuYW1lID09ICdpbnB1dC10aHJvdHRsZWQnKSB7XG4gICAgICBjb25zdCB0aHJvdHRsZWRJbnB1dCA9IHRocm90dGxlKFxuICAgICAgICB0aGlzLmFtcGRvYy53aW4sXG4gICAgICAgIChldmVudCkgPT4ge1xuICAgICAgICAgIGNvbnN0IHRhcmdldCA9IGRldigpLmFzc2VydEVsZW1lbnQoZXZlbnQudGFyZ2V0KTtcbiAgICAgICAgICB0aGlzLnRyaWdnZXIoXG4gICAgICAgICAgICB0YXJnZXQsXG4gICAgICAgICAgICBuYW1lLFxuICAgICAgICAgICAgLyoqIEB0eXBlIHshQWN0aW9uRXZlbnREZWZ9ICovIChldmVudCksXG4gICAgICAgICAgICBBY3Rpb25UcnVzdC5ISUdIXG4gICAgICAgICAgKTtcbiAgICAgICAgfSxcbiAgICAgICAgREVGQVVMVF9USFJPVFRMRV9JTlRFUlZBTFxuICAgICAgKTtcblxuICAgICAgdGhpcy5yb290Xy5hZGRFdmVudExpc3RlbmVyKCdpbnB1dCcsIChldmVudCkgPT4ge1xuICAgICAgICBjb25zdCBkZWZlcnJlZEV2ZW50ID0gbmV3IERlZmVycmVkRXZlbnQoZXZlbnQpO1xuICAgICAgICB0aGlzLmFkZFRhcmdldFByb3BlcnRpZXNBc0RldGFpbF8oZGVmZXJyZWRFdmVudCk7XG4gICAgICAgIHRocm90dGxlZElucHV0KGRlZmVycmVkRXZlbnQpO1xuICAgICAgfSk7XG4gICAgfSBlbHNlIGlmIChuYW1lID09ICd2YWxpZCcgfHwgbmFtZSA9PSAnaW52YWxpZCcpIHtcbiAgICAgIHRoaXMucm9vdF8uYWRkRXZlbnRMaXN0ZW5lcihuYW1lLCAoZXZlbnQpID0+IHtcbiAgICAgICAgY29uc3QgZWxlbWVudCA9IGRldigpLmFzc2VydEVsZW1lbnQoZXZlbnQudGFyZ2V0KTtcbiAgICAgICAgdGhpcy50cmlnZ2VyKGVsZW1lbnQsIG5hbWUsIGV2ZW50LCBBY3Rpb25UcnVzdC5ISUdIKTtcbiAgICAgIH0pO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBSZWdpc3RlcnMgdGhlIGFjdGlvbiB0YXJnZXQgdGhhdCB3aWxsIHJlY2VpdmUgYWxsIGRlc2lnbmF0ZWQgYWN0aW9ucy5cbiAgICogQHBhcmFtIHtzdHJpbmd9IG5hbWVcbiAgICogQHBhcmFtIHtBY3Rpb25IYW5kbGVyRGVmfSBoYW5kbGVyXG4gICAqL1xuICBhZGRHbG9iYWxUYXJnZXQobmFtZSwgaGFuZGxlcikge1xuICAgIHRoaXMuZ2xvYmFsVGFyZ2V0c19bbmFtZV0gPSBoYW5kbGVyO1xuICB9XG5cbiAgLyoqXG4gICAqIFJlZ2lzdGVycyB0aGUgYWN0aW9uIGhhbmRsZXIgZm9yIGEgY29tbW9uIG1ldGhvZC5cbiAgICogQHBhcmFtIHtzdHJpbmd9IG5hbWVcbiAgICogQHBhcmFtIHtBY3Rpb25IYW5kbGVyRGVmfSBoYW5kbGVyXG4gICAqIEBwYXJhbSB7QWN0aW9uVHJ1c3R9IG1pblRydXN0XG4gICAqL1xuICBhZGRHbG9iYWxNZXRob2RIYW5kbGVyKG5hbWUsIGhhbmRsZXIsIG1pblRydXN0ID0gQWN0aW9uVHJ1c3QuREVGQVVMVCkge1xuICAgIHRoaXMuZ2xvYmFsTWV0aG9kSGFuZGxlcnNfW25hbWVdID0ge2hhbmRsZXIsIG1pblRydXN0fTtcbiAgfVxuXG4gIC8qKlxuICAgKiBUcmlnZ2VycyB0aGUgc3BlY2lmaWVkIGV2ZW50IG9uIHRoZSB0YXJnZXQgZWxlbWVudC5cbiAgICogQHBhcmFtIHshRWxlbWVudH0gdGFyZ2V0XG4gICAqIEBwYXJhbSB7c3RyaW5nfSBldmVudFR5cGVcbiAgICogQHBhcmFtIHs/QWN0aW9uRXZlbnREZWZ9IGV2ZW50XG4gICAqIEBwYXJhbSB7IUFjdGlvblRydXN0fSB0cnVzdFxuICAgKiBAcGFyYW0gez9Kc29uT2JqZWN0PX0gb3B0X2FyZ3NcbiAgICogQHJldHVybiB7Ym9vbGVhbn0gdHJ1ZSBpZiB0aGUgdGFyZ2V0IGhhcyBhbiBhY3Rpb24uXG4gICAqL1xuICB0cmlnZ2VyKHRhcmdldCwgZXZlbnRUeXBlLCBldmVudCwgdHJ1c3QsIG9wdF9hcmdzKSB7XG4gICAgcmV0dXJuIHRoaXMuYWN0aW9uXyh0YXJnZXQsIGV2ZW50VHlwZSwgZXZlbnQsIHRydXN0LCBvcHRfYXJncyk7XG4gIH1cblxuICAvKipcbiAgICogVHJpZ2dlcnMgZXhlY3V0aW9uIG9mIHRoZSBtZXRob2Qgb24gYSB0YXJnZXQvbWV0aG9kLlxuICAgKiBAcGFyYW0geyFFbGVtZW50fSB0YXJnZXRcbiAgICogQHBhcmFtIHtzdHJpbmd9IG1ldGhvZFxuICAgKiBAcGFyYW0gez9Kc29uT2JqZWN0fSBhcmdzXG4gICAqIEBwYXJhbSB7P0VsZW1lbnR9IHNvdXJjZVxuICAgKiBAcGFyYW0gez9FbGVtZW50fSBjYWxsZXJcbiAgICogQHBhcmFtIHs/QWN0aW9uRXZlbnREZWZ9IGV2ZW50XG4gICAqIEBwYXJhbSB7QWN0aW9uVHJ1c3R9IHRydXN0XG4gICAqL1xuICBleGVjdXRlKHRhcmdldCwgbWV0aG9kLCBhcmdzLCBzb3VyY2UsIGNhbGxlciwgZXZlbnQsIHRydXN0KSB7XG4gICAgY29uc3QgaW52b2NhdGlvbiA9IG5ldyBBY3Rpb25JbnZvY2F0aW9uKFxuICAgICAgdGFyZ2V0LFxuICAgICAgbWV0aG9kLFxuICAgICAgYXJncyxcbiAgICAgIHNvdXJjZSxcbiAgICAgIGNhbGxlcixcbiAgICAgIGV2ZW50LFxuICAgICAgdHJ1c3RcbiAgICApO1xuICAgIHRoaXMuaW52b2tlXyhpbnZvY2F0aW9uKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBJbnN0YWxscyBhY3Rpb24gaGFuZGxlciBmb3IgdGhlIHNwZWNpZmllZCBlbGVtZW50LiBUaGUgYWN0aW9uIGhhbmRsZXIgaXNcbiAgICogcmVzcG9uc2libGUgZm9yIGNoZWNraW5nIGludm9jYXRpb24gdHJ1c3QuXG4gICAqXG4gICAqIEZvciBBTVAgZWxlbWVudHMsIHVzZSBiYXNlLWVsZW1lbnQucmVnaXN0ZXJBY3Rpb24oKSBpbnN0ZWFkLlxuICAgKlxuICAgKiBAcGFyYW0geyFFbGVtZW50fSB0YXJnZXRcbiAgICogQHBhcmFtIHtBY3Rpb25IYW5kbGVyRGVmfSBoYW5kbGVyXG4gICAqL1xuICBpbnN0YWxsQWN0aW9uSGFuZGxlcih0YXJnZXQsIGhhbmRsZXIpIHtcbiAgICAvLyBUT0RPKGR2b3l0ZW5rbywgIzcwNjMpOiBzd2l0Y2ggYmFjayB0byBgdGFyZ2V0LmlkYCB3aXRoIGZvcm0gcHJveHkuXG4gICAgY29uc3QgdGFyZ2V0SWQgPSB0YXJnZXQuZ2V0QXR0cmlidXRlKCdpZCcpIHx8ICcnO1xuXG4gICAgZGV2QXNzZXJ0KFxuICAgICAgaXNBbXBUYWdOYW1lKHRhcmdldElkKSB8fFxuICAgICAgICB0YXJnZXQudGFnTmFtZS50b0xvd2VyQ2FzZSgpIGluIE5PTl9BTVBfRUxFTUVOVFNfQUNUSU9OU18sXG4gICAgICAnQU1QIG9yIHNwZWNpYWwgZWxlbWVudCBleHBlY3RlZDogJXMnLFxuICAgICAgdGFyZ2V0LnRhZ05hbWUgKyAnIycgKyB0YXJnZXRJZFxuICAgICk7XG5cbiAgICBpZiAodGFyZ2V0W0FDVElPTl9IQU5ETEVSX10pIHtcbiAgICAgIGRldigpLmVycm9yKFRBR18sIGBBY3Rpb24gaGFuZGxlciBhbHJlYWR5IGluc3RhbGxlZCBmb3IgJHt0YXJnZXR9YCk7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIHRhcmdldFtBQ1RJT05fSEFORExFUl9dID0gaGFuZGxlcjtcblxuICAgIC8qKiBAY29uc3Qge0FycmF5PCFBY3Rpb25JbnZvY2F0aW9uPn0gKi9cbiAgICBjb25zdCBxdWV1ZWRJbnZvY2F0aW9ucyA9IHRhcmdldFtBQ1RJT05fUVVFVUVfXTtcbiAgICBpZiAoaXNBcnJheShxdWV1ZWRJbnZvY2F0aW9ucykpIHtcbiAgICAgIC8vIEludm9rZSBhbmQgY2xlYXIgYWxsIHF1ZXVlZCBpbnZvY2F0aW9ucyBub3cgaGFuZGxlciBpcyBpbnN0YWxsZWQuXG4gICAgICBTZXJ2aWNlcy50aW1lckZvcih0b1dpbih0YXJnZXQub3duZXJEb2N1bWVudC5kZWZhdWx0VmlldykpLmRlbGF5KCgpID0+IHtcbiAgICAgICAgLy8gVE9ETyhkdm95dGVua28sICMxMjYwKTogZGVkdXBlIGFjdGlvbnMuXG4gICAgICAgIHF1ZXVlZEludm9jYXRpb25zLmZvckVhY2goKGludm9jYXRpb24pID0+IHtcbiAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgaGFuZGxlcihpbnZvY2F0aW9uKTtcbiAgICAgICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgICAgICBkZXYoKS5lcnJvcihUQUdfLCAnQWN0aW9uIGV4ZWN1dGlvbiBmYWlsZWQ6JywgaW52b2NhdGlvbiwgZSk7XG4gICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgICAgdGFyZ2V0W0FDVElPTl9RVUVVRV9dLmxlbmd0aCA9IDA7XG4gICAgICB9LCAxKTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogQ2hlY2tzIGlmIHRoZSBnaXZlbiBlbGVtZW50IGhhcyByZWdpc3RlcmVkIGEgcGFydGljdWxhciBhY3Rpb24gdHlwZS5cbiAgICogQHBhcmFtIHshRWxlbWVudH0gZWxlbWVudFxuICAgKiBAcGFyYW0ge3N0cmluZ30gYWN0aW9uRXZlbnRUeXBlXG4gICAqIEBwYXJhbSB7IUVsZW1lbnQ9fSBvcHRfc3RvcEF0XG4gICAqIEByZXR1cm4ge2Jvb2xlYW59XG4gICAqL1xuICBoYXNBY3Rpb24oZWxlbWVudCwgYWN0aW9uRXZlbnRUeXBlLCBvcHRfc3RvcEF0KSB7XG4gICAgcmV0dXJuICEhdGhpcy5maW5kQWN0aW9uXyhlbGVtZW50LCBhY3Rpb25FdmVudFR5cGUsIG9wdF9zdG9wQXQpO1xuICB9XG5cbiAgLyoqXG4gICAqIENoZWNrcyBpZiB0aGUgZ2l2ZW4gZWxlbWVudCdzIHJlZ2lzdGVyZWQgYWN0aW9uIHJlc29sdmVzIHRvIGF0IGxlYXN0IG9uZVxuICAgKiBleGlzdGluZyBlbGVtZW50IGJ5IGlkIG9yIGEgZ2xvYmFsIHRhcmdldCAoZS5nLiBcIkFNUFwiKS5cbiAgICogQHBhcmFtIHshRWxlbWVudH0gZWxlbWVudFxuICAgKiBAcGFyYW0ge3N0cmluZ30gYWN0aW9uRXZlbnRUeXBlXG4gICAqIEBwYXJhbSB7IUVsZW1lbnQ9fSBvcHRfc3RvcEF0XG4gICAqIEByZXR1cm4ge2Jvb2xlYW59XG4gICAqL1xuICBoYXNSZXNvbHZhYmxlQWN0aW9uKGVsZW1lbnQsIGFjdGlvbkV2ZW50VHlwZSwgb3B0X3N0b3BBdCkge1xuICAgIGNvbnN0IGFjdGlvbiA9IHRoaXMuZmluZEFjdGlvbl8oZWxlbWVudCwgYWN0aW9uRXZlbnRUeXBlLCBvcHRfc3RvcEF0KTtcbiAgICBpZiAoIWFjdGlvbikge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgICByZXR1cm4gYWN0aW9uLmFjdGlvbkluZm9zLnNvbWUoKGFjdGlvbikgPT4ge1xuICAgICAgY29uc3Qge3RhcmdldH0gPSBhY3Rpb247XG4gICAgICByZXR1cm4gISF0aGlzLmdldEFjdGlvbk5vZGVfKHRhcmdldCk7XG4gICAgfSk7XG4gIH1cblxuICAvKipcbiAgICogQ2hlY2tzIGlmIHRoZSBnaXZlbiBlbGVtZW50J3MgcmVnaXN0ZXJlZCBhY3Rpb24gcmVzb2x2ZXMgdG8gYXQgbGVhc3Qgb25lXG4gICAqIGV4aXN0aW5nIGVsZW1lbnQgYnkgaWQgb3IgYSBnbG9iYWwgdGFyZ2V0IChlLmcuIFwiQU1QXCIpLlxuICAgKiBAcGFyYW0geyFFbGVtZW50fSBlbGVtZW50XG4gICAqIEBwYXJhbSB7c3RyaW5nfSBhY3Rpb25FdmVudFR5cGVcbiAgICogQHBhcmFtIHshRWxlbWVudH0gdGFyZ2V0RWxlbWVudFxuICAgKiBAcGFyYW0geyFFbGVtZW50PX0gb3B0X3N0b3BBdFxuICAgKiBAcmV0dXJuIHtib29sZWFufVxuICAgKi9cbiAgaGFzUmVzb2x2YWJsZUFjdGlvbkZvclRhcmdldChcbiAgICBlbGVtZW50LFxuICAgIGFjdGlvbkV2ZW50VHlwZSxcbiAgICB0YXJnZXRFbGVtZW50LFxuICAgIG9wdF9zdG9wQXRcbiAgKSB7XG4gICAgY29uc3QgYWN0aW9uID0gdGhpcy5maW5kQWN0aW9uXyhlbGVtZW50LCBhY3Rpb25FdmVudFR5cGUsIG9wdF9zdG9wQXQpO1xuICAgIGlmICghYWN0aW9uKSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICAgIHJldHVybiBhY3Rpb24uYWN0aW9uSW5mb3Muc29tZSgoYWN0aW9uSW5mbykgPT4ge1xuICAgICAgY29uc3Qge3RhcmdldH0gPSBhY3Rpb25JbmZvO1xuICAgICAgcmV0dXJuIHRoaXMuZ2V0QWN0aW9uTm9kZV8odGFyZ2V0KSA9PSB0YXJnZXRFbGVtZW50O1xuICAgIH0pO1xuICB9XG5cbiAgLyoqXG4gICAqIEZvciBnbG9iYWwgdGFyZ2V0cyBlLmcuIFwiQU1QXCIsIHJldHVybnMgdGhlIGRvY3VtZW50IHJvb3QuIE90aGVyd2lzZSxcbiAgICogYHRhcmdldGAgaXMgYW4gZWxlbWVudCBpZCBhbmQgdGhlIGNvcnJlc3BvbmRpbmcgZWxlbWVudCBpcyByZXR1cm5lZC5cbiAgICogQHBhcmFtIHtzdHJpbmd9IHRhcmdldFxuICAgKiBAcmV0dXJuIHs/RG9jdW1lbnR8P0VsZW1lbnR8P1NoYWRvd1Jvb3R9XG4gICAqIEBwcml2YXRlXG4gICAqL1xuICBnZXRBY3Rpb25Ob2RlXyh0YXJnZXQpIHtcbiAgICByZXR1cm4gdGhpcy5nbG9iYWxUYXJnZXRzX1t0YXJnZXRdXG4gICAgICA/IHRoaXMucm9vdF9cbiAgICAgIDogdGhpcy5yb290Xy5nZXRFbGVtZW50QnlJZCh0YXJnZXQpO1xuICB9XG5cbiAgLyoqXG4gICAqIFNldHMgdGhlIGFjdGlvbiBhbGxvd2xpc3QuIENhbiBiZSB1c2VkIHRvIGNsZWFyIGl0LlxuICAgKiBAcGFyYW0geyFBcnJheTx7dGFnT3JUYXJnZXQ6IHN0cmluZywgbWV0aG9kOiBzdHJpbmd9Pn0gYWxsb3dsaXN0XG4gICAqL1xuICBzZXRBbGxvd2xpc3QoYWxsb3dsaXN0KSB7XG4gICAgZGV2QXNzZXJ0KFxuICAgICAgYWxsb3dsaXN0LmV2ZXJ5KCh2KSA9PiB2LnRhZ09yVGFyZ2V0ICYmIHYubWV0aG9kKSxcbiAgICAgICdBY3Rpb24gYWxsb3dsaXN0IGVudHJpZXMgc2hvdWxkIGJlIG9mIHNoYXBlIHsgdGFnT3JUYXJnZXQ6IHN0cmluZywgbWV0aG9kOiBzdHJpbmcgfSdcbiAgICApO1xuICAgIHRoaXMuYWxsb3dsaXN0XyA9IGFsbG93bGlzdDtcbiAgfVxuXG4gIC8qKlxuICAgKiBBZGRzIGFuIGFjdGlvbiB0byB0aGUgYWxsb3dsaXN0LlxuICAgKiBAcGFyYW0ge3N0cmluZ30gdGFnT3JUYXJnZXQgVGhlIHRhZyBvciB0YXJnZXQgdG8gYWxsb3dsaXN0LCBlLmcuXG4gICAqICAgICAnQU1QLUxJU1QnLCAnKicuXG4gICAqIEBwYXJhbSB7c3RyaW5nfEFycmF5PHN0cmluZz59IG1ldGhvZHMgVGhlIG1ldGhvZChzKSB0byBhbGxvd2xpc3QsIGUuZy4gJ3Nob3cnLCAnaGlkZScuXG4gICAqIEBwYXJhbSB7QXJyYXk8c3RyaW5nPj19IG9wdF9mb3JGb3JtYXRcbiAgICovXG4gIGFkZFRvQWxsb3dsaXN0KHRhZ09yVGFyZ2V0LCBtZXRob2RzLCBvcHRfZm9yRm9ybWF0KSB7XG4gICAgLy8gVE9ETyh3Zy1wZXJmb3JtYW5jZSk6IFdoZW4gaXQgYmVjb21lcyBwb3NzaWJsZSB0byBnZXRGb3JtYXQoKSxcbiAgICAvLyB3ZSBjYW4gc3RvcmUgYGZvcm1hdF9gIGluc3RlYWQgb2YgYGlzRW1haWxfYCBhbmQgY2hlY2tcbiAgICAvLyAob3B0X2ZvckZvcm1hdCAmJiAhb3B0X2ZvckZvcm1hdC5pbmNsdWRlcyh0aGlzLmZvcm1hdF8pKVxuICAgIGlmIChvcHRfZm9yRm9ybWF0ICYmIG9wdF9mb3JGb3JtYXQuaW5jbHVkZXMoJ2VtYWlsJykgIT09IHRoaXMuaXNFbWFpbF8pIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgaWYgKCF0aGlzLmFsbG93bGlzdF8pIHtcbiAgICAgIHRoaXMuYWxsb3dsaXN0XyA9IFtdO1xuICAgIH1cbiAgICBpZiAoIWlzQXJyYXkobWV0aG9kcykpIHtcbiAgICAgIG1ldGhvZHMgPSBbbWV0aG9kc107XG4gICAgfVxuICAgIG1ldGhvZHMuZm9yRWFjaCgobWV0aG9kKSA9PiB7XG4gICAgICBpZiAoXG4gICAgICAgIHRoaXMuYWxsb3dsaXN0Xy5zb21lKFxuICAgICAgICAgICh2KSA9PiB2LnRhZ09yVGFyZ2V0ID09IHRhZ09yVGFyZ2V0ICYmIHYubWV0aG9kID09IG1ldGhvZFxuICAgICAgICApXG4gICAgICApIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuICAgICAgdGhpcy5hbGxvd2xpc3RfLnB1c2goe3RhZ09yVGFyZ2V0LCBtZXRob2R9KTtcbiAgICB9KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBAcGFyYW0geyFFbGVtZW50fSBzb3VyY2VcbiAgICogQHBhcmFtIHtzdHJpbmd9IGFjdGlvbkV2ZW50VHlwZVxuICAgKiBAcGFyYW0gez9BY3Rpb25FdmVudERlZn0gZXZlbnRcbiAgICogQHBhcmFtIHshQWN0aW9uVHJ1c3R9IHRydXN0XG4gICAqIEBwYXJhbSB7P0pzb25PYmplY3Q9fSBvcHRfYXJnc1xuICAgKiBAcmV0dXJuIHtib29sZWFufSBUcnVlIGlmIHRoZSBlbGVtZW50IGhhcyBhbiBhY3Rpb24uXG4gICAqIEBwcml2YXRlXG4gICAqL1xuICBhY3Rpb25fKHNvdXJjZSwgYWN0aW9uRXZlbnRUeXBlLCBldmVudCwgdHJ1c3QsIG9wdF9hcmdzKSB7XG4gICAgY29uc3QgYWN0aW9uID0gdGhpcy5maW5kQWN0aW9uXyhzb3VyY2UsIGFjdGlvbkV2ZW50VHlwZSk7XG4gICAgaWYgKCFhY3Rpb24pIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gICAgLy8gVXNlIGEgcHNldWRvLVVVSUQgdG8gdW5pcXVlbHkgaWRlbnRpZnkgdGhpcyBzZXF1ZW5jZSBvZiBhY3Rpb25zLlxuICAgIC8vIEEgc2VxdWVuY2UgaXMgYWxsIGFjdGlvbnMgdHJpZ2dlcmVkIGJ5IGEgc2luZ2xlIGV2ZW50LlxuICAgIGNvbnN0IHNlcXVlbmNlSWQgPSBNYXRoLnJhbmRvbSgpO1xuICAgIC8vIEludm9rZSBhY3Rpb25zIHNlcmlhbGx5LCB3aGVyZSBlYWNoIGFjdGlvbiB3YWl0cyBmb3IgaXRzIHByZWRlY2Vzc29yXG4gICAgLy8gdG8gY29tcGxldGUuIGBjdXJyZW50UHJvbWlzZWAgaXMgdGhlIGkndGggcHJvbWlzZSBpbiB0aGUgY2hhaW4uXG4gICAgLyoqIEB0eXBlIHs/UHJvbWlzZX0gKi9cbiAgICBsZXQgY3VycmVudFByb21pc2UgPSBudWxsO1xuICAgIGFjdGlvbi5hY3Rpb25JbmZvcy5mb3JFYWNoKChhY3Rpb25JbmZvKSA9PiB7XG4gICAgICBjb25zdCB7YXJncywgbWV0aG9kLCBzdHIsIHRhcmdldH0gPSBhY3Rpb25JbmZvO1xuICAgICAgY29uc3QgZGVyZWZlcmVuY2VkQXJncyA9IGRlcmVmZXJlbmNlQXJnc1ZhcmlhYmxlcyhhcmdzLCBldmVudCwgb3B0X2FyZ3MpO1xuICAgICAgY29uc3QgaW52b2tlQWN0aW9uID0gKCkgPT4ge1xuICAgICAgICBjb25zdCBub2RlID0gdGhpcy5nZXRBY3Rpb25Ob2RlXyh0YXJnZXQpO1xuICAgICAgICBpZiAoIW5vZGUpIHtcbiAgICAgICAgICB0aGlzLmVycm9yXyhgVGFyZ2V0IFwiJHt0YXJnZXR9XCIgbm90IGZvdW5kIGZvciBhY3Rpb24gWyR7c3RyfV0uYCk7XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IGludm9jYXRpb24gPSBuZXcgQWN0aW9uSW52b2NhdGlvbihcbiAgICAgICAgICBub2RlLFxuICAgICAgICAgIG1ldGhvZCxcbiAgICAgICAgICBkZXJlZmVyZW5jZWRBcmdzLFxuICAgICAgICAgIHNvdXJjZSxcbiAgICAgICAgICBhY3Rpb24ubm9kZSxcbiAgICAgICAgICBldmVudCxcbiAgICAgICAgICB0cnVzdCxcbiAgICAgICAgICBhY3Rpb25FdmVudFR5cGUsXG4gICAgICAgICAgbm9kZS50YWdOYW1lIHx8IHRhcmdldCxcbiAgICAgICAgICBzZXF1ZW5jZUlkXG4gICAgICAgICk7XG4gICAgICAgIHJldHVybiB0aGlzLmludm9rZV8oaW52b2NhdGlvbik7XG4gICAgICB9O1xuICAgICAgLy8gV2FpdCBmb3IgdGhlIHByZXZpb3VzIGFjdGlvbiwgaWYgYW55LlxuICAgICAgY3VycmVudFByb21pc2UgPSBjdXJyZW50UHJvbWlzZVxuICAgICAgICA/IGN1cnJlbnRQcm9taXNlLnRoZW4oaW52b2tlQWN0aW9uKVxuICAgICAgICA6IGludm9rZUFjdGlvbigpO1xuICAgIH0pO1xuXG4gICAgcmV0dXJuIGFjdGlvbi5hY3Rpb25JbmZvcy5sZW5ndGggPj0gMTtcbiAgfVxuXG4gIC8qKlxuICAgKiBAcGFyYW0ge3N0cmluZ30gbWVzc2FnZVxuICAgKiBAcGFyYW0gez9FbGVtZW50PX0gb3B0X2VsZW1lbnRcbiAgICogQHByaXZhdGVcbiAgICovXG4gIGVycm9yXyhtZXNzYWdlLCBvcHRfZWxlbWVudCkge1xuICAgIGlmIChvcHRfZWxlbWVudCkge1xuICAgICAgLy8gcmVwb3J0RXJyb3IoKSBzdXBwb3J0cyBkaXNwbGF5aW5nIHRoZSBlbGVtZW50IGluIGRldiBjb25zb2xlLlxuICAgICAgY29uc3QgZSA9IHVzZXIoKS5jcmVhdGVFcnJvcihgWyR7VEFHX31dICR7bWVzc2FnZX1gKTtcbiAgICAgIHJlcG9ydEVycm9yKGUsIG9wdF9lbGVtZW50KTtcbiAgICAgIHRocm93IGU7XG4gICAgfSBlbHNlIHtcbiAgICAgIHVzZXIoKS5lcnJvcihUQUdfLCBtZXNzYWdlKTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogQHBhcmFtIHshQWN0aW9uSW52b2NhdGlvbn0gaW52b2NhdGlvblxuICAgKiBAcmV0dXJuIHs/UHJvbWlzZX1cbiAgICogQHByaXZhdGVcbiAgICovXG4gIGludm9rZV8oaW52b2NhdGlvbikge1xuICAgIGNvbnN0IHttZXRob2QsIHRhZ09yVGFyZ2V0fSA9IGludm9jYXRpb247XG5cbiAgICAvLyBDaGVjayB0aGF0IHRoaXMgYWN0aW9uIGlzIGFsbG93bGlzdGVkIChpZiBhIGFsbG93bGlzdCBpcyBzZXQpLlxuICAgIGlmICh0aGlzLmFsbG93bGlzdF8pIHtcbiAgICAgIGlmICghaXNBY3Rpb25BbGxvd2xpc3RlZChpbnZvY2F0aW9uLCB0aGlzLmFsbG93bGlzdF8pKSB7XG4gICAgICAgIHRoaXMuZXJyb3JfKFxuICAgICAgICAgIGBcIiR7dGFnT3JUYXJnZXR9LiR7bWV0aG9kfVwiIGlzIG5vdCBhbGxvd2xpc3RlZCAke0pTT04uc3RyaW5naWZ5KFxuICAgICAgICAgICAgdGhpcy5hbGxvd2xpc3RfXG4gICAgICAgICAgKX0uYFxuICAgICAgICApO1xuICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBIYW5kbGUgZ2xvYmFsIHRhcmdldHMgZS5nLiBcIkFNUFwiLlxuICAgIGNvbnN0IGdsb2JhbFRhcmdldCA9IHRoaXMuZ2xvYmFsVGFyZ2V0c19bdGFnT3JUYXJnZXRdO1xuICAgIGlmIChnbG9iYWxUYXJnZXQpIHtcbiAgICAgIHJldHVybiBnbG9iYWxUYXJnZXQoaW52b2NhdGlvbik7XG4gICAgfVxuXG4gICAgLy8gU3Vic2VxdWVudCBoYW5kbGVycyBhc3N1bWUgdGhhdCBpbnZvY2F0aW9uIHRhcmdldCBpcyBhbiBFbGVtZW50LlxuICAgIGNvbnN0IG5vZGUgPSBkZXYoKS5hc3NlcnRFbGVtZW50KGludm9jYXRpb24ubm9kZSk7XG5cbiAgICAvLyBIYW5kbGUgZ2xvYmFsIGFjdGlvbnMgZS5nLiBcIjxhbnktZWxlbWVudC1pZD4udG9nZ2xlXCIuXG4gICAgY29uc3QgZ2xvYmFsTWV0aG9kID0gdGhpcy5nbG9iYWxNZXRob2RIYW5kbGVyc19bbWV0aG9kXTtcbiAgICBpZiAoZ2xvYmFsTWV0aG9kICYmIGludm9jYXRpb24uc2F0aXNmaWVzVHJ1c3QoZ2xvYmFsTWV0aG9kLm1pblRydXN0KSkge1xuICAgICAgcmV0dXJuIGdsb2JhbE1ldGhvZC5oYW5kbGVyKGludm9jYXRpb24pO1xuICAgIH1cblxuICAgIC8vIEhhbmRsZSBlbGVtZW50LXNwZWNpZmljIGFjdGlvbnMuXG4gICAgY29uc3QgbG93ZXJUYWdOYW1lID0gbm9kZS50YWdOYW1lLnRvTG93ZXJDYXNlKCk7XG4gICAgaWYgKGlzQW1wVGFnTmFtZShsb3dlclRhZ05hbWUpKSB7XG4gICAgICBpZiAobm9kZS5lbnF1ZUFjdGlvbikge1xuICAgICAgICBub2RlLmVucXVlQWN0aW9uKGludm9jYXRpb24pO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhpcy5lcnJvcl8oYFVucmVjb2duaXplZCBBTVAgZWxlbWVudCBcIiR7bG93ZXJUYWdOYW1lfVwiLmAsIG5vZGUpO1xuICAgICAgfVxuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuXG4gICAgLy8gU3BlY2lhbCBub24tQU1QIGVsZW1lbnRzIHdpdGggQU1QIElEIG9yIGtub3duIHN1cHBvcnRlZCBhY3Rpb25zLlxuICAgIGNvbnN0IG5vbkFtcEFjdGlvbnMgPSBOT05fQU1QX0VMRU1FTlRTX0FDVElPTlNfW2xvd2VyVGFnTmFtZV07XG4gICAgLy8gVE9ETyhkdm95dGVua28sICM3MDYzKTogc3dpdGNoIGJhY2sgdG8gYHRhcmdldC5pZGAgd2l0aCBmb3JtIHByb3h5LlxuICAgIGNvbnN0IHRhcmdldElkID0gbm9kZS5nZXRBdHRyaWJ1dGUoJ2lkJykgfHwgJyc7XG4gICAgaWYgKFxuICAgICAgaXNBbXBUYWdOYW1lKHRhcmdldElkKSB8fFxuICAgICAgKG5vbkFtcEFjdGlvbnMgJiYgbm9uQW1wQWN0aW9ucy5pbmRleE9mKG1ldGhvZCkgPiAtMSlcbiAgICApIHtcbiAgICAgIGNvbnN0IGhhbmRsZXIgPSBub2RlW0FDVElPTl9IQU5ETEVSX107XG4gICAgICBpZiAoaGFuZGxlcikge1xuICAgICAgICBoYW5kbGVyKGludm9jYXRpb24pO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgbm9kZVtBQ1RJT05fUVVFVUVfXSA9IG5vZGVbQUNUSU9OX1FVRVVFX10gfHwgW107XG4gICAgICAgIG5vZGVbQUNUSU9OX1FVRVVFX10ucHVzaChpbnZvY2F0aW9uKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cblxuICAgIC8vIFVuc3VwcG9ydGVkIG1ldGhvZC5cbiAgICB0aGlzLmVycm9yXyhcbiAgICAgIGBUYXJnZXQgKCR7dGFnT3JUYXJnZXR9KSBkb2Vzbid0IHN1cHBvcnQgXCIke21ldGhvZH1cIiBhY3Rpb24uYCxcbiAgICAgIGludm9jYXRpb24uY2FsbGVyXG4gICAgKTtcblxuICAgIHJldHVybiBudWxsO1xuICB9XG5cbiAgLyoqXG4gICAqIEBwYXJhbSB7IUVsZW1lbnR9IHRhcmdldFxuICAgKiBAcGFyYW0ge3N0cmluZ30gYWN0aW9uRXZlbnRUeXBlXG4gICAqIEBwYXJhbSB7IUVsZW1lbnQ9fSBvcHRfc3RvcEF0XG4gICAqIEByZXR1cm4gez97bm9kZTogIUVsZW1lbnQsIGFjdGlvbkluZm9zOiAhQXJyYXk8IUFjdGlvbkluZm9EZWY+fX1cbiAgICovXG4gIGZpbmRBY3Rpb25fKHRhcmdldCwgYWN0aW9uRXZlbnRUeXBlLCBvcHRfc3RvcEF0KSB7XG4gICAgLy8gR28gZnJvbSB0YXJnZXQgdXAgdGhlIERPTSB0cmVlIGFuZCBmaW5kIHRoZSBhcHBsaWNhYmxlIGFjdGlvbi5cbiAgICBsZXQgbiA9IHRhcmdldDtcbiAgICB3aGlsZSAobikge1xuICAgICAgaWYgKG9wdF9zdG9wQXQgJiYgbiA9PSBvcHRfc3RvcEF0KSB7XG4gICAgICAgIHJldHVybiBudWxsO1xuICAgICAgfVxuICAgICAgY29uc3QgYWN0aW9uSW5mb3MgPSB0aGlzLm1hdGNoQWN0aW9uSW5mb3NfKG4sIGFjdGlvbkV2ZW50VHlwZSk7XG4gICAgICBpZiAoYWN0aW9uSW5mb3MgJiYgaXNFbmFibGVkKG4pKSB7XG4gICAgICAgIHJldHVybiB7bm9kZTogbiwgYWN0aW9uSW5mb3M6IGRldkFzc2VydChhY3Rpb25JbmZvcyl9O1xuICAgICAgfVxuICAgICAgbiA9IG4ucGFyZW50RWxlbWVudDtcbiAgICB9XG4gICAgcmV0dXJuIG51bGw7XG4gIH1cblxuICAvKipcbiAgICogQHBhcmFtIHshRWxlbWVudH0gbm9kZVxuICAgKiBAcGFyYW0ge3N0cmluZ30gYWN0aW9uRXZlbnRUeXBlXG4gICAqIEByZXR1cm4gez9BcnJheTwhQWN0aW9uSW5mb0RlZj59XG4gICAqL1xuICBtYXRjaEFjdGlvbkluZm9zXyhub2RlLCBhY3Rpb25FdmVudFR5cGUpIHtcbiAgICBjb25zdCBhY3Rpb25NYXAgPSB0aGlzLmdldEFjdGlvbk1hcF8obm9kZSwgYWN0aW9uRXZlbnRUeXBlKTtcbiAgICBpZiAoIWFjdGlvbk1hcCkge1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuICAgIHJldHVybiBhY3Rpb25NYXBbYWN0aW9uRXZlbnRUeXBlXSB8fCBudWxsO1xuICB9XG5cbiAgLyoqXG4gICAqIEBwYXJhbSB7IUVsZW1lbnR9IG5vZGVcbiAgICogQHBhcmFtIHtzdHJpbmd9IGFjdGlvbkV2ZW50VHlwZVxuICAgKiBAcmV0dXJuIHs/T2JqZWN0PHN0cmluZywgIUFycmF5PCFBY3Rpb25JbmZvRGVmPj59XG4gICAqL1xuICBnZXRBY3Rpb25NYXBfKG5vZGUsIGFjdGlvbkV2ZW50VHlwZSkge1xuICAgIGxldCBhY3Rpb25NYXAgPSBub2RlW0FDVElPTl9NQVBfXTtcbiAgICBpZiAoYWN0aW9uTWFwID09PSB1bmRlZmluZWQpIHtcbiAgICAgIGFjdGlvbk1hcCA9IG51bGw7XG4gICAgICBpZiAobm9kZS5oYXNBdHRyaWJ1dGUoJ29uJykpIHtcbiAgICAgICAgY29uc3QgYWN0aW9uID0gbm9kZS5nZXRBdHRyaWJ1dGUoJ29uJyk7XG4gICAgICAgIGFjdGlvbk1hcCA9IHBhcnNlQWN0aW9uTWFwKGFjdGlvbiwgbm9kZSk7XG4gICAgICAgIG5vZGVbQUNUSU9OX01BUF9dID0gYWN0aW9uTWFwO1xuICAgICAgfSBlbHNlIGlmIChub2RlLmhhc0F0dHJpYnV0ZSgnZXhlY3V0ZScpKSB7XG4gICAgICAgIGNvbnN0IGFjdGlvbiA9IG5vZGUuZ2V0QXR0cmlidXRlKCdleGVjdXRlJyk7XG4gICAgICAgIGFjdGlvbk1hcCA9IHBhcnNlQWN0aW9uTWFwKGAke2FjdGlvbkV2ZW50VHlwZX06JHthY3Rpb259YCwgbm9kZSk7XG4gICAgICAgIG5vZGVbQUNUSU9OX01BUF9dID0gYWN0aW9uTWFwO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gYWN0aW9uTWFwO1xuICB9XG5cbiAgLyoqXG4gICAqIFJlc2V0cyBhIG5vZGUncyBhY3Rpb25zIHdpdGggdGhvc2UgZGVmaW5lZCBpbiB0aGUgZ2l2ZW4gYWN0aW9ucyBzdHJpbmcuXG4gICAqIEBwYXJhbSB7IUVsZW1lbnR9IG5vZGVcbiAgICogQHBhcmFtIHtzdHJpbmd9IGFjdGlvbnNTdHJcbiAgICovXG4gIHNldEFjdGlvbnMobm9kZSwgYWN0aW9uc1N0cikge1xuICAgIG5vZGUuc2V0QXR0cmlidXRlKCdvbicsIGFjdGlvbnNTdHIpO1xuXG4gICAgLy8gQ2xlYXIgY2FjaGUuXG4gICAgZGVsZXRlIG5vZGVbQUNUSU9OX01BUF9dO1xuICB9XG5cbiAgLyoqXG4gICAqIEdpdmVuIGEgYnJvd3NlciAnY2hhbmdlJyBvciAnaW5wdXQnIGV2ZW50LCBhZGQgYGRldGFpbGAgcHJvcGVydHkgdG8gaXRcbiAgICogY29udGFpbmluZyBhbGxvd2xpc3RlZCBwcm9wZXJ0aWVzIG9mIHRoZSB0YXJnZXQgZWxlbWVudC4gTm9vcCBpZiBgZGV0YWlsYFxuICAgKiBpcyByZWFkb25seS5cbiAgICogQHBhcmFtIHshQWN0aW9uRXZlbnREZWZ9IGV2ZW50XG4gICAqIEBwcml2YXRlXG4gICAqL1xuICBhZGRUYXJnZXRQcm9wZXJ0aWVzQXNEZXRhaWxfKGV2ZW50KSB7XG4gICAgY29uc3QgZGV0YWlsID0gLyoqIEB0eXBlIHshSnNvbk9iamVjdH0gKi8gKG1hcCgpKTtcbiAgICBjb25zdCB7dGFyZ2V0fSA9IGV2ZW50O1xuXG4gICAgaWYgKHRhcmdldC52YWx1ZSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICBkZXRhaWxbJ3ZhbHVlJ10gPSB0YXJnZXQudmFsdWU7XG4gICAgfVxuXG4gICAgLy8gQ2hlY2sgdGFnTmFtZSBpbnN0ZWFkIHNpbmNlIGB2YWx1ZUFzTnVtYmVyYCBpc24ndCBzdXBwb3J0ZWQgb24gSUUuXG4gICAgaWYgKHRhcmdldC50YWdOYW1lID09ICdJTlBVVCcpIHtcbiAgICAgIC8vIFByb2JhYmx5IHN1cHBvcnRlZCBuYXRpdmVseSBidXQgY29udmVydCBhbnl3YXlzIGZvciBjb25zaXN0ZW5jeS5cbiAgICAgIGRldGFpbFsndmFsdWVBc051bWJlciddID0gTnVtYmVyKHRhcmdldC52YWx1ZSk7XG4gICAgfVxuXG4gICAgaWYgKHRhcmdldC5jaGVja2VkICE9PSB1bmRlZmluZWQpIHtcbiAgICAgIGRldGFpbFsnY2hlY2tlZCddID0gdGFyZ2V0LmNoZWNrZWQ7XG4gICAgfVxuXG4gICAgaWYgKHRhcmdldC5taW4gIT09IHVuZGVmaW5lZCB8fCB0YXJnZXQubWF4ICE9PSB1bmRlZmluZWQpIHtcbiAgICAgIGRldGFpbFsnbWluJ10gPSB0YXJnZXQubWluO1xuICAgICAgZGV0YWlsWydtYXgnXSA9IHRhcmdldC5tYXg7XG4gICAgfVxuXG4gICAgaWYgKHRhcmdldC5maWxlcykge1xuICAgICAgZGV0YWlsWydmaWxlcyddID0gdG9BcnJheSh0YXJnZXQuZmlsZXMpLm1hcCgoZmlsZSkgPT4gKHtcbiAgICAgICAgJ25hbWUnOiBmaWxlLm5hbWUsXG4gICAgICAgICdzaXplJzogZmlsZS5zaXplLFxuICAgICAgICAndHlwZSc6IGZpbGUudHlwZSxcbiAgICAgIH0pKTtcbiAgICB9XG5cbiAgICBpZiAoT2JqZWN0LmtleXMoZGV0YWlsKS5sZW5ndGggPiAwKSB7XG4gICAgICB0cnkge1xuICAgICAgICBldmVudC5kZXRhaWwgPSBkZXRhaWw7XG4gICAgICB9IGNhdGNoIHt9IC8vIGV2ZW50LmRldGFpbCBpcyByZWFkb25seVxuICAgIH1cbiAgfVxufVxuXG4vKipcbiAqIEBwYXJhbSB7c3RyaW5nfSBsb3dlcmNhc2VUYWdOYW1lXG4gKiBAcmV0dXJuIHtib29sZWFufVxuICogQHByaXZhdGVcbiAqL1xuZnVuY3Rpb24gaXNBbXBUYWdOYW1lKGxvd2VyY2FzZVRhZ05hbWUpIHtcbiAgcmV0dXJuIGxvd2VyY2FzZVRhZ05hbWUuc3Vic3RyaW5nKDAsIDQpID09PSAnYW1wLSc7XG59XG5cbi8qKlxuICogUmV0dXJucyBgdHJ1ZWAgaWYgdGhlIGdpdmVuIGFjdGlvbiBpbnZvY2F0aW9uIGlzIGFsbG93bGlzdGVkIGluIHRoZSBnaXZlblxuICogYWxsb3dsaXN0LiBEZWZhdWx0IGFjdGlvbnMnIGFsaWFzLCAnYWN0aXZhdGUnLCBhcmUgYXV0b21hdGljYWxseVxuICogYWxsb3dsaXN0ZWQgaWYgdGhlaXIgY29ycmVzcG9uZGluZyByZWdpc3RlcmVkIGFsaWFzIGlzIGFsbG93bGlzdGVkLlxuICogQHBhcmFtIHshQWN0aW9uSW52b2NhdGlvbn0gaW52b2NhdGlvblxuICogQHBhcmFtIHshQXJyYXk8e3RhZ09yVGFyZ2V0OiBzdHJpbmcsIG1ldGhvZDogc3RyaW5nfT59IGFsbG93bGlzdFxuICogQHJldHVybiB7Ym9vbGVhbn1cbiAqIEBwcml2YXRlXG4gKi9cbmZ1bmN0aW9uIGlzQWN0aW9uQWxsb3dsaXN0ZWQoaW52b2NhdGlvbiwgYWxsb3dsaXN0KSB7XG4gIGxldCB7bWV0aG9kfSA9IGludm9jYXRpb247XG4gIGNvbnN0IHtub2RlLCB0YWdPclRhcmdldH0gPSBpbnZvY2F0aW9uO1xuICAvLyBVc2UgYWxpYXMgaWYgZGVmYXVsdCBhY3Rpb24gaXMgaW52b2tlZC5cbiAgaWYgKFxuICAgIG1ldGhvZCA9PT0gREVGQVVMVF9BQ1RJT04gJiZcbiAgICB0eXBlb2Ygbm9kZS5nZXREZWZhdWx0QWN0aW9uQWxpYXMgPT0gJ2Z1bmN0aW9uJ1xuICApIHtcbiAgICBtZXRob2QgPSBub2RlLmdldERlZmF1bHRBY3Rpb25BbGlhcygpO1xuICB9XG4gIGNvbnN0IGxjTWV0aG9kID0gbWV0aG9kLnRvTG93ZXJDYXNlKCk7XG4gIGNvbnN0IGxjVGFnT3JUYXJnZXQgPSB0YWdPclRhcmdldC50b0xvd2VyQ2FzZSgpO1xuICByZXR1cm4gYWxsb3dsaXN0LnNvbWUoKHcpID0+IHtcbiAgICBpZiAoXG4gICAgICB3LnRhZ09yVGFyZ2V0LnRvTG93ZXJDYXNlKCkgPT09IGxjVGFnT3JUYXJnZXQgfHxcbiAgICAgIHcudGFnT3JUYXJnZXQgPT09ICcqJ1xuICAgICkge1xuICAgICAgaWYgKHcubWV0aG9kLnRvTG93ZXJDYXNlKCkgPT09IGxjTWV0aG9kKSB7XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gZmFsc2U7XG4gIH0pO1xufVxuXG4vKipcbiAqIEEgY2xvbmUgb2YgYW4gZXZlbnQgb2JqZWN0IHdpdGggaXRzIGZ1bmN0aW9uIHByb3BlcnRpZXMgcmVwbGFjZWQuXG4gKiBUaGlzIGlzIHVzZWZ1bCBlLmcuIGZvciBldmVudCBvYmplY3RzIHRoYXQgbmVlZCB0byBiZSBwYXNzZWQgdG8gYW4gYXN5bmNcbiAqIGNvbnRleHQsIGJ1dCB0aGUgYnJvd3NlciBtaWdodCBoYXZlIGNsZWFuZWQgdXAgdGhlIG9yaWdpbmFsIGV2ZW50IG9iamVjdC5cbiAqIFRoaXMgY2xvbmUgcmVwbGFjZXMgZnVuY3Rpb25zIHdpdGggZXJyb3IgdGhyb3dzIHNpbmNlIHRoZXkgd29uJ3QgYmVoYXZlXG4gKiBub3JtYWxseSBhZnRlciB0aGUgb3JpZ2luYWwgb2JqZWN0IGhhcyBiZWVuIGRlc3Ryb3llZC5cbiAqIEBwcml2YXRlIHZpc2libGUgZm9yIHRlc3RpbmdcbiAqL1xuZXhwb3J0IGNsYXNzIERlZmVycmVkRXZlbnQge1xuICAvKipcbiAgICogQHBhcmFtIHshRXZlbnR9IGV2ZW50XG4gICAqL1xuICBjb25zdHJ1Y3RvcihldmVudCkge1xuICAgIC8qKiBAdHlwZSB7P09iamVjdH0gKi9cbiAgICB0aGlzLmRldGFpbCA9IG51bGw7XG5cbiAgICBjbG9uZVdpdGhvdXRGdW5jdGlvbnMoZXZlbnQsIHRoaXMpO1xuICB9XG59XG5cbi8qKlxuICogQ2xvbmVzIGFuIG9iamVjdCBhbmQgcmVwbGFjZXMgaXRzIGZ1bmN0aW9uIHByb3BlcnRpZXMgd2l0aCB0aHJvd3MuXG4gKiBAcGFyYW0geyFUfSBvcmlnaW5hbFxuICogQHBhcmFtIHshVD19IG9wdF9kZXN0XG4gKiBAcmV0dXJuIHshVH1cbiAqIEB0ZW1wbGF0ZSBUXG4gKiBAcHJpdmF0ZVxuICovXG5mdW5jdGlvbiBjbG9uZVdpdGhvdXRGdW5jdGlvbnMob3JpZ2luYWwsIG9wdF9kZXN0KSB7XG4gIGNvbnN0IGNsb25lID0gb3B0X2Rlc3QgfHwgbWFwKCk7XG4gIGZvciAoY29uc3QgcHJvcCBpbiBvcmlnaW5hbCkge1xuICAgIGNvbnN0IHZhbHVlID0gb3JpZ2luYWxbcHJvcF07XG4gICAgaWYgKHR5cGVvZiB2YWx1ZSA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgY2xvbmVbcHJvcF0gPSBub3RJbXBsZW1lbnRlZDtcbiAgICB9IGVsc2Uge1xuICAgICAgY2xvbmVbcHJvcF0gPSBvcmlnaW5hbFtwcm9wXTtcbiAgICB9XG4gIH1cbiAgcmV0dXJuIGNsb25lO1xufVxuXG4vKiogQHByaXZhdGUgKi9cbmZ1bmN0aW9uIG5vdEltcGxlbWVudGVkKCkge1xuICBkZXZBc3NlcnQobnVsbCwgJ0RlZmVycmVkIGV2ZW50cyBjYW5ub3QgYWNjZXNzIG5hdGl2ZSBldmVudCBmdW5jdGlvbnMuJyk7XG59XG5cbi8qKlxuICogQHBhcmFtIHtzdHJpbmd9IGFjdGlvblxuICogQHBhcmFtIHshRWxlbWVudH0gY29udGV4dFxuICogQHJldHVybiB7P09iamVjdDxzdHJpbmcsICFBcnJheTwhQWN0aW9uSW5mb0RlZj4+fVxuICogQHByaXZhdGUgVmlzaWJsZSBmb3IgdGVzdGluZyBvbmx5LlxuICovXG5leHBvcnQgZnVuY3Rpb24gcGFyc2VBY3Rpb25NYXAoYWN0aW9uLCBjb250ZXh0KSB7XG4gIGNvbnN0IGFzc2VydEFjdGlvbiA9IGFzc2VydEFjdGlvbkZvclBhcnNlci5iaW5kKG51bGwsIGFjdGlvbiwgY29udGV4dCk7XG4gIGNvbnN0IGFzc2VydFRva2VuID0gYXNzZXJ0VG9rZW5Gb3JQYXJzZXIuYmluZChudWxsLCBhY3Rpb24sIGNvbnRleHQpO1xuXG4gIGxldCBhY3Rpb25NYXAgPSBudWxsO1xuXG4gIGNvbnN0IHRva3MgPSBuZXcgUGFyc2VyVG9rZW5pemVyKGFjdGlvbik7XG4gIGxldCB0b2s7XG4gIGxldCBwZWVrO1xuICBkbyB7XG4gICAgdG9rID0gdG9rcy5uZXh0KCk7XG4gICAgaWYgKFxuICAgICAgdG9rLnR5cGUgPT0gVG9rZW5UeXBlLkVPRiB8fFxuICAgICAgKHRvay50eXBlID09IFRva2VuVHlwZS5TRVBBUkFUT1IgJiYgdG9rLnZhbHVlID09ICc7JylcbiAgICApIHtcbiAgICAgIC8vIEV4cGVjdGVkLCBpZ25vcmUuXG4gICAgfSBlbHNlIGlmICh0b2sudHlwZSA9PSBUb2tlblR5cGUuTElURVJBTCB8fCB0b2sudHlwZSA9PSBUb2tlblR5cGUuSUQpIHtcbiAgICAgIC8vIEZvcm1hdDogZXZlbnQ6dGFyZ2V0Lm1ldGhvZFxuXG4gICAgICAvLyBFdmVudDogXCJldmVudDpcIlxuICAgICAgY29uc3QgZXZlbnQgPSB0b2sudmFsdWU7XG5cbiAgICAgIC8vIFRhcmdldDogXCI6dGFyZ2V0LlwiIHNlcGFyYXRvclxuICAgICAgYXNzZXJ0VG9rZW4odG9rcy5uZXh0KCksIFtUb2tlblR5cGUuU0VQQVJBVE9SXSwgJzonKTtcblxuICAgICAgY29uc3QgYWN0aW9ucyA9IFtdO1xuXG4gICAgICAvLyBIYW5kbGVycyBmb3IgZXZlbnQuXG4gICAgICBkbyB7XG4gICAgICAgIGNvbnN0IHRhcmdldCA9IGFzc2VydFRva2VuKHRva3MubmV4dCgpLCBbXG4gICAgICAgICAgVG9rZW5UeXBlLkxJVEVSQUwsXG4gICAgICAgICAgVG9rZW5UeXBlLklELFxuICAgICAgICBdKS52YWx1ZTtcblxuICAgICAgICAvLyBNZXRob2Q6IFwiLm1ldGhvZFwiLiBNZXRob2QgaXMgb3B0aW9uYWwuXG4gICAgICAgIGxldCBtZXRob2QgPSBERUZBVUxUX0FDVElPTjtcbiAgICAgICAgbGV0IGFyZ3MgPSBudWxsO1xuXG4gICAgICAgIHBlZWsgPSB0b2tzLnBlZWsoKTtcbiAgICAgICAgaWYgKHBlZWsudHlwZSA9PSBUb2tlblR5cGUuU0VQQVJBVE9SICYmIHBlZWsudmFsdWUgPT0gJy4nKSB7XG4gICAgICAgICAgdG9rcy5uZXh0KCk7IC8vIFNraXAgJy4nXG4gICAgICAgICAgbWV0aG9kID1cbiAgICAgICAgICAgIGFzc2VydFRva2VuKHRva3MubmV4dCgpLCBbVG9rZW5UeXBlLkxJVEVSQUwsIFRva2VuVHlwZS5JRF0pLnZhbHVlIHx8XG4gICAgICAgICAgICBtZXRob2Q7XG5cbiAgICAgICAgICAvLyBPcHRpb25hbGx5LCB0aGVyZSBtYXkgYmUgYXJndW1lbnRzOiBcIihrZXkgPSB2YWx1ZSwga2V5ID0gdmFsdWUpXCIuXG4gICAgICAgICAgcGVlayA9IHRva3MucGVlaygpO1xuICAgICAgICAgIGlmIChwZWVrLnR5cGUgPT0gVG9rZW5UeXBlLlNFUEFSQVRPUiAmJiBwZWVrLnZhbHVlID09ICcoJykge1xuICAgICAgICAgICAgdG9rcy5uZXh0KCk7IC8vIFNraXAgJygnXG4gICAgICAgICAgICBhcmdzID0gdG9rZW5pemVNZXRob2RBcmd1bWVudHModG9rcywgYXNzZXJ0VG9rZW4sIGFzc2VydEFjdGlvbik7XG4gICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgYWN0aW9ucy5wdXNoKHtcbiAgICAgICAgICBldmVudCxcbiAgICAgICAgICB0YXJnZXQsXG4gICAgICAgICAgbWV0aG9kLFxuICAgICAgICAgIGFyZ3M6XG4gICAgICAgICAgICBhcmdzICYmIGdldE1vZGUoKS50ZXN0ICYmIE9iamVjdC5mcmVlemVcbiAgICAgICAgICAgICAgPyBPYmplY3QuZnJlZXplKGFyZ3MpXG4gICAgICAgICAgICAgIDogYXJncyxcbiAgICAgICAgICBzdHI6IGFjdGlvbixcbiAgICAgICAgfSk7XG5cbiAgICAgICAgcGVlayA9IHRva3MucGVlaygpO1xuICAgICAgfSB3aGlsZSAoXG4gICAgICAgIHBlZWsudHlwZSA9PSBUb2tlblR5cGUuU0VQQVJBVE9SICYmXG4gICAgICAgIHBlZWsudmFsdWUgPT0gJywnICYmXG4gICAgICAgIHRva3MubmV4dCgpXG4gICAgICApOyAvLyBza2lwIFwiLFwiIHdoZW4gZm91bmRcblxuICAgICAgaWYgKCFhY3Rpb25NYXApIHtcbiAgICAgICAgYWN0aW9uTWFwID0gbWFwKCk7XG4gICAgICB9XG5cbiAgICAgIGFjdGlvbk1hcFtldmVudF0gPSBhY3Rpb25zO1xuICAgIH0gZWxzZSB7XG4gICAgICAvLyBVbmV4cGVjdGVkIHRva2VuLlxuICAgICAgYXNzZXJ0QWN0aW9uKGZhbHNlLCBgOyB1bmV4cGVjdGVkIHRva2VuIFske3Rvay52YWx1ZSB8fCAnJ31dYCk7XG4gICAgfVxuICB9IHdoaWxlICh0b2sudHlwZSAhPSBUb2tlblR5cGUuRU9GKTtcblxuICByZXR1cm4gYWN0aW9uTWFwO1xufVxuXG4vKipcbiAqIFRva2VuaXplcyBhbmQgcmV0dXJucyBtZXRob2QgYXJndW1lbnRzLCBlLmcuIHRhcmdldC5tZXRob2QoYXJndW1lbnRzKS5cbiAqIEBwYXJhbSB7IVBhcnNlclRva2VuaXplcn0gdG9rc1xuICogQHBhcmFtIHshRnVuY3Rpb259IGFzc2VydFRva2VuXG4gKiBAcGFyYW0geyFGdW5jdGlvbn0gYXNzZXJ0QWN0aW9uXG4gKiBAcmV0dXJuIHs/QWN0aW9uSW5mb0FyZ3NEZWZ9XG4gKiBAcHJpdmF0ZVxuICovXG5mdW5jdGlvbiB0b2tlbml6ZU1ldGhvZEFyZ3VtZW50cyh0b2tzLCBhc3NlcnRUb2tlbiwgYXNzZXJ0QWN0aW9uKSB7XG4gIGxldCBwZWVrID0gdG9rcy5wZWVrKCk7XG4gIGxldCB0b2s7XG4gIGxldCBhcmdzID0gbnVsbDtcbiAgLy8gT2JqZWN0IGxpdGVyYWwuIEZvcm1hdDogey4uLn1cbiAgaWYgKHBlZWsudHlwZSA9PSBUb2tlblR5cGUuT0JKRUNUKSB7XG4gICAgLy8gRG9uJ3QgcGFyc2Ugb2JqZWN0IGxpdGVyYWxzLiBUb2tlbml6ZSBhcyBhIHNpbmdsZSBleHByZXNzaW9uXG4gICAgLy8gZnJhZ21lbnQgYW5kIGRlbGVnYXRlIHRvIHNwZWNpZmljIGFjdGlvbiBoYW5kbGVyLlxuICAgIGFyZ3MgPSBtYXAoKTtcbiAgICBjb25zdCB7dmFsdWV9ID0gdG9rcy5uZXh0KCk7XG4gICAgYXJnc1tSQVdfT0JKRUNUX0FSR1NfS0VZXSA9IHZhbHVlO1xuICAgIGFzc2VydFRva2VuKHRva3MubmV4dCgpLCBbVG9rZW5UeXBlLlNFUEFSQVRPUl0sICcpJyk7XG4gIH0gZWxzZSB7XG4gICAgLy8gS2V5LXZhbHVlIHBhaXJzLiBGb3JtYXQ6IGtleSA9IHZhbHVlLCAuLi4uXG4gICAgZG8ge1xuICAgICAgdG9rID0gdG9rcy5uZXh0KCk7XG4gICAgICBjb25zdCB7dHlwZSwgdmFsdWV9ID0gdG9rO1xuICAgICAgaWYgKHR5cGUgPT0gVG9rZW5UeXBlLlNFUEFSQVRPUiAmJiAodmFsdWUgPT0gJywnIHx8IHZhbHVlID09ICcpJykpIHtcbiAgICAgICAgLy8gRXhwZWN0ZWQ6IGlnbm9yZS5cbiAgICAgIH0gZWxzZSBpZiAodHlwZSA9PSBUb2tlblR5cGUuTElURVJBTCB8fCB0eXBlID09IFRva2VuVHlwZS5JRCkge1xuICAgICAgICAvLyBLZXk6IFwia2V5ID0gXCJcbiAgICAgICAgYXNzZXJ0VG9rZW4odG9rcy5uZXh0KCksIFtUb2tlblR5cGUuU0VQQVJBVE9SXSwgJz0nKTtcbiAgICAgICAgLy8gVmFsdWUgaXMgZWl0aGVyIGEgbGl0ZXJhbCBvciBhbiBleHByZXNzaW9uOiBcImZvby5iYXIuYmF6XCJcbiAgICAgICAgdG9rID0gYXNzZXJ0VG9rZW4odG9rcy5uZXh0KC8qIGNvbnZlcnRWYWx1ZSAqLyB0cnVlKSwgW1xuICAgICAgICAgIFRva2VuVHlwZS5MSVRFUkFMLFxuICAgICAgICAgIFRva2VuVHlwZS5JRCxcbiAgICAgICAgXSk7XG4gICAgICAgIGNvbnN0IGFyZ1ZhbHVlVG9rZW5zID0gW3Rva107XG4gICAgICAgIC8vIEV4cHJlc3Npb25zIGhhdmUgb25lIG9yIG1vcmUgZGVyZWZlcmVuY2VzOiBcIi5pZGVudGlmaWVyXCJcbiAgICAgICAgaWYgKHRvay50eXBlID09IFRva2VuVHlwZS5JRCkge1xuICAgICAgICAgIGZvciAoXG4gICAgICAgICAgICBwZWVrID0gdG9rcy5wZWVrKCk7XG4gICAgICAgICAgICBwZWVrLnR5cGUgPT0gVG9rZW5UeXBlLlNFUEFSQVRPUiAmJiBwZWVrLnZhbHVlID09ICcuJztcbiAgICAgICAgICAgIHBlZWsgPSB0b2tzLnBlZWsoKVxuICAgICAgICAgICkge1xuICAgICAgICAgICAgdG9rcy5uZXh0KCk7IC8vIFNraXAgJy4nLlxuICAgICAgICAgICAgdG9rID0gYXNzZXJ0VG9rZW4odG9rcy5uZXh0KGZhbHNlKSwgW1Rva2VuVHlwZS5JRF0pO1xuICAgICAgICAgICAgYXJnVmFsdWVUb2tlbnMucHVzaCh0b2spO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBjb25zdCBhcmdWYWx1ZSA9IGFyZ1ZhbHVlRm9yVG9rZW5zKGFyZ1ZhbHVlVG9rZW5zKTtcbiAgICAgICAgaWYgKCFhcmdzKSB7XG4gICAgICAgICAgYXJncyA9IG1hcCgpO1xuICAgICAgICB9XG4gICAgICAgIGFyZ3NbdmFsdWVdID0gYXJnVmFsdWU7XG4gICAgICAgIHBlZWsgPSB0b2tzLnBlZWsoKTtcbiAgICAgICAgYXNzZXJ0QWN0aW9uKFxuICAgICAgICAgIHBlZWsudHlwZSA9PSBUb2tlblR5cGUuU0VQQVJBVE9SICYmXG4gICAgICAgICAgICAocGVlay52YWx1ZSA9PSAnLCcgfHwgcGVlay52YWx1ZSA9PSAnKScpLFxuICAgICAgICAgICdFeHBlY3RlZCBlaXRoZXIgWyxdIG9yIFspXSdcbiAgICAgICAgKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIC8vIFVuZXhwZWN0ZWQgdG9rZW4uXG4gICAgICAgIGFzc2VydEFjdGlvbihmYWxzZSwgYDsgdW5leHBlY3RlZCB0b2tlbiBbJHt0b2sudmFsdWUgfHwgJyd9XWApO1xuICAgICAgfVxuICAgIH0gd2hpbGUgKCEodG9rLnR5cGUgPT0gVG9rZW5UeXBlLlNFUEFSQVRPUiAmJiB0b2sudmFsdWUgPT0gJyknKSk7XG4gIH1cbiAgcmV0dXJuIGFyZ3M7XG59XG5cbi8qKlxuICogQHBhcmFtIHtBcnJheTwhVG9rZW5EZWY+fSB0b2tlbnNcbiAqIEByZXR1cm4gez9BY3Rpb25JbmZvQXJnVmFsdWVEZWZ9XG4gKiBAcHJpdmF0ZVxuICovXG5mdW5jdGlvbiBhcmdWYWx1ZUZvclRva2Vucyh0b2tlbnMpIHtcbiAgaWYgKHRva2Vucy5sZW5ndGggPT0gMCkge1xuICAgIHJldHVybiBudWxsO1xuICB9IGVsc2UgaWYgKHRva2Vucy5sZW5ndGggPT0gMSkge1xuICAgIHJldHVybiAvKiogQHR5cGUgeyhib29sZWFufG51bWJlcnxzdHJpbmcpfSAqLyAodG9rZW5zWzBdLnZhbHVlKTtcbiAgfSBlbHNlIHtcbiAgICBjb25zdCB2YWx1ZXMgPSB0b2tlbnMubWFwKCh0b2tlbikgPT4gdG9rZW4udmFsdWUpO1xuICAgIGNvbnN0IGV4cHJlc3Npb24gPSB2YWx1ZXMuam9pbignLicpO1xuICAgIHJldHVybiAvKiogQHR5cGUge0FjdGlvbkluZm9BcmdFeHByZXNzaW9uRGVmfSAqLyAoe2V4cHJlc3Npb259KTtcbiAgfVxufVxuXG4vKipcbiAqIERlcmVmZXJlbmNlcyBleHByZXNzaW9uIGFyZ3MgaW4gYGFyZ3NgIHVzaW5nIHZhbHVlcyBpbiBkYXRhLlxuICogQHBhcmFtIHs/QWN0aW9uSW5mb0FyZ3NEZWZ9IGFyZ3NcbiAqIEBwYXJhbSB7P0FjdGlvbkV2ZW50RGVmfSBldmVudFxuICogQHBhcmFtIHs/SnNvbk9iamVjdD19IG9wdF9hcmdzXG4gKiBAcmV0dXJuIHs/SnNvbk9iamVjdH1cbiAqIEBwcml2YXRlXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBkZXJlZmVyZW5jZUFyZ3NWYXJpYWJsZXMoYXJncywgZXZlbnQsIG9wdF9hcmdzKSB7XG4gIGlmICghYXJncykge1xuICAgIHJldHVybiBhcmdzO1xuICB9XG4gIGNvbnN0IGRhdGEgPSBvcHRfYXJncyB8fCBkaWN0KHt9KTtcbiAgaWYgKGV2ZW50KSB7XG4gICAgY29uc3QgZGV0YWlsID0gZ2V0RGV0YWlsKC8qKiBAdHlwZSB7IUV2ZW50fSAqLyAoZXZlbnQpKTtcbiAgICBpZiAoZGV0YWlsKSB7XG4gICAgICBkYXRhWydldmVudCddID0gZGV0YWlsO1xuICAgIH1cbiAgfVxuICBjb25zdCBhcHBsaWVkID0gbWFwKCk7XG4gIE9iamVjdC5rZXlzKGFyZ3MpLmZvckVhY2goKGtleSkgPT4ge1xuICAgIGxldCB2YWx1ZSA9IGFyZ3Nba2V5XTtcbiAgICAvLyBPbmx5IEpTT04gZXhwcmVzc2lvbiBzdHJpbmdzIHRoYXQgY29udGFpbiBkZXJlZmVyZW5jZXMgKGUuZy4gYGZvby5iYXJgKVxuICAgIC8vIGFyZSBwcm9jZXNzZWQgYXMgQWN0aW9uSW5mb0FyZ0V4cHJlc3Npb25EZWYuIFdlIGFsc28gc3VwcG9ydFxuICAgIC8vIGRlcmVmZXJlbmNpbmcgc3RyaW5ncyBsaWtlIGBmb29gIGlmZiB0aGVyZSBpcyBhIGNvcnJlc3BvbmRpbmcga2V5IGluXG4gICAgLy8gYGRhdGFgLiBPdGhlcndpc2UsIGBmb29gIGlzIHRyZWF0ZWQgYXMgYSBzdHJpbmcgXCJmb29cIi5cbiAgICBpZiAodHlwZW9mIHZhbHVlID09ICdvYmplY3QnICYmIHZhbHVlLmV4cHJlc3Npb24pIHtcbiAgICAgIGNvbnN0IGV4cHIgPSAvKiogQHR5cGUge0FjdGlvbkluZm9BcmdFeHByZXNzaW9uRGVmfSAqLyAodmFsdWUpLmV4cHJlc3Npb247XG4gICAgICBjb25zdCBleHByVmFsdWUgPSBnZXRWYWx1ZUZvckV4cHIoZGF0YSwgZXhwcik7XG4gICAgICAvLyBJZiBleHByIGNhbid0IGJlIGZvdW5kIGluIGRhdGEsIHVzZSBudWxsIGluc3RlYWQgb2YgdW5kZWZpbmVkLlxuICAgICAgdmFsdWUgPSBleHByVmFsdWUgPT09IHVuZGVmaW5lZCA/IG51bGwgOiBleHByVmFsdWU7XG4gICAgfVxuICAgIGlmIChkYXRhW3ZhbHVlXSkge1xuICAgICAgYXBwbGllZFtrZXldID0gZGF0YVt2YWx1ZV07XG4gICAgfSBlbHNlIHtcbiAgICAgIGFwcGxpZWRba2V5XSA9IHZhbHVlO1xuICAgIH1cbiAgfSk7XG4gIHJldHVybiBhcHBsaWVkO1xufVxuXG4vKipcbiAqIEBwYXJhbSB7c3RyaW5nfSBzXG4gKiBAcGFyYW0geyFFbGVtZW50fSBjb250ZXh0XG4gKiBAcGFyYW0gez9UfSBjb25kaXRpb25cbiAqIEBwYXJhbSB7c3RyaW5nPX0gb3B0X21lc3NhZ2VcbiAqIEByZXR1cm4ge1R9XG4gKiBAdGVtcGxhdGUgVFxuICogQHByaXZhdGVcbiAqL1xuZnVuY3Rpb24gYXNzZXJ0QWN0aW9uRm9yUGFyc2VyKHMsIGNvbnRleHQsIGNvbmRpdGlvbiwgb3B0X21lc3NhZ2UpIHtcbiAgcmV0dXJuIHVzZXJBc3NlcnQoXG4gICAgY29uZGl0aW9uLFxuICAgICdJbnZhbGlkIGFjdGlvbiBkZWZpbml0aW9uIGluICVzOiBbJXNdICVzJyxcbiAgICBjb250ZXh0LFxuICAgIHMsXG4gICAgb3B0X21lc3NhZ2UgfHwgJydcbiAgKTtcbn1cblxuLyoqXG4gKiBAcGFyYW0ge3N0cmluZ30gc1xuICogQHBhcmFtIHshRWxlbWVudH0gY29udGV4dFxuICogQHBhcmFtIHshVG9rZW5EZWZ9IHRva1xuICogQHBhcmFtIHtBcnJheTxUb2tlblR5cGU+fSB0eXBlc1xuICogQHBhcmFtIHsqPX0gb3B0X3ZhbHVlXG4gKiBAcmV0dXJuIHshVG9rZW5EZWZ9XG4gKiBAcHJpdmF0ZVxuICovXG5mdW5jdGlvbiBhc3NlcnRUb2tlbkZvclBhcnNlcihzLCBjb250ZXh0LCB0b2ssIHR5cGVzLCBvcHRfdmFsdWUpIHtcbiAgaWYgKG9wdF92YWx1ZSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgYXNzZXJ0QWN0aW9uRm9yUGFyc2VyKFxuICAgICAgcyxcbiAgICAgIGNvbnRleHQsXG4gICAgICB0eXBlcy5pbmNsdWRlcyh0b2sudHlwZSkgJiYgdG9rLnZhbHVlID09IG9wdF92YWx1ZSxcbiAgICAgIGA7IGV4cGVjdGVkIFske29wdF92YWx1ZX1dYFxuICAgICk7XG4gIH0gZWxzZSB7XG4gICAgYXNzZXJ0QWN0aW9uRm9yUGFyc2VyKHMsIGNvbnRleHQsIHR5cGVzLmluY2x1ZGVzKHRvay50eXBlKSk7XG4gIH1cbiAgcmV0dXJuIHRvaztcbn1cblxuLyoqXG4gKiBAZW51bSB7bnVtYmVyfVxuICovXG5jb25zdCBUb2tlblR5cGUgPSB7XG4gIElOVkFMSUQ6IDAsXG4gIEVPRjogMSxcbiAgU0VQQVJBVE9SOiAyLFxuICBMSVRFUkFMOiAzLFxuICBJRDogNCxcbiAgT0JKRUNUOiA1LFxufTtcblxuLyoqXG4gKiBAdHlwZWRlZiB7e3R5cGU6IFRva2VuVHlwZSwgdmFsdWU6ICp9fVxuICovXG5sZXQgVG9rZW5EZWY7XG5cbi8qKiBAcHJpdmF0ZSBAY29uc3Qge3N0cmluZ30gKi9cbmNvbnN0IFdISVRFU1BBQ0VfU0VUID0gJyBcXHRcXG5cXHJcXGZcXHZcXHUwMEEwXFx1MjAyOFxcdTIwMjknO1xuXG4vKiogQHByaXZhdGUgQGNvbnN0IHtzdHJpbmd9ICovXG5jb25zdCBTRVBBUkFUT1JfU0VUID0gJzs6LigpPSx8ISc7XG5cbi8qKiBAcHJpdmF0ZSBAY29uc3Qge3N0cmluZ30gKi9cbmNvbnN0IFNUUklOR19TRVQgPSAnXCJcXCcnO1xuXG4vKiogQHByaXZhdGUgQGNvbnN0IHtzdHJpbmd9ICovXG5jb25zdCBPQkpFQ1RfU0VUID0gJ3t9JztcblxuLyoqIEBwcml2YXRlIEBjb25zdCB7c3RyaW5nfSAqL1xuY29uc3QgU1BFQ0lBTF9TRVQgPSBXSElURVNQQUNFX1NFVCArIFNFUEFSQVRPUl9TRVQgKyBTVFJJTkdfU0VUICsgT0JKRUNUX1NFVDtcblxuLyoqIEBwcml2YXRlICovXG5jbGFzcyBQYXJzZXJUb2tlbml6ZXIge1xuICAvKipcbiAgICogQHBhcmFtIHtzdHJpbmd9IHN0clxuICAgKi9cbiAgY29uc3RydWN0b3Ioc3RyKSB7XG4gICAgLyoqIEBwcml2YXRlIEBjb25zdCB7c3RyaW5nfSAqL1xuICAgIHRoaXMuc3RyXyA9IHN0cjtcblxuICAgIC8qKiBAcHJpdmF0ZSB7bnVtYmVyfSAqL1xuICAgIHRoaXMuaW5kZXhfID0gLTE7XG4gIH1cblxuICAvKipcbiAgICogUmV0dXJucyB0aGUgbmV4dCB0b2tlbiBhbmQgYWR2YW5jZXMgdGhlIHBvc2l0aW9uLlxuICAgKiBAcGFyYW0ge2Jvb2xlYW49fSBvcHRfY29udmVydFZhbHVlc1xuICAgKiBAcmV0dXJuIHshVG9rZW5EZWZ9XG4gICAqL1xuICBuZXh0KG9wdF9jb252ZXJ0VmFsdWVzKSB7XG4gICAgY29uc3QgdG9rID0gdGhpcy5uZXh0XyhvcHRfY29udmVydFZhbHVlcyB8fCBmYWxzZSk7XG4gICAgdGhpcy5pbmRleF8gPSB0b2suaW5kZXg7XG4gICAgcmV0dXJuIHRvaztcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIHRoZSBuZXh0IHRva2VuIGJ1dCBrZWVwcyB0aGUgY3VycmVudCBwb3NpdGlvbi5cbiAgICogQHBhcmFtIHtib29sZWFuPX0gb3B0X2NvbnZlcnRWYWx1ZXNcbiAgICogQHJldHVybiB7IVRva2VuRGVmfVxuICAgKi9cbiAgcGVlayhvcHRfY29udmVydFZhbHVlcykge1xuICAgIHJldHVybiB0aGlzLm5leHRfKG9wdF9jb252ZXJ0VmFsdWVzIHx8IGZhbHNlKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBAcGFyYW0ge2Jvb2xlYW59IGNvbnZlcnRWYWx1ZXNcbiAgICogQHJldHVybiB7IXt0eXBlOiBUb2tlblR5cGUsIHZhbHVlOiAqLCBpbmRleDogbnVtYmVyfX1cbiAgICovXG4gIG5leHRfKGNvbnZlcnRWYWx1ZXMpIHtcbiAgICBsZXQgbmV3SW5kZXggPSB0aGlzLmluZGV4XyArIDE7XG4gICAgaWYgKG5ld0luZGV4ID49IHRoaXMuc3RyXy5sZW5ndGgpIHtcbiAgICAgIHJldHVybiB7dHlwZTogVG9rZW5UeXBlLkVPRiwgaW5kZXg6IHRoaXMuaW5kZXhffTtcbiAgICB9XG5cbiAgICBsZXQgYyA9IHRoaXMuc3RyXy5jaGFyQXQobmV3SW5kZXgpO1xuXG4gICAgLy8gV2hpdGVzcGFjZTogc3RhbmRhcmQgc2V0LlxuICAgIGlmIChXSElURVNQQUNFX1NFVC5pbmRleE9mKGMpICE9IC0xKSB7XG4gICAgICBuZXdJbmRleCsrO1xuICAgICAgZm9yICg7IG5ld0luZGV4IDwgdGhpcy5zdHJfLmxlbmd0aDsgbmV3SW5kZXgrKykge1xuICAgICAgICBpZiAoV0hJVEVTUEFDRV9TRVQuaW5kZXhPZih0aGlzLnN0cl8uY2hhckF0KG5ld0luZGV4KSkgPT0gLTEpIHtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgaWYgKG5ld0luZGV4ID49IHRoaXMuc3RyXy5sZW5ndGgpIHtcbiAgICAgICAgcmV0dXJuIHt0eXBlOiBUb2tlblR5cGUuRU9GLCBpbmRleDogbmV3SW5kZXh9O1xuICAgICAgfVxuICAgICAgYyA9IHRoaXMuc3RyXy5jaGFyQXQobmV3SW5kZXgpO1xuICAgIH1cblxuICAgIC8vIEEgbnVtZXJpYy4gTm90aWNlIHRoYXQgaXQgc3RlYWxzIHRoZSBgLmAgZnJvbSBzZXBhcmF0b3JzLlxuICAgIGlmIChcbiAgICAgIGNvbnZlcnRWYWx1ZXMgJiZcbiAgICAgIChpc051bShjKSB8fFxuICAgICAgICAoYyA9PSAnLicgJiZcbiAgICAgICAgICBuZXdJbmRleCArIDEgPCB0aGlzLnN0cl8ubGVuZ3RoICYmXG4gICAgICAgICAgaXNOdW0odGhpcy5zdHJfW25ld0luZGV4ICsgMV0pKSlcbiAgICApIHtcbiAgICAgIGxldCBoYXNGcmFjdGlvbiA9IGMgPT0gJy4nO1xuICAgICAgbGV0IGVuZCA9IG5ld0luZGV4ICsgMTtcbiAgICAgIGZvciAoOyBlbmQgPCB0aGlzLnN0cl8ubGVuZ3RoOyBlbmQrKykge1xuICAgICAgICBjb25zdCBjMiA9IHRoaXMuc3RyXy5jaGFyQXQoZW5kKTtcbiAgICAgICAgaWYgKGMyID09ICcuJykge1xuICAgICAgICAgIGhhc0ZyYWN0aW9uID0gdHJ1ZTtcbiAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoIWlzTnVtKGMyKSkge1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICBjb25zdCBzID0gdGhpcy5zdHJfLnN1YnN0cmluZyhuZXdJbmRleCwgZW5kKTtcbiAgICAgIGNvbnN0IHZhbHVlID0gaGFzRnJhY3Rpb24gPyBwYXJzZUZsb2F0KHMpIDogcGFyc2VJbnQocywgMTApO1xuICAgICAgbmV3SW5kZXggPSBlbmQgLSAxO1xuICAgICAgcmV0dXJuIHt0eXBlOiBUb2tlblR5cGUuTElURVJBTCwgdmFsdWUsIGluZGV4OiBuZXdJbmRleH07XG4gICAgfVxuXG4gICAgLy8gRGlmZmVyZW50IHNlcGFyYXRvcnMuXG4gICAgaWYgKFNFUEFSQVRPUl9TRVQuaW5kZXhPZihjKSAhPSAtMSkge1xuICAgICAgcmV0dXJuIHt0eXBlOiBUb2tlblR5cGUuU0VQQVJBVE9SLCB2YWx1ZTogYywgaW5kZXg6IG5ld0luZGV4fTtcbiAgICB9XG5cbiAgICAvLyBTdHJpbmcgbGl0ZXJhbC5cbiAgICBpZiAoU1RSSU5HX1NFVC5pbmRleE9mKGMpICE9IC0xKSB7XG4gICAgICBsZXQgZW5kID0gLTE7XG4gICAgICBmb3IgKGxldCBpID0gbmV3SW5kZXggKyAxOyBpIDwgdGhpcy5zdHJfLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGlmICh0aGlzLnN0cl8uY2hhckF0KGkpID09IGMpIHtcbiAgICAgICAgICBlbmQgPSBpO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICBpZiAoZW5kID09IC0xKSB7XG4gICAgICAgIHJldHVybiB7dHlwZTogVG9rZW5UeXBlLklOVkFMSUQsIGluZGV4OiBuZXdJbmRleH07XG4gICAgICB9XG4gICAgICBjb25zdCB2YWx1ZSA9IHRoaXMuc3RyXy5zdWJzdHJpbmcobmV3SW5kZXggKyAxLCBlbmQpO1xuICAgICAgbmV3SW5kZXggPSBlbmQ7XG4gICAgICByZXR1cm4ge3R5cGU6IFRva2VuVHlwZS5MSVRFUkFMLCB2YWx1ZSwgaW5kZXg6IG5ld0luZGV4fTtcbiAgICB9XG5cbiAgICAvLyBPYmplY3QgbGl0ZXJhbC5cbiAgICBpZiAoYyA9PSAneycpIHtcbiAgICAgIGxldCBudW1iZXJPZkJyYWNlcyA9IDE7XG4gICAgICBsZXQgZW5kID0gLTE7XG4gICAgICBmb3IgKGxldCBpID0gbmV3SW5kZXggKyAxOyBpIDwgdGhpcy5zdHJfLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGNvbnN0IGNoYXIgPSB0aGlzLnN0cl9baV07XG4gICAgICAgIGlmIChjaGFyID09ICd7Jykge1xuICAgICAgICAgIG51bWJlck9mQnJhY2VzKys7XG4gICAgICAgIH0gZWxzZSBpZiAoY2hhciA9PSAnfScpIHtcbiAgICAgICAgICBudW1iZXJPZkJyYWNlcy0tO1xuICAgICAgICB9XG4gICAgICAgIGlmIChudW1iZXJPZkJyYWNlcyA8PSAwKSB7XG4gICAgICAgICAgZW5kID0gaTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgaWYgKGVuZCA9PSAtMSkge1xuICAgICAgICByZXR1cm4ge3R5cGU6IFRva2VuVHlwZS5JTlZBTElELCBpbmRleDogbmV3SW5kZXh9O1xuICAgICAgfVxuICAgICAgY29uc3QgdmFsdWUgPSB0aGlzLnN0cl8uc3Vic3RyaW5nKG5ld0luZGV4LCBlbmQgKyAxKTtcbiAgICAgIG5ld0luZGV4ID0gZW5kO1xuICAgICAgcmV0dXJuIHt0eXBlOiBUb2tlblR5cGUuT0JKRUNULCB2YWx1ZSwgaW5kZXg6IG5ld0luZGV4fTtcbiAgICB9XG5cbiAgICAvLyBBZHZhbmNlIHVudGlsIG5leHQgc3BlY2lhbCBjaGFyYWN0ZXIuXG4gICAgbGV0IGVuZCA9IG5ld0luZGV4ICsgMTtcbiAgICBmb3IgKDsgZW5kIDwgdGhpcy5zdHJfLmxlbmd0aDsgZW5kKyspIHtcbiAgICAgIGlmIChTUEVDSUFMX1NFVC5pbmRleE9mKHRoaXMuc3RyXy5jaGFyQXQoZW5kKSkgIT0gLTEpIHtcbiAgICAgICAgYnJlYWs7XG4gICAgICB9XG4gICAgfVxuICAgIGNvbnN0IHMgPSB0aGlzLnN0cl8uc3Vic3RyaW5nKG5ld0luZGV4LCBlbmQpO1xuICAgIG5ld0luZGV4ID0gZW5kIC0gMTtcblxuICAgIC8vIEJvb2xlYW4gbGl0ZXJhbC5cbiAgICBpZiAoY29udmVydFZhbHVlcyAmJiAocyA9PSAndHJ1ZScgfHwgcyA9PSAnZmFsc2UnKSkge1xuICAgICAgY29uc3QgdmFsdWUgPSBzID09ICd0cnVlJztcbiAgICAgIHJldHVybiB7dHlwZTogVG9rZW5UeXBlLkxJVEVSQUwsIHZhbHVlLCBpbmRleDogbmV3SW5kZXh9O1xuICAgIH1cblxuICAgIC8vIElkZW50aWZpZXIuXG4gICAgaWYgKCFpc051bShzLmNoYXJBdCgwKSkpIHtcbiAgICAgIHJldHVybiB7dHlwZTogVG9rZW5UeXBlLklELCB2YWx1ZTogcywgaW5kZXg6IG5ld0luZGV4fTtcbiAgICB9XG5cbiAgICAvLyBLZXkuXG4gICAgcmV0dXJuIHt0eXBlOiBUb2tlblR5cGUuTElURVJBTCwgdmFsdWU6IHMsIGluZGV4OiBuZXdJbmRleH07XG4gIH1cbn1cblxuLyoqXG4gKiBUZXN0cyB3aGV0aGVyIGEgY2hhY3RlciBpcyBhIG51bWJlci5cbiAqIEBwYXJhbSB7c3RyaW5nfSBjXG4gKiBAcmV0dXJuIHtib29sZWFufVxuICovXG5mdW5jdGlvbiBpc051bShjKSB7XG4gIHJldHVybiBjID49ICcwJyAmJiBjIDw9ICc5Jztcbn1cblxuLyoqXG4gKiBAcGFyYW0geyEuL2FtcGRvYy1pbXBsLkFtcERvY30gYW1wZG9jXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBpbnN0YWxsQWN0aW9uU2VydmljZUZvckRvYyhhbXBkb2MpIHtcbiAgcmVnaXN0ZXJTZXJ2aWNlQnVpbGRlckZvckRvYyhcbiAgICBhbXBkb2MsXG4gICAgJ2FjdGlvbicsXG4gICAgQWN0aW9uU2VydmljZSxcbiAgICAvKiBvcHRfaW5zdGFudGlhdGUgKi8gdHJ1ZVxuICApO1xufVxuIl19
// /Users/mszylkowski/src/amphtml/src/service/action-impl.js