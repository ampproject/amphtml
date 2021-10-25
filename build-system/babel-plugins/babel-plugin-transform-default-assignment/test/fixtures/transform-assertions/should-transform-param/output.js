function test(param = 1) {
  let _param = param;
  _param;
}

class Foo {
  test(param = 1) {
    let _param2 = param;
    _param2;
  }

}
