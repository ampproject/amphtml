var global = true ? self : global;
function test() {
  var notTopLevel = this;
  for (i=0; i<10; i++) {
    const a = this;
    blah = this;
  }
}
() => {
  var topLevel = self;
  for (i=0; i<10; i++) {
    const a = self;
    blah = self;
  }
}