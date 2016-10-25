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

# Imagead

Imagead does not represent a specific network. Rather, it provides a way for 
a site to display simple image ads on a self-service basis. You must provide
your own ad server to deliver the ads in json format as shown below.

## Examples

### Single ad

```html
<amp-ad width=300 height=250
    type="adimage"
    data-slot="1"
    data-url="https://mysite/my-ad-server"
>
</amp-ad>
<!-- The ad server will be called with the URL https://mysite/my-ad-server?s=1 -->
```

### Two ads with different slots

```html
<amp-ad width=300 height=250
    type="adimage"
    data-slot="1"
    data-url="https://mysite/my-ad-server"
>
</amp-ad>
<amp-ad width=400 height=300
    type="adimage"
    data-slot="2"
    data-url="https://mysite/my-ad-server"
>
</amp-ad>
<!-- The ad server will be called with the URL https://mysite/my-ad-server?s=1,2 -->
```

### Ads from different ad servers
```html
<amp-ad width=300 height=250
    type="adimage"
    data-slot="slot-name-a"
    data-url="https://mysite/my-ad-server"
>
</amp-ad>
<amp-ad width=400 height=300
    type="adimage"
    data-slot="slot-name-b"
    data-url="https://mysite/my-ad-server"
>
</amp-ad>
<amp-ad width=300 height=250
    type="adimage"
    data-slot="123"
    data-url="https://my-other-site/my-other-ad-server"
>
</amp-ad>
<!-- Two ad server calls will be made: -->
<!-- The first:  https://mysite/my-ad-server?s=slot-name-a,slot-name-b -->
<!-- The second: https://my-other-site/my-other-ad-server?s=123 -->
```



## Supported parameters

### data-url (mandatory)

This must be starting with `https://`, and it must be the address of an ad
server returning json in the format defined below.

### data-slot (mandatory)

On the assumption that most pages have multiple ad slots, this is passed to the
ad server to tell it which slot is being fetched. It is generally a number, but it 
can be some arbitrary string as long as it does not contain the characters "?" and "&".

### data-target (optional)

Can be one of `_blank` or `_self` to indicate where the target URL should open when
the ad is clicked on.

## Ad server

The ad server will be called once for each value of `data-url` on the page: for the vast 
majority of applications, all your ads will be from a single server so it will be
called only once.

A parameter like `?s=1,2` will be appended to the URL specified by `data-url` in order
to specify the slots being fetched. See the examples above for details.

The ad server should return a json object containing a record for each slot in the request.
The record contains three fields:

* src - string to go into the source parameter of the image to be displayed. This can be a 
web reference (in which case it must be `https:` or a `data:` URI including the base64-encoded image.
* target - URL to which the user is to be directed
* info - A string with additional info about the ad that was served, to be sent to analytics

Here is an example response, assuming two slots named simply 1 and 2:

```json
{
    "1":{
        "src":"https:\/\/my-ad-server.com\/my-advertisement.gif",
        "target":"https:\/\/bachtrack.com",
        "info":"Info1"
    },
    "2":{
        "src":"data:image/gif;base64,R0lGODlhyAAiALM...DfD0QAADs=",
        "target":"http:\/\/onestoparts.com",
        "info":"Info2"}
    }
```

## To do

Give some advice for how to use amp-analytics
Do some proper support for different layouts - right now, there's strange behaviour if you use responsive