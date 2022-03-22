(function() {
  // src/core/json-schema.ts
  function isValidCurrencyCode(data) {
    try {
      Intl.NumberFormat("en-EN", {
        currency: data
      }).format(0);
      return true;
    } catch (_) {
      return false;
    }
  }

  // build/build-system/compile/json-schema/test/input/currency-code.schema.json.js
  var validateAjv = function validate0(data, _temp) {
    var _ref = _temp === void 0 ? {} : _temp, _ref$instancePath = _ref.instancePath, instancePath = _ref$instancePath === void 0 ? "" : _ref$instancePath, parentData = _ref.parentData, parentDataProperty = _ref.parentDataProperty, _ref$rootData = _ref.rootData, rootData = _ref$rootData === void 0 ? data : _ref$rootData;
    var vErrors = null;
    var errors = 0;
    if (data && typeof data == "object" && !Array.isArray(data)) {
      if (data.currencyCode !== void 0) {
        if (!isValidCurrencyCode(data.currencyCode)) {
          var err0 = {
            instancePath: instancePath + "/currencyCode",
            schemaPath: "#/properties/currencyCode/_0",
            keyword: "_0",
            params: {},
            message: "must be a valid currency code"
          };
          if (vErrors === null) {
            vErrors = [err0];
          } else {
            vErrors.push(err0);
          }
          errors++;
        }
      }
    }
    validate0.errors = vErrors;
    return errors === 0;
  };
  function validate_currency_code_schema(data) {
    return validateAjv(data) ? [] : [].concat(validateAjv.errors);
  }

  // build-system/compile/json-schema/test/input/currency-code.js
  globalThis.validateCurrencyCode = validate_currency_code_schema;
})();

//# sourceMappingURL=currency-code.js.map