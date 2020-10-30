var WorkerThread = (function (exports) {
  'use strict';

  function _typeof(obj) {
    "@babel/helpers - typeof";

    if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") {
      _typeof = function (obj) {
        return typeof obj;
      };
    } else {
      _typeof = function (obj) {
        return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
      };
    }

    return _typeof(obj);
  }

  function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }

  function _defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ("value" in descriptor) descriptor.writable = true;
      Object.defineProperty(target, descriptor.key, descriptor);
    }
  }

  function _createClass(Constructor, protoProps, staticProps) {
    if (protoProps) _defineProperties(Constructor.prototype, protoProps);
    if (staticProps) _defineProperties(Constructor, staticProps);
    return Constructor;
  }

  function _defineProperty(obj, key, value) {
    if (key in obj) {
      Object.defineProperty(obj, key, {
        value: value,
        enumerable: true,
        configurable: true,
        writable: true
      });
    } else {
      obj[key] = value;
    }

    return obj;
  }

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
  var count = 0;
  var transfer = [];
  var mapping = new Map();
  console.log('wth');

  /**
   * Stores a string in mapping and returns the index of the location.
   * @param value string to store
   * @return location in map
   */

  function store(value) {
    if (mapping.has(value)) {
      // Safe to cast since we verified the mapping contains the value
      return mapping.get(value);
    }

    mapping.set(value, count);
    transfer.push(value);
    return count++;
  }
  /**
   * Returns strings registered but not yet transferred.
   * Side effect: Resets the transfer array to default value, to prevent passing the same values multiple times.
   */

  function consume() {
    var strings = transfer;
    transfer = [];
    return strings;
  }

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
  var phase = 0
  /* Initializing */
  ;
  var set = function set(newPhase) {
    return phase = newPhase;
  };

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
  var transfer$1 = [];
  /**
   * Returns nodes registered but not yet transferred.
   * Side effect: Resets the transfer array to default value, to prevent passing the same values multiple times.
   */

  function consume$1() {
    var copy = transfer$1;
    transfer$1 = [];
    return copy;
  }

  var pending = false;
  var pendingMutations = []; // TODO(choumx): Change `mutation` to Array<Uint16> to prevent casting errors e.g. integer underflow, precision loss.

  function transfer$2(document, mutation) {
    if (phase > 0
    /* Initializing */
    && document[58
    /* allowTransfer */
    ]) {
      pending = true;
      pendingMutations = pendingMutations.concat(mutation);
      Promise.resolve().then(function (_) {
        if (pending) {
          var _document$postMessage;

          var nodes = new Uint16Array(consume$1().reduce(function (acc, node) {
            return acc.concat(node[8
            /* creationFormat */
            ]);
          }, [])).buffer;
          var mutations = new Uint16Array(pendingMutations).buffer;
          document.postMessage((_document$postMessage = {}, _defineProperty(_document$postMessage, 54
          /* phase */
          , phase), _defineProperty(_document$postMessage, 12
          /* type */
          , phase === 2
          /* Mutating */
          ? 3
          /* MUTATE */
          : 2), _defineProperty(_document$postMessage, 37
          /* nodes */
          , nodes), _defineProperty(_document$postMessage, 41
          /* strings */
          , consume()), _defineProperty(_document$postMessage, 36
          /* mutations */
          , mutations), _document$postMessage), [nodes, mutations]);
          pendingMutations = [];
          pending = false;
          set(2
          /* Mutating */
          );
        }
      });
    }
  }

  var AMP = /*#__PURE__*/function () {
    function AMP(document) {
      _classCallCheck(this, AMP);

      this.document = document;
    }
    /**
     * Returns a promise that resolves with the value of `key`.
     * @param key
     */


    _createClass(AMP, [{
      key: "getState",
      value: function getState(key) {
        var _this = this;

        return new Promise(function (resolve) {
          var messageHandler = function messageHandler(event) {
            var message = event.data;

            if (message[12
            /* type */
            ] !== 11
            /* GET_STORAGE */
            ) {
                return;
              } // TODO: There is a race condition here if there are multiple concurrent
            // getState(k) messages in flight, where k is the same value.


            var storageMessage = message;

            if (storageMessage[74
            /* storageKey */
            ] !== key) {
              return;
            }

            _this.document.removeGlobalEventListener('message', messageHandler);

            var value = storageMessage[21
            /* value */
            ];
            resolve(value);
          };

          _this.document.addGlobalEventListener('message', messageHandler);

          transfer$2(_this.document, [12
          /* STORAGE */
          , 1
          /* GET */
          , 2
          /* AmpState */
          ,
          /* key */
          store(key),
          /* value */
          0]);
          setTimeout(resolve, 500, null); // TODO: Why a magical constant, define and explain.
        });
      }
      /**
       * Deep-merges `state` into the existing state.
       * @param state
       */

    }, {
      key: "setState",
      value: function setState(state) {
        // Stringify `state` so it can be post-messaged as a transferrable.
        var stringified;

        try {
          stringified = JSON.stringify(state);
        } catch (e) {
          throw new Error("AMP.setState only accepts valid JSON as input.");
        }

        transfer$2(this.document, [12
        /* STORAGE */
        , 2
        /* SET */
        , 2
        /* AmpState */
        ,
        /* key */
        0,
        /* value */
        store(stringified)]);
      }
    }]);

    return AMP;
  }();

  var exportedFunctions = {};
  function callFunctionMessageHandler(event, document) {
    var msg = event.data;

    if (msg[12
    /* type */
    ] !== 12
    /* FUNCTION */
    ) {
        return;
      }

    var functionMessage = msg;
    var fnIdentifier = functionMessage[77
    /* functionIdentifier */
    ];
    var fnArguments = JSON.parse(functionMessage[78
    /* functionArguments */
    ]);
    var index = functionMessage[7
    /* index */
    ];
    var fn = exportedFunctions[fnIdentifier];

    if (!fn) {
      transfer$2(document, [13
      /* FUNCTION_CALL */
      , 2
      /* REJECT */
      , index, store(JSON.stringify("[worker-dom]: Exported function \"".concat(fnIdentifier, "\" could not be found.")))]);
      return;
    }

    Promise.resolve(fn) // Forcing promise flows allows us to skip a try/catch block.
    .then(function (f) {
      return f.apply(null, fnArguments);
    }).then(function (value) {
      transfer$2(document, [13
      /* FUNCTION_CALL */
      , 1
      /* RESOLVE */
      , index, store(JSON.stringify(value))]);
    }, function (err) {
      var errorMessage = JSON.stringify(err.message || err);
      transfer$2(document, [13
      /* FUNCTION_CALL */
      , 2
      /* REJECT */
      , index, store(JSON.stringify("[worker-dom]: Function \"".concat(fnIdentifier, "\" threw: \"").concat(errorMessage, "\"")))]);
    });
  }
  function exportFunction(name, fn) {
    if (!name || name === '') {
      throw new Error("[worker-dom]: Attempt to export function was missing an identifier.");
    }

    if (typeof fn !== 'function') {
      throw new Error("[worker-dom]: Attempt to export non-function failed: (\"".concat(name, "\", ").concat(_typeof(fn), ")."));
    }

    if (name in exportedFunctions) {
      throw new Error("[worker-dom]: Attempt to re-export function failed: \"".concat(name, "\"."));
    }

    exportedFunctions[name] = fn;
  }

  /**
   * Copyright 2020 The AMP HTML Authors. All Rights Reserved.
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
  var _a, _b;
  /**
   * A lightweight Document stub for the no-dom amp binary.
   */

  var DocumentStub = /*#__PURE__*/function () {
    function DocumentStub() {
      _classCallCheck(this, DocumentStub);

      this[_a] = true;
      this[_b] = -1;
      this.defaultView = {
        document: this
      };
    }

    _createClass(DocumentStub, [{
      key: (_a = 58
      /* allowTransfer */
      , _b = 7
      /* index */
      , 59
      /* observe */
      ),
      value: function value() {
        set(2
        /* Mutating */
        );
      }
    }]);

    return DocumentStub;
  }();

  /**
   * Copyright 2020 The AMP HTML Authors. All Rights Reserved.
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
  var ALLOWLISTED_GLOBALS = {
    Array: true,
    ArrayBuffer: true,
    BigInt: true,
    BigInt64Array: true,
    BigUint64Array: true,
    Boolean: true,
    Cache: true,
    CustomEvent: true,
    DataView: true,
    Date: true,
    Error: true,
    EvalError: true,
    Event: true,
    EventTarget: true,
    Float32Array: true,
    Float64Array: true,
    Function: true,
    Infinity: true,
    Int16Array: true,
    Int32Array: true,
    Int8Array: true,
    Intl: true,
    JSON: true,
    Map: true,
    Math: true,
    NaN: true,
    Number: true,
    Object: true,
    Promise: true,
    Proxy: true,
    RangeError: true,
    ReferenceError: true,
    Reflect: true,
    RegExp: true,
    Set: true,
    String: true,
    Symbol: true,
    SyntaxError: true,
    TextDecoder: true,
    TextEncoder: true,
    TypeError: true,
    URIError: true,
    URL: true,
    Uint16Array: true,
    Uint32Array: true,
    Uint8Array: true,
    Uint8ClampedArray: true,
    WeakMap: true,
    WeakSet: true,
    WebAssembly: true,
    WebSocket: true,
    XMLHttpRequest: true,
    atob: true,
    addEventListener: true,
    removeEventListener: true,
    btoa: true,
    caches: true,
    clearInterval: true,
    clearTimeout: true,
    console: true,
    decodeURI: true,
    decodeURIComponent: true,
    document: true,
    encodeURI: true,
    encodeURIComponent: true,
    escape: true,
    fetch: true,
    indexedDB: true,
    isFinite: true,
    isNaN: true,
    location: true,
    navigator: true,
    onerror: true,
    onrejectionhandled: true,
    onunhandledrejection: true,
    parseFloat: true,
    parseInt: true,
    performance: true,
    requestAnimationFrame: true,
    cancelAnimationFrame: true,
    self: true,
    setTimeout: true,
    setInterval: true,
    unescape: true
  }; // Modify global scope by removing disallowed properties.

  function deleteGlobals(global) {
    /**
     * @param object
     * @param property
     * @return True if property was deleted from object. Otherwise, false.
     */
    var deleteUnsafe = function deleteUnsafe(object, property) {
      if (!ALLOWLISTED_GLOBALS.hasOwnProperty(property)) {
        try {
          delete object[property];
          return true;
        } catch (e) {}
      }

      return false;
    }; // Walk up global's prototype chain and dereference non-allowlisted properties
    // until EventTarget is reached.


    var current = global;

    var _loop = function _loop() {
      var deleted = [];
      var failedToDelete = [];
      Object.getOwnPropertyNames(current).forEach(function (prop) {
        if (deleteUnsafe(current, prop)) {
          deleted.push(prop);
        } else {
          failedToDelete.push(prop);
        }
      });
      console.info("Removed ".concat(deleted.length, " references from"), current, ':', deleted);

      if (failedToDelete.length) {
        console.info("Failed to remove ".concat(failedToDelete.length, " references from"), current, ':', failedToDelete);
      }

      current = Object.getPrototypeOf(current);
    };

    while (current && current.constructor !== EventTarget) {
      _loop();
    }
  }

  /**
   * Copyright 2020 The AMP HTML Authors. All Rights Reserved.
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

  var noop = function noop() {
    return void 0;
  };
  console.log('wthhhhhhhhhhh');
  var workerDOM = function (postMessage, addEventListener, removeEventListener) {
    var document = new DocumentStub(); // TODO(choumx): Avoid polluting Document's public API.

    document.postMessage = postMessage;
    document.addGlobalEventListener = addEventListener;
    document.removeGlobalEventListener = removeEventListener;
    return {
      document: document
    };
  }(postMessage.bind(self) || noop, addEventListener.bind(self) || noop, removeEventListener.bind(self) || noop); // Modify global scope by removing disallowed properties.

  deleteGlobals(self); // Offer APIs like AMP.setState() on the global scope.

  self.AMP = new AMP(workerDOM.document); // Allows for function invocation

  self.exportFunction = exportFunction;
  addEventListener('message', function (evt) {
    console.log('worker received mesaage', evt);
    return callFunctionMessageHandler(evt, workerDOM.document);
  });
  var hydrate = noop;

  exports.hydrate = hydrate;
  exports.workerDOM = workerDOM;

  return exports;

}({}));
//# sourceMappingURL=worker.nodom.js.map
