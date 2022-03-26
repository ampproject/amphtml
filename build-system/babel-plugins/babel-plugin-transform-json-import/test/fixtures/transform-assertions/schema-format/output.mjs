const validate = validate0;
const formats0 = /^(?:[a-z][a-z0-9+\-.]*:)(?:\/?\/)?[^\s]*$/i;
const formats2 = /^[a-z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?(?:\.[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?)*$/i;

function validate0(data, instancePath = "") {
  let vErrors = null;
  let errors = 0;

  if (data && typeof data == "object" && !Array.isArray(data)) {
    if (data["my-uri"] !== undefined) {
      let data0 = data["my-uri"];

      if (typeof data0 === "string") {
        if (!formats0.test(data0)) {
          const err0 = (instancePath + "/my-uri" + ' ' + ("must match format \"" + "uri" + "\"")).trim();

          if (vErrors === null) {
            vErrors = [err0];
          } else {
            vErrors.push(err0);
          }

          errors++;
        }
      }
    }

    if (data["my-email"] !== undefined) {
      let data1 = data["my-email"];

      if (typeof data1 === "string") {
        if (!formats2.test(data1)) {
          const err1 = (instancePath + "/my-email" + ' ' + ("must match format \"" + "email" + "\"")).trim();

          if (vErrors === null) {
            vErrors = [err1];
          } else {
            vErrors.push(err1);
          }

          errors++;
        }
      }
    }
  }

  validate0.errors = vErrors;
  return errors === 0;
}

const validateFormat = (data, schemaName = "format") => validate(data, schemaName) ? [] : validate.errors;

console.
/*OK*/
log(validateFormat('invalid'));
console.
/*OK*/
log(validateFormat('https://example.com'));
