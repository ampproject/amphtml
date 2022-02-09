// @ts-nocheck
/* eslint-disable no-var */
/* eslint-disable @typescript-eslint/no-unused-vars */

/* global __MODULE_NAME__ */
/* global __HAS_EXPORTS__ */
/* global __IMPORT_NAMES__ */
/* global __SINGLE_IMPORT_NAME__ */
/* global __ONLY_EXPORTS__ */

/**
 * An async module loader similar to define() in AMD.
 * Our implementation can be compiled down to a minimal form based on the
 * module's needs, as opposed to bundling a general purpose implementation.
 */
(function defineish(callback) {
  // self.BENTO maps module names to their definition objects:
  //
  //   interface Module<Exports> {
  //     // Symbols exported from module, available once module loads.
  //     e?: Exports,
  //     // Callbacks to execute when the module loads.
  //     c?: ((Exports) => void)[]
  //   }
  var modules = (self.BENTO = self.BENTO || {});
  var exec = __HAS_EXPORTS__
    ? function (_exports) {
        callback.apply(null, arguments);
        var name = __MODULE_NAME__;
        var _module = (modules[name] = modules[name] || {});
        _module.e = _exports;
        while (_module.c && _module.c.length > 0) {
          _module.c.pop()(_exports);
        }
      }
    : callback;
  // The most common cases are ONLY_EXPORTS and SINGLE_IMPORT_NAME.
  // We provide them with single-purpose implementations whose output is
  // significantly smaller than the worst case.
  if (__ONLY_EXPORTS__) {
    exec({});
  } else if (__SINGLE_IMPORT_NAME__) {
    var name = __SINGLE_IMPORT_NAME__;
    var _module = (modules[name] = modules[name] || {c: []});
    if (_module.e) {
      exec(_module.e);
    } else {
      _module.c.push(exec);
    }
  } else {
    // Fallback general purpose implementation.
    Promise.all(
      __IMPORT_NAMES__.map(function (name, i) {
        // exports is always the initial item of IMPORT_NAMES
        if (__HAS_EXPORTS__ && i === 0) {
          return {};
        }
        var _module = (modules[name] = modules[name] || {c: []});
        return (
          _module.e ||
          new Promise(function (resolve) {
            _module.c.push(resolve);
          })
        );
      })
    ).then(function (deps) {
      exec.apply(null, deps);
    });
  }
})(function (__CALLBACK_ARGS__) {});
