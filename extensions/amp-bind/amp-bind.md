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
    <td><a href="https://ampbyexample.com/components/amp-bind/">Annotated code example for amp-bind</a></td>
  </tr>
</table>

## Overview

`amp-bind` allows you to add custom stateful interactivity to your AMP pages via data binding and JS-like expressions.

A simple example:

```html
<p [text]="message">Hello amp-bind</p>

<button on="tap:AMP.setState({message: 'Hello World'})">
```

Tapping the button causes the `<p>` element's text to change to "Hello World".

## Details

### State

Each AMP document that uses `amp-bind` has document-scope mutable JSON data, or **state**.

The state can be initialized with the `amp-state` component:

```html
<amp-state id="myState">
  <script type="application/json">
    {"foo": "bar"}
  </script>
</amp-state>
```

[Expressions](#expressions) can reference state variables via dot syntax. In this example, `myState.foo` will evaluate to `"bar"`.


##### AMP.setState()

State can be mutated by the new `AMP.setState()` [action](../../spec/amp-actions-and-events.md).

- `AMP.setState()` performs a [shallow merge](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/assign) of its arguments with the document state.
- `AMP.setState()` can override data initialized by `amp-state`.

### Binding

A binding is a special attribute of the form `[property]` that links an element's property to an [expression](#expressions).

When the **state** changes, expressions are re-evaluated and the bound elements' properties are updated with the new expression results.

`amp-bind` supports data bindings on three types of element state:

| Type | Syntax | Details |
| --- | --- | --- |
| [Node.textContent](https://developer.mozilla.org/en-US/docs/Web/API/Node/textContent) | `[text]` | Supported on most text elements.
| [CSS Classes](https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes/class) | `[class]` | Expression result must be a space-delimited string.
| Element-specific attribute | `[<attr>]` | Only whitelisted attributes are supported.<br>Boolean expression results toggle boolean attributes.

- For security reasons, binding to `innerHTML` is disallowed
- All attribute bindings are sanitized for unsafe URL protocols (e.g. `javascript:`)

#### Element-specific attributes

Most attributes accepted by the [AMP Validator](https://validator.ampproject.org/) for AMP and non-AMP elements, are bindable.

There are also special bindable attributes without non-bindable counterparts:

| Component | Attribute | Details | Example |
| --- | --- | --- | --- |
| amp-carousel[type=slides] | `[slide]` | The currently displayed slide index. | [Linked carousels](https://ampbyexample.com/advanced/image_galleries_with_amp-carousel/#linking-carousels-with-amp-bind)
| amp-selector | `[selected]` | The `option` attribute values of the currently selected children elements. | [Linked carousels](https://ampbyexample.com/advanced/image_galleries_with_amp-carousel/#linking-carousels-with-amp-bind)

### Expressions

`amp-bind` expressions are JS-like with some important differences:

- Expressions may only access the document [state](#state)
- Expressions do **not** have access to globals like `window` or `document`
- Only whitelisted functions are allowed
- Custom functions, classes and control flow statements (e.g. `for`) are disallowed
- Undefined variables and array-index-out-of-bounds return `null` instead of throwing errors

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

#### Whitelisted functions

```text
Array.concat()
Array.indexOf()
Array.join()
Array.lastIndexOf()
Array.slice()
String.charAt()
String.charCodeAt()
String.concat()
String.indexOf()
String.lastIndexOf()
String.slice()
String.split()
String.substr()
String.substring()
String.toLowerCase()
String.toUpperCase()
```

The full expression grammar and implementation can be found in [bind-expr-impl.jison](./0.1/bind-expr-impl.jison) and [bind-expression.js](./0.1/bind-expression.js).
