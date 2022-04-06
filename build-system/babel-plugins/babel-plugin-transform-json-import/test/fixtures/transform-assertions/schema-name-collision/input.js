const validate0 = `
  ajv creates a "validate0" identifier in module scope.
  ajv's should be renamed, and this assignment should be preserved.
`;

import validate from './name-collision.schema.json' assert {type: 'json-schema'};

validate(`
  "validate" is ajvCompile's default output name.
  This should not fail transform.
`);
