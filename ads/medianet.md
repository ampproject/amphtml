<!---
Copyright 2016 The AMP HTML Authors. All Rights Reserved.

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

      http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS-IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
-->

# Media.net

Media.net adapter supports the integration of its Header Bidding solution with the publisher website that uses DoubleClick for Publishers (DFP) as the Ad Server. The example listed below states the configuration and the implementation related details.


## Example

### Media.net Header Bidder 

``` html
<amp-ad width="300" height="250"
    type="medianet"
    data-tagtype="headerbidder"
    data-cid="8CU852274"
    data-slot="/45361917/AMP_Header_Bidder"
    json='{"targeting":{"mnetAmpTest":"1","pos":"mnetSlot1"}}'>
</amp-ad>

```

## Configuration

### Dimensions
 
The ad size depends on the ``width`` and ``height`` attributes specified in the ``amp-ad`` tag. The ``amp-ad`` component requires the following mandatory HTML attributes to be added before parsing the Ad.
  
 * ``width`` 
 * ``height`` 
 * ``type = "medianet"``

For further configuration related details, please feel free to reach out to your Media.net contact.

## Supported Parameters 

###Media.net Header Bidder

<strong>Mandatory Parameters</strong>
 
* ``data-tagtype`` - This parameter represents the product the publisher is using; It should be <strong>headerbidder</strong> for our Header Bidding solution.
* ``data-cid`` - Represents the unique customer identifier.
* ``data-slot`` - Ad unit as specified in DFP


<strong>Some of the parameters supported via Json attribute (DFP Parameters)</strong>

* ``targeting``
* ``categoryExclusions``

For an exhaustive list of updated parameters supported by DoubleClick refer to the guide - [here](google/doubleclick.md).


## Support 
For further queries, please feel free to reach out to your contact at Media.net.

Otherwise you can write to our support team:
Email: <strong>pubsupport@media.net</strong>