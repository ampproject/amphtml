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
    <td><code>amp-bind</code> allows elements to mutate in response to user actions or data changes via data binding and simple JS-like expressions.</td>
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
    <td>TBD</td>
  </tr>
</table>

## Overview

Once installed, `amp-bind` scans the DOM for bindings -- an element may have attributes, CSS classes or textContent bound to a JS-like expression (see [Expressions](#expressions) below).

The **scope** is mutable implicit document state that binding expressions may reference. The scope may be initialized with a new AMP component `<amp-state>`. Changes to the scope happen through user actions, e.g. clicking a `<button>` or switching slides on an `<amp-carousel>`.

A **digest** is an evaluation of all binding expressions. Since scope is mutable and expressions can reference the scope, the evaluated result of expressions may change over time. Bound elements are updated as a result of a digest.

A simple example:

```html
<amp-state id=”foo”>
  <script type=”application/json”>{ message: “Hello World” }</script>
</amp-state>

<p [text]=”foo.message”>Placeholder text</p>
```

1. `amp-bind` scans the DOM and finds the `<p>` element’s `[text]` binding.
2. During the next digest, `amp-bind` reevaluates the expression `foo.message`.
3. On the next frame, `amp-bind` updates the `<p>` element's textContent from "Placeholder text" to "Hello World".

## Binding

`amp-bind` supports binding to three types of data on an element:

| Type | Syntax | Details |
| --- | --- | --- |
| Attribute | `[<attr>]` | Only whitelisted attributes are supported.<br>Boolean expression results toggle boolean attributes.
| CSS Classes | `[class]` | Expression result must be a space-delimited string.
| Node.textContent | `[text]` | For applicable elements.

**Caveats:**

- For security reasons, binding to `innerHTML` is disallowed
- All attribute bindings are sanitized for unsafe URL protocols (e.g. `javascript:`)

### Bindable attributes

For non-AMP elements, generally all attributes are bindable.

For AMP components, only a subset of attributes are bindable:

| Component | Attributes |
| --- | --- |
| amp-img | src |
| amp-video | src |
| amp-pixel | src |

Note that the set of bindable attributes will grow over time as development progresses.

## Expressions

`amp-bind` expressions are JS-like with some important differences:

- Expressions only have access to the **scope**, not globals like `window` or `document`
- Only whitelisted functions are allowed
- Custom functions and control flow statements (e.g. `for`, `if`) are disallowed
- Undefined variables, array-index-out-of-bounds return `null` instead of throwing errors

#### BNF-like grammar

```
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

```
Array.concat
Array.indexOf
Array.join
Array.lastIndexOf
Array.slice
String.charAt
String.charCodeAt
String.concat
String.indexOf
String.lastIndexOf
String.slice
String.split
String.substr
String.substring
String.toLowerCase
String.toUpperCase
```

The full expression implementation can be found in [bind-expr-impl.jison](./0.1/bind-expr-impl.jison).
