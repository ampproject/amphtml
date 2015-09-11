### <a name=”amp-pixel”></a> `amp-pixel`

The `amp-pixel` element is meant to be used as a typical tracking pixel - to count page views.

#### Behavior

The `amp-pixel` component behaves like a simple tracking pixel `img`. It takes a single URL, but provides variables that can be replaced by the component in the URL string when making the request. See the `src` and `src-format` attributes for more information.

#### Attributes

**src**

A simple URL to send a GET request to when the tracking pixel is loaded.

Use the special string `$RANDOM` to add a random number to the URL if required.

For instance:

    <amp-pixel src=”https://9nl.it/sz1u?$RANDOM”>

may make a request to something like `https://9nl.it/sz1u?8390278471201` where the $RANDOM value is randomly generated upon each impression.

#### Styling

`amp-pixel` should not be styled.
