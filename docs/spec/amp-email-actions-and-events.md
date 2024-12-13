# Actions and events in AMP email

[TOC]

[tip type="note"]
This documentation covers actions and events for the AMP email format. Read [Actions and events](amp-actions-and-events.md) for AMP websites, stories and ads.
[/tip]

The `on` attribute is used to install event handlers on elements. The events that are supported depend on the element.

The value for the syntax is a simple domain-specific language of the form:

[sourcecode:javascript]
eventName:targetId[.methodName[(arg1=value, arg2=value)]][/sourcecode]

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

## Handling multiple events <a name="handling-multiple-events"></a>

You can listen to multiple events on an element by separating the events with a semicolon `;`.

Example: `on="submit-success:lightbox1;submit-error:lightbox2"`

## Multiple actions for one event <a name="multiple-actions-for-one-event"></a>

You can execute multiple actions in sequence for the same event by separating the actions with a comma ','.

Example: `on="tap:target1.actionA,target2.actionB"`

## Globally-defined events and actions <a name="globally-defined-events-and-actions"></a>

AMP defines a `tap` event globally that you can listen to on any HTML element (including AMP elements).

AMP also defines the `hide`, `show` and `toggleVisibility` actions globally that you can trigger on any HTML element.

[tip type="note"]

An element can only be shown if it was previously hidden by a `hide` or `toggleVisibility` action, or by using the [`hidden`](https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes/hidden) attribute. The `show` action does not support elements hidden by CSS `display:none` or AMP's `layout=nodisplay`.

For example, the following is possible in AMP:

[sourcecode:html]

<div id="warning-message">Warning...</div>

<button on="tap:warning-message.hide">Cool, thanks!</button>
[/sourcecode]

[/tip]

## Element-specific events <a name="element-specific-events"></a>

### \* - all elements <a name="---all-elements"></a>

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

### Input elements <a name="input-elements"></a>

<table>
  <tr>
    <th width="20%">Event</th>
    <th width="30%">Description</th>
    <th width="40%">Elements</th>
    <th>Data</th>
  </tr>
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
  <tr>
    <td><code>input-debounced</code></td>
    <td>Fired when the value of the element is changed. This is similar to the standard <code>change</code> event, but it only fires when 300ms have passed after the value of the input has stopped changing.</td>
    <td>Elements that fire <code>input</code> event.</td>
    <td>Same as <code>change</code> event data.</td>
  </tr>
  <tr>
    <td><code>input-throttled</code></td>
    <td>Fired when the value of the element is changed. This is similar to the standard <code>change</code> event, but it is throttled to firing at most once every 100ms while the value of the input is changing.</td>
    <td>Elements that fire <code>input</code> event.</td>
    <td>Same as <code>change</code> event data.</td>
  </tr>
</table>

### amp-accordion > section <a name="amp-accordion"></a>

<table>
  <tr>
    <th width="25%">Event</th>
    <th width="35%">Description</th>
    <th width="40%">Data</th>
  </tr>
  <tr>
    <td><code>expand</code></td>
    <td>Fired when an accordion section expands.</td>
    <td>None.</td>
  </tr>
  <tr>
    <td><code>collapse</code></td>
    <td>Fired when an accordion section collapses.</td>
    <td>None.</td>
  </tr>
</table>

### amp-carousel[type="slides"] <a name="amp-carouseltypeslides"></a>

<table>
  <tr>
    <th width="25%">Event</th>
    <th width="35%">Description</th>
    <th width="40%">Data</th>
  </tr>
  <tr>
    <td><code>slideChange</code></td>
    <td>Fired when the carousel's current slide changes.</td>
    <td><pre>// Slide number.
event.index</pre></td>
  </tr>
</table>

### amp-lightbox <a name="amp-lightbox"></a>

<table>
  <tr>
    <th width="25%">Event</th>
    <th width="35%">Description</th>
    <th width="40%">Data</th>
  </tr>
  <tr>
    <td><code>lightboxOpen</code></td>
    <td>Fired when lightbox is fully visible.</td>
    <td>None</td>
  </tr>
  <tr>
    <td><code>lightboxClose</code></td>
    <td>Fired when lightbox is fully closed.</td>
    <td>None</td>
  </tr>
</table>

### amp-list <a name="amp-list"></a>

<table>
  <tr>
    <th width="25%">Event</th>
    <th width="35%">Description</th>
    <th width="40%">Data</th>
  </tr>
  <tr>
    <td><code>fetch-error</code>(low-trust)</td>
    <td>Fired when fetching data fails.</td>
    <td>None</td>
  </tr>
</table>

### amp-selector <a name="amp-selector"></a>

<table>
  <tr>
    <th width="25%">Event</th>
    <th width="35%">Description</th>
    <th width="40%">Data</th>
  </tr>
  <tr>
    <td><code>select</code></td>
    <td>Fired when an option is selected or deselected.</td>
    <td><pre>// Target element's "option" attribute value.
event.targetOption

// Array of "option" attribute values of all selected elements.
event.selectedOptions</pre></td>

  </tr>
</table>

### amp-sidebar <a name="amp-sidebar"></a>

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

### amp-state <a name="amp-state"></a>

<table>
  <tr>
    <th width="25%">Event</th>
    <th width="35%">Description</th>
    <th width="40%">Data</th>
  </tr>
  <tr>
    <td><code>fetch-error</code>(low-trust)</td>
    <td>Fired when fetching data fails.</td>
    <td>None</td>
  </tr>
</table>

### form <a name="form"></a>

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

## Element-specific actions <a name="element-specific-actions"></a>

### \* (all elements) <a name="-all-elements"></a>

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
    <td>Shows the target element. If an
    <a href="https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input#autofocus"><code>autofocus</code> element</a> becomes visible as a
    result, it gains focus.</td>
  </tr>
  <tr>
    <td><code>toggleVisibility</code></td>
    <td>Toggles the visibility of the target element. If an
    <a href="https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input#autofocus"><code>autofocus</code> element</a> becomes visible as a
    result, it gains focus.</td>
  </tr>
  <tr>
    <td><code>toggleClass(class=STRING, force=BOOLEAN)</code></td>
    <td>Toggles class of the target element. <code>force</code> is optional, and if defined, it ensures that class would only be added but not removed if set to <code>true</code>, and only removed but not added if set to <code>false</code>.</td>
  </tr>
  <tr>
    <td><code>toggleChecked(force=BOOLEAN)</code></td>
    <td>Toggles checked state of the target element. <code>force</code> is optional, and if defined, it ensures that the resulting state would be identical to the value of <code>force</code>.</td>
  </tr>
  <tr>
    <td><code>focus</code></td>
    <td>Makes the target element gain focus. To lose focus, <code>focus</code>
    on another element (usually parent element). We strongly advise against
    losing focus by focusing on <code>body</code>/<code>documentElement</code>
    for accessibility reasons.</td>
  </tr>
</table>

### amp-accordion <a name="amp-accordion-1"></a>

<table>
  <tr>
    <th>Action</th>
    <th>Description</th>
  </tr>
  <tr>
    <td><code>toggle(section=STRING)</code></td>
    <td>Toggles the <code>expanded</code> and <code>collapsed</code> states of <code>amp-accordion</code> sections. When called with no arguments, it toggles all sections of the accordion. Trigger on a specific section by providing the section id: <code>on="tap:myAccordion.toggle(section='section-id')"</code>.
  </tr>
  <tr>
    <td><code>expand(section=STRING)</code></td>
    <td>Expands the sections of the accordion. If a section is already expanded, it stays expanded. When called with no arguments, it expands all sections of the accordion. Trigger on a specific section by providing the section id: <code>on="tap:myAccordion.expand(section='section-id')"</code>.</td>
  </tr>
  <tr>
    <td><code>collapse(section=STRING)</code></td>
    <td>Collapses the sections of the accordion. If a section is already collapsed, it stays collapsed. When called with no arguments, it collapses all sections of the accordion. Trigger on a specific section by providing the section id: <code>on="tap:myAccordion.collapse(section='section-id')"</code>.</td>
  </tr>
</table>

### amp-carousel[type="slides"] <a name="amp-carouseltypeslides-1"></a>

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

### amp-image-lightbox <a name="amp-image-lightbox"></a>

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

### amp-lightbox <a name="amp-lightbox-1"></a>

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

### amp-list <a name="amp-list-1"></a>

<table>
  <tr>
    <th>Action</th>
    <th>Description</th>
  </tr>
  <tr>
    <td><code>changeToLayoutContainer</code></td>
    <td>Update's <code>amp-list</code>'s layout to <code>layout="CONTAINER"</code> to allow <a href="../../extensions/amp-list/amp-list.md#dynamic-resizing">dynamic resizing</a>.</td>
  </tr>
  <tr>
    <td><code>refresh</code></td>
    <td>Refreshes data from the <code>src</code> and re-renders the list.</td>
  </tr>
</table>

### amp-selector <a name="amp-selector-1"></a>

<table>
  <tr>
    <th>Action</th>
    <th>Description</th>
  </tr>
  <tr>
    <td><code>clear</code></td>
    <td>Clears all selections from a defined <code>amp-selector</code>.</td>
  </tr>
  <tr>
    <td><code>selectUp(delta=INTEGER)</code></td>
    <td>Moves the selection up by the value of `delta`. The default `delta` is set to -1. If no options are selected, the selected state will become the value of the last option.</td>
  </tr>
  <tr>
    <td><code>selectDown(delta=INTEGER)</code></td>
    <td>Moves the selection down by the value of `delta`. The default `delta` is set to 1. If no options are selected, the selected state will become the value of the first option.</td>
  </tr>
  <tr>
    <td><code>toggle(index=INTEGER, value=BOOLEAN)</code></td>
    <td>Toggles the application of the `selected`. If the select attribute is absent, this action adds it. If the select attribute is present, this action removes it.

    You may force and keep an add or remove by including a boolean value in the `value` argument. A value of `true` will force add the `selected` attribute and not remove it if already present. A value of  `false` will remove the attribute, but not add it if absent.

  </td>
  </tr>
</table>

### amp-sidebar <a name="amp-sidebar-1"></a>

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

### form <a name="form-1"></a>

<table>
  <tr>
    <th>Action</th>
    <th>Description</th>
  </tr>
  <tr>
    <td><code>clear</code></td>
    <td>Clears any values in the form's inputs.</td>
  </tr>
  <tr>
    <td><code>submit</code></td>
    <td>Submits the form.</td>
  </tr>
</table>

## Special targets <a name="special-targets"></a>

The following are targets provided by the AMP system that have special requirements:

### Target: AMP <a name="target-amp"></a>

The `AMP` target is provided by the AMP runtime and implements top-level
actions that apply to the whole document.

<table>
  <tr>
    <th width="40%">Action</th>
    <th>Description</th>
  </tr>
  <tr>
    <td><code>setState({foo: 'bar'})</code><sup>1</sup></td>
    <td>
      <p>Requires <a href="https://amp.dev/documentation/components/amp-bind.html#updating-state-with-ampsetstate">amp-bind</a>.</p>
      <p>Merges an object literal into the bindable state.</p>
      <p></p>
    </td>
  </tr>
</table>

<sup>1</sup>When used with <a href="#multiple-actions-for-one-event">multiple actions</a>, subsequent actions will wait for <code>setState()</code> to complete before invocation. Only a single <code>setState()</code> is allowed per event.
