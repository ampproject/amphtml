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

import {Deferred} from '../core/data-structures/promise';
import {map} from '../core/types/object';
import {rethrowAsync} from '../core/error';

/**
 * For type anotations where Element is a local variable.
 * @typedef {!Element}
 */
let ElementOrigDef;

/** @typedef {!typeof HTMLElement} */
let CustomElementConstructorDef;

/**
 * @typedef {{
 *  name: string,
 *  ctor: !CustomElementConstructorDef,
 * }}
 */
let CustomElementDef;

/**
 * Validates the custom element's name.
 * This intentionally ignores "valid" higher Unicode Code Points.
 * https://html.spec.whatwg.org/multipage/custom-elements.html#valid-custom-element-name
 */
const VALID_NAME = /^[a-z][a-z0-9._]*-[a-z0-9._-]*$/;
const INVALID_NAMES = [
  'annotation-xml',
  'color-profile',
  'font-face',
  'font-face-src',
  'font-face-uri',
  'font-face-format',
  'font-face-name',
  'missing-glyph',
];

/**
 * A MutationObserverInit dictionary to track subtree modifications.
 */
const TRACK_SUBTREE = {
  'childList': true,
  'subtree': true,
};

/**
 * Asserts that the custom element name conforms to the spec.
 *
 * @param {!typeof SyntaxError} SyntaxError
 * @param {string} name
 */
function assertValidName(SyntaxError, name) {
  if (!VALID_NAME.test(name) || INVALID_NAMES.includes(name)) {
    throw new SyntaxError(`invalid custom element name "${name}"`);
  }
}

/**
 * Does win have a full Custom Elements registry?
 *
 * @param {!Window} win
 * @return {boolean}
 */
function hasCustomElements(win) {
  const {customElements} = win;

  return !!(
    customElements &&
    customElements.define &&
    customElements.get &&
    customElements.whenDefined
  );
}

/**
 * Was HTMLElement already patched for this window?
 *
 * @param {!Window} win
 * @return {boolean}
 */
function isPatched(win) {
  const tag = win.HTMLElement.toString();
  return tag.indexOf('[native code]') === -1;
}

/**
 * The public Custom Elements API.
 */
class CustomElementRegistry {
  /**
   * @param {!Window} win
   * @param {!Registry} registry
   */
  constructor(win, registry) {
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
  define(name, ctor, options) {
    this.registry_.define(name, ctor, options);

    // If anyone is waiting for this custom element to be defined, resolve
    // their promise.
    const pending = this.pendingDefines_;
    const deferred = pending[name];
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
  get(name) {
    const def = this.registry_.getByName(name);
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
  whenDefined(name) {
    const {Promise, SyntaxError} = this.win_;
    assertValidName(SyntaxError, name);

    if (this.registry_.getByName(name)) {
      return Promise.resolve();
    }

    const pending = this.pendingDefines_;
    let deferred = pending[name];
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
  upgrade(root) {
    this.registry_.upgrade(root);
  }
}

/**
 * This internal APIs necessary to run the CustomElementRegistry.
 * Since Registry is never exposed externally, all methods are actually
 * available on the instance.
 */
class Registry {
  /**
   * @param {!Window} win
   */
  constructor(win) {
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
  current() {
    const current = this.current_;
    this.current_ = null;
    return current;
  }

  /**
   * Finds the custom element definition by name.
   *
   * @param {string} name
   * @return {!CustomElementDef|undefined}
   */
  getByName(name) {
    const definition = this.definitions_[name];
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
  getByConstructor(ctor) {
    const definitions = this.definitions_;

    for (const name in definitions) {
      const def = definitions[name];
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
  define(name, ctor, options) {
    const {Error, SyntaxError} = this.win_;

    if (options) {
      throw new Error('Extending native custom elements is not supported');
    }

    assertValidName(SyntaxError, name);

    if (this.getByName(name) || this.getByConstructor(ctor)) {
      throw new Error(`duplicate definition "${name}"`);
    }

    // TODO(jridgewell): Record connectedCallback, disconnectedCallback,
    // adoptedCallback, attributeChangedCallback, and observedAttributes.
    // TODO(jridgewell): If attributeChangedCallback, gather observedAttributes
    this.definitions_[name] = {
      name,
      ctor,
    };

    this.observe_(name);
    for (const tree of this.roots_) {
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
  upgrade(root, opt_query) {
    // Only CustomElementRegistry.p.define provides a query (the newly defined
    // custom element). In this case, we are both upgrading _and_ connecting
    // the custom elements.
    const newlyDefined = !!opt_query;
    const query = opt_query || this.query_;
    const upgradeCandidates = this.queryAll_(root, query);

    for (const candidate of upgradeCandidates) {
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
  upgradeSelf(node) {
    const def = this.getByName(node.localName);
    if (!def) {
      return;
    }

    this.upgradeSelf_(/** @type {!Element} */ (node), def);
  }

  /**
   * @param {!Node} root
   * @param {string} query
   * @return {!Array|!NodeList}
   */
  queryAll_(root, query) {
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
  upgradeSelf_(node, def) {
    const {ctor} = def;
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
      const el = new ctor();

      if (el !== node) {
        throw new this.win_.Error(
          'Constructor illegally returned a different instance.'
        );
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
  connectedCallback_(node) {
    const def = this.getByName(node.localName);
    if (!def) {
      return;
    }
    node = /** @type {!HTMLElement} */ (node);
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
  disconnectedCallback_(node) {
    // TODO(jridgewell): I should be calling the definitions connectedCallback
    // with node as the context.
    node = /** @type {!HTMLElement} */ (node);
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
  observe_(name) {
    if (this.query_) {
      this.query_ += `,${name}`;
      return;
    }

    this.query_ = name;

    // The first registered name starts the mutation observer.
    const mo = new this.win_.MutationObserver((records) => {
      if (records) {
        this.handleRecords_(records);
      }
    });
    this.mutationObserver_ = mo;

    // I would love to not have to hold onto all of the roots, since it's a
    // memory leak. Unfortunately, there's no way to iterate a list and hold
    // onto its contents weakly.
    for (const tree of this.roots_) {
      mo.observe(tree, TRACK_SUBTREE);
    }

    installPatches(this.win_, this);
  }

  /**
   * Adds the shadow tree to be observed by the polyfill.
   *
   * @param {!Node} tree
   */
  observe(tree) {
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
  sync() {
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
  handleRecords_(records) {
    for (const record of records) {
      if (!record) {
        continue;
      }

      const {addedNodes, removedNodes} = record;
      for (const node of addedNodes) {
        const connectedCandidates = this.queryAll_(node, this.query_);
        this.connectedCallback_(node);
        for (const candidate of connectedCandidates) {
          this.connectedCallback_(candidate);
        }
      }

      for (const node of removedNodes) {
        const disconnectedCandidates = this.queryAll_(node, this.query_);
        this.disconnectedCallback_(node);
        for (const candidate of disconnectedCandidates) {
          this.disconnectedCallback_(candidate);
        }
      }
    }
  }
}

/**
 * Patches the DOM APIs to support synchronous Custom Elements.
 * @param {!Window} win
 * @param {!Registry} registry
 */
function installPatches(win, registry) {
  const {Document, Element, Node, document} = win;
  const docProto = Document.prototype;
  const elProto = Element.prototype;
  const nodeProto = Node.prototype;
  const {createElement, importNode} = docProto;
  const {appendChild, cloneNode, insertBefore, removeChild, replaceChild} =
    nodeProto;

  // Patch createElement to immediately upgrade the custom element.
  // This has the added benefit that it avoids the "already created but needs
  // constructor code run" chicken-and-egg problem.
  docProto.createElement = function (name) {
    const def = registry.getByName(name);
    if (def) {
      return new def.ctor();
    }
    return createElement.apply(this, arguments);
  };

  // Patch importNode to immediately upgrade custom elements.
  // TODO(jridgewell): Can fire adoptedCallback for cross doc imports.
  docProto.importNode = function () {
    const imported = importNode.apply(this, arguments);

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
    const appended = appendChild.apply(this, arguments);
    registry.sync();
    return appended;
  };

  // Patch insertBefore to upgrade custom elements before returning.
  nodeProto.insertBefore = function () {
    const inserted = insertBefore.apply(this, arguments);
    registry.sync();
    return inserted;
  };

  // Patch removeChild to upgrade custom elements before returning.
  nodeProto.removeChild = function () {
    const removed = removeChild.apply(this, arguments);
    registry.sync();
    return removed;
  };

  // Patch replaceChild to upgrade and detach custom elements before returning.
  nodeProto.replaceChild = function () {
    const replaced = replaceChild.apply(this, arguments);
    registry.sync();
    return replaced;
  };

  // Patch cloneNode to immediately upgrade custom elements.
  nodeProto.cloneNode = function () {
    const cloned = cloneNode.apply(this, arguments);

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
  let innerHTMLProto = elProto;
  let innerHTMLDesc = Object.getOwnPropertyDescriptor(
    innerHTMLProto,
    'innerHTML'
  );
  if (!innerHTMLDesc) {
    // Sigh... IE11 puts innerHTML desciptor on HTMLElement. But, we've
    // replaced HTMLElement with a polyfill wrapper, so have to get its proto.
    innerHTMLProto = Object.getPrototypeOf(win.HTMLElement.prototype);
    innerHTMLDesc = Object.getOwnPropertyDescriptor(
      innerHTMLProto,
      'innerHTML'
    );
  }
  if (innerHTMLDesc?.configurable) {
    const innerHTMLSetter = innerHTMLDesc.set;
    innerHTMLDesc.set = function (html) {
      innerHTMLSetter.call(this, html);
      registry.upgrade(this);
    };
    Object.defineProperty(
      /** @type {!Object} */ (innerHTMLProto),
      'innerHTML',
      innerHTMLDesc
    );
  }
}

/**
 * Does the polyfilling.
 * @param {!Window} win
 */
function polyfill(win) {
  const {Element, HTMLElement, document} = win;
  const {createElement} = document;

  const registry = new Registry(win);
  const customElements = new CustomElementRegistry(win, registry);

  // Expose the custom element registry.
  // Object.getOwnPropertyDescriptor(window, 'customElements')
  // {get: ƒ, set: undefined, enumerable: true, configurable: true}
  Object.defineProperty(win, 'customElements', {
    enumerable: true,
    configurable: true,
    // writable: false,
    value: customElements,
  });

  // Have to patch shadow methods now, since there's no way to find shadow trees
  // later.
  const elProto = Element.prototype;
  const {attachShadow, createShadowRoot} = elProto;
  if (attachShadow) {
    /**
     * @param {{mode: string}} unused
     * @return {!ShadowRoot}
     */
    elProto.attachShadow = function (unused) {
      const shadow = attachShadow.apply(this, arguments);
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
      const shadow = createShadowRoot.apply(this, arguments);
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
    const {constructor} = this;

    // If we're upgrading an already created custom element, we can't create
    // another new node (by the spec, it must be the same node).
    let el = registry.current();

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
      const def = registry.getByConstructor(constructor);
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
  const {HTMLElement, Reflect} = win;
  /** @return {!Element} */
  function HTMLElementWrapper() {
    const ctor = /** @type {function(...?):?|undefined} */ (this.constructor);

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
      value: subClass,
    },
  });
  setPrototypeOf(subClass, superClass);
}

/**
 * Tests whether setting '__proto__' will change the prototype chain of an
 * object. Only needed for old IE.
 * @return {boolean}
 */
function supportsUnderProto() {
  const proto = {'test': true};
  const obj = {};
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
  if (IS_ESM || Object.setPrototypeOf) {
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
  let current = prototype;
  while (current !== null) {
    if (Object.isPrototypeOf.call(current, obj)) {
      break;
    }

    for (const prop of Object.getOwnPropertyNames(current)) {
      if (Object.hasOwnProperty.call(obj, prop)) {
        continue;
      }

      const desc = /** @type {!ObjectPropertyDescriptor<Object>} */ (
        Object.getOwnPropertyDescriptor(current, prop)
      );
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
  const shouldInstall = win.document;
  const hasCE = hasCustomElements(win);
  if (!shouldInstall || (hasCE && isPatched(win))) {
    return;
  }

  let install = true;
  let installWrapper = false;

  if (ctor && hasCE) {
    // If ctor is constructable without new, it's a function. That means it was
    // compiled down, and we need to do the minimal polyfill because all you
    // cannot extend HTMLElement without native classes.
    try {
      const {Reflect} = win;

      // "Construct" ctor using ES5 idioms
      // I'm not sure why, but Closure will complain at the
      // `Function.call.call()` below unless we cast to a Function instance
      // here.
      const instance = /** @type {!Function} */ (Object.create(ctor.prototype));

      // This will throw an error unless we're in a transpiled environemnt.
      // Native classes must be called as `new Ctor`, not `Ctor.call(instance)`.
      // We use `Function.call.call` because Closure is too smart for regular
      // `Ctor.call`.
      Function.call.call(ctor, instance);

      // If that didn't throw, we're transpiled.
      // Let's find out if we can wrap HTMLElement and avoid a full patch.
      installWrapper = !!Reflect?.construct;
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
