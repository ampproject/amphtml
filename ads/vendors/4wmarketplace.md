# 4wMarketplace

4wMarketplace support for AMP covers Passback technologies.

For configuration details and to generate your tags, please refer to [your publisher account](https://publisher.4wmarketplace.com)

## Example - Passback

html
<amp-ad
width="320"
height="50"
type="4wmarketplace"
data-id="76473;98469;199717;0"
data-dim="{'width':'320px', 'height':'50px'}"

> </amp-ad>

## Configuration

The ad size is based on the setup of your 4wMarketplace space. The `width` and `height` attributes of the `amp-ad` tag should match that.

### Passback

Supported parameters:

-   `data-dim`: identifies the tag dimensions. Required.
-   `data-id`: your 4wMarketplace space identifier. Required.
