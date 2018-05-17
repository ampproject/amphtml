<!---
Copyright 2016 The AMP HTML Authors. All Rights Reserved.

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

# Custom (experimental)

Custom does not represent a specific network. Rather, it provides a way for 
a site to display simple ads on a self-service basis. You must provide
your own ad server to deliver the ads in json format as shown below.

Each ad must contain a [mustache](https://github.com/ampproject/amphtml/blob/master/extensions/amp-mustache/amp-mustache.md)
template.

Each ad must contain the URL that will be used to fetch data from the server.

Usually, there will be multiple ads on a page. The best way of dealing with this
is to give all the ads the same ad server URL and give each ad a different slot id:
this will result in a single call to the ad server.

An alternative is to use a different URL for each ad, according to some format
understood by the ad server(s) which you are calling.

## Examples

### Single ad with no slot specified

```html
<amp-ad width=300 height=250
    type="custom"
    data-url="https://mysite/my-ad-server">
    <template type="amp-mustache" id="amp-template-id">
      <a href="{{href}}">
        <amp-img layout='fixed' height="200" width="200" src="{{src}}" data-info="{{info}}"></amp-img>
      </a>
    </template>
</amp-ad>
<!-- The ad server will be called with the URL https://mysite/my-ad-server -->
```

### Two ads with different slots
The template can be specified outside the `amp-ad` tag for sharing. You can refer to the template using its ID via the `template` attribute of `amp-ad`. You can also provide a `data-slot` attribute for each `amp-ad`, so they can share one single remote request to fetch the ads data.

```html
<template type="amp-mustache" id="amp-template-id">
  <a href="{{href}}">
    <amp-img layout='fixed' height="300" width="250" src="{{src}}" data-info="{{info}}"></amp-img>
  </a>
</template>
<amp-ad width=300 height=250
    type="custom"
    template="amp-template-id"
    data-url="https://mysite/my-ad-server?someparam=somevalue"
    data-slot="1">
</amp-ad>
<amp-ad width=400 height=300
    type="custom"
    template="amp-template-id"
    data-url="https://mysite/my-ad-server?someparam=somevalue"
    data-slot="2">
</amp-ad>
<!-- The ad server will be called with the URL https://mysite/my-ad-server?someparam=somevalue&ampslots=1,2 -->
```

### Ads from different ad servers
```html
<amp-ad width=300 height=250
    type="custom"
    data-url="https://mysite/my-ad-server"
    data-slot="slot-name-a">
    <template type="amp-mustache" id="amp-template-id">
      <a href="{{href}}">
        <amp-img layout='fixed' height="300" width="250" src="{{src}}" data-info="{{info}}"></amp-img>
      </a>
    </template>
</amp-ad>
<amp-ad width=400 height=300
    type="custom"
    data-url="https://mysite/my-ad-server"
    data-slot="slot-name-b">
    <template type="amp-mustache" id="amp-template-id">
      <a href="{{href}}">
        <amp-img layout='fixed' height="400" width="300" src="{{src}}" data-info="{{info}}"></amp-img>
      </a>
    </template>
</amp-ad>
<amp-ad width=300 height=250
    type="custom"
    data-url="https://my-other-site/my-other-ad-server"
    data-slot="123">
    <template type="amp-mustache" id="amp-template-id">
      <a href="{{href}}">
        <amp-img layout='fixed' height="300" width="250" src="{{src}}" data-info="{{info}}"></amp-img>
      </a>
    </template>
</amp-ad>
<!-- Two ad server calls will be made: -->
<!-- The first:  https://mysite/my-ad-server?ampslots=slot-name-a,slot-name-b -->
<!-- The second: https://my-other-site/my-other-ad-server?ampslots=123 -->
```

## Supported parameters

### data-url (mandatory)

This must be starting with `https://`, and it must be the address of an ad
server returning json in the format defined below. This endpoint must be available
cross-origin. (See [CORS in AMP](https://www.ampproject.org/docs/fundamentals/amp-cors-requests).)

### data-slot (optional)

On the assumption that most pages have multiple ad slots, this is passed to the
ad server to tell it which slot is being fetched. This can be any alphanumeric string.

If you have only a single ad for a given value of `data-url`, it's OK not to bother with
the slot id. However, do not use two ads for the same `data-url` where one has a slot id
specified and the other does not.

## Ad server

The ad server will be called once for each value of `data-url` on the page: for the vast 
majority of applications, all your ads will be from a single server so it will be
called only once.

A parameter like `?ampslots=1,2` will be appended to the URL specified by `data-url` in order
to specify the slots being fetched. See the examples above for details.

The ad server should return a json object containing a record for each slot in the request, keyed by the
slot id in `data-slot`. The record format is defined by your template. For the examples above,
the record contains three fields:

* src - string to go into the source parameter of the image to be displayed. This can be a 
web reference (in which case it must be `https:` or a `data:` URI including the base64-encoded image.
* href - URL to which the user is to be directed when he clicks on the ad
* info - A string with additional info about the ad that was served, mmaybe for use with analytics

Here is an example response, assuming two slots named simply 1 and 2:

```json
{
    "1": {
        "src":"https://my-ad-server.com/my-advertisement.gif",
        "href":"https://bachtrack.com",
        "info":"Info1"
    },
    "2": {
        "src":"data:image/gif;base64,R0lGODlhyAAiALM...DfD0QAADs=",
        "href":"http://onestoparts.com",
        "info":"Info2"
    }
}
```
If no slot was specified, the server returns a single template rather than an array.

```json
{
    "src":"https://my-ad-server.com/my-advertisement.gif",
    "href":"https://bachtrack.com",
    "info":"Info1"
}
```
The ad server must enforce [AMP CORS](https://github.com/ampproject/amphtml/blob/master/spec/amp-cors-requests.md#cors-security-in-amp).
Here is an example set of the relevant response headers:
```
Access-Control-Allow-Origin:https://cdn.ampproject.org
Access-Control-Expose-Headers:AMP-Access-Control-Allow-Source-Origin
AMP-Access-Control-Allow-Source-Origin:https://my-ad-server.com
```

## Analytics

To get analytics of how your ads are performing, use the [amp-analyics](https://github.com/ampproject/amphtml/blob/master/extensions/amp-analytics/amp-analytics.md) tag.

Here is an example of how to make it work with Google Analytics events. Note that the variables can be set either by the code
that displays the page (as in `eventAction`) or in variables passed back by the ad server (as in `eventCategory` and `eventLabel`).

```html
<amp-ad type="custom" layout="responsive" width="300" height="250" 
    data-url="https://mysite/my-ad-server">
    <template type="amp-mustache" id="my-amp-template-id">
        <a href="{{href}}" data-vars-event-label="{{evehtLabel}}" data-vars-event-category="{{category}}">
            <amp-img layout='responsive' width="300" height="250" src="{{artwork}}"></amp-img>
        </a>
    </template>  
</amp-ad>
<amp-analytics type='googleanalytics'>
<script type='application/json'>
{
    "requests": {
        "vars": {
            "account":"UA-9999999-9"
        },
        "triggers": {
            "trackAmpAd": {
            "on": "click",
            "selector": "amp-ad a",
            "request": "event",
            "vars":{
                "eventCategory": "${eventCategory}",
                "eventAction": "My Ad Click Action",
                "eventLabel": "${eventLabel}"
            }
        }
    }
}
</script>
</amp-analytics>
```

## To do

Add support for json variables in the data-url - and perhaps other variable substitutions in the way amp-list does
