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

## Table of contents

<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->


- [A simple example](#a-simple-example)
- [How does it work?](#how-does-it-work)
- [A slightly more complex example](#a-slightly-more-complex-example)
- [Details](#details)
  - [State](#state)
      - [AMP.setState()](#ampsetstate)
  - [Bindings](#bindings)
    - [Element-specific attributes](#element-specific-attributes)
  - [Expressions](#expressions)
    - [Differences from JavaScript](#differences-from-javascript)
    - [Whitelisted functions](#whitelisted-functions)
    - [BNF-like grammar](#bnf-like-grammar)
- [Debugging](#debugging)
  - [Warnings](#warnings)
  - [Errors](#errors)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

## A simple example

`amp-bind` allows you to add custom stateful interactivity to your AMP pages via data binding and JS-like expressions.

Let's start with a simple example:

```html
<p [text]="'Hello ' + foo">Hello World</p>

<button on="tap:AMP.setState({foo: 'amp-bind'})">
```

Tapping the button causes the `<p>` element's text to change from "Hello World" to "Hello amp-bind".

## How does it work?

`amp-bind` has three main components:

1. [State](#state)
  - In the example above, the state is empty before tapping the button and `{foo: 'amp-bind'}` after tapping the button.
2. [Expressions](#expressions)
  - The example above has a single expression, `'Hello' + foo`, which concatenates the string literal `'Hello '` and the variable state `foo`.
3. [Bindings](#bindings)
  - The example above has a single binding, `[text]`, which causes the `<p>` element to update its text every time the expression's value changes.

Note that `amp-bind` does not evaluate expressions on page load, so there's no risk of content jumping unexpectedly. `amp-bind` also takes special care to ensure speed, security and performance on AMP pages.

Check out the AMP Conf 2017 talk "[Turing complete...AMP Pages?!](https://www.youtube.com/watch?v=xzCFU8b5fCU)" for a video introduction to the feature.

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

In this example, tapping the button will change the following:

1. The first `<p>` element's text will read "This is a cat".
2. The second `<p>` element's `class` attribute will be "redBackground".
3. The `amp-img` element will show the image of a cat.

[Try out the **live demo**](https://ampbyexample.com/components/amp-bind/) for this example with code annotations!

## Details

### State

Each AMP document that uses `amp-bind` has document-scope mutable JSON data, or **state**.

This state can be initialized with the `amp-state` component:

```html
<amp-state id="myState">
  <script type="application/json">
    {
      "foo": "bar"
    }
  </script>
</amp-state>
```

- [Expressions](#expressions) can reference state variables via dot syntax. In this example, `myState.foo` will evaluate to `"bar"`.
- An `<amp-state>` element's JSON has a maximum size of 100KB.

##### AMP.setState()

State can be mutated by the [`AMP.setState()` action](../../spec/amp-actions-and-events.md).

- `AMP.setState()` performs a deep merge of its arguments with the document state up to a depth of 10.
- `AMP.setState()` can override data initialized by `amp-state`.

### Bindings

A **binding** is a special attribute of the form `[property]` that links an element's property to an [expression](#expressions).

When the **state** changes, expressions are re-evaluated and the bound elements' properties are updated with the new expression results.

`amp-bind` supports data bindings on three types of element state:

| Type | Attribute | Details |
| --- | --- | --- |
| [Node.textContent](https://developer.mozilla.org/en-US/docs/Web/API/Node/textContent) | `[text]` | Supported on most text elements.
| [CSS classes](https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes/class) | `[class]` | Expression result must be a space-delimited string.
| Size of [AMP elements](https://www.ampproject.org/docs/reference/components) | `[width]`<br>`[height]` | Changes the width and/or height of the AMP element. |
| Element-specific attribute | [Various](#element-specific-attributes). | Boolean expression results toggle boolean attributes.

- For security reasons, binding to `innerHTML` is disallowed.
- All attribute bindings are sanitized for unsafe values, e.g. URL protocols (e.g. `javascript:`).

#### Element-specific attributes

Only binding to the following components and attributes are allowed. Most bindable attributes correspond to a non-bindable counterpart, e.g. for `<amp-img>`, `[src]` changes the value of `src`.

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

### Expressions

`amp-bind` expressions are similar to JavaScript with some important differences.

#### Differences from JavaScript

- Expressions may only access the containing document's [state](#state).
- Expressions **do not** have access to globals like `window` or `document`.
- Only [whitelisted functions](#whitelisted-functions) are allowed.
- Custom functions, classes and some control flow statements (e.g. `for`) are disallowed.
- Undefined variables and array-index-out-of-bounds return `null` instead of `undefined` or throwing errors.
- A single expression is currently capped at 50 operands for performance reasons. Please [contact us](https://github.com/ampproject/amphtml/issues/new) if this is insufficient for your use case.

The full expression grammar and implementation can be found in [bind-expr-impl.jison](./0.1/bind-expr-impl.jison) and [bind-expression.js](./0.1/bind-expression.js).

#### Whitelisted functions

| Object type | Function(s) | Example |
| --- | --- | --- |
| [`Array`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array#Methods) | `concat`<br>`includes`<br>`indexOf`<br>`join`<br>`lastIndexOf`<br>`slice` | `// Returns true.`<br>`[1, 2, 3].includes(1)` |
| [`String`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String#Methods) | `charAt`<br>`charCodeAt`<br>`concat`<br>`indexOf`<br>`lastIndexOf`<br>`slice`<br>`split`<br>`substr`<br>`substring`<br>`toLowerCase`<br>`toUpperCase` | `// Returns 'abcdef'.`<br>`'abc'.concat('def')` |
| [`Math`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math)<sup>2</sup> | `abs`<br>`ceil`<br>`floor`<br>`max`<br>`min`<br>`random`<br>`round`<br>`sign` | `// Returns 1.`<br>`abs(-1)` |

<sup>2</sup>`Math` functions are not namespaced, e.g. use `abs(-1)` instead of `Math.abs(-1)`.

#### BNF-like grammar

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
| Invalid binding | `<p [someBogusAttribute]="myExpression">` | *Binding to [someBogusAttribute] on <P> is not allowed.* | Make sure that only [whitelisted bindings](#element-specific-attributes) are used. |
| Syntax error | `<p [text]="(missingClosingParens">` | *Expression compilation error in...* | Double-check the expression for typos. |
| Non-whitelisted functions | `<p [text]="alert(1)"></p>` | *alert is not a supported function.* | Only use [whitelisted functions](#whitelisted-functions). |
| Sanitized result | `<a href="javascript:alert(1)"></a>` | *"javascript:alert(1)" is not a valid result for [href].* | Avoid banned URL protocols or expressions that would fail the AMP Validator. |
