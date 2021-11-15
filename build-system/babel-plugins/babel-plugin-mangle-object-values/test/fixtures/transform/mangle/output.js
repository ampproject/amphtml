// not mangled:
const x = {
  foo: 'bar',
  bar: 'qux',
  [x]: 'y'
}; // not mangled:

const y = notMangled({
  foo: 'bar',
  bar: 'qux',
  [x]: 'y'
}); // mangled:

const z = {
  foo: "a",
  bar: "b",
  [x]: "c"
};
