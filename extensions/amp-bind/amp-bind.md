---
$category@: dynamic-content
formats:
  - websites
  - email
  - ads
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
        <li><a href="https://ampbyexample.com/components/amp-bind/">Introductory code example with annotations</a></li>
        <li><a href="https://ampbyexample.com/advanced/image_galleries_with_amp-carousel/#linking-carousels-with-amp-bind">Linked image carousels example with annotations</a></li>
        <li><a href="https://ampbyexample.com/samples_templates/product/">E-commerce product page example with annotations</a></li>
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

1. [State](#state): A document-scope, mutable JSON state. In the example above, the state is empty before tapping the button.  After tapping the button, the state is `{foo: 'amp-bind'}`.
2. [Expressions](#expressions): These are JavaScript-like expressions that can reference the **state**. The example above has a single expression, `'Hello ' + foo`, which concatenates the string literal `'Hello '` and the state variable `foo`.
There is a limit of 100 operands what can be used in an expression.
3. [Bindings](#bindings): These are special attributes of the form `[property]` that link an element's property to an **expression**. The example above has a single binding, `[text]`, which updates the `<p>` element's text every time the expression's value changes.

`amp-bind` takes special care to ensure speed, security and performance on AMP pages.

### A slightly more complex example

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
<amp-img width="300" height="200" src="/img/dog.jpg"
    [src]="myAnimals[currentAnimal].imageUrl">
</amp-img>

<button on="tap:AMP.setState({currentAnimal: 'cat'})">Set to Cat</button>
```

When the button is pressed:

1.  **State** is updated with `currentAnimal` defined as `'cat'`.

2.  **Expressions** that depend on `currentAnimal` are evaluated:
    - `'This is a ' + currentAnimal + '.'` => `'This is a cat.'`
    - `myAnimals[currentAnimal].style` => `'redBackground'`
    - `myAnimals[currentAnimal].imageUrl` =>  `/img/cat.jpg`

3.  **Bindings** that depend on the changed expressions are updated:
    - The first `<p>` element's text will read "This is a cat."
    - The second `<p>` element's `class` attribute will be "redBackground".
    - The `amp-img` element will show the image of a cat.

{% call callout('Tip', type='success') %}
[Try out the **live demo**](https://ampbyexample.com/components/amp-bind/) for this example with code annotations!
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
<button on="tap:AMP.setState({foo: 'bar', baz: myAmpState.someVariable})"></button>
```

In general, nested objects will be merged up to a maximum depth of 10. All variables, including those introduced by `amp-state`, can be overidden.

When triggered by certain events, `AMP.setState()` also can access event-related data on the `event` property.

```html
<!-- The "change" event of this <input> element contains
     a "value" variable that can be referenced via "event.value". -->
<input type="range" on="change:AMP.setState({myRangeValue: event.value})">
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
- Expressions **do not** have access to globals like `window` or `document`.
- Only [white-listed functions](#white-listed-functions) and operators may be used.
- Custom functions, classes and loops are generally disallowed. Arrow functions are allowed as parameters, e.g. `Array.prototype.map`.
- Undefined variables and array-index-out-of-bounds return `null` instead of `undefined` or throwing errors.
- A single expression is currently capped at 50 operands for performance. Please [contact us](https://github.com/ampproject/amphtml/issues/new) if this is insufficient for your use case.

The full expression grammar and implementation can be found in [bind-expr-impl.jison](./0.1/bind-expr-impl.jison) and [bind-expression.js](./0.1/bind-expression.js).

#### Examples

The following are all valid expressions:

```javascript
1 + '1'           // 11
1 + (+'1')        // 2
!0                // true
null || 'default' // 'default'
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

```html
<amp-bind-macro id="circleArea" arguments="radius" expression="3.14 * radius * radius"></amp-bind-macro>

<div>
  The circle has an area of <span [text]="circleArea(myCircle.radius)">0</span>.
</div>
```

A macro can also call other macros <i>defined before itself</i>. A macro cannot call itself recursively.

### Bindings

A **binding** is a special attribute of the form `[property]` that links an element's property to an [expression](#expressions). An alternative, XML-compatible syntax can also be used in the form of `data-amp-bind-property`.

When the **state** changes, expressions are re-evaluated and the bound elements' properties are updated with the new expression results.

`amp-bind` supports data bindings on four types of element state:

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
    <td>Size of <a href="https://amp.dev/documentation/components/">AMP elements</a></td>
    <td><code>[width]</code><br><code>[height]</code></td>
    <td>Changes the width and/or height of the AMP element.</td>
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

Only binding to the following components and attributes are allowed:

<table>
  <tr>
    <th>Component</th>
    <th>Attribute(s)</th>
    <th>Behavior</th>
  </tr>
  <tr>
    <td class="col-thirty"><code>&lt;amp-brightcove&gt;</code></td>
    <td class="col-fourty"><code>[data-account]</code><br><code>[data-embed]</code><br><code>[data-player]</code><br><code>[data-player-id]</code><br><code>[data-playlist-id]</code><br><code>[data-video-id]</code></td>
    <td class="col-thirty">Changes the displayed Brightcove video.</td>
  </tr>
  <tr>
    <td><code>&lt;amp-carousel type=slides&gt;</code></td>
    <td><code>[slide]</code><sup>*</sup></td>
    <td>Changes the currently displayed slide index. <a href="https://ampbyexample.com/advanced/image_galleries_with_amp-carousel/#linking-carousels-with-amp-bind">See an example</a>.</td>
  </tr>
  <tr>
    <td><code>&lt;amp-date-picker&gt;</code></td>
    <td>
      <code>[min]</code><br>
      <code>[max]</code>
    </td>
    <td>
      Sets the earliest selectable date<br>
      Sets the latest selectable date
    </td>
  </tr>
  <tr>
    <td><code>&lt;amp-google-document-embed&gt;</code></td>
    <td><code>[src]</code><br><code>[title]</code></td>
    <td>Displays the document at the updated URL.<br>Changes the document's title.</td>
  </tr>
  <tr>
    <td><code>&lt;amp-iframe&gt;</code></td>
    <td><code>[src]</code></td>
    <td>Changes the iframe's source URL.</td>
  </tr>
  <tr>
    <td><code>&lt;amp-img&gt;</code></td>
    <td><code>[alt]</code><br><code>[attribution]</code><br><code>[src]</code><br><code>[srcset]</code></td>
    <td>When binding to <code>[src]</code>, make sure you also bind to <code>[srcset]</code> in order to make the binding work on cache.<br>See corresponding <a href="https://amp.dev/documentation/components/media/amp-img#attributes">amp-img attributes</a>.</td>
  </tr>
  <tr>
    <td><code>&lt;amp-lightbox&gt;</code></td>
    <td><code>[open]</code><sup>*</sup></td>
    <td>
      Toggles display of the lightbox. Tip: Use <code>on="lightboxClose: AMP.setState(...)"</code> to update variables when the lightbox is closed.
    </td>
  </tr>
  <tr>
    <td><code>&lt;amp-list&gt;</code></td>
    <td><code>[src]</code></td>
    <td>
      If expression is a string, fetches and renders JSON from the string URL.
      If expression is an object or array, renders the expression data.
    </td>
  </tr>
  <tr>
    <td><code>&lt;amp-selector&gt;</code></td>
    <td><code>[selected]</code><sup>*</sup><br><code>[disabled]</code></td>
    <td>Changes the currently selected children element(s)<br>identified by their <code>option</code> attribute values. Supports a comma-separated list of values for multiple selection. <a href="https://ampbyexample.com/advanced/image_galleries_with_amp-carousel/#linking-carousels-with-amp-bind">See an example</a>.</td>
  </tr>
  <tr>
    <td><code>&lt;amp-state&gt;</code></td>
    <td><code>[src]</code></td>
    <td>Fetches JSON from the new URL and merges it into the existing state. <em>Note the following update will ignore <code>&lt;amp-state&gt;</code> elements to prevent cycles.</em></td>
  </tr>
  <tr>
    <td><code>&lt;amp-video&gt;</code></td>
    <td><code>[alt]</code><br><code>[attribution]</code><br><code>[controls]</code><br><code>[loop]</code><br><code>[poster]</code><br><code>[preload]</code><br><code>[src]</code></td>
    <td>See corresponding <a href="https://amp.dev/documentation/components/media/amp-video#attributes">amp-video attributes</a>.</td>
  </tr>
  <tr>
    <td><code>&lt;amp-youtube&gt;</code></td>
    <td><code>[data-videoid]</code></td>
    <td>Changes the displayed YouTube video.</td>
  </tr>
  <tr>
    <td><code>&lt;a&gt;</code></td>
    <td><code>[href]</code></td>
    <td>Changes the link.</td>
  </tr>
  <tr>
    <td><code>&lt;button&gt;</code></td>
    <td><code>[disabled]</code><br><code>[type]</code><br><code>[value]</code></td>
    <td>See corresponding <a href="https://developer.mozilla.org/en-US/docs/Web/HTML/Element/button#Attributes">button attributes</a>.</td>
  </tr>
  <tr>
    <td><code>&lt;details&gt;</code></td>
    <td><code>[open]</code></td>
    <td>See corresponding <a href="https://developer.mozilla.org/en-US/docs/Web/HTML/Element/details#Attributes">details attributes</a>.</td>
  </tr>
  <tr>
    <td><code>&lt;fieldset&gt;</code></td>
    <td><code>[disabled]</code></td>
    <td>Enables or disables the fieldset.</td>
  </tr>
  <tr>
    <td><code>&lt;image&gt;</code></td>
    <td><code>[xlink:href]</code><br>
    <td>See corresponding <a href="https://developer.mozilla.org/en-US/docs/Web/SVG/Element/image">image attributes</a>.</td>
  </tr>
  <tr>
    <td><code>&lt;input&gt;</code></td>
    <td><code>[accept]</code><br><code>[accessKey]</code><br><code>[autocomplete]</code><br><code>[checked]</code><br><code>[disabled]</code><br><code>[height]</code><br><code>[inputmode]</code><br><code>[max]</code><br><code>[maxlength]</code><br><code>[min]</code><br><code>[minlength]</code><br><code>[multiple]</code><br><code>[pattern]</code><br><code>[placeholder]</code><br><code>[readonly]</code><br><code>[required]</code><br><code>[selectiondirection]</code><br><code>[size]</code><br><code>[spellcheck]</code><br><code>[step]</code><br><code>[type]</code><br><code>[value]</code><br><code>[width]</code></td>
    <td>See corresponding <a href="https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input#Attributes">input attributes</a>.</td>
  </tr>
  <tr>
    <td><code>&lt;option&gt;</code></td>
    <td><code>[disabled]</code><br><code>[label]</code><br><code>[selected]</code><br><code>[value]</code></td>
    <td>See corresponding <a href="https://developer.mozilla.org/en-US/docs/Web/HTML/Element/option#Attributes">option attributes</a>.</td>
  </tr>
  <tr>
    <td><code>&lt;optgroup&gt;</code></td>
    <td><code>[disabled]</code><br><code>[label]</code></td>
    <td>See corresponding <a href="https://developer.mozilla.org/en-US/docs/Web/HTML/Element/optgroup#Attributes">optgroup attributes</a></td>
  </tr>
  <tr>
    <td><code>&lt;select&gt;</code></td>
    <td><code>[autofocus]</code><br><code>[disabled]</code><br><code>[multiple]</code><br><code>[required]</code><br><code>[size]</code></td>
    <td>See corresponding <a href="https://developer.mozilla.org/en-US/docs/Web/HTML/Element/select#Attributes">select attributes</a>.</td>
  </tr>
  <tr>
    <td><code>&lt;source&gt;</code></td>
    <td><code>[src]</code><br><code>[type]</code></td>
    <td>See corresponding <a href="https://developer.mozilla.org/en-US/docs/Web/HTML/Element/source#Attributes">source attributes</a>.</td>
  </tr>
  <tr>
    <td><code>&lt;track&gt;</code></td>
    <td><code>[label]</code><br><code>[src]</code><br><code>[srclang]</code></td>
    <td>See corresponding <a href="https://developer.mozilla.org/en-US/docs/Web/HTML/Element/track#Attributes">track attributes</a>.</td>
  </tr>
  <tr>
    <td><code>&lt;textarea&gt;</code></td>
    <td><code>[autocomplete]</code><br><code>[autofocus]</code><br><code>[cols]</code><br><code>[disabled]</code><br><code>[maxlength]</code><br><code>[minlength]</code><br><code>[placeholder]</code><br><code>[readonly]</code><br><code>[required]</code><br><code>[rows]</code><br><code>[selectiondirection]</code><br><code>[selectionend]</code><br><code>[selectionstart]</code><br><code>[spellcheck]</code><br><code>[wrap]</code></td>
    <td>See corresponding <a href="https://developer.mozilla.org/en-US/docs/Web/HTML/Element/textarea#Attributes">textarea attributes</a>.</td>
  </tr>
</table>
<sup>*</sup>Denotes bindable attributes that don't have a non-bindable counterpart.

## Debugging

Test in development mode (with the URL fragment `#development=1`) to highlight warnings and errors during development and to access special debugging functions.

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
    <td class="col-fourty"><em>Binding to [someBogusAttribute] on &lt;P> is not allowed</em>.</td>
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

An `amp-state` element may contain either a child `<script>` element **OR** a `src` attribute containing a CORS URL to a remote JSON endpoint, but not both.

```html
<amp-state id="myLocalState">
  <script type="application/json">
    {
      "foo": "bar"
    }
  </script>
</amp-state>

<amp-state id="myRemoteState" src="https://data.com/articles.json">
</amp-state>
```

#### XHR batching

AMP batches XMLHttpRequests (XHRs) to JSON endpoints, that is, you can use a single JSON data request as a data source for multiple consumers (e.g., multiple `amp-state` elements) on an AMP page.  For example, if your `amp-state` element makes an XHR to an endpoint, while the XHR is in flight, all subsequent XHRs to the same endpoint won't trigger and will instead return the results from the first XHR.

#### Attributes

<table>
  <tr>
    <td width="40%"><strong>src</strong></td>
    <td><p>The URL of the remote endpoint that will return the JSON that will update this <code>amp-state</code>. This must be a CORS HTTP service.</p>
<p>The <code>src</code> attribute allows all standard URL variable substitutions. See the <a href="../../spec/amp-var-substitutions.md">Substitutions Guide</a> for more info.</p>
<p>{% call callout('Important', type='caution') %}
  The endpoint must implement the requirements specified in the <a href="https://amp.dev/documentation/guides-and-tutorials/learn/amp-caches-and-cors/amp-cors-requests">CORS Requests in AMP</a> spec.
  {% endcall %}</p></td>
  </tr>
  <tr>
    <td width="40%"><strong>credentials (optional)</strong></td>
    <td><p>Defines a <code>credentials</code> option as specified by the <a href="https://fetch.spec.whatwg.org/">Fetch API</a>.</p>
<ul>
  <li>Supported values: `omit`, `include`</li>
  <li>Default: `omit`</li>
</ul>
<p>To send credentials, pass the value of <code>include</code>. If this value is set, the response must follow the <a href="https://amp.dev/documentation/guides-and-tutorials/learn/amp-caches-and-cors/amp-cors-requests#cors-security-in-amp">AMP CORS security guidelines</a>.</p></td>
  </tr>
</table>

### Deep-merge with `AMP.setState()`

When `AMP.setState()` is called `amp-bind` deep-merges the provided object literal with the current state. All variables from the object literal are written to the state directly except for nested objects, which are recursively merged. Primitives and arrays are in the state are always overwritten by variables of the same name in the object literal.

Consider the following example:

```javascript
{
<!-- State is empty -->
}
```

```html
<button on="tap:AMP.setState({employee: {name: 'John Smith', age: 47, vehicle: 'Car'}})"...></button>
<button on="tap:AMP.setState({employee: {age: 64}})"...></button>
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

Please note that `amp-bind` will throw an error if you call `AMP.setState()` with an object literal that contains circular references.

#### Removing a variable

Remove an existing state variable by setting its value to `null` in `AMP.setState()`. Starting with the state from the previous example, pressing:

```html
<button on="tap:AMP.setState({employee: {vehicle: null}})"...></button>
```

Will change the state to:

```javascript
{
  employee: {
    name: 'John Smith',
    age: 48,
  }
}
```

Similarly:

```html
<button on="tap:AMP.setState({employee: null})"...></button>
```

Will change the state to:

```javascript
{
<!-- State is empty -->
}
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

operation:
    '!' expr
  | '-' expr
  | '+' expr
  | expr '+' expr
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

invocation:
    expr '.' NAME args

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

variable:
    NAME
  ;

literal:
    STRING
  | NUMBER
  | TRUE
  | FALSE
  | NULL
  | object_literal
  | array_literal

array_literal:
    '[' ']'
  | '[' array ']'

array:
    expr
  | array ',' expr

object_literal:
    '{' '}'
  | '{' object '}'

object:
    key_value
  | object ',' key_value

key_value:
  expr ':' expr
```
