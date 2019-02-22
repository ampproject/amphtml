/**
 * Copyright 2017 The AMP HTML Authors. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS-IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import {getMode} from '../../../src/mode';

//////////////////////////////////////////////////////////////////
//                                                              //
//     IMPORTANT: All keys in RTC_VENDORS must be lowercase     //
//       otherwise the vendor endpoint will not be used.        //
//                                                              //
//////////////////////////////////////////////////////////////////

// Note: disableKeyAppend is an option specifically for DoubleClick's
// implementation of RTC. It prevents the vendor ID from being
// appended onto each key of the RTC response, for each vendor.
// This appending is done to prevent a collision case during merge
// that would cause one RTC response to overwrite another if they
// share key names.
/** @typedef {{
    url: string,
    macros: Array<string>,
    errorReportingUrl: (string|undefined),
    disableKeyAppend: boolean}} */
let RtcVendorDef;

/** @const {!Object<string, RtcVendorDef>} */
export const RTC_VENDORS = {
////////////////////////////////////////////////////////////////////
//                                                                //
//              !!!      IMPORTANT NOTE     !!!                   //
//                                                                //
//  If you are adding a new vendor config object to this object,  //
//  make sure to also update the RTC documentation in these two   //
//  files under "supported vendors".                              //
// https://github.com/ampproject/amphtml/blob/master/extensions/amp-a4a/rtc-documentation.md
// https://github.com/ampproject/amphtml/blob/master/extensions/amp-a4a/rtc-publisher-implementation-guide.md
////////////////////////////////////////////////////////////////////

  // Add vendors here
  medianet: {
    url: 'https://amprtc.media.net/rtb/getrtc?cid=CID&w=ATTR(width)&h=ATTR(height)&ow=ATTR(data-override-width)&oh=ATTR(data-override-height)&ms=ATTR(data-multi-size)&slot=ATTR(data-slot)&tgt=TGT&curl=CANONICAL_URL&to=TIMEOUT&purl=HREF',
    macros: ['CID'],
    errorReportingUrl: 'https://qsearch-a.akamaihd.net/log?logid=kfk&evtid=projectevents&project=amprtc_error&error=ERROR_TYPE&rd=HREF',
    disableKeyAppend: true,
  },
  prebidappnexus: {
    url: 'https://prebid.adnxs.com/pbs/v1/openrtb2/amp?tag_id=PLACEMENT_ID&w=ATTR(width)&h=ATTR(height)&ow=ATTR(data-override-width)&oh=ATTR(data-override-height)&ms=ATTR(data-multi-size)&slot=ATTR(data-slot)&targeting=TGT&curl=CANONICAL_URL&timeout=TIMEOUT&adcid=ADCID&purl=HREF',
    macros: ['PLACEMENT_ID'],
    disableKeyAppend: true,
  },
  prebidrubicon: {
    url: 'https://prebid-server.rubiconproject.com/openrtb2/amp?tag_id=REQUEST_ID&w=ATTR(width)&h=ATTR(height)&ow=ATTR(data-override-width)&oh=ATTR(data-override-height)&ms=ATTR(data-multi-size)&slot=ATTR(data-slot)&targeting=TGT&curl=CANONICAL_URL&timeout=TIMEOUT&adc=ADCID&purl=HREF',
    macros: ['REQUEST_ID'],
    disableKeyAppend: true,
  },
  indexexchange: {
    url: 'https://amp.casalemedia.com/amprtc?v=1&w=ATTR(width)&h=ATTR(height)&ow=ATTR(data-override-width)&oh=ATTR(data-override-height)&ms=ATTR(data-multi-size)&s=SITE_ID&p=CANONICAL_URL',
    macros: ['SITE_ID'],
    disableKeyAppend: true,
  },
  lotame: {
    url: 'https://ad.crwdcntrl.net/5/pe=y/c=CLIENT_ID/an=AD_NETWORK',
    macros: ['CLIENT_ID', 'AD_NETWORK'],
    disableKeyAppend: true,
  },
  yieldbot: {
    url: 'https://i.yldbt.com/m/YB_PSN/v1/amp/init?curl=CANONICAL_URL&sn=YB_SLOT&w=ATTR(width)&h=ATTR(height)&ow=ATTR(data-override-width)&oh=ATTR(data-override-height)&ms=ATTR(data-multi-size)&aup=ATTR(data-slot)&pvi=PAGEVIEWID&tgt=TGT&adcid=ADCID&href=HREF',
    macros: ['YB_PSN', 'YB_SLOT'],
    disableKeyAppend: true,
  },
  salesforcedmp: {
    url: 'https://cdn.krxd.net/userdata/v2/amp/ORGANIZATION_ID?segments_key=SEGMENTS_KEY&kuid_key=USER_KEY',
    macros: ['ORGANIZATION_ID', 'SEGMENTS_KEY', 'USER_KEY'],
    disableKeyAppend: true,
  },
  purch: {
    url: 'https://ads.servebom.com/tmntag.js?v=1.2&fmt=amp&o={%22p%22%3APLACEMENT_ID}&div_id=DIV_ID',
    macros: ['PLACEMENT_ID', 'DIV_ID'],
    disableKeyAppend: true,
  },
  aps: {
    url: 'https://aax.amazon-adsystem.com/e/dtb/bid?src=PUB_ID&pubid=PUB_UUID&amp=1&u=CANONICAL_URL&slots=%5B%7B%22sd%22%3A%22ATTR(data-slot)%22%2C%22s%22%3A%5B%22ATTR(width)xATTR(height)%22%5D%2C%22ms%22%3A%22ATTR(data-multi-size)%22%7D%5D&pj=PARAMS',
    macros: ['PUB_ID', 'PARAMS', 'PUB_UUID'],
    disableKeyAppend: true,
  },
  openwrap: {
    // PubMatic OpenWrap
    url: 'https://ow.pubmatic.com/amp?v=1&w=ATTR(width)&h=ATTR(height)&ms=ATTR(data-multi-size)&auId=ATTR(data-slot)&purl=HREF&pubId=PUB_ID&profId=PROFILE_ID',
    macros: ['PUB_ID', 'PROFILE_ID'],
    errorReportingUrl: 'https://ow.pubmatic.com/amp_error?e=ERROR_TYPE&h=HREF',
    disableKeyAppend: true,
  },
  criteo: {
    url: 'https://bidder.criteo.com/amp/rtc?zid=ZONE_ID&nid=NETWORK_ID&psubid=PUBLISHER_SUB_ID&lir=LINE_ITEM_RANGES&w=ATTR(width)&h=ATTR(height)&ow=ATTR(data-override-width)&oh=ATTR(data-override-height)&ms=ATTR(data-multi-size)&slot=ATTR(data-slot)&timeout=TIMEOUT&curl=CANONICAL_URL&href=HREF',
    macros: ['ZONE_ID', 'NETWORK_ID', 'PUBLISHER_SUB_ID', 'LINE_ITEM_RANGES'],
    disableKeyAppend: true,
  },
  navegg: {
    url: 'https://amp.navdmp.com/usr?acc=NVG_ACC&wst=0&v=10',
    macros: ['NVG_ACC'],
  },
  sonobi: {
    url: 'https://apex.go.sonobi.com/trinity.json?key_maker=%7B%22_DIVIDER_ATTR(data-slot)%7C1%22%3A%22PLACEMENT_ID_DIVIDER_ATTR(width)xATTR(height)%2CATTR(data-multi-size)%22%7D&ref=CANONICAL_URL&lib_name=amp&lib_v=0.1&pv=PAGEVIEWID&amp=1',
    disableKeyAppend: true,
    macros: ['PLACEMENT_ID', '_DIVIDER_'],
  },
};

// DO NOT MODIFY: Setup for tests
if (getMode().localDev || getMode().test) {
  RTC_VENDORS['fakevendor'] = /** @type {RtcVendorDef} */({
    url: 'https://localhost:8000/examples/rtcE1.json?slot_id=SLOT_ID&page_id=PAGE_ID&foo_id=FOO_ID',
    macros: ['SLOT_ID', 'PAGE_ID', 'FOO_ID'],
  });
  RTC_VENDORS['fakevendor2'] = /** @type {RtcVendorDef} */({
    url: 'https://localhost:8000/examples/rtcE1.json?slot_id=SLOT_ID&page_id=PAGE_ID&foo_id=FOO_ID',
    errorReportingUrl: 'https://localhost:8000/examples/ERROR_TYPE',
    disableKeyAppend: true,
  });
}
