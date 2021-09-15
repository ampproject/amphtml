# AMP Compiler: Server Rendering Components

This directory is responsible for generating the `compiler.js` binary, whose primary function is to implement server-rendering for AMP Components.
In order to opt-in to server-rendering, a component must have a `buildDom` function included in the [builders](./builders.js) map.

## Classic components

We create `buildDom` functions by extracting all of the DOM mutations from `buildCallback`.
Separating DOM creation from side effects (e.g. attaching listeners) is important because these side effects must occur on the client.

A classic component's structure that has implemented server-rendering should be:

```js
class AmpComponent extends AMP.BaseElement {
  buildCallback() {
    if (!this.hasAttribute('i-amphtml-ssr')) {
      buildDom(this.element);
    }
    // Attach event handlers.
  }
}

function buildDom(element) {
  const doc = element.ownerDocument;
  // Likely create DOM and attach to element.
}
```

Check out [<amp-layout>](../builtins/amp-layout/amp-layout.js) to see a simple example.

<!-- TODO(samouri): Create Bento section when the details finalize. -->