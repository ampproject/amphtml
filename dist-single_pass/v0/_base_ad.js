(self.AMP=self.AMP||[]).push({n:"_base_ad",i:"_base_i",v:"1901181729101",f:(function(AMP,_){
var $setParentWindow$$module$src$service$$, $installStylesLegacy$$module$src$style_installer$$, $JSCompiler_StaticMethods_importPkcsKey$$, $JSCompiler_StaticMethods_verifyPkcs$$, $installPolyfillsInChildWindow$$module$src$service$extensions_impl$$, $installStandardServicesInEmbed$$module$src$service$extensions_impl$$, $JSCompiler_StaticMethods_removeForChildWindow$$, $copyBuiltinElementsToChildWindow$$module$src$service$extensions_impl$$, $JSCompiler_StaticMethods_installExtensionsInChildWindow$$, 
$escapeHtmlChar$$module$src$dom$$, $escapeHtml$$module$src$dom$$, $setFriendlyIframeEmbedVisible$$module$src$friendly_iframe_embed$$, $mergeHtml$$module$src$friendly_iframe_embed$$, $isIframeReady$$module$src$friendly_iframe_embed$$, $FriendlyIframeEmbed$$module$src$friendly_iframe_embed$$, $JSCompiler_StaticMethods_startRender_$$, $JSCompiler_StaticMethods_measureMutate_$$, $getNavigationTiming$$module$ads$google$a4a$utils$$, $extractHost$$module$ads$google$a4a$utils$$, $topWindowUrlOrDomain$$module$ads$google$a4a$utils$$, 
$secondWindowFromTop$$module$ads$google$a4a$utils$$, $getCorrelator$$module$ads$google$a4a$utils$$, $csiTrigger$$module$ads$google$a4a$utils$$, $mergeExperimentIds$$module$ads$google$a4a$utils$$, $getBinaryTypeNumericalCode$$module$ads$google$a4a$utils$$, $executeIdentityTokenFetch$$module$ads$google$a4a$utils$$, $getIdentityTokenRequestUrl$$module$ads$google$a4a$utils$$, $parseExperimentIds$$module$ads$google$a4a$traffic_experiments$$, $validateExperimentIds$$module$ads$google$a4a$traffic_experiments$$, 
$SignatureVerifier$$module$extensions$amp_a4a$0_1$signature_verifier$$, $JSCompiler_StaticMethods_verifyCreativeAndSignature$$, $JSCompiler_StaticMethods_fetchAndAddKeys_$$, $signingServiceError$$module$extensions$amp_a4a$0_1$signature_verifier$$, $protectFunctionWrapper$$module$extensions$amp_a4a$0_1$amp_a4a$$, $JSCompiler_StaticMethods_inNonAmpPreferenceExp$$, $JSCompiler_StaticMethods_shouldInitializePromiseChain_$$, $JSCompiler_StaticMethods_populatePostAdResponseExperimentFeatures_$$, $JSCompiler_StaticMethods_promiseErrorHandler_$$, 
$JSCompiler_StaticMethods_attemptToRenderCreative$$, $JSCompiler_StaticMethods_destroyFrame$$, $JSCompiler_StaticMethods_renderAmpCreative_$$, $JSCompiler_StaticMethods_iframeRenderHelper_$$, $JSCompiler_StaticMethods_renderViaIframeGet_$$, $JSCompiler_StaticMethods_renderViaNameAttrOfXOriginIframe_$$, $JSCompiler_StaticMethods_getSafeframePath$$, $JSCompiler_StaticMethods_maybeTriggerAnalyticsEvent_$$, $JSCompiler_StaticMethods_tryExecuteRealTimeConfig_$$, $signatureVerifierFor$$module$extensions$amp_a4a$0_1$amp_a4a$$, 
$JSCompiler_StaticMethods_getTemplateProxyUrl_$$;
$setParentWindow$$module$src$service$$ = function($win$jscomp$53$$, $parentWin$$) {
  $win$jscomp$53$$.__AMP_PARENT = $parentWin$$;
  $win$jscomp$53$$.__AMP_TOP = _.$getTopWindow$$module$src$service$$($parentWin$$);
};
$installStylesLegacy$$module$src$style_installer$$ = function($doc$jscomp$9$$, $cssText$jscomp$1$$, $cb$jscomp$3$$, $opt_isRuntimeCss$jscomp$1$$, $opt_ext$jscomp$1$$) {
  var $style$jscomp$7$$ = _.$insertStyleElement$$module$src$style_installer$$($doc$jscomp$9$$.head, $cssText$jscomp$1$$, $opt_isRuntimeCss$jscomp$1$$ || !1, $opt_ext$jscomp$1$$ || null);
  if ($cb$jscomp$3$$) {
    if (_.$styleLoaded$$module$src$style_installer$$($doc$jscomp$9$$, $style$jscomp$7$$)) {
      $cb$jscomp$3$$($style$jscomp$7$$);
    } else {
      var $interval$jscomp$2$$ = (0,window.setInterval)(function() {
        _.$styleLoaded$$module$src$style_installer$$($doc$jscomp$9$$, $style$jscomp$7$$) && ((0,window.clearInterval)($interval$jscomp$2$$), $cb$jscomp$3$$($style$jscomp$7$$));
      }, 4);
    }
  }
};
$JSCompiler_StaticMethods_importPkcsKey$$ = function($JSCompiler_StaticMethods_importPkcsKey$self$$, $jwk_keyData$jscomp$1$$) {
  $jwk_keyData$jscomp$1$$ = $JSCompiler_StaticMethods_importPkcsKey$self$$.$J$ ? _.$utf8Encode$$module$src$utils$bytes$$(JSON.stringify($jwk_keyData$jscomp$1$$)) : $jwk_keyData$jscomp$1$$;
  return $JSCompiler_StaticMethods_importPkcsKey$self$$.$D$.importKey("jwk", $jwk_keyData$jscomp$1$$, $JSCompiler_StaticMethods_importPkcsKey$self$$.$I$, !0, ["verify"]);
};
$JSCompiler_StaticMethods_verifyPkcs$$ = function($JSCompiler_StaticMethods_verifyPkcs$self$$, $key$jscomp$58$$, $signature$jscomp$1$$, $data$jscomp$44$$) {
  return $JSCompiler_StaticMethods_verifyPkcs$self$$.$D$.verify($JSCompiler_StaticMethods_verifyPkcs$self$$.$I$, $key$jscomp$58$$, $signature$jscomp$1$$, $data$jscomp$44$$);
};
_.$JSCompiler_StaticMethods_whenWithinViewport$$ = function($JSCompiler_StaticMethods_whenWithinViewport$self$$, $viewport$jscomp$4$$) {
  if (4 == $JSCompiler_StaticMethods_whenWithinViewport$self$$.$state_$ || 5 == $JSCompiler_StaticMethods_whenWithinViewport$self$$.$state_$ || !0 === $viewport$jscomp$4$$) {
    return window.Promise.resolve();
  }
  var $key$jscomp$59$$ = String($viewport$jscomp$4$$);
  if ($JSCompiler_StaticMethods_whenWithinViewport$self$$.$G$ && $JSCompiler_StaticMethods_whenWithinViewport$self$$.$G$[$key$jscomp$59$$]) {
    return $JSCompiler_StaticMethods_whenWithinViewport$self$$.$G$[$key$jscomp$59$$].$promise$;
  }
  if (_.$JSCompiler_StaticMethods_isWithinViewportRatio$$($JSCompiler_StaticMethods_whenWithinViewport$self$$, $viewport$jscomp$4$$)) {
    return window.Promise.resolve();
  }
  $JSCompiler_StaticMethods_whenWithinViewport$self$$.$G$ = $JSCompiler_StaticMethods_whenWithinViewport$self$$.$G$ || {};
  $JSCompiler_StaticMethods_whenWithinViewport$self$$.$G$[$key$jscomp$59$$] = new _.$Deferred$$module$src$utils$promise$$;
  return $JSCompiler_StaticMethods_whenWithinViewport$self$$.$G$[$key$jscomp$59$$].$promise$;
};
$installPolyfillsInChildWindow$$module$src$service$extensions_impl$$ = function($parentWin$jscomp$10$$, $childWin$jscomp$4$$) {
  _.$install$$module$src$polyfills$document_contains$$($childWin$jscomp$4$$);
  _.$install$$module$src$polyfills$domtokenlist_toggle$$($childWin$jscomp$4$$);
  _.$isExperimentOn$$module$src$experiments$$($parentWin$jscomp$10$$, "custom-elements-v1") ? _.$install$$module$src$polyfills$custom_elements$$($childWin$jscomp$4$$) : _.$installCustomElements$$module$document_register_element$build$document_register_element_patched$$($childWin$jscomp$4$$);
};
$installStandardServicesInEmbed$$module$src$service$extensions_impl$$ = function($childWin$jscomp$5$$, $parentWin$jscomp$11_standardServices$$) {
  var $frameElement$jscomp$1$$ = $childWin$jscomp$5$$.frameElement;
  $parentWin$jscomp$11_standardServices$$ = [_.$Services$$module$src$services$urlForDoc$$($frameElement$jscomp$1$$), _.$Services$$module$src$services$actionServiceForDoc$$($frameElement$jscomp$1$$), _.$getExistingServiceForDocInEmbedScope$$module$src$service$$($frameElement$jscomp$1$$, "standard-actions"), _.$Services$$module$src$services$navigationForDoc$$($frameElement$jscomp$1$$), _.$Services$$module$src$services$timerFor$$($parentWin$jscomp$11_standardServices$$)];
  var $ampdoc$jscomp$40$$ = _.$getAmpdoc$$module$src$service$$($frameElement$jscomp$1$$);
  $parentWin$jscomp$11_standardServices$$.forEach(function($parentWin$jscomp$11_standardServices$$) {
    $parentWin$jscomp$11_standardServices$$.constructor.$installInEmbedWindow$($childWin$jscomp$5$$, $ampdoc$jscomp$40$$);
  });
};
$JSCompiler_StaticMethods_removeForChildWindow$$ = function($JSCompiler_StaticMethods_removeForChildWindow$self$$, $childWin$jscomp$6$$) {
  $JSCompiler_StaticMethods_removeForChildWindow$self$$.$D$.filter(function($JSCompiler_StaticMethods_removeForChildWindow$self$$) {
    return $JSCompiler_StaticMethods_removeForChildWindow$self$$.$U$ == $childWin$jscomp$6$$;
  }).forEach(function($childWin$jscomp$6$$) {
    return _.$JSCompiler_StaticMethods_removeResource_$$($JSCompiler_StaticMethods_removeForChildWindow$self$$, $childWin$jscomp$6$$, !0);
  });
};
$copyBuiltinElementsToChildWindow$$module$src$service$extensions_impl$$ = function($parentWin$jscomp$9_toClass$jscomp$inline_1419$$, $childWin$jscomp$3$$) {
  var $toClass$jscomp$inline_1414$$ = _.$getExtendedElements$$module$src$service$custom_element_registry$$($parentWin$jscomp$9_toClass$jscomp$inline_1419$$)["amp-img"];
  _.$registerElement$$module$src$service$custom_element_registry$$($childWin$jscomp$3$$, "amp-img", $toClass$jscomp$inline_1414$$ || _.$ElementStub$$module$src$element_stub$$);
  $parentWin$jscomp$9_toClass$jscomp$inline_1419$$ = _.$getExtendedElements$$module$src$service$custom_element_registry$$($parentWin$jscomp$9_toClass$jscomp$inline_1419$$)["amp-pixel"];
  _.$registerElement$$module$src$service$custom_element_registry$$($childWin$jscomp$3$$, "amp-pixel", $parentWin$jscomp$9_toClass$jscomp$inline_1419$$ || _.$ElementStub$$module$src$element_stub$$);
};
$JSCompiler_StaticMethods_installExtensionsInChildWindow$$ = function($JSCompiler_StaticMethods_installExtensionsInChildWindow$self$$, $childWin$jscomp$2$$, $extensionIds$jscomp$1$$, $opt_preinstallCallback$$) {
  var $topWin$jscomp$3$$ = $JSCompiler_StaticMethods_installExtensionsInChildWindow$self$$.$win$, $parentWin$jscomp$8$$ = $childWin$jscomp$2$$.frameElement.ownerDocument.defaultView;
  $setParentWindow$$module$src$service$$($childWin$jscomp$2$$, $parentWin$jscomp$8$$);
  $installPolyfillsInChildWindow$$module$src$service$extensions_impl$$($parentWin$jscomp$8$$, $childWin$jscomp$2$$);
  $installStylesLegacy$$module$src$style_installer$$($childWin$jscomp$2$$.document, "html{overflow-x:hidden!important}body,html{height:auto!important}html.i-amphtml-fie{height:100%!important;width:100%!important}body{margin:0!important;-webkit-text-size-adjust:100%;-moz-text-size-adjust:100%;-ms-text-size-adjust:100%;text-size-adjust:100%}[hidden]{display:none!important}html.i-amphtml-singledoc.i-amphtml-embedded{-ms-touch-action:pan-y;touch-action:pan-y}html.i-amphtml-fie>body,html.i-amphtml-singledoc>body{overflow:visible!important}html.i-amphtml-fie:not(.i-amphtml-inabox)>body,html.i-amphtml-singledoc:not(.i-amphtml-inabox)>body{position:relative!important}html.i-amphtml-webview>body{overflow-x:hidden!important;overflow-y:visible!important;min-height:100vh!important}html.i-amphtml-ios-embed-legacy>body{overflow-x:hidden!important;overflow-y:auto!important;position:absolute!important}html.i-amphtml-ios-embed{overflow-y:auto!important;position:static}#i-amphtml-wrapper{overflow-x:hidden!important;overflow-y:auto!important;position:absolute!important;top:0!important;left:0!important;right:0!important;bottom:0!important;margin:0!important;display:block!important}html.i-amphtml-ios-embed.i-amphtml-ios-overscroll,html.i-amphtml-ios-embed.i-amphtml-ios-overscroll>#i-amphtml-wrapper{-webkit-overflow-scrolling:touch!important}#i-amphtml-wrapper>body{position:relative!important;border-top:1px solid transparent!important}html.i-amphtml-ios-embed-sd{overflow:hidden!important;position:static!important}html.i-amphtml-ios-embed-sd>body,html.i-amphtml-singledoc.i-amphtml-ios-embed-sd>body{position:absolute!important;top:0!important;left:0!important;right:0!important;bottom:0!important;overflow:hidden!important}.i-amphtml-body-minheight>body{min-height:calc(100vh + 1px)}.i-amphtml-element{display:inline-block}.i-amphtml-blurry-placeholder{-webkit-transition:opacity 0.3s cubic-bezier(0.0,0.0,0.2,1)!important;transition:opacity 0.3s cubic-bezier(0.0,0.0,0.2,1)!important}[layout=nodisplay]:not(.i-amphtml-element){display:none!important}.i-amphtml-layout-fixed,[layout=fixed][width][height]:not(.i-amphtml-layout-fixed){display:inline-block;position:relative}.i-amphtml-layout-responsive,[layout=responsive][width][height]:not(.i-amphtml-layout-responsive),[width][height][sizes]:not(.i-amphtml-layout-responsive){display:block;position:relative}.i-amphtml-layout-intrinsic{display:inline-block;position:relative;max-width:100%}.i-amphtml-intrinsic-sizer{max-width:100%;display:block!important}.i-amphtml-layout-container,.i-amphtml-layout-fixed-height,[layout=container],[layout=fixed-height][height]{display:block;position:relative}.i-amphtml-layout-fill,[layout=fill]:not(.i-amphtml-layout-fill){display:block;overflow:hidden!important;position:absolute;top:0;left:0;bottom:0;right:0}.i-amphtml-layout-flex-item,[layout=flex-item]:not(.i-amphtml-layout-flex-item){display:block;position:relative;-webkit-box-flex:1;-ms-flex:1 1 auto;flex:1 1 auto}.i-amphtml-layout-fluid{position:relative}.i-amphtml-layout-size-defined{overflow:hidden!important}.i-amphtml-layout-awaiting-size{position:absolute!important;top:auto!important;bottom:auto!important}i-amphtml-sizer{display:block!important}.i-amphtml-blurry-placeholder,.i-amphtml-fill-content{display:block;height:0;max-height:100%;max-width:100%;min-height:100%;min-width:100%;width:0;margin:auto}.i-amphtml-layout-size-defined .i-amphtml-fill-content{position:absolute;top:0;left:0;bottom:0;right:0}.i-amphtml-layout-intrinsic .i-amphtml-sizer{max-width:100%}.i-amphtml-replaced-content,.i-amphtml-screen-reader{padding:0!important;border:none!important}.i-amphtml-screen-reader{position:fixed!important;top:0px!important;left:0px!important;width:4px!important;height:4px!important;opacity:0!important;overflow:hidden!important;margin:0!important;display:block!important;visibility:visible!important}.i-amphtml-screen-reader~.i-amphtml-screen-reader{left:8px!important}.i-amphtml-screen-reader~.i-amphtml-screen-reader~.i-amphtml-screen-reader{left:12px!important}.i-amphtml-screen-reader~.i-amphtml-screen-reader~.i-amphtml-screen-reader~.i-amphtml-screen-reader{left:16px!important}.i-amphtml-unresolved{position:relative;overflow:hidden!important}#i-amphtml-wrapper.i-amphtml-scroll-disabled,.i-amphtml-scroll-disabled{overflow-x:hidden!important;overflow-y:hidden!important}.i-amphtml-select-disabled{-webkit-user-select:none!important;-moz-user-select:none!important;-ms-user-select:none!important;user-select:none!important}.i-amphtml-notbuilt,[layout]:not(.i-amphtml-element){position:relative;overflow:hidden!important;color:transparent!important}.i-amphtml-notbuilt:not(.i-amphtml-layout-container)>*,[layout]:not([layout=container]):not(.i-amphtml-element)>*{display:none}.i-amphtml-ghost{visibility:hidden!important}.i-amphtml-element>[placeholder],[layout]:not(.i-amphtml-element)>[placeholder]{display:block}.i-amphtml-element>[placeholder].amp-hidden,.i-amphtml-element>[placeholder].hidden{visibility:hidden}.i-amphtml-element:not(.amp-notsupported)>[fallback],.i-amphtml-layout-container>[placeholder].amp-hidden,.i-amphtml-layout-container>[placeholder].hidden{display:none}.i-amphtml-layout-size-defined>[fallback],.i-amphtml-layout-size-defined>[placeholder]{position:absolute!important;top:0!important;left:0!important;right:0!important;bottom:0!important;z-index:1}.i-amphtml-notbuilt>[placeholder]{display:block!important}.i-amphtml-hidden-by-media-query{display:none!important}.i-amphtml-element-error{background:red!important;color:#fff!important;position:relative!important}.i-amphtml-element-error:before{content:attr(error-message)}i-amp-scroll-container,i-amphtml-scroll-container{position:absolute;top:0;left:0;right:0;bottom:0;display:block}i-amp-scroll-container.amp-active,i-amphtml-scroll-container.amp-active{overflow:auto;-webkit-overflow-scrolling:touch}.i-amphtml-loading-container{display:block!important;pointer-events:none;z-index:1}.i-amphtml-notbuilt>.i-amphtml-loading-container{display:block!important}.i-amphtml-loading-container.amp-hidden{visibility:hidden}.i-amphtml-loader-line{position:absolute;top:0;left:0;right:0;height:1px;overflow:hidden!important;background-color:hsla(0,0%,59.2%,0.2);display:block}.i-amphtml-loader-moving-line{display:block;position:absolute;width:100%;height:100%!important;background-color:hsla(0,0%,59.2%,0.65);z-index:2}@-webkit-keyframes i-amphtml-loader-line-moving{0%{-webkit-transform:translateX(-100%);transform:translateX(-100%)}to{-webkit-transform:translateX(100%);transform:translateX(100%)}}@keyframes i-amphtml-loader-line-moving{0%{-webkit-transform:translateX(-100%);transform:translateX(-100%)}to{-webkit-transform:translateX(100%);transform:translateX(100%)}}.i-amphtml-loader-line.amp-active .i-amphtml-loader-moving-line{-webkit-animation:i-amphtml-loader-line-moving 4s ease infinite;animation:i-amphtml-loader-line-moving 4s ease infinite}.i-amphtml-loader{position:absolute;display:block;height:10px;top:50%;left:50%;-webkit-transform:translateX(-50%) translateY(-50%);transform:translateX(-50%) translateY(-50%);-webkit-transform-origin:50% 50%;transform-origin:50% 50%;white-space:nowrap}.i-amphtml-loader.amp-active .i-amphtml-loader-dot{-webkit-animation:i-amphtml-loader-dots 2s infinite;animation:i-amphtml-loader-dots 2s infinite}.i-amphtml-loader-dot{position:relative;display:inline-block;height:10px;width:10px;margin:2px;border-radius:100%;background-color:rgba(0,0,0,0.3);box-shadow:2px 2px 2px 1px rgba(0,0,0,0.2);will-change:transform}.i-amphtml-loader .i-amphtml-loader-dot:first-child{-webkit-animation-delay:0s;animation-delay:0s}.i-amphtml-loader .i-amphtml-loader-dot:nth-child(2){-webkit-animation-delay:.1s;animation-delay:.1s}.i-amphtml-loader .i-amphtml-loader-dot:nth-child(3){-webkit-animation-delay:.2s;animation-delay:.2s}@-webkit-keyframes i-amphtml-loader-dots{0%,to{-webkit-transform:scale(.7);transform:scale(.7);background-color:rgba(0,0,0,0.3)}50%{-webkit-transform:scale(.8);transform:scale(.8);background-color:rgba(0,0,0,0.5)}}@keyframes i-amphtml-loader-dots{0%,to{-webkit-transform:scale(.7);transform:scale(.7);background-color:rgba(0,0,0,0.3)}50%{-webkit-transform:scale(.8);transform:scale(.8);background-color:rgba(0,0,0,0.5)}}.i-amphtml-element>[overflow]{cursor:pointer;position:relative;z-index:2;visibility:hidden}.i-amphtml-element>[overflow].amp-visible{visibility:visible}template{display:none!important}.amp-border-box,.amp-border-box *,.amp-border-box :after,.amp-border-box :before{box-sizing:border-box}amp-pixel{display:none!important}amp-instagram{padding:64px 0px 0px!important;background-color:#fff}amp-analytics,amp-story-auto-ads{position:fixed!important;top:0!important;width:1px!important;height:1px!important;overflow:hidden!important;visibility:hidden}html.i-amphtml-fie>amp-analytics{position:initial!important}amp-iframe iframe{box-sizing:border-box!important}[amp-access][amp-access-hide]{display:none}[subscriptions-dialog],body:not(.i-amphtml-subs-ready) [subscriptions-action],body:not(.i-amphtml-subs-ready) [subscriptions-section]{display:none!important}[visible-when-invalid]:not(.visible),amp-experiment,amp-live-list>[update],amp-share-tracking,form [submit-error],form [submit-success],form [submitting]{display:none}.i-amphtml-jank-meter{position:fixed;background-color:rgba(232,72,95,0.5);bottom:0;right:0;color:#fff;font-size:16px;z-index:1000;padding:5px}amp-accordion{display:block!important}amp-accordion>section{float:none!important}amp-accordion>section>*{float:none!important;display:block!important;overflow:hidden!important;position:relative!important}.i-amphtml-accordion-content,.i-amphtml-accordion-header,amp-accordion,amp-accordion>section{margin:0}.i-amphtml-accordion-header{cursor:pointer;background-color:#efefef;padding-right:20px;border:1px solid #dfdfdf}amp-accordion>section>:last-child{display:none!important}amp-accordion>section[expanded]>:last-child{display:block!important}amp-list[resizable-children]>.i-amphtml-loading-container.amp-hidden{display:none!important}amp-list[load-more] [load-more-button],amp-list[load-more] [load-more-end],amp-list[load-more] [load-more-failed],amp-list[load-more] [load-more-loading]{display:none}amp-story-page,amp-story[standalone]{display:block!important;height:100%!important;margin:0!important;padding:0!important;overflow:hidden!important;width:100%!important}amp-story[standalone]{background-color:#fff!important;position:relative!important}amp-story-page{background-color:#757575}amp-story .i-amphtml-loader{display:none!important}[amp-fx^=fly-in]{visibility:hidden}amp-addthis[data-widget-type=floating]{position:fixed!important;width:100%!important;height:50px;bottom:0}\n/*# sourceURL=/css/amp.css*/", 
  null, !0, "amp-runtime");
  $opt_preinstallCallback$$ && $opt_preinstallCallback$$($childWin$jscomp$2$$);
  $installStandardServicesInEmbed$$module$src$service$extensions_impl$$($childWin$jscomp$2$$, $parentWin$jscomp$8$$);
  $copyBuiltinElementsToChildWindow$$module$src$service$extensions_impl$$($topWin$jscomp$3$$, $childWin$jscomp$2$$);
  _.$stubLegacyElements$$module$src$service$extensions_impl$$($childWin$jscomp$2$$);
  var $promises$jscomp$5$$ = [];
  $extensionIds$jscomp$1$$.forEach(function($extensionIds$jscomp$1$$) {
    _.$LEGACY_ELEMENTS$$module$src$service$extensions_impl$$.includes($extensionIds$jscomp$1$$) || _.$stubElementIfNotKnown$$module$src$service$custom_element_registry$$($childWin$jscomp$2$$, $extensionIds$jscomp$1$$);
    var $opt_preinstallCallback$$ = _.$JSCompiler_StaticMethods_preloadExtension$$($JSCompiler_StaticMethods_installExtensionsInChildWindow$self$$, $extensionIds$jscomp$1$$).then(function($JSCompiler_StaticMethods_installExtensionsInChildWindow$self$$) {
      $JSCompiler_StaticMethods_installExtensionsInChildWindow$self$$.services.forEach(function($JSCompiler_StaticMethods_installExtensionsInChildWindow$self$$) {
        $JSCompiler_StaticMethods_installExtensionsInChildWindow$self$$ = $JSCompiler_StaticMethods_installExtensionsInChildWindow$self$$.$serviceClass$;
        if ("function" === typeof $JSCompiler_StaticMethods_installExtensionsInChildWindow$self$$.$installInEmbedWindow$) {
          var $extensionIds$jscomp$1$$ = _.$getAmpdoc$$module$src$service$$($childWin$jscomp$2$$.frameElement);
          $JSCompiler_StaticMethods_installExtensionsInChildWindow$self$$.$installInEmbedWindow$($childWin$jscomp$2$$, $extensionIds$jscomp$1$$);
        }
      });
      var $opt_preinstallCallback$$ = null, $topWin$jscomp$3$$ = {}, $parentWin$jscomp$8$$;
      for ($parentWin$jscomp$8$$ in $JSCompiler_StaticMethods_installExtensionsInChildWindow$self$$.elements) {
        $topWin$jscomp$3$$.$elementName$ = $parentWin$jscomp$8$$;
        $topWin$jscomp$3$$.$elementDef$ = $JSCompiler_StaticMethods_installExtensionsInChildWindow$self$$.elements[$topWin$jscomp$3$$.$elementName$];
        var $promises$jscomp$5$$ = (new window.Promise(function($JSCompiler_StaticMethods_installExtensionsInChildWindow$self$$) {
          return function($opt_preinstallCallback$$) {
            $JSCompiler_StaticMethods_installExtensionsInChildWindow$self$$.$elementDef$.$css$ ? $installStylesLegacy$$module$src$style_installer$$($childWin$jscomp$2$$.document, $JSCompiler_StaticMethods_installExtensionsInChildWindow$self$$.$elementDef$.$css$, $opt_preinstallCallback$$, !1, $extensionIds$jscomp$1$$) : $opt_preinstallCallback$$();
          };
        }($topWin$jscomp$3$$))).then(function($JSCompiler_StaticMethods_installExtensionsInChildWindow$self$$) {
          return function() {
            _.$upgradeOrRegisterElement$$module$src$service$custom_element_registry$$($childWin$jscomp$2$$, $JSCompiler_StaticMethods_installExtensionsInChildWindow$self$$.$elementName$, $JSCompiler_StaticMethods_installExtensionsInChildWindow$self$$.$elementDef$.$implementationClass$);
          };
        }($topWin$jscomp$3$$));
        $opt_preinstallCallback$$ ? $opt_preinstallCallback$$.push($promises$jscomp$5$$) : $opt_preinstallCallback$$ = [$promises$jscomp$5$$];
        $topWin$jscomp$3$$ = {$elementDef$:$topWin$jscomp$3$$.$elementDef$, $elementName$:$topWin$jscomp$3$$.$elementName$};
      }
      return $opt_preinstallCallback$$ ? window.Promise.all($opt_preinstallCallback$$).then(function() {
        return $JSCompiler_StaticMethods_installExtensionsInChildWindow$self$$;
      }) : $JSCompiler_StaticMethods_installExtensionsInChildWindow$self$$;
    });
    $promises$jscomp$5$$.push($opt_preinstallCallback$$);
  });
  window.Promise.all($promises$jscomp$5$$);
};
$escapeHtmlChar$$module$src$dom$$ = function($c$$) {
  return $HTML_ESCAPE_CHARS$$module$src$dom$$[$c$$];
};
$escapeHtml$$module$src$dom$$ = function($text$jscomp$10$$) {
  return $text$jscomp$10$$ ? $text$jscomp$10$$.replace($HTML_ESCAPE_REGEX$$module$src$dom$$, $escapeHtmlChar$$module$src$dom$$) : $text$jscomp$10$$;
};
_.$whenUpgradedToCustomElement$$module$src$dom$$ = function($element$jscomp$25$$) {
  if ($element$jscomp$25$$.createdCallback) {
    return window.Promise.resolve($element$jscomp$25$$);
  }
  if (!$element$jscomp$25$$.__AMP_UPG_PRM) {
    var $deferred$$ = new _.$Deferred$$module$src$utils$promise$$;
    $element$jscomp$25$$.__AMP_UPG_PRM = $deferred$$.$promise$;
    $element$jscomp$25$$.__AMP_UPG_RES = $deferred$$.resolve;
  }
  return $element$jscomp$25$$.__AMP_UPG_PRM;
};
_.$randomlySelectUnsetExperiments$$module$src$experiments$$ = function($win$jscomp$26$$, $experiments$$) {
  $win$jscomp$26$$.$experimentBranches$ = $win$jscomp$26$$.$experimentBranches$ || {};
  var $selectedExperiments$$ = {}, $experimentName$$;
  for ($experimentName$$ in $experiments$$) {
    if (_.$hasOwn$$module$src$utils$object$$($experiments$$, $experimentName$$)) {
      if (_.$hasOwn$$module$src$utils$object$$($win$jscomp$26$$.$experimentBranches$, $experimentName$$)) {
        $selectedExperiments$$[$experimentName$$] = $win$jscomp$26$$.$experimentBranches$[$experimentName$$];
      } else {
        if (!$experiments$$[$experimentName$$].$isTrafficEligible$ || !$experiments$$[$experimentName$$].$isTrafficEligible$($win$jscomp$26$$)) {
          $win$jscomp$26$$.$experimentBranches$[$experimentName$$] = null;
        } else {
          if (!$win$jscomp$26$$.$experimentBranches$[$experimentName$$] && _.$isExperimentOn$$module$src$experiments$$($win$jscomp$26$$, $experimentName$$)) {
            var $arr$jscomp$inline_1922$$ = $experiments$$[$experimentName$$].$branches$;
            $win$jscomp$26$$.$experimentBranches$[$experimentName$$] = $arr$jscomp$inline_1922$$[Math.floor(Math.random() * $arr$jscomp$inline_1922$$.length)] || null;
            $selectedExperiments$$[$experimentName$$] = $win$jscomp$26$$.$experimentBranches$[$experimentName$$];
          }
        }
      }
    }
  }
  return $selectedExperiments$$;
};
_.$getExperimentBranch$$module$src$experiments$$ = function($win$jscomp$27$$, $experimentName$jscomp$1$$) {
  return $win$jscomp$27$$.$experimentBranches$ ? $win$jscomp$27$$.$experimentBranches$[$experimentName$jscomp$1$$] : null;
};
_.$isCancellation$$module$src$error$$ = function($errorOrMessage$$) {
  return $errorOrMessage$$ ? "string" == typeof $errorOrMessage$$ ? _.$startsWith$$module$src$string$$($errorOrMessage$$, "CANCELLED") : "string" == typeof $errorOrMessage$$.message ? _.$startsWith$$module$src$string$$($errorOrMessage$$.message, "CANCELLED") : !1 : !1;
};
$setFriendlyIframeEmbedVisible$$module$src$friendly_iframe_embed$$ = function($embed$$, $visible$jscomp$1$$) {
  _.$JSCompiler_StaticMethods_FriendlyIframeEmbed$$module$src$friendly_iframe_embed_prototype$setVisible_$$($embed$$, $visible$jscomp$1$$);
};
$mergeHtml$$module$src$friendly_iframe_embed$$ = function($spec$jscomp$1$$) {
  var $originalHtml$$ = $spec$jscomp$1$$.html, $originalHtmlUp$$ = $originalHtml$$.toUpperCase(), $ip$$ = $originalHtmlUp$$.indexOf("<HEAD");
  -1 != $ip$$ && ($ip$$ = $originalHtmlUp$$.indexOf(">", $ip$$ + 1) + 1);
  -1 == $ip$$ && ($ip$$ = $originalHtmlUp$$.indexOf("<BODY"));
  -1 == $ip$$ && ($ip$$ = $originalHtmlUp$$.indexOf("<HTML"), -1 != $ip$$ && ($ip$$ = $originalHtmlUp$$.indexOf(">", $ip$$ + 1) + 1));
  var $result$jscomp$11$$ = [];
  0 < $ip$$ && $result$jscomp$11$$.push($originalHtml$$.substring(0, $ip$$));
  $result$jscomp$11$$.push('<base href="' + $escapeHtml$$module$src$dom$$($spec$jscomp$1$$.url) + '">');
  $spec$jscomp$1$$.fonts && $spec$jscomp$1$$.fonts.forEach(function($spec$jscomp$1$$) {
    $result$jscomp$11$$.push('<link href="' + $escapeHtml$$module$src$dom$$($spec$jscomp$1$$) + '" rel="stylesheet" type="text/css">');
  });
  $result$jscomp$11$$.push("<meta http-equiv=Content-Security-Policy content=\"script-src 'none';object-src 'none';child-src 'none'\">");
  0 < $ip$$ ? $result$jscomp$11$$.push($originalHtml$$.substring($ip$$)) : $result$jscomp$11$$.push($originalHtml$$);
  return $result$jscomp$11$$.join("");
};
$isIframeReady$$module$src$friendly_iframe_embed$$ = function($childDoc$jscomp$1_iframe$jscomp$12$$) {
  $childDoc$jscomp$1_iframe$jscomp$12$$ = $childDoc$jscomp$1_iframe$jscomp$12$$.contentWindow && $childDoc$jscomp$1_iframe$jscomp$12$$.contentWindow.document;
  return !!($childDoc$jscomp$1_iframe$jscomp$12$$ && _.$isDocumentReady$$module$src$document_ready$$($childDoc$jscomp$1_iframe$jscomp$12$$) && $childDoc$jscomp$1_iframe$jscomp$12$$.body && $childDoc$jscomp$1_iframe$jscomp$12$$.body.firstChild);
};
$FriendlyIframeEmbed$$module$src$friendly_iframe_embed$$ = function($iframe$jscomp$13$$, $spec$jscomp$3$$, $loadedPromise$jscomp$1$$) {
  this.iframe = $iframe$jscomp$13$$;
  this.$win$ = $iframe$jscomp$13$$.contentWindow;
  this.spec = $spec$jscomp$3$$;
  this.host = $spec$jscomp$3$$.host || null;
  this.$G$ = Date.now();
  this.$visible_$ = !1;
  this.$F$ = new _.$Observable$$module$src$observable$$;
  this.$D$ = this.host ? this.host.signals() : new _.$Signals$$module$src$utils$signals$$;
  this.$I$ = window.Promise.all([$loadedPromise$jscomp$1$$, this.$whenReady$()]);
};
$JSCompiler_StaticMethods_startRender_$$ = function($JSCompiler_StaticMethods_startRender_$self$$) {
  $JSCompiler_StaticMethods_startRender_$self$$.host ? $JSCompiler_StaticMethods_startRender_$self$$.host.$renderStarted$() : _.$JSCompiler_StaticMethods_signal$$($JSCompiler_StaticMethods_startRender_$self$$.$D$, "render-start");
  _.$setStyle$$module$src$style$$($JSCompiler_StaticMethods_startRender_$self$$.iframe, "visibility", "");
  $JSCompiler_StaticMethods_startRender_$self$$.$win$.document && $JSCompiler_StaticMethods_startRender_$self$$.$win$.document.body && ($JSCompiler_StaticMethods_startRender_$self$$.$win$.document.documentElement.classList.add("i-amphtml-fie"), _.$setStyles$$module$src$style$$($JSCompiler_StaticMethods_startRender_$self$$.$win$.document.body, {opacity:1, visibility:"visible", animation:"none"}));
  var $rect$jscomp$5$$;
  $JSCompiler_StaticMethods_startRender_$self$$.host ? $rect$jscomp$5$$ = $JSCompiler_StaticMethods_startRender_$self$$.host.$getLayoutBox$() : $rect$jscomp$5$$ = _.$layoutRectLtwh$$module$src$layout_rect$$(0, 0, $JSCompiler_StaticMethods_startRender_$self$$.$win$.innerWidth, $JSCompiler_StaticMethods_startRender_$self$$.$win$.innerHeight);
  window.Promise.all([$JSCompiler_StaticMethods_startRender_$self$$.$whenReady$(), _.$whenContentIniLoad$$module$src$friendly_iframe_embed$$($JSCompiler_StaticMethods_startRender_$self$$.iframe, $JSCompiler_StaticMethods_startRender_$self$$.$win$, $rect$jscomp$5$$)]).then(function() {
    _.$JSCompiler_StaticMethods_signal$$($JSCompiler_StaticMethods_startRender_$self$$.$D$, "ini-load");
  });
};
_.$JSCompiler_StaticMethods_FriendlyIframeEmbed$$module$src$friendly_iframe_embed_prototype$setVisible_$$ = function($JSCompiler_StaticMethods_FriendlyIframeEmbed$$module$src$friendly_iframe_embed_prototype$setVisible_$self$$, $visible$jscomp$2$$) {
  $JSCompiler_StaticMethods_FriendlyIframeEmbed$$module$src$friendly_iframe_embed_prototype$setVisible_$self$$.$visible_$ != $visible$jscomp$2$$ && ($JSCompiler_StaticMethods_FriendlyIframeEmbed$$module$src$friendly_iframe_embed_prototype$setVisible_$self$$.$visible_$ = $visible$jscomp$2$$, $JSCompiler_StaticMethods_FriendlyIframeEmbed$$module$src$friendly_iframe_embed_prototype$setVisible_$self$$.$F$.$fire$($JSCompiler_StaticMethods_FriendlyIframeEmbed$$module$src$friendly_iframe_embed_prototype$setVisible_$self$$.$visible_$));
};
$JSCompiler_StaticMethods_measureMutate_$$ = function($JSCompiler_StaticMethods_measureMutate_$self$$, $task$jscomp$16$$) {
  _.$Services$$module$src$services$resourcesForDoc$$($JSCompiler_StaticMethods_measureMutate_$self$$.iframe).$measureMutateElement$($JSCompiler_StaticMethods_measureMutate_$self$$.iframe, $task$jscomp$16$$.measure || null, $task$jscomp$16$$.$mutate$);
};
_.$installFriendlyIframeEmbed$$module$src$friendly_iframe_embed$$ = function($iframe$jscomp$11$$, $childDoc_container$jscomp$6$$, $spec$$, $opt_preinstallCallback$jscomp$1$$) {
  function $registerViolationListener$$() {
    $iframe$jscomp$11$$.contentWindow.addEventListener("securitypolicyviolation", function($iframe$jscomp$11$$) {
      _.$dev$$module$src$log$$().$Log$$module$src$log_prototype$warn$("FIE", "security policy violation", $iframe$jscomp$11$$);
    });
  }
  var $win$jscomp$186$$ = _.$getTopWindow$$module$src$service$$($iframe$jscomp$11$$.ownerDocument.defaultView), $extensions$jscomp$2$$ = _.$Services$$module$src$services$extensionsFor$$($win$jscomp$186$$);
  _.$setStyle$$module$src$style$$($iframe$jscomp$11$$, "visibility", "hidden");
  $iframe$jscomp$11$$.setAttribute("referrerpolicy", "unsafe-url");
  $spec$$.$extensionIds$ && $spec$$.$extensionIds$.forEach(function($iframe$jscomp$11$$) {
    return _.$JSCompiler_StaticMethods_preloadExtension$$($extensions$jscomp$2$$, $iframe$jscomp$11$$);
  });
  var $html$jscomp$4$$ = $mergeHtml$$module$src$friendly_iframe_embed$$($spec$$);
  $iframe$jscomp$11$$.onload = function() {
    $iframe$jscomp$11$$.readyState = "complete";
  };
  void 0 === $srcdocSupported$$module$src$friendly_iframe_embed$$ && ($srcdocSupported$$module$src$friendly_iframe_embed$$ = "srcdoc" in window.HTMLIFrameElement.prototype);
  if ($srcdocSupported$$module$src$friendly_iframe_embed$$) {
    $iframe$jscomp$11$$.srcdoc = $html$jscomp$4$$;
    var $loadedPromise$$ = _.$loadPromise$$module$src$event_helper$$($iframe$jscomp$11$$);
    $childDoc_container$jscomp$6$$.appendChild($iframe$jscomp$11$$);
    $registerViolationListener$$();
  } else {
    $iframe$jscomp$11$$.src = "about:blank", $childDoc_container$jscomp$6$$.appendChild($iframe$jscomp$11$$), $childDoc_container$jscomp$6$$ = $iframe$jscomp$11$$.contentWindow.document, $childDoc_container$jscomp$6$$.open(), $registerViolationListener$$(), $childDoc_container$jscomp$6$$.write($html$jscomp$4$$), $loadedPromise$$ = _.$loadPromise$$module$src$event_helper$$($iframe$jscomp$11$$.contentWindow), $childDoc_container$jscomp$6$$.close();
  }
  return ($isIframeReady$$module$src$friendly_iframe_embed$$($iframe$jscomp$11$$) ? window.Promise.resolve() : new window.Promise(function($childDoc_container$jscomp$6$$) {
    var $spec$$ = $win$jscomp$186$$.setInterval(function() {
      $isIframeReady$$module$src$friendly_iframe_embed$$($iframe$jscomp$11$$) && ($childDoc_container$jscomp$6$$(), $win$jscomp$186$$.clearInterval($spec$$));
    }, 5);
    $loadedPromise$$.catch(function($iframe$jscomp$11$$) {
      _.$rethrowAsync$$module$src$log$$($iframe$jscomp$11$$);
    }).then(function() {
      $childDoc_container$jscomp$6$$();
      $win$jscomp$186$$.clearInterval($spec$$);
    });
  })).then(function() {
    var $childDoc_container$jscomp$6$$ = new $FriendlyIframeEmbed$$module$src$friendly_iframe_embed$$($iframe$jscomp$11$$, $spec$$, $loadedPromise$$);
    $iframe$jscomp$11$$.__AMP_EMBED__ = $childDoc_container$jscomp$6$$;
    $JSCompiler_StaticMethods_installExtensionsInChildWindow$$($extensions$jscomp$2$$, $iframe$jscomp$11$$.contentWindow, $spec$$.$extensionIds$ || [], $opt_preinstallCallback$jscomp$1$$);
    $JSCompiler_StaticMethods_startRender_$$($childDoc_container$jscomp$6$$);
    return $childDoc_container$jscomp$6$$;
  });
};
_.$getOrCreateAdCid$$module$src$ad_cid$$ = function($ampDoc$jscomp$1$$, $clientIdScope$$, $opt_clientIdCookieName$$, $opt_timeout$jscomp$2_timeout$jscomp$6$$) {
  $opt_timeout$jscomp$2_timeout$jscomp$6$$ = (0,window.isNaN)($opt_timeout$jscomp$2_timeout$jscomp$6$$) || null == $opt_timeout$jscomp$2_timeout$jscomp$6$$ ? 1000 : $opt_timeout$jscomp$2_timeout$jscomp$6$$;
  var $cidPromise$jscomp$1$$ = _.$Services$$module$src$services$cidForDoc$$($ampDoc$jscomp$1$$).then(function($ampDoc$jscomp$1$$) {
    if ($ampDoc$jscomp$1$$) {
      return $ampDoc$jscomp$1$$.get({scope:$clientIdScope$$, createCookieIfNotPresent:!0, $cookieName$:$opt_clientIdCookieName$$}, window.Promise.resolve(void 0)).catch(function($ampDoc$jscomp$1$$) {
        _.$dev$$module$src$log$$().error("AD-CID", $ampDoc$jscomp$1$$);
      });
    }
  });
  return _.$JSCompiler_StaticMethods_timeoutPromise$$(_.$Services$$module$src$services$timerFor$$($ampDoc$jscomp$1$$.$win$), $opt_timeout$jscomp$2_timeout$jscomp$6$$, $cidPromise$jscomp$1$$, "cid timeout").catch(function($ampDoc$jscomp$1$$) {
    _.$dev$$module$src$log$$().$Log$$module$src$log_prototype$warn$("AD-CID", $ampDoc$jscomp$1$$);
  });
};
_.$getAmpAdRenderOutsideViewport$$module$extensions$amp_ad$0_1$concurrent_load$$ = function($element$jscomp$238_rawValue$$) {
  $element$jscomp$238_rawValue$$ = $element$jscomp$238_rawValue$$.getAttribute("data-loading-strategy");
  if (null == $element$jscomp$238_rawValue$$) {
    return null;
  }
  if ("prefer-viewability-over-views" == $element$jscomp$238_rawValue$$ || "" == $element$jscomp$238_rawValue$$) {
    return 1.25;
  }
  var $errorMessage$$ = "Value of data-loading-strategy should be a float number in range of [0, 3], but got " + $element$jscomp$238_rawValue$$;
  return _.$JSCompiler_StaticMethods_assertNumber$$(_.$user$$module$src$log$$(), (0,window.parseFloat)($element$jscomp$238_rawValue$$), $errorMessage$$);
};
_.$incrementLoadingAds$$module$extensions$amp_ad$0_1$concurrent_load$$ = function($win$jscomp$240$$, $opt_loadingPromise$$) {
  void 0 === $win$jscomp$240$$["3pla"] && ($win$jscomp$240$$["3pla"] = 0);
  $win$jscomp$240$$["3pla"]++;
  if (!_.$throttlePromise_$$module$extensions$amp_ad$0_1$concurrent_load$$) {
    var $deferred$jscomp$23$$ = new _.$Deferred$$module$src$utils$promise$$;
    _.$throttlePromise_$$module$extensions$amp_ad$0_1$concurrent_load$$ = $deferred$jscomp$23$$.$promise$;
    $throttlePromiseResolver_$$module$extensions$amp_ad$0_1$concurrent_load$$ = $deferred$jscomp$23$$.resolve;
  }
  _.$JSCompiler_StaticMethods_timeoutPromise$$(_.$Services$$module$src$services$timerFor$$($win$jscomp$240$$), 1000, $opt_loadingPromise$$).catch(function() {
  }).then(function() {
    --$win$jscomp$240$$["3pla"] || ($throttlePromiseResolver_$$module$extensions$amp_ad$0_1$concurrent_load$$(), $throttlePromiseResolver_$$module$extensions$amp_ad$0_1$concurrent_load$$ = _.$throttlePromise_$$module$extensions$amp_ad$0_1$concurrent_load$$ = null);
  });
};
_.$buildUrl$$module$ads$google$a4a$url_builder$$ = function($baseUrl$jscomp$3$$, $queryParams$jscomp$1_truncatedValue$$, $capacity$jscomp$1_maxLength$$, $encodedTruncationParam_opt_truncationQueryParam$$) {
  var $encodedParams$$ = [];
  $encodedTruncationParam_opt_truncationQueryParam$$ = $encodedTruncationParam_opt_truncationQueryParam$$ && null != $encodedTruncationParam_opt_truncationQueryParam$$.value && "" !== $encodedTruncationParam_opt_truncationQueryParam$$.value ? (0,window.encodeURIComponent)($encodedTruncationParam_opt_truncationQueryParam$$.name) + "=" + (0,window.encodeURIComponent)(String($encodedTruncationParam_opt_truncationQueryParam$$.value)) : null;
  $capacity$jscomp$1_maxLength$$ -= $baseUrl$jscomp$3$$.length;
  $encodedTruncationParam_opt_truncationQueryParam$$ && ($capacity$jscomp$1_maxLength$$ -= $encodedTruncationParam_opt_truncationQueryParam$$.length + 1);
  for (var $keys$jscomp$3$$ = Object.keys($queryParams$jscomp$1_truncatedValue$$), $i$jscomp$143$$ = 0; $i$jscomp$143$$ < $keys$jscomp$3$$.length; $i$jscomp$143$$++) {
    var $encodedNameAndSep_key$jscomp$68$$ = $keys$jscomp$3$$[$i$jscomp$143$$], $encodedValue_value$jscomp$144$$ = $queryParams$jscomp$1_truncatedValue$$[$encodedNameAndSep_key$jscomp$68$$];
    if (null != $encodedValue_value$jscomp$144$$ && "" !== $encodedValue_value$jscomp$144$$) {
      $encodedNameAndSep_key$jscomp$68$$ = (0,window.encodeURIComponent)($encodedNameAndSep_key$jscomp$68$$) + "=";
      $encodedValue_value$jscomp$144$$ = (0,window.encodeURIComponent)(String($encodedValue_value$jscomp$144$$));
      var $fullLength$$ = $encodedNameAndSep_key$jscomp$68$$.length + $encodedValue_value$jscomp$144$$.length + 1;
      if ($fullLength$$ > $capacity$jscomp$1_maxLength$$) {
        ($queryParams$jscomp$1_truncatedValue$$ = $encodedValue_value$jscomp$144$$.substr(0, $capacity$jscomp$1_maxLength$$ - $encodedNameAndSep_key$jscomp$68$$.length - 1).replace(/%\w?$/, "")) && $encodedParams$$.push($encodedNameAndSep_key$jscomp$68$$ + $queryParams$jscomp$1_truncatedValue$$);
        $encodedTruncationParam_opt_truncationQueryParam$$ && $encodedParams$$.push($encodedTruncationParam_opt_truncationQueryParam$$);
        break;
      }
      $encodedParams$$.push($encodedNameAndSep_key$jscomp$68$$ + $encodedValue_value$jscomp$144$$);
      $capacity$jscomp$1_maxLength$$ -= $fullLength$$;
    }
  }
  return $encodedParams$$.length ? $baseUrl$jscomp$3$$ + "?" + $encodedParams$$.join("&") : $baseUrl$jscomp$3$$;
};
_.$getAdSenseAmpAutoAdsExpBranch$$module$ads$google$adsense_amp_auto_ads$$ = function($win$jscomp$242$$) {
  _.$randomlySelectUnsetExperiments$$module$src$experiments$$($win$jscomp$242$$, {"amp-auto-ads-adsense-holdout":$ADSENSE_AMP_AUTO_ADS_EXPERIMENT_INFO$$module$ads$google$adsense_amp_auto_ads$$});
  return _.$getExperimentBranch$$module$src$experiments$$($win$jscomp$242$$, "amp-auto-ads-adsense-holdout") || null;
};
_.$getAdSenseAmpAutoAdsResponsiveExperimentBranch$$module$ads$google$adsense_amp_auto_ads_responsive$$ = function($win$jscomp$244$$) {
  _.$randomlySelectUnsetExperiments$$module$src$experiments$$($win$jscomp$244$$, {"amp-auto-ads-adsense-responsive":$ADSENSE_AMP_AUTO_ADS_RESPONSIVE_EXPERIMENT_INFO$$module$ads$google$adsense_amp_auto_ads_responsive$$});
  return _.$getExperimentBranch$$module$src$experiments$$($win$jscomp$244$$, "amp-auto-ads-adsense-responsive") || null;
};
_.$getMatchedContentResponsiveHeight$$module$ads$google$utils$$ = function($width$jscomp$22$$) {
  return 1200 <= $width$jscomp$22$$ ? 600 : 850 <= $width$jscomp$22$$ ? Math.floor(0.5 * $width$jscomp$22$$) : 550 <= $width$jscomp$22$$ ? Math.floor(0.6 * $width$jscomp$22$$) : 468 <= $width$jscomp$22$$ ? Math.floor(0.7 * $width$jscomp$22$$) : Math.floor(3.44 * $width$jscomp$22$$);
};
$getNavigationTiming$$module$ads$google$a4a$utils$$ = function($win$jscomp$245$$, $timingEvent$$) {
  return $win$jscomp$245$$.performance && $win$jscomp$245$$.performance.timing && $win$jscomp$245$$.performance.timing[$timingEvent$$] || 0;
};
_.$isReportingEnabled$$module$ads$google$a4a$utils$$ = function($ampElement$jscomp$1_win$jscomp$248$$) {
  var $type$jscomp$135$$ = $ampElement$jscomp$1_win$jscomp$248$$.element.getAttribute("type");
  $ampElement$jscomp$1_win$jscomp$248$$ = $ampElement$jscomp$1_win$jscomp$248$$.$win$;
  return ("doubleclick" == $type$jscomp$135$$ || "adsense" == $type$jscomp$135$$) && _.$isExperimentOn$$module$src$experiments$$($ampElement$jscomp$1_win$jscomp$248$$, "a4aProfilingRate");
};
_.$googleBlockParameters$$module$ads$google$a4a$utils$$ = function($a4a_slotRect$$, $opt_experimentIds$$) {
  var $adElement$jscomp$1$$ = $a4a_slotRect$$.element, $JSCompiler_inline_result$jscomp$554_w$jscomp$inline_1928_win$jscomp$249$$ = $a4a_slotRect$$.$win$;
  $a4a_slotRect$$ = $a4a_slotRect$$.$getPageLayoutBox$();
  for (var $depth$jscomp$inline_1929_enclosingContainers$$ = 0; $JSCompiler_inline_result$jscomp$554_w$jscomp$inline_1928_win$jscomp$249$$ != $JSCompiler_inline_result$jscomp$554_w$jscomp$inline_1928_win$jscomp$249$$.parent && 100 > $depth$jscomp$inline_1929_enclosingContainers$$;) {
    $JSCompiler_inline_result$jscomp$554_w$jscomp$inline_1928_win$jscomp$249$$ = $JSCompiler_inline_result$jscomp$554_w$jscomp$inline_1928_win$jscomp$249$$.parent, $depth$jscomp$inline_1929_enclosingContainers$$++;
  }
  $JSCompiler_inline_result$jscomp$554_w$jscomp$inline_1928_win$jscomp$249$$ = $depth$jscomp$inline_1929_enclosingContainers$$;
  $depth$jscomp$inline_1929_enclosingContainers$$ = _.$getEnclosingContainerTypes$$module$ads$google$a4a$utils$$($adElement$jscomp$1$$);
  var $eids$$ = $adElement$jscomp$1$$.getAttribute("data-experiment-id");
  $opt_experimentIds$$ && ($eids$$ = $mergeExperimentIds$$module$ads$google$a4a$utils$$($opt_experimentIds$$, $eids$$));
  return {adf:_.$stringHash32$$module$src$string$$(_.$domFingerprintPlain$$module$src$utils$dom_fingerprint$$($adElement$jscomp$1$$)), nhd:$JSCompiler_inline_result$jscomp$554_w$jscomp$inline_1928_win$jscomp$249$$, eid:$eids$$, adx:$a4a_slotRect$$.left, ady:$a4a_slotRect$$.top, oid:"2", act:$depth$jscomp$inline_1929_enclosingContainers$$.length ? $depth$jscomp$inline_1929_enclosingContainers$$.join() : null};
};
_.$googlePageParameters$$module$ads$google$a4a$utils$$ = function($a4a$jscomp$1$$, $startTime$jscomp$11$$) {
  var $win$jscomp$251$$ = $a4a$jscomp$1$$.$win$, $ampDoc$jscomp$2$$ = $a4a$jscomp$1$$.$getAmpDoc$(), $referrerPromise$$ = _.$JSCompiler_StaticMethods_timeoutPromise$$(_.$Services$$module$src$services$timerFor$$($win$jscomp$251$$), 1000, _.$Services$$module$src$services$viewerForDoc$$($ampDoc$jscomp$2$$).$I$).catch(function() {
    _.$dev$$module$src$log$$().$expectedError$("AMP-A4A", "Referrer timeout!");
    return "";
  }), $domLoading$$ = $getNavigationTiming$$module$ads$google$a4a$utils$$($win$jscomp$251$$, "domLoading");
  return window.Promise.all([_.$getOrCreateAdCid$$module$src$ad_cid$$($ampDoc$jscomp$2$$, "AMP_ECID_GOOGLE", "_ga"), $referrerPromise$$]).then(function($referrerPromise$$) {
    var $promiseResults_referrer$jscomp$4$$ = $referrerPromise$$[0];
    $referrerPromise$$ = $referrerPromise$$[1];
    var $$jscomp$destructuring$var189_canonicalUrl$jscomp$4$$ = _.$Services$$module$src$services$documentInfoForDoc$$($ampDoc$jscomp$2$$), $JSCompiler_temp_const$jscomp$556_pageViewId$jscomp$1$$ = $$jscomp$destructuring$var189_canonicalUrl$jscomp$4$$.pageViewId;
    $$jscomp$destructuring$var189_canonicalUrl$jscomp$4$$ = $$jscomp$destructuring$var189_canonicalUrl$jscomp$4$$.canonicalUrl;
    $win$jscomp$251$$.$gaGlobal$ = $win$jscomp$251$$.$gaGlobal$ || {$cid$:$promiseResults_referrer$jscomp$4$$, $hid$:$JSCompiler_temp_const$jscomp$556_pageViewId$jscomp$1$$};
    var $JSCompiler_temp_const$jscomp$569_screen$jscomp$4$$ = $win$jscomp$251$$.screen, $JSCompiler_temp_const$jscomp$561_viewport$jscomp$11$$ = _.$Services$$module$src$services$viewportForDoc$$($ampDoc$jscomp$2$$), $JSCompiler_temp_const$jscomp$574_viewportRect$jscomp$2$$ = _.$JSCompiler_StaticMethods_getRect$$($JSCompiler_temp_const$jscomp$561_viewport$jscomp$11$$), $JSCompiler_temp_const$jscomp$565_viewportSize$jscomp$3$$ = $JSCompiler_temp_const$jscomp$561_viewport$jscomp$11$$.$getSize$(), $JSCompiler_temp_const$jscomp$563_visibilityState$jscomp$1$$ = 
    _.$Services$$module$src$services$viewerForDoc$$($ampDoc$jscomp$2$$).$G$;
    $JSCompiler_temp_const$jscomp$556_pageViewId$jscomp$1$$ = $a4a$jscomp$1$$.$isXhrAllowed$() ? "3" : "5";
    $promiseResults_referrer$jscomp$4$$ = $getCorrelator$$module$ads$google$a4a$utils$$($win$jscomp$251$$, $ampDoc$jscomp$2$$, $promiseResults_referrer$jscomp$4$$);
    try {
      var $JSCompiler_inline_result$jscomp$557_JSCompiler_temp_const$jscomp$567$$ = $win$jscomp$251$$.history.length;
    } catch ($e$186$jscomp$inline_1932$$) {
      $JSCompiler_inline_result$jscomp$557_JSCompiler_temp_const$jscomp$567$$ = 0;
    }
    var $JSCompiler_temp_const$jscomp$577$$ = $win$jscomp$251$$.$gaGlobal$.$cid$ || null, $JSCompiler_temp_const$jscomp$576$$ = $win$jscomp$251$$.$gaGlobal$.$hid$ || null, $JSCompiler_temp_const$jscomp$575$$ = $JSCompiler_temp_const$jscomp$574_viewportRect$jscomp$2$$.width;
    $JSCompiler_temp_const$jscomp$574_viewportRect$jscomp$2$$ = $JSCompiler_temp_const$jscomp$574_viewportRect$jscomp$2$$.height;
    var $JSCompiler_temp_const$jscomp$573$$ = $JSCompiler_temp_const$jscomp$569_screen$jscomp$4$$ ? $JSCompiler_temp_const$jscomp$569_screen$jscomp$4$$.availWidth : null, $JSCompiler_temp_const$jscomp$572$$ = $JSCompiler_temp_const$jscomp$569_screen$jscomp$4$$ ? $JSCompiler_temp_const$jscomp$569_screen$jscomp$4$$.availHeight : null, $JSCompiler_temp_const$jscomp$571$$ = $JSCompiler_temp_const$jscomp$569_screen$jscomp$4$$ ? $JSCompiler_temp_const$jscomp$569_screen$jscomp$4$$.colorDepth : null, $JSCompiler_temp_const$jscomp$570$$ = 
    $JSCompiler_temp_const$jscomp$569_screen$jscomp$4$$ ? $JSCompiler_temp_const$jscomp$569_screen$jscomp$4$$.width : null;
    $JSCompiler_temp_const$jscomp$569_screen$jscomp$4$$ = $JSCompiler_temp_const$jscomp$569_screen$jscomp$4$$ ? $JSCompiler_temp_const$jscomp$569_screen$jscomp$4$$.height : null;
    var $JSCompiler_temp_const$jscomp$568$$ = -(new Date).getTimezoneOffset(), $JSCompiler_temp_const$jscomp$566$$ = $win$jscomp$251$$ != $win$jscomp$251$$.top ? $JSCompiler_temp_const$jscomp$565_viewportSize$jscomp$3$$.width : null;
    $JSCompiler_temp_const$jscomp$565_viewportSize$jscomp$3$$ = $win$jscomp$251$$ != $win$jscomp$251$$.top ? $JSCompiler_temp_const$jscomp$565_viewportSize$jscomp$3$$.height : null;
    var $JSCompiler_temp_const$jscomp$564_art$jscomp$inline_1935$$ = $getBinaryTypeNumericalCode$$module$ads$google$a4a$utils$$(_.$getBinaryType$$module$src$experiments$$($win$jscomp$251$$));
    $JSCompiler_temp_const$jscomp$564_art$jscomp$inline_1935$$ = _.$isCdnProxy$$module$ads$google$a4a$utils$$($win$jscomp$251$$) && "0" != $JSCompiler_temp_const$jscomp$564_art$jscomp$inline_1935$$ ? $JSCompiler_temp_const$jscomp$564_art$jscomp$inline_1935$$ : null;
    $JSCompiler_temp_const$jscomp$563_visibilityState$jscomp$1$$ = $visibilityStateCodes$$module$ads$google$a4a$utils$$[$JSCompiler_temp_const$jscomp$563_visibilityState$jscomp$1$$] || "0";
    var $JSCompiler_temp_const$jscomp$562$$ = $JSCompiler_temp_const$jscomp$561_viewport$jscomp$11$$.getScrollLeft();
    $JSCompiler_temp_const$jscomp$561_viewport$jscomp$11$$ = _.$JSCompiler_StaticMethods_Viewport$$module$src$service$viewport$viewport_impl_prototype$getScrollTop$$($JSCompiler_temp_const$jscomp$561_viewport$jscomp$11$$);
    var $browserCapabilities$jscomp$inline_1938$$ = 0, $doc$jscomp$inline_1939_iframeEl$jscomp$inline_1940$$ = $win$jscomp$251$$.document;
    $win$jscomp$251$$.$SVGElement$ && $doc$jscomp$inline_1939_iframeEl$jscomp$inline_1940$$.createElementNS && ($browserCapabilities$jscomp$inline_1938$$ |= $Capability$$module$ads$google$a4a$utils$SVG_SUPPORTED$$);
    $doc$jscomp$inline_1939_iframeEl$jscomp$inline_1940$$ = $doc$jscomp$inline_1939_iframeEl$jscomp$inline_1940$$.createElement("iframe");
    $doc$jscomp$inline_1939_iframeEl$jscomp$inline_1940$$.sandbox && $doc$jscomp$inline_1939_iframeEl$jscomp$inline_1940$$.sandbox.supports && ($doc$jscomp$inline_1939_iframeEl$jscomp$inline_1940$$.sandbox.supports("allow-top-navigation-by-user-activation") && ($browserCapabilities$jscomp$inline_1938$$ |= $Capability$$module$ads$google$a4a$utils$SANDBOXING_ALLOW_TOP_NAVIGATION_BY_USER_ACTIVATION_SUPPORTED$$), $doc$jscomp$inline_1939_iframeEl$jscomp$inline_1940$$.sandbox.supports("allow-popups-to-escape-sandbox") && 
    ($browserCapabilities$jscomp$inline_1938$$ |= $Capability$$module$ads$google$a4a$utils$SANDBOXING_ALLOW_POPUPS_TO_ESCAPE_SANDBOX_SUPPORTED$$));
    return {is_amp:$JSCompiler_temp_const$jscomp$556_pageViewId$jscomp$1$$, amp_v:"1901181729101", d_imp:"1", c:$promiseResults_referrer$jscomp$4$$, ga_cid:$JSCompiler_temp_const$jscomp$577$$, ga_hid:$JSCompiler_temp_const$jscomp$576$$, dt:$startTime$jscomp$11$$, biw:$JSCompiler_temp_const$jscomp$575$$, bih:$JSCompiler_temp_const$jscomp$574_viewportRect$jscomp$2$$, u_aw:$JSCompiler_temp_const$jscomp$573$$, u_ah:$JSCompiler_temp_const$jscomp$572$$, u_cd:$JSCompiler_temp_const$jscomp$571$$, 
    u_w:$JSCompiler_temp_const$jscomp$570$$, u_h:$JSCompiler_temp_const$jscomp$569_screen$jscomp$4$$, u_tz:$JSCompiler_temp_const$jscomp$568$$, u_his:$JSCompiler_inline_result$jscomp$557_JSCompiler_temp_const$jscomp$567$$, isw:$JSCompiler_temp_const$jscomp$566$$, ish:$JSCompiler_temp_const$jscomp$565_viewportSize$jscomp$3$$, art:$JSCompiler_temp_const$jscomp$564_art$jscomp$inline_1935$$, vis:$JSCompiler_temp_const$jscomp$563_visibilityState$jscomp$1$$, scr_x:$JSCompiler_temp_const$jscomp$562$$, scr_y:$JSCompiler_temp_const$jscomp$561_viewport$jscomp$11$$, 
    bc:$browserCapabilities$jscomp$inline_1938$$ || null, debug_experiment_id:(/(?:#|,)deid=([\d,]+)/i.exec($win$jscomp$251$$.location.hash) || [])[1] || null, url:$$jscomp$destructuring$var189_canonicalUrl$jscomp$4$$ || null, top:$win$jscomp$251$$ != $win$jscomp$251$$.top ? $topWindowUrlOrDomain$$module$ads$google$a4a$utils$$($win$jscomp$251$$) : null, loc:$win$jscomp$251$$.location.href == $$jscomp$destructuring$var189_canonicalUrl$jscomp$4$$ ? null : $win$jscomp$251$$.location.href, ref:$referrerPromise$$ || 
    null, bdt:$domLoading$$ ? $startTime$jscomp$11$$ - $domLoading$$ : null};
  });
};
_.$googleAdUrl$$module$ads$google$a4a$utils$$ = function($a4a$jscomp$2$$, $baseUrl$jscomp$4$$, $startTime$jscomp$12$$, $parameters$$, $opt_experimentIds$jscomp$1$$) {
  var $blockLevelParameters$$ = _.$googleBlockParameters$$module$ads$google$a4a$utils$$($a4a$jscomp$2$$, $opt_experimentIds$jscomp$1$$);
  return _.$googlePageParameters$$module$ads$google$a4a$utils$$($a4a$jscomp$2$$, $startTime$jscomp$12$$).then(function($a4a$jscomp$2$$) {
    Object.assign($parameters$$, $blockLevelParameters$$, $a4a$jscomp$2$$);
    return _.$truncAndTimeUrl$$module$ads$google$a4a$utils$$($baseUrl$jscomp$4$$, $parameters$$, $startTime$jscomp$12$$);
  });
};
_.$truncAndTimeUrl$$module$ads$google$a4a$utils$$ = function($JSCompiler_temp_const$jscomp$558_baseUrl$jscomp$5$$, $parameters$jscomp$1$$, $duration$jscomp$inline_1944_startTime$jscomp$13$$) {
  $JSCompiler_temp_const$jscomp$558_baseUrl$jscomp$5$$ = _.$buildUrl$$module$ads$google$a4a$url_builder$$($JSCompiler_temp_const$jscomp$558_baseUrl$jscomp$5$$, $parameters$jscomp$1$$, 16374, $TRUNCATION_PARAM$$module$ads$google$a4a$utils$$) + "&dtd=";
  $duration$jscomp$inline_1944_startTime$jscomp$13$$ = Date.now() - $duration$jscomp$inline_1944_startTime$jscomp$13$$;
  return $JSCompiler_temp_const$jscomp$558_baseUrl$jscomp$5$$ + (1e6 <= $duration$jscomp$inline_1944_startTime$jscomp$13$$ ? "M" : 0 <= $duration$jscomp$inline_1944_startTime$jscomp$13$$ ? $duration$jscomp$inline_1944_startTime$jscomp$13$$ : "-M");
};
$extractHost$$module$ads$google$a4a$utils$$ = function($url$jscomp$102$$) {
  return (/^(?:https?:\/\/)?([^\/\?:]+)/i.exec($url$jscomp$102$$) || [])[1] || $url$jscomp$102$$;
};
$topWindowUrlOrDomain$$module$ads$google$a4a$utils$$ = function($secondFromTop$188_win$jscomp$254$$) {
  var $ancestorOrigins$$ = $secondFromTop$188_win$jscomp$254$$.location.ancestorOrigins;
  if ($ancestorOrigins$$) {
    var $origin$jscomp$18$$ = $secondFromTop$188_win$jscomp$254$$.location.origin, $topOrigin$$ = $ancestorOrigins$$[$ancestorOrigins$$.length - 1];
    if ($origin$jscomp$18$$ == $topOrigin$$) {
      return $secondFromTop$188_win$jscomp$254$$.top.location.hostname;
    }
    var $secondFromTop$$ = $secondWindowFromTop$$module$ads$google$a4a$utils$$($secondFromTop$188_win$jscomp$254$$);
    return $secondFromTop$$ == $secondFromTop$188_win$jscomp$254$$ || $origin$jscomp$18$$ == $ancestorOrigins$$[$ancestorOrigins$$.length - 2] ? $extractHost$$module$ads$google$a4a$utils$$($secondFromTop$$.document.referrer) : $extractHost$$module$ads$google$a4a$utils$$($topOrigin$$);
  }
  try {
    return $secondFromTop$188_win$jscomp$254$$.top.location.hostname;
  } catch ($e$187$$) {
  }
  $secondFromTop$188_win$jscomp$254$$ = $secondWindowFromTop$$module$ads$google$a4a$utils$$($secondFromTop$188_win$jscomp$254$$);
  try {
    return $extractHost$$module$ads$google$a4a$utils$$($secondFromTop$188_win$jscomp$254$$.document.referrer);
  } catch ($e$189$$) {
  }
  return null;
};
$secondWindowFromTop$$module$ads$google$a4a$utils$$ = function($secondFromTop$jscomp$1_win$jscomp$255$$) {
  for (var $depth$jscomp$6$$ = 0; $secondFromTop$jscomp$1_win$jscomp$255$$.parent != $secondFromTop$jscomp$1_win$jscomp$255$$.parent.parent && 100 > $depth$jscomp$6$$;) {
    $secondFromTop$jscomp$1_win$jscomp$255$$ = $secondFromTop$jscomp$1_win$jscomp$255$$.parent, $depth$jscomp$6$$++;
  }
  return $secondFromTop$jscomp$1_win$jscomp$255$$;
};
$getCorrelator$$module$ads$google$a4a$utils$$ = function($win$jscomp$256$$, $elementOrAmpDoc$jscomp$22_pageViewId$jscomp$inline_1946_pageViewIdNumeric$jscomp$inline_1948$$, $JSCompiler_temp$jscomp$560_opt_cid$$) {
  $win$jscomp$256$$.$ampAdPageCorrelator$ || (_.$isExperimentOn$$module$src$experiments$$($win$jscomp$256$$, "exp-new-correlator") ? $JSCompiler_temp$jscomp$560_opt_cid$$ = Math.floor(4503599627370496 * Math.random()) : ($elementOrAmpDoc$jscomp$22_pageViewId$jscomp$inline_1946_pageViewIdNumeric$jscomp$inline_1948$$ = _.$Services$$module$src$services$documentInfoForDoc$$($elementOrAmpDoc$jscomp$22_pageViewId$jscomp$inline_1946_pageViewIdNumeric$jscomp$inline_1948$$).pageViewId, $elementOrAmpDoc$jscomp$22_pageViewId$jscomp$inline_1946_pageViewIdNumeric$jscomp$inline_1948$$ = 
  Number($elementOrAmpDoc$jscomp$22_pageViewId$jscomp$inline_1946_pageViewIdNumeric$jscomp$inline_1948$$ || 0), $JSCompiler_temp$jscomp$560_opt_cid$$ = $JSCompiler_temp$jscomp$560_opt_cid$$ ? $elementOrAmpDoc$jscomp$22_pageViewId$jscomp$inline_1946_pageViewIdNumeric$jscomp$inline_1948$$ + $JSCompiler_temp$jscomp$560_opt_cid$$.replace(/\D/g, "") % 1e6 * 1e6 : Math.floor(4503599627370496 * Math.random())), $win$jscomp$256$$.$ampAdPageCorrelator$ = $JSCompiler_temp$jscomp$560_opt_cid$$);
  return $win$jscomp$256$$.$ampAdPageCorrelator$;
};
$csiTrigger$$module$ads$google$a4a$utils$$ = function($on$jscomp$3$$, $params$jscomp$15$$) {
  return _.$dict$$module$src$utils$object$$({on:$on$jscomp$3$$, request:"csi", sampleSpec:{sampleOn:"a4a-csi-${pageViewId}", threshold:1}, selector:"amp-ad", selectionMethod:"closest", extraUrlParams:$params$jscomp$15$$});
};
_.$getCsiAmpAnalyticsConfig$$module$ads$google$a4a$utils$$ = function() {
  return _.$dict$$module$src$utils$object$$({requests:{csi:"https://csi.gstatic.com/csi?"}, transport:{xhrpost:!1}, triggers:{adRequestStart:$csiTrigger$$module$ads$google$a4a$utils$$("ad-request-start", {"met.a4a":"afs_lvt.${viewerLastVisibleTime}~afs.${time}"}), adResponseEnd:$csiTrigger$$module$ads$google$a4a$utils$$("ad-response-end", {"met.a4a":"afe.${time}"}), adRenderStart:$csiTrigger$$module$ads$google$a4a$utils$$("ad-render-start", {"met.a4a":"ast.${scheduleTime}~ars_lvt.${viewerLastVisibleTime}~ars.${time}", 
  qqid:"${qqid}"}), adIframeLoaded:$csiTrigger$$module$ads$google$a4a$utils$$("ad-iframe-loaded", {"met.a4a":"ail.${time}"})}, extraUrlParams:{s:"ampad", ctx:"2", c:"${correlator}", slotId:"${slotId}", puid:"${requestCount}~${timestamp}"}});
};
_.$getCsiAmpAnalyticsVariables$$module$ads$google$a4a$utils$$ = function($analyticsTrigger$$, $a4a$jscomp$3$$, $qqid$$) {
  var $vars$jscomp$5_win$jscomp$258$$ = $a4a$jscomp$3$$.$win$, $ampdoc$jscomp$101$$ = $a4a$jscomp$3$$.$getAmpDoc$(), $viewer$jscomp$28$$ = _.$Services$$module$src$services$viewerForDoc$$($ampdoc$jscomp$101$$), $navStart$$ = $getNavigationTiming$$module$ads$google$a4a$utils$$($vars$jscomp$5_win$jscomp$258$$, "navigationStart");
  $vars$jscomp$5_win$jscomp$258$$ = {correlator:$getCorrelator$$module$ads$google$a4a$utils$$($vars$jscomp$5_win$jscomp$258$$, $ampdoc$jscomp$101$$), slotId:$a4a$jscomp$3$$.element.getAttribute("data-amp-slot-index"), viewerLastVisibleTime:$viewer$jscomp$28$$.$ga$ - $navStart$$};
  $qqid$$ && ($vars$jscomp$5_win$jscomp$258$$.qqid = $qqid$$);
  "ad-render-start" == $analyticsTrigger$$ && ($vars$jscomp$5_win$jscomp$258$$.scheduleTime = $a4a$jscomp$3$$.element.$layoutScheduleTime$ - $navStart$$);
  return $vars$jscomp$5_win$jscomp$258$$;
};
_.$extractAmpAnalyticsConfig$$module$ads$google$a4a$utils$$ = function($responseHeaders$$) {
  if (!$responseHeaders$$.has("X-AmpAnalytics")) {
    return null;
  }
  try {
    var $analyticsConfig_config$jscomp$6$$ = _.$parseJson$$module$src$json$$($responseHeaders$$.get("X-AmpAnalytics"));
    Array.isArray($analyticsConfig_config$jscomp$6$$.url);
    var $urls$$ = $analyticsConfig_config$jscomp$6$$.url;
    if (!$urls$$.length) {
      return null;
    }
    $analyticsConfig_config$jscomp$6$$ = {transport:{beacon:!1, xhrpost:!1}, triggers:{continuousVisible:{on:"visible", visibilitySpec:{selector:"amp-ad", selectionMethod:"closest", visiblePercentageMin:50, continuousTimeMin:1000}}}};
    for (var $requests$jscomp$1$$ = {}, $idx$$ = 1; $idx$$ <= $urls$$.length; $idx$$++) {
      $requests$jscomp$1$$["visibility" + $idx$$] = "" + $urls$$[$idx$$ - 1];
    }
    $analyticsConfig_config$jscomp$6$$.requests = $requests$jscomp$1$$;
    $analyticsConfig_config$jscomp$6$$.triggers.continuousVisible.request = Object.keys($requests$jscomp$1$$);
    return $analyticsConfig_config$jscomp$6$$;
  } catch ($err$jscomp$8$$) {
    _.$dev$$module$src$log$$().error("AMP-A4A", "Invalid analytics", $err$jscomp$8$$, $responseHeaders$$.get("X-AmpAnalytics"));
  }
  return null;
};
$mergeExperimentIds$$module$ads$google$a4a$utils$$ = function($newIdString_newIds$$, $currentIdString$$) {
  $newIdString_newIds$$ = $newIdString_newIds$$.filter(function($newIdString_newIds$$) {
    return Number($newIdString_newIds$$);
  }).join(",");
  $currentIdString$$ = $currentIdString$$ || "";
  return $currentIdString$$ + ($currentIdString$$ && $newIdString_newIds$$ ? "," : "") + $newIdString_newIds$$;
};
_.$addCsiSignalsToAmpAnalyticsConfig$$module$ads$google$a4a$utils$$ = function($deltaTime_win$jscomp$259$$, $adType_element$jscomp$240$$, $config$jscomp$7$$, $baseCsiUrl_qqid$jscomp$1$$, $isAmpSuffix_isVerifiedAmpCreative$$) {
  var $correlator$$ = $getCorrelator$$module$ads$google$a4a$utils$$($deltaTime_win$jscomp$259$$, $adType_element$jscomp$240$$), $slotId$$ = Number($adType_element$jscomp$240$$.getAttribute("data-amp-slot-index")), $eids$jscomp$1$$ = (0,window.encodeURIComponent)($adType_element$jscomp$240$$.getAttribute("data-experiment-id"));
  $adType_element$jscomp$240$$ = $adType_element$jscomp$240$$.getAttribute("type");
  var $initTime$$ = Number(_.$getTimingDataSync$$module$src$service$variable_source$$($deltaTime_win$jscomp$259$$, "navigationStart") || Date.now());
  $deltaTime_win$jscomp$259$$ = Math.round($deltaTime_win$jscomp$259$$.performance && $deltaTime_win$jscomp$259$$.performance.now ? $deltaTime_win$jscomp$259$$.performance.now() : Date.now() - $initTime$$);
  $baseCsiUrl_qqid$jscomp$1$$ = "https://csi.gstatic.com/csi?s=a4a" + ("&c=" + $correlator$$ + "&slotId=" + $slotId$$ + "&qqid." + $slotId$$ + "=" + $baseCsiUrl_qqid$jscomp$1$$) + ("&dt=" + $initTime$$) + ("null" != $eids$jscomp$1$$ ? "&e." + $slotId$$ + "=" + $eids$jscomp$1$$ : "") + ("&rls=1901181729101&adt." + $slotId$$ + "=" + $adType_element$jscomp$240$$);
  $isAmpSuffix_isVerifiedAmpCreative$$ = $isAmpSuffix_isVerifiedAmpCreative$$ ? "Friendly" : "CrossDomain";
  $config$jscomp$7$$.triggers.continuousVisibleIniLoad = {on:"ini-load", selector:"amp-ad", selectionMethod:"closest", request:"iniLoadCsi"};
  $config$jscomp$7$$.triggers.continuousVisibleRenderStart = {on:"render-start", selector:"amp-ad", selectionMethod:"closest", request:"renderStartCsi"};
  $config$jscomp$7$$.requests.iniLoadCsi = $baseCsiUrl_qqid$jscomp$1$$ + ("&met.a4a." + $slotId$$ + "=iniLoadCsi" + $isAmpSuffix_isVerifiedAmpCreative$$ + "." + $deltaTime_win$jscomp$259$$);
  $config$jscomp$7$$.requests.renderStartCsi = $baseCsiUrl_qqid$jscomp$1$$ + ("&met.a4a." + $slotId$$ + "=renderStartCsi" + $isAmpSuffix_isVerifiedAmpCreative$$ + "." + $deltaTime_win$jscomp$259$$);
  $config$jscomp$7$$.requests.visibilityCsi = $baseCsiUrl_qqid$jscomp$1$$ + ("&met.a4a." + $slotId$$ + "=visibilityCsi." + $deltaTime_win$jscomp$259$$);
  $config$jscomp$7$$.triggers.continuousVisible.request.push("visibilityCsi");
};
_.$getEnclosingContainerTypes$$module$ads$google$a4a$utils$$ = function($adElement$jscomp$2_el$jscomp$27$$) {
  var $containerTypeSet$$ = {};
  $adElement$jscomp$2_el$jscomp$27$$ = $adElement$jscomp$2_el$jscomp$27$$.parentElement;
  for (var $counter$jscomp$1$$ = 0; $adElement$jscomp$2_el$jscomp$27$$ && 20 > $counter$jscomp$1$$; $adElement$jscomp$2_el$jscomp$27$$ = $adElement$jscomp$2_el$jscomp$27$$.parentElement, $counter$jscomp$1$$++) {
    var $tagName$jscomp$21$$ = $adElement$jscomp$2_el$jscomp$27$$.tagName.toUpperCase();
    _.$ValidAdContainerTypes$$module$ads$google$a4a$utils$$[$tagName$jscomp$21$$] && ($containerTypeSet$$[_.$ValidAdContainerTypes$$module$ads$google$a4a$utils$$[$tagName$jscomp$21$$]] = !0);
  }
  return Object.keys($containerTypeSet$$);
};
_.$maybeAppendErrorParameter$$module$ads$google$a4a$utils$$ = function($adUrl$$) {
  if (!(new RegExp("[?|&](" + (0,window.encodeURIComponent)($TRUNCATION_PARAM$$module$ads$google$a4a$utils$$.name) + "=" + ((0,window.encodeURIComponent)(String($TRUNCATION_PARAM$$module$ads$google$a4a$utils$$.value)) + "|aet=[^&]*)$"))).test($adUrl$$)) {
    return $adUrl$$ + "&aet=n";
  }
};
$getBinaryTypeNumericalCode$$module$ads$google$a4a$utils$$ = function($type$jscomp$137$$) {
  return {production:"0", control:"1", canary:"2"}[$type$jscomp$137$$] || null;
};
_.$getIdentityToken$$module$ads$google$a4a$utils$$ = function($win$jscomp$260$$, $ampDoc$jscomp$3$$, $consentPolicyId$$) {
  $win$jscomp$260$$.goog_identity_prom = $win$jscomp$260$$.goog_identity_prom || ($consentPolicyId$$ ? _.$getConsentPolicyState$$module$src$consent$$($ampDoc$jscomp$3$$.$getHeadNode$(), $consentPolicyId$$) : window.Promise.resolve(3)).then(function($consentPolicyId$$) {
    return 2 == $consentPolicyId$$ || 4 == $consentPolicyId$$ ? {} : $executeIdentityTokenFetch$$module$ads$google$a4a$utils$$($win$jscomp$260$$, $ampDoc$jscomp$3$$);
  });
  return $win$jscomp$260$$.goog_identity_prom;
};
$executeIdentityTokenFetch$$module$ads$google$a4a$utils$$ = function($win$jscomp$261$$, $ampDoc$jscomp$4$$, $redirectsRemaining$$, $domain$jscomp$4_url$jscomp$103$$, $startTime$jscomp$14$$) {
  $redirectsRemaining$$ = void 0 === $redirectsRemaining$$ ? 1 : $redirectsRemaining$$;
  $startTime$jscomp$14$$ = void 0 === $startTime$jscomp$14$$ ? Date.now() : $startTime$jscomp$14$$;
  $domain$jscomp$4_url$jscomp$103$$ = $getIdentityTokenRequestUrl$$module$ads$google$a4a$utils$$($win$jscomp$261$$, $ampDoc$jscomp$4$$, $domain$jscomp$4_url$jscomp$103$$);
  return _.$JSCompiler_StaticMethods_fetchJson$$(_.$Services$$module$src$services$xhrFor$$($win$jscomp$261$$), $domain$jscomp$4_url$jscomp$103$$, {mode:"cors", method:"GET", ampCors:!1, credentials:"include"}).then(function($win$jscomp$261$$) {
    return $win$jscomp$261$$.json();
  }).then(function($domain$jscomp$4_url$jscomp$103$$) {
    var $altDomain_obj$jscomp$36$$ = $domain$jscomp$4_url$jscomp$103$$.newToken, $jar$$ = $domain$jscomp$4_url$jscomp$103$$["1p_jar"] || "", $pucrd$$ = $domain$jscomp$4_url$jscomp$103$$.pucrd || "", $freshLifetimeSecs$$ = (0,window.parseInt)($domain$jscomp$4_url$jscomp$103$$.freshLifetimeSecs || "", 10), $validLifetimeSecs$$ = (0,window.parseInt)($domain$jscomp$4_url$jscomp$103$$.validLifetimeSecs || "", 10);
    $domain$jscomp$4_url$jscomp$103$$ = $domain$jscomp$4_url$jscomp$103$$.altDomain;
    var $fetchTimeMs$$ = Date.now() - $startTime$jscomp$14$$;
    return $IDENTITY_DOMAIN_REGEXP_$$module$ads$google$a4a$utils$$.test($domain$jscomp$4_url$jscomp$103$$) ? $redirectsRemaining$$-- ? $executeIdentityTokenFetch$$module$ads$google$a4a$utils$$($win$jscomp$261$$, $ampDoc$jscomp$4$$, $redirectsRemaining$$, $domain$jscomp$4_url$jscomp$103$$, $startTime$jscomp$14$$) : {$fetchTimeMs$:$fetchTimeMs$$} : 0 < $freshLifetimeSecs$$ && 0 < $validLifetimeSecs$$ && "string" == typeof $altDomain_obj$jscomp$36$$ ? {$token$:$altDomain_obj$jscomp$36$$, $jar$:$jar$$, 
    $pucrd$:$pucrd$$, $freshLifetimeSecs$:$freshLifetimeSecs$$, $validLifetimeSecs$:$validLifetimeSecs$$, $fetchTimeMs$:$fetchTimeMs$$} : {$fetchTimeMs$:$fetchTimeMs$$};
  }).catch(function() {
    return {};
  });
};
$getIdentityTokenRequestUrl$$module$ads$google$a4a$utils$$ = function($win$jscomp$262$$, $ampDoc$jscomp$5_canonical$$, $domain$jscomp$5_matches$jscomp$9$$) {
  !$domain$jscomp$5_matches$jscomp$9$$ && $win$jscomp$262$$ != $win$jscomp$262$$.top && $win$jscomp$262$$.location.ancestorOrigins && ($domain$jscomp$5_matches$jscomp$9$$ = ($domain$jscomp$5_matches$jscomp$9$$ = $IDENTITY_DOMAIN_REGEXP_$$module$ads$google$a4a$utils$$.exec($win$jscomp$262$$.location.ancestorOrigins[$win$jscomp$262$$.location.ancestorOrigins.length - 1])) && $domain$jscomp$5_matches$jscomp$9$$[0] || void 0);
  $domain$jscomp$5_matches$jscomp$9$$ = $domain$jscomp$5_matches$jscomp$9$$ || ".google.com";
  $ampDoc$jscomp$5_canonical$$ = $extractHost$$module$ads$google$a4a$utils$$(_.$Services$$module$src$services$documentInfoForDoc$$($ampDoc$jscomp$5_canonical$$).canonicalUrl);
  return "https://adservice" + $domain$jscomp$5_matches$jscomp$9$$ + "/adsid/integrator.json?domain=" + $ampDoc$jscomp$5_canonical$$;
};
_.$isCdnProxy$$module$ads$google$a4a$utils$$ = function($win$jscomp$263$$) {
  return $CDN_PROXY_REGEXP$$module$ads$google$a4a$utils$$.test($win$jscomp$263$$.location.origin);
};
_.$extractUrlExperimentId$$module$ads$google$a4a$traffic_experiments$$ = function($win$jscomp$266$$, $element$jscomp$241$$) {
  var $expParam$$ = _.$JSCompiler_StaticMethods_getParam$$(_.$Services$$module$src$services$viewerForDoc$$($element$jscomp$241$$), "exp") || _.$parseQueryString_$$module$src$url_parse_query_string$$($win$jscomp$266$$.location.search).exp;
  if (!$expParam$$) {
    return null;
  }
  var $arg$jscomp$10$$, $match$jscomp$8$$;
  ["doubleclick" == ($element$jscomp$241$$.getAttribute("type") || "").toLowerCase() ? "da" : "aa", "a4a"].forEach(function($win$jscomp$266$$) {
    return $arg$jscomp$10$$ = $arg$jscomp$10$$ || ($match$jscomp$8$$ = (new RegExp("(?:^|,)" + $win$jscomp$266$$ + ":(-?\\d+)")).exec($expParam$$)) && $match$jscomp$8$$[1];
  });
  return $arg$jscomp$10$$ || null;
};
$parseExperimentIds$$module$ads$google$a4a$traffic_experiments$$ = function($idString$$) {
  return $idString$$ ? $idString$$.split(",") : [];
};
_.$isInExperiment$$module$ads$google$a4a$traffic_experiments$$ = function($element$jscomp$242$$) {
  return $parseExperimentIds$$module$ads$google$a4a$traffic_experiments$$($element$jscomp$242$$.getAttribute("data-experiment-id")).some(function($element$jscomp$242$$) {
    return "117152632" === $element$jscomp$242$$;
  });
};
$validateExperimentIds$$module$ads$google$a4a$traffic_experiments$$ = function($idList$$) {
  return $idList$$.every(function($idList$$) {
    return !(0,window.isNaN)((0,window.parseInt)($idList$$, 10));
  });
};
_.$addExperimentIdToElement$$module$ads$google$a4a$traffic_experiments$$ = function($experimentId$jscomp$4$$, $element$jscomp$245$$) {
  if ($experimentId$jscomp$4$$) {
    var $currentEids$$ = $element$jscomp$245$$.getAttribute("data-experiment-id");
    $currentEids$$ && $validateExperimentIds$$module$ads$google$a4a$traffic_experiments$$($parseExperimentIds$$module$ads$google$a4a$traffic_experiments$$($currentEids$$)) ? $element$jscomp$245$$.setAttribute("data-experiment-id", $mergeExperimentIds$$module$ads$google$a4a$utils$$([$experimentId$jscomp$4$$], $currentEids$$)) : $element$jscomp$245$$.setAttribute("data-experiment-id", $experimentId$jscomp$4$$);
  }
};
_.$A4AVariableSource$$module$extensions$amp_a4a$0_1$a4a_variable_source$$ = function($ampdoc$jscomp$102$$, $embedWin$jscomp$9$$) {
  _.$VariableSource$$module$src$service$variable_source$$.call(this, $ampdoc$jscomp$102$$);
  this.$K$ = _.$Services$$module$src$services$urlReplacementsForDoc$$($ampdoc$jscomp$102$$.$getHeadNode$()).$D$;
  this.$F$ = $embedWin$jscomp$9$$;
};
$SignatureVerifier$$module$extensions$amp_a4a$0_1$signature_verifier$$ = function($win$jscomp$275$$) {
  this.$F$ = $win$jscomp$275$$;
  this.$G$ = $signingServerURLs$$module$ads$_a4a_config$$;
  var $JSCompiler_StaticMethods_isPkcsAvailable$self$jscomp$inline_1950$$ = _.$Services$$module$src$services$cryptoFor$$($win$jscomp$275$$);
  this.$D$ = $JSCompiler_StaticMethods_isPkcsAvailable$self$jscomp$inline_1950$$.$D$ && !1 !== $JSCompiler_StaticMethods_isPkcsAvailable$self$jscomp$inline_1950$$.$G$.isSecureContext ? {} : null;
  this.$getNow_$ = $win$jscomp$275$$.performance && $win$jscomp$275$$.performance.now ? $win$jscomp$275$$.performance.now.bind($win$jscomp$275$$.performance) : Date.now;
};
$JSCompiler_StaticMethods_verifyCreativeAndSignature$$ = function($JSCompiler_StaticMethods_verifyCreativeAndSignature$self$$, $signingServiceName$jscomp$1$$, $keypairId$$, $signature$jscomp$2$$, $creative$jscomp$1$$) {
  if (!$JSCompiler_StaticMethods_verifyCreativeAndSignature$self$$.$D$) {
    return window.Promise.resolve(4);
  }
  var $signer$$ = $JSCompiler_StaticMethods_verifyCreativeAndSignature$self$$.$D$[$signingServiceName$jscomp$1$$];
  return $signer$$.$promise$.then(function($keyPromise_success$jscomp$5$$) {
    if (!$keyPromise_success$jscomp$5$$) {
      return 1;
    }
    $keyPromise_success$jscomp$5$$ = $signer$$.keys[$keypairId$$];
    return void 0 === $keyPromise_success$jscomp$5$$ ? ($signer$$.$promise$ = $JSCompiler_StaticMethods_fetchAndAddKeys_$$($JSCompiler_StaticMethods_verifyCreativeAndSignature$self$$, $signer$$.keys, $signingServiceName$jscomp$1$$, $keypairId$$).then(function($JSCompiler_StaticMethods_verifyCreativeAndSignature$self$$) {
      void 0 === $signer$$.keys[$keypairId$$] && ($signer$$.keys[$keypairId$$] = null);
      return $JSCompiler_StaticMethods_verifyCreativeAndSignature$self$$;
    }), $JSCompiler_StaticMethods_verifyCreativeAndSignature$$($JSCompiler_StaticMethods_verifyCreativeAndSignature$self$$, $signingServiceName$jscomp$1$$, $keypairId$$, $signature$jscomp$2$$, $creative$jscomp$1$$)) : null === $keyPromise_success$jscomp$5$$ ? 2 : $keyPromise_success$jscomp$5$$.then(function($signingServiceName$jscomp$1$$) {
      return $signingServiceName$jscomp$1$$ ? $JSCompiler_StaticMethods_verifyPkcs$$(_.$Services$$module$src$services$cryptoFor$$($JSCompiler_StaticMethods_verifyCreativeAndSignature$self$$.$F$), $signingServiceName$jscomp$1$$, $signature$jscomp$2$$, $creative$jscomp$1$$).then(function($JSCompiler_StaticMethods_verifyCreativeAndSignature$self$$) {
        return $JSCompiler_StaticMethods_verifyCreativeAndSignature$self$$ ? 0 : 3;
      }, function($JSCompiler_StaticMethods_verifyCreativeAndSignature$self$$) {
        $JSCompiler_StaticMethods_verifyCreativeAndSignature$self$$ = $JSCompiler_StaticMethods_verifyCreativeAndSignature$self$$ && $JSCompiler_StaticMethods_verifyCreativeAndSignature$self$$.message;
        _.$dev$$module$src$log$$().error("AMP-A4A", "Failed to verify signature: " + $JSCompiler_StaticMethods_verifyCreativeAndSignature$self$$);
        return 1;
      }) : 1;
    });
  });
};
$JSCompiler_StaticMethods_fetchAndAddKeys_$$ = function($JSCompiler_StaticMethods_fetchAndAddKeys_$self$$, $keys$jscomp$5$$, $signingServiceName$jscomp$2$$, $keypairId$jscomp$1$$) {
  var $url$jscomp$104$$ = $JSCompiler_StaticMethods_fetchAndAddKeys_$self$$.$G$[$signingServiceName$jscomp$2$$];
  null != $keypairId$jscomp$1$$ && ($url$jscomp$104$$ += "?kid=" + (0,window.encodeURIComponent)($keypairId$jscomp$1$$));
  return _.$JSCompiler_StaticMethods_fetchJson$$(_.$Services$$module$src$services$xhrFor$$($JSCompiler_StaticMethods_fetchAndAddKeys_$self$$.$F$), $url$jscomp$104$$, {mode:"cors", method:"GET", ampCors:!1, credentials:"omit"}).then(function($keypairId$jscomp$1$$) {
    $keypairId$jscomp$1$$.headers.get("Content-Type");
    return $keypairId$jscomp$1$$.json().then(function($keypairId$jscomp$1$$) {
      if (!$keypairId$jscomp$1$$ || !_.$isArray$$module$src$types$$($keypairId$jscomp$1$$.keys)) {
        return $signingServiceError$$module$extensions$amp_a4a$0_1$signature_verifier$$($signingServiceName$jscomp$2$$, "Key set (" + JSON.stringify($keypairId$jscomp$1$$) + ') has no "keys"'), !1;
      }
      $keypairId$jscomp$1$$.keys.forEach(function($keypairId$jscomp$1$$) {
        $keypairId$jscomp$1$$ && "string" == typeof $keypairId$jscomp$1$$.kid ? void 0 === $keys$jscomp$5$$[$keypairId$jscomp$1$$.kid] && ($keys$jscomp$5$$[$keypairId$jscomp$1$$.kid] = $JSCompiler_StaticMethods_importPkcsKey$$(_.$Services$$module$src$services$cryptoFor$$($JSCompiler_StaticMethods_fetchAndAddKeys_$self$$.$F$), $keypairId$jscomp$1$$).catch(function($JSCompiler_StaticMethods_fetchAndAddKeys_$self$$) {
          var $keys$jscomp$5$$ = JSON.stringify($keypairId$jscomp$1$$);
          $signingServiceError$$module$extensions$amp_a4a$0_1$signature_verifier$$($signingServiceName$jscomp$2$$, "Failed to import key (" + $keys$jscomp$5$$ + "): " + ($JSCompiler_StaticMethods_fetchAndAddKeys_$self$$ && $JSCompiler_StaticMethods_fetchAndAddKeys_$self$$.message));
          return null;
        })) : $signingServiceError$$module$extensions$amp_a4a$0_1$signature_verifier$$($signingServiceName$jscomp$2$$, "Key (" + JSON.stringify($keypairId$jscomp$1$$) + ') has no "kid"');
      });
      return !0;
    }, function($JSCompiler_StaticMethods_fetchAndAddKeys_$self$$) {
      $signingServiceError$$module$extensions$amp_a4a$0_1$signature_verifier$$($signingServiceName$jscomp$2$$, "Failed to parse JSON: " + ($JSCompiler_StaticMethods_fetchAndAddKeys_$self$$ && $JSCompiler_StaticMethods_fetchAndAddKeys_$self$$.response));
      return !1;
    });
  }, function($JSCompiler_StaticMethods_fetchAndAddKeys_$self$$) {
    $JSCompiler_StaticMethods_fetchAndAddKeys_$self$$ && $JSCompiler_StaticMethods_fetchAndAddKeys_$self$$.response && $signingServiceError$$module$extensions$amp_a4a$0_1$signature_verifier$$($signingServiceName$jscomp$2$$, "Status code " + $JSCompiler_StaticMethods_fetchAndAddKeys_$self$$.response.status);
    return !1;
  });
};
$signingServiceError$$module$extensions$amp_a4a$0_1$signature_verifier$$ = function($signingServiceName$jscomp$3$$, $message$jscomp$46$$) {
  _.$dev$$module$src$log$$().error("AMP-A4A", "Signing service error for " + $signingServiceName$jscomp$3$$ + ": " + $message$jscomp$46$$);
};
$protectFunctionWrapper$$module$extensions$amp_a4a$0_1$amp_a4a$$ = function($fn$jscomp$20$$, $inThis$$, $onError$$) {
  return function($fnArgs$$) {
    for (var $$jscomp$restParams$jscomp$4$$ = [], $$jscomp$restIndex$jscomp$4$$ = 0; $$jscomp$restIndex$jscomp$4$$ < arguments.length; ++$$jscomp$restIndex$jscomp$4$$) {
      $$jscomp$restParams$jscomp$4$$[$$jscomp$restIndex$jscomp$4$$] = arguments[$$jscomp$restIndex$jscomp$4$$];
    }
    try {
      return $fn$jscomp$20$$.apply($inThis$$, $$jscomp$restParams$jscomp$4$$);
    } catch ($err$jscomp$13$$) {
      if ($onError$$) {
        try {
          return $$jscomp$restParams$jscomp$4$$.unshift($err$jscomp$13$$), $onError$$.apply($inThis$$, $$jscomp$restParams$jscomp$4$$);
        } catch ($captureErr$$) {
        }
      }
    }
  };
};
_.$AmpA4A$$module$extensions$amp_a4a$0_1$amp_a4a$$ = function($$jscomp$super$this$jscomp$2_element$jscomp$253$$) {
  $$jscomp$super$this$jscomp$2_element$jscomp$253$$ = window.AMP.BaseElement.call(this, $$jscomp$super$this$jscomp$2_element$jscomp$253$$) || this;
  $$jscomp$super$this$jscomp$2_element$jscomp$253$$.$keysetPromise_$ = null;
  $$jscomp$super$this$jscomp$2_element$jscomp$253$$.$adPromise_$ = null;
  $$jscomp$super$this$jscomp$2_element$jscomp$253$$.$promiseId_$ = 0;
  $$jscomp$super$this$jscomp$2_element$jscomp$253$$.$adUrl_$ = null;
  $$jscomp$super$this$jscomp$2_element$jscomp$253$$.$friendlyIframeEmbed_$ = null;
  $$jscomp$super$this$jscomp$2_element$jscomp$253$$.$uiHandler$ = null;
  $$jscomp$super$this$jscomp$2_element$jscomp$253$$.$xOriginIframeHandler_$ = null;
  $$jscomp$super$this$jscomp$2_element$jscomp$253$$.$isVerifiedAmpCreative_$ = !1;
  $$jscomp$super$this$jscomp$2_element$jscomp$253$$.$creativeBody_$ = null;
  $$jscomp$super$this$jscomp$2_element$jscomp$253$$.$creativeSize_$ = null;
  $$jscomp$super$this$jscomp$2_element$jscomp$253$$.$originalSlotSize_$ = null;
  $$jscomp$super$this$jscomp$2_element$jscomp$253$$.$experimentalNonAmpCreativeRenderMethod_$ = $$jscomp$super$this$jscomp$2_element$jscomp$253$$.$getNonAmpCreativeRenderingMethod$();
  $$jscomp$super$this$jscomp$2_element$jscomp$253$$.$getNow_$ = $$jscomp$super$this$jscomp$2_element$jscomp$253$$.$win$.performance && $$jscomp$super$this$jscomp$2_element$jscomp$253$$.$win$.performance.now ? $$jscomp$super$this$jscomp$2_element$jscomp$253$$.$win$.performance.now.bind($$jscomp$super$this$jscomp$2_element$jscomp$253$$.$win$.performance) : Date.now;
  $$jscomp$super$this$jscomp$2_element$jscomp$253$$.sentinel = _.$generateSentinel$$module$src$3p_frame$$(window);
  $$jscomp$super$this$jscomp$2_element$jscomp$253$$.$isCollapsed_$ = !1;
  $$jscomp$super$this$jscomp$2_element$jscomp$253$$.iframe = null;
  $$jscomp$super$this$jscomp$2_element$jscomp$253$$.$fromResumeCallback$ = !1;
  $$jscomp$super$this$jscomp$2_element$jscomp$253$$.$safeframeVersion$ = "1-0-23";
  $$jscomp$super$this$jscomp$2_element$jscomp$253$$.$isRefreshing$ = !1;
  $$jscomp$super$this$jscomp$2_element$jscomp$253$$.$isRelayoutNeededFlag$ = !1;
  $$jscomp$super$this$jscomp$2_element$jscomp$253$$.$releaseType_$ = $getBinaryTypeNumericalCode$$module$ads$google$a4a$utils$$(_.$getBinaryType$$module$src$experiments$$($$jscomp$super$this$jscomp$2_element$jscomp$253$$.$win$)) || "-1";
  $$jscomp$super$this$jscomp$2_element$jscomp$253$$.$postAdResponseExperimentFeatures$ = {};
  $$jscomp$super$this$jscomp$2_element$jscomp$253$$.$a4aAnalyticsConfig_$ = null;
  $$jscomp$super$this$jscomp$2_element$jscomp$253$$.$a4aAnalyticsElement_$ = null;
  $$jscomp$super$this$jscomp$2_element$jscomp$253$$.$isSinglePageStoryAd$ = !1;
  return $$jscomp$super$this$jscomp$2_element$jscomp$253$$;
};
_.$JSCompiler_StaticMethods_isAmpAdElement$$ = function($JSCompiler_StaticMethods_isAmpAdElement$self$$) {
  return "AMP-AD" == $JSCompiler_StaticMethods_isAmpAdElement$self$$.element.tagName || "AMP-EMBED" == $JSCompiler_StaticMethods_isAmpAdElement$self$$.element.tagName;
};
$JSCompiler_StaticMethods_inNonAmpPreferenceExp$$ = function($JSCompiler_StaticMethods_inNonAmpPreferenceExp$self$$) {
  return !!$JSCompiler_StaticMethods_inNonAmpPreferenceExp$self$$.$postAdResponseExperimentFeatures$.pref_neutral_enabled && ["adsense", "doubleclick"].includes($JSCompiler_StaticMethods_inNonAmpPreferenceExp$self$$.element.getAttribute("type"));
};
$JSCompiler_StaticMethods_shouldInitializePromiseChain_$$ = function($JSCompiler_StaticMethods_shouldInitializePromiseChain_$self$$) {
  var $slotRect$jscomp$1$$ = $JSCompiler_StaticMethods_shouldInitializePromiseChain_$self$$.$getIntersectionElementLayoutBox$();
  return "fluid" == $JSCompiler_StaticMethods_shouldInitializePromiseChain_$self$$.$getLayout$() || 0 != $slotRect$jscomp$1$$.height && 0 != $slotRect$jscomp$1$$.width ? _.$isAdPositionAllowed$$module$src$ad_helper$$($JSCompiler_StaticMethods_shouldInitializePromiseChain_$self$$.element, $JSCompiler_StaticMethods_shouldInitializePromiseChain_$self$$.$win$) ? $JSCompiler_StaticMethods_shouldInitializePromiseChain_$self$$.isValidElement() ? !0 : (_.$user$$module$src$log$$().$Log$$module$src$log_prototype$warn$("amp-a4a", 
  $JSCompiler_StaticMethods_shouldInitializePromiseChain_$self$$.element.getAttribute("type"), "Amp ad element ignored as invalid", $JSCompiler_StaticMethods_shouldInitializePromiseChain_$self$$.element), !1) : (_.$user$$module$src$log$$().$Log$$module$src$log_prototype$warn$("amp-a4a", "<" + $JSCompiler_StaticMethods_shouldInitializePromiseChain_$self$$.element.tagName + "> is not allowed to be " + ("placed in elements with position:fixed: " + $JSCompiler_StaticMethods_shouldInitializePromiseChain_$self$$.element)), 
  !1) : ("amp-a4a", !1);
};
_.$JSCompiler_StaticMethods_initiateAdRequest$$ = function($JSCompiler_StaticMethods_initiateAdRequest$self$$) {
  $JSCompiler_StaticMethods_initiateAdRequest$self$$.$xOriginIframeHandler_$ && $JSCompiler_StaticMethods_initiateAdRequest$self$$.$xOriginIframeHandler_$.$onLayoutMeasure$();
  if (!$JSCompiler_StaticMethods_initiateAdRequest$self$$.$adPromise_$ && $JSCompiler_StaticMethods_shouldInitializePromiseChain_$$($JSCompiler_StaticMethods_initiateAdRequest$self$$)) {
    ++$JSCompiler_StaticMethods_initiateAdRequest$self$$.$promiseId_$;
    var $checkStillCurrent$$ = $JSCompiler_StaticMethods_initiateAdRequest$self$$.$verifyStillCurrent$();
    $JSCompiler_StaticMethods_initiateAdRequest$self$$.$adPromise_$ = _.$Services$$module$src$services$viewerForDoc$$($JSCompiler_StaticMethods_initiateAdRequest$self$$.$getAmpDoc$()).$D$.then(function() {
      $checkStillCurrent$$();
      var $delay$jscomp$6$$ = $JSCompiler_StaticMethods_initiateAdRequest$self$$.$delayAdRequestEnabled$();
      if ($delay$jscomp$6$$) {
        return _.$JSCompiler_StaticMethods_whenWithinViewport$$(_.$Resource$$module$src$service$resource$forElementOptional$$($JSCompiler_StaticMethods_initiateAdRequest$self$$.element), "number" == typeof $delay$jscomp$6$$ ? $delay$jscomp$6$$ : $JSCompiler_StaticMethods_initiateAdRequest$self$$.$renderOutsideViewport$());
      }
    }).then(function() {
      $checkStillCurrent$$();
      var $consentPolicyId$jscomp$1$$ = window.AMP.BaseElement.prototype.$getConsentPolicy$.call($JSCompiler_StaticMethods_initiateAdRequest$self$$);
      return $consentPolicyId$jscomp$1$$ ? _.$getConsentPolicyState$$module$src$consent$$($JSCompiler_StaticMethods_initiateAdRequest$self$$.element, $consentPolicyId$jscomp$1$$).catch(function($JSCompiler_StaticMethods_initiateAdRequest$self$$) {
        _.$user$$module$src$log$$().error("amp-a4a", "Error determining consent state", $JSCompiler_StaticMethods_initiateAdRequest$self$$);
        return 4;
      }) : window.Promise.resolve(null);
    }).then(function($consentState$jscomp$1$$) {
      $checkStillCurrent$$();
      return $JSCompiler_StaticMethods_initiateAdRequest$self$$.$getAdUrl$($consentState$jscomp$1$$, $JSCompiler_StaticMethods_tryExecuteRealTimeConfig_$$($JSCompiler_StaticMethods_initiateAdRequest$self$$, $consentState$jscomp$1$$));
    }).then(function($adUrl$jscomp$1$$) {
      $checkStillCurrent$$();
      $JSCompiler_StaticMethods_initiateAdRequest$self$$.$adUrl_$ = $adUrl$jscomp$1$$;
      return !$JSCompiler_StaticMethods_initiateAdRequest$self$$.$isXhrAllowed$() && $JSCompiler_StaticMethods_initiateAdRequest$self$$.$adUrl_$ ? ($JSCompiler_StaticMethods_initiateAdRequest$self$$.$experimentalNonAmpCreativeRenderMethod_$ = "iframe_get", window.Promise.reject("IFRAME-GET")) : $adUrl$jscomp$1$$ && $JSCompiler_StaticMethods_initiateAdRequest$self$$.$sendXhrRequest$($adUrl$jscomp$1$$);
    }).then(function($fetchResponse$$) {
      $checkStillCurrent$$();
      $JSCompiler_StaticMethods_maybeTriggerAnalyticsEvent_$$($JSCompiler_StaticMethods_initiateAdRequest$self$$, "adRequestEnd");
      if (!$fetchResponse$$ || !$fetchResponse$$.arrayBuffer || $fetchResponse$$.headers.has("amp-ff-empty-creative")) {
        return _.$JSCompiler_StaticMethods_forceCollapse$$($JSCompiler_StaticMethods_initiateAdRequest$self$$), window.Promise.reject("NO-CONTENT-RESPONSE");
      }
      $fetchResponse$$.headers && $fetchResponse$$.headers.has("amp-ff-exps") && $JSCompiler_StaticMethods_populatePostAdResponseExperimentFeatures_$$($JSCompiler_StaticMethods_initiateAdRequest$self$$, $fetchResponse$$.headers.get("amp-ff-exps"));
      var $method$jscomp$16_safeframeVersionHeader$$ = $JSCompiler_StaticMethods_initiateAdRequest$self$$.$getNonAmpCreativeRenderingMethod$($fetchResponse$$.headers.get("X-AmpAdRender"));
      $JSCompiler_StaticMethods_initiateAdRequest$self$$.$experimentalNonAmpCreativeRenderMethod_$ = $method$jscomp$16_safeframeVersionHeader$$;
      "nameframe" == $JSCompiler_StaticMethods_initiateAdRequest$self$$.$experimentalNonAmpCreativeRenderMethod_$ && $JSCompiler_StaticMethods_initiateAdRequest$self$$.$preconnect$.$preload$(_.$getDefaultBootstrapBaseUrl$$module$src$3p_frame$$($JSCompiler_StaticMethods_initiateAdRequest$self$$.$win$, "nameframe"));
      $method$jscomp$16_safeframeVersionHeader$$ = $fetchResponse$$.headers.get("X-AmpSafeFrameVersion");
      /^[0-9-]+$/.test($method$jscomp$16_safeframeVersionHeader$$) && "1-0-23" != $method$jscomp$16_safeframeVersionHeader$$ && ($JSCompiler_StaticMethods_initiateAdRequest$self$$.$safeframeVersion$ = $method$jscomp$16_safeframeVersionHeader$$, $JSCompiler_StaticMethods_initiateAdRequest$self$$.$preconnect$.$preload$($JSCompiler_StaticMethods_getSafeframePath$$($JSCompiler_StaticMethods_initiateAdRequest$self$$)));
      return $fetchResponse$$.arrayBuffer().then(function($checkStillCurrent$$) {
        return 0 == $checkStillCurrent$$.byteLength ? (_.$JSCompiler_StaticMethods_forceCollapse$$($JSCompiler_StaticMethods_initiateAdRequest$self$$), window.Promise.reject("NO-CONTENT-RESPONSE")) : {$bytes$:$checkStillCurrent$$, headers:$fetchResponse$$.headers};
      });
    }).then(function($responseParts_size$jscomp$19$$) {
      $checkStillCurrent$$();
      if (!$responseParts_size$jscomp$19$$) {
        return window.Promise.resolve();
      }
      var $bytes$jscomp$9$$ = $responseParts_size$jscomp$19$$.$bytes$, $headers$jscomp$2$$ = $responseParts_size$jscomp$19$$.headers;
      $responseParts_size$jscomp$19$$ = $JSCompiler_StaticMethods_initiateAdRequest$self$$.$extractSize$($responseParts_size$jscomp$19$$.headers);
      $JSCompiler_StaticMethods_initiateAdRequest$self$$.$creativeSize_$ = $responseParts_size$jscomp$19$$ || $JSCompiler_StaticMethods_initiateAdRequest$self$$.$creativeSize_$;
      "client_cache" != $JSCompiler_StaticMethods_initiateAdRequest$self$$.$experimentalNonAmpCreativeRenderMethod_$ && $bytes$jscomp$9$$ && ($JSCompiler_StaticMethods_initiateAdRequest$self$$.$creativeBody_$ = $bytes$jscomp$9$$);
      return $JSCompiler_StaticMethods_initiateAdRequest$self$$.$maybeValidateAmpCreative$($bytes$jscomp$9$$, $headers$jscomp$2$$);
    }).then(function($creative$jscomp$2$$) {
      $checkStillCurrent$$();
      $JSCompiler_StaticMethods_initiateAdRequest$self$$.$isVerifiedAmpCreative_$ = !!$creative$jscomp$2$$;
      return $creative$jscomp$2$$ && _.$utf8Decode$$module$src$utils$bytes$$($creative$jscomp$2$$);
    }).then(function($creativeDecoded$$) {
      $checkStillCurrent$$();
      var $creativeMetaDataDef$$;
      if (!$creativeDecoded$$ || !($creativeMetaDataDef$$ = $JSCompiler_StaticMethods_initiateAdRequest$self$$.$getAmpAdMetadata$($creativeDecoded$$))) {
        return $JSCompiler_StaticMethods_inNonAmpPreferenceExp$$($JSCompiler_StaticMethods_initiateAdRequest$self$$) && $JSCompiler_StaticMethods_initiateAdRequest$self$$.$updateLayoutPriority$(0), null;
      }
      $JSCompiler_StaticMethods_initiateAdRequest$self$$.$updateLayoutPriority$(0);
      var $extensions$jscomp$9$$ = _.$Services$$module$src$services$extensionsFor$$($JSCompiler_StaticMethods_initiateAdRequest$self$$.$win$);
      $creativeMetaDataDef$$.$customElementExtensions$.forEach(function($JSCompiler_StaticMethods_initiateAdRequest$self$$) {
        return _.$JSCompiler_StaticMethods_preloadExtension$$($extensions$jscomp$9$$, $JSCompiler_StaticMethods_initiateAdRequest$self$$);
      });
      ($creativeMetaDataDef$$.$customStylesheets$ || []).forEach(function($checkStillCurrent$$) {
        return $JSCompiler_StaticMethods_initiateAdRequest$self$$.$preconnect$.$preload$($checkStillCurrent$$.href);
      });
      var $urls$jscomp$1$$ = _.$Services$$module$src$services$urlForDoc$$($JSCompiler_StaticMethods_initiateAdRequest$self$$.element);
      ($creativeMetaDataDef$$.images || []).forEach(function($checkStillCurrent$$) {
        return _.$JSCompiler_StaticMethods_isSecure$$($urls$jscomp$1$$, $checkStillCurrent$$) && $JSCompiler_StaticMethods_initiateAdRequest$self$$.$preconnect$.$preload$($checkStillCurrent$$);
      });
      return $creativeMetaDataDef$$;
    }).catch(function($checkStillCurrent$$) {
      switch($checkStillCurrent$$.message || $checkStillCurrent$$) {
        case "IFRAME-GET":
        case "NETWORK-FAILURE":
          return null;
        case "INVALID-SPSA-RESPONSE":
        case "NO-CONTENT-RESPONSE":
          return {$minifiedCreative$:"", $customElementExtensions$:[], $customStylesheets$:[]};
      }
      $JSCompiler_StaticMethods_promiseErrorHandler_$$($JSCompiler_StaticMethods_initiateAdRequest$self$$, $checkStillCurrent$$);
      return null;
    });
  }
};
$JSCompiler_StaticMethods_populatePostAdResponseExperimentFeatures_$$ = function($JSCompiler_StaticMethods_populatePostAdResponseExperimentFeatures_$self$$, $input$jscomp$28$$) {
  $input$jscomp$28$$.split(",").forEach(function($input$jscomp$28$$) {
    if ($input$jscomp$28$$) {
      var $line$jscomp$2$$ = $input$jscomp$28$$.split("=");
      2 == $line$jscomp$2$$.length && $line$jscomp$2$$[0] ? $JSCompiler_StaticMethods_populatePostAdResponseExperimentFeatures_$self$$.$postAdResponseExperimentFeatures$[$line$jscomp$2$$[0]] = $line$jscomp$2$$[1] : _.$dev$$module$src$log$$().$Log$$module$src$log_prototype$warn$("amp-a4a", "invalid experiment feature " + $input$jscomp$28$$);
    }
  });
};
$JSCompiler_StaticMethods_promiseErrorHandler_$$ = function($JSCompiler_StaticMethods_promiseErrorHandler_$self$$, $error$jscomp$31$$) {
  if (_.$isCancellation$$module$src$error$$($error$jscomp$31$$)) {
    throw $error$jscomp$31$$;
  }
  $error$jscomp$31$$ = $error$jscomp$31$$ && $error$jscomp$31$$.message ? _.$duplicateErrorIfNecessary$$module$src$log$$($error$jscomp$31$$) : Error("unknown error " + $error$jscomp$31$$);
  var $type$jscomp$138$$ = $JSCompiler_StaticMethods_promiseErrorHandler_$self$$.element.getAttribute("type") || "notype";
  0 != $error$jscomp$31$$.message.indexOf("amp-a4a: " + $type$jscomp$138$$ + ":") && ($error$jscomp$31$$.message = "amp-a4a: " + $type$jscomp$138$$ + ": " + $error$jscomp$31$$.message);
  _.$assignAdUrlToError$$module$extensions$amp_a4a$0_1$amp_a4a$$($error$jscomp$31$$, $JSCompiler_StaticMethods_promiseErrorHandler_$self$$.$adUrl_$);
  _.$getMode$$module$src$mode$$().$development$ || _.$getMode$$module$src$mode$$().log ? _.$user$$module$src$log$$().error("amp-a4a", $error$jscomp$31$$) : (_.$user$$module$src$log$$().$Log$$module$src$log_prototype$warn$("amp-a4a", $error$jscomp$31$$), 0.01 > Math.random() && _.$dev$$module$src$log$$().$expectedError$("amp-a4a", $error$jscomp$31$$));
};
$JSCompiler_StaticMethods_attemptToRenderCreative$$ = function($JSCompiler_StaticMethods_attemptToRenderCreative$self$$) {
  if (!$JSCompiler_StaticMethods_attemptToRenderCreative$self$$.$adPromise_$) {
    return $JSCompiler_StaticMethods_shouldInitializePromiseChain_$$($JSCompiler_StaticMethods_attemptToRenderCreative$self$$) && _.$dev$$module$src$log$$().error("amp-a4a", "Null promise in layoutCallback"), window.Promise.resolve();
  }
  var $checkStillCurrent$jscomp$2$$ = $JSCompiler_StaticMethods_attemptToRenderCreative$self$$.$verifyStillCurrent$();
  return $JSCompiler_StaticMethods_attemptToRenderCreative$self$$.$adPromise_$.then(function($creativeMetaData$$) {
    $checkStillCurrent$jscomp$2$$();
    return $JSCompiler_StaticMethods_attemptToRenderCreative$self$$.$isCollapsed_$ || $JSCompiler_StaticMethods_attemptToRenderCreative$self$$.iframe && !$JSCompiler_StaticMethods_attemptToRenderCreative$self$$.$isRefreshing$ ? window.Promise.resolve() : $creativeMetaData$$ ? $JSCompiler_StaticMethods_renderAmpCreative_$$($JSCompiler_StaticMethods_attemptToRenderCreative$self$$, $creativeMetaData$$).catch(function($creativeMetaData$$) {
      $checkStillCurrent$jscomp$2$$();
      _.$user$$module$src$log$$().$Log$$module$src$log_prototype$warn$("amp-a4a", $JSCompiler_StaticMethods_attemptToRenderCreative$self$$.element.getAttribute("type"), "Error injecting creative in friendly frame", $creativeMetaData$$);
      return $JSCompiler_StaticMethods_attemptToRenderCreative$self$$.$renderNonAmpCreative$();
    }) : $JSCompiler_StaticMethods_attemptToRenderCreative$self$$.$renderNonAmpCreative$();
  }).catch(function($checkStillCurrent$jscomp$2$$) {
    $JSCompiler_StaticMethods_promiseErrorHandler_$$($JSCompiler_StaticMethods_attemptToRenderCreative$self$$, $checkStillCurrent$jscomp$2$$);
    throw _.$cancellation$$module$src$error$$();
  });
};
$JSCompiler_StaticMethods_destroyFrame$$ = function($JSCompiler_StaticMethods_destroyFrame$self$$, $force$jscomp$3$$) {
  if ((void 0 === $force$jscomp$3$$ ? 0 : $force$jscomp$3$$) || !$JSCompiler_StaticMethods_destroyFrame$self$$.$isRefreshing$) {
    $JSCompiler_StaticMethods_destroyFrame$self$$.$friendlyIframeEmbed_$ && ($JSCompiler_StaticMethods_destroyFrame$self$$.$friendlyIframeEmbed_$.$destroy$(), $JSCompiler_StaticMethods_destroyFrame$self$$.$friendlyIframeEmbed_$ = null), $JSCompiler_StaticMethods_destroyFrame$self$$.iframe && $JSCompiler_StaticMethods_destroyFrame$self$$.iframe.parentElement && ($JSCompiler_StaticMethods_destroyFrame$self$$.iframe.parentElement.removeChild($JSCompiler_StaticMethods_destroyFrame$self$$.iframe), $JSCompiler_StaticMethods_destroyFrame$self$$.iframe = 
    null), $JSCompiler_StaticMethods_destroyFrame$self$$.$xOriginIframeHandler_$ && ($JSCompiler_StaticMethods_destroyFrame$self$$.$xOriginIframeHandler_$.$freeXOriginIframe$(), $JSCompiler_StaticMethods_destroyFrame$self$$.$xOriginIframeHandler_$ = null);
  }
};
_.$JSCompiler_StaticMethods_forceCollapse$$ = function($JSCompiler_StaticMethods_forceCollapse$self$$) {
  $JSCompiler_StaticMethods_forceCollapse$self$$.$isRefreshing$ ? $JSCompiler_StaticMethods_forceCollapse$self$$.$isRefreshing$ = !1 : ($JSCompiler_StaticMethods_forceCollapse$self$$.$originalSlotSize_$ = $JSCompiler_StaticMethods_forceCollapse$self$$.$originalSlotSize_$ || $JSCompiler_StaticMethods_forceCollapse$self$$.$getLayoutBox$(), $JSCompiler_StaticMethods_forceCollapse$self$$.$uiHandler$.$F$(), $JSCompiler_StaticMethods_forceCollapse$self$$.$isCollapsed_$ = !0);
};
$JSCompiler_StaticMethods_renderAmpCreative_$$ = function($JSCompiler_StaticMethods_renderAmpCreative_$self$$, $creativeMetaData$jscomp$2$$) {
  $JSCompiler_StaticMethods_maybeTriggerAnalyticsEvent_$$($JSCompiler_StaticMethods_renderAmpCreative_$self$$, "renderFriendlyStart");
  $JSCompiler_StaticMethods_renderAmpCreative_$self$$.iframe = _.$createElementWithAttributes$$module$src$dom$$($JSCompiler_StaticMethods_renderAmpCreative_$self$$.element.ownerDocument, "iframe", _.$dict$$module$src$utils$object$$({height:$JSCompiler_StaticMethods_renderAmpCreative_$self$$.$creativeSize_$.height, width:$JSCompiler_StaticMethods_renderAmpCreative_$self$$.$creativeSize_$.width, frameborder:"0", allowfullscreen:"", allowtransparency:"", scrolling:"no"}));
  _.$JSCompiler_StaticMethods_applyFillContent$$($JSCompiler_StaticMethods_renderAmpCreative_$self$$.iframe);
  var $fontsArray$$ = [];
  $creativeMetaData$jscomp$2$$.$customStylesheets$ && $creativeMetaData$jscomp$2$$.$customStylesheets$.forEach(function($JSCompiler_StaticMethods_renderAmpCreative_$self$$) {
    ($JSCompiler_StaticMethods_renderAmpCreative_$self$$ = $JSCompiler_StaticMethods_renderAmpCreative_$self$$.href) && $fontsArray$$.push($JSCompiler_StaticMethods_renderAmpCreative_$self$$);
  });
  var $checkStillCurrent$jscomp$3$$ = $JSCompiler_StaticMethods_renderAmpCreative_$self$$.$verifyStillCurrent$();
  return _.$installFriendlyIframeEmbed$$module$src$friendly_iframe_embed$$($JSCompiler_StaticMethods_renderAmpCreative_$self$$.iframe, $JSCompiler_StaticMethods_renderAmpCreative_$self$$.element, {host:$JSCompiler_StaticMethods_renderAmpCreative_$self$$.element, url:$JSCompiler_StaticMethods_renderAmpCreative_$self$$.$adUrl_$, html:$creativeMetaData$jscomp$2$$.$minifiedCreative$, $extensionIds$:$creativeMetaData$jscomp$2$$.$customElementExtensions$ || [], fonts:$fontsArray$$}, function($creativeMetaData$jscomp$2$$) {
    var $fontsArray$$ = $JSCompiler_StaticMethods_renderAmpCreative_$self$$.$getAmpDoc$(), $checkStillCurrent$jscomp$3$$ = new _.$A4AVariableSource$$module$extensions$amp_a4a$0_1$a4a_variable_source$$($JSCompiler_StaticMethods_renderAmpCreative_$self$$.$getAmpDoc$(), $creativeMetaData$jscomp$2$$);
    _.$installServiceInEmbedScope$$module$src$service$$($creativeMetaData$jscomp$2$$, "url-replace", new _.$UrlReplacements$$module$src$service$url_replacements_impl$$($fontsArray$$, $checkStillCurrent$jscomp$3$$));
  }).then(function($fontsArray$$) {
    $checkStillCurrent$jscomp$3$$();
    $JSCompiler_StaticMethods_renderAmpCreative_$self$$.$friendlyIframeEmbed_$ = $fontsArray$$;
    $setFriendlyIframeEmbedVisible$$module$src$friendly_iframe_embed$$($fontsArray$$, $JSCompiler_StaticMethods_renderAmpCreative_$self$$.$isInViewport$());
    var $friendlyIframeEmbed_iniLoadPromise$$ = $fontsArray$$.iframe.contentDocument || $fontsArray$$.$win$.document;
    _.$setStyle$$module$src$style$$($friendlyIframeEmbed_iniLoadPromise$$.body, "visibility", "visible");
    $protectFunctionWrapper$$module$extensions$amp_a4a$0_1$amp_a4a$$($JSCompiler_StaticMethods_renderAmpCreative_$self$$.$onCreativeRender$, $JSCompiler_StaticMethods_renderAmpCreative_$self$$, function($creativeMetaData$jscomp$2$$) {
      _.$dev$$module$src$log$$().error("amp-a4a", $JSCompiler_StaticMethods_renderAmpCreative_$self$$.element.getAttribute("type"), "Error executing onCreativeRender", $creativeMetaData$jscomp$2$$);
    })($creativeMetaData$jscomp$2$$, $fontsArray$$.$I$);
    $fontsArray$$ = $fontsArray$$.$FriendlyIframeEmbed$$module$src$friendly_iframe_embed_prototype$whenIniLoaded$().then(function() {
      $checkStillCurrent$jscomp$3$$();
      $JSCompiler_StaticMethods_maybeTriggerAnalyticsEvent_$$($JSCompiler_StaticMethods_renderAmpCreative_$self$$, "friendlyIframeIniLoad");
    });
    if (!$friendlyIframeEmbed_iniLoadPromise$$.querySelector('meta[name="amp-experiments-opt-in"][content*="fie_ini_load_fix"]')) {
      return $fontsArray$$;
    }
  });
};
$JSCompiler_StaticMethods_iframeRenderHelper_$$ = function($JSCompiler_StaticMethods_iframeRenderHelper_$self$$, $attributes$jscomp$11_frameLoadPromise_mergedAttributes$$) {
  $attributes$jscomp$11_frameLoadPromise_mergedAttributes$$ = Object.assign($attributes$jscomp$11_frameLoadPromise_mergedAttributes$$, _.$dict$$module$src$utils$object$$({height:$JSCompiler_StaticMethods_iframeRenderHelper_$self$$.$creativeSize_$.height, width:$JSCompiler_StaticMethods_iframeRenderHelper_$self$$.$creativeSize_$.width}));
  $JSCompiler_StaticMethods_iframeRenderHelper_$self$$.sentinel && ($attributes$jscomp$11_frameLoadPromise_mergedAttributes$$["data-amp-3p-sentinel"] = $JSCompiler_StaticMethods_iframeRenderHelper_$self$$.sentinel);
  _.$isExperimentOn$$module$src$experiments$$($JSCompiler_StaticMethods_iframeRenderHelper_$self$$.$win$, "no-sync-xhr-in-ads") && ($attributes$jscomp$11_frameLoadPromise_mergedAttributes$$.allow = "sync-xhr 'none';");
  $JSCompiler_StaticMethods_iframeRenderHelper_$self$$.iframe = _.$createElementWithAttributes$$module$src$dom$$($JSCompiler_StaticMethods_iframeRenderHelper_$self$$.element.ownerDocument, "iframe", Object.assign($attributes$jscomp$11_frameLoadPromise_mergedAttributes$$, $SHARED_IFRAME_PROPERTIES$$module$extensions$amp_a4a$0_1$amp_a4a$$));
  $JSCompiler_StaticMethods_iframeRenderHelper_$self$$.$sandboxHTMLCreativeFrame$() && _.$applySandbox$$module$src$3p_frame$$($JSCompiler_StaticMethods_iframeRenderHelper_$self$$.iframe);
  $JSCompiler_StaticMethods_iframeRenderHelper_$self$$.$xOriginIframeHandler_$ = new window.AMP.AmpAdXOriginIframeHandler($JSCompiler_StaticMethods_iframeRenderHelper_$self$$);
  $attributes$jscomp$11_frameLoadPromise_mergedAttributes$$ = $JSCompiler_StaticMethods_iframeRenderHelper_$self$$.$xOriginIframeHandler_$.init($JSCompiler_StaticMethods_iframeRenderHelper_$self$$.iframe, !0);
  $protectFunctionWrapper$$module$extensions$amp_a4a$0_1$amp_a4a$$($JSCompiler_StaticMethods_iframeRenderHelper_$self$$.$onCreativeRender$, $JSCompiler_StaticMethods_iframeRenderHelper_$self$$, function($attributes$jscomp$11_frameLoadPromise_mergedAttributes$$) {
    _.$dev$$module$src$log$$().error("amp-a4a", $JSCompiler_StaticMethods_iframeRenderHelper_$self$$.element.getAttribute("type"), "Error executing onCreativeRender", $attributes$jscomp$11_frameLoadPromise_mergedAttributes$$);
  })(null);
  return $attributes$jscomp$11_frameLoadPromise_mergedAttributes$$;
};
$JSCompiler_StaticMethods_renderViaIframeGet_$$ = function($JSCompiler_StaticMethods_renderViaIframeGet_$self$$, $JSCompiler_inline_result$jscomp$461_adUrl$jscomp$3$$) {
  $JSCompiler_StaticMethods_maybeTriggerAnalyticsEvent_$$($JSCompiler_StaticMethods_renderViaIframeGet_$self$$, "renderCrossDomainStart");
  _.$Services$$module$src$services$xhrFor$$($JSCompiler_StaticMethods_renderViaIframeGet_$self$$.$win$);
  $JSCompiler_inline_result$jscomp$461_adUrl$jscomp$3$$ = _.$getCorsUrl$$module$src$url$$($JSCompiler_StaticMethods_renderViaIframeGet_$self$$.$win$, $JSCompiler_inline_result$jscomp$461_adUrl$jscomp$3$$);
  return $JSCompiler_StaticMethods_iframeRenderHelper_$$($JSCompiler_StaticMethods_renderViaIframeGet_$self$$, _.$dict$$module$src$utils$object$$({src:$JSCompiler_inline_result$jscomp$461_adUrl$jscomp$3$$, name:JSON.stringify(_.$getContextMetadata$$module$src$iframe_attributes$$($JSCompiler_StaticMethods_renderViaIframeGet_$self$$.$win$, $JSCompiler_StaticMethods_renderViaIframeGet_$self$$.element, $JSCompiler_StaticMethods_renderViaIframeGet_$self$$.sentinel))}));
};
$JSCompiler_StaticMethods_renderViaNameAttrOfXOriginIframe_$$ = function($JSCompiler_StaticMethods_renderViaNameAttrOfXOriginIframe_$self$$, $creativeBody$$) {
  var $method$jscomp$18$$ = $JSCompiler_StaticMethods_renderViaNameAttrOfXOriginIframe_$self$$.$experimentalNonAmpCreativeRenderMethod_$;
  $JSCompiler_StaticMethods_maybeTriggerAnalyticsEvent_$$($JSCompiler_StaticMethods_renderViaNameAttrOfXOriginIframe_$self$$, "renderSafeFrameStart");
  var $checkStillCurrent$jscomp$4$$ = $JSCompiler_StaticMethods_renderViaNameAttrOfXOriginIframe_$self$$.$verifyStillCurrent$();
  return _.$tryResolve$$module$src$utils$promise$$(function() {
    return _.$utf8Decode$$module$src$utils$bytes$$($creativeBody$$);
  }).then(function($creativeBody$$) {
    $checkStillCurrent$jscomp$4$$();
    var $creative$jscomp$3$$ = "";
    switch($method$jscomp$18$$) {
      case "safeframe":
        var $srcPath$$ = $JSCompiler_StaticMethods_getSafeframePath$$($JSCompiler_StaticMethods_renderViaNameAttrOfXOriginIframe_$self$$) + "?n=0";
        break;
      case "nameframe":
        $srcPath$$ = _.$getDefaultBootstrapBaseUrl$$module$src$3p_frame$$($JSCompiler_StaticMethods_renderViaNameAttrOfXOriginIframe_$self$$.$win$, "nameframe");
        break;
      default:
        return _.$user$$module$src$log$$().error("A4A", "A4A received unrecognized cross-domain name attribute iframe rendering mode request: %s.  Unable to render a creative for slot %s.", $method$jscomp$18$$, $JSCompiler_StaticMethods_renderViaNameAttrOfXOriginIframe_$self$$.element.getAttribute("id")), window.Promise.reject("Unrecognized rendering mode request");
    }
    var $contextMetadata$$ = _.$getContextMetadata$$module$src$iframe_attributes$$($JSCompiler_StaticMethods_renderViaNameAttrOfXOriginIframe_$self$$.$win$, $JSCompiler_StaticMethods_renderViaNameAttrOfXOriginIframe_$self$$.element, $JSCompiler_StaticMethods_renderViaNameAttrOfXOriginIframe_$self$$.sentinel, $JSCompiler_StaticMethods_renderViaNameAttrOfXOriginIframe_$self$$.$getAdditionalContextMetadata$("safeframe" == $method$jscomp$18$$));
    "nameframe" == $method$jscomp$18$$ ? ($contextMetadata$$.creative = $creativeBody$$, $creative$jscomp$3$$ = JSON.stringify($contextMetadata$$)) : "safeframe" == $method$jscomp$18$$ && ($contextMetadata$$ = JSON.stringify($contextMetadata$$), $creative$jscomp$3$$ = $JSCompiler_StaticMethods_renderViaNameAttrOfXOriginIframe_$self$$.$safeframeVersion$ + ";" + $creativeBody$$.length + ";" + $creativeBody$$ + $contextMetadata$$);
    return $JSCompiler_StaticMethods_iframeRenderHelper_$$($JSCompiler_StaticMethods_renderViaNameAttrOfXOriginIframe_$self$$, _.$dict$$module$src$utils$object$$({src:$srcPath$$, name:$creative$jscomp$3$$}));
  });
};
$JSCompiler_StaticMethods_getSafeframePath$$ = function($JSCompiler_StaticMethods_getSafeframePath$self$$) {
  return "https://tpc.googlesyndication.com/safeframe/" + ($JSCompiler_StaticMethods_getSafeframePath$self$$.$safeframeVersion$ + "/html/container.html");
};
$JSCompiler_StaticMethods_maybeTriggerAnalyticsEvent_$$ = function($JSCompiler_StaticMethods_maybeTriggerAnalyticsEvent_$self$$, $analyticsEvent_lifecycleStage$$) {
  if ($JSCompiler_StaticMethods_maybeTriggerAnalyticsEvent_$self$$.$a4aAnalyticsConfig_$) {
    $analyticsEvent_lifecycleStage$$ = $LIFECYCLE_STAGE_TO_ANALYTICS_TRIGGER$$module$extensions$amp_a4a$0_1$amp_a4a$$[$analyticsEvent_lifecycleStage$$];
    var $analyticsVars$$ = Object.assign(_.$dict$$module$src$utils$object$$({time:Math.round($JSCompiler_StaticMethods_maybeTriggerAnalyticsEvent_$self$$.$getNow_$())}), $JSCompiler_StaticMethods_maybeTriggerAnalyticsEvent_$self$$.$getA4aAnalyticsVars$($analyticsEvent_lifecycleStage$$));
    _.$triggerAnalyticsEvent$$module$src$analytics$$($JSCompiler_StaticMethods_maybeTriggerAnalyticsEvent_$self$$.element, $analyticsEvent_lifecycleStage$$, $analyticsVars$$);
  }
};
$JSCompiler_StaticMethods_tryExecuteRealTimeConfig_$$ = function($JSCompiler_StaticMethods_tryExecuteRealTimeConfig_$self$$, $consentState$jscomp$2$$) {
  if (window.AMP.RealTimeConfigManager) {
    try {
      return (new window.AMP.RealTimeConfigManager($JSCompiler_StaticMethods_tryExecuteRealTimeConfig_$self$$)).$maybeExecuteRealTimeConfig$($JSCompiler_StaticMethods_tryExecuteRealTimeConfig_$self$$.$getCustomRealTimeConfigMacros_$(), $consentState$jscomp$2$$);
    } catch ($err$jscomp$20$$) {
      _.$user$$module$src$log$$().error("amp-a4a", "Could not perform Real Time Config.", $err$jscomp$20$$);
    }
  } else {
    $JSCompiler_StaticMethods_tryExecuteRealTimeConfig_$self$$.element.getAttribute("rtc-config") && _.$user$$module$src$log$$().error("amp-a4a", "RTC not supported for ad network " + $JSCompiler_StaticMethods_tryExecuteRealTimeConfig_$self$$.element.getAttribute("type"));
  }
};
_.$assignAdUrlToError$$module$extensions$amp_a4a$0_1$amp_a4a$$ = function($error$jscomp$34$$, $adUrl$jscomp$4$$) {
  if (!(!$adUrl$jscomp$4$$ || $error$jscomp$34$$.args && $error$jscomp$34$$.args.au)) {
    var $adQueryIdx$$ = $adUrl$jscomp$4$$.indexOf("?");
    -1 != $adQueryIdx$$ && (($error$jscomp$34$$.args || ($error$jscomp$34$$.args = {})).au = $adUrl$jscomp$4$$.substring($adQueryIdx$$ + 1, $adQueryIdx$$ + 251));
  }
};
$signatureVerifierFor$$module$extensions$amp_a4a$0_1$amp_a4a$$ = function($win$jscomp$276$$) {
  return $win$jscomp$276$$.AMP_FAST_FETCH_SIGNATURE_VERIFIER_ || ($win$jscomp$276$$.AMP_FAST_FETCH_SIGNATURE_VERIFIER_ = new $SignatureVerifier$$module$extensions$amp_a4a$0_1$signature_verifier$$($win$jscomp$276$$));
};
_.$AmpAdTemplateHelper$$module$extensions$amp_a4a$0_1$amp_ad_template_helper$$ = function($win$jscomp$277$$) {
  this.$F$ = $win$jscomp$277$$;
  this.$D$ = new _.$LruCache$$module$src$utils$lru_cache$$(5);
};
_.$JSCompiler_StaticMethods_insertAnalytics$$ = function($element$jscomp$255$$, $analyticsValue$$) {
  $analyticsValue$$ = _.$isArray$$module$src$types$$($analyticsValue$$) ? $analyticsValue$$ : [$analyticsValue$$];
  for (var $i$jscomp$147$$ = 0; $i$jscomp$147$$ < $analyticsValue$$.length; $i$jscomp$147$$++) {
    var $config$jscomp$9$$ = $analyticsValue$$[$i$jscomp$147$$], $analyticsEle$$ = $element$jscomp$255$$.ownerDocument.createElement("amp-analytics");
    $config$jscomp$9$$.remote && $analyticsEle$$.setAttribute("config", $config$jscomp$9$$.remote);
    $config$jscomp$9$$.type && $analyticsEle$$.setAttribute("type", $config$jscomp$9$$.type);
    if ($config$jscomp$9$$.inline) {
      var $scriptElem$jscomp$1$$ = _.$createElementWithAttributes$$module$src$dom$$($element$jscomp$255$$.ownerDocument, "script", _.$dict$$module$src$utils$object$$({type:"application/json"}));
      $scriptElem$jscomp$1$$.textContent = JSON.stringify($config$jscomp$9$$.inline);
      $analyticsEle$$.appendChild($scriptElem$jscomp$1$$);
    }
    $element$jscomp$255$$.appendChild($analyticsEle$$);
  }
};
$JSCompiler_StaticMethods_getTemplateProxyUrl_$$ = function($url$jscomp$105$$) {
  var $cdnUrlSuffix$$ = _.$urls$$module$src$config$$.cdn.slice(8), $loc$jscomp$2$$ = _.$parseUrlDeprecated$$module$src$url$$($url$jscomp$105$$);
  return 0 < $loc$jscomp$2$$.origin.indexOf($cdnUrlSuffix$$) ? $url$jscomp$105$$ : "https://" + $loc$jscomp$2$$.hostname.replace(/-/g, "--").replace(/\./g, "-") + "." + $cdnUrlSuffix$$ + "/ad/s/" + $loc$jscomp$2$$.hostname + $loc$jscomp$2$$.pathname;
};
_.$BaseElement$$module$src$base_element$$.prototype.$updateLayoutPriority$ = _.$JSCompiler_unstubMethod$$(2, function($newLayoutPriority$$) {
  this.element.$getResources$().$updateLayoutPriority$(this.element, $newLayoutPriority$$);
});
_.$Resource$$module$src$service$resource$$.prototype.$updateLayoutPriority$ = _.$JSCompiler_unstubMethod$$(1, function($newPriority$$) {
  this.$aa$ = $newPriority$$;
});
_.$Resources$$module$src$service$resources_impl$$.prototype.$updateLayoutPriority$ = _.$JSCompiler_unstubMethod$$(0, function($element$jscomp$130$$, $newLayoutPriority$jscomp$1$$) {
  var $resource$jscomp$13$$ = _.$Resource$$module$src$service$resource$forElementOptional$$($element$jscomp$130$$);
  $resource$jscomp$13$$.$updateLayoutPriority$($newLayoutPriority$jscomp$1$$);
  this.$F$.forEach(function($element$jscomp$130$$) {
    $element$jscomp$130$$.$resource$ == $resource$jscomp$13$$ && ($element$jscomp$130$$.$priority$ = $newLayoutPriority$jscomp$1$$);
  });
  _.$JSCompiler_StaticMethods_schedulePass$$(this);
});
var $HTML_ESCAPE_CHARS$$module$src$dom$$ = {"&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;", "'":"&#x27;", "`":"&#x60;"}, $HTML_ESCAPE_REGEX$$module$src$dom$$ = /(&|<|>|"|'|`)/g, $srcdocSupported$$module$src$friendly_iframe_embed$$;
_.$JSCompiler_prototypeAlias$$ = $FriendlyIframeEmbed$$module$src$friendly_iframe_embed$$.prototype;
_.$JSCompiler_prototypeAlias$$.$destroy$ = function() {
  $JSCompiler_StaticMethods_removeForChildWindow$$(_.$Services$$module$src$services$resourcesForDoc$$(this.iframe), this.$win$);
  _.$disposeServicesInternal$$module$src$service$$(this.$win$);
};
_.$JSCompiler_prototypeAlias$$.signals = function() {
  return this.$D$;
};
_.$JSCompiler_prototypeAlias$$.$whenReady$ = function() {
  return this.$D$.whenSignal("render-start");
};
_.$JSCompiler_prototypeAlias$$.$FriendlyIframeEmbed$$module$src$friendly_iframe_embed_prototype$whenIniLoaded$ = function() {
  return this.$D$.whenSignal("ini-load");
};
_.$JSCompiler_prototypeAlias$$.$FriendlyIframeEmbed$$module$src$friendly_iframe_embed_prototype$onVisibilityChanged$ = function($handler$jscomp$26$$) {
  this.$F$.add($handler$jscomp$26$$);
};
_.$JSCompiler_prototypeAlias$$.$enterFullOverlayMode$ = function() {
  var $JSCompiler_object_inline_top_404$$, $JSCompiler_object_inline_left_405$$, $JSCompiler_object_inline_width_406$$, $JSCompiler_object_inline_height_407$$, $$jscomp$this$jscomp$127$$ = this;
  $JSCompiler_StaticMethods_measureMutate_$$(this, {measure:function() {
    var $$jscomp$destructuring$var103_rect$jscomp$6$$ = $$jscomp$this$jscomp$127$$.host ? $$jscomp$this$jscomp$127$$.host.$getLayoutBox$() : $$jscomp$this$jscomp$127$$.iframe.getBoundingClientRect(), $dy$jscomp$6$$ = -_.$JSCompiler_StaticMethods_Viewport$$module$src$service$viewport$viewport_impl_prototype$getScrollTop$$(_.$Services$$module$src$services$viewportForDoc$$($$jscomp$this$jscomp$127$$.iframe));
    $$jscomp$destructuring$var103_rect$jscomp$6$$ = _.$moveLayoutRect$$module$src$layout_rect$$($$jscomp$destructuring$var103_rect$jscomp$6$$, 0, $dy$jscomp$6$$);
    $JSCompiler_object_inline_top_404$$ = _.$px$$module$src$style$$($$jscomp$destructuring$var103_rect$jscomp$6$$.top);
    $JSCompiler_object_inline_left_405$$ = _.$px$$module$src$style$$($$jscomp$destructuring$var103_rect$jscomp$6$$.left);
    $JSCompiler_object_inline_width_406$$ = _.$px$$module$src$style$$($$jscomp$destructuring$var103_rect$jscomp$6$$.width);
    $JSCompiler_object_inline_height_407$$ = _.$px$$module$src$style$$($$jscomp$destructuring$var103_rect$jscomp$6$$.height);
  }, $mutate$:function() {
    _.$setImportantStyles$$module$src$style$$($$jscomp$this$jscomp$127$$.iframe, {position:"fixed", left:0, right:0, bottom:0, width:"100vw", top:0, height:"100vh"});
    _.$setImportantStyles$$module$src$style$$(($$jscomp$this$jscomp$127$$.iframe.contentDocument || $$jscomp$this$jscomp$127$$.iframe.contentWindow.document).body, {background:"transparent", position:"absolute", bottom:"auto", right:"auto", top:$JSCompiler_object_inline_top_404$$, left:$JSCompiler_object_inline_left_405$$, width:$JSCompiler_object_inline_width_406$$, height:$JSCompiler_object_inline_height_407$$});
  }});
};
_.$JSCompiler_prototypeAlias$$.$leaveFullOverlayMode$ = function() {
  var $$jscomp$this$jscomp$128$$ = this;
  $JSCompiler_StaticMethods_measureMutate_$$(this, {$mutate$:function() {
    _.$resetStyles$$module$src$style$$($$jscomp$this$jscomp$128$$.iframe, "position left right top bottom width height".split(" "));
    _.$resetStyles$$module$src$style$$(($$jscomp$this$jscomp$128$$.iframe.contentDocument || $$jscomp$this$jscomp$128$$.iframe.contentWindow.document).body, "position top left width height bottom right".split(" "));
  }});
};
var $throttlePromiseResolver_$$module$extensions$amp_ad$0_1$concurrent_load$$;
_.$throttlePromise_$$module$extensions$amp_ad$0_1$concurrent_load$$ = null;
$throttlePromiseResolver_$$module$extensions$amp_ad$0_1$concurrent_load$$ = null;
var $ADSENSE_AMP_AUTO_ADS_EXPERIMENT_INFO$$module$ads$google$adsense_amp_auto_ads$$ = {$isTrafficEligible$:function($win$jscomp$241$$) {
  return !!$win$jscomp$241$$.document.querySelector("AMP-AUTO-ADS");
}, $branches$:["3782001", "3782002"]};
var $ADSENSE_AMP_AUTO_ADS_RESPONSIVE_EXPERIMENT_INFO$$module$ads$google$adsense_amp_auto_ads_responsive$$ = {$isTrafficEligible$:function($win$jscomp$243$$) {
  return !!$win$jscomp$243$$.document.querySelector("AMP-AUTO-ADS");
}, $branches$:["19861210", "19861211"]};
_.$DUMMY_FLUID_SIZE_ARR$$module$ads$google$utils$$ = ["320", "50"].map(function($dim$$) {
  return Number($dim$$);
});
var $visibilityStateCodes$$module$ads$google$a4a$utils$$, $TRUNCATION_PARAM$$module$ads$google$a4a$utils$$, $CDN_PROXY_REGEXP$$module$ads$google$a4a$utils$$, $IDENTITY_DOMAIN_REGEXP_$$module$ads$google$a4a$utils$$, $Capability$$module$ads$google$a4a$utils$SVG_SUPPORTED$$, $Capability$$module$ads$google$a4a$utils$SANDBOXING_ALLOW_TOP_NAVIGATION_BY_USER_ACTIVATION_SUPPORTED$$, $Capability$$module$ads$google$a4a$utils$SANDBOXING_ALLOW_POPUPS_TO_ESCAPE_SANDBOX_SUPPORTED$$;
_.$ValidAdContainerTypes$$module$ads$google$a4a$utils$$ = {"AMP-CAROUSEL":"ac", "AMP-FX-FLYING-CARPET":"fc", "AMP-LIGHTBOX":"lb", "AMP-STICKY-AD":"sa"};
$visibilityStateCodes$$module$ads$google$a4a$utils$$ = {visible:"1", hidden:"2", prerender:"3", unloaded:"5"};
$TRUNCATION_PARAM$$module$ads$google$a4a$utils$$ = {name:"trunc", value:"1"};
$CDN_PROXY_REGEXP$$module$ads$google$a4a$utils$$ = /^https:\/\/([a-zA-Z0-9_-]+\.)?cdn\.ampproject\.org((\/.*)|($))+/;
$IDENTITY_DOMAIN_REGEXP_$$module$ads$google$a4a$utils$$ = /\.google\.(?:com?\.)?[a-z]{2,3}$/;
$Capability$$module$ads$google$a4a$utils$SVG_SUPPORTED$$ = 1;
$Capability$$module$ads$google$a4a$utils$SANDBOXING_ALLOW_TOP_NAVIGATION_BY_USER_ACTIVATION_SUPPORTED$$ = 2;
$Capability$$module$ads$google$a4a$utils$SANDBOXING_ALLOW_POPUPS_TO_ESCAPE_SANDBOX_SUPPORTED$$ = 4;
var $signingServerURLs$$module$ads$_a4a_config$$ = {google:"https://cdn.ampproject.org/amp-ad-verifying-keyset.json", "google-dev":"https://cdn.ampproject.org/amp-ad-verifying-keyset-dev.json", cloudflare:"https://amp.cloudflare.com/amp-ad-verifying-keyset.json", "cloudflare-dev":"https://amp.cloudflare.com/amp-ad-verifying-keyset-dev.json"};
var $WHITELISTED_VARIABLES$$module$extensions$amp_a4a$0_1$a4a_variable_source$$ = "AMPDOC_HOST AMPDOC_HOSTNAME AMPDOC_URL AMP_VERSION AVAILABLE_SCREEN_HEIGHT AVAILABLE_SCREEN_WIDTH BACKGROUND_STATE BROWSER_LANGUAGE CANONICAL_HOST CANONICAL_HOSTNAME CANONICAL_PATH CANONICAL_URL COUNTER DOCUMENT_CHARSET DOCUMENT_REFERRER FIRST_CONTENTFUL_PAINT FIRST_VIEWPORT_READY MAKE_BODY_VISIBLE PAGE_VIEW_ID RANDOM SCREEN_COLOR_DEPTH SCREEN_HEIGHT SCREEN_WIDTH SCROLL_HEIGHT SCROLL_LEFT SCROLL_TOP SCROLL_WIDTH SHARE_TRACKING_INCOMING SHARE_TRACKING_OUTGOING SOURCE_HOST SOURCE_HOSTNAME SOURCE_PATH SOURCE_URL TIMESTAMP TIMEZONE TIMEZONE_CODE TITLE TOTAL_ENGAGED_TIME USER_AGENT VARIANT VARIANTS VIEWER VIEWPORT_HEIGHT VIEWPORT_WIDTH".split(" ");
_.$$jscomp$inherits$$(_.$A4AVariableSource$$module$extensions$amp_a4a$0_1$a4a_variable_source$$, _.$VariableSource$$module$src$service$variable_source$$);
_.$A4AVariableSource$$module$extensions$amp_a4a$0_1$a4a_variable_source$$.prototype.$I$ = function() {
  var $$jscomp$this$jscomp$211$$ = this;
  _.$JSCompiler_StaticMethods_setAsync$$(this.set("AD_NAV_TIMING", function($v$jscomp$6$$, $varName$jscomp$5$$) {
    return _.$getTimingDataSync$$module$src$service$variable_source$$($$jscomp$this$jscomp$211$$.$F$, $v$jscomp$6$$, $varName$jscomp$5$$);
  }), "AD_NAV_TIMING", function($v$jscomp$6$$, $varName$jscomp$5$$) {
    return _.$getTimingDataAsync$$module$src$service$variable_source$$($$jscomp$this$jscomp$211$$.$F$, $v$jscomp$6$$, $varName$jscomp$5$$);
  });
  this.set("AD_NAV_TYPE", function() {
    return _.$getNavigationData$$module$src$service$variable_source$$($$jscomp$this$jscomp$211$$.$F$, "type");
  });
  this.set("AD_NAV_REDIRECT_COUNT", function() {
    return _.$getNavigationData$$module$src$service$variable_source$$($$jscomp$this$jscomp$211$$.$F$, "redirectCount");
  });
  this.set("HTML_ATTR", this.$O$.bind(this));
  this.set("CLIENT_ID", function() {
    return null;
  });
  for (var $v$jscomp$6$$ = 0; $v$jscomp$6$$ < $WHITELISTED_VARIABLES$$module$extensions$amp_a4a$0_1$a4a_variable_source$$.length; $v$jscomp$6$$++) {
    var $varName$jscomp$5$$ = $WHITELISTED_VARIABLES$$module$extensions$amp_a4a$0_1$a4a_variable_source$$[$v$jscomp$6$$], $resolvers$$ = this.$K$.get($varName$jscomp$5$$);
    _.$JSCompiler_StaticMethods_setAsync$$(this.set($varName$jscomp$5$$, $resolvers$$.sync), $varName$jscomp$5$$, $resolvers$$.async);
  }
};
_.$A4AVariableSource$$module$extensions$amp_a4a$0_1$a4a_variable_source$$.prototype.$O$ = function($cssSelector$$, $var_args$jscomp$61$$) {
  var $attributeNames$$ = Array.prototype.slice.call(arguments, 1);
  if (!$cssSelector$$ || !$attributeNames$$.length) {
    return "[]";
  }
  if (10 < $attributeNames$$.length) {
    return _.$user$$module$src$log$$().error("A4AVariableSource", "At most 10 may be requested."), "[]";
  }
  $cssSelector$$ = (0,window.decodeURI)($cssSelector$$);
  try {
    var $elements$jscomp$15$$ = this.$F$.document.querySelectorAll($cssSelector$$);
  } catch ($e$193$$) {
    return _.$user$$module$src$log$$().error("A4AVariableSource", "Invalid selector: " + $cssSelector$$), "[]";
  }
  if (20 < $elements$jscomp$15$$.length) {
    return _.$user$$module$src$log$$().error("A4AVariableSource", "CSS selector may match at most 20 elements."), "[]";
  }
  for (var $result$jscomp$14$$ = [], $i$jscomp$145$$ = 0; $i$jscomp$145$$ < $elements$jscomp$15$$.length && 10 > $result$jscomp$14$$.length; ++$i$jscomp$145$$) {
    for (var $currentResult$$ = {}, $foundAtLeastOneAttr$$ = !1, $j$jscomp$3$$ = 0; $j$jscomp$3$$ < $attributeNames$$.length; ++$j$jscomp$3$$) {
      var $attributeName$jscomp$1$$ = $attributeNames$$[$j$jscomp$3$$];
      $elements$jscomp$15$$[$i$jscomp$145$$].hasAttribute($attributeName$jscomp$1$$) && ($currentResult$$[$attributeName$jscomp$1$$] = $elements$jscomp$15$$[$i$jscomp$145$$].getAttribute($attributeName$jscomp$1$$), $foundAtLeastOneAttr$$ = !0);
    }
    $foundAtLeastOneAttr$$ && $result$jscomp$14$$.push($currentResult$$);
  }
  return JSON.stringify($result$jscomp$14$$);
};
var $METADATA_STRINGS$$module$extensions$amp_a4a$0_1$amp_a4a$$ = ["<script amp-ad-metadata type=application/json>", '<script type="application/json" amp-ad-metadata>', "<script type=application/json amp-ad-metadata>"], $XORIGIN_MODE$$module$extensions$amp_a4a$0_1$amp_a4a$$ = {$CLIENT_CACHE$:"client_cache", $SAFEFRAME$:"safeframe", $NAMEFRAME$:"nameframe", $IFRAME_GET$:"iframe_get"}, $SHARED_IFRAME_PROPERTIES$$module$extensions$amp_a4a$0_1$amp_a4a$$ = _.$dict$$module$src$utils$object$$({frameborder:"0", 
allowfullscreen:"", allowtransparency:"", scrolling:"no", marginwidth:"0", marginheight:"0"}), $LIFECYCLE_STAGE_TO_ANALYTICS_TRIGGER$$module$extensions$amp_a4a$0_1$amp_a4a$$ = {adRequestStart:"ad-request-start", adRequestEnd:"ad-response-end", renderFriendlyStart:"ad-render-start", renderCrossDomainStart:"ad-render-start", renderSafeFrameStart:"ad-render-start", renderFriendlyEnd:"ad-render-end", renderCrossDomainEnd:"ad-render-end", friendlyIframeIniLoad:"ad-iframe-loaded", crossDomainIframeLoaded:"ad-iframe-loaded"};
_.$$jscomp$inherits$$(_.$AmpA4A$$module$extensions$amp_a4a$0_1$amp_a4a$$, window.AMP.BaseElement);
_.$JSCompiler_prototypeAlias$$ = _.$AmpA4A$$module$extensions$amp_a4a$0_1$amp_a4a$$.prototype;
_.$JSCompiler_prototypeAlias$$.$getLayoutPriority$ = function() {
  return this.element.$getAmpDoc$().$isSingleDoc$() ? 2 : 1;
};
_.$JSCompiler_prototypeAlias$$.$isLayoutSupported$ = function($layout$jscomp$24$$) {
  return _.$isLayoutSizeDefined$$module$src$layout$$($layout$jscomp$24$$);
};
_.$JSCompiler_prototypeAlias$$.$isRelayoutNeeded$ = function() {
  return this.$isRelayoutNeededFlag$;
};
_.$JSCompiler_prototypeAlias$$.$buildCallback$ = function() {
  var $$jscomp$this$jscomp$214$$ = this;
  this.$creativeSize_$ = {width:this.element.getAttribute("width"), height:this.element.getAttribute("height")};
  var $upgradeDelayMs$$ = Math.round(_.$Resource$$module$src$service$resource$forElementOptional$$(this.element).element.$Ca$);
  _.$dev$$module$src$log$$().$Log$$module$src$log_prototype$info$("amp-a4a", "upgradeDelay " + this.element.getAttribute("type") + ": " + $upgradeDelayMs$$);
  this.$uiHandler$ = new window.AMP.AmpAdUIHandler(this);
  var $verifier$$ = $signatureVerifierFor$$module$extensions$amp_a4a$0_1$amp_a4a$$(this.$win$);
  this.$keysetPromise_$ = _.$Services$$module$src$services$viewerForDoc$$(this.$getAmpDoc$()).$D$.then(function() {
    $$jscomp$this$jscomp$214$$.$getSigningServiceNames$().forEach(function($$jscomp$this$jscomp$214$$) {
      if ($verifier$$.$D$ && !$verifier$$.$D$[$$jscomp$this$jscomp$214$$]) {
        var $upgradeDelayMs$$ = {}, $signingServiceName$jscomp$4$$ = $JSCompiler_StaticMethods_fetchAndAddKeys_$$($verifier$$, $upgradeDelayMs$$, $$jscomp$this$jscomp$214$$, null);
        $verifier$$.$D$[$$jscomp$this$jscomp$214$$] = {$promise$:$signingServiceName$jscomp$4$$, keys:$upgradeDelayMs$$};
      }
    });
  });
  if (this.$a4aAnalyticsConfig_$ = this.$getA4aAnalyticsConfig$()) {
    this.$a4aAnalyticsElement_$ = _.$insertAnalyticsElement$$module$src$extension_analytics$$(this.element, this.$a4aAnalyticsConfig_$);
  }
  this.$isSinglePageStoryAd$ = this.element.hasAttribute("amp-story");
};
_.$JSCompiler_prototypeAlias$$.$renderOutsideViewport$ = function() {
  if (!this.$isVerifiedAmpCreative_$ && this.$win$["3pla"] && !$JSCompiler_StaticMethods_inNonAmpPreferenceExp$$(this)) {
    return !1;
  }
  var $elementCheck$$ = _.$getAmpAdRenderOutsideViewport$$module$extensions$amp_ad$0_1$concurrent_load$$(this.element);
  return null !== $elementCheck$$ ? $elementCheck$$ : window.AMP.BaseElement.prototype.$renderOutsideViewport$.call(this);
};
_.$JSCompiler_prototypeAlias$$.isValidElement = function() {
  return !0;
};
_.$JSCompiler_prototypeAlias$$.$delayAdRequestEnabled$ = function() {
  return !1;
};
_.$JSCompiler_prototypeAlias$$.$getPreconnectUrls$ = function() {
  return [];
};
_.$JSCompiler_prototypeAlias$$.$preconnectCallback$ = function() {
  var $$jscomp$this$jscomp$215$$ = this, $preconnect$jscomp$2$$ = this.$getPreconnectUrls$();
  $preconnect$jscomp$2$$ && $preconnect$jscomp$2$$.forEach(function($preconnect$jscomp$2$$) {
    $$jscomp$this$jscomp$215$$.$preconnect$.url($preconnect$jscomp$2$$, !0);
  });
};
_.$JSCompiler_prototypeAlias$$.$resumeCallback$ = function() {
  if (!this.$friendlyIframeEmbed_$) {
    this.$fromResumeCallback$ = !0;
    var $resource$jscomp$31$$ = _.$Resource$$module$src$service$resource$forElementOptional$$(this.element);
    $resource$jscomp$31$$.$D$ && !$resource$jscomp$31$$.$I$ && this.$onLayoutMeasure$();
  }
};
_.$JSCompiler_prototypeAlias$$.$onLayoutMeasure$ = function() {
  _.$JSCompiler_StaticMethods_initiateAdRequest$$(this);
};
_.$JSCompiler_prototypeAlias$$.$maybeValidateAmpCreative$ = function($bytes$jscomp$10$$, $headers$jscomp$3$$) {
  var $$jscomp$this$jscomp$217$$ = this, $checkStillCurrent$jscomp$1$$ = this.$verifyStillCurrent$();
  return this.$keysetPromise_$.then(function() {
    if ("fake" != $$jscomp$this$jscomp$217$$.element.getAttribute("type") || $$jscomp$this$jscomp$217$$.element.getAttribute("checksig")) {
      var $checkStillCurrent$jscomp$1$$ = $signatureVerifierFor$$module$extensions$amp_a4a$0_1$amp_a4a$$($$jscomp$this$jscomp$217$$.$win$);
      if ($headers$jscomp$3$$.has("AMP-Fast-Fetch-Signature")) {
        var $headerValue$jscomp$inline_1960$$ = $headers$jscomp$3$$.get("AMP-Fast-Fetch-Signature"), $match$jscomp$inline_1961$$ = /^([A-Za-z0-9._-]+):([A-Za-z0-9._-]+):([A-Za-z0-9+/]{341}[AQgw]==)$/.exec($headerValue$jscomp$inline_1960$$);
        $match$jscomp$inline_1961$$ ? $checkStillCurrent$jscomp$1$$ = $JSCompiler_StaticMethods_verifyCreativeAndSignature$$($checkStillCurrent$jscomp$1$$, $match$jscomp$inline_1961$$[1], $match$jscomp$inline_1961$$[2], _.$stringToBytes$$module$src$utils$bytes$$((0,window.atob)($match$jscomp$inline_1961$$[3])), $bytes$jscomp$10$$) : (_.$user$$module$src$log$$().error("AMP-A4A", "Invalid signature header: " + $headerValue$jscomp$inline_1960$$.split(":")[0]), $checkStillCurrent$jscomp$1$$ = window.Promise.resolve(3));
      } else {
        $checkStillCurrent$jscomp$1$$ = window.Promise.resolve(1);
      }
    } else {
      $checkStillCurrent$jscomp$1$$ = window.Promise.resolve(0);
    }
    return $checkStillCurrent$jscomp$1$$;
  }).then(function($headers$jscomp$3$$) {
    $checkStillCurrent$jscomp$1$$();
    var $status$jscomp$2$$ = null;
    switch($headers$jscomp$3$$) {
      case 0:
        $status$jscomp$2$$ = $bytes$jscomp$10$$;
        break;
      case 4:
        $status$jscomp$2$$ = $$jscomp$this$jscomp$217$$.$shouldPreferentialRenderWithoutCrypto$() ? $bytes$jscomp$10$$ : null;
        break;
      case 2:
      case 3:
        _.$user$$module$src$log$$().error("amp-a4a", $$jscomp$this$jscomp$217$$.element.getAttribute("type"), "Signature verification failed");
    }
    if ($$jscomp$this$jscomp$217$$.$isSinglePageStoryAd$ && !$status$jscomp$2$$) {
      throw Error("INVALID-SPSA-RESPONSE");
    }
    return $status$jscomp$2$$;
  });
};
_.$JSCompiler_prototypeAlias$$.$AmpA4A$$module$extensions$amp_a4a$0_1$amp_a4a_prototype$refresh$ = _.$JSCompiler_stubMethod$$(52);
_.$JSCompiler_prototypeAlias$$.$layoutCallback$ = function() {
  this.$isRefreshing$ && $JSCompiler_StaticMethods_destroyFrame$$(this, !0);
  return $JSCompiler_StaticMethods_attemptToRenderCreative$$(this);
};
_.$JSCompiler_prototypeAlias$$.$isXhrAllowed$ = function() {
  return !0;
};
_.$JSCompiler_prototypeAlias$$.$attemptChangeSize$ = function($newHeight$jscomp$9$$, $newWidth$jscomp$7$$) {
  this.$originalSlotSize_$ = this.$originalSlotSize_$ || this.$getLayoutBox$();
  return window.AMP.BaseElement.prototype.$attemptChangeSize$.call(this, $newHeight$jscomp$9$$, $newWidth$jscomp$7$$);
};
_.$JSCompiler_prototypeAlias$$.$unlayoutCallback$ = function() {
  this.$tearDownSlot$();
  return !0;
};
_.$JSCompiler_prototypeAlias$$.$tearDownSlot$ = function() {
  var $$jscomp$this$jscomp$221$$ = this;
  this.$promiseId_$++;
  this.$uiHandler$.$I$();
  this.$originalSlotSize_$ && window.AMP.BaseElement.prototype.$attemptChangeSize$.call(this, this.$originalSlotSize_$.height, this.$originalSlotSize_$.width).then(function() {
    $$jscomp$this$jscomp$221$$.$originalSlotSize_$ = null;
  }).catch(function($$jscomp$this$jscomp$221$$) {
    _.$dev$$module$src$log$$().$Log$$module$src$log_prototype$warn$("amp-a4a", "unable to revert to original size", $$jscomp$this$jscomp$221$$);
  });
  this.$isCollapsed_$ = !1;
  $JSCompiler_StaticMethods_destroyFrame$$(this);
  this.$creativeBody_$ = this.$adUrl_$ = this.$adPromise_$ = null;
  this.$fromResumeCallback$ = this.$isVerifiedAmpCreative_$ = !1;
  this.$experimentalNonAmpCreativeRenderMethod_$ = this.$getNonAmpCreativeRenderingMethod$();
  this.$postAdResponseExperimentFeatures$ = {};
};
_.$JSCompiler_prototypeAlias$$.detachedCallback = function() {
  window.AMP.BaseElement.prototype.detachedCallback.call(this);
  $JSCompiler_StaticMethods_destroyFrame$$(this, !0);
};
_.$JSCompiler_prototypeAlias$$.$viewportCallback$ = function($inViewport$jscomp$5$$) {
  this.$friendlyIframeEmbed_$ && _.$JSCompiler_StaticMethods_FriendlyIframeEmbed$$module$src$friendly_iframe_embed_prototype$setVisible_$$(this.$friendlyIframeEmbed_$, $inViewport$jscomp$5$$);
  this.$xOriginIframeHandler_$ && this.$xOriginIframeHandler_$.$viewportCallback$($inViewport$jscomp$5$$);
};
_.$JSCompiler_prototypeAlias$$.$createPlaceholderCallback$ = function() {
  return this.$uiHandler$.$G$();
};
_.$JSCompiler_prototypeAlias$$.$getAdUrl$ = function() {
  throw Error("getAdUrl not implemented!");
};
_.$JSCompiler_prototypeAlias$$.$verifyStillCurrent$ = function() {
  var $$jscomp$this$jscomp$222$$ = this, $promiseId$jscomp$1$$ = this.$promiseId_$;
  return function() {
    if ($promiseId$jscomp$1$$ != $$jscomp$this$jscomp$222$$.$promiseId_$) {
      throw _.$cancellation$$module$src$error$$();
    }
  };
};
_.$JSCompiler_prototypeAlias$$.$extractSize$ = function($headerValue$jscomp$3_responseHeaders$jscomp$1$$) {
  $headerValue$jscomp$3_responseHeaders$jscomp$1$$ = $headerValue$jscomp$3_responseHeaders$jscomp$1$$.get("X-CreativeSize");
  if (!$headerValue$jscomp$3_responseHeaders$jscomp$1$$) {
    return null;
  }
  var $match$jscomp$11$$ = /^([0-9]+)x([0-9]+)$/.exec($headerValue$jscomp$3_responseHeaders$jscomp$1$$);
  return $match$jscomp$11$$ ? {width:Number($match$jscomp$11$$[1]), height:Number($match$jscomp$11$$[2])} : (_.$user$$module$src$log$$().error("amp-a4a", "Invalid size header: " + $headerValue$jscomp$3_responseHeaders$jscomp$1$$), null);
};
_.$JSCompiler_prototypeAlias$$.$onCreativeRender$ = function($creativeMetaData$jscomp$1$$) {
  $JSCompiler_StaticMethods_maybeTriggerAnalyticsEvent_$$(this, $creativeMetaData$jscomp$1$$ ? "renderFriendlyEnd" : "renderCrossDomainEnd");
};
_.$JSCompiler_prototypeAlias$$.$sandboxHTMLCreativeFrame$ = function() {
  return _.$isExperimentOn$$module$src$experiments$$(this.$win$, "sandbox-ads");
};
_.$JSCompiler_prototypeAlias$$.$sendXhrRequest$ = function($adUrl$jscomp$2$$) {
  var $$jscomp$this$jscomp$223$$ = this;
  $JSCompiler_StaticMethods_maybeTriggerAnalyticsEvent_$$(this, "adRequestStart");
  return _.$Services$$module$src$services$xhrFor$$(this.$win$).fetch($adUrl$jscomp$2$$, {mode:"cors", method:"GET", credentials:"include"}).catch(function($adUrl$jscomp$2$$) {
    if ($adUrl$jscomp$2$$.response && 200 < $adUrl$jscomp$2$$.response.status) {
      return null;
    }
    $adUrl$jscomp$2$$ = $$jscomp$this$jscomp$223$$.$onNetworkFailure$($adUrl$jscomp$2$$, $$jscomp$this$jscomp$223$$.$adUrl_$);
    if ($adUrl$jscomp$2$$.$frameGetDisabled$) {
      _.$dev$$module$src$log$$().$Log$$module$src$log_prototype$info$("amp-a4a", "frame get disabled as part of network failure handler"), $$jscomp$this$jscomp$223$$.$adUrl_$ = null;
    } else {
      return $$jscomp$this$jscomp$223$$.$adUrl_$ = $adUrl$jscomp$2$$.$adUrl$ || $$jscomp$this$jscomp$223$$.$adUrl_$, window.Promise.reject("NETWORK-FAILURE");
    }
    return null;
  });
};
_.$JSCompiler_prototypeAlias$$.$onNetworkFailure$ = function() {
  return {};
};
_.$JSCompiler_prototypeAlias$$.$getSigningServiceNames$ = function() {
  return ["google"];
};
_.$JSCompiler_prototypeAlias$$.$renderNonAmpCreative$ = function($throttleApplied$$) {
  var $$jscomp$this$jscomp$224$$ = this;
  if ("true" == this.element.getAttribute("disable3pfallback")) {
    return _.$user$$module$src$log$$().$Log$$module$src$log_prototype$warn$("amp-a4a", this.element.getAttribute("type"), "fallback to 3p disabled"), window.Promise.resolve(!1);
  }
  _.$dev$$module$src$log$$().$Log$$module$src$log_prototype$warn$("amp-a4a", "fallback to 3p");
  var $method$jscomp$17$$ = this.$experimentalNonAmpCreativeRenderMethod_$, $renderPromise$$ = window.Promise.resolve(!1);
  "safeframe" != $method$jscomp$17$$ && "nameframe" != $method$jscomp$17$$ || !this.$creativeBody_$ ? this.$adUrl_$ ? $renderPromise$$ = $JSCompiler_StaticMethods_renderViaIframeGet_$$(this, this.$adUrl_$) : _.$user$$module$src$log$$().$Log$$module$src$log_prototype$warn$("amp-a4a", this.element.getAttribute("type"), "No creative or URL available -- A4A can't render any ad") : ($renderPromise$$ = $JSCompiler_StaticMethods_renderViaNameAttrOfXOriginIframe_$$(this, this.$creativeBody_$), this.$creativeBody_$ = 
  null);
  $throttleApplied$$ || $JSCompiler_StaticMethods_inNonAmpPreferenceExp$$(this) || _.$incrementLoadingAds$$module$extensions$amp_ad$0_1$concurrent_load$$(this.$win$, $renderPromise$$);
  return $renderPromise$$.then(function($throttleApplied$$) {
    $JSCompiler_StaticMethods_maybeTriggerAnalyticsEvent_$$($$jscomp$this$jscomp$224$$, "crossDomainIframeLoaded");
    return $throttleApplied$$;
  });
};
_.$JSCompiler_prototypeAlias$$.$getAmpAdMetadata$ = function($creative$jscomp$4$$) {
  for (var $metadataStart$$ = -1, $metadataString$$, $i$jscomp$146_metadataEnd$$ = 0; $i$jscomp$146_metadataEnd$$ < $METADATA_STRINGS$$module$extensions$amp_a4a$0_1$amp_a4a$$.length && !($metadataString$$ = $METADATA_STRINGS$$module$extensions$amp_a4a$0_1$amp_a4a$$[$i$jscomp$146_metadataEnd$$], $metadataStart$$ = $creative$jscomp$4$$.lastIndexOf($metadataString$$), 0 <= $metadataStart$$); $i$jscomp$146_metadataEnd$$++) {
  }
  if (0 > $metadataStart$$) {
    return _.$dev$$module$src$log$$().$Log$$module$src$log_prototype$warn$("amp-a4a", this.element.getAttribute("type"), "Could not locate start index for amp meta data in: %s", $creative$jscomp$4$$), null;
  }
  $i$jscomp$146_metadataEnd$$ = $creative$jscomp$4$$.lastIndexOf("\x3c/script>");
  if (0 > $i$jscomp$146_metadataEnd$$) {
    return _.$dev$$module$src$log$$().$Log$$module$src$log_prototype$warn$("amp-a4a", this.element.getAttribute("type"), "Could not locate closing script tag for amp meta data in: %s", $creative$jscomp$4$$), null;
  }
  try {
    var $metaDataObj$$ = _.$parseJson$$module$src$json$$($creative$jscomp$4$$.slice($metadataStart$$ + $metadataString$$.length, $i$jscomp$146_metadataEnd$$)), $ampRuntimeUtf16CharOffsets$$ = $metaDataObj$$.ampRuntimeUtf16CharOffsets;
    if (!_.$isArray$$module$src$types$$($ampRuntimeUtf16CharOffsets$$) || 2 != $ampRuntimeUtf16CharOffsets$$.length || "number" !== typeof $ampRuntimeUtf16CharOffsets$$[0] || "number" !== typeof $ampRuntimeUtf16CharOffsets$$[1]) {
      throw Error("Invalid runtime offsets");
    }
    var $metaData$$ = {};
    if ($metaDataObj$$.customElementExtensions) {
      if ($metaData$$.$customElementExtensions$ = $metaDataObj$$.customElementExtensions, !_.$isArray$$module$src$types$$($metaData$$.$customElementExtensions$)) {
        throw Error("Invalid extensions", $metaData$$.$customElementExtensions$);
      }
    } else {
      $metaData$$.$customElementExtensions$ = [];
    }
    if ($metaDataObj$$.customStylesheets) {
      $metaData$$.$customStylesheets$ = $metaDataObj$$.customStylesheets;
      if (!_.$isArray$$module$src$types$$($metaData$$.$customStylesheets$)) {
        throw Error("Invalid custom stylesheets");
      }
      var $urls$jscomp$2$$ = _.$Services$$module$src$services$urlForDoc$$(this.element);
      $metaData$$.$customStylesheets$.forEach(function($creative$jscomp$4$$) {
        if (!_.$isObject$$module$src$types$$($creative$jscomp$4$$) || !$creative$jscomp$4$$.href || "string" !== typeof $creative$jscomp$4$$.href || !_.$JSCompiler_StaticMethods_isSecure$$($urls$jscomp$2$$, $creative$jscomp$4$$.href)) {
          throw Error("Invalid custom stylesheets");
        }
      });
    }
    _.$isArray$$module$src$types$$($metaDataObj$$.images) && ($metaData$$.images = $metaDataObj$$.images.splice(0, 5));
    if (this.$isSinglePageStoryAd$) {
      if (!$metaDataObj$$.ctaUrl || !$metaDataObj$$.ctaType) {
        throw Error("INVALID-SPSA-RESPONSE");
      }
      this.element.setAttribute("data-vars-ctatype", $metaDataObj$$.ctaType);
      this.element.setAttribute("data-vars-ctaurl", $metaDataObj$$.ctaUrl);
    }
    $metaData$$.$minifiedCreative$ = $creative$jscomp$4$$.slice(0, $ampRuntimeUtf16CharOffsets$$[0]) + $creative$jscomp$4$$.slice($ampRuntimeUtf16CharOffsets$$[1], $metadataStart$$) + $creative$jscomp$4$$.slice($i$jscomp$146_metadataEnd$$ + 9);
    return $metaData$$;
  } catch ($err$jscomp$19$$) {
    _.$dev$$module$src$log$$().$Log$$module$src$log_prototype$warn$("amp-a4a", this.element.getAttribute("type"), "Invalid amp metadata: %s", $creative$jscomp$4$$.slice($metadataStart$$ + $metadataString$$.length, $i$jscomp$146_metadataEnd$$));
    if (this.$isSinglePageStoryAd$) {
      throw $err$jscomp$19$$;
    }
    return null;
  }
};
_.$JSCompiler_prototypeAlias$$.$getA4aAnalyticsVars$ = function() {
  return _.$dict$$module$src$utils$object$$({});
};
_.$JSCompiler_prototypeAlias$$.$getA4aAnalyticsConfig$ = function() {
  return null;
};
_.$JSCompiler_prototypeAlias$$.$getCustomRealTimeConfigMacros_$ = function() {
  return {};
};
_.$JSCompiler_prototypeAlias$$.$shouldPreferentialRenderWithoutCrypto$ = function() {
  return !1;
};
_.$JSCompiler_prototypeAlias$$.$getNonAmpCreativeRenderingMethod$ = function($headerValue$jscomp$4$$) {
  if ($headerValue$jscomp$4$$) {
    if (_.$isEnumValue$$module$src$types$$($XORIGIN_MODE$$module$extensions$amp_a4a$0_1$amp_a4a$$, $headerValue$jscomp$4$$)) {
      return $headerValue$jscomp$4$$;
    }
    _.$dev$$module$src$log$$().error("AMP-A4A", "cross-origin render mode header " + $headerValue$jscomp$4$$);
  }
  return _.$JSCompiler_StaticMethods_isIos$$(_.$Services$$module$src$services$platformFor$$(this.$win$)) ? "nameframe" : null;
};
_.$JSCompiler_prototypeAlias$$.$getAdditionalContextMetadata$ = function() {
};
var $TEMPLATE_CORS_CONFIG$$module$extensions$amp_a4a$0_1$amp_ad_template_helper$$ = {mode:"cors", method:"GET", ampCors:!1, credentials:"omit"};
_.$AmpAdTemplateHelper$$module$extensions$amp_a4a$0_1$amp_ad_template_helper$$.prototype.fetch = function($proxyUrl_templateUrl$$) {
  $proxyUrl_templateUrl$$ = $JSCompiler_StaticMethods_getTemplateProxyUrl_$$($proxyUrl_templateUrl$$);
  var $templatePromise$$ = this.$D$.get($proxyUrl_templateUrl$$);
  $templatePromise$$ || ($templatePromise$$ = _.$JSCompiler_StaticMethods_fetchText$$(_.$Services$$module$src$services$xhrFor$$(this.$F$), $proxyUrl_templateUrl$$, $TEMPLATE_CORS_CONFIG$$module$extensions$amp_a4a$0_1$amp_ad_template_helper$$).then(function($proxyUrl_templateUrl$$) {
    return $proxyUrl_templateUrl$$.text();
  }), _.$JSCompiler_StaticMethods_LruCache$$module$src$utils$lru_cache_prototype$put$$(this.$D$, $proxyUrl_templateUrl$$, $templatePromise$$));
  return $templatePromise$$;
};
_.$AmpAdTemplateHelper$$module$extensions$amp_a4a$0_1$amp_ad_template_helper$$.prototype.render = function($templateValues$$, $element$jscomp$254$$) {
  return _.$JSCompiler_StaticMethods_findAndRenderTemplate$$(_.$Services$$module$src$services$templatesFor$$(this.$F$), $element$jscomp$254$$, $templateValues$$);
};

})});
