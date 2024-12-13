const _schema = {
  recursive: 0,
  a: 0,
  b: 0,
  c: 0,
  d: 0,
  h: 0,
  e: 0,
  f: 0,
  g: 0,
  i: 0
};
import { isIso4217CurrencyCode } from '#core/json-schema';
"use strict";

const _validate = validate0;
const func0 = Object.prototype.hasOwnProperty;
const wrapper0 = {
  validate: validate1
};

function validate2(data, instancePath = "") {
  let vErrors = null;
  let errors = 0;

  if (!(typeof data == "number" && isFinite(data))) {
    const err0 = (instancePath + ' ' + "must be number").trim();

    if (vErrors === null) {
      vErrors = [err0];
    } else {
      vErrors.push(err0);
    }

    errors++;
  }

  validate2.errors = vErrors;
  return errors === 0;
}

function validate1(data, instancePath = "") {
  let vErrors = null;
  let errors = 0;

  if (Array.isArray(data)) {
    const len0 = data.length;

    for (let i0 = 0; i0 < len0; i0++) {
      let data0 = data[i0];

      if (data0 && typeof data0 == "object" && !Array.isArray(data0)) {
        if (data0.a === undefined) {
          const err0 = (instancePath + "/" + i0 + ' ' + ("must have required property '" + "a" + "'")).trim();

          if (vErrors === null) {
            vErrors = [err0];
          } else {
            vErrors.push(err0);
          }

          errors++;
        }

        if (data0.b === undefined) {
          const err1 = (instancePath + "/" + i0 + ' ' + ("must have required property '" + "b" + "'")).trim();

          if (vErrors === null) {
            vErrors = [err1];
          } else {
            vErrors.push(err1);
          }

          errors++;
        }

        if (data0.c === undefined) {
          const err2 = (instancePath + "/" + i0 + ' ' + ("must have required property '" + "c" + "'")).trim();

          if (vErrors === null) {
            vErrors = [err2];
          } else {
            vErrors.push(err2);
          }

          errors++;
        }

        if (data0.d === undefined) {
          const err3 = (instancePath + "/" + i0 + ' ' + ("must have required property '" + "d" + "'")).trim();

          if (vErrors === null) {
            vErrors = [err3];
          } else {
            vErrors.push(err3);
          }

          errors++;
        }

        if (data0.e === undefined) {
          const err4 = (instancePath + "/" + i0 + ' ' + ("must have required property '" + "e" + "'")).trim();

          if (vErrors === null) {
            vErrors = [err4];
          } else {
            vErrors.push(err4);
          }

          errors++;
        }

        if (data0.f === undefined) {
          const err5 = (instancePath + "/" + i0 + ' ' + ("must have required property '" + "f" + "'")).trim();

          if (vErrors === null) {
            vErrors = [err5];
          } else {
            vErrors.push(err5);
          }

          errors++;
        }

        if (data0.g === undefined) {
          const err6 = (instancePath + "/" + i0 + ' ' + ("must have required property '" + "g" + "'")).trim();

          if (vErrors === null) {
            vErrors = [err6];
          } else {
            vErrors.push(err6);
          }

          errors++;
        }

        if (data0.h === undefined) {
          const err7 = (instancePath + "/" + i0 + ' ' + ("must have required property '" + "h" + "'")).trim();

          if (vErrors === null) {
            vErrors = [err7];
          } else {
            vErrors.push(err7);
          }

          errors++;
        }

        if (data0.i === undefined) {
          const err8 = (instancePath + "/" + i0 + ' ' + ("must have required property '" + "i" + "'")).trim();

          if (vErrors === null) {
            vErrors = [err8];
          } else {
            vErrors.push(err8);
          }

          errors++;
        }

        for (const key0 in data0) {
          if (!func0.call(_schema, key0)) {
            const err9 = (instancePath + "/" + i0 + ' ' + "must NOT have additional properties").trim();

            if (vErrors === null) {
              vErrors = [err9];
            } else {
              vErrors.push(err9);
            }

            errors++;
          }
        }

        if (data0.recursive !== undefined) {
          if (!wrapper0.validate(data0.recursive, instancePath + "/" + i0 + "/recursive")) {
            vErrors = vErrors === null ? wrapper0.validate.errors : vErrors.concat(wrapper0.validate.errors);
            errors = vErrors.length;
          }
        }

        if (data0.a !== undefined) {
          let data2 = data0.a;
          const _errs6 = errors;
          let valid3 = false;
          let passing0 = null;
          const _errs7 = errors;

          if (typeof data2 !== "string") {
            const err10 = (instancePath + "/" + i0 + "/a" + ' ' + "must be string").trim();

            if (vErrors === null) {
              vErrors = [err10];
            } else {
              vErrors.push(err10);
            }

            errors++;
          }

          var _valid0 = _errs7 === errors;

          if (_valid0) {
            valid3 = true;
            passing0 = 0;
          }

          const _errs9 = errors;

          if (!(typeof data2 == "number" && isFinite(data2))) {
            const err11 = (instancePath + "/" + i0 + "/a" + ' ' + "must be number").trim();

            if (vErrors === null) {
              vErrors = [err11];
            } else {
              vErrors.push(err11);
            }

            errors++;
          }

          var _valid0 = _errs9 === errors;

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
            const err12 = (instancePath + "/" + i0 + "/a" + ' ' + "must match exactly one schema in oneOf").trim();

            if (vErrors === null) {
              vErrors = [err12];
            } else {
              vErrors.push(err12);
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

        if (data0.b !== undefined) {
          if (!validate2(data0.b, instancePath + "/" + i0 + "/b")) {
            vErrors = vErrors === null ? validate2.errors : vErrors.concat(validate2.errors);
            errors = vErrors.length;
          }
        }

        if (data0.c !== undefined) {
          if (typeof data0.c !== "string") {
            const err13 = (instancePath + "/" + i0 + "/c" + ' ' + "must be string").trim();

            if (vErrors === null) {
              vErrors = [err13];
            } else {
              vErrors.push(err13);
            }

            errors++;
          }
        }

        if (data0.d !== undefined) {
          if (typeof data0.d !== "string") {
            const err14 = (instancePath + "/" + i0 + "/d" + ' ' + "must be string").trim();

            if (vErrors === null) {
              vErrors = [err14];
            } else {
              vErrors.push(err14);
            }

            errors++;
          }
        }

        if (data0.h !== undefined) {
          if (typeof data0.h !== "string") {
            const err15 = (instancePath + "/" + i0 + "/h" + ' ' + "must be string").trim();

            if (vErrors === null) {
              vErrors = [err15];
            } else {
              vErrors.push(err15);
            }

            errors++;
          }
        }

        if (data0.e !== undefined) {
          let data7 = data0.e;

          if (typeof data7 == "number" && isFinite(data7)) {
            if (data7 < 0 || isNaN(data7)) {
              const err16 = (instancePath + "/" + i0 + "/e" + ' ' + "must be >= 0").trim();

              if (vErrors === null) {
                vErrors = [err16];
              } else {
                vErrors.push(err16);
              }

              errors++;
            }
          } else {
            const err17 = (instancePath + "/" + i0 + "/e" + ' ' + "must be number").trim();

            if (vErrors === null) {
              vErrors = [err17];
            } else {
              vErrors.push(err17);
            }

            errors++;
          }
        }

        if (data0.f !== undefined) {
          if (!isIso4217CurrencyCode(data0.f)) {
            const err18 = (instancePath + "/" + i0 + "/f" + ' ' + "must be a valid ISO 4217 currency code").trim();

            if (vErrors === null) {
              vErrors = [err18];
            } else {
              vErrors.push(err18);
            }

            errors++;
          }
        }

        if (data0.g !== undefined) {
          let data9 = data0.g;

          if (Array.isArray(data9)) {
            const len1 = data9.length;

            for (let i1 = 0; i1 < len1; i1++) {
              let data10 = data9[i1];

              if (data10 && typeof data10 == "object" && !Array.isArray(data10)) {
                if (data10.url === undefined) {
                  const err19 = (instancePath + "/" + i0 + "/g/" + i1 + ' ' + ("must have required property '" + "url" + "'")).trim();

                  if (vErrors === null) {
                    vErrors = [err19];
                  } else {
                    vErrors.push(err19);
                  }

                  errors++;
                }

                if (data10.altText === undefined) {
                  const err20 = (instancePath + "/" + i0 + "/g/" + i1 + ' ' + ("must have required property '" + "altText" + "'")).trim();

                  if (vErrors === null) {
                    vErrors = [err20];
                  } else {
                    vErrors.push(err20);
                  }

                  errors++;
                }

                for (const key1 in data10) {
                  if (!(key1 === "url" || key1 === "altText")) {
                    const err21 = (instancePath + "/" + i0 + "/g/" + i1 + ' ' + "must NOT have additional properties").trim();

                    if (vErrors === null) {
                      vErrors = [err21];
                    } else {
                      vErrors.push(err21);
                    }

                    errors++;
                  }
                }

                if (data10.url !== undefined) {
                  if (typeof data10.url !== "string") {
                    const err22 = (instancePath + "/" + i0 + "/g/" + i1 + "/url" + ' ' + "must be string").trim();

                    if (vErrors === null) {
                      vErrors = [err22];
                    } else {
                      vErrors.push(err22);
                    }

                    errors++;
                  }
                }

                if (data10.altText !== undefined) {
                  if (typeof data10.altText !== "string") {
                    const err23 = (instancePath + "/" + i0 + "/g/" + i1 + "/altText" + ' ' + "must be string").trim();

                    if (vErrors === null) {
                      vErrors = [err23];
                    } else {
                      vErrors.push(err23);
                    }

                    errors++;
                  }
                }
              } else {
                const err24 = (instancePath + "/" + i0 + "/g/" + i1 + ' ' + "must be object").trim();

                if (vErrors === null) {
                  vErrors = [err24];
                } else {
                  vErrors.push(err24);
                }

                errors++;
              }
            }
          } else {
            const err25 = (instancePath + "/" + i0 + "/g" + ' ' + "must be array").trim();

            if (vErrors === null) {
              vErrors = [err25];
            } else {
              vErrors.push(err25);
            }

            errors++;
          }
        }

        if (data0.i !== undefined) {
          let data13 = data0.i;

          if (data13 && typeof data13 == "object" && !Array.isArray(data13)) {
            if (data13.ratingValue === undefined) {
              const err26 = (instancePath + "/" + i0 + "/i" + ' ' + ("must have required property '" + "ratingValue" + "'")).trim();

              if (vErrors === null) {
                vErrors = [err26];
              } else {
                vErrors.push(err26);
              }

              errors++;
            }

            if (data13.ratingCount === undefined) {
              const err27 = (instancePath + "/" + i0 + "/i" + ' ' + ("must have required property '" + "ratingCount" + "'")).trim();

              if (vErrors === null) {
                vErrors = [err27];
              } else {
                vErrors.push(err27);
              }

              errors++;
            }

            if (data13.ratingUrl === undefined) {
              const err28 = (instancePath + "/" + i0 + "/i" + ' ' + ("must have required property '" + "ratingUrl" + "'")).trim();

              if (vErrors === null) {
                vErrors = [err28];
              } else {
                vErrors.push(err28);
              }

              errors++;
            }

            for (const key2 in data13) {
              if (!(key2 === "ratingValue" || key2 === "ratingCount" || key2 === "ratingUrl")) {
                const err29 = (instancePath + "/" + i0 + "/i" + ' ' + "must NOT have additional properties").trim();

                if (vErrors === null) {
                  vErrors = [err29];
                } else {
                  vErrors.push(err29);
                }

                errors++;
              }
            }

            if (data13.ratingValue !== undefined) {
              let data14 = data13.ratingValue;

              if (typeof data14 == "number" && isFinite(data14)) {
                if (data14 < 0 || isNaN(data14)) {
                  const err30 = (instancePath + "/" + i0 + "/i/ratingValue" + ' ' + "must be >= 0").trim();

                  if (vErrors === null) {
                    vErrors = [err30];
                  } else {
                    vErrors.push(err30);
                  }

                  errors++;
                }
              } else {
                const err31 = (instancePath + "/" + i0 + "/i/ratingValue" + ' ' + "must be number").trim();

                if (vErrors === null) {
                  vErrors = [err31];
                } else {
                  vErrors.push(err31);
                }

                errors++;
              }
            }

            if (data13.ratingCount !== undefined) {
              let data15 = data13.ratingCount;

              if (typeof data15 == "number" && isFinite(data15)) {
                if (data15 < 0 || isNaN(data15)) {
                  const err32 = (instancePath + "/" + i0 + "/i/ratingCount" + ' ' + "must be >= 0").trim();

                  if (vErrors === null) {
                    vErrors = [err32];
                  } else {
                    vErrors.push(err32);
                  }

                  errors++;
                }
              } else {
                const err33 = (instancePath + "/" + i0 + "/i/ratingCount" + ' ' + "must be number").trim();

                if (vErrors === null) {
                  vErrors = [err33];
                } else {
                  vErrors.push(err33);
                }

                errors++;
              }
            }

            if (data13.ratingUrl !== undefined) {
              if (typeof data13.ratingUrl !== "string") {
                const err34 = (instancePath + "/" + i0 + "/i/ratingUrl" + ' ' + "must be string").trim();

                if (vErrors === null) {
                  vErrors = [err34];
                } else {
                  vErrors.push(err34);
                }

                errors++;
              }
            }
          } else {
            const err35 = (instancePath + "/" + i0 + "/i" + ' ' + "must be object").trim();

            if (vErrors === null) {
              vErrors = [err35];
            } else {
              vErrors.push(err35);
            }

            errors++;
          }
        }
      } else {
        const err36 = (instancePath + "/" + i0 + ' ' + "must be object").trim();

        if (vErrors === null) {
          vErrors = [err36];
        } else {
          vErrors.push(err36);
        }

        errors++;
      }
    }
  } else {
    const err37 = (instancePath + ' ' + "must be array").trim();

    if (vErrors === null) {
      vErrors = [err37];
    } else {
      vErrors.push(err37);
    }

    errors++;
  }

  validate1.errors = vErrors;
  return errors === 0;
}

function validate0(data, instancePath = "") {
  /*# sourceURL="my-id" */
  ;
  let vErrors = null;
  let errors = 0;

  if (data && typeof data == "object" && !Array.isArray(data)) {
    if (data.items === undefined) {
      const err0 = (instancePath + ' ' + ("must have required property '" + "items" + "'")).trim();

      if (vErrors === null) {
        vErrors = [err0];
      } else {
        vErrors.push(err0);
      }

      errors++;
    }

    for (const key0 in data) {
      if (!(key0 === "recursive" || key0 === "items")) {
        const err1 = (instancePath + ' ' + "must NOT have additional properties").trim();

        if (vErrors === null) {
          vErrors = [err1];
        } else {
          vErrors.push(err1);
        }

        errors++;
      }
    }

    if (data.recursive !== undefined) {
      if (!validate0(data.recursive, instancePath + "/recursive")) {
        vErrors = vErrors === null ? validate0.errors : vErrors.concat(validate0.errors);
        errors = vErrors.length;
      }
    }

    if (data.items !== undefined) {
      let data1 = data.items;

      if (Array.isArray(data1)) {
        const len0 = data1.length;

        for (let i0 = 0; i0 < len0; i0++) {
          let data2 = data1[i0];

          if (data2 && typeof data2 == "object" && !Array.isArray(data2)) {
            if (data2.a === undefined) {
              const err2 = (instancePath + "/items/" + i0 + ' ' + ("must have required property '" + "a" + "'")).trim();

              if (vErrors === null) {
                vErrors = [err2];
              } else {
                vErrors.push(err2);
              }

              errors++;
            }

            if (data2.b === undefined) {
              const err3 = (instancePath + "/items/" + i0 + ' ' + ("must have required property '" + "b" + "'")).trim();

              if (vErrors === null) {
                vErrors = [err3];
              } else {
                vErrors.push(err3);
              }

              errors++;
            }

            if (data2.c === undefined) {
              const err4 = (instancePath + "/items/" + i0 + ' ' + ("must have required property '" + "c" + "'")).trim();

              if (vErrors === null) {
                vErrors = [err4];
              } else {
                vErrors.push(err4);
              }

              errors++;
            }

            if (data2.d === undefined) {
              const err5 = (instancePath + "/items/" + i0 + ' ' + ("must have required property '" + "d" + "'")).trim();

              if (vErrors === null) {
                vErrors = [err5];
              } else {
                vErrors.push(err5);
              }

              errors++;
            }

            if (data2.e === undefined) {
              const err6 = (instancePath + "/items/" + i0 + ' ' + ("must have required property '" + "e" + "'")).trim();

              if (vErrors === null) {
                vErrors = [err6];
              } else {
                vErrors.push(err6);
              }

              errors++;
            }

            if (data2.f === undefined) {
              const err7 = (instancePath + "/items/" + i0 + ' ' + ("must have required property '" + "f" + "'")).trim();

              if (vErrors === null) {
                vErrors = [err7];
              } else {
                vErrors.push(err7);
              }

              errors++;
            }

            if (data2.g === undefined) {
              const err8 = (instancePath + "/items/" + i0 + ' ' + ("must have required property '" + "g" + "'")).trim();

              if (vErrors === null) {
                vErrors = [err8];
              } else {
                vErrors.push(err8);
              }

              errors++;
            }

            if (data2.h === undefined) {
              const err9 = (instancePath + "/items/" + i0 + ' ' + ("must have required property '" + "h" + "'")).trim();

              if (vErrors === null) {
                vErrors = [err9];
              } else {
                vErrors.push(err9);
              }

              errors++;
            }

            if (data2.i === undefined) {
              const err10 = (instancePath + "/items/" + i0 + ' ' + ("must have required property '" + "i" + "'")).trim();

              if (vErrors === null) {
                vErrors = [err10];
              } else {
                vErrors.push(err10);
              }

              errors++;
            }

            for (const key1 in data2) {
              if (!func0.call(_schema, key1)) {
                const err11 = (instancePath + "/items/" + i0 + ' ' + "must NOT have additional properties").trim();

                if (vErrors === null) {
                  vErrors = [err11];
                } else {
                  vErrors.push(err11);
                }

                errors++;
              }
            }

            if (data2.recursive !== undefined) {
              if (!validate1(data2.recursive, instancePath + "/items/" + i0 + "/recursive")) {
                vErrors = vErrors === null ? validate1.errors : vErrors.concat(validate1.errors);
                errors = vErrors.length;
              }
            }

            if (data2.a !== undefined) {
              let data4 = data2.a;
              const _errs10 = errors;
              let valid4 = false;
              let passing0 = null;
              const _errs11 = errors;

              if (typeof data4 !== "string") {
                const err12 = (instancePath + "/items/" + i0 + "/a" + ' ' + "must be string").trim();

                if (vErrors === null) {
                  vErrors = [err12];
                } else {
                  vErrors.push(err12);
                }

                errors++;
              }

              var _valid0 = _errs11 === errors;

              if (_valid0) {
                valid4 = true;
                passing0 = 0;
              }

              const _errs13 = errors;

              if (!(typeof data4 == "number" && isFinite(data4))) {
                const err13 = (instancePath + "/items/" + i0 + "/a" + ' ' + "must be number").trim();

                if (vErrors === null) {
                  vErrors = [err13];
                } else {
                  vErrors.push(err13);
                }

                errors++;
              }

              var _valid0 = _errs13 === errors;

              if (_valid0 && valid4) {
                valid4 = false;
                passing0 = [passing0, 1];
              } else {
                if (_valid0) {
                  valid4 = true;
                  passing0 = 1;
                }
              }

              if (!valid4) {
                const err14 = (instancePath + "/items/" + i0 + "/a" + ' ' + "must match exactly one schema in oneOf").trim();

                if (vErrors === null) {
                  vErrors = [err14];
                } else {
                  vErrors.push(err14);
                }

                errors++;
              } else {
                errors = _errs10;

                if (vErrors !== null) {
                  if (_errs10) {
                    vErrors.length = _errs10;
                  } else {
                    vErrors = null;
                  }
                }
              }
            }

            if (data2.b !== undefined) {
              if (!validate2(data2.b, instancePath + "/items/" + i0 + "/b")) {
                vErrors = vErrors === null ? validate2.errors : vErrors.concat(validate2.errors);
                errors = vErrors.length;
              }
            }

            if (data2.c !== undefined) {
              if (typeof data2.c !== "string") {
                const err15 = (instancePath + "/items/" + i0 + "/c" + ' ' + "must be string").trim();

                if (vErrors === null) {
                  vErrors = [err15];
                } else {
                  vErrors.push(err15);
                }

                errors++;
              }
            }

            if (data2.d !== undefined) {
              if (typeof data2.d !== "string") {
                const err16 = (instancePath + "/items/" + i0 + "/d" + ' ' + "must be string").trim();

                if (vErrors === null) {
                  vErrors = [err16];
                } else {
                  vErrors.push(err16);
                }

                errors++;
              }
            }

            if (data2.h !== undefined) {
              if (typeof data2.h !== "string") {
                const err17 = (instancePath + "/items/" + i0 + "/h" + ' ' + "must be string").trim();

                if (vErrors === null) {
                  vErrors = [err17];
                } else {
                  vErrors.push(err17);
                }

                errors++;
              }
            }

            if (data2.e !== undefined) {
              let data9 = data2.e;

              if (typeof data9 == "number" && isFinite(data9)) {
                if (data9 < 0 || isNaN(data9)) {
                  const err18 = (instancePath + "/items/" + i0 + "/e" + ' ' + "must be >= 0").trim();

                  if (vErrors === null) {
                    vErrors = [err18];
                  } else {
                    vErrors.push(err18);
                  }

                  errors++;
                }
              } else {
                const err19 = (instancePath + "/items/" + i0 + "/e" + ' ' + "must be number").trim();

                if (vErrors === null) {
                  vErrors = [err19];
                } else {
                  vErrors.push(err19);
                }

                errors++;
              }
            }

            if (data2.f !== undefined) {
              if (!isIso4217CurrencyCode(data2.f)) {
                const err20 = (instancePath + "/items/" + i0 + "/f" + ' ' + "must be a valid ISO 4217 currency code").trim();

                if (vErrors === null) {
                  vErrors = [err20];
                } else {
                  vErrors.push(err20);
                }

                errors++;
              }
            }

            if (data2.g !== undefined) {
              let data11 = data2.g;

              if (Array.isArray(data11)) {
                const len1 = data11.length;

                for (let i1 = 0; i1 < len1; i1++) {
                  let data12 = data11[i1];

                  if (data12 && typeof data12 == "object" && !Array.isArray(data12)) {
                    if (data12.url === undefined) {
                      const err21 = (instancePath + "/items/" + i0 + "/g/" + i1 + ' ' + ("must have required property '" + "url" + "'")).trim();

                      if (vErrors === null) {
                        vErrors = [err21];
                      } else {
                        vErrors.push(err21);
                      }

                      errors++;
                    }

                    if (data12.altText === undefined) {
                      const err22 = (instancePath + "/items/" + i0 + "/g/" + i1 + ' ' + ("must have required property '" + "altText" + "'")).trim();

                      if (vErrors === null) {
                        vErrors = [err22];
                      } else {
                        vErrors.push(err22);
                      }

                      errors++;
                    }

                    for (const key2 in data12) {
                      if (!(key2 === "url" || key2 === "altText")) {
                        const err23 = (instancePath + "/items/" + i0 + "/g/" + i1 + ' ' + "must NOT have additional properties").trim();

                        if (vErrors === null) {
                          vErrors = [err23];
                        } else {
                          vErrors.push(err23);
                        }

                        errors++;
                      }
                    }

                    if (data12.url !== undefined) {
                      if (typeof data12.url !== "string") {
                        const err24 = (instancePath + "/items/" + i0 + "/g/" + i1 + "/url" + ' ' + "must be string").trim();

                        if (vErrors === null) {
                          vErrors = [err24];
                        } else {
                          vErrors.push(err24);
                        }

                        errors++;
                      }
                    }

                    if (data12.altText !== undefined) {
                      if (typeof data12.altText !== "string") {
                        const err25 = (instancePath + "/items/" + i0 + "/g/" + i1 + "/altText" + ' ' + "must be string").trim();

                        if (vErrors === null) {
                          vErrors = [err25];
                        } else {
                          vErrors.push(err25);
                        }

                        errors++;
                      }
                    }
                  } else {
                    const err26 = (instancePath + "/items/" + i0 + "/g/" + i1 + ' ' + "must be object").trim();

                    if (vErrors === null) {
                      vErrors = [err26];
                    } else {
                      vErrors.push(err26);
                    }

                    errors++;
                  }
                }
              } else {
                const err27 = (instancePath + "/items/" + i0 + "/g" + ' ' + "must be array").trim();

                if (vErrors === null) {
                  vErrors = [err27];
                } else {
                  vErrors.push(err27);
                }

                errors++;
              }
            }

            if (data2.i !== undefined) {
              let data15 = data2.i;

              if (data15 && typeof data15 == "object" && !Array.isArray(data15)) {
                if (data15.ratingValue === undefined) {
                  const err28 = (instancePath + "/items/" + i0 + "/i" + ' ' + ("must have required property '" + "ratingValue" + "'")).trim();

                  if (vErrors === null) {
                    vErrors = [err28];
                  } else {
                    vErrors.push(err28);
                  }

                  errors++;
                }

                if (data15.ratingCount === undefined) {
                  const err29 = (instancePath + "/items/" + i0 + "/i" + ' ' + ("must have required property '" + "ratingCount" + "'")).trim();

                  if (vErrors === null) {
                    vErrors = [err29];
                  } else {
                    vErrors.push(err29);
                  }

                  errors++;
                }

                if (data15.ratingUrl === undefined) {
                  const err30 = (instancePath + "/items/" + i0 + "/i" + ' ' + ("must have required property '" + "ratingUrl" + "'")).trim();

                  if (vErrors === null) {
                    vErrors = [err30];
                  } else {
                    vErrors.push(err30);
                  }

                  errors++;
                }

                for (const key3 in data15) {
                  if (!(key3 === "ratingValue" || key3 === "ratingCount" || key3 === "ratingUrl")) {
                    const err31 = (instancePath + "/items/" + i0 + "/i" + ' ' + "must NOT have additional properties").trim();

                    if (vErrors === null) {
                      vErrors = [err31];
                    } else {
                      vErrors.push(err31);
                    }

                    errors++;
                  }
                }

                if (data15.ratingValue !== undefined) {
                  let data16 = data15.ratingValue;

                  if (typeof data16 == "number" && isFinite(data16)) {
                    if (data16 < 0 || isNaN(data16)) {
                      const err32 = (instancePath + "/items/" + i0 + "/i/ratingValue" + ' ' + "must be >= 0").trim();

                      if (vErrors === null) {
                        vErrors = [err32];
                      } else {
                        vErrors.push(err32);
                      }

                      errors++;
                    }
                  } else {
                    const err33 = (instancePath + "/items/" + i0 + "/i/ratingValue" + ' ' + "must be number").trim();

                    if (vErrors === null) {
                      vErrors = [err33];
                    } else {
                      vErrors.push(err33);
                    }

                    errors++;
                  }
                }

                if (data15.ratingCount !== undefined) {
                  let data17 = data15.ratingCount;

                  if (typeof data17 == "number" && isFinite(data17)) {
                    if (data17 < 0 || isNaN(data17)) {
                      const err34 = (instancePath + "/items/" + i0 + "/i/ratingCount" + ' ' + "must be >= 0").trim();

                      if (vErrors === null) {
                        vErrors = [err34];
                      } else {
                        vErrors.push(err34);
                      }

                      errors++;
                    }
                  } else {
                    const err35 = (instancePath + "/items/" + i0 + "/i/ratingCount" + ' ' + "must be number").trim();

                    if (vErrors === null) {
                      vErrors = [err35];
                    } else {
                      vErrors.push(err35);
                    }

                    errors++;
                  }
                }

                if (data15.ratingUrl !== undefined) {
                  if (typeof data15.ratingUrl !== "string") {
                    const err36 = (instancePath + "/items/" + i0 + "/i/ratingUrl" + ' ' + "must be string").trim();

                    if (vErrors === null) {
                      vErrors = [err36];
                    } else {
                      vErrors.push(err36);
                    }

                    errors++;
                  }
                }
              } else {
                const err37 = (instancePath + "/items/" + i0 + "/i" + ' ' + "must be object").trim();

                if (vErrors === null) {
                  vErrors = [err37];
                } else {
                  vErrors.push(err37);
                }

                errors++;
              }
            }
          } else {
            const err38 = (instancePath + "/items/" + i0 + ' ' + "must be object").trim();

            if (vErrors === null) {
              vErrors = [err38];
            } else {
              vErrors.push(err38);
            }

            errors++;
          }
        }
      } else {
        const err39 = (instancePath + "/items" + ' ' + "must be array").trim();

        if (vErrors === null) {
          vErrors = [err39];
        } else {
          vErrors.push(err39);
        }

        errors++;
      }
    }
  } else {
    const err40 = (instancePath + ' ' + "must be object").trim();

    if (vErrors === null) {
      vErrors = [err40];
    } else {
      vErrors.push(err40);
    }

    errors++;
  }

  validate0.errors = vErrors;
  return errors === 0;
}

const validate = (data, schemaName = "complex") => _validate(data, schemaName) ? [] : _validate.errors;

console.
/*OK*/
log(validate({}));
