class DirectAccess {
  setProps() {
    _staticComponentConfig__foo;
    somethingSomething(_staticComponentConfig__bar);
    tacos(_staticComponentConfig__nestedObject.baz);
  }

  unsetProps() {
    return undefined;
  }

  propsSetToIds() {
    return _scopedId;
  }

}

const _staticComponentConfig__foo = 'value for foo',
      _staticComponentConfig__bar = 'value for bar',
      _staticComponentConfig__nestedObject = {
  foo: 'foo'
};
import { DirectAccess as _DirectAccess } from './input-base-class';
const _scopedId = 'value for scopedId';
foo(DirectAccess);
