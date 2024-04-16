const obj = {
  test_AMP_PRIVATE_: 1,

  method_AMP_PRIVATE_() {},

  get getter_AMP_PRIVATE_() {},

  set setter_AMP_PRIVATE_(v) {},

  shorthand_AMP_PRIVATE_: shorthand_,
  [test_]: 1,

  [method_]() {},

  get [getter_]() {},

  set [setter_](v) {},

  'test_': 1,

  'method_'() {},

  get 'getter_'() {},

  set 'setter_'(v) {}

};

class Instance {
  test_AMP_PRIVATE_ = 1;

  method_AMP_PRIVATE_() {}

  get getter_AMP_PRIVATE_() {}

  set setter_AMP_PRIVATE_(v) {}

  [test_] = 1;

  [method_]() {}

  get [getter_]() {}

  set [setter_](v) {}

  'test_' = 1;

  'method_'() {}

  get 'getter_'() {}

  set 'setter_'(v) {}

}

class Static {
  static test_AMP_PRIVATE_ = 1;

  static method_AMP_PRIVATE_() {}

  static get getter_AMP_PRIVATE_() {}

  static set setter_AMP_PRIVATE_(v) {}

  static [test_] = 1;

  static [method_]() {}

  static get [getter_]() {}

  static set [setter_](v) {}

  static 'test_' = 1;

  static 'method_'() {}

  static get 'getter_'() {}

  static set 'setter_'(v) {}

}

var bar_;
foo.bar_AMP_PRIVATE_;
foo[bar_];
foo['bar_'];
foo?.bar_AMP_PRIVATE_;
foo?.[bar_];
foo?.['bar_'];
deep.foo?.bar_AMP_PRIVATE_;
deep.foo?.[bar_];
deep.foo?.['bar_'];
deep?.foo.bar_AMP_PRIVATE_;
deep?.foo[bar_];
deep?.foo['bar_'];
