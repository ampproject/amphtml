<!--
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

# <a name="amp-live-list"></a> `amp-live-list`

<table>
  <tr>
    <td width="40%"><strong>Description</strong></td>
    <td>A wrapper and minimal UI for content that updates live in the client instance as new content is available in the source document.</td>
  </tr>
  <tr>
    <td width="40%"><strong>Required Script</strong></td>
    <td>
      <div>
        <code>&lt;script async custom-element="amp-live-list" src="https://cdn.ampproject.org/v0/amp-live-list-0.1.js">&lt;/script></code>
      </div>
    </td>
  </tr>
  <tr>
    <td class="col-fourty"><strong><a href="https://www.ampproject.org/docs/guides/responsive/control_layout.html">Supported Layouts</a></strong></td>
    <td>container, fixed-height</td>
  </tr>
  <tr>
    <td width="40%"><strong>Examples</strong></td>
    <td><ul>
    <li><a href="https://ampbyexample.com/components/amp-live-list/">Annotated code example for amp-live-list</a></li>
    <li><a href="https://ampbyexample.com/samples_templates/live_blog/">Annotated code example with amp-live-list for a live blog</a></li>
    </ul>
    </td>
  </tr>
</table>

## Behavior

`amp-live-list` provides support for content that is updated live on the client,
so that the user can consume new information as it is available without having
to refresh or navigate to a different page. The core use case for this component
is live blogs: coverage for breaking news or live events where the user can stay
on or keep returning to the same page to see new updates as they come in. Common
examples are award shows, sporting events, and elections.

To learn how to use `amp-live-list` in a blog, see the [Create a Live Blog](https://www.ampproject.org/docs/get_started/live_blog) tutorial.

## How it works

In the background, while an AMP page using `<amp-live-list>` is displayed on the client, the AMP runtime polls the origin document on the host for updates. When the client receives a response, it then [filters](#server-side-filtering) and dynamically inserts those updates back into the page on the client. Publishers can customize the polling rate in order to control the number of incoming requests, and AMP caches like the Google AMP Cache can perform optimizations to reduce the server response payload, saving client bandwidth and CPU cycles.

The `amp-live-list` component has 3 sections. We'll refer to these sections as
"reference points" and they are denoted by an attribute. These reference points must be a direct child of the `amp-live-list` component. The 3 reference points are:

* `update`  (mandatory)
* `items`  (mandatory)
* `pagination` (optional)

For more details, see the ["Reference Points"](#reference-points) section below.

Example:

```html
<amp-live-list id="my-live-list" data-poll-interval="15000" data-max-items-per-page="20">
  <button update on="tap:my-live-list.update">You have updates!</button>
  <div items></div>
  <!-- pagination is optional -->
  <div pagination></div>
</amp-live-list>
```

## Polling

In most implementations for live blogs, content is either pushed by the server
to the client instance of a page, or the client polls a JSON endpoint to receive
updates. The implementation for this component is different, in that the client
instance of the page polls the server copy of the document for updates to the
`items` reference point. For instance: if the user is viewing a document served from an AMP cache, the client will poll that document hosted on that AMP cache for updates; if the user is viewing a document served from a web publisher's origin domain (e.g. "example.com"), then the client will poll the document hosted on that origin domain for updates.

This means that publishers of content do not need to set up a JSON endpoint or
push mechanism for this component to work. New content just needs to be
published to the same URL, with a valid `amp-live-list` markup, and the user
will have that content pulled into their client instance during the next poll
(poll intervals are configurable in the component, and are valid above the
minimum of 15 seconds).

When multiple `amp-live-list` components are on a page, we choose the smallest
polling interval across the `amp-live-list` components and use that as the
polling interval.

## Reference Points

### update

The `update` reference point is shown when new items are received from
the server, to provide an affordance for users to refresh the page with new items when they are available. It is hidden by default (through an `.amp-hidden`
class whose style can be overriden). You may style this reference point as a `fixed` position
item if you want a floating button on the page like on social media websites, to
draw the reader's attention to take action. Currently the `update` reference
point is not shown for either updates (using `data-update-time`) or tombstone
(using `data-tombstone`) operations without an insert (newly discovered id's)
operation.

{% call callout('Note', type='note') %}
When using `position: fixed` we highly recommend that you use an id selector or a css selector with no other css combinators, because complex combinators cannot be moved into the fixed layer (fixed layer is an iOS workaround
for webkit's fixed position [bug](https://bugs.webkit.org/show_bug.cgi?id=154399).
{% endcall %}

The actual action handler may be at a descendant and does not have to be at the
`update` reference point. the `amp-live-list` component then has an internal
`update` method than can receive the action. See the
`on="tap:my-live-list.update"` handler.

Example:

```html
<amp-live-list id="my-live-list" data-poll-interval="15000" data-max-items-per-page="20">
  <div update class="outer-container">
    <div class="inner-container">
      <button class="btn" on="tap:my-live-list.update">Click me!</button>
    </div>
  </div>
  <div items></div>
</amp-live-list>
```

### items

The `items` reference point is where new items are inserted, replaced or removed.
children of the `items` reference point are required to have an `id` and a
`data-sort-time` attribute.

### pagination

The `pagination` reference point is where any sort of pagination markup is located.
We recommend having a small subtree underneath this reference point as the
`amp-live-list` component will be doing an inline replace of the DOM received from
the server in case the page count had increased. We don't do any special
diffing and just outright replace the contents.

## Update Behavior and User Experience

When updates are discovered by the client from polling the server document, any
newly discovered `id`'s from children of the `items` reference point will turn
the `update` reference point visible. A user action is required for these items
to be inserted into the client's live DOM. We scroll the top of the
`amp-live-list` component into view when the reader clicks on the update action.

If a `data-update-time` attribute is present and its value is a number higher
than the original `data-sort-time` on the attribute, the item will be updated in
place through a `replaceChild` operation. If a `data-tombstone` attribute is
present the element's subtree will be emptied out and the item is hidden through
css (see [amp-live-list.css](https://github.com/ampproject/amphtml/blob/master/extensions/amp-live-list/0.1/amp-live-list.css)).

If a replace or tombstone operation is found but no insert (no new items) is
found on a poll request, the replace and the tombstone operation will occur
without the need for a reader's action. The component and the AMP runtime
will try and maintain the viewport's scroll position but since a replace could
have components in its subtree that cause a resize (amp-twitter, amp-iframe,
etc.) after the fact, we discourage having a lot of replace operations through
the `data-update-time` attribute.

## How Pagination works

As AMP's focus is on performance we recommend the publisher keep a low number of
items on a single page by limiting the number of children the `items` reference
point has, as well as setting a good `data-max-items-per-page` value. Neither the client
nor any cache that may be used knows anything about the full number of items. so
it is up to the publisher to update the `pagination` reference point correctly
based on the number of valid items. Items which have the `data-tombstone`
attribute for example should not be counted, as they are hidden.

Once the number of valid live items is over the `data-max-items-per-page`
value, the component will try and remove items that are below the viewport
until the number the live items is equal or below the `data-max-items-per-page`
value. The number of items may possibly be over the `data-max-items-per-page`
value if the item for deletion is not below the viewport.

When a reader is not on page 1 of the document, the `disabled` attribute
should be applied to all `amp-live-list` components since the component
will still try to insert new items if it identifies any and has no notion
that is not on the first page.

## Server Side filtering

See the documentation for [Server side filtering](../amp-live-list/amp-live-list-server-side-filtering.md).

## Attributes

Usually attribute requirements are only enforced on the actual component but
because we need to anchor and make decisions on the client, we will also need
to require an `items` and `update` attribute on a direct child of
`amp-live-list`.  Children of the `items` reference point will also have
attribute requirements.

### Attributes on `amp-live-list`

**id** (Required)

To uniquely identify an amp-live-list (since multiple are allowed on a single
page).

**data-poll-interval** (Optional)

Time (in milliseconds) interval between checks for new content (15000 ms minimum is
enforced). If no `data-poll-interval` is provided it will default to the 15000 ms
minimum.

**data-max-items-per-page** (Required)

Maximum number of child entries. Additional elements are assumed to be on the
next "page". If the number of children items is greater than the number
provided on the attribute, the number of children items will be the new
`data-max-items-per-page`.
Once the number of live items on an `amp-live-list` is over the
`data-max-items-per-page` limit items below the viewport will be fully
removed from the live DOM.

**disabled** (Optional)

No polling will occur. Recommended when not on page 1 (looking at archival data)
and when the article is no longer fresh and should no longer be updated.

### Attributes on `items` reference point children

**id** (Required)

Id of the `items` child must never change.

**data-sort-time** (Required)

Timestamp used for sorting entries. Higher timestamps will be
inserted before older entries. We recommend using Unix time (the number of
seconds that have elapsed since Thursday, 1 January 1970).

**data-update-time** (Optional)

Timestamp when the entry was last updated.  Use this attribute to trigger an
update on an existing item: the client will replace all existing content in
this item with the new, updated content, without triggering the appearance of
the update reference point. We recommend using Unix time (the number of seconds
that have elapsed since Thursday, 1 January 1970).

**data-tombstone** (Optional)

If present the entry is assumed to be deleted.

## Styling

On very slow connections the javascript and styles of the component
might arrive later than when the body is unhidden (the amp-boilerplate
style timesout) so we highly recommend adding the following styles below
in your own `amp-custom` styles.

```css
amp-live-list > [update] {
  display: none;
}
```

When we apply the `amp-active` class to the update reference point it will set
`display: block`.

An `amp-live-list-item` class is added to all the children of the `items`
reference point.

All newly inserted items will also have the `amp-live-list-item-new` class
added, and will be removed once the next set of new items are inserted on a subsequent update. You can add a
highlighting effect like the css below.

```css
.live-list-item-new {
  animation: amp-live-list-item-highlight 2s;
}

@keyframes amp-live-list-item-highlight {
  0% {
    box-shadow: 0 0 5px 2px rgba(81, 203, 238, 1);
  }
  100% {
    box-shadow: 0;
  }
}
```

There is css that hides children of the `items` reference point that have the
`data-tombstone` attribute which can be overriden by doing:

```css
amp-live-list > [items] > [data-tombstone] {
  display: block;
}
```

An `.amp-hidden` and `.amp-active` class is added to the `update`
reference point, and you can hook into this class to add transitions.
(see Examples below)

## Actions
The `amp-live-list` exposes the following actions you can use [AMP on-syntax to trigger](https://github.com/ampproject/amphtml/blob/master/spec/amp-actions-and-events.md):

<table>
  <tr>
    <th>Action</th>
    <th>Description</th>
  </tr>
  <tr>
    <td>update (default)</td>
    <td>Updates DOM elements with new discovered updates</td>
  </tr>
</table>

## Examples

Below we have an example of multiple `amp-live-list` on a single page.
Notice that only the first`amp-live-list` has a fixed position button,
while the second one is inside the component with a sliding animation.

The polling interval will also be 16000 and not 20000 milliseconds, as we choose
the lowest one.

```html

<style amp-custom>
  amp-live-list > [update] {
    display: none;
  }

  #fixed-button {
    position: fixed;
    top: 10px;
    left: 50%;
    transform: translateX(-50%)
  }

  .slide.amp-active {
    overflow-y: hidden;
    height: 100px;
    max-height: 150px;
    transition-property: height;
    transition-duration: .2s;
    transition-timing-function: ease-in;
    background: #3f51b5;
  }

  .slide.amp-hidden {
    max-height: 0;
  }

  // We need to override "display: none" to be able to see
  // the transition effect on the 2nd live list.
  #live-list-2 > .amp-hidden[update] {
    display: block;
  }
</style>

<amp-live-list id="live-list-1" data-poll-interval="16000" data-max-items-per-page="5">
  <button update id="fixed-button" class="button" on="tap:live-list-1.update">
    new updates on live list 1
  </button>
  <div items>
    <div id="live-list-1-item-2" data-sort-time="1462814963592">
      <div class="card">
        <div class="logo">
          <amp-img src="/examples/img/ampicon.png"
              layout="fixed" height="50" width="50">
          </amp-img>
        </div>
      </div>
    </div>
    <div id="live-list-1-item-1" data-sort-time="1462814955597">
      <div class="card">
        <div class="logo">
          <amp-img src="/examples/img/ampicon.png"
              layout="fixed" height="50" width="50">
          </amp-img>
        </div>
      </div>
    </div>
  </div>
</amp-live-list>

<amp-live-list id="live-list-2" data-poll-interval="20000" data-max-items-per-page="10">
  <div update class="slide" on="tap:live-list-2.update">
    new updates on live list 2
  </div>
  <div items>
    <div id="live-list-2-item-2" data-sort-time="1464281932879">world</div>
    <div id="live-list-2-item-1" data-sort-time="1464281932878">hello</div>
  </div>
</amp-live-list>
```

## Validation
See [amp-live-list rules](https://github.com/ampproject/amphtml/blob/master/extensions/amp-live-list/0.1/validator-amp-live-list.protoascii) in the AMP validator specification.
