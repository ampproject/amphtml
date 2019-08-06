<!---
Copyright 2019 The AMP HTML Authors. All Rights Reserved.

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

# Streamrail

Please visit [www.streamrail.com](http://www.streamrail.com) for more details.

## Example

```html
<amp-ad width="300" height="250"
    type="streamrail"
    data-streamrail_player_type="blade"
    data-streamrail_macros='{"page_url": "[PAGE_URL]",  "ip":"[IP]","ua":"[UA]","cb":"[CB]","dnt":"[DNT]","sub_id":"[SUB_ID]","user_consent":"[USER_CONTENT]","gdpr":"[GDPR]"}'
    data-streamrail_player_id="5af16139cb938a00022c1326"
    data-streamrail_api_key="5af15a3b02e28f0002000001">
</amp-ad>
```

## Configuration

For details on the configuration semantics, see [Streamrail documentation](https://partners-api-docs.streamrail.com/#player-api).

### Required parameters 

- `width`
- `height`
- `data-streamrail_player_type`
- `data-streamrail_player_id`
- `data-streamrail_api_key`