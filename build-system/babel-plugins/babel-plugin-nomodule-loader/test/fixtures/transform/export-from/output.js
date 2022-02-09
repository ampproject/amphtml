(function defineish(callback) {
  var modules = self.BENTO = self.BENTO || {};
  var exec = true ? function (_exports) {
    callback.apply(null, arguments);
    var name = "build-system/babel-plugins/babel-plugin-nomodule-loader/test/fixtures/transform/export-from/input";

    var _module = modules[name] = modules[name] || {};

    _module.e = _exports;

    while (_module.c && _module.c.length > 0) {
      _module.c.pop()(_exports);
    }
  } : callback;

  if (false) {
    exec({});
  } else if (null) {
    var name = null;

    var _module = modules[name] = modules[name] || {
      c: []
    };

    if (_module.e) {
      exec(_module.e);
    } else {
      _module.c.push(exec);
    }
  } else {
    Promise.all(["", "build-system/babel-plugins/babel-plugin-nomodule-loader/test/fixtures/transform/export-from/abc"].map(function (name, i) {
      if (true && i === 0) {
        return {};
      }

      var _module = modules[name] = modules[name] || {
        c: []
      };

      return _module.e || new Promise(function (resolve) {
        _module.c.push(resolve);
      });
    })).then(function (deps) {
      exec.apply(null, deps);
    });
  }
})(function (_exports, _abc) {
  "use strict";

  _exports.__esModule = true;
  _exports.z = _exports.y = _exports.x = void 0;
  _exports.x = _abc.x;
  _exports.y = _abc.y;
  _exports.z = _abc.z;
});
