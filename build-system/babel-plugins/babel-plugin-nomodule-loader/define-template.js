// @ts-nocheck
/* eslint-disable no-var */
/* eslint-disable @typescript-eslint/no-unused-vars */

/* global __MODULE_NAME__ */
/* global __HAS_EXPORTS__ */
/* global __IMPORT_NAMES__ */
/* global __SINGLE_IMPORT_NAME__ */
/* global __ONLY_EXPORTS__ */

(function defineish(callback) {
  var modules = (self.BENTO = self.BENTO || {});
  var exec = __HAS_EXPORTS__
    ? function (_exports) {
        callback.apply(null, arguments);
        var name = __MODULE_NAME__;
        var _module = (modules[name] = modules[name] || {});
        _module.m = _exports;
        while (_module.c && _module.c.length > 0) {
          _module.c.pop()(_exports);
        }
      }
    : callback;
  if (__ONLY_EXPORTS__) {
    exec({});
  } else if (__SINGLE_IMPORT_NAME__) {
    var name = __SINGLE_IMPORT_NAME__;
    var _module = (modules[name] = modules[name] || {c: []});
    if (_module.m) {
      exec(_module.m);
    } else {
      _module.c.push(exec);
    }
  } else {
    Promise.all(
      __IMPORT_NAMES__.map(function (name, i) {
        if (__HAS_EXPORTS__ && i === 0) {
          return {};
        }
        var _module = (modules[name] = modules[name] || {c: []});
        return (
          _module.m ||
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
