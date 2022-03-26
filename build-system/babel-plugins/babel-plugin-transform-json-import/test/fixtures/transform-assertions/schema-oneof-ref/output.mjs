const _validate = validate0;
const schema0 = {
  "oneOf": {
    "1": {
      "properties": {
        "a": 1,
        "b": 1,
        "c": 1,
        "d": 1,
        "h": 1,
        "e": 1,
        "f": 1,
        "g": 1,
        "i": 1
      }
    }
  }
};
const func0 = Object.prototype.hasOwnProperty;

function validate0(data, instancePath = "") {
  let vErrors = null;
  let errors = 0;
  const _errs0 = errors;
  let valid0 = false;
  let passing0 = null;
  const _errs1 = errors;

  if (typeof data !== "string") {
    const err0 = (instancePath + ' ' + "must be string").trim();

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

  const _errs3 = errors;

  if (data && typeof data == "object" && !Array.isArray(data)) {
    for (const key0 in data) {
      if (!func0.call(schema0.oneOf[1].properties, key0)) {
        const err1 = (instancePath + ' ' + "must NOT have additional properties").trim();

        if (vErrors === null) {
          vErrors = [err1];
        } else {
          vErrors.push(err1);
        }

        errors++;
      }
    }

    if (data.a !== undefined) {
      let data0 = data.a;
      const _errs6 = errors;
      let valid2 = false;
      let passing1 = null;
      const _errs7 = errors;

      if (typeof data0 !== "string") {
        const err2 = (instancePath + "/a" + ' ' + "must be string").trim();

        if (vErrors === null) {
          vErrors = [err2];
        } else {
          vErrors.push(err2);
        }

        errors++;
      }

      var _valid1 = _errs7 === errors;

      if (_valid1) {
        valid2 = true;
        passing1 = 0;
      }

      const _errs9 = errors;

      if (!(typeof data0 == "number" && isFinite(data0))) {
        const err3 = (instancePath + "/a" + ' ' + "must be number").trim();

        if (vErrors === null) {
          vErrors = [err3];
        } else {
          vErrors.push(err3);
        }

        errors++;
      }

      var _valid1 = _errs9 === errors;

      if (_valid1 && valid2) {
        valid2 = false;
        passing1 = [passing1, 1];
      } else {
        if (_valid1) {
          valid2 = true;
          passing1 = 1;
        }
      }

      if (!valid2) {
        const err4 = (instancePath + "/a" + ' ' + "must match exactly one schema in oneOf").trim();

        if (vErrors === null) {
          vErrors = [err4];
        } else {
          vErrors.push(err4);
        }

        errors++;
      } else {
        errors = _errs6;

        if (vErrors !== null) {
          if (_errs6) {
            vErrors.length = _errs6;
          } else {
            vErrors = null;
          }
        }
      }
    }

    if (data.b !== undefined) {
      if (typeof data.b !== "boolean") {
        const err5 = (instancePath + "/b" + ' ' + "must be boolean").trim();

        if (vErrors === null) {
          vErrors = [err5];
        } else {
          vErrors.push(err5);
        }

        errors++;
      }
    }

    if (data.c !== undefined) {
      if (typeof data.c !== "string") {
        const err6 = (instancePath + "/c" + ' ' + "must be string").trim();

        if (vErrors === null) {
          vErrors = [err6];
        } else {
          vErrors.push(err6);
        }

        errors++;
      }
    }

    if (data.d !== undefined) {
      if (typeof data.d !== "string") {
        const err7 = (instancePath + "/d" + ' ' + "must be string").trim();

        if (vErrors === null) {
          vErrors = [err7];
        } else {
          vErrors.push(err7);
        }

        errors++;
      }
    }

    if (data.h !== undefined) {
      if (typeof data.h !== "string") {
        const err8 = (instancePath + "/h" + ' ' + "must be string").trim();

        if (vErrors === null) {
          vErrors = [err8];
        } else {
          vErrors.push(err8);
        }

        errors++;
      }
    }

    if (data.e !== undefined) {
      let data5 = data.e;

      if (typeof data5 == "number" && isFinite(data5)) {
        if (data5 < 0 || isNaN(data5)) {
          const err9 = (instancePath + "/e" + ' ' + "must be >= 0").trim();

          if (vErrors === null) {
            vErrors = [err9];
          } else {
            vErrors.push(err9);
          }

          errors++;
        }
      } else {
        const err10 = (instancePath + "/e" + ' ' + "must be number").trim();

        if (vErrors === null) {
          vErrors = [err10];
        } else {
          vErrors.push(err10);
        }

        errors++;
      }
    }

    if (data.f !== undefined) {
      let data6 = data.f;

      if (!(typeof data6 == "number" && isFinite(data6))) {
        const err11 = (instancePath + "/f" + ' ' + "must be number").trim();

        if (vErrors === null) {
          vErrors = [err11];
        } else {
          vErrors.push(err11);
        }

        errors++;
      }
    }

    if (data.g !== undefined) {
      if (typeof data.g !== "string") {
        const err12 = (instancePath + "/g" + ' ' + "must be string").trim();

        if (vErrors === null) {
          vErrors = [err12];
        } else {
          vErrors.push(err12);
        }

        errors++;
      }
    }

    if (data.i !== undefined) {
      let data8 = data.i;

      if (!(typeof data8 == "number" && isFinite(data8))) {
        const err13 = (instancePath + "/i" + ' ' + "must be number").trim();

        if (vErrors === null) {
          vErrors = [err13];
        } else {
          vErrors.push(err13);
        }

        errors++;
      }
    }
  }

  var _valid0 = _errs3 === errors;

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
    const err14 = (instancePath + ' ' + "must match exactly one schema in oneOf").trim();

    if (vErrors === null) {
      vErrors = [err14];
    } else {
      vErrors.push(err14);
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

const validate = (data, schemaName = "oneof-ref") => _validate(data, schemaName) ? [] : _validate.errors;

console.
/*OK*/
log(validate({}));
