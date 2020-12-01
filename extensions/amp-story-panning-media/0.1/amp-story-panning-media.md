---
$category@: presentation
formats:
  - websites
  - email
teaser:
  text: Fill this in with teaser text to improve SEO. Use the component description.
draft: 
  - true
---

<!--
  All documentation starts with frontmatter. Front matter organizes documentation on amp.dev
  and improves SEO.
  * Include the relevant category(ies): ads-analytics, dynamic-content, layout, media, presentation, social, personalization
  * List applicable format(s): websites, ads, stories, email
  * Do not include markdown formatting in the frontmatter - plain text and punctionation only!
  * Remove this comment!
-->

<!--
Copyright 2020 The AMP HTML Authors. All Rights Reserved.

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

# amp-story-panning-media

<!--
  If the component is relevant for more than one format and operates differently between these
  formats, include and filter multiple content blocks and code samples.
-->

## Usage

One to three paragraphs explaining the component usage. List important functionality. Explain why developers care about it.

[filter formats=“websites”]

Below is an example for websites.

[example preview="inline" playground="true" imports="amp-story-panning-media"]

```html
<amp-story-panning-media required-attribute>
  I am a hello world inline executable code sample for websites!
</amp-story-panning-media>
```

[/example][/filter]

<!--
  * [Read more about filtering sections](https://amp.dev/documentation/guides-and-tutorials/contribute/contribute-documentation/formatting/?format=websites#filtering-sections)
  * [Read more about executable code samples](https://amp.dev/documentation/guides-and-tutorials/contribute/contribute-documentation/formatting/?format=websites#preview-code-samples)
 -->

[filter formats=“ads”]

Below is an example for ads.

[example preview=“inline” playground=“true” imports="amp-story-panning-media"]

```html
<amp-story-panning-media required-attribute>
  I am a hello world inline executable code sample for ads!
</amp-story-panning-media>
```

[/example][/filter]

### Behavior users should be aware of (optional)

What to do if they want behavior. How to work around it.

```html
<amp-story-panning-media required-attribute>
  Code sample of behavior or behavior workaround.
</amp-story-panning-media>
```

### Behavior restrictions

What is allowed, what isn't.

## Attributes

### `attribute-name`

Description of attribute. Use cases for this attribute.

- `attribute-value-option-one` (default): `attribute-option-one-value` does this to `amp-story-panning-media`.
- `attribute-value-option-two`: `attribute-option-two-value` does this to `amp-story-panning-media`.

### `optional-attribute-name` (optional)

Here, I write what `optional-attribute-name` will do to `amp-story-panning-media`.

## Actions (optional)

### `action-name`

Description of action. Use cases of `action-name`. Include all the nuances, such as: `amp-story-panning-media` needs to be identified with an `id` to work.

## Events (optional)

### `event-name`

Description of event. Use cases of event-name. Include all the nuances, such as: `amp-story-panning-media` needs to be identified with an `id` to work.

[example preview=”top-frame” playground=”true”]

```html
<head>
  <script
    custom-element="amp-story-panning-media"
    async
    src="https://cdn.ampproject.org/v0/amp-story-panning-media-latest.js"
  ></script>
</head>
<body>
  <amp-story-panning-media
    required-attribute
    on="event-name: my-button.show"
  >
    Hello World!
  </amp-story-panning-media>
  <button id="my-button" hidden>
    Here I am!
  </button>
</body>
```

[/example]

## Styling (optional)

Explain how to style the element.

## Analytics (optional)

Explain analytics.

```html
"configuration": {}
```

## Accessibility (optional)

Accessibility information related to `amp-story-panning-media`.

## Version notes (optional)

Information on version differences and migration notes.

## Validation

See [amp-story-panning-media rules](https://github.com/ampproject/amphtml/blob/master/extensions/amp-story-panning-media/validator-amp-story-panning-media.protoascii) in the AMP validator specification.
