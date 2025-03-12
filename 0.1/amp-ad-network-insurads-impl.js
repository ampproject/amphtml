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

import {dev, devAssert, user} from '#utils/log';

import {AmpA4A, AnalyticsTrigger} from '../../amp-a4a/0.1/amp-a4a';
import {
  RefreshManager,
  getRefreshManager,
} from '../../amp-a4a/0.1/refresh-manager';
import {AmpAdNetworkDoubleclickImpl} from '../../amp-ad-network-doubleclick-impl/0.1/amp-ad-network-doubleclick-impl';

/** @type {string} */
const TAG = 'amp-ad-network-insurads-impl';

export class AmpAdNetworkInsuradsImpl extends AmpA4A {
  /**
   * @param {!Element} element
   */
  constructor(element) {
    super(element);

    console /*OK*/
      .log('AmpAdNetworkInsuradsImpl');

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

    /** @private {?RefreshManager} */
    this.refreshManager_ = null;

    console /*OK*/
      .log('First Print');

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
   * @param event {Event} teste cenas
   */
  handleAllEvents(event) {
    console /*OK*/
      .log('Event type:', event.type);
    console /*OK*/
      .log('Event target:', event.target);
    // Additional handling logic can be added here
  }

  /** @override */
  buildCallback() {
    super.buildCallback();
    console /*OK*/
      .log('Build Callback');
    // this.doubleClick.buildCallback();
  }

  /** @override */
  onCreativeRender(creativeMetaData, opt_onLoadPromise) {
    super.onCreativeRender(creativeMetaData);

    console /*OK*/
      .log('Creative Rendered', creativeMetaData, opt_onLoadPromise);
    console /*OK*/
      .log('Refresh Count:', this.refreshCount_);

    if (this.isRefreshing) {
      devAssert(this.refreshManager_);
      this.refreshManager_.initiateRefreshCycle();
      this.isRefreshing = false;
      this.isRelayoutNeededFlag = false;
      console /*OK*/
        .log('Refresh Cycle Initiated');
    } else {
      const url =
        'https://run.mocky.io/v3/508f85e2-4a98-48ee-8cca-ddbf65bcf237';

      Services.xhrFor(this.win)
        .fetch(url, {
          mode: 'cors',
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Origin': 'http://localhost:8000', // Required for CORS Anywhere
            'X-Requested-With': 'XMLHttpRequest', // Required for CORS Anywhere
          },
        })
        .then((response) => response.json())
        .then((data) => {
          this.triggerImmediateRefresh(data.impDur);
        })
        .catch((error) => {
          console /*OK*/
            .error('Mapping Error:', error);
        });
    }

    // this.a4a_.refresh(() => this.refreshManager_.initiateRefreshCycle());
    // setTimeout(() => {
    //   this.refreshManager_.initiateRefreshCycle();
    //   console /*OK*/
    //     .log('AmpAdNetworkInsuradsImpl');
    // }, 5000);

    super.onCreativeRender(creativeMetaData, opt_onLoadPromise);
  }

  /**
   * On Refresh
   */
  onRefreshCallback() {
    console /*OK*/
      .log('onRefreshCallback');
  }

  /**
   * Triggers an immediate refresh of the ad.
   * This can be called when receiving realtime messages that require a refresh.
   * @param {number} impDur
   * @return {boolean}
   */
  triggerImmediateRefresh(impDur) {
    console /*OK*/
      .log('Triggering immediate ad refresh');

    // Don't refresh if we're already in the process of refreshing
    if (this.isRefreshing) {
      console /*OK*/
        .log('Already refreshing, ignoring refresh trigger');
      return false;
    }

    // Check if the ad is in a state where it can be refreshed
    if (!this.iframe) {
      console /*OK*/
        .log('Ad not ready for refresh yet');
      return false;
    }

    // Create a refresh manager if it doesn't exist yet
    if (!this.refreshManager_) {
      console /*OK*/
        .warn(
          'No refresh manager available, creating one with default settings'
        );
      this.refreshManager_ =
        getRefreshManager(this) ||
        new RefreshManager(
          this,
          {
            'visiblePercentageMin': 50,
            'continuousTimeMin': 1,
          },
          impDur * 1000
        ); // Default refresh interval as fallback
    }

    this.refresh(() => {
      // Mark the ad as refreshing
      // this.isRefreshing = true;
      this.refreshCount_++;
      devAssert(this.refreshManager_);
      this.refreshManager_.initiateRefreshCycle();
      this.isRefreshing = true;
      this.isRelayoutNeededFlag = true;
      console /*OK*/
        .log('Refresh Cycle Initiated');
    });
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
        console /*OK*/
          .log('Mapping Response:', response);
        return response;
      })
      .then((data) => {
        console /*OK*/
          .log('Mapping Data:', data);
      })
      .catch((error) => {
        console /*OK*/
          .error('Mapping Error:', error);
      });
  }

  /**
   * Add WebSocket Communication
   */
  addWebSocketCommunication() {
    const hubUrl =
      'wss://amp-messaging.insurads.com/rt-pub/node/hub?appId=78&dev=Smartphone&br=Safari&os=iOS&cc=PT&rc=11&v=0.2';
    console /*OK*/
      .log('Hub URL:', hubUrl);

    // create websocket connection
    const ws = new WebSocket(hubUrl);

    // Connection opened
    ws.addEventListener('open', function (event) {
      ws.send('{"protocol":"json","version":1}', event);
    });

    // Listen for messages
    ws.addEventListener('message', function (event) {
      console /*OK*/
        .log('Message from server ', event.data);
    });

    // Connection closed
    ws.addEventListener('close', function (event) {
      console /*OK*/
        .log('Connection closed', event);
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
        console /*OK*/
          .log('Signal: ', CommonSignals_Enum.READY_TO_UPGRADE, any);
      });

    this.element
      .signals()
      .whenSignal(CommonSignals_Enum.UPGRADED)
      .then((any) => {
        console /*OK*/
          .log('Signal: ', CommonSignals_Enum.UPGRADED, any);
      });

    this.element
      .signals()
      .whenSignal(CommonSignals_Enum.BUILT)
      .then((any) => {
        console /*OK*/
          .log('Signal: ', CommonSignals_Enum.BUILT, any);
      });

    this.element
      .signals()
      .whenSignal(CommonSignals_Enum.MOUNTED)
      .then((any) => {
        console /*OK*/
          .log('Signal: ', CommonSignals_Enum.MOUNTED, any);
      });

    this.element
      .signals()
      .whenSignal(CommonSignals_Enum.LOAD_START)
      .then((any) => {
        console /*OK*/
          .log('Signal: ', CommonSignals_Enum.LOAD_START, any);
      });

    this.element
      .signals()
      .whenSignal(CommonSignals_Enum.RENDER_START)
      .then((any) => {
        console /*OK*/
          .log('Signal: ', CommonSignals_Enum.RENDER_START, any);
      });

    this.element
      .signals()
      .whenSignal(CommonSignals_Enum.LOAD_END)
      .then((any) => {
        console /*OK*/
          .log('Signal: ', CommonSignals_Enum.LOAD_END, any);
      });
    this.element
      .signals()
      .whenSignal(CommonSignals_Enum.INI_LOAD)
      .then((any) => {
        console /*OK*/
          .log('Signal: ', CommonSignals_Enum.INI_LOAD, any);
      });

    this.element
      .signals()
      .whenSignal(CommonSignals_Enum.UNLOAD)
      .then((any) => {
        console /*OK*/
          .log('Signal: ', CommonSignals_Enum.UNLOAD, any);
      });

    this.element
      .signals()
      .whenSignal(AnalyticsTrigger.AD_REFRESH)
      .then((any) => {
        console /*OK*/
          .log('Signal: ', AnalyticsTrigger.AD_REFRESH, any);
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
    return {width, height};
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
