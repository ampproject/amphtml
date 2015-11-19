<!---
Copyright 2015 The AMP HTML Authors. All Rights Reserved.

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

### <a name="amp-twitter"></a> `amp-twitter`

Displays a Twitter Tweet.

Example:
```html
<amp-twitter width=486 height=657
    layout="responsive"
    data-tweetid="585110598171631616"
    data-cards="hidden">
```

**CAVEATS**

Twitter does not currently provide an API that yields fixed aspect ratio Tweet embeds. We currently automatically proportionally scale the Tweet to fit the provided size, but this may yield less than ideal appearance. Authors may need to manually tweak the provided width and height. You may also use the `media` attribute to select the aspect ratio based on screen width. We are looking for feedback how feasible this approach is in practice.

#### Attributes

**data-tweetid**

The ID of the tweet. In a URL like https://twitter.com/joemccann/status/640300967154597888 `640300967154597888` is the tweetID.

**data-nameofoption**

Options for the Tweet appearance can be set using `data-` attributes. E.g. `data-cards="hidden"` deactivates Twitter cards. For documentation of the available options, see [Twitter's docs](https://dev.twitter.com/web/javascript/creating-widgets#create-tweet).
