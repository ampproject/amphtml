---
\$category@: presentation
formats:
  - websites
  - email
teaser:
  text: Fill this in with teaser text to improve SEO. Use the component description.
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

# \${name}

<!--
  If the component is relevant for more than one format and operates differently between these
  formats, include and filter multiple content blocks and code samples.
-->

## Usage

One to three paragraphs explaining the component usage. List important functionality. Explain why developers care about it.

[filter formats=“websites”]

Below is an example for websites.

[example preview="inline" playground="true" imports="${name}"]

```html
<${name} required-attribute>
  I am a hello world inline executable code sample for websites!
</${name}>
```

[/example][/filter]

<!--
  * [Read more about filtering sections](https://amp.dev/documentation/guides-and-tutorials/contribute/contribute-documentation/formatting/?format=websites#filtering-sections)
  * [Read more about executable code samples](https://amp.dev/documentation/guides-and-tutorials/contribute/contribute-documentation/formatting/?format=websites#preview-code-samples)
 -->

[filter formats=“ads”]

Below is an example for ads.

[example preview=“inline” playground=“true” imports="${name}"]

```html
<${name} required-attribute>
  I am a hello world inline executable code sample for ads!
</${name}>
```

[/example][/filter]

### Standalone use outside valid AMP documents (optional)

Bento AMP allows you to use AMP components in non-AMP pages without needing to commit to fully valid AMP. You can take these components and place them in implementations with frameworks and CMSs that don't support AMP. Read more in our guide [Use AMP components in non-AMP pages](https://amp.dev/documentation/guides-and-tutorials/start/bento_guide/)

#### Example

Code snippet of Bento component in standalone usage.

#### Interactivity and API usage

Bento enabled components in standalone use are highly interactive through their API. Because standalone mode doesn't require valid AMP, you can create custom interactivity without the use of [`amp-bind`](https://amp.dev/documentation/components/amp-bind/?format=websites) implementations and the API replaces [AMP actions and events](https://amp.dev/documentation/guides-and-tutorials/learn/amp-actions-and-events/?format=websites).

The `${name}` component API is accessible by including the following script tag in your document:

```
await customElements.whenDefined('${name}-component');
const api = await ${name}.getApi();
```

The `${name}` API allows you to register and respond to the following events:

**event 1**
Explanation of event, proper syntax/arguments.

```
example
```

**event 2**
Explanation of event, proper syntax/arguments.

```
example
```

#### Layout and style

Fully valid AMP pages use the AMP layout system to infer sizing of elements to create a page structure before downloading any remote resources. However, Bento use imports components into less controlled environments and AMP's layout system is inaccessible.

**Container type**

The `${name}` component has a container/non-container layout type. To ensure the component renders correctly, apply the following styles:

```css
example
```

**style/layout guidelines 2 (optional)**

Information on how to layout and style `${name}`.

```
example
```

### Behavior users should be aware of (optional)

What to do if they want behavior. How to work around it.

```html
<${name} required-attribute>
  Code sample of behavior or behavior workaround.
</${name}>
```

### Behavior restrictions

What is allowed, what isn't.

## Attributes

### `attribute-name`

Description of attribute. Use cases for this attribute.

-   `attribute-value-option-one` (default): `attribute-option-one-value` does this to `${name}`.
-   `attribute-value-option-two`: `attribute-option-two-value` does this to `${name}`.

### `optional-attribute-name` (optional)

Here, I write what `optional-attribute-name` will do to `${name}`.

## Actions (optional)

### `action-name`

Description of action. Use cases of `action-name`. Include all the nuances, such as: `${name}` needs to be identified with an `id` to work.

## Events (optional)

### `event-name`

Description of event. Use cases of event-name. Include all the nuances, such as: `${name}` needs to be identified with an `id` to work.

[example preview=”top-frame” playground=”true”]

```html
<head>
  <script
    custom-element="${name}"
    async
    src="https://cdn.ampproject.org/v0/${name}-latest.js"
  ></script>
</head>
<body>
  <${name}
    required-attribute
    on="event-name: my-button.show"
  >
    Hello World!
  </${name}>
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

Accessibility information related to `${name}`.

## Version notes (optional)

Information on version differences and migration notes.

## Validation

See [\${name} rules](https://github.com/ampproject/amphtml/blob/master/extensions/${name}/validator-${name}.protoascii) in the AMP validator specification.
