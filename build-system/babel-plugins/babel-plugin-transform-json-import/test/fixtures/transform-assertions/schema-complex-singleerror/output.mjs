import { isIso4217CurrencyCode } from '#core/json-schema';
"use strict";

const _validate = validate0;
const schema0 = {
  "properties": {
    "items": {
      "items": {
        "properties": {
          "recursive": 1,
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
  }
};
const func0 = Object.prototype.hasOwnProperty;
const schema1 = {
  "items": {
    "properties": {
      "recursive": 1,
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
};
const wrapper0 = {
  validate: validate1
};

function validate2(data) {
  let vErrors = null;
  let errors = 0;

  if (!(typeof data == "number" && isFinite(data))) {
    return false;
  }

  return errors === 0;
}

function validate1(data) {
  let vErrors = null;
  let errors = 0;

  if (errors === 0) {
    if (Array.isArray(data)) {
      var valid0 = true;
      const len0 = data.length;

      for (let i0 = 0; i0 < len0; i0++) {
        let data0 = data[i0];
        const _errs1 = errors;

        if (errors === _errs1) {
          if (data0 && typeof data0 == "object" && !Array.isArray(data0)) {
            let missing0;

            if (data0.a === undefined && true || data0.b === undefined && true || data0.c === undefined && true || data0.d === undefined && true || data0.e === undefined && true || data0.f === undefined && true || data0.g === undefined && true || data0.h === undefined && true || data0.i === undefined && true) {
              return false;
            } else {
              const _errs3 = errors;

              for (const key0 in data0) {
                if (!func0.call(schema1.items.properties, key0)) {
                  return false;
                  break;
                }
              }

              if (_errs3 === errors) {
                if (data0.recursive !== undefined) {
                  const _errs4 = errors;

                  if (!wrapper0.validate(data0.recursive)) {
                    vErrors = vErrors === null ? wrapper0.validate.errors : vErrors.concat(wrapper0.validate.errors);
                    errors = vErrors.length;
                  }

                  var valid1 = _errs4 === errors;
                } else {
                  var valid1 = true;
                }

                if (valid1) {
                  if (data0.a !== undefined) {
                    let data2 = data0.a;
                    const _errs5 = errors;
                    const _errs6 = errors;
                    let valid2 = false;
                    let passing0 = null;
                    const _errs7 = errors;

                    if (typeof data2 !== "string") {
                      const err0 = undefined;

                      if (vErrors === null) {
                        vErrors = [err0];
                      } else {
                        vErrors.push(err0);
                      }

                      errors++;
                    }

                    var _valid0 = _errs7 === errors;

                    if (_valid0) {
                      valid2 = true;
                      passing0 = 0;
                    }

                    const _errs9 = errors;

                    if (!(typeof data2 == "number" && isFinite(data2))) {
                      const err1 = undefined;

                      if (vErrors === null) {
                        vErrors = [err1];
                      } else {
                        vErrors.push(err1);
                      }

                      errors++;
                    }

                    var _valid0 = _errs9 === errors;

                    if (_valid0 && valid2) {
                      valid2 = false;
                      passing0 = [passing0, 1];
                    } else {
                      if (_valid0) {
                        valid2 = true;
                        passing0 = 1;
                      }
                    }

                    if (!valid2) {
                      const err2 = undefined;

                      if (vErrors === null) {
                        vErrors = [err2];
                      } else {
                        vErrors.push(err2);
                      }

                      errors++;
                      return false;
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

                    var valid1 = _errs5 === errors;
                  } else {
                    var valid1 = true;
                  }

                  if (valid1) {
                    if (data0.b !== undefined) {
                      const _errs11 = errors;

                      if (!validate2(data0.b)) {
                        vErrors = vErrors === null ? validate2.errors : vErrors.concat(validate2.errors);
                        errors = vErrors.length;
                      }

                      var valid1 = _errs11 === errors;
                    } else {
                      var valid1 = true;
                    }

                    if (valid1) {
                      if (data0.c !== undefined) {
                        const _errs12 = errors;

                        if (typeof data0.c !== "string") {
                          return false;
                        }

                        var valid1 = _errs12 === errors;
                      } else {
                        var valid1 = true;
                      }

                      if (valid1) {
                        if (data0.d !== undefined) {
                          const _errs14 = errors;

                          if (typeof data0.d !== "string") {
                            return false;
                          }

                          var valid1 = _errs14 === errors;
                        } else {
                          var valid1 = true;
                        }

                        if (valid1) {
                          if (data0.h !== undefined) {
                            const _errs16 = errors;

                            if (typeof data0.h !== "string") {
                              return false;
                            }

                            var valid1 = _errs16 === errors;
                          } else {
                            var valid1 = true;
                          }

                          if (valid1) {
                            if (data0.e !== undefined) {
                              let data7 = data0.e;
                              const _errs18 = errors;

                              if (errors === _errs18) {
                                if (typeof data7 == "number" && isFinite(data7)) {
                                  if (data7 < 0 || isNaN(data7)) {
                                    return false;
                                  }
                                } else {
                                  return false;
                                }
                              }

                              var valid1 = _errs18 === errors;
                            } else {
                              var valid1 = true;
                            }

                            if (valid1) {
                              if (data0.f !== undefined) {
                                const _errs20 = errors;

                                if (!isIso4217CurrencyCode(data0.f)) {
                                  return false;
                                }

                                var valid1 = _errs20 === errors;
                              } else {
                                var valid1 = true;
                              }

                              if (valid1) {
                                if (data0.g !== undefined) {
                                  let data9 = data0.g;
                                  const _errs21 = errors;

                                  if (errors === _errs21) {
                                    if (Array.isArray(data9)) {
                                      var valid3 = true;
                                      const len1 = data9.length;

                                      for (let i1 = 0; i1 < len1; i1++) {
                                        let data10 = data9[i1];
                                        const _errs23 = errors;

                                        if (errors === _errs23) {
                                          if (data10 && typeof data10 == "object" && !Array.isArray(data10)) {
                                            let missing1;

                                            if (data10.url === undefined && true || data10.altText === undefined && true) {
                                              return false;
                                            } else {
                                              const _errs25 = errors;

                                              for (const key1 in data10) {
                                                if (!(key1 === "url" || key1 === "altText")) {
                                                  return false;
                                                  break;
                                                }
                                              }

                                              if (_errs25 === errors) {
                                                if (data10.url !== undefined) {
                                                  const _errs26 = errors;

                                                  if (typeof data10.url !== "string") {
                                                    return false;
                                                  }

                                                  var valid4 = _errs26 === errors;
                                                } else {
                                                  var valid4 = true;
                                                }

                                                if (valid4) {
                                                  if (data10.altText !== undefined) {
                                                    const _errs28 = errors;

                                                    if (typeof data10.altText !== "string") {
                                                      return false;
                                                    }

                                                    var valid4 = _errs28 === errors;
                                                  } else {
                                                    var valid4 = true;
                                                  }
                                                }
                                              }
                                            }
                                          } else {
                                            return false;
                                          }
                                        }

                                        var valid3 = _errs23 === errors;

                                        if (!valid3) {
                                          break;
                                        }
                                      }
                                    } else {
                                      return false;
                                    }
                                  }

                                  var valid1 = _errs21 === errors;
                                } else {
                                  var valid1 = true;
                                }

                                if (valid1) {
                                  if (data0.i !== undefined) {
                                    let data13 = data0.i;
                                    const _errs30 = errors;

                                    if (errors === _errs30) {
                                      if (data13 && typeof data13 == "object" && !Array.isArray(data13)) {
                                        let missing2;

                                        if (data13.ratingValue === undefined && true || data13.ratingCount === undefined && true || data13.ratingUrl === undefined && true) {
                                          return false;
                                        } else {
                                          const _errs32 = errors;

                                          for (const key2 in data13) {
                                            if (!(key2 === "ratingValue" || key2 === "ratingCount" || key2 === "ratingUrl")) {
                                              return false;
                                              break;
                                            }
                                          }

                                          if (_errs32 === errors) {
                                            if (data13.ratingValue !== undefined) {
                                              let data14 = data13.ratingValue;
                                              const _errs33 = errors;

                                              if (errors === _errs33) {
                                                if (typeof data14 == "number" && isFinite(data14)) {
                                                  if (data14 < 0 || isNaN(data14)) {
                                                    return false;
                                                  }
                                                } else {
                                                  return false;
                                                }
                                              }

                                              var valid5 = _errs33 === errors;
                                            } else {
                                              var valid5 = true;
                                            }

                                            if (valid5) {
                                              if (data13.ratingCount !== undefined) {
                                                let data15 = data13.ratingCount;
                                                const _errs35 = errors;

                                                if (errors === _errs35) {
                                                  if (typeof data15 == "number" && isFinite(data15)) {
                                                    if (data15 < 0 || isNaN(data15)) {
                                                      return false;
                                                    }
                                                  } else {
                                                    return false;
                                                  }
                                                }

                                                var valid5 = _errs35 === errors;
                                              } else {
                                                var valid5 = true;
                                              }

                                              if (valid5) {
                                                if (data13.ratingUrl !== undefined) {
                                                  const _errs37 = errors;

                                                  if (typeof data13.ratingUrl !== "string") {
                                                    return false;
                                                  }

                                                  var valid5 = _errs37 === errors;
                                                } else {
                                                  var valid5 = true;
                                                }
                                              }
                                            }
                                          }
                                        }
                                      } else {
                                        return false;
                                      }
                                    }

                                    var valid1 = _errs30 === errors;
                                  } else {
                                    var valid1 = true;
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
              }
            }
          } else {
            return false;
          }
        }

        var valid0 = _errs1 === errors;

        if (!valid0) {
          break;
        }
      }
    } else {
      return false;
    }
  }

  return errors === 0;
}

function validate0(data) {
  /*# sourceURL="my-id" */
  ;
  let vErrors = null;
  let errors = 0;

  if (errors === 0) {
    if (data && typeof data == "object" && !Array.isArray(data)) {
      let missing0;

      if (data.items === undefined && true) {
        return false;
      } else {
        const _errs1 = errors;

        for (const key0 in data) {
          if (!(key0 === "recursive" || key0 === "items")) {
            return false;
            break;
          }
        }

        if (_errs1 === errors) {
          if (data.recursive !== undefined) {
            const _errs2 = errors;

            if (!validate0(data.recursive)) {
              vErrors = vErrors === null ? validate0.errors : vErrors.concat(validate0.errors);
              errors = vErrors.length;
            }

            var valid0 = _errs2 === errors;
          } else {
            var valid0 = true;
          }

          if (valid0) {
            if (data.items !== undefined) {
              let data1 = data.items;
              const _errs3 = errors;

              if (errors === _errs3) {
                if (Array.isArray(data1)) {
                  var valid1 = true;
                  const len0 = data1.length;

                  for (let i0 = 0; i0 < len0; i0++) {
                    let data2 = data1[i0];
                    const _errs5 = errors;

                    if (errors === _errs5) {
                      if (data2 && typeof data2 == "object" && !Array.isArray(data2)) {
                        let missing1;

                        if (data2.a === undefined && true || data2.b === undefined && true || data2.c === undefined && true || data2.d === undefined && true || data2.e === undefined && true || data2.f === undefined && true || data2.g === undefined && true || data2.h === undefined && true || data2.i === undefined && true) {
                          return false;
                        } else {
                          const _errs7 = errors;

                          for (const key1 in data2) {
                            if (!func0.call(schema0.properties.items.items.properties, key1)) {
                              return false;
                              break;
                            }
                          }

                          if (_errs7 === errors) {
                            if (data2.recursive !== undefined) {
                              const _errs8 = errors;

                              if (!validate1(data2.recursive)) {
                                vErrors = vErrors === null ? validate1.errors : vErrors.concat(validate1.errors);
                                errors = vErrors.length;
                              }

                              var valid2 = _errs8 === errors;
                            } else {
                              var valid2 = true;
                            }

                            if (valid2) {
                              if (data2.a !== undefined) {
                                let data4 = data2.a;
                                const _errs9 = errors;
                                const _errs10 = errors;
                                let valid3 = false;
                                let passing0 = null;
                                const _errs11 = errors;

                                if (typeof data4 !== "string") {
                                  const err0 = undefined;

                                  if (vErrors === null) {
                                    vErrors = [err0];
                                  } else {
                                    vErrors.push(err0);
                                  }

                                  errors++;
                                }

                                var _valid0 = _errs11 === errors;

                                if (_valid0) {
                                  valid3 = true;
                                  passing0 = 0;
                                }

                                const _errs13 = errors;

                                if (!(typeof data4 == "number" && isFinite(data4))) {
                                  const err1 = undefined;

                                  if (vErrors === null) {
                                    vErrors = [err1];
                                  } else {
                                    vErrors.push(err1);
                                  }

                                  errors++;
                                }

                                var _valid0 = _errs13 === errors;

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
                                  const err2 = undefined;

                                  if (vErrors === null) {
                                    vErrors = [err2];
                                  } else {
                                    vErrors.push(err2);
                                  }

                                  errors++;
                                  return false;
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

                                var valid2 = _errs9 === errors;
                              } else {
                                var valid2 = true;
                              }

                              if (valid2) {
                                if (data2.b !== undefined) {
                                  const _errs15 = errors;

                                  if (!validate2(data2.b)) {
                                    vErrors = vErrors === null ? validate2.errors : vErrors.concat(validate2.errors);
                                    errors = vErrors.length;
                                  }

                                  var valid2 = _errs15 === errors;
                                } else {
                                  var valid2 = true;
                                }

                                if (valid2) {
                                  if (data2.c !== undefined) {
                                    const _errs16 = errors;

                                    if (typeof data2.c !== "string") {
                                      return false;
                                    }

                                    var valid2 = _errs16 === errors;
                                  } else {
                                    var valid2 = true;
                                  }

                                  if (valid2) {
                                    if (data2.d !== undefined) {
                                      const _errs18 = errors;

                                      if (typeof data2.d !== "string") {
                                        return false;
                                      }

                                      var valid2 = _errs18 === errors;
                                    } else {
                                      var valid2 = true;
                                    }

                                    if (valid2) {
                                      if (data2.h !== undefined) {
                                        const _errs20 = errors;

                                        if (typeof data2.h !== "string") {
                                          return false;
                                        }

                                        var valid2 = _errs20 === errors;
                                      } else {
                                        var valid2 = true;
                                      }

                                      if (valid2) {
                                        if (data2.e !== undefined) {
                                          let data9 = data2.e;
                                          const _errs22 = errors;

                                          if (errors === _errs22) {
                                            if (typeof data9 == "number" && isFinite(data9)) {
                                              if (data9 < 0 || isNaN(data9)) {
                                                return false;
                                              }
                                            } else {
                                              return false;
                                            }
                                          }

                                          var valid2 = _errs22 === errors;
                                        } else {
                                          var valid2 = true;
                                        }

                                        if (valid2) {
                                          if (data2.f !== undefined) {
                                            const _errs24 = errors;

                                            if (!isIso4217CurrencyCode(data2.f)) {
                                              return false;
                                            }

                                            var valid2 = _errs24 === errors;
                                          } else {
                                            var valid2 = true;
                                          }

                                          if (valid2) {
                                            if (data2.g !== undefined) {
                                              let data11 = data2.g;
                                              const _errs25 = errors;

                                              if (errors === _errs25) {
                                                if (Array.isArray(data11)) {
                                                  var valid4 = true;
                                                  const len1 = data11.length;

                                                  for (let i1 = 0; i1 < len1; i1++) {
                                                    let data12 = data11[i1];
                                                    const _errs27 = errors;

                                                    if (errors === _errs27) {
                                                      if (data12 && typeof data12 == "object" && !Array.isArray(data12)) {
                                                        let missing2;

                                                        if (data12.url === undefined && true || data12.altText === undefined && true) {
                                                          return false;
                                                        } else {
                                                          const _errs29 = errors;

                                                          for (const key2 in data12) {
                                                            if (!(key2 === "url" || key2 === "altText")) {
                                                              return false;
                                                              break;
                                                            }
                                                          }

                                                          if (_errs29 === errors) {
                                                            if (data12.url !== undefined) {
                                                              const _errs30 = errors;

                                                              if (typeof data12.url !== "string") {
                                                                return false;
                                                              }

                                                              var valid5 = _errs30 === errors;
                                                            } else {
                                                              var valid5 = true;
                                                            }

                                                            if (valid5) {
                                                              if (data12.altText !== undefined) {
                                                                const _errs32 = errors;

                                                                if (typeof data12.altText !== "string") {
                                                                  return false;
                                                                }

                                                                var valid5 = _errs32 === errors;
                                                              } else {
                                                                var valid5 = true;
                                                              }
                                                            }
                                                          }
                                                        }
                                                      } else {
                                                        return false;
                                                      }
                                                    }

                                                    var valid4 = _errs27 === errors;

                                                    if (!valid4) {
                                                      break;
                                                    }
                                                  }
                                                } else {
                                                  return false;
                                                }
                                              }

                                              var valid2 = _errs25 === errors;
                                            } else {
                                              var valid2 = true;
                                            }

                                            if (valid2) {
                                              if (data2.i !== undefined) {
                                                let data15 = data2.i;
                                                const _errs34 = errors;

                                                if (errors === _errs34) {
                                                  if (data15 && typeof data15 == "object" && !Array.isArray(data15)) {
                                                    let missing3;

                                                    if (data15.ratingValue === undefined && true || data15.ratingCount === undefined && true || data15.ratingUrl === undefined && true) {
                                                      return false;
                                                    } else {
                                                      const _errs36 = errors;

                                                      for (const key3 in data15) {
                                                        if (!(key3 === "ratingValue" || key3 === "ratingCount" || key3 === "ratingUrl")) {
                                                          return false;
                                                          break;
                                                        }
                                                      }

                                                      if (_errs36 === errors) {
                                                        if (data15.ratingValue !== undefined) {
                                                          let data16 = data15.ratingValue;
                                                          const _errs37 = errors;

                                                          if (errors === _errs37) {
                                                            if (typeof data16 == "number" && isFinite(data16)) {
                                                              if (data16 < 0 || isNaN(data16)) {
                                                                return false;
                                                              }
                                                            } else {
                                                              return false;
                                                            }
                                                          }

                                                          var valid6 = _errs37 === errors;
                                                        } else {
                                                          var valid6 = true;
                                                        }

                                                        if (valid6) {
                                                          if (data15.ratingCount !== undefined) {
                                                            let data17 = data15.ratingCount;
                                                            const _errs39 = errors;

                                                            if (errors === _errs39) {
                                                              if (typeof data17 == "number" && isFinite(data17)) {
                                                                if (data17 < 0 || isNaN(data17)) {
                                                                  return false;
                                                                }
                                                              } else {
                                                                return false;
                                                              }
                                                            }

                                                            var valid6 = _errs39 === errors;
                                                          } else {
                                                            var valid6 = true;
                                                          }

                                                          if (valid6) {
                                                            if (data15.ratingUrl !== undefined) {
                                                              const _errs41 = errors;

                                                              if (typeof data15.ratingUrl !== "string") {
                                                                return false;
                                                              }

                                                              var valid6 = _errs41 === errors;
                                                            } else {
                                                              var valid6 = true;
                                                            }
                                                          }
                                                        }
                                                      }
                                                    }
                                                  } else {
                                                    return false;
                                                  }
                                                }

                                                var valid2 = _errs34 === errors;
                                              } else {
                                                var valid2 = true;
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
                          }
                        }
                      } else {
                        return false;
                      }
                    }

                    var valid1 = _errs5 === errors;

                    if (!valid1) {
                      break;
                    }
                  }
                } else {
                  return false;
                }
              }

              var valid0 = _errs3 === errors;
            } else {
              var valid0 = true;
            }
          }
        }
      }
    } else {
      return false;
    }
  }

  return errors === 0;
}

const validate = (data, schemaName = "complex") => _validate(data) ? [] : [schemaName];

console.
/*OK*/
log(validate({}));
