# AMP Compiler: Server Rendering Components

This directory is responsible for generating the `compiler.js` binary, whose primary function is to implement server-rendering for AMP Components.
In order to opt-in to server-rendering, a component must have a `buildDom` function included in the [builders](./builders.js) map.


## Classic components

We create `buildDom` functions by extracting all of the DOM mutations from `buildCallback`.
The goal is to separate out all DOM creation from side effects (e.g. attaching listeners), as we want to avoid side effects on the server.

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


## Bento components