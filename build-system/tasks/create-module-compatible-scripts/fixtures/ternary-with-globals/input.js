var global = true ? this : global;
function test() {
  var notTopLevel = this;
  for (i=0; i<10; i++) {
    const a = this;
    blah = this;
  }
}
() => {
  var topLevel = this;
  for (i=0; i<10; i++) {
    const a = this;
    blah = this;
  }
}