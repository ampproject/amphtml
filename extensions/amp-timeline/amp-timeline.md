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

# <a name="amp-timeline"></a> `amp-timeline`

<table>
  <tr>
    <td width="40%"><strong>Description</strong></td>
    <td>Visual timeline leading up to events</td>
  </tr>
  <tr>
    <td width="40%"><strong>Availability</strong></td>
    <td>In Development</td>
  </tr>
  <tr>
    <td width="40%"><strong>Required Script</strong></td>
    <td><code>&lt;script async custom-element="amp-timeline" src="https://cdn.ampproject.org/v0/amp-timeline-0.1.js">&lt;/script></code></td>
  </tr>
  <tr>
    <td width="40%"><strong>Examples</strong></td>
    <td>
      <a href="https://github.com/ampproject/amphtml/blob/master/examples/timeline.amp.html">timeline.amp.html</a>
      <br/>
      <a href="https://github.com/ampproject/amphtml/blob/master/examples/timeline-integrations.amp.html">timeline-integrations.amp.html</a>
    </td>
  </tr>
</table>

## Usage

Example:
```html
<amp-timeline width="100" height="0" layout="responsive" class="circle">


<section>
    <h1 class="heading background0">Motörhead&#x27;s Lemmy: 1945-2015</h1>
    <amp-img
        src="https://static.telegraph.co.uk/develop/tpp-secure/amp-timeline-demo/img/lemmy-header.jpeg"
        width="1200"
        height="800"
        layout="responsive"></amp-img>

    <ul class="timeline ">
        <li class="item left">
            <div class="card">
                <div class="content">
                    <h3 class="date">24 December 1945</h3>
                </div>
                <div class="media">
                </div>
                <div class="content">
                    <div class="description">
                        <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nam lacinia malesuada commodo. Praesent scelerisque elit non lorem sollicitudin tempor. </p>

                        <p>Fusce sit amet justo ac nunc rhoncus bibendum ut ultricies ligula. Morbi quis iaculis libero. Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia Curae; Nulla vitae mauris eleifend lacus malesuada elementum vitae eget nisi. Phasellus euismod dignissim ante sit amet blandit.</p>
                    </div>
                </div>
            </div>
        </li>
        <li class="item right">
            <div class="card">
                <div class="content">
                    <h3 class="date">1972</h3>
                </div>
                <div class="media">
                </div>
                <div class="content">
                    <div class="description">
                        <p>Pellentesque fringilla nisl tellus, vel facilisis odio sodales aliquam. Sed luctus elit eget purus tincidunt pharetra. </p>
                    </div>
                </div>
            </div>
        </li>
    </ul>
</section>
```
## Styling
You can style the markers using ```circle```, ```square``` class names in the ```<amp-timeline>``` tag at the beggining of HTML markup like so:
```html
<amp-timeline width="100" height="0" layout="responsive" class="circle">
```
The default value is ```diamond```

Both the line and the markers can be customized using the ```<style amp-custom> </amp-custom>``` tag in the head of your HTML file by writing the following CSS rules:

```css
.left .card:before, .right .card:before {
    background-color: #ff0000; /* You can insert here your color code for the marker */
    box-shadow: 0px 0px 0px 2px #00ff00; /* You can insert here your color code for the marker's shadow */
}
li .card:after {
    background-color: #ff0000; /* You can insert here your color code for the marker's line */
}
```

## Validation errors

The following lists validation errors specific to the `amp-timeline` element
(see also `amp-timeline` in the [AMP validator specification](https://github.com/ampproject/amphtml/blob/master/validator/validator.protoascii)):


<table>
  <tr>
    <th width="40%"><strong>Validation Error</strong></th>
    <th>Description</th>
  </tr>
  <tr>
    <td width="40%">
      The first element in a timeline should be a <code>&lt;section></code> tag
    </td>
    <td>Error thrown when required <code>section</code> element is missing. Each amp-timeline should contain one section element to wrap the header and timeline elements.</td>
  </tr>
  <tr>
    <td width="40%">The first element in a timeline should be a <code>&lt;h1></code> tag</td>
    <td>Error thrown when the element after the section element is not a <code>&lt;h1></code> element with class <code>heading</code>.</td>
  </tr>
  <tr>
    <td width="40%">The second element in a timeline should be an image</td>
    <td>Error thrown when the second element in a timeline is not an <code>&lt;amg-img></code> element.</td>
  </tr>
  <tr>
    <td width="40%">The third element in a timeline should a list container with class <code>timeline</code></td>
    <td>Error thrown when the third element in a timeline is not an <code>&lt;ul></code> element that has a class <code>timeline</code>. This is the wrapper for the items section.</td>
  </tr>
  <tr>
    <td width="40%">The timeline must contain at least one item</td>
    <td>Error thrown when the <code>&lt;ul></code> element doesn't have any children.</td>
  </tr>
  <tr>
    <td width="40%">Each item in the timeline must be a <code>&lt;li></code> tag with class <code>item</code>. Item number: <i>[number]</i></td>
    <td>Error thrown when an item that is not a <code>&lt;li></code> element. You can see the item number that generates the error.</td>
  </tr>
  <tr>
    <td width="40%">Each item in the timeline must have either a <code>left</code> or <code>right</code> class. Item number: <i>[number]</i></td>
    <td>Error thrown when an item that doesn't have a <code>left</code> or <code>right</code> class is present. You can see the item number that generates the error.</td>
  </tr>
  <tr>
    <td width="40%">Each item in the timeline must contain only one child card element. Item number: <i>[number]</i></td>
    <td>Error thrown when a <code>li</code> item doesn't contain exactly one child item. You can see the item number that generates the error.</td>
  </tr>
  <tr>
    <td width="40%">Each item in the timeline must contain a <code>&lt;div></code> tag with class <code>card</code>. Item number: <i>[number]</i></td>
    <td>Error thrown when a <code>li</code> item doesn't contain one <code>div</code> with class <code>card</code>. You can see the item number that generates the error.</td>
  </tr>
  <tr>
    <td width="40%">Each card header must be defined by a <code>&lt;div></code> tag with class <code>content</code>. Item number: <i>[number]</i></td>
    <td>Error thrown when the first element on a card is not a <code>div</code> with class <code>content</code>. You can see the item number that generates the error</td>
  </tr>
  <tr>
    <td width="40%">Each card media must be defined by a <code>&lt;div></code> tag with class <code>media</code>. Item number: <i>[number]</i></td>
    <td>Error thrown when the second element on a card is not a <code>div</code> with class <code>media</code>. You can see the item number that generates the error.</td>
  </tr>
  <tr>
    <td width="40%">Each card description container must be defined by a <code>&lt;div></code> tag with class <code>content</code>. Item number: <i>[number]</i></td>
    <td>Error thrown when the third element on a card is not a <code>div</code> with class <code>content</code>. You can see the item number that generates the error.</td>
  </tr>
</table>
