const _foo = 'value for foo',
      _bar = 'value for bar',
      _nestedObject = {
  foo: 'foo'
};

class DirectAccess {
  setProps() {
    _foo;
    somethingSomething(_bar);
    tacos(_nestedObject.baz);
  }

  unsetProps() {
    return undefined;
  }

  propsSetToIds() {
    return _scopedId;
  }

}

import { DirectAccess as _DirectAccess } from './input-base-class';
const _scopedId = 'value for scopedId';
foo(_DirectAccess);
