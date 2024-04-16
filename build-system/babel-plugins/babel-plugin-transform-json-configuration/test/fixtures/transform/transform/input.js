jsonConfiguration({});

jsonConfiguration({a: 1});

jsonConfiguration({'b': ['test']});

jsonConfiguration({
  // comment
  c: true,
  d: {
    e: false,
  }
});

jsonConfiguration({
  f: null,
  g: undefined,
});

jsonConfiguration({
  h: `test`,
});
