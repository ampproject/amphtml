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

## Usage

The `amp-bind` component enables custom stateful interactivity on AMP pages.

For performance, and to avoid the risk of unexpected content jumping, `amp-bind` does not evaluate expressions on page load. This means visual elements should be given a default state and not rely on `amp-bind` for initial render.

<figure class="alignment-wrapper  margin-">
<amp-youtube
    data-videoid="xzCFU8b5fCU"
    layout="responsive"
    width="480" height="270"></amp-youtube>
<figcaption>Watch this video for an introduction to amp-bind.</figcaption></figure>

`amp-bind` has three main concepts:

1. [State](#state): A document-scope, mutable JSON state. State variables update in response to user actions. `amp-bind` does not evaluate expressions on page load. Visual elements should have their default "state" defined and not rely `amp-bind` for initial render.
2. [Expressions](#expressions): JavaScript-like expressions that can reference the **state**.
3. [Bindings](#bindings): Special attributes that link an element's property to a **state** via an **expression**. A property is bound by wrapping it inside brackets, in the form of `[property]`.

### Example without declared state

[example preview="inline" playground="true" imports="amp-bind"]

```html
<p [text]="'Hello ' + foo">Hello World</p>

<button on="tap:AMP.setState({foo: 'Interactivity'})">
  Say "Hello Interactivity"
</button>
```

[/example]

In the example above:

-   The **state** begins as empty.
-   It has a single **binding** to `[text]`, the text content of a node, on the `<p>` element.
-   The `[text]` value contains the **expression**, `'Hello ' + foo`. This expression concatenates the string 'Hello ' and the value of the **state variable** foo.

When the user taps/clicks the button:

1. It triggers the `tap` event.
1. The `tap` event invokes the `AMP.setState()` method.
1. The `AMP.setState()` methods sets the `foo` **state variable** to the value of `Interactivity`.
1. The state is no longer empty, so the page updates the bound property to its state.

[tip type="note"]
Calling `AMP.setState()` in some examples may set or change states of other examples on page. Refresh this page to see examples before `AMP.setState()`.
[/tip]

### Example with declared state

[filter formats="websites, ads"]

[example preview="top-frame" playground="true" imports="amp-bind"]

```html
<head>
  <style amp-custom>
    .greenBorder {
      border: 5px solid green;
    }
    .redBorder {
      border: 5px solid red;
    }
    .defaultBorder {
      border: 5px solid transparent;
    }
  </style>
</head>
<body>
  <amp-state id="theFood">
    <script type="application/json">
      {
        "cupcakes": {
          "imageUrl": "https://amp.dev/static/samples/img/image2.jpg",
          "style": "greenBorder"
        },
        "sushi": {
          "imageUrl": "https://amp.dev/static/samples/img/image3.jpg",
          "style": "redBorder"
        }
      }
    </script>
  </amp-state>
  <div class="defaultBorder" [class]="theFood[currentMeal].style || 'defaultBorder'">
    <p>Each food has a different border color.</p>
    <p [text]="'I want to eat ' + currentMeal + '.'">I want to eat cupcakes.</p>
    <amp-img
      width="300"
      height="200"
      src="https://amp.dev/static/samples/img/image2.jpg"
      [src]="theFood[currentMeal].imageUrl"
    >
    </amp-img>
    <button on="tap:AMP.setState({currentMeal: 'sushi'})">Set to sushi</button>
    <button on="tap:AMP.setState({currentMeal: 'cupcakes'})">
      Set to cupcakes
    </button>
  </div>
</body>
```

[/example]

In the example above:

-   The `<amp-state>` component declares state using JSON. The `<amp-state>` element has an `id` of `theFood` to allow us to reference the defined data. But because `<amp-bind>` does not evaluate `<amp-state>` on page load, the **state** is empty.
-   The page loads with visual defaults.
    -   The `<div>` element has `class="greenBorder"` defined.
    -   The second `<p>` element has "I want cupcakes." defined within the tags.
    -   The `<amp-img>` `src` points to a url.
-   Changeable elements have **bindings** that point to **expressions**.
    -   The `[class]` attribute on the `<div>` is bound to the `theFood[currentMeal].style` **expression**.
    -   The `[text]` attribute on the second `<p>` is bound to the `'I want to eat ' + currentMeal + '.'` **expression**.
    -   The `[src]` attribute is bound to the `theFood[currentMeal].imageUrl` **expression**.

If a user clicks the "Set to sushi" button:

1. The `tap` event trigger the `AMP.setState` action.
1. The setState action turns `currentMeal` into a state and sets it to `sushi`.
1. AMP evaluates **bindings** with **expressions** that contain the state `currentMeal`.
1. `[class]="theFood[currentMeal].style"` updates `class` to `redBorder`.
1. `[text]="'I want to eat ' + currentMeal + '.'"` updates the inner text of the second `<p>` element to "I want to eat sushi".
1. `[src]="theFood[currentMeal].imageUrl` updates the `src` of `<amp-img>` to `https://amp.dev/static/samples/img/image3.jpg`

Using `[class]="theFood[currentMeal].style"` as an example of **expression** syntax evaluation:

-   `[class]` is the property to update.
-   `theFood` is the id of the `<amp-state>` component.
-   `currentMeal` is the state name. In the case of `theFood` it will be `cupcakes` or `sushi`.
-   `style` is the **state variable**. It corresponds to the matching JSON key, and sets the bound property to that key's value.

[/filter] <!-- formats="websites, ads" -->

[filter formats="email"]

[example preview="top-frame" playground="true" imports="amp-bind"]

```html
  <style amp-custom>
    .greenBorder {
      border: 5px solid green;
    }
    .redBorder {
      border: 5px solid red;
    }
  </style>
</head>
<body>
<amp-state id="theFood">
  <script type="application/json">
    {
      "cupcakes": {
        "style": "greenBorder",
        "text": "Just kidding, I want to eat cupcakes."
      },
      "sushi": {
        "style": "redBorder",
        "text": "Actually, I want to eat sushi."
      }
    }
  </script>
</amp-state>
<div class="greenBorder" [class]="theFood[currentMeal].style">
  <p>Each food has a different border color.</p>
  <p [text]="theFood[currentMeal].text">I want to eat cupcakes.</p>
  <button on="tap:AMP.setState({currentMeal: 'sushi'})">Set to sushi</button>
  <button on="tap:AMP.setState({currentMeal: 'cupcakes'})">Set to cupcakes</button>
</div>
```

[/example]

-   The `<amp-state>` component declares state using a JSON object. It has an `id` of `theFood` to allow us to reference the defined data. But because `<amp-bind>` does not evaluate `<amp-state>` on email load, the **state** is empty.
-   The page loads with visual defaults.
-   The `<div>` element has `class="greenBorder"` defined.
-   The second `<p>` element has "I want cupcakes." defined within the tags.
-   The `<amp-img>` `src` points to a url.
-   Changeable elements have **bindings** that point to **expressions**.
-   The `[class]` attribute on the `<div>` is bound to the `theFood[currentMeal].style` **expression**.
-   The `[text]` attribute on the second `<p>` is bound to the `theFood[currentMeal].text` **expression**.

If a user clicks the "Set to sushi" button:

1. The `tap` event trigger the `AMP.setState` action.
1. The setState action turns `currentMeal` into a state and sets it to `sushi`.
1. AMP evaluates **bindings** with **expressions** that contain the state `currentMeal`.
1. `[class]="theFood[currentMeal].style` updates `class` to `redBorder`.
1. `theFood[currentMeal].text` updates the inner text of the second `<p>` element to "Actually, I want to eat sushi.".

Using `[class]="theFood[currentMeal].style"` as an example of **expression** syntax evaluation:

-   `[class]` is the property to update
-   `theFood` is the id of the `<amp-state>` component.
-   `currentMeal` is the state name. In the case of `theFood` it will be `cupcakes` or `sushi`.
-   `style` is the **state variable**. It corresponds to the matching JSON key, and sets the bound property to that key's value.

[/filter] <!-- formats="email" -->

### `<amp-state>` specification

[filter formats="websites, ads"]
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

As an `amp-state` element stores a JSON object literal, you can also initialize
it with an object, as above, or with a constant.

```html
<amp-state id="singleton">
  <script type="application/json">
    'I am a string'
  </script>
</amp-state>
```

[/filter] <!-- formats="websites, ads" -->

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

[filter formats="websites, ads"]

## Attributes

### `src` (optional)

The URL of the remote endpoint that must return JSON, which is used to this `amp-state`. This must be a HTTP service with a proper CORS configuration for the page. The `src` attribute allows all standard URL variable substitutions. See the [Substitutions Guide](../../docs/spec/amp-var-substitutions.md) for more info.

AMP batches XMLHttpRequests (XHRs) to JSON endpoints, that is, you can use a single JSON data request as a data source for multiple consumers (e.g., multiple `amp-state` elements) on an AMP page.

For example, if your `amp-state` element makes an XHR to an endpoint, while the XHR is in flight, all subsequent XHRs to the same endpoint won't trigger and will instead return the results from the first XHR.

[tip type="important"]
The endpoint must implement the requirements specified in the [CORS Requests in AMP](https://amp.dev/documentation/guides-and-tutorials/learn/amp-caches-and-cors/amp-cors-requests) spec.
[/tip]

### `credentials` (optional)

Defines a `credentials` option as specified by the [Fetch API](https://fetch.spec.whatwg.org/).

-   Supported values: `omit`, `include`
-   Default: `omit`

To send credentials, pass the value of `include`. If this value is set, the response must follow the [AMP CORS security guidelines](https://amp.dev/documentation/guides-and-tutorials/learn/amp-caches-and-cors/amp-cors-requests/#cors-security-in-amp).

## Actions

### `refresh`

The `refresh` action refetches data from data point the `src` attribute points to. This action will make a network request bypassing the browser's caching mechanisms.

[example preview="inline" playground="true" imports="amp-bind"]

```html
<amp-state id="currentTime" src="/documentation/examples/api/time"></amp-state>
<button on="tap:currentTime.refresh">
  Refresh
</button>
<div [text]="currentTime.time"></div>
```

[/example]

We recommend [`amp-script`](../amp-script/amp-script.md) for most use cases working with live content. In a subset of cases, `refresh` with `amp-bind` will work.

[/filter] <!-- formats="websites, ads" -->

## State

Each AMP document that uses `amp-bind` has document-scope mutable JSON data, or **state**.

### Size

An `<amp-state>` element's JSON data has a maximum size of 100KB.

### Defining and initializing state with `<amp-state>`

Expressions are not evaluated on page load, but you may define an initial state. The `<amp-state>` component contains different **states** and their **state variables**. While this defines a **state**, it will not reflect on the page until after a user interacts.

[example preview="inline" playground="true" imports="amp-bind"]

```html
<amp-state id="myDefinedState">
  <script type="application/json">
    {
      "foo": "bar"
    }
  </script>
</amp-state>
<p [text]="myDefinedState.foo"></p>
<button on="tap:AMP.setState({})">See value of initialized state</button>
```

[/example]

Use [expressions](#expressions) to reference **state variables**. If the JSON data is not nested in the `<amp-state>` component, reference the states via dot syntax. In the above example, `myState.foo` evaluates to "bar".

An `<amp-state>` element can also specify a CORS URL instead of a child JSON script. See the [`<amp-state>` specification](#amp-state-specification) for details.

```html
<amp-state id="myRemoteState" src="/static/samples/json/websites.json">
</amp-state>
```

### Updating state variables with `AMP.setState()`

The [`AMP.setState()`](../../docs/spec/amp-actions-and-events.md#amp) action merges an object literal into the state. This means you can update the value of a defined state variable.

[example preview="inline" playground="true" imports="amp-bind"]

```html
<amp-state id="myUpdateState">
  <script type="application/json">
    {
      "foo": "bar",
      "baz": "hello"
    }
  </script>
</amp-state>
<p [text]="myUpdateState.foo"></p>
<p [text]="myUpdateState.baz"></p>
<button on="tap:AMP.setState({})">See value of set state</button>
<!-- Like JavaScript, you can reference existing
     variables in the values of the  object literal. -->
<button on="tap:AMP.setState({myUpdateState:{baz: myUpdateState.foo}})">
  Set value of baz to value of foo
</button>
<button on="tap:AMP.setState({myUpdateState:{baz: 'world'}})">
  Set value of baz to "world"
</button>
```

[/example]

In the example above, triggering the `AMP.setState({})` action on the first button evaluates the `[text]` binding expression. It then inserts the defined **state variable's** value into the `<p>` tag.

When the clicking the second button, with `AMP.setState({myState:{baz: myState.foo}})` action defined, it [deep-merges](#deep-merge-with-ampsetstate) the "baz" **state variable** value to the same as the "foo" **state variable** value. Both `<p>` tags display "bar".

**State variable** values can update to values not defined in the initial state. When clicking the third button, with `"tap:AMP.setState({myState:{baz: 'world'}})"` action defined, it deep merges the "baz" **state variable** value, overriding it to "world".

Clicking the first button after the other two sets the current state. Nothing will change.

The **state variables** reverts back to the defined JSON in `<amp-state>` on page refresh.

##### Event triggering and data

When triggered by certain events, `AMP.setState()` can access event-related data on the `event` property.

[example preview="inline" playground="true" imports="amp-bind"]

```html
<!-- The "change" event of this <input> element contains
     a "value" variable that can be referenced via "event.value". -->
<select on="change:AMP.setState({ option: event.value })">
  <option value="0">No selection</option>
  <option value="1">Option 1</option>
  <option value="2">Option 2</option>
</select>
<div hidden [hidden]="option != 1">
  Option 1
</div>
<div hidden [hidden]="option != 2">
  Option 2
</div>
```

[/example]

#### Updating nested variables

Nested objects are generally merged to a maximum depth of 10. All variables, including those defined in `<amp-state>`, can be overidden.

[example preview="inline" playground="true" imports="amp-bind"]

```html
<amp-state id="myState">
  <script type="application/json">
    {
      "foo": "bar",
      "first": {
        "a": "nested once",
        "ab": {
          "b": "nested twice",
          "bc": {
            "c": "nested three times",
            "cd": {
              "d": "nested four times",
              "de": {
                "e": "nested five times",
                "ef": {
                  "f": "nested six times",
                  "fg": {
                    "g": "nested seven times",
                    "gh": {
                      "h": "nested nine times",
                      "hi": {
                        "i": "nested ten times"
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  </script>
</amp-state>
<p [text]="myState.foo"></p>
<p [text]="myState.first.ab.bc.cd.de.ef.fg.gh.hi.i"></p>
<button on="tap:AMP.setState({})">See value of set state</button>
<button
  on="tap:AMP.setState({ myState: {first: {ab: {bc: {cd: {de: {ef: {fg: {gh: {hi: {i:'this is as far as you should merge nested values'} } } } } } } } } } })"
>
  Merge 10th nested object
</button>
```

[/example]

#### Circular references

`AMP.setState(object)` throws an error if `object` contains a circular reference.

#### Removing a variable

Remove an existing state variable by setting its value to `null` in `AMP.setState()`.

```html
<button on="tap:AMP.setState({removeMe: null})"></button>
```

#### Deep-merge with `AMP.setState()`

Calling `AMP.setState()` deep-merges the provided object literal with the current state. `amp-bind` writes all literals to the state directly, except for nested objects, which are recursively merged. Primitives and arrays are in the state are always overwritten by variables of the same name in the object literal.

[example preview="inline" playground="true" imports="amp-bind"]

```html
<p [text]="employee.name">Name</p>
<p [text]="employee.age">Age</p>
<p [text]="employee.vehicle">Vehicle</p>
<!-- Pressing this button changes state to: -->
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
<!-- Pressing this button recursively merges the object literal argument,  -->
<!-- `{employee: {age: 64}}`, into the existing state. -->

<button
  on="tap:AMP.setState({
              employee: {
                age: 64
              }
            })"
>
  Set employee age to 64
</button>
<!-- The value updates from 47 to 64 at employee.age.  -->
<!-- No other values change. -->
```

[/example]

[filter formats="websites, ads"]

### Modifying history with `AMP.pushState()`

`AMP.pushState()` writes state changes to the history. Navigating back, will restore the previous state. To test this, increase the count in the example below and use your browser's back button to decrease the count.

[example preview="inline" playground="true" imports="amp-bind"]

```html
<amp-state id="count">
  <script type="application/json">
    1
  </script>
</amp-state>
<div>Item <span [text]="count">1</span></div>
<button on="tap:AMP.pushState({ count: count + 1 })">Increase count</button>
```

[/example]

Using `AMP.pushState()` sets the current state to the most recent pushed state.

[/filter] <!-- formats="websites, ads" -->

## Expressions

`amp-bind` uses JavaScript-like expressions that can reference the state.

### Differences from JavaScript

-   Expressions may only access the containing document's [state](#state).
-   Expressions **do not** have access to `window` or `document`. `global` references the top-level state.
-   Only `amp-bind` [allowlisted functions](#allowlisted-functions) and operators are usable. are usable. Use of arrow functions are allowed as function parameters, e.g. `[1, 2, 3].map(x => x + 1)`.
    -   Custom functions, classes and loops are disallowed.
-   Undefined variables and array-index-out-of-bounds return `null` instead of `undefined` or throwing errors.
-   A single expression is currently capped at 250 operands for performance. Please [contact us](https://github.com/ampproject/amphtml/issues/new/choose) if this is insufficient for your use case.

The following are all valid expressions:

[example preview="inline" playground="true" imports="amp-bind"]

```html
<p [text]="myExpressionsState.foo"></p>
<!-- 1 + '1'; // 11 -->
<button on="tap:AMP.setState({myExpressionsState: {foo: 1 + '1'}})">
  foo: 1 + "1"
</button>
<!-- 1 + +'1'; // 2 -->
<button on="tap:AMP.setState({myExpressionsState: {foo: 1 + + '1'}})">
  foo: 1 + + "1"
</button>
<!-- !0; // true -->
<button on="tap:AMP.setState({myExpressionsState: {foo: !0}})">foo: !0</button>
<!-- null || 'default'; // 'default' -->
<button on="tap:AMP.setState({myExpressionsState: {foo: null || 'default'}})">
  null || "default"
</button>
<!-- [1, 2, 3].map(x => x + 1); // 2,3,4 -->
<button
  on="tap:AMP.setState({myExpressionsState: {foo: [1, 2, 3].map(x => x + 1)}})"
>
  [1, 2, 3].map(x => x + 1)
</button>
```

[/example]

Find the full expression grammar and implementation in [bind-expr-impl.jison](./0.1/bind-expr-impl.jison) and [bind-expression.js](./0.1/bind-expression.js).

### Allowlisted functions

#### [`Array`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array#Methods)

Single-parameter arrow functions can't have parentheses, e.g. use `x => x + 1` instead of `(x) => x + 1`. `sort()` and `splice()` return modified copies instead of operating in-place.

-   [concat](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/concat)
-   [filter](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/filter)
-   [includes](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/includes)
-   [indexOf](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/indexOf)
-   [join](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/join)
-   [lastIndexOf](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/lastIndexOf)
-   [map](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/map)
-   [reduce](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/reduce)
-   [slice](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/slice)
-   [some](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/some)
-   [sort](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/sort)
-   [splice](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/splice) (not-in-place)

[example preview="inline" playground="true" imports="amp-bind"]

```html
<amp-state id="myArrayState">
  <script type="application/json">
    {
      "foo": [1, 2, 3],
      "bar": ["hello", "world", "bar", "baz"],
      "baz": "Hello world, welcome to amp-bind"
    }
  </script>
</amp-state>
<p [text]="'concat: ' + myArrayState.foo.concat(4)">concat: 1, 2, 3</p>
<p [text]="'filter: ' + myArrayState.bar.filter(word => word.length > 3)">
  filter: words with less than three letter
</p>
<p [text]="'includes: ' + myArrayState.bar.includes('hello' || 'world')">
  includes: "hello" or "world"
</p>
<p [text]="'indexOf: ' + myArrayState.bar.indexOf('world')">indexOf: "world"</p>
<p [text]="'join: ' + myArrayState.bar.join('-')">
  join: all words with a dash
</p>
<p [text]="'lastIndexOf: ' + myArrayState.baz.lastIndexOf('amp-bind')">
  lastIndexOf: "amp-bind"
</p>
<p [text]="'map: ' + myArrayState.foo.map((x, i) => x + i)">
  map: add each number to previous number
</p>
<p [text]="'reduce: ' + myArrayState.foo.reduce((x, i) => x + i)">
  reduce: add all numbers in array together
</p>
<p [text]="'slice: ' + myArrayState.bar.slice(1,3)">
  slice: return words at index 1 and 3
</p>
<p [text]="'some: ' + myArrayState.foo.some(x => x < 2)">
  some: some numbers are less than 2
</p>
<p [text]="'sort: ' + myArrayState.bar.sort()">
  sort: place words in alphabetical order
</p>
<p [text]="'splice: ' + myArrayState.bar.splice(2, 0, 'amp-bind')">
  splice: place "amp-bind" at index 2
</p>
<button on="tap:AMP.setState({})">Evaluate</button>
```

[/example]

#### [`Number`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number#Methods)

-   [toExponential](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number/toExponential)
-   [toFixed](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number/toFixed)
-   [toPrecision](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number/toPrecision)
-   [toString](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number/toString)

[example preview="inline" playground="true" imports="amp-bind"]

```html
<p [text]="'toExponential: ' + (100).toExponential(5)">
  toExponential: 100 to the exponent of 5
</p>
<p [text]="'toFixed: ' + (1.99).toFixed(1)">
  toFixed: 1.99 rounded and fixed to first decimal
</p>
<p [text]="'toPrecision: ' + (1.234567).toPrecision(3)">
  toPrecision: 1.234567 returned as a string to the third digit
</p>
<p [text]="'toString ' + (3.14).toString()">
  toString: 3.14 returned as a string
</p>
<button on="tap:AMP.setState({})">Evaluate</button>
```

[/example]

#### [`String`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String#Methods)

-   [charAt](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/charAt)
-   [charCodeAt](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/charCodeAt)
-   [concat](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/concat)
-   [indexOf](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/indexOf)
-   [lastIndexOf](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/indexOf)
-   [replace](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/replace)
-   [slice](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/slice)
-   [split](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/split)
-   [substr](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/substr)
-   [toLowerCase](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/toLowerCase)
-   [toUpperCase](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/toUpperCase)

[example preview="inline" playground="true" imports="amp-bind"]

```html
<amp-state id="myStringState">
  <script type="application/json">
    {
      "foo": "Hello world",
      "bar": ", welcome to amp-bind"
    }
  </script>
</amp-state>
<p [text]="'charAt: ' + myStringState.foo.charAt(6)">
  charAt: The character at index 6
</p>
<p [text]="'charCodeAt: ' + myStringState.foo.charCodeAt(6)">
  charCodeAt: The UTF-16 code unit of the character at index 6
</p>
<p [text]="'concat: ' + myStringState.foo.concat(myState.bar)">
  concat: Combine foo and bar
</p>
<p [text]="'lastIndexOf: ' + myStringState.foo.lastIndexOf('w')">
  lastIndexOf: The index of "w"
</p>
<p [text]="'replace: ' + myStringState.foo.replace('world', 'amp-bind')">
  replace: Replace "world" with "amp-bind"
</p>
<p [text]="'slice: ' + myStringState.foo.slice(5)">
  slice: Extract the first 5 characters
</p>
<p [text]="'split: ' + myStringState.foo.split(' ')">
  split: Split words at space and return as array
</p>
<p [text]="'toLowerCase: ' + myStringState.foo.toLowerCase()">
  toLowerCase: Make all letters lower case
</p>
<p [text]="'toUpperCase: ' + myStringState.foo.toUpperCase()">
  toUpperCase: Make all letters upper case
</p>
<button on="tap:AMP.setState({})">Evaluate</button>
```

[/example]

#### [`Math`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math)

Static functions are not namespaced, e.g. use `abs(-1)` instead of `Math.abs(-1)`

-   [abs](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/abs)
-   [ceil](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/ceil)
-   [floor](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/floor)
-   [max](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/max)
-   [min](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/min)
-   [pow](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/pow)
-   [random](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/random)
-   [round](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/round)
-   [sign](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/sign)

[example preview="inline" playground="true" imports="amp-bind"]

```html
<p [text]="'abs: ' + abs(5 - 9)">abs: absolute number of 5 - 9</p>
<p [text]="'ceil: ' + ceil(1.01)">
  abs: round 1.01 up to the next largest whole number
</p>
<p [text]="'floor: ' + floor(1.99)">floor: round 1.99 down to a whole number</p>
<p [text]="'max: ' + max(100, 4, 98)">max: return largest number</p>
<p [text]="'min: ' + min(100, 4, 98)">min: return smalled number</p>
<p [text]="'pow: ' + pow(5, 3)">pow: return 5 to the power of 3</p>
<p [text]="'random: ' + random()">
  random: return a number greater than 0 and less than 1
</p>
<p [text]="'round: ' + round(1.51)">round: round 1.51</p>
<p [text]="'sign: ' + sign(-9)">sign: evaluate if positive or negative</p>
<button on="tap:AMP.setState({})">Evaluate</button>
```

[/example]

#### [`Object`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object)

Static functions are not namespaced, e.g. use `keys(Object)` instead of `Object.abs(Object)`

-   [keys](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/keys)
-   [values](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/values)

[example preview="inline" playground="true" imports="amp-bind"]

```html
<amp-state id="myObjectState">
  <script type="application/json">
    {
      "hello": "world",
      "foo": "bar"
    }
  </script>
</amp-state>
<p [text]="'keys: ' + keys(myObjectState)">
  keys: myObjectState JSON object keys
</p>
<p [text]="'values: ' + values(myObjectState)">
  values: myObjectState JSON object values
</p>
<button on="tap:AMP.setState({})">Evaluate</button>
```

[/example]

#### [`Global`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects)

-   [encodeURI](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/encodeURI)
-   [encodeURIComponent](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/encodeURIComponent)

[example preview="inline" playground="true" imports="amp-bind"]

```html
<p [text]="'encodeURI: ' + encodeURI('https://amp.dev/😉')">
  encodeURI: Encode a URI and ignore protocol prefix
</p>
<p [text]="'encodeURIComponent: ' + encodeURIComponent('https://amp.dev/😉')">
  encodeURIComponent: Encode a URI
</p>
<button on="tap:AMP.setState({})">Evaluate</button>
```

[/example]

### Defining macros with `amp-bind-macro`

Reuse `amp-bind` expression fragments by defining an `amp-bind-macro`. The `amp-bind-macro` element allows an expression that takes zero or more arguments and references the current state. Invoke `amp-bind-macros` like a function, referencing the `id` attribute value from anywhere in the document.

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

## Bindings

A **binding** is a special attribute of the form `[property]` that links an element's property to an [expression](#expressions). Use the alternative,[XML-compatible](#react-and-xml-compatibility) syntax if developing in XML.

When the **state** changes, expressions tied to that state are evaluated. The element properties **bound** to the **state** are updated with the new expression results.

Boolean expression results toggle boolean attributes. For example: `<amp-video [controls]="expr"...>`. When `expr` evaluates to `true`, the `<amp-video>` element has the `controls` attribute. When `expr` evaluates to `false`, the `controls` attribute is removed.

[example preview="inline" playground="true" imports="amp-bind, amp-video"]

```html
<amp-video
  [controls]="controls"
  width="640"
  height="360"
  layout="responsive"
  poster="/static/inline-examples/images/kitten-playing.png"
>
  <source
    src="/static/inline-examples/videos/kitten-playing.webm"
    type="video/webm"
  />
  <source
    src="/static/inline-examples/videos/kitten-playing.mp4"
    type="video/mp4"
  />
  <div fallback>
    <p>This browser does not support the video element.</p>
  </div>
</amp-video>
<button on="tap:AMP.setState({ controls: true })">
  Controls
</button>
<button on="tap:AMP.setState({ controls: false })">
  No Controls
</button>
```

[/example]

### React and XML compatibility

If developing with React or XML, use the alternative `data-amp-bind-property` syntax. The `[` and `]` characters in attribute names is invalid XML, making the `[property]` syntax unavailable.

Replace the `property` field with the name of the property you would like to define in `data-amp-bind-property`.

For example, `[text]="myState.foo"` would become `data-amp-bind-text="myState.foo"`.

### Binding types

`amp-bind` supports data bindings on five types of element state.

[**Node.textContent**](https://developer.mozilla.org/en-US/docs/Web/API/Node/textContent)

Bind `Node.textContent` using the `[text]` attribute. The `[text]` attribute is supported on most text elements.

```html
<p [text]="'Hello ' + myState.foo">Hello World</p>
<p></p>
```

**CSS classes**

Bind an element's `class` using the `[class]` attribute. A `[class]` expression must result in a space-delimited string. Meaning, if you are binding multiple classes, use a space between names. A comma or dash will be evaluated as the class name.

[example preview="top-frame" playground="true" imports="amp-bind"]

```html
<head>
  <style amp-custom>
    .background-green {
      background: green;
    }
    .background-red {
      background: red;
    }
    .border-red {
      border-color: red;
      border-width: 5px;
      border-style: solid;
    }
  </style>
</head>
<body>
  <div class="background-red" [class]="myClass">Hello World</div>
  <!-- This button adds both classes -->
  <button on="tap:AMP.setState({ myClass: 'background-green border-red' })">
    Working: Change Class
  </button>
  <!-- String arrays also work -->
  <button
    on="tap:AMP.setState({ myClass: ['background-green', 'border-red'] })"
  >
    Working string array: Change Class
  </button>
  <!-- This expression evaluates to class="background-green,border-red" -->
  <button on="tap:AMP.setState({ myClass: 'background-green,border-red' })">
    Broken: Change Class
  </button>
</body>
```

[/example]

[**the `hidden` attribute**](https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes/hidden)

Hide and reveal and element using the `[hidden]` attribute. A `[hidden]` expression should be a boolean expression.

[example preview="inline" playground="true" imports="amp-bind"]

```html
<p [hidden]="hiddenState">Hello there!</p>
<button on="tap:AMP.setState({hiddenState: true})">Hide</button>
<button on="tap:AMP.setState({hiddenState: false})">Show</button>
```

[/example]

**Size of [AMP components](https://www.ampproject.org/docs/reference/components)**

Change the `width` and `height` using the `[width]` and `[height]` attributes.

[example preview="inline" playground="true" imports="amp-bind"]

```html
<amp-img
  src="https://unsplash.it/400/200"
  width="200"
  [width]="myImageDimension.width"
  height="100"
  [height]="myImageDimension.height"
>
</amp-img>
<button
  on="tap:AMP.setState({
              myImageDimension: {
              width: 400,
              height: 200
              }
              })"
>
  Change size
</button>
```

[/example]

**Accessibility states and properties**

Use to dynamically update information available to assistive technologies, such as screen readers. [All `[aria-*]` attributes](https://www.w3.org/WAI/PF/aria-1.1/states_and_properties) are bindable.

**AMP Component specific and HTML attributes**

Some AMP components and HTML elements have specific bindable attributes. They are listed below.

### AMP component specific attributes

[filter formats="websites"]

**`<amp-brightcove>`**

-   `[data-account]`
-   `[data-embed]`
-   `[data-player]`
-   `[data-player-id]`
-   `[data-playlist-id]`
-   `[data-video-id]` Changes the displayed Brightcove video.

[/filter] <!-- formats="websites" -->

**`<amp-carousel type=slides>`**

-   `[slide]` Changes the currently displayed slide index.

[See an example](https://amp.dev/documentation/examples/multimedia-animations/image_galleries_with_amp-carousel/#linking-carousels-with-amp-bind).

[filter formats="websites"]

**`<amp-date-picker>`**

-   `[min]` Sets the earliest selectable date
-   `[max]` Sets the latest selectable date

**`<amp-google-document-embed>`**

-   `[src]` Displays the document at the updated URL.
-   `[title]` Changes the document's title.

**`<amp-iframe>`**

-   `[src]` Changes the iframe's source URL.

[/filter] <!-- formats="websites" -->
[filter formats="websites, ads"]

**`<amp-img>`**

-   `[alt]`
-   `[attribution]`
-   `[src]`
-   `[srcset]`

Bind to `[srcset]` instead of `[src]` to support responsive images. See corresponding [`amp-img` attributes](../../src/builtins/amp-img/amp-img.md#attributes).
[/filter] <!-- formats="websites, ads" -->
[filter formats="email"]

**`<amp-img>`**

-   `[alt]`
-   `[attribution]`

[/filter] <!-- formats="email" -->

**`<amp-lightbox>`**

-   `[open]` Toggles display of the lightbox.

[tip type="default"]
Use `on="lightboxClose: AMP.setState(...)"` to update variables when the lightbox is closed.
[/tip]

[filter formats="websites"]

**`<amp-list>`**

-   `[src]`

If the expression is a string, it fetches and renders JSON from the string URL. If the expression is an object or array, it renders the expression data.

[/filter] <!-- formats="websites" -->

[filter formats="websites, email"]

**`<amp-selector>`**

-   `[selected]` Changes the currently selected children element(s) identified by their `option` attribute values. Supports a comma-separated list of values for multiple selection. [See an example](https://amp.dev/documentation/examples/multimedia-animations/image_galleries_with_amp-carousel/?format=email#linking-carousels-with-amp-bind).
-   `[disabled]`

[tip type="note"]
`[selected]` does not have a non-bindable attribute. The AMP Validator will throw an error if `selected` is used.
[/tip]

[/filter] <!-- formats="websites, email" -->

[filter formats="websites, ads"]

**`<amp-state>`**

-   `[src]`

Fetches JSON from the new URL and merges it into the existing state. The following update will ignore `<amp-state>`elements to prevent cycles.

[/filter] <!-- formats="websites, ads" -->

[filter formats="websites"]

**`<amp-twitter>`**

-   `[data-tweetid]` Changes the displayed Tweet.

[/filter] <!-- formats="websites" -->

[filter formats="websites, ads"]

**`<amp-video>`**

-   `[alt]`
-   `[attribution]`
-   `[controls]`
-   `[loop]`
-   `[poster]`
-   `[preload]`
-   `[src]`

See corresponding [`amp-video` attributes](../amp-video/amp-video.md#attributes).
[/filter] <!-- formats="websites, ads" -->

[filter formats="websites, ads"]

**`<amp-youtube>`**

-   `[data-videoid]` Changes the displayed YouTube video.

[/filter] <!-- formats="websites, ads" -->

[filter formats="websites, ads"]

### HTML attributes

**`<a>`**

-   `[href]` Changes the link.

**`<button>`**

-   `[disabled]`
-   `[type]`
-   `[value]`

[/filter] <!-- formats="websites, ads" -->

[filter formats="email"]

**`<button>`**

-   `[disabled]`
-   `[value]`

See corresponding [button attributes](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/button#Attributes).

[/filter] <!-- formats="email" -->

**`<details>`**

-   `[open]`

See corresponding [details attributes](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/details#Attributes).

**`<fieldset>`**

-   `[disabled]` Enables or disables the fieldset.

**`<image>`**

-   `[xlink:href]`

See corresponding [image attributes](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/image).

[filter formats="websites, ads"]

**`<input>`**

-   `[accept]`
-   `[accessKey]`
-   `[autocomplete]`
-   `[checked]`
-   `[disabled]`
-   `[height]`
-   `[inputmode]`
-   `[max]`
-   `[maxlength]`
-   `[multiple]`
-   `[pattern]`
-   `[placeholder]`
-   `[readonly]`
-   `[required]`
-   `[selectiondirection]`
-   `[size]`
-   `[spellcheck]`
-   `[step]`
-   `[type]`
-   `[value]`
-   `[width]`

See corresponding [input attributes](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input#Attributes).

[/filter] <!-- formats="websites, ads" -->

[filter formats="email"]

**`<input>`**

-   `[autocomplete]`
-   `[disabled]`
-   `[height]`
-   `[max]`
-   `[maxlength]`
-   `[multiple]`
-   `[pattern]`
-   `[placeholder]`
-   `[readonly]`
-   `[required]`
-   `[size]`
-   `[spellcheck]`
-   `[step]`
-   `[value]`
-   `[width]`

See corresponding [input attributes](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input#Attributes).

[/filter] <!-- formats="email" -->

**`<option>`**

-   `[disabled]`
-   `[label]`
-   `[selected]`
-   `[value]`

See corresponding [option attributes](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/option#Attributes).

**`<optgroup>`**

-   `[disabled]`
-   `[label]`

See corresponding [optgroup attributes](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/optgroup#Attributes).

**`<section>`**

-   `[data-expand]` Changes the expansion of a `section` in an [`amp-accordion`](../amp-accordion/amp-accordion.md).

[filter formats="websites, ads"]

**`<select>`**

-   `[autofocus]`
-   `[disabled]`
-   `[multiple]`
-   `[required]`
-   `[size]`

See corresponding [select attributes](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/select#Attributes).

[/filter] <!-- formats="websites, ads" -->

[filter formats="email"]

**`<select>`**

-   `[disabled]`
-   `[multiple]`
-   `[required]`
-   `[size]`

See corresponding [select attributes](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/select#Attributes).

[/filter] <!-- formats="email" -->

[filter formats="websites, ads"]

**`<source>`**

-   `[src]`
-   `[type]`

See corresponding [source attributes](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/source#Attributes).

**`<track>`**

-   [label]
-   [src]
-   [srclang]

See corresponding [track attributes](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/track#Attributes).

[/filter] <!-- formats="websites, ads" -->

[filter formats="websites, ads"]

**`<textarea>`**

-   `[autocomplete]`
-   `[autofocus]`
-   `[cols]`
-   `[disabled]`
-   `[defaultText]`
-   `[maxlength]`
-   `[minlength]`
-   `[placeholder]`
-   `[readonly]`
-   `[required]`
-   `[rows]`
-   `[selectiondirection]`
-   `[selectionend]`
-   `[selectionstart]`
-   `[spellcheck]`
-   `[wrap]`

Use `[defaultText]` to update initial text, and `[text]` to update current text. See corresponding [textarea attributes](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/textarea#Attributes).

[/filter] <!-- formats="websites, ads" -->

[filter formats="email"]

**`<textarea>`**

-   `[autocomplete]`
-   `[cols]`
-   `[disabled]`
-   `[defaultText]`
-   `[maxlength]`
-   `[minlength]`
-   `[placeholder]`
-   `[readonly]`
-   `[required]`
-   `[rows]`
-   `[spellcheck]`
-   `[wrap]`

Use `[defaultText]` to update initial text, and `[text]` to update current text. See corresponding [textarea attributes](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/textarea#Attributes).

[/filter] <!-- formats="email" -->

### Disallowed bindings

For security reasons, binding to `innerHTML` is disallowed.

All attribute bindings are sanitized for unsafe values (e.g., `javascript:`).

## Debugging

[filter formats="websites, ads"]
Test in development mode. Enter development by adding the fragment `#development=1` to the end of the URL. This highlights warnings and errors in the browser console during development and grants access to special debugging functions.
[/filter] <!-- formats="websites, ads" -->

[filter formats="email"]
Test in development mode by saving the email as an HTML file. Test in the browser by adding the fragment `#development=1` to the end of the URL. This highlights warnings and errors in the browser console during development and grants access to special debugging functions.
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
    {"foo": 123}
  </script>
</amp-state>

<!-- The amp-state#myAmpState does not have a `bar` variable, so a warning
     will be issued in development mode. -->
<p [text]="myAmpState.bar">Some placeholder text.</p>
```

### Errors

Below outlines the types of errors that may arise when working with `amp-bind`.

<table>
  <tr>
    <th>Type</th>
    <th>Message</th>
    <th>Suggestion</th>
  </tr>
  <tr>
    <td class="col-thirty">Invalid binding</td>
    <td class="col-fourty"><em>Binding to [foo] on &lt;P> is not allowed</em>.</td>
    <td class="col-thirty">Use only <a href="#amp-component-specific-attributes">allowlisted bindings</a>.</td>
  </tr>
  <tr>
    <td>Syntax error</td>
    <td><em>Expression compilation error in...</em></td>
    <td>Verify the expression for typos.</td>
  </tr>
  <tr>
    <td>Non-allowlisted functions</td>
    <td><em>alert is not a supported function.</em></td>
    <td>Use only <a href="#allow-listed-functions">allow-listed functions</a>.</td>
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

Use `AMP.printState()` to print the current state to the console. To make this work, you need to enable the [development mode](https://amp.dev/documentation/guides-and-tutorials/learn/validation-workflow/validate_amp/#browser-developer-console).

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
