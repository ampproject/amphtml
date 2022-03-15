import * as Preact from '#preact';
import * as PreactCompat from '#preact/compat';

export * from '#preact';
export * from '#preact/compat';

// This file allows us to remap react imports from external libraries to
// our internal preact exports. This file uses a default export in order to
// be compatible with libraries that use react default import syntax.

export default {...Preact, ...PreactCompat};
