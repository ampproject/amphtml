---
$category@: dynamic-content
formats:
  - websites
teaser:
  text: Provides a calendar widget to select dates.
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

# amp-date-picker

[TOC]

<table>
  <tr>
    <td width="40%"><strong>Description</strong></td>
    <td>Provides a widget to select dates. The date picker can render as an overlay relative to input fields, or as a static calendar widget.</td>
  </tr>
  <tr>
    <td width="40%"><strong>Required Script</strong></td>
    <td><code>&lt;script async custom-element="amp-date-picker" src="https://cdn.ampproject.org/v0/amp-date-picker-0.1.js">&lt;/script></code></td>
  </tr>
  <tr>
    <td class="col-fourty"><strong><a href="https://amp.dev/documentation/guides-and-tutorials/develop/style_and_layout/control_layout">Supported Layouts</a></strong></td>
    <td><ul>
      <li>For static mode: <code>fixed</code>, <code>fixed-height</code>, <code>responsive</code>, <code>fill</code> or <code>flex-item</code></li>
      <li>For overlay mode: <code>container</code></li>
    </ul></td>
  </tr>
  <tr>
    <td class="col-fourty"><strong>Examples</strong></td>
    <td>See AMP By Example's <a href="https://ampbyexample.com/components/amp-date-picker/">amp-date-picker</a>.</td>
  </tr>
</table>


## Behavior

You can use the `amp-date-picker` to render a calendar on a page that a user can select dates from.

*Example: Basic calendar*

In this example, we display a fixed-height static calendar, where a user can select a single date:


```html
<amp-date-picker
  layout="fixed-height"
  height="360">
</amp-date-picker>
```

<amp-img alt="static single date picker" layout="fixed" src="https://github.com/ampproject/amphtml/raw/master/extensions/amp-date-picker/img/amp-date-picker-basic.png" width="329" height="365">
  <noscript>
    <img alt="static single date picker" src="https://github.com/ampproject/amphtml/raw/master/extensions/amp-date-picker/img/amp-date-picker-basic.png" width="329" height="365">
  </noscript>
</amp-img>

*Example: Calendar for a specific input field*

In this example, the calendar displays as an overlay for the specific form field:

```html
<form
  method="post"
  action-xhr="/form/echo-json/post"
  target="_blank">
  <amp-date-picker
      mode="overlay"
      layout="container"
      input-selector="[name=deliverydate]">
    <label for="deliverydate">Deliver Date:</label>
    <input type="text" name="deliverydate">
  </amp-date-picker>
</form>
```

## Display modes

The `amp-date-picker` provides two modes to render the date picker: static (default) or overlay.

### Static mode

By specifying `mode="static"`, the `amp-date-picker` renders a static calendar view. This is the default display mode; if no mode is specified, a static calendar is rendered.

For a static date picker, you must specify a size-defined layout, which can be one of: `fixed`, `fixed-height`, `responsive`, `fill` or `flex-item`.

When the `static` amp-date-picker is rendered in a `<form>`, if there are no [inputs specified with `*input-selector`](#input-selector), the amp-date-picker creates hidden input elements (e.g., `<input type="hidden" …`). The amp-date-picker names the elements as `date` or `start-date` and `end-date`; if those names are already used in the form, the amp-date-picker attempts to name the input fields with the `id` of the `<amp-date-picker>`.

*Example: static date picker in a form field*

This example demonstrates using a static date picker in a form, where the user can select a date range in the calendar. As there are no `*input-selector` attributes defined in the amp-date-picker, hidden input fields are automatically generated.

```html
<form
  method="post"
  action-xhr="/form-post"
  target="_blank">
<fieldset>
  <label>
    <span>Your name</span>
    <input type="text" name="name" id="name" required>
  </label>
  <label for="date">Your date</label>
  <amp-date-picker
      type="range"
      mode="static"
      id="date"
      layout="fixed-height"
      height="360">
    <!-- automatically generates hidden input fields:
    <input type="hidden" name="start-date">
    <input type="hidden" name="end-date"> -->
  </amp-date-picker>
  <input type="submit" value="Subscribe">
</fieldset>
<div submit-success>
<template type="amp-mustache">
  Success! Thanks {{name}} for choosing {{start-date}} and {{end-date}}.
</template>
</div>
</form>
```

### Overlay mode

By specifying `mode="overlay"`, when the user clicks, focuses, or presses the down-arrow in an input field connected with the amp-date-picker, the calendar appears. The calendar overlay positions itself relative to the `<amp-date-picker>` tag.

For an overlay date picker, you must specify `layout="container"` and contain the input fields that it will render.

*Example: overlay date picker in a form*

This example demonstrates using a overlay date picker in a form where the user can choose a date.  The date picker is connected to a specific input field via the `input-selector` attribute.

```html
<form
  method="post"
  action-xhr="/form-post"
  target="_blank">
  <input type="text" name="name" placeholder="Your Name" required>
  <amp-date-picker
      type="single"
      mode="overlay"
      layout="container"
      input-selector="[name=date]">
    <input type="text" name="date" placeholder="Your Date">
  </amp-date-picker>
  <input type="submit" value="Subscribe">
  <div submit-success>
    <template type="amp-mustache">
      Success! Thanks {{name}} for choosing {{date}}.
    </template>
  </div>
  </form>
```

On touch devices, an `amp-date-picker` in overlay mode automatically adds the
`readonly` attribute to its `<input>` elements.
This prevents the device's on-screen keyboard from opening unncessesarily.
To opt-out of this behavior, add the `touch-keyboard-editable` attribute to the
`<amp-date-picker>` element.

<!-- TODO(cvializ): talk about why type="tel" is on the inputs -->

## Selection types

The `amp-date-picker` provides two types of dates to select:

* `single`: Select a single date within the date picker.
* `range`: Select a date range within the date picker.

### `type="single"`

By specifying `type="single"`, the date picker attaches to a single input,
and the user can select a single date. This is the default selection type.

```html
<amp-date-picker
  type="single"
  layout="fixed-height"
  height="360">
</amp-date-picker>
```

<amp-img alt="static single date picker" layout="fixed" src="https://github.com/ampproject/amphtml/raw/master/extensions/amp-date-picker/img/amp-date-picker-single-static.png" width="336" height="370">
  <noscript>
    <img alt="static single date picker" src="https://github.com/ampproject/amphtml/raw/master/extensions/amp-date-picker/img/amp-date-picker-single-static.png" width="336" height="370">
  </noscript>
</amp-img>

### `type="range"`

By specifying  `type="range"`, the date picker attaches to two inputs,
and the user can select a date range with a starting date and ending date.

```html
<amp-date-picker
  type="range"
  layout="fixed-height"
  height="360">
</amp-date-picker>
```

<amp-img alt="static single date picker" layout="fixed" src="https://github.com/ampproject/amphtml/raw/master/extensions/amp-date-picker/img/amp-date-picker-range-static.png" width="332" height="373">
  <noscript>
    <img alt="static single date picker" src="https://github.com/ampproject/amphtml/raw/master/extensions/amp-date-picker/img/amp-date-picker-range-static.png"  width="332" height="373">
  </noscript>
</amp-img>

## Date formats

`amp-date-picker` attributes accept dates in ISO 8601 and RFC 5545 RRULE formats.

[ISO 8601](https://en.wikipedia.org/wiki/ISO_8601) formats dates as `YYYY-MM-DD`
and is the standard for sharing dates between electronic systems.
For example, ISO 8601 formats the date February 28 2018 as `2018-02-28`.

[RFC 5545 Recurrence Rules (RRULEs)](https://icalendar.org/iCalendar-RFC-5545/3-3-10-recurrence-rule.html)
standardize a format for specifying repeating dates.
For example, RFC 5545 formats Halloween as `RRULE:FREQ=YEARLY;BYMONTH=10;BYMONTHDAY=31`.
More complex dates are also possible, such as the United States Thanksgiving holiday,
which is every November on the fourth Thursday: `RRULE:FREQ=YEARLY;BYMONTH=11;BYDAY=+4TH`.
The API is not friendly to memorize, but there are various
[RRULE generators](https://jakubroztocil.github.io/rrule) available online.


## Attributes

##### mode

Specifies how the date picker is rendered. Allowed values are:

- **`static`** (default): The date picker renders as an interactive calendar view.
- **`overlay`**: The date picker calendar view is not rendered until the user interacts
with required input field(s) nested in the `<amp-date-picker>`.

##### type

Specifies the selection type for the date picker. Allowed values are:

- **`single`** (default): The user can select a single date.
- **`range`**: The user can select a date range.

##### input-selector

A query selector for a single date picker's input. If this is omitted,
the date picker automatically generates a hidden input field, and assigns it
a name of `date` or `${id}-date` using the date picker's id. If either of these conflict
with an existing element in the form, an error is emitted.

When `amp-date-picker` loads, the input element's value is used to display the
initially selected date.

Specify the `date` property via the [`src` attribute](#src) to set
an initial date dynamically.

```html
<amp-date-picker
    type="single"
    mode="overlay"
    layout="container"
    input-selector="[name=deliverydate]">
  <input type="text" name="deliverydate" placeholder="Delivery Date">
</amp-date-picker>
```

##### start-input-selector

A query selector for a date range picker's start date input. If this is omitted,
the date picker automatically generates a hidden input field, and assigns it
a name of `start-date` or `${id}-start-date` using the date picker's id. If either of these conflict
with an existing element in the form, an error is emitted.

When `amp-date-picker` loads, the input element's value is used to display the
initially selected start date.

Specify the `startDate` property via the [`src` attribute](#src-optional) to set
an initial end date dynamically.

```html
<input id="a2">
<input id="b2">
<amp-date-picker
    type="range"
    start-input-selector="#a2"
    end-input-selector="#b2"
    layout="fixed-height" height="360">
</amp-date-picker>
```

##### end-input-selector

A query selector for a date range picker's end date input. If this is omitted,
the date picker automatically generates a hidden input field, and assigns it
a name of `end-date` or `${id}-end-date` using the date picker's id. If either of these conflict
with an existing element in the form, an error is emitted.

When `amp-date-picker` loads, the input element's value is used to display the
initially selected end date.

Specify the `endDate` property via the [`src` attribute](#src) to set
an initial end date dynamically.

```html
<input id="a2">
<input id="b2">
<amp-date-picker
    type="range"
    start-input-selector="#a2"
    end-input-selector="#b2"
    layout="fixed-height" height="360">
</amp-date-picker>
```

##### min

The earliest date that the user may select. This must be formatted as an ISO 8601 date.
If no `min` attribute is present, the current date will be the minimum date.

The `min` attribute may be updated after a user gesture with [`amp-bind`](https://amp.dev/documentation/components/amp-bind).

##### max

The latest date that the user may select. This must be formatted as an ISO 8601 date.
If no `max` attribute is present, the date picker will have no maximum date.

The `max` attribute may be updated after a user gesture with [`amp-bind`](https://amp.dev/documentation/components/amp-bind).

#####  month-format

The format to use for displaying the month in the calendar view.
The default format is: `"MMMM YYYY"`.

##### format

The format to use for displaying and parsing the date in the input boxes.
The default format is `"YYYY-MM-DD"`.

##### week-day-format

The format to use for displaying the day of the week in the calendar view.
If no `week-day-format` is present, the weekdays display as the first character of the weekday.

```html
<amp-date-picker
    type="single"
    mode="overlay"
    layout="container"
    format="MM/DD/YYYY"
    week-day-format="ddd"
    input-selector="[name=date]">
  <input type="text" name="date" placeholder="Your Date">
</amp-date-picker>
```

##### locale

The locale to use for rendering the calendar view. The default locale is `"en"`.

##### maximum-nights

The number of nights that the user's selection may not exceed in a date range.
The default is `"0"`.
A value of `"0"` allows the user to select an unlimited number of nights.

##### minimum-nights

The number of nights that the user must select in a date range. The default is `"1"`.
A value of `"0"` allows users to select the same date for the start and end dates.

##### number-of-months

The number of months to display at one time in the calendar view. The default is `"1"`.

##### first-day-of-week

The day to specify as the first day of the week (0-6). The default value is `"0"` (Sunday).

##### blocked

A space-separated list of ISO 8601 dates or RFC 5545 RRULE repeating dates to prevent the user from selecting on the calendar.

##### highlighted

A space-separated list of ISO 8601 dates or RFC 5545 RRULE repeating dates to specially style as highlighted to draw the user's attention.
Default styling is a blue dot on the date.

##### day-size

The size in `px` of the date cells in the calendar view table. The default is `39`.

Note: [due to a bug](https://github.com/ampproject/amphtml/issues/13897),
a non-default `day-size` causes the date picker height to be incorrect on months
that span more than 4 weeks. To prevent incorrect height, add a CSS rule to the
document that sets a minimum height for the date picker.

```css
.amp-date-picker-resize-bug .DayPicker_transitionContainer {
  min-height: 354px; /* 354px is the default. You must update it. */
}
```

##### allow-blocked-ranges

If present, this attribute allows the user to select a range containing blocked date(s).
By default, this attribute is not present.

##### src

If present, `amp-date-picker` requests JSON data to populate certain attributes dynamically, as well as matching lists of dates to template `id`s for rendering days in the calendar.

If your calendar data is personalized for the user or updates often,
these values should be specified in the `src` JSON response and not with their corresponding attributes on the `amp-date-picker` element.

The following table lists the properties that you can specify in the JSON data:

<table>
<tr>
<th width="30%"><code>src</code><br>property</th>
<th>Description</th>
</tr>
<tr>
<td><code>blocked</code></td>
<td>An array of ISO 8601 single dates or RFC 5545 RRULE repeating dates to render as blocked in the calendar view. The user is prevented from selecting these dates.</td>
</tr>
<tr>
<td><code>date</code></td>
<td>Specifies the initially selected date. In a date picker with <code>type="range"</code> this has no effect. In order to prevent overwriting the user's input, this value has no effect if the user has already selected a date.</td>
</tr>
<tr>
<td><code>endDate</code></td>
<td>Specifies the initially selected end date. In a date picker with <code>type="single"</code> this has no effect. In order to prevent overwriting the user's input, this value has no effect if the user has already selected an end date.</td>
</tr>
<tr>
<td><code>highlighted</code></td>
<td>An array of ISO 8601 single dates or RFC 5545 RRULE repeating dates to render as highlighted in the calendar view.</td>
</tr>
<tr>
<td><code>startDate</code></td>
<td>Specifies the initially selected start date for a date picker with <code>type="range"</code>. In a date picker with <code>type="single"</code> this has no effect. In order to prevent overwriting the user's input, this value has no effect if the user has already selected a start date.</td>
</tr>
<tr>
<td><code>templates</code></td>
<td>The templates property is an array of <a href=#template-definition-objects>"template definition objects"</a>. These objects have an <code>id</code> property and a <code>dates</code> property.</td>
</tr>
</tbody>
</table>

The `src` attribute may be updated after a user gesture with [`amp-bind`](https://amp.dev/documentation/components/amp-bind).

###### template definition objects

The `dates` property is an array of ISO 8601 single dates or RFC 5545 RRULE repeating dates.
The `id` property specifies the `id` of a template that the date picker can use to
render the specified dates in the calendar view.

```json
{
  "id": "my-template-id",
  "dates": [
    "2018-01-02",
    "FREQ=WEEKLY;DTSTART=20180101T000000Z;COUNT=52;WKST=SU;BYDAY=TU"
  ]
}
```

If no `dates` property is specified in a template definition object, the template
with the given `id` will be used as the default template to render any dates
that do not have an explicitly specified template.

```json
{"id": "my-default-template-id"}
```

*Example: Specifying properties via the `src` attribute*

```json
{
  "blocked": ["2018-02-14"],
  "highlighted": ["2018-02-15"],
  "templates": [
    {
      "id": "my-template-id",
      "dates": ["2018-01-01"]
    },
    {
      "id": "my-second-template-id",
      "dates": [
        "2018-01-02",
        "FREQ=WEEKLY;DTSTART=20180101T000000Z;COUNT=52;WKST=SU;BYDAY=TU"
      ]
    },
    {
      "id": "my-default-template-id"
    }
  ],
  "startDate": "2018-01-01",
  "endDate": "2018-02-02",
  "date": "2018-02-03"
}
```

*Example: Markup using the `src` attribute*

```html
<amp-date-picker src="https://www.example.com/date-data.json"
  layout="fixed-height" height="360">
  <template type="amp-mustache" date-template id="my-template-id">⚡️</template>
  <template type="amp-mustache" date-template id="my-second-template-id">🌮</template>
  <template type="amp-mustache" date-template id="my-default-template-id">{{D}}</template>
</amp-date-picker>
```

##### fullscreen

Renders the picker to fill the space available to it, like in a fullscreen lightbox.
This works best with `layout="fill"`.

```html
<input on="tap:lightbox.open" placeholder="Start" id="start">
<input on="tap:lightbox.open" placeholder="End" id="end">
<button on="tap:dp.clear">Clear</button>
<amp-lightbox id="lightbox" layout="nodisplay">
  <amp-date-picker
    id="date-picker"
    layout="fill"
    fullscreen
    type="range"
    number-of-months="12"
    start-input-selector="#start"
    end-input-selector="#end"
    on="
      activate: lightbox.open;
      deactivate: lightbox.close"
  ></amp-date-picker>
</amp-lightbox>
```

<amp-img alt="static single date picker" layout="fixed" src="https://github.com/ampproject/amphtml/raw/master/extensions/amp-date-picker/img/amp-date-picker-lightbox-fullscreen.png" width="320" height="571">
  <noscript>
    <img alt="static single date picker" src="https://github.com/ampproject/amphtml/raw/master/extensions/amp-date-picker/img/amp-date-picker-lightbox-fullscreen.png" width="320" height="571">
  </noscript>
</amp-img>

##### open-after-select

If present, keeps the date picker overlay open after the user selects a date or dates. By default, this attribute is not present.

##### open-after-clear

If present, keeps the date picker open after the user clears the date or dates. By default, this attribute is not present.

##### common attributes

This element includes [common attributes](https://www.ampproject.org/docs/reference/common_attributes) extended to AMP components.


## Events

These events may trigger actions on other AMP components using the `on` attribute.
e.g. `on="activate: my-lightbox.open"`

Read more about [AMP Actions and Events](https://www.ampproject.org/docs/interaction_dynamic/amp-actions-and-events).

##### activate

The date picker triggers the `activate` event when the user begins
an interaction with the calendar view, i.e. when the overlay would open.

##### deactivate

The date picker triggers the  `deactivate` event when the user ends
their interaction with the calendar view, i.e. when the overlay would close.

##### select

The date picker triggers the `select` event when the user selects a date or
date range. When selecting a date range, the event is emitted when the end
date and start date are both selected.
The `select` event contains the following properties.

For a single date picker:

<table>
<tr>
<th width="30%">Property</th>
<th>Description</th>
</tr>
<tr>
<td><code>date</code></td>
<td>The date that was selected.</td>
</tr>
<tr>
<td><code>id</code></td>
<td>The <code>id</code> attribute of the first <a href="#templates">date template</a> that applies to this date.</td>
</tr>
</table>

```html
<amp-date-picker type="single" on="select: AMP.setState({date: event.date, templateSelected: event.id})" …>
  <!-- … -->
</amp-date-picker>
```

For a date range picker:

<table>
<tr>
<th width="30%">Property</th>
<th>Description</th>
</tr>
<tr>
<td><code>dates</code></td>
<td>An array of the dates that were selected. Each object in the array contains the <code>date</code> and <code>id</code> properties from the single date picker <code>change</code> event object.</td>
</tr>
<tr>
<td><code>start</code></td>
<td>A shortcut for the first date in the date range (<code>event.dates[0]</code>).
</tr>
<tr>
<td><code>end</code></td>
<td>A shortcut for the last date in the date range (<code>event.dates[event.dates.length - 1]</code>).
</tr>
</table>

```html
<amp-date-picker type="range" on="select: AMP.setState({dates: event.dates, firstTemplate: event.start.id})" …>
  <!-- … -->
</amp-date-picker>
```

## Actions

These actions may be triggered by other components using the `on` attribute.
e.g. `on="tap: date-picker.setDate(date=state.value)"`

Read more about [AMP Actions and Events](https://www.ampproject.org/docs/interaction_dynamic/amp-actions-and-events).

##### clear

The `clear` action clears the date value or values from the single date picker
or date range picker with the specified `id`, e.g. `date-picker`.

```html
<button on="tap: date-picker.clear">Clear</button>
```

##### setDate

The `setDate` action assigns the value of the `date` argument to
the single date picker with the specified `id`, e.g. `date-picker`.

```html
<button on="tap: date-picker.setDate(date='2018-01-01')">
  Set to Jan 1, 2018
</button>
```

##### setDates

The `setDate` action assigns the value of the `start` and `end` arguments to
the date range picker with the specified `id`, e.g. `date-picker`.

```html
<button on="tap: date-picker.setDates(start='2018-01-01', end='2018-01-07')">
  Set to Jan 1, 2018 through Jan 7, 2018
</button>
```

##### today

The `today` action assigns the value of the current day,
plus an `offset` argument, to the single date picker with the specified `id`,
e.g. `date-picker`. The `offset` argument value can be any integer.

```html
<button on="tap: date-picker.today">Today</button>
<button on="tap: date-picker.today(offset=1)">Tomorrow</button>
<button on="tap: date-picker.today(offset=-1)">Yesterday</button>
```

##### startToday

The `startToday` action assigns the value of the current day,
plus an `offset` argument, to the date range picker with the specified `id`,
e.g. `date-picker`. The `offset` argument value can be any integer.

```html
<button on="tap: date-picker.startToday">Today</button>
<button on="tap: date-picker.startToday(offset=1)">Tomorrow</button>
<button on="tap: date-picker.startToday(offset=-1)">Yesterday</button>
```

The `startToday` action can be combined with the `endToday` action
to select ranges with an offset.

```html
<button
  on="tap:date-picker.startToday(offset=7), date-picker.endToday(offset=14)">
  Next week
</button>
```

##### endToday

The `endToday` action assigns the value of the current day,
plus an `offset` argument, to the date range picker with the specified `id`,
e.g. `date-picker`. The `offset` argument value can be any integer.

```html
<button on="tap: date-picker.endToday">Today</button>
<button on="tap: date-picker.endToday(offset=1)">Tomorrow</button>
<button on="tap: date-picker.endToday(offset=-1)">Yesterday</button>
```

The `endToday` action can be combined with the `startToday` action
to select ranges with an offset.

```html
<button
  on="tap:date-picker.startToday(offset=7), date-picker.endToday(offset=14)">
  Next week
</button>
```

## Templates

`amp-date-picker` provides a markup API to render templates for certain dates
and for an extra information area below the calendar view.

##### date-template

`amp-date-picker` consumes templates specified in HTML markup to render dates.
These templates must only be used for dates that will not need to be updated
often, like holidays. For rendering special information in the calendar days
like days with sales, or amounts of money, or other information that must change
often, consider [using the `src` attribute](#src) instead.
Using `src` prevents chached AMP documents from showing out-of-date information.


A `date-template` must have a `dates` or `default` attribute.

- **dates**: A space-separated list of ISO 8601 single dates or RFC 5545 RRULE repeating dates.
  The template content will render for the dates matching the dates in the attribute.
- **default**: If the `default` attribute is present, the template content will render for
  all dates not matching an existing template.

The date picker provides mustache variables to render in the templates.
These variables are ISO 8601 format string values e.g. `DD`, `D`, `X`, etc.

`date-template`s may contain any valid AMP content and are only
rendered after the calendar view renders for the first time.

```html
<amp-date-picker layout="fixed-height" height="360">
  <!-- Render the "party" emoji on New Years Day 2018 -->
  <template type="amp-mustache" date-template dates="2018-01-01">🎉</template>
  <!-- Render the "taco" emoji every Tuesday for 52 weeks starting 2018-01-01 -->
  <template
      type="amp-mustache"
      date-template
      dates="FREQ=WEEKLY;DTSTART=20180101T000000Z;COUNT=52;WKST=SU;BYDAY=TU"
  >🌮</template>
  <!-- Render an image -->
  <template type="amp-mustache" date-template dates="2018-01-02">
    <amp-img layout="fixed-height" height="39" src="./example.jpg"></amp-img>
  </template>
  <!-- Renders dates in the two-digit day format -->
  <template type="amp-mustache" date-template default>{{DD}}</template>
</amp-date-picker>
```

##### info-template

The `info-template` contains markup to render in an information area below
the calendar view. `info-template`s may contain any valid AMP content and are only
rendered after the calendar view renders for the first time.

```html
<amp-date-picker layout="fixed-height" height="360">
  <template type="amp-mustache" info-template>
    Warning: Tacos are only available on Tuesday
  </template>
</amp-date-picker>
```

<!-- ## TODO(cvializ): document styling -->

<!-- ## TODO(cvializ): document tooltips -->

## Validation

See [amp-date-picker rules](https://github.com/ampproject/amphtml/blob/master/extensions/amp-date-picker/validator-amp-date-picker.protoascii) in the AMP validator specification.
