const validate0 = `
  ajv creates a "validate0" identifier in module scope.
  ajv's should be renamed, and this assignment should be preserved.
`;
const _validate = _validate2;
const schema0 = {
  "type": "string"
};

function _validate2(data, instancePath = "") {
  let vErrors = null;
  let errors = 0;

  if (typeof data !== "string") {
    const err0 = (instancePath + ' ' + "must be string").trim();

    if (vErrors === null) {
      vErrors = [err0];
    } else {
      vErrors.push(err0);
    }

    errors++;
  }

  _validate2.errors = vErrors;
  return errors === 0;
}

const validate = (data, schemaName = "name-collision") => _validate(data, schemaName) ? [] : _validate.errors;

validate(`
  "validate" is ajvCompile's default output name.
  This should not fail transform.
`);
