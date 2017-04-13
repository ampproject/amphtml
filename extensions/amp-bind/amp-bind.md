# <a name="amp-bind"></a> `amp-bind`

**This extension is under active development, and the version number of the specification section should provide guidance to its evolution.**

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
    <td><code>amp-bind</code> allows adding custom interactivity with data binding and expressions.</td>
  </tr>
  <tr>
    <td class="col-fourty"><strong>Availability</strong></td>
    <td>In development</td>
  </tr>
  <tr>
    <td class="col-fourty"><strong>Required Script</strong></td>
    <td>
      <div>
        <code>&lt;script async custom-element="amp-bind" src="https://cdn.ampproject.org/v0/amp-bind-0.1.js">&lt;/script></code>
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
    <td class="col-fourty"><strong>Origin Trials</strong></td>
    <td><a href="https://docs.google.com/a/google.com/forms/d/e/1FAIpQLSfGCAjUU4pDu84Sclw6wjGVDiFJhVr61pYTMehIt6ex4wmr1Q/viewform">Register here</a> to enable <code>amp-bind</code> for your origin.</td>
  </tr>
</table>


`amp-bind` allows you to add custom stateful interactivity to your AMP pages via data binding and JS-like expressions.

Check out the AMP Conf 2017 talk "[Turing complete...AMP Pages?!](https://www.youtube.com/watch?v=xzCFU8b5fCU)" for a video introduction to the feature.

## Table of contents

<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->


- [A simple example](#a-simple-example)
- [How does it work?](#how-does-it-work)
- [A slightly more complex example](#a-slightly-more-complex-example)
- [Details](#details)
  - [State](#state)
    - [Initializing state with `amp-state`](#initializing-state-with-amp-state)
    - [Updating state with `AMP.setState()`](#updating-state-with-ampsetstate)
  - [Expressions](#expressions)
    - [Differences from JavaScript](#differences-from-javascript)
    - [Examples](#examples)
    - [Whitelisted functions](#whitelisted-functions)
  - [Bindings](#bindings)
    - [Element-specific attributes](#element-specific-attributes)
- [Debugging](#debugging)
  - [Warnings](#warnings)
  - [Errors](#errors)
- [Appendix](#appendix)
  - [`<amp-state>` specification](#amp-state-specification)
    - [Attributes](#attributes)
  - [Custom Built-in Functions](#custom-built-in-functions)
  - [Deep-merge with `AMP.setState()`](#deep-merge-with-ampsetstate)
    - [Removing a variable](#removing-a-variable)
  - [Expression Grammar](#expression-grammar)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

## A simple example

Consider the following example:

```html
<p [text]="'Hello ' + foo">Hello World</p>

<button on="tap:AMP.setState({foo: 'amp-bind'})">
```

Tapping the button changes the `<p>` element's text from "Hello World" to "Hello amp-bind".

## How does it work?

`amp-bind` has three main components:

1. [State](#state)
  - Document-scope, mutable JSON state. In the example above, the state is empty before tapping the button and `{foo: 'amp-bind'}` after tapping the button.
2. [Expressions](#expressions)
  - Javascript-like expressions that can reference the **state**. The example above has a single expression, `'Hello' + foo`, which concatenates the string literal `'Hello '` and the variable state `foo`.
3. [Bindings](#bindings)
  - Special attributes  of the form `[property]` that link an element's property to an **expression**. The example above has a single binding, `[text]`, which updates the `<p>` element's text every time the expression's value changes.


Note that `amp-bind` does not evaluate expressions on page load, so there's no risk of content jumping unexpectedly. `amp-bind` also takes special care to ensure speed, security and performance on AMP pages.

## A slightly more complex example

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

1. **State** is updated with `currentAnimal` defined as `'cat'`
2. **Expressions** that depend on `currentAnimal` are evaluated.
  - `'This is a ' + currentAnimal + '.'` => `'This is a cat.'`
  - `myAnimals[currentAnimal].style` => `'redBackground'`.
  - `myAnimals[currentAnimal].imageUrl` =>  `/img/cat.jpg`
3. **Bindings** that depend on the changed expressions are updated.
  - The first `<p>` element's text will read "This is a cat."
  - The second `<p>` element's `class` attribute will be "redBackground".
  - The `amp-img` element will show the image of a cat.

[Try out the **live demo**](https://ampbyexample.com/components/amp-bind/) for this example with code annotations!

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
- Only [whitelisted functions](#whitelisted-functions) are allowed.
- Custom functions, classes and some control flow statements (e.g. `for`) are disallowed.
- Undefined variables and array-index-out-of-bounds return `null` instead of `undefined` or throwing errors.
- A single expression is currently capped at 50 operands for performance reasons. Please [contact us](https://github.com/ampproject/amphtml/issues/new) if this is insufficient for your use case.

The full expression grammar and implementation can be found in [bind-expr-impl.jison](./0.1/bind-expr-impl.jison) and [bind-expression.js](./0.1/bind-expression.js).

#### Examples

The following are all valid expressions.

```javascript
1 + '1'           // 11
1 + (+'1')        // 2
!0                // true
null || 'default' // 'default'
```

#### Whitelisted functions

| Object type | Function(s) | Example |
| --- | --- | --- |
| [`Array`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array#Methods) | `concat`<br>`includes`<br>`indexOf`<br>`join`<br>`lastIndexOf`<br>`slice` | `// Returns true.`<br>`[1, 2, 3].includes(1)` |
| [`String`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String#Methods) | `charAt`<br>`charCodeAt`<br>`concat`<br>`indexOf`<br>`lastIndexOf`<br>`slice`<br>`split`<br>`substr`<br>`substring`<br>`toLowerCase`<br>`toUpperCase` | `// Returns 'abcdef'.`<br>`'abc'.concat('def')` |
| [`Math`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math)<sup>2</sup> | `abs`<br>`ceil`<br>`floor`<br>`max`<br>`min`<br>`random`<br>`round`<br>`sign` | `// Returns 1.`<br>`abs(-1)` |
| [`Global`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects) | `encodeURI`<br>`encodeURIComponent`<br>|`// Returns 'hello%20world'`<br>encodeURIComponent('hello world')
| [Custom built-ins](#custom-built-in-functions)<sup>2</sup> | `copyAndSplice` | `// Returns [1, 47 ,3].`<br>`copyAndSplice([1, 2, 3], 1, 1, 47)` |

<sup>2</sup>Functions are not namespaced, e.g. use `abs(-1)` instead of `Math.abs(-1)`.

### Bindings

A **binding** is a special attribute of the form `[property]` that links an element's property to an [expression](#expressions).

When the **state** changes, expressions are re-evaluated and the bound elements' properties are updated with the new expression results.

`amp-bind` supports data bindings on four types of element state:

| Type | Attribute(s) | Details |
| --- | --- | --- |
| [Node.textContent](https://developer.mozilla.org/en-US/docs/Web/API/Node/textContent) | `[text]` | Supported on most text elements.
| [CSS classes](https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes/class) | `[class]` | Expression result must be a space-delimited string.
| Size of [AMP elements](https://www.ampproject.org/docs/reference/components) | `[width]`<br>`[height]` | Changes the width and/or height of the AMP element. |
| Element-specific attributes | [Various](#element-specific-attributes). |

- For security reasons, binding to `innerHTML` is disallowed.
- All attribute bindings are sanitized for unsafe values, e.g. `javascript:`.
- Boolean expression results toggle boolean attributes. For example:

```html
<amp-video [controls]="expr"...>
```

When `expr` evaluates to `true`, the `<amp-video>` element has the `controls` attribute. When `expr` evaluates to `false`, the `controls` attribute is removed.

#### Element-specific attributes

Only binding to the following components and attributes are allowed:

| Component | Attribute(s) | Behavior |
| --- | --- | --- |
| `<amp-brightcove>` | `[data-account]`<br>`[data-embed]`<br>`[data-player]`<br>`[data-player-id]`<br>`[data-playlist-id]`<br>`[data-video-id]` | Changes the displayed Brightcove video. |
| `<amp-carousel type=slides>` | `[slide]`<sup>1</sup> | Changes the currently displayed slide index. [See an example](https://ampbyexample.com/advanced/image_galleries_with_amp-carousel/#linking-carousels-with-amp-bind).
| `<amp-iframe>` | `[src]` | Changes the iframe's source URL. |
| `<amp-img>` | `[alt]`<br>`[attribution]`<br>`[src]`<br>`[srcset]` | See corresponding [amp-img attributes](https://www.ampproject.org/docs/reference/components/media/amp-img#attributes). |
| `<amp-selector>` | `[selected]`<sup>1</sup> | Changes the currently selected children element(s)<br>identified by their `option` attribute values. Supports a comma-separated list of values for multiple selection. [See an example](https://ampbyexample.com/advanced/image_galleries_with_amp-carousel/#linking-carousels-with-amp-bind).
| `<amp-video>` | `[alt]`<br>`[attribution]`<br>`[controls]`<br>`[loop]`<br>`[poster]`<br>`[preload]`<br>`[src]` | See corresponding [amp-video attributes](https://www.ampproject.org/docs/reference/components/media/amp-video#attributes). |
| `<amp-youtube>` | `[data-videoid]` | Changes the displayed YouTube video. |
| `<a>` | `[href]` | Changes the link. |
| `<button>` | `[disabled]`<br>`[type]`<br>`[value]` | See corresponding [button attributes](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/button#Attributes). |
| `<fieldset>` | `[disabled]` | Enables or disables the fieldset. |
| `<input>` | `[accept]`<br>`[accessKey]`<br>`[autocomplete]`<br>`[checked]`<br>`[disabled]`<br>`[height]`<br>`[inputmode]`<br>`[max]`<br>`[maxlength]`<br>`[min]`<br>`[minlength]`<br>`[multiple]`<br>`[pattern]`<br>`[placeholder]`<br>`[readonly]`<br>`[required]`<br>`[selectiondirection]`<br>`[size]`<br>`[spellcheck]`<br>`[step]`<br>`[type]`<br>`[value]`<br>`[width]` | See corresponding [input attributes](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input#Attributes). |
| `<option>` | `[disabled]`<br>`[label]`<br>`[selected]`<br>`[value]` | See corresponding [option attributes](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/option#Attributes). |
| `<optgroup>` | `[disabled]`<br>`[label]` | See corresponding [optgroup attributes](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/optgroup#Attributes). |
| `<select>` | `[autofocus]`<br>`[disabled]`<br>`[multiple]`<br>`[required]`<br>`[size]` | See corresponding [select attributes](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/select#Attributes). |
| `<source>` | `[src]`<br>`[type]` | See corresponding [source attributes](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/source#Attributes). |
| `<track>` | `[label]`<br>`[src]`<br>`[srclang]` | See corresponding [track attributes](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/track#Attributes). |
| `<textarea>` | `[autocomplete]`<br>`[autofocus]`<br>`[cols]`<br>`[disabled]`<br>`[maxlength]`<br>`[minlength]`<br>`[placeholder]`<br>`[readonly]`<br>`[required]`<br>`[rows]`<br>`[selectiondirection]`<br>`[selectionend]`<br>`[selectionstart]`<br>`[spellcheck]`<br>`[wrap]` | See corresponding [textarea attributes](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/textarea#Attributes). |

<sup>1</sup>Denotes bindable attributes that don't have a non-bindable counterpart.

## Debugging

Test in development mode (with the URL fragment `#development=1`) to highlight warnings and errors during development.

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

| Type | Example | Message | Suggestion |
| --- | --- | --- | --- |
| Invalid binding | `<p [someBogusAttribute]="myExpression">` | *Binding to [someBogusAttribute] on `<P>`` is not allowed.* | Make sure that only [whitelisted bindings](#element-specific-attributes) are used. |
| Syntax error | `<p [text]="(missingClosingParens">` | *Expression compilation error in...* | Double-check the expression for typos. |
| Non-whitelisted functions | `<p [text]="alert(1)"></p>` | *alert is not a supported function.* | Only use [whitelisted functions](#whitelisted-functions). |
| Sanitized result | `<a href="javascript:alert(1)"></a>` | *"javascript:alert(1)" is not a valid result for [href].* | Avoid banned URL protocols or expressions that would fail the AMP Validator. |

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

**credentials** (optional)

Defines a `credentials` option as specified by the [Fetch API](https://fetch.spec.whatwg.org/).
To send credentials, pass the value of "include". If this is set, the response must follow
the [AMP CORS security guidelines](../../spec/amp-cors-requests.md).

The support values are "omit" and "include". Default is "omit".

### Custom Built-in Functions

`amp-bind` includes the following builtin functions.

| Name | Description | Arguments | Examples |
| --- | --- | --- | --- |
| `copyAndSplice` | Similar to [Array#splice()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/splice) except a copy of the spliced array is returned. | `array` : An array.<br>`start` : Index at which to start changing the array.<br> `deleteCount` : The number of items to delete, starting at index `start`<br> `items...` Items to add to the array, beginning at index `start`. | `// Deleting an element. Returns [1, 3]`<br>`copyAndSplice([1, 2, 3], 1, 1)`<br>`// Replacing an item. Returns ['Pizza', 'Cake', 'Ice Cream']`<br>`copyAndSplice(['Pizza', 'Cake', 'Soda'], 2, 1, 'Ice Cream')` |

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

### Expression Grammar

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
