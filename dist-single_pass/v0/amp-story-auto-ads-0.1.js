(self.AMP=self.AMP||[]).push({n:"amp-story-auto-ads",i:["_base_i","_base_misc"],v:"1901181729101",f:(function(AMP,_){
var $AmpStoryAutoAds$$module$extensions$amp_story_auto_ads$0_1$amp_story_auto_ads$$ = function($$jscomp$super$this$jscomp$97_element$jscomp$550$$) {
  $$jscomp$super$this$jscomp$97_element$jscomp$550$$ = window.AMP.BaseElement.call(this, $$jscomp$super$this$jscomp$97_element$jscomp$550$$) || this;
  $$jscomp$super$this$jscomp$97_element$jscomp$550$$.$ampStory_$ = null;
  $$jscomp$super$this$jscomp$97_element$jscomp$550$$.$navigationState_$ = null;
  $$jscomp$super$this$jscomp$97_element$jscomp$550$$.$uniquePagesCount_$ = 0;
  $$jscomp$super$this$jscomp$97_element$jscomp$550$$.$uniquePageIds_$ = _.$dict$$module$src$utils$object$$({});
  $$jscomp$super$this$jscomp$97_element$jscomp$550$$.$adPageEls_$ = [];
  $$jscomp$super$this$jscomp$97_element$jscomp$550$$.$timeCurrentPageCreated_$ = -window.Infinity;
  $$jscomp$super$this$jscomp$97_element$jscomp$550$$.$adsPlaced_$ = 0;
  $$jscomp$super$this$jscomp$97_element$jscomp$550$$.$adPagesCreated_$ = 0;
  $$jscomp$super$this$jscomp$97_element$jscomp$550$$.$currentAdElement_$ = null;
  $$jscomp$super$this$jscomp$97_element$jscomp$550$$.$isCurrentAdLoaded_$ = !1;
  $$jscomp$super$this$jscomp$97_element$jscomp$550$$.$config_$ = {};
  $$jscomp$super$this$jscomp$97_element$jscomp$550$$.$analyticsData_$ = {};
  $$jscomp$super$this$jscomp$97_element$jscomp$550$$.$adPageIds_$ = {};
  $$jscomp$super$this$jscomp$97_element$jscomp$550$$.$idOfAdShowing_$ = null;
  $$jscomp$super$this$jscomp$97_element$jscomp$550$$.$firstAdViewed_$ = !1;
  $$jscomp$super$this$jscomp$97_element$jscomp$550$$.$pendingAdView_$ = !1;
  $$jscomp$super$this$jscomp$97_element$jscomp$550$$.$storeService_$ = null;
  return $$jscomp$super$this$jscomp$97_element$jscomp$550$$;
}, $JSCompiler_StaticMethods_schedulePage_$$ = function($JSCompiler_StaticMethods_schedulePage_$self$$) {
  var $page$jscomp$1$$ = $JSCompiler_StaticMethods_createAdPage_$$($JSCompiler_StaticMethods_schedulePage_$self$$);
  $JSCompiler_StaticMethods_schedulePage_$self$$.$adPageEls_$.push($page$jscomp$1$$);
  $JSCompiler_StaticMethods_schedulePage_$self$$.$ampStory_$.element.appendChild($page$jscomp$1$$);
  var $$jscomp$compprop45$$ = {};
  $JSCompiler_StaticMethods_analyticsEventWithCurrentAd_$$($JSCompiler_StaticMethods_schedulePage_$self$$, "story-ad-request", ($$jscomp$compprop45$$.requestTime = Date.now(), $$jscomp$compprop45$$));
  $page$jscomp$1$$.$getImpl$().then(function($page$jscomp$1$$) {
    $JSCompiler_StaticMethods_schedulePage_$self$$.$ampStory_$.$addPage$($page$jscomp$1$$);
    $JSCompiler_StaticMethods_schedulePage_$self$$.$timeCurrentPageCreated_$ = Date.now();
  });
}, $JSCompiler_StaticMethods_createAdPage_$$ = function($JSCompiler_StaticMethods_createAdPage_$self$$) {
  var $ampStoryAdPage$$ = $JSCompiler_StaticMethods_createPageElement_$$($JSCompiler_StaticMethods_createAdPage_$self$$), $ampAd$jscomp$1$$ = $JSCompiler_StaticMethods_AmpStoryAutoAds$$module$extensions$amp_story_auto_ads$0_1$amp_story_auto_ads_prototype$createAdElement_$$($JSCompiler_StaticMethods_createAdPage_$self$$), $glassPane$$ = $JSCompiler_StaticMethods_createAdPage_$self$$.$win$.document.createElement("div");
  $glassPane$$.classList.add("i-amphtml-glass-pane");
  var $gridLayer$$ = $JSCompiler_StaticMethods_createAdPage_$self$$.$win$.document.createElement("amp-story-grid-layer");
  $gridLayer$$.setAttribute("template", "fill");
  var $paneGridLayer$$ = $gridLayer$$.cloneNode(!1);
  $gridLayer$$.appendChild($ampAd$jscomp$1$$);
  $paneGridLayer$$.appendChild($glassPane$$);
  $ampStoryAdPage$$.appendChild($gridLayer$$);
  $ampStoryAdPage$$.appendChild($paneGridLayer$$);
  $JSCompiler_StaticMethods_createAdPage_$self$$.$currentAdElement_$ = $ampAd$jscomp$1$$;
  $JSCompiler_StaticMethods_createAdPage_$self$$.$isCurrentAdLoaded_$ = !1;
  $ampAd$jscomp$1$$.$getImpl$().then(function($JSCompiler_StaticMethods_createAdPage_$self$$) {
    return $JSCompiler_StaticMethods_createAdPage_$self$$.signals().whenSignal("ini-load");
  }).then(function() {
    $ampStoryAdPage$$.$getImpl$().then(function($JSCompiler_StaticMethods_createAdPage_$self$$) {
      return $JSCompiler_StaticMethods_createAdPage_$self$$.$delegateVideoAutoplay$();
    });
    $JSCompiler_StaticMethods_createAdPage_$self$$.$adPageEls_$[$JSCompiler_StaticMethods_createAdPage_$self$$.$adPageEls_$.length - 1].removeAttribute("i-amphtml-loading");
    var $ampAd$jscomp$1$$ = {};
    $JSCompiler_StaticMethods_analyticsEventWithCurrentAd_$$($JSCompiler_StaticMethods_createAdPage_$self$$, "story-ad-load", ($ampAd$jscomp$1$$.loadTime = Date.now(), $ampAd$jscomp$1$$));
    $JSCompiler_StaticMethods_createAdPage_$self$$.$isCurrentAdLoaded_$ = !0;
  });
  return $ampStoryAdPage$$;
}, $JSCompiler_StaticMethods_createPageElement_$$ = function($JSCompiler_StaticMethods_createPageElement_$self$$) {
  var $id$jscomp$90$$ = ++$JSCompiler_StaticMethods_createPageElement_$self$$.$adPagesCreated_$, $pageId$jscomp$1$$ = "i-amphtml-ad-page-" + $id$jscomp$90$$;
  $JSCompiler_StaticMethods_createPageElement_$self$$.$adPageIds_$[$pageId$jscomp$1$$] = $id$jscomp$90$$;
  var $$jscomp$compprop47$$ = {}, $JSCompiler_temp_const$jscomp$858$$ = $JSCompiler_StaticMethods_createPageElement_$self$$.$analyticsData_$;
  $$jscomp$compprop47$$.adIndex = $id$jscomp$90$$;
  var $JSCompiler_inline_result$jscomp$859_win$jscomp$inline_4086$$ = $JSCompiler_StaticMethods_createPageElement_$self$$.$win$;
  var $uint8array$jscomp$inline_4087$$ = _.$getCryptoRandomBytesArray$$module$src$utils$bytes$$($JSCompiler_inline_result$jscomp$859_win$jscomp$inline_4086$$, 16);
  $JSCompiler_inline_result$jscomp$859_win$jscomp$inline_4086$$ = $uint8array$jscomp$inline_4087$$ ? $uint8array$jscomp$inline_4087$$.join("") : String($JSCompiler_inline_result$jscomp$859_win$jscomp$inline_4086$$.location.href + Date.now() + $JSCompiler_inline_result$jscomp$859_win$jscomp$inline_4086$$.Math.random() + $JSCompiler_inline_result$jscomp$859_win$jscomp$inline_4086$$.screen.width + $JSCompiler_inline_result$jscomp$859_win$jscomp$inline_4086$$.screen.height);
  $JSCompiler_temp_const$jscomp$858$$[$id$jscomp$90$$] = ($$jscomp$compprop47$$.adUniqueId = $JSCompiler_inline_result$jscomp$859_win$jscomp$inline_4086$$, $$jscomp$compprop47$$);
  return _.$createElementWithAttributes$$module$src$dom$$($JSCompiler_StaticMethods_createPageElement_$self$$.$win$.document, "amp-story-page", _.$dict$$module$src$utils$object$$({id:$pageId$jscomp$1$$, ad:"", distance:"2", "i-amphtml-loading":""}));
}, $JSCompiler_StaticMethods_AmpStoryAutoAds$$module$extensions$amp_story_auto_ads$0_1$amp_story_auto_ads_prototype$createAdElement_$$ = function($JSCompiler_StaticMethods_AmpStoryAutoAds$$module$extensions$amp_story_auto_ads$0_1$amp_story_auto_ads_prototype$createAdElement_$self$$) {
  var $attributes$jscomp$27_configAttrs$$ = $JSCompiler_StaticMethods_AmpStoryAutoAds$$module$extensions$amp_story_auto_ads$0_1$amp_story_auto_ads_prototype$createAdElement_$self$$.$config_$["ad-attributes"], $attr$jscomp$29$$;
  for ($attr$jscomp$29$$ in $attributes$jscomp$27_configAttrs$$) {
    var $value$jscomp$287$$ = $attributes$jscomp$27_configAttrs$$[$attr$jscomp$29$$];
    _.$isObject$$module$src$types$$($value$jscomp$287$$) && ($attributes$jscomp$27_configAttrs$$[$attr$jscomp$29$$] = JSON.stringify($value$jscomp$287$$));
    $DISALLOWED_AD_ATTRS$$module$extensions$amp_story_auto_ads$0_1$amp_story_auto_ads$$[$attr$jscomp$29$$] && (_.$user$$module$src$log$$().$Log$$module$src$log_prototype$warn$("amp-story-auto-ads", 'ad-attribute "%s" is not allowed', $attr$jscomp$29$$), delete $attributes$jscomp$27_configAttrs$$[$attr$jscomp$29$$]);
  }
  $attributes$jscomp$27_configAttrs$$ = Object.assign({}, $attributes$jscomp$27_configAttrs$$, {"class":"i-amphtml-story-ad", layout:"fill", "amp-story":""});
  return _.$createElementWithAttributes$$module$src$dom$$($JSCompiler_StaticMethods_AmpStoryAutoAds$$module$extensions$amp_story_auto_ads$0_1$amp_story_auto_ads_prototype$createAdElement_$self$$.$win$.document, "amp-ad", $attributes$jscomp$27_configAttrs$$);
}, $JSCompiler_StaticMethods_createCtaLayer_$$ = function($JSCompiler_StaticMethods_createCtaLayer_$self$$, $adPageElement$jscomp$1$$, $ctaLayer_ctaText$jscomp$1$$, $ctaUrl$jscomp$1$$) {
  var $a$jscomp$282$$ = $JSCompiler_StaticMethods_createCtaLayer_$self$$.$win$.document.createElement("a");
  $a$jscomp$282$$.className = "i-amphtml-story-ad-link";
  $a$jscomp$282$$.setAttribute("target", "_blank");
  _.$setStyles$$module$src$style$$($a$jscomp$282$$, {"font-size":"0", $opactiy$:"0", transform:"scale(0)"});
  $a$jscomp$282$$.href = $ctaUrl$jscomp$1$$;
  $a$jscomp$282$$.textContent = $ctaLayer_ctaText$jscomp$1$$;
  if ("https:" !== $a$jscomp$282$$.protocol && "http:" !== $a$jscomp$282$$.protocol) {
    return _.$user$$module$src$log$$().$Log$$module$src$log_prototype$warn$("amp-story-auto-ads", "CTA url is not valid. Ad was discarded"), !1;
  }
  var $adIndex$jscomp$1$$ = $JSCompiler_StaticMethods_createCtaLayer_$self$$.$adPagesCreated_$;
  $a$jscomp$282$$.addEventListener("click", function() {
    var $adPageElement$jscomp$1$$ = {};
    $adPageElement$jscomp$1$$ = ($adPageElement$jscomp$1$$.adIndex = $adIndex$jscomp$1$$, $adPageElement$jscomp$1$$.clickTime = Date.now(), $adPageElement$jscomp$1$$);
    $JSCompiler_StaticMethods_AmpStoryAutoAds$$module$extensions$amp_story_auto_ads$0_1$amp_story_auto_ads_prototype$analyticsEvent_$$($JSCompiler_StaticMethods_createCtaLayer_$self$$, "story-ad-click", $adPageElement$jscomp$1$$);
  });
  $ctaLayer_ctaText$jscomp$1$$ = $JSCompiler_StaticMethods_createCtaLayer_$self$$.$win$.document.createElement("amp-story-cta-layer");
  $ctaLayer_ctaText$jscomp$1$$.appendChild($a$jscomp$282$$);
  $adPageElement$jscomp$1$$.appendChild($ctaLayer_ctaText$jscomp$1$$);
  return !0;
}, $JSCompiler_StaticMethods_startNextAdPage_$$ = function($JSCompiler_StaticMethods_startNextAdPage_$self$$, $opt_failure$$) {
  $JSCompiler_StaticMethods_startNextAdPage_$self$$.$firstAdViewed_$ || ($JSCompiler_StaticMethods_startNextAdPage_$self$$.$firstAdViewed_$ = !0);
  $opt_failure$$ || ($JSCompiler_StaticMethods_startNextAdPage_$self$$.$uniquePagesCount_$ = 0);
  $JSCompiler_StaticMethods_schedulePage_$$($JSCompiler_StaticMethods_startNextAdPage_$self$$);
}, $JSCompiler_StaticMethods_tryToPlaceAdAfterPage_$$ = function($JSCompiler_StaticMethods_tryToPlaceAdAfterPage_$self$$, $pageBeforeAdId_pageNumber$$) {
  var $adIndex$jscomp$3_nextAdPageEl$$ = $JSCompiler_StaticMethods_tryToPlaceAdAfterPage_$self$$.$adPageEls_$[$JSCompiler_StaticMethods_tryToPlaceAdAfterPage_$self$$.$adPageEls_$.length - 1];
  if (!$JSCompiler_StaticMethods_tryToPlaceAdAfterPage_$self$$.$isCurrentAdLoaded_$ && 10000 < Date.now() - $JSCompiler_StaticMethods_tryToPlaceAdAfterPage_$self$$.$timeCurrentPageCreated_$) {
    return 2;
  }
  var $JSCompiler_inline_result$jscomp$860_ctaUrl$jscomp$inline_4100_pageBeforeAd$$ = $JSCompiler_StaticMethods_tryToPlaceAdAfterPage_$self$$.$ampStory_$.$getPageById$($pageBeforeAdId_pageNumber$$), $ctaType$jscomp$inline_4101_pageAfterAd$$ = $JSCompiler_StaticMethods_tryToPlaceAdAfterPage_$self$$.$ampStory_$.$getNextPage$($JSCompiler_inline_result$jscomp$860_ctaUrl$jscomp$inline_4100_pageBeforeAd$$);
  if (!$ctaType$jscomp$inline_4101_pageAfterAd$$) {
    return 0;
  }
  $JSCompiler_StaticMethods_tryToPlaceAdAfterPage_$self$$.$isDesktopView_$() && ($JSCompiler_inline_result$jscomp$860_ctaUrl$jscomp$inline_4100_pageBeforeAd$$ = $ctaType$jscomp$inline_4101_pageAfterAd$$, $pageBeforeAdId_pageNumber$$ = $ctaType$jscomp$inline_4101_pageAfterAd$$.element.id, $ctaType$jscomp$inline_4101_pageAfterAd$$ = $JSCompiler_StaticMethods_tryToPlaceAdAfterPage_$self$$.$ampStory_$.$getNextPage$($ctaType$jscomp$inline_4101_pageAfterAd$$));
  if (!$ctaType$jscomp$inline_4101_pageAfterAd$$ || !$JSCompiler_StaticMethods_tryToPlaceAdAfterPage_$self$$.$isCurrentAdLoaded_$ || $JSCompiler_inline_result$jscomp$860_ctaUrl$jscomp$inline_4100_pageBeforeAd$$.element.hasAttribute("next-page-no-ad") || $JSCompiler_inline_result$jscomp$860_ctaUrl$jscomp$inline_4100_pageBeforeAd$$.$isAd$() || $ctaType$jscomp$inline_4101_pageAfterAd$$.$isAd$()) {
    return 0;
  }
  $JSCompiler_inline_result$jscomp$860_ctaUrl$jscomp$inline_4100_pageBeforeAd$$ = $JSCompiler_StaticMethods_tryToPlaceAdAfterPage_$self$$.$currentAdElement_$.getAttribute("data-vars-ctaurl");
  $ctaType$jscomp$inline_4101_pageAfterAd$$ = $JSCompiler_StaticMethods_tryToPlaceAdAfterPage_$self$$.$currentAdElement_$.getAttribute("data-vars-ctatype");
  if ($JSCompiler_inline_result$jscomp$860_ctaUrl$jscomp$inline_4100_pageBeforeAd$$ && $ctaType$jscomp$inline_4101_pageAfterAd$$) {
    $JSCompiler_StaticMethods_tryToPlaceAdAfterPage_$self$$.$analyticsData_$[$JSCompiler_StaticMethods_tryToPlaceAdAfterPage_$self$$.$adPagesCreated_$].ctaType = $ctaType$jscomp$inline_4101_pageAfterAd$$;
    var $ctaText$jscomp$inline_4102$$ = $CTA_TYPES$$module$extensions$amp_story_auto_ads$0_1$amp_story_auto_ads$$[$ctaType$jscomp$inline_4101_pageAfterAd$$];
    $ctaType$jscomp$inline_4101_pageAfterAd$$ ? $JSCompiler_inline_result$jscomp$860_ctaUrl$jscomp$inline_4100_pageBeforeAd$$ = $JSCompiler_StaticMethods_createCtaLayer_$$($JSCompiler_StaticMethods_tryToPlaceAdAfterPage_$self$$, $adIndex$jscomp$3_nextAdPageEl$$, $ctaText$jscomp$inline_4102$$, $JSCompiler_inline_result$jscomp$860_ctaUrl$jscomp$inline_4100_pageBeforeAd$$) : (_.$user$$module$src$log$$().error("amp-story-auto-ads", 'invalid "CTA Type" in ad response'), $JSCompiler_inline_result$jscomp$860_ctaUrl$jscomp$inline_4100_pageBeforeAd$$ = 
    !1);
  } else {
    _.$user$$module$src$log$$().error("amp-story-auto-ads", 'Both CTA Type & CTA Url are required in ad-server response."'), $JSCompiler_inline_result$jscomp$860_ctaUrl$jscomp$inline_4100_pageBeforeAd$$ = !1;
  }
  if (!$JSCompiler_inline_result$jscomp$860_ctaUrl$jscomp$inline_4100_pageBeforeAd$$) {
    return 2;
  }
  $JSCompiler_StaticMethods_tryToPlaceAdAfterPage_$self$$.$ampStory_$.$insertPage$($pageBeforeAdId_pageNumber$$, $adIndex$jscomp$3_nextAdPageEl$$.id);
  $adIndex$jscomp$3_nextAdPageEl$$ = $JSCompiler_StaticMethods_tryToPlaceAdAfterPage_$self$$.$adPageIds_$[$adIndex$jscomp$3_nextAdPageEl$$.id];
  $pageBeforeAdId_pageNumber$$ = $JSCompiler_StaticMethods_tryToPlaceAdAfterPage_$self$$.$ampStory_$.$getPageIndexById$($pageBeforeAdId_pageNumber$$);
  $JSCompiler_StaticMethods_tryToPlaceAdAfterPage_$self$$.$analyticsData_$[$adIndex$jscomp$3_nextAdPageEl$$].position = $pageBeforeAdId_pageNumber$$ + 1;
  return 1;
}, $JSCompiler_StaticMethods_analyticsEventWithCurrentAd_$$ = function($JSCompiler_StaticMethods_analyticsEventWithCurrentAd_$self$$, $eventType$jscomp$61$$, $vars$jscomp$26$$) {
  var $$jscomp$compprop53$$ = {};
  Object.assign($vars$jscomp$26$$, ($$jscomp$compprop53$$.adIndex = $JSCompiler_StaticMethods_analyticsEventWithCurrentAd_$self$$.$adPagesCreated_$, $$jscomp$compprop53$$));
  $JSCompiler_StaticMethods_AmpStoryAutoAds$$module$extensions$amp_story_auto_ads$0_1$amp_story_auto_ads_prototype$analyticsEvent_$$($JSCompiler_StaticMethods_analyticsEventWithCurrentAd_$self$$, $eventType$jscomp$61$$, $vars$jscomp$26$$);
}, $JSCompiler_StaticMethods_AmpStoryAutoAds$$module$extensions$amp_story_auto_ads$0_1$amp_story_auto_ads_prototype$analyticsEvent_$$ = function($JSCompiler_StaticMethods_AmpStoryAutoAds$$module$extensions$amp_story_auto_ads$0_1$amp_story_auto_ads_prototype$analyticsEvent_$self$$, $eventType$jscomp$62$$, $vars$jscomp$27$$) {
  var $adIndex$jscomp$4$$ = $vars$jscomp$27$$.adIndex;
  $JSCompiler_StaticMethods_AmpStoryAutoAds$$module$extensions$amp_story_auto_ads$0_1$amp_story_auto_ads_prototype$analyticsEvent_$self$$.$analyticsData_$[$adIndex$jscomp$4$$] = Object.assign($JSCompiler_StaticMethods_AmpStoryAutoAds$$module$extensions$amp_story_auto_ads$0_1$amp_story_auto_ads_prototype$analyticsEvent_$self$$.$analyticsData_$[$adIndex$jscomp$4$$], $vars$jscomp$27$$);
  _.$triggerAnalyticsEvent$$module$src$analytics$$($JSCompiler_StaticMethods_AmpStoryAutoAds$$module$extensions$amp_story_auto_ads$0_1$amp_story_auto_ads_prototype$analyticsEvent_$self$$.element, $eventType$jscomp$62$$, $JSCompiler_StaticMethods_AmpStoryAutoAds$$module$extensions$amp_story_auto_ads$0_1$amp_story_auto_ads_prototype$analyticsEvent_$self$$.$analyticsData_$[$adIndex$jscomp$4$$]);
};
var $CTA_TYPES$$module$extensions$amp_story_auto_ads$0_1$amp_story_auto_ads$$ = {$APPLY_NOW$:"Apply Now", $BOOK_NOW$:"Book", $BUY_TICKETS$:"Buy Tickets", $DOWNLOAD$:"Download", $EXPLORE$:"Explore Now", $GET_NOW$:"Get Now", $INSTALL$:"Install Now", $LISTEN$:"Listen Now", $MORE$:"More", $OPEN_APP$:"Open App", $ORDER_NOW$:"Order Now", $PLAY$:"Play", $READ$:"Read Now", $SHOP$:"Shop Now", $SHOW$:"Show", $SHOWTIMES$:"Showtimes", $SIGN_UP$:"Sign Up", $SUBSCRIBE$:"Subscribe Now", $USE_APP$:"Use App", $VIEW$:"View", 
$WATCH$:"Watch", $WATCH_EPISODE$:"Watch Episode"};
_.$map$$module$src$utils$object$$({custom:!0, doubleclick:!0});
var $DISALLOWED_AD_ATTRS$$module$extensions$amp_story_auto_ads$0_1$amp_story_auto_ads$$ = {height:!0, layout:!0, width:!0};
_.$$jscomp$inherits$$($AmpStoryAutoAds$$module$extensions$amp_story_auto_ads$0_1$amp_story_auto_ads$$, window.AMP.BaseElement);
_.$JSCompiler_prototypeAlias$$ = $AmpStoryAutoAds$$module$extensions$amp_story_auto_ads$0_1$amp_story_auto_ads$$.prototype;
_.$JSCompiler_prototypeAlias$$.$buildCallback$ = function() {
  var $$jscomp$this$jscomp$856$$ = this;
  return _.$getElementServiceIfAvailable$$module$src$element_service$$(this.$win$, "story-store", "amp-story").then(function($ampStoryElement_storeService$$) {
    $$jscomp$this$jscomp$856$$.$storeService_$ = $ampStoryElement_storeService$$;
    if ($$jscomp$this$jscomp$856$$.$storeService_$.get("canInsertAutomaticAd")) {
      $ampStoryElement_storeService$$ = $$jscomp$this$jscomp$856$$.element.parentElement;
      var $ampdoc$jscomp$195$$ = $$jscomp$this$jscomp$856$$.$getAmpDoc$(), $extensionService$$ = _.$Services$$module$src$services$extensionsFor$$($$jscomp$this$jscomp$856$$.$win$);
      _.$JSCompiler_StaticMethods_installExtensionForDoc$$($extensionService$$, $ampdoc$jscomp$195$$, "amp-ad");
      _.$JSCompiler_StaticMethods_installExtensionForDoc$$($extensionService$$, $ampdoc$jscomp$195$$, "amp-mustache");
      return $ampStoryElement_storeService$$.$getImpl$().then(function($ampStoryElement_storeService$$) {
        $$jscomp$this$jscomp$856$$.$ampStory_$ = $ampStoryElement_storeService$$;
      });
    }
  });
};
_.$JSCompiler_prototypeAlias$$.$isLayoutSupported$ = function() {
  return !0;
};
_.$JSCompiler_prototypeAlias$$.$layoutCallback$ = function() {
  var $$jscomp$this$jscomp$857$$ = this;
  if (!this.$storeService_$.get("canInsertAutomaticAd")) {
    return window.Promise.resolve();
  }
  this.$navigationState_$ = this.$ampStory_$.$getNavigationState$();
  this.$navigationState_$.observe(this.$handleStateChange_$.bind(this));
  return this.$ampStory_$.signals().whenSignal("ini-load").then(function() {
    var $container$jscomp$inline_4081$$ = $$jscomp$this$jscomp$857$$.$win$.document.createElement("aside");
    $container$jscomp$inline_4081$$.className = "i-amphtml-ad-overlay-container";
    var $span$jscomp$inline_4082$$ = $$jscomp$this$jscomp$857$$.$win$.document.createElement("p");
    $span$jscomp$inline_4082$$.className = "i-amphtml-story-ad-attribution";
    $span$jscomp$inline_4082$$.textContent = "Ad";
    $container$jscomp$inline_4081$$.appendChild($span$jscomp$inline_4082$$);
    $$jscomp$this$jscomp$857$$.$ampStory_$.element.appendChild($container$jscomp$inline_4081$$);
    $$jscomp$this$jscomp$857$$.$config_$ = _.$parseJson$$module$src$json$$($$jscomp$this$jscomp$857$$.element.children[0].textContent);
    $JSCompiler_StaticMethods_schedulePage_$$($$jscomp$this$jscomp$857$$);
  });
};
_.$JSCompiler_prototypeAlias$$.$handleStateChange_$ = function($$jscomp$inline_4096_adState$jscomp$inline_4094_pageId$jscomp$inline_4090_stateChangeEvent$$) {
  switch($$jscomp$inline_4096_adState$jscomp$inline_4094_pageId$jscomp$inline_4090_stateChangeEvent$$.type) {
    case 0:
      if ($$jscomp$inline_4096_adState$jscomp$inline_4094_pageId$jscomp$inline_4090_stateChangeEvent$$ = $$jscomp$inline_4096_adState$jscomp$inline_4094_pageId$jscomp$inline_4090_stateChangeEvent$$.value.pageId, _.$hasOwn$$module$src$utils$object$$(this.$uniquePageIds_$, $$jscomp$inline_4096_adState$jscomp$inline_4094_pageId$jscomp$inline_4090_stateChangeEvent$$) || (this.$uniquePagesCount_$++, this.$uniquePageIds_$[$$jscomp$inline_4096_adState$jscomp$inline_4094_pageId$jscomp$inline_4090_stateChangeEvent$$] = 
      !0), 0 !== this.$adPagesCreated_$) {
        if (this.$idOfAdShowing_$) {
          var $$jscomp$inline_4091_$jscomp$inline_4095_JSCompiler_temp$jscomp$5651_adIndex$jscomp$inline_4092_adjustedInterval$jscomp$inline_6370$$ = {};
          $JSCompiler_StaticMethods_AmpStoryAutoAds$$module$extensions$amp_story_auto_ads$0_1$amp_story_auto_ads_prototype$analyticsEvent_$$(this, "story-ad-exit", ($$jscomp$inline_4091_$jscomp$inline_4095_JSCompiler_temp$jscomp$5651_adIndex$jscomp$inline_4092_adjustedInterval$jscomp$inline_6370$$.exitTime = Date.now(), $$jscomp$inline_4091_$jscomp$inline_4095_JSCompiler_temp$jscomp$5651_adIndex$jscomp$inline_4092_adjustedInterval$jscomp$inline_6370$$.adIndex = this.$idOfAdShowing_$, $$jscomp$inline_4091_$jscomp$inline_4095_JSCompiler_temp$jscomp$5651_adIndex$jscomp$inline_4092_adjustedInterval$jscomp$inline_6370$$));
          this.$idOfAdShowing_$ = null;
        }
        if (this.$adPageIds_$[$$jscomp$inline_4096_adState$jscomp$inline_4094_pageId$jscomp$inline_4090_stateChangeEvent$$]) {
          $$jscomp$inline_4091_$jscomp$inline_4095_JSCompiler_temp$jscomp$5651_adIndex$jscomp$inline_4092_adjustedInterval$jscomp$inline_6370$$ = this.$adPageIds_$[$$jscomp$inline_4096_adState$jscomp$inline_4094_pageId$jscomp$inline_4090_stateChangeEvent$$];
          var $$jscomp$inline_4093_adjustedFirst$jscomp$inline_6371$$ = {};
          $JSCompiler_StaticMethods_AmpStoryAutoAds$$module$extensions$amp_story_auto_ads$0_1$amp_story_auto_ads_prototype$analyticsEvent_$$(this, "story-ad-view", ($$jscomp$inline_4093_adjustedFirst$jscomp$inline_6371$$.viewTime = Date.now(), $$jscomp$inline_4093_adjustedFirst$jscomp$inline_6371$$.adIndex = $$jscomp$inline_4091_$jscomp$inline_4095_JSCompiler_temp$jscomp$5651_adIndex$jscomp$inline_4092_adjustedInterval$jscomp$inline_6370$$, $$jscomp$inline_4093_adjustedFirst$jscomp$inline_6371$$));
          this.$pendingAdView_$ = !1;
          $JSCompiler_StaticMethods_startNextAdPage_$$(this);
          this.$idOfAdShowing_$ = $$jscomp$inline_4091_$jscomp$inline_4095_JSCompiler_temp$jscomp$5651_adIndex$jscomp$inline_4092_adjustedInterval$jscomp$inline_6370$$;
        }
        if ($$jscomp$inline_4091_$jscomp$inline_4095_JSCompiler_temp$jscomp$5651_adIndex$jscomp$inline_4092_adjustedInterval$jscomp$inline_6370$$ = !this.$pendingAdView_$) {
          $$jscomp$inline_4091_$jscomp$inline_4095_JSCompiler_temp$jscomp$5651_adIndex$jscomp$inline_4092_adjustedInterval$jscomp$inline_6370$$ = this.$isDesktopView_$ ? 6 : 7, $$jscomp$inline_4093_adjustedFirst$jscomp$inline_6371$$ = this.$isDesktopView_$ ? 6 : 7, $$jscomp$inline_4091_$jscomp$inline_4095_JSCompiler_temp$jscomp$5651_adIndex$jscomp$inline_4092_adjustedInterval$jscomp$inline_6370$$ = this.$firstAdViewed_$ && this.$uniquePagesCount_$ >= $$jscomp$inline_4091_$jscomp$inline_4095_JSCompiler_temp$jscomp$5651_adIndex$jscomp$inline_4092_adjustedInterval$jscomp$inline_6370$$ || 
          !this.$firstAdViewed_$ && this.$uniquePagesCount_$ >= $$jscomp$inline_4093_adjustedFirst$jscomp$inline_6371$$ ? !0 : !1;
        }
        $$jscomp$inline_4091_$jscomp$inline_4095_JSCompiler_temp$jscomp$5651_adIndex$jscomp$inline_4092_adjustedInterval$jscomp$inline_6370$$ && ($$jscomp$inline_4096_adState$jscomp$inline_4094_pageId$jscomp$inline_4090_stateChangeEvent$$ = $JSCompiler_StaticMethods_tryToPlaceAdAfterPage_$$(this, $$jscomp$inline_4096_adState$jscomp$inline_4094_pageId$jscomp$inline_4090_stateChangeEvent$$), 1 === $$jscomp$inline_4096_adState$jscomp$inline_4094_pageId$jscomp$inline_4090_stateChangeEvent$$ && ($$jscomp$inline_4091_$jscomp$inline_4095_JSCompiler_temp$jscomp$5651_adIndex$jscomp$inline_4092_adjustedInterval$jscomp$inline_6370$$ = 
        {}, $JSCompiler_StaticMethods_analyticsEventWithCurrentAd_$$(this, "story-ad-insert", ($$jscomp$inline_4091_$jscomp$inline_4095_JSCompiler_temp$jscomp$5651_adIndex$jscomp$inline_4092_adjustedInterval$jscomp$inline_6370$$.insertTime = Date.now(), $$jscomp$inline_4091_$jscomp$inline_4095_JSCompiler_temp$jscomp$5651_adIndex$jscomp$inline_4092_adjustedInterval$jscomp$inline_6370$$)), this.$adsPlaced_$++, this.$pendingAdView_$ = !0), 2 === $$jscomp$inline_4096_adState$jscomp$inline_4094_pageId$jscomp$inline_4090_stateChangeEvent$$ && 
        ($$jscomp$inline_4096_adState$jscomp$inline_4094_pageId$jscomp$inline_4090_stateChangeEvent$$ = {}, $JSCompiler_StaticMethods_analyticsEventWithCurrentAd_$$(this, "story-ad-discard", ($$jscomp$inline_4096_adState$jscomp$inline_4094_pageId$jscomp$inline_4090_stateChangeEvent$$.discardTime = Date.now(), $$jscomp$inline_4096_adState$jscomp$inline_4094_pageId$jscomp$inline_4090_stateChangeEvent$$)), $JSCompiler_StaticMethods_startNextAdPage_$$(this, !0)));
      }
  }
};
_.$JSCompiler_prototypeAlias$$.$isDesktopView_$ = function() {
  return !!this.$storeService_$.get("desktopState");
};
window.self.AMP.registerElement("amp-story-auto-ads", $AmpStoryAutoAds$$module$extensions$amp_story_auto_ads$0_1$amp_story_auto_ads$$, "[desktop] amp-story-page[i-amphtml-loading]{-webkit-transform:scale(1.0) translateX(-100%) translateY(200%)!important;transform:scale(1.0) translateX(-100%) translateY(200%)!important}.i-amphtml-story-ad-link{background-color:#fff!important;border-radius:20px!important;bottom:32px!important;box-shadow:0px 2px 12px rgba(0,0,0,0.16)!important;color:#4285f4!important;font-family:Roboto,sans-serif!important;font-weight:700!important;height:36px!important;left:50%!important;letter-spacing:0.2px!important;line-height:36px;margin-left:-60px!important;position:absolute!important;text-align:center;text-decoration:none!important;width:120px!important}amp-story-page[active] .i-amphtml-story-ad-link{-webkit-animation-delay:100ms!important;animation-delay:100ms!important;-webkit-animation-duration:300ms!important;animation-duration:300ms!important;-webkit-animation-timing-function:cubic-bezier(0.4,0.0,0.2,1)!important;animation-timing-function:cubic-bezier(0.4,0.0,0.2,1)!important;-webkit-animation-fill-mode:forwards!important;animation-fill-mode:forwards!important;-webkit-animation-name:ad-cta!important;animation-name:ad-cta!important}@-webkit-keyframes ad-cta{0%{opacity:0;font-size:0px;-webkit-transform:scale(0);transform:scale(0)}to{opacity:1;font-size:13px;-webkit-transform:scale(1);transform:scale(1)}}@keyframes ad-cta{0%{opacity:0;font-size:0px;-webkit-transform:scale(0);transform:scale(0)}to{opacity:1;font-size:13px;-webkit-transform:scale(1);transform:scale(1)}}.i-amphtml-ad-overlay-container{height:24px!important;left:0!important;padding:14px 0 0!important;position:absolute!important;top:0!important;z-index:100001!important}[dir=rtl] .i-amphtml-ad-overlay-container{left:auto!important;right:0!important}[desktop] .i-amphtml-ad-overlay-container{left:calc(50vw - 22.5vh)!important;top:12.5vh!important}[dir=rtl] [desktop] .i-amphtml-ad-overlay-container{left:auto!important;right:calc(50vw - 22.5vh)!important}.i-amphtml-story-ad-attribution{color:#fff!important;font-size:18px!important;font-family:Roboto,sans-serif!important;font-weight:700!important;letter-spacing:0.5px!important;margin:0 0 0 16px!important;opacity:0!important;padding:0!important;visibility:hidden!important}[dir=rtl] .i-amphtml-story-ad-attribution{margin-left:0px!important;margin-right:16px!important}amp-story[ad-showing][desktop] .i-amphtml-story-ad-attribution{-webkit-transition:opacity 0.1s linear 0.3s;transition:opacity 0.1s linear 0.3s}amp-story[ad-showing] .i-amphtml-story-ad-attribution{visibility:visible!important;opacity:1!important}.i-amphtml-glass-pane{height:100%!important;width:100%!important;z-index:1!important}\n/*# sourceURL=/extensions/amp-story-auto-ads/0.1/amp-story-auto-ads.css*/");

})});
