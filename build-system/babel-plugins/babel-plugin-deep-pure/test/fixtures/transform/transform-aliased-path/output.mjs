import { pure } from '#core/types/pure';
const ignored = foo();
const a = /* #__PURE__ */foo() || /* #__PURE__ */new Bar() || /* #__PURE__ */foo('bar', /* #__PURE__ */bar(), /* #__PURE__ */new Baz()) || 'foo';
const b = 'foo';
