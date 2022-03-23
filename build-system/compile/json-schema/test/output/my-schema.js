// build/build-system/compile/json-schema/test/input/my-schema.schema.json.js
import { isValidCurrencyCode } from "#core/json-schema";
var validateAjv = function validate0(data, { instancePath = "", parentData, parentDataProperty, rootData = data } = {}) {
  let vErrors = null;
  let errors = 0;
  const _errs0 = errors;
  const _errs1 = errors;
  const _errs2 = errors;
  let valid1 = false;
  let passing0 = null;
  var _valid0 = false;
  const err0 = {};
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
  const _errs3 = errors;
  if (typeof data !== "string") {
    const err1 = {};
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
    const err2 = {};
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
    const err3 = { instancePath, schemaPath: "#/not", keyword: "not", params: {}, message: "must NOT be valid" };
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
  return validateAjv(data) ? [] : validateAjv.errors;
}

// build-system/compile/json-schema/test/input/my-schema.js
console.log(validate_my_schema_schema(100));
console.log(validate_my_schema_schema(false));
console.log(validate_my_schema_schema("bar"));
console.log(validate_my_schema_schema());
