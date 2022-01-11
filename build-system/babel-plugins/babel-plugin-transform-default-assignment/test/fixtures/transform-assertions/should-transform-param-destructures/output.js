function test({
  a = 1,
  b: bb = 2
}, [c = 3]) {
  let _a = a,
      _bb = bb,
      _c = c;
  _a;
  _bb;
  _c;
}

class Foo {
  test({
    a = 1,
    b: bb = 2
  }, [c = 3]) {
    let _a2 = a,
        _bb2 = bb,
        _c2 = c;
    _a2;
    _bb2;
    _c2;
  }

}
