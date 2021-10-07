---
$category@: layout
formats:
  - websites
teaser:
  text: Displays an iframe.
---

# amp-iframe

## Usage

Displays an AMP valid iframe. `amp-iframe` has several important differences from vanilla iframes that are
designed to make it more secure and avoid AMP files that are dominated by a
single iframe:

-   An `amp-iframe` may not appear close to the top of the document (except for
    iframes that use `placeholder` as described
    [below](#iframe-with-placeholder)). The iframe must be either 600 px away
    from the top or not within the first 75% of the viewport when scrolled to
    the top, whichever is smaller.
-   By default, an `amp-iframe` is sandboxed (see [details](#sandbox)).
-   An `amp-iframe` must only request resources via HTTPS, from a data-URI, or
    via the `srcdoc` attribute.
-   An `amp-iframe` must not be in the same origin as the container unless they
    do not allow `allow-same-origin` in the `sandbox` attribute. See the
    ["Iframe origin policy"](../../../docs/spec/amp-iframe-origin-policy.md)
    doc for further details on allowed origins for iframes.

```html
<amp-iframe
  width="200"
  height="100"
  sandbox="allow-scripts allow-same-origin"
  layout="responsive"
  frameborder="0"
  src="https://www.google.com/maps/embed/v1/place?key=AIzaSyAyAS599A2GGPKTmtNr9CptD61LE4gN6oQ&q=iceland"
>
</amp-iframe>
```

<amp-iframe width="200" height="100"
    sandbox="allow-scripts allow-same-origin"
    layout="responsive"
    frameborder="0"
    src="https://www.google.com/maps/embed/v1/place?key=AIzaSyAyAS599A2GGPKTmtNr9CptD61LE4gN6oQ&q=iceland">
</amp-iframe>

### Use existing AMP components instead of `amp-iframe`

The `amp-iframe` component should be considered a fallback if the required user
experience is not possible by other means in AMP, that is, there's not already
an existing AMP component
for the use case. This is because there are many benefits to using an AMP
component tailored for a specific use-case such as:

-   Better resource management and performance
-   Custom components can provide built-in placeholder images in some cases.
    This means getting, say, the right video thumbnail before a video loads, and
    reduces the coding effort to add a placeholder manually.
-   Built-in resizing. This means that iframe content with unpredictable size
    can more often appear to the user as if it were native to the page, rather
    than in a scrollable frame
-   Other additional features can be built in (for instance, auto-play for video
    players)

#### Usage of `amp-iframe` for advertising

`amp-iframe` **must not** be used for the primary purpose of displaying
advertising. It is OK to use `amp-iframe` for the purpose of displaying videos,
where part of the videos are advertising. This AMP policy may be enforced by not
rendering the respective iframes.

Advertising use cases should use
[`amp-ad`](../../amp-ad/amp-ad.md) instead.

The reasons for this policy are that:

-   `amp-iframe` enforces sandboxing and the sandbox is also applied to child
    iframes. This means landing pages may be broken, even if the ad itself
    appears to work.
-   `amp-iframe` does not provide any mechanism to pass configuration to the
    iframe.
-   `amp-iframe` has no fully iframe controlled resize mechanism.
-   Viewability information may not be available to `amp-iframe`.

### Iframe with placeholder <a name="iframe-with-placeholder"></a>

It is possible to have an `amp-iframe` appear at the top of a document when the
`amp-iframe` has a `placeholder` element as shown in the example below.

-   The `amp-iframe` must contain an element with the `placeholder` attribute,
    (for instance an `amp-img` element) which would be rendered as a placeholder
    until the iframe is ready to be displayed.
-   Iframe readiness can be known by listening to `onload` of the iframe or an
    `embed-ready` `postMessage`, which would be sent by the iframe document,
    whichever comes first.

The following example shows an iframe with a placeholder:

```html
<amp-iframe
  width="300"
  height="300"
  layout="responsive"
  sandbox="allow-scripts allow-same-origin"
  src="https://foo.com/iframe"
>
  <amp-img layout="fill" src="https://foo.com/foo.png" placeholder></amp-img>
</amp-iframe>
```

The following example shows an iframe with an embed-ready request:

```javascript
window.parent.postMessage(
  {
    sentinel: 'amp',
    type: 'embed-ready',
  },
  '*'
);
```

### Iframe resizing

An `amp-iframe` must have static layout defined as is the case with any other
AMP element. However, it's possible to resize an `amp-iframe` at runtime. To do
so:

1.  The `amp-iframe` must be defined with the `resizable` attribute.
2.  The `amp-iframe` must have an `overflow` child element. This element can typically be a `div`. However, if the `amp-iframe` is child of a `p` element, it is recommended to use a `span` or `button` (to eliminate issues caused by `p` element's [phrasing content](https://html.spec.whatwg.org/#phrasing-content)).
3.  The `amp-iframe` must set the `allow-same-origin` sandbox attribute.
4.  The iframe document must send an `embed-size` request as a window message.
5.  The `embed-size` request will be denied if the request height is less than a
    certain threshold (100px).

Notice that `resizable` overrides the value of `scrolling` to `no`.

The following example shows `amp-iframe` with an `overflow` element:

```html
<amp-iframe
  width="300"
  height="300"
  layout="responsive"
  sandbox="allow-scripts allow-same-origin"
  resizable
  src="https://foo.com/iframe"
>
  <div overflow tabindex="0" role="button" aria-label="Read more">
    Read more!
  </div>
</amp-iframe>
```

The following example shows an iframe resize request:

```javascript
window.parent.postMessage(
  {
    sentinel: 'amp',
    type: 'embed-size',
    height: document.body.scrollHeight,
  },
  '*'
);
```

Once this message is received, the AMP runtime tries to accommodate the request
as soon as possible, but it takes into account where the reader is currently
reading, whether the scrolling is ongoing and any other UX or performance
factors. If the runtime cannot satisfy the resize request, the `amp-iframe` will
show an `overflow` element. Clicking on the `overflow` element will immediately
resize the `amp-iframe` since it's triggered by a user action.

Here are some factors that affect how fast the resize will be executed:

-   Whether the resize is triggered by the user action.
-   Whether the resize is requested for a currently active iframe.
-   Whether the resize is requested for an iframe below the viewport or above
    the viewport.

### Iframe viewability

Iframes can send a `send-intersections` message to their parents to start
receiving `IntersectionObserver` style
[change records](https://developer.mozilla.org/en-US/docs/Web/API/IntersectionObserverEntry)
of the iframe's intersection with the parent viewport.

[tip type="note"]

In the following examples, we assume the script is in the created iframe, where
`window.parent` is the top window. If the script lives in a nested iframe,
change `window.parent` to the top AMP window.

[/tip]

The following example shows an iframe `send-intersections` request:

```javascript
window.parent.postMessage(
  {
    sentinel: 'amp',
    type: 'send-intersections',
  },
  '*'
);
```

The iframe can listen to an `intersection` message from the parent window to
receive the intersection data.

The following example shows an iframe `send-intersections` request:

```javascript
function isAmpMessage(event, type) {
  return (
    event.source == window.parent &&
    event.origin != window.location.origin &&
    event.data &&
    event.data.sentinel == 'amp' &&
    event.data.type == type
  );
}
window.addEventListener('message', function (event) {
  if (!isAmpMessage(event, 'intersection')) {
    return;
  }
  event.data.changes.forEach(function (change) {
    console.log(change);
  });
});
```

The intersection message would be sent by the parent to the iframe in the format of IntersectionObserver entry wheneve there is intersectionRatio change across thresholds [0, 0.05, 0.1, ... 0.9, 0.95, 1].

## Iframe & Consent Data

Iframes can send a `send-consent-data` message to receive consent data if a CMP is present on their parents page.

_Note: In the following examples, we assume the script is in the created iframe, where `window.parent` is the top window. If the script lives in a nested iframe, change `window.parent` to the top AMP window._

_Example: iframe `send-consent-data` request_

```javascript
window.parent.postMessage(
  {
    sentinel: 'amp',
    type: 'send-consent-data',
  },
  '*'
);
```

The iframe can receive the consent data response by listening to the `consent-data` message.

**Please note:**

-   The `consent-data` response will only be sent once and won't update the iframe when the consent state changes (for example when the user decides to reject consent by using the post prompt ui)
-   When omitting `data-block-on-consent` the `default` policy is used and the iframe will be loaded immediately. The `consent-data` response may be delayed based on the selected policy. See [`amp-consent`](../../amp-consent/amp-consent.md) for more information.

_Example: iframe `send-consent-data` request_

```javascript
function isAmpMessage(event, type) {
  return (
    event.source == window.parent &&
    event.origin != window.location.origin &&
    event.data &&
    event.data.sentinel == 'amp' &&
    event.data.type == type
  );
}
window.addEventListener('message', function (event) {
  if (!isAmpMessage(event, 'consent-data')) {
    return;
  }
  console.log(event.data.consentMetadata);
  console.log(event.data.consentString);
});
```

## Attributes

### `src`

The `src` attribute behaves mainly like on a standard iframe with one exception:
the `#amp=1` fragment is added to the URL to allow source documents to know that
they are embedded in the AMP context. This fragment is only added if the URL
specified by `src` does not already have a fragment.

### `srcdoc`, `frameborder`, `allowfullscreen`, `allowpaymentrequest`, `allowtransparency`, and `referrerpolicy`

These attributes should all behave like they do on standard iframes.

If `frameborder` is not specified, by default, it will be set to `0`.

### `sandbox` <a name="sandbox"></a>

Iframes created by `amp-iframe` always have the `sandbox` attribute defined on
them. By default, the value is empty, which means that they are "maximum
sandboxed". By setting `sandbox` values, one can opt the iframe into being less
sandboxed. All values supported by browsers are allowed. For example, setting
`sandbox="allow-scripts"` allows the iframe to run JavaScript, or
`sandbox="allow-scripts allow-same-origin"` allows the iframe to run JavaScript,
make non-CORS XHRs, and read/write cookies.

If you are iframing a document that was not specifically created with sandboxing
in mind, you will most likely need to add `allow-scripts allow-same-origin` to
the `sandbox` attribute and you might need to allow additional capabilities.

Note also, that the sandbox applies to all windows opened from a sandboxed
iframe. This includes new windows created by a link with `target=_blank` (add
`allow-popups` to allow this to happen). Adding `allow-popups-to-escape-sandbox`
to the `sandbox` attribute, makes those new windows behave like non-sandboxed
new windows. This is likely most of the time what you want and expect.
Unfortunately, as of this writing, `allow-popups-to-escape-sandbox` is supported
by Chrome, Firefox, Safari and Opera but not Edge.

See the [docs on MDN](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/iframe#attr-sandbox)
for further details on the `sandbox` attribute.

### Common attributes

`amp-iframe` includes the
[common attributes](https://amp.dev/documentation/guides-and-tutorials/learn/common_attributes)
extended to AMP components.

## Analytics

We strongly recommend using
[`amp-analytics`](../../amp-analytics/amp-analytics.md) for
analytics purposes, because it is significantly more robust, complete and an
efficient solution which can be configured for a wide range of analytics
vendors.

AMP only allows a single iframe that is used for analytics and tracking
purposes, per page. To conserve resources, these iframes will be removed from
the DOM 5 seconds after they loaded, which should be sufficient time to complete
whatever work is needed to be done.

Iframes are identified as tracking/analytics iframes if they appear to serve no
direct user purpose such as being invisible or small.

## Validation

See [`amp-iframe` rules](../validator-amp-iframe.protoascii)
in the AMP validator specification.
