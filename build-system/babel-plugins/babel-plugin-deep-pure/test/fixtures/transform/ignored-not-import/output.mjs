const pure = v => v;

const ignored = pure(foo() || new Bar() || pure(pure(foo('bar', bar(), new Baz())) || 'foo'));
