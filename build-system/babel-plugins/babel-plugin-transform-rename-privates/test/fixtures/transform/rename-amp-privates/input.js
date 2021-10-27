const obj = {
  test_: 1,
  method_() {},
  get getter_() {},
  set setter_(v) {},
  shorthand_,
  
  [test_]: 1,
  [method_]() {},
  get [getter_]() {},
  set [setter_](v) {},

  'test_': 1,
  'method_'() {},
  get 'getter_'() {},
  set 'setter_'(v) {},
};

class Instance {
  test_ = 1;
  method_() {}
  get getter_() {}
  set setter_(v) {}
  
  [test_] = 1;
  [method_]() {}
  get [getter_]() {}
  set [setter_](v) {}

  'test_' = 1
  'method_'() {}
  get 'getter_'() {}
  set 'setter_'(v) {}
}

class Static {
  static test_ = 1;
  static method_() {}
  static get getter_() {}
  static set setter_(v) {}
  
  static [test_] = 1;
  static [method_]() {}
  static get [getter_]() {}
  static set [setter_](v) {}

  static 'test_' = 1
  static 'method_'() {}
  static get 'getter_'() {}
  static set 'setter_'(v) {}
}

var bar_;

foo.bar_;
foo[bar_];
foo['bar_'];

foo?.bar_;
foo?.[bar_];
foo?.['bar_'];

deep.foo?.bar_;
deep.foo?.[bar_];
deep.foo?.['bar_'];

deep?.foo.bar_;
deep?.foo[bar_];
deep?.foo['bar_'];
