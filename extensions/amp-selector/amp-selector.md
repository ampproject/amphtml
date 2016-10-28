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

# <a name="amp-accordion"></a> `amp-accordion`

<table>
  <tr>
    <td class="col-fourty"><strong>Description</strong></td>
    <td>AMP select represents a control that presents a menu of options and lets the user choose from it.</td>
  </tr>
  <tr>
    <td class="col-fourty" width="40%"><strong>Availability</strong></td>
    <td>Experimental</td>
  </tr>
  <tr>
    <td class="col-fourty"><strong><a href="https://www.ampproject.org/docs/guides/responsive/control_layout.html">Supported Layouts</a></strong></td>
    <td>All</td>
  </tr>
</table>

## Behavior
AMP select represents a control that presents a menu of options and lets the user choose from it.The options within the menu are represented by <option> elements. Options can be pre-selected for the user.

- An `amp-select` can contain one or more `<option>`s as its direct children.
- `<option>`s can contain any HTML,Text,or AMP component.
- The list will not be a dropdown style list.
**- If you have a need for a select box with text-only options please use the HTML `select` tag**


##Attributes
### disabled, form, multiple, name

The attributes above should all behave like they do on standard iframes.

###Attributes on `<option>`
#### disabled, selected, value

The attributes above should all behave like they do on standard iframes.


## Styling
You should not use the `<option>` tag to style the options , instead give it a class name or an id to target it.
