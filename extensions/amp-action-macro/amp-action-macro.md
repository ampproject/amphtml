---
$category@: dynamic-content
formats:
  - websites
teaser:
  text: Creates reusable actions.
---
<!---
Copyright 2018 The AMP HTML Authors. All Rights Reserved.
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
 # amp-action-macro
 Creates reusable actions.
 <table>
  <tr>
    <td width="40%"><strong>Availability</strong></td>
    <td><a href="https://amp.dev/documentation/guides-and-tutorials/learn/experimental">Experimental</a></td>
  </tr>
  <tr>
    <td width="40%"><strong>Required Script</strong></td>
    <td><code>&lt;script async custom-element="amp-action-macro" src="https://cdn.ampproject.org/v0/amp-action-macro-0.1.js">&lt;/script></code></td>
  </tr>
  <tr>
    <td width="40%"><strong>Examples</strong></td>
    <td><a href="https://github.com/ampproject/amphtml/blob/master/examples/amp-action-macro.amp.html">amp-action-macro.amp.html</a></td>
  </tr>
</table>

[TOC]

## Overview

The `amp-action-macro` component allows for the creation of reusable actions.

## Example

```html
<amp-action-macro
    id="closeNavigations"
    execute="AMP.setState({nav1: 'close', nav2: 'close})"></amp-action-macro>
```

```html
 <button on="tap:closeNavigations.execute()">Close all</button>
 <div on="tap:closeNavigations.execute()">Close all</div>
```

```html
<!--
  You can provide arguments in the macro.
-->
<amp-carousel id="carousel" ...>...</amp-carousel>

<amp-action-macro
    id="carousel-macro"
    execute="carousel.goToSlide(index=foo), carousel.goToSlide(index=bar)"
    arguments="foo, bar"></amp-action-macro>

```

```html
 <button on="tap:carousel-macro.execute(foo=1, bar=2)">
   Go to slide 1 then 2
 </button>
```

## Attributes

##### id

Used to uniquely identify the action. This is referenced in an action invocation.

##### execute

The action to invoke. Any valid amp action is allowed here. See [actions and events in AMP](https://amp.dev/documentation/guides-and-tutorials/learn/amp-actions-and-events).

e.g.

```html
 <amp-action-macro
    id="navigate-action"
    action="AMP.navigateTo('http://www.amp.dev')"></amp-action-macro>

 <amp-action-macro
    id="refresh-amp-list"
    execute="ampList.refresh()"></amp-action-macro>
 <amp-list id="ampList" src="...">...</amp-list>

 <button on="tap:navigate-action"></button>

 <button on="tap:refresh-amp-list"></button>
 ```

##### arguments

Used to define arguments that can be used in the called invocation and substituted
in the amp action macro call.
