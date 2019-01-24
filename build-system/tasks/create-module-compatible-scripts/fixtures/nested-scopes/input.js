const bar = () => {
  const that = this;
  for (let i = 0 ;i < 10; i++) {
    (function() {
      const foo = this;
      console.log(that, this);
      console.log(foo);
    })(i);
  }
};
console.log(bar);
