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

# Actions and Events in AMP

The `on` attribute is used to install event handlers on elements. The events that are supported depend on the element.

The value for the syntax is a simple domain specific language of the form:

```javascript
eventName:targetId[.methodName[(arg1=value, arg2=value)]]
```

Here's what each part of this means:
**eventName**
__required__
This is the name of the event that an element exposes.

**targetId**
__required__
This is the DOM id for the element you'd like to execute an action on in response to the event. In the following example, the `targetId` is the DOM id of the `amp-lightbox` target, `photo-slides`.

```html
<amp-lightbox id="photo-slides"></amp-lightbox>
<button on="tap:photo-slides">Show Images</button>
```

**methodName**
__optional__ for elements with default actions
This is the method that the target element (referenced by `targetId`) exposes and you'd like to execute when the event is triggered.

AMP has a concept of a default action that elements can implement. So when omitting the `methodName` AMP will execute that default method.

**arg=value**
__optional__
Some actions, if documented, may accept arguments. The arguments are defined between parentheses in `key=value` notation. The accepted values are:
 - simple unquoted strings: `simple-value`
 - quoted strings: `"string value"` or `'string value'`
 - boolean values: `true` or `false`
 - numbers: `11` or `1.1`
 - dot-syntax reference to event data: `event.someDataVariableName`

## Handling Multiple Events
You can listen to multiple events on an element by separating the two events with a semicolon `;`.

Example: `on="submit-success:lightbox1;submit-error:lightbox2"`

## Globally defined Events and Actions
Currently AMP defines `tap` event globally that you can listen to on any HTML element (including amp-elements).

AMP also defines a `hide` action globally that you can trigger on any HTML element.

For example, the following is possible in AMP.

```html
<div id="warning-message">Warning...</div>

<button on="tap:warning-message.hide">Cool, thanks!</button>
```

## Element Specific Events
<table>
  <tr>
    <th width="30%">Tag</th>
    <th>Event</th>
    <th>Description</th>
    <th>Data</th>
  </tr>
  <tr>
    <td width="30%">amp-carousel</td>
    <td>goToSlide</td>
    <td>Fired when the user changes the carousel's current slide.</td>
    <td><code>index</code> : slide number</td>
  </tr>
  <tr>
    <td width="30%">form</td>
    <td>submit</td>
    <td>Fired when the form is submitted</td>
    <td></td>
  </tr>
  <tr>
    <td width="30%">form</td>
    <td>submit-success</td>
    <td>Fired when the form submission response is success.</td>
    <td><code>response</code> : JSON response</td>
  </tr>
  <tr>
    <td width="30%">form</td>
    <td>submit-error</td>
    <td>Fired when the form submission response is an error.</td>
    <td><code>response</code> : JSON response</td>
  </tr>
</table>


## Element Specific Actions
<table>
  <tr>
    <th width="30%">Tag</th>
    <th>Action</th>
    <th>Description</th>
  </tr>
  <tr>
    <td width="30%">*</td>
    <td>hide</td>
    <td>Hides the target element</td>
  </tr>
  <tr>
    <td width="30%">amp-sidebar</td>
    <td>open (default)</td>
    <td>Opens the sidebar</td>
  </tr>
  <tr>
    <td width="30%">amp-sidebar</td>
    <td>close</td>
    <td>Closes the sidebar</td>
  </tr>
  <tr>
    <td width="30%">amp-sidebar</td>
    <td>toggle</td>
    <td>Toggles the state of the sidebar</td>
  </tr>
  <tr>
    <td width="30%">amp-lightbox</td>
    <td>open (default)</td>
    <td>Opens the lightbox</td>
  </tr>
  <tr>
    <td width="30%">amp-lightbox</td>
    <td>close</td>
    <td>Closes the lightbox</td>
  </tr>
  <tr>
    <td width="30%">amp-image-lightbox</td>
    <td>(default)</td>
    <td>Opens the image lightbox with the source image being the one that triggered the action.</td>
  </tr>
  <tr>
    <td width="30%">amp-live-list</td>
    <td>update (default)</td>
    <td>Updates the DOM items to show updated content.</td>
  </tr>
  <tr>
    <td width="30%">amp-state</td>
    <td>(default)</td>
    <td>Updates the amp-state's data with the data contained in the event. Requires <a href="../extensions/amp-bind/amp-bind.md">amp-bind</a>.</td>
  </tr>
  <tr>
    <td width="30%">amp-user-notification</td>
    <td>dismiss (default)</td>
    <td>Hides the referenced user notification element</td>
  </tr>
  <tr>
    <td width="30%">amp-carousel[type="slides"]</td>
    <td>goToSlide</td>
    <td>Advances the carousel to a specified slide index</td>
  </tr>
</table>


## `AMP` target

`AMP` target is a special target. It's provided by the AMP runtime and implements top-level
actions that apply to the whole document.

<table>
  <tr>
    <th width="30%">Action</th>
    <th>Description</th>
  </tr>
  <tr>
    <td>goBack</td>
    <td>Navigates back in history.</td>
  </tr>
  <tr>
    <td>setState</td>
    <td>Updates local bindable state. Requires <a href="../extensions/amp-bind/amp-bind.md">amp-bind</a>.</td>
  </tr>
</table>
