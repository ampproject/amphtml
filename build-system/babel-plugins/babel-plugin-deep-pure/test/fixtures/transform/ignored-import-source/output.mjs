import { pure } from 'something other than core/types/pure';
const ignored = pure(foo() || new Bar() || pure(pure(foo('bar', bar(), new Baz())) || 'foo'));
