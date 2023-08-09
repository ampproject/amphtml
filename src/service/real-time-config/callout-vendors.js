import {jsonConfiguration} from '#core/types/object/json';

import {getMode} from '../../mode';

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

/** @const {!{[key: string]: RtcVendorDef}} */
const RTC_VENDORS = jsonConfiguration({
  ////////////////////////////////////////////////////////////////////
  //                                                                //
  //              !!!      IMPORTANT NOTE     !!!                   //
  //                                                                //
  //  If you are adding a new vendor config object to this object,  //
  //  make sure to also update the RTC documentation in these two   //
  //  files under "supported vendors".                              //
  // https://github.com/ampproject/amphtml/blob/main/extensions/amp-a4a/rtc-documentation.md
  // https://github.com/ampproject/amphtml/blob/main/extensions/amp-a4a/rtc-publisher-implementation-guide.md
  ////////////////////////////////////////////////////////////////////

  // Add vendors here
  admax: {
    url: 'https://prebid.admaxmedia.io/openrtb2/amp?tag_id=PLACEMENT_ID&w=ATTR(width)&h=ATTR(height)&ow=ATTR(data-override-width)&oh=ATTR(data-override-height)&ms=ATTR(data-multi-size)&slot=ATTR(data-slot)&targeting=TGT&curl=CANONICAL_URL&timeout=TIMEOUT&adcid=ADCID&purl=HREF&gdpr_consent=CONSENT_STRING&account=ACCOUNT_ID',
    macros: ['PLACEMENT_ID', 'CONSENT_STRING', 'ACCOUNT_ID'],
    disableKeyAppend: true,
  },
  adpushup: {
    url: 'https://amp.adpushup.com/prebidserver/openrtb2/amp?tag_id=TAG_ID&w=ATTR(width)&h=ATTR(height)&ow=ATTR(data-override-width)&oh=ATTR(data-override-height)&ms=ATTR(data-multi-size)&slot=ATTR(data-slot)&curl=CANONICAL_URL&gdpr_consent=CONSENT_STRING&adc=ADCID&purl=HREF',
    macros: ['TAG_ID', 'CONSENT_STRING'],
    disableKeyAppend: true,
  },
  andbeyond: {
    url: 'https://prebid.andbeyond.media/amp.php?tag_id=TAG_ID',
    macros: ['TAG_ID'],
    disableKeyAppend: true,
  },
  aps: {
    url: 'https://aax.amazon-adsystem.com/e/dtb/bid?src=PUB_ID&pubid=PUB_UUID&amp=1&u=CANONICAL_URL&slots=%5B%7B%22sd%22%3A%22ATTR(data-slot)%22%2C%22s%22%3A%5B%22ATTR(width)xATTR(height)%22%5D%2C%22ms%22%3A%22ATTR(data-multi-size)%22%7D%5D&pj=PARAMS&gdprc=CONSENT_STRING',
    macros: ['PUB_ID', 'PARAMS', 'PUB_UUID', 'CONSENT_STRING'],
    disableKeyAppend: true,
  },
  automatad: {
    url: 'https://pbs01.automatad.com/openrtb2/amp?tag_id=TAG_ID',
    macros: ['TAG_ID'],
    disableKeyAppend: true,
  },
  browsi: {
    url: 'https://amp.browsiprod.com/predict?pvid=PAGEVIEWID_64&ot=ELEMENT_POS&ul=SCROLL_TOP&pl=PAGE_HEIGHT&bks=BKG_STATE&pk=PUB_KEY&sk=SITE_KEY&h=ATTR(height)&adix=ATTR(data-amp-slot-index)&ref=REFERRER&url=HREF',
    macros: ['PUB_KEY', 'SITE_KEY'],
    errorReportingUrl:
      'https://events.browsiprod.com/events/amp?e=ERROR_TYPE&h=HREF&et=predict_error',
    disableKeyAppend: true,
  },
  criteo: {
    url: 'https://bidder.criteo.com/amp/rtc?zid=ZONE_ID&nid=NETWORK_ID&psubid=PUBLISHER_SUB_ID&lir=LINE_ITEM_RANGES&w=ATTR(width)&h=ATTR(height)&ow=ATTR(data-override-width)&oh=ATTR(data-override-height)&ms=ATTR(data-multi-size)&slot=ATTR(data-slot)&timeout=TIMEOUT&curl=CANONICAL_URL&href=HREF&cst=CONSENT_STATE&cst_str=CONSENT_STRING&cst_type=CONSENT_METADATA(consentStringType)&cst_gdpr_applies=CONSENT_METADATA(gdprApplies)',
    macros: [
      'ZONE_ID',
      'NETWORK_ID',
      'PUBLISHER_SUB_ID',
      'LINE_ITEM_RANGES',
      'CONSENT_STATE',
      'CONSENT_STRING',
    ],
    disableKeyAppend: true,
  },
  denakop: {
    url: 'https://ib.adnxs.com/prebid/amp?tag_id=PLACEMENT_ID&w=ATTR(width)&h=ATTR(height)&ow=ATTR(data-override-width)&oh=ATTR(data-override-height)&ms=ATTR(data-multi-size)&slot=ATTR(data-slot)&targeting=TGT&curl=CANONICAL_URL&timeout=TIMEOUT&adcid=ADCID&purl=HREF&gdpr_consent=CONSENT_STRING&account=ACCOUNT_ID&gdpr_applies=CONSENT_METADATA(gdprApplies)&addtl_consent=CONSENT_METADATA(additionalConsent)&consent_type=CONSENT_METADATA(consentStringType)',
    macros: ['PLACEMENT_ID', 'CONSENT_STRING', 'ACCOUNT_ID'],
    disableKeyAppend: true,
  },
  freestar: {
    url: 'https://prebid-amp.pub.network/openrtb2/amp?tag_id=TAG_ID&w=ATTR(width)&h=ATTR(height)&ow=ATTR(data-override-width)&oh=ATTR(data-override-height)&ms=ATTR(data-multi-size)&slot=ATTR(data-slot)&targeting=TGT&curl=CANONICAL_URL&timeout=TIMEOUT&adc=ADCID&purl=HREF&gdpr_consent=CONSENT_STRING&account=ACCOUNT_ID',
    macros: ['TAG_ID', 'CONSENT_STRING', 'ACCOUNT_ID'],
    disableKeyAppend: true,
  },
  future: {
    url: 'https://ads.servebom.com/amp?adunit=ADUNIT&gdpr_consent=CONSENT_STRING',
    macros: ['ADUNIT', 'CONSENT_STRING'],
    disableKeyAppend: true,
  },
  glxm: {
    url: 'https://pbserver.galaxiemedia.fr/openrtb2/amp?tag_id=REQUEST_ID&w=ATTR(width)&h=ATTR(height)&ow=ATTR(data-override-width)&oh=ATTR(data-override-height)&ms=ATTR(data-multi-size)&slot=ATTR(data-slot)&targeting=TGT&curl=CANONICAL_URL&timeout=TIMEOUT&adc=ADCID&purl=HREF&gdpr_consent=CONSENT_STRING&account=ACCOUNT_ID',
    macros: ['REQUEST_ID', 'CONSENT_STRING', 'ACCOUNT_ID'],
    disableKeyAppend: true,
  },
  highfivve: {
    url: 'https://prebid-server.h5v.eu/openrtb2/amp?tag_id=TAG_ID&w=ATTR(width)&h=ATTR(height)&ow=ATTR(data-override-width)&oh=ATTR(data-override-height)&ms=ATTR(data-multi-size)&slot=ATTR(data-slot)&targeting=TGT&curl=CANONICAL_URL&timeout=TIMEOUT&adc=ADCID&purl=HREF&gdpr_consent=CONSENT_STRING&account=ACCOUNT_ID',
    macros: ['TAG_ID', 'CONSENT_STRING', 'ACCOUNT_ID'],
    disableKeyAppend: true,
  },
  hubvisor: {
    url: 'https://pbs.hubvisor.io/openrtb2/amp?tag_id=PLACEMENT_ID&slot=ATTR(data-slot)&targeting=TGT&curl=CANONICAL_URL&timeout=TIMEOUT&adcid=ADCID&purl=HREF&gdpr_consent=CONSENT_STRING',
    macros: ['PLACEMENT_ID', 'CONSENT_STRING'],
    disableKeyAppend: true,
  },
  improvedigital: {
    url: 'https://pbs.360yield.com/openrtb2/amp?tag_id=TAG_ID&w=ATTR(width)&h=ATTR(height)&ow=ATTR(data-override-width)&oh=ATTR(data-override-height)&ms=ATTR(data-multi-size)&slot=ATTR(data-slot)&targeting=TGT&curl=CANONICAL_URL&timeout=TIMEOUT&adc=ADCID&purl=HREF&consent_string=CONSENT_STRING&account=ACCOUNT_ID&gdpr_applies=CONSENT_METADATA(gdprApplies)&addtl_consent=CONSENT_METADATA(additionalConsent)&consent_type=CONSENT_METADATA(consentStringType)',
    macros: ['TAG_ID', 'CONSENT_STRING', 'ACCOUNT_ID'],
    disableKeyAppend: true,
  },
  indexexchange: {
    url: 'https://amp.casalemedia.com/amprtc?v=1&w=ATTR(width)&h=ATTR(height)&ow=ATTR(data-override-width)&oh=ATTR(data-override-height)&ms=ATTR(data-multi-size)&s=SITE_ID&p=CANONICAL_URL&consent_state=CONSENT_STATE&consent_string=CONSENT_STRING',
    macros: ['SITE_ID', 'CONSENT_STATE', 'CONSENT_STRING'],
    disableKeyAppend: true,
  },
  kargo: {
    url: 'https://krk.kargo.com/api/v1/amprtc?slot=SLOT_ID&w=ATTR(width)&h=ATTR(height)&ow=ATTR(data-override-width)&oh=ATTR(data-override-height)&ms=ATTR(data-multi-size)&pslot=ATTR(data-slot)&pvid=PAGEVIEWID&targeting=TGT&curl=CANONICAL_URL&timeout=TIMEOUT&acid=ADCID&purl=HREF',
    macros: ['SLOT_ID'],
    errorReportingUrl:
      'https://krk.kargo.com/api/v1/event/amprtc-error?error_type=ERROR_TYPE&url=HREF',
    disableKeyAppend: true,
  },
  lotame: {
    url: 'https://ad.crwdcntrl.net/5/pe=y/c=CLIENT_ID/an=AD_NETWORK/ma=MAX_AUDIENCE/gdpr_consent=CONSENT_STRING/gdpr=CONSENT_METADATA(gdprApplies)',
    macros: ['CLIENT_ID', 'AD_NETWORK', 'MAX_AUDIENCES'],
    disableKeyAppend: true,
  },
  medianet: {
    url: 'https://amprtc.media.net/rtb/getrtc?cid=CID&w=ATTR(width)&h=ATTR(height)&ow=ATTR(data-override-width)&oh=ATTR(data-override-height)&ms=ATTR(data-multi-size)&slot=ATTR(data-slot)&tgt=TGT&curl=CANONICAL_URL&to=TIMEOUT&purl=HREF&cste=CONSENT_STATE&cstr=CONSENT_STRING&adcid=ADCID&dmsv=ATTR(data-multi-size-validation)&ep=ELEMENT_POS&st=SCROLL_TOP&ph=PAGE_HEIGHT&bks=BKG_STATE&ref=REFERRER&dj=ATTR(data-json)&cst_type=CONSENT_METADATA(consentStringType)&gdpr_applies=CONSENT_METADATA(gdprApplies)',
    macros: ['CID'],
    errorReportingUrl:
      'https://qsearch-a.akamaihd.net/log?logid=kfk&evtid=projectevents&project=amprtc_error&error=ERROR_TYPE&rd=HREF',
    disableKeyAppend: true,
  },
  mediasquare: {
    url: 'https://pbs-front.mediasquare.fr/msq_prebid?owner=OWNER&code=CODE&w=ATTR(width)&h=ATTR(height)&sizes=ATTR(data-multi-size)&adunit=ATTR(data-slot)&referer=HREF&gdpr_consent=CONSENT_STRING',
    macros: ['OWNER', 'CODE', 'CONSENT_STRING'],
    disableKeyAppend: true,
  },
  navegg: {
    url: 'https://usr.navdmp.com/usr?acc=NVG_ACC&wst=0&v=10',
    macros: ['NVG_ACC'],
    disableKeyAppend: true,
  },
  newspassid: {
    url: 'https://bidder.newspassid.com/openrtb2/amp?tag_id=TAG_ID&placement_id=PLACEMENT_ID&gdpr_consent=CONSENT_STRING&ad_unit_code=AD_UNIT_CODE&site_id=SITE_ID&publisher_id=PUBLISHER_ID&custom_data=TGT&pubcid=PUBCID&adcid=ADCID&w=ATTR(width)&h=ATTR(height)&ow=ATTR(data-override-width)&oh=ATTR(data-override-height)&ms=ATTR(data-multi-size)&slot=ATTR(data-slot)&curl=CANONICAL_URL&timeout=TIMEOUT&purl=HREF',
    macros: [
      'TAG_ID',
      'PLACEMENT_ID',
      'SITE_ID',
      'PUBLISHER_ID',
      'AD_UNIT_CODE',
      'PUBCID',
    ],
    errorReportingUrl:
      'https://bidder.newspassid.com/amp_error?err=ERROR_TYPE&url=HREF',
    disableKeyAppend: true,
  },
  nexx360: {
    url: 'https://pbs.nexx360.io/openrtb2/amp?tag_id=TAG_ID&w=ATTR(width)&h=ATTR(height)&ow=ATTR(data-override-width)&oh=ATTR(data-override-height)&ms=ATTR(data-multi-size)&slot=ATTR(data-slot)&targeting=TGT&curl=CANONICAL_URL&timeout=TIMEOUT&adc=ADCID&purl=HREF&gdpr_consent=CONSENT_STRING&account=ACCOUNT_ID',
    macros: ['TAG_ID', 'CONSENT_STRING', 'ACCOUNT_ID'],
    disableKeyAppend: true,
  },
  openwrap: {
    // PubMatic OpenWrap
    url: 'https://ow.pubmatic.com/amp?v=1&w=ATTR(width)&h=ATTR(height)&ms=ATTR(data-multi-size)&auId=ATTR(data-slot)&targeting=TGT&purl=HREF&pubId=PUB_ID&profId=PROFILE_ID&consent_string=CONSENT_STRING&gdpr_applies=CONSENT_METADATA(gdprApplies)&addtl_consent=CONSENT_METADATA(additionalConsent)&curl=CANONICAL_URL&consent_type=CONSENT_METADATA(consentStringType)',
    macros: ['PUB_ID', 'PROFILE_ID', 'CONSENT_STRING'],
    errorReportingUrl: 'https://ow.pubmatic.com/amp_error?e=ERROR_TYPE&h=HREF',
    disableKeyAppend: true,
  },
  ozone: {
    url: 'https://elb.the-ozone-project.com/openrtb2/amp?tag_id=TAG_ID&placement_id=PLACEMENT_ID&gdpr_consent=CONSENT_STRING&ad_unit_code=AD_UNIT_CODE&site_id=SITE_ID&publisher_id=PUBLISHER_ID&custom_data=TGT&pubcid=PUBCID&adcid=ADCID&w=ATTR(width)&h=ATTR(height)&ow=ATTR(data-override-width)&oh=ATTR(data-override-height)&ms=ATTR(data-multi-size)&slot=ATTR(data-slot)&curl=CANONICAL_URL&timeout=TIMEOUT&purl=HREF',
    macros: [
      'TAG_ID',
      'PLACEMENT_ID',
      'SITE_ID',
      'PUBLISHER_ID',
      'AD_UNIT_CODE',
      'PUBCID',
    ],
    errorReportingUrl:
      'https://elb.the-ozone-project.com/amp_error?err=ERROR_TYPE&url=HREF',
    disableKeyAppend: true,
  },
  prebidappnexuspsp: {
    url: 'https://ib.adnxs.com/prebid/amp?tag_id=PLACEMENT_ID&w=ATTR(width)&h=ATTR(height)&ow=ATTR(data-override-width)&oh=ATTR(data-override-height)&ms=ATTR(data-multi-size)&slot=ATTR(data-slot)&targeting=TGT&curl=CANONICAL_URL&timeout=TIMEOUT&adcid=ADCID&purl=HREF&consent_string=CONSENT_STRING&account=ACCOUNT_ID&gdpr_applies=CONSENT_METADATA(gdprApplies)&addtl_consent=CONSENT_METADATA(additionalConsent)&consent_type=CONSENT_METADATA(consentStringType)&pvid=PAGEVIEWID',
    macros: ['PLACEMENT_ID', 'CONSENT_STRING', 'ACCOUNT_ID'],
    disableKeyAppend: true,
  },
  pubwise: {
    url: 'https://pbs.pubwise.io/openrtb2/amp?tag_id=TAG_ID&w=ATTR(width)&h=ATTR(height)&ow=ATTR(data-override-width)&oh=ATTR(data-override-height)&ms=ATTR(data-multi-size)&slot=ATTR(data-slot)&targeting=TGT&curl=CANONICAL_URL&timeout=TIMEOUT&adc=ADCID&purl=HREF&gdpr_consent=CONSENT_STRING&account=ACCOUNT_ID',
    macros: ['TAG_ID', 'CONSENT_STRING', 'ACCOUNT_ID'],
    disableKeyAppend: true,
  },
  prebidflux: {
    url: 'https://prebid-server.flux-adserver.com/openrtb2/amp?tag_id=TAG_ID',
    macros: ['TAG_ID'],
    disableKeyAppend: true,
  },
  prebidopenx: {
    url: 'https://prebid.openx.net/openrtb2/amp?tag_id=REQUEST_ID&w=ATTR(width)&h=ATTR(height)&ow=ATTR(data-override-width)&oh=ATTR(data-override-height)&ms=ATTR(data-multi-size)&slot=ATTR(data-slot)&targeting=TGT&curl=CANONICAL_URL&timeout=TIMEOUT&adc=ADCID&purl=HREF&gdpr_consent=CONSENT_STRING&account=ACCOUNT_ID',
    macros: ['REQUEST_ID', 'CONSENT_STRING', 'ACCOUNT_ID'],
    disableKeyAppend: true,
  },
  prebidrubicon: {
    url: 'https://prebid-server.rubiconproject.com/openrtb2/amp?tag_id=REQUEST_ID&w=ATTR(width)&h=ATTR(height)&ow=ATTR(data-override-width)&oh=ATTR(data-override-height)&ms=ATTR(data-multi-size)&slot=ATTR(data-slot)&targeting=TGT&curl=CANONICAL_URL&timeout=TIMEOUT&adc=ADCID&purl=HREF&consent_string=CONSENT_STRING&account=ACCOUNT_ID&gdpr_applies=CONSENT_METADATA(gdprApplies)&addtl_consent=CONSENT_METADATA(additionalConsent)&consent_type=CONSENT_METADATA(consentStringType)&pvid=PAGEVIEWID',
    macros: ['REQUEST_ID', 'CONSENT_STRING', 'ACCOUNT_ID'],
    disableKeyAppend: true,
  },
  purch: {
    url: 'https://ads.servebom.com/tmntag.js?v=1.2&fmt=amp&o={%22p%22%3APLACEMENT_ID}&div_id=DIV_ID',
    macros: ['PLACEMENT_ID', 'DIV_ID'],
    disableKeyAppend: true,
  },
  richaudience: {
    url: 'https://shb.richaudience.com/amp?p=PLACEMENT_ID&w=ATTR(width)&h=ATTR(height)&ow=ATTR(data-override-width)&oh=ATTR(data-override-height)&ms=ATTR(data-multi-size)&slot=ATTR(data-slot)&mref=CANONICAL_URL&timeout=TIMEOUT&adcid=ADCID&purl=HREF&targeting=TGT&consentString=CONSENT_STRING&gdpr=CONSENT_METADATA(gdprApplies)&addtl_consent=CONSENT_METADATA(additionalConsent)&consent_type=CONSENT_METADATA(consentStringType)',
    macros: ['PLACEMENT_ID', 'CONSENT_STRING'],
    disableKeyAppend: true,
  },
  salesforcedmp: {
    url: 'https://cdn.krxd.net/userdata/v2/amp/ORGANIZATION_ID?segments_key=SEGMENTS_KEY&kuid_key=USER_KEY',
    macros: ['ORGANIZATION_ID', 'SEGMENTS_KEY', 'USER_KEY'],
    disableKeyAppend: true,
  },
  snigel: {
    url: 'https://adserv.snigelweb.com/bp/v1/openrtb2/amp?tag_id=PLACEMENT_ID&w=ATTR(width)&h=ATTR(height)&ow=ATTR(data-override-width)&oh=ATTR(data-override-height)&ms=ATTR(data-multi-size)&slot=ATTR(data-slot)&targeting=TGT&curl=CANONICAL_URL&timeout=TIMEOUT&adcid=ADCID&purl=HREF&consent_string=CONSENT_STRING&account=ACCOUNT_ID&gdpr_applies=CONSENT_METADATA(gdprApplies)&addtl_consent=CONSENT_METADATA(additionalConsent)&consent_type=CONSENT_METADATA(consentStringType)',
    macros: ['PLACEMENT_ID', 'CONSENT_STRING', 'ACCOUNT_ID'],
    disableKeyAppend: true,
  },
  sonobi: {
    url: 'https://apex.go.sonobi.com/trinity.json?key_maker=%7B%22_DIVIDER_ATTR(data-slot)%7C1%22%3A%22PLACEMENT_ID_DIVIDER_ATTR(width)xATTR(height)%2CATTR(data-multi-size)%22%7D&ref=CANONICAL_URL&lib_name=amp&lib_v=0.1&pv=PAGEVIEWID&amp=1',
    disableKeyAppend: true,
    macros: ['PLACEMENT_ID', '_DIVIDER_'],
  },
  t13: {
    url: 'https://s2s.t13.io/openrtb2/amp?tag_id=TAG_ID&w=ATTR(width)&h=ATTR(height)&ow=ATTR(data-override-width)&oh=ATTR(data-override-height)&ms=ATTR(data-multi-size)&slot=ATTR(data-slot)&targeting=TGT&curl=CANONICAL_URL&timeout=TIMEOUT&adc=ADCID&purl=HREF&consent_string=CONSENT_STRING&account=ACCOUNT_ID&gdpr_applies=CONSENT_METADATA(gdprApplies)&addtl_consent=CONSENT_METADATA(additionalConsent)&consent_type=CONSENT_METADATA(consentStringType)',
    macros: ['TAG_ID', 'CONSENT_STRING', 'ACCOUNT_ID'],
    disableKeyAppend: true,
  },
  tail: {
    url: 'https://ACCOUNT_ID.seg.t.tailtarget.com/amp',
    macros: ['ACCOUNT_ID'],
    disableKeyAppend: true,
  },
  yieldbot: {
    url: 'https://i.yldbt.com/m/YB_PSN/v1/amp/init?curl=CANONICAL_URL&sn=YB_SLOT&w=ATTR(width)&h=ATTR(height)&ow=ATTR(data-override-width)&oh=ATTR(data-override-height)&ms=ATTR(data-multi-size)&aup=ATTR(data-slot)&pvi=PAGEVIEWID&tgt=TGT&adcid=ADCID&href=HREF',
    macros: ['YB_PSN', 'YB_SLOT'],
    disableKeyAppend: true,
  },
  yieldlab: {
    url: 'https://ad.yieldlab.net/yp/ADSLOT_ID?content=amp&consent=CONSENT_STRING&t=amp%3D1&pubref=HREF',
    macros: ['ADSLOT_ID', 'CONSENT_STRING'],
    disableKeyAppend: true,
  },
});

// DO NOT MODIFY: Setup for tests
if (getMode().localDev || getMode().test) {
  RTC_VENDORS['fakevendor'] = /** @type {RtcVendorDef} */ ({
    url: 'https://localhost:8000/examples/rtcE1.json?slot_id=SLOT_ID&page_id=PAGE_ID&foo_id=FOO_ID',
    macros: ['SLOT_ID', 'PAGE_ID', 'FOO_ID'],
  });
  RTC_VENDORS['fakevendor2'] = /** @type {RtcVendorDef} */ ({
    url: 'https://localhost:8000/examples/rtcE1.json?slot_id=SLOT_ID&page_id=PAGE_ID&foo_id=FOO_ID',
    errorReportingUrl: 'https://localhost:8000/examples/ERROR_TYPE',
    disableKeyAppend: true,
  });
}

export {RTC_VENDORS};
