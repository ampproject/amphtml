import { resolvedPromise as _resolvedPromise } from "./../core/data-structures/promise";

function _createForOfIteratorHelperLoose(o, allowArrayLike) { var it = typeof Symbol !== "undefined" && o[Symbol.iterator] || o["@@iterator"]; if (it) return (it = it.call(o)).next.bind(it); if (Array.isArray(o) || (it = _unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") { if (it) o = it; var i = 0; return function () { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

/**
 * Copyright 2018 The AMP HTML Authors. All Rights Reserved.
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
import { Deferred } from "../core/data-structures/promise";
import { rethrowAsync } from "../core/error";
import { map } from "../core/types/object";

/**
 * For type anotations where Element is a local variable.
 * @typedef {!Element}
 */
var ElementOrigDef;

/** @typedef {!typeof HTMLElement} */
var CustomElementConstructorDef;

/**
 * @typedef {{
 *  name: string,
 *  ctor: !CustomElementConstructorDef,
 * }}
 */
var CustomElementDef;

/**
 * Validates the custom element's name.
 * This intentionally ignores "valid" higher Unicode Code Points.
 * https://html.spec.whatwg.org/multipage/custom-elements.html#valid-custom-element-name
 */
var VALID_NAME = /^[a-z][a-z0-9._]*-[a-z0-9._-]*$/;
var INVALID_NAMES = ['annotation-xml', 'color-profile', 'font-face', 'font-face-src', 'font-face-uri', 'font-face-format', 'font-face-name', 'missing-glyph'];

/**
 * A MutationObserverInit dictionary to track subtree modifications.
 */
var TRACK_SUBTREE = {
  'childList': true,
  'subtree': true
};

/**
 * Asserts that the custom element name conforms to the spec.
 *
 * @param {!typeof SyntaxError} SyntaxError
 * @param {string} name
 */
function assertValidName(SyntaxError, name) {
  if (!VALID_NAME.test(name) || INVALID_NAMES.includes(name)) {
    throw new SyntaxError("invalid custom element name \"" + name + "\"");
  }
}

/**
 * Does win have a full Custom Elements registry?
 *
 * @param {!Window} win
 * @return {boolean}
 */
function hasCustomElements(win) {
  var customElements = win.customElements;
  return !!(customElements && customElements.define && customElements.get && customElements.whenDefined);
}

/**
 * Was HTMLElement already patched for this window?
 *
 * @param {!Window} win
 * @return {boolean}
 */
function isPatched(win) {
  var tag = win.HTMLElement.toString();
  return tag.indexOf('[native code]') === -1;
}

/**
 * The public Custom Elements API.
 */
var CustomElementRegistry = /*#__PURE__*/function () {
  /**
   * @param {!Window} win
   * @param {!Registry} registry
   */
  function CustomElementRegistry(win, registry) {
    _classCallCheck(this, CustomElementRegistry);

    /** @const @private */
    this.win_ = win;

    /** @const @private */
    this.registry_ = registry;

    /** @private @const @type {!Object<string, !Deferred>} */
    this.pendingDefines_ = map();
  }

  /**
   * Register the custom element.
   *
   * @param {string} name
   * @param {!CustomElementConstructorDef} ctor
   * @param {!Object=} options
   */
  _createClass(CustomElementRegistry, [{
    key: "define",
    value: function define(name, ctor, options) {
      this.registry_.define(name, ctor, options);
      // If anyone is waiting for this custom element to be defined, resolve
      // their promise.
      var pending = this.pendingDefines_;
      var deferred = pending[name];

      if (deferred) {
        deferred.resolve();
        delete pending[name];
      }
    }
    /**
     * Get the constructor of the (already defined) custom element.
     *
     * @param {string} name
     * @return {!CustomElementConstructorDef|undefined}
     */

  }, {
    key: "get",
    value: function get(name) {
      var def = this.registry_.getByName(name);

      if (def) {
        return def.ctor;
      }
    }
    /**
     * Returns a promise that waits until the custom element is defined.
     * If the custom element is already defined, returns a resolved promise.
     *
     * @param {string} name
     * @return {!Promise<undefined>}
     */

  }, {
    key: "whenDefined",
    value: function whenDefined(name) {
      var _this$win_ = this.win_,
          Promise = _this$win_.Promise,
          SyntaxError = _this$win_.SyntaxError;
      assertValidName(SyntaxError, name);

      if (this.registry_.getByName(name)) {
        return _resolvedPromise();
      }

      var pending = this.pendingDefines_;
      var deferred = pending[name];

      if (!deferred) {
        deferred = new Deferred();
        pending[name] = deferred;
      }

      return deferred.promise;
    }
    /**
     * Upgrade all custom elements inside root.
     *
     * @param {!Node} root
     */

  }, {
    key: "upgrade",
    value: function upgrade(root) {
      this.registry_.upgrade(root);
    }
  }]);

  return CustomElementRegistry;
}();

/**
 * This internal APIs necessary to run the CustomElementRegistry.
 * Since Registry is never exposed externally, all methods are actually
 * available on the instance.
 */
var Registry = /*#__PURE__*/function () {
  /**
   * @param {!Window} win
   */
  function Registry(win) {
    _classCallCheck(this, Registry);

    /** @private @const */
    this.win_ = win;

    /** @private @const @type {!Object<string, !CustomElementDef>} */
    this.definitions_ = map();

    /**
     * A up-to-date DOM selector for all custom elements.
     * @type {string}
     */
    this.query_ = '';

    /**
     * The currently upgrading element.
     * @private {?Element}
     */
    this.current_ = null;

    /**
     * Once started (after the first Custom Element definition), this tracks
     * DOM append and removals.
     *
     * @private {?MutationObserver}
     */
    this.mutationObserver_ = null;

    /**
     * All the observed DOM trees, including shadow trees.
     *
     * @private @const {!Array<!Node>}
     */
    this.roots_ = [win.document];
  }

  /**
   * The currently-being-upgraded custom element.
   *
   * When an already created (through the DOM parsing APIs, or innerHTML)
   * custom element node is being upgraded, we can't just create a new node
   * (it's illegal in the spec). But we still need to run the custom element's
   * constructor code on the node. We avoid this conundrum by running the
   * constructor while returning this current node in the HTMLElement
   * class constructor (the base class of all custom elements).
   *
   * @return {?Element}
   */
  _createClass(Registry, [{
    key: "current",
    value: function current() {
      var current = this.current_;
      this.current_ = null;
      return current;
    }
    /**
     * Finds the custom element definition by name.
     *
     * @param {string} name
     * @return {!CustomElementDef|undefined}
     */

  }, {
    key: "getByName",
    value: function getByName(name) {
      var definition = this.definitions_[name];

      if (definition) {
        return definition;
      }
    }
    /**
     * Finds the custom element definition by constructor instance.
     *
     * @param {!CustomElementConstructorDef} ctor
     * @return {!CustomElementDef|undefined}
     */

  }, {
    key: "getByConstructor",
    value: function getByConstructor(ctor) {
      var definitions = this.definitions_;

      for (var name in definitions) {
        var def = definitions[name];

        if (def.ctor === ctor) {
          return def;
        }
      }
    }
    /**
     * Registers the custom element definition, and upgrades all elements by that
     * name in the root document.
     *
     * @param {string} name
     * @param {!CustomElementConstructorDef} ctor
     * @param {!Object|undefined} options
     */

  }, {
    key: "define",
    value: function define(name, ctor, options) {
      var _this$win_2 = this.win_,
          Error = _this$win_2.Error,
          SyntaxError = _this$win_2.SyntaxError;

      if (options) {
        throw new Error('Extending native custom elements is not supported');
      }

      assertValidName(SyntaxError, name);

      if (this.getByName(name) || this.getByConstructor(ctor)) {
        throw new Error("duplicate definition \"" + name + "\"");
      }

      // TODO(jridgewell): Record connectedCallback, disconnectedCallback,
      // adoptedCallback, attributeChangedCallback, and observedAttributes.
      // TODO(jridgewell): If attributeChangedCallback, gather observedAttributes
      this.definitions_[name] = {
        name: name,
        ctor: ctor
      };
      this.observe_(name);

      for (var _iterator = _createForOfIteratorHelperLoose(this.roots_), _step; !(_step = _iterator()).done;) {
        var tree = _step.value;
        this.upgrade(tree, name);
      }
    }
    /**
     * Upgrades custom elements descendants of root (but not including root).
     *
     * When called with an opt_query, it both upgrades and connects the custom
     * elements (this is used during the custom element define algorithm).
     *
     * @param {!Node} root
     * @param {string=} opt_query
     */

  }, {
    key: "upgrade",
    value: function upgrade(root, opt_query) {
      // Only CustomElementRegistry.p.define provides a query (the newly defined
      // custom element). In this case, we are both upgrading _and_ connecting
      // the custom elements.
      var newlyDefined = !!opt_query;
      var query = opt_query || this.query_;
      var upgradeCandidates = this.queryAll_(root, query);

      for (var _iterator2 = _createForOfIteratorHelperLoose(upgradeCandidates), _step2; !(_step2 = _iterator2()).done;) {
        var candidate = _step2.value;

        if (newlyDefined) {
          this.connectedCallback_(candidate);
        } else {
          this.upgradeSelf(candidate);
        }
      }
    }
    /**
     * Upgrades the custom element node, if a custom element has been registered
     * by this name.
     *
     * @param {!Node} node
     */

  }, {
    key: "upgradeSelf",
    value: function upgradeSelf(node) {
      var def = this.getByName(node.localName);

      if (!def) {
        return;
      }

      this.upgradeSelf_(
      /** @type {!Element} */
      node, def);
    }
    /**
     * @param {!Node} root
     * @param {string} query
     * @return {!Array|!NodeList}
     */

  }, {
    key: "queryAll_",
    value: function queryAll_(root, query) {
      if (!query || !root.querySelectorAll) {
        // Nothing to do...
        return [];
      }

      return root.querySelectorAll(query);
    }
    /**
     * Upgrades the (already created via DOM parsing) custom element.
     *
     * @param {!Element} node
     * @param {!CustomElementDef} def
     */

  }, {
    key: "upgradeSelf_",
    value: function upgradeSelf_(node, def) {
      var ctor = def.ctor;

      if (node instanceof ctor) {
        return;
      }

      // Despite how it looks, this is not a useless construction.
      // HTMLElementPolyfill (the base class of all custom elements) will return
      // the current node, allowing the custom element's subclass constructor to
      // run on the node. The node itself is already constructed, so the return
      // value is just the node.
      this.current_ = node;

      try {
        var el = new ctor();

        if (el !== node) {
          throw new this.win_.Error('Constructor illegally returned a different instance.');
        }
      } catch (e) {
        rethrowAsync(e);
      }
    }
    /**
     * Fires connectedCallback on the custom element, if it has one.
     * This also upgrades the custom element, since it may not have been
     * accessible via the root document before (a detached DOM tree).
     *
     * @param {!Node} node
     */

  }, {
    key: "connectedCallback_",
    value: function connectedCallback_(node) {
      var def = this.getByName(node.localName);

      if (!def) {
        return;
      }

      node =
      /** @type {!HTMLElement} */
      node;
      this.upgradeSelf_(node, def);

      // TODO(jridgewell): It may be appropriate to adoptCallback, if the node
      // used to be in another doc.
      // TODO(jridgewell): I should be calling the definitions connectedCallback
      // with node as the context.
      if (node.connectedCallback) {
        try {
          node.connectedCallback();
        } catch (e) {
          rethrowAsync(e);
        }
      }
    }
    /**
     * Fires disconnectedCallback on the custom element, if it has one.
     *
     * @param {!Node} node
     */

  }, {
    key: "disconnectedCallback_",
    value: function disconnectedCallback_(node) {
      // TODO(jridgewell): I should be calling the definitions connectedCallback
      // with node as the context.
      node =
      /** @type {!HTMLElement} */
      node;

      if (node.disconnectedCallback) {
        try {
          node.disconnectedCallback();
        } catch (e) {
          rethrowAsync(e);
        }
      }
    }
    /**
     * Records name as a registered custom element to observe.
     *
     * Starts the Mutation Observer if this is the first registered custom
     * element. This is deferred until the first custom element is defined to
     * speed up initial rendering of the page.
     *
     * Mutation Observers are conveniently available in every browser we care
     * about. When a node is connected to the root document, all custom
     * elements (including that node iteself) will be upgraded and call
     * connectedCallback. When a node is disconnectedCallback from the root
     * document, all custom elements will call disconnectedCallback.
     *
     * @param {string} name
     */

  }, {
    key: "observe_",
    value: function observe_(name) {
      var _this = this;

      if (this.query_) {
        this.query_ += "," + name;
        return;
      }

      this.query_ = name;
      // The first registered name starts the mutation observer.
      var mo = new this.win_.MutationObserver(function (records) {
        if (records) {
          _this.handleRecords_(records);
        }
      });
      this.mutationObserver_ = mo;

      // I would love to not have to hold onto all of the roots, since it's a
      // memory leak. Unfortunately, there's no way to iterate a list and hold
      // onto its contents weakly.
      for (var _iterator3 = _createForOfIteratorHelperLoose(this.roots_), _step3; !(_step3 = _iterator3()).done;) {
        var tree = _step3.value;
        mo.observe(tree, TRACK_SUBTREE);
      }

      installPatches(this.win_, this);
    }
    /**
     * Adds the shadow tree to be observed by the polyfill.
     *
     * @param {!Node} tree
     */

  }, {
    key: "observe",
    value: function observe(tree) {
      this.roots_.push(tree);

      if (this.mutationObserver_) {
        this.mutationObserver_.observe(tree, TRACK_SUBTREE);
      }
    }
    /**
     * This causes a synchronous handling of all the Mutation Observer's tracked
     * mutations. This does nothing until the mutation observer is actually
     * registered on the first Custom Element definition.
     */

  }, {
    key: "sync",
    value: function sync() {
      if (this.mutationObserver_) {
        this.handleRecords_(this.mutationObserver_.takeRecords());
      }
    }
    /**
     * Handle all the Mutation Observer's Mutation Records.
     * All added custom elements will be upgraded (if not already) and call
     * connectedCallback. All removed custom elements will call
     * disconnectedCallback.
     *
     * @param {!Array<!MutationRecord>} records
     */

  }, {
    key: "handleRecords_",
    value: function handleRecords_(records) {
      for (var _iterator4 = _createForOfIteratorHelperLoose(records), _step4; !(_step4 = _iterator4()).done;) {
        var record = _step4.value;

        if (!record) {
          continue;
        }

        var addedNodes = record.addedNodes,
            removedNodes = record.removedNodes;

        for (var _iterator5 = _createForOfIteratorHelperLoose(addedNodes), _step5; !(_step5 = _iterator5()).done;) {
          var node = _step5.value;
          var connectedCandidates = this.queryAll_(node, this.query_);
          this.connectedCallback_(node);

          for (var _iterator7 = _createForOfIteratorHelperLoose(connectedCandidates), _step7; !(_step7 = _iterator7()).done;) {
            var candidate = _step7.value;
            this.connectedCallback_(candidate);
          }
        }

        for (var _iterator6 = _createForOfIteratorHelperLoose(removedNodes), _step6; !(_step6 = _iterator6()).done;) {
          var _node = _step6.value;
          var disconnectedCandidates = this.queryAll_(_node, this.query_);
          this.disconnectedCallback_(_node);

          for (var _iterator8 = _createForOfIteratorHelperLoose(disconnectedCandidates), _step8; !(_step8 = _iterator8()).done;) {
            var _candidate = _step8.value;
            this.disconnectedCallback_(_candidate);
          }
        }
      }
    }
  }]);

  return Registry;
}();

/**
 * Patches the DOM APIs to support synchronous Custom Elements.
 * @param {!Window} win
 * @param {!Registry} registry
 */
function installPatches(win, registry) {
  var _innerHTMLDesc;

  var Document = win.Document,
      Element = win.Element,
      Node = win.Node,
      document = win.document;
  var docProto = Document.prototype;
  var elProto = Element.prototype;
  var nodeProto = Node.prototype;
  var createElement = docProto.createElement,
      importNode = docProto.importNode;
  var appendChild = nodeProto.appendChild,
      cloneNode = nodeProto.cloneNode,
      insertBefore = nodeProto.insertBefore,
      removeChild = nodeProto.removeChild,
      replaceChild = nodeProto.replaceChild;

  // Patch createElement to immediately upgrade the custom element.
  // This has the added benefit that it avoids the "already created but needs
  // constructor code run" chicken-and-egg problem.
  docProto.createElement = function (name) {
    var def = registry.getByName(name);

    if (def) {
      return new def.ctor();
    }

    return createElement.apply(this, arguments);
  };

  // Patch importNode to immediately upgrade custom elements.
  // TODO(jridgewell): Can fire adoptedCallback for cross doc imports.
  docProto.importNode = function () {
    var imported = importNode.apply(this, arguments);

    // Only upgrade elements if the document that the nodes were imported into
    // is _this_ document. If it's another document, then that document's
    // element registry must do the upgrade.
    // Eg, when importing from a <template>, the cloned document fragment
    // should be upgraded. But importing from document into the <template>
    // should not.
    if (imported && this === document) {
      registry.upgradeSelf(imported);
      registry.upgrade(imported);
    }

    return imported;
  };

  // Patch appendChild to upgrade custom elements before returning.
  nodeProto.appendChild = function () {
    var appended = appendChild.apply(this, arguments);
    registry.sync();
    return appended;
  };

  // Patch insertBefore to upgrade custom elements before returning.
  nodeProto.insertBefore = function () {
    var inserted = insertBefore.apply(this, arguments);
    registry.sync();
    return inserted;
  };

  // Patch removeChild to upgrade custom elements before returning.
  nodeProto.removeChild = function () {
    var removed = removeChild.apply(this, arguments);
    registry.sync();
    return removed;
  };

  // Patch replaceChild to upgrade and detach custom elements before returning.
  nodeProto.replaceChild = function () {
    var replaced = replaceChild.apply(this, arguments);
    registry.sync();
    return replaced;
  };

  // Patch cloneNode to immediately upgrade custom elements.
  nodeProto.cloneNode = function () {
    var cloned = cloneNode.apply(this, arguments);

    // Only upgrade elements if the cloned node belonged to _this_ document.
    // Eg, when cloning a <template>'s content, the cloned document fragment
    // does not belong to this document.
    if (cloned.ownerDocument === document) {
      registry.upgradeSelf(cloned);
      registry.upgrade(cloned);
    }

    return cloned;
  };

  // Patch the innerHTML setter to immediately upgrade custom elements.
  // Note, this could technically fire connectedCallbacks if this node was
  // connected, but we leave that to the Mutation Observer.
  var innerHTMLProto = elProto;
  var innerHTMLDesc = Object.getOwnPropertyDescriptor(innerHTMLProto, 'innerHTML');

  if (!innerHTMLDesc) {
    // Sigh... IE11 puts innerHTML desciptor on HTMLElement. But, we've
    // replaced HTMLElement with a polyfill wrapper, so have to get its proto.
    innerHTMLProto = Object.getPrototypeOf(win.HTMLElement.prototype);
    innerHTMLDesc = Object.getOwnPropertyDescriptor(innerHTMLProto, 'innerHTML');
  }

  if ((_innerHTMLDesc = innerHTMLDesc) != null && _innerHTMLDesc.configurable) {
    var innerHTMLSetter = innerHTMLDesc.set;

    innerHTMLDesc.set = function (html) {
      innerHTMLSetter.call(this, html);
      registry.upgrade(this);
    };

    Object.defineProperty(
    /** @type {!Object} */
    innerHTMLProto, 'innerHTML', innerHTMLDesc);
  }
}

/**
 * Does the polyfilling.
 * @param {!Window} win
 */
function polyfill(win) {
  var Element = win.Element,
      HTMLElement = win.HTMLElement,
      document = win.document;
  var createElement = document.createElement;
  var registry = new Registry(win);
  var customElements = new CustomElementRegistry(win, registry);
  // Expose the custom element registry.
  // Object.getOwnPropertyDescriptor(window, 'customElements')
  // {get: ƒ, set: undefined, enumerable: true, configurable: true}
  Object.defineProperty(win, 'customElements', {
    enumerable: true,
    configurable: true,
    // writable: false,
    value: customElements
  });
  // Have to patch shadow methods now, since there's no way to find shadow trees
  // later.
  var elProto = Element.prototype;
  var attachShadow = elProto.attachShadow,
      createShadowRoot = elProto.createShadowRoot;

  if (attachShadow) {
    /**
     * @param {{mode: string}} unused
     * @return {!ShadowRoot}
     */
    elProto.attachShadow = function (unused) {
      var shadow = attachShadow.apply(this, arguments);
      registry.observe(shadow);
      return shadow;
    };

    // Necessary for Shadow AMP
    elProto.attachShadow.toString = function () {
      return attachShadow.toString();
    };
  }

  if (createShadowRoot) {
    /** @return {!ShadowRoot} */
    elProto.createShadowRoot = function () {
      var shadow = createShadowRoot.apply(this, arguments);
      registry.observe(shadow);
      return shadow;
    };

    // Necessary for Shadow AMP
    elProto.createShadowRoot.toString = function () {
      return createShadowRoot.toString();
    };
  }

  /**
   * You can't use the real HTMLElement constructor, because you can't subclass
   * it without using native classes. So, mock its approximation using
   * createElement.
   * @return {!ElementOrigDef}
   */
  function HTMLElementPolyfill() {
    var constructor = this.constructor;
    // If we're upgrading an already created custom element, we can't create
    // another new node (by the spec, it must be the same node).
    var el = registry.current();

    // If there's not a already created custom element, we're being invoked via
    // `new`ing the constructor.
    //
    // Technically, we could get here via createElement, but we patched that.
    // If it the custom element was registered, the patch turned it into a
    // `new` call.
    // If it was not registered, the native createElement is used. And if
    // native createElement is being used and we got to this code, we're really
    // in an infinite loop (a native createElement call just below) so we've
    // got bigger problems.
    //
    // So just take my word we got here via `new`.
    if (!el) {
      // The custom element definition is an invariant. If the custom element
      // is registered, everything works. If it's not, it throws in the member
      // property access (only defined custom elements can be directly
      // constructed via `new`).
      var def = registry.getByConstructor(constructor);
      el = createElement.call(document, def.name);
    }

    // Finally, if the node was already constructed, we need to reset its
    // prototype to the custom element prototype. And if it wasn't already
    // constructed, we created a new node via native createElement, and we need
    // to reset its prototype. Basically always reset the prototype.
    setPrototypeOf(el, constructor.prototype);
    return el;
  }

  subClass(HTMLElement, HTMLElementPolyfill);
  // Expose the polyfilled HTMLElement constructor for everyone to extend from.
  win.HTMLElementOrig = win.HTMLElement;
  win.HTMLElement = HTMLElementPolyfill;

  // When we transpile `super` in Custom Element subclasses, we change it to
  // `superClass.call(this)` (where `superClass` is `HTMLElementPolyfill`).
  // That `.call` value is inherited from `Function.prototype`.
  // But, IE11's native HTMLElement hierarchy doesn't extend from Function!
  // And because `HTMLElementPolyfill` extends from `HTMLElement`, it doesn't
  // have a `.call`! So we need to manually install it.
  if (!HTMLElementPolyfill.call) {
    HTMLElementPolyfill.apply = win.Function.apply;
    HTMLElementPolyfill.bind = win.Function.bind;
    HTMLElementPolyfill.call = win.Function.call;
  }
}

/**
 * Wraps HTMLElement in a Reflect.construct constructor, so that transpiled
 * classes can `_this = superClass.call(this)` during their construction.
 *
 * This is only used when Custom Elements v1 is already available _and_ we're
 * using transpiled classes (which use ES5 construction idioms).
 *
 * @param {!Window} win
 * @suppress {globalThis}
 */
function wrapHTMLElement(win) {
  var HTMLElement = win.HTMLElement,
      Reflect = win.Reflect;

  /** @return {!Element} */
  function HTMLElementWrapper() {
    var ctor =
    /** @type {function(...?):?|undefined} */
    this.constructor;
    // Reflect.construct allows us to construct a new HTMLElement without using
    // `new` (which will always fail because native HTMLElement is a restricted
    // constructor).
    return Reflect.construct(HTMLElement, [], ctor);
  }

  subClass(HTMLElement, HTMLElementWrapper);
  // Expose the wrapped HTMLElement constructor for everyone to extend from.
  win.HTMLElementOrig = win.HTMLElement;
  win.HTMLElement = HTMLElementWrapper;
}

/**
 * Setups up prototype inheritance
 *
 * @param {!SUPER} superClass
 * @param {!SUB} subClass
 * @template SUPER
 * @template SUB
 */
function subClass(superClass, subClass) {
  // Object.getOwnPropertyDescriptor(superClass.prototype, 'constructor')
  // {value: ƒ, writable: true, enumerable: false, configurable: true}
  subClass.prototype = Object.create(superClass.prototype, {
    constructor: {
      // enumerable: false,
      configurable: true,
      writable: true,
      value: subClass
    }
  });
  setPrototypeOf(subClass, superClass);
}

/**
 * Tests whether setting '__proto__' will change the prototype chain of an
 * object. Only needed for old IE.
 * @return {boolean}
 */
function supportsUnderProto() {
  var proto = {
    'test': true
  };
  var obj = {};
  obj.__proto__ = proto;
  return !!obj['test'];
}

/**
 * Sets the prototype chain of an object, with various fallbacks to support
 * old IE.
 * @param {!Object} obj
 * @param {!Object} prototype
 * @suppress {suspiciousCode} due to IS_ESM inlining
 */
function setPrototypeOf(obj, prototype) {
  if (false || Object.setPrototypeOf) {
    // Every decent browser.
    Object.setPrototypeOf(obj, prototype);
  } else if (supportsUnderProto()) {
    // IE11
    obj.__proto__ = prototype;
  } else {
    // IE10 man. :sigh:
    copyProperties(obj, prototype);
  }
}

/**
 * Copies the property descriptors from prototype to obj. This is only
 * necessary for old IE, which can't properly set the prototype of an already
 * created object.
 * @param {!Object} obj
 * @param {!Object} prototype
 * @visibleForTesting
 */
export function copyProperties(obj, prototype) {
  var current = prototype;

  while (current !== null) {
    if (Object.isPrototypeOf.call(current, obj)) {
      break;
    }

    for (var _iterator9 = _createForOfIteratorHelperLoose(Object.getOwnPropertyNames(current)), _step9; !(_step9 = _iterator9()).done;) {
      var prop = _step9.value;

      if (Object.hasOwnProperty.call(obj, prop)) {
        continue;
      }

      var desc =
      /** @type {!ObjectPropertyDescriptor<Object>} */
      Object.getOwnPropertyDescriptor(current, prop);
      Object.defineProperty(obj, prop, desc);
    }

    current = Object.getPrototypeOf(current);
  }
}

/**
 * Polyfills Custom Elements v1 API. This has 5 modes:
 *
 * 1. Custom elements v1 already supported, using native classes
 * 2. Custom elements v1 already supported, using transpiled classes
 * 3. Custom elements v1 not supported, using native classes
 * 4. Custom elements v1 not supported, using transpiled classes
 * 5. No sample class constructor provided
 *
 * In mode 1, nothing is done. In mode 2, a minimal polyfill is used to support
 * extending the HTMLElement base class. In mode 3, 4, and 5 a full polyfill is
 * done.
 *
 * @param {!Window} win
 * @param {!Function} ctor
 */
export function install(win, ctor) {
  // Don't install in no-DOM environments e.g. worker.
  var shouldInstall = win.document;
  var hasCE = hasCustomElements(win);

  if (!shouldInstall || hasCE && isPatched(win)) {
    return;
  }

  var install = true;
  var installWrapper = false;

  if (ctor && hasCE) {
    // If ctor is constructable without new, it's a function. That means it was
    // compiled down, and we need to do the minimal polyfill because all you
    // cannot extend HTMLElement without native classes.
    try {
      var _Reflect = win.Reflect;
      // "Construct" ctor using ES5 idioms
      // I'm not sure why, but Closure will complain at the
      // `Function.call.call()` below unless we cast to a Function instance
      // here.
      var instance =
      /** @type {!Function} */
      Object.create(ctor.prototype);
      // This will throw an error unless we're in a transpiled environemnt.
      // Native classes must be called as `new Ctor`, not `Ctor.call(instance)`.
      // We use `Function.call.call` because Closure is too smart for regular
      // `Ctor.call`.
      Function.call.call(ctor, instance);
      // If that didn't throw, we're transpiled.
      // Let's find out if we can wrap HTMLElement and avoid a full patch.
      installWrapper = !!(_Reflect != null && _Reflect.construct);
    } catch (e) {
      // The ctor threw when we constructed it via ES5, so it's a real class.
      // We're ok to not install the polyfill.
      install = false;
    }
  }

  if (installWrapper) {
    wrapHTMLElement(win);
  } else if (install) {
    polyfill(win);
  }
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImN1c3RvbS1lbGVtZW50cy5qcyJdLCJuYW1lcyI6WyJEZWZlcnJlZCIsInJldGhyb3dBc3luYyIsIm1hcCIsIkVsZW1lbnRPcmlnRGVmIiwiQ3VzdG9tRWxlbWVudENvbnN0cnVjdG9yRGVmIiwiQ3VzdG9tRWxlbWVudERlZiIsIlZBTElEX05BTUUiLCJJTlZBTElEX05BTUVTIiwiVFJBQ0tfU1VCVFJFRSIsImFzc2VydFZhbGlkTmFtZSIsIlN5bnRheEVycm9yIiwibmFtZSIsInRlc3QiLCJpbmNsdWRlcyIsImhhc0N1c3RvbUVsZW1lbnRzIiwid2luIiwiY3VzdG9tRWxlbWVudHMiLCJkZWZpbmUiLCJnZXQiLCJ3aGVuRGVmaW5lZCIsImlzUGF0Y2hlZCIsInRhZyIsIkhUTUxFbGVtZW50IiwidG9TdHJpbmciLCJpbmRleE9mIiwiQ3VzdG9tRWxlbWVudFJlZ2lzdHJ5IiwicmVnaXN0cnkiLCJ3aW5fIiwicmVnaXN0cnlfIiwicGVuZGluZ0RlZmluZXNfIiwiY3RvciIsIm9wdGlvbnMiLCJwZW5kaW5nIiwiZGVmZXJyZWQiLCJyZXNvbHZlIiwiZGVmIiwiZ2V0QnlOYW1lIiwiUHJvbWlzZSIsInByb21pc2UiLCJyb290IiwidXBncmFkZSIsIlJlZ2lzdHJ5IiwiZGVmaW5pdGlvbnNfIiwicXVlcnlfIiwiY3VycmVudF8iLCJtdXRhdGlvbk9ic2VydmVyXyIsInJvb3RzXyIsImRvY3VtZW50IiwiY3VycmVudCIsImRlZmluaXRpb24iLCJkZWZpbml0aW9ucyIsIkVycm9yIiwiZ2V0QnlDb25zdHJ1Y3RvciIsIm9ic2VydmVfIiwidHJlZSIsIm9wdF9xdWVyeSIsIm5ld2x5RGVmaW5lZCIsInF1ZXJ5IiwidXBncmFkZUNhbmRpZGF0ZXMiLCJxdWVyeUFsbF8iLCJjYW5kaWRhdGUiLCJjb25uZWN0ZWRDYWxsYmFja18iLCJ1cGdyYWRlU2VsZiIsIm5vZGUiLCJsb2NhbE5hbWUiLCJ1cGdyYWRlU2VsZl8iLCJxdWVyeVNlbGVjdG9yQWxsIiwiZWwiLCJlIiwiY29ubmVjdGVkQ2FsbGJhY2siLCJkaXNjb25uZWN0ZWRDYWxsYmFjayIsIm1vIiwiTXV0YXRpb25PYnNlcnZlciIsInJlY29yZHMiLCJoYW5kbGVSZWNvcmRzXyIsIm9ic2VydmUiLCJpbnN0YWxsUGF0Y2hlcyIsInB1c2giLCJ0YWtlUmVjb3JkcyIsInJlY29yZCIsImFkZGVkTm9kZXMiLCJyZW1vdmVkTm9kZXMiLCJjb25uZWN0ZWRDYW5kaWRhdGVzIiwiZGlzY29ubmVjdGVkQ2FuZGlkYXRlcyIsImRpc2Nvbm5lY3RlZENhbGxiYWNrXyIsIkRvY3VtZW50IiwiRWxlbWVudCIsIk5vZGUiLCJkb2NQcm90byIsInByb3RvdHlwZSIsImVsUHJvdG8iLCJub2RlUHJvdG8iLCJjcmVhdGVFbGVtZW50IiwiaW1wb3J0Tm9kZSIsImFwcGVuZENoaWxkIiwiY2xvbmVOb2RlIiwiaW5zZXJ0QmVmb3JlIiwicmVtb3ZlQ2hpbGQiLCJyZXBsYWNlQ2hpbGQiLCJhcHBseSIsImFyZ3VtZW50cyIsImltcG9ydGVkIiwiYXBwZW5kZWQiLCJzeW5jIiwiaW5zZXJ0ZWQiLCJyZW1vdmVkIiwicmVwbGFjZWQiLCJjbG9uZWQiLCJvd25lckRvY3VtZW50IiwiaW5uZXJIVE1MUHJvdG8iLCJpbm5lckhUTUxEZXNjIiwiT2JqZWN0IiwiZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yIiwiZ2V0UHJvdG90eXBlT2YiLCJjb25maWd1cmFibGUiLCJpbm5lckhUTUxTZXR0ZXIiLCJzZXQiLCJodG1sIiwiY2FsbCIsImRlZmluZVByb3BlcnR5IiwicG9seWZpbGwiLCJlbnVtZXJhYmxlIiwidmFsdWUiLCJhdHRhY2hTaGFkb3ciLCJjcmVhdGVTaGFkb3dSb290IiwidW51c2VkIiwic2hhZG93IiwiSFRNTEVsZW1lbnRQb2x5ZmlsbCIsImNvbnN0cnVjdG9yIiwic2V0UHJvdG90eXBlT2YiLCJzdWJDbGFzcyIsIkhUTUxFbGVtZW50T3JpZyIsIkZ1bmN0aW9uIiwiYmluZCIsIndyYXBIVE1MRWxlbWVudCIsIlJlZmxlY3QiLCJIVE1MRWxlbWVudFdyYXBwZXIiLCJjb25zdHJ1Y3QiLCJzdXBlckNsYXNzIiwiY3JlYXRlIiwid3JpdGFibGUiLCJzdXBwb3J0c1VuZGVyUHJvdG8iLCJwcm90byIsIm9iaiIsIl9fcHJvdG9fXyIsImNvcHlQcm9wZXJ0aWVzIiwiaXNQcm90b3R5cGVPZiIsImdldE93blByb3BlcnR5TmFtZXMiLCJwcm9wIiwiaGFzT3duUHJvcGVydHkiLCJkZXNjIiwiaW5zdGFsbCIsInNob3VsZEluc3RhbGwiLCJoYXNDRSIsImluc3RhbGxXcmFwcGVyIiwiaW5zdGFuY2UiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7O0FBQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBRUEsU0FBUUEsUUFBUjtBQUNBLFNBQVFDLFlBQVI7QUFDQSxTQUFRQyxHQUFSOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsSUFBSUMsY0FBSjs7QUFFQTtBQUNBLElBQUlDLDJCQUFKOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLElBQUlDLGdCQUFKOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxJQUFNQyxVQUFVLEdBQUcsaUNBQW5CO0FBQ0EsSUFBTUMsYUFBYSxHQUFHLENBQ3BCLGdCQURvQixFQUVwQixlQUZvQixFQUdwQixXQUhvQixFQUlwQixlQUpvQixFQUtwQixlQUxvQixFQU1wQixrQkFOb0IsRUFPcEIsZ0JBUG9CLEVBUXBCLGVBUm9CLENBQXRCOztBQVdBO0FBQ0E7QUFDQTtBQUNBLElBQU1DLGFBQWEsR0FBRztBQUNwQixlQUFhLElBRE87QUFFcEIsYUFBVztBQUZTLENBQXRCOztBQUtBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFNBQVNDLGVBQVQsQ0FBeUJDLFdBQXpCLEVBQXNDQyxJQUF0QyxFQUE0QztBQUMxQyxNQUFJLENBQUNMLFVBQVUsQ0FBQ00sSUFBWCxDQUFnQkQsSUFBaEIsQ0FBRCxJ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QXV0aG9ycy4gQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBMaWNlbnNlZCB1bmRlciB0aGUgQXBhY2hlIExpY2Vuc2UsIFZlcnNpb24gMi4wICh0aGUgXCJMaWNlbnNlXCIpO1xuICogeW91IG1heSBub3QgdXNlIHRoaXMgZmlsZSBleGNlcHQgaW4gY29tcGxpYW5jZSB3aXRoIHRoZSBMaWNlbnNlLlxuICogWW91IG1heSBvYnRhaW4gYSBjb3B5IG9mIHRoZSBMaWNlbnNlIGF0XG4gKlxuICogICAgICBodHRwOi8vd3d3LmFwYWNoZS5vcmcvbGljZW5zZXMvTElDRU5TRS0yLjBcbiAqXG4gKiBVbmxlc3MgcmVxdWlyZWQgYnkgYXBwbGljYWJsZSBsYXcgb3IgYWdyZWVkIHRvIGluIHdyaXRpbmcsIHNvZnR3YXJlXG4gKiBkaXN0cmlidXRlZCB1bmRlciB0aGUgTGljZW5zZSBpcyBkaXN0cmlidXRlZCBvbiBhbiBcIkFTLUlTXCIgQkFTSVMsXG4gKiBXSVRIT1VUIFdBUlJBTlRJRVMgT1IgQ09ORElUSU9OUyBPRiBBTlkgS0lORCwgZWl0aGVyIGV4cHJlc3Mgb3IgaW1wbGllZC5cbiAqIFNlZSB0aGUgTGljZW5zZSBmb3IgdGhlIHNwZWNpZmljIGxhbmd1YWdlIGdvdmVybmluZyBwZXJtaXNzaW9ucyBhbmRcbiAqIGxpbWl0YXRpb25zIHVuZGVyIHRoZSBMaWNlbnNlLlxuICovXG5cbmltcG9ydCB7RGVmZXJyZWR9IGZyb20gJyNjb3JlL2RhdGEtc3RydWN0dXJlcy9wcm9taXNlJztcbmltcG9ydCB7cmV0aHJvd0FzeW5jfSBmcm9tICcjY29yZS9lcnJvcic7XG5pbXBvcnQge21hcH0gZnJvbSAnI2NvcmUvdHlwZXMvb2JqZWN0JztcblxuLyoqXG4gKiBGb3IgdHlwZSBhbm90YXRpb25zIHdoZXJlIEVsZW1lbnQgaXMgYSBsb2NhbCB2YXJpYWJsZS5cbiAqIEB0eXBlZGVmIHshRWxlbWVudH1cbiAqL1xubGV0IEVsZW1lbnRPcmlnRGVmO1xuXG4vKiogQHR5cGVkZWYgeyF0eXBlb2YgSFRNTEVsZW1lbnR9ICovXG5sZXQgQ3VzdG9tRWxlbWVudENvbnN0cnVjdG9yRGVmO1xuXG4vKipcbiAqIEB0eXBlZGVmIHt7XG4gKiAgbmFtZTogc3RyaW5nLFxuICogIGN0b3I6ICFDdXN0b21FbGVtZW50Q29uc3RydWN0b3JEZWYsXG4gKiB9fVxuICovXG5sZXQgQ3VzdG9tRWxlbWVudERlZjtcblxuLyoqXG4gKiBWYWxpZGF0ZXMgdGhlIGN1c3RvbSBlbGVtZW50J3MgbmFtZS5cbiAqIFRoaXMgaW50ZW50aW9uYWxseSBpZ25vcmVzIFwidmFsaWRcIiBoaWdoZXIgVW5pY29kZSBDb2RlIFBvaW50cy5cbiAqIGh0dHBzOi8vaHRtbC5zcGVjLndoYXR3Zy5vcmcvbXVsdGlwYWdlL2N1c3RvbS1lbGVtZW50cy5odG1sI3ZhbGlkLWN1c3RvbS1lbGVtZW50LW5hbWVcbiAqL1xuY29uc3QgVkFMSURfTkFNRSA9IC9eW2Etel1bYS16MC05Ll9dKi1bYS16MC05Ll8tXSokLztcbmNvbnN0IElOVkFMSURfTkFNRVMgPSBbXG4gICdhbm5vdGF0aW9uLXhtbCcsXG4gICdjb2xvci1wcm9maWxlJyxcbiAgJ2ZvbnQtZmFjZScsXG4gICdmb250LWZhY2Utc3JjJyxcbiAgJ2ZvbnQtZmFjZS11cmknLFxuICAnZm9udC1mYWNlLWZvcm1hdCcsXG4gICdmb250LWZhY2UtbmFtZScsXG4gICdtaXNzaW5nLWdseXBoJyxcbl07XG5cbi8qKlxuICogQSBNdXRhdGlvbk9ic2VydmVySW5pdCBkaWN0aW9uYXJ5IHRvIHRyYWNrIHN1YnRyZWUgbW9kaWZpY2F0aW9ucy5cbiAqL1xuY29uc3QgVFJBQ0tfU1VCVFJFRSA9IHtcbiAgJ2NoaWxkTGlzdCc6IHRydWUsXG4gICdzdWJ0cmVlJzogdHJ1ZSxcbn07XG5cbi8qKlxuICogQXNzZXJ0cyB0aGF0IHRoZSBjdXN0b20gZWxlbWVudCBuYW1lIGNvbmZvcm1zIHRvIHRoZSBzcGVjLlxuICpcbiAqIEBwYXJhbSB7IXR5cGVvZiBTeW50YXhFcnJvcn0gU3ludGF4RXJyb3JcbiAqIEBwYXJhbSB7c3RyaW5nfSBuYW1lXG4gKi9cbmZ1bmN0aW9uIGFzc2VydFZhbGlkTmFtZShTeW50YXhFcnJvciwgbmFtZSkge1xuICBpZiAoIVZBTElEX05BTUUudGVzdChuYW1lKSB8fCBJTlZBTElEX05BTUVTLmluY2x1ZGVzKG5hbWUpKSB7XG4gICAgdGhyb3cgbmV3IFN5bnRheEVycm9yKGBpbnZhbGlkIGN1c3RvbSBlbGVtZW50IG5hbWUgXCIke25hbWV9XCJgKTtcbiAgfVxufVxuXG4vKipcbiAqIERvZXMgd2luIGhhdmUgYSBmdWxsIEN1c3RvbSBFbGVtZW50cyByZWdpc3RyeT9cbiAqXG4gKiBAcGFyYW0geyFXaW5kb3d9IHdpblxuICogQHJldHVybiB7Ym9vbGVhbn1cbiAqL1xuZnVuY3Rpb24gaGFzQ3VzdG9tRWxlbWVudHMod2luKSB7XG4gIGNvbnN0IHtjdXN0b21FbGVtZW50c30gPSB3aW47XG5cbiAgcmV0dXJuICEhKFxuICAgIGN1c3RvbUVsZW1lbnRzICYmXG4gICAgY3VzdG9tRWxlbWVudHMuZGVmaW5lICYmXG4gICAgY3VzdG9tRWxlbWVudHMuZ2V0ICYmXG4gICAgY3VzdG9tRWxlbWVudHMud2hlbkRlZmluZWRcbiAgKTtcbn1cblxuLyoqXG4gKiBXYXMgSFRNTEVsZW1lbnQgYWxyZWFkeSBwYXRjaGVkIGZvciB0aGlzIHdpbmRvdz9cbiAqXG4gKiBAcGFyYW0geyFXaW5kb3d9IHdpblxuICogQHJldHVybiB7Ym9vbGVhbn1cbiAqL1xuZnVuY3Rpb24gaXNQYXRjaGVkKHdpbikge1xuICBjb25zdCB0YWcgPSB3aW4uSFRNTEVsZW1lbnQudG9TdHJpbmcoKTtcbiAgcmV0dXJuIHRhZy5pbmRleE9mKCdbbmF0aXZlIGNvZGVdJykgPT09IC0xO1xufVxuXG4vKipcbiAqIFRoZSBwdWJsaWMgQ3VzdG9tIEVsZW1lbnRzIEFQSS5cbiAqL1xuY2xhc3MgQ3VzdG9tRWxlbWVudFJlZ2lzdHJ5IHtcbiAgLyoqXG4gICAqIEBwYXJhbSB7IVdpbmRvd30gd2luXG4gICAqIEBwYXJhbSB7IVJlZ2lzdHJ5fSByZWdpc3RyeVxuICAgKi9cbiAgY29uc3RydWN0b3Iod2luLCByZWdpc3RyeSkge1xuICAgIC8qKiBAY29uc3QgQHByaXZhdGUgKi9cbiAgICB0aGlzLndpbl8gPSB3aW47XG5cbiAgICAvKiogQGNvbnN0IEBwcml2YXRlICovXG4gICAgdGhpcy5yZWdpc3RyeV8gPSByZWdpc3RyeTtcblxuICAgIC8qKiBAcHJpdmF0ZSBAY29uc3QgQHR5cGUgeyFPYmplY3Q8c3RyaW5nLCAhRGVmZXJyZWQ+fSAqL1xuICAgIHRoaXMucGVuZGluZ0RlZmluZXNfID0gbWFwKCk7XG4gIH1cblxuICAvKipcbiAgICogUmVnaXN0ZXIgdGhlIGN1c3RvbSBlbGVtZW50LlxuICAgKlxuICAgKiBAcGFyYW0ge3N0cmluZ30gbmFtZVxuICAgKiBAcGFyYW0geyFDdXN0b21FbGVtZW50Q29uc3RydWN0b3JEZWZ9IGN0b3JcbiAgICogQHBhcmFtIHshT2JqZWN0PX0gb3B0aW9uc1xuICAgKi9cbiAgZGVmaW5lKG5hbWUsIGN0b3IsIG9wdGlvbnMpIHtcbiAgICB0aGlzLnJlZ2lzdHJ5Xy5kZWZpbmUobmFtZSwgY3Rvciwgb3B0aW9ucyk7XG5cbiAgICAvLyBJZiBhbnlvbmUgaXMgd2FpdGluZyBmb3IgdGhpcyBjdXN0b20gZWxlbWVudCB0byBiZSBkZWZpbmVkLCByZXNvbHZlXG4gICAgLy8gdGhlaXIgcHJvbWlzZS5cbiAgICBjb25zdCBwZW5kaW5nID0gdGhpcy5wZW5kaW5nRGVmaW5lc187XG4gICAgY29uc3QgZGVmZXJyZWQgPSBwZW5kaW5nW25hbWVdO1xuICAgIGlmIChkZWZlcnJlZCkge1xuICAgICAgZGVmZXJyZWQucmVzb2x2ZSgpO1xuICAgICAgZGVsZXRlIHBlbmRpbmdbbmFtZV07XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIEdldCB0aGUgY29uc3RydWN0b3Igb2YgdGhlIChhbHJlYWR5IGRlZmluZWQpIGN1c3RvbSBlbGVtZW50LlxuICAgKlxuICAgKiBAcGFyYW0ge3N0cmluZ30gbmFtZVxuICAgKiBAcmV0dXJuIHshQ3VzdG9tRWxlbWVudENvbnN0cnVjdG9yRGVmfHVuZGVmaW5lZH1cbiAgICovXG4gIGdldChuYW1lKSB7XG4gICAgY29uc3QgZGVmID0gdGhpcy5yZWdpc3RyeV8uZ2V0QnlOYW1lKG5hbWUpO1xuICAgIGlmIChkZWYpIHtcbiAgICAgIHJldHVybiBkZWYuY3RvcjtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogUmV0dXJucyBhIHByb21pc2UgdGhhdCB3YWl0cyB1bnRpbCB0aGUgY3VzdG9tIGVsZW1lbnQgaXMgZGVmaW5lZC5cbiAgICogSWYgdGhlIGN1c3RvbSBlbGVtZW50IGlzIGFscmVhZHkgZGVmaW5lZCwgcmV0dXJucyBhIHJlc29sdmVkIHByb21pc2UuXG4gICAqXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBuYW1lXG4gICAqIEByZXR1cm4geyFQcm9taXNlPHVuZGVmaW5lZD59XG4gICAqL1xuICB3aGVuRGVmaW5lZChuYW1lKSB7XG4gICAgY29uc3Qge1Byb21pc2UsIFN5bnRheEVycm9yfSA9IHRoaXMud2luXztcbiAgICBhc3NlcnRWYWxpZE5hbWUoU3ludGF4RXJyb3IsIG5hbWUpO1xuXG4gICAgaWYgKHRoaXMucmVnaXN0cnlfLmdldEJ5TmFtZShuYW1lKSkge1xuICAgICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZSgpO1xuICAgIH1cblxuICAgIGNvbnN0IHBlbmRpbmcgPSB0aGlzLnBlbmRpbmdEZWZpbmVzXztcbiAgICBsZXQgZGVmZXJyZWQgPSBwZW5kaW5nW25hbWVdO1xuICAgIGlmICghZGVmZXJyZWQpIHtcbiAgICAgIGRlZmVycmVkID0gbmV3IERlZmVycmVkKCk7XG4gICAgICBwZW5kaW5nW25hbWVdID0gZGVmZXJyZWQ7XG4gICAgfVxuXG4gICAgcmV0dXJuIGRlZmVycmVkLnByb21pc2U7XG4gIH1cblxuICAvKipcbiAgICogVXBncmFkZSBhbGwgY3VzdG9tIGVsZW1lbnRzIGluc2lkZSByb290LlxuICAgKlxuICAgKiBAcGFyYW0geyFOb2RlfSByb290XG4gICAqL1xuICB1cGdyYWRlKHJvb3QpIHtcbiAgICB0aGlzLnJlZ2lzdHJ5Xy51cGdyYWRlKHJvb3QpO1xuICB9XG59XG5cbi8qKlxuICogVGhpcyBpbnRlcm5hbCBBUElzIG5lY2Vzc2FyeSB0byBydW4gdGhlIEN1c3RvbUVsZW1lbnRSZWdpc3RyeS5cbiAqIFNpbmNlIFJlZ2lzdHJ5IGlzIG5ldmVyIGV4cG9zZWQgZXh0ZXJuYWxseSwgYWxsIG1ldGhvZHMgYXJlIGFjdHVhbGx5XG4gKiBhdmFpbGFibGUgb24gdGhlIGluc3RhbmNlLlxuICovXG5jbGFzcyBSZWdpc3RyeSB7XG4gIC8qKlxuICAgKiBAcGFyYW0geyFXaW5kb3d9IHdpblxuICAgKi9cbiAgY29uc3RydWN0b3Iod2luKSB7XG4gICAgLyoqIEBwcml2YXRlIEBjb25zdCAqL1xuICAgIHRoaXMud2luXyA9IHdpbjtcblxuICAgIC8qKiBAcHJpdmF0ZSBAY29uc3QgQHR5cGUgeyFPYmplY3Q8c3RyaW5nLCAhQ3VzdG9tRWxlbWVudERlZj59ICovXG4gICAgdGhpcy5kZWZpbml0aW9uc18gPSBtYXAoKTtcblxuICAgIC8qKlxuICAgICAqIEEgdXAtdG8tZGF0ZSBET00gc2VsZWN0b3IgZm9yIGFsbCBjdXN0b20gZWxlbWVudHMuXG4gICAgICogQHR5cGUge3N0cmluZ31cbiAgICAgKi9cbiAgICB0aGlzLnF1ZXJ5XyA9ICcnO1xuXG4gICAgLyoqXG4gICAgICogVGhlIGN1cnJlbnRseSB1cGdyYWRpbmcgZWxlbWVudC5cbiAgICAgKiBAcHJpdmF0ZSB7P0VsZW1lbnR9XG4gICAgICovXG4gICAgdGhpcy5jdXJyZW50XyA9IG51bGw7XG5cbiAgICAvKipcbiAgICAgKiBPbmNlIHN0YXJ0ZWQgKGFmdGVyIHRoZSBmaXJzdCBDdXN0b20gRWxlbWVudCBkZWZpbml0aW9uKSwgdGhpcyB0cmFja3NcbiAgICAgKiBET00gYXBwZW5kIGFuZCByZW1vdmFscy5cbiAgICAgKlxuICAgICAqIEBwcml2YXRlIHs/TXV0YXRpb25PYnNlcnZlcn1cbiAgICAgKi9cbiAgICB0aGlzLm11dGF0aW9uT2JzZXJ2ZXJfID0gbnVsbDtcblxuICAgIC8qKlxuICAgICAqIEFsbCB0aGUgb2JzZXJ2ZWQgRE9NIHRyZWVzLCBpbmNsdWRpbmcgc2hhZG93IHRyZWVzLlxuICAgICAqXG4gICAgICogQHByaXZhdGUgQGNvbnN0IHshQXJyYXk8IU5vZGU+fVxuICAgICAqL1xuICAgIHRoaXMucm9vdHNfID0gW3dpbi5kb2N1bWVudF07XG4gIH1cblxuICAvKipcbiAgICogVGhlIGN1cnJlbnRseS1iZWluZy11cGdyYWRlZCBjdXN0b20gZWxlbWVudC5cbiAgICpcbiAgICogV2hlbiBhbiBhbHJlYWR5IGNyZWF0ZWQgKHRocm91Z2ggdGhlIERPTSBwYXJzaW5nIEFQSXMsIG9yIGlubmVySFRNTClcbiAgICogY3VzdG9tIGVsZW1lbnQgbm9kZSBpcyBiZWluZyB1cGdyYWRlZCwgd2UgY2FuJ3QganVzdCBjcmVhdGUgYSBuZXcgbm9kZVxuICAgKiAoaXQncyBpbGxlZ2FsIGluIHRoZSBzcGVjKS4gQnV0IHdlIHN0aWxsIG5lZWQgdG8gcnVuIHRoZSBjdXN0b20gZWxlbWVudCdzXG4gICAqIGNvbnN0cnVjdG9yIGNvZGUgb24gdGhlIG5vZGUuIFdlIGF2b2lkIHRoaXMgY29udW5kcnVtIGJ5IHJ1bm5pbmcgdGhlXG4gICAqIGNvbnN0cnVjdG9yIHdoaWxlIHJldHVybmluZyB0aGlzIGN1cnJlbnQgbm9kZSBpbiB0aGUgSFRNTEVsZW1lbnRcbiAgICogY2xhc3MgY29uc3RydWN0b3IgKHRoZSBiYXNlIGNsYXNzIG9mIGFsbCBjdXN0b20gZWxlbWVudHMpLlxuICAgKlxuICAgKiBAcmV0dXJuIHs/RWxlbWVudH1cbiAgICovXG4gIGN1cnJlbnQoKSB7XG4gICAgY29uc3QgY3VycmVudCA9IHRoaXMuY3VycmVudF87XG4gICAgdGhpcy5jdXJyZW50XyA9IG51bGw7XG4gICAgcmV0dXJuIGN1cnJlbnQ7XG4gIH1cblxuICAvKipcbiAgICogRmluZHMgdGhlIGN1c3RvbSBlbGVtZW50IGRlZmluaXRpb24gYnkgbmFtZS5cbiAgICpcbiAgICogQHBhcmFtIHtzdHJpbmd9IG5hbWVcbiAgICogQHJldHVybiB7IUN1c3RvbUVsZW1lbnREZWZ8dW5kZWZpbmVkfVxuICAgKi9cbiAgZ2V0QnlOYW1lKG5hbWUpIHtcbiAgICBjb25zdCBkZWZpbml0aW9uID0gdGhpcy5kZWZpbml0aW9uc19bbmFtZV07XG4gICAgaWYgKGRlZmluaXRpb24pIHtcbiAgICAgIHJldHVybiBkZWZpbml0aW9uO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBGaW5kcyB0aGUgY3VzdG9tIGVsZW1lbnQgZGVmaW5pdGlvbiBieSBjb25zdHJ1Y3RvciBpbnN0YW5jZS5cbiAgICpcbiAgICogQHBhcmFtIHshQ3VzdG9tRWxlbWVudENvbnN0cnVjdG9yRGVmfSBjdG9yXG4gICAqIEByZXR1cm4geyFDdXN0b21FbGVtZW50RGVmfHVuZGVmaW5lZH1cbiAgICovXG4gIGdldEJ5Q29uc3RydWN0b3IoY3Rvcikge1xuICAgIGNvbnN0IGRlZmluaXRpb25zID0gdGhpcy5kZWZpbml0aW9uc187XG5cbiAgICBmb3IgKGNvbnN0IG5hbWUgaW4gZGVmaW5pdGlvbnMpIHtcbiAgICAgIGNvbnN0IGRlZiA9IGRlZmluaXRpb25zW25hbWVdO1xuICAgICAgaWYgKGRlZi5jdG9yID09PSBjdG9yKSB7XG4gICAgICAgIHJldHVybiBkZWY7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIFJlZ2lzdGVycyB0aGUgY3VzdG9tIGVsZW1lbnQgZGVmaW5pdGlvbiwgYW5kIHVwZ3JhZGVzIGFsbCBlbGVtZW50cyBieSB0aGF0XG4gICAqIG5hbWUgaW4gdGhlIHJvb3QgZG9jdW1lbnQuXG4gICAqXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBuYW1lXG4gICAqIEBwYXJhbSB7IUN1c3RvbUVsZW1lbnRDb25zdHJ1Y3RvckRlZn0gY3RvclxuICAgKiBAcGFyYW0geyFPYmplY3R8dW5kZWZpbmVkfSBvcHRpb25zXG4gICAqL1xuICBkZWZpbmUobmFtZSwgY3Rvciwgb3B0aW9ucykge1xuICAgIGNvbnN0IHtFcnJvciwgU3ludGF4RXJyb3J9ID0gdGhpcy53aW5fO1xuXG4gICAgaWYgKG9wdGlvbnMpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcignRXh0ZW5kaW5nIG5hdGl2ZSBjdXN0b20gZWxlbWVudHMgaXMgbm90IHN1cHBvcnRlZCcpO1xuICAgIH1cblxuICAgIGFzc2VydFZhbGlkTmFtZShTeW50YXhFcnJvciwgbmFtZSk7XG5cbiAgICBpZiAodGhpcy5nZXRCeU5hbWUobmFtZSkgfHwgdGhpcy5nZXRCeUNvbnN0cnVjdG9yKGN0b3IpKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoYGR1cGxpY2F0ZSBkZWZpbml0aW9uIFwiJHtuYW1lfVwiYCk7XG4gICAgfVxuXG4gICAgLy8gVE9ETyhqcmlkZ2V3ZWxsKTogUmVjb3JkIGNvbm5lY3RlZENhbGxiYWNrLCBkaXNjb25uZWN0ZWRDYWxsYmFjayxcbiAgICAvLyBhZG9wdGVkQ2FsbGJhY2ssIGF0dHJpYnV0ZUNoYW5nZWRDYWxsYmFjaywgYW5kIG9ic2VydmVkQXR0cmlidXRlcy5cbiAgICAvLyBUT0RPKGpyaWRnZXdlbGwpOiBJZiBhdHRyaWJ1dGVDaGFuZ2VkQ2FsbGJhY2ssIGdhdGhlciBvYnNlcnZlZEF0dHJpYnV0ZXNcbiAgICB0aGlzLmRlZmluaXRpb25zX1tuYW1lXSA9IHtcbiAgICAgIG5hbWUsXG4gICAgICBjdG9yLFxuICAgIH07XG5cbiAgICB0aGlzLm9ic2VydmVfKG5hbWUpO1xuICAgIGZvciAoY29uc3QgdHJlZSBvZiB0aGlzLnJvb3RzXykge1xuICAgICAgdGhpcy51cGdyYWRlKHRyZWUsIG5hbWUpO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBVcGdyYWRlcyBjdXN0b20gZWxlbWVudHMgZGVzY2VuZGFudHMgb2Ygcm9vdCAoYnV0IG5vdCBpbmNsdWRpbmcgcm9vdCkuXG4gICAqXG4gICAqIFdoZW4gY2FsbGVkIHdpdGggYW4gb3B0X3F1ZXJ5LCBpdCBib3RoIHVwZ3JhZGVzIGFuZCBjb25uZWN0cyB0aGUgY3VzdG9tXG4gICAqIGVsZW1lbnRzICh0aGlzIGlzIHVzZWQgZHVyaW5nIHRoZSBjdXN0b20gZWxlbWVudCBkZWZpbmUgYWxnb3JpdGhtKS5cbiAgICpcbiAgICogQHBhcmFtIHshTm9kZX0gcm9vdFxuICAgKiBAcGFyYW0ge3N0cmluZz19IG9wdF9xdWVyeVxuICAgKi9cbiAgdXBncmFkZShyb290LCBvcHRfcXVlcnkpIHtcbiAgICAvLyBPbmx5IEN1c3RvbUVsZW1lbnRSZWdpc3RyeS5wLmRlZmluZSBwcm92aWRlcyBhIHF1ZXJ5ICh0aGUgbmV3bHkgZGVmaW5lZFxuICAgIC8vIGN1c3RvbSBlbGVtZW50KS4gSW4gdGhpcyBjYXNlLCB3ZSBhcmUgYm90aCB1cGdyYWRpbmcgX2FuZF8gY29ubmVjdGluZ1xuICAgIC8vIHRoZSBjdXN0b20gZWxlbWVudHMuXG4gICAgY29uc3QgbmV3bHlEZWZpbmVkID0gISFvcHRfcXVlcnk7XG4gICAgY29uc3QgcXVlcnkgPSBvcHRfcXVlcnkgfHwgdGhpcy5xdWVyeV87XG4gICAgY29uc3QgdXBncmFkZUNhbmRpZGF0ZXMgPSB0aGlzLnF1ZXJ5QWxsXyhyb290LCBxdWVyeSk7XG5cbiAgICBmb3IgKGNvbnN0IGNhbmRpZGF0ZSBvZiB1cGdyYWRlQ2FuZGlkYXRlcykge1xuICAgICAgaWYgKG5ld2x5RGVmaW5lZCkge1xuICAgICAgICB0aGlzLmNvbm5lY3RlZENhbGxiYWNrXyhjYW5kaWRhdGUpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhpcy51cGdyYWRlU2VsZihjYW5kaWRhdGUpO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBVcGdyYWRlcyB0aGUgY3VzdG9tIGVsZW1lbnQgbm9kZSwgaWYgYSBjdXN0b20gZWxlbWVudCBoYXMgYmVlbiByZWdpc3RlcmVkXG4gICAqIGJ5IHRoaXMgbmFtZS5cbiAgICpcbiAgICogQHBhcmFtIHshTm9kZX0gbm9kZVxuICAgKi9cbiAgdXBncmFkZVNlbGYobm9kZSkge1xuICAgIGNvbnN0IGRlZiA9IHRoaXMuZ2V0QnlOYW1lKG5vZGUubG9jYWxOYW1lKTtcbiAgICBpZiAoIWRlZikge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIHRoaXMudXBncmFkZVNlbGZfKC8qKiBAdHlwZSB7IUVsZW1lbnR9ICovIChub2RlKSwgZGVmKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBAcGFyYW0geyFOb2RlfSByb290XG4gICAqIEBwYXJhbSB7c3RyaW5nfSBxdWVyeVxuICAgKiBAcmV0dXJuIHshQXJyYXl8IU5vZGVMaXN0fVxuICAgKi9cbiAgcXVlcnlBbGxfKHJvb3QsIHF1ZXJ5KSB7XG4gICAgaWYgKCFxdWVyeSB8fCAhcm9vdC5xdWVyeVNlbGVjdG9yQWxsKSB7XG4gICAgICAvLyBOb3RoaW5nIHRvIGRvLi4uXG4gICAgICByZXR1cm4gW107XG4gICAgfVxuXG4gICAgcmV0dXJuIHJvb3QucXVlcnlTZWxlY3RvckFsbChxdWVyeSk7XG4gIH1cblxuICAvKipcbiAgICogVXBncmFkZXMgdGhlIChhbHJlYWR5IGNyZWF0ZWQgdmlhIERPTSBwYXJzaW5nKSBjdXN0b20gZWxlbWVudC5cbiAgICpcbiAgICogQHBhcmFtIHshRWxlbWVudH0gbm9kZVxuICAgKiBAcGFyYW0geyFDdXN0b21FbGVtZW50RGVmfSBkZWZcbiAgICovXG4gIHVwZ3JhZGVTZWxmXyhub2RlLCBkZWYpIHtcbiAgICBjb25zdCB7Y3Rvcn0gPSBkZWY7XG4gICAgaWYgKG5vZGUgaW5zdGFuY2VvZiBjdG9yKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgLy8gRGVzcGl0ZSBob3cgaXQgbG9va3MsIHRoaXMgaXMgbm90IGEgdXNlbGVzcyBjb25zdHJ1Y3Rpb24uXG4gICAgLy8gSFRNTEVsZW1lbnRQb2x5ZmlsbCAodGhlIGJhc2UgY2xhc3Mgb2YgYWxsIGN1c3RvbSBlbGVtZW50cykgd2lsbCByZXR1cm5cbiAgICAvLyB0aGUgY3VycmVudCBub2RlLCBhbGxvd2luZyB0aGUgY3VzdG9tIGVsZW1lbnQncyBzdWJjbGFzcyBjb25zdHJ1Y3RvciB0b1xuICAgIC8vIHJ1biBvbiB0aGUgbm9kZS4gVGhlIG5vZGUgaXRzZWxmIGlzIGFscmVhZHkgY29uc3RydWN0ZWQsIHNvIHRoZSByZXR1cm5cbiAgICAvLyB2YWx1ZSBpcyBqdXN0IHRoZSBub2RlLlxuICAgIHRoaXMuY3VycmVudF8gPSBub2RlO1xuICAgIHRyeSB7XG4gICAgICBjb25zdCBlbCA9IG5ldyBjdG9yKCk7XG5cbiAgICAgIGlmIChlbCAhPT0gbm9kZSkge1xuICAgICAgICB0aHJvdyBuZXcgdGhpcy53aW5fLkVycm9yKFxuICAgICAgICAgICdDb25zdHJ1Y3RvciBpbGxlZ2FsbHkgcmV0dXJuZWQgYSBkaWZmZXJlbnQgaW5zdGFuY2UuJ1xuICAgICAgICApO1xuICAgICAgfVxuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgIHJldGhyb3dBc3luYyhlKTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogRmlyZXMgY29ubmVjdGVkQ2FsbGJhY2sgb24gdGhlIGN1c3RvbSBlbGVtZW50LCBpZiBpdCBoYXMgb25lLlxuICAgKiBUaGlzIGFsc28gdXBncmFkZXMgdGhlIGN1c3RvbSBlbGVtZW50LCBzaW5jZSBpdCBtYXkgbm90IGhhdmUgYmVlblxuICAgKiBhY2Nlc3NpYmxlIHZpYSB0aGUgcm9vdCBkb2N1bWVudCBiZWZvcmUgKGEgZGV0YWNoZWQgRE9NIHRyZWUpLlxuICAgKlxuICAgKiBAcGFyYW0geyFOb2RlfSBub2RlXG4gICAqL1xuICBjb25uZWN0ZWRDYWxsYmFja18obm9kZSkge1xuICAgIGNvbnN0IGRlZiA9IHRoaXMuZ2V0QnlOYW1lKG5vZGUubG9jYWxOYW1lKTtcbiAgICBpZiAoIWRlZikge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBub2RlID0gLyoqIEB0eXBlIHshSFRNTEVsZW1lbnR9ICovIChub2RlKTtcbiAgICB0aGlzLnVwZ3JhZGVTZWxmXyhub2RlLCBkZWYpO1xuICAgIC8vIFRPRE8oanJpZGdld2VsbCk6IEl0IG1heSBiZSBhcHByb3ByaWF0ZSB0byBhZG9wdENhbGxiYWNrLCBpZiB0aGUgbm9kZVxuICAgIC8vIHVzZWQgdG8gYmUgaW4gYW5vdGhlciBkb2MuXG4gICAgLy8gVE9ETyhqcmlkZ2V3ZWxsKTogSSBzaG91bGQgYmUgY2FsbGluZyB0aGUgZGVmaW5pdGlvbnMgY29ubmVjdGVkQ2FsbGJhY2tcbiAgICAvLyB3aXRoIG5vZGUgYXMgdGhlIGNvbnRleHQuXG4gICAgaWYgKG5vZGUuY29ubmVjdGVkQ2FsbGJhY2spIHtcbiAgICAgIHRyeSB7XG4gICAgICAgIG5vZGUuY29ubmVjdGVkQ2FsbGJhY2soKTtcbiAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgcmV0aHJvd0FzeW5jKGUpO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBGaXJlcyBkaXNjb25uZWN0ZWRDYWxsYmFjayBvbiB0aGUgY3VzdG9tIGVsZW1lbnQsIGlmIGl0IGhhcyBvbmUuXG4gICAqXG4gICAqIEBwYXJhbSB7IU5vZGV9IG5vZGVcbiAgICovXG4gIGRpc2Nvbm5lY3RlZENhbGxiYWNrXyhub2RlKSB7XG4gICAgLy8gVE9ETyhqcmlkZ2V3ZWxsKTogSSBzaG91bGQgYmUgY2FsbGluZyB0aGUgZGVmaW5pdGlvbnMgY29ubmVjdGVkQ2FsbGJhY2tcbiAgICAvLyB3aXRoIG5vZGUgYXMgdGhlIGNvbnRleHQuXG4gICAgbm9kZSA9IC8qKiBAdHlwZSB7IUhUTUxFbGVtZW50fSAqLyAobm9kZSk7XG4gICAgaWYgKG5vZGUuZGlzY29ubmVjdGVkQ2FsbGJhY2spIHtcbiAgICAgIHRyeSB7XG4gICAgICAgIG5vZGUuZGlzY29ubmVjdGVkQ2FsbGJhY2soKTtcbiAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgcmV0aHJvd0FzeW5jKGUpO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBSZWNvcmRzIG5hbWUgYXMgYSByZWdpc3RlcmVkIGN1c3RvbSBlbGVtZW50IHRvIG9ic2VydmUuXG4gICAqXG4gICAqIFN0YXJ0cyB0aGUgTXV0YXRpb24gT2JzZXJ2ZXIgaWYgdGhpcyBpcyB0aGUgZmlyc3QgcmVnaXN0ZXJlZCBjdXN0b21cbiAgICogZWxlbWVudC4gVGhpcyBpcyBkZWZlcnJlZCB1bnRpbCB0aGUgZmlyc3QgY3VzdG9tIGVsZW1lbnQgaXMgZGVmaW5lZCB0b1xuICAgKiBzcGVlZCB1cCBpbml0aWFsIHJlbmRlcmluZyBvZiB0aGUgcGFnZS5cbiAgICpcbiAgICogTXV0YXRpb24gT2JzZXJ2ZXJzIGFyZSBjb252ZW5pZW50bHkgYXZhaWxhYmxlIGluIGV2ZXJ5IGJyb3dzZXIgd2UgY2FyZVxuICAgKiBhYm91dC4gV2hlbiBhIG5vZGUgaXMgY29ubmVjdGVkIHRvIHRoZSByb290IGRvY3VtZW50LCBhbGwgY3VzdG9tXG4gICAqIGVsZW1lbnRzIChpbmNsdWRpbmcgdGhhdCBub2RlIGl0ZXNlbGYpIHdpbGwgYmUgdXBncmFkZWQgYW5kIGNhbGxcbiAgICogY29ubmVjdGVkQ2FsbGJhY2suIFdoZW4gYSBub2RlIGlzIGRpc2Nvbm5lY3RlZENhbGxiYWNrIGZyb20gdGhlIHJvb3RcbiAgICogZG9jdW1lbnQsIGFsbCBjdXN0b20gZWxlbWVudHMgd2lsbCBjYWxsIGRpc2Nvbm5lY3RlZENhbGxiYWNrLlxuICAgKlxuICAgKiBAcGFyYW0ge3N0cmluZ30gbmFtZVxuICAgKi9cbiAgb2JzZXJ2ZV8obmFtZSkge1xuICAgIGlmICh0aGlzLnF1ZXJ5Xykge1xuICAgICAgdGhpcy5xdWVyeV8gKz0gYCwke25hbWV9YDtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICB0aGlzLnF1ZXJ5XyA9IG5hbWU7XG5cbiAgICAvLyBUaGUgZmlyc3QgcmVnaXN0ZXJlZCBuYW1lIHN0YXJ0cyB0aGUgbXV0YXRpb24gb2JzZXJ2ZXIuXG4gICAgY29uc3QgbW8gPSBuZXcgdGhpcy53aW5fLk11dGF0aW9uT2JzZXJ2ZXIoKHJlY29yZHMpID0+IHtcbiAgICAgIGlmIChyZWNvcmRzKSB7XG4gICAgICAgIHRoaXMuaGFuZGxlUmVjb3Jkc18ocmVjb3Jkcyk7XG4gICAgICB9XG4gICAgfSk7XG4gICAgdGhpcy5tdXRhdGlvbk9ic2VydmVyXyA9IG1vO1xuXG4gICAgLy8gSSB3b3VsZCBsb3ZlIHRvIG5vdCBoYXZlIHRvIGhvbGQgb250byBhbGwgb2YgdGhlIHJvb3RzLCBzaW5jZSBpdCdzIGFcbiAgICAvLyBtZW1vcnkgbGVhay4gVW5mb3J0dW5hdGVseSwgdGhlcmUncyBubyB3YXkgdG8gaXRlcmF0ZSBhIGxpc3QgYW5kIGhvbGRcbiAgICAvLyBvbnRvIGl0cyBjb250ZW50cyB3ZWFrbHkuXG4gICAgZm9yIChjb25zdCB0cmVlIG9mIHRoaXMucm9vdHNfKSB7XG4gICAgICBtby5vYnNlcnZlKHRyZWUsIFRSQUNLX1NVQlRSRUUpO1xuICAgIH1cblxuICAgIGluc3RhbGxQYXRjaGVzKHRoaXMud2luXywgdGhpcyk7XG4gIH1cblxuICAvKipcbiAgICogQWRkcyB0aGUgc2hhZG93IHRyZWUgdG8gYmUgb2JzZXJ2ZWQgYnkgdGhlIHBvbHlmaWxsLlxuICAgKlxuICAgKiBAcGFyYW0geyFOb2RlfSB0cmVlXG4gICAqL1xuICBvYnNlcnZlKHRyZWUpIHtcbiAgICB0aGlzLnJvb3RzXy5wdXNoKHRyZWUpO1xuICAgIGlmICh0aGlzLm11dGF0aW9uT2JzZXJ2ZXJfKSB7XG4gICAgICB0aGlzLm11dGF0aW9uT2JzZXJ2ZXJfLm9ic2VydmUodHJlZSwgVFJBQ0tfU1VCVFJFRSk7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIFRoaXMgY2F1c2VzIGEgc3luY2hyb25vdXMgaGFuZGxpbmcgb2YgYWxsIHRoZSBNdXRhdGlvbiBPYnNlcnZlcidzIHRyYWNrZWRcbiAgICogbXV0YXRpb25zLiBUaGlzIGRvZXMgbm90aGluZyB1bnRpbCB0aGUgbXV0YXRpb24gb2JzZXJ2ZXIgaXMgYWN0dWFsbHlcbiAgICogcmVnaXN0ZXJlZCBvbiB0aGUgZmlyc3QgQ3VzdG9tIEVsZW1lbnQgZGVmaW5pdGlvbi5cbiAgICovXG4gIHN5bmMoKSB7XG4gICAgaWYgKHRoaXMubXV0YXRpb25PYnNlcnZlcl8pIHtcbiAgICAgIHRoaXMuaGFuZGxlUmVjb3Jkc18odGhpcy5tdXRhdGlvbk9ic2VydmVyXy50YWtlUmVjb3JkcygpKTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogSGFuZGxlIGFsbCB0aGUgTXV0YXRpb24gT2JzZXJ2ZXIncyBNdXRhdGlvbiBSZWNvcmRzLlxuICAgKiBBbGwgYWRkZWQgY3VzdG9tIGVsZW1lbnRzIHdpbGwgYmUgdXBncmFkZWQgKGlmIG5vdCBhbHJlYWR5KSBhbmQgY2FsbFxuICAgKiBjb25uZWN0ZWRDYWxsYmFjay4gQWxsIHJlbW92ZWQgY3VzdG9tIGVsZW1lbnRzIHdpbGwgY2FsbFxuICAgKiBkaXNjb25uZWN0ZWRDYWxsYmFjay5cbiAgICpcbiAgICogQHBhcmFtIHshQXJyYXk8IU11dGF0aW9uUmVjb3JkPn0gcmVjb3Jkc1xuICAgKi9cbiAgaGFuZGxlUmVjb3Jkc18ocmVjb3Jkcykge1xuICAgIGZvciAoY29uc3QgcmVjb3JkIG9mIHJlY29yZHMpIHtcbiAgICAgIGlmICghcmVjb3JkKSB7XG4gICAgICAgIGNvbnRpbnVlO1xuICAgICAgfVxuXG4gICAgICBjb25zdCB7YWRkZWROb2RlcywgcmVtb3ZlZE5vZGVzfSA9IHJlY29yZDtcbiAgICAgIGZvciAoY29uc3Qgbm9kZSBvZiBhZGRlZE5vZGVzKSB7XG4gICAgICAgIGNvbnN0IGNvbm5lY3RlZENhbmRpZGF0ZXMgPSB0aGlzLnF1ZXJ5QWxsXyhub2RlLCB0aGlzLnF1ZXJ5Xyk7XG4gICAgICAgIHRoaXMuY29ubmVjdGVkQ2FsbGJhY2tfKG5vZGUpO1xuICAgICAgICBmb3IgKGNvbnN0IGNhbmRpZGF0ZSBvZiBjb25uZWN0ZWRDYW5kaWRhdGVzKSB7XG4gICAgICAgICAgdGhpcy5jb25uZWN0ZWRDYWxsYmFja18oY2FuZGlkYXRlKTtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICBmb3IgKGNvbnN0IG5vZGUgb2YgcmVtb3ZlZE5vZGVzKSB7XG4gICAgICAgIGNvbnN0IGRpc2Nvbm5lY3RlZENhbmRpZGF0ZXMgPSB0aGlzLnF1ZXJ5QWxsXyhub2RlLCB0aGlzLnF1ZXJ5Xyk7XG4gICAgICAgIHRoaXMuZGlzY29ubmVjdGVkQ2FsbGJhY2tfKG5vZGUpO1xuICAgICAgICBmb3IgKGNvbnN0IGNhbmRpZGF0ZSBvZiBkaXNjb25uZWN0ZWRDYW5kaWRhdGVzKSB7XG4gICAgICAgICAgdGhpcy5kaXNjb25uZWN0ZWRDYWxsYmFja18oY2FuZGlkYXRlKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgfVxufVxuXG4vKipcbiAqIFBhdGNoZXMgdGhlIERPTSBBUElzIHRvIHN1cHBvcnQgc3luY2hyb25vdXMgQ3VzdG9tIEVsZW1lbnRzLlxuICogQHBhcmFtIHshV2luZG93fSB3aW5cbiAqIEBwYXJhbSB7IVJlZ2lzdHJ5fSByZWdpc3RyeVxuICovXG5mdW5jdGlvbiBpbnN0YWxsUGF0Y2hlcyh3aW4sIHJlZ2lzdHJ5KSB7XG4gIGNvbnN0IHtEb2N1bWVudCwgRWxlbWVudCwgTm9kZSwgZG9jdW1lbnR9ID0gd2luO1xuICBjb25zdCBkb2NQcm90byA9IERvY3VtZW50LnByb3RvdHlwZTtcbiAgY29uc3QgZWxQcm90byA9IEVsZW1lbnQucHJvdG90eXBlO1xuICBjb25zdCBub2RlUHJvdG8gPSBOb2RlLnByb3RvdHlwZTtcbiAgY29uc3Qge2NyZWF0ZUVsZW1lbnQsIGltcG9ydE5vZGV9ID0gZG9jUHJvdG87XG4gIGNvbnN0IHthcHBlbmRDaGlsZCwgY2xvbmVOb2RlLCBpbnNlcnRCZWZvcmUsIHJlbW92ZUNoaWxkLCByZXBsYWNlQ2hpbGR9ID1cbiAgICBub2RlUHJvdG87XG5cbiAgLy8gUGF0Y2ggY3JlYXRlRWxlbWVudCB0byBpbW1lZGlhdGVseSB1cGdyYWRlIHRoZSBjdXN0b20gZWxlbWVudC5cbiAgLy8gVGhpcyBoYXMgdGhlIGFkZGVkIGJlbmVmaXQgdGhhdCBpdCBhdm9pZHMgdGhlIFwiYWxyZWFkeSBjcmVhdGVkIGJ1dCBuZWVkc1xuICAvLyBjb25zdHJ1Y3RvciBjb2RlIHJ1blwiIGNoaWNrZW4tYW5kLWVnZyBwcm9ibGVtLlxuICBkb2NQcm90by5jcmVhdGVFbGVtZW50ID0gZnVuY3Rpb24gKG5hbWUpIHtcbiAgICBjb25zdCBkZWYgPSByZWdpc3RyeS5nZXRCeU5hbWUobmFtZSk7XG4gICAgaWYgKGRlZikge1xuICAgICAgcmV0dXJuIG5ldyBkZWYuY3RvcigpO1xuICAgIH1cbiAgICByZXR1cm4gY3JlYXRlRWxlbWVudC5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICB9O1xuXG4gIC8vIFBhdGNoIGltcG9ydE5vZGUgdG8gaW1tZWRpYXRlbHkgdXBncmFkZSBjdXN0b20gZWxlbWVudHMuXG4gIC8vIFRPRE8oanJpZGdld2VsbCk6IENhbiBmaXJlIGFkb3B0ZWRDYWxsYmFjayBmb3IgY3Jvc3MgZG9jIGltcG9ydHMuXG4gIGRvY1Byb3RvLmltcG9ydE5vZGUgPSBmdW5jdGlvbiAoKSB7XG4gICAgY29uc3QgaW1wb3J0ZWQgPSBpbXBvcnROb2RlLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG5cbiAgICAvLyBPbmx5IHVwZ3JhZGUgZWxlbWVudHMgaWYgdGhlIGRvY3VtZW50IHRoYXQgdGhlIG5vZGVzIHdlcmUgaW1wb3J0ZWQgaW50b1xuICAgIC8vIGlzIF90aGlzXyBkb2N1bWVudC4gSWYgaXQncyBhbm90aGVyIGRvY3VtZW50LCB0aGVuIHRoYXQgZG9jdW1lbnQnc1xuICAgIC8vIGVsZW1lbnQgcmVnaXN0cnkgbXVzdCBkbyB0aGUgdXBncmFkZS5cbiAgICAvLyBFZywgd2hlbiBpbXBvcnRpbmcgZnJvbSBhIDx0ZW1wbGF0ZT4sIHRoZSBjbG9uZWQgZG9jdW1lbnQgZnJhZ21lbnRcbiAgICAvLyBzaG91bGQgYmUgdXBncmFkZWQuIEJ1dCBpbXBvcnRpbmcgZnJvbSBkb2N1bWVudCBpbnRvIHRoZSA8dGVtcGxhdGU+XG4gICAgLy8gc2hvdWxkIG5vdC5cbiAgICBpZiAoaW1wb3J0ZWQgJiYgdGhpcyA9PT0gZG9jdW1lbnQpIHtcbiAgICAgIHJlZ2lzdHJ5LnVwZ3JhZGVTZWxmKGltcG9ydGVkKTtcbiAgICAgIHJlZ2lzdHJ5LnVwZ3JhZGUoaW1wb3J0ZWQpO1xuICAgIH1cbiAgICByZXR1cm4gaW1wb3J0ZWQ7XG4gIH07XG5cbiAgLy8gUGF0Y2ggYXBwZW5kQ2hpbGQgdG8gdXBncmFkZSBjdXN0b20gZWxlbWVudHMgYmVmb3JlIHJldHVybmluZy5cbiAgbm9kZVByb3RvLmFwcGVuZENoaWxkID0gZnVuY3Rpb24gKCkge1xuICAgIGNvbnN0IGFwcGVuZGVkID0gYXBwZW5kQ2hpbGQuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgICByZWdpc3RyeS5zeW5jKCk7XG4gICAgcmV0dXJuIGFwcGVuZGVkO1xuICB9O1xuXG4gIC8vIFBhdGNoIGluc2VydEJlZm9yZSB0byB1cGdyYWRlIGN1c3RvbSBlbGVtZW50cyBiZWZvcmUgcmV0dXJuaW5nLlxuICBub2RlUHJvdG8uaW5zZXJ0QmVmb3JlID0gZnVuY3Rpb24gKCkge1xuICAgIGNvbnN0IGluc2VydGVkID0gaW5zZXJ0QmVmb3JlLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gICAgcmVnaXN0cnkuc3luYygpO1xuICAgIHJldHVybiBpbnNlcnRlZDtcbiAgfTtcblxuICAvLyBQYXRjaCByZW1vdmVDaGlsZCB0byB1cGdyYWRlIGN1c3RvbSBlbGVtZW50cyBiZWZvcmUgcmV0dXJuaW5nLlxuICBub2RlUHJvdG8ucmVtb3ZlQ2hpbGQgPSBmdW5jdGlvbiAoKSB7XG4gICAgY29uc3QgcmVtb3ZlZCA9IHJlbW92ZUNoaWxkLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gICAgcmVnaXN0cnkuc3luYygpO1xuICAgIHJldHVybiByZW1vdmVkO1xuICB9O1xuXG4gIC8vIFBhdGNoIHJlcGxhY2VDaGlsZCB0byB1cGdyYWRlIGFuZCBkZXRhY2ggY3VzdG9tIGVsZW1lbnRzIGJlZm9yZSByZXR1cm5pbmcuXG4gIG5vZGVQcm90by5yZXBsYWNlQ2hpbGQgPSBmdW5jdGlvbiAoKSB7XG4gICAgY29uc3QgcmVwbGFjZWQgPSByZXBsYWNlQ2hpbGQuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgICByZWdpc3RyeS5zeW5jKCk7XG4gICAgcmV0dXJuIHJlcGxhY2VkO1xuICB9O1xuXG4gIC8vIFBhdGNoIGNsb25lTm9kZSB0byBpbW1lZGlhdGVseSB1cGdyYWRlIGN1c3RvbSBlbGVtZW50cy5cbiAgbm9kZVByb3RvLmNsb25lTm9kZSA9IGZ1bmN0aW9uICgpIHtcbiAgICBjb25zdCBjbG9uZWQgPSBjbG9uZU5vZGUuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcblxuICAgIC8vIE9ubHkgdXBncmFkZSBlbGVtZW50cyBpZiB0aGUgY2xvbmVkIG5vZGUgYmVsb25nZWQgdG8gX3RoaXNfIGRvY3VtZW50LlxuICAgIC8vIEVnLCB3aGVuIGNsb25pbmcgYSA8dGVtcGxhdGU+J3MgY29udGVudCwgdGhlIGNsb25lZCBkb2N1bWVudCBmcmFnbWVudFxuICAgIC8vIGRvZXMgbm90IGJlbG9uZyB0byB0aGlzIGRvY3VtZW50LlxuICAgIGlmIChjbG9uZWQub3duZXJEb2N1bWVudCA9PT0gZG9jdW1lbnQpIHtcbiAgICAgIHJlZ2lzdHJ5LnVwZ3JhZGVTZWxmKGNsb25lZCk7XG4gICAgICByZWdpc3RyeS51cGdyYWRlKGNsb25lZCk7XG4gICAgfVxuICAgIHJldHVybiBjbG9uZWQ7XG4gIH07XG5cbiAgLy8gUGF0Y2ggdGhlIGlubmVySFRNTCBzZXR0ZXIgdG8gaW1tZWRpYXRlbHkgdXBncmFkZSBjdXN0b20gZWxlbWVudHMuXG4gIC8vIE5vdGUsIHRoaXMgY291bGQgdGVjaG5pY2FsbHkgZmlyZSBjb25uZWN0ZWRDYWxsYmFja3MgaWYgdGhpcyBub2RlIHdhc1xuICAvLyBjb25uZWN0ZWQsIGJ1dCB3ZSBsZWF2ZSB0aGF0IHRvIHRoZSBNdXRhdGlvbiBPYnNlcnZlci5cbiAgbGV0IGlubmVySFRNTFByb3RvID0gZWxQcm90bztcbiAgbGV0IGlubmVySFRNTERlc2MgPSBPYmplY3QuZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yKFxuICAgIGlubmVySFRNTFByb3RvLFxuICAgICdpbm5lckhUTUwnXG4gICk7XG4gIGlmICghaW5uZXJIVE1MRGVzYykge1xuICAgIC8vIFNpZ2guLi4gSUUxMSBwdXRzIGlubmVySFRNTCBkZXNjaXB0b3Igb24gSFRNTEVsZW1lbnQuIEJ1dCwgd2UndmVcbiAgICAvLyByZXBsYWNlZCBIVE1MRWxlbWVudCB3aXRoIGEgcG9seWZpbGwgd3JhcHBlciwgc28gaGF2ZSB0byBnZXQgaXRzIHByb3RvLlxuICAgIGlubmVySFRNTFByb3RvID0gT2JqZWN0LmdldFByb3RvdHlwZU9mKHdpbi5IVE1MRWxlbWVudC5wcm90b3R5cGUpO1xuICAgIGlubmVySFRNTERlc2MgPSBPYmplY3QuZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yKFxuICAgICAgaW5uZXJIVE1MUHJvdG8sXG4gICAgICAnaW5uZXJIVE1MJ1xuICAgICk7XG4gIH1cbiAgaWYgKGlubmVySFRNTERlc2M/LmNvbmZpZ3VyYWJsZSkge1xuICAgIGNvbnN0IGlubmVySFRNTFNldHRlciA9IGlubmVySFRNTERlc2Muc2V0O1xuICAgIGlubmVySFRNTERlc2Muc2V0ID0gZnVuY3Rpb24gKGh0bWwpIHtcbiAgICAgIGlubmVySFRNTFNldHRlci5jYWxsKHRoaXMsIGh0bWwpO1xuICAgICAgcmVnaXN0cnkudXBncmFkZSh0aGlzKTtcbiAgICB9O1xuICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShcbiAgICAgIC8qKiBAdHlwZSB7IU9iamVjdH0gKi8gKGlubmVySFRNTFByb3RvKSxcbiAgICAgICdpbm5lckhUTUwnLFxuICAgICAgaW5uZXJIVE1MRGVzY1xuICAgICk7XG4gIH1cbn1cblxuLyoqXG4gKiBEb2VzIHRoZSBwb2x5ZmlsbGluZy5cbiAqIEBwYXJhbSB7IVdpbmRvd30gd2luXG4gKi9cbmZ1bmN0aW9uIHBvbHlmaWxsKHdpbikge1xuICBjb25zdCB7RWxlbWVudCwgSFRNTEVsZW1lbnQsIGRvY3VtZW50fSA9IHdpbjtcbiAgY29uc3Qge2NyZWF0ZUVsZW1lbnR9ID0gZG9jdW1lbnQ7XG5cbiAgY29uc3QgcmVnaXN0cnkgPSBuZXcgUmVnaXN0cnkod2luKTtcbiAgY29uc3QgY3VzdG9tRWxlbWVudHMgPSBuZXcgQ3VzdG9tRWxlbWVudFJlZ2lzdHJ5KHdpbiwgcmVnaXN0cnkpO1xuXG4gIC8vIEV4cG9zZSB0aGUgY3VzdG9tIGVsZW1lbnQgcmVnaXN0cnkuXG4gIC8vIE9iamVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3Iod2luZG93LCAnY3VzdG9tRWxlbWVudHMnKVxuICAvLyB7Z2V0OiDGkiwgc2V0OiB1bmRlZmluZWQsIGVudW1lcmFibGU6IHRydWUsIGNvbmZpZ3VyYWJsZTogdHJ1ZX1cbiAgT2JqZWN0LmRlZmluZVByb3BlcnR5KHdpbiwgJ2N1c3RvbUVsZW1lbnRzJywge1xuICAgIGVudW1lcmFibGU6IHRydWUsXG4gICAgY29uZmlndXJhYmxlOiB0cnVlLFxuICAgIC8vIHdyaXRhYmxlOiBmYWxzZSxcbiAgICB2YWx1ZTogY3VzdG9tRWxlbWVudHMsXG4gIH0pO1xuXG4gIC8vIEhhdmUgdG8gcGF0Y2ggc2hhZG93IG1ldGhvZHMgbm93LCBzaW5jZSB0aGVyZSdzIG5vIHdheSB0byBmaW5kIHNoYWRvdyB0cmVlc1xuICAvLyBsYXRlci5cbiAgY29uc3QgZWxQcm90byA9IEVsZW1lbnQucHJvdG90eXBlO1xuICBjb25zdCB7YXR0YWNoU2hhZG93LCBjcmVhdGVTaGFkb3dSb290fSA9IGVsUHJvdG87XG4gIGlmIChhdHRhY2hTaGFkb3cpIHtcbiAgICAvKipcbiAgICAgKiBAcGFyYW0ge3ttb2RlOiBzdHJpbmd9fSB1bnVzZWRcbiAgICAgKiBAcmV0dXJuIHshU2hhZG93Um9vdH1cbiAgICAgKi9cbiAgICBlbFByb3RvLmF0dGFjaFNoYWRvdyA9IGZ1bmN0aW9uICh1bnVzZWQpIHtcbiAgICAgIGNvbnN0IHNoYWRvdyA9IGF0dGFjaFNoYWRvdy5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICAgICAgcmVnaXN0cnkub2JzZXJ2ZShzaGFkb3cpO1xuICAgICAgcmV0dXJuIHNoYWRvdztcbiAgICB9O1xuICAgIC8vIE5lY2Vzc2FyeSBmb3IgU2hhZG93IEFNUFxuICAgIGVsUHJvdG8uYXR0YWNoU2hhZG93LnRvU3RyaW5nID0gZnVuY3Rpb24gKCkge1xuICAgICAgcmV0dXJuIGF0dGFjaFNoYWRvdy50b1N0cmluZygpO1xuICAgIH07XG4gIH1cbiAgaWYgKGNyZWF0ZVNoYWRvd1Jvb3QpIHtcbiAgICAvKiogQHJldHVybiB7IVNoYWRvd1Jvb3R9ICovXG4gICAgZWxQcm90by5jcmVhdGVTaGFkb3dSb290ID0gZnVuY3Rpb24gKCkge1xuICAgICAgY29uc3Qgc2hhZG93ID0gY3JlYXRlU2hhZG93Um9vdC5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICAgICAgcmVnaXN0cnkub2JzZXJ2ZShzaGFkb3cpO1xuICAgICAgcmV0dXJuIHNoYWRvdztcbiAgICB9O1xuICAgIC8vIE5lY2Vzc2FyeSBmb3IgU2hhZG93IEFNUFxuICAgIGVsUHJvdG8uY3JlYXRlU2hhZG93Um9vdC50b1N0cmluZyA9IGZ1bmN0aW9uICgpIHtcbiAgICAgIHJldHVybiBjcmVhdGVTaGFkb3dSb290LnRvU3RyaW5nKCk7XG4gICAgfTtcbiAgfVxuXG4gIC8qKlxuICAgKiBZb3UgY2FuJ3QgdXNlIHRoZSByZWFsIEhUTUxFbGVtZW50IGNvbnN0cnVjdG9yLCBiZWNhdXNlIHlvdSBjYW4ndCBzdWJjbGFzc1xuICAgKiBpdCB3aXRob3V0IHVzaW5nIG5hdGl2ZSBjbGFzc2VzLiBTbywgbW9jayBpdHMgYXBwcm94aW1hdGlvbiB1c2luZ1xuICAgKiBjcmVhdGVFbGVtZW50LlxuICAgKiBAcmV0dXJuIHshRWxlbWVudE9yaWdEZWZ9XG4gICAqL1xuICBmdW5jdGlvbiBIVE1MRWxlbWVudFBvbHlmaWxsKCkge1xuICAgIGNvbnN0IHtjb25zdHJ1Y3Rvcn0gPSB0aGlzO1xuXG4gICAgLy8gSWYgd2UncmUgdXBncmFkaW5nIGFuIGFscmVhZHkgY3JlYXRlZCBjdXN0b20gZWxlbWVudCwgd2UgY2FuJ3QgY3JlYXRlXG4gICAgLy8gYW5vdGhlciBuZXcgbm9kZSAoYnkgdGhlIHNwZWMsIGl0IG11c3QgYmUgdGhlIHNhbWUgbm9kZSkuXG4gICAgbGV0IGVsID0gcmVnaXN0cnkuY3VycmVudCgpO1xuXG4gICAgLy8gSWYgdGhlcmUncyBub3QgYSBhbHJlYWR5IGNyZWF0ZWQgY3VzdG9tIGVsZW1lbnQsIHdlJ3JlIGJlaW5nIGludm9rZWQgdmlhXG4gICAgLy8gYG5ld2BpbmcgdGhlIGNvbnN0cnVjdG9yLlxuICAgIC8vXG4gICAgLy8gVGVjaG5pY2FsbHksIHdlIGNvdWxkIGdldCBoZXJlIHZpYSBjcmVhdGVFbGVtZW50LCBidXQgd2UgcGF0Y2hlZCB0aGF0LlxuICAgIC8vIElmIGl0IHRoZSBjdXN0b20gZWxlbWVudCB3YXMgcmVnaXN0ZXJlZCwgdGhlIHBhdGNoIHR1cm5lZCBpdCBpbnRvIGFcbiAgICAvLyBgbmV3YCBjYWxsLlxuICAgIC8vIElmIGl0IHdhcyBub3QgcmVnaXN0ZXJlZCwgdGhlIG5hdGl2ZSBjcmVhdGVFbGVtZW50IGlzIHVzZWQuIEFuZCBpZlxuICAgIC8vIG5hdGl2ZSBjcmVhdGVFbGVtZW50IGlzIGJlaW5nIHVzZWQgYW5kIHdlIGdvdCB0byB0aGlzIGNvZGUsIHdlJ3JlIHJlYWxseVxuICAgIC8vIGluIGFuIGluZmluaXRlIGxvb3AgKGEgbmF0aXZlIGNyZWF0ZUVsZW1lbnQgY2FsbCBqdXN0IGJlbG93KSBzbyB3ZSd2ZVxuICAgIC8vIGdvdCBiaWdnZXIgcHJvYmxlbXMuXG4gICAgLy9cbiAgICAvLyBTbyBqdXN0IHRha2UgbXkgd29yZCB3ZSBnb3QgaGVyZSB2aWEgYG5ld2AuXG4gICAgaWYgKCFlbCkge1xuICAgICAgLy8gVGhlIGN1c3RvbSBlbGVtZW50IGRlZmluaXRpb24gaXMgYW4gaW52YXJpYW50LiBJZiB0aGUgY3VzdG9tIGVsZW1lbnRcbiAgICAgIC8vIGlzIHJlZ2lzdGVyZWQsIGV2ZXJ5dGhpbmcgd29ya3MuIElmIGl0J3Mgbm90LCBpdCB0aHJvd3MgaW4gdGhlIG1lbWJlclxuICAgICAgLy8gcHJvcGVydHkgYWNjZXNzIChvbmx5IGRlZmluZWQgY3VzdG9tIGVsZW1lbnRzIGNhbiBiZSBkaXJlY3RseVxuICAgICAgLy8gY29uc3RydWN0ZWQgdmlhIGBuZXdgKS5cbiAgICAgIGNvbnN0IGRlZiA9IHJlZ2lzdHJ5LmdldEJ5Q29uc3RydWN0b3IoY29uc3RydWN0b3IpO1xuICAgICAgZWwgPSBjcmVhdGVFbGVtZW50LmNhbGwoZG9jdW1lbnQsIGRlZi5uYW1lKTtcbiAgICB9XG5cbiAgICAvLyBGaW5hbGx5LCBpZiB0aGUgbm9kZSB3YXMgYWxyZWFkeSBjb25zdHJ1Y3RlZCwgd2UgbmVlZCB0byByZXNldCBpdHNcbiAgICAvLyBwcm90b3R5cGUgdG8gdGhlIGN1c3RvbSBlbGVtZW50IHByb3RvdHlwZS4gQW5kIGlmIGl0IHdhc24ndCBhbHJlYWR5XG4gICAgLy8gY29uc3RydWN0ZWQsIHdlIGNyZWF0ZWQgYSBuZXcgbm9kZSB2aWEgbmF0aXZlIGNyZWF0ZUVsZW1lbnQsIGFuZCB3ZSBuZWVkXG4gICAgLy8gdG8gcmVzZXQgaXRzIHByb3RvdHlwZS4gQmFzaWNhbGx5IGFsd2F5cyByZXNldCB0aGUgcHJvdG90eXBlLlxuICAgIHNldFByb3RvdHlwZU9mKGVsLCBjb25zdHJ1Y3Rvci5wcm90b3R5cGUpO1xuICAgIHJldHVybiBlbDtcbiAgfVxuICBzdWJDbGFzcyhIVE1MRWxlbWVudCwgSFRNTEVsZW1lbnRQb2x5ZmlsbCk7XG5cbiAgLy8gRXhwb3NlIHRoZSBwb2x5ZmlsbGVkIEhUTUxFbGVtZW50IGNvbnN0cnVjdG9yIGZvciBldmVyeW9uZSB0byBleHRlbmQgZnJvbS5cbiAgd2luLkhUTUxFbGVtZW50T3JpZyA9IHdpbi5IVE1MRWxlbWVudDtcbiAgd2luLkhUTUxFbGVtZW50ID0gSFRNTEVsZW1lbnRQb2x5ZmlsbDtcblxuICAvLyBXaGVuIHdlIHRyYW5zcGlsZSBgc3VwZXJgIGluIEN1c3RvbSBFbGVtZW50IHN1YmNsYXNzZXMsIHdlIGNoYW5nZSBpdCB0b1xuICAvLyBgc3VwZXJDbGFzcy5jYWxsKHRoaXMpYCAod2hlcmUgYHN1cGVyQ2xhc3NgIGlzIGBIVE1MRWxlbWVudFBvbHlmaWxsYCkuXG4gIC8vIFRoYXQgYC5jYWxsYCB2YWx1ZSBpcyBpbmhlcml0ZWQgZnJvbSBgRnVuY3Rpb24ucHJvdG90eXBlYC5cbiAgLy8gQnV0LCBJRTExJ3MgbmF0aXZlIEhUTUxFbGVtZW50IGhpZXJhcmNoeSBkb2Vzbid0IGV4dGVuZCBmcm9tIEZ1bmN0aW9uIVxuICAvLyBBbmQgYmVjYXVzZSBgSFRNTEVsZW1lbnRQb2x5ZmlsbGAgZXh0ZW5kcyBmcm9tIGBIVE1MRWxlbWVudGAsIGl0IGRvZXNuJ3RcbiAgLy8gaGF2ZSBhIGAuY2FsbGAhIFNvIHdlIG5lZWQgdG8gbWFudWFsbHkgaW5zdGFsbCBpdC5cbiAgaWYgKCFIVE1MRWxlbWVudFBvbHlmaWxsLmNhbGwpIHtcbiAgICBIVE1MRWxlbWVudFBvbHlmaWxsLmFwcGx5ID0gd2luLkZ1bmN0aW9uLmFwcGx5O1xuICAgIEhUTUxFbGVtZW50UG9seWZpbGwuYmluZCA9IHdpbi5GdW5jdGlvbi5iaW5kO1xuICAgIEhUTUxFbGVtZW50UG9seWZpbGwuY2FsbCA9IHdpbi5GdW5jdGlvbi5jYWxsO1xuICB9XG59XG5cbi8qKlxuICogV3JhcHMgSFRNTEVsZW1lbnQgaW4gYSBSZWZsZWN0LmNvbnN0cnVjdCBjb25zdHJ1Y3Rvciwgc28gdGhhdCB0cmFuc3BpbGVkXG4gKiBjbGFzc2VzIGNhbiBgX3RoaXMgPSBzdXBlckNsYXNzLmNhbGwodGhpcylgIGR1cmluZyB0aGVpciBjb25zdHJ1Y3Rpb24uXG4gKlxuICogVGhpcyBpcyBvbmx5IHVzZWQgd2hlbiBDdXN0b20gRWxlbWVudHMgdjEgaXMgYWxyZWFkeSBhdmFpbGFibGUgX2FuZF8gd2UncmVcbiAqIHVzaW5nIHRyYW5zcGlsZWQgY2xhc3NlcyAod2hpY2ggdXNlIEVTNSBjb25zdHJ1Y3Rpb24gaWRpb21zKS5cbiAqXG4gKiBAcGFyYW0geyFXaW5kb3d9IHdpblxuICogQHN1cHByZXNzIHtnbG9iYWxUaGlzfVxuICovXG5mdW5jdGlvbiB3cmFwSFRNTEVsZW1lbnQod2luKSB7XG4gIGNvbnN0IHtIVE1MRWxlbWVudCwgUmVmbGVjdH0gPSB3aW47XG4gIC8qKiBAcmV0dXJuIHshRWxlbWVudH0gKi9cbiAgZnVuY3Rpb24gSFRNTEVsZW1lbnRXcmFwcGVyKCkge1xuICAgIGNvbnN0IGN0b3IgPSAvKiogQHR5cGUge2Z1bmN0aW9uKC4uLj8pOj98dW5kZWZpbmVkfSAqLyAodGhpcy5jb25zdHJ1Y3Rvcik7XG5cbiAgICAvLyBSZWZsZWN0LmNvbnN0cnVjdCBhbGxvd3MgdXMgdG8gY29uc3RydWN0IGEgbmV3IEhUTUxFbGVtZW50IHdpdGhvdXQgdXNpbmdcbiAgICAvLyBgbmV3YCAod2hpY2ggd2lsbCBhbHdheXMgZmFpbCBiZWNhdXNlIG5hdGl2ZSBIVE1MRWxlbWVudCBpcyBhIHJlc3RyaWN0ZWRcbiAgICAvLyBjb25zdHJ1Y3RvcikuXG4gICAgcmV0dXJuIFJlZmxlY3QuY29uc3RydWN0KEhUTUxFbGVtZW50LCBbXSwgY3Rvcik7XG4gIH1cbiAgc3ViQ2xhc3MoSFRNTEVsZW1lbnQsIEhUTUxFbGVtZW50V3JhcHBlcik7XG5cbiAgLy8gRXhwb3NlIHRoZSB3cmFwcGVkIEhUTUxFbGVtZW50IGNvbnN0cnVjdG9yIGZvciBldmVyeW9uZSB0byBleHRlbmQgZnJvbS5cbiAgd2luLkhUTUxFbGVtZW50T3JpZyA9IHdpbi5IVE1MRWxlbWVudDtcbiAgd2luLkhUTUxFbGVtZW50ID0gSFRNTEVsZW1lbnRXcmFwcGVyO1xufVxuXG4vKipcbiAqIFNldHVwcyB1cCBwcm90b3R5cGUgaW5oZXJpdGFuY2VcbiAqXG4gKiBAcGFyYW0geyFTVVBFUn0gc3VwZXJDbGFzc1xuICogQHBhcmFtIHshU1VCfSBzdWJDbGFzc1xuICogQHRlbXBsYXRlIFNVUEVSXG4gKiBAdGVtcGxhdGUgU1VCXG4gKi9cbmZ1bmN0aW9uIHN1YkNsYXNzKHN1cGVyQ2xhc3MsIHN1YkNsYXNzKSB7XG4gIC8vIE9iamVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3Ioc3VwZXJDbGFzcy5wcm90b3R5cGUsICdjb25zdHJ1Y3RvcicpXG4gIC8vIHt2YWx1ZTogxpIsIHdyaXRhYmxlOiB0cnVlLCBlbnVtZXJhYmxlOiBmYWxzZSwgY29uZmlndXJhYmxlOiB0cnVlfVxuICBzdWJDbGFzcy5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKHN1cGVyQ2xhc3MucHJvdG90eXBlLCB7XG4gICAgY29uc3RydWN0b3I6IHtcbiAgICAgIC8vIGVudW1lcmFibGU6IGZhbHNlLFxuICAgICAgY29uZmlndXJhYmxlOiB0cnVlLFxuICAgICAgd3JpdGFibGU6IHRydWUsXG4gICAgICB2YWx1ZTogc3ViQ2xhc3MsXG4gICAgfSxcbiAgfSk7XG4gIHNldFByb3RvdHlwZU9mKHN1YkNsYXNzLCBzdXBlckNsYXNzKTtcbn1cblxuLyoqXG4gKiBUZXN0cyB3aGV0aGVyIHNldHRpbmcgJ19fcHJvdG9fXycgd2lsbCBjaGFuZ2UgdGhlIHByb3RvdHlwZSBjaGFpbiBvZiBhblxuICogb2JqZWN0LiBPbmx5IG5lZWRlZCBmb3Igb2xkIElFLlxuICogQHJldHVybiB7Ym9vbGVhbn1cbiAqL1xuZnVuY3Rpb24gc3VwcG9ydHNVbmRlclByb3RvKCkge1xuICBjb25zdCBwcm90byA9IHsndGVzdCc6IHRydWV9O1xuICBjb25zdCBvYmogPSB7fTtcbiAgb2JqLl9fcHJvdG9fXyA9IHByb3RvO1xuICByZXR1cm4gISFvYmpbJ3Rlc3QnXTtcbn1cblxuLyoqXG4gKiBTZXRzIHRoZSBwcm90b3R5cGUgY2hhaW4gb2YgYW4gb2JqZWN0LCB3aXRoIHZhcmlvdXMgZmFsbGJhY2tzIHRvIHN1cHBvcnRcbiAqIG9sZCBJRS5cbiAqIEBwYXJhbSB7IU9iamVjdH0gb2JqXG4gKiBAcGFyYW0geyFPYmplY3R9IHByb3RvdHlwZVxuICogQHN1cHByZXNzIHtzdXNwaWNpb3VzQ29kZX0gZHVlIHRvIElTX0VTTSBpbmxpbmluZ1xuICovXG5mdW5jdGlvbiBzZXRQcm90b3R5cGVPZihvYmosIHByb3RvdHlwZSkge1xuICBpZiAoSVNfRVNNIHx8IE9iamVjdC5zZXRQcm90b3R5cGVPZikge1xuICAgIC8vIEV2ZXJ5IGRlY2VudCBicm93c2VyLlxuICAgIE9iamVjdC5zZXRQcm90b3R5cGVPZihvYmosIHByb3RvdHlwZSk7XG4gIH0gZWxzZSBpZiAoc3VwcG9ydHNVbmRlclByb3RvKCkpIHtcbiAgICAvLyBJRTExXG4gICAgb2JqLl9fcHJvdG9fXyA9IHByb3RvdHlwZTtcbiAgfSBlbHNlIHtcbiAgICAvLyBJRTEwIG1hbi4gOnNpZ2g6XG4gICAgY29weVByb3BlcnRpZXMob2JqLCBwcm90b3R5cGUpO1xuICB9XG59XG5cbi8qKlxuICogQ29waWVzIHRoZSBwcm9wZXJ0eSBkZXNjcmlwdG9ycyBmcm9tIHByb3RvdHlwZSB0byBvYmouIFRoaXMgaXMgb25seVxuICogbmVjZXNzYXJ5IGZvciBvbGQgSUUsIHdoaWNoIGNhbid0IHByb3Blcmx5IHNldCB0aGUgcHJvdG90eXBlIG9mIGFuIGFscmVhZHlcbiAqIGNyZWF0ZWQgb2JqZWN0LlxuICogQHBhcmFtIHshT2JqZWN0fSBvYmpcbiAqIEBwYXJhbSB7IU9iamVjdH0gcHJvdG90eXBlXG4gKiBAdmlzaWJsZUZvclRlc3RpbmdcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGNvcHlQcm9wZXJ0aWVzKG9iaiwgcHJvdG90eXBlKSB7XG4gIGxldCBjdXJyZW50ID0gcHJvdG90eXBlO1xuICB3aGlsZSAoY3VycmVudCAhPT0gbnVsbCkge1xuICAgIGlmIChPYmplY3QuaXNQcm90b3R5cGVPZi5jYWxsKGN1cnJlbnQsIG9iaikpIHtcbiAgICAgIGJyZWFrO1xuICAgIH1cblxuICAgIGZvciAoY29uc3QgcHJvcCBvZiBPYmplY3QuZ2V0T3duUHJvcGVydHlOYW1lcyhjdXJyZW50KSkge1xuICAgICAgaWYgKE9iamVjdC5oYXNPd25Qcm9wZXJ0eS5jYWxsKG9iaiwgcHJvcCkpIHtcbiAgICAgICAgY29udGludWU7XG4gICAgICB9XG5cbiAgICAgIGNvbnN0IGRlc2MgPSAvKiogQHR5cGUgeyFPYmplY3RQcm9wZXJ0eURlc2NyaXB0b3I8T2JqZWN0Pn0gKi8gKFxuICAgICAgICBPYmplY3QuZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yKGN1cnJlbnQsIHByb3ApXG4gICAgICApO1xuICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KG9iaiwgcHJvcCwgZGVzYyk7XG4gICAgfVxuXG4gICAgY3VycmVudCA9IE9iamVjdC5nZXRQcm90b3R5cGVPZihjdXJyZW50KTtcbiAgfVxufVxuXG4vKipcbiAqIFBvbHlmaWxscyBDdXN0b20gRWxlbWVudHMgdjEgQVBJLiBUaGlzIGhhcyA1IG1vZGVzOlxuICpcbiAqIDEuIEN1c3RvbSBlbGVtZW50cyB2MSBhbHJlYWR5IHN1cHBvcnRlZCwgdXNpbmcgbmF0aXZlIGNsYXNzZXNcbiAqIDIuIEN1c3RvbSBlbGVtZW50cyB2MSBhbHJlYWR5IHN1cHBvcnRlZCwgdXNpbmcgdHJhbnNwaWxlZCBjbGFzc2VzXG4gKiAzLiBDdXN0b20gZWxlbWVudHMgdjEgbm90IHN1cHBvcnRlZCwgdXNpbmcgbmF0aXZlIGNsYXNzZXNcbiAqIDQuIEN1c3RvbSBlbGVtZW50cyB2MSBub3Qgc3VwcG9ydGVkLCB1c2luZyB0cmFuc3BpbGVkIGNsYXNzZXNcbiAqIDUuIE5vIHNhbXBsZSBjbGFzcyBjb25zdHJ1Y3RvciBwcm92aWRlZFxuICpcbiAqIEluIG1vZGUgMSwgbm90aGluZyBpcyBkb25lLiBJbiBtb2RlIDIsIGEgbWluaW1hbCBwb2x5ZmlsbCBpcyB1c2VkIHRvIHN1cHBvcnRcbiAqIGV4dGVuZGluZyB0aGUgSFRNTEVsZW1lbnQgYmFzZSBjbGFzcy4gSW4gbW9kZSAzLCA0LCBhbmQgNSBhIGZ1bGwgcG9seWZpbGwgaXNcbiAqIGRvbmUuXG4gKlxuICogQHBhcmFtIHshV2luZG93fSB3aW5cbiAqIEBwYXJhbSB7IUZ1bmN0aW9ufSBjdG9yXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBpbnN0YWxsKHdpbiwgY3Rvcikge1xuICAvLyBEb24ndCBpbnN0YWxsIGluIG5vLURPTSBlbnZpcm9ubWVudHMgZS5nLiB3b3JrZXIuXG4gIGNvbnN0IHNob3VsZEluc3RhbGwgPSB3aW4uZG9jdW1lbnQ7XG4gIGNvbnN0IGhhc0NFID0gaGFzQ3VzdG9tRWxlbWVudHMod2luKTtcbiAgaWYgKCFzaG91bGRJbnN0YWxsIHx8IChoYXNDRSAmJiBpc1BhdGNoZWQod2luKSkpIHtcbiAgICByZXR1cm47XG4gIH1cblxuICBsZXQgaW5zdGFsbCA9IHRydWU7XG4gIGxldCBpbnN0YWxsV3JhcHBlciA9IGZhbHNlO1xuXG4gIGlmIChjdG9yICYmIGhhc0NFKSB7XG4gICAgLy8gSWYgY3RvciBpcyBjb25zdHJ1Y3RhYmxlIHdpdGhvdXQgbmV3LCBpdCdzIGEgZnVuY3Rpb24uIFRoYXQgbWVhbnMgaXQgd2FzXG4gICAgLy8gY29tcGlsZWQgZG93biwgYW5kIHdlIG5lZWQgdG8gZG8gdGhlIG1pbmltYWwgcG9seWZpbGwgYmVjYXVzZSBhbGwgeW91XG4gICAgLy8gY2Fubm90IGV4dGVuZCBIVE1MRWxlbWVudCB3aXRob3V0IG5hdGl2ZSBjbGFzc2VzLlxuICAgIHRyeSB7XG4gICAgICBjb25zdCB7UmVmbGVjdH0gPSB3aW47XG5cbiAgICAgIC8vIFwiQ29uc3RydWN0XCIgY3RvciB1c2luZyBFUzUgaWRpb21zXG4gICAgICAvLyBJJ20gbm90IHN1cmUgd2h5LCBidXQgQ2xvc3VyZSB3aWxsIGNvbXBsYWluIGF0IHRoZVxuICAgICAgLy8gYEZ1bmN0aW9uLmNhbGwuY2FsbCgpYCBiZWxvdyB1bmxlc3Mgd2UgY2FzdCB0byBhIEZ1bmN0aW9uIGluc3RhbmNlXG4gICAgICAvLyBoZXJlLlxuICAgICAgY29uc3QgaW5zdGFuY2UgPSAvKiogQHR5cGUgeyFGdW5jdGlvbn0gKi8gKE9iamVjdC5jcmVhdGUoY3Rvci5wcm90b3R5cGUpKTtcblxuICAgICAgLy8gVGhpcyB3aWxsIHRocm93IGFuIGVycm9yIHVubGVzcyB3ZSdyZSBpbiBhIHRyYW5zcGlsZWQgZW52aXJvbmVtbnQuXG4gICAgICAvLyBOYXRpdmUgY2xhc3NlcyBtdXN0IGJlIGNhbGxlZCBhcyBgbmV3IEN0b3JgLCBub3QgYEN0b3IuY2FsbChpbnN0YW5jZSlgLlxuICAgICAgLy8gV2UgdXNlIGBGdW5jdGlvbi5jYWxsLmNhbGxgIGJlY2F1c2UgQ2xvc3VyZSBpcyB0b28gc21hcnQgZm9yIHJlZ3VsYXJcbiAgICAgIC8vIGBDdG9yLmNhbGxgLlxuICAgICAgRnVuY3Rpb24uY2FsbC5jYWxsKGN0b3IsIGluc3RhbmNlKTtcblxuICAgICAgLy8gSWYgdGhhdCBkaWRuJ3QgdGhyb3csIHdlJ3JlIHRyYW5zcGlsZWQuXG4gICAgICAvLyBMZXQncyBmaW5kIG91dCBpZiB3ZSBjYW4gd3JhcCBIVE1MRWxlbWVudCBhbmQgYXZvaWQgYSBmdWxsIHBhdGNoLlxuICAgICAgaW5zdGFsbFdyYXBwZXIgPSAhIVJlZmxlY3Q/LmNvbnN0cnVjdDtcbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICAvLyBUaGUgY3RvciB0aHJldyB3aGVuIHdlIGNvbnN0cnVjdGVkIGl0IHZpYSBFUzUsIHNvIGl0J3MgYSByZWFsIGNsYXNzLlxuICAgICAgLy8gV2UncmUgb2sgdG8gbm90IGluc3RhbGwgdGhlIHBvbHlmaWxsLlxuICAgICAgaW5zdGFsbCA9IGZhbHNlO1xuICAgIH1cbiAgfVxuXG4gIGlmIChpbnN0YWxsV3JhcHBlcikge1xuICAgIHdyYXBIVE1MRWxlbWVudCh3aW4pO1xuICB9IGVsc2UgaWYgKGluc3RhbGwpIHtcbiAgICBwb2x5ZmlsbCh3aW4pO1xuICB9XG59XG4iXX0=
// /Users/mszylkowski/src/amphtml/src/polyfills/custom-elements.js