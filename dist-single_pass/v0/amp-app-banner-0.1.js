(self.AMP=self.AMP||[]).push({n:"amp-app-banner",i:["_base_i","_base_misc"],v:"1901181729101",f:(function(AMP,_){
var $AbstractAppBanner$$module$extensions$amp_app_banner$0_1$amp_app_banner$$ = function($$jscomp$super$this$jscomp$19_element$jscomp$337$$) {
  $$jscomp$super$this$jscomp$19_element$jscomp$337$$ = window.AMP.BaseElement.call(this, $$jscomp$super$this$jscomp$19_element$jscomp$337$$) || this;
  $$jscomp$super$this$jscomp$19_element$jscomp$337$$.$openButton_$ = null;
  $$jscomp$super$this$jscomp$19_element$jscomp$337$$.$canShowBuiltinBanner_$ = !1;
  return $$jscomp$super$this$jscomp$19_element$jscomp$337$$;
}, $JSCompiler_StaticMethods_setupOpenButton_$$ = function($JSCompiler_StaticMethods_setupOpenButton_$self$$, $button$$, $openInAppUrl$$, $installAppUrl$$) {
  $button$$.addEventListener("click", function() {
    $JSCompiler_StaticMethods_setupOpenButton_$self$$.$D$($openInAppUrl$$, $installAppUrl$$);
  });
}, $JSCompiler_StaticMethods_checkIfDismissed_$$ = function($JSCompiler_StaticMethods_checkIfDismissed_$self$$) {
  $JSCompiler_StaticMethods_checkIfDismissed_$self$$.$isDismissed$().then(function($dismissButton$jscomp$inline_2794_isDismissed_paddingBar$jscomp$inline_2793$$) {
    if ($dismissButton$jscomp$inline_2794_isDismissed_paddingBar$jscomp$inline_2793$$) {
      $JSCompiler_StaticMethods_AbstractAppBanner$$module$extensions$amp_app_banner$0_1$amp_app_banner_prototype$hide_$$($JSCompiler_StaticMethods_checkIfDismissed_$self$$);
    } else {
      $dismissButton$jscomp$inline_2794_isDismissed_paddingBar$jscomp$inline_2793$$ = $JSCompiler_StaticMethods_checkIfDismissed_$self$$.$win$.document.createElement("i-amphtml-app-banner-top-padding");
      $JSCompiler_StaticMethods_checkIfDismissed_$self$$.element.appendChild($dismissButton$jscomp$inline_2794_isDismissed_paddingBar$jscomp$inline_2793$$);
      $dismissButton$jscomp$inline_2794_isDismissed_paddingBar$jscomp$inline_2793$$ = $JSCompiler_StaticMethods_checkIfDismissed_$self$$.$win$.document.createElement("button");
      $dismissButton$jscomp$inline_2794_isDismissed_paddingBar$jscomp$inline_2793$$.classList.add("amp-app-banner-dismiss-button");
      $dismissButton$jscomp$inline_2794_isDismissed_paddingBar$jscomp$inline_2793$$.setAttribute("aria-label", $JSCompiler_StaticMethods_checkIfDismissed_$self$$.element.getAttribute("data-dismiss-button-aria-label") || "Dismiss");
      var $boundOnDismissButtonClick$jscomp$inline_2795$$ = $JSCompiler_StaticMethods_checkIfDismissed_$self$$.$F$.bind($JSCompiler_StaticMethods_checkIfDismissed_$self$$);
      $dismissButton$jscomp$inline_2794_isDismissed_paddingBar$jscomp$inline_2793$$.addEventListener("click", $boundOnDismissButtonClick$jscomp$inline_2795$$);
      $JSCompiler_StaticMethods_checkIfDismissed_$self$$.element.appendChild($dismissButton$jscomp$inline_2794_isDismissed_paddingBar$jscomp$inline_2793$$);
      _.$JSCompiler_StaticMethods_Vsync$$module$src$service$vsync_impl_prototype$run$$(_.$JSCompiler_StaticMethods_getVsync$$($JSCompiler_StaticMethods_checkIfDismissed_$self$$), {measure:$measureBanner$$module$extensions$amp_app_banner$0_1$amp_app_banner$$, $mutate$:$updateViewportPadding$$module$extensions$amp_app_banner$0_1$amp_app_banner$$}, {element:$JSCompiler_StaticMethods_checkIfDismissed_$self$$.element, viewport:$JSCompiler_StaticMethods_checkIfDismissed_$self$$.$getViewport$()});
      $JSCompiler_StaticMethods_checkIfDismissed_$self$$.expand();
    }
  });
}, $JSCompiler_StaticMethods_AbstractAppBanner$$module$extensions$amp_app_banner$0_1$amp_app_banner_prototype$hide_$$ = function($JSCompiler_StaticMethods_AbstractAppBanner$$module$extensions$amp_app_banner$0_1$amp_app_banner_prototype$hide_$self$$) {
  return _.$JSCompiler_StaticMethods_runPromise$$(_.$JSCompiler_StaticMethods_getVsync$$($JSCompiler_StaticMethods_AbstractAppBanner$$module$extensions$amp_app_banner$0_1$amp_app_banner_prototype$hide_$self$$), {measure:void 0, $mutate$:$hideBanner$$module$extensions$amp_app_banner$0_1$amp_app_banner$$}, {element:$JSCompiler_StaticMethods_AbstractAppBanner$$module$extensions$amp_app_banner$0_1$amp_app_banner_prototype$hide_$self$$.element, viewport:$JSCompiler_StaticMethods_AbstractAppBanner$$module$extensions$amp_app_banner$0_1$amp_app_banner_prototype$hide_$self$$.$getViewport$()});
}, $AmpAppBanner$$module$extensions$amp_app_banner$0_1$amp_app_banner$$ = function($element$jscomp$338$$) {
  return $AbstractAppBanner$$module$extensions$amp_app_banner$0_1$amp_app_banner$$.call(this, $element$jscomp$338$$) || this;
}, $AmpIosAppBanner$$module$extensions$amp_app_banner$0_1$amp_app_banner$$ = function($$jscomp$super$this$jscomp$20_element$jscomp$339$$) {
  $$jscomp$super$this$jscomp$20_element$jscomp$339$$ = $AbstractAppBanner$$module$extensions$amp_app_banner$0_1$amp_app_banner$$.call(this, $$jscomp$super$this$jscomp$20_element$jscomp$339$$) || this;
  $$jscomp$super$this$jscomp$20_element$jscomp$339$$.$viewer_$ = null;
  $$jscomp$super$this$jscomp$20_element$jscomp$339$$.$metaTag_$ = null;
  return $$jscomp$super$this$jscomp$20_element$jscomp$339$$;
}, $JSCompiler_StaticMethods_parseIosMetaContent_$$ = function($JSCompiler_StaticMethods_parseIosMetaContent_$self$$, $metaContent_openUrl$$) {
  var $config$jscomp$51$$ = {};
  $metaContent_openUrl$$.replace(/\s/, "").split(",").forEach(function($JSCompiler_StaticMethods_parseIosMetaContent_$self$$) {
    $JSCompiler_StaticMethods_parseIosMetaContent_$self$$ = $JSCompiler_StaticMethods_parseIosMetaContent_$self$$.split("=");
    $config$jscomp$51$$[$JSCompiler_StaticMethods_parseIosMetaContent_$self$$[0]] = $JSCompiler_StaticMethods_parseIosMetaContent_$self$$[1];
  });
  var $appId_installAppUrl$jscomp$2$$ = $config$jscomp$51$$["app-id"];
  ($metaContent_openUrl$$ = $config$jscomp$51$$["app-argument"]) || _.$user$$module$src$log$$().error("amp-app-banner", '<meta name="apple-itunes-app">\'s content should contain app-argument to allow opening an already installed application on iOS.');
  $appId_installAppUrl$jscomp$2$$ = "https://itunes.apple.com/us/app/id" + $appId_installAppUrl$jscomp$2$$;
  $JSCompiler_StaticMethods_setupOpenButton_$$($JSCompiler_StaticMethods_parseIosMetaContent_$self$$, $JSCompiler_StaticMethods_parseIosMetaContent_$self$$.$openButton_$, $metaContent_openUrl$$ || $appId_installAppUrl$jscomp$2$$, $appId_installAppUrl$jscomp$2$$);
}, $AmpAndroidAppBanner$$module$extensions$amp_app_banner$0_1$amp_app_banner$$ = function($$jscomp$super$this$jscomp$21_element$jscomp$340$$) {
  $$jscomp$super$this$jscomp$21_element$jscomp$340$$ = $AbstractAppBanner$$module$extensions$amp_app_banner$0_1$amp_app_banner$$.call(this, $$jscomp$super$this$jscomp$21_element$jscomp$340$$) || this;
  $$jscomp$super$this$jscomp$21_element$jscomp$340$$.$manifestLink_$ = null;
  $$jscomp$super$this$jscomp$21_element$jscomp$340$$.$manifestHref_$ = "";
  $$jscomp$super$this$jscomp$21_element$jscomp$340$$.$missingDataSources_$ = !1;
  return $$jscomp$super$this$jscomp$21_element$jscomp$340$$;
}, $handleDismiss$$module$extensions$amp_app_banner$0_1$amp_app_banner$$ = function($state$jscomp$46$$) {
  $hideBanner$$module$extensions$amp_app_banner$0_1$amp_app_banner$$($state$jscomp$46$$);
  $state$jscomp$46$$.$storagePromise$.then(function($storage$jscomp$5$$) {
    $storage$jscomp$5$$.set($state$jscomp$46$$.$storageKey$, !0);
  });
}, $hideBanner$$module$extensions$amp_app_banner$0_1$amp_app_banner$$ = function($state$jscomp$47$$) {
  _.$JSCompiler_StaticMethods_removeFromFixedLayer$$($state$jscomp$47$$.viewport, $state$jscomp$47$$.element);
  _.$removeElement$$module$src$dom$$($state$jscomp$47$$.element);
  _.$JSCompiler_StaticMethods_updatePaddingBottom$$($state$jscomp$47$$.viewport, 0);
}, $measureBanner$$module$extensions$amp_app_banner$0_1$amp_app_banner$$ = function($state$jscomp$48$$) {
  $state$jscomp$48$$.$bannerHeight$ = $state$jscomp$48$$.viewport.$getLayoutRect$($state$jscomp$48$$.element).height;
}, $updateViewportPadding$$module$extensions$amp_app_banner$0_1$amp_app_banner$$ = function($state$jscomp$49$$) {
  _.$JSCompiler_StaticMethods_updatePaddingBottom$$($state$jscomp$49$$.viewport, $state$jscomp$49$$.$bannerHeight$);
  _.$JSCompiler_StaticMethods_addToFixedLayer$$($state$jscomp$49$$.viewport, $state$jscomp$49$$.element);
};
_.$$jscomp$inherits$$($AbstractAppBanner$$module$extensions$amp_app_banner$0_1$amp_app_banner$$, window.AMP.BaseElement);
$AbstractAppBanner$$module$extensions$amp_app_banner$0_1$amp_app_banner$$.prototype.$D$ = function() {
};
$AbstractAppBanner$$module$extensions$amp_app_banner$0_1$amp_app_banner$$.prototype.$F$ = function() {
  _.$JSCompiler_StaticMethods_Vsync$$module$src$service$vsync_impl_prototype$run$$(_.$JSCompiler_StaticMethods_getVsync$$(this), {measure:void 0, $mutate$:$handleDismiss$$module$extensions$amp_app_banner$0_1$amp_app_banner$$}, {element:this.element, viewport:this.$getViewport$(), $storagePromise$:_.$Services$$module$src$services$storageForDoc$$(this.$getAmpDoc$()), $storageKey$:"amp-app-banner:" + this.element.id});
};
$AbstractAppBanner$$module$extensions$amp_app_banner$0_1$amp_app_banner$$.prototype.$isDismissed$ = function() {
  var $$jscomp$this$jscomp$446$$ = this;
  return _.$Services$$module$src$services$storageForDoc$$(this.$getAmpDoc$()).then(function($storage$jscomp$4$$) {
    return $storage$jscomp$4$$.get("amp-app-banner:" + $$jscomp$this$jscomp$446$$.element.id);
  }).then(function($$jscomp$this$jscomp$446$$) {
    return !!$$jscomp$this$jscomp$446$$;
  }, function($$jscomp$this$jscomp$446$$) {
    _.$dev$$module$src$log$$().error("amp-app-banner", "Failed to read storage", $$jscomp$this$jscomp$446$$);
    return !1;
  });
};
_.$$jscomp$inherits$$($AmpAppBanner$$module$extensions$amp_app_banner$0_1$amp_app_banner$$, $AbstractAppBanner$$module$extensions$amp_app_banner$0_1$amp_app_banner$$);
$AmpAppBanner$$module$extensions$amp_app_banner$0_1$amp_app_banner$$.prototype.$upgradeCallback$ = function() {
  var $platform$jscomp$6$$ = _.$Services$$module$src$services$platformFor$$(this.$win$);
  return _.$JSCompiler_StaticMethods_isIos$$($platform$jscomp$6$$) ? new $AmpIosAppBanner$$module$extensions$amp_app_banner$0_1$amp_app_banner$$(this.element) : _.$JSCompiler_StaticMethods_isAndroid$$($platform$jscomp$6$$) ? new $AmpAndroidAppBanner$$module$extensions$amp_app_banner$0_1$amp_app_banner$$(this.element) : null;
};
$AmpAppBanner$$module$extensions$amp_app_banner$0_1$amp_app_banner$$.prototype.$layoutCallback$ = function() {
  _.$user$$module$src$log$$().$Log$$module$src$log_prototype$info$("amp-app-banner", "Only iOS or Android platforms are currently supported.");
  return $JSCompiler_StaticMethods_AbstractAppBanner$$module$extensions$amp_app_banner$0_1$amp_app_banner_prototype$hide_$$(this);
};
_.$$jscomp$inherits$$($AmpIosAppBanner$$module$extensions$amp_app_banner$0_1$amp_app_banner$$, $AbstractAppBanner$$module$extensions$amp_app_banner$0_1$amp_app_banner$$);
$AmpIosAppBanner$$module$extensions$amp_app_banner$0_1$amp_app_banner$$.prototype.$preconnectCallback$ = function($opt_onLayout$jscomp$5$$) {
  this.element.parentNode && this.$preconnect$.url("https://itunes.apple.com", $opt_onLayout$jscomp$5$$);
};
$AmpIosAppBanner$$module$extensions$amp_app_banner$0_1$amp_app_banner$$.prototype.$buildCallback$ = function() {
  this.$viewer_$ = _.$Services$$module$src$services$viewerForDoc$$(this.$getAmpDoc$());
  var $platform$jscomp$7$$ = _.$Services$$module$src$services$platformFor$$(this.$win$);
  (this.$canShowBuiltinBanner_$ = !this.$viewer_$.$F$ && _.$JSCompiler_StaticMethods_isSafari$$($platform$jscomp$7$$)) ? (_.$user$$module$src$log$$().$Log$$module$src$log_prototype$info$("amp-app-banner", "Browser supports builtin banners. Not rendering amp-app-banner."), $JSCompiler_StaticMethods_AbstractAppBanner$$module$extensions$amp_app_banner$0_1$amp_app_banner_prototype$hide_$$(this)) : this.$viewer_$.$F$ && !_.$JSCompiler_StaticMethods_hasCapability$$(this.$viewer_$, "navigateTo") ? $JSCompiler_StaticMethods_AbstractAppBanner$$module$extensions$amp_app_banner$0_1$amp_app_banner_prototype$hide_$$(this) : 
  (this.$metaTag_$ = this.$win$.document.head.querySelector("meta[name=apple-itunes-app]")) ? (this.$openButton_$ = this.element.querySelector("button[open-button]"), $JSCompiler_StaticMethods_parseIosMetaContent_$$(this, this.$metaTag_$.getAttribute("content")), $JSCompiler_StaticMethods_checkIfDismissed_$$(this)) : $JSCompiler_StaticMethods_AbstractAppBanner$$module$extensions$amp_app_banner$0_1$amp_app_banner_prototype$hide_$$(this);
};
$AmpIosAppBanner$$module$extensions$amp_app_banner$0_1$amp_app_banner$$.prototype.$layoutCallback$ = function() {
  return window.Promise.resolve();
};
$AmpIosAppBanner$$module$extensions$amp_app_banner$0_1$amp_app_banner$$.prototype.$D$ = function($openInAppUrl$jscomp$1$$, $installAppUrl$jscomp$1$$) {
  var $$jscomp$this$jscomp$448$$ = this;
  this.$viewer_$.$F$ ? (_.$Services$$module$src$services$timerFor$$(this.$win$).delay(function() {
    _.$JSCompiler_StaticMethods_Viewer$$module$src$service$viewer_impl_prototype$sendMessage$$($$jscomp$this$jscomp$448$$.$viewer_$, "navigateTo", _.$dict$$module$src$utils$object$$({url:$installAppUrl$jscomp$1$$}));
  }, 1500), _.$JSCompiler_StaticMethods_Viewer$$module$src$service$viewer_impl_prototype$sendMessage$$(this.$viewer_$, "navigateTo", _.$dict$$module$src$utils$object$$({url:$openInAppUrl$jscomp$1$$}))) : (_.$Services$$module$src$services$timerFor$$(this.$win$).delay(function() {
    _.$openWindowDialog$$module$src$dom$$($$jscomp$this$jscomp$448$$.$win$, $installAppUrl$jscomp$1$$, "_top");
  }, 1500), _.$openWindowDialog$$module$src$dom$$(this.$win$, $openInAppUrl$jscomp$1$$, "_top"));
};
_.$$jscomp$inherits$$($AmpAndroidAppBanner$$module$extensions$amp_app_banner$0_1$amp_app_banner$$, $AbstractAppBanner$$module$extensions$amp_app_banner$0_1$amp_app_banner$$);
$AmpAndroidAppBanner$$module$extensions$amp_app_banner$0_1$amp_app_banner$$.prototype.$preconnectCallback$ = function($opt_onLayout$jscomp$6$$) {
  this.element.parentNode && (this.$preconnect$.url("https://play.google.com", $opt_onLayout$jscomp$6$$), this.$manifestHref_$ && this.$preconnect$.$preload$(this.$manifestHref_$));
};
$AmpAndroidAppBanner$$module$extensions$amp_app_banner$0_1$amp_app_banner$$.prototype.$buildCallback$ = function() {
  var $win$jscomp$330$$ = this.$win$, $element$jscomp$341$$ = this.element, $viewer$jscomp$36$$ = _.$Services$$module$src$services$viewerForDoc$$(this.$getAmpDoc$());
  this.$manifestLink_$ = $win$jscomp$330$$.document.head.querySelector("link[rel=manifest],link[rel=origin-manifest]");
  var $platform$jscomp$8$$ = _.$Services$$module$src$services$platformFor$$($win$jscomp$330$$);
  _.$Services$$module$src$services$urlForDoc$$($element$jscomp$341$$);
  var $isChromeAndroid$$ = _.$JSCompiler_StaticMethods_isAndroid$$($platform$jscomp$8$$) && _.$JSCompiler_StaticMethods_isChrome$$($platform$jscomp$8$$);
  (this.$canShowBuiltinBanner_$ = !_.$isProxyOrigin$$module$src$url$$($win$jscomp$330$$.location) && !$viewer$jscomp$36$$.$F$ && $isChromeAndroid$$) ? (_.$user$$module$src$log$$().$Log$$module$src$log_prototype$info$("amp-app-banner", "Browser supports builtin banners. Not rendering amp-app-banner."), $JSCompiler_StaticMethods_AbstractAppBanner$$module$extensions$amp_app_banner$0_1$amp_app_banner_prototype$hide_$$(this)) : (this.$missingDataSources_$ = _.$JSCompiler_StaticMethods_isAndroid$$($platform$jscomp$8$$) && 
  !this.$manifestLink_$) ? $JSCompiler_StaticMethods_AbstractAppBanner$$module$extensions$amp_app_banner$0_1$amp_app_banner_prototype$hide_$$(this) : (this.$manifestHref_$ = this.$manifestLink_$.getAttribute("href"), this.$openButton_$ = $element$jscomp$341$$.querySelector("button[open-button]"), $JSCompiler_StaticMethods_checkIfDismissed_$$(this));
};
$AmpAndroidAppBanner$$module$extensions$amp_app_banner$0_1$amp_app_banner$$.prototype.$layoutCallback$ = function() {
  var $$jscomp$this$jscomp$449$$ = this;
  return this.$missingDataSources_$ || this.$canShowBuiltinBanner_$ ? window.Promise.resolve() : _.$JSCompiler_StaticMethods_fetchJson$$(_.$Services$$module$src$services$xhrFor$$(this.$win$), this.$manifestHref_$, {requireAmpResponseSourceOrigin:!1}).then(function($$jscomp$this$jscomp$449$$) {
    return $$jscomp$this$jscomp$449$$.json();
  }).then(function($JSCompiler_inline_result$jscomp$695_apps$jscomp$inline_2801_installAppUrl$jscomp$inline_2804_json$jscomp$12$$) {
    a: {
      if ($JSCompiler_inline_result$jscomp$695_apps$jscomp$inline_2801_installAppUrl$jscomp$inline_2804_json$jscomp$12$$ = $JSCompiler_inline_result$jscomp$695_apps$jscomp$inline_2801_installAppUrl$jscomp$inline_2804_json$jscomp$12$$.related_applications) {
        for (var $element$jscomp$inline_6091_i$jscomp$inline_2802_parsedUrl$jscomp$inline_6093$$ = 0; $element$jscomp$inline_6091_i$jscomp$inline_2802_parsedUrl$jscomp$inline_6093$$ < $JSCompiler_inline_result$jscomp$695_apps$jscomp$inline_2801_installAppUrl$jscomp$inline_2804_json$jscomp$12$$.length; $element$jscomp$inline_6091_i$jscomp$inline_2802_parsedUrl$jscomp$inline_6093$$++) {
          var $app$jscomp$inline_2803_appId$jscomp$inline_6090$$ = $JSCompiler_inline_result$jscomp$695_apps$jscomp$inline_2801_installAppUrl$jscomp$inline_2804_json$jscomp$12$$[$element$jscomp$inline_6091_i$jscomp$inline_2802_parsedUrl$jscomp$inline_6093$$];
          if ("play" == $app$jscomp$inline_2803_appId$jscomp$inline_6090$$.platform) {
            $JSCompiler_inline_result$jscomp$695_apps$jscomp$inline_2801_installAppUrl$jscomp$inline_2804_json$jscomp$12$$ = "https://play.google.com/store/apps/details?id=" + $app$jscomp$inline_2803_appId$jscomp$inline_6090$$.id;
            $app$jscomp$inline_2803_appId$jscomp$inline_6090$$ = $app$jscomp$inline_2803_appId$jscomp$inline_6090$$.id;
            $element$jscomp$inline_6091_i$jscomp$inline_2802_parsedUrl$jscomp$inline_6093$$ = $$jscomp$this$jscomp$449$$.element;
            var $canonicalUrl$jscomp$inline_6092_cleanProtocol$jscomp$inline_6094$$ = _.$Services$$module$src$services$documentInfoForDoc$$($element$jscomp$inline_6091_i$jscomp$inline_2802_parsedUrl$jscomp$inline_6093$$).canonicalUrl;
            $element$jscomp$inline_6091_i$jscomp$inline_2802_parsedUrl$jscomp$inline_6093$$ = _.$Services$$module$src$services$urlForDoc$$($element$jscomp$inline_6091_i$jscomp$inline_2802_parsedUrl$jscomp$inline_6093$$).parse($canonicalUrl$jscomp$inline_6092_cleanProtocol$jscomp$inline_6094$$);
            $canonicalUrl$jscomp$inline_6092_cleanProtocol$jscomp$inline_6094$$ = $element$jscomp$inline_6091_i$jscomp$inline_2802_parsedUrl$jscomp$inline_6093$$.protocol.replace(":", "");
            $JSCompiler_StaticMethods_setupOpenButton_$$($$jscomp$this$jscomp$449$$, $$jscomp$this$jscomp$449$$.$openButton_$, "android-app://" + $app$jscomp$inline_2803_appId$jscomp$inline_6090$$ + "/" + $canonicalUrl$jscomp$inline_6092_cleanProtocol$jscomp$inline_6094$$ + "/" + $element$jscomp$inline_6091_i$jscomp$inline_2802_parsedUrl$jscomp$inline_6093$$.host + $element$jscomp$inline_6091_i$jscomp$inline_2802_parsedUrl$jscomp$inline_6093$$.pathname, $JSCompiler_inline_result$jscomp$695_apps$jscomp$inline_2801_installAppUrl$jscomp$inline_2804_json$jscomp$12$$);
            $JSCompiler_inline_result$jscomp$695_apps$jscomp$inline_2801_installAppUrl$jscomp$inline_2804_json$jscomp$12$$ = void 0;
            break a;
          }
        }
        _.$user$$module$src$log$$().$Log$$module$src$log_prototype$warn$("amp-app-banner", "Could not find a platform=play app in manifest: %s", $$jscomp$this$jscomp$449$$.element);
      } else {
        _.$user$$module$src$log$$().$Log$$module$src$log_prototype$warn$("amp-app-banner", "related_applications is missing from manifest.json file: %s", $$jscomp$this$jscomp$449$$.element);
      }
      $JSCompiler_inline_result$jscomp$695_apps$jscomp$inline_2801_installAppUrl$jscomp$inline_2804_json$jscomp$12$$ = void 0;
    }
    return $JSCompiler_inline_result$jscomp$695_apps$jscomp$inline_2801_installAppUrl$jscomp$inline_2804_json$jscomp$12$$;
  }).catch(function($error$jscomp$59$$) {
    $JSCompiler_StaticMethods_AbstractAppBanner$$module$extensions$amp_app_banner$0_1$amp_app_banner_prototype$hide_$$($$jscomp$this$jscomp$449$$);
    _.$rethrowAsync$$module$src$log$$($error$jscomp$59$$);
  });
};
$AmpAndroidAppBanner$$module$extensions$amp_app_banner$0_1$amp_app_banner$$.prototype.$D$ = function($openInAppUrl$jscomp$3$$, $installAppUrl$jscomp$3$$) {
  var $$jscomp$this$jscomp$450$$ = this;
  _.$Services$$module$src$services$timerFor$$(this.$win$).delay(function() {
    $$jscomp$this$jscomp$450$$.$win$.top.location.assign($installAppUrl$jscomp$3$$);
  }, 1500);
  _.$openWindowDialog$$module$src$dom$$(this.$win$, $openInAppUrl$jscomp$3$$, "_top");
};
window.self.AMP.registerElement("amp-app-banner", $AmpAppBanner$$module$extensions$amp_app_banner$0_1$amp_app_banner$$, "amp-app-banner{position:fixed!important;bottom:0!important;left:0;width:100%;max-height:100px!important;box-sizing:border-box;background:#fff;z-index:13;box-shadow:0 0 5px 0 rgba(0,0,0,0.2)!important}i-amphtml-app-banner-top-padding{position:absolute;top:0;left:0;right:0;background:#fff;height:4px;z-index:15}.amp-app-banner-dismiss-button{position:absolute;width:28px;height:28px;top:-28px;right:0;background-image:url(\"data:image/svg+xml;charset=utf-8,%3Csvg width='13' height='13' viewBox='341 8 13 13' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath fill='%234F4F4F' d='M354 9.31L352.69 8l-5.19 5.19L342.31 8 341 9.31l5.19 5.19-5.19 5.19 1.31 1.31 5.19-5.19 5.19 5.19 1.31-1.31-5.19-5.19z' fill-rule='evenodd'/%3E%3C/svg%3E\");background-size:13px 13px;background-position:9px;background-color:#fff;background-repeat:no-repeat;z-index:14;box-shadow:0 -1px 1px 0 rgba(0,0,0,0.2);border:none;border-radius:12px 0 0 0}.amp-app-banner-dismiss-button:before{position:absolute;content:\"\";top:-20px;right:0;left:-20px;bottom:0}[dir=rtl] .amp-app-banner-dismiss-button{right:auto;left:0;border-top-left-radius:0;border-top-right-radius:12px;background-position:6px}[dir=rtl] .amp-app-banner-dismiss-button:before{right:-20px;left:0}\n/*# sourceURL=/extensions/amp-app-banner/0.1/amp-app-banner.css*/");

})});
