<!---
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

# Whopa InFeed

## Example installation of the InFeed widget

### Basic

```html
<amp-embed
  width="100"
  height="100"
  type="whopainfeed"
  layout="responsive"
  heights="(min-width:1907px) 39%, (min-width:1200px) 46%, (min-width:780px) 64%, (min-width:480px) 98%, (min-width:460px) 167%, 196%"
  data-siteId="1234"
  data-template="default"
>
</amp-embed>
```

## Configuration

For details on the configuration, please contact Whopa Team support@whopa.net \
These configurations are relevant for both `<amp-ad />` and `<amp-embed />`.

### Required parameters

- `data-siteId`: Site ID provided by Whopa InFeed Team.

### Optional parameters

- `data-template`: The Template of Widget.

**Resolution**

You can set an initial height of what the widget height is supposed to be. That is, instead of `height="100"`, if the widget's final height is 600px, then set `height="600"`. Setting the initial height **_will not_** finalize the widget height if it's different from the actual. The widget will resize to it's true dimensions after the widget leaves the viewport.
