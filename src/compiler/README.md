# AMP Compiler: Server Rendering Components

This directory is responsible for generating the `compiler.js` binary, whose primary function is to implement server-rendering for AMP Components.
In order to opt-in to server-rendering, a component must have a `buildDom` function included in the [builders](./builders.js) map.

## Classic components

We create `buildDom` functions by extracting all of the DOM mutations from `buildCallback`.
Separating DOM creation from side effects (e.g. attaching listeners) is important because these side effects must occur on the client.

Often times, a component may assign created DOM nodes as instance variables.
The `buildDom` should return handles to the needed nodes. A `buildDom` should automatically
detect if an element was already rendered and if so, make no mutations and instead query for the needed
nodes.

A classic component that has implemented server-rendering should look like:

```js
// File: amp-component/0.1/amp-component.js
class AmpComponent extends AMP.BaseElement {
  buildCallback() {
    const {domNode} = buildDom(this.element);
    // Attach event handlers, assign instance variables.
  }
}

// File: amp-component/0.1/build-dom.js
function buildDom(element) {
  if (isServerRendered(element)) {
    // If already rendered, then query for all of the needed dom nodes.
    return queryDom(element);
  }
  const doc = element.ownerDocument;
  // Likely create DOM and attach to element.
}
```

Check out [`<amp-layout>`](../builtins/amp-layout/amp-layout.js) to see a simple example.

<!-- TODO(samouri): Create Bento section when the details finalize. -->
