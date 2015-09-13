### <a name=”amp-carousel”></a> `amp-carousel`

A generic carousel for displaying multiple similar pieces of content along a horizontal axis. It is meant to be highly flexible and performant.

#### Behavior

Each of the `amp-carousel` component’s immediate children is considered an item in the carousel. Each of these nodes may also have arbitrary HTML children.

The carousel consists of an arbitrary number of items, as well as optional navigational arrows to go forward or backwards a single item, and optional navigational “dots” which indicate where the currently viewed item is in the list of items.

The carousel advances between items if the user swipes, uses arrow keys, clicks an optional navigation arrow, or clicks an option “dot.”

    <amp-carousel width=300 height=400>
      <amp-img src=”my-img1.png” width=300 height=400></amp-img>
      <amp-img src=”my-img2.png” width=300 height=400></amp-img>
      <amp-img src=”my-img3.png” width=300 height=400></amp-img>
    </amp-carousel>

Note, that while the example shows a carousel of images `amp-carousel` support arbitrary children.

#### Attributes

**loop**

If present, the user may advance past the final item, which is followed by the first item again in the carousel.

**dots**

If present, the carousel includes navigational dots that indicate where the user is in the carousel.

**arrows**

If present, displays left and right arrows for the user to use in navigation on mobile. Visibility of arrows can also be controlled via styling, and a media query can be used to only display arrows at certain screen widths. On desktop, arrows will always be displayed.


#### Styling

TBD
