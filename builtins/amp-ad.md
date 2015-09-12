### <a name=”amp-ad”></a> `amp-ad`

NOTE: The specification of `amp-ad` is likely to significantly evolve over time. The current approach is designed to bootstrap the format to be able to show ads.

A container to display an ad.

Ads are loaded like all other resources in AMP documents, with a special
custom element called `<amp-ad>`. No ad network provided JavaScript is allowed to run inside the AMP document. Instead the AMP runtime loads an iframe from a
different origin (via iframe sandbox) as the AMP document and executes the ad
network’s JS inside that iframe sandbox.

AMP documents only support ads served via HTTPS.

#### Behavior

The `<amp-ad>` requires width and height values to be specified like all
resources in AMP. It requires a `type` argument that select what ad network is displayed. All `data-*` attributes on the tag are automatically passed as arguments to the code that eventually renders the ad. What `data-` attributes are required for a given type of network depends and must be documented with the ad network.

    <amp-ad width=300 height=250
        type="a9"
        data-aax_size="300x250"
        data-aax_pubname="test123"
        data-aax_src="302">
    </amp-ad>

#### Attributes

**type**

Identifier for the ad network. This selects the template that is used for the ad tag.

**src**

Optional src value for a script tag loaded for this ad network. This can be used with ad network that require exactly a single script tag to be inserted in the page. The src value must have a prefix that is whitelisted for this ad network.
