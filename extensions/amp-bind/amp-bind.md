---
$category@: dynamic-content
formats:
  - websites
  - ads
  - email
teaser:
  text: Allows elements to mutate in response to user actions or data changes via data binding and simple JS-like expressions.
---

# amp-bind

Adds custom interactivity with data binding and expressions.

<!---
Copyright 2016 The AMP HTML Authors. All Rights Reserved.

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

      http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS-IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
-->

[TOC]

<table>
  <tr>
    <td class="col-fourty"><strong>Required Script</strong></td>
    <td>
      <div>
        <code>&lt;script async custom-element="amp-bind" src="https://cdn.ampproject.org/v0/amp-bind-0.1.js">&lt;/script&gt;</code>
      </div>
    </td>
  </tr>
  <tr>
    <td class="col-fourty"><strong>Examples</strong></td>
    <td>
      <ul>
        <li><a href="https://amp.dev/documentation/examples/components/amp-bind/">Introductory code example with annotations</a></li>
        <li><a href="https://amp.dev/documentation/examples/multimedia-animations/image_galleries_with_amp-carousel/#linking-carousels-with-amp-bind">Linked image carousels example with annotations</a></li>
        <li><a href="https://amp.dev/documentation/examples/e-commerce/product_page/">E-commerce product page example with annotations</a></li>
      </ul>
    </td>
  </tr>
  <tr>
    <td class="col-fourty"><strong>Tutorials</strong></td>
    <td><a href="https://amp.dev/documentation/guides-and-tutorials/develop/interactivity/">Create interactive AMP pages</a></td>
  </tr>
</table>

## Overview

The `amp-bind` component allows you to add custom stateful interactivity to your AMP pages via data binding and JS-like expressions.

<figure class="alignment-wrapper  margin-">
<amp-youtube
    data-videoid="xzCFU8b5fCU"
    layout="responsive"
    width="480" height="270"></amp-youtube>
<figcaption>Watch this video for an introduction to amp-bind.</figcaption></figure>

### A simple example

In the following example, tapping the button changes the `<p>` element's text from "Hello World" to "Hello amp-bind".

```html
<p [text]="'Hello ' + foo">Hello World</p>

<button on="tap:AMP.setState({foo: 'amp-bind'})">Say "Hello amp-bind"</button>
```

{% call callout('Note', type='note') %}
For performance and to avoid the risk of unexpected content jumping, `amp-bind` does not evaluate expressions on page load. This means that the visual elements should be given a default state and not rely `amp-bind` for initial render.
{% endcall %}

### How does it work?

`amp-bind` has three main components:

1. [State](#state): A document-scope, mutable JSON state. In the example above, the state is empty before tapping the button. After tapping the button, the state is `{foo: 'amp-bind'}`.
2. [Expressions](#expressions): These are JavaScript-like expressions that can reference the **state**. The example above has a single expression, `'Hello ' + foo`, which concatenates the string literal `'Hello '` and the state variable `foo`.
   There is a limit of 100 operands what can be used in an expression.
3. [Bindings](#bindings): These are special attributes of the form `[property]` that link an element's property to an **expression**. The example above has a single binding, `[text]`, which updates the `<p>` element's text every time the expression's value changes.

`amp-bind` takes special care to ensure speed, security and performance on AMP pages.

### A slightly more complex example

[filter formats="websites, stories, ads"]

```html
<!-- Store complex nested JSON data in <amp-state> elements. -->
<amp-state id="myAnimals">
  <script type="application/json">
    {
      "dog": {
        "imageUrl": "/img/dog.jpg",
        "style": "greenBackground"
      },
      "cat": {
        "imageUrl": "/img/cat.jpg",
        "style": "redBackground"
      }
    }
  </script>
</amp-state>

<p [text]="'This is a ' + currentAnimal + '.'">This is a dog.</p>

<!-- CSS classes can also be added or removed with [class]. -->
<p class="greenBackground" [class]="myAnimals[currentAnimal].style">
  Each animal has a different background color.
</p>

<!-- Or change an image's src with the [src] binding. -->
<amp-img
  width="300"
  height="200"
  src="/img/dog.jpg"
  [src]="myAnimals[currentAnimal].imageUrl"
>
</amp-img>

<button on="tap:AMP.setState({currentAnimal: 'cat'})">Set to Cat</button>
```

[/filter] <!-- formats="websites, stories, ads" -->

[filter formats="email"]

```html
<!-- Store complex nested JSON data in <amp-state> elements. -->
<amp-state id="myAnimals">
  <script type="application/json">
    {
      "dog": {
        "imageUrl": "/img/dog.jpg",
        "style": "greenBackground"
      },
      "cat": {
        "imageUrl": "/img/cat.jpg",
        "style": "redBackground"
      }
    }
  </script>
</amp-state>

<p [text]="'This is a ' + currentAnimal + '.'">This is a dog.</p>

<!-- CSS classes can also be added or removed with [class]. -->
<p class="greenBackground" [class]="myAnimals[currentAnimal].style">
  Each animal has a different background color.
</p>
```

[/filter] <!-- formats="email" -->

When the button is pressed:

1.  **State** is updated with `currentAnimal` defined as `'cat'`.

2.  **Expressions** that depend on `currentAnimal` are evaluated:

    - `'This is a ' + currentAnimal + '.'` => `'This is a cat.'`
    - `myAnimals[currentAnimal].style` => `'redBackground'`
    - `myAnimals[currentAnimal].imageUrl` => `/img/cat.jpg`

3.  **Bindings** that depend on the changed expressions are updated:
    - The first `<p>` element's text will read "This is a cat."
    - The second `<p>` element's `class` attribute will be "redBackground".
    - The `amp-img` element will show the image of a cat.

{% call callout('Tip', type='success') %}
[Try out the **live demo**](https://amp.dev/documentation/examples/components/amp-bind/) for this example with code annotations!
{% endcall %}

## Details

### State

Each AMP document that uses `amp-bind` has document-scope mutable JSON data, or **state**.

#### Initializing state with `amp-state`

`amp-bind`'s state can be initialized with the `amp-state` component:

```html
<amp-state id="myState">
  <script type="application/json">
    {
      "foo": "bar"
    }
  </script>
</amp-state>
```

[Expressions](#expressions) can reference state variables via dot syntax. In this example, `myState.foo` will evaluate to `"bar"`.

- An `<amp-state>` element's child JSON has a maximum size of 100KB.
- An `<amp-state>` element can also specify a CORS URL instead of a child JSON script. See the [Appendix](#amp-state-specification) for details.

#### Refreshing state

The `refresh` action is supported by this component and can be used to refresh the
state's contents.

```html
<amp-state id="amp-state" ...></amp-state>
<!-- Clicking the button will refresh and refetch the json in amp-state. -->
<button on="tap:amp-state.refresh"></button>
```

#### Updating state with `AMP.setState()`

The [`AMP.setState()`](../../spec/amp-actions-and-events.md#amp) action merges an object literal into the state. For example, when the below button is pressed, `AMP.setState()` will [deep-merge](#deep-merge-with-ampsetstate) the object literal with the state.

```html
<!-- Like JavaScript, you can reference existing
     variables in the values of the  object literal. -->
<button
  on="tap:AMP.setState({foo: 'bar', baz: myAmpState.someVariable})"
></button>
```

In general, nested objects will be merged up to a maximum depth of 10. All variables, including those introduced by `amp-state`, can be overidden.

When triggered by certain events, `AMP.setState()` also can access event-related data on the `event` property.

```html
<!-- The "change" event of this <input> element contains
     a "value" variable that can be referenced via "event.value". -->
<input type="range" on="change:AMP.setState({myRangeValue: event.value})" />
```

#### Modifying history with `AMP.pushState()`

The [`AMP.pushState()`](../../spec/amp-actions-and-events.md#amp) action is similar to `AMP.setState()` except it also pushes a new entry
onto the browser history stack. Popping this history entry (e.g. by navigating back) restores
the previous value of variables set by `AMP.pushState()`.

For example:

```html
<button on="tap:AMP.pushState({foo: '123'})">Set 'foo' to 123</button>
```

- Tapping the button will set variable `foo` to 123 and push a new history entry.
- Navigating back will restore `foo` to its previous value, "bar" (equivalent to calling `AMP.setState({foo: 'bar'})`.

### Expressions

Expressions are similar to JavaScript with some important differences.

#### Differences from JavaScript

- Expressions may only access the containing document's [state](#state).
- Expressions **do not** have access to `window` or `document`. `global` references the top-level state.
- Only [white-listed functions](#white-listed-functions) and operators may be used. Custom functions, classes and loops are disallowed. Arrow functions are allowed as function parameters e.g. `[1, 2, 3].map(x => x + 1)`.
- Undefined variables and array-index-out-of-bounds return `null` instead of `undefined` or throwing errors.
- A single expression is currently capped at 50 operands for performance. Please [contact us](https://github.com/ampproject/amphtml/issues/new) if this is insufficient for your use case.

The full expression grammar and implementation can be found in [bind-expr-impl.jison](./0.1/bind-expr-impl.jison) and [bind-expression.js](./0.1/bind-expression.js).

#### Examples

The following are all valid expressions:

```javascript
1 + '1'; // 11
1 + +'1'; // 2
!0; // true
null || 'default'; // 'default'
```

#### White-listed functions

<table>
  <tr>
    <th>Object type </th>
    <th>Function(s)</th>
    <th>Example</th>
  </tr>
  <tr>
    <td><a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array#Methods"><code>Array</code></a><sup>1</sup></td>
    <td class="col-thirty">
      <code>concat</code><br>
      <code>filter</code><br>
      <code>includes</code><br>
      <code>indexOf</code><br>
      <code>join</code><br>
      <code>lastIndexOf</code><br>
      <code>map</code><br>
      <code>reduce</code><br>
      <code>slice</code><br>
      <code>some</code><br>
      <code>sort</code> (not-in-place)<br>
      <code>splice</code> (not-in-place)<br>
    </td>
    <td>
      <pre>// Returns [1, 2, 3].
[3, 2, 1].sort()</pre>
      <pre>// Returns [1, 3, 5].
[1, 2, 3].map((x, i) => x + i)</pre>
      <pre>// Returns 6.
[1, 2, 3].reduce((x, y) => x + y)</pre>
    </td>
  </tr>
  <tr>
   <td><a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number#Methods"><code>Number</code></a></td>
    <td>
      <code>toExponential</code><br>
      <code>toFixed</code><br>
      <code>toPrecision</code><br>
      <code>toString</code>
    <td>
      <pre>// Returns 3.
(3.14).toFixed()</pre>
      <pre>// Returns '3.14'.
(3.14).toString()</pre>
    </td>
  </tr>
  <tr>
   <td><a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String#Methods"><code>String</code></a></td>
    <td>
      <code>charAt</code><br>
      <code>charCodeAt</code><br>
      <code>concat</code><br>
      <code>indexOf</code><br>
      <code>lastIndexOf</code><br>
      <code>replace</code><br>
      <code>slice</code><br>
      <code>split</code><br>
      <code>substr</code><br>
      <code>substring</code><br>
      <code>toLowerCase</code><br>
      <code>toUpperCase</code></td>
    <td>
      <pre>// Returns 'abcdef'.
'abc'.concat('def')</pre>
    </td>
  </tr>
  <tr>
    <td><a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math"><code>Math</code></a><sup>2</sup></td>
    <td>
      <code>abs</code><br>
      <code>ceil</code><br>
      <code>floor</code><br>
      <code>max</code><br>
      <code>min</code><br>
      <code>pow</code><br>
      <code>random</code><br>
      <code>round</code><br>
      <code>sign</code></td>
    <td>
      <pre>// Returns 1.
abs(-1)</pre>
    </td>
  </tr>
  <tr>
    <td><a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object"><code>Object</code></a><sup>2</sup></td>
    <td>
      <code>keys</code><br>
      <code>values</code>
    <td>
      <pre>// Returns ['a', 'b'].
keys({a: 1, b: 2})</pre>
      <pre>// Returns [1, 2].
values({a: 1, b: 2}</pre>
    </td>
  </tr>
  <tr>
    <td>
      <a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects"><code>Global</code></a><sup>2</sup>
    </td>
    <td>
      <code>encodeURI</code><br>
      <code>encodeURIComponent</code>
    </td>
    <td>
      <pre>// Returns 'Hello%20world'.
encodeURIComponent('Hello world')</pre>
    </td>
  </tr>
</table>

<sup>1</sup>Single-parameter arrow functions can't have parentheses, e.g. use `x => x + 1` instead of `(x) => x + 1`. Also, `sort()` and `splice()` return modified copies instead of operating in-place.<br>
<sup>2</sup>Static functions are not namespaced, e.g. use `abs(-1)` instead of `Math.abs(-1)`.

#### Defining macros with `amp-bind-macro`

`amp-bind` expression fragments can be reused by defining an `amp-bind-macro`. The `amp-bind-macro` element allows you to define an expression that takes zero or more arguments and references the current state. A macro can be invoked like a function by referencing its `id` attribute value from anywhere in your doc.

[example preview="inline" playground="true" imports="amp-bind"]

```html
<amp-bind-macro
  id="circleArea"
  arguments="radius"
  expression="3.14 * radius * radius"
></amp-bind-macro>
<p>
  Input a radius value
</p>
<input
  type="number"
  min="0"
  max="100"
  value="0"
  on="input-throttled:AMP.setState({myCircle:{radius: event.value}})"
/>
<p>
  The circle has an area of
  <span [text]="circleArea(myCircle.radius)">0</span>.
</p>
```

[/example]

A macro can also call other macros <i>defined before itself</i>. A macro cannot call itself recursively.

### Bindings

A **binding** is a special attribute of the form `[property]` that links an element's property to an [expression](#expressions). An alternative, XML-compatible syntax can also be used in the form of `data-amp-bind-property`.

When the **state** changes, expressions are re-evaluated and the bound elements' properties are updated with the new expression results.

`amp-bind` supports data bindings on five types of element state:

<table>
  <tr>
    <th>Type</th>
    <th>Attribute(s)</th>
    <th>Details</th>
  </tr>
  <tr>
    <td class="col-thirty"><a href="https://developer.mozilla.org/en-US/docs/Web/API/Node/textContent"><code>Node.textContent</code></a></td>
    <td class="col-thirty"><code>[text]</code></td>
    <td>Supported on most text elements.</td>
  </tr>
  <tr>
    <td><a href="https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes/class">CSS classes</a></td>
    <td><code>[class]</code></td>
    <td>Expression result must be a space-delimited string.</td>
  </tr>
  <tr>
    <td><a href="https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes/hidden">The <code>hidden</code> attribute</a></td>
    <td><code>[hidden]</code></td>
    <td>Should be a boolean expression.</td>
  </tr>
  <tr>
    <td>Size of <a href="https://www.ampproject.org/docs/reference/components">AMP elements</a></td>
    <td><code>[width]</code><br><code>[height]</code></td>
    <td>Changes the width and/or height of the AMP element.</td>
  </tr>
  <tr>
    <td>Accessibility states and properties</td>
    <td><code>[aria-hidden]</code><br><code>[aria-label]</code><br>etc.</td>
    <td>Used for dynamically updating information available to assistive technologies like screen readers.</td>
  </tr>
  <tr>
    <td>Element-specific attributes</td>
    <td><a href="#element-specific-attributes">Various</a></td>
    <td></td>
  </tr>
</table>

Notes on bindings:

- For security reasons, binding to `innerHTML` is disallowed.
- All attribute bindings are sanitized for unsafe values (e.g., `javascript:`).
- Boolean expression results toggle boolean attributes. For example: `<amp-video [controls]="expr"...>`. When `expr` evaluates to `true`, the `<amp-video>` element has the `controls` attribute. When `expr` evaluates to `false`, the `controls` attribute is removed.
- Bracket characters `[` and `]` in attribute names can be problematic when writing XML (e.g. XHTML, JSX) or writing attributes via DOM APIs. In these cases, use the alternative syntax `data-amp-bind-x="foo"` instead of `[x]="foo"`.

#### Element-specific attributes

Binding to the following components and attributes are allowed:

[filter formats="websites"]

##### `<amp-brightcove>`

- `[data-account]`
- `[data-embed]`
- `[data-player]`
- `[data-player-id]`
- `[data-playlist-id]`
- `[data-video-id]` Changes the displayed Brightcove video.
  [/filter] <!-- formats="websites" -->

##### `<amp-carousel type=slides>`

- `[slide]` Changes the currently displayed slide index.

[See an example](https://amp.dev/documentation/examples/multimedia-animations/image_galleries_with_amp-carousel/#linking-carousels-with-amp-bind).

[filter formats="websites"]

##### `<amp-date-picker>`

- `[min]` Sets the earliest selectable date
- `[max]` Sets the latest selectable date

##### `<amp-google-document-embed>`

- `[src]` Displays the document at the updated URL.
- `[title]` Changes the document's title.

##### `<amp-iframe>`

- `[src]` Changes the iframe's source URL.

[/filter] <!-- formats="websites" -->
[filter formats="websites, ads"]

##### `<amp-img>`

- `[alt]`
- `[attribution]`
- `[src]`
- `[srcset]`

Bind to `[srcset]` instead of `[src]` to support responsive images. See corresponding [`amp-img` attributes](../../builtins/amp-img.md#attributes).
[/filter] <!-- formats="websites, ads" -->
[filter formats="email"]

##### `<amp-img>`

- `[alt]`
- `[attribution]`
  [/filter] <!-- formats="email" -->

##### `<amp-lightbox>`

- `[open]` Toggles display of the lightbox.

[tip type="default"]
Use `on="lightboxClose: AMP.setState(...)"` to update variables when the lightbox is closed.
[/tip]

[filter formats="websites, stories"]

##### `<amp-list>`

- `[src]`

If the expression is a string, it fetches and renders JSON from the string URL. If the expression is an object or array, it renders the expression data.
[/filter] <!-- formats="websites, stories" -->

[filter formats="websites, email"]

##### `<amp-selector>`

- `[selected]` Changes the currently selected children element(s) identified by their `option` attribute values. Supports a comma-separated list of values for multiple selection. [See an example](https://amp.dev/documentation/examples/multimedia-animations/image_galleries_with_amp-carousel/?format=email#linking-carousels-with-amp-bind).
- `[disabled]`

[tip type="note"]
`[selected]` does not have a non-bindable attribute. The AMP Validator will throw an error if `selected` is used.
[/tip]

[/filter] <!-- formats="websites, email" -->

[filter formats="websites, stories, ads"]

##### `<amp-state>`

- `[src]`

Fetches JSON from the new URL and merges it into the existing state. The following update will ignore `<amp-state>`elements to prevent cycles.
[/filter] <!-- formats="websites, stories, ads" -->

[filter formats="websites, stories"]

##### `<amp-twitter>`

- `[data-tweetid]` Changes the displayed Tweet.

[/filter] <!-- formats="websites" -->

[filter formats="websites, stories, ads"]

##### `<amp-video>`

- `[alt]`
- `[attribution]`
- `[controls]`
- `[loop]`
- `[poster]`
- `[preload]`
- `[src]`

See corresponding [`amp-video` attributes](../amp-video/amp-video.md#attributes).
[/filter] <!-- formats="websites, stories, ads" -->

[filter formats="websites, ads"]

##### `<amp-youtube>`

- `[data-videoid]` Changes the displayed YouTube video.

[/filter] <!-- formats="websites, ads" -->

[filter formats="websites, stories, ads"]

##### `<a>`

- `[href]` Changes the link.

##### `<button>`

- `[disabled]`
- `[type]`
- `[value]`

[/filter] <!-- formats="websites, stories, ads" -->

[filter formats="email"]

##### `<button>`

- `[disabled]`
- `[value]`

See corresponding [button attributes](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/button#Attributes).

[/filter] <!-- formats="email" -->

##### `<details>`

- `[open]`

See corresponding [details attributes](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/details#Attributes).

##### `<fieldset>`

- `[disabled]` Enables or disables the fieldset.

##### `<image>`

- `[xlink:href]`

See corresponding [image attributes](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/image).

[filter formats="websites, stories, ads"]

##### `<input>`

- `[accept]`
- `[accessKey]`
- `[autocomplete]`
- `[checked]`
- `[disabled]`
- `[height]`
- `[inputmode]`
- `[max]`
- `[maxlength]`
- `[multiple]`
- `[pattern]`
- `[placeholder]`
- `[readonly]`
- `[required]`
- `[selectiondirection]`
- `[size]`
- `[spellcheck]`
- `[step]`
- `[type]`
- `[value]`
- `[width]`

See corresponding [input attributes](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input#Attributes).

[/filter] <!-- formats="websites, stories, ads" -->

[filter formats="email"]

##### `<input>`

- `[autocomplete]`
- `[disabled]`
- `[height]`
- `[max]`
- `[maxlength]`
- `[multiple]`
- `[pattern]`
- `[placeholder]`
- `[readonly]`
- `[required]`
- `[size]`
- `[spellcheck]`
- `[step]`
- `[value]`
- `[width]`

See corresponding [input attributes](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input#Attributes).

[/filter] <!-- formats="email" -->

##### `<option>`

- `[disabled]`
- `[label]`
- `[selected]`
- `[value]`

See corresponding [option attributes](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/option#Attributes).

##### `<optgroup>`

- `[disabled]`
- `[label]`

See corresponding [optgroup attributes](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/optgroup#Attributes).

##### `<section>`

- `[data-expand]` Changes the expansion of a `section` in an [`amp-accordion`](../amp-accordion/amp-accordion.md).

[filter formats="websites, stories, ads"]

##### `<select>`

- `[autofocus]`
- `[disabled]`
- `[multiple]`
- `[required]`
- `[size]`

See corresponding [select attributes](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/select#Attributes).

[/filter] <!-- formats="websites, stories, ads" -->

[filter formats="email"]

##### `<select>`

- `[disabled]`
- `[multiple]`
- `[required]`
- `[size]`

See corresponding [select attributes](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/select#Attributes).

[/filter] <!-- formats="email" -->

##### `<source>`

- `[src]`
- `[type]`

See corresponding [source attributes](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/source#Attributes).

##### `<track>`

- [label]
- [src]
- [srclang]

See corresponding [track attributes](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/track#Attributes).

[filter formats="websites, stories, ads"]

##### `<textarea>`

- `[autocomplete]`
- `[autofocus]`
- `[cols]`
- `[disabled]`
- `[defaultText]`
- `[maxlength]`
- `[minlength]`
- `[placeholder]`
- `[readonly]`
- `[required]`
- `[rows]`
- `[selectiondirection]`
- `[selectionend]`
- `[selectionstart]`
- `[spellcheck]`
- `[wrap]`

Use `[defaultText]` to update initial text, and `[text]` to update current text. See corresponding [textarea attributes](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/textarea#Attributes).

[/filter] <!-- formats="websites, stories, ads" -->

[filter formats="email"]

##### `<textarea>`

- `[autocomplete]`
- `[cols]`
- `[disabled]`
- `[defaultText]`
- `[maxlength]`
- `[minlength]`
- `[placeholder]`
- `[readonly]`
- `[required]`
- `[rows]`
- `[spellcheck]`
- `[wrap]`

Use `[defaultText]` to update initial text, and `[text]` to update current text. See corresponding [textarea attributes](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/textarea#Attributes).

[/filter] <!-- formats="email" -->

## Debugging

[filter formats="websites, stories, ads"]
Test in development mode, byt adding the URL fragment `#development=1` to highlight warnings and errors during development and to access special debugging functions.
[/filter] <!-- formats="websites, stories, ads" -->

[filter formats="email"]
Test in development mode by saving the email as an HTML file. Test in the browser by adding the URL fragment `#development=1` to highlight warnings and errors during development and to access special debugging functions.
[/filter] <!-- formats="email" -->

### Warnings

In development mode, `amp-bind` will issue a warning when the default value of a bound attribute doesn't match its corresponding expression's initial result. This can help prevent unintended mutations caused by changes in other state variables. For example:

```html
<!-- The element's default class value ('def') doesn't match the expression result for [class] ('abc'),
     so a warning will be issued in development mode. -->
<p [class]="'abc'" class="def"></p>
```

In development mode, `amp-bind` will also issue a warning when dereferencing undefined variables or properties. This can also help prevent unintended mutations due to `null` expression results. For example:

```html
<amp-state id="myAmpState">
  <script type="application/json">
    { "foo": 123 }
  </script>
</amp-state>

<!-- The amp-state#myAmpState does not have a `bar` variable, so a warning
     will be issued in development mode. -->
<p [text]="myAmpState.bar">Some placeholder text.</p>
```

### Errors

There are several types of runtime errors that may be encountered when working with `amp-bind`.

<table>
  <tr>
    <th>Type</th>
    <th>Message</th>
    <th>Suggestion</th>
  </tr>
  <tr>
    <td class="col-thirty">Invalid binding</td>
    <td class="col-fourty"><em>Binding to [foo] on &lt;P> is not allowed</em>.</td>
    <td class="col-thirty">Use only <a href="#element-specific-attributes">white-listed bindings</a>.</td>
  </tr>
  <tr>
    <td>Syntax error</td>
    <td><em>Expression compilation error in...</em></td>
    <td>Verify the expression for typos.</td>
  </tr>
  <tr>
    <td>Non-whitelisted functions</td>
    <td><em>alert is not a supported function.</em></td>
    <td>Use only <a href="#white-listed-functions">white-listed functions</a>.</td>
  </tr>
  <tr>
    <td>Sanitized result</td>
    <td><em>"javascript:alert(1)" is not a valid result for [href].</em></td>
    <td>Avoid banned URL protocols or expressions that would fail the AMP Validator.</td>
  </tr>
  <tr>
    <td>CSP violation</td>
    <td><em>Refused to create a worker from 'blob:...' because it violates the following Content Security Policy directive...</em></td>
    <td>Add <code>default-src blob:</code> to your origin's Content Security Policy. <code>amp-bind</code> delegates expensive work to a <a href="https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API/Using_web_workers#Dedicated_workers">dedicated Web Worker</a> to ensure good performance.</td>
  </tr>
</table>

### Debugging State

Use `AMP.printState()` to print the current state to the console.

## Appendix

### `<amp-state>` specification

[filter formats="websites, stories, ads"]
An `amp-state` element may contain either a child `<script>` element **OR** a `src` attribute containing a CORS URL to a remote JSON endpoint, but not both.

```html
<amp-state id="myLocalState">
  <script type="application/json">
    {
      "foo": "bar"
    }
  </script>
</amp-state>

<amp-state id="myRemoteState" src="https://data.com/articles.json"> </amp-state>
```

[/filter] <!-- formats="websites, stories, ads" -->

[filter formats="email"]
An `amp-state` element must contain a child `<script>` element.

```html
<amp-state id="myLocalState">
  <script type="application/json">
    {
      "foo": "bar"
    }
  </script>
</amp-state>
```

[/filter] <!-- formats="email" -->

[filter formats="websites, stories, ads"]

#### XHR batching

AMP batches XMLHttpRequests (XHRs) to JSON endpoints, that is, you can use a single JSON data request as a data source for multiple consumers (e.g., multiple `amp-state` elements) on an AMP page.

For example, if your `amp-state` element makes an XHR to an endpoint, while the XHR is in flight, all subsequent XHRs to the same endpoint won't trigger and will instead return the results from the first XHR.

[/filter] <!-- formats="websites, stories, ads" -->

#### Attributes

[filter formats="websites, stories, ads"]

##### src

The URL of the remote endpoint that will return the JSON that will update this `amp-state`. This must be a CORS HTTP service. The `src` attribute allows all standard URL variable substitutions. See the [Substitutions Guide](../../spec/amp-var-substitutions.md) for more info.

[tip type="important]
The endpoint must implement the requirements specified in the [CORS Requests in AMP](https://amp.dev/documentation/guides-and-tutorials/learn/amp-caches-and-cors/amp-cors-requests) spec.
[/tip]

##### credentials (optional)

Defines a `credentials` option as specified by the [Fetch API](https://fetch.spec.whatwg.org/).

- Supported values: `omit`, `include`
- Default: `omit`

To send credentials, pass the value of `include`. If this value is set, the response must follow the [AMP CORS security guidelines](https://amp.dev/documentation/guides-and-tutorials/learn/amp-caches-and-cors/amp-cors-requests/#cors-security-in-amp).
[/filter] <!-- formats="websites, stories, ads" -->

[filter formats="email"]

##### Invalid AMP email attributes

The AMP for Email spec disallows the use of the following attributes on the AMP email format.

- `[src]`
- `src`
- `credentials`
- `overridable`

[/filter] <!-- formats="email" -->

### Deep-merge with `AMP.setState()`

When `AMP.setState()` is called `amp-bind` deep-merges the provided object literal with the current state. All variables from the object literal are written to the state directly except for nested objects, which are recursively merged. Primitives and arrays are in the state are always overwritten by variables of the same name in the object literal.

Consider the following example:

```javascript
// State is empty.
{
}
```

```html
<button
  on="tap:AMP.setState({
  employee: {
    name: 'John Smith',
    age: 47,
    vehicle: 'Car'
  }
})"
>
  Set employee to John Smith
</button>
<button
  on="tap:AMP.setState({
  employee: {
    age: 64
  }
})"
>
  Set employee age to 64
</button>
```

When the first button is pressed, the state changes to:

```javascript
{
  employee: {
    name: 'John Smith',
    age: 47,
    vehicle: 'Car',
  }
}
```

When the second button is pressed, `amp-bind` will recursively merge the object literal argument, `{employee: {age: 64}}`, into the existing state.

```javascript
{
  employee: {
    name: 'John Smith',
    age: 64,
    vehicle: 'Car',
  }
}
```

`employee.age` has been updated, however `employee.name` and `employee.vehicle` keys have not changed.

#### Circular references

`AMP.setState(object)` will throw a runtime error if `object` contains a circular reference.

#### Removing a variable

Remove an existing state variable by setting its value to `null` in `AMP.setState()`.

For example:

```html
<button on="tap:AMP.setState({removeMe: null})"></button>
```

### Expression grammar

The BNF-like grammar for `amp-bind` expressions:

```text
expr:
    operation
  | invocation
  | member_access
  | '(' expr ')'
  | variable
  | literal
  ;

operation:
    '!' expr
  | '-' expr %prec UMINUS
  | '+' expr %prec UPLUS
  |  expr '+' expr
  | expr '-' expr
  | expr '*' expr
  | expr '/' expr
  | expr '%' expr
  | expr '&&' expr
  | expr '||' expr
  | expr '<=' expr
  | expr '<' expr
  | expr '>=' expr
  | expr '>' expr
  | expr '!=' expr
  | expr '==' expr
  | expr '?' expr ':' expr
  ;

invocation:
    NAME args
  | expr '.' NAME args
  | expr '.' NAME '(' arrow_function ')'
  | expr '.' NAME '(' arrow_function ',' expr ')'
  ;

arrow_function:
    '(' ')' '=>' expr
  | NAME '=>' expr
  | '(' params ')' '=>' expr
  ;

params:
    NAME ',' NAME
  | params ',' NAME
  ;

args:
    '(' ')'
  | '(' array ')'
  ;

member_access:
    expr member
  ;

member:
    '.' NAME
  | '[' expr ']'
  ;

variable:
    NAME
  ;

literal:
    primitive
  | object_literal
  | array_literal
  ;

primitive:
    STRING
  | NUMBER
  | TRUE
  | FALSE
  | NULL
  ;

array_literal:
    '[' ']'
  | '[' array ']'
  | '[' array ',' ']'
  ;

array:
    expr
  | array ',' expr
  ;

object_literal:
    '{' '}'
  | '{' object '}'
  | '{' object ',' '}'
  ;

object:
    key_value
  | object ',' key_value
  ;

key_value:
  key ':' expr
  ;

key:
    NAME
  | primitive
  | '[' expr ']'
  ;
```
