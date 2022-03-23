// build/build-system/compile/json-schema/test/input/currency-code.schema.json.js
import { isValidCurrencyCode } from "#core/json-schema";
function validate1(data, { instancePath = "", parentData, parentDataProperty, rootData = data } = {}) {
  let vErrors = null;
  let errors = 0;
  if (!isValidCurrencyCode(data)) {
    const err0 = { instancePath, schemaPath: "#/_0", keyword: "_0", params: {}, message: "must be a valid currency code" };
    if (vErrors === null) {
      vErrors = [err0];
    } else {
      vErrors.push(err0);
    }
    errors++;
  }
  validate1.errors = vErrors;
  return errors === 0;
}
function validate_currency_code_schema(data) {
  return validate1(data) ? [] : validate1.errors;
}

// build-system/compile/json-schema/test/input/currency-code.js
globalThis.validateCurrencyCode = validate_currency_code_schema;
