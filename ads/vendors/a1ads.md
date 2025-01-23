# A1

## Examples
### Single ad
```
<amp-ad
  width="300"
  height="250"
  type="a1ads"
  data-adhost="AD_SRV_HOSTNAME"
  data-sitepage="adsite/page"
  data-pos="Top"
  data-query="keyword=keyvalue&key2=value2"
>
</amp-ad>
```


## Configuration
For details on the configuration semantics, please contact the ad network or refer to their documentation.


### Required parameters
`adhost`: Server Hostname start with protocol.

`sitepage`: Sitepage configured for this ad spot.

`pos`: Position for the this ad spot.


### Optional parameters
`query`: Query parameter to be sent with request. Keywords and keynames, taxonomy etc.
