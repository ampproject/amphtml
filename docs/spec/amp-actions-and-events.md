# Actions and events in AMP

[TOC]

[tip type="note"]
This documentation covers actions and events for AMP websites, stories and ads. Read [Actions and events in AMP email](amp-email-actions-and-events.md) for the AMP email format.
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
  <tr>
    <td><code>copy-success</code></td>
    <td>Fired when the content/text is successfully copied into the clipboard.</td>
  </tr>
  <tr>
    <td><code>copy-error</code></td>
    <td>Fired when there's an error while copying the content. If there's an error while copying the content, the <code>event.data.type</code> will be set to the <code>error</code> value. If the browser is not supporting the copy method, the <code>event.data.type</code> will be set to the <code>browser</code> value.</td>
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

<!-- Previous anchor to the next heading, keeping to preserve old fragment links: -->

<a name="amp-video-amp-youtube"></a>

### <a name="amp-video-events"></a> amp-video and other Video Elements

The events below are dispatched by `amp-video`, `amp-video-iframe` and [3rd party video players](https://github.com/ampproject/amphtml/blob/main/docs/spec/amp-video-interface.md) like `amp-youtube`.

<table>
  <tr>
    <th width="25%">Event</th>
    <th width="35%">Description</th>
    <th width="40%">Data</th>
  </tr>
  <tr>
    <td><code>firstPlay</code>(low-trust)</td>
    <td>Fired the first time the video is played by the user. On autoplay videos, this is fired as soon as the user interacts with the video. This event is low-trust which means it can not trigger most actions; only low-trust actions such as <code>amp-animation</code> actions can be run.</td>
    <td></td>
  </tr>
  <tr>
    <td><code>timeUpdate</code>(low-trust)</td>
    <td>Fired when the playing position of a video has changed. Frequency of the event is controlled by AMP and is currently set at 1 second intervals. This event is low-trust which means it can not trigger most actions; only low-trust actions such as <code>amp-animation</code> actions can be run.</td>
    <td><code>{time, percent}</code><code>time</code> indicates the current time in seconds, <code>percent</code> is a number between 0 and 1 and indicates current position as percentage of total time.</td>
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
    <td><code>scrollTo(duration=INTEGER, position=STRING)</code></td>
    <td>Scrolls an element into view with a smooth animation.<br>
    <code>duration</code> is optional. Specifies the length of the animation in milliseconds. If unspecified, an amount relative to scroll difference
    under or equal to 500 milliseconds is used.<br>
    <code>position</code> is optional. One of <code>top</code>, <code>center</code>
    or <code>bottom</code> (default <code>top</code>).
    Specifies the position of the element relative to the viewport after
    scrolling.<br>
    As an accessibility best practice, pair this with a call to <code>focus()</code> to focus on the element being scrolled to.</td>
  </tr>
  <tr>
    <td><code>focus</code></td>
    <td>Makes the target element gain focus. To lose focus, <code>focus</code>
    on another element (usually parent element). We strongly advise against
    losing focus by focusing on <code>body</code>/<code>documentElement</code>
    for accessibility reasons.</td>
  </tr>
</table>

### amp-audio <a name="amp-audio"></a>

<table>
  <tr>
    <th width="20%">Action</th>
    <th>Description</th>
  </tr>
  <tr>
    <td><code>play</code></td>
    <td>Plays the audio. Is a no-op if the <code>&lt;amp-audio></code> element is a descendant of <code>&lt;amp-story></code>.</td>
  </tr>
  <tr>
    <td><code>pause</code></td>
    <td>Pauses the audio. Is a no-op if the <code>&lt;amp-audio></code> element is a descendant of <code>&lt;amp-story></code>.</td>
  </tr>
</table>

### amp-bodymovin-animation <a name="amp-bodymovin-animation"></a>

<table>
  <tr>
    <th>Action</th>
    <th>Description</th>
  </tr>
  <tr>
    <td><code>play</code></td>
    <td>Plays the animation.</td>
  </tr>
  <tr>
    <td><code>pause</code></td>
    <td>Pauses the animation.</td>
  </tr>
  <tr>
    <td><code>stop</code></td>
    <td>Stops the animation.</td>
  </tr>
  <tr>
    <td><code>seekTo(time=INTEGER)</code></td>
    <td>Sets the currentTime of the animation to the specified value and pauses animation. </td>
  </tr>
  <tr>
    <td><code>seekTo(percent=[0,1])</code></td>
    <td>Uses the given percentage value to determine the currentTime of the animation to the specified value and pauses animation. </td>
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
  <tr>
    <td><code>toggleAutoplay(toggleOn=true|false)</code></td>
    <td>Toggle the carousel's autoplay status. <code>toggleOn</code> is optional.</td>
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

### amp-lightbox-gallery <a name="amp-lightbox-gallery"></a>

<table>
  <tr>
    <th>Action</th>
    <th>Description</th>
  </tr>
  <tr>
    <td><code>open</code></td>
    <td>Opens the lightbox-gallery. Can be triggered by tapping another element, if you specify the image id: `on="tap:amp-lightbox-gallery.open(id='image-id')"`.</td>
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

### amp-live-list <a name="amp-live-list"></a>

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

### amp-state <a name="amp-state-1"></a>

<table>
  <tr>
    <th>Action</th>
    <th>Description</th>
  </tr>
  <tr>
    <td><code>refresh</code></td>
    <td>Refetches data at the `src` attribute while ignoring browser cache.</td>
  </tr>
</table>

### amp-user-notification <a name="amp-user-notification"></a>

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

<!-- Previous anchor to the next heading, keeping to preserve old fragment links: -->

<a name="video-elements"></a>

### <a name="amp-video-actions"></a> amp-video and other Video Elements

The actions below are supported in `amp-video`, `amp-video-iframe` and [3rd party video players](https://github.com/ampproject/amphtml/blob/main/docs/spec/amp-video-interface.md) like `amp-youtube`.

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
    <td><code>fullscreenenter</code></td>
    <td>Takes the video to fullscreen.</td>
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
    <td><code>navigateTo(url=STRING, target=STRING, opener=BOOLEAN)</code></td>
    <td>
      <p>Navigates current window to given URL, to the optional specified target if given (currently only supporting <code>_top</code> and <code>_blank </code>). The optional <code>opener</code> parameter can be specified when using a target of <code>_blank</code> to allow the newly opened page to access <a href="https://developer.mozilla.org/en-US/docs/Web/API/Window/opener"><code>window.opener</code></a>.</p>
      <p><strong>Caveat:</strong> Using normal <code>&lt;a&gt;</code> links is recommended wherever possible since <code>AMP.navigateTo</code> is not recognized by web crawlers.</p>
    </td>
  </tr>
  <tr>
    <td><code>closeOrNavigateTo(url=STRING, target=STRING, opener=BOOLEAN)</code></td>
    <td>
      <p>Tries to close the window if allowed, otherwise it navigates similar to <code>navigateTo</code> Action. Useful for use-cases where a "Back" button may need to close the window if it were opened in a new window from previous page or navigate if it wasn't opened.</p>
      <p><strong>Caveat:</strong> Using normal <code>&lt;a&gt;</code> links is recommended wherever possible since <code>AMP.closeOrNavigateTo</code> is not recognized by web crawlers.</p>
    </td>
  </tr>
  <tr>
    <td><code>goBack(navigate=BOOLEAN)</code></td>
    <td>Navigates back in history. `navigate` is optional, and if set to <code>true</code>, allows for cross-document navigation similar to [history.back](https://developer.mozilla.org/en-US/docs/Web/API/History/back).</td>
  </tr>
  <tr>
    <td><code>print</code></td>
    <td>Opens the Print Dialog to print the current page.</td>
  </tr>
  <tr>
    <td>scrollTo(id=STRING, duration=INTEGER, position=STRING)</td>
    <td>Scrolls to the provided element ID on the current page.</td>
  </tr>
  <tr>
    <td>optoutOfCid</td>
    <td>Opts out of Client ID generation for all scopes.</td>
  </tr>
  <tr>
    <td><code>setState({foo: 'bar'})</code><sup>1</sup></td>
    <td>
      <p>Requires <a href="https://amp.dev/documentation/components/amp-bind.html#updating-state-with-ampsetstate">amp-bind</a>.</p>
      <p>Merges an object literal into the bindable state.</p>
      <p></p>
    </td>
  </tr>
  <tr>
    <td><code>pushState({foo: 'bar'})</code><sup>1</sup></td>
    <td>
      <p>Requires <a href="https://amp.dev/documentation/components/amp-bind.html#modifying-history-with-amppushstate">amp-bind</a>.</p>
      <p>Merges an object literal into the bindable state and pushes a new entry onto browser history stack. Popping the entry will restore the previous values of variables (in this example, <code>foo</code>).    </td>
  </tr>
  <tr>
    <td><code>copy(text='content')</code></td>
    <td>
      <p>Copy any content to the clipboard. <code>text</code> is optional, and if is set it will copy those content/value into the clipboard.</p>
    </td>
    <td><code>toggleTheme()</code></td>
    <td>Toggles the amp-dark-mode class on the body element when called and sets users preference to the localStorage. The amp-dark-mode class is added by default to body based on the <code>prefers-color-scheme</code> value. Use <code>data-prefers-dark-mode-class</code> attribute on body tag to override the class to be used for dark mode.</td>
  </tr>
</table>

<sup>1</sup>When used with <a href="#multiple-actions-for-one-event">multiple actions</a>, subsequent actions will wait for <code>setState()</code> or <code>pushState()</code> to complete before invocation. Only a single <code>setState()</code> or <code>pushState()</code> is allowed per event.

### Target: amp-access <a name="target-amp-access"></a>

The `amp-access` target is provided by the [amp-access](https://amp.dev/documentation/components/amp-access.html) component.

The `amp-access` target is special for these reasons:

1.  You can't give an arbitrary ID to this target. The target is always `amp-access`.
2.  The actions for `amp-access` are dynamic depending on the structure of the [AMP Access Configuration](https://amp.dev/documentation/components/amp-access#configuration).

See [details](https://amp.dev/documentation/components/amp-access#login-link) about using the `amp-access` target.
