---
\$category@: presentation
formats:
  - websites
  - email
teaser:
  text: Fill this in with teaser text to improve SEO.
---

<!--
  All documentation starts with frontmatter. Front matter organizes documentation on amp.dev
  and improves SEO.
  * Include the relevant category(ies): ads-analytics, dynamic-content, layout, media, presentation, social, personalization
  * List applicable format(s): websites, ads, stories, email
  * Remove this comment!
-->

<!--
Copyright ${year} The AMP HTML Authors. All Rights Reserved.

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

# `${name}`

<table>
  <tr>
    <td width="40%"><strong>Description</strong></td>
    <td>FILL THIS IN</td>
  </tr>
  <tr>
    <td width="40%"><strong>Availability</strong></td>
    <td>FILL THIS IN</td>
  </tr>
  <tr>
    <td width="40%"><strong>Required Script</strong></td>
    <td><code>&lt;script async custom-element="${name}" src="https://cdn.ampproject.org/v0/${name}-0.1.js">&lt;/script></code></td>
  </tr>
  <tr>
    <td class="col-fourty"><strong><a href="https://amp.dev/documentation/guides-and-tutorials/develop/style_and_layout/control_layout">Supported Layouts</a></strong></td>
    <td>FILL THIS IN</td>
  </tr>
  <tr>
    <td width="40%"><strong>Examples</strong></td>
    <td>FILL THIS IN</td>
  </tr>
</table>

<!--
  If the component is relevant for more than one format and operates differently between these
  formats, include and filter multiple code samples.
-->

[filter formats=“websites”]

[example preview=“inline” playground=“true” imports=“amp-component-name”]

```html
<amp-component-name required-attribute>
  I am a hello world inline executable code sample for websites!
</amp-component-name>
```

[/example][/filter]

[filter formats=“ads”][example preview=“inline” playground=“true” imports=“amp-component-name”]

```html
<amp-component-name required-attribute>
  I am a hello world inline executable code sample for ads!
</amp-component-name>
```

[/example][/filter]

## Usage

One to three paragraph explaining the component usage.

List important functionality.

Explain why developers care about it.

### Common thing users need to know to do for ads

Explanation of how to do this thing

[example preview=“inline” playground=“true” imports=“amp-component-name”]

```html
Code sample of this usage
```

[/example]

### Behavior users should be aware of

What to do if they want behavior. How to work around it.

```html
Code sample of behavior or behavior workaround.
```

### Behavior restrictions

What is allowed, what isn't.

## Attributes

### attribute-name

Description of attribute. Use cases for this attribute.

- attribute-value-option-one (default): attribute-option-one-value does this to amp-component-name.
- attribute-value-option-two: attribute-option-two-value does this to amp-component-name.

[example preview=”top-frame” playground=”true”]

```html
<head>
     <amp-component-name script tag>
</head>
<body>
     <amp-component-name attribute-name="attribute-value-option-one">
          I am an inline executable code sample of the amp-component that demonstrates how
          `attribute-name` with the value of "attribute-option-one-value" behaves.
     </amp-component-name>
</body>
```

[/example]

<!--
  If the attribute list requires a table, use the template below.
-->

<table>
  <tr>
    <td width="40%"><strong>data-my-attribute</strong></td>
    <td>FILL THIS IN. This table <strong>must</strong> be written in HTML.</td>
  </tr>
</table>

### optional-attribute-name (optional)

Here, I write what optional-attribute-name will do to amp-component-name.

[example preview=”top-frame” playground=”true”]

```html
<head>
     <amp-component-name script tag>
</head>
<body>
     <amp-component-name optional-attribute-name>
          I am an inline executable code sample of the amp-component that demonstrates how
          `optional-attribute-name` behaves.
     </amp-component-name>
</body>
```

[/example]

Actions

### action-name

Description of action. Use cases of action-name. Include all the nuances, such as: amp-component-name needs to be identified with an `id` to work.

[example preview=”top-frame” playground=”true”]

```html
<head>
     <amp-component-name script tag>
</head>
<body>
     <amp-component-name required-attribute>
          Hello World!
     </amp-component-name>
     <button on="tap:amp-component-name.action-name">
         Do Action
    </button>
</body>
```

[/example]

## Events

### event-name

Description of event. Use cases of event-name. Include all the nuances, such as: amp-component-name needs to be identified with an `id` to work.

[example preview=”top-frame” playground=”true”]

```html
<head>
     <amp-component-name script tag>
</head>
<body>
     <amp-component-name required-attribute
       on="event-name: my-button.show">
          Hello World!
     </amp-component-name>
     <button id="my-button" hidden>
         Here I am!
    </button>
</body>
```

[/example]

## Styling

Explain how to style the element.

[example preview=”top-frame” playground=”true”]

```html
<head>
     <amp-component-name script tag>
     <style amp-custom>
           .amp-component-name {
               background-color: amp-blue;
            }
     </amp style-custom>
</head>
<body>
     <amp-component-name required-attribute>
          Hello World!
     </amp-component-name>
     <button id="my-button" hidden>
         Here I am!
    </button>
</body>
```

[/example]

## Analytics (if applicable)

Explain analytics.

```html
"configuration": {}
```

## Accessibility

Accessibility information related to `amp-component-name`.

## Validation

See [\${name} rules](https://github.com/ampproject/amphtml/blob/master/extensions/${name}/validator-${name}.protoascii) in the AMP validator specification.
