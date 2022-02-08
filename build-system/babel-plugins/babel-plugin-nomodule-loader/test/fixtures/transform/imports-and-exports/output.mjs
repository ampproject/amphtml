(function defineish(callback) {
  var modules = self.BENTO = self.BENTO || {};
  var exec = true ? function (_exports) {
    callback.apply(null, arguments);
    var name = "build-system/babel-plugins/babel-plugin-nomodule-loader/test/fixtures/transform/imports-and-exports/input";

    var _module = modules[name] = modules[name] || {};

    _module.m = _exports;

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

    if (_module.m) {
      exec(_module.m);
    } else {
      _module.c.push(exec);
    }
  } else {
    Promise.all(["", "build-system/babel-plugins/babel-plugin-nomodule-loader/test/fixtures/transform/imports-and-exports/foo"].map(function (name, i) {
      if (true && i === 0) {
        return {};
      }

      var _module = modules[name] = modules[name] || {
        c: []
      };

      return _module.m || new Promise(function (resolve) {
        _module.c.push(resolve);
      });
    })).then(function (deps) {
      exec.apply(null, deps);
    });
  }
})(function (exports, _foo) {
  const baz = {
    foo,
    bar,
    baz: 'baz'
  };
});
