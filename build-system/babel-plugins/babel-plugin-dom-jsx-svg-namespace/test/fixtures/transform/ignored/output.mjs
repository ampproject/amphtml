// Import does not end with core/dom/jsx so we ignore this file.

/** @jsx Preact.createElement */
import * as Preact from 'preact';

() => Preact.createElement("svg", null);

() => Preact.createElement("svg", {
  xmlns: "http://www.w3.org/2000/svg"
});

() => Preact.createElement("path", {
  foo: "bar"
});

() => Preact.createElement("circle", {
  foo: "bar"
});

() => Preact.createElement("div", null);

() => Preact.createElement("span", {
  class: "whatever"
});
