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

# OnNetwork

## Examples

### Simple movie tag with `data-sid`

```html
<amp-ad width="800" height="450" type="onnetwork" data-sid="Hhhhh993jdkal">
</amp-ad>
```

### Movie placement with `data-mid`

```html
<amp-ad width="800" height="450" type="onnetwork" data-mid="Jjs9298dhfkla">
</amp-ad>
```

### Ad tag or placement with `src`

```html
<amp-ad
  width="800"
  height="450"
  type="onnetwork"
  src="https://video.onnetwork.tv/embed.php?ampsrc=1&sid=HHq0298djlakw"
>
</amp-ad>
```

## Configuration

Please refer to [OnNetwork Help](https://www.onnetwork.tv) for more
information on how to get required movie tag or placement IDs.

### Supported parameters

Only one of the mentioned parameters should be used at the same time.

- `data-sid`
- `data-mid`
- `src`: must use https protocol and must be from one of the
  allowed OnNetwork hosts.
