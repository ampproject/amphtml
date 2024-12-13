import {pure} from '../../../../../../../src/core/types/pure';
const ignored = foo();
const a = pure(
  foo() || new Bar() || pure(pure(foo('bar', bar(), new Baz())) || 'foo')
);
const b = pure('foo');
