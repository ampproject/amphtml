const validate = validate0;
const formats0 = /^(?:[a-z][a-z0-9+\-.]*:)(?:\/?\/)?[^\s]*$/i;
const pattern0 = new RegExp("^https://", "u");

function validate1(data, instancePath = "") {
  let vErrors = null;
  let errors = 0;

  if (typeof data === "string") {
    if (!pattern0.test(data)) {
      const err0 = (instancePath + ' ' + ("must match pattern \"" + "^https://" + "\"")).trim();

      if (vErrors === null) {
        vErrors = [err0];
      } else {
        vErrors.push(err0);
      }

      errors++;
    }

    if (!formats0.test(data)) {
      const err1 = (instancePath + ' ' + ("must match format \"" + "uri" + "\"")).trim();

      if (vErrors === null) {
        vErrors = [err1];
      } else {
        vErrors.push(err1);
      }

      errors++;
    }
  } else {
    const err2 = (instancePath + ' ' + "must be string").trim();

    if (vErrors === null) {
      vErrors = [err2];
    } else {
      vErrors.push(err2);
    }

    errors++;
  }

  validate1.errors = vErrors;
  return errors === 0;
}

function validate0(data, instancePath = "") {
  let vErrors = null;
  let errors = 0;

  if (data && typeof data == "object" && !Array.isArray(data)) {
    if (data.foo !== undefined) {
      if (!validate1(data.foo, instancePath + "/foo")) {
        vErrors = vErrors === null ? validate1.errors : vErrors.concat(validate1.errors);
        errors = vErrors.length;
      }
    }

    if (data.bar !== undefined) {
      if (!validate1(data.bar, instancePath + "/bar")) {
        vErrors = vErrors === null ? validate1.errors : vErrors.concat(validate1.errors);
        errors = vErrors.length;
      }
    }
  }

  validate0.errors = vErrors;
  return errors === 0;
}

const validateRefs = (data, schemaName = "refs") => validate(data, schemaName) ? [] : validate.errors;

console.
/*OK*/
log(validateRefs({
  foo: 'foo',
  bar: 'foo'
}));
console.
/*OK*/
log(validateRefs({
  foo: 'https://foo.com',
  bar: 'https://bar.org'
}));
