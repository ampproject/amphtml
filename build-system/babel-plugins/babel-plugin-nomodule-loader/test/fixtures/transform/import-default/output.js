(function defineish(defineCallback) {
  var callbacks = self.BENTO = self.BENTO || {};
  var exec = false ? function (_exports) {
    defineCallback.apply(null, arguments);
    var name = "build-system/babel-plugins/babel-plugin-nomodule-loader/test/fixtures/transform/import-default/input";
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
  } else if ("build-system/babel-plugins/babel-plugin-nomodule-loader/test/fixtures/transform/import-default/x") {
    var name = "build-system/babel-plugins/babel-plugin-nomodule-loader/test/fixtures/transform/import-default/x";
    (callbacks[name] = callbacks[name] || []).push(exec);
  } else {
    Promise.all(["build-system/babel-plugins/babel-plugin-nomodule-loader/test/fixtures/transform/import-default/x"].map(function (name) {
      if (false && name === 0) {
        return {};
      }

      return new Promise(function (resolve) {
        (callbacks[name] = callbacks[name] || []).push(resolve);
      });
    })).then(function (modules) {
      exec.apply(null, modules);
    });
  }
})(function (_x) {
  "use strict";

  console.log(_x.default);
});
