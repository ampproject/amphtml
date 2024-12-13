const _schema = {
  prop_a: 0,
  prop_b: 0,
  prop_c: 0,
  prop_d: 0,
  prop_e: 0,
  prop_f: 0,
  prop_g: 0,
  prop_h: 0,
  prop_i: 0
},
      _schema2 = {
  prop_z: 0,
  prop_y: 0,
  prop_x: 0,
  prop_w: 0,
  prop_v: 0,
  prop_u: 0,
  prop_t: 0,
  prop_s: 0,
  prop_r: 0
},
      _schema3 = {
  foo: "This object should be included in the schema object",
  bar: {
    "all keys are included": true
  }
},
      _schema4 = {
  bar: "This object should also be included in the schema object"
},
      _schema5 = {
  object: true,
  bar: {
    "all keys are included": true
  }
};
const _validate = validate0;

const func0 = require("ajv/dist/runtime/equal").default;

const func1 = Object.prototype.hasOwnProperty;

function validate0(data, instancePath = "") {
  let vErrors = null;
  let errors = 0;

  if (Array.isArray(data)) {
    const len0 = data.length;

    for (let i0 = 0; i0 < len0; i0++) {
      let data0 = data[i0];

      if (data0 && typeof data0 == "object" && !Array.isArray(data0)) {
        if (data0.prop_a !== undefined) {
          let data1 = data0.prop_a;
          const _errs3 = errors;
          let valid3 = false;
          let passing0 = null;
          const _errs4 = errors;

          if (typeof data1 !== "boolean") {
            const err0 = (instancePath + "/" + i0 + "/prop_a" + ' ' + "must be boolean").trim();

            if (vErrors === null) {
              vErrors = [err0];
            } else {
              vErrors.push(err0);
            }

            errors++;
          }

          var _valid0 = _errs4 === errors;

          if (_valid0) {
            valid3 = true;
            passing0 = 0;
          }

          const _errs6 = errors;

          if (!(data1 === 123 || data1 === 345 || func0(data1, _schema3) || data1 === "this string should NOT be included in the schema object" || data1 === "this string should also NOT be included in the schema object" || func0(data1, _schema4))) {
            const err1 = (instancePath + "/" + i0 + "/prop_a" + ' ' + "must be equal to one of the allowed values").trim();

            if (vErrors === null) {
              vErrors = [err1];
            } else {
              vErrors.push(err1);
            }

            errors++;
          }

          var _valid0 = _errs6 === errors;

          if (_valid0 && valid3) {
            valid3 = false;
            passing0 = [passing0, 1];
          } else {
            if (_valid0) {
              valid3 = true;
              passing0 = 1;
            }
          }

          if (!valid3) {
            const err2 = (instancePath + "/" + i0 + "/prop_a" + ' ' + "must match exactly one schema in oneOf").trim();

            if (vErrors === null) {
              vErrors = [err2];
            } else {
              vErrors.push(err2);
            }

            errors++;
          } else {
            errors = _errs3;

            if (vErrors !== null) {
              if (_errs3) {
                vErrors.length = _errs3;
              } else {
                vErrors = null;
              }
            }
          }
        }

        if (data0.prop_c !== undefined) {
          let data2 = data0.prop_c;

          if (data2 && typeof data2 == "object" && !Array.isArray(data2)) {
            for (const key0 in data2) {
              if (!(key0 === "prop_x" || key0 === "prop_y" || key0 === "prop_z")) {
                const err3 = (instancePath + "/" + i0 + "/prop_c" + ' ' + "must NOT have additional properties").trim();

                if (vErrors === null) {
                  vErrors = [err3];
                } else {
                  vErrors.push(err3);
                }

                errors++;
              }
            }

            if (data2.prop_z !== undefined) {
              let data3 = data2.prop_z;

              if (data3 && typeof data3 == "object" && !Array.isArray(data3)) {
                if (data3.objectWithoutAditionalPropertiesA !== undefined) {
                  let data4 = data3.objectWithoutAditionalPropertiesA;

                  if (data4 && typeof data4 == "object" && !Array.isArray(data4)) {
                    for (const key1 in data4) {
                      if (!func1.call(_schema, key1)) {
                        const err4 = (instancePath + "/" + i0 + "/prop_c/prop_z/objectWithoutAditionalPropertiesA" + ' ' + "must NOT have additional properties").trim();

                        if (vErrors === null) {
                          vErrors = [err4];
                        } else {
                          vErrors.push(err4);
                        }

                        errors++;
                      }
                    }
                  }
                }

                if (data3.objectWithoutAditionalPropertiesB !== undefined) {
                  let data5 = data3.objectWithoutAditionalPropertiesB;

                  if (data5 && typeof data5 == "object" && !Array.isArray(data5)) {
                    for (const key2 in data5) {
                      if (!func1.call(_schema2, key2)) {
                        const err5 = (instancePath + "/" + i0 + "/prop_c/prop_z/objectWithoutAditionalPropertiesB" + ' ' + "must NOT have additional properties").trim();

                        if (vErrors === null) {
                          vErrors = [err5];
                        } else {
                          vErrors.push(err5);
                        }

                        errors++;
                      }
                    }

                    if (data5.prop_w !== undefined) {
                      let data6 = data5.prop_w;

                      if (data6 && typeof data6 == "object" && !Array.isArray(data6)) {
                        if (data6.prop_xyz !== undefined) {
                          let data7 = data6.prop_xyz;

                          if (data7 && typeof data7 == "object" && !Array.isArray(data7)) {
                            if (data7.prop_abc !== undefined) {
                              let data8 = data7.prop_abc;

                              if (!(data8 === "this string should NOT be included in the schema object" || data8 === 123 || func0(data8, _schema5))) {
                                const err6 = (instancePath + "/" + i0 + "/prop_c/prop_z/objectWithoutAditionalPropertiesB/prop_w/prop_xyz/prop_abc" + ' ' + "must be equal to one of the allowed values").trim();

                                if (vErrors === null) {
                                  vErrors = [err6];
                                } else {
                                  vErrors.push(err6);
                                }

                                errors++;
                              }
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          } else {
            const err7 = (instancePath + "/" + i0 + "/prop_c" + ' ' + "must be object").trim();

            if (vErrors === null) {
              vErrors = [err7];
            } else {
              vErrors.push(err7);
            }

            errors++;
          }
        }
      }
    }
  } else {
    const err8 = (instancePath + ' ' + "must be array").trim();

    if (vErrors === null) {
      vErrors = [err8];
    } else {
      vErrors.push(err8);
    }

    errors++;
  }

  validate0.errors = vErrors;
  return errors === 0;
}

const validate = (data, schemaName = "object-enum") => _validate(data, schemaName) ? [] : _validate.errors;

console.
/*OK*/
log(validate({}));
