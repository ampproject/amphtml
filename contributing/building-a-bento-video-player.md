# Building a Bento Video Player

> **You should first read through the [guide to Building a Bento AMP Component](./building-a-bento-amp-extension.md).** Do not follow the steps to generate an extension, since they're specified here. Once you're familiar with the concepts related to AMP extensions and Bento components, follow this guide instead.

<!--
  (Do not remove or edit this comment.)

  This table-of-contents is automatically generated. To generate it, run:
    amp markdown-toc --fix
-->

<!-- {"maxdepth": 3} -->

-   [How Video Player Components Work](#how-video-player-components-work)
-   [Getting Started](#getting-started)
-   [Directory Structure](#directory-structure)
-   [Extend `VideoBaseElement` for AMP](#extend-videobaseelement-for-amp)
    -   [Pre-upgrade CSS](#pre-upgrade-css)
    -   [`props`](#props)
-   [Define a Preact component](#define-a-preact-component)
    -   [Forwarding `ref`](#forwarding-ref)
    -   [Loading an iframe with `VideoIframe`](#loading-an-iframe-with-videoiframe)
        -   [`src`](#src)
        -   [`origin`](#origin)
        -   [Playback methods with `makeMethodMessage`](#playback-methods-with-makemethodmessage)
        -   [Handling events with `onMessage`](#handling-events-with-onmessage)
    -   [Use `VideoWrapper` directly](#use-videowrapper-directly)
        -   [Specifying `component`](#specifying-component)
        -   [Passing or overriding props](#passing-or-overriding-props)
        -   [Imperative handle](#imperative-handle)
-   [Completing your extension](#completing-your-extension)
-   [Example Pull Requests](#example-pull-requests)

## How Video Player Components Work

AMP and Bento provide [default video player capabilities](https://amp.dev/documentation/guides-and-tutorials/learn/spec/amp-video-interface/) in order to create a uniform experience. For example, videos only autoplay while they're visible and muted, and they consistently unmute when clicked. They send the same event signals to [`amp-analytics`](https://go.amp.dev/c/amp-analytics), or may be pinned to a corner in the same way in combination with [`amp-video-docking`](https://go.amp.dev/c/amp-video-docking).

On a host document, player components must dispatch the same events and implement the same methods so that playback and user interface can be coordinated successfully.

**Preact components** can support this behavior by using a **`VideoWrapper`** that will use a specified `component`:

```js
return <VideoWrapper component="video" {...props} />
```

The `component` prop can be a string to specify a `<video>` element or an id reference to a component whose interface is similar to [`HTMLMediaElement`](https://developer.mozilla.org/en-US/docs/Web/API/HTMLMediaElement).

However, most video players are embedded through an iframe so they should use **`VideoIframe`** instead. This is a specialized `VideoWrapper` that doesn't require an underlying `component`:

```js
return <VideoIframe {...props}>
```

To enable component support for **AMP documents**, our video player element must extend from a base class `VideoBaseElement`. This enables [actions](https://amp.dev/documentation/guides-and-tutorials/learn/amp-actions-and-events/#amp-video-and-other-video-elements_1) and [analytics](https://github.com/ampproject/amphtml/blob/main/extensions/amp-analytics/amp-video-analytics.md), and allows us to define further behavior specific to the AMP layer, like parsing element attributes into Preact props.

This guide covers how to implement video player components that are internally implemented using these Preact and AMP components.

## Getting Started

Start by generating an extension specifying `--bento` and `--nojss`. We name our extension **`amp-fantastic-player`**, ending with `-player` according to our [guidelines for naming a third-party component](../spec/amp-3p-naming.md).

```shell
amp make-extension --bento --nojss --name=amp-fantastic-player
```

## Directory Structure

A [full directory for a Bento component](./building-a-bento-amp-extension.md#directory-structure) is generated, but this guide will cover the following files in particular:

```shell
/extensions/amp-fantastic-player/1.0/
 ├── base-element.js               # Preact base element
 ├── component.js                  # Preact implementation
 ├── amp-my-fantastic-player.js    # Element's implementation
 └── amp-my-fantastic-player.css   # Custom CSS
```

## Extend `VideoBaseElement` for AMP

Our `BaseElement` should be a superclass of `VideoBaseElement`. In **`base-element.js`**, we change:

```diff
  import {MyFantasticPlayer} from './component';
- import {PreactBaseElement} from '../../../src/preact/base-element';
+ import {VideoBaseElement} from '../../amp-video/1.0/base-element';

- export class BaseElement extends PreactBaseElement {}
+ export class BaseElement extends VideoBaseElement {}
```

into:

```js
import {MyFantasticPlayer} from './component';
import {VideoBaseElement} from '../../amp-video/1.0/base-element';

export class BaseElement extends VideoBaseElement {}
```

This enables support for AMP actions and analytics, once we map attributes to their prop counterparts in `BaseElement['props']`, and we implement the Preact component.

**Adding this import statement will cause CI to fail**. You should solve this by explicitly allowing the cross-extension import, which is ok for this target file. We add to **`build-system/test-configs/dep-check-config.js`**:

```diff
{
  // Extensions can't depend on other extensions.
  filesMatching: 'extensions/**/*.js',
  mustNotDependOn: 'extensions/**/*.js',
  allowlist: [
    ...
+   // Bento MyFantasticPlayer, amp-my-fantastic-player
+   'extensions/amp-my-fantastic-player/1.0/base-element.js->extensions/amp-video/1.0/base-element.js',
  ],
},
```

### Pre-upgrade CSS

Bento components must specify certain layout properties in order to prevent [Cumulative Layout Shift (CLS)](https://web.dev/cls). Video extensions must include the following in the generated **`amp-fantastic-player.css`**:

```css
/*
 * Pre-upgrade:
 * - display:block element
 * - size-defined element
 */
amp-fantastic-player {
  display: block;
  overflow: hidden;
  position: relative;
}

/* Pre-upgrade: size-defining element - hide children. */
amp-fantastic-player:not(.i-amphtml-built) > :not([placeholder]):not(.i-amphtml-svc) {
  display: none;
  content-visibility: hidden;
}
```

### `props`

[**`props`**](https://github.com/ampproject/amphtml/blob/main/contributing/building-a-bento-amp-extension.md#preactbaseelementprops) map the AMP element's attributes to the Preact component props. Take a look at [`VideoBaseElement`](extensions/amp-video/1.0/base-element.js) for how most video properties are mapped. On your own `base-element.js`, you should specify any of them you support.

```js
/** @override */
BaseElement['props'] = {
  'autoplay': {attr: 'autoplay', type: 'boolean'},
};
```

## Define a Preact component

If you need to directly insert nodes to the document, like a `<video>` element, you need to use a `<VideoWrapper>`.

However, it's more likely that you load a third-party iframe and you communicate with the host via `postMessage`. In this case you should use a `<VideoIframe>` as opposed to a `<VideoWrapper>`.

> ⚠️ Components may **not** embed scripts from a third-party location into host documents. If a third-party script is absolutely required, like on `<amp-ima-video>`, it must be inserted in an intermediate iframe, which we call a **proxy frame**.
>
> Proxy frames on Bento have not yet been tested as video player components, so they're not covered in this guide. If you wish to use one, please get in touch with `@alanorozco` via a Github issue or on Slack.

### Forwarding `ref`

To enable AMP actions (`my-element.play`) and the Preact component's imperative handle (`myPlayerRef.current.play()`), you'll have to [`forwardRef`](https://reactjs.org/docs/forwarding-refs.html). Rename `FantasticPlayer` to `FantasticPlayerWithRef`, and export a `FantasticPlayer` that forwards a `ref` into the former.

```diff
+ import {forwardRef} from '../../../src/preact/compat';

- export function FantasticPlayer({...rest}) {
+ function FantasticPlayerWithRef({...rest}, ref) {
    ...
  }

+ const FantasticPlayer = forwardRef(FantasticPlayerWithRef);
+ FantasticPlayer.displayName = 'FantasticPlayer'; // Make findable for tests.
+ export {FantasticPlayer};
```

So the outer structure looks like:

```js
// ...
import {forwardRef} from '../../../src/preact/compat';

// ...
function FantasticPlayerWithRef({...rest}, ref) {
  // ...
}

//...
const FantasticPlayer = forwardRef(FantasticPlayerWithRef);
FantasticPlayer.displayName = 'FantasticPlayer'; // Make findable for tests.
export {FantasticPlayer};
```

### Loading an iframe with `VideoIframe`

Your `FantasticPlayer` component should return a `VideoIframe` that's configured to a corresponding `postMessage` API. To start, we update the implementation in **`component.js`**:

```diff
- import {ContainWrapper} from '../../../src/preact/component';
+ import {VideoIframe} from '../../amp-video/1.0/video-iframe';

  function FantasticPlayerWithRef({...rest}, ref) {
-   ...
+   const src = useMemo(
+     () => 'https://example.com/fantastic',
+     []
+   );
+   const makeMethodMessage = useCallback(() => '{}', []);
+   const onMessage = useCallback((e) => {
+     console.log(e);
+   }, []);
    return (
-     <ContainWrapper layout size paint {...rest} >
-       ...
-     </ContainWrapper>
+     <VideoIframe
+       {...rest}
+       src={src}
+       makeMethodMessage={makeMethodMessage}
+       onMessage={onMessage}
+     />
    );
  }
```

into:

```js
import {VideoIframe} from '../../amp-video/1.0/video-iframe';

// ...

function FantasticPlayerWithRef({...rest}, ref) {
  const src = useMemo(
    () => 'https://example.com/fantastic',
    []
  );
  const makeMethodMessage = useCallback(() => '{}', []);
  const onMessage = useCallback((e) => {
    console.log(e);
  }, []);
  return (
    <VideoIframe
      {...rest}
      src={src}
      makeMethodMessage={makeMethodMessage}
      onMessage={onMessage}
    />
  );
}
```

We're rendering an iframe that always loads `https://example.com/fantastic`, but we'll specify a dynamic URL later; hence `useMemo()`. Likewise, we'll need to define implementations for the communication functions `makeMethodMessage` and `onMessage`.

You should add allow one more cross-extension import for `VideoIframe`. Following the previous location on **`dep-check-config.js`**, we add:

```diff
  allowlist: [
    ...
    // Bento MyFantasticPlayer, amp-my-fantastic-player
    'extensions/amp-my-fantastic-player/1.0/base-element.js->extensions/amp-video/1.0/base-element.js',
+   'extensions/amp-my-fantastic-player/1.0/component.js->extensions/amp-video/1.0/video-iframe.js',
  ],
```

#### `src`

You may use props to construct the `src`, like using a `videoId` to load `https://example.com/fantastic/${videoId}/`.

We employ the `useMemo()` hook so that the `src` is generated only when the `videoId` changes:

```js
function FantasticPlayerWithRef(
  {videoId, ...rest},
  ref
) {
  // ...
  const src = useMemo(
    () =>
      `https://example.com/fantastic/${encodeURIComponent(videoId)}/`,
    [videoId]
  );
  // ...
  return (
    <VideoIframe
      {...rest}
      src={src}
      ...
    />
  );
}
```

#### `origin`

#### Playback methods with `makeMethodMessage`

We need the ability to tell the iframe to execute certain actions, for example `play`, `mute` or `hideControls`. When using an iframe to load a player, this is done by sending a `postMessage` downstream.

`makeMethodMessage` takes an action to execute as a `string`, and returns another `string` corresponding to a message to send.

```ts
type MakeMethodMessageFunction = (method: string) => string;
```

We implement this function with `useCallback()` so that it's created only when required as specified by hook dependencies. It's recommended that you also create a higher-level `makeMessage` function that creates and serializes messages as your iframe's interface needs it. In this case, we `JSON.stringify` a `videoId` and a `method`:

```js
function makeMessage(videoId, method) {
  return JSON.stringify({
    'videoId': videoId,
    'method': method,
  });
}

function FantasticPlayerWithRef(
  {videoId, ...rest},
  ref
) {
  // ...
  const makeMethodMessage = useCallback(
    (method) => makeMessage(videoId, method),
    [videoId]
  );

  // ...
  return (
    <VideoIframe
      {...rest}
      makeMethodMessage={makeMethodMessage}
      ...
    />
  );
}
```

#### Handling events with `onMessage`

```ts
type OnMessageFunction = (event: MessageEvent) => void;
```

> ⚠️ **This is an incomplete [`MessageEvent`](https://developer.mozilla.org/en-US/docs/Web/API/MessageEvent).** It's a copy that contains `currentTarget` (the originating `<iframe>`), `target` (same as `currentTarget`) and `data` (the data sent by the iframe with `postMessage`). If you need to copy other properties, add them to the appropriate place in [`video-iframe.js`](../extensions/amp-video/1.0/video-iframe.js) and add `@alanorozco` as a reviewer on your pull request.

```js
function onMessage(event) {
  const {data, currentTarget} = event;
  switch (data?.event) {
    case 'canplay':
    case 'play':
    case 'pause':
      dispatchCustomEvent(currentTarget, data.event, null, {
        bubbles: true,
        cancelable: false,
      });
      break;
  }
}

function FantasticPlayerWithRef(
  {videoId, ...rest},
  ref
) {
  // ...
  return (
    <VideoIframe
      {...rest}
      onMessage={onMessage}
      ...
    />
  );
}
```

### Use `VideoWrapper` directly

> **If you need an iframe, you should ignore this section and use `VideoIframe` instead.** It requires less work and likely provides all you need. Read on if you're sure that you need to write to a host document directly to create `<video>` elements, or otherwise manage frames manually (like creating proxy frames).

Your `FantasticPlayer` component should return a `VideoWrapper` that's configured to a corresponding `postMessage` API. To start, we update the implementation in **`component.js`**.

```diff
- import {ContainWrapper} from '../../../src/preact/component';
+ import {VideoWrapper} from '../../amp-video/1.0/video-wrapper';

  function FantasticPlayerWithRef({...rest}, ref) {
-   ...
    return (
-     <ContainWrapper layout size paint {...rest} >
-       ...
-     </ContainWrapper>
+     <VideoWrapper component="video" />
    );
  }
```

So that our component returns a `<VideoWrapper>`:

```js
import {VideoWrapper} from '../../amp-video/1.0/video-wrapper';

// ...
function FantasticPlayerWithRef({...rest}, ref) {
  return <VideoWrapper component="video" />;
}
```

We're specifying `"video"` as the element to render, which is also the default. We'll llater change this into our own component implementation.

You should add allow one more cross-extension import for `VideoWrapper`. Following the previous location on **`dep-check-config.js`**, we add:

```diff
  allowlist: [
    ...
    // Bento MyFantasticPlayer, amp-my-fantastic-player
    'extensions/amp-my-fantastic-player/1.0/base-element.js->extensions/amp-video/1.0/base-element.js',
+   'extensions/amp-my-fantastic-player/1.0/component.js->extensions/amp-video/1.0/video-wrapper.js',
  ],
```

#### Specifying `component`

The `VideoWrapper` must interact with an element that implements the `HTMLMediaInterface` like `<video>`, or a Preact component that emulates the same interface.

For example, we may set `component={RandomVideo}`, where the specified function renders its own video from a randomly selected `src`.

By passing the `ref` through, we're able to call methods like `play()` from `FantasticPlayer` on the `<video>` element itself. By passing the `...rest` of the props we make sure that `src` is set, in addition to listening to playback events through props like `onPlay`.

```js
function FantasticPlayerInternalWithRef({sources, ...rest}, ref) {
  return (
    <div>
      <video ref={ref} {...rest}>
        {sources}
      </video>
    </div>
  );
}

const FantasticPlayerInternal = forwardRef(FantasticPlayerInternalWithRef);

// ...

function FantasticPlayerWithRef({...rest}, ref) {
  return <VideoWrapper {...rest} component={RandomVideo} />;
}
```

#### Passing or overriding props

In the previous example, props received from the `VideoWrapper` are implicitly set through `...rest`. If we set each explicitly, we see the `HTMLMediaInterface` attributes and events handled.

```js
function FantasticPlayerInternalWithRef(
  {
    muted,
    loop,
    controls,
    onCanPlay,
    onLoadedMetadata,
    onPlaying,
    onPause,
    onEnded,
    onError,
    src,
    poster,
    style,
    sources,
  },
  ref
) {
  return (
    <div>
      <video
        ref={ref}
        muted={muted}
        loop={loop}
        controls={controls}
        onCanPlay={onCanPlay}
        onLoadedMetadata={onLoadedMetadata}
        onPlaying={onPlaying}
        onPause={onPause}
        onEnded={onEnded}
        onError={onError}
        src={src}
        poster={poster}
        style={style}
      >
        {sources}
      </video>
    </div>
  );
}
```

We can wrap playback events set on these props to dispatch them. For example, by wrapping `onCanPlay` we may mediate the `canplay` event by delaying it by 500 milliseconds:

```js
const onVideoCanPlay = useCallback((e) => {
  setTimeout(() => {
    onCanPlay(e);
  }, 500);
}, [onCanPlay]);
```

We set the wrapped method as the `<video>`'s actual event handler:

```diff
  <video
    ref={ref}
-   onCanPlay={onCanPlay}
+   onCanPlay={onVideoCanPlay}
```

You may similarly choose to pass or override properties at the higher level, passed from `FantasticPlayer` into the `VideoWrapper` we instantiate. For a list of these properties [see `video-wrapper.type.js`](../extensions/amp-video/1.0/video-wrapper.type.js)

#### Imperative handle

AMP actions execute methods on the Preact component because they `forwardRef` to an element that defines them, or because they define them with [`useImperativeHandle`](https://reactjs.org/docs/hooks-reference.html#useimperativehandle). Methods executed down the Preact component chain cascade the same way.

When we click the following button on an AMP document:

```html
<button on="tap: my-fantastic-player.play">
  Play
</button>
```

We call the corresponding function `play`:

```
-> FantasticPlayer.play()
```

> The AMP action `my-element.play` is declared to be forwarded to the Preact component's method. See the [`init()` method on `VideoBaseElement`](../extensions/amp-video/1.0/base-element.js) for a list of the supported actions.

Since we don't call `useImperativeHandle` at this layer, its `ref` forwards to `VideoWrapper`:

```
-> FantasticPlayer.play()
-> (forwardRef) VideoWrapper.play()
```

`VideoWrapper` sets an imperative handle that explicitly calls `component.play()`:

```
-> FantasticPlayer.play()
-> (forwardRef) VideoWrapper.play()
  -> (imperativeHandle) component.play()
```

If `component` is a `<video>`, then the method is called direclty. If it's our `FantasticPlayerInternal` as we defined earlier, it may either `forwardRef` to a `<video>` or implement its own imperative handle.

```
-> FantasticPlayer.play()
-> (forwardRef) VideoWrapper.play()
  -> (imperativeHandle) component.play()
  -> (forwardRef) <video>.play()
```

Methods can be defined with `useImperativeHandle` at the `component` implementation. We no longer forward our `ref` to the `<video>`, we use it to define the imperative handle instead. Downstream methods on the `<video>` element are executed explicitly through a local `videoRef`.

> The methods and getters listed are the current requirements from `VideoWrapper`. Note that video players on Bento are in active development, so this list might expand in the future.

```js
function FantasticPlayerInternalWithRef({sources, ...rest}, ref) {
  const videoRef = useRef(null);

  useImperativeHandle(() => {
    return {
      play() {
        videoRef.current.play();
      },
      pause() {
        videoRef.current.pause();
      },
      requestFullscreen() {
        videoRef.current.requestFullscreen();
      },
      get readyState() {
        return videoRef.current.readyState;
      },
      get currentTime() {
        return videoRef.current.currentTime;
      },
      get duration() {
        return videoRef.current.duration;
      },
    }
  }, []);

  return (<video ref={videoRef} {...rest}>{sources}</video>)
}
```

## Completing your extension

Follow the [guide to Building a Bento AMP Component](./building-a-bento-amp-extension.md) for other instructions that you should complete, including:

-   **Documentation** that describes the component.
-   **Tests** that verify the component's functionality.
-   **Validator rules** to embed the component in an AMP document.
-   **An example** to our Storybook or to be published on [amp.dev](https://amp.dev/)

## Example Pull Requests

-   [amp-video](https://github.com/ampproject/amphtml/pull/30280)
-   [amp-youtube](https://github.com/ampproject/amphtml/pull/30444)
-   [amp-vimeo](https://github.com/ampproject/amphtml/pull/33971)
