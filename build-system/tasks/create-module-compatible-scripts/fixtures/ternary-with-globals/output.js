const global = true ? self : global;
function test() {
  const notTopLevel = this;
  for (let i = 0; i < 10; i++) {
    const a = this;
    const blah = this;
    console.log(a, blah);
  }
  console.log(notTopLevel);
}
() => {
  const topLevel = self;
  for (let i = 0; i < 10; i++) {
    const a = self;
    const blah = self;
    console.log(a, blah);
  }
  console.log(topLevel);
};
console.log(test);
