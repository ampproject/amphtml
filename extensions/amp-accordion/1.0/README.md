# Bento Accordion

Displays content sections that can be collapsed and expanded. This component provides a way for viewers to glance at the content outline and jump to any section. Effective use reduces scrolling needs on mobile devices.

-   A Bento Accordion accepts one or more `<section>` elements as its direct children.
-   Each `<section>` must contain exactly two direct children.
-   The first child in a `<section>` is the heading for that section of the Bento Accordion. It must be a heading element such as `<h1>-<h6>` or `<header>`.
-   The second child in a `<section>` is the expandable/collapsible content.
    -   It can be any tag allowed in [AMP HTML](https://github.com/ampproject/amphtml/blob/main/docs/spec/amp-html-format.md).
-   A click or tap on a `<section>` heading expands or collapses the section.
-   A Bento Accordion with a defined `id` preserves the collapsed or expanded state of each section while the user remains on your domain.

## Web Component

You must include each Bento component's required CSS library to guarantee proper loading and before adding custom styles. Or use the light-weight pre-upgrade styles available inline. See [Layout and style](#layout-and-style).

### Import via npm

```sh
npm install @bentoproject/accordion
```

```javascript
import {defineElement as defineBentoAccordion} from '@bentoproject/accordion';
defineBentoAccordion();
```

### Include via `<script>`

```html
<script type="module" src="https://cdn.ampproject.org/bento.mjs" crossorigin="anonymous"></script>
<script nomodule src="https://cdn.ampproject.org/bento.js" crossorigin="anonymous"></script>
<script type="module" src="https://cdn.ampproject.org/v0/bento-accordion-1.0.mjs" crossorigin="anonymous"></script>
<script nomodule src="https://cdn.ampproject.org/v0/bento-accordion-1.0.js" crossorigin="anonymous"></script>
<link rel="stylesheet" href="https://cdn.ampproject.org/v0/bento-accordion-1.0.css" crossorigin="anonymous">
```

### Example

<!--% example %-->

```html
<!DOCTYPE html>
<html>
  <head>
    <script
      type="module"
      async
      src="https://cdn.ampproject.org/bento.mjs"
    ></script>
    <script nomodule src="https://cdn.ampproject.org/bento.js"></script>
    <script
      type="module"
      async
      src="https://cdn.ampproject.org/v0/bento-accordion-1.0.mjs"
    ></script>
    <script
      nomodule
      async
      src="https://cdn.ampproject.org/v0/bento-accordion-1.0.js"
    ></script>
    <link
      rel="stylesheet"
      type="text/css"
      href="https://cdn.ampproject.org/v0/bento-accordion-1.0.css"
    />
  </head>
  <body>
    <bento-accordion id="my-accordion">
      <section>
        <h2>Section 1</h2>
        <div>Content in section 1.</div>
      </section>
      <section>
        <h2>Section 2</h2>
        <div>Content in section 2.</div>
      </section>
       <!-- Expanded on page load due to attribute: -->
      <section expanded>
        <h2>Section 3</h2>
        <div>Content in section 3.</div>
      </section>
    </bento-accordion>
  </body>
</html>
```

### Interactivity and API usage

Bento components are highly interactive through their API. The `bento-accordion` component API is accessible by including the following script tag in your document:

```javascript
await customElements.whenDefined('bento-accordion');
const api = await accordion.getApi();
```

#### API Example

<!--% example %-->

```html
<!DOCTYPE html>
<html>
  <head>
    <script
      type="module"
      async
      src="https://cdn.ampproject.org/bento.mjs"
    ></script>
    <script nomodule src="https://cdn.ampproject.org/bento.js"></script>
    <script
      type="module"
      async
      src="https://cdn.ampproject.org/v0/bento-accordion-1.0.mjs"
    ></script>
    <script
      nomodule
      async
      src="https://cdn.ampproject.org/v0/bento-accordion-1.0.js"
    ></script>
    <link
      rel="stylesheet"
      type="text/css"
      href="https://cdn.ampproject.org/v0/bento-accordion-1.0.css"
    />
  </head>
  <body>
    <bento-accordion id="my-accordion">
      <section>
        <h2>Section 1</h2>
        <div>Content in section 1.</div>
      </section>
      <section>
        <h2>Section 2</h2>
        <div>Content in section 2.</div>
      </section>
       <!-- Expanded on page load due to attribute: -->
      <section expanded>
        <h2>Section 3</h2>
        <div>Content in section 3.</div>
      </section>
    </bento-accordion>
    <script>
      (async () => {
        const accordion = document.querySelector('#my-accordion');
        await customElements.whenDefined('bento-accordion');
        const api = await accordion.getApi();

        // programatically expand all sections
        api.expand();
        // programatically collapse all sections
        api.collapse();
      })();
    </script>
  </body>
</html>
```

#### Actions

##### toggle()

The `toggle` action switches the `expanded` and `collapsed` states of `bento-accordion` sections. When called with no arguments, it toggles all sections of the accordion. To specify a specific section, add the `section` argument and use its corresponding `id` as the value.

```html
<bento-accordion id="myAccordion">
  <section id="section1">
    <h2>Section 1</h2>
    <div>Bunch of awesome content</div>
  </section>
  <section>
    <h2>Section 2</h2>
    <div>Bunch of awesome content</div>
  </section>
  <section>
    <h2>Section 3</h2>
    <div>Bunch of awesome content</div>
  </section>
</bento-accordion>
<button id="button1">Toggle All Sections</button>
<button id="button2">Toggle Section 1</button>
<script>
  (async () => {
    const accordion = document.querySelector('#myAccordion');
    await customElements.whenDefined('bento-accordion');
    const api = await accordion.getApi();

    // set up button actions
    document.querySelector('#button1').onclick = () => {
      api.toggle();
    };
    document.querySelector('#button2').onclick = () => {
      api.toggle('section1');
    };
  })();
</script>
```

##### expand()

The `expand` action expands the sections of the `bento-accordion`. If a section is already expanded, it stays expanded. When called with no arguments, it expands all sections of the accordion. To specify a section, add the `section` argument, and use its corresponding `id` as the value.

```html
<bento-accordion id="myAccordion">
  <section id="section1">
    <h2>Section 1</h2>
    <div>Bunch of awesome content</div>
  </section>
  <section>
    <h2>Section 2</h2>
    <div>Bunch of awesome content</div>
  </section>
  <section>
    <h2>Section 3</h2>
    <div>Bunch of awesome content</div>
  </section>
</bento-accordion>
<button id="button1">Expand All Sections</button>
<button id="button2">Expand Section 1</button>
<script>
  (async () => {
    const accordion = document.querySelector('#myAccordion');
    await customElements.whenDefined('bento-accordion');
    const api = await accordion.getApi();

    // set up button actions
    document.querySelector('#button1').onclick = () => {
      api.expand();
    };
    document.querySelector('#button2').onclick = () => {
      api.expand('section1');
    };
  })();
</script>
```

##### collapse()

The `collapse` action collapses the sections of the `bento-accordion`. If a section is already collapsed, it stays collapsed. When called with no arguments, it collapses all sections of the accordion. To specify a section, add the `section` argument, and use its corresponding `id` as the value.

```html
<bento-accordion id="myAccordion">
  <section id="section1">
    <h2>Section 1</h2>
    <div>Bunch of awesome content</div>
  </section>
  <section>
    <h2>Section 2</h2>
    <div>Bunch of awesome content</div>
  </section>
  <section>
    <h2>Section 3</h2>
    <div>Bunch of awesome content</div>
  </section>
</bento-accordion>
<button id="button1">Collapse All Sections</button>
<button id="button2">Collapse Section 1</button>
<script>
  (async () => {
    const accordion = document.querySelector('#myAccordion');
    await customElements.whenDefined('bento-accordion');
    const api = await accordion.getApi();

    // set up button actions
    document.querySelector('#button1').onclick = () => {
      api.collapse();
    };
    document.querySelector('#button2').onclick = () => {
      api.collapse('section1');
    };
  })();
</script>
```

#### Events

The `bento-accordion` API allows you to register and respond to the following events:

##### expand

This event is triggered when an accordion section is expanded and is dispatched from the expanded section.

See below for example.

##### collapse

This event is triggered when an accordion section is collapsed and is dispatched from the collapsed section.

In the example below, `section 1` listens for the `expand` event and expands `section 2` when it is expanded. `section 2` listens for the `collapse` event and collapses `section 1` when it is collapsed.

See below for example.

##### Events Example

```html
<bento-accordion id="eventsAccordion" animate>
  <section id="section1">
    <h2>Section 1</h2>
    <div>Puppies are cute.</div>
  </section>
  <section id="section2">
    <h2>Section 2</h2>
    <div>Kittens are furry.</div>
  </section>
</bento-accordion>

<script>
  (async () => {
    const accordion = document.querySelector('#eventsAccordion');
    await customElements.whenDefined('bento-accordion');
    const api = await accordion.getApi();

    // when section 1 expands, section 2 also expands
    // when section 2 collapses, section 1 also collapses
    const section1 = document.querySelector('#section1');
    const section2 = document.querySelector('#section2');
    section1.addEventListener('expand', () => {
      api.expand('section2');
    });
    section2.addEventListener('collapse', () => {
      api.collapse('section1');
    });
  })();
</script>
```

### Layout and style

Each Bento component has a small CSS library you must include to guarantee proper loading without [content shifts](https://web.dev/cls/). Because of order-based specificity, you must manually ensure that stylesheets are included before any custom styles.

```html
<link
  rel="stylesheet"
  type="text/css"
  href="https://cdn.ampproject.org/v0/bento-accordion-1.0.css"
/>
```

Alternatively, you may also make the light-weight pre-upgrade styles available inline:

```html
<style>
  bento-accordion {
    display: block;
    contain: layout;
  }

  bento-accordion,
  bento-accordion > section,
  bento-accordion > section > :first-child {
    margin: 0;
  }

  bento-accordion > section > * {
    display: block;
    float: none;
    overflow: hidden; /* clearfix */
    position: relative;
  }

  @media (min-width: 1px) {
    :where(bento-accordion > section) > :first-child {
      cursor: pointer;
      background-color: #efefef;
      padding-right: 20px;
      border: 1px solid #dfdfdf;
    }
  }

  .i-amphtml-accordion-header {
    cursor: pointer;
    background-color: #efefef;
    padding-right: 20px;
    border: 1px solid #dfdfdf;
  }

  bento-accordion
    > section:not([expanded])
    > :last-child:not(.i-amphtml-animating),
  bento-accordion
    > section:not([expanded])
    > :last-child:not(.i-amphtml-animating)
    * {
    display: none !important;
  }
</style>
```

### Attributes

#### animate

Include the `animate` attribute in `<bento-accordion>` to add a "roll down" animation when the content is expanded and "roll up" animation when collapsed.

This attribute can be configured to based on a [media query](./../../../docs/spec/amp-html-responsive-attributes.md).

```html
<bento-accordion animate>
  <section>
    <h2>Section 1</h2>
    <div>Content in section 1.</div>
  </section>
  <section>
    <h2>Section 2</h2>
    <div>Content in section 2.</div>
  </section>
  <section>
    <h2>Section 3</h2>
    <div>Content in section 2.</div>
  </section>
</bento-accordion>
```

#### expanded

Apply the `expanded` attribute to a nested `<section>` to expand that section when the page loads.

```html
<bento-accordion>
  <section id="section1">
    <h2>Section 1</h2>
    <div>Bunch of awesome content</div>
  </section>
  <section id="section2">
    <h2>Section 2</h2>
    <div>Bunch of awesome content</div>
  </section>
  <section id="section3" expanded>
    <h2>Section 3</h2>
    <div>Bunch of awesome expanded content</div>
  </section>
</bento-accordion>
```

#### expand-single-section

Allow only one section to expand at a time by applying the `expand-single-section` attribute to the `<bento-accordion>` element. This means if a user taps on a collapsed `<section>`, it will expand and collapse other expanded `<section>`'s.

```html
<bento-accordion expand-single-section>
  <section>
    <h2>Section 1</h2>
    <div>Content in section 1.</div>
  </section>
  <section>
    <h2>Section 2</h2>
    <div>Content in section 2.</div>
  </section>
  <section>
    <h2>Section 3</h2>
    <img
      src="https://source.unsplash.com/random/320x256"
      width="320"
      height="256"
    />
  </section>
</bento-accordion>
```

### Styling

You may use the `bento-accordion` element selector to style the accordion freely.

Keep the following points in mind when you style an amp-accordion:

-   `bento-accordion` elements are always `display: block`.
-   `float` cannot style a `<section>`, heading, nor content elements.
-   An expanded section applies the `expanded` attribute to the `<section>` element.
-   The content element is clear-fixed with `overflow: hidden` and hence cannot have scrollbars.
-   Margins of the `<bento-accordion>`, `<section>`, heading, and content elements are set to `0`, but can be overridden in custom styles.
-   Both the header and content elements are `position: relative`.

---

## Preact/React Component

### Import via npm

```sh
npm install @bentoproject/accordion
```

### Example

<!--% example %-->

```jsx
import React from 'react';
import {
  BentoAccordion,
  BentoAccordionSection,
  BentoAccordionHeader,
  BentoAccordionContent
} from '@bentoproject/accordion/react';
import '@bentoproject/accordion/styles.css';

function App() {
  return (
    <BentoAccordion>
      <BentoAccordionSection key={1}>
        <BentoAccordionHeader>
          <h1>Section 1</h1>
        </BentoAccordionHeader>
        <BentoAccordionContent>Content 1</BentoAccordionContent>
      </BentoAccordionSection>

      <BentoAccordionSection key={2}>
        <BentoAccordionHeader>
          <h1>Section 2</h1>
        </BentoAccordionHeader>
        <BentoAccordionContent>Content 2</BentoAccordionContent>
      </BentoAccordionSection>

      <BentoAccordionSection key={3}>
        <BentoAccordionHeader>
          <h1>Section 3</h1>
        </BentoAccordionHeader>
        <BentoAccordionContent>Content 3</BentoAccordionContent>
      </BentoAccordionSection>
    </BentoAccordion>
  );
}
```

### Interactivity and API usage

Bento components are highly interactive through their API. The `BentoAccordion` component API is accessible by passing a `ref`:

```jsx
import React, {createRef} from 'react';
const ref = createRef();

function App() {
  return (
    <BentoAccordion ref={ref}>
      <BentoAccordionSection id="section1" key={1}>
        <BentoAccordionHeader>
          <h1>Section 1</h1>
        </BentoAccordionHeader>
        <BentoAccordionContent>Content 1</BentoAccordionContent>
      </BentoAccordionSection>

      <BentoAccordionSection id="section2" key={2}>
        <BentoAccordionHeader>
          <h1>Section 2</h1>
        </BentoAccordionHeader>
        <BentoAccordionContent>Content 2</BentoAccordionContent>
      </BentoAccordionSection>

      <BentoAccordionSection id="section3" key={3}>
        <BentoAccordionHeader>
          <h1>Section 3</h1>
        </BentoAccordionHeader>
        <BentoAccordionContent>Content 3</BentoAccordionContent>
      </BentoAccordionSection>
    </BentoAccordion>
  );
}
```

#### Actions

The `BentoAccordion` API allows you to perform the following actions:

##### toggle()

The `toggle` action switches the `expanded` and `collapsed` states of `bento-accordion` sections. When called with no arguments, it toggles all sections of the accordion. To specify a specific section, add the `section` argument and use its corresponding `id` as the value.

```javascript
ref.current.toggle();
ref.current.toggle('section1');
```

##### expand()

The `expand` action expands the sections of the `bento-accordion`. If a section is already expanded, it stays expanded. When called with no arguments, it expands all sections of the accordion. To specify a section, add the `section` argument, and use its corresponding `id` as the value.

```javascript
ref.current.expand();
ref.current.expand('section1');
```

##### collapse()

The `collapse` action collapses the sections of the `bento-accordion`. If a section is already collapsed, it stays collapsed. When called with no arguments, it collapses all sections of the accordion. To specify a section, add the `section` argument, and use its corresponding `id` as the value.

```javascript
ref.current.collapse();
ref.current.collapse('section1');
```

#### Events

The Bento Accordion API allows you to respond to the following events:

##### onExpandStateChange

This event is triggered on a section when an accordion section is expanded or collpased and is dispatched from the expanded section.

See [example](#events-example) below for example.

##### onCollapse

This event is triggered on a section when an accordion section is collapsed and is dispatched from the collapsed section.

In the example below, `section 1` listens for the `expand` event and expands `section 2` when it is expanded. `section 2` listens for the `collapse` event and collapses `section 1` when it is collapsed.

See [example](#events-example) below for example.

##### Events Example

<!--% example %-->

```jsx
import React, {createRef} from 'react';
import {
  BentoAccordion,
  BentoAccordionSection,
  BentoAccordionHeader,
  BentoAccordionContent
} from '@bentoproject/accordion/react';
import '@bentoproject/accordion/styles.css';


function App() {
  const ref = createRef();
  return (
    <BentoAccordion ref={ref}>
      <BentoAccordionSection
        id="section1"
        key={1}
        onExpandStateChange={(expanded) => {
          alert(expanded ?  'section1 expanded' : 'section1 collapsed');
        }}
      >
        <BentoAccordionHeader>
          <h1>Section 1</h1>
        </BentoAccordionHeader>
        <BentoAccordionContent>Content 1</BentoAccordionContent>
      </BentoAccordionSection>

      <BentoAccordionSection
        id="section2"
        key={2}
        onExpandStateChange={(expanded) => {
          alert(expanded ?  'section2 expanded' : 'section2 collapsed');
        }}
      >
        <BentoAccordionHeader>
          <h1>Section 2</h1>
        </BentoAccordionHeader>
        <BentoAccordionContent>Content 2</BentoAccordionContent>
      </BentoAccordionSection>

      <BentoAccordionSection
        id="section3"
        key={3}
        onExpandStateChange={(expanded) => {
          alert(expanded ?  'section3 expanded' : 'section3 collapsed');
        }}
      >
        <BentoAccordionHeader>
          <h1>Section 3</h1>
        </BentoAccordionHeader>
        <BentoAccordionContent>Content 3</BentoAccordionContent>
      </BentoAccordionSection>
    </BentoAccordion>
  )
}
```

### Layout and style

#### Container type

The `BentoAccordion` component has a defined layout size type. To ensure the component renders correctly, be sure to apply a size to the component and its immediate children via a desired CSS layout (such as one defined with `height`, `width`, `aspect-ratio`, or other such properties). These can be applied inline:

```jsx
<BentoAccordion style={{width: 300, height: 100}}>...</BentoAccordion>
```

Or via `className`:

```jsx
<BentoAccordion className="custom-styles">...</BentoAccordion>
```

```css
.custom-styles {
  background-color: red;
}
```

### Props

#### BentoAccordion

##### animate

If true, then uses "roll-down" / "roll-up" animation during the expansion and collapse of each section.

Default: `false`

##### expandSingleSection

If true, then expanding 1 section will automatically collapse all other sections.

Default: `false`

#### BentoAccordionSection

##### animate

If true, then uses "roll-down" / "roll-up" animation during the expansion and collapse the section.

Default: `false`

##### expanded

If true, expands the section.

Default: `false`

##### onExpandStateChange

```typescript
(expanded: boolean): void
```

Callback to listen for expand state changes. Takes a boolean flag as parameter indicating whether the section was just expanded (`false` indicates it was collapsed)

#### BentoAccordionHeader

#### Common props

This component supports the [common props](../../../docs/spec/bento-common-props.md) for React and Preact components.

BentoAccordionHeader does not yet support any custom props

#### BentoAccordionContent

#### Common props

This component supports the [common props](../../../docs/spec/bento-common-props.md) for React and Preact components.

BentoAccordionContent does not yet support any custom props
