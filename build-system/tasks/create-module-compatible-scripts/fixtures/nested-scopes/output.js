const bar = () => {
  const that = self;
  for (let i = 0 ;i < 10; i++) {
    (function(){
      const foo = this;
      console.log(that, this)
    })(i);
  }
}