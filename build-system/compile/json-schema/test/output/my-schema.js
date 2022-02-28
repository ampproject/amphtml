(function() {
  // build/build-system/compile/json-schema/test/input/my-schema.schema.json.js
  var validateAjv = function validate0(data, _temp) {
    var _ref = _temp === void 0 ? {} : _temp, _ref$instancePath = _ref.instancePath, instancePath = _ref$instancePath === void 0 ? "" : _ref$instancePath, parentData = _ref.parentData, parentDataProperty = _ref.parentDataProperty, _ref$rootData = _ref.rootData, rootData = _ref$rootData === void 0 ? data : _ref$rootData;
    var vErrors = null;
    var errors = 0;
    var _errs0 = errors;
    var _errs1 = errors;
    var _errs2 = errors;
    var valid1 = false;
    var passing0 = null;
    var _valid0 = false;
    var err0 = {};
    if (vErrors === null) {
      vErrors = [err0];
    } else {
      vErrors.push(err0);
    }
    errors++;
    if (_valid0) {
      valid1 = true;
      passing0 = 0;
    }
    var _errs3 = errors;
    if (typeof data !== "string") {
      var err1 = {};
      if (vErrors === null) {
        vErrors = [err1];
      } else {
        vErrors.push(err1);
      }
      errors++;
    }
    var _valid0 = _errs3 === errors;
    if (_valid0 && valid1) {
      valid1 = false;
      passing0 = [passing0, 1];
    } else {
      if (_valid0) {
        valid1 = true;
        passing0 = 1;
      }
    }
    if (!valid1) {
      var err2 = {};
      if (vErrors === null) {
        vErrors = [err2];
      } else {
        vErrors.push(err2);
      }
      errors++;
    } else {
      errors = _errs2;
      if (vErrors !== null) {
        if (_errs2) {
          vErrors.length = _errs2;
        } else {
          vErrors = null;
        }
      }
    }
    var valid0 = _errs1 === errors;
    if (valid0) {
      var err3 = {
        instancePath: instancePath,
        schemaPath: "#/not",
        keyword: "not",
        params: {},
        message: "must NOT be valid"
      };
      if (vErrors === null) {
        vErrors = [err3];
      } else {
        vErrors.push(err3);
      }
      errors++;
    } else {
      errors = _errs0;
      if (vErrors !== null) {
        if (_errs0) {
          vErrors.length = _errs0;
        } else {
          vErrors = null;
        }
      }
    }
    validate0.errors = vErrors;
    return errors === 0;
  };
  function validate_my_schema_schema(data) {
    return validateAjv(data) ? [] : [].concat(validateAjv.errors);
  }

  // build-system/compile/json-schema/test/input/my-schema.js
  console.log(validate_my_schema_schema(100));
  console.log(validate_my_schema_schema(false));
  console.log(validate_my_schema_schema("bar"));
  console.log(validate_my_schema_schema());
})();

//# sourceMappingURL=my-schema.js.map