import * as _coreJsonSchema from "#core/json-schema";
const schema0 = {
  "oneOf": [{
    "const": 0
  }, {
    "type": "string"
  }]
};

function validate0(data, {
  instancePath = ""
} = {}) {
  let vErrors = null;
  let errors = 0;
  const _errs0 = errors;
  let valid0 = false;
  let passing0 = null;
  const _errs1 = errors;

  if (0 !== data) {
    const err0 = {
      instancePath,
      message: "must be equal to constant"
    };

    if (vErrors === null) {
      vErrors = [err0];
    } else {
      vErrors.push(err0);
    }

    errors++;
  }

  var _valid0 = _errs1 === errors;

  if (_valid0) {
    valid0 = true;
    passing0 = 0;
  }

  const _errs2 = errors;

  if (typeof data !== "string") {
    const err1 = {
      instancePath,
      message: "must be string"
    };

    if (vErrors === null) {
      vErrors = [err1];
    } else {
      vErrors.push(err1);
    }

    errors++;
  }

  var _valid0 = _errs2 === errors;

  if (_valid0 && valid0) {
    valid0 = false;
    passing0 = [passing0, 1];
  } else {
    if (_valid0) {
      valid0 = true;
      passing0 = 1;
    }
  }

  if (!valid0) {
    const err2 = {
      instancePath,
      message: "must match exactly one schema in oneOf"
    };

    if (vErrors === null) {
      vErrors = [err2];
    } else {
      vErrors.push(err2);
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
}

function validateOneOf(data) {
  return validate0(data) ? [] : validate0.errors;
}

console.
/*OK*/
log(validateOneOf('invalid'));
console.
/*OK*/
log(validateOneOf(0));
console.
/*OK*/
log(validateOneOf(1));
console.
/*OK*/
log(validateOneOf(true));
