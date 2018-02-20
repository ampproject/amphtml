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

# Actions and events in AMP

[TOC]

The `on` attribute is used to install event handlers on elements. The events that are supported depend on the element.

The value for the syntax is a simple domain-specific language of the form:

```javascript
eventName:targetId[.methodName[(arg1=value, arg2=value)]]
```

See the table below for descriptions of each part of the syntax.


<table>
  <tr>
    <th width="30%">Syntax</th>
    <th width="18%">Required?</th>
    <th width="42%">Description</th>
  </tr>
  <tr>
    <td><code>eventName</code></td>
    <td>yes</td>
    <td>This is the name of the event that an element exposes.</td>
  </tr>
  <tr>
    <td><code>targetId</code></td>
    <td>yes</td>
    <td>This is the DOM id for the element, or a predefined <a href="#special-targets">special target</a> you'd like to execute an action on  in response to the event. In the following example, the <code>targetId</code> is the DOM id of the <code>amp-lightbox</code> target, <code>photo-slides</code>.
    <pre>&lt;amp-lightbox id="photo-slides">&lt;/amp-lightbox>
&lt;button on="tap:photo-slides">Show Images&lt;/button></pre>
    </td>
  </tr>
  <tr>
    <td><code>methodName</code></td>
    <td>no</td>
    <td>This is for elements with default actions.</p><p>This is the method that the target element (referenced by <code>targetId</code>) exposes and you'd like to execute when the event is triggered.</p><p>AMP has a concept of a default action that elements can implement. So when omitting the <code>methodName</code> AMP will execute that default method.</td>
  </tr>
  <tr>
    <td><code>arg=value</code></td>
    <td>no</td>
    <td>Some actions, if documented, may accept arguments. The arguments are defined between parentheses in <code>key=value</code> notation. The accepted values are:
      <ul>
        <li>simple unquoted strings: <code>simple-value</code></li>
        <li>quoted strings: <code>"string value"</code> or <code>'string value'</code></li>
        <li>boolean values: <code>true</code> or <code>false</code></li>
        <li>numbers: <code>11</code> or <code>1.1</code></li>
        <li>dot-syntax reference to event data: <code>event.someDataVariableName</code></li>
      </ul>
    </td>
  </tr>
</table>

## Handling multiple events

You can listen to multiple events on an element by separating the events with a semicolon `;`.

Example: `on="submit-success:lightbox1;submit-error:lightbox2"`


## Multiple actions for one event

You can execute multiple actions in sequence for the same event by separating the actions with a comma ','.

Example: `on="tap:target1.actionA,target2.actionB"`


## Globally-defined events and actions

AMP defines a `tap` event globally that you can listen to on any HTML element (including AMP elements).

AMP also defines the `hide`, `show` and `toggleVisibility` actions globally that you can trigger on any HTML element.

{% call callout('Note', type='note') %}
An element can only be shown if it was previously hidden by a `hide` or `toggleVisibility` action, or by using the [`hidden`](https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes/hidden) attribute. The `show` action does not support elements hidden by CSS `display:none` or AMP's `layout=nodisplay`.

For example, the following is possible in AMP:

```html
<div id="warning-message">Warning...</div>

<button on="tap:warning-message.hide">Cool, thanks!</button>
```
{% endcall %}

## Element-specific events

### * - all elements
<table>
  <tr>
    <th>Event</th>
    <th>Description</th>
  </tr>
  <tr>
    <td><code>tap</code></td>
    <td>Fired when the element is clicked/tapped.</td>
  </tr>
</table>

### Input elements
<table>
  <tr>
    <th width="20%">Event</th>
    <th width="30%">Description</th>
    <th width="40%">Elements</th>
    <th>Data</th>
  </tr>
  <!-- change -->
  <tr>
    <td rowspan=3><code>change</code></td>
    <td rowspan=3>Fired when the value of the element is changed and committed.
      <p>
      Data properties mirror those in <a href="https://developer.mozilla.org/en-US/docs/Web/API/HTMLInputElement#Properties">HTMLInputElement</a> and <a href="https://developer.mozilla.org/en-US/docs/Web/API/HTMLSelectElement#Properties">HTMLSelectElement</a>.</p>
    </td>
    <td><code>input</code></td>
    <td>
      <pre>event.min
event.max
event.value
event.valueAsNumber</pre>
    </td>
  </tr>
  <tr>
    <td><code>input[type="radio"]</code>,<br><code>input[type="checkbox"]</code></td>
    <td>
      <code>event.checked</code>
    </td>
  </tr>
  <tr>
    <td><code>select</code></td>
    <td>
      <pre>event.min
event.max
event.value</pre>
    </td>
  </tr>
  <!-- input-debounced -->
  <tr>
    <td><code>input-debounced</code></td>
    <td>Fired when the value of the element is changed. This is similar to the standard <code>change</code> event, but it only fires when 300ms have passed after the value of the input has stopped changing.</td>
    <td>Elements that fire <code>input</code> event.</td>
    <td>Same as <code>change</code> event data.</td>
  </tr>
    <!-- input-throttled -->
  <tr>
    <td><code>input-throttled</code></td>
    <td>Fired when the value of the element is changed. This is similar to the standard <code>change</code> event, but it is throttled to firing at most once every 100ms while the value of the input is changing.</td>
    <td>Elements that fire <code>input</code> event.</td>
    <td>Same as <code>change</code> event data.</td>
  </tr>
</table>

### amp-carousel[type="slides"]
<table>
  <tr>
    <th width="25%">Event</th>
    <th width="35%">Description</th>
    <th width="40%">Data</th>
  </tr>
  <tr>
    <td><code>slideChange</code></td>
    <td>Fired when the user manually changes the carousel's current slide. Does not fire on autoplay or the <code>goToSlide</code> action.</td>
    <td><pre>// Slide number.
event.index</pre></td>
  </tr>
  <tr>
    <td><code>toggleAutoplay</code></td>
    <td>Will, on user tap or click, toggle the autoplay status for the carousel. You can either specify the status you want by specifying it: <code>carousel-id.toggleAutoplay(toggleOn=false)</code> or flip the status by not specifying a value.</td>
    <td><pre>optional toggle status</pre></td>
  </tr>
</table>

### amp-sidebar
<table>
  <tr>
    <th width="25%">Event</th>
    <th width="35%">Description</th>
    <th width="40%">Data</th>
  </tr>
  <tr>
    <td><code>sidebarOpen</code></td>
    <td>Fired when sidebar is fully opened after transition has ended.</td>
    <td>None</td>
  </tr>
  <tr>
    <td><code>sidebarClose</code></td>
    <td>Fired when sidebar is fully closed after transition has ended.</td>
    <td>None</td>
  </tr>
</table>

### amp-video, amp-youtube
<table>
  <tr>
    <th width="25%">Event</th>
    <th width="35%">Description</th>
    <th width="40%">Data</th>
  </tr>
  <tr>
    <td><code>timeUpdate</code>(low-trust)</td>
    <td>Fired when the playing position of a video has changed. Frequency of the event is controlled by AMP and is currently set at 1 second intervals. This event is low-trust which means it can not trigger most actions; only low-trust actions such as <code>amp-animation</code> actions can be run.</td>
    <td><code>{time, percent}</code><code>time</code> indicates the current time in seconds, <code>percent</code> is a number between 0 and 1 and indicates current position as percentage of total time.</td>
  </tr>
</table>

### form
<table>
  <tr>
    <th width="25%">Event</th>
    <th width="35%">Description</th>
    <th width="40%">Data</th>
  </tr>
  <tr>
    <td><code>submit</code></td>
    <td>Fired when the form is submitted.</td>
    <td></td>
  </tr>
  <tr>
    <td><code>submit-success</code></td>
    <td>Fired when the form submission response is success.</td>
    <td><pre>// Response JSON.
event.response</pre></td>
  </tr>
  <tr>
    <td><code>submit-error</code></td>
    <td>Fired when the form submission response is an error.</td>
    <td><pre>// Response JSON.
event.response</pre></td>
  </tr>
  <tr>
    <td><code>valid</code></td>
    <td>Fired when the form is valid.</td>
    <td></td>
  </tr>
  <tr>
    <td><code>invalid</code></td>
    <td>Fired when the form is invalid.</td>
    <td></td>
  </tr>
</table>


## Element-specific actions

### * (all elements)
<table>
  <tr>
    <th width="40%">Action</th>
    <th>Description</th>
  </tr>
  <tr>
    <td><code>hide</code></td>
    <td>Hides the target element.</td>
  </tr>
  <tr>
    <td><code>show</code></td>
    <td>Shows the target element.</td>
  </tr>
  <tr>
    <td><code>toggleVisibility</code></td>
    <td>Toggles the visibility of the target element.</td>
  </tr>
  <tr>
    <td><code>scrollTo(duration=INTEGER, position=STRING)</code></td>
    <td>Scrolls an element into view with a smooth animation. If defined,
    <code>duration</code> specifies the length of the animation in milliseconds
    (default is 500ms). <code>position</code> is optional and takes one of
    <code>top</code>, <code>center</code> or <code>bottom</code> defining where
    in the viewport the element will be at the end of the scroll (default is
    <code>top</code>).</td>
  </tr>
  <tr>
    <td><code>focus</code></td>
    <td>Makes the target element gain focus. To lose focus, <code>focus</code>
    on another element (usually parent element). We strongly advise against
    losing focus by focusing on <code>body</code>/<code>documentElement</code>
    for accessibility reasons.</td>
  </tr>
</table>

### amp-carousel[type="slides"]
<table>
  <tr>
    <th>Action</th>
    <th>Description</th>
  </tr>
  <tr>
    <td><code>goToSlide(index=INTEGER)</code></td>
    <td>Advances the carousel to a specified slide index.</td>
  </tr>
</table>

### amp-image-lightbox
<table>
  <tr>
    <th width="40%">Action</th>
    <th>Description</th>
  </tr>
  <tr>
    <td><code>open (default)</code></td>
    <td>Opens the image lightbox with the source image being the one that triggered the action.</td>
  </tr>
</table>

### amp-lightbox
<table>
  <tr>
    <th>Action</th>
    <th>Description</th>
  </tr>
  <tr>
    <td><code>open (default)</code></td>
    <td>Opens the lightbox.</td>
  </tr>
  <tr>
    <td><code>close</code></td>
    <td>Closes the lightbox.</td>
  </tr>
</table>

### amp-live-list
<table>
  <tr>
    <th>Action</th>
    <th>Description</th>
  </tr>
  <tr>
    <td><code>update (default)</code></td>
    <td>Updates the DOM items to show updated content.</td>
  </tr>
</table>

### amp-sidebar
<table>
  <tr>
    <th>Action</th>
    <th>Description</th>
  </tr>
  <tr>
    <td><code>open (default)</code></td>
    <td>Opens the sidebar.</td>
  </tr>
  <tr>
    <td><code>close</code></td>
    <td>Closes the sidebar.</td>
  </tr>
  <tr>
    <td><code>toggle</code></td>
    <td>Toggles the state of the sidebar.</td>
  </tr>
</table>

### amp-user-notification
<table>
  <tr>
    <th>Action</th>
    <th>Description</th>
  </tr>
  <tr>
    <td><code>dismiss (default)</code></td>
    <td>Hides the referenced user notification element.</td>
  </tr>
</table>

### Video elements

The actions below are supported in the following AMP video elements: `amp-video`, `amp-youtube`, `amp-3q-player`, `amp-brid-player`, `amp-dailymotion`, `amp-ima-video`.

<table>
  <tr>
    <th>Action</th>
    <th>Description</th>
  </tr>
  <tr>
    <td><code>play</code></td>
    <td>Plays the video.</td>
  </tr>
  <tr>
    <td><code>pause</code></td>
    <td>Pauses the video.</td>
  </tr>
  <tr>
    <td><code>mute</code></td>
    <td>Mutes the video.</td>
  </tr>
  <tr>
    <td><code>unmute</code></td>
    <td>Unmutes the video.</td>
  </tr>
  <tr>
    <td><code>fullscreen</code></td>
    <td>Takes the video to fullscreen.</td>
  </tr>
</table>

### form
<table>
  <tr>
    <th>Action</th>
    <th>Description</th>
  </tr>
  <tr>
    <td><code>submit</code></td>
    <td>Submits the form.</td>
  </tr>
</table>

## Special targets

The following are targets provided by the AMP system that have special requirements:

### Target: AMP

The `AMP` target is provided by the AMP runtime and implements top-level
actions that apply to the whole document.

<table>
  <tr>
    <th width="40%">Action</th>
    <th>Description</th>
  </tr>
  <tr>
    <td><code>navigateTo(url=STRING)</code></td>
    <td>Navigates current window to given URL. Supports <a href="https://github.com/ampproject/amphtml/blob/master/spec/amp-var-substitutions.md">standard URL substitutions</a>.</td>
  </tr>
  <tr>
    <td><code>goBack</code></td>
    <td>Navigates back in history.</td>
  </tr>
  <tr>
    <td><code>print</code></td>
    <td>Opens the Print Dialog to print the current page.</td>
  </tr>
  <tr>
    <td><code>setState({foo: 'bar'})</code><sup>1</sup></td>
    <td>
      <p>Requires <a href="https://www.ampproject.org/docs/reference/components/amp-bind.html#updating-state-with-ampsetstate">amp-bind</a>.</p>
      <p>Merges an object literal into the bindable state.</p>
      <p></p>
    </td>
  </tr>
  <tr>
    <td><code>pushState({foo: 'bar'})</code><sup>1</sup></td>
    <td>
      <p>Requires <a href="https://www.ampproject.org/docs/reference/components/amp-bind.html#modifying-history-with-amppushstate">amp-bind</a>.</p>
      <p>Merges an object literal into the bindable state and pushes a new entry onto browser history stack. Popping the entry will restore the previous values of variables (in this example, <code>foo</code>).    </td>
  </tr>
</table>

<sup>1</sup>When used with <a href="#multiple-actions-for-one-event">multiple actions</a>, subsequent actions will wait for <code>setState()</code> or <code>pushState()</code> to complete before invocation. Only a single <code>setState()</code> or <code>pushState()</code> is allowed per event.

### Target: amp-access

The `amp-access` target is provided by the [amp-access](https://www.ampproject.org/docs/reference/components/amp-access.html) component.

The `amp-access` target is special for these reasons:

1.  You can't give an arbitrary ID to this target. The target is always `amp-access`.
2. The actions for `amp-access` are dynamic depending on the structure of the [AMP Access Configuration](https://www.ampproject.org/docs/reference/components/amp-access#configuration).

See [details](https://www.ampproject.org/docs/reference/components/amp-access#login-link) about using the `amp-access` target.
