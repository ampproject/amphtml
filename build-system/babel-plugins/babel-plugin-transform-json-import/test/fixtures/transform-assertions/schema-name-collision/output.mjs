import * as _coreJsonSchema from "#core/json-schema";
// validate is ajvCompile's output name, it should be renamed
const schema0 = {
  "type": "string"
};

function validate0(data, {
  instancePath = ""
} = {}) {
  let vErrors = null;
  let errors = 0;

  if (typeof data !== "string") {
    const err0 = {
      instancePath,
      message: "must be string"
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

function _validate(data) {
  return validate0(data) ? [] : validate0.errors;
}

_validate(123);
