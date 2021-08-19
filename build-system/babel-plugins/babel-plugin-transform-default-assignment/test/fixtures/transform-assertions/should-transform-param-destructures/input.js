function test({a = 1, b: bb = 2}, [c = 3]) {
  a;
  bb
  c;
}

class Foo {
  test({a = 1, b: bb = 2}, [c = 3]) {
    a;
    bb
    c;
  }
}
