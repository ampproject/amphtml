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

/**
 * @typedef {{
 *   promise: !Promise<undefined>,
 *   resolve: function(),
 * }}
 */
let DeferredDef;

/**
 * @typedef {!Function}
 */
let CustomElementConstructorDef;

/**
 * @typedef {{
 *  name: string,
 *  ctor: !CustomElementConstructorDef,
 *  observedAttributes: !Array<string>,
 *  connectedCallback: (function()|null),
 *  disconnectedCallback: (function()|null),
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
 * Asserts that the custom element name conforms to the spec.
 * @param {!Function} SyntaxError
 * @param {string} name
 */
function assertValidName(SyntaxError, name) {
  if (!VALID_NAME.test(name) || INVALID_NAMES.indexOf(name) >= 0) {
    throw new SyntaxError(`invalid custom element name "${name}"`);
  }
}

/**
 * Does win have a full Custom Elements registry?
 * @param {!Window} win
 * @return {boolean}
 */
function hasCustomElements(win) {
  const {customElements} = win;

  return !!(
    customElements &&
    customElements.define &&
    customElements.get &&
    customElements.whenDefined);
}

/**
 * Was HTMLElement already patched this window?
 * @param {!Window} win
 * @return {boolean}
 */
function isPatched(win) {
  const tag = win.HTMLElement.toString();
  return tag.indexOf('[native code]') === -1;
}

class CustomElementRegistry {
  /**
   * @param {!Window} win
   * @param {!Registry} registry
   */
  constructor(win, registry) {
    /**
     * @const @private
     */
    this.win_ = win;

    /**
     * @const @private
     */
    this.registry_ = registry;

    /**
     * @type {!Object<string, DeferredDef>}
     * @private
     * @const
     */
    this.whens_ = this.win_.Object.create(null);
  }

  /**
   * @param {string} name
   * @param {!CustomElementConstructorDef} ctor
   * @param {!Object=} options
   */
  define(name, ctor, options) {
    const {Error, SyntaxError} = this.win_;

    if (options) {
      throw new Error('Extending native custom elements is not supported');
    }

    assertValidName(SyntaxError, name);

    if (this.registry_.getByName(name) ||
        this.registry_.getByConstructor(ctor)) {
      throw new Error('duplicate definition');
    }

    const proto = ctor.prototype;
    const lifecycleCallbacks = {
      'connectedCallback': null,
      'disconnectedCallback': null,
      // 'adoptedCallback': null,
      // 'attributeChangedCallback': null,
    };

    for (const callbackName in lifecycleCallbacks) {
      const callback = proto[callbackName];
      if (callback) {
        lifecycleCallbacks[callbackName] = /** @type {function()} */(callback);
      }
    }

    const observedAttributes = (lifecycleCallbacks['attributeChangedCallback']
      && ctor['observedAttributes']) || [];

    this.registry_.add(name, ctor, lifecycleCallbacks,
        observedAttributes);

    this.registry_.upgrade(null, name);

    const whens = this.whens_;
    const when = whens[name];
    if (when) {
      when.resolve();
      delete whens[name];
    }
  }

  /**
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
   * @param {string} name
   * @return {!Promise<undefined>}
   */
  whenDefined(name) {
    const {Promise, SyntaxError} = this.win_;
    assertValidName(SyntaxError, name);

    if (this.registry_.getByName(name)) {
      return Promise.resolve();
    }

    const whens = this.whens_;
    const when = whens[name];
    if (when) {
      return when.promise;
    }

    let resolve;
    const promise = new /*OK*/Promise(res => resolve = res);
    whens[name] = {
      promise,
      resolve,
    };

    return promise;
  }

  /**
   * @param {!Node} root
   */
  upgrade(root) {
    this.registry_.upgrade(root);
  }
}

class Registry {
  /**
   * @param {!Window} win
   */
  constructor(win) {
    /**
     * @private @const
     */
    this.win_ = win;

    /**
     * @type {!Object<string, !CustomElementDef>}
     * @private
     * @const
     */
    this.definitions_ = win.Object.create(null);

    /**
     * A up-to-date DOM selector for all custom elements.
     * @type {string}
     */
    this.query_ = '';

    /**
     * The currently upgrading element.
     * @private {Element}
     */
    this.current_ = null;

    const observer = new win.MutationObserver(records => {
      this.handleRecords_(records);
    });
    observer.observe(win.document, {
      childList: true,
      subtree: true,
    });
  }

  /**
   * @return {Element}
   */
  current() {
    const current = this.current_;
    this.current_ = null;
    return current;
  }

  /**
   * @param {string} name
   * @return {CustomElementDef|undefined}
   */
  getByName(name) {
    const definition = this.definitions_[name];
    if (definition) {
      return definition;
    }
  }

  /**
   * @param {CustomElementConstructorDef} ctor
   * @return {CustomElementDef|undefined}
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
   * @param {string} name
   * @param {!CustomElementConstructorDef} ctor
   * @param {!Object} lifecycleCallbacks
   * @param {!Array<string>} observedAttributes
   */
  add(name, ctor, lifecycleCallbacks, observedAttributes) {
    if (this.query_) {
      this.query_ += ',';
    }
    this.query_ += name;

    this.definitions_[name] = {
      name,
      ctor,
      observedAttributes,
      connectedCallback: lifecycleCallbacks['connectedCallback'],
      disconnectedCallback: lifecycleCallbacks['disconnectedCallback'],
      // lifecycleCallbacks['adoptedCallback'],
      // lifecycleCallbacks['attributeChangedCallback'],
    };
  }

  /**
   * @param {Node} root
   * @param {string=} opt_query
   */
  upgrade(root, opt_query) {
    const query = opt_query || this.query_;
    const upgradeCandidates = this.queryAll_(root, query);

    for (let i = 0; i < upgradeCandidates.length; i++) {
      const candidate = upgradeCandidates[i];
      if (root) {
        this.upgradeSelf(candidate);
      } else {
        this.connectedCallback_(candidate);
      }
    }
  }

  /**
   * @param {!Node} node
   */
  upgradeSelf(node) {
    const def = this.getByName(node.localName);
    if (!def) {
      return;
    }

    this.upgradeSelf_(/** @type {!Element} */(node), def);
  }

  /**
   * @param {Node} root
   * @param {string} query
   * @return {!Array|!NodeList}
   */
  queryAll_(root, query) {
    if (!root) {
      root = this.win_.document;
    } else if (!query || !root.querySelectorAll) {
      // Nothing to do...
      return [];
    }

    return root.querySelectorAll(query);
  }

  /**
   * @param {!Element} node
   * @param {!CustomElementDef} def
   */
  upgradeSelf_(node, def) {
    const {ctor} = def;
    if (node instanceof ctor) {
      return;
    }

    this.current_ = node;
    // Despite how it looks, this is not a useless construction.
    // HTMLElementPolyfill (the base class of all custom elements) will return
    // the current node, allowing the custom element's subclass constructor to
    // run on the node. The node itself is already constructed, so the return
    // value is just the node.
    const el = new ctor();
    if (el !== node) {
      throw new this.win_.Error(
          'Constructor illegally returned a different instance.');
    }
  }

  /**
   * @param {!Node} node
   */
  connectedCallback_(node) {
    const def = this.getByName(node.localName);
    if (!def) {
      return;
    }
    this.upgradeSelf_(/** @type {!Element} */(node), def);
    if (node.connectedCallback) {
      node.connectedCallback();
    }
  }
  /**
   * @param {!Node} node
   */
  disconnectedCallback_(node) {
    if (node.disconnectedCallback) {
      node.disconnectedCallback();
    }
  }

  /**
   * @param {!Array<!MutationRecord>} records
   */
  handleRecords_(records) {
    for (let i = 0; i < records.length; i++) {
      const record = records[i];
      const {addedNodes, removedNodes} = record;
      for (let i = 0; i < addedNodes.length; i++) {
        const node = addedNodes[i];
        const connectedCandidates = this.queryAll_(node, this.query_);
        this.connectedCallback_(node);
        for (let i = 0; i < connectedCandidates.length; i++) {
          this.connectedCallback_(connectedCandidates[i]);
        }
      }

      for (let i = 0; i < removedNodes.length; i++) {
        const node = removedNodes[i];
        const disconnectedCandidates = this.queryAll_(node, this.query_);
        this.disconnectedCallback_(node);
        for (let i = 0; i < disconnectedCandidates.length; i++) {
          this.disconnectedCallback_(disconnectedCandidates[i]);
        }
      }
    }
  }
}

/**
 * Does the polyfilling.
 * @param {!Window} win
 */
function polyfill(win) {
  const {HTMLElement, Element, Node, Document, Object, document} = win;
  const {createElement, cloneNode, importNode} = document;

  const registry = new Registry(win);
  const customElements = new CustomElementRegistry(win, registry);

  // Object.getOwnPropertyDescriptor(window, 'customElements')
  // {get: ƒ, set: undefined, enumerable: true, configurable: true}
  Object.defineProperty(win, 'customElements', {
    enumerable: true,
    configurable: true,
    // writable: false,
    value: customElements,
  });

  // Object.getOwnPropertyDescriptor(Document.prototype, 'createElement')
  // {value: ƒ, writable: true, enumerable: true, configurable: true}
  Document.prototype.createElement = function createElementPolyfill(name) {
    const def = registry.getByName(name);
    if (def) {
      return new def.ctor();
    }
    return createElement.apply(this, arguments);
  };

  // Object.getOwnPropertyDescriptor(Document.prototype, 'importNode')
  // {value: ƒ, writable: true, enumerable: true, configurable: true}
  Document.prototype.importNode = function importNodePolyfill() {
    const imported = importNode.apply(this, arguments);
    if (imported) {
      registry.upgradeSelf(imported);
      registry.upgrade(imported);
    }
    return imported;
  };

  // Object.getOwnPropertyDescriptor(Node.prototype, 'cloneNode')
  // {value: ƒ, writable: true, enumerable: true, configurable: true}
  Node.prototype.cloneNode = function cloneNodePolyfill() {
    const cloned = cloneNode.apply(this, arguments);
    registry.upgradeSelf(cloned);
    registry.upgrade(cloned);
    return cloned;
  };

  // Object.getOwnPropertyDescriptor(Element.prototype, 'innerHTML')
  // {get: ƒ, set: ƒ, enumerable: true, configurable: true}
  const innerHTMLDesc = Object.getOwnPropertyDescriptor(Element.prototype,
      'innerHTML');
  const innerHTMLSetter = innerHTMLDesc.set;
  innerHTMLDesc.set = function(html) {
    innerHTMLSetter.call(this, html);
    registry.upgrade(this);
  };
  Object.defineProperty(Element.prototype, 'innerHTML', innerHTMLDesc);

  /**
   * You can't use the real HTMLElement constructor, because you can't subclass
   * it without using native classes. So, mock its approximation using
   * createElement.
   */
  function HTMLElementPolyfill() {
    const {constructor} = this;

    let el = registry.current();
    if (!el) {
      const def = registry.getByConstructor(constructor);
      el = createElement.call(document, def.name);
    }
    Object.setPrototypeOf(el, constructor.prototype);
    return el;
  }
  subClass(Object, HTMLElement, HTMLElementPolyfill);

  // Object.getOwnPropertyDescriptor(window, 'HTMLElement')
  // {value: ƒ, writable: true, enumerable: false, configurable: true}
  win.HTMLElement = HTMLElementPolyfill;
}

/**
 * Wraps HTMLElement in a Reflect.construct constructor, so that transpiled
 * classes can `_this = superClass.call(this)` during their construction.
 * @param {!Window} win
 */
function wrapHTMLElement(win) {
  const {HTMLElement, Reflect, Object} = win;
  /**
   */
  function HTMLElementWrapper() {
    return Reflect.construct(HTMLElement, [],
        /** @type {!HTMLElement} */(this).constructor);
  }
  subClass(Object, HTMLElement, HTMLElementWrapper);

  // Object.getOwnPropertyDescriptor(window, 'HTMLElement')
  // {value: ƒ, writable: true, enumerable: false, configurable: true}
  win.HTMLElement = HTMLElementWrapper;
}

/**
 * Setups up prototype inheritance
 * @param {!Object} Object
 * @param {!Function} superClass
 * @param {!Function} subClass
 */
function subClass(Object, superClass, subClass) {
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
}

/**
 * Polyfills Custom Elements v1 API
 * @param {!Window} win
 * @param {!Function} ctor
 */
export function install(win, ctor) {
  if (isPatched(win)) {
    return;
  }

  const {Object, Reflect} = win;
  let install = true;
  let installWrapper = false;

  if (hasCustomElements(win)) {
    // If ctor is constructable without new, it's a function. That means it was
    // compiled down, and we need to force the polyfill because all you cannot
    // extend HTMLElement without native classes.
    try {
      // "Construct" ctor using ES5 idioms
      const instance = Object.create(ctor.prototype);
      ctor.call(instance);

      // If that succeeded, we're in a transpiled environment
      // Let's find out if we can wrap HTMLElement and avoid a full patch.
      installWrapper = !!(Reflect && Reflect.construct);
    } catch (e) {

      // The ctor threw when we constructed is via ES5, so it's a real class.
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
