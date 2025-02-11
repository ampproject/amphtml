// import {CONSENT_POLICY_STATE} from '#core/constants/consent-state';

// import {user, userAssert} from '#utils/log';
import {
  QQID_HEADER,
  SANDBOX_HEADER,
  extractAmpAnalyticsConfig,
} from '#ads/google/a4a/utils';

import {CommonSignals_Enum} from '#core/constants/common-signals';
import {Deferred} from '#core/data-structures/promise';

import {Services} from '#service';

import {dev, user} from '#utils/log';

import {AmpA4A, AnalyticsTrigger} from '../../amp-a4a/0.1/amp-a4a';
import {AmpAdNetworkDoubleclickImpl} from '../../amp-ad-network-doubleclick-impl/0.1/amp-ad-network-doubleclick-impl';

/** @type {string} */
const TAG = 'amp-ad-network-insurads-impl';

export class AmpAdNetworkInsuradsImpl extends AmpA4A {
  /**
   * @param {!Element} element
   */
  constructor(element) {
    super(element);

    /** @private {number} */
    this.refreshCount_ = 0;

    /**
     * Config to generate amp-analytics element for active view reporting.
     * @type {?JsonObject}
     * @private
     */
    this.ampAnalyticsConfig_ = null;

    /** @private {!../../../src/service/extensions-impl.Extensions} */
    this.extensions_ = Services.extensionsFor(this.win);

    /** @private {?string} */
    this.qqid_ = null;

    /** @type {?string} */
    this.parameterSize = null;

    /** @private {?{width: number, height: number}} */
    this.returnedSize_ = null;

    /** @type {?string} */
    this.parameterSize = null;

    /** @private {?{width: number, height: number}} */
    this.returnedSize_ = null;

    /** @type {?JsonObject|Object} */
    this.jsonTargeting = null;

    /** @type {string} */
    this.adKey = '0';

    /** @type {!Array<string>} */
    this.experimentIds = [];

    /** @type {!Array<string>} */
    this.ampExperimentIds = [];

    /** @protected {boolean} */
    this.useSra = false;

    /** @protected {?Deferred<?Response>} */
    this.sraDeferred = null;

    /** @private {number} */
    this.refreshCount_ = 0;

    /** @private {boolean} */
    this.isFluidRequest_ = false;

    /** @private {!TroubleshootDataDef} */
    this.troubleshootData_ = /** @type {!TroubleshootDataDef} */ ({});

    /** @type {boolean} whether safeframe forced via tag */
    this.forceSafeframe = false;
    if ('forceSafeframe' in this.element.dataset) {
      if (!/^(1|(true))$/i.test(this.element.dataset['forceSafeframe'])) {
        user().warn(
          TAG,
          'Ignoring invalid data-force-safeframe attribute: ' +
            this.element.dataset['forceSafeframe']
        );
      } else {
        this.forceSafeframe = true;
      }
    }

    /** @protected {ConsentTupleDef} */
    this.consentTuple = {};

    /** @protected {!Deferred<string>} */
    this.getAdUrlDeferred = new Deferred();

    /** @protected {!Deferred<string>} */
    this.getAdUrlDeferred = new Deferred();

    /** @private {!TroubleshootDataDef} */
    this.troubleshootData_ = /** @type {!TroubleshootDataDef} */ ({});

    /** @type {?JsonObject|Object} */
    this.jsonTargeting = null;

    /** @protected {ConsentTupleDef} */
    this.consentTuple = {};

    this.lockedid = null;

    // const refreshConfig = {
    //   /* see table below for configuration parameters */
    // };
    // const refreshInterval = getPublisherSpecifiedRefreshInterval(
    //   this.element,
    //   this.win
    // );
    // const refreshManager = new RefreshManager(this, refreshConfig, refreshInterval);
    // refreshManager.initiateRefreshCycle();
    console.log('First Print');

    // setTimeout(() => {
    //   const event = new Event('build');
    //   this.element.dispatchEvent(event);

    //   console.log('Refresh Initiated');
    //   this.refreshNow();
    // }, 5000);

    // listen(this.element, AnalyticsTrigger.AD_REFRESH, () => {
    //   console.log('Listen: Refresh Completed');
    //   this.element.setAttribute('data-refresh', 'true');
    // });

    // listen(this.element, '*', () => {
    //   console.log('Listen: Refresh Completed');
    //   this.element.setAttribute('data-refresh', 'true');
    // });

    // listenOnce(this.element, AnalyticsTrigger.AD_REFRESH, () => {
    //   console.log('Listen: Refresh Completed Once');
    // });

    // document.addEventListener(
    //   '*',
    //   (event) => {
    //     console.log('any events', event);
    //   },
    //   true
    // );

    // this.element.addEventListener('build', (event) => {
    //   console.log('build events', event);
    // }); # WORKING

    // this.element.addEventListener(AnalyticsTrigger.AD_REFRESH, (event) => {
    //   console.log('Ád Refresh', event);
    // });

    // window.addEventListener('message', (event) => {
    //   console.log('message events', event);
    // }); ## WORKING

    // this.element.addEventListener('*', this.handleAllEvents, true);

    // this.lockedid = new LockedIdGenerator().getLockedIdData();

    // console.log('lockedId', this.lockedid);

    // this.doMappingRequest();

    // this.addWebSocketCommunication();

    // this.addSignalsListeners();

    // listen(
    //   window,
    //   AnalyticsTrigger.AD_REFRESH,
    //   this.handleAllEvents.bind(this)
    // );
    // listen(this.element, 'click', this.handleAllEvents.bind(this));

    AmpAdNetworkInsuradsImpl.prototype.getAdUrl =
      AmpAdNetworkDoubleclickImpl.prototype.getAdUrl;

    AmpAdNetworkInsuradsImpl.prototype.populateAdUrlState =
      AmpAdNetworkDoubleclickImpl.prototype.populateAdUrlState;

    AmpAdNetworkInsuradsImpl.prototype.generateAdKey_ =
      AmpAdNetworkDoubleclickImpl.prototype.generateAdKey_;

    AmpAdNetworkInsuradsImpl.prototype.getParameterSize_ =
      AmpAdNetworkDoubleclickImpl.prototype.getParameterSize_;

    AmpAdNetworkInsuradsImpl.prototype.expandJsonTargeting_ =
      AmpAdNetworkDoubleclickImpl.prototype.expandJsonTargeting_;

    AmpAdNetworkInsuradsImpl.prototype.mergeRtcResponses_ =
      AmpAdNetworkDoubleclickImpl.prototype.mergeRtcResponses_;

    AmpAdNetworkInsuradsImpl.prototype.getPageParameters =
      AmpAdNetworkDoubleclickImpl.prototype.getPageParameters;

    AmpAdNetworkInsuradsImpl.prototype.getBlockParameters_ =
      AmpAdNetworkDoubleclickImpl.prototype.getBlockParameters_;

    AmpAdNetworkInsuradsImpl.prototype.getLocationQueryParameterValue =
      AmpAdNetworkDoubleclickImpl.prototype.getLocationQueryParameterValue;

    AmpAdNetworkInsuradsImpl.prototype.expandJsonTargeting_ =
      AmpAdNetworkDoubleclickImpl.prototype.expandJsonTargeting_;

    AmpAdNetworkInsuradsImpl.prototype.expandValue_ =
      AmpAdNetworkDoubleclickImpl.prototype.expandValue_;

    AmpAdNetworkInsuradsImpl.prototype.expandString_ =
      AmpAdNetworkDoubleclickImpl.prototype.expandString_;

    AmpAdNetworkInsuradsImpl.prototype.getCustomRealTimeConfigMacros_ =
      AmpAdNetworkDoubleclickImpl.prototype.getCustomRealTimeConfigMacros_; // Not sure if this is needed

    AmpAdNetworkInsuradsImpl.troubleshootData_ =
      AmpAdNetworkDoubleclickImpl.troubleshootData_;
  }

  /**
   *  Define a function to handle all events
   * @param event
   */
  handleAllEvents(event) {
    console.log('Event type:', event.type);
    console.log('Event target:', event.target);
    // Additional handling logic can be added here
  }

  // /** @override */
  // getAdUrl(opt_consentTuple, opt_rtcResponsesPromise, opt_serveNpaSignal) {
  //   console.log('getAdUrl from amp-ad-network-doubleclick-impl.js');
  //   if (this.useSra) {
  //     this.sraDeferred = this.sraDeferred || new Deferred();
  //   }
  //   this.serveNpaSignal_ = !!opt_serveNpaSignal;
  //   const consentTuple = opt_consentTuple || {};
  //   if (
  //     consentTuple.consentState == CONSENT_POLICY_STATE.UNKNOWN &&
  //     this.element.getAttribute('data-npa-on-unknown-consent') != 'true'
  //   ) {
  //     user().info(TAG, 'Ad request suppressed due to unknown consent');
  //     this.getAdUrlDeferred.resolve('');
  //     return Promise.resolve('');
  //   }
  //   if (this.iframe && !this.isRefreshing) {
  //     dev().warn(TAG, `Frame already exists, sra: ${this.useSra}`);
  //     this.getAdUrlDeferred.resolve('');
  //     return Promise.resolve('');
  //   }
  //   opt_rtcResponsesPromise = opt_rtcResponsesPromise || Promise.resolve();
  //   // TODO(keithwrightbos): SRA blocks currently unnecessarily generate full
  //   // ad url.  This could be optimized however non-SRA ad url is required to
  //   // fallback to non-SRA if single block.
  //   this.populateAdUrlState(consentTuple);
  //   // TODO: Check for required and allowed parameters. Probably use
  //   // validateData, from 3p/3p/js, after moving it someplace common.
  //   const startTime = Date.now();
  //   const timerService = Services.timerFor(this.win);

  //   const checkStillCurrent = this.verifyStillCurrent();

  //   const rtcParamsPromise = opt_rtcResponsesPromise.then((results) => {
  //     checkStillCurrent();
  //     return this.mergeRtcResponses_(results);
  //   });

  //   const targetingExpansionPromise = timerService
  //     .timeoutPromise(1000, this.expandJsonTargeting_(rtcParamsPromise))
  //     .catch(() => {
  //       dev().warn(TAG, 'JSON Targeting expansion failed/timed out.');
  //     });

  //   Promise.all([rtcParamsPromise, targetingExpansionPromise]).then(
  //     (results) => {
  //       checkStillCurrent();
  //       const rtcParams = results[0];
  //       googleAdUrl(
  //         this,
  //         DOUBLECLICK_BASE_URL,
  //         startTime,
  //         Object.assign(
  //           this.getBlockParameters_(),
  //           this.getPageParameters(consentTuple, /* instances= */ undefined),
  //           rtcParams
  //         ),
  //         this.experimentIds
  //       ).then((adUrl) => this.getAdUrlDeferred.resolve(adUrl));
  //     }
  //   );
  //   this.troubleshootData_.adUrl = this.getAdUrlDeferred.promise;
  //   return this.getAdUrlDeferred.promise;
  // }

  // /** @override */
  // getAdUrl(opt_consentTuple, opt_rtcResponsesPromise, opt_serveNpaSignal) {
  //   // return true;
  //   // const url = 'https://www.insurads.com/amp';
  //   const gg =
  //     'https://securepubads.g.doubleclick.net/gampad/adx?iu=/35821442/amica.it/people-parties/Frame1&sz=300x600&c=123456';
  //   const logo =
  //     'https://assets-global.website-files.com/65c2c4f8b25f1f7473b9a954/65d4b0bcee947d5de63f605c_insurads-logo.svg';
  //   const ggamp =
  //     'https://pubads.g.doubleclick.net/gampad/adx?iu=/35821442/amica.it/people-parties/Frame1&sz=300x600&ciu_szs=300x600&cust_params=keyword%3Dtest&correlator=1234567890&gdfp_req=1&output=vast&unviewed_position_start=1';
  //   const gginsurads =
  //     'https://pubads.g.doubleclick.net/gampad/adx?iu=/134642692/amp-samples/amp-MREC&sz=300x600&ciu_szs=300x600&cust_params=keyword%3Dtest&correlator=1234567890&gdfp_req=1&output=vast&unviewed_position_start=1';
  //   const nninsurads =
  //     'https://securepubads.g.doubleclick.net/gampad/ads?__amp_source_origin=https%3A%2F%2Flocalhost%3A4200&adf=2438287650&adk=3060822296&adx=0&ady=0&amp_v=2404230718000&bc=7&bdt=2&bih=250&biw=300&c=940971007998&d_imp=1&dt=1715617280303&dtd=2&fws=0&ga_cid=amp-qRLck9w4Ncp0Um97qQ_1Wg&ga_hid=7998&gdfp_req=1&ifi=1&impl=ifr&is_amp=3&iu=%2F134642692%2Famp-samples%2Famp-MREC&loc=https%3A%2F%2Flocalhost%3A4200%2Fdoubleclick.html&msz=1505x-1&nhd=1&oid=2&output=vast&psz=1505x-1&ptt=13&ref=https%3A%2F%2Flocalhost%3A4200%2F&scp=clube%3Dbenfica-ws%26pos%3Damp&scr_x=0&scr_y=0&sfv=1-0-37&sz=300x250&u_ah=1956&u_aw=1505&u_cd=24&u_h=1956&u_his=2&u_sd=3.5&u_tz=60&u_w=1505&uafv=124.0.6367.158&uap=macOS&uapv=14.4.1&uafvl=%5B%7B%22brand%22%3A%22Chromium%22%2C%22version%22%3A%22124.0.6367.158%22%7D%2C%7B%22brand%22%3A%22Google+Chrome%22%2C%22version%22%3A%22124.0.6367.158%22%7D%2C%7B%22brand%22%3A%22Not-A.Brand%22%2C%22version%22%3A%2299.0.0.0%22%7D%5D&url=https%3A%2F%2Famp.dev%2Fdocumentation%2Fexamples%2Fcomponents%2Famp-ad%2Findex.html&vis=1';
  //   const ggdcinsurads =
  //     'https://securepubads.g.doubleclick.net/gampad/ads?iu=%2F134642692%2Famp-samples%2Famp-MREC&adk=3307344817&sz=300x250%7C300x250&output=html&impl=ifr&ifi=1&msz=1026x-1&psz=1026x-1&fws=4&scp=gestione_AMP%3Dtrue%26tipo_pagina%3Dpost&adf=2438287650&nhd=0&adx=0&ady=47&oid=2&ptt=13&gdfp_req=1&sfv=1-0-37&u_sd=2&is_amp=3&amp_v=2405080634000&d_imp=1&c=72008140&ga_cid=amp-fnccxfbpyVfvSPa7sW2tOQ&ga_hid=8140&dt=1715618255615&biw=1026&bih=1792&u_aw=3840&u_ah=2135&u_cd=24&u_w=3840&u_h=2160&u_tz=60&u_his=4&vis=1&scr_x=0&scr_y=0&bc=7&url=http%3A%2F%2Fnonblocking.io%2F&loc=http%3A%2F%2Flocalhost%3A8000%2Fexamples%2Famp-ad%2Finsurads.amp.html&bdt=405&uap=macOS&uapv=14.4.1&uaa=arm&uafv=124.0.6367.158&uab=64&dtd=28884';
  //   const url = ggamp;
  //   const publicId = this.element.getAttribute('data-public-id');
  //   const slot = this.element.getAttribute('data-slot');
  //   // return promise that resolves to ad url
  //   this.getAdUrlDeferred.resolve(url);
  //   return this.getAdUrlDeferred.promise;
  //   // return url; //+ '?publicId=' + publicId + '&slot=' + slot;

  //   // const adUrlPromise = this.doubleClick.getAdUrl(
  //   //   opt_consentTuple,
  //   //   opt_rtcResponsesPromise,
  //   //   opt_serveNpaSignal
  //   // );

  //   // adUrlPromise.then((adUrl) => {
  //   //   console.log('Ad URL:', adUrl);
  //   // });
  //   // return adUrlPromise;
  // }

  /** @override */
  buildCallback() {
    super.buildCallback();
    console.log('Build Callback');
    // this.doubleClick.buildCallback();
  }

  /** @override */
  onCreativeRender(creativeMetaData, opt_onLoadPromise) {
    super.onCreativeRender(creativeMetaData);

    console.log('Creative Rendered', creativeMetaData, opt_onLoadPromise);
    console.log('Refresh Count:', this.refreshCount_);

    // this.ampAnalyticsConfig_ = {
    //   triggers: {
    //     renderStart: {
    //       on: 'render-start',
    //       request: 'event',
    //       selector: 'amp-ad',
    //     },
    //   },
    // };

    // this.ampAnalyticsElement_ = insertAnalyticsElement(
    //   this.element,
    //   this.ampAnalyticsConfig_,
    //   /*loadAnalytics*/ true,
    //   !!this.postAdResponseExperimentFeatures['avr_disable_immediate']
    // );
  }

  // /** @override */
  // renderNonAmpCreative() {
  //   console.log('Non AMP Creative Rendered');
  //   // If render idle with throttling, impose one second render delay for
  //   // non-AMP creatives.  This is not done in the scheduler to ensure as many
  //   // slots as possible are marked for layout given scheduler imposes 5 seconds
  //   // past previous execution.
  //   // if (
  //   //   this.postAdResponseExperimentFeatures['render-idle-throttle'] &&
  //   //   this.isIdleRender_
  //   // ) {
  //   //   if (is3pThrottled(this.win)) {
  //   //     return waitFor3pThrottle().then(() => super.renderNonAmpCreative());
  //   //   } else {
  //   //     incrementLoadingAds(this.win);
  //   //     return super.renderNonAmpCreative(true);
  //   //   }
  //   // }
  //   return super.renderNonAmpCreative();
  // }

  /**
   * On Refresh
   */
  refreshNow() {
    this.refreshCount_++;
    this.refresh(this.onRefreshCallback.bind(this));
    console.log('Refreshed Now');
  }

  /**
   * On Refresh
   */
  onRefreshCallback() {
    console.log('Refreshed');
  }

  /** @override */
  extractSize(responseHeaders) {
    console.log('Extract Size' + responseHeaders);
    this.ampAnalyticsConfig_ = extractAmpAnalyticsConfig(this, responseHeaders);
    this.qqid_ = responseHeaders.get(QQID_HEADER);
    this.shouldSandbox_ = responseHeaders.get(SANDBOX_HEADER) == 'true';
    // this.troubleshootData_.creativeId = dev().assertString(
    //   responseHeaders.get('google-creative-id') || '-1'
    // );
    // this.troubleshootData_.lineItemId = dev().assertString(
    //   responseHeaders.get('google-lineitem-id') || '-1'
    // );
    console.log('qqid:', this.qqid_);
    console.log('ampAnalyticsConfig:', this.ampAnalyticsConfig_);
    console.log(
      'google-creative-id:',
      responseHeaders.get('google-creative-id') || '-1'
    );
    console.log(
      'google-lineitem-id:',
      responseHeaders.get('google-lineitem-id') || '-1'
    );

    // Load amp-analytics extensions
    this.extensions_./*OK*/ installExtensionForDoc(
      this.getAmpDoc(),
      'amp-analytics'
    );

    // If the server returned a size, use that, otherwise use the size that we
    // sent in the ad request.
    let size = super.extractSize(responseHeaders);
    if (size) {
      this.returnedSize_ = size;
      this.handleResize_(size.width, size.height);
    } else {
      size = this.getSlotSize();
    }
    // If this is a multi-size creative, fire delayed impression now. If it's
    // fluid, wait until after resize happens.
    if (this.isFluidRequest_ && !this.returnedSize_) {
      this.fluidImpressionUrl_ = responseHeaders.get('X-AmpImps');
    }

    // If the response included a pageview state token, check for an existing
    // token and remove it. Then save the new one to the module level object.
    if (responseHeaders.get('amp-ff-pageview-tokens')) {
      this.removePageviewStateToken();
      this.setPageviewStateToken(
        dev().assertString(responseHeaders.get('amp-ff-pageview-tokens'))
      );
    }

    return size;
  }

  /**
   * Do Mapping Request
   * @return {Promise<void>}
   */
  doMappingRequest() {
    const url =
      'https://services.insurads.com/init?appId=4WMPI6PV&h=https%3A%2F%2Fwww.insurads.com%2F&tcfc=1&t=1715249125054';

    // const publicId = this.element.getAttribute('data-public-id');
    // const slot = this.element.getAttribute('data-slot');

    // const data = {
    //   publicId: publicId,
    //   slot: slot,
    // };

    const xhrInit = {
      mode: 'no-cors',
      method: 'GET',
      credentials: 'include',
    };

    return Services.xhrFor(this.win)
      .fetch(url, xhrInit)
      .then((response) => {
        console.log('Mapping Response:', response);
        return response;
      })
      .then((data) => {
        console.log('Mapping Data:', data);
      })
      .catch((error) => {
        console.error('Mapping Error:', error);
      });
  }

  /**
   * Add WebSocket Communication
   */
  addWebSocketCommunication() {
    const hubUrl =
      'wss://amp-messaging.insurads.com/rt-pub/node/hub?appId=78&dev=Smartphone&br=Safari&os=iOS&cc=PT&rc=11&v=0.2';
    console.log('Hub URL:', hubUrl);

    // create websocket connection
    const ws = new WebSocket(hubUrl);

    // Connection opened
    ws.addEventListener('open', function (event) {
      ws.send('{"protocol":"json","version":1}');
    });

    // Listen for messages
    ws.addEventListener('message', function (event) {
      console.log('Message from server ', event.data);
    });

    // Connection closed
    ws.addEventListener('close', function (event) {
      console.log('Connection closed');
    });
  }

  /**
   * Add Signals Listeners
   */
  addSignalsListeners() {
    this.element
      .signals()
      .whenSignal(CommonSignals_Enum.READY_TO_UPGRADE)
      .then((any) => {
        console.log('Signal: ', CommonSignals_Enum.READY_TO_UPGRADE, any);
      });

    this.element
      .signals()
      .whenSignal(CommonSignals_Enum.UPGRADED)
      .then((any) => {
        console.log('Signal: ', CommonSignals_Enum.UPGRADED, any);
      });

    this.element
      .signals()
      .whenSignal(CommonSignals_Enum.BUILT)
      .then((any) => {
        console.log('Signal: ', CommonSignals_Enum.BUILT, any);
      });

    this.element
      .signals()
      .whenSignal(CommonSignals_Enum.MOUNTED)
      .then((any) => {
        console.log('Signal: ', CommonSignals_Enum.MOUNTED, any);
      });

    this.element
      .signals()
      .whenSignal(CommonSignals_Enum.LOAD_START)
      .then((any) => {
        console.log('Signal: ', CommonSignals_Enum.LOAD_START, any);
      });

    this.element
      .signals()
      .whenSignal(CommonSignals_Enum.RENDER_START)
      .then((any) => {
        console.log('Signal: ', CommonSignals_Enum.RENDER_START, any);
      });

    this.element
      .signals()
      .whenSignal(CommonSignals_Enum.LOAD_END)
      .then((any) => {
        console.log('Signal: ', CommonSignals_Enum.LOAD_END, any);
      });
    this.element
      .signals()
      .whenSignal(CommonSignals_Enum.INI_LOAD)
      .then((any) => {
        console.log('Signal: ', CommonSignals_Enum.INI_LOAD, any);
      });

    this.element
      .signals()
      .whenSignal(CommonSignals_Enum.UNLOAD)
      .then((any) => {
        console.log('Signal: ', CommonSignals_Enum.UNLOAD, any);
      });

    this.element
      .signals()
      .whenSignal(AnalyticsTrigger.AD_REFRESH)
      .then((any) => {
        console.log('Signal: ', AnalyticsTrigger.AD_REFRESH, any);
      });

    // READY_TO_UPGRADE: string;
    // UPGRADED: string;
    // BUILT: string;
    // MOUNTED: string;
    // LOAD_START: string;
    // RENDER_START: string;
    // LOAD_END: string;
    // INI_LOAD: string;
    // UNLOAD: string;
  }

  /**
   * Returns the width and height of the slot as defined by the width and height
   * attributes, or the dimensions as computed by
   * getIntersectionElementLayoutBox.
   * @return {!LayoutRectOrDimsDef}
   */
  getSlotSize() {
    const {height, width} = this.getDeclaredSlotSize_();
    return width && height
      ? {width, height}
      : // width/height could be 'auto' in which case we fallback to measured.
        this.getIntersectionElementLayoutBox();
  }

  /**
   * Returns the width and height, as defined by the slot element's width and
   * height attributes.
   * @return {!SizeDef}
   */
  getDeclaredSlotSize_() {
    const width = Number(this.element.getAttribute('width'));
    const height = Number(this.element.getAttribute('height'));
    return {width, height};
  }
}

AMP.extension('amp-ad-network-insurads-impl', '0.1', (AMP) => {
  AMP.registerElement('amp-ad-network-insurads-impl', AmpAdNetworkInsuradsImpl);
});
