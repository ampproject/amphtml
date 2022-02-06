// @ts-nocheck
/* eslint-disable no-var */

/* global __ARGS__ */
/* global __MODULE_NAME__ */
/* global __HAS_EXPORTS__ */
/* global __ONLY_DEP__ */

(function define(deps, callback) {
  self.BENTO = self.BENTO || {};
  if (__HAS_EXPORTS__) {
    var formerCallback = callback;
    callback = function (_exports) {
      formerCallback.apply(null, arguments);
      var name = __MODULE_NAME__;
      var _module = (self.BENTO[name] = self.BENTO[name] || {});
      _module.m = _exports;
      while (_module.c && _module.c.length > 0) {
        _module.c.pop()(_exports);
      }
    };
  }
  if (__ONLY_DEP__) {
    if (__ONLY_DEP__ === 'exports') {
      callback({});
    } else {
      var _module = self.BENTO[__ONLY_DEP__] || {c: []};
      if (_module.m) {
        callback(_module.m);
      } else {
        _module.c.push(callback);
      }
    }
  } else {
    Promise.all(
      deps.map(function (name) {
        if (__HAS_EXPORTS__ && name === 'exports') {
          return {};
        }
        var _module = self.BENTO[name] || {c: []};
        return (
          _module.m ||
          new Promise(function (resolve) {
            _module.c.push(resolve);
          })
        );
      })
    ).then(function (deps) {
      callback.apply(null, deps);
    });
  }
})(__ARGS__);
