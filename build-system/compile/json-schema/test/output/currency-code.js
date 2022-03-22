// build/build-system/compile/json-schema/test/input/currency-code.schema.json.js
import { isValidCurrencyCode } from "#core/json-schema";
var validateAjv = function validate0(data, { instancePath = "", parentData, parentDataProperty, rootData = data } = {}) {
  let vErrors = null;
  let errors = 0;
  if (data && typeof data == "object" && !Array.isArray(data)) {
    if (data.currencyCode !== void 0) {
      if (!isValidCurrencyCode(data.currencyCode)) {
        const err0 = { instancePath: instancePath + "/currencyCode", schemaPath: "#/properties/currencyCode/_0", keyword: "_0", params: {}, message: "must be a valid currency code" };
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
  return validateAjv(data) ? [] : [...validateAjv.errors];
}

// build-system/compile/json-schema/test/input/currency-code.js
globalThis.validateCurrencyCode = validate_currency_code_schema;
