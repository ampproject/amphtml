<!---
Copyright 2017 The AMP HTML Authors. All Rights Reserved.

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

# <a name="amp-fx-parallax"></a> `amp-fx-parallax`

<table>
  <tr>
    <td class="col-fourty"><strong>Description</strong></td>
    <td>An attribute that enables a 3D-perspective effect on an element.</td>
  </tr>
  <tr>
    <td class="col-fourty" width="40%"><strong>Availability</strong></td>
    <td>In development</td>
  </tr>
  <tr>
    <td class="col-fourty"><strong>Required Script</strong></td>
    <td><code><script async custom-element="amp-fx-parallax" src="https://cdn.ampproject.org/v0/amp-fx-parallax-0.1.js"></script></code></td>
  </tr>
  <tr>
    <td class="col-fourty"><strong>Examples</strong></td>
    <td><a href="https://ampbyexample.com/components/amp-fx-parallax/">Annotated code example for amp-fx-parallax</a></td>
  </tr>
</table>

## Behavior

The `amp-fx-parallax` attribute causes an element to move as if it is nearer or farther relative to the foreground of the page content. As the user scrolls the page, the element scrolls faster or slower depending on the value assigned to the attribute.

**Example**

```html
<amp-img amp-fx-parallax="0.5" height="50vh" layout="fixed-height" src="hero.jpg">
</amp-img>
```

## Attributes

**amp-fx-parallax**

The factor to use when scrolling. A value greater than 1 scrolls the element upward when the user scrolls down the page. A value less than 1 scrolls the element downward when the user scrolls downward. A value of 1 behaves normally. A value of 0 effectively makes the element scroll fixed with the page.
