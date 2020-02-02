const _vendorComponentConfig__foo = 'value for foo',
      _vendorComponentConfig__bar = 'value for bar',
      _vendorComponentConfig__nestedObject = {
  foo: 'foo'
};
export class DirectAccess {
  setProps() {
    _vendorComponentConfig__foo;
    somethingSomething(_vendorComponentConfig__bar);
    tacos(_vendorComponentConfig__nestedObject.baz);
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
foo(DirectAccess);
