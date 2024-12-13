const _schema3 = {
  bar: 123
};
const validate0 = `
  ajv creates a "validate0" identifier in module scope.
  ajv's should be renamed, and this assignment should be preserved.
`;
const _schema = '',
      _schema2 = 'generated value should be _schema3';
const _validate = _validate2;

const func0 = require("ajv/dist/runtime/equal").default;

function _validate2(data, instancePath = "") {
  let vErrors = null;
  let errors = 0;

  if (data && typeof data == "object" && !Array.isArray(data)) {
    if (data.foo !== undefined) {
      if (!func0(data.foo, _schema3)) {
        const err0 = (instancePath + "/foo" + ' ' + "must be equal to constant").trim();

        if (vErrors === null) {
          vErrors = [err0];
        } else {
          vErrors.push(err0);
        }

        errors++;
      }
    }
  }

  _validate2.errors = vErrors;
  return errors === 0;
}

const validate = (data, schemaName = "name-collision") => _validate(data, schemaName) ? [] : _validate.errors;

validate(`
  "validate" is ajvCompile's default output name.
  This should not fail transform.
`);
