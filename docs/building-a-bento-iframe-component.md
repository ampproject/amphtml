# Building a Bento Iframe Component

> **You should first read through the [guide to Building a Bento AMP Extension](./building-a-bento-amp-extension.md).** Do not follow the steps to generate an extension, since they're specified here. Once you're familiar with the concepts related to AMP extensions and Bento components, follow this guide instead.

<!--
  (Do not remove or edit this comment.)

  This table-of-contents is automatically generated. To generate it, run:
    amp markdown-toc --fix
-->

<!-- {"maxdepth": 3} -->

-   [How Iframe Components Work](#how-iframe-components-work)
-   [Getting Started](#getting-started)
-   [Directory Structure](#directory-structure)
-   [Define a Preact component](#define-a-preact-component)
    -   [Loading an iframe with `IframeEmbed`](#loading-an-iframe-with-iframeembed)
        -   [`src`](#src)
        -   [Handling events with `messageHandler`](#handling-events-with-messagehandler)
        -   [Resizing AMP components](#handling-events-with-messagehandler)
    -   [Use `ProxyIframeEmbed` directly](#use-proxyiframeembed-directly)
        -   [Passing or overriding props](#passing-or-overriding-props)
-   [Completing your extension](#completing-your-extension)
-   [Example Pull Requests](#example-pull-requests)

## How Iframe Components Work

A number of AMP components use iframes to load external resources while staying compliant to AMP's performance considerations, such as enforcing stable layouts whenever possible and pausing resources based on document state. For this reason, Bento provides a generic iframe component to handle many of these resource considerations so that component implementation can focus on the feature set being provided.

**Preact components** can get this behavior by using an **`IframeEmbed`** that renders an iframe and propagates props accordingly:

```js
return <IframeEmbed frameborder="no" scrolling="no" title="My iframe" {...props} />
```

Some components may additionally [load external resources](./building-a-bento-amp-extension.md#loading-external-resources), such as an SDK, to enable a third party integration. AMP serves this on a different domain for security and performance reasons, and Bento provides `ProxyIframeEmbed` to additionally wrap `IframeEmbed` with an intermediary bootstrapping iframe.

**Preact components** can get this behavior by using an **`ProxyIframeEmbed`** that renders an iframe and propagates props accordingly:

```js
return <ProxyIframeEmbed frameborder="no" scrolling="no" title="My third party iframe" {...props} />
```

One important consideration is that direct iframes, such as those provided by `IframeEmbed` and [`VideoIframe`](./building-a-bento-video-player.md#loading-an-iframe-with-VideoIframe), are not the same as a **proxy iframe**, which provides an additional layer of communication between an iframe and the document. If it is not clear which is the appropriate helper for your component, [your guide](./contributing-code.md#find-a-guide) can help identify the best one to use.

## Getting Started

Start by generating an extension specifying `--bento` and `--nojss`. We name our extension **`amp-fantastic-embed`**, according to our [guidelines for naming a third-party component](./spec/amp-3p-naming.md).

```console
amp make-extension --bento --nojss --name=amp-fantastic-embed
```

## Directory Structure

A [full directory for a Bento component](./building-a-bento-amp-extension.md#directory-structure) is generated, but this guide will cover the following file in particular:

```
/extensions/amp-fantastic-embed/1.0/
 ├── amp-my-fantastic-player.js    # Element's implementation
 └── component.js                  # Preact implementation
```

## Define a Preact component

If you need to directly insert nodes to the document, like a `<iframe>` element, you need to use an `<IframeEmbed>`. If you need to load a third-party iframe, you should use a `<ProxyIframeEmbed>` as opposed to an `<IframeEmbed>`.

### Loading an iframe with `IframeEmbed`

Your `FantasticEmbed` component should return an `IframeEmbed` that's configured to a corresponding `postMessage` API. To start, we update the implementation in **`component.js`**:

```diff
- import {ContainWrapper} from '#preact/component';
+ import {IframeEmbed} from '#preact/iframe';

  function FantasticEmbedWithRef({...rest}, ref) {
-   ...
+   const src = 'https://example.com/fantastic';
+   const messageHandler = useCallback((e) => {
+     console.log(e);
+   }, []);
    return (
-     <ContainWrapper layout size paint {...rest} >
-       ...
-     </ContainWrapper>
+     <IframeEmbed
+       ref={ref}
+       {...rest}
+       src={src}
+       messageHandler={messageHandler}
+     />
    );
  }
```

So that our component returns an `<IframeEmbed>`:

```js
// component.js
// ...
import {IframeEmbed} from '#preact/component/iframe';
// ...
function FantasticPlayerWithRef({...rest}, ref) {
  const src = 'https://example.com/fantastic';
  const onMessage = useCallback((e) => {
    console.log(e);
  }, []);
  return (
    <IframeEmbed
      ref={ref}
      {...rest}
      src={src}
      messageHandler={messageHandler}
    />
  );
}
```

We're rendering an iframe that always loads `https://example.com/fantastic`, but we'll specify a dynamic URL later. Likewise, we'll need to define implementations for the communication function `messageHandler`.

#### `src`

You may use props to construct the `src`, like using a `appId` to load `https://example.com/fantastic/${appId}/`.

We employ the `useMemo()` hook so that the `src` is generated only when the `appId` changes:

```js
// component.js
// ...
function FantasticEmbedWithRef(
  {appId, ...rest},
  ref
) {
  // ...
  const src = useMemo(
    () =>
      `https://example.com/fantastic/${encodeURIComponent(appId)}/`,
    [appId]
  );
  // ...
  return (
    <IframeEmbed
      {...rest}
      src={src}
      ...
    />
  );
}
```

#### Handling events with `messageHandler`

Upstream events originated by the iframe are received as messages. You should define a function that interprets these messages and responds accordingly.

Here we listen for measure events for an iframe that posts them as the following message structure:

```
{"event": {
   "data" : {
     "type": "MEASURE",
     "details": {
       "height": ___
      }
    }
  }
}
```

The component, which may be instantiated with a static height, can then resize once it receives the message with a fresh `height` value.

```js
// component.js
// ...
function messageHandler(event) {
  const {data} = event;
  if (data['type'] == 'MEASURE' && data['details']) {
    const height = data['details']['height'];
    // use the height to resize.
  }
}

function FantasticEmbedWithRef(
  {appId, ...rest},
  ref
) {
  // ...
  return (
    <IframeEmbed
      {...rest}
      messageHandler={messageHandler}
      ...
    />
  );
}
```

Your iframe's interface to post messages is likely different, but your component should always handle these events via the `messageHandler`.

### Use `ProxyIframeEmbed` directly

If you `FantasticEmbed` component uses third party resources such as an SDK, then it should return a `ProxyIframeEmbed` that's configured to a corresponding `postMessage` API. To start, we update the implementation in **`component.js`**.

```diff
- import {ContainWrapper} from '#preact/component';
+ import {ProxyIframeEmbed} from '#preact/component/3p-frame';

  function FantasticEmbedWithRef({...rest}, ref) {
-   ...
    return (
-     <ContainWrapper layout size paint {...rest} >
-       ...
-     </ContainWrapper>
+     <ProxyIframeEmbed ref={ref} {...rest} />
    );
  }
```

So that our component returns a `<ProxyIframeEmbed>`:

```js
// component.js
// ...
+ import {ProxyIframeEmbed} from '#preact/component/3p-frame';

// ...
function FantasticEmbedWithRef({...rest}, ref) {
  return <ProxyIframeEmbed ref={ref} {...rest}/>;
}
```

#### Resizing components in AMP

AMP documents additionally guarantee layout stability to the degree that it manages when components may or may not resize on the page. Because of this, the `IframeEmbed` component takes a `requestResize` prop where a different flow of logic may be passed in by the publisher to respond to measure events.

In your AMP element implementation, you will use `requestResize` to pass in the `attemptChangeHeight` method that is extended from the `BaseElement` class:

```javascript
// amp-fantastic-embed.js
// ...
class AmpFantasticEmbed extends BaseElement {
  /** @override */
  init() {
    return dict({
      'requestResize': (height) => {
        this.attemptChangeHeight(height);
      },
    });
  }
}
```

For components that request a resize that is denied by the AMP runtime, publishers are recommended to use an `overflow` element to solicit user interaction in order to resize as a layout stability best-practice.

This information can be provided in the component documentation with an exemplary code sample:

```html
<amp-fantastic-embed layout="fixed" width="400" height="200">
  <button overflow>Click me to load the full iframed content!</button>
</amp-fantastic-embed>
<p>Content below the component.</p>
```

#### Passing or overriding props

In the previous example, props received from the `ProxyIframeEmbed` are implicitly set through `...rest`. If we set each explicitly, we see the `HTMLIframeElement` attributes handled.

```js
// component.js
// ...
function FantasticEmbedInternalWithRef(
  {
    allow,
    allowFullScreen,
    allowTransparency,
    frameborder,
    loading,
    name,
    sandbox,
    scrolling,
    src,
    title,
  },
  ref
) {
  return (
    <div ref={ref} style={style}>
      <iframe
        allow={allow}
        allowFullScreen={allowFullScreen}
        allowTransparency={allowTransparency}
        frameborder="0"
        loading={loading}
        name={name}
        part="iframe"
        ref={iframeRef}
        sandbox={sandbox}
        scrolling="no"
        src={src}
        title={title}
      />
    </div>
  );
}
```

> **If you need to pass `style` or `ref` to the underlying iframe, these are exceptional in that they are propagated to the outer `ContainWrapper` which parents the `iframe` element. You should use `iframeStyle` or `iframeRef` accordingly to pass inline styles and refs.**

You may similarly choose to pass or override properties at the higher level, passed from `FantasticEmbed` into the `ProxyIframeEmbed` we instantiate. For a list of these properties [see `component.type.js`](../src/preact/component/component.type.js)

## Completing your extension

Follow the [guide to Building a Bento AMP Component](./building-a-bento-amp-extension.md) for other instructions that you should complete, including:

-   **Documentation** that describes the component.
-   **Tests** that verify the component's functionality.
-   **Validator rules** to embed the component in an AMP document.
-   **An example** to our Storybook or to be published on [amp.dev](https://amp.dev/)

## Example Pull Requests

-   Iframe embed:
    -   [amp-instagram](https://github.com/ampproject/amphtml/pull/30230)
    -   [amp-soundcloud](https://github.com/ampproject/amphtml/pull/34828)
-   Third party iframe:
    -   [amp-facebook](https://github.com/ampproject/amphtml/pull/34585)
    -   [amp-twitter](https://github.com/ampproject/amphtml/pull/33335)
