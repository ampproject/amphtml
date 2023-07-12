

module.exports = {
  'env': {
    'node': true,
  },
  'globals': {
    'require': false,
    'process': false,
    'exports': false,
    'it': false,
    'chai': false,
    'expect': false,
    'describe': false,
    'beforeEach': false,
    'afterEach': false,
    'before': false,
    'after': false,
    'assert': false,
    'describes': true,
    'Key': false,
  },
  'rules': {
    'import/no-unresolved': 0,
    'local/enums': 0,
    'local/no-bigint': 0,
    'local/no-dynamic-import': 0,
    'local/no-export-side-effect': 0,
    'local/no-function-async': 0,
    'local/no-function-generator': 0,
    'local/no-has-own-property-method': 0,
    'local/no-import-meta': 0,
    'local/no-invalid-this': 0,
    'local/no-module-exports': 0,
    'module-resolver/use-alias': 0,
  },
};
