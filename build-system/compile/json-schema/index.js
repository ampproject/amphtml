/**
 * @fileoverview
 * Compiles JSON Schema to a validate() function using ajv.
 */
const {_: ajvCode, Name: AjvName, default: Ajv} = require('ajv');
const dedent = require('dedent');

/**
 * Defines custom validators that we may inject into certain schemas.
 * @const {{
 *   fn: string,
 *   error?: import('ajv/dist/types').KeywordErrorDefinition,
 *   shouldUse: (import('ajv/dist/types').SchemaObject) => boolean,
 * }[]}
 *  - `fn` is the name of a validator function exported from `#core/json-schema`
 *    This function must return a boolean value determining whether the data is
 *    valid
 *  - `error` is optional and determines a `KeywordErrorDefinition` for ajv
 *    that's used when validation fails.
 *  - `shouldUse` is a boolean function that tests whether `fn` should be used
 *    for a certain schema.
 *    This function may also modify the schema object in-place. This is
 *    desirable in cases where the validator function should override validators
 *    with an equivalent implementation.
 */
const customValidators = [
  // A schema may include an `enum` with a list of valid currency codes.
  // When its `description` includes the URL that links to currency codes below,
  // we remove this enum and instead use `Intl.NumberFormat` to validate them
  // natively. This prevents the binary from including a long list of currency
  // codes.
  {
    fn: 'isValidCurrencyCode',
    error: {message: 'must be a valid currency code'},
    shouldUse(schema) {
      if (
        Array.isArray(schema.enum) &&
        schema.description?.includes('https://datahub.io/core/currency-codes')
      ) {
        delete schema.enum;
        return true;
      }
      return false;
    },
  },
];

/**
 * Remaps a JSON schema recursively in order to use custom validators.
 * These are mapped as keywords, prefixed by an underscore `_`:
 *   { "_isValidCurrencyCode": true }
 * This format prevents them from clobbering the standard namespace
 * @param {*} schema
 * @return {*}
 */
function addCustomValidatorsToSchema(schema) {
  if (typeof schema !== 'object') {
    return schema;
  }
  if (Array.isArray(schema)) {
    return schema.map(addCustomValidatorsToSchema);
  }
  for (const {fn, shouldUse} of customValidators) {
    if (shouldUse(schema)) {
      schema[`_${fn}`] = true;
    }
  }
  for (const k in schema) {
    schema[k] = addCustomValidatorsToSchema(schema[k]);
  }
  return schema;
}

/**
 * @param {any} schema
 * @param {string=} customValidatorsModuleId
 * @return {{code: string, validateName: string}}
 */
function ajvCompile(schema, customValidatorsModuleId = '__jsonSchema') {
  const ajv = new Ajv({
    code: {
      esm: true,
      source: true,
      lines: true,
    },
    allErrors: true,
    validateSchema: false,
    // Add a keyword to the vocabulary for each custom validator.
    keywords: customValidators.map(({error, fn}) => ({
      keyword: `_${fn}`,
      error,
      code(ctx) {
        ctx.pass(
          ajvCode`${new AjvName(customValidatorsModuleId)}.${new AjvName(fn)}(${
            ctx.data
          })`
        );
      },
    })),
  });
  const validateAjv = ajv.compile(addCustomValidatorsToSchema(schema));
  if (!validateAjv.source) {
    throw new Error();
  }
  const scopeCode = ajv.scope.scopeCode(validateAjv?.source?.scopeValues, {});
  const code = dedent(`
    __scopeCode__
    __validateAjv__
    /**
     * @type {(any) => {instancePath?: string, message?: string}[]}
     * https://ajv.js.org/api.html#error-objects
     */
    function validate(data) {
      return __validateAjvName__(data) ? [] : __validateAjvName__.errors;
    }
  `)
    .replace('__scopeCode__', scopeCode)
    // validateAjv returns a boolean, and modifies a property of the function
    // for errors. The default instead returns an array of errors, which is
    // empty when the input is valid.
    .replace('__validateAjv__', validateAjv?.source?.validateCode)
    .replace(/__validateAjvName__/g, validateAjv?.source?.validateName.str);
  return {
    code,
    validateName: 'validate',
  };
}

module.exports = {
  ajvCompile,
};
