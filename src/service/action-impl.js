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

import {KeyCodes} from '../utils/key-codes';
import {debounce} from '../utils/rate-limit';
import {dev, user} from '../log';
import {
  registerServiceBuilderForDoc,
  installServiceInEmbedScope,
} from '../service';
import {getMode} from '../mode';
import {isArray} from '../types';
import {map} from '../utils/object';
import {timerFor} from '../services';
import {vsyncFor} from '../services';

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

/** @const {!Object<string,!Array<string>>} */
const ELEMENTS_ACTIONS_MAP_ = {
  'form': ['submit'],
  'AMP': ['setState'],
};

/** @enum {string} */
const TYPE = {
  NUMBER: 'number',
  BOOLEAN: 'boolean',
};

/** @const {!Object<string, !Object<string, string>>} */
const WHITELISTED_INPUT_DATA_ = {
  'range': {
    'min': TYPE.NUMBER,
    'max': TYPE.NUMBER,
    'value': TYPE.NUMBER,
  },
  'radio': {
    'checked': TYPE.BOOLEAN,
  },
  'checkbox': {
    'checked': TYPE.BOOLEAN,
  },
};

/**
 * A map of method argument keys to functions that generate the argument values
 * given a local scope object. The function allows argument values to reference
 * data in the event that generated the action.
 * @typedef {Object<string,function(!Object):string>}
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
let ActionInfoDef;


/**
 * @typedef {Event|DeferredEvent}
 */
let ActionEventDef;


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
   * @param {?JSONType} args
   * @param {?Element} source
   * @param {?ActionEventDef} event
   */
  constructor(target, method, args, source, event) {
    /** @const {!Node} */
    this.target = target;
    /** @const {string} */
    this.method = method;
    /** @const {?JSONType} */
    this.args = args;
    /** @const {?Element} */
    this.source = source;
    /** @const {?ActionEventDef} */
    this.event = event;
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

    /** @const @private {!Object<string, function(!ActionInvocation)>} */
    this.globalTargets_ = map();

    /** @const @private {!Object<string, function(!ActionInvocation)>} */
    this.globalMethodHandlers_ = map();

    /** @private {!./vsync-impl.Vsync} */
    this.vsync_ = vsyncFor(ampdoc.win);

    // Add core events.
    this.addEvent('tap');
    this.addEvent('submit');
    this.addEvent('change');
    this.addEvent('input-debounced');
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
          this.trigger(dev().assertElement(event.target), name, event);
        }
      });
      this.root_.addEventListener('keydown', event => {
        const keyCode = event.keyCode;
        if (keyCode == KeyCodes.ENTER || keyCode == KeyCodes.SPACE) {
          const element = dev().assertElement(event.target);
          if (!event.defaultPrevented &&
              element.getAttribute('role') == 'button') {
            event.preventDefault();
            this.trigger(element, name, event);
          }
        }
      });
    } else if (name == 'submit') {
      this.root_.addEventListener(name, event => {
        this.trigger(dev().assertElement(event.target), name, event);
      });
    } else if (name == 'change') {
      this.root_.addEventListener(name, event => {
        this.addChangeDetails_(event);
        this.trigger(dev().assertElement(event.target), name, event);
      });
    } else if (name == 'input-debounced') {
      const debouncedInput = debounce(this.ampdoc.win, event => {
        const target = dev().assertElement(event.target);
        this.trigger(target, name, /** @type {!ActionEventDef} */ (event));
      }, DEFAULT_DEBOUNCE_WAIT);

      this.root_.addEventListener('input', event => {
        // Create a DeferredEvent to avoid races where the browser cleans up
        // the event object before the async debounced function is called.
        const deferredEvent = new DeferredEvent(event);
        debouncedInput(deferredEvent);
      });
    }
  }

  /**
   * Given a browser 'change' event, add `details` property containing the
   * relevant information for the change that generated the initial event.
   * @param {!ActionEventDef} event A `change` event.
   */
  addChangeDetails_(event) {
    const detail = map();
    const target = event.target;
    const tagName = target.tagName.toLowerCase();
    switch (tagName) {
      case 'input':
        const inputType = target.getAttribute('type');
        const fieldsToInclude = WHITELISTED_INPUT_DATA_[inputType];
        if (fieldsToInclude) {
          Object.keys(fieldsToInclude).forEach(field => {
            const expectedType = fieldsToInclude[field];
            const value = target[field];
            if (expectedType === 'number') {
              detail[field] = Number(value);
            } else if (expectedType === 'boolean') {
              detail[field] = !!value;
            } else {
              detail[field] = String(value);
            }
          });
        }
        break;
      case 'select':
        detail.value = target.value;
        break;
    }
    if (Object.keys(detail).length > 0) {
      event.detail = detail;
    }
  }

  /**
   * Registers the action target that will receive all designated actions.
   * @param {string} name
   * @param {function(!ActionInvocation)} handler
   */
  addGlobalTarget(name, handler) {
    this.globalTargets_[name] = handler;
  }

  /**
   * Registers the action handler for a common method.
   * @param {string} name
   * @param {function(!ActionInvocation)} handler
   */
  addGlobalMethodHandler(name, handler) {
    this.globalMethodHandlers_[name] = handler;
  }

  /**
   * Triggers the specified event on the target element.
   * @param {!Element} target
   * @param {string} eventType
   * @param {?ActionEventDef} event
   */
  trigger(target, eventType, event) {
    this.action_(target, eventType, event);
  }

  /**
   * Triggers execution of the method on a target/method.
   * @param {!Element} target
   * @param {string} method
   * @param {?JSONType} args
   * @param {?Element} source
   * @param {?ActionEventDef} event
   */
  execute(target, method, args, source, event) {
    this.invoke_(target, method, args, source, event, null);
  }

  /**
   * Installs action handler for the specified element.
   * @param {!Element} target
   * @param {function(!ActionInvocation)} handler
   */
  installActionHandler(target, handler) {
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

    target[ACTION_HANDLER_] = handler;

    // Dequeue the current queue.
    if (isArray(currentQueue)) {
      timerFor(target.ownerDocument.defaultView).delay(() => {
        // TODO(dvoytenko, #1260): dedupe actions.
        currentQueue.forEach(invocation => {
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
   * @param {!Element} source
   * @param {string} ActionEventDefType
   * @param {?ActionEventDef} event
   * @private
   */
  action_(source, ActionEventDefType, event) {
    const action = this.findAction_(source, ActionEventDefType);
    if (!action) {
      // TODO(dvoytenko): implement default (catch-all) actions.
      return;
    }

    for (let i = 0; i < action.actionInfos.length; i++) {
      const actionInfo = action.actionInfos[i];
      // Replace any variables in args with data in `event`.
      const args = applyActionInfoArgs(actionInfo.args, event);

      // Global target, e.g. `AMP`.
      const globalTarget = this.globalTargets_[actionInfo.target];
      if (globalTarget) {
        const invocation = new ActionInvocation(
            this.root_,
            actionInfo.method,
            args,
            action.node,
            event);
        globalTarget(invocation);
      } else {
        const target = this.root_.getElementById(actionInfo.target);
        if (target) {
          this.invoke_(target, actionInfo.method, args,
              action.node, event, actionInfo);
        } else {
          this.actionInfoError_('target not found', actionInfo, target);
        }
      }
    }
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
   * @param {!Element} target
   * @param {string} method
   * @param {?JSONType} args
   * @param {?Element} source
   * @param {?ActionEventDef} event
   * @param {?ActionInfoDef} actionInfo
   */
  invoke_(target, method, args, source, event, actionInfo) {
    const invocation = new ActionInvocation(target, method, args,
        source, event);

    // Try a global method handler first.
    if (this.globalMethodHandlers_[invocation.method]) {
      this.globalMethodHandlers_[invocation.method](invocation);
      return;
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
      return;
    }

    // Special elements with AMP ID or known supported actions.
    const supportedActions = ELEMENTS_ACTIONS_MAP_[lowerTagName];
    // TODO(dvoytenko, #7063): switch back to `target.id` with form proxy.
    const targetId = target.getAttribute('id') || '';
    if ((targetId && targetId.substring(0, 4) == 'amp-') ||
        (supportedActions && supportedActions.indexOf(method) != -1)) {
      const handler = target[ACTION_HANDLER_];
      if (handler) {
        handler(invocation);
      } else {
        target[ACTION_QUEUE_] = target[ACTION_QUEUE_] || [];
        target[ACTION_QUEUE_].push(invocation);
      }
      return;
    }

    // Unsupported target.
    this.actionInfoError_(
        'Target element does not support provided action',
        actionInfo, target);
  }

  /**
   * @param {!Element} target
   * @param {string} ActionEventDefType
   * @return {?{node: !Element, actionInfos: !Array<!ActionInfoDef>}}
   */
  findAction_(target, ActionEventDefType) {
    // Go from target up the DOM tree and find the applicable action.
    let n = target;
    while (n) {
      const actionInfos = this.matchActionInfos_(n, ActionEventDefType);
      if (actionInfos) {
        return {node: n, actionInfos: dev().assert(actionInfos)};
      }
      n = n.parentElement;
    }
    return null;
  }

  /**
   * @param {!Element} node
   * @param {string} ActionEventDefType
   * @return {?Array<!ActionInfoDef>}
   */
  matchActionInfos_(node, ActionEventDefType) {
    const actionMap = this.getActionMap_(node);
    if (!actionMap) {
      return null;
    }
    return actionMap[ActionEventDefType] || null;
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
}


/**
 * A clone of an event object with its function properties noop'd.
 * This is useful e.g. for event objects that need to be passed to an async
 * context, but the browser might have cleaned up the original event object.
 * This clone noops functions since they won't behave normally after the
 * original object has been destroyed.
 */
class DeferredEvent {
  /**
   * @param {!Event} event
   */
  constructor(event) {
    cloneWithoutFunctions(event, this);

    /** @type {?Object} */
    this.detail = null;
  }
}


/**
 * Clones an object and noops its function properties.
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
      clone[prop] = noop;
    } else {
      clone[prop] = original[prop];
    }
  }
  return clone;
}

/** @private */
function noop() { }


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
          toks.next();  // Skip '.'
          method = assertToken(
              toks.next(), [TokenType.LITERAL, TokenType.ID]).value || method;

          // Optionally, there may be arguments: "(key = value, key = value)".
          peek = toks.peek();
          if (peek.type == TokenType.SEPARATOR && peek.value == '(') {
            toks.next();  // Skip '('
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
    args[OBJECT_STRING_ARGS_KEY] = () => value;
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
        // Value is either a literal or a variable: "foo.bar.baz"
        tok = assertToken(toks.next(/* convertValue */ true),
            [TokenType.LITERAL, TokenType.ID]);
        const argValueTokens = [tok];
        // Variables have one or more dereferences: ".identifier"
        if (tok.type == TokenType.ID) {
          for (peek = toks.peek();
              peek.type == TokenType.SEPARATOR && peek.value == '.';
              peek = toks.peek()) {
            tok = toks.next(); // Skip '.'.
            tok = assertToken(toks.next(false), [TokenType.ID]);
            argValueTokens.push(tok);
          }
        }
        const argValue = getActionInfoArgValue(argValueTokens);
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
 * Returns a function that generates a method argument value for a given token.
 * The function takes a single object argument `data`.
 * If the token is an identifier `foo`, the function returns `data[foo]`.
 * Otherwise, the function returns the token value.
 * @param {Array<!TokenDef>} tokens
 * @return {?function(!Object):string}
 * @private
 */
function getActionInfoArgValue(tokens) {
  if (tokens.length == 0) {
    return null;
  }
  if (tokens.length == 1) {
    return () => tokens[0].value;
  } else {
    return data => {
      let current = data;
      // Traverse properties of `data` per token values.
      for (let i = 0; i < tokens.length; i++) {
        const value = tokens[i].value;
        if (current && current.hasOwnProperty(value)) {
          current = current[value];
        } else {
          return null;
        }
      }
      // Only allow dereferencing of primitives.
      const type = typeof current;
      if (type === 'string' || type === 'number' || type === 'boolean') {
        return current;
      } else {
        return null;
      }
    };
  }
}

/**
 * Generates method arg values for each key in the given ActionInfoArgsDef
 * with the data in the given event.
 * @param {?ActionInfoArgsDef} args
 * @param {?ActionEventDef} event
 * @return {?JSONType}
 * @private Visible for testing only.
 */
export function applyActionInfoArgs(args, event) {
  if (!args) {
    return args;
  }
  const data = {};
  if (event && event.detail) {
    data['event'] = event.detail;
  }
  const applied = map();
  Object.keys(args).forEach(key => {
    applied[key] = args[key].call(null, data);
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
        if (!WHITESPACE_SET.includes(this.str_.charAt(newIndex))) {
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
