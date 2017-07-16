# <a name="amp-bind"></a> `amp-bind`

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

<table>
  <tr>
    <td class="col-fourty"><strong>Description</strong></td>
    <td>Adds custom interactivity with data binding and expressions.</td>
  </tr>
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
    <td class="col-fourty"><strong>Codelabs</strong></td>
    <td><a href="https://codelabs.developers.google.com/codelabs/advanced-interactivity-in-amp/">Advanced Interactivity in AMP</a> highlights a sophisticated e-commerce use case.</td>
  </tr>
</table>

[TOC]

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

<button on="tap:AMP.setState({foo: 'amp-bind'})">
```

### How does it work?

`amp-bind` has three main components:

1. [State](#state): A document-scope, mutable JSON state. In the example above, the state is empty before tapping the button.  After tapping the button, the state is `{foo: 'amp-bind'}`.
2. [Expressions](#expressions): These are JavaScript-like expressions that can reference the **state**. The example above has a single expression, `'Hello' + foo`, which concatenates the string literal `'Hello '` and the variable state `foo`.
3. [Bindings](#bindings): These are special attributes of the form `[property]` that link an element's property to an **expression**. The example above has a single binding, `[text]`, which updates the `<p>` element's text every time the expression's value changes.

{% call callout('Note', type='note') %}
`amp-bind` does not evaluate expressions on page load, so there's no risk of content jumping unexpectedly. `amp-bind` also takes special care to ensure speed, security and performance on AMP pages.
{% endcall %}

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

#### Updating state with `AMP.setState()`

The [`AMP.setState()` action](../../spec/amp-actions-and-events.md) merges an object literal into the state. For example, when the below button is pressed, `AMP.setState()` will [deep-merge](#deep-merge-with-ampsetstate) the object literal with the state.

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


 See [Actions and Events in AMP](../../spec/amp-actions-and-events.md) for more details.

### Expressions

Expressions are similar to JavaScript with some important differences.

#### Differences from JavaScript

- Expressions may only access the containing document's [state](#state).
- Expressions **do not** have access to globals like `window` or `document`.
- Only [white-listed functions](#white-listed-functions) are allowed.
- Custom functions, classes and some control flow statements (e.g. `for`) are disallowed.
- Undefined variables and array-index-out-of-bounds return `null` instead of `undefined` or throwing errors.
- A single expression is currently capped at 50 operands for performance reasons. Please [contact us](https://github.com/ampproject/amphtml/issues/new) if this is insufficient for your use case.

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
    <td><a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array#Methods"><code>Array</code></a></td>
    <td class="col-thirty"><code>concat</code><br><code>includes</code><br><code>indexOf</code><br><code>join</code><br><code>lastIndexOf</code><br><code>slice</code></td>
    <td><pre>// Returns true.
[1, 2, 3].includes(1)</pre></td>
  </tr>
  <tr>
   <td><a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String#Methods"><code>String</code></a></td>
    <td><code>charAt</code><br><code>charCodeAt</code><br><code>concat</code><br><code>indexOf</code><br><code>lastIndexOf</code><br><code>slice</code><br><code>split</code><br><code>substr</code><br><code>substring</code><br><code>toLowerCase</code><br><code>toUpperCase</code></td>
    <td><pre>// Returns 'abcdef'.
'abc'.concat('def')</pre></td>
  </tr>
  <tr>
    <td><a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math"><code>Math</code></a><sup>2</sup></td>
    <td><code>abs</code><br><code>ceil</code><br><code>floor</code><br><code>max</code><br><code>min</code><br><code>random</code><br><code>round</code><br><code>sign</code></td>
    <td><pre>// Returns 1.
abs(-1)</td>
  </tr>
  <tr>
    <td><a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects"><code>Global</code></a><sup>2</sup></td>
    <td><code>encodeURI</code><br><code>encodeURIComponent</code></td>
    <td><pre>// Returns 'hello%20world'
encodeURIComponent('hello world')</pre></td>
  </tr>
  <tr>
    <td><a href="#custom-built-in-functions">Custom built-ins</a><sup>2</sup></td>
    <td><code>copyAndSplice</code></td>
    <td><pre>// Returns [1, 47 ,3].
copyAndSplice([1, 2, 3], 1, 1, 47)</pre></td>
  </tr>
</table>

<sup>2</sup>Functions are not namespaced, e.g. use `abs(-1)` instead of `Math.abs(-1)`.

### Bindings

A **binding** is a special attribute of the form `[property]` that links an element's property to an [expression](#expressions).

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
    <td>Size of <a href="https://www.ampproject.org/docs/reference/components">AMP elements</a></td>
    <td><code>[width]</code><br><code>[height]</code></td>
    <td>Changes the width and/or height of the AMP element.</td>
  </tr>
  <tr>
    <td>Element-specific attributes</td>
    <td><a href="#element-specific-attributes">Various</a></td>
    <td></td>
  </tr>
</table>

Notes on Bindings:

- For security reasons, binding to `innerHTML` is disallowed.
- All attribute bindings are sanitized for unsafe values (e.g., `javascript:`).
- Boolean expression results toggle boolean attributes. For example: `<amp-video [controls]="expr"...>`. When `expr` evaluates to `true`, the `<amp-video>` element has the `controls` attribute. When `expr` evaluates to `false`, the `controls` attribute is removed.


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
    <td><code>[slide]</code><sup>1</sup></td>
    <td>Changes the currently displayed slide index. <a href="https://ampbyexample.com/advanced/image_galleries_with_amp-carousel/#linking-carousels-with-amp-bind">See an example</a>.</td>
  </tr>
  <tr>
    <td><code>&lt;amp-iframe&gt;</code></td>
    <td><code>[src]</code></td>
    <td>Changes the iframe's source URL.</td>
  </tr>
  <tr>
    <td><code>&lt;amp-img&gt;</code></td>
    <td><code>[alt]</code><br><code>[attribution]</code><br><code>[src]</code><br><code>[srcset]</code></td>
    <td>When binding to <code>[src]</code>, make sure you also bind to <code>[srcset]</code> in order to make the binding work on cache.<br>See corresponding <a href="https://www.ampproject.org/docs/reference/components/media/amp-img#attributes">amp-img attributes</a>.</td>
  </tr>
  <tr>
    <td rowspan=2><code>&lt;amp-list&gt;</code></td>
    <td><code>[src]</code></td>
    <td>Fetches JSON from the new URL and re-renders, replacing old content.</td>
  </tr>
  <tr>
    <td><code>[state]</code></td>
    <td>Renders using local JSON state at the provided expression.</td>
  </tr>
  <tr>
    <td><code>&lt;amp-selector&gt;</code></td>
    <td><code>[selected]</code><sup>1</sup></td>
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
    <td>See corresponding <a href="https://www.ampproject.org/docs/reference/components/media/amp-video#attributes">amp-video attributes</a>.</td>
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
    <td><code>&lt;fieldset&gt;</code></td>
    <td><code>[disabled]</code></td>
    <td>Enables or disables the fieldset.</td>
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
<sup>1</sup>Denotes bindable attributes that don't have a non-bindable counterpart.

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

In development mode, use `AMP.printState()` to print the current state to the console.

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

#### Attributes

**src**

The URL of the remote endpoint that will return the JSON that will update this `amp-state`. This must be a CORS HTTP service.

The `src` attribute allows all standard URL variable substitutions. See the [Substitutions Guide](../../spec/amp-var-substitutions.md) for more info.

{% call callout('Important', type='caution') %}
The endpoint must implement the requirements specified in the [CORS Requests in AMP](../../spec/amp-cors-requests.md) spec.
{% endcall %}


**credentials** (optional)

Defines a `credentials` option as specified by the [Fetch API](https://fetch.spec.whatwg.org/).

* Supported values: `omit`, `include`
* Default: `omit`

To send credentials, pass the value of `include`. If this value is set, the response must follow the [AMP CORS security guidelines](../../spec/amp-cors-requests.md).


### Non-standard built-in functions

`amp-bind` supports the following non-standard functions:

<table>
  <tr>
    <th>Name</th>
    <th>Details</th>
  </tr>
  <tr>
    <td><code>copyAndSplice</code></td>
    <td>Similar to <a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/splice">Array#splice()</a> except a copy of the spliced array is returned.
    <br><br>Arguments:
    <ul>
      <li><code>array</code>: An array.</li>
      <li><code>start</code>: Index at which to start changing the array.</li>
      <li><code>deleteCount</code>: The number of items to delete, starting at index <code>start</code>.</li>
      <li><code>items...</code>: Items to add to the array, beginning at index <code>start</code></li>
    </ul>
    <br><br>Examples:
    <pre>// Deleting an element. Returns [1, 3]
copyAndSplice([1, 2, 3], 1, 1)

// Replacing an item. Returns ['Pizza', 'Cake', 'Ice Cream']
copyAndSplice(['Pizza', 'Cake', 'Soda'], 2, 1, 'Ice Cream')</pre>
   </td>
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
