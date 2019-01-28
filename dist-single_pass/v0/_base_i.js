(self.AMP=self.AMP||[]).push({n:"_base_i",i:[],v:"1901181729101",f:(function(AMP,_){
var $JSCompiler_StaticMethods_updateInViewportForSubresources_$$, $JSCompiler_StaticMethods_onNextPass$$, $JSCompiler_StaticMethods_waitForTemplateClass_$$, $JSCompiler_StaticMethods_getMacroNames$$, $JSCompiler_StaticMethods_collectUnwhitelistedVarsSync$$, $JSCompiler_StaticMethods_unobserveHiddenMutations_$$, $JSCompiler_StaticMethods_removeElement$$, $ancestorElements$$module$src$dom$$, $getListenForSentinel$$module$src$iframe_helper$$, $getOrCreateListenForEvents$$module$src$iframe_helper$$, 
$dropListenSentinel$$module$src$iframe_helper$$, $parseIfNeeded$$module$src$iframe_helper$$, $registerGlobalListenerIfNeeded$$module$src$iframe_helper$$, $layoutRectEquals$$module$src$layout_rect$$, $JSCompiler_StaticMethods_getValidIntersectionChangeEntry_$$, $JSCompiler_StaticMethods_disconnectMutationObserver_$$, $JSCompiler_StaticMethods_startSendingIntersection_$$, $getFrameAttributes$$module$src$3p_frame$$, $getBootstrapBaseUrl$$module$src$3p_frame$$, $getRandom$$module$src$3p_frame$$, $isAutoplaySupportedImpl$$module$src$utils$video$$, 
$PositionObserverWorker$$module$src$service$position_observer$position_observer_worker$$, $PositionObserver$$module$src$service$position_observer$position_observer_impl$$, $JSCompiler_StaticMethods_startCallback_$$, $JSCompiler_StaticMethods_stopCallback_$$, $JSCompiler_StaticMethods_updateAllEntries$$, $JSCompiler_StaticMethods_schedulePass_$$, $installAutoplayStylesForDoc$$module$src$service$video$install_autoplay_styles$$, $renderOrClone$$module$src$service$video$autoplay$$, $renderInteractionOverlay$$module$src$service$video$autoplay$$, 
$renderIcon$$module$src$service$video$autoplay$$, $Autoplay$$module$src$service$video$autoplay$$, $AutoplayEntry$$module$src$service$video$autoplay$$, $JSCompiler_StaticMethods_observeOn_$$, $JSCompiler_StaticMethods_listenToVisibilityChange_$$, $JSCompiler_StaticMethods_triggerByVisibility_$$, $JSCompiler_StaticMethods_AutoplayEntry$$module$src$service$video$autoplay_prototype$trigger_$$, $JSCompiler_StaticMethods_attachArtifacts_$$, $JSCompiler_StaticMethods_onInteraction_$$, $JSCompiler_StaticMethods_disableTriggerByVisibility_$$, 
$VideoServiceSync$$module$src$service$video_service_sync_impl$videoServiceFor$$, $JSCompiler_StaticMethods_maybeInstallAutoplay_$$, $VideoEntry$$module$src$service$video_service_sync_impl$$, $JSCompiler_StaticMethods_listenOnLoad_$$, $JSCompiler_StaticMethods_listenToAutoplayEvents_$$, $setVideoComponentClassname$$module$src$service$video_service_sync_impl$$, $validateMetadata$$module$src$mediasession_helper$$, $VideoSessionManager$$module$src$service$video_session_manager$$, $JSCompiler_StaticMethods_onSessionEnd$$, 
$JSCompiler_StaticMethods_endSession$$, $JSCompiler_StaticMethods_VideoManager$$module$src$service$video_manager_impl_prototype$registerCommonActions_$$, $JSCompiler_StaticMethods_maybeInstallVisibilityObserver_$$, $JSCompiler_StaticMethods_logCustomAnalytics_$$, $JSCompiler_StaticMethods_listenForAutoplayDelegation_$$, $JSCompiler_StaticMethods_videoLoaded$$, $JSCompiler_StaticMethods_loadedVideoVisibilityChanged_$$, $JSCompiler_StaticMethods_autoplayVideoBuilt_$$, $JSCompiler_StaticMethods_installAutoplayArtifacts_$$, 
$JSCompiler_StaticMethods_updateVisibility$$, $JSCompiler_StaticMethods_VideoEntry$$module$src$service$video_manager_impl_prototype$getAnalyticsDetails$$, $AutoFullscreenManager$$module$src$service$video_manager_impl$$, $JSCompiler_StaticMethods_installFullscreenListener_$$, $JSCompiler_StaticMethods_installOrientationObserver_$$, $JSCompiler_StaticMethods_onRotation_$$, $JSCompiler_StaticMethods_AutoFullscreenManager$$module$src$service$video_manager_impl_prototype$enter_$$, $JSCompiler_StaticMethods_AutoFullscreenManager$$module$src$service$video_manager_impl_prototype$exit_$$, 
$JSCompiler_StaticMethods_scrollIntoIfNotVisible_$$, $JSCompiler_StaticMethods_selectBestCenteredInPortrait_$$, $centerDist$$module$src$service$video_manager_impl$$, $isLandscape$$module$src$service$video_manager_impl$$, $AnalyticsPercentageTracker$$module$src$service$video_manager_impl$$, $JSCompiler_StaticMethods_hasDuration_$$, $JSCompiler_StaticMethods_calculate_$$, $JSCompiler_StaticMethods_maybeTrigger_$$, $analyticsEvent$$module$src$service$video_manager_impl$$, $CustomEventReporter$$module$src$extension_analytics$$;
_.$JSCompiler_unstubMethod$$ = function($JSCompiler_unstubMethod_id$$, $JSCompiler_unstubMethod_body$$) {
  return _.$JSCompiler_stubMap$$[$JSCompiler_unstubMethod_id$$] = $JSCompiler_unstubMethod_body$$;
};
$JSCompiler_StaticMethods_updateInViewportForSubresources_$$ = function($JSCompiler_StaticMethods_updateInViewportForSubresources_$self$$, $parentResource$jscomp$4$$, $subElements$jscomp$7$$, $inLocalViewport$jscomp$2$$) {
  var $inViewport$jscomp$4$$ = $parentResource$jscomp$4$$.$isInViewport$() && $inLocalViewport$jscomp$2$$;
  _.$JSCompiler_StaticMethods_discoverResourcesForArray_$$($JSCompiler_StaticMethods_updateInViewportForSubresources_$self$$, $parentResource$jscomp$4$$, $subElements$jscomp$7$$, function($JSCompiler_StaticMethods_updateInViewportForSubresources_$self$$) {
    $JSCompiler_StaticMethods_updateInViewportForSubresources_$self$$.element.$viewportCallback$($inViewport$jscomp$4$$);
  });
};
_.$JSCompiler_StaticMethods_assertNumber$$ = function($JSCompiler_StaticMethods_assertNumber$self$$, $shouldBeNumber$$, $opt_message$jscomp$10$$) {
  $JSCompiler_StaticMethods_assertNumber$self$$.$Log$$module$src$log_prototype$assert$("number" == typeof $shouldBeNumber$$, ($opt_message$jscomp$10$$ || "Number expected") + ": %s", $shouldBeNumber$$);
  return $shouldBeNumber$$;
};
_.$isSecureUrlDeprecated$$module$src$url$$ = function($url$jscomp$28$$) {
  "string" == typeof $url$jscomp$28$$ && ($url$jscomp$28$$ = _.$parseUrlDeprecated$$module$src$url$$($url$jscomp$28$$));
  return "https:" == $url$jscomp$28$$.protocol || "localhost" == $url$jscomp$28$$.hostname || _.$endsWith$$module$src$string$$($url$jscomp$28$$.hostname, ".localhost");
};
_.$cancellation$$module$src$error$$ = function() {
  return Error("CANCELLED");
};
_.$JSCompiler_StaticMethods_registerAction$$ = function($JSCompiler_StaticMethods_registerAction$self$$, $alias$$, $handler$jscomp$6$$, $minTrust$$) {
  $minTrust$$ = void 0 === $minTrust$$ ? 100 : $minTrust$$;
  _.$JSCompiler_StaticMethods_initActionMap_$$($JSCompiler_StaticMethods_registerAction$self$$);
  $JSCompiler_StaticMethods_registerAction$self$$.$actionMap_$[$alias$$] = {$handler$:$handler$jscomp$6$$, $minTrust$:$minTrust$$};
};
_.$JSCompiler_StaticMethods_changeHeight$$ = function($JSCompiler_StaticMethods_changeHeight$self$$, $newHeight$$) {
  $JSCompiler_StaticMethods_changeHeight$self$$.element.$getResources$().$changeSize$($JSCompiler_StaticMethods_changeHeight$self$$.element, $newHeight$$, void 0);
};
_.$JSCompiler_StaticMethods_attemptChangeHeight$$ = function($JSCompiler_StaticMethods_attemptChangeHeight$self$$, $newHeight$jscomp$1$$) {
  return $JSCompiler_StaticMethods_attemptChangeHeight$self$$.element.$getResources$().$attemptChangeSize$($JSCompiler_StaticMethods_attemptChangeHeight$self$$.element, $newHeight$jscomp$1$$, void 0);
};
_.$JSCompiler_StaticMethods_fetchText$$ = function($JSCompiler_StaticMethods_fetchText$self$$, $input$jscomp$19$$, $opt_init$jscomp$9$$) {
  return $JSCompiler_StaticMethods_fetchText$self$$.fetch($input$jscomp$19$$, _.$setupInit$$module$src$utils$xhr_utils$$($opt_init$jscomp$9$$, "text/plain"));
};
_.$layoutRectFromDomRect$$module$src$layout_rect$$ = function($rect$$) {
  return _.$layoutRectLtwh$$module$src$layout_rect$$(Number($rect$$.left), Number($rect$$.top), Number($rect$$.width), Number($rect$$.height));
};
_.$Resource$$module$src$service$resource$setOwner$$ = function($cachedElements_element$jscomp$103$$, $i$jscomp$80_owner$jscomp$2$$) {
  $i$jscomp$80_owner$jscomp$2$$.contains($cachedElements_element$jscomp$103$$);
  _.$Resource$$module$src$service$resource$forElementOptional$$($cachedElements_element$jscomp$103$$) && (_.$Resource$$module$src$service$resource$forElementOptional$$($cachedElements_element$jscomp$103$$).$K$ = $i$jscomp$80_owner$jscomp$2$$);
  $cachedElements_element$jscomp$103$$.__AMP__OWNER = $i$jscomp$80_owner$jscomp$2$$;
  $cachedElements_element$jscomp$103$$ = $cachedElements_element$jscomp$103$$.getElementsByClassName("i-amphtml-element");
  for ($i$jscomp$80_owner$jscomp$2$$ = 0; $i$jscomp$80_owner$jscomp$2$$ < $cachedElements_element$jscomp$103$$.length; $i$jscomp$80_owner$jscomp$2$$++) {
    var $ele$$ = $cachedElements_element$jscomp$103$$[$i$jscomp$80_owner$jscomp$2$$];
    _.$Resource$$module$src$service$resource$forElementOptional$$($ele$$) && (_.$Resource$$module$src$service$resource$forElementOptional$$($ele$$).$K$ = void 0);
  }
};
_.$JSCompiler_StaticMethods_isAndroid$$ = function($JSCompiler_StaticMethods_isAndroid$self$$) {
  return /Android/i.test($JSCompiler_StaticMethods_isAndroid$self$$.$D$.userAgent);
};
$JSCompiler_StaticMethods_onNextPass$$ = function($JSCompiler_StaticMethods_onNextPass$self$$, $callback$jscomp$77$$) {
  $JSCompiler_StaticMethods_onNextPass$self$$.$ba$.push($callback$jscomp$77$$);
};
_.$JSCompiler_StaticMethods_Resources$$module$src$service$resources_impl_prototype$requireLayout$$ = function($JSCompiler_StaticMethods_Resources$$module$src$service$resources_impl_prototype$requireLayout$self$$, $element$jscomp$129$$) {
  var $promises$jscomp$6$$ = [];
  _.$JSCompiler_StaticMethods_discoverResourcesForElement_$$($JSCompiler_StaticMethods_Resources$$module$src$service$resources_impl_prototype$requireLayout$self$$, $element$jscomp$129$$, function($element$jscomp$129$$) {
    4 != $element$jscomp$129$$.$state_$ && (3 != $element$jscomp$129$$.$state_$ ? $promises$jscomp$6$$.push($element$jscomp$129$$.element.signals().whenSignal("res-built").then(function() {
      $element$jscomp$129$$.measure();
      if (_.$JSCompiler_StaticMethods_isDisplayed$$($element$jscomp$129$$)) {
        return _.$JSCompiler_StaticMethods_scheduleLayoutOrPreload_$$($JSCompiler_StaticMethods_Resources$$module$src$service$resources_impl_prototype$requireLayout$self$$, $element$jscomp$129$$, !0, void 0, !0), $element$jscomp$129$$.$loadPromise_$;
      }
    })) : _.$JSCompiler_StaticMethods_isDisplayed$$($element$jscomp$129$$) && $promises$jscomp$6$$.push($element$jscomp$129$$.$loadPromise_$));
  });
  return window.Promise.all($promises$jscomp$6$$);
};
_.$JSCompiler_StaticMethods_maybeFindTemplate$$ = function($parent$jscomp$20$$, $opt_querySelector$jscomp$5$$) {
  var $templateId$$ = $parent$jscomp$20$$.getAttribute("template");
  return $templateId$$ ? _.$rootNodeFor$$module$src$dom$$($parent$jscomp$20$$).getElementById($templateId$$) : $opt_querySelector$jscomp$5$$ ? _.$scopedQuerySelector$$module$src$dom$$($parent$jscomp$20$$, $opt_querySelector$jscomp$5$$) : $parent$jscomp$20$$.querySelector("template, script");
};
$JSCompiler_StaticMethods_waitForTemplateClass_$$ = function($JSCompiler_StaticMethods_waitForTemplateClass_$self$$, $type$jscomp$129$$) {
  if ($JSCompiler_StaticMethods_waitForTemplateClass_$self$$.$D$[$type$jscomp$129$$]) {
    return $JSCompiler_StaticMethods_waitForTemplateClass_$self$$.$D$[$type$jscomp$129$$];
  }
  var $$jscomp$destructuring$var91_resolve$jscomp$33$$ = new _.$Deferred$$module$src$utils$promise$$, $promise$jscomp$25$$ = $$jscomp$destructuring$var91_resolve$jscomp$33$$.$promise$;
  $$jscomp$destructuring$var91_resolve$jscomp$33$$ = $$jscomp$destructuring$var91_resolve$jscomp$33$$.resolve;
  $JSCompiler_StaticMethods_waitForTemplateClass_$self$$.$D$[$type$jscomp$129$$] = $promise$jscomp$25$$;
  $JSCompiler_StaticMethods_waitForTemplateClass_$self$$.$F$[$type$jscomp$129$$] = $$jscomp$destructuring$var91_resolve$jscomp$33$$;
  return $promise$jscomp$25$$;
};
_.$JSCompiler_StaticMethods_getImplementation_$$ = function($JSCompiler_StaticMethods_getImplementation_$self$$, $element$jscomp$147$$) {
  var $impl$jscomp$6_type$jscomp$128$$ = $element$jscomp$147$$.__AMP_IMPL_;
  if ($impl$jscomp$6_type$jscomp$128$$) {
    return window.Promise.resolve($impl$jscomp$6_type$jscomp$128$$);
  }
  $impl$jscomp$6_type$jscomp$128$$ = "";
  var $promise$jscomp$24_tagName$jscomp$19$$ = $element$jscomp$147$$.tagName;
  "TEMPLATE" == $promise$jscomp$24_tagName$jscomp$19$$ ? $impl$jscomp$6_type$jscomp$128$$ = $element$jscomp$147$$.getAttribute("type") : "SCRIPT" == $promise$jscomp$24_tagName$jscomp$19$$ && ($impl$jscomp$6_type$jscomp$128$$ = $element$jscomp$147$$.getAttribute("template"));
  if ($promise$jscomp$24_tagName$jscomp$19$$ = $element$jscomp$147$$.__AMP_WAIT_) {
    return $promise$jscomp$24_tagName$jscomp$19$$;
  }
  $promise$jscomp$24_tagName$jscomp$19$$ = $JSCompiler_StaticMethods_waitForTemplateClass_$$($JSCompiler_StaticMethods_getImplementation_$self$$, $impl$jscomp$6_type$jscomp$128$$).then(function($impl$jscomp$6_type$jscomp$128$$) {
    $impl$jscomp$6_type$jscomp$128$$ = $element$jscomp$147$$.__AMP_IMPL_ = new $impl$jscomp$6_type$jscomp$128$$($element$jscomp$147$$, $JSCompiler_StaticMethods_getImplementation_$self$$.$G$);
    delete $element$jscomp$147$$.__AMP_WAIT_;
    return $impl$jscomp$6_type$jscomp$128$$;
  });
  return $element$jscomp$147$$.__AMP_WAIT_ = $promise$jscomp$24_tagName$jscomp$19$$;
};
_.$JSCompiler_StaticMethods_Templates$$module$src$service$template_impl_prototype$renderTemplate$$ = function($JSCompiler_StaticMethods_Templates$$module$src$service$template_impl_prototype$renderTemplate$self$$, $templateElement$jscomp$1$$, $data$jscomp$56$$) {
  return _.$JSCompiler_StaticMethods_getImplementation_$$($JSCompiler_StaticMethods_Templates$$module$src$service$template_impl_prototype$renderTemplate$self$$, $templateElement$jscomp$1$$).then(function($JSCompiler_StaticMethods_Templates$$module$src$service$template_impl_prototype$renderTemplate$self$$) {
    return $JSCompiler_StaticMethods_Templates$$module$src$service$template_impl_prototype$renderTemplate$self$$.render($data$jscomp$56$$);
  });
};
_.$JSCompiler_StaticMethods_findAndRenderTemplate$$ = function($JSCompiler_StaticMethods_findAndRenderTemplate$self$$, $parent$jscomp$15$$, $data$jscomp$57$$) {
  return _.$JSCompiler_StaticMethods_Templates$$module$src$service$template_impl_prototype$renderTemplate$$($JSCompiler_StaticMethods_findAndRenderTemplate$self$$, _.$JSCompiler_StaticMethods_maybeFindTemplate$$($parent$jscomp$15$$, void 0), $data$jscomp$57$$);
};
_.$JSCompiler_StaticMethods_Url$$module$src$service$url_impl_prototype$isProxyOrigin$$ = function($JSCompiler_StaticMethods_Url$$module$src$service$url_impl_prototype$isProxyOrigin$self$$, $url$jscomp$74$$) {
  return _.$isProxyOrigin$$module$src$url$$($url$jscomp$74$$);
};
_.$JSCompiler_StaticMethods_isSecure$$ = function($JSCompiler_StaticMethods_isSecure$self$$, $url$jscomp$75$$) {
  return _.$isSecureUrlDeprecated$$module$src$url$$($JSCompiler_StaticMethods_isSecure$self$$.parse($url$jscomp$75$$));
};
$JSCompiler_StaticMethods_getMacroNames$$ = function($JSCompiler_StaticMethods_getMacroNames$self_expr$jscomp$7$$, $matches$jscomp$5_url$jscomp$77$$) {
  $JSCompiler_StaticMethods_getMacroNames$self_expr$jscomp$7$$ = _.$JSCompiler_StaticMethods_getExpr$$($JSCompiler_StaticMethods_getMacroNames$self_expr$jscomp$7$$.$G$, $JSCompiler_StaticMethods_getMacroNames$self_expr$jscomp$7$$.$F$, $JSCompiler_StaticMethods_getMacroNames$self_expr$jscomp$7$$.$I$);
  return ($matches$jscomp$5_url$jscomp$77$$ = $matches$jscomp$5_url$jscomp$77$$.match($JSCompiler_StaticMethods_getMacroNames$self_expr$jscomp$7$$)) ? $matches$jscomp$5_url$jscomp$77$$ : [];
};
$JSCompiler_StaticMethods_collectUnwhitelistedVarsSync$$ = function($JSCompiler_StaticMethods_collectUnwhitelistedVarsSync$self_macroNames$$, $element$jscomp$157$$) {
  var $url$jscomp$88$$ = $element$jscomp$157$$.getAttribute("src");
  $JSCompiler_StaticMethods_collectUnwhitelistedVarsSync$self_macroNames$$ = $JSCompiler_StaticMethods_getMacroNames$$(new _.$Expander$$module$src$service$url_expander$expander$$($JSCompiler_StaticMethods_collectUnwhitelistedVarsSync$self_macroNames$$.$D$), $url$jscomp$88$$);
  var $whitelist$jscomp$6$$ = _.$JSCompiler_StaticMethods_getWhitelistForElement_$$($element$jscomp$157$$);
  return $whitelist$jscomp$6$$ ? $JSCompiler_StaticMethods_collectUnwhitelistedVarsSync$self_macroNames$$.filter(function($JSCompiler_StaticMethods_collectUnwhitelistedVarsSync$self_macroNames$$) {
    return !$whitelist$jscomp$6$$[$JSCompiler_StaticMethods_collectUnwhitelistedVarsSync$self_macroNames$$];
  }) : $JSCompiler_StaticMethods_collectUnwhitelistedVarsSync$self_macroNames$$;
};
_.$JSCompiler_StaticMethods_whenNextVisible$$ = function($JSCompiler_StaticMethods_whenNextVisible$self$$) {
  if (_.$JSCompiler_StaticMethods_Viewer$$module$src$service$viewer_impl_prototype$isVisible$$($JSCompiler_StaticMethods_whenNextVisible$self$$)) {
    return window.Promise.resolve();
  }
  if ($JSCompiler_StaticMethods_whenNextVisible$self$$.$aa$) {
    return $JSCompiler_StaticMethods_whenNextVisible$self$$.$aa$;
  }
  var $deferred$jscomp$19$$ = new _.$Deferred$$module$src$utils$promise$$;
  $JSCompiler_StaticMethods_whenNextVisible$self$$.$ba$ = $deferred$jscomp$19$$.resolve;
  return $JSCompiler_StaticMethods_whenNextVisible$self$$.$aa$ = $deferred$jscomp$19$$.$promise$;
};
$JSCompiler_StaticMethods_unobserveHiddenMutations_$$ = function($JSCompiler_StaticMethods_unobserveHiddenMutations_$self_mo$jscomp$2$$) {
  _.$JSCompiler_StaticMethods_clearMutationObserver_$$($JSCompiler_StaticMethods_unobserveHiddenMutations_$self_mo$jscomp$2$$);
  ($JSCompiler_StaticMethods_unobserveHiddenMutations_$self_mo$jscomp$2$$ = $JSCompiler_StaticMethods_unobserveHiddenMutations_$self_mo$jscomp$2$$.$F$) && $JSCompiler_StaticMethods_unobserveHiddenMutations_$self_mo$jscomp$2$$.disconnect();
};
$JSCompiler_StaticMethods_removeElement$$ = function($JSCompiler_StaticMethods_removeElement$self$$, $element$jscomp$177$$) {
  var $removed$jscomp$1$$ = _.$JSCompiler_StaticMethods_removeElement_$$($JSCompiler_StaticMethods_removeElement$self$$, $element$jscomp$177$$);
  0 < $removed$jscomp$1$$.length && $JSCompiler_StaticMethods_removeElement$self$$.$D$ && ($JSCompiler_StaticMethods_removeElement$self$$.$vsync_$.$mutate$(function() {
    for (var $element$jscomp$177$$ = 0; $element$jscomp$177$$ < $removed$jscomp$1$$.length; $element$jscomp$177$$++) {
      var $fe$$ = $removed$jscomp$1$$[$element$jscomp$177$$];
      "fixed" == $fe$$.position && $JSCompiler_StaticMethods_removeElement$self$$.$D$.$G$($fe$$);
    }
  }), $JSCompiler_StaticMethods_removeElement$self$$.$elements_$.length || $JSCompiler_StaticMethods_unobserveHiddenMutations_$$($JSCompiler_StaticMethods_removeElement$self$$));
};
_.$JSCompiler_StaticMethods_updatePaddingBottom$$ = function($JSCompiler_StaticMethods_updatePaddingBottom$self$$, $paddingBottom$$) {
  $JSCompiler_StaticMethods_updatePaddingBottom$self$$.ampdoc.$whenBodyAvailable$().then(function($JSCompiler_StaticMethods_updatePaddingBottom$self$$) {
    _.$setStyle$$module$src$style$$($JSCompiler_StaticMethods_updatePaddingBottom$self$$, "borderBottom", $paddingBottom$$ + "px solid transparent");
  });
};
_.$JSCompiler_StaticMethods_getClientRectAsync$$ = function($JSCompiler_StaticMethods_getClientRectAsync$self$$, $el$jscomp$22$$) {
  if ($JSCompiler_StaticMethods_getClientRectAsync$self$$.$useLayers_$) {
    return _.$JSCompiler_StaticMethods_measurePromise$$($JSCompiler_StaticMethods_getClientRectAsync$self$$.$vsync_$, function() {
      return $JSCompiler_StaticMethods_getClientRectAsync$self$$.$getLayoutRect$($el$jscomp$22$$);
    });
  }
  var $local$$ = _.$JSCompiler_StaticMethods_measurePromise$$($JSCompiler_StaticMethods_getClientRectAsync$self$$.$vsync_$, function() {
    return $el$jscomp$22$$.getBoundingClientRect();
  }), $root$jscomp$16$$ = $JSCompiler_StaticMethods_getClientRectAsync$self$$.$D$.$getRootClientRectAsync$(), $frameElement$jscomp$4$$ = _.$getParentWindowFrameElement$$module$src$service$$($el$jscomp$22$$, $JSCompiler_StaticMethods_getClientRectAsync$self$$.ampdoc.$win$);
  $frameElement$jscomp$4$$ && ($root$jscomp$16$$ = _.$JSCompiler_StaticMethods_measurePromise$$($JSCompiler_StaticMethods_getClientRectAsync$self$$.$vsync_$, function() {
    return $frameElement$jscomp$4$$.getBoundingClientRect();
  }));
  return window.Promise.all([$local$$, $root$jscomp$16$$]).then(function($JSCompiler_StaticMethods_getClientRectAsync$self$$) {
    var $el$jscomp$22$$ = $JSCompiler_StaticMethods_getClientRectAsync$self$$[0];
    return ($JSCompiler_StaticMethods_getClientRectAsync$self$$ = $JSCompiler_StaticMethods_getClientRectAsync$self$$[1]) ? _.$moveLayoutRect$$module$src$layout_rect$$($el$jscomp$22$$, $JSCompiler_StaticMethods_getClientRectAsync$self$$.left, $JSCompiler_StaticMethods_getClientRectAsync$self$$.top) : _.$layoutRectFromDomRect$$module$src$layout_rect$$($el$jscomp$22$$);
  });
};
_.$JSCompiler_StaticMethods_Viewport$$module$src$service$viewport$viewport_impl_prototype$onResize$$ = function($JSCompiler_StaticMethods_Viewport$$module$src$service$viewport$viewport_impl_prototype$onResize$self$$, $handler$jscomp$30$$) {
  return $JSCompiler_StaticMethods_Viewport$$module$src$service$viewport$viewport_impl_prototype$onResize$self$$.$Y$.add($handler$jscomp$30$$);
};
_.$JSCompiler_StaticMethods_addToFixedLayer$$ = function($JSCompiler_StaticMethods_FixedLayer$$module$src$service$fixed_layer_prototype$addElement$self$jscomp$inline_1643_JSCompiler_StaticMethods_addToFixedLayer$self$$, $element$jscomp$198$$, $opt_forceTransfer$jscomp$2$$) {
  $JSCompiler_StaticMethods_FixedLayer$$module$src$service$fixed_layer_prototype$addElement$self$jscomp$inline_1643_JSCompiler_StaticMethods_addToFixedLayer$self$$ = $JSCompiler_StaticMethods_FixedLayer$$module$src$service$fixed_layer_prototype$addElement$self$jscomp$inline_1643_JSCompiler_StaticMethods_addToFixedLayer$self$$.$G$;
  _.$JSCompiler_StaticMethods_setupElement_$$($JSCompiler_StaticMethods_FixedLayer$$module$src$service$fixed_layer_prototype$addElement$self$jscomp$inline_1643_JSCompiler_StaticMethods_addToFixedLayer$self$$, $element$jscomp$198$$, "*", "fixed", $opt_forceTransfer$jscomp$2$$);
  _.$JSCompiler_StaticMethods_sortInDomOrder_$$($JSCompiler_StaticMethods_FixedLayer$$module$src$service$fixed_layer_prototype$addElement$self$jscomp$inline_1643_JSCompiler_StaticMethods_addToFixedLayer$self$$);
  _.$JSCompiler_StaticMethods_observeHiddenMutations$$($JSCompiler_StaticMethods_FixedLayer$$module$src$service$fixed_layer_prototype$addElement$self$jscomp$inline_1643_JSCompiler_StaticMethods_addToFixedLayer$self$$);
  return $JSCompiler_StaticMethods_FixedLayer$$module$src$service$fixed_layer_prototype$addElement$self$jscomp$inline_1643_JSCompiler_StaticMethods_addToFixedLayer$self$$.update();
};
_.$JSCompiler_StaticMethods_removeFromFixedLayer$$ = function($JSCompiler_StaticMethods_removeFromFixedLayer$self$$, $element$jscomp$199$$) {
  $JSCompiler_StaticMethods_removeElement$$($JSCompiler_StaticMethods_removeFromFixedLayer$self$$.$G$, $element$jscomp$199$$);
};
_.$stringHash32$$module$src$string$$ = function($str$jscomp$6$$) {
  for (var $length$jscomp$16$$ = $str$jscomp$6$$.length, $hash$$ = 5381, $i$jscomp$7$$ = 0; $i$jscomp$7$$ < $length$jscomp$16$$; $i$jscomp$7$$++) {
    $hash$$ = 33 * $hash$$ ^ $str$jscomp$6$$.charCodeAt($i$jscomp$7$$);
  }
  return String($hash$$ >>> 0);
};
_.$deepMerge$$module$src$utils$object$$ = function($target$jscomp$57$$, $$jscomp$loop$386_source$jscomp$12$$, $depth$jscomp$1$$) {
  $depth$jscomp$1$$ = void 0 === $depth$jscomp$1$$ ? 10 : $depth$jscomp$1$$;
  var $seen$$ = [], $queue$$ = [];
  $queue$$.push({t:$target$jscomp$57$$, s:$$jscomp$loop$386_source$jscomp$12$$, d:0});
  for ($$jscomp$loop$386_source$jscomp$12$$ = {}; 0 < $queue$$.length;) {
    var $$jscomp$destructuring$var2$$ = $queue$$.shift();
    $$jscomp$loop$386_source$jscomp$12$$.t = $$jscomp$destructuring$var2$$.t;
    $$jscomp$loop$386_source$jscomp$12$$.s = $$jscomp$destructuring$var2$$.s;
    $$jscomp$loop$386_source$jscomp$12$$.d = $$jscomp$destructuring$var2$$.d;
    if ($seen$$.includes($$jscomp$loop$386_source$jscomp$12$$.s)) {
      throw Error("Source object has a circular reference.");
    }
    $seen$$.push($$jscomp$loop$386_source$jscomp$12$$.s);
    $$jscomp$loop$386_source$jscomp$12$$.t !== $$jscomp$loop$386_source$jscomp$12$$.s && ($$jscomp$loop$386_source$jscomp$12$$.d > $depth$jscomp$1$$ ? Object.assign($$jscomp$loop$386_source$jscomp$12$$.t, $$jscomp$loop$386_source$jscomp$12$$.s) : (Object.keys($$jscomp$loop$386_source$jscomp$12$$.s).forEach(function($target$jscomp$57$$) {
      return function($$jscomp$loop$386_source$jscomp$12$$) {
        var $depth$jscomp$1$$ = $target$jscomp$57$$.s[$$jscomp$loop$386_source$jscomp$12$$];
        if (_.$hasOwn$$module$src$utils$object$$($target$jscomp$57$$.t, $$jscomp$loop$386_source$jscomp$12$$)) {
          var $seen$$ = $target$jscomp$57$$.t[$$jscomp$loop$386_source$jscomp$12$$];
          if (_.$isObject$$module$src$types$$($depth$jscomp$1$$) && _.$isObject$$module$src$types$$($seen$$)) {
            $queue$$.push({t:$seen$$, s:$depth$jscomp$1$$, d:$target$jscomp$57$$.d + 1});
            return;
          }
        }
        $target$jscomp$57$$.t[$$jscomp$loop$386_source$jscomp$12$$] = $depth$jscomp$1$$;
      };
    }($$jscomp$loop$386_source$jscomp$12$$)), $$jscomp$loop$386_source$jscomp$12$$ = {s:$$jscomp$loop$386_source$jscomp$12$$.s, t:$$jscomp$loop$386_source$jscomp$12$$.t, d:$$jscomp$loop$386_source$jscomp$12$$.d}));
  }
  return $target$jscomp$57$$;
};
_.$removeChildren$$module$src$dom$$ = function($parent$jscomp$4$$) {
  for (; $parent$jscomp$4$$.firstChild;) {
    $parent$jscomp$4$$.removeChild($parent$jscomp$4$$.firstChild);
  }
};
_.$elementByTag$$module$src$dom$$ = function($element$jscomp$17_elements$$, $tagName$jscomp$7$$) {
  return ($element$jscomp$17_elements$$ = "function" === typeof $element$jscomp$17_elements$$.getElementsByTagName ? $element$jscomp$17_elements$$.getElementsByTagName($tagName$jscomp$7$$) : $element$jscomp$17_elements$$.querySelectorAll($tagName$jscomp$7$$)) && $element$jscomp$17_elements$$[0] || null;
};
_.$childElementByTag$$module$src$dom$$ = function($parent$jscomp$13$$, $tagName$jscomp$8$$) {
  return _.$scopedQuerySelector$$module$src$dom$$($parent$jscomp$13$$, "> " + $tagName$jscomp$8$$);
};
_.$getDataParamsFromAttributes$$module$src$dom$$ = function($dataset_element$jscomp$19$$, $computeParamNameFunc_opt_computeParamNameFunc$$, $opt_paramPattern_paramPattern$$) {
  $computeParamNameFunc_opt_computeParamNameFunc$$ = $computeParamNameFunc_opt_computeParamNameFunc$$ || function($dataset_element$jscomp$19$$) {
    return $dataset_element$jscomp$19$$;
  };
  $dataset_element$jscomp$19$$ = $dataset_element$jscomp$19$$.dataset;
  var $params$jscomp$2$$ = {};
  $opt_paramPattern_paramPattern$$ = $opt_paramPattern_paramPattern$$ ? $opt_paramPattern_paramPattern$$ : /^param(.+)/;
  for (var $key$jscomp$39$$ in $dataset_element$jscomp$19$$) {
    var $matches$$ = $key$jscomp$39$$.match($opt_paramPattern_paramPattern$$);
    $matches$$ && ($params$jscomp$2$$[$computeParamNameFunc_opt_computeParamNameFunc$$($matches$$[1][0].toLowerCase() + $matches$$[1].substr(1))] = $dataset_element$jscomp$19$$[$key$jscomp$39$$]);
  }
  return $params$jscomp$2$$;
};
$ancestorElements$$module$src$dom$$ = function($ancestor_child$jscomp$4$$, $predicate$$) {
  var $ancestors$$ = [];
  for ($ancestor_child$jscomp$4$$ = $ancestor_child$jscomp$4$$.parentElement; $ancestor_child$jscomp$4$$; $ancestor_child$jscomp$4$$ = $ancestor_child$jscomp$4$$.parentElement) {
    $predicate$$($ancestor_child$jscomp$4$$) && $ancestors$$.push($ancestor_child$jscomp$4$$);
  }
  return $ancestors$$;
};
_.$ancestorElementsByTag$$module$src$dom$$ = function($child$jscomp$5$$, $tagName$jscomp$10$$) {
  $tagName$jscomp$10$$ = $tagName$jscomp$10$$.toUpperCase();
  return $ancestorElements$$module$src$dom$$($child$jscomp$5$$, function($child$jscomp$5$$) {
    return $child$jscomp$5$$.tagName == $tagName$jscomp$10$$;
  });
};
_.$isJsonLdScriptTag$$module$src$dom$$ = function($element$jscomp$22$$) {
  return "SCRIPT" == $element$jscomp$22$$.tagName && "APPLICATION/LD+JSON" == $element$jscomp$22$$.getAttribute("type").toUpperCase();
};
_.$isRTL$$module$src$dom$$ = function($doc$jscomp$5$$) {
  return "rtl" == ($doc$jscomp$5$$.body.getAttribute("dir") || $doc$jscomp$5$$.documentElement.getAttribute("dir") || "ltr");
};
_.$resolveRelativeUrl$$module$src$url$$ = function($JSCompiler_temp$jscomp$528_relativeUrlString_relativeUrlString$jscomp$inline_1793$$, $baseUrl_baseUrl$jscomp$inline_1794$$) {
  "string" == typeof $baseUrl_baseUrl$jscomp$inline_1794$$ && ($baseUrl_baseUrl$jscomp$inline_1794$$ = _.$parseUrlDeprecated$$module$src$url$$($baseUrl_baseUrl$jscomp$inline_1794$$));
  if ("function" == typeof window.URL) {
    $JSCompiler_temp$jscomp$528_relativeUrlString_relativeUrlString$jscomp$inline_1793$$ = (new window.URL($JSCompiler_temp$jscomp$528_relativeUrlString_relativeUrlString$jscomp$inline_1793$$, $baseUrl_baseUrl$jscomp$inline_1794$$.href)).toString();
  } else {
    "string" == typeof $baseUrl_baseUrl$jscomp$inline_1794$$ && ($baseUrl_baseUrl$jscomp$inline_1794$$ = _.$parseUrlDeprecated$$module$src$url$$($baseUrl_baseUrl$jscomp$inline_1794$$));
    $JSCompiler_temp$jscomp$528_relativeUrlString_relativeUrlString$jscomp$inline_1793$$ = $JSCompiler_temp$jscomp$528_relativeUrlString_relativeUrlString$jscomp$inline_1793$$.replace(/\\/g, "/");
    var $relativeUrl$jscomp$inline_1795$$ = _.$parseUrlDeprecated$$module$src$url$$($JSCompiler_temp$jscomp$528_relativeUrlString_relativeUrlString$jscomp$inline_1793$$);
    $JSCompiler_temp$jscomp$528_relativeUrlString_relativeUrlString$jscomp$inline_1793$$ = _.$startsWith$$module$src$string$$($JSCompiler_temp$jscomp$528_relativeUrlString_relativeUrlString$jscomp$inline_1793$$.toLowerCase(), $relativeUrl$jscomp$inline_1795$$.protocol) ? $relativeUrl$jscomp$inline_1795$$.href : _.$startsWith$$module$src$string$$($JSCompiler_temp$jscomp$528_relativeUrlString_relativeUrlString$jscomp$inline_1793$$, "//") ? $baseUrl_baseUrl$jscomp$inline_1794$$.protocol + $JSCompiler_temp$jscomp$528_relativeUrlString_relativeUrlString$jscomp$inline_1793$$ : 
    _.$startsWith$$module$src$string$$($JSCompiler_temp$jscomp$528_relativeUrlString_relativeUrlString$jscomp$inline_1793$$, "/") ? $baseUrl_baseUrl$jscomp$inline_1794$$.origin + $JSCompiler_temp$jscomp$528_relativeUrlString_relativeUrlString$jscomp$inline_1793$$ : $baseUrl_baseUrl$jscomp$inline_1794$$.origin + $baseUrl_baseUrl$jscomp$inline_1794$$.pathname.replace(/\/[^/]*$/, "/") + $JSCompiler_temp$jscomp$528_relativeUrlString_relativeUrlString$jscomp$inline_1793$$;
  }
  return $JSCompiler_temp$jscomp$528_relativeUrlString_relativeUrlString$jscomp$inline_1793$$;
};
_.$utf8Decode$$module$src$utils$bytes$$ = function($asciiString_bytes$$) {
  if ("undefined" !== typeof window.TextDecoder) {
    return (new window.TextDecoder("utf-8")).decode($asciiString_bytes$$);
  }
  $asciiString_bytes$$ = _.$bytesToString$$module$src$utils$bytes$$(new window.Uint8Array($asciiString_bytes$$.buffer || $asciiString_bytes$$));
  return (0,window.decodeURIComponent)((0,window.escape)($asciiString_bytes$$));
};
_.$Services$$module$src$services$templatesFor$$ = function($window$jscomp$10$$) {
  return _.$getService$$module$src$service$$($window$jscomp$10$$, "templates");
};
_.$htmlRefs$$module$src$static_template$$ = function($elements$jscomp$1_root$jscomp$9$$) {
  $elements$jscomp$1_root$jscomp$9$$ = $elements$jscomp$1_root$jscomp$9$$.querySelectorAll("[ref]");
  for (var $refs$$ = _.$map$$module$src$utils$object$$(), $i$jscomp$47$$ = 0; $i$jscomp$47$$ < $elements$jscomp$1_root$jscomp$9$$.length; $i$jscomp$47$$++) {
    var $element$jscomp$58$$ = $elements$jscomp$1_root$jscomp$9$$[$i$jscomp$47$$], $ref$jscomp$2$$ = $element$jscomp$58$$.getAttribute("ref");
    $element$jscomp$58$$.removeAttribute("ref");
    $refs$$[$ref$jscomp$2$$] = $element$jscomp$58$$;
  }
  return $refs$$;
};
_.$translate$$module$src$style$$ = function($x$jscomp$76$$, $opt_y$jscomp$2$$) {
  "number" == typeof $x$jscomp$76$$ && ($x$jscomp$76$$ = _.$px$$module$src$style$$($x$jscomp$76$$));
  if (void 0 === $opt_y$jscomp$2$$) {
    return "translate(" + $x$jscomp$76$$ + ")";
  }
  "number" == typeof $opt_y$jscomp$2$$ && ($opt_y$jscomp$2$$ = _.$px$$module$src$style$$($opt_y$jscomp$2$$));
  return "translate(" + $x$jscomp$76$$ + ", " + $opt_y$jscomp$2$$ + ")";
};
_.$getConsentPolicyState$$module$src$consent$$ = function($element$jscomp$86$$, $policyId$jscomp$1$$) {
  return _.$Services$$module$src$services$consentPolicyServiceForDocOrNull$$($element$jscomp$86$$).then(function($element$jscomp$86$$) {
    return $element$jscomp$86$$ ? $element$jscomp$86$$.$K$($policyId$jscomp$1$$) : null;
  });
};
$getListenForSentinel$$module$src$iframe_helper$$ = function($JSCompiler_inline_result$jscomp$529_parentWin$jscomp$2$$, $sentinel$jscomp$1$$, $opt_create$jscomp$1$$) {
  var $listenSentinel_listeningFors$jscomp$inline_1799$$ = $JSCompiler_inline_result$jscomp$529_parentWin$jscomp$2$$.$listeningFors$;
  !$listenSentinel_listeningFors$jscomp$inline_1799$$ && $opt_create$jscomp$1$$ && ($listenSentinel_listeningFors$jscomp$inline_1799$$ = $JSCompiler_inline_result$jscomp$529_parentWin$jscomp$2$$.$listeningFors$ = Object.create(null));
  $JSCompiler_inline_result$jscomp$529_parentWin$jscomp$2$$ = $listenSentinel_listeningFors$jscomp$inline_1799$$ || null;
  if (!$JSCompiler_inline_result$jscomp$529_parentWin$jscomp$2$$) {
    return $JSCompiler_inline_result$jscomp$529_parentWin$jscomp$2$$;
  }
  $listenSentinel_listeningFors$jscomp$inline_1799$$ = $JSCompiler_inline_result$jscomp$529_parentWin$jscomp$2$$[$sentinel$jscomp$1$$];
  !$listenSentinel_listeningFors$jscomp$inline_1799$$ && $opt_create$jscomp$1$$ && ($listenSentinel_listeningFors$jscomp$inline_1799$$ = $JSCompiler_inline_result$jscomp$529_parentWin$jscomp$2$$[$sentinel$jscomp$1$$] = []);
  return $listenSentinel_listeningFors$jscomp$inline_1799$$ || null;
};
$getOrCreateListenForEvents$$module$src$iframe_helper$$ = function($listenSentinel$jscomp$1_parentWin$jscomp$3$$, $iframe$$, $i$jscomp$67_opt_is3P_sentinel$jscomp$2$$) {
  var $origin$jscomp$3$$ = _.$parseUrlDeprecated$$module$src$url$$($iframe$$.src).origin;
  $i$jscomp$67_opt_is3P_sentinel$jscomp$2$$ = $i$jscomp$67_opt_is3P_sentinel$jscomp$2$$ ? $iframe$$.getAttribute("data-amp-3p-sentinel") : "amp";
  $listenSentinel$jscomp$1_parentWin$jscomp$3$$ = $getListenForSentinel$$module$src$iframe_helper$$($listenSentinel$jscomp$1_parentWin$jscomp$3$$, $i$jscomp$67_opt_is3P_sentinel$jscomp$2$$, !0);
  for ($i$jscomp$67_opt_is3P_sentinel$jscomp$2$$ = 0; $i$jscomp$67_opt_is3P_sentinel$jscomp$2$$ < $listenSentinel$jscomp$1_parentWin$jscomp$3$$.length; $i$jscomp$67_opt_is3P_sentinel$jscomp$2$$++) {
    var $we$$ = $listenSentinel$jscomp$1_parentWin$jscomp$3$$[$i$jscomp$67_opt_is3P_sentinel$jscomp$2$$];
    if ($we$$.frame === $iframe$$) {
      var $windowEvents$$ = $we$$;
      break;
    }
  }
  $windowEvents$$ || ($windowEvents$$ = {frame:$iframe$$, origin:$origin$jscomp$3$$, events:Object.create(null)}, $listenSentinel$jscomp$1_parentWin$jscomp$3$$.push($windowEvents$$));
  return $windowEvents$$.events;
};
$dropListenSentinel$$module$src$iframe_helper$$ = function($listenSentinel$jscomp$3$$) {
  for (var $noopData$$ = _.$dict$$module$src$utils$object$$({sentinel:"unlisten"}), $i$jscomp$69$$ = $listenSentinel$jscomp$3$$.length - 1; 0 <= $i$jscomp$69$$; $i$jscomp$69$$--) {
    var $events$jscomp$1_windowEvents$jscomp$2$$ = $listenSentinel$jscomp$3$$[$i$jscomp$69$$];
    if (!$events$jscomp$1_windowEvents$jscomp$2$$.frame.contentWindow) {
      $listenSentinel$jscomp$3$$.splice($i$jscomp$69$$, 1);
      $events$jscomp$1_windowEvents$jscomp$2$$ = $events$jscomp$1_windowEvents$jscomp$2$$.events;
      for (var $name$jscomp$111$$ in $events$jscomp$1_windowEvents$jscomp$2$$) {
        $events$jscomp$1_windowEvents$jscomp$2$$[$name$jscomp$111$$].splice(0, window.Infinity).forEach(function($listenSentinel$jscomp$3$$) {
          $listenSentinel$jscomp$3$$($noopData$$);
        });
      }
    }
  }
};
$parseIfNeeded$$module$src$iframe_helper$$ = function($data$jscomp$49$$) {
  "string" == typeof $data$jscomp$49$$ && ("{" == $data$jscomp$49$$.charAt(0) ? $data$jscomp$49$$ = _.$tryParseJson$$module$src$json$$($data$jscomp$49$$, function($data$jscomp$49$$) {
    _.$dev$$module$src$log$$().$Log$$module$src$log_prototype$warn$("IFRAME-HELPER", "Postmessage could not be parsed. Is it in a valid JSON format?", $data$jscomp$49$$);
  }) || null : _.$isAmpMessage$$module$src$3p_frame_messaging$$($data$jscomp$49$$) ? $data$jscomp$49$$ = _.$deserializeMessage$$module$src$3p_frame_messaging$$($data$jscomp$49$$) : $data$jscomp$49$$ = null);
  return $data$jscomp$49$$;
};
$registerGlobalListenerIfNeeded$$module$src$iframe_helper$$ = function($parentWin$jscomp$5$$) {
  $parentWin$jscomp$5$$.$listeningFors$ || $parentWin$jscomp$5$$.addEventListener("message", function($event$jscomp$28$$) {
    if ($event$jscomp$28$$.data) {
      var $data$jscomp$46$$ = $parseIfNeeded$$module$src$iframe_helper$$($event$jscomp$28$$.data);
      if ($data$jscomp$46$$ && $data$jscomp$46$$.sentinel) {
        var $JSCompiler_inline_result$jscomp$530_listenForEvents_listeners_sentinel$jscomp$inline_1802$$ = $data$jscomp$46$$.sentinel;
        var $i$jscomp$70_origin$jscomp$inline_1803$$ = $event$jscomp$28$$.origin, $triggerWin$jscomp$inline_1804$$ = $event$jscomp$28$$.source, $listenSentinel$jscomp$inline_1805$$ = $getListenForSentinel$$module$src$iframe_helper$$($parentWin$jscomp$5$$, $JSCompiler_inline_result$jscomp$530_listenForEvents_listeners_sentinel$jscomp$inline_1802$$);
        if ($listenSentinel$jscomp$inline_1805$$) {
          for (var $windowEvents$jscomp$inline_1806$$, $i$jscomp$inline_1807$$ = 0; $i$jscomp$inline_1807$$ < $listenSentinel$jscomp$inline_1805$$.length; $i$jscomp$inline_1807$$++) {
            var $we$jscomp$inline_1808$$ = $listenSentinel$jscomp$inline_1805$$[$i$jscomp$inline_1807$$], $contentWindow$jscomp$inline_1809$$ = $we$jscomp$inline_1808$$.frame.contentWindow;
            if ($contentWindow$jscomp$inline_1809$$) {
              if ("amp" === $JSCompiler_inline_result$jscomp$530_listenForEvents_listeners_sentinel$jscomp$inline_1802$$) {
                if ($we$jscomp$inline_1808$$.origin === $i$jscomp$70_origin$jscomp$inline_1803$$ && $contentWindow$jscomp$inline_1809$$ == $triggerWin$jscomp$inline_1804$$) {
                  $windowEvents$jscomp$inline_1806$$ = $we$jscomp$inline_1808$$;
                  break;
                }
              } else {
                var $JSCompiler_temp$jscomp$5599_win$jscomp$inline_5874$$;
                if (!($JSCompiler_temp$jscomp$5599_win$jscomp$inline_5874$$ = $triggerWin$jscomp$inline_1804$$ == $contentWindow$jscomp$inline_1809$$)) {
                  b: {
                    for ($JSCompiler_temp$jscomp$5599_win$jscomp$inline_5874$$ = $triggerWin$jscomp$inline_1804$$; $JSCompiler_temp$jscomp$5599_win$jscomp$inline_5874$$ && $JSCompiler_temp$jscomp$5599_win$jscomp$inline_5874$$ != $JSCompiler_temp$jscomp$5599_win$jscomp$inline_5874$$.parent; $JSCompiler_temp$jscomp$5599_win$jscomp$inline_5874$$ = $JSCompiler_temp$jscomp$5599_win$jscomp$inline_5874$$.parent) {
                      if ($JSCompiler_temp$jscomp$5599_win$jscomp$inline_5874$$ == $contentWindow$jscomp$inline_1809$$) {
                        $JSCompiler_temp$jscomp$5599_win$jscomp$inline_5874$$ = !0;
                        break b;
                      }
                    }
                    $JSCompiler_temp$jscomp$5599_win$jscomp$inline_5874$$ = !1;
                  }
                }
                if ($JSCompiler_temp$jscomp$5599_win$jscomp$inline_5874$$) {
                  $windowEvents$jscomp$inline_1806$$ = $we$jscomp$inline_1808$$;
                  break;
                }
              }
            } else {
              (0,window.setTimeout)($dropListenSentinel$$module$src$iframe_helper$$, 0, $listenSentinel$jscomp$inline_1805$$);
            }
          }
          $JSCompiler_inline_result$jscomp$530_listenForEvents_listeners_sentinel$jscomp$inline_1802$$ = $windowEvents$jscomp$inline_1806$$ ? $windowEvents$jscomp$inline_1806$$.events : null;
        } else {
          $JSCompiler_inline_result$jscomp$530_listenForEvents_listeners_sentinel$jscomp$inline_1802$$ = $listenSentinel$jscomp$inline_1805$$;
        }
        if ($JSCompiler_inline_result$jscomp$530_listenForEvents_listeners_sentinel$jscomp$inline_1802$$ && ($JSCompiler_inline_result$jscomp$530_listenForEvents_listeners_sentinel$jscomp$inline_1802$$ = $JSCompiler_inline_result$jscomp$530_listenForEvents_listeners_sentinel$jscomp$inline_1802$$[$data$jscomp$46$$.type])) {
          for ($JSCompiler_inline_result$jscomp$530_listenForEvents_listeners_sentinel$jscomp$inline_1802$$ = $JSCompiler_inline_result$jscomp$530_listenForEvents_listeners_sentinel$jscomp$inline_1802$$.slice(), $i$jscomp$70_origin$jscomp$inline_1803$$ = 0; $i$jscomp$70_origin$jscomp$inline_1803$$ < $JSCompiler_inline_result$jscomp$530_listenForEvents_listeners_sentinel$jscomp$inline_1802$$.length; $i$jscomp$70_origin$jscomp$inline_1803$$++) {
            (0,$JSCompiler_inline_result$jscomp$530_listenForEvents_listeners_sentinel$jscomp$inline_1802$$[$i$jscomp$70_origin$jscomp$inline_1803$$])($data$jscomp$46$$, $event$jscomp$28$$.source, $event$jscomp$28$$.origin);
          }
        }
      }
    }
  });
};
_.$listenFor$$module$src$iframe_helper$$ = function($iframe$jscomp$1$$, $typeOfMessage$$, $callback$jscomp$66$$, $listenForEvents$jscomp$1_opt_is3P$jscomp$1$$, $opt_includingNestedWindows$$) {
  function $listener$jscomp$61$$($typeOfMessage$$, $listenForEvents$jscomp$1_opt_is3P$jscomp$1$$, $listener$jscomp$61$$) {
    if ($opt_includingNestedWindows$$ || $listenForEvents$jscomp$1_opt_is3P$jscomp$1$$ == $iframe$jscomp$1$$.contentWindow) {
      "unlisten" == $typeOfMessage$$.sentinel ? $unlisten$jscomp$4$$() : $callback$jscomp$66$$($typeOfMessage$$, $listenForEvents$jscomp$1_opt_is3P$jscomp$1$$, $listener$jscomp$61$$);
    }
  }
  var $parentWin$jscomp$6$$ = $iframe$jscomp$1$$.ownerDocument.defaultView;
  $registerGlobalListenerIfNeeded$$module$src$iframe_helper$$($parentWin$jscomp$6$$);
  $listenForEvents$jscomp$1_opt_is3P$jscomp$1$$ = $getOrCreateListenForEvents$$module$src$iframe_helper$$($parentWin$jscomp$6$$, $iframe$jscomp$1$$, $listenForEvents$jscomp$1_opt_is3P$jscomp$1$$);
  var $events$jscomp$2$$ = $listenForEvents$jscomp$1_opt_is3P$jscomp$1$$[$typeOfMessage$$] || ($listenForEvents$jscomp$1_opt_is3P$jscomp$1$$[$typeOfMessage$$] = []), $unlisten$jscomp$4$$;
  $events$jscomp$2$$.push($listener$jscomp$61$$);
  return $unlisten$jscomp$4$$ = function() {
    if ($listener$jscomp$61$$) {
      var $iframe$jscomp$1$$ = $events$jscomp$2$$.indexOf($listener$jscomp$61$$);
      -1 < $iframe$jscomp$1$$ && $events$jscomp$2$$.splice($iframe$jscomp$1$$, 1);
      $callback$jscomp$66$$ = $events$jscomp$2$$ = $listener$jscomp$61$$ = null;
    }
  };
};
_.$postMessageToWindows$$module$src$iframe_helper$$ = function($iframe$jscomp$4_payload$jscomp$4$$, $targets$jscomp$1$$, $type$jscomp$125$$, $i$jscomp$72_object$jscomp$3$$, $opt_is3P$jscomp$4_target$jscomp$79$$) {
  if ($iframe$jscomp$4_payload$jscomp$4$$.contentWindow) {
    for ($i$jscomp$72_object$jscomp$3$$.type = $type$jscomp$125$$, $i$jscomp$72_object$jscomp$3$$.sentinel = $opt_is3P$jscomp$4_target$jscomp$79$$ ? $iframe$jscomp$4_payload$jscomp$4$$.getAttribute("data-amp-3p-sentinel") : "amp", $iframe$jscomp$4_payload$jscomp$4$$ = $i$jscomp$72_object$jscomp$3$$, $opt_is3P$jscomp$4_target$jscomp$79$$ && ($iframe$jscomp$4_payload$jscomp$4$$ = "amp-" + JSON.stringify($i$jscomp$72_object$jscomp$3$$)), $i$jscomp$72_object$jscomp$3$$ = 0; $i$jscomp$72_object$jscomp$3$$ < 
    $targets$jscomp$1$$.length; $i$jscomp$72_object$jscomp$3$$++) {
      $opt_is3P$jscomp$4_target$jscomp$79$$ = $targets$jscomp$1$$[$i$jscomp$72_object$jscomp$3$$], $opt_is3P$jscomp$4_target$jscomp$79$$.$win$.postMessage($iframe$jscomp$4_payload$jscomp$4$$, $opt_is3P$jscomp$4_target$jscomp$79$$.origin);
    }
  }
};
_.$SubscriptionApi$$module$src$iframe_helper$$ = function($iframe$jscomp$6$$, $type$jscomp$126$$, $is3p$$, $requestCallback$$) {
  var $$jscomp$this$jscomp$31$$ = this;
  this.$iframe_$ = $iframe$jscomp$6$$;
  this.$F$ = $is3p$$;
  this.$D$ = [];
  this.$unlisten_$ = _.$listenFor$$module$src$iframe_helper$$(this.$iframe_$, $type$jscomp$126$$, function($iframe$jscomp$6$$, $type$jscomp$126$$, $is3p$$) {
    $$jscomp$this$jscomp$31$$.$D$.some(function($iframe$jscomp$6$$) {
      return $iframe$jscomp$6$$.$win$ == $type$jscomp$126$$;
    }) || $$jscomp$this$jscomp$31$$.$D$.push({$win$:$type$jscomp$126$$, origin:$is3p$$});
    $requestCallback$$($iframe$jscomp$6$$, $type$jscomp$126$$, $is3p$$);
  }, this.$F$, this.$F$);
};
_.$JSCompiler_StaticMethods_SubscriptionApi$$module$src$iframe_helper_prototype$send$$ = function($JSCompiler_StaticMethods_SubscriptionApi$$module$src$iframe_helper_prototype$send$self$$, $type$jscomp$127$$, $data$jscomp$51$$) {
  _.$remove$$module$src$utils$array$$($JSCompiler_StaticMethods_SubscriptionApi$$module$src$iframe_helper_prototype$send$self$$.$D$, function($JSCompiler_StaticMethods_SubscriptionApi$$module$src$iframe_helper_prototype$send$self$$) {
    return !$JSCompiler_StaticMethods_SubscriptionApi$$module$src$iframe_helper_prototype$send$self$$.$win$.parent;
  });
  _.$postMessageToWindows$$module$src$iframe_helper$$($JSCompiler_StaticMethods_SubscriptionApi$$module$src$iframe_helper_prototype$send$self$$.$iframe_$, $JSCompiler_StaticMethods_SubscriptionApi$$module$src$iframe_helper_prototype$send$self$$.$D$, $type$jscomp$127$$, $data$jscomp$51$$, $JSCompiler_StaticMethods_SubscriptionApi$$module$src$iframe_helper_prototype$send$self$$.$F$);
};
_.$looksLikeTrackingIframe$$module$src$iframe_helper$$ = function($element$jscomp$91$$) {
  var $box$$ = $element$jscomp$91$$.$getLayoutBox$();
  return 10 < $box$$.width || 10 < $box$$.height ? !1 : !_.$closestBySelector$$module$src$dom$$($element$jscomp$91$$, ".i-amphtml-overlay");
};
_.$layoutRectsRelativePos$$module$src$layout_rect$$ = function($r1$jscomp$2$$, $r2$jscomp$1$$) {
  return $r1$jscomp$2$$.top < $r2$jscomp$1$$.top ? "top" : $r1$jscomp$2$$.bottom > $r2$jscomp$1$$.bottom ? "bottom" : "inside";
};
$layoutRectEquals$$module$src$layout_rect$$ = function($r1$jscomp$3$$, $r2$jscomp$2$$) {
  return $r1$jscomp$3$$ && $r2$jscomp$2$$ ? $r1$jscomp$3$$.left == $r2$jscomp$2$$.left && $r1$jscomp$3$$.top == $r2$jscomp$2$$.top && $r1$jscomp$3$$.width == $r2$jscomp$2$$.width && $r1$jscomp$3$$.height == $r2$jscomp$2$$.height : !1;
};
_.$IntersectionObserverPolyfill$$module$src$intersection_observer_polyfill$$ = function($callback$jscomp$67_threshold$$, $i$jscomp$76_opt_option$$) {
  this.$J$ = $callback$jscomp$67_threshold$$;
  ($callback$jscomp$67_threshold$$ = $i$jscomp$76_opt_option$$ && $i$jscomp$76_opt_option$$.threshold) ? $callback$jscomp$67_threshold$$ = _.$isArray$$module$src$types$$($callback$jscomp$67_threshold$$) ? $callback$jscomp$67_threshold$$ : [$callback$jscomp$67_threshold$$] : $callback$jscomp$67_threshold$$ = [0];
  for ($i$jscomp$76_opt_option$$ = 0; $i$jscomp$76_opt_option$$ < $callback$jscomp$67_threshold$$.length; $i$jscomp$76_opt_option$$++) {
  }
  this.$O$ = $callback$jscomp$67_threshold$$.sort();
  this.$I$ = null;
  this.$K$ = void 0;
  this.$D$ = [];
  this.$G$ = this.$F$ = null;
};
_.$JSCompiler_StaticMethods_IntersectionObserverPolyfill$$module$src$intersection_observer_polyfill_prototype$tick$$ = function($JSCompiler_StaticMethods_IntersectionObserverPolyfill$$module$src$intersection_observer_polyfill_prototype$tick$self$$, $hostViewport$jscomp$1$$) {
  if ($opt_iframe$$) {
    $hostViewport$jscomp$1$$ = _.$moveLayoutRect$$module$src$layout_rect$$($hostViewport$jscomp$1$$, -$opt_iframe$$.left, -$opt_iframe$$.top);
    var $opt_iframe$$ = _.$moveLayoutRect$$module$src$layout_rect$$($opt_iframe$$, -$opt_iframe$$.left, -$opt_iframe$$.top);
  }
  $JSCompiler_StaticMethods_IntersectionObserverPolyfill$$module$src$intersection_observer_polyfill_prototype$tick$self$$.$I$ = $hostViewport$jscomp$1$$;
  $JSCompiler_StaticMethods_IntersectionObserverPolyfill$$module$src$intersection_observer_polyfill_prototype$tick$self$$.$K$ = $opt_iframe$$;
  for (var $changes$$ = [], $i$jscomp$79$$ = 0; $i$jscomp$79$$ < $JSCompiler_StaticMethods_IntersectionObserverPolyfill$$module$src$intersection_observer_polyfill_prototype$tick$self$$.$D$.length; $i$jscomp$79$$++) {
    var $change$jscomp$2$$ = $JSCompiler_StaticMethods_getValidIntersectionChangeEntry_$$($JSCompiler_StaticMethods_IntersectionObserverPolyfill$$module$src$intersection_observer_polyfill_prototype$tick$self$$, $JSCompiler_StaticMethods_IntersectionObserverPolyfill$$module$src$intersection_observer_polyfill_prototype$tick$self$$.$D$[$i$jscomp$79$$], $hostViewport$jscomp$1$$, $opt_iframe$$);
    $change$jscomp$2$$ && $changes$$.push($change$jscomp$2$$);
  }
  $changes$$.length && $JSCompiler_StaticMethods_IntersectionObserverPolyfill$$module$src$intersection_observer_polyfill_prototype$tick$self$$.$J$($changes$$);
};
$JSCompiler_StaticMethods_getValidIntersectionChangeEntry_$$ = function($JSCompiler_StaticMethods_getValidIntersectionChangeEntry_$self_JSCompiler_inline_result$jscomp$531_newThresholdSlot_sortedThreshold$jscomp$inline_1811$$, $changeEntry_state$jscomp$6$$, $hostViewport$jscomp$2$$, $opt_iframe$jscomp$1$$) {
  var $element$jscomp$96$$ = $changeEntry_state$jscomp$6$$.element, $elementRect$$ = $element$jscomp$96$$.$getLayoutBox$(), $intersectionRect_owner$jscomp$1_ownerRect$$ = $element$jscomp$96$$.$getOwner$();
  $intersectionRect_owner$jscomp$1_ownerRect$$ = $intersectionRect_owner$jscomp$1_ownerRect$$ && $intersectionRect_owner$jscomp$1_ownerRect$$.$getLayoutBox$();
  $intersectionRect_owner$jscomp$1_ownerRect$$ = _.$rectIntersection$$module$src$layout_rect$$($elementRect$$, $intersectionRect_owner$jscomp$1_ownerRect$$, $hostViewport$jscomp$2$$, $opt_iframe$jscomp$1$$) || _.$layoutRectLtwh$$module$src$layout_rect$$(0, 0, 0, 0);
  var $ratio$jscomp$1$$ = _.$intersectionRatio$$module$src$intersection_observer_polyfill$$($intersectionRect_owner$jscomp$1_ownerRect$$, $elementRect$$);
  $JSCompiler_StaticMethods_getValidIntersectionChangeEntry_$self_JSCompiler_inline_result$jscomp$531_newThresholdSlot_sortedThreshold$jscomp$inline_1811$$ = $JSCompiler_StaticMethods_getValidIntersectionChangeEntry_$self_JSCompiler_inline_result$jscomp$531_newThresholdSlot_sortedThreshold$jscomp$inline_1811$$.$O$;
  var $startIdx$jscomp$inline_1813$$ = 0, $endIdx$jscomp$inline_1814$$ = $JSCompiler_StaticMethods_getValidIntersectionChangeEntry_$self_JSCompiler_inline_result$jscomp$531_newThresholdSlot_sortedThreshold$jscomp$inline_1811$$.length;
  if (0 == $ratio$jscomp$1$$) {
    $JSCompiler_StaticMethods_getValidIntersectionChangeEntry_$self_JSCompiler_inline_result$jscomp$531_newThresholdSlot_sortedThreshold$jscomp$inline_1811$$ = 0;
  } else {
    for (var $mid$jscomp$inline_1815$$ = ($startIdx$jscomp$inline_1813$$ + $endIdx$jscomp$inline_1814$$) / 2 | 0; $startIdx$jscomp$inline_1813$$ < $mid$jscomp$inline_1815$$;) {
      $ratio$jscomp$1$$ < $JSCompiler_StaticMethods_getValidIntersectionChangeEntry_$self_JSCompiler_inline_result$jscomp$531_newThresholdSlot_sortedThreshold$jscomp$inline_1811$$[$mid$jscomp$inline_1815$$] ? $endIdx$jscomp$inline_1814$$ = $mid$jscomp$inline_1815$$ : $startIdx$jscomp$inline_1813$$ = $mid$jscomp$inline_1815$$, $mid$jscomp$inline_1815$$ = ($startIdx$jscomp$inline_1813$$ + $endIdx$jscomp$inline_1814$$) / 2 | 0;
    }
    $JSCompiler_StaticMethods_getValidIntersectionChangeEntry_$self_JSCompiler_inline_result$jscomp$531_newThresholdSlot_sortedThreshold$jscomp$inline_1811$$ = $endIdx$jscomp$inline_1814$$;
  }
  if ($JSCompiler_StaticMethods_getValidIntersectionChangeEntry_$self_JSCompiler_inline_result$jscomp$531_newThresholdSlot_sortedThreshold$jscomp$inline_1811$$ == $changeEntry_state$jscomp$6$$.$currentThresholdSlot$) {
    return null;
  }
  $changeEntry_state$jscomp$6$$.$currentThresholdSlot$ = $JSCompiler_StaticMethods_getValidIntersectionChangeEntry_$self_JSCompiler_inline_result$jscomp$531_newThresholdSlot_sortedThreshold$jscomp$inline_1811$$;
  $changeEntry_state$jscomp$6$$ = _.$calculateChangeEntry$$module$src$intersection_observer_polyfill$$($elementRect$$, $opt_iframe$jscomp$1$$ ? null : $hostViewport$jscomp$2$$, $intersectionRect_owner$jscomp$1_ownerRect$$, $ratio$jscomp$1$$);
  $changeEntry_state$jscomp$6$$.target = $element$jscomp$96$$;
  return $changeEntry_state$jscomp$6$$;
};
$JSCompiler_StaticMethods_disconnectMutationObserver_$$ = function($JSCompiler_StaticMethods_disconnectMutationObserver_$self$$) {
  $JSCompiler_StaticMethods_disconnectMutationObserver_$self$$.$F$ && $JSCompiler_StaticMethods_disconnectMutationObserver_$self$$.$F$.disconnect();
  $JSCompiler_StaticMethods_disconnectMutationObserver_$self$$.$F$ = null;
  $JSCompiler_StaticMethods_disconnectMutationObserver_$self$$.$G$ && $JSCompiler_StaticMethods_disconnectMutationObserver_$self$$.$G$.cancel();
  $JSCompiler_StaticMethods_disconnectMutationObserver_$self$$.$G$ = null;
};
_.$IntersectionObserverApi$$module$src$intersection_observer_polyfill$$ = function($baseElement$$, $iframe$jscomp$8$$) {
  var $$jscomp$this$jscomp$32$$ = this;
  this.$F$ = $baseElement$$;
  this.$intersectionObserver_$ = null;
  this.$G$ = this.$I$ = !1;
  this.$D$ = null;
  this.$viewport_$ = $baseElement$$.$getViewport$();
  this.$J$ = new _.$SubscriptionApi$$module$src$iframe_helper$$($iframe$jscomp$8$$, "send-intersections", !1, function() {
    $JSCompiler_StaticMethods_startSendingIntersection_$$($$jscomp$this$jscomp$32$$);
  });
  this.$intersectionObserver_$ = new _.$IntersectionObserverPolyfill$$module$src$intersection_observer_polyfill$$(function($baseElement$$) {
    for (var $iframe$jscomp$8$$ = 0; $iframe$jscomp$8$$ < $baseElement$$.length; $iframe$jscomp$8$$++) {
      delete $baseElement$$[$iframe$jscomp$8$$].target;
    }
    _.$JSCompiler_StaticMethods_SubscriptionApi$$module$src$iframe_helper_prototype$send$$($$jscomp$this$jscomp$32$$.$J$, "intersection", _.$dict$$module$src$utils$object$$({changes:$baseElement$$}));
  }, {threshold:_.$DEFAULT_THRESHOLD$$module$src$intersection_observer_polyfill$$});
  _.$JSCompiler_StaticMethods_IntersectionObserverPolyfill$$module$src$intersection_observer_polyfill_prototype$tick$$(this.$intersectionObserver_$, _.$JSCompiler_StaticMethods_getRect$$(this.$viewport_$));
  this.$fire$ = function() {
    $$jscomp$this$jscomp$32$$.$I$ && $$jscomp$this$jscomp$32$$.$G$ && _.$JSCompiler_StaticMethods_IntersectionObserverPolyfill$$module$src$intersection_observer_polyfill_prototype$tick$$($$jscomp$this$jscomp$32$$.$intersectionObserver_$, _.$JSCompiler_StaticMethods_getRect$$($$jscomp$this$jscomp$32$$.$viewport_$));
  };
};
$JSCompiler_StaticMethods_startSendingIntersection_$$ = function($JSCompiler_StaticMethods_startSendingIntersection_$self$$) {
  $JSCompiler_StaticMethods_startSendingIntersection_$self$$.$I$ = !0;
  $JSCompiler_StaticMethods_startSendingIntersection_$self$$.$intersectionObserver_$.observe($JSCompiler_StaticMethods_startSendingIntersection_$self$$.$F$.element);
  _.$JSCompiler_StaticMethods_getVsync$$($JSCompiler_StaticMethods_startSendingIntersection_$self$$.$F$).measure(function() {
    $JSCompiler_StaticMethods_startSendingIntersection_$self$$.$G$ = $JSCompiler_StaticMethods_startSendingIntersection_$self$$.$F$.$isInViewport$();
    $JSCompiler_StaticMethods_startSendingIntersection_$self$$.$fire$();
  });
  var $unlistenViewportScroll$$ = _.$JSCompiler_StaticMethods_Viewport$$module$src$service$viewport$viewport_impl_prototype$onScroll$$($JSCompiler_StaticMethods_startSendingIntersection_$self$$.$viewport_$, $JSCompiler_StaticMethods_startSendingIntersection_$self$$.$fire$), $unlistenViewportChange$$ = _.$JSCompiler_StaticMethods_onChanged$$($JSCompiler_StaticMethods_startSendingIntersection_$self$$.$viewport_$, $JSCompiler_StaticMethods_startSendingIntersection_$self$$.$fire$);
  $JSCompiler_StaticMethods_startSendingIntersection_$self$$.$D$ = function() {
    $unlistenViewportScroll$$();
    $unlistenViewportChange$$();
  };
};
_.$batchFetchJsonFor$$module$src$batched_json$$ = function($ampdoc$jscomp$87$$, $element$jscomp$202$$, $opt_expr$$, $opt_urlReplacement$$, $opt_refresh$$) {
  $opt_expr$$ = void 0 === $opt_expr$$ ? "." : $opt_expr$$;
  $opt_urlReplacement$$ = void 0 === $opt_urlReplacement$$ ? 0 : $opt_urlReplacement$$;
  $opt_refresh$$ = void 0 === $opt_refresh$$ ? !1 : $opt_refresh$$;
  $element$jscomp$202$$.getAttribute("src");
  var $xhr$jscomp$6$$ = _.$getService$$module$src$service$$($ampdoc$jscomp$87$$.$win$, "batched-xhr");
  return _.$requestForBatchFetch$$module$src$batched_json$$($element$jscomp$202$$, $opt_urlReplacement$$, $opt_refresh$$).then(function($ampdoc$jscomp$87$$) {
    return _.$JSCompiler_StaticMethods_fetchJson$$($xhr$jscomp$6$$, $ampdoc$jscomp$87$$.xhrUrl, $ampdoc$jscomp$87$$.fetchOpt);
  }).then(function($ampdoc$jscomp$87$$) {
    return $ampdoc$jscomp$87$$.json();
  }).then(function($ampdoc$jscomp$87$$) {
    if (null == $ampdoc$jscomp$87$$) {
      throw Error("Response is undefined.");
    }
    return _.$getValueForExpr$$module$src$json$$($ampdoc$jscomp$87$$, $opt_expr$$ || ".");
  });
};
_.$requestForBatchFetch$$module$src$batched_json$$ = function($element$jscomp$203$$, $replacement$jscomp$4$$, $refresh$$) {
  var $url$jscomp$98$$ = $element$jscomp$203$$.getAttribute("src"), $urlReplacements$jscomp$1$$ = _.$Services$$module$src$services$urlReplacementsForDoc$$($element$jscomp$203$$);
  return (1 <= $replacement$jscomp$4$$ ? _.$JSCompiler_StaticMethods_expandUrlAsync$$($urlReplacements$jscomp$1$$, $url$jscomp$98$$) : window.Promise.resolve($url$jscomp$98$$)).then(function($url$jscomp$98$$) {
    if (1 == $replacement$jscomp$4$$) {
      var $xhrUrl$$ = $JSCompiler_StaticMethods_collectUnwhitelistedVarsSync$$($urlReplacements$jscomp$1$$, $element$jscomp$203$$);
      if (0 < $xhrUrl$$.length) {
        throw _.$user$$module$src$log$$().$createError$("URL variable substitutions in CORS fetches from dynamic URLs (e.g. via amp-bind) require opt-in. " + ('Please add data-amp-replace="' + $xhrUrl$$.join(" ") + '" to the ') + ("<" + $element$jscomp$203$$.tagName + "> element. See https://bit.ly/amp-var-subs."));
      }
    }
    $xhrUrl$$ = {};
    $element$jscomp$203$$.hasAttribute("credentials") ? $xhrUrl$$.credentials = $element$jscomp$203$$.getAttribute("credentials") : $xhrUrl$$.requireAmpResponseSourceOrigin = !1;
    $refresh$$ && ($xhrUrl$$.cache = "reload");
    return {xhrUrl:$url$jscomp$98$$, fetchOpt:$xhrUrl$$};
  });
};
_.$domFingerprintPlain$$module$src$utils$dom_fingerprint$$ = function($element$jscomp$204$$) {
  for (var $ids$$ = [], $level$jscomp$9$$ = 0; $element$jscomp$204$$ && 1 == $element$jscomp$204$$.nodeType && 25 > $level$jscomp$9$$;) {
    var $id$jscomp$41$$ = "";
    $element$jscomp$204$$.id && ($id$jscomp$41$$ = "/" + $element$jscomp$204$$.id);
    for (var $nodeName$jscomp$inline_1818$$ = $element$jscomp$204$$.nodeName, $i$jscomp$inline_1819$$ = 0, $count$jscomp$inline_1820$$ = 0, $sibling$jscomp$inline_1821$$ = $element$jscomp$204$$.previousElementSibling; $sibling$jscomp$inline_1821$$ && 25 > $count$jscomp$inline_1820$$ && 100 > $i$jscomp$inline_1819$$;) {
      $sibling$jscomp$inline_1821$$.nodeName == $nodeName$jscomp$inline_1818$$ && $count$jscomp$inline_1820$$++, $i$jscomp$inline_1819$$++, $sibling$jscomp$inline_1821$$ = $sibling$jscomp$inline_1821$$.previousElementSibling;
    }
    $ids$$.push($element$jscomp$204$$.nodeName.toLowerCase() + $id$jscomp$41$$ + (25 > $count$jscomp$inline_1820$$ && 100 > $i$jscomp$inline_1819$$ ? "." + $count$jscomp$inline_1820$$ : ""));
    $level$jscomp$9$$++;
    $element$jscomp$204$$ = $element$jscomp$204$$.parentElement;
  }
  return $ids$$.join();
};
_.$getContextMetadata$$module$src$iframe_attributes$$ = function($adSrc_parentWindow$$, $element$jscomp$207$$, $sentinel$jscomp$4$$, $attributes$jscomp$7$$) {
  var $startTime$jscomp$10$$ = Date.now(), $locationHref_width$jscomp$18$$ = $element$jscomp$207$$.getAttribute("width"), $docInfo$jscomp$2_height$jscomp$17$$ = $element$jscomp$207$$.getAttribute("height");
  $attributes$jscomp$7$$ = $attributes$jscomp$7$$ ? $attributes$jscomp$7$$ : {};
  $attributes$jscomp$7$$.width = _.$getLengthNumeral$$module$src$layout$$($locationHref_width$jscomp$18$$);
  $attributes$jscomp$7$$.height = _.$getLengthNumeral$$module$src$layout$$($docInfo$jscomp$2_height$jscomp$17$$);
  $element$jscomp$207$$.getAttribute("title") && ($attributes$jscomp$7$$.title = $element$jscomp$207$$.getAttribute("title"));
  $locationHref_width$jscomp$18$$ = $adSrc_parentWindow$$.location.href;
  "about:srcdoc" == $locationHref_width$jscomp$18$$ && ($locationHref_width$jscomp$18$$ = $adSrc_parentWindow$$.parent.location.href);
  $docInfo$jscomp$2_height$jscomp$17$$ = _.$Services$$module$src$services$documentInfoForDoc$$($element$jscomp$207$$);
  var $viewer$jscomp$27$$ = _.$Services$$module$src$services$viewerForDoc$$($element$jscomp$207$$), $referrer$jscomp$3$$ = $viewer$jscomp$27$$.$W$, $layoutRect$$ = $element$jscomp$207$$.$getPageLayoutBox$();
  $attributes$jscomp$7$$._context = _.$dict$$module$src$utils$object$$({ampcontextVersion:"1901181729101", ampcontextFilepath:_.$urls$$module$src$config$$.thirdParty + "/1901181729101/ampcontext-v0.js", sourceUrl:$docInfo$jscomp$2_height$jscomp$17$$.sourceUrl, referrer:$referrer$jscomp$3$$, canonicalUrl:$docInfo$jscomp$2_height$jscomp$17$$.canonicalUrl, pageViewId:$docInfo$jscomp$2_height$jscomp$17$$.pageViewId, location:{href:$locationHref_width$jscomp$18$$}, startTime:$startTime$jscomp$10$$, 
  tagName:$element$jscomp$207$$.tagName, mode:_.$getModeObject$$module$src$mode_object$$(), canary:_.$isCanary$$module$src$experiments$$($adSrc_parentWindow$$), hidden:!_.$JSCompiler_StaticMethods_Viewer$$module$src$service$viewer_impl_prototype$isVisible$$($viewer$jscomp$27$$), initialLayoutRect:$layoutRect$$ ? {left:$layoutRect$$.left, top:$layoutRect$$.top, width:$layoutRect$$.width, height:$layoutRect$$.height} : null, initialIntersection:$element$jscomp$207$$.$I$(), domFingerprint:_.$stringHash32$$module$src$string$$(_.$domFingerprintPlain$$module$src$utils$dom_fingerprint$$($element$jscomp$207$$)), 
  experimentToggles:_.$experimentToggles$$module$src$experiments$$($adSrc_parentWindow$$), sentinel:$sentinel$jscomp$4$$});
  ($adSrc_parentWindow$$ = $element$jscomp$207$$.getAttribute("src")) && ($attributes$jscomp$7$$.src = $adSrc_parentWindow$$);
  return $attributes$jscomp$7$$;
};
$getFrameAttributes$$module$src$3p_frame$$ = function($parentWindow$jscomp$1$$, $element$jscomp$208$$, $opt_type$jscomp$9_type$jscomp$134$$, $opt_context$jscomp$5$$) {
  $opt_type$jscomp$9_type$jscomp$134$$ = $opt_type$jscomp$9_type$jscomp$134$$ || $element$jscomp$208$$.getAttribute("type");
  var $sentinel$jscomp$5$$ = _.$generateSentinel$$module$src$3p_frame$$($parentWindow$jscomp$1$$), $attributes$jscomp$8$$ = {}, $attributes$jscomp$inline_1824$$ = $attributes$jscomp$8$$, $dataset$jscomp$inline_1825$$ = $element$jscomp$208$$.dataset, $json$jscomp$inline_1827_name$jscomp$inline_1826_obj$jscomp$inline_1828$$;
  for ($json$jscomp$inline_1827_name$jscomp$inline_1826_obj$jscomp$inline_1828$$ in $dataset$jscomp$inline_1825$$) {
    _.$startsWith$$module$src$string$$($json$jscomp$inline_1827_name$jscomp$inline_1826_obj$jscomp$inline_1828$$, "vars") || ($attributes$jscomp$inline_1824$$[$json$jscomp$inline_1827_name$jscomp$inline_1826_obj$jscomp$inline_1828$$] = $dataset$jscomp$inline_1825$$[$json$jscomp$inline_1827_name$jscomp$inline_1826_obj$jscomp$inline_1828$$]);
  }
  if ($json$jscomp$inline_1827_name$jscomp$inline_1826_obj$jscomp$inline_1828$$ = $element$jscomp$208$$.getAttribute("json")) {
    $json$jscomp$inline_1827_name$jscomp$inline_1826_obj$jscomp$inline_1828$$ = _.$tryParseJson$$module$src$json$$($json$jscomp$inline_1827_name$jscomp$inline_1826_obj$jscomp$inline_1828$$);
    if (void 0 === $json$jscomp$inline_1827_name$jscomp$inline_1826_obj$jscomp$inline_1828$$) {
      throw _.$user$$module$src$log$$().$createError$("Error parsing JSON in json attribute in element %s", $element$jscomp$208$$);
    }
    for (var $key$jscomp$inline_1829$$ in $json$jscomp$inline_1827_name$jscomp$inline_1826_obj$jscomp$inline_1828$$) {
      $attributes$jscomp$inline_1824$$[$key$jscomp$inline_1829$$] = $json$jscomp$inline_1827_name$jscomp$inline_1826_obj$jscomp$inline_1828$$[$key$jscomp$inline_1829$$];
    }
  }
  $attributes$jscomp$8$$ = _.$getContextMetadata$$module$src$iframe_attributes$$($parentWindow$jscomp$1$$, $element$jscomp$208$$, $sentinel$jscomp$5$$, $attributes$jscomp$8$$);
  $attributes$jscomp$8$$.type = $opt_type$jscomp$9_type$jscomp$134$$;
  Object.assign($attributes$jscomp$8$$._context, $opt_context$jscomp$5$$);
  return $attributes$jscomp$8$$;
};
_.$getIframe$$module$src$3p_frame$$ = function($parentWindow$jscomp$2$$, $attributes$jscomp$9_parentElement$jscomp$6$$, $opt_type$jscomp$10$$, $iframe$jscomp$14_opt_context$jscomp$6$$, $$jscomp$destructuring$var145_allowFullscreen_excludeFromSandbox_opt_options$jscomp$83$$) {
  $$jscomp$destructuring$var145_allowFullscreen_excludeFromSandbox_opt_options$jscomp$83$$ = void 0 === $$jscomp$destructuring$var145_allowFullscreen_excludeFromSandbox_opt_options$jscomp$83$$ ? {} : $$jscomp$destructuring$var145_allowFullscreen_excludeFromSandbox_opt_options$jscomp$83$$;
  var $baseUrl$jscomp$2_disallowCustom$$ = $$jscomp$destructuring$var145_allowFullscreen_excludeFromSandbox_opt_options$jscomp$83$$.$disallowCustom$;
  $$jscomp$destructuring$var145_allowFullscreen_excludeFromSandbox_opt_options$jscomp$83$$ = $$jscomp$destructuring$var145_allowFullscreen_excludeFromSandbox_opt_options$jscomp$83$$.$allowFullscreen$;
  $attributes$jscomp$9_parentElement$jscomp$6$$ = $getFrameAttributes$$module$src$3p_frame$$($parentWindow$jscomp$2$$, $attributes$jscomp$9_parentElement$jscomp$6$$, $opt_type$jscomp$10$$, $iframe$jscomp$14_opt_context$jscomp$6$$);
  $iframe$jscomp$14_opt_context$jscomp$6$$ = $parentWindow$jscomp$2$$.document.createElement("iframe");
  $count$$module$src$3p_frame$$[$attributes$jscomp$9_parentElement$jscomp$6$$.type] || ($count$$module$src$3p_frame$$[$attributes$jscomp$9_parentElement$jscomp$6$$.type] = 0);
  $count$$module$src$3p_frame$$[$attributes$jscomp$9_parentElement$jscomp$6$$.type] += 1;
  $baseUrl$jscomp$2_disallowCustom$$ = $getBootstrapBaseUrl$$module$src$3p_frame$$($parentWindow$jscomp$2$$, $baseUrl$jscomp$2_disallowCustom$$);
  var $host$jscomp$2_name$jscomp$157$$ = _.$parseUrlDeprecated$$module$src$url$$($baseUrl$jscomp$2_disallowCustom$$).hostname;
  $host$jscomp$2_name$jscomp$157$$ = JSON.stringify(_.$dict$$module$src$utils$object$$({host:$host$jscomp$2_name$jscomp$157$$, type:$attributes$jscomp$9_parentElement$jscomp$6$$.type, count:$count$$module$src$3p_frame$$[$attributes$jscomp$9_parentElement$jscomp$6$$.type], attributes:$attributes$jscomp$9_parentElement$jscomp$6$$}));
  $iframe$jscomp$14_opt_context$jscomp$6$$.src = $baseUrl$jscomp$2_disallowCustom$$;
  $iframe$jscomp$14_opt_context$jscomp$6$$.$$a$ = _.$parseUrlDeprecated$$module$src$url$$($baseUrl$jscomp$2_disallowCustom$$);
  $iframe$jscomp$14_opt_context$jscomp$6$$.name = $host$jscomp$2_name$jscomp$157$$;
  $attributes$jscomp$9_parentElement$jscomp$6$$.width && ($iframe$jscomp$14_opt_context$jscomp$6$$.width = $attributes$jscomp$9_parentElement$jscomp$6$$.width);
  $attributes$jscomp$9_parentElement$jscomp$6$$.height && ($iframe$jscomp$14_opt_context$jscomp$6$$.height = $attributes$jscomp$9_parentElement$jscomp$6$$.height);
  $attributes$jscomp$9_parentElement$jscomp$6$$.title && ($iframe$jscomp$14_opt_context$jscomp$6$$.title = $attributes$jscomp$9_parentElement$jscomp$6$$.title);
  $$jscomp$destructuring$var145_allowFullscreen_excludeFromSandbox_opt_options$jscomp$83$$ && $iframe$jscomp$14_opt_context$jscomp$6$$.setAttribute("allowfullscreen", "true");
  $iframe$jscomp$14_opt_context$jscomp$6$$.setAttribute("scrolling", "no");
  _.$setStyle$$module$src$style$$($iframe$jscomp$14_opt_context$jscomp$6$$, "border", "none");
  $iframe$jscomp$14_opt_context$jscomp$6$$.onload = function() {
    this.readyState = "complete";
  };
  _.$isExperimentOn$$module$src$experiments$$($parentWindow$jscomp$2$$, "no-sync-xhr-in-ads") && $iframe$jscomp$14_opt_context$jscomp$6$$.setAttribute("allow", "sync-xhr 'none';");
  $$jscomp$destructuring$var145_allowFullscreen_excludeFromSandbox_opt_options$jscomp$83$$ = ["facebook"];
  _.$isExperimentOn$$module$src$experiments$$($parentWindow$jscomp$2$$, "sandbox-ads") && !$$jscomp$destructuring$var145_allowFullscreen_excludeFromSandbox_opt_options$jscomp$83$$.includes($opt_type$jscomp$10$$) && _.$applySandbox$$module$src$3p_frame$$($iframe$jscomp$14_opt_context$jscomp$6$$);
  $iframe$jscomp$14_opt_context$jscomp$6$$.setAttribute("data-amp-3p-sentinel", $attributes$jscomp$9_parentElement$jscomp$6$$._context.sentinel);
  return $iframe$jscomp$14_opt_context$jscomp$6$$;
};
_.$preloadBootstrap$$module$src$3p_frame$$ = function($url$jscomp$99_win$jscomp$215$$, $preconnect$jscomp$1$$, $opt_disallowCustom$$) {
  $url$jscomp$99_win$jscomp$215$$ = $getBootstrapBaseUrl$$module$src$3p_frame$$($url$jscomp$99_win$jscomp$215$$, $opt_disallowCustom$$);
  $preconnect$jscomp$1$$.$preload$($url$jscomp$99_win$jscomp$215$$, "document");
  $preconnect$jscomp$1$$.$preload$(_.$urls$$module$src$config$$.thirdParty + "/1901181729101/f.js", "script");
};
$getBootstrapBaseUrl$$module$src$3p_frame$$ = function($parentWindow$jscomp$3$$, $JSCompiler_temp$jscomp$533_meta$jscomp$inline_1832_opt_disallowCustom$jscomp$1_url$jscomp$inline_1833$$) {
  $JSCompiler_temp$jscomp$533_meta$jscomp$inline_1832_opt_disallowCustom$jscomp$1_url$jscomp$inline_1833$$ ? $JSCompiler_temp$jscomp$533_meta$jscomp$inline_1832_opt_disallowCustom$jscomp$1_url$jscomp$inline_1833$$ = null : ($JSCompiler_temp$jscomp$533_meta$jscomp$inline_1832_opt_disallowCustom$jscomp$1_url$jscomp$inline_1833$$ = $parentWindow$jscomp$3$$.document.querySelector('meta[name="amp-3p-iframe-src"]')) ? ($JSCompiler_temp$jscomp$533_meta$jscomp$inline_1832_opt_disallowCustom$jscomp$1_url$jscomp$inline_1833$$ = 
  $JSCompiler_temp$jscomp$533_meta$jscomp$inline_1832_opt_disallowCustom$jscomp$1_url$jscomp$inline_1833$$.getAttribute("content"), _.$parseUrlDeprecated$$module$src$url$$($JSCompiler_temp$jscomp$533_meta$jscomp$inline_1832_opt_disallowCustom$jscomp$1_url$jscomp$inline_1833$$), $JSCompiler_temp$jscomp$533_meta$jscomp$inline_1832_opt_disallowCustom$jscomp$1_url$jscomp$inline_1833$$ += "?1901181729101") : $JSCompiler_temp$jscomp$533_meta$jscomp$inline_1832_opt_disallowCustom$jscomp$1_url$jscomp$inline_1833$$ = 
  null;
  return $JSCompiler_temp$jscomp$533_meta$jscomp$inline_1832_opt_disallowCustom$jscomp$1_url$jscomp$inline_1833$$ || _.$getDefaultBootstrapBaseUrl$$module$src$3p_frame$$($parentWindow$jscomp$3$$);
};
_.$getDefaultBootstrapBaseUrl$$module$src$3p_frame$$ = function($parentWindow$jscomp$4$$, $opt_srcFileBasename_srcFileBasename$$) {
  $opt_srcFileBasename_srcFileBasename$$ = $opt_srcFileBasename_srcFileBasename$$ || "frame";
  $parentWindow$jscomp$4$$.$defaultBootstrapSubDomain$ = $parentWindow$jscomp$4$$.$defaultBootstrapSubDomain$ || "d-" + $getRandom$$module$src$3p_frame$$($parentWindow$jscomp$4$$);
  return "https://" + $parentWindow$jscomp$4$$.$defaultBootstrapSubDomain$ + ("." + _.$urls$$module$src$config$$.thirdPartyFrameHost + "/1901181729101/") + ($opt_srcFileBasename_srcFileBasename$$ + ".html");
};
$getRandom$$module$src$3p_frame$$ = function($rand_win$jscomp$219$$) {
  if ($rand_win$jscomp$219$$.crypto && $rand_win$jscomp$219$$.crypto.getRandomValues) {
    var $uint32array$$ = new window.Uint32Array(2);
    $rand_win$jscomp$219$$.crypto.getRandomValues($uint32array$$);
    $rand_win$jscomp$219$$ = String($uint32array$$[0]) + $uint32array$$[1];
  } else {
    $rand_win$jscomp$219$$ = String($rand_win$jscomp$219$$.Math.random()).substr(2) + "0";
  }
  return $rand_win$jscomp$219$$;
};
_.$applySandbox$$module$src$3p_frame$$ = function($iframe$jscomp$15$$) {
  if ($iframe$jscomp$15$$.sandbox && $iframe$jscomp$15$$.sandbox.supports) {
    for (var $requiredFlags$$ = ["allow-top-navigation-by-user-activation", "allow-popups-to-escape-sandbox"], $i$jscomp$131$$ = 0; $i$jscomp$131$$ < $requiredFlags$$.length; $i$jscomp$131$$++) {
      var $flag$jscomp$1$$ = $requiredFlags$$[$i$jscomp$131$$];
      if (!$iframe$jscomp$15$$.sandbox.supports($flag$jscomp$1$$)) {
        _.$dev$$module$src$log$$().$Log$$module$src$log_prototype$info$("3p-frame", "Iframe doesn't support %s", $flag$jscomp$1$$);
        return;
      }
    }
    $iframe$jscomp$15$$.sandbox = $requiredFlags$$.join(" ") + " allow-forms allow-modals allow-pointer-lock allow-popups allow-same-origin allow-scripts";
  }
};
_.$generateSentinel$$module$src$3p_frame$$ = function($parentWindow$jscomp$7$$) {
  for (var $windowDepth$$ = 0, $win$jscomp$220$$ = $parentWindow$jscomp$7$$; $win$jscomp$220$$ && $win$jscomp$220$$ != $win$jscomp$220$$.parent; $win$jscomp$220$$ = $win$jscomp$220$$.parent) {
    $windowDepth$$++;
  }
  return String($windowDepth$$) + "-" + $getRandom$$module$src$3p_frame$$($parentWindow$jscomp$7$$);
};
_.$once$$module$src$utils$function$$ = function($fn$jscomp$18$$) {
  var $evaluated$$ = !1, $retValue$$ = null, $callback$jscomp$98$$ = $fn$jscomp$18$$;
  return function($fn$jscomp$18$$) {
    for (var $args$jscomp$15$$ = [], $$jscomp$restIndex$jscomp$2$$ = 0; $$jscomp$restIndex$jscomp$2$$ < arguments.length; ++$$jscomp$restIndex$jscomp$2$$) {
      $args$jscomp$15$$[$$jscomp$restIndex$jscomp$2$$] = arguments[$$jscomp$restIndex$jscomp$2$$];
    }
    $evaluated$$ || ($retValue$$ = $callback$jscomp$98$$.apply(window.self, $args$jscomp$15$$), $evaluated$$ = !0, $callback$jscomp$98$$ = null);
    return $retValue$$;
  };
};
$isAutoplaySupportedImpl$$module$src$utils$video$$ = function($win$jscomp$221$$, $isLiteViewer$$) {
  if ($isLiteViewer$$) {
    return window.Promise.resolve(!1);
  }
  var $detectionElement$$ = $win$jscomp$221$$.document.createElement("video");
  $detectionElement$$.setAttribute("muted", "");
  $detectionElement$$.setAttribute("playsinline", "");
  $detectionElement$$.setAttribute("webkit-playsinline", "");
  $detectionElement$$.setAttribute("height", "0");
  $detectionElement$$.setAttribute("width", "0");
  $detectionElement$$.muted = !0;
  $detectionElement$$.$eb$ = !0;
  $detectionElement$$.$gb$ = !0;
  _.$setStyles$$module$src$style$$($detectionElement$$, {position:"fixed", top:"0", width:"0", height:"0", opacity:"0"});
  (new window.Promise(function($win$jscomp$221$$) {
    return $win$jscomp$221$$($detectionElement$$.play());
  })).catch(function() {
  });
  return window.Promise.resolve(!$detectionElement$$.paused);
};
_.$VideoUtils$$module$src$utils$video$isAutoplaySupported$$ = function($win$jscomp$222$$, $isLiteViewer$jscomp$1$$) {
  $isAutoplaySupported$$module$src$utils$video$$ || ($isAutoplaySupported$$module$src$utils$video$$ = _.$once$$module$src$utils$function$$($isAutoplaySupportedImpl$$module$src$utils$video$$));
  return $isAutoplaySupported$$module$src$utils$video$$($win$jscomp$222$$, $isLiteViewer$jscomp$1$$);
};
_.$getInternalVideoElementFor$$module$src$utils$video$$ = function($element$jscomp$211$$) {
  return $element$jscomp$211$$.querySelector("video, iframe");
};
$PositionObserverWorker$$module$src$service$position_observer$position_observer_worker$$ = function($ampdoc$jscomp$88$$, $element$jscomp$212$$, $fidelity$$, $handler$jscomp$31$$) {
  this.element = $element$jscomp$212$$;
  this.$F$ = $handler$jscomp$31$$;
  this.$G$ = $fidelity$$;
  this.$turn$ = 0 == $fidelity$$ ? Math.floor(4 * Math.random()) : 0;
  this.$D$ = null;
  this.$viewport_$ = _.$Services$$module$src$services$viewportForDoc$$($ampdoc$jscomp$88$$);
};
$PositionObserver$$module$src$service$position_observer$position_observer_impl$$ = function($ampdoc$jscomp$89$$) {
  var $$jscomp$this$jscomp$184$$ = this;
  this.$ampdoc_$ = $ampdoc$jscomp$89$$;
  this.$J$ = $ampdoc$jscomp$89$$.$win$;
  this.$D$ = [];
  this.$vsync_$ = _.$Services$$module$src$services$vsyncFor$$(this.$J$);
  this.$viewport_$ = _.$Services$$module$src$services$viewportForDoc$$($ampdoc$jscomp$89$$);
  this.$unlisteners_$ = [];
  this.$G$ = this.$F$ = this.$I$ = !1;
  this.$K$ = _.$debounce$$module$src$utils$rate_limit$$(this.$J$, function() {
    $$jscomp$this$jscomp$184$$.$I$ = !1;
  }, 500);
};
$JSCompiler_StaticMethods_startCallback_$$ = function($JSCompiler_StaticMethods_startCallback_$self$$) {
  $JSCompiler_StaticMethods_startCallback_$self$$.$G$ = !0;
  $JSCompiler_StaticMethods_startCallback_$self$$.$unlisteners_$.push(_.$JSCompiler_StaticMethods_Viewport$$module$src$service$viewport$viewport_impl_prototype$onScroll$$($JSCompiler_StaticMethods_startCallback_$self$$.$viewport_$, function() {
    $JSCompiler_StaticMethods_startCallback_$self$$.$K$();
    $JSCompiler_StaticMethods_startCallback_$self$$.$I$ = !0;
    $JSCompiler_StaticMethods_startCallback_$self$$.$F$ || $JSCompiler_StaticMethods_schedulePass_$$($JSCompiler_StaticMethods_startCallback_$self$$);
  }));
  $JSCompiler_StaticMethods_startCallback_$self$$.$unlisteners_$.push(_.$JSCompiler_StaticMethods_Viewport$$module$src$service$viewport$viewport_impl_prototype$onResize$$($JSCompiler_StaticMethods_startCallback_$self$$.$viewport_$, function() {
    $JSCompiler_StaticMethods_updateAllEntries$$($JSCompiler_StaticMethods_startCallback_$self$$, !0);
  }));
};
$JSCompiler_StaticMethods_stopCallback_$$ = function($JSCompiler_StaticMethods_stopCallback_$self$$) {
  for ($JSCompiler_StaticMethods_stopCallback_$self$$.$G$ = !1; $JSCompiler_StaticMethods_stopCallback_$self$$.$unlisteners_$.length;) {
    $JSCompiler_StaticMethods_stopCallback_$self$$.$unlisteners_$.pop()();
  }
};
$JSCompiler_StaticMethods_updateAllEntries$$ = function($JSCompiler_StaticMethods_updateAllEntries$self$$, $opt_force$jscomp$6$$) {
  for (var $i$jscomp$134$$ = 0; $i$jscomp$134$$ < $JSCompiler_StaticMethods_updateAllEntries$self$$.$D$.length; $i$jscomp$134$$++) {
    $JSCompiler_StaticMethods_updateAllEntries$self$$.$D$[$i$jscomp$134$$].update($opt_force$jscomp$6$$);
  }
};
$JSCompiler_StaticMethods_schedulePass_$$ = function($JSCompiler_StaticMethods_schedulePass_$self$$) {
  $JSCompiler_StaticMethods_updateAllEntries$$($JSCompiler_StaticMethods_schedulePass_$self$$);
  $JSCompiler_StaticMethods_schedulePass_$self$$.$F$ = !0;
  $JSCompiler_StaticMethods_schedulePass_$self$$.$I$ ? $JSCompiler_StaticMethods_schedulePass_$self$$.$vsync_$.measure(function() {
    $JSCompiler_StaticMethods_schedulePass_$$($JSCompiler_StaticMethods_schedulePass_$self$$);
  }) : $JSCompiler_StaticMethods_schedulePass_$self$$.$F$ = !1;
};
_.$installPositionObserverServiceForDoc$$module$src$service$position_observer$position_observer_impl$$ = function($ampdoc$jscomp$90$$) {
  _.$registerServiceBuilderForDoc$$module$src$service$$($ampdoc$jscomp$90$$, "position-observer", function() {
    return new $PositionObserver$$module$src$service$position_observer$position_observer_impl$$($ampdoc$jscomp$90$$);
  });
};
$installAutoplayStylesForDoc$$module$src$service$video$install_autoplay_styles$$ = function($ampdoc$jscomp$91$$) {
  _.$installStylesForDoc$$module$src$style_installer$$($ampdoc$jscomp$91$$, "i-amphtml-video-mask{display:block;z-index:1}.amp-video-eq{display:none}.i-amphtml-video-component:not(amp-video) .amp-video-eq,amp-story .amp-video-eq,amp-video[controls] .amp-video-eq{display:-webkit-box;display:-ms-flexbox;display:flex}[noaudio] .amp-video-eq{display:none!important}.amp-video-eq{pointer-events:none!important;-webkit-box-align:end;-ms-flex-align:end;align-items:flex-end;bottom:7px;height:12px;opacity:0.8;overflow:hidden;position:absolute;right:7px;width:20px;z-index:1}.amp-video-eq .amp-video-eq-col{-webkit-box-flex:1;-ms-flex:1;flex:1;height:100%;margin-right:1px;position:relative}.amp-video-eq .amp-video-eq-col div{-webkit-animation-name:amp-video-eq-animation;animation-name:amp-video-eq-animation;-webkit-animation-timing-function:linear;animation-timing-function:linear;-webkit-animation-iteration-count:infinite;animation-iteration-count:infinite;-webkit-animation-direction:alternate;animation-direction:alternate;background-color:#fafafa;height:100%;position:absolute;width:100%;will-change:transform;-webkit-animation-play-state:paused;animation-play-state:paused}.amp-video-eq[unpausable] .amp-video-eq-col div{-webkit-animation-name:none;animation-name:none}.amp-video-eq[unpausable].amp-video-eq-play .amp-video-eq-col div{-webkit-animation-name:amp-video-eq-animation;animation-name:amp-video-eq-animation}.amp-video-eq.amp-video-eq-play .amp-video-eq-col div{-webkit-animation-play-state:running;animation-play-state:running}.amp-video-eq-1-1{-webkit-animation-duration:0.3s;animation-duration:0.3s}.amp-video-eq-1-1,.amp-video-eq-1-2{-webkit-transform:translateY(60%);transform:translateY(60%)}.amp-video-eq-1-2{-webkit-animation-duration:0.45s;animation-duration:0.45s}.amp-video-eq-2-1{-webkit-animation-duration:0.5s;animation-duration:0.5s}.amp-video-eq-2-1,.amp-video-eq-2-2{-webkit-transform:translateY(30%);transform:translateY(30%)}.amp-video-eq-2-2{-webkit-animation-duration:0.4s;animation-duration:0.4s}.amp-video-eq-3-1{-webkit-animation-duration:0.3s;animation-duration:0.3s}.amp-video-eq-3-1,.amp-video-eq-3-2{-webkit-transform:translateY(70%);transform:translateY(70%)}.amp-video-eq-3-2{-webkit-animation-duration:0.35s;animation-duration:0.35s}.amp-video-eq-4-1{-webkit-animation-duration:0.4s;animation-duration:0.4s}.amp-video-eq-4-1,.amp-video-eq-4-2{-webkit-transform:translateY(50%);transform:translateY(50%)}.amp-video-eq-4-2{-webkit-animation-duration:0.25s;animation-duration:0.25s}@-webkit-keyframes amp-video-eq-animation{0%{-webkit-transform:translateY(100%);transform:translateY(100%)}to{-webkit-transform:translateY(0);transform:translateY(0)}}@keyframes amp-video-eq-animation{0%{-webkit-transform:translateY(100%);transform:translateY(100%)}to{-webkit-transform:translateY(0);transform:translateY(0)}}\n/*# sourceURL=/css/video-autoplay.css*/", 
  null, !1, "amp-video-autoplay");
};
$renderOrClone$$module$src$service$video$autoplay$$ = function($renderFn$$) {
  var $seedFn$$ = _.$once$$module$src$utils$function$$($renderFn$$);
  return function($renderFn$$, $doc$jscomp$53$$) {
    return $seedFn$$($renderFn$$, $doc$jscomp$53$$).cloneNode(!0);
  };
};
$renderInteractionOverlay$$module$src$service$video$autoplay$$ = function($unusedWin$jscomp$2$$, $elOrDoc$$) {
  return _.$htmlFor$$module$src$static_template$$($elOrDoc$$)($_template$$module$src$service$video$autoplay$$);
};
$renderIcon$$module$src$service$video$autoplay$$ = function($win$jscomp$224$$, $elOrDoc$jscomp$1_icon$$) {
  $elOrDoc$jscomp$1_icon$$ = _.$htmlFor$$module$src$static_template$$($elOrDoc$jscomp$1_icon$$)($_template2$$module$src$service$video$autoplay$$);
  for (var $firstCol$$ = $elOrDoc$jscomp$1_icon$$.firstElementChild, $i$jscomp$135$$ = 0; 4 > $i$jscomp$135$$; $i$jscomp$135$$++) {
    for (var $col$jscomp$2$$ = $firstCol$$.cloneNode(!0), $fillers$$ = $col$jscomp$2$$.children, $j$jscomp$2$$ = 0; $j$jscomp$2$$ < $fillers$$.length; $j$jscomp$2$$++) {
      $fillers$$[$j$jscomp$2$$].classList.add("amp-video-eq-" + ($i$jscomp$135$$ + 1) + "-" + ($j$jscomp$2$$ + 1));
    }
    $elOrDoc$jscomp$1_icon$$.appendChild($col$jscomp$2$$);
  }
  _.$removeElement$$module$src$dom$$($firstCol$$);
  _.$JSCompiler_StaticMethods_isIos$$(_.$Services$$module$src$services$platformFor$$($win$jscomp$224$$)) && $elOrDoc$jscomp$1_icon$$.setAttribute("unpausable", "");
  return $elOrDoc$jscomp$1_icon$$;
};
$Autoplay$$module$src$service$video$autoplay$$ = function($ampdoc$jscomp$92$$) {
  var $$jscomp$this$jscomp$188$$ = this;
  this.$ampdoc_$ = $ampdoc$jscomp$92$$;
  this.$F$ = _.$once$$module$src$utils$function$$(function() {
    _.$installPositionObserverServiceForDoc$$module$src$service$position_observer$position_observer_impl$$($$jscomp$this$jscomp$188$$.$ampdoc_$);
    return _.$getServiceForDoc$$module$src$service$$($$jscomp$this$jscomp$188$$.$ampdoc_$, "position-observer");
  });
  this.$D$ = [];
  this.$G$ = _.$once$$module$src$utils$function$$(function() {
    var $ampdoc$jscomp$92$$ = $$jscomp$this$jscomp$188$$.$ampdoc_$.$win$, $isLite$$ = _.$getMode$$module$src$mode$$($ampdoc$jscomp$92$$).$lite$;
    return _.$VideoUtils$$module$src$utils$video$isAutoplaySupported$$($ampdoc$jscomp$92$$, $isLite$$);
  });
  $installAutoplayStylesForDoc$$module$src$service$video$install_autoplay_styles$$(this.$ampdoc_$);
};
$AutoplayEntry$$module$src$service$video$autoplay$$ = function($ampdoc$jscomp$93$$, $positionObserver$$, $video$jscomp$2$$) {
  this.video = $video$jscomp$2$$;
  this.$ampdoc_$ = $ampdoc$jscomp$93$$;
  this.$element_$ = $video$jscomp$2$$.element;
  this.$isVisible_$ = !1;
  this.$D$ = [$JSCompiler_StaticMethods_observeOn_$$(this, $positionObserver$$), $JSCompiler_StaticMethods_listenToVisibilityChange_$$(this)];
  $video$jscomp$2$$.$mute$();
  $video$jscomp$2$$.$hideControls$();
  $JSCompiler_StaticMethods_attachArtifacts_$$(this);
};
$JSCompiler_StaticMethods_observeOn_$$ = function($JSCompiler_StaticMethods_observeOn_$self$$, $positionObserver$jscomp$1$$) {
  return $positionObserver$jscomp$1$$.observe($JSCompiler_StaticMethods_observeOn_$self$$.$element_$, 1, function() {
    $JSCompiler_StaticMethods_triggerByVisibility_$$($JSCompiler_StaticMethods_observeOn_$self$$);
  });
};
$JSCompiler_StaticMethods_listenToVisibilityChange_$$ = function($JSCompiler_StaticMethods_listenToVisibilityChange_$self$$) {
  return _.$listen$$module$src$event_helper$$($JSCompiler_StaticMethods_listenToVisibilityChange_$self$$.$element_$, _.$VideoEvents$$module$src$video_interface$$.$VISIBILITY$, function($data$jscomp$72_e$jscomp$96_enforcedByEvent$$) {
    ($data$jscomp$72_e$jscomp$96_enforcedByEvent$$ = ($data$jscomp$72_e$jscomp$96_enforcedByEvent$$ = $data$jscomp$72_e$jscomp$96_enforcedByEvent$$.data) && $data$jscomp$72_e$jscomp$96_enforcedByEvent$$.visible) && !$JSCompiler_StaticMethods_listenToVisibilityChange_$self$$.$isVisible_$ ? ($JSCompiler_StaticMethods_listenToVisibilityChange_$self$$.$isVisible_$ = $data$jscomp$72_e$jscomp$96_enforcedByEvent$$, $JSCompiler_StaticMethods_AutoplayEntry$$module$src$service$video$autoplay_prototype$trigger_$$($JSCompiler_StaticMethods_listenToVisibilityChange_$self$$, 
    $data$jscomp$72_e$jscomp$96_enforcedByEvent$$)) : $JSCompiler_StaticMethods_triggerByVisibility_$$($JSCompiler_StaticMethods_listenToVisibilityChange_$self$$);
  });
};
$JSCompiler_StaticMethods_triggerByVisibility_$$ = function($JSCompiler_StaticMethods_triggerByVisibility_$self$$) {
  var $isVisible_ratio$jscomp$4$$ = $JSCompiler_StaticMethods_triggerByVisibility_$self$$.$element_$.$I$().intersectionRatio;
  $isVisible_ratio$jscomp$4$$ = 0.5 <= (_.$isFiniteNumber$$module$src$types$$($isVisible_ratio$jscomp$4$$) ? $isVisible_ratio$jscomp$4$$ : 0);
  $JSCompiler_StaticMethods_triggerByVisibility_$self$$.$isVisible_$ != $isVisible_ratio$jscomp$4$$ && ($JSCompiler_StaticMethods_triggerByVisibility_$self$$.$isVisible_$ = $isVisible_ratio$jscomp$4$$, $JSCompiler_StaticMethods_AutoplayEntry$$module$src$service$video$autoplay_prototype$trigger_$$($JSCompiler_StaticMethods_triggerByVisibility_$self$$, $isVisible_ratio$jscomp$4$$));
};
$JSCompiler_StaticMethods_AutoplayEntry$$module$src$service$video$autoplay_prototype$trigger_$$ = function($JSCompiler_StaticMethods_AutoplayEntry$$module$src$service$video$autoplay_prototype$trigger_$self$$, $isPlaying$$) {
  $JSCompiler_StaticMethods_AutoplayEntry$$module$src$service$video$autoplay_prototype$trigger_$self$$.$element_$.$D$($isPlaying$$ ? "amp:autoplay" : "amp:autopause");
};
$JSCompiler_StaticMethods_attachArtifacts_$$ = function($JSCompiler_StaticMethods_attachArtifacts_$self$$) {
  var $video$jscomp$4$$ = $JSCompiler_StaticMethods_attachArtifacts_$self$$.video, $signals$$ = $video$jscomp$4$$.signals();
  if (null == $signals$$.get("user-interacted")) {
    var $win$jscomp$226$$ = $JSCompiler_StaticMethods_attachArtifacts_$self$$.$ampdoc_$.$win$, $icon$jscomp$1$$ = $renderOrCloneIcon$$module$src$service$video$autoplay$$($win$jscomp$226$$, $JSCompiler_StaticMethods_attachArtifacts_$self$$.$element_$);
    $video$jscomp$4$$.$mutateElement$(function() {
      $JSCompiler_StaticMethods_attachArtifacts_$self$$.$element_$.appendChild($icon$jscomp$1$$);
    });
    var $element$jscomp$217$$ = $video$jscomp$4$$.element, $playOrPauseIconAnim$$ = $JSCompiler_StaticMethods_attachArtifacts_$self$$.$F$.bind($JSCompiler_StaticMethods_attachArtifacts_$self$$, $icon$jscomp$1$$), $unlisteners$jscomp$1$$ = [_.$listen$$module$src$event_helper$$($element$jscomp$217$$, _.$VideoEvents$$module$src$video_interface$$.$PLAYING$, function() {
      return $playOrPauseIconAnim$$(!0);
    }), _.$listen$$module$src$event_helper$$($element$jscomp$217$$, _.$VideoEvents$$module$src$video_interface$$.$PAUSE$, function() {
      return $playOrPauseIconAnim$$(!1);
    })];
    $signals$$.whenSignal("user-interacted").then(function() {
      $unlisteners$jscomp$1$$.forEach(function($JSCompiler_StaticMethods_attachArtifacts_$self$$) {
        return $JSCompiler_StaticMethods_attachArtifacts_$self$$();
      });
      $JSCompiler_StaticMethods_onInteraction_$$($JSCompiler_StaticMethods_attachArtifacts_$self$$);
    });
    if ($JSCompiler_StaticMethods_attachArtifacts_$self$$.video.$isInteractive$()) {
      var $overlay$$ = $renderOrCloneInteractionOverlay$$module$src$service$video$autoplay$$($win$jscomp$226$$, $JSCompiler_StaticMethods_attachArtifacts_$self$$.$element_$);
      _.$listenOnce$$module$src$event_helper$$($overlay$$, "click", function() {
        return _.$JSCompiler_StaticMethods_signal$$($signals$$, "user-interacted");
      });
      $video$jscomp$4$$.$mutateElement$(function() {
        $JSCompiler_StaticMethods_attachArtifacts_$self$$.$element_$.appendChild($overlay$$);
      });
    }
  }
};
$JSCompiler_StaticMethods_onInteraction_$$ = function($JSCompiler_StaticMethods_onInteraction_$self$$) {
  var $mask$jscomp$5$$ = $JSCompiler_StaticMethods_onInteraction_$self$$.$element_$.querySelector("i-amphtml-video-mask");
  $JSCompiler_StaticMethods_disableTriggerByVisibility_$$($JSCompiler_StaticMethods_onInteraction_$self$$);
  $mask$jscomp$5$$ && _.$removeElement$$module$src$dom$$($mask$jscomp$5$$);
  $JSCompiler_StaticMethods_onInteraction_$self$$.video.$isInteractive$() && $JSCompiler_StaticMethods_onInteraction_$self$$.video.$showControls$();
  $JSCompiler_StaticMethods_onInteraction_$self$$.video.$unmute$();
};
$JSCompiler_StaticMethods_disableTriggerByVisibility_$$ = function($JSCompiler_StaticMethods_disableTriggerByVisibility_$self$$) {
  $JSCompiler_StaticMethods_disableTriggerByVisibility_$self$$.$D$ && ($JSCompiler_StaticMethods_disableTriggerByVisibility_$self$$.$D$.forEach(function($JSCompiler_StaticMethods_disableTriggerByVisibility_$self$$) {
    return $JSCompiler_StaticMethods_disableTriggerByVisibility_$self$$();
  }), $JSCompiler_StaticMethods_disableTriggerByVisibility_$self$$.$D$ = null);
};
_.$VideoServiceSync$$module$src$service$video_service_sync_impl$$ = function($ampdoc$jscomp$94$$) {
  var $$jscomp$this$jscomp$193$$ = this, $win$jscomp$227$$ = $ampdoc$jscomp$94$$.$win$;
  this.$ampdoc_$ = $ampdoc$jscomp$94$$;
  this.$D$ = $VideoServiceSync$$module$src$service$video_service_sync_impl$videoServiceFor$$($win$jscomp$227$$, $ampdoc$jscomp$94$$);
  this.$F$ = _.$once$$module$src$utils$function$$(function() {
    return new $Autoplay$$module$src$service$video$autoplay$$($$jscomp$this$jscomp$193$$.$ampdoc_$);
  });
};
$VideoServiceSync$$module$src$service$video_service_sync_impl$videoServiceFor$$ = function($win$jscomp$229$$, $ampdoc$jscomp$95$$) {
  return _.$JSCompiler_StaticMethods_installExtensionForDoc$$(_.$Services$$module$src$services$extensionsFor$$($win$jscomp$229$$), $ampdoc$jscomp$95$$, "amp-video-service").then(function() {
    return _.$getElementServiceForDoc$$module$src$element_service$$($ampdoc$jscomp$95$$.$getHeadNode$(), "video-service", "amp-video-service");
  });
};
$JSCompiler_StaticMethods_maybeInstallAutoplay_$$ = function($JSCompiler_StaticMethods_maybeInstallAutoplay_$self$$, $video$jscomp$6$$) {
  $video$jscomp$6$$.element.hasAttribute("autoplay") && ($JSCompiler_StaticMethods_maybeInstallAutoplay_$self$$.$F$().register($video$jscomp$6$$), $video$jscomp$6$$.signals().whenSignal("autoplay-delegated").then(function() {
    var $JSCompiler_StaticMethods_Autoplay$$module$src$service$video$autoplay_prototype$delegate$self$jscomp$inline_1858_JSCompiler_inline_result$jscomp$5600_entry$jscomp$inline_1860$$ = $JSCompiler_StaticMethods_maybeInstallAutoplay_$self$$.$F$();
    a: {
      for (var $i$jscomp$inline_5878$$ = 0; $i$jscomp$inline_5878$$ < $JSCompiler_StaticMethods_Autoplay$$module$src$service$video$autoplay_prototype$delegate$self$jscomp$inline_1858_JSCompiler_inline_result$jscomp$5600_entry$jscomp$inline_1860$$.$D$.length; $i$jscomp$inline_5878$$++) {
        var $entry$jscomp$inline_5879$$ = $JSCompiler_StaticMethods_Autoplay$$module$src$service$video$autoplay_prototype$delegate$self$jscomp$inline_1858_JSCompiler_inline_result$jscomp$5600_entry$jscomp$inline_1860$$.$D$[$i$jscomp$inline_5878$$];
        if ($entry$jscomp$inline_5879$$.video.element == $video$jscomp$6$$.element) {
          $JSCompiler_StaticMethods_Autoplay$$module$src$service$video$autoplay_prototype$delegate$self$jscomp$inline_1858_JSCompiler_inline_result$jscomp$5600_entry$jscomp$inline_1860$$ = $entry$jscomp$inline_5879$$;
          break a;
        }
      }
      $JSCompiler_StaticMethods_Autoplay$$module$src$service$video$autoplay_prototype$delegate$self$jscomp$inline_1858_JSCompiler_inline_result$jscomp$5600_entry$jscomp$inline_1860$$ = null;
    }
    $JSCompiler_StaticMethods_Autoplay$$module$src$service$video$autoplay_prototype$delegate$self$jscomp$inline_1858_JSCompiler_inline_result$jscomp$5600_entry$jscomp$inline_1860$$ && ($JSCompiler_StaticMethods_disableTriggerByVisibility_$$($JSCompiler_StaticMethods_Autoplay$$module$src$service$video$autoplay_prototype$delegate$self$jscomp$inline_1858_JSCompiler_inline_result$jscomp$5600_entry$jscomp$inline_1860$$), $JSCompiler_StaticMethods_Autoplay$$module$src$service$video$autoplay_prototype$delegate$self$jscomp$inline_1858_JSCompiler_inline_result$jscomp$5600_entry$jscomp$inline_1860$$.video.pause());
  }));
};
$VideoEntry$$module$src$service$video_service_sync_impl$$ = function($video$jscomp$9$$) {
  this.$video_$ = $video$jscomp$9$$;
  this.$element_$ = $video$jscomp$9$$.element;
  this.$loadPromise_$ = _.$listenOncePromise$$module$src$event_helper$$(this.$element_$, _.$VideoEvents$$module$src$video_interface$$.$LOAD$);
  $JSCompiler_StaticMethods_listenToAutoplayEvents_$$(this);
  $setVideoComponentClassname$$module$src$service$video_service_sync_impl$$(this.$element_$);
};
$JSCompiler_StaticMethods_listenOnLoad_$$ = function($JSCompiler_StaticMethods_listenOnLoad_$self$$, $event$jscomp$33$$, $handler$jscomp$33$$) {
  _.$listen$$module$src$event_helper$$($JSCompiler_StaticMethods_listenOnLoad_$self$$.$element_$, $event$jscomp$33$$, function($event$jscomp$33$$) {
    $JSCompiler_StaticMethods_listenOnLoad_$self$$.$loadPromise_$.then(function() {
      $handler$jscomp$33$$($event$jscomp$33$$);
    });
  });
};
$JSCompiler_StaticMethods_listenToAutoplayEvents_$$ = function($JSCompiler_StaticMethods_listenToAutoplayEvents_$self$$) {
  $JSCompiler_StaticMethods_listenOnLoad_$$($JSCompiler_StaticMethods_listenToAutoplayEvents_$self$$, "amp:autoplay", function() {
    $JSCompiler_StaticMethods_listenToAutoplayEvents_$self$$.$video_$.play(!0);
  });
  $JSCompiler_StaticMethods_listenOnLoad_$$($JSCompiler_StaticMethods_listenToAutoplayEvents_$self$$, "amp:autopause", function() {
    $JSCompiler_StaticMethods_listenToAutoplayEvents_$self$$.$video_$.pause();
  });
};
$setVideoComponentClassname$$module$src$service$video_service_sync_impl$$ = function($element$jscomp$219$$) {
  $element$jscomp$219$$.classList.add("i-amphtml-video-component");
};
_.$setMediaSession$$module$src$mediasession_helper$$ = function($element$jscomp$220$$, $win$jscomp$230$$, $metadata$$, $playHandler$$, $pauseHandler$$) {
  var $navigator$jscomp$1$$ = $win$jscomp$230$$.navigator;
  "mediaSession" in $navigator$jscomp$1$$ && $win$jscomp$230$$.$MediaMetadata$ && ($navigator$jscomp$1$$.$F$.$metadata$ = new $win$jscomp$230$$.$MediaMetadata$(_.$EMPTY_METADATA$$module$src$mediasession_helper$$), $validateMetadata$$module$src$mediasession_helper$$($element$jscomp$220$$, $metadata$$), $navigator$jscomp$1$$.$F$.$metadata$ = new $win$jscomp$230$$.$MediaMetadata$($metadata$$), $navigator$jscomp$1$$.$F$.$setActionHandler$("play", $playHandler$$), $navigator$jscomp$1$$.$F$.$setActionHandler$("pause", 
  $pauseHandler$$));
};
_.$parseSchemaImage$$module$src$mediasession_helper$$ = function($doc$jscomp$54_schema_schemaJson$$) {
  if (($doc$jscomp$54_schema_schemaJson$$ = $doc$jscomp$54_schema_schemaJson$$.querySelector('script[type="application/ld+json"]')) && ($doc$jscomp$54_schema_schemaJson$$ = _.$tryParseJson$$module$src$json$$($doc$jscomp$54_schema_schemaJson$$.textContent)) && $doc$jscomp$54_schema_schemaJson$$.image) {
    if ("string" === typeof $doc$jscomp$54_schema_schemaJson$$.image) {
      return $doc$jscomp$54_schema_schemaJson$$.image;
    }
    if ($doc$jscomp$54_schema_schemaJson$$.image["@list"] && "string" === typeof $doc$jscomp$54_schema_schemaJson$$.image["@list"][0]) {
      return $doc$jscomp$54_schema_schemaJson$$.image["@list"][0];
    }
    if ("string" === typeof $doc$jscomp$54_schema_schemaJson$$.image.url) {
      return $doc$jscomp$54_schema_schemaJson$$.image.url;
    }
    if ("string" === typeof $doc$jscomp$54_schema_schemaJson$$.image[0]) {
      return $doc$jscomp$54_schema_schemaJson$$.image[0];
    }
  }
};
_.$parseOgImage$$module$src$mediasession_helper$$ = function($doc$jscomp$55_metaTag$$) {
  if ($doc$jscomp$55_metaTag$$ = $doc$jscomp$55_metaTag$$.querySelector('meta[property="og:image"]')) {
    return $doc$jscomp$55_metaTag$$.getAttribute("content");
  }
};
_.$parseFavicon$$module$src$mediasession_helper$$ = function($doc$jscomp$56_linkTag$jscomp$1$$) {
  if ($doc$jscomp$56_linkTag$jscomp$1$$ = $doc$jscomp$56_linkTag$jscomp$1$$.querySelector('link[rel="shortcut icon"]') || $doc$jscomp$56_linkTag$jscomp$1$$.querySelector('link[rel="icon"]')) {
    return $doc$jscomp$56_linkTag$jscomp$1$$.getAttribute("href");
  }
};
$validateMetadata$$module$src$mediasession_helper$$ = function($artwork_element$jscomp$221$$, $metadata$jscomp$1$$) {
  _.$Services$$module$src$services$urlForDoc$$($artwork_element$jscomp$221$$);
  $metadata$jscomp$1$$ && $metadata$jscomp$1$$.$artwork$ && ($artwork_element$jscomp$221$$ = $metadata$jscomp$1$$.$artwork$, _.$isArray$$module$src$types$$($artwork_element$jscomp$221$$), $artwork_element$jscomp$221$$.forEach(function($artwork_element$jscomp$221$$) {
    $artwork_element$jscomp$221$$ && _.$isObject$$module$src$types$$($artwork_element$jscomp$221$$);
  }));
};
_.$mapRange$$module$src$utils$math$$ = function($val$jscomp$11$$, $min1$$, $max1$$, $min2$$, $max2$$) {
  var $max1Bound$$ = $max1$$, $min1Bound$$ = $min1$$;
  $min1$$ > $max1$$ && ($max1Bound$$ = $min1$$, $min1Bound$$ = $max1$$);
  $val$jscomp$11$$ < $min1Bound$$ ? $val$jscomp$11$$ = $min1Bound$$ : $val$jscomp$11$$ > $max1Bound$$ && ($val$jscomp$11$$ = $max1Bound$$);
  return ($val$jscomp$11$$ - $min1$$) * ($max2$$ - $min2$$) / ($max1$$ - $min1$$) + $min2$$;
};
_.$clamp$$module$src$utils$math$$ = function($val$jscomp$12$$, $min$$, $max$$) {
  return Math.min(Math.max($val$jscomp$12$$, $min$$), $max$$);
};
$VideoSessionManager$$module$src$service$video_session_manager$$ = function() {
  this.$D$ = !1;
  this.$F$ = new _.$Observable$$module$src$observable$$;
};
$JSCompiler_StaticMethods_onSessionEnd$$ = function($JSCompiler_StaticMethods_onSessionEnd$self$$, $listener$jscomp$62$$) {
  $JSCompiler_StaticMethods_onSessionEnd$self$$.$F$.add($listener$jscomp$62$$);
};
$JSCompiler_StaticMethods_endSession$$ = function($JSCompiler_StaticMethods_endSession$self$$) {
  $JSCompiler_StaticMethods_endSession$self$$.$D$ && $JSCompiler_StaticMethods_endSession$self$$.$F$.$fire$();
  $JSCompiler_StaticMethods_endSession$self$$.$D$ = !1;
};
_.$VideoManager$$module$src$service$video_manager_impl$$ = function($ampdoc$jscomp$96$$) {
  var $$jscomp$this$jscomp$197$$ = this;
  this.ampdoc = $ampdoc$jscomp$96$$;
  this.$J$ = _.$once$$module$src$utils$function$$(function() {
    return $installAutoplayStylesForDoc$$module$src$service$video$install_autoplay_styles$$($$jscomp$this$jscomp$197$$.ampdoc);
  });
  this.$viewport_$ = _.$Services$$module$src$services$viewportForDoc$$(this.ampdoc);
  this.$D$ = null;
  this.$G$ = !1;
  this.$timer_$ = _.$Services$$module$src$services$timerFor$$($ampdoc$jscomp$96$$.$win$);
  this.$actions_$ = _.$Services$$module$src$services$actionServiceForDoc$$($ampdoc$jscomp$96$$.$getHeadNode$());
  this.$F$ = function() {
    for (var $ampdoc$jscomp$96$$ = 0; $ampdoc$jscomp$96$$ < $$jscomp$this$jscomp$197$$.$D$.length; $ampdoc$jscomp$96$$++) {
      var $entry$jscomp$inline_1864$$ = $$jscomp$this$jscomp$197$$.$D$[$ampdoc$jscomp$96$$];
      if ("paused" !== $entry$jscomp$inline_1864$$.$getPlayingState$()) {
        $analyticsEvent$$module$src$service$video_manager_impl$$($entry$jscomp$inline_1864$$, "video-seconds-played");
        var $currentTime$jscomp$inline_5885_event$jscomp$inline_5887$$ = $entry$jscomp$inline_1864$$.video.$getCurrentTime$(), $duration$jscomp$inline_5886$$ = $entry$jscomp$inline_1864$$.video.$getDuration$();
        _.$isFiniteNumber$$module$src$types$$($currentTime$jscomp$inline_5885_event$jscomp$inline_5887$$) && _.$isFiniteNumber$$module$src$types$$($duration$jscomp$inline_5886$$) && 0 < $duration$jscomp$inline_5886$$ && ($currentTime$jscomp$inline_5885_event$jscomp$inline_5887$$ = _.$createCustomEvent$$module$src$event_helper$$($$jscomp$this$jscomp$197$$.ampdoc.$win$, "video-manager.timeUpdate", _.$dict$$module$src$utils$object$$({time:$currentTime$jscomp$inline_5885_event$jscomp$inline_5887$$, percent:$currentTime$jscomp$inline_5885_event$jscomp$inline_5887$$ / 
        $duration$jscomp$inline_5886$$})), $$jscomp$this$jscomp$197$$.$actions_$.$trigger$($entry$jscomp$inline_1864$$.video.element, "timeUpdate", $currentTime$jscomp$inline_5885_event$jscomp$inline_5887$$, 1));
      }
    }
    $$jscomp$this$jscomp$197$$.$timer_$.delay($$jscomp$this$jscomp$197$$.$F$, 1000);
  };
  this.$I$ = _.$once$$module$src$utils$function$$(function() {
    return new $AutoFullscreenManager$$module$src$service$video_manager_impl$$($$jscomp$this$jscomp$197$$.ampdoc, $$jscomp$this$jscomp$197$$);
  });
  this.$timer_$.delay(this.$F$, 1000);
};
$JSCompiler_StaticMethods_VideoManager$$module$src$service$video_manager_impl_prototype$registerCommonActions_$$ = function($video$jscomp$12$$) {
  function $registerAction$$($registerAction$$, $fn$jscomp$19$$) {
    _.$JSCompiler_StaticMethods_registerAction$$($video$jscomp$12$$, $registerAction$$, function() {
      _.$JSCompiler_StaticMethods_signal$$($video$jscomp$12$$.signals(), "user-interacted");
      $fn$jscomp$19$$();
    }, 1);
  }
  $registerAction$$("play", function() {
    return $video$jscomp$12$$.play(!1);
  });
  $registerAction$$("pause", function() {
    return $video$jscomp$12$$.pause();
  });
  $registerAction$$("mute", function() {
    return $video$jscomp$12$$.$mute$();
  });
  $registerAction$$("unmute", function() {
    return $video$jscomp$12$$.$unmute$();
  });
  $registerAction$$("fullscreen", function() {
    return $video$jscomp$12$$.$fullscreenEnter$();
  });
};
$JSCompiler_StaticMethods_maybeInstallVisibilityObserver_$$ = function($JSCompiler_StaticMethods_maybeInstallVisibilityObserver_$self$$, $entry$jscomp$12$$) {
  var $element$jscomp$223_scrollListener$$ = $entry$jscomp$12$$.video.element;
  _.$listen$$module$src$event_helper$$($element$jscomp$223_scrollListener$$, _.$VideoEvents$$module$src$video_interface$$.$VISIBILITY$, function($JSCompiler_StaticMethods_maybeInstallVisibilityObserver_$self$$) {
    ($JSCompiler_StaticMethods_maybeInstallVisibilityObserver_$self$$ = $JSCompiler_StaticMethods_maybeInstallVisibilityObserver_$self$$.data) && 1 == $JSCompiler_StaticMethods_maybeInstallVisibilityObserver_$self$$.visible ? $JSCompiler_StaticMethods_updateVisibility$$($entry$jscomp$12$$, !0) : $JSCompiler_StaticMethods_updateVisibility$$($entry$jscomp$12$$);
  });
  _.$listen$$module$src$event_helper$$($element$jscomp$223_scrollListener$$, _.$VideoEvents$$module$src$video_interface$$.$RELOAD$, function() {
    $JSCompiler_StaticMethods_videoLoaded$$($entry$jscomp$12$$);
  });
  $JSCompiler_StaticMethods_maybeInstallVisibilityObserver_$self$$.$G$ || ($element$jscomp$223_scrollListener$$ = function() {
    for (var $entry$jscomp$12$$ = 0; $entry$jscomp$12$$ < $JSCompiler_StaticMethods_maybeInstallVisibilityObserver_$self$$.$D$.length; $entry$jscomp$12$$++) {
      $JSCompiler_StaticMethods_updateVisibility$$($JSCompiler_StaticMethods_maybeInstallVisibilityObserver_$self$$.$D$[$entry$jscomp$12$$]);
    }
  }, _.$JSCompiler_StaticMethods_Viewport$$module$src$service$viewport$viewport_impl_prototype$onScroll$$($JSCompiler_StaticMethods_maybeInstallVisibilityObserver_$self$$.$viewport_$, $element$jscomp$223_scrollListener$$), _.$JSCompiler_StaticMethods_onChanged$$($JSCompiler_StaticMethods_maybeInstallVisibilityObserver_$self$$.$viewport_$, $element$jscomp$223_scrollListener$$), $JSCompiler_StaticMethods_maybeInstallVisibilityObserver_$self$$.$G$ = !0);
};
_.$JSCompiler_StaticMethods_getEntryForVideo_$$ = function($JSCompiler_StaticMethods_getEntryForVideo_$self$$, $video$jscomp$13$$) {
  for (var $i$jscomp$140$$ = 0; $i$jscomp$140$$ < $JSCompiler_StaticMethods_getEntryForVideo_$self$$.$D$.length; $i$jscomp$140$$++) {
    if ($JSCompiler_StaticMethods_getEntryForVideo_$self$$.$D$[$i$jscomp$140$$].video === $video$jscomp$13$$) {
      return $JSCompiler_StaticMethods_getEntryForVideo_$self$$.$D$[$i$jscomp$140$$];
    }
  }
  _.$dev$$module$src$log$$().error("video-manager", "video is not registered to this video manager");
  return null;
};
_.$VideoEntry$$module$src$service$video_manager_impl$$ = function($manager$jscomp$2$$, $video$jscomp$17$$) {
  var $$jscomp$this$jscomp$199$$ = this;
  this.$manager_$ = $manager$jscomp$2$$;
  this.$ampdoc_$ = $manager$jscomp$2$$.ampdoc;
  this.video = $video$jscomp$17$$;
  this.$P$ = !0;
  this.$isVisible_$ = this.$D$ = this.$V$ = !1;
  this.$I$ = new $VideoSessionManager$$module$src$service$video_session_manager$$;
  $JSCompiler_StaticMethods_onSessionEnd$$(this.$I$, function() {
    return $analyticsEvent$$module$src$service$video_manager_impl$$($$jscomp$this$jscomp$199$$, "video-session");
  });
  this.$F$ = new $VideoSessionManager$$module$src$service$video_session_manager$$;
  $JSCompiler_StaticMethods_onSessionEnd$$(this.$F$, function() {
    return $analyticsEvent$$module$src$service$video_manager_impl$$($$jscomp$this$jscomp$199$$, "video-session-visible");
  });
  this.$O$ = function() {
    var $manager$jscomp$2$$ = $$jscomp$this$jscomp$199$$.$ampdoc_$.$win$;
    return _.$VideoUtils$$module$src$utils$video$isAutoplaySupported$$($manager$jscomp$2$$, _.$getMode$$module$src$mode$$($manager$jscomp$2$$).$lite$);
  };
  this.$U$ = _.$once$$module$src$utils$function$$(function() {
    return new $AnalyticsPercentageTracker$$module$src$service$video_manager_impl$$($$jscomp$this$jscomp$199$$.$ampdoc_$.$win$, $$jscomp$this$jscomp$199$$);
  });
  this.$K$ = this.$W$ = !1;
  this.$J$ = null;
  this.$muted_$ = !1;
  (this.$G$ = $video$jscomp$17$$.element.hasAttribute("autoplay")) && this.$manager_$.$J$();
  this.$metadata_$ = _.$EMPTY_METADATA$$module$src$mediasession_helper$$;
  this.$aa$ = function() {
    $$jscomp$this$jscomp$199$$.video.play(!1);
  };
  this.$Y$ = function() {
    $$jscomp$this$jscomp$199$$.video.pause();
  };
  _.$listenOncePromise$$module$src$event_helper$$($video$jscomp$17$$.element, _.$VideoEvents$$module$src$video_interface$$.$LOAD$).then(function() {
    return $JSCompiler_StaticMethods_videoLoaded$$($$jscomp$this$jscomp$199$$);
  });
  _.$listen$$module$src$event_helper$$($video$jscomp$17$$.element, _.$VideoEvents$$module$src$video_interface$$.$PAUSE$, function() {
    $analyticsEvent$$module$src$service$video_manager_impl$$($$jscomp$this$jscomp$199$$, "video-pause");
    $$jscomp$this$jscomp$199$$.$D$ = !1;
    $$jscomp$this$jscomp$199$$.$K$ ? $$jscomp$this$jscomp$199$$.$K$ = !1 : $JSCompiler_StaticMethods_endSession$$($$jscomp$this$jscomp$199$$.$I$);
  });
  _.$listen$$module$src$event_helper$$($video$jscomp$17$$.element, _.$VideoEvents$$module$src$video_interface$$.$PLAYING$, function() {
    $$jscomp$this$jscomp$199$$.$D$ = !0;
    "playing_manual" == $$jscomp$this$jscomp$199$$.$getPlayingState$() && $$jscomp$this$jscomp$199$$.$R$();
    var $manager$jscomp$2$$ = $$jscomp$this$jscomp$199$$.video, $video$jscomp$17$$ = $manager$jscomp$2$$.element;
    $manager$jscomp$2$$.$preimplementsMediaSessionAPI$() || $video$jscomp$17$$.classList.contains("i-amphtml-disable-mediasession") || _.$setMediaSession$$module$src$mediasession_helper$$($video$jscomp$17$$, $$jscomp$this$jscomp$199$$.$ampdoc_$.$win$, $$jscomp$this$jscomp$199$$.$metadata_$, $$jscomp$this$jscomp$199$$.$aa$, $$jscomp$this$jscomp$199$$.$Y$);
    $$jscomp$this$jscomp$199$$.$I$.$D$ = !0;
    $$jscomp$this$jscomp$199$$.$isVisible_$ && ($$jscomp$this$jscomp$199$$.$F$.$D$ = !0);
    $analyticsEvent$$module$src$service$video_manager_impl$$($$jscomp$this$jscomp$199$$, "video-play");
  });
  _.$listen$$module$src$event_helper$$($video$jscomp$17$$.element, _.$VideoEvents$$module$src$video_interface$$.$MUTED$, function() {
    return $$jscomp$this$jscomp$199$$.$muted_$ = !0;
  });
  _.$listen$$module$src$event_helper$$($video$jscomp$17$$.element, _.$VideoEvents$$module$src$video_interface$$.$UNMUTED$, function() {
    return $$jscomp$this$jscomp$199$$.$muted_$ = !1;
  });
  _.$listen$$module$src$event_helper$$($video$jscomp$17$$.element, _.$VideoEvents$$module$src$video_interface$$.$ENDED$, function() {
    $analyticsEvent$$module$src$service$video_manager_impl$$($$jscomp$this$jscomp$199$$, "video-ended");
  });
  _.$listen$$module$src$event_helper$$($video$jscomp$17$$.element, "video-hosted-custom", function($manager$jscomp$2$$) {
    $manager$jscomp$2$$ = $manager$jscomp$2$$.data;
    $JSCompiler_StaticMethods_logCustomAnalytics_$$($$jscomp$this$jscomp$199$$, $manager$jscomp$2$$.eventType, $manager$jscomp$2$$.vars);
  });
  $video$jscomp$17$$.signals().whenSignal(_.$VideoEvents$$module$src$video_interface$$.$REGISTERED$).then(function() {
    var $manager$jscomp$2$$ = $$jscomp$this$jscomp$199$$.video.element;
    ($$jscomp$this$jscomp$199$$.video.$preimplementsAutoFullscreen$() || !$manager$jscomp$2$$.hasAttribute("rotate-to-fullscreen") ? 0 : $$jscomp$this$jscomp$199$$.video.$isInteractive$()) && $$jscomp$this$jscomp$199$$.$manager_$.$I$().register($$jscomp$this$jscomp$199$$);
    $JSCompiler_StaticMethods_updateVisibility$$($$jscomp$this$jscomp$199$$);
    $$jscomp$this$jscomp$199$$.$G$ && $JSCompiler_StaticMethods_autoplayVideoBuilt_$$($$jscomp$this$jscomp$199$$);
  });
  this.$R$ = _.$once$$module$src$utils$function$$(function() {
    var $manager$jscomp$2$$ = _.$createCustomEvent$$module$src$event_helper$$($$jscomp$this$jscomp$199$$.$ampdoc_$.$win$, "firstPlay", _.$dict$$module$src$utils$object$$({})), $video$jscomp$17$$ = $$jscomp$this$jscomp$199$$.video.element;
    _.$Services$$module$src$services$actionServiceForDoc$$($video$jscomp$17$$).$trigger$($video$jscomp$17$$, "firstPlay", $manager$jscomp$2$$, 1);
  });
  $JSCompiler_StaticMethods_listenForAutoplayDelegation_$$(this);
};
$JSCompiler_StaticMethods_logCustomAnalytics_$$ = function($JSCompiler_StaticMethods_logCustomAnalytics_$self$$, $eventType$jscomp$19$$, $vars$jscomp$4$$) {
  var $prefixedVars$$ = {};
  Object.keys($vars$jscomp$4$$).forEach(function($JSCompiler_StaticMethods_logCustomAnalytics_$self$$) {
    $prefixedVars$$["custom_" + $JSCompiler_StaticMethods_logCustomAnalytics_$self$$] = $vars$jscomp$4$$[$JSCompiler_StaticMethods_logCustomAnalytics_$self$$];
  });
  $analyticsEvent$$module$src$service$video_manager_impl$$($JSCompiler_StaticMethods_logCustomAnalytics_$self$$, $eventType$jscomp$19$$, $prefixedVars$$);
};
$JSCompiler_StaticMethods_listenForAutoplayDelegation_$$ = function($JSCompiler_StaticMethods_listenForAutoplayDelegation_$self$$) {
  $JSCompiler_StaticMethods_listenForAutoplayDelegation_$self$$.video.signals().whenSignal("autoplay-delegated").then(function() {
    $JSCompiler_StaticMethods_listenForAutoplayDelegation_$self$$.$P$ = !1;
    $JSCompiler_StaticMethods_listenForAutoplayDelegation_$self$$.$D$ && $JSCompiler_StaticMethods_listenForAutoplayDelegation_$self$$.video.pause();
  });
};
$JSCompiler_StaticMethods_videoLoaded$$ = function($JSCompiler_StaticMethods_videoLoaded$self$$) {
  $JSCompiler_StaticMethods_videoLoaded$self$$.$V$ = !0;
  $JSCompiler_StaticMethods_videoLoaded$self$$.$J$ = _.$getInternalVideoElementFor$$module$src$utils$video$$($JSCompiler_StaticMethods_videoLoaded$self$$.video.element);
  if (!$JSCompiler_StaticMethods_videoLoaded$self$$.video.$preimplementsMediaSessionAPI$()) {
    $JSCompiler_StaticMethods_videoLoaded$self$$.video.getMetadata() && ($JSCompiler_StaticMethods_videoLoaded$self$$.$metadata_$ = _.$map$$module$src$utils$object$$($JSCompiler_StaticMethods_videoLoaded$self$$.video.getMetadata()));
    var $doc$jscomp$inline_1884_title$jscomp$inline_1886$$ = $JSCompiler_StaticMethods_videoLoaded$self$$.$ampdoc_$.$win$.document;
    if (!$JSCompiler_StaticMethods_videoLoaded$self$$.$metadata_$.$artwork$ || 0 == $JSCompiler_StaticMethods_videoLoaded$self$$.$metadata_$.$artwork$.length) {
      var $posterUrl$jscomp$inline_1885$$ = _.$parseSchemaImage$$module$src$mediasession_helper$$($doc$jscomp$inline_1884_title$jscomp$inline_1886$$) || _.$parseOgImage$$module$src$mediasession_helper$$($doc$jscomp$inline_1884_title$jscomp$inline_1886$$) || _.$parseFavicon$$module$src$mediasession_helper$$($doc$jscomp$inline_1884_title$jscomp$inline_1886$$);
      $posterUrl$jscomp$inline_1885$$ && ($JSCompiler_StaticMethods_videoLoaded$self$$.$metadata_$.$artwork$ = [{src:$posterUrl$jscomp$inline_1885$$}]);
    }
    !$JSCompiler_StaticMethods_videoLoaded$self$$.$metadata_$.title && ($doc$jscomp$inline_1884_title$jscomp$inline_1886$$ = $JSCompiler_StaticMethods_videoLoaded$self$$.video.element.getAttribute("title") || $JSCompiler_StaticMethods_videoLoaded$self$$.video.element.getAttribute("aria-label") || $JSCompiler_StaticMethods_videoLoaded$self$$.$J$.getAttribute("title") || $JSCompiler_StaticMethods_videoLoaded$self$$.$J$.getAttribute("aria-label") || $doc$jscomp$inline_1884_title$jscomp$inline_1886$$.title) && 
    ($JSCompiler_StaticMethods_videoLoaded$self$$.$metadata_$.title = $doc$jscomp$inline_1884_title$jscomp$inline_1886$$);
  }
  $JSCompiler_StaticMethods_videoLoaded$self$$.$U$().start();
  $JSCompiler_StaticMethods_updateVisibility$$($JSCompiler_StaticMethods_videoLoaded$self$$);
  $JSCompiler_StaticMethods_videoLoaded$self$$.$isVisible_$ && $JSCompiler_StaticMethods_loadedVideoVisibilityChanged_$$($JSCompiler_StaticMethods_videoLoaded$self$$);
};
$JSCompiler_StaticMethods_loadedVideoVisibilityChanged_$$ = function($JSCompiler_StaticMethods_loadedVideoVisibilityChanged_$self$$) {
  _.$JSCompiler_StaticMethods_Viewer$$module$src$service$viewer_impl_prototype$isVisible$$(_.$Services$$module$src$services$viewerForDoc$$($JSCompiler_StaticMethods_loadedVideoVisibilityChanged_$self$$.$ampdoc_$)) && $JSCompiler_StaticMethods_loadedVideoVisibilityChanged_$self$$.$O$().then(function($supportsAutoplay$$) {
    $JSCompiler_StaticMethods_loadedVideoVisibilityChanged_$self$$.$G$ && null == $JSCompiler_StaticMethods_loadedVideoVisibilityChanged_$self$$.video.signals().get("user-interacted") && $supportsAutoplay$$ ? $JSCompiler_StaticMethods_loadedVideoVisibilityChanged_$self$$.$P$ && ($JSCompiler_StaticMethods_loadedVideoVisibilityChanged_$self$$.$isVisible_$ ? ($JSCompiler_StaticMethods_loadedVideoVisibilityChanged_$self$$.$F$.$D$ = !0, $JSCompiler_StaticMethods_loadedVideoVisibilityChanged_$self$$.video.play(!0), 
    $JSCompiler_StaticMethods_loadedVideoVisibilityChanged_$self$$.$W$ = !0) : ($JSCompiler_StaticMethods_loadedVideoVisibilityChanged_$self$$.$D$ && $JSCompiler_StaticMethods_endSession$$($JSCompiler_StaticMethods_loadedVideoVisibilityChanged_$self$$.$F$), $JSCompiler_StaticMethods_loadedVideoVisibilityChanged_$self$$.video.pause(), $JSCompiler_StaticMethods_loadedVideoVisibilityChanged_$self$$.$K$ = !0)) : $JSCompiler_StaticMethods_loadedVideoVisibilityChanged_$self$$.$isVisible_$ ? $JSCompiler_StaticMethods_loadedVideoVisibilityChanged_$self$$.$F$.$D$ = 
    !0 : $JSCompiler_StaticMethods_loadedVideoVisibilityChanged_$self$$.$D$ && $JSCompiler_StaticMethods_endSession$$($JSCompiler_StaticMethods_loadedVideoVisibilityChanged_$self$$.$F$);
  });
};
$JSCompiler_StaticMethods_autoplayVideoBuilt_$$ = function($JSCompiler_StaticMethods_autoplayVideoBuilt_$self$$) {
  $JSCompiler_StaticMethods_autoplayVideoBuilt_$self$$.video.$isInteractive$() && $JSCompiler_StaticMethods_autoplayVideoBuilt_$self$$.video.$hideControls$();
  $JSCompiler_StaticMethods_autoplayVideoBuilt_$self$$.$O$().then(function($supportsAutoplay$jscomp$1$$) {
    !$supportsAutoplay$jscomp$1$$ && $JSCompiler_StaticMethods_autoplayVideoBuilt_$self$$.video.$isInteractive$() ? $JSCompiler_StaticMethods_autoplayVideoBuilt_$self$$.video.$showControls$() : ($JSCompiler_StaticMethods_autoplayVideoBuilt_$self$$.video.$mute$(), $JSCompiler_StaticMethods_installAutoplayArtifacts_$$($JSCompiler_StaticMethods_autoplayVideoBuilt_$self$$));
  });
};
$JSCompiler_StaticMethods_installAutoplayArtifacts_$$ = function($JSCompiler_StaticMethods_installAutoplayArtifacts_$self$$) {
  var $video$jscomp$19$$ = $JSCompiler_StaticMethods_installAutoplayArtifacts_$self$$.video, $$jscomp$destructuring$var162_win$jscomp$232$$ = $JSCompiler_StaticMethods_installAutoplayArtifacts_$self$$.video, $element$jscomp$228$$ = $$jscomp$destructuring$var162_win$jscomp$232$$.element;
  $$jscomp$destructuring$var162_win$jscomp$232$$ = $$jscomp$destructuring$var162_win$jscomp$232$$.$win$;
  if (!$element$jscomp$228$$.hasAttribute("noaudio") && !$element$jscomp$228$$.signals().get("user-interacted")) {
    var $animation$$ = $renderIcon$$module$src$service$video$autoplay$$($$jscomp$destructuring$var162_win$jscomp$232$$, $element$jscomp$228$$), $toggleAnimation$$ = function($JSCompiler_StaticMethods_installAutoplayArtifacts_$self$$) {
      $video$jscomp$19$$.$mutateElement$(function() {
        $animation$$.classList.toggle("amp-video-eq-play", $JSCompiler_StaticMethods_installAutoplayArtifacts_$self$$);
      });
    };
    $video$jscomp$19$$.$mutateElement$(function() {
      $element$jscomp$228$$.appendChild($animation$$);
    });
    var $unlisteners$jscomp$2$$ = [_.$listen$$module$src$event_helper$$($element$jscomp$228$$, _.$VideoEvents$$module$src$video_interface$$.$PAUSE$, function() {
      return $toggleAnimation$$(!1);
    }), _.$listen$$module$src$event_helper$$($element$jscomp$228$$, _.$VideoEvents$$module$src$video_interface$$.$PLAYING$, function() {
      return $toggleAnimation$$(!0);
    })];
    $video$jscomp$19$$.signals().whenSignal("user-interacted").then(function() {
      var $video$jscomp$19$$ = $JSCompiler_StaticMethods_installAutoplayArtifacts_$self$$.video, $$jscomp$destructuring$var162_win$jscomp$232$$ = $video$jscomp$19$$.element;
      $JSCompiler_StaticMethods_installAutoplayArtifacts_$self$$.$R$();
      $video$jscomp$19$$.$isInteractive$() && $video$jscomp$19$$.$showControls$();
      $video$jscomp$19$$.$unmute$();
      $unlisteners$jscomp$2$$.forEach(function($JSCompiler_StaticMethods_installAutoplayArtifacts_$self$$) {
        $JSCompiler_StaticMethods_installAutoplayArtifacts_$self$$();
      });
      $video$jscomp$19$$ = $$jscomp$destructuring$var162_win$jscomp$232$$.querySelector(".amp-video-eq");
      $$jscomp$destructuring$var162_win$jscomp$232$$ = $$jscomp$destructuring$var162_win$jscomp$232$$.querySelector("i-amphtml-video-mask");
      $video$jscomp$19$$ && _.$removeElement$$module$src$dom$$($video$jscomp$19$$);
      $$jscomp$destructuring$var162_win$jscomp$232$$ && _.$removeElement$$module$src$dom$$($$jscomp$destructuring$var162_win$jscomp$232$$);
    });
    if ($video$jscomp$19$$.$isInteractive$()) {
      var $mask$jscomp$6$$ = $renderInteractionOverlay$$module$src$service$video$autoplay$$($$jscomp$destructuring$var162_win$jscomp$232$$, $element$jscomp$228$$), $setMaskDisplay$$ = function($JSCompiler_StaticMethods_installAutoplayArtifacts_$self$$) {
        $video$jscomp$19$$.$mutateElement$(function() {
          _.$toggle$$module$src$style$$($mask$jscomp$6$$, $JSCompiler_StaticMethods_installAutoplayArtifacts_$self$$);
        });
      };
      $video$jscomp$19$$.$hideControls$();
      $video$jscomp$19$$.$mutateElement$(function() {
        $element$jscomp$228$$.appendChild($mask$jscomp$6$$);
      });
      [_.$listen$$module$src$event_helper$$($mask$jscomp$6$$, "click", function() {
        _.$JSCompiler_StaticMethods_signal$$($video$jscomp$19$$.signals(), "user-interacted");
      }), _.$listen$$module$src$event_helper$$($element$jscomp$228$$, _.$VideoEvents$$module$src$video_interface$$.$AD_START$, function() {
        return $setMaskDisplay$$(!1);
      }), _.$listen$$module$src$event_helper$$($element$jscomp$228$$, _.$VideoEvents$$module$src$video_interface$$.$AD_END$, function() {
        return $setMaskDisplay$$(!0);
      })].forEach(function($JSCompiler_StaticMethods_installAutoplayArtifacts_$self$$) {
        return $unlisteners$jscomp$2$$.push($JSCompiler_StaticMethods_installAutoplayArtifacts_$self$$);
      });
    }
  }
};
$JSCompiler_StaticMethods_updateVisibility$$ = function($JSCompiler_StaticMethods_updateVisibility$self$$, $opt_forceVisible_ratio$jscomp$5$$) {
  var $wasVisible$$ = $JSCompiler_StaticMethods_updateVisibility$self$$.$isVisible_$;
  $opt_forceVisible_ratio$jscomp$5$$ ? $JSCompiler_StaticMethods_updateVisibility$self$$.$isVisible_$ = !0 : ($opt_forceVisible_ratio$jscomp$5$$ = $JSCompiler_StaticMethods_updateVisibility$self$$.video.element.$I$().intersectionRatio, $JSCompiler_StaticMethods_updateVisibility$self$$.$isVisible_$ = 0.5 <= (_.$isFiniteNumber$$module$src$types$$($opt_forceVisible_ratio$jscomp$5$$) ? $opt_forceVisible_ratio$jscomp$5$$ : 0));
  $JSCompiler_StaticMethods_updateVisibility$self$$.$isVisible_$ != $wasVisible$$ && $JSCompiler_StaticMethods_updateVisibility$self$$.$V$ && $JSCompiler_StaticMethods_loadedVideoVisibilityChanged_$$($JSCompiler_StaticMethods_updateVisibility$self$$);
};
$JSCompiler_StaticMethods_VideoEntry$$module$src$service$video_manager_impl_prototype$getAnalyticsDetails$$ = function($JSCompiler_StaticMethods_VideoEntry$$module$src$service$video_manager_impl_prototype$getAnalyticsDetails$self$$) {
  var $video$jscomp$21$$ = $JSCompiler_StaticMethods_VideoEntry$$module$src$service$video_manager_impl_prototype$getAnalyticsDetails$self$$.video;
  return $JSCompiler_StaticMethods_VideoEntry$$module$src$service$video_manager_impl_prototype$getAnalyticsDetails$self$$.$O$().then(function($autoplay_supportsAutoplay$jscomp$2$$) {
    var $$jscomp$destructuring$var167_height$jscomp$18$$ = $video$jscomp$21$$.element.$getLayoutBox$(), $width$jscomp$19$$ = $$jscomp$destructuring$var167_height$jscomp$18$$.width;
    $$jscomp$destructuring$var167_height$jscomp$18$$ = $$jscomp$destructuring$var167_height$jscomp$18$$.height;
    $autoplay_supportsAutoplay$jscomp$2$$ = $JSCompiler_StaticMethods_VideoEntry$$module$src$service$video_manager_impl_prototype$getAnalyticsDetails$self$$.$G$ && $autoplay_supportsAutoplay$jscomp$2$$;
    var $playedRanges$$ = $video$jscomp$21$$.$getPlayedRanges$(), $playedTotal$$ = $playedRanges$$.reduce(function($JSCompiler_StaticMethods_VideoEntry$$module$src$service$video_manager_impl_prototype$getAnalyticsDetails$self$$, $video$jscomp$21$$) {
      return $JSCompiler_StaticMethods_VideoEntry$$module$src$service$video_manager_impl_prototype$getAnalyticsDetails$self$$ + $video$jscomp$21$$[1] - $video$jscomp$21$$[0];
    }, 0);
    return {autoplay:$autoplay_supportsAutoplay$jscomp$2$$, currentTime:$video$jscomp$21$$.$getCurrentTime$(), duration:$video$jscomp$21$$.$getDuration$(), height:$$jscomp$destructuring$var167_height$jscomp$18$$, id:$video$jscomp$21$$.element.id, muted:$JSCompiler_StaticMethods_VideoEntry$$module$src$service$video_manager_impl_prototype$getAnalyticsDetails$self$$.$muted_$, playedTotal:$playedTotal$$, playedRangesJson:JSON.stringify($playedRanges$$), state:$JSCompiler_StaticMethods_VideoEntry$$module$src$service$video_manager_impl_prototype$getAnalyticsDetails$self$$.$getPlayingState$(), 
    width:$width$jscomp$19$$};
  });
};
$AutoFullscreenManager$$module$src$service$video_manager_impl$$ = function($ampdoc$jscomp$97$$, $manager$jscomp$3$$) {
  var $$jscomp$this$jscomp$205$$ = this;
  this.$manager_$ = $manager$jscomp$3$$;
  this.$ampdoc_$ = $ampdoc$jscomp$97$$;
  this.$D$ = this.$F$ = null;
  this.$I$ = [];
  this.$G$ = function() {
    return $JSCompiler_StaticMethods_selectBestCenteredInPortrait_$$($$jscomp$this$jscomp$205$$);
  };
  this.$K$ = function($ampdoc$jscomp$97$$) {
    return "playing_manual" == $$jscomp$this$jscomp$205$$.$manager_$.$getPlayingState$($ampdoc$jscomp$97$$);
  };
  this.$J$ = function($ampdoc$jscomp$97$$, $manager$jscomp$3$$) {
    $ampdoc$jscomp$97$$ = $ampdoc$jscomp$97$$.element.$I$();
    var $$jscomp$inline_1899_JSCompiler_inline_result$jscomp$549_a$jscomp$5_rectA$jscomp$inline_1901$$ = $ampdoc$jscomp$97$$.intersectionRatio;
    $ampdoc$jscomp$97$$ = $ampdoc$jscomp$97$$.boundingClientRect;
    var $b$jscomp$9_rectB$jscomp$inline_1903$$ = $manager$jscomp$3$$.element.$I$();
    $manager$jscomp$3$$ = $b$jscomp$9_rectB$jscomp$inline_1903$$.boundingClientRect;
    $$jscomp$inline_1899_JSCompiler_inline_result$jscomp$549_a$jscomp$5_rectA$jscomp$inline_1901$$ -= $b$jscomp$9_rectB$jscomp$inline_1903$$.intersectionRatio;
    0.1 < Math.abs($$jscomp$inline_1899_JSCompiler_inline_result$jscomp$549_a$jscomp$5_rectA$jscomp$inline_1901$$) ? $ampdoc$jscomp$97$$ = $$jscomp$inline_1899_JSCompiler_inline_result$jscomp$549_a$jscomp$5_rectA$jscomp$inline_1901$$ : ($b$jscomp$9_rectB$jscomp$inline_1903$$ = _.$Services$$module$src$services$viewportForDoc$$($$jscomp$this$jscomp$205$$.$ampdoc_$), $$jscomp$inline_1899_JSCompiler_inline_result$jscomp$549_a$jscomp$5_rectA$jscomp$inline_1901$$ = $centerDist$$module$src$service$video_manager_impl$$($b$jscomp$9_rectB$jscomp$inline_1903$$, 
    $ampdoc$jscomp$97$$), $b$jscomp$9_rectB$jscomp$inline_1903$$ = $centerDist$$module$src$service$video_manager_impl$$($b$jscomp$9_rectB$jscomp$inline_1903$$, $manager$jscomp$3$$), $ampdoc$jscomp$97$$ = $$jscomp$inline_1899_JSCompiler_inline_result$jscomp$549_a$jscomp$5_rectA$jscomp$inline_1901$$ < $b$jscomp$9_rectB$jscomp$inline_1903$$ || $$jscomp$inline_1899_JSCompiler_inline_result$jscomp$549_a$jscomp$5_rectA$jscomp$inline_1901$$ > $b$jscomp$9_rectB$jscomp$inline_1903$$ ? $$jscomp$inline_1899_JSCompiler_inline_result$jscomp$549_a$jscomp$5_rectA$jscomp$inline_1901$$ - 
    $b$jscomp$9_rectB$jscomp$inline_1903$$ : $ampdoc$jscomp$97$$.top - $manager$jscomp$3$$.top);
    return $ampdoc$jscomp$97$$;
  };
  $JSCompiler_StaticMethods_installOrientationObserver_$$(this);
  $JSCompiler_StaticMethods_installFullscreenListener_$$(this);
};
$JSCompiler_StaticMethods_installFullscreenListener_$$ = function($JSCompiler_StaticMethods_installFullscreenListener_$self$$) {
  function $exitHandler$$() {
    $JSCompiler_StaticMethods_installFullscreenListener_$self$$.$F$ = null;
  }
  var $root$jscomp$17$$ = $JSCompiler_StaticMethods_installFullscreenListener_$self$$.$ampdoc_$.getRootNode();
  _.$internalListenImplementation$$module$src$event_helper_listen$$($root$jscomp$17$$, "webkitfullscreenchange", $exitHandler$$, void 0);
  _.$internalListenImplementation$$module$src$event_helper_listen$$($root$jscomp$17$$, "mozfullscreenchange", $exitHandler$$, void 0);
  _.$internalListenImplementation$$module$src$event_helper_listen$$($root$jscomp$17$$, "fullscreenchange", $exitHandler$$, void 0);
  _.$internalListenImplementation$$module$src$event_helper_listen$$($root$jscomp$17$$, "MSFullscreenChange", $exitHandler$$, void 0);
};
$JSCompiler_StaticMethods_installOrientationObserver_$$ = function($JSCompiler_StaticMethods_installOrientationObserver_$self$$) {
  var $win$jscomp$233$$ = $JSCompiler_StaticMethods_installOrientationObserver_$self$$.$ampdoc_$.$win$, $screen$jscomp$3$$ = $win$jscomp$233$$.screen;
  $screen$jscomp$3$$ && "orientation" in $screen$jscomp$3$$ && _.$listen$$module$src$event_helper$$($screen$jscomp$3$$.orientation, "change", function() {
    return $JSCompiler_StaticMethods_onRotation_$$($JSCompiler_StaticMethods_installOrientationObserver_$self$$);
  });
  _.$listen$$module$src$event_helper$$($win$jscomp$233$$, "orientationchange", function() {
    return $JSCompiler_StaticMethods_onRotation_$$($JSCompiler_StaticMethods_installOrientationObserver_$self$$);
  });
};
$JSCompiler_StaticMethods_onRotation_$$ = function($JSCompiler_StaticMethods_onRotation_$self$$) {
  $isLandscape$$module$src$service$video_manager_impl$$($JSCompiler_StaticMethods_onRotation_$self$$.$ampdoc_$.$win$) ? null != $JSCompiler_StaticMethods_onRotation_$self$$.$D$ && $JSCompiler_StaticMethods_AutoFullscreenManager$$module$src$service$video_manager_impl_prototype$enter_$$($JSCompiler_StaticMethods_onRotation_$self$$, $JSCompiler_StaticMethods_onRotation_$self$$.$D$) : $JSCompiler_StaticMethods_onRotation_$self$$.$F$ && $JSCompiler_StaticMethods_AutoFullscreenManager$$module$src$service$video_manager_impl_prototype$exit_$$($JSCompiler_StaticMethods_onRotation_$self$$, 
  $JSCompiler_StaticMethods_onRotation_$self$$.$F$);
};
$JSCompiler_StaticMethods_AutoFullscreenManager$$module$src$service$video_manager_impl_prototype$enter_$$ = function($JSCompiler_StaticMethods_AutoFullscreenManager$$module$src$service$video_manager_impl_prototype$enter_$self$$, $video$jscomp$26$$) {
  var $platform$jscomp$4$$ = _.$Services$$module$src$services$platformFor$$($JSCompiler_StaticMethods_AutoFullscreenManager$$module$src$service$video_manager_impl_prototype$enter_$self$$.$ampdoc_$.$win$);
  $JSCompiler_StaticMethods_AutoFullscreenManager$$module$src$service$video_manager_impl_prototype$enter_$self$$.$F$ = $video$jscomp$26$$;
  _.$JSCompiler_StaticMethods_isAndroid$$($platform$jscomp$4$$) && _.$JSCompiler_StaticMethods_isChrome$$($platform$jscomp$4$$) ? $video$jscomp$26$$.$fullscreenEnter$() : $JSCompiler_StaticMethods_scrollIntoIfNotVisible_$$($JSCompiler_StaticMethods_AutoFullscreenManager$$module$src$service$video_manager_impl_prototype$enter_$self$$, $video$jscomp$26$$).then(function() {
    return $video$jscomp$26$$.$fullscreenEnter$();
  });
};
$JSCompiler_StaticMethods_AutoFullscreenManager$$module$src$service$video_manager_impl_prototype$exit_$$ = function($JSCompiler_StaticMethods_AutoFullscreenManager$$module$src$service$video_manager_impl_prototype$exit_$self$$, $video$jscomp$27$$) {
  $JSCompiler_StaticMethods_AutoFullscreenManager$$module$src$service$video_manager_impl_prototype$exit_$self$$.$F$ = null;
  $JSCompiler_StaticMethods_scrollIntoIfNotVisible_$$($JSCompiler_StaticMethods_AutoFullscreenManager$$module$src$service$video_manager_impl_prototype$exit_$self$$, $video$jscomp$27$$, "center").then(function() {
    return $video$jscomp$27$$.$fullscreenExit$();
  });
};
$JSCompiler_StaticMethods_scrollIntoIfNotVisible_$$ = function($JSCompiler_StaticMethods_scrollIntoIfNotVisible_$self$$, $video$jscomp$28$$, $optPos$$) {
  $optPos$$ = void 0 === $optPos$$ ? null : $optPos$$;
  var $element$jscomp$232$$ = $video$jscomp$28$$.element, $viewport$jscomp$8$$ = _.$Services$$module$src$services$viewportForDoc$$($JSCompiler_StaticMethods_scrollIntoIfNotVisible_$self$$.$ampdoc_$);
  return _.$Services$$module$src$services$timerFor$$($JSCompiler_StaticMethods_scrollIntoIfNotVisible_$self$$.$ampdoc_$.$win$).$promise$(330).then(function() {
    var $JSCompiler_StaticMethods_scrollIntoIfNotVisible_$self$$ = $element$jscomp$232$$.$I$().boundingClientRect, $video$jscomp$28$$ = $JSCompiler_StaticMethods_scrollIntoIfNotVisible_$self$$.top;
    $JSCompiler_StaticMethods_scrollIntoIfNotVisible_$self$$ = $JSCompiler_StaticMethods_scrollIntoIfNotVisible_$self$$.bottom;
    var $vh$$ = $viewport$jscomp$8$$.$getSize$().height;
    return 0 <= $video$jscomp$28$$ && $JSCompiler_StaticMethods_scrollIntoIfNotVisible_$self$$ <= $vh$$ ? window.Promise.resolve() : _.$JSCompiler_StaticMethods_animateScrollIntoView$$($viewport$jscomp$8$$, $element$jscomp$232$$, 300, "ease-in", $optPos$$ ? $optPos$$ : $JSCompiler_StaticMethods_scrollIntoIfNotVisible_$self$$ > $vh$$ ? "bottom" : "top");
  });
};
$JSCompiler_StaticMethods_selectBestCenteredInPortrait_$$ = function($JSCompiler_StaticMethods_selectBestCenteredInPortrait_$self$$) {
  if ($isLandscape$$module$src$service$video_manager_impl$$($JSCompiler_StaticMethods_selectBestCenteredInPortrait_$self$$.$ampdoc_$.$win$)) {
    return $JSCompiler_StaticMethods_selectBestCenteredInPortrait_$self$$.$D$;
  }
  $JSCompiler_StaticMethods_selectBestCenteredInPortrait_$self$$.$D$ = null;
  var $selected$$ = $JSCompiler_StaticMethods_selectBestCenteredInPortrait_$self$$.$I$.filter($JSCompiler_StaticMethods_selectBestCenteredInPortrait_$self$$.$K$).sort($JSCompiler_StaticMethods_selectBestCenteredInPortrait_$self$$.$J$)[0];
  $selected$$ && 0.5 <= $selected$$.element.$I$().intersectionRatio && ($JSCompiler_StaticMethods_selectBestCenteredInPortrait_$self$$.$D$ = $selected$$);
  return $JSCompiler_StaticMethods_selectBestCenteredInPortrait_$self$$.$D$;
};
$centerDist$$module$src$service$video_manager_impl$$ = function($centerViewport_viewport$jscomp$10$$, $centerY_rect$jscomp$12$$) {
  $centerY_rect$jscomp$12$$ = $centerY_rect$jscomp$12$$.top + $centerY_rect$jscomp$12$$.height / 2;
  $centerViewport_viewport$jscomp$10$$ = $centerViewport_viewport$jscomp$10$$.$getSize$().height / 2;
  return Math.abs($centerY_rect$jscomp$12$$ - $centerViewport_viewport$jscomp$10$$);
};
$isLandscape$$module$src$service$video_manager_impl$$ = function($win$jscomp$234$$) {
  return $win$jscomp$234$$.screen && "orientation" in $win$jscomp$234$$.screen ? _.$startsWith$$module$src$string$$($win$jscomp$234$$.screen.orientation.type, "landscape") : 90 == Math.abs($win$jscomp$234$$.orientation);
};
$AnalyticsPercentageTracker$$module$src$service$video_manager_impl$$ = function($win$jscomp$235$$, $entry$jscomp$17$$) {
  this.$timer_$ = _.$Services$$module$src$services$timerFor$$($win$jscomp$235$$);
  this.$D$ = $entry$jscomp$17$$;
  this.$unlisteners_$ = null;
  this.$F$ = this.$G$ = 0;
};
$JSCompiler_StaticMethods_hasDuration_$$ = function($JSCompiler_StaticMethods_hasDuration_$self$$) {
  var $video$jscomp$30$$ = $JSCompiler_StaticMethods_hasDuration_$self$$.$D$.video, $duration$jscomp$13$$ = $video$jscomp$30$$.$getDuration$();
  if (!$duration$jscomp$13$$ || (0,window.isNaN)($duration$jscomp$13$$) || 0 >= $duration$jscomp$13$$) {
    return !1;
  }
  250 > 50 * $duration$jscomp$13$$ && $JSCompiler_StaticMethods_hasDuration_$self$$.$I$("This video is too short for `video-percentage-played`. Reports may be innacurate. For best results, use videos over", 5, "seconds long.", $video$jscomp$30$$.element);
  return !0;
};
$JSCompiler_StaticMethods_calculate_$$ = function($JSCompiler_StaticMethods_calculate_$self$$, $triggerId$$) {
  if ($triggerId$$ == $JSCompiler_StaticMethods_calculate_$self$$.$F$) {
    var $duration$jscomp$14_entry$jscomp$18$$ = $JSCompiler_StaticMethods_calculate_$self$$.$D$, $timer$jscomp$1$$ = $JSCompiler_StaticMethods_calculate_$self$$.$timer_$, $video$jscomp$31$$ = $duration$jscomp$14_entry$jscomp$18$$.video, $calculateAgain$$ = function() {
      return $JSCompiler_StaticMethods_calculate_$$($JSCompiler_StaticMethods_calculate_$self$$, $triggerId$$);
    };
    if ("paused" == $duration$jscomp$14_entry$jscomp$18$$.$getPlayingState$()) {
      $timer$jscomp$1$$.delay($calculateAgain$$, 500);
    } else {
      $duration$jscomp$14_entry$jscomp$18$$ = $video$jscomp$31$$.$getDuration$();
      var $frequencyMs$$ = _.$clamp$$module$src$utils$math$$(50 * $duration$jscomp$14_entry$jscomp$18$$, 250, 4000);
      $JSCompiler_StaticMethods_maybeTrigger_$$($JSCompiler_StaticMethods_calculate_$self$$, 5 * Math.floor($video$jscomp$31$$.$getCurrentTime$() / $duration$jscomp$14_entry$jscomp$18$$ * 100 / 5));
      $timer$jscomp$1$$.delay($calculateAgain$$, $frequencyMs$$);
    }
  }
};
$JSCompiler_StaticMethods_maybeTrigger_$$ = function($JSCompiler_StaticMethods_maybeTrigger_$self$$, $normalizedPercentage$jscomp$1$$) {
  0 >= $normalizedPercentage$jscomp$1$$ || $JSCompiler_StaticMethods_maybeTrigger_$self$$.$G$ == $normalizedPercentage$jscomp$1$$ || ($JSCompiler_StaticMethods_maybeTrigger_$self$$.$G$ = $normalizedPercentage$jscomp$1$$, $analyticsEvent$$module$src$service$video_manager_impl$$($JSCompiler_StaticMethods_maybeTrigger_$self$$.$D$, "video-percentage-played", {normalizedPercentage:$normalizedPercentage$jscomp$1$$.toString()}));
};
$analyticsEvent$$module$src$service$video_manager_impl$$ = function($entry$jscomp$19$$, $eventType$jscomp$20$$, $opt_vars$jscomp$1$$) {
  var $video$jscomp$32$$ = $entry$jscomp$19$$.video;
  $JSCompiler_StaticMethods_VideoEntry$$module$src$service$video_manager_impl_prototype$getAnalyticsDetails$$($entry$jscomp$19$$).then(function($entry$jscomp$19$$) {
    $opt_vars$jscomp$1$$ && Object.assign($entry$jscomp$19$$, $opt_vars$jscomp$1$$);
    $video$jscomp$32$$.element.$D$($eventType$jscomp$20$$, $entry$jscomp$19$$);
  });
};
_.$installVideoManagerForDoc$$module$src$service$video_manager_impl$$ = function($nodeOrDoc$jscomp$5$$) {
  _.$registerServiceBuilderForDoc$$module$src$service$$($nodeOrDoc$jscomp$5$$, "video-manager", function($nodeOrDoc$jscomp$5$$) {
    return _.$isExperimentOn$$module$src$experiments$$($nodeOrDoc$jscomp$5$$.$win$, "video-service") ? new _.$VideoServiceSync$$module$src$service$video_service_sync_impl$$($nodeOrDoc$jscomp$5$$) : new _.$VideoManager$$module$src$service$video_manager_impl$$($nodeOrDoc$jscomp$5$$);
  });
};
_.$insertAnalyticsElement$$module$src$extension_analytics$$ = function($parentElement$jscomp$7$$, $config$jscomp$2_extensions$jscomp$8$$, $analyticsElem_disableImmediate$$) {
  var $ampdoc$jscomp$100_loadAnalytics$jscomp$1$$ = !0;
  $ampdoc$jscomp$100_loadAnalytics$jscomp$1$$ = void 0 === $ampdoc$jscomp$100_loadAnalytics$jscomp$1$$ ? !1 : $ampdoc$jscomp$100_loadAnalytics$jscomp$1$$;
  var $doc$jscomp$58_scriptElem$$ = $parentElement$jscomp$7$$.ownerDocument;
  $analyticsElem_disableImmediate$$ = _.$createElementWithAttributes$$module$src$dom$$($doc$jscomp$58_scriptElem$$, "amp-analytics", _.$dict$$module$src$utils$object$$({sandbox:"true", trigger:(void 0 === $analyticsElem_disableImmediate$$ ? 0 : $analyticsElem_disableImmediate$$) ? "" : "immediate"}));
  $doc$jscomp$58_scriptElem$$ = _.$createElementWithAttributes$$module$src$dom$$($doc$jscomp$58_scriptElem$$, "script", _.$dict$$module$src$utils$object$$({type:"application/json"}));
  $doc$jscomp$58_scriptElem$$.textContent = JSON.stringify($config$jscomp$2_extensions$jscomp$8$$);
  $analyticsElem_disableImmediate$$.appendChild($doc$jscomp$58_scriptElem$$);
  $analyticsElem_disableImmediate$$.$ra$ = $config$jscomp$2_extensions$jscomp$8$$;
  $ampdoc$jscomp$100_loadAnalytics$jscomp$1$$ ? ($config$jscomp$2_extensions$jscomp$8$$ = _.$Services$$module$src$services$extensionsFor$$($parentElement$jscomp$7$$.ownerDocument.defaultView), $ampdoc$jscomp$100_loadAnalytics$jscomp$1$$ = _.$getAmpdoc$$module$src$service$$($parentElement$jscomp$7$$), _.$JSCompiler_StaticMethods_installExtensionForDoc$$($config$jscomp$2_extensions$jscomp$8$$, $ampdoc$jscomp$100_loadAnalytics$jscomp$1$$, "amp-analytics")) : _.$Services$$module$src$services$analyticsForDocOrNull$$($parentElement$jscomp$7$$).then(function() {
  });
  $parentElement$jscomp$7$$.appendChild($analyticsElem_disableImmediate$$);
  return $analyticsElem_disableImmediate$$;
};
$CustomEventReporter$$module$src$extension_analytics$$ = function($parent$jscomp$37$$, $config$jscomp$3$$) {
  var $$jscomp$this$jscomp$210$$ = this;
  this.$F$ = $parent$jscomp$37$$.$ia$();
  this.$D$ = $parent$jscomp$37$$;
  this.$config_$ = $config$jscomp$3$$;
  for (var $event$jscomp$36$$ in $config$jscomp$3$$.triggers) {
    $config$jscomp$3$$.triggers[$event$jscomp$36$$].on = "sandbox-" + this.$F$ + "-" + $config$jscomp$3$$.triggers[$event$jscomp$36$$].on;
  }
  this.$D$.signals().whenSignal("load-start").then(function() {
    _.$insertAnalyticsElement$$module$src$extension_analytics$$($$jscomp$this$jscomp$210$$.$D$, $config$jscomp$3$$);
  });
};
_.$CustomEventReporterBuilder$$module$src$extension_analytics$$ = function($parent$jscomp$38$$) {
  this.$D$ = $parent$jscomp$38$$;
  this.$config_$ = {requests:{}, triggers:{}};
};
_.$isAdPositionAllowed$$module$src$ad_helper$$ = function($el$jscomp$25_element$jscomp$236$$, $win$jscomp$238$$) {
  var $hasFixedAncestor$$ = !1, $containers$$ = 0;
  do {
    if (_.$CONTAINERS$$module$src$ad_helper$$[$el$jscomp$25_element$jscomp$236$$.tagName]) {
      $containers$$++, $hasFixedAncestor$$ = !1;
    } else {
      var $position$jscomp$inline_1920$$ = _.$computedStyle$$module$src$style$$($win$jscomp$238$$, $el$jscomp$25_element$jscomp$236$$).position;
      "fixed" != $position$jscomp$inline_1920$$ && "sticky" != $position$jscomp$inline_1920$$ || ($hasFixedAncestor$$ = !0);
    }
    $el$jscomp$25_element$jscomp$236$$ = $el$jscomp$25_element$jscomp$236$$.parentElement;
  } while ($el$jscomp$25_element$jscomp$236$$ && "BODY" != $el$jscomp$25_element$jscomp$236$$.tagName);
  return !$hasFixedAncestor$$ && 1 >= $containers$$;
};
_.$getAmpAdResourceId$$module$src$ad_helper$$ = function($node$jscomp$50$$, $topWin$jscomp$4$$) {
  try {
    var $frameParent$$ = _.$getParentWindowFrameElement$$module$src$service$$($node$jscomp$50$$, $topWin$jscomp$4$$).parentElement;
    if ("AMP-AD" == $frameParent$$.nodeName) {
      return String($frameParent$$.$ia$());
    }
  } catch ($e$185$$) {
  }
  return null;
};
_.$ViewportBindingIosEmbedShadowRoot_$$module$src$service$viewport$viewport_binding_ios_embed_sd$$.prototype.$getRootClientRectAsync$ = _.$JSCompiler_unstubMethod$$(42, function() {
  return window.Promise.resolve(null);
});
_.$ViewportBindingIosEmbedWrapper_$$module$src$service$viewport$viewport_binding_ios_embed_wrapper$$.prototype.$getRootClientRectAsync$ = _.$JSCompiler_unstubMethod$$(41, function() {
  return window.Promise.resolve(null);
});
_.$ViewportBindingNatural_$$module$src$service$viewport$viewport_binding_natural$$.prototype.$getRootClientRectAsync$ = _.$JSCompiler_unstubMethod$$(40, function() {
  return window.Promise.resolve(null);
});
_.$BaseElement$$module$src$base_element$$.prototype.$measureElement$ = _.$JSCompiler_unstubMethod$$(26, function($measurer$$) {
  return this.element.$getResources$().$measureElement$($measurer$$);
});
_.$Resources$$module$src$service$resources_impl$$.prototype.$measureElement$ = _.$JSCompiler_unstubMethod$$(25, function($measurer$jscomp$2$$) {
  return _.$JSCompiler_StaticMethods_measurePromise$$(this.$vsync_$, $measurer$jscomp$2$$);
});
_.$BaseElement$$module$src$base_element$$.prototype.$attemptChangeSize$ = _.$JSCompiler_unstubMethod$$(24, function($newHeight$jscomp$2$$, $newWidth$$) {
  return this.element.$getResources$().$attemptChangeSize$(this.element, $newHeight$jscomp$2$$, $newWidth$$);
});
_.$Resources$$module$src$service$resources_impl$$.prototype.$attemptChangeSize$ = _.$JSCompiler_unstubMethod$$(23, function($element$jscomp$132$$, $newHeight$jscomp$6$$, $newWidth$jscomp$4$$, $opt_newMargins$jscomp$3$$) {
  var $$jscomp$this$jscomp$88$$ = this;
  return new window.Promise(function($resolve$jscomp$29$$, $reject$jscomp$15$$) {
    _.$JSCompiler_StaticMethods_scheduleChangeSize_$$($$jscomp$this$jscomp$88$$, _.$Resource$$module$src$service$resource$forElementOptional$$($element$jscomp$132$$), $newHeight$jscomp$6$$, $newWidth$jscomp$4$$, $opt_newMargins$jscomp$3$$, !1, function($element$jscomp$132$$) {
      $element$jscomp$132$$ ? $resolve$jscomp$29$$() : $reject$jscomp$15$$(Error("changeSize attempt denied"));
    });
  });
});
_.$BaseElement$$module$src$base_element$$.prototype.$attemptCollapse$ = _.$JSCompiler_unstubMethod$$(22, function() {
  return this.element.$getResources$().$attemptCollapse$(this.element);
});
_.$Resources$$module$src$service$resources_impl$$.prototype.$attemptCollapse$ = _.$JSCompiler_unstubMethod$$(21, function($element$jscomp$138$$) {
  var $$jscomp$this$jscomp$91$$ = this;
  return new window.Promise(function($resolve$jscomp$30$$, $reject$jscomp$16$$) {
    _.$JSCompiler_StaticMethods_scheduleChangeSize_$$($$jscomp$this$jscomp$91$$, _.$Resource$$module$src$service$resource$forElementOptional$$($element$jscomp$138$$), 0, 0, void 0, !1, function($$jscomp$this$jscomp$91$$) {
      $$jscomp$this$jscomp$91$$ ? (_.$JSCompiler_StaticMethods_completeCollapse$$(_.$Resource$$module$src$service$resource$forElementOptional$$($element$jscomp$138$$)), $resolve$jscomp$30$$()) : $reject$jscomp$16$$(Error("collapse attempt denied"));
    });
  });
});
_.$BaseElement$$module$src$base_element$$.prototype.$updateInViewport$ = _.$JSCompiler_unstubMethod$$(20, function($elements$jscomp$8$$, $inLocalViewport$$) {
  this.element.$getResources$().$updateInViewport$(this.element, $elements$jscomp$8$$, $inLocalViewport$$);
});
_.$Resources$$module$src$service$resources_impl$$.prototype.$updateInViewport$ = _.$JSCompiler_unstubMethod$$(19, function($parentElement$jscomp$5$$, $subElements$jscomp$5$$, $inLocalViewport$jscomp$1$$) {
  $JSCompiler_StaticMethods_updateInViewportForSubresources_$$(this, _.$Resource$$module$src$service$resource$forElementOptional$$($parentElement$jscomp$5$$), _.$elements_$$module$src$service$resources_impl$$($subElements$jscomp$5$$), $inLocalViewport$jscomp$1$$);
});
_.$BaseElement$$module$src$base_element$$.prototype.$getIntersectionElementLayoutBox$ = _.$JSCompiler_unstubMethod$$(10, function() {
  return this.$getLayoutBox$();
});
_.$BaseElement$$module$src$base_element$$.prototype.$getRealChildren$ = _.$JSCompiler_unstubMethod$$(9, function() {
  return this.element.$getRealChildren$();
});
_.$SubscriptionApi$$module$src$iframe_helper$$.prototype.$destroy$ = function() {
  this.$unlisten_$();
  this.$D$.length = 0;
};
_.$DEFAULT_THRESHOLD$$module$src$intersection_observer_polyfill$$ = [0, 0.05, 0.1, 0.15, 0.2, 0.25, 0.3, 0.35, 0.4, 0.45, 0.5, 0.55, 0.6, 0.65, 0.7, 0.75, 0.8, 0.85, 0.9, 0.95, 1];
_.$JSCompiler_prototypeAlias$$ = _.$IntersectionObserverPolyfill$$module$src$intersection_observer_polyfill$$.prototype;
_.$JSCompiler_prototypeAlias$$.disconnect = function() {
  this.$D$.length = 0;
  $JSCompiler_StaticMethods_disconnectMutationObserver_$$(this);
};
_.$JSCompiler_prototypeAlias$$.observe = function($element$jscomp$94$$) {
  for (var $i$jscomp$77_newState$$ = 0; $i$jscomp$77_newState$$ < this.$D$.length; $i$jscomp$77_newState$$++) {
    if (this.$D$[$i$jscomp$77_newState$$].element === $element$jscomp$94$$) {
      _.$dev$$module$src$log$$().$Log$$module$src$log_prototype$warn$("INTERSECTION-OBSERVER", "should observe same element once");
      return;
    }
  }
  $i$jscomp$77_newState$$ = {element:$element$jscomp$94$$, $currentThresholdSlot$:0};
  if (this.$I$) {
    var $ampdoc$jscomp$27_change$jscomp$1$$ = $JSCompiler_StaticMethods_getValidIntersectionChangeEntry_$$(this, $i$jscomp$77_newState$$, this.$I$, this.$K$);
    $ampdoc$jscomp$27_change$jscomp$1$$ && this.$J$([$ampdoc$jscomp$27_change$jscomp$1$$]);
  }
  $ampdoc$jscomp$27_change$jscomp$1$$ = _.$getAmpdoc$$module$src$service$$($element$jscomp$94$$);
  $ampdoc$jscomp$27_change$jscomp$1$$.$win$.MutationObserver && !this.$F$ && (this.$G$ = new _.$Pass$$module$src$pass$$($ampdoc$jscomp$27_change$jscomp$1$$.$win$, this.$handleMutationObserverPass_$.bind(this, $element$jscomp$94$$)), this.$F$ = new $ampdoc$jscomp$27_change$jscomp$1$$.$win$.MutationObserver(this.$handleMutationObserverNotification_$.bind(this)), this.$F$.observe($ampdoc$jscomp$27_change$jscomp$1$$.$win$.document, {attributes:!0, attributeFilter:["hidden"], subtree:!0}));
  this.$D$.push($i$jscomp$77_newState$$);
};
_.$JSCompiler_prototypeAlias$$.unobserve = function($element$jscomp$95$$) {
  for (var $i$jscomp$78$$ = 0; $i$jscomp$78$$ < this.$D$.length; $i$jscomp$78$$++) {
    if (this.$D$[$i$jscomp$78$$].element === $element$jscomp$95$$) {
      this.$D$.splice($i$jscomp$78$$, 1);
      0 >= this.$D$.length && $JSCompiler_StaticMethods_disconnectMutationObserver_$$(this);
      return;
    }
  }
  _.$dev$$module$src$log$$().$Log$$module$src$log_prototype$warn$("INTERSECTION-OBSERVER", "unobserve non-observed element");
};
_.$JSCompiler_prototypeAlias$$.$handleMutationObserverNotification_$ = function() {
  -1 != this.$G$.$D$ || _.$JSCompiler_StaticMethods_schedule$$(this.$G$, 16);
};
_.$JSCompiler_prototypeAlias$$.$handleMutationObserverPass_$ = function($element$jscomp$97$$) {
  var $$jscomp$this$jscomp$34$$ = this, $viewport$jscomp$1$$ = _.$Services$$module$src$services$viewportForDoc$$($element$jscomp$97$$);
  $JSCompiler_StaticMethods_onNextPass$$(_.$Services$$module$src$services$resourcesForDoc$$($element$jscomp$97$$), function() {
    _.$JSCompiler_StaticMethods_IntersectionObserverPolyfill$$module$src$intersection_observer_polyfill_prototype$tick$$($$jscomp$this$jscomp$34$$, _.$JSCompiler_StaticMethods_getRect$$($viewport$jscomp$1$$));
  });
};
_.$IntersectionObserverApi$$module$src$intersection_observer_polyfill$$.prototype.$onViewportCallback$ = function($inViewport$$) {
  this.$G$ = $inViewport$$;
};
_.$IntersectionObserverApi$$module$src$intersection_observer_polyfill$$.prototype.$destroy$ = function() {
  this.$I$ = !1;
  this.$intersectionObserver_$.disconnect();
  this.$intersectionObserver_$ = null;
  this.$D$ && (this.$D$(), this.$D$ = null);
  this.$J$.$destroy$();
  this.$J$ = null;
};
var $count$$module$src$3p_frame$$ = {};
_.$VideoEvents$$module$src$video_interface$$ = {$REGISTERED$:"registered", $LOAD$:"load", $LOADEDMETADATA$:"loadedmetadata", $PLAYING$:"playing", $PAUSE$:"pause", $ENDED$:"ended", $MUTED$:"muted", $UNMUTED$:"unmuted", $VISIBILITY$:"amp:video:visibility", $RELOAD$:"reloaded", $AD_START$:"ad_start", $AD_END$:"ad_end"};
var $isAutoplaySupported$$module$src$utils$video$$ = null;
$PositionObserverWorker$$module$src$service$position_observer$position_observer_worker$$.prototype.update = function($opt_force$jscomp$5_viewportSize$jscomp$2$$) {
  var $$jscomp$this$jscomp$183$$ = this;
  if (!$opt_force$jscomp$5_viewportSize$jscomp$2$$) {
    if (0 != this.$turn$) {
      this.$turn$--;
      return;
    }
    0 == this.$G$ && (this.$turn$ = 4);
  }
  $opt_force$jscomp$5_viewportSize$jscomp$2$$ = this.$viewport_$.$getSize$();
  var $viewportBox$jscomp$2$$ = _.$layoutRectLtwh$$module$src$layout_rect$$(0, 0, $opt_force$jscomp$5_viewportSize$jscomp$2$$.width, $opt_force$jscomp$5_viewportSize$jscomp$2$$.height);
  _.$JSCompiler_StaticMethods_getClientRectAsync$$(this.$viewport_$, this.element).then(function($opt_force$jscomp$5_viewportSize$jscomp$2$$) {
    $opt_force$jscomp$5_viewportSize$jscomp$2$$ = {$positionRect$:$opt_force$jscomp$5_viewportSize$jscomp$2$$, $viewportRect$:$viewportBox$jscomp$2$$, $relativePos$:""};
    var $elementBox_position$jscomp$inline_1837$$ = $$jscomp$this$jscomp$183$$.$D$;
    $elementBox_position$jscomp$inline_1837$$ && $layoutRectEquals$$module$src$layout_rect$$($elementBox_position$jscomp$inline_1837$$.$positionRect$, $opt_force$jscomp$5_viewportSize$jscomp$2$$.$positionRect$) && $layoutRectEquals$$module$src$layout_rect$$($elementBox_position$jscomp$inline_1837$$.$viewportRect$, $opt_force$jscomp$5_viewportSize$jscomp$2$$.$viewportRect$) || ($elementBox_position$jscomp$inline_1837$$ = $opt_force$jscomp$5_viewportSize$jscomp$2$$.$positionRect$, $opt_force$jscomp$5_viewportSize$jscomp$2$$.$relativePos$ = 
    _.$layoutRectsRelativePos$$module$src$layout_rect$$($elementBox_position$jscomp$inline_1837$$, $opt_force$jscomp$5_viewportSize$jscomp$2$$.$viewportRect$), _.$layoutRectsOverlap$$module$src$layout_rect$$($elementBox_position$jscomp$inline_1837$$, $opt_force$jscomp$5_viewportSize$jscomp$2$$.$viewportRect$) ? ($$jscomp$this$jscomp$183$$.$D$ = $opt_force$jscomp$5_viewportSize$jscomp$2$$, $$jscomp$this$jscomp$183$$.$F$($opt_force$jscomp$5_viewportSize$jscomp$2$$)) : $$jscomp$this$jscomp$183$$.$D$ && 
    ($$jscomp$this$jscomp$183$$.$D$ = null, $opt_force$jscomp$5_viewportSize$jscomp$2$$.$positionRect$ = null, $$jscomp$this$jscomp$183$$.$F$($opt_force$jscomp$5_viewportSize$jscomp$2$$)));
  });
};
$PositionObserver$$module$src$service$position_observer$position_observer_impl$$.prototype.observe = function($element$jscomp$213$$, $fidelity$jscomp$1$$, $handler$jscomp$32$$) {
  var $$jscomp$this$jscomp$185$$ = this, $worker$$ = new $PositionObserverWorker$$module$src$service$position_observer$position_observer_worker$$(this.$ampdoc_$, $element$jscomp$213$$, $fidelity$jscomp$1$$, $handler$jscomp$32$$);
  this.$D$.push($worker$$);
  this.$G$ || $JSCompiler_StaticMethods_startCallback_$$(this);
  $worker$$.update();
  return function() {
    for (var $element$jscomp$213$$ = 0; $element$jscomp$213$$ < $$jscomp$this$jscomp$185$$.$D$.length; $element$jscomp$213$$++) {
      if ($$jscomp$this$jscomp$185$$.$D$[$element$jscomp$213$$] == $worker$$) {
        $$jscomp$this$jscomp$185$$.$D$.splice($element$jscomp$213$$, 1);
        0 == $$jscomp$this$jscomp$185$$.$D$.length && $JSCompiler_StaticMethods_stopCallback_$$($$jscomp$this$jscomp$185$$);
        break;
      }
    }
  };
};
$PositionObserver$$module$src$service$position_observer$position_observer_impl$$.prototype.unobserve = function($element$jscomp$214$$) {
  for (var $i$jscomp$133$$ = 0; $i$jscomp$133$$ < this.$D$.length; $i$jscomp$133$$++) {
    if (this.$D$[$i$jscomp$133$$].element == $element$jscomp$214$$) {
      this.$D$.splice($i$jscomp$133$$, 1);
      0 == this.$D$.length && $JSCompiler_StaticMethods_stopCallback_$$(this);
      return;
    }
  }
  _.$dev$$module$src$log$$().error("POSITION_OBSERVER", "cannot unobserve unobserved element");
};
var $_template$$module$src$service$video$autoplay$$ = ["<i-amphtml-video-mask class=i-amphtml-fill-content role=button></i-amphtml-video-mask>"], $_template2$$module$src$service$video$autoplay$$ = ["<i-amphtml-video-icon class=amp-video-eq><div class=amp-video-eq-col><div class=amp-video-eq-filler></div><div class=amp-video-eq-filler></div></div></i-amphtml-video-icon>"], $renderOrCloneInteractionOverlay$$module$src$service$video$autoplay$$ = $renderOrClone$$module$src$service$video$autoplay$$($renderInteractionOverlay$$module$src$service$video$autoplay$$), 
$renderOrCloneIcon$$module$src$service$video$autoplay$$ = $renderOrClone$$module$src$service$video$autoplay$$($renderIcon$$module$src$service$video$autoplay$$);
$Autoplay$$module$src$service$video$autoplay$$.prototype.register = function($video$jscomp$1$$) {
  var $$jscomp$this$jscomp$189$$ = this;
  $video$jscomp$1$$.$isInteractive$() && $video$jscomp$1$$.$hideControls$();
  return this.$G$().then(function($JSCompiler_inline_result$jscomp$536_isSupported$$) {
    if (!$JSCompiler_inline_result$jscomp$536_isSupported$$) {
      return $video$jscomp$1$$.$isInteractive$() && $video$jscomp$1$$.$showControls$(), null;
    }
    $JSCompiler_inline_result$jscomp$536_isSupported$$ = new $AutoplayEntry$$module$src$service$video$autoplay$$($$jscomp$this$jscomp$189$$.$ampdoc_$, $$jscomp$this$jscomp$189$$.$F$(), $video$jscomp$1$$);
    $$jscomp$this$jscomp$189$$.$D$.push($JSCompiler_inline_result$jscomp$536_isSupported$$);
    return $JSCompiler_inline_result$jscomp$536_isSupported$$;
  });
};
$AutoplayEntry$$module$src$service$video$autoplay$$.prototype.$F$ = function($icon$jscomp$2$$, $isPlaying$jscomp$1$$) {
  this.video.$mutateElement$(function() {
    return $icon$jscomp$2$$.classList.toggle("amp-video-eq-play", $isPlaying$jscomp$1$$);
  });
};
_.$VideoServiceSync$$module$src$service$video_service_sync_impl$$.prototype.register = function($video$jscomp$5$$) {
  this.$D$.then(function($impl$jscomp$10$$) {
    return $impl$jscomp$10$$.register($video$jscomp$5$$);
  });
  $JSCompiler_StaticMethods_maybeInstallAutoplay_$$(this, $video$jscomp$5$$);
  new $VideoEntry$$module$src$service$video_service_sync_impl$$($video$jscomp$5$$);
};
_.$VideoServiceSync$$module$src$service$video_service_sync_impl$$.prototype.$VideoManager$$module$src$service$video_manager_impl_prototype$getAnalyticsDetails$ = function() {
  return this.$D$.then(function($impl$jscomp$11$$) {
    return $impl$jscomp$11$$.$G$();
  });
};
_.$VideoServiceSync$$module$src$service$video_service_sync_impl$$.prototype.$isMuted$ = _.$JSCompiler_stubMethod$$(51);
_.$VideoServiceSync$$module$src$service$video_service_sync_impl$$.prototype.$getPlayingState$ = function() {
  _.$dev$$module$src$log$$().$Log$$module$src$log_prototype$warn$("video-service", "getPlayingState is not implemented");
  return "paused";
};
_.$EMPTY_METADATA$$module$src$mediasession_helper$$ = {title:"", artist:"", album:"", artwork:[{src:""}]};
_.$JSCompiler_prototypeAlias$$ = _.$VideoManager$$module$src$service$video_manager_impl$$.prototype;
_.$JSCompiler_prototypeAlias$$.$dispose$ = function() {
  if (this.$D$) {
    for (var $i$jscomp$137$$ = 0; $i$jscomp$137$$ < this.$D$.length; $i$jscomp$137$$++) {
      this.$D$[$i$jscomp$137$$].$dispose$();
    }
  }
};
_.$JSCompiler_prototypeAlias$$.register = function($video$jscomp$11$$) {
  $JSCompiler_StaticMethods_VideoManager$$module$src$service$video_manager_impl_prototype$registerCommonActions_$$($video$jscomp$11$$);
  if ($video$jscomp$11$$.$supportsPlatform$()) {
    this.$D$ = this.$D$ || [];
    var $element$jscomp$222_entry$jscomp$11$$ = new _.$VideoEntry$$module$src$service$video_manager_impl$$(this, $video$jscomp$11$$);
    $JSCompiler_StaticMethods_maybeInstallVisibilityObserver_$$(this, $element$jscomp$222_entry$jscomp$11$$);
    this.$D$.push($element$jscomp$222_entry$jscomp$11$$);
    $element$jscomp$222_entry$jscomp$11$$ = $element$jscomp$222_entry$jscomp$11$$.video.element;
    $element$jscomp$222_entry$jscomp$11$$.$D$(_.$VideoEvents$$module$src$video_interface$$.$REGISTERED$);
    $setVideoComponentClassname$$module$src$service$video_service_sync_impl$$($element$jscomp$222_entry$jscomp$11$$);
    _.$JSCompiler_StaticMethods_signal$$($video$jscomp$11$$.signals(), _.$VideoEvents$$module$src$video_interface$$.$REGISTERED$);
    $element$jscomp$222_entry$jscomp$11$$.classList.add("i-amphtml-video-interface");
  }
};
_.$JSCompiler_prototypeAlias$$.$VideoManager$$module$src$service$video_manager_impl_prototype$getAnalyticsDetails$ = function($JSCompiler_inline_result$jscomp$540_entry$jscomp$14_videoElement$$) {
  a: {
    for (var $i$jscomp$inline_1870$$ = 0; $i$jscomp$inline_1870$$ < this.$D$.length; $i$jscomp$inline_1870$$++) {
      var $entry$jscomp$inline_1871$$ = this.$D$[$i$jscomp$inline_1870$$];
      if ($entry$jscomp$inline_1871$$.video.element === $JSCompiler_inline_result$jscomp$540_entry$jscomp$14_videoElement$$) {
        $JSCompiler_inline_result$jscomp$540_entry$jscomp$14_videoElement$$ = $entry$jscomp$inline_1871$$;
        break a;
      }
    }
    _.$dev$$module$src$log$$().error("video-manager", "video is not registered to this video manager");
    $JSCompiler_inline_result$jscomp$540_entry$jscomp$14_videoElement$$ = null;
  }
  return $JSCompiler_inline_result$jscomp$540_entry$jscomp$14_videoElement$$ ? $JSCompiler_StaticMethods_VideoEntry$$module$src$service$video_manager_impl_prototype$getAnalyticsDetails$$($JSCompiler_inline_result$jscomp$540_entry$jscomp$14_videoElement$$) : window.Promise.resolve();
};
_.$JSCompiler_prototypeAlias$$.$getPlayingState$ = function($video$jscomp$14$$) {
  return _.$JSCompiler_StaticMethods_getEntryForVideo_$$(this, $video$jscomp$14$$).$getPlayingState$();
};
_.$JSCompiler_prototypeAlias$$.$isMuted$ = _.$JSCompiler_stubMethod$$(50);
_.$VideoEntry$$module$src$service$video_manager_impl$$.prototype.$dispose$ = function() {
  this.$U$().stop();
};
_.$VideoEntry$$module$src$service$video_manager_impl$$.prototype.$isMuted$ = _.$JSCompiler_stubMethod$$(49);
_.$VideoEntry$$module$src$service$video_manager_impl$$.prototype.$getPlayingState$ = function() {
  return this.$D$ ? this.$D$ && this.$W$ && null == this.video.signals().get("user-interacted") ? "playing_auto" : "playing_manual" : "paused";
};
$AutoFullscreenManager$$module$src$service$video_manager_impl$$.prototype.register = function($entry$jscomp$16_video$jscomp$24$$) {
  $entry$jscomp$16_video$jscomp$24$$ = $entry$jscomp$16_video$jscomp$24$$.video;
  var $element$jscomp$231$$ = $entry$jscomp$16_video$jscomp$24$$.element;
  if ("video" == _.$getInternalVideoElementFor$$module$src$utils$video$$($element$jscomp$231$$).tagName.toLowerCase()) {
    var $JSCompiler_inline_result$jscomp$547_platform$jscomp$inline_1911$$ = !0;
  } else {
    $JSCompiler_inline_result$jscomp$547_platform$jscomp$inline_1911$$ = _.$Services$$module$src$services$platformFor$$(this.$ampdoc_$.$win$), $JSCompiler_inline_result$jscomp$547_platform$jscomp$inline_1911$$ = _.$JSCompiler_StaticMethods_isIos$$($JSCompiler_inline_result$jscomp$547_platform$jscomp$inline_1911$$) || _.$JSCompiler_StaticMethods_isSafari$$($JSCompiler_inline_result$jscomp$547_platform$jscomp$inline_1911$$) ? !!{"amp-dailymotion":!0, "amp-ima-video":!0}[$element$jscomp$231$$.tagName.toLowerCase()] : 
    !0;
  }
  $JSCompiler_inline_result$jscomp$547_platform$jscomp$inline_1911$$ && (this.$I$.push($entry$jscomp$16_video$jscomp$24$$), _.$internalListenImplementation$$module$src$event_helper_listen$$($element$jscomp$231$$, _.$VideoEvents$$module$src$video_interface$$.$PAUSE$, this.$G$, void 0), _.$internalListenImplementation$$module$src$event_helper_listen$$($element$jscomp$231$$, _.$VideoEvents$$module$src$video_interface$$.$PLAYING$, this.$G$, void 0), _.$internalListenImplementation$$module$src$event_helper_listen$$($element$jscomp$231$$, 
  _.$VideoEvents$$module$src$video_interface$$.$ENDED$, this.$G$, void 0), $entry$jscomp$16_video$jscomp$24$$.signals().whenSignal("user-interacted").then(this.$G$), $JSCompiler_StaticMethods_selectBestCenteredInPortrait_$$(this));
};
$AnalyticsPercentageTracker$$module$src$service$video_manager_impl$$.prototype.start = function() {
  var $$jscomp$this$jscomp$208$$ = this, $element$jscomp$233$$ = this.$D$.video.element;
  this.stop();
  this.$unlisteners_$ = this.$unlisteners_$ || [];
  this.$unlisteners_$.push(_.$listenOnce$$module$src$event_helper$$($element$jscomp$233$$, _.$VideoEvents$$module$src$video_interface$$.$LOADEDMETADATA$, function() {
    $JSCompiler_StaticMethods_hasDuration_$$($$jscomp$this$jscomp$208$$) && $JSCompiler_StaticMethods_calculate_$$($$jscomp$this$jscomp$208$$, $$jscomp$this$jscomp$208$$.$F$);
  }), _.$listen$$module$src$event_helper$$($element$jscomp$233$$, _.$VideoEvents$$module$src$video_interface$$.$ENDED$, function() {
    $JSCompiler_StaticMethods_hasDuration_$$($$jscomp$this$jscomp$208$$) && $JSCompiler_StaticMethods_maybeTrigger_$$($$jscomp$this$jscomp$208$$, 100);
  }));
};
$AnalyticsPercentageTracker$$module$src$service$video_manager_impl$$.prototype.stop = function() {
  if (this.$unlisteners_$) {
    for (; 0 < this.$unlisteners_$.length;) {
      this.$unlisteners_$.pop().call();
    }
    this.$F$++;
  }
};
$AnalyticsPercentageTracker$$module$src$service$video_manager_impl$$.prototype.$I$ = function($args$jscomp$16$$) {
  for (var $$jscomp$restParams$jscomp$3$$ = [], $$jscomp$restIndex$jscomp$3$$ = 0; $$jscomp$restIndex$jscomp$3$$ < arguments.length; ++$$jscomp$restIndex$jscomp$3$$) {
    $$jscomp$restParams$jscomp$3$$[$$jscomp$restIndex$jscomp$3$$] = arguments[$$jscomp$restIndex$jscomp$3$$];
  }
  _.$user$$module$src$log$$().$Log$$module$src$log_prototype$warn$.apply(_.$user$$module$src$log$$(), ["video-manager"].concat($$jscomp$restParams$jscomp$3$$));
};
$CustomEventReporter$$module$src$extension_analytics$$.prototype.$trigger$ = function($eventType$jscomp$22$$, $opt_vars$jscomp$2$$) {
  _.$triggerAnalyticsEvent$$module$src$analytics$$(this.$D$, "sandbox-" + this.$F$ + "-" + $eventType$jscomp$22$$, $opt_vars$jscomp$2$$);
};
_.$CustomEventReporterBuilder$$module$src$extension_analytics$$.prototype.track = function($eventType$jscomp$24$$, $request$jscomp$9$$) {
  $request$jscomp$9$$ = _.$isArray$$module$src$types$$($request$jscomp$9$$) ? $request$jscomp$9$$ : [$request$jscomp$9$$];
  for (var $requestList$$ = [], $i$jscomp$142$$ = 0; $i$jscomp$142$$ < $request$jscomp$9$$.length; $i$jscomp$142$$++) {
    var $requestName$$ = $eventType$jscomp$24$$ + "-request-" + $i$jscomp$142$$;
    this.$config_$.requests[$requestName$$] = $request$jscomp$9$$[$i$jscomp$142$$];
    $requestList$$.push($requestName$$);
  }
  this.$config_$.triggers[$eventType$jscomp$24$$] = {on:$eventType$jscomp$24$$, request:$requestList$$};
  return this;
};
_.$CustomEventReporterBuilder$$module$src$extension_analytics$$.prototype.$build$ = function() {
  var $report$$ = new $CustomEventReporter$$module$src$extension_analytics$$(this.$D$, this.$config_$);
  this.$config_$ = null;
  return $report$$;
};
_.$CONTAINERS$$module$src$ad_helper$$ = {"AMP-FX-FLYING-CARPET":!0, "AMP-LIGHTBOX":!0, "AMP-STICKY-AD":!0, "AMP-LIGHTBOX-GALLERY":!0};
_.$IFRAME_TRANSPORTS$$module$extensions$amp_analytics$0_1$iframe_transport_vendors$$ = {bg:"https://tpc.googlesyndication.com/b4a/b4a-runner.html", moat:"https://z.moatads.com/ampanalytics093284/iframe.html"};

})});
