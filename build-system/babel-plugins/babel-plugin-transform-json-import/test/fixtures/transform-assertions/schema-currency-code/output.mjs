import * as _coreJsonSchema from "#core/json-schema";
const schema0 = {
  "description": "https://datahub.io/core/currency-codes",
  "_isValidCurrencyCode": true
};

function validate0(data, {
  instancePath = ""
} = {}) {
  let vErrors = null;
  let errors = 0;

  if (!_coreJsonSchema.isValidCurrencyCode(data)) {
    const err0 = {
      instancePath,
      message: "must be a valid currency code"
    };

    if (vErrors === null) {
      vErrors = [err0];
    } else {
      vErrors.push(err0);
    }

    errors++;
  }

  validate0.errors = vErrors;
  return errors === 0;
}

function validateCurrencyCode(data) {
  return validate0(data) ? [] : validate0.errors;
}

console.
/*OK*/
log(validateCurrencyCode('MXN'));
console.
/*OK*/
log(validateCurrencyCode('INVALID'));
