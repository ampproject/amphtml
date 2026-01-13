# A1

## Examples
### Single ad
```
<amp-ad
  width="300"
  height="250"
  type="a1ads"
  data-adhost="AD_SRV_HOSTNAME"
  data-a1path="/path-to-server"
  data-adtag="adstream_sx.ads"
  data-sitepage="adsite/page"
  data-pos="Top"
  data-query="keyword=keyvalue&key2=value2"
>
</amp-ad>
```


## Configuration

### Required parameters
`adhost`: Server Hostname start with protocol.

`a1path`: Path of adtag

`adtag`: ads tag name

`sitepage`: Sitepage configured for this ad spot.

`pos`: Position for the this ad spot.


### Optional parameters
`query`: Query parameter to be sent with request. Keywords and keynames, taxonomy etc.
