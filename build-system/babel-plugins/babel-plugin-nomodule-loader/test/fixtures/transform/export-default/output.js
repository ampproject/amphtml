(function defineish(defineCallback) {
  var callbacks = self.BENTO = self.BENTO || {};
  var exec = true ? function (_exports) {
    defineCallback.apply(null, arguments);
    var name = "build-system/babel-plugins/babel-plugin-nomodule-loader/test/fixtures/transform/export-default/input";
    var awaiting = callbacks[name] = callbacks[name] || [];

    while (awaiting.length) {
      awaiting.pop()(_exports);
    }

    awaiting.push = function (callback) {
      callback(_exports);
    };
  } : defineCallback;

  if (true) {
    exec({});
  } else if (null) {
    var name = null;
    (callbacks[name] = callbacks[name] || []).push(exec);
  } else {
    Promise.all([0].map(function (name) {
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
})(function (_exports) {
  "use strict";

  _exports.__esModule = true;
  _exports.default = fn;

  function fn() {}
});
