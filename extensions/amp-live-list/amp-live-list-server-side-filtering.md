# Server side filtering for `amp-live-list`

## Overview
The `amp-live-list` component is allowed to make requests to its server (depending on where the file is hosted from, the server could be the Google AMP Cache, another AMP cache, or the publisher’s server) for the the latest AMP document and update the current DOM with information from the received AMP document. It can work with a full AMP document as the response, but to reduce the payload and save on bandwidth and CPU cycles `amp-live-list` has defined the minimum HTML structure, the tags and its attributes needed by the component to correctly make an update to the live DOM. This spec depends on the [`amp-live-list` spec](https://github.com/ampproject/amphtml/blob/master/extensions/amp-live-list/amp-live-list.md) and defines its [Server side filtering](https://github.com/ampproject/amphtml/blob/master/extensions/amp-live-list/amp-live-list.md#server-side-filtering) section.

## Design
To reduce the payload size and reduce expensive HTML parsing, the server can filter out the document and only return a document with the very minimum markup for a valid HTML document (like `html`, `body`, `doctype`) and the actual `amp-live-list` element(s). The server can further filter out the `amp-live-list` subtree by filtering out all direct children elements except the `items` and `pagination` reference points. The server can filter the `items` reference point using the `amp_latest_update_time` URL parameter from the request.

## Detailed Design
Below is a recap of attributes on the `amp-live-list` and the `items` children elements. These attributes are important as they are what we use primarily to make decisions.

### Required and Optional attributes on `amp-live-list`:
**id** (Required)

To uniquely identify an `amp-live-list` (since multiple `amp-live-list`s are allowed on a document)

**data-poll-interval** (Optional)

Time behind checks for new content.

**data-max-items-per-page** (Required)

Maximum number of child entries.

**disabled** (Optional)

No polling will occur.


### Required and Optional attributes on `items` children elements:
**id (Required)**

`Id` of the entry must never change.

**data-update-time** (Optional)

Timestamp when the entry was last updated.

**data-sort-time** (Required)

Timestamp used for sorting entries.

**data-tombstone** (Optional)

If present the entry is assumed to be deleted.


### `amp-live-list`
An AMP document can have multiple `amp-live-list` elements anywhere on the page. The server and client can uniquely identify the `amp-live-list` through the element’s `id`, so there is no ambiguity when filtering and updating. If a new `amp-live-list` element with an `id` the client has not seen before (wasn’t in initial page load) is in the response, the client will throw a user error.

The `amp-live-list` element can have children elements be marked as “container” like elements which we call a reference point. There are reference points that the server should pay attention to; `items` and the `pagination`. Any other `amp-live-list` children should be filtered out right away; even other reference points. We have for example a reference point called  `update` which contains the UI the user interacts with to trigger an update on the page. `update` should never get updated and can be filtered right away. 

### Filtering
On the URL for the request, the client appends the `amp_latest_update_time` URL parameter. It uses the highest `data-update-time` (if it exists) from the `amp-live-list` `items` children, otherwise it will use the highest `data-sort-time` it can find from `items` children.

If the markup below (Example 1) was the live document on the client, the next poll GET request would be `www.example.com/some/page?amp_latest_update_time=1462955848172` and would remain to be so until we insert a new `items` child with a higher `data-update-time` value.

Example 1
```html
<amp-live-list id="live-list-1" data-max-items-per-page="10">
  <div update>you have new updates, click me!</div>
  <div items>
    <amp-img id="item-2"
         data-update-time="1462955848172"
         data-sort-time="1462955848172"></amp-img>
    <div id="item-1"
         data-update-time="1462955848171"
         data-sort-time="1462955848171"></div>
  </div>
</amp-live-list>
```

The server can then use this URL parameter value (if present) to filter the `items` children by looking at the child’s `data-update-time` attribute and removing anything lower than the `amp_latest_update_time` value. 

If there are 2 `amp-live-list` elements on a response—let’s call them `#list-1` and `#list-2`—and after filtering only `#list-2` has items left we can completely remove the `#list-1` from the response.

If after filtering no items are left on any `amp-live-list` elements the server can respond with an empty document with no `amp-live-list` elements in the markup.

#### `items` filtering
Given Example 2 as our current live DOM on the client, we make a GET request to the server with the URL `www.example.com/some/page?amp_latest_update_time=1462955848172`.

Example 2
```html
<amp-live-list id="live-list-1" data-max-items-per-page="10">
  <div update>you have new updates, click me!</div>
  <div items>
    <amp-img id="item-2"
         data-update-time="1462955848172"
         data-sort-time="1462955848172"></amp-img>
    <div id="item-1"
         data-update-time="1462955848171"
         data-sort-time="1462955848171"></div>
  </div>
</amp-live-list>
```

Example 3 is the latest document fetched from the publisher, and using `amp_latest_update_time=1462955848172` allows us to filter the `items` reference point,  which only leaves us with the the element with `id=item-3` (the `amp-twitter` element).

Example 3
```html
<amp-live-list id="live-list-1" data-max-items-per-page="10">
  <!-- I am an update reference point and I will be filtered out -->
  <div update>you have new updates, click me!</div>
  <div items>
    <amp-twitter id="item-3"
         data-update-time="1462955848173"
         data-sort-time="1462955848173"></amp-twitter>
    <amp-img id="item-2"
         data-update-time="1462955848172"
         data-sort-time="1462955848172"></amp-img>
    <div id="item-1"
         data-update-time="1462955848171"
         data-sort-time="1462955848171"></div>
  </div>
</amp-live-list>
```

The response to the client would look like Example 4. As you can see the `update` reference point is completely removed and `#item-1` and `#item-2` are removed.

Example 4
```html
<amp-live-list id="live-list-1" data-max-items-per-page="10">
  <div items>
    <amp-twitter id="item-3"
         data-update-time="1462955848173"
         data-sort-time="1462955848173"></amp-twitter>
  </div>
</amp-live-list>
```

#### `pagination` reference point
The `pagination` reference point needs to be on the response but may be removed if, after the filter operation on the `items` reference point, no items are left on the `amp-live-list`. If there are no items left on `items` after filtering, that means there is no change to the count of items and there would be no change to the pagination count as well. In this case, the server can just send an empty document.

Example 5
```html
<amp-live-list id="live-list-1" data-max-items-per-page="10">
  <div update>you have new updates, click me!</div>
  <div items>
    <amp-img id="item-2"
         data-update-time="1462955848172"
         data-sort-time="1462955848172"></amp-twitter>
    <div id="item-1"
         data-update-time="1462955848171"
         data-sort-time="1462955848171"></div>
  </div>
  <div pagination>
    <ul>
      <li><a href="">1</a></li>
      <li><a href="">2</a></li>
    </ul>
  </div> 
</amp-live-list>
```


#### `disabled` attribute 
When the `disabled` attribute is on any `amp-live-list`, an empty `amp-live-list` element can be on the response (see Example 6). We still need to receive this information for the client to actually know that the `amp-live-list` was “disabled” so it can stop polling and stop doing any work. There is currently no way to “reactivate” the polling unless the user does a page refresh and the new document does not have a `disabled` property on any of the `amp-live-list` elements.

Example 6
```html
<amp-live-list id="live-list-1" disabled data-max-items-per-page="10">
</amp-live-list>
```
