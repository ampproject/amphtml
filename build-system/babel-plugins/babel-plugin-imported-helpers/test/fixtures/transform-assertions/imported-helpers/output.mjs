import _objectSpread from "@babel/runtime/helpers/objectSpread2";
import _objectWithoutPropertiesLoose from "@babel/runtime/helpers/objectWithoutPropertiesLoose";

const _foo = foo,
      a = _foo.a,
      b = _foo.b,
      c = _objectWithoutPropertiesLoose(_foo, ["a", "b"]);

const _bar = bar,
      d = _bar.d,
      e = _bar.e,
      f = _objectWithoutPropertiesLoose(_bar, ["d", "e"]);

const g = _objectSpread({}, foo);

const h = _objectSpread({
  bar
}, bar);
