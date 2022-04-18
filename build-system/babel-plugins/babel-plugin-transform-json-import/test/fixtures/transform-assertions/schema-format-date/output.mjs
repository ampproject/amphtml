const validate = validate0;
const formats0 = /^\d\d\d\d-[0-1]\d-[0-3]\d$/;
const formats2 = /^\d\d\d\d-[0-1]\d-[0-3]\d[t\s](?:[0-2]\d:[0-5]\d:[0-5]\d|23:59:60)(?:\.\d+)?(?:z|[+-]\d\d(?::?\d\d)?)$/i;
const formats4 = /^(?:[0-2]\d:[0-5]\d:[0-5]\d|23:59:60)(?:\.\d+)?(?:z|[+-]\d\d(?::?\d\d)?)?$/i;

function validate0(data, instancePath = "") {
  let vErrors = null;
  let errors = 0;

  if (data && typeof data == "object" && !Array.isArray(data)) {
    if (data["my-date"] !== undefined) {
      let data0 = data["my-date"];

      if (typeof data0 === "string") {
        if (!formats0.test(data0)) {
          const err0 = (instancePath + "/my-date" + ' ' + ("must match format \"" + "date" + "\"")).trim();

          if (vErrors === null) {
            vErrors = [err0];
          } else {
            vErrors.push(err0);
          }

          errors++;
        }
      }
    }

    if (data["my-date-time"] !== undefined) {
      let data1 = data["my-date-time"];

      if (typeof data1 === "string") {
        if (!formats2.test(data1)) {
          const err1 = (instancePath + "/my-date-time" + ' ' + ("must match format \"" + "date-time" + "\"")).trim();

          if (vErrors === null) {
            vErrors = [err1];
          } else {
            vErrors.push(err1);
          }

          errors++;
        }
      }
    }

    if (data["my-time"] !== undefined) {
      let data2 = data["my-time"];

      if (typeof data2 === "string") {
        if (!formats4.test(data2)) {
          const err2 = (instancePath + "/my-time" + ' ' + ("must match format \"" + "time" + "\"")).trim();

          if (vErrors === null) {
            vErrors = [err2];
          } else {
            vErrors.push(err2);
          }

          errors++;
        }
      }
    }
  }

  validate0.errors = vErrors;
  return errors === 0;
}

const validateFormatDate = (data, schemaName = "format-date") => validate(data, schemaName) ? [] : validate.errors;

console.
/*OK*/
log(validateFormatDate('invalid'));
console.
/*OK*/
log(validateFormatDate('https://example.com'));
