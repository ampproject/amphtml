# AMP HTML Components

## Overview

The AMP runtime defines a small set of custom elements that can be used in any
AMP file. These custom elements serve two primary purposes:

-   Enable the AMP runtime to manage the loading of external resources, which may
    slow down the initial render or cause jank.
-   Allow AMP authors to include functionality above and beyond standard HTML,
    while maintaining the security- and performance-minded requirement that no author-written JavaScript is executed.

The initial set of elements included in the AMP spec is purposefully minimal,
to keep the payload small. The AMP runtime also allows dynamic loading of additional
ancillary components that have been contributed to the project.

The goal of the AMP components is to provide the correct set of primitives to
AMP authors, such that a wide variety of experiences can be produced using only
declarative HTML and CSS. AMP components are meant to be composed together to
create a more advanced and customized UI.

### Styling/Theming

Styling and theming of AMP-provided components is all done via CSS. See the [AMP Spec](amp-html-format.md) for more detail.

AMP elements can be styled with class or element selectors using most common CSS properties.
Add any styles to an AMP page using a single `<style amp-custom>` tag in the head of the document.
For example:

```html
<!DOCTYPE html>
<html ⚡ lang="en">
  <head>
    <style amp-custom>
      amp-img {
        border: 5px solid black;
      }

      amp-img.grey-placeholder {
        background-color: grey;
      }
    </style>
  </head>

  <body>
    <amp-img src="https://placekitten.com/g/200/300" width="200" height="300">
    </amp-img>

    <amp-img
      class="grey-placeholder"
      src="https://placekitten.com/g/500/300"
      width="500"
      height="300"
    >
    </amp-img>
  </body>
</html>
```

AMP HTML components that are more complex and nested, such as `amp-iframe`,
may define their own custom children that may be styled separately, e.g. iframe's
overflow element. These custom children are typically defined either via special
attribute names such as `placeholder` or `overflow` or AMP class names. For
example:

```html
<!DOCTYPE html>
<html ⚡ lang="en">
  <head>
    <style amp-custom>
      .my-frame > [overflow] {
        background: green;
        opacity: 50%;
      }
    </style>
  </head>

  <body>
    <amp-iframe
      class="my-frame"
      width="300"
      height="300"
      layout="responsive"
      sandbox="allow-scripts"
      resizable
      src="https://foo.com/iframe"
    >
      <div overflow>Read more!</div>
    </amp-iframe>
  </body>
</html>
```

Inline `style` attributes are also allowed. For example:

```html
<p style="color:blue;font-weight:bold;">AMPlify!</p>
```

### Width, Height, and Layout

All externally-loaded resources must have a known height at the time the page is loaded, so that as the resources load in the page doesn’t jump and reflow. Components are provided by the AMP runtime to enable loading these external resources, like `amp-img`, `amp-video`, etc. These components all share the following attributes:

**width**

The width of the component. `width` and `height` attributes imply the aspect ratio of the image, which can then scale with the container.

**height**

The height of the component. `width` and `height` attributes imply the aspect ratio of the image, which can then scale with the container.

**layout**

Defines the way the container is laid out. `layout="responsive"` will let the container scale with the width of the parent container. `layout="nodisplay"` indicates that the component should not be initially displayed by the runtime - for example, for an image that will appear in a lightbox when a trigger is tapped.

### Extended Components

The AMP runtime itself will only build-in the most commonly-used components - additional components must be explicitly included into a AMP document.

The collection of official AMP components is open-source and open to contributions. To be considered for inclusion into the official AMP components, a contributed component must:

-   Use only the API surface area publicly specified by the AMP runtime to work.
-   Be open-sourceable with an Apache 2 license and not minified or obfuscated.
-   Have its behavior completely controllable by the runtime - e.g. not attempt to load resources outside of a timeframe allowed by the AMP runtime.
-   Have a fixed, known aspect ratio at initial page load, except if placed at the bottom of the page.
-   Not attempt to access or manipulate objects outside of the component's immediate ownership - e.g. elements that are not specified by or children of the component.
-   Not cause an AMP file to become invalid as per the AMP specification
-   The author of the component must sign the [Contributor License Agreement](https://github.com/ampproject/amphtml/blob/main/docs/contributing-code.md#contributor-license-agreement).

In the near-term, implementation will focus on the core components, before prioritizing extensibility. The long-term goal of the runtime though is to support this extensibility.

#### Contributing Components

Components may be contributed using the [process for significant changes to AMP](https://github.com/ampproject/amphtml/blob/main/docs/contributing-code.md#process-for-significant-changes).

#### Service-specific Components

A number of AMP components supporting features like ads, analytics, and embeds, may rely on third-party JavaScript provided by a specific service. For example: an analytics component from Google Analytics might need to run logic specific to the GA service, or a Twitter embed may need to run Twitter-specific code. There are three ways these service-specific components can work:

**Arbitrary 3rd Party JavaScript loaded at runtime**

AMP-conforming content may not have any JavaScript. Some components, like embedded ads, may require JavaScript to execute - these may only be used through AMP-provided components like `amp-ad`. The use of AMP-provided components ensures that any arbitrary 3rd-party JavaScript, in an embedded ad for example, must run in a sandboxed iframe.

**Service-specific JavaScript built-in to a component**

Specific services may contribute their own components to the expanded set of AMP components, which can then be loaded by an AMP file at runtime. These components may execute JavaScript in the context of the main page. They must conform to the specification provided in the “[Extended Components](#extended-components)” section in order to be included.

These types of components will be prioritized behind components that are more generalized, to work with a variety of services and endpoints.

**Dynamic components from JSON endpoints**

The AMP component set may provide components that can load data from an arbitrary endpoint at runtime and use that data to affect the layout and appearance of the component. For example, a “related articles” component may fetch JSON from an author-provided URL and use the data to populate a UI component.

In these cases, services may set up endpoints that produce data that conforms to how the component expects data to be returned. That component may then reference the endpoint with a `url` parameter for example, and the service will be effectively incorporated into the page.

## Components

Built-in components include [amp-img](../../src/builtins/amp-img/amp-img.md), [amp-layout](../../src/builtins/amp-layout/amp-layout.md) and [amp-pixel](../../src/builtins/amp-pixel/amp-pixel.md).

AMP HTML extensions include [extended components](../../extensions) and extended templates.
