### <a name=”amp-lightbox”></a> `amp-lightbox`

The `amp-lightbox` component allows for a “lightbox” or similar experience - where upon user interaction a component expands to fill the viewport, until it is closed again by the user.

#### Behavior

The `amp-lightbox` component defines the child elements that will be displayed in a full-viewport overlay. It is triggered to take up the viewport when the user taps or clicks on an element with `on` attribute that targets `amp-lightbox` element’s `id`.

One or more elements within the lightbox can be optionally given a `close` attribute, which when tapped or clicked will close the lightbox. If no element is given a `close` attribute, a tap or click anywhere on the screen will close it.

For example:

    <button on=”tap:my-lightbox”>Open lightbox</button>

    <amp-lightbox id=”my-lightbox” layout=”nodisplay”>
      <div class=”lightbox”>
        <amp-img src=”my-full-image.jpg” width=300 height=800>
        <div close>Close</div>
      </div>
    </amp-lightbox>

#### Styling

The `amp-lightbox` component can be styled with standard CSS.
