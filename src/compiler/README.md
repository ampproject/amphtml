# AMP Compiler: Server rendering Components

This directory is responsible for generating the `compiler.js` binary, whose primary function is to implement server-rendering for AMP Components.
In order to opt-in to server-rendering, a component must have a render function included in the [builder](./builders.js) map.


## Classic components

We accomplish server-rendering classic components by extracting a `buildDom` function from `buildCallback`.
The goal is to separate out all DOM mutation from side effect (e.g. attaching listeners).

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