---
$category@: social
formats:
  - websites
teaser:
  text: Embeds the Facebook page plugin.
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

# amp-facebook-page

## Usage

Use the `amp-facebook-page` component to embed the [Facebook page plugin](https://developers.facebook.com/docs/plugins/page-plugin).

```html
<amp-facebook-page
  width="340"
  height="130"
  layout="fixed"
  data-hide-cover="true"
  data-href="https://www.facebook.com/imdb/"
>
</amp-facebook-page>
```

## Attributes

## Attributes

### `data-href`

The absolute URL of the Facebook page. For example,
`https://www.facebook.com/imdb/`.

### `data-locale` (optional)

By default, the locale is set to the user's system language; however, you can
specify a locale as well. For details, visit the
[Facebook API Localization page](https://developers.facebook.com/docs/internationalization).

### `data-tabs` (optional)

Specifies the tabs to render (i.e., `timeline`, `events`, `messages`). Use a
comma-separated list to add multiple tabs (e.g., `timeline, events`). By
default, the Facebook page plugin shows the timeline activity.

### `data-hide-cover` (optional)

Hides the cover photo in the header. Default value is `false`.

### `data-show-facepile` (optional)

Shows profile photos of friends who like the page. Default value is `true`.

### `data-hide-cta` (optional)

Hides the custom call to action button (if available). Default value is `false`.

### `data-small-header` (optional)

Uses the small header instead. Default value is `false`.

### Common attributes

This element includes [common attributes](https://amp.dev/documentation/guides-and-tutorials/learn/common_attributes)
extended to AMP components.

## Validation

See [amp-facebook-page rules](validator-amp-facebook-page.protoascii) in the AMP validator specification.
