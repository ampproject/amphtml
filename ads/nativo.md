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

# Nativo

## Example

```html
<amp-ad
  type="nativo"
  height="150"
  width="350">
</amp-ad>
```

## PARAMS
<table>
<thead>
    <tr>
        <th>#</th><th>Attribute</th><th>Description</th>
    </tr>
</thead>
<tbody>
<tr>
    <td>1)</td><td>data-premium</td><td>(optional) Will switch to premium</td>
 </tr>
 <tr>
    <td>2)</td><td>data-debug</td><td>(optional) (optional) WIll enable debug</td>
 </tr>
 <tr>
    <td>3)</td><td>data-delay</td><td>(optional) Will set autostart to false and add will be load based on either timeout or when in view</td>
 </tr>
 <tr>   
    <td>4)</td><td>data-delay-by-time</td><td>(required with data-delay) WIll delay render of add based off millisecond time</td>
 </tr>
 <tr>   
    <td>5)</td><td>data-delay-by-view</td><td>(required with data-delay) WIll delay render until ad is in view</td>
</tr>
<tr>
    <td>6)</td><td>data-request-url</td><td>Used to pass a domain to Nativo script. If no value provided, the domain of the current page will be used</td>

</tr>
</tbody>
</table>

## Configuration

For semantics of configuration, please [contact Nativo](http://www.nativo.net/#contact-us).
