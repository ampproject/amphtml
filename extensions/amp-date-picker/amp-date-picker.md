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

# <a name="amp-date-picker"></a> `amp-date-picker`

[TOC]

<table>
  <tr>
    <td width="40%"><strong>Description</strong></td>
    <td>A date picker component useful for picking dates in the near future or near past. It can render as an overlay relative to input fields, or as a static calendar widget.</td>
  </tr>
  <tr>
    <td width="40%"><strong>Required Script</strong></td>
    <td><code>&lt;script async custom-element="amp-date-picker" src="https://cdn.ampproject.org/v0/amp-date-picker-0.1.js">&lt;/script></code></td>
  </tr>
  <tr>
    <td class="col-fourty"><strong><a href="https://www.ampproject.org/docs/guides/responsive/control_layout.html">Supported Layouts</a></strong></td>
    <td>Size-defined layouts for <code>static</code> mode. <code>container</code> layout for <code>overlay</code> mode.</td>
  </tr>
</table>

## Behavior

An `amp-date-picker` with the `mode="static"` attribute renders a static calendar view.
With `mode="overlay"` the date picker is only shown when the user interacts with its input elements.
Each mode has slightly different functionality.

### `mode="static"`

An overlay picker must use a size-defined layout. The calendar overlay will position itself relative to the `<amp-date-picker>` tag.
The `static` mode is the default mode.

When rendered in a `<form>`, the `static` picker will create hidden input elements if it does not have any
existing inputs specified with `*date-selector`. It will name them `input` or `start-date` and `end-date` if those
names are not taken in the form, and otherwise will attempt to name them with the `id` of the `<amp-date-picker>`.

```html
<form
  method="post"
  action-xhr="/form/echo-json/post"
  target="_blank"
>
  <fieldset>
      <label>
          <span>Your name</span>
          <input type="text" name="name" required>
      </label>
      <label for="date">Your date</label>
      <amp-date-picker
        id="date"
        layout="fixed-height"
        height="360"
      ><!-- <input type="hidden" name="date"> automatically generated --></amp-date-picker>
      <input type="submit" value="Subscribe">
  </fieldset>
  <div submit-success>
    <template type="amp-mustache">
        Success! Thanks {{name}} for choosing {{date}}.
    </template>
  </div>
</form>
```

### `mode="overlay"`

A static picker must use `layout="container"` and contain the input fields that it will render.
When the user clicks, focuses, or presses the down-arrow in an input field the overlay will appear as an overlay
near the input field.

```html
<form
  method="post"
  action-xhr="/form/echo-json/post"
  target="_blank"
>
  <fieldset>
      <label>
          <span>Your name</span>
          <input type="text" name="name" required>
      </label>
      <label for="date">Your date</label>
      <amp-date-picker
        mode="overlay"
        layout="container"
        input-selector="[name=date]"
      >
        <input type="tel" name="date" placeholder="Publish date">
      </amp-date-picker>
      <input type="submit" value="Subscribe">
  </fieldset>
  <div submit-success>
    <template type="amp-mustache">
        Success! Thanks {{name}} for choosing {{date}}.
    </template>
  </div>
</form>
```

<!-- TODO(cvializ): talk about why type="tel" on the inputs -->

{% call callout('Read on', type='read') %}
Learn more about layouts in the [AMP HTML Layout System](https://www.ampproject.org/docs/design/amp-html-layout) spec and [Supported Layouts](https://www.ampproject.org/docs/guides/responsive/control_layout.html#the-layout-attribute).
{% endcall %}


## Attributes


##### mode (optional)

Specifies how the date picker is rendered. Allowed values are:

- **`static`** (default): The date picker is rendered as an interactive calendar view.
- **`overlay`**: The date picker calendar view is not rendered until the user interacts
with required input field(s) nested in the `&lt;amp-date-picker>`.

##### type (optional)

Specifies the selection type for the date picker. Allowed values are:

- **`single`** (default): The date picker selects a single date
- **`range`**: The date picker selects a date range

##### input-selector (optional)

A query selector for a single date picker's input. If this is omitted,
the date picker will automatically generate a hidden input field. It will assign it
a name `date` or `${id}-date` using the date picker's id. If either of these conflict
with an existing element in the form, an error will be emitted.

##### start-input-selector (optional)

A query selector for a date range picker's input. If this is omitted,
the date picker will automatically generate a hidden input field. It will assign it
a name `start-date` or `${id}-start-date` using the date picker's id. If either of these conflict
with an existing element in the form, an error will be emitted.

##### end-input-selector (optional)

A query selector for a date range picker's input. If this is omitted,
the date picker will automatically generate a hidden input field. It will assign it
a name `end-date` or `${id}-end-date` using the date picker's id. If either of these conflict
with an existing element in the form, an error will be emitted.

##### min (optional)

The earliest date the user may select. The default value is the current date.

##### max (optional)

The latest date the user may select. The default value is no end date.

#####  month-format (optional)

The format to use for displaying the month in the calendar view. Default: `"MMMM YYYY"`

##### format (optional)

The format to use for displaying and parsing the date in the input boxes. Default: `"YYYY-MM-DD"`.

##### week-day-format (optional)

The format to use for displaying the day of the week in the calendar view.
Default: non-ISO-standard single character weekday.

##### locale (optional)

The locale to use for rendering the calendar view. Default: `"en"`

##### number-of-months (optional)

The number of months to display at one time in the calendar view. Default: `"1"`

##### first-day-of-week (optional)

The day 0-6 of the first day of the week. Default `"0"` (Sunday)

##### blocked (optional)

A list of ISO 8601 dates or RFC 5545 RRULE repeating dates to prevent the user from selecting on the calendar.

##### highlighted (optional)

A list of ISO 8601 dates or RFC 5545 RRULE repeating dates to specially style as highlighted to draw the user's attention. Default styling is a blue dot on the date.

##### day-size (optional)

The size in `px` of the date cells in the calendar view table. Default: `39`

##### allow-blocked-ranges (optional)

If present, this attribute prevents the user from selecting a range with a blocked date. Default: not present.

##### src (optional)

If present, `amp-date-picker` will make a request for JSON data to populate the `highlighted` and `blocked` lists, as well as matching templates in the document to lists of dates.

```json
{
  "blocked": ["2018-02-14"],
  "highlighted": ["2018-02-15"],
  "templates": [
    {
      "selector": "#my-template-id",
      "dates": ["2018-01-01"]
    },
    {
      "selector": "#my-second-template-id",
      "dates": [
        "2018-01-01",
        "FREQ=WEEKLY;DTSTART=20180201T150000Z;COUNT=30;WKST=SU;BYDAY=TU"
      ]
    },
    {
      "selector": "#my-default-template-id"
    }
  ]
}
```

```html
<amp-date-picker src="https://www.example.com/date-data.json">
  <template id="my-template-id">⚡️</template>
  <template id="my-second-template-id">🌮</template>
  <template id="my-default-template-id">{{D}}</template>
</amp-date-picker>
```

##### fullscreen (optional)

Render the picker to fill the space available to it, like in a fullscreen overlay. Works best with `layout="fill"`.

##### open-after-select (optional)

If present, keep the date picker overlay open after the user selects a date or dates. Default: not present.
TODO(cvializ): does it still trigger deactivate?

##### open-after-clear (optional)

If present, keep the date picker open after the user clears the date or dates. Default: not present.

##### common attributes

This element includes [common attributes](https://www.ampproject.org/docs/reference/common_attributes) extended to AMP components.

## Events

##### activate

`activate` is triggered when the user begins an interaction with the calendar view.

##### deactivate

`deactivate` is triggered when the user ends their interaction with the calendar view, i.e. when the overlay would close.

## Actions

##### setDate

Sets the selected date in a single date picker.

```html
<button on="tap: date-picker.setDate(date='2018-01-01')">
  Set to Jan 1, 2018
</button>
```

##### setDates

Sets the selected start and end dates in a date range picker.

```html
<button on="tap: date-picker.setDates(start='2018-01-01', end='2018-01-07')">
  Set to Jan 1, 2018 through Jan 7, 2018
</button>
```

##### clear

```html
<button on="tap: date-picker.clear">Clear</button>
```

<!-- DO NOT SUBMIT(cvializ): add how to style this -->
<!-- ## Styling -->

<!--
TODO(cvializ): uncomment with validation complete
## Validation

See [amp-carousel rules](https://github.com/ampproject/amphtml/blob/master/extensions/amp-date-picker/validator-amp-date-picker.protoascii) in the AMP validator specification.
-->
