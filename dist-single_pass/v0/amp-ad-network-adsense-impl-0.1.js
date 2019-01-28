(self.AMP=self.AMP||[]).push({n:"amp-ad-network-adsense-impl",i:["_base_i","_base_ad"],v:"1901181729101",f:(function(AMP,_){
var $additionalDimensions$$module$ads$google$a4a$utils$$ = function($win$jscomp$257$$, $viewportSize$jscomp$4$$) {
  try {
    var $screenX$jscomp$3$$ = $win$jscomp$257$$.screenX;
    var $screenY$jscomp$3$$ = $win$jscomp$257$$.screenY;
  } catch ($e$190$$) {
  }
  try {
    var $outerWidth$$ = $win$jscomp$257$$.outerWidth;
    var $outerHeight$$ = $win$jscomp$257$$.outerHeight;
  } catch ($e$191$$) {
  }
  try {
    var $innerWidth$$ = $viewportSize$jscomp$4$$.width;
    var $innerHeight$$ = $viewportSize$jscomp$4$$.height;
  } catch ($e$192$$) {
  }
  return [$win$jscomp$257$$.screenLeft, $win$jscomp$257$$.screenTop, $screenX$jscomp$3$$, $screenY$jscomp$3$$, $win$jscomp$257$$.screen ? $win$jscomp$257$$.screen.availWidth : void 0, $win$jscomp$257$$.screen ? $win$jscomp$257$$.screen.availTop : void 0, $outerWidth$$, $outerHeight$$, $innerWidth$$, $innerHeight$$].join();
}, $AdsenseSharedState$$module$extensions$amp_ad_network_adsense_impl$0_1$adsense_shared_state$$ = function() {
  this.$D$ = [];
}, $JSCompiler_StaticMethods_addNewSlot$$ = function($format$jscomp$13$$, $id$jscomp$46$$, $client$jscomp$1$$, $slotname$$) {
  var $JSCompiler_StaticMethods_addNewSlot$self$$ = $sharedState$$module$extensions$amp_ad_network_adsense_impl$0_1$amp_ad_network_adsense_impl$$, $result$jscomp$25$$ = {$pv$:2, $prevFmts$:"", $prevSlotnames$:""};
  $JSCompiler_StaticMethods_addNewSlot$self$$.$D$.forEach(function($format$jscomp$13$$) {
    $result$jscomp$25$$.$prevFmts$ += ($result$jscomp$25$$.$prevFmts$ ? "," : "") + $format$jscomp$13$$.format;
    $format$jscomp$13$$.$slotname$ && ($result$jscomp$25$$.$prevSlotnames$ += ($result$jscomp$25$$.$prevSlotnames$ ? "," : "") + $format$jscomp$13$$.$slotname$);
    $format$jscomp$13$$.client == $client$jscomp$1$$ && ($result$jscomp$25$$.$pv$ = 1);
  });
  $JSCompiler_StaticMethods_addNewSlot$self$$.$D$.push({id:$id$jscomp$46$$, format:$format$jscomp$13$$, client:$client$jscomp$1$$, $slotname$:$slotname$$});
  return $result$jscomp$25$$;
}, $JSCompiler_StaticMethods_removeSlot$$ = function($id$jscomp$47$$) {
  var $JSCompiler_StaticMethods_removeSlot$self$$ = $sharedState$$module$extensions$amp_ad_network_adsense_impl$0_1$amp_ad_network_adsense_impl$$;
  $JSCompiler_StaticMethods_removeSlot$self$$.$D$ = $JSCompiler_StaticMethods_removeSlot$self$$.$D$.filter(function($JSCompiler_StaticMethods_removeSlot$self$$) {
    return $JSCompiler_StaticMethods_removeSlot$self$$.id != $id$jscomp$47$$;
  });
}, $AmpAdNetworkAdsenseImpl$$module$extensions$amp_ad_network_adsense_impl$0_1$amp_ad_network_adsense_impl$$ = function($$jscomp$super$this$jscomp$9_element$jscomp$289$$) {
  $$jscomp$super$this$jscomp$9_element$jscomp$289$$ = _.$AmpA4A$$module$extensions$amp_a4a$0_1$amp_a4a$$.call(this, $$jscomp$super$this$jscomp$9_element$jscomp$289$$) || this;
  $$jscomp$super$this$jscomp$9_element$jscomp$289$$.$uniqueSlotId_$ = null;
  $$jscomp$super$this$jscomp$9_element$jscomp$289$$.$ampAnalyticsConfig_$ = null;
  $$jscomp$super$this$jscomp$9_element$jscomp$289$$.$extensions_$ = _.$Services$$module$src$services$extensionsFor$$($$jscomp$super$this$jscomp$9_element$jscomp$289$$.$win$);
  $$jscomp$super$this$jscomp$9_element$jscomp$289$$.$size_$ = null;
  $$jscomp$super$this$jscomp$9_element$jscomp$289$$.$ampAnalyticsElement_$ = null;
  $$jscomp$super$this$jscomp$9_element$jscomp$289$$.$qqid_$ = null;
  $$jscomp$super$this$jscomp$9_element$jscomp$289$$.$responsiveAligned_$ = !1;
  $$jscomp$super$this$jscomp$9_element$jscomp$289$$.$autoFormat_$ = null;
  $$jscomp$super$this$jscomp$9_element$jscomp$289$$.$identityTokenPromise_$ = null;
  $$jscomp$super$this$jscomp$9_element$jscomp$289$$.$isAmpCreative_$ = null;
  $$jscomp$super$this$jscomp$9_element$jscomp$289$$.$ifi_$ = 0;
  $$jscomp$super$this$jscomp$9_element$jscomp$289$$.$shouldSandbox_$ = !1;
  return $$jscomp$super$this$jscomp$9_element$jscomp$289$$;
}, $JSCompiler_StaticMethods_getRafmtParam_$$ = function($JSCompiler_StaticMethods_getRafmtParam_$self$$) {
  if ($JSCompiler_StaticMethods_getRafmtParam_$self$$.$autoFormat_$) {
    switch($JSCompiler_StaticMethods_getRafmtParam_$self$$.$autoFormat_$) {
      case "rspv":
        return 13;
      case "mcrspv":
        return 15;
    }
  }
  return null;
}, $JSCompiler_StaticMethods_divertExperiments$$ = function($JSCompiler_StaticMethods_divertExperiments$self$$) {
  var $$jscomp$compprop27_experimentInfoMap$jscomp$1$$ = {};
  $$jscomp$compprop27_experimentInfoMap$jscomp$1$$ = ($$jscomp$compprop27_experimentInfoMap$jscomp$1$$["as-use-attr-for-format"] = {$isTrafficEligible$:function() {
    return !$JSCompiler_StaticMethods_getRafmtParam_$$($JSCompiler_StaticMethods_divertExperiments$self$$) && 0 < Number($JSCompiler_StaticMethods_divertExperiments$self$$.element.getAttribute("width")) && 0 < Number($JSCompiler_StaticMethods_divertExperiments$self$$.element.getAttribute("height"));
  }, $branches$:["21062003", "21062004"]}, $$jscomp$compprop27_experimentInfoMap$jscomp$1$$);
  var $setExps$$ = _.$randomlySelectUnsetExperiments$$module$src$experiments$$($JSCompiler_StaticMethods_divertExperiments$self$$.$win$, $$jscomp$compprop27_experimentInfoMap$jscomp$1$$);
  Object.keys($setExps$$).forEach(function($$jscomp$compprop27_experimentInfoMap$jscomp$1$$) {
    return _.$addExperimentIdToElement$$module$ads$google$a4a$traffic_experiments$$($setExps$$[$$jscomp$compprop27_experimentInfoMap$jscomp$1$$], $JSCompiler_StaticMethods_divertExperiments$self$$.element);
  });
}, $JSCompiler_StaticMethods_adKey_$$ = function($JSCompiler_StaticMethods_adKey_$self_element$jscomp$290$$, $format$jscomp$15_string$jscomp$15$$) {
  $JSCompiler_StaticMethods_adKey_$self_element$jscomp$290$$ = $JSCompiler_StaticMethods_adKey_$self_element$jscomp$290$$.element;
  $format$jscomp$15_string$jscomp$15$$ = ($JSCompiler_StaticMethods_adKey_$self_element$jscomp$290$$.getAttribute("data-ad-slot") || "") + ":" + $format$jscomp$15_string$jscomp$15$$ + ":" + _.$domFingerprintPlain$$module$src$utils$dom_fingerprint$$($JSCompiler_StaticMethods_adKey_$self_element$jscomp$290$$);
  return _.$stringHash32$$module$src$string$$($format$jscomp$15_string$jscomp$15$$);
};
$AdsenseSharedState$$module$extensions$amp_ad_network_adsense_impl$0_1$adsense_shared_state$$.prototype.reset = function() {
  this.$D$ = [];
};
var $sharedState$$module$extensions$amp_ad_network_adsense_impl$0_1$amp_ad_network_adsense_impl$$ = new $AdsenseSharedState$$module$extensions$amp_ad_network_adsense_impl$0_1$adsense_shared_state$$;
_.$$jscomp$inherits$$($AmpAdNetworkAdsenseImpl$$module$extensions$amp_ad_network_adsense_impl$0_1$amp_ad_network_adsense_impl$$, _.$AmpA4A$$module$extensions$amp_a4a$0_1$amp_a4a$$);
_.$JSCompiler_prototypeAlias$$ = $AmpAdNetworkAdsenseImpl$$module$extensions$amp_ad_network_adsense_impl$0_1$amp_ad_network_adsense_impl$$.prototype;
_.$JSCompiler_prototypeAlias$$.isValidElement = function() {
  if ($JSCompiler_StaticMethods_getRafmtParam_$$(this)) {
    if (!this.element.hasAttribute("data-full-width")) {
      return _.$user$$module$src$log$$().$Log$$module$src$log_prototype$warn$("amp-ad-network-adsense-impl", "Responsive AdSense ad units require the attribute data-full-width."), !1;
    }
    var $height$jscomp$23$$ = this.element.getAttribute("height"), $width$jscomp$26$$ = this.element.getAttribute("width");
    if (320 != $height$jscomp$23$$) {
      return _.$user$$module$src$log$$().$Log$$module$src$log_prototype$warn$("amp-ad-network-adsense-impl", "Specified height " + $height$jscomp$23$$ + " in <amp-ad> tag is not equal to the required height of 320 for responsive AdSense ad units."), !1;
    }
    if ("100vw" != $width$jscomp$26$$) {
      return _.$user$$module$src$log$$().$Log$$module$src$log_prototype$warn$("amp-ad-network-adsense-impl", "Invalid width " + $width$jscomp$26$$ + " for full-width responsive <amp-ad> tag. Width must be 100vw."), !1;
    }
  }
  return !!this.element.getAttribute("data-ad-client") && _.$JSCompiler_StaticMethods_isAmpAdElement$$(this);
};
_.$JSCompiler_prototypeAlias$$.$delayAdRequestEnabled$ = function() {
  return !0;
};
_.$JSCompiler_prototypeAlias$$.$buildCallback$ = function() {
  var $$jscomp$this$jscomp$313$$ = this;
  _.$AmpA4A$$module$extensions$amp_a4a$0_1$amp_a4a$$.prototype.$buildCallback$.call(this);
  this.$identityTokenPromise_$ = _.$Services$$module$src$services$viewerForDoc$$(this.$getAmpDoc$()).$D$.then(function() {
    return _.$getIdentityToken$$module$ads$google$a4a$utils$$($$jscomp$this$jscomp$313$$.$win$, $$jscomp$this$jscomp$313$$.$getAmpDoc$(), _.$AmpA4A$$module$extensions$amp_a4a$0_1$amp_a4a$$.prototype.$getConsentPolicy$.call($$jscomp$this$jscomp$313$$));
  });
  this.$autoFormat_$ = this.element.getAttribute("data-auto-format") || "";
  if ($JSCompiler_StaticMethods_getRafmtParam_$$(this)) {
    var $viewportSize$jscomp$5$$ = this.$getViewport$().$getSize$();
    a: {
      switch(this.$autoFormat_$) {
        case "rspv":
          var $JSCompiler_inline_result$jscomp$606$$ = _.$clamp$$module$src$utils$math$$(Math.round($viewportSize$jscomp$5$$.width / 1.2), 100, Math.min(300, $viewportSize$jscomp$5$$.height));
          break a;
        case "mcrspv":
          $JSCompiler_inline_result$jscomp$606$$ = _.$getMatchedContentResponsiveHeight$$module$ads$google$utils$$($viewportSize$jscomp$5$$.width);
          break a;
        default:
          $JSCompiler_inline_result$jscomp$606$$ = 0;
      }
    }
    return this.$attemptChangeSize$($JSCompiler_inline_result$jscomp$606$$, $viewportSize$jscomp$5$$.width).catch(function() {
    });
  }
  $JSCompiler_StaticMethods_divertExperiments$$(this);
};
_.$JSCompiler_prototypeAlias$$.$getConsentPolicy$ = function() {
  return null;
};
_.$JSCompiler_prototypeAlias$$.$getAdUrl$ = function($ampAutoAdsBranch_consentState$jscomp$3$$) {
  var $$jscomp$this$jscomp$315$$ = this;
  if (4 == $ampAutoAdsBranch_consentState$jscomp$3$$ && "true" != this.element.getAttribute("data-npa-on-unknown-consent")) {
    return _.$user$$module$src$log$$().$Log$$module$src$log_prototype$info$("amp-ad-network-adsense-impl", "Ad request suppressed due to unknown consent"), window.Promise.resolve("");
  }
  var $startTime$jscomp$15$$ = Date.now(), $ampAutoAdsResponsiveBranch_global$jscomp$9$$ = this.$win$, $adClientId$$ = this.element.getAttribute("data-ad-client");
  $adClientId$$ = $adClientId$$.toLowerCase();
  "ca-" != $adClientId$$.substring(0, 3) && ($adClientId$$ = "ca-" + $adClientId$$);
  var $adTestOn$$ = this.element.getAttribute("data-adtest") || _.$isInExperiment$$module$ads$google$a4a$traffic_experiments$$(this.element), $format$jscomp$14_width$jscomp$27$$ = Number(this.element.getAttribute("width")), $adk_height$jscomp$24$$ = Number(this.element.getAttribute("height"));
  this.$size_$ = "21062004" == _.$getExperimentBranch$$module$src$experiments$$(this.$win$, "as-use-attr-for-format") ? {width:$format$jscomp$14_width$jscomp$27$$, height:$adk_height$jscomp$24$$} : this.$getIntersectionElementLayoutBox$();
  $format$jscomp$14_width$jscomp$27$$ = this.$size_$.width + "x" + this.$size_$.height;
  var $slotId$jscomp$1_slotname$jscomp$1$$ = this.element.getAttribute("data-amp-slot-index");
  $adk_height$jscomp$24$$ = $JSCompiler_StaticMethods_adKey_$$(this, $format$jscomp$14_width$jscomp$27$$);
  this.$uniqueSlotId_$ = $slotId$jscomp$1_slotname$jscomp$1$$ + $adk_height$jscomp$24$$;
  $slotId$jscomp$1_slotname$jscomp$1$$ = this.element.getAttribute("data-ad-slot");
  var $sharedStateParams$$ = $JSCompiler_StaticMethods_addNewSlot$$($format$jscomp$14_width$jscomp$27$$, this.$uniqueSlotId_$, $adClientId$$, $slotId$jscomp$1_slotname$jscomp$1$$), $viewportSize$jscomp$6$$ = this.$getViewport$().$getSize$();
  this.$ifi_$ || (this.$win$.ampAdGoogleIfiCounter = this.$win$.ampAdGoogleIfiCounter || 1, this.$ifi_$ = this.$win$.ampAdGoogleIfiCounter++);
  var $enclosingContainers$jscomp$1_pfx$$ = _.$getEnclosingContainerTypes$$module$ads$google$a4a$utils$$(this.element);
  $enclosingContainers$jscomp$1_pfx$$ = $enclosingContainers$jscomp$1_pfx$$.includes(_.$ValidAdContainerTypes$$module$ads$google$a4a$utils$$["AMP-FX-FLYING-CARPET"]) || $enclosingContainers$jscomp$1_pfx$$.includes(_.$ValidAdContainerTypes$$module$ads$google$a4a$utils$$["AMP-STICKY-AD"]);
  var $parameters$jscomp$2$$ = {client:$adClientId$$, format:$format$jscomp$14_width$jscomp$27$$, w:this.$size_$.width, h:this.$size_$.height, iu:$slotId$jscomp$1_slotname$jscomp$1$$, npa:2 == $ampAutoAdsBranch_consentState$jscomp$3$$ || 4 == $ampAutoAdsBranch_consentState$jscomp$3$$ ? 1 : null, adtest:$adTestOn$$ ? "on" : null, $adk$:$adk_height$jscomp$24$$, output:"html", bc:$ampAutoAdsResponsiveBranch_global$jscomp$9$$.$SVGElement$ && $ampAutoAdsResponsiveBranch_global$jscomp$9$$.document.createElementNS ? 
  "1" : null, ctypes:null, host:this.element.getAttribute("data-ad-host"), hl:this.element.getAttribute("data-language"), to:this.element.getAttribute("data-tag-origin"), pv:$sharedStateParams$$.$pv$, channel:this.element.getAttribute("data-ad-channel"), wgl:$ampAutoAdsResponsiveBranch_global$jscomp$9$$.WebGLRenderingContext ? "1" : "0", asnt:this.sentinel, dff:_.$computedStyle$$module$src$style$$(this.$win$, this.element)["font-family"], prev_fmts:$sharedStateParams$$.$prevFmts$ || null, prev_slotnames:$sharedStateParams$$.$prevSlotnames$ || 
  null, brdim:$additionalDimensions$$module$ads$google$a4a$utils$$(this.$win$, $viewportSize$jscomp$6$$), ifi:this.$ifi_$, rc:this.$fromResumeCallback$ ? 1 : null, rafmt:$JSCompiler_StaticMethods_getRafmtParam_$$(this), pfx:$enclosingContainers$jscomp$1_pfx$$ ? "1" : "0", crui:this.element.getAttribute("data-matched-content-ui-type"), cr_row:this.element.getAttribute("data-matched-content-rows-num"), cr_col:this.element.getAttribute("data-matched-content-columns-num"), pwprc:this.element.getAttribute("data-package")}, 
  $experimentIds$jscomp$1$$ = [];
  $ampAutoAdsBranch_consentState$jscomp$3$$ = _.$getAdSenseAmpAutoAdsExpBranch$$module$ads$google$adsense_amp_auto_ads$$(this.$win$);
  $ampAutoAdsResponsiveBranch_global$jscomp$9$$ = _.$getAdSenseAmpAutoAdsResponsiveExperimentBranch$$module$ads$google$adsense_amp_auto_ads_responsive$$(this.$win$);
  $ampAutoAdsBranch_consentState$jscomp$3$$ && $experimentIds$jscomp$1$$.push($ampAutoAdsBranch_consentState$jscomp$3$$);
  $ampAutoAdsResponsiveBranch_global$jscomp$9$$ && $experimentIds$jscomp$1$$.push($ampAutoAdsResponsiveBranch_global$jscomp$9$$);
  return _.$JSCompiler_StaticMethods_timeoutPromise$$(_.$Services$$module$src$services$timerFor$$(this.$win$), 1000, this.$identityTokenPromise_$).catch(function() {
    return {};
  }).then(function($ampAutoAdsBranch_consentState$jscomp$3$$) {
    return _.$googleAdUrl$$module$ads$google$a4a$utils$$($$jscomp$this$jscomp$315$$, "https://googleads.g.doubleclick.net/pagead/ads", $startTime$jscomp$15$$, Object.assign({$adsid$:$ampAutoAdsBranch_consentState$jscomp$3$$.$token$ || null, $jar$:$ampAutoAdsBranch_consentState$jscomp$3$$.$jar$ || null, $pucrd$:$ampAutoAdsBranch_consentState$jscomp$3$$.$pucrd$ || null}, $parameters$jscomp$2$$), $experimentIds$jscomp$1$$);
  });
};
_.$JSCompiler_prototypeAlias$$.$onNetworkFailure$ = function($error$jscomp$45$$, $adUrl$jscomp$7$$) {
  _.$dev$$module$src$log$$().$Log$$module$src$log_prototype$info$("amp-ad-network-adsense-impl", "network error, attempt adding of error parameter", $error$jscomp$45$$);
  return {$adUrl$:_.$maybeAppendErrorParameter$$module$ads$google$a4a$utils$$($adUrl$jscomp$7$$)};
};
_.$JSCompiler_prototypeAlias$$.$extractSize$ = function($responseHeaders$jscomp$2$$) {
  this.$ampAnalyticsConfig_$ = _.$extractAmpAnalyticsConfig$$module$ads$google$a4a$utils$$($responseHeaders$jscomp$2$$);
  this.$qqid_$ = $responseHeaders$jscomp$2$$.get("X-QQID");
  this.$shouldSandbox_$ = "true" == $responseHeaders$jscomp$2$$.get("amp-ff-sandbox");
  this.$ampAnalyticsConfig_$ && _.$JSCompiler_StaticMethods_installExtensionForDoc$$(this.$extensions_$, this.$getAmpDoc$(), "amp-analytics");
  return this.$size_$;
};
_.$JSCompiler_prototypeAlias$$.$isXhrAllowed$ = function() {
  return _.$isCdnProxy$$module$ads$google$a4a$utils$$(this.$win$) || !1;
};
_.$JSCompiler_prototypeAlias$$.$sandboxHTMLCreativeFrame$ = function() {
  return this.$shouldSandbox_$;
};
_.$JSCompiler_prototypeAlias$$.$onCreativeRender$ = function($creativeMetaData$jscomp$3$$) {
  _.$AmpA4A$$module$extensions$amp_a4a$0_1$amp_a4a$$.prototype.$onCreativeRender$.call(this, $creativeMetaData$jscomp$3$$);
  this.$isAmpCreative_$ = !!$creativeMetaData$jscomp$3$$;
  $creativeMetaData$jscomp$3$$ && !$creativeMetaData$jscomp$3$$.$customElementExtensions$.includes("amp-ad-exit") && _.$Navigation$$module$src$service$navigation$installAnchorClickInterceptor$$(this.$getAmpDoc$(), this.iframe.contentWindow);
  this.$ampAnalyticsConfig_$ && (_.$isReportingEnabled$$module$ads$google$a4a$utils$$(this) && _.$addCsiSignalsToAmpAnalyticsConfig$$module$ads$google$a4a$utils$$(this.$win$, this.element, this.$ampAnalyticsConfig_$, this.$qqid_$, !!$creativeMetaData$jscomp$3$$), this.$ampAnalyticsElement_$ = _.$insertAnalyticsElement$$module$src$extension_analytics$$(this.element, this.$ampAnalyticsConfig_$, !!this.$postAdResponseExperimentFeatures$.avr_disable_immediate));
  _.$setStyles$$module$src$style$$(this.iframe, {width:this.$size_$.width + "px", height:this.$size_$.height + "px"});
  this.$qqid_$ && this.element.setAttribute("data-google-query-id", this.$qqid_$);
  this.iframe.id = "google_ads_iframe_" + this.$ifi_$;
};
_.$JSCompiler_prototypeAlias$$.$unlayoutCallback$ = function() {
  if (this.$isAmpCreative_$) {
    return !1;
  }
  var $superResult$$ = _.$AmpA4A$$module$extensions$amp_a4a$0_1$amp_a4a$$.prototype.$unlayoutCallback$.call(this);
  this.element.setAttribute("data-amp-slot-index", this.$win$.$ampAdSlotIdCounter$++);
  this.$uniqueSlotId_$ && $JSCompiler_StaticMethods_removeSlot$$(this.$uniqueSlotId_$);
  this.$ampAnalyticsElement_$ && (_.$removeElement$$module$src$dom$$(this.$ampAnalyticsElement_$), this.$ampAnalyticsElement_$ = null);
  this.$isAmpCreative_$ = this.$qqid_$ = this.$ampAnalyticsConfig_$ = null;
  this.$shouldSandbox_$ = !1;
  return $superResult$$;
};
_.$JSCompiler_prototypeAlias$$.$onLayoutMeasure$ = function() {
  var $$jscomp$this$jscomp$316$$ = this;
  _.$AmpA4A$$module$extensions$amp_a4a$0_1$amp_a4a$$.prototype.$onLayoutMeasure$.call(this);
  if ($JSCompiler_StaticMethods_getRafmtParam_$$(this) && !this.$responsiveAligned_$) {
    this.$responsiveAligned_$ = !0;
    var $layoutBox$jscomp$3$$ = this.$getLayoutBox$();
    _.$JSCompiler_StaticMethods_Vsync$$module$src$service$vsync_impl_prototype$run$$(_.$JSCompiler_StaticMethods_getVsync$$(this), {measure:function($layoutBox$jscomp$3$$) {
      $layoutBox$jscomp$3$$.direction = _.$computedStyle$$module$src$style$$($$jscomp$this$jscomp$316$$.$win$, $$jscomp$this$jscomp$316$$.element.parentElement).direction;
    }, $mutate$:function($state$jscomp$40$$) {
      "rtl" == $state$jscomp$40$$.direction ? _.$setStyle$$module$src$style$$($$jscomp$this$jscomp$316$$.element, "marginRight", $layoutBox$jscomp$3$$.left, "px") : _.$setStyle$$module$src$style$$($$jscomp$this$jscomp$316$$.element, "marginLeft", -$layoutBox$jscomp$3$$.left, "px");
    }}, {direction:""});
  }
};
_.$JSCompiler_prototypeAlias$$.$getPreconnectUrls$ = function() {
  this.$preconnect$.$preload$(_.$getDefaultBootstrapBaseUrl$$module$src$3p_frame$$(this.$win$, "nameframe"));
  return ["https://googleads.g.doubleclick.net"];
};
_.$JSCompiler_prototypeAlias$$.$getA4aAnalyticsVars$ = function($analyticsTrigger$jscomp$1$$) {
  return _.$getCsiAmpAnalyticsVariables$$module$ads$google$a4a$utils$$($analyticsTrigger$jscomp$1$$, this, this.$qqid_$);
};
_.$JSCompiler_prototypeAlias$$.$getA4aAnalyticsConfig$ = function() {
  return _.$getCsiAmpAnalyticsConfig$$module$ads$google$a4a$utils$$();
};
window.self.AMP.registerElement("amp-ad-network-adsense-impl", $AmpAdNetworkAdsenseImpl$$module$extensions$amp_ad_network_adsense_impl$0_1$amp_ad_network_adsense_impl$$);

})});
