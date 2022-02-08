(function defineish(callback) {
  var modules = self.BENTO = self.BENTO || {};
  var exec = false ? function (_exports) {
    callback.apply(null, arguments);
    var name = "build-system/babel-plugins/babel-plugin-nomodule-loader/test/fixtures/transform/single-import-name/input";

    var _module = modules[name] = modules[name] || {};

    _module.m = _exports;

    while (_module.c && _module.c.length > 0) {
      _module.c.pop()(_exports);
    }
  } : callback;

  if (false) {
    exec({});
  } else if ("build-system/babel-plugins/babel-plugin-nomodule-loader/test/fixtures/transform/single-import-name/foo") {
    var name = "build-system/babel-plugins/babel-plugin-nomodule-loader/test/fixtures/transform/single-import-name/foo";

    var _module = modules[name] = modules[name] || {
      c: []
    };

    if (_module.m) {
      exec(_module.m);
    } else {
      _module.c.push(exec);
    }
  } else {
    Promise.all(["build-system/babel-plugins/babel-plugin-nomodule-loader/test/fixtures/transform/single-import-name/foo"].map(function (name, i) {
      if (false && i === 0) {
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
})(function (_foo) {
  console.log({
    foo,
    bar
  });
});
