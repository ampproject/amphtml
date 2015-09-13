### <a name="amp-anim"></a> `amp-anim`

A runtime-managed animated image - most typically a GIF.

#### Behavior

The `amp-anim` component is very similar to the `amp-image` element, and provides additional functionality to manage loading and playing of animated images such as GIFs.

The `amp-anim` component can also have an optional placeholder child, to display while the `src` file is loading. The placeholder is specified via the `placeholder` attribute:

    <amp-anim width=400 height=300 src=”my-gif.gif”>
      <amp-img placeholder width=400 height=300 src=”my-gif-screencap.jpg”>
      </amp-img>
    </amp-anim>

#### Attributes

**src**

Similar to the `src` attribute on the `img` tag. The value must be a URL that
points to a publicly-cacheable image file. Cache providers may rewrite these
URLs when ingesting AMP files to point to a cached version of the image.

**srcset**

Same as `srcset` attribute on the `img` tag.

**alt**

A string of alternate text, similar to the `alt` attribute on `img`.

**attribution**

A string that indicates the attribution of the image. E.g. `attribution=“CC courtesy of Cats on Flicker”`


#### Styling

`amp-img` can be styled directly via CSS properties. Setting a grey background
placeholder for example could be achieved via:

    amp-anim {
      background-color: grey;
    }
