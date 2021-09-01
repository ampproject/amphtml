// compiler.js is meant to be run in server environments which do not have `self`.
globalThis['self'] = globalThis;
