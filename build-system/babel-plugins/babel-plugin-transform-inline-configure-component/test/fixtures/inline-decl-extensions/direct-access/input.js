import {DirectAccess} from './input-base-class';

const scopedId = 'value for scopedId';

foo(
  configureComponent(DirectAccess, {
    scopedId,
    foo: 'value for foo',
    bar: 'value for bar',
    nestedObject: {foo: 'foo'},
  })
);
