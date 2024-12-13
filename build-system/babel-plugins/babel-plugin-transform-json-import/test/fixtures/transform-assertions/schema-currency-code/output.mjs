import { isIso4217CurrencyCode } from '#core/json-schema';
"use strict";

const validate = validate0;

function validate0(data, instancePath = "") {
  let vErrors = null;
  let errors = 0;

  if (!isIso4217CurrencyCode(data)) {
    const err0 = (instancePath + ' ' + "must be a valid ISO 4217 currency code").trim();

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

const validateCurrencyCode = (data, schemaName = "currency-code") => validate(data, schemaName) ? [] : validate.errors;

console.
/*OK*/
log(validateCurrencyCode('MXN'));
console.
/*OK*/
log(validateCurrencyCode('INVALID'));
