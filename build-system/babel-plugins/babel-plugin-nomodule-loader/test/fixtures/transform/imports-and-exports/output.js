(function defineish(defineCallback) {
  var callbacks = self.BENTO = self.BENTO || {};
  var exec = true ? function (_exports) {
    defineCallback.apply(null, arguments);
    var name = "build-system/babel-plugins/babel-plugin-nomodule-loader/test/fixtures/transform/imports-and-exports/input";
    var awaiting = callbacks[name] = callbacks[name] || [];

    while (awaiting.length) {
      awaiting.pop()(_exports);
    }

    awaiting.push = function (callback) {
      callback(_exports);
    };
  } : defineCallback;

  if (false) {
    exec({});
  } else if (null) {
    var name = null;
    (callbacks[name] = callbacks[name] || []).push(exec);
  } else {
    Promise.all([0, "build-system/babel-plugins/babel-plugin-nomodule-loader/test/fixtures/transform/imports-and-exports/foo"].map(function (name) {
      if (true && name === 0) {
        return {};
      }

      return new Promise(function (resolve) {
        (callbacks[name] = callbacks[name] || []).push(resolve);
      });
    })).then(function (modules) {
      exec.apply(null, modules);
    });
  }
})(function (_exports, _foo) {
  "use strict";

  _exports.__esModule = true;
  _exports.baz = void 0;
  const baz = {
    foo: _foo.foo,
    bar: _foo.bar,
    baz: 'baz'
  };
  _exports.baz = baz;
});
