let _param = param,
  _param2 = param;
function test(param = 1) {
  _param;
}
class Foo {
  test(param = 1) {
    _param2;
  }
}
