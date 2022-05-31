/** @jsx jsx.createElement */
import * as jsx from '../ANYWHERE_THAT_LEADS_TO/core/dom/jsx';

() => jsx.createElement("svg", {
  xmlns: "http://www.w3.org/2000/svg"
});

() => jsx.createElement("svg", {
  xmlns: "http://www.w3.org/2000/svg"
});

() => jsx.createElement("path", {
  foo: "bar",
  xmlns: "http://www.w3.org/2000/svg"
});

() => jsx.createElement("circle", {
  foo: "bar",
  xmlns: "http://www.w3.org/2000/svg"
});

() => jsx.createElement("div", null);

() => jsx.createElement("span", {
  class: "whatever"
});
