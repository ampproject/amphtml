/** @jsx jsx.createElement */
import * as jsx from '../ANYWHERE_THAT_LEADS_TO/core/dom/jsx';

() => jsx.createElement("svg", {
  __svg: true
});

() => jsx.createElement("svg", {
  __svg: true
});

() => jsx.createElement("path", {
  foo: "bar",
  __svg: true
});

() => jsx.createElement("circle", {
  foo: "bar",
  __svg: true
});

() => jsx.createElement("div", null);

() => jsx.createElement("span", {
  class: "whatever"
});
