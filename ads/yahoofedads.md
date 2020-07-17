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

# Yahoo Native-Display Ads Federation

## Example

Yahoo Native-Display Ads Federation only requires a configured section code to run. Please work with your account manager to configure your AMP sections.

### Basic

```html
<amp-embed
  width="320"
  height="320"
  layout="responsive"
  type="yahoofedads"
  data-site="finance"
  data-region="US"
  data-lang="en-US"

  data-space-id="980771322"
  data-section-id="5661957"
  data-ad-unit="pencil"
  data-sa="{&quot;LREC&quot;:&quot;300x250&quot;,&quot;secure&quot;:&quot;true&quot;,&quot;content&quot;:&quot;no_expandable;&quot;,&quot;isSupplySegment&quot;:&quot;false&quot;,&quot;lang&quot;:&quot;en-US&quot;,&quot;region&quot;:&quot;US&quot;,&quot;site_attribute&quot;:&quot;wiki_topics=\&quot;Anthony_Joshua;Tyson_Fury;Eddie_Hearn;Deontay_Wilder;Kubrat_Pulev;Tottenham_Hotspur_Stadium;Dillian_Whyte\&quot; ctopid=\&quot;2074500;2078500;2083000;2212000;13311000\&quot; hashtag=\&quot;2074500;2078500;2083000;2212000;13311000\&quot; rs=\&quot;lmsid:a0ad000000AxDnbAAF;revsp:omnisport.uk;lpstaid:71ee6f14-9c73-3688-b4a9-32e6578057d0;pct:story\&quot;&quot;}"
  data-url="https://techcrunch.com"
  /* Optional override parameters */
  data-ad-position-override="lrec"
>
</amp-embed>
```

### Required parameters

- `data-site`, `data-region`, `data-lang`: Unique site/region/lang code that represents your site
- `data-ad-unit`: The AD position with federation config, valid value can be `pencil`, `moments` or `outstream`
- `data-sa`: The site-attribute used by display AD to render
- `data-url`: Url the AD is hosted in for tracking purpose
- `data-space-id`: Use this to override what space id need to be used on picking up Display AD
- `data-section-id`: Use this ot override what section id need to be used on picking up Native AD

### Optional override parameters

- `data-ad-position-override`: The position which will be fetched from backend mandatorily, it can be `lrec`, `wfpad`, `reservedMoments`, `nativeMoments` or `nativeRegular`
