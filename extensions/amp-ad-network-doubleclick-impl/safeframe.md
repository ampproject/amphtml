# Google Ad Manager Fast Fetch SafeFrame API

Google Ad Manager's Fast Fetch implementation supports some aspects of the [GPT SafeFrame API](https://support.google.com/dfp_premium/answer/6023110) for non-AMP creatives that are rendered within a SafeFrame. Please refer to the [IAB specification](https://www.iab.com/wp-content/uploads/2014/08/SafeFrames_v1.1_final.pdf) of SafeFrame and the [GPT implementation details](https://support.google.com/dfp_premium/answer/6023110) for a comprehensive explanation of SafeFrame. This document is primarily aimed to explain the AMP-specific differences.

SafeFrame support (including ext.js library injection) can be forced client-side by setting `data-force-safeframe=true` attribute on amp-ad type=doubleclick elements.

# Supported Methods

The following methods all work for creatives rendered in SafeFrames via Google Ad Manager Fast Fetch, but have AMP-specific key differences that should be noted:

## \$sf.ext.resize({t, b, l, r})

This method is only supported on AMP pages, it is unavailble elsewhere. This method allows the safeframe to resize both bigger **and** smaller. Just like for \$sf.ext.expand(), you pass in the values that you wish to change the size of the safeframe by for t, b, l, and r. To change positively, you pass in positive values which is equivalent to an expansion. To change size to a smaller size, you pass in negative values. You may not mix positive and negative values in one call.

### Valid expansion usage of resize

\$sf.ext.resize({t:10, b: 10, l: 20, r:30})

### Valid shrink usage of resize

\$sf.ext.resize({t:0, b:-10, r:-10, l:0})

### Invalid use of resize

\$sf.ext.resize({t:-10, b:20, l:-10, r:-15})

For best results, only modify sizes for the b and r parameters, i.e. instead of resizing via: resize({t:10, b:10, r:10, l:10}), instead resize as resize({t:0, b:20, r:20, l:0}). See _Important Caveats_ section under **\$sf.ext.expand()** heading below.

## \$sf.ext.geom()

This is a synchronous call for the ad slot's geometry. Geometry is continuously updated in the background to keep the data fresh, with updates being sent from AMP at a maximum of once per second. Returns an object formatted as follows:

```js
{
  win: { // The measurement of the application window.
    t: 0,
    b: 800,
    l: 0,
    r: 400
  },
  self: { // The measurement of the SafeFrame, relative to win
    t: 100,
    b: 150,
    l: 10,
    r: 330,
  },
  exp: { // The amount that a SafeFrame can expand
    t: 0,
    l: 0,
    b: 750,
    r: 80
  },
  pos: { // The position of the safeframe, relative to the viewport
    t: 0,
    l: 0,
    b: 50,
    r: 320,
  },
}
```

Note that t=Top, b=Bottom, r=Right, and l=Left. See more details below in \$sf.ext.expand() section.

**Important note about pos:** \$sf.ext.geom().pos is only available on AMP pages. Do not expect to be able to use that API on other pages. However, you should be able to use win, self, and exp anywhere that safeframe runs, AMP or not.

**Important note about exp:** Expansion in AMP only technically works to the right, and bottom. There is no notion of expanding left or up. However, in the majority of cases, creatives are centered in the AMP page. Thus, expanding 100 to the right ends up being equivalent to expanding 50 to the left and right. In AMP, the exp values represent how much the creative would need to expand to consume the entire viewport. See more details about expand below.

## \$sf.ext.expand({t, b, l, r, push})

This API call requests that the SafeFrame be expanded. The parameter passed in is an object that specifies how much to expand in each direction, and whether to expand by push or by overlay (push=true for expand by push, push=false for expand by overlay). However, within AMP, expanding is only supported to the right and bottom.

**Example:** A creative with height = 50px, width=320px wants to resize to 400x400. The following call should be made:

\$sf.ext.expand({t: 0, l: 0, b: 350, r: 80, push: true});

**Important Caveats:**

-   **A request to expand is not guaranteed to succeed**. You should register a callback with \$sf.ext.register() that will execute on geometry changes, including from the results of expansion and collapse.
-   **AMP does not support expansion left or up.** However, the majority of ad slots are centered in the page, which means an expansion to the right will in effect end up expanding to both the left and right. For instance, expanding by 100px to the right for a centered SafeFrame, would in effect appear as expanding by 50px to both the left and right.
-   **Expand by overlay is only allowed within the confines of amp-ad; expand by push is allowed for any size.** Within the confines of the amp-ad, creatives may expand by overlay or push. Creatives attempting to expand to a size greater than that of the amp-ad may only use push.
-   **Publisher may disallow expand by push or overlay.** The publisher may set an attribute called **data-safeframe-config** on the amp-ad element, using a JSON object like the following: **{"expandByPush": true, "expandByOverlay": false}**

**Expansion Successes and Failures**

AMP has very strict rules in place about when an element can expand. These rules are in place to prevent reflow, which is when an element size changes and causes page content to shift, harming user experience. To prevent reflow for SafeFrame expansion, expand will only succeed in the following scenarios:

1.  **The expansion request is made while the SafeFrame is not in viewport.** If the SafeFrame is not within the user's viewport at the time a valid expansion request is made, the request to expand will succeed. The AMP runtime is able to control scroll position to assure that reflow does not occur as a result of the expansion.
1.  **The expansion request is made for an expanded-size that is less than or equal to the size of the parent amp-ad element.** All SafeFrames within AMP are nested within an amp-ad element. amp-ad elements are already laid-out within the page to a specific size. If a creative calls expand() such that the expanded size of the SafeFrame will still be entirely contained within the amp-ad, then expand will succeed regardless of whether the SafeFrame is within the viewport or not.

    **Example:**

![alt_text](images/sf_example_1.png 'image_tooltip')

3. **Expansion is a result of the user interaction with the amp-ad.** A SafeFrame may resize, even if it's within the viewport, based on interaction from the user. For instance, an ad may expand as a result of a click from the user. In this case, both the amp-ad element, and the SafeFrame will be the same size upon expansion completion. **Example:**

![alt_text](images/sf_example_2.png 'image_tooltip')

## \$sf.ext.collapse

Collapse simply returns the ad slot to its original, unexpanded size. If collapse was not preceded by a successful call to \$sf.ext.expand() (i.e. if frame is not currently expanded), this will do nothing.

### Important Caveats

For AMP's implementation of SafeFrame, a collapse() request impacts two separate elements: the amp-ad element that is the parent of the SafeFrame, and the SafeFrame itself. Collapse will always succeed for the SafeFrame, regardless of where it is in the page. However, the amp-ad may not succeed in collapsing if its resize would cause reflow within the viewport. In other words, the amp-ad will only succeed in collapsing if changing its size will not cause reflow, or if its resize is triggered by a user interaction (like clicking a collapse button).

### Examples

-   Expand is called while out of viewport and succeeds for both the amp-ad and the SafeFrame. The user scrolls the page such that the SafeFrame is in the viewport. The ad calls collapse(). The amp-ad element can not be resized without causing reflow, so only the SafeFrame is resized, as in the image below:

![alt_text](images/sf_example_3.png 'image_tooltip')

-   Expand is called while out of viewport and succeeds for both the amp-ad and the SafeFrame. Collapse is then called either while out of viewport, or during a user-interaction. The amp-ad element and the SafeFrame are both collapsed to **the original size of the SafeFrame. Important to note that even if the amp-ad was originally a different size than the SafeFrame, collapsing the SafeFrame will attempt to collapse the amp-ad to the same size as the SafeFrame. **See picture below:

![alt_text](images/sf_example_4.png 'image_tooltip')

## The following methods are also supported

These methods all work the same as they do on non-AMP pages, so please see [standard SafeFrame documentation](https://www.iab.com/wp-content/uploads/2014/08/SafeFrames_v1.1_final.pdf) for details

-   \$sf.ext.register()
-   \$sf.ext.supports()
-   \$sf.ext.status()
-   \$sf.ext.meta()
-   \$sf.ext.inViewPercentage()

# Unsupported methods

-   \$sf.ext.winHasFocus()
-   \$sf.ext.cookie()
