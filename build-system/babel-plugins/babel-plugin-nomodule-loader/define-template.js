// @ts-nocheck
/* eslint-disable no-var */
/* eslint-disable @typescript-eslint/no-unused-vars */

/* global __MODULE_NAME__ */
/* global __HAS_EXPORTS__ */
/* global __IMPORT_NAMES__ */
/* global __SINGLE_IMPORT_NO_EXPORTS__ */
/* global __ONLY_EXPORTS__ */

/**
 * An async module loader similar to define() in AMD.
 * Our implementation varies in that it can be compiled down to a minimal form
 * based on the module's needs, rather than bundling a full implementation.
 * @param {object} defineCallback
 */
(function defineish(defineCallback) {
  // self.BENTO maps module names to callbacks to execute with their contents.
  //   interface ModuleCallbacks {
  //     [name: string]: ((Object) => void)[],
  //   }
  var callbacks = (self.BENTO = self.BENTO || {});
  var exec = __HAS_EXPORTS__
    ? function (_exports) {
        defineCallback.apply(null, arguments);
        var name = __MODULE_NAME__;
        var awaiting = (callbacks[name] = callbacks[name] || []);
        while (awaiting.length) {
          awaiting.pop()(_exports);
        }
        awaiting.push = function (callback) {
          callback(_exports);
        };
      }
    : defineCallback;
  // The most common cases are ONLY_EXPORTS and SINGLE_IMPORT_NO_EXPORTS.
  // We provide them with single-purpose implementations whose output is
  // significantly smaller than the worst case.
  if (__ONLY_EXPORTS__) {
    exec({});
  } else if (__SINGLE_IMPORT_NO_EXPORTS__) {
    var name = __SINGLE_IMPORT_NO_EXPORTS__;
    (callbacks[name] = callbacks[name] || []).push(exec);
  } else {
    // Fallback general purpose implementation.
    Promise.all(
      __IMPORT_NAMES__.map(function (name) {
        // exports is identified as the number 0
        if (__HAS_EXPORTS__ && name === 0) {
          return {};
        }
        return new Promise(function (resolve) {
          (callbacks[name] = callbacks[name] || []).push(resolve);
        });
      })
    ).then(function (modules) {
      exec.apply(null, modules);
    });
  }
})(function (__CALLBACK_ARGS__) {});
