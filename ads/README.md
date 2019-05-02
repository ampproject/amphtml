# Integrating ad networks into AMP

This guide provides details for ad networks to create an `amp-ad` integration for their network.

**Table of contents**

- [Overview](#overview)
- [Constraints](#constraints)
- [The iframe sandbox](#the-iframe-sandbox)
    - [Available information](#available-information)
    - [Available APIs](#available-apis)
    - [Exceptions to available APIs and information](#exceptions-to-available-apis-and-information)
    - [Ad viewability](#ad-viewability)
    - [Ad resizing](#ad-resizing)
    - [Support for multi-size ad requests](#support-for-multi-size-ad-requests)
    - [Optimizing ad performance](#optimizing-ad-performance)
    - [Ad markup](#ad-markup)
    - [1st party cookies](#1st-party-cookies)
- [Developer guidelines for a pull request](#developer-guidelines-for-a-pull-request)
    - [Files to change](#files-to-change)
    - [Verify your examples](#verify-your-examples)
    - [Tests](#tests)
    - [Other tips](#other-tips)
- [Developer announcements for ads related API changes ](#developer-announcements-for-ads-related-API-changes)

## Overview
Ads are just another external resource and must play within the same constraints placed on all resources in AMP. The AMP Project aims to support a large subset of existing ads with little or no changes to how the integrations work. AMP Project's long term goal is to further improve the impact of ads on the user experience through changes across the entire vertical client side stack. Although technically feasible, do not use amp-iframe to render display ads. Using amp-iframe for display ads breaks ad clicks and prevents recording viewability information.

If you are an ad technology provider looking to integrate with AMP HTML, please also check the [general 3P inclusion guidelines](../3p/README.md#ads) and [ad service integration guidelines](./_integration-guide.md).

## Constraints

Below is a summary of constraints placed on external resources, such as ads in AMP HTML:

- Because AMP pages are served on HTTPS and ads cannot be proxied, ads must be served over HTTPS.
- The size of an ad unit must be static. It must be knowable without fetching the ad and it cannot change at runtime except through [iframe resizing](#ad-resizing).
- If placing the ad requires running JavaScript (assumed to be true for 100% of ads served through networks), the ad must be placed on an origin different from the AMP document itself. Reasons include:
  - Improved security.
  - Takes synchronous HTTP requests made by the ad out of the critical rendering path of the primary page.
  - Allows browsers to run the ad in a different process from the primary page (even better security and prevents JS inside the ad to block the main page UI thread).
  - Prevents ads doing less than optimal things to measure user behavior and other interference with the primary page.
- The AMP Runtime may at any moment decide that there are too many iframes on a page and that memory is low. In that case, the AMP Runtime unloads ads that were previously loaded and are no longer visible. It may later load new ads in the same slot if the user scrolls them back into view.
- The AMP Runtime may decide to set an ad that is currently not visible to `display: none` to reduce browser layout and compositing cost.

## The iframe sandbox

The ad itself is hosted within a document that has an origin different from the primary page. By default, the iframe loads a [bootstrap HTML](../3p/frame.max.html), which provides a container `div` to hold your content together with a set of APIs. Note that the container `div` (with `id="c"`) is absolute positioned and takes the whole space of the iframe, so you will want to append your content as a child of the container (don't append to `body`).

### Available information to the ad

The AMP runtime provides the following information to the ad:

<dl>
  <dt>ad viewability</dt>
  <dd>For details, see the <a href="#ad-viewability">ad viewability</a> section below.</dd>
  <dt><code>window.context.canonicalUrl</code></dt>
  <dd>Contains the canonical URL of the primary document as defined by its <code>link rel=canonical</code> tag.</dd>
  <dt><code>window.context.clientId</code></dt>
  <dd>Contains a unique id that is persistently the same for a given user and AMP origin site in their current browser until local data is deleted or the value expires (expiration is currently set to 1 year).
  <ul>
    <li>Ad networks must register their cid scope in the <code>clientIdScope</code> variable <a href="./_config.js">_config.js</a>. Use <code>clientIdCookieName</code> to provide a cookie name for non-proxy case, otherwise value of <code>clientIdScope</code> is used.</li>
    <li>Only available on pages that load <code>amp-analytics</code>. The clientId is null if <code>amp-analytics</code> isn't loaded on the given page.</li>
  </ul>
  </dd>
  <dt><code>window.context.container</code></dt>
  <dd>Contains the ad container extension name if the current ad slot has one as its DOM ancestor. An valid ad container is one of the following AMP extensions: <code>amp-sticky-ad</code>, <code>amp-fx-flying-carpet</code>, <code>amp-lightbox`</code>. As they provide non-trivial user experience, ad networks might want to use this info to select their serving strategies.</dd>
  <dt><code>window.context.domFingerprint</code></dt>
  <dd>Contains a string key based on where in the page the ad slot appears. Its purpose is to identify the same ad slot across many page views. It is formed by listing the ancestor tags and their ordinal position, up to 25 levels. For example, if its value is <code>amp-ad.0,td.1,tr.0,table.0,div/id2.0,div/id1.0</code> this would mean the first amp-ad child of the second td child of the first tr child of... etc.</dd>
  <dt><code>window.context.location</code></dt>
  <dd>Contains the sanitized  <code>Location</code> object of the primary document. This object contains keys like <code>href</code>, <code>origin</code> and other keys common for <a href="https://developer.mozilla.org/en-US/docs/Web/API/Location">Location</a> objects. In browsers that support <code>location.ancestorOrigins</code> you can trust that the <code>origin</code> of the location is actually correct (so rogue pages cannot claim they represent an origin they do not actually represent).</dd>
  <dt><code>window.context.pageViewId</code></dt>
  <dd>Contains a relatively low entropy id that is the same for all ads shown on a page.</dd>
  <dt><code>window.context.referrer</code></dt>
  <dd>Contains the origin of the referrer value of the primary document if available.
    <ul>
    <li><code>document.referrer</code> typically contains the URL of the primary document. This may change in the future (See <code>window.context.location</code> for a more reliable method).</li>
    </ul>
  </dd>
  <dt><code>window.context.sourceUrl</code></dt>
  <dd>Contains the source URL of the original AMP document. See details <a href="../spec/amp-var-substitutions.md#source-url">here</a></code>.</dd>
  <dt><code>window.context.startTime</code></dt>
  <dd>Contains the time at which processing of the amp-ad element started.</dd>
</dl>

More information can be provided in a similar fashion if needed (Please file an issue).

### Available APIs

<dl>
  <dt><code>window.context.getHtml (selector, attrs, callback)</code></dt>
  <dd>Retrieves the specified node's content from the parent window which cannot be accessed directly because of security restrictions caused by AMP rules and iframe's usage. <code>selector</code> is a CSS selector of the node to take content from. <code>attrs</code> takes an array of tag attributes to be left in the stringified HTML representation (for instance, <code>['id', 'class']</code>). All not specified attributes will be cut off from the result string. <code>callback</code> takes a function to be called when the content is ready. <code>getHtml</code> invokes callback with the only argument of type string.<p>This API is by default disabled. To enable it, the `amp-ad` needs to put attribute <code>data-html-access-allowed</code> to explicitly opt-in.</dd>
  <dt><code>window.context.noContentAvailable()</code></dt>
  <dd>Informs the AMP runtime that the ad slot cannot be filled. The ad slot will then display the fallback content if provided, otherwise tries to collapse the ad slot.</dd>
  <dt><code>window.context.renderStart(opt_data)</code></dt>
  <dd>Informs the AMP runtime when the ad starts rendering. The ad will then become visible to user. The optional param <code>opt_data</code> is an object of form <code>{width, height}</code> to request an <a href="#ad-resizing">ad resize</a> if the size of the returned ad doesn't match the ad slot. To enable this method, add a line <code>renderStartImplemented=true</code> to the corresponding ad config in <a href="./_config.js">_config.js</a>.</dd>
  <dt><code>window.context.reportRenderedEntityIdentifier()</code></dt>
  <dd>MUST be called by ads, when they know information about which creative was rendered into a particular ad frame and should contain information to allow identifying the creative. Consider including a small string identifying the ad network. This is used by AMP for reporting purposes. The value MUST NOT contain user data or personal identifiable information.</dd>
</dl>


### Exceptions to available APIs and information

Depending on the ad server / provider, some methods of rendering ads involve a second iframe inside the AMP iframe. In these cases, the iframe sandbox methods and information will be unavailable to the ad. The AMP Project is working on a creative-level API that will enable this information to be accessible in such iframed cases, and this README will be updated when that is available. Refer to the documentation for the relevant ad servers / providers (e.g., [doubleclick.md](./google/doubleclick.md)) for more details on how to handle such cases.

### Ad viewability

#### Position in viewport

Ads can call the special `window.context.observeIntersection(changesCallback)`API to receive IntersectionObserver style [change records](https://github.com/w3c/IntersectionObserver/blob/master/explainer.md) of the ad's intersection with the parent viewport.

The API allows you to specify a callback that fires with change records when AMP observes that an ad becomes visible and then while it is visible, changes are reported as they happen.

*Example usage*:

```javascript
window.context.observeIntersection(function(changes) {
  changes.forEach(function(c) {
    console.info('Height of intersection', c.intersectionRect.height);
  });
});
```

`window.context.observeIntersection` returns a function which when called will stop listening for intersection messages.

*Example usage*

```javascript
var unlisten = window.context.observeIntersection(function(changes) {
  changes.forEach(function(c) {
    console.info('Height of intersection', c.intersectionRect.height);
  });
});

// condition to stop listening to intersection messages.
unlisten();
```

##### Initial layout rect

The value `window.context.initialLayoutRect` contains the initial rect of the ad's position in the page.

##### Initial viewport intersection

The value `window.context.initialIntersection` contains the initial viewport intersection record at the time the iframe was created.

#### Page visibility

AMP documents may be practically invisible without the visibility being reflected by the [page visibility API](https://developer.mozilla.org/en-US/docs/Web/API/Page_Visibility_API). This is primarily the case when a document is swiped away or being prerendered.

Whether a document is actually being visible can be queried using:

`window.context.hidden` which is true if the page is not visible as per page visibility API or because the AMP viewer currently does not show it.

Additionally, one can observe the `amp:visibilitychange` on the `window` object to be notified about changes in visibility.

### Ad resizing

Ads can call the special API
`window.context.requestResize(width, height, opt_hasOverflow)` to send a resize request.

Once the request is processed the AMP runtime will try to accommodate this request as soon as
possible, but it will take into account where the reader is currently reading, whether the scrolling
is ongoing and any other UX or performance factors.

Ads can observe whether resize request were successful using the `window.context.onResizeSuccess` and `window.context.onResizeDenied` methods.

The `opt_hasOverflow` is an optional boolean value, ads can specify `opt_hasOverflow` to `true` to let AMP runtime know that the ad context can handle overflow when attempt to resize is denied, and not to throw warning in such cases.

*Example:*

```javascript
var unlisten = window.context.onResizeSuccess(function(requestedHeight, requestedWidth) {
  // Hide any overflow elements that were shown.
  // The requestedHeight and requestedWidth arguments may be used to
  // check which size change the request corresponds to.
});

var unlisten = window.context.onResizeDenied(function(requestedHeight, requestedWidth) {
  // Show the overflow element and send a window.context.requestResize(width, height)
  // when the overflow element is clicked.
  // You may use the requestedHeight and requestedWidth to check which
  // size change the request corresponds to.
});
```

Here are some factors that affect whether the resize will be executed:

- Whether the resize is triggered by the user action;
- Whether the resize is requested for a currently active ad;
- Whether the resize is requested for an ad below the viewport or above the viewport.

#### Specifying an overflow element

You can specify an `overflow` element that is only shown when a resize request is declined. When the user clicks the overflow element, the resize passes the "interaction" rule and will resize.

*Example: Using an `overflow` element*

```html
<amp-ad type="...">
  <div overflow>Click to resize</div>
  <!-- whatever else -->
</amp-ad>
```

### Support for multi-size ad requests

Allowing more than a single ad size to fill a slot improves ad server competition. Increased competition gives the publisher better monetization for the same slot, therefore increasing overall revenue earned by the publisher.

To support multi-size ad requests, AMP accepts an optional `data` param to `window.context.renderStart` (details in [Available APIs](#available-apis) section) which will automatically invoke request resize with the width and height passed.

In case the resize is not successful, AMP will horizontally and vertically center align the creative within the space initially reserved for the creative.

*Example:*

```javascript
// Use the optional param to specify the width and height to request resize.
window.context.renderStart({width: 200, height: 100});
```

Note that if the creative needs to resize on user interaction, the creative can continue to do that by calling the `window.context.requestResize(width, height, opt_hasOverflow)` API. Details in [Ad Resizing](#ad-resizing).

### amp-consent integration
If [amp-consent](https://github.com/ampproject/amphtml/blob/master/extensions/amp-consent/amp-consent.md) extension is used on the page, `data-block-on-consent` attribute
can be added to `amp-ad` element to respect the corresponding `amp-consent` policy.
In that case, the `amp-ad` element will be blocked from loading until the consent accepted.
Individual ad network can override this default consent handling by putting a `consentHandlingOverride: true` in `ads/_config.js`.
Doing so will unblock the ad loading once the consent is responded. It will be then the ad network's responsibility
to respect user's consent choice, for example to serve non-personalized ads on consent rejection.
AMP runtime provides the following `window.context` APIs for ad network to access the consent state.

<dl>
  <dt><code>window.context.initialConsentState</code></dt>
  <dd>
    Provides the initial consent state when the ad is unblocked.
    The states are integers defined <a href="https://github.com/ampproject/amphtml/blob/master/extensions/amp-consent/customizing-extension-behaviors-on-consent.md#advanced-blocking-behaviors">here</a>
    (<a href="https://github.com/ampproject/amphtml/blob/master/src/consent-state.js#L23">code</a>).
  </dd>
  <dt><code>window.context.getConsentState(callback)</code></dt>
  <dd>
    Queries the current consent state asynchronously. The `callback` function
    will be invoked with the current consent state.
  </dd>
  <dt><code>window.context.consentSharedData</code></dt>
  <dd>
    Provides additional user privacy related data retrieved from publishers.
    See <a href="https://github.com/ampproject/amphtml/blob/master/extensions/amp-consent/amp-consent.md#response">here</a> for details.
  </dd>
</dl>

After overriding the default consent handling behavior, don't forget to update your publisher facing
 documentation with the new behaviors on user's consent choices. You can refer to our documentation example [here](https://github.com/ampproject/amphtml/blob/master/ads/_ping_.md#user-consent-integration).

### Optimizing ad performance

#### JS reuse across iframes

To allow ads to bundle HTTP requests across multiple ad units on the same page the object `window.context.master` will contain the window object of the iframe being elected master iframe for the current page. The `window.context.isMaster` property is `true` when the current frame is the master frame.

The `computeInMasterFrame` function is designed to make it easy to perform a task only in the master frame and provide the result to all frames. It is also available to custom ad iframes as `window.context.computeInMasterFrame`. See [3p.js](https://github.com/ampproject/amphtml/blob/master/3p/3p.js) for function signature.

#### Preconnect and prefetch

Add the JS URLs that an ad **always** fetches or always connects to (if you know the origin but not the path) to [_config.js](_config.js).

This triggers prefetch/preconnect when the ad is first seen, so that loads are faster when they come into view.

### Ad markup
Ads are loaded using the `<amp-ad>` tag containing the specified `type`  for the ad netowkr, and name value pairs of configuration.

This is an example for the A9 network:

```html
<amp-ad width="300" height="250"
    type="a9"
    data-aax_size="300x250"
    data-aax_pubname="test123"
    data-aax_src="302">
</amp-ad>
```

and another for DoubleClick:

```html
<amp-ad width="320" height="50"
    type="doubleclick"
    json="{…}">
</amp-ad>
```

For ad networks that support loading via a single script tag, this form is supported:

```html
<amp-ad width=300 height=250
    type="adtech"
    src="https://adserver.adtechus.com/addyn/3.0/5280.1/2274008/0/-1/ADTECH;size=300x250;key=plumber;alias=careerbear-ros-middle1;loc=300;;target=_blank;grp=27980912;misc=3767074">
</amp-ad>
```

Note, that the network still needs to be white-listed and provide a prefix to valid URLs. The AMP Project may add similar support for ad networks that support loading via an iframe tag.

Technically, the `<amp-ad>` tag loads an iframe to a generic bootstrap URL that knows how to render the ad given the parameters to the tag.

### 1st party cookies

Access to a publisher's 1st party cookies may be achieved through a custom ad bootstrap file. See ["Running ads from a custom domain"](https://amp.dev/documentation/components/amp-ad#running-ads-from-a-custom-domain) in the ad documentation for details.

If the publisher would like to add custom JavaScript in the `remote.html` file that wants to read or write to the publisher owned cookies, then the publisher needs to ensure that the `remote.html` file is hosted on a sub-domain of the publisher URL. For example, if the publisher hosts a webpage on `https://nytimes.com`, then the remote file should be hosted on something similar to `https://sub-domain.nytimes.com` for the custom JavaScript to have the ability to read or write cookies for nytimes.com.

## Developer guidelines for a pull request

Please read through [DEVELOPING.md](../contributing/DEVELOPING.md) before contributing to this code repository.

### Files to change

If you're adding support for a new third-party ad service, changes to the following files are expected:

- `/ads/yournetwork.js`: Implement the main logic here. This is the code that's invoked in the third-party iframe once loaded.
- `/ads/yournetwork.md`: Documentation detailing yourr ad service for publishers to read.
- `/ads/_config.js`: Add service specific configuration here.
- `/3p/integration.js`: Register your service here.
- `/extensions/amp-ad/amp-ad.md`: Add a link that points to your publisher doc.
- `/examples/ads.amp.html`: Add publisher examples here. Since a real ad isn't guaranteed to fill, a consistently displayed fake ad is highly recommended here to help AMP developers confidently identify new bugs.

### Verify your examples

To verify the examples that you have put in `/examples/ads.amp.html`:

1. Start a local gulp web server by running command `gulp`.
2. Visit `http://localhost:8000/examples/ads.amp.html?type=yournetwork` in your browser to make sure the examples load ads.

Please consider having the example consistently load a fake ad (with ad targeting disabled). Not only will it be a more confident example for publishers to follow, but also allows the AMP team to catch any regression bug during AMP releases.

It's encouraged that you have multiple examples to cover different use cases.

Please verify your ad is fully functioning, for example, by clicking on an ad. We have seen bugs reported for ads not being clickable, which was due to incorrectly appended content divs.

### Tests

Please make sure your changes pass the tests:

```
gulp test --watch --nobuild --files=test/unit/{test-ads-config.js,test-integration.js}

```

If you have non-trivial logic in `/ads/yournetwork.js`, adding a unit test at `/test/unit/ads/test-yournetwork.js` is highly recommended.

### Lint and type-check

To speed up the review process, please run `gulp lint` and `gulp check-types`, then fix errors, if any, before sending out the PR.

### Other tips

- It's highly recommended to maintain [an integration test outside AMP repo](../3p/README.md#adding-proper-integration-tests).
- Please consider implementing the `render-start` and `no-content-available` APIs (see [Available APIs](#available-apis)), which helps AMP to provide user a much better ad loading experience.
- [CLA](../CONTRIBUTING.md#contributing-code): for anyone who has trouble to pass the automatic CLA check in a pull request, try to follow the guidelines provided by the CLA Bot. Common mistakes are:
  1. Using a different email address in the git commit.
  2. Not providing the exact company name in the PR thread.

## Developer announcements for ads related API changes

For any major Ads API related changes that introduce new functionality or cause backwards compatible changes, the AMP Project will notify the [amp-ads-announce@googlegroups.com](https://groups.google.com/d/forum/amp-ads-announce) at least 2 weeks in advance to make sure you have enough time to absorb those changes.
