var global=self;self.AMP=self.AMP||[];try{(function(_){
/*
 https://mths.be/cssescape v1.5.1 by @mathias | MIT license */
var $escaper$$module$third_party$css_escape$css_escape$$, $tryDecodeUriComponent_$$module$src$url_try_decode_uri_component$$, $isUserErrorMessage$$module$src$log$$, $overrideLogLevel$$module$src$log$$, $Log$$module$src$log$$, $JSCompiler_StaticMethods_getLevel_$$, $JSCompiler_StaticMethods_msg_$$, $JSCompiler_StaticMethods_prepareError_$$, $createErrorVargs$$module$src$log$$, $getUserLogger$$module$src$log$$, $waitForBody$$module$src$dom$$, $closestNode$$module$src$dom$$, $lastChildElement$$module$src$dom$$, 
$childNodes$$module$src$dom$$, $isScopeSelectorSupported$$module$src$dom$$, $scopedQuerySelectionFallback$$module$src$dom$$, $recreateNonProtoObject$$module$src$json$$, $hasOwnProperty$$module$src$json$$, $parseUrlWithA$$module$src$url$$, $removeAmpJsParamsFromUrl$$module$src$url$$, $removeAmpJsParamsFromSearch$$module$src$url$$, $getCookie$$module$src$cookies$$, $trySetCookie$$module$src$cookies$$, $getExperimentTogglesFromCookie$$module$src$experiments$$, $includes$$module$src$polyfills$array_includes$$, 
$rethrowAsync$$module$src$polyfills$custom_elements$$, $CustomElementRegistry$$module$src$polyfills$custom_elements$$, $Registry$$module$src$polyfills$custom_elements$$, $JSCompiler_StaticMethods_getByName$$, $JSCompiler_StaticMethods_getByConstructor$$, $JSCompiler_StaticMethods_Registry$$module$src$polyfills$custom_elements_prototype$upgrade$$, $JSCompiler_StaticMethods_upgradeSelf$$, $JSCompiler_StaticMethods_queryAll_$$, $JSCompiler_StaticMethods_upgradeSelf_$$, $JSCompiler_StaticMethods_connectedCallback_$$, 
$JSCompiler_StaticMethods_observe_$$, $JSCompiler_StaticMethods_handleRecords_$$, $installPatches$$module$src$polyfills$custom_elements$$, $polyfill$$module$src$polyfills$custom_elements$$, $documentContainsPolyfill$$module$src$polyfills$document_contains$$, $domTokenListTogglePolyfill$$module$src$polyfills$domtokenlist_toggle$$, $fetchPolyfill$$module$src$polyfills$fetch$$, $createXhrRequest$$module$src$polyfills$fetch$$, $FetchResponse$$module$src$polyfills$fetch$$, $normalizeMethod$$module$src$polyfills$fetch$$, 
$FetchResponseHeaders$$module$src$polyfills$fetch$$, $Response$$module$src$polyfills$fetch$$, $sign$$module$src$polyfills$math_sign$$, $assign$$module$src$polyfills$object_assign$$, $values$$module$src$polyfills$object_values$$, $Promise$$module$promise_pjs$promise$$, $Promise$$module$promise_pjs$promise$resolve$$, $Promise$$module$promise_pjs$promise$reject$$, $Promise$$module$promise_pjs$promise$all$$, $Promise$$module$promise_pjs$promise$race$$, $FulfilledPromise$$module$promise_pjs$promise$$, 
$RejectedPromise$$module$promise_pjs$promise$$, $PendingPromise$$module$promise_pjs$promise$$, $Deferred$$module$promise_pjs$promise$$, $adopt$$module$promise_pjs$promise$$, $adopter$$module$promise_pjs$promise$$, $noop$$module$promise_pjs$promise$$, $isFunction$$module$promise_pjs$promise$$, $each$$module$promise_pjs$promise$$, $tryCatchDeferred$$module$promise_pjs$promise$$, $doResolve$$module$promise_pjs$promise$$, $getServicePromiseOrNullForDoc$$module$src$service$$, $getAmpdocServiceHolder$$module$src$service$$, 
$getServiceInternal$$module$src$service$$, $registerServiceInternal$$module$src$service$$, $getServicePromiseInternal$$module$src$service$$, $getServicePromiseOrNullInternal$$module$src$service$$, $getServices$$module$src$service$$, $disposeServiceInternal$$module$src$service$$, $isServiceRegistered$$module$src$service$$, $extensionScriptsInNode$$module$src$element_service$$, $isExtensionScriptInNode$$module$src$element_service$$, $waitForExtensionIfPresent$$module$src$element_service$$, $getElementServicePromiseOrNull$$module$src$element_service$$, 
$detectEvtListenerOptsSupport$$module$src$event_helper_listen$$, $html$$module$src$static_template$$, $parseLayout$$module$src$layout$$, $isFormDataWrapper$$module$src$form_data_wrapper$$, $waitForServices$$module$src$render_delaying_services$$, $includedServices$$module$src$render_delaying_services$$, $getExistingStyleElement$$module$src$style_installer$$, $installCssTransformer$$module$src$style_installer$$, $maybeTransform$$module$src$style_installer$$, $setBodyVisibleStyles$$module$src$style_installer$$, 
$PriorityQueue$$module$src$utils$priority_queue$$, $JSCompiler_StaticMethods_PriorityQueue$$module$src$utils$priority_queue_prototype$peek$$, $JSCompiler_StaticMethods_runTask_$$, $StartupTask$$module$src$chunk$$, $Chunks$$module$src$chunk$$, $JSCompiler_StaticMethods_nextTask_$$, $JSCompiler_StaticMethods_executeAsap_$$, $JSCompiler_StaticMethods_Chunks$$module$src$chunk_prototype$schedule_$$, $onIdle$$module$src$chunk$$, $exponentialBackoff$$module$src$exponential_backoff$$, $reportingBackoff$$module$src$error$$, 
$isBlockedByConsent$$module$src$error$$, $onError$$module$src$error$$, $reportErrorToServerOrViewer$$module$src$error$$, $maybeReportErrorToViewer$$module$src$error$$, $getErrorReportData$$module$src$error$$, $detectNonAmpJs$$module$src$error$$, $detectJsEngineFromStack$$module$src$error$$, $isDocumentComplete$$module$src$document_ready$$, $onDocumentReady$$module$src$document_ready$$, $onDocumentState$$module$src$document_ready$$, $whenDocumentComplete$$module$src$document_ready$$, $maybeTimeoutFonts$$module$src$font_stylesheet_timeout$$, 
$timeoutFontFaces$$module$src$font_stylesheet_timeout$$, $handleReplaceUrl$$module$src$impression$$, $isTrustedReferrer$$module$src$impression$$, $handleClickUrl$$module$src$impression$$, $invoke$$module$src$impression$$, $shouldAppendExtraParams$$module$src$impression$$, $PullToRefreshBlocker$$module$src$pull_to_refresh$$, $JSCompiler_StaticMethods_PullToRefreshBlocker$$module$src$pull_to_refresh_prototype$stopTracking_$$, $PreconnectService$$module$src$preconnect$$, $JSCompiler_StaticMethods_preconnectPolyfill_$$, 
$Preconnect$$module$src$preconnect$$, $JSCompiler_StaticMethods_getViewer_$$, $installGlobalSubmitListenerForDoc$$module$src$document_submit$$, $onDocumentFormSubmit_$$module$src$document_submit$$, $Input$$module$src$input$$, $JSCompiler_StaticMethods_onTouchDetected$$, $JSCompiler_StaticMethods_onMouseDetected$$, $JSCompiler_StaticMethods_onKeyboardStateChanged$$, $ActionInvocation$$module$src$service$action_impl$$, $ActionService$$module$src$service$action_impl$$, $JSCompiler_StaticMethods_addEvent$$, 
$JSCompiler_StaticMethods_addGlobalMethodHandler$$, $JSCompiler_StaticMethods_invoke_$$, $JSCompiler_StaticMethods_queryWhitelist_$$, $JSCompiler_StaticMethods_addTargetPropertiesAsDetail_$$, $isActionWhitelisted_$$module$src$service$action_impl$$, $DeferredEvent$$module$src$service$action_impl$$, $notImplemented$$module$src$service$action_impl$$, $argValueForTokens$$module$src$service$action_impl$$, $dereferenceExprsInArgs$$module$src$service$action_impl$$, $assertActionForParser$$module$src$service$action_impl$$, 
$assertTokenForParser$$module$src$service$action_impl$$, $ParserTokenizer$$module$src$service$action_impl$$, $JSCompiler_StaticMethods_ParserTokenizer$$module$src$service$action_impl_prototype$next_$$, $isNum$$module$src$service$action_impl$$, $Xhr$$module$src$service$xhr_impl$$, $BatchedXhr$$module$src$service$batched_xhr_impl$$, $CacheCidApi$$module$src$service$cache_cid_api$$, $JSCompiler_StaticMethods_CacheCidApi$$module$src$service$cache_cid_api_prototype$getScopedCid$$, $JSCompiler_StaticMethods_CacheCidApi$$module$src$service$cache_cid_api_prototype$fetchCid_$$, 
$JSCompiler_StaticMethods_scopeCid_$$, $GoogleCidApi$$module$src$service$cid_api$$, $JSCompiler_StaticMethods_GoogleCidApi$$module$src$service$cid_api_prototype$getScopedCid$$, $JSCompiler_StaticMethods_GoogleCidApi$$module$src$service$cid_api_prototype$fetchCid_$$, $JSCompiler_StaticMethods_persistToken_$$, $ViewerCidApi$$module$src$service$viewer_cid_api$$, $JSCompiler_StaticMethods_ViewerCidApi$$module$src$service$viewer_cid_api_prototype$getScopedCid$$, $Cid$$module$src$service$cid_impl$$, $JSCompiler_StaticMethods_getExternalCid_$$, 
$JSCompiler_StaticMethods_scopeBaseCid_$$, $JSCompiler_StaticMethods_isScopeOptedIn_$$, $JSCompiler_StaticMethods_getOptedInScopes_$$, $isOptedOutOfCid$$module$src$service$cid_impl$$, $setCidCookie$$module$src$service$cid_impl$$, $getOrCreateCookie$$module$src$service$cid_impl$$, $getBaseCid$$module$src$service$cid_impl$$, $store$$module$src$service$cid_impl$$, $viewerBaseCid$$module$src$service$cid_impl$$, $read$$module$src$service$cid_impl$$, $getEntropy$$module$src$service$cid_impl$$, $getNewCidForCookie$$module$src$service$cid_impl$$, 
$Crypto$$module$src$service$crypto_impl$$, $JSCompiler_StaticMethods_loadPolyfill_$$, $LayoutDelayMeter$$module$src$layout_delay_meter$$, $JSCompiler_StaticMethods_tryMeasureDelay_$$, $JSCompiler_StaticMethods_Resource$$module$src$service$resource_prototype$overflowCallback$$, $JSCompiler_StaticMethods_overlaps$$, $JSCompiler_StaticMethods_resolveDeferredsWhenWithinViewports_$$, $JSCompiler_StaticMethods_getDistanceViewportRatio$$, $JSCompiler_StaticMethods_layoutComplete_$$, $parseSizeList$$module$src$size_list$$, 
$SizeList$$module$src$size_list$$, $JSCompiler_StaticMethods_rejectSignal$$, $createCustomElementClass$$module$src$custom_element$$, $createBaseCustomElementClass$$module$src$custom_element$$, $isInternalOrServiceNode$$module$src$custom_element$$, $DocInfo$$module$src$service$document_info_impl$$, $getLinkRels$$module$src$service$document_info_impl$$, $getMetaTags$$module$src$service$document_info_impl$$, $getReplaceParams$$module$src$service$document_info_impl$$, $DocumentState$$module$src$service$document_state$$, 
$JSCompiler_StaticMethods_hideFallbackImg_$$, $JSCompiler_StaticMethods_onImgLoadingError_$$, $AmpLayout$$module$builtins$amp_layout$$, $createImagePixel$$module$src$pixel$$, $AmpPixel$$module$builtins$amp_pixel$$, $Extensions$$module$src$service$extensions_impl$$, $JSCompiler_StaticMethods_installElement_$$, $JSCompiler_StaticMethods_registerElementInWindow_$$, $JSCompiler_StaticMethods_installExtensionsInDoc$$, $JSCompiler_StaticMethods_installExtensionInDoc_$$, $JSCompiler_StaticMethods_getExtensionHolder_$$, 
$JSCompiler_StaticMethods_getCurrentExtensionHolder_$$, $JSCompiler_StaticMethods_waitFor_$$, $emptyService$$module$src$service$extensions_impl$$, $History$$module$src$service$history_impl$$, $JSCompiler_StaticMethods_History$$module$src$service$history_impl_prototype$replaceStateForTarget$$, $JSCompiler_StaticMethods_doPop_$$, $JSCompiler_StaticMethods_enque_$$, $JSCompiler_StaticMethods_deque_$$, $JSCompiler_StaticMethods_historyState_$$, $JSCompiler_StaticMethods_getState_$$, $JSCompiler_StaticMethods_whenReady_$$, 
$JSCompiler_StaticMethods_HistoryBindingNatural_$$module$src$service$history_impl_prototype$wait_$$, $JSCompiler_StaticMethods_back_$$, $JSCompiler_StaticMethods_HistoryBindingNatural_$$module$src$service$history_impl_prototype$updateHistoryState_$$, $JSCompiler_StaticMethods_mergeStateUpdate_$$, $JSCompiler_StaticMethods_HistoryBindingVirtual_$$module$src$service$history_impl_prototype$updateHistoryState_$$, $createHistory$$module$src$service$history_impl$$, $Navigation$$module$src$service$navigation$$, 
$JSCompiler_StaticMethods_queryA2AFeatures_$$, $JSCompiler_StaticMethods_anchorMutatorHandlers_$$, $JSCompiler_StaticMethods_expandVarsForAnchor_$$, $JSCompiler_StaticMethods_handleA2AClick_$$, $JSCompiler_StaticMethods_handleNavClick_$$, $JSCompiler_StaticMethods_scrollToElement_$$, $JSCompiler_StaticMethods_parseUrl_$$, $maybeExpandUrlParams$$module$src$service$navigation$$, $Platform$$module$src$service$platform_impl$$, $JSCompiler_StaticMethods_isFirefox$$, $JSCompiler_StaticMethods_isOpera$$, 
$JSCompiler_StaticMethods_isIe$$, $JSCompiler_StaticMethods_evalMajorVersion_$$, $FocusHistory$$module$src$focus_history$$, $JSCompiler_StaticMethods_FocusHistory$$module$src$focus_history_prototype$onFocus$$, $JSCompiler_StaticMethods_pushFocus_$$, $JSCompiler_StaticMethods_hasDescendantsOf$$, $checkAndFix$$module$src$service$ie_media_bug$$, $matchMediaIeQuite$$module$src$service$ie_media_bug$$, $TaskQueue$$module$src$service$task_queue$$, $JSCompiler_StaticMethods_TaskQueue$$module$src$service$task_queue_prototype$enqueue$$, 
$JSCompiler_StaticMethods_TaskQueue$$module$src$service$task_queue_prototype$dequeue$$, $JSCompiler_StaticMethods_TaskQueue$$module$src$service$task_queue_prototype$peek$$, $JSCompiler_StaticMethods_removeAtIndex$$, $JSCompiler_StaticMethods_purge$$, $JSCompiler_StaticMethods_rebuildDomWhenReady$$, $JSCompiler_StaticMethods_getResourcesInRect$$, $JSCompiler_StaticMethods_monitorInput_$$, $JSCompiler_StaticMethods_toggleInputClass_$$, $JSCompiler_StaticMethods_grantBuildPermission$$, $JSCompiler_StaticMethods_buildOrScheduleBuildForResource_$$, 
$JSCompiler_StaticMethods_buildReadyResources_$$, $JSCompiler_StaticMethods_buildResourceUnsafe_$$, $JSCompiler_StaticMethods_measureMutateElementResources_$$, $JSCompiler_StaticMethods_measureMutateElementLayers_$$, $JSCompiler_StaticMethods_schedulePassVsync$$, $JSCompiler_StaticMethods_doPass$$, $JSCompiler_StaticMethods_mutateWorkViaResources_$$, $JSCompiler_StaticMethods_elementNearBottom_$$, $JSCompiler_StaticMethods_setRelayoutTop_$$, $JSCompiler_StaticMethods_checkPendingChangeSize_$$, $JSCompiler_StaticMethods_discoverWork_$$, 
$JSCompiler_StaticMethods_calcTaskTimeout_$$, $JSCompiler_StaticMethods_completeScheduleChangeSize_$$, $JSCompiler_StaticMethods_isLayoutAllowed_$$, $JSCompiler_StaticMethods_measureAndScheduleIfAllowed_$$, $JSCompiler_StaticMethods_Resources$$module$src$service$resources_impl_prototype$schedule_$$, $JSCompiler_StaticMethods_setupVisibilityStateMachine_$$, $JSCompiler_StaticMethods_cleanupTasks_$$, $StandardActions$$module$src$service$standard_actions_impl$$, $JSCompiler_StaticMethods_handleNavigateTo$$, 
$JSCompiler_StaticMethods_handleCloseOrNavigateTo$$, $Storage$$module$src$service$storage_impl$$, $JSCompiler_StaticMethods_getStore_$$, $JSCompiler_StaticMethods_saveStore_$$, $JSCompiler_StaticMethods_Storage$$module$src$service$storage_impl_prototype$listenToBroadcasts_$$, $Store$$module$src$service$storage_impl$$, $LocalStorageBinding$$module$src$service$storage_impl$$, $ViewerStorageBinding$$module$src$service$storage_impl$$, $installStorageServiceForDoc$$module$src$service$storage_impl$$, $Templates$$module$src$service$template_impl$$, 
$Timer$$module$src$service$timer_impl$$, $Url$$module$src$service$url_impl$$, $JSCompiler_StaticMethods_findMatches_$$, $JSCompiler_StaticMethods_parseUrlRecursively_$$, $JSCompiler_StaticMethods_evaluateBinding_$$, $JSCompiler_StaticMethods_evaluateBindingAsync_$$, $JSCompiler_StaticMethods_evaluateBindingSync_$$, $JSCompiler_StaticMethods_maybeCollectVars_$$, $JSCompiler_StaticMethods_setBoth$$, $JSCompiler_StaticMethods_buildExpr_$$, $JSCompiler_StaticMethods_getUrlMacroWhitelist_$$, $dateMethod$$module$src$service$url_replacements_impl$$, 
$screenProperty$$module$src$service$url_replacements_impl$$, $GlobalVariableSource$$module$src$service$url_replacements_impl$$, $JSCompiler_StaticMethods_setTimingResolver_$$, $JSCompiler_StaticMethods_addReplaceParamsIfMissing_$$, $JSCompiler_StaticMethods_getAccessValue_$$, $JSCompiler_StaticMethods_getQueryParamData_$$, $JSCompiler_StaticMethods_getVariantsValue_$$, $JSCompiler_StaticMethods_getGeo_$$, $JSCompiler_StaticMethods_getShareTrackingValue_$$, $JSCompiler_StaticMethods_getStoryValue_$$, 
$JSCompiler_StaticMethods_getViewerIntegrationValue_$$, $JSCompiler_StaticMethods_ensureProtocolMatches_$$, $installUrlReplacementsServiceForDoc$$module$src$service$url_replacements_impl$$, $Viewer$$module$src$service$viewer_impl$$, $JSCompiler_StaticMethods_initMessagingChannel_$$, $JSCompiler_StaticMethods_onVisibilityChange_$$, $JSCompiler_StaticMethods_isCctEmbedded$$, $JSCompiler_StaticMethods_maybeUpdateFragmentForCct$$, $JSCompiler_StaticMethods_hasRoughlySameOrigin_$$, $JSCompiler_StaticMethods_onRuntimeState$$, 
$JSCompiler_StaticMethods_setVisibilityState_$$, $JSCompiler_StaticMethods_isTrustedViewer$$, $JSCompiler_StaticMethods_isTrustedAncestorOrigins_$$, $JSCompiler_StaticMethods_isTrustedViewerOrigin_$$, $JSCompiler_StaticMethods_sendMessageInternal_$$, $JSCompiler_StaticMethods_replaceUrl$$, $parseParams_$$module$src$service$viewer_impl$$, $getChannelError$$module$src$service$viewer_impl$$, $Bezier$$module$src$curve$$, $JSCompiler_StaticMethods_solvePositionFromXValue$$, $JSCompiler_StaticMethods_getPointX$$, 
$JSCompiler_StaticMethods_lerp$$, $getCurve$$module$src$curve$$, $NOOP_CALLBACK$$module$src$animation$$, $positionLt$$module$src$service$layers_impl$$, $LayoutLayers$$module$src$service$layers_impl$$, $JSCompiler_StaticMethods_declareLayer_$$, $JSCompiler_StaticMethods_listenForScroll_$$, $JSCompiler_StaticMethods_LayoutLayers$$module$src$service$layers_impl_prototype$onScroll$$, $LayoutElement$$module$src$service$layers_impl$$, $LayoutElement$$module$src$service$layers_impl$forOptional$$, $LayoutElement$$module$src$service$layers_impl$getParentLayer$$, 
$JSCompiler_StaticMethods_contains_$$, $JSCompiler_StaticMethods_LayoutElement$$module$src$service$layers_impl_prototype$transfer_$$, $JSCompiler_StaticMethods_getParentLayer$$, $JSCompiler_StaticMethods_getOffsetFromParent$$, $JSCompiler_StaticMethods_getHorizontalDistanceFromParent$$, $JSCompiler_StaticMethods_getVerticalDistanceFromParent$$, $JSCompiler_StaticMethods_LayoutElement$$module$src$service$layers_impl_prototype$getScrollTop$$, $JSCompiler_StaticMethods_remeasure_$$, $JSCompiler_StaticMethods_updateScrollPosition_$$, 
$frameParent$$module$src$service$layers_impl$$, $isDestroyed$$module$src$service$layers_impl$$, $installLayersServiceForDoc$$module$src$service$layers_impl$$, $lightboxOrDescendant$$module$src$service$fixed_layer$$, $FixedLayer$$module$src$service$fixed_layer$$, $JSCompiler_StaticMethods_initMutationObserver_$$, $JSCompiler_StaticMethods_FixedLayer$$module$src$service$fixed_layer_prototype$updatePaddingTop$$, $JSCompiler_StaticMethods_transformMutate$$, $JSCompiler_StaticMethods_getTransferLayer_$$, 
$JSCompiler_StaticMethods_discoverSelectors_$$, $JSCompiler_StaticMethods_Viewport$$module$src$service$viewport$viewport_impl_prototype$scrollIntoView$$, $JSCompiler_StaticMethods_scrollIntoViewInternal_$$, $JSCompiler_StaticMethods_animateScrollIntoViewInternal_$$, $JSCompiler_StaticMethods_interpolateScrollIntoView_$$, $JSCompiler_StaticMethods_getScrollingContainerFor_$$, $JSCompiler_StaticMethods_setElementScrollTop_$$, $JSCompiler_StaticMethods_getElementScrollTop_$$, $JSCompiler_StaticMethods_animateFixedElements_$$, 
$JSCompiler_StaticMethods_changed_$$, $createViewport$$module$src$service$viewport$viewport_impl$$, $JankMeter$$module$src$service$jank_meter$$, $JSCompiler_StaticMethods_isEnabled_$$, $JSCompiler_StaticMethods_initializeLongTaskObserver_$$, $Vsync$$module$src$service$vsync_impl$$, $JSCompiler_StaticMethods_forceSchedule_$$, $JSCompiler_StaticMethods_getRaf_$$, $callTaskNoInline$$module$src$service$vsync_impl$$, $isShadowCssSupported$$module$src$web_components$$, $isNative$$module$src$web_components$$, 
$getShadowDomSupportedVersion$$module$src$web_components$$, $createShadowRootPolyfill$$module$src$shadow_embed$$, $getShadowRootNode$$module$src$shadow_embed$$, $importShadowBody$$module$src$shadow_embed$$, $transformRootSelectors$$module$src$shadow_embed$$, $rootSelectorPrefixer$$module$src$shadow_embed$$, $getStylesheetRules$$module$src$shadow_embed$$, $createShadowDomWriter$$module$src$shadow_embed$$, $ShadowDomWriterStreamer$$module$src$shadow_embed$$, $JSCompiler_StaticMethods_ShadowDomWriterStreamer$$module$src$shadow_embed_prototype$schedule_$$, 
$ShadowDomWriterBulk$$module$src$shadow_embed$$, $removeNoScriptElements$$module$src$shadow_embed$$, $preloadDeps$$module$src$runtime$$, $startRegisterOrChunk$$module$src$runtime$$, $JSCompiler_StaticMethods_MultidocManager$$module$src$runtime_prototype$attachShadowDoc_$$, $JSCompiler_StaticMethods_mergeShadowHead_$$, $JSCompiler_StaticMethods_broadcast_$$, $JSCompiler_StaticMethods_closeShadowRoot_$$, $JSCompiler_StaticMethods_removeShadowRoot_$$, $JSCompiler_StaticMethods_closeShadowRootAsync_$$, 
$JSCompiler_StaticMethods_purgeShadowRoots_$$, $maybeLoadCorrectVersion$$module$src$runtime$$, $maybePumpEarlyFrame$$module$src$runtime$$, $AmpDocService$$module$src$service$ampdoc_impl$$, $JSCompiler_StaticMethods_getAmpDocIfAvailable$$, $JSCompiler_StaticMethods_installShadowDoc$$, $Performance$$module$src$service$performance_impl$$, $JSCompiler_StaticMethods_registerPaintTimingObserver_$$, $JSCompiler_StaticMethods_measureUserPerceivedVisualCompletenessTime_$$, $JSCompiler_StaticMethods_whenViewportLayoutComplete_$$, 
$JSCompiler_StaticMethods_addEnabledExperiment$$, $JSCompiler_StaticMethods_flushQueuedTicks_$$, $JSCompiler_StaticMethods_prerenderComplete_$$, $loadScript$$module$src$validator_integration$$, $$jscomp$objectCreate$$, $JSCompiler_temp$jscomp$418$$, $$jscomp$setPrototypeOf$$, $regex$$module$third_party$css_escape$css_escape$$;
_.$JSCompiler_stubMethod$$ = function($JSCompiler_stubMethod_id$$) {
  return function() {
    return _.$JSCompiler_stubMap$$[$JSCompiler_stubMethod_id$$].apply(this, arguments);
  };
};
_.$$jscomp$inherits$$ = function($childCtor$$, $parentCtor$$) {
  $childCtor$$.prototype = $$jscomp$objectCreate$$($parentCtor$$.prototype);
  $childCtor$$.prototype.constructor = $childCtor$$;
  if ($$jscomp$setPrototypeOf$$) {
    $$jscomp$setPrototypeOf$$($childCtor$$, $parentCtor$$);
  } else {
    for (var $p$$ in $parentCtor$$) {
      if ("prototype" != $p$$) {
        if (Object.defineProperties) {
          var $descriptor$jscomp$1$$ = Object.getOwnPropertyDescriptor($parentCtor$$, $p$$);
          $descriptor$jscomp$1$$ && Object.defineProperty($childCtor$$, $p$$, $descriptor$jscomp$1$$);
        } else {
          $childCtor$$[$p$$] = $parentCtor$$[$p$$];
        }
      }
    }
  }
  $childCtor$$.$superClass_$ = $parentCtor$$.prototype;
};
$escaper$$module$third_party$css_escape$css_escape$$ = function($match$$, $nil$$, $dash$$, $hexEscape$$, $chars$$) {
  return $chars$$ ? $chars$$ : $nil$$ ? "\ufffd" : $hexEscape$$ ? $match$$.slice(0, -1) + "\\" + $match$$.slice(-1).charCodeAt(0).toString(16) + " " : "\\" + $match$$;
};
_.$cssEscape$$module$third_party$css_escape$css_escape$$ = function($value$jscomp$84$$) {
  return String($value$jscomp$84$$).replace($regex$$module$third_party$css_escape$css_escape$$, $escaper$$module$third_party$css_escape$css_escape$$);
};
$tryDecodeUriComponent_$$module$src$url_try_decode_uri_component$$ = function($component$jscomp$4$$, $fallback$$) {
  $fallback$$ = void 0 === $fallback$$ ? "" : $fallback$$;
  try {
    return (0,window.decodeURIComponent)($component$jscomp$4$$);
  } catch ($e$jscomp$8$$) {
    return $fallback$$;
  }
};
_.$parseQueryString_$$module$src$url_parse_query_string$$ = function($queryString$$) {
  var $params$jscomp$1$$ = Object.create(null);
  if (!$queryString$$) {
    return $params$jscomp$1$$;
  }
  for (var $match$jscomp$1_value$jscomp$85$$; $match$jscomp$1_value$jscomp$85$$ = $regex$$module$src$url_parse_query_string$$.exec($queryString$$);) {
    var $name$jscomp$65$$ = $tryDecodeUriComponent_$$module$src$url_try_decode_uri_component$$($match$jscomp$1_value$jscomp$85$$[1], $match$jscomp$1_value$jscomp$85$$[1]);
    $match$jscomp$1_value$jscomp$85$$ = $match$jscomp$1_value$jscomp$85$$[2] ? $tryDecodeUriComponent_$$module$src$url_try_decode_uri_component$$($match$jscomp$1_value$jscomp$85$$[2], $match$jscomp$1_value$jscomp$85$$[2]) : "";
    $params$jscomp$1$$[$name$jscomp$65$$] = $match$jscomp$1_value$jscomp$85$$;
  }
  return $params$jscomp$1$$;
};
_.$getMode$$module$src$mode$$ = function($JSCompiler_temp$jscomp$420_opt_win_win$$) {
  $JSCompiler_temp$jscomp$420_opt_win_win$$ = $JSCompiler_temp$jscomp$420_opt_win_win$$ || window.self;
  if ($JSCompiler_temp$jscomp$420_opt_win_win$$.$AMP_MODE$) {
    $JSCompiler_temp$jscomp$420_opt_win_win$$ = $JSCompiler_temp$jscomp$420_opt_win_win$$.$AMP_MODE$;
  } else {
    var $AMP_CONFIG$jscomp$inline_1077_singlePassType$jscomp$inline_1080$$ = window.self.AMP_CONFIG || {}, $runningTests$jscomp$inline_1078$$ = !!$AMP_CONFIG$jscomp$inline_1077_singlePassType$jscomp$inline_1080$$.test || !1, $hashQuery$jscomp$inline_1079$$ = _.$parseQueryString_$$module$src$url_parse_query_string$$($JSCompiler_temp$jscomp$420_opt_win_win$$.location.$D$ || $JSCompiler_temp$jscomp$420_opt_win_win$$.location.hash);
    $AMP_CONFIG$jscomp$inline_1077_singlePassType$jscomp$inline_1080$$ = $AMP_CONFIG$jscomp$inline_1077_singlePassType$jscomp$inline_1080$$.spt;
    var $searchQuery$jscomp$inline_1081$$ = _.$parseQueryString_$$module$src$url_parse_query_string$$($JSCompiler_temp$jscomp$420_opt_win_win$$.location.search);
    $rtvVersion$$module$src$mode$$ || ($rtvVersion$$module$src$mode$$ = $JSCompiler_temp$jscomp$420_opt_win_win$$.AMP_CONFIG && $JSCompiler_temp$jscomp$420_opt_win_win$$.AMP_CONFIG.v ? $JSCompiler_temp$jscomp$420_opt_win_win$$.AMP_CONFIG.v : "011901181729101");
    $JSCompiler_temp$jscomp$420_opt_win_win$$ = $JSCompiler_temp$jscomp$420_opt_win_win$$.$AMP_MODE$ = {localDev:!1, $development$:!("1" != $hashQuery$jscomp$inline_1079$$.development && !$JSCompiler_temp$jscomp$420_opt_win_win$$.$AMP_DEV_MODE$), $examiner$:"2" == $hashQuery$jscomp$inline_1079$$.development, filter:$hashQuery$jscomp$inline_1079$$.filter, $geoOverride$:$hashQuery$jscomp$inline_1079$$["amp-geo"], $minified$:!0, $lite$:void 0 != $searchQuery$jscomp$inline_1081$$.amp_lite, test:$runningTests$jscomp$inline_1078$$, 
    log:$hashQuery$jscomp$inline_1079$$.log, version:"1901181729101", $rtvVersion$:$rtvVersion$$module$src$mode$$, $singlePassType$:$AMP_CONFIG$jscomp$inline_1077_singlePassType$jscomp$inline_1080$$};
  }
  return $JSCompiler_temp$jscomp$420_opt_win_win$$;
};
_.$getModeObject$$module$src$mode_object$$ = function() {
  return {localDev:!1, $development$:_.$getMode$$module$src$mode$$(void 0).$development$, filter:_.$getMode$$module$src$mode$$(void 0).filter, $minified$:!0, $lite$:_.$getMode$$module$src$mode$$(void 0).$lite$, test:!1, log:_.$getMode$$module$src$mode$$(void 0).log, version:_.$getMode$$module$src$mode$$(void 0).version, $rtvVersion$:_.$getMode$$module$src$mode$$(void 0).$rtvVersion$, $singlePassType$:_.$getMode$$module$src$mode$$(void 0).$singlePassType$};
};
_.$isArray$$module$src$types$$ = function($value$jscomp$87$$) {
  return Array.isArray($value$jscomp$87$$);
};
_.$toArray$$module$src$types$$ = function($arrayLike$jscomp$1$$) {
  return $arrayLike$jscomp$1$$ ? Array.prototype.slice.call($arrayLike$jscomp$1$$) : [];
};
_.$isObject$$module$src$types$$ = function($value$jscomp$88$$) {
  return "[object Object]" === $toString_$$module$src$types$$.call($value$jscomp$88$$);
};
_.$isFiniteNumber$$module$src$types$$ = function($value$jscomp$89$$) {
  return "number" === typeof $value$jscomp$89$$ && (0,window.isFinite)($value$jscomp$89$$);
};
_.$isEnumValue$$module$src$types$$ = function($enumObj$$, $s$jscomp$2$$) {
  for (var $k$$ in $enumObj$$) {
    if ($enumObj$$[$k$$] === $s$jscomp$2$$) {
      return !0;
    }
  }
  return !1;
};
$isUserErrorMessage$$module$src$log$$ = function($message$jscomp$23$$) {
  return 0 <= $message$jscomp$23$$.indexOf("\u200b\u200b\u200b");
};
$overrideLogLevel$$module$src$log$$ = function($level$jscomp$7$$) {
  $levelOverride_$$module$src$log$$ = $level$jscomp$7$$;
};
$Log$$module$src$log$$ = function($win$jscomp$4$$, $levelFunc$$, $opt_suffix$$) {
  this.$win$ = $win$jscomp$4$$;
  this.$D$ = $levelFunc$$;
  this.$F$ = this.$win$.console && this.$win$.console.log && "0" != _.$getMode$$module$src$mode$$().log ? this.$D$(_.$getModeObject$$module$src$mode_object$$()) : 0;
  this.$suffix_$ = $opt_suffix$$ || "";
};
$JSCompiler_StaticMethods_getLevel_$$ = function($JSCompiler_StaticMethods_getLevel_$self$$) {
  return void 0 !== $levelOverride_$$module$src$log$$ ? $levelOverride_$$module$src$log$$ : $JSCompiler_StaticMethods_getLevel_$self$$.$F$;
};
$JSCompiler_StaticMethods_msg_$$ = function($JSCompiler_StaticMethods_msg_$self$$, $level$jscomp$8$$, $messages$$) {
  if (0 != $JSCompiler_StaticMethods_getLevel_$$($JSCompiler_StaticMethods_msg_$self$$)) {
    var $fn$jscomp$1$$ = $JSCompiler_StaticMethods_msg_$self$$.$win$.console.log;
    "ERROR" == $level$jscomp$8$$ ? $fn$jscomp$1$$ = $JSCompiler_StaticMethods_msg_$self$$.$win$.console.error || $fn$jscomp$1$$ : "INFO" == $level$jscomp$8$$ ? $fn$jscomp$1$$ = $JSCompiler_StaticMethods_msg_$self$$.$win$.console.info || $fn$jscomp$1$$ : "WARN" == $level$jscomp$8$$ && ($fn$jscomp$1$$ = $JSCompiler_StaticMethods_msg_$self$$.$win$.console.warn || $fn$jscomp$1$$);
    $fn$jscomp$1$$.apply($JSCompiler_StaticMethods_msg_$self$$.$win$.console, $messages$$);
  }
};
_.$JSCompiler_StaticMethods_assertElement$$ = function($JSCompiler_StaticMethods_assertElement$self$$, $shouldBeElement$$, $opt_message$jscomp$8$$) {
  $JSCompiler_StaticMethods_assertElement$self$$.$Log$$module$src$log_prototype$assert$($shouldBeElement$$ && 1 == $shouldBeElement$$.nodeType, ($opt_message$jscomp$8$$ || "Element expected") + ": %s", $shouldBeElement$$);
  return $shouldBeElement$$;
};
_.$JSCompiler_StaticMethods_assertString$$ = function($JSCompiler_StaticMethods_assertString$self$$, $shouldBeString$$, $opt_message$jscomp$9$$) {
  $JSCompiler_StaticMethods_assertString$self$$.$Log$$module$src$log_prototype$assert$("string" == typeof $shouldBeString$$, ($opt_message$jscomp$9$$ || "String expected") + ": %s", $shouldBeString$$);
  return $shouldBeString$$;
};
_.$JSCompiler_StaticMethods_assertBoolean$$ = function($JSCompiler_StaticMethods_assertBoolean$self$$, $shouldBeBoolean$$, $opt_message$jscomp$12$$) {
  $JSCompiler_StaticMethods_assertBoolean$self$$.$Log$$module$src$log_prototype$assert$(!!$shouldBeBoolean$$ === $shouldBeBoolean$$, ($opt_message$jscomp$12$$ || "Boolean expected") + ": %s", $shouldBeBoolean$$);
  return $shouldBeBoolean$$;
};
_.$JSCompiler_StaticMethods_assertEnumValue$$ = function($JSCompiler_StaticMethods_assertEnumValue$self$$, $enumObj$jscomp$1$$, $s$jscomp$3$$, $opt_enumName$$) {
  if (_.$isEnumValue$$module$src$types$$($enumObj$jscomp$1$$, $s$jscomp$3$$)) {
    return $s$jscomp$3$$;
  }
  $JSCompiler_StaticMethods_assertEnumValue$self$$.$Log$$module$src$log_prototype$assert$(!1, 'Unknown %s value: "%s"', $opt_enumName$$ || "enum", $s$jscomp$3$$);
};
$JSCompiler_StaticMethods_prepareError_$$ = function($JSCompiler_StaticMethods_prepareError_$self$$, $error$jscomp$7$$) {
  $error$jscomp$7$$ = _.$duplicateErrorIfNecessary$$module$src$log$$($error$jscomp$7$$);
  $JSCompiler_StaticMethods_prepareError_$self$$.$suffix_$ ? $error$jscomp$7$$.message ? -1 == $error$jscomp$7$$.message.indexOf($JSCompiler_StaticMethods_prepareError_$self$$.$suffix_$) && ($error$jscomp$7$$.message += $JSCompiler_StaticMethods_prepareError_$self$$.$suffix_$) : $error$jscomp$7$$.message = $JSCompiler_StaticMethods_prepareError_$self$$.$suffix_$ : $isUserErrorMessage$$module$src$log$$($error$jscomp$7$$.message) && ($error$jscomp$7$$.message = $error$jscomp$7$$.message.replace("\u200b\u200b\u200b", 
  ""));
};
_.$duplicateErrorIfNecessary$$module$src$log$$ = function($error$jscomp$8$$) {
  var $messageProperty_stack$$ = Object.getOwnPropertyDescriptor($error$jscomp$8$$, "message");
  if ($messageProperty_stack$$ && $messageProperty_stack$$.writable) {
    return $error$jscomp$8$$;
  }
  $messageProperty_stack$$ = $error$jscomp$8$$.stack;
  var $e$jscomp$10$$ = Error($error$jscomp$8$$.message), $prop$jscomp$4$$;
  for ($prop$jscomp$4$$ in $error$jscomp$8$$) {
    $e$jscomp$10$$[$prop$jscomp$4$$] = $error$jscomp$8$$[$prop$jscomp$4$$];
  }
  $e$jscomp$10$$.stack = $messageProperty_stack$$;
  return $e$jscomp$10$$;
};
$createErrorVargs$$module$src$log$$ = function($var_args$jscomp$56$$) {
  for (var $error$jscomp$9$$ = null, $message$jscomp$27$$ = "", $i$jscomp$5$$ = 0; $i$jscomp$5$$ < arguments.length; $i$jscomp$5$$++) {
    var $arg$jscomp$6$$ = arguments[$i$jscomp$5$$];
    $arg$jscomp$6$$ instanceof Error && !$error$jscomp$9$$ ? $error$jscomp$9$$ = _.$duplicateErrorIfNecessary$$module$src$log$$($arg$jscomp$6$$) : ($message$jscomp$27$$ && ($message$jscomp$27$$ += " "), $message$jscomp$27$$ += $arg$jscomp$6$$);
  }
  $error$jscomp$9$$ ? $message$jscomp$27$$ && ($error$jscomp$9$$.message = $message$jscomp$27$$ + ": " + $error$jscomp$9$$.message) : $error$jscomp$9$$ = Error($message$jscomp$27$$);
  return $error$jscomp$9$$;
};
_.$rethrowAsync$$module$src$log$$ = function($var_args$jscomp$57$$) {
  var $error$jscomp$10$$ = $createErrorVargs$$module$src$log$$.apply(null, arguments);
  (0,window.setTimeout)(function() {
    window.self.$reportError$($error$jscomp$10$$);
    throw $error$jscomp$10$$;
  });
};
_.$user$$module$src$log$$ = function($opt_element$jscomp$5$$) {
  $logs$$module$src$log$$.$user$ || ($logs$$module$src$log$$.$user$ = $getUserLogger$$module$src$log$$("\u200b\u200b\u200b"));
  var $win$jscomp$inline_1090$$ = $logs$$module$src$log$$.$user$.$win$;
  return $opt_element$jscomp$5$$ && $opt_element$jscomp$5$$.ownerDocument.defaultView != $win$jscomp$inline_1090$$ ? $logs$$module$src$log$$.$userForEmbed$ ? $logs$$module$src$log$$.$userForEmbed$ : $logs$$module$src$log$$.$userForEmbed$ = $getUserLogger$$module$src$log$$("\u200b\u200b\u200b\u200b") : $logs$$module$src$log$$.$user$;
};
$getUserLogger$$module$src$log$$ = function($suffix$$) {
  if (!$logConstructor$$module$src$log$$) {
    throw Error("failed to call initLogConstructor");
  }
  return new $logConstructor$$module$src$log$$(window.self, function($suffix$$) {
    var $mode$jscomp$10$$ = (0,window.parseInt)($suffix$$.log, 10);
    return $suffix$$.$development$ || 1 <= $mode$jscomp$10$$ ? 4 : 2;
  }, $suffix$$);
};
_.$dev$$module$src$log$$ = function() {
  if ($logs$$module$src$log$$.$dev$) {
    return $logs$$module$src$log$$.$dev$;
  }
  if (!$logConstructor$$module$src$log$$) {
    throw Error("failed to call initLogConstructor");
  }
  return $logs$$module$src$log$$.$dev$ = new $logConstructor$$module$src$log$$(window.self, function($logNum$jscomp$1_mode$jscomp$11$$) {
    $logNum$jscomp$1_mode$jscomp$11$$ = (0,window.parseInt)($logNum$jscomp$1_mode$jscomp$11$$.log, 10);
    return 3 <= $logNum$jscomp$1_mode$jscomp$11$$ ? 4 : 2 <= $logNum$jscomp$1_mode$jscomp$11$$ ? 3 : 0;
  });
};
_.$endsWith$$module$src$string$$ = function($string$jscomp$5$$, $suffix$jscomp$1$$) {
  var $index$jscomp$55$$ = $string$jscomp$5$$.length - $suffix$jscomp$1$$.length;
  return 0 <= $index$jscomp$55$$ && $string$jscomp$5$$.indexOf($suffix$jscomp$1$$, $index$jscomp$55$$) == $index$jscomp$55$$;
};
_.$startsWith$$module$src$string$$ = function($string$jscomp$6$$, $prefix$jscomp$2$$) {
  return $prefix$jscomp$2$$.length > $string$jscomp$6$$.length ? !1 : 0 == $string$jscomp$6$$.lastIndexOf($prefix$jscomp$2$$, 0);
};
_.$map$$module$src$utils$object$$ = function($opt_initial$$) {
  var $obj$jscomp$25$$ = Object.create(null);
  $opt_initial$$ && Object.assign($obj$jscomp$25$$, $opt_initial$$);
  return $obj$jscomp$25$$;
};
_.$dict$$module$src$utils$object$$ = function($opt_initial$jscomp$1$$) {
  return $opt_initial$jscomp$1$$ || {};
};
_.$hasOwn$$module$src$utils$object$$ = function($obj$jscomp$26$$, $key$jscomp$35$$) {
  return $hasOwn_$$module$src$utils$object$$.call($obj$jscomp$26$$, $key$jscomp$35$$);
};
_.$Deferred$$module$src$utils$promise$$ = function() {
  var $resolve$$, $reject$$;
  this.$promise$ = new window.Promise(function($res$$, $rej$$) {
    $resolve$$ = $res$$;
    $reject$$ = $rej$$;
  });
  this.resolve = $resolve$$;
  this.reject = $reject$$;
};
_.$tryResolve$$module$src$utils$promise$$ = function($fn$jscomp$2$$) {
  return new window.Promise(function($resolve$jscomp$1$$) {
    $resolve$jscomp$1$$($fn$jscomp$2$$());
  });
};
_.$waitForChild$$module$src$dom$$ = function($parent$jscomp$2$$, $checkFunc$$, $callback$jscomp$51$$) {
  if ($checkFunc$$($parent$jscomp$2$$)) {
    $callback$jscomp$51$$();
  } else {
    var $win$jscomp$6$$ = $parent$jscomp$2$$.ownerDocument.defaultView;
    if ($win$jscomp$6$$.MutationObserver) {
      var $observer$$ = new $win$jscomp$6$$.MutationObserver(function() {
        $checkFunc$$($parent$jscomp$2$$) && ($observer$$.disconnect(), $callback$jscomp$51$$());
      });
      $observer$$.observe($parent$jscomp$2$$, {childList:!0});
    } else {
      var $interval$$ = $win$jscomp$6$$.setInterval(function() {
        $checkFunc$$($parent$jscomp$2$$) && ($win$jscomp$6$$.clearInterval($interval$$), $callback$jscomp$51$$());
      }, 5);
    }
  }
};
$waitForBody$$module$src$dom$$ = function($doc$jscomp$1$$, $callback$jscomp$52$$) {
  _.$waitForChild$$module$src$dom$$($doc$jscomp$1$$.documentElement, function() {
    return !!$doc$jscomp$1$$.body;
  }, $callback$jscomp$52$$);
};
_.$waitForBodyPromise$$module$src$dom$$ = function($doc$jscomp$2$$) {
  return new window.Promise(function($resolve$jscomp$5$$) {
    $waitForBody$$module$src$dom$$($doc$jscomp$2$$, $resolve$jscomp$5$$);
  });
};
_.$removeElement$$module$src$dom$$ = function($element$jscomp$10$$) {
  $element$jscomp$10$$.parentElement && $element$jscomp$10$$.parentElement.removeChild($element$jscomp$10$$);
};
_.$insertAfterOrAtStart$$module$src$dom$$ = function($root$jscomp$2$$, $element$jscomp$11$$, $after$$) {
  $root$jscomp$2$$.insertBefore($element$jscomp$11$$, $after$$ ? $after$$.nextSibling : $root$jscomp$2$$.firstChild);
};
_.$addAttributesToElement$$module$src$dom$$ = function($element$jscomp$12$$, $attributes$jscomp$1$$) {
  for (var $attr$$ in $attributes$jscomp$1$$) {
    $element$jscomp$12$$.setAttribute($attr$$, $attributes$jscomp$1$$[$attr$$]);
  }
  return $element$jscomp$12$$;
};
_.$createElementWithAttributes$$module$src$dom$$ = function($doc$jscomp$3_element$jscomp$13$$, $tagName$jscomp$5$$, $attributes$jscomp$2$$) {
  $doc$jscomp$3_element$jscomp$13$$ = $doc$jscomp$3_element$jscomp$13$$.createElement($tagName$jscomp$5$$);
  return _.$addAttributesToElement$$module$src$dom$$($doc$jscomp$3_element$jscomp$13$$, $attributes$jscomp$2$$);
};
_.$isConnectedNode$$module$src$dom$$ = function($n$jscomp$4_node$jscomp$2$$) {
  var $connected$$ = $n$jscomp$4_node$jscomp$2$$.isConnected;
  if (void 0 !== $connected$$) {
    return $connected$$;
  }
  do {
    if ($n$jscomp$4_node$jscomp$2$$ = _.$rootNodeFor$$module$src$dom$$($n$jscomp$4_node$jscomp$2$$), $n$jscomp$4_node$jscomp$2$$.host) {
      $n$jscomp$4_node$jscomp$2$$ = $n$jscomp$4_node$jscomp$2$$.host;
    } else {
      break;
    }
  } while (1);
  return $n$jscomp$4_node$jscomp$2$$.nodeType === window.Node.DOCUMENT_NODE;
};
_.$rootNodeFor$$module$src$dom$$ = function($n$jscomp$5_node$jscomp$3$$) {
  if (window.Node.prototype.getRootNode) {
    return $n$jscomp$5_node$jscomp$3$$.getRootNode() || $n$jscomp$5_node$jscomp$3$$;
  }
  for (; $n$jscomp$5_node$jscomp$3$$.parentNode; $n$jscomp$5_node$jscomp$3$$ = $n$jscomp$5_node$jscomp$3$$.parentNode) {
  }
  return $n$jscomp$5_node$jscomp$3$$;
};
_.$closest$$module$src$dom$$ = function($el_element$jscomp$14$$, $callback$jscomp$53$$, $opt_stopAt$$) {
  for (; $el_element$jscomp$14$$ && $el_element$jscomp$14$$ !== $opt_stopAt$$; $el_element$jscomp$14$$ = $el_element$jscomp$14$$.parentElement) {
    if ($callback$jscomp$53$$($el_element$jscomp$14$$)) {
      return $el_element$jscomp$14$$;
    }
  }
  return null;
};
$closestNode$$module$src$dom$$ = function($n$jscomp$6_node$jscomp$4$$, $callback$jscomp$54$$) {
  for (; $n$jscomp$6_node$jscomp$4$$; $n$jscomp$6_node$jscomp$4$$ = $n$jscomp$6_node$jscomp$4$$.parentNode) {
    if ($callback$jscomp$54$$($n$jscomp$6_node$jscomp$4$$)) {
      return $n$jscomp$6_node$jscomp$4$$;
    }
  }
  return null;
};
_.$closestByTag$$module$src$dom$$ = function($element$jscomp$15$$, $tagName$jscomp$6$$) {
  if ($element$jscomp$15$$.closest) {
    return $element$jscomp$15$$.closest($tagName$jscomp$6$$);
  }
  $tagName$jscomp$6$$ = $tagName$jscomp$6$$.toUpperCase();
  return _.$closest$$module$src$dom$$($element$jscomp$15$$, function($element$jscomp$15$$) {
    return $element$jscomp$15$$.tagName == $tagName$jscomp$6$$;
  });
};
_.$closestBySelector$$module$src$dom$$ = function($element$jscomp$16$$, $selector$jscomp$1$$) {
  return $element$jscomp$16$$.closest ? $element$jscomp$16$$.closest($selector$jscomp$1$$) : _.$closest$$module$src$dom$$($element$jscomp$16$$, function($element$jscomp$16$$) {
    return _.$matches$$module$src$dom$$($element$jscomp$16$$, $selector$jscomp$1$$);
  });
};
_.$matches$$module$src$dom$$ = function($el$jscomp$3$$, $selector$jscomp$2$$) {
  var $matcher$$ = $el$jscomp$3$$.matches || $el$jscomp$3$$.webkitMatchesSelector || $el$jscomp$3$$.mozMatchesSelector || $el$jscomp$3$$.msMatchesSelector || $el$jscomp$3$$.oMatchesSelector;
  return $matcher$$ ? $matcher$$.call($el$jscomp$3$$, $selector$jscomp$2$$) : !1;
};
_.$childElements$$module$src$dom$$ = function($child$jscomp$1_parent$jscomp$6$$, $callback$jscomp$56$$) {
  var $children$jscomp$126$$ = [];
  for ($child$jscomp$1_parent$jscomp$6$$ = $child$jscomp$1_parent$jscomp$6$$.firstElementChild; $child$jscomp$1_parent$jscomp$6$$; $child$jscomp$1_parent$jscomp$6$$ = $child$jscomp$1_parent$jscomp$6$$.nextElementSibling) {
    $callback$jscomp$56$$($child$jscomp$1_parent$jscomp$6$$) && $children$jscomp$126$$.push($child$jscomp$1_parent$jscomp$6$$);
  }
  return $children$jscomp$126$$;
};
$lastChildElement$$module$src$dom$$ = function($child$jscomp$2_parent$jscomp$7$$, $callback$jscomp$57$$) {
  for ($child$jscomp$2_parent$jscomp$7$$ = $child$jscomp$2_parent$jscomp$7$$.lastElementChild; $child$jscomp$2_parent$jscomp$7$$; $child$jscomp$2_parent$jscomp$7$$ = $child$jscomp$2_parent$jscomp$7$$.previousElementSibling) {
    if ($callback$jscomp$57$$($child$jscomp$2_parent$jscomp$7$$)) {
      return $child$jscomp$2_parent$jscomp$7$$;
    }
  }
  return null;
};
$childNodes$$module$src$dom$$ = function($child$jscomp$3_parent$jscomp$8$$, $callback$jscomp$58$$) {
  var $nodes$jscomp$3$$ = [];
  for ($child$jscomp$3_parent$jscomp$8$$ = $child$jscomp$3_parent$jscomp$8$$.firstChild; $child$jscomp$3_parent$jscomp$8$$; $child$jscomp$3_parent$jscomp$8$$ = $child$jscomp$3_parent$jscomp$8$$.nextSibling) {
    $callback$jscomp$58$$($child$jscomp$3_parent$jscomp$8$$) && $nodes$jscomp$3$$.push($child$jscomp$3_parent$jscomp$8$$);
  }
  return $nodes$jscomp$3$$;
};
$isScopeSelectorSupported$$module$src$dom$$ = function($doc$jscomp$4_parent$jscomp$9$$) {
  $doc$jscomp$4_parent$jscomp$9$$ = $doc$jscomp$4_parent$jscomp$9$$.ownerDocument;
  try {
    var $testElement$$ = $doc$jscomp$4_parent$jscomp$9$$.createElement("div"), $testChild$$ = $doc$jscomp$4_parent$jscomp$9$$.createElement("div");
    $testElement$$.appendChild($testChild$$);
    return $testElement$$.querySelector(":scope div") === $testChild$$;
  } catch ($e$jscomp$11$$) {
    return !1;
  }
};
_.$childElementByAttr$$module$src$dom$$ = function($parent$jscomp$10$$, $attr$jscomp$1$$) {
  return _.$scopedQuerySelector$$module$src$dom$$($parent$jscomp$10$$, "> [" + $attr$jscomp$1$$ + "]");
};
_.$childElementsByTag$$module$src$dom$$ = function($parent$jscomp$14$$, $tagName$jscomp$9$$) {
  return _.$scopedQuerySelectorAll$$module$src$dom$$($parent$jscomp$14$$, "> " + $tagName$jscomp$9$$);
};
$scopedQuerySelectionFallback$$module$src$dom$$ = function($root$jscomp$3$$, $element$jscomp$18_selector$jscomp$3$$) {
  $root$jscomp$3$$.classList.add("i-amphtml-scoped");
  $element$jscomp$18_selector$jscomp$3$$ = $root$jscomp$3$$.querySelectorAll(".i-amphtml-scoped " + $element$jscomp$18_selector$jscomp$3$$);
  $root$jscomp$3$$.classList.remove("i-amphtml-scoped");
  return $element$jscomp$18_selector$jscomp$3$$;
};
_.$scopedQuerySelector$$module$src$dom$$ = function($fallbackResult_root$jscomp$4$$, $selector$jscomp$4$$) {
  null == $scopeSelectorSupported$$module$src$dom$$ && ($scopeSelectorSupported$$module$src$dom$$ = $isScopeSelectorSupported$$module$src$dom$$($fallbackResult_root$jscomp$4$$));
  if ($scopeSelectorSupported$$module$src$dom$$) {
    return $fallbackResult_root$jscomp$4$$.querySelector(":scope " + $selector$jscomp$4$$);
  }
  $fallbackResult_root$jscomp$4$$ = $scopedQuerySelectionFallback$$module$src$dom$$($fallbackResult_root$jscomp$4$$, $selector$jscomp$4$$);
  return void 0 === $fallbackResult_root$jscomp$4$$[0] ? null : $fallbackResult_root$jscomp$4$$[0];
};
_.$scopedQuerySelectorAll$$module$src$dom$$ = function($root$jscomp$5$$, $selector$jscomp$5$$) {
  null == $scopeSelectorSupported$$module$src$dom$$ && ($scopeSelectorSupported$$module$src$dom$$ = $isScopeSelectorSupported$$module$src$dom$$($root$jscomp$5$$));
  return $scopeSelectorSupported$$module$src$dom$$ ? $root$jscomp$5$$.querySelectorAll(":scope " + $selector$jscomp$5$$) : $scopedQuerySelectionFallback$$module$src$dom$$($root$jscomp$5$$, $selector$jscomp$5$$);
};
_.$iterateCursor$$module$src$dom$$ = function($iterable$jscomp$2$$, $cb$$) {
  for (var $length$jscomp$17$$ = $iterable$jscomp$2$$.length, $i$jscomp$10$$ = 0; $i$jscomp$10$$ < $length$jscomp$17$$; $i$jscomp$10$$++) {
    $cb$$($iterable$jscomp$2$$[$i$jscomp$10$$], $i$jscomp$10$$);
  }
};
_.$openWindowDialog$$module$src$dom$$ = function($win$jscomp$7$$, $url$jscomp$21$$, $target$jscomp$58$$, $opt_features$$) {
  try {
    var $res$jscomp$1$$ = $win$jscomp$7$$.open($url$jscomp$21$$, $target$jscomp$58$$, $opt_features$$);
  } catch ($e$jscomp$12$$) {
    _.$dev$$module$src$log$$().error("DOM", "Failed to open url on target: ", $target$jscomp$58$$, $e$jscomp$12$$);
  }
  $res$jscomp$1$$ || "_top" == $target$jscomp$58$$ || ($res$jscomp$1$$ = $win$jscomp$7$$.open($url$jscomp$21$$, "_top"));
  return $res$jscomp$1$$;
};
_.$tryFocus$$module$src$dom$$ = function($element$jscomp$23$$) {
  try {
    $element$jscomp$23$$.focus();
  } catch ($e$jscomp$13$$) {
  }
};
_.$isIframed$$module$src$dom$$ = function($win$jscomp$8$$) {
  return $win$jscomp$8$$.parent && $win$jscomp$8$$.parent != $win$jscomp$8$$;
};
$recreateNonProtoObject$$module$src$json$$ = function($obj$jscomp$28$$) {
  var $copy$$ = Object.create(null), $k$jscomp$1$$;
  for ($k$jscomp$1$$ in $obj$jscomp$28$$) {
    if ($hasOwnProperty$$module$src$json$$($obj$jscomp$28$$, $k$jscomp$1$$)) {
      var $v$$ = $obj$jscomp$28$$[$k$jscomp$1$$];
      $copy$$[$k$jscomp$1$$] = _.$isObject$$module$src$types$$($v$$) ? $recreateNonProtoObject$$module$src$json$$($v$$) : $v$$;
    }
  }
  return $copy$$;
};
_.$getValueForExpr$$module$src$json$$ = function($obj$jscomp$29_value$jscomp$91$$, $expr$jscomp$3_parts$$) {
  if ("." == $expr$jscomp$3_parts$$) {
    return $obj$jscomp$29_value$jscomp$91$$;
  }
  $expr$jscomp$3_parts$$ = $expr$jscomp$3_parts$$.split(".");
  for (var $i$jscomp$11$$ = 0; $i$jscomp$11$$ < $expr$jscomp$3_parts$$.length; $i$jscomp$11$$++) {
    var $part$$ = $expr$jscomp$3_parts$$[$i$jscomp$11$$];
    if ($part$$ && $obj$jscomp$29_value$jscomp$91$$ && void 0 !== $obj$jscomp$29_value$jscomp$91$$[$part$$] && $hasOwnProperty$$module$src$json$$($obj$jscomp$29_value$jscomp$91$$, $part$$)) {
      $obj$jscomp$29_value$jscomp$91$$ = $obj$jscomp$29_value$jscomp$91$$[$part$$];
    } else {
      $obj$jscomp$29_value$jscomp$91$$ = void 0;
      break;
    }
  }
  return $obj$jscomp$29_value$jscomp$91$$;
};
_.$parseJson$$module$src$json$$ = function($json$$) {
  return JSON.parse($json$$);
};
_.$tryParseJson$$module$src$json$$ = function($json$jscomp$1$$, $opt_onFailed$$) {
  try {
    return _.$parseJson$$module$src$json$$($json$jscomp$1$$);
  } catch ($e$jscomp$14$$) {
    $opt_onFailed$$ && $opt_onFailed$$($e$jscomp$14$$);
  }
};
$hasOwnProperty$$module$src$json$$ = function($obj$jscomp$30$$, $key$jscomp$41$$) {
  return null == $obj$jscomp$30$$ || "object" != typeof $obj$jscomp$30$$ ? !1 : Object.prototype.hasOwnProperty.call($obj$jscomp$30$$, $key$jscomp$41$$);
};
_.$LruCache$$module$src$utils$lru_cache$$ = function($capacity$$) {
  this.$G$ = $capacity$$;
  this.$F$ = this.$size_$ = 0;
  this.$D$ = Object.create(null);
};
_.$JSCompiler_StaticMethods_LruCache$$module$src$utils$lru_cache_prototype$put$$ = function($JSCompiler_StaticMethods_LruCache$$module$src$utils$lru_cache_prototype$put$self$$, $cache$jscomp$inline_1093_key$jscomp$44$$, $oldest$jscomp$inline_1094_payload$$) {
  $JSCompiler_StaticMethods_LruCache$$module$src$utils$lru_cache_prototype$put$self$$.has($cache$jscomp$inline_1093_key$jscomp$44$$) || $JSCompiler_StaticMethods_LruCache$$module$src$utils$lru_cache_prototype$put$self$$.$size_$++;
  $JSCompiler_StaticMethods_LruCache$$module$src$utils$lru_cache_prototype$put$self$$.$D$[$cache$jscomp$inline_1093_key$jscomp$44$$] = {$payload$:$oldest$jscomp$inline_1094_payload$$, $access$:$JSCompiler_StaticMethods_LruCache$$module$src$utils$lru_cache_prototype$put$self$$.$F$};
  if (!($JSCompiler_StaticMethods_LruCache$$module$src$utils$lru_cache_prototype$put$self$$.$size_$ <= $JSCompiler_StaticMethods_LruCache$$module$src$utils$lru_cache_prototype$put$self$$.$G$)) {
    _.$dev$$module$src$log$$().$Log$$module$src$log_prototype$warn$("lru-cache", "Trimming LRU cache");
    $cache$jscomp$inline_1093_key$jscomp$44$$ = $JSCompiler_StaticMethods_LruCache$$module$src$utils$lru_cache_prototype$put$self$$.$D$;
    $oldest$jscomp$inline_1094_payload$$ = $JSCompiler_StaticMethods_LruCache$$module$src$utils$lru_cache_prototype$put$self$$.$F$ + 1;
    var $key$jscomp$inline_1096$$;
    for ($key$jscomp$inline_1096$$ in $cache$jscomp$inline_1093_key$jscomp$44$$) {
      var $access$jscomp$inline_1097$$ = $cache$jscomp$inline_1093_key$jscomp$44$$[$key$jscomp$inline_1096$$].$access$;
      if ($access$jscomp$inline_1097$$ < $oldest$jscomp$inline_1094_payload$$) {
        $oldest$jscomp$inline_1094_payload$$ = $access$jscomp$inline_1097$$;
        var $oldestKey$jscomp$inline_1095$$ = $key$jscomp$inline_1096$$;
      }
    }
    void 0 !== $oldestKey$jscomp$inline_1095$$ && (delete $cache$jscomp$inline_1093_key$jscomp$44$$[$oldestKey$jscomp$inline_1095$$], $JSCompiler_StaticMethods_LruCache$$module$src$utils$lru_cache_prototype$put$self$$.$size_$--);
  }
};
_.$getWinOrigin$$module$src$url$$ = function($win$jscomp$9$$) {
  return $win$jscomp$9$$.origin || _.$parseUrlDeprecated$$module$src$url$$($win$jscomp$9$$.location.href).origin;
};
_.$parseUrlDeprecated$$module$src$url$$ = function($url$jscomp$22$$, $opt_nocache$$) {
  $a$$module$src$url$$ || ($a$$module$src$url$$ = window.self.document.createElement("a"), $cache$$module$src$url$$ = window.self.$UrlCache$ || (window.self.$UrlCache$ = new _.$LruCache$$module$src$utils$lru_cache$$(100)));
  return $parseUrlWithA$$module$src$url$$($a$$module$src$url$$, $url$jscomp$22$$, $opt_nocache$$ ? null : $cache$$module$src$url$$);
};
$parseUrlWithA$$module$src$url$$ = function($a$jscomp$2$$, $url$jscomp$23$$, $opt_cache$$) {
  if ($opt_cache$$ && $opt_cache$$.has($url$jscomp$23$$)) {
    return $opt_cache$$.get($url$jscomp$23$$);
  }
  $a$jscomp$2$$.href = $url$jscomp$23$$;
  $a$jscomp$2$$.protocol || ($a$jscomp$2$$.href = $a$jscomp$2$$.href);
  var $info$$ = {href:$a$jscomp$2$$.href, protocol:$a$jscomp$2$$.protocol, host:$a$jscomp$2$$.host, hostname:$a$jscomp$2$$.hostname, port:"0" == $a$jscomp$2$$.port ? "" : $a$jscomp$2$$.port, pathname:$a$jscomp$2$$.pathname, search:$a$jscomp$2$$.search, hash:$a$jscomp$2$$.hash, origin:null};
  "/" !== $info$$.pathname[0] && ($info$$.pathname = "/" + $info$$.pathname);
  if ("http:" == $info$$.protocol && 80 == $info$$.port || "https:" == $info$$.protocol && 443 == $info$$.port) {
    $info$$.port = "", $info$$.host = $info$$.hostname;
  }
  $a$jscomp$2$$.origin && "null" != $a$jscomp$2$$.origin ? $info$$.origin = $a$jscomp$2$$.origin : $info$$.origin = "data:" != $info$$.protocol && $info$$.host ? $info$$.protocol + "//" + $info$$.host : $info$$.href;
  $opt_cache$$ && _.$JSCompiler_StaticMethods_LruCache$$module$src$utils$lru_cache_prototype$put$$($opt_cache$$, $url$jscomp$23$$, $info$$);
  return $info$$;
};
_.$appendEncodedParamStringToUrl$$module$src$url$$ = function($mainAndFragment_url$jscomp$24$$, $newUrl_paramString$$, $opt_addToFront$$) {
  if (!$newUrl_paramString$$) {
    return $mainAndFragment_url$jscomp$24$$;
  }
  $mainAndFragment_url$jscomp$24$$ = $mainAndFragment_url$jscomp$24$$.split("#", 2);
  var $mainAndQuery$$ = $mainAndFragment_url$jscomp$24$$[0].split("?", 2);
  $newUrl_paramString$$ = $mainAndQuery$$[0] + ($mainAndQuery$$[1] ? $opt_addToFront$$ ? "?" + $newUrl_paramString$$ + "&" + $mainAndQuery$$[1] : "?" + $mainAndQuery$$[1] + "&" + $newUrl_paramString$$ : "?" + $newUrl_paramString$$);
  return $newUrl_paramString$$ += $mainAndFragment_url$jscomp$24$$[1] ? "#" + $mainAndFragment_url$jscomp$24$$[1] : "";
};
_.$addParamToUrl$$module$src$url$$ = function($url$jscomp$25$$, $field$jscomp$1_key$jscomp$46$$, $value$jscomp$92$$) {
  $field$jscomp$1_key$jscomp$46$$ = (0,window.encodeURIComponent)($field$jscomp$1_key$jscomp$46$$) + "=" + (0,window.encodeURIComponent)($value$jscomp$92$$);
  return _.$appendEncodedParamStringToUrl$$module$src$url$$($url$jscomp$25$$, $field$jscomp$1_key$jscomp$46$$, void 0);
};
_.$addParamsToUrl$$module$src$url$$ = function($url$jscomp$26$$, $params$jscomp$3$$) {
  return _.$appendEncodedParamStringToUrl$$module$src$url$$($url$jscomp$26$$, _.$serializeQueryString$$module$src$url$$($params$jscomp$3$$));
};
_.$addMissingParamsToUrl$$module$src$url$$ = function($url$jscomp$27$$, $params$jscomp$4$$) {
  var $existingParams_location$jscomp$21$$ = _.$parseUrlDeprecated$$module$src$url$$($url$jscomp$27$$);
  $existingParams_location$jscomp$21$$ = _.$parseQueryString_$$module$src$url_parse_query_string$$($existingParams_location$jscomp$21$$.search);
  for (var $paramsToAdd$$ = _.$dict$$module$src$utils$object$$({}), $keys$$ = Object.keys($params$jscomp$4$$), $i$jscomp$13$$ = 0; $i$jscomp$13$$ < $keys$$.length; $i$jscomp$13$$++) {
    _.$hasOwn$$module$src$utils$object$$($existingParams_location$jscomp$21$$, $keys$$[$i$jscomp$13$$]) || ($paramsToAdd$$[$keys$$[$i$jscomp$13$$]] = $params$jscomp$4$$[$keys$$[$i$jscomp$13$$]]);
  }
  return _.$addParamsToUrl$$module$src$url$$($url$jscomp$27$$, $paramsToAdd$$);
};
_.$serializeQueryString$$module$src$url$$ = function($params$jscomp$5$$) {
  var $s$jscomp$4$$ = [], $k$jscomp$3$$;
  for ($k$jscomp$3$$ in $params$jscomp$5$$) {
    var $sv$113_v$jscomp$1$$ = $params$jscomp$5$$[$k$jscomp$3$$];
    if (null != $sv$113_v$jscomp$1$$) {
      if (_.$isArray$$module$src$types$$($sv$113_v$jscomp$1$$)) {
        for (var $i$jscomp$14$$ = 0; $i$jscomp$14$$ < $sv$113_v$jscomp$1$$.length; $i$jscomp$14$$++) {
          var $sv$$ = $sv$113_v$jscomp$1$$[$i$jscomp$14$$];
          $s$jscomp$4$$.push((0,window.encodeURIComponent)($k$jscomp$3$$) + "=" + (0,window.encodeURIComponent)($sv$$));
        }
      } else {
        $s$jscomp$4$$.push((0,window.encodeURIComponent)($k$jscomp$3$$) + "=" + (0,window.encodeURIComponent)($sv$113_v$jscomp$1$$));
      }
    }
  }
  return $s$jscomp$4$$.join("&");
};
_.$removeFragment$$module$src$url$$ = function($url$jscomp$29$$) {
  var $index$jscomp$56$$ = $url$jscomp$29$$.indexOf("#");
  return -1 == $index$jscomp$56$$ ? $url$jscomp$29$$ : $url$jscomp$29$$.substring(0, $index$jscomp$56$$);
};
_.$isProxyOrigin$$module$src$url$$ = function($url$jscomp$31$$) {
  "string" == typeof $url$jscomp$31$$ && ($url$jscomp$31$$ = _.$parseUrlDeprecated$$module$src$url$$($url$jscomp$31$$));
  return _.$urls$$module$src$config$$.$cdnProxyRegex$.test($url$jscomp$31$$.origin);
};
_.$isProtocolValid$$module$src$url$$ = function($url$jscomp$34$$) {
  if (!$url$jscomp$34$$) {
    return !0;
  }
  "string" == typeof $url$jscomp$34$$ && ($url$jscomp$34$$ = _.$parseUrlDeprecated$$module$src$url$$($url$jscomp$34$$));
  return !$INVALID_PROTOCOLS$$module$src$url$$.includes($url$jscomp$34$$.protocol);
};
$removeAmpJsParamsFromUrl$$module$src$url$$ = function($parsed_url$jscomp$35$$) {
  $parsed_url$jscomp$35$$ = _.$parseUrlDeprecated$$module$src$url$$($parsed_url$jscomp$35$$);
  var $search$$ = $removeAmpJsParamsFromSearch$$module$src$url$$($parsed_url$jscomp$35$$.search);
  return $parsed_url$jscomp$35$$.origin + $parsed_url$jscomp$35$$.pathname + $search$$ + $parsed_url$jscomp$35$$.hash;
};
$removeAmpJsParamsFromSearch$$module$src$url$$ = function($search$jscomp$1_urlSearch$$) {
  return $search$jscomp$1_urlSearch$$ && "?" != $search$jscomp$1_urlSearch$$ ? ($search$jscomp$1_urlSearch$$ = $search$jscomp$1_urlSearch$$.replace($AMP_JS_PARAMS_REGEX$$module$src$url$$, "").replace($AMP_GSA_PARAMS_REGEX$$module$src$url$$, "").replace($AMP_R_PARAMS_REGEX$$module$src$url$$, "").replace($AMP_KIT_PARAMS_REGEX$$module$src$url$$, "").replace($GOOGLE_EXPERIMENT_PARAMS_REGEX$$module$src$url$$, "").replace(/^[?&]/, "")) ? "?" + $search$jscomp$1_urlSearch$$ : "" : "";
};
_.$getSourceUrl$$module$src$url$$ = function($url$jscomp$37$$) {
  "string" == typeof $url$jscomp$37$$ && ($url$jscomp$37$$ = _.$parseUrlDeprecated$$module$src$url$$($url$jscomp$37$$));
  if (!_.$isProxyOrigin$$module$src$url$$($url$jscomp$37$$)) {
    return $url$jscomp$37$$.href;
  }
  var $path$jscomp$4$$ = $url$jscomp$37$$.pathname.split("/"), $domainOrHttpsSignal$$ = $path$jscomp$4$$[2], $origin$$ = "s" == $domainOrHttpsSignal$$ ? "https://" + (0,window.decodeURIComponent)($path$jscomp$4$$[3]) : "http://" + (0,window.decodeURIComponent)($domainOrHttpsSignal$$);
  $path$jscomp$4$$.splice(1, "s" == $domainOrHttpsSignal$$ ? 3 : 2);
  return $origin$$ + $path$jscomp$4$$.join("/") + $removeAmpJsParamsFromSearch$$module$src$url$$($url$jscomp$37$$.search) + ($url$jscomp$37$$.hash || "");
};
_.$getSourceOrigin$$module$src$url$$ = function($url$jscomp$38$$) {
  return _.$parseUrlDeprecated$$module$src$url$$(_.$getSourceUrl$$module$src$url$$($url$jscomp$38$$)).origin;
};
_.$getCorsUrl$$module$src$url$$ = function($sourceOrigin_win$jscomp$10$$, $url$jscomp$39$$) {
  _.$checkCorsUrl$$module$src$url$$($url$jscomp$39$$);
  $sourceOrigin_win$jscomp$10$$ = _.$getSourceOrigin$$module$src$url$$($sourceOrigin_win$jscomp$10$$.location.href);
  return _.$addParamToUrl$$module$src$url$$($url$jscomp$39$$, "__amp_source_origin", $sourceOrigin_win$jscomp$10$$);
};
_.$checkCorsUrl$$module$src$url$$ = function($parsedUrl_url$jscomp$40$$) {
  $parsedUrl_url$jscomp$40$$ = _.$parseUrlDeprecated$$module$src$url$$($parsedUrl_url$jscomp$40$$);
  _.$parseQueryString_$$module$src$url_parse_query_string$$($parsedUrl_url$jscomp$40$$.search);
};
$getCookie$$module$src$cookies$$ = function($cookieString_cookies_win$jscomp$11$$, $name$jscomp$68_value$jscomp$93$$) {
  try {
    var $JSCompiler_inline_result$jscomp$426_i$jscomp$15$$ = $cookieString_cookies_win$jscomp$11$$.document.cookie;
  } catch ($e$jscomp$inline_1100$$) {
    $JSCompiler_inline_result$jscomp$426_i$jscomp$15$$ = "";
  }
  $cookieString_cookies_win$jscomp$11$$ = $JSCompiler_inline_result$jscomp$426_i$jscomp$15$$;
  if (!$cookieString_cookies_win$jscomp$11$$) {
    return null;
  }
  $cookieString_cookies_win$jscomp$11$$ = $cookieString_cookies_win$jscomp$11$$.split(";");
  for ($JSCompiler_inline_result$jscomp$426_i$jscomp$15$$ = 0; $JSCompiler_inline_result$jscomp$426_i$jscomp$15$$ < $cookieString_cookies_win$jscomp$11$$.length; $JSCompiler_inline_result$jscomp$426_i$jscomp$15$$++) {
    var $cookie$$ = $cookieString_cookies_win$jscomp$11$$[$JSCompiler_inline_result$jscomp$426_i$jscomp$15$$].trim(), $eq$$ = $cookie$$.indexOf("=");
    if (-1 != $eq$$ && $tryDecodeUriComponent_$$module$src$url_try_decode_uri_component$$($cookie$$.substring(0, $eq$$).trim(), void 0) == $name$jscomp$68_value$jscomp$93$$) {
      return $name$jscomp$68_value$jscomp$93$$ = $cookie$$.substring($eq$$ + 1).trim(), $tryDecodeUriComponent_$$module$src$url_try_decode_uri_component$$($name$jscomp$68_value$jscomp$93$$, $name$jscomp$68_value$jscomp$93$$);
    }
  }
  return null;
};
_.$setCookie$$module$src$cookies$$ = function($win$jscomp$13$$, $name$jscomp$69$$, $value$jscomp$94$$, $expirationTime$$, $opt_options$jscomp$78$$) {
  if (!$opt_options$jscomp$78$$ || !$opt_options$jscomp$78$$.$allowOnProxyOrigin$) {
    if (_.$isProxyOrigin$$module$src$url$$($win$jscomp$13$$.location.href)) {
      throw Error("Should never attempt to set cookie on proxy origin: " + $name$jscomp$69$$);
    }
    var $current$jscomp$inline_1105_domain$jscomp$2_parts$jscomp$1$$ = _.$parseUrlDeprecated$$module$src$url$$($win$jscomp$13$$.location.href).hostname.toLowerCase(), $domain$114_proxy$jscomp$inline_1106$$ = _.$parseUrlDeprecated$$module$src$url$$(_.$urls$$module$src$config$$.cdn).hostname.toLowerCase();
    if ($current$jscomp$inline_1105_domain$jscomp$2_parts$jscomp$1$$ == $domain$114_proxy$jscomp$inline_1106$$ || _.$endsWith$$module$src$string$$($current$jscomp$inline_1105_domain$jscomp$2_parts$jscomp$1$$, "." + $domain$114_proxy$jscomp$inline_1106$$)) {
      throw Error("Should never attempt to set cookie on proxy origin. (in depth check): " + $name$jscomp$69$$);
    }
  }
  if ($opt_options$jscomp$78$$ && $opt_options$jscomp$78$$.$highestAvailableDomain$) {
    $current$jscomp$inline_1105_domain$jscomp$2_parts$jscomp$1$$ = $win$jscomp$13$$.location.hostname.split(".");
    $domain$114_proxy$jscomp$inline_1106$$ = $current$jscomp$inline_1105_domain$jscomp$2_parts$jscomp$1$$[$current$jscomp$inline_1105_domain$jscomp$2_parts$jscomp$1$$.length - 1];
    for (var $i$jscomp$16$$ = $current$jscomp$inline_1105_domain$jscomp$2_parts$jscomp$1$$.length - 2; 0 <= $i$jscomp$16$$; $i$jscomp$16$$--) {
      if ($domain$114_proxy$jscomp$inline_1106$$ = $current$jscomp$inline_1105_domain$jscomp$2_parts$jscomp$1$$[$i$jscomp$16$$] + "." + $domain$114_proxy$jscomp$inline_1106$$, $trySetCookie$$module$src$cookies$$($win$jscomp$13$$, $name$jscomp$69$$, $value$jscomp$94$$, $expirationTime$$, $domain$114_proxy$jscomp$inline_1106$$), $getCookie$$module$src$cookies$$($win$jscomp$13$$, $name$jscomp$69$$) == $value$jscomp$94$$) {
        return;
      }
    }
  }
  $current$jscomp$inline_1105_domain$jscomp$2_parts$jscomp$1$$ = void 0;
  $opt_options$jscomp$78$$ && $opt_options$jscomp$78$$.domain && ($current$jscomp$inline_1105_domain$jscomp$2_parts$jscomp$1$$ = $opt_options$jscomp$78$$.domain);
  $trySetCookie$$module$src$cookies$$($win$jscomp$13$$, $name$jscomp$69$$, $value$jscomp$94$$, $expirationTime$$, $current$jscomp$inline_1105_domain$jscomp$2_parts$jscomp$1$$);
};
$trySetCookie$$module$src$cookies$$ = function($win$jscomp$14$$, $cookie$jscomp$1_name$jscomp$70$$, $value$jscomp$95$$, $expirationTime$jscomp$1$$, $domain$jscomp$3$$) {
  "ampproject.org" == $domain$jscomp$3$$ && ($value$jscomp$95$$ = "delete", $expirationTime$jscomp$1$$ = 0);
  $cookie$jscomp$1_name$jscomp$70$$ = (0,window.encodeURIComponent)($cookie$jscomp$1_name$jscomp$70$$) + "=" + (0,window.encodeURIComponent)($value$jscomp$95$$) + "; path=/" + ($domain$jscomp$3$$ ? "; domain=" + $domain$jscomp$3$$ : "") + "; expires=" + (new Date($expirationTime$jscomp$1$$)).toUTCString();
  try {
    $win$jscomp$14$$.document.cookie = $cookie$jscomp$1_name$jscomp$70$$;
  } catch ($ignore$$) {
  }
};
_.$isCanary$$module$src$experiments$$ = function($win$jscomp$16$$) {
  return !(!$win$jscomp$16$$.AMP_CONFIG || !$win$jscomp$16$$.AMP_CONFIG.canary);
};
_.$getBinaryType$$module$src$experiments$$ = function($win$jscomp$17$$) {
  return $win$jscomp$17$$.AMP_CONFIG && $win$jscomp$17$$.AMP_CONFIG.type ? $win$jscomp$17$$.AMP_CONFIG.type : "unknown";
};
_.$isExperimentOn$$module$src$experiments$$ = function($win$jscomp$18$$, $experimentId$$) {
  return !!_.$experimentToggles$$module$src$experiments$$($win$jscomp$18$$)[$experimentId$$];
};
_.$toggleExperiment$$module$src$experiments$$ = function($win$jscomp$19$$, $experimentId$jscomp$1_experimentIds$jscomp$inline_1110$$, $on_opt_on$$, $cookieToggles_opt_transientExperiment$$) {
  var $currentlyOn$$ = _.$isExperimentOn$$module$src$experiments$$($win$jscomp$19$$, $experimentId$jscomp$1_experimentIds$jscomp$inline_1110$$);
  $on_opt_on$$ = !(void 0 !== $on_opt_on$$ ? !$on_opt_on$$ : $currentlyOn$$);
  if ($on_opt_on$$ != $currentlyOn$$ && (_.$experimentToggles$$module$src$experiments$$($win$jscomp$19$$)[$experimentId$jscomp$1_experimentIds$jscomp$inline_1110$$] = $on_opt_on$$, !$cookieToggles_opt_transientExperiment$$)) {
    $cookieToggles_opt_transientExperiment$$ = $getExperimentTogglesFromCookie$$module$src$experiments$$($win$jscomp$19$$);
    $cookieToggles_opt_transientExperiment$$[$experimentId$jscomp$1_experimentIds$jscomp$inline_1110$$] = $on_opt_on$$;
    $experimentId$jscomp$1_experimentIds$jscomp$inline_1110$$ = [];
    for (var $experiment$jscomp$inline_1111$$ in $cookieToggles_opt_transientExperiment$$) {
      $experimentId$jscomp$1_experimentIds$jscomp$inline_1110$$.push((!1 === $cookieToggles_opt_transientExperiment$$[$experiment$jscomp$inline_1111$$] ? "-" : "") + $experiment$jscomp$inline_1111$$);
    }
    _.$setCookie$$module$src$cookies$$($win$jscomp$19$$, "AMP_EXP", $experimentId$jscomp$1_experimentIds$jscomp$inline_1110$$.join(","), Date.now() + 15552E6, {domain:$win$jscomp$19$$.location.hostname, $allowOnProxyOrigin$:!0});
  }
  return $on_opt_on$$;
};
_.$experimentToggles$$module$src$experiments$$ = function($params$jscomp$6_win$jscomp$20$$) {
  if ($params$jscomp$6_win$jscomp$20$$.__AMP__EXPERIMENT_TOGGLES) {
    return $params$jscomp$6_win$jscomp$20$$.__AMP__EXPERIMENT_TOGGLES;
  }
  $params$jscomp$6_win$jscomp$20$$.__AMP__EXPERIMENT_TOGGLES = Object.create(null);
  var $toggles$jscomp$2$$ = $params$jscomp$6_win$jscomp$20$$.__AMP__EXPERIMENT_TOGGLES;
  if ($params$jscomp$6_win$jscomp$20$$.AMP_CONFIG) {
    for (var $allowed_allowed$115_experimentId$jscomp$2$$ in $params$jscomp$6_win$jscomp$20$$.AMP_CONFIG) {
      var $frequency_i$116_meta_optedInExperiments$$ = $params$jscomp$6_win$jscomp$20$$.AMP_CONFIG[$allowed_allowed$115_experimentId$jscomp$2$$];
      "number" === typeof $frequency_i$116_meta_optedInExperiments$$ && 0 <= $frequency_i$116_meta_optedInExperiments$$ && 1 >= $frequency_i$116_meta_optedInExperiments$$ && ($toggles$jscomp$2$$[$allowed_allowed$115_experimentId$jscomp$2$$] = Math.random() < $frequency_i$116_meta_optedInExperiments$$);
    }
  }
  if ($params$jscomp$6_win$jscomp$20$$.AMP_CONFIG && Array.isArray($params$jscomp$6_win$jscomp$20$$.AMP_CONFIG["allow-doc-opt-in"]) && 0 < $params$jscomp$6_win$jscomp$20$$.AMP_CONFIG["allow-doc-opt-in"].length && ($allowed_allowed$115_experimentId$jscomp$2$$ = $params$jscomp$6_win$jscomp$20$$.AMP_CONFIG["allow-doc-opt-in"], $frequency_i$116_meta_optedInExperiments$$ = $params$jscomp$6_win$jscomp$20$$.document.head.querySelector('meta[name="amp-experiments-opt-in"]'))) {
    $frequency_i$116_meta_optedInExperiments$$ = $frequency_i$116_meta_optedInExperiments$$.getAttribute("content").split(",");
    for (var $i$jscomp$17_param$jscomp$4$$ = 0; $i$jscomp$17_param$jscomp$4$$ < $frequency_i$116_meta_optedInExperiments$$.length; $i$jscomp$17_param$jscomp$4$$++) {
      -1 != $allowed_allowed$115_experimentId$jscomp$2$$.indexOf($frequency_i$116_meta_optedInExperiments$$[$i$jscomp$17_param$jscomp$4$$]) && ($toggles$jscomp$2$$[$frequency_i$116_meta_optedInExperiments$$[$i$jscomp$17_param$jscomp$4$$]] = !0);
    }
  }
  Object.assign($toggles$jscomp$2$$, $getExperimentTogglesFromCookie$$module$src$experiments$$($params$jscomp$6_win$jscomp$20$$));
  if ($params$jscomp$6_win$jscomp$20$$.AMP_CONFIG && Array.isArray($params$jscomp$6_win$jscomp$20$$.AMP_CONFIG["allow-url-opt-in"]) && 0 < $params$jscomp$6_win$jscomp$20$$.AMP_CONFIG["allow-url-opt-in"].length) {
    for ($allowed_allowed$115_experimentId$jscomp$2$$ = $params$jscomp$6_win$jscomp$20$$.AMP_CONFIG["allow-url-opt-in"], $params$jscomp$6_win$jscomp$20$$ = _.$parseQueryString_$$module$src$url_parse_query_string$$($params$jscomp$6_win$jscomp$20$$.location.$D$ || $params$jscomp$6_win$jscomp$20$$.location.hash), $frequency_i$116_meta_optedInExperiments$$ = 0; $frequency_i$116_meta_optedInExperiments$$ < $allowed_allowed$115_experimentId$jscomp$2$$.length; $frequency_i$116_meta_optedInExperiments$$++) {
      $i$jscomp$17_param$jscomp$4$$ = $params$jscomp$6_win$jscomp$20$$["e-" + $allowed_allowed$115_experimentId$jscomp$2$$[$frequency_i$116_meta_optedInExperiments$$]], "1" == $i$jscomp$17_param$jscomp$4$$ && ($toggles$jscomp$2$$[$allowed_allowed$115_experimentId$jscomp$2$$[$frequency_i$116_meta_optedInExperiments$$]] = !0), "0" == $i$jscomp$17_param$jscomp$4$$ && ($toggles$jscomp$2$$[$allowed_allowed$115_experimentId$jscomp$2$$[$frequency_i$116_meta_optedInExperiments$$]] = !1);
    }
  }
  return $toggles$jscomp$2$$;
};
$getExperimentTogglesFromCookie$$module$src$experiments$$ = function($experimentCookie_tokens_win$jscomp$22$$) {
  $experimentCookie_tokens_win$jscomp$22$$ = ($experimentCookie_tokens_win$jscomp$22$$ = $getCookie$$module$src$cookies$$($experimentCookie_tokens_win$jscomp$22$$, "AMP_EXP")) ? $experimentCookie_tokens_win$jscomp$22$$.split(/\s*,\s*/g) : [];
  for (var $toggles$jscomp$3$$ = Object.create(null), $i$jscomp$18$$ = 0; $i$jscomp$18$$ < $experimentCookie_tokens_win$jscomp$22$$.length; $i$jscomp$18$$++) {
    0 != $experimentCookie_tokens_win$jscomp$22$$[$i$jscomp$18$$].length && ("-" == $experimentCookie_tokens_win$jscomp$22$$[$i$jscomp$18$$][0] ? $toggles$jscomp$3$$[$experimentCookie_tokens_win$jscomp$22$$[$i$jscomp$18$$].substr(1)] = !1 : $toggles$jscomp$3$$[$experimentCookie_tokens_win$jscomp$22$$[$i$jscomp$18$$]] = !0);
  }
  return $toggles$jscomp$3$$;
};
$includes$$module$src$polyfills$array_includes$$ = function($value$jscomp$96$$, $len_opt_fromIndex$jscomp$10$$) {
  var $fromIndex_i$jscomp$19$$ = $len_opt_fromIndex$jscomp$10$$ || 0;
  $len_opt_fromIndex$jscomp$10$$ = this.length;
  for ($fromIndex_i$jscomp$19$$ = 0 <= $fromIndex_i$jscomp$19$$ ? $fromIndex_i$jscomp$19$$ : Math.max($len_opt_fromIndex$jscomp$10$$ + $fromIndex_i$jscomp$19$$, 0); $fromIndex_i$jscomp$19$$ < $len_opt_fromIndex$jscomp$10$$; $fromIndex_i$jscomp$19$$++) {
    var $other$jscomp$4$$ = this[$fromIndex_i$jscomp$19$$];
    if ($other$jscomp$4$$ === $value$jscomp$96$$ || $value$jscomp$96$$ !== $value$jscomp$96$$ && $other$jscomp$4$$ !== $other$jscomp$4$$) {
      return !0;
    }
  }
  return !1;
};
$rethrowAsync$$module$src$polyfills$custom_elements$$ = function($error$jscomp$12$$) {
  new window.Promise(function() {
    throw $error$jscomp$12$$;
  });
};
$CustomElementRegistry$$module$src$polyfills$custom_elements$$ = function($win$jscomp$32$$, $registry$$) {
  this.$D$ = $registry$$;
  this.$F$ = $win$jscomp$32$$.Object.create(null);
};
$Registry$$module$src$polyfills$custom_elements$$ = function($win$jscomp$33$$) {
  this.$G$ = $win$jscomp$33$$;
  this.$doc_$ = $win$jscomp$33$$.document;
  this.$K$ = $win$jscomp$33$$.Object.create(null);
  this.$D$ = "";
  this.$F$ = this.$J$ = null;
  this.$I$ = [$win$jscomp$33$$.document];
};
$JSCompiler_StaticMethods_getByName$$ = function($JSCompiler_StaticMethods_getByName$self_definition$$, $name$jscomp$76$$) {
  if ($JSCompiler_StaticMethods_getByName$self_definition$$ = $JSCompiler_StaticMethods_getByName$self_definition$$.$K$[$name$jscomp$76$$]) {
    return $JSCompiler_StaticMethods_getByName$self_definition$$;
  }
};
$JSCompiler_StaticMethods_getByConstructor$$ = function($JSCompiler_StaticMethods_getByConstructor$self_definitions$$, $ctor$jscomp$2$$) {
  $JSCompiler_StaticMethods_getByConstructor$self_definitions$$ = $JSCompiler_StaticMethods_getByConstructor$self_definitions$$.$K$;
  for (var $name$jscomp$77$$ in $JSCompiler_StaticMethods_getByConstructor$self_definitions$$) {
    var $def$jscomp$1$$ = $JSCompiler_StaticMethods_getByConstructor$self_definitions$$[$name$jscomp$77$$];
    if ($def$jscomp$1$$.$ctor$ === $ctor$jscomp$2$$) {
      return $def$jscomp$1$$;
    }
  }
};
$JSCompiler_StaticMethods_Registry$$module$src$polyfills$custom_elements_prototype$upgrade$$ = function($JSCompiler_StaticMethods_Registry$$module$src$polyfills$custom_elements_prototype$upgrade$self$$, $root$jscomp$7_upgradeCandidates$$, $i$jscomp$20_opt_query$$) {
  var $newlyDefined$$ = !!$i$jscomp$20_opt_query$$;
  $root$jscomp$7_upgradeCandidates$$ = $JSCompiler_StaticMethods_queryAll_$$($root$jscomp$7_upgradeCandidates$$, $i$jscomp$20_opt_query$$ || $JSCompiler_StaticMethods_Registry$$module$src$polyfills$custom_elements_prototype$upgrade$self$$.$D$);
  for ($i$jscomp$20_opt_query$$ = 0; $i$jscomp$20_opt_query$$ < $root$jscomp$7_upgradeCandidates$$.length; $i$jscomp$20_opt_query$$++) {
    var $candidate$jscomp$1$$ = $root$jscomp$7_upgradeCandidates$$[$i$jscomp$20_opt_query$$];
    $newlyDefined$$ ? $JSCompiler_StaticMethods_connectedCallback_$$($JSCompiler_StaticMethods_Registry$$module$src$polyfills$custom_elements_prototype$upgrade$self$$, $candidate$jscomp$1$$) : $JSCompiler_StaticMethods_upgradeSelf$$($JSCompiler_StaticMethods_Registry$$module$src$polyfills$custom_elements_prototype$upgrade$self$$, $candidate$jscomp$1$$);
  }
};
$JSCompiler_StaticMethods_upgradeSelf$$ = function($JSCompiler_StaticMethods_upgradeSelf$self$$, $node$jscomp$5$$) {
  var $def$jscomp$2$$ = $JSCompiler_StaticMethods_getByName$$($JSCompiler_StaticMethods_upgradeSelf$self$$, $node$jscomp$5$$.localName);
  $def$jscomp$2$$ && $JSCompiler_StaticMethods_upgradeSelf_$$($JSCompiler_StaticMethods_upgradeSelf$self$$, $node$jscomp$5$$, $def$jscomp$2$$);
};
$JSCompiler_StaticMethods_queryAll_$$ = function($root$jscomp$8$$, $query$jscomp$10$$) {
  return $query$jscomp$10$$ && $root$jscomp$8$$.querySelectorAll ? $root$jscomp$8$$.querySelectorAll($query$jscomp$10$$) : [];
};
$JSCompiler_StaticMethods_upgradeSelf_$$ = function($JSCompiler_StaticMethods_upgradeSelf_$self$$, $node$jscomp$6$$, $ctor$jscomp$4_def$jscomp$3$$) {
  $ctor$jscomp$4_def$jscomp$3$$ = $ctor$jscomp$4_def$jscomp$3$$.$ctor$;
  if (!($node$jscomp$6$$ instanceof $ctor$jscomp$4_def$jscomp$3$$)) {
    $JSCompiler_StaticMethods_upgradeSelf_$self$$.$J$ = $node$jscomp$6$$;
    try {
      if (new $ctor$jscomp$4_def$jscomp$3$$ !== $node$jscomp$6$$) {
        throw new $JSCompiler_StaticMethods_upgradeSelf_$self$$.$G$.Error("Constructor illegally returned a different instance.");
      }
    } catch ($e$jscomp$16$$) {
      $rethrowAsync$$module$src$polyfills$custom_elements$$($e$jscomp$16$$);
    }
  }
};
$JSCompiler_StaticMethods_connectedCallback_$$ = function($JSCompiler_StaticMethods_connectedCallback_$self$$, $node$jscomp$7$$) {
  var $def$jscomp$4$$ = $JSCompiler_StaticMethods_getByName$$($JSCompiler_StaticMethods_connectedCallback_$self$$, $node$jscomp$7$$.localName);
  if ($def$jscomp$4$$ && ($JSCompiler_StaticMethods_upgradeSelf_$$($JSCompiler_StaticMethods_connectedCallback_$self$$, $node$jscomp$7$$, $def$jscomp$4$$), $node$jscomp$7$$.connectedCallback)) {
    try {
      $node$jscomp$7$$.connectedCallback();
    } catch ($e$jscomp$17$$) {
      $rethrowAsync$$module$src$polyfills$custom_elements$$($e$jscomp$17$$);
    }
  }
};
$JSCompiler_StaticMethods_observe_$$ = function($JSCompiler_StaticMethods_observe_$self$$, $name$jscomp$79$$) {
  if ($JSCompiler_StaticMethods_observe_$self$$.$D$) {
    $JSCompiler_StaticMethods_observe_$self$$.$D$ += "," + $name$jscomp$79$$;
  } else {
    $JSCompiler_StaticMethods_observe_$self$$.$D$ = $name$jscomp$79$$;
    var $mo$$ = new $JSCompiler_StaticMethods_observe_$self$$.$G$.MutationObserver(function($name$jscomp$79$$) {
      $name$jscomp$79$$ && $JSCompiler_StaticMethods_handleRecords_$$($JSCompiler_StaticMethods_observe_$self$$, $name$jscomp$79$$);
    });
    $JSCompiler_StaticMethods_observe_$self$$.$F$ = $mo$$;
    $JSCompiler_StaticMethods_observe_$self$$.$I$.forEach(function($JSCompiler_StaticMethods_observe_$self$$) {
      $mo$$.observe($JSCompiler_StaticMethods_observe_$self$$, $TRACK_SUBTREE$$module$src$polyfills$custom_elements$$);
    });
    $JSCompiler_StaticMethods_observe_$self$$.$I$.length = 0;
    $installPatches$$module$src$polyfills$custom_elements$$($JSCompiler_StaticMethods_observe_$self$$.$G$, $JSCompiler_StaticMethods_observe_$self$$);
  }
};
$JSCompiler_StaticMethods_handleRecords_$$ = function($JSCompiler_StaticMethods_handleRecords_$self$$, $records$jscomp$1$$) {
  for (var $i$jscomp$21$$ = 0; $i$jscomp$21$$ < $records$jscomp$1$$.length; $i$jscomp$21$$++) {
    var $$jscomp$destructuring$var12_record_removedNodes$$ = $records$jscomp$1$$[$i$jscomp$21$$];
    if ($$jscomp$destructuring$var12_record_removedNodes$$) {
      var $addedNodes_i$119$$ = $$jscomp$destructuring$var12_record_removedNodes$$.addedNodes;
      $$jscomp$destructuring$var12_record_removedNodes$$ = $$jscomp$destructuring$var12_record_removedNodes$$.removedNodes;
      for (var $disconnectedCandidates_i$117$$ = 0; $disconnectedCandidates_i$117$$ < $addedNodes_i$119$$.length; $disconnectedCandidates_i$117$$++) {
        var $i$118_node$jscomp$9_node$jscomp$inline_1121$$ = $addedNodes_i$119$$[$disconnectedCandidates_i$117$$], $connectedCandidates_i$121_node$120$$ = $JSCompiler_StaticMethods_queryAll_$$($i$118_node$jscomp$9_node$jscomp$inline_1121$$, $JSCompiler_StaticMethods_handleRecords_$self$$.$D$);
        $JSCompiler_StaticMethods_connectedCallback_$$($JSCompiler_StaticMethods_handleRecords_$self$$, $i$118_node$jscomp$9_node$jscomp$inline_1121$$);
        for ($i$118_node$jscomp$9_node$jscomp$inline_1121$$ = 0; $i$118_node$jscomp$9_node$jscomp$inline_1121$$ < $connectedCandidates_i$121_node$120$$.length; $i$118_node$jscomp$9_node$jscomp$inline_1121$$++) {
          $JSCompiler_StaticMethods_connectedCallback_$$($JSCompiler_StaticMethods_handleRecords_$self$$, $connectedCandidates_i$121_node$120$$[$i$118_node$jscomp$9_node$jscomp$inline_1121$$]);
        }
      }
      for ($addedNodes_i$119$$ = 0; $addedNodes_i$119$$ < $$jscomp$destructuring$var12_record_removedNodes$$.length; $addedNodes_i$119$$++) {
        $connectedCandidates_i$121_node$120$$ = $$jscomp$destructuring$var12_record_removedNodes$$[$addedNodes_i$119$$];
        $disconnectedCandidates_i$117$$ = $JSCompiler_StaticMethods_queryAll_$$($connectedCandidates_i$121_node$120$$, $JSCompiler_StaticMethods_handleRecords_$self$$.$D$);
        if ($connectedCandidates_i$121_node$120$$.disconnectedCallback) {
          try {
            $connectedCandidates_i$121_node$120$$.disconnectedCallback();
          } catch ($e$jscomp$inline_1118$$) {
            $rethrowAsync$$module$src$polyfills$custom_elements$$($e$jscomp$inline_1118$$);
          }
        }
        for ($connectedCandidates_i$121_node$120$$ = 0; $connectedCandidates_i$121_node$120$$ < $disconnectedCandidates_i$117$$.length; $connectedCandidates_i$121_node$120$$++) {
          if ($i$118_node$jscomp$9_node$jscomp$inline_1121$$ = $disconnectedCandidates_i$117$$[$connectedCandidates_i$121_node$120$$], $i$118_node$jscomp$9_node$jscomp$inline_1121$$.disconnectedCallback) {
            try {
              $i$118_node$jscomp$9_node$jscomp$inline_1121$$.disconnectedCallback();
            } catch ($e$jscomp$inline_1122$$) {
              $rethrowAsync$$module$src$polyfills$custom_elements$$($e$jscomp$inline_1122$$);
            }
          }
        }
      }
    }
  }
};
$installPatches$$module$src$polyfills$custom_elements$$ = function($nodeProto_win$jscomp$34$$, $registry$jscomp$1$$) {
  var $Object$jscomp$1$$ = $nodeProto_win$jscomp$34$$.Object, $docProto_innerHTMLDesc$$ = $nodeProto_win$jscomp$34$$.Document.prototype, $elProto$$ = $nodeProto_win$jscomp$34$$.Element.prototype;
  $nodeProto_win$jscomp$34$$ = $nodeProto_win$jscomp$34$$.Node.prototype;
  var $createElement$$ = $docProto_innerHTMLDesc$$.createElement, $importNode$$ = $docProto_innerHTMLDesc$$.importNode, $appendChild$$ = $nodeProto_win$jscomp$34$$.appendChild, $cloneNode$$ = $nodeProto_win$jscomp$34$$.cloneNode, $insertBefore$$ = $nodeProto_win$jscomp$34$$.insertBefore, $removeChild$$ = $nodeProto_win$jscomp$34$$.removeChild, $replaceChild$$ = $nodeProto_win$jscomp$34$$.replaceChild;
  $docProto_innerHTMLDesc$$.createElement = function($nodeProto_win$jscomp$34$$) {
    var $Object$jscomp$1$$ = $JSCompiler_StaticMethods_getByName$$($registry$jscomp$1$$, $nodeProto_win$jscomp$34$$);
    return $Object$jscomp$1$$ ? new $Object$jscomp$1$$.$ctor$ : $createElement$$.apply(this, arguments);
  };
  $docProto_innerHTMLDesc$$.importNode = function() {
    var $nodeProto_win$jscomp$34$$ = $importNode$$.apply(this, arguments);
    $nodeProto_win$jscomp$34$$ && ($JSCompiler_StaticMethods_upgradeSelf$$($registry$jscomp$1$$, $nodeProto_win$jscomp$34$$), $JSCompiler_StaticMethods_Registry$$module$src$polyfills$custom_elements_prototype$upgrade$$($registry$jscomp$1$$, $nodeProto_win$jscomp$34$$));
    return $nodeProto_win$jscomp$34$$;
  };
  $nodeProto_win$jscomp$34$$.appendChild = function() {
    var $nodeProto_win$jscomp$34$$ = $appendChild$$.apply(this, arguments);
    $registry$jscomp$1$$.sync();
    return $nodeProto_win$jscomp$34$$;
  };
  $nodeProto_win$jscomp$34$$.insertBefore = function() {
    var $nodeProto_win$jscomp$34$$ = $insertBefore$$.apply(this, arguments);
    $registry$jscomp$1$$.sync();
    return $nodeProto_win$jscomp$34$$;
  };
  $nodeProto_win$jscomp$34$$.removeChild = function() {
    var $nodeProto_win$jscomp$34$$ = $removeChild$$.apply(this, arguments);
    $registry$jscomp$1$$.sync();
    return $nodeProto_win$jscomp$34$$;
  };
  $nodeProto_win$jscomp$34$$.replaceChild = function() {
    var $nodeProto_win$jscomp$34$$ = $replaceChild$$.apply(this, arguments);
    $registry$jscomp$1$$.sync();
    return $nodeProto_win$jscomp$34$$;
  };
  $nodeProto_win$jscomp$34$$.cloneNode = function() {
    var $nodeProto_win$jscomp$34$$ = $cloneNode$$.apply(this, arguments);
    $JSCompiler_StaticMethods_upgradeSelf$$($registry$jscomp$1$$, $nodeProto_win$jscomp$34$$);
    $JSCompiler_StaticMethods_Registry$$module$src$polyfills$custom_elements_prototype$upgrade$$($registry$jscomp$1$$, $nodeProto_win$jscomp$34$$);
    return $nodeProto_win$jscomp$34$$;
  };
  $docProto_innerHTMLDesc$$ = $Object$jscomp$1$$.getOwnPropertyDescriptor($elProto$$, "innerHTML");
  var $innerHTMLSetter$$ = $docProto_innerHTMLDesc$$.set;
  $docProto_innerHTMLDesc$$.set = function($nodeProto_win$jscomp$34$$) {
    $innerHTMLSetter$$.call(this, $nodeProto_win$jscomp$34$$);
    $JSCompiler_StaticMethods_Registry$$module$src$polyfills$custom_elements_prototype$upgrade$$($registry$jscomp$1$$, this);
  };
  $Object$jscomp$1$$.defineProperty($elProto$$, "innerHTML", $docProto_innerHTMLDesc$$);
};
$polyfill$$module$src$polyfills$custom_elements$$ = function($win$jscomp$35$$) {
  function $HTMLElementPolyfill$$() {
    var $win$jscomp$35$$ = this.constructor;
    var $HTMLElementPolyfill$$ = $registry$jscomp$2$$.$J$;
    $registry$jscomp$2$$.$J$ = null;
    $HTMLElementPolyfill$$ || ($HTMLElementPolyfill$$ = $createElement$jscomp$1$$.call($document$jscomp$1$$, $JSCompiler_StaticMethods_getByConstructor$$($registry$jscomp$2$$, $win$jscomp$35$$).name));
    $Object$jscomp$2$$.setPrototypeOf($HTMLElementPolyfill$$, $win$jscomp$35$$.prototype);
    return $HTMLElementPolyfill$$;
  }
  var $Element$jscomp$2_elProto$jscomp$1$$ = $win$jscomp$35$$.Element, $HTMLElement$jscomp$1$$ = $win$jscomp$35$$.HTMLElement, $Object$jscomp$2$$ = $win$jscomp$35$$.Object, $document$jscomp$1$$ = $win$jscomp$35$$.document, $createElement$jscomp$1$$ = $document$jscomp$1$$.createElement, $registry$jscomp$2$$ = new $Registry$$module$src$polyfills$custom_elements$$($win$jscomp$35$$), $customElements$jscomp$2$$ = new $CustomElementRegistry$$module$src$polyfills$custom_elements$$($win$jscomp$35$$, $registry$jscomp$2$$);
  $Object$jscomp$2$$.defineProperty($win$jscomp$35$$, "customElements", {enumerable:!0, configurable:!0, value:$customElements$jscomp$2$$});
  $Element$jscomp$2_elProto$jscomp$1$$ = $Element$jscomp$2_elProto$jscomp$1$$.prototype;
  var $attachShadow$$ = $Element$jscomp$2_elProto$jscomp$1$$.attachShadow, $createShadowRoot$$ = $Element$jscomp$2_elProto$jscomp$1$$.createShadowRoot;
  $attachShadow$$ && ($Element$jscomp$2_elProto$jscomp$1$$.attachShadow = function($win$jscomp$35$$) {
    var $HTMLElementPolyfill$$ = $attachShadow$$.apply(this, arguments);
    $registry$jscomp$2$$.observe($HTMLElementPolyfill$$);
    return $HTMLElementPolyfill$$;
  }, $Element$jscomp$2_elProto$jscomp$1$$.attachShadow.toString = function() {
    return $attachShadow$$.toString();
  });
  $createShadowRoot$$ && ($Element$jscomp$2_elProto$jscomp$1$$.createShadowRoot = function() {
    var $win$jscomp$35$$ = $createShadowRoot$$.apply(this, arguments);
    $registry$jscomp$2$$.observe($win$jscomp$35$$);
    return $win$jscomp$35$$;
  }, $Element$jscomp$2_elProto$jscomp$1$$.createShadowRoot.toString = function() {
    return $createShadowRoot$$.toString();
  });
  $HTMLElementPolyfill$$.prototype = $Object$jscomp$2$$.create($HTMLElement$jscomp$1$$.prototype, {constructor:{configurable:!0, writable:!0, value:$HTMLElementPolyfill$$}});
  $win$jscomp$35$$.HTMLElement = $HTMLElementPolyfill$$;
};
_.$install$$module$src$polyfills$custom_elements$$ = function($win$jscomp$37$$) {
  -1 !== $win$jscomp$37$$.HTMLElement.toString().indexOf("[native code]") && $polyfill$$module$src$polyfills$custom_elements$$($win$jscomp$37$$);
};
$documentContainsPolyfill$$module$src$polyfills$document_contains$$ = function($node$jscomp$10$$) {
  return $node$jscomp$10$$ == this || this.documentElement.contains($node$jscomp$10$$);
};
_.$install$$module$src$polyfills$document_contains$$ = function($win$jscomp$38$$) {
  var $documentClass$$ = $win$jscomp$38$$.HTMLDocument || $win$jscomp$38$$.Document;
  $documentClass$$.prototype.contains || $win$jscomp$38$$.Object.defineProperty($documentClass$$.prototype, "contains", {enumerable:!1, configurable:!0, writable:!0, value:$documentContainsPolyfill$$module$src$polyfills$document_contains$$});
};
$domTokenListTogglePolyfill$$module$src$polyfills$domtokenlist_toggle$$ = function($token$jscomp$2$$, $opt_force$jscomp$1$$) {
  if (void 0 === $opt_force$jscomp$1$$ ? this.contains($token$jscomp$2$$) : !$opt_force$jscomp$1$$) {
    return this.remove($token$jscomp$2$$), !1;
  }
  this.add($token$jscomp$2$$);
  return !0;
};
_.$install$$module$src$polyfills$domtokenlist_toggle$$ = function($win$jscomp$39$$) {
  /Trident|MSIE|IEMobile/i.test($win$jscomp$39$$.navigator.userAgent) && $win$jscomp$39$$.DOMTokenList && $win$jscomp$39$$.Object.defineProperty($win$jscomp$39$$.DOMTokenList.prototype, "toggle", {enumerable:!1, configurable:!0, writable:!0, value:$domTokenListTogglePolyfill$$module$src$polyfills$domtokenlist_toggle$$});
};
_.$utf8Encode$$module$src$utils$bytes$$ = function($string$jscomp$7$$) {
  return "undefined" !== typeof window.TextEncoder ? (new window.TextEncoder("utf-8")).encode($string$jscomp$7$$) : _.$stringToBytes$$module$src$utils$bytes$$((0,window.unescape)((0,window.encodeURIComponent)($string$jscomp$7$$)));
};
_.$stringToBytes$$module$src$utils$bytes$$ = function($str$jscomp$7$$) {
  for (var $bytes$jscomp$1$$ = new window.Uint8Array($str$jscomp$7$$.length), $i$jscomp$22$$ = 0; $i$jscomp$22$$ < $str$jscomp$7$$.length; $i$jscomp$22$$++) {
    $bytes$jscomp$1$$[$i$jscomp$22$$] = $str$jscomp$7$$.charCodeAt($i$jscomp$22$$);
  }
  return $bytes$jscomp$1$$;
};
_.$bytesToString$$module$src$utils$bytes$$ = function($bytes$jscomp$2$$) {
  for (var $array$jscomp$7$$ = Array($bytes$jscomp$2$$.length), $i$jscomp$23$$ = 0; $i$jscomp$23$$ < $bytes$jscomp$2$$.length; $i$jscomp$23$$++) {
    $array$jscomp$7$$[$i$jscomp$23$$] = String.fromCharCode($bytes$jscomp$2$$[$i$jscomp$23$$]);
  }
  return $array$jscomp$7$$.join("");
};
_.$getCryptoRandomBytesArray$$module$src$utils$bytes$$ = function($win$jscomp$41$$, $length$jscomp$18_uint8array$$) {
  if (!$win$jscomp$41$$.crypto || !$win$jscomp$41$$.crypto.getRandomValues) {
    return null;
  }
  $length$jscomp$18_uint8array$$ = new window.Uint8Array($length$jscomp$18_uint8array$$);
  $win$jscomp$41$$.crypto.getRandomValues($length$jscomp$18_uint8array$$);
  return $length$jscomp$18_uint8array$$;
};
$fetchPolyfill$$module$src$polyfills$fetch$$ = function($input$jscomp$9$$, $init$jscomp$1$$) {
  $init$jscomp$1$$ = void 0 === $init$jscomp$1$$ ? {} : $init$jscomp$1$$;
  return new window.Promise(function($resolve$jscomp$7$$, $reject$jscomp$3$$) {
    var $requestMethod$$ = $normalizeMethod$$module$src$polyfills$fetch$$($init$jscomp$1$$.method || "GET"), $xhr$$ = $createXhrRequest$$module$src$polyfills$fetch$$($requestMethod$$, $input$jscomp$9$$);
    "include" == $init$jscomp$1$$.credentials && ($xhr$$.withCredentials = !0);
    $init$jscomp$1$$.responseType in $allowedFetchTypes$$module$src$polyfills$fetch$$ && ($xhr$$.responseType = $init$jscomp$1$$.responseType);
    $init$jscomp$1$$.headers && Object.keys($init$jscomp$1$$.headers).forEach(function($input$jscomp$9$$) {
      $xhr$$.setRequestHeader($input$jscomp$9$$, $init$jscomp$1$$.headers[$input$jscomp$9$$]);
    });
    $xhr$$.onreadystatechange = function() {
      2 > $xhr$$.readyState || (100 > $xhr$$.status || 599 < $xhr$$.status ? ($xhr$$.onreadystatechange = null, $reject$jscomp$3$$(_.$user$$module$src$log$$().$createExpectedError$("Unknown HTTP status " + $xhr$$.status))) : 4 == $xhr$$.readyState && $resolve$jscomp$7$$(new $FetchResponse$$module$src$polyfills$fetch$$($xhr$$)));
    };
    $xhr$$.onerror = function() {
      $reject$jscomp$3$$(_.$user$$module$src$log$$().$createExpectedError$("Network failure"));
    };
    $xhr$$.onabort = function() {
      $reject$jscomp$3$$(_.$user$$module$src$log$$().$createExpectedError$("Request aborted"));
    };
    "POST" == $requestMethod$$ ? $xhr$$.send($init$jscomp$1$$.body) : $xhr$$.send();
  });
};
$createXhrRequest$$module$src$polyfills$fetch$$ = function($method$jscomp$1$$, $url$jscomp$41$$) {
  var $xhr$jscomp$1$$ = new window.XMLHttpRequest;
  if ("withCredentials" in $xhr$jscomp$1$$) {
    $xhr$jscomp$1$$.open($method$jscomp$1$$, $url$jscomp$41$$, !0);
  } else {
    throw _.$dev$$module$src$log$$().$createExpectedError$("CORS is not supported");
  }
  return $xhr$jscomp$1$$;
};
$FetchResponse$$module$src$polyfills$fetch$$ = function($xhr$jscomp$2$$) {
  this.$xhr_$ = $xhr$jscomp$2$$;
  this.status = this.$xhr_$.status;
  this.statusText = this.$xhr_$.statusText;
  this.headers = new $FetchResponseHeaders$$module$src$polyfills$fetch$$($xhr$jscomp$2$$);
  this.body = null;
};
$normalizeMethod$$module$src$polyfills$fetch$$ = function($method$jscomp$2$$) {
  if (void 0 === $method$jscomp$2$$) {
    return "GET";
  }
  $method$jscomp$2$$ = $method$jscomp$2$$.toUpperCase();
  $allowedMethods$$module$src$polyfills$fetch$$.includes($method$jscomp$2$$);
  return $method$jscomp$2$$;
};
$FetchResponseHeaders$$module$src$polyfills$fetch$$ = function($xhr$jscomp$3$$) {
  this.$xhr_$ = $xhr$jscomp$3$$;
};
$Response$$module$src$polyfills$fetch$$ = function($body$jscomp$1_data$jscomp$33$$, $init$jscomp$2$$) {
  $init$jscomp$2$$ = void 0 === $init$jscomp$2$$ ? {} : $init$jscomp$2$$;
  var $lowercasedHeaders$$ = _.$map$$module$src$utils$object$$();
  $body$jscomp$1_data$jscomp$33$$ = Object.assign({status:200, statusText:"OK", responseText:$body$jscomp$1_data$jscomp$33$$ ? String($body$jscomp$1_data$jscomp$33$$) : "", getResponseHeader:function($body$jscomp$1_data$jscomp$33$$) {
    $body$jscomp$1_data$jscomp$33$$ = String($body$jscomp$1_data$jscomp$33$$).toLowerCase();
    return _.$hasOwn$$module$src$utils$object$$($lowercasedHeaders$$, $body$jscomp$1_data$jscomp$33$$) ? $lowercasedHeaders$$[$body$jscomp$1_data$jscomp$33$$] : null;
  }}, $init$jscomp$2$$);
  $body$jscomp$1_data$jscomp$33$$.status = void 0 === $init$jscomp$2$$.status ? 200 : (0,window.parseInt)($init$jscomp$2$$.status, 10);
  if (_.$isArray$$module$src$types$$($init$jscomp$2$$.headers)) {
    $init$jscomp$2$$.headers.forEach(function($body$jscomp$1_data$jscomp$33$$) {
      $lowercasedHeaders$$[String($body$jscomp$1_data$jscomp$33$$[0]).toLowerCase()] = String($body$jscomp$1_data$jscomp$33$$[1]);
    });
  } else {
    if (_.$isObject$$module$src$types$$($init$jscomp$2$$.headers)) {
      for (var $key$jscomp$47$$ in $init$jscomp$2$$.headers) {
        $lowercasedHeaders$$[String($key$jscomp$47$$).toLowerCase()] = String($init$jscomp$2$$.headers[$key$jscomp$47$$]);
      }
    }
  }
  $init$jscomp$2$$.statusText && ($body$jscomp$1_data$jscomp$33$$.statusText = String($init$jscomp$2$$.statusText));
  $FetchResponse$$module$src$polyfills$fetch$$.call(this, $body$jscomp$1_data$jscomp$33$$);
};
$sign$$module$src$polyfills$math_sign$$ = function($x$jscomp$75$$) {
  return ($x$jscomp$75$$ = Number($x$jscomp$75$$)) ? 0 < $x$jscomp$75$$ ? 1 : -1 : $x$jscomp$75$$;
};
$assign$$module$src$polyfills$object_assign$$ = function($target$jscomp$59$$, $var_args$jscomp$58$$) {
  if (null == $target$jscomp$59$$) {
    throw new TypeError("Cannot convert undefined or null to object");
  }
  for (var $output$jscomp$2$$ = Object($target$jscomp$59$$), $i$jscomp$24$$ = 1; $i$jscomp$24$$ < arguments.length; $i$jscomp$24$$++) {
    var $source$jscomp$13$$ = arguments[$i$jscomp$24$$];
    if (null != $source$jscomp$13$$) {
      for (var $key$jscomp$48$$ in $source$jscomp$13$$) {
        $hasOwnProperty$$module$src$polyfills$object_assign$$.call($source$jscomp$13$$, $key$jscomp$48$$) && ($output$jscomp$2$$[$key$jscomp$48$$] = $source$jscomp$13$$[$key$jscomp$48$$]);
      }
    }
  }
  return $output$jscomp$2$$;
};
$values$$module$src$polyfills$object_values$$ = function($target$jscomp$60$$) {
  return Object.keys($target$jscomp$60$$).map(function($k$jscomp$4$$) {
    return $target$jscomp$60$$[$k$jscomp$4$$];
  });
};
$Promise$$module$promise_pjs$promise$$ = function($resolver$jscomp$1$$) {
  if (!(this instanceof $Promise$$module$promise_pjs$promise$$)) {
    throw new TypeError("Constructor Promise requires `new`");
  }
  if (!$isFunction$$module$promise_pjs$promise$$($resolver$jscomp$1$$)) {
    throw new TypeError("Must pass resolver function");
  }
  this.$_state$ = $PendingPromise$$module$promise_pjs$promise$$;
  this.$_value$ = [];
  this.$_isChainEnd$ = !0;
  $doResolve$$module$promise_pjs$promise$$(this, $adopter$$module$promise_pjs$promise$$(this, $FulfilledPromise$$module$promise_pjs$promise$$), $adopter$$module$promise_pjs$promise$$(this, $RejectedPromise$$module$promise_pjs$promise$$), {then:$resolver$jscomp$1$$});
};
$Promise$$module$promise_pjs$promise$resolve$$ = function($value$jscomp$97$$) {
  var $promise$jscomp$2$$;
  $value$jscomp$97$$ === Object($value$jscomp$97$$) && $value$jscomp$97$$ instanceof this ? $promise$jscomp$2$$ = $value$jscomp$97$$ : $promise$jscomp$2$$ = new this(function($promise$jscomp$2$$) {
    $promise$jscomp$2$$($value$jscomp$97$$);
  });
  return $promise$jscomp$2$$;
};
$Promise$$module$promise_pjs$promise$reject$$ = function($reason$jscomp$6$$) {
  return new this(function($_$$, $reject$jscomp$4$$) {
    $reject$jscomp$4$$($reason$jscomp$6$$);
  });
};
$Promise$$module$promise_pjs$promise$all$$ = function($promises$jscomp$1$$) {
  var $Constructor$jscomp$2$$ = this;
  return new $Constructor$jscomp$2$$(function($resolve$jscomp$9$$, $reject$jscomp$5$$) {
    var $length$jscomp$19$$ = $promises$jscomp$1$$.length, $values$jscomp$6$$ = Array($length$jscomp$19$$);
    if (0 === $length$jscomp$19$$) {
      return $resolve$jscomp$9$$($values$jscomp$6$$);
    }
    $each$$module$promise_pjs$promise$$($promises$jscomp$1$$, function($promises$jscomp$1$$, $index$jscomp$59$$) {
      $Constructor$jscomp$2$$.resolve($promises$jscomp$1$$).then(function($promises$jscomp$1$$) {
        $values$jscomp$6$$[$index$jscomp$59$$] = $promises$jscomp$1$$;
        0 === --$length$jscomp$19$$ && $resolve$jscomp$9$$($values$jscomp$6$$);
      }, $reject$jscomp$5$$);
    });
  });
};
$Promise$$module$promise_pjs$promise$race$$ = function($promises$jscomp$2$$) {
  var $Constructor$jscomp$3$$ = this;
  return new $Constructor$jscomp$3$$(function($resolve$jscomp$10$$, $reject$jscomp$6$$) {
    for (var $i$jscomp$25$$ = 0; $i$jscomp$25$$ < $promises$jscomp$2$$.length; $i$jscomp$25$$++) {
      $Constructor$jscomp$3$$.resolve($promises$jscomp$2$$[$i$jscomp$25$$]).then($resolve$jscomp$10$$, $reject$jscomp$6$$);
    }
  });
};
$FulfilledPromise$$module$promise_pjs$promise$$ = function($value$jscomp$99$$, $onFulfilled$jscomp$2_promise$jscomp$inline_1133$$, $unused$jscomp$1$$, $deferred$jscomp$3$$) {
  if (!$onFulfilled$jscomp$2_promise$jscomp$inline_1133$$) {
    return $deferred$jscomp$3$$ && ($onFulfilled$jscomp$2_promise$jscomp$inline_1133$$ = $deferred$jscomp$3$$.$promise$, $onFulfilled$jscomp$2_promise$jscomp$inline_1133$$.$_state$ = $FulfilledPromise$$module$promise_pjs$promise$$, $onFulfilled$jscomp$2_promise$jscomp$inline_1133$$.$_value$ = $value$jscomp$99$$), this;
  }
  $deferred$jscomp$3$$ || ($deferred$jscomp$3$$ = new $Deferred$$module$promise_pjs$promise$$(this.constructor));
  $defer$$module$promise_pjs$promise$$($tryCatchDeferred$$module$promise_pjs$promise$$($deferred$jscomp$3$$, $onFulfilled$jscomp$2_promise$jscomp$inline_1133$$, $value$jscomp$99$$));
  return $deferred$jscomp$3$$.$promise$;
};
$RejectedPromise$$module$promise_pjs$promise$$ = function($reason$jscomp$8$$, $promise$jscomp$inline_1138_unused$jscomp$2$$, $onRejected$jscomp$4$$, $deferred$jscomp$4$$) {
  if (!$onRejected$jscomp$4$$) {
    return $deferred$jscomp$4$$ && ($promise$jscomp$inline_1138_unused$jscomp$2$$ = $deferred$jscomp$4$$.$promise$, $promise$jscomp$inline_1138_unused$jscomp$2$$.$_state$ = $RejectedPromise$$module$promise_pjs$promise$$, $promise$jscomp$inline_1138_unused$jscomp$2$$.$_value$ = $reason$jscomp$8$$), this;
  }
  $deferred$jscomp$4$$ || ($deferred$jscomp$4$$ = new $Deferred$$module$promise_pjs$promise$$(this.constructor));
  $defer$$module$promise_pjs$promise$$($tryCatchDeferred$$module$promise_pjs$promise$$($deferred$jscomp$4$$, $onRejected$jscomp$4$$, $reason$jscomp$8$$));
  return $deferred$jscomp$4$$.$promise$;
};
$PendingPromise$$module$promise_pjs$promise$$ = function($queue$jscomp$2$$, $onFulfilled$jscomp$3$$, $onRejected$jscomp$5$$, $deferred$jscomp$5$$) {
  if (!$deferred$jscomp$5$$) {
    if (!$onFulfilled$jscomp$3$$ && !$onRejected$jscomp$5$$) {
      return this;
    }
    $deferred$jscomp$5$$ = new $Deferred$$module$promise_pjs$promise$$(this.constructor);
  }
  $queue$jscomp$2$$.push({$deferred$:$deferred$jscomp$5$$, $onFulfilled$:$onFulfilled$jscomp$3$$ || $deferred$jscomp$5$$.resolve, $onRejected$:$onRejected$jscomp$5$$ || $deferred$jscomp$5$$.reject});
  return $deferred$jscomp$5$$.$promise$;
};
$Deferred$$module$promise_pjs$promise$$ = function($Promise$jscomp$2$$) {
  var $deferred$jscomp$6$$ = this;
  this.$promise$ = new $Promise$jscomp$2$$(function($Promise$jscomp$2$$, $reject$jscomp$7$$) {
    $deferred$jscomp$6$$.resolve = $Promise$jscomp$2$$;
    $deferred$jscomp$6$$.reject = $reject$jscomp$7$$;
  });
  return $deferred$jscomp$6$$;
};
$adopt$$module$promise_pjs$promise$$ = function($promise$jscomp$8$$, $state$$, $value$jscomp$100$$, $adoptee_i$jscomp$26$$) {
  var $queue$jscomp$3$$ = $promise$jscomp$8$$.$_value$;
  $promise$jscomp$8$$.$_state$ = $state$$;
  $promise$jscomp$8$$.$_value$ = $value$jscomp$100$$;
  $adoptee_i$jscomp$26$$ && $state$$ === $PendingPromise$$module$promise_pjs$promise$$ && $adoptee_i$jscomp$26$$.$_state$($value$jscomp$100$$, void 0, void 0, {$promise$:$promise$jscomp$8$$, resolve:void 0, reject:void 0});
  for ($adoptee_i$jscomp$26$$ = 0; $adoptee_i$jscomp$26$$ < $queue$jscomp$3$$.length; $adoptee_i$jscomp$26$$++) {
    var $next$jscomp$1$$ = $queue$jscomp$3$$[$adoptee_i$jscomp$26$$];
    $promise$jscomp$8$$.$_state$($value$jscomp$100$$, $next$jscomp$1$$.$onFulfilled$, $next$jscomp$1$$.$onRejected$, $next$jscomp$1$$.$deferred$);
  }
  $queue$jscomp$3$$.length = 0;
  $state$$ === $RejectedPromise$$module$promise_pjs$promise$$ && $promise$jscomp$8$$.$_isChainEnd$ && (0,window.setTimeout)(function() {
    if ($promise$jscomp$8$$.$_isChainEnd$) {
      throw $value$jscomp$100$$;
    }
  }, 0);
};
$adopter$$module$promise_pjs$promise$$ = function($promise$jscomp$9$$, $state$jscomp$1$$) {
  return function($value$jscomp$101$$) {
    $adopt$$module$promise_pjs$promise$$($promise$jscomp$9$$, $state$jscomp$1$$, $value$jscomp$101$$);
  };
};
$noop$$module$promise_pjs$promise$$ = function() {
};
$isFunction$$module$promise_pjs$promise$$ = function($fn$jscomp$3$$) {
  return "function" === typeof $fn$jscomp$3$$;
};
$each$$module$promise_pjs$promise$$ = function($collection$$, $iterator$jscomp$7$$) {
  for (var $i$jscomp$27$$ = 0; $i$jscomp$27$$ < $collection$$.length; $i$jscomp$27$$++) {
    $iterator$jscomp$7$$($collection$$[$i$jscomp$27$$], $i$jscomp$27$$);
  }
};
$tryCatchDeferred$$module$promise_pjs$promise$$ = function($deferred$jscomp$8$$, $fn$jscomp$4$$, $arg$jscomp$7$$) {
  var $promise$jscomp$11$$ = $deferred$jscomp$8$$.$promise$, $resolve$jscomp$12$$ = $deferred$jscomp$8$$.resolve, $reject$jscomp$8$$ = $deferred$jscomp$8$$.reject;
  return function() {
    try {
      var $deferred$jscomp$8$$ = $fn$jscomp$4$$($arg$jscomp$7$$);
      $doResolve$$module$promise_pjs$promise$$($promise$jscomp$11$$, $resolve$jscomp$12$$, $reject$jscomp$8$$, $deferred$jscomp$8$$, $deferred$jscomp$8$$);
    } catch ($e$jscomp$20$$) {
      $reject$jscomp$8$$($e$jscomp$20$$);
    }
  };
};
$doResolve$$module$promise_pjs$promise$$ = function($promise$jscomp$12$$, $resolve$jscomp$13$$, $reject$jscomp$9$$, $value$jscomp$103$$, $context$$) {
  var $_reject$$ = $reject$jscomp$9$$, $then$$;
  try {
    if ($value$jscomp$103$$ === $promise$jscomp$12$$) {
      throw new TypeError("Cannot fulfill promise with itself");
    }
    var $isObj$$ = $value$jscomp$103$$ === Object($value$jscomp$103$$);
    if ($isObj$$ && $value$jscomp$103$$ instanceof $promise$jscomp$12$$.constructor) {
      $adopt$$module$promise_pjs$promise$$($promise$jscomp$12$$, $value$jscomp$103$$.$_state$, $value$jscomp$103$$.$_value$, $value$jscomp$103$$);
    } else {
      if ($isObj$$ && ($then$$ = $value$jscomp$103$$.then) && $isFunction$$module$promise_pjs$promise$$($then$$)) {
        var $_resolve$$ = function($value$jscomp$103$$) {
          $_resolve$$ = $_reject$$ = $noop$$module$promise_pjs$promise$$;
          $doResolve$$module$promise_pjs$promise$$($promise$jscomp$12$$, $resolve$jscomp$13$$, $reject$jscomp$9$$, $value$jscomp$103$$, $value$jscomp$103$$);
        };
        $_reject$$ = function($promise$jscomp$12$$) {
          $_resolve$$ = $_reject$$ = $noop$$module$promise_pjs$promise$$;
          $reject$jscomp$9$$($promise$jscomp$12$$);
        };
        $then$$.call($context$$, function($promise$jscomp$12$$) {
          $_resolve$$($promise$jscomp$12$$);
        }, function($promise$jscomp$12$$) {
          $_reject$$($promise$jscomp$12$$);
        });
      } else {
        $resolve$jscomp$13$$($value$jscomp$103$$);
      }
    }
  } catch ($e$jscomp$21$$) {
    $_reject$$($e$jscomp$21$$);
  }
};
_.$installCustomElements$$module$document_register_element$build$document_register_element_patched$$ = function($window$jscomp$1$$) {
  function $secondArgument$$($window$jscomp$1$$) {
    return $window$jscomp$1$$.toLowerCase();
  }
  var $polyfill$$ = "auto";
  function $ASAP$$() {
    var $window$jscomp$1$$ = $asapQueue$$.splice(0, $asapQueue$$.length);
    for ($asapTimer$$ = 0; $window$jscomp$1$$.length;) {
      $window$jscomp$1$$.shift().call(null, $window$jscomp$1$$.shift());
    }
  }
  function $loopAndVerify$$($window$jscomp$1$$, $secondArgument$$) {
    for (var $polyfill$$ = 0, $ASAP$$ = $window$jscomp$1$$.length; $polyfill$$ < $ASAP$$; $polyfill$$++) {
      $verifyAndSetupAndAction$$($window$jscomp$1$$[$polyfill$$], $secondArgument$$);
    }
  }
  function $executeAction$$($window$jscomp$1$$) {
    return function($secondArgument$$) {
      $isValidNode$$($secondArgument$$) && ($verifyAndSetupAndAction$$($secondArgument$$, $window$jscomp$1$$), $query$jscomp$11$$.length && $loopAndVerify$$($secondArgument$$.querySelectorAll($query$jscomp$11$$), $window$jscomp$1$$));
    };
  }
  function $getTypeIndex$$($window$jscomp$1$$) {
    var $secondArgument$$ = $getAttribute$$.call($window$jscomp$1$$, "is");
    $window$jscomp$1$$ = $window$jscomp$1$$.nodeName.toUpperCase();
    var $polyfill$$ = $indexOf$$.call($types$$, $secondArgument$$ ? "=" + $secondArgument$$.toUpperCase() : "<" + $window$jscomp$1$$);
    return $secondArgument$$ && -1 < $polyfill$$ && !(-1 < $query$jscomp$11$$.indexOf($window$jscomp$1$$ + '[is="' + $secondArgument$$ + '"]')) ? -1 : $polyfill$$;
  }
  function $onDOMAttrModified$$($window$jscomp$1$$) {
    var $secondArgument$$ = $window$jscomp$1$$.currentTarget, $polyfill$$ = $window$jscomp$1$$.attrChange, $ASAP$$ = $window$jscomp$1$$.attrName, $loopAndVerify$$ = $window$jscomp$1$$.target, $executeAction$$ = $window$jscomp$1$$.ADDITION || 2, $getTypeIndex$$ = $window$jscomp$1$$.REMOVAL || 3;
    !$notFromInnerHTMLHelper$$ || $loopAndVerify$$ && $loopAndVerify$$ !== $secondArgument$$ || !$secondArgument$$.attributeChangedCallback || "style" === $ASAP$$ || $window$jscomp$1$$.prevValue === $window$jscomp$1$$.newValue && ("" !== $window$jscomp$1$$.newValue || $polyfill$$ !== $executeAction$$ && $polyfill$$ !== $getTypeIndex$$) || $secondArgument$$.attributeChangedCallback($ASAP$$, $polyfill$$ === $executeAction$$ ? null : $window$jscomp$1$$.prevValue, $polyfill$$ === $getTypeIndex$$ ? null : 
    $window$jscomp$1$$.newValue);
  }
  function $onDOMNode$$($window$jscomp$1$$) {
    var $secondArgument$$ = $executeAction$$($window$jscomp$1$$);
    return function($window$jscomp$1$$) {
      $asapQueue$$.push($secondArgument$$, $window$jscomp$1$$.target);
      $asapTimer$$ && (0,window.clearTimeout)($asapTimer$$);
      $asapTimer$$ = (0,window.setTimeout)($ASAP$$, 1);
    };
  }
  function $onReadyStateChange$$($window$jscomp$1$$) {
    $dropDomContentLoaded$$ && ($dropDomContentLoaded$$ = !1, $window$jscomp$1$$.currentTarget.removeEventListener("DOMContentLoaded", $onReadyStateChange$$));
    $query$jscomp$11$$.length && $loopAndVerify$$(($window$jscomp$1$$.target || $document$jscomp$2$$).querySelectorAll($query$jscomp$11$$), "detached" === $window$jscomp$1$$.detail ? "detached" : "attached");
    if ($IE8$$) {
      for (var $secondArgument$$ = 0, $polyfill$$ = $targets$$.length; $secondArgument$$ < $polyfill$$; $secondArgument$$++) {
        $window$jscomp$1$$ = $targets$$[$secondArgument$$], $documentElement$$.contains($window$jscomp$1$$) || ($polyfill$$--, $targets$$.splice($secondArgument$$--, 1), $verifyAndSetupAndAction$$($window$jscomp$1$$, "detached"));
      }
    }
  }
  function $patchedSetAttribute$$($window$jscomp$1$$, $secondArgument$$) {
    $setAttribute$$.call(this, $window$jscomp$1$$, $secondArgument$$);
    $onSubtreeModified$$.call(this, {target:this});
  }
  function $setupNode$$($window$jscomp$1$$, $secondArgument$$) {
    $setPrototype$$($window$jscomp$1$$, $secondArgument$$);
    $observer$jscomp$1$$ ? $observer$jscomp$1$$.observe($window$jscomp$1$$, $attributesObserver$$) : ($doesNotSupportDOMAttrModified$$ && ($window$jscomp$1$$.setAttribute = $patchedSetAttribute$$, $window$jscomp$1$$[$EXPANDO_UID$$] = $getAttributesMirror$$($window$jscomp$1$$), $window$jscomp$1$$.addEventListener("DOMSubtreeModified", $onSubtreeModified$$)), $window$jscomp$1$$.addEventListener("DOMAttrModified", $onDOMAttrModified$$));
    $window$jscomp$1$$.createdCallback && $notFromInnerHTMLHelper$$ && ($window$jscomp$1$$.$created$ = !0, $window$jscomp$1$$.createdCallback(), $window$jscomp$1$$.$created$ = !1);
  }
  function $throwTypeError$$($window$jscomp$1$$) {
    throw Error("A " + $window$jscomp$1$$ + " type is already registered");
  }
  function $verifyAndSetupAndAction$$($window$jscomp$1$$, $secondArgument$$) {
    var $polyfill$$, $ASAP$$ = $getTypeIndex$$($window$jscomp$1$$);
    -1 < $ASAP$$ && ($patchIfNotAlready$$($window$jscomp$1$$, $protos$$[$ASAP$$]), $ASAP$$ = 0, "attached" !== $secondArgument$$ || $window$jscomp$1$$.attached ? "detached" !== $secondArgument$$ || $window$jscomp$1$$.detached || ($window$jscomp$1$$.attached = !1, $window$jscomp$1$$.detached = !0, $ASAP$$ = 1) : ($window$jscomp$1$$.detached = !1, $window$jscomp$1$$.attached = !0, $ASAP$$ = 1, $IE8$$ && 0 > $indexOf$$.call($targets$$, $window$jscomp$1$$) && $targets$$.push($window$jscomp$1$$)), $ASAP$$ && 
    ($polyfill$$ = $window$jscomp$1$$[$secondArgument$$ + "Callback"]) && $polyfill$$.call($window$jscomp$1$$));
  }
  function $CustomElementRegistry$jscomp$1$$() {
  }
  function $CERDefine$$($window$jscomp$1$$, $polyfill$$, $ASAP$$) {
    $ASAP$$ = $ASAP$$ && $ASAP$$["extends"] || "";
    var $loopAndVerify$$ = $polyfill$$.prototype, $executeAction$$ = $create$$($loopAndVerify$$), $getTypeIndex$$ = $polyfill$$.observedAttributes || $empty$$, $onDOMAttrModified$$ = {prototype:$executeAction$$};
    $safeProperty$$($executeAction$$, "createdCallback", {value:function() {
      if ($justCreated$$) {
        $justCreated$$ = !1;
      } else {
        if (!this.__dreCEv1) {
          this.__dreCEv1 = !0;
          new $polyfill$$(this);
          $loopAndVerify$$.createdCallback && $loopAndVerify$$.createdCallback.call(this);
          var $window$jscomp$1$$ = $constructors$$[$nodeNames$$.get($polyfill$$)];
          (!$usableCustomElements$$ || 1 < $window$jscomp$1$$.create.length) && $notifyAttributes$$(this);
        }
      }
    }});
    $safeProperty$$($executeAction$$, "attributeChangedCallback", {value:function($window$jscomp$1$$) {
      -1 < $indexOf$$.call($getTypeIndex$$, $window$jscomp$1$$) && $loopAndVerify$$.attributeChangedCallback.apply(this, arguments);
    }});
    $loopAndVerify$$.connectedCallback && $safeProperty$$($executeAction$$, "attachedCallback", {value:$loopAndVerify$$.connectedCallback});
    $loopAndVerify$$.disconnectedCallback && $safeProperty$$($executeAction$$, "detachedCallback", {value:$loopAndVerify$$.disconnectedCallback});
    $ASAP$$ && ($onDOMAttrModified$$["extends"] = $ASAP$$);
    $window$jscomp$1$$ = $window$jscomp$1$$.toUpperCase();
    $constructors$$[$window$jscomp$1$$] = {constructor:$polyfill$$, create:$ASAP$$ ? [$ASAP$$, $secondArgument$$($window$jscomp$1$$)] : [$window$jscomp$1$$]};
    $nodeNames$$.set($polyfill$$, $window$jscomp$1$$);
    $document$jscomp$2$$.registerElement($window$jscomp$1$$.toLowerCase(), $onDOMAttrModified$$);
    $whenDefined$$($window$jscomp$1$$);
    $waitingList$$[$window$jscomp$1$$].r();
  }
  function $get$$($window$jscomp$1$$) {
    return ($window$jscomp$1$$ = $constructors$$[$window$jscomp$1$$.toUpperCase()]) && $window$jscomp$1$$.constructor;
  }
  function $getIs$$($window$jscomp$1$$) {
    return "string" === typeof $window$jscomp$1$$ ? $window$jscomp$1$$ : $window$jscomp$1$$ && $window$jscomp$1$$.is || "";
  }
  function $notifyAttributes$$($window$jscomp$1$$) {
    for (var $secondArgument$$ = $window$jscomp$1$$.attributeChangedCallback, $polyfill$$ = $secondArgument$$ ? $window$jscomp$1$$.attributes : $empty$$, $ASAP$$ = $polyfill$$.length, $loopAndVerify$$; $ASAP$$--;) {
      $loopAndVerify$$ = $polyfill$$[$ASAP$$], $secondArgument$$.call($window$jscomp$1$$, $loopAndVerify$$.name || $loopAndVerify$$.nodeName, null, $loopAndVerify$$.value || $loopAndVerify$$.nodeValue);
    }
  }
  function $whenDefined$$($window$jscomp$1$$) {
    $window$jscomp$1$$ = $window$jscomp$1$$.toUpperCase();
    $window$jscomp$1$$ in $waitingList$$ || ($waitingList$$[$window$jscomp$1$$] = {}, $waitingList$$[$window$jscomp$1$$].p = new $Promise$jscomp$3$$(function($secondArgument$$) {
      $waitingList$$[$window$jscomp$1$$].r = $secondArgument$$;
    }));
    return $waitingList$$[$window$jscomp$1$$].p;
  }
  function $polyfillV1$$() {
    function $polyfill$$($secondArgument$$) {
      var $polyfill$$ = $window$jscomp$1$$[$secondArgument$$];
      if ($polyfill$$) {
        $window$jscomp$1$$[$secondArgument$$] = function($window$jscomp$1$$) {
          var $secondArgument$$;
          $window$jscomp$1$$ || ($window$jscomp$1$$ = this);
          $window$jscomp$1$$.__dreCEv1 || ($justCreated$$ = !0, $window$jscomp$1$$ = $constructors$$[$nodeNames$$.get($window$jscomp$1$$.constructor)], $window$jscomp$1$$ = ($secondArgument$$ = $usableCustomElements$$ && 1 === $window$jscomp$1$$.create.length) ? window.Reflect.construct($polyfill$$, $empty$$, $window$jscomp$1$$.constructor) : $document$jscomp$2$$.createElement.apply($document$jscomp$2$$, $window$jscomp$1$$.create), $window$jscomp$1$$.__dreCEv1 = !0, $justCreated$$ = !1, $secondArgument$$ || 
          $notifyAttributes$$($window$jscomp$1$$));
          return $window$jscomp$1$$;
        };
        $window$jscomp$1$$[$secondArgument$$].prototype = $polyfill$$.prototype;
        try {
          $polyfill$$.prototype.constructor = $window$jscomp$1$$[$secondArgument$$];
        } catch ($WebKit$$) {
          $defineProperty$$($polyfill$$, "__dreCEv1", {value:$window$jscomp$1$$[$secondArgument$$]});
        }
      }
    }
    $customElements$jscomp$3$$ && delete $window$jscomp$1$$.customElements;
    $defineProperty$$($window$jscomp$1$$, "customElements", {configurable:!0, value:new $CustomElementRegistry$jscomp$1$$});
    $defineProperty$$($window$jscomp$1$$, "CustomElementRegistry", {configurable:!0, value:$CustomElementRegistry$jscomp$1$$});
    for (var $ASAP$$ = $htmlClass$$.get(/^HTML[A-Z]*[a-z]/), $loopAndVerify$$ = $ASAP$$.length; $loopAndVerify$$--; $polyfill$$($ASAP$$[$loopAndVerify$$])) {
    }
    $document$jscomp$2$$.createElement = function($window$jscomp$1$$, $polyfill$$) {
      return ($polyfill$$ = $getIs$$($polyfill$$)) ? $patchedCreateElement$$.call(this, $window$jscomp$1$$, $secondArgument$$($polyfill$$)) : $patchedCreateElement$$.call(this, $window$jscomp$1$$);
    };
    $V0$$ || ($justSetup$$ = !0, $document$jscomp$2$$.registerElement(""));
  }
  var $document$jscomp$2$$ = $window$jscomp$1$$.document, $Object$jscomp$5$$ = $window$jscomp$1$$.Object, $htmlClass$$ = function($window$jscomp$1$$) {
    function $secondArgument$$($window$jscomp$1$$, $secondArgument$$) {
      $secondArgument$$ = $secondArgument$$.toLowerCase();
      $secondArgument$$ in $ASAP$$ || ($ASAP$$[$window$jscomp$1$$] = ($ASAP$$[$window$jscomp$1$$] || []).concat($secondArgument$$), $ASAP$$[$secondArgument$$] = $ASAP$$[$secondArgument$$.toUpperCase()] = $window$jscomp$1$$);
    }
    var $polyfill$$ = /^[A-Z]+[a-z]/, $ASAP$$ = ($Object$jscomp$5$$.create || $Object$jscomp$5$$)(null), $loopAndVerify$$ = {}, $executeAction$$, $getTypeIndex$$, $onDOMAttrModified$$;
    for ($getTypeIndex$$ in $window$jscomp$1$$) {
      for ($onDOMAttrModified$$ in $window$jscomp$1$$[$getTypeIndex$$]) {
        var $onDOMNode$$ = $window$jscomp$1$$[$getTypeIndex$$][$onDOMAttrModified$$];
        $ASAP$$[$onDOMAttrModified$$] = $onDOMNode$$;
        for ($executeAction$$ = 0; $executeAction$$ < $onDOMNode$$.length; $executeAction$$++) {
          $ASAP$$[$onDOMNode$$[$executeAction$$].toLowerCase()] = $ASAP$$[$onDOMNode$$[$executeAction$$].toUpperCase()] = $onDOMAttrModified$$;
        }
      }
    }
    $loopAndVerify$$.get = function($window$jscomp$1$$) {
      if ("string" === typeof $window$jscomp$1$$) {
        $window$jscomp$1$$ = $ASAP$$[$window$jscomp$1$$] || ($polyfill$$.test($window$jscomp$1$$) ? [] : "");
      } else {
        var $secondArgument$$ = [], $loopAndVerify$$;
        for ($loopAndVerify$$ in $ASAP$$) {
          $window$jscomp$1$$.test($loopAndVerify$$) && $secondArgument$$.push($loopAndVerify$$);
        }
        $window$jscomp$1$$ = $secondArgument$$;
      }
      return $window$jscomp$1$$;
    };
    $loopAndVerify$$.set = function($window$jscomp$1$$, $ASAP$$) {
      return $polyfill$$.test($window$jscomp$1$$) ? $secondArgument$$($window$jscomp$1$$, $ASAP$$) : $secondArgument$$($ASAP$$, $window$jscomp$1$$), $loopAndVerify$$;
    };
    return $loopAndVerify$$;
  }({collections:{HTMLAllCollection:["all"], HTMLCollection:["forms"], HTMLFormControlsCollection:["elements"], HTMLOptionsCollection:["options"]}, elements:{Element:["element"], HTMLAnchorElement:["a"], HTMLAppletElement:["applet"], HTMLAreaElement:["area"], HTMLAttachmentElement:["attachment"], HTMLAudioElement:["audio"], HTMLBRElement:["br"], HTMLBaseElement:["base"], HTMLBodyElement:["body"], HTMLButtonElement:["button"], HTMLCanvasElement:["canvas"], HTMLContentElement:["content"], HTMLDListElement:["dl"], 
  HTMLDataElement:["data"], HTMLDataListElement:["datalist"], HTMLDetailsElement:["details"], HTMLDialogElement:["dialog"], HTMLDirectoryElement:["dir"], HTMLDivElement:["div"], HTMLDocument:["document"], HTMLElement:"element abbr address article aside b bdi bdo cite code command dd dfn dt em figcaption figure footer header i kbd mark nav noscript rp rt ruby s samp section small strong sub summary sup u var wbr".split(" "), HTMLEmbedElement:["embed"], HTMLFieldSetElement:["fieldset"], HTMLFontElement:["font"], 
  HTMLFormElement:["form"], HTMLFrameElement:["frame"], HTMLFrameSetElement:["frameset"], HTMLHRElement:["hr"], HTMLHeadElement:["head"], HTMLHeadingElement:"h1 h2 h3 h4 h5 h6".split(" "), HTMLHtmlElement:["html"], HTMLIFrameElement:["iframe"], HTMLImageElement:["img"], HTMLInputElement:["input"], HTMLKeygenElement:["keygen"], HTMLLIElement:["li"], HTMLLabelElement:["label"], HTMLLegendElement:["legend"], HTMLLinkElement:["link"], HTMLMapElement:["map"], HTMLMarqueeElement:["marquee"], HTMLMediaElement:["media"], 
  HTMLMenuElement:["menu"], HTMLMenuItemElement:["menuitem"], HTMLMetaElement:["meta"], HTMLMeterElement:["meter"], HTMLModElement:["del", "ins"], HTMLOListElement:["ol"], HTMLObjectElement:["object"], HTMLOptGroupElement:["optgroup"], HTMLOptionElement:["option"], HTMLOutputElement:["output"], HTMLParagraphElement:["p"], HTMLParamElement:["param"], HTMLPictureElement:["picture"], HTMLPreElement:["pre"], HTMLProgressElement:["progress"], HTMLQuoteElement:["blockquote", "q", "quote"], HTMLScriptElement:["script"], 
  HTMLSelectElement:["select"], HTMLShadowElement:["shadow"], HTMLSlotElement:["slot"], HTMLSourceElement:["source"], HTMLSpanElement:["span"], HTMLStyleElement:["style"], HTMLTableCaptionElement:["caption"], HTMLTableCellElement:["td", "th"], HTMLTableColElement:["col", "colgroup"], HTMLTableElement:["table"], HTMLTableRowElement:["tr"], HTMLTableSectionElement:["thead", "tbody", "tfoot"], HTMLTemplateElement:["template"], HTMLTextAreaElement:["textarea"], HTMLTimeElement:["time"], HTMLTitleElement:["title"], 
  HTMLTrackElement:["track"], HTMLUListElement:["ul"], HTMLUnknownElement:["unknown", "vhgroupv", "vkeygen"], HTMLVideoElement:["video"]}, nodes:{Attr:["node"], Audio:["audio"], CDATASection:["node"], CharacterData:["node"], Comment:["#comment"], Document:["#document"], DocumentFragment:["#document-fragment"], DocumentType:["node"], HTMLDocument:["#document"], Image:["img"], Option:["option"], ProcessingInstruction:["node"], ShadowRoot:["#shadow-root"], Text:["#text"], XMLDocument:["xml"]}});
  $polyfill$$ || ($polyfill$$ = "auto");
  var $EXPANDO_UID$$ = "__registerElement" + (10e4 * $window$jscomp$1$$.Math.random() >> 0), $validName$$ = /^[A-Z][A-Z0-9]*(?:-[A-Z0-9]+)+$/, $invalidNames$$ = "ANNOTATION-XML COLOR-PROFILE FONT-FACE FONT-FACE-SRC FONT-FACE-URI FONT-FACE-FORMAT FONT-FACE-NAME MISSING-GLYPH".split(" "), $types$$ = [], $protos$$ = [], $query$jscomp$11$$ = "", $documentElement$$ = $document$jscomp$2$$.documentElement, $indexOf$$ = $types$$.indexOf || function($window$jscomp$1$$) {
    for (var $secondArgument$$ = this.length; $secondArgument$$-- && this[$secondArgument$$] !== $window$jscomp$1$$;) {
    }
    return $secondArgument$$;
  }, $OP$$ = $Object$jscomp$5$$.prototype, $hOP$$ = $OP$$.hasOwnProperty, $iPO$$ = $OP$$.isPrototypeOf, $defineProperty$$ = $Object$jscomp$5$$.defineProperty, $empty$$ = [], $gOPD$$ = $Object$jscomp$5$$.getOwnPropertyDescriptor, $gOPN$$ = $Object$jscomp$5$$.getOwnPropertyNames, $gPO$$ = $Object$jscomp$5$$.getPrototypeOf, $sPO$$ = $Object$jscomp$5$$.setPrototypeOf, $hasProto$$ = !!$Object$jscomp$5$$.__proto__, $customElements$jscomp$3$$ = $window$jscomp$1$$.customElements, $usableCustomElements$$ = 
  "force" !== $polyfill$$ && !!($customElements$jscomp$3$$ && $customElements$jscomp$3$$.define && $customElements$jscomp$3$$.get && $customElements$jscomp$3$$.whenDefined), $Dict$$ = $Object$jscomp$5$$.create || $Object$jscomp$5$$, $Map$jscomp$1$$ = $window$jscomp$1$$.Map || function() {
    var $window$jscomp$1$$ = [], $secondArgument$$ = [], $polyfill$$;
    return {get:function($polyfill$$) {
      return $secondArgument$$[$indexOf$$.call($window$jscomp$1$$, $polyfill$$)];
    }, set:function($ASAP$$, $loopAndVerify$$) {
      $polyfill$$ = $indexOf$$.call($window$jscomp$1$$, $ASAP$$);
      0 > $polyfill$$ ? $secondArgument$$[$window$jscomp$1$$.push($ASAP$$) - 1] = $loopAndVerify$$ : $secondArgument$$[$polyfill$$] = $loopAndVerify$$;
    }};
  }, $Promise$jscomp$3$$ = $window$jscomp$1$$.Promise || function($window$jscomp$1$$) {
    function $secondArgument$$($window$jscomp$1$$) {
      for ($ASAP$$ = !0; $polyfill$$.length;) {
        $polyfill$$.shift()($window$jscomp$1$$);
      }
    }
    var $polyfill$$ = [], $ASAP$$ = !1, $loopAndVerify$$ = {"catch":function() {
      return $loopAndVerify$$;
    }, then:function($window$jscomp$1$$) {
      $polyfill$$.push($window$jscomp$1$$);
      $ASAP$$ && (0,window.setTimeout)($secondArgument$$, 1);
      return $loopAndVerify$$;
    }};
    $window$jscomp$1$$($secondArgument$$);
    return $loopAndVerify$$;
  }, $justCreated$$ = !1, $constructors$$ = $Dict$$(null), $waitingList$$ = $Dict$$(null), $nodeNames$$ = new $Map$jscomp$1$$, $create$$ = $Object$jscomp$5$$.create || function $Bridge$$($window$jscomp$1$$) {
    return $window$jscomp$1$$ ? ($Bridge$$.prototype = $window$jscomp$1$$, new $Bridge$$) : this;
  }, $setPrototype$$ = $sPO$$ || ($hasProto$$ ? function($window$jscomp$1$$, $secondArgument$$) {
    $window$jscomp$1$$.__proto__ = $secondArgument$$;
    return $window$jscomp$1$$;
  } : $gOPN$$ && $gOPD$$ ? function() {
    return function($window$jscomp$1$$, $secondArgument$$) {
      do {
        for (var $polyfill$$, $ASAP$$ = $window$jscomp$1$$, $loopAndVerify$$ = $secondArgument$$, $executeAction$$ = $gOPN$$($loopAndVerify$$), $getTypeIndex$$ = 0, $onDOMAttrModified$$ = $executeAction$$.length; $getTypeIndex$$ < $onDOMAttrModified$$; $getTypeIndex$$++) {
          $polyfill$$ = $executeAction$$[$getTypeIndex$$], $hOP$$.call($ASAP$$, $polyfill$$) || $defineProperty$$($ASAP$$, $polyfill$$, $gOPD$$($loopAndVerify$$, $polyfill$$));
        }
      } while (($secondArgument$$ = $gPO$$($secondArgument$$)) && !$iPO$$.call($secondArgument$$, $window$jscomp$1$$));
      return $window$jscomp$1$$;
    };
  }() : function($window$jscomp$1$$, $secondArgument$$) {
    for (var $polyfill$$ in $secondArgument$$) {
      $window$jscomp$1$$[$polyfill$$] = $secondArgument$$[$polyfill$$];
    }
    return $window$jscomp$1$$;
  }), $MutationObserver$jscomp$1$$ = $window$jscomp$1$$.MutationObserver || $window$jscomp$1$$.WebKitMutationObserver, $HTMLElementPrototype$$ = ($window$jscomp$1$$.HTMLElement || $window$jscomp$1$$.Element || $window$jscomp$1$$.Node).prototype, $IE8$$ = !$iPO$$.call($HTMLElementPrototype$$, $documentElement$$), $safeProperty$$ = $IE8$$ ? function($window$jscomp$1$$, $secondArgument$$, $polyfill$$) {
    $window$jscomp$1$$[$secondArgument$$] = $polyfill$$.value;
    return $window$jscomp$1$$;
  } : $defineProperty$$, $isValidNode$$ = $IE8$$ ? function($window$jscomp$1$$) {
    return 1 === $window$jscomp$1$$.nodeType;
  } : function($window$jscomp$1$$) {
    return $iPO$$.call($HTMLElementPrototype$$, $window$jscomp$1$$);
  }, $targets$$ = $IE8$$ && [], $attachShadow$jscomp$1$$ = $HTMLElementPrototype$$.attachShadow, $cloneNode$jscomp$1$$ = $HTMLElementPrototype$$.cloneNode, $dispatchEvent$$ = $HTMLElementPrototype$$.dispatchEvent, $getAttribute$$ = $HTMLElementPrototype$$.getAttribute, $hasAttribute$$ = $HTMLElementPrototype$$.hasAttribute, $removeAttribute$$ = $HTMLElementPrototype$$.removeAttribute, $setAttribute$$ = $HTMLElementPrototype$$.setAttribute, $createElement$jscomp$2$$ = $document$jscomp$2$$.createElement, 
  $patchedCreateElement$$ = $createElement$jscomp$2$$, $attributesObserver$$ = $MutationObserver$jscomp$1$$ && {attributes:!0, characterData:!0, attributeOldValue:!0}, $DOMAttrModified$$ = $MutationObserver$jscomp$1$$ || function() {
    $doesNotSupportDOMAttrModified$$ = !1;
    $documentElement$$.removeEventListener("DOMAttrModified", $DOMAttrModified$$);
  }, $asapQueue$$, $asapTimer$$ = 0, $V0$$ = "registerElement" in $document$jscomp$2$$, $setListener$$ = !0, $justSetup$$ = !1, $doesNotSupportDOMAttrModified$$ = !0, $dropDomContentLoaded$$ = !0, $notFromInnerHTMLHelper$$ = !0, $observer$jscomp$1$$, $observe$$;
  if (!$V0$$) {
    if ($sPO$$ || $hasProto$$) {
      var $patchIfNotAlready$$ = function($window$jscomp$1$$, $secondArgument$$) {
        $iPO$$.call($secondArgument$$, $window$jscomp$1$$) || $setupNode$$($window$jscomp$1$$, $secondArgument$$);
      };
      var $patch$$ = $setupNode$$;
    } else {
      $patch$$ = $patchIfNotAlready$$ = function($window$jscomp$1$$, $secondArgument$$) {
        $window$jscomp$1$$[$EXPANDO_UID$$] || ($window$jscomp$1$$[$EXPANDO_UID$$] = $Object$jscomp$5$$(!0), $setupNode$$($window$jscomp$1$$, $secondArgument$$));
      };
    }
    if ($IE8$$) {
      $doesNotSupportDOMAttrModified$$ = !1, function() {
        function $window$jscomp$1$$($window$jscomp$1$$) {
          var $secondArgument$$ = $window$jscomp$1$$.currentTarget, $polyfill$$ = $secondArgument$$[$EXPANDO_UID$$];
          $window$jscomp$1$$ = $window$jscomp$1$$.propertyName;
          if ($polyfill$$.hasOwnProperty($window$jscomp$1$$)) {
            $polyfill$$ = $polyfill$$[$window$jscomp$1$$];
            var $ASAP$$ = new window.CustomEvent("DOMAttrModified", {bubbles:!0});
            $ASAP$$.attrName = $polyfill$$.name;
            $ASAP$$.prevValue = $polyfill$$.value || null;
            $ASAP$$.newValue = $polyfill$$.value = $secondArgument$$[$window$jscomp$1$$] || null;
            null == $ASAP$$.prevValue ? $ASAP$$.ADDITION = $ASAP$$.attrChange = 0 : $ASAP$$.MODIFICATION = $ASAP$$.attrChange = 1;
            $dispatchEvent$$.call($secondArgument$$, $ASAP$$);
          }
        }
        function $secondArgument$$($window$jscomp$1$$, $secondArgument$$) {
          var $polyfill$$ = $hasAttribute$$.call(this, $window$jscomp$1$$), $ASAP$$ = $polyfill$$ && $getAttribute$$.call(this, $window$jscomp$1$$), $loopAndVerify$$ = new window.CustomEvent("DOMAttrModified", {bubbles:!0});
          $setAttribute$$.call(this, $window$jscomp$1$$, $secondArgument$$);
          $loopAndVerify$$.attrName = $window$jscomp$1$$;
          $loopAndVerify$$.prevValue = $polyfill$$ ? $ASAP$$ : null;
          $loopAndVerify$$.newValue = $secondArgument$$;
          $polyfill$$ ? $loopAndVerify$$.MODIFICATION = $loopAndVerify$$.attrChange = 1 : $loopAndVerify$$.ADDITION = $loopAndVerify$$.attrChange = 0;
          $dispatchEvent$$.call(this, $loopAndVerify$$);
        }
        function $polyfill$$($window$jscomp$1$$) {
          var $secondArgument$$ = new window.CustomEvent("DOMAttrModified", {bubbles:!0});
          $secondArgument$$.attrName = $window$jscomp$1$$;
          $secondArgument$$.prevValue = $getAttribute$$.call(this, $window$jscomp$1$$);
          $secondArgument$$.newValue = null;
          $secondArgument$$.REMOVAL = $secondArgument$$.attrChange = 2;
          $removeAttribute$$.call(this, $window$jscomp$1$$);
          $dispatchEvent$$.call(this, $secondArgument$$);
        }
        var $ASAP$$ = $gOPD$$($HTMLElementPrototype$$, "addEventListener"), $loopAndVerify$$ = $ASAP$$.value;
        $ASAP$$.value = function($ASAP$$, $executeAction$$, $getTypeIndex$$) {
          "DOMAttrModified" === $ASAP$$ && this.attributeChangedCallback && this.setAttribute !== $secondArgument$$ && (this[$EXPANDO_UID$$] = {className:{name:"class", value:this.className}}, this.setAttribute = $secondArgument$$, this.removeAttribute = $polyfill$$, $loopAndVerify$$.call(this, "propertychange", $window$jscomp$1$$));
          $loopAndVerify$$.call(this, $ASAP$$, $executeAction$$, $getTypeIndex$$);
        };
        $defineProperty$$($HTMLElementPrototype$$, "addEventListener", $ASAP$$);
      }();
    } else {
      if (!$MutationObserver$jscomp$1$$ && ($documentElement$$.addEventListener("DOMAttrModified", $DOMAttrModified$$), $documentElement$$.setAttribute($EXPANDO_UID$$, 1), $documentElement$$.removeAttribute($EXPANDO_UID$$), $doesNotSupportDOMAttrModified$$)) {
        var $onSubtreeModified$$ = function($window$jscomp$1$$) {
          var $secondArgument$$, $polyfill$$;
          if (this === $window$jscomp$1$$.target) {
            $window$jscomp$1$$ = this[$EXPANDO_UID$$];
            this[$EXPANDO_UID$$] = $secondArgument$$ = $getAttributesMirror$$(this);
            for ($polyfill$$ in $secondArgument$$) {
              if (!($polyfill$$ in $window$jscomp$1$$)) {
                return $callDOMAttrModified$$(0, this, $polyfill$$, $window$jscomp$1$$[$polyfill$$], $secondArgument$$[$polyfill$$], "ADDITION");
              }
              if ($secondArgument$$[$polyfill$$] !== $window$jscomp$1$$[$polyfill$$]) {
                return $callDOMAttrModified$$(1, this, $polyfill$$, $window$jscomp$1$$[$polyfill$$], $secondArgument$$[$polyfill$$], "MODIFICATION");
              }
            }
            for ($polyfill$$ in $window$jscomp$1$$) {
              if (!($polyfill$$ in $secondArgument$$)) {
                return $callDOMAttrModified$$(2, this, $polyfill$$, $window$jscomp$1$$[$polyfill$$], $secondArgument$$[$polyfill$$], "REMOVAL");
              }
            }
          }
        };
        var $callDOMAttrModified$$ = function($window$jscomp$1$$, $secondArgument$$, $polyfill$$, $ASAP$$, $loopAndVerify$$, $executeAction$$) {
          $secondArgument$$ = {attrChange:$window$jscomp$1$$, currentTarget:$secondArgument$$, attrName:$polyfill$$, prevValue:$ASAP$$, newValue:$loopAndVerify$$};
          $secondArgument$$[$executeAction$$] = $window$jscomp$1$$;
          $onDOMAttrModified$$($secondArgument$$);
        };
        var $getAttributesMirror$$ = function($window$jscomp$1$$) {
          for (var $secondArgument$$, $polyfill$$ = {}, $ASAP$$ = $window$jscomp$1$$.attributes, $loopAndVerify$$ = 0, $executeAction$$ = $ASAP$$.length; $loopAndVerify$$ < $executeAction$$; $loopAndVerify$$++) {
            $window$jscomp$1$$ = $ASAP$$[$loopAndVerify$$], $secondArgument$$ = $window$jscomp$1$$.name, "setAttribute" !== $secondArgument$$ && ($polyfill$$[$secondArgument$$] = $window$jscomp$1$$.value);
          }
          return $polyfill$$;
        };
      }
    }
    $document$jscomp$2$$.registerElement = function($window$jscomp$1$$, $secondArgument$$) {
      function $polyfill$$() {
        return $patchedSetAttribute$$ ? $document$jscomp$2$$.createElement($CERDefine$$, $ASAP$$) : $document$jscomp$2$$.createElement($CERDefine$$);
      }
      var $ASAP$$ = $window$jscomp$1$$.toUpperCase();
      $setListener$$ && ($setListener$$ = !1, $MutationObserver$jscomp$1$$ ? ($observer$jscomp$1$$ = function($window$jscomp$1$$, $secondArgument$$) {
        function $polyfill$$($window$jscomp$1$$, $secondArgument$$) {
          for (var $polyfill$$ = 0, $ASAP$$ = $window$jscomp$1$$.length; $polyfill$$ < $ASAP$$; $secondArgument$$($window$jscomp$1$$[$polyfill$$++])) {
          }
        }
        return new $MutationObserver$jscomp$1$$(function($ASAP$$) {
          for (var $loopAndVerify$$, $executeAction$$, $getTypeIndex$$, $onDOMAttrModified$$ = 0, $onDOMNode$$ = $ASAP$$.length; $onDOMAttrModified$$ < $onDOMNode$$; $onDOMAttrModified$$++) {
            $loopAndVerify$$ = $ASAP$$[$onDOMAttrModified$$], "childList" === $loopAndVerify$$.type ? ($polyfill$$($loopAndVerify$$.addedNodes, $window$jscomp$1$$), $polyfill$$($loopAndVerify$$.removedNodes, $secondArgument$$)) : ($executeAction$$ = $loopAndVerify$$.target, $notFromInnerHTMLHelper$$ && $executeAction$$.attributeChangedCallback && "style" !== $loopAndVerify$$.attributeName && ($getTypeIndex$$ = $getAttribute$$.call($executeAction$$, $loopAndVerify$$.attributeName), $getTypeIndex$$ !== 
            $loopAndVerify$$.oldValue && $executeAction$$.attributeChangedCallback($loopAndVerify$$.attributeName, $loopAndVerify$$.oldValue, $getTypeIndex$$)));
          }
        });
      }($executeAction$$("attached"), $executeAction$$("detached")), $observe$$ = function($window$jscomp$1$$) {
        $observer$jscomp$1$$.observe($window$jscomp$1$$, {childList:!0, subtree:!0});
        return $window$jscomp$1$$;
      }, $observe$$($document$jscomp$2$$), $attachShadow$jscomp$1$$ && ($HTMLElementPrototype$$.attachShadow = function() {
        return $observe$$($attachShadow$jscomp$1$$.apply(this, arguments));
      })) : ($asapQueue$$ = [], $document$jscomp$2$$.addEventListener("DOMNodeInserted", $onDOMNode$$("attached")), $document$jscomp$2$$.addEventListener("DOMNodeRemoved", $onDOMNode$$("detached"))), $document$jscomp$2$$.addEventListener("DOMContentLoaded", $onReadyStateChange$$), $document$jscomp$2$$.addEventListener("readystatechange", $onReadyStateChange$$), $HTMLElementPrototype$$.cloneNode = function($window$jscomp$1$$) {
        var $secondArgument$$ = $cloneNode$jscomp$1$$.call(this, !!$window$jscomp$1$$), $polyfill$$ = $getTypeIndex$$($secondArgument$$);
        -1 < $polyfill$$ && $patch$$($secondArgument$$, $protos$$[$polyfill$$]);
        if ($window$jscomp$1$$ && $query$jscomp$11$$.length) {
          $window$jscomp$1$$ = $secondArgument$$.querySelectorAll($query$jscomp$11$$);
          $polyfill$$ = 0;
          for (var $ASAP$$ = $window$jscomp$1$$.length, $loopAndVerify$$; $polyfill$$ < $ASAP$$; $polyfill$$++) {
            $loopAndVerify$$ = $window$jscomp$1$$[$polyfill$$], $patch$$($loopAndVerify$$, $protos$$[$getTypeIndex$$($loopAndVerify$$)]);
          }
        }
        return $secondArgument$$;
      });
      if ($justSetup$$) {
        return $justSetup$$ = !1;
      }
      -2 < $indexOf$$.call($types$$, "=" + $ASAP$$) + $indexOf$$.call($types$$, "<" + $ASAP$$) && $throwTypeError$$($window$jscomp$1$$);
      if (!$validName$$.test($ASAP$$) || -1 < $indexOf$$.call($invalidNames$$, $ASAP$$)) {
        throw Error("The type " + $window$jscomp$1$$ + " is invalid");
      }
      var $onDOMAttrModified$$ = $secondArgument$$ || $OP$$, $patchedSetAttribute$$ = $hOP$$.call($onDOMAttrModified$$, "extends"), $CERDefine$$ = $patchedSetAttribute$$ ? $secondArgument$$["extends"].toUpperCase() : $ASAP$$;
      $patchedSetAttribute$$ && -1 < $indexOf$$.call($types$$, "<" + $CERDefine$$) && $throwTypeError$$($CERDefine$$);
      $secondArgument$$ = $types$$.push(($patchedSetAttribute$$ ? "=" : "<") + $ASAP$$) - 1;
      $query$jscomp$11$$ = $query$jscomp$11$$.concat($query$jscomp$11$$.length ? "," : "", $patchedSetAttribute$$ ? $CERDefine$$ + '[is="' + $window$jscomp$1$$.toLowerCase() + '"]' : $CERDefine$$);
      $polyfill$$.prototype = $protos$$[$secondArgument$$] = $hOP$$.call($onDOMAttrModified$$, "prototype") ? $onDOMAttrModified$$.prototype : $create$$($HTMLElementPrototype$$);
      $query$jscomp$11$$.length && $loopAndVerify$$($document$jscomp$2$$.querySelectorAll($query$jscomp$11$$), "attached");
      return $polyfill$$;
    };
    $document$jscomp$2$$.createElement = $patchedCreateElement$$ = function($window$jscomp$1$$, $polyfill$$) {
      var $ASAP$$ = ($polyfill$$ = $getIs$$($polyfill$$)) ? $createElement$jscomp$2$$.call($document$jscomp$2$$, $window$jscomp$1$$, $secondArgument$$($polyfill$$)) : $createElement$jscomp$2$$.call($document$jscomp$2$$, $window$jscomp$1$$);
      $window$jscomp$1$$ = "" + $window$jscomp$1$$;
      var $loopAndVerify$$ = $indexOf$$.call($types$$, ($polyfill$$ ? "=" : "<") + ($polyfill$$ || $window$jscomp$1$$).toUpperCase()), $executeAction$$ = -1 < $loopAndVerify$$;
      $polyfill$$ && ($ASAP$$.setAttribute("is", $polyfill$$ = $polyfill$$.toLowerCase()), $executeAction$$ && ($executeAction$$ = -1 < $query$jscomp$11$$.indexOf($window$jscomp$1$$.toUpperCase() + '[is="' + $polyfill$$ + '"]')));
      $notFromInnerHTMLHelper$$ = !$document$jscomp$2$$.createElement.$D$;
      $executeAction$$ && $patch$$($ASAP$$, $protos$$[$loopAndVerify$$]);
      return $ASAP$$;
    };
  }
  $CustomElementRegistry$jscomp$1$$.prototype = {constructor:$CustomElementRegistry$jscomp$1$$, define:$usableCustomElements$$ ? function($window$jscomp$1$$, $secondArgument$$, $polyfill$$) {
    $polyfill$$ ? $CERDefine$$($window$jscomp$1$$, $secondArgument$$, $polyfill$$) : ($polyfill$$ = $window$jscomp$1$$.toUpperCase(), $constructors$$[$polyfill$$] = {constructor:$secondArgument$$, create:[$polyfill$$]}, $nodeNames$$.set($secondArgument$$, $polyfill$$), $customElements$jscomp$3$$.define($window$jscomp$1$$, $secondArgument$$));
  } : $CERDefine$$, get:$usableCustomElements$$ ? function($window$jscomp$1$$) {
    return $customElements$jscomp$3$$.get($window$jscomp$1$$) || $get$$($window$jscomp$1$$);
  } : $get$$};
  if ($customElements$jscomp$3$$ && "force" !== $polyfill$$) {
    try {
      (function($secondArgument$$, $polyfill$$, $ASAP$$) {
        $polyfill$$["extends"] = "a";
        $secondArgument$$.prototype = $create$$(window.HTMLAnchorElement.prototype);
        $secondArgument$$.prototype.constructor = $secondArgument$$;
        $window$jscomp$1$$.customElements.define($ASAP$$, $secondArgument$$, $polyfill$$);
        if ($getAttribute$$.call($document$jscomp$2$$.createElement("a", {is:$ASAP$$}), "is") !== $ASAP$$ || $usableCustomElements$$ && $getAttribute$$.call(new $secondArgument$$, "is") !== $ASAP$$) {
          throw $polyfill$$;
        }
      })(function $DRE$jscomp$1$$() {
        return window.Reflect.construct(window.HTMLAnchorElement, [], $DRE$jscomp$1$$);
      }, {}, "document-register-element-a");
    } catch ($o_O$$) {
      $polyfillV1$$();
    }
  } else {
    $polyfillV1$$();
  }
  try {
    $createElement$jscomp$2$$.call($document$jscomp$2$$, "a", "a");
  } catch ($FireFox$$) {
    $secondArgument$$ = function($window$jscomp$1$$) {
      return {is:$window$jscomp$1$$.toLowerCase()};
    };
  }
};
_.$getExistingServiceForDocInEmbedScope$$module$src$service$$ = function($ampdoc$jscomp$inline_1176_element$jscomp$31_holder$jscomp$inline_1177$$, $embedService_id$jscomp$6$$) {
  var $win$jscomp$47$$ = $ampdoc$jscomp$inline_1176_element$jscomp$31_holder$jscomp$inline_1177$$.ownerDocument.defaultView;
  if ($win$jscomp$47$$ != _.$getTopWindow$$module$src$service$$($win$jscomp$47$$)) {
    return $isServiceRegistered$$module$src$service$$($win$jscomp$47$$, $embedService_id$jscomp$6$$) && ($embedService_id$jscomp$6$$ = $getServiceInternal$$module$src$service$$($win$jscomp$47$$, $embedService_id$jscomp$6$$)) ? $embedService_id$jscomp$6$$ : null;
  }
  $ampdoc$jscomp$inline_1176_element$jscomp$31_holder$jscomp$inline_1177$$ = _.$getAmpdoc$$module$src$service$$($ampdoc$jscomp$inline_1176_element$jscomp$31_holder$jscomp$inline_1177$$);
  $ampdoc$jscomp$inline_1176_element$jscomp$31_holder$jscomp$inline_1177$$ = $getAmpdocServiceHolder$$module$src$service$$($ampdoc$jscomp$inline_1176_element$jscomp$31_holder$jscomp$inline_1177$$);
  return $isServiceRegistered$$module$src$service$$($ampdoc$jscomp$inline_1176_element$jscomp$31_holder$jscomp$inline_1177$$, $embedService_id$jscomp$6$$) ? $getServiceInternal$$module$src$service$$($ampdoc$jscomp$inline_1176_element$jscomp$31_holder$jscomp$inline_1177$$, $embedService_id$jscomp$6$$) : null;
};
_.$installServiceInEmbedScope$$module$src$service$$ = function($embedWin$$, $id$jscomp$7$$, $service$$) {
  $registerServiceInternal$$module$src$service$$($embedWin$$, $embedWin$$, $id$jscomp$7$$, function() {
    return $service$$;
  });
  $getServiceInternal$$module$src$service$$($embedWin$$, $id$jscomp$7$$);
};
_.$registerServiceBuilder$$module$src$service$$ = function($win$jscomp$48$$, $id$jscomp$8$$, $constructor$jscomp$3$$, $opt_instantiate$$) {
  $win$jscomp$48$$ = _.$getTopWindow$$module$src$service$$($win$jscomp$48$$);
  $registerServiceInternal$$module$src$service$$($win$jscomp$48$$, $win$jscomp$48$$, $id$jscomp$8$$, $constructor$jscomp$3$$);
  $opt_instantiate$$ && $getServiceInternal$$module$src$service$$($win$jscomp$48$$, $id$jscomp$8$$);
};
_.$registerServiceBuilderForDoc$$module$src$service$$ = function($ampdoc_nodeOrDoc$$, $id$jscomp$9$$, $constructor$jscomp$4$$, $opt_instantiate$jscomp$1$$) {
  $ampdoc_nodeOrDoc$$ = _.$getAmpdoc$$module$src$service$$($ampdoc_nodeOrDoc$$);
  var $holder$$ = $getAmpdocServiceHolder$$module$src$service$$($ampdoc_nodeOrDoc$$);
  $registerServiceInternal$$module$src$service$$($holder$$, $ampdoc_nodeOrDoc$$, $id$jscomp$9$$, $constructor$jscomp$4$$);
  $opt_instantiate$jscomp$1$$ && $getServiceInternal$$module$src$service$$($holder$$, $id$jscomp$9$$);
};
_.$getService$$module$src$service$$ = function($win$jscomp$49$$, $id$jscomp$10$$) {
  $win$jscomp$49$$ = _.$getTopWindow$$module$src$service$$($win$jscomp$49$$);
  return $getServiceInternal$$module$src$service$$($win$jscomp$49$$, $id$jscomp$10$$);
};
_.$getExistingServiceOrNull$$module$src$service$$ = function($win$jscomp$51$$, $id$jscomp$12$$) {
  $win$jscomp$51$$ = _.$getTopWindow$$module$src$service$$($win$jscomp$51$$);
  return $isServiceRegistered$$module$src$service$$($win$jscomp$51$$, $id$jscomp$12$$) ? $getServiceInternal$$module$src$service$$($win$jscomp$51$$, $id$jscomp$12$$) : null;
};
_.$getServiceForDoc$$module$src$service$$ = function($ampdoc$jscomp$1_elementOrAmpDoc_holder$jscomp$1$$, $id$jscomp$14$$) {
  $ampdoc$jscomp$1_elementOrAmpDoc_holder$jscomp$1$$ = _.$getAmpdoc$$module$src$service$$($ampdoc$jscomp$1_elementOrAmpDoc_holder$jscomp$1$$);
  $ampdoc$jscomp$1_elementOrAmpDoc_holder$jscomp$1$$ = $getAmpdocServiceHolder$$module$src$service$$($ampdoc$jscomp$1_elementOrAmpDoc_holder$jscomp$1$$);
  return $getServiceInternal$$module$src$service$$($ampdoc$jscomp$1_elementOrAmpDoc_holder$jscomp$1$$, $id$jscomp$14$$);
};
_.$getServicePromiseForDoc$$module$src$service$$ = function($elementOrAmpDoc$jscomp$1$$, $id$jscomp$16$$) {
  return $getServicePromiseInternal$$module$src$service$$($getAmpdocServiceHolder$$module$src$service$$($elementOrAmpDoc$jscomp$1$$), $id$jscomp$16$$);
};
$getServicePromiseOrNullForDoc$$module$src$service$$ = function($elementOrAmpDoc$jscomp$2$$, $id$jscomp$17$$) {
  return $getServicePromiseOrNullInternal$$module$src$service$$($getAmpdocServiceHolder$$module$src$service$$($elementOrAmpDoc$jscomp$2$$), $id$jscomp$17$$);
};
_.$getTopWindow$$module$src$service$$ = function($win$jscomp$55$$) {
  return $win$jscomp$55$$.__AMP_TOP || $win$jscomp$55$$;
};
_.$getParentWindowFrameElement$$module$src$service$$ = function($childWin_node$jscomp$28$$, $topWin$jscomp$1$$) {
  if (($childWin_node$jscomp$28$$ = ($childWin_node$jscomp$28$$.ownerDocument || $childWin_node$jscomp$28$$).defaultView) && $childWin_node$jscomp$28$$ != $topWin$jscomp$1$$ && _.$getTopWindow$$module$src$service$$($childWin_node$jscomp$28$$) == $topWin$jscomp$1$$) {
    try {
      return $childWin_node$jscomp$28$$.frameElement;
    } catch ($e$jscomp$31$$) {
    }
  }
  return null;
};
_.$getAmpdoc$$module$src$service$$ = function($nodeOrDoc$jscomp$1$$) {
  return $nodeOrDoc$jscomp$1$$.nodeType ? _.$getService$$module$src$service$$(($nodeOrDoc$jscomp$1$$.ownerDocument || $nodeOrDoc$jscomp$1$$).defaultView, "ampdoc").$getAmpDoc$($nodeOrDoc$jscomp$1$$) : $nodeOrDoc$jscomp$1$$;
};
$getAmpdocServiceHolder$$module$src$service$$ = function($ampdoc$jscomp$3_nodeOrDoc$jscomp$2$$) {
  $ampdoc$jscomp$3_nodeOrDoc$jscomp$2$$ = _.$getAmpdoc$$module$src$service$$($ampdoc$jscomp$3_nodeOrDoc$jscomp$2$$);
  return $ampdoc$jscomp$3_nodeOrDoc$jscomp$2$$.$isSingleDoc$() ? $ampdoc$jscomp$3_nodeOrDoc$jscomp$2$$.$win$ : $ampdoc$jscomp$3_nodeOrDoc$jscomp$2$$;
};
$getServiceInternal$$module$src$service$$ = function($holder$jscomp$3_s$jscomp$5$$, $id$jscomp$18$$) {
  $holder$jscomp$3_s$jscomp$5$$ = $getServices$$module$src$service$$($holder$jscomp$3_s$jscomp$5$$)[$id$jscomp$18$$];
  $holder$jscomp$3_s$jscomp$5$$.$obj$ || ($holder$jscomp$3_s$jscomp$5$$.$obj$ = new $holder$jscomp$3_s$jscomp$5$$.$ctor$($holder$jscomp$3_s$jscomp$5$$.context), $holder$jscomp$3_s$jscomp$5$$.$ctor$ = null, $holder$jscomp$3_s$jscomp$5$$.context = null, $holder$jscomp$3_s$jscomp$5$$.resolve && $holder$jscomp$3_s$jscomp$5$$.resolve($holder$jscomp$3_s$jscomp$5$$.$obj$));
  return $holder$jscomp$3_s$jscomp$5$$.$obj$;
};
$registerServiceInternal$$module$src$service$$ = function($holder$jscomp$4$$, $context$jscomp$1$$, $id$jscomp$19$$, $ctor$jscomp$6$$) {
  var $services$jscomp$1$$ = $getServices$$module$src$service$$($holder$jscomp$4$$), $s$jscomp$6$$ = $services$jscomp$1$$[$id$jscomp$19$$];
  $s$jscomp$6$$ || ($s$jscomp$6$$ = $services$jscomp$1$$[$id$jscomp$19$$] = {$obj$:null, $promise$:null, resolve:null, context:null, $ctor$:null});
  $s$jscomp$6$$.$ctor$ || $s$jscomp$6$$.$obj$ || ($s$jscomp$6$$.$ctor$ = $ctor$jscomp$6$$, $s$jscomp$6$$.context = $context$jscomp$1$$, $s$jscomp$6$$.resolve && $getServiceInternal$$module$src$service$$($holder$jscomp$4$$, $id$jscomp$19$$));
};
$getServicePromiseInternal$$module$src$service$$ = function($holder$jscomp$5$$, $id$jscomp$20$$) {
  var $cached_promise$jscomp$13$$ = $getServicePromiseOrNullInternal$$module$src$service$$($holder$jscomp$5$$, $id$jscomp$20$$);
  if ($cached_promise$jscomp$13$$) {
    return $cached_promise$jscomp$13$$;
  }
  var $$jscomp$destructuring$var23_resolve$jscomp$16$$ = new _.$Deferred$$module$src$utils$promise$$;
  $cached_promise$jscomp$13$$ = $$jscomp$destructuring$var23_resolve$jscomp$16$$.$promise$;
  $$jscomp$destructuring$var23_resolve$jscomp$16$$ = $$jscomp$destructuring$var23_resolve$jscomp$16$$.resolve;
  $getServices$$module$src$service$$($holder$jscomp$5$$)[$id$jscomp$20$$] = {$obj$:null, $promise$:$cached_promise$jscomp$13$$, resolve:$$jscomp$destructuring$var23_resolve$jscomp$16$$, context:null, $ctor$:null};
  return $cached_promise$jscomp$13$$;
};
$getServicePromiseOrNullInternal$$module$src$service$$ = function($holder$jscomp$6$$, $id$jscomp$21$$) {
  var $s$jscomp$7$$ = $getServices$$module$src$service$$($holder$jscomp$6$$)[$id$jscomp$21$$];
  if ($s$jscomp$7$$) {
    if ($s$jscomp$7$$.$promise$) {
      return $s$jscomp$7$$.$promise$;
    }
    $getServiceInternal$$module$src$service$$($holder$jscomp$6$$, $id$jscomp$21$$);
    return $s$jscomp$7$$.$promise$ = window.Promise.resolve($s$jscomp$7$$.$obj$);
  }
  return null;
};
$getServices$$module$src$service$$ = function($holder$jscomp$7$$) {
  var $services$jscomp$4$$ = $holder$jscomp$7$$.services;
  $services$jscomp$4$$ || ($services$jscomp$4$$ = $holder$jscomp$7$$.services = {});
  return $services$jscomp$4$$;
};
_.$disposeServicesInternal$$module$src$service$$ = function($holder$jscomp$8_services$jscomp$5$$) {
  $holder$jscomp$8_services$jscomp$5$$ = $getServices$$module$src$service$$($holder$jscomp$8_services$jscomp$5$$);
  var $$jscomp$loop$387$$ = {}, $id$jscomp$22$$;
  for ($id$jscomp$22$$ in $holder$jscomp$8_services$jscomp$5$$) {
    if ($$jscomp$loop$387$$.id = $id$jscomp$22$$, Object.prototype.hasOwnProperty.call($holder$jscomp$8_services$jscomp$5$$, $$jscomp$loop$387$$.id)) {
      var $serviceHolder$$ = $holder$jscomp$8_services$jscomp$5$$[$$jscomp$loop$387$$.id];
      $serviceHolder$$.$obj$ ? $disposeServiceInternal$$module$src$service$$($$jscomp$loop$387$$.id, $serviceHolder$$.$obj$) : $serviceHolder$$.$promise$ && $serviceHolder$$.$promise$.then(function($holder$jscomp$8_services$jscomp$5$$) {
        return function($$jscomp$loop$387$$) {
          return $disposeServiceInternal$$module$src$service$$($holder$jscomp$8_services$jscomp$5$$.id, $$jscomp$loop$387$$);
        };
      }($$jscomp$loop$387$$));
      $$jscomp$loop$387$$ = {id:$$jscomp$loop$387$$.id};
    }
  }
};
$disposeServiceInternal$$module$src$service$$ = function($id$jscomp$23$$, $service$jscomp$3$$) {
  if ("function" == typeof $service$jscomp$3$$.$dispose$) {
    try {
      $service$jscomp$3$$.$dispose$();
    } catch ($e$jscomp$32$$) {
      _.$dev$$module$src$log$$().error("SERVICE", "failed to dispose service", $id$jscomp$23$$, $e$jscomp$32$$);
    }
  }
};
$isServiceRegistered$$module$src$service$$ = function($holder$jscomp$10_service$jscomp$4$$, $id$jscomp$25$$) {
  $holder$jscomp$10_service$jscomp$4$$ = $holder$jscomp$10_service$jscomp$4$$.services && $holder$jscomp$10_service$jscomp$4$$.services[$id$jscomp$25$$];
  return !(!$holder$jscomp$10_service$jscomp$4$$ || !$holder$jscomp$10_service$jscomp$4$$.$ctor$ && !$holder$jscomp$10_service$jscomp$4$$.$obj$);
};
_.$getElementServiceIfAvailable$$module$src$element_service$$ = function($win$jscomp$59$$, $id$jscomp$27$$, $extension$jscomp$1$$, $opt_element$jscomp$8$$) {
  var $s$jscomp$8$$ = $getServicePromiseOrNullInternal$$module$src$service$$($win$jscomp$59$$, $id$jscomp$27$$);
  return $s$jscomp$8$$ ? $s$jscomp$8$$ : $getElementServicePromiseOrNull$$module$src$element_service$$($win$jscomp$59$$, $id$jscomp$27$$, $extension$jscomp$1$$, $opt_element$jscomp$8$$);
};
_.$getElementServiceForDoc$$module$src$element_service$$ = function($element$jscomp$33$$, $id$jscomp$28$$, $extension$jscomp$2$$) {
  return _.$getElementServiceIfAvailableForDoc$$module$src$element_service$$($element$jscomp$33$$, $id$jscomp$28$$, $extension$jscomp$2$$, void 0).then(function($element$jscomp$33$$) {
    return $element$jscomp$33$$;
  });
};
_.$getElementServiceIfAvailableForDoc$$module$src$element_service$$ = function($element$jscomp$34$$, $id$jscomp$29$$, $extension$jscomp$3$$, $opt_element$jscomp$10$$) {
  var $s$jscomp$9$$ = $getServicePromiseOrNullForDoc$$module$src$service$$($element$jscomp$34$$, $id$jscomp$29$$);
  if ($s$jscomp$9$$) {
    return $s$jscomp$9$$;
  }
  var $ampdoc$jscomp$6$$ = _.$getAmpdoc$$module$src$service$$($element$jscomp$34$$);
  return $ampdoc$jscomp$6$$.$whenBodyAvailable$().then(function() {
    return $waitForExtensionIfPresent$$module$src$element_service$$($ampdoc$jscomp$6$$.$win$, $extension$jscomp$3$$, $ampdoc$jscomp$6$$.$win$.document.head);
  }).then(function() {
    if ($opt_element$jscomp$10$$) {
      var $s$jscomp$9$$ = $getServicePromiseOrNullForDoc$$module$src$service$$($element$jscomp$34$$, $id$jscomp$29$$);
    } else {
      $s$jscomp$9$$ = $ampdoc$jscomp$6$$.$win$, $s$jscomp$9$$ = $s$jscomp$9$$.$ampExtendedElements$ && $s$jscomp$9$$.$ampExtendedElements$[$extension$jscomp$3$$] ? _.$getServicePromiseForDoc$$module$src$service$$($element$jscomp$34$$, $id$jscomp$29$$) : null;
    }
    return $s$jscomp$9$$;
  });
};
_.$getElementServiceIfAvailableForDocInEmbedScope$$module$src$element_service$$ = function($element$jscomp$35$$) {
  var $s$jscomp$10_win$jscomp$61$$ = _.$getExistingServiceForDocInEmbedScope$$module$src$service$$($element$jscomp$35$$, "bind");
  if ($s$jscomp$10_win$jscomp$61$$) {
    return window.Promise.resolve($s$jscomp$10_win$jscomp$61$$);
  }
  $s$jscomp$10_win$jscomp$61$$ = $element$jscomp$35$$.ownerDocument.defaultView;
  return $s$jscomp$10_win$jscomp$61$$ !== _.$getTopWindow$$module$src$service$$($s$jscomp$10_win$jscomp$61$$) ? $getElementServicePromiseOrNull$$module$src$element_service$$($s$jscomp$10_win$jscomp$61$$, "bind", "amp-bind") : _.$getElementServiceIfAvailableForDoc$$module$src$element_service$$($element$jscomp$35$$, "bind", "amp-bind");
};
$extensionScriptsInNode$$module$src$element_service$$ = function($head_list$jscomp$3$$) {
  if (!$head_list$jscomp$3$$) {
    return [];
  }
  var $scripts$jscomp$1$$ = [];
  $head_list$jscomp$3$$ = $head_list$jscomp$3$$.querySelectorAll("script[custom-element]");
  for (var $i$jscomp$46$$ = 0; $i$jscomp$46$$ < $head_list$jscomp$3$$.length; $i$jscomp$46$$++) {
    $scripts$jscomp$1$$.push($head_list$jscomp$3$$[$i$jscomp$46$$].getAttribute("custom-element"));
  }
  return $scripts$jscomp$1$$;
};
$isExtensionScriptInNode$$module$src$element_service$$ = function($ampdoc$jscomp$7$$) {
  return $ampdoc$jscomp$7$$.$whenBodyAvailable$().then(function() {
    return $extensionScriptsInNode$$module$src$element_service$$($ampdoc$jscomp$7$$.$getHeadNode$()).includes("amp-form");
  });
};
$waitForExtensionIfPresent$$module$src$element_service$$ = function($JSCompiler_temp$jscomp$476_win$jscomp$62$$, $extension$jscomp$6$$, $JSCompiler_StaticMethods_waitForExtension$self$jscomp$inline_1188_head$jscomp$2$$) {
  $extensionScriptsInNode$$module$src$element_service$$($JSCompiler_StaticMethods_waitForExtension$self$jscomp$inline_1188_head$jscomp$2$$).includes($extension$jscomp$6$$) ? ($JSCompiler_StaticMethods_waitForExtension$self$jscomp$inline_1188_head$jscomp$2$$ = _.$getService$$module$src$service$$($JSCompiler_temp$jscomp$476_win$jscomp$62$$, "extensions"), $JSCompiler_temp$jscomp$476_win$jscomp$62$$ = _.$JSCompiler_StaticMethods_timeoutPromise$$(_.$Services$$module$src$services$timerFor$$($JSCompiler_temp$jscomp$476_win$jscomp$62$$), 
  8000, $JSCompiler_StaticMethods_waitFor_$$($JSCompiler_StaticMethods_getExtensionHolder_$$($JSCompiler_StaticMethods_waitForExtension$self$jscomp$inline_1188_head$jscomp$2$$, $extension$jscomp$6$$, !1)), "Render timeout waiting for extension " + $extension$jscomp$6$$ + " to be load.")) : $JSCompiler_temp$jscomp$476_win$jscomp$62$$ = window.Promise.resolve();
  return $JSCompiler_temp$jscomp$476_win$jscomp$62$$;
};
$getElementServicePromiseOrNull$$module$src$element_service$$ = function($win$jscomp$63$$, $id$jscomp$32$$, $extension$jscomp$7$$, $opt_element$jscomp$11$$) {
  return _.$waitForBodyPromise$$module$src$dom$$($win$jscomp$63$$.document).then(function() {
    return $waitForExtensionIfPresent$$module$src$element_service$$($win$jscomp$63$$, $extension$jscomp$7$$, $win$jscomp$63$$.document.head);
  }).then(function() {
    return $opt_element$jscomp$11$$ ? $getServicePromiseOrNullInternal$$module$src$service$$($win$jscomp$63$$, $id$jscomp$32$$) : $win$jscomp$63$$.$ampExtendedElements$ && $win$jscomp$63$$.$ampExtendedElements$[$extension$jscomp$7$$] ? $getServicePromiseInternal$$module$src$service$$($win$jscomp$63$$, $id$jscomp$32$$) : null;
  });
};
_.$Services$$module$src$services$actionServiceForDoc$$ = function($element$jscomp$40$$) {
  return _.$getExistingServiceForDocInEmbedScope$$module$src$service$$($element$jscomp$40$$, "action");
};
_.$Services$$module$src$services$ampdocServiceFor$$ = function($window$jscomp$2$$) {
  return _.$getService$$module$src$service$$($window$jscomp$2$$, "ampdoc");
};
_.$Services$$module$src$services$analyticsForDocOrNull$$ = function($element$jscomp$44$$) {
  return _.$getElementServiceIfAvailableForDoc$$module$src$element_service$$($element$jscomp$44$$, "amp-analytics-instrumentation", "amp-analytics");
};
_.$Services$$module$src$services$cidForDoc$$ = function($elementOrAmpDoc$jscomp$4$$) {
  return _.$getServicePromiseForDoc$$module$src$service$$($elementOrAmpDoc$jscomp$4$$, "cid");
};
_.$Services$$module$src$services$navigationForDoc$$ = function($elementOrAmpDoc$jscomp$5$$) {
  return _.$getServiceForDoc$$module$src$service$$($elementOrAmpDoc$jscomp$5$$, "navigation");
};
_.$Services$$module$src$services$cryptoFor$$ = function($window$jscomp$4$$) {
  return _.$getService$$module$src$service$$($window$jscomp$4$$, "crypto");
};
_.$Services$$module$src$services$documentInfoForDoc$$ = function($elementOrAmpDoc$jscomp$6$$) {
  return _.$getServiceForDoc$$module$src$service$$($elementOrAmpDoc$jscomp$6$$, "documentInfo").get();
};
_.$Services$$module$src$services$documentStateFor$$ = function($window$jscomp$5$$) {
  return _.$getService$$module$src$service$$($window$jscomp$5$$, "documentState");
};
_.$Services$$module$src$services$extensionsFor$$ = function($window$jscomp$6$$) {
  return _.$getService$$module$src$service$$($window$jscomp$6$$, "extensions");
};
_.$Services$$module$src$services$historyForDoc$$ = function($elementOrAmpDoc$jscomp$9$$) {
  return _.$getServiceForDoc$$module$src$service$$($elementOrAmpDoc$jscomp$9$$, "history");
};
_.$Services$$module$src$services$performanceFor$$ = function($window$jscomp$7$$) {
  return _.$getService$$module$src$service$$($window$jscomp$7$$, "performance");
};
_.$Services$$module$src$services$performanceForOrNull$$ = function($window$jscomp$8$$) {
  return _.$getExistingServiceOrNull$$module$src$service$$($window$jscomp$8$$, "performance");
};
_.$Services$$module$src$services$platformFor$$ = function($window$jscomp$9$$) {
  return _.$getService$$module$src$service$$($window$jscomp$9$$, "platform");
};
_.$Services$$module$src$services$resourcesForDoc$$ = function($elementOrAmpDoc$jscomp$11$$) {
  return _.$getServiceForDoc$$module$src$service$$($elementOrAmpDoc$jscomp$11$$, "resources");
};
_.$Services$$module$src$services$storyVariableServiceForOrNull$$ = function($win$jscomp$66$$) {
  return _.$getElementServiceIfAvailable$$module$src$element_service$$($win$jscomp$66$$, "story-variable", "amp-story", !0);
};
_.$Services$$module$src$services$storageForDoc$$ = function($elementOrAmpDoc$jscomp$12$$) {
  return _.$getServicePromiseForDoc$$module$src$service$$($elementOrAmpDoc$jscomp$12$$, "storage");
};
_.$Services$$module$src$services$timerFor$$ = function($window$jscomp$11$$) {
  return _.$getService$$module$src$service$$($window$jscomp$11$$, "timer");
};
_.$Services$$module$src$services$urlReplacementsForDoc$$ = function($element$jscomp$48$$) {
  return _.$getExistingServiceForDocInEmbedScope$$module$src$service$$($element$jscomp$48$$, "url-replace");
};
_.$Services$$module$src$services$userNotificationManagerForDoc$$ = function($element$jscomp$49$$) {
  return _.$getElementServiceForDoc$$module$src$element_service$$($element$jscomp$49$$, "userNotificationManager", "amp-user-notification");
};
_.$Services$$module$src$services$consentPolicyServiceForDocOrNull$$ = function($element$jscomp$50$$) {
  return _.$getElementServiceIfAvailableForDoc$$module$src$element_service$$($element$jscomp$50$$, "consentPolicyManager", "amp-consent");
};
_.$Services$$module$src$services$geoForDocOrNull$$ = function($element$jscomp$51$$) {
  return _.$getElementServiceIfAvailableForDoc$$module$src$element_service$$($element$jscomp$51$$, "geo", "amp-geo", !0);
};
_.$Services$$module$src$services$urlForDoc$$ = function($element$jscomp$52$$) {
  return _.$getExistingServiceForDocInEmbedScope$$module$src$service$$($element$jscomp$52$$, "url");
};
_.$Services$$module$src$services$videoManagerForDoc$$ = function($elementOrAmpDoc$jscomp$13$$) {
  return _.$getServiceForDoc$$module$src$service$$($elementOrAmpDoc$jscomp$13$$, "video-manager");
};
_.$Services$$module$src$services$viewerForDoc$$ = function($elementOrAmpDoc$jscomp$14$$) {
  return _.$getServiceForDoc$$module$src$service$$($elementOrAmpDoc$jscomp$14$$, "viewer");
};
_.$Services$$module$src$services$vsyncFor$$ = function($window$jscomp$12$$) {
  return _.$getService$$module$src$service$$($window$jscomp$12$$, "vsync");
};
_.$Services$$module$src$services$viewportForDoc$$ = function($elementOrAmpDoc$jscomp$16$$) {
  return _.$getServiceForDoc$$module$src$service$$($elementOrAmpDoc$jscomp$16$$, "viewport");
};
_.$Services$$module$src$services$xhrFor$$ = function($window$jscomp$13$$) {
  return _.$getService$$module$src$service$$($window$jscomp$13$$, "xhr");
};
_.$internalListenImplementation$$module$src$event_helper_listen$$ = function($element$jscomp$54$$, $eventType$jscomp$3$$, $listener$jscomp$56$$, $opt_evtListenerOpts$$) {
  var $localElement$$ = $element$jscomp$54$$, $localListener$$ = $listener$jscomp$56$$;
  var $wrapped$$ = function($element$jscomp$54$$) {
    try {
      return $localListener$$($element$jscomp$54$$);
    } catch ($e$jscomp$33$$) {
      throw window.self.$reportError$($e$jscomp$33$$), $e$jscomp$33$$;
    }
  };
  var $optsSupported$$ = $detectEvtListenerOptsSupport$$module$src$event_helper_listen$$(), $capture$jscomp$1$$ = !1;
  $opt_evtListenerOpts$$ && ($capture$jscomp$1$$ = $opt_evtListenerOpts$$.capture);
  $localElement$$.addEventListener($eventType$jscomp$3$$, $wrapped$$, $optsSupported$$ ? $opt_evtListenerOpts$$ : $capture$jscomp$1$$);
  return function() {
    $localElement$$ && $localElement$$.removeEventListener($eventType$jscomp$3$$, $wrapped$$, $optsSupported$$ ? $opt_evtListenerOpts$$ : $capture$jscomp$1$$);
    $wrapped$$ = $localElement$$ = $localListener$$ = null;
  };
};
$detectEvtListenerOptsSupport$$module$src$event_helper_listen$$ = function() {
  if (void 0 !== $optsSupported$$module$src$event_helper_listen$$) {
    return $optsSupported$$module$src$event_helper_listen$$;
  }
  $optsSupported$$module$src$event_helper_listen$$ = !1;
  try {
    var $options$jscomp$22$$ = {get capture() {
      $optsSupported$$module$src$event_helper_listen$$ = !0;
    }};
    window.self.addEventListener("test-options", null, $options$jscomp$22$$);
    window.self.removeEventListener("test-options", null, $options$jscomp$22$$);
  } catch ($err$jscomp$3$$) {
  }
  return $optsSupported$$module$src$event_helper_listen$$;
};
_.$createCustomEvent$$module$src$event_helper$$ = function($e$jscomp$34_win$jscomp$77$$, $type$jscomp$120$$, $detail$jscomp$3$$, $opt_eventInit$jscomp$2$$) {
  var $eventInit$$ = {detail:$detail$jscomp$3$$};
  Object.assign($eventInit$$, $opt_eventInit$jscomp$2$$);
  if ("function" == typeof $e$jscomp$34_win$jscomp$77$$.CustomEvent) {
    return new $e$jscomp$34_win$jscomp$77$$.CustomEvent($type$jscomp$120$$, $eventInit$$);
  }
  $e$jscomp$34_win$jscomp$77$$ = $e$jscomp$34_win$jscomp$77$$.document.createEvent("CustomEvent");
  $e$jscomp$34_win$jscomp$77$$.initCustomEvent($type$jscomp$120$$, !!$eventInit$$.bubbles, !!$eventInit$$.cancelable, $detail$jscomp$3$$);
  return $e$jscomp$34_win$jscomp$77$$;
};
_.$listen$$module$src$event_helper$$ = function($element$jscomp$55$$, $eventType$jscomp$4$$, $listener$jscomp$57$$, $opt_evtListenerOpts$jscomp$1$$) {
  return _.$internalListenImplementation$$module$src$event_helper_listen$$($element$jscomp$55$$, $eventType$jscomp$4$$, $listener$jscomp$57$$, $opt_evtListenerOpts$jscomp$1$$);
};
_.$listenOnce$$module$src$event_helper$$ = function($element$jscomp$56$$, $eventType$jscomp$5$$, $listener$jscomp$58$$, $opt_evtListenerOpts$jscomp$2$$) {
  var $localListener$jscomp$1$$ = $listener$jscomp$58$$, $unlisten$$ = _.$internalListenImplementation$$module$src$event_helper_listen$$($element$jscomp$56$$, $eventType$jscomp$5$$, function($element$jscomp$56$$) {
    try {
      $localListener$jscomp$1$$($element$jscomp$56$$);
    } finally {
      $localListener$jscomp$1$$ = null, $unlisten$$();
    }
  }, $opt_evtListenerOpts$jscomp$2$$);
  return $unlisten$$;
};
_.$listenOncePromise$$module$src$event_helper$$ = function($element$jscomp$57$$, $eventType$jscomp$6$$, $opt_evtListenerOpts$jscomp$3$$, $opt_cancel$$) {
  var $unlisten$jscomp$1$$, $eventPromise$$ = new window.Promise(function($opt_cancel$$) {
    $unlisten$jscomp$1$$ = _.$listenOnce$$module$src$event_helper$$($element$jscomp$57$$, $eventType$jscomp$6$$, $opt_cancel$$, $opt_evtListenerOpts$jscomp$3$$);
  });
  $eventPromise$$.then($unlisten$jscomp$1$$, $unlisten$jscomp$1$$);
  $opt_cancel$$ && $opt_cancel$$($unlisten$jscomp$1$$);
  return $eventPromise$$;
};
_.$isLoaded$$module$src$event_helper$$ = function($eleOrWindow$$) {
  return !!($eleOrWindow$$.complete || "complete" == $eleOrWindow$$.readyState || $eleOrWindow$$.document && "complete" == $eleOrWindow$$.document.readyState);
};
_.$loadPromise$$module$src$event_helper$$ = function($eleOrWindow$jscomp$1$$) {
  var $unlistenLoad$$, $unlistenError$$;
  return _.$isLoaded$$module$src$event_helper$$($eleOrWindow$jscomp$1$$) ? window.Promise.resolve($eleOrWindow$jscomp$1$$) : (new window.Promise(function($resolve$jscomp$18$$, $reject$jscomp$10$$) {
    var $tagName$jscomp$11$$ = $eleOrWindow$jscomp$1$$.tagName;
    $unlistenLoad$$ = "AUDIO" === $tagName$jscomp$11$$ || "VIDEO" === $tagName$jscomp$11$$ ? _.$listenOnce$$module$src$event_helper$$($eleOrWindow$jscomp$1$$, "loadstart", $resolve$jscomp$18$$) : _.$listenOnce$$module$src$event_helper$$($eleOrWindow$jscomp$1$$, "load", $resolve$jscomp$18$$);
    $tagName$jscomp$11$$ && ($unlistenError$$ = _.$listenOnce$$module$src$event_helper$$($eleOrWindow$jscomp$1$$, "error", $reject$jscomp$10$$));
  })).then(function() {
    $unlistenError$$ && $unlistenError$$();
    return $eleOrWindow$jscomp$1$$;
  }, function() {
    $unlistenLoad$$ && $unlistenLoad$$();
    var $unlistenError$$ = $eleOrWindow$jscomp$1$$;
    $unlistenError$$ && $unlistenError$$.src && ($unlistenError$$ = $unlistenError$$.src);
    throw _.$user$$module$src$log$$().$createError$("Failed to load:", $unlistenError$$);
  });
};
_.$htmlFor$$module$src$static_template$$ = function($doc$jscomp$6_nodeOrDoc$jscomp$3$$) {
  $doc$jscomp$6_nodeOrDoc$jscomp$3$$ = $doc$jscomp$6_nodeOrDoc$jscomp$3$$.ownerDocument || $doc$jscomp$6_nodeOrDoc$jscomp$3$$;
  $container$$module$src$static_template$$ && $container$$module$src$static_template$$.ownerDocument === $doc$jscomp$6_nodeOrDoc$jscomp$3$$ || ($container$$module$src$static_template$$ = $doc$jscomp$6_nodeOrDoc$jscomp$3$$.createElement("div"));
  return $html$$module$src$static_template$$;
};
$html$$module$src$static_template$$ = function($el$jscomp$8_strings$$) {
  $container$$module$src$static_template$$.innerHTML = $el$jscomp$8_strings$$[0];
  $el$jscomp$8_strings$$ = $container$$module$src$static_template$$.firstElementChild;
  $container$$module$src$static_template$$.removeChild($el$jscomp$8_strings$$);
  return $el$jscomp$8_strings$$;
};
_.$getVendorJsPropertyName$$module$src$style$$ = function($style$jscomp$1$$, $camelCase$jscomp$1$$, $opt_bypassCache$$) {
  if (_.$startsWith$$module$src$string$$($camelCase$jscomp$1$$, "--")) {
    return $camelCase$jscomp$1$$;
  }
  $propertyNameCache$$module$src$style$$ || ($propertyNameCache$$module$src$style$$ = _.$map$$module$src$utils$object$$());
  var $propertyName$jscomp$10$$ = $propertyNameCache$$module$src$style$$[$camelCase$jscomp$1$$];
  if (!$propertyName$jscomp$10$$ || $opt_bypassCache$$) {
    $propertyName$jscomp$10$$ = $camelCase$jscomp$1$$;
    if (void 0 === $style$jscomp$1$$[$camelCase$jscomp$1$$]) {
      var $JSCompiler_inline_result$jscomp$438_i$jscomp$inline_1198_prefixedPropertyName$$;
      a: {
        for ($JSCompiler_inline_result$jscomp$438_i$jscomp$inline_1198_prefixedPropertyName$$ = 0; $JSCompiler_inline_result$jscomp$438_i$jscomp$inline_1198_prefixedPropertyName$$ < $vendorPrefixes$$module$src$style$$.length; $JSCompiler_inline_result$jscomp$438_i$jscomp$inline_1198_prefixedPropertyName$$++) {
          var $propertyName$jscomp$inline_1199$$ = $vendorPrefixes$$module$src$style$$[$JSCompiler_inline_result$jscomp$438_i$jscomp$inline_1198_prefixedPropertyName$$] + ($camelCase$jscomp$1$$.charAt(0).toUpperCase() + $camelCase$jscomp$1$$.slice(1));
          if (void 0 !== $style$jscomp$1$$[$propertyName$jscomp$inline_1199$$]) {
            $JSCompiler_inline_result$jscomp$438_i$jscomp$inline_1198_prefixedPropertyName$$ = $propertyName$jscomp$inline_1199$$;
            break a;
          }
        }
        $JSCompiler_inline_result$jscomp$438_i$jscomp$inline_1198_prefixedPropertyName$$ = "";
      }
      void 0 !== $style$jscomp$1$$[$JSCompiler_inline_result$jscomp$438_i$jscomp$inline_1198_prefixedPropertyName$$] && ($propertyName$jscomp$10$$ = $JSCompiler_inline_result$jscomp$438_i$jscomp$inline_1198_prefixedPropertyName$$);
    }
    $opt_bypassCache$$ || ($propertyNameCache$$module$src$style$$[$camelCase$jscomp$1$$] = $propertyName$jscomp$10$$);
  }
  return $propertyName$jscomp$10$$;
};
_.$setImportantStyles$$module$src$style$$ = function($element$jscomp$59_style$jscomp$2$$, $styles$$) {
  $element$jscomp$59_style$jscomp$2$$ = $element$jscomp$59_style$jscomp$2$$.style;
  for (var $k$jscomp$8$$ in $styles$$) {
    $element$jscomp$59_style$jscomp$2$$.setProperty(_.$getVendorJsPropertyName$$module$src$style$$($element$jscomp$59_style$jscomp$2$$, $k$jscomp$8$$), $styles$$[$k$jscomp$8$$].toString(), "important");
  }
};
_.$setStyle$$module$src$style$$ = function($element$jscomp$60$$, $property$jscomp$5_propertyName$jscomp$11$$, $value$jscomp$109$$, $opt_units$$) {
  ($property$jscomp$5_propertyName$jscomp$11$$ = _.$getVendorJsPropertyName$$module$src$style$$($element$jscomp$60$$.style, $property$jscomp$5_propertyName$jscomp$11$$, void 0)) && ($element$jscomp$60$$.style[$property$jscomp$5_propertyName$jscomp$11$$] = $opt_units$$ ? $value$jscomp$109$$ + $opt_units$$ : $value$jscomp$109$$);
};
_.$getStyle$$module$src$style$$ = function($element$jscomp$61$$, $property$jscomp$6_propertyName$jscomp$12$$) {
  if ($property$jscomp$6_propertyName$jscomp$12$$ = _.$getVendorJsPropertyName$$module$src$style$$($element$jscomp$61$$.style, $property$jscomp$6_propertyName$jscomp$12$$, void 0)) {
    return $element$jscomp$61$$.style[$property$jscomp$6_propertyName$jscomp$12$$];
  }
};
_.$setStyles$$module$src$style$$ = function($element$jscomp$62$$, $styles$jscomp$1$$) {
  for (var $k$jscomp$9$$ in $styles$jscomp$1$$) {
    _.$setStyle$$module$src$style$$($element$jscomp$62$$, $k$jscomp$9$$, $styles$jscomp$1$$[$k$jscomp$9$$]);
  }
};
_.$assertDoesNotContainDisplay$$module$src$style$$ = function($styles$jscomp$2$$) {
  "display" in $styles$jscomp$2$$ && _.$dev$$module$src$log$$().error("STYLE", "`display` style detected in styles. You must use toggle instead.");
  return $styles$jscomp$2$$;
};
_.$setInitialDisplay$$module$src$style$$ = function($el$jscomp$9$$) {
  $el$jscomp$9$$.style.display = "block";
};
_.$toggle$$module$src$style$$ = function($element$jscomp$63$$, $opt_display$$) {
  void 0 === $opt_display$$ && ($opt_display$$ = $element$jscomp$63$$.hasAttribute("hidden"));
  $opt_display$$ ? $element$jscomp$63$$.removeAttribute("hidden") : $element$jscomp$63$$.setAttribute("hidden", "");
};
_.$px$$module$src$style$$ = function($value$jscomp$111$$) {
  return $value$jscomp$111$$ + "px";
};
_.$computedStyle$$module$src$style$$ = function($win$jscomp$78$$, $el$jscomp$10$$) {
  return $win$jscomp$78$$.getComputedStyle($el$jscomp$10$$) || _.$map$$module$src$utils$object$$();
};
_.$resetStyles$$module$src$style$$ = function($element$jscomp$64$$, $properties$$) {
  for (var $i$jscomp$49$$ = 0; $i$jscomp$49$$ < $properties$$.length; $i$jscomp$49$$++) {
    _.$setStyle$$module$src$style$$($element$jscomp$64$$, $properties$$[$i$jscomp$49$$], null);
  }
};
$parseLayout$$module$src$layout$$ = function($s$jscomp$11$$) {
  for (var $k$jscomp$10$$ in $Layout$$module$src$layout$$) {
    if ($Layout$$module$src$layout$$[$k$jscomp$10$$] == $s$jscomp$11$$) {
      return $Layout$$module$src$layout$$[$k$jscomp$10$$];
    }
  }
};
_.$isLayoutSizeDefined$$module$src$layout$$ = function($layout$jscomp$1$$) {
  return "fixed" == $layout$jscomp$1$$ || "fixed-height" == $layout$jscomp$1$$ || "responsive" == $layout$jscomp$1$$ || "fill" == $layout$jscomp$1$$ || "flex-item" == $layout$jscomp$1$$ || "fluid" == $layout$jscomp$1$$ || "intrinsic" == $layout$jscomp$1$$;
};
_.$parseLength$$module$src$layout$$ = function($s$jscomp$12$$) {
  if ("number" == typeof $s$jscomp$12$$) {
    return $s$jscomp$12$$ + "px";
  }
  if ($s$jscomp$12$$ && /^\d+(\.\d+)?(px|em|rem|vh|vw|vmin|vmax|cm|mm|q|in|pc|pt)?$/.test($s$jscomp$12$$)) {
    return /^\d+(\.\d+)?$/.test($s$jscomp$12$$) ? $s$jscomp$12$$ + "px" : $s$jscomp$12$$;
  }
};
_.$getLengthNumeral$$module$src$layout$$ = function($length$jscomp$31_res$jscomp$3$$) {
  $length$jscomp$31_res$jscomp$3$$ = (0,window.parseFloat)($length$jscomp$31_res$jscomp$3$$);
  return _.$isFiniteNumber$$module$src$types$$($length$jscomp$31_res$jscomp$3$$) ? $length$jscomp$31_res$jscomp$3$$ : void 0;
};
_.$Pass$$module$src$pass$$ = function($win$jscomp$79$$, $handler$jscomp$5$$, $opt_defaultDelay$$) {
  var $$jscomp$this$jscomp$2$$ = this;
  this.$timer_$ = _.$Services$$module$src$services$timerFor$$($win$jscomp$79$$);
  this.$I$ = $handler$jscomp$5$$;
  this.$K$ = $opt_defaultDelay$$ || 0;
  this.$D$ = -1;
  this.$G$ = 0;
  this.$F$ = !1;
  this.$J$ = function() {
    $$jscomp$this$jscomp$2$$.$D$ = -1;
    $$jscomp$this$jscomp$2$$.$G$ = 0;
    $$jscomp$this$jscomp$2$$.$F$ = !0;
    $$jscomp$this$jscomp$2$$.$I$();
    $$jscomp$this$jscomp$2$$.$F$ = !1;
  };
};
_.$JSCompiler_StaticMethods_schedule$$ = function($JSCompiler_StaticMethods_schedule$self$$, $delay_opt_delay$jscomp$2$$) {
  $delay_opt_delay$jscomp$2$$ = $delay_opt_delay$jscomp$2$$ || $JSCompiler_StaticMethods_schedule$self$$.$K$;
  $JSCompiler_StaticMethods_schedule$self$$.$F$ && 10 > $delay_opt_delay$jscomp$2$$ && ($delay_opt_delay$jscomp$2$$ = 10);
  var $nextTime$$ = Date.now() + $delay_opt_delay$jscomp$2$$;
  return -1 == $JSCompiler_StaticMethods_schedule$self$$.$D$ || -10 > $nextTime$$ - $JSCompiler_StaticMethods_schedule$self$$.$G$ ? ($JSCompiler_StaticMethods_schedule$self$$.cancel(), $JSCompiler_StaticMethods_schedule$self$$.$G$ = $nextTime$$, $JSCompiler_StaticMethods_schedule$self$$.$D$ = $JSCompiler_StaticMethods_schedule$self$$.$timer_$.delay($JSCompiler_StaticMethods_schedule$self$$.$J$, $delay_opt_delay$jscomp$2$$), !0) : !1;
};
$isFormDataWrapper$$module$src$form_data_wrapper$$ = function($o$jscomp$6$$) {
  return !!$o$jscomp$6$$ && "function" == typeof $o$jscomp$6$$.getFormData;
};
_.$remove$$module$src$utils$array$$ = function($array$jscomp$8$$, $shouldRemove$$) {
  for (var $index$jscomp$60$$ = 0, $i$jscomp$53$$ = 0; $i$jscomp$53$$ < $array$jscomp$8$$.length; $i$jscomp$53$$++) {
    var $item$$ = $array$jscomp$8$$[$i$jscomp$53$$];
    $shouldRemove$$($item$$, $i$jscomp$53$$, $array$jscomp$8$$) || ($index$jscomp$60$$ < $i$jscomp$53$$ && ($array$jscomp$8$$[$index$jscomp$60$$] = $item$$), $index$jscomp$60$$++);
  }
  $index$jscomp$60$$ < $array$jscomp$8$$.length && ($array$jscomp$8$$.length = $index$jscomp$60$$);
};
_.$findIndex$$module$src$utils$array$$ = function($array$jscomp$9$$, $predicate$jscomp$1$$) {
  for (var $i$jscomp$54$$ = 0; $i$jscomp$54$$ < $array$jscomp$9$$.length; $i$jscomp$54$$++) {
    if ($predicate$jscomp$1$$($array$jscomp$9$$[$i$jscomp$54$$], $i$jscomp$54$$, $array$jscomp$9$$)) {
      return $i$jscomp$54$$;
    }
  }
  return -1;
};
_.$toStructuredCloneable$$module$src$utils$xhr_utils$$ = function($input$jscomp$12$$, $init$jscomp$3_iterator$jscomp$inline_1203_wrapper$$) {
  var $newInit$$ = Object.assign({}, $init$jscomp$3_iterator$jscomp$inline_1203_wrapper$$);
  if ($isFormDataWrapper$$module$src$form_data_wrapper$$($init$jscomp$3_iterator$jscomp$inline_1203_wrapper$$.body)) {
    $init$jscomp$3_iterator$jscomp$inline_1203_wrapper$$ = $init$jscomp$3_iterator$jscomp$inline_1203_wrapper$$.body;
    $newInit$$.headers["Content-Type"] = "multipart/form-data;charset=utf-8";
    $init$jscomp$3_iterator$jscomp$inline_1203_wrapper$$ = $init$jscomp$3_iterator$jscomp$inline_1203_wrapper$$.entries();
    for (var $array$jscomp$inline_1204$$ = [], $e$jscomp$inline_1205$$ = $init$jscomp$3_iterator$jscomp$inline_1203_wrapper$$.next(); !$e$jscomp$inline_1205$$.done; $e$jscomp$inline_1205$$ = $init$jscomp$3_iterator$jscomp$inline_1203_wrapper$$.next()) {
      $array$jscomp$inline_1204$$.push($e$jscomp$inline_1205$$.value);
    }
    $newInit$$.body = $array$jscomp$inline_1204$$;
  }
  return {input:$input$jscomp$12$$, init:$newInit$$};
};
_.$fromStructuredCloneable$$module$src$utils$xhr_utils$$ = function($response$jscomp$2$$, $data$jscomp$35_responseType$$) {
  if ("document" != $data$jscomp$35_responseType$$) {
    return new window.Response($response$jscomp$2$$.body, $response$jscomp$2$$.init);
  }
  var $lowercasedHeaders$jscomp$1$$ = _.$map$$module$src$utils$object$$();
  $data$jscomp$35_responseType$$ = {status:200, statusText:"OK", getResponseHeader:function($response$jscomp$2$$) {
    return $lowercasedHeaders$jscomp$1$$[String($response$jscomp$2$$).toLowerCase()] || null;
  }};
  if ($response$jscomp$2$$.init) {
    var $init$jscomp$4$$ = $response$jscomp$2$$.init;
    _.$isArray$$module$src$types$$($init$jscomp$4$$.headers) && $init$jscomp$4$$.headers.forEach(function($response$jscomp$2$$) {
      $lowercasedHeaders$jscomp$1$$[String($response$jscomp$2$$[0]).toLowerCase()] = String($response$jscomp$2$$[1]);
    });
    $init$jscomp$4$$.status && ($data$jscomp$35_responseType$$.status = (0,window.parseInt)($init$jscomp$4$$.status, 10));
    $init$jscomp$4$$.statusText && ($data$jscomp$35_responseType$$.statusText = String($init$jscomp$4$$.statusText));
  }
  return new window.Response($response$jscomp$2$$.body ? String($response$jscomp$2$$.body) : "", $data$jscomp$35_responseType$$);
};
_.$getViewerInterceptResponse$$module$src$utils$xhr_utils$$ = function($win$jscomp$81$$, $ampdocSingle$$, $input$jscomp$13$$, $init$jscomp$5$$) {
  if (!$ampdocSingle$$) {
    return window.Promise.resolve();
  }
  var $viewer$$ = _.$Services$$module$src$services$viewerForDoc$$($ampdocSingle$$), $whenFirstVisible$$ = $viewer$$.$D$;
  return !_.$isProxyOrigin$$module$src$url$$($input$jscomp$13$$) && _.$JSCompiler_StaticMethods_hasCapability$$($viewer$$, "xhrInterceptor") && $ampdocSingle$$.getRootNode().documentElement.hasAttribute("allow-xhr-interception") ? $whenFirstVisible$$.then(function() {
    return $JSCompiler_StaticMethods_isTrustedViewer$$($viewer$$);
  }).then(function($ampdocSingle$$) {
    var $whenFirstVisible$$ = _.$getMode$$module$src$mode$$($win$jscomp$81$$).$development$;
    if ($ampdocSingle$$ || $whenFirstVisible$$) {
      return $ampdocSingle$$ = _.$dict$$module$src$utils$object$$({originalRequest:_.$toStructuredCloneable$$module$src$utils$xhr_utils$$($input$jscomp$13$$, $init$jscomp$5$$)}), _.$JSCompiler_StaticMethods_sendMessageAwaitResponse$$($viewer$$, "xhr", $ampdocSingle$$).then(function($win$jscomp$81$$) {
        return _.$fromStructuredCloneable$$module$src$utils$xhr_utils$$($win$jscomp$81$$, $init$jscomp$5$$.responseType);
      });
    }
  }) : $whenFirstVisible$$;
};
_.$setupInput$$module$src$utils$xhr_utils$$ = function($win$jscomp$82$$, $input$jscomp$14$$, $init$jscomp$6$$) {
  !1 !== $init$jscomp$6$$.ampCors && ($input$jscomp$14$$ = _.$getCorsUrl$$module$src$url$$($win$jscomp$82$$, $input$jscomp$14$$));
  return $input$jscomp$14$$;
};
_.$setupInit$$module$src$utils$xhr_utils$$ = function($init$jscomp$7_opt_init$jscomp$7$$, $opt_accept$$) {
  $init$jscomp$7_opt_init$jscomp$7$$ = $init$jscomp$7_opt_init$jscomp$7$$ || {};
  var $JSCompiler_inline_result$jscomp$445_method$jscomp$inline_1207$$ = $init$jscomp$7_opt_init$jscomp$7$$.method;
  void 0 === $JSCompiler_inline_result$jscomp$445_method$jscomp$inline_1207$$ ? $JSCompiler_inline_result$jscomp$445_method$jscomp$inline_1207$$ = "GET" : ($JSCompiler_inline_result$jscomp$445_method$jscomp$inline_1207$$ = $JSCompiler_inline_result$jscomp$445_method$jscomp$inline_1207$$.toUpperCase(), $allowedMethods_$$module$src$utils$xhr_utils$$.includes($JSCompiler_inline_result$jscomp$445_method$jscomp$inline_1207$$));
  $init$jscomp$7_opt_init$jscomp$7$$.method = $JSCompiler_inline_result$jscomp$445_method$jscomp$inline_1207$$;
  $init$jscomp$7_opt_init$jscomp$7$$.headers = $init$jscomp$7_opt_init$jscomp$7$$.headers || _.$dict$$module$src$utils$object$$({});
  $opt_accept$$ && ($init$jscomp$7_opt_init$jscomp$7$$.headers.Accept = $opt_accept$$);
  return $init$jscomp$7_opt_init$jscomp$7$$;
};
_.$setupAMPCors$$module$src$utils$xhr_utils$$ = function($currentOrigin_win$jscomp$83$$, $input$jscomp$15_targetOrigin$$, $init$jscomp$8$$) {
  !1 === $init$jscomp$8$$.ampCors && ($init$jscomp$8$$.requireAmpResponseSourceOrigin = !1);
  !0 === $init$jscomp$8$$.requireAmpResponseSourceOrigin && _.$dev$$module$src$log$$().error("XHR", "requireAmpResponseSourceOrigin is deprecated, use ampCors instead");
  void 0 === $init$jscomp$8$$.requireAmpResponseSourceOrigin && ($init$jscomp$8$$.requireAmpResponseSourceOrigin = !0);
  $currentOrigin_win$jscomp$83$$ = _.$getWinOrigin$$module$src$url$$($currentOrigin_win$jscomp$83$$);
  $input$jscomp$15_targetOrigin$$ = _.$parseUrlDeprecated$$module$src$url$$($input$jscomp$15_targetOrigin$$).origin;
  $currentOrigin_win$jscomp$83$$ == $input$jscomp$15_targetOrigin$$ && ($init$jscomp$8$$.headers = $init$jscomp$8$$.headers || {}, $init$jscomp$8$$.headers["AMP-Same-Origin"] = "true");
  return $init$jscomp$8$$;
};
_.$setupJsonFetchInit$$module$src$utils$xhr_utils$$ = function($init$jscomp$9$$) {
  var $fetchInit$$ = _.$setupInit$$module$src$utils$xhr_utils$$($init$jscomp$9$$, "application/json");
  "POST" != $fetchInit$$.method || $isFormDataWrapper$$module$src$form_data_wrapper$$($fetchInit$$.body) || ($allowedJsonBodyTypes_$$module$src$utils$xhr_utils$$.some(function($init$jscomp$9$$) {
    return $init$jscomp$9$$($fetchInit$$.body);
  }), $fetchInit$$.headers["Content-Type"] = $fetchInit$$.headers["Content-Type"] || "text/plain;charset=utf-8", $fetchInit$$.body = "application/x-www-form-urlencoded" === $fetchInit$$.headers["Content-Type"] ? _.$serializeQueryString$$module$src$url$$($fetchInit$$.body) : JSON.stringify($fetchInit$$.body));
  return $fetchInit$$;
};
_.$verifyAmpCORSHeaders$$module$src$utils$xhr_utils$$ = function($win$jscomp$84$$, $response$jscomp$4$$) {
  $response$jscomp$4$$.headers.get("AMP-Access-Control-Allow-Source-Origin") && _.$getSourceOrigin$$module$src$url$$($win$jscomp$84$$.location.href);
  return $response$jscomp$4$$;
};
_.$assertSuccess$$module$src$utils$xhr_utils$$ = function($response$jscomp$5$$) {
  return new window.Promise(function($resolve$jscomp$19_status$jscomp$1$$) {
    if ($response$jscomp$5$$.ok) {
      return $resolve$jscomp$19_status$jscomp$1$$($response$jscomp$5$$);
    }
    $resolve$jscomp$19_status$jscomp$1$$ = $response$jscomp$5$$.status;
    var $err$jscomp$4$$ = _.$user$$module$src$log$$().$createError$("HTTP error " + $resolve$jscomp$19_status$jscomp$1$$);
    $err$jscomp$4$$.$retriable$ = 415 == $resolve$jscomp$19_status$jscomp$1$$ || 500 <= $resolve$jscomp$19_status$jscomp$1$$ && 600 > $resolve$jscomp$19_status$jscomp$1$$;
    $err$jscomp$4$$.response = $response$jscomp$5$$;
    throw $err$jscomp$4$$;
  });
};
_.$calculateExtensionScriptUrl$$module$src$service$extension_location$$ = function($extensionId$jscomp$2$$, $extensionVersion_opt_extensionVersion$$) {
  var $base$jscomp$2$$ = _.$urls$$module$src$config$$.cdn, $rtv$$ = _.$getMode$$module$src$mode$$().$rtvVersion$;
  null == $extensionVersion_opt_extensionVersion$$ && ($extensionVersion_opt_extensionVersion$$ = "0.1");
  $extensionVersion_opt_extensionVersion$$ = $extensionVersion_opt_extensionVersion$$ ? "-" + $extensionVersion_opt_extensionVersion$$ : "";
  var $spPath$$ = _.$getMode$$module$src$mode$$().$singlePassType$ ? _.$getMode$$module$src$mode$$().$singlePassType$ + "/" : "";
  return $base$jscomp$2$$ + "/rtv/" + $rtv$$ + "/" + $spPath$$ + "v0/" + $extensionId$jscomp$2$$ + $extensionVersion_opt_extensionVersion$$ + ".js";
};
$waitForServices$$module$src$render_delaying_services$$ = function($win$jscomp$85$$) {
  var $promises$jscomp$3$$ = $includedServices$$module$src$render_delaying_services$$($win$jscomp$85$$).map(function($promises$jscomp$3$$) {
    return _.$JSCompiler_StaticMethods_timeoutPromise$$(_.$Services$$module$src$services$timerFor$$($win$jscomp$85$$), 3000, $getServicePromiseInternal$$module$src$service$$($win$jscomp$85$$, $promises$jscomp$3$$), "Render timeout waiting for service " + $promises$jscomp$3$$ + " to be ready.");
  });
  return window.Promise.all($promises$jscomp$3$$);
};
$includedServices$$module$src$render_delaying_services$$ = function($win$jscomp$87$$) {
  var $doc$jscomp$8$$ = $win$jscomp$87$$.document;
  return Object.keys($SERVICES$$module$src$render_delaying_services$$).filter(function($win$jscomp$87$$) {
    return $doc$jscomp$8$$.querySelector($SERVICES$$module$src$render_delaying_services$$[$win$jscomp$87$$]);
  });
};
_.$installStylesForDoc$$module$src$style_installer$$ = function($ampdoc$jscomp$9$$, $cssText$$, $cb$jscomp$2$$, $opt_isRuntimeCss$$, $opt_ext$$) {
  var $cssRoot$$ = $ampdoc$jscomp$9$$.$getHeadNode$(), $style$jscomp$6$$ = _.$insertStyleElement$$module$src$style_installer$$($cssRoot$$, $maybeTransform$$module$src$style_installer$$($cssRoot$$, $cssText$$), $opt_isRuntimeCss$$ || !1, $opt_ext$$ || null);
  if ($cb$jscomp$2$$) {
    var $rootNode$jscomp$1$$ = $ampdoc$jscomp$9$$.getRootNode();
    if (_.$styleLoaded$$module$src$style_installer$$($rootNode$jscomp$1$$, $style$jscomp$6$$)) {
      $cb$jscomp$2$$($style$jscomp$6$$);
    } else {
      var $interval$jscomp$1$$ = (0,window.setInterval)(function() {
        _.$styleLoaded$$module$src$style_installer$$($rootNode$jscomp$1$$, $style$jscomp$6$$) && ((0,window.clearInterval)($interval$jscomp$1$$), $cb$jscomp$2$$($style$jscomp$6$$));
      }, 4);
    }
  }
};
_.$insertStyleElement$$module$src$style_installer$$ = function($cssRoot$jscomp$1$$, $afterElement_cssText$jscomp$2$$, $isRuntimeCss$$, $ext$$) {
  var $styleMap$$ = $cssRoot$jscomp$1$$.__AMP_CSS_SM;
  $styleMap$$ || ($styleMap$$ = $cssRoot$jscomp$1$$.__AMP_CSS_SM = _.$map$$module$src$utils$object$$());
  var $isExtCss$$ = !$isRuntimeCss$$ && $ext$$ && "amp-custom" != $ext$$ && "amp-keyframes" != $ext$$, $key$jscomp$53$$ = $isRuntimeCss$$ ? "amp-runtime" : $isExtCss$$ ? "amp-extension=" + $ext$$ : null;
  if ($key$jscomp$53$$) {
    var $existing_style$jscomp$8$$ = $getExistingStyleElement$$module$src$style_installer$$($cssRoot$jscomp$1$$, $styleMap$$, $key$jscomp$53$$);
    if ($existing_style$jscomp$8$$) {
      return $existing_style$jscomp$8$$.textContent !== $afterElement_cssText$jscomp$2$$ && ($existing_style$jscomp$8$$.textContent = $afterElement_cssText$jscomp$2$$), $existing_style$jscomp$8$$;
    }
  }
  $existing_style$jscomp$8$$ = ($cssRoot$jscomp$1$$.ownerDocument || $cssRoot$jscomp$1$$).createElement("style");
  $existing_style$jscomp$8$$.textContent = $afterElement_cssText$jscomp$2$$;
  $afterElement_cssText$jscomp$2$$ = null;
  $isRuntimeCss$$ ? $existing_style$jscomp$8$$.setAttribute("amp-runtime", "") : $isExtCss$$ ? ($existing_style$jscomp$8$$.setAttribute("amp-extension", $ext$$ || ""), $afterElement_cssText$jscomp$2$$ = $getExistingStyleElement$$module$src$style_installer$$($cssRoot$jscomp$1$$, $styleMap$$, "amp-runtime")) : ($ext$$ && $existing_style$jscomp$8$$.setAttribute($ext$$, ""), $afterElement_cssText$jscomp$2$$ = $cssRoot$jscomp$1$$.lastChild);
  _.$insertAfterOrAtStart$$module$src$dom$$($cssRoot$jscomp$1$$, $existing_style$jscomp$8$$, $afterElement_cssText$jscomp$2$$);
  $key$jscomp$53$$ && ($styleMap$$[$key$jscomp$53$$] = $existing_style$jscomp$8$$);
  return $existing_style$jscomp$8$$;
};
$getExistingStyleElement$$module$src$style_installer$$ = function($cssRoot$jscomp$2_existing$jscomp$1$$, $styleMap$jscomp$1$$, $key$jscomp$54$$) {
  return $styleMap$jscomp$1$$[$key$jscomp$54$$] ? $styleMap$jscomp$1$$[$key$jscomp$54$$] : ($cssRoot$jscomp$2_existing$jscomp$1$$ = $cssRoot$jscomp$2_existing$jscomp$1$$.querySelector("style[" + $key$jscomp$54$$ + "]")) ? $styleMap$jscomp$1$$[$key$jscomp$54$$] = $cssRoot$jscomp$2_existing$jscomp$1$$ : null;
};
$installCssTransformer$$module$src$style_installer$$ = function($cssRoot$jscomp$3$$, $transformer$$) {
  $cssRoot$jscomp$3$$.__AMP_CSS_TR = $transformer$$;
};
$maybeTransform$$module$src$style_installer$$ = function($cssRoot$jscomp$4_transformer$jscomp$1$$, $cssText$jscomp$3$$) {
  return ($cssRoot$jscomp$4_transformer$jscomp$1$$ = $cssRoot$jscomp$4_transformer$jscomp$1$$.__AMP_CSS_TR) ? $cssRoot$jscomp$4_transformer$jscomp$1$$($cssText$jscomp$3$$) : $cssText$jscomp$3$$;
};
_.$makeBodyVisible$$module$src$style_installer$$ = function() {
  var $doc$jscomp$11$$ = window.self.document, $win$jscomp$88$$ = $doc$jscomp$11$$.defaultView;
  _.$waitForBodyPromise$$module$src$dom$$($doc$jscomp$11$$).then(function() {
    return $waitForServices$$module$src$render_delaying_services$$($win$jscomp$88$$);
  }).catch(function($doc$jscomp$11$$) {
    _.$rethrowAsync$$module$src$log$$($doc$jscomp$11$$);
    return [];
  }).then(function($services$jscomp$6$$) {
    _.$bodyMadeVisible$$module$src$style_installer$$ = !0;
    $setBodyVisibleStyles$$module$src$style_installer$$($doc$jscomp$11$$);
    try {
      _.$Services$$module$src$services$resourcesForDoc$$($doc$jscomp$11$$.documentElement).$renderStarted$();
    } catch ($e$jscomp$inline_5697$$) {
    }
    0 < $services$jscomp$6$$.length && _.$JSCompiler_StaticMethods_schedulePass$$(_.$Services$$module$src$services$resourcesForDoc$$($doc$jscomp$11$$.documentElement), 1, !0);
    try {
      var $perf$$ = _.$Services$$module$src$services$performanceFor$$($win$jscomp$88$$);
      $perf$$.$D$("mbv");
      $perf$$.$F$();
    } catch ($e$jscomp$36$$) {
    }
  });
};
_.$makeBodyVisibleRecovery$$module$src$style_installer$$ = function($doc$jscomp$12$$) {
  _.$bodyMadeVisible$$module$src$style_installer$$ || (_.$bodyMadeVisible$$module$src$style_installer$$ = !0, $setBodyVisibleStyles$$module$src$style_installer$$($doc$jscomp$12$$));
};
$setBodyVisibleStyles$$module$src$style_installer$$ = function($doc$jscomp$13$$) {
  _.$setStyles$$module$src$style$$($doc$jscomp$13$$.body, {opacity:1, visibility:"visible", animation:"none"});
};
_.$styleLoaded$$module$src$style_installer$$ = function($doc$jscomp$15_sheets$$, $style$jscomp$9$$) {
  $doc$jscomp$15_sheets$$ = $doc$jscomp$15_sheets$$.styleSheets;
  for (var $i$jscomp$55$$ = 0; $i$jscomp$55$$ < $doc$jscomp$15_sheets$$.length; $i$jscomp$55$$++) {
    if ($doc$jscomp$15_sheets$$[$i$jscomp$55$$].ownerNode == $style$jscomp$9$$) {
      return !0;
    }
  }
  return !1;
};
$PriorityQueue$$module$src$utils$priority_queue$$ = function() {
  this.$D$ = [];
};
$JSCompiler_StaticMethods_PriorityQueue$$module$src$utils$priority_queue_prototype$peek$$ = function($JSCompiler_StaticMethods_PriorityQueue$$module$src$utils$priority_queue_prototype$peek$self$$) {
  var $l$$ = $JSCompiler_StaticMethods_PriorityQueue$$module$src$utils$priority_queue_prototype$peek$self$$.$D$.length;
  return $l$$ ? $JSCompiler_StaticMethods_PriorityQueue$$module$src$utils$priority_queue_prototype$peek$self$$.$D$[$l$$ - 1].item : null;
};
_.$JSCompiler_StaticMethods_PriorityQueue$$module$src$utils$priority_queue_prototype$enqueue$$ = function($JSCompiler_StaticMethods_PriorityQueue$$module$src$utils$priority_queue_prototype$enqueue$self$$, $item$jscomp$2$$, $priority$$) {
  if ((0,window.isNaN)($priority$$)) {
    throw Error("Priority must not be NaN.");
  }
  for (var $i$jscomp$inline_1212$$ = -1, $lo$jscomp$inline_1213$$ = 0, $hi$jscomp$inline_1214$$ = $JSCompiler_StaticMethods_PriorityQueue$$module$src$utils$priority_queue_prototype$enqueue$self$$.$D$.length; $lo$jscomp$inline_1213$$ <= $hi$jscomp$inline_1214$$;) {
    $i$jscomp$inline_1212$$ = Math.floor(($lo$jscomp$inline_1213$$ + $hi$jscomp$inline_1214$$) / 2);
    if ($i$jscomp$inline_1212$$ === $JSCompiler_StaticMethods_PriorityQueue$$module$src$utils$priority_queue_prototype$enqueue$self$$.$D$.length) {
      break;
    }
    if ($JSCompiler_StaticMethods_PriorityQueue$$module$src$utils$priority_queue_prototype$enqueue$self$$.$D$[$i$jscomp$inline_1212$$].$priority$ < $priority$$) {
      $lo$jscomp$inline_1213$$ = $i$jscomp$inline_1212$$ + 1;
    } else {
      if (0 < $i$jscomp$inline_1212$$ && $JSCompiler_StaticMethods_PriorityQueue$$module$src$utils$priority_queue_prototype$enqueue$self$$.$D$[$i$jscomp$inline_1212$$ - 1].$priority$ >= $priority$$) {
        $hi$jscomp$inline_1214$$ = $i$jscomp$inline_1212$$ - 1;
      } else {
        break;
      }
    }
  }
  $JSCompiler_StaticMethods_PriorityQueue$$module$src$utils$priority_queue_prototype$enqueue$self$$.$D$.splice($i$jscomp$inline_1212$$, 0, {item:$item$jscomp$2$$, $priority$:$priority$$});
};
_.$chunkServiceForDoc$$module$src$chunk$$ = function($elementOrAmpDoc$jscomp$17$$) {
  _.$registerServiceBuilderForDoc$$module$src$service$$($elementOrAmpDoc$jscomp$17$$, "chunk", $Chunks$$module$src$chunk$$);
  return _.$getServiceForDoc$$module$src$service$$($elementOrAmpDoc$jscomp$17$$, "chunk");
};
_.$startupChunk$$module$src$chunk$$ = function($JSCompiler_StaticMethods_runForStartup$self$jscomp$inline_1216_document$jscomp$4$$, $fn$jscomp$9_t$jscomp$inline_1218$$) {
  _.$deactivated$$module$src$chunk$$ ? _.$resolved$$module$src$chunk$$.then($fn$jscomp$9_t$jscomp$inline_1218$$) : ($JSCompiler_StaticMethods_runForStartup$self$jscomp$inline_1216_document$jscomp$4$$ = _.$chunkServiceForDoc$$module$src$chunk$$($JSCompiler_StaticMethods_runForStartup$self$jscomp$inline_1216_document$jscomp$4$$.documentElement), $fn$jscomp$9_t$jscomp$inline_1218$$ = new $StartupTask$$module$src$chunk$$($fn$jscomp$9_t$jscomp$inline_1218$$, $JSCompiler_StaticMethods_runForStartup$self$jscomp$inline_1216_document$jscomp$4$$.$F$, 
  $JSCompiler_StaticMethods_runForStartup$self$jscomp$inline_1216_document$jscomp$4$$.$J$), _.$JSCompiler_StaticMethods_enqueueTask_$$($JSCompiler_StaticMethods_runForStartup$self$jscomp$inline_1216_document$jscomp$4$$, $fn$jscomp$9_t$jscomp$inline_1218$$, Number.POSITIVE_INFINITY));
};
_.$Task$$module$src$chunk$$ = function($fn$jscomp$11$$) {
  this.state = "not_run";
  this.$J$ = $fn$jscomp$11$$;
};
$JSCompiler_StaticMethods_runTask_$$ = function($JSCompiler_StaticMethods_runTask_$self$$, $idleDeadline$$) {
  if ("run" != $JSCompiler_StaticMethods_runTask_$self$$.state) {
    $JSCompiler_StaticMethods_runTask_$self$$.state = "run";
    try {
      $JSCompiler_StaticMethods_runTask_$self$$.$J$($idleDeadline$$);
    } catch ($e$jscomp$39$$) {
      throw $JSCompiler_StaticMethods_runTask_$self$$.$G$(), $e$jscomp$39$$;
    }
  }
};
$StartupTask$$module$src$chunk$$ = function($fn$jscomp$12$$, $win$jscomp$89$$, $viewerPromise$$) {
  _.$Task$$module$src$chunk$$.call(this, $fn$jscomp$12$$);
  var $$jscomp$this$jscomp$6$$ = this;
  this.$D$ = $win$jscomp$89$$;
  this.$viewer_$ = null;
  $viewerPromise$$.then(function($fn$jscomp$12$$) {
    $$jscomp$this$jscomp$6$$.$viewer_$ = $fn$jscomp$12$$;
    _.$JSCompiler_StaticMethods_Viewer$$module$src$service$viewer_impl_prototype$isVisible$$($$jscomp$this$jscomp$6$$.$viewer_$) && $JSCompiler_StaticMethods_runTask_$$($$jscomp$this$jscomp$6$$, null);
    _.$JSCompiler_StaticMethods_Viewer$$module$src$service$viewer_impl_prototype$onVisibilityChanged$$($$jscomp$this$jscomp$6$$.$viewer_$, function() {
      _.$JSCompiler_StaticMethods_Viewer$$module$src$service$viewer_impl_prototype$isVisible$$($$jscomp$this$jscomp$6$$.$viewer_$) && $JSCompiler_StaticMethods_runTask_$$($$jscomp$this$jscomp$6$$, null);
    });
  });
};
$Chunks$$module$src$chunk$$ = function($ampDoc$$) {
  var $$jscomp$this$jscomp$7$$ = this;
  this.$F$ = $ampDoc$$.$win$;
  this.$D$ = new $PriorityQueue$$module$src$utils$priority_queue$$;
  this.$I$ = this.$G$.bind(this);
  this.$J$ = _.$getServicePromiseForDoc$$module$src$service$$($ampDoc$$, "viewer");
  this.$F$.addEventListener("message", function($ampDoc$$) {
    "amp-macro-task" == $ampDoc$$.data && $$jscomp$this$jscomp$7$$.$G$(null);
  });
};
_.$JSCompiler_StaticMethods_enqueueTask_$$ = function($JSCompiler_StaticMethods_enqueueTask_$self$$, $task$$, $priority$jscomp$3$$) {
  _.$JSCompiler_StaticMethods_PriorityQueue$$module$src$utils$priority_queue_prototype$enqueue$$($JSCompiler_StaticMethods_enqueueTask_$self$$.$D$, $task$$, $priority$jscomp$3$$);
  _.$resolved$$module$src$chunk$$.then(function() {
    $JSCompiler_StaticMethods_Chunks$$module$src$chunk_prototype$schedule_$$($JSCompiler_StaticMethods_enqueueTask_$self$$);
  });
};
$JSCompiler_StaticMethods_nextTask_$$ = function($JSCompiler_StaticMethods_PriorityQueue$$module$src$utils$priority_queue_prototype$dequeue$self$jscomp$inline_5701_JSCompiler_StaticMethods_nextTask_$self$$, $opt_dequeue$$) {
  for (var $JSCompiler_StaticMethods_PriorityQueue$$module$src$utils$priority_queue_prototype$dequeue$self$jscomp$inline_5699_t$jscomp$2$$ = $JSCompiler_StaticMethods_PriorityQueue$$module$src$utils$priority_queue_prototype$peek$$($JSCompiler_StaticMethods_PriorityQueue$$module$src$utils$priority_queue_prototype$dequeue$self$jscomp$inline_5701_JSCompiler_StaticMethods_nextTask_$self$$.$D$); $JSCompiler_StaticMethods_PriorityQueue$$module$src$utils$priority_queue_prototype$dequeue$self$jscomp$inline_5699_t$jscomp$2$$ && 
  "not_run" !== $JSCompiler_StaticMethods_PriorityQueue$$module$src$utils$priority_queue_prototype$dequeue$self$jscomp$inline_5699_t$jscomp$2$$.state;) {
    $JSCompiler_StaticMethods_PriorityQueue$$module$src$utils$priority_queue_prototype$dequeue$self$jscomp$inline_5699_t$jscomp$2$$ = $JSCompiler_StaticMethods_PriorityQueue$$module$src$utils$priority_queue_prototype$dequeue$self$jscomp$inline_5701_JSCompiler_StaticMethods_nextTask_$self$$.$D$, $JSCompiler_StaticMethods_PriorityQueue$$module$src$utils$priority_queue_prototype$dequeue$self$jscomp$inline_5699_t$jscomp$2$$.$D$.length && $JSCompiler_StaticMethods_PriorityQueue$$module$src$utils$priority_queue_prototype$dequeue$self$jscomp$inline_5699_t$jscomp$2$$.$D$.pop(), 
    $JSCompiler_StaticMethods_PriorityQueue$$module$src$utils$priority_queue_prototype$dequeue$self$jscomp$inline_5699_t$jscomp$2$$ = $JSCompiler_StaticMethods_PriorityQueue$$module$src$utils$priority_queue_prototype$peek$$($JSCompiler_StaticMethods_PriorityQueue$$module$src$utils$priority_queue_prototype$dequeue$self$jscomp$inline_5701_JSCompiler_StaticMethods_nextTask_$self$$.$D$);
  }
  $JSCompiler_StaticMethods_PriorityQueue$$module$src$utils$priority_queue_prototype$dequeue$self$jscomp$inline_5699_t$jscomp$2$$ && $opt_dequeue$$ && ($JSCompiler_StaticMethods_PriorityQueue$$module$src$utils$priority_queue_prototype$dequeue$self$jscomp$inline_5701_JSCompiler_StaticMethods_nextTask_$self$$ = $JSCompiler_StaticMethods_PriorityQueue$$module$src$utils$priority_queue_prototype$dequeue$self$jscomp$inline_5701_JSCompiler_StaticMethods_nextTask_$self$$.$D$, $JSCompiler_StaticMethods_PriorityQueue$$module$src$utils$priority_queue_prototype$dequeue$self$jscomp$inline_5701_JSCompiler_StaticMethods_nextTask_$self$$.$D$.length && 
  $JSCompiler_StaticMethods_PriorityQueue$$module$src$utils$priority_queue_prototype$dequeue$self$jscomp$inline_5701_JSCompiler_StaticMethods_nextTask_$self$$.$D$.pop());
  return $JSCompiler_StaticMethods_PriorityQueue$$module$src$utils$priority_queue_prototype$dequeue$self$jscomp$inline_5699_t$jscomp$2$$;
};
$JSCompiler_StaticMethods_executeAsap_$$ = function($JSCompiler_StaticMethods_executeAsap_$self$$) {
  _.$resolved$$module$src$chunk$$.then(function() {
    $JSCompiler_StaticMethods_executeAsap_$self$$.$I$(null);
  });
};
$JSCompiler_StaticMethods_Chunks$$module$src$chunk_prototype$schedule_$$ = function($JSCompiler_StaticMethods_Chunks$$module$src$chunk_prototype$schedule_$self$$) {
  var $nextTask$$ = $JSCompiler_StaticMethods_nextTask_$$($JSCompiler_StaticMethods_Chunks$$module$src$chunk_prototype$schedule_$self$$);
  $nextTask$$ && ($nextTask$$.$F$() ? $JSCompiler_StaticMethods_executeAsap_$$($JSCompiler_StaticMethods_Chunks$$module$src$chunk_prototype$schedule_$self$$) : $nextTask$$.$I$() && $JSCompiler_StaticMethods_Chunks$$module$src$chunk_prototype$schedule_$self$$.$F$.requestIdleCallback ? $onIdle$$module$src$chunk$$($JSCompiler_StaticMethods_Chunks$$module$src$chunk_prototype$schedule_$self$$.$F$, $JSCompiler_StaticMethods_Chunks$$module$src$chunk_prototype$schedule_$self$$.$I$) : $JSCompiler_StaticMethods_Chunks$$module$src$chunk_prototype$schedule_$self$$.$F$.postMessage("amp-macro-task", 
  "*"));
};
$onIdle$$module$src$chunk$$ = function($win$jscomp$90$$, $fn$jscomp$15$$) {
  function $rIC$$($info$jscomp$5$$) {
    if (15 > $info$jscomp$5$$.timeRemaining()) {
      var $remainingTimeout$$ = 2000 - (Date.now() - $startTime$jscomp$7$$);
      0 >= $remainingTimeout$$ || $info$jscomp$5$$.didTimeout ? ("CHUNK", $fn$jscomp$15$$($info$jscomp$5$$)) : ("CHUNK", $win$jscomp$90$$.requestIdleCallback($rIC$$, {timeout:$remainingTimeout$$}));
    } else {
      "CHUNK", $fn$jscomp$15$$($info$jscomp$5$$);
    }
  }
  var $startTime$jscomp$7$$ = Date.now();
  $win$jscomp$90$$.requestIdleCallback($rIC$$, {timeout:2000});
};
_.$triggerAnalyticsEvent$$module$src$analytics$$ = function($target$jscomp$65$$, $eventType$jscomp$7$$, $opt_vars$$) {
  _.$Services$$module$src$services$analyticsForDocOrNull$$($target$jscomp$65$$).then(function($analytics$$) {
    $analytics$$ && $analytics$$.$F$($target$jscomp$65$$, $eventType$jscomp$7$$, $opt_vars$$);
  });
};
$exponentialBackoff$$module$src$exponential_backoff$$ = function() {
  var $getTimeout$$ = _.$exponentialBackoffClock$$module$src$exponential_backoff$$(1.5);
  return function($work$$) {
    return (0,window.setTimeout)($work$$, $getTimeout$$());
  };
};
_.$exponentialBackoffClock$$module$src$exponential_backoff$$ = function($opt_base$jscomp$2$$) {
  var $base$jscomp$4$$ = $opt_base$jscomp$2$$ || 2, $count$jscomp$15$$ = 0;
  return function() {
    var $opt_base$jscomp$2$$ = Math.pow($base$jscomp$4$$, $count$jscomp$15$$++);
    $opt_base$jscomp$2$$ += _.$getJitter$$module$src$exponential_backoff$$($opt_base$jscomp$2$$);
    return 1000 * $opt_base$jscomp$2$$;
  };
};
_.$getJitter$$module$src$exponential_backoff$$ = function($jitter_wait$jscomp$1$$, $opt_perc$$) {
  $jitter_wait$jscomp$1$$ = $jitter_wait$jscomp$1$$ * ($opt_perc$$ || .3) * Math.random();
  .5 < Math.random() && ($jitter_wait$jscomp$1$$ *= -1);
  return $jitter_wait$jscomp$1$$;
};
$reportingBackoff$$module$src$error$$ = function($work$jscomp$1$$) {
  $reportingBackoff$$module$src$error$$ = $exponentialBackoff$$module$src$exponential_backoff$$();
  return $reportingBackoff$$module$src$error$$($work$jscomp$1$$);
};
_.$reportError$$module$src$error$$ = function($error$jscomp$14$$, $opt_associatedElement$jscomp$1$$) {
  try {
    if ($error$jscomp$14$$) {
      if (void 0 !== $error$jscomp$14$$.message) {
        $error$jscomp$14$$ = _.$duplicateErrorIfNecessary$$module$src$log$$($error$jscomp$14$$);
      } else {
        var $origError$$ = $error$jscomp$14$$, $JSCompiler_temp_const$jscomp$449$$ = Error;
        try {
          var $JSCompiler_inline_result$jscomp$450$$ = JSON.stringify($origError$$);
        } catch ($e$jscomp$inline_1221$$) {
          $JSCompiler_inline_result$jscomp$450$$ = String($origError$$);
        }
        $error$jscomp$14$$ = $JSCompiler_temp_const$jscomp$449$$($JSCompiler_inline_result$jscomp$450$$);
        $error$jscomp$14$$.$origError$ = $origError$$;
      }
    } else {
      $error$jscomp$14$$ = Error("Unknown error");
    }
    if ($error$jscomp$14$$.$reported$) {
      return $error$jscomp$14$$;
    }
    $error$jscomp$14$$.$reported$ = !0;
    var $element$jscomp$72$$ = $opt_associatedElement$jscomp$1$$ || $error$jscomp$14$$.$associatedElement$;
    $element$jscomp$72$$ && $element$jscomp$72$$.classList && ($element$jscomp$72$$.classList.add("i-amphtml-error"), _.$getMode$$module$src$mode$$().$development$ && ($element$jscomp$72$$.classList.add("i-amphtml-element-error"), $element$jscomp$72$$.setAttribute("error-message", $error$jscomp$14$$.message)));
    if (window.self.console) {
      var $output$jscomp$3$$ = window.console.error || window.console.log;
      $error$jscomp$14$$.$messageArray$ ? $output$jscomp$3$$.apply(window.console, $error$jscomp$14$$.$messageArray$) : $element$jscomp$72$$ ? $output$jscomp$3$$.call(window.console, $error$jscomp$14$$.message, $element$jscomp$72$$) : $output$jscomp$3$$.call(window.console, $error$jscomp$14$$.message);
    }
    $onError$$module$src$error$$.call(void 0, void 0, void 0, void 0, void 0, $error$jscomp$14$$);
  } catch ($errorReportingError$$) {
    (0,window.setTimeout)(function() {
      throw $errorReportingError$$;
    });
  }
  return $error$jscomp$14$$;
};
$isBlockedByConsent$$module$src$error$$ = function($errorOrMessage$jscomp$1$$) {
  return $errorOrMessage$jscomp$1$$ ? "string" == typeof $errorOrMessage$jscomp$1$$ ? _.$startsWith$$module$src$string$$($errorOrMessage$jscomp$1$$, "BLOCK_BY_CONSENT") : "string" == typeof $errorOrMessage$jscomp$1$$.message ? _.$startsWith$$module$src$string$$($errorOrMessage$jscomp$1$$.message, "BLOCK_BY_CONSENT") : !1 : !1;
};
_.$installErrorReporting$$module$src$error$$ = function() {
  var $win$jscomp$92$$ = window.self;
  $win$jscomp$92$$.onerror = $onError$$module$src$error$$;
  $win$jscomp$92$$.addEventListener("unhandledrejection", function($win$jscomp$92$$) {
    !$win$jscomp$92$$.reason || "CANCELLED" !== $win$jscomp$92$$.reason.message && "BLOCK_BY_CONSENT" !== $win$jscomp$92$$.reason.message ? _.$reportError$$module$src$error$$($win$jscomp$92$$.reason || Error("rejected promise " + $win$jscomp$92$$)) : $win$jscomp$92$$.preventDefault();
  });
};
$onError$$module$src$error$$ = function($message$jscomp$29$$, $filename$$, $line$$, $col$$, $error$jscomp$15$$) {
  var $$jscomp$this$jscomp$11$$ = this;
  this && this.document && _.$makeBodyVisibleRecovery$$module$src$style_installer$$(this.document);
  if (!_.$getMode$$module$src$mode$$().$development$) {
    var $hasNonAmpJs$$ = !1;
    try {
      $hasNonAmpJs$$ = $detectNonAmpJs$$module$src$error$$();
    } catch ($ignore$jscomp$1$$) {
    }
    if (!($hasNonAmpJs$$ && 0.01 < Math.random())) {
      var $data$jscomp$36$$ = $getErrorReportData$$module$src$error$$($message$jscomp$29$$, $filename$$, $line$$, $col$$, $error$jscomp$15$$, $hasNonAmpJs$$);
      $data$jscomp$36$$ && $reportingBackoff$$module$src$error$$(function() {
        return $reportErrorToServerOrViewer$$module$src$error$$($$jscomp$this$jscomp$11$$, $data$jscomp$36$$);
      });
    }
  }
};
$reportErrorToServerOrViewer$$module$src$error$$ = function($win$jscomp$93$$, $data$jscomp$37$$) {
  return $maybeReportErrorToViewer$$module$src$error$$($win$jscomp$93$$, $data$jscomp$37$$).then(function($win$jscomp$93$$) {
    $win$jscomp$93$$ || ($win$jscomp$93$$ = new window.XMLHttpRequest, $win$jscomp$93$$.open("POST", _.$urls$$module$src$config$$.errorReporting, !0), $win$jscomp$93$$.send(JSON.stringify($data$jscomp$37$$)));
  });
};
$maybeReportErrorToViewer$$module$src$error$$ = function($ampdocService$jscomp$1_ampdocSingle$jscomp$1_win$jscomp$94$$, $data$jscomp$38$$) {
  $ampdocService$jscomp$1_ampdocSingle$jscomp$1_win$jscomp$94$$ = _.$Services$$module$src$services$ampdocServiceFor$$($ampdocService$jscomp$1_ampdocSingle$jscomp$1_win$jscomp$94$$);
  if (!$ampdocService$jscomp$1_ampdocSingle$jscomp$1_win$jscomp$94$$.$isSingleDoc$()) {
    return window.Promise.resolve(!1);
  }
  $ampdocService$jscomp$1_ampdocSingle$jscomp$1_win$jscomp$94$$ = $ampdocService$jscomp$1_ampdocSingle$jscomp$1_win$jscomp$94$$.$getAmpDoc$();
  if (!$ampdocService$jscomp$1_ampdocSingle$jscomp$1_win$jscomp$94$$.getRootNode().documentElement.hasAttribute("report-errors-to-viewer")) {
    return window.Promise.resolve(!1);
  }
  var $viewer$jscomp$2$$ = _.$Services$$module$src$services$viewerForDoc$$($ampdocService$jscomp$1_ampdocSingle$jscomp$1_win$jscomp$94$$);
  return _.$JSCompiler_StaticMethods_hasCapability$$($viewer$jscomp$2$$, "errorReporter") ? $JSCompiler_StaticMethods_isTrustedViewer$$($viewer$jscomp$2$$).then(function($ampdocService$jscomp$1_ampdocSingle$jscomp$1_win$jscomp$94$$) {
    if (!$ampdocService$jscomp$1_ampdocSingle$jscomp$1_win$jscomp$94$$) {
      return !1;
    }
    _.$JSCompiler_StaticMethods_Viewer$$module$src$service$viewer_impl_prototype$sendMessage$$($viewer$jscomp$2$$, "error", _.$dict$$module$src$utils$object$$({m:$data$jscomp$38$$.m, a:$data$jscomp$38$$.a, s:$data$jscomp$38$$.s, el:$data$jscomp$38$$.el, v:$data$jscomp$38$$.v, jse:$data$jscomp$38$$.jse}));
    return !0;
  }) : window.Promise.resolve(!1);
};
$getErrorReportData$$module$src$error$$ = function($message$jscomp$31_message$jscomp$inline_1223$$, $element$jscomp$inline_1230_filename$jscomp$1$$, $line$jscomp$1$$, $col$jscomp$1$$, $error$jscomp$17$$, $exps_hasNonAmpJs$jscomp$1_resolvedViewerUrl_runtime$$) {
  $error$jscomp$17$$ && ($error$jscomp$17$$.message ? $message$jscomp$31_message$jscomp$inline_1223$$ = $error$jscomp$17$$.message : $message$jscomp$31_message$jscomp$inline_1223$$ = String($error$jscomp$17$$));
  $message$jscomp$31_message$jscomp$inline_1223$$ || ($message$jscomp$31_message$jscomp$inline_1223$$ = "Unknown error");
  var $JSCompiler_inline_result$jscomp$427_JSCompiler_inline_result$jscomp$501_expected$$ = !(!$error$jscomp$17$$ || !$error$jscomp$17$$.$expected$);
  if (!/_reported_/.test($message$jscomp$31_message$jscomp$inline_1223$$) && "CANCELLED" != $message$jscomp$31_message$jscomp$inline_1223$$) {
    var $detachedWindow$$ = !(window.self && window.self.window), $data$jscomp$39_throttleBase$$ = Math.random();
    if (-1 != $message$jscomp$31_message$jscomp$inline_1223$$.indexOf("Failed to load:") || "Script error." == $message$jscomp$31_message$jscomp$inline_1223$$ || $detachedWindow$$) {
      if ($JSCompiler_inline_result$jscomp$427_JSCompiler_inline_result$jscomp$501_expected$$ = !0, 0.001 < $data$jscomp$39_throttleBase$$) {
        return;
      }
    }
    var $isUserError$$ = $isUserErrorMessage$$module$src$log$$($message$jscomp$31_message$jscomp$inline_1223$$);
    if (!($isUserError$$ && 0.1 < $data$jscomp$39_throttleBase$$)) {
      $data$jscomp$39_throttleBase$$ = Object.create(null);
      $data$jscomp$39_throttleBase$$.v = _.$getMode$$module$src$mode$$().$rtvVersion$;
      $data$jscomp$39_throttleBase$$.noAmp = $exps_hasNonAmpJs$jscomp$1_resolvedViewerUrl_runtime$$ ? "1" : "0";
      $data$jscomp$39_throttleBase$$.m = $message$jscomp$31_message$jscomp$inline_1223$$.replace("\u200b\u200b\u200b", "");
      $data$jscomp$39_throttleBase$$.a = $isUserError$$ ? "1" : "0";
      $data$jscomp$39_throttleBase$$.ex = $JSCompiler_inline_result$jscomp$427_JSCompiler_inline_result$jscomp$501_expected$$ ? "1" : "0";
      $data$jscomp$39_throttleBase$$.dw = $detachedWindow$$ ? "1" : "0";
      $exps_hasNonAmpJs$jscomp$1_resolvedViewerUrl_runtime$$ = "1p";
      window.self.context && window.self.context.location ? ($data$jscomp$39_throttleBase$$["3p"] = "1", $exps_hasNonAmpJs$jscomp$1_resolvedViewerUrl_runtime$$ = "3p") : _.$getMode$$module$src$mode$$().runtime && ($exps_hasNonAmpJs$jscomp$1_resolvedViewerUrl_runtime$$ = _.$getMode$$module$src$mode$$().runtime);
      _.$getMode$$module$src$mode$$().$singlePassType$ && ($data$jscomp$39_throttleBase$$.spt = _.$getMode$$module$src$mode$$().$singlePassType$);
      $data$jscomp$39_throttleBase$$.rt = $exps_hasNonAmpJs$jscomp$1_resolvedViewerUrl_runtime$$;
      "inabox" === $exps_hasNonAmpJs$jscomp$1_resolvedViewerUrl_runtime$$ && ($data$jscomp$39_throttleBase$$.adid = _.$getMode$$module$src$mode$$().$a4aId$);
      $data$jscomp$39_throttleBase$$.ca = _.$isCanary$$module$src$experiments$$(window.self) ? "1" : "0";
      $data$jscomp$39_throttleBase$$.bt = _.$getBinaryType$$module$src$experiments$$(window.self);
      window.self.location.ancestorOrigins && window.self.location.ancestorOrigins[0] && ($data$jscomp$39_throttleBase$$.or = window.self.location.ancestorOrigins[0]);
      window.self.$viewerState$ && ($data$jscomp$39_throttleBase$$.vs = window.self.$viewerState$);
      window.self.parent && window.self.parent != window.self && ($data$jscomp$39_throttleBase$$.iem = "1");
      window.self.AMP && window.self.AMP.viewer && ($exps_hasNonAmpJs$jscomp$1_resolvedViewerUrl_runtime$$ = window.self.AMP.viewer.$resolvedViewerUrl_$, $JSCompiler_inline_result$jscomp$427_JSCompiler_inline_result$jscomp$501_expected$$ = window.self.AMP.viewer.$messagingOrigin_$, $exps_hasNonAmpJs$jscomp$1_resolvedViewerUrl_runtime$$ && ($data$jscomp$39_throttleBase$$.rvu = $exps_hasNonAmpJs$jscomp$1_resolvedViewerUrl_runtime$$), $JSCompiler_inline_result$jscomp$427_JSCompiler_inline_result$jscomp$501_expected$$ && 
      ($data$jscomp$39_throttleBase$$.mso = $JSCompiler_inline_result$jscomp$427_JSCompiler_inline_result$jscomp$501_expected$$));
      $detectedJsEngine$$module$src$error$$ || ($detectedJsEngine$$module$src$error$$ = $detectJsEngineFromStack$$module$src$error$$());
      $data$jscomp$39_throttleBase$$.jse = $detectedJsEngine$$module$src$error$$;
      $exps_hasNonAmpJs$jscomp$1_resolvedViewerUrl_runtime$$ = [];
      $JSCompiler_inline_result$jscomp$427_JSCompiler_inline_result$jscomp$501_expected$$ = window.self.__AMP__EXPERIMENT_TOGGLES || null;
      for (var $exp$$ in $JSCompiler_inline_result$jscomp$427_JSCompiler_inline_result$jscomp$501_expected$$) {
        $exps_hasNonAmpJs$jscomp$1_resolvedViewerUrl_runtime$$.push($exp$$ + "=" + ($JSCompiler_inline_result$jscomp$427_JSCompiler_inline_result$jscomp$501_expected$$[$exp$$] ? "1" : "0"));
      }
      $data$jscomp$39_throttleBase$$.exps = $exps_hasNonAmpJs$jscomp$1_resolvedViewerUrl_runtime$$.join(",");
      $error$jscomp$17$$ ? ($data$jscomp$39_throttleBase$$.el = $error$jscomp$17$$.$associatedElement$ ? $error$jscomp$17$$.$associatedElement$.tagName : "u", $error$jscomp$17$$.args && ($data$jscomp$39_throttleBase$$.args = JSON.stringify($error$jscomp$17$$.args)), $isUserError$$ || $error$jscomp$17$$.$ignoreStack$ || !$error$jscomp$17$$.stack || ($data$jscomp$39_throttleBase$$.s = $error$jscomp$17$$.stack), $error$jscomp$17$$.message && ($error$jscomp$17$$.message += " _reported_")) : ($data$jscomp$39_throttleBase$$.f = 
      $element$jscomp$inline_1230_filename$jscomp$1$$ || "", $data$jscomp$39_throttleBase$$.l = $line$jscomp$1$$ || "", $data$jscomp$39_throttleBase$$.c = $col$jscomp$1$$ || "");
      $data$jscomp$39_throttleBase$$.r = window.self.document.referrer;
      $data$jscomp$39_throttleBase$$.ae = $accumulatedErrorMessages$$module$src$error$$.join(",");
      $data$jscomp$39_throttleBase$$.fr = window.self.location.$D$ || window.self.location.hash;
      $element$jscomp$inline_1230_filename$jscomp$1$$ = $message$jscomp$31_message$jscomp$inline_1223$$;
      25 <= $accumulatedErrorMessages$$module$src$error$$.length && $accumulatedErrorMessages$$module$src$error$$.splice(0, $accumulatedErrorMessages$$module$src$error$$.length - 25 + 1);
      $accumulatedErrorMessages$$module$src$error$$.push($element$jscomp$inline_1230_filename$jscomp$1$$);
      return $data$jscomp$39_throttleBase$$;
    }
  }
};
$detectNonAmpJs$$module$src$error$$ = function() {
  for (var $scripts$jscomp$2$$ = window.self.document.querySelectorAll("script[src]"), $i$jscomp$58$$ = 0; $i$jscomp$58$$ < $scripts$jscomp$2$$.length; $i$jscomp$58$$++) {
    if (!_.$isProxyOrigin$$module$src$url$$($scripts$jscomp$2$$[$i$jscomp$58$$].src.toLowerCase())) {
      return !0;
    }
  }
  return !1;
};
$detectJsEngineFromStack$$module$src$error$$ = function() {
  function $Fn$$() {
  }
  $Fn$$.prototype.t = function() {
    throw Error("message");
  };
  var $object$jscomp$1_stack$jscomp$1$$ = new $Fn$$;
  try {
    $object$jscomp$1_stack$jscomp$1$$.t();
  } catch ($e$jscomp$42$$) {
    $object$jscomp$1_stack$jscomp$1$$ = $e$jscomp$42$$.stack;
    if (_.$startsWith$$module$src$string$$($object$jscomp$1_stack$jscomp$1$$, "t@")) {
      return "Safari";
    }
    if (-1 < $object$jscomp$1_stack$jscomp$1$$.indexOf(".prototype.t@")) {
      return "Firefox";
    }
    var $last$$ = $object$jscomp$1_stack$jscomp$1$$.split("\n").pop();
    if (/\bat .* \(/i.test($last$$)) {
      return "IE";
    }
    if (_.$startsWith$$module$src$string$$($object$jscomp$1_stack$jscomp$1$$, "Error: message")) {
      return "Chrome";
    }
  }
  return "unknown";
};
_.$reportErrorToAnalytics$$module$src$error$$ = function($error$jscomp$18_vars$$, $root$jscomp$inline_1235_win$jscomp$96$$) {
  _.$Services$$module$src$services$ampdocServiceFor$$($root$jscomp$inline_1235_win$jscomp$96$$).$isSingleDoc$() && _.$isExperimentOn$$module$src$experiments$$($root$jscomp$inline_1235_win$jscomp$96$$, "user-error-reporting") && ($error$jscomp$18_vars$$ = _.$dict$$module$src$utils$object$$({errorName:$error$jscomp$18_vars$$.name, errorMessage:$error$jscomp$18_vars$$.message}), $root$jscomp$inline_1235_win$jscomp$96$$ = _.$Services$$module$src$services$ampdocServiceFor$$($root$jscomp$inline_1235_win$jscomp$96$$).$getAmpDoc$().getRootNode(), 
  _.$triggerAnalyticsEvent$$module$src$analytics$$($root$jscomp$inline_1235_win$jscomp$96$$.documentElement || $root$jscomp$inline_1235_win$jscomp$96$$.body || $root$jscomp$inline_1235_win$jscomp$96$$, "user-error", $error$jscomp$18_vars$$));
};
_.$isDocumentReady$$module$src$document_ready$$ = function($doc$jscomp$16$$) {
  return "loading" != $doc$jscomp$16$$.readyState && "uninitialized" != $doc$jscomp$16$$.readyState;
};
$isDocumentComplete$$module$src$document_ready$$ = function($doc$jscomp$17$$) {
  return "complete" == $doc$jscomp$17$$.readyState;
};
$onDocumentReady$$module$src$document_ready$$ = function($doc$jscomp$18$$, $callback$jscomp$62$$) {
  $onDocumentState$$module$src$document_ready$$($doc$jscomp$18$$, _.$isDocumentReady$$module$src$document_ready$$, $callback$jscomp$62$$);
};
$onDocumentState$$module$src$document_ready$$ = function($doc$jscomp$19$$, $stateFn$$, $callback$jscomp$63$$) {
  var $ready$$ = $stateFn$$($doc$jscomp$19$$);
  if ($ready$$) {
    $callback$jscomp$63$$($doc$jscomp$19$$);
  } else {
    var $readyListener$$ = function() {
      $stateFn$$($doc$jscomp$19$$) && ($ready$$ || ($ready$$ = !0, $callback$jscomp$63$$($doc$jscomp$19$$)), $doc$jscomp$19$$.removeEventListener("readystatechange", $readyListener$$));
    };
    $doc$jscomp$19$$.addEventListener("readystatechange", $readyListener$$);
  }
};
_.$whenDocumentReady$$module$src$document_ready$$ = function($doc$jscomp$20$$) {
  return new window.Promise(function($resolve$jscomp$20$$) {
    $onDocumentReady$$module$src$document_ready$$($doc$jscomp$20$$, $resolve$jscomp$20$$);
  });
};
$whenDocumentComplete$$module$src$document_ready$$ = function($doc$jscomp$21$$) {
  return new window.Promise(function($resolve$jscomp$21$$) {
    $onDocumentState$$module$src$document_ready$$($doc$jscomp$21$$, $isDocumentComplete$$module$src$document_ready$$, $resolve$jscomp$21$$);
  });
};
_.$fontStylesheetTimeout$$module$src$font_stylesheet_timeout$$ = function() {
  var $win$jscomp$98$$ = window.self;
  $onDocumentReady$$module$src$document_ready$$($win$jscomp$98$$.document, function() {
    return $maybeTimeoutFonts$$module$src$font_stylesheet_timeout$$($win$jscomp$98$$);
  });
};
$maybeTimeoutFonts$$module$src$font_stylesheet_timeout$$ = function($win$jscomp$99$$) {
  var $timeSinceResponseStart$$ = 0, $perf$jscomp$1$$ = $win$jscomp$99$$.performance;
  $perf$jscomp$1$$ && $perf$jscomp$1$$.timing && $perf$jscomp$1$$.timing.responseStart && ($timeSinceResponseStart$$ = Date.now() - $perf$jscomp$1$$.timing.responseStart);
  var $timeout$jscomp$2$$ = Math.max(1, 250 - $timeSinceResponseStart$$);
  $win$jscomp$99$$.setTimeout(function() {
    $timeoutFontFaces$$module$src$font_stylesheet_timeout$$($win$jscomp$99$$);
    var $timeSinceResponseStart$$ = $win$jscomp$99$$.document.styleSheets;
    if ($timeSinceResponseStart$$) {
      for (var $perf$jscomp$1$$ = $win$jscomp$99$$.document.querySelectorAll('link[rel~="stylesheet"]:not([href^="' + _.$cssEscape$$module$third_party$css_escape$css_escape$$(_.$urls$$module$src$config$$.cdn) + '"])'), $timedoutStyleSheets$$ = [], $i$jscomp$59$$ = 0; $i$jscomp$59$$ < $perf$jscomp$1$$.length; $i$jscomp$59$$++) {
        for (var $link$$ = $perf$jscomp$1$$[$i$jscomp$59$$], $found$$ = !1, $n$jscomp$8$$ = 0; $n$jscomp$8$$ < $timeSinceResponseStart$$.length; $n$jscomp$8$$++) {
          if ($timeSinceResponseStart$$[$n$jscomp$8$$].ownerNode == $link$$) {
            $found$$ = !0;
            break;
          }
        }
        $found$$ || $timedoutStyleSheets$$.push($link$$);
      }
      $timeSinceResponseStart$$ = {};
      for ($perf$jscomp$1$$ = 0; $perf$jscomp$1$$ < $timedoutStyleSheets$$.length; $timeSinceResponseStart$$ = {$link$127$:$timeSinceResponseStart$$.$link$127$, media:$timeSinceResponseStart$$.media}, $perf$jscomp$1$$++) {
        $timeSinceResponseStart$$.$link$127$ = $timedoutStyleSheets$$[$perf$jscomp$1$$], $timeSinceResponseStart$$.media = $timeSinceResponseStart$$.$link$127$.media || "all", $timeSinceResponseStart$$.$link$127$.media = "not-matching", $timeSinceResponseStart$$.$link$127$.onload = function($timeSinceResponseStart$$) {
          return function() {
            $timeSinceResponseStart$$.$link$127$.media = $timeSinceResponseStart$$.media;
            $timeoutFontFaces$$module$src$font_stylesheet_timeout$$($win$jscomp$99$$);
          };
        }($timeSinceResponseStart$$), $timeSinceResponseStart$$.$link$127$.setAttribute("i-amphtml-timeout", $timeout$jscomp$2$$), $timeSinceResponseStart$$.$link$127$.parentNode.insertBefore($timeSinceResponseStart$$.$link$127$, $timeSinceResponseStart$$.$link$127$.nextSibling);
      }
    }
  }, $timeout$jscomp$2$$);
};
$timeoutFontFaces$$module$src$font_stylesheet_timeout$$ = function($doc$jscomp$22_it_win$jscomp$100$$) {
  if (_.$isExperimentOn$$module$src$experiments$$($doc$jscomp$22_it_win$jscomp$100$$, "font-display-swap") && ($doc$jscomp$22_it_win$jscomp$100$$ = $doc$jscomp$22_it_win$jscomp$100$$.document, $doc$jscomp$22_it_win$jscomp$100$$.fonts && $doc$jscomp$22_it_win$jscomp$100$$.fonts.values)) {
    $doc$jscomp$22_it_win$jscomp$100$$ = $doc$jscomp$22_it_win$jscomp$100$$.fonts.values();
    for (var $entry$jscomp$2_fontFace$$; $entry$jscomp$2_fontFace$$ = $doc$jscomp$22_it_win$jscomp$100$$.next();) {
      $entry$jscomp$2_fontFace$$ = $entry$jscomp$2_fontFace$$.value;
      if (!$entry$jscomp$2_fontFace$$) {
        break;
      }
      "loading" == $entry$jscomp$2_fontFace$$.status && "display" in $entry$jscomp$2_fontFace$$ && "auto" == $entry$jscomp$2_fontFace$$.display && ($entry$jscomp$2_fontFace$$.display = "swap");
    }
  }
};
_.$maybeTrackImpression$$module$src$impression$$ = function() {
  var $win$jscomp$101$$ = window.self, $$jscomp$destructuring$var33_isTrustedViewerPromise$$ = new _.$Deferred$$module$src$utils$promise$$, $isTrustedReferrerPromise_promise$jscomp$14_viewer$jscomp$3$$ = $$jscomp$destructuring$var33_isTrustedViewerPromise$$.$promise$, $resolveImpression$$ = $$jscomp$destructuring$var33_isTrustedViewerPromise$$.resolve;
  _.$trackImpressionPromise$$module$src$impression$$ = _.$JSCompiler_StaticMethods_timeoutPromise$$(_.$Services$$module$src$services$timerFor$$($win$jscomp$101$$), 8000, $isTrustedReferrerPromise_promise$jscomp$14_viewer$jscomp$3$$, "TrackImpressionPromise timeout").catch(function($win$jscomp$101$$) {
    _.$dev$$module$src$log$$().$Log$$module$src$log_prototype$warn$("IMPRESSION", $win$jscomp$101$$);
  });
  $isTrustedReferrerPromise_promise$jscomp$14_viewer$jscomp$3$$ = _.$Services$$module$src$services$viewerForDoc$$($win$jscomp$101$$.document.documentElement);
  $$jscomp$destructuring$var33_isTrustedViewerPromise$$ = $JSCompiler_StaticMethods_isTrustedViewer$$($isTrustedReferrerPromise_promise$jscomp$14_viewer$jscomp$3$$);
  $isTrustedReferrerPromise_promise$jscomp$14_viewer$jscomp$3$$ = $isTrustedReferrerPromise_promise$jscomp$14_viewer$jscomp$3$$.$I$.then(function($win$jscomp$101$$) {
    return $isTrustedReferrer$$module$src$impression$$($win$jscomp$101$$);
  });
  window.Promise.all([$$jscomp$destructuring$var33_isTrustedViewerPromise$$, $isTrustedReferrerPromise_promise$jscomp$14_viewer$jscomp$3$$]).then(function($$jscomp$destructuring$var33_isTrustedViewerPromise$$) {
    var $isTrustedReferrerPromise_promise$jscomp$14_viewer$jscomp$3$$ = $$jscomp$destructuring$var33_isTrustedViewerPromise$$[1];
    $$jscomp$destructuring$var33_isTrustedViewerPromise$$[0] || $isTrustedReferrerPromise_promise$jscomp$14_viewer$jscomp$3$$ || _.$isExperimentOn$$module$src$experiments$$($win$jscomp$101$$, "alp") ? ($$jscomp$destructuring$var33_isTrustedViewerPromise$$ = $handleReplaceUrl$$module$src$impression$$($win$jscomp$101$$), $isTrustedReferrerPromise_promise$jscomp$14_viewer$jscomp$3$$ = $handleClickUrl$$module$src$impression$$($win$jscomp$101$$), window.Promise.all([$$jscomp$destructuring$var33_isTrustedViewerPromise$$, 
    $isTrustedReferrerPromise_promise$jscomp$14_viewer$jscomp$3$$]).then(function() {
      $resolveImpression$$();
    }, function() {
    })) : $resolveImpression$$();
  });
};
$handleReplaceUrl$$module$src$impression$$ = function($win$jscomp$102$$) {
  var $viewer$jscomp$4$$ = _.$Services$$module$src$services$viewerForDoc$$($win$jscomp$102$$.document.documentElement);
  return $viewer$jscomp$4$$.$params_$.replaceUrl ? _.$JSCompiler_StaticMethods_hasCapability$$($viewer$jscomp$4$$, "replaceUrl") ? _.$JSCompiler_StaticMethods_sendMessageAwaitResponse$$($viewer$jscomp$4$$, "getReplaceUrl", void 0).then(function($win$jscomp$102$$) {
    $win$jscomp$102$$ && "object" == typeof $win$jscomp$102$$ ? $JSCompiler_StaticMethods_replaceUrl$$($viewer$jscomp$4$$, $win$jscomp$102$$.replaceUrl || null) : _.$dev$$module$src$log$$().$Log$$module$src$log_prototype$warn$("IMPRESSION", "get invalid replaceUrl response");
  }, function($win$jscomp$102$$) {
    _.$dev$$module$src$log$$().$Log$$module$src$log_prototype$warn$("IMPRESSION", "Error request replaceUrl from viewer", $win$jscomp$102$$);
  }) : ($JSCompiler_StaticMethods_replaceUrl$$($viewer$jscomp$4$$, $viewer$jscomp$4$$.$params_$.replaceUrl || null), window.Promise.resolve()) : window.Promise.resolve();
};
$isTrustedReferrer$$module$src$impression$$ = function($referrer$jscomp$1$$) {
  var $url$jscomp$42$$ = _.$parseUrlDeprecated$$module$src$url$$($referrer$jscomp$1$$);
  return "https:" != $url$jscomp$42$$.protocol ? !1 : $TRUSTED_REFERRER_HOSTS$$module$src$impression$$.some(function($referrer$jscomp$1$$) {
    return $referrer$jscomp$1$$.test($url$jscomp$42$$.hostname);
  });
};
$handleClickUrl$$module$src$impression$$ = function($win$jscomp$103$$) {
  var $viewer$jscomp$5$$ = _.$Services$$module$src$services$viewerForDoc$$($win$jscomp$103$$.document.documentElement), $clickUrl$$ = $viewer$jscomp$5$$.$params_$.click;
  if (!$clickUrl$$) {
    return window.Promise.resolve();
  }
  if (0 != $clickUrl$$.indexOf("https://")) {
    return _.$user$$module$src$log$$().$Log$$module$src$log_prototype$warn$("IMPRESSION", "click fragment param should start with https://. Found ", $clickUrl$$), window.Promise.resolve();
  }
  $win$jscomp$103$$.location.hash && ($win$jscomp$103$$.location.hash = "");
  return $viewer$jscomp$5$$.$D$.then(function() {
    return $invoke$$module$src$impression$$($win$jscomp$103$$, $clickUrl$$);
  }).then(function($viewer$jscomp$5$$) {
    if ($viewer$jscomp$5$$) {
      var $clickUrl$$ = $viewer$jscomp$5$$.location;
      ($viewer$jscomp$5$$ = $viewer$jscomp$5$$.tracking_url || $clickUrl$$) && !_.$isProxyOrigin$$module$src$url$$($viewer$jscomp$5$$) && ((new window.Image).src = $viewer$jscomp$5$$);
      if ($clickUrl$$ && $win$jscomp$103$$.history.replaceState) {
        $viewer$jscomp$5$$ = _.$Services$$module$src$services$viewerForDoc$$($win$jscomp$103$$.document.documentElement);
        var $response$jscomp$7_trackUrl$jscomp$inline_1240_viewer$jscomp$inline_1241$$ = $win$jscomp$103$$.location.href;
        $clickUrl$$ = _.$parseUrlDeprecated$$module$src$url$$($clickUrl$$);
        $clickUrl$$ = _.$parseQueryString_$$module$src$url_parse_query_string$$($clickUrl$$.search);
        $clickUrl$$ = _.$addParamsToUrl$$module$src$url$$($response$jscomp$7_trackUrl$jscomp$inline_1240_viewer$jscomp$inline_1241$$, $clickUrl$$);
        $win$jscomp$103$$.history.replaceState(null, "", $clickUrl$$);
        $JSCompiler_StaticMethods_maybeUpdateFragmentForCct$$($viewer$jscomp$5$$);
      }
    }
  }).catch(function($win$jscomp$103$$) {
    _.$user$$module$src$log$$().$Log$$module$src$log_prototype$warn$("IMPRESSION", "Error on request clickUrl: ", $win$jscomp$103$$);
  });
};
$invoke$$module$src$impression$$ = function($win$jscomp$104$$, $clickUrl$jscomp$1$$) {
  return _.$JSCompiler_StaticMethods_fetchJson$$(_.$Services$$module$src$services$xhrFor$$($win$jscomp$104$$), $clickUrl$jscomp$1$$, {credentials:"include", requireAmpResponseSourceOrigin:!1}).then(function($win$jscomp$104$$) {
    return 204 == $win$jscomp$104$$.status ? null : $win$jscomp$104$$.json();
  });
};
$shouldAppendExtraParams$$module$src$impression$$ = function($ampdoc$jscomp$10$$) {
  return $ampdoc$jscomp$10$$.$whenReady$().then(function() {
    return !!$ampdoc$jscomp$10$$.$getBody$().querySelector("amp-analytics[type=googleanalytics]");
  });
};
$PullToRefreshBlocker$$module$src$pull_to_refresh$$ = function($doc$jscomp$23$$, $viewport$$) {
  this.$doc_$ = $doc$jscomp$23$$;
  this.$viewport_$ = $viewport$$;
  this.$D$ = !1;
  this.$F$ = 0;
  this.$K$ = this.$PullToRefreshBlocker$$module$src$pull_to_refresh_prototype$onTouchStart_$.bind(this);
  this.$J$ = this.$PullToRefreshBlocker$$module$src$pull_to_refresh_prototype$onTouchMove_$.bind(this);
  this.$I$ = this.$PullToRefreshBlocker$$module$src$pull_to_refresh_prototype$onTouchEnd_$.bind(this);
  this.$G$ = this.$PullToRefreshBlocker$$module$src$pull_to_refresh_prototype$onTouchCancel_$.bind(this);
  this.$doc_$.addEventListener("touchstart", this.$K$, !0);
};
$JSCompiler_StaticMethods_PullToRefreshBlocker$$module$src$pull_to_refresh_prototype$stopTracking_$$ = function($JSCompiler_StaticMethods_PullToRefreshBlocker$$module$src$pull_to_refresh_prototype$stopTracking_$self$$) {
  $JSCompiler_StaticMethods_PullToRefreshBlocker$$module$src$pull_to_refresh_prototype$stopTracking_$self$$.$D$ = !1;
  $JSCompiler_StaticMethods_PullToRefreshBlocker$$module$src$pull_to_refresh_prototype$stopTracking_$self$$.$F$ = 0;
  $JSCompiler_StaticMethods_PullToRefreshBlocker$$module$src$pull_to_refresh_prototype$stopTracking_$self$$.$doc_$.removeEventListener("touchmove", $JSCompiler_StaticMethods_PullToRefreshBlocker$$module$src$pull_to_refresh_prototype$stopTracking_$self$$.$J$, !0);
  $JSCompiler_StaticMethods_PullToRefreshBlocker$$module$src$pull_to_refresh_prototype$stopTracking_$self$$.$doc_$.removeEventListener("touchend", $JSCompiler_StaticMethods_PullToRefreshBlocker$$module$src$pull_to_refresh_prototype$stopTracking_$self$$.$I$, !0);
  $JSCompiler_StaticMethods_PullToRefreshBlocker$$module$src$pull_to_refresh_prototype$stopTracking_$self$$.$doc_$.removeEventListener("touchcancel", $JSCompiler_StaticMethods_PullToRefreshBlocker$$module$src$pull_to_refresh_prototype$stopTracking_$self$$.$G$, !0);
};
$PreconnectService$$module$src$preconnect$$ = function($win$jscomp$109$$) {
  this.$document_$ = $win$jscomp$109$$.document;
  this.$G$ = $win$jscomp$109$$.document.head;
  this.$D$ = {};
  this.$I$ = {};
  this.$platform_$ = _.$Services$$module$src$services$platformFor$$($win$jscomp$109$$);
  this.$D$[_.$parseUrlDeprecated$$module$src$url$$($win$jscomp$109$$.location.href).origin] = !0;
  a: {
    if (!$preconnectFeatures$$module$src$preconnect$$) {
      var $JSCompiler_inline_result$jscomp$454_linkTag$jscomp$inline_1251$$ = $win$jscomp$109$$.document.createElement("link");
      var $tokenList$jscomp$inline_1252$$ = $JSCompiler_inline_result$jscomp$454_linkTag$jscomp$inline_1251$$.relList;
      $JSCompiler_inline_result$jscomp$454_linkTag$jscomp$inline_1251$$.as = "invalid-value";
      if (!$tokenList$jscomp$inline_1252$$ || !$tokenList$jscomp$inline_1252$$.supports) {
        $JSCompiler_inline_result$jscomp$454_linkTag$jscomp$inline_1251$$ = {};
        break a;
      }
      $preconnectFeatures$$module$src$preconnect$$ = {$preconnect$:$tokenList$jscomp$inline_1252$$.supports("preconnect"), $preload$:$tokenList$jscomp$inline_1252$$.supports("preload"), $onlyValidAs$:"invalid-value" != $JSCompiler_inline_result$jscomp$454_linkTag$jscomp$inline_1251$$.as};
    }
    $JSCompiler_inline_result$jscomp$454_linkTag$jscomp$inline_1251$$ = $preconnectFeatures$$module$src$preconnect$$;
  }
  this.$F$ = $JSCompiler_inline_result$jscomp$454_linkTag$jscomp$inline_1251$$;
  this.$timer_$ = _.$Services$$module$src$services$timerFor$$($win$jscomp$109$$);
};
$JSCompiler_StaticMethods_preconnectPolyfill_$$ = function($JSCompiler_StaticMethods_preconnectPolyfill_$self_xhr$jscomp$5$$, $origin$jscomp$2$$) {
  if (!$JSCompiler_StaticMethods_preconnectPolyfill_$self_xhr$jscomp$5$$.$F$.$preconnect$ && (_.$JSCompiler_StaticMethods_isSafari$$($JSCompiler_StaticMethods_preconnectPolyfill_$self_xhr$jscomp$5$$.$platform_$) || _.$JSCompiler_StaticMethods_isIos$$($JSCompiler_StaticMethods_preconnectPolyfill_$self_xhr$jscomp$5$$.$platform_$))) {
    var $now$jscomp$1$$ = Date.now();
    $JSCompiler_StaticMethods_preconnectPolyfill_$self_xhr$jscomp$5$$.$D$[$origin$jscomp$2$$] = $now$jscomp$1$$ + 18E4;
    $JSCompiler_StaticMethods_preconnectPolyfill_$self_xhr$jscomp$5$$ = new window.XMLHttpRequest;
    $JSCompiler_StaticMethods_preconnectPolyfill_$self_xhr$jscomp$5$$.open("HEAD", $origin$jscomp$2$$ + "/amp_preconnect_polyfill_404_or_other_error_expected._Do_not_worry_about_it?" + ($now$jscomp$1$$ - $now$jscomp$1$$ % 18E4), !0);
    $JSCompiler_StaticMethods_preconnectPolyfill_$self_xhr$jscomp$5$$.withCredentials = !0;
    $JSCompiler_StaticMethods_preconnectPolyfill_$self_xhr$jscomp$5$$.send();
  }
};
$Preconnect$$module$src$preconnect$$ = function($preconnectService$$, $element$jscomp$73$$) {
  this.$D$ = $preconnectService$$;
  this.$element_$ = $element$jscomp$73$$;
  this.$viewer_$ = null;
};
$JSCompiler_StaticMethods_getViewer_$$ = function($JSCompiler_StaticMethods_getViewer_$self$$) {
  $JSCompiler_StaticMethods_getViewer_$self$$.$viewer_$ || ($JSCompiler_StaticMethods_getViewer_$self$$.$viewer_$ = _.$Services$$module$src$services$viewerForDoc$$($JSCompiler_StaticMethods_getViewer_$self$$.$element_$));
  return $JSCompiler_StaticMethods_getViewer_$self$$.$viewer_$;
};
_.$BaseElement$$module$src$base_element$$ = function($element$jscomp$75_element$jscomp$inline_1258$$) {
  this.element = $element$jscomp$75_element$jscomp$inline_1258$$;
  this.$layout_$ = "nodisplay";
  this.$layoutWidth_$ = -1;
  this.$inViewport_$ = !1;
  this.$win$ = $element$jscomp$75_element$jscomp$inline_1258$$.ownerDocument.defaultView;
  this.$defaultActionAlias_$ = this.$actionMap_$ = null;
  $element$jscomp$75_element$jscomp$inline_1258$$ = this.element;
  var $preconnectService$jscomp$inline_1260_serviceHolder$jscomp$inline_1259$$ = $element$jscomp$75_element$jscomp$inline_1258$$.ownerDocument.defaultView;
  _.$registerServiceBuilder$$module$src$service$$($preconnectService$jscomp$inline_1260_serviceHolder$jscomp$inline_1259$$, "preconnect", $PreconnectService$$module$src$preconnect$$);
  $preconnectService$jscomp$inline_1260_serviceHolder$jscomp$inline_1259$$ = _.$getService$$module$src$service$$($preconnectService$jscomp$inline_1260_serviceHolder$jscomp$inline_1259$$, "preconnect");
  this.$preconnect$ = new $Preconnect$$module$src$preconnect$$($preconnectService$jscomp$inline_1260_serviceHolder$jscomp$inline_1259$$, $element$jscomp$75_element$jscomp$inline_1258$$);
  this.config = null;
  this.$layoutScheduleTime$ = 0;
};
_.$JSCompiler_StaticMethods_getVsync$$ = function($JSCompiler_StaticMethods_getVsync$self$$) {
  return _.$Services$$module$src$services$vsyncFor$$($JSCompiler_StaticMethods_getVsync$self$$.$win$);
};
_.$JSCompiler_StaticMethods_initActionMap_$$ = function($JSCompiler_StaticMethods_initActionMap_$self$$) {
  $JSCompiler_StaticMethods_initActionMap_$self$$.$actionMap_$ || ($JSCompiler_StaticMethods_initActionMap_$self$$.$actionMap_$ = $JSCompiler_StaticMethods_initActionMap_$self$$.$win$.Object.create(null));
};
_.$JSCompiler_StaticMethods_propagateAttributes$$ = function($JSCompiler_StaticMethods_propagateAttributes$self$$, $attributes$jscomp$6$$, $element$jscomp$78$$, $opt_removeMissingAttrs$$) {
  $attributes$jscomp$6$$ = _.$isArray$$module$src$types$$($attributes$jscomp$6$$) ? $attributes$jscomp$6$$ : [$attributes$jscomp$6$$];
  for (var $i$jscomp$62$$ = 0; $i$jscomp$62$$ < $attributes$jscomp$6$$.length; $i$jscomp$62$$++) {
    var $attr$jscomp$5$$ = $attributes$jscomp$6$$[$i$jscomp$62$$];
    $JSCompiler_StaticMethods_propagateAttributes$self$$.element.hasAttribute($attr$jscomp$5$$) ? $element$jscomp$78$$.setAttribute($attr$jscomp$5$$, $JSCompiler_StaticMethods_propagateAttributes$self$$.element.getAttribute($attr$jscomp$5$$)) : $opt_removeMissingAttrs$$ && $element$jscomp$78$$.removeAttribute($attr$jscomp$5$$);
  }
};
_.$JSCompiler_StaticMethods_applyFillContent$$ = function($element$jscomp$80$$, $opt_replacedContent$$) {
  $element$jscomp$80$$.classList.add("i-amphtml-fill-content");
  $opt_replacedContent$$ && $element$jscomp$80$$.classList.add("i-amphtml-replaced-content");
};
$installGlobalSubmitListenerForDoc$$module$src$document_submit$$ = function($ampdoc$jscomp$11$$) {
  $isExtensionScriptInNode$$module$src$element_service$$($ampdoc$jscomp$11$$).then(function($ampFormInstalled$$) {
    $ampFormInstalled$$ && $ampdoc$jscomp$11$$.getRootNode().addEventListener("submit", $onDocumentFormSubmit_$$module$src$document_submit$$, !0);
  });
};
$onDocumentFormSubmit_$$module$src$document_submit$$ = function($e$jscomp$43$$) {
  if (!$e$jscomp$43$$.defaultPrevented) {
    var $form$jscomp$2$$ = $e$jscomp$43$$.target;
    if ($form$jscomp$2$$ && "FORM" == $form$jscomp$2$$.tagName) {
      ($form$jscomp$2$$.classList.contains("i-amphtml-form") ? $form$jscomp$2$$.hasAttribute("amp-novalidate") : $form$jscomp$2$$.hasAttribute("novalidate")) || !$form$jscomp$2$$.checkValidity || $form$jscomp$2$$.checkValidity() || $e$jscomp$43$$.preventDefault();
      for (var $action$jscomp$5_inputs$$ = $form$jscomp$2$$.elements, $actionXhr_i$jscomp$63$$ = 0; $actionXhr_i$jscomp$63$$ < $action$jscomp$5_inputs$$.length; $actionXhr_i$jscomp$63$$++) {
      }
      $action$jscomp$5_inputs$$ = $form$jscomp$2$$.getAttribute("action");
      $actionXhr_i$jscomp$63$$ = $form$jscomp$2$$.getAttribute("action-xhr");
      var $method$jscomp$5$$ = ($form$jscomp$2$$.getAttribute("method") || "GET").toUpperCase();
      $actionXhr_i$jscomp$63$$ && _.$checkCorsUrl$$module$src$url$$($actionXhr_i$jscomp$63$$);
      $action$jscomp$5_inputs$$ && _.$checkCorsUrl$$module$src$url$$($action$jscomp$5_inputs$$);
      "GET" != $method$jscomp$5$$ && "POST" == $method$jscomp$5$$ && ($action$jscomp$5_inputs$$ && _.$user$$module$src$log$$().error("form", "action attribute is invalid for method=POST: %s", $form$jscomp$2$$), $actionXhr_i$jscomp$63$$ || $e$jscomp$43$$.preventDefault());
      $form$jscomp$2$$.getAttribute("target") || $form$jscomp$2$$.setAttribute("target", "_top");
      $actionXhr_i$jscomp$63$$ && ($e$jscomp$43$$.preventDefault(), $e$jscomp$43$$.stopImmediatePropagation(), _.$Services$$module$src$services$actionServiceForDoc$$($form$jscomp$2$$).execute($form$jscomp$2$$, "submit", null, $form$jscomp$2$$, $form$jscomp$2$$, $e$jscomp$43$$, 100));
    }
  }
};
_.$Observable$$module$src$observable$$ = function() {
  this.$D$ = null;
};
$Input$$module$src$input$$ = function($win$jscomp$110$$) {
  this.$win$ = $win$jscomp$110$$;
  this.$boundOnKeyDown_$ = this.$onKeyDown_$.bind(this);
  this.$R$ = this.$Input$$module$src$input_prototype$onMouseDown_$.bind(this);
  this.$G$ = this.$K$ = this.$I$ = null;
  this.$F$ = "ontouchstart" in $win$jscomp$110$$ || void 0 !== $win$jscomp$110$$.navigator.maxTouchPoints && 0 < $win$jscomp$110$$.navigator.maxTouchPoints || void 0 !== $win$jscomp$110$$.DocumentTouch;
  "Input";
  this.$D$ = !1;
  this.$win$.document.addEventListener("keydown", this.$boundOnKeyDown_$);
  this.$win$.document.addEventListener("mousedown", this.$R$);
  this.$hasMouse_$ = !0;
  this.$O$ = 0;
  this.$U$ = new _.$Observable$$module$src$observable$$;
  this.$P$ = new _.$Observable$$module$src$observable$$;
  this.$J$ = new _.$Observable$$module$src$observable$$;
  this.$F$ && (this.$hasMouse_$ = !this.$F$, this.$I$ = this.$Input$$module$src$input_prototype$onMouseMove_$.bind(this), _.$listenOnce$$module$src$event_helper$$($win$jscomp$110$$.document, "mousemove", this.$I$));
};
$JSCompiler_StaticMethods_onTouchDetected$$ = function($JSCompiler_StaticMethods_onTouchDetected$self$$, $handler$jscomp$12$$) {
  $handler$jscomp$12$$($JSCompiler_StaticMethods_onTouchDetected$self$$.$F$);
  $JSCompiler_StaticMethods_onTouchDetected$self$$.$U$.add($handler$jscomp$12$$);
};
$JSCompiler_StaticMethods_onMouseDetected$$ = function($JSCompiler_StaticMethods_onMouseDetected$self$$, $handler$jscomp$13$$) {
  $handler$jscomp$13$$($JSCompiler_StaticMethods_onMouseDetected$self$$.$hasMouse_$);
  $JSCompiler_StaticMethods_onMouseDetected$self$$.$P$.add($handler$jscomp$13$$);
};
$JSCompiler_StaticMethods_onKeyboardStateChanged$$ = function($JSCompiler_StaticMethods_onKeyboardStateChanged$self$$, $handler$jscomp$14$$) {
  $handler$jscomp$14$$($JSCompiler_StaticMethods_onKeyboardStateChanged$self$$.$D$);
  $JSCompiler_StaticMethods_onKeyboardStateChanged$self$$.$J$.add($handler$jscomp$14$$);
};
_.$throttle$$module$src$utils$rate_limit$$ = function($win$jscomp$112$$, $callback$jscomp$64$$, $minInterval$$) {
  function $fire$$($fire$$) {
    $nextCallArgs$$ = null;
    $locker$$ = $win$jscomp$112$$.setTimeout($waiter$$, $minInterval$$);
    $callback$jscomp$64$$.apply(null, $fire$$);
  }
  function $waiter$$() {
    $locker$$ = 0;
    $nextCallArgs$$ && $fire$$($nextCallArgs$$);
  }
  var $locker$$ = 0, $nextCallArgs$$ = null;
  return function($win$jscomp$112$$) {
    for (var $callback$jscomp$64$$ = [], $minInterval$$ = 0; $minInterval$$ < arguments.length; ++$minInterval$$) {
      $callback$jscomp$64$$[$minInterval$$] = arguments[$minInterval$$];
    }
    $locker$$ ? $nextCallArgs$$ = $callback$jscomp$64$$ : $fire$$($callback$jscomp$64$$);
  };
};
_.$debounce$$module$src$utils$rate_limit$$ = function($win$jscomp$113$$, $callback$jscomp$65$$, $minInterval$jscomp$1$$) {
  function $waiter$jscomp$1$$() {
    $locker$jscomp$1$$ = 0;
    var $args$jscomp$inline_1275_remaining$$ = $minInterval$jscomp$1$$ - ($win$jscomp$113$$.Date.now() - $timestamp$$);
    0 < $args$jscomp$inline_1275_remaining$$ ? $locker$jscomp$1$$ = $win$jscomp$113$$.setTimeout($waiter$jscomp$1$$, $args$jscomp$inline_1275_remaining$$) : ($args$jscomp$inline_1275_remaining$$ = $nextCallArgs$jscomp$1$$, $nextCallArgs$jscomp$1$$ = null, $callback$jscomp$65$$.apply(null, $args$jscomp$inline_1275_remaining$$));
  }
  var $locker$jscomp$1$$ = 0, $timestamp$$ = 0, $nextCallArgs$jscomp$1$$ = null;
  return function($callback$jscomp$65$$) {
    for (var $args$jscomp$3$$ = [], $$jscomp$restIndex$jscomp$1$$ = 0; $$jscomp$restIndex$jscomp$1$$ < arguments.length; ++$$jscomp$restIndex$jscomp$1$$) {
      $args$jscomp$3$$[$$jscomp$restIndex$jscomp$1$$] = arguments[$$jscomp$restIndex$jscomp$1$$];
    }
    $timestamp$$ = $win$jscomp$113$$.Date.now();
    $nextCallArgs$jscomp$1$$ = $args$jscomp$3$$;
    $locker$jscomp$1$$ || ($locker$jscomp$1$$ = $win$jscomp$113$$.setTimeout($waiter$jscomp$1$$, $minInterval$jscomp$1$$));
  };
};
$ActionInvocation$$module$src$service$action_impl$$ = function($node$jscomp$29$$, $method$jscomp$6$$, $args$jscomp$4$$, $source$jscomp$14$$, $caller$$, $event$jscomp$10$$, $trust$$, $actionEventType$$, $tagOrTarget$$, $sequenceId$$) {
  $sequenceId$$ = void 0 === $sequenceId$$ ? Math.random() : $sequenceId$$;
  this.node = $node$jscomp$29$$;
  this.method = $method$jscomp$6$$;
  this.args = $args$jscomp$4$$;
  this.source = $source$jscomp$14$$;
  this.caller = $caller$$;
  this.event = $event$jscomp$10$$;
  this.$D$ = $trust$$;
  this.$F$ = void 0 === $actionEventType$$ ? "?" : $actionEventType$$;
  this.$tagOrTarget$ = (void 0 === $tagOrTarget$$ ? null : $tagOrTarget$$) || $node$jscomp$29$$.tagName;
  this.$G$ = $sequenceId$$;
};
_.$JSCompiler_StaticMethods_satisfiesTrust$$ = function($JSCompiler_StaticMethods_satisfiesTrust$self$$, $minimumTrust$$) {
  return _.$isFiniteNumber$$module$src$types$$($JSCompiler_StaticMethods_satisfiesTrust$self$$.$D$) ? $JSCompiler_StaticMethods_satisfiesTrust$self$$.$D$ < $minimumTrust$$ ? (_.$user$$module$src$log$$().error("Action", '"' + $JSCompiler_StaticMethods_satisfiesTrust$self$$.$F$ + '" is not allowed to invoke ' + ('"' + $JSCompiler_StaticMethods_satisfiesTrust$self$$.$tagOrTarget$ + "." + $JSCompiler_StaticMethods_satisfiesTrust$self$$.method + '".')), !1) : !0 : (_.$dev$$module$src$log$$().error("Action", 
  "Invalid trust for '" + $JSCompiler_StaticMethods_satisfiesTrust$self$$.method + "': " + $JSCompiler_StaticMethods_satisfiesTrust$self$$.$D$), !1);
};
$ActionService$$module$src$service$action_impl$$ = function($ampdoc$jscomp$12$$, $opt_root$$) {
  this.ampdoc = $ampdoc$jscomp$12$$;
  this.$D$ = $opt_root$$ || $ampdoc$jscomp$12$$.getRootNode();
  this.$F$ = $JSCompiler_StaticMethods_queryWhitelist_$$(this);
  this.$G$ = _.$map$$module$src$utils$object$$();
  this.$I$ = _.$map$$module$src$utils$object$$();
  $JSCompiler_StaticMethods_addEvent$$(this, "tap");
  $JSCompiler_StaticMethods_addEvent$$(this, "submit");
  $JSCompiler_StaticMethods_addEvent$$(this, "change");
  $JSCompiler_StaticMethods_addEvent$$(this, "input-debounced");
  $JSCompiler_StaticMethods_addEvent$$(this, "input-throttled");
  $JSCompiler_StaticMethods_addEvent$$(this, "valid");
  $JSCompiler_StaticMethods_addEvent$$(this, "invalid");
};
$JSCompiler_StaticMethods_addEvent$$ = function($JSCompiler_StaticMethods_addEvent$self$$, $name$jscomp$108$$) {
  if ("tap" == $name$jscomp$108$$) {
    $JSCompiler_StaticMethods_addEvent$self$$.$D$.addEventListener("click", function($debouncedInput$$) {
      $debouncedInput$$.defaultPrevented || $JSCompiler_StaticMethods_addEvent$self$$.$trigger$($debouncedInput$$.target, $name$jscomp$108$$, $debouncedInput$$, 100);
    }), $JSCompiler_StaticMethods_addEvent$self$$.$D$.addEventListener("keydown", function($debouncedInput$$) {
      var $throttledInput$$ = $debouncedInput$$.target, $event$jscomp$12$$ = $debouncedInput$$.key;
      if ("Enter" == $event$jscomp$12$$ || " " == $event$jscomp$12$$) {
        $event$jscomp$12$$ = ($event$jscomp$12$$ = $throttledInput$$.getAttribute("role")) && _.$hasOwn$$module$src$utils$object$$(_.$TAPPABLE_ARIA_ROLES$$module$src$service$action_impl$$, $event$jscomp$12$$.toLowerCase()), !$debouncedInput$$.defaultPrevented && $event$jscomp$12$$ && ($debouncedInput$$.preventDefault(), $JSCompiler_StaticMethods_addEvent$self$$.$trigger$($throttledInput$$, $name$jscomp$108$$, $debouncedInput$$, 100));
      }
    });
  } else {
    if ("submit" == $name$jscomp$108$$) {
      $JSCompiler_StaticMethods_addEvent$self$$.$D$.addEventListener($name$jscomp$108$$, function($debouncedInput$$) {
        $JSCompiler_StaticMethods_addEvent$self$$.$trigger$($debouncedInput$$.target, $name$jscomp$108$$, $debouncedInput$$, 100);
      });
    } else {
      if ("change" == $name$jscomp$108$$) {
        $JSCompiler_StaticMethods_addEvent$self$$.$D$.addEventListener($name$jscomp$108$$, function($debouncedInput$$) {
          var $throttledInput$$ = $debouncedInput$$.target;
          $JSCompiler_StaticMethods_addTargetPropertiesAsDetail_$$($debouncedInput$$);
          $JSCompiler_StaticMethods_addEvent$self$$.$trigger$($throttledInput$$, $name$jscomp$108$$, $debouncedInput$$, 100);
        });
      } else {
        if ("input-debounced" == $name$jscomp$108$$) {
          var $debouncedInput$$ = _.$debounce$$module$src$utils$rate_limit$$($JSCompiler_StaticMethods_addEvent$self$$.ampdoc.$win$, function($debouncedInput$$) {
            $JSCompiler_StaticMethods_addEvent$self$$.$trigger$($debouncedInput$$.target, $name$jscomp$108$$, $debouncedInput$$, 100);
          }, 300);
          $JSCompiler_StaticMethods_addEvent$self$$.$D$.addEventListener("input", function($JSCompiler_StaticMethods_addEvent$self$$) {
            $JSCompiler_StaticMethods_addEvent$self$$ = new $DeferredEvent$$module$src$service$action_impl$$($JSCompiler_StaticMethods_addEvent$self$$);
            $JSCompiler_StaticMethods_addTargetPropertiesAsDetail_$$($JSCompiler_StaticMethods_addEvent$self$$);
            $debouncedInput$$($JSCompiler_StaticMethods_addEvent$self$$);
          });
        } else {
          if ("input-throttled" == $name$jscomp$108$$) {
            var $throttledInput$$ = _.$throttle$$module$src$utils$rate_limit$$($JSCompiler_StaticMethods_addEvent$self$$.ampdoc.$win$, function($debouncedInput$$) {
              $JSCompiler_StaticMethods_addEvent$self$$.$trigger$($debouncedInput$$.target, $name$jscomp$108$$, $debouncedInput$$, 100);
            }, 100);
            $JSCompiler_StaticMethods_addEvent$self$$.$D$.addEventListener("input", function($JSCompiler_StaticMethods_addEvent$self$$) {
              $JSCompiler_StaticMethods_addEvent$self$$ = new $DeferredEvent$$module$src$service$action_impl$$($JSCompiler_StaticMethods_addEvent$self$$);
              $JSCompiler_StaticMethods_addTargetPropertiesAsDetail_$$($JSCompiler_StaticMethods_addEvent$self$$);
              $throttledInput$$($JSCompiler_StaticMethods_addEvent$self$$);
            });
          } else {
            "valid" != $name$jscomp$108$$ && "invalid" != $name$jscomp$108$$ || $JSCompiler_StaticMethods_addEvent$self$$.$D$.addEventListener($name$jscomp$108$$, function($debouncedInput$$) {
              $JSCompiler_StaticMethods_addEvent$self$$.$trigger$($debouncedInput$$.target, $name$jscomp$108$$, $debouncedInput$$, 100);
            });
          }
        }
      }
    }
  }
};
$JSCompiler_StaticMethods_addGlobalMethodHandler$$ = function($JSCompiler_StaticMethods_addGlobalMethodHandler$self$$, $name$jscomp$110$$, $handler$jscomp$16$$) {
  $JSCompiler_StaticMethods_addGlobalMethodHandler$self$$.$I$[$name$jscomp$110$$] = {$handler$:$handler$jscomp$16$$, $minTrust$:100};
};
$JSCompiler_StaticMethods_invoke_$$ = function($JSCompiler_StaticMethods_invoke_$self_holder$jscomp$12$$, $invocation$jscomp$4$$) {
  var $handler$jscomp$18_method$jscomp$9$$ = $invocation$jscomp$4$$.method, $tagOrTarget$jscomp$2$$ = $invocation$jscomp$4$$.$tagOrTarget$;
  if ($JSCompiler_StaticMethods_invoke_$self_holder$jscomp$12$$.$F$ && !$isActionWhitelisted_$$module$src$service$action_impl$$($invocation$jscomp$4$$, $JSCompiler_StaticMethods_invoke_$self_holder$jscomp$12$$.$F$)) {
    return $JSCompiler_StaticMethods_invoke_$self_holder$jscomp$12$$.$error_$('"' + $tagOrTarget$jscomp$2$$ + "." + $handler$jscomp$18_method$jscomp$9$$ + '" is not whitelisted ' + JSON.stringify($JSCompiler_StaticMethods_invoke_$self_holder$jscomp$12$$.$F$) + "."), null;
  }
  var $globalTarget_node$jscomp$31$$ = $JSCompiler_StaticMethods_invoke_$self_holder$jscomp$12$$.$G$[$tagOrTarget$jscomp$2$$];
  if ($globalTarget_node$jscomp$31$$) {
    return $globalTarget_node$jscomp$31$$($invocation$jscomp$4$$);
  }
  $globalTarget_node$jscomp$31$$ = $invocation$jscomp$4$$.node;
  var $globalMethod_lowerTagName_supportedActions$$ = $JSCompiler_StaticMethods_invoke_$self_holder$jscomp$12$$.$I$[$handler$jscomp$18_method$jscomp$9$$];
  if ($globalMethod_lowerTagName_supportedActions$$ && _.$JSCompiler_StaticMethods_satisfiesTrust$$($invocation$jscomp$4$$, $globalMethod_lowerTagName_supportedActions$$.$minTrust$)) {
    return $globalMethod_lowerTagName_supportedActions$$.$handler$($invocation$jscomp$4$$);
  }
  $globalMethod_lowerTagName_supportedActions$$ = $globalTarget_node$jscomp$31$$.tagName.toLowerCase();
  if ("amp-" == $globalMethod_lowerTagName_supportedActions$$.substring(0, 4)) {
    return $globalTarget_node$jscomp$31$$.$Ga$ ? $globalTarget_node$jscomp$31$$.$Ga$($invocation$jscomp$4$$) : $JSCompiler_StaticMethods_invoke_$self_holder$jscomp$12$$.$error_$('Unrecognized AMP element "' + $globalMethod_lowerTagName_supportedActions$$ + '".', $globalTarget_node$jscomp$31$$), null;
  }
  $globalMethod_lowerTagName_supportedActions$$ = $ELEMENTS_ACTIONS_MAP_$$module$src$service$action_impl$$[$globalMethod_lowerTagName_supportedActions$$];
  var $targetId$jscomp$1$$ = $globalTarget_node$jscomp$31$$.getAttribute("id") || "";
  if ($targetId$jscomp$1$$ && "amp-" == $targetId$jscomp$1$$.substring(0, 4) || $globalMethod_lowerTagName_supportedActions$$ && -1 < $globalMethod_lowerTagName_supportedActions$$.indexOf($handler$jscomp$18_method$jscomp$9$$)) {
    return ($JSCompiler_StaticMethods_invoke_$self_holder$jscomp$12$$ = $globalTarget_node$jscomp$31$$.__AMP_ACTION_HANDLER__) ? ($handler$jscomp$18_method$jscomp$9$$ = $JSCompiler_StaticMethods_invoke_$self_holder$jscomp$12$$.$handler$, _.$JSCompiler_StaticMethods_satisfiesTrust$$($invocation$jscomp$4$$, $JSCompiler_StaticMethods_invoke_$self_holder$jscomp$12$$.$minTrust$) && $handler$jscomp$18_method$jscomp$9$$($invocation$jscomp$4$$)) : ($globalTarget_node$jscomp$31$$.__AMP_ACTION_QUEUE__ = $globalTarget_node$jscomp$31$$.__AMP_ACTION_QUEUE__ || 
    [], $globalTarget_node$jscomp$31$$.__AMP_ACTION_QUEUE__.push($invocation$jscomp$4$$)), null;
  }
  $JSCompiler_StaticMethods_invoke_$self_holder$jscomp$12$$.$error_$("Target (" + $tagOrTarget$jscomp$2$$ + ") doesn't support \"" + $handler$jscomp$18_method$jscomp$9$$ + '" action.', $invocation$jscomp$4$$.caller);
  return null;
};
_.$JSCompiler_StaticMethods_findAction_$$ = function($n$jscomp$9_target$jscomp$76$$, $actionEventType$jscomp$3$$, $opt_stopAt$jscomp$2$$) {
  for (; $n$jscomp$9_target$jscomp$76$$ && (!$opt_stopAt$jscomp$2$$ || $n$jscomp$9_target$jscomp$76$$ != $opt_stopAt$jscomp$2$$);) {
    var $actionEventType$jscomp$inline_1279_actionInfos$$ = $actionEventType$jscomp$3$$;
    var $actionMap$jscomp$inline_1280_node$jscomp$inline_5705$$ = $n$jscomp$9_target$jscomp$76$$;
    var $actionMap$jscomp$inline_5706_tok$jscomp$inline_5712$$ = $actionMap$jscomp$inline_1280_node$jscomp$inline_5705$$[_.$ACTION_MAP_$$module$src$service$action_impl$$];
    if (void 0 === $actionMap$jscomp$inline_5706_tok$jscomp$inline_5712$$) {
      $actionMap$jscomp$inline_5706_tok$jscomp$inline_5712$$ = null;
      if ($actionMap$jscomp$inline_1280_node$jscomp$inline_5705$$.hasAttribute("on")) {
        var $s$jscomp$inline_5707$$ = $actionMap$jscomp$inline_1280_node$jscomp$inline_5705$$.getAttribute("on"), $assertAction$jscomp$inline_5708$$ = $assertActionForParser$$module$src$service$action_impl$$.bind(null, $s$jscomp$inline_5707$$, $actionMap$jscomp$inline_1280_node$jscomp$inline_5705$$), $assertToken$jscomp$inline_5709$$ = $assertTokenForParser$$module$src$service$action_impl$$.bind(null, $s$jscomp$inline_5707$$, $actionMap$jscomp$inline_1280_node$jscomp$inline_5705$$), $actionMap$jscomp$inline_5710$$ = 
        null, $toks$jscomp$inline_5711$$ = new $ParserTokenizer$$module$src$service$action_impl$$($s$jscomp$inline_5707$$);
        do {
          if ($actionMap$jscomp$inline_5706_tok$jscomp$inline_5712$$ = $toks$jscomp$inline_5711$$.next(), $actionMap$jscomp$inline_5706_tok$jscomp$inline_5712$$.type != $TokenType$$module$src$service$action_impl$EOF$$ && ($actionMap$jscomp$inline_5706_tok$jscomp$inline_5712$$.type != $TokenType$$module$src$service$action_impl$SEPARATOR$$ || ";" != $actionMap$jscomp$inline_5706_tok$jscomp$inline_5712$$.value)) {
            if ($actionMap$jscomp$inline_5706_tok$jscomp$inline_5712$$.type == $TokenType$$module$src$service$action_impl$LITERAL$$ || $actionMap$jscomp$inline_5706_tok$jscomp$inline_5712$$.type == $TokenType$$module$src$service$action_impl$ID$$) {
              var $event$jscomp$inline_5714$$ = $actionMap$jscomp$inline_5706_tok$jscomp$inline_5712$$.value;
              $assertToken$jscomp$inline_5709$$($toks$jscomp$inline_5711$$.next(), [$TokenType$$module$src$service$action_impl$SEPARATOR$$], ":");
              var $actions$jscomp$inline_5715$$ = [];
              do {
                var $target$jscomp$inline_5716$$ = $assertToken$jscomp$inline_5709$$($toks$jscomp$inline_5711$$.next(), [$TokenType$$module$src$service$action_impl$LITERAL$$, $TokenType$$module$src$service$action_impl$ID$$]).value, $method$jscomp$inline_5717$$ = "activate", $args$jscomp$inline_5718_assertToken$jscomp$inline_6690$$ = null;
                var $peek$jscomp$inline_5713_toks$jscomp$inline_6689$$ = $JSCompiler_StaticMethods_ParserTokenizer$$module$src$service$action_impl_prototype$next_$$($toks$jscomp$inline_5711$$, !1);
                if ($peek$jscomp$inline_5713_toks$jscomp$inline_6689$$.type == $TokenType$$module$src$service$action_impl$SEPARATOR$$ && "." == $peek$jscomp$inline_5713_toks$jscomp$inline_6689$$.value && ($toks$jscomp$inline_5711$$.next(), $method$jscomp$inline_5717$$ = $assertToken$jscomp$inline_5709$$($toks$jscomp$inline_5711$$.next(), [$TokenType$$module$src$service$action_impl$LITERAL$$, $TokenType$$module$src$service$action_impl$ID$$]).value || $method$jscomp$inline_5717$$, $peek$jscomp$inline_5713_toks$jscomp$inline_6689$$ = 
                $JSCompiler_StaticMethods_ParserTokenizer$$module$src$service$action_impl_prototype$next_$$($toks$jscomp$inline_5711$$, !1), $peek$jscomp$inline_5713_toks$jscomp$inline_6689$$.type == $TokenType$$module$src$service$action_impl$SEPARATOR$$ && "(" == $peek$jscomp$inline_5713_toks$jscomp$inline_6689$$.value)) {
                  $toks$jscomp$inline_5711$$.next();
                  $peek$jscomp$inline_5713_toks$jscomp$inline_6689$$ = $toks$jscomp$inline_5711$$;
                  $args$jscomp$inline_5718_assertToken$jscomp$inline_6690$$ = $assertToken$jscomp$inline_5709$$;
                  var $assertAction$jscomp$inline_6691$$ = $assertAction$jscomp$inline_5708$$, $argValue$jscomp$inline_6700_peek$jscomp$inline_6692_type$jscomp$inline_6697$$ = $JSCompiler_StaticMethods_ParserTokenizer$$module$src$service$action_impl_prototype$next_$$($peek$jscomp$inline_5713_toks$jscomp$inline_6689$$, !1), $args$jscomp$inline_6694$$ = null;
                  if ($argValue$jscomp$inline_6700_peek$jscomp$inline_6692_type$jscomp$inline_6697$$.type == $TokenType$$module$src$service$action_impl$OBJECT$$) {
                    $args$jscomp$inline_6694$$ = _.$map$$module$src$utils$object$$();
                    var $tok$jscomp$inline_6693_value$jscomp$inline_6695$$ = $peek$jscomp$inline_5713_toks$jscomp$inline_6689$$.next().value;
                    $args$jscomp$inline_6694$$.__AMP_OBJECT_STRING__ = $tok$jscomp$inline_6693_value$jscomp$inline_6695$$;
                    $args$jscomp$inline_5718_assertToken$jscomp$inline_6690$$($peek$jscomp$inline_5713_toks$jscomp$inline_6689$$.next(), [$TokenType$$module$src$service$action_impl$SEPARATOR$$], ")");
                  } else {
                    do {
                      var $$jscomp$inline_6696_value$132$jscomp$inline_6698$$ = $tok$jscomp$inline_6693_value$jscomp$inline_6695$$ = $peek$jscomp$inline_5713_toks$jscomp$inline_6689$$.next();
                      $argValue$jscomp$inline_6700_peek$jscomp$inline_6692_type$jscomp$inline_6697$$ = $$jscomp$inline_6696_value$132$jscomp$inline_6698$$.type;
                      $$jscomp$inline_6696_value$132$jscomp$inline_6698$$ = $$jscomp$inline_6696_value$132$jscomp$inline_6698$$.value;
                      if ($argValue$jscomp$inline_6700_peek$jscomp$inline_6692_type$jscomp$inline_6697$$ != $TokenType$$module$src$service$action_impl$SEPARATOR$$ || "," != $$jscomp$inline_6696_value$132$jscomp$inline_6698$$ && ")" != $$jscomp$inline_6696_value$132$jscomp$inline_6698$$) {
                        if ($argValue$jscomp$inline_6700_peek$jscomp$inline_6692_type$jscomp$inline_6697$$ == $TokenType$$module$src$service$action_impl$LITERAL$$ || $argValue$jscomp$inline_6700_peek$jscomp$inline_6692_type$jscomp$inline_6697$$ == $TokenType$$module$src$service$action_impl$ID$$) {
                          $args$jscomp$inline_5718_assertToken$jscomp$inline_6690$$($peek$jscomp$inline_5713_toks$jscomp$inline_6689$$.next(), [$TokenType$$module$src$service$action_impl$SEPARATOR$$], "=");
                          $tok$jscomp$inline_6693_value$jscomp$inline_6695$$ = $args$jscomp$inline_5718_assertToken$jscomp$inline_6690$$($peek$jscomp$inline_5713_toks$jscomp$inline_6689$$.next(!0), [$TokenType$$module$src$service$action_impl$LITERAL$$, $TokenType$$module$src$service$action_impl$ID$$]);
                          var $argValueTokens$jscomp$inline_6699$$ = [$tok$jscomp$inline_6693_value$jscomp$inline_6695$$];
                          if ($tok$jscomp$inline_6693_value$jscomp$inline_6695$$.type == $TokenType$$module$src$service$action_impl$ID$$) {
                            for ($argValue$jscomp$inline_6700_peek$jscomp$inline_6692_type$jscomp$inline_6697$$ = $JSCompiler_StaticMethods_ParserTokenizer$$module$src$service$action_impl_prototype$next_$$($peek$jscomp$inline_5713_toks$jscomp$inline_6689$$, !1); $argValue$jscomp$inline_6700_peek$jscomp$inline_6692_type$jscomp$inline_6697$$.type == $TokenType$$module$src$service$action_impl$SEPARATOR$$ && "." == $argValue$jscomp$inline_6700_peek$jscomp$inline_6692_type$jscomp$inline_6697$$.value; $argValue$jscomp$inline_6700_peek$jscomp$inline_6692_type$jscomp$inline_6697$$ = 
                            $JSCompiler_StaticMethods_ParserTokenizer$$module$src$service$action_impl_prototype$next_$$($peek$jscomp$inline_5713_toks$jscomp$inline_6689$$, !1)) {
                              $peek$jscomp$inline_5713_toks$jscomp$inline_6689$$.next(), $tok$jscomp$inline_6693_value$jscomp$inline_6695$$ = $args$jscomp$inline_5718_assertToken$jscomp$inline_6690$$($peek$jscomp$inline_5713_toks$jscomp$inline_6689$$.next(!1), [$TokenType$$module$src$service$action_impl$ID$$]), $argValueTokens$jscomp$inline_6699$$.push($tok$jscomp$inline_6693_value$jscomp$inline_6695$$);
                            }
                          }
                          $argValue$jscomp$inline_6700_peek$jscomp$inline_6692_type$jscomp$inline_6697$$ = $argValueForTokens$$module$src$service$action_impl$$($argValueTokens$jscomp$inline_6699$$);
                          $args$jscomp$inline_6694$$ || ($args$jscomp$inline_6694$$ = _.$map$$module$src$utils$object$$());
                          $args$jscomp$inline_6694$$[$$jscomp$inline_6696_value$132$jscomp$inline_6698$$] = $argValue$jscomp$inline_6700_peek$jscomp$inline_6692_type$jscomp$inline_6697$$;
                          $argValue$jscomp$inline_6700_peek$jscomp$inline_6692_type$jscomp$inline_6697$$ = $JSCompiler_StaticMethods_ParserTokenizer$$module$src$service$action_impl_prototype$next_$$($peek$jscomp$inline_5713_toks$jscomp$inline_6689$$, !1);
                          $assertAction$jscomp$inline_6691$$($argValue$jscomp$inline_6700_peek$jscomp$inline_6692_type$jscomp$inline_6697$$.type == $TokenType$$module$src$service$action_impl$SEPARATOR$$ && ("," == $argValue$jscomp$inline_6700_peek$jscomp$inline_6692_type$jscomp$inline_6697$$.value || ")" == $argValue$jscomp$inline_6700_peek$jscomp$inline_6692_type$jscomp$inline_6697$$.value), "Expected either [,] or [)]");
                        } else {
                          $assertAction$jscomp$inline_6691$$(!1, "; unexpected token [" + ($tok$jscomp$inline_6693_value$jscomp$inline_6695$$.value || "") + "]");
                        }
                      }
                    } while ($tok$jscomp$inline_6693_value$jscomp$inline_6695$$.type != $TokenType$$module$src$service$action_impl$SEPARATOR$$ || ")" != $tok$jscomp$inline_6693_value$jscomp$inline_6695$$.value);
                  }
                  $args$jscomp$inline_5718_assertToken$jscomp$inline_6690$$ = $args$jscomp$inline_6694$$;
                }
                $actions$jscomp$inline_5715$$.push({event:$event$jscomp$inline_5714$$, target:$target$jscomp$inline_5716$$, method:$method$jscomp$inline_5717$$, args:$args$jscomp$inline_5718_assertToken$jscomp$inline_6690$$, $str$:$s$jscomp$inline_5707$$});
                $peek$jscomp$inline_5713_toks$jscomp$inline_6689$$ = $JSCompiler_StaticMethods_ParserTokenizer$$module$src$service$action_impl_prototype$next_$$($toks$jscomp$inline_5711$$, !1);
              } while ($peek$jscomp$inline_5713_toks$jscomp$inline_6689$$.type == $TokenType$$module$src$service$action_impl$SEPARATOR$$ && "," == $peek$jscomp$inline_5713_toks$jscomp$inline_6689$$.value && $toks$jscomp$inline_5711$$.next());
              $actionMap$jscomp$inline_5710$$ || ($actionMap$jscomp$inline_5710$$ = _.$map$$module$src$utils$object$$());
              $actionMap$jscomp$inline_5710$$[$event$jscomp$inline_5714$$] = $actions$jscomp$inline_5715$$;
            } else {
              $assertAction$jscomp$inline_5708$$(!1, "; unexpected token [" + ($actionMap$jscomp$inline_5706_tok$jscomp$inline_5712$$.value || "") + "]");
            }
          }
        } while ($actionMap$jscomp$inline_5706_tok$jscomp$inline_5712$$.type != $TokenType$$module$src$service$action_impl$EOF$$);
        $actionMap$jscomp$inline_5706_tok$jscomp$inline_5712$$ = $actionMap$jscomp$inline_5710$$;
      }
      $actionMap$jscomp$inline_1280_node$jscomp$inline_5705$$[_.$ACTION_MAP_$$module$src$service$action_impl$$] = $actionMap$jscomp$inline_5706_tok$jscomp$inline_5712$$;
    }
    if (($actionEventType$jscomp$inline_1279_actionInfos$$ = ($actionMap$jscomp$inline_1280_node$jscomp$inline_5705$$ = $actionMap$jscomp$inline_5706_tok$jscomp$inline_5712$$) ? $actionMap$jscomp$inline_1280_node$jscomp$inline_5705$$[$actionEventType$jscomp$inline_1279_actionInfos$$] || null : null) && !$n$jscomp$9_target$jscomp$76$$.disabled && !_.$matches$$module$src$dom$$($n$jscomp$9_target$jscomp$76$$, ":disabled")) {
      return {node:$n$jscomp$9_target$jscomp$76$$, $actionInfos$:$actionEventType$jscomp$inline_1279_actionInfos$$};
    }
    $n$jscomp$9_target$jscomp$76$$ = $n$jscomp$9_target$jscomp$76$$.parentElement;
  }
  return null;
};
$JSCompiler_StaticMethods_queryWhitelist_$$ = function($JSCompiler_StaticMethods_queryWhitelist_$self$$) {
  var $head$jscomp$3_meta$jscomp$1$$ = $JSCompiler_StaticMethods_queryWhitelist_$self$$.ampdoc.getRootNode().head;
  return $head$jscomp$3_meta$jscomp$1$$ ? ($head$jscomp$3_meta$jscomp$1$$ = $head$jscomp$3_meta$jscomp$1$$.querySelector('meta[name="amp-action-whitelist"]')) ? $head$jscomp$3_meta$jscomp$1$$.getAttribute("content").split(",").filter(function($JSCompiler_StaticMethods_queryWhitelist_$self$$) {
    return $JSCompiler_StaticMethods_queryWhitelist_$self$$;
  }).map(function($head$jscomp$3_meta$jscomp$1$$) {
    var $action$jscomp$8$$ = $head$jscomp$3_meta$jscomp$1$$.split(".");
    if (2 > $action$jscomp$8$$.length) {
      $JSCompiler_StaticMethods_queryWhitelist_$self$$.$error_$("Invalid action whitelist entry: " + $head$jscomp$3_meta$jscomp$1$$ + ".");
    } else {
      return {$tagOrTarget$:$action$jscomp$8$$[0].trim(), method:$action$jscomp$8$$[1].trim()};
    }
  }).filter(function($JSCompiler_StaticMethods_queryWhitelist_$self$$) {
    return $JSCompiler_StaticMethods_queryWhitelist_$self$$;
  }) : null : null;
};
$JSCompiler_StaticMethods_addTargetPropertiesAsDetail_$$ = function($event$jscomp$23$$) {
  var $detail$jscomp$4$$ = _.$map$$module$src$utils$object$$(), $target$jscomp$77$$ = $event$jscomp$23$$.target;
  void 0 !== $target$jscomp$77$$.value && ($detail$jscomp$4$$.value = $target$jscomp$77$$.value);
  "INPUT" == $target$jscomp$77$$.tagName && ($detail$jscomp$4$$.valueAsNumber = Number($target$jscomp$77$$.value));
  void 0 !== $target$jscomp$77$$.checked && ($detail$jscomp$4$$.checked = $target$jscomp$77$$.checked);
  if (void 0 !== $target$jscomp$77$$.min || void 0 !== $target$jscomp$77$$.max) {
    $detail$jscomp$4$$.min = $target$jscomp$77$$.min, $detail$jscomp$4$$.max = $target$jscomp$77$$.max;
  }
  0 < Object.keys($detail$jscomp$4$$).length && ($event$jscomp$23$$.detail = $detail$jscomp$4$$);
};
$isActionWhitelisted_$$module$src$service$action_impl$$ = function($invocation$jscomp$5_tagOrTarget$jscomp$4$$, $whitelist$jscomp$1$$) {
  var $method$jscomp$11$$ = $invocation$jscomp$5_tagOrTarget$jscomp$4$$.method, $node$jscomp$35$$ = $invocation$jscomp$5_tagOrTarget$jscomp$4$$.node;
  $invocation$jscomp$5_tagOrTarget$jscomp$4$$ = $invocation$jscomp$5_tagOrTarget$jscomp$4$$.$tagOrTarget$;
  "activate" === $method$jscomp$11$$ && "function" == typeof $node$jscomp$35$$.$getDefaultActionAlias$ && ($method$jscomp$11$$ = $node$jscomp$35$$.$getDefaultActionAlias$());
  var $lcMethod$$ = $method$jscomp$11$$.toLowerCase(), $lcTagOrTarget$$ = $invocation$jscomp$5_tagOrTarget$jscomp$4$$.toLowerCase();
  return $whitelist$jscomp$1$$.some(function($invocation$jscomp$5_tagOrTarget$jscomp$4$$) {
    return $invocation$jscomp$5_tagOrTarget$jscomp$4$$.$tagOrTarget$.toLowerCase() !== $lcTagOrTarget$$ && "*" !== $invocation$jscomp$5_tagOrTarget$jscomp$4$$.$tagOrTarget$ || $invocation$jscomp$5_tagOrTarget$jscomp$4$$.method.toLowerCase() !== $lcMethod$$ ? !1 : !0;
  });
};
$DeferredEvent$$module$src$service$action_impl$$ = function($event$jscomp$24$$) {
  this.detail = null;
  var $clone$jscomp$inline_1298$$ = this || _.$map$$module$src$utils$object$$(), $prop$jscomp$inline_1299$$;
  for ($prop$jscomp$inline_1299$$ in $event$jscomp$24$$) {
    $clone$jscomp$inline_1298$$[$prop$jscomp$inline_1299$$] = "function" === typeof $event$jscomp$24$$[$prop$jscomp$inline_1299$$] ? $notImplemented$$module$src$service$action_impl$$ : $event$jscomp$24$$[$prop$jscomp$inline_1299$$];
  }
};
$notImplemented$$module$src$service$action_impl$$ = function() {
};
$argValueForTokens$$module$src$service$action_impl$$ = function($tokens$jscomp$1$$) {
  return 0 == $tokens$jscomp$1$$.length ? null : 1 == $tokens$jscomp$1$$.length ? $tokens$jscomp$1$$[0].value : {$expression$:$tokens$jscomp$1$$.map(function($tokens$jscomp$1$$) {
    return $tokens$jscomp$1$$.value;
  }).join(".")};
};
$dereferenceExprsInArgs$$module$src$service$action_impl$$ = function($args$jscomp$9$$, $event$jscomp$26$$) {
  if (!$args$jscomp$9$$) {
    return $args$jscomp$9$$;
  }
  var $data$jscomp$40$$ = {};
  $event$jscomp$26$$ && $event$jscomp$26$$.detail && ($data$jscomp$40$$.event = $event$jscomp$26$$.detail);
  var $applied$$ = _.$map$$module$src$utils$object$$();
  Object.keys($args$jscomp$9$$).forEach(function($event$jscomp$26$$) {
    var $key$jscomp$56$$ = $args$jscomp$9$$[$event$jscomp$26$$];
    "object" == typeof $key$jscomp$56$$ && $key$jscomp$56$$.$expression$ && ($key$jscomp$56$$ = _.$getValueForExpr$$module$src$json$$($data$jscomp$40$$, $key$jscomp$56$$.$expression$), $key$jscomp$56$$ = void 0 === $key$jscomp$56$$ ? null : $key$jscomp$56$$);
    $applied$$[$event$jscomp$26$$] = $key$jscomp$56$$;
  });
  return $applied$$;
};
$assertActionForParser$$module$src$service$action_impl$$ = function($s$jscomp$14$$, $context$jscomp$3$$, $condition$jscomp$1$$) {
  return $condition$jscomp$1$$;
};
$assertTokenForParser$$module$src$service$action_impl$$ = function($s$jscomp$15$$, $context$jscomp$4$$, $tok$jscomp$2$$, $types$jscomp$1$$) {
  $types$jscomp$1$$.includes($tok$jscomp$2$$.type);
  return $tok$jscomp$2$$;
};
$ParserTokenizer$$module$src$service$action_impl$$ = function($str$jscomp$8$$) {
  this.$D$ = $str$jscomp$8$$;
  this.$F$ = -1;
};
$JSCompiler_StaticMethods_ParserTokenizer$$module$src$service$action_impl_prototype$next_$$ = function($JSCompiler_StaticMethods_ParserTokenizer$$module$src$service$action_impl_prototype$next_$self_s$jscomp$16$$, $convertValues_end$135_hasFraction_numberOfBraces$$) {
  var $newIndex_s$134$$ = $JSCompiler_StaticMethods_ParserTokenizer$$module$src$service$action_impl_prototype$next_$self_s$jscomp$16$$.$F$ + 1;
  if ($newIndex_s$134$$ >= $JSCompiler_StaticMethods_ParserTokenizer$$module$src$service$action_impl_prototype$next_$self_s$jscomp$16$$.$D$.length) {
    return {type:$TokenType$$module$src$service$action_impl$EOF$$, index:$JSCompiler_StaticMethods_ParserTokenizer$$module$src$service$action_impl_prototype$next_$self_s$jscomp$16$$.$F$};
  }
  var $c$jscomp$1_end$133_end$137_end$jscomp$4$$ = $JSCompiler_StaticMethods_ParserTokenizer$$module$src$service$action_impl_prototype$next_$self_s$jscomp$16$$.$D$.charAt($newIndex_s$134$$);
  if (-1 != " \t\n\r\f\v\u00a0\u2028\u2029".indexOf($c$jscomp$1_end$133_end$137_end$jscomp$4$$)) {
    for ($newIndex_s$134$$++; $newIndex_s$134$$ < $JSCompiler_StaticMethods_ParserTokenizer$$module$src$service$action_impl_prototype$next_$self_s$jscomp$16$$.$D$.length && -1 != " \t\n\r\f\v\u00a0\u2028\u2029".indexOf($JSCompiler_StaticMethods_ParserTokenizer$$module$src$service$action_impl_prototype$next_$self_s$jscomp$16$$.$D$.charAt($newIndex_s$134$$)); $newIndex_s$134$$++) {
    }
    if ($newIndex_s$134$$ >= $JSCompiler_StaticMethods_ParserTokenizer$$module$src$service$action_impl_prototype$next_$self_s$jscomp$16$$.$D$.length) {
      return {type:$TokenType$$module$src$service$action_impl$EOF$$, index:$newIndex_s$134$$};
    }
    $c$jscomp$1_end$133_end$137_end$jscomp$4$$ = $JSCompiler_StaticMethods_ParserTokenizer$$module$src$service$action_impl_prototype$next_$self_s$jscomp$16$$.$D$.charAt($newIndex_s$134$$);
  }
  if ($convertValues_end$135_hasFraction_numberOfBraces$$ && ($isNum$$module$src$service$action_impl$$($c$jscomp$1_end$133_end$137_end$jscomp$4$$) || "." == $c$jscomp$1_end$133_end$137_end$jscomp$4$$ && $newIndex_s$134$$ + 1 < $JSCompiler_StaticMethods_ParserTokenizer$$module$src$service$action_impl_prototype$next_$self_s$jscomp$16$$.$D$.length && $isNum$$module$src$service$action_impl$$($JSCompiler_StaticMethods_ParserTokenizer$$module$src$service$action_impl_prototype$next_$self_s$jscomp$16$$.$D$[$newIndex_s$134$$ + 
  1]))) {
    $convertValues_end$135_hasFraction_numberOfBraces$$ = "." == $c$jscomp$1_end$133_end$137_end$jscomp$4$$;
    for ($c$jscomp$1_end$133_end$137_end$jscomp$4$$ = $newIndex_s$134$$ + 1; $c$jscomp$1_end$133_end$137_end$jscomp$4$$ < $JSCompiler_StaticMethods_ParserTokenizer$$module$src$service$action_impl_prototype$next_$self_s$jscomp$16$$.$D$.length; $c$jscomp$1_end$133_end$137_end$jscomp$4$$++) {
      var $c2_i$138_i$jscomp$65$$ = $JSCompiler_StaticMethods_ParserTokenizer$$module$src$service$action_impl_prototype$next_$self_s$jscomp$16$$.$D$.charAt($c$jscomp$1_end$133_end$137_end$jscomp$4$$);
      if ("." == $c2_i$138_i$jscomp$65$$) {
        $convertValues_end$135_hasFraction_numberOfBraces$$ = !0;
      } else {
        if (!$isNum$$module$src$service$action_impl$$($c2_i$138_i$jscomp$65$$)) {
          break;
        }
      }
    }
    $newIndex_s$134$$ = $JSCompiler_StaticMethods_ParserTokenizer$$module$src$service$action_impl_prototype$next_$self_s$jscomp$16$$.$D$.substring($newIndex_s$134$$, $c$jscomp$1_end$133_end$137_end$jscomp$4$$);
    return {type:$TokenType$$module$src$service$action_impl$LITERAL$$, value:$convertValues_end$135_hasFraction_numberOfBraces$$ ? (0,window.parseFloat)($newIndex_s$134$$) : (0,window.parseInt)($newIndex_s$134$$, 10), index:$c$jscomp$1_end$133_end$137_end$jscomp$4$$ - 1};
  }
  if (-1 != ";:.()=,|!".indexOf($c$jscomp$1_end$133_end$137_end$jscomp$4$$)) {
    return {type:$TokenType$$module$src$service$action_impl$SEPARATOR$$, value:$c$jscomp$1_end$133_end$137_end$jscomp$4$$, index:$newIndex_s$134$$};
  }
  if (-1 != "\"'".indexOf($c$jscomp$1_end$133_end$137_end$jscomp$4$$)) {
    $convertValues_end$135_hasFraction_numberOfBraces$$ = -1;
    for ($c2_i$138_i$jscomp$65$$ = $newIndex_s$134$$ + 1; $c2_i$138_i$jscomp$65$$ < $JSCompiler_StaticMethods_ParserTokenizer$$module$src$service$action_impl_prototype$next_$self_s$jscomp$16$$.$D$.length; $c2_i$138_i$jscomp$65$$++) {
      if ($JSCompiler_StaticMethods_ParserTokenizer$$module$src$service$action_impl_prototype$next_$self_s$jscomp$16$$.$D$.charAt($c2_i$138_i$jscomp$65$$) == $c$jscomp$1_end$133_end$137_end$jscomp$4$$) {
        $convertValues_end$135_hasFraction_numberOfBraces$$ = $c2_i$138_i$jscomp$65$$;
        break;
      }
    }
    return -1 == $convertValues_end$135_hasFraction_numberOfBraces$$ ? {type:0, index:$newIndex_s$134$$} : {type:$TokenType$$module$src$service$action_impl$LITERAL$$, value:$JSCompiler_StaticMethods_ParserTokenizer$$module$src$service$action_impl_prototype$next_$self_s$jscomp$16$$.$D$.substring($newIndex_s$134$$ + 1, $convertValues_end$135_hasFraction_numberOfBraces$$), index:$convertValues_end$135_hasFraction_numberOfBraces$$};
  }
  if ("{" == $c$jscomp$1_end$133_end$137_end$jscomp$4$$) {
    $convertValues_end$135_hasFraction_numberOfBraces$$ = 1;
    $c$jscomp$1_end$133_end$137_end$jscomp$4$$ = -1;
    for ($c2_i$138_i$jscomp$65$$ = $newIndex_s$134$$ + 1; $c2_i$138_i$jscomp$65$$ < $JSCompiler_StaticMethods_ParserTokenizer$$module$src$service$action_impl_prototype$next_$self_s$jscomp$16$$.$D$.length; $c2_i$138_i$jscomp$65$$++) {
      var $char$$ = $JSCompiler_StaticMethods_ParserTokenizer$$module$src$service$action_impl_prototype$next_$self_s$jscomp$16$$.$D$[$c2_i$138_i$jscomp$65$$];
      "{" == $char$$ ? $convertValues_end$135_hasFraction_numberOfBraces$$++ : "}" == $char$$ && $convertValues_end$135_hasFraction_numberOfBraces$$--;
      if (0 >= $convertValues_end$135_hasFraction_numberOfBraces$$) {
        $c$jscomp$1_end$133_end$137_end$jscomp$4$$ = $c2_i$138_i$jscomp$65$$;
        break;
      }
    }
    return -1 == $c$jscomp$1_end$133_end$137_end$jscomp$4$$ ? {type:0, index:$newIndex_s$134$$} : {type:$TokenType$$module$src$service$action_impl$OBJECT$$, value:$JSCompiler_StaticMethods_ParserTokenizer$$module$src$service$action_impl_prototype$next_$self_s$jscomp$16$$.$D$.substring($newIndex_s$134$$, $c$jscomp$1_end$133_end$137_end$jscomp$4$$ + 1), index:$c$jscomp$1_end$133_end$137_end$jscomp$4$$};
  }
  for ($c$jscomp$1_end$133_end$137_end$jscomp$4$$ = $newIndex_s$134$$ + 1; $c$jscomp$1_end$133_end$137_end$jscomp$4$$ < $JSCompiler_StaticMethods_ParserTokenizer$$module$src$service$action_impl_prototype$next_$self_s$jscomp$16$$.$D$.length && -1 == " \t\n\r\f\x0B\u00a0\u2028\u2029;:.()=,|!\"'{}".indexOf($JSCompiler_StaticMethods_ParserTokenizer$$module$src$service$action_impl_prototype$next_$self_s$jscomp$16$$.$D$.charAt($c$jscomp$1_end$133_end$137_end$jscomp$4$$)); $c$jscomp$1_end$133_end$137_end$jscomp$4$$++) {
  }
  $JSCompiler_StaticMethods_ParserTokenizer$$module$src$service$action_impl_prototype$next_$self_s$jscomp$16$$ = $JSCompiler_StaticMethods_ParserTokenizer$$module$src$service$action_impl_prototype$next_$self_s$jscomp$16$$.$D$.substring($newIndex_s$134$$, $c$jscomp$1_end$133_end$137_end$jscomp$4$$);
  $newIndex_s$134$$ = $c$jscomp$1_end$133_end$137_end$jscomp$4$$ - 1;
  return !$convertValues_end$135_hasFraction_numberOfBraces$$ || "true" != $JSCompiler_StaticMethods_ParserTokenizer$$module$src$service$action_impl_prototype$next_$self_s$jscomp$16$$ && "false" != $JSCompiler_StaticMethods_ParserTokenizer$$module$src$service$action_impl_prototype$next_$self_s$jscomp$16$$ ? $isNum$$module$src$service$action_impl$$($JSCompiler_StaticMethods_ParserTokenizer$$module$src$service$action_impl_prototype$next_$self_s$jscomp$16$$.charAt(0)) ? {type:$TokenType$$module$src$service$action_impl$LITERAL$$, 
  value:$JSCompiler_StaticMethods_ParserTokenizer$$module$src$service$action_impl_prototype$next_$self_s$jscomp$16$$, index:$newIndex_s$134$$} : {type:$TokenType$$module$src$service$action_impl$ID$$, value:$JSCompiler_StaticMethods_ParserTokenizer$$module$src$service$action_impl_prototype$next_$self_s$jscomp$16$$, index:$newIndex_s$134$$} : {type:$TokenType$$module$src$service$action_impl$LITERAL$$, value:"true" == $JSCompiler_StaticMethods_ParserTokenizer$$module$src$service$action_impl_prototype$next_$self_s$jscomp$16$$, 
  index:$newIndex_s$134$$};
};
$isNum$$module$src$service$action_impl$$ = function($c$jscomp$2$$) {
  return "0" <= $c$jscomp$2$$ && "9" >= $c$jscomp$2$$;
};
$Xhr$$module$src$service$xhr_impl$$ = function($ampdocService$jscomp$2_win$jscomp$114$$) {
  this.$win$ = $ampdocService$jscomp$2_win$jscomp$114$$;
  $ampdocService$jscomp$2_win$jscomp$114$$ = _.$Services$$module$src$services$ampdocServiceFor$$($ampdocService$jscomp$2_win$jscomp$114$$);
  this.$G$ = $ampdocService$jscomp$2_win$jscomp$114$$.$isSingleDoc$() ? $ampdocService$jscomp$2_win$jscomp$114$$.$getAmpDoc$() : null;
};
_.$JSCompiler_StaticMethods_fetchAmpCors_$$ = function($JSCompiler_StaticMethods_fetchAmpCors_$self$$, $input$jscomp$17$$, $init$jscomp$12$$) {
  $init$jscomp$12$$ = void 0 === $init$jscomp$12$$ ? {} : $init$jscomp$12$$;
  $input$jscomp$17$$ = _.$setupInput$$module$src$utils$xhr_utils$$($JSCompiler_StaticMethods_fetchAmpCors_$self$$.$win$, $input$jscomp$17$$, $init$jscomp$12$$);
  $init$jscomp$12$$ = _.$setupAMPCors$$module$src$utils$xhr_utils$$($JSCompiler_StaticMethods_fetchAmpCors_$self$$.$win$, $input$jscomp$17$$, $init$jscomp$12$$);
  return $JSCompiler_StaticMethods_fetchAmpCors_$self$$.$F$($input$jscomp$17$$, $init$jscomp$12$$).then(function($input$jscomp$17$$) {
    return _.$verifyAmpCORSHeaders$$module$src$utils$xhr_utils$$($JSCompiler_StaticMethods_fetchAmpCors_$self$$.$win$, $input$jscomp$17$$);
  }, function($JSCompiler_StaticMethods_fetchAmpCors_$self$$) {
    var $init$jscomp$12$$ = _.$parseUrlDeprecated$$module$src$url$$($input$jscomp$17$$).origin;
    throw _.$user$$module$src$log$$().$createExpectedError$("XHR", "Failed fetching" + (" (" + $init$jscomp$12$$ + "/...):"), $JSCompiler_StaticMethods_fetchAmpCors_$self$$ && $JSCompiler_StaticMethods_fetchAmpCors_$self$$.message);
  });
};
_.$JSCompiler_StaticMethods_fetchJson$$ = function($JSCompiler_StaticMethods_fetchJson$self$$, $input$jscomp$18$$, $opt_init$jscomp$8$$) {
  return $JSCompiler_StaticMethods_fetchJson$self$$.fetch($input$jscomp$18$$, _.$setupJsonFetchInit$$module$src$utils$xhr_utils$$($opt_init$jscomp$8$$));
};
$BatchedXhr$$module$src$service$batched_xhr_impl$$ = function($win$jscomp$116$$) {
  $Xhr$$module$src$service$xhr_impl$$.call(this, $win$jscomp$116$$);
  this.$D$ = _.$map$$module$src$utils$object$$();
};
_.$base64UrlEncodeFromBytes$$module$src$utils$base64$$ = function($bytes$jscomp$4_str$jscomp$11$$) {
  $bytes$jscomp$4_str$jscomp$11$$ = _.$bytesToString$$module$src$utils$bytes$$($bytes$jscomp$4_str$jscomp$11$$);
  return (0,window.btoa)($bytes$jscomp$4_str$jscomp$11$$).replace(/[+/=]/g, function($bytes$jscomp$4_str$jscomp$11$$) {
    return $base64UrlEncodeSubs$$module$src$utils$base64$$[$bytes$jscomp$4_str$jscomp$11$$];
  });
};
$CacheCidApi$$module$src$service$cache_cid_api$$ = function($ampdoc$jscomp$15$$) {
  this.$ampdoc_$ = $ampdoc$jscomp$15$$;
  this.$viewer_$ = _.$Services$$module$src$services$viewerForDoc$$(this.$ampdoc_$);
  this.$D$ = null;
  this.$timer_$ = _.$Services$$module$src$services$timerFor$$(this.$ampdoc_$.$win$);
};
$JSCompiler_StaticMethods_CacheCidApi$$module$src$service$cache_cid_api_prototype$getScopedCid$$ = function($JSCompiler_StaticMethods_CacheCidApi$$module$src$service$cache_cid_api_prototype$getScopedCid$self$$, $scope$$) {
  if (!$JSCompiler_StaticMethods_isCctEmbedded$$($JSCompiler_StaticMethods_CacheCidApi$$module$src$service$cache_cid_api_prototype$getScopedCid$self$$.$viewer_$)) {
    return window.Promise.resolve(null);
  }
  $JSCompiler_StaticMethods_CacheCidApi$$module$src$service$cache_cid_api_prototype$getScopedCid$self$$.$D$ || ($JSCompiler_StaticMethods_CacheCidApi$$module$src$service$cache_cid_api_prototype$getScopedCid$self$$.$D$ = $JSCompiler_StaticMethods_CacheCidApi$$module$src$service$cache_cid_api_prototype$fetchCid_$$($JSCompiler_StaticMethods_CacheCidApi$$module$src$service$cache_cid_api_prototype$getScopedCid$self$$, "https://ampcid.google.com/v1/cache:getClientId?key=AIzaSyDKtqGxnoeIqVM33Uf7hRSa3GJxuzR7mLc"));
  return $JSCompiler_StaticMethods_CacheCidApi$$module$src$service$cache_cid_api_prototype$getScopedCid$self$$.$D$.then(function($publisherCid$$) {
    return $publisherCid$$ ? $JSCompiler_StaticMethods_scopeCid_$$($JSCompiler_StaticMethods_CacheCidApi$$module$src$service$cache_cid_api_prototype$getScopedCid$self$$, $publisherCid$$, $scope$$) : null;
  });
};
$JSCompiler_StaticMethods_CacheCidApi$$module$src$service$cache_cid_api_prototype$fetchCid_$$ = function($JSCompiler_StaticMethods_CacheCidApi$$module$src$service$cache_cid_api_prototype$fetchCid_$self$$, $url$jscomp$56$$, $useAlternate$$) {
  $useAlternate$$ = void 0 === $useAlternate$$ ? !0 : $useAlternate$$;
  var $payload$jscomp$1$$ = _.$dict$$module$src$utils$object$$({publisherOrigin:_.$getSourceOrigin$$module$src$url$$($JSCompiler_StaticMethods_CacheCidApi$$module$src$service$cache_cid_api_prototype$fetchCid_$self$$.$ampdoc_$.$win$.location)});
  return _.$JSCompiler_StaticMethods_timeoutPromise$$($JSCompiler_StaticMethods_CacheCidApi$$module$src$service$cache_cid_api_prototype$fetchCid_$self$$.$timer_$, 30000, _.$JSCompiler_StaticMethods_fetchJson$$(_.$Services$$module$src$services$xhrFor$$($JSCompiler_StaticMethods_CacheCidApi$$module$src$service$cache_cid_api_prototype$fetchCid_$self$$.$ampdoc_$.$win$), $url$jscomp$56$$, {method:"POST", ampCors:!1, credentials:"include", mode:"cors", body:$payload$jscomp$1$$})).then(function($url$jscomp$56$$) {
    return $url$jscomp$56$$.json().then(function($url$jscomp$56$$) {
      if ($url$jscomp$56$$.optOut) {
        return null;
      }
      var $payload$jscomp$1$$ = $url$jscomp$56$$.publisherClientId;
      return !$payload$jscomp$1$$ && $useAlternate$$ && $url$jscomp$56$$.alternateUrl ? $JSCompiler_StaticMethods_CacheCidApi$$module$src$service$cache_cid_api_prototype$fetchCid_$$($JSCompiler_StaticMethods_CacheCidApi$$module$src$service$cache_cid_api_prototype$fetchCid_$self$$, $url$jscomp$56$$.alternateUrl + "?key=AIzaSyDKtqGxnoeIqVM33Uf7hRSa3GJxuzR7mLc", !1) : $payload$jscomp$1$$;
    });
  }).catch(function($JSCompiler_StaticMethods_CacheCidApi$$module$src$service$cache_cid_api_prototype$fetchCid_$self$$) {
    $JSCompiler_StaticMethods_CacheCidApi$$module$src$service$cache_cid_api_prototype$fetchCid_$self$$ && $JSCompiler_StaticMethods_CacheCidApi$$module$src$service$cache_cid_api_prototype$fetchCid_$self$$.response ? $JSCompiler_StaticMethods_CacheCidApi$$module$src$service$cache_cid_api_prototype$fetchCid_$self$$.response.json().then(function($JSCompiler_StaticMethods_CacheCidApi$$module$src$service$cache_cid_api_prototype$fetchCid_$self$$) {
      _.$dev$$module$src$log$$().error("CacheCidApi", JSON.stringify($JSCompiler_StaticMethods_CacheCidApi$$module$src$service$cache_cid_api_prototype$fetchCid_$self$$));
    }) : _.$dev$$module$src$log$$().error("CacheCidApi", $JSCompiler_StaticMethods_CacheCidApi$$module$src$service$cache_cid_api_prototype$fetchCid_$self$$);
    return null;
  });
};
$JSCompiler_StaticMethods_scopeCid_$$ = function($JSCompiler_StaticMethods_scopeCid_$self$$, $publisherCid$jscomp$1_text$jscomp$11$$, $scope$jscomp$1$$) {
  $publisherCid$jscomp$1_text$jscomp$11$$ = $publisherCid$jscomp$1_text$jscomp$11$$ + ";" + $scope$jscomp$1$$;
  return _.$JSCompiler_StaticMethods_sha384Base64$$(_.$Services$$module$src$services$cryptoFor$$($JSCompiler_StaticMethods_scopeCid_$self$$.$ampdoc_$.$win$), $publisherCid$jscomp$1_text$jscomp$11$$).then(function($JSCompiler_StaticMethods_scopeCid_$self$$) {
    return "amp-" + $JSCompiler_StaticMethods_scopeCid_$self$$;
  });
};
$GoogleCidApi$$module$src$service$cid_api$$ = function($ampdoc$jscomp$16_canonicalUrl$$) {
  this.$D$ = $ampdoc$jscomp$16_canonicalUrl$$.$win$;
  this.$timer_$ = _.$Services$$module$src$services$timerFor$$(this.$D$);
  this.$F$ = {};
  this.$I$ = ($ampdoc$jscomp$16_canonicalUrl$$ = _.$Services$$module$src$services$documentInfoForDoc$$($ampdoc$jscomp$16_canonicalUrl$$).canonicalUrl) ? _.$parseUrlDeprecated$$module$src$url$$($ampdoc$jscomp$16_canonicalUrl$$).origin : null;
};
$JSCompiler_StaticMethods_GoogleCidApi$$module$src$service$cid_api_prototype$getScopedCid$$ = function($JSCompiler_StaticMethods_GoogleCidApi$$module$src$service$cid_api_prototype$getScopedCid$self$$, $apiKey$$, $scope$jscomp$2$$) {
  if ($JSCompiler_StaticMethods_GoogleCidApi$$module$src$service$cid_api_prototype$getScopedCid$self$$.$F$[$scope$jscomp$2$$]) {
    return $JSCompiler_StaticMethods_GoogleCidApi$$module$src$service$cid_api_prototype$getScopedCid$self$$.$F$[$scope$jscomp$2$$];
  }
  var $token$jscomp$4$$;
  return $JSCompiler_StaticMethods_GoogleCidApi$$module$src$service$cid_api_prototype$getScopedCid$self$$.$F$[$scope$jscomp$2$$] = _.$JSCompiler_StaticMethods_poll$$($JSCompiler_StaticMethods_GoogleCidApi$$module$src$service$cid_api_prototype$getScopedCid$self$$.$timer_$, 200, function() {
    $token$jscomp$4$$ = $getCookie$$module$src$cookies$$($JSCompiler_StaticMethods_GoogleCidApi$$module$src$service$cid_api_prototype$getScopedCid$self$$.$D$, "AMP_TOKEN");
    return "$RETRIEVING" !== $token$jscomp$4$$;
  }).then(function() {
    if ("$OPT_OUT" === $token$jscomp$4$$) {
      return "$OPT_OUT";
    }
    if (("$NOT_FOUND" !== $token$jscomp$4$$ || !_.$isProxyOrigin$$module$src$url$$($JSCompiler_StaticMethods_GoogleCidApi$$module$src$service$cid_api_prototype$getScopedCid$self$$.$D$.document.referrer)) && $token$jscomp$4$$ && "$" === $token$jscomp$4$$[0]) {
      return null;
    }
    $token$jscomp$4$$ && (!$token$jscomp$4$$ || "$" !== $token$jscomp$4$$[0]) || $JSCompiler_StaticMethods_persistToken_$$($JSCompiler_StaticMethods_GoogleCidApi$$module$src$service$cid_api_prototype$getScopedCid$self$$, "$RETRIEVING", 30000);
    return $JSCompiler_StaticMethods_GoogleCidApi$$module$src$service$cid_api_prototype$fetchCid_$$($JSCompiler_StaticMethods_GoogleCidApi$$module$src$service$cid_api_prototype$getScopedCid$self$$, "https://ampcid.google.com/v1/publisher:getClientId?key=" + $apiKey$$, $scope$jscomp$2$$, $token$jscomp$4$$).then(function($response$jscomp$15$$) {
      var $cid$jscomp$1$$ = $JSCompiler_StaticMethods_GoogleCidApi$$module$src$service$cid_api_prototype$getScopedCid$self$$.$G$($response$jscomp$15$$);
      return !$cid$jscomp$1$$ && $response$jscomp$15$$.alternateUrl ? $JSCompiler_StaticMethods_GoogleCidApi$$module$src$service$cid_api_prototype$fetchCid_$$($JSCompiler_StaticMethods_GoogleCidApi$$module$src$service$cid_api_prototype$getScopedCid$self$$, $response$jscomp$15$$.alternateUrl + "?key=" + $apiKey$$, $scope$jscomp$2$$, $token$jscomp$4$$).then($JSCompiler_StaticMethods_GoogleCidApi$$module$src$service$cid_api_prototype$getScopedCid$self$$.$G$.bind($JSCompiler_StaticMethods_GoogleCidApi$$module$src$service$cid_api_prototype$getScopedCid$self$$)) : 
      $cid$jscomp$1$$;
    }).catch(function($apiKey$$) {
      $JSCompiler_StaticMethods_persistToken_$$($JSCompiler_StaticMethods_GoogleCidApi$$module$src$service$cid_api_prototype$getScopedCid$self$$, "$ERROR", 30000);
      $apiKey$$ && $apiKey$$.response ? $apiKey$$.response.json().then(function($JSCompiler_StaticMethods_GoogleCidApi$$module$src$service$cid_api_prototype$getScopedCid$self$$) {
        _.$dev$$module$src$log$$().error("GoogleCidApi", JSON.stringify($JSCompiler_StaticMethods_GoogleCidApi$$module$src$service$cid_api_prototype$getScopedCid$self$$));
      }) : _.$dev$$module$src$log$$().error("GoogleCidApi", $apiKey$$);
      return null;
    });
  });
};
$JSCompiler_StaticMethods_GoogleCidApi$$module$src$service$cid_api_prototype$fetchCid_$$ = function($JSCompiler_StaticMethods_GoogleCidApi$$module$src$service$cid_api_prototype$fetchCid_$self$$, $url$jscomp$58$$, $payload$jscomp$2_scope$jscomp$3$$, $token$jscomp$5$$) {
  $payload$jscomp$2_scope$jscomp$3$$ = _.$dict$$module$src$utils$object$$({originScope:$payload$jscomp$2_scope$jscomp$3$$, canonicalOrigin:$JSCompiler_StaticMethods_GoogleCidApi$$module$src$service$cid_api_prototype$fetchCid_$self$$.$I$});
  $token$jscomp$5$$ && ($payload$jscomp$2_scope$jscomp$3$$.securityToken = $token$jscomp$5$$);
  return _.$JSCompiler_StaticMethods_timeoutPromise$$($JSCompiler_StaticMethods_GoogleCidApi$$module$src$service$cid_api_prototype$fetchCid_$self$$.$timer_$, 30000, _.$JSCompiler_StaticMethods_fetchJson$$(_.$Services$$module$src$services$xhrFor$$($JSCompiler_StaticMethods_GoogleCidApi$$module$src$service$cid_api_prototype$fetchCid_$self$$.$D$), $url$jscomp$58$$, {method:"POST", ampCors:!1, credentials:"include", mode:"cors", body:$payload$jscomp$2_scope$jscomp$3$$}).then(function($JSCompiler_StaticMethods_GoogleCidApi$$module$src$service$cid_api_prototype$fetchCid_$self$$) {
    return $JSCompiler_StaticMethods_GoogleCidApi$$module$src$service$cid_api_prototype$fetchCid_$self$$.json();
  }));
};
$JSCompiler_StaticMethods_persistToken_$$ = function($JSCompiler_StaticMethods_persistToken_$self$$, $tokenValue$$, $expires$$) {
  $tokenValue$$ && _.$setCookie$$module$src$cookies$$($JSCompiler_StaticMethods_persistToken_$self$$.$D$, "AMP_TOKEN", $tokenValue$$, $JSCompiler_StaticMethods_persistToken_$self$$.$D$.Date.now() + $expires$$, {$highestAvailableDomain$:!0});
};
$ViewerCidApi$$module$src$service$viewer_cid_api$$ = function($ampdoc$jscomp$17_canonicalUrl$jscomp$1$$) {
  this.$ampdoc_$ = $ampdoc$jscomp$17_canonicalUrl$jscomp$1$$;
  this.$viewer_$ = _.$Services$$module$src$services$viewerForDoc$$(this.$ampdoc_$);
  this.$D$ = ($ampdoc$jscomp$17_canonicalUrl$jscomp$1$$ = _.$Services$$module$src$services$documentInfoForDoc$$(this.$ampdoc_$).canonicalUrl) ? _.$parseUrlDeprecated$$module$src$url$$($ampdoc$jscomp$17_canonicalUrl$jscomp$1$$).origin : null;
};
$JSCompiler_StaticMethods_ViewerCidApi$$module$src$service$viewer_cid_api_prototype$getScopedCid$$ = function($JSCompiler_StaticMethods_ViewerCidApi$$module$src$service$viewer_cid_api_prototype$getScopedCid$self$$, $apiKey$jscomp$1$$, $payload$jscomp$3_scope$jscomp$4$$) {
  $payload$jscomp$3_scope$jscomp$4$$ = _.$dict$$module$src$utils$object$$({scope:$payload$jscomp$3_scope$jscomp$4$$, clientIdApi:!!$apiKey$jscomp$1$$, canonicalOrigin:$JSCompiler_StaticMethods_ViewerCidApi$$module$src$service$viewer_cid_api_prototype$getScopedCid$self$$.$D$});
  $apiKey$jscomp$1$$ && ($payload$jscomp$3_scope$jscomp$4$$.apiKey = $apiKey$jscomp$1$$);
  return _.$JSCompiler_StaticMethods_sendMessageAwaitResponse$$($JSCompiler_StaticMethods_ViewerCidApi$$module$src$service$viewer_cid_api_prototype$getScopedCid$self$$.$viewer_$, "cid", $payload$jscomp$3_scope$jscomp$4$$);
};
$Cid$$module$src$service$cid_impl$$ = function($ampdoc$jscomp$18$$) {
  this.ampdoc = $ampdoc$jscomp$18$$;
  this.$F$ = null;
  this.$G$ = Object.create(null);
  this.$I$ = new $CacheCidApi$$module$src$service$cache_cid_api$$($ampdoc$jscomp$18$$);
  this.$J$ = new $ViewerCidApi$$module$src$service$viewer_cid_api$$($ampdoc$jscomp$18$$);
  this.$K$ = new $GoogleCidApi$$module$src$service$cid_api$$($ampdoc$jscomp$18$$);
  this.$D$ = null;
};
$JSCompiler_StaticMethods_getExternalCid_$$ = function($JSCompiler_StaticMethods_getExternalCid_$self$$, $getCidStruct$jscomp$1$$, $persistenceConsent$$) {
  var $scope$jscomp$5$$ = $getCidStruct$jscomp$1$$.scope, $url$jscomp$59$$ = _.$parseUrlDeprecated$$module$src$url$$($JSCompiler_StaticMethods_getExternalCid_$self$$.ampdoc.$win$.location.href);
  if (!_.$isProxyOrigin$$module$src$url$$($url$jscomp$59$$)) {
    var $apiKey$jscomp$2$$ = $JSCompiler_StaticMethods_isScopeOptedIn_$$($JSCompiler_StaticMethods_getExternalCid_$self$$, $scope$jscomp$5$$);
    return $apiKey$jscomp$2$$ ? $JSCompiler_StaticMethods_GoogleCidApi$$module$src$service$cid_api_prototype$getScopedCid$$($JSCompiler_StaticMethods_getExternalCid_$self$$.$K$, $apiKey$jscomp$2$$, $scope$jscomp$5$$).then(function($url$jscomp$59$$) {
      return "$OPT_OUT" == $url$jscomp$59$$ ? null : $url$jscomp$59$$ ? ($setCidCookie$$module$src$service$cid_impl$$($JSCompiler_StaticMethods_getExternalCid_$self$$.ampdoc.$win$, $getCidStruct$jscomp$1$$.$cookieName$ || $scope$jscomp$5$$, $url$jscomp$59$$), $url$jscomp$59$$) : $getOrCreateCookie$$module$src$service$cid_impl$$($JSCompiler_StaticMethods_getExternalCid_$self$$, $getCidStruct$jscomp$1$$, $persistenceConsent$$);
    }) : $getOrCreateCookie$$module$src$service$cid_impl$$($JSCompiler_StaticMethods_getExternalCid_$self$$, $getCidStruct$jscomp$1$$, $persistenceConsent$$);
  }
  return $JSCompiler_StaticMethods_getExternalCid_$self$$.$J$.isSupported().then(function($getCidStruct$jscomp$1$$) {
    return $getCidStruct$jscomp$1$$ ? ($getCidStruct$jscomp$1$$ = $JSCompiler_StaticMethods_isScopeOptedIn_$$($JSCompiler_StaticMethods_getExternalCid_$self$$, $scope$jscomp$5$$), $JSCompiler_StaticMethods_ViewerCidApi$$module$src$service$viewer_cid_api_prototype$getScopedCid$$($JSCompiler_StaticMethods_getExternalCid_$self$$.$J$, $getCidStruct$jscomp$1$$, $scope$jscomp$5$$)) : $JSCompiler_StaticMethods_getExternalCid_$self$$.$I$.isSupported() && $JSCompiler_StaticMethods_isScopeOptedIn_$$($JSCompiler_StaticMethods_getExternalCid_$self$$, 
    $scope$jscomp$5$$) ? $JSCompiler_StaticMethods_CacheCidApi$$module$src$service$cache_cid_api_prototype$getScopedCid$$($JSCompiler_StaticMethods_getExternalCid_$self$$.$I$, $scope$jscomp$5$$).then(function($getCidStruct$jscomp$1$$) {
      return $getCidStruct$jscomp$1$$ ? $getCidStruct$jscomp$1$$ : $JSCompiler_StaticMethods_scopeBaseCid_$$($JSCompiler_StaticMethods_getExternalCid_$self$$, $persistenceConsent$$, $scope$jscomp$5$$, $url$jscomp$59$$);
    }) : $JSCompiler_StaticMethods_scopeBaseCid_$$($JSCompiler_StaticMethods_getExternalCid_$self$$, $persistenceConsent$$, $scope$jscomp$5$$, $url$jscomp$59$$);
  });
};
$JSCompiler_StaticMethods_scopeBaseCid_$$ = function($JSCompiler_StaticMethods_scopeBaseCid_$self$$, $persistenceConsent$jscomp$1$$, $scope$jscomp$6$$, $url$jscomp$60$$) {
  return $getBaseCid$$module$src$service$cid_impl$$($JSCompiler_StaticMethods_scopeBaseCid_$self$$, $persistenceConsent$jscomp$1$$).then(function($persistenceConsent$jscomp$1$$) {
    return _.$JSCompiler_StaticMethods_sha384Base64$$(_.$Services$$module$src$services$cryptoFor$$($JSCompiler_StaticMethods_scopeBaseCid_$self$$.ampdoc.$win$), $persistenceConsent$jscomp$1$$ + _.$getSourceOrigin$$module$src$url$$($url$jscomp$60$$) + $scope$jscomp$6$$);
  });
};
$JSCompiler_StaticMethods_isScopeOptedIn_$$ = function($JSCompiler_StaticMethods_isScopeOptedIn_$self$$, $scope$jscomp$7$$) {
  $JSCompiler_StaticMethods_isScopeOptedIn_$self$$.$D$ || ($JSCompiler_StaticMethods_isScopeOptedIn_$self$$.$D$ = $JSCompiler_StaticMethods_getOptedInScopes_$$($JSCompiler_StaticMethods_isScopeOptedIn_$self$$));
  return $JSCompiler_StaticMethods_isScopeOptedIn_$self$$.$D$[$scope$jscomp$7$$];
};
$JSCompiler_StaticMethods_getOptedInScopes_$$ = function($JSCompiler_StaticMethods_getOptedInScopes_$self_optInMeta$$) {
  var $apiKeyMap$$ = {};
  ($JSCompiler_StaticMethods_getOptedInScopes_$self_optInMeta$$ = $JSCompiler_StaticMethods_getOptedInScopes_$self_optInMeta$$.ampdoc.$win$.document.head.querySelector("meta[name=amp-google-client-id-api]")) && $JSCompiler_StaticMethods_getOptedInScopes_$self_optInMeta$$.hasAttribute("content") && $JSCompiler_StaticMethods_getOptedInScopes_$self_optInMeta$$.getAttribute("content").split(",").forEach(function($JSCompiler_StaticMethods_getOptedInScopes_$self_optInMeta$$) {
    $JSCompiler_StaticMethods_getOptedInScopes_$self_optInMeta$$ = $JSCompiler_StaticMethods_getOptedInScopes_$self_optInMeta$$.trim();
    if (0 < $JSCompiler_StaticMethods_getOptedInScopes_$self_optInMeta$$.indexOf("=")) {
      $JSCompiler_StaticMethods_getOptedInScopes_$self_optInMeta$$ = $JSCompiler_StaticMethods_getOptedInScopes_$self_optInMeta$$.split("="), $apiKeyMap$$[$JSCompiler_StaticMethods_getOptedInScopes_$self_optInMeta$$[0].trim()] = $JSCompiler_StaticMethods_getOptedInScopes_$self_optInMeta$$[1].trim();
    } else {
      var $clientName_item$jscomp$3_pair$$ = $CID_API_SCOPE_WHITELIST$$module$src$service$cid_impl$$[$JSCompiler_StaticMethods_getOptedInScopes_$self_optInMeta$$];
      $clientName_item$jscomp$3_pair$$ ? $apiKeyMap$$[$clientName_item$jscomp$3_pair$$] = $API_KEYS$$module$src$service$cid_impl$$[$JSCompiler_StaticMethods_getOptedInScopes_$self_optInMeta$$] : _.$user$$module$src$log$$().error("CID", "Unsupported client for Google CID API: " + $JSCompiler_StaticMethods_getOptedInScopes_$self_optInMeta$$);
    }
  });
  return $apiKeyMap$$;
};
_.$optOutOfCid$$module$src$service$cid_impl$$ = function($ampdoc$jscomp$19$$) {
  _.$JSCompiler_StaticMethods_Viewer$$module$src$service$viewer_impl_prototype$sendMessage$$(_.$Services$$module$src$services$viewerForDoc$$($ampdoc$jscomp$19$$), "cidOptOut", {});
  return _.$Services$$module$src$services$storageForDoc$$($ampdoc$jscomp$19$$).then(function($ampdoc$jscomp$19$$) {
    return $ampdoc$jscomp$19$$.set("amp-cid-optout", !0);
  });
};
$isOptedOutOfCid$$module$src$service$cid_impl$$ = function($ampdoc$jscomp$20$$) {
  return _.$Services$$module$src$services$storageForDoc$$($ampdoc$jscomp$20$$).then(function($ampdoc$jscomp$20$$) {
    return $ampdoc$jscomp$20$$.get("amp-cid-optout").then(function($ampdoc$jscomp$20$$) {
      return !!$ampdoc$jscomp$20$$;
    });
  }).catch(function() {
    return !1;
  });
};
$setCidCookie$$module$src$service$cid_impl$$ = function($win$jscomp$125$$, $scope$jscomp$9$$, $cookie$jscomp$2$$) {
  _.$setCookie$$module$src$cookies$$($win$jscomp$125$$, $scope$jscomp$9$$, $cookie$jscomp$2$$, Date.now() + 31536E6, {$highestAvailableDomain$:!0});
};
$getOrCreateCookie$$module$src$service$cid_impl$$ = function($cid$jscomp$2$$, $getCidStruct$jscomp$2_newCookiePromise$$, $persistenceConsent$jscomp$2$$) {
  var $win$jscomp$126$$ = $cid$jscomp$2$$.ampdoc.$win$, $scope$jscomp$10$$ = $getCidStruct$jscomp$2_newCookiePromise$$.scope, $cookieName$jscomp$1$$ = $getCidStruct$jscomp$2_newCookiePromise$$.$cookieName$ || $scope$jscomp$10$$, $existingCookie$$ = $getCookie$$module$src$cookies$$($win$jscomp$126$$, $cookieName$jscomp$1$$);
  if (!$existingCookie$$ && !$getCidStruct$jscomp$2_newCookiePromise$$.createCookieIfNotPresent) {
    return window.Promise.resolve(null);
  }
  if ($cid$jscomp$2$$.$G$[$scope$jscomp$10$$]) {
    return $cid$jscomp$2$$.$G$[$scope$jscomp$10$$];
  }
  if ($existingCookie$$) {
    return /^amp-/.test($existingCookie$$) && $setCidCookie$$module$src$service$cid_impl$$($win$jscomp$126$$, $cookieName$jscomp$1$$, $existingCookie$$), window.Promise.resolve($existingCookie$$);
  }
  $getCidStruct$jscomp$2_newCookiePromise$$ = $getNewCidForCookie$$module$src$service$cid_impl$$($win$jscomp$126$$).then(function($cid$jscomp$2$$) {
    return "amp-" + $cid$jscomp$2$$;
  });
  window.Promise.all([$getCidStruct$jscomp$2_newCookiePromise$$, $persistenceConsent$jscomp$2$$]).then(function($cid$jscomp$2$$) {
    $cid$jscomp$2$$ = $cid$jscomp$2$$[0];
    $getCookie$$module$src$cookies$$($win$jscomp$126$$, $cookieName$jscomp$1$$) || $setCidCookie$$module$src$service$cid_impl$$($win$jscomp$126$$, $cookieName$jscomp$1$$, $cid$jscomp$2$$);
  });
  return $cid$jscomp$2$$.$G$[$scope$jscomp$10$$] = $getCidStruct$jscomp$2_newCookiePromise$$;
};
$getBaseCid$$module$src$service$cid_impl$$ = function($cid$jscomp$3$$, $persistenceConsent$jscomp$3$$) {
  if ($cid$jscomp$3$$.$F$) {
    return $cid$jscomp$3$$.$F$;
  }
  var $win$jscomp$127$$ = $cid$jscomp$3$$.ampdoc.$win$;
  return $cid$jscomp$3$$.$F$ = $read$$module$src$service$cid_impl$$($cid$jscomp$3$$.ampdoc).then(function($stored$$) {
    var $needsToStore$$ = !1;
    if (!$stored$$ || $stored$$.time + 31536E6 < Date.now()) {
      var $baseCid$jscomp$1$$ = _.$JSCompiler_StaticMethods_sha384Base64$$(_.$Services$$module$src$services$cryptoFor$$($win$jscomp$127$$), $getEntropy$$module$src$service$cid_impl$$($win$jscomp$127$$));
      $needsToStore$$ = !0;
    } else {
      $baseCid$jscomp$1$$ = window.Promise.resolve($stored$$.$cid$), $stored$$.time + 864E5 < Date.now() && ($needsToStore$$ = !0);
    }
    $needsToStore$$ && $baseCid$jscomp$1$$.then(function($win$jscomp$127$$) {
      $store$$module$src$service$cid_impl$$($cid$jscomp$3$$.ampdoc, $persistenceConsent$jscomp$3$$, $win$jscomp$127$$);
    });
    return $baseCid$jscomp$1$$;
  });
};
$store$$module$src$service$cid_impl$$ = function($ampdoc$jscomp$21$$, $persistenceConsent$jscomp$4$$, $cidString$$) {
  var $win$jscomp$128$$ = $ampdoc$jscomp$21$$.$win$;
  _.$isIframed$$module$src$dom$$($win$jscomp$128$$) ? $viewerBaseCid$$module$src$service$cid_impl$$($ampdoc$jscomp$21$$, JSON.stringify(_.$dict$$module$src$utils$object$$({time:Date.now(), cid:$cidString$$}))) : $persistenceConsent$jscomp$4$$.then(function() {
    try {
      $win$jscomp$128$$.localStorage.setItem("amp-cid", JSON.stringify(_.$dict$$module$src$utils$object$$({time:Date.now(), cid:$cidString$$})));
    } catch ($ignore$jscomp$2$$) {
    }
  });
};
$viewerBaseCid$$module$src$service$cid_impl$$ = function($ampdoc$jscomp$22$$, $opt_data$jscomp$3$$) {
  var $viewer$jscomp$11$$ = _.$Services$$module$src$services$viewerForDoc$$($ampdoc$jscomp$22$$);
  return $JSCompiler_StaticMethods_isTrustedViewer$$($viewer$jscomp$11$$).then(function($ampdoc$jscomp$22$$) {
    if ($ampdoc$jscomp$22$$) {
      return _.$dev$$module$src$log$$().$expectedError$("CID", "Viewer does not provide cap=cid"), _.$JSCompiler_StaticMethods_sendMessageAwaitResponse$$($viewer$jscomp$11$$, "cid", $opt_data$jscomp$3$$).then(function($ampdoc$jscomp$22$$) {
        return $ampdoc$jscomp$22$$ && !_.$tryParseJson$$module$src$json$$($ampdoc$jscomp$22$$) ? (_.$dev$$module$src$log$$().$expectedError$("CID", "invalid cid format"), JSON.stringify(_.$dict$$module$src$utils$object$$({time:Date.now(), cid:$ampdoc$jscomp$22$$}))) : $ampdoc$jscomp$22$$;
      });
    }
  });
};
$read$$module$src$service$cid_impl$$ = function($ampdoc$jscomp$23$$) {
  var $win$jscomp$129$$ = $ampdoc$jscomp$23$$.$win$;
  try {
    var $data$jscomp$42$$ = $win$jscomp$129$$.localStorage.getItem("amp-cid");
  } catch ($ignore$jscomp$3$$) {
  }
  var $dataPromise$$ = window.Promise.resolve($data$jscomp$42$$);
  !$data$jscomp$42$$ && _.$isIframed$$module$src$dom$$($win$jscomp$129$$) && ($dataPromise$$ = $viewerBaseCid$$module$src$service$cid_impl$$($ampdoc$jscomp$23$$));
  return $dataPromise$$.then(function($ampdoc$jscomp$23$$) {
    if (!$ampdoc$jscomp$23$$) {
      return null;
    }
    $ampdoc$jscomp$23$$ = _.$parseJson$$module$src$json$$($ampdoc$jscomp$23$$);
    return {time:$ampdoc$jscomp$23$$.time, $cid$:$ampdoc$jscomp$23$$.cid};
  });
};
$getEntropy$$module$src$service$cid_impl$$ = function($win$jscomp$130$$) {
  var $uint8array$jscomp$1$$ = _.$getCryptoRandomBytesArray$$module$src$utils$bytes$$($win$jscomp$130$$, 16);
  return $uint8array$jscomp$1$$ ? $uint8array$jscomp$1$$ : String($win$jscomp$130$$.location.href + Date.now() + $win$jscomp$130$$.Math.random() + $win$jscomp$130$$.screen.width + $win$jscomp$130$$.screen.height);
};
$getNewCidForCookie$$module$src$service$cid_impl$$ = function($win$jscomp$131$$) {
  var $entropy$$ = $getEntropy$$module$src$service$cid_impl$$($win$jscomp$131$$);
  return "string" == typeof $entropy$$ ? _.$JSCompiler_StaticMethods_sha384Base64$$(_.$Services$$module$src$services$cryptoFor$$($win$jscomp$131$$), $entropy$$) : _.$tryResolve$$module$src$utils$promise$$(function() {
    return _.$base64UrlEncodeFromBytes$$module$src$utils$base64$$($entropy$$).replace(/\.+$/, "");
  });
};
$Crypto$$module$src$service$crypto_impl$$ = function($win$jscomp$132$$) {
  this.$G$ = $win$jscomp$132$$;
  var $subtle$$ = null, $isLegacyWebkit$$ = !1;
  $win$jscomp$132$$.crypto && ($win$jscomp$132$$.crypto.subtle ? $subtle$$ = $win$jscomp$132$$.crypto.subtle : $win$jscomp$132$$.crypto.$D$ && ($subtle$$ = $win$jscomp$132$$.crypto.$D$, $isLegacyWebkit$$ = !0));
  this.$I$ = {name:"RSASSA-PKCS1-v1_5", hash:{name:"SHA-256"}};
  this.$D$ = $subtle$$;
  this.$J$ = $isLegacyWebkit$$;
  this.$F$ = null;
};
_.$JSCompiler_StaticMethods_sha384$$ = function($JSCompiler_StaticMethods_sha384$self$$, $input$jscomp$24$$) {
  "string" === typeof $input$jscomp$24$$ && ($input$jscomp$24$$ = _.$stringToBytes$$module$src$utils$bytes$$($input$jscomp$24$$));
  if (!$JSCompiler_StaticMethods_sha384$self$$.$D$ || $JSCompiler_StaticMethods_sha384$self$$.$F$) {
    return ($JSCompiler_StaticMethods_sha384$self$$.$F$ || $JSCompiler_StaticMethods_loadPolyfill_$$($JSCompiler_StaticMethods_sha384$self$$)).then(function($JSCompiler_StaticMethods_sha384$self$$) {
      return $JSCompiler_StaticMethods_sha384$self$$($input$jscomp$24$$);
    });
  }
  try {
    return $JSCompiler_StaticMethods_sha384$self$$.$D$.digest({name:"SHA-384"}, $input$jscomp$24$$).then(function($JSCompiler_StaticMethods_sha384$self$$) {
      return new window.Uint8Array($JSCompiler_StaticMethods_sha384$self$$);
    }, function($e$jscomp$50$$) {
      $e$jscomp$50$$.message && 0 > $e$jscomp$50$$.message.indexOf("secure origin") && _.$user$$module$src$log$$().error("Crypto", "SubtleCrypto failed, fallback to closure lib.", $e$jscomp$50$$);
      return $JSCompiler_StaticMethods_loadPolyfill_$$($JSCompiler_StaticMethods_sha384$self$$).then(function() {
        return _.$JSCompiler_StaticMethods_sha384$$($JSCompiler_StaticMethods_sha384$self$$, $input$jscomp$24$$);
      });
    });
  } catch ($e$jscomp$51$$) {
    return _.$dev$$module$src$log$$().error("Crypto", "SubtleCrypto failed, fallback to closure lib.", $e$jscomp$51$$), $JSCompiler_StaticMethods_loadPolyfill_$$($JSCompiler_StaticMethods_sha384$self$$).then(function() {
      return _.$JSCompiler_StaticMethods_sha384$$($JSCompiler_StaticMethods_sha384$self$$, $input$jscomp$24$$);
    });
  }
};
_.$JSCompiler_StaticMethods_sha384Base64$$ = function($JSCompiler_StaticMethods_sha384Base64$self$$, $input$jscomp$25$$) {
  return _.$JSCompiler_StaticMethods_sha384$$($JSCompiler_StaticMethods_sha384Base64$self$$, $input$jscomp$25$$).then(function($JSCompiler_StaticMethods_sha384Base64$self$$) {
    return _.$base64UrlEncodeFromBytes$$module$src$utils$base64$$($JSCompiler_StaticMethods_sha384Base64$self$$);
  });
};
$JSCompiler_StaticMethods_loadPolyfill_$$ = function($JSCompiler_StaticMethods_loadPolyfill_$self$$) {
  return $JSCompiler_StaticMethods_loadPolyfill_$self$$.$F$ ? $JSCompiler_StaticMethods_loadPolyfill_$self$$.$F$ : $JSCompiler_StaticMethods_loadPolyfill_$self$$.$F$ = _.$JSCompiler_StaticMethods_preloadExtension$$(_.$Services$$module$src$services$extensionsFor$$($JSCompiler_StaticMethods_loadPolyfill_$self$$.$G$), "amp-crypto-polyfill").then(function() {
    return _.$getService$$module$src$service$$($JSCompiler_StaticMethods_loadPolyfill_$self$$.$G$, "crypto-polyfill");
  });
};
_.$listen$$module$src$3p_frame_messaging$$ = function($element$jscomp$90$$, $listener$jscomp$59$$) {
  return _.$internalListenImplementation$$module$src$event_helper_listen$$($element$jscomp$90$$, "message", $listener$jscomp$59$$, void 0);
};
_.$deserializeMessage$$module$src$3p_frame_messaging$$ = function($message$jscomp$34$$) {
  if (!_.$isAmpMessage$$module$src$3p_frame_messaging$$($message$jscomp$34$$)) {
    return null;
  }
  var $startPos$jscomp$1$$ = $message$jscomp$34$$.indexOf("{");
  try {
    return _.$parseJson$$module$src$json$$($message$jscomp$34$$.substr($startPos$jscomp$1$$));
  } catch ($e$jscomp$52$$) {
    return _.$dev$$module$src$log$$().error("MESSAGING", "Failed to parse message: " + $message$jscomp$34$$, $e$jscomp$52$$), null;
  }
};
_.$isAmpMessage$$module$src$3p_frame_messaging$$ = function($message$jscomp$35$$) {
  return "string" == typeof $message$jscomp$35$$ && 0 == $message$jscomp$35$$.indexOf("amp-") && -1 != $message$jscomp$35$$.indexOf("{");
};
_.$layoutRectLtwh$$module$src$layout_rect$$ = function($left$jscomp$2$$, $top$jscomp$2$$, $width$jscomp$14$$, $height$jscomp$13$$) {
  return {left:$left$jscomp$2$$, top:$top$jscomp$2$$, width:$width$jscomp$14$$, height:$height$jscomp$13$$, bottom:$top$jscomp$2$$ + $height$jscomp$13$$, right:$left$jscomp$2$$ + $width$jscomp$14$$, x:$left$jscomp$2$$, y:$top$jscomp$2$$};
};
_.$layoutRectsOverlap$$module$src$layout_rect$$ = function($r1$jscomp$1$$, $r2$$) {
  return $r1$jscomp$1$$.top <= $r2$$.bottom && $r2$$.top <= $r1$jscomp$1$$.bottom && $r1$jscomp$1$$.left <= $r2$$.right && $r2$$.left <= $r1$jscomp$1$$.right;
};
_.$rectIntersection$$module$src$layout_rect$$ = function($var_args$jscomp$59$$) {
  for (var $x0$jscomp$2$$ = -window.Infinity, $x1$jscomp$5$$ = window.Infinity, $y0$jscomp$2$$ = -window.Infinity, $y1$jscomp$5$$ = window.Infinity, $i$jscomp$74$$ = 0; $i$jscomp$74$$ < arguments.length; $i$jscomp$74$$++) {
    var $current$jscomp$3$$ = arguments[$i$jscomp$74$$];
    if ($current$jscomp$3$$ && ($x0$jscomp$2$$ = Math.max($x0$jscomp$2$$, $current$jscomp$3$$.left), $x1$jscomp$5$$ = Math.min($x1$jscomp$5$$, $current$jscomp$3$$.left + $current$jscomp$3$$.width), $y0$jscomp$2$$ = Math.max($y0$jscomp$2$$, $current$jscomp$3$$.top), $y1$jscomp$5$$ = Math.min($y1$jscomp$5$$, $current$jscomp$3$$.top + $current$jscomp$3$$.height), $x1$jscomp$5$$ < $x0$jscomp$2$$ || $y1$jscomp$5$$ < $y0$jscomp$2$$)) {
      return null;
    }
  }
  return window.Infinity == $x1$jscomp$5$$ ? null : _.$layoutRectLtwh$$module$src$layout_rect$$($x0$jscomp$2$$, $y0$jscomp$2$$, $x1$jscomp$5$$ - $x0$jscomp$2$$, $y1$jscomp$5$$ - $y0$jscomp$2$$);
};
_.$expandLayoutRect$$module$src$layout_rect$$ = function($rect$jscomp$1$$, $dw$$, $dh$$) {
  return _.$layoutRectLtwh$$module$src$layout_rect$$($rect$jscomp$1$$.left - $rect$jscomp$1$$.width * $dw$$, $rect$jscomp$1$$.top - $rect$jscomp$1$$.height * $dh$$, $rect$jscomp$1$$.width * (1 + 2 * $dw$$), $rect$jscomp$1$$.height * (1 + 2 * $dh$$));
};
_.$moveLayoutRect$$module$src$layout_rect$$ = function($rect$jscomp$2$$, $dx$jscomp$4$$, $dy$jscomp$5$$) {
  return 0 == $dx$jscomp$4$$ && 0 == $dy$jscomp$5$$ || 0 == $rect$jscomp$2$$.width && 0 == $rect$jscomp$2$$.height ? $rect$jscomp$2$$ : _.$layoutRectLtwh$$module$src$layout_rect$$($rect$jscomp$2$$.left + $dx$jscomp$4$$, $rect$jscomp$2$$.top + $dy$jscomp$5$$, $rect$jscomp$2$$.width, $rect$jscomp$2$$.height);
};
_.$intersectionRatio$$module$src$intersection_observer_polyfill$$ = function($smaller_smallerBoxArea$$, $larger_largerBoxArea$$) {
  $smaller_smallerBoxArea$$ = $smaller_smallerBoxArea$$.width * $smaller_smallerBoxArea$$.height;
  $larger_largerBoxArea$$ = $larger_largerBoxArea$$.width * $larger_largerBoxArea$$.height;
  return 0 === $larger_largerBoxArea$$ ? 0 : $smaller_smallerBoxArea$$ / $larger_largerBoxArea$$;
};
_.$calculateChangeEntry$$module$src$intersection_observer_polyfill$$ = function($boundingClientRect_element$jscomp$98$$, $hostViewport$jscomp$3$$, $intersection$jscomp$1$$, $ratio$jscomp$3$$) {
  var $rootBounds$$ = $hostViewport$jscomp$3$$;
  $hostViewport$jscomp$3$$ && ($intersection$jscomp$1$$ = _.$moveLayoutRect$$module$src$layout_rect$$($intersection$jscomp$1$$, -$hostViewport$jscomp$3$$.left, -$hostViewport$jscomp$3$$.top), $boundingClientRect_element$jscomp$98$$ = _.$moveLayoutRect$$module$src$layout_rect$$($boundingClientRect_element$jscomp$98$$, -$hostViewport$jscomp$3$$.left, -$hostViewport$jscomp$3$$.top), $rootBounds$$ = _.$moveLayoutRect$$module$src$layout_rect$$($rootBounds$$, -$hostViewport$jscomp$3$$.left, -$hostViewport$jscomp$3$$.top));
  return {time:"undefined" !== typeof window.performance && window.performance.now ? window.performance.now() : Date.now() - $INIT_TIME$$module$src$intersection_observer_polyfill$$, rootBounds:$rootBounds$$, boundingClientRect:$boundingClientRect_element$jscomp$98$$, intersectionRect:$intersection$jscomp$1$$, intersectionRatio:$ratio$jscomp$3$$};
};
_.$ElementStub$$module$src$element_stub$$ = function($element$jscomp$99$$) {
  _.$BaseElement$$module$src$base_element$$.call(this, $element$jscomp$99$$);
  $stubbedElements$$module$src$element_stub$$.push(this);
};
$LayoutDelayMeter$$module$src$layout_delay_meter$$ = function($win$jscomp$136$$, $priority$jscomp$4$$) {
  this.$I$ = $win$jscomp$136$$;
  this.$D$ = _.$Services$$module$src$services$performanceForOrNull$$($win$jscomp$136$$);
  this.$G$ = this.$F$ = null;
  this.$J$ = !1;
  this.$label_$ = $LABEL_MAP$$module$src$layout_delay_meter$$[$priority$jscomp$4$$];
};
$JSCompiler_StaticMethods_tryMeasureDelay_$$ = function($JSCompiler_StaticMethods_tryMeasureDelay_$self$$) {
  if ($JSCompiler_StaticMethods_tryMeasureDelay_$self$$.$D$ && $JSCompiler_StaticMethods_tryMeasureDelay_$self$$.$D$.$G$ && !$JSCompiler_StaticMethods_tryMeasureDelay_$self$$.$J$ && $JSCompiler_StaticMethods_tryMeasureDelay_$self$$.$F$ && $JSCompiler_StaticMethods_tryMeasureDelay_$self$$.$G$) {
    var $JSCompiler_StaticMethods_throttledFlush$self$jscomp$inline_1305_delay$jscomp$1$$ = $JSCompiler_StaticMethods_tryMeasureDelay_$self$$.$I$.Math.max($JSCompiler_StaticMethods_tryMeasureDelay_$self$$.$G$ - $JSCompiler_StaticMethods_tryMeasureDelay_$self$$.$F$, 0);
    $JSCompiler_StaticMethods_tryMeasureDelay_$self$$.$D$.$D$($JSCompiler_StaticMethods_tryMeasureDelay_$self$$.$label_$, $JSCompiler_StaticMethods_throttledFlush$self$jscomp$inline_1305_delay$jscomp$1$$);
    $JSCompiler_StaticMethods_throttledFlush$self$jscomp$inline_1305_delay$jscomp$1$$ = $JSCompiler_StaticMethods_tryMeasureDelay_$self$$.$D$;
    $JSCompiler_StaticMethods_throttledFlush$self$jscomp$inline_1305_delay$jscomp$1$$.$Y$ || ($JSCompiler_StaticMethods_throttledFlush$self$jscomp$inline_1305_delay$jscomp$1$$.$Y$ = _.$throttle$$module$src$utils$rate_limit$$($JSCompiler_StaticMethods_throttledFlush$self$jscomp$inline_1305_delay$jscomp$1$$.$win$, $JSCompiler_StaticMethods_throttledFlush$self$jscomp$inline_1305_delay$jscomp$1$$.$F$.bind($JSCompiler_StaticMethods_throttledFlush$self$jscomp$inline_1305_delay$jscomp$1$$), 100));
    $JSCompiler_StaticMethods_throttledFlush$self$jscomp$inline_1305_delay$jscomp$1$$.$Y$();
    $JSCompiler_StaticMethods_tryMeasureDelay_$self$$.$J$ = !0;
  }
};
_.$Resource$$module$src$service$resource$$ = function($deferred$jscomp$11_id$jscomp$33$$, $element$jscomp$100$$, $resources$jscomp$2$$) {
  $element$jscomp$100$$.__AMP__RESOURCE = this;
  this.$ea$ = $deferred$jscomp$11_id$jscomp$33$$;
  this.element = $element$jscomp$100$$;
  this.$R$ = $element$jscomp$100$$.tagName.toLowerCase() + "#" + $deferred$jscomp$11_id$jscomp$33$$;
  this.$U$ = $element$jscomp$100$$.ownerDocument.defaultView;
  this.$J$ = $resources$jscomp$2$$;
  this.$fa$ = $element$jscomp$100$$.hasAttribute("placeholder");
  this.$O$ = !1;
  this.$K$ = void 0;
  this.$state_$ = $element$jscomp$100$$.$O$ ? 1 : 0;
  this.$aa$ = -1;
  this.$W$ = 0;
  this.$ba$ = null;
  this.$V$ = !1;
  this.$F$ = _.$layoutRectLtwh$$module$src$layout_rect$$(-10000, -10000, 0, 0);
  this.$D$ = null;
  this.$I$ = !1;
  this.$layoutPromise_$ = this.$G$ = null;
  this.$P$ = void 0;
  $deferred$jscomp$11_id$jscomp$33$$ = new _.$Deferred$$module$src$utils$promise$$;
  this.$loadPromise_$ = $deferred$jscomp$11_id$jscomp$33$$.$promise$;
  this.$Y$ = $deferred$jscomp$11_id$jscomp$33$$.resolve;
  this.$useLayers_$ = _.$isExperimentOn$$module$src$experiments$$(this.$U$, "layers");
};
_.$Resource$$module$src$service$resource$forElementOptional$$ = function($element$jscomp$102$$) {
  return $element$jscomp$102$$.__AMP__RESOURCE;
};
$JSCompiler_StaticMethods_Resource$$module$src$service$resource_prototype$overflowCallback$$ = function($JSCompiler_StaticMethods_Resource$$module$src$service$resource_prototype$overflowCallback$self$$, $overflown$$, $requestedHeight$$, $requestedWidth$$, $requestedMargins$$) {
  $overflown$$ && ($JSCompiler_StaticMethods_Resource$$module$src$service$resource_prototype$overflowCallback$self$$.$P$ = {height:$requestedHeight$$, width:$requestedWidth$$, $margins$:$requestedMargins$$});
  $JSCompiler_StaticMethods_Resource$$module$src$service$resource_prototype$overflowCallback$self$$.element.$Da$($overflown$$, $requestedHeight$$, $requestedWidth$$);
};
_.$JSCompiler_StaticMethods_completeCollapse$$ = function($JSCompiler_StaticMethods_completeCollapse$self$$) {
  _.$toggle$$module$src$style$$($JSCompiler_StaticMethods_completeCollapse$self$$.element, !1);
  $JSCompiler_StaticMethods_completeCollapse$self$$.$F$ = $JSCompiler_StaticMethods_completeCollapse$self$$.$useLayers_$ ? _.$layoutRectLtwh$$module$src$layout_rect$$(0, 0, 0, 0) : _.$layoutRectLtwh$$module$src$layout_rect$$($JSCompiler_StaticMethods_completeCollapse$self$$.$F$.left, $JSCompiler_StaticMethods_completeCollapse$self$$.$F$.top, 0, 0);
  $JSCompiler_StaticMethods_completeCollapse$self$$.$V$ = !1;
  $JSCompiler_StaticMethods_completeCollapse$self$$.element.$Ba$($JSCompiler_StaticMethods_completeCollapse$self$$.$getLayoutBox$());
  var $owner$jscomp$4$$ = $JSCompiler_StaticMethods_completeCollapse$self$$.$getOwner$();
  $owner$jscomp$4$$ && $owner$jscomp$4$$.$collapsedCallback$($JSCompiler_StaticMethods_completeCollapse$self$$.element);
};
_.$JSCompiler_StaticMethods_isDisplayed$$ = function($JSCompiler_StaticMethods_isDisplayed$self$$) {
  var $isFluid$$ = "fluid" == $JSCompiler_StaticMethods_isDisplayed$self$$.element.$getLayout$(), $box$jscomp$4_hasNonZeroSize$$ = $JSCompiler_StaticMethods_isDisplayed$self$$.$getLayoutBox$();
  $box$jscomp$4_hasNonZeroSize$$ = 0 < $box$jscomp$4_hasNonZeroSize$$.height && 0 < $box$jscomp$4_hasNonZeroSize$$.width;
  return ($isFluid$$ || $box$jscomp$4_hasNonZeroSize$$) && !!$JSCompiler_StaticMethods_isDisplayed$self$$.element.ownerDocument && !!$JSCompiler_StaticMethods_isDisplayed$self$$.element.ownerDocument.defaultView;
};
$JSCompiler_StaticMethods_overlaps$$ = function($JSCompiler_StaticMethods_overlaps$self$$, $rect$jscomp$3$$) {
  return _.$layoutRectsOverlap$$module$src$layout_rect$$($JSCompiler_StaticMethods_overlaps$self$$.$getLayoutBox$(), $rect$jscomp$3$$);
};
$JSCompiler_StaticMethods_resolveDeferredsWhenWithinViewports_$$ = function($JSCompiler_StaticMethods_resolveDeferredsWhenWithinViewports_$self$$) {
  if ($JSCompiler_StaticMethods_resolveDeferredsWhenWithinViewports_$self$$.$G$) {
    var $viewportRatio$$ = $JSCompiler_StaticMethods_getDistanceViewportRatio$$($JSCompiler_StaticMethods_resolveDeferredsWhenWithinViewports_$self$$), $key$jscomp$60$$;
    for ($key$jscomp$60$$ in $JSCompiler_StaticMethods_resolveDeferredsWhenWithinViewports_$self$$.$G$) {
      _.$JSCompiler_StaticMethods_isWithinViewportRatio$$($JSCompiler_StaticMethods_resolveDeferredsWhenWithinViewports_$self$$, (0,window.parseFloat)($key$jscomp$60$$), $viewportRatio$$) && ($JSCompiler_StaticMethods_resolveDeferredsWhenWithinViewports_$self$$.$G$[$key$jscomp$60$$].resolve(), delete $JSCompiler_StaticMethods_resolveDeferredsWhenWithinViewports_$self$$.$G$[$key$jscomp$60$$]);
    }
  }
};
$JSCompiler_StaticMethods_getDistanceViewportRatio$$ = function($JSCompiler_StaticMethods_getDistanceViewportRatio$self_scrollDirection$$) {
  if ($JSCompiler_StaticMethods_getDistanceViewportRatio$self_scrollDirection$$.$useLayers_$) {
    var $element$jscomp$107_viewportBox$$ = $JSCompiler_StaticMethods_getDistanceViewportRatio$self_scrollDirection$$.element;
    return {$distance$:$element$jscomp$107_viewportBox$$.$P$.$iterateAncestry$($element$jscomp$107_viewportBox$$, $JSCompiler_StaticMethods_getDistanceViewportRatio$self_scrollDirection$$.$layersDistanceRatio_$)};
  }
  $element$jscomp$107_viewportBox$$ = _.$JSCompiler_StaticMethods_getRect$$($JSCompiler_StaticMethods_getDistanceViewportRatio$self_scrollDirection$$.$J$.$getViewport$());
  var $distance_layoutBox$$ = $JSCompiler_StaticMethods_getDistanceViewportRatio$self_scrollDirection$$.$getLayoutBox$();
  $JSCompiler_StaticMethods_getDistanceViewportRatio$self_scrollDirection$$ = Math.sign($JSCompiler_StaticMethods_getDistanceViewportRatio$self_scrollDirection$$.$J$.$aa$) || 1;
  var $scrollPenalty$$ = 1;
  if ($element$jscomp$107_viewportBox$$.right < $distance_layoutBox$$.left || $element$jscomp$107_viewportBox$$.left > $distance_layoutBox$$.right) {
    return {$distance$:!1};
  }
  if ($element$jscomp$107_viewportBox$$.bottom < $distance_layoutBox$$.top) {
    $distance_layoutBox$$ = $distance_layoutBox$$.top - $element$jscomp$107_viewportBox$$.bottom, -1 == $JSCompiler_StaticMethods_getDistanceViewportRatio$self_scrollDirection$$ && ($scrollPenalty$$ = 2);
  } else {
    if ($element$jscomp$107_viewportBox$$.top > $distance_layoutBox$$.bottom) {
      $distance_layoutBox$$ = $element$jscomp$107_viewportBox$$.top - $distance_layoutBox$$.bottom, 1 == $JSCompiler_StaticMethods_getDistanceViewportRatio$self_scrollDirection$$ && ($scrollPenalty$$ = 2);
    } else {
      return {$distance$:!0};
    }
  }
  return {$distance$:$distance_layoutBox$$, $scrollPenalty$:$scrollPenalty$$, $viewportHeight$:$element$jscomp$107_viewportBox$$.height};
};
_.$JSCompiler_StaticMethods_isWithinViewportRatio$$ = function($JSCompiler_StaticMethods_isWithinViewportRatio$self$$, $multiplier$$, $$jscomp$destructuring$var71_opt_viewportRatio$$) {
  if ("boolean" === typeof $multiplier$$) {
    return $multiplier$$;
  }
  $$jscomp$destructuring$var71_opt_viewportRatio$$ = $$jscomp$destructuring$var71_opt_viewportRatio$$ || $JSCompiler_StaticMethods_getDistanceViewportRatio$$($JSCompiler_StaticMethods_isWithinViewportRatio$self$$);
  var $distance$jscomp$1$$ = $$jscomp$destructuring$var71_opt_viewportRatio$$.$distance$;
  return $JSCompiler_StaticMethods_isWithinViewportRatio$self$$.$useLayers_$ ? $distance$jscomp$1$$ < $multiplier$$ : "boolean" == typeof $distance$jscomp$1$$ ? $distance$jscomp$1$$ : $distance$jscomp$1$$ < $$jscomp$destructuring$var71_opt_viewportRatio$$.$viewportHeight$ * $multiplier$$ / $$jscomp$destructuring$var71_opt_viewportRatio$$.$scrollPenalty$;
};
_.$JSCompiler_StaticMethods_layoutCanceled$$ = function($JSCompiler_StaticMethods_layoutCanceled$self$$) {
  $JSCompiler_StaticMethods_layoutCanceled$self$$.$state_$ = $JSCompiler_StaticMethods_layoutCanceled$self$$.$D$ ? 2 : 1;
};
$JSCompiler_StaticMethods_layoutComplete_$$ = function($JSCompiler_StaticMethods_layoutComplete_$self$$, $success$$, $opt_reason$jscomp$1$$) {
  $JSCompiler_StaticMethods_layoutComplete_$self$$.$Y$ && ($JSCompiler_StaticMethods_layoutComplete_$self$$.$Y$(), $JSCompiler_StaticMethods_layoutComplete_$self$$.$Y$ = null);
  $JSCompiler_StaticMethods_layoutComplete_$self$$.$layoutPromise_$ = null;
  $JSCompiler_StaticMethods_layoutComplete_$self$$.$state_$ = $success$$ ? 4 : 5;
  $JSCompiler_StaticMethods_layoutComplete_$self$$.$ba$ = $opt_reason$jscomp$1$$;
  if ($success$$) {
    "Resource";
  } else {
    return "Resource", window.Promise.reject($opt_reason$jscomp$1$$);
  }
};
_.$JSCompiler_StaticMethods_unlayout$$ = function($JSCompiler_StaticMethods_unlayout$self$$) {
  0 != $JSCompiler_StaticMethods_unlayout$self$$.$state_$ && 1 != $JSCompiler_StaticMethods_unlayout$self$$.$state_$ && ($JSCompiler_StaticMethods_unlayout$self$$.element.$viewportCallback$(!1), $JSCompiler_StaticMethods_unlayout$self$$.element.$unlayoutCallback$() && ($JSCompiler_StaticMethods_unlayout$self$$.element.$togglePlaceholder$(!0), $JSCompiler_StaticMethods_unlayout$self$$.$state_$ = 1, $JSCompiler_StaticMethods_unlayout$self$$.$W$ = 0, $JSCompiler_StaticMethods_unlayout$self$$.$layoutPromise_$ = 
  null));
};
$parseSizeList$$module$src$size_list$$ = function($s$jscomp$17$$) {
  var $sizes$$ = [];
  $s$jscomp$17$$.split(",").forEach(function($s$jscomp$17$$) {
    $s$jscomp$17$$ = $s$jscomp$17$$.replace(/\s+/g, " ").trim();
    if (0 != $s$jscomp$17$$.length) {
      var $sSize_sizeStr$$;
      if (")" == $s$jscomp$17$$.charAt($s$jscomp$17$$.length - 1)) {
        var $c$144_c$145_mediaStr_parens$$ = 1;
        for ($sSize_sizeStr$$ = $s$jscomp$17$$.length - 2; 0 <= $sSize_sizeStr$$; $sSize_sizeStr$$--) {
          var $c$jscomp$3$$ = $s$jscomp$17$$.charAt($sSize_sizeStr$$);
          "(" == $c$jscomp$3$$ ? $c$144_c$145_mediaStr_parens$$-- : ")" == $c$jscomp$3$$ && $c$144_c$145_mediaStr_parens$$++;
          if (0 == $c$144_c$145_mediaStr_parens$$) {
            break;
          }
        }
        if (0 < $sSize_sizeStr$$) {
          for ($sSize_sizeStr$$--; 0 <= $sSize_sizeStr$$ && ($c$144_c$145_mediaStr_parens$$ = $s$jscomp$17$$.charAt($sSize_sizeStr$$), "%" == $c$144_c$145_mediaStr_parens$$ || "-" == $c$144_c$145_mediaStr_parens$$ || "_" == $c$144_c$145_mediaStr_parens$$ || "a" <= $c$144_c$145_mediaStr_parens$$ && "z" >= $c$144_c$145_mediaStr_parens$$ || "A" <= $c$144_c$145_mediaStr_parens$$ && "Z" >= $c$144_c$145_mediaStr_parens$$ || "0" <= $c$144_c$145_mediaStr_parens$$ && "9" >= $c$144_c$145_mediaStr_parens$$); $sSize_sizeStr$$--) {
          }
        }
      } else {
        for ($sSize_sizeStr$$ = $s$jscomp$17$$.length - 2; 0 <= $sSize_sizeStr$$ && ($c$144_c$145_mediaStr_parens$$ = $s$jscomp$17$$.charAt($sSize_sizeStr$$), "%" == $c$144_c$145_mediaStr_parens$$ || "." == $c$144_c$145_mediaStr_parens$$ || "a" <= $c$144_c$145_mediaStr_parens$$ && "z" >= $c$144_c$145_mediaStr_parens$$ || "A" <= $c$144_c$145_mediaStr_parens$$ && "Z" >= $c$144_c$145_mediaStr_parens$$ || "0" <= $c$144_c$145_mediaStr_parens$$ && "9" >= $c$144_c$145_mediaStr_parens$$); $sSize_sizeStr$$--) {
        }
      }
      0 <= $sSize_sizeStr$$ ? ($c$144_c$145_mediaStr_parens$$ = $s$jscomp$17$$.substring(0, $sSize_sizeStr$$ + 1).trim(), $s$jscomp$17$$ = $s$jscomp$17$$.substring($sSize_sizeStr$$ + 1).trim()) : $c$144_c$145_mediaStr_parens$$ = void 0;
      $sizes$$.push({$mediaQuery$:$c$144_c$145_mediaStr_parens$$, size:$s$jscomp$17$$});
    }
  });
  return new $SizeList$$module$src$size_list$$($sizes$$);
};
$SizeList$$module$src$size_list$$ = function($sizes$jscomp$1$$) {
  this.$D$ = $sizes$jscomp$1$$;
  for (var $i$jscomp$81$$ = 0; $i$jscomp$81$$ < $sizes$jscomp$1$$.length; $i$jscomp$81$$++) {
  }
};
_.$Signals$$module$src$utils$signals$$ = function() {
  this.$F$ = _.$map$$module$src$utils$object$$();
  this.$D$ = null;
};
_.$JSCompiler_StaticMethods_signal$$ = function($JSCompiler_StaticMethods_signal$self_promiseStruct$jscomp$1$$, $name$jscomp$114$$) {
  if (null == $JSCompiler_StaticMethods_signal$self_promiseStruct$jscomp$1$$.$F$[$name$jscomp$114$$]) {
    var $time$jscomp$2$$ = Date.now();
    $JSCompiler_StaticMethods_signal$self_promiseStruct$jscomp$1$$.$F$[$name$jscomp$114$$] = $time$jscomp$2$$;
    ($JSCompiler_StaticMethods_signal$self_promiseStruct$jscomp$1$$ = $JSCompiler_StaticMethods_signal$self_promiseStruct$jscomp$1$$.$D$ && $JSCompiler_StaticMethods_signal$self_promiseStruct$jscomp$1$$.$D$[$name$jscomp$114$$]) && $JSCompiler_StaticMethods_signal$self_promiseStruct$jscomp$1$$.resolve && ($JSCompiler_StaticMethods_signal$self_promiseStruct$jscomp$1$$.resolve($time$jscomp$2$$), $JSCompiler_StaticMethods_signal$self_promiseStruct$jscomp$1$$.resolve = void 0, $JSCompiler_StaticMethods_signal$self_promiseStruct$jscomp$1$$.reject = 
    void 0);
  }
};
$JSCompiler_StaticMethods_rejectSignal$$ = function($JSCompiler_StaticMethods_rejectSignal$self_promiseStruct$jscomp$2$$, $name$jscomp$115$$, $error$jscomp$21$$) {
  null == $JSCompiler_StaticMethods_rejectSignal$self_promiseStruct$jscomp$2$$.$F$[$name$jscomp$115$$] && ($JSCompiler_StaticMethods_rejectSignal$self_promiseStruct$jscomp$2$$.$F$[$name$jscomp$115$$] = $error$jscomp$21$$, ($JSCompiler_StaticMethods_rejectSignal$self_promiseStruct$jscomp$2$$ = $JSCompiler_StaticMethods_rejectSignal$self_promiseStruct$jscomp$2$$.$D$ && $JSCompiler_StaticMethods_rejectSignal$self_promiseStruct$jscomp$2$$.$D$[$name$jscomp$115$$]) && $JSCompiler_StaticMethods_rejectSignal$self_promiseStruct$jscomp$2$$.reject && 
  ($JSCompiler_StaticMethods_rejectSignal$self_promiseStruct$jscomp$2$$.reject($error$jscomp$21$$), $JSCompiler_StaticMethods_rejectSignal$self_promiseStruct$jscomp$2$$.resolve = void 0, $JSCompiler_StaticMethods_rejectSignal$self_promiseStruct$jscomp$2$$.reject = void 0));
};
$createCustomElementClass$$module$src$custom_element$$ = function($win$jscomp$139$$, $name$jscomp$117$$) {
  function $CustomAmpElement$$($win$jscomp$139$$) {
    return $baseCustomElement$$.call(this, $win$jscomp$139$$) || this;
  }
  var $baseCustomElement$$ = $createBaseCustomElementClass$$module$src$custom_element$$($win$jscomp$139$$);
  _.$$jscomp$inherits$$($CustomAmpElement$$, $baseCustomElement$$);
  $CustomAmpElement$$.prototype.$elementName$ = function() {
    return $name$jscomp$117$$;
  };
  return $CustomAmpElement$$;
};
$createBaseCustomElementClass$$module$src$custom_element$$ = function($win$jscomp$140$$) {
  function $BaseCustomElement$$($win$jscomp$140$$) {
    $win$jscomp$140$$ = $htmlElement$jscomp$2$$.call(this, $win$jscomp$140$$) || this;
    $win$jscomp$140$$.createdCallback();
    return $win$jscomp$140$$;
  }
  if ($win$jscomp$140$$.$BaseCustomElementClass$) {
    return $win$jscomp$140$$.$BaseCustomElementClass$;
  }
  var $htmlElement$jscomp$2$$ = $win$jscomp$140$$.HTMLElement;
  _.$$jscomp$inherits$$($BaseCustomElement$$, $htmlElement$jscomp$2$$);
  $BaseCustomElement$$.prototype.createdCallback = function() {
    this.$la$ = this.$O$ = !1;
    this.$sa$ = null;
    this.readyState = "loading";
    this.$ha$ = !1;
    this.$P$ = this.$ga$ = this.$ampdoc_$ = null;
    this.$layout_$ = "nodisplay";
    this.$layoutWidth_$ = -1;
    this.$R$ = 0;
    this.$fa$ = this.$Y$ = this.$wa$ = !1;
    this.$ka$ = this.$qa$ = this.$na$ = void 0;
    this.$Pa$ = !0;
    this.$Aa$ = this.$ya$ = this.$W$ = void 0;
    this.$za$ = this.$U$ = null;
    this.$J$ = void 0;
    this.$F$ = new ($win$jscomp$140$$.$ampExtendedElements$ && $win$jscomp$140$$.$ampExtendedElements$[this.$elementName$()])(this);
    this.$aa$ = 1;
    this.$Ca$ = 0;
    this.$ba$ = this.$V$ = void 0;
    this.$G$ = new _.$Signals$$module$src$utils$signals$$;
    var $BaseCustomElement$$ = _.$Services$$module$src$services$performanceForOrNull$$($win$jscomp$140$$);
    this.$La$ = $BaseCustomElement$$ && $BaseCustomElement$$.$G$;
    this.$xa$ = null;
    this.__AMP_UPG_RES && (this.__AMP_UPG_RES(this), delete this.__AMP_UPG_RES, delete this.__AMP_UPG_PRM);
  };
  $BaseCustomElement$$.prototype.signals = function() {
    return this.$G$;
  };
  $BaseCustomElement$$.prototype.$getAmpDoc$ = function() {
    return this.$ampdoc_$;
  };
  $BaseCustomElement$$.prototype.$getResources$ = function() {
    return this.$ga$;
  };
  $BaseCustomElement$$.prototype.$ea$ = function() {
    return 2 == this.$aa$;
  };
  $BaseCustomElement$$.prototype.$BaseCustomElement_prototype$upgrade$ = function($win$jscomp$140$$) {
    this.$ba$ || 1 != this.$aa$ || (this.$F$ = new $win$jscomp$140$$(this), this.$ha$ && this.$Oa$());
  };
  $BaseCustomElement$$.prototype.$va$ = function($BaseCustomElement$$, $htmlElement$jscomp$2$$) {
    this.$Ca$ = $win$jscomp$140$$.Date.now() - $htmlElement$jscomp$2$$;
    this.$aa$ = 2;
    this.$F$ = $BaseCustomElement$$;
    this.classList.remove("amp-unresolved");
    this.classList.remove("i-amphtml-unresolved");
    this.$F$.createdCallback();
    this.$Ta$();
    this.$F$.$layout_$ = this.$layout_$;
    this.$F$.$layoutWidth_$ = this.$layoutWidth_$;
    this.$F$.$firstAttachedCallback$();
    $JSCompiler_StaticMethods_buildOrScheduleBuildForResource_$$(this.$getResources$(), _.$Resource$$module$src$service$resource$forElementOptional$$(this));
    "Resources";
  };
  $BaseCustomElement$$.prototype.$Ta$ = function() {
    if ("nodisplay" != this.$layout_$ && !this.$F$.$isLayoutSupported$(this.$layout_$)) {
      var $win$jscomp$140$$ = "Layout not supported: " + this.$layout_$;
      this.getAttribute("layout") || ($win$jscomp$140$$ += ". The element did not specify a layout attribute. Check https://www.ampproject.org/docs/guides/responsive/control_layout and the respective element documentation for details.");
      throw _.$user$$module$src$log$$().$createError$($win$jscomp$140$$);
    }
  };
  $BaseCustomElement$$.prototype.$K$ = function() {
    return this.$G$.whenSignal("built");
  };
  $BaseCustomElement$$.prototype.$getLayoutPriority$ = function() {
    return this.$F$.$getLayoutPriority$();
  };
  $BaseCustomElement$$.prototype.$getDefaultActionAlias$ = function() {
    return this.$F$.$getDefaultActionAlias$();
  };
  $BaseCustomElement$$.prototype.$build$ = function() {
    var $win$jscomp$140$$ = this;
    return this.$sa$ ? this.$sa$ : this.$sa$ = (new window.Promise(function($BaseCustomElement$$, $htmlElement$jscomp$2$$) {
      var $$jscomp$this$jscomp$37$$ = $win$jscomp$140$$.$Va$();
      $$jscomp$this$jscomp$37$$ ? _.$Services$$module$src$services$consentPolicyServiceForDocOrNull$$($win$jscomp$140$$).then(function($win$jscomp$140$$) {
        return $win$jscomp$140$$ ? $win$jscomp$140$$.$aa$($$jscomp$this$jscomp$37$$) : !0;
      }).then(function($$jscomp$this$jscomp$37$$) {
        $$jscomp$this$jscomp$37$$ ? $BaseCustomElement$$($win$jscomp$140$$.$F$.$buildCallback$()) : $htmlElement$jscomp$2$$(Error("BLOCK_BY_CONSENT"));
      }) : $BaseCustomElement$$($win$jscomp$140$$.$F$.$buildCallback$());
    })).then(function() {
      $win$jscomp$140$$.$preconnect$(!1);
      $win$jscomp$140$$.$O$ = !0;
      $win$jscomp$140$$.classList.remove("i-amphtml-notbuilt");
      $win$jscomp$140$$.classList.remove("amp-notbuilt");
      _.$JSCompiler_StaticMethods_signal$$($win$jscomp$140$$.$G$, "built");
      $win$jscomp$140$$.$Y$ && $win$jscomp$140$$.$Fa$(!0);
      $win$jscomp$140$$.$V$ && _.$Services$$module$src$services$timerFor$$($win$jscomp$140$$.ownerDocument.defaultView).delay($win$jscomp$140$$.$Ua$.bind($win$jscomp$140$$), 1);
      if (!$win$jscomp$140$$.$getPlaceholder$()) {
        var $BaseCustomElement$$ = $win$jscomp$140$$.$Ra$();
        $BaseCustomElement$$ && $win$jscomp$140$$.appendChild($BaseCustomElement$$);
      }
    }, function($BaseCustomElement$$) {
      $JSCompiler_StaticMethods_rejectSignal$$($win$jscomp$140$$.$G$, "built", $BaseCustomElement$$);
      $isBlockedByConsent$$module$src$error$$($BaseCustomElement$$) || _.$reportError$$module$src$error$$($BaseCustomElement$$, $win$jscomp$140$$);
      throw $BaseCustomElement$$;
    });
  };
  $BaseCustomElement$$.prototype.$preconnect$ = function($win$jscomp$140$$) {
    var $BaseCustomElement$$ = this;
    $win$jscomp$140$$ ? this.$F$.$preconnectCallback$($win$jscomp$140$$) : _.$Services$$module$src$services$timerFor$$(this.ownerDocument.defaultView).delay(function() {
      var $htmlElement$jscomp$2$$ = $BaseCustomElement$$.tagName;
      $BaseCustomElement$$.ownerDocument ? $BaseCustomElement$$.ownerDocument.defaultView ? $BaseCustomElement$$.$F$.$preconnectCallback$($win$jscomp$140$$) : _.$dev$$module$src$log$$().error($htmlElement$jscomp$2$$, "preconnect without defaultView") : _.$dev$$module$src$log$$().error($htmlElement$jscomp$2$$, "preconnect without ownerDocument");
    }, 1);
  };
  $BaseCustomElement$$.prototype.$isAlwaysFixed$ = function() {
    return this.$F$.$isAlwaysFixed$();
  };
  $BaseCustomElement$$.prototype.$Ba$ = function($win$jscomp$140$$, $BaseCustomElement$$) {
    var $htmlElement$jscomp$2$$ = this;
    this.$layoutWidth_$ = $win$jscomp$140$$.width;
    this.$ea$() && (this.$F$.$layoutWidth_$ = this.$layoutWidth_$);
    if (this.$O$) {
      try {
        this.$F$.$onLayoutMeasure$(), $BaseCustomElement$$ && this.$F$.$onMeasureChanged$();
      } catch ($e$jscomp$55$$) {
        _.$reportError$$module$src$error$$($e$jscomp$55$$, this);
      }
    }
    this.$ma$() && (this.$Y$ ? this.$toggleLoading$(!0) : 1000 > $win$jscomp$140$$.top && 0 <= $win$jscomp$140$$.top && this.$oa$(function() {
      return $htmlElement$jscomp$2$$.$Ma$();
    }));
  };
  $BaseCustomElement$$.prototype.$Ja$ = function() {
    void 0 === this.$W$ && "responsive" === this.$layout_$ && (this.$W$ = this.querySelector("i-amphtml-sizer"));
    return this.$W$ || null;
  };
  $BaseCustomElement$$.prototype.$Qa$ = function() {
    void 0 === this.$na$ && (this.$na$ = this.getAttribute("media") || null);
    this.$na$ && this.classList.toggle("i-amphtml-hidden-by-media-query", !this.ownerDocument.defaultView.matchMedia(this.$na$).matches);
    if (void 0 === this.$qa$) {
      var $win$jscomp$140$$ = this.getAttribute("sizes");
      this.$qa$ = $win$jscomp$140$$ ? $parseSizeList$$module$src$size_list$$($win$jscomp$140$$) : null;
    }
    this.$qa$ && _.$setStyle$$module$src$style$$(this, "width", this.$qa$.select(this.ownerDocument.defaultView));
    void 0 === this.$ka$ && "responsive" === this.$layout_$ && (this.$ka$ = ($win$jscomp$140$$ = this.getAttribute("heights")) ? $parseSizeList$$module$src$size_list$$($win$jscomp$140$$) : null);
    this.$ka$ && ($win$jscomp$140$$ = this.$Ja$()) && _.$setStyle$$module$src$style$$($win$jscomp$140$$, "paddingTop", this.$ka$.select(this.ownerDocument.defaultView));
  };
  $BaseCustomElement$$.prototype.$changeSize$ = function($win$jscomp$140$$, $BaseCustomElement$$, $htmlElement$jscomp$2$$) {
    var $newHeight$jscomp$4$$ = this.$Ja$();
    $newHeight$jscomp$4$$ && (this.$W$ = null, _.$setStyle$$module$src$style$$($newHeight$jscomp$4$$, "paddingTop", "0"), this.$oa$(function() {
      _.$removeElement$$module$src$dom$$($newHeight$jscomp$4$$);
    }));
    void 0 !== $win$jscomp$140$$ && _.$setStyle$$module$src$style$$(this, "height", $win$jscomp$140$$, "px");
    void 0 !== $BaseCustomElement$$ && _.$setStyle$$module$src$style$$(this, "width", $BaseCustomElement$$, "px");
    $htmlElement$jscomp$2$$ && (null != $htmlElement$jscomp$2$$.top && _.$setStyle$$module$src$style$$(this, "marginTop", $htmlElement$jscomp$2$$.top, "px"), null != $htmlElement$jscomp$2$$.right && _.$setStyle$$module$src$style$$(this, "marginRight", $htmlElement$jscomp$2$$.right, "px"), null != $htmlElement$jscomp$2$$.bottom && _.$setStyle$$module$src$style$$(this, "marginBottom", $htmlElement$jscomp$2$$.bottom, "px"), null != $htmlElement$jscomp$2$$.left && _.$setStyle$$module$src$style$$(this, 
    "marginLeft", $htmlElement$jscomp$2$$.left, "px"));
    this.$Xa$() && this.$Za$();
    _.$JSCompiler_StaticMethods_signal$$(this.$G$, "change-size-end");
  };
  $BaseCustomElement$$.prototype.connectedCallback = function() {
    void 0 === $templateTagSupported$$module$src$custom_element$$ && ($templateTagSupported$$module$src$custom_element$$ = "content" in window.self.document.createElement("template"));
    $templateTagSupported$$module$src$custom_element$$ || void 0 !== this.$ba$ || (this.$ba$ = !!_.$closestByTag$$module$src$dom$$(this, "template"));
    if (!this.$ba$ && !this.$la$ && _.$isConnectedNode$$module$src$dom$$(this)) {
      this.$la$ = !0;
      this.$ha$ || (this.classList.add("i-amphtml-element"), this.classList.add("i-amphtml-notbuilt"), this.classList.add("amp-notbuilt"));
      if (!this.$ampdoc_$) {
        var $win$jscomp$140$$ = this.ownerDocument.defaultView, $BaseCustomElement$$ = _.$Services$$module$src$services$ampdocServiceFor$$($win$jscomp$140$$).$getAmpDoc$(this);
        this.$ampdoc_$ = $BaseCustomElement$$;
        var $htmlElement$jscomp$2$$ = this.tagName.toLowerCase();
        this.$F$ instanceof _.$ElementStub$$module$src$element_stub$$ && -1 == $BaseCustomElement$$.$D$.indexOf($htmlElement$jscomp$2$$) && _.$JSCompiler_StaticMethods_installExtensionForDoc$$(_.$Services$$module$src$services$extensionsFor$$($win$jscomp$140$$), $BaseCustomElement$$, $htmlElement$jscomp$2$$);
      }
      this.$ga$ || (this.$ga$ = _.$Services$$module$src$services$resourcesForDoc$$(this.$ampdoc_$));
      _.$isExperimentOn$$module$src$experiments$$(this.$ampdoc_$.$win$, "layers") && (this.$P$ || (this.$P$ = _.$getServiceForDoc$$module$src$service$$(this.$ampdoc_$, "layers")), this.$P$.add(this));
      this.$getResources$().add(this);
      if (this.$ha$) {
        ($win$jscomp$140$$ = this.$reconstructWhenReparented$()) && this.$Ea$(), this.$ea$() && $win$jscomp$140$$ && ($JSCompiler_StaticMethods_buildOrScheduleBuildForResource_$$(this.$getResources$(), _.$Resource$$module$src$service$resource$forElementOptional$$(this)), "Resources");
      } else {
        this.$ha$ = !0;
        try {
          var $completedLayoutAttr$jscomp$inline_1346$$ = this.getAttribute("i-amphtml-layout");
          if ($completedLayoutAttr$jscomp$inline_1346$$) {
            var $layout$124$jscomp$inline_1347$$ = $parseLayout$$module$src$layout$$($completedLayoutAttr$jscomp$inline_1346$$);
            "responsive" != $layout$124$jscomp$inline_1347$$ && "intrinsic" != $layout$124$jscomp$inline_1347$$ || !this.firstElementChild ? "nodisplay" == $layout$124$jscomp$inline_1347$$ && (_.$toggle$$module$src$style$$(this, !1), this.style.display = "") : this.$W$ = this.querySelector("i-amphtml-sizer") || void 0;
            var $JSCompiler_inline_result$jscomp$442$$ = $layout$124$jscomp$inline_1347$$;
          } else {
            var $layoutAttr$jscomp$inline_1348$$ = this.getAttribute("layout"), $widthAttr$jscomp$inline_1349$$ = this.getAttribute("width"), $heightAttr$jscomp$inline_1350$$ = this.getAttribute("height"), $sizesAttr$jscomp$inline_1351$$ = this.getAttribute("sizes"), $heightsAttr$jscomp$inline_1352$$ = this.getAttribute("heights"), $inputLayout$jscomp$inline_1353$$ = $layoutAttr$jscomp$inline_1348$$ ? $parseLayout$$module$src$layout$$($layoutAttr$jscomp$inline_1348$$) : null, $inputWidth$jscomp$inline_1354$$ = 
            $widthAttr$jscomp$inline_1349$$ && "auto" != $widthAttr$jscomp$inline_1349$$ ? _.$parseLength$$module$src$layout$$($widthAttr$jscomp$inline_1349$$) : $widthAttr$jscomp$inline_1349$$, $inputHeight$jscomp$inline_1355$$ = $heightAttr$jscomp$inline_1350$$ && "fluid" != $heightAttr$jscomp$inline_1350$$ ? _.$parseLength$$module$src$layout$$($heightAttr$jscomp$inline_1350$$) : $heightAttr$jscomp$inline_1350$$, $JSCompiler_temp$jscomp$5580$$;
            if (!($JSCompiler_temp$jscomp$5580$$ = $inputLayout$jscomp$inline_1353$$ && "fixed" != $inputLayout$jscomp$inline_1353$$ && "fixed-height" != $inputLayout$jscomp$inline_1353$$ || $inputWidth$jscomp$inline_1354$$ && $inputHeight$jscomp$inline_1355$$)) {
              var $tagName$jscomp$inline_5720$$ = this.tagName;
              $tagName$jscomp$inline_5720$$ = $tagName$jscomp$inline_5720$$.toUpperCase();
              $JSCompiler_temp$jscomp$5580$$ = void 0 === $naturalDimensions_$$module$src$layout$$[$tagName$jscomp$inline_5720$$];
            }
            if ($JSCompiler_temp$jscomp$5580$$) {
              var $width$jscomp$inline_1356$$ = $inputWidth$jscomp$inline_1354$$;
              var $height$jscomp$inline_1357$$ = $inputHeight$jscomp$inline_1355$$;
            } else {
              var $tagName$jscomp$inline_5723$$ = this.tagName.toUpperCase();
              if (!$naturalDimensions_$$module$src$layout$$[$tagName$jscomp$inline_5723$$]) {
                var $doc$jscomp$inline_5724$$ = this.ownerDocument, $naturalTagName$jscomp$inline_5725$$ = $tagName$jscomp$inline_5723$$.replace(/^AMP\-/, ""), $temp$jscomp$inline_5726$$ = $doc$jscomp$inline_5724$$.createElement($naturalTagName$jscomp$inline_5725$$);
                $temp$jscomp$inline_5726$$.controls = !0;
                _.$setStyles$$module$src$style$$($temp$jscomp$inline_5726$$, {position:"absolute", visibility:"hidden"});
                $doc$jscomp$inline_5724$$.body.appendChild($temp$jscomp$inline_5726$$);
                $naturalDimensions_$$module$src$layout$$[$tagName$jscomp$inline_5723$$] = {width:($temp$jscomp$inline_5726$$.offsetWidth || 1) + "px", height:($temp$jscomp$inline_5726$$.offsetHeight || 1) + "px"};
                $doc$jscomp$inline_5724$$.body.removeChild($temp$jscomp$inline_5726$$);
              }
              var $JSCompiler_inline_result$jscomp$5582$$ = $naturalDimensions_$$module$src$layout$$[$tagName$jscomp$inline_5723$$];
              $width$jscomp$inline_1356$$ = $inputWidth$jscomp$inline_1354$$ || "fixed-height" == $inputLayout$jscomp$inline_1353$$ ? $inputWidth$jscomp$inline_1354$$ : $JSCompiler_inline_result$jscomp$5582$$.width;
              $height$jscomp$inline_1357$$ = $inputHeight$jscomp$inline_1355$$ || $JSCompiler_inline_result$jscomp$5582$$.height;
            }
            var $layout$jscomp$inline_1358$$ = $inputLayout$jscomp$inline_1353$$ ? $inputLayout$jscomp$inline_1353$$ : $width$jscomp$inline_1356$$ || $height$jscomp$inline_1357$$ ? "fluid" == $height$jscomp$inline_1357$$ ? "fluid" : !$height$jscomp$inline_1357$$ || $width$jscomp$inline_1356$$ && "auto" != $width$jscomp$inline_1356$$ ? $height$jscomp$inline_1357$$ && $width$jscomp$inline_1356$$ && ($sizesAttr$jscomp$inline_1351$$ || $heightsAttr$jscomp$inline_1352$$) ? "responsive" : "fixed" : "fixed-height" : 
            "container";
            this.classList.add("i-amphtml-layout-" + $layout$jscomp$inline_1358$$);
            _.$isLayoutSizeDefined$$module$src$layout$$($layout$jscomp$inline_1358$$) && this.classList.add("i-amphtml-layout-size-defined");
            if ("nodisplay" == $layout$jscomp$inline_1358$$) {
              _.$toggle$$module$src$style$$(this, !1), this.style.display = "";
            } else {
              if ("fixed" == $layout$jscomp$inline_1358$$) {
                _.$setStyles$$module$src$style$$(this, {width:$width$jscomp$inline_1356$$, height:$height$jscomp$inline_1357$$});
              } else {
                if ("fixed-height" == $layout$jscomp$inline_1358$$) {
                  _.$setStyle$$module$src$style$$(this, "height", $height$jscomp$inline_1357$$);
                } else {
                  if ("responsive" == $layout$jscomp$inline_1358$$) {
                    var $sizer$jscomp$inline_1360$$ = this.ownerDocument.createElement("i-amphtml-sizer");
                    _.$setStyles$$module$src$style$$($sizer$jscomp$inline_1360$$, {paddingTop:_.$getLengthNumeral$$module$src$layout$$($height$jscomp$inline_1357$$) / _.$getLengthNumeral$$module$src$layout$$($width$jscomp$inline_1356$$) * 100 + "%"});
                    this.insertBefore($sizer$jscomp$inline_1360$$, this.firstChild);
                    this.$W$ = $sizer$jscomp$inline_1360$$;
                  } else {
                    if ("intrinsic" == $layout$jscomp$inline_1358$$) {
                      var $sizer$125$jscomp$inline_1361$$ = _.$htmlFor$$module$src$static_template$$(this)($_template$$module$src$layout$$);
                      $sizer$125$jscomp$inline_1361$$.firstElementChild.setAttribute("src", 'data:image/svg+xml;charset=utf-8,<svg height="' + $height$jscomp$inline_1357$$ + '" width="' + $width$jscomp$inline_1356$$ + '" xmlns="http://www.w3.org/2000/svg" version="1.1"/>');
                      this.insertBefore($sizer$125$jscomp$inline_1361$$, this.firstChild);
                      this.$W$ = $sizer$125$jscomp$inline_1361$$;
                    } else {
                      "fill" != $layout$jscomp$inline_1358$$ && "container" != $layout$jscomp$inline_1358$$ && ("flex-item" == $layout$jscomp$inline_1358$$ ? ($width$jscomp$inline_1356$$ && _.$setStyle$$module$src$style$$(this, "width", $width$jscomp$inline_1356$$), $height$jscomp$inline_1357$$ && _.$setStyle$$module$src$style$$(this, "height", $height$jscomp$inline_1357$$)) : "fluid" == $layout$jscomp$inline_1358$$ && (this.classList.add("i-amphtml-layout-awaiting-size"), $width$jscomp$inline_1356$$ && 
                      _.$setStyle$$module$src$style$$(this, "width", $width$jscomp$inline_1356$$), _.$setStyle$$module$src$style$$(this, "height", 0)));
                    }
                  }
                }
              }
            }
            $JSCompiler_inline_result$jscomp$442$$ = $layout$jscomp$inline_1358$$;
          }
          this.$layout_$ = $JSCompiler_inline_result$jscomp$442$$;
        } catch ($e$jscomp$56$$) {
          _.$reportError$$module$src$error$$($e$jscomp$56$$, this);
        }
        this.$F$ instanceof _.$ElementStub$$module$src$element_stub$$ || this.$Oa$();
        this.$ea$() || (this.classList.add("amp-unresolved"), this.classList.add("i-amphtml-unresolved"));
      }
    }
  };
  $BaseCustomElement$$.prototype.$Xa$ = function() {
    return this.classList.contains("i-amphtml-layout-awaiting-size");
  };
  $BaseCustomElement$$.prototype.$Za$ = function() {
    this.classList.remove("i-amphtml-layout-awaiting-size");
  };
  $BaseCustomElement$$.prototype.attachedCallback = function() {
    this.connectedCallback();
  };
  $BaseCustomElement$$.prototype.$Oa$ = function() {
    var $BaseCustomElement$$ = this, $htmlElement$jscomp$2$$ = this.$F$;
    if (1 == this.$aa$) {
      this.$aa$ = 4;
      var $startTime$jscomp$8$$ = $win$jscomp$140$$.Date.now(), $res$jscomp$10$$ = $htmlElement$jscomp$2$$.$upgradeCallback$();
      $res$jscomp$10$$ ? "function" == typeof $res$jscomp$10$$.then ? $res$jscomp$10$$.then(function($win$jscomp$140$$) {
        $BaseCustomElement$$.$va$($win$jscomp$140$$ || $htmlElement$jscomp$2$$, $startTime$jscomp$8$$);
      }).catch(function($win$jscomp$140$$) {
        $BaseCustomElement$$.$aa$ = 3;
        _.$rethrowAsync$$module$src$log$$($win$jscomp$140$$);
      }) : this.$va$($res$jscomp$10$$, $startTime$jscomp$8$$) : this.$va$($htmlElement$jscomp$2$$, $startTime$jscomp$8$$);
    }
  };
  $BaseCustomElement$$.prototype.disconnectedCallback = function() {
    this.disconnect(!1);
  };
  $BaseCustomElement$$.prototype.detachedCallback = function() {
    this.disconnectedCallback();
  };
  $BaseCustomElement$$.prototype.disconnect = function($win$jscomp$140$$) {
    this.$ba$ || !this.$la$ || !$win$jscomp$140$$ && _.$isConnectedNode$$module$src$dom$$(this) || ($win$jscomp$140$$ && this.classList.remove("i-amphtml-element"), this.$la$ = !1, this.$getResources$().remove(this), _.$isExperimentOn$$module$src$experiments$$(this.$ampdoc_$.$win$, "layers") && this.$P$.remove(this), this.$F$.detachedCallback());
  };
  $BaseCustomElement$$.prototype.$D$ = function($win$jscomp$140$$, $BaseCustomElement$$) {
    $BaseCustomElement$$ = $BaseCustomElement$$ || {};
    var $htmlElement$jscomp$2$$ = this.ownerDocument.createEvent("Event");
    $htmlElement$jscomp$2$$.data = $BaseCustomElement$$;
    $htmlElement$jscomp$2$$.initEvent($win$jscomp$140$$, !0, !0);
    this.dispatchEvent($htmlElement$jscomp$2$$);
  };
  $BaseCustomElement$$.prototype.$prerenderAllowed$ = function() {
    return this.$F$.$prerenderAllowed$();
  };
  $BaseCustomElement$$.prototype.$Ra$ = function() {
    return this.$F$.$createPlaceholderCallback$();
  };
  $BaseCustomElement$$.prototype.$renderOutsideViewport$ = function() {
    return this.$F$.$renderOutsideViewport$();
  };
  $BaseCustomElement$$.prototype.$idleRenderOutsideViewport$ = function() {
    return this.$F$.$idleRenderOutsideViewport$();
  };
  $BaseCustomElement$$.prototype.$getLayoutBox$ = function() {
    return _.$Resource$$module$src$service$resource$forElementOptional$$(this).$getLayoutBox$();
  };
  $BaseCustomElement$$.prototype.$getPageLayoutBox$ = function() {
    return _.$Resource$$module$src$service$resource$forElementOptional$$(this).$getPageLayoutBox$();
  };
  $BaseCustomElement$$.prototype.$getOwner$ = function() {
    return _.$Resource$$module$src$service$resource$forElementOptional$$(this).$getOwner$();
  };
  $BaseCustomElement$$.prototype.$I$ = function() {
    var $win$jscomp$140$$ = this.$F$.$getIntersectionElementLayoutBox$(), $BaseCustomElement$$ = _.$Resource$$module$src$service$resource$forElementOptional$$(this).$getOwner$(), $htmlElement$jscomp$2$$ = _.$JSCompiler_StaticMethods_getRect$$(this.$F$.$getViewport$());
    $BaseCustomElement$$ = $BaseCustomElement$$ && $BaseCustomElement$$.$getLayoutBox$();
    $BaseCustomElement$$ = _.$rectIntersection$$module$src$layout_rect$$($win$jscomp$140$$, $BaseCustomElement$$, $htmlElement$jscomp$2$$) || _.$layoutRectLtwh$$module$src$layout_rect$$(0, 0, 0, 0);
    return _.$calculateChangeEntry$$module$src$intersection_observer_polyfill$$($win$jscomp$140$$, $htmlElement$jscomp$2$$, $BaseCustomElement$$, _.$intersectionRatio$$module$src$intersection_observer_polyfill$$($BaseCustomElement$$, $win$jscomp$140$$));
  };
  $BaseCustomElement$$.prototype.$ia$ = function() {
    return _.$Resource$$module$src$service$resource$forElementOptional$$(this).$ea$;
  };
  $BaseCustomElement$$.prototype.$Wa$ = function() {
    return _.$Resource$$module$src$service$resource$forElementOptional$$(this).$state_$;
  };
  $BaseCustomElement$$.prototype.$isRelayoutNeeded$ = function() {
    return this.$F$.$isRelayoutNeeded$();
  };
  $BaseCustomElement$$.prototype.$getImpl$ = function() {
    var $win$jscomp$140$$ = this;
    return this.$K$().then(function() {
      return $win$jscomp$140$$.$F$;
    });
  };
  $BaseCustomElement$$.prototype.$getLayout$ = function() {
    return this.$layout_$;
  };
  $BaseCustomElement$$.prototype.$layoutCallback$ = function() {
    var $win$jscomp$140$$ = this, $BaseCustomElement$$ = 0 == this.$R$;
    this.$G$.reset("unload");
    $BaseCustomElement$$ && _.$JSCompiler_StaticMethods_signal$$(this.$G$, "load-start");
    this.$La$ && this.$Ia$().$startLayout$();
    var $htmlElement$jscomp$2$$ = _.$tryResolve$$module$src$utils$promise$$(function() {
      return $win$jscomp$140$$.$F$.$layoutCallback$();
    });
    this.$preconnect$(!0);
    this.classList.add("i-amphtml-layout");
    return $htmlElement$jscomp$2$$.then(function() {
      $BaseCustomElement$$ && _.$JSCompiler_StaticMethods_signal$$($win$jscomp$140$$.$G$, "load-end");
      $win$jscomp$140$$.readyState = "complete";
      $win$jscomp$140$$.$R$++;
      $win$jscomp$140$$.$toggleLoading$(!1, {$cleanup$:!0});
      $win$jscomp$140$$.$wa$ || ($win$jscomp$140$$.$F$.$firstLayoutCompleted$(), $win$jscomp$140$$.$wa$ = !0);
    }, function($htmlElement$jscomp$2$$) {
      $BaseCustomElement$$ && $JSCompiler_StaticMethods_rejectSignal$$($win$jscomp$140$$.$G$, "load-end", $htmlElement$jscomp$2$$);
      $win$jscomp$140$$.$R$++;
      $win$jscomp$140$$.$toggleLoading$(!1, {$cleanup$:!0});
      throw $htmlElement$jscomp$2$$;
    });
  };
  $BaseCustomElement$$.prototype.$isInViewport$ = function() {
    return this.$Y$;
  };
  $BaseCustomElement$$.prototype.$viewportCallback$ = function($win$jscomp$140$$) {
    var $BaseCustomElement$$ = this;
    $win$jscomp$140$$ != this.$Y$ && this.ownerDocument && this.ownerDocument.defaultView && (this.$Y$ = $win$jscomp$140$$, 0 == this.$R$ && ($win$jscomp$140$$ ? _.$Services$$module$src$services$timerFor$$(this.ownerDocument.defaultView).delay(function() {
      $BaseCustomElement$$.$Y$ && $BaseCustomElement$$.ownerDocument && $BaseCustomElement$$.ownerDocument.defaultView && $BaseCustomElement$$.$toggleLoading$(!0);
    }, 100) : this.$toggleLoading$(!1)), this.$O$ && this.$Fa$($win$jscomp$140$$));
  };
  $BaseCustomElement$$.prototype.$Fa$ = function($win$jscomp$140$$) {
    this.$F$.$inViewport_$ = $win$jscomp$140$$;
    this.$F$.$viewportCallback$($win$jscomp$140$$);
    $win$jscomp$140$$ && this.$La$ && ($win$jscomp$140$$ = this.$Ia$(), $win$jscomp$140$$.$label_$ && !$win$jscomp$140$$.$F$ && ($win$jscomp$140$$.$F$ = $win$jscomp$140$$.$I$.Date.now(), $JSCompiler_StaticMethods_tryMeasureDelay_$$($win$jscomp$140$$)));
  };
  $BaseCustomElement$$.prototype.$pauseCallback$ = function() {
    this.$fa$ || (this.$fa$ = !0, this.$viewportCallback$(!1), this.$O$ && this.$F$.$pauseCallback$());
  };
  $BaseCustomElement$$.prototype.$resumeCallback$ = function() {
    this.$fa$ && (this.$fa$ = !1, this.$O$ && this.$F$.$resumeCallback$());
  };
  $BaseCustomElement$$.prototype.$unlayoutCallback$ = function() {
    if (!this.$O$) {
      return !1;
    }
    _.$JSCompiler_StaticMethods_signal$$(this.$G$, "unload");
    var $win$jscomp$140$$ = this.$F$.$unlayoutCallback$();
    $win$jscomp$140$$ && this.$Ea$();
    return $win$jscomp$140$$;
  };
  $BaseCustomElement$$.prototype.$Ea$ = function() {
    this.$R$ = 0;
    this.$wa$ = !1;
    this.$G$.reset("render-start");
    this.$G$.reset("load-start");
    this.$G$.reset("load-end");
    this.$G$.reset("ini-load");
    this.$G$.reset("change-size-end");
  };
  $BaseCustomElement$$.prototype.$unlayoutOnPause$ = function() {
    return this.$F$.$unlayoutOnPause$();
  };
  $BaseCustomElement$$.prototype.$reconstructWhenReparented$ = function() {
    return this.$F$.$reconstructWhenReparented$();
  };
  $BaseCustomElement$$.prototype.collapse = function() {
    this.$F$.collapse();
  };
  $BaseCustomElement$$.prototype.$collapsedCallback$ = function($win$jscomp$140$$) {
    this.$F$.$collapsedCallback$($win$jscomp$140$$);
  };
  $BaseCustomElement$$.prototype.expand = function() {
    this.$F$.expand();
  };
  $BaseCustomElement$$.prototype.$mutatedAttributesCallback$ = function($win$jscomp$140$$) {
    this.$F$.$mutatedAttributesCallback$($win$jscomp$140$$);
  };
  $BaseCustomElement$$.prototype.$Ga$ = function($win$jscomp$140$$) {
    this.$O$ ? this.$Ha$($win$jscomp$140$$) : (void 0 === this.$V$ && (this.$V$ = []), this.$V$.push($win$jscomp$140$$));
  };
  $BaseCustomElement$$.prototype.$Ua$ = function() {
    var $win$jscomp$140$$ = this;
    if (this.$V$) {
      var $BaseCustomElement$$ = this.$V$;
      this.$V$ = null;
      $BaseCustomElement$$.forEach(function($BaseCustomElement$$) {
        $win$jscomp$140$$.$Ha$($BaseCustomElement$$);
      });
    }
  };
  $BaseCustomElement$$.prototype.$Ha$ = function($win$jscomp$140$$) {
    try {
      this.$F$.$executeAction$($win$jscomp$140$$);
    } catch ($e$jscomp$57$$) {
      _.$rethrowAsync$$module$src$log$$("Action execution failed:", $e$jscomp$57$$, $win$jscomp$140$$.node.tagName, $win$jscomp$140$$.method);
    }
  };
  $BaseCustomElement$$.prototype.$Va$ = function() {
    var $win$jscomp$140$$ = this.getAttribute("data-block-on-consent");
    if (null === $win$jscomp$140$$) {
      if ($win$jscomp$140$$ = this.$getAmpDoc$(), ($win$jscomp$140$$ = _.$Services$$module$src$services$documentInfoForDoc$$($win$jscomp$140$$).$metaTags$["amp-consent-blocking"]) ? "string" !== typeof $win$jscomp$140$$ ? (_.$user$$module$src$log$$().error("CONSENT", "Invalid amp-consent-blocking value, ignore meta tag"), $win$jscomp$140$$ = !1) : ($win$jscomp$140$$ = $win$jscomp$140$$.toUpperCase().replace(/\s/g, "").split(","), $win$jscomp$140$$ = $win$jscomp$140$$.includes(this.tagName) ? !0 : 
      !1) : $win$jscomp$140$$ = !1, $win$jscomp$140$$) {
        $win$jscomp$140$$ = "default", this.setAttribute("data-block-on-consent", $win$jscomp$140$$);
      } else {
        return null;
      }
    }
    return "" == $win$jscomp$140$$ || "default" == $win$jscomp$140$$ ? this.$F$.$getConsentPolicy$() : $win$jscomp$140$$;
  };
  $BaseCustomElement$$.prototype.$getRealChildNodes$ = function() {
    return $childNodes$$module$src$dom$$(this, function($win$jscomp$140$$) {
      return !$isInternalOrServiceNode$$module$src$custom_element$$($win$jscomp$140$$);
    });
  };
  $BaseCustomElement$$.prototype.$getRealChildren$ = function() {
    return _.$childElements$$module$src$dom$$(this, function($win$jscomp$140$$) {
      return !$isInternalOrServiceNode$$module$src$custom_element$$($win$jscomp$140$$);
    });
  };
  $BaseCustomElement$$.prototype.$getPlaceholder$ = function() {
    return $lastChildElement$$module$src$dom$$(this, function($win$jscomp$140$$) {
      return $win$jscomp$140$$.hasAttribute("placeholder") && !("placeholder" in $win$jscomp$140$$);
    });
  };
  $BaseCustomElement$$.prototype.$togglePlaceholder$ = function($win$jscomp$140$$) {
    if ($win$jscomp$140$$) {
      ($win$jscomp$140$$ = this.$getPlaceholder$()) && $win$jscomp$140$$.classList.remove("amp-hidden");
    } else {
      $win$jscomp$140$$ = _.$scopedQuerySelectorAll$$module$src$dom$$(this, "> [placeholder]");
      for (var $BaseCustomElement$$ = 0; $BaseCustomElement$$ < $win$jscomp$140$$.length; $BaseCustomElement$$++) {
        "placeholder" in $win$jscomp$140$$[$BaseCustomElement$$] || $win$jscomp$140$$[$BaseCustomElement$$].classList.add("amp-hidden");
      }
    }
  };
  $BaseCustomElement$$.prototype.$getFallback$ = function() {
    return _.$childElementByAttr$$module$src$dom$$(this, "fallback");
  };
  $BaseCustomElement$$.prototype.$toggleFallback$ = function($win$jscomp$140$$) {
    var $BaseCustomElement$$ = this.$Wa$();
    if (!$win$jscomp$140$$ || 0 != $BaseCustomElement$$ && 1 != $BaseCustomElement$$ && 2 != $BaseCustomElement$$) {
      this.classList.toggle("amp-notsupported", $win$jscomp$140$$), 1 == $win$jscomp$140$$ && ($win$jscomp$140$$ = this.$getFallback$()) && this.$getResources$().$scheduleLayout$(this, $win$jscomp$140$$);
    }
  };
  $BaseCustomElement$$.prototype.$renderStarted$ = function() {
    _.$JSCompiler_StaticMethods_signal$$(this.$G$, "render-start");
    this.$togglePlaceholder$(!1);
    this.$toggleLoading$(!1);
  };
  $BaseCustomElement$$.prototype.$ma$ = function() {
    if (this.$Ya$()) {
      return !1;
    }
    void 0 === this.$ya$ && (this.$ya$ = this.hasAttribute("noloading"));
    var $win$jscomp$140$$;
    ($win$jscomp$140$$ = this.$ya$) || ($win$jscomp$140$$ = this.tagName.toUpperCase(), $win$jscomp$140$$ = !("AMP-AD" == $win$jscomp$140$$ || "AMP-EMBED" == $win$jscomp$140$$ || $LOADING_ELEMENTS_$$module$src$layout$$[$win$jscomp$140$$]));
    return $win$jscomp$140$$ || 100 > this.$layoutWidth_$ || 0 < this.$R$ || $isInternalOrServiceNode$$module$src$custom_element$$(this) || !_.$isLayoutSizeDefined$$module$src$layout$$(this.$layout_$) ? !1 : !0;
  };
  $BaseCustomElement$$.prototype.$Ya$ = function() {
    return this.$ampdoc_$ && this.$ampdoc_$.$win$ != this.ownerDocument.defaultView || "inabox" == _.$getMode$$module$src$mode$$().runtime;
  };
  $BaseCustomElement$$.prototype.$Ma$ = function() {
    if (this.$ma$() && !this.$U$) {
      var $win$jscomp$140$$ = this.ownerDocument, $BaseCustomElement$$ = _.$htmlFor$$module$src$static_template$$($win$jscomp$140$$)($_template$$module$src$custom_element$$), $htmlElement$jscomp$2$$ = this.$elementName$();
      $win$jscomp$140$$ = $LINE_LOADER_ELEMENTS$$module$src$loader$$[$htmlElement$jscomp$2$$.toUpperCase()] ? _.$htmlFor$$module$src$static_template$$($win$jscomp$140$$)($_template$$module$src$loader$$) : _.$htmlFor$$module$src$static_template$$($win$jscomp$140$$)($_template2$$module$src$loader$$);
      $BaseCustomElement$$.appendChild($win$jscomp$140$$);
      this.appendChild($BaseCustomElement$$);
      this.$U$ = $BaseCustomElement$$;
      this.$za$ = $win$jscomp$140$$;
    }
  };
  $BaseCustomElement$$.prototype.$toggleLoading$ = function($win$jscomp$140$$, $BaseCustomElement$$) {
    var $htmlElement$jscomp$2$$ = this, $state$jscomp$7$$ = $BaseCustomElement$$ && $BaseCustomElement$$.$cleanup$, $opt_options$jscomp$79$$ = $BaseCustomElement$$ && $BaseCustomElement$$.force;
    if (!$win$jscomp$140$$ || this.$F$.$isLoadingReused$() || !(0 < this.$R$ || this.$G$.get("render-start"))) {
      if ((this.$Aa$ = $win$jscomp$140$$) || this.$U$) {
        !$win$jscomp$140$$ || $opt_options$jscomp$79$$ || this.$ma$() ? this.$oa$(function() {
          var $win$jscomp$140$$ = $htmlElement$jscomp$2$$.$Aa$;
          !$win$jscomp$140$$ || $opt_options$jscomp$79$$ || $htmlElement$jscomp$2$$.$ma$() || ($win$jscomp$140$$ = !1);
          $win$jscomp$140$$ && $htmlElement$jscomp$2$$.$Ma$();
          if ($htmlElement$jscomp$2$$.$U$ && ($htmlElement$jscomp$2$$.$U$.classList.toggle("amp-hidden", !$win$jscomp$140$$), $htmlElement$jscomp$2$$.$za$.classList.toggle("amp-active", $win$jscomp$140$$), !$win$jscomp$140$$ && $state$jscomp$7$$ && !$htmlElement$jscomp$2$$.$F$.$isLoadingReused$())) {
            var $BaseCustomElement$$ = $htmlElement$jscomp$2$$.$U$;
            $htmlElement$jscomp$2$$.$U$ = null;
            $htmlElement$jscomp$2$$.$za$ = null;
            $htmlElement$jscomp$2$$.$oa$(function() {
              _.$removeElement$$module$src$dom$$($BaseCustomElement$$);
            });
          }
        }) : this.$Aa$ = !1;
      }
    }
  };
  $BaseCustomElement$$.prototype.$Ia$ = function() {
    this.$xa$ || (this.$xa$ = new $LayoutDelayMeter$$module$src$layout_delay_meter$$(this.ownerDocument.defaultView, this.$getLayoutPriority$()));
    return this.$xa$;
  };
  $BaseCustomElement$$.prototype.$getOverflowElement$ = function() {
    void 0 === this.$J$ && (this.$J$ = _.$childElementByAttr$$module$src$dom$$(this, "overflow")) && (this.$J$.hasAttribute("tabindex") || this.$J$.setAttribute("tabindex", "0"), this.$J$.hasAttribute("role") || this.$J$.setAttribute("role", "button"));
    return this.$J$;
  };
  $BaseCustomElement$$.prototype.$Da$ = function($win$jscomp$140$$, $BaseCustomElement$$, $htmlElement$jscomp$2$$) {
    var $overflown$jscomp$1$$ = this;
    this.$getOverflowElement$();
    this.$J$ ? (this.$J$.classList.toggle("amp-visible", $win$jscomp$140$$), $win$jscomp$140$$ ? this.$J$.onclick = function() {
      var $win$jscomp$140$$ = $overflown$jscomp$1$$.$getResources$();
      $win$jscomp$140$$.$changeSize$($overflown$jscomp$1$$, $BaseCustomElement$$, $htmlElement$jscomp$2$$);
      $win$jscomp$140$$.$mutateElement$($overflown$jscomp$1$$, function() {
        $overflown$jscomp$1$$.$Da$(!1, $BaseCustomElement$$, $htmlElement$jscomp$2$$);
      });
    } : this.$J$.onclick = null) : $win$jscomp$140$$ && this.$Pa$ && _.$user$$module$src$log$$().$Log$$module$src$log_prototype$warn$("CustomElement", "Cannot resize element and overflow is not available", this);
  };
  $BaseCustomElement$$.prototype.$oa$ = function($win$jscomp$140$$) {
    this.$ga$ ? this.$getResources$().$mutateElement$(this, $win$jscomp$140$$) : $win$jscomp$140$$();
  };
  $win$jscomp$140$$.$BaseCustomElementClass$ = $BaseCustomElement$$;
  return $win$jscomp$140$$.$BaseCustomElementClass$;
};
$isInternalOrServiceNode$$module$src$custom_element$$ = function($node$jscomp$37$$) {
  var $tagName$jscomp$inline_1381$$ = "string" == typeof $node$jscomp$37$$ ? $node$jscomp$37$$ : $node$jscomp$37$$.tagName;
  return $tagName$jscomp$inline_1381$$ && _.$startsWith$$module$src$string$$($tagName$jscomp$inline_1381$$.toLowerCase(), "i-") || $node$jscomp$37$$.tagName && ($node$jscomp$37$$.hasAttribute("placeholder") || $node$jscomp$37$$.hasAttribute("fallback") || $node$jscomp$37$$.hasAttribute("overflow")) ? !0 : !1;
};
_.$getExtendedElements$$module$src$service$custom_element_registry$$ = function($win$jscomp$142$$) {
  $win$jscomp$142$$.$ampExtendedElements$ || ($win$jscomp$142$$.$ampExtendedElements$ = {});
  return $win$jscomp$142$$.$ampExtendedElements$;
};
_.$upgradeOrRegisterElement$$module$src$service$custom_element_registry$$ = function($win$jscomp$143$$, $name$jscomp$121$$, $toClass$$) {
  var $i$jscomp$84_knownElements$$ = _.$getExtendedElements$$module$src$service$custom_element_registry$$($win$jscomp$143$$);
  if (!$i$jscomp$84_knownElements$$[$name$jscomp$121$$]) {
    _.$registerElement$$module$src$service$custom_element_registry$$($win$jscomp$143$$, $name$jscomp$121$$, $toClass$$);
  } else {
    if ($i$jscomp$84_knownElements$$[$name$jscomp$121$$] != $toClass$$) {
      for ($i$jscomp$84_knownElements$$[$name$jscomp$121$$] = $toClass$$, $i$jscomp$84_knownElements$$ = 0; $i$jscomp$84_knownElements$$ < $stubbedElements$$module$src$element_stub$$.length; $i$jscomp$84_knownElements$$++) {
        var $element$jscomp$114$$ = $stubbedElements$$module$src$element_stub$$[$i$jscomp$84_knownElements$$].element;
        if ($element$jscomp$114$$.tagName.toLowerCase() == $name$jscomp$121$$ && $element$jscomp$114$$.ownerDocument.defaultView == $win$jscomp$143$$) {
          try {
            $element$jscomp$114$$.$BaseCustomElement_prototype$upgrade$($toClass$$);
          } catch ($e$jscomp$inline_1385$$) {
            _.$reportError$$module$src$error$$($e$jscomp$inline_1385$$, $element$jscomp$114$$);
          }
          $stubbedElements$$module$src$element_stub$$.splice($i$jscomp$84_knownElements$$--, 1);
        }
      }
    }
  }
};
_.$stubElementsForDoc$$module$src$service$custom_element_registry$$ = function($ampdoc$jscomp$29$$) {
  $extensionScriptsInNode$$module$src$element_service$$($ampdoc$jscomp$29$$.$getHeadNode$()).forEach(function($name$jscomp$122$$) {
    -1 != $ampdoc$jscomp$29$$.$D$.indexOf($name$jscomp$122$$) || $ampdoc$jscomp$29$$.$D$.push($name$jscomp$122$$);
    _.$stubElementIfNotKnown$$module$src$service$custom_element_registry$$($ampdoc$jscomp$29$$.$win$, $name$jscomp$122$$);
  });
};
_.$stubElementIfNotKnown$$module$src$service$custom_element_registry$$ = function($win$jscomp$144$$, $name$jscomp$123$$) {
  _.$getExtendedElements$$module$src$service$custom_element_registry$$($win$jscomp$144$$)[$name$jscomp$123$$] || _.$registerElement$$module$src$service$custom_element_registry$$($win$jscomp$144$$, $name$jscomp$123$$, _.$ElementStub$$module$src$element_stub$$);
};
_.$registerElement$$module$src$service$custom_element_registry$$ = function($win$jscomp$145$$, $name$jscomp$125$$, $implementationClass_klass$jscomp$1$$) {
  _.$getExtendedElements$$module$src$service$custom_element_registry$$($win$jscomp$145$$)[$name$jscomp$125$$] = $implementationClass_klass$jscomp$1$$;
  $implementationClass_klass$jscomp$1$$ = $createCustomElementClass$$module$src$custom_element$$($win$jscomp$145$$, $name$jscomp$125$$);
  "customElements" in $win$jscomp$145$$ ? $win$jscomp$145$$.customElements.define($name$jscomp$125$$, $implementationClass_klass$jscomp$1$$) : $win$jscomp$145$$.document.registerElement($name$jscomp$125$$, {prototype:$implementationClass_klass$jscomp$1$$.prototype});
};
$DocInfo$$module$src$service$document_info_impl$$ = function($ampdoc$jscomp$30$$) {
  this.$ampdoc_$ = $ampdoc$jscomp$30$$;
  this.$info_$ = null;
};
$getLinkRels$$module$src$service$document_info_impl$$ = function($doc$jscomp$26_links$$) {
  var $linkRels$jscomp$1$$ = _.$map$$module$src$utils$object$$();
  if ($doc$jscomp$26_links$$.head) {
    $doc$jscomp$26_links$$ = $doc$jscomp$26_links$$.head.querySelectorAll("link[rel]");
    for (var $$jscomp$loop$390$$ = {}, $i$jscomp$85$$ = 0; $i$jscomp$85$$ < $doc$jscomp$26_links$$.length; $$jscomp$loop$390$$ = {href:$$jscomp$loop$390$$.href}, $i$jscomp$85$$++) {
      var $link$jscomp$1_rels$$ = $doc$jscomp$26_links$$[$i$jscomp$85$$];
      $$jscomp$loop$390$$.href = $link$jscomp$1_rels$$.href;
      ($link$jscomp$1_rels$$ = $link$jscomp$1_rels$$.getAttribute("rel")) && $$jscomp$loop$390$$.href && $link$jscomp$1_rels$$.split(/\s+/).forEach(function($doc$jscomp$26_links$$) {
        return function($$jscomp$loop$390$$) {
          if (-1 == $filteredLinkRels$$module$src$service$document_info_impl$$.indexOf($$jscomp$loop$390$$)) {
            var $i$jscomp$85$$ = $linkRels$jscomp$1$$[$$jscomp$loop$390$$];
            $i$jscomp$85$$ ? (_.$isArray$$module$src$types$$($i$jscomp$85$$) || ($i$jscomp$85$$ = $linkRels$jscomp$1$$[$$jscomp$loop$390$$] = [$i$jscomp$85$$]), $i$jscomp$85$$.push($doc$jscomp$26_links$$.href)) : $linkRels$jscomp$1$$[$$jscomp$loop$390$$] = $doc$jscomp$26_links$$.href;
          }
        };
      }($$jscomp$loop$390$$));
    }
  }
  return $linkRels$jscomp$1$$;
};
$getMetaTags$$module$src$service$document_info_impl$$ = function($doc$jscomp$27_metas$$) {
  var $metaTags$jscomp$1$$ = _.$map$$module$src$utils$object$$();
  if ($doc$jscomp$27_metas$$.head) {
    $doc$jscomp$27_metas$$ = $doc$jscomp$27_metas$$.head.querySelectorAll("meta[name]");
    for (var $i$jscomp$86$$ = 0; $i$jscomp$86$$ < $doc$jscomp$27_metas$$.length; $i$jscomp$86$$++) {
      var $meta$jscomp$2_name$jscomp$126$$ = $doc$jscomp$27_metas$$[$i$jscomp$86$$], $content$jscomp$2$$ = $meta$jscomp$2_name$jscomp$126$$.getAttribute("content");
      if (($meta$jscomp$2_name$jscomp$126$$ = $meta$jscomp$2_name$jscomp$126$$.getAttribute("name")) && $content$jscomp$2$$) {
        var $value$jscomp$129$$ = $metaTags$jscomp$1$$[$meta$jscomp$2_name$jscomp$126$$];
        $value$jscomp$129$$ ? (_.$isArray$$module$src$types$$($value$jscomp$129$$) || ($value$jscomp$129$$ = $metaTags$jscomp$1$$[$meta$jscomp$2_name$jscomp$126$$] = [$value$jscomp$129$$]), $value$jscomp$129$$.push($content$jscomp$2$$)) : $metaTags$jscomp$1$$[$meta$jscomp$2_name$jscomp$126$$] = $content$jscomp$2$$;
      }
    }
  }
  return $metaTags$jscomp$1$$;
};
$getReplaceParams$$module$src$service$document_info_impl$$ = function($ampdoc$jscomp$32_replaceRaw_url$jscomp$63$$) {
  var $JSCompiler_temp$jscomp$424_url$jscomp$inline_1390$$;
  ($JSCompiler_temp$jscomp$424_url$jscomp$inline_1390$$ = !$ampdoc$jscomp$32_replaceRaw_url$jscomp$63$$.$isSingleDoc$()) || ($JSCompiler_temp$jscomp$424_url$jscomp$inline_1390$$ = $ampdoc$jscomp$32_replaceRaw_url$jscomp$63$$.$win$.location.href, "string" == typeof $JSCompiler_temp$jscomp$424_url$jscomp$inline_1390$$ && ($JSCompiler_temp$jscomp$424_url$jscomp$inline_1390$$ = _.$parseUrlDeprecated$$module$src$url$$($JSCompiler_temp$jscomp$424_url$jscomp$inline_1390$$)), $JSCompiler_temp$jscomp$424_url$jscomp$inline_1390$$ = 
  "a" != (_.$isProxyOrigin$$module$src$url$$($JSCompiler_temp$jscomp$424_url$jscomp$inline_1390$$) ? $JSCompiler_temp$jscomp$424_url$jscomp$inline_1390$$.pathname.split("/", 2)[1] : null));
  if ($JSCompiler_temp$jscomp$424_url$jscomp$inline_1390$$) {
    return null;
  }
  $ampdoc$jscomp$32_replaceRaw_url$jscomp$63$$ = _.$parseUrlDeprecated$$module$src$url$$($ampdoc$jscomp$32_replaceRaw_url$jscomp$63$$.$win$.location.href);
  $ampdoc$jscomp$32_replaceRaw_url$jscomp$63$$ = _.$parseQueryString_$$module$src$url_parse_query_string$$($ampdoc$jscomp$32_replaceRaw_url$jscomp$63$$.search).amp_r;
  return void 0 === $ampdoc$jscomp$32_replaceRaw_url$jscomp$63$$ ? null : _.$parseQueryString_$$module$src$url_parse_query_string$$($ampdoc$jscomp$32_replaceRaw_url$jscomp$63$$);
};
$DocumentState$$module$src$service$document_state$$ = function($vendorStop_win$jscomp$150$$) {
  this.$win$ = $vendorStop_win$jscomp$150$$;
  this.$document_$ = $vendorStop_win$jscomp$150$$.document;
  this.$D$ = _.$getVendorJsPropertyName$$module$src$style$$(this.$document_$, "hidden", !0);
  void 0 === this.$document_$[this.$D$] && (this.$D$ = null);
  this.$I$ = _.$getVendorJsPropertyName$$module$src$style$$(this.$document_$, "visibilityState", !0);
  void 0 === this.$document_$[this.$I$] && (this.$I$ = null);
  this.$G$ = new _.$Observable$$module$src$observable$$;
  this.$F$ = null;
  this.$D$ && (this.$F$ = "visibilitychange", $vendorStop_win$jscomp$150$$ = this.$D$.indexOf("Hidden"), -1 != $vendorStop_win$jscomp$150$$ && (this.$F$ = this.$D$.substring(0, $vendorStop_win$jscomp$150$$) + "Visibilitychange"));
  this.$K$ = this.$J$.bind(this);
  this.$F$ && this.$document_$.addEventListener(this.$F$, this.$K$);
};
_.$JSCompiler_StaticMethods_isHidden$$ = function($JSCompiler_StaticMethods_isHidden$self$$) {
  return $JSCompiler_StaticMethods_isHidden$self$$.$D$ ? $JSCompiler_StaticMethods_isHidden$self$$.$document_$[$JSCompiler_StaticMethods_isHidden$self$$.$D$] : !1;
};
_.$JSCompiler_StaticMethods_DocumentState$$module$src$service$document_state_prototype$onVisibilityChanged$$ = function($JSCompiler_StaticMethods_DocumentState$$module$src$service$document_state_prototype$onVisibilityChanged$self$$, $handler$jscomp$19$$) {
  $JSCompiler_StaticMethods_DocumentState$$module$src$service$document_state_prototype$onVisibilityChanged$self$$.$G$.add($handler$jscomp$19$$);
};
_.$guaranteeSrcForSrcsetUnsupportedBrowsers$$module$src$utils$img$$ = function($img$jscomp$2$$) {
  if (!$img$jscomp$2$$.hasAttribute("src") && 0 == "srcset" in $img$jscomp$2$$) {
    var $matches$jscomp$2_srcset$$ = $img$jscomp$2$$.getAttribute("srcset");
    $matches$jscomp$2_srcset$$ = /\S+/.exec($matches$jscomp$2_srcset$$);
    null != $matches$jscomp$2_srcset$$ && $img$jscomp$2$$.setAttribute("src", $matches$jscomp$2_srcset$$[0]);
  }
};
_.$AmpImg$$module$builtins$amp_img$$ = function($element$jscomp$116$$) {
  _.$BaseElement$$module$src$base_element$$.call(this, $element$jscomp$116$$);
  this.$prerenderAllowed_$ = this.$D$ = !0;
  this.$F$ = this.$G$ = this.$img_$ = null;
};
$JSCompiler_StaticMethods_hideFallbackImg_$$ = function($JSCompiler_StaticMethods_hideFallbackImg_$self$$) {
  !$JSCompiler_StaticMethods_hideFallbackImg_$self$$.$D$ && $JSCompiler_StaticMethods_hideFallbackImg_$self$$.$img_$.classList.contains("i-amphtml-ghost") && _.$JSCompiler_StaticMethods_getVsync$$($JSCompiler_StaticMethods_hideFallbackImg_$self$$).$mutate$(function() {
    $JSCompiler_StaticMethods_hideFallbackImg_$self$$.$img_$.classList.remove("i-amphtml-ghost");
    $JSCompiler_StaticMethods_hideFallbackImg_$self$$.$toggleFallback$(!1);
  });
};
$JSCompiler_StaticMethods_onImgLoadingError_$$ = function($JSCompiler_StaticMethods_onImgLoadingError_$self$$) {
  $JSCompiler_StaticMethods_onImgLoadingError_$self$$.$D$ && (_.$JSCompiler_StaticMethods_getVsync$$($JSCompiler_StaticMethods_onImgLoadingError_$self$$).$mutate$(function() {
    $JSCompiler_StaticMethods_onImgLoadingError_$self$$.$img_$.classList.add("i-amphtml-ghost");
    $JSCompiler_StaticMethods_onImgLoadingError_$self$$.$toggleFallback$(!0);
    $JSCompiler_StaticMethods_onImgLoadingError_$self$$.$togglePlaceholder$(!1);
  }), $JSCompiler_StaticMethods_onImgLoadingError_$self$$.$D$ = !1);
};
$AmpLayout$$module$builtins$amp_layout$$ = function($var_args$jscomp$60$$) {
  _.$BaseElement$$module$src$base_element$$.apply(this, arguments);
};
_.$createPixel$$module$src$pixel$$ = function($JSCompiler_temp$jscomp$474_win$jscomp$153$$, $src$jscomp$3$$, $iframe$jscomp$inline_1396_referrerPolicy$$) {
  $iframe$jscomp$inline_1396_referrerPolicy$$ && "no-referrer" !== $iframe$jscomp$inline_1396_referrerPolicy$$ && _.$user$$module$src$log$$().error("pixel", "Unsupported referrerPolicy: %s", $iframe$jscomp$inline_1396_referrerPolicy$$);
  "no-referrer" === $iframe$jscomp$inline_1396_referrerPolicy$$ ? "referrerPolicy" in window.Image.prototype ? $JSCompiler_temp$jscomp$474_win$jscomp$153$$ = $createImagePixel$$module$src$pixel$$($JSCompiler_temp$jscomp$474_win$jscomp$153$$, $src$jscomp$3$$, !0) : ($iframe$jscomp$inline_1396_referrerPolicy$$ = _.$createElementWithAttributes$$module$src$dom$$($JSCompiler_temp$jscomp$474_win$jscomp$153$$.document, "iframe", _.$dict$$module$src$utils$object$$({src:"about:blank", style:"display:none"})), 
  $JSCompiler_temp$jscomp$474_win$jscomp$153$$.document.body.appendChild($iframe$jscomp$inline_1396_referrerPolicy$$), $createImagePixel$$module$src$pixel$$($iframe$jscomp$inline_1396_referrerPolicy$$.contentWindow, $src$jscomp$3$$), $JSCompiler_temp$jscomp$474_win$jscomp$153$$ = $iframe$jscomp$inline_1396_referrerPolicy$$) : $JSCompiler_temp$jscomp$474_win$jscomp$153$$ = $createImagePixel$$module$src$pixel$$($JSCompiler_temp$jscomp$474_win$jscomp$153$$, $src$jscomp$3$$);
  return $JSCompiler_temp$jscomp$474_win$jscomp$153$$;
};
$createImagePixel$$module$src$pixel$$ = function($image$jscomp$2_win$jscomp$155$$, $src$jscomp$5$$, $noReferrer$$) {
  $noReferrer$$ = void 0 === $noReferrer$$ ? !1 : $noReferrer$$;
  $image$jscomp$2_win$jscomp$155$$ = new $image$jscomp$2_win$jscomp$155$$.Image;
  $noReferrer$$ && ($image$jscomp$2_win$jscomp$155$$.referrerPolicy = "no-referrer");
  $image$jscomp$2_win$jscomp$155$$.src = $src$jscomp$5$$;
  return $image$jscomp$2_win$jscomp$155$$;
};
$AmpPixel$$module$builtins$amp_pixel$$ = function($element$jscomp$117$$) {
  _.$BaseElement$$module$src$base_element$$.call(this, $element$jscomp$117$$);
  this.$D$ = null;
};
$Extensions$$module$src$service$extensions_impl$$ = function($win$jscomp$157$$) {
  this.$win$ = $win$jscomp$157$$;
  this.$F$ = _.$Services$$module$src$services$ampdocServiceFor$$($win$jscomp$157$$);
  this.$extensions_$ = {};
  this.$D$ = null;
};
_.$JSCompiler_StaticMethods_preloadExtension$$ = function($JSCompiler_StaticMethods_preloadExtension$self$$, $extensionId$jscomp$8_extensionId$jscomp$inline_1399_scriptSrc$jscomp$inline_5736$$, $opt_extensionVersion$jscomp$1_scriptElement$jscomp$inline_5735$$) {
  "amp-embed" == $extensionId$jscomp$8_extensionId$jscomp$inline_1399_scriptSrc$jscomp$inline_5736$$ && ($extensionId$jscomp$8_extensionId$jscomp$inline_1399_scriptSrc$jscomp$inline_5736$$ = "amp-ad");
  var $holder$jscomp$14$$ = $JSCompiler_StaticMethods_getExtensionHolder_$$($JSCompiler_StaticMethods_preloadExtension$self$$, $extensionId$jscomp$8_extensionId$jscomp$inline_1399_scriptSrc$jscomp$inline_5736$$, !1);
  if ($holder$jscomp$14$$.loaded || $holder$jscomp$14$$.error) {
    var $JSCompiler_inline_result$jscomp$5587_opt_extensionVersion$jscomp$inline_5734$$ = !1;
  } else {
    void 0 === $holder$jscomp$14$$.$scriptPresent$ && ($holder$jscomp$14$$.$scriptPresent$ = !!$JSCompiler_StaticMethods_preloadExtension$self$$.$win$.document.head.querySelector('[custom-element="' + $extensionId$jscomp$8_extensionId$jscomp$inline_1399_scriptSrc$jscomp$inline_5736$$ + '"]')), $JSCompiler_inline_result$jscomp$5587_opt_extensionVersion$jscomp$inline_5734$$ = !$holder$jscomp$14$$.$scriptPresent$;
  }
  $JSCompiler_inline_result$jscomp$5587_opt_extensionVersion$jscomp$inline_5734$$ && ($JSCompiler_inline_result$jscomp$5587_opt_extensionVersion$jscomp$inline_5734$$ = $opt_extensionVersion$jscomp$1_scriptElement$jscomp$inline_5735$$, $opt_extensionVersion$jscomp$1_scriptElement$jscomp$inline_5735$$ = $JSCompiler_StaticMethods_preloadExtension$self$$.$win$.document.createElement("script"), $opt_extensionVersion$jscomp$1_scriptElement$jscomp$inline_5735$$.async = !0, _.$startsWith$$module$src$string$$($extensionId$jscomp$8_extensionId$jscomp$inline_1399_scriptSrc$jscomp$inline_5736$$, 
  "_") ? $JSCompiler_inline_result$jscomp$5587_opt_extensionVersion$jscomp$inline_5734$$ = "" : $opt_extensionVersion$jscomp$1_scriptElement$jscomp$inline_5735$$.setAttribute(0 <= $CUSTOM_TEMPLATES$$module$src$service$extensions_impl$$.indexOf($extensionId$jscomp$8_extensionId$jscomp$inline_1399_scriptSrc$jscomp$inline_5736$$) ? "custom-template" : "custom-element", $extensionId$jscomp$8_extensionId$jscomp$inline_1399_scriptSrc$jscomp$inline_5736$$), $opt_extensionVersion$jscomp$1_scriptElement$jscomp$inline_5735$$.setAttribute("data-script", 
  $extensionId$jscomp$8_extensionId$jscomp$inline_1399_scriptSrc$jscomp$inline_5736$$), $opt_extensionVersion$jscomp$1_scriptElement$jscomp$inline_5735$$.setAttribute("i-amphtml-inserted", ""), $extensionId$jscomp$8_extensionId$jscomp$inline_1399_scriptSrc$jscomp$inline_5736$$ = _.$calculateExtensionScriptUrl$$module$src$service$extension_location$$($extensionId$jscomp$8_extensionId$jscomp$inline_1399_scriptSrc$jscomp$inline_5736$$, $JSCompiler_inline_result$jscomp$5587_opt_extensionVersion$jscomp$inline_5734$$), 
  $opt_extensionVersion$jscomp$1_scriptElement$jscomp$inline_5735$$.src = $extensionId$jscomp$8_extensionId$jscomp$inline_1399_scriptSrc$jscomp$inline_5736$$, $JSCompiler_StaticMethods_preloadExtension$self$$.$win$.document.head.appendChild($opt_extensionVersion$jscomp$1_scriptElement$jscomp$inline_5735$$), $holder$jscomp$14$$.$scriptPresent$ = !0);
  return $JSCompiler_StaticMethods_waitFor_$$($holder$jscomp$14$$);
};
_.$JSCompiler_StaticMethods_installExtensionForDoc$$ = function($JSCompiler_StaticMethods_installExtensionForDoc$self$$, $ampdoc$jscomp$33$$, $extensionId$jscomp$9$$, $opt_extensionVersion$jscomp$2$$) {
  var $rootNode$jscomp$3$$ = $ampdoc$jscomp$33$$.getRootNode(), $extLoaders$$ = $rootNode$jscomp$3$$.__AMP_EXT_LDR;
  $extLoaders$$ || ($extLoaders$$ = $rootNode$jscomp$3$$.__AMP_EXT_LDR = _.$map$$module$src$utils$object$$());
  if ($extLoaders$$[$extensionId$jscomp$9$$]) {
    return $extLoaders$$[$extensionId$jscomp$9$$];
  }
  _.$stubElementIfNotKnown$$module$src$service$custom_element_registry$$($ampdoc$jscomp$33$$.$win$, $extensionId$jscomp$9$$);
  return $extLoaders$$[$extensionId$jscomp$9$$] = _.$JSCompiler_StaticMethods_preloadExtension$$($JSCompiler_StaticMethods_installExtensionForDoc$self$$, $extensionId$jscomp$9$$, $opt_extensionVersion$jscomp$2$$).then(function() {
    return $JSCompiler_StaticMethods_installExtensionInDoc_$$($JSCompiler_StaticMethods_installExtensionForDoc$self$$, $ampdoc$jscomp$33$$, $extensionId$jscomp$9$$);
  });
};
$JSCompiler_StaticMethods_installElement_$$ = function($ampdoc$jscomp$35$$, $name$jscomp$128$$, $implementationClass$jscomp$2$$, $css$jscomp$1$$) {
  $css$jscomp$1$$ ? _.$installStylesForDoc$$module$src$style_installer$$($ampdoc$jscomp$35$$, $css$jscomp$1$$, function() {
    $JSCompiler_StaticMethods_registerElementInWindow_$$($ampdoc$jscomp$35$$.$win$, $name$jscomp$128$$, $implementationClass$jscomp$2$$);
  }, !1, $name$jscomp$128$$) : $JSCompiler_StaticMethods_registerElementInWindow_$$($ampdoc$jscomp$35$$.$win$, $name$jscomp$128$$, $implementationClass$jscomp$2$$);
};
$JSCompiler_StaticMethods_registerElementInWindow_$$ = function($win$jscomp$159$$, $name$jscomp$129$$, $implementationClass$jscomp$3$$) {
  _.$upgradeOrRegisterElement$$module$src$service$custom_element_registry$$($win$jscomp$159$$, $name$jscomp$129$$, $implementationClass$jscomp$3$$);
  _.$registerServiceBuilder$$module$src$service$$($win$jscomp$159$$, $name$jscomp$129$$, $emptyService$$module$src$service$extensions_impl$$);
};
_.$JSCompiler_StaticMethods_addDocFactory$$ = function($JSCompiler_StaticMethods_addDocFactory$self$$, $factory$jscomp$1$$) {
  var $holder$jscomp$18$$ = $JSCompiler_StaticMethods_getCurrentExtensionHolder_$$($JSCompiler_StaticMethods_addDocFactory$self$$, void 0);
  $holder$jscomp$18$$.$docFactories$.push($factory$jscomp$1$$);
  if ($JSCompiler_StaticMethods_addDocFactory$self$$.$D$ && ($JSCompiler_StaticMethods_addDocFactory$self$$.$F$.$isSingleDoc$() || $JSCompiler_StaticMethods_addDocFactory$self$$.$F$.$D$)) {
    var $ampdoc$jscomp$37$$ = $JSCompiler_StaticMethods_addDocFactory$self$$.$F$.$getAmpDoc$($JSCompiler_StaticMethods_addDocFactory$self$$.$win$.document);
    (-1 != $ampdoc$jscomp$37$$.$D$.indexOf($JSCompiler_StaticMethods_addDocFactory$self$$.$D$) || $holder$jscomp$18$$.$auto$) && $factory$jscomp$1$$($ampdoc$jscomp$37$$);
  }
};
$JSCompiler_StaticMethods_installExtensionsInDoc$$ = function($JSCompiler_StaticMethods_installExtensionsInDoc$self$$, $ampdoc$jscomp$38$$, $extensionIds$$) {
  var $promises$jscomp$4$$ = [];
  $extensionIds$$.forEach(function($extensionIds$$) {
    $promises$jscomp$4$$.push($JSCompiler_StaticMethods_installExtensionInDoc_$$($JSCompiler_StaticMethods_installExtensionsInDoc$self$$, $ampdoc$jscomp$38$$, $extensionIds$$));
  });
  window.Promise.all($promises$jscomp$4$$);
};
$JSCompiler_StaticMethods_installExtensionInDoc_$$ = function($JSCompiler_StaticMethods_installExtensionInDoc_$self$$, $ampdoc$jscomp$39$$, $extensionId$jscomp$13$$) {
  var $holder$jscomp$19$$ = $JSCompiler_StaticMethods_getExtensionHolder_$$($JSCompiler_StaticMethods_installExtensionInDoc_$self$$, $extensionId$jscomp$13$$, !1);
  return $JSCompiler_StaticMethods_waitFor_$$($holder$jscomp$19$$).then(function() {
    -1 != $ampdoc$jscomp$39$$.$D$.indexOf($extensionId$jscomp$13$$) || $ampdoc$jscomp$39$$.$D$.push($extensionId$jscomp$13$$);
    $holder$jscomp$19$$.$docFactories$.forEach(function($JSCompiler_StaticMethods_installExtensionInDoc_$self$$) {
      try {
        $JSCompiler_StaticMethods_installExtensionInDoc_$self$$($ampdoc$jscomp$39$$);
      } catch ($e$jscomp$60$$) {
        _.$rethrowAsync$$module$src$log$$("Doc factory failed: ", $e$jscomp$60$$, $extensionId$jscomp$13$$);
      }
    });
  });
};
$JSCompiler_StaticMethods_getExtensionHolder_$$ = function($JSCompiler_StaticMethods_getExtensionHolder_$self$$, $extensionId$jscomp$15$$, $auto$$) {
  var $holder$jscomp$20$$ = $JSCompiler_StaticMethods_getExtensionHolder_$self$$.$extensions_$[$extensionId$jscomp$15$$];
  $holder$jscomp$20$$ || ($holder$jscomp$20$$ = {extension:{elements:{}, services:[]}, $auto$:$auto$$, $docFactories$:[], $promise$:void 0, resolve:void 0, reject:void 0, loaded:void 0, error:void 0, $scriptPresent$:void 0}, $JSCompiler_StaticMethods_getExtensionHolder_$self$$.$extensions_$[$extensionId$jscomp$15$$] = $holder$jscomp$20$$);
  return $holder$jscomp$20$$;
};
$JSCompiler_StaticMethods_getCurrentExtensionHolder_$$ = function($JSCompiler_StaticMethods_getCurrentExtensionHolder_$self$$, $opt_forName$jscomp$1$$) {
  $JSCompiler_StaticMethods_getCurrentExtensionHolder_$self$$.$D$ || _.$dev$$module$src$log$$().error("extensions", "unknown extension for ", $opt_forName$jscomp$1$$);
  return $JSCompiler_StaticMethods_getExtensionHolder_$$($JSCompiler_StaticMethods_getCurrentExtensionHolder_$self$$, $JSCompiler_StaticMethods_getCurrentExtensionHolder_$self$$.$D$ || "_UNKNOWN_", !0);
};
$JSCompiler_StaticMethods_waitFor_$$ = function($holder$jscomp$21$$) {
  if (!$holder$jscomp$21$$.$promise$) {
    if ($holder$jscomp$21$$.loaded) {
      $holder$jscomp$21$$.$promise$ = window.Promise.resolve($holder$jscomp$21$$.extension);
    } else {
      if ($holder$jscomp$21$$.error) {
        $holder$jscomp$21$$.$promise$ = window.Promise.reject($holder$jscomp$21$$.error);
      } else {
        var $deferred$jscomp$14$$ = new _.$Deferred$$module$src$utils$promise$$;
        $holder$jscomp$21$$.$promise$ = $deferred$jscomp$14$$.$promise$;
        $holder$jscomp$21$$.resolve = $deferred$jscomp$14$$.resolve;
        $holder$jscomp$21$$.reject = $deferred$jscomp$14$$.reject;
      }
    }
  }
  return $holder$jscomp$21$$.$promise$;
};
_.$stubLegacyElements$$module$src$service$extensions_impl$$ = function($win$jscomp$161$$) {
  _.$LEGACY_ELEMENTS$$module$src$service$extensions_impl$$.forEach(function($name$jscomp$131$$) {
    _.$stubElementIfNotKnown$$module$src$service$custom_element_registry$$($win$jscomp$161$$, $name$jscomp$131$$);
  });
};
$emptyService$$module$src$service$extensions_impl$$ = function() {
  return {};
};
_.$getState$$module$src$history$$ = function($history$jscomp$1$$) {
  try {
    return $history$jscomp$1$$.state;
  } catch ($e$jscomp$61$$) {
    return null;
  }
};
$History$$module$src$service$history_impl$$ = function($ampdoc$jscomp$41$$, $binding$$) {
  this.$ampdoc_$ = $ampdoc$jscomp$41$$;
  this.$timer_$ = _.$Services$$module$src$services$timerFor$$($ampdoc$jscomp$41$$.$win$);
  this.$D$ = $binding$$;
  this.$G$ = 0;
  this.$F$ = [];
  this.$I$ = [];
  this.$D$.$setOnStateUpdated$(this.$History$$module$src$service$history_impl_prototype$onStateUpdated_$.bind(this));
};
_.$JSCompiler_StaticMethods_goBack$$ = function($JSCompiler_StaticMethods_goBack$self$$) {
  $JSCompiler_StaticMethods_enque_$$($JSCompiler_StaticMethods_goBack$self$$, function() {
    return 0 >= $JSCompiler_StaticMethods_goBack$self$$.$G$ ? window.Promise.resolve() : $JSCompiler_StaticMethods_goBack$self$$.$D$.pop($JSCompiler_StaticMethods_goBack$self$$.$G$).then(function($historyState$jscomp$2$$) {
      $JSCompiler_StaticMethods_goBack$self$$.$History$$module$src$service$history_impl_prototype$onStateUpdated_$($historyState$jscomp$2$$);
    });
  }, "goBack");
};
$JSCompiler_StaticMethods_History$$module$src$service$history_impl_prototype$replaceStateForTarget$$ = function($JSCompiler_StaticMethods_History$$module$src$service$history_impl_prototype$replaceStateForTarget$self$$, $target$jscomp$80$$) {
  var $previousHash$$ = $JSCompiler_StaticMethods_History$$module$src$service$history_impl_prototype$replaceStateForTarget$self$$.$ampdoc_$.$win$.location.hash;
  return $JSCompiler_StaticMethods_History$$module$src$service$history_impl_prototype$replaceStateForTarget$self$$.push(function() {
    $JSCompiler_StaticMethods_History$$module$src$service$history_impl_prototype$replaceStateForTarget$self$$.$ampdoc_$.$win$.location.replace($previousHash$$ || "#");
  }).then(function() {
    $JSCompiler_StaticMethods_History$$module$src$service$history_impl_prototype$replaceStateForTarget$self$$.$D$.$HistoryBindingInterface$$module$src$service$history_impl_prototype$replaceStateForTarget$($target$jscomp$80$$);
  });
};
$JSCompiler_StaticMethods_doPop_$$ = function($JSCompiler_StaticMethods_doPop_$self$$, $historyState$jscomp$4$$) {
  if (!($JSCompiler_StaticMethods_doPop_$self$$.$G$ >= $JSCompiler_StaticMethods_doPop_$self$$.$F$.length - 1)) {
    for (var $toPop$$ = [], $$jscomp$loop$392_i$jscomp$87$$ = $JSCompiler_StaticMethods_doPop_$self$$.$F$.length - 1; $$jscomp$loop$392_i$jscomp$87$$ > $JSCompiler_StaticMethods_doPop_$self$$.$G$; $$jscomp$loop$392_i$jscomp$87$$--) {
      $JSCompiler_StaticMethods_doPop_$self$$.$F$[$$jscomp$loop$392_i$jscomp$87$$] && ($toPop$$.push($JSCompiler_StaticMethods_doPop_$self$$.$F$[$$jscomp$loop$392_i$jscomp$87$$]), $JSCompiler_StaticMethods_doPop_$self$$.$F$[$$jscomp$loop$392_i$jscomp$87$$] = void 0);
    }
    $JSCompiler_StaticMethods_doPop_$self$$.$F$.splice($JSCompiler_StaticMethods_doPop_$self$$.$G$ + 1);
    if (0 < $toPop$$.length) {
      for ($$jscomp$loop$392_i$jscomp$87$$ = {$i$148$:0}; $$jscomp$loop$392_i$jscomp$87$$.$i$148$ < $toPop$$.length; $$jscomp$loop$392_i$jscomp$87$$ = {$i$148$:$$jscomp$loop$392_i$jscomp$87$$.$i$148$}, $$jscomp$loop$392_i$jscomp$87$$.$i$148$++) {
        $JSCompiler_StaticMethods_doPop_$self$$.$timer_$.delay(function($JSCompiler_StaticMethods_doPop_$self$$) {
          return function() {
            return $toPop$$[$JSCompiler_StaticMethods_doPop_$self$$.$i$148$]($historyState$jscomp$4$$);
          };
        }($$jscomp$loop$392_i$jscomp$87$$), 1);
      }
    }
  }
};
$JSCompiler_StaticMethods_enque_$$ = function($JSCompiler_StaticMethods_enque_$self$$, $callback$jscomp$68$$, $name$jscomp$132$$) {
  var $$jscomp$destructuring$var76$$ = new _.$Deferred$$module$src$utils$promise$$, $promise$jscomp$19$$ = $$jscomp$destructuring$var76$$.$promise$;
  $JSCompiler_StaticMethods_enque_$self$$.$I$.push({$callback$:$callback$jscomp$68$$, resolve:$$jscomp$destructuring$var76$$.resolve, reject:$$jscomp$destructuring$var76$$.reject, trace:Error("history trace for " + $name$jscomp$132$$ + ": ")});
  1 == $JSCompiler_StaticMethods_enque_$self$$.$I$.length && $JSCompiler_StaticMethods_deque_$$($JSCompiler_StaticMethods_enque_$self$$);
  return $promise$jscomp$19$$;
};
$JSCompiler_StaticMethods_deque_$$ = function($JSCompiler_StaticMethods_deque_$self$$) {
  if (0 != $JSCompiler_StaticMethods_deque_$self$$.$I$.length) {
    var $task$jscomp$1$$ = $JSCompiler_StaticMethods_deque_$self$$.$I$[0];
    try {
      var $promise$jscomp$20$$ = $task$jscomp$1$$.$callback$();
    } catch ($e$jscomp$62$$) {
      $promise$jscomp$20$$ = window.Promise.reject($e$jscomp$62$$);
    }
    $promise$jscomp$20$$.then(function($JSCompiler_StaticMethods_deque_$self$$) {
      $task$jscomp$1$$.resolve($JSCompiler_StaticMethods_deque_$self$$);
    }, function($JSCompiler_StaticMethods_deque_$self$$) {
      _.$dev$$module$src$log$$().error("History", "failed to execute a task:", $JSCompiler_StaticMethods_deque_$self$$);
      $task$jscomp$1$$.trace && ($task$jscomp$1$$.trace.message += $JSCompiler_StaticMethods_deque_$self$$, _.$dev$$module$src$log$$().error("History", $task$jscomp$1$$.trace));
      $task$jscomp$1$$.reject($JSCompiler_StaticMethods_deque_$self$$);
    }).then(function() {
      $JSCompiler_StaticMethods_deque_$self$$.$I$.splice(0, 1);
      $JSCompiler_StaticMethods_deque_$$($JSCompiler_StaticMethods_deque_$self$$);
    });
  }
};
_.$HistoryBindingNatural_$$module$src$service$history_impl$$ = function($history$jscomp$2_win$jscomp$162$$) {
  var $$jscomp$this$jscomp$63$$ = this;
  this.$win$ = $history$jscomp$2_win$jscomp$162$$;
  this.$timer_$ = _.$Services$$module$src$services$timerFor$$($history$jscomp$2_win$jscomp$162$$);
  $history$jscomp$2_win$jscomp$162$$ = this.$win$.history;
  this.$F$ = $history$jscomp$2_win$jscomp$162$$.length - 1;
  var $pushState_state$jscomp$9$$ = _.$getState$$module$src$history$$($history$jscomp$2_win$jscomp$162$$);
  $pushState_state$jscomp$9$$ && void 0 !== $pushState_state$jscomp$9$$["AMP.History"] && (this.$F$ = Math.min($pushState_state$jscomp$9$$["AMP.History"], this.$F$));
  this.$D$ = this.$F$;
  this.$R$ = null;
  this.$V$ = "state" in $history$jscomp$2_win$jscomp$162$$;
  this.$G$ = $JSCompiler_StaticMethods_historyState_$$(this, this.$D$);
  if ($history$jscomp$2_win$jscomp$162$$.pushState && $history$jscomp$2_win$jscomp$162$$.replaceState) {
    this.$J$ = $history$jscomp$2_win$jscomp$162$$.$D$ || $history$jscomp$2_win$jscomp$162$$.pushState.bind($history$jscomp$2_win$jscomp$162$$);
    this.$I$ = $history$jscomp$2_win$jscomp$162$$.$F$ || $history$jscomp$2_win$jscomp$162$$.replaceState.bind($history$jscomp$2_win$jscomp$162$$);
    $pushState_state$jscomp$9$$ = function($history$jscomp$2_win$jscomp$162$$, $pushState_state$jscomp$9$$, $replaceState$$) {
      $$jscomp$this$jscomp$63$$.$G$ = $history$jscomp$2_win$jscomp$162$$;
      $$jscomp$this$jscomp$63$$.$J$($history$jscomp$2_win$jscomp$162$$, $pushState_state$jscomp$9$$, $replaceState$$ || null);
    };
    var $replaceState$$ = function($history$jscomp$2_win$jscomp$162$$, $pushState_state$jscomp$9$$, $replaceState$$) {
      $$jscomp$this$jscomp$63$$.$G$ = $history$jscomp$2_win$jscomp$162$$;
      void 0 !== $replaceState$$ ? $$jscomp$this$jscomp$63$$.$I$($history$jscomp$2_win$jscomp$162$$, $pushState_state$jscomp$9$$, $replaceState$$) : $$jscomp$this$jscomp$63$$.$I$($history$jscomp$2_win$jscomp$162$$, $pushState_state$jscomp$9$$);
    };
    $history$jscomp$2_win$jscomp$162$$.$D$ || ($history$jscomp$2_win$jscomp$162$$.$D$ = this.$J$);
    $history$jscomp$2_win$jscomp$162$$.$F$ || ($history$jscomp$2_win$jscomp$162$$.$F$ = this.$I$);
  } else {
    $pushState_state$jscomp$9$$ = function($history$jscomp$2_win$jscomp$162$$) {
      $$jscomp$this$jscomp$63$$.$G$ = $history$jscomp$2_win$jscomp$162$$;
    }, $replaceState$$ = function($history$jscomp$2_win$jscomp$162$$) {
      $$jscomp$this$jscomp$63$$.$G$ = $history$jscomp$2_win$jscomp$162$$;
    };
  }
  this.$U$ = $pushState_state$jscomp$9$$;
  this.$O$ = $replaceState$$;
  try {
    this.$O$($JSCompiler_StaticMethods_historyState_$$(this, this.$D$, !0));
  } catch ($e$jscomp$63$$) {
    _.$dev$$module$src$log$$().error("History", "Initial replaceState failed: " + $e$jscomp$63$$.message);
  }
  $history$jscomp$2_win$jscomp$162$$.pushState = this.$historyPushState_$.bind(this);
  $history$jscomp$2_win$jscomp$162$$.replaceState = this.$historyReplaceState_$.bind(this);
  this.$K$ = function() {
    "History";
    var $history$jscomp$2_win$jscomp$162$$ = $JSCompiler_StaticMethods_getState_$$($$jscomp$this$jscomp$63$$);
    "History";
    var $pushState_state$jscomp$9$$ = $history$jscomp$2_win$jscomp$162$$ ? $history$jscomp$2_win$jscomp$162$$["AMP.History"] : void 0, $replaceState$$ = $$jscomp$this$jscomp$63$$.$D$, $waitingState$jscomp$inline_1425$$ = $$jscomp$this$jscomp$63$$.$P$;
    $$jscomp$this$jscomp$63$$.$P$ = void 0;
    $replaceState$$ > $$jscomp$this$jscomp$63$$.$win$.history.length - 2 && ($replaceState$$ = $$jscomp$this$jscomp$63$$.$win$.history.length - 2, $JSCompiler_StaticMethods_HistoryBindingNatural_$$module$src$service$history_impl_prototype$updateHistoryState_$$($$jscomp$this$jscomp$63$$, $JSCompiler_StaticMethods_mergeStateUpdate_$$($history$jscomp$2_win$jscomp$162$$, {$stackIndex$:$replaceState$$})));
    void 0 == $pushState_state$jscomp$9$$ ? $replaceState$$ += 1 : $pushState_state$jscomp$9$$ < $$jscomp$this$jscomp$63$$.$win$.history.length ? $replaceState$$ = $pushState_state$jscomp$9$$ : $replaceState$$ = $$jscomp$this$jscomp$63$$.$win$.history.length - 1;
    $history$jscomp$2_win$jscomp$162$$ || ($history$jscomp$2_win$jscomp$162$$ = {});
    $history$jscomp$2_win$jscomp$162$$["AMP.History"] = $replaceState$$;
    $$jscomp$this$jscomp$63$$.$O$($history$jscomp$2_win$jscomp$162$$, void 0, void 0);
    $replaceState$$ != $$jscomp$this$jscomp$63$$.$D$ && $JSCompiler_StaticMethods_HistoryBindingNatural_$$module$src$service$history_impl_prototype$updateHistoryState_$$($$jscomp$this$jscomp$63$$, $JSCompiler_StaticMethods_mergeStateUpdate_$$($history$jscomp$2_win$jscomp$162$$, {$stackIndex$:$replaceState$$}));
    $replaceState$$ < $$jscomp$this$jscomp$63$$.$F$ && ($$jscomp$this$jscomp$63$$.$F$ = $replaceState$$);
    $waitingState$jscomp$inline_1425$$ && $waitingState$jscomp$inline_1425$$.resolve();
  };
  this.$win$.addEventListener("popstate", this.$K$);
};
$JSCompiler_StaticMethods_historyState_$$ = function($JSCompiler_StaticMethods_historyState_$self_state$jscomp$15$$, $stackIndex$$, $opt_replace$jscomp$2$$) {
  $JSCompiler_StaticMethods_historyState_$self_state$jscomp$15$$ = _.$map$$module$src$utils$object$$($opt_replace$jscomp$2$$ ? $JSCompiler_StaticMethods_getState_$$($JSCompiler_StaticMethods_historyState_$self_state$jscomp$15$$) : void 0);
  $JSCompiler_StaticMethods_historyState_$self_state$jscomp$15$$["AMP.History"] = $stackIndex$$;
  return $JSCompiler_StaticMethods_historyState_$self_state$jscomp$15$$;
};
$JSCompiler_StaticMethods_getState_$$ = function($JSCompiler_StaticMethods_getState_$self$$) {
  return $JSCompiler_StaticMethods_getState_$self$$.$V$ ? _.$getState$$module$src$history$$($JSCompiler_StaticMethods_getState_$self$$.$win$.history) : $JSCompiler_StaticMethods_getState_$self$$.$G$;
};
$JSCompiler_StaticMethods_whenReady_$$ = function($JSCompiler_StaticMethods_whenReady_$self$$, $callback$jscomp$70$$) {
  return $JSCompiler_StaticMethods_whenReady_$self$$.$P$ ? $JSCompiler_StaticMethods_whenReady_$self$$.$P$.$promise$.then($callback$jscomp$70$$, $callback$jscomp$70$$) : $callback$jscomp$70$$();
};
$JSCompiler_StaticMethods_HistoryBindingNatural_$$module$src$service$history_impl_prototype$wait_$$ = function($JSCompiler_StaticMethods_HistoryBindingNatural_$$module$src$service$history_impl_prototype$wait_$self$$) {
  var $deferred$jscomp$16_promise$jscomp$21$$ = new _.$Deferred$$module$src$utils$promise$$, $resolve$jscomp$27$$ = $deferred$jscomp$16_promise$jscomp$21$$.resolve, $reject$jscomp$14$$ = $deferred$jscomp$16_promise$jscomp$21$$.reject;
  $deferred$jscomp$16_promise$jscomp$21$$ = _.$JSCompiler_StaticMethods_timeoutPromise$$($JSCompiler_StaticMethods_HistoryBindingNatural_$$module$src$service$history_impl_prototype$wait_$self$$.$timer_$, 500, $deferred$jscomp$16_promise$jscomp$21$$.$promise$);
  $JSCompiler_StaticMethods_HistoryBindingNatural_$$module$src$service$history_impl_prototype$wait_$self$$.$P$ = {$promise$:$deferred$jscomp$16_promise$jscomp$21$$, resolve:$resolve$jscomp$27$$, reject:$reject$jscomp$14$$};
  return $deferred$jscomp$16_promise$jscomp$21$$;
};
$JSCompiler_StaticMethods_back_$$ = function($JSCompiler_StaticMethods_back_$self$$, $steps$$) {
  if (0 >= $steps$$) {
    return window.Promise.resolve($JSCompiler_StaticMethods_back_$self$$.$D$);
  }
  $JSCompiler_StaticMethods_back_$self$$.$G$ = $JSCompiler_StaticMethods_historyState_$$($JSCompiler_StaticMethods_back_$self$$, $JSCompiler_StaticMethods_back_$self$$.$D$ - $steps$$);
  var $promise$jscomp$22$$ = $JSCompiler_StaticMethods_HistoryBindingNatural_$$module$src$service$history_impl_prototype$wait_$$($JSCompiler_StaticMethods_back_$self$$);
  $JSCompiler_StaticMethods_back_$self$$.$win$.history.go(-$steps$$);
  return $promise$jscomp$22$$.then(function() {
    return window.Promise.resolve($JSCompiler_StaticMethods_back_$self$$.$D$);
  });
};
$JSCompiler_StaticMethods_HistoryBindingNatural_$$module$src$service$history_impl_prototype$updateHistoryState_$$ = function($JSCompiler_StaticMethods_HistoryBindingNatural_$$module$src$service$history_impl_prototype$updateHistoryState_$self$$, $historyState$jscomp$5$$) {
  $historyState$jscomp$5$$.$stackIndex$ = Math.min($historyState$jscomp$5$$.$stackIndex$, $JSCompiler_StaticMethods_HistoryBindingNatural_$$module$src$service$history_impl_prototype$updateHistoryState_$self$$.$win$.history.length - 1);
  $JSCompiler_StaticMethods_HistoryBindingNatural_$$module$src$service$history_impl_prototype$updateHistoryState_$self$$.$D$ != $historyState$jscomp$5$$.$stackIndex$ && ("History", $JSCompiler_StaticMethods_HistoryBindingNatural_$$module$src$service$history_impl_prototype$updateHistoryState_$self$$.$D$ = $historyState$jscomp$5$$.$stackIndex$, $JSCompiler_StaticMethods_HistoryBindingNatural_$$module$src$service$history_impl_prototype$updateHistoryState_$self$$.$R$ && $JSCompiler_StaticMethods_HistoryBindingNatural_$$module$src$service$history_impl_prototype$updateHistoryState_$self$$.$R$($historyState$jscomp$5$$));
};
$JSCompiler_StaticMethods_mergeStateUpdate_$$ = function($state$jscomp$19$$, $update$$) {
  var $mergedData$$ = Object.assign({}, $state$jscomp$19$$ && $state$jscomp$19$$.data || {}, $update$$.data || {});
  return Object.assign({}, $state$jscomp$19$$ || {}, $update$$, {data:$mergedData$$});
};
_.$HistoryBindingVirtual_$$module$src$service$history_impl$$ = function($win$jscomp$163$$, $viewer$jscomp$13$$) {
  var $$jscomp$this$jscomp$71$$ = this;
  this.$win$ = $win$jscomp$163$$;
  this.$viewer_$ = $viewer$jscomp$13$$;
  this.$D$ = 0;
  this.$F$ = null;
  this.$G$ = this.$viewer_$.$onMessage$("historyPopped", function($win$jscomp$163$$) {
    void 0 !== $win$jscomp$163$$.newStackIndex && ($win$jscomp$163$$.stackIndex = $win$jscomp$163$$.newStackIndex);
    $JSCompiler_StaticMethods_HistoryBindingVirtual_$$module$src$service$history_impl_prototype$updateHistoryState_$$($$jscomp$this$jscomp$71$$, $win$jscomp$163$$);
  });
};
$JSCompiler_StaticMethods_HistoryBindingVirtual_$$module$src$service$history_impl_prototype$updateHistoryState_$$ = function($JSCompiler_StaticMethods_HistoryBindingVirtual_$$module$src$service$history_impl_prototype$updateHistoryState_$self$$, $state$jscomp$20$$) {
  var $stackIndex$jscomp$7$$ = $state$jscomp$20$$.$stackIndex$;
  $JSCompiler_StaticMethods_HistoryBindingVirtual_$$module$src$service$history_impl_prototype$updateHistoryState_$self$$.$D$ != $stackIndex$jscomp$7$$ && ("History", $JSCompiler_StaticMethods_HistoryBindingVirtual_$$module$src$service$history_impl_prototype$updateHistoryState_$self$$.$D$ = $stackIndex$jscomp$7$$, $JSCompiler_StaticMethods_HistoryBindingVirtual_$$module$src$service$history_impl_prototype$updateHistoryState_$self$$.$F$ && $JSCompiler_StaticMethods_HistoryBindingVirtual_$$module$src$service$history_impl_prototype$updateHistoryState_$self$$.$F$($state$jscomp$20$$));
};
$createHistory$$module$src$service$history_impl$$ = function($ampdoc$jscomp$42$$) {
  var $binding$jscomp$1_viewer$jscomp$14$$ = _.$Services$$module$src$services$viewerForDoc$$($ampdoc$jscomp$42$$);
  $binding$jscomp$1_viewer$jscomp$14$$.$ea$ || $ampdoc$jscomp$42$$.$win$.AMP_TEST_IFRAME ? $binding$jscomp$1_viewer$jscomp$14$$ = new _.$HistoryBindingVirtual_$$module$src$service$history_impl$$($ampdoc$jscomp$42$$.$win$, $binding$jscomp$1_viewer$jscomp$14$$) : (_.$registerServiceBuilder$$module$src$service$$($ampdoc$jscomp$42$$.$win$, "global-history-binding", _.$HistoryBindingNatural_$$module$src$service$history_impl$$), $binding$jscomp$1_viewer$jscomp$14$$ = _.$getService$$module$src$service$$($ampdoc$jscomp$42$$.$win$, 
  "global-history-binding"));
  return new $History$$module$src$service$history_impl$$($ampdoc$jscomp$42$$, $binding$jscomp$1_viewer$jscomp$14$$);
};
$Navigation$$module$src$service$navigation$$ = function($ampdoc$jscomp$46$$, $opt_rootNode$$) {
  var $$jscomp$this$jscomp$75$$ = this;
  this.ampdoc = $ampdoc$jscomp$46$$;
  this.$D$ = $opt_rootNode$$ || $ampdoc$jscomp$46$$.getRootNode();
  this.$viewport_$ = _.$Services$$module$src$services$viewportForDoc$$(this.ampdoc);
  this.$viewer_$ = _.$Services$$module$src$services$viewerForDoc$$(this.ampdoc);
  this.$history_$ = _.$Services$$module$src$services$historyForDoc$$(this.ampdoc);
  this.$platform_$ = _.$Services$$module$src$services$platformFor$$(this.ampdoc.$win$);
  this.$V$ = _.$JSCompiler_StaticMethods_isIos$$(this.$platform_$) && _.$JSCompiler_StaticMethods_isSafari$$(this.$platform_$);
  this.$P$ = _.$isIframed$$module$src$dom$$(this.ampdoc.$win$) && this.$viewer_$.$ea$;
  this.$I$ = this.$D$ != this.ampdoc.getRootNode();
  this.$U$ = "inabox" == _.$getMode$$module$src$mode$$(this.ampdoc.$win$).runtime;
  this.$O$ = this.$D$.nodeType == window.Node.DOCUMENT_NODE ? this.$D$.documentElement : this.$D$;
  this.$F$ = this.$R$.bind(this);
  this.$D$.addEventListener("click", this.$F$);
  this.$D$.addEventListener("contextmenu", this.$F$);
  this.$K$ = !1;
  $shouldAppendExtraParams$$module$src$impression$$(this.ampdoc).then(function($ampdoc$jscomp$46$$) {
    $$jscomp$this$jscomp$75$$.$K$ = $ampdoc$jscomp$46$$;
  });
  this.$G$ = null;
  this.$J$ = new $PriorityQueue$$module$src$utils$priority_queue$$;
};
_.$Navigation$$module$src$service$navigation$installAnchorClickInterceptor$$ = function($ampdoc$jscomp$47$$, $win$jscomp$164$$) {
  $win$jscomp$164$$.document.documentElement.addEventListener("click", $maybeExpandUrlParams$$module$src$service$navigation$$.bind(null, $ampdoc$jscomp$47$$), !0);
};
_.$JSCompiler_StaticMethods_navigateTo$$ = function($JSCompiler_StaticMethods_navigateTo$self_newWin$jscomp$inline_1439$$, $win$jscomp$166$$, $url$jscomp$67$$, $opt_requestedBy_options$jscomp$inline_1438$$, $opt_options$jscomp$80_target$jscomp$84$$) {
  var $$jscomp$destructuring$var81_opener$jscomp$1$$ = void 0 === $opt_options$jscomp$80_target$jscomp$84$$ ? {} : $opt_options$jscomp$80_target$jscomp$84$$;
  $opt_options$jscomp$80_target$jscomp$84$$ = void 0 === $$jscomp$destructuring$var81_opener$jscomp$1$$.target ? "_top" : $$jscomp$destructuring$var81_opener$jscomp$1$$.target;
  $$jscomp$destructuring$var81_opener$jscomp$1$$ = void 0 === $$jscomp$destructuring$var81_opener$jscomp$1$$.opener ? !1 : $$jscomp$destructuring$var81_opener$jscomp$1$$.opener;
  _.$Services$$module$src$services$urlForDoc$$($JSCompiler_StaticMethods_navigateTo$self_newWin$jscomp$inline_1439$$.$O$);
  if (_.$isProtocolValid$$module$src$url$$($url$jscomp$67$$)) {
    if ("_blank" == $opt_options$jscomp$80_target$jscomp$84$$) {
      $opt_requestedBy_options$jscomp$inline_1438$$ = "", !_.$JSCompiler_StaticMethods_isIos$$($JSCompiler_StaticMethods_navigateTo$self_newWin$jscomp$inline_1439$$.$platform_$) && _.$JSCompiler_StaticMethods_isChrome$$($JSCompiler_StaticMethods_navigateTo$self_newWin$jscomp$inline_1439$$.$platform_$) || $$jscomp$destructuring$var81_opener$jscomp$1$$ || ($opt_requestedBy_options$jscomp$inline_1438$$ += "noopener"), ($JSCompiler_StaticMethods_navigateTo$self_newWin$jscomp$inline_1439$$ = _.$openWindowDialog$$module$src$dom$$($win$jscomp$166$$, 
      $url$jscomp$67$$, $opt_options$jscomp$80_target$jscomp$84$$, $opt_requestedBy_options$jscomp$inline_1438$$)) && !$$jscomp$destructuring$var81_opener$jscomp$1$$ && ($JSCompiler_StaticMethods_navigateTo$self_newWin$jscomp$inline_1439$$.opener = null);
    } else {
      if ($opt_requestedBy_options$jscomp$inline_1438$$ && ($JSCompiler_StaticMethods_navigateTo$self_newWin$jscomp$inline_1439$$.$G$ || ($JSCompiler_StaticMethods_navigateTo$self_newWin$jscomp$inline_1439$$.$G$ = $JSCompiler_StaticMethods_queryA2AFeatures_$$($JSCompiler_StaticMethods_navigateTo$self_newWin$jscomp$inline_1439$$)), $JSCompiler_StaticMethods_navigateTo$self_newWin$jscomp$inline_1439$$.$G$.includes($opt_requestedBy_options$jscomp$inline_1438$$) && _.$JSCompiler_StaticMethods_navigateToAmpUrl$$($JSCompiler_StaticMethods_navigateTo$self_newWin$jscomp$inline_1439$$, 
      $url$jscomp$67$$, $opt_requestedBy_options$jscomp$inline_1438$$))) {
        return;
      }
      $win$jscomp$166$$.top.location.href = $url$jscomp$67$$;
    }
  } else {
    _.$user$$module$src$log$$().error("navigation", "Cannot navigate to invalid protocol: " + $url$jscomp$67$$);
  }
};
_.$JSCompiler_StaticMethods_navigateToAmpUrl$$ = function($JSCompiler_StaticMethods_navigateToAmpUrl$self$$, $url$jscomp$68$$, $requestedBy$$) {
  return _.$JSCompiler_StaticMethods_hasCapability$$($JSCompiler_StaticMethods_navigateToAmpUrl$self$$.$viewer_$, "a2a") ? (_.$JSCompiler_StaticMethods_Viewer$$module$src$service$viewer_impl_prototype$sendMessage$$($JSCompiler_StaticMethods_navigateToAmpUrl$self$$.$viewer_$, "a2aNavigate", _.$dict$$module$src$utils$object$$({url:$url$jscomp$68$$, requestedBy:$requestedBy$$})), !0) : !1;
};
$JSCompiler_StaticMethods_queryA2AFeatures_$$ = function($JSCompiler_StaticMethods_queryA2AFeatures_$self_meta$jscomp$3$$) {
  return ($JSCompiler_StaticMethods_queryA2AFeatures_$self_meta$jscomp$3$$ = $JSCompiler_StaticMethods_queryA2AFeatures_$self_meta$jscomp$3$$.$D$.querySelector('meta[name="amp-to-amp-navigation"]')) && $JSCompiler_StaticMethods_queryA2AFeatures_$self_meta$jscomp$3$$.hasAttribute("content") ? $JSCompiler_StaticMethods_queryA2AFeatures_$self_meta$jscomp$3$$.getAttribute("content").split(",").map(function($JSCompiler_StaticMethods_queryA2AFeatures_$self_meta$jscomp$3$$) {
    return $JSCompiler_StaticMethods_queryA2AFeatures_$self_meta$jscomp$3$$.trim();
  }) : [];
};
$JSCompiler_StaticMethods_anchorMutatorHandlers_$$ = function($JSCompiler_StaticMethods_anchorMutatorHandlers_$self$$, $target$jscomp$88$$, $e$jscomp$69$$) {
  $JSCompiler_StaticMethods_anchorMutatorHandlers_$self$$.$J$.forEach(function($JSCompiler_StaticMethods_anchorMutatorHandlers_$self$$) {
    $JSCompiler_StaticMethods_anchorMutatorHandlers_$self$$($target$jscomp$88$$, $e$jscomp$69$$);
  });
};
$JSCompiler_StaticMethods_expandVarsForAnchor_$$ = function($JSCompiler_StaticMethods_expandVarsForAnchor_$self_JSCompiler_StaticMethods_maybeExpandLink$self$jscomp$inline_1463_appendParams$jscomp$inline_1454_url$jscomp$inline_1452$$, $el$jscomp$12$$) {
  var $additionalUrlParams$jscomp$inline_1457_defaultExpandParamsUrl_defaultUrlParams$jscomp$inline_1465_existParams$jscomp$inline_1460_loc$jscomp$inline_1459_params$jscomp$inline_1453_url$jscomp$inline_5748$$ = null;
  if ($JSCompiler_StaticMethods_expandVarsForAnchor_$self_JSCompiler_StaticMethods_maybeExpandLink$self$jscomp$inline_1463_appendParams$jscomp$inline_1454_url$jscomp$inline_1452$$.$K$ && !$JSCompiler_StaticMethods_expandVarsForAnchor_$self_JSCompiler_StaticMethods_maybeExpandLink$self$jscomp$inline_1463_appendParams$jscomp$inline_1454_url$jscomp$inline_1452$$.$I$) {
    $JSCompiler_StaticMethods_expandVarsForAnchor_$self_JSCompiler_StaticMethods_maybeExpandLink$self$jscomp$inline_1463_appendParams$jscomp$inline_1454_url$jscomp$inline_1452$$ = _.$parseUrlDeprecated$$module$src$url$$($JSCompiler_StaticMethods_expandVarsForAnchor_$self_JSCompiler_StaticMethods_maybeExpandLink$self$jscomp$inline_1463_appendParams$jscomp$inline_1454_url$jscomp$inline_1452$$.ampdoc.$win$.location.href);
    $additionalUrlParams$jscomp$inline_1457_defaultExpandParamsUrl_defaultUrlParams$jscomp$inline_1465_existParams$jscomp$inline_1460_loc$jscomp$inline_1459_params$jscomp$inline_1453_url$jscomp$inline_5748$$ = _.$parseQueryString_$$module$src$url_parse_query_string$$($JSCompiler_StaticMethods_expandVarsForAnchor_$self_JSCompiler_StaticMethods_maybeExpandLink$self$jscomp$inline_1463_appendParams$jscomp$inline_1454_url$jscomp$inline_1452$$.search);
    $JSCompiler_StaticMethods_expandVarsForAnchor_$self_JSCompiler_StaticMethods_maybeExpandLink$self$jscomp$inline_1463_appendParams$jscomp$inline_1454_url$jscomp$inline_1452$$ = [];
    for (var $href$jscomp$inline_1458_i$128$jscomp$inline_1461_i$jscomp$inline_1455_i$jscomp$inline_5749_whitelist$jscomp$inline_1467$$ = 0; $href$jscomp$inline_1458_i$128$jscomp$inline_1461_i$jscomp$inline_1455_i$jscomp$inline_5749_whitelist$jscomp$inline_1467$$ < $DEFAULT_APPEND_URL_PARAM$$module$src$impression$$.length; $href$jscomp$inline_1458_i$128$jscomp$inline_1461_i$jscomp$inline_1455_i$jscomp$inline_5749_whitelist$jscomp$inline_1467$$++) {
      var $href$jscomp$inline_1468_param$jscomp$inline_1456_param$jscomp$inline_5750$$ = $DEFAULT_APPEND_URL_PARAM$$module$src$impression$$[$href$jscomp$inline_1458_i$128$jscomp$inline_1461_i$jscomp$inline_1455_i$jscomp$inline_5749_whitelist$jscomp$inline_1467$$];
      "undefined" !== typeof $additionalUrlParams$jscomp$inline_1457_defaultExpandParamsUrl_defaultUrlParams$jscomp$inline_1465_existParams$jscomp$inline_1460_loc$jscomp$inline_1459_params$jscomp$inline_1453_url$jscomp$inline_5748$$[$href$jscomp$inline_1468_param$jscomp$inline_1456_param$jscomp$inline_5750$$] && $JSCompiler_StaticMethods_expandVarsForAnchor_$self_JSCompiler_StaticMethods_maybeExpandLink$self$jscomp$inline_1463_appendParams$jscomp$inline_1454_url$jscomp$inline_1452$$.push($href$jscomp$inline_1468_param$jscomp$inline_1456_param$jscomp$inline_5750$$);
    }
    $additionalUrlParams$jscomp$inline_1457_defaultExpandParamsUrl_defaultUrlParams$jscomp$inline_1465_existParams$jscomp$inline_1460_loc$jscomp$inline_1459_params$jscomp$inline_1453_url$jscomp$inline_5748$$ = $el$jscomp$12$$.getAttribute("data-amp-addparams");
    $href$jscomp$inline_1458_i$128$jscomp$inline_1461_i$jscomp$inline_1455_i$jscomp$inline_5749_whitelist$jscomp$inline_1467$$ = $el$jscomp$12$$.href;
    $additionalUrlParams$jscomp$inline_1457_defaultExpandParamsUrl_defaultUrlParams$jscomp$inline_1465_existParams$jscomp$inline_1460_loc$jscomp$inline_1459_params$jscomp$inline_1453_url$jscomp$inline_5748$$ && ($href$jscomp$inline_1458_i$128$jscomp$inline_1461_i$jscomp$inline_1455_i$jscomp$inline_5749_whitelist$jscomp$inline_1467$$ = _.$addParamsToUrl$$module$src$url$$($href$jscomp$inline_1458_i$128$jscomp$inline_1461_i$jscomp$inline_1455_i$jscomp$inline_5749_whitelist$jscomp$inline_1467$$, _.$parseQueryString_$$module$src$url_parse_query_string$$($additionalUrlParams$jscomp$inline_1457_defaultExpandParamsUrl_defaultUrlParams$jscomp$inline_1465_existParams$jscomp$inline_1460_loc$jscomp$inline_1459_params$jscomp$inline_1453_url$jscomp$inline_5748$$)));
    $additionalUrlParams$jscomp$inline_1457_defaultExpandParamsUrl_defaultUrlParams$jscomp$inline_1465_existParams$jscomp$inline_1460_loc$jscomp$inline_1459_params$jscomp$inline_1453_url$jscomp$inline_5748$$ = _.$parseUrlDeprecated$$module$src$url$$($href$jscomp$inline_1458_i$128$jscomp$inline_1461_i$jscomp$inline_1455_i$jscomp$inline_5749_whitelist$jscomp$inline_1467$$);
    $additionalUrlParams$jscomp$inline_1457_defaultExpandParamsUrl_defaultUrlParams$jscomp$inline_1465_existParams$jscomp$inline_1460_loc$jscomp$inline_1459_params$jscomp$inline_1453_url$jscomp$inline_5748$$ = _.$parseQueryString_$$module$src$url_parse_query_string$$($additionalUrlParams$jscomp$inline_1457_defaultExpandParamsUrl_defaultUrlParams$jscomp$inline_1465_existParams$jscomp$inline_1460_loc$jscomp$inline_1459_params$jscomp$inline_1453_url$jscomp$inline_5748$$.search);
    for ($href$jscomp$inline_1458_i$128$jscomp$inline_1461_i$jscomp$inline_1455_i$jscomp$inline_5749_whitelist$jscomp$inline_1467$$ = $JSCompiler_StaticMethods_expandVarsForAnchor_$self_JSCompiler_StaticMethods_maybeExpandLink$self$jscomp$inline_1463_appendParams$jscomp$inline_1454_url$jscomp$inline_1452$$.length - 1; 0 <= $href$jscomp$inline_1458_i$128$jscomp$inline_1461_i$jscomp$inline_1455_i$jscomp$inline_5749_whitelist$jscomp$inline_1467$$; $href$jscomp$inline_1458_i$128$jscomp$inline_1461_i$jscomp$inline_1455_i$jscomp$inline_5749_whitelist$jscomp$inline_1467$$--) {
      "undefined" !== typeof $additionalUrlParams$jscomp$inline_1457_defaultExpandParamsUrl_defaultUrlParams$jscomp$inline_1465_existParams$jscomp$inline_1460_loc$jscomp$inline_1459_params$jscomp$inline_1453_url$jscomp$inline_5748$$[$JSCompiler_StaticMethods_expandVarsForAnchor_$self_JSCompiler_StaticMethods_maybeExpandLink$self$jscomp$inline_1463_appendParams$jscomp$inline_1454_url$jscomp$inline_1452$$[$href$jscomp$inline_1458_i$128$jscomp$inline_1461_i$jscomp$inline_1455_i$jscomp$inline_5749_whitelist$jscomp$inline_1467$$]] && 
      $JSCompiler_StaticMethods_expandVarsForAnchor_$self_JSCompiler_StaticMethods_maybeExpandLink$self$jscomp$inline_1463_appendParams$jscomp$inline_1454_url$jscomp$inline_1452$$.splice($href$jscomp$inline_1458_i$128$jscomp$inline_1461_i$jscomp$inline_1455_i$jscomp$inline_5749_whitelist$jscomp$inline_1467$$, 1);
    }
    $additionalUrlParams$jscomp$inline_1457_defaultExpandParamsUrl_defaultUrlParams$jscomp$inline_1465_existParams$jscomp$inline_1460_loc$jscomp$inline_1459_params$jscomp$inline_1453_url$jscomp$inline_5748$$ = "";
    for ($href$jscomp$inline_1458_i$128$jscomp$inline_1461_i$jscomp$inline_1455_i$jscomp$inline_5749_whitelist$jscomp$inline_1467$$ = 0; $href$jscomp$inline_1458_i$128$jscomp$inline_1461_i$jscomp$inline_1455_i$jscomp$inline_5749_whitelist$jscomp$inline_1467$$ < $JSCompiler_StaticMethods_expandVarsForAnchor_$self_JSCompiler_StaticMethods_maybeExpandLink$self$jscomp$inline_1463_appendParams$jscomp$inline_1454_url$jscomp$inline_1452$$.length; $href$jscomp$inline_1458_i$128$jscomp$inline_1461_i$jscomp$inline_1455_i$jscomp$inline_5749_whitelist$jscomp$inline_1467$$++) {
      $href$jscomp$inline_1468_param$jscomp$inline_1456_param$jscomp$inline_5750$$ = $JSCompiler_StaticMethods_expandVarsForAnchor_$self_JSCompiler_StaticMethods_maybeExpandLink$self$jscomp$inline_1463_appendParams$jscomp$inline_1454_url$jscomp$inline_1452$$[$href$jscomp$inline_1458_i$128$jscomp$inline_1461_i$jscomp$inline_1455_i$jscomp$inline_5749_whitelist$jscomp$inline_1467$$], $additionalUrlParams$jscomp$inline_1457_defaultExpandParamsUrl_defaultUrlParams$jscomp$inline_1465_existParams$jscomp$inline_1460_loc$jscomp$inline_1459_params$jscomp$inline_1453_url$jscomp$inline_5748$$ += 
      0 == $href$jscomp$inline_1458_i$128$jscomp$inline_1461_i$jscomp$inline_1455_i$jscomp$inline_5749_whitelist$jscomp$inline_1467$$ ? $href$jscomp$inline_1468_param$jscomp$inline_1456_param$jscomp$inline_5750$$ + "=QUERY_PARAM(" + $href$jscomp$inline_1468_param$jscomp$inline_1456_param$jscomp$inline_5750$$ + ")" : "&" + $href$jscomp$inline_1468_param$jscomp$inline_1456_param$jscomp$inline_5750$$ + "=QUERY_PARAM(" + $href$jscomp$inline_1468_param$jscomp$inline_1456_param$jscomp$inline_5750$$ + ")";
    }
  }
  $JSCompiler_StaticMethods_expandVarsForAnchor_$self_JSCompiler_StaticMethods_maybeExpandLink$self$jscomp$inline_1463_appendParams$jscomp$inline_1454_url$jscomp$inline_1452$$ = _.$Services$$module$src$services$urlReplacementsForDoc$$($el$jscomp$12$$);
  var $additionalUrlParameters$jscomp$inline_1466_docInfo$jscomp$inline_5754_meta$jscomp$inline_5755_whitelist$jscomp$inline_5756$$ = $el$jscomp$12$$.getAttribute("data-amp-addparams") || "";
  if (($href$jscomp$inline_1458_i$128$jscomp$inline_1461_i$jscomp$inline_1455_i$jscomp$inline_5749_whitelist$jscomp$inline_1467$$ = _.$JSCompiler_StaticMethods_getWhitelistForElement_$$($el$jscomp$12$$, {CLIENT_ID:!0, QUERY_PARAM:!0, PAGE_VIEW_ID:!0, NAV_TIMING:!0})) || $additionalUrlParameters$jscomp$inline_1466_docInfo$jscomp$inline_5754_meta$jscomp$inline_5755_whitelist$jscomp$inline_5756$$ || $additionalUrlParams$jscomp$inline_1457_defaultExpandParamsUrl_defaultUrlParams$jscomp$inline_1465_existParams$jscomp$inline_1460_loc$jscomp$inline_1459_params$jscomp$inline_1453_url$jscomp$inline_5748$$) {
    $href$jscomp$inline_1468_param$jscomp$inline_1456_param$jscomp$inline_5750$$ = $el$jscomp$12$$["amp-original-href"] || $el$jscomp$12$$.getAttribute("href");
    var $JSCompiler_inline_result$jscomp$5593_url$jscomp$inline_1469$$ = _.$parseUrlDeprecated$$module$src$url$$($href$jscomp$inline_1468_param$jscomp$inline_1456_param$jscomp$inline_5750$$);
    null == $el$jscomp$12$$["amp-original-href"] && ($el$jscomp$12$$["amp-original-href"] = $href$jscomp$inline_1468_param$jscomp$inline_1456_param$jscomp$inline_5750$$);
    $additionalUrlParameters$jscomp$inline_1466_docInfo$jscomp$inline_5754_meta$jscomp$inline_5755_whitelist$jscomp$inline_5756$$ && ($href$jscomp$inline_1468_param$jscomp$inline_1456_param$jscomp$inline_5750$$ = _.$addParamsToUrl$$module$src$url$$($href$jscomp$inline_1468_param$jscomp$inline_1456_param$jscomp$inline_5750$$, _.$parseQueryString_$$module$src$url_parse_query_string$$($additionalUrlParameters$jscomp$inline_1466_docInfo$jscomp$inline_5754_meta$jscomp$inline_5755_whitelist$jscomp$inline_5756$$)));
    b: {
      if ($additionalUrlParameters$jscomp$inline_1466_docInfo$jscomp$inline_5754_meta$jscomp$inline_5755_whitelist$jscomp$inline_5756$$ = _.$Services$$module$src$services$documentInfoForDoc$$($JSCompiler_StaticMethods_expandVarsForAnchor_$self_JSCompiler_StaticMethods_maybeExpandLink$self$jscomp$inline_1463_appendParams$jscomp$inline_1454_url$jscomp$inline_1452$$.ampdoc), $JSCompiler_inline_result$jscomp$5593_url$jscomp$inline_1469$$.origin == _.$parseUrlDeprecated$$module$src$url$$($additionalUrlParameters$jscomp$inline_1466_docInfo$jscomp$inline_5754_meta$jscomp$inline_5755_whitelist$jscomp$inline_5756$$.canonicalUrl).origin || 
      $JSCompiler_inline_result$jscomp$5593_url$jscomp$inline_1469$$.origin == _.$parseUrlDeprecated$$module$src$url$$($additionalUrlParameters$jscomp$inline_1466_docInfo$jscomp$inline_5754_meta$jscomp$inline_5755_whitelist$jscomp$inline_5756$$.sourceUrl).origin) {
        $JSCompiler_inline_result$jscomp$5593_url$jscomp$inline_1469$$ = !0;
      } else {
        if (($additionalUrlParameters$jscomp$inline_1466_docInfo$jscomp$inline_5754_meta$jscomp$inline_5755_whitelist$jscomp$inline_5756$$ = $JSCompiler_StaticMethods_expandVarsForAnchor_$self_JSCompiler_StaticMethods_maybeExpandLink$self$jscomp$inline_1463_appendParams$jscomp$inline_1454_url$jscomp$inline_1452$$.ampdoc.getRootNode().querySelector("meta[name=amp-link-variable-allowed-origin]")) && $additionalUrlParameters$jscomp$inline_1466_docInfo$jscomp$inline_5754_meta$jscomp$inline_5755_whitelist$jscomp$inline_5756$$.hasAttribute("content")) {
          $additionalUrlParameters$jscomp$inline_1466_docInfo$jscomp$inline_5754_meta$jscomp$inline_5755_whitelist$jscomp$inline_5756$$ = $additionalUrlParameters$jscomp$inline_1466_docInfo$jscomp$inline_5754_meta$jscomp$inline_5755_whitelist$jscomp$inline_5756$$.getAttribute("content").trim().split(/\s+/);
          for (var $i$jscomp$inline_5757$$ = 0; $i$jscomp$inline_5757$$ < $additionalUrlParameters$jscomp$inline_1466_docInfo$jscomp$inline_5754_meta$jscomp$inline_5755_whitelist$jscomp$inline_5756$$.length; $i$jscomp$inline_5757$$++) {
            if ($JSCompiler_inline_result$jscomp$5593_url$jscomp$inline_1469$$.origin == _.$parseUrlDeprecated$$module$src$url$$($additionalUrlParameters$jscomp$inline_1466_docInfo$jscomp$inline_5754_meta$jscomp$inline_5755_whitelist$jscomp$inline_5756$$[$i$jscomp$inline_5757$$]).origin) {
              $JSCompiler_inline_result$jscomp$5593_url$jscomp$inline_1469$$ = !0;
              break b;
            }
          }
        }
        $JSCompiler_inline_result$jscomp$5593_url$jscomp$inline_1469$$ = !1;
      }
    }
    $JSCompiler_inline_result$jscomp$5593_url$jscomp$inline_1469$$ ? ($additionalUrlParams$jscomp$inline_1457_defaultExpandParamsUrl_defaultUrlParams$jscomp$inline_1465_existParams$jscomp$inline_1460_loc$jscomp$inline_1459_params$jscomp$inline_1453_url$jscomp$inline_5748$$ && ($href$jscomp$inline_1458_i$128$jscomp$inline_1461_i$jscomp$inline_1455_i$jscomp$inline_5749_whitelist$jscomp$inline_1467$$ && $href$jscomp$inline_1458_i$128$jscomp$inline_1461_i$jscomp$inline_1455_i$jscomp$inline_5749_whitelist$jscomp$inline_1467$$.QUERY_PARAM || 
    ($additionalUrlParams$jscomp$inline_1457_defaultExpandParamsUrl_defaultUrlParams$jscomp$inline_1465_existParams$jscomp$inline_1460_loc$jscomp$inline_1459_params$jscomp$inline_1453_url$jscomp$inline_5748$$ = _.$JSCompiler_StaticMethods_expandUrlSync$$($JSCompiler_StaticMethods_expandVarsForAnchor_$self_JSCompiler_StaticMethods_maybeExpandLink$self$jscomp$inline_1463_appendParams$jscomp$inline_1454_url$jscomp$inline_1452$$, $additionalUrlParams$jscomp$inline_1457_defaultExpandParamsUrl_defaultUrlParams$jscomp$inline_1465_existParams$jscomp$inline_1460_loc$jscomp$inline_1459_params$jscomp$inline_1453_url$jscomp$inline_5748$$, 
    void 0, void 0, {QUERY_PARAM:!0})), $href$jscomp$inline_1468_param$jscomp$inline_1456_param$jscomp$inline_5750$$ = _.$addParamsToUrl$$module$src$url$$($href$jscomp$inline_1468_param$jscomp$inline_1456_param$jscomp$inline_5750$$, _.$parseQueryString_$$module$src$url_parse_query_string$$($additionalUrlParams$jscomp$inline_1457_defaultExpandParamsUrl_defaultUrlParams$jscomp$inline_1465_existParams$jscomp$inline_1460_loc$jscomp$inline_1459_params$jscomp$inline_1453_url$jscomp$inline_5748$$))), $href$jscomp$inline_1458_i$128$jscomp$inline_1461_i$jscomp$inline_1455_i$jscomp$inline_5749_whitelist$jscomp$inline_1467$$ && 
    ($href$jscomp$inline_1468_param$jscomp$inline_1456_param$jscomp$inline_5750$$ = _.$JSCompiler_StaticMethods_expandUrlSync$$($JSCompiler_StaticMethods_expandVarsForAnchor_$self_JSCompiler_StaticMethods_maybeExpandLink$self$jscomp$inline_1463_appendParams$jscomp$inline_1454_url$jscomp$inline_1452$$, $href$jscomp$inline_1468_param$jscomp$inline_1456_param$jscomp$inline_5750$$, void 0, void 0, $href$jscomp$inline_1458_i$128$jscomp$inline_1461_i$jscomp$inline_1455_i$jscomp$inline_5749_whitelist$jscomp$inline_1467$$))) : 
    $href$jscomp$inline_1458_i$128$jscomp$inline_1461_i$jscomp$inline_1455_i$jscomp$inline_5749_whitelist$jscomp$inline_1467$$ && _.$user$$module$src$log$$().$Log$$module$src$log_prototype$warn$("URL", "Ignoring link replacement", $href$jscomp$inline_1468_param$jscomp$inline_1456_param$jscomp$inline_5750$$, " because the link does not go to the document's source, canonical, or whitelisted origin.");
    $el$jscomp$12$$.href = $href$jscomp$inline_1468_param$jscomp$inline_1456_param$jscomp$inline_5750$$;
  }
};
$JSCompiler_StaticMethods_handleA2AClick_$$ = function($JSCompiler_StaticMethods_handleA2AClick_$self$$, $e$jscomp$71$$, $target$jscomp$90$$, $location$jscomp$27$$) {
  return $target$jscomp$90$$.hasAttribute("rel") && $target$jscomp$90$$.getAttribute("rel").split(" ").map(function($JSCompiler_StaticMethods_handleA2AClick_$self$$) {
    return $JSCompiler_StaticMethods_handleA2AClick_$self$$.trim();
  }).includes("amphtml") ? _.$JSCompiler_StaticMethods_navigateToAmpUrl$$($JSCompiler_StaticMethods_handleA2AClick_$self$$, $location$jscomp$27$$.href, "<a rel=amphtml>") ? ($e$jscomp$71$$.preventDefault(), !0) : !1 : !1;
};
$JSCompiler_StaticMethods_handleNavClick_$$ = function($JSCompiler_StaticMethods_handleNavClick_$self$$, $e$jscomp$72$$, $escapedHash_internalElm_target$jscomp$91$$, $targetAttr_tgtLoc$$) {
  var $curLoc$$ = $JSCompiler_StaticMethods_parseUrl_$$($JSCompiler_StaticMethods_handleNavClick_$self$$, ""), $tgtHref$$ = $targetAttr_tgtLoc$$.origin + $targetAttr_tgtLoc$$.pathname + $targetAttr_tgtLoc$$.search, $curHref$$ = $curLoc$$.origin + $curLoc$$.pathname + $curLoc$$.search;
  if ($targetAttr_tgtLoc$$.hash && $tgtHref$$ == $curHref$$) {
    if ($e$jscomp$72$$.preventDefault(), !$JSCompiler_StaticMethods_handleNavClick_$self$$.$I$) {
      var $hash$jscomp$4$$ = $targetAttr_tgtLoc$$.hash.slice(1), $elem$jscomp$1$$ = null;
      $hash$jscomp$4$$ && ($escapedHash_internalElm_target$jscomp$91$$ = _.$cssEscape$$module$third_party$css_escape$css_escape$$($hash$jscomp$4$$), $elem$jscomp$1$$ = $JSCompiler_StaticMethods_handleNavClick_$self$$.$D$.getElementById($hash$jscomp$4$$) || $JSCompiler_StaticMethods_handleNavClick_$self$$.$D$.querySelector('a[name="' + $escapedHash_internalElm_target$jscomp$91$$ + '"]'));
      $targetAttr_tgtLoc$$.hash != $curLoc$$.hash ? $JSCompiler_StaticMethods_History$$module$src$service$history_impl_prototype$replaceStateForTarget$$($JSCompiler_StaticMethods_handleNavClick_$self$$.$history_$, $targetAttr_tgtLoc$$.hash).then(function() {
        $JSCompiler_StaticMethods_scrollToElement_$$($JSCompiler_StaticMethods_handleNavClick_$self$$, $elem$jscomp$1$$, $hash$jscomp$4$$);
      }) : $JSCompiler_StaticMethods_scrollToElement_$$($JSCompiler_StaticMethods_handleNavClick_$self$$, $elem$jscomp$1$$, $hash$jscomp$4$$);
    }
  } else {
    $JSCompiler_StaticMethods_handleNavClick_$self$$.$I$ || $JSCompiler_StaticMethods_handleNavClick_$self$$.$U$ ? ($targetAttr_tgtLoc$$ = ($escapedHash_internalElm_target$jscomp$91$$.getAttribute("target") || "").toLowerCase(), "_top" != $targetAttr_tgtLoc$$ && "_blank" != $targetAttr_tgtLoc$$ && $escapedHash_internalElm_target$jscomp$91$$.setAttribute("target", "_blank")) : $JSCompiler_StaticMethods_isIe$$(_.$Services$$module$src$services$platformFor$$($JSCompiler_StaticMethods_handleNavClick_$self$$.ampdoc.$win$)) && 
    ($escapedHash_internalElm_target$jscomp$91$$ = $JSCompiler_StaticMethods_handleNavClick_$self$$.ampdoc.getElementById($targetAttr_tgtLoc$$.hash.substring(1))) && (/^(?:a|select|input|button|textarea)$/i.test($escapedHash_internalElm_target$jscomp$91$$.tagName) || ($escapedHash_internalElm_target$jscomp$91$$.tabIndex = -1), _.$tryFocus$$module$src$dom$$($escapedHash_internalElm_target$jscomp$91$$));
  }
};
$JSCompiler_StaticMethods_scrollToElement_$$ = function($JSCompiler_StaticMethods_scrollToElement_$self$$, $elem$jscomp$2$$, $hash$jscomp$5$$) {
  $elem$jscomp$2$$ ? ($JSCompiler_StaticMethods_Viewport$$module$src$service$viewport$viewport_impl_prototype$scrollIntoView$$($JSCompiler_StaticMethods_scrollToElement_$self$$.$viewport_$, $elem$jscomp$2$$), _.$Services$$module$src$services$timerFor$$($JSCompiler_StaticMethods_scrollToElement_$self$$.ampdoc.$win$).delay(function() {
    return $JSCompiler_StaticMethods_Viewport$$module$src$service$viewport$viewport_impl_prototype$scrollIntoView$$($JSCompiler_StaticMethods_scrollToElement_$self$$.$viewport_$, $elem$jscomp$2$$);
  }, 1)) : _.$dev$$module$src$log$$().$Log$$module$src$log_prototype$warn$("navigation", "failed to find element with id=" + $hash$jscomp$5$$ + " or a[name=" + $hash$jscomp$5$$ + "]");
};
$JSCompiler_StaticMethods_parseUrl_$$ = function($JSCompiler_StaticMethods_parseUrl_$self$$, $url$jscomp$70$$) {
  return _.$Services$$module$src$services$urlForDoc$$($JSCompiler_StaticMethods_parseUrl_$self$$.$O$).parse($url$jscomp$70$$);
};
$maybeExpandUrlParams$$module$src$service$navigation$$ = function($ampdoc$jscomp$49_target$jscomp$92$$, $e$jscomp$73$$) {
  if (($ampdoc$jscomp$49_target$jscomp$92$$ = _.$closestByTag$$module$src$dom$$($e$jscomp$73$$.target, "A")) && $ampdoc$jscomp$49_target$jscomp$92$$.href) {
    var $hrefToExpand$$ = $ampdoc$jscomp$49_target$jscomp$92$$.getAttribute("data-a4a-orig-href") || $ampdoc$jscomp$49_target$jscomp$92$$.getAttribute("href");
    if ($hrefToExpand$$) {
      var $newHref$jscomp$1$$ = _.$JSCompiler_StaticMethods_expandUrlSync$$(_.$Services$$module$src$services$urlReplacementsForDoc$$($ampdoc$jscomp$49_target$jscomp$92$$), $hrefToExpand$$, {CLICK_X:function() {
        return $e$jscomp$73$$.pageX;
      }, CLICK_Y:function() {
        return $e$jscomp$73$$.pageY;
      }}, void 0, {CLICK_X:!0, CLICK_Y:!0});
      $newHref$jscomp$1$$ != $hrefToExpand$$ && ($ampdoc$jscomp$49_target$jscomp$92$$.getAttribute("data-a4a-orig-href") || $ampdoc$jscomp$49_target$jscomp$92$$.setAttribute("data-a4a-orig-href", $hrefToExpand$$), $ampdoc$jscomp$49_target$jscomp$92$$.setAttribute("href", $newHref$jscomp$1$$));
    }
  }
};
$Platform$$module$src$service$platform_impl$$ = function($win$jscomp$168$$) {
  this.$D$ = $win$jscomp$168$$.navigator;
};
_.$JSCompiler_StaticMethods_isIos$$ = function($JSCompiler_StaticMethods_isIos$self$$) {
  return /iPhone|iPad|iPod/i.test($JSCompiler_StaticMethods_isIos$self$$.$D$.userAgent);
};
_.$JSCompiler_StaticMethods_isSafari$$ = function($JSCompiler_StaticMethods_isSafari$self$$) {
  return /Safari/i.test($JSCompiler_StaticMethods_isSafari$self$$.$D$.userAgent) && !_.$JSCompiler_StaticMethods_isChrome$$($JSCompiler_StaticMethods_isSafari$self$$) && !$JSCompiler_StaticMethods_isIe$$($JSCompiler_StaticMethods_isSafari$self$$) && !_.$JSCompiler_StaticMethods_isEdge$$($JSCompiler_StaticMethods_isSafari$self$$) && !$JSCompiler_StaticMethods_isFirefox$$($JSCompiler_StaticMethods_isSafari$self$$) && !$JSCompiler_StaticMethods_isOpera$$($JSCompiler_StaticMethods_isSafari$self$$);
};
_.$JSCompiler_StaticMethods_isChrome$$ = function($JSCompiler_StaticMethods_isChrome$self$$) {
  return /Chrome|CriOS/i.test($JSCompiler_StaticMethods_isChrome$self$$.$D$.userAgent) && !_.$JSCompiler_StaticMethods_isEdge$$($JSCompiler_StaticMethods_isChrome$self$$) && !$JSCompiler_StaticMethods_isOpera$$($JSCompiler_StaticMethods_isChrome$self$$);
};
$JSCompiler_StaticMethods_isFirefox$$ = function($JSCompiler_StaticMethods_isFirefox$self$$) {
  return /Firefox|FxiOS/i.test($JSCompiler_StaticMethods_isFirefox$self$$.$D$.userAgent) && !_.$JSCompiler_StaticMethods_isEdge$$($JSCompiler_StaticMethods_isFirefox$self$$);
};
$JSCompiler_StaticMethods_isOpera$$ = function($JSCompiler_StaticMethods_isOpera$self$$) {
  return /OPR\/|Opera|OPiOS/i.test($JSCompiler_StaticMethods_isOpera$self$$.$D$.userAgent);
};
$JSCompiler_StaticMethods_isIe$$ = function($JSCompiler_StaticMethods_isIe$self$$) {
  return /Trident|MSIE|IEMobile/i.test($JSCompiler_StaticMethods_isIe$self$$.$D$.userAgent);
};
_.$JSCompiler_StaticMethods_isEdge$$ = function($JSCompiler_StaticMethods_isEdge$self$$) {
  return /Edge/i.test($JSCompiler_StaticMethods_isEdge$self$$.$D$.userAgent);
};
_.$JSCompiler_StaticMethods_getMajorVersion$$ = function($JSCompiler_StaticMethods_getMajorVersion$self_JSCompiler_temp$jscomp$483_JSCompiler_temp$jscomp$484_currentIosVersion$jscomp$inline_1472$$) {
  _.$JSCompiler_StaticMethods_isSafari$$($JSCompiler_StaticMethods_getMajorVersion$self_JSCompiler_temp$jscomp$483_JSCompiler_temp$jscomp$484_currentIosVersion$jscomp$inline_1472$$) ? _.$JSCompiler_StaticMethods_isIos$$($JSCompiler_StaticMethods_getMajorVersion$self_JSCompiler_temp$jscomp$483_JSCompiler_temp$jscomp$484_currentIosVersion$jscomp$inline_1472$$) ? ($JSCompiler_StaticMethods_getMajorVersion$self_JSCompiler_temp$jscomp$483_JSCompiler_temp$jscomp$484_currentIosVersion$jscomp$inline_1472$$ = 
  _.$JSCompiler_StaticMethods_getIosVersionString$$($JSCompiler_StaticMethods_getMajorVersion$self_JSCompiler_temp$jscomp$483_JSCompiler_temp$jscomp$484_currentIosVersion$jscomp$inline_1472$$), $JSCompiler_StaticMethods_getMajorVersion$self_JSCompiler_temp$jscomp$483_JSCompiler_temp$jscomp$484_currentIosVersion$jscomp$inline_1472$$ = ("" == $JSCompiler_StaticMethods_getMajorVersion$self_JSCompiler_temp$jscomp$483_JSCompiler_temp$jscomp$484_currentIosVersion$jscomp$inline_1472$$ ? null : Number($JSCompiler_StaticMethods_getMajorVersion$self_JSCompiler_temp$jscomp$483_JSCompiler_temp$jscomp$484_currentIosVersion$jscomp$inline_1472$$.split(".")[0])) || 
  0) : $JSCompiler_StaticMethods_getMajorVersion$self_JSCompiler_temp$jscomp$483_JSCompiler_temp$jscomp$484_currentIosVersion$jscomp$inline_1472$$ = $JSCompiler_StaticMethods_evalMajorVersion_$$($JSCompiler_StaticMethods_getMajorVersion$self_JSCompiler_temp$jscomp$483_JSCompiler_temp$jscomp$484_currentIosVersion$jscomp$inline_1472$$, /\sVersion\/(\d+)/, 1) : $JSCompiler_StaticMethods_getMajorVersion$self_JSCompiler_temp$jscomp$483_JSCompiler_temp$jscomp$484_currentIosVersion$jscomp$inline_1472$$ = 
  _.$JSCompiler_StaticMethods_isChrome$$($JSCompiler_StaticMethods_getMajorVersion$self_JSCompiler_temp$jscomp$483_JSCompiler_temp$jscomp$484_currentIosVersion$jscomp$inline_1472$$) ? $JSCompiler_StaticMethods_evalMajorVersion_$$($JSCompiler_StaticMethods_getMajorVersion$self_JSCompiler_temp$jscomp$483_JSCompiler_temp$jscomp$484_currentIosVersion$jscomp$inline_1472$$, /(Chrome|CriOS)\/(\d+)/, 2) : $JSCompiler_StaticMethods_isFirefox$$($JSCompiler_StaticMethods_getMajorVersion$self_JSCompiler_temp$jscomp$483_JSCompiler_temp$jscomp$484_currentIosVersion$jscomp$inline_1472$$) ? 
  $JSCompiler_StaticMethods_evalMajorVersion_$$($JSCompiler_StaticMethods_getMajorVersion$self_JSCompiler_temp$jscomp$483_JSCompiler_temp$jscomp$484_currentIosVersion$jscomp$inline_1472$$, /(Firefox|FxiOS)\/(\d+)/, 2) : $JSCompiler_StaticMethods_isOpera$$($JSCompiler_StaticMethods_getMajorVersion$self_JSCompiler_temp$jscomp$483_JSCompiler_temp$jscomp$484_currentIosVersion$jscomp$inline_1472$$) ? $JSCompiler_StaticMethods_evalMajorVersion_$$($JSCompiler_StaticMethods_getMajorVersion$self_JSCompiler_temp$jscomp$483_JSCompiler_temp$jscomp$484_currentIosVersion$jscomp$inline_1472$$, 
  /(OPR|Opera|OPiOS)\/(\d+)/, 2) : $JSCompiler_StaticMethods_isIe$$($JSCompiler_StaticMethods_getMajorVersion$self_JSCompiler_temp$jscomp$483_JSCompiler_temp$jscomp$484_currentIosVersion$jscomp$inline_1472$$) ? $JSCompiler_StaticMethods_evalMajorVersion_$$($JSCompiler_StaticMethods_getMajorVersion$self_JSCompiler_temp$jscomp$483_JSCompiler_temp$jscomp$484_currentIosVersion$jscomp$inline_1472$$, /MSIE\s(\d+)/, 1) : _.$JSCompiler_StaticMethods_isEdge$$($JSCompiler_StaticMethods_getMajorVersion$self_JSCompiler_temp$jscomp$483_JSCompiler_temp$jscomp$484_currentIosVersion$jscomp$inline_1472$$) ? 
  $JSCompiler_StaticMethods_evalMajorVersion_$$($JSCompiler_StaticMethods_getMajorVersion$self_JSCompiler_temp$jscomp$483_JSCompiler_temp$jscomp$484_currentIosVersion$jscomp$inline_1472$$, /Edge\/(\d+)/, 1) : 0;
  return $JSCompiler_StaticMethods_getMajorVersion$self_JSCompiler_temp$jscomp$483_JSCompiler_temp$jscomp$484_currentIosVersion$jscomp$inline_1472$$;
};
$JSCompiler_StaticMethods_evalMajorVersion_$$ = function($JSCompiler_StaticMethods_evalMajorVersion_$self_res$jscomp$12$$, $expr$jscomp$5$$, $index$jscomp$64$$) {
  if (!$JSCompiler_StaticMethods_evalMajorVersion_$self_res$jscomp$12$$.$D$.userAgent) {
    return 0;
  }
  $JSCompiler_StaticMethods_evalMajorVersion_$self_res$jscomp$12$$ = $JSCompiler_StaticMethods_evalMajorVersion_$self_res$jscomp$12$$.$D$.userAgent.match($expr$jscomp$5$$);
  return !$JSCompiler_StaticMethods_evalMajorVersion_$self_res$jscomp$12$$ || $index$jscomp$64$$ >= $JSCompiler_StaticMethods_evalMajorVersion_$self_res$jscomp$12$$.length ? 0 : (0,window.parseInt)($JSCompiler_StaticMethods_evalMajorVersion_$self_res$jscomp$12$$[$index$jscomp$64$$], 10);
};
_.$JSCompiler_StaticMethods_getIosVersionString$$ = function($JSCompiler_StaticMethods_getIosVersionString$self_version$jscomp$6$$) {
  if (!$JSCompiler_StaticMethods_getIosVersionString$self_version$jscomp$6$$.$D$.userAgent || !_.$JSCompiler_StaticMethods_isIos$$($JSCompiler_StaticMethods_getIosVersionString$self_version$jscomp$6$$)) {
    return "";
  }
  $JSCompiler_StaticMethods_getIosVersionString$self_version$jscomp$6$$ = $JSCompiler_StaticMethods_getIosVersionString$self_version$jscomp$6$$.$D$.userAgent.match(/OS ([0-9]+[_.][0-9]+([_.][0-9]+)?)\b/);
  return $JSCompiler_StaticMethods_getIosVersionString$self_version$jscomp$6$$ ? $JSCompiler_StaticMethods_getIosVersionString$self_version$jscomp$6$$ = $JSCompiler_StaticMethods_getIosVersionString$self_version$jscomp$6$$[1].replace(/_/g, ".") : "";
};
_.$FiniteStateMachine$$module$src$finite_state_machine$$ = function($initialState$$) {
  this.$state_$ = $initialState$$;
  this.$D$ = Object.create(null);
};
_.$JSCompiler_StaticMethods_addTransition$$ = function($JSCompiler_StaticMethods_addTransition$self$$, $oldState$$, $newState$jscomp$8$$, $callback$jscomp$73$$) {
  $JSCompiler_StaticMethods_addTransition$self$$.$D$[$oldState$$ + "|" + $newState$jscomp$8$$] = $callback$jscomp$73$$;
};
$FocusHistory$$module$src$focus_history$$ = function($win$jscomp$169$$) {
  var $$jscomp$this$jscomp$78$$ = this;
  this.$win$ = $win$jscomp$169$$;
  this.$history_$ = [];
  this.$D$ = new _.$Observable$$module$src$observable$$;
  this.$G$ = function($win$jscomp$169$$) {
    $win$jscomp$169$$.target && 1 == $win$jscomp$169$$.target.nodeType && $JSCompiler_StaticMethods_pushFocus_$$($$jscomp$this$jscomp$78$$, $win$jscomp$169$$.target);
  };
  this.$F$ = function() {
    _.$Services$$module$src$services$timerFor$$($win$jscomp$169$$).delay(function() {
      $JSCompiler_StaticMethods_pushFocus_$$($$jscomp$this$jscomp$78$$, $$jscomp$this$jscomp$78$$.$win$.document.activeElement);
    }, 500);
  };
  this.$win$.document.addEventListener("focus", this.$G$, !0);
  this.$win$.addEventListener("blur", this.$F$);
};
$JSCompiler_StaticMethods_FocusHistory$$module$src$focus_history_prototype$onFocus$$ = function($JSCompiler_StaticMethods_FocusHistory$$module$src$focus_history_prototype$onFocus$self$$, $handler$jscomp$21$$) {
  $JSCompiler_StaticMethods_FocusHistory$$module$src$focus_history_prototype$onFocus$self$$.$D$.add($handler$jscomp$21$$);
};
$JSCompiler_StaticMethods_pushFocus_$$ = function($JSCompiler_StaticMethods_pushFocus_$self$$, $element$jscomp$119$$) {
  var $now$jscomp$4$$ = Date.now();
  0 == $JSCompiler_StaticMethods_pushFocus_$self$$.$history_$.length || $JSCompiler_StaticMethods_pushFocus_$self$$.$history_$[$JSCompiler_StaticMethods_pushFocus_$self$$.$history_$.length - 1].$el$ != $element$jscomp$119$$ ? $JSCompiler_StaticMethods_pushFocus_$self$$.$history_$.push({$el$:$element$jscomp$119$$, time:$now$jscomp$4$$}) : $JSCompiler_StaticMethods_pushFocus_$self$$.$history_$[$JSCompiler_StaticMethods_pushFocus_$self$$.$history_$.length - 1].time = $now$jscomp$4$$;
  for (var $index$jscomp$inline_1476$$ = $JSCompiler_StaticMethods_pushFocus_$self$$.$history_$.length - 1, $i$jscomp$inline_1477$$ = 0; $i$jscomp$inline_1477$$ < $JSCompiler_StaticMethods_pushFocus_$self$$.$history_$.length; $i$jscomp$inline_1477$$++) {
    if ($JSCompiler_StaticMethods_pushFocus_$self$$.$history_$[$i$jscomp$inline_1477$$].time >= $now$jscomp$4$$ - 6E4) {
      $index$jscomp$inline_1476$$ = $i$jscomp$inline_1477$$ - 1;
      break;
    }
  }
  -1 != $index$jscomp$inline_1476$$ && $JSCompiler_StaticMethods_pushFocus_$self$$.$history_$.splice(0, $index$jscomp$inline_1476$$ + 1);
  $JSCompiler_StaticMethods_pushFocus_$self$$.$D$.$fire$($element$jscomp$119$$);
};
$JSCompiler_StaticMethods_hasDescendantsOf$$ = function($JSCompiler_StaticMethods_hasDescendantsOf$self$$, $element$jscomp$120$$) {
  $JSCompiler_StaticMethods_hasDescendantsOf$self$$.$win$.document.activeElement && $JSCompiler_StaticMethods_pushFocus_$$($JSCompiler_StaticMethods_hasDescendantsOf$self$$, $JSCompiler_StaticMethods_hasDescendantsOf$self$$.$win$.document.activeElement);
  for (var $i$jscomp$89$$ = 0; $i$jscomp$89$$ < $JSCompiler_StaticMethods_hasDescendantsOf$self$$.$history_$.length; $i$jscomp$89$$++) {
    if ($element$jscomp$120$$.contains($JSCompiler_StaticMethods_hasDescendantsOf$self$$.$history_$[$i$jscomp$89$$].$el$)) {
      return !0;
    }
  }
  return !1;
};
$checkAndFix$$module$src$service$ie_media_bug$$ = function($win$jscomp$170$$) {
  return !$JSCompiler_StaticMethods_isIe$$(_.$Services$$module$src$services$platformFor$$($win$jscomp$170$$)) || $matchMediaIeQuite$$module$src$service$ie_media_bug$$($win$jscomp$170$$) ? null : new window.Promise(function($resolve$jscomp$28$$) {
    var $endTime$jscomp$4$$ = Date.now() + 2000, $interval$jscomp$3$$ = $win$jscomp$170$$.setInterval(function() {
      var $now$jscomp$5$$ = Date.now(), $matches$jscomp$3$$ = $matchMediaIeQuite$$module$src$service$ie_media_bug$$($win$jscomp$170$$);
      if ($matches$jscomp$3$$ || $now$jscomp$5$$ > $endTime$jscomp$4$$) {
        $win$jscomp$170$$.clearInterval($interval$jscomp$3$$), $resolve$jscomp$28$$(), $matches$jscomp$3$$ || _.$dev$$module$src$log$$().error("ie-media-bug", "IE media never resolved");
      }
    }, 10);
  });
};
$matchMediaIeQuite$$module$src$service$ie_media_bug$$ = function($win$jscomp$171$$) {
  var $q$$ = "(min-width: " + ($win$jscomp$171$$.innerWidth - 1) + "px)" + (" AND (max-width: " + ($win$jscomp$171$$.innerWidth + 1) + "px)");
  try {
    return $win$jscomp$171$$.matchMedia($q$$).matches;
  } catch ($e$jscomp$75$$) {
    return _.$dev$$module$src$log$$().error("ie-media-bug", "IE matchMedia failed: ", $e$jscomp$75$$), !0;
  }
};
$TaskQueue$$module$src$service$task_queue$$ = function() {
  this.$D$ = [];
  this.$F$ = {};
  this.$G$ = 0;
};
$JSCompiler_StaticMethods_TaskQueue$$module$src$service$task_queue_prototype$enqueue$$ = function($JSCompiler_StaticMethods_TaskQueue$$module$src$service$task_queue_prototype$enqueue$self$$, $task$jscomp$2$$) {
  $JSCompiler_StaticMethods_TaskQueue$$module$src$service$task_queue_prototype$enqueue$self$$.$D$.push($task$jscomp$2$$);
  $JSCompiler_StaticMethods_TaskQueue$$module$src$service$task_queue_prototype$enqueue$self$$.$F$[$task$jscomp$2$$.id] = $task$jscomp$2$$;
};
$JSCompiler_StaticMethods_TaskQueue$$module$src$service$task_queue_prototype$dequeue$$ = function($JSCompiler_StaticMethods_TaskQueue$$module$src$service$task_queue_prototype$dequeue$self$$, $task$jscomp$3$$) {
  $JSCompiler_StaticMethods_removeAtIndex$$($JSCompiler_StaticMethods_TaskQueue$$module$src$service$task_queue_prototype$dequeue$self$$, $task$jscomp$3$$, $JSCompiler_StaticMethods_TaskQueue$$module$src$service$task_queue_prototype$dequeue$self$$.$D$.indexOf($JSCompiler_StaticMethods_TaskQueue$$module$src$service$task_queue_prototype$dequeue$self$$.$F$[$task$jscomp$3$$.id])) && ($JSCompiler_StaticMethods_TaskQueue$$module$src$service$task_queue_prototype$dequeue$self$$.$G$ = Date.now());
};
$JSCompiler_StaticMethods_TaskQueue$$module$src$service$task_queue_prototype$peek$$ = function($JSCompiler_StaticMethods_TaskQueue$$module$src$service$task_queue_prototype$peek$self$$, $scorer$$, $state$jscomp$21$$) {
  for (var $minScore$$ = 1e6, $minTask$$ = null, $i$jscomp$90$$ = 0; $i$jscomp$90$$ < $JSCompiler_StaticMethods_TaskQueue$$module$src$service$task_queue_prototype$peek$self$$.$D$.length; $i$jscomp$90$$++) {
    var $task$jscomp$4$$ = $JSCompiler_StaticMethods_TaskQueue$$module$src$service$task_queue_prototype$peek$self$$.$D$[$i$jscomp$90$$], $score$$ = $scorer$$($task$jscomp$4$$, $state$jscomp$21$$);
    $score$$ < $minScore$$ && ($minScore$$ = $score$$, $minTask$$ = $task$jscomp$4$$);
  }
  return $minTask$$;
};
$JSCompiler_StaticMethods_removeAtIndex$$ = function($JSCompiler_StaticMethods_removeAtIndex$self$$, $task$jscomp$5$$, $index$jscomp$66$$) {
  var $existing$jscomp$3$$ = $JSCompiler_StaticMethods_removeAtIndex$self$$.$F$[$task$jscomp$5$$.id];
  if (!$existing$jscomp$3$$ || $JSCompiler_StaticMethods_removeAtIndex$self$$.$D$[$index$jscomp$66$$] != $existing$jscomp$3$$) {
    return !1;
  }
  $JSCompiler_StaticMethods_removeAtIndex$self$$.$D$.splice($index$jscomp$66$$, 1);
  delete $JSCompiler_StaticMethods_removeAtIndex$self$$.$F$[$task$jscomp$5$$.id];
  return !0;
};
$JSCompiler_StaticMethods_purge$$ = function($JSCompiler_StaticMethods_purge$self$$, $callback$jscomp$76$$) {
  for (var $index$jscomp$67$$ = $JSCompiler_StaticMethods_purge$self$$.$D$.length; $index$jscomp$67$$--;) {
    $callback$jscomp$76$$($JSCompiler_StaticMethods_purge$self$$.$D$[$index$jscomp$67$$]) && $JSCompiler_StaticMethods_removeAtIndex$$($JSCompiler_StaticMethods_purge$self$$, $JSCompiler_StaticMethods_purge$self$$.$D$[$index$jscomp$67$$], $index$jscomp$67$$);
  }
};
_.$Resources$$module$src$service$resources_impl$$ = function($ampdoc$jscomp$50_layers$jscomp$3$$) {
  var $$jscomp$this$jscomp$79$$ = this;
  this.ampdoc = $ampdoc$jscomp$50_layers$jscomp$3$$;
  this.$win$ = $ampdoc$jscomp$50_layers$jscomp$3$$.$win$;
  this.$viewer_$ = _.$Services$$module$src$services$viewerForDoc$$($ampdoc$jscomp$50_layers$jscomp$3$$);
  this.$ea$ = this.$viewer_$.$O$;
  this.$wa$ = this.$win$.devicePixelRatio || 1;
  this.$xa$ = 0;
  this.$D$ = [];
  this.$va$ = this.$ma$ = 0;
  this.$visible_$ = _.$JSCompiler_StaticMethods_Viewer$$module$src$service$viewer_impl_prototype$isVisible$$(this.$viewer_$);
  this.$fa$ = this.$viewer_$.$P$;
  this.$P$ = !1;
  this.$oa$ = !0;
  this.$V$ = !1;
  this.$U$ = -1;
  this.$O$ = !0;
  this.$R$ = -1;
  this.$aa$ = this.$Y$ = 0;
  this.$ka$ = new _.$Pass$$module$src$pass$$(this.$win$, function() {
    return $JSCompiler_StaticMethods_doPass$$($$jscomp$this$jscomp$79$$);
  });
  this.$qa$ = new _.$Pass$$module$src$pass$$(this.$win$, function() {
    $$jscomp$this$jscomp$79$$.$O$ = !0;
    _.$JSCompiler_StaticMethods_schedulePass$$($$jscomp$this$jscomp$79$$);
  });
  this.$I$ = new $TaskQueue$$module$src$service$task_queue$$;
  this.$F$ = new $TaskQueue$$module$src$service$task_queue$$;
  this.$na$ = (this.$useLayers_$ = _.$isExperimentOn$$module$src$experiments$$(this.$win$, "layers")) ? this.$calcTaskScoreLayers_$.bind(this) : this.$calcTaskScore_$.bind(this);
  this.$G$ = [];
  this.$J$ = [];
  this.$ga$ = !1;
  this.$viewport_$ = _.$Services$$module$src$services$viewportForDoc$$(this.ampdoc);
  this.$vsync_$ = _.$Services$$module$src$services$vsyncFor$$(this.$win$);
  this.$la$ = new $FocusHistory$$module$src$focus_history$$(this.$win$);
  this.$ha$ = !1;
  this.$W$ = 0;
  this.$K$ = !1;
  this.$ba$ = [];
  this.$ra$ = new _.$FiniteStateMachine$$module$src$finite_state_machine$$(this.$viewer_$.$G$);
  $JSCompiler_StaticMethods_setupVisibilityStateMachine_$$(this, this.$ra$);
  _.$JSCompiler_StaticMethods_onChanged$$(this.$viewport_$, function($ampdoc$jscomp$50_layers$jscomp$3$$) {
    $$jscomp$this$jscomp$79$$.$Y$ = Date.now();
    $$jscomp$this$jscomp$79$$.$aa$ = $ampdoc$jscomp$50_layers$jscomp$3$$.$velocity$;
    $ampdoc$jscomp$50_layers$jscomp$3$$.$relayoutAll$ && ($$jscomp$this$jscomp$79$$.$O$ = !0, $$jscomp$this$jscomp$79$$.$K$ = !0);
    _.$JSCompiler_StaticMethods_schedulePass$$($$jscomp$this$jscomp$79$$);
  });
  _.$JSCompiler_StaticMethods_Viewport$$module$src$service$viewport$viewport_impl_prototype$onScroll$$(this.$viewport_$, function() {
    $$jscomp$this$jscomp$79$$.$Y$ = Date.now();
  });
  this.$useLayers_$ && (this.$ia$ = $ampdoc$jscomp$50_layers$jscomp$3$$ = _.$getServiceForDoc$$module$src$service$$(this.ampdoc, "layers"), $JSCompiler_StaticMethods_LayoutLayers$$module$src$service$layers_impl_prototype$onScroll$$($ampdoc$jscomp$50_layers$jscomp$3$$, function() {
    _.$JSCompiler_StaticMethods_schedulePass$$($$jscomp$this$jscomp$79$$);
  }), this.$sa$ = this.$calcLayoutScore_$.bind(this));
  _.$JSCompiler_StaticMethods_Viewer$$module$src$service$viewer_impl_prototype$onVisibilityChanged$$(this.$viewer_$, function() {
    -1 == $$jscomp$this$jscomp$79$$.$U$ && _.$JSCompiler_StaticMethods_Viewer$$module$src$service$viewer_impl_prototype$isVisible$$($$jscomp$this$jscomp$79$$.$viewer_$) && ($$jscomp$this$jscomp$79$$.$U$ = Date.now());
    _.$JSCompiler_StaticMethods_schedulePass$$($$jscomp$this$jscomp$79$$);
  });
  $JSCompiler_StaticMethods_onRuntimeState$$(this.$viewer_$, function($ampdoc$jscomp$50_layers$jscomp$3$$) {
    "Resources";
    $$jscomp$this$jscomp$79$$.$ea$ = $ampdoc$jscomp$50_layers$jscomp$3$$;
    _.$JSCompiler_StaticMethods_schedulePass$$($$jscomp$this$jscomp$79$$, 1);
  });
  $JSCompiler_StaticMethods_FocusHistory$$module$src$focus_history_prototype$onFocus$$(this.$la$, function($ampdoc$jscomp$50_layers$jscomp$3$$) {
    $JSCompiler_StaticMethods_checkPendingChangeSize_$$($$jscomp$this$jscomp$79$$, $ampdoc$jscomp$50_layers$jscomp$3$$);
  });
  _.$JSCompiler_StaticMethods_schedulePass$$(this);
  $JSCompiler_StaticMethods_rebuildDomWhenReady$$(this);
};
$JSCompiler_StaticMethods_rebuildDomWhenReady$$ = function($JSCompiler_StaticMethods_rebuildDomWhenReady$self$$) {
  $JSCompiler_StaticMethods_rebuildDomWhenReady$self$$.ampdoc.$whenReady$().then(function() {
    function $remeasure$$() {
      return _.$JSCompiler_StaticMethods_schedule$$($JSCompiler_StaticMethods_rebuildDomWhenReady$self$$.$qa$);
    }
    $JSCompiler_StaticMethods_rebuildDomWhenReady$self$$.$P$ = !0;
    $JSCompiler_StaticMethods_buildReadyResources_$$($JSCompiler_StaticMethods_rebuildDomWhenReady$self$$);
    $JSCompiler_StaticMethods_rebuildDomWhenReady$self$$.$J$ = null;
    var $fixPromise$$ = $checkAndFix$$module$src$service$ie_media_bug$$($JSCompiler_StaticMethods_rebuildDomWhenReady$self$$.$win$);
    $fixPromise$$ ? $fixPromise$$.then($remeasure$$) : $remeasure$$();
    $JSCompiler_StaticMethods_monitorInput_$$($JSCompiler_StaticMethods_rebuildDomWhenReady$self$$);
    window.Promise.race([_.$loadPromise$$module$src$event_helper$$($JSCompiler_StaticMethods_rebuildDomWhenReady$self$$.$win$), _.$Services$$module$src$services$timerFor$$($JSCompiler_StaticMethods_rebuildDomWhenReady$self$$.$win$).$promise$(3100)]).then($remeasure$$);
    $JSCompiler_StaticMethods_rebuildDomWhenReady$self$$.$win$.document.fonts && "loaded" != $JSCompiler_StaticMethods_rebuildDomWhenReady$self$$.$win$.document.fonts.status && $JSCompiler_StaticMethods_rebuildDomWhenReady$self$$.$win$.document.fonts.ready.then($remeasure$$);
  });
};
_.$JSCompiler_StaticMethods_getMeasuredResources$$ = function($JSCompiler_StaticMethods_getMeasuredResources$self$$, $hostWin$$, $filterFn$$) {
  return $JSCompiler_StaticMethods_getMeasuredResources$self$$.ampdoc.signals().whenSignal("ready-scan").then(function() {
    var $filterFn$$ = [];
    $JSCompiler_StaticMethods_getMeasuredResources$self$$.$D$.forEach(function($measurePromiseArray$$) {
      $measurePromiseArray$$.$D$ || $measurePromiseArray$$.$U$ != $hostWin$$ || $measurePromiseArray$$.$getOwner$() || $filterFn$$.push(_.$JSCompiler_StaticMethods_ensuredMeasured_$$($JSCompiler_StaticMethods_getMeasuredResources$self$$, $measurePromiseArray$$));
    });
    return window.Promise.all($filterFn$$);
  }).then(function() {
    return $JSCompiler_StaticMethods_getMeasuredResources$self$$.$D$.filter(function($JSCompiler_StaticMethods_getMeasuredResources$self$$) {
      return $JSCompiler_StaticMethods_getMeasuredResources$self$$.$U$ == $hostWin$$ && !$JSCompiler_StaticMethods_getMeasuredResources$self$$.$getOwner$() && !!$JSCompiler_StaticMethods_getMeasuredResources$self$$.$D$ && $filterFn$$($JSCompiler_StaticMethods_getMeasuredResources$self$$);
    });
  });
};
$JSCompiler_StaticMethods_getResourcesInRect$$ = function($JSCompiler_StaticMethods_getResourcesInRect$self$$, $hostWin$jscomp$1$$, $rect$jscomp$4$$, $opt_isInPrerender$$) {
  return _.$JSCompiler_StaticMethods_getMeasuredResources$$($JSCompiler_StaticMethods_getResourcesInRect$self$$, $hostWin$jscomp$1$$, function($JSCompiler_StaticMethods_getResourcesInRect$self$$) {
    return !_.$JSCompiler_StaticMethods_isDisplayed$$($JSCompiler_StaticMethods_getResourcesInRect$self$$) || !$JSCompiler_StaticMethods_overlaps$$($JSCompiler_StaticMethods_getResourcesInRect$self$$, $rect$jscomp$4$$) && !$JSCompiler_StaticMethods_getResourcesInRect$self$$.$V$ || $opt_isInPrerender$$ && !$JSCompiler_StaticMethods_getResourcesInRect$self$$.$prerenderAllowed$() ? !1 : !0;
  });
};
$JSCompiler_StaticMethods_monitorInput_$$ = function($JSCompiler_StaticMethods_monitorInput_$self$$) {
  var $input$jscomp$27$$ = _.$getService$$module$src$service$$($JSCompiler_StaticMethods_monitorInput_$self$$.$win$, "input");
  $JSCompiler_StaticMethods_onTouchDetected$$($input$jscomp$27$$, function($input$jscomp$27$$) {
    $JSCompiler_StaticMethods_toggleInputClass_$$($JSCompiler_StaticMethods_monitorInput_$self$$, "amp-mode-touch", $input$jscomp$27$$);
  });
  $JSCompiler_StaticMethods_onMouseDetected$$($input$jscomp$27$$, function($input$jscomp$27$$) {
    $JSCompiler_StaticMethods_toggleInputClass_$$($JSCompiler_StaticMethods_monitorInput_$self$$, "amp-mode-mouse", $input$jscomp$27$$);
  });
  $JSCompiler_StaticMethods_onKeyboardStateChanged$$($input$jscomp$27$$, function($input$jscomp$27$$) {
    $JSCompiler_StaticMethods_toggleInputClass_$$($JSCompiler_StaticMethods_monitorInput_$self$$, "amp-mode-keyboard-active", $input$jscomp$27$$);
  });
};
$JSCompiler_StaticMethods_toggleInputClass_$$ = function($JSCompiler_StaticMethods_toggleInputClass_$self$$, $clazz$$, $on$jscomp$2$$) {
  $JSCompiler_StaticMethods_toggleInputClass_$self$$.ampdoc.$whenBodyAvailable$().then(function($body$jscomp$3$$) {
    $JSCompiler_StaticMethods_toggleInputClass_$self$$.$vsync_$.$mutate$(function() {
      $body$jscomp$3$$.classList.toggle($clazz$$, $on$jscomp$2$$);
    });
  });
};
_.$JSCompiler_StaticMethods_ensuredMeasured_$$ = function($JSCompiler_StaticMethods_ensuredMeasured_$self$$, $resource$jscomp$1$$) {
  return $resource$jscomp$1$$.$D$ ? _.$tryResolve$$module$src$utils$promise$$(function() {
    return $resource$jscomp$1$$.$getPageLayoutBox$();
  }) : _.$JSCompiler_StaticMethods_measurePromise$$($JSCompiler_StaticMethods_ensuredMeasured_$self$$.$vsync_$, function() {
    $resource$jscomp$1$$.measure();
    return $resource$jscomp$1$$.$getPageLayoutBox$();
  });
};
$JSCompiler_StaticMethods_grantBuildPermission$$ = function($JSCompiler_StaticMethods_grantBuildPermission$self$$) {
  return 20 > $JSCompiler_StaticMethods_grantBuildPermission$self$$.$va$++ || $JSCompiler_StaticMethods_grantBuildPermission$self$$.$viewer_$.$R$;
};
$JSCompiler_StaticMethods_buildOrScheduleBuildForResource_$$ = function($JSCompiler_StaticMethods_buildOrScheduleBuildForResource_$self$$, $resource$jscomp$3$$, $checkForDupes$$) {
  $checkForDupes$$ = void 0 === $checkForDupes$$ ? !1 : $checkForDupes$$;
  var $scheduleWhenBuilt$$ = void 0 === $scheduleWhenBuilt$$ ? !0 : $scheduleWhenBuilt$$;
  var $shouldBuildResource$$ = "prerender" != $JSCompiler_StaticMethods_buildOrScheduleBuildForResource_$self$$.$viewer_$.$G$ || $resource$jscomp$3$$.$prerenderAllowed$();
  $JSCompiler_StaticMethods_buildOrScheduleBuildForResource_$self$$.$ea$ && $shouldBuildResource$$ && ($JSCompiler_StaticMethods_buildOrScheduleBuildForResource_$self$$.$P$ ? $JSCompiler_StaticMethods_buildResourceUnsafe_$$($JSCompiler_StaticMethods_buildOrScheduleBuildForResource_$self$$, $resource$jscomp$3$$, $scheduleWhenBuilt$$) : $resource$jscomp$3$$.element.$O$ || $resource$jscomp$3$$.$O$ || $checkForDupes$$ && $JSCompiler_StaticMethods_buildOrScheduleBuildForResource_$self$$.$J$.includes($resource$jscomp$3$$) || 
  ($JSCompiler_StaticMethods_buildOrScheduleBuildForResource_$self$$.$J$.push($resource$jscomp$3$$), $JSCompiler_StaticMethods_buildReadyResources_$$($JSCompiler_StaticMethods_buildOrScheduleBuildForResource_$self$$, $scheduleWhenBuilt$$)));
};
$JSCompiler_StaticMethods_buildReadyResources_$$ = function($JSCompiler_StaticMethods_buildReadyResources_$self$$, $scheduleWhenBuilt$jscomp$1_scheduleWhenBuilt$jscomp$inline_1482$$) {
  if (!$JSCompiler_StaticMethods_buildReadyResources_$self$$.$ga$) {
    try {
      $JSCompiler_StaticMethods_buildReadyResources_$self$$.$ga$ = !0;
      $scheduleWhenBuilt$jscomp$1_scheduleWhenBuilt$jscomp$inline_1482$$ = void 0 === $scheduleWhenBuilt$jscomp$1_scheduleWhenBuilt$jscomp$inline_1482$$ ? !0 : $scheduleWhenBuilt$jscomp$1_scheduleWhenBuilt$jscomp$inline_1482$$;
      $scheduleWhenBuilt$jscomp$1_scheduleWhenBuilt$jscomp$inline_1482$$ = void 0 === $scheduleWhenBuilt$jscomp$1_scheduleWhenBuilt$jscomp$inline_1482$$ ? !0 : $scheduleWhenBuilt$jscomp$1_scheduleWhenBuilt$jscomp$inline_1482$$;
      for (var $i$jscomp$inline_1483$$ = 0; $i$jscomp$inline_1483$$ < $JSCompiler_StaticMethods_buildReadyResources_$self$$.$J$.length; $i$jscomp$inline_1483$$++) {
        var $resource$jscomp$inline_1484$$ = $JSCompiler_StaticMethods_buildReadyResources_$self$$.$J$[$i$jscomp$inline_1483$$], $JSCompiler_temp$jscomp$5579$$;
        if (!($JSCompiler_temp$jscomp$5579$$ = $JSCompiler_StaticMethods_buildReadyResources_$self$$.$P$)) {
          a: {
            var $opt_stopNode$jscomp$inline_5760$$ = $JSCompiler_StaticMethods_buildReadyResources_$self$$.ampdoc.getRootNode(), $currentElement$jscomp$inline_5761$$ = $resource$jscomp$inline_1484$$.element;
            do {
              if ($currentElement$jscomp$inline_5761$$.nextSibling) {
                $JSCompiler_temp$jscomp$5579$$ = !0;
                break a;
              }
            } while (($currentElement$jscomp$inline_5761$$ = $currentElement$jscomp$inline_5761$$.parentNode) && $currentElement$jscomp$inline_5761$$ != $opt_stopNode$jscomp$inline_5760$$);
            $JSCompiler_temp$jscomp$5579$$ = !1;
          }
        }
        $JSCompiler_temp$jscomp$5579$$ && ($JSCompiler_StaticMethods_buildReadyResources_$self$$.$J$.splice($i$jscomp$inline_1483$$--, 1), $JSCompiler_StaticMethods_buildResourceUnsafe_$$($JSCompiler_StaticMethods_buildReadyResources_$self$$, $resource$jscomp$inline_1484$$, $scheduleWhenBuilt$jscomp$1_scheduleWhenBuilt$jscomp$inline_1482$$));
      }
    } finally {
      $JSCompiler_StaticMethods_buildReadyResources_$self$$.$ga$ = !1;
    }
  }
};
$JSCompiler_StaticMethods_buildResourceUnsafe_$$ = function($JSCompiler_StaticMethods_buildResourceUnsafe_$self$$, $resource$jscomp$5$$, $schedulePass$$) {
  var $promise$jscomp$23$$ = $resource$jscomp$5$$.$build$();
  $promise$jscomp$23$$ && $schedulePass$$ && $promise$jscomp$23$$.then(function() {
    return _.$JSCompiler_StaticMethods_schedulePass$$($JSCompiler_StaticMethods_buildResourceUnsafe_$self$$);
  }, function($schedulePass$$) {
    _.$JSCompiler_StaticMethods_removeResource_$$($JSCompiler_StaticMethods_buildResourceUnsafe_$self$$, $resource$jscomp$5$$);
    if (!$isBlockedByConsent$$module$src$error$$($schedulePass$$)) {
      throw $schedulePass$$;
    }
  });
};
_.$JSCompiler_StaticMethods_removeResource_$$ = function($JSCompiler_StaticMethods_removeResource_$self$$, $resource$jscomp$7$$, $opt_disconnect$$) {
  var $index$jscomp$68$$ = $JSCompiler_StaticMethods_removeResource_$self$$.$D$.indexOf($resource$jscomp$7$$);
  -1 != $index$jscomp$68$$ && $JSCompiler_StaticMethods_removeResource_$self$$.$D$.splice($index$jscomp$68$$, 1);
  $resource$jscomp$7$$.element.$O$ && $resource$jscomp$7$$.element.$pauseCallback$();
  $opt_disconnect$$ && $resource$jscomp$7$$.disconnect();
  $JSCompiler_StaticMethods_cleanupTasks_$$($JSCompiler_StaticMethods_removeResource_$self$$, $resource$jscomp$7$$, !0);
  "Resources";
};
$JSCompiler_StaticMethods_measureMutateElementResources_$$ = function($JSCompiler_StaticMethods_measureMutateElementResources_$self$$, $element$jscomp$135$$, $measurer$jscomp$4$$, $mutator$jscomp$5$$) {
  function $calcRelayoutTop$$() {
    var $measurer$jscomp$4$$ = $JSCompiler_StaticMethods_measureMutateElementResources_$self$$.$viewport_$.$getLayoutRect$($element$jscomp$135$$);
    return 0 != $measurer$jscomp$4$$.width && 0 != $measurer$jscomp$4$$.height ? $measurer$jscomp$4$$.top : -1;
  }
  var $relayoutTop$$ = -1;
  return _.$JSCompiler_StaticMethods_runPromise$$($JSCompiler_StaticMethods_measureMutateElementResources_$self$$.$vsync_$, {measure:function() {
    $measurer$jscomp$4$$ && $measurer$jscomp$4$$();
    $relayoutTop$$ = $calcRelayoutTop$$();
  }, $mutate$:function() {
    $mutator$jscomp$5$$();
    $element$jscomp$135$$.classList.contains("i-amphtml-element") && (_.$Resource$$module$src$service$resource$forElementOptional$$($element$jscomp$135$$).$I$ = !0);
    for (var $measurer$jscomp$4$$ = $element$jscomp$135$$.getElementsByClassName("i-amphtml-element"), $i$jscomp$92$$ = 0; $i$jscomp$92$$ < $measurer$jscomp$4$$.length; $i$jscomp$92$$++) {
      _.$Resource$$module$src$service$resource$forElementOptional$$($measurer$jscomp$4$$[$i$jscomp$92$$]).$I$ = !0;
    }
    -1 != $relayoutTop$$ && $JSCompiler_StaticMethods_setRelayoutTop_$$($JSCompiler_StaticMethods_measureMutateElementResources_$self$$, $relayoutTop$$);
    _.$JSCompiler_StaticMethods_schedulePass$$($JSCompiler_StaticMethods_measureMutateElementResources_$self$$, 70);
    $JSCompiler_StaticMethods_measureMutateElementResources_$self$$.$vsync_$.measure(function() {
      var $element$jscomp$135$$ = $calcRelayoutTop$$();
      -1 != $element$jscomp$135$$ && $element$jscomp$135$$ != $relayoutTop$$ && ($JSCompiler_StaticMethods_setRelayoutTop_$$($JSCompiler_StaticMethods_measureMutateElementResources_$self$$, $element$jscomp$135$$), _.$JSCompiler_StaticMethods_schedulePass$$($JSCompiler_StaticMethods_measureMutateElementResources_$self$$, 70));
      $JSCompiler_StaticMethods_measureMutateElementResources_$self$$.$K$ = !0;
    });
  }});
};
$JSCompiler_StaticMethods_measureMutateElementLayers_$$ = function($JSCompiler_StaticMethods_measureMutateElementLayers_$self$$, $element$jscomp$136$$, $measurer$jscomp$5$$, $mutator$jscomp$6$$) {
  return _.$JSCompiler_StaticMethods_runPromise$$($JSCompiler_StaticMethods_measureMutateElementLayers_$self$$.$vsync_$, {measure:$measurer$jscomp$5$$ || void 0, $mutate$:function() {
    $mutator$jscomp$6$$();
    if ($JSCompiler_StaticMethods_measureMutateElementLayers_$self$$.$useLayers_$) {
      var $measurer$jscomp$5$$ = $JSCompiler_StaticMethods_measureMutateElementLayers_$self$$.$ia$;
      ($LayoutElement$$module$src$service$layers_impl$getParentLayer$$($element$jscomp$136$$) || $LayoutElement$$module$src$service$layers_impl$forOptional$$($measurer$jscomp$5$$.$I$)).$D$ = !0;
    } else {
      ($measurer$jscomp$5$$ = $element$jscomp$136$$.classList.contains("i-amphtml-element")) && $JSCompiler_StaticMethods_setRelayoutTop_$$($JSCompiler_StaticMethods_measureMutateElementLayers_$self$$, _.$Resource$$module$src$service$resource$forElementOptional$$($element$jscomp$136$$).$getLayoutBox$().top), _.$JSCompiler_StaticMethods_schedulePass$$($JSCompiler_StaticMethods_measureMutateElementLayers_$self$$, 70, !$measurer$jscomp$5$$);
    }
  }});
};
_.$JSCompiler_StaticMethods_schedulePass$$ = function($JSCompiler_StaticMethods_schedulePass$self$$, $opt_delay$jscomp$3$$, $opt_relayoutAll$$) {
  $opt_relayoutAll$$ && ($JSCompiler_StaticMethods_schedulePass$self$$.$O$ = !0);
  return _.$JSCompiler_StaticMethods_schedule$$($JSCompiler_StaticMethods_schedulePass$self$$.$ka$, $opt_delay$jscomp$3$$);
};
$JSCompiler_StaticMethods_schedulePassVsync$$ = function($JSCompiler_StaticMethods_schedulePassVsync$self$$) {
  $JSCompiler_StaticMethods_schedulePassVsync$self$$.$ha$ || ($JSCompiler_StaticMethods_schedulePassVsync$self$$.$ha$ = !0, $JSCompiler_StaticMethods_schedulePassVsync$self$$.$vsync_$.$mutate$(function() {
    return $JSCompiler_StaticMethods_doPass$$($JSCompiler_StaticMethods_schedulePassVsync$self$$);
  }));
};
$JSCompiler_StaticMethods_doPass$$ = function($JSCompiler_StaticMethods_doPass$self$$) {
  if ($JSCompiler_StaticMethods_doPass$self$$.$ea$) {
    $JSCompiler_StaticMethods_doPass$self$$.$visible_$ = _.$JSCompiler_StaticMethods_Viewer$$module$src$service$viewer_impl_prototype$isVisible$$($JSCompiler_StaticMethods_doPass$self$$.$viewer_$);
    $JSCompiler_StaticMethods_doPass$self$$.$fa$ = $JSCompiler_StaticMethods_doPass$self$$.$viewer_$.$P$;
    if ($JSCompiler_StaticMethods_doPass$self$$.$P$ && $JSCompiler_StaticMethods_doPass$self$$.$oa$) {
      $JSCompiler_StaticMethods_doPass$self$$.$oa$ = !1;
      var $doc$jscomp$29_i$jscomp$93$$ = $JSCompiler_StaticMethods_doPass$self$$.$win$.document, $documentInfo$$ = _.$Services$$module$src$services$documentInfoForDoc$$($JSCompiler_StaticMethods_doPass$self$$.ampdoc);
      _.$JSCompiler_StaticMethods_Viewer$$module$src$service$viewer_impl_prototype$sendMessage$$($JSCompiler_StaticMethods_doPass$self$$.$viewer_$, "documentLoaded", _.$dict$$module$src$utils$object$$({title:$doc$jscomp$29_i$jscomp$93$$.title, sourceUrl:_.$getSourceUrl$$module$src$url$$($JSCompiler_StaticMethods_doPass$self$$.ampdoc.$AmpDoc$$module$src$service$ampdoc_impl_prototype$getUrl$()), serverLayout:$doc$jscomp$29_i$jscomp$93$$.documentElement.hasAttribute("i-amphtml-element"), linkRels:$documentInfo$$.$linkRels$, 
      metaTags:$documentInfo$$.$metaTags$}), !0);
      $JSCompiler_StaticMethods_doPass$self$$.$W$ = $JSCompiler_StaticMethods_doPass$self$$.$viewport_$.$D$.$ViewportBindingDef$$module$src$service$viewport$viewport_binding_def_prototype$getContentHeight$();
      _.$JSCompiler_StaticMethods_Viewer$$module$src$service$viewer_impl_prototype$sendMessage$$($JSCompiler_StaticMethods_doPass$self$$.$viewer_$, "documentHeight", _.$dict$$module$src$utils$object$$({height:$JSCompiler_StaticMethods_doPass$self$$.$W$}), !0);
      "Resources";
    }
    $JSCompiler_StaticMethods_doPass$self$$.$viewport_$.$getSize$();
    "Resources";
    $JSCompiler_StaticMethods_doPass$self$$.$ka$.cancel();
    $JSCompiler_StaticMethods_doPass$self$$.$ha$ = !1;
    $JSCompiler_StaticMethods_doPass$self$$.$ra$.setState($JSCompiler_StaticMethods_doPass$self$$.$viewer_$.$G$);
    $JSCompiler_StaticMethods_doPass$self$$.$P$ && $JSCompiler_StaticMethods_doPass$self$$.$V$ && !$JSCompiler_StaticMethods_doPass$self$$.ampdoc.signals().get("ready-scan") && _.$JSCompiler_StaticMethods_signal$$($JSCompiler_StaticMethods_doPass$self$$.ampdoc.signals(), "ready-scan");
    $JSCompiler_StaticMethods_doPass$self$$.$K$ && ($JSCompiler_StaticMethods_doPass$self$$.$K$ = !1, $JSCompiler_StaticMethods_doPass$self$$.$vsync_$.measure(function() {
      var $doc$jscomp$29_i$jscomp$93$$ = $JSCompiler_StaticMethods_doPass$self$$.$viewport_$.$D$.$ViewportBindingDef$$module$src$service$viewport$viewport_binding_def_prototype$getContentHeight$();
      $doc$jscomp$29_i$jscomp$93$$ != $JSCompiler_StaticMethods_doPass$self$$.$W$ && (_.$JSCompiler_StaticMethods_Viewer$$module$src$service$viewer_impl_prototype$sendMessage$$($JSCompiler_StaticMethods_doPass$self$$.$viewer_$, "documentHeight", _.$dict$$module$src$utils$object$$({height:$doc$jscomp$29_i$jscomp$93$$}), !0), $JSCompiler_StaticMethods_doPass$self$$.$W$ = $doc$jscomp$29_i$jscomp$93$$, "Resources", $JSCompiler_StaticMethods_doPass$self$$.$viewport_$.$D$.$ViewportBindingDef$$module$src$service$viewport$viewport_binding_def_prototype$contentHeightChanged$());
    }));
    for ($doc$jscomp$29_i$jscomp$93$$ = 0; $doc$jscomp$29_i$jscomp$93$$ < $JSCompiler_StaticMethods_doPass$self$$.$ba$.length; $doc$jscomp$29_i$jscomp$93$$++) {
      (0,$JSCompiler_StaticMethods_doPass$self$$.$ba$[$doc$jscomp$29_i$jscomp$93$$])();
    }
    $JSCompiler_StaticMethods_doPass$self$$.$ba$.length = 0;
  } else {
    "Resources";
  }
};
$JSCompiler_StaticMethods_mutateWorkViaResources_$$ = function($JSCompiler_StaticMethods_mutateWorkViaResources_$self$$) {
  var $isScrollingStopped_now$jscomp$6$$ = Date.now(), $viewportRect$$ = _.$JSCompiler_StaticMethods_getRect$$($JSCompiler_StaticMethods_mutateWorkViaResources_$self$$.$viewport_$), $topOffset$$ = $viewportRect$$.height / 10, $bottomOffset$$ = $viewportRect$$.height / 10;
  $isScrollingStopped_now$jscomp$6$$ = 1e-2 > Math.abs($JSCompiler_StaticMethods_mutateWorkViaResources_$self$$.$aa$) && 500 < $isScrollingStopped_now$jscomp$6$$ - $JSCompiler_StaticMethods_mutateWorkViaResources_$self$$.$Y$ || 1E3 < $isScrollingStopped_now$jscomp$6$$ - $JSCompiler_StaticMethods_mutateWorkViaResources_$self$$.$Y$;
  if (0 < $JSCompiler_StaticMethods_mutateWorkViaResources_$self$$.$G$.length) {
    "Resources";
    var $requestsChangeSize$$ = $JSCompiler_StaticMethods_mutateWorkViaResources_$self$$.$G$;
    $JSCompiler_StaticMethods_mutateWorkViaResources_$self$$.$G$ = [];
    for (var $minTop$$ = -1, $scrollAdjSet$$ = [], $aboveVpHeightChange$$ = 0, $i$jscomp$94$$ = 0; $i$jscomp$94$$ < $requestsChangeSize$$.length; $i$jscomp$94$$++) {
      var $request$jscomp$5$$ = $requestsChangeSize$$[$i$jscomp$94$$], $resource$jscomp$17$$ = $request$jscomp$5$$.$resource$, $box$jscomp$8$$ = $resource$jscomp$17$$.$getLayoutBox$(), $topMarginDiff$$ = 0, $bottomMarginDiff$$ = 0, $leftMarginDiff$$ = 0, $rightMarginDiff$$ = 0, $$jscomp$destructuring$var84_bottomDisplacedBoundary$$ = $box$jscomp$8$$, $topUnchangedBoundary$$ = $$jscomp$destructuring$var84_bottomDisplacedBoundary$$.top;
      $$jscomp$destructuring$var84_bottomDisplacedBoundary$$ = $$jscomp$destructuring$var84_bottomDisplacedBoundary$$.bottom;
      var $newMargins$$ = void 0;
      if ($request$jscomp$5$$.$marginChange$) {
        $newMargins$$ = $request$jscomp$5$$.$marginChange$.$newMargins$;
        var $heightDiff_margins$jscomp$1$$ = $request$jscomp$5$$.$marginChange$.$currentMargins$;
        void 0 != $newMargins$$.top && ($topMarginDiff$$ = $newMargins$$.top - $heightDiff_margins$jscomp$1$$.top);
        void 0 != $newMargins$$.bottom && ($bottomMarginDiff$$ = $newMargins$$.bottom - $heightDiff_margins$jscomp$1$$.bottom);
        void 0 != $newMargins$$.left && ($leftMarginDiff$$ = $newMargins$$.left - $heightDiff_margins$jscomp$1$$.left);
        void 0 != $newMargins$$.right && ($rightMarginDiff$$ = $newMargins$$.right - $heightDiff_margins$jscomp$1$$.right);
        $topMarginDiff$$ && ($topUnchangedBoundary$$ = $box$jscomp$8$$.top - $heightDiff_margins$jscomp$1$$.top);
        $bottomMarginDiff$$ && ($$jscomp$destructuring$var84_bottomDisplacedBoundary$$ = $box$jscomp$8$$.bottom + $heightDiff_margins$jscomp$1$$.bottom);
      }
      $heightDiff_margins$jscomp$1$$ = $request$jscomp$5$$.$newHeight$ - $box$jscomp$8$$.height;
      var $widthDiff$$ = $request$jscomp$5$$.$newWidth$ - $box$jscomp$8$$.width, $resize$$ = !1;
      if (0 != $heightDiff_margins$jscomp$1$$ || 0 != $topMarginDiff$$ || 0 != $bottomMarginDiff$$ || 0 != $widthDiff$$ || 0 != $leftMarginDiff$$ || 0 != $rightMarginDiff$$) {
        if ($request$jscomp$5$$.force || !$JSCompiler_StaticMethods_mutateWorkViaResources_$self$$.$visible_$) {
          $resize$$ = !0;
        } else {
          if ($JSCompiler_StaticMethods_hasDescendantsOf$$($JSCompiler_StaticMethods_mutateWorkViaResources_$self$$.$la$, $resource$jscomp$17$$.element)) {
            $resize$$ = !0;
          } else {
            if ($topUnchangedBoundary$$ >= $viewportRect$$.bottom - $bottomOffset$$ || 0 == $topMarginDiff$$ && $box$jscomp$8$$.bottom + Math.min($heightDiff_margins$jscomp$1$$, 0) >= $viewportRect$$.bottom - $bottomOffset$$) {
              $resize$$ = !0;
            } else {
              if (1 < $viewportRect$$.top && $$jscomp$destructuring$var84_bottomDisplacedBoundary$$ <= $viewportRect$$.top + $topOffset$$) {
                if (0 > $heightDiff_margins$jscomp$1$$ && $viewportRect$$.top + $aboveVpHeightChange$$ < -$heightDiff_margins$jscomp$1$$) {
                  continue;
                }
                $isScrollingStopped_now$jscomp$6$$ ? ($aboveVpHeightChange$$ += $heightDiff_margins$jscomp$1$$, $scrollAdjSet$$.push($request$jscomp$5$$)) : $JSCompiler_StaticMethods_mutateWorkViaResources_$self$$.$G$.push($request$jscomp$5$$);
                continue;
              } else {
                $JSCompiler_StaticMethods_elementNearBottom_$$($JSCompiler_StaticMethods_mutateWorkViaResources_$self$$, $resource$jscomp$17$$, $box$jscomp$8$$) ? $resize$$ = !0 : 0 > $heightDiff_margins$jscomp$1$$ || 0 > $topMarginDiff$$ || 0 > $bottomMarginDiff$$ || $JSCompiler_StaticMethods_Resource$$module$src$service$resource_prototype$overflowCallback$$($request$jscomp$5$$.$resource$, !0, $request$jscomp$5$$.$newHeight$, $request$jscomp$5$$.$newWidth$, $newMargins$$);
              }
            }
          }
        }
      }
      $resize$$ && (0 <= $box$jscomp$8$$.top && ($minTop$$ = -1 == $minTop$$ ? $box$jscomp$8$$.top : Math.min($minTop$$, $box$jscomp$8$$.top)), $request$jscomp$5$$.$resource$.$changeSize$($request$jscomp$5$$.$newHeight$, $request$jscomp$5$$.$newWidth$, $newMargins$$), $JSCompiler_StaticMethods_Resource$$module$src$service$resource_prototype$overflowCallback$$($request$jscomp$5$$.$resource$, !1, $request$jscomp$5$$.$newHeight$, $request$jscomp$5$$.$newWidth$, $newMargins$$), $JSCompiler_StaticMethods_mutateWorkViaResources_$self$$.$K$ = 
      !0);
      $request$jscomp$5$$.$callback$ && $request$jscomp$5$$.$callback$($resize$$);
    }
    -1 != $minTop$$ && $JSCompiler_StaticMethods_setRelayoutTop_$$($JSCompiler_StaticMethods_mutateWorkViaResources_$self$$, $minTop$$);
    0 < $scrollAdjSet$$.length && _.$JSCompiler_StaticMethods_Vsync$$module$src$service$vsync_impl_prototype$run$$($JSCompiler_StaticMethods_mutateWorkViaResources_$self$$.$vsync_$, {measure:function($isScrollingStopped_now$jscomp$6$$) {
      $isScrollingStopped_now$jscomp$6$$.scrollHeight = $JSCompiler_StaticMethods_mutateWorkViaResources_$self$$.$viewport_$.$getScrollHeight$();
      $isScrollingStopped_now$jscomp$6$$.scrollTop = _.$JSCompiler_StaticMethods_Viewport$$module$src$service$viewport$viewport_impl_prototype$getScrollTop$$($JSCompiler_StaticMethods_mutateWorkViaResources_$self$$.$viewport_$);
    }, $mutate$:function($isScrollingStopped_now$jscomp$6$$) {
      var $viewportRect$$ = -1;
      $scrollAdjSet$$.forEach(function($JSCompiler_StaticMethods_mutateWorkViaResources_$self$$) {
        var $isScrollingStopped_now$jscomp$6$$ = $JSCompiler_StaticMethods_mutateWorkViaResources_$self$$.$resource$.$getLayoutBox$();
        $viewportRect$$ = -1 == $viewportRect$$ ? $isScrollingStopped_now$jscomp$6$$.top : Math.min($viewportRect$$, $isScrollingStopped_now$jscomp$6$$.top);
        $JSCompiler_StaticMethods_mutateWorkViaResources_$self$$.$resource$.$changeSize$($JSCompiler_StaticMethods_mutateWorkViaResources_$self$$.$newHeight$, $JSCompiler_StaticMethods_mutateWorkViaResources_$self$$.$newWidth$, $JSCompiler_StaticMethods_mutateWorkViaResources_$self$$.$marginChange$ ? $JSCompiler_StaticMethods_mutateWorkViaResources_$self$$.$marginChange$.$newMargins$ : void 0);
        $JSCompiler_StaticMethods_mutateWorkViaResources_$self$$.$callback$ && $JSCompiler_StaticMethods_mutateWorkViaResources_$self$$.$callback$(!0);
      });
      -1 != $viewportRect$$ && $JSCompiler_StaticMethods_setRelayoutTop_$$($JSCompiler_StaticMethods_mutateWorkViaResources_$self$$, $viewportRect$$);
      var $topOffset$$ = $JSCompiler_StaticMethods_mutateWorkViaResources_$self$$.$viewport_$.$getScrollHeight$();
      $topOffset$$ != $isScrollingStopped_now$jscomp$6$$.scrollHeight && _.$JSCompiler_StaticMethods_Viewport$$module$src$service$viewport$viewport_impl_prototype$setScrollTop$$($JSCompiler_StaticMethods_mutateWorkViaResources_$self$$.$viewport_$, $isScrollingStopped_now$jscomp$6$$.scrollTop + ($topOffset$$ - $isScrollingStopped_now$jscomp$6$$.scrollHeight));
      $JSCompiler_StaticMethods_mutateWorkViaResources_$self$$.$K$ = !0;
    }}, {});
  }
};
$JSCompiler_StaticMethods_elementNearBottom_$$ = function($JSCompiler_StaticMethods_elementNearBottom_$self_contentHeight_threshold$jscomp$1$$, $initialBox_resource$jscomp$18$$, $box$jscomp$10_opt_layoutBox$$) {
  $JSCompiler_StaticMethods_elementNearBottom_$self_contentHeight_threshold$jscomp$1$$ = $JSCompiler_StaticMethods_elementNearBottom_$self_contentHeight_threshold$jscomp$1$$.$viewport_$.$D$.$ViewportBindingDef$$module$src$service$viewport$viewport_binding_def_prototype$getContentHeight$();
  $JSCompiler_StaticMethods_elementNearBottom_$self_contentHeight_threshold$jscomp$1$$ = Math.max(0.85 * $JSCompiler_StaticMethods_elementNearBottom_$self_contentHeight_threshold$jscomp$1$$, $JSCompiler_StaticMethods_elementNearBottom_$self_contentHeight_threshold$jscomp$1$$ - 1000);
  $box$jscomp$10_opt_layoutBox$$ = $box$jscomp$10_opt_layoutBox$$ || $initialBox_resource$jscomp$18$$.$getLayoutBox$();
  $initialBox_resource$jscomp$18$$ = $initialBox_resource$jscomp$18$$.$D$ || $initialBox_resource$jscomp$18$$.$F$;
  return $box$jscomp$10_opt_layoutBox$$.bottom >= $JSCompiler_StaticMethods_elementNearBottom_$self_contentHeight_threshold$jscomp$1$$ || $initialBox_resource$jscomp$18$$.bottom >= $JSCompiler_StaticMethods_elementNearBottom_$self_contentHeight_threshold$jscomp$1$$;
};
$JSCompiler_StaticMethods_setRelayoutTop_$$ = function($JSCompiler_StaticMethods_setRelayoutTop_$self$$, $relayoutTop$jscomp$1$$) {
  $JSCompiler_StaticMethods_setRelayoutTop_$self$$.$useLayers_$ ? $JSCompiler_StaticMethods_setRelayoutTop_$self$$.$O$ = !0 : $JSCompiler_StaticMethods_setRelayoutTop_$self$$.$R$ = -1 == $JSCompiler_StaticMethods_setRelayoutTop_$self$$.$R$ ? $relayoutTop$jscomp$1$$ : Math.min($relayoutTop$jscomp$1$$, $JSCompiler_StaticMethods_setRelayoutTop_$self$$.$R$);
};
$JSCompiler_StaticMethods_checkPendingChangeSize_$$ = function($JSCompiler_StaticMethods_checkPendingChangeSize_$self$$, $element$jscomp$141_resource$jscomp$19_resourceElement$$) {
  if ($element$jscomp$141_resource$jscomp$19_resourceElement$$ = _.$closest$$module$src$dom$$($element$jscomp$141_resource$jscomp$19_resourceElement$$, function($JSCompiler_StaticMethods_checkPendingChangeSize_$self$$) {
    return !!_.$Resource$$module$src$service$resource$forElementOptional$$($JSCompiler_StaticMethods_checkPendingChangeSize_$self$$);
  })) {
    $element$jscomp$141_resource$jscomp$19_resourceElement$$ = _.$Resource$$module$src$service$resource$forElementOptional$$($element$jscomp$141_resource$jscomp$19_resourceElement$$);
    var $pendingChangeSize$$ = $element$jscomp$141_resource$jscomp$19_resourceElement$$.$P$;
    void 0 !== $pendingChangeSize$$ && _.$JSCompiler_StaticMethods_scheduleChangeSize_$$($JSCompiler_StaticMethods_checkPendingChangeSize_$self$$, $element$jscomp$141_resource$jscomp$19_resourceElement$$, $pendingChangeSize$$.height, $pendingChangeSize$$.width, $pendingChangeSize$$.$margins$, !0);
  }
};
$JSCompiler_StaticMethods_discoverWork_$$ = function($JSCompiler_StaticMethods_discoverWork_$self$$) {
  var $idleScheduledCount_now$jscomp$7$$ = Date.now(), $i$154_r$157_r$159_relayoutAll_viewportRect$jscomp$1_visibleRect$$ = $JSCompiler_StaticMethods_discoverWork_$self$$.$O$;
  $JSCompiler_StaticMethods_discoverWork_$self$$.$O$ = !1;
  var $i$152_r$155_relayoutTop$jscomp$2$$ = $JSCompiler_StaticMethods_discoverWork_$self$$.$R$;
  $JSCompiler_StaticMethods_discoverWork_$self$$.$R$ = -1;
  for (var $i$150_r$153_relayoutCount$$ = 0, $r$151_remeasureCount_shouldBeInViewport$$ = 0, $i$jscomp$95_wasDisplayed$$ = 0; $i$jscomp$95_wasDisplayed$$ < $JSCompiler_StaticMethods_discoverWork_$self$$.$D$.length; $i$jscomp$95_wasDisplayed$$++) {
    var $r$jscomp$8$$ = $JSCompiler_StaticMethods_discoverWork_$self$$.$D$[$i$jscomp$95_wasDisplayed$$];
    0 != $r$jscomp$8$$.$state_$ || $r$jscomp$8$$.$O$ || $JSCompiler_StaticMethods_buildOrScheduleBuildForResource_$$($JSCompiler_StaticMethods_discoverWork_$self$$, $r$jscomp$8$$, !0);
    if ($i$154_r$157_r$159_relayoutAll_viewportRect$jscomp$1_visibleRect$$ || !$r$jscomp$8$$.$D$ || 1 == $r$jscomp$8$$.$state_$) {
      $r$jscomp$8$$.element.$Qa$(), $i$150_r$153_relayoutCount$$++;
    }
    $r$jscomp$8$$.$I$ && $r$151_remeasureCount_shouldBeInViewport$$++;
  }
  var $toUnload$$;
  if (0 < $i$150_r$153_relayoutCount$$ || 0 < $r$151_remeasureCount_shouldBeInViewport$$ || $i$154_r$157_r$159_relayoutAll_viewportRect$jscomp$1_visibleRect$$ || -1 != $i$152_r$155_relayoutTop$jscomp$2$$) {
    for ($i$150_r$153_relayoutCount$$ = 0; $i$150_r$153_relayoutCount$$ < $JSCompiler_StaticMethods_discoverWork_$self$$.$D$.length; $i$150_r$153_relayoutCount$$++) {
      if ($r$151_remeasureCount_shouldBeInViewport$$ = $JSCompiler_StaticMethods_discoverWork_$self$$.$D$[$i$150_r$153_relayoutCount$$], !$r$151_remeasureCount_shouldBeInViewport$$.$getOwner$() || $r$151_remeasureCount_shouldBeInViewport$$.$I$) {
        if ($i$154_r$157_r$159_relayoutAll_viewportRect$jscomp$1_visibleRect$$ || 1 == $r$151_remeasureCount_shouldBeInViewport$$.$state_$ || !$r$151_remeasureCount_shouldBeInViewport$$.$D$ || $r$151_remeasureCount_shouldBeInViewport$$.$I$ || -1 != $i$152_r$155_relayoutTop$jscomp$2$$ && $r$151_remeasureCount_shouldBeInViewport$$.$getLayoutBox$().bottom >= $i$152_r$155_relayoutTop$jscomp$2$$) {
          $i$jscomp$95_wasDisplayed$$ = _.$JSCompiler_StaticMethods_isDisplayed$$($r$151_remeasureCount_shouldBeInViewport$$), $r$151_remeasureCount_shouldBeInViewport$$.measure(), $i$jscomp$95_wasDisplayed$$ && !_.$JSCompiler_StaticMethods_isDisplayed$$($r$151_remeasureCount_shouldBeInViewport$$) && ($toUnload$$ || ($toUnload$$ = []), $toUnload$$.push($r$151_remeasureCount_shouldBeInViewport$$));
        }
      }
    }
  }
  $toUnload$$ && $JSCompiler_StaticMethods_discoverWork_$self$$.$vsync_$.$mutate$(function() {
    $toUnload$$.forEach(function($idleScheduledCount_now$jscomp$7$$) {
      $idleScheduledCount_now$jscomp$7$$.$unload$();
      $JSCompiler_StaticMethods_cleanupTasks_$$($JSCompiler_StaticMethods_discoverWork_$self$$, $idleScheduledCount_now$jscomp$7$$);
    });
  });
  $i$154_r$157_r$159_relayoutAll_viewportRect$jscomp$1_visibleRect$$ = _.$JSCompiler_StaticMethods_getRect$$($JSCompiler_StaticMethods_discoverWork_$self$$.$viewport_$);
  var $i$156_i$158_loadRect$$;
  $JSCompiler_StaticMethods_discoverWork_$self$$.$visible_$ ? $i$156_i$158_loadRect$$ = _.$expandLayoutRect$$module$src$layout_rect$$($i$154_r$157_r$159_relayoutAll_viewportRect$jscomp$1_visibleRect$$, 0.25, 2) : 0 < $JSCompiler_StaticMethods_discoverWork_$self$$.$fa$ ? $i$156_i$158_loadRect$$ = _.$expandLayoutRect$$module$src$layout_rect$$($i$154_r$157_r$159_relayoutAll_viewportRect$jscomp$1_visibleRect$$, 0, $JSCompiler_StaticMethods_discoverWork_$self$$.$fa$ - 1) : $i$156_i$158_loadRect$$ = null;
  $i$154_r$157_r$159_relayoutAll_viewportRect$jscomp$1_visibleRect$$ = $JSCompiler_StaticMethods_discoverWork_$self$$.$visible_$ ? _.$expandLayoutRect$$module$src$layout_rect$$($i$154_r$157_r$159_relayoutAll_viewportRect$jscomp$1_visibleRect$$, 0.25, 0.25) : $i$154_r$157_r$159_relayoutAll_viewportRect$jscomp$1_visibleRect$$;
  for ($i$152_r$155_relayoutTop$jscomp$2$$ = 0; $i$152_r$155_relayoutTop$jscomp$2$$ < $JSCompiler_StaticMethods_discoverWork_$self$$.$D$.length; $i$152_r$155_relayoutTop$jscomp$2$$++) {
    $i$150_r$153_relayoutCount$$ = $JSCompiler_StaticMethods_discoverWork_$self$$.$D$[$i$152_r$155_relayoutTop$jscomp$2$$], 0 == $i$150_r$153_relayoutCount$$.$state_$ || $i$150_r$153_relayoutCount$$.$getOwner$() || ($r$151_remeasureCount_shouldBeInViewport$$ = $JSCompiler_StaticMethods_discoverWork_$self$$.$visible_$ && _.$JSCompiler_StaticMethods_isDisplayed$$($i$150_r$153_relayoutCount$$) && $JSCompiler_StaticMethods_overlaps$$($i$150_r$153_relayoutCount$$, $i$154_r$157_r$159_relayoutAll_viewportRect$jscomp$1_visibleRect$$), 
    $i$150_r$153_relayoutCount$$.element.$viewportCallback$($r$151_remeasureCount_shouldBeInViewport$$));
  }
  if ($i$156_i$158_loadRect$$) {
    for ($i$154_r$157_r$159_relayoutAll_viewportRect$jscomp$1_visibleRect$$ = 0; $i$154_r$157_r$159_relayoutAll_viewportRect$jscomp$1_visibleRect$$ < $JSCompiler_StaticMethods_discoverWork_$self$$.$D$.length; $i$154_r$157_r$159_relayoutAll_viewportRect$jscomp$1_visibleRect$$++) {
      $i$152_r$155_relayoutTop$jscomp$2$$ = $JSCompiler_StaticMethods_discoverWork_$self$$.$D$[$i$154_r$157_r$159_relayoutAll_viewportRect$jscomp$1_visibleRect$$], 2 != $i$152_r$155_relayoutTop$jscomp$2$$.$state_$ || $i$152_r$155_relayoutTop$jscomp$2$$.$getOwner$() || _.$JSCompiler_StaticMethods_isDisplayed$$($i$152_r$155_relayoutTop$jscomp$2$$) && $JSCompiler_StaticMethods_overlaps$$($i$152_r$155_relayoutTop$jscomp$2$$, $i$156_i$158_loadRect$$) && _.$JSCompiler_StaticMethods_scheduleLayoutOrPreload_$$($JSCompiler_StaticMethods_discoverWork_$self$$, 
      $i$152_r$155_relayoutTop$jscomp$2$$, !0);
    }
  }
  if ($JSCompiler_StaticMethods_discoverWork_$self$$.$visible_$ && 0 == $JSCompiler_StaticMethods_discoverWork_$self$$.$I$.$getSize$() && 0 == $JSCompiler_StaticMethods_discoverWork_$self$$.$F$.$getSize$() && $idleScheduledCount_now$jscomp$7$$ > $JSCompiler_StaticMethods_discoverWork_$self$$.$I$.$G$ + 5000) {
    for ($i$156_i$158_loadRect$$ = $idleScheduledCount_now$jscomp$7$$ = 0; $i$156_i$158_loadRect$$ < $JSCompiler_StaticMethods_discoverWork_$self$$.$D$.length && 4 > $idleScheduledCount_now$jscomp$7$$; $i$156_i$158_loadRect$$++) {
      $i$154_r$157_r$159_relayoutAll_viewportRect$jscomp$1_visibleRect$$ = $JSCompiler_StaticMethods_discoverWork_$self$$.$D$[$i$156_i$158_loadRect$$], 2 == $i$154_r$157_r$159_relayoutAll_viewportRect$jscomp$1_visibleRect$$.$state_$ && !$i$154_r$157_r$159_relayoutAll_viewportRect$jscomp$1_visibleRect$$.$getOwner$() && _.$JSCompiler_StaticMethods_isDisplayed$$($i$154_r$157_r$159_relayoutAll_viewportRect$jscomp$1_visibleRect$$) && $i$154_r$157_r$159_relayoutAll_viewportRect$jscomp$1_visibleRect$$.$idleRenderOutsideViewport$() && 
      ("Resources", _.$JSCompiler_StaticMethods_scheduleLayoutOrPreload_$$($JSCompiler_StaticMethods_discoverWork_$self$$, $i$154_r$157_r$159_relayoutAll_viewportRect$jscomp$1_visibleRect$$, !1), $idleScheduledCount_now$jscomp$7$$++);
    }
    for ($i$156_i$158_loadRect$$ = 0; $i$156_i$158_loadRect$$ < $JSCompiler_StaticMethods_discoverWork_$self$$.$D$.length && 4 > $idleScheduledCount_now$jscomp$7$$; $i$156_i$158_loadRect$$++) {
      $i$154_r$157_r$159_relayoutAll_viewportRect$jscomp$1_visibleRect$$ = $JSCompiler_StaticMethods_discoverWork_$self$$.$D$[$i$156_i$158_loadRect$$], 2 == $i$154_r$157_r$159_relayoutAll_viewportRect$jscomp$1_visibleRect$$.$state_$ && !$i$154_r$157_r$159_relayoutAll_viewportRect$jscomp$1_visibleRect$$.$getOwner$() && _.$JSCompiler_StaticMethods_isDisplayed$$($i$154_r$157_r$159_relayoutAll_viewportRect$jscomp$1_visibleRect$$) && ("Resources", _.$JSCompiler_StaticMethods_scheduleLayoutOrPreload_$$($JSCompiler_StaticMethods_discoverWork_$self$$, 
      $i$154_r$157_r$159_relayoutAll_viewportRect$jscomp$1_visibleRect$$, !1), $idleScheduledCount_now$jscomp$7$$++);
    }
  }
};
$JSCompiler_StaticMethods_calcTaskTimeout_$$ = function($JSCompiler_StaticMethods_calcTaskTimeout_$self$$, $task$jscomp$10$$) {
  var $now$jscomp$9$$ = Date.now();
  if (0 == $JSCompiler_StaticMethods_calcTaskTimeout_$self$$.$I$.$getSize$()) {
    return -1 === $JSCompiler_StaticMethods_calcTaskTimeout_$self$$.$U$ ? 0 : Math.max(1000 * $task$jscomp$10$$.$priority$ - ($now$jscomp$9$$ - $JSCompiler_StaticMethods_calcTaskTimeout_$self$$.$U$), 0);
  }
  var $timeout$jscomp$5$$ = 0;
  $JSCompiler_StaticMethods_calcTaskTimeout_$self$$.$I$.forEach(function($JSCompiler_StaticMethods_calcTaskTimeout_$self$$) {
    $timeout$jscomp$5$$ = Math.max($timeout$jscomp$5$$, Math.max(1000 * ($task$jscomp$10$$.$priority$ - $JSCompiler_StaticMethods_calcTaskTimeout_$self$$.$priority$), 0) - ($now$jscomp$9$$ - $JSCompiler_StaticMethods_calcTaskTimeout_$self$$.startTime));
  });
  return $timeout$jscomp$5$$;
};
_.$JSCompiler_StaticMethods_scheduleChangeSize_$$ = function($JSCompiler_StaticMethods_scheduleChangeSize_$self$$, $resource$jscomp$20$$, $newHeight$jscomp$7$$, $newWidth$jscomp$5$$, $newMargins$jscomp$1$$, $force$jscomp$1$$, $opt_callback$jscomp$6$$) {
  $resource$jscomp$20$$.$D$ && !$newMargins$jscomp$1$$ ? $JSCompiler_StaticMethods_completeScheduleChangeSize_$$($JSCompiler_StaticMethods_scheduleChangeSize_$self$$, $resource$jscomp$20$$, $newHeight$jscomp$7$$, $newWidth$jscomp$5$$, void 0, $force$jscomp$1$$, $opt_callback$jscomp$6$$) : $JSCompiler_StaticMethods_scheduleChangeSize_$self$$.$vsync_$.measure(function() {
    $resource$jscomp$20$$.$D$ || $resource$jscomp$20$$.measure();
    if ($newMargins$jscomp$1$$) {
      var $JSCompiler_temp$jscomp$489_style$jscomp$inline_1503$$ = _.$computedStyle$$module$src$style$$($JSCompiler_StaticMethods_scheduleChangeSize_$self$$.$win$, $resource$jscomp$20$$.element);
      $JSCompiler_temp$jscomp$489_style$jscomp$inline_1503$$ = {$newMargins$:$newMargins$jscomp$1$$, $currentMargins$:{top:(0,window.parseInt)($JSCompiler_temp$jscomp$489_style$jscomp$inline_1503$$.marginTop, 10) || 0, right:(0,window.parseInt)($JSCompiler_temp$jscomp$489_style$jscomp$inline_1503$$.marginRight, 10) || 0, bottom:(0,window.parseInt)($JSCompiler_temp$jscomp$489_style$jscomp$inline_1503$$.marginBottom, 10) || 0, left:(0,window.parseInt)($JSCompiler_temp$jscomp$489_style$jscomp$inline_1503$$.marginLeft, 
      10) || 0}};
    } else {
      $JSCompiler_temp$jscomp$489_style$jscomp$inline_1503$$ = void 0;
    }
    $JSCompiler_StaticMethods_completeScheduleChangeSize_$$($JSCompiler_StaticMethods_scheduleChangeSize_$self$$, $resource$jscomp$20$$, $newHeight$jscomp$7$$, $newWidth$jscomp$5$$, $JSCompiler_temp$jscomp$489_style$jscomp$inline_1503$$, $force$jscomp$1$$, $opt_callback$jscomp$6$$);
  });
};
$JSCompiler_StaticMethods_completeScheduleChangeSize_$$ = function($JSCompiler_StaticMethods_completeScheduleChangeSize_$self$$, $resource$jscomp$22$$, $newHeight$jscomp$8$$, $newWidth$jscomp$6$$, $marginChange$jscomp$1$$, $force$jscomp$2$$, $opt_callback$jscomp$7$$) {
  $resource$jscomp$22$$.$P$ = void 0;
  var $JSCompiler_temp$jscomp$464_JSCompiler_temp$jscomp$465_layoutBox$jscomp$2_margins$jscomp$inline_1507_request$jscomp$7$$ = $resource$jscomp$22$$.$getPageLayoutBox$();
  if (!($JSCompiler_temp$jscomp$464_JSCompiler_temp$jscomp$465_layoutBox$jscomp$2_margins$jscomp$inline_1507_request$jscomp$7$$ = void 0 !== $newHeight$jscomp$8$$ && $newHeight$jscomp$8$$ != $JSCompiler_temp$jscomp$464_JSCompiler_temp$jscomp$465_layoutBox$jscomp$2_margins$jscomp$inline_1507_request$jscomp$7$$.height || void 0 !== $newWidth$jscomp$6$$ && $newWidth$jscomp$6$$ != $JSCompiler_temp$jscomp$464_JSCompiler_temp$jscomp$465_layoutBox$jscomp$2_margins$jscomp$inline_1507_request$jscomp$7$$.width) && 
  ($JSCompiler_temp$jscomp$464_JSCompiler_temp$jscomp$465_layoutBox$jscomp$2_margins$jscomp$inline_1507_request$jscomp$7$$ = void 0 !== $marginChange$jscomp$1$$)) {
    $JSCompiler_temp$jscomp$464_JSCompiler_temp$jscomp$465_layoutBox$jscomp$2_margins$jscomp$inline_1507_request$jscomp$7$$ = $marginChange$jscomp$1$$.$currentMargins$;
    var $change$jscomp$inline_1508_i$jscomp$96$$ = $marginChange$jscomp$1$$.$newMargins$;
    $JSCompiler_temp$jscomp$464_JSCompiler_temp$jscomp$465_layoutBox$jscomp$2_margins$jscomp$inline_1507_request$jscomp$7$$ = void 0 !== $change$jscomp$inline_1508_i$jscomp$96$$.top && $change$jscomp$inline_1508_i$jscomp$96$$.top != $JSCompiler_temp$jscomp$464_JSCompiler_temp$jscomp$465_layoutBox$jscomp$2_margins$jscomp$inline_1507_request$jscomp$7$$.top || void 0 !== $change$jscomp$inline_1508_i$jscomp$96$$.right && $change$jscomp$inline_1508_i$jscomp$96$$.right != $JSCompiler_temp$jscomp$464_JSCompiler_temp$jscomp$465_layoutBox$jscomp$2_margins$jscomp$inline_1507_request$jscomp$7$$.right || 
    void 0 !== $change$jscomp$inline_1508_i$jscomp$96$$.bottom && $change$jscomp$inline_1508_i$jscomp$96$$.bottom != $JSCompiler_temp$jscomp$464_JSCompiler_temp$jscomp$465_layoutBox$jscomp$2_margins$jscomp$inline_1507_request$jscomp$7$$.bottom || void 0 !== $change$jscomp$inline_1508_i$jscomp$96$$.left && $change$jscomp$inline_1508_i$jscomp$96$$.left != $JSCompiler_temp$jscomp$464_JSCompiler_temp$jscomp$465_layoutBox$jscomp$2_margins$jscomp$inline_1507_request$jscomp$7$$.left;
  }
  if ($JSCompiler_temp$jscomp$464_JSCompiler_temp$jscomp$465_layoutBox$jscomp$2_margins$jscomp$inline_1507_request$jscomp$7$$) {
    $JSCompiler_temp$jscomp$464_JSCompiler_temp$jscomp$465_layoutBox$jscomp$2_margins$jscomp$inline_1507_request$jscomp$7$$ = null;
    for ($change$jscomp$inline_1508_i$jscomp$96$$ = 0; $change$jscomp$inline_1508_i$jscomp$96$$ < $JSCompiler_StaticMethods_completeScheduleChangeSize_$self$$.$G$.length; $change$jscomp$inline_1508_i$jscomp$96$$++) {
      if ($JSCompiler_StaticMethods_completeScheduleChangeSize_$self$$.$G$[$change$jscomp$inline_1508_i$jscomp$96$$].$resource$ == $resource$jscomp$22$$) {
        $JSCompiler_temp$jscomp$464_JSCompiler_temp$jscomp$465_layoutBox$jscomp$2_margins$jscomp$inline_1507_request$jscomp$7$$ = $JSCompiler_StaticMethods_completeScheduleChangeSize_$self$$.$G$[$change$jscomp$inline_1508_i$jscomp$96$$];
        break;
      }
    }
    $JSCompiler_temp$jscomp$464_JSCompiler_temp$jscomp$465_layoutBox$jscomp$2_margins$jscomp$inline_1507_request$jscomp$7$$ ? ($JSCompiler_temp$jscomp$464_JSCompiler_temp$jscomp$465_layoutBox$jscomp$2_margins$jscomp$inline_1507_request$jscomp$7$$.$newHeight$ = $newHeight$jscomp$8$$, $JSCompiler_temp$jscomp$464_JSCompiler_temp$jscomp$465_layoutBox$jscomp$2_margins$jscomp$inline_1507_request$jscomp$7$$.$newWidth$ = $newWidth$jscomp$6$$, $JSCompiler_temp$jscomp$464_JSCompiler_temp$jscomp$465_layoutBox$jscomp$2_margins$jscomp$inline_1507_request$jscomp$7$$.$marginChange$ = 
    $marginChange$jscomp$1$$, $JSCompiler_temp$jscomp$464_JSCompiler_temp$jscomp$465_layoutBox$jscomp$2_margins$jscomp$inline_1507_request$jscomp$7$$.force = $force$jscomp$2$$ || $JSCompiler_temp$jscomp$464_JSCompiler_temp$jscomp$465_layoutBox$jscomp$2_margins$jscomp$inline_1507_request$jscomp$7$$.force, $JSCompiler_temp$jscomp$464_JSCompiler_temp$jscomp$465_layoutBox$jscomp$2_margins$jscomp$inline_1507_request$jscomp$7$$.$callback$ = $opt_callback$jscomp$7$$) : $JSCompiler_StaticMethods_completeScheduleChangeSize_$self$$.$G$.push({$resource$:$resource$jscomp$22$$, 
    $newHeight$:$newHeight$jscomp$8$$, $newWidth$:$newWidth$jscomp$6$$, $marginChange$:$marginChange$jscomp$1$$, force:$force$jscomp$2$$, $callback$:$opt_callback$jscomp$7$$});
    $JSCompiler_StaticMethods_schedulePassVsync$$($JSCompiler_StaticMethods_completeScheduleChangeSize_$self$$);
  } else {
    void 0 === $newHeight$jscomp$8$$ && void 0 === $newWidth$jscomp$6$$ && void 0 === $marginChange$jscomp$1$$ && _.$dev$$module$src$log$$().error("Resources", "attempting to change size with undefined dimensions", $resource$jscomp$22$$.$R$), $opt_callback$jscomp$7$$ && $opt_callback$jscomp$7$$(!0);
  }
};
$JSCompiler_StaticMethods_isLayoutAllowed_$$ = function($JSCompiler_StaticMethods_isLayoutAllowed_$self$$, $resource$jscomp$23$$, $forceOutsideViewport$$) {
  return 0 != $resource$jscomp$23$$.$state_$ && _.$JSCompiler_StaticMethods_isDisplayed$$($resource$jscomp$23$$) && ($JSCompiler_StaticMethods_isLayoutAllowed_$self$$.$visible_$ || "prerender" == $JSCompiler_StaticMethods_isLayoutAllowed_$self$$.$viewer_$.$G$ && $resource$jscomp$23$$.$prerenderAllowed$()) && ($forceOutsideViewport$$ || $resource$jscomp$23$$.$isInViewport$() || $resource$jscomp$23$$.$renderOutsideViewport$() || $resource$jscomp$23$$.$idleRenderOutsideViewport$()) ? !0 : !1;
};
_.$JSCompiler_StaticMethods_scheduleLayoutOrPreload_$$ = function($JSCompiler_StaticMethods_scheduleLayoutOrPreload_$self$$, $resource$jscomp$24$$, $layout$jscomp$8$$, $opt_parentPriority$jscomp$1$$, $forceOutsideViewport$jscomp$1_opt_forceOutsideViewport$$) {
  0 != $resource$jscomp$24$$.$state_$ && _.$JSCompiler_StaticMethods_isDisplayed$$($resource$jscomp$24$$);
  $forceOutsideViewport$jscomp$1_opt_forceOutsideViewport$$ = $forceOutsideViewport$jscomp$1_opt_forceOutsideViewport$$ || !1;
  $JSCompiler_StaticMethods_isLayoutAllowed_$$($JSCompiler_StaticMethods_scheduleLayoutOrPreload_$self$$, $resource$jscomp$24$$, $forceOutsideViewport$jscomp$1_opt_forceOutsideViewport$$) && ($layout$jscomp$8$$ ? $JSCompiler_StaticMethods_Resources$$module$src$service$resources_impl_prototype$schedule_$$($JSCompiler_StaticMethods_scheduleLayoutOrPreload_$self$$, $resource$jscomp$24$$, "L", 0, $opt_parentPriority$jscomp$1$$ || 0, $forceOutsideViewport$jscomp$1_opt_forceOutsideViewport$$, $resource$jscomp$24$$.$startLayout$.bind($resource$jscomp$24$$)) : 
  $JSCompiler_StaticMethods_Resources$$module$src$service$resources_impl_prototype$schedule_$$($JSCompiler_StaticMethods_scheduleLayoutOrPreload_$self$$, $resource$jscomp$24$$, "P", 2, $opt_parentPriority$jscomp$1$$ || 0, $forceOutsideViewport$jscomp$1_opt_forceOutsideViewport$$, $resource$jscomp$24$$.$startLayout$.bind($resource$jscomp$24$$)));
};
_.$JSCompiler_StaticMethods_scheduleLayoutOrPreloadForSubresources_$$ = function($JSCompiler_StaticMethods_scheduleLayoutOrPreloadForSubresources_$self$$, $parentResource$jscomp$3$$, $layout$jscomp$9$$, $subElements$jscomp$6$$) {
  _.$JSCompiler_StaticMethods_discoverResourcesForArray_$$($JSCompiler_StaticMethods_scheduleLayoutOrPreloadForSubresources_$self$$, $parentResource$jscomp$3$$, $subElements$jscomp$6$$, function($subElements$jscomp$6$$) {
    0 == $subElements$jscomp$6$$.$state_$ ? $subElements$jscomp$6$$.element.signals().whenSignal("res-built").then(function() {
      $JSCompiler_StaticMethods_measureAndScheduleIfAllowed_$$($JSCompiler_StaticMethods_scheduleLayoutOrPreloadForSubresources_$self$$, $subElements$jscomp$6$$, $layout$jscomp$9$$, $parentResource$jscomp$3$$.$getLayoutPriority$());
    }) : $JSCompiler_StaticMethods_measureAndScheduleIfAllowed_$$($JSCompiler_StaticMethods_scheduleLayoutOrPreloadForSubresources_$self$$, $subElements$jscomp$6$$, $layout$jscomp$9$$, $parentResource$jscomp$3$$.$getLayoutPriority$());
  });
};
$JSCompiler_StaticMethods_measureAndScheduleIfAllowed_$$ = function($JSCompiler_StaticMethods_measureAndScheduleIfAllowed_$self$$, $resource$jscomp$26$$, $layout$jscomp$10$$, $parentPriority$$) {
  $resource$jscomp$26$$.measure();
  2 == $resource$jscomp$26$$.$state_$ && _.$JSCompiler_StaticMethods_isDisplayed$$($resource$jscomp$26$$) && _.$JSCompiler_StaticMethods_scheduleLayoutOrPreload_$$($JSCompiler_StaticMethods_measureAndScheduleIfAllowed_$self$$, $resource$jscomp$26$$, $layout$jscomp$10$$, $parentPriority$$);
};
$JSCompiler_StaticMethods_Resources$$module$src$service$resources_impl_prototype$schedule_$$ = function($JSCompiler_StaticMethods_Resources$$module$src$service$resources_impl_prototype$schedule_$self_JSCompiler_StaticMethods_layoutScheduled$self$jscomp$inline_1510$$, $resource$jscomp$27_scheduleTime$jscomp$inline_1511_task$jscomp$13$$, $localId$jscomp$1_taskId$jscomp$1$$, $priorityOffset_queued$$, $parentPriority$jscomp$1$$, $forceOutsideViewport$jscomp$2$$, $callback$jscomp$78$$) {
  $localId$jscomp$1_taskId$jscomp$1$$ = $resource$jscomp$27_scheduleTime$jscomp$inline_1511_task$jscomp$13$$.$R$ + "#" + $localId$jscomp$1_taskId$jscomp$1$$;
  $resource$jscomp$27_scheduleTime$jscomp$inline_1511_task$jscomp$13$$ = {id:$localId$jscomp$1_taskId$jscomp$1$$, $resource$:$resource$jscomp$27_scheduleTime$jscomp$inline_1511_task$jscomp$13$$, $priority$:Math.max($resource$jscomp$27_scheduleTime$jscomp$inline_1511_task$jscomp$13$$.$getLayoutPriority$(), $parentPriority$jscomp$1$$) + $priorityOffset_queued$$, $forceOutsideViewport$:$forceOutsideViewport$jscomp$2$$, $callback$:$callback$jscomp$78$$, $scheduleTime$:Date.now(), startTime:0, $promise$:null};
  "Resources";
  $priorityOffset_queued$$ = $JSCompiler_StaticMethods_Resources$$module$src$service$resources_impl_prototype$schedule_$self_JSCompiler_StaticMethods_layoutScheduled$self$jscomp$inline_1510$$.$F$.$F$[$localId$jscomp$1_taskId$jscomp$1$$] || null;
  if (!$priorityOffset_queued$$ || $resource$jscomp$27_scheduleTime$jscomp$inline_1511_task$jscomp$13$$.$priority$ < $priorityOffset_queued$$.$priority$) {
    $priorityOffset_queued$$ && $JSCompiler_StaticMethods_TaskQueue$$module$src$service$task_queue_prototype$dequeue$$($JSCompiler_StaticMethods_Resources$$module$src$service$resources_impl_prototype$schedule_$self_JSCompiler_StaticMethods_layoutScheduled$self$jscomp$inline_1510$$.$F$, $priorityOffset_queued$$), $JSCompiler_StaticMethods_TaskQueue$$module$src$service$task_queue_prototype$enqueue$$($JSCompiler_StaticMethods_Resources$$module$src$service$resources_impl_prototype$schedule_$self_JSCompiler_StaticMethods_layoutScheduled$self$jscomp$inline_1510$$.$F$, 
    $resource$jscomp$27_scheduleTime$jscomp$inline_1511_task$jscomp$13$$), _.$JSCompiler_StaticMethods_schedulePass$$($JSCompiler_StaticMethods_Resources$$module$src$service$resources_impl_prototype$schedule_$self_JSCompiler_StaticMethods_layoutScheduled$self$jscomp$inline_1510$$, $JSCompiler_StaticMethods_calcTaskTimeout_$$($JSCompiler_StaticMethods_Resources$$module$src$service$resources_impl_prototype$schedule_$self_JSCompiler_StaticMethods_layoutScheduled$self$jscomp$inline_1510$$, $resource$jscomp$27_scheduleTime$jscomp$inline_1511_task$jscomp$13$$));
  }
  $JSCompiler_StaticMethods_Resources$$module$src$service$resources_impl_prototype$schedule_$self_JSCompiler_StaticMethods_layoutScheduled$self$jscomp$inline_1510$$ = $resource$jscomp$27_scheduleTime$jscomp$inline_1511_task$jscomp$13$$.$resource$;
  $resource$jscomp$27_scheduleTime$jscomp$inline_1511_task$jscomp$13$$ = $resource$jscomp$27_scheduleTime$jscomp$inline_1511_task$jscomp$13$$.$scheduleTime$;
  $JSCompiler_StaticMethods_Resources$$module$src$service$resources_impl_prototype$schedule_$self_JSCompiler_StaticMethods_layoutScheduled$self$jscomp$inline_1510$$.$state_$ = 3;
  $JSCompiler_StaticMethods_Resources$$module$src$service$resources_impl_prototype$schedule_$self_JSCompiler_StaticMethods_layoutScheduled$self$jscomp$inline_1510$$.element.$layoutScheduleTime$ = $resource$jscomp$27_scheduleTime$jscomp$inline_1511_task$jscomp$13$$;
};
_.$JSCompiler_StaticMethods_discoverResourcesForArray_$$ = function($JSCompiler_StaticMethods_discoverResourcesForArray_$self$$, $parentResource$jscomp$5$$, $elements$jscomp$9$$, $callback$jscomp$79$$) {
  $elements$jscomp$9$$.forEach(function($elements$jscomp$9$$) {
    $parentResource$jscomp$5$$.element.contains($elements$jscomp$9$$);
    _.$JSCompiler_StaticMethods_discoverResourcesForElement_$$($JSCompiler_StaticMethods_discoverResourcesForArray_$self$$, $elements$jscomp$9$$, $callback$jscomp$79$$);
  });
};
_.$JSCompiler_StaticMethods_discoverResourcesForElement_$$ = function($JSCompiler_StaticMethods_discoverResourcesForElement_$self_ampElements$jscomp$1$$, $element$jscomp$143_placeholder$jscomp$3_seen$jscomp$1$$, $callback$jscomp$80$$) {
  if ($element$jscomp$143_placeholder$jscomp$3_seen$jscomp$1$$.classList.contains("i-amphtml-element")) {
    $callback$jscomp$80$$(_.$Resource$$module$src$service$resource$forElementOptional$$($element$jscomp$143_placeholder$jscomp$3_seen$jscomp$1$$)), ($element$jscomp$143_placeholder$jscomp$3_seen$jscomp$1$$ = $element$jscomp$143_placeholder$jscomp$3_seen$jscomp$1$$.$getPlaceholder$()) && _.$JSCompiler_StaticMethods_discoverResourcesForElement_$$($JSCompiler_StaticMethods_discoverResourcesForElement_$self_ampElements$jscomp$1$$, $element$jscomp$143_placeholder$jscomp$3_seen$jscomp$1$$, $callback$jscomp$80$$);
  } else {
    $JSCompiler_StaticMethods_discoverResourcesForElement_$self_ampElements$jscomp$1$$ = $element$jscomp$143_placeholder$jscomp$3_seen$jscomp$1$$.getElementsByClassName("i-amphtml-element");
    $element$jscomp$143_placeholder$jscomp$3_seen$jscomp$1$$ = [];
    for (var $i$jscomp$97$$ = 0; $i$jscomp$97$$ < $JSCompiler_StaticMethods_discoverResourcesForElement_$self_ampElements$jscomp$1$$.length; $i$jscomp$97$$++) {
      for (var $ampElement$$ = $JSCompiler_StaticMethods_discoverResourcesForElement_$self_ampElements$jscomp$1$$[$i$jscomp$97$$], $covered$$ = !1, $j$$ = 0; $j$$ < $element$jscomp$143_placeholder$jscomp$3_seen$jscomp$1$$.length; $j$$++) {
        if ($element$jscomp$143_placeholder$jscomp$3_seen$jscomp$1$$[$j$$].contains($ampElement$$)) {
          $covered$$ = !0;
          break;
        }
      }
      $covered$$ || ($element$jscomp$143_placeholder$jscomp$3_seen$jscomp$1$$.push($ampElement$$), $callback$jscomp$80$$(_.$Resource$$module$src$service$resource$forElementOptional$$($ampElement$$)));
    }
  }
};
$JSCompiler_StaticMethods_setupVisibilityStateMachine_$$ = function($JSCompiler_StaticMethods_setupVisibilityStateMachine_$self$$, $vsm$$) {
  function $resume$$() {
    $JSCompiler_StaticMethods_setupVisibilityStateMachine_$self$$.$D$.forEach(function($JSCompiler_StaticMethods_setupVisibilityStateMachine_$self$$) {
      return $JSCompiler_StaticMethods_setupVisibilityStateMachine_$self$$.resume();
    });
    $doPass$$();
  }
  function $unload$$() {
    $JSCompiler_StaticMethods_setupVisibilityStateMachine_$self$$.$D$.forEach(function($vsm$$) {
      $vsm$$.$unload$();
      $JSCompiler_StaticMethods_cleanupTasks_$$($JSCompiler_StaticMethods_setupVisibilityStateMachine_$self$$, $vsm$$);
    });
    try {
      $JSCompiler_StaticMethods_setupVisibilityStateMachine_$self$$.$win$.getSelection().removeAllRanges();
    } catch ($e$jscomp$inline_1528$$) {
    }
  }
  function $pause$$() {
    $JSCompiler_StaticMethods_setupVisibilityStateMachine_$self$$.$D$.forEach(function($JSCompiler_StaticMethods_setupVisibilityStateMachine_$self$$) {
      return $JSCompiler_StaticMethods_setupVisibilityStateMachine_$self$$.pause();
    });
  }
  function $noop$$() {
  }
  function $doPass$$() {
    var $vsm$$ = $JSCompiler_StaticMethods_setupVisibilityStateMachine_$self$$.$viewport_$.$getSize$();
    if (0 < $vsm$$.height && 0 < $vsm$$.width) {
      0 < $JSCompiler_StaticMethods_setupVisibilityStateMachine_$self$$.$G$.length && $JSCompiler_StaticMethods_mutateWorkViaResources_$$($JSCompiler_StaticMethods_setupVisibilityStateMachine_$self$$);
      $JSCompiler_StaticMethods_discoverWork_$$($JSCompiler_StaticMethods_setupVisibilityStateMachine_$self$$);
      $vsm$$ = Date.now();
      for (var $resume$$ = -1, $unload$$ = Object.create(null), $pause$$ = $JSCompiler_StaticMethods_TaskQueue$$module$src$service$task_queue_prototype$peek$$($JSCompiler_StaticMethods_setupVisibilityStateMachine_$self$$.$F$, $JSCompiler_StaticMethods_setupVisibilityStateMachine_$self$$.$na$, $unload$$); $pause$$;) {
        $resume$$ = $JSCompiler_StaticMethods_calcTaskTimeout_$$($JSCompiler_StaticMethods_setupVisibilityStateMachine_$self$$, $pause$$);
        "Resources";
        if (16 < $resume$$) {
          break;
        }
        $JSCompiler_StaticMethods_TaskQueue$$module$src$service$task_queue_prototype$dequeue$$($JSCompiler_StaticMethods_setupVisibilityStateMachine_$self$$.$F$, $pause$$);
        ($resume$$ = $JSCompiler_StaticMethods_setupVisibilityStateMachine_$self$$.$I$.$F$[$pause$$.id] || null) ? ($pause$$ = $JSCompiler_StaticMethods_setupVisibilityStateMachine_$self$$.$reschedule_$.bind($JSCompiler_StaticMethods_setupVisibilityStateMachine_$self$$, $pause$$), $resume$$.$promise$.then($pause$$, $pause$$)) : ($pause$$.$resource$.measure(), $JSCompiler_StaticMethods_isLayoutAllowed_$$($JSCompiler_StaticMethods_setupVisibilityStateMachine_$self$$, $pause$$.$resource$, $pause$$.$forceOutsideViewport$) ? 
        ($pause$$.$promise$ = $pause$$.$callback$(), $pause$$.startTime = $vsm$$, "Resources", $JSCompiler_StaticMethods_TaskQueue$$module$src$service$task_queue_prototype$enqueue$$($JSCompiler_StaticMethods_setupVisibilityStateMachine_$self$$.$I$, $pause$$), $pause$$.$promise$.then($JSCompiler_StaticMethods_setupVisibilityStateMachine_$self$$.$taskComplete_$.bind($JSCompiler_StaticMethods_setupVisibilityStateMachine_$self$$, $pause$$, !0), $JSCompiler_StaticMethods_setupVisibilityStateMachine_$self$$.$taskComplete_$.bind($JSCompiler_StaticMethods_setupVisibilityStateMachine_$self$$, 
        $pause$$, !1)).catch(_.$reportError$$module$src$error$$)) : ("Resources", _.$JSCompiler_StaticMethods_layoutCanceled$$($pause$$.$resource$)));
        $pause$$ = $JSCompiler_StaticMethods_TaskQueue$$module$src$service$task_queue_prototype$peek$$($JSCompiler_StaticMethods_setupVisibilityStateMachine_$self$$.$F$, $JSCompiler_StaticMethods_setupVisibilityStateMachine_$self$$.$na$, $unload$$);
        $resume$$ = -1;
      }
      "Resources";
      "Resources";
      0 <= $resume$$ ? $vsm$$ = $resume$$ : ($vsm$$ = 2 * ($vsm$$ - $JSCompiler_StaticMethods_setupVisibilityStateMachine_$self$$.$I$.$G$), $vsm$$ = Math.max(Math.min(30000, $vsm$$), 5000));
      0 < $JSCompiler_StaticMethods_setupVisibilityStateMachine_$self$$.$G$.length && ($vsm$$ = Math.min($vsm$$, 500));
      $JSCompiler_StaticMethods_setupVisibilityStateMachine_$self$$.$visible_$ && _.$JSCompiler_StaticMethods_schedulePass$$($JSCompiler_StaticMethods_setupVisibilityStateMachine_$self$$, $vsm$$);
      "Resources";
    }
  }
  _.$JSCompiler_StaticMethods_addTransition$$($vsm$$, "prerender", "prerender", $doPass$$);
  _.$JSCompiler_StaticMethods_addTransition$$($vsm$$, "prerender", "visible", $doPass$$);
  _.$JSCompiler_StaticMethods_addTransition$$($vsm$$, "prerender", "hidden", $doPass$$);
  _.$JSCompiler_StaticMethods_addTransition$$($vsm$$, "prerender", "inactive", $doPass$$);
  _.$JSCompiler_StaticMethods_addTransition$$($vsm$$, "prerender", "paused", $doPass$$);
  _.$JSCompiler_StaticMethods_addTransition$$($vsm$$, "visible", "visible", $doPass$$);
  _.$JSCompiler_StaticMethods_addTransition$$($vsm$$, "visible", "hidden", $doPass$$);
  _.$JSCompiler_StaticMethods_addTransition$$($vsm$$, "visible", "inactive", $unload$$);
  _.$JSCompiler_StaticMethods_addTransition$$($vsm$$, "visible", "paused", $pause$$);
  _.$JSCompiler_StaticMethods_addTransition$$($vsm$$, "hidden", "visible", $doPass$$);
  _.$JSCompiler_StaticMethods_addTransition$$($vsm$$, "hidden", "hidden", $doPass$$);
  _.$JSCompiler_StaticMethods_addTransition$$($vsm$$, "hidden", "inactive", $unload$$);
  _.$JSCompiler_StaticMethods_addTransition$$($vsm$$, "hidden", "paused", $pause$$);
  _.$JSCompiler_StaticMethods_addTransition$$($vsm$$, "inactive", "visible", $resume$$);
  _.$JSCompiler_StaticMethods_addTransition$$($vsm$$, "inactive", "hidden", $resume$$);
  _.$JSCompiler_StaticMethods_addTransition$$($vsm$$, "inactive", "inactive", $noop$$);
  _.$JSCompiler_StaticMethods_addTransition$$($vsm$$, "inactive", "paused", $doPass$$);
  _.$JSCompiler_StaticMethods_addTransition$$($vsm$$, "paused", "visible", $resume$$);
  _.$JSCompiler_StaticMethods_addTransition$$($vsm$$, "paused", "hidden", $doPass$$);
  _.$JSCompiler_StaticMethods_addTransition$$($vsm$$, "paused", "inactive", $unload$$);
  _.$JSCompiler_StaticMethods_addTransition$$($vsm$$, "paused", "paused", $noop$$);
};
$JSCompiler_StaticMethods_cleanupTasks_$$ = function($JSCompiler_StaticMethods_cleanupTasks_$self$$, $resource$jscomp$29$$, $opt_removePending_pendingIndex$$) {
  1 == $resource$jscomp$29$$.$state_$ && ($JSCompiler_StaticMethods_purge$$($JSCompiler_StaticMethods_cleanupTasks_$self$$.$F$, function($JSCompiler_StaticMethods_cleanupTasks_$self$$) {
    return $JSCompiler_StaticMethods_cleanupTasks_$self$$.$resource$ == $resource$jscomp$29$$;
  }), $JSCompiler_StaticMethods_purge$$($JSCompiler_StaticMethods_cleanupTasks_$self$$.$I$, function($JSCompiler_StaticMethods_cleanupTasks_$self$$) {
    return $JSCompiler_StaticMethods_cleanupTasks_$self$$.$resource$ == $resource$jscomp$29$$;
  }), _.$remove$$module$src$utils$array$$($JSCompiler_StaticMethods_cleanupTasks_$self$$.$G$, function($JSCompiler_StaticMethods_cleanupTasks_$self$$) {
    return $JSCompiler_StaticMethods_cleanupTasks_$self$$.$resource$ === $resource$jscomp$29$$;
  }));
  0 == $resource$jscomp$29$$.$state_$ && $opt_removePending_pendingIndex$$ && $JSCompiler_StaticMethods_cleanupTasks_$self$$.$J$ && ($opt_removePending_pendingIndex$$ = $JSCompiler_StaticMethods_cleanupTasks_$self$$.$J$.indexOf($resource$jscomp$29$$), -1 != $opt_removePending_pendingIndex$$ && $JSCompiler_StaticMethods_cleanupTasks_$self$$.$J$.splice($opt_removePending_pendingIndex$$, 1));
};
_.$elements_$$module$src$service$resources_impl$$ = function($elements$jscomp$10$$) {
  return _.$isArray$$module$src$types$$($elements$jscomp$10$$) ? $elements$jscomp$10$$ : [$elements$jscomp$10$$];
};
$StandardActions$$module$src$service$standard_actions_impl$$ = function($actionService$jscomp$inline_1531_ampdoc$jscomp$52$$, $handler$jscomp$inline_5769_opt_win$jscomp$2$$) {
  this.ampdoc = $actionService$jscomp$inline_1531_ampdoc$jscomp$52$$;
  this.$actions_$ = _.$Services$$module$src$services$actionServiceForDoc$$($handler$jscomp$inline_5769_opt_win$jscomp$2$$ ? $handler$jscomp$inline_5769_opt_win$jscomp$2$$.document.documentElement : $actionService$jscomp$inline_1531_ampdoc$jscomp$52$$.$getHeadNode$());
  this.$D$ = _.$Services$$module$src$services$resourcesForDoc$$($actionService$jscomp$inline_1531_ampdoc$jscomp$52$$);
  this.$viewport_$ = _.$Services$$module$src$services$viewportForDoc$$($actionService$jscomp$inline_1531_ampdoc$jscomp$52$$);
  $actionService$jscomp$inline_1531_ampdoc$jscomp$52$$ = this.$actions_$;
  $handler$jscomp$inline_5769_opt_win$jscomp$2$$ = this.$handleAmpTarget$.bind(this);
  $actionService$jscomp$inline_1531_ampdoc$jscomp$52$$.$G$.AMP = $handler$jscomp$inline_5769_opt_win$jscomp$2$$;
  $JSCompiler_StaticMethods_addGlobalMethodHandler$$($actionService$jscomp$inline_1531_ampdoc$jscomp$52$$, "hide", this.$handleHide$.bind(this));
  $JSCompiler_StaticMethods_addGlobalMethodHandler$$($actionService$jscomp$inline_1531_ampdoc$jscomp$52$$, "show", this.$handleShow$.bind(this));
  $JSCompiler_StaticMethods_addGlobalMethodHandler$$($actionService$jscomp$inline_1531_ampdoc$jscomp$52$$, "toggleVisibility", this.$handleToggle$.bind(this));
  $JSCompiler_StaticMethods_addGlobalMethodHandler$$($actionService$jscomp$inline_1531_ampdoc$jscomp$52$$, "scrollTo", this.$handleScrollTo$.bind(this));
  $JSCompiler_StaticMethods_addGlobalMethodHandler$$($actionService$jscomp$inline_1531_ampdoc$jscomp$52$$, "focus", this.$handleFocus$.bind(this));
  $JSCompiler_StaticMethods_addGlobalMethodHandler$$($actionService$jscomp$inline_1531_ampdoc$jscomp$52$$, "toggleClass", this.$handleToggleClass$.bind(this));
};
$JSCompiler_StaticMethods_handleNavigateTo$$ = function($JSCompiler_StaticMethods_handleNavigateTo$self$$, $invocation$jscomp$10_permission$jscomp$1$$) {
  var $node$jscomp$39$$ = $invocation$jscomp$10_permission$jscomp$1$$.node, $caller$jscomp$2$$ = $invocation$jscomp$10_permission$jscomp$1$$.caller, $method$jscomp$14$$ = $invocation$jscomp$10_permission$jscomp$1$$.method, $args$jscomp$11$$ = $invocation$jscomp$10_permission$jscomp$1$$.args, $win$jscomp$173$$ = ($node$jscomp$39$$.ownerDocument || $node$jscomp$39$$).defaultView;
  $invocation$jscomp$10_permission$jscomp$1$$ = window.Promise.resolve();
  _.$startsWith$$module$src$string$$($caller$jscomp$2$$.tagName, "AMP-") && ($invocation$jscomp$10_permission$jscomp$1$$ = $caller$jscomp$2$$.$getImpl$().then(function($JSCompiler_StaticMethods_handleNavigateTo$self$$) {
    "function" == typeof $JSCompiler_StaticMethods_handleNavigateTo$self$$.$throwIfCannotNavigate$ && $JSCompiler_StaticMethods_handleNavigateTo$self$$.$throwIfCannotNavigate$();
  }));
  return $invocation$jscomp$10_permission$jscomp$1$$.then(function() {
    _.$JSCompiler_StaticMethods_navigateTo$$(_.$Services$$module$src$services$navigationForDoc$$($JSCompiler_StaticMethods_handleNavigateTo$self$$.ampdoc), $win$jscomp$173$$, $args$jscomp$11$$.url, "AMP." + $method$jscomp$14$$, {target:$args$jscomp$11$$.target, opener:$args$jscomp$11$$.opener});
  }, function($JSCompiler_StaticMethods_handleNavigateTo$self$$) {
    _.$user$$module$src$log$$().error("STANDARD-ACTIONS", $JSCompiler_StaticMethods_handleNavigateTo$self$$.message);
  });
};
$JSCompiler_StaticMethods_handleCloseOrNavigateTo$$ = function($JSCompiler_StaticMethods_handleCloseOrNavigateTo$self$$, $invocation$jscomp$11$$) {
  var $node$jscomp$40_win$jscomp$174$$ = $invocation$jscomp$11$$.node;
  $node$jscomp$40_win$jscomp$174$$ = ($node$jscomp$40_win$jscomp$174$$.ownerDocument || $node$jscomp$40_win$jscomp$174$$).defaultView;
  var $hasParent$$ = $node$jscomp$40_win$jscomp$174$$.parent != $node$jscomp$40_win$jscomp$174$$, $wasClosed$$ = !1;
  $node$jscomp$40_win$jscomp$174$$.opener && $JSCompiler_StaticMethods_handleCloseOrNavigateTo$self$$.ampdoc.$isSingleDoc$() && !$hasParent$$ && ($node$jscomp$40_win$jscomp$174$$.close(), $wasClosed$$ = $node$jscomp$40_win$jscomp$174$$.closed);
  return $wasClosed$$ ? window.Promise.resolve() : $JSCompiler_StaticMethods_handleNavigateTo$$($JSCompiler_StaticMethods_handleCloseOrNavigateTo$self$$, $invocation$jscomp$11$$);
};
$Storage$$module$src$service$storage_impl$$ = function($ampdoc$jscomp$55$$, $viewer$jscomp$15$$, $binding$jscomp$2$$) {
  this.ampdoc = $ampdoc$jscomp$55$$;
  this.$viewer_$ = $viewer$jscomp$15$$;
  this.$F$ = $binding$jscomp$2$$;
  this.$origin_$ = _.$getSourceOrigin$$module$src$url$$(this.ampdoc.$win$.location);
  this.$D$ = null;
};
_.$JSCompiler_StaticMethods_setNonBoolean$$ = function($JSCompiler_StaticMethods_setNonBoolean$self$$, $name$jscomp$135$$, $value$jscomp$132$$, $opt_isUpdate$jscomp$1$$) {
  return $JSCompiler_StaticMethods_saveStore_$$($JSCompiler_StaticMethods_setNonBoolean$self$$, function($JSCompiler_StaticMethods_setNonBoolean$self$$) {
    return $JSCompiler_StaticMethods_setNonBoolean$self$$.set($name$jscomp$135$$, $value$jscomp$132$$, $opt_isUpdate$jscomp$1$$);
  });
};
$JSCompiler_StaticMethods_getStore_$$ = function($JSCompiler_StaticMethods_getStore_$self$$) {
  $JSCompiler_StaticMethods_getStore_$self$$.$D$ || ($JSCompiler_StaticMethods_getStore_$self$$.$D$ = $JSCompiler_StaticMethods_getStore_$self$$.$F$.$F$($JSCompiler_StaticMethods_getStore_$self$$.$origin_$).then(function($JSCompiler_StaticMethods_getStore_$self$$) {
    return $JSCompiler_StaticMethods_getStore_$self$$ ? _.$parseJson$$module$src$json$$((0,window.atob)($JSCompiler_StaticMethods_getStore_$self$$)) : {};
  }).catch(function($JSCompiler_StaticMethods_getStore_$self$$) {
    _.$dev$$module$src$log$$().$expectedError$("Storage", "Failed to load store: ", $JSCompiler_StaticMethods_getStore_$self$$);
    return {};
  }).then(function($JSCompiler_StaticMethods_getStore_$self$$) {
    return new $Store$$module$src$service$storage_impl$$($JSCompiler_StaticMethods_getStore_$self$$);
  }));
  return $JSCompiler_StaticMethods_getStore_$self$$.$D$;
};
$JSCompiler_StaticMethods_saveStore_$$ = function($JSCompiler_StaticMethods_saveStore_$self$$, $mutator$jscomp$7$$) {
  return $JSCompiler_StaticMethods_getStore_$$($JSCompiler_StaticMethods_saveStore_$self$$).then(function($blob$jscomp$8_store$jscomp$3$$) {
    $mutator$jscomp$7$$($blob$jscomp$8_store$jscomp$3$$);
    $blob$jscomp$8_store$jscomp$3$$ = (0,window.btoa)(JSON.stringify($blob$jscomp$8_store$jscomp$3$$.$obj$));
    return $JSCompiler_StaticMethods_saveStore_$self$$.$F$.$G$($JSCompiler_StaticMethods_saveStore_$self$$.$origin_$, $blob$jscomp$8_store$jscomp$3$$);
  }).then($JSCompiler_StaticMethods_saveStore_$self$$.$G$.bind($JSCompiler_StaticMethods_saveStore_$self$$));
};
$JSCompiler_StaticMethods_Storage$$module$src$service$storage_impl_prototype$listenToBroadcasts_$$ = function($JSCompiler_StaticMethods_Storage$$module$src$service$storage_impl_prototype$listenToBroadcasts_$self$$) {
  _.$JSCompiler_StaticMethods_onBroadcast$$($JSCompiler_StaticMethods_Storage$$module$src$service$storage_impl_prototype$listenToBroadcasts_$self$$.$viewer_$, function($message$jscomp$40$$) {
    "amp-storage-reset" == $message$jscomp$40$$.type && $message$jscomp$40$$.origin == $JSCompiler_StaticMethods_Storage$$module$src$service$storage_impl_prototype$listenToBroadcasts_$self$$.$origin_$ && ("Storage", $JSCompiler_StaticMethods_Storage$$module$src$service$storage_impl_prototype$listenToBroadcasts_$self$$.$D$ = null);
  });
};
$Store$$module$src$service$storage_impl$$ = function($obj$jscomp$33$$) {
  this.$obj$ = $recreateNonProtoObject$$module$src$json$$($obj$jscomp$33$$);
  this.$D$ = this.$obj$.vv || Object.create(null);
  this.$obj$.vv || (this.$obj$.vv = this.$D$);
};
$LocalStorageBinding$$module$src$service$storage_impl$$ = function($error$jscomp$24_win$jscomp$175$$) {
  this.$win$ = $error$jscomp$24_win$jscomp$175$$;
  try {
    if ("localStorage" in this.$win$) {
      this.$win$.localStorage.getItem("test");
      var $JSCompiler_inline_result$jscomp$492$$ = !0;
    } else {
      $JSCompiler_inline_result$jscomp$492$$ = !1;
    }
  } catch ($e$jscomp$inline_1534$$) {
    $JSCompiler_inline_result$jscomp$492$$ = !1;
  }
  this.$D$ = $JSCompiler_inline_result$jscomp$492$$;
  this.$D$ || ($error$jscomp$24_win$jscomp$175$$ = Error("localStorage not supported."), _.$dev$$module$src$log$$().$expectedError$("Storage", $error$jscomp$24_win$jscomp$175$$));
};
$ViewerStorageBinding$$module$src$service$storage_impl$$ = function($viewer$jscomp$16$$) {
  this.$viewer_$ = $viewer$jscomp$16$$;
};
$installStorageServiceForDoc$$module$src$service$storage_impl$$ = function($ampdoc$jscomp$56$$) {
  _.$registerServiceBuilderForDoc$$module$src$service$$($ampdoc$jscomp$56$$, "storage", function() {
    var $JSCompiler_StaticMethods_Storage$$module$src$service$storage_impl_prototype$start_$self$jscomp$inline_1536_viewer$jscomp$17$$ = _.$Services$$module$src$services$viewerForDoc$$($ampdoc$jscomp$56$$), $binding$jscomp$3$$ = (0,window.parseInt)($JSCompiler_StaticMethods_Storage$$module$src$service$storage_impl_prototype$start_$self$jscomp$inline_1536_viewer$jscomp$17$$.$params_$.storage, 10) ? new $ViewerStorageBinding$$module$src$service$storage_impl$$($JSCompiler_StaticMethods_Storage$$module$src$service$storage_impl_prototype$start_$self$jscomp$inline_1536_viewer$jscomp$17$$) : 
    new $LocalStorageBinding$$module$src$service$storage_impl$$($ampdoc$jscomp$56$$.$win$);
    $JSCompiler_StaticMethods_Storage$$module$src$service$storage_impl_prototype$start_$self$jscomp$inline_1536_viewer$jscomp$17$$ = new $Storage$$module$src$service$storage_impl$$($ampdoc$jscomp$56$$, $JSCompiler_StaticMethods_Storage$$module$src$service$storage_impl_prototype$start_$self$jscomp$inline_1536_viewer$jscomp$17$$, $binding$jscomp$3$$);
    $JSCompiler_StaticMethods_Storage$$module$src$service$storage_impl_prototype$listenToBroadcasts_$$($JSCompiler_StaticMethods_Storage$$module$src$service$storage_impl_prototype$start_$self$jscomp$inline_1536_viewer$jscomp$17$$);
    return $JSCompiler_StaticMethods_Storage$$module$src$service$storage_impl_prototype$start_$self$jscomp$inline_1536_viewer$jscomp$17$$;
  }, !0);
};
_.$BaseTemplate$$module$src$service$template_impl$$ = function($element$jscomp$146$$, $win$jscomp$176$$) {
  this.element = $element$jscomp$146$$;
  this.$win$ = $element$jscomp$146$$.ownerDocument.defaultView || $win$jscomp$176$$;
  this.$viewer_$ = _.$getServiceForDoc$$module$src$service$$(this.element, "viewer");
  this.$F$();
};
$Templates$$module$src$service$template_impl$$ = function($win$jscomp$177$$) {
  this.$G$ = $win$jscomp$177$$;
  this.$D$ = {};
  this.$F$ = {};
};
$Timer$$module$src$service$timer_impl$$ = function($win$jscomp$180$$) {
  this.$win$ = $win$jscomp$180$$;
  this.$G$ = this.$win$.Promise.resolve();
  this.$I$ = 0;
  this.$D$ = {};
  this.$F$ = Date.now();
};
_.$JSCompiler_StaticMethods_timeoutPromise$$ = function($JSCompiler_StaticMethods_timeoutPromise$self$$, $delay$jscomp$3$$, $opt_racePromise$$, $opt_message$jscomp$16$$) {
  function $cancel$$() {
    $JSCompiler_StaticMethods_timeoutPromise$self$$.cancel($timerKey$jscomp$1$$);
  }
  var $timerKey$jscomp$1$$, $delayPromise$$ = new $JSCompiler_StaticMethods_timeoutPromise$self$$.$win$.Promise(function($opt_racePromise$$, $cancel$$) {
    $timerKey$jscomp$1$$ = $JSCompiler_StaticMethods_timeoutPromise$self$$.delay(function() {
      $cancel$$(_.$user$$module$src$log$$().$createError$($opt_message$jscomp$16$$ || "timeout"));
    }, $delay$jscomp$3$$);
    if (-1 == $timerKey$jscomp$1$$) {
      throw Error("Failed to schedule timer.");
    }
  });
  if (!$opt_racePromise$$) {
    return $delayPromise$$;
  }
  $opt_racePromise$$.then($cancel$$, $cancel$$);
  return $JSCompiler_StaticMethods_timeoutPromise$self$$.$win$.Promise.race([$delayPromise$$, $opt_racePromise$$]);
};
_.$JSCompiler_StaticMethods_poll$$ = function($JSCompiler_StaticMethods_poll$self$$, $delay$jscomp$4$$, $predicate$jscomp$2$$) {
  return new $JSCompiler_StaticMethods_poll$self$$.$win$.Promise(function($resolve$jscomp$35$$) {
    var $interval$jscomp$4$$ = $JSCompiler_StaticMethods_poll$self$$.$win$.setInterval(function() {
      $predicate$jscomp$2$$() && ($JSCompiler_StaticMethods_poll$self$$.$win$.clearInterval($interval$jscomp$4$$), $resolve$jscomp$35$$());
    }, $delay$jscomp$4$$);
  });
};
$Url$$module$src$service$url_impl$$ = function($ampdoc$jscomp$57_root$jscomp$12$$, $opt_rootNode$jscomp$1$$) {
  this.$ampdoc_$ = $ampdoc$jscomp$57_root$jscomp$12$$;
  $ampdoc$jscomp$57_root$jscomp$12$$ = $opt_rootNode$jscomp$1$$ || $ampdoc$jscomp$57_root$jscomp$12$$.getRootNode();
  this.$F$ = ($ampdoc$jscomp$57_root$jscomp$12$$.ownerDocument || $ampdoc$jscomp$57_root$jscomp$12$$).createElement("a");
  this.$D$ = new _.$LruCache$$module$src$utils$lru_cache$$(100);
};
_.$Expander$$module$src$service$url_expander$expander$$ = function($variableSource$$, $opt_bindings$$, $opt_collectVars$$, $opt_sync$$, $opt_whiteList$$, $opt_noEncode$$) {
  this.$G$ = $variableSource$$;
  this.$F$ = $opt_bindings$$;
  this.$J$ = $opt_collectVars$$;
  this.$D$ = $opt_sync$$;
  this.$I$ = $opt_whiteList$$;
  this.$K$ = !$opt_noEncode$$;
};
$JSCompiler_StaticMethods_findMatches_$$ = function($url$jscomp$78$$, $expression$jscomp$3$$) {
  var $matches$jscomp$6$$ = [];
  $url$jscomp$78$$.replace($expression$jscomp$3$$, function($url$jscomp$78$$, $expression$jscomp$3$$, $startPosition$$) {
    $url$jscomp$78$$ = $url$jscomp$78$$.length;
    $matches$jscomp$6$$.push({start:$startPosition$$, stop:$url$jscomp$78$$ + $startPosition$$ - 1, name:$expression$jscomp$3$$, length:$url$jscomp$78$$});
  });
  return $matches$jscomp$6$$;
};
$JSCompiler_StaticMethods_parseUrlRecursively_$$ = function($JSCompiler_StaticMethods_parseUrlRecursively_$self$$, $url$jscomp$79$$, $matches$jscomp$7$$) {
  function $evaluateNextLevel$$($binding$161_encode$$) {
    for (var $builder$$ = "", $results$jscomp$2$$ = []; $urlIndex$$ < $url$jscomp$79$$.length && $matchIndex$$ <= $matches$jscomp$7$$.length;) {
      if ($match$jscomp$4$$ && $urlIndex$$ === $match$jscomp$4$$.start) {
        var $binding$jscomp$4$$ = void 0;
        $JSCompiler_StaticMethods_parseUrlRecursively_$self$$.$F$ && _.$hasOwn$$module$src$utils$object$$($JSCompiler_StaticMethods_parseUrlRecursively_$self$$.$F$, $match$jscomp$4$$.name) ? $binding$jscomp$4$$ = {name:$match$jscomp$4$$.name, $prioritized$:$JSCompiler_StaticMethods_parseUrlRecursively_$self$$.$F$[$match$jscomp$4$$.name], encode:$binding$161_encode$$} : $binding$jscomp$4$$ = Object.assign({}, $JSCompiler_StaticMethods_parseUrlRecursively_$self$$.$G$.get($match$jscomp$4$$.name), {name:$match$jscomp$4$$.name, 
        encode:$binding$161_encode$$});
        $urlIndex$$ = $match$jscomp$4$$.stop + 1;
        $match$jscomp$4$$ = $matches$jscomp$7$$[++$matchIndex$$];
        "(" === $url$jscomp$79$$[$urlIndex$$] ? ($urlIndex$$++, $numOfPendingCalls$$++, $stack$jscomp$2$$.push($binding$jscomp$4$$), $builder$$.trim().length && $results$jscomp$2$$.push($builder$$), $results$jscomp$2$$.push($evaluateNextLevel$$(!1))) : ($builder$$.length && $results$jscomp$2$$.push($builder$$), $results$jscomp$2$$.push($JSCompiler_StaticMethods_evaluateBinding_$$($JSCompiler_StaticMethods_parseUrlRecursively_$self$$, $binding$jscomp$4$$)));
        $builder$$ = "";
      } else {
        if ("`" === $url$jscomp$79$$[$urlIndex$$]) {
          $ignoringChars$$ ? $ignoringChars$$ = !1 : ($nextArgShouldBeRaw$$ = $ignoringChars$$ = !0, $builder$$ = "");
        } else {
          if ($numOfPendingCalls$$ && "," === $url$jscomp$79$$[$urlIndex$$] && !$ignoringChars$$) {
            $builder$$.length && ($results$jscomp$2$$.push($nextArgShouldBeRaw$$ ? $builder$$ : $builder$$.trim()), $nextArgShouldBeRaw$$ = !1), "," === $url$jscomp$79$$[$urlIndex$$ + 1] && ($results$jscomp$2$$.push(""), $urlIndex$$++), $builder$$ = "";
          } else {
            if ($numOfPendingCalls$$ && ")" === $url$jscomp$79$$[$urlIndex$$] && !$ignoringChars$$) {
              return $urlIndex$$++, $numOfPendingCalls$$--, $binding$161_encode$$ = $stack$jscomp$2$$.pop(), $results$jscomp$2$$.push($nextArgShouldBeRaw$$ ? $builder$$ : $builder$$.trim()), $nextArgShouldBeRaw$$ = !1, $JSCompiler_StaticMethods_evaluateBinding_$$($JSCompiler_StaticMethods_parseUrlRecursively_$self$$, $binding$161_encode$$, $results$jscomp$2$$);
            }
            $builder$$ += $url$jscomp$79$$[$urlIndex$$];
          }
        }
        $urlIndex$$++;
      }
      $urlIndex$$ === $url$jscomp$79$$.length && $builder$$.length && $results$jscomp$2$$.push($builder$$);
    }
    return $JSCompiler_StaticMethods_parseUrlRecursively_$self$$.$D$ ? $results$jscomp$2$$.join("") : window.Promise.all($results$jscomp$2$$).then(function($JSCompiler_StaticMethods_parseUrlRecursively_$self$$) {
      return $JSCompiler_StaticMethods_parseUrlRecursively_$self$$.join("");
    }).catch(function($JSCompiler_StaticMethods_parseUrlRecursively_$self$$) {
      _.$rethrowAsync$$module$src$log$$($JSCompiler_StaticMethods_parseUrlRecursively_$self$$);
      return "";
    });
  }
  var $stack$jscomp$2$$ = [], $urlIndex$$ = 0, $matchIndex$$ = 0, $match$jscomp$4$$ = $matches$jscomp$7$$[$matchIndex$$], $numOfPendingCalls$$ = 0, $ignoringChars$$ = !1, $nextArgShouldBeRaw$$ = !1;
  return $evaluateNextLevel$$($JSCompiler_StaticMethods_parseUrlRecursively_$self$$.$K$);
};
$JSCompiler_StaticMethods_evaluateBinding_$$ = function($JSCompiler_StaticMethods_evaluateBinding_$self_result$jscomp$6$$, $binding$jscomp$5_bindingInfo$$, $opt_args$jscomp$1$$) {
  var $encode$jscomp$1$$ = $binding$jscomp$5_bindingInfo$$.encode, $name$jscomp$141$$ = $binding$jscomp$5_bindingInfo$$.name;
  _.$hasOwn$$module$src$utils$object$$($binding$jscomp$5_bindingInfo$$, "prioritized") ? $binding$jscomp$5_bindingInfo$$ = $binding$jscomp$5_bindingInfo$$.$prioritized$ : $JSCompiler_StaticMethods_evaluateBinding_$self_result$jscomp$6$$.$D$ && _.$hasOwn$$module$src$utils$object$$($binding$jscomp$5_bindingInfo$$, "sync") ? $binding$jscomp$5_bindingInfo$$ = $binding$jscomp$5_bindingInfo$$.sync : $JSCompiler_StaticMethods_evaluateBinding_$self_result$jscomp$6$$.$D$ ? (_.$user$$module$src$log$$().error("Expander", 
  "ignoring async replacement key: ", $binding$jscomp$5_bindingInfo$$.name), $binding$jscomp$5_bindingInfo$$ = "") : $binding$jscomp$5_bindingInfo$$ = $binding$jscomp$5_bindingInfo$$.async || $binding$jscomp$5_bindingInfo$$.sync;
  var $shouldEncode$$ = $encode$jscomp$1$$ && !$NOENCODE_WHITELIST$$module$src$service$url_expander$expander$$[$name$jscomp$141$$];
  return $JSCompiler_StaticMethods_evaluateBinding_$self_result$jscomp$6$$.$D$ ? ($JSCompiler_StaticMethods_evaluateBinding_$self_result$jscomp$6$$ = $JSCompiler_StaticMethods_evaluateBindingSync_$$($JSCompiler_StaticMethods_evaluateBinding_$self_result$jscomp$6$$, $binding$jscomp$5_bindingInfo$$, $name$jscomp$141$$, $opt_args$jscomp$1$$), $shouldEncode$$ ? (0,window.encodeURIComponent)($JSCompiler_StaticMethods_evaluateBinding_$self_result$jscomp$6$$) : $JSCompiler_StaticMethods_evaluateBinding_$self_result$jscomp$6$$) : 
  $JSCompiler_StaticMethods_evaluateBindingAsync_$$($JSCompiler_StaticMethods_evaluateBinding_$self_result$jscomp$6$$, $binding$jscomp$5_bindingInfo$$, $name$jscomp$141$$, $opt_args$jscomp$1$$).then(function($JSCompiler_StaticMethods_evaluateBinding_$self_result$jscomp$6$$) {
    return $shouldEncode$$ ? (0,window.encodeURIComponent)($JSCompiler_StaticMethods_evaluateBinding_$self_result$jscomp$6$$) : $JSCompiler_StaticMethods_evaluateBinding_$self_result$jscomp$6$$;
  });
};
$JSCompiler_StaticMethods_evaluateBindingAsync_$$ = function($JSCompiler_StaticMethods_evaluateBindingAsync_$self$$, $binding$jscomp$6$$, $name$jscomp$142$$, $opt_args$jscomp$2$$) {
  var $value$jscomp$135$$;
  try {
    return "function" === typeof $binding$jscomp$6$$ ? $value$jscomp$135$$ = $opt_args$jscomp$2$$ ? window.Promise.all($opt_args$jscomp$2$$).then(function($JSCompiler_StaticMethods_evaluateBindingAsync_$self$$) {
      return $binding$jscomp$6$$.apply(null, $JSCompiler_StaticMethods_evaluateBindingAsync_$self$$);
    }) : _.$tryResolve$$module$src$utils$promise$$($binding$jscomp$6$$) : $value$jscomp$135$$ = window.Promise.resolve($binding$jscomp$6$$), $value$jscomp$135$$.then(function($binding$jscomp$6$$) {
      $JSCompiler_StaticMethods_maybeCollectVars_$$($JSCompiler_StaticMethods_evaluateBindingAsync_$self$$, $name$jscomp$142$$, $binding$jscomp$6$$, $opt_args$jscomp$2$$);
      var $value$jscomp$135$$;
      null == $binding$jscomp$6$$ ? $value$jscomp$135$$ = "" : $value$jscomp$135$$ = $binding$jscomp$6$$;
      return $value$jscomp$135$$;
    }).catch(function($binding$jscomp$6$$) {
      _.$rethrowAsync$$module$src$log$$($binding$jscomp$6$$);
      $JSCompiler_StaticMethods_maybeCollectVars_$$($JSCompiler_StaticMethods_evaluateBindingAsync_$self$$, $name$jscomp$142$$, "", $opt_args$jscomp$2$$);
      return window.Promise.resolve("");
    });
  } catch ($e$jscomp$82$$) {
    return _.$rethrowAsync$$module$src$log$$($e$jscomp$82$$), $JSCompiler_StaticMethods_maybeCollectVars_$$($JSCompiler_StaticMethods_evaluateBindingAsync_$self$$, $name$jscomp$142$$, "", $opt_args$jscomp$2$$), window.Promise.resolve("");
  }
};
$JSCompiler_StaticMethods_evaluateBindingSync_$$ = function($JSCompiler_StaticMethods_evaluateBindingSync_$self$$, $binding$jscomp$7$$, $name$jscomp$143$$, $opt_args$jscomp$3$$) {
  try {
    var $value$jscomp$136$$ = "function" === typeof $binding$jscomp$7$$ ? $binding$jscomp$7$$.apply(null, $opt_args$jscomp$3$$) : $binding$jscomp$7$$;
    if ($value$jscomp$136$$ && $value$jscomp$136$$.then) {
      _.$user$$module$src$log$$().error("Expander", "ignoring async macro resolution");
      var $result$jscomp$9$$ = "";
    } else {
      "string" === typeof $value$jscomp$136$$ || "number" === typeof $value$jscomp$136$$ || "boolean" === typeof $value$jscomp$136$$ ? ($JSCompiler_StaticMethods_maybeCollectVars_$$($JSCompiler_StaticMethods_evaluateBindingSync_$self$$, $name$jscomp$143$$, $value$jscomp$136$$, $opt_args$jscomp$3$$), $result$jscomp$9$$ = $value$jscomp$136$$.toString()) : ($JSCompiler_StaticMethods_maybeCollectVars_$$($JSCompiler_StaticMethods_evaluateBindingSync_$self$$, $name$jscomp$143$$, "", $opt_args$jscomp$3$$), 
      $result$jscomp$9$$ = "");
    }
    return $result$jscomp$9$$;
  } catch ($e$jscomp$83$$) {
    return _.$rethrowAsync$$module$src$log$$($e$jscomp$83$$), $JSCompiler_StaticMethods_maybeCollectVars_$$($JSCompiler_StaticMethods_evaluateBindingSync_$self$$, $name$jscomp$143$$, "", $opt_args$jscomp$3$$), "";
  }
};
$JSCompiler_StaticMethods_maybeCollectVars_$$ = function($JSCompiler_StaticMethods_maybeCollectVars_$self$$, $name$jscomp$144$$, $value$jscomp$137$$, $opt_args$jscomp$4$$) {
  if ($JSCompiler_StaticMethods_maybeCollectVars_$self$$.$J$) {
    var $args$jscomp$14$$ = "";
    $opt_args$jscomp$4$$ && ($args$jscomp$14$$ = "(" + $opt_args$jscomp$4$$.filter(function($JSCompiler_StaticMethods_maybeCollectVars_$self$$) {
      return "" !== $JSCompiler_StaticMethods_maybeCollectVars_$self$$;
    }).join(",") + ")");
    $JSCompiler_StaticMethods_maybeCollectVars_$self$$.$J$[$name$jscomp$144$$ + $args$jscomp$14$$] = $value$jscomp$137$$ || "";
  }
};
_.$getTimingDataAsync$$module$src$service$variable_source$$ = function($win$jscomp$182$$, $startEvent$$, $endEvent$$) {
  return _.$loadPromise$$module$src$event_helper$$($win$jscomp$182$$).then(function() {
    return _.$getTimingDataSync$$module$src$service$variable_source$$($win$jscomp$182$$, $startEvent$$, $endEvent$$);
  });
};
_.$getTimingDataSync$$module$src$service$variable_source$$ = function($timingInfo_win$jscomp$183$$, $metric_startEvent$jscomp$1$$, $endEvent$jscomp$1$$) {
  if (($timingInfo_win$jscomp$183$$ = $timingInfo_win$jscomp$183$$.performance && $timingInfo_win$jscomp$183$$.performance.timing) && 0 != $timingInfo_win$jscomp$183$$.navigationStart && ($metric_startEvent$jscomp$1$$ = void 0 === $endEvent$jscomp$1$$ ? $timingInfo_win$jscomp$183$$[$metric_startEvent$jscomp$1$$] : $timingInfo_win$jscomp$183$$[$endEvent$jscomp$1$$] - $timingInfo_win$jscomp$183$$[$metric_startEvent$jscomp$1$$], _.$isFiniteNumber$$module$src$types$$($metric_startEvent$jscomp$1$$) && 
  !(0 > $metric_startEvent$jscomp$1$$))) {
    return $metric_startEvent$jscomp$1$$;
  }
};
_.$getNavigationData$$module$src$service$variable_source$$ = function($navigationInfo_win$jscomp$184$$, $attribute$jscomp$1$$) {
  if (($navigationInfo_win$jscomp$184$$ = $navigationInfo_win$jscomp$184$$.performance && $navigationInfo_win$jscomp$184$$.performance.navigation) && void 0 !== $navigationInfo_win$jscomp$184$$[$attribute$jscomp$1$$]) {
    return $navigationInfo_win$jscomp$184$$[$attribute$jscomp$1$$];
  }
};
_.$VariableSource$$module$src$service$variable_source$$ = function($ampdoc$jscomp$60$$) {
  this.ampdoc = $ampdoc$jscomp$60$$;
  this.$D$ = Object.create(null);
  this.$G$ = !1;
  $JSCompiler_StaticMethods_getUrlMacroWhitelist_$$(this);
};
_.$JSCompiler_StaticMethods_setAsync$$ = function($JSCompiler_StaticMethods_setAsync$self$$, $varName$jscomp$2$$, $asyncResolver$$) {
  $JSCompiler_StaticMethods_setAsync$self$$.$D$[$varName$jscomp$2$$] = $JSCompiler_StaticMethods_setAsync$self$$.$D$[$varName$jscomp$2$$] || {sync:void 0, async:void 0};
  $JSCompiler_StaticMethods_setAsync$self$$.$D$[$varName$jscomp$2$$].async = $asyncResolver$$;
};
$JSCompiler_StaticMethods_setBoth$$ = function($JSCompiler_StaticMethods_setBoth$self$$, $varName$jscomp$3$$, $syncResolver$jscomp$1$$, $asyncResolver$jscomp$1$$) {
  _.$JSCompiler_StaticMethods_setAsync$$($JSCompiler_StaticMethods_setBoth$self$$.set($varName$jscomp$3$$, $syncResolver$jscomp$1$$), $varName$jscomp$3$$, $asyncResolver$jscomp$1$$);
};
_.$JSCompiler_StaticMethods_getExpr$$ = function($JSCompiler_StaticMethods_getExpr$self$$, $all_opt_bindings$jscomp$1$$, $opt_whiteList$jscomp$1$$) {
  $JSCompiler_StaticMethods_getExpr$self$$.$G$ || ($JSCompiler_StaticMethods_getExpr$self$$.$I$(), $JSCompiler_StaticMethods_getExpr$self$$.$G$ = !0);
  $all_opt_bindings$jscomp$1$$ = Object.assign({}, $JSCompiler_StaticMethods_getExpr$self$$.$D$, $all_opt_bindings$jscomp$1$$);
  return $JSCompiler_StaticMethods_buildExpr_$$($JSCompiler_StaticMethods_getExpr$self$$, Object.keys($all_opt_bindings$jscomp$1$$), $opt_whiteList$jscomp$1$$);
};
$JSCompiler_StaticMethods_buildExpr_$$ = function($JSCompiler_StaticMethods_buildExpr_$self$$, $keys$jscomp$2_regexStr$$, $opt_whiteList$jscomp$2$$) {
  $JSCompiler_StaticMethods_getUrlMacroWhitelist_$$($JSCompiler_StaticMethods_buildExpr_$self$$) && ($keys$jscomp$2_regexStr$$ = $keys$jscomp$2_regexStr$$.filter(function($keys$jscomp$2_regexStr$$) {
    return $JSCompiler_StaticMethods_getUrlMacroWhitelist_$$($JSCompiler_StaticMethods_buildExpr_$self$$).includes($keys$jscomp$2_regexStr$$);
  }));
  $opt_whiteList$jscomp$2$$ && ($keys$jscomp$2_regexStr$$ = $keys$jscomp$2_regexStr$$.filter(function($JSCompiler_StaticMethods_buildExpr_$self$$) {
    return $opt_whiteList$jscomp$2$$[$JSCompiler_StaticMethods_buildExpr_$self$$];
  }));
  if (0 === $keys$jscomp$2_regexStr$$.length) {
    return /_^/g;
  }
  $keys$jscomp$2_regexStr$$.sort(function($JSCompiler_StaticMethods_buildExpr_$self$$, $keys$jscomp$2_regexStr$$) {
    return $keys$jscomp$2_regexStr$$.length - $JSCompiler_StaticMethods_buildExpr_$self$$.length;
  });
  $keys$jscomp$2_regexStr$$ = "\\$?(" + $keys$jscomp$2_regexStr$$.map(function($JSCompiler_StaticMethods_buildExpr_$self$$) {
    return "$" === $JSCompiler_StaticMethods_buildExpr_$self$$[0] ? "\\" + $JSCompiler_StaticMethods_buildExpr_$self$$ : $JSCompiler_StaticMethods_buildExpr_$self$$;
  }).join("|") + ")";
  return new RegExp($keys$jscomp$2_regexStr$$, "g");
};
$JSCompiler_StaticMethods_getUrlMacroWhitelist_$$ = function($JSCompiler_StaticMethods_getUrlMacroWhitelist_$self$$) {
  if ($JSCompiler_StaticMethods_getUrlMacroWhitelist_$self$$.$J$) {
    return $JSCompiler_StaticMethods_getUrlMacroWhitelist_$self$$.$J$;
  }
  var $head$jscomp$4_meta$jscomp$4$$ = $JSCompiler_StaticMethods_getUrlMacroWhitelist_$self$$.ampdoc.getRootNode().head;
  if (!$head$jscomp$4_meta$jscomp$4$$) {
    return null;
  }
  $head$jscomp$4_meta$jscomp$4$$ = $head$jscomp$4_meta$jscomp$4$$.querySelector('meta[name="amp-allowed-url-macros"]');
  if (!$head$jscomp$4_meta$jscomp$4$$) {
    return null;
  }
  $JSCompiler_StaticMethods_getUrlMacroWhitelist_$self$$.$J$ = $head$jscomp$4_meta$jscomp$4$$.getAttribute("content").split(",").map(function($JSCompiler_StaticMethods_getUrlMacroWhitelist_$self$$) {
    return $JSCompiler_StaticMethods_getUrlMacroWhitelist_$self$$.trim();
  });
  return $JSCompiler_StaticMethods_getUrlMacroWhitelist_$self$$.$J$;
};
$dateMethod$$module$src$service$url_replacements_impl$$ = function($method$jscomp$15$$) {
  return function() {
    return (new Date)[$method$jscomp$15$$]();
  };
};
$screenProperty$$module$src$service$url_replacements_impl$$ = function($screen$jscomp$1$$, $property$jscomp$7$$) {
  return function() {
    return $screen$jscomp$1$$[$property$jscomp$7$$];
  };
};
$GlobalVariableSource$$module$src$service$url_replacements_impl$$ = function($ampdoc$jscomp$61$$) {
  _.$VariableSource$$module$src$service$variable_source$$.call(this, $ampdoc$jscomp$61$$);
  this.$F$ = null;
};
$JSCompiler_StaticMethods_setTimingResolver_$$ = function($JSCompiler_StaticMethods_setTimingResolver_$self$$, $varName$jscomp$4$$, $startEvent$jscomp$2$$, $endEvent$jscomp$2$$) {
  $JSCompiler_StaticMethods_setBoth$$($JSCompiler_StaticMethods_setTimingResolver_$self$$, $varName$jscomp$4$$, function() {
    return _.$getTimingDataSync$$module$src$service$variable_source$$($JSCompiler_StaticMethods_setTimingResolver_$self$$.ampdoc.$win$, $startEvent$jscomp$2$$, $endEvent$jscomp$2$$);
  }, function() {
    return _.$getTimingDataAsync$$module$src$service$variable_source$$($JSCompiler_StaticMethods_setTimingResolver_$self$$.ampdoc.$win$, $startEvent$jscomp$2$$, $endEvent$jscomp$2$$);
  });
};
$JSCompiler_StaticMethods_addReplaceParamsIfMissing_$$ = function($JSCompiler_StaticMethods_addReplaceParamsIfMissing_$self_replaceParams$jscomp$1$$, $orig$$) {
  return ($JSCompiler_StaticMethods_addReplaceParamsIfMissing_$self_replaceParams$jscomp$1$$ = _.$Services$$module$src$services$documentInfoForDoc$$($JSCompiler_StaticMethods_addReplaceParamsIfMissing_$self_replaceParams$jscomp$1$$.ampdoc).$replaceParams$) ? _.$addMissingParamsToUrl$$module$src$url$$($removeAmpJsParamsFromUrl$$module$src$url$$($orig$$), $JSCompiler_StaticMethods_addReplaceParamsIfMissing_$self_replaceParams$jscomp$1$$) : $orig$$;
};
$JSCompiler_StaticMethods_getAccessValue_$$ = function($JSCompiler_StaticMethods_getAccessValue_$self_element$jscomp$150$$, $getter$jscomp$1$$, $expr$jscomp$8$$) {
  $JSCompiler_StaticMethods_getAccessValue_$self_element$jscomp$150$$ = $JSCompiler_StaticMethods_getAccessValue_$self_element$jscomp$150$$.ampdoc.$getHeadNode$();
  return window.Promise.all([_.$getElementServiceIfAvailableForDoc$$module$src$element_service$$($JSCompiler_StaticMethods_getAccessValue_$self_element$jscomp$150$$, "access", "amp-access"), _.$getElementServiceIfAvailableForDoc$$module$src$element_service$$($JSCompiler_StaticMethods_getAccessValue_$self_element$jscomp$150$$, "subscriptions", "amp-subscriptions")]).then(function($JSCompiler_StaticMethods_getAccessValue_$self_element$jscomp$150$$) {
    $JSCompiler_StaticMethods_getAccessValue_$self_element$jscomp$150$$ = $JSCompiler_StaticMethods_getAccessValue_$self_element$jscomp$150$$[0] || $JSCompiler_StaticMethods_getAccessValue_$self_element$jscomp$150$$[1];
    return $JSCompiler_StaticMethods_getAccessValue_$self_element$jscomp$150$$ ? $getter$jscomp$1$$($JSCompiler_StaticMethods_getAccessValue_$self_element$jscomp$150$$) : (_.$user$$module$src$log$$().error("UrlReplacements", "Access or subsciptions service is not installed to access: ", $expr$jscomp$8$$), null);
  });
};
$JSCompiler_StaticMethods_getQueryParamData_$$ = function($JSCompiler_StaticMethods_getQueryParamData_$self_replaceParams$jscomp$2$$, $key$jscomp$65_param$jscomp$9$$, $defaultValue$jscomp$4$$) {
  var $params$jscomp$10_url$jscomp$82$$ = _.$parseUrlDeprecated$$module$src$url$$($removeAmpJsParamsFromUrl$$module$src$url$$($JSCompiler_StaticMethods_getQueryParamData_$self_replaceParams$jscomp$2$$.ampdoc.$win$.location.href));
  $params$jscomp$10_url$jscomp$82$$ = _.$parseQueryString_$$module$src$url_parse_query_string$$($params$jscomp$10_url$jscomp$82$$.search);
  $key$jscomp$65_param$jscomp$9$$ = _.$JSCompiler_StaticMethods_assertString$$(_.$user$$module$src$log$$(), $key$jscomp$65_param$jscomp$9$$);
  $JSCompiler_StaticMethods_getQueryParamData_$self_replaceParams$jscomp$2$$ = _.$Services$$module$src$services$documentInfoForDoc$$($JSCompiler_StaticMethods_getQueryParamData_$self_replaceParams$jscomp$2$$.ampdoc).$replaceParams$;
  return "undefined" !== typeof $params$jscomp$10_url$jscomp$82$$[$key$jscomp$65_param$jscomp$9$$] ? $params$jscomp$10_url$jscomp$82$$[$key$jscomp$65_param$jscomp$9$$] : $JSCompiler_StaticMethods_getQueryParamData_$self_replaceParams$jscomp$2$$ && "undefined" !== typeof $JSCompiler_StaticMethods_getQueryParamData_$self_replaceParams$jscomp$2$$[$key$jscomp$65_param$jscomp$9$$] ? $JSCompiler_StaticMethods_getQueryParamData_$self_replaceParams$jscomp$2$$[$key$jscomp$65_param$jscomp$9$$] : $defaultValue$jscomp$4$$;
};
$JSCompiler_StaticMethods_getVariantsValue_$$ = function($JSCompiler_StaticMethods_getVariantsValue_$self$$, $getter$jscomp$2$$) {
  return _.$getElementServiceIfAvailableForDoc$$module$src$element_service$$($JSCompiler_StaticMethods_getVariantsValue_$self$$.ampdoc.$getHeadNode$(), "variant", "amp-experiment", !0).then(function($JSCompiler_StaticMethods_getVariantsValue_$self$$) {
    return $JSCompiler_StaticMethods_getVariantsValue_$self$$.$D$.$promise$;
  }).then(function($JSCompiler_StaticMethods_getVariantsValue_$self$$) {
    return $getter$jscomp$2$$($JSCompiler_StaticMethods_getVariantsValue_$self$$);
  });
};
$JSCompiler_StaticMethods_getGeo_$$ = function($JSCompiler_StaticMethods_getGeo_$self$$, $getter$jscomp$3$$) {
  return _.$Services$$module$src$services$geoForDocOrNull$$($JSCompiler_StaticMethods_getGeo_$self$$.ampdoc.$getHeadNode$()).then(function($JSCompiler_StaticMethods_getGeo_$self$$) {
    return $getter$jscomp$3$$($JSCompiler_StaticMethods_getGeo_$self$$);
  });
};
$JSCompiler_StaticMethods_getShareTrackingValue_$$ = function($JSCompiler_StaticMethods_getShareTrackingValue_$self$$, $getter$jscomp$4$$) {
  $JSCompiler_StaticMethods_getShareTrackingValue_$self$$.$F$ || ($JSCompiler_StaticMethods_getShareTrackingValue_$self$$.$F$ = _.$getElementServiceIfAvailable$$module$src$element_service$$($JSCompiler_StaticMethods_getShareTrackingValue_$self$$.ampdoc.$win$, "share-tracking", "amp-share-tracking", !0));
  return $JSCompiler_StaticMethods_getShareTrackingValue_$self$$.$F$.then(function($JSCompiler_StaticMethods_getShareTrackingValue_$self$$) {
    return $getter$jscomp$4$$($JSCompiler_StaticMethods_getShareTrackingValue_$self$$);
  });
};
$JSCompiler_StaticMethods_getStoryValue_$$ = function($JSCompiler_StaticMethods_getStoryValue_$self$$, $property$jscomp$9$$) {
  return function() {
    return _.$Services$$module$src$services$storyVariableServiceForOrNull$$($JSCompiler_StaticMethods_getStoryValue_$self$$.ampdoc.$win$).then(function($JSCompiler_StaticMethods_getStoryValue_$self$$) {
      return $JSCompiler_StaticMethods_getStoryValue_$self$$[$property$jscomp$9$$];
    });
  };
};
$JSCompiler_StaticMethods_getViewerIntegrationValue_$$ = function($JSCompiler_StaticMethods_getViewerIntegrationValue_$self$$, $property$jscomp$10$$) {
  return function($param$jscomp$10$$, $defaultValue$jscomp$5$$) {
    $defaultValue$jscomp$5$$ = void 0 === $defaultValue$jscomp$5$$ ? "" : $defaultValue$jscomp$5$$;
    return _.$getElementServiceIfAvailable$$module$src$element_service$$($JSCompiler_StaticMethods_getViewerIntegrationValue_$self$$.ampdoc.$win$, "viewer-integration-variable", "amp-viewer-integration", !0).then(function($JSCompiler_StaticMethods_getViewerIntegrationValue_$self$$) {
      return $JSCompiler_StaticMethods_getViewerIntegrationValue_$self$$[$property$jscomp$10$$]($param$jscomp$10$$, $defaultValue$jscomp$5$$);
    });
  };
};
_.$UrlReplacements$$module$src$service$url_replacements_impl$$ = function($ampdoc$jscomp$62$$, $variableSource$jscomp$1$$) {
  this.ampdoc = $ampdoc$jscomp$62$$;
  this.$D$ = $variableSource$jscomp$1$$;
};
_.$JSCompiler_StaticMethods_expandUrlSync$$ = function($JSCompiler_StaticMethods_expandUrlSync$self$$, $url$jscomp$83$$, $opt_bindings$jscomp$4$$, $opt_collectVars$jscomp$2$$, $opt_whiteList$jscomp$5$$) {
  return $JSCompiler_StaticMethods_ensureProtocolMatches_$$($url$jscomp$83$$, (new _.$Expander$$module$src$service$url_expander$expander$$($JSCompiler_StaticMethods_expandUrlSync$self$$.$D$, $opt_bindings$jscomp$4$$, $opt_collectVars$jscomp$2$$, !0, $opt_whiteList$jscomp$5$$)).expand($url$jscomp$83$$));
};
_.$JSCompiler_StaticMethods_expandUrlAsync$$ = function($JSCompiler_StaticMethods_expandUrlAsync$self$$, $url$jscomp$84$$, $opt_bindings$jscomp$5$$, $opt_whiteList$jscomp$6$$) {
  return (new _.$Expander$$module$src$service$url_expander$expander$$($JSCompiler_StaticMethods_expandUrlAsync$self$$.$D$, $opt_bindings$jscomp$5$$, void 0, void 0, $opt_whiteList$jscomp$6$$)).expand($url$jscomp$84$$).then(function($JSCompiler_StaticMethods_expandUrlAsync$self$$) {
    return $JSCompiler_StaticMethods_ensureProtocolMatches_$$($url$jscomp$84$$, $JSCompiler_StaticMethods_expandUrlAsync$self$$);
  });
};
_.$JSCompiler_StaticMethods_getWhitelistForElement_$$ = function($element$jscomp$155_whitelist$jscomp$3$$, $opt_supportedReplacement$$) {
  if ($element$jscomp$155_whitelist$jscomp$3$$ = $element$jscomp$155_whitelist$jscomp$3$$.getAttribute("data-amp-replace")) {
    var $requestedReplacements$$ = {};
    $element$jscomp$155_whitelist$jscomp$3$$.trim().split(/\s+/).forEach(function($element$jscomp$155_whitelist$jscomp$3$$) {
      !$opt_supportedReplacement$$ || _.$hasOwn$$module$src$utils$object$$($opt_supportedReplacement$$, $element$jscomp$155_whitelist$jscomp$3$$) ? $requestedReplacements$$[$element$jscomp$155_whitelist$jscomp$3$$] = !0 : _.$user$$module$src$log$$().$Log$$module$src$log_prototype$warn$("URL", "Ignoring unsupported replacement", $element$jscomp$155_whitelist$jscomp$3$$);
    });
    return $requestedReplacements$$;
  }
};
$JSCompiler_StaticMethods_ensureProtocolMatches_$$ = function($url$jscomp$89$$, $replacement$jscomp$3$$) {
  var $newProtocol$$ = _.$parseUrlDeprecated$$module$src$url$$($replacement$jscomp$3$$, !0).protocol, $oldProtocol$$ = _.$parseUrlDeprecated$$module$src$url$$($url$jscomp$89$$, !0).protocol;
  return $newProtocol$$ != $oldProtocol$$ ? (_.$user$$module$src$log$$().error("UrlReplacements", "Illegal replacement of the protocol: ", $url$jscomp$89$$), $url$jscomp$89$$) : $replacement$jscomp$3$$;
};
$installUrlReplacementsServiceForDoc$$module$src$service$url_replacements_impl$$ = function($ampdoc$jscomp$63$$) {
  _.$registerServiceBuilderForDoc$$module$src$service$$($ampdoc$jscomp$63$$, "url-replace", function($ampdoc$jscomp$63$$) {
    return new _.$UrlReplacements$$module$src$service$url_replacements_impl$$($ampdoc$jscomp$63$$, new $GlobalVariableSource$$module$src$service$url_replacements_impl$$($ampdoc$jscomp$63$$));
  });
};
$Viewer$$module$src$service$viewer_impl$$ = function($ampdoc$jscomp$65_deferred$jscomp$18$$, $messagingDeferred_newUrl$jscomp$1_opt_initParams$$) {
  var $$jscomp$this$jscomp$121$$ = this;
  this.ampdoc = $ampdoc$jscomp$65_deferred$jscomp$18$$;
  this.$win$ = $ampdoc$jscomp$65_deferred$jscomp$18$$.$win$;
  this.$fa$ = _.$isIframed$$module$src$dom$$(this.$win$);
  this.$ma$ = _.$Services$$module$src$services$documentStateFor$$(this.$win$);
  this.$O$ = !0;
  this.$ea$ = !1;
  this.$va$ = this.$G$ = "visible";
  this.$P$ = 1;
  this.$ia$ = _.$map$$module$src$utils$object$$();
  this.$qa$ = _.$map$$module$src$utils$object$$();
  this.$sa$ = new _.$Observable$$module$src$observable$$;
  this.$na$ = new _.$Observable$$module$src$observable$$;
  this.$oa$ = new _.$Observable$$module$src$observable$$;
  this.$messagingOrigin_$ = this.$J$ = null;
  this.$K$ = [];
  this.$params_$ = {};
  this.$U$ = {};
  this.$ga$ = this.$Y$ = this.$ba$ = this.$aa$ = null;
  $ampdoc$jscomp$65_deferred$jscomp$18$$ = new _.$Deferred$$module$src$utils$promise$$;
  this.$D$ = $ampdoc$jscomp$65_deferred$jscomp$18$$.$promise$;
  this.$ya$ = $ampdoc$jscomp$65_deferred$jscomp$18$$.resolve;
  $messagingDeferred_newUrl$jscomp$1_opt_initParams$$ ? Object.assign(this.$params_$, $messagingDeferred_newUrl$jscomp$1_opt_initParams$$) : (this.$win$.name && 0 == this.$win$.name.indexOf("__AMP__") && $parseParams_$$module$src$service$viewer_impl$$(this.$win$.name.substring(7), this.$params_$), this.$win$.location.hash && ($parseParams_$$module$src$service$viewer_impl$$(this.$win$.location.hash, this.$U$), Object.assign(this.$params_$, this.$U$)));
  "Viewer";
  this.$O$ = !(0,window.parseInt)(this.$params_$.off, 10);
  "Viewer";
  this.$ea$ = !(!(0,window.parseInt)(this.$params_$.history, 10) && !this.$ea$);
  "Viewer";
  $JSCompiler_StaticMethods_setVisibilityState_$$(this, this.$params_$.visibilityState);
  "Viewer";
  this.$P$ = (0,window.parseInt)(this.$params_$.prerenderSize, 10) || this.$P$;
  "Viewer";
  this.$V$ = null;
  this.$wa$ = _.$isProxyOrigin$$module$src$url$$(_.$parseUrlDeprecated$$module$src$url$$(this.ampdoc.$win$.location.href));
  this.$R$ = _.$JSCompiler_StaticMethods_Viewer$$module$src$service$viewer_impl_prototype$isVisible$$(this);
  _.$JSCompiler_StaticMethods_DocumentState$$module$src$service$document_state_prototype$onVisibilityChanged$$(this.$ma$, this.$ra$.bind(this));
  $messagingDeferred_newUrl$jscomp$1_opt_initParams$$ = new _.$Deferred$$module$src$utils$promise$$;
  this.$xa$ = $messagingDeferred_newUrl$jscomp$1_opt_initParams$$.resolve;
  this.$F$ = $JSCompiler_StaticMethods_initMessagingChannel_$$(this, $messagingDeferred_newUrl$jscomp$1_opt_initParams$$.$promise$);
  this.$la$ = this.$ha$ = null;
  this.$W$ = this.$F$ && "referrer" in this.$params_$ && !1 !== $JSCompiler_StaticMethods_isTrustedAncestorOrigins_$$(this) ? this.$params_$.referrer : this.$win$.document.referrer;
  this.$I$ = new window.Promise(function($ampdoc$jscomp$65_deferred$jscomp$18$$) {
    $$jscomp$this$jscomp$121$$.$F$ && "referrer" in $$jscomp$this$jscomp$121$$.$params_$ ? $JSCompiler_StaticMethods_isTrustedViewer$$($$jscomp$this$jscomp$121$$).then(function($messagingDeferred_newUrl$jscomp$1_opt_initParams$$) {
      $messagingDeferred_newUrl$jscomp$1_opt_initParams$$ ? $ampdoc$jscomp$65_deferred$jscomp$18$$($$jscomp$this$jscomp$121$$.$params_$.referrer) : ($ampdoc$jscomp$65_deferred$jscomp$18$$($$jscomp$this$jscomp$121$$.$win$.document.referrer), $$jscomp$this$jscomp$121$$.$W$ != $$jscomp$this$jscomp$121$$.$win$.document.referrer && (_.$dev$$module$src$log$$().$expectedError$("Viewer", "Untrusted viewer referrer override: " + $$jscomp$this$jscomp$121$$.$W$ + " at " + $$jscomp$this$jscomp$121$$.$messagingOrigin_$), 
      $$jscomp$this$jscomp$121$$.$W$ = $$jscomp$this$jscomp$121$$.$win$.document.referrer));
    }) : $ampdoc$jscomp$65_deferred$jscomp$18$$($$jscomp$this$jscomp$121$$.$win$.document.referrer);
  });
  this.$resolvedViewerUrl_$ = _.$removeFragment$$module$src$url$$(this.$win$.location.href || "");
  new window.Promise(function($ampdoc$jscomp$65_deferred$jscomp$18$$) {
    var $messagingDeferred_newUrl$jscomp$1_opt_initParams$$ = $$jscomp$this$jscomp$121$$.$params_$.viewerUrl;
    $$jscomp$this$jscomp$121$$.$F$ && $messagingDeferred_newUrl$jscomp$1_opt_initParams$$ ? $JSCompiler_StaticMethods_isTrustedViewer$$($$jscomp$this$jscomp$121$$).then(function($resolve$jscomp$37$$) {
      $resolve$jscomp$37$$ ? $$jscomp$this$jscomp$121$$.$resolvedViewerUrl_$ = $messagingDeferred_newUrl$jscomp$1_opt_initParams$$ : _.$dev$$module$src$log$$().$expectedError$("Viewer", "Untrusted viewer url override: " + $messagingDeferred_newUrl$jscomp$1_opt_initParams$$ + " at " + $$jscomp$this$jscomp$121$$.$messagingOrigin_$);
      $ampdoc$jscomp$65_deferred$jscomp$18$$($$jscomp$this$jscomp$121$$.$resolvedViewerUrl_$);
    }) : $ampdoc$jscomp$65_deferred$jscomp$18$$($$jscomp$this$jscomp$121$$.$resolvedViewerUrl_$);
  });
  this.$params_$.click && ($messagingDeferred_newUrl$jscomp$1_opt_initParams$$ = _.$removeFragment$$module$src$url$$(this.$win$.location.href), $messagingDeferred_newUrl$jscomp$1_opt_initParams$$ != this.$win$.location.href && this.$win$.history.replaceState && (this.$win$.location.$D$ || (this.$win$.location.$D$ = this.$win$.location.hash), this.$win$.history.replaceState({}, "", $messagingDeferred_newUrl$jscomp$1_opt_initParams$$), delete this.$U$.click, "Viewer"));
  this.$ra$();
  $JSCompiler_StaticMethods_onVisibilityChange_$$(this);
  this.$D$.then(function() {
    $JSCompiler_StaticMethods_maybeUpdateFragmentForCct$$($$jscomp$this$jscomp$121$$);
  });
};
$JSCompiler_StaticMethods_initMessagingChannel_$$ = function($JSCompiler_StaticMethods_initMessagingChannel_$self$$, $messagingPromise$$) {
  return $JSCompiler_StaticMethods_initMessagingChannel_$self$$.$fa$ && !$JSCompiler_StaticMethods_initMessagingChannel_$self$$.$win$.AMP_TEST_IFRAME && ($JSCompiler_StaticMethods_initMessagingChannel_$self$$.$params_$.origin || $JSCompiler_StaticMethods_initMessagingChannel_$self$$.$params_$.visibilityState || -1 != $JSCompiler_StaticMethods_initMessagingChannel_$self$$.$win$.location.search.indexOf("amp_js_v")) || _.$JSCompiler_StaticMethods_isWebviewEmbedded$$($JSCompiler_StaticMethods_initMessagingChannel_$self$$) || 
  $JSCompiler_StaticMethods_isCctEmbedded$$($JSCompiler_StaticMethods_initMessagingChannel_$self$$) || !$JSCompiler_StaticMethods_initMessagingChannel_$self$$.ampdoc.$isSingleDoc$() ? _.$JSCompiler_StaticMethods_timeoutPromise$$(_.$Services$$module$src$services$timerFor$$($JSCompiler_StaticMethods_initMessagingChannel_$self$$.$win$), 20000, $messagingPromise$$).catch(function($JSCompiler_StaticMethods_initMessagingChannel_$self$$) {
    $JSCompiler_StaticMethods_initMessagingChannel_$self$$ = $getChannelError$$module$src$service$viewer_impl$$($JSCompiler_StaticMethods_initMessagingChannel_$self$$);
    _.$reportError$$module$src$error$$($JSCompiler_StaticMethods_initMessagingChannel_$self$$);
    throw $JSCompiler_StaticMethods_initMessagingChannel_$self$$;
  }) : null;
};
$JSCompiler_StaticMethods_onVisibilityChange_$$ = function($JSCompiler_StaticMethods_onVisibilityChange_$self$$) {
  if (_.$JSCompiler_StaticMethods_Viewer$$module$src$service$viewer_impl_prototype$isVisible$$($JSCompiler_StaticMethods_onVisibilityChange_$self$$)) {
    var $now$jscomp$10$$ = Date.now();
    $JSCompiler_StaticMethods_onVisibilityChange_$self$$.$Y$ || ($JSCompiler_StaticMethods_onVisibilityChange_$self$$.$Y$ = $now$jscomp$10$$);
    $JSCompiler_StaticMethods_onVisibilityChange_$self$$.$ga$ = $now$jscomp$10$$;
    $JSCompiler_StaticMethods_onVisibilityChange_$self$$.$R$ = !0;
    $JSCompiler_StaticMethods_onVisibilityChange_$self$$.$ya$();
    $JSCompiler_StaticMethods_onVisibilityChange_$self$$.$ba$ && ($JSCompiler_StaticMethods_onVisibilityChange_$self$$.$ba$(), $JSCompiler_StaticMethods_onVisibilityChange_$self$$.$ba$ = null, $JSCompiler_StaticMethods_onVisibilityChange_$self$$.$aa$ = null);
  }
  $JSCompiler_StaticMethods_onVisibilityChange_$self$$.$na$.$fire$();
};
_.$JSCompiler_StaticMethods_getParam$$ = function($JSCompiler_StaticMethods_getParam$self$$, $name$jscomp$149$$) {
  return $JSCompiler_StaticMethods_getParam$self$$.$params_$[$name$jscomp$149$$];
};
_.$JSCompiler_StaticMethods_hasCapability$$ = function($JSCompiler_StaticMethods_hasCapability$self_capabilities$$, $name$jscomp$150$$) {
  return ($JSCompiler_StaticMethods_hasCapability$self_capabilities$$ = $JSCompiler_StaticMethods_hasCapability$self_capabilities$$.$params_$.cap) ? -1 != $JSCompiler_StaticMethods_hasCapability$self_capabilities$$.split(",").indexOf($name$jscomp$150$$) : !1;
};
_.$JSCompiler_StaticMethods_isWebviewEmbedded$$ = function($JSCompiler_StaticMethods_isWebviewEmbedded$self$$) {
  return !$JSCompiler_StaticMethods_isWebviewEmbedded$self$$.$fa$ && "1" == $JSCompiler_StaticMethods_isWebviewEmbedded$self$$.$params_$.webview;
};
$JSCompiler_StaticMethods_isCctEmbedded$$ = function($JSCompiler_StaticMethods_isCctEmbedded$self$$) {
  if (null != $JSCompiler_StaticMethods_isCctEmbedded$self$$.$V$) {
    return $JSCompiler_StaticMethods_isCctEmbedded$self$$.$V$;
  }
  $JSCompiler_StaticMethods_isCctEmbedded$self$$.$V$ = !1;
  if (!$JSCompiler_StaticMethods_isCctEmbedded$self$$.$fa$) {
    var $queryParams$$ = _.$parseQueryString_$$module$src$url_parse_query_string$$($JSCompiler_StaticMethods_isCctEmbedded$self$$.$win$.location.search);
    $JSCompiler_StaticMethods_isCctEmbedded$self$$.$V$ = "1" === $queryParams$$.amp_gsa && _.$startsWith$$module$src$string$$($queryParams$$.amp_js_v || "", "a");
  }
  return $JSCompiler_StaticMethods_isCctEmbedded$self$$.$V$;
};
$JSCompiler_StaticMethods_maybeUpdateFragmentForCct$$ = function($JSCompiler_StaticMethods_maybeUpdateFragmentForCct$self$$) {
  if ($JSCompiler_StaticMethods_isCctEmbedded$$($JSCompiler_StaticMethods_maybeUpdateFragmentForCct$self$$) && $JSCompiler_StaticMethods_maybeUpdateFragmentForCct$self$$.$win$.history.replaceState) {
    var $sourceOrigin$jscomp$2$$ = _.$getSourceOrigin$$module$src$url$$($JSCompiler_StaticMethods_maybeUpdateFragmentForCct$self$$.$win$.location.href), $canonicalUrl$jscomp$3$$ = _.$Services$$module$src$services$documentInfoForDoc$$($JSCompiler_StaticMethods_maybeUpdateFragmentForCct$self$$.ampdoc).canonicalUrl, $canonicalSourceOrigin$$ = _.$getSourceOrigin$$module$src$url$$($canonicalUrl$jscomp$3$$);
    $JSCompiler_StaticMethods_hasRoughlySameOrigin_$$($sourceOrigin$jscomp$2$$, $canonicalSourceOrigin$$) && ($JSCompiler_StaticMethods_maybeUpdateFragmentForCct$self$$.$U$.ampshare = $canonicalUrl$jscomp$3$$, $JSCompiler_StaticMethods_maybeUpdateFragmentForCct$self$$.$win$.history.replaceState({}, "", "#" + _.$serializeQueryString$$module$src$url$$($JSCompiler_StaticMethods_maybeUpdateFragmentForCct$self$$.$U$)));
  }
};
$JSCompiler_StaticMethods_hasRoughlySameOrigin_$$ = function($first$jscomp$5$$, $second$jscomp$2$$) {
  function $trimOrigin$$($first$jscomp$5$$) {
    return 2 < $first$jscomp$5$$.split(".").length ? $first$jscomp$5$$.replace($TRIM_ORIGIN_PATTERN_$$module$src$service$viewer_impl$$, "$1") : $first$jscomp$5$$;
  }
  return $trimOrigin$$($first$jscomp$5$$) == $trimOrigin$$($second$jscomp$2$$);
};
$JSCompiler_StaticMethods_onRuntimeState$$ = function($JSCompiler_StaticMethods_onRuntimeState$self$$, $handler$jscomp$22$$) {
  $JSCompiler_StaticMethods_onRuntimeState$self$$.$sa$.add($handler$jscomp$22$$);
};
$JSCompiler_StaticMethods_setVisibilityState_$$ = function($JSCompiler_StaticMethods_setVisibilityState_$self$$, $state$jscomp$26$$) {
  if ($state$jscomp$26$$) {
    var $oldState$jscomp$3$$ = $JSCompiler_StaticMethods_setVisibilityState_$self$$.$G$;
    $state$jscomp$26$$ = _.$JSCompiler_StaticMethods_assertEnumValue$$(_.$dev$$module$src$log$$(), $VisibilityState$$module$src$visibility_state$$, $state$jscomp$26$$, "VisibilityState");
    "hidden" === $state$jscomp$26$$ && ($state$jscomp$26$$ = $JSCompiler_StaticMethods_setVisibilityState_$self$$.$R$ ? "inactive" : "prerender");
    $JSCompiler_StaticMethods_setVisibilityState_$self$$.$va$ = $state$jscomp$26$$;
    !_.$JSCompiler_StaticMethods_isHidden$$($JSCompiler_StaticMethods_setVisibilityState_$self$$.$ma$) || "visible" !== $state$jscomp$26$$ && "paused" !== $state$jscomp$26$$ || ($state$jscomp$26$$ = "hidden");
    $JSCompiler_StaticMethods_setVisibilityState_$self$$.$G$ = $state$jscomp$26$$;
    "Viewer";
    $oldState$jscomp$3$$ !== $state$jscomp$26$$ && $JSCompiler_StaticMethods_onVisibilityChange_$$($JSCompiler_StaticMethods_setVisibilityState_$self$$);
  }
};
_.$JSCompiler_StaticMethods_Viewer$$module$src$service$viewer_impl_prototype$isVisible$$ = function($JSCompiler_StaticMethods_Viewer$$module$src$service$viewer_impl_prototype$isVisible$self$$) {
  return "visible" == $JSCompiler_StaticMethods_Viewer$$module$src$service$viewer_impl_prototype$isVisible$self$$.$G$;
};
$JSCompiler_StaticMethods_isTrustedViewer$$ = function($JSCompiler_StaticMethods_isTrustedViewer$self$$) {
  if (!$JSCompiler_StaticMethods_isTrustedViewer$self$$.$ha$) {
    var $isTrustedAncestorOrigins$$ = $JSCompiler_StaticMethods_isTrustedAncestorOrigins_$$($JSCompiler_StaticMethods_isTrustedViewer$self$$);
    $JSCompiler_StaticMethods_isTrustedViewer$self$$.$ha$ = void 0 !== $isTrustedAncestorOrigins$$ ? window.Promise.resolve($isTrustedAncestorOrigins$$) : $JSCompiler_StaticMethods_isTrustedViewer$self$$.$F$.then(function($JSCompiler_StaticMethods_isTrustedViewer$self$$) {
      return $JSCompiler_StaticMethods_isTrustedViewer$self$$ ? $JSCompiler_StaticMethods_isTrustedViewerOrigin_$$($JSCompiler_StaticMethods_isTrustedViewer$self$$) : !1;
    });
  }
  return $JSCompiler_StaticMethods_isTrustedViewer$self$$.$ha$;
};
$JSCompiler_StaticMethods_isTrustedAncestorOrigins_$$ = function($JSCompiler_StaticMethods_isTrustedAncestorOrigins_$self$$) {
  if (!$JSCompiler_StaticMethods_isTrustedAncestorOrigins_$self$$.$F$) {
    return !1;
  }
  if ($JSCompiler_StaticMethods_isTrustedAncestorOrigins_$self$$.$win$.location.ancestorOrigins && !_.$JSCompiler_StaticMethods_isWebviewEmbedded$$($JSCompiler_StaticMethods_isTrustedAncestorOrigins_$self$$) && !$JSCompiler_StaticMethods_isCctEmbedded$$($JSCompiler_StaticMethods_isTrustedAncestorOrigins_$self$$)) {
    return 0 < $JSCompiler_StaticMethods_isTrustedAncestorOrigins_$self$$.$win$.location.ancestorOrigins.length && $JSCompiler_StaticMethods_isTrustedViewerOrigin_$$($JSCompiler_StaticMethods_isTrustedAncestorOrigins_$self$$.$win$.location.ancestorOrigins[0]);
  }
};
_.$JSCompiler_StaticMethods_getViewerOrigin$$ = function($JSCompiler_StaticMethods_getViewerOrigin$self$$) {
  if (!$JSCompiler_StaticMethods_getViewerOrigin$self$$.$la$) {
    var $origin$jscomp$15$$;
    $JSCompiler_StaticMethods_getViewerOrigin$self$$.$F$ ? $JSCompiler_StaticMethods_getViewerOrigin$self$$.$win$.location.ancestorOrigins && 0 < $JSCompiler_StaticMethods_getViewerOrigin$self$$.$win$.location.ancestorOrigins.length && ($origin$jscomp$15$$ = $JSCompiler_StaticMethods_getViewerOrigin$self$$.$win$.location.ancestorOrigins[0]) : $origin$jscomp$15$$ = "";
    $JSCompiler_StaticMethods_getViewerOrigin$self$$.$la$ = void 0 !== $origin$jscomp$15$$ ? window.Promise.resolve($origin$jscomp$15$$) : _.$JSCompiler_StaticMethods_timeoutPromise$$(_.$Services$$module$src$services$timerFor$$($JSCompiler_StaticMethods_getViewerOrigin$self$$.$win$), 1000, $JSCompiler_StaticMethods_getViewerOrigin$self$$.$F$).catch(function() {
      return "";
    });
  }
  return $JSCompiler_StaticMethods_getViewerOrigin$self$$.$la$;
};
$JSCompiler_StaticMethods_isTrustedViewerOrigin_$$ = function($protocol$jscomp$2_urlString$jscomp$5$$) {
  var $url$jscomp$90$$ = _.$parseUrlDeprecated$$module$src$url$$($protocol$jscomp$2_urlString$jscomp$5$$);
  $protocol$jscomp$2_urlString$jscomp$5$$ = $url$jscomp$90$$.protocol;
  return "x-thread:" == $protocol$jscomp$2_urlString$jscomp$5$$ ? !0 : "https:" != $protocol$jscomp$2_urlString$jscomp$5$$ ? !1 : $TRUSTED_VIEWER_HOSTS$$module$src$service$viewer_impl$$.some(function($protocol$jscomp$2_urlString$jscomp$5$$) {
    return $protocol$jscomp$2_urlString$jscomp$5$$.test($url$jscomp$90$$.hostname);
  });
};
_.$JSCompiler_StaticMethods_Viewer$$module$src$service$viewer_impl_prototype$onVisibilityChanged$$ = function($JSCompiler_StaticMethods_Viewer$$module$src$service$viewer_impl_prototype$onVisibilityChanged$self$$, $handler$jscomp$23$$) {
  return $JSCompiler_StaticMethods_Viewer$$module$src$service$viewer_impl_prototype$onVisibilityChanged$self$$.$na$.add($handler$jscomp$23$$);
};
_.$JSCompiler_StaticMethods_setMessageDeliverer$$ = function($JSCompiler_StaticMethods_setMessageDeliverer$self$$, $deliverer_queue$jscomp$6$$, $origin$jscomp$16$$) {
  if ($JSCompiler_StaticMethods_setMessageDeliverer$self$$.$J$) {
    throw Error("message channel can only be initialized once");
  }
  if (null == $origin$jscomp$16$$) {
    throw Error("message channel must have an origin");
  }
  "Viewer";
  $JSCompiler_StaticMethods_setMessageDeliverer$self$$.$J$ = $deliverer_queue$jscomp$6$$;
  $JSCompiler_StaticMethods_setMessageDeliverer$self$$.$messagingOrigin_$ = $origin$jscomp$16$$;
  $JSCompiler_StaticMethods_setMessageDeliverer$self$$.$xa$($origin$jscomp$16$$);
  0 < $JSCompiler_StaticMethods_setMessageDeliverer$self$$.$K$.length && ($deliverer_queue$jscomp$6$$ = $JSCompiler_StaticMethods_setMessageDeliverer$self$$.$K$.slice(0), $JSCompiler_StaticMethods_setMessageDeliverer$self$$.$K$ = [], $deliverer_queue$jscomp$6$$.forEach(function($deliverer_queue$jscomp$6$$) {
    var $origin$jscomp$16$$ = $JSCompiler_StaticMethods_setMessageDeliverer$self$$.$J$($deliverer_queue$jscomp$6$$.$eventType$, $deliverer_queue$jscomp$6$$.data, $deliverer_queue$jscomp$6$$.$awaitResponse$);
    $deliverer_queue$jscomp$6$$.$awaitResponse$ && $deliverer_queue$jscomp$6$$.$responseResolver$($origin$jscomp$16$$);
  }));
};
_.$JSCompiler_StaticMethods_Viewer$$module$src$service$viewer_impl_prototype$sendMessage$$ = function($JSCompiler_StaticMethods_Viewer$$module$src$service$viewer_impl_prototype$sendMessage$self$$, $eventType$jscomp$14$$, $data$jscomp$60$$, $cancelUnsent$$) {
  $JSCompiler_StaticMethods_sendMessageInternal_$$($JSCompiler_StaticMethods_Viewer$$module$src$service$viewer_impl_prototype$sendMessage$self$$, $eventType$jscomp$14$$, $data$jscomp$60$$, void 0 === $cancelUnsent$$ ? !1 : $cancelUnsent$$, !1);
};
_.$JSCompiler_StaticMethods_sendMessageAwaitResponse$$ = function($JSCompiler_StaticMethods_sendMessageAwaitResponse$self$$, $eventType$jscomp$15$$, $data$jscomp$61$$, $cancelUnsent$jscomp$1$$) {
  return $JSCompiler_StaticMethods_sendMessageInternal_$$($JSCompiler_StaticMethods_sendMessageAwaitResponse$self$$, $eventType$jscomp$15$$, $data$jscomp$61$$, void 0 === $cancelUnsent$jscomp$1$$ ? !1 : $cancelUnsent$jscomp$1$$, !0);
};
$JSCompiler_StaticMethods_sendMessageInternal_$$ = function($JSCompiler_StaticMethods_sendMessageInternal_$self$$, $eventType$jscomp$16$$, $data$jscomp$62$$, $$jscomp$destructuring$var102_cancelUnsent$jscomp$2_found$jscomp$1_message$jscomp$42$$, $awaitResponse$$) {
  if ($JSCompiler_StaticMethods_sendMessageInternal_$self$$.$J$) {
    return _.$tryResolve$$module$src$utils$promise$$(function() {
      return $JSCompiler_StaticMethods_sendMessageInternal_$self$$.$J$($eventType$jscomp$16$$, $data$jscomp$62$$, $awaitResponse$$);
    });
  }
  if (!$JSCompiler_StaticMethods_sendMessageInternal_$self$$.$F$) {
    return $awaitResponse$$ ? window.Promise.reject($getChannelError$$module$src$service$viewer_impl$$()) : window.Promise.resolve();
  }
  if (!$$jscomp$destructuring$var102_cancelUnsent$jscomp$2_found$jscomp$1_message$jscomp$42$$) {
    return $JSCompiler_StaticMethods_sendMessageInternal_$self$$.$F$.then(function() {
      return $JSCompiler_StaticMethods_sendMessageInternal_$self$$.$J$($eventType$jscomp$16$$, $data$jscomp$62$$, $awaitResponse$$);
    });
  }
  $$jscomp$destructuring$var102_cancelUnsent$jscomp$2_found$jscomp$1_message$jscomp$42$$ = _.$findIndex$$module$src$utils$array$$($JSCompiler_StaticMethods_sendMessageInternal_$self$$.$K$, function($JSCompiler_StaticMethods_sendMessageInternal_$self$$) {
    return $JSCompiler_StaticMethods_sendMessageInternal_$self$$.$eventType$ == $eventType$jscomp$16$$;
  });
  -1 != $$jscomp$destructuring$var102_cancelUnsent$jscomp$2_found$jscomp$1_message$jscomp$42$$ ? ($$jscomp$destructuring$var102_cancelUnsent$jscomp$2_found$jscomp$1_message$jscomp$42$$ = $JSCompiler_StaticMethods_sendMessageInternal_$self$$.$K$.splice($$jscomp$destructuring$var102_cancelUnsent$jscomp$2_found$jscomp$1_message$jscomp$42$$, 1)[0], $$jscomp$destructuring$var102_cancelUnsent$jscomp$2_found$jscomp$1_message$jscomp$42$$.data = $data$jscomp$62$$, $$jscomp$destructuring$var102_cancelUnsent$jscomp$2_found$jscomp$1_message$jscomp$42$$.$awaitResponse$ = 
  $$jscomp$destructuring$var102_cancelUnsent$jscomp$2_found$jscomp$1_message$jscomp$42$$.$awaitResponse$ || $awaitResponse$$) : ($$jscomp$destructuring$var102_cancelUnsent$jscomp$2_found$jscomp$1_message$jscomp$42$$ = new _.$Deferred$$module$src$utils$promise$$, $$jscomp$destructuring$var102_cancelUnsent$jscomp$2_found$jscomp$1_message$jscomp$42$$ = {$eventType$:$eventType$jscomp$16$$, data:$data$jscomp$62$$, $awaitResponse$:$awaitResponse$$, $responsePromise$:$$jscomp$destructuring$var102_cancelUnsent$jscomp$2_found$jscomp$1_message$jscomp$42$$.$promise$, 
  $responseResolver$:$$jscomp$destructuring$var102_cancelUnsent$jscomp$2_found$jscomp$1_message$jscomp$42$$.resolve});
  $JSCompiler_StaticMethods_sendMessageInternal_$self$$.$K$.push($$jscomp$destructuring$var102_cancelUnsent$jscomp$2_found$jscomp$1_message$jscomp$42$$);
  return $$jscomp$destructuring$var102_cancelUnsent$jscomp$2_found$jscomp$1_message$jscomp$42$$.$responsePromise$;
};
_.$JSCompiler_StaticMethods_broadcast$$ = function($JSCompiler_StaticMethods_broadcast$self$$, $message$jscomp$43$$) {
  $JSCompiler_StaticMethods_broadcast$self$$.$F$ ? $JSCompiler_StaticMethods_sendMessageInternal_$$($JSCompiler_StaticMethods_broadcast$self$$, "broadcast", $message$jscomp$43$$, !1, !1).then(function() {
    return !0;
  }, function() {
    return !1;
  }) : window.Promise.resolve(!1);
};
_.$JSCompiler_StaticMethods_onBroadcast$$ = function($JSCompiler_StaticMethods_onBroadcast$self$$, $handler$jscomp$25$$) {
  $JSCompiler_StaticMethods_onBroadcast$self$$.$oa$.add($handler$jscomp$25$$);
};
$JSCompiler_StaticMethods_replaceUrl$$ = function($JSCompiler_StaticMethods_replaceUrl$self$$, $newUrl$jscomp$2$$) {
  if ($newUrl$jscomp$2$$ && $JSCompiler_StaticMethods_replaceUrl$self$$.ampdoc.$isSingleDoc$() && $JSCompiler_StaticMethods_replaceUrl$self$$.$win$.history.replaceState) {
    try {
      var $url$jscomp$91$$ = _.$parseUrlDeprecated$$module$src$url$$($JSCompiler_StaticMethods_replaceUrl$self$$.$win$.location.href), $replaceUrl$$ = _.$parseUrlDeprecated$$module$src$url$$(_.$removeFragment$$module$src$url$$($newUrl$jscomp$2$$) + $JSCompiler_StaticMethods_replaceUrl$self$$.$win$.location.hash);
      $url$jscomp$91$$.origin == $replaceUrl$$.origin && _.$getSourceOrigin$$module$src$url$$($url$jscomp$91$$) == _.$getSourceOrigin$$module$src$url$$($replaceUrl$$) && ($JSCompiler_StaticMethods_replaceUrl$self$$.$win$.history.replaceState({}, "", $replaceUrl$$.href), $JSCompiler_StaticMethods_replaceUrl$self$$.$win$.location.$F$ = $url$jscomp$91$$.href, "Viewer");
    } catch ($e$jscomp$84$$) {
      _.$dev$$module$src$log$$().error("Viewer", "replaceUrl failed", $e$jscomp$84$$);
    }
  }
};
$parseParams_$$module$src$service$viewer_impl$$ = function($params$jscomp$11_str$jscomp$14$$, $allParams$$) {
  $params$jscomp$11_str$jscomp$14$$ = _.$parseQueryString_$$module$src$url_parse_query_string$$($params$jscomp$11_str$jscomp$14$$);
  for (var $k$jscomp$11$$ in $params$jscomp$11_str$jscomp$14$$) {
    $allParams$$[$k$jscomp$11$$] = $params$jscomp$11_str$jscomp$14$$[$k$jscomp$11$$];
  }
};
$getChannelError$$module$src$service$viewer_impl$$ = function($opt_reason$jscomp$3$$) {
  return $opt_reason$jscomp$3$$ instanceof Error ? ($opt_reason$jscomp$3$$ = _.$duplicateErrorIfNecessary$$module$src$log$$($opt_reason$jscomp$3$$), $opt_reason$jscomp$3$$.message = "No messaging channel: " + $opt_reason$jscomp$3$$.message, $opt_reason$jscomp$3$$) : Error("No messaging channel: " + $opt_reason$jscomp$3$$);
};
_.$installViewerServiceForDoc$$module$src$service$viewer_impl$$ = function($ampdoc$jscomp$66$$, $opt_initParams$jscomp$1$$) {
  _.$registerServiceBuilderForDoc$$module$src$service$$($ampdoc$jscomp$66$$, "viewer", function() {
    return new $Viewer$$module$src$service$viewer_impl$$($ampdoc$jscomp$66$$, $opt_initParams$jscomp$1$$);
  }, !0);
};
_.$bezierCurve$$module$src$curve$$ = function($bezier_x1$jscomp$6$$, $y1$jscomp$6$$, $x2$jscomp$3$$, $y2$jscomp$3$$) {
  $bezier_x1$jscomp$6$$ = new $Bezier$$module$src$curve$$($bezier_x1$jscomp$6$$, $y1$jscomp$6$$, $x2$jscomp$3$$, $y2$jscomp$3$$);
  return $bezier_x1$jscomp$6$$.$G$.bind($bezier_x1$jscomp$6$$);
};
$Bezier$$module$src$curve$$ = function($x1$jscomp$7$$, $y1$jscomp$7$$, $x2$jscomp$4$$, $y2$jscomp$4$$) {
  this.$D$ = 0;
  this.$x1$ = $x1$jscomp$7$$;
  this.$y1$ = $y1$jscomp$7$$;
  this.$x2$ = $x2$jscomp$4$$;
  this.$y2$ = $y2$jscomp$4$$;
  this.$F$ = 1;
};
$JSCompiler_StaticMethods_solvePositionFromXValue$$ = function($JSCompiler_StaticMethods_solvePositionFromXValue$self$$, $xVal$jscomp$1$$) {
  var $t$jscomp$4$$ = $xVal$jscomp$1$$;
  if (0 >= $t$jscomp$4$$) {
    return 0;
  }
  if (1 <= $t$jscomp$4$$) {
    return 1;
  }
  for (var $tMin$$ = 0, $tMax$$ = 1, $value$jscomp$138$$ = 0, $i$163_i$jscomp$100$$ = 0; 8 > $i$163_i$jscomp$100$$; $i$163_i$jscomp$100$$++) {
    $value$jscomp$138$$ = $JSCompiler_StaticMethods_getPointX$$($JSCompiler_StaticMethods_solvePositionFromXValue$self$$, $t$jscomp$4$$);
    var $derivative$$ = ($JSCompiler_StaticMethods_getPointX$$($JSCompiler_StaticMethods_solvePositionFromXValue$self$$, $t$jscomp$4$$ + 1e-6) - $value$jscomp$138$$) / 1e-6;
    if (1e-6 > Math.abs($value$jscomp$138$$ - $xVal$jscomp$1$$)) {
      return $t$jscomp$4$$;
    }
    if (1e-6 > Math.abs($derivative$$)) {
      break;
    } else {
      $value$jscomp$138$$ < $xVal$jscomp$1$$ ? $tMin$$ = $t$jscomp$4$$ : $tMax$$ = $t$jscomp$4$$, $t$jscomp$4$$ -= ($value$jscomp$138$$ - $xVal$jscomp$1$$) / $derivative$$;
    }
  }
  for ($i$163_i$jscomp$100$$ = 0; 1e-6 < Math.abs($value$jscomp$138$$ - $xVal$jscomp$1$$) && 8 > $i$163_i$jscomp$100$$; $i$163_i$jscomp$100$$++) {
    $value$jscomp$138$$ < $xVal$jscomp$1$$ ? ($tMin$$ = $t$jscomp$4$$, $t$jscomp$4$$ = ($t$jscomp$4$$ + $tMax$$) / 2) : ($tMax$$ = $t$jscomp$4$$, $t$jscomp$4$$ = ($t$jscomp$4$$ + $tMin$$) / 2), $value$jscomp$138$$ = $JSCompiler_StaticMethods_getPointX$$($JSCompiler_StaticMethods_solvePositionFromXValue$self$$, $t$jscomp$4$$);
  }
  return $t$jscomp$4$$;
};
$JSCompiler_StaticMethods_getPointX$$ = function($JSCompiler_StaticMethods_getPointX$self_ix2$$, $t$jscomp$5$$) {
  if (0 == $t$jscomp$5$$) {
    return 0;
  }
  if (1 == $t$jscomp$5$$) {
    return 1;
  }
  var $ix0$$ = $JSCompiler_StaticMethods_lerp$$(0, $JSCompiler_StaticMethods_getPointX$self_ix2$$.$x1$, $t$jscomp$5$$), $ix1$$ = $JSCompiler_StaticMethods_lerp$$($JSCompiler_StaticMethods_getPointX$self_ix2$$.$x1$, $JSCompiler_StaticMethods_getPointX$self_ix2$$.$x2$, $t$jscomp$5$$);
  $JSCompiler_StaticMethods_getPointX$self_ix2$$ = $JSCompiler_StaticMethods_lerp$$($JSCompiler_StaticMethods_getPointX$self_ix2$$.$x2$, 1, $t$jscomp$5$$);
  $ix0$$ += $t$jscomp$5$$ * ($ix1$$ - $ix0$$);
  return $ix0$$ + $t$jscomp$5$$ * ($ix1$$ + $t$jscomp$5$$ * ($JSCompiler_StaticMethods_getPointX$self_ix2$$ - $ix1$$) - $ix0$$);
};
$JSCompiler_StaticMethods_lerp$$ = function($a$jscomp$3$$, $b$jscomp$3$$, $x$jscomp$77$$) {
  return $a$jscomp$3$$ + $x$jscomp$77$$ * ($b$jscomp$3$$ - $a$jscomp$3$$);
};
$getCurve$$module$src$curve$$ = function($curve_match$jscomp$5_values$jscomp$10$$) {
  if (!$curve_match$jscomp$5_values$jscomp$10$$) {
    return null;
  }
  if ("string" == typeof $curve_match$jscomp$5_values$jscomp$10$$) {
    if (-1 != $curve_match$jscomp$5_values$jscomp$10$$.indexOf("cubic-bezier")) {
      if ($curve_match$jscomp$5_values$jscomp$10$$ = $curve_match$jscomp$5_values$jscomp$10$$.match(/cubic-bezier\((.+)\)/)) {
        if ($curve_match$jscomp$5_values$jscomp$10$$ = $curve_match$jscomp$5_values$jscomp$10$$[1].split(",").map(window.parseFloat), 4 == $curve_match$jscomp$5_values$jscomp$10$$.length) {
          for (var $i$jscomp$101$$ = 0; 4 > $i$jscomp$101$$; $i$jscomp$101$$++) {
            if ((0,window.isNaN)($curve_match$jscomp$5_values$jscomp$10$$[$i$jscomp$101$$])) {
              return null;
            }
          }
          return _.$bezierCurve$$module$src$curve$$($curve_match$jscomp$5_values$jscomp$10$$[0], $curve_match$jscomp$5_values$jscomp$10$$[1], $curve_match$jscomp$5_values$jscomp$10$$[2], $curve_match$jscomp$5_values$jscomp$10$$[3]);
        }
      }
      return null;
    }
    return $NAME_MAP$$module$src$curve$$[$curve_match$jscomp$5_values$jscomp$10$$];
  }
  return $curve_match$jscomp$5_values$jscomp$10$$;
};
$NOOP_CALLBACK$$module$src$animation$$ = function() {
};
_.$Animation$$module$src$animation$$ = function($contextNode$jscomp$2$$) {
  this.$G$ = $contextNode$jscomp$2$$;
  this.$vsync_$ = _.$Services$$module$src$services$vsyncFor$$(window.self);
  this.$F$ = null;
  this.$D$ = [];
};
_.$Animation$$module$src$animation$animate$$ = function($JSCompiler_StaticMethods_setCurve$self$jscomp$inline_1550_contextNode$jscomp$3$$, $transition$jscomp$2$$, $duration$jscomp$2$$, $opt_curve$$) {
  $JSCompiler_StaticMethods_setCurve$self$jscomp$inline_1550_contextNode$jscomp$3$$ = new _.$Animation$$module$src$animation$$($JSCompiler_StaticMethods_setCurve$self$jscomp$inline_1550_contextNode$jscomp$3$$);
  $opt_curve$$ && ($JSCompiler_StaticMethods_setCurve$self$jscomp$inline_1550_contextNode$jscomp$3$$.$F$ = $getCurve$$module$src$curve$$($opt_curve$$));
  return $JSCompiler_StaticMethods_setCurve$self$jscomp$inline_1550_contextNode$jscomp$3$$.add(0, $transition$jscomp$2$$, 1).start($duration$jscomp$2$$);
};
_.$AnimationPlayer$$module$src$animation$$ = function($i$jscomp$102_vsync$$, $contextNode$jscomp$4_segment$$, $deferred$jscomp$21_segments$$, $defaultCurve$$, $duration$jscomp$5$$) {
  this.$vsync_$ = $i$jscomp$102_vsync$$;
  this.$F$ = $contextNode$jscomp$4_segment$$;
  this.$D$ = [];
  for ($i$jscomp$102_vsync$$ = 0; $i$jscomp$102_vsync$$ < $deferred$jscomp$21_segments$$.length; $i$jscomp$102_vsync$$++) {
    $contextNode$jscomp$4_segment$$ = $deferred$jscomp$21_segments$$[$i$jscomp$102_vsync$$], this.$D$.push({delay:$contextNode$jscomp$4_segment$$.delay, func:$contextNode$jscomp$4_segment$$.func, duration:$contextNode$jscomp$4_segment$$.duration, curve:$contextNode$jscomp$4_segment$$.curve || $defaultCurve$$, $started$:!1, $completed$:!1});
  }
  this.$duration_$ = $duration$jscomp$5$$;
  this.$P$ = Date.now();
  this.$G$ = !0;
  this.$state_$ = {};
  $deferred$jscomp$21_segments$$ = new _.$Deferred$$module$src$utils$promise$$;
  this.$I$ = $deferred$jscomp$21_segments$$.$promise$;
  this.$O$ = $deferred$jscomp$21_segments$$.resolve;
  this.$K$ = $deferred$jscomp$21_segments$$.reject;
  this.$J$ = _.$JSCompiler_StaticMethods_createAnimTask$$(this.$vsync_$, this.$F$, {$mutate$:this.$R$.bind(this)});
  _.$JSCompiler_StaticMethods_canAnimate_$$(this.$vsync_$, this.$F$) ? this.$J$(this.$state_$) : (_.$dev$$module$src$log$$().$Log$$module$src$log_prototype$warn$("Animation", "cannot animate"), _.$JSCompiler_StaticMethods_AnimationPlayer$$module$src$animation_prototype$complete_$$(this, !1));
};
_.$JSCompiler_StaticMethods_AnimationPlayer$$module$src$animation_prototype$thenAlways$$ = function($JSCompiler_StaticMethods_AnimationPlayer$$module$src$animation_prototype$thenAlways$self$$, $callback$jscomp$82_opt_callback$jscomp$8$$) {
  $callback$jscomp$82_opt_callback$jscomp$8$$ = $callback$jscomp$82_opt_callback$jscomp$8$$ || $NOOP_CALLBACK$$module$src$animation$$;
  return $JSCompiler_StaticMethods_AnimationPlayer$$module$src$animation_prototype$thenAlways$self$$.then($callback$jscomp$82_opt_callback$jscomp$8$$, $callback$jscomp$82_opt_callback$jscomp$8$$);
};
_.$JSCompiler_StaticMethods_AnimationPlayer$$module$src$animation_prototype$complete_$$ = function($JSCompiler_StaticMethods_AnimationPlayer$$module$src$animation_prototype$complete_$self$$, $success$jscomp$4$$) {
  $JSCompiler_StaticMethods_AnimationPlayer$$module$src$animation_prototype$complete_$self$$.$G$ && ($JSCompiler_StaticMethods_AnimationPlayer$$module$src$animation_prototype$complete_$self$$.$G$ = !1, $success$jscomp$4$$ ? $JSCompiler_StaticMethods_AnimationPlayer$$module$src$animation_prototype$complete_$self$$.$O$() : $JSCompiler_StaticMethods_AnimationPlayer$$module$src$animation_prototype$complete_$self$$.$K$());
};
_.$getFriendlyIframeEmbedOptional$$module$src$friendly_iframe_embed$$ = function($iframe$jscomp$10$$) {
  return $iframe$jscomp$10$$.__AMP_EMBED__;
};
_.$whenContentIniLoad$$module$src$friendly_iframe_embed$$ = function($elementOrAmpDoc$jscomp$21$$, $hostWin$jscomp$2$$, $rect$jscomp$7$$) {
  return $JSCompiler_StaticMethods_getResourcesInRect$$(_.$Services$$module$src$services$resourcesForDoc$$($elementOrAmpDoc$jscomp$21$$), $hostWin$jscomp$2$$, $rect$jscomp$7$$).then(function($elementOrAmpDoc$jscomp$21$$) {
    var $hostWin$jscomp$2$$ = [];
    $elementOrAmpDoc$jscomp$21$$.forEach(function($elementOrAmpDoc$jscomp$21$$) {
      $EXCLUDE_INI_LOAD$$module$src$friendly_iframe_embed$$.includes($elementOrAmpDoc$jscomp$21$$.element.tagName) || $hostWin$jscomp$2$$.push($elementOrAmpDoc$jscomp$21$$.$loadPromise_$);
    });
    return window.Promise.all($hostWin$jscomp$2$$);
  });
};
_.$numeric$$module$src$transition$$ = function($start$jscomp$9$$, $end$jscomp$5$$) {
  return function($time$jscomp$8$$) {
    return $start$jscomp$9$$ + ($end$jscomp$5$$ - $start$jscomp$9$$) * $time$jscomp$8$$;
  };
};
$positionLt$$module$src$service$layers_impl$$ = function($left$jscomp$4$$, $top$jscomp$4$$) {
  return {left:$left$jscomp$4$$, top:$top$jscomp$4$$};
};
$LayoutLayers$$module$src$service$layers_impl$$ = function($ampdoc$jscomp$67_win$jscomp$187$$, $scrollingElement$$, $scrollingElementScrollsLikeViewport$$) {
  var $$jscomp$this$jscomp$129$$ = this;
  $ampdoc$jscomp$67_win$jscomp$187$$ = $ampdoc$jscomp$67_win$jscomp$187$$.$win$;
  this.$I$ = $scrollingElement$$;
  this.$F$ = null;
  this.$D$ = [];
  this.$unlisteners_$ = [];
  $JSCompiler_StaticMethods_listenForScroll_$$(this, $ampdoc$jscomp$67_win$jscomp$187$$.document);
  $ampdoc$jscomp$67_win$jscomp$187$$.document.documentElement.contains($scrollingElement$$) || $JSCompiler_StaticMethods_listenForScroll_$$(this, $scrollingElement$$);
  this.$unlisteners_$.push(_.$listen$$module$src$event_helper$$($ampdoc$jscomp$67_win$jscomp$187$$, "resize", function() {
    for (var $ampdoc$jscomp$67_win$jscomp$187$$ = $$jscomp$this$jscomp$129$$.$D$, $scrollingElement$$ = 0; $scrollingElement$$ < $ampdoc$jscomp$67_win$jscomp$187$$.length; $scrollingElement$$++) {
      var $scrollingElementScrollsLikeViewport$$ = $ampdoc$jscomp$67_win$jscomp$187$$[$scrollingElement$$];
      if ($scrollingElementScrollsLikeViewport$$.$F$ && !$scrollingElementScrollsLikeViewport$$.$P$) {
        var $element$jscomp$inline_5772_parent$jscomp$inline_5773$$ = $scrollingElementScrollsLikeViewport$$.$element_$;
        $isDestroyed$$module$src$service$layers_impl$$($element$jscomp$inline_5772_parent$jscomp$inline_5773$$) || "fixed" === _.$computedStyle$$module$src$style$$($element$jscomp$inline_5772_parent$jscomp$inline_5773$$.ownerDocument.defaultView, $element$jscomp$inline_5772_parent$jscomp$inline_5773$$).position || ($scrollingElementScrollsLikeViewport$$.$F$ = !1, $element$jscomp$inline_5772_parent$jscomp$inline_5773$$ = $JSCompiler_StaticMethods_getParentLayer$$($scrollingElementScrollsLikeViewport$$) || 
        $LayoutElement$$module$src$service$layers_impl$getParentLayer$$($element$jscomp$inline_5772_parent$jscomp$inline_5773$$, !0), $JSCompiler_StaticMethods_LayoutElement$$module$src$service$layers_impl_prototype$transfer_$$($scrollingElementScrollsLikeViewport$$, $element$jscomp$inline_5772_parent$jscomp$inline_5773$$));
      }
      $scrollingElementScrollsLikeViewport$$.$G$ = void 0;
    }
  }, {capture:!0, passive:!0}));
  this.$G$ = $JSCompiler_StaticMethods_declareLayer_$$(this, $scrollingElement$$, !0, $scrollingElementScrollsLikeViewport$$);
};
$JSCompiler_StaticMethods_declareLayer_$$ = function($JSCompiler_StaticMethods_declareLayer_$self_layout$jscomp$17$$, $element$jscomp$167$$, $isRootLayer$$, $scrollsLikeViewport$$) {
  $JSCompiler_StaticMethods_declareLayer_$self_layout$jscomp$17$$ = $JSCompiler_StaticMethods_declareLayer_$self_layout$jscomp$17$$.add($element$jscomp$167$$);
  $JSCompiler_StaticMethods_declareLayer_$self_layout$jscomp$17$$.$declareLayer$($isRootLayer$$, $scrollsLikeViewport$$);
  return $JSCompiler_StaticMethods_declareLayer_$self_layout$jscomp$17$$;
};
$JSCompiler_StaticMethods_listenForScroll_$$ = function($JSCompiler_StaticMethods_listenForScroll_$self$$, $root$jscomp$15$$) {
  $JSCompiler_StaticMethods_listenForScroll_$self$$.$unlisteners_$.push(_.$listen$$module$src$event_helper$$($root$jscomp$15$$, "scroll", function($root$jscomp$15$$) {
    $root$jscomp$15$$ = $root$jscomp$15$$.target;
    $root$jscomp$15$$ = $root$jscomp$15$$.nodeType == window.Node.ELEMENT_NODE ? $root$jscomp$15$$ : $JSCompiler_StaticMethods_listenForScroll_$self$$.$I$;
    var $event$jscomp$31_scrolled$jscomp$inline_1575_target$jscomp$inline_1574$$ = $LayoutElement$$module$src$service$layers_impl$forOptional$$($root$jscomp$15$$);
    $event$jscomp$31_scrolled$jscomp$inline_1575_target$jscomp$inline_1574$$ && $event$jscomp$31_scrolled$jscomp$inline_1575_target$jscomp$inline_1574$$.$F$ ? $event$jscomp$31_scrolled$jscomp$inline_1575_target$jscomp$inline_1574$$.$I$ = !0 : $event$jscomp$31_scrolled$jscomp$inline_1575_target$jscomp$inline_1574$$ = $JSCompiler_StaticMethods_declareLayer_$$($JSCompiler_StaticMethods_listenForScroll_$self$$, $root$jscomp$15$$, !1, !1);
    $JSCompiler_StaticMethods_listenForScroll_$self$$.$G$ = $event$jscomp$31_scrolled$jscomp$inline_1575_target$jscomp$inline_1574$$;
    $JSCompiler_StaticMethods_listenForScroll_$self$$.$F$ && $JSCompiler_StaticMethods_listenForScroll_$self$$.$F$();
  }, {capture:!0, passive:!0}));
};
$JSCompiler_StaticMethods_LayoutLayers$$module$src$service$layers_impl_prototype$onScroll$$ = function($JSCompiler_StaticMethods_LayoutLayers$$module$src$service$layers_impl_prototype$onScroll$self$$, $handler$jscomp$27$$) {
  $JSCompiler_StaticMethods_LayoutLayers$$module$src$service$layers_impl_prototype$onScroll$self$$.$F$ = $handler$jscomp$27$$;
};
$LayoutElement$$module$src$service$layers_impl$$ = function($element$jscomp$169$$) {
  $element$jscomp$169$$.__AMP_LAYOUT = this;
  this.$element_$ = $element$jscomp$169$$;
  this.$U$ = $element$jscomp$169$$.tagName + "-" + $layoutId$$module$src$service$layers_impl$$++;
  this.$G$ = void 0;
  this.$D$ = !0;
  this.$size_$ = {height:0, width:0};
  this.$J$ = $positionLt$$module$src$service$layers_impl$$(0, 0);
  this.$isActive_$ = void 0;
  this.$I$ = this.$R$ = this.$P$ = this.$F$ = !1;
  this.$O$ = this.$K$ = 0;
  this.$children_$ = [];
};
$LayoutElement$$module$src$service$layers_impl$forOptional$$ = function($element$jscomp$171$$) {
  return $element$jscomp$171$$.__AMP_LAYOUT || null;
};
$LayoutElement$$module$src$service$layers_impl$getParentLayer$$ = function($node$jscomp$44$$, $layout$jscomp$20_op_opt_force$jscomp$4$$) {
  if ($isDestroyed$$module$src$service$layers_impl$$($node$jscomp$44$$)) {
    return null;
  }
  if (!$layout$jscomp$20_op_opt_force$jscomp$4$$ && ($layout$jscomp$20_op_opt_force$jscomp$4$$ = $LayoutElement$$module$src$service$layers_impl$forOptional$$($node$jscomp$44$$))) {
    return $JSCompiler_StaticMethods_getParentLayer$$($layout$jscomp$20_op_opt_force$jscomp$4$$);
  }
  var $parent$jscomp$22_win$jscomp$188$$ = $node$jscomp$44$$.ownerDocument.defaultView, $el$jscomp$14$$ = $node$jscomp$44$$;
  $layout$jscomp$20_op_opt_force$jscomp$4$$ = $node$jscomp$44$$;
  for (var $last$jscomp$1_layout$168$$; $el$jscomp$14$$;) {
    if (($last$jscomp$1_layout$168$$ = $el$jscomp$14$$ === $node$jscomp$44$$ ? null : $LayoutElement$$module$src$service$layers_impl$forOptional$$($el$jscomp$14$$)) && $last$jscomp$1_layout$168$$.$F$) {
      return $last$jscomp$1_layout$168$$;
    }
    if ($el$jscomp$14$$ === $layout$jscomp$20_op_opt_force$jscomp$4$$) {
      if ("fixed" == _.$computedStyle$$module$src$style$$($parent$jscomp$22_win$jscomp$188$$, $layout$jscomp$20_op_opt_force$jscomp$4$$).position) {
        $parent$jscomp$22_win$jscomp$188$$ = void 0;
        $layout$jscomp$20_op_opt_force$jscomp$4$$ !== $node$jscomp$44$$ ? $parent$jscomp$22_win$jscomp$188$$ = $layout$jscomp$20_op_opt_force$jscomp$4$$ : $parent$jscomp$22_win$jscomp$188$$ = $frameParent$$module$src$service$layers_impl$$($node$jscomp$44$$.ownerDocument);
        if ($parent$jscomp$22_win$jscomp$188$$) {
          return _.$getServiceForDoc$$module$src$service$$($parent$jscomp$22_win$jscomp$188$$, "layers").$declareLayer$($parent$jscomp$22_win$jscomp$188$$), $LayoutElement$$module$src$service$layers_impl$forOptional$$($parent$jscomp$22_win$jscomp$188$$);
        }
        break;
      }
      $layout$jscomp$20_op_opt_force$jscomp$4$$ = $layout$jscomp$20_op_opt_force$jscomp$4$$.offsetParent;
    }
    $last$jscomp$1_layout$168$$ = $el$jscomp$14$$;
    $el$jscomp$14$$ = $el$jscomp$14$$.assignedSlot || $el$jscomp$14$$.parentNode || $el$jscomp$14$$.host;
    !$el$jscomp$14$$ && ($layout$jscomp$20_op_opt_force$jscomp$4$$ = $el$jscomp$14$$ = $frameParent$$module$src$service$layers_impl$$($last$jscomp$1_layout$168$$)) && ($parent$jscomp$22_win$jscomp$188$$ = $el$jscomp$14$$.ownerDocument.defaultView);
  }
  return null;
};
$JSCompiler_StaticMethods_contains_$$ = function($JSCompiler_StaticMethods_contains_$self_host_rootNode$jscomp$4$$, $element$jscomp$172$$, $frame_other$jscomp$6$$) {
  if ($element$jscomp$172$$.contains($frame_other$jscomp$6$$)) {
    return !0;
  }
  if ($element$jscomp$172$$.ownerDocument !== $frame_other$jscomp$6$$.ownerDocument) {
    return $frame_other$jscomp$6$$ = $frameParent$$module$src$service$layers_impl$$($frame_other$jscomp$6$$.ownerDocument), !!$frame_other$jscomp$6$$ && $JSCompiler_StaticMethods_contains_$$($JSCompiler_StaticMethods_contains_$self_host_rootNode$jscomp$4$$, $element$jscomp$172$$, $frame_other$jscomp$6$$);
  }
  $JSCompiler_StaticMethods_contains_$self_host_rootNode$jscomp$4$$ = ($JSCompiler_StaticMethods_contains_$self_host_rootNode$jscomp$4$$ = _.$rootNodeFor$$module$src$dom$$($element$jscomp$172$$)) && $JSCompiler_StaticMethods_contains_$self_host_rootNode$jscomp$4$$.host;
  return !!$JSCompiler_StaticMethods_contains_$self_host_rootNode$jscomp$4$$ && $JSCompiler_StaticMethods_contains_$self_host_rootNode$jscomp$4$$.contains($frame_other$jscomp$6$$);
};
$JSCompiler_StaticMethods_LayoutElement$$module$src$service$layers_impl_prototype$transfer_$$ = function($JSCompiler_StaticMethods_LayoutElement$$module$src$service$layers_impl_prototype$transfer_$self$$, $layer$jscomp$2$$) {
  var $contained$$ = $layer$jscomp$2$$.contains($JSCompiler_StaticMethods_LayoutElement$$module$src$service$layers_impl_prototype$transfer_$self$$);
  _.$remove$$module$src$utils$array$$($JSCompiler_StaticMethods_LayoutElement$$module$src$service$layers_impl_prototype$transfer_$self$$.$children_$, function($JSCompiler_StaticMethods_LayoutElement$$module$src$service$layers_impl_prototype$transfer_$self$$) {
    return $contained$$ || $layer$jscomp$2$$.contains($JSCompiler_StaticMethods_LayoutElement$$module$src$service$layers_impl_prototype$transfer_$self$$) ? ($JSCompiler_StaticMethods_LayoutElement$$module$src$service$layers_impl_prototype$transfer_$self$$.$D$ = !0, $JSCompiler_StaticMethods_LayoutElement$$module$src$service$layers_impl_prototype$transfer_$self$$.$G$ = $layer$jscomp$2$$, $layer$jscomp$2$$.$children_$.push($JSCompiler_StaticMethods_LayoutElement$$module$src$service$layers_impl_prototype$transfer_$self$$), 
    !0) : !1;
  });
};
$JSCompiler_StaticMethods_getParentLayer$$ = function($JSCompiler_StaticMethods_getParentLayer$self$$) {
  if (void 0 === $JSCompiler_StaticMethods_getParentLayer$self$$.$G$) {
    var $parent$jscomp$25$$ = $LayoutElement$$module$src$service$layers_impl$getParentLayer$$($JSCompiler_StaticMethods_getParentLayer$self$$.$element_$, !0);
    ($JSCompiler_StaticMethods_getParentLayer$self$$.$G$ = $parent$jscomp$25$$) && $parent$jscomp$25$$.add($JSCompiler_StaticMethods_getParentLayer$self$$);
  }
  return $JSCompiler_StaticMethods_getParentLayer$self$$.$G$;
};
$JSCompiler_StaticMethods_getOffsetFromParent$$ = function($JSCompiler_StaticMethods_getOffsetFromParent$self$$) {
  $JSCompiler_StaticMethods_getOffsetFromParent$self$$.$remeasure$();
  return $JSCompiler_StaticMethods_getOffsetFromParent$self$$.$J$;
};
$JSCompiler_StaticMethods_getHorizontalDistanceFromParent$$ = function($JSCompiler_StaticMethods_getHorizontalDistanceFromParent$self_width$jscomp$17$$) {
  var $parent$jscomp$26_parentWidth$$ = $JSCompiler_StaticMethods_getParentLayer$$($JSCompiler_StaticMethods_getHorizontalDistanceFromParent$self_width$jscomp$17$$);
  if (!$parent$jscomp$26_parentWidth$$) {
    return 0;
  }
  var $left$jscomp$5$$ = $JSCompiler_StaticMethods_getOffsetFromParent$$($JSCompiler_StaticMethods_getHorizontalDistanceFromParent$self_width$jscomp$17$$).left;
  $JSCompiler_StaticMethods_getHorizontalDistanceFromParent$self_width$jscomp$17$$ = $JSCompiler_StaticMethods_getHorizontalDistanceFromParent$self_width$jscomp$17$$.$getSize$().width;
  var $scrollLeft$$ = $parent$jscomp$26_parentWidth$$.getScrollLeft();
  $parent$jscomp$26_parentWidth$$ = $parent$jscomp$26_parentWidth$$.$getSize$().width;
  return $left$jscomp$5$$ + $JSCompiler_StaticMethods_getHorizontalDistanceFromParent$self_width$jscomp$17$$ < $scrollLeft$$ ? $scrollLeft$$ - ($left$jscomp$5$$ + $JSCompiler_StaticMethods_getHorizontalDistanceFromParent$self_width$jscomp$17$$) : $scrollLeft$$ + $parent$jscomp$26_parentWidth$$ < $left$jscomp$5$$ ? $left$jscomp$5$$ - ($scrollLeft$$ + $parent$jscomp$26_parentWidth$$) : 0;
};
$JSCompiler_StaticMethods_getVerticalDistanceFromParent$$ = function($JSCompiler_StaticMethods_getVerticalDistanceFromParent$self_height$jscomp$16$$) {
  var $parent$jscomp$28_parentHeight$$ = $JSCompiler_StaticMethods_getParentLayer$$($JSCompiler_StaticMethods_getVerticalDistanceFromParent$self_height$jscomp$16$$);
  if (!$parent$jscomp$28_parentHeight$$) {
    return 0;
  }
  var $top$jscomp$5$$ = $JSCompiler_StaticMethods_getOffsetFromParent$$($JSCompiler_StaticMethods_getVerticalDistanceFromParent$self_height$jscomp$16$$).top;
  $JSCompiler_StaticMethods_getVerticalDistanceFromParent$self_height$jscomp$16$$ = $JSCompiler_StaticMethods_getVerticalDistanceFromParent$self_height$jscomp$16$$.$getSize$().height;
  var $scrollTop$$ = $JSCompiler_StaticMethods_LayoutElement$$module$src$service$layers_impl_prototype$getScrollTop$$($parent$jscomp$28_parentHeight$$);
  $parent$jscomp$28_parentHeight$$ = $parent$jscomp$28_parentHeight$$.$getSize$().height;
  return $top$jscomp$5$$ + $JSCompiler_StaticMethods_getVerticalDistanceFromParent$self_height$jscomp$16$$ < $scrollTop$$ ? $scrollTop$$ - ($top$jscomp$5$$ + $JSCompiler_StaticMethods_getVerticalDistanceFromParent$self_height$jscomp$16$$) : $scrollTop$$ + $parent$jscomp$28_parentHeight$$ < $top$jscomp$5$$ ? $top$jscomp$5$$ - ($scrollTop$$ + $parent$jscomp$28_parentHeight$$) : 0;
};
$JSCompiler_StaticMethods_LayoutElement$$module$src$service$layers_impl_prototype$getScrollTop$$ = function($JSCompiler_StaticMethods_LayoutElement$$module$src$service$layers_impl_prototype$getScrollTop$self$$) {
  $JSCompiler_StaticMethods_updateScrollPosition_$$($JSCompiler_StaticMethods_LayoutElement$$module$src$service$layers_impl_prototype$getScrollTop$self$$);
  return $JSCompiler_StaticMethods_LayoutElement$$module$src$service$layers_impl_prototype$getScrollTop$self$$.$O$;
};
$JSCompiler_StaticMethods_remeasure_$$ = function($JSCompiler_StaticMethods_remeasure_$self_children$jscomp$127$$) {
  $JSCompiler_StaticMethods_updateScrollPosition_$$($JSCompiler_StaticMethods_remeasure_$self_children$jscomp$127$$);
  $JSCompiler_StaticMethods_remeasure_$self_children$jscomp$127$$.$D$ = !1;
  var $element$jscomp$174_i$jscomp$111_left$jscomp$6$$ = $JSCompiler_StaticMethods_remeasure_$self_children$jscomp$127$$.$element_$, $JSCompiler_temp$jscomp$510_parent$jscomp$30_relative$$ = $JSCompiler_StaticMethods_getParentLayer$$($JSCompiler_StaticMethods_remeasure_$self_children$jscomp$127$$);
  if ($JSCompiler_temp$jscomp$510_parent$jscomp$30_relative$$) {
    if ($JSCompiler_temp$jscomp$510_parent$jscomp$30_relative$$.$element_$.ownerDocument === $JSCompiler_StaticMethods_remeasure_$self_children$jscomp$127$$.$element_$.ownerDocument) {
      var $$jscomp$destructuring$var111_position$jscomp$inline_1582_top$jscomp$6$$ = $JSCompiler_temp$jscomp$510_parent$jscomp$30_relative$$.$getScrolledPosition$($JSCompiler_temp$jscomp$510_parent$jscomp$30_relative$$.$element_$.ownerDocument.documentElement);
      $JSCompiler_temp$jscomp$510_parent$jscomp$30_relative$$ = $positionLt$$module$src$service$layers_impl$$($$jscomp$destructuring$var111_position$jscomp$inline_1582_top$jscomp$6$$.left - $JSCompiler_temp$jscomp$510_parent$jscomp$30_relative$$.getScrollLeft(), $$jscomp$destructuring$var111_position$jscomp$inline_1582_top$jscomp$6$$.top - $JSCompiler_StaticMethods_LayoutElement$$module$src$service$layers_impl_prototype$getScrollTop$$($JSCompiler_temp$jscomp$510_parent$jscomp$30_relative$$));
    } else {
      $JSCompiler_temp$jscomp$510_parent$jscomp$30_relative$$ = $positionLt$$module$src$service$layers_impl$$(0, 0);
    }
  } else {
    $JSCompiler_temp$jscomp$510_parent$jscomp$30_relative$$ = $positionLt$$module$src$service$layers_impl$$(0, 0);
  }
  $JSCompiler_StaticMethods_remeasure_$self_children$jscomp$127$$.$size_$ = {height:$element$jscomp$174_i$jscomp$111_left$jscomp$6$$.clientHeight, width:$element$jscomp$174_i$jscomp$111_left$jscomp$6$$.clientWidth};
  $$jscomp$destructuring$var111_position$jscomp$inline_1582_top$jscomp$6$$ = $element$jscomp$174_i$jscomp$111_left$jscomp$6$$.getBoundingClientRect();
  $element$jscomp$174_i$jscomp$111_left$jscomp$6$$ = $$jscomp$destructuring$var111_position$jscomp$inline_1582_top$jscomp$6$$.left;
  $$jscomp$destructuring$var111_position$jscomp$inline_1582_top$jscomp$6$$ = $$jscomp$destructuring$var111_position$jscomp$inline_1582_top$jscomp$6$$.top;
  $JSCompiler_StaticMethods_remeasure_$self_children$jscomp$127$$.$R$ && ($element$jscomp$174_i$jscomp$111_left$jscomp$6$$ += $JSCompiler_StaticMethods_remeasure_$self_children$jscomp$127$$.getScrollLeft(), $$jscomp$destructuring$var111_position$jscomp$inline_1582_top$jscomp$6$$ += $JSCompiler_StaticMethods_LayoutElement$$module$src$service$layers_impl_prototype$getScrollTop$$($JSCompiler_StaticMethods_remeasure_$self_children$jscomp$127$$));
  $JSCompiler_StaticMethods_remeasure_$self_children$jscomp$127$$.$J$ = $positionLt$$module$src$service$layers_impl$$($element$jscomp$174_i$jscomp$111_left$jscomp$6$$ - $JSCompiler_temp$jscomp$510_parent$jscomp$30_relative$$.left, $$jscomp$destructuring$var111_position$jscomp$inline_1582_top$jscomp$6$$ - $JSCompiler_temp$jscomp$510_parent$jscomp$30_relative$$.top);
  $JSCompiler_StaticMethods_remeasure_$self_children$jscomp$127$$ = $JSCompiler_StaticMethods_remeasure_$self_children$jscomp$127$$.$children_$;
  if ($JSCompiler_StaticMethods_remeasure_$self_children$jscomp$127$$.length) {
    for ($element$jscomp$174_i$jscomp$111_left$jscomp$6$$ = 0; $element$jscomp$174_i$jscomp$111_left$jscomp$6$$ < $JSCompiler_StaticMethods_remeasure_$self_children$jscomp$127$$.length; $element$jscomp$174_i$jscomp$111_left$jscomp$6$$++) {
      $JSCompiler_StaticMethods_remeasure_$$($JSCompiler_StaticMethods_remeasure_$self_children$jscomp$127$$[$element$jscomp$174_i$jscomp$111_left$jscomp$6$$]);
    }
  }
};
$JSCompiler_StaticMethods_updateScrollPosition_$$ = function($JSCompiler_StaticMethods_updateScrollPosition_$self$$) {
  $JSCompiler_StaticMethods_updateScrollPosition_$self$$.$F$ && $JSCompiler_StaticMethods_updateScrollPosition_$self$$.$I$ && ($JSCompiler_StaticMethods_updateScrollPosition_$self$$.$I$ = !1, $JSCompiler_StaticMethods_updateScrollPosition_$self$$.$K$ = $JSCompiler_StaticMethods_updateScrollPosition_$self$$.$element_$.scrollLeft, $JSCompiler_StaticMethods_updateScrollPosition_$self$$.$O$ = $JSCompiler_StaticMethods_updateScrollPosition_$self$$.$element_$.scrollTop);
};
$frameParent$$module$src$service$layers_impl$$ = function($node$jscomp$45$$) {
  try {
    var $defaultView$jscomp$1$$ = $node$jscomp$45$$.defaultView, $frameElement$jscomp$2$$ = $defaultView$jscomp$1$$ && $defaultView$jscomp$1$$.frameElement;
    return $frameElement$jscomp$2$$ && _.$getFriendlyIframeEmbedOptional$$module$src$friendly_iframe_embed$$($frameElement$jscomp$2$$) ? $frameElement$jscomp$2$$ : null;
  } catch ($e$jscomp$87$$) {
  }
  return null;
};
$isDestroyed$$module$src$service$layers_impl$$ = function($defaultView$jscomp$2_node$jscomp$46_ownerDocument$jscomp$2$$) {
  $defaultView$jscomp$2_node$jscomp$46_ownerDocument$jscomp$2$$ = $defaultView$jscomp$2_node$jscomp$46_ownerDocument$jscomp$2$$.ownerDocument;
  if (!$defaultView$jscomp$2_node$jscomp$46_ownerDocument$jscomp$2$$) {
    return !0;
  }
  $defaultView$jscomp$2_node$jscomp$46_ownerDocument$jscomp$2$$ = $defaultView$jscomp$2_node$jscomp$46_ownerDocument$jscomp$2$$.defaultView;
  return !$defaultView$jscomp$2_node$jscomp$46_ownerDocument$jscomp$2$$ || !$defaultView$jscomp$2_node$jscomp$46_ownerDocument$jscomp$2$$.document;
};
$installLayersServiceForDoc$$module$src$service$layers_impl$$ = function($ampdoc$jscomp$68$$, $scrollingElement$jscomp$1$$, $scrollingElementScrollsLikeViewport$jscomp$1$$) {
  _.$registerServiceBuilderForDoc$$module$src$service$$($ampdoc$jscomp$68$$, "layers", function($ampdoc$jscomp$68$$) {
    return new $LayoutLayers$$module$src$service$layers_impl$$($ampdoc$jscomp$68$$, $scrollingElement$jscomp$1$$, $scrollingElementScrollsLikeViewport$jscomp$1$$);
  }, !0);
};
$lightboxOrDescendant$$module$src$service$fixed_layer$$ = function($el$jscomp$15$$) {
  return -1 !== $el$jscomp$15$$.tagName.indexOf("LIGHTBOX");
};
$FixedLayer$$module$src$service$fixed_layer$$ = function($ampdoc$jscomp$70$$, $vsync$jscomp$1$$, $borderTop$$, $paddingTop$$, $transfer$jscomp$3$$) {
  var $$jscomp$this$jscomp$131$$ = this;
  this.ampdoc = $ampdoc$jscomp$70$$;
  this.$vsync_$ = $vsync$jscomp$1$$;
  this.$P$ = $borderTop$$;
  this.$I$ = this.$J$ = $paddingTop$$;
  this.$G$ = $transfer$jscomp$3$$ && $ampdoc$jscomp$70$$.$isSingleDoc$();
  this.$D$ = null;
  this.$O$ = 0;
  this.$elements_$ = [];
  this.$K$ = new _.$Pass$$module$src$pass$$($ampdoc$jscomp$70$$.$win$, function() {
    $$jscomp$this$jscomp$131$$.update();
  });
  this.$F$ = null;
};
_.$JSCompiler_StaticMethods_observeHiddenMutations$$ = function($JSCompiler_StaticMethods_observeHiddenMutations$self$$) {
  _.$isExperimentOn$$module$src$experiments$$($JSCompiler_StaticMethods_observeHiddenMutations$self$$.ampdoc.$win$, "hidden-mutation-observer") && $JSCompiler_StaticMethods_initMutationObserver_$$($JSCompiler_StaticMethods_observeHiddenMutations$self$$).observe($JSCompiler_StaticMethods_observeHiddenMutations$self$$.ampdoc.getRootNode(), {attributes:!0, subtree:!0});
};
_.$JSCompiler_StaticMethods_clearMutationObserver_$$ = function($JSCompiler_StaticMethods_clearMutationObserver_$self_mo$jscomp$3$$) {
  $JSCompiler_StaticMethods_clearMutationObserver_$self_mo$jscomp$3$$.$K$.cancel();
  ($JSCompiler_StaticMethods_clearMutationObserver_$self_mo$jscomp$3$$ = $JSCompiler_StaticMethods_clearMutationObserver_$self_mo$jscomp$3$$.$F$) && $JSCompiler_StaticMethods_clearMutationObserver_$self_mo$jscomp$3$$.takeRecords();
};
$JSCompiler_StaticMethods_initMutationObserver_$$ = function($JSCompiler_StaticMethods_initMutationObserver_$self$$) {
  return $JSCompiler_StaticMethods_initMutationObserver_$self$$.$F$ ? $JSCompiler_StaticMethods_initMutationObserver_$self$$.$F$ : $JSCompiler_StaticMethods_initMutationObserver_$self$$.$F$ = new $JSCompiler_StaticMethods_initMutationObserver_$self$$.ampdoc.$win$.MutationObserver(function($mutations$jscomp$2$$) {
    if (-1 == $JSCompiler_StaticMethods_initMutationObserver_$self$$.$K$.$D$) {
      for (var $i$jscomp$113$$ = 0; $i$jscomp$113$$ < $mutations$jscomp$2$$.length; $i$jscomp$113$$++) {
        if ("hidden" === $mutations$jscomp$2$$[$i$jscomp$113$$].attributeName) {
          _.$JSCompiler_StaticMethods_schedule$$($JSCompiler_StaticMethods_initMutationObserver_$self$$.$K$, 16);
          break;
        }
      }
    }
  });
};
$JSCompiler_StaticMethods_FixedLayer$$module$src$service$fixed_layer_prototype$updatePaddingTop$$ = function($JSCompiler_StaticMethods_FixedLayer$$module$src$service$fixed_layer_prototype$updatePaddingTop$self$$, $paddingTop$jscomp$1$$, $opt_transient$$) {
  $JSCompiler_StaticMethods_FixedLayer$$module$src$service$fixed_layer_prototype$updatePaddingTop$self$$.$J$ = $paddingTop$jscomp$1$$;
  $opt_transient$$ || ($JSCompiler_StaticMethods_FixedLayer$$module$src$service$fixed_layer_prototype$updatePaddingTop$self$$.$I$ = $paddingTop$jscomp$1$$);
  $JSCompiler_StaticMethods_FixedLayer$$module$src$service$fixed_layer_prototype$updatePaddingTop$self$$.update();
};
$JSCompiler_StaticMethods_transformMutate$$ = function($JSCompiler_StaticMethods_transformMutate$self$$, $transform$jscomp$1$$) {
  $transform$jscomp$1$$ ? $JSCompiler_StaticMethods_transformMutate$self$$.$elements_$.forEach(function($JSCompiler_StaticMethods_transformMutate$self$$) {
    $JSCompiler_StaticMethods_transformMutate$self$$.$fixedNow$ && $JSCompiler_StaticMethods_transformMutate$self$$.top && (_.$setStyle$$module$src$style$$($JSCompiler_StaticMethods_transformMutate$self$$.element, "transition", "none"), $JSCompiler_StaticMethods_transformMutate$self$$.transform && "none" != $JSCompiler_StaticMethods_transformMutate$self$$.transform ? _.$setStyle$$module$src$style$$($JSCompiler_StaticMethods_transformMutate$self$$.element, "transform", $JSCompiler_StaticMethods_transformMutate$self$$.transform + 
    " " + $transform$jscomp$1$$) : _.$setStyle$$module$src$style$$($JSCompiler_StaticMethods_transformMutate$self$$.element, "transform", $transform$jscomp$1$$));
  }) : $JSCompiler_StaticMethods_transformMutate$self$$.$elements_$.forEach(function($JSCompiler_StaticMethods_transformMutate$self$$) {
    $JSCompiler_StaticMethods_transformMutate$self$$.$fixedNow$ && $JSCompiler_StaticMethods_transformMutate$self$$.top && _.$setStyles$$module$src$style$$($JSCompiler_StaticMethods_transformMutate$self$$.element, {transform:"", transition:""});
  });
};
_.$JSCompiler_StaticMethods_setupElement_$$ = function($JSCompiler_StaticMethods_setupElement_$self$$, $element$jscomp$182$$, $selector$jscomp$6$$, $position$jscomp$4$$, $opt_forceTransfer$jscomp$1$$) {
  $element$jscomp$182$$.hasAttribute("style") && (_.$getStyle$$module$src$style$$($element$jscomp$182$$, "top") || _.$getStyle$$module$src$style$$($element$jscomp$182$$, "bottom")) && _.$user$$module$src$log$$().error("FixedLayer", "Inline styles with `top`, `bottom` and other CSS rules are not supported yet for fixed or sticky elements (#14186). Unexpected behavior may occur.", $element$jscomp$182$$);
  if (!_.$closest$$module$src$dom$$($element$jscomp$182$$, $lightboxOrDescendant$$module$src$service$fixed_layer$$)) {
    for (var $fe$jscomp$5_id$jscomp$37$$ = null, $i$jscomp$118_isFixed$jscomp$2$$ = 0; $i$jscomp$118_isFixed$jscomp$2$$ < $JSCompiler_StaticMethods_setupElement_$self$$.$elements_$.length; $i$jscomp$118_isFixed$jscomp$2$$++) {
      var $el$jscomp$16$$ = $JSCompiler_StaticMethods_setupElement_$self$$.$elements_$[$i$jscomp$118_isFixed$jscomp$2$$];
      if ($el$jscomp$16$$.element == $element$jscomp$182$$ && $el$jscomp$16$$.position == $position$jscomp$4$$) {
        $fe$jscomp$5_id$jscomp$37$$ = $el$jscomp$16$$;
        break;
      }
    }
    $i$jscomp$118_isFixed$jscomp$2$$ = "fixed" == $position$jscomp$4$$;
    $fe$jscomp$5_id$jscomp$37$$ ? $fe$jscomp$5_id$jscomp$37$$.$selectors$.includes($selector$jscomp$6$$) || $fe$jscomp$5_id$jscomp$37$$.$selectors$.push($selector$jscomp$6$$) : ($fe$jscomp$5_id$jscomp$37$$ = "F" + $JSCompiler_StaticMethods_setupElement_$self$$.$O$++, $element$jscomp$182$$.setAttribute("i-amphtml-fixedid", $fe$jscomp$5_id$jscomp$37$$), $i$jscomp$118_isFixed$jscomp$2$$ ? $element$jscomp$182$$.__AMP_DECLFIXED = !0 : $element$jscomp$182$$.__AMP_DECLSTICKY = !0, $fe$jscomp$5_id$jscomp$37$$ = 
    {id:$fe$jscomp$5_id$jscomp$37$$, element:$element$jscomp$182$$, position:$position$jscomp$4$$, $selectors$:[$selector$jscomp$6$$], $fixedNow$:!1, $stickyNow$:!1}, $JSCompiler_StaticMethods_setupElement_$self$$.$elements_$.push($fe$jscomp$5_id$jscomp$37$$));
    $fe$jscomp$5_id$jscomp$37$$.$forceTransfer$ = $i$jscomp$118_isFixed$jscomp$2$$ ? $opt_forceTransfer$jscomp$1$$ : !1;
  }
};
_.$JSCompiler_StaticMethods_removeElement_$$ = function($JSCompiler_StaticMethods_removeElement_$self$$, $element$jscomp$183$$) {
  for (var $removed$jscomp$2$$ = [], $i$jscomp$119$$ = 0; $i$jscomp$119$$ < $JSCompiler_StaticMethods_removeElement_$self$$.$elements_$.length; $i$jscomp$119$$++) {
    var $fe$jscomp$6$$ = $JSCompiler_StaticMethods_removeElement_$self$$.$elements_$[$i$jscomp$119$$];
    $fe$jscomp$6$$.element == $element$jscomp$183$$ && ($JSCompiler_StaticMethods_removeElement_$self$$.$vsync_$.$mutate$(function() {
      _.$setStyle$$module$src$style$$($element$jscomp$183$$, "top", "");
    }), $JSCompiler_StaticMethods_removeElement_$self$$.$elements_$.splice($i$jscomp$119$$, 1), $removed$jscomp$2$$.push($fe$jscomp$6$$));
  }
  return $removed$jscomp$2$$;
};
_.$JSCompiler_StaticMethods_sortInDomOrder_$$ = function($JSCompiler_StaticMethods_sortInDomOrder_$self$$) {
  $JSCompiler_StaticMethods_sortInDomOrder_$self$$.$elements_$.sort(function($JSCompiler_StaticMethods_sortInDomOrder_$self$$, $element2$jscomp$inline_1607_fe2$$) {
    $JSCompiler_StaticMethods_sortInDomOrder_$self$$ = $JSCompiler_StaticMethods_sortInDomOrder_$self$$.element;
    $element2$jscomp$inline_1607_fe2$$ = $element2$jscomp$inline_1607_fe2$$.element;
    return $JSCompiler_StaticMethods_sortInDomOrder_$self$$ === $element2$jscomp$inline_1607_fe2$$ ? 0 : $JSCompiler_StaticMethods_sortInDomOrder_$self$$.compareDocumentPosition($element2$jscomp$inline_1607_fe2$$) & $PRECEDING_OR_CONTAINS$$module$src$dom$$ ? 1 : -1;
  });
};
$JSCompiler_StaticMethods_getTransferLayer_$$ = function($JSCompiler_StaticMethods_getTransferLayer_$self$$) {
  if (!$JSCompiler_StaticMethods_getTransferLayer_$self$$.$G$ || $JSCompiler_StaticMethods_getTransferLayer_$self$$.$D$) {
    return $JSCompiler_StaticMethods_getTransferLayer_$self$$.$D$;
  }
  var $doc$jscomp$34$$ = $JSCompiler_StaticMethods_getTransferLayer_$self$$.ampdoc.$win$.document;
  $JSCompiler_StaticMethods_getTransferLayer_$self$$.$D$ = $doc$jscomp$34$$.body.shadowRoot ? new _.$TransferLayerShadow$$module$src$service$fixed_layer$$($doc$jscomp$34$$) : new _.$TransferLayerBody$$module$src$service$fixed_layer$$($doc$jscomp$34$$);
  return $JSCompiler_StaticMethods_getTransferLayer_$self$$.$D$;
};
$JSCompiler_StaticMethods_discoverSelectors_$$ = function($JSCompiler_StaticMethods_discoverSelectors_$self$$, $rules$$, $foundSelectors$$, $stickySelectors$jscomp$3$$) {
  for (var $i$jscomp$120$$ = 0; $i$jscomp$120$$ < $rules$$.length; $i$jscomp$120$$++) {
    var $position$jscomp$5_rule$jscomp$2$$ = $rules$$[$i$jscomp$120$$];
    if (4 == $position$jscomp$5_rule$jscomp$2$$.type || 12 == $position$jscomp$5_rule$jscomp$2$$.type) {
      $JSCompiler_StaticMethods_discoverSelectors_$$($JSCompiler_StaticMethods_discoverSelectors_$self$$, $position$jscomp$5_rule$jscomp$2$$.cssRules, $foundSelectors$$, $stickySelectors$jscomp$3$$);
    } else {
      if (1 == $position$jscomp$5_rule$jscomp$2$$.type) {
        var $selectorText$$ = $position$jscomp$5_rule$jscomp$2$$.selectorText;
        $position$jscomp$5_rule$jscomp$2$$ = $position$jscomp$5_rule$jscomp$2$$.style.position;
        "*" !== $selectorText$$ && $position$jscomp$5_rule$jscomp$2$$ && ("fixed" === $position$jscomp$5_rule$jscomp$2$$ ? $foundSelectors$$.push($selectorText$$) : _.$endsWith$$module$src$string$$($position$jscomp$5_rule$jscomp$2$$, "sticky") && $stickySelectors$jscomp$3$$.push($selectorText$$));
      }
    }
  }
};
_.$TransferLayerBody$$module$src$service$fixed_layer$$ = function($doc$jscomp$35$$) {
  this.$doc_$ = $doc$jscomp$35$$;
  this.$D$ = $doc$jscomp$35$$.body.cloneNode(!1);
  this.$D$.removeAttribute("style");
  _.$setStyles$$module$src$style$$(this.$D$, {position:"absolute", top:0, left:0, height:0, width:0, pointerEvents:"none", overflow:"hidden", animation:"none", background:"none", border:"none", borderImage:"none", boxSizing:"border-box", boxShadow:"none", $float$:"none", margin:0, opacity:1, outline:"none", padding:"none", transform:"none", transition:"none", visibility:"visible"});
  _.$setInitialDisplay$$module$src$style$$(this.$D$);
  $doc$jscomp$35$$.documentElement.appendChild(this.$D$);
};
_.$TransferLayerShadow$$module$src$service$fixed_layer$$ = function($doc$jscomp$36$$) {
  this.$D$ = $doc$jscomp$36$$.createElement("div");
  this.$D$.id = "i-amphtml-fixed-layer";
  _.$setImportantStyles$$module$src$style$$(this.$D$, {position:"absolute", top:0, left:0, height:0, width:0, overflow:"hidden"});
  var $slot$$ = $doc$jscomp$36$$.createElement("slot");
  $slot$$.setAttribute("name", "i-amphtml-fixed");
  this.$D$.appendChild($slot$$);
  $doc$jscomp$36$$.body.shadowRoot.appendChild(this.$D$);
};
_.$ViewportBindingIosEmbedShadowRoot_$$module$src$service$viewport$viewport_binding_ios_embed_sd$$ = function($scroller_win$jscomp$191$$) {
  var $$jscomp$this$jscomp$137$$ = this;
  this.$win$ = $scroller_win$jscomp$191$$;
  this.$vsync_$ = _.$Services$$module$src$services$vsyncFor$$($scroller_win$jscomp$191$$);
  var $doc$jscomp$37$$ = this.$win$.document, $documentElement$jscomp$3$$ = $doc$jscomp$37$$.documentElement;
  $documentElement$jscomp$3$$.classList.add("i-amphtml-ios-embed-sd");
  _.$isExperimentOn$$module$src$experiments$$($scroller_win$jscomp$191$$, "scroll-height-minheight") && $documentElement$jscomp$3$$.classList.add("i-amphtml-body-minheight");
  this.$D$ = $scroller_win$jscomp$191$$ = _.$htmlFor$$module$src$static_template$$($doc$jscomp$37$$)($_template$$module$src$service$viewport$viewport_binding_ios_embed_sd$$);
  this.$F$ = $scroller_win$jscomp$191$$.firstElementChild;
  _.$setInitialDisplay$$module$src$style$$(this.$D$);
  _.$setImportantStyles$$module$src$style$$(this.$D$, {"overflow-x":"hidden", "overflow-y":"auto", position:"absolute", top:"0", left:"0", right:"0", bottom:"0", margin:"0", width:"100%", "box-sizing":"border-box", "padding-top":"0px", "border-top":"1px solid transparent"});
  _.$setImportantStyles$$module$src$style$$(this.$F$, {overflow:"visible", position:"relative", "will-change":"transform"});
  this.$P$ = new _.$Observable$$module$src$observable$$;
  this.$O$ = new _.$Observable$$module$src$observable$$;
  this.$J$ = this.$ViewportBindingIosEmbedShadowRoot_$$module$src$service$viewport$viewport_binding_ios_embed_sd_prototype$onScrolled_$.bind(this);
  this.$I$ = this.$onResized_$.bind(this);
  this.$useLayers_$ = _.$isExperimentOn$$module$src$experiments$$(this.$win$, "layers");
  this.$K$ = 0;
  this.$R$ = this.$G$ = !1;
  $waitForBody$$module$src$dom$$($doc$jscomp$37$$, this.$ViewportBindingIosEmbedShadowRoot_$$module$src$service$viewport$viewport_binding_ios_embed_sd_prototype$setup_$.bind(this));
  _.$whenDocumentReady$$module$src$document_ready$$($doc$jscomp$37$$).then(function() {
    $$jscomp$this$jscomp$137$$.$D$.classList.add("i-amphtml-ios-overscroll");
    _.$setImportantStyles$$module$src$style$$($$jscomp$this$jscomp$137$$.$D$, {"-webkit-overflow-scrolling":"touch"});
  });
  "Viewport";
};
_.$ViewportBindingIosEmbedWrapper_$$module$src$service$viewport$viewport_binding_ios_embed_wrapper$$ = function($win$jscomp$192$$) {
  var $$jscomp$this$jscomp$140$$ = this;
  this.$win$ = $win$jscomp$192$$;
  this.$vsync_$ = _.$Services$$module$src$services$vsyncFor$$($win$jscomp$192$$);
  var $doc$jscomp$39$$ = this.$win$.document, $documentElement$jscomp$4$$ = $doc$jscomp$39$$.documentElement, $topClasses$$ = $documentElement$jscomp$4$$.className;
  $documentElement$jscomp$4$$.classList.add("i-amphtml-ios-embed");
  var $wrapper$jscomp$1$$ = $doc$jscomp$39$$.createElement("html");
  this.$D$ = $wrapper$jscomp$1$$;
  $wrapper$jscomp$1$$.id = "i-amphtml-wrapper";
  $wrapper$jscomp$1$$.className = $topClasses$$;
  _.$isExperimentOn$$module$src$experiments$$($win$jscomp$192$$, "scroll-height-minheight") && $wrapper$jscomp$1$$.classList.add("i-amphtml-body-minheight");
  this.$K$ = new _.$Observable$$module$src$observable$$;
  this.$J$ = new _.$Observable$$module$src$observable$$;
  this.$G$ = this.$ViewportBindingIosEmbedWrapper_$$module$src$service$viewport$viewport_binding_ios_embed_wrapper_prototype$onScrolled_$.bind(this);
  this.$F$ = function() {
    return $$jscomp$this$jscomp$140$$.$J$.$fire$();
  };
  this.$useLayers_$ = _.$isExperimentOn$$module$src$experiments$$(this.$win$, "layers");
  this.$I$ = 0;
  this.$O$ = !1;
  $waitForBody$$module$src$dom$$($doc$jscomp$39$$, this.$ViewportBindingIosEmbedWrapper_$$module$src$service$viewport$viewport_binding_ios_embed_wrapper_prototype$setup_$.bind(this));
  _.$whenDocumentReady$$module$src$document_ready$$($doc$jscomp$39$$).then(function() {
    $documentElement$jscomp$4$$.classList.add("i-amphtml-ios-overscroll");
  });
  "Viewport";
};
_.$ViewportBindingNatural_$$module$src$service$viewport$viewport_binding_natural$$ = function($ampdoc$jscomp$71$$) {
  var $$jscomp$this$jscomp$142$$ = this;
  this.ampdoc = $ampdoc$jscomp$71$$;
  this.$win$ = $ampdoc$jscomp$71$$.$win$;
  this.$platform_$ = _.$Services$$module$src$services$platformFor$$(this.$win$);
  this.$J$ = new _.$Observable$$module$src$observable$$;
  this.$I$ = new _.$Observable$$module$src$observable$$;
  this.$F$ = function() {
    $$jscomp$this$jscomp$142$$.$J$.$fire$();
  };
  this.$D$ = function() {
    return $$jscomp$this$jscomp$142$$.$I$.$fire$();
  };
  this.$useLayers_$ = _.$isExperimentOn$$module$src$experiments$$(this.$win$, "layers");
  this.$G$ = 0;
  "Viewport";
};
_.$Viewport$$module$src$service$viewport$viewport_impl$$ = function($ampdoc$jscomp$72$$, $binding$jscomp$8$$, $viewer$jscomp$20$$) {
  var $$jscomp$this$jscomp$143$$ = this;
  this.ampdoc = $ampdoc$jscomp$72$$;
  this.$J$ = this.ampdoc.$win$.document;
  this.$D$ = $binding$jscomp$8$$;
  this.$viewer_$ = $viewer$jscomp$20$$;
  this.$I$ = this.$size_$ = this.$O$ = null;
  this.$V$ = !1;
  this.$R$ = null;
  this.$F$ = Number($viewer$jscomp$20$$.$params_$.paddingTop || 0);
  this.$U$ = 0;
  this.$timer_$ = _.$Services$$module$src$services$timerFor$$(this.ampdoc.$win$);
  this.$vsync_$ = _.$Services$$module$src$services$vsyncFor$$(this.ampdoc.$win$);
  this.$W$ = !1;
  this.$ba$ = new _.$Observable$$module$src$observable$$;
  this.$aa$ = new _.$Observable$$module$src$observable$$;
  this.$Y$ = new _.$Observable$$module$src$observable$$;
  this.$K$ = this.$P$ = void 0;
  (this.$useLayers_$ = _.$isExperimentOn$$module$src$experiments$$(this.ampdoc.$win$, "layers")) && $installLayersServiceForDoc$$module$src$service$layers_impl$$(this.ampdoc, this.$D$.$ViewportBindingDef$$module$src$service$viewport$viewport_binding_def_prototype$getScrollingElement$(), this.$D$.$getScrollingElementScrollsLikeViewport$());
  this.$G$ = new $FixedLayer$$module$src$service$fixed_layer$$(this.ampdoc, this.$vsync_$, this.$D$.$getBorderTop$(), this.$F$, this.$D$.$requiresFixedLayerTransfer$());
  this.ampdoc.$whenReady$().then(function() {
    a: {
      var $ampdoc$jscomp$72$$ = $$jscomp$this$jscomp$143$$.$G$;
      var $binding$jscomp$8$$ = $ampdoc$jscomp$72$$.ampdoc.getRootNode().styleSheets;
      if ($binding$jscomp$8$$) {
        for (var $viewer$jscomp$20$$ = [], $platform$jscomp$inline_1623_stickySelectors$jscomp$inline_1619$$ = [], $i$jscomp$inline_1620_j$jscomp$inline_5787$$ = 0; $i$jscomp$inline_1620_j$jscomp$inline_5787$$ < $binding$jscomp$8$$.length; $i$jscomp$inline_1620_j$jscomp$inline_5787$$++) {
          var $stylesheet$jscomp$inline_1621$$ = $binding$jscomp$8$$[$i$jscomp$inline_1620_j$jscomp$inline_5787$$];
          if (!$stylesheet$jscomp$inline_1621$$) {
            _.$dev$$module$src$log$$().error("FixedLayer", "Aborting setup due to null stylesheet.");
            $ampdoc$jscomp$72$$ = void 0;
            break a;
          }
          var $ownerNode$jscomp$inline_1622$$ = $stylesheet$jscomp$inline_1621$$.ownerNode;
          $stylesheet$jscomp$inline_1621$$.disabled || !$ownerNode$jscomp$inline_1622$$ || "STYLE" != $ownerNode$jscomp$inline_1622$$.tagName || $ownerNode$jscomp$inline_1622$$.hasAttribute("amp-boilerplate") || $ownerNode$jscomp$inline_1622$$.hasAttribute("amp-runtime") || $ownerNode$jscomp$inline_1622$$.hasAttribute("amp-extension") || $JSCompiler_StaticMethods_discoverSelectors_$$($ampdoc$jscomp$72$$, $stylesheet$jscomp$inline_1621$$.cssRules, $viewer$jscomp$20$$, $platform$jscomp$inline_1623_stickySelectors$jscomp$inline_1619$$);
        }
        try {
          for ($binding$jscomp$8$$ = 0; $binding$jscomp$8$$ < $viewer$jscomp$20$$.length; $binding$jscomp$8$$++) {
            var $fixedSelector$jscomp$inline_5785_j$175$jscomp$inline_5791$$ = $viewer$jscomp$20$$[$binding$jscomp$8$$], $elements$jscomp$inline_5786$$ = $ampdoc$jscomp$72$$.ampdoc.getRootNode().querySelectorAll($fixedSelector$jscomp$inline_5785_j$175$jscomp$inline_5791$$);
            for ($i$jscomp$inline_1620_j$jscomp$inline_5787$$ = 0; $i$jscomp$inline_1620_j$jscomp$inline_5787$$ < $elements$jscomp$inline_5786$$.length && !(10 < $ampdoc$jscomp$72$$.$elements_$.length); $i$jscomp$inline_1620_j$jscomp$inline_5787$$++) {
              _.$JSCompiler_StaticMethods_setupElement_$$($ampdoc$jscomp$72$$, $elements$jscomp$inline_5786$$[$i$jscomp$inline_1620_j$jscomp$inline_5787$$], $fixedSelector$jscomp$inline_5785_j$175$jscomp$inline_5791$$, "fixed");
            }
          }
          for ($viewer$jscomp$20$$ = 0; $viewer$jscomp$20$$ < $platform$jscomp$inline_1623_stickySelectors$jscomp$inline_1619$$.length; $viewer$jscomp$20$$++) {
            var $stickySelector$jscomp$inline_5789$$ = $platform$jscomp$inline_1623_stickySelectors$jscomp$inline_1619$$[$viewer$jscomp$20$$], $elements$174$jscomp$inline_5790$$ = $ampdoc$jscomp$72$$.ampdoc.getRootNode().querySelectorAll($stickySelector$jscomp$inline_5789$$);
            for ($fixedSelector$jscomp$inline_5785_j$175$jscomp$inline_5791$$ = 0; $fixedSelector$jscomp$inline_5785_j$175$jscomp$inline_5791$$ < $elements$174$jscomp$inline_5790$$.length; $fixedSelector$jscomp$inline_5785_j$175$jscomp$inline_5791$$++) {
              _.$JSCompiler_StaticMethods_setupElement_$$($ampdoc$jscomp$72$$, $elements$174$jscomp$inline_5790$$[$fixedSelector$jscomp$inline_5785_j$175$jscomp$inline_5791$$], $stickySelector$jscomp$inline_5789$$, "sticky");
            }
          }
        } catch ($e$jscomp$inline_5792$$) {
          _.$dev$$module$src$log$$().error("FixedLayer", "Failed to setup fixed elements:", $e$jscomp$inline_5792$$);
        }
        _.$JSCompiler_StaticMethods_sortInDomOrder_$$($ampdoc$jscomp$72$$);
        0 < $ampdoc$jscomp$72$$.$elements_$.length && _.$JSCompiler_StaticMethods_observeHiddenMutations$$($ampdoc$jscomp$72$$);
        $platform$jscomp$inline_1623_stickySelectors$jscomp$inline_1619$$ = _.$Services$$module$src$services$platformFor$$($ampdoc$jscomp$72$$.ampdoc.$win$);
        0 < $ampdoc$jscomp$72$$.$elements_$.length && !$ampdoc$jscomp$72$$.$G$ && _.$JSCompiler_StaticMethods_isIos$$($platform$jscomp$inline_1623_stickySelectors$jscomp$inline_1619$$) && _.$user$$module$src$log$$().$Log$$module$src$log_prototype$warn$("FixedLayer", "Please test this page inside of an AMP Viewer such as Google's because the fixed or sticky positioning might have slightly different layout.");
        $ampdoc$jscomp$72$$.update();
      }
      $ampdoc$jscomp$72$$ = void 0;
    }
    return $ampdoc$jscomp$72$$;
  });
  this.$viewer_$.$onMessage$("viewport", this.$updateOnViewportEvent_$.bind(this));
  this.$viewer_$.$onMessage$("scroll", this.$viewerSetScrollTop_$.bind(this));
  this.$viewer_$.$onMessage$("disableScroll", this.$disableScrollEventHandler_$.bind(this));
  this.$D$.$ViewportBindingDef$$module$src$service$viewport$viewport_binding_def_prototype$updatePaddingTop$(this.$F$);
  this.$D$.$ViewportBindingDef$$module$src$service$viewport$viewport_binding_def_prototype$onScroll$(this.$scroll_$.bind(this));
  this.$D$.$ViewportBindingDef$$module$src$service$viewport$viewport_binding_def_prototype$onResize$(this.$resize_$.bind(this));
  _.$JSCompiler_StaticMethods_Viewport$$module$src$service$viewport$viewport_impl_prototype$onScroll$$(this, this.$sendScrollMessage_$.bind(this));
  this.$visible_$ = !1;
  _.$JSCompiler_StaticMethods_Viewer$$module$src$service$viewer_impl_prototype$onVisibilityChanged$$(this.$viewer_$, this.$Viewport$$module$src$service$viewport$viewport_impl_prototype$updateVisibility_$.bind(this));
  this.$Viewport$$module$src$service$viewport$viewport_impl_prototype$updateVisibility_$();
  this.ampdoc.$isSingleDoc$() && this.$J$.documentElement.classList.add("i-amphtml-singledoc");
  $viewer$jscomp$20$$.$F$ ? this.$J$.documentElement.classList.add("i-amphtml-embedded") : this.$J$.documentElement.classList.add("i-amphtml-standalone");
  _.$isIframed$$module$src$dom$$(this.ampdoc.$win$) && this.$J$.documentElement.classList.add("i-amphtml-iframed");
  "1" === $viewer$jscomp$20$$.$params_$.webview && this.$J$.documentElement.classList.add("i-amphtml-webview");
  _.$isIframed$$module$src$dom$$(this.ampdoc.$win$) && "scrollRestoration" in this.ampdoc.$win$.history && (this.ampdoc.$win$.history.scrollRestoration = "manual");
};
_.$JSCompiler_StaticMethods_Viewport$$module$src$service$viewport$viewport_impl_prototype$getScrollTop$$ = function($JSCompiler_StaticMethods_Viewport$$module$src$service$viewport$viewport_impl_prototype$getScrollTop$self$$) {
  null == $JSCompiler_StaticMethods_Viewport$$module$src$service$viewport$viewport_impl_prototype$getScrollTop$self$$.$I$ && ($JSCompiler_StaticMethods_Viewport$$module$src$service$viewport$viewport_impl_prototype$getScrollTop$self$$.$I$ = $JSCompiler_StaticMethods_Viewport$$module$src$service$viewport$viewport_impl_prototype$getScrollTop$self$$.$D$.$ViewportBindingDef$$module$src$service$viewport$viewport_binding_def_prototype$getScrollTop$());
  return $JSCompiler_StaticMethods_Viewport$$module$src$service$viewport$viewport_impl_prototype$getScrollTop$self$$.$I$;
};
_.$JSCompiler_StaticMethods_Viewport$$module$src$service$viewport$viewport_impl_prototype$setScrollTop$$ = function($JSCompiler_StaticMethods_Viewport$$module$src$service$viewport$viewport_impl_prototype$setScrollTop$self$$, $scrollPos$$) {
  $JSCompiler_StaticMethods_Viewport$$module$src$service$viewport$viewport_impl_prototype$setScrollTop$self$$.$I$ = null;
  $JSCompiler_StaticMethods_Viewport$$module$src$service$viewport$viewport_impl_prototype$setScrollTop$self$$.$D$.$ViewportBindingDef$$module$src$service$viewport$viewport_binding_def_prototype$setScrollTop$($scrollPos$$);
};
_.$JSCompiler_StaticMethods_getHeight$$ = function($JSCompiler_StaticMethods_getHeight$self$$) {
  return $JSCompiler_StaticMethods_getHeight$self$$.$getSize$().height;
};
_.$JSCompiler_StaticMethods_getRect$$ = function($JSCompiler_StaticMethods_getRect$self$$) {
  if (null == $JSCompiler_StaticMethods_getRect$self$$.$O$) {
    var $scrollTop$jscomp$7$$ = 0, $scrollLeft$jscomp$4$$ = 0;
    $JSCompiler_StaticMethods_getRect$self$$.$useLayers_$ || ($scrollTop$jscomp$7$$ = _.$JSCompiler_StaticMethods_Viewport$$module$src$service$viewport$viewport_impl_prototype$getScrollTop$$($JSCompiler_StaticMethods_getRect$self$$), $scrollLeft$jscomp$4$$ = $JSCompiler_StaticMethods_getRect$self$$.getScrollLeft());
    var $size$jscomp$15$$ = $JSCompiler_StaticMethods_getRect$self$$.$getSize$();
    $JSCompiler_StaticMethods_getRect$self$$.$O$ = _.$layoutRectLtwh$$module$src$layout_rect$$($scrollLeft$jscomp$4$$, $scrollTop$jscomp$7$$, $size$jscomp$15$$.width, $size$jscomp$15$$.height);
  }
  return $JSCompiler_StaticMethods_getRect$self$$.$O$;
};
$JSCompiler_StaticMethods_Viewport$$module$src$service$viewport$viewport_impl_prototype$scrollIntoView$$ = function($JSCompiler_StaticMethods_Viewport$$module$src$service$viewport$viewport_impl_prototype$scrollIntoView$self$$, $element$jscomp$189$$) {
  return $JSCompiler_StaticMethods_getScrollingContainerFor_$$($JSCompiler_StaticMethods_Viewport$$module$src$service$viewport$viewport_impl_prototype$scrollIntoView$self$$, $element$jscomp$189$$).then(function($parent$jscomp$31$$) {
    return $JSCompiler_StaticMethods_scrollIntoViewInternal_$$($JSCompiler_StaticMethods_Viewport$$module$src$service$viewport$viewport_impl_prototype$scrollIntoView$self$$, $element$jscomp$189$$, $parent$jscomp$31$$);
  });
};
$JSCompiler_StaticMethods_scrollIntoViewInternal_$$ = function($JSCompiler_StaticMethods_scrollIntoViewInternal_$self$$, $element$jscomp$190$$, $parent$jscomp$32$$) {
  var $elementTop$$ = $JSCompiler_StaticMethods_scrollIntoViewInternal_$self$$.$D$.$getLayoutRect$($element$jscomp$190$$).top;
  ($JSCompiler_StaticMethods_scrollIntoViewInternal_$self$$.$useLayers_$ ? $JSCompiler_StaticMethods_getElementScrollTop_$$($JSCompiler_StaticMethods_scrollIntoViewInternal_$self$$, $parent$jscomp$32$$).then(function($JSCompiler_StaticMethods_scrollIntoViewInternal_$self$$) {
    return $elementTop$$ + $JSCompiler_StaticMethods_scrollIntoViewInternal_$self$$;
  }) : _.$tryResolve$$module$src$utils$promise$$(function() {
    return Math.max(0, $elementTop$$ - $JSCompiler_StaticMethods_scrollIntoViewInternal_$self$$.$F$);
  })).then(function($element$jscomp$190$$) {
    return $JSCompiler_StaticMethods_setElementScrollTop_$$($JSCompiler_StaticMethods_scrollIntoViewInternal_$self$$, $parent$jscomp$32$$, $element$jscomp$190$$);
  });
};
_.$JSCompiler_StaticMethods_animateScrollIntoView$$ = function($JSCompiler_StaticMethods_animateScrollIntoView$self$$, $element$jscomp$191$$, $duration$jscomp$6$$, $curve$jscomp$3$$, $pos$jscomp$6$$) {
  $duration$jscomp$6$$ = void 0 === $duration$jscomp$6$$ ? 500 : $duration$jscomp$6$$;
  $curve$jscomp$3$$ = void 0 === $curve$jscomp$3$$ ? "ease-in" : $curve$jscomp$3$$;
  $pos$jscomp$6$$ = void 0 === $pos$jscomp$6$$ ? "top" : $pos$jscomp$6$$;
  return $JSCompiler_StaticMethods_getScrollingContainerFor_$$($JSCompiler_StaticMethods_animateScrollIntoView$self$$, $element$jscomp$191$$).then(function($parent$jscomp$33$$) {
    return $JSCompiler_StaticMethods_animateScrollIntoViewInternal_$$($JSCompiler_StaticMethods_animateScrollIntoView$self$$, $element$jscomp$191$$, $parent$jscomp$33$$, $duration$jscomp$6$$, $curve$jscomp$3$$, $pos$jscomp$6$$);
  });
};
$JSCompiler_StaticMethods_animateScrollIntoViewInternal_$$ = function($JSCompiler_StaticMethods_animateScrollIntoViewInternal_$self$$, $element$jscomp$192_parentHeight$jscomp$2$$, $parent$jscomp$34$$, $duration$jscomp$7$$, $curve$jscomp$4$$, $pos$jscomp$7$$) {
  var $elementRect$jscomp$1$$ = $JSCompiler_StaticMethods_animateScrollIntoViewInternal_$self$$.$D$.$getLayoutRect$($element$jscomp$192_parentHeight$jscomp$2$$);
  $element$jscomp$192_parentHeight$jscomp$2$$ = ($parent$jscomp$34$$ == $JSCompiler_StaticMethods_animateScrollIntoViewInternal_$self$$.$D$.$ViewportBindingDef$$module$src$service$viewport$viewport_binding_def_prototype$getScrollingElement$() ? $JSCompiler_StaticMethods_animateScrollIntoViewInternal_$self$$.$getSize$() : $JSCompiler_StaticMethods_animateScrollIntoViewInternal_$self$$.$getLayoutRect$($parent$jscomp$34$$)).height;
  switch($pos$jscomp$7$$) {
    case "bottom":
      var $offset$jscomp$14$$ = -$element$jscomp$192_parentHeight$jscomp$2$$ + $elementRect$jscomp$1$$.height;
      break;
    case "center":
      $offset$jscomp$14$$ = -$element$jscomp$192_parentHeight$jscomp$2$$ / 2 + $elementRect$jscomp$1$$.height / 2;
      break;
    default:
      $offset$jscomp$14$$ = 0;
  }
  return $JSCompiler_StaticMethods_getElementScrollTop_$$($JSCompiler_StaticMethods_animateScrollIntoViewInternal_$self$$, $parent$jscomp$34$$).then(function($element$jscomp$192_parentHeight$jscomp$2$$) {
    var $pos$jscomp$7$$ = $JSCompiler_StaticMethods_animateScrollIntoViewInternal_$self$$.$useLayers_$ ? Math.max(0, $elementRect$jscomp$1$$.top + $offset$jscomp$14$$ + $element$jscomp$192_parentHeight$jscomp$2$$) : Math.max(0, $elementRect$jscomp$1$$.top - $JSCompiler_StaticMethods_animateScrollIntoViewInternal_$self$$.$F$ + $offset$jscomp$14$$);
    if ($pos$jscomp$7$$ != $element$jscomp$192_parentHeight$jscomp$2$$) {
      return $JSCompiler_StaticMethods_interpolateScrollIntoView_$$($JSCompiler_StaticMethods_animateScrollIntoViewInternal_$self$$, $parent$jscomp$34$$, $element$jscomp$192_parentHeight$jscomp$2$$, $pos$jscomp$7$$, $duration$jscomp$7$$, $curve$jscomp$4$$);
    }
  });
};
$JSCompiler_StaticMethods_interpolateScrollIntoView_$$ = function($JSCompiler_StaticMethods_interpolateScrollIntoView_$self$$, $parent$jscomp$35$$, $curScrollTop$jscomp$1$$, $newScrollTop$jscomp$2$$, $duration$jscomp$8$$, $curve$jscomp$5$$) {
  var $interpolate$$ = _.$numeric$$module$src$transition$$($curScrollTop$jscomp$1$$, $newScrollTop$jscomp$2$$);
  return _.$JSCompiler_StaticMethods_AnimationPlayer$$module$src$animation_prototype$thenAlways$$(_.$Animation$$module$src$animation$animate$$($parent$jscomp$35$$, function($curScrollTop$jscomp$1$$) {
    $JSCompiler_StaticMethods_setElementScrollTop_$$($JSCompiler_StaticMethods_interpolateScrollIntoView_$self$$, $parent$jscomp$35$$, $interpolate$$($curScrollTop$jscomp$1$$));
  }, $duration$jscomp$8$$, $curve$jscomp$5$$), function() {
    $JSCompiler_StaticMethods_setElementScrollTop_$$($JSCompiler_StaticMethods_interpolateScrollIntoView_$self$$, $parent$jscomp$35$$, $newScrollTop$jscomp$2$$);
  });
};
$JSCompiler_StaticMethods_getScrollingContainerFor_$$ = function($JSCompiler_StaticMethods_getScrollingContainerFor_$self$$, $element$jscomp$193$$) {
  return _.$JSCompiler_StaticMethods_measurePromise$$($JSCompiler_StaticMethods_getScrollingContainerFor_$self$$.$vsync_$, function() {
    return _.$closestBySelector$$module$src$dom$$($element$jscomp$193$$, ".i-amphtml-scrollable") || $JSCompiler_StaticMethods_getScrollingContainerFor_$self$$.$D$.$ViewportBindingDef$$module$src$service$viewport$viewport_binding_def_prototype$getScrollingElement$();
  });
};
$JSCompiler_StaticMethods_setElementScrollTop_$$ = function($JSCompiler_StaticMethods_setElementScrollTop_$self$$, $element$jscomp$194$$, $scrollTop$jscomp$10$$) {
  $element$jscomp$194$$ == $JSCompiler_StaticMethods_setElementScrollTop_$self$$.$D$.$ViewportBindingDef$$module$src$service$viewport$viewport_binding_def_prototype$getScrollingElement$() ? $JSCompiler_StaticMethods_setElementScrollTop_$self$$.$D$.$ViewportBindingDef$$module$src$service$viewport$viewport_binding_def_prototype$setScrollTop$($scrollTop$jscomp$10$$) : $JSCompiler_StaticMethods_setElementScrollTop_$self$$.$vsync_$.$mutate$(function() {
    $element$jscomp$194$$.scrollTop = $scrollTop$jscomp$10$$;
  });
};
$JSCompiler_StaticMethods_getElementScrollTop_$$ = function($JSCompiler_StaticMethods_getElementScrollTop_$self$$, $element$jscomp$195$$) {
  return $element$jscomp$195$$ == $JSCompiler_StaticMethods_getElementScrollTop_$self$$.$D$.$ViewportBindingDef$$module$src$service$viewport$viewport_binding_def_prototype$getScrollingElement$() ? _.$tryResolve$$module$src$utils$promise$$(function() {
    return _.$JSCompiler_StaticMethods_Viewport$$module$src$service$viewport$viewport_impl_prototype$getScrollTop$$($JSCompiler_StaticMethods_getElementScrollTop_$self$$);
  }) : _.$JSCompiler_StaticMethods_measurePromise$$($JSCompiler_StaticMethods_getElementScrollTop_$self$$.$vsync_$, function() {
    return $element$jscomp$195$$.scrollTop;
  });
};
_.$JSCompiler_StaticMethods_onChanged$$ = function($JSCompiler_StaticMethods_onChanged$self$$, $handler$jscomp$28$$) {
  return $JSCompiler_StaticMethods_onChanged$self$$.$ba$.add($handler$jscomp$28$$);
};
_.$JSCompiler_StaticMethods_Viewport$$module$src$service$viewport$viewport_impl_prototype$onScroll$$ = function($JSCompiler_StaticMethods_Viewport$$module$src$service$viewport$viewport_impl_prototype$onScroll$self$$, $handler$jscomp$29$$) {
  return $JSCompiler_StaticMethods_Viewport$$module$src$service$viewport$viewport_impl_prototype$onScroll$self$$.$aa$.add($handler$jscomp$29$$);
};
_.$JSCompiler_StaticMethods_Viewport$$module$src$service$viewport$viewport_impl_prototype$disableScroll$$ = function($JSCompiler_StaticMethods_Viewport$$module$src$service$viewport$viewport_impl_prototype$disableScroll$self$$) {
  $JSCompiler_StaticMethods_Viewport$$module$src$service$viewport$viewport_impl_prototype$disableScroll$self$$.$vsync_$.$mutate$(function() {
    $JSCompiler_StaticMethods_Viewport$$module$src$service$viewport$viewport_impl_prototype$disableScroll$self$$.$D$.$ViewportBindingDef$$module$src$service$viewport$viewport_binding_def_prototype$disableScroll$();
  });
};
$JSCompiler_StaticMethods_animateFixedElements_$$ = function($JSCompiler_StaticMethods_animateFixedElements_$self$$, $duration$jscomp$10$$, $curve$jscomp$7$$, $transient$jscomp$7$$) {
  $JSCompiler_StaticMethods_FixedLayer$$module$src$service$fixed_layer_prototype$updatePaddingTop$$($JSCompiler_StaticMethods_animateFixedElements_$self$$.$G$, $JSCompiler_StaticMethods_animateFixedElements_$self$$.$F$, $transient$jscomp$7$$);
  if (0 >= $duration$jscomp$10$$) {
    return window.Promise.resolve();
  }
  var $tr$jscomp$2$$ = _.$numeric$$module$src$transition$$($JSCompiler_StaticMethods_animateFixedElements_$self$$.$U$ - $JSCompiler_StaticMethods_animateFixedElements_$self$$.$F$, 0);
  return _.$JSCompiler_StaticMethods_AnimationPlayer$$module$src$animation_prototype$thenAlways$$(_.$Animation$$module$src$animation$animate$$($JSCompiler_StaticMethods_animateFixedElements_$self$$.ampdoc.getRootNode(), function($duration$jscomp$10$$) {
    $duration$jscomp$10$$ = $tr$jscomp$2$$($duration$jscomp$10$$);
    $JSCompiler_StaticMethods_transformMutate$$($JSCompiler_StaticMethods_animateFixedElements_$self$$.$G$, "translateY(" + $duration$jscomp$10$$ + "px)");
  }, $duration$jscomp$10$$, $curve$jscomp$7$$), function() {
    $JSCompiler_StaticMethods_transformMutate$$($JSCompiler_StaticMethods_animateFixedElements_$self$$.$G$, null);
  });
};
$JSCompiler_StaticMethods_changed_$$ = function($JSCompiler_StaticMethods_changed_$self$$, $relayoutAll$jscomp$1$$, $velocity$$) {
  var $size$jscomp$16$$ = $JSCompiler_StaticMethods_changed_$self$$.$getSize$(), $scrollTop$jscomp$11$$ = _.$JSCompiler_StaticMethods_Viewport$$module$src$service$viewport$viewport_impl_prototype$getScrollTop$$($JSCompiler_StaticMethods_changed_$self$$), $scrollLeft$jscomp$6$$ = $JSCompiler_StaticMethods_changed_$self$$.getScrollLeft();
  "Viewport";
  $JSCompiler_StaticMethods_changed_$self$$.$ba$.$fire$({$relayoutAll$:$relayoutAll$jscomp$1$$, top:$scrollTop$jscomp$11$$, left:$scrollLeft$jscomp$6$$, width:$size$jscomp$16$$.width, height:$size$jscomp$16$$.height, $velocity$:$velocity$$});
};
$createViewport$$module$src$service$viewport$viewport_impl$$ = function($ampdoc$jscomp$73$$) {
  var $viewer$jscomp$21$$ = _.$Services$$module$src$services$viewerForDoc$$($ampdoc$jscomp$73$$), $binding$jscomp$9$$, $JSCompiler_temp$jscomp$519_win$jscomp$inline_1647$$;
  if ($JSCompiler_temp$jscomp$519_win$jscomp$inline_1647$$ = $ampdoc$jscomp$73$$.$isSingleDoc$()) {
    $JSCompiler_temp$jscomp$519_win$jscomp$inline_1647$$ = $ampdoc$jscomp$73$$.$win$;
    var $viewportType$jscomp$inline_1649$$ = $viewer$jscomp$21$$.$params_$.viewportType || $ViewportType$$module$src$service$viewport$viewport_impl$NATURAL$$;
    $JSCompiler_temp$jscomp$519_win$jscomp$inline_1647$$ = (_.$JSCompiler_StaticMethods_isIos$$(_.$Services$$module$src$services$platformFor$$($JSCompiler_temp$jscomp$519_win$jscomp$inline_1647$$)) && $viewportType$jscomp$inline_1649$$ == $ViewportType$$module$src$service$viewport$viewport_impl$NATURAL$$ ? !_.$isIframed$$module$src$dom$$($JSCompiler_temp$jscomp$519_win$jscomp$inline_1647$$) && _.$getMode$$module$src$mode$$($JSCompiler_temp$jscomp$519_win$jscomp$inline_1647$$).$development$ || _.$isIframed$$module$src$dom$$($JSCompiler_temp$jscomp$519_win$jscomp$inline_1647$$) && 
    $viewer$jscomp$21$$.$F$ ? $ViewportType$$module$src$service$viewport$viewport_impl$NATURAL_IOS_EMBED$$ : $viewportType$jscomp$inline_1649$$ : $viewportType$jscomp$inline_1649$$) == $ViewportType$$module$src$service$viewport$viewport_impl$NATURAL_IOS_EMBED$$;
  }
  $JSCompiler_temp$jscomp$519_win$jscomp$inline_1647$$ ? _.$isExperimentOn$$module$src$experiments$$($ampdoc$jscomp$73$$.$win$, "ios-embed-sd") && $ampdoc$jscomp$73$$.$win$.Element.prototype.attachShadow && 11 <= _.$JSCompiler_StaticMethods_getMajorVersion$$(_.$Services$$module$src$services$platformFor$$($ampdoc$jscomp$73$$.$win$)) ? $binding$jscomp$9$$ = new _.$ViewportBindingIosEmbedShadowRoot_$$module$src$service$viewport$viewport_binding_ios_embed_sd$$($ampdoc$jscomp$73$$.$win$) : $binding$jscomp$9$$ = 
  new _.$ViewportBindingIosEmbedWrapper_$$module$src$service$viewport$viewport_binding_ios_embed_wrapper$$($ampdoc$jscomp$73$$.$win$) : $binding$jscomp$9$$ = new _.$ViewportBindingNatural_$$module$src$service$viewport$viewport_binding_natural$$($ampdoc$jscomp$73$$);
  return new _.$Viewport$$module$src$service$viewport$viewport_impl$$($ampdoc$jscomp$73$$, $binding$jscomp$9$$, $viewer$jscomp$21$$);
};
$JankMeter$$module$src$service$jank_meter$$ = function($win$jscomp$194$$) {
  this.$D$ = $win$jscomp$194$$;
  this.$P$ = this.$O$ = this.$J$ = this.$K$ = 0;
  this.$I$ = null;
  this.$F$ = _.$Services$$module$src$services$performanceForOrNull$$($win$jscomp$194$$);
  this.$G$ = null;
  $JSCompiler_StaticMethods_initializeLongTaskObserver_$$(this);
};
$JSCompiler_StaticMethods_isEnabled_$$ = function($JSCompiler_StaticMethods_isEnabled_$self$$) {
  return _.$isExperimentOn$$module$src$experiments$$($JSCompiler_StaticMethods_isEnabled_$self$$.$D$, "jank-meter") || $JSCompiler_StaticMethods_isEnabled_$self$$.$F$ && $JSCompiler_StaticMethods_isEnabled_$self$$.$F$.$G$ && 200 > $JSCompiler_StaticMethods_isEnabled_$self$$.$J$;
};
$JSCompiler_StaticMethods_initializeLongTaskObserver_$$ = function($JSCompiler_StaticMethods_initializeLongTaskObserver_$self$$) {
  $JSCompiler_StaticMethods_isEnabled_$$($JSCompiler_StaticMethods_initializeLongTaskObserver_$self$$) && _.$isLongTaskApiSupported$$module$src$service$jank_meter$$($JSCompiler_StaticMethods_initializeLongTaskObserver_$self$$.$D$) && ($JSCompiler_StaticMethods_initializeLongTaskObserver_$self$$.$G$ = new $JSCompiler_StaticMethods_initializeLongTaskObserver_$self$$.$D$.PerformanceObserver(function($entries$jscomp$1_entryList$$) {
    $entries$jscomp$1_entryList$$ = $entries$jscomp$1_entryList$$.getEntries();
    for (var $i$jscomp$123$$ = 0; $i$jscomp$123$$ < $entries$jscomp$1_entryList$$.length; $i$jscomp$123$$++) {
      if ("longtask" == $entries$jscomp$1_entryList$$[$i$jscomp$123$$].entryType) {
        var $span$$ = $JSCompiler_StaticMethods_initializeLongTaskObserver_$self$$.$D$.Math.floor($entries$jscomp$1_entryList$$[$i$jscomp$123$$].duration / 50);
        "cross-origin-descendant" == $entries$jscomp$1_entryList$$[$i$jscomp$123$$].name ? ($JSCompiler_StaticMethods_initializeLongTaskObserver_$self$$.$O$ += $span$$, _.$user$$module$src$log$$().$Log$$module$src$log_prototype$info$("LONGTASK", "from child frame " + $entries$jscomp$1_entryList$$[$i$jscomp$123$$].duration + "ms")) : ($JSCompiler_StaticMethods_initializeLongTaskObserver_$self$$.$P$ += $span$$, _.$dev$$module$src$log$$().$Log$$module$src$log_prototype$info$("LONGTASK", "from self frame " + 
        $entries$jscomp$1_entryList$$[$i$jscomp$123$$].duration + "ms"));
      }
    }
  }), $JSCompiler_StaticMethods_initializeLongTaskObserver_$self$$.$G$.observe({entryTypes:["longtask"]}));
};
_.$isLongTaskApiSupported$$module$src$service$jank_meter$$ = function($win$jscomp$196$$) {
  return !!$win$jscomp$196$$.PerformanceObserver && !!$win$jscomp$196$$.TaskAttributionTiming && "containerName" in $win$jscomp$196$$.TaskAttributionTiming.prototype;
};
$Vsync$$module$src$service$vsync_impl$$ = function($win$jscomp$197$$) {
  var $$jscomp$this$jscomp$163$$ = this;
  this.$win$ = $win$jscomp$197$$;
  this.$G$ = _.$Services$$module$src$services$ampdocServiceFor$$(this.$win$);
  this.$V$ = _.$Services$$module$src$services$documentStateFor$$(this.$win$);
  this.$ea$ = $JSCompiler_StaticMethods_getRaf_$$(this);
  this.$I$ = [];
  this.$P$ = [];
  this.$U$ = [];
  this.$O$ = [];
  this.$D$ = !1;
  this.$K$ = this.$F$ = null;
  this.$J$ = this.$fa$.bind(this);
  this.$ba$ = new _.$Pass$$module$src$pass$$(this.$win$, this.$J$, 16);
  this.$W$ = new _.$Pass$$module$src$pass$$(this.$win$, this.$J$, 40);
  this.$R$ = null;
  var $boundOnVisibilityChanged$$ = this.$aa$.bind(this);
  this.$G$.$isSingleDoc$() ? _.$getServicePromiseForDoc$$module$src$service$$(this.$G$.$getAmpDoc$(), "viewer").then(function($win$jscomp$197$$) {
    $$jscomp$this$jscomp$163$$.$R$ = $win$jscomp$197$$;
    _.$JSCompiler_StaticMethods_Viewer$$module$src$service$viewer_impl_prototype$onVisibilityChanged$$($win$jscomp$197$$, $boundOnVisibilityChanged$$);
  }) : _.$JSCompiler_StaticMethods_DocumentState$$module$src$service$document_state_prototype$onVisibilityChanged$$(this.$V$, $boundOnVisibilityChanged$$);
  this.$Y$ = new $JankMeter$$module$src$service$jank_meter$$(this.$win$);
};
_.$JSCompiler_StaticMethods_Vsync$$module$src$service$vsync_impl_prototype$run$$ = function($JSCompiler_StaticMethods_Vsync$$module$src$service$vsync_impl_prototype$run$self$$, $JSCompiler_StaticMethods_onScheduled$self$jscomp$inline_5812_task$jscomp$17$$, $opt_state$$) {
  $JSCompiler_StaticMethods_Vsync$$module$src$service$vsync_impl_prototype$run$self$$.$I$.push($JSCompiler_StaticMethods_onScheduled$self$jscomp$inline_5812_task$jscomp$17$$);
  $JSCompiler_StaticMethods_Vsync$$module$src$service$vsync_impl_prototype$run$self$$.$U$.push($opt_state$$ || void 0);
  $JSCompiler_StaticMethods_Vsync$$module$src$service$vsync_impl_prototype$run$self$$.$D$ || ($JSCompiler_StaticMethods_Vsync$$module$src$service$vsync_impl_prototype$run$self$$.$D$ = !0, $JSCompiler_StaticMethods_onScheduled$self$jscomp$inline_5812_task$jscomp$17$$ = $JSCompiler_StaticMethods_Vsync$$module$src$service$vsync_impl_prototype$run$self$$.$Y$, $JSCompiler_StaticMethods_isEnabled_$$($JSCompiler_StaticMethods_onScheduled$self$jscomp$inline_5812_task$jscomp$17$$) && null == $JSCompiler_StaticMethods_onScheduled$self$jscomp$inline_5812_task$jscomp$17$$.$I$ && 
  ($JSCompiler_StaticMethods_onScheduled$self$jscomp$inline_5812_task$jscomp$17$$.$I$ = $JSCompiler_StaticMethods_onScheduled$self$jscomp$inline_5812_task$jscomp$17$$.$D$.Date.now()), $JSCompiler_StaticMethods_forceSchedule_$$($JSCompiler_StaticMethods_Vsync$$module$src$service$vsync_impl_prototype$run$self$$));
};
_.$JSCompiler_StaticMethods_runPromise$$ = function($JSCompiler_StaticMethods_runPromise$self$$, $deferred$jscomp$22_task$jscomp$18$$, $opt_state$jscomp$1$$) {
  _.$JSCompiler_StaticMethods_Vsync$$module$src$service$vsync_impl_prototype$run$$($JSCompiler_StaticMethods_runPromise$self$$, $deferred$jscomp$22_task$jscomp$18$$, $opt_state$jscomp$1$$);
  if ($JSCompiler_StaticMethods_runPromise$self$$.$F$) {
    return $JSCompiler_StaticMethods_runPromise$self$$.$F$;
  }
  $deferred$jscomp$22_task$jscomp$18$$ = new _.$Deferred$$module$src$utils$promise$$;
  $JSCompiler_StaticMethods_runPromise$self$$.$K$ = $deferred$jscomp$22_task$jscomp$18$$.resolve;
  return $JSCompiler_StaticMethods_runPromise$self$$.$F$ = $deferred$jscomp$22_task$jscomp$18$$.$promise$;
};
_.$JSCompiler_StaticMethods_mutatePromise$$ = function($JSCompiler_StaticMethods_mutatePromise$self$$, $mutator$jscomp$9$$) {
  return _.$JSCompiler_StaticMethods_runPromise$$($JSCompiler_StaticMethods_mutatePromise$self$$, {measure:void 0, $mutate$:$mutator$jscomp$9$$});
};
_.$JSCompiler_StaticMethods_measurePromise$$ = function($JSCompiler_StaticMethods_measurePromise$self$$, $measurer$jscomp$7$$) {
  return new window.Promise(function($resolve$jscomp$39$$) {
    $JSCompiler_StaticMethods_measurePromise$self$$.measure(function() {
      $resolve$jscomp$39$$($measurer$jscomp$7$$());
    });
  });
};
_.$JSCompiler_StaticMethods_canAnimate_$$ = function($JSCompiler_StaticMethods_canAnimate_$self_ampdoc$jscomp$75$$, $opt_contextNode$$) {
  return _.$JSCompiler_StaticMethods_isHidden$$($JSCompiler_StaticMethods_canAnimate_$self_ampdoc$jscomp$75$$.$V$) ? !1 : $JSCompiler_StaticMethods_canAnimate_$self_ampdoc$jscomp$75$$.$R$ ? _.$JSCompiler_StaticMethods_Viewer$$module$src$service$viewer_impl_prototype$isVisible$$($JSCompiler_StaticMethods_canAnimate_$self_ampdoc$jscomp$75$$.$R$) : $opt_contextNode$$ ? ($JSCompiler_StaticMethods_canAnimate_$self_ampdoc$jscomp$75$$ = $JSCompiler_StaticMethods_getAmpDocIfAvailable$$($JSCompiler_StaticMethods_canAnimate_$self_ampdoc$jscomp$75$$.$G$, 
  $opt_contextNode$$), !$JSCompiler_StaticMethods_canAnimate_$self_ampdoc$jscomp$75$$ || _.$JSCompiler_StaticMethods_Viewer$$module$src$service$viewer_impl_prototype$isVisible$$(_.$Services$$module$src$services$viewerForDoc$$($JSCompiler_StaticMethods_canAnimate_$self_ampdoc$jscomp$75$$))) : !0;
};
_.$JSCompiler_StaticMethods_createAnimTask$$ = function($JSCompiler_StaticMethods_createAnimTask$self$$, $contextNode$jscomp$7$$, $task$jscomp$21$$) {
  return function($JSCompiler_inline_result$jscomp$521_opt_state$jscomp$4$$) {
    _.$JSCompiler_StaticMethods_canAnimate_$$($JSCompiler_StaticMethods_createAnimTask$self$$, $contextNode$jscomp$7$$) ? (_.$JSCompiler_StaticMethods_Vsync$$module$src$service$vsync_impl_prototype$run$$($JSCompiler_StaticMethods_createAnimTask$self$$, $task$jscomp$21$$, $JSCompiler_inline_result$jscomp$521_opt_state$jscomp$4$$), $JSCompiler_inline_result$jscomp$521_opt_state$jscomp$4$$ = !0) : (_.$dev$$module$src$log$$().$Log$$module$src$log_prototype$warn$("VSYNC", "Did not schedule a vsync request, because document was invisible"), 
    $JSCompiler_inline_result$jscomp$521_opt_state$jscomp$4$$ = !1);
    return $JSCompiler_inline_result$jscomp$521_opt_state$jscomp$4$$;
  };
};
$JSCompiler_StaticMethods_forceSchedule_$$ = function($JSCompiler_StaticMethods_forceSchedule_$self$$) {
  _.$JSCompiler_StaticMethods_canAnimate_$$($JSCompiler_StaticMethods_forceSchedule_$self$$) ? ($JSCompiler_StaticMethods_forceSchedule_$self$$.$ea$($JSCompiler_StaticMethods_forceSchedule_$self$$.$J$), _.$JSCompiler_StaticMethods_schedule$$($JSCompiler_StaticMethods_forceSchedule_$self$$.$W$)) : _.$JSCompiler_StaticMethods_schedule$$($JSCompiler_StaticMethods_forceSchedule_$self$$.$ba$);
};
$JSCompiler_StaticMethods_getRaf_$$ = function($JSCompiler_StaticMethods_getRaf_$self$$) {
  var $raf$$ = $JSCompiler_StaticMethods_getRaf_$self$$.$win$.requestAnimationFrame || $JSCompiler_StaticMethods_getRaf_$self$$.$win$.webkitRequestAnimationFrame;
  if ($raf$$) {
    return $raf$$.bind($JSCompiler_StaticMethods_getRaf_$self$$.$win$);
  }
  var $lastTime$$ = 0;
  return function($raf$$) {
    var $fn$jscomp$17$$ = Date.now(), $timeToCall$$ = Math.max(0, 16 - ($fn$jscomp$17$$ - $lastTime$$));
    $lastTime$$ = $fn$jscomp$17$$ + $timeToCall$$;
    $JSCompiler_StaticMethods_getRaf_$self$$.$win$.setTimeout($raf$$, $timeToCall$$);
  };
};
$callTaskNoInline$$module$src$service$vsync_impl$$ = function($callback$jscomp$89$$, $state$jscomp$35$$) {
  try {
    $callback$jscomp$89$$($state$jscomp$35$$);
  } catch ($e$jscomp$92$$) {
    return _.$rethrowAsync$$module$src$log$$($e$jscomp$92$$), !1;
  }
  return !0;
};
$isShadowCssSupported$$module$src$web_components$$ = function() {
  void 0 === $shadowCssSupported$$module$src$web_components$$ && ($shadowCssSupported$$module$src$web_components$$ = "none" != $getShadowDomSupportedVersion$$module$src$web_components$$() && ($isNative$$module$src$web_components$$(window.Element.prototype.attachShadow) || $isNative$$module$src$web_components$$(window.Element.prototype.createShadowRoot)));
  return $shadowCssSupported$$module$src$web_components$$;
};
$isNative$$module$src$web_components$$ = function($func$jscomp$4$$) {
  return !!$func$jscomp$4$$ && -1 != $func$jscomp$4$$.toString().indexOf("[native code]");
};
$getShadowDomSupportedVersion$$module$src$web_components$$ = function() {
  if (void 0 === $shadowDomSupportedVersion$$module$src$web_components$$) {
    var $element$jscomp$inline_1682$$ = window.Element;
    $shadowDomSupportedVersion$$module$src$web_components$$ = $element$jscomp$inline_1682$$.prototype.attachShadow ? "v1" : $element$jscomp$inline_1682$$.prototype.createShadowRoot ? "v0" : "none";
  }
  return $shadowDomSupportedVersion$$module$src$web_components$$;
};
_.$createShadowRoot$$module$src$shadow_embed$$ = function($hostElement_rootId$$) {
  var $win$jscomp$198$$ = $hostElement_rootId$$.ownerDocument.defaultView, $existingRoot_shadowDomSupported$$ = $hostElement_rootId$$.shadowRoot || $hostElement_rootId$$.$Sa$;
  if ($existingRoot_shadowDomSupported$$) {
    return $existingRoot_shadowDomSupported$$.innerHTML = "", $existingRoot_shadowDomSupported$$;
  }
  $existingRoot_shadowDomSupported$$ = $getShadowDomSupportedVersion$$module$src$web_components$$();
  if ("v1" == $existingRoot_shadowDomSupported$$) {
    var $shadowRoot$jscomp$1$$ = $hostElement_rootId$$.attachShadow({mode:"open"});
    $shadowRoot$jscomp$1$$.styleSheets || Object.defineProperty($shadowRoot$jscomp$1$$, "styleSheets", {get:function() {
      var $hostElement_rootId$$ = [];
      _.$iterateCursor$$module$src$dom$$($shadowRoot$jscomp$1$$.childNodes, function($win$jscomp$198$$) {
        "STYLE" === $win$jscomp$198$$.tagName && $hostElement_rootId$$.push($win$jscomp$198$$.sheet);
      });
      return $hostElement_rootId$$;
    }});
  } else {
    $shadowRoot$jscomp$1$$ = "v0" == $existingRoot_shadowDomSupported$$ ? $hostElement_rootId$$.createShadowRoot() : $createShadowRootPolyfill$$module$src$shadow_embed$$($hostElement_rootId$$);
  }
  $isShadowCssSupported$$module$src$web_components$$() || ($hostElement_rootId$$ = "i-amphtml-sd-" + $win$jscomp$198$$.Math.floor(10000 * $win$jscomp$198$$.Math.random()), $shadowRoot$jscomp$1$$.id = $hostElement_rootId$$, $shadowRoot$jscomp$1$$.host.classList.add($hostElement_rootId$$), $installCssTransformer$$module$src$style_installer$$($shadowRoot$jscomp$1$$, function($hostElement_rootId$$) {
    var $win$jscomp$198$$ = $shadowRoot$jscomp$1$$.id, $existingRoot_shadowDomSupported$$ = $shadowRoot$jscomp$1$$.ownerDocument, $css$jscomp$2$$ = null;
    try {
      $css$jscomp$2$$ = $getStylesheetRules$$module$src$shadow_embed$$($existingRoot_shadowDomSupported$$.implementation.createHTMLDocument(""), $hostElement_rootId$$);
    } catch ($e$jscomp$inline_5844$$) {
    }
    if (!$css$jscomp$2$$) {
      try {
        $css$jscomp$2$$ = $getStylesheetRules$$module$src$shadow_embed$$($existingRoot_shadowDomSupported$$, $hostElement_rootId$$);
      } catch ($e$178$jscomp$inline_5845$$) {
      }
    }
    return $css$jscomp$2$$ ? $ShadowCSS$$module$third_party$webcomponentsjs$ShadowCSS$$.$scopeRules$.call($ShadowCSS$$module$third_party$webcomponentsjs$ShadowCSS$$, $css$jscomp$2$$, "." + $win$jscomp$198$$, $transformRootSelectors$$module$src$shadow_embed$$) : $hostElement_rootId$$;
  }));
  return $shadowRoot$jscomp$1$$;
};
$createShadowRootPolyfill$$module$src$shadow_embed$$ = function($hostElement$jscomp$1$$) {
  var $doc$jscomp$44$$ = $hostElement$jscomp$1$$.ownerDocument;
  $hostElement$jscomp$1$$.classList.add("i-amphtml-shadow-host-polyfill");
  var $hostStyle$$ = $doc$jscomp$44$$.createElement("style");
  $hostStyle$$.textContent = ".i-amphtml-shadow-host-polyfill>:not(i-amphtml-shadow-root){display:none!important}";
  $hostElement$jscomp$1$$.appendChild($hostStyle$$);
  var $shadowRoot$jscomp$2$$ = $doc$jscomp$44$$.createElement("i-amphtml-shadow-root");
  $hostElement$jscomp$1$$.appendChild($shadowRoot$jscomp$2$$);
  $hostElement$jscomp$1$$.$Sa$ = $shadowRoot$jscomp$2$$;
  Object.defineProperty($hostElement$jscomp$1$$, "shadowRoot", {enumerable:!0, configurable:!0, value:$shadowRoot$jscomp$2$$});
  $shadowRoot$jscomp$2$$.host = $hostElement$jscomp$1$$;
  $shadowRoot$jscomp$2$$.getElementById = function($hostElement$jscomp$1$$) {
    $hostElement$jscomp$1$$ = _.$cssEscape$$module$third_party$css_escape$css_escape$$($hostElement$jscomp$1$$);
    return $shadowRoot$jscomp$2$$.querySelector("#" + $hostElement$jscomp$1$$);
  };
  Object.defineProperty($shadowRoot$jscomp$2$$, "styleSheets", {get:function() {
    return $doc$jscomp$44$$.styleSheets ? _.$toArray$$module$src$types$$($doc$jscomp$44$$.styleSheets).filter(function($hostElement$jscomp$1$$) {
      return $shadowRoot$jscomp$2$$.contains($hostElement$jscomp$1$$.ownerNode);
    }) : [];
  }});
  return $shadowRoot$jscomp$2$$;
};
$getShadowRootNode$$module$src$shadow_embed$$ = function($node$jscomp$47$$) {
  return "none" != $getShadowDomSupportedVersion$$module$src$web_components$$() && window.Node.prototype.getRootNode ? $node$jscomp$47$$.getRootNode($UNCOMPOSED_SEARCH$$module$src$shadow_embed$$) : $closestNode$$module$src$dom$$($node$jscomp$47$$, function($node$jscomp$47$$) {
    return $node$jscomp$47$$ ? "I-AMPHTML-SHADOW-ROOT" == $node$jscomp$47$$.tagName ? !0 : 11 == $node$jscomp$47$$.nodeType && "[object ShadowRoot]" === Object.prototype.toString.call($node$jscomp$47$$) : !1;
  });
};
$importShadowBody$$module$src$shadow_embed$$ = function($shadowRoot$jscomp$3$$, $body$jscomp$9_n$jscomp$15$$, $deep$jscomp$4$$) {
  var $doc$jscomp$45$$ = $shadowRoot$jscomp$3$$.ownerDocument;
  if ($isShadowCssSupported$$module$src$web_components$$()) {
    var $resultBody$$ = $doc$jscomp$45$$.importNode($body$jscomp$9_n$jscomp$15$$, $deep$jscomp$4$$);
  } else {
    $resultBody$$ = $doc$jscomp$45$$.createElement("amp-body");
    _.$setInitialDisplay$$module$src$style$$($resultBody$$);
    for (var $i$jscomp$127$$ = 0; $i$jscomp$127$$ < $body$jscomp$9_n$jscomp$15$$.attributes.length; $i$jscomp$127$$++) {
      $resultBody$$.setAttribute($body$jscomp$9_n$jscomp$15$$.attributes[0].name, $body$jscomp$9_n$jscomp$15$$.attributes[0].value);
    }
    if ($deep$jscomp$4$$) {
      for ($body$jscomp$9_n$jscomp$15$$ = $body$jscomp$9_n$jscomp$15$$.firstChild; $body$jscomp$9_n$jscomp$15$$; $body$jscomp$9_n$jscomp$15$$ = $body$jscomp$9_n$jscomp$15$$.nextSibling) {
        $resultBody$$.appendChild($doc$jscomp$45$$.importNode($body$jscomp$9_n$jscomp$15$$, !0));
      }
    }
  }
  _.$setStyle$$module$src$style$$($resultBody$$, "position", "relative");
  $shadowRoot$jscomp$3$$.appendChild($resultBody$$);
  Object.defineProperty($shadowRoot$jscomp$3$$, "body", {value:$resultBody$$});
  return $resultBody$$;
};
$transformRootSelectors$$module$src$shadow_embed$$ = function($selector$jscomp$15$$) {
  return $selector$jscomp$15$$.replace(/(html|body)/g, $rootSelectorPrefixer$$module$src$shadow_embed$$);
};
$rootSelectorPrefixer$$module$src$shadow_embed$$ = function($match$jscomp$6$$, $name$jscomp$153_prev$$, $next$jscomp$2_pos$jscomp$8$$, $selector$jscomp$16$$) {
  $name$jscomp$153_prev$$ = $selector$jscomp$16$$.charAt($next$jscomp$2_pos$jscomp$8$$ - 1);
  $next$jscomp$2_pos$jscomp$8$$ = $selector$jscomp$16$$.charAt($next$jscomp$2_pos$jscomp$8$$ + $match$jscomp$6$$.length);
  return $name$jscomp$153_prev$$ && !$CSS_SELECTOR_BEG_REGEX$$module$src$shadow_embed$$.test($name$jscomp$153_prev$$) || $next$jscomp$2_pos$jscomp$8$$ && !$CSS_SELECTOR_END_REGEX$$module$src$shadow_embed$$.test($next$jscomp$2_pos$jscomp$8$$) ? $match$jscomp$6$$ : "amp-" + $match$jscomp$6$$;
};
$getStylesheetRules$$module$src$shadow_embed$$ = function($doc$jscomp$47$$, $css$jscomp$5$$) {
  var $style$jscomp$17$$ = $doc$jscomp$47$$.createElement("style");
  $style$jscomp$17$$.textContent = $css$jscomp$5$$;
  try {
    return ($doc$jscomp$47$$.head || $doc$jscomp$47$$.documentElement).appendChild($style$jscomp$17$$), $style$jscomp$17$$.sheet ? $style$jscomp$17$$.sheet.cssRules : null;
  } finally {
    $style$jscomp$17$$.parentNode && $style$jscomp$17$$.parentNode.removeChild($style$jscomp$17$$);
  }
};
$createShadowDomWriter$$module$src$shadow_embed$$ = function($win$jscomp$201$$) {
  void 0 === $shadowDomStreamingSupported$$module$src$shadow_embed$$ && ($shadowDomStreamingSupported$$module$src$shadow_embed$$ = !$win$jscomp$201$$.document.implementation || "function" != typeof $win$jscomp$201$$.document.implementation.createHTMLDocument || $JSCompiler_StaticMethods_isFirefox$$(_.$Services$$module$src$services$platformFor$$($win$jscomp$201$$)) ? !1 : !0);
  return $shadowDomStreamingSupported$$module$src$shadow_embed$$ ? new $ShadowDomWriterStreamer$$module$src$shadow_embed$$($win$jscomp$201$$) : new $ShadowDomWriterBulk$$module$src$shadow_embed$$($win$jscomp$201$$);
};
$ShadowDomWriterStreamer$$module$src$shadow_embed$$ = function($win$jscomp$202$$) {
  this.$D$ = $win$jscomp$202$$.document.implementation.createHTMLDocument("");
  this.$D$.open();
  this.$vsync_$ = _.$Services$$module$src$services$vsyncFor$$($win$jscomp$202$$);
  this.$R$ = this.$merge_$.bind(this);
  this.$O$ = this.$J$ = this.$K$ = null;
  this.$I$ = !1;
  this.$P$ = window.Promise.resolve();
  this.$G$ = !1;
  this.$F$ = null;
};
$JSCompiler_StaticMethods_ShadowDomWriterStreamer$$module$src$shadow_embed_prototype$schedule_$$ = function($JSCompiler_StaticMethods_ShadowDomWriterStreamer$$module$src$shadow_embed_prototype$schedule_$self$$) {
  $JSCompiler_StaticMethods_ShadowDomWriterStreamer$$module$src$shadow_embed_prototype$schedule_$self$$.$I$ || ($JSCompiler_StaticMethods_ShadowDomWriterStreamer$$module$src$shadow_embed_prototype$schedule_$self$$.$I$ = !0, $JSCompiler_StaticMethods_ShadowDomWriterStreamer$$module$src$shadow_embed_prototype$schedule_$self$$.$vsync_$.$mutate$($JSCompiler_StaticMethods_ShadowDomWriterStreamer$$module$src$shadow_embed_prototype$schedule_$self$$.$R$));
};
$ShadowDomWriterBulk$$module$src$shadow_embed$$ = function($win$jscomp$203$$) {
  this.$K$ = [];
  this.$vsync_$ = _.$Services$$module$src$services$vsyncFor$$($win$jscomp$203$$);
  this.$I$ = this.$F$ = this.$G$ = null;
  this.$J$ = window.Promise.resolve();
  this.$D$ = !1;
};
$removeNoScriptElements$$module$src$shadow_embed$$ = function($noscriptElements_parent$jscomp$36$$) {
  $noscriptElements_parent$jscomp$36$$ = _.$childElementsByTag$$module$src$dom$$($noscriptElements_parent$jscomp$36$$, "noscript");
  _.$iterateCursor$$module$src$dom$$($noscriptElements_parent$jscomp$36$$, function($noscriptElements_parent$jscomp$36$$) {
    _.$removeElement$$module$src$dom$$($noscriptElements_parent$jscomp$36$$);
  });
};
_.$installRuntimeServices$$module$src$runtime$$ = function($global$jscomp$1$$) {
  _.$registerServiceBuilder$$module$src$service$$($global$jscomp$1$$, "crypto", $Crypto$$module$src$service$crypto_impl$$);
  _.$registerServiceBuilder$$module$src$service$$($global$jscomp$1$$, "batched-xhr", $BatchedXhr$$module$src$service$batched_xhr_impl$$);
  _.$registerServiceBuilder$$module$src$service$$($global$jscomp$1$$, "documentState", $DocumentState$$module$src$service$document_state$$);
  _.$registerServiceBuilder$$module$src$service$$($global$jscomp$1$$, "platform", $Platform$$module$src$service$platform_impl$$);
  _.$registerServiceBuilder$$module$src$service$$($global$jscomp$1$$, "templates", $Templates$$module$src$service$template_impl$$);
  _.$registerServiceBuilder$$module$src$service$$($global$jscomp$1$$, "timer", $Timer$$module$src$service$timer_impl$$);
  _.$registerServiceBuilder$$module$src$service$$($global$jscomp$1$$, "timer", $Timer$$module$src$service$timer_impl$$);
  _.$registerServiceBuilder$$module$src$service$$($global$jscomp$1$$, "vsync", $Vsync$$module$src$service$vsync_impl$$);
  _.$registerServiceBuilder$$module$src$service$$($global$jscomp$1$$, "xhr", $Xhr$$module$src$service$xhr_impl$$);
  _.$registerServiceBuilder$$module$src$service$$($global$jscomp$1$$, "input", $Input$$module$src$input$$);
};
_.$installAmpdocServices$$module$src$runtime$$ = function($ampdoc$jscomp$76$$, $opt_initParams$jscomp$2$$) {
  _.$registerServiceBuilderForDoc$$module$src$service$$($ampdoc$jscomp$76$$, "url", $Url$$module$src$service$url_impl$$, !0);
  _.$registerServiceBuilderForDoc$$module$src$service$$($ampdoc$jscomp$76$$, "cid", $Cid$$module$src$service$cid_impl$$);
  _.$registerServiceBuilderForDoc$$module$src$service$$($ampdoc$jscomp$76$$, "documentInfo", $DocInfo$$module$src$service$document_info_impl$$);
  _.$installViewerServiceForDoc$$module$src$service$viewer_impl$$($ampdoc$jscomp$76$$, $opt_initParams$jscomp$2$$);
  _.$registerServiceBuilderForDoc$$module$src$service$$($ampdoc$jscomp$76$$, "viewport", $createViewport$$module$src$service$viewport$viewport_impl$$, !0);
  _.$registerServiceBuilderForDoc$$module$src$service$$($ampdoc$jscomp$76$$, "history", $createHistory$$module$src$service$history_impl$$);
  _.$registerServiceBuilderForDoc$$module$src$service$$($ampdoc$jscomp$76$$, "resources", _.$Resources$$module$src$service$resources_impl$$);
  $installUrlReplacementsServiceForDoc$$module$src$service$url_replacements_impl$$($ampdoc$jscomp$76$$);
  _.$registerServiceBuilderForDoc$$module$src$service$$($ampdoc$jscomp$76$$, "action", $ActionService$$module$src$service$action_impl$$, !0);
  _.$registerServiceBuilderForDoc$$module$src$service$$($ampdoc$jscomp$76$$, "standard-actions", $StandardActions$$module$src$service$standard_actions_impl$$, !0);
  $installStorageServiceForDoc$$module$src$service$storage_impl$$($ampdoc$jscomp$76$$);
  _.$registerServiceBuilderForDoc$$module$src$service$$($ampdoc$jscomp$76$$, "navigation", $Navigation$$module$src$service$navigation$$, !0);
  $installGlobalSubmitListenerForDoc$$module$src$document_submit$$($ampdoc$jscomp$76$$);
};
_.$installBuiltins$$module$src$runtime$$ = function() {
  var $win$jscomp$inline_1728$$ = window.self;
  _.$registerElement$$module$src$service$custom_element_registry$$($win$jscomp$inline_1728$$, "amp-img", _.$AmpImg$$module$builtins$amp_img$$);
  _.$registerElement$$module$src$service$custom_element_registry$$($win$jscomp$inline_1728$$, "amp-pixel", $AmpPixel$$module$builtins$amp_pixel$$);
  _.$registerElement$$module$src$service$custom_element_registry$$($win$jscomp$inline_1728$$, "amp-layout", $AmpLayout$$module$builtins$amp_layout$$);
};
_.$adoptShared$$module$src$runtime$$ = function($callback$jscomp$96_i$jscomp$128$$) {
  var $global$jscomp$3$$ = window.self;
  function $installExtension$$($callback$jscomp$96_i$jscomp$128$$) {
    function $installExtension$$() {
      $iniPromise$$.then(function() {
        if ("function" == typeof $callback$jscomp$96_i$jscomp$128$$) {
          $callback$jscomp$96_i$jscomp$128$$($global$jscomp$3$$.AMP, $global$jscomp$3$$.AMP._);
        } else {
          var $installExtension$$ = $callback$jscomp$96_i$jscomp$128$$.n, $preregisteredExtensions$$ = $callback$jscomp$96_i$jscomp$128$$.f, $iniPromise$$ = $global$jscomp$3$$.AMP, $fnOrStruct$$ = $JSCompiler_StaticMethods_getExtensionHolder_$$($extensions$jscomp$3$$, $installExtension$$, !0);
          try {
            $extensions$jscomp$3$$.$D$ = $installExtension$$, $preregisteredExtensions$$($iniPromise$$, $iniPromise$$._), $fnOrStruct$$.loaded = !0, $fnOrStruct$$.resolve && $fnOrStruct$$.resolve($fnOrStruct$$.extension);
          } catch ($e$jscomp$inline_1735$$) {
            throw $fnOrStruct$$.error = $e$jscomp$inline_1735$$, $fnOrStruct$$.reject && $fnOrStruct$$.reject($e$jscomp$inline_1735$$), $e$jscomp$inline_1735$$;
          } finally {
            $extensions$jscomp$3$$.$D$ = null;
          }
        }
      });
    }
    "function" != typeof $callback$jscomp$96_i$jscomp$128$$ && $callback$jscomp$96_i$jscomp$128$$.i ? $preloadDeps$$module$src$runtime$$($extensions$jscomp$3$$, $callback$jscomp$96_i$jscomp$128$$).then(function() {
      return $startRegisterOrChunk$$module$src$runtime$$($global$jscomp$3$$, $callback$jscomp$96_i$jscomp$128$$, $installExtension$$);
    }) : $startRegisterOrChunk$$module$src$runtime$$($global$jscomp$3$$, $callback$jscomp$96_i$jscomp$128$$, $installExtension$$);
  }
  if ($global$jscomp$3$$.AMP_TAG) {
    window.Promise.resolve();
  } else {
    $global$jscomp$3$$.AMP_TAG = !0;
    var $preregisteredExtensions$$ = $global$jscomp$3$$.AMP || [];
    _.$registerServiceBuilder$$module$src$service$$($global$jscomp$3$$, "extensions", $Extensions$$module$src$service$extensions_impl$$);
    var $extensions$jscomp$3$$ = _.$Services$$module$src$services$extensionsFor$$($global$jscomp$3$$);
    _.$installRuntimeServices$$module$src$runtime$$($global$jscomp$3$$);
    _.$stubLegacyElements$$module$src$service$extensions_impl$$($global$jscomp$3$$);
    $global$jscomp$3$$.AMP = {$win$:$global$jscomp$3$$, _:$global$jscomp$3$$.AMP ? $global$jscomp$3$$.AMP._ : void 0};
    $global$jscomp$3$$.AMP.config = $config$$module$src$config$$;
    $global$jscomp$3$$.AMP.BaseElement = _.$BaseElement$$module$src$base_element$$;
    $global$jscomp$3$$.AMP.BaseTemplate = _.$BaseTemplate$$module$src$service$template_impl$$;
    $global$jscomp$3$$.AMP.registerElement = $extensions$jscomp$3$$.$G$.bind($extensions$jscomp$3$$);
    $global$jscomp$3$$.AMP.registerTemplate = function($callback$jscomp$96_i$jscomp$128$$, $installExtension$$) {
      var $preregisteredExtensions$$ = _.$getService$$module$src$service$$($global$jscomp$3$$, "templates");
      if ($preregisteredExtensions$$.$D$[$callback$jscomp$96_i$jscomp$128$$]) {
        var $extensions$jscomp$3$$ = $preregisteredExtensions$$.$F$[$callback$jscomp$96_i$jscomp$128$$];
        delete $preregisteredExtensions$$.$F$[$callback$jscomp$96_i$jscomp$128$$];
        $extensions$jscomp$3$$($installExtension$$);
      } else {
        $preregisteredExtensions$$.$D$[$callback$jscomp$96_i$jscomp$128$$] = window.Promise.resolve($installExtension$$);
      }
    };
    $global$jscomp$3$$.AMP.registerServiceForDoc = $extensions$jscomp$3$$.$I$.bind($extensions$jscomp$3$$);
    $global$jscomp$3$$.AMP.isExperimentOn = _.$isExperimentOn$$module$src$experiments$$.bind(null, $global$jscomp$3$$);
    $global$jscomp$3$$.AMP.toggleExperiment = _.$toggleExperiment$$module$src$experiments$$.bind(null, $global$jscomp$3$$);
    $global$jscomp$3$$.AMP.setLogLevel = $overrideLogLevel$$module$src$log$$.bind(null);
    $global$jscomp$3$$.AMP.setTickFunction = function() {
    };
    var $iniPromise$$ = $callback$jscomp$96_i$jscomp$128$$($global$jscomp$3$$, $extensions$jscomp$3$$);
    for ($callback$jscomp$96_i$jscomp$128$$ = 0; $callback$jscomp$96_i$jscomp$128$$ < $preregisteredExtensions$$.length; $callback$jscomp$96_i$jscomp$128$$++) {
      var $fnOrStruct$$ = $preregisteredExtensions$$[$callback$jscomp$96_i$jscomp$128$$];
      if ($maybeLoadCorrectVersion$$module$src$runtime$$($global$jscomp$3$$, $fnOrStruct$$)) {
        $preregisteredExtensions$$.splice($callback$jscomp$96_i$jscomp$128$$--, 1);
      } else {
        if ("function" == typeof $fnOrStruct$$ || "high" == $fnOrStruct$$.p) {
          try {
            $installExtension$$($fnOrStruct$$);
          } catch ($e$jscomp$94$$) {
            _.$dev$$module$src$log$$().error("runtime", "Extension failed: ", $e$jscomp$94$$, $fnOrStruct$$.n);
          }
          $preregisteredExtensions$$.splice($callback$jscomp$96_i$jscomp$128$$--, 1);
        }
      }
    }
    $maybePumpEarlyFrame$$module$src$runtime$$($global$jscomp$3$$, function() {
      $global$jscomp$3$$.AMP.push = function($callback$jscomp$96_i$jscomp$128$$) {
        $maybeLoadCorrectVersion$$module$src$runtime$$($global$jscomp$3$$, $callback$jscomp$96_i$jscomp$128$$) || $installExtension$$($callback$jscomp$96_i$jscomp$128$$);
      };
      for (var $callback$jscomp$96_i$jscomp$128$$ = 0; $callback$jscomp$96_i$jscomp$128$$ < $preregisteredExtensions$$.length; $callback$jscomp$96_i$jscomp$128$$++) {
        var $extensions$jscomp$3$$ = $preregisteredExtensions$$[$callback$jscomp$96_i$jscomp$128$$];
        if (!$maybeLoadCorrectVersion$$module$src$runtime$$($global$jscomp$3$$, $extensions$jscomp$3$$)) {
          try {
            $installExtension$$($extensions$jscomp$3$$);
          } catch ($e$181$$) {
            _.$dev$$module$src$log$$().error("runtime", "Extension failed: ", $e$181$$, $extensions$jscomp$3$$.n);
          }
        }
      }
      $preregisteredExtensions$$.length = 0;
    });
    $global$jscomp$3$$.AMP.push || ($global$jscomp$3$$.AMP.push = $preregisteredExtensions$$.push.bind($preregisteredExtensions$$));
    _.$JSCompiler_StaticMethods_isIos$$(_.$Services$$module$src$services$platformFor$$($global$jscomp$3$$)) && _.$setStyle$$module$src$style$$($global$jscomp$3$$.document.documentElement, "cursor", "pointer");
  }
};
$preloadDeps$$module$src$runtime$$ = function($extensions$jscomp$4$$, $fnOrStruct$jscomp$3_promises$jscomp$8$$) {
  if (Array.isArray($fnOrStruct$jscomp$3_promises$jscomp$8$$.i)) {
    return $fnOrStruct$jscomp$3_promises$jscomp$8$$ = $fnOrStruct$jscomp$3_promises$jscomp$8$$.i.map(function($fnOrStruct$jscomp$3_promises$jscomp$8$$) {
      return _.$JSCompiler_StaticMethods_preloadExtension$$($extensions$jscomp$4$$, $fnOrStruct$jscomp$3_promises$jscomp$8$$);
    }), window.Promise.all($fnOrStruct$jscomp$3_promises$jscomp$8$$);
  }
  if ("string" == typeof $fnOrStruct$jscomp$3_promises$jscomp$8$$.i) {
    return _.$JSCompiler_StaticMethods_preloadExtension$$($extensions$jscomp$4$$, $fnOrStruct$jscomp$3_promises$jscomp$8$$.i);
  }
  _.$dev$$module$src$log$$().error("RUNTIME", "dependency is neither an array or a string", $fnOrStruct$jscomp$3_promises$jscomp$8$$.i);
  return window.Promise.resolve();
};
$startRegisterOrChunk$$module$src$runtime$$ = function($global$jscomp$4$$, $fnOrStruct$jscomp$4$$, $register$jscomp$2$$) {
  "function" == typeof $fnOrStruct$jscomp$4$$ || "high" == $fnOrStruct$jscomp$4$$.p ? window.Promise.resolve().then($register$jscomp$2$$) : ($register$jscomp$2$$.displayName = $fnOrStruct$jscomp$4$$.n, _.$startupChunk$$module$src$chunk$$($global$jscomp$4$$.document, $register$jscomp$2$$));
};
_.$adopt$$module$src$runtime$$ = function() {
  _.$adoptShared$$module$src$runtime$$(function($global$jscomp$6$$) {
    var $documentElement$jscomp$6_viewport$jscomp$7$$ = $global$jscomp$6$$.document.documentElement, $ampdoc$jscomp$77$$ = _.$Services$$module$src$services$ampdocServiceFor$$($global$jscomp$6$$).$getAmpDoc$();
    $global$jscomp$6$$.AMP.ampdoc = $ampdoc$jscomp$77$$;
    var $viewer$jscomp$24$$ = _.$Services$$module$src$services$viewerForDoc$$($documentElement$jscomp$6_viewport$jscomp$7$$);
    $global$jscomp$6$$.AMP.viewer = $viewer$jscomp$24$$;
    _.$getMode$$module$src$mode$$().$development$ && ($global$jscomp$6$$.AMP.$toggleRuntime$ = $viewer$jscomp$24$$.$toggleRuntime$.bind($viewer$jscomp$24$$), $global$jscomp$6$$.AMP.$resources$ = _.$Services$$module$src$services$resourcesForDoc$$($documentElement$jscomp$6_viewport$jscomp$7$$));
    $documentElement$jscomp$6_viewport$jscomp$7$$ = _.$Services$$module$src$services$viewportForDoc$$($documentElement$jscomp$6_viewport$jscomp$7$$);
    $global$jscomp$6$$.AMP.viewport = {};
    $global$jscomp$6$$.AMP.viewport.getScrollLeft = $documentElement$jscomp$6_viewport$jscomp$7$$.getScrollLeft.bind($documentElement$jscomp$6_viewport$jscomp$7$$);
    $global$jscomp$6$$.AMP.viewport.getScrollWidth = $documentElement$jscomp$6_viewport$jscomp$7$$.getScrollWidth.bind($documentElement$jscomp$6_viewport$jscomp$7$$);
    $global$jscomp$6$$.AMP.viewport.getWidth = $documentElement$jscomp$6_viewport$jscomp$7$$.getWidth.bind($documentElement$jscomp$6_viewport$jscomp$7$$);
    return _.$waitForBodyPromise$$module$src$dom$$($global$jscomp$6$$.document).then(function() {
      _.$stubElementsForDoc$$module$src$service$custom_element_registry$$($ampdoc$jscomp$77$$);
    });
  });
};
_.$MultidocManager$$module$src$runtime$$ = function($win$jscomp$204$$, $ampdocService$jscomp$5$$, $extensions$jscomp$6$$, $timer$$) {
  this.$win$ = $win$jscomp$204$$;
  this.$F$ = $ampdocService$jscomp$5$$;
  this.$extensions_$ = $extensions$jscomp$6$$;
  this.$timer_$ = $timer$$;
  this.$D$ = [];
};
$JSCompiler_StaticMethods_MultidocManager$$module$src$runtime_prototype$attachShadowDoc_$$ = function($JSCompiler_StaticMethods_MultidocManager$$module$src$runtime_prototype$attachShadowDoc_$self$$, $hostElement$jscomp$2$$, $url$jscomp$92$$, $initParams$$, $builder$jscomp$1$$) {
  $JSCompiler_StaticMethods_purgeShadowRoots_$$($JSCompiler_StaticMethods_MultidocManager$$module$src$runtime_prototype$attachShadowDoc_$self$$);
  _.$setStyle$$module$src$style$$($hostElement$jscomp$2$$, "visibility", "hidden");
  var $shadowRoot$jscomp$6$$ = _.$createShadowRoot$$module$src$shadow_embed$$($hostElement$jscomp$2$$);
  $shadowRoot$jscomp$6$$.AMP && (_.$user$$module$src$log$$().$Log$$module$src$log_prototype$warn$("runtime", "Shadow doc wasn't previously closed"), $JSCompiler_StaticMethods_closeShadowRoot_$$($JSCompiler_StaticMethods_MultidocManager$$module$src$runtime_prototype$attachShadowDoc_$self$$, $shadowRoot$jscomp$6$$));
  var $amp$jscomp$1$$ = {};
  $shadowRoot$jscomp$6$$.AMP = $amp$jscomp$1$$;
  $amp$jscomp$1$$.url = $url$jscomp$92$$;
  var $origin$jscomp$17$$ = _.$parseUrlDeprecated$$module$src$url$$($url$jscomp$92$$).origin, $ampdoc$jscomp$78$$ = $JSCompiler_StaticMethods_installShadowDoc$$($JSCompiler_StaticMethods_MultidocManager$$module$src$runtime_prototype$attachShadowDoc_$self$$.$F$, $url$jscomp$92$$, $shadowRoot$jscomp$6$$);
  $amp$jscomp$1$$.ampdoc = $ampdoc$jscomp$78$$;
  "runtime";
  _.$installStylesForDoc$$module$src$style_installer$$($ampdoc$jscomp$78$$, "html{overflow-x:hidden!important}body,html{height:auto!important}html.i-amphtml-fie{height:100%!important;width:100%!important}body{margin:0!important;-webkit-text-size-adjust:100%;-moz-text-size-adjust:100%;-ms-text-size-adjust:100%;text-size-adjust:100%}[hidden]{display:none!important}html.i-amphtml-singledoc.i-amphtml-embedded{-ms-touch-action:pan-y;touch-action:pan-y}html.i-amphtml-fie>body,html.i-amphtml-singledoc>body{overflow:visible!important}html.i-amphtml-fie:not(.i-amphtml-inabox)>body,html.i-amphtml-singledoc:not(.i-amphtml-inabox)>body{position:relative!important}html.i-amphtml-webview>body{overflow-x:hidden!important;overflow-y:visible!important;min-height:100vh!important}html.i-amphtml-ios-embed-legacy>body{overflow-x:hidden!important;overflow-y:auto!important;position:absolute!important}html.i-amphtml-ios-embed{overflow-y:auto!important;position:static}#i-amphtml-wrapper{overflow-x:hidden!important;overflow-y:auto!important;position:absolute!important;top:0!important;left:0!important;right:0!important;bottom:0!important;margin:0!important;display:block!important}html.i-amphtml-ios-embed.i-amphtml-ios-overscroll,html.i-amphtml-ios-embed.i-amphtml-ios-overscroll>#i-amphtml-wrapper{-webkit-overflow-scrolling:touch!important}#i-amphtml-wrapper>body{position:relative!important;border-top:1px solid transparent!important}html.i-amphtml-ios-embed-sd{overflow:hidden!important;position:static!important}html.i-amphtml-ios-embed-sd>body,html.i-amphtml-singledoc.i-amphtml-ios-embed-sd>body{position:absolute!important;top:0!important;left:0!important;right:0!important;bottom:0!important;overflow:hidden!important}.i-amphtml-body-minheight>body{min-height:calc(100vh + 1px)}.i-amphtml-element{display:inline-block}.i-amphtml-blurry-placeholder{-webkit-transition:opacity 0.3s cubic-bezier(0.0,0.0,0.2,1)!important;transition:opacity 0.3s cubic-bezier(0.0,0.0,0.2,1)!important}[layout=nodisplay]:not(.i-amphtml-element){display:none!important}.i-amphtml-layout-fixed,[layout=fixed][width][height]:not(.i-amphtml-layout-fixed){display:inline-block;position:relative}.i-amphtml-layout-responsive,[layout=responsive][width][height]:not(.i-amphtml-layout-responsive),[width][height][sizes]:not(.i-amphtml-layout-responsive){display:block;position:relative}.i-amphtml-layout-intrinsic{display:inline-block;position:relative;max-width:100%}.i-amphtml-intrinsic-sizer{max-width:100%;display:block!important}.i-amphtml-layout-container,.i-amphtml-layout-fixed-height,[layout=container],[layout=fixed-height][height]{display:block;position:relative}.i-amphtml-layout-fill,[layout=fill]:not(.i-amphtml-layout-fill){display:block;overflow:hidden!important;position:absolute;top:0;left:0;bottom:0;right:0}.i-amphtml-layout-flex-item,[layout=flex-item]:not(.i-amphtml-layout-flex-item){display:block;position:relative;-webkit-box-flex:1;-ms-flex:1 1 auto;flex:1 1 auto}.i-amphtml-layout-fluid{position:relative}.i-amphtml-layout-size-defined{overflow:hidden!important}.i-amphtml-layout-awaiting-size{position:absolute!important;top:auto!important;bottom:auto!important}i-amphtml-sizer{display:block!important}.i-amphtml-blurry-placeholder,.i-amphtml-fill-content{display:block;height:0;max-height:100%;max-width:100%;min-height:100%;min-width:100%;width:0;margin:auto}.i-amphtml-layout-size-defined .i-amphtml-fill-content{position:absolute;top:0;left:0;bottom:0;right:0}.i-amphtml-layout-intrinsic .i-amphtml-sizer{max-width:100%}.i-amphtml-replaced-content,.i-amphtml-screen-reader{padding:0!important;border:none!important}.i-amphtml-screen-reader{position:fixed!important;top:0px!important;left:0px!important;width:4px!important;height:4px!important;opacity:0!important;overflow:hidden!important;margin:0!important;display:block!important;visibility:visible!important}.i-amphtml-screen-reader~.i-amphtml-screen-reader{left:8px!important}.i-amphtml-screen-reader~.i-amphtml-screen-reader~.i-amphtml-screen-reader{left:12px!important}.i-amphtml-screen-reader~.i-amphtml-screen-reader~.i-amphtml-screen-reader~.i-amphtml-screen-reader{left:16px!important}.i-amphtml-unresolved{position:relative;overflow:hidden!important}#i-amphtml-wrapper.i-amphtml-scroll-disabled,.i-amphtml-scroll-disabled{overflow-x:hidden!important;overflow-y:hidden!important}.i-amphtml-select-disabled{-webkit-user-select:none!important;-moz-user-select:none!important;-ms-user-select:none!important;user-select:none!important}.i-amphtml-notbuilt,[layout]:not(.i-amphtml-element){position:relative;overflow:hidden!important;color:transparent!important}.i-amphtml-notbuilt:not(.i-amphtml-layout-container)>*,[layout]:not([layout=container]):not(.i-amphtml-element)>*{display:none}.i-amphtml-ghost{visibility:hidden!important}.i-amphtml-element>[placeholder],[layout]:not(.i-amphtml-element)>[placeholder]{display:block}.i-amphtml-element>[placeholder].amp-hidden,.i-amphtml-element>[placeholder].hidden{visibility:hidden}.i-amphtml-element:not(.amp-notsupported)>[fallback],.i-amphtml-layout-container>[placeholder].amp-hidden,.i-amphtml-layout-container>[placeholder].hidden{display:none}.i-amphtml-layout-size-defined>[fallback],.i-amphtml-layout-size-defined>[placeholder]{position:absolute!important;top:0!important;left:0!important;right:0!important;bottom:0!important;z-index:1}.i-amphtml-notbuilt>[placeholder]{display:block!important}.i-amphtml-hidden-by-media-query{display:none!important}.i-amphtml-element-error{background:red!important;color:#fff!important;position:relative!important}.i-amphtml-element-error:before{content:attr(error-message)}i-amp-scroll-container,i-amphtml-scroll-container{position:absolute;top:0;left:0;right:0;bottom:0;display:block}i-amp-scroll-container.amp-active,i-amphtml-scroll-container.amp-active{overflow:auto;-webkit-overflow-scrolling:touch}.i-amphtml-loading-container{display:block!important;pointer-events:none;z-index:1}.i-amphtml-notbuilt>.i-amphtml-loading-container{display:block!important}.i-amphtml-loading-container.amp-hidden{visibility:hidden}.i-amphtml-loader-line{position:absolute;top:0;left:0;right:0;height:1px;overflow:hidden!important;background-color:hsla(0,0%,59.2%,0.2);display:block}.i-amphtml-loader-moving-line{display:block;position:absolute;width:100%;height:100%!important;background-color:hsla(0,0%,59.2%,0.65);z-index:2}@-webkit-keyframes i-amphtml-loader-line-moving{0%{-webkit-transform:translateX(-100%);transform:translateX(-100%)}to{-webkit-transform:translateX(100%);transform:translateX(100%)}}@keyframes i-amphtml-loader-line-moving{0%{-webkit-transform:translateX(-100%);transform:translateX(-100%)}to{-webkit-transform:translateX(100%);transform:translateX(100%)}}.i-amphtml-loader-line.amp-active .i-amphtml-loader-moving-line{-webkit-animation:i-amphtml-loader-line-moving 4s ease infinite;animation:i-amphtml-loader-line-moving 4s ease infinite}.i-amphtml-loader{position:absolute;display:block;height:10px;top:50%;left:50%;-webkit-transform:translateX(-50%) translateY(-50%);transform:translateX(-50%) translateY(-50%);-webkit-transform-origin:50% 50%;transform-origin:50% 50%;white-space:nowrap}.i-amphtml-loader.amp-active .i-amphtml-loader-dot{-webkit-animation:i-amphtml-loader-dots 2s infinite;animation:i-amphtml-loader-dots 2s infinite}.i-amphtml-loader-dot{position:relative;display:inline-block;height:10px;width:10px;margin:2px;border-radius:100%;background-color:rgba(0,0,0,0.3);box-shadow:2px 2px 2px 1px rgba(0,0,0,0.2);will-change:transform}.i-amphtml-loader .i-amphtml-loader-dot:first-child{-webkit-animation-delay:0s;animation-delay:0s}.i-amphtml-loader .i-amphtml-loader-dot:nth-child(2){-webkit-animation-delay:.1s;animation-delay:.1s}.i-amphtml-loader .i-amphtml-loader-dot:nth-child(3){-webkit-animation-delay:.2s;animation-delay:.2s}@-webkit-keyframes i-amphtml-loader-dots{0%,to{-webkit-transform:scale(.7);transform:scale(.7);background-color:rgba(0,0,0,0.3)}50%{-webkit-transform:scale(.8);transform:scale(.8);background-color:rgba(0,0,0,0.5)}}@keyframes i-amphtml-loader-dots{0%,to{-webkit-transform:scale(.7);transform:scale(.7);background-color:rgba(0,0,0,0.3)}50%{-webkit-transform:scale(.8);transform:scale(.8);background-color:rgba(0,0,0,0.5)}}.i-amphtml-element>[overflow]{cursor:pointer;position:relative;z-index:2;visibility:hidden}.i-amphtml-element>[overflow].amp-visible{visibility:visible}template{display:none!important}.amp-border-box,.amp-border-box *,.amp-border-box :after,.amp-border-box :before{box-sizing:border-box}amp-pixel{display:none!important}amp-instagram{padding:64px 0px 0px!important;background-color:#fff}amp-analytics,amp-story-auto-ads{position:fixed!important;top:0!important;width:1px!important;height:1px!important;overflow:hidden!important;visibility:hidden}html.i-amphtml-fie>amp-analytics{position:initial!important}amp-iframe iframe{box-sizing:border-box!important}[amp-access][amp-access-hide]{display:none}[subscriptions-dialog],body:not(.i-amphtml-subs-ready) [subscriptions-action],body:not(.i-amphtml-subs-ready) [subscriptions-section]{display:none!important}[visible-when-invalid]:not(.visible),amp-experiment,amp-live-list>[update],amp-share-tracking,form [submit-error],form [submit-success],form [submitting]{display:none}.i-amphtml-jank-meter{position:fixed;background-color:rgba(232,72,95,0.5);bottom:0;right:0;color:#fff;font-size:16px;z-index:1000;padding:5px}amp-accordion{display:block!important}amp-accordion>section{float:none!important}amp-accordion>section>*{float:none!important;display:block!important;overflow:hidden!important;position:relative!important}.i-amphtml-accordion-content,.i-amphtml-accordion-header,amp-accordion,amp-accordion>section{margin:0}.i-amphtml-accordion-header{cursor:pointer;background-color:#efefef;padding-right:20px;border:1px solid #dfdfdf}amp-accordion>section>:last-child{display:none!important}amp-accordion>section[expanded]>:last-child{display:block!important}amp-list[resizable-children]>.i-amphtml-loading-container.amp-hidden{display:none!important}amp-list[load-more] [load-more-button],amp-list[load-more] [load-more-end],amp-list[load-more] [load-more-failed],amp-list[load-more] [load-more-loading]{display:none}amp-story-page,amp-story[standalone]{display:block!important;height:100%!important;margin:0!important;padding:0!important;overflow:hidden!important;width:100%!important}amp-story[standalone]{background-color:#fff!important;position:relative!important}amp-story-page{background-color:#757575}amp-story .i-amphtml-loader{display:none!important}[amp-fx^=fly-in]{visibility:hidden}amp-addthis[data-widget-type=floating]{position:fixed!important;width:100%!important;height:50px;bottom:0}\n/*# sourceURL=/css/amp.css*/", 
  null, !0);
  _.$installAmpdocServices$$module$src$runtime$$($ampdoc$jscomp$78$$, $initParams$$ || Object.create(null));
  var $viewer$jscomp$25$$ = _.$Services$$module$src$services$viewerForDoc$$($ampdoc$jscomp$78$$);
  $amp$jscomp$1$$.setVisibilityState = function($JSCompiler_StaticMethods_MultidocManager$$module$src$runtime_prototype$attachShadowDoc_$self$$) {
    $JSCompiler_StaticMethods_setVisibilityState_$$($viewer$jscomp$25$$, $JSCompiler_StaticMethods_MultidocManager$$module$src$runtime_prototype$attachShadowDoc_$self$$);
  };
  $amp$jscomp$1$$.postMessage = $viewer$jscomp$25$$.$ka$.bind($viewer$jscomp$25$$);
  var $onMessage$$;
  $amp$jscomp$1$$.onMessage = function($JSCompiler_StaticMethods_MultidocManager$$module$src$runtime_prototype$attachShadowDoc_$self$$) {
    $onMessage$$ = $JSCompiler_StaticMethods_MultidocManager$$module$src$runtime_prototype$attachShadowDoc_$self$$;
  };
  _.$JSCompiler_StaticMethods_setMessageDeliverer$$($viewer$jscomp$25$$, function($hostElement$jscomp$2$$, $url$jscomp$92$$, $initParams$$) {
    if ("broadcast" == $hostElement$jscomp$2$$) {
      return $JSCompiler_StaticMethods_broadcast_$$($JSCompiler_StaticMethods_MultidocManager$$module$src$runtime_prototype$attachShadowDoc_$self$$, $url$jscomp$92$$, $shadowRoot$jscomp$6$$), $initParams$$ ? window.Promise.resolve() : void 0;
    }
    if ($onMessage$$) {
      return $onMessage$$($hostElement$jscomp$2$$, $url$jscomp$92$$, $initParams$$);
    }
  }, $origin$jscomp$17$$);
  $amp$jscomp$1$$.close = function() {
    $JSCompiler_StaticMethods_closeShadowRoot_$$($JSCompiler_StaticMethods_MultidocManager$$module$src$runtime_prototype$attachShadowDoc_$self$$, $shadowRoot$jscomp$6$$);
  };
  _.$getMode$$module$src$mode$$().$development$ && ($amp$jscomp$1$$.$toggleRuntime$ = $viewer$jscomp$25$$.$toggleRuntime$.bind($viewer$jscomp$25$$), $amp$jscomp$1$$.$resources$ = _.$Services$$module$src$services$resourcesForDoc$$($ampdoc$jscomp$78$$));
  $builder$jscomp$1$$($amp$jscomp$1$$, $shadowRoot$jscomp$6$$, $ampdoc$jscomp$78$$).then(function() {
    $ampdoc$jscomp$78$$.$ready_$ = !0;
    $ampdoc$jscomp$78$$.$F$();
    $ampdoc$jscomp$78$$.$F$ = void 0;
    _.$JSCompiler_StaticMethods_signal$$($ampdoc$jscomp$78$$.signals(), "render-start");
    _.$setStyle$$module$src$style$$($hostElement$jscomp$2$$, "visibility", "visible");
  });
  $JSCompiler_StaticMethods_MultidocManager$$module$src$runtime_prototype$attachShadowDoc_$self$$.$D$.includes($shadowRoot$jscomp$6$$) || $JSCompiler_StaticMethods_MultidocManager$$module$src$runtime_prototype$attachShadowDoc_$self$$.$D$.push($shadowRoot$jscomp$6$$);
  "runtime";
  return $amp$jscomp$1$$;
};
$JSCompiler_StaticMethods_mergeShadowHead_$$ = function($JSCompiler_StaticMethods_mergeShadowHead_$self$$, $ampdoc$jscomp$81$$, $shadowRoot$jscomp$9$$, $doc$jscomp$51_n$jscomp$16$$) {
  var $extensionIds$jscomp$4$$ = [];
  if ($doc$jscomp$51_n$jscomp$16$$.head) {
    for (var $parentLinks$$ = {}, $el$jscomp$23_links$jscomp$1_rel$jscomp$1_src$jscomp$9$$ = _.$childElementsByTag$$module$src$dom$$($JSCompiler_StaticMethods_mergeShadowHead_$self$$.$win$.document.head, "link"), $href$182_i$jscomp$129_isRuntime_tagName$jscomp$20$$ = 0; $href$182_i$jscomp$129_isRuntime_tagName$jscomp$20$$ < $el$jscomp$23_links$jscomp$1_rel$jscomp$1_src$jscomp$9$$.length; $href$182_i$jscomp$129_isRuntime_tagName$jscomp$20$$++) {
      var $customElement_href$jscomp$2_name$jscomp$155$$ = $el$jscomp$23_links$jscomp$1_rel$jscomp$1_src$jscomp$9$$[$href$182_i$jscomp$129_isRuntime_tagName$jscomp$20$$].getAttribute("href");
      $customElement_href$jscomp$2_name$jscomp$155$$ && ($parentLinks$$[$customElement_href$jscomp$2_name$jscomp$155$$] = !0);
    }
    for ($doc$jscomp$51_n$jscomp$16$$ = $doc$jscomp$51_n$jscomp$16$$.head.firstElementChild; $doc$jscomp$51_n$jscomp$16$$; $doc$jscomp$51_n$jscomp$16$$ = $doc$jscomp$51_n$jscomp$16$$.nextElementSibling) {
      switch($href$182_i$jscomp$129_isRuntime_tagName$jscomp$20$$ = $doc$jscomp$51_n$jscomp$16$$.tagName, $customElement_href$jscomp$2_name$jscomp$155$$ = $doc$jscomp$51_n$jscomp$16$$.getAttribute("name"), $el$jscomp$23_links$jscomp$1_rel$jscomp$1_src$jscomp$9$$ = $doc$jscomp$51_n$jscomp$16$$.getAttribute("rel"), $href$182_i$jscomp$129_isRuntime_tagName$jscomp$20$$) {
        case "TITLE":
          $shadowRoot$jscomp$9$$.AMP.title = $doc$jscomp$51_n$jscomp$16$$.textContent;
          "runtime";
          break;
        case "META":
          $doc$jscomp$51_n$jscomp$16$$.hasAttribute("charset") || "viewport" != $customElement_href$jscomp$2_name$jscomp$155$$ && _.$dev$$module$src$log$$().$Log$$module$src$log_prototype$warn$("runtime", "meta ignored: ", $doc$jscomp$51_n$jscomp$16$$);
          break;
        case "LINK":
          $href$182_i$jscomp$129_isRuntime_tagName$jscomp$20$$ = $doc$jscomp$51_n$jscomp$16$$.getAttribute("href");
          "canonical" == $el$jscomp$23_links$jscomp$1_rel$jscomp$1_src$jscomp$9$$ ? $shadowRoot$jscomp$9$$.AMP.canonicalUrl = $href$182_i$jscomp$129_isRuntime_tagName$jscomp$20$$ : "stylesheet" != $el$jscomp$23_links$jscomp$1_rel$jscomp$1_src$jscomp$9$$ || $parentLinks$$[$href$182_i$jscomp$129_isRuntime_tagName$jscomp$20$$] || ($parentLinks$$[$href$182_i$jscomp$129_isRuntime_tagName$jscomp$20$$] = !0, $el$jscomp$23_links$jscomp$1_rel$jscomp$1_src$jscomp$9$$ = $JSCompiler_StaticMethods_mergeShadowHead_$self$$.$win$.document.createElement("link"), 
          $el$jscomp$23_links$jscomp$1_rel$jscomp$1_src$jscomp$9$$.setAttribute("rel", "stylesheet"), $el$jscomp$23_links$jscomp$1_rel$jscomp$1_src$jscomp$9$$.setAttribute("type", "text/css"), $el$jscomp$23_links$jscomp$1_rel$jscomp$1_src$jscomp$9$$.setAttribute("href", $href$182_i$jscomp$129_isRuntime_tagName$jscomp$20$$), $JSCompiler_StaticMethods_mergeShadowHead_$self$$.$win$.document.head.appendChild($el$jscomp$23_links$jscomp$1_rel$jscomp$1_src$jscomp$9$$));
          "runtime";
          break;
        case "STYLE":
          $doc$jscomp$51_n$jscomp$16$$.hasAttribute("amp-boilerplate") ? "runtime" : $doc$jscomp$51_n$jscomp$16$$.hasAttribute("amp-custom") ? (_.$installStylesForDoc$$module$src$style_installer$$($ampdoc$jscomp$81$$, $doc$jscomp$51_n$jscomp$16$$.textContent, null, !1, "amp-custom"), "runtime") : $doc$jscomp$51_n$jscomp$16$$.hasAttribute("amp-keyframes") && (_.$installStylesForDoc$$module$src$style_installer$$($ampdoc$jscomp$81$$, $doc$jscomp$51_n$jscomp$16$$.textContent, null, !1, "amp-keyframes"), 
          "runtime");
          break;
        case "SCRIPT":
          if ($doc$jscomp$51_n$jscomp$16$$.hasAttribute("src")) {
            "runtime";
            $el$jscomp$23_links$jscomp$1_rel$jscomp$1_src$jscomp$9$$ = $doc$jscomp$51_n$jscomp$16$$.getAttribute("src");
            $href$182_i$jscomp$129_isRuntime_tagName$jscomp$20$$ = -1 != $el$jscomp$23_links$jscomp$1_rel$jscomp$1_src$jscomp$9$$.indexOf("/amp.js") || -1 != $el$jscomp$23_links$jscomp$1_rel$jscomp$1_src$jscomp$9$$.indexOf("/v0.js");
            $customElement_href$jscomp$2_name$jscomp$155$$ = $doc$jscomp$51_n$jscomp$16$$.getAttribute("custom-element");
            var $customTemplate$$ = $doc$jscomp$51_n$jscomp$16$$.getAttribute("custom-template"), $match$jscomp$7_version$jscomp$7$$ = /-(\d+.\d+)(.max)?\.js$/.exec($el$jscomp$23_links$jscomp$1_rel$jscomp$1_src$jscomp$9$$);
            $match$jscomp$7_version$jscomp$7$$ = $match$jscomp$7_version$jscomp$7$$ ? $match$jscomp$7_version$jscomp$7$$[1] : "0.1";
            $href$182_i$jscomp$129_isRuntime_tagName$jscomp$20$$ ? "runtime" : $customElement_href$jscomp$2_name$jscomp$155$$ || $customTemplate$$ ? (_.$JSCompiler_StaticMethods_installExtensionForDoc$$($JSCompiler_StaticMethods_mergeShadowHead_$self$$.$extensions_$, $ampdoc$jscomp$81$$, $customElement_href$jscomp$2_name$jscomp$155$$ || $customTemplate$$, $match$jscomp$7_version$jscomp$7$$), "runtime", $customElement_href$jscomp$2_name$jscomp$155$$ && $extensionIds$jscomp$4$$.push($customElement_href$jscomp$2_name$jscomp$155$$)) : 
            $doc$jscomp$51_n$jscomp$16$$.hasAttribute("data-amp-report-test") || _.$user$$module$src$log$$().error("runtime", "- unknown script: ", $doc$jscomp$51_n$jscomp$16$$, $el$jscomp$23_links$jscomp$1_rel$jscomp$1_src$jscomp$9$$);
          } else {
            -1 == ($doc$jscomp$51_n$jscomp$16$$.getAttribute("type") || "application/javascript").indexOf("javascript") ? ($shadowRoot$jscomp$9$$.appendChild($JSCompiler_StaticMethods_mergeShadowHead_$self$$.$win$.document.importNode($doc$jscomp$51_n$jscomp$16$$, !0)), "runtime") : _.$user$$module$src$log$$().error("runtime", "- unallowed inline javascript: ", $doc$jscomp$51_n$jscomp$16$$);
          }
          break;
        case "NOSCRIPT":
          break;
        default:
          _.$user$$module$src$log$$().error("runtime", "- UNKNOWN head element:", $doc$jscomp$51_n$jscomp$16$$);
      }
    }
  }
  return $extensionIds$jscomp$4$$;
};
$JSCompiler_StaticMethods_broadcast_$$ = function($JSCompiler_StaticMethods_broadcast_$self$$, $data$jscomp$67$$, $sender$jscomp$1$$) {
  $JSCompiler_StaticMethods_purgeShadowRoots_$$($JSCompiler_StaticMethods_broadcast_$self$$);
  $JSCompiler_StaticMethods_broadcast_$self$$.$D$.forEach(function($shadowRoot$jscomp$10$$) {
    if ($shadowRoot$jscomp$10$$ != $sender$jscomp$1$$) {
      var $viewer$jscomp$26$$ = _.$Services$$module$src$services$viewerForDoc$$($shadowRoot$jscomp$10$$.AMP.ampdoc);
      $JSCompiler_StaticMethods_broadcast_$self$$.$timer_$.delay(function() {
        $viewer$jscomp$26$$.$ka$("broadcast", $data$jscomp$67$$, !1);
      }, 0);
    }
  });
};
$JSCompiler_StaticMethods_closeShadowRoot_$$ = function($JSCompiler_StaticMethods_closeShadowRoot_$self_amp$jscomp$4_viewer$jscomp$inline_1748$$, $ampdoc$jscomp$82_shadowRoot$jscomp$11$$) {
  $JSCompiler_StaticMethods_removeShadowRoot_$$($JSCompiler_StaticMethods_closeShadowRoot_$self_amp$jscomp$4_viewer$jscomp$inline_1748$$, $ampdoc$jscomp$82_shadowRoot$jscomp$11$$);
  $JSCompiler_StaticMethods_closeShadowRoot_$self_amp$jscomp$4_viewer$jscomp$inline_1748$$ = $ampdoc$jscomp$82_shadowRoot$jscomp$11$$.AMP;
  delete $ampdoc$jscomp$82_shadowRoot$jscomp$11$$.AMP;
  $ampdoc$jscomp$82_shadowRoot$jscomp$11$$ = $JSCompiler_StaticMethods_closeShadowRoot_$self_amp$jscomp$4_viewer$jscomp$inline_1748$$.ampdoc;
  $JSCompiler_StaticMethods_closeShadowRoot_$self_amp$jscomp$4_viewer$jscomp$inline_1748$$ = _.$Services$$module$src$services$viewerForDoc$$($ampdoc$jscomp$82_shadowRoot$jscomp$11$$);
  $JSCompiler_StaticMethods_setVisibilityState_$$($JSCompiler_StaticMethods_closeShadowRoot_$self_amp$jscomp$4_viewer$jscomp$inline_1748$$, "inactive");
  _.$disposeServicesInternal$$module$src$service$$($ampdoc$jscomp$82_shadowRoot$jscomp$11$$);
};
$JSCompiler_StaticMethods_removeShadowRoot_$$ = function($JSCompiler_StaticMethods_removeShadowRoot_$self$$, $index$jscomp$72_shadowRoot$jscomp$12$$) {
  $index$jscomp$72_shadowRoot$jscomp$12$$ = $JSCompiler_StaticMethods_removeShadowRoot_$self$$.$D$.indexOf($index$jscomp$72_shadowRoot$jscomp$12$$);
  -1 != $index$jscomp$72_shadowRoot$jscomp$12$$ && $JSCompiler_StaticMethods_removeShadowRoot_$self$$.$D$.splice($index$jscomp$72_shadowRoot$jscomp$12$$, 1);
};
$JSCompiler_StaticMethods_closeShadowRootAsync_$$ = function($JSCompiler_StaticMethods_closeShadowRootAsync_$self$$, $shadowRoot$jscomp$13$$) {
  $JSCompiler_StaticMethods_closeShadowRootAsync_$self$$.$timer_$.delay(function() {
    $JSCompiler_StaticMethods_closeShadowRoot_$$($JSCompiler_StaticMethods_closeShadowRootAsync_$self$$, $shadowRoot$jscomp$13$$);
  }, 0);
};
$JSCompiler_StaticMethods_purgeShadowRoots_$$ = function($JSCompiler_StaticMethods_purgeShadowRoots_$self$$) {
  $JSCompiler_StaticMethods_purgeShadowRoots_$self$$.$D$.forEach(function($shadowRoot$jscomp$14$$) {
    $shadowRoot$jscomp$14$$.host && _.$isConnectedNode$$module$src$dom$$($shadowRoot$jscomp$14$$.host) || (_.$user$$module$src$log$$().$Log$$module$src$log_prototype$warn$("runtime", "Shadow doc wasn't previously closed"), $JSCompiler_StaticMethods_removeShadowRoot_$$($JSCompiler_StaticMethods_purgeShadowRoots_$self$$, $shadowRoot$jscomp$14$$), $JSCompiler_StaticMethods_closeShadowRootAsync_$$($JSCompiler_StaticMethods_purgeShadowRoots_$self$$, $shadowRoot$jscomp$14$$));
  });
};
$maybeLoadCorrectVersion$$module$src$runtime$$ = function($JSCompiler_StaticMethods_reloadExtension$self$jscomp$inline_1753_win$jscomp$205$$, $extensionId$jscomp$inline_1754_fnOrStruct$jscomp$5$$) {
  if (!_.$isExperimentOn$$module$src$experiments$$($JSCompiler_StaticMethods_reloadExtension$self$jscomp$inline_1753_win$jscomp$205$$, "version-locking") || "function" == typeof $extensionId$jscomp$inline_1754_fnOrStruct$jscomp$5$$ || "1901181729101" == $extensionId$jscomp$inline_1754_fnOrStruct$jscomp$5$$.v) {
    return !1;
  }
  var $matches$jscomp$inline_5865_scriptInHead$jscomp$1$$ = $JSCompiler_StaticMethods_reloadExtension$self$jscomp$inline_1753_win$jscomp$205$$.document.head.querySelector('[custom-element="' + $extensionId$jscomp$inline_1754_fnOrStruct$jscomp$5$$.n + '"]:not([i-amphtml-inserted])');
  if (!$matches$jscomp$inline_5865_scriptInHead$jscomp$1$$) {
    return !1;
  }
  $JSCompiler_StaticMethods_reloadExtension$self$jscomp$inline_1753_win$jscomp$205$$ = _.$Services$$module$src$services$extensionsFor$$($JSCompiler_StaticMethods_reloadExtension$self$jscomp$inline_1753_win$jscomp$205$$);
  $extensionId$jscomp$inline_1754_fnOrStruct$jscomp$5$$ = $extensionId$jscomp$inline_1754_fnOrStruct$jscomp$5$$.n;
  $JSCompiler_StaticMethods_reloadExtension$self$jscomp$inline_1753_win$jscomp$205$$.$extensions_$[$extensionId$jscomp$inline_1754_fnOrStruct$jscomp$5$$] && delete $JSCompiler_StaticMethods_reloadExtension$self$jscomp$inline_1753_win$jscomp$205$$.$extensions_$[$extensionId$jscomp$inline_1754_fnOrStruct$jscomp$5$$];
  $matches$jscomp$inline_5865_scriptInHead$jscomp$1$$.removeAttribute("custom-element");
  $matches$jscomp$inline_5865_scriptInHead$jscomp$1$$.setAttribute("i-amphtml-loaded-new-version", $extensionId$jscomp$inline_1754_fnOrStruct$jscomp$5$$);
  $matches$jscomp$inline_5865_scriptInHead$jscomp$1$$ = $matches$jscomp$inline_5865_scriptInHead$jscomp$1$$.src.match(/^(.*)\/(.*)-([0-9.]+)\.js$/i);
  _.$JSCompiler_StaticMethods_preloadExtension$$($JSCompiler_StaticMethods_reloadExtension$self$jscomp$inline_1753_win$jscomp$205$$, $extensionId$jscomp$inline_1754_fnOrStruct$jscomp$5$$, $matches$jscomp$inline_5865_scriptInHead$jscomp$1$$ ? $matches$jscomp$inline_5865_scriptInHead$jscomp$1$$[3] : void 0);
  return !0;
};
$maybePumpEarlyFrame$$module$src$runtime$$ = function($win$jscomp$206$$, $cb$jscomp$4$$) {
  _.$isExperimentOn$$module$src$experiments$$($win$jscomp$206$$, "pump-early-frame") ? $win$jscomp$206$$.document.body ? 0 < $includedServices$$module$src$render_delaying_services$$($win$jscomp$206$$).length ? $cb$jscomp$4$$() : _.$Services$$module$src$services$timerFor$$($win$jscomp$206$$).delay($cb$jscomp$4$$, 1) : $cb$jscomp$4$$() : $cb$jscomp$4$$();
};
$AmpDocService$$module$src$service$ampdoc_impl$$ = function($win$jscomp$207$$, $isSingleDoc$$) {
  this.$win$ = $win$jscomp$207$$;
  this.$F$ = null;
  $isSingleDoc$$ && (this.$F$ = new _.$AmpDocSingle$$module$src$service$ampdoc_impl$$($win$jscomp$207$$));
  this.$G$ = _.$isExperimentOn$$module$src$experiments$$($win$jscomp$207$$, "ampdoc-closest");
  this.$D$ = null;
};
$JSCompiler_StaticMethods_getAmpDocIfAvailable$$ = function($JSCompiler_StaticMethods_getAmpDocIfAvailable$self$$, $n$jscomp$17_opt_node_shadowRoot$jscomp$15$$, $$jscomp$destructuring$var141_closestAmpDoc_opt_options$jscomp$81$$) {
  $$jscomp$destructuring$var141_closestAmpDoc_opt_options$jscomp$81$$ = void 0 === $$jscomp$destructuring$var141_closestAmpDoc_opt_options$jscomp$81$$ ? {} : $$jscomp$destructuring$var141_closestAmpDoc_opt_options$jscomp$81$$;
  $$jscomp$destructuring$var141_closestAmpDoc_opt_options$jscomp$81$$ = void 0 === $$jscomp$destructuring$var141_closestAmpDoc_opt_options$jscomp$81$$.$closestAmpDoc$ ? !1 : $$jscomp$destructuring$var141_closestAmpDoc_opt_options$jscomp$81$$.$closestAmpDoc$;
  if ($JSCompiler_StaticMethods_getAmpDocIfAvailable$self$$.$F$ && !$$jscomp$destructuring$var141_closestAmpDoc_opt_options$jscomp$81$$ && !$JSCompiler_StaticMethods_getAmpDocIfAvailable$self$$.$G$) {
    return $JSCompiler_StaticMethods_getAmpDocIfAvailable$self$$.$F$;
  }
  if (_.$isExperimentOn$$module$src$experiments$$($JSCompiler_StaticMethods_getAmpDocIfAvailable$self$$.$win$, "ampdoc-shell") && $n$jscomp$17_opt_node_shadowRoot$jscomp$15$$ === $JSCompiler_StaticMethods_getAmpDocIfAvailable$self$$.$win$.document) {
    if ($JSCompiler_StaticMethods_getAmpDocIfAvailable$self$$.$D$) {
      return $JSCompiler_StaticMethods_getAmpDocIfAvailable$self$$.$D$;
    }
    throw _.$dev$$module$src$log$$().$createError$("Ampdoc for shell has not been installed");
  }
  for (; $n$jscomp$17_opt_node_shadowRoot$jscomp$15$$;) {
    if ($n$jscomp$17_opt_node_shadowRoot$jscomp$15$$.$ampdoc_$ && ($JSCompiler_StaticMethods_getAmpDocIfAvailable$self$$.$G$ || !$$jscomp$destructuring$var141_closestAmpDoc_opt_options$jscomp$81$$)) {
      return $n$jscomp$17_opt_node_shadowRoot$jscomp$15$$.$ampdoc_$;
    }
    var $ampdoc$jscomp$83_frameElement$jscomp$5$$ = _.$getParentWindowFrameElement$$module$src$service$$($n$jscomp$17_opt_node_shadowRoot$jscomp$15$$, $JSCompiler_StaticMethods_getAmpDocIfAvailable$self$$.$win$);
    if ($ampdoc$jscomp$83_frameElement$jscomp$5$$) {
      $n$jscomp$17_opt_node_shadowRoot$jscomp$15$$ = $ampdoc$jscomp$83_frameElement$jscomp$5$$;
    } else {
      $n$jscomp$17_opt_node_shadowRoot$jscomp$15$$ = $getShadowRootNode$$module$src$shadow_embed$$($n$jscomp$17_opt_node_shadowRoot$jscomp$15$$);
      if (!$n$jscomp$17_opt_node_shadowRoot$jscomp$15$$) {
        if ($JSCompiler_StaticMethods_getAmpDocIfAvailable$self$$.$D$) {
          return $JSCompiler_StaticMethods_getAmpDocIfAvailable$self$$.$D$;
        }
        break;
      }
      if ($ampdoc$jscomp$83_frameElement$jscomp$5$$ = $n$jscomp$17_opt_node_shadowRoot$jscomp$15$$.__AMPDOC) {
        return $ampdoc$jscomp$83_frameElement$jscomp$5$$;
      }
      $n$jscomp$17_opt_node_shadowRoot$jscomp$15$$ = $n$jscomp$17_opt_node_shadowRoot$jscomp$15$$.host;
    }
  }
  return $JSCompiler_StaticMethods_getAmpDocIfAvailable$self$$.$F$ ? $JSCompiler_StaticMethods_getAmpDocIfAvailable$self$$.$F$ : null;
};
$JSCompiler_StaticMethods_installShadowDoc$$ = function($JSCompiler_StaticMethods_installShadowDoc$self_ampdoc$jscomp$85$$, $url$jscomp$95$$, $shadowRoot$jscomp$16$$) {
  $JSCompiler_StaticMethods_installShadowDoc$self_ampdoc$jscomp$85$$ = new _.$AmpDocShadow$$module$src$service$ampdoc_impl$$($JSCompiler_StaticMethods_installShadowDoc$self_ampdoc$jscomp$85$$.$win$, $url$jscomp$95$$, $shadowRoot$jscomp$16$$);
  return $shadowRoot$jscomp$16$$.__AMPDOC = $JSCompiler_StaticMethods_installShadowDoc$self_ampdoc$jscomp$85$$;
};
_.$AmpDoc$$module$src$service$ampdoc_impl$$ = function($win$jscomp$208$$) {
  this.$win$ = $win$jscomp$208$$;
  this.$K$ = new _.$Signals$$module$src$utils$signals$$;
  this.$D$ = [];
};
_.$AmpDocSingle$$module$src$service$ampdoc_impl$$ = function($win$jscomp$209$$) {
  _.$AmpDoc$$module$src$service$ampdoc_impl$$.call(this, $win$jscomp$209$$);
  var $$jscomp$this$jscomp$177$$ = this;
  this.$F$ = this.$win$.document.body ? window.Promise.resolve(this.$win$.document.body) : _.$waitForBodyPromise$$module$src$dom$$(this.$win$.document).then(function() {
    return $$jscomp$this$jscomp$177$$.$getBody$();
  });
  this.$G$ = _.$whenDocumentReady$$module$src$document_ready$$(this.$win$.document);
};
_.$AmpDocShadow$$module$src$service$ampdoc_impl$$ = function($bodyDeferred_readyDeferred_win$jscomp$210$$, $url$jscomp$96$$, $shadowRoot$jscomp$17$$) {
  _.$AmpDoc$$module$src$service$ampdoc_impl$$.call(this, $bodyDeferred_readyDeferred_win$jscomp$210$$);
  this.$url_$ = $url$jscomp$96$$;
  this.$I$ = $shadowRoot$jscomp$17$$;
  this.$G$ = null;
  $bodyDeferred_readyDeferred_win$jscomp$210$$ = new _.$Deferred$$module$src$utils$promise$$;
  this.$O$ = $bodyDeferred_readyDeferred_win$jscomp$210$$.$promise$;
  this.$J$ = $bodyDeferred_readyDeferred_win$jscomp$210$$.resolve;
  this.$ready_$ = !1;
  $bodyDeferred_readyDeferred_win$jscomp$210$$ = new _.$Deferred$$module$src$utils$promise$$;
  this.$P$ = $bodyDeferred_readyDeferred_win$jscomp$210$$.$promise$;
  this.$F$ = $bodyDeferred_readyDeferred_win$jscomp$210$$.resolve;
};
_.$JSCompiler_StaticMethods_setBody$$ = function($JSCompiler_StaticMethods_setBody$self$$, $body$jscomp$12$$) {
  $JSCompiler_StaticMethods_setBody$self$$.$G$ = $body$jscomp$12$$;
  $JSCompiler_StaticMethods_setBody$self$$.$J$($body$jscomp$12$$);
  $JSCompiler_StaticMethods_setBody$self$$.$J$ = void 0;
};
_.$installDocService$$module$src$service$ampdoc_impl$$ = function($isSingleDoc$jscomp$1$$) {
  var $win$jscomp$212$$ = window.self;
  _.$registerServiceBuilder$$module$src$service$$($win$jscomp$212$$, "ampdoc", function() {
    return new $AmpDocService$$module$src$service$ampdoc_impl$$($win$jscomp$212$$, $isSingleDoc$jscomp$1$$);
  });
};
$Performance$$module$src$service$performance_impl$$ = function($win$jscomp$213$$) {
  var $$jscomp$this$jscomp$178$$ = this;
  this.$win$ = $win$jscomp$213$$;
  this.$J$ = this.$win$.Date.now();
  this.$I$ = [];
  this.$O$ = this.$viewer_$ = null;
  this.$G$ = this.$K$ = !1;
  this.$R$ = _.$map$$module$src$utils$object$$();
  this.$P$ = "";
  this.$V$ = this.$U$ = this.$W$ = null;
  $JSCompiler_StaticMethods_addEnabledExperiment$$(this, "rtv-" + _.$getMode$$module$src$mode$$(this.$win$).$rtvVersion$);
  _.$isCanary$$module$src$experiments$$(this.$win$) && $JSCompiler_StaticMethods_addEnabledExperiment$$(this, "canary");
  $whenDocumentComplete$$module$src$document_ready$$($win$jscomp$213$$.document).then(function() {
    $$jscomp$this$jscomp$178$$.$D$("ol");
    if (!$$jscomp$this$jscomp$178$$.$win$.PerformancePaintTiming && $$jscomp$this$jscomp$178$$.$win$.$chrome$ && "function" == typeof $$jscomp$this$jscomp$178$$.$win$.$chrome$.$loadTimes$) {
      var $win$jscomp$213$$ = 1000 * $$jscomp$this$jscomp$178$$.$win$.$chrome$.$loadTimes$().firstPaintTime - $$jscomp$this$jscomp$178$$.$win$.performance.timing.navigationStart;
      1 >= $win$jscomp$213$$ || $$jscomp$this$jscomp$178$$.$D$("fp", $win$jscomp$213$$);
    }
    $$jscomp$this$jscomp$178$$.$F$();
  });
  $JSCompiler_StaticMethods_registerPaintTimingObserver_$$(this);
};
_.$JSCompiler_StaticMethods_coreServicesAvailable$$ = function($JSCompiler_StaticMethods_coreServicesAvailable$self$$) {
  var $channelPromise_documentElement$jscomp$7$$ = $JSCompiler_StaticMethods_coreServicesAvailable$self$$.$win$.document.documentElement;
  $JSCompiler_StaticMethods_coreServicesAvailable$self$$.$viewer_$ = _.$Services$$module$src$services$viewerForDoc$$($channelPromise_documentElement$jscomp$7$$);
  $JSCompiler_StaticMethods_coreServicesAvailable$self$$.$O$ = _.$Services$$module$src$services$resourcesForDoc$$($channelPromise_documentElement$jscomp$7$$);
  $JSCompiler_StaticMethods_coreServicesAvailable$self$$.$G$ = !!$JSCompiler_StaticMethods_coreServicesAvailable$self$$.$viewer_$.$F$ && "1" === $JSCompiler_StaticMethods_coreServicesAvailable$self$$.$viewer_$.$params_$.csi;
  _.$JSCompiler_StaticMethods_Viewer$$module$src$service$viewer_impl_prototype$onVisibilityChanged$$($JSCompiler_StaticMethods_coreServicesAvailable$self$$.$viewer_$, $JSCompiler_StaticMethods_coreServicesAvailable$self$$.$F$.bind($JSCompiler_StaticMethods_coreServicesAvailable$self$$));
  $JSCompiler_StaticMethods_measureUserPerceivedVisualCompletenessTime_$$($JSCompiler_StaticMethods_coreServicesAvailable$self$$);
  $channelPromise_documentElement$jscomp$7$$ = $JSCompiler_StaticMethods_coreServicesAvailable$self$$.$viewer_$.$F$;
  $JSCompiler_StaticMethods_coreServicesAvailable$self$$.$viewer_$.$D$.then(function() {
    $JSCompiler_StaticMethods_coreServicesAvailable$self$$.$D$("ofv");
    $JSCompiler_StaticMethods_coreServicesAvailable$self$$.$F$();
  });
  $channelPromise_documentElement$jscomp$7$$ ? $channelPromise_documentElement$jscomp$7$$.then(function() {
    $JSCompiler_StaticMethods_coreServicesAvailable$self$$.$K$ = !0;
    $JSCompiler_StaticMethods_coreServicesAvailable$self$$.$D$("msr", $JSCompiler_StaticMethods_coreServicesAvailable$self$$.$win$.Date.now() - $JSCompiler_StaticMethods_coreServicesAvailable$self$$.$J$);
    $JSCompiler_StaticMethods_flushQueuedTicks_$$($JSCompiler_StaticMethods_coreServicesAvailable$self$$);
    $JSCompiler_StaticMethods_coreServicesAvailable$self$$.$F$();
  }) : window.Promise.resolve();
};
$JSCompiler_StaticMethods_registerPaintTimingObserver_$$ = function($JSCompiler_StaticMethods_registerPaintTimingObserver_$self$$) {
  if ($JSCompiler_StaticMethods_registerPaintTimingObserver_$self$$.$win$.PerformancePaintTiming) {
    var $recordedFirstPaint$$ = !1, $recordedFirstContentfulPaint$$ = !1, $processEntry$$ = function($processEntry$$) {
      "first-paint" != $processEntry$$.name || $recordedFirstPaint$$ ? "first-contentful-paint" != $processEntry$$.name || $recordedFirstContentfulPaint$$ || ($JSCompiler_StaticMethods_registerPaintTimingObserver_$self$$.$D$("fcp", $processEntry$$.startTime + $processEntry$$.duration), $recordedFirstContentfulPaint$$ = !0) : ($JSCompiler_StaticMethods_registerPaintTimingObserver_$self$$.$D$("fp", $processEntry$$.startTime + $processEntry$$.duration), $recordedFirstPaint$$ = !0);
    }, $observer$jscomp$2$$ = new $JSCompiler_StaticMethods_registerPaintTimingObserver_$self$$.$win$.PerformanceObserver(function($recordedFirstPaint$$) {
      $recordedFirstPaint$$.getEntries().forEach($processEntry$$);
      $JSCompiler_StaticMethods_registerPaintTimingObserver_$self$$.$F$();
    });
    $JSCompiler_StaticMethods_registerPaintTimingObserver_$self$$.$win$.performance.getEntriesByType("paint").forEach($processEntry$$);
    $observer$jscomp$2$$.observe({entryTypes:["paint"]});
  }
};
$JSCompiler_StaticMethods_measureUserPerceivedVisualCompletenessTime_$$ = function($JSCompiler_StaticMethods_measureUserPerceivedVisualCompletenessTime_$self$$) {
  var $didStartInPrerender$$ = !$JSCompiler_StaticMethods_measureUserPerceivedVisualCompletenessTime_$self$$.$viewer_$.$R$, $docVisibleTime$$ = $didStartInPrerender$$ ? -1 : $JSCompiler_StaticMethods_measureUserPerceivedVisualCompletenessTime_$self$$.$J$;
  $didStartInPrerender$$ && $JSCompiler_StaticMethods_measureUserPerceivedVisualCompletenessTime_$self$$.$viewer_$.$D$.then(function() {
    $docVisibleTime$$ = $JSCompiler_StaticMethods_measureUserPerceivedVisualCompletenessTime_$self$$.$win$.Date.now();
    $JSCompiler_StaticMethods_measureUserPerceivedVisualCompletenessTime_$self$$.mark("visible");
  });
  $JSCompiler_StaticMethods_whenViewportLayoutComplete_$$($JSCompiler_StaticMethods_measureUserPerceivedVisualCompletenessTime_$self$$).then(function() {
    if ($didStartInPrerender$$) {
      var $userPerceivedVisualCompletenesssTime$$ = -1 < $docVisibleTime$$ ? $JSCompiler_StaticMethods_measureUserPerceivedVisualCompletenessTime_$self$$.$win$.Date.now() - $docVisibleTime$$ : 0;
      $JSCompiler_StaticMethods_measureUserPerceivedVisualCompletenessTime_$self$$.$viewer_$.$D$.then(function() {
        $JSCompiler_StaticMethods_measureUserPerceivedVisualCompletenessTime_$self$$.$D$("pc", $userPerceivedVisualCompletenesssTime$$);
      });
      $JSCompiler_StaticMethods_prerenderComplete_$$($JSCompiler_StaticMethods_measureUserPerceivedVisualCompletenessTime_$self$$, $userPerceivedVisualCompletenesssTime$$);
      $JSCompiler_StaticMethods_measureUserPerceivedVisualCompletenessTime_$self$$.mark("pc");
    } else {
      $JSCompiler_StaticMethods_measureUserPerceivedVisualCompletenessTime_$self$$.$D$("pc"), $JSCompiler_StaticMethods_prerenderComplete_$$($JSCompiler_StaticMethods_measureUserPerceivedVisualCompletenessTime_$self$$, $JSCompiler_StaticMethods_measureUserPerceivedVisualCompletenessTime_$self$$.$win$.Date.now() - $docVisibleTime$$);
    }
    $JSCompiler_StaticMethods_measureUserPerceivedVisualCompletenessTime_$self$$.$F$();
  });
};
$JSCompiler_StaticMethods_whenViewportLayoutComplete_$$ = function($JSCompiler_StaticMethods_whenViewportLayoutComplete_$self$$) {
  var $size$jscomp$17$$ = _.$Services$$module$src$services$viewportForDoc$$($JSCompiler_StaticMethods_whenViewportLayoutComplete_$self$$.$win$.document.documentElement).$getSize$();
  return $JSCompiler_StaticMethods_getResourcesInRect$$($JSCompiler_StaticMethods_whenViewportLayoutComplete_$self$$.$O$, $JSCompiler_StaticMethods_whenViewportLayoutComplete_$self$$.$win$, _.$layoutRectLtwh$$module$src$layout_rect$$(0, 0, $size$jscomp$17$$.width, $size$jscomp$17$$.height), !0).then(function($JSCompiler_StaticMethods_whenViewportLayoutComplete_$self$$) {
    return window.Promise.all($JSCompiler_StaticMethods_whenViewportLayoutComplete_$self$$.map(function($JSCompiler_StaticMethods_whenViewportLayoutComplete_$self$$) {
      return $JSCompiler_StaticMethods_whenViewportLayoutComplete_$self$$.$loadPromise_$;
    }));
  });
};
$JSCompiler_StaticMethods_addEnabledExperiment$$ = function($JSCompiler_StaticMethods_addEnabledExperiment$self$$, $experimentId$jscomp$3$$) {
  $JSCompiler_StaticMethods_addEnabledExperiment$self$$.$R$[$experimentId$jscomp$3$$] = !0;
  $JSCompiler_StaticMethods_addEnabledExperiment$self$$.$P$ = Object.keys($JSCompiler_StaticMethods_addEnabledExperiment$self$$.$R$).join(",");
};
$JSCompiler_StaticMethods_flushQueuedTicks_$$ = function($JSCompiler_StaticMethods_flushQueuedTicks_$self$$) {
  $JSCompiler_StaticMethods_flushQueuedTicks_$self$$.$viewer_$ && ($JSCompiler_StaticMethods_flushQueuedTicks_$self$$.$G$ && $JSCompiler_StaticMethods_flushQueuedTicks_$self$$.$I$.forEach(function($tickEvent$$) {
    _.$JSCompiler_StaticMethods_Viewer$$module$src$service$viewer_impl_prototype$sendMessage$$($JSCompiler_StaticMethods_flushQueuedTicks_$self$$.$viewer_$, "tick", $tickEvent$$);
  }), $JSCompiler_StaticMethods_flushQueuedTicks_$self$$.$I$.length = 0);
};
$JSCompiler_StaticMethods_prerenderComplete_$$ = function($JSCompiler_StaticMethods_prerenderComplete_$self$$, $value$jscomp$143$$) {
  $JSCompiler_StaticMethods_prerenderComplete_$self$$.$viewer_$ && _.$JSCompiler_StaticMethods_Viewer$$module$src$service$viewer_impl_prototype$sendMessage$$($JSCompiler_StaticMethods_prerenderComplete_$self$$.$viewer_$, "prerenderComplete", _.$dict$$module$src$utils$object$$({value:$value$jscomp$143$$}), !0);
};
_.$installPerformanceService$$module$src$service$performance_impl$$ = function() {
  _.$registerServiceBuilder$$module$src$service$$(window.self, "performance", $Performance$$module$src$service$performance_impl$$);
};
_.$maybeValidate$$module$src$validator_integration$$ = function() {
  var $win$jscomp$214$$ = window.self, $filename$jscomp$2$$ = $win$jscomp$214$$.location.href;
  if (!_.$startsWith$$module$src$string$$($filename$jscomp$2$$, "about:")) {
    var $validator$$ = !1;
    _.$getMode$$module$src$mode$$().$development$ && ($validator$$ = "0" !== _.$parseQueryString_$$module$src$url_parse_query_string$$($win$jscomp$214$$.location.$D$ || $win$jscomp$214$$.location.hash).validate);
    $validator$$ ? $loadScript$$module$src$validator_integration$$($win$jscomp$214$$.document, _.$urls$$module$src$config$$.cdn + "/v0/validator.js").then(function() {
      window.amp.validator.validateUrlAndLog($filename$jscomp$2$$, $win$jscomp$214$$.document, _.$getMode$$module$src$mode$$().filter);
    }) : _.$getMode$$module$src$mode$$().$examiner$ && $loadScript$$module$src$validator_integration$$($win$jscomp$214$$.document, _.$urls$$module$src$config$$.cdn + "/examiner.js");
  }
};
$loadScript$$module$src$validator_integration$$ = function($doc$jscomp$52$$, $promise$jscomp$26_url$jscomp$97$$) {
  var $script$jscomp$1$$ = $doc$jscomp$52$$.createElement("script");
  $script$jscomp$1$$.src = $promise$jscomp$26_url$jscomp$97$$;
  $promise$jscomp$26_url$jscomp$97$$ = _.$loadPromise$$module$src$event_helper$$($script$jscomp$1$$).then(function() {
    $doc$jscomp$52$$.head.removeChild($script$jscomp$1$$);
  }, function() {
  });
  $doc$jscomp$52$$.head.appendChild($script$jscomp$1$$);
  return $promise$jscomp$26_url$jscomp$97$$;
};
_.$JSCompiler_stubMap$$ = [];
$$jscomp$objectCreate$$ = "function" == typeof Object.create ? Object.create : function($prototype$$) {
  function $ctor$$() {
  }
  $ctor$$.prototype = $prototype$$;
  return new $ctor$$;
};
if ("function" == typeof Object.setPrototypeOf) {
  $JSCompiler_temp$jscomp$418$$ = Object.setPrototypeOf;
} else {
  var $JSCompiler_inline_result$jscomp$419$$;
  a: {
    var $x$jscomp$inline_1072$$ = {a:!0}, $y$jscomp$inline_1073$$ = {};
    try {
      $y$jscomp$inline_1073$$.__proto__ = $x$jscomp$inline_1072$$;
      $JSCompiler_inline_result$jscomp$419$$ = $y$jscomp$inline_1073$$.a;
      break a;
    } catch ($e$jscomp$inline_1074$$) {
    }
    $JSCompiler_inline_result$jscomp$419$$ = !1;
  }
  $JSCompiler_temp$jscomp$418$$ = $JSCompiler_inline_result$jscomp$419$$ ? function($target$jscomp$55$$, $proto$jscomp$3$$) {
    $target$jscomp$55$$.__proto__ = $proto$jscomp$3$$;
    if ($target$jscomp$55$$.__proto__ !== $proto$jscomp$3$$) {
      throw new TypeError($target$jscomp$55$$ + " is not extensible");
    }
    return $target$jscomp$55$$;
  } : null;
}
$$jscomp$setPrototypeOf$$ = $JSCompiler_temp$jscomp$418$$;
_.$$jscomp$global$$ = "undefined" != typeof window && window === this ? this : "undefined" != typeof window.global && null != window.global ? window.global : this;
_.$$jscomp$defineProperty$$ = "function" == typeof Object.defineProperties ? Object.defineProperty : function($target$jscomp$56$$, $property$jscomp$4$$, $descriptor$jscomp$2$$) {
  $target$jscomp$56$$ != Array.prototype && $target$jscomp$56$$ != Object.prototype && ($target$jscomp$56$$[$property$jscomp$4$$] = $descriptor$jscomp$2$$.value);
};
_.$$jscomp$Symbol$$ = function() {
  var $counter$$ = 0;
  return function($opt_description$jscomp$1$$) {
    return "jscomp_symbol_" + ($opt_description$jscomp$1$$ || "") + $counter$$++;
  };
}();
$regex$$module$third_party$css_escape$css_escape$$ = /(\0)|^(-)$|([\x01-\x1f\x7f]|^-?[0-9])|([\x80-\uffff0-9a-zA-Z_-]+)|[^]/g;
var $regex$$module$src$url_parse_query_string$$ = /(?:^[#?]?|&)([^=&]+)(?:=([^&]*))?/g;
var $rtvVersion$$module$src$mode$$ = "";
var $toString_$$module$src$types$$ = Object.prototype.toString;
var $levelOverride_$$module$src$log$$ = void 0;
_.$JSCompiler_prototypeAlias$$ = $Log$$module$src$log$$.prototype;
_.$JSCompiler_prototypeAlias$$.$Log$$module$src$log_prototype$info$ = function($tag$jscomp$3$$, $var_args$jscomp$48$$) {
  3 <= $JSCompiler_StaticMethods_getLevel_$$(this) && $JSCompiler_StaticMethods_msg_$$(this, "INFO", Array.prototype.slice.call(arguments, 1));
};
_.$JSCompiler_prototypeAlias$$.$Log$$module$src$log_prototype$warn$ = function($tag$jscomp$4$$, $var_args$jscomp$49$$) {
  2 <= $JSCompiler_StaticMethods_getLevel_$$(this) && $JSCompiler_StaticMethods_msg_$$(this, "WARN", Array.prototype.slice.call(arguments, 1));
};
_.$JSCompiler_prototypeAlias$$.$error_$ = function($tag$jscomp$5$$, $var_args$jscomp$50$$) {
  if (1 <= $JSCompiler_StaticMethods_getLevel_$$(this)) {
    $JSCompiler_StaticMethods_msg_$$(this, "ERROR", Array.prototype.slice.call(arguments, 1));
  } else {
    var $error$jscomp$2$$ = $createErrorVargs$$module$src$log$$.apply(null, Array.prototype.slice.call(arguments, 1));
    $JSCompiler_StaticMethods_prepareError_$$(this, $error$jscomp$2$$);
    return $error$jscomp$2$$;
  }
};
_.$JSCompiler_prototypeAlias$$.error = function($tag$jscomp$6$$, $var_args$jscomp$51$$) {
  var $error$jscomp$3$$ = this.$error_$.apply(this, arguments);
  $error$jscomp$3$$ && ($error$jscomp$3$$.name = $tag$jscomp$6$$ || $error$jscomp$3$$.name, window.self.$reportError$($error$jscomp$3$$));
};
_.$JSCompiler_prototypeAlias$$.$expectedError$ = function($unusedTag$$, $var_args$jscomp$52$$) {
  var $error$jscomp$4$$ = this.$error_$.apply(this, arguments);
  $error$jscomp$4$$ && ($error$jscomp$4$$.$expected$ = !0, window.self.$reportError$($error$jscomp$4$$));
};
_.$JSCompiler_prototypeAlias$$.$createError$ = function($var_args$jscomp$53$$) {
  var $error$jscomp$5$$ = $createErrorVargs$$module$src$log$$.apply(null, arguments);
  $JSCompiler_StaticMethods_prepareError_$$(this, $error$jscomp$5$$);
  return $error$jscomp$5$$;
};
_.$JSCompiler_prototypeAlias$$.$createExpectedError$ = function($var_args$jscomp$54$$) {
  var $error$jscomp$6$$ = $createErrorVargs$$module$src$log$$.apply(null, arguments);
  $JSCompiler_StaticMethods_prepareError_$$(this, $error$jscomp$6$$);
  $error$jscomp$6$$.$expected$ = !0;
  return $error$jscomp$6$$;
};
_.$JSCompiler_prototypeAlias$$.$Log$$module$src$log_prototype$assert$ = function($shouldBeTrueish$$, $opt_message$jscomp$7$$, $var_args$jscomp$55$$) {
  var $firstElement$$;
  if (!$shouldBeTrueish$$) {
    var $e$jscomp$9_splitMessage$$ = ($opt_message$jscomp$7$$ || "Assertion failed").split("%s"), $first$jscomp$4_nextConstant$$ = $e$jscomp$9_splitMessage$$.shift(), $formatted$$ = $first$jscomp$4_nextConstant$$, $messageArray$$ = [], $i$jscomp$4$$ = 2;
    for ("" != $first$jscomp$4_nextConstant$$ && $messageArray$$.push($first$jscomp$4_nextConstant$$); 0 < $e$jscomp$9_splitMessage$$.length;) {
      $first$jscomp$4_nextConstant$$ = $e$jscomp$9_splitMessage$$.shift();
      var $val$$ = arguments[$i$jscomp$4$$++];
      $val$$ && $val$$.tagName && ($firstElement$$ = $val$$);
      $messageArray$$.push($val$$);
      var $val$jscomp$inline_1087$$ = $first$jscomp$4_nextConstant$$.trim();
      "" != $val$jscomp$inline_1087$$ && $messageArray$$.push($val$jscomp$inline_1087$$);
      $formatted$$ += ($val$$ && 1 == $val$$.nodeType ? $val$$.tagName.toLowerCase() + ($val$$.id ? "#" + $val$$.id : "") : $val$$) + $first$jscomp$4_nextConstant$$;
    }
    $e$jscomp$9_splitMessage$$ = Error($formatted$$);
    $e$jscomp$9_splitMessage$$.$fromAssert$ = !0;
    $e$jscomp$9_splitMessage$$.$associatedElement$ = $firstElement$$;
    $e$jscomp$9_splitMessage$$.$messageArray$ = $messageArray$$;
    $JSCompiler_StaticMethods_prepareError_$$(this, $e$jscomp$9_splitMessage$$);
    window.self.$reportError$($e$jscomp$9_splitMessage$$);
    throw $e$jscomp$9_splitMessage$$;
  }
};
window.self.log = window.self.log || {$user$:null, $dev$:null, $userForEmbed$:null};
var $logs$$module$src$log$$ = window.self.log, $logConstructor$$module$src$log$$ = null;
var $hasOwn_$$module$src$utils$object$$ = Object.prototype.hasOwnProperty;
var $scopeSelectorSupported$$module$src$dom$$, $PRECEDING_OR_CONTAINS$$module$src$dom$$ = window.Node.DOCUMENT_POSITION_PRECEDING | window.Node.DOCUMENT_POSITION_CONTAINS;
var $env$$module$src$config$$, $config$$module$src$config$$;
$env$$module$src$config$$ = window.self.AMP_CONFIG || {};
_.$urls$$module$src$config$$ = {thirdParty:$env$$module$src$config$$.thirdPartyUrl || "https://3p.ampproject.net", thirdPartyFrameHost:$env$$module$src$config$$.thirdPartyFrameHost || "ampproject.net", thirdPartyFrameRegex:("string" == typeof $env$$module$src$config$$.thirdPartyFrameRegex ? new RegExp($env$$module$src$config$$.thirdPartyFrameRegex) : $env$$module$src$config$$.thirdPartyFrameRegex) || /^d-\d+\.ampproject\.net$/, cdn:$env$$module$src$config$$.cdnUrl || "https://cdn.ampproject.org", 
$cdnProxyRegex$:("string" == typeof $env$$module$src$config$$.cdnProxyRegex ? new RegExp($env$$module$src$config$$.cdnProxyRegex) : $env$$module$src$config$$.cdnProxyRegex) || /^https:\/\/([a-zA-Z0-9_-]+\.)?cdn\.ampproject\.org$/, $localhostRegex$:/^https?:\/\/localhost(:\d+)?$/, errorReporting:$env$$module$src$config$$.errorReportingUrl || "https://amp-error-reporting.appspot.com/r", localDev:$env$$module$src$config$$.localDev || !1};
$config$$module$src$config$$ = {urls:_.$urls$$module$src$config$$};
_.$LruCache$$module$src$utils$lru_cache$$.prototype.has = function($key$jscomp$42$$) {
  return !!this.$D$[$key$jscomp$42$$];
};
_.$LruCache$$module$src$utils$lru_cache$$.prototype.get = function($cacheable_key$jscomp$43$$) {
  if ($cacheable_key$jscomp$43$$ = this.$D$[$cacheable_key$jscomp$43$$]) {
    return $cacheable_key$jscomp$43$$.$access$ = ++this.$F$, $cacheable_key$jscomp$43$$.$payload$;
  }
};
var $a$$module$src$url$$, $cache$$module$src$url$$, $AMP_JS_PARAMS_REGEX$$module$src$url$$ = /[?&]amp_js[^&]*/, $AMP_GSA_PARAMS_REGEX$$module$src$url$$ = /[?&]amp_gsa[^&]*/, $AMP_R_PARAMS_REGEX$$module$src$url$$ = /[?&]amp_r[^&]*/, $AMP_KIT_PARAMS_REGEX$$module$src$url$$ = /[?&]amp_kit[^&]*/, $GOOGLE_EXPERIMENT_PARAMS_REGEX$$module$src$url$$ = /[?&]usqp[^&]*/, $INVALID_PROTOCOLS$$module$src$url$$ = ["javascript:", "data:", "vbscript:"];
var $VALID_NAME$$module$src$polyfills$custom_elements$$ = /^[a-z][a-z0-9._]*-[a-z0-9._-]*$/, $INVALID_NAMES$$module$src$polyfills$custom_elements$$ = "annotation-xml color-profile font-face font-face-src font-face-uri font-face-format font-face-name missing-glyph".split(" "), $TRACK_SUBTREE$$module$src$polyfills$custom_elements$$ = {childList:!0, subtree:!0};
$CustomElementRegistry$$module$src$polyfills$custom_elements$$.prototype.define = function($name$jscomp$73$$, $ctor$jscomp$1_pending$$, $deferred$jscomp$1_options$jscomp$14$$) {
  this.$D$.define($name$jscomp$73$$, $ctor$jscomp$1_pending$$, $deferred$jscomp$1_options$jscomp$14$$);
  $ctor$jscomp$1_pending$$ = this.$F$;
  if ($deferred$jscomp$1_options$jscomp$14$$ = $ctor$jscomp$1_pending$$[$name$jscomp$73$$]) {
    $deferred$jscomp$1_options$jscomp$14$$.resolve(), delete $ctor$jscomp$1_pending$$[$name$jscomp$73$$];
  }
};
$CustomElementRegistry$$module$src$polyfills$custom_elements$$.prototype.get = function($def_name$jscomp$74$$) {
  if ($def_name$jscomp$74$$ = $JSCompiler_StaticMethods_getByName$$(this.$D$, $def_name$jscomp$74$$)) {
    return $def_name$jscomp$74$$.$ctor$;
  }
};
$Registry$$module$src$polyfills$custom_elements$$.prototype.define = function($name$jscomp$78$$, $ctor$jscomp$3$$, $options$jscomp$15$$) {
  var $$jscomp$destructuring$var10_SyntaxError$jscomp$3$$ = this.$G$, $Error$jscomp$1$$ = $$jscomp$destructuring$var10_SyntaxError$jscomp$3$$.Error;
  $$jscomp$destructuring$var10_SyntaxError$jscomp$3$$ = $$jscomp$destructuring$var10_SyntaxError$jscomp$3$$.SyntaxError;
  if ($options$jscomp$15$$) {
    throw new $Error$jscomp$1$$("Extending native custom elements is not supported");
  }
  if (!$VALID_NAME$$module$src$polyfills$custom_elements$$.test($name$jscomp$78$$) || $INVALID_NAMES$$module$src$polyfills$custom_elements$$.includes($name$jscomp$78$$)) {
    throw new $$jscomp$destructuring$var10_SyntaxError$jscomp$3$$('invalid custom element name "' + $name$jscomp$78$$ + '"');
  }
  if ($JSCompiler_StaticMethods_getByName$$(this, $name$jscomp$78$$) || $JSCompiler_StaticMethods_getByConstructor$$(this, $ctor$jscomp$3$$)) {
    throw new $Error$jscomp$1$$('duplicate definition "' + $name$jscomp$78$$ + '"');
  }
  this.$K$[$name$jscomp$78$$] = {name:$name$jscomp$78$$, $ctor$:$ctor$jscomp$3$$};
  $JSCompiler_StaticMethods_observe_$$(this, $name$jscomp$78$$);
  $JSCompiler_StaticMethods_Registry$$module$src$polyfills$custom_elements_prototype$upgrade$$(this, this.$doc_$, $name$jscomp$78$$);
};
$Registry$$module$src$polyfills$custom_elements$$.prototype.observe = function($tree$jscomp$1$$) {
  this.$F$ ? this.$F$.observe($tree$jscomp$1$$, $TRACK_SUBTREE$$module$src$polyfills$custom_elements$$) : this.$I$.push($tree$jscomp$1$$);
};
$Registry$$module$src$polyfills$custom_elements$$.prototype.sync = function() {
  this.$F$ && $JSCompiler_StaticMethods_handleRecords_$$(this, this.$F$.takeRecords());
};
var $allowedFetchTypes$$module$src$polyfills$fetch$$ = {document:1, text:2}, $allowedMethods$$module$src$polyfills$fetch$$ = ["GET", "POST"];
$FetchResponse$$module$src$polyfills$fetch$$.prototype.clone = function() {
  return new $FetchResponse$$module$src$polyfills$fetch$$(this.$xhr_$);
};
$FetchResponse$$module$src$polyfills$fetch$$.prototype.text = function() {
  return window.Promise.resolve(this.$xhr_$.responseText);
};
$FetchResponse$$module$src$polyfills$fetch$$.prototype.json = function() {
  return window.Promise.resolve(this.$xhr_$.responseText).then(_.$parseJson$$module$src$json$$);
};
$FetchResponse$$module$src$polyfills$fetch$$.prototype.arrayBuffer = function() {
  return window.Promise.resolve(this.$xhr_$.responseText).then(_.$utf8Encode$$module$src$utils$bytes$$);
};
$FetchResponseHeaders$$module$src$polyfills$fetch$$.prototype.get = function($name$jscomp$81$$) {
  return this.$xhr_$.getResponseHeader($name$jscomp$81$$);
};
$FetchResponseHeaders$$module$src$polyfills$fetch$$.prototype.has = function($name$jscomp$82$$) {
  return null != this.$xhr_$.getResponseHeader($name$jscomp$82$$);
};
_.$$jscomp$inherits$$($Response$$module$src$polyfills$fetch$$, $FetchResponse$$module$src$polyfills$fetch$$);
var $hasOwnProperty$$module$src$polyfills$object_assign$$ = Object.prototype.hasOwnProperty;
$Promise$$module$promise_pjs$promise$$.prototype.then = function($onFulfilled$jscomp$1$$, $onRejected$jscomp$2$$) {
  $onFulfilled$jscomp$1$$ = $isFunction$$module$promise_pjs$promise$$($onFulfilled$jscomp$1$$) ? $onFulfilled$jscomp$1$$ : void 0;
  $onRejected$jscomp$2$$ = $isFunction$$module$promise_pjs$promise$$($onRejected$jscomp$2$$) ? $onRejected$jscomp$2$$ : void 0;
  if ($onFulfilled$jscomp$1$$ || $onRejected$jscomp$2$$) {
    this.$_isChainEnd$ = !1;
  }
  return this.$_state$(this.$_value$, $onFulfilled$jscomp$1$$, $onRejected$jscomp$2$$);
};
$Promise$$module$promise_pjs$promise$$.prototype.catch = function($onRejected$jscomp$3$$) {
  return this.then(void 0, $onRejected$jscomp$3$$);
};
var $defer$$module$promise_pjs$promise$$ = function() {
  function $flush$$() {
    for (var $flush$$ = 0; $flush$$ < $length$jscomp$20$$; $flush$$++) {
      var $scheduleFlush$$ = $queue$jscomp$4$$[$flush$$];
      $queue$jscomp$4$$[$flush$$] = null;
      $scheduleFlush$$();
    }
    $length$jscomp$20$$ = 0;
  }
  if ("undefined" !== typeof window && window.postMessage) {
    window.addEventListener("message", $flush$$);
    var $scheduleFlush$$ = function() {
      window.postMessage("macro-task", "*");
    };
  } else {
    $scheduleFlush$$ = function() {
      (0,window.setTimeout)($flush$$, 0);
    };
  }
  var $queue$jscomp$4$$ = Array(16), $length$jscomp$20$$ = 0;
  return function($flush$$) {
    0 === $length$jscomp$20$$ && $scheduleFlush$$();
    $queue$jscomp$4$$[$length$jscomp$20$$++] = $flush$$;
  };
}();
/*
 Copyright (C) 2014-2016 by Andrea Giammarchi - @WebReflection

Use of this source code is governed by a MIT-style
license that can be found in the LICENSE file or at
https://opensource.org/licenses/MIT.

*/
_.$install$$module$src$polyfills$domtokenlist_toggle$$(window.self);
window.self.fetch || (Object.defineProperty(window.self, "fetch", {value:$fetchPolyfill$$module$src$polyfills$fetch$$, writable:!0, enumerable:!0, configurable:!0}), Object.defineProperty(window.self, "Response", {value:$Response$$module$src$polyfills$fetch$$, writable:!0, enumerable:!1, configurable:!0}));
window.self.Math.sign || window.self.Object.defineProperty(window.self.Math, "sign", {enumerable:!1, configurable:!0, writable:!0, value:$sign$$module$src$polyfills$math_sign$$});
window.self.Object.assign || window.self.Object.defineProperty(window.self.Object, "assign", {enumerable:!1, configurable:!0, writable:!0, value:$assign$$module$src$polyfills$object_assign$$});
window.self.Object.values || window.self.Object.defineProperty(window.self.Object, "values", {configurable:!0, writable:!0, value:$values$$module$src$polyfills$object_values$$});
window.self.Promise || (window.self.Promise = $Promise$$module$promise_pjs$promise$$, $Promise$$module$promise_pjs$promise$$.default && (window.self.Promise = $Promise$$module$promise_pjs$promise$$.default), window.self.Promise.resolve = $Promise$$module$promise_pjs$promise$resolve$$, window.self.Promise.reject = $Promise$$module$promise_pjs$promise$reject$$, window.self.Promise.all = $Promise$$module$promise_pjs$promise$all$$, window.self.Promise.race = $Promise$$module$promise_pjs$promise$race$$);
_.$install$$module$src$polyfills$document_contains$$(window.self);
window.self.Array.prototype.includes || window.self.Object.defineProperty(Array.prototype, "includes", {enumerable:!1, configurable:!0, writable:!0, value:$includes$$module$src$polyfills$array_includes$$});
_.$isExperimentOn$$module$src$experiments$$(window.self, "custom-elements-v1") ? _.$install$$module$src$polyfills$custom_elements$$(window.self) : _.$installCustomElements$$module$document_register_element$build$document_register_element_patched$$(window.self);
var $optsSupported$$module$src$event_helper_listen$$;
var $container$$module$src$static_template$$;
var $propertyNameCache$$module$src$style$$, $vendorPrefixes$$module$src$style$$ = "Webkit webkit Moz moz ms O o".split(" ");
var $_template$$module$src$layout$$ = ["<i-amphtml-sizer class=i-amphtml-sizer><img class=i-amphtml-intrinsic-sizer></i-amphtml-sizer>"], $Layout$$module$src$layout$$ = {$NODISPLAY$:"nodisplay", $FIXED$:"fixed", $FIXED_HEIGHT$:"fixed-height", $RESPONSIVE$:"responsive", $CONTAINER$:"container", $FILL$:"fill", $FLEX_ITEM$:"flex-item", $FLUID$:"fluid", $INTRINSIC$:"intrinsic"}, $naturalDimensions_$$module$src$layout$$ = {"AMP-PIXEL":{width:"0px", height:"0px"}, "AMP-ANALYTICS":{width:"1px", height:"1px"}, 
"AMP-AUDIO":null, "AMP-SOCIAL-SHARE":{width:"60px", height:"44px"}}, $LOADING_ELEMENTS_$$module$src$layout$$ = {"AMP-ANIM":!0, "AMP-BRIGHTCOVE":!0, "AMP-GOOGLE-DOCUMENT-EMBED":!0, "AMP-EMBED":!0, "AMP-FACEBOOK":!0, "AMP-FACEBOOK-COMMENTS":!0, "AMP-FACEBOOK-LIKE":!0, "AMP-FACEBOOK-PAGE":!0, "AMP-IFRAME":!0, "AMP-IMG":!0, "AMP-INSTAGRAM":!0, "AMP-LIST":!0, "AMP-OOYALA-PLAYER":!0, "AMP-PINTEREST":!0, "AMP-PLAYBUZZ":!0, "AMP-VIDEO":!0, "AMP-YOUTUBE":!0};
_.$Pass$$module$src$pass$$.prototype.cancel = function() {
  -1 != this.$D$ && (this.$timer_$.cancel(this.$D$), this.$D$ = -1);
};
var $allowedMethods_$$module$src$utils$xhr_utils$$ = ["GET", "POST"], $allowedJsonBodyTypes_$$module$src$utils$xhr_utils$$ = [_.$isArray$$module$src$types$$, _.$isObject$$module$src$types$$];
var $SERVICES$$module$src$render_delaying_services$$ = {"amp-dynamic-css-classes":"[custom-element=amp-dynamic-css-classes]", variant:"amp-experiment", "amp-story":"amp-story[standalone]"};
_.$bodyMadeVisible$$module$src$style_installer$$ = !1;
$PriorityQueue$$module$src$utils$priority_queue$$.prototype.forEach = function($callback$jscomp$61$$) {
  for (var $index$jscomp$61$$ = this.$D$.length; $index$jscomp$61$$--;) {
    $callback$jscomp$61$$(this.$D$[$index$jscomp$61$$].item);
  }
};
_.$$jscomp$global$$.Object.defineProperties($PriorityQueue$$module$src$utils$priority_queue$$.prototype, {length:{configurable:!0, enumerable:!0, get:function() {
  return this.$D$.length;
}}});
_.$deactivated$$module$src$chunk$$ = /nochunking=1/.test(window.self.location.hash);
_.$resolved$$module$src$chunk$$ = window.Promise.resolve();
_.$Task$$module$src$chunk$$.prototype.$G$ = function() {
};
_.$Task$$module$src$chunk$$.prototype.$F$ = function() {
  return !1;
};
_.$Task$$module$src$chunk$$.prototype.$I$ = function() {
  return !0;
};
_.$$jscomp$inherits$$($StartupTask$$module$src$chunk$$, _.$Task$$module$src$chunk$$);
$StartupTask$$module$src$chunk$$.prototype.$G$ = function() {
  _.$makeBodyVisibleRecovery$$module$src$style_installer$$(window.self.document);
};
$StartupTask$$module$src$chunk$$.prototype.$F$ = function() {
  return this.$isVisible_$();
};
$StartupTask$$module$src$chunk$$.prototype.$I$ = function() {
  return !!this.$viewer_$;
};
$StartupTask$$module$src$chunk$$.prototype.$isVisible_$ = function() {
  return this.$viewer_$ ? _.$JSCompiler_StaticMethods_Viewer$$module$src$service$viewer_impl_prototype$isVisible$$(this.$viewer_$) : this.$D$.document.hidden ? !1 : !/visibilityState=(hidden|prerender)/.test(this.$D$.location.hash);
};
$Chunks$$module$src$chunk$$.prototype.$G$ = function($idleDeadline$jscomp$1$$) {
  var $$jscomp$this$jscomp$9$$ = this, $t$jscomp$3$$ = $JSCompiler_StaticMethods_nextTask_$$(this, !0);
  if (!$t$jscomp$3$$) {
    return !1;
  }
  $JSCompiler_StaticMethods_runTask_$$($t$jscomp$3$$, $idleDeadline$jscomp$1$$);
  _.$resolved$$module$src$chunk$$.then(function() {
    $JSCompiler_StaticMethods_Chunks$$module$src$chunk_prototype$schedule_$$($$jscomp$this$jscomp$9$$);
  });
  "CHUNK";
  return !0;
};
var $accumulatedErrorMessages$$module$src$error$$ = window.self.$AMPErrors$ || [];
window.self.$AMPErrors$ = $accumulatedErrorMessages$$module$src$error$$;
var $detectedJsEngine$$module$src$error$$;
var $DEFAULT_APPEND_URL_PARAM$$module$src$impression$$, $TRUSTED_REFERRER_HOSTS$$module$src$impression$$;
_.$trackImpressionPromise$$module$src$impression$$ = null;
$DEFAULT_APPEND_URL_PARAM$$module$src$impression$$ = ["gclid", "gclsrc"];
$TRUSTED_REFERRER_HOSTS$$module$src$impression$$ = [/^t.co$/];
_.$JSCompiler_prototypeAlias$$ = $PullToRefreshBlocker$$module$src$pull_to_refresh$$.prototype;
_.$JSCompiler_prototypeAlias$$.$cleanup$ = function() {
  $JSCompiler_StaticMethods_PullToRefreshBlocker$$module$src$pull_to_refresh_prototype$stopTracking_$$(this);
  this.$doc_$.removeEventListener("touchstart", this.$K$, !0);
};
_.$JSCompiler_prototypeAlias$$.$PullToRefreshBlocker$$module$src$pull_to_refresh_prototype$onTouchStart_$ = function($event$jscomp$7_startPos$jscomp$inline_1248$$) {
  this.$D$ || !$event$jscomp$7_startPos$jscomp$inline_1248$$.touches || 1 != $event$jscomp$7_startPos$jscomp$inline_1248$$.touches.length || 0 < _.$JSCompiler_StaticMethods_Viewport$$module$src$service$viewport$viewport_impl_prototype$getScrollTop$$(this.$viewport_$) || ($event$jscomp$7_startPos$jscomp$inline_1248$$ = $event$jscomp$7_startPos$jscomp$inline_1248$$.touches[0].clientY, this.$D$ = !0, this.$F$ = $event$jscomp$7_startPos$jscomp$inline_1248$$, this.$doc_$.addEventListener("touchmove", 
  this.$J$, !0), this.$doc_$.addEventListener("touchend", this.$I$, !0), this.$doc_$.addEventListener("touchcancel", this.$G$, !0));
};
_.$JSCompiler_prototypeAlias$$.$PullToRefreshBlocker$$module$src$pull_to_refresh_prototype$onTouchMove_$ = function($event$jscomp$8$$) {
  if (this.$D$) {
    var $dy$jscomp$4$$ = $event$jscomp$8$$.touches[0].clientY - this.$F$;
    0 < $dy$jscomp$4$$ && $event$jscomp$8$$.preventDefault();
    0 != $dy$jscomp$4$$ && $JSCompiler_StaticMethods_PullToRefreshBlocker$$module$src$pull_to_refresh_prototype$stopTracking_$$(this);
  }
};
_.$JSCompiler_prototypeAlias$$.$PullToRefreshBlocker$$module$src$pull_to_refresh_prototype$onTouchEnd_$ = function() {
  $JSCompiler_StaticMethods_PullToRefreshBlocker$$module$src$pull_to_refresh_prototype$stopTracking_$$(this);
};
_.$JSCompiler_prototypeAlias$$.$PullToRefreshBlocker$$module$src$pull_to_refresh_prototype$onTouchCancel_$ = function() {
  $JSCompiler_StaticMethods_PullToRefreshBlocker$$module$src$pull_to_refresh_prototype$stopTracking_$$(this);
};
var $_template$$module$src$preconnect$$ = ["<link rel=preload referrerpolicy=origin>"], $preconnectFeatures$$module$src$preconnect$$ = null;
$PreconnectService$$module$src$preconnect$$.prototype.url = function($viewer$jscomp$7$$, $url$jscomp$46$$, $opt_alsoConnecting$$) {
  var $$jscomp$this$jscomp$12$$ = this;
  $viewer$jscomp$7$$.$D$.then(function() {
    $$jscomp$this$jscomp$12$$.$url_$($viewer$jscomp$7$$, $url$jscomp$46$$, $opt_alsoConnecting$$);
  });
};
$PreconnectService$$module$src$preconnect$$.prototype.$url_$ = function($origin$jscomp$1_viewer$jscomp$8$$, $now_url$jscomp$47$$, $opt_alsoConnecting$jscomp$1$$) {
  if (_.$startsWith$$module$src$string$$($now_url$jscomp$47$$, "https:") || _.$startsWith$$module$src$string$$($now_url$jscomp$47$$, "http:")) {
    $origin$jscomp$1_viewer$jscomp$8$$ = _.$parseUrlDeprecated$$module$src$url$$($now_url$jscomp$47$$).origin;
    $now_url$jscomp$47$$ = Date.now();
    var $lastPreconnectTimeout$$ = this.$D$[$origin$jscomp$1_viewer$jscomp$8$$];
    if ($lastPreconnectTimeout$$ && $now_url$jscomp$47$$ < $lastPreconnectTimeout$$) {
      $opt_alsoConnecting$jscomp$1$$ && (this.$D$[$origin$jscomp$1_viewer$jscomp$8$$] = $now_url$jscomp$47$$ + 18E4);
    } else {
      this.$D$[$origin$jscomp$1_viewer$jscomp$8$$] = $now_url$jscomp$47$$ + ($opt_alsoConnecting$jscomp$1$$ ? 18E4 : 1E4);
      if (!this.$F$.$preconnect$) {
        var $dns$$ = this.$document_$.createElement("link");
        $dns$$.setAttribute("rel", "dns-prefetch");
        $dns$$.setAttribute("href", $origin$jscomp$1_viewer$jscomp$8$$);
        this.$G$.appendChild($dns$$);
      }
      var $preconnect$$ = this.$document_$.createElement("link");
      $preconnect$$.setAttribute("rel", "preconnect");
      $preconnect$$.setAttribute("href", $origin$jscomp$1_viewer$jscomp$8$$);
      $preconnect$$.setAttribute("referrerpolicy", "origin");
      this.$G$.appendChild($preconnect$$);
      this.$timer_$.delay(function() {
        $dns$$ && $dns$$.parentNode && $dns$$.parentNode.removeChild($dns$$);
        $preconnect$$.parentNode && $preconnect$$.parentNode.removeChild($preconnect$$);
      }, 10000);
      $JSCompiler_StaticMethods_preconnectPolyfill_$$(this, $origin$jscomp$1_viewer$jscomp$8$$);
    }
  }
};
$PreconnectService$$module$src$preconnect$$.prototype.$preload$ = function($viewer$jscomp$9$$, $url$jscomp$48$$, $opt_preloadAs$$) {
  var $$jscomp$this$jscomp$13$$ = this;
  !_.$startsWith$$module$src$string$$($url$jscomp$48$$, "https:") && !_.$startsWith$$module$src$string$$($url$jscomp$48$$, "http:") || this.$I$[$url$jscomp$48$$] || (this.$I$[$url$jscomp$48$$] = !0, this.url($viewer$jscomp$9$$, $url$jscomp$48$$, !0), this.$F$.$preload$ && ("document" == $opt_preloadAs$$ && _.$JSCompiler_StaticMethods_isSafari$$(this.$platform_$) || $viewer$jscomp$9$$.$D$.then(function() {
    var $viewer$jscomp$9$$ = _.$htmlFor$$module$src$static_template$$($$jscomp$this$jscomp$13$$.$document_$)($_template$$module$src$preconnect$$);
    $viewer$jscomp$9$$.setAttribute("href", $url$jscomp$48$$);
    $viewer$jscomp$9$$.as = $$jscomp$this$jscomp$13$$.$F$.$onlyValidAs$ ? "fetch" : "";
    $$jscomp$this$jscomp$13$$.$G$.appendChild($viewer$jscomp$9$$);
  })));
};
$Preconnect$$module$src$preconnect$$.prototype.url = function($url$jscomp$52$$, $opt_alsoConnecting$jscomp$2$$) {
  this.$D$.url($JSCompiler_StaticMethods_getViewer_$$(this), $url$jscomp$52$$, $opt_alsoConnecting$jscomp$2$$);
};
$Preconnect$$module$src$preconnect$$.prototype.$preload$ = function($url$jscomp$53$$, $opt_preloadAs$jscomp$1$$) {
  this.$D$.$preload$($JSCompiler_StaticMethods_getViewer_$$(this), $url$jscomp$53$$, $opt_preloadAs$jscomp$1$$);
};
_.$JSCompiler_prototypeAlias$$ = _.$BaseElement$$module$src$base_element$$.prototype;
_.$JSCompiler_prototypeAlias$$.signals = function() {
  return this.element.signals();
};
_.$JSCompiler_prototypeAlias$$.$getDefaultActionAlias$ = function() {
  return this.$defaultActionAlias_$;
};
_.$JSCompiler_prototypeAlias$$.$getLayoutPriority$ = function() {
  return 0;
};
_.$JSCompiler_prototypeAlias$$.$updateLayoutPriority$ = _.$JSCompiler_stubMethod$$(2);
_.$JSCompiler_prototypeAlias$$.$getLayout$ = function() {
  return this.$layout_$;
};
_.$JSCompiler_prototypeAlias$$.$getLayoutBox$ = function() {
  return this.element.$getLayoutBox$();
};
_.$JSCompiler_prototypeAlias$$.$getPageLayoutBox$ = function() {
  return this.element.$getPageLayoutBox$();
};
_.$JSCompiler_prototypeAlias$$.$getWin$ = _.$JSCompiler_stubMethod$$(5);
_.$JSCompiler_prototypeAlias$$.$getAmpDoc$ = function() {
  return this.element.$getAmpDoc$();
};
_.$JSCompiler_prototypeAlias$$.$getConsentPolicy$ = function() {
  var $policyId$$ = null;
  this.element.hasAttribute("data-block-on-consent") && ($policyId$$ = this.element.getAttribute("data-block-on-consent") || "default");
  return $policyId$$;
};
_.$JSCompiler_prototypeAlias$$.$isLayoutSupported$ = function($layout$jscomp$3$$) {
  return "nodisplay" == $layout$jscomp$3$$;
};
_.$JSCompiler_prototypeAlias$$.$isAlwaysFixed$ = function() {
  return !1;
};
_.$JSCompiler_prototypeAlias$$.$isInViewport$ = function() {
  return this.$inViewport_$;
};
_.$JSCompiler_prototypeAlias$$.$upgradeCallback$ = function() {
  return null;
};
_.$JSCompiler_prototypeAlias$$.createdCallback = function() {
};
_.$JSCompiler_prototypeAlias$$.$firstAttachedCallback$ = function() {
};
_.$JSCompiler_prototypeAlias$$.$buildCallback$ = function() {
};
_.$JSCompiler_prototypeAlias$$.$preconnectCallback$ = function() {
};
_.$JSCompiler_prototypeAlias$$.detachedCallback = function() {
};
_.$JSCompiler_prototypeAlias$$.$prerenderAllowed$ = function() {
  return !1;
};
_.$JSCompiler_prototypeAlias$$.$createPlaceholderCallback$ = function() {
  return null;
};
_.$JSCompiler_prototypeAlias$$.$renderOutsideViewport$ = function() {
  return "inabox" == _.$getMode$$module$src$mode$$(this.$win$).runtime || 3;
};
_.$JSCompiler_prototypeAlias$$.$idleRenderOutsideViewport$ = function() {
  return !1;
};
_.$JSCompiler_prototypeAlias$$.$isRelayoutNeeded$ = function() {
  return !1;
};
_.$JSCompiler_prototypeAlias$$.$layoutCallback$ = function() {
  return window.Promise.resolve();
};
_.$JSCompiler_prototypeAlias$$.$firstLayoutCompleted$ = function() {
  this.$togglePlaceholder$(!1);
};
_.$JSCompiler_prototypeAlias$$.$viewportCallback$ = function() {
};
_.$JSCompiler_prototypeAlias$$.$pauseCallback$ = function() {
};
_.$JSCompiler_prototypeAlias$$.$resumeCallback$ = function() {
};
_.$JSCompiler_prototypeAlias$$.$unlayoutCallback$ = function() {
  return !1;
};
_.$JSCompiler_prototypeAlias$$.$unlayoutOnPause$ = function() {
  return !1;
};
_.$JSCompiler_prototypeAlias$$.$reconstructWhenReparented$ = function() {
  return !0;
};
_.$JSCompiler_prototypeAlias$$.$activate$ = _.$JSCompiler_stubMethod$$(6);
_.$JSCompiler_prototypeAlias$$.$loadPromise$ = function($element$jscomp$77$$) {
  return _.$loadPromise$$module$src$event_helper$$($element$jscomp$77$$);
};
_.$JSCompiler_prototypeAlias$$.$executeAction$ = function($invocation$$) {
  var $$jscomp$destructuring$var39_method$jscomp$4$$ = $invocation$$.method;
  "activate" === $$jscomp$destructuring$var39_method$jscomp$4$$ && ($$jscomp$destructuring$var39_method$jscomp$4$$ = this.$defaultActionAlias_$ || $$jscomp$destructuring$var39_method$jscomp$4$$);
  _.$JSCompiler_StaticMethods_initActionMap_$$(this);
  $$jscomp$destructuring$var39_method$jscomp$4$$ = this.$actionMap_$[$$jscomp$destructuring$var39_method$jscomp$4$$];
  var $handler$jscomp$8$$ = $$jscomp$destructuring$var39_method$jscomp$4$$.$handler$;
  if (_.$JSCompiler_StaticMethods_satisfiesTrust$$($invocation$$, $$jscomp$destructuring$var39_method$jscomp$4$$.$minTrust$)) {
    return $handler$jscomp$8$$($invocation$$);
  }
};
_.$JSCompiler_prototypeAlias$$.$getDpr$ = _.$JSCompiler_stubMethod$$(8);
_.$JSCompiler_prototypeAlias$$.$getPlaceholder$ = function() {
  return this.element.$getPlaceholder$();
};
_.$JSCompiler_prototypeAlias$$.$togglePlaceholder$ = function($state$jscomp$3$$) {
  this.element.$togglePlaceholder$($state$jscomp$3$$);
};
_.$JSCompiler_prototypeAlias$$.$getFallback$ = function() {
  return this.element.$getFallback$();
};
_.$JSCompiler_prototypeAlias$$.$toggleFallback$ = function($state$jscomp$4$$) {
  this.element.$toggleFallback$($state$jscomp$4$$);
};
_.$JSCompiler_prototypeAlias$$.$toggleLoading$ = function($state$jscomp$5$$, $opt_force$jscomp$2$$) {
  this.element.$toggleLoading$($state$jscomp$5$$, {force:!!$opt_force$jscomp$2$$});
};
_.$JSCompiler_prototypeAlias$$.$isLoadingReused$ = function() {
  return !1;
};
_.$JSCompiler_prototypeAlias$$.$getOverflowElement$ = function() {
  return this.element.$getOverflowElement$();
};
_.$JSCompiler_prototypeAlias$$.$renderStarted$ = function() {
  this.element.$renderStarted$();
};
_.$JSCompiler_prototypeAlias$$.$getRealChildNodes$ = function() {
  return this.element.$getRealChildNodes$();
};
_.$JSCompiler_prototypeAlias$$.$getRealChildren$ = _.$JSCompiler_stubMethod$$(9);
_.$JSCompiler_prototypeAlias$$.$getViewport$ = function() {
  return _.$Services$$module$src$services$viewportForDoc$$(this.$getAmpDoc$());
};
_.$JSCompiler_prototypeAlias$$.$getIntersectionElementLayoutBox$ = _.$JSCompiler_stubMethod$$(10);
_.$JSCompiler_prototypeAlias$$.$scheduleLayout$ = function($elements$jscomp$3$$) {
  this.element.$getResources$().$scheduleLayout$(this.element, $elements$jscomp$3$$);
};
_.$JSCompiler_prototypeAlias$$.$schedulePause$ = _.$JSCompiler_stubMethod$$(12);
_.$JSCompiler_prototypeAlias$$.$scheduleResume$ = _.$JSCompiler_stubMethod$$(14);
_.$JSCompiler_prototypeAlias$$.$schedulePreload$ = _.$JSCompiler_stubMethod$$(16);
_.$JSCompiler_prototypeAlias$$.$scheduleUnlayout$ = _.$JSCompiler_stubMethod$$(18);
_.$JSCompiler_prototypeAlias$$.$updateInViewport$ = _.$JSCompiler_stubMethod$$(20);
_.$JSCompiler_prototypeAlias$$.collapse = function() {
  var $JSCompiler_StaticMethods_collapseElement$self$jscomp$inline_1266$$ = this.element.$getResources$(), $element$jscomp$inline_1267_resource$jscomp$inline_1269$$ = this.element, $box$jscomp$inline_1268$$ = $JSCompiler_StaticMethods_collapseElement$self$jscomp$inline_1266$$.$viewport_$.$getLayoutRect$($element$jscomp$inline_1267_resource$jscomp$inline_1269$$);
  $element$jscomp$inline_1267_resource$jscomp$inline_1269$$ = _.$Resource$$module$src$service$resource$forElementOptional$$($element$jscomp$inline_1267_resource$jscomp$inline_1269$$);
  0 != $box$jscomp$inline_1268$$.width && 0 != $box$jscomp$inline_1268$$.height && $JSCompiler_StaticMethods_setRelayoutTop_$$($JSCompiler_StaticMethods_collapseElement$self$jscomp$inline_1266$$, $box$jscomp$inline_1268$$.top);
  _.$JSCompiler_StaticMethods_completeCollapse$$($element$jscomp$inline_1267_resource$jscomp$inline_1269$$);
  _.$JSCompiler_StaticMethods_schedulePass$$($JSCompiler_StaticMethods_collapseElement$self$jscomp$inline_1266$$, 70);
};
_.$JSCompiler_prototypeAlias$$.$attemptCollapse$ = _.$JSCompiler_stubMethod$$(22);
_.$JSCompiler_prototypeAlias$$.$attemptChangeSize$ = _.$JSCompiler_stubMethod$$(24);
_.$JSCompiler_prototypeAlias$$.$measureElement$ = _.$JSCompiler_stubMethod$$(26);
_.$JSCompiler_prototypeAlias$$.$mutateElement$ = function($mutator$$, $opt_element$jscomp$12$$) {
  return this.$measureMutateElement$(null, $mutator$$, $opt_element$jscomp$12$$);
};
_.$JSCompiler_prototypeAlias$$.$measureMutateElement$ = function($measurer$jscomp$1$$, $mutator$jscomp$1$$, $opt_element$jscomp$13$$) {
  return this.element.$getResources$().$measureMutateElement$($opt_element$jscomp$13$$ || this.element, $measurer$jscomp$1$$, $mutator$jscomp$1$$);
};
_.$JSCompiler_prototypeAlias$$.$collapsedCallback$ = function() {
};
_.$JSCompiler_prototypeAlias$$.expand = function() {
  var $JSCompiler_StaticMethods_expandElement$self$jscomp$inline_1271$$ = this.element.$getResources$(), $resource$jscomp$inline_1273$$ = _.$Resource$$module$src$service$resource$forElementOptional$$(this.element);
  _.$toggle$$module$src$style$$($resource$jscomp$inline_1273$$.element, !0);
  $resource$jscomp$inline_1273$$.$I$ = !0;
  $resource$jscomp$inline_1273$$.$getOwner$();
  _.$JSCompiler_StaticMethods_schedulePass$$($JSCompiler_StaticMethods_expandElement$self$jscomp$inline_1271$$, 70);
};
_.$JSCompiler_prototypeAlias$$.$mutatedAttributesCallback$ = _.$JSCompiler_stubMethod$$(28);
_.$JSCompiler_prototypeAlias$$.$onLayoutMeasure$ = function() {
};
_.$JSCompiler_prototypeAlias$$.$onMeasureChanged$ = function() {
};
_.$JSCompiler_prototypeAlias$$.$user$ = function() {
  return _.$user$$module$src$log$$(this.element);
};
_.$JSCompiler_prototypeAlias$$.$declareLayer$ = function($opt_element$jscomp$14$$) {
  _.$isExperimentOn$$module$src$experiments$$(this.$win$, "layers");
  $opt_element$jscomp$14$$ && this.element.contains($opt_element$jscomp$14$$);
  return this.element.$P$.$declareLayer$($opt_element$jscomp$14$$ || this.element);
};
_.$Observable$$module$src$observable$$.prototype.add = function($handler$jscomp$9$$) {
  var $$jscomp$this$jscomp$15$$ = this;
  this.$D$ || (this.$D$ = []);
  this.$D$.push($handler$jscomp$9$$);
  return function() {
    $$jscomp$this$jscomp$15$$.remove($handler$jscomp$9$$);
  };
};
_.$Observable$$module$src$observable$$.prototype.remove = function($handler$jscomp$10_index$jscomp$62$$) {
  this.$D$ && ($handler$jscomp$10_index$jscomp$62$$ = this.$D$.indexOf($handler$jscomp$10_index$jscomp$62$$), -1 < $handler$jscomp$10_index$jscomp$62$$ && this.$D$.splice($handler$jscomp$10_index$jscomp$62$$, 1));
};
_.$Observable$$module$src$observable$$.prototype.$fire$ = function($opt_event$$) {
  if (this.$D$) {
    for (var $handlers$$ = this.$D$, $i$jscomp$64$$ = 0; $i$jscomp$64$$ < $handlers$$.length; $i$jscomp$64$$++) {
      (0,$handlers$$[$i$jscomp$64$$])($opt_event$$);
    }
  }
};
_.$JSCompiler_prototypeAlias$$ = $Input$$module$src$input$$.prototype;
_.$JSCompiler_prototypeAlias$$.$onKeyDown_$ = function($e$jscomp$44_target$jscomp$68$$) {
  this.$D$ || $e$jscomp$44_target$jscomp$68$$.defaultPrevented || ($e$jscomp$44_target$jscomp$68$$ = $e$jscomp$44_target$jscomp$68$$.target, $e$jscomp$44_target$jscomp$68$$ && ("INPUT" == $e$jscomp$44_target$jscomp$68$$.tagName || "TEXTAREA" == $e$jscomp$44_target$jscomp$68$$.tagName || "SELECT" == $e$jscomp$44_target$jscomp$68$$.tagName || "OPTION" == $e$jscomp$44_target$jscomp$68$$.tagName || $e$jscomp$44_target$jscomp$68$$.hasAttribute("contenteditable"))) || (this.$D$ = !0, this.$J$.$fire$(!0), 
  "Input");
};
_.$JSCompiler_prototypeAlias$$.$Input$$module$src$input_prototype$onMouseDown_$ = function() {
  this.$D$ && (this.$D$ = !1, this.$J$.$fire$(!1), "Input");
};
_.$JSCompiler_prototypeAlias$$.$Input$$module$src$input_prototype$onMouseMove_$ = function($e$jscomp$45_listenPromise$$) {
  var $$jscomp$this$jscomp$16$$ = this;
  if ($e$jscomp$45_listenPromise$$.sourceCapabilities && $e$jscomp$45_listenPromise$$.sourceCapabilities.firesTouchEvents) {
    this.$mouseCanceled_$();
  } else {
    this.$G$ || (this.$G$ = this.$mouseConfirmed_$.bind(this), this.$K$ = this.$mouseCanceled_$.bind(this));
    var $unlisten$jscomp$3$$;
    $e$jscomp$45_listenPromise$$ = _.$listenOncePromise$$module$src$event_helper$$(this.$win$.document, "click", void 0, function($e$jscomp$45_listenPromise$$) {
      $unlisten$jscomp$3$$ = $e$jscomp$45_listenPromise$$;
    });
    return _.$JSCompiler_StaticMethods_timeoutPromise$$(_.$Services$$module$src$services$timerFor$$(this.$win$), 300, $e$jscomp$45_listenPromise$$).then(this.$K$, function() {
      $unlisten$jscomp$3$$ && $unlisten$jscomp$3$$();
      $$jscomp$this$jscomp$16$$.$G$();
    });
  }
};
_.$JSCompiler_prototypeAlias$$.$mouseConfirmed_$ = function() {
  this.$hasMouse_$ = !0;
  this.$P$.$fire$(!0);
  "Input";
};
_.$JSCompiler_prototypeAlias$$.$mouseCanceled_$ = function() {
  this.$O$++;
  3 >= this.$O$ ? _.$listenOnce$$module$src$event_helper$$(this.$win$.document, "mousemove", this.$I$) : "Input";
};
var $ELEMENTS_ACTIONS_MAP_$$module$src$service$action_impl$$;
_.$ACTION_MAP_$$module$src$service$action_impl$$ = "__AMP_ACTION_MAP__" + Math.random();
$ELEMENTS_ACTIONS_MAP_$$module$src$service$action_impl$$ = {form:["submit", "clear"]};
_.$TAPPABLE_ARIA_ROLES$$module$src$service$action_impl$$ = {button:!0, checkbox:!0, link:!0, listbox:!0, menuitem:!0, menuitemcheckbox:!0, menuitemradio:!0, option:!0, radio:!0, scrollbar:!0, slider:!0, spinbutton:!0, "switch":!0, tab:!0, treeitem:!0};
$ActionService$$module$src$service$action_impl$$.$installInEmbedWindow$ = function($embedWin$jscomp$3$$, $ampdoc$jscomp$13$$) {
  _.$installServiceInEmbedScope$$module$src$service$$($embedWin$jscomp$3$$, "action", new $ActionService$$module$src$service$action_impl$$($ampdoc$jscomp$13$$, $embedWin$jscomp$3$$.document));
};
$ActionService$$module$src$service$action_impl$$.prototype.$trigger$ = function($target$jscomp$71$$, $eventType$jscomp$9$$, $event$jscomp$20$$, $trust$jscomp$1$$) {
  this.$action_$($target$jscomp$71$$, $eventType$jscomp$9$$, $event$jscomp$20$$, $trust$jscomp$1$$);
};
$ActionService$$module$src$service$action_impl$$.prototype.execute = function($target$jscomp$72$$, $method$jscomp$7$$, $args$jscomp$5$$, $source$jscomp$15$$, $caller$jscomp$1$$, $event$jscomp$21$$, $trust$jscomp$2$$) {
  $JSCompiler_StaticMethods_invoke_$$(this, new $ActionInvocation$$module$src$service$action_impl$$($target$jscomp$72$$, $method$jscomp$7$$, $args$jscomp$5$$, $source$jscomp$15$$, $caller$jscomp$1$$, $event$jscomp$21$$, $trust$jscomp$2$$));
};
$ActionService$$module$src$service$action_impl$$.prototype.$action_$ = function($source$jscomp$16$$, $actionEventType$jscomp$2$$, $event$jscomp$22$$, $trust$jscomp$3$$) {
  var $$jscomp$this$jscomp$18$$ = this, $action$jscomp$6$$ = _.$JSCompiler_StaticMethods_findAction_$$($source$jscomp$16$$, $actionEventType$jscomp$2$$);
  if ($action$jscomp$6$$) {
    var $sequenceId$jscomp$1$$ = Math.random(), $currentPromise$$ = null;
    $action$jscomp$6$$.$actionInfos$.forEach(function($actionInfo$$) {
      function $invokeAction$$() {
        var $currentPromise$$ = $$jscomp$this$jscomp$18$$.$G$[$target$jscomp$75$$] ? $$jscomp$this$jscomp$18$$.$D$ : $$jscomp$this$jscomp$18$$.$D$.getElementById($target$jscomp$75$$);
        if ($currentPromise$$) {
          return $JSCompiler_StaticMethods_invoke_$$($$jscomp$this$jscomp$18$$, new $ActionInvocation$$module$src$service$action_impl$$($currentPromise$$, $actionInfo$$.method, $args$jscomp$6$$, $source$jscomp$16$$, $action$jscomp$6$$.node, $event$jscomp$22$$, $trust$jscomp$3$$, $actionEventType$jscomp$2$$, $currentPromise$$.tagName || $target$jscomp$75$$, $sequenceId$jscomp$1$$));
        }
        $$jscomp$this$jscomp$18$$.$error_$('Target "' + $target$jscomp$75$$ + '" not found for action ' + ("[" + $actionInfo$$.$str$ + "]."));
      }
      var $target$jscomp$75$$ = $actionInfo$$.target, $args$jscomp$6$$ = $dereferenceExprsInArgs$$module$src$service$action_impl$$($actionInfo$$.args, $event$jscomp$22$$);
      $currentPromise$$ = $currentPromise$$ ? $currentPromise$$.then($invokeAction$$) : $invokeAction$$();
    });
  }
};
$ActionService$$module$src$service$action_impl$$.prototype.$error_$ = function($e$jscomp$47_message$jscomp$32$$, $opt_element$jscomp$15$$) {
  if ($opt_element$jscomp$15$$) {
    throw $e$jscomp$47_message$jscomp$32$$ = _.$user$$module$src$log$$().$createError$("[Action] " + $e$jscomp$47_message$jscomp$32$$), _.$reportError$$module$src$error$$($e$jscomp$47_message$jscomp$32$$, $opt_element$jscomp$15$$), $e$jscomp$47_message$jscomp$32$$;
  }
  _.$user$$module$src$log$$().error("Action", $e$jscomp$47_message$jscomp$32$$);
};
var $TokenType$$module$src$service$action_impl$EOF$$ = 1, $TokenType$$module$src$service$action_impl$SEPARATOR$$ = 2, $TokenType$$module$src$service$action_impl$LITERAL$$ = 3, $TokenType$$module$src$service$action_impl$ID$$ = 4, $TokenType$$module$src$service$action_impl$OBJECT$$ = 5;
$ParserTokenizer$$module$src$service$action_impl$$.prototype.next = function($opt_convertValues_tok$jscomp$3$$) {
  $opt_convertValues_tok$jscomp$3$$ = $JSCompiler_StaticMethods_ParserTokenizer$$module$src$service$action_impl_prototype$next_$$(this, $opt_convertValues_tok$jscomp$3$$ || !1);
  this.$F$ = $opt_convertValues_tok$jscomp$3$$.index;
  return $opt_convertValues_tok$jscomp$3$$;
};
$Xhr$$module$src$service$xhr_impl$$.prototype.$F$ = function($input$jscomp$16$$, $init$jscomp$11$$) {
  var $$jscomp$this$jscomp$20$$ = this, $$jscomp$arguments$$ = arguments;
  return _.$getViewerInterceptResponse$$module$src$utils$xhr_utils$$(this.$win$, this.$G$, $input$jscomp$16$$, $init$jscomp$11$$).then(function($input$jscomp$16$$) {
    if ($input$jscomp$16$$) {
      return $input$jscomp$16$$;
    }
    $isFormDataWrapper$$module$src$form_data_wrapper$$($init$jscomp$11$$.body) && ($init$jscomp$11$$.body = $init$jscomp$11$$.body.getFormData());
    return $$jscomp$this$jscomp$20$$.$win$.fetch.apply(null, $$jscomp$arguments$$);
  });
};
$Xhr$$module$src$service$xhr_impl$$.prototype.fetch = function($input$jscomp$20$$, $init$jscomp$13_opt_init$jscomp$10$$) {
  $init$jscomp$13_opt_init$jscomp$10$$ = _.$setupInit$$module$src$utils$xhr_utils$$($init$jscomp$13_opt_init$jscomp$10$$);
  return _.$JSCompiler_StaticMethods_fetchAmpCors_$$(this, $input$jscomp$20$$, $init$jscomp$13_opt_init$jscomp$10$$).then(function($input$jscomp$20$$) {
    return _.$assertSuccess$$module$src$utils$xhr_utils$$($input$jscomp$20$$);
  });
};
_.$$jscomp$inherits$$($BatchedXhr$$module$src$service$batched_xhr_impl$$, $Xhr$$module$src$service$xhr_impl$$);
$BatchedXhr$$module$src$service$batched_xhr_impl$$.prototype.fetch = function($fetchPromise_input$jscomp$22$$, $opt_init$jscomp$12$$) {
  var $$jscomp$this$jscomp$22$$ = this, $isBatchable$$ = !$opt_init$jscomp$12$$ || !$opt_init$jscomp$12$$.method || "GET" === $opt_init$jscomp$12$$.method, $key$jscomp$57$$ = _.$removeFragment$$module$src$url$$($fetchPromise_input$jscomp$22$$) + ($opt_init$jscomp$12$$ && $opt_init$jscomp$12$$.headers && $opt_init$jscomp$12$$.headers.Accept || ""), $isBatched$$ = !!this.$D$[$key$jscomp$57$$];
  if ($isBatchable$$ && $isBatched$$) {
    return this.$D$[$key$jscomp$57$$].then(function($fetchPromise_input$jscomp$22$$) {
      return $fetchPromise_input$jscomp$22$$.clone();
    });
  }
  $fetchPromise_input$jscomp$22$$ = $Xhr$$module$src$service$xhr_impl$$.prototype.fetch.call(this, $fetchPromise_input$jscomp$22$$, $opt_init$jscomp$12$$);
  $isBatchable$$ && (this.$D$[$key$jscomp$57$$] = $fetchPromise_input$jscomp$22$$.then(function($fetchPromise_input$jscomp$22$$) {
    delete $$jscomp$this$jscomp$22$$.$D$[$key$jscomp$57$$];
    return $fetchPromise_input$jscomp$22$$.clone();
  }, function($fetchPromise_input$jscomp$22$$) {
    delete $$jscomp$this$jscomp$22$$.$D$[$key$jscomp$57$$];
    throw $fetchPromise_input$jscomp$22$$;
  }));
  return $fetchPromise_input$jscomp$22$$;
};
var $base64UrlEncodeSubs$$module$src$utils$base64$$ = {"+":"-", "/":"_", "=":"."};
$CacheCidApi$$module$src$service$cache_cid_api$$.prototype.isSupported = function() {
  return $JSCompiler_StaticMethods_isCctEmbedded$$(this.$viewer_$) && this.$viewer_$.$wa$;
};
$GoogleCidApi$$module$src$service$cid_api$$.prototype.$G$ = function($res$jscomp$9$$) {
  if ($res$jscomp$9$$.optOut) {
    return $JSCompiler_StaticMethods_persistToken_$$(this, "$OPT_OUT", 31536E6), "$OPT_OUT";
  }
  if ($res$jscomp$9$$.clientId) {
    return $JSCompiler_StaticMethods_persistToken_$$(this, $res$jscomp$9$$.securityToken, 31536E6), $res$jscomp$9$$.clientId;
  }
  if ($res$jscomp$9$$.alternateUrl) {
    return null;
  }
  $JSCompiler_StaticMethods_persistToken_$$(this, "$NOT_FOUND", 36E5);
  return null;
};
$ViewerCidApi$$module$src$service$viewer_cid_api$$.prototype.isSupported = function() {
  return _.$JSCompiler_StaticMethods_hasCapability$$(this.$viewer_$, "cid") ? $JSCompiler_StaticMethods_isTrustedViewer$$(this.$viewer_$) : window.Promise.resolve(!1);
};
var $CID_API_SCOPE_WHITELIST$$module$src$service$cid_impl$$ = {googleanalytics:"AMP_ECID_GOOGLE"}, $API_KEYS$$module$src$service$cid_impl$$ = {googleanalytics:"AIzaSyA65lEHUEizIsNtlbNo-l2K18dT680nsaM"};
$Cid$$module$src$service$cid_impl$$.prototype.get = function($getCidStruct$$, $consent$jscomp$1$$, $opt_persistenceConsent$jscomp$1$$) {
  var $$jscomp$this$jscomp$26$$ = this;
  return $consent$jscomp$1$$.then(function() {
    return _.$Services$$module$src$services$viewerForDoc$$($$jscomp$this$jscomp$26$$.ampdoc).$D$;
  }).then(function() {
    return $isOptedOutOfCid$$module$src$service$cid_impl$$($$jscomp$this$jscomp$26$$.ampdoc);
  }).then(function($cidPromise_optedOut$$) {
    if ($cidPromise_optedOut$$) {
      return "";
    }
    $cidPromise_optedOut$$ = $JSCompiler_StaticMethods_getExternalCid_$$($$jscomp$this$jscomp$26$$, $getCidStruct$$, $opt_persistenceConsent$jscomp$1$$ || $consent$jscomp$1$$);
    return _.$JSCompiler_StaticMethods_timeoutPromise$$(_.$Services$$module$src$services$timerFor$$($$jscomp$this$jscomp$26$$.ampdoc.$win$), 10000, $cidPromise_optedOut$$, 'Getting cid for "' + $getCidStruct$$.scope + '" timed out').catch(function($getCidStruct$$) {
      _.$rethrowAsync$$module$src$log$$($getCidStruct$$);
    });
  });
};
var $INIT_TIME$$module$src$intersection_observer_polyfill$$ = Date.now();
var $_template$$module$src$loader$$ = ["<div class=i-amphtml-loader-line><div class=i-amphtml-loader-moving-line></div></div>"], $_template2$$module$src$loader$$ = ["<div class=i-amphtml-loader><div class=i-amphtml-loader-dot></div><div class=i-amphtml-loader-dot></div><div class=i-amphtml-loader-dot></div></div>"], $LINE_LOADER_ELEMENTS$$module$src$loader$$ = {"AMP-AD":!0};
var $stubbedElements$$module$src$element_stub$$ = [];
_.$$jscomp$inherits$$(_.$ElementStub$$module$src$element_stub$$, _.$BaseElement$$module$src$base_element$$);
_.$ElementStub$$module$src$element_stub$$.prototype.$getLayoutPriority$ = function() {
  return 0;
};
_.$ElementStub$$module$src$element_stub$$.prototype.$isLayoutSupported$ = function() {
  return !0;
};
_.$ElementStub$$module$src$element_stub$$.prototype.$reconstructWhenReparented$ = function() {
  return !1;
};
var $LABEL_MAP$$module$src$layout_delay_meter$$ = {0:"cld", 2:"adld"};
$LayoutDelayMeter$$module$src$layout_delay_meter$$.prototype.$startLayout$ = function() {
  this.$label_$ && !this.$G$ && (this.$G$ = this.$I$.Date.now(), $JSCompiler_StaticMethods_tryMeasureDelay_$$(this));
};
_.$JSCompiler_prototypeAlias$$ = _.$Resource$$module$src$service$resource$$.prototype;
_.$JSCompiler_prototypeAlias$$.$getOwner$ = function() {
  if (void 0 === this.$K$) {
    for (var $n$jscomp$10$$ = this.element; $n$jscomp$10$$; $n$jscomp$10$$ = $n$jscomp$10$$.parentElement) {
      if ($n$jscomp$10$$.__AMP__OWNER) {
        this.$K$ = $n$jscomp$10$$.__AMP__OWNER;
        break;
      }
    }
    void 0 === this.$K$ && (this.$K$ = null);
  }
  return this.$K$;
};
_.$JSCompiler_prototypeAlias$$.$getLayoutPriority$ = function() {
  return -1 != this.$aa$ ? this.$aa$ : this.element.$getLayoutPriority$();
};
_.$JSCompiler_prototypeAlias$$.$updateLayoutPriority$ = _.$JSCompiler_stubMethod$$(1);
_.$JSCompiler_prototypeAlias$$.$build$ = function() {
  var $$jscomp$this$jscomp$35$$ = this;
  if (this.$O$ || !this.element.$ea$() || !$JSCompiler_StaticMethods_grantBuildPermission$$(this.$J$)) {
    return null;
  }
  this.$O$ = !0;
  return this.element.$build$().then(function() {
    $$jscomp$this$jscomp$35$$.$O$ = !1;
    $$jscomp$this$jscomp$35$$.$D$ ? ($$jscomp$this$jscomp$35$$.$state_$ = 2, $$jscomp$this$jscomp$35$$.element.$Ba$($$jscomp$this$jscomp$35$$.$getLayoutBox$(), !0)) : $$jscomp$this$jscomp$35$$.$state_$ = 1;
    _.$JSCompiler_StaticMethods_signal$$($$jscomp$this$jscomp$35$$.element.signals(), "res-built");
    $$jscomp$this$jscomp$35$$.element.$D$("amp:built");
  }, function($reason$jscomp$13$$) {
    $isBlockedByConsent$$module$src$error$$($reason$jscomp$13$$) || _.$dev$$module$src$log$$().error("Resource", "failed to build:", $$jscomp$this$jscomp$35$$.$R$, $reason$jscomp$13$$);
    $$jscomp$this$jscomp$35$$.$O$ = !1;
    $JSCompiler_StaticMethods_rejectSignal$$($$jscomp$this$jscomp$35$$.element.signals(), "res-built", $reason$jscomp$13$$);
    throw $reason$jscomp$13$$;
  });
};
_.$JSCompiler_prototypeAlias$$.$changeSize$ = function($newHeight$jscomp$3$$, $newWidth$jscomp$1$$, $opt_newMargins$$) {
  this.element.$changeSize$($newHeight$jscomp$3$$, $newWidth$jscomp$1$$, $opt_newMargins$$);
  this.$I$ = !0;
};
_.$JSCompiler_prototypeAlias$$.measure = function() {
  if (!(this.$fa$ && this.element.parentElement && _.$startsWith$$module$src$string$$(this.element.parentElement.tagName, "AMP-")) || "__AMP__RESOURCE" in this.element.parentElement) {
    this.$I$ = !1;
    var $oldBox$$ = this.$F$;
    if (this.$useLayers_$) {
      var $box$jscomp$2_element$jscomp$inline_1317_viewport$jscomp$inline_1320$$ = this.element;
      $box$jscomp$2_element$jscomp$inline_1317_viewport$jscomp$inline_1320$$.$P$.$remeasure$($box$jscomp$2_element$jscomp$inline_1317_viewport$jscomp$inline_1320$$, !0);
      this.$F$ = this.$getPageLayoutBox$();
    } else {
      $box$jscomp$2_element$jscomp$inline_1317_viewport$jscomp$inline_1320$$ = this.$J$.$getViewport$();
      var $box$jscomp$inline_1321_sizeChanges$$ = this.$J$.$getViewport$().$getLayoutRect$(this.element);
      this.$F$ = $box$jscomp$inline_1321_sizeChanges$$;
      var $isFixed$jscomp$inline_1322$$ = !1;
      if ($box$jscomp$2_element$jscomp$inline_1317_viewport$jscomp$inline_1320$$.$D$.$ViewportBindingDef$$module$src$service$viewport$viewport_binding_def_prototype$supportsPositionFixed$() && _.$JSCompiler_StaticMethods_isDisplayed$$(this)) {
        for (var $win$jscomp$inline_1323$$ = this.$J$.$win$, $body$jscomp$inline_1324$$ = $win$jscomp$inline_1323$$.document.body, $n$jscomp$inline_1325$$ = this.element; $n$jscomp$inline_1325$$ && $n$jscomp$inline_1325$$ != $body$jscomp$inline_1324$$; $n$jscomp$inline_1325$$ = $n$jscomp$inline_1325$$.offsetParent) {
          if ($n$jscomp$inline_1325$$.$isAlwaysFixed$ && $n$jscomp$inline_1325$$.$isAlwaysFixed$()) {
            $isFixed$jscomp$inline_1322$$ = !0;
            break;
          }
          if ($n$jscomp$inline_1325$$.__AMP_DECLFIXED && "fixed" == _.$computedStyle$$module$src$style$$($win$jscomp$inline_1323$$, $n$jscomp$inline_1325$$).position) {
            $isFixed$jscomp$inline_1322$$ = !0;
            break;
          }
        }
      }
      if (this.$V$ = $isFixed$jscomp$inline_1322$$) {
        this.$F$ = _.$moveLayoutRect$$module$src$layout_rect$$($box$jscomp$inline_1321_sizeChanges$$, -$box$jscomp$2_element$jscomp$inline_1317_viewport$jscomp$inline_1320$$.getScrollLeft(), -_.$JSCompiler_StaticMethods_Viewport$$module$src$service$viewport$viewport_impl_prototype$getScrollTop$$($box$jscomp$2_element$jscomp$inline_1317_viewport$jscomp$inline_1320$$));
      }
    }
    $box$jscomp$2_element$jscomp$inline_1317_viewport$jscomp$inline_1320$$ = this.$F$;
    $box$jscomp$inline_1321_sizeChanges$$ = !($oldBox$$.width == $box$jscomp$2_element$jscomp$inline_1317_viewport$jscomp$inline_1320$$.width && $oldBox$$.height === $box$jscomp$2_element$jscomp$inline_1317_viewport$jscomp$inline_1320$$.height);
    1 != this.$state_$ && $oldBox$$.top == $box$jscomp$2_element$jscomp$inline_1317_viewport$jscomp$inline_1320$$.top && !$box$jscomp$inline_1321_sizeChanges$$ || !this.element.$ea$() || 0 == this.$state_$ || 1 != this.$state_$ && !this.element.$isRelayoutNeeded$() || (this.$state_$ = 2);
    this.$D$ || (this.$D$ = $box$jscomp$2_element$jscomp$inline_1317_viewport$jscomp$inline_1320$$);
    this.element.$Ba$($box$jscomp$2_element$jscomp$inline_1317_viewport$jscomp$inline_1320$$, $box$jscomp$inline_1321_sizeChanges$$);
  }
};
_.$JSCompiler_prototypeAlias$$.$getLayoutBox$ = function() {
  if (this.$useLayers_$) {
    var $element$jscomp$105_size$jscomp$12$$ = this.element, $layers$jscomp$1$$ = $element$jscomp$105_size$jscomp$12$$.$P$, $pos$jscomp$1_viewport$jscomp$3$$ = $layers$jscomp$1$$.$getScrolledPosition$($element$jscomp$105_size$jscomp$12$$);
    $element$jscomp$105_size$jscomp$12$$ = $layers$jscomp$1$$.$getSize$($element$jscomp$105_size$jscomp$12$$);
    return _.$layoutRectLtwh$$module$src$layout_rect$$($pos$jscomp$1_viewport$jscomp$3$$.left, $pos$jscomp$1_viewport$jscomp$3$$.top, $element$jscomp$105_size$jscomp$12$$.width, $element$jscomp$105_size$jscomp$12$$.height);
  }
  if (!this.$V$) {
    return this.$F$;
  }
  $pos$jscomp$1_viewport$jscomp$3$$ = this.$J$.$getViewport$();
  return _.$moveLayoutRect$$module$src$layout_rect$$(this.$F$, $pos$jscomp$1_viewport$jscomp$3$$.getScrollLeft(), _.$JSCompiler_StaticMethods_Viewport$$module$src$service$viewport$viewport_impl_prototype$getScrollTop$$($pos$jscomp$1_viewport$jscomp$3$$));
};
_.$JSCompiler_prototypeAlias$$.$getPageLayoutBox$ = function() {
  if (this.$useLayers_$) {
    var $element$jscomp$106_size$jscomp$13$$ = this.element, $layers$jscomp$2$$ = $element$jscomp$106_size$jscomp$13$$.$P$, $pos$jscomp$2$$ = $layers$jscomp$2$$.$getOffsetPosition$($element$jscomp$106_size$jscomp$13$$);
    $element$jscomp$106_size$jscomp$13$$ = $layers$jscomp$2$$.$getSize$($element$jscomp$106_size$jscomp$13$$);
    return _.$layoutRectLtwh$$module$src$layout_rect$$($pos$jscomp$2$$.left, $pos$jscomp$2$$.top, $element$jscomp$106_size$jscomp$13$$.width, $element$jscomp$106_size$jscomp$13$$.height);
  }
  return this.$F$;
};
_.$JSCompiler_prototypeAlias$$.$prerenderAllowed$ = function() {
  return this.element.$prerenderAllowed$();
};
_.$JSCompiler_prototypeAlias$$.$layersDistanceRatio_$ = function($currentScore$$, $JSCompiler_inline_result$jscomp$508_layout$jscomp$4_parentHeight$jscomp$inline_1333$$, $depth$jscomp$3_depthPenalty$$) {
  $currentScore$$ = $currentScore$$ || 0;
  $depth$jscomp$3_depthPenalty$$ = 1 + $depth$jscomp$3_depthPenalty$$ / 10;
  var $nonActivePenalty$$ = $JSCompiler_inline_result$jscomp$508_layout$jscomp$4_parentHeight$jscomp$inline_1333$$.$isActive_$ ? 1 : 2;
  var $JSCompiler_inline_result$jscomp$506_JSCompiler_temp_const$jscomp$507_distance$jscomp$inline_1328$$ = $JSCompiler_StaticMethods_getHorizontalDistanceFromParent$$($JSCompiler_inline_result$jscomp$508_layout$jscomp$4_parentHeight$jscomp$inline_1333$$);
  if (0 === $JSCompiler_inline_result$jscomp$506_JSCompiler_temp_const$jscomp$507_distance$jscomp$inline_1328$$) {
    $JSCompiler_inline_result$jscomp$506_JSCompiler_temp_const$jscomp$507_distance$jscomp$inline_1328$$ = 0;
  } else {
    var $distance$jscomp$inline_1332_parentWidth$jscomp$inline_1329$$ = $JSCompiler_StaticMethods_getParentLayer$$($JSCompiler_inline_result$jscomp$508_layout$jscomp$4_parentHeight$jscomp$inline_1333$$).$getSize$().width;
    $JSCompiler_inline_result$jscomp$506_JSCompiler_temp_const$jscomp$507_distance$jscomp$inline_1328$$ /= $distance$jscomp$inline_1332_parentWidth$jscomp$inline_1329$$;
  }
  $distance$jscomp$inline_1332_parentWidth$jscomp$inline_1329$$ = $JSCompiler_StaticMethods_getVerticalDistanceFromParent$$($JSCompiler_inline_result$jscomp$508_layout$jscomp$4_parentHeight$jscomp$inline_1333$$);
  0 === $distance$jscomp$inline_1332_parentWidth$jscomp$inline_1329$$ ? $JSCompiler_inline_result$jscomp$508_layout$jscomp$4_parentHeight$jscomp$inline_1333$$ = 0 : ($JSCompiler_inline_result$jscomp$508_layout$jscomp$4_parentHeight$jscomp$inline_1333$$ = $JSCompiler_StaticMethods_getParentLayer$$($JSCompiler_inline_result$jscomp$508_layout$jscomp$4_parentHeight$jscomp$inline_1333$$).$getSize$().height, $JSCompiler_inline_result$jscomp$508_layout$jscomp$4_parentHeight$jscomp$inline_1333$$ = $distance$jscomp$inline_1332_parentWidth$jscomp$inline_1329$$ / 
  $JSCompiler_inline_result$jscomp$508_layout$jscomp$4_parentHeight$jscomp$inline_1333$$);
  return $currentScore$$ + $nonActivePenalty$$ * $depth$jscomp$3_depthPenalty$$ * ($JSCompiler_inline_result$jscomp$506_JSCompiler_temp_const$jscomp$507_distance$jscomp$inline_1328$$ + $JSCompiler_inline_result$jscomp$508_layout$jscomp$4_parentHeight$jscomp$inline_1333$$);
};
_.$JSCompiler_prototypeAlias$$.$renderOutsideViewport$ = function() {
  $JSCompiler_StaticMethods_resolveDeferredsWhenWithinViewports_$$(this);
  return !!this.$getOwner$() || _.$JSCompiler_StaticMethods_isWithinViewportRatio$$(this, this.element.$renderOutsideViewport$());
};
_.$JSCompiler_prototypeAlias$$.$idleRenderOutsideViewport$ = function() {
  return _.$JSCompiler_StaticMethods_isWithinViewportRatio$$(this, this.element.$idleRenderOutsideViewport$());
};
_.$JSCompiler_prototypeAlias$$.$startLayout$ = function() {
  var $$jscomp$this$jscomp$36$$ = this;
  if (this.$layoutPromise_$) {
    return this.$layoutPromise_$;
  }
  if (4 == this.$state_$) {
    return window.Promise.resolve();
  }
  if (5 == this.$state_$) {
    return window.Promise.reject(this.$ba$);
  }
  _.$JSCompiler_StaticMethods_isDisplayed$$(this);
  if (0 < this.$W$ && !this.element.$isRelayoutNeeded$()) {
    return "Resource", this.$state_$ = 4, window.Promise.resolve();
  }
  "Resource";
  this.$W$++;
  this.$state_$ = 3;
  try {
    var $promise$jscomp$15$$ = this.element.$layoutCallback$();
  } catch ($e$jscomp$54$$) {
    return window.Promise.reject($e$jscomp$54$$);
  }
  return this.$layoutPromise_$ = $promise$jscomp$15$$.then(function() {
    return $JSCompiler_StaticMethods_layoutComplete_$$($$jscomp$this$jscomp$36$$, !0);
  }, function($promise$jscomp$15$$) {
    return $JSCompiler_StaticMethods_layoutComplete_$$($$jscomp$this$jscomp$36$$, !1, $promise$jscomp$15$$);
  });
};
_.$JSCompiler_prototypeAlias$$.$isInViewport$ = function() {
  var $isInViewport$$ = this.element.$isInViewport$();
  $isInViewport$$ && $JSCompiler_StaticMethods_resolveDeferredsWhenWithinViewports_$$(this);
  return $isInViewport$$;
};
_.$JSCompiler_prototypeAlias$$.pause = function() {
  this.element.$pauseCallback$();
  this.element.$unlayoutOnPause$() && _.$JSCompiler_StaticMethods_unlayout$$(this);
};
_.$JSCompiler_prototypeAlias$$.resume = function() {
  this.element.$resumeCallback$();
};
_.$JSCompiler_prototypeAlias$$.$unload$ = function() {
  this.pause();
  _.$JSCompiler_StaticMethods_unlayout$$(this);
};
_.$JSCompiler_prototypeAlias$$.disconnect = function() {
  delete this.element.__AMP__RESOURCE;
  this.element.disconnect(!0);
};
$SizeList$$module$src$size_list$$.prototype.select = function($win$jscomp$138$$) {
  for (var $sizes$jscomp$2$$ = this.$D$, $length$jscomp$32$$ = $sizes$jscomp$2$$.length - 1, $i$jscomp$82$$ = 0; $i$jscomp$82$$ < $length$jscomp$32$$; $i$jscomp$82$$++) {
    var $option$jscomp$2$$ = $sizes$jscomp$2$$[$i$jscomp$82$$];
    if ($win$jscomp$138$$.matchMedia($option$jscomp$2$$.$mediaQuery$).matches) {
      return $option$jscomp$2$$.size;
    }
  }
  return $sizes$jscomp$2$$[$length$jscomp$32$$].size;
};
_.$Signals$$module$src$utils$signals$$.prototype.get = function($name$jscomp$112$$) {
  return this.$F$[$name$jscomp$112$$] || null;
};
_.$Signals$$module$src$utils$signals$$.prototype.whenSignal = function($name$jscomp$113$$) {
  var $$jscomp$destructuring$var72_promiseStruct_result$jscomp$4$$ = this.$D$ && this.$D$[$name$jscomp$113$$];
  $$jscomp$destructuring$var72_promiseStruct_result$jscomp$4$$ || ($$jscomp$destructuring$var72_promiseStruct_result$jscomp$4$$ = this.$F$[$name$jscomp$113$$], null != $$jscomp$destructuring$var72_promiseStruct_result$jscomp$4$$ ? $$jscomp$destructuring$var72_promiseStruct_result$jscomp$4$$ = {$promise$:"number" == typeof $$jscomp$destructuring$var72_promiseStruct_result$jscomp$4$$ ? window.Promise.resolve($$jscomp$destructuring$var72_promiseStruct_result$jscomp$4$$) : window.Promise.reject($$jscomp$destructuring$var72_promiseStruct_result$jscomp$4$$)} : 
  ($$jscomp$destructuring$var72_promiseStruct_result$jscomp$4$$ = new _.$Deferred$$module$src$utils$promise$$, $$jscomp$destructuring$var72_promiseStruct_result$jscomp$4$$ = {$promise$:$$jscomp$destructuring$var72_promiseStruct_result$jscomp$4$$.$promise$, resolve:$$jscomp$destructuring$var72_promiseStruct_result$jscomp$4$$.resolve, reject:$$jscomp$destructuring$var72_promiseStruct_result$jscomp$4$$.reject}), this.$D$ || (this.$D$ = _.$map$$module$src$utils$object$$()), this.$D$[$name$jscomp$113$$] = 
  $$jscomp$destructuring$var72_promiseStruct_result$jscomp$4$$);
  return $$jscomp$destructuring$var72_promiseStruct_result$jscomp$4$$.$promise$;
};
_.$Signals$$module$src$utils$signals$$.prototype.reset = function($name$jscomp$116$$) {
  this.$F$[$name$jscomp$116$$] && delete this.$F$[$name$jscomp$116$$];
  var $promiseStruct$jscomp$3$$ = this.$D$ && this.$D$[$name$jscomp$116$$];
  $promiseStruct$jscomp$3$$ && !$promiseStruct$jscomp$3$$.resolve && delete this.$D$[$name$jscomp$116$$];
};
var $_template$$module$src$custom_element$$ = ['<div class="i-amphtml-loading-container i-amphtml-fill-content amp-hidden"></div>'], $templateTagSupported$$module$src$custom_element$$;
var $filteredLinkRels$$module$src$service$document_info_impl$$ = ["prefetch", "preload", "preconnect", "dns-prefetch"];
$DocInfo$$module$src$service$document_info_impl$$.prototype.get = function() {
  if (this.$info_$) {
    return this.$info_$;
  }
  var $ampdoc$jscomp$31$$ = this.$ampdoc_$, $pageViewId_sourceUrl$$ = _.$getSourceUrl$$module$src$url$$($ampdoc$jscomp$31$$.$AmpDoc$$module$src$service$ampdoc_impl_prototype$getUrl$()), $linkRels_rootNode$jscomp$2$$ = $ampdoc$jscomp$31$$.getRootNode(), $canonicalTag_canonicalUrl$jscomp$2$$ = $linkRels_rootNode$jscomp$2$$ && $linkRels_rootNode$jscomp$2$$.AMP && $linkRels_rootNode$jscomp$2$$.AMP.canonicalUrl;
  $canonicalTag_canonicalUrl$jscomp$2$$ || ($canonicalTag_canonicalUrl$jscomp$2$$ = ($canonicalTag_canonicalUrl$jscomp$2$$ = $linkRels_rootNode$jscomp$2$$.querySelector("link[rel=canonical]")) ? _.$parseUrlDeprecated$$module$src$url$$($canonicalTag_canonicalUrl$jscomp$2$$.href).href : $pageViewId_sourceUrl$$);
  $pageViewId_sourceUrl$$ = String(Math.floor(10000 * $ampdoc$jscomp$31$$.$win$.Math.random()));
  $linkRels_rootNode$jscomp$2$$ = $getLinkRels$$module$src$service$document_info_impl$$($ampdoc$jscomp$31$$.$win$.document);
  var $metaTags$$ = $getMetaTags$$module$src$service$document_info_impl$$($ampdoc$jscomp$31$$.$win$.document), $replaceParams$$ = $getReplaceParams$$module$src$service$document_info_impl$$($ampdoc$jscomp$31$$);
  return this.$info_$ = {get sourceUrl() {
    return _.$getSourceUrl$$module$src$url$$($ampdoc$jscomp$31$$.$AmpDoc$$module$src$service$ampdoc_impl_prototype$getUrl$());
  }, canonicalUrl:$canonicalTag_canonicalUrl$jscomp$2$$, pageViewId:$pageViewId_sourceUrl$$, $linkRels$:$linkRels_rootNode$jscomp$2$$, $metaTags$:$metaTags$$, $replaceParams$:$replaceParams$$};
};
$DocumentState$$module$src$service$document_state$$.prototype.$J$ = function() {
  this.$G$.$fire$();
};
_.$ATTRIBUTES_TO_PROPAGATE$$module$builtins$amp_img$$ = "alt title referrerpolicy aria-label aria-describedby aria-labelledby srcset src sizes".split(" ");
_.$$jscomp$inherits$$(_.$AmpImg$$module$builtins$amp_img$$, _.$BaseElement$$module$src$base_element$$);
_.$JSCompiler_prototypeAlias$$ = _.$AmpImg$$module$builtins$amp_img$$.prototype;
_.$JSCompiler_prototypeAlias$$.$mutatedAttributesCallback$ = _.$JSCompiler_stubMethod$$(27);
_.$JSCompiler_prototypeAlias$$.$preconnectCallback$ = function($onLayout$jscomp$1$$) {
  var $src$jscomp$2_srcset$jscomp$1_srcseturl$jscomp$1$$ = this.element.getAttribute("src");
  $src$jscomp$2_srcset$jscomp$1_srcseturl$jscomp$1$$ ? this.$preconnect$.url($src$jscomp$2_srcset$jscomp$1_srcseturl$jscomp$1$$, $onLayout$jscomp$1$$) : ($src$jscomp$2_srcset$jscomp$1_srcseturl$jscomp$1$$ = this.element.getAttribute("srcset")) && ($src$jscomp$2_srcset$jscomp$1_srcseturl$jscomp$1$$ = /\S+/.exec($src$jscomp$2_srcset$jscomp$1_srcseturl$jscomp$1$$)) && this.$preconnect$.url($src$jscomp$2_srcset$jscomp$1_srcseturl$jscomp$1$$[0], $onLayout$jscomp$1$$);
};
_.$JSCompiler_prototypeAlias$$.$firstAttachedCallback$ = function() {
  this.element.hasAttribute("noprerender") && (this.$prerenderAllowed_$ = !1);
};
_.$JSCompiler_prototypeAlias$$.$isLayoutSupported$ = function($layout$jscomp$5$$) {
  return _.$isLayoutSizeDefined$$module$src$layout$$($layout$jscomp$5$$);
};
_.$JSCompiler_prototypeAlias$$.$prerenderAllowed$ = function() {
  return this.$prerenderAllowed_$;
};
_.$JSCompiler_prototypeAlias$$.$reconstructWhenReparented$ = function() {
  return !1;
};
_.$JSCompiler_prototypeAlias$$.$layoutCallback$ = function() {
  var $$jscomp$this$jscomp$47$$ = this;
  this.$img_$ || (this.$D$ = !this.element.hasAttribute("fallback"), this.element.hasAttribute("i-amphtml-ssr") && (this.$img_$ = this.element.querySelector("img")), this.$img_$ = this.$img_$ || new window.Image, this.$img_$.setAttribute("decoding", "async"), this.element.id && this.$img_$.setAttribute("amp-img-id", this.element.id), "img" == this.element.getAttribute("role") && (this.element.removeAttribute("role"), this.$user$().error("AMP-IMG", "Setting role=img on amp-img elements breaks screen readers please just set alt or ARIA attributes, they will be correctly propagated for the underlying <img> element.")), 
  _.$JSCompiler_StaticMethods_propagateAttributes$$(this, _.$ATTRIBUTES_TO_PROPAGATE$$module$builtins$amp_img$$, this.$img_$), _.$guaranteeSrcForSrcsetUnsupportedBrowsers$$module$src$utils$img$$(this.$img_$), _.$JSCompiler_StaticMethods_applyFillContent$$(this.$img_$, !0), this.element.appendChild(this.$img_$));
  var $img$jscomp$3$$ = this.$img_$;
  this.$G$ = _.$listen$$module$src$event_helper$$($img$jscomp$3$$, "load", function() {
    return $JSCompiler_StaticMethods_hideFallbackImg_$$($$jscomp$this$jscomp$47$$);
  });
  this.$F$ = _.$listen$$module$src$event_helper$$($img$jscomp$3$$, "error", function() {
    return $JSCompiler_StaticMethods_onImgLoadingError_$$($$jscomp$this$jscomp$47$$);
  });
  return 0 >= this.$layoutWidth_$ ? window.Promise.resolve() : this.$loadPromise$($img$jscomp$3$$);
};
_.$JSCompiler_prototypeAlias$$.$unlayoutCallback$ = function() {
  this.$F$ && (this.$F$(), this.$F$ = null);
  this.$G$ && (this.$G$(), this.$G$ = null);
  return !0;
};
_.$JSCompiler_prototypeAlias$$.$firstLayoutCompleted$ = function() {
  var $placeholder$jscomp$2$$ = this.$getPlaceholder$();
  $placeholder$jscomp$2$$ && $placeholder$jscomp$2$$.classList.contains("i-amphtml-blurry-placeholder") && _.$isExperimentOn$$module$src$experiments$$(this.$win$, "blurry-placeholder") ? _.$setImportantStyles$$module$src$style$$($placeholder$jscomp$2$$, {opacity:0}) : this.$togglePlaceholder$(!1);
};
_.$$jscomp$inherits$$($AmpLayout$$module$builtins$amp_layout$$, _.$BaseElement$$module$src$base_element$$);
$AmpLayout$$module$builtins$amp_layout$$.prototype.$isLayoutSupported$ = function($layout$jscomp$6$$) {
  return "container" == $layout$jscomp$6$$ || _.$isLayoutSizeDefined$$module$src$layout$$($layout$jscomp$6$$);
};
$AmpLayout$$module$builtins$amp_layout$$.prototype.$buildCallback$ = function() {
  if ("container" != this.$getLayout$()) {
    var $container$jscomp$5$$ = this.$win$.document.createElement("div");
    _.$JSCompiler_StaticMethods_applyFillContent$$($container$jscomp$5$$);
    this.$getRealChildNodes$().forEach(function($child$jscomp$6$$) {
      $container$jscomp$5$$.appendChild($child$jscomp$6$$);
    });
    this.element.appendChild($container$jscomp$5$$);
  }
};
$AmpLayout$$module$builtins$amp_layout$$.prototype.$prerenderAllowed$ = function() {
  return !0;
};
_.$$jscomp$inherits$$($AmpPixel$$module$builtins$amp_pixel$$, _.$BaseElement$$module$src$base_element$$);
$AmpPixel$$module$builtins$amp_pixel$$.prototype.$isLayoutSupported$ = function() {
  return !0;
};
$AmpPixel$$module$builtins$amp_pixel$$.prototype.$buildCallback$ = function() {
  this.element.setAttribute("aria-hidden", "true");
  this.$F$ = this.element.getAttribute("referrerpolicy");
  this.element.hasAttribute("i-amphtml-ssr") && this.element.querySelector("img") ? _.$dev$$module$src$log$$().$Log$$module$src$log_prototype$info$("amp-pixel", "inabox img already present") : _.$Services$$module$src$services$viewerForDoc$$(this.$getAmpDoc$()).$D$.then(this.$G$.bind(this));
};
$AmpPixel$$module$builtins$amp_pixel$$.prototype.$G$ = function() {
  var $$jscomp$this$jscomp$50$$ = this;
  if (this.$D$) {
    return _.$dev$$module$src$log$$().error("amp-pixel", "duplicate pixel"), this.$D$;
  }
  this.$D$ = _.$Services$$module$src$services$timerFor$$(this.$win$).$promise$(1).then(function() {
    var $src$jscomp$6$$ = $$jscomp$this$jscomp$50$$.element.getAttribute("src");
    if ($src$jscomp$6$$) {
      return _.$JSCompiler_StaticMethods_expandUrlAsync$$(_.$Services$$module$src$services$urlReplacementsForDoc$$($$jscomp$this$jscomp$50$$.element), $src$jscomp$6$$).then(function($src$jscomp$6$$) {
        var $src$jscomp$7$$ = _.$createPixel$$module$src$pixel$$($$jscomp$this$jscomp$50$$.$win$, $src$jscomp$6$$, $$jscomp$this$jscomp$50$$.$F$);
        _.$dev$$module$src$log$$().$Log$$module$src$log_prototype$info$("amp-pixel", "pixel triggered: ", $src$jscomp$6$$);
        return $src$jscomp$7$$;
      });
    }
  });
};
var $CUSTOM_TEMPLATES$$module$src$service$extensions_impl$$;
_.$LEGACY_ELEMENTS$$module$src$service$extensions_impl$$ = ["amp-ad", "amp-embed", "amp-video"];
$CUSTOM_TEMPLATES$$module$src$service$extensions_impl$$ = ["amp-mustache"];
$Extensions$$module$src$service$extensions_impl$$.prototype.$G$ = function($name$jscomp$127$$, $implementationClass$jscomp$1$$, $css$$) {
  $JSCompiler_StaticMethods_getCurrentExtensionHolder_$$(this, $name$jscomp$127$$).extension.elements[$name$jscomp$127$$] = {$implementationClass$:$implementationClass$jscomp$1$$, $css$:$css$$};
  _.$JSCompiler_StaticMethods_addDocFactory$$(this, function($ampdoc$jscomp$34$$) {
    $JSCompiler_StaticMethods_installElement_$$($ampdoc$jscomp$34$$, $name$jscomp$127$$, $implementationClass$jscomp$1$$, $css$$);
  });
};
$Extensions$$module$src$service$extensions_impl$$.prototype.$I$ = function($name$jscomp$130$$, $implementationClass$jscomp$4$$) {
  $JSCompiler_StaticMethods_getCurrentExtensionHolder_$$(this).extension.services.push({$serviceName$:$name$jscomp$130$$, $serviceClass$:$implementationClass$jscomp$4$$});
  _.$JSCompiler_StaticMethods_addDocFactory$$(this, function($ampdoc$jscomp$36$$) {
    _.$registerServiceBuilderForDoc$$module$src$service$$($ampdoc$jscomp$36$$, $name$jscomp$130$$, $implementationClass$jscomp$4$$, !0);
  });
};
_.$JSCompiler_prototypeAlias$$ = $History$$module$src$service$history_impl$$.prototype;
_.$JSCompiler_prototypeAlias$$.$cleanup$ = function() {
  this.$D$.$cleanup$();
};
_.$JSCompiler_prototypeAlias$$.push = function($opt_onPop$$, $opt_stateUpdate$$) {
  var $$jscomp$this$jscomp$56$$ = this;
  return $JSCompiler_StaticMethods_enque_$$(this, function() {
    return $$jscomp$this$jscomp$56$$.$D$.push($opt_stateUpdate$$).then(function($opt_stateUpdate$$) {
      $$jscomp$this$jscomp$56$$.$History$$module$src$service$history_impl_prototype$onStateUpdated_$($opt_stateUpdate$$);
      $opt_onPop$$ && ($$jscomp$this$jscomp$56$$.$F$[$opt_stateUpdate$$.$stackIndex$] = $opt_onPop$$);
      return $opt_stateUpdate$$.$stackIndex$;
    });
  }, "push");
};
_.$JSCompiler_prototypeAlias$$.pop = function($stateId$$) {
  var $$jscomp$this$jscomp$57$$ = this;
  return $JSCompiler_StaticMethods_enque_$$(this, function() {
    return $$jscomp$this$jscomp$57$$.$D$.pop($stateId$$).then(function($stateId$$) {
      $$jscomp$this$jscomp$57$$.$History$$module$src$service$history_impl_prototype$onStateUpdated_$($stateId$$);
    });
  }, "pop");
};
_.$JSCompiler_prototypeAlias$$.replace = function($opt_stateUpdate$jscomp$1$$) {
  var $$jscomp$this$jscomp$58$$ = this;
  return $JSCompiler_StaticMethods_enque_$$(this, function() {
    return $$jscomp$this$jscomp$58$$.$D$.replace($opt_stateUpdate$jscomp$1$$);
  }, "replace");
};
_.$JSCompiler_prototypeAlias$$.get = function() {
  var $$jscomp$this$jscomp$59$$ = this;
  return $JSCompiler_StaticMethods_enque_$$(this, function() {
    return $$jscomp$this$jscomp$59$$.$D$.get();
  }, "get");
};
_.$JSCompiler_prototypeAlias$$.$History$$module$src$service$history_impl_prototype$onStateUpdated_$ = function($historyState$jscomp$3$$) {
  this.$G$ = $historyState$jscomp$3$$.$stackIndex$;
  $JSCompiler_StaticMethods_doPop_$$(this, $historyState$jscomp$3$$);
};
_.$JSCompiler_prototypeAlias$$ = _.$HistoryBindingNatural_$$module$src$service$history_impl$$.prototype;
_.$JSCompiler_prototypeAlias$$.$cleanup$ = function() {
  this.$J$ && (this.$win$.history.pushState = this.$J$);
  this.$I$ && (this.$win$.history.replaceState = this.$I$);
  this.$win$.removeEventListener("popstate", this.$K$);
};
_.$JSCompiler_prototypeAlias$$.$setOnStateUpdated$ = function($callback$jscomp$69$$) {
  this.$R$ = $callback$jscomp$69$$;
};
_.$JSCompiler_prototypeAlias$$.push = function($opt_stateUpdate$jscomp$4$$) {
  var $$jscomp$this$jscomp$64$$ = this;
  return $JSCompiler_StaticMethods_whenReady_$$(this, function() {
    var $newState$jscomp$1$$ = $JSCompiler_StaticMethods_mergeStateUpdate_$$($JSCompiler_StaticMethods_getState_$$($$jscomp$this$jscomp$64$$), $opt_stateUpdate$jscomp$4$$ || {});
    $$jscomp$this$jscomp$64$$.$historyPushState_$($newState$jscomp$1$$, void 0, $newState$jscomp$1$$.$fragment$ ? "#" + $newState$jscomp$1$$.$fragment$ : void 0);
    return _.$tryResolve$$module$src$utils$promise$$(function() {
      return $JSCompiler_StaticMethods_mergeStateUpdate_$$($newState$jscomp$1$$, {$stackIndex$:$$jscomp$this$jscomp$64$$.$D$});
    });
  });
};
_.$JSCompiler_prototypeAlias$$.pop = function($stackIndex$jscomp$1$$) {
  var $$jscomp$this$jscomp$65$$ = this;
  $stackIndex$jscomp$1$$ = Math.max($stackIndex$jscomp$1$$, this.$F$);
  return $JSCompiler_StaticMethods_whenReady_$$(this, function() {
    return $JSCompiler_StaticMethods_back_$$($$jscomp$this$jscomp$65$$, $$jscomp$this$jscomp$65$$.$D$ - $stackIndex$jscomp$1$$ + 1);
  }).then(function($stackIndex$jscomp$1$$) {
    return $JSCompiler_StaticMethods_mergeStateUpdate_$$($JSCompiler_StaticMethods_getState_$$($$jscomp$this$jscomp$65$$), {$stackIndex$:$stackIndex$jscomp$1$$});
  });
};
_.$JSCompiler_prototypeAlias$$.replace = function($opt_stateUpdate$jscomp$5$$) {
  var $$jscomp$this$jscomp$66$$ = this;
  $opt_stateUpdate$jscomp$5$$ = void 0 === $opt_stateUpdate$jscomp$5$$ ? {} : $opt_stateUpdate$jscomp$5$$;
  return $JSCompiler_StaticMethods_whenReady_$$(this, function() {
    var $newState$jscomp$2$$ = $JSCompiler_StaticMethods_mergeStateUpdate_$$($JSCompiler_StaticMethods_getState_$$($$jscomp$this$jscomp$66$$), $opt_stateUpdate$jscomp$5$$ || {});
    $$jscomp$this$jscomp$66$$.$historyReplaceState_$($newState$jscomp$2$$, void 0, $newState$jscomp$2$$.$fragment$ ? "#" + $newState$jscomp$2$$.$fragment$ : void 0);
    return _.$tryResolve$$module$src$utils$promise$$(function() {
      return $JSCompiler_StaticMethods_mergeStateUpdate_$$($newState$jscomp$2$$, {$stackIndex$:$$jscomp$this$jscomp$66$$.$D$});
    });
  });
};
_.$JSCompiler_prototypeAlias$$.get = function() {
  var $$jscomp$this$jscomp$67$$ = this;
  return _.$tryResolve$$module$src$utils$promise$$(function() {
    return $JSCompiler_StaticMethods_mergeStateUpdate_$$($JSCompiler_StaticMethods_getState_$$($$jscomp$this$jscomp$67$$), {$stackIndex$:$$jscomp$this$jscomp$67$$.$D$});
  });
};
_.$JSCompiler_prototypeAlias$$.$historyPushState_$ = function($newState$jscomp$3_state$jscomp$17$$, $title$jscomp$10$$, $url$jscomp$64$$) {
  $newState$jscomp$3_state$jscomp$17$$ || ($newState$jscomp$3_state$jscomp$17$$ = {});
  var $stackIndex$jscomp$4$$ = this.$D$ + 1;
  $newState$jscomp$3_state$jscomp$17$$["AMP.History"] = $stackIndex$jscomp$4$$;
  this.$U$($newState$jscomp$3_state$jscomp$17$$, $title$jscomp$10$$, $url$jscomp$64$$);
  $stackIndex$jscomp$4$$ != this.$win$.history.length - 1 && ($stackIndex$jscomp$4$$ = this.$win$.history.length - 1, $newState$jscomp$3_state$jscomp$17$$["AMP.History"] = $stackIndex$jscomp$4$$, this.$O$($newState$jscomp$3_state$jscomp$17$$));
  $newState$jscomp$3_state$jscomp$17$$ = $JSCompiler_StaticMethods_mergeStateUpdate_$$($newState$jscomp$3_state$jscomp$17$$, {$stackIndex$:$stackIndex$jscomp$4$$});
  $JSCompiler_StaticMethods_HistoryBindingNatural_$$module$src$service$history_impl_prototype$updateHistoryState_$$(this, $newState$jscomp$3_state$jscomp$17$$);
};
_.$JSCompiler_prototypeAlias$$.$HistoryBindingInterface$$module$src$service$history_impl_prototype$replaceStateForTarget$ = function($target$jscomp$81$$) {
  var $$jscomp$this$jscomp$70$$ = this;
  $JSCompiler_StaticMethods_whenReady_$$(this, function() {
    $$jscomp$this$jscomp$70$$.$win$.removeEventListener("popstate", $$jscomp$this$jscomp$70$$.$K$);
    try {
      $$jscomp$this$jscomp$70$$.$win$.location.replace($target$jscomp$81$$);
    } finally {
      $$jscomp$this$jscomp$70$$.$win$.addEventListener("popstate", $$jscomp$this$jscomp$70$$.$K$);
    }
    $$jscomp$this$jscomp$70$$.$historyReplaceState_$();
    return window.Promise.resolve();
  });
};
_.$JSCompiler_prototypeAlias$$.$historyReplaceState_$ = function($newState$jscomp$4_state$jscomp$18$$, $title$jscomp$11$$, $url$jscomp$65$$) {
  $newState$jscomp$4_state$jscomp$18$$ || ($newState$jscomp$4_state$jscomp$18$$ = {});
  var $stackIndex$jscomp$5$$ = Math.min(this.$D$, this.$win$.history.length - 1);
  $newState$jscomp$4_state$jscomp$18$$["AMP.History"] = $stackIndex$jscomp$5$$;
  this.$O$($newState$jscomp$4_state$jscomp$18$$, $title$jscomp$11$$, $url$jscomp$65$$);
  $newState$jscomp$4_state$jscomp$18$$ = $JSCompiler_StaticMethods_mergeStateUpdate_$$($newState$jscomp$4_state$jscomp$18$$, {$stackIndex$:$stackIndex$jscomp$5$$});
  $JSCompiler_StaticMethods_HistoryBindingNatural_$$module$src$service$history_impl_prototype$updateHistoryState_$$(this, $newState$jscomp$4_state$jscomp$18$$);
};
_.$JSCompiler_prototypeAlias$$.$HistoryBindingInterface$$module$src$service$history_impl_prototype$getFragment$ = _.$JSCompiler_stubMethod$$(30);
_.$JSCompiler_prototypeAlias$$.$HistoryBindingInterface$$module$src$service$history_impl_prototype$updateFragment$ = _.$JSCompiler_stubMethod$$(32);
_.$JSCompiler_prototypeAlias$$ = _.$HistoryBindingVirtual_$$module$src$service$history_impl$$.prototype;
_.$JSCompiler_prototypeAlias$$.$HistoryBindingInterface$$module$src$service$history_impl_prototype$replaceStateForTarget$ = function($target$jscomp$82$$) {
  this.$win$.location.replace($target$jscomp$82$$);
};
_.$JSCompiler_prototypeAlias$$.$cleanup$ = function() {
  this.$G$();
};
_.$JSCompiler_prototypeAlias$$.$setOnStateUpdated$ = function($callback$jscomp$71$$) {
  this.$F$ = $callback$jscomp$71$$;
};
_.$JSCompiler_prototypeAlias$$.push = function($opt_stateUpdate$jscomp$6$$) {
  var $$jscomp$this$jscomp$72$$ = this, $message$jscomp$37$$ = Object.assign({stackIndex:this.$D$ + 1}, $opt_stateUpdate$jscomp$6$$ || {});
  return _.$JSCompiler_StaticMethods_sendMessageAwaitResponse$$(this.$viewer_$, "pushHistory", $message$jscomp$37$$).then(function($opt_stateUpdate$jscomp$6$$) {
    $opt_stateUpdate$jscomp$6$$ = $opt_stateUpdate$jscomp$6$$ || $message$jscomp$37$$;
    $JSCompiler_StaticMethods_HistoryBindingVirtual_$$module$src$service$history_impl_prototype$updateHistoryState_$$($$jscomp$this$jscomp$72$$, $opt_stateUpdate$jscomp$6$$);
    return $opt_stateUpdate$jscomp$6$$;
  });
};
_.$JSCompiler_prototypeAlias$$.pop = function($stackIndex$jscomp$6$$) {
  var $$jscomp$this$jscomp$73$$ = this;
  return $stackIndex$jscomp$6$$ > this.$D$ ? this.get() : _.$JSCompiler_StaticMethods_sendMessageAwaitResponse$$(this.$viewer_$, "popHistory", _.$dict$$module$src$utils$object$$({stackIndex:this.$D$})).then(function($stackIndex$jscomp$6$$) {
    $stackIndex$jscomp$6$$ = $stackIndex$jscomp$6$$ || _.$dict$$module$src$utils$object$$({stackIndex:$$jscomp$this$jscomp$73$$.$D$ - 1});
    $JSCompiler_StaticMethods_HistoryBindingVirtual_$$module$src$service$history_impl_prototype$updateHistoryState_$$($$jscomp$this$jscomp$73$$, $stackIndex$jscomp$6$$);
    return $stackIndex$jscomp$6$$;
  });
};
_.$JSCompiler_prototypeAlias$$.replace = function($opt_stateUpdate$jscomp$7$$) {
  var $$jscomp$this$jscomp$74$$ = this, $message$jscomp$39$$ = Object.assign({stackIndex:this.$D$}, $opt_stateUpdate$jscomp$7$$ || {});
  return _.$JSCompiler_StaticMethods_sendMessageAwaitResponse$$(this.$viewer_$, "replaceHistory", $message$jscomp$39$$, !0).then(function($opt_stateUpdate$jscomp$7$$) {
    $opt_stateUpdate$jscomp$7$$ = $opt_stateUpdate$jscomp$7$$ || $message$jscomp$39$$;
    $JSCompiler_StaticMethods_HistoryBindingVirtual_$$module$src$service$history_impl_prototype$updateHistoryState_$$($$jscomp$this$jscomp$74$$, $opt_stateUpdate$jscomp$7$$);
    return $opt_stateUpdate$jscomp$7$$;
  });
};
_.$JSCompiler_prototypeAlias$$.get = function() {
  return window.Promise.resolve({data:void 0, $fragment$:"", $stackIndex$:this.$D$, title:""});
};
_.$JSCompiler_prototypeAlias$$.$HistoryBindingInterface$$module$src$service$history_impl_prototype$getFragment$ = _.$JSCompiler_stubMethod$$(29);
_.$JSCompiler_prototypeAlias$$.$HistoryBindingInterface$$module$src$service$history_impl_prototype$updateFragment$ = _.$JSCompiler_stubMethod$$(31);
$Navigation$$module$src$service$navigation$$.$installInEmbedWindow$ = function($embedWin$jscomp$4$$, $ampdoc$jscomp$48$$) {
  _.$installServiceInEmbedScope$$module$src$service$$($embedWin$jscomp$4$$, "navigation", new $Navigation$$module$src$service$navigation$$($ampdoc$jscomp$48$$, $embedWin$jscomp$4$$.document));
};
$Navigation$$module$src$service$navigation$$.prototype.$cleanup$ = function() {
  this.$F$ && (this.$D$.removeEventListener("click", this.$F$), this.$D$.removeEventListener("contextmenu", this.$F$));
};
$Navigation$$module$src$service$navigation$$.prototype.$R$ = function($e$jscomp$66$$) {
  if (!$e$jscomp$66$$.defaultPrevented) {
    var $target$jscomp$85$$ = _.$closestByTag$$module$src$dom$$($e$jscomp$66$$.target, "A");
    if ($target$jscomp$85$$ && $target$jscomp$85$$.href) {
      if ("click" == $e$jscomp$66$$.type) {
        $JSCompiler_StaticMethods_expandVarsForAnchor_$$(this, $target$jscomp$85$$);
        var $isNormalProtocol$jscomp$inline_5745_location$jscomp$inline_1444_protocol$jscomp$inline_5744$$ = $JSCompiler_StaticMethods_parseUrl_$$(this, $target$jscomp$85$$.href), $JSCompiler_inline_result$jscomp$5590_JSCompiler_temp$jscomp$5589_win$jscomp$inline_5742$$;
        if ($JSCompiler_inline_result$jscomp$5590_JSCompiler_temp$jscomp$5589_win$jscomp$inline_5742$$ = !$JSCompiler_StaticMethods_handleA2AClick_$$(this, $e$jscomp$66$$, $target$jscomp$85$$, $isNormalProtocol$jscomp$inline_5745_location$jscomp$inline_1444_protocol$jscomp$inline_5744$$)) {
          if (this.$P$) {
            $JSCompiler_inline_result$jscomp$5590_JSCompiler_temp$jscomp$5589_win$jscomp$inline_5742$$ = $target$jscomp$85$$.ownerDocument.defaultView;
            var $url$jscomp$inline_5743$$ = $target$jscomp$85$$.href;
            $isNormalProtocol$jscomp$inline_5745_location$jscomp$inline_1444_protocol$jscomp$inline_5744$$ = $isNormalProtocol$jscomp$inline_5745_location$jscomp$inline_1444_protocol$jscomp$inline_5744$$.protocol;
            "ftp:" == $isNormalProtocol$jscomp$inline_5745_location$jscomp$inline_1444_protocol$jscomp$inline_5744$$ ? (_.$openWindowDialog$$module$src$dom$$($JSCompiler_inline_result$jscomp$5590_JSCompiler_temp$jscomp$5589_win$jscomp$inline_5742$$, $url$jscomp$inline_5743$$, "_blank"), $e$jscomp$66$$.preventDefault(), $JSCompiler_inline_result$jscomp$5590_JSCompiler_temp$jscomp$5589_win$jscomp$inline_5742$$ = !0) : ($isNormalProtocol$jscomp$inline_5745_location$jscomp$inline_1444_protocol$jscomp$inline_5744$$ = 
            /^(https?|mailto):$/.test($isNormalProtocol$jscomp$inline_5745_location$jscomp$inline_1444_protocol$jscomp$inline_5744$$), this.$V$ && !$isNormalProtocol$jscomp$inline_5745_location$jscomp$inline_1444_protocol$jscomp$inline_5744$$ ? (_.$openWindowDialog$$module$src$dom$$($JSCompiler_inline_result$jscomp$5590_JSCompiler_temp$jscomp$5589_win$jscomp$inline_5742$$, $url$jscomp$inline_5743$$, "_top"), $e$jscomp$66$$.preventDefault(), $JSCompiler_inline_result$jscomp$5590_JSCompiler_temp$jscomp$5589_win$jscomp$inline_5742$$ = 
            !0) : $JSCompiler_inline_result$jscomp$5590_JSCompiler_temp$jscomp$5589_win$jscomp$inline_5742$$ = !1);
          } else {
            $JSCompiler_inline_result$jscomp$5590_JSCompiler_temp$jscomp$5589_win$jscomp$inline_5742$$ = !1;
          }
          $JSCompiler_inline_result$jscomp$5590_JSCompiler_temp$jscomp$5589_win$jscomp$inline_5742$$ = !$JSCompiler_inline_result$jscomp$5590_JSCompiler_temp$jscomp$5589_win$jscomp$inline_5742$$;
        }
        $JSCompiler_inline_result$jscomp$5590_JSCompiler_temp$jscomp$5589_win$jscomp$inline_5742$$ && ($JSCompiler_StaticMethods_anchorMutatorHandlers_$$(this, $target$jscomp$85$$, $e$jscomp$66$$), $isNormalProtocol$jscomp$inline_5745_location$jscomp$inline_1444_protocol$jscomp$inline_5744$$ = $JSCompiler_StaticMethods_parseUrl_$$(this, $target$jscomp$85$$.href), $JSCompiler_StaticMethods_handleNavClick_$$(this, $e$jscomp$66$$, $target$jscomp$85$$, $isNormalProtocol$jscomp$inline_5745_location$jscomp$inline_1444_protocol$jscomp$inline_5744$$));
      } else {
        "contextmenu" == $e$jscomp$66$$.type && ($JSCompiler_StaticMethods_expandVarsForAnchor_$$(this, $target$jscomp$85$$), $JSCompiler_StaticMethods_anchorMutatorHandlers_$$(this, $target$jscomp$85$$, $e$jscomp$66$$));
      }
    }
  }
};
_.$FiniteStateMachine$$module$src$finite_state_machine$$.prototype.setState = function($callback$jscomp$74_newState$jscomp$9$$) {
  var $oldState$jscomp$1$$ = this.$state_$;
  this.$state_$ = $callback$jscomp$74_newState$jscomp$9$$;
  ($callback$jscomp$74_newState$jscomp$9$$ = this.$D$[$oldState$jscomp$1$$ + "|" + $callback$jscomp$74_newState$jscomp$9$$]) && $callback$jscomp$74_newState$jscomp$9$$();
};
var $VisibilityState$$module$src$visibility_state$$ = {$PRERENDER$:"prerender", $VISIBLE$:"visible", $HIDDEN$:"hidden", $PAUSED$:"paused", $INACTIVE$:"inactive"};
$TaskQueue$$module$src$service$task_queue$$.prototype.$getSize$ = function() {
  return this.$D$.length;
};
$TaskQueue$$module$src$service$task_queue$$.prototype.forEach = function($callback$jscomp$75$$) {
  this.$D$.forEach($callback$jscomp$75$$);
};
_.$JSCompiler_prototypeAlias$$ = _.$Resources$$module$src$service$resources_impl$$.prototype;
_.$JSCompiler_prototypeAlias$$.get = function() {
  return this.$D$.slice(0);
};
_.$JSCompiler_prototypeAlias$$.$renderStarted$ = function() {
  _.$JSCompiler_StaticMethods_signal$$(this.ampdoc.signals(), "render-start");
};
_.$JSCompiler_prototypeAlias$$.$getDpr$ = _.$JSCompiler_stubMethod$$(7);
_.$JSCompiler_prototypeAlias$$.$getViewport$ = function() {
  return this.$viewport_$;
};
_.$JSCompiler_prototypeAlias$$.add = function($element$jscomp$125$$) {
  this.$ma$++;
  1 == this.$ma$ && this.$viewport_$.$D$.$ViewportBindingDef$$module$src$service$viewport$viewport_binding_def_prototype$ensureReadyForElements$();
  var $resource$jscomp$2$$ = _.$Resource$$module$src$service$resource$forElementOptional$$($element$jscomp$125$$);
  $resource$jscomp$2$$ && 0 != $resource$jscomp$2$$.$state_$ && !$element$jscomp$125$$.$reconstructWhenReparented$() ? $resource$jscomp$2$$.$I$ = !0 : $resource$jscomp$2$$ = new _.$Resource$$module$src$service$resource$$(++this.$xa$, $element$jscomp$125$$, this);
  "Resources";
  this.$D$.push($resource$jscomp$2$$);
  _.$JSCompiler_StaticMethods_schedule$$(this.$qa$, 1000);
};
_.$JSCompiler_prototypeAlias$$.remove = function($element$jscomp$126_resource$jscomp$6$$) {
  ($element$jscomp$126_resource$jscomp$6$$ = _.$Resource$$module$src$service$resource$forElementOptional$$($element$jscomp$126_resource$jscomp$6$$)) && _.$JSCompiler_StaticMethods_removeResource_$$(this, $element$jscomp$126_resource$jscomp$6$$);
};
_.$JSCompiler_prototypeAlias$$.$scheduleLayout$ = function($parentElement$$, $subElements$$) {
  _.$JSCompiler_StaticMethods_scheduleLayoutOrPreloadForSubresources_$$(this, _.$Resource$$module$src$service$resource$forElementOptional$$($parentElement$$), !0, _.$elements_$$module$src$service$resources_impl$$($subElements$$));
};
_.$JSCompiler_prototypeAlias$$.$schedulePause$ = _.$JSCompiler_stubMethod$$(11);
_.$JSCompiler_prototypeAlias$$.$scheduleResume$ = _.$JSCompiler_stubMethod$$(13);
_.$JSCompiler_prototypeAlias$$.$scheduleUnlayout$ = _.$JSCompiler_stubMethod$$(17);
_.$JSCompiler_prototypeAlias$$.$schedulePreload$ = _.$JSCompiler_stubMethod$$(15);
_.$JSCompiler_prototypeAlias$$.$updateLayoutPriority$ = _.$JSCompiler_stubMethod$$(0);
_.$JSCompiler_prototypeAlias$$.$updateInViewport$ = _.$JSCompiler_stubMethod$$(19);
_.$JSCompiler_prototypeAlias$$.$changeSize$ = function($element$jscomp$131$$, $newHeight$jscomp$5$$, $newWidth$jscomp$3$$) {
  _.$JSCompiler_StaticMethods_scheduleChangeSize_$$(this, _.$Resource$$module$src$service$resource$forElementOptional$$($element$jscomp$131$$), $newHeight$jscomp$5$$, $newWidth$jscomp$3$$, void 0, !0, void 0);
};
_.$JSCompiler_prototypeAlias$$.$attemptChangeSize$ = _.$JSCompiler_stubMethod$$(23);
_.$JSCompiler_prototypeAlias$$.$measureElement$ = _.$JSCompiler_stubMethod$$(25);
_.$JSCompiler_prototypeAlias$$.$mutateElement$ = function($element$jscomp$133$$, $mutator$jscomp$3$$) {
  return this.$measureMutateElement$($element$jscomp$133$$, null, $mutator$jscomp$3$$);
};
_.$JSCompiler_prototypeAlias$$.$measureMutateElement$ = function($element$jscomp$134$$, $measurer$jscomp$3$$, $mutator$jscomp$4$$) {
  return this.$useLayers_$ ? $JSCompiler_StaticMethods_measureMutateElementLayers_$$(this, $element$jscomp$134$$, $measurer$jscomp$3$$, $mutator$jscomp$4$$) : $JSCompiler_StaticMethods_measureMutateElementResources_$$(this, $element$jscomp$134$$, $measurer$jscomp$3$$, $mutator$jscomp$4$$);
};
_.$JSCompiler_prototypeAlias$$.$attemptCollapse$ = _.$JSCompiler_stubMethod$$(21);
_.$JSCompiler_prototypeAlias$$.$calcTaskScore_$ = function($task$jscomp$8$$) {
  var $posPriority_viewport$jscomp$5$$ = _.$JSCompiler_StaticMethods_getRect$$(this.$viewport_$), $box$jscomp$11$$ = $task$jscomp$8$$.$resource$.$getLayoutBox$();
  $posPriority_viewport$jscomp$5$$ = Math.floor(($box$jscomp$11$$.top - $posPriority_viewport$jscomp$5$$.top) / $posPriority_viewport$jscomp$5$$.height);
  Math.sign($posPriority_viewport$jscomp$5$$) != (Math.sign(this.$aa$) || 1) && ($posPriority_viewport$jscomp$5$$ *= 2);
  $posPriority_viewport$jscomp$5$$ = Math.abs($posPriority_viewport$jscomp$5$$);
  return 10 * $task$jscomp$8$$.$priority$ + $posPriority_viewport$jscomp$5$$;
};
_.$JSCompiler_prototypeAlias$$.$calcTaskScoreLayers_$ = function($task$jscomp$9$$, $cache$jscomp$1_layerScore$$) {
  $cache$jscomp$1_layerScore$$ = this.$ia$.$iterateAncestry$($task$jscomp$9$$.$resource$.element, this.$sa$, $cache$jscomp$1_layerScore$$);
  return 10 * $task$jscomp$9$$.$priority$ + $cache$jscomp$1_layerScore$$;
};
_.$JSCompiler_prototypeAlias$$.$calcLayoutScore_$ = function($currentScore$jscomp$1_score$jscomp$1$$, $distance$jscomp$3_layout$jscomp$7$$, $depth$jscomp$4_depthPenalty$jscomp$1$$, $cache$jscomp$2$$) {
  var $id$jscomp$34$$ = $distance$jscomp$3_layout$jscomp$7$$.$U$;
  if (_.$hasOwn$$module$src$utils$object$$($cache$jscomp$2$$, $id$jscomp$34$$)) {
    return $cache$jscomp$2$$[$id$jscomp$34$$];
  }
  $currentScore$jscomp$1_score$jscomp$1$$ = $currentScore$jscomp$1_score$jscomp$1$$ || 0;
  $depth$jscomp$4_depthPenalty$jscomp$1$$ = 1 + $depth$jscomp$4_depthPenalty$jscomp$1$$ / 10;
  var $nonActivePenalty$jscomp$1$$ = $distance$jscomp$3_layout$jscomp$7$$.$isActive_$ ? 1 : 2;
  $distance$jscomp$3_layout$jscomp$7$$ = $JSCompiler_StaticMethods_getHorizontalDistanceFromParent$$($distance$jscomp$3_layout$jscomp$7$$) + $JSCompiler_StaticMethods_getVerticalDistanceFromParent$$($distance$jscomp$3_layout$jscomp$7$$);
  return $cache$jscomp$2$$[$id$jscomp$34$$] = $currentScore$jscomp$1_score$jscomp$1$$ + $nonActivePenalty$jscomp$1$$ * $depth$jscomp$4_depthPenalty$jscomp$1$$ * $distance$jscomp$3_layout$jscomp$7$$;
};
_.$JSCompiler_prototypeAlias$$.$reschedule_$ = function($task$jscomp$11$$) {
  this.$F$.$F$[$task$jscomp$11$$.id] || $JSCompiler_StaticMethods_TaskQueue$$module$src$service$task_queue_prototype$enqueue$$(this.$F$, $task$jscomp$11$$);
};
_.$JSCompiler_prototypeAlias$$.$taskComplete_$ = function($task$jscomp$12$$, $success$jscomp$3$$, $opt_reason$jscomp$2$$) {
  $JSCompiler_StaticMethods_TaskQueue$$module$src$service$task_queue_prototype$dequeue$$(this.$I$, $task$jscomp$12$$);
  _.$JSCompiler_StaticMethods_schedulePass$$(this, 1000);
  if (!$success$jscomp$3$$) {
    return _.$dev$$module$src$log$$().$Log$$module$src$log_prototype$info$("Resources", "task failed:", $task$jscomp$12$$.id, $task$jscomp$12$$.$resource$.$R$, $opt_reason$jscomp$2$$), window.Promise.reject($opt_reason$jscomp$2$$);
  }
};
var $PERMITTED_POSITIONS$$module$src$service$standard_actions_impl$$ = ["top", "bottom", "center"];
$StandardActions$$module$src$service$standard_actions_impl$$.$installInEmbedWindow$ = function($embedWin$jscomp$5$$, $ampdoc$jscomp$53$$) {
  _.$installServiceInEmbedScope$$module$src$service$$($embedWin$jscomp$5$$, "standard-actions", new $StandardActions$$module$src$service$standard_actions_impl$$($ampdoc$jscomp$53$$, $embedWin$jscomp$5$$));
};
_.$JSCompiler_prototypeAlias$$ = $StandardActions$$module$src$service$standard_actions_impl$$.prototype;
_.$JSCompiler_prototypeAlias$$.$handleAmpTarget$ = function($invocation$jscomp$9$$) {
  if (!_.$JSCompiler_StaticMethods_satisfiesTrust$$($invocation$jscomp$9$$, 100)) {
    return null;
  }
  var $node$jscomp$38$$ = $invocation$jscomp$9$$.node, $method$jscomp$13$$ = $invocation$jscomp$9$$.method, $args$jscomp$10$$ = $invocation$jscomp$9$$.args, $win$jscomp$172$$ = ($node$jscomp$38$$.ownerDocument || $node$jscomp$38$$).defaultView;
  switch($method$jscomp$13$$) {
    case "pushState":
    case "setState":
      return _.$getElementServiceIfAvailableForDocInEmbedScope$$module$src$element_service$$($node$jscomp$38$$.nodeType === window.Node.DOCUMENT_NODE ? $node$jscomp$38$$.documentElement : $node$jscomp$38$$).then(function($node$jscomp$38$$) {
        return $node$jscomp$38$$.$invoke$($invocation$jscomp$9$$);
      });
    case "navigateTo":
      return $JSCompiler_StaticMethods_handleNavigateTo$$(this, $invocation$jscomp$9$$);
    case "closeOrNavigateTo":
      return $JSCompiler_StaticMethods_handleCloseOrNavigateTo$$(this, $invocation$jscomp$9$$);
    case "scrollTo":
      return $invocation$jscomp$9$$.node = _.$getAmpdoc$$module$src$service$$($node$jscomp$38$$).getElementById($args$jscomp$10$$.id), this.$handleScrollTo$($invocation$jscomp$9$$);
    case "goBack":
      return _.$JSCompiler_StaticMethods_goBack$$(_.$Services$$module$src$services$historyForDoc$$(this.ampdoc)), null;
    case "print":
      return $win$jscomp$172$$.print(), null;
    case "optoutOfCid":
      return _.$Services$$module$src$services$cidForDoc$$(this.ampdoc).then(function($invocation$jscomp$9$$) {
        return _.$optOutOfCid$$module$src$service$cid_impl$$($invocation$jscomp$9$$.ampdoc);
      }).catch(function($invocation$jscomp$9$$) {
        _.$dev$$module$src$log$$().error("STANDARD-ACTIONS", "Failed to opt out of CID", $invocation$jscomp$9$$);
      });
  }
  throw _.$user$$module$src$log$$().$createError$("Unknown AMP action ", $method$jscomp$13$$);
};
_.$JSCompiler_prototypeAlias$$.$handleScrollTo$ = function($invocation$jscomp$12_pos$jscomp$3$$) {
  if (!_.$JSCompiler_StaticMethods_satisfiesTrust$$($invocation$jscomp$12_pos$jscomp$3$$, 100)) {
    return null;
  }
  var $node$jscomp$41$$ = $invocation$jscomp$12_pos$jscomp$3$$.node, $duration$jscomp$1$$ = $invocation$jscomp$12_pos$jscomp$3$$.args && $invocation$jscomp$12_pos$jscomp$3$$.args.duration && 0 <= $invocation$jscomp$12_pos$jscomp$3$$.args.duration ? $invocation$jscomp$12_pos$jscomp$3$$.args.duration : 500;
  $invocation$jscomp$12_pos$jscomp$3$$ = $invocation$jscomp$12_pos$jscomp$3$$.args && $invocation$jscomp$12_pos$jscomp$3$$.args.position && $PERMITTED_POSITIONS$$module$src$service$standard_actions_impl$$.includes($invocation$jscomp$12_pos$jscomp$3$$.args.position) ? $invocation$jscomp$12_pos$jscomp$3$$.args.position : "top";
  return _.$JSCompiler_StaticMethods_animateScrollIntoView$$(this.$viewport_$, $node$jscomp$41$$, $duration$jscomp$1$$, "ease-in", $invocation$jscomp$12_pos$jscomp$3$$);
};
_.$JSCompiler_prototypeAlias$$.$handleFocus$ = function($invocation$jscomp$13$$) {
  if (!_.$JSCompiler_StaticMethods_satisfiesTrust$$($invocation$jscomp$13$$, 100)) {
    return null;
  }
  _.$tryFocus$$module$src$dom$$($invocation$jscomp$13$$.node);
  return null;
};
_.$JSCompiler_prototypeAlias$$.$handleHide$ = function($invocation$jscomp$14$$) {
  var $target$jscomp$93$$ = $invocation$jscomp$14$$.node;
  this.$D$.$mutateElement$($target$jscomp$93$$, function() {
    $target$jscomp$93$$.classList.contains("i-amphtml-element") ? $target$jscomp$93$$.collapse() : _.$toggle$$module$src$style$$($target$jscomp$93$$, !1);
  });
  return null;
};
_.$JSCompiler_prototypeAlias$$.$handleShow$ = function($invocation$jscomp$15$$) {
  var $target$jscomp$94$$ = $invocation$jscomp$15$$.node, $ownerWindow$$ = $target$jscomp$94$$.ownerDocument.defaultView;
  if ($target$jscomp$94$$.classList.contains("i-amphtml-layout-nodisplay")) {
    return _.$user$$module$src$log$$().$Log$$module$src$log_prototype$warn$("STANDARD-ACTIONS", "Elements with layout=nodisplay cannot be dynamically shown.", $target$jscomp$94$$), null;
  }
  _.$Services$$module$src$services$vsyncFor$$($ownerWindow$$).measure(function() {
    "none" != _.$computedStyle$$module$src$style$$($ownerWindow$$, $target$jscomp$94$$).display || $target$jscomp$94$$.hasAttribute("hidden") || _.$user$$module$src$log$$().$Log$$module$src$log_prototype$warn$("STANDARD-ACTIONS", 'Elements can only be dynamically shown when they have the "hidden" attribute set or when they were dynamically hidden.', $target$jscomp$94$$);
  });
  this.$D$.$mutateElement$($target$jscomp$94$$, function() {
    $target$jscomp$94$$.classList.contains("i-amphtml-element") ? $target$jscomp$94$$.expand() : _.$toggle$$module$src$style$$($target$jscomp$94$$, !0);
  });
  return null;
};
_.$JSCompiler_prototypeAlias$$.$handleToggle$ = function($invocation$jscomp$16$$) {
  return $invocation$jscomp$16$$.node.hasAttribute("hidden") ? this.$handleShow$($invocation$jscomp$16$$) : this.$handleHide$($invocation$jscomp$16$$);
};
_.$JSCompiler_prototypeAlias$$.$handleToggleClass$ = function($invocation$jscomp$17$$) {
  if (!_.$JSCompiler_StaticMethods_satisfiesTrust$$($invocation$jscomp$17$$, 100)) {
    return null;
  }
  var $target$jscomp$95$$ = $invocation$jscomp$17$$.node, $args$jscomp$12$$ = $invocation$jscomp$17$$.args, $className$jscomp$1$$ = _.$JSCompiler_StaticMethods_assertString$$(_.$user$$module$src$log$$(), $args$jscomp$12$$["class"], "Argument 'class' must be a string.");
  this.$D$.$mutateElement$($target$jscomp$95$$, function() {
    if (void 0 !== $args$jscomp$12$$.force) {
      var $invocation$jscomp$17$$ = _.$JSCompiler_StaticMethods_assertBoolean$$(_.$user$$module$src$log$$(), $args$jscomp$12$$.force, "Optional argument 'force' must be a boolean.");
      $target$jscomp$95$$.classList.toggle($className$jscomp$1$$, $invocation$jscomp$17$$);
    } else {
      $target$jscomp$95$$.classList.toggle($className$jscomp$1$$);
    }
  });
  return null;
};
$Storage$$module$src$service$storage_impl$$.prototype.get = function($name$jscomp$133$$) {
  return $JSCompiler_StaticMethods_getStore_$$(this).then(function($store$$) {
    return $store$$.get($name$jscomp$133$$);
  });
};
$Storage$$module$src$service$storage_impl$$.prototype.set = function($name$jscomp$134$$, $value$jscomp$131$$, $opt_isUpdate$$) {
  return _.$JSCompiler_StaticMethods_setNonBoolean$$(this, $name$jscomp$134$$, $value$jscomp$131$$, $opt_isUpdate$$);
};
$Storage$$module$src$service$storage_impl$$.prototype.remove = function($name$jscomp$136$$) {
  return $JSCompiler_StaticMethods_saveStore_$$(this, function($store$jscomp$2$$) {
    return $store$jscomp$2$$.remove($name$jscomp$136$$);
  });
};
$Storage$$module$src$service$storage_impl$$.prototype.$G$ = function() {
  "Storage";
  _.$JSCompiler_StaticMethods_broadcast$$(this.$viewer_$, {type:"amp-storage-reset", origin:this.$origin_$});
};
$Store$$module$src$service$storage_impl$$.prototype.get = function($item$jscomp$5_name$jscomp$137$$) {
  return ($item$jscomp$5_name$jscomp$137$$ = this.$D$[$item$jscomp$5_name$jscomp$137$$]) ? $item$jscomp$5_name$jscomp$137$$.v : void 0;
};
$Store$$module$src$service$storage_impl$$.prototype.set = function($item$jscomp$6_minKey_name$jscomp$138$$, $keys$jscomp$1_value$jscomp$133$$, $minTime_opt_isUpdate$jscomp$2$$) {
  if (void 0 !== this.$D$[$item$jscomp$6_minKey_name$jscomp$138$$]) {
    $item$jscomp$6_minKey_name$jscomp$138$$ = this.$D$[$item$jscomp$6_minKey_name$jscomp$138$$];
    var $i$jscomp$98_timestamp$jscomp$1$$ = Date.now();
    $minTime_opt_isUpdate$jscomp$2$$ && ($i$jscomp$98_timestamp$jscomp$1$$ = $item$jscomp$6_minKey_name$jscomp$138$$.t);
    $item$jscomp$6_minKey_name$jscomp$138$$.v = $keys$jscomp$1_value$jscomp$133$$;
    $item$jscomp$6_minKey_name$jscomp$138$$.t = $i$jscomp$98_timestamp$jscomp$1$$;
  } else {
    this.$D$[$item$jscomp$6_minKey_name$jscomp$138$$] = _.$dict$$module$src$utils$object$$({v:$keys$jscomp$1_value$jscomp$133$$, t:Date.now()});
  }
  $keys$jscomp$1_value$jscomp$133$$ = Object.keys(this.$D$);
  if (8 < $keys$jscomp$1_value$jscomp$133$$.length) {
    $minTime_opt_isUpdate$jscomp$2$$ = window.Infinity;
    $item$jscomp$6_minKey_name$jscomp$138$$ = null;
    for ($i$jscomp$98_timestamp$jscomp$1$$ = 0; $i$jscomp$98_timestamp$jscomp$1$$ < $keys$jscomp$1_value$jscomp$133$$.length; $i$jscomp$98_timestamp$jscomp$1$$++) {
      var $item$160$$ = this.$D$[$keys$jscomp$1_value$jscomp$133$$[$i$jscomp$98_timestamp$jscomp$1$$]];
      $item$160$$.t < $minTime_opt_isUpdate$jscomp$2$$ && ($item$jscomp$6_minKey_name$jscomp$138$$ = $keys$jscomp$1_value$jscomp$133$$[$i$jscomp$98_timestamp$jscomp$1$$], $minTime_opt_isUpdate$jscomp$2$$ = $item$160$$.t);
    }
    $item$jscomp$6_minKey_name$jscomp$138$$ && delete this.$D$[$item$jscomp$6_minKey_name$jscomp$138$$];
  }
};
$Store$$module$src$service$storage_impl$$.prototype.remove = function($name$jscomp$139$$) {
  delete this.$D$[$name$jscomp$139$$];
};
$LocalStorageBinding$$module$src$service$storage_impl$$.prototype.$F$ = function($origin$jscomp$9$$) {
  var $$jscomp$this$jscomp$103$$ = this;
  return new window.Promise(function($resolve$jscomp$31$$) {
    $$jscomp$this$jscomp$103$$.$D$ ? $resolve$jscomp$31$$($$jscomp$this$jscomp$103$$.$win$.localStorage.getItem("amp-store:" + $origin$jscomp$9$$)) : $resolve$jscomp$31$$(null);
  });
};
$LocalStorageBinding$$module$src$service$storage_impl$$.prototype.$G$ = function($origin$jscomp$10$$, $blob$jscomp$9$$) {
  var $$jscomp$this$jscomp$104$$ = this;
  return new window.Promise(function($resolve$jscomp$32$$) {
    $$jscomp$this$jscomp$104$$.$D$ && $$jscomp$this$jscomp$104$$.$win$.localStorage.setItem("amp-store:" + $origin$jscomp$10$$, $blob$jscomp$9$$);
    $resolve$jscomp$32$$();
  });
};
$ViewerStorageBinding$$module$src$service$storage_impl$$.prototype.$F$ = function($origin$jscomp$11$$) {
  return _.$JSCompiler_StaticMethods_sendMessageAwaitResponse$$(this.$viewer_$, "loadStore", _.$dict$$module$src$utils$object$$({origin:$origin$jscomp$11$$})).then(function($origin$jscomp$11$$) {
    return $origin$jscomp$11$$.blob;
  });
};
$ViewerStorageBinding$$module$src$service$storage_impl$$.prototype.$G$ = function($origin$jscomp$12$$, $blob$jscomp$10$$) {
  return _.$JSCompiler_StaticMethods_sendMessageAwaitResponse$$(this.$viewer_$, "saveStore", _.$dict$$module$src$utils$object$$({origin:$origin$jscomp$12$$, blob:$blob$jscomp$10$$}));
};
_.$BaseTemplate$$module$src$service$template_impl$$.prototype.$F$ = function() {
};
_.$BaseTemplate$$module$src$service$template_impl$$.prototype.$D$ = _.$JSCompiler_stubMethod$$(33);
_.$BaseTemplate$$module$src$service$template_impl$$.prototype.render = function() {
  throw Error("Not implemented");
};
$Timer$$module$src$service$timer_impl$$.prototype.delay = function($callback$jscomp$81$$, $opt_delay$jscomp$4$$) {
  var $$jscomp$this$jscomp$109$$ = this;
  if (!$opt_delay$jscomp$4$$) {
    var $id$jscomp$35$$ = "p" + this.$I$++;
    this.$G$.then(function() {
      $$jscomp$this$jscomp$109$$.$D$[$id$jscomp$35$$] ? delete $$jscomp$this$jscomp$109$$.$D$[$id$jscomp$35$$] : $callback$jscomp$81$$();
    }).catch(_.$reportError$$module$src$error$$);
    return $id$jscomp$35$$;
  }
  return this.$win$.setTimeout(function() {
    try {
      $callback$jscomp$81$$();
    } catch ($e$jscomp$79$$) {
      throw _.$reportError$$module$src$error$$($e$jscomp$79$$), $e$jscomp$79$$;
    }
  }, $opt_delay$jscomp$4$$);
};
$Timer$$module$src$service$timer_impl$$.prototype.cancel = function($timeoutId$$) {
  "string" == typeof $timeoutId$$ ? this.$D$[$timeoutId$$] = !0 : this.$win$.clearTimeout($timeoutId$$);
};
$Timer$$module$src$service$timer_impl$$.prototype.$promise$ = function($opt_delay$jscomp$5$$) {
  var $$jscomp$this$jscomp$110$$ = this;
  return new this.$win$.Promise(function($resolve$jscomp$34$$) {
    if (-1 == $$jscomp$this$jscomp$110$$.delay($resolve$jscomp$34$$, $opt_delay$jscomp$5$$)) {
      throw Error("Failed to schedule timer.");
    }
  });
};
$Timer$$module$src$service$timer_impl$$.$installInEmbedWindow$ = function($embedWin$jscomp$6$$) {
  _.$installServiceInEmbedScope$$module$src$service$$($embedWin$jscomp$6$$, "timer", new $Timer$$module$src$service$timer_impl$$($embedWin$jscomp$6$$));
};
$Url$$module$src$service$url_impl$$.$installInEmbedWindow$ = function($embedWin$jscomp$7$$, $ampdoc$jscomp$58$$) {
  _.$installServiceInEmbedScope$$module$src$service$$($embedWin$jscomp$7$$, "url", new $Url$$module$src$service$url_impl$$($ampdoc$jscomp$58$$, $embedWin$jscomp$7$$.document));
};
$Url$$module$src$service$url_impl$$.prototype.parse = function($url$jscomp$71$$, $opt_nocache$jscomp$1$$) {
  return $parseUrlWithA$$module$src$url$$(this.$F$, $url$jscomp$71$$, $opt_nocache$jscomp$1$$ ? null : this.$D$);
};
var $NOENCODE_WHITELIST$$module$src$service$url_expander$expander$$ = {ANCESTOR_ORIGIN:!0};
_.$Expander$$module$src$service$url_expander$expander$$.prototype.expand = function($url$jscomp$76$$) {
  if (!$url$jscomp$76$$.length) {
    return this.$D$ ? $url$jscomp$76$$ : window.Promise.resolve($url$jscomp$76$$);
  }
  var $expr$jscomp$6_matches$jscomp$4$$ = _.$JSCompiler_StaticMethods_getExpr$$(this.$G$, this.$F$, this.$I$);
  $expr$jscomp$6_matches$jscomp$4$$ = $JSCompiler_StaticMethods_findMatches_$$($url$jscomp$76$$, $expr$jscomp$6_matches$jscomp$4$$);
  return $expr$jscomp$6_matches$jscomp$4$$.length ? $JSCompiler_StaticMethods_parseUrlRecursively_$$(this, $url$jscomp$76$$, $expr$jscomp$6_matches$jscomp$4$$) : this.$D$ ? $url$jscomp$76$$ : window.Promise.resolve($url$jscomp$76$$);
};
_.$VariableSource$$module$src$service$variable_source$$.prototype.$I$ = function() {
};
_.$VariableSource$$module$src$service$variable_source$$.prototype.get = function($name$jscomp$145$$) {
  this.$G$ || (this.$I$(), this.$G$ = !0);
  return this.$D$[$name$jscomp$145$$];
};
_.$VariableSource$$module$src$service$variable_source$$.prototype.set = function($varName$jscomp$1$$, $syncResolver$$) {
  this.$D$[$varName$jscomp$1$$] = this.$D$[$varName$jscomp$1$$] || {sync:void 0, async:void 0};
  this.$D$[$varName$jscomp$1$$].sync = $syncResolver$$;
  return this;
};
_.$$jscomp$inherits$$($GlobalVariableSource$$module$src$service$url_replacements_impl$$, _.$VariableSource$$module$src$service$variable_source$$);
$GlobalVariableSource$$module$src$service$url_replacements_impl$$.prototype.$I$ = function() {
  function $expandSourceUrl$$() {
    var $expandSourceUrl$$ = _.$Services$$module$src$services$documentInfoForDoc$$($$jscomp$this$jscomp$117$$.ampdoc);
    return _.$removeFragment$$module$src$url$$($JSCompiler_StaticMethods_addReplaceParamsIfMissing_$$($$jscomp$this$jscomp$117$$, $expandSourceUrl$$.sourceUrl));
  }
  var $$jscomp$this$jscomp$117$$ = this, $win$jscomp$185$$ = this.ampdoc.$win$, $element$jscomp$149$$ = this.ampdoc.$getHeadNode$(), $viewport$jscomp$6$$ = _.$Services$$module$src$services$viewportForDoc$$(this.ampdoc);
  this.set("RANDOM", function() {
    return Math.random();
  });
  var $counterStore$$ = Object.create(null);
  this.set("COUNTER", function($expandSourceUrl$$) {
    return $counterStore$$[$expandSourceUrl$$] = ($counterStore$$[$expandSourceUrl$$] | 0) + 1;
  });
  this.set("CANONICAL_URL", function() {
    return _.$Services$$module$src$services$documentInfoForDoc$$($$jscomp$this$jscomp$117$$.ampdoc).canonicalUrl;
  });
  this.set("CANONICAL_HOST", function() {
    return _.$parseUrlDeprecated$$module$src$url$$(_.$Services$$module$src$services$documentInfoForDoc$$($$jscomp$this$jscomp$117$$.ampdoc).canonicalUrl).host;
  });
  this.set("CANONICAL_HOSTNAME", function() {
    return _.$parseUrlDeprecated$$module$src$url$$(_.$Services$$module$src$services$documentInfoForDoc$$($$jscomp$this$jscomp$117$$.ampdoc).canonicalUrl).hostname;
  });
  this.set("CANONICAL_PATH", function() {
    return _.$parseUrlDeprecated$$module$src$url$$(_.$Services$$module$src$services$documentInfoForDoc$$($$jscomp$this$jscomp$117$$.ampdoc).canonicalUrl).pathname;
  });
  _.$JSCompiler_StaticMethods_setAsync$$(this, "DOCUMENT_REFERRER", function() {
    return _.$Services$$module$src$services$viewerForDoc$$($$jscomp$this$jscomp$117$$.ampdoc).$I$;
  });
  _.$JSCompiler_StaticMethods_setAsync$$(this, "EXTERNAL_REFERRER", function() {
    return _.$Services$$module$src$services$viewerForDoc$$($$jscomp$this$jscomp$117$$.ampdoc).$I$.then(function($expandSourceUrl$$) {
      return $expandSourceUrl$$ ? _.$parseUrlDeprecated$$module$src$url$$(_.$getSourceUrl$$module$src$url$$($expandSourceUrl$$)).hostname === $win$jscomp$185$$.location.hostname ? null : $expandSourceUrl$$ : null;
    });
  });
  this.set("TITLE", function() {
    var $expandSourceUrl$$ = $win$jscomp$185$$.document;
    return $expandSourceUrl$$.originalTitle || $expandSourceUrl$$.title;
  });
  this.set("AMPDOC_URL", function() {
    return _.$removeFragment$$module$src$url$$($JSCompiler_StaticMethods_addReplaceParamsIfMissing_$$($$jscomp$this$jscomp$117$$, $win$jscomp$185$$.location.href));
  });
  this.set("AMPDOC_HOST", function() {
    var $expandSourceUrl$$ = _.$parseUrlDeprecated$$module$src$url$$($win$jscomp$185$$.location.href);
    return $expandSourceUrl$$ && $expandSourceUrl$$.host;
  });
  this.set("AMPDOC_HOSTNAME", function() {
    var $expandSourceUrl$$ = _.$parseUrlDeprecated$$module$src$url$$($win$jscomp$185$$.location.href);
    return $expandSourceUrl$$ && $expandSourceUrl$$.hostname;
  });
  $JSCompiler_StaticMethods_setBoth$$(this, "SOURCE_URL", function() {
    return $expandSourceUrl$$();
  }, function() {
    return _.$trackImpressionPromise$$module$src$impression$$.then(function() {
      return $expandSourceUrl$$();
    });
  });
  this.set("SOURCE_HOST", function() {
    return _.$parseUrlDeprecated$$module$src$url$$(_.$Services$$module$src$services$documentInfoForDoc$$($$jscomp$this$jscomp$117$$.ampdoc).sourceUrl).host;
  });
  this.set("SOURCE_HOSTNAME", function() {
    return _.$parseUrlDeprecated$$module$src$url$$(_.$Services$$module$src$services$documentInfoForDoc$$($$jscomp$this$jscomp$117$$.ampdoc).sourceUrl).hostname;
  });
  this.set("SOURCE_PATH", function() {
    return _.$parseUrlDeprecated$$module$src$url$$(_.$Services$$module$src$services$documentInfoForDoc$$($$jscomp$this$jscomp$117$$.ampdoc).sourceUrl).pathname;
  });
  this.set("PAGE_VIEW_ID", function() {
    return _.$Services$$module$src$services$documentInfoForDoc$$($$jscomp$this$jscomp$117$$.ampdoc).pageViewId;
  });
  $JSCompiler_StaticMethods_setBoth$$(this, "QUERY_PARAM", function($expandSourceUrl$$, $win$jscomp$185$$) {
    return $JSCompiler_StaticMethods_getQueryParamData_$$($$jscomp$this$jscomp$117$$, $expandSourceUrl$$, void 0 === $win$jscomp$185$$ ? "" : $win$jscomp$185$$);
  }, function($expandSourceUrl$$, $win$jscomp$185$$) {
    $win$jscomp$185$$ = void 0 === $win$jscomp$185$$ ? "" : $win$jscomp$185$$;
    return _.$trackImpressionPromise$$module$src$impression$$.then(function() {
      return $JSCompiler_StaticMethods_getQueryParamData_$$($$jscomp$this$jscomp$117$$, $expandSourceUrl$$, $win$jscomp$185$$);
    });
  });
  _.$JSCompiler_StaticMethods_setAsync$$(this, "FRAGMENT_PARAM", $JSCompiler_StaticMethods_getViewerIntegrationValue_$$(this, "fragmentParam"));
  _.$JSCompiler_StaticMethods_setAsync$$(this, "ANCESTOR_ORIGIN", $JSCompiler_StaticMethods_getViewerIntegrationValue_$$(this, "ancestorOrigin"));
  var $clientIds$$ = null;
  $JSCompiler_StaticMethods_setBoth$$(this, "CLIENT_ID", function($expandSourceUrl$$) {
    return $clientIds$$ ? $clientIds$$[$expandSourceUrl$$] : null;
  }, function($expandSourceUrl$$, $win$jscomp$185$$, $viewport$jscomp$6$$) {
    _.$JSCompiler_StaticMethods_assertString$$(_.$user$$module$src$log$$(), $expandSourceUrl$$, "The first argument to CLIENT_ID, the fallback Cookie name, is required");
    if ("inabox" == _.$getMode$$module$src$mode$$().runtime) {
      return window.Promise.resolve(null);
    }
    var $counterStore$$ = window.Promise.resolve();
    $win$jscomp$185$$ && ($counterStore$$ = _.$Services$$module$src$services$userNotificationManagerForDoc$$($element$jscomp$149$$).then(function($expandSourceUrl$$) {
      return $expandSourceUrl$$.get($win$jscomp$185$$);
    }));
    return _.$Services$$module$src$services$cidForDoc$$($$jscomp$this$jscomp$117$$.ampdoc).then(function($$jscomp$this$jscomp$117$$) {
      return $$jscomp$this$jscomp$117$$.get({scope:$expandSourceUrl$$, createCookieIfNotPresent:!0, $cookieName$:$viewport$jscomp$6$$}, $counterStore$$);
    }).then(function($$jscomp$this$jscomp$117$$) {
      $clientIds$$ || ($clientIds$$ = Object.create(null));
      var $win$jscomp$185$$ = $viewport$jscomp$6$$ || $expandSourceUrl$$;
      $$jscomp$this$jscomp$117$$ && "_ga" == $win$jscomp$185$$ && ("string" === typeof $$jscomp$this$jscomp$117$$ ? $$jscomp$this$jscomp$117$$ = $$jscomp$this$jscomp$117$$.replace(/^(GA1|1)\.[\d-]+\./, "") : _.$dev$$module$src$log$$().error("UrlReplacements", "non-string cid, what is it?", Object.keys($$jscomp$this$jscomp$117$$)));
      return $clientIds$$[$expandSourceUrl$$] = $$jscomp$this$jscomp$117$$;
    });
  });
  _.$JSCompiler_StaticMethods_setAsync$$(this, "VARIANT", function($expandSourceUrl$$) {
    return $JSCompiler_StaticMethods_getVariantsValue_$$($$jscomp$this$jscomp$117$$, function($$jscomp$this$jscomp$117$$) {
      $$jscomp$this$jscomp$117$$ = $$jscomp$this$jscomp$117$$[$expandSourceUrl$$];
      return null === $$jscomp$this$jscomp$117$$ ? "none" : $$jscomp$this$jscomp$117$$;
    });
  });
  _.$JSCompiler_StaticMethods_setAsync$$(this, "VARIANTS", function() {
    return $JSCompiler_StaticMethods_getVariantsValue_$$($$jscomp$this$jscomp$117$$, function($expandSourceUrl$$) {
      var $$jscomp$this$jscomp$117$$ = [], $win$jscomp$185$$;
      for ($win$jscomp$185$$ in $expandSourceUrl$$) {
        $$jscomp$this$jscomp$117$$.push($win$jscomp$185$$ + "." + ($expandSourceUrl$$[$win$jscomp$185$$] || "none"));
      }
      return $$jscomp$this$jscomp$117$$.join("!");
    });
  });
  _.$JSCompiler_StaticMethods_setAsync$$(this, "AMP_GEO", function($expandSourceUrl$$) {
    return $JSCompiler_StaticMethods_getGeo_$$($$jscomp$this$jscomp$117$$, function($$jscomp$this$jscomp$117$$) {
      return $expandSourceUrl$$ ? $$jscomp$this$jscomp$117$$[$expandSourceUrl$$] || "unknown" : $$jscomp$this$jscomp$117$$.$matchedISOCountryGroups$.join(",");
    });
  });
  _.$JSCompiler_StaticMethods_setAsync$$(this, "SHARE_TRACKING_INCOMING", function() {
    return $JSCompiler_StaticMethods_getShareTrackingValue_$$($$jscomp$this$jscomp$117$$, function($expandSourceUrl$$) {
      return $expandSourceUrl$$.$incomingFragment$;
    });
  });
  _.$JSCompiler_StaticMethods_setAsync$$(this, "SHARE_TRACKING_OUTGOING", function() {
    return $JSCompiler_StaticMethods_getShareTrackingValue_$$($$jscomp$this$jscomp$117$$, function($expandSourceUrl$$) {
      return $expandSourceUrl$$.$outgoingFragment$;
    });
  });
  this.set("TIMESTAMP", $dateMethod$$module$src$service$url_replacements_impl$$("getTime"));
  this.set("TIMESTAMP_ISO", $dateMethod$$module$src$service$url_replacements_impl$$("toISOString"));
  this.set("TIMEZONE", $dateMethod$$module$src$service$url_replacements_impl$$("getTimezoneOffset"));
  this.set("TIMEZONE_CODE", function() {
    if ("Intl" in $win$jscomp$185$$ && "DateTimeFormat" in $win$jscomp$185$$.Intl) {
      var $expandSourceUrl$$ = (new window.Intl.DateTimeFormat).resolvedOptions().timeZone;
    }
    return $expandSourceUrl$$ || "";
  });
  this.set("SCROLL_TOP", function() {
    return _.$JSCompiler_StaticMethods_Viewport$$module$src$service$viewport$viewport_impl_prototype$getScrollTop$$($viewport$jscomp$6$$);
  });
  this.set("SCROLL_LEFT", function() {
    return $viewport$jscomp$6$$.getScrollLeft();
  });
  this.set("SCROLL_HEIGHT", function() {
    return $viewport$jscomp$6$$.$getScrollHeight$();
  });
  this.set("SCROLL_WIDTH", function() {
    return $viewport$jscomp$6$$.getScrollWidth();
  });
  this.set("VIEWPORT_HEIGHT", function() {
    return _.$JSCompiler_StaticMethods_getHeight$$($viewport$jscomp$6$$);
  });
  this.set("VIEWPORT_WIDTH", function() {
    return $viewport$jscomp$6$$.getWidth();
  });
  var $screen$jscomp$2$$ = $win$jscomp$185$$.screen;
  this.set("SCREEN_WIDTH", $screenProperty$$module$src$service$url_replacements_impl$$($screen$jscomp$2$$, "width"));
  this.set("SCREEN_HEIGHT", $screenProperty$$module$src$service$url_replacements_impl$$($screen$jscomp$2$$, "height"));
  this.set("AVAILABLE_SCREEN_HEIGHT", $screenProperty$$module$src$service$url_replacements_impl$$($screen$jscomp$2$$, "availHeight"));
  this.set("AVAILABLE_SCREEN_WIDTH", $screenProperty$$module$src$service$url_replacements_impl$$($screen$jscomp$2$$, "availWidth"));
  this.set("SCREEN_COLOR_DEPTH", $screenProperty$$module$src$service$url_replacements_impl$$($screen$jscomp$2$$, "colorDepth"));
  this.set("DOCUMENT_CHARSET", function() {
    var $expandSourceUrl$$ = $win$jscomp$185$$.document;
    return $expandSourceUrl$$.characterSet || $expandSourceUrl$$.charset;
  });
  this.set("BROWSER_LANGUAGE", function() {
    var $expandSourceUrl$$ = $win$jscomp$185$$.navigator;
    return ($expandSourceUrl$$.language || $expandSourceUrl$$.$G$ || $expandSourceUrl$$.browserLanguage || "").toLowerCase();
  });
  this.set("USER_AGENT", function() {
    return $win$jscomp$185$$.navigator.userAgent;
  });
  $JSCompiler_StaticMethods_setTimingResolver_$$(this, "PAGE_LOAD_TIME", "navigationStart", "loadEventStart");
  $JSCompiler_StaticMethods_setTimingResolver_$$(this, "DOMAIN_LOOKUP_TIME", "domainLookupStart", "domainLookupEnd");
  $JSCompiler_StaticMethods_setTimingResolver_$$(this, "TCP_CONNECT_TIME", "connectStart", "connectEnd");
  $JSCompiler_StaticMethods_setTimingResolver_$$(this, "SERVER_RESPONSE_TIME", "requestStart", "responseStart");
  $JSCompiler_StaticMethods_setTimingResolver_$$(this, "PAGE_DOWNLOAD_TIME", "responseStart", "responseEnd");
  $JSCompiler_StaticMethods_setTimingResolver_$$(this, "REDIRECT_TIME", "navigationStart", "fetchStart");
  $JSCompiler_StaticMethods_setTimingResolver_$$(this, "DOM_INTERACTIVE_TIME", "navigationStart", "domInteractive");
  $JSCompiler_StaticMethods_setTimingResolver_$$(this, "CONTENT_LOAD_TIME", "navigationStart", "domContentLoadedEventStart");
  _.$JSCompiler_StaticMethods_setAsync$$(this, "ACCESS_READER_ID", function() {
    return $JSCompiler_StaticMethods_getAccessValue_$$($$jscomp$this$jscomp$117$$, function($expandSourceUrl$$) {
      return $expandSourceUrl$$.$AccessService$$module$extensions$amp_access$0_1$amp_access_prototype$getAccessReaderId$();
    }, "ACCESS_READER_ID");
  });
  _.$JSCompiler_StaticMethods_setAsync$$(this, "AUTHDATA", function($expandSourceUrl$$) {
    return $JSCompiler_StaticMethods_getAccessValue_$$($$jscomp$this$jscomp$117$$, function($$jscomp$this$jscomp$117$$) {
      return $$jscomp$this$jscomp$117$$.$AccessService$$module$extensions$amp_access$0_1$amp_access_prototype$getAuthdataField$($expandSourceUrl$$);
    }, "AUTHDATA");
  });
  _.$JSCompiler_StaticMethods_setAsync$$(this, "VIEWER", function() {
    return _.$JSCompiler_StaticMethods_getViewerOrigin$$(_.$Services$$module$src$services$viewerForDoc$$($$jscomp$this$jscomp$117$$.ampdoc)).then(function($expandSourceUrl$$) {
      return void 0 == $expandSourceUrl$$ ? "" : $expandSourceUrl$$;
    });
  });
  _.$JSCompiler_StaticMethods_setAsync$$(this, "TOTAL_ENGAGED_TIME", function() {
    return _.$getElementServiceForDoc$$module$src$element_service$$($element$jscomp$149$$, "activity", "amp-analytics").then(function($expandSourceUrl$$) {
      return $expandSourceUrl$$.$Activity$$module$extensions$amp_analytics$0_1$activity_impl_prototype$getTotalEngagedTime$();
    });
  });
  _.$JSCompiler_StaticMethods_setAsync$$(this, "INCREMENTAL_ENGAGED_TIME", function($expandSourceUrl$$, $$jscomp$this$jscomp$117$$) {
    return _.$getElementServiceForDoc$$module$src$element_service$$($element$jscomp$149$$, "activity", "amp-analytics").then(function($win$jscomp$185$$) {
      return $win$jscomp$185$$.$Activity$$module$extensions$amp_analytics$0_1$activity_impl_prototype$getIncrementalEngagedTime$($expandSourceUrl$$, "false" !== $$jscomp$this$jscomp$117$$);
    });
  });
  this.set("NAV_TIMING", function($expandSourceUrl$$, $$jscomp$this$jscomp$117$$) {
    return _.$getTimingDataSync$$module$src$service$variable_source$$($win$jscomp$185$$, $expandSourceUrl$$, $$jscomp$this$jscomp$117$$);
  });
  _.$JSCompiler_StaticMethods_setAsync$$(this, "NAV_TIMING", function($expandSourceUrl$$, $$jscomp$this$jscomp$117$$) {
    return _.$getTimingDataAsync$$module$src$service$variable_source$$($win$jscomp$185$$, $expandSourceUrl$$, $$jscomp$this$jscomp$117$$);
  });
  this.set("NAV_TYPE", function() {
    return _.$getNavigationData$$module$src$service$variable_source$$($win$jscomp$185$$, "type");
  });
  this.set("NAV_REDIRECT_COUNT", function() {
    return _.$getNavigationData$$module$src$service$variable_source$$($win$jscomp$185$$, "redirectCount");
  });
  this.set("AMP_VERSION", function() {
    return "1901181729101";
  });
  this.set("BACKGROUND_STATE", function() {
    return _.$JSCompiler_StaticMethods_Viewer$$module$src$service$viewer_impl_prototype$isVisible$$(_.$Services$$module$src$services$viewerForDoc$$($$jscomp$this$jscomp$117$$.ampdoc)) ? "0" : "1";
  });
  _.$JSCompiler_StaticMethods_setAsync$$(this, "VIDEO_STATE", function($expandSourceUrl$$, $win$jscomp$185$$) {
    var $element$jscomp$149$$ = $$jscomp$this$jscomp$117$$.ampdoc.getRootNode();
    $expandSourceUrl$$ = _.$JSCompiler_StaticMethods_assertElement$$(_.$user$$module$src$log$$(), $element$jscomp$149$$.getElementById($expandSourceUrl$$), 'Could not find an element with id="' + $expandSourceUrl$$ + '" for VIDEO_STATE');
    return _.$Services$$module$src$services$videoManagerForDoc$$($$jscomp$this$jscomp$117$$.ampdoc).$VideoManager$$module$src$service$video_manager_impl_prototype$getAnalyticsDetails$($expandSourceUrl$$).then(function($expandSourceUrl$$) {
      return $expandSourceUrl$$ ? $expandSourceUrl$$[$win$jscomp$185$$] : "";
    });
  });
  _.$JSCompiler_StaticMethods_setAsync$$(this, "STORY_PAGE_INDEX", $JSCompiler_StaticMethods_getStoryValue_$$(this, "pageIndex"));
  _.$JSCompiler_StaticMethods_setAsync$$(this, "STORY_PAGE_ID", $JSCompiler_StaticMethods_getStoryValue_$$(this, "pageId"));
  _.$JSCompiler_StaticMethods_setAsync$$(this, "FIRST_CONTENTFUL_PAINT", function() {
    return _.$tryResolve$$module$src$utils$promise$$(function() {
      return _.$Services$$module$src$services$performanceFor$$($win$jscomp$185$$).$U$;
    });
  });
  _.$JSCompiler_StaticMethods_setAsync$$(this, "FIRST_VIEWPORT_READY", function() {
    return _.$tryResolve$$module$src$utils$promise$$(function() {
      return _.$Services$$module$src$services$performanceFor$$($win$jscomp$185$$).$V$;
    });
  });
  _.$JSCompiler_StaticMethods_setAsync$$(this, "MAKE_BODY_VISIBLE", function() {
    return _.$tryResolve$$module$src$utils$promise$$(function() {
      return _.$Services$$module$src$services$performanceFor$$($win$jscomp$185$$).$W$;
    });
  });
  _.$JSCompiler_StaticMethods_setAsync$$(this, "AMP_STATE", function($expandSourceUrl$$) {
    return _.$getElementServiceIfAvailableForDocInEmbedScope$$module$src$element_service$$($win$jscomp$185$$.document.documentElement).then(function($$jscomp$this$jscomp$117$$) {
      return $$jscomp$this$jscomp$117$$ ? $$jscomp$this$jscomp$117$$.$getStateValue$($expandSourceUrl$$) : "";
    });
  });
};
var $TRIM_ORIGIN_PATTERN_$$module$src$service$viewer_impl$$ = /^(https?:\/\/)((www[0-9]*|web|ftp|wap|home|mobile|amp|m)\.)+/i, $TRUSTED_VIEWER_HOSTS$$module$src$service$viewer_impl$$ = [/(^|\.)google\.(com?|[a-z]{2}|com?\.[a-z]{2}|cat)$/];
$Viewer$$module$src$service$viewer_impl$$.prototype.$toggleRuntime$ = function() {
  this.$O$ = !this.$O$;
  "Viewer";
  this.$sa$.$fire$(this.$O$);
};
$Viewer$$module$src$service$viewer_impl$$.prototype.$ra$ = function() {
  $JSCompiler_StaticMethods_setVisibilityState_$$(this, this.$va$);
};
$Viewer$$module$src$service$viewer_impl$$.prototype.$onMessage$ = function($eventType$jscomp$11$$, $handler$jscomp$24$$) {
  var $observable$$ = this.$ia$[$eventType$jscomp$11$$];
  $observable$$ || ($observable$$ = new _.$Observable$$module$src$observable$$, this.$ia$[$eventType$jscomp$11$$] = $observable$$);
  return $observable$$.add($handler$jscomp$24$$);
};
$Viewer$$module$src$service$viewer_impl$$.prototype.$ka$ = function($eventType$jscomp$13_responder$jscomp$1$$, $data$jscomp$59$$) {
  if ("visibilitychange" == $eventType$jscomp$13_responder$jscomp$1$$) {
    return void 0 !== $data$jscomp$59$$.prerenderSize && (this.$P$ = $data$jscomp$59$$.prerenderSize, "Viewer"), $JSCompiler_StaticMethods_setVisibilityState_$$(this, $data$jscomp$59$$.state), window.Promise.resolve();
  }
  if ("broadcast" == $eventType$jscomp$13_responder$jscomp$1$$) {
    return this.$oa$.$fire$($data$jscomp$59$$), window.Promise.resolve();
  }
  var $observable$jscomp$1$$ = this.$ia$[$eventType$jscomp$13_responder$jscomp$1$$];
  $observable$jscomp$1$$ && $observable$jscomp$1$$.$fire$($data$jscomp$59$$);
  if ($eventType$jscomp$13_responder$jscomp$1$$ = this.$qa$[$eventType$jscomp$13_responder$jscomp$1$$]) {
    return $eventType$jscomp$13_responder$jscomp$1$$($data$jscomp$59$$);
  }
  if ($observable$jscomp$1$$) {
    return window.Promise.resolve();
  }
  "Viewer";
};
$Bezier$$module$src$curve$$.prototype.$G$ = function($JSCompiler_inline_result$jscomp$502_t$jscomp$inline_1545_xVal$$) {
  $JSCompiler_inline_result$jscomp$502_t$jscomp$inline_1545_xVal$$ = $JSCompiler_StaticMethods_solvePositionFromXValue$$(this, $JSCompiler_inline_result$jscomp$502_t$jscomp$inline_1545_xVal$$);
  if (0 == $JSCompiler_inline_result$jscomp$502_t$jscomp$inline_1545_xVal$$) {
    $JSCompiler_inline_result$jscomp$502_t$jscomp$inline_1545_xVal$$ = this.$D$;
  } else {
    if (1 == $JSCompiler_inline_result$jscomp$502_t$jscomp$inline_1545_xVal$$) {
      $JSCompiler_inline_result$jscomp$502_t$jscomp$inline_1545_xVal$$ = this.$F$;
    } else {
      var $iy0$jscomp$inline_1546$$ = $JSCompiler_StaticMethods_lerp$$(this.$D$, this.$y1$, $JSCompiler_inline_result$jscomp$502_t$jscomp$inline_1545_xVal$$), $iy1$jscomp$inline_1547$$ = $JSCompiler_StaticMethods_lerp$$(this.$y1$, this.$y2$, $JSCompiler_inline_result$jscomp$502_t$jscomp$inline_1545_xVal$$), $iy2$jscomp$inline_1548$$ = $JSCompiler_StaticMethods_lerp$$(this.$y2$, this.$F$, $JSCompiler_inline_result$jscomp$502_t$jscomp$inline_1545_xVal$$);
      $iy0$jscomp$inline_1546$$ = $JSCompiler_StaticMethods_lerp$$($iy0$jscomp$inline_1546$$, $iy1$jscomp$inline_1547$$, $JSCompiler_inline_result$jscomp$502_t$jscomp$inline_1545_xVal$$);
      $iy1$jscomp$inline_1547$$ = $JSCompiler_StaticMethods_lerp$$($iy1$jscomp$inline_1547$$, $iy2$jscomp$inline_1548$$, $JSCompiler_inline_result$jscomp$502_t$jscomp$inline_1545_xVal$$);
      $JSCompiler_inline_result$jscomp$502_t$jscomp$inline_1545_xVal$$ = $JSCompiler_StaticMethods_lerp$$($iy0$jscomp$inline_1546$$, $iy1$jscomp$inline_1547$$, $JSCompiler_inline_result$jscomp$502_t$jscomp$inline_1545_xVal$$);
    }
  }
  return $JSCompiler_inline_result$jscomp$502_t$jscomp$inline_1545_xVal$$;
};
var $Curves$$module$src$curve$EASE$$ = _.$bezierCurve$$module$src$curve$$(0.25, 0.1, 0.25, 1.0), $Curves$$module$src$curve$EASE_IN$$ = _.$bezierCurve$$module$src$curve$$(0.42, 0.0, 1.0, 1.0), $Curves$$module$src$curve$EASE_OUT$$ = _.$bezierCurve$$module$src$curve$$(0.0, 0.0, 0.58, 1.0), $Curves$$module$src$curve$EASE_IN_OUT$$ = _.$bezierCurve$$module$src$curve$$(0.42, 0.0, 0.58, 1.0), $NAME_MAP$$module$src$curve$$ = {linear:function($n$jscomp$13$$) {
  return $n$jscomp$13$$;
}, ease:$Curves$$module$src$curve$EASE$$, "ease-in":$Curves$$module$src$curve$EASE_IN$$, "ease-out":$Curves$$module$src$curve$EASE_OUT$$, "ease-in-out":$Curves$$module$src$curve$EASE_IN_OUT$$};
_.$Animation$$module$src$animation$$.prototype.add = function($delay$jscomp$5$$, $transition$jscomp$3$$, $duration$jscomp$3$$, $opt_curve$jscomp$1$$) {
  this.$D$.push({delay:$delay$jscomp$5$$, func:$transition$jscomp$3$$, duration:$duration$jscomp$3$$, curve:$getCurve$$module$src$curve$$($opt_curve$jscomp$1$$)});
  return this;
};
_.$Animation$$module$src$animation$$.prototype.start = function($duration$jscomp$4$$) {
  return new _.$AnimationPlayer$$module$src$animation$$(this.$vsync_$, this.$G$, this.$D$, this.$F$, $duration$jscomp$4$$);
};
_.$AnimationPlayer$$module$src$animation$$.prototype.then = function($opt_resolve$jscomp$1$$, $opt_reject$jscomp$1$$) {
  return $opt_resolve$jscomp$1$$ || $opt_reject$jscomp$1$$ ? this.$I$.then($opt_resolve$jscomp$1$$, $opt_reject$jscomp$1$$) : this.$I$;
};
_.$AnimationPlayer$$module$src$animation$$.prototype.$halt$ = _.$JSCompiler_stubMethod$$(34);
_.$AnimationPlayer$$module$src$animation$$.prototype.$R$ = function() {
  if (this.$G$) {
    for (var $normLinearTime$$ = Math.min((Date.now() - this.$P$) / this.$duration_$, 1), $i$165_i$jscomp$104$$ = 0; $i$165_i$jscomp$104$$ < this.$D$.length; $i$165_i$jscomp$104$$++) {
      var $segment$166_segment$jscomp$1$$ = this.$D$[$i$165_i$jscomp$104$$];
      !$segment$166_segment$jscomp$1$$.$started$ && $normLinearTime$$ >= $segment$166_segment$jscomp$1$$.delay && ($segment$166_segment$jscomp$1$$.$started$ = !0);
    }
    for ($i$165_i$jscomp$104$$ = 0; $i$165_i$jscomp$104$$ < this.$D$.length; $i$165_i$jscomp$104$$++) {
      if ($segment$166_segment$jscomp$1$$ = this.$D$[$i$165_i$jscomp$104$$], $segment$166_segment$jscomp$1$$.$started$ && !$segment$166_segment$jscomp$1$$.$completed$) {
        a: {
          var $normLinearTime$jscomp$inline_1556$$;
          if (0 < $segment$166_segment$jscomp$1$$.duration) {
            var $normTime$jscomp$inline_1557$$ = $normLinearTime$jscomp$inline_1556$$ = Math.min(($normLinearTime$$ - $segment$166_segment$jscomp$1$$.delay) / $segment$166_segment$jscomp$1$$.duration, 1);
            if ($segment$166_segment$jscomp$1$$.curve && 1 != $normTime$jscomp$inline_1557$$) {
              try {
                $normTime$jscomp$inline_1557$$ = $segment$166_segment$jscomp$1$$.curve($normLinearTime$jscomp$inline_1556$$);
              } catch ($e$jscomp$inline_1558$$) {
                _.$dev$$module$src$log$$().error("Animation", "step curve failed: " + $e$jscomp$inline_1558$$, $e$jscomp$inline_1558$$);
                _.$JSCompiler_StaticMethods_AnimationPlayer$$module$src$animation_prototype$complete_$$(this, !1);
                break a;
              }
            }
          } else {
            $normTime$jscomp$inline_1557$$ = $normLinearTime$jscomp$inline_1556$$ = 1;
          }
          1 == $normLinearTime$jscomp$inline_1556$$ && ($segment$166_segment$jscomp$1$$.$completed$ = !0);
          try {
            $segment$166_segment$jscomp$1$$.func($normTime$jscomp$inline_1557$$, $segment$166_segment$jscomp$1$$.$completed$);
          } catch ($e$167$jscomp$inline_1559$$) {
            _.$dev$$module$src$log$$().error("Animation", "step mutate failed: " + $e$167$jscomp$inline_1559$$, $e$167$jscomp$inline_1559$$), _.$JSCompiler_StaticMethods_AnimationPlayer$$module$src$animation_prototype$complete_$$(this, !1);
          }
        }
      }
    }
    1 == $normLinearTime$$ ? _.$JSCompiler_StaticMethods_AnimationPlayer$$module$src$animation_prototype$complete_$$(this, !0) : _.$JSCompiler_StaticMethods_canAnimate_$$(this.$vsync_$, this.$F$) ? this.$J$(this.$state_$) : (_.$dev$$module$src$log$$().$Log$$module$src$log_prototype$warn$("Animation", "cancel animation"), _.$JSCompiler_StaticMethods_AnimationPlayer$$module$src$animation_prototype$complete_$$(this, !1));
  }
};
var $EXCLUDE_INI_LOAD$$module$src$friendly_iframe_embed$$ = ["AMP-AD", "AMP-ANALYTICS", "AMP-PIXEL", "AMP-AD-EXIT"];
var $ANCESTRY_CACHE$$module$src$service$layers_impl$$ = [], $layoutId$$module$src$service$layers_impl$$ = 0;
_.$JSCompiler_prototypeAlias$$ = $LayoutLayers$$module$src$service$layers_impl$$.prototype;
_.$JSCompiler_prototypeAlias$$.$dispose$ = function() {
  this.$unlisteners_$.forEach(function($unlisten$jscomp$6$$) {
    return $unlisten$jscomp$6$$();
  });
  this.$unlisteners_$.length = 0;
};
_.$JSCompiler_prototypeAlias$$.add = function($element$jscomp$160$$) {
  var $layout$jscomp$11$$ = $LayoutElement$$module$src$service$layers_impl$forOptional$$($element$jscomp$160$$);
  $layout$jscomp$11$$ || ($layout$jscomp$11$$ = new $LayoutElement$$module$src$service$layers_impl$$($element$jscomp$160$$));
  this.$D$.includes($layout$jscomp$11$$) || this.$D$.push($layout$jscomp$11$$);
  return $layout$jscomp$11$$;
};
_.$JSCompiler_prototypeAlias$$.remove = function($element$jscomp$161_layout$jscomp$12$$) {
  if ($element$jscomp$161_layout$jscomp$12$$ = $LayoutElement$$module$src$service$layers_impl$forOptional$$($element$jscomp$161_layout$jscomp$12$$)) {
    var $layouts$$ = this.$D$, $i$jscomp$107_index$jscomp$69_parent$jscomp$21$$ = $layouts$$.indexOf($element$jscomp$161_layout$jscomp$12$$);
    -1 < $i$jscomp$107_index$jscomp$69_parent$jscomp$21$$ && $layouts$$.splice($i$jscomp$107_index$jscomp$69_parent$jscomp$21$$, 1);
    if ($i$jscomp$107_index$jscomp$69_parent$jscomp$21$$ = $JSCompiler_StaticMethods_getParentLayer$$($element$jscomp$161_layout$jscomp$12$$)) {
      $i$jscomp$107_index$jscomp$69_parent$jscomp$21$$.remove($element$jscomp$161_layout$jscomp$12$$);
    } else {
      for ($i$jscomp$107_index$jscomp$69_parent$jscomp$21$$ = 0; $i$jscomp$107_index$jscomp$69_parent$jscomp$21$$ < $layouts$$.length; $i$jscomp$107_index$jscomp$69_parent$jscomp$21$$++) {
        $layouts$$[$i$jscomp$107_index$jscomp$69_parent$jscomp$21$$].remove($element$jscomp$161_layout$jscomp$12$$);
      }
    }
    $element$jscomp$161_layout$jscomp$12$$.$G$ = void 0;
    $element$jscomp$161_layout$jscomp$12$$.$D$ = !0;
  }
};
_.$JSCompiler_prototypeAlias$$.$getScrolledPosition$ = function($element$jscomp$162_pos$jscomp$4$$) {
  $element$jscomp$162_pos$jscomp$4$$ = this.add($element$jscomp$162_pos$jscomp$4$$).$getScrolledPosition$(void 0);
  return $positionLt$$module$src$service$layers_impl$$(Math.round($element$jscomp$162_pos$jscomp$4$$.left), Math.round($element$jscomp$162_pos$jscomp$4$$.top));
};
_.$JSCompiler_prototypeAlias$$.$getOffsetPosition$ = function($element$jscomp$163_pos$jscomp$5$$) {
  $element$jscomp$163_pos$jscomp$5$$ = this.add($element$jscomp$163_pos$jscomp$5$$).$getOffsetPosition$(void 0);
  return $positionLt$$module$src$service$layers_impl$$(Math.round($element$jscomp$163_pos$jscomp$5$$.left), Math.round($element$jscomp$163_pos$jscomp$5$$.top));
};
_.$JSCompiler_prototypeAlias$$.$getSize$ = function($element$jscomp$164_size$jscomp$14$$) {
  $element$jscomp$164_size$jscomp$14$$ = this.add($element$jscomp$164_size$jscomp$14$$).$getSize$();
  return {height:Math.round($element$jscomp$164_size$jscomp$14$$.height), width:Math.round($element$jscomp$164_size$jscomp$14$$.width)};
};
_.$JSCompiler_prototypeAlias$$.$remeasure$ = function($element$jscomp$165_from$jscomp$2_layout$jscomp$16$$, $opt_force$jscomp$3$$) {
  $element$jscomp$165_from$jscomp$2_layout$jscomp$16$$ = this.add($element$jscomp$165_from$jscomp$2_layout$jscomp$16$$);
  $element$jscomp$165_from$jscomp$2_layout$jscomp$16$$ = $JSCompiler_StaticMethods_getParentLayer$$($element$jscomp$165_from$jscomp$2_layout$jscomp$16$$) || $element$jscomp$165_from$jscomp$2_layout$jscomp$16$$;
  $opt_force$jscomp$3$$ && ($element$jscomp$165_from$jscomp$2_layout$jscomp$16$$.$D$ = !0);
  $element$jscomp$165_from$jscomp$2_layout$jscomp$16$$.$remeasure$();
};
_.$JSCompiler_prototypeAlias$$.$declareLayer$ = function($element$jscomp$166$$) {
  $JSCompiler_StaticMethods_declareLayer_$$(this, $element$jscomp$166$$, !1, !1);
};
_.$JSCompiler_prototypeAlias$$.$iterateAncestry$ = function($element$jscomp$168$$, $iterator$jscomp$9$$, $state$jscomp$28$$) {
  return this.add($element$jscomp$168$$).$iterateAncestry$($iterator$jscomp$9$$, $state$jscomp$28$$);
};
_.$JSCompiler_prototypeAlias$$ = $LayoutElement$$module$src$service$layers_impl$$.prototype;
_.$JSCompiler_prototypeAlias$$.contains = function($layout$jscomp$21$$) {
  return $layout$jscomp$21$$ === this ? !1 : $JSCompiler_StaticMethods_contains_$$(this, this.$element_$, $layout$jscomp$21$$.$element_$);
};
_.$JSCompiler_prototypeAlias$$.add = function($child$jscomp$7$$) {
  this.contains($child$jscomp$7$$);
  this.$children_$.includes($child$jscomp$7$$) || this.$children_$.push($child$jscomp$7$$);
};
_.$JSCompiler_prototypeAlias$$.remove = function($child$jscomp$8_i$jscomp$109$$) {
  $child$jscomp$8_i$jscomp$109$$ = this.$children_$.indexOf($child$jscomp$8_i$jscomp$109$$);
  -1 < $child$jscomp$8_i$jscomp$109$$ && this.$children_$.splice($child$jscomp$8_i$jscomp$109$$, 1);
};
_.$JSCompiler_prototypeAlias$$.$declareLayer$ = function($isRootLayer$jscomp$1_parent$jscomp$23$$, $scrollsLikeViewport$jscomp$1$$) {
  this.$F$ || (this.$F$ = !0, this.$P$ = $isRootLayer$jscomp$1_parent$jscomp$23$$, this.$R$ = $scrollsLikeViewport$jscomp$1$$, this.$I$ = this.$D$ = !0, ($isRootLayer$jscomp$1_parent$jscomp$23$$ = $JSCompiler_StaticMethods_getParentLayer$$(this)) && $JSCompiler_StaticMethods_LayoutElement$$module$src$service$layers_impl_prototype$transfer_$$($isRootLayer$jscomp$1_parent$jscomp$23$$, this));
};
_.$JSCompiler_prototypeAlias$$.$getSize$ = function() {
  this.$remeasure$();
  return this.$size_$;
};
_.$JSCompiler_prototypeAlias$$.getScrollLeft = function() {
  $JSCompiler_StaticMethods_updateScrollPosition_$$(this);
  return this.$K$;
};
_.$JSCompiler_prototypeAlias$$.$getScrolledPosition$ = function($opt_ancestor$jscomp$2_stopAt$$) {
  var $x$jscomp$79$$ = this.getScrollLeft(), $y$jscomp$61$$ = $JSCompiler_StaticMethods_LayoutElement$$module$src$service$layers_impl_prototype$getScrollTop$$(this);
  $opt_ancestor$jscomp$2_stopAt$$ = $opt_ancestor$jscomp$2_stopAt$$ ? $LayoutElement$$module$src$service$layers_impl$getParentLayer$$($opt_ancestor$jscomp$2_stopAt$$) : null;
  for (var $l$jscomp$1$$ = this; $l$jscomp$1$$ && $l$jscomp$1$$ !== $opt_ancestor$jscomp$2_stopAt$$; $l$jscomp$1$$ = $JSCompiler_StaticMethods_getParentLayer$$($l$jscomp$1$$)) {
    var $position$$ = $JSCompiler_StaticMethods_getOffsetFromParent$$($l$jscomp$1$$);
    $x$jscomp$79$$ += $position$$.left - $l$jscomp$1$$.getScrollLeft();
    $y$jscomp$61$$ += $position$$.top - $JSCompiler_StaticMethods_LayoutElement$$module$src$service$layers_impl_prototype$getScrollTop$$($l$jscomp$1$$);
  }
  return $positionLt$$module$src$service$layers_impl$$($x$jscomp$79$$, $y$jscomp$61$$);
};
_.$JSCompiler_prototypeAlias$$.$getOffsetPosition$ = function($opt_ancestor$jscomp$3_stopAt$jscomp$1$$) {
  var $x$jscomp$80$$ = 0, $y$jscomp$62$$ = 0;
  $opt_ancestor$jscomp$3_stopAt$jscomp$1$$ = $opt_ancestor$jscomp$3_stopAt$jscomp$1$$ ? $LayoutElement$$module$src$service$layers_impl$getParentLayer$$($opt_ancestor$jscomp$3_stopAt$jscomp$1$$) : null;
  for (var $l$jscomp$2$$ = this; $l$jscomp$2$$ && $l$jscomp$2$$ !== $opt_ancestor$jscomp$3_stopAt$jscomp$1$$; $l$jscomp$2$$ = $JSCompiler_StaticMethods_getParentLayer$$($l$jscomp$2$$)) {
    var $position$jscomp$1$$ = $JSCompiler_StaticMethods_getOffsetFromParent$$($l$jscomp$2$$);
    $x$jscomp$80$$ += $position$jscomp$1$$.left;
    $y$jscomp$62$$ += $position$jscomp$1$$.top;
  }
  return $positionLt$$module$src$service$layers_impl$$($x$jscomp$80$$, $y$jscomp$62$$);
};
_.$JSCompiler_prototypeAlias$$.$remeasure$ = function() {
  for (var $layer$jscomp$3$$ = this, $p$jscomp$6$$ = $JSCompiler_StaticMethods_getParentLayer$$(this); $p$jscomp$6$$; $p$jscomp$6$$ = $JSCompiler_StaticMethods_getParentLayer$$($p$jscomp$6$$)) {
    $p$jscomp$6$$.$D$ && ($layer$jscomp$3$$ = $p$jscomp$6$$);
  }
  $layer$jscomp$3$$.$D$ && $JSCompiler_StaticMethods_remeasure_$$($layer$jscomp$3$$);
};
_.$JSCompiler_prototypeAlias$$.$iterateAncestry$ = function($iterator$jscomp$10$$, $state$jscomp$29$$) {
  for (var $accumulator_activeLayer$$ = $isDestroyed$$module$src$service$layers_impl$$(this.$element_$) ? null : _.$getServiceForDoc$$module$src$service$$(this.$element_$, "layers").$G$, $isActive_length$jscomp$34$$ = $accumulator_activeLayer$$ === this || !!$accumulator_activeLayer$$ && $accumulator_activeLayer$$.contains(this), $i$jscomp$110_layer$jscomp$4$$ = this; $i$jscomp$110_layer$jscomp$4$$;) {
    $ANCESTRY_CACHE$$module$src$service$layers_impl$$.push($i$jscomp$110_layer$jscomp$4$$), $i$jscomp$110_layer$jscomp$4$$.$isActive_$ = $isActive_length$jscomp$34$$, $i$jscomp$110_layer$jscomp$4$$ === $accumulator_activeLayer$$ && ($isActive_length$jscomp$34$$ = !1), $i$jscomp$110_layer$jscomp$4$$ = $JSCompiler_StaticMethods_getParentLayer$$($i$jscomp$110_layer$jscomp$4$$);
  }
  $accumulator_activeLayer$$ = void 0;
  $isActive_length$jscomp$34$$ = $ANCESTRY_CACHE$$module$src$service$layers_impl$$.length;
  for ($i$jscomp$110_layer$jscomp$4$$ = 0; $i$jscomp$110_layer$jscomp$4$$ < $isActive_length$jscomp$34$$; $i$jscomp$110_layer$jscomp$4$$++) {
    var $layer$169$$ = $ANCESTRY_CACHE$$module$src$service$layers_impl$$.pop();
    $accumulator_activeLayer$$ = $iterator$jscomp$10$$($accumulator_activeLayer$$, $layer$169$$, $i$jscomp$110_layer$jscomp$4$$, $state$jscomp$29$$);
    $layer$169$$.$isActive_$ = void 0;
  }
  return $accumulator_activeLayer$$;
};
$FixedLayer$$module$src$service$fixed_layer$$.prototype.update = function() {
  var $$jscomp$this$jscomp$135$$ = this;
  this.$elements_$.filter(function($hasTransferables$$) {
    return !$$jscomp$this$jscomp$135$$.ampdoc.contains($hasTransferables$$.element);
  }).forEach(function($hasTransferables$$) {
    return _.$JSCompiler_StaticMethods_removeElement_$$($$jscomp$this$jscomp$135$$, $hasTransferables$$.element);
  });
  if (0 == this.$elements_$.length) {
    return window.Promise.resolve();
  }
  _.$JSCompiler_StaticMethods_clearMutationObserver_$$(this);
  var $hasTransferables$$ = !1;
  return _.$JSCompiler_StaticMethods_runPromise$$(this.$vsync_$, {measure:function($state$jscomp$30$$) {
    for (var $elements$jscomp$11$$ = $$jscomp$this$jscomp$135$$.$elements_$, $autoTops$$ = [], $win$jscomp$190$$ = $$jscomp$this$jscomp$135$$.ampdoc.$win$, $i$170_i$171_i$172_i$jscomp$115$$ = 0; $i$170_i$171_i$172_i$jscomp$115$$ < $elements$jscomp$11$$.length; $i$170_i$171_i$172_i$jscomp$115$$++) {
      _.$setImportantStyles$$module$src$style$$($elements$jscomp$11$$[$i$170_i$171_i$172_i$jscomp$115$$].element, {top:"", bottom:"-9999vh", transition:"none"});
    }
    for ($i$170_i$171_i$172_i$jscomp$115$$ = 0; $i$170_i$171_i$172_i$jscomp$115$$ < $elements$jscomp$11$$.length; $i$170_i$171_i$172_i$jscomp$115$$++) {
      $autoTops$$.push(_.$computedStyle$$module$src$style$$($win$jscomp$190$$, $elements$jscomp$11$$[$i$170_i$171_i$172_i$jscomp$115$$].element).top);
    }
    for ($i$170_i$171_i$172_i$jscomp$115$$ = 0; $i$170_i$171_i$172_i$jscomp$115$$ < $elements$jscomp$11$$.length; $i$170_i$171_i$172_i$jscomp$115$$++) {
      _.$setStyle$$module$src$style$$($elements$jscomp$11$$[$i$170_i$171_i$172_i$jscomp$115$$].element, "bottom", "");
    }
    for ($i$170_i$171_i$172_i$jscomp$115$$ = 0; $i$170_i$171_i$172_i$jscomp$115$$ < $elements$jscomp$11$$.length; $i$170_i$171_i$172_i$jscomp$115$$++) {
      var $fe$jscomp$3$$ = $elements$jscomp$11$$[$i$170_i$171_i$172_i$jscomp$115$$], $$jscomp$destructuring$var118_forceTransfer$$ = $fe$jscomp$3$$, $element$jscomp$180_offsetHeight$$ = $$jscomp$destructuring$var118_forceTransfer$$.element;
      $$jscomp$destructuring$var118_forceTransfer$$ = $$jscomp$destructuring$var118_forceTransfer$$.$forceTransfer$;
      var $style$jscomp$11_top$jscomp$7$$ = _.$computedStyle$$module$src$style$$($win$jscomp$190$$, $element$jscomp$180_offsetHeight$$), $$jscomp$destructuring$var119_bottom$jscomp$1$$ = $element$jscomp$180_offsetHeight$$, $isFixed$jscomp$1_offsetWidth$$ = $$jscomp$destructuring$var119_bottom$jscomp$1$$.offsetWidth;
      $element$jscomp$180_offsetHeight$$ = $$jscomp$destructuring$var119_bottom$jscomp$1$$.offsetHeight;
      var $isTransferrable_offsetTop$$ = $$jscomp$destructuring$var119_bottom$jscomp$1$$.offsetTop, $$jscomp$destructuring$var120_zIndex$$ = $style$jscomp$11_top$jscomp$7$$, $isSticky_position$jscomp$3$$ = void 0 === $$jscomp$destructuring$var120_zIndex$$.position ? "" : $$jscomp$destructuring$var120_zIndex$$.position, $display$$ = void 0 === $$jscomp$destructuring$var120_zIndex$$.display ? "" : $$jscomp$destructuring$var120_zIndex$$.display;
      $$jscomp$destructuring$var119_bottom$jscomp$1$$ = $$jscomp$destructuring$var120_zIndex$$.bottom;
      $$jscomp$destructuring$var120_zIndex$$ = $$jscomp$destructuring$var120_zIndex$$.zIndex;
      var $opacity$$ = (0,window.parseFloat)($style$jscomp$11_top$jscomp$7$$.opacity), $transform$jscomp$2$$ = $style$jscomp$11_top$jscomp$7$$[_.$getVendorJsPropertyName$$module$src$style$$($style$jscomp$11_top$jscomp$7$$, "transform")];
      $style$jscomp$11_top$jscomp$7$$ = $style$jscomp$11_top$jscomp$7$$.top;
      $isFixed$jscomp$1_offsetWidth$$ = "fixed" === $isSticky_position$jscomp$3$$ && ($$jscomp$destructuring$var118_forceTransfer$$ || 0 < $isFixed$jscomp$1_offsetWidth$$ && 0 < $element$jscomp$180_offsetHeight$$);
      $isSticky_position$jscomp$3$$ = _.$endsWith$$module$src$string$$($isSticky_position$jscomp$3$$, "sticky");
      if ("none" === $display$$ || !$isFixed$jscomp$1_offsetWidth$$ && !$isSticky_position$jscomp$3$$) {
        $state$jscomp$30$$[$fe$jscomp$3$$.id] = {fixed:!1, sticky:!1, $transferrable$:!1, top:"", zIndex:""};
      } else {
        if ("auto" === $style$jscomp$11_top$jscomp$7$$ || $autoTops$$[$i$170_i$171_i$172_i$jscomp$115$$] !== $style$jscomp$11_top$jscomp$7$$) {
          $style$jscomp$11_top$jscomp$7$$ = $isFixed$jscomp$1_offsetWidth$$ && $isTransferrable_offsetTop$$ === $$jscomp$this$jscomp$135$$.$I$ + $$jscomp$this$jscomp$135$$.$P$ ? "0px" : "";
        }
        $isTransferrable_offsetTop$$ = !1;
        $isFixed$jscomp$1_offsetWidth$$ && ($isTransferrable_offsetTop$$ = !0 === $$jscomp$destructuring$var118_forceTransfer$$ ? !0 : !1 === $$jscomp$destructuring$var118_forceTransfer$$ ? !1 : 0 < $opacity$$ && 300 > $element$jscomp$180_offsetHeight$$ && !(!$style$jscomp$11_top$jscomp$7$$ && !$$jscomp$destructuring$var119_bottom$jscomp$1$$));
        $isTransferrable_offsetTop$$ && ($hasTransferables$$ = !0);
        $state$jscomp$30$$[$fe$jscomp$3$$.id] = {fixed:$isFixed$jscomp$1_offsetWidth$$, sticky:$isSticky_position$jscomp$3$$, $transferrable$:$isTransferrable_offsetTop$$, top:$style$jscomp$11_top$jscomp$7$$, zIndex:$$jscomp$destructuring$var120_zIndex$$, transform:$transform$jscomp$2$$};
      }
    }
  }, $mutate$:function($state$jscomp$31$$) {
    $hasTransferables$$ && $$jscomp$this$jscomp$135$$.$G$ && $JSCompiler_StaticMethods_getTransferLayer_$$($$jscomp$this$jscomp$135$$).update();
    for (var $elements$jscomp$12$$ = $$jscomp$this$jscomp$135$$.$elements_$, $i$jscomp$116$$ = 0; $i$jscomp$116$$ < $elements$jscomp$12$$.length; $i$jscomp$116$$++) {
      var $fe$jscomp$4$$ = $elements$jscomp$12$$[$i$jscomp$116$$], $feState$$ = $state$jscomp$31$$[$fe$jscomp$4$$.id];
      _.$setStyle$$module$src$style$$($fe$jscomp$4$$.element, "transition", "none");
      _.$setStyle$$module$src$style$$($fe$jscomp$4$$.element, "transition", "");
      if ($feState$$) {
        var $index$jscomp$inline_1586$$ = $i$jscomp$116$$, $element$jscomp$inline_1588$$ = $fe$jscomp$4$$.element, $oldFixed$jscomp$inline_1589$$ = $fe$jscomp$4$$.$fixedNow$;
        $fe$jscomp$4$$.$fixedNow$ = $feState$$.fixed;
        $fe$jscomp$4$$.$stickyNow$ = $feState$$.sticky;
        $fe$jscomp$4$$.top = $feState$$.fixed || $feState$$.sticky ? $feState$$.top : "";
        $fe$jscomp$4$$.transform = $feState$$.transform;
        !$oldFixed$jscomp$inline_1589$$ || $feState$$.fixed && $feState$$.$transferrable$ || !$$jscomp$this$jscomp$135$$.$D$ || $$jscomp$this$jscomp$135$$.$D$.$G$($fe$jscomp$4$$);
        $feState$$.top && ($feState$$.fixed || $feState$$.sticky) && ($feState$$.fixed || !$$jscomp$this$jscomp$135$$.$G$ ? _.$setStyle$$module$src$style$$($element$jscomp$inline_1588$$, "top", "calc(" + $feState$$.top + " + " + $$jscomp$this$jscomp$135$$.$J$ + "px)") : $$jscomp$this$jscomp$135$$.$I$ === $$jscomp$this$jscomp$135$$.$J$ ? _.$setStyle$$module$src$style$$($element$jscomp$inline_1588$$, "top", $feState$$.top) : _.$setStyle$$module$src$style$$($element$jscomp$inline_1588$$, "top", "calc(" + 
        $feState$$.top + " - " + $$jscomp$this$jscomp$135$$.$I$ + "px)"));
        $$jscomp$this$jscomp$135$$.$G$ && $feState$$.fixed && $feState$$.$transferrable$ && $JSCompiler_StaticMethods_getTransferLayer_$$($$jscomp$this$jscomp$135$$).$I$($fe$jscomp$4$$, $index$jscomp$inline_1586$$, $feState$$);
      }
    }
  }}, {}).catch(function($$jscomp$this$jscomp$135$$) {
    _.$dev$$module$src$log$$().error("FixedLayer", "Failed to mutate fixed elements:", $$jscomp$this$jscomp$135$$);
  });
};
_.$TransferLayerBody$$module$src$service$fixed_layer$$.prototype.$F$ = _.$JSCompiler_stubMethod$$(36);
_.$TransferLayerBody$$module$src$service$fixed_layer$$.prototype.update = function() {
  for (var $body$jscomp$4$$ = this.$doc_$.body, $layer$jscomp$5$$ = this.$D$, $bodyAttrs_i$176$$ = $body$jscomp$4$$.attributes, $layerAttrs$$ = $layer$jscomp$5$$.attributes, $i$jscomp$121_name$jscomp$151$$ = 0; $i$jscomp$121_name$jscomp$151$$ < $bodyAttrs_i$176$$.length; $i$jscomp$121_name$jscomp$151$$++) {
    var $attr$jscomp$6$$ = $bodyAttrs_i$176$$[$i$jscomp$121_name$jscomp$151$$];
    "style" !== $attr$jscomp$6$$.name && $layerAttrs$$.setNamedItem($attr$jscomp$6$$.cloneNode(!1));
  }
  for ($bodyAttrs_i$176$$ = 0; $bodyAttrs_i$176$$ < $layerAttrs$$.length; $bodyAttrs_i$176$$++) {
    $i$jscomp$121_name$jscomp$151$$ = $layerAttrs$$[$bodyAttrs_i$176$$].name, "style" === $i$jscomp$121_name$jscomp$151$$ || $body$jscomp$4$$.hasAttribute($i$jscomp$121_name$jscomp$151$$) || ($layer$jscomp$5$$.removeAttribute($i$jscomp$121_name$jscomp$151$$), $bodyAttrs_i$176$$--);
  }
};
_.$TransferLayerBody$$module$src$service$fixed_layer$$.prototype.$I$ = function($fe$jscomp$8$$, $index$jscomp$71$$, $state$jscomp$33$$) {
  var $element$jscomp$185$$ = $fe$jscomp$8$$.element;
  if ($element$jscomp$185$$.parentElement != this.$D$) {
    "FixedLayer";
    _.$user$$module$src$log$$().$Log$$module$src$log_prototype$warn$("FixedLayer", "In order to improve scrolling performance in Safari, we now move the element to a fixed positioning layer:", $fe$jscomp$8$$.element);
    if (!$fe$jscomp$8$$.placeholder) {
      _.$setStyle$$module$src$style$$($element$jscomp$185$$, "pointer-events", "initial");
      var $placeholder$jscomp$4$$ = $fe$jscomp$8$$.placeholder = this.$doc_$.createElement("i-amphtml-fpa");
      _.$toggle$$module$src$style$$($placeholder$jscomp$4$$, !1);
      $placeholder$jscomp$4$$.setAttribute("i-amphtml-fixedid", $fe$jscomp$8$$.id);
    }
    _.$setStyle$$module$src$style$$($element$jscomp$185$$, "zIndex", "calc(" + (10000 + $index$jscomp$71$$) + " + " + ($state$jscomp$33$$.zIndex || 0) + ")");
    $element$jscomp$185$$.parentElement.replaceChild($fe$jscomp$8$$.placeholder, $element$jscomp$185$$);
    this.$D$.appendChild($element$jscomp$185$$);
    $fe$jscomp$8$$.$selectors$.some(function($fe$jscomp$8$$) {
      try {
        var $index$jscomp$71$$ = _.$matches$$module$src$dom$$($element$jscomp$185$$, $fe$jscomp$8$$);
      } catch ($e$jscomp$inline_1612$$) {
        _.$dev$$module$src$log$$().error("FixedLayer", "Failed to test query match:", $e$jscomp$inline_1612$$), $index$jscomp$71$$ = !1;
      }
      return $index$jscomp$71$$;
    }) || (_.$user$$module$src$log$$().$Log$$module$src$log_prototype$warn$("FixedLayer", "Failed to move the element to the fixed position layer. This is most likely due to the compound CSS selector:", $fe$jscomp$8$$.element), this.$G$($fe$jscomp$8$$));
  }
};
_.$TransferLayerBody$$module$src$service$fixed_layer$$.prototype.$G$ = function($fe$jscomp$9$$) {
  $fe$jscomp$9$$.placeholder && this.$doc_$.contains($fe$jscomp$9$$.placeholder) && ("FixedLayer", this.$doc_$.contains($fe$jscomp$9$$.element) ? (_.$setStyle$$module$src$style$$($fe$jscomp$9$$.element, "zIndex", ""), $fe$jscomp$9$$.placeholder.parentElement.replaceChild($fe$jscomp$9$$.element, $fe$jscomp$9$$.placeholder)) : $fe$jscomp$9$$.placeholder.parentElement.removeChild($fe$jscomp$9$$.placeholder));
};
_.$TransferLayerShadow$$module$src$service$fixed_layer$$.prototype.$F$ = _.$JSCompiler_stubMethod$$(35);
_.$TransferLayerShadow$$module$src$service$fixed_layer$$.prototype.update = function() {
};
_.$TransferLayerShadow$$module$src$service$fixed_layer$$.prototype.$I$ = function($fe$jscomp$10$$) {
  var $element$jscomp$187$$ = $fe$jscomp$10$$.element;
  "FixedLayer";
  _.$user$$module$src$log$$().$Log$$module$src$log_prototype$warn$("FixedLayer", "In order to improve scrolling performance in Safari, we now move the element to a fixed positioning layer:", $fe$jscomp$10$$.element);
  $element$jscomp$187$$.setAttribute("slot", "i-amphtml-fixed");
};
_.$TransferLayerShadow$$module$src$service$fixed_layer$$.prototype.$G$ = function($fe$jscomp$11$$) {
  "FixedLayer";
  $fe$jscomp$11$$.element.removeAttribute("slot");
};
var $_template$$module$src$service$viewport$viewport_binding_ios_embed_sd$$ = ["<div id=i-amphtml-scroller><div id=i-amphtml-body-wrapper><slot></slot></div></div>"], $INHERIT_STYLES$$module$src$service$viewport$viewport_binding_ios_embed_sd$$ = "align-content align-items align-self alignment-baseline backface-visibility box-sizing column-count column-fill column-gap column-rule column-span column-width columns display flex flex-basis flex-direction flex-flow flex-grow flex-shrink flex-wrap gap grid grid-area grid-auto-columns grid-auto-flow grid-auto-rows grid-column grid-gap grid-row grid-template justify-content justify-items justify-self margin order padding perspective perspective-origin place-content place-items place-self table-layout".split(" ");
_.$JSCompiler_prototypeAlias$$ = _.$ViewportBindingIosEmbedShadowRoot_$$module$src$service$viewport$viewport_binding_ios_embed_sd$$.prototype;
_.$JSCompiler_prototypeAlias$$.$ViewportBindingDef$$module$src$service$viewport$viewport_binding_def_prototype$ensureReadyForElements$ = function() {
  this.$ViewportBindingIosEmbedShadowRoot_$$module$src$service$viewport$viewport_binding_ios_embed_sd_prototype$setup_$();
};
_.$JSCompiler_prototypeAlias$$.$ViewportBindingIosEmbedShadowRoot_$$module$src$service$viewport$viewport_binding_ios_embed_sd_prototype$setup_$ = function() {
  if (!this.$R$) {
    this.$R$ = !0;
    var $body$jscomp$5$$ = this.$win$.document.body;
    $body$jscomp$5$$.attachShadow({mode:"open"}).appendChild(this.$D$);
    this.$updateBodyStyles_$();
    this.$win$.MutationObserver && (new this.$win$.MutationObserver(this.$updateBodyStyles_$.bind(this))).observe($body$jscomp$5$$, {attributes:!0});
    this.$ViewportBindingIosEmbedShadowRoot_$$module$src$service$viewport$viewport_binding_ios_embed_sd_prototype$onScrolled_$();
  }
};
_.$JSCompiler_prototypeAlias$$.$updateBodyStyles_$ = function() {
  var $$jscomp$this$jscomp$138$$ = this;
  if (!this.$G$) {
    var $body$jscomp$6$$ = this.$win$.document.body;
    if ($body$jscomp$6$$) {
      var $inheritStyles$$ = {};
      this.$G$ = !0;
      _.$JSCompiler_StaticMethods_Vsync$$module$src$service$vsync_impl_prototype$run$$(this.$vsync_$, {measure:function() {
        var $bodyStyles$$ = _.$computedStyle$$module$src$style$$($$jscomp$this$jscomp$138$$.$win$, $body$jscomp$6$$);
        $INHERIT_STYLES$$module$src$service$viewport$viewport_binding_ios_embed_sd$$.forEach(function($$jscomp$this$jscomp$138$$) {
          $inheritStyles$$[$$jscomp$this$jscomp$138$$] = $bodyStyles$$[$$jscomp$this$jscomp$138$$] || "";
        });
      }, $mutate$:function() {
        $$jscomp$this$jscomp$138$$.$G$ = !1;
        _.$setImportantStyles$$module$src$style$$($$jscomp$this$jscomp$138$$.$F$, _.$assertDoesNotContainDisplay$$module$src$style$$($inheritStyles$$));
      }});
    }
  }
};
_.$JSCompiler_prototypeAlias$$.$onResized_$ = function() {
  this.$O$.$fire$();
  this.$updateBodyStyles_$();
};
_.$JSCompiler_prototypeAlias$$.$ViewportBindingDef$$module$src$service$viewport$viewport_binding_def_prototype$connect$ = function() {
  this.$win$.addEventListener("resize", this.$I$);
  this.$D$.addEventListener("scroll", this.$J$);
};
_.$JSCompiler_prototypeAlias$$.disconnect = function() {
  this.$win$.removeEventListener("resize", this.$I$);
  this.$D$.removeEventListener("scroll", this.$J$);
};
_.$JSCompiler_prototypeAlias$$.$getBorderTop$ = function() {
  return 1;
};
_.$JSCompiler_prototypeAlias$$.$requiresFixedLayerTransfer$ = function() {
  return !_.$isExperimentOn$$module$src$experiments$$(this.$win$, "ios-embed-sd-notransfer");
};
_.$JSCompiler_prototypeAlias$$.$ViewportBindingDef$$module$src$service$viewport$viewport_binding_def_prototype$supportsPositionFixed$ = function() {
  return !0;
};
_.$JSCompiler_prototypeAlias$$.$ViewportBindingDef$$module$src$service$viewport$viewport_binding_def_prototype$onScroll$ = function($callback$jscomp$83$$) {
  this.$P$.add($callback$jscomp$83$$);
};
_.$JSCompiler_prototypeAlias$$.$ViewportBindingDef$$module$src$service$viewport$viewport_binding_def_prototype$onResize$ = function($callback$jscomp$84$$) {
  this.$O$.add($callback$jscomp$84$$);
};
_.$JSCompiler_prototypeAlias$$.$ViewportBindingDef$$module$src$service$viewport$viewport_binding_def_prototype$updatePaddingTop$ = function($paddingTop$jscomp$2$$) {
  this.$K$ = $paddingTop$jscomp$2$$;
  _.$setImportantStyles$$module$src$style$$(this.$D$, {"padding-top":_.$px$$module$src$style$$($paddingTop$jscomp$2$$)});
};
_.$JSCompiler_prototypeAlias$$.$hideViewerHeader$ = function($transient$$) {
  $transient$$ || this.$ViewportBindingDef$$module$src$service$viewport$viewport_binding_def_prototype$updatePaddingTop$(0);
};
_.$JSCompiler_prototypeAlias$$.$showViewerHeader$ = function($transient$jscomp$1$$, $paddingTop$jscomp$3$$) {
  $transient$jscomp$1$$ || this.$ViewportBindingDef$$module$src$service$viewport$viewport_binding_def_prototype$updatePaddingTop$($paddingTop$jscomp$3$$);
};
_.$JSCompiler_prototypeAlias$$.$ViewportBindingDef$$module$src$service$viewport$viewport_binding_def_prototype$disableScroll$ = function() {
  _.$setImportantStyles$$module$src$style$$(this.$D$, {"overflow-y":"hidden", position:"fixed"});
};
_.$JSCompiler_prototypeAlias$$.$ViewportBindingDef$$module$src$service$viewport$viewport_binding_def_prototype$resetScroll$ = function() {
  _.$setImportantStyles$$module$src$style$$(this.$D$, {"overflow-y":"auto", position:"absolute"});
};
_.$JSCompiler_prototypeAlias$$.$updateLightboxMode$ = _.$JSCompiler_stubMethod$$(39);
_.$JSCompiler_prototypeAlias$$.$getSize$ = function() {
  return {width:this.$win$.innerWidth, height:this.$win$.innerHeight};
};
_.$JSCompiler_prototypeAlias$$.$ViewportBindingDef$$module$src$service$viewport$viewport_binding_def_prototype$getScrollTop$ = function() {
  return this.$D$.scrollTop;
};
_.$JSCompiler_prototypeAlias$$.getScrollLeft = function() {
  return 0;
};
_.$JSCompiler_prototypeAlias$$.getScrollWidth = function() {
  return this.$D$.scrollWidth;
};
_.$JSCompiler_prototypeAlias$$.$getScrollHeight$ = function() {
  return this.$D$.scrollHeight;
};
_.$JSCompiler_prototypeAlias$$.$ViewportBindingDef$$module$src$service$viewport$viewport_binding_def_prototype$getContentHeight$ = function() {
  var $scrollingElement$jscomp$2_style$jscomp$13$$ = this.$F$, $rect$jscomp$8$$ = $scrollingElement$jscomp$2_style$jscomp$13$$.getBoundingClientRect();
  $scrollingElement$jscomp$2_style$jscomp$13$$ = _.$computedStyle$$module$src$style$$(this.$win$, $scrollingElement$jscomp$2_style$jscomp$13$$);
  return $rect$jscomp$8$$.height + this.$K$ + this.$getBorderTop$() + (0,window.parseInt)($scrollingElement$jscomp$2_style$jscomp$13$$.marginTop, 10) + (0,window.parseInt)($scrollingElement$jscomp$2_style$jscomp$13$$.marginBottom, 10);
};
_.$JSCompiler_prototypeAlias$$.$ViewportBindingDef$$module$src$service$viewport$viewport_binding_def_prototype$contentHeightChanged$ = function() {
  var $$jscomp$this$jscomp$139$$ = this;
  _.$isExperimentOn$$module$src$experiments$$(this.$win$, "scroll-height-bounce") && this.$vsync_$.$mutate$(function() {
    _.$setImportantStyles$$module$src$style$$($$jscomp$this$jscomp$139$$.$D$, {"-webkit-overflow-scrolling":"auto"});
    $$jscomp$this$jscomp$139$$.$vsync_$.$mutate$(function() {
      _.$setImportantStyles$$module$src$style$$($$jscomp$this$jscomp$139$$.$D$, {"-webkit-overflow-scrolling":"touch"});
    });
  });
};
_.$JSCompiler_prototypeAlias$$.$getLayoutRect$ = function($b$jscomp$4_el$jscomp$17$$, $opt_scrollLeft_scrollLeft$jscomp$1$$, $opt_scrollTop_scrollTop$jscomp$1$$) {
  $b$jscomp$4_el$jscomp$17$$ = $b$jscomp$4_el$jscomp$17$$.getBoundingClientRect();
  if (this.$useLayers_$) {
    return _.$layoutRectLtwh$$module$src$layout_rect$$($b$jscomp$4_el$jscomp$17$$.left, $b$jscomp$4_el$jscomp$17$$.top, $b$jscomp$4_el$jscomp$17$$.width, $b$jscomp$4_el$jscomp$17$$.height);
  }
  $opt_scrollTop_scrollTop$jscomp$1$$ = void 0 != $opt_scrollTop_scrollTop$jscomp$1$$ ? $opt_scrollTop_scrollTop$jscomp$1$$ : this.$ViewportBindingDef$$module$src$service$viewport$viewport_binding_def_prototype$getScrollTop$();
  $opt_scrollLeft_scrollLeft$jscomp$1$$ = void 0 != $opt_scrollLeft_scrollLeft$jscomp$1$$ ? $opt_scrollLeft_scrollLeft$jscomp$1$$ : this.getScrollLeft();
  return _.$layoutRectLtwh$$module$src$layout_rect$$(Math.round($b$jscomp$4_el$jscomp$17$$.left + $opt_scrollLeft_scrollLeft$jscomp$1$$), Math.round($b$jscomp$4_el$jscomp$17$$.top + $opt_scrollTop_scrollTop$jscomp$1$$), Math.round($b$jscomp$4_el$jscomp$17$$.width), Math.round($b$jscomp$4_el$jscomp$17$$.height));
};
_.$JSCompiler_prototypeAlias$$.$getRootClientRectAsync$ = _.$JSCompiler_stubMethod$$(42);
_.$JSCompiler_prototypeAlias$$.$ViewportBindingDef$$module$src$service$viewport$viewport_binding_def_prototype$setScrollTop$ = function($scrollTop$jscomp$2$$) {
  this.$D$.scrollTop = $scrollTop$jscomp$2$$ || 1;
};
_.$JSCompiler_prototypeAlias$$.$ViewportBindingIosEmbedShadowRoot_$$module$src$service$viewport$viewport_binding_ios_embed_sd_prototype$onScrolled_$ = function($opt_event$jscomp$1$$) {
  0 == this.$D$.scrollTop && (this.$D$.scrollTop = 1, $opt_event$jscomp$1$$ && $opt_event$jscomp$1$$.preventDefault());
  $opt_event$jscomp$1$$ && this.$P$.$fire$();
};
_.$JSCompiler_prototypeAlias$$.$ViewportBindingDef$$module$src$service$viewport$viewport_binding_def_prototype$getScrollingElement$ = function() {
  return this.$D$;
};
_.$JSCompiler_prototypeAlias$$.$getScrollingElementScrollsLikeViewport$ = function() {
  return !1;
};
_.$JSCompiler_prototypeAlias$$ = _.$ViewportBindingIosEmbedWrapper_$$module$src$service$viewport$viewport_binding_ios_embed_wrapper$$.prototype;
_.$JSCompiler_prototypeAlias$$.$ViewportBindingDef$$module$src$service$viewport$viewport_binding_def_prototype$ensureReadyForElements$ = function() {
  this.$ViewportBindingIosEmbedWrapper_$$module$src$service$viewport$viewport_binding_ios_embed_wrapper_prototype$setup_$();
};
_.$JSCompiler_prototypeAlias$$.$ViewportBindingIosEmbedWrapper_$$module$src$service$viewport$viewport_binding_ios_embed_wrapper_prototype$setup_$ = function() {
  if (!this.$O$) {
    this.$O$ = !0;
    var $doc$jscomp$40$$ = this.$win$.document, $body$jscomp$7$$ = $doc$jscomp$40$$.body;
    $doc$jscomp$40$$.documentElement.appendChild(this.$D$);
    this.$D$.appendChild($body$jscomp$7$$);
    Object.defineProperty($doc$jscomp$40$$, "body", {get:function() {
      return $body$jscomp$7$$;
    }});
    this.$ViewportBindingIosEmbedWrapper_$$module$src$service$viewport$viewport_binding_ios_embed_wrapper_prototype$onScrolled_$();
  }
};
_.$JSCompiler_prototypeAlias$$.$ViewportBindingDef$$module$src$service$viewport$viewport_binding_def_prototype$connect$ = function() {
  this.$win$.addEventListener("resize", this.$F$);
  this.$D$.addEventListener("scroll", this.$G$);
};
_.$JSCompiler_prototypeAlias$$.disconnect = function() {
  this.$win$.removeEventListener("resize", this.$F$);
  this.$D$.removeEventListener("scroll", this.$G$);
};
_.$JSCompiler_prototypeAlias$$.$getBorderTop$ = function() {
  return 1;
};
_.$JSCompiler_prototypeAlias$$.$requiresFixedLayerTransfer$ = function() {
  return !0;
};
_.$JSCompiler_prototypeAlias$$.$ViewportBindingDef$$module$src$service$viewport$viewport_binding_def_prototype$supportsPositionFixed$ = function() {
  return !0;
};
_.$JSCompiler_prototypeAlias$$.$ViewportBindingDef$$module$src$service$viewport$viewport_binding_def_prototype$onScroll$ = function($callback$jscomp$85$$) {
  this.$K$.add($callback$jscomp$85$$);
};
_.$JSCompiler_prototypeAlias$$.$ViewportBindingDef$$module$src$service$viewport$viewport_binding_def_prototype$onResize$ = function($callback$jscomp$86$$) {
  this.$J$.add($callback$jscomp$86$$);
};
_.$JSCompiler_prototypeAlias$$.$ViewportBindingDef$$module$src$service$viewport$viewport_binding_def_prototype$updatePaddingTop$ = function($paddingTop$jscomp$4$$) {
  this.$I$ = $paddingTop$jscomp$4$$;
  _.$setImportantStyles$$module$src$style$$(this.$D$, {"padding-top":_.$px$$module$src$style$$($paddingTop$jscomp$4$$)});
};
_.$JSCompiler_prototypeAlias$$.$hideViewerHeader$ = function($transient$jscomp$2$$) {
  $transient$jscomp$2$$ || this.$ViewportBindingDef$$module$src$service$viewport$viewport_binding_def_prototype$updatePaddingTop$(0);
};
_.$JSCompiler_prototypeAlias$$.$showViewerHeader$ = function($transient$jscomp$3$$, $paddingTop$jscomp$5$$) {
  $transient$jscomp$3$$ || this.$ViewportBindingDef$$module$src$service$viewport$viewport_binding_def_prototype$updatePaddingTop$($paddingTop$jscomp$5$$);
};
_.$JSCompiler_prototypeAlias$$.$ViewportBindingDef$$module$src$service$viewport$viewport_binding_def_prototype$disableScroll$ = function() {
  this.$D$.classList.add("i-amphtml-scroll-disabled");
};
_.$JSCompiler_prototypeAlias$$.$ViewportBindingDef$$module$src$service$viewport$viewport_binding_def_prototype$resetScroll$ = function() {
  this.$D$.classList.remove("i-amphtml-scroll-disabled");
};
_.$JSCompiler_prototypeAlias$$.$updateLightboxMode$ = _.$JSCompiler_stubMethod$$(38);
_.$JSCompiler_prototypeAlias$$.$getSize$ = function() {
  return {width:this.$win$.innerWidth, height:this.$win$.innerHeight};
};
_.$JSCompiler_prototypeAlias$$.$ViewportBindingDef$$module$src$service$viewport$viewport_binding_def_prototype$getScrollTop$ = function() {
  return this.$D$.scrollTop;
};
_.$JSCompiler_prototypeAlias$$.getScrollLeft = function() {
  return 0;
};
_.$JSCompiler_prototypeAlias$$.getScrollWidth = function() {
  return this.$D$.scrollWidth;
};
_.$JSCompiler_prototypeAlias$$.$getScrollHeight$ = function() {
  return this.$D$.scrollHeight;
};
_.$JSCompiler_prototypeAlias$$.$ViewportBindingDef$$module$src$service$viewport$viewport_binding_def_prototype$getContentHeight$ = function() {
  var $scrollingElement$jscomp$3_style$jscomp$14$$ = this.$win$.document.body, $rect$jscomp$9$$ = $scrollingElement$jscomp$3_style$jscomp$14$$.getBoundingClientRect();
  $scrollingElement$jscomp$3_style$jscomp$14$$ = _.$computedStyle$$module$src$style$$(this.$win$, $scrollingElement$jscomp$3_style$jscomp$14$$);
  return $rect$jscomp$9$$.height + this.$I$ + (0,window.parseInt)($scrollingElement$jscomp$3_style$jscomp$14$$.marginTop, 10) + (0,window.parseInt)($scrollingElement$jscomp$3_style$jscomp$14$$.marginBottom, 10);
};
_.$JSCompiler_prototypeAlias$$.$ViewportBindingDef$$module$src$service$viewport$viewport_binding_def_prototype$contentHeightChanged$ = function() {
  var $$jscomp$this$jscomp$141$$ = this;
  if (_.$isExperimentOn$$module$src$experiments$$(this.$win$, "scroll-height-bounce")) {
    var $documentElement$jscomp$5$$ = this.$win$.document.documentElement;
    this.$vsync_$.$mutate$(function() {
      $documentElement$jscomp$5$$.classList.remove("i-amphtml-ios-overscroll");
      $$jscomp$this$jscomp$141$$.$vsync_$.$mutate$(function() {
        $documentElement$jscomp$5$$.classList.add("i-amphtml-ios-overscroll");
      });
    });
  }
};
_.$JSCompiler_prototypeAlias$$.$getLayoutRect$ = function($b$jscomp$5_el$jscomp$18$$, $opt_scrollLeft$jscomp$1_scrollLeft$jscomp$2$$, $opt_scrollTop$jscomp$1_scrollTop$jscomp$3$$) {
  $b$jscomp$5_el$jscomp$18$$ = $b$jscomp$5_el$jscomp$18$$.getBoundingClientRect();
  if (this.$useLayers_$) {
    return _.$layoutRectLtwh$$module$src$layout_rect$$($b$jscomp$5_el$jscomp$18$$.left, $b$jscomp$5_el$jscomp$18$$.top, $b$jscomp$5_el$jscomp$18$$.width, $b$jscomp$5_el$jscomp$18$$.height);
  }
  $opt_scrollTop$jscomp$1_scrollTop$jscomp$3$$ = void 0 != $opt_scrollTop$jscomp$1_scrollTop$jscomp$3$$ ? $opt_scrollTop$jscomp$1_scrollTop$jscomp$3$$ : this.$ViewportBindingDef$$module$src$service$viewport$viewport_binding_def_prototype$getScrollTop$();
  $opt_scrollLeft$jscomp$1_scrollLeft$jscomp$2$$ = void 0 != $opt_scrollLeft$jscomp$1_scrollLeft$jscomp$2$$ ? $opt_scrollLeft$jscomp$1_scrollLeft$jscomp$2$$ : this.getScrollLeft();
  return _.$layoutRectLtwh$$module$src$layout_rect$$(Math.round($b$jscomp$5_el$jscomp$18$$.left + $opt_scrollLeft$jscomp$1_scrollLeft$jscomp$2$$), Math.round($b$jscomp$5_el$jscomp$18$$.top + $opt_scrollTop$jscomp$1_scrollTop$jscomp$3$$), Math.round($b$jscomp$5_el$jscomp$18$$.width), Math.round($b$jscomp$5_el$jscomp$18$$.height));
};
_.$JSCompiler_prototypeAlias$$.$getRootClientRectAsync$ = _.$JSCompiler_stubMethod$$(41);
_.$JSCompiler_prototypeAlias$$.$ViewportBindingDef$$module$src$service$viewport$viewport_binding_def_prototype$setScrollTop$ = function($scrollTop$jscomp$4$$) {
  this.$D$.scrollTop = $scrollTop$jscomp$4$$ || 1;
};
_.$JSCompiler_prototypeAlias$$.$ViewportBindingIosEmbedWrapper_$$module$src$service$viewport$viewport_binding_ios_embed_wrapper_prototype$onScrolled_$ = function($opt_event$jscomp$2$$) {
  0 == this.$D$.scrollTop && (this.$D$.scrollTop = 1, $opt_event$jscomp$2$$ && $opt_event$jscomp$2$$.preventDefault());
  $opt_event$jscomp$2$$ && this.$K$.$fire$();
};
_.$JSCompiler_prototypeAlias$$.$ViewportBindingDef$$module$src$service$viewport$viewport_binding_def_prototype$getScrollingElement$ = function() {
  return this.$D$;
};
_.$JSCompiler_prototypeAlias$$.$getScrollingElementScrollsLikeViewport$ = function() {
  return !1;
};
_.$JSCompiler_prototypeAlias$$ = _.$ViewportBindingNatural_$$module$src$service$viewport$viewport_binding_natural$$.prototype;
_.$JSCompiler_prototypeAlias$$.$ViewportBindingDef$$module$src$service$viewport$viewport_binding_def_prototype$connect$ = function() {
  this.$win$.addEventListener("scroll", this.$F$);
  this.$win$.addEventListener("resize", this.$D$);
};
_.$JSCompiler_prototypeAlias$$.disconnect = function() {
  this.$win$.removeEventListener("scroll", this.$F$);
  this.$win$.removeEventListener("resize", this.$D$);
};
_.$JSCompiler_prototypeAlias$$.$ViewportBindingDef$$module$src$service$viewport$viewport_binding_def_prototype$ensureReadyForElements$ = function() {
};
_.$JSCompiler_prototypeAlias$$.$getBorderTop$ = function() {
  return 0;
};
_.$JSCompiler_prototypeAlias$$.$requiresFixedLayerTransfer$ = function() {
  return !1;
};
_.$JSCompiler_prototypeAlias$$.$ViewportBindingDef$$module$src$service$viewport$viewport_binding_def_prototype$supportsPositionFixed$ = function() {
  return !0;
};
_.$JSCompiler_prototypeAlias$$.$ViewportBindingDef$$module$src$service$viewport$viewport_binding_def_prototype$onScroll$ = function($callback$jscomp$87$$) {
  this.$J$.add($callback$jscomp$87$$);
};
_.$JSCompiler_prototypeAlias$$.$ViewportBindingDef$$module$src$service$viewport$viewport_binding_def_prototype$onResize$ = function($callback$jscomp$88$$) {
  this.$I$.add($callback$jscomp$88$$);
};
_.$JSCompiler_prototypeAlias$$.$ViewportBindingDef$$module$src$service$viewport$viewport_binding_def_prototype$updatePaddingTop$ = function($paddingTop$jscomp$6$$) {
  this.$G$ = $paddingTop$jscomp$6$$;
  _.$setImportantStyles$$module$src$style$$(this.$win$.document.documentElement, {"padding-top":_.$px$$module$src$style$$($paddingTop$jscomp$6$$)});
};
_.$JSCompiler_prototypeAlias$$.$hideViewerHeader$ = function($transient$jscomp$4$$) {
  $transient$jscomp$4$$ || this.$ViewportBindingDef$$module$src$service$viewport$viewport_binding_def_prototype$updatePaddingTop$(0);
};
_.$JSCompiler_prototypeAlias$$.$showViewerHeader$ = function($transient$jscomp$5$$, $paddingTop$jscomp$7$$) {
  $transient$jscomp$5$$ || this.$ViewportBindingDef$$module$src$service$viewport$viewport_binding_def_prototype$updatePaddingTop$($paddingTop$jscomp$7$$);
};
_.$JSCompiler_prototypeAlias$$.$ViewportBindingDef$$module$src$service$viewport$viewport_binding_def_prototype$disableScroll$ = function() {
  this.$win$.document.documentElement.classList.add("i-amphtml-scroll-disabled");
};
_.$JSCompiler_prototypeAlias$$.$ViewportBindingDef$$module$src$service$viewport$viewport_binding_def_prototype$resetScroll$ = function() {
  this.$win$.document.documentElement.classList.remove("i-amphtml-scroll-disabled");
};
_.$JSCompiler_prototypeAlias$$.$updateLightboxMode$ = _.$JSCompiler_stubMethod$$(37);
_.$JSCompiler_prototypeAlias$$.$getSize$ = function() {
  var $el$jscomp$19_winWidth$$ = this.$win$.innerWidth, $winHeight$$ = this.$win$.innerHeight;
  if ($el$jscomp$19_winWidth$$ && $winHeight$$) {
    return {width:$el$jscomp$19_winWidth$$, height:$winHeight$$};
  }
  $el$jscomp$19_winWidth$$ = this.$win$.document.documentElement;
  return {width:$el$jscomp$19_winWidth$$.clientWidth, height:$el$jscomp$19_winWidth$$.clientHeight};
};
_.$JSCompiler_prototypeAlias$$.$ViewportBindingDef$$module$src$service$viewport$viewport_binding_def_prototype$getScrollTop$ = function() {
  var $pageScrollTop$$ = this.$ViewportBindingDef$$module$src$service$viewport$viewport_binding_def_prototype$getScrollingElement$().scrollTop || this.$win$.pageYOffset, $host$jscomp$1$$ = this.ampdoc.getRootNode().host;
  return $host$jscomp$1$$ ? $pageScrollTop$$ - $host$jscomp$1$$.offsetTop : $pageScrollTop$$;
};
_.$JSCompiler_prototypeAlias$$.getScrollLeft = function() {
  return 0;
};
_.$JSCompiler_prototypeAlias$$.getScrollWidth = function() {
  return this.$ViewportBindingDef$$module$src$service$viewport$viewport_binding_def_prototype$getScrollingElement$().scrollWidth;
};
_.$JSCompiler_prototypeAlias$$.$getScrollHeight$ = function() {
  return this.$ViewportBindingDef$$module$src$service$viewport$viewport_binding_def_prototype$getScrollingElement$().scrollHeight;
};
_.$JSCompiler_prototypeAlias$$.$ViewportBindingDef$$module$src$service$viewport$viewport_binding_def_prototype$getContentHeight$ = function() {
  var $scrollingElement$jscomp$4$$ = this.$ViewportBindingDef$$module$src$service$viewport$viewport_binding_def_prototype$getScrollingElement$(), $rect$jscomp$10$$ = $scrollingElement$jscomp$4$$.getBoundingClientRect(), $style$jscomp$15$$ = _.$computedStyle$$module$src$style$$(this.$win$, $scrollingElement$jscomp$4$$), $paddingTop$jscomp$8$$ = 0;
  $scrollingElement$jscomp$4$$ !== this.$win$.document.documentElement && ($paddingTop$jscomp$8$$ = this.$G$);
  return $rect$jscomp$10$$.height + $paddingTop$jscomp$8$$ + (0,window.parseInt)($style$jscomp$15$$.marginTop, 10) + (0,window.parseInt)($style$jscomp$15$$.marginBottom, 10);
};
_.$JSCompiler_prototypeAlias$$.$ViewportBindingDef$$module$src$service$viewport$viewport_binding_def_prototype$contentHeightChanged$ = function() {
};
_.$JSCompiler_prototypeAlias$$.$getLayoutRect$ = function($b$jscomp$6_el$jscomp$20$$, $opt_scrollLeft$jscomp$2_scrollLeft$jscomp$3$$, $opt_scrollTop$jscomp$2_scrollTop$jscomp$5$$) {
  $b$jscomp$6_el$jscomp$20$$ = $b$jscomp$6_el$jscomp$20$$.getBoundingClientRect();
  if (this.$useLayers_$) {
    return _.$layoutRectLtwh$$module$src$layout_rect$$($b$jscomp$6_el$jscomp$20$$.left, $b$jscomp$6_el$jscomp$20$$.top, $b$jscomp$6_el$jscomp$20$$.width, $b$jscomp$6_el$jscomp$20$$.height);
  }
  $opt_scrollTop$jscomp$2_scrollTop$jscomp$5$$ = void 0 != $opt_scrollTop$jscomp$2_scrollTop$jscomp$5$$ ? $opt_scrollTop$jscomp$2_scrollTop$jscomp$5$$ : this.$ViewportBindingDef$$module$src$service$viewport$viewport_binding_def_prototype$getScrollTop$();
  $opt_scrollLeft$jscomp$2_scrollLeft$jscomp$3$$ = void 0 != $opt_scrollLeft$jscomp$2_scrollLeft$jscomp$3$$ ? $opt_scrollLeft$jscomp$2_scrollLeft$jscomp$3$$ : this.getScrollLeft();
  return _.$layoutRectLtwh$$module$src$layout_rect$$(Math.round($b$jscomp$6_el$jscomp$20$$.left + $opt_scrollLeft$jscomp$2_scrollLeft$jscomp$3$$), Math.round($b$jscomp$6_el$jscomp$20$$.top + $opt_scrollTop$jscomp$2_scrollTop$jscomp$5$$), Math.round($b$jscomp$6_el$jscomp$20$$.width), Math.round($b$jscomp$6_el$jscomp$20$$.height));
};
_.$JSCompiler_prototypeAlias$$.$getRootClientRectAsync$ = _.$JSCompiler_stubMethod$$(40);
_.$JSCompiler_prototypeAlias$$.$ViewportBindingDef$$module$src$service$viewport$viewport_binding_def_prototype$setScrollTop$ = function($scrollTop$jscomp$6$$) {
  this.$ViewportBindingDef$$module$src$service$viewport$viewport_binding_def_prototype$getScrollingElement$().scrollTop = $scrollTop$jscomp$6$$;
};
_.$JSCompiler_prototypeAlias$$.$ViewportBindingDef$$module$src$service$viewport$viewport_binding_def_prototype$getScrollingElement$ = function() {
  var $JSCompiler_temp$jscomp$481_doc$jscomp$42$$ = this.$win$.document;
  if ($JSCompiler_temp$jscomp$481_doc$jscomp$42$$.scrollingElement) {
    $JSCompiler_temp$jscomp$481_doc$jscomp$42$$ = $JSCompiler_temp$jscomp$481_doc$jscomp$42$$.scrollingElement;
  } else {
    var $JSCompiler_StaticMethods_isWebKit$self$jscomp$inline_1614_JSCompiler_temp$jscomp$482$$;
    if ($JSCompiler_StaticMethods_isWebKit$self$jscomp$inline_1614_JSCompiler_temp$jscomp$482$$ = $JSCompiler_temp$jscomp$481_doc$jscomp$42$$.body) {
      $JSCompiler_StaticMethods_isWebKit$self$jscomp$inline_1614_JSCompiler_temp$jscomp$482$$ = this.$platform_$, $JSCompiler_StaticMethods_isWebKit$self$jscomp$inline_1614_JSCompiler_temp$jscomp$482$$ = /WebKit/i.test($JSCompiler_StaticMethods_isWebKit$self$jscomp$inline_1614_JSCompiler_temp$jscomp$482$$.$D$.userAgent) && !_.$JSCompiler_StaticMethods_isEdge$$($JSCompiler_StaticMethods_isWebKit$self$jscomp$inline_1614_JSCompiler_temp$jscomp$482$$);
    }
    $JSCompiler_temp$jscomp$481_doc$jscomp$42$$ = $JSCompiler_StaticMethods_isWebKit$self$jscomp$inline_1614_JSCompiler_temp$jscomp$482$$ ? $JSCompiler_temp$jscomp$481_doc$jscomp$42$$.body : $JSCompiler_temp$jscomp$481_doc$jscomp$42$$.documentElement;
  }
  return $JSCompiler_temp$jscomp$481_doc$jscomp$42$$;
};
_.$JSCompiler_prototypeAlias$$.$getScrollingElementScrollsLikeViewport$ = function() {
  return !0;
};
_.$JSCompiler_prototypeAlias$$ = _.$Viewport$$module$src$service$viewport$viewport_impl$$.prototype;
_.$JSCompiler_prototypeAlias$$.$dispose$ = function() {
  this.$D$.disconnect();
};
_.$JSCompiler_prototypeAlias$$.$Viewport$$module$src$service$viewport$viewport_impl_prototype$updateVisibility_$ = function() {
  var $visible$jscomp$4$$ = _.$JSCompiler_StaticMethods_Viewer$$module$src$service$viewer_impl_prototype$isVisible$$(this.$viewer_$);
  $visible$jscomp$4$$ != this.$visible_$ && ((this.$visible_$ = $visible$jscomp$4$$) ? (this.$D$.$ViewportBindingDef$$module$src$service$viewport$viewport_binding_def_prototype$connect$(), this.$size_$ && this.$resize_$()) : this.$D$.disconnect());
};
_.$JSCompiler_prototypeAlias$$.getScrollLeft = function() {
  null == this.$R$ && (this.$R$ = this.$D$.getScrollLeft());
  return this.$R$;
};
_.$JSCompiler_prototypeAlias$$.$getSize$ = function() {
  if (this.$size_$) {
    return this.$size_$;
  }
  this.$size_$ = this.$D$.$getSize$();
  if (0 == this.$size_$.width || 0 == this.$size_$.height) {
    var $visibilityState$$ = this.$viewer_$.$G$;
    ("prerender" == $visibilityState$$ || "visible" == $visibilityState$$) && 0.01 > Math.random() && _.$dev$$module$src$log$$().error("Viewport", "viewport has zero dimensions");
  }
  return this.$size_$;
};
_.$JSCompiler_prototypeAlias$$.getWidth = function() {
  return this.$getSize$().width;
};
_.$JSCompiler_prototypeAlias$$.getScrollWidth = function() {
  return this.$D$.getScrollWidth();
};
_.$JSCompiler_prototypeAlias$$.$getScrollHeight$ = function() {
  return this.$D$.$getScrollHeight$();
};
_.$JSCompiler_prototypeAlias$$.$getLayoutRect$ = function($b$jscomp$7_el$jscomp$21$$) {
  var $c$jscomp$4_scrollLeft$jscomp$5$$ = this.getScrollLeft(), $scrollTop$jscomp$8$$ = _.$JSCompiler_StaticMethods_Viewport$$module$src$service$viewport$viewport_impl_prototype$getScrollTop$$(this), $frameElement$jscomp$3$$ = _.$getParentWindowFrameElement$$module$src$service$$($b$jscomp$7_el$jscomp$21$$, this.ampdoc.$win$);
  return $frameElement$jscomp$3$$ ? ($b$jscomp$7_el$jscomp$21$$ = this.$D$.$getLayoutRect$($b$jscomp$7_el$jscomp$21$$, 0, 0), $c$jscomp$4_scrollLeft$jscomp$5$$ = this.$D$.$getLayoutRect$($frameElement$jscomp$3$$, $c$jscomp$4_scrollLeft$jscomp$5$$, $scrollTop$jscomp$8$$), _.$layoutRectLtwh$$module$src$layout_rect$$(Math.round($b$jscomp$7_el$jscomp$21$$.left + $c$jscomp$4_scrollLeft$jscomp$5$$.left), Math.round($b$jscomp$7_el$jscomp$21$$.top + $c$jscomp$4_scrollLeft$jscomp$5$$.top), Math.round($b$jscomp$7_el$jscomp$21$$.width), 
  Math.round($b$jscomp$7_el$jscomp$21$$.height))) : this.$D$.$getLayoutRect$($b$jscomp$7_el$jscomp$21$$, $c$jscomp$4_scrollLeft$jscomp$5$$, $scrollTop$jscomp$8$$);
};
_.$JSCompiler_prototypeAlias$$.$Viewport$$module$src$service$viewport$viewport_impl_prototype$resetScroll$ = function() {
  var $$jscomp$this$jscomp$153$$ = this;
  this.$vsync_$.$mutate$(function() {
    $$jscomp$this$jscomp$153$$.$D$.$ViewportBindingDef$$module$src$service$viewport$viewport_binding_def_prototype$resetScroll$();
  });
};
_.$JSCompiler_prototypeAlias$$.$viewerSetScrollTop_$ = function($data$jscomp$63$$) {
  _.$JSCompiler_StaticMethods_Viewport$$module$src$service$viewport$viewport_impl_prototype$setScrollTop$$(this, $data$jscomp$63$$.scrollTop);
};
_.$JSCompiler_prototypeAlias$$.$updateOnViewportEvent_$ = function($data$jscomp$64$$) {
  var $$jscomp$this$jscomp$155$$ = this, $paddingTop$jscomp$9$$ = $data$jscomp$64$$.paddingTop, $duration$jscomp$9$$ = $data$jscomp$64$$.duration || 0, $curve$jscomp$6$$ = $data$jscomp$64$$.curve, $transient$jscomp$6$$ = $data$jscomp$64$$["transient"];
  void 0 != $paddingTop$jscomp$9$$ && $paddingTop$jscomp$9$$ != this.$F$ && (this.$U$ = this.$F$, this.$F$ = $paddingTop$jscomp$9$$, this.$F$ < this.$U$ ? (this.$D$.$hideViewerHeader$($transient$jscomp$6$$), $JSCompiler_StaticMethods_animateFixedElements_$$(this, $duration$jscomp$9$$, $curve$jscomp$6$$, $transient$jscomp$6$$)) : $JSCompiler_StaticMethods_animateFixedElements_$$(this, $duration$jscomp$9$$, $curve$jscomp$6$$, $transient$jscomp$6$$).then(function() {
    $$jscomp$this$jscomp$155$$.$D$.$showViewerHeader$($transient$jscomp$6$$, $$jscomp$this$jscomp$155$$.$F$);
  }));
};
_.$JSCompiler_prototypeAlias$$.$disableScrollEventHandler_$ = function($data$jscomp$65$$) {
  $data$jscomp$65$$ ? _.$JSCompiler_StaticMethods_Viewport$$module$src$service$viewport$viewport_impl_prototype$disableScroll$$(this) : this.$Viewport$$module$src$service$viewport$viewport_impl_prototype$resetScroll$();
};
_.$JSCompiler_prototypeAlias$$.$scroll_$ = function() {
  var $$jscomp$this$jscomp$157$$ = this;
  this.$O$ = null;
  this.$R$ = this.$D$.getScrollLeft();
  var $newScrollTop$jscomp$3$$ = this.$D$.$ViewportBindingDef$$module$src$service$viewport$viewport_binding_def_prototype$getScrollTop$();
  if (!(0 > $newScrollTop$jscomp$3$$)) {
    this.$I$ = $newScrollTop$jscomp$3$$;
    if (!this.$W$) {
      this.$W$ = !0;
      var $now$jscomp$11$$ = Date.now();
      this.$timer_$.delay(function() {
        $$jscomp$this$jscomp$157$$.$vsync_$.measure(function() {
          $$jscomp$this$jscomp$157$$.$throttledScroll_$($now$jscomp$11$$, $newScrollTop$jscomp$3$$);
        });
      }, 36);
    }
    this.$aa$.$fire$();
  }
};
_.$JSCompiler_prototypeAlias$$.$throttledScroll_$ = function($referenceTime$$, $referenceTop$$) {
  var $$jscomp$this$jscomp$158$$ = this, $newScrollTop$jscomp$4$$ = this.$I$ = this.$D$.$ViewportBindingDef$$module$src$service$viewport$viewport_binding_def_prototype$getScrollTop$(), $now$jscomp$12$$ = Date.now(), $velocity$jscomp$1$$ = 0;
  $now$jscomp$12$$ != $referenceTime$$ && ($velocity$jscomp$1$$ = ($newScrollTop$jscomp$4$$ - $referenceTop$$) / ($now$jscomp$12$$ - $referenceTime$$));
  "Viewport";
  0.03 > Math.abs($velocity$jscomp$1$$) ? ($JSCompiler_StaticMethods_changed_$$(this, !1, $velocity$jscomp$1$$), this.$W$ = !1) : this.$timer_$.delay(function() {
    return $$jscomp$this$jscomp$158$$.$vsync_$.measure($$jscomp$this$jscomp$158$$.$throttledScroll_$.bind($$jscomp$this$jscomp$158$$, $now$jscomp$12$$, $newScrollTop$jscomp$4$$));
  }, 20);
};
_.$JSCompiler_prototypeAlias$$.$sendScrollMessage_$ = function() {
  var $$jscomp$this$jscomp$159$$ = this;
  this.$V$ || (this.$V$ = !0, this.$vsync_$.measure(function() {
    $$jscomp$this$jscomp$159$$.$V$ = !1;
    _.$JSCompiler_StaticMethods_Viewer$$module$src$service$viewer_impl_prototype$sendMessage$$($$jscomp$this$jscomp$159$$.$viewer_$, "scroll", _.$dict$$module$src$utils$object$$({scrollTop:_.$JSCompiler_StaticMethods_Viewport$$module$src$service$viewport$viewport_impl_prototype$getScrollTop$$($$jscomp$this$jscomp$159$$)}), !0);
  }));
};
_.$JSCompiler_prototypeAlias$$.$resize_$ = function() {
  var $$jscomp$this$jscomp$160$$ = this;
  this.$O$ = null;
  var $oldSize$$ = this.$size_$;
  this.$size_$ = null;
  var $newSize$$ = this.$getSize$();
  this.$G$.update().then(function() {
    var $widthChanged$$ = !$oldSize$$ || $oldSize$$.width != $newSize$$.width;
    $JSCompiler_StaticMethods_changed_$$($$jscomp$this$jscomp$160$$, $widthChanged$$, 0);
    ($widthChanged$$ || $oldSize$$.height != $newSize$$.height) && $$jscomp$this$jscomp$160$$.$Y$.$fire$({$relayoutAll$:$widthChanged$$, width:$newSize$$.width, height:$newSize$$.height});
  });
};
var $ViewportType$$module$src$service$viewport$viewport_impl$NATURAL$$ = "natural", $ViewportType$$module$src$service$viewport$viewport_impl$NATURAL_IOS_EMBED$$ = "natural-ios-embed";
var $_template$$module$src$service$jank_meter$$ = ["<div class=i-amphtml-jank-meter></div>"];
$Vsync$$module$src$service$vsync_impl$$.prototype.$aa$ = function() {
  this.$D$ && $JSCompiler_StaticMethods_forceSchedule_$$(this);
};
$Vsync$$module$src$service$vsync_impl$$.prototype.$mutate$ = function($mutator$jscomp$8$$) {
  _.$JSCompiler_StaticMethods_Vsync$$module$src$service$vsync_impl_prototype$run$$(this, {measure:void 0, $mutate$:$mutator$jscomp$8$$});
};
$Vsync$$module$src$service$vsync_impl$$.prototype.measure = function($measurer$jscomp$6$$) {
  _.$JSCompiler_StaticMethods_Vsync$$module$src$service$vsync_impl_prototype$run$$(this, {measure:$measurer$jscomp$6$$, $mutate$:void 0});
};
$Vsync$$module$src$service$vsync_impl$$.prototype.$fa$ = function() {
  this.$W$.cancel();
  this.$D$ = !1;
  var $JSCompiler_StaticMethods_onRun$self$jscomp$inline_1678_tasks$$ = this.$Y$;
  if ($JSCompiler_StaticMethods_isEnabled_$$($JSCompiler_StaticMethods_onRun$self$jscomp$inline_1678_tasks$$) && null != $JSCompiler_StaticMethods_onRun$self$jscomp$inline_1678_tasks$$.$I$) {
    var $doc$jscomp$inline_5836_paintLatency$jscomp$inline_1679_states$$ = $JSCompiler_StaticMethods_onRun$self$jscomp$inline_1678_tasks$$.$D$.Date.now() - $JSCompiler_StaticMethods_onRun$self$jscomp$inline_1678_tasks$$.$I$;
    $JSCompiler_StaticMethods_onRun$self$jscomp$inline_1678_tasks$$.$I$ = null;
    $JSCompiler_StaticMethods_onRun$self$jscomp$inline_1678_tasks$$.$J$++;
    16 < $doc$jscomp$inline_5836_paintLatency$jscomp$inline_1679_states$$ && ($JSCompiler_StaticMethods_onRun$self$jscomp$inline_1678_tasks$$.$K$++, _.$dev$$module$src$log$$().$Log$$module$src$log_prototype$info$("JANK", "Paint latency: " + $doc$jscomp$inline_5836_paintLatency$jscomp$inline_1679_states$$ + "ms"));
    if ($JSCompiler_StaticMethods_onRun$self$jscomp$inline_1678_tasks$$.$F$ && 200 == $JSCompiler_StaticMethods_onRun$self$jscomp$inline_1678_tasks$$.$J$ && ($JSCompiler_StaticMethods_onRun$self$jscomp$inline_1678_tasks$$.$F$.$D$("gfp", $JSCompiler_StaticMethods_onRun$self$jscomp$inline_1678_tasks$$.$D$.Math.floor(($JSCompiler_StaticMethods_onRun$self$jscomp$inline_1678_tasks$$.$J$ - $JSCompiler_StaticMethods_onRun$self$jscomp$inline_1678_tasks$$.$K$) / $JSCompiler_StaticMethods_onRun$self$jscomp$inline_1678_tasks$$.$J$ * 
    100)), $JSCompiler_StaticMethods_onRun$self$jscomp$inline_1678_tasks$$.$F$.$D$("bf", $JSCompiler_StaticMethods_onRun$self$jscomp$inline_1678_tasks$$.$K$), $JSCompiler_StaticMethods_onRun$self$jscomp$inline_1678_tasks$$.$G$ && ($JSCompiler_StaticMethods_onRun$self$jscomp$inline_1678_tasks$$.$F$.$D$("lts", $JSCompiler_StaticMethods_onRun$self$jscomp$inline_1678_tasks$$.$P$), $JSCompiler_StaticMethods_onRun$self$jscomp$inline_1678_tasks$$.$F$.$D$("ltc", $JSCompiler_StaticMethods_onRun$self$jscomp$inline_1678_tasks$$.$O$), 
    $JSCompiler_StaticMethods_onRun$self$jscomp$inline_1678_tasks$$.$G$.disconnect(), $JSCompiler_StaticMethods_onRun$self$jscomp$inline_1678_tasks$$.$G$ = null), $JSCompiler_StaticMethods_onRun$self$jscomp$inline_1678_tasks$$.$F$.$F$(), _.$isExperimentOn$$module$src$experiments$$($JSCompiler_StaticMethods_onRun$self$jscomp$inline_1678_tasks$$.$D$, "jank-meter"))) {
      $doc$jscomp$inline_5836_paintLatency$jscomp$inline_1679_states$$ = $JSCompiler_StaticMethods_onRun$self$jscomp$inline_1678_tasks$$.$D$.document;
      var $display$jscomp$inline_5837_resolver$jscomp$3$$ = _.$htmlFor$$module$src$static_template$$($doc$jscomp$inline_5836_paintLatency$jscomp$inline_1679_states$$)($_template$$module$src$service$jank_meter$$);
      $display$jscomp$inline_5837_resolver$jscomp$3$$.textContent = "bf:" + $JSCompiler_StaticMethods_onRun$self$jscomp$inline_1678_tasks$$.$K$ + ", lts: " + $JSCompiler_StaticMethods_onRun$self$jscomp$inline_1678_tasks$$.$P$ + ", " + ("ltc:" + $JSCompiler_StaticMethods_onRun$self$jscomp$inline_1678_tasks$$.$O$ + ", bd:0");
      $doc$jscomp$inline_5836_paintLatency$jscomp$inline_1679_states$$.body.appendChild($display$jscomp$inline_5837_resolver$jscomp$3$$);
    }
  }
  $JSCompiler_StaticMethods_onRun$self$jscomp$inline_1678_tasks$$ = this.$I$;
  $doc$jscomp$inline_5836_paintLatency$jscomp$inline_1679_states$$ = this.$U$;
  $display$jscomp$inline_5837_resolver$jscomp$3$$ = this.$K$;
  this.$F$ = this.$K$ = null;
  this.$I$ = this.$P$;
  this.$U$ = this.$O$;
  for (var $i$177_i$jscomp$124$$ = 0; $i$177_i$jscomp$124$$ < $JSCompiler_StaticMethods_onRun$self$jscomp$inline_1678_tasks$$.length; $i$177_i$jscomp$124$$++) {
    $JSCompiler_StaticMethods_onRun$self$jscomp$inline_1678_tasks$$[$i$177_i$jscomp$124$$].measure && !$callTaskNoInline$$module$src$service$vsync_impl$$($JSCompiler_StaticMethods_onRun$self$jscomp$inline_1678_tasks$$[$i$177_i$jscomp$124$$].measure, $doc$jscomp$inline_5836_paintLatency$jscomp$inline_1679_states$$[$i$177_i$jscomp$124$$]) && ($JSCompiler_StaticMethods_onRun$self$jscomp$inline_1678_tasks$$[$i$177_i$jscomp$124$$].$mutate$ = void 0);
  }
  for ($i$177_i$jscomp$124$$ = 0; $i$177_i$jscomp$124$$ < $JSCompiler_StaticMethods_onRun$self$jscomp$inline_1678_tasks$$.length; $i$177_i$jscomp$124$$++) {
    $JSCompiler_StaticMethods_onRun$self$jscomp$inline_1678_tasks$$[$i$177_i$jscomp$124$$].$mutate$ && $callTaskNoInline$$module$src$service$vsync_impl$$($JSCompiler_StaticMethods_onRun$self$jscomp$inline_1678_tasks$$[$i$177_i$jscomp$124$$].$mutate$, $doc$jscomp$inline_5836_paintLatency$jscomp$inline_1679_states$$[$i$177_i$jscomp$124$$]);
  }
  this.$P$ = $JSCompiler_StaticMethods_onRun$self$jscomp$inline_1678_tasks$$;
  this.$O$ = $doc$jscomp$inline_5836_paintLatency$jscomp$inline_1679_states$$;
  this.$P$.length = 0;
  this.$O$.length = 0;
  $display$jscomp$inline_5837_resolver$jscomp$3$$ && $display$jscomp$inline_5837_resolver$jscomp$3$$();
};
/*

 Copyright (c) 2014 The Polymer Project Authors. All rights reserved.
 Use of this source code is governed by a BSD-style
 license that can be found in the LICENSE file or at
 https://developers.google.com/open-source/licenses/bsd
*/
var $ShadowCSS$$module$third_party$webcomponentsjs$ShadowCSS$$ = {$strictStyling$:!1, $scopeRules$:function($cssRules$$, $scopeSelector$$, $opt_transformer$$) {
  var $cssText$jscomp$4$$ = "";
  $cssRules$$ && Array.prototype.forEach.call($cssRules$$, function($cssRules$$) {
    if ($cssRules$$.selectorText && $cssRules$$.style && void 0 !== $cssRules$$.style.cssText) {
      $cssText$jscomp$4$$ += this.$scopeSelector$($cssRules$$.selectorText, $scopeSelector$$, this.$strictStyling$, $opt_transformer$$) + " {\n\t", $cssText$jscomp$4$$ += this.$propertiesFromRule$($cssRules$$) + "\n}\n\n";
    } else {
      if ($cssRules$$.type === window.CSSRule.MEDIA_RULE) {
        $cssText$jscomp$4$$ += "@media " + $cssRules$$.media.mediaText + " {\n", $cssText$jscomp$4$$ += this.$scopeRules$($cssRules$$.cssRules, $scopeSelector$$), $cssText$jscomp$4$$ += "\n}\n\n";
      } else {
        try {
          $cssRules$$.cssText && ($cssText$jscomp$4$$ += $cssRules$$.cssText + "\n\n");
        } catch ($x$jscomp$81$$) {
          $cssRules$$.type === window.CSSRule.$D$ && $cssRules$$.cssRules && ($cssText$jscomp$4$$ += this.$ieSafeCssTextFromKeyFrameRule$($cssRules$$));
        }
      }
    }
  }, this);
  return $cssText$jscomp$4$$;
}, $ieSafeCssTextFromKeyFrameRule$:function($rule$jscomp$4$$) {
  var $cssText$jscomp$5$$ = "@keyframes " + $rule$jscomp$4$$.name + " {";
  Array.prototype.forEach.call($rule$jscomp$4$$.cssRules, function($rule$jscomp$4$$) {
    $cssText$jscomp$5$$ += " " + $rule$jscomp$4$$.keyText + " {" + $rule$jscomp$4$$.style.cssText + "}";
  });
  return $cssText$jscomp$5$$ += " }";
}, $scopeSelector$:function($selector$jscomp$9$$, $scopeSelector$jscomp$1$$, $strict$$, $opt_transformer$jscomp$1$$) {
  var $r$jscomp$15$$ = [];
  $selector$jscomp$9$$.split(",").forEach(function($selector$jscomp$9$$) {
    $selector$jscomp$9$$ = $selector$jscomp$9$$.trim();
    $opt_transformer$jscomp$1$$ && ($selector$jscomp$9$$ = $opt_transformer$jscomp$1$$($selector$jscomp$9$$));
    this.$selectorNeedsScoping$($selector$jscomp$9$$, $scopeSelector$jscomp$1$$) && ($selector$jscomp$9$$ = $strict$$ && !$selector$jscomp$9$$.match($polyfillHostNoCombinator$$module$third_party$webcomponentsjs$ShadowCSS$$) ? this.$applyStrictSelectorScope$($selector$jscomp$9$$, $scopeSelector$jscomp$1$$) : this.$applySelectorScope$($selector$jscomp$9$$, $scopeSelector$jscomp$1$$));
    $r$jscomp$15$$.push($selector$jscomp$9$$);
  }, this);
  return $r$jscomp$15$$.join(", ");
}, $selectorNeedsScoping$:function($selector$jscomp$10$$, $re$jscomp$1_scopeSelector$jscomp$2$$) {
  if (Array.isArray($re$jscomp$1_scopeSelector$jscomp$2$$)) {
    return !0;
  }
  $re$jscomp$1_scopeSelector$jscomp$2$$ = this.$makeScopeMatcher$($re$jscomp$1_scopeSelector$jscomp$2$$);
  return !$selector$jscomp$10$$.match($re$jscomp$1_scopeSelector$jscomp$2$$);
}, $makeScopeMatcher$:function($scopeSelector$jscomp$3$$) {
  $scopeSelector$jscomp$3$$ = $scopeSelector$jscomp$3$$.replace(/\[/g, "\\[").replace(/\]/g, "\\]");
  return new RegExp("^(" + $scopeSelector$jscomp$3$$ + ")" + $selectorReSuffix$$module$third_party$webcomponentsjs$ShadowCSS$$, "m");
}, $applySelectorScope$:function($selector$jscomp$11$$, $selectorScope$$) {
  return Array.isArray($selectorScope$$) ? this.$applySelectorScopeList$($selector$jscomp$11$$, $selectorScope$$) : this.$applySimpleSelectorScope$($selector$jscomp$11$$, $selectorScope$$);
}, $applySelectorScopeList$:function($selector$jscomp$12$$, $scopeSelectorList$$) {
  for (var $r$jscomp$16$$ = [], $i$jscomp$125$$ = 0, $s$jscomp$20$$; $s$jscomp$20$$ = $scopeSelectorList$$[$i$jscomp$125$$]; $i$jscomp$125$$++) {
    $r$jscomp$16$$.push(this.$applySimpleSelectorScope$($selector$jscomp$12$$, $s$jscomp$20$$));
  }
  return $r$jscomp$16$$.join(", ");
}, $applySimpleSelectorScope$:function($selector$jscomp$13$$, $scopeSelector$jscomp$4$$) {
  return $selector$jscomp$13$$.match($polyfillHostRe$$module$third_party$webcomponentsjs$ShadowCSS$$) ? ($selector$jscomp$13$$ = $selector$jscomp$13$$.replace($polyfillHostNoCombinator$$module$third_party$webcomponentsjs$ShadowCSS$$, $scopeSelector$jscomp$4$$), $selector$jscomp$13$$.replace($polyfillHostRe$$module$third_party$webcomponentsjs$ShadowCSS$$, $scopeSelector$jscomp$4$$ + " ")) : $scopeSelector$jscomp$4$$ + " " + $selector$jscomp$13$$;
}, $applyStrictSelectorScope$:function($selector$jscomp$14$$, $scopeSelector$jscomp$5$$) {
  $scopeSelector$jscomp$5$$ = $scopeSelector$jscomp$5$$.replace(/\[is=([^\]]*)\]/g, "$1");
  var $splits$$ = [" ", ">", "+", "~"], $scoped$$ = $selector$jscomp$14$$, $attrName$jscomp$2$$ = "[" + $scopeSelector$jscomp$5$$ + "]";
  $splits$$.forEach(function($selector$jscomp$14$$) {
    $scoped$$ = $scoped$$.split($selector$jscomp$14$$).map(function($selector$jscomp$14$$) {
      var $scopeSelector$jscomp$5$$ = $selector$jscomp$14$$.trim().replace($polyfillHostRe$$module$third_party$webcomponentsjs$ShadowCSS$$, "");
      $scopeSelector$jscomp$5$$ && 0 > $splits$$.indexOf($scopeSelector$jscomp$5$$) && 0 > $scopeSelector$jscomp$5$$.indexOf($attrName$jscomp$2$$) && ($selector$jscomp$14$$ = $scopeSelector$jscomp$5$$.replace(/([^:]*)(:*)(.*)/, "$1" + $attrName$jscomp$2$$ + "$2$3"));
      return $selector$jscomp$14$$;
    }).join($selector$jscomp$14$$);
  });
  return $scoped$$;
}, $propertiesFromRule$:function($rule$jscomp$6_style$jscomp$16$$) {
  var $cssText$jscomp$6$$ = $rule$jscomp$6_style$jscomp$16$$.style.cssText;
  $rule$jscomp$6_style$jscomp$16$$.style.content && !$rule$jscomp$6_style$jscomp$16$$.style.content.match(/['"]+|attr/) && ($cssText$jscomp$6$$ = $cssText$jscomp$6$$.replace(/content:[^;]*;/g, "content: '" + $rule$jscomp$6_style$jscomp$16$$.style.content + "';"));
  $rule$jscomp$6_style$jscomp$16$$ = $rule$jscomp$6_style$jscomp$16$$.style;
  for (var $i$jscomp$126$$ in $rule$jscomp$6_style$jscomp$16$$) {
    "initial" === $rule$jscomp$6_style$jscomp$16$$[$i$jscomp$126$$] && ($cssText$jscomp$6$$ += $i$jscomp$126$$ + ": initial; ");
  }
  return $cssText$jscomp$6$$;
}}, $selectorReSuffix$$module$third_party$webcomponentsjs$ShadowCSS$$ = "([>\\s~+[.,{:][\\s\\S]*)?$", $polyfillHostNoCombinator$$module$third_party$webcomponentsjs$ShadowCSS$$ = "-shadowcsshost-no-combinator", $polyfillHostRe$$module$third_party$webcomponentsjs$ShadowCSS$$ = /-shadowcsshost/gim;
var $shadowDomSupportedVersion$$module$src$web_components$$, $shadowCssSupported$$module$src$web_components$$;
var $UNCOMPOSED_SEARCH$$module$src$shadow_embed$$ = {composed:!1}, $CSS_SELECTOR_BEG_REGEX$$module$src$shadow_embed$$ = /[^\.\-_0-9a-zA-Z]/, $CSS_SELECTOR_END_REGEX$$module$src$shadow_embed$$ = /[^\-_0-9a-zA-Z]/, $shadowDomStreamingSupported$$module$src$shadow_embed$$;
_.$JSCompiler_prototypeAlias$$ = $ShadowDomWriterStreamer$$module$src$shadow_embed$$.prototype;
_.$JSCompiler_prototypeAlias$$.$onBody$ = function($callback$jscomp$90$$) {
  this.$K$ = $callback$jscomp$90$$;
};
_.$JSCompiler_prototypeAlias$$.$onBodyChunk$ = function($callback$jscomp$91$$) {
  this.$J$ = $callback$jscomp$91$$;
};
_.$JSCompiler_prototypeAlias$$.$onEnd$ = function($callback$jscomp$92$$) {
  this.$O$ = $callback$jscomp$92$$;
};
_.$JSCompiler_prototypeAlias$$.write = function($chunk$jscomp$5$$) {
  if (this.$G$) {
    throw Error("closed already");
  }
  $chunk$jscomp$5$$ && this.$D$.write($chunk$jscomp$5$$);
  $JSCompiler_StaticMethods_ShadowDomWriterStreamer$$module$src$shadow_embed_prototype$schedule_$$(this);
  return this.$P$;
};
_.$JSCompiler_prototypeAlias$$.close = function() {
  this.$D$.close();
  this.$G$ = !0;
  $JSCompiler_StaticMethods_ShadowDomWriterStreamer$$module$src$shadow_embed_prototype$schedule_$$(this);
  return this.$P$;
};
_.$JSCompiler_prototypeAlias$$.abort = function() {
  throw Error("Not implemented");
};
_.$JSCompiler_prototypeAlias$$.releaseLock = function() {
  throw Error("Not implemented");
};
_.$JSCompiler_prototypeAlias$$.$merge_$ = function() {
  this.$I$ = !1;
  !this.$F$ && this.$D$.body && (this.$F$ = this.$K$(this.$D$));
  if (this.$F$) {
    var $inputBody$$ = this.$D$.body, $targetBody$$ = this.$F$, $transferCount$$ = 0;
    for ($removeNoScriptElements$$module$src$shadow_embed$$($inputBody$$); $inputBody$$.firstChild;) {
      $transferCount$$++, $targetBody$$.appendChild($inputBody$$.firstChild);
    }
    0 < $transferCount$$ && this.$J$();
  }
  this.$G$ && this.$O$();
};
_.$$jscomp$global$$.Object.defineProperties($ShadowDomWriterStreamer$$module$src$shadow_embed$$.prototype, {closed:{configurable:!0, enumerable:!0, get:function() {
  throw Error("Not implemented");
}}, desiredSize:{configurable:!0, enumerable:!0, get:function() {
  throw Error("Not implemented");
}}, ready:{configurable:!0, enumerable:!0, get:function() {
  throw Error("Not implemented");
}}});
_.$JSCompiler_prototypeAlias$$ = $ShadowDomWriterBulk$$module$src$shadow_embed$$.prototype;
_.$JSCompiler_prototypeAlias$$.$onBody$ = function($callback$jscomp$93$$) {
  this.$G$ = $callback$jscomp$93$$;
};
_.$JSCompiler_prototypeAlias$$.$onBodyChunk$ = function($callback$jscomp$94$$) {
  this.$F$ = $callback$jscomp$94$$;
};
_.$JSCompiler_prototypeAlias$$.$onEnd$ = function($callback$jscomp$95$$) {
  this.$I$ = $callback$jscomp$95$$;
};
_.$JSCompiler_prototypeAlias$$.write = function($chunk$jscomp$6$$) {
  if (this.$D$) {
    throw Error("closed already");
  }
  $chunk$jscomp$6$$ && this.$K$.push($chunk$jscomp$6$$);
  return this.$J$;
};
_.$JSCompiler_prototypeAlias$$.close = function() {
  var $$jscomp$this$jscomp$169$$ = this;
  this.$D$ = !0;
  this.$vsync_$.$mutate$(function() {
    var $fullHtml$jscomp$inline_1687_inputBody$jscomp$inline_1689$$ = $$jscomp$this$jscomp$169$$.$K$.join(""), $doc$jscomp$inline_1688_targetBody$jscomp$inline_1690$$ = (new window.DOMParser).parseFromString($fullHtml$jscomp$inline_1687_inputBody$jscomp$inline_1689$$, "text/html");
    if ($doc$jscomp$inline_1688_targetBody$jscomp$inline_1690$$.body) {
      $fullHtml$jscomp$inline_1687_inputBody$jscomp$inline_1689$$ = $doc$jscomp$inline_1688_targetBody$jscomp$inline_1690$$.body;
      $doc$jscomp$inline_1688_targetBody$jscomp$inline_1690$$ = $$jscomp$this$jscomp$169$$.$G$($doc$jscomp$inline_1688_targetBody$jscomp$inline_1690$$);
      var $transferCount$jscomp$inline_1691$$ = 0;
      for ($removeNoScriptElements$$module$src$shadow_embed$$($fullHtml$jscomp$inline_1687_inputBody$jscomp$inline_1689$$); $fullHtml$jscomp$inline_1687_inputBody$jscomp$inline_1689$$.firstChild;) {
        $transferCount$jscomp$inline_1691$$++, $doc$jscomp$inline_1688_targetBody$jscomp$inline_1690$$.appendChild($fullHtml$jscomp$inline_1687_inputBody$jscomp$inline_1689$$.firstChild);
      }
      0 < $transferCount$jscomp$inline_1691$$ && $$jscomp$this$jscomp$169$$.$F$();
    }
    $$jscomp$this$jscomp$169$$.$I$();
  });
  return this.$J$;
};
_.$JSCompiler_prototypeAlias$$.abort = function() {
  throw Error("Not implemented");
};
_.$JSCompiler_prototypeAlias$$.releaseLock = function() {
  throw Error("Not implemented");
};
_.$$jscomp$global$$.Object.defineProperties($ShadowDomWriterBulk$$module$src$shadow_embed$$.prototype, {closed:{configurable:!0, enumerable:!0, get:function() {
  throw Error("Not implemented");
}}, desiredSize:{configurable:!0, enumerable:!0, get:function() {
  throw Error("Not implemented");
}}, ready:{configurable:!0, enumerable:!0, get:function() {
  throw Error("Not implemented");
}}});
$logConstructor$$module$src$log$$ = $Log$$module$src$log$$;
_.$dev$$module$src$log$$();
_.$user$$module$src$log$$();
window.self.$reportError$ = function($win$jscomp$91$$, $error$jscomp$13$$, $opt_associatedElement$$) {
  _.$reportError$$module$src$error$$($error$jscomp$13$$, $opt_associatedElement$$);
  $error$jscomp$13$$ && $win$jscomp$91$$ && $isUserErrorMessage$$module$src$log$$($error$jscomp$13$$.message) && !(0 <= $error$jscomp$13$$.message.indexOf("\u200b\u200b\u200b\u200b")) && _.$reportErrorToAnalytics$$module$src$error$$($error$jscomp$13$$, $win$jscomp$91$$);
}.bind(null, window.self);
_.$MultidocManager$$module$src$runtime$$.prototype.attachShadowDoc = function($hostElement$jscomp$3$$, $doc$jscomp$49$$, $url$jscomp$93$$, $opt_initParams$jscomp$3$$) {
  var $$jscomp$this$jscomp$171$$ = this;
  "runtime";
  return $JSCompiler_StaticMethods_MultidocManager$$module$src$runtime_prototype$attachShadowDoc_$$(this, $hostElement$jscomp$3$$, $url$jscomp$93$$, $opt_initParams$jscomp$3$$, function($url$jscomp$93$$, $opt_initParams$jscomp$3$$, $ampdoc$jscomp$79$$) {
    $url$jscomp$93$$ = $JSCompiler_StaticMethods_mergeShadowHead_$$($$jscomp$this$jscomp$171$$, $ampdoc$jscomp$79$$, $opt_initParams$jscomp$3$$, $doc$jscomp$49$$);
    $JSCompiler_StaticMethods_installExtensionsInDoc$$($$jscomp$this$jscomp$171$$.$extensions_$, $ampdoc$jscomp$79$$, $url$jscomp$93$$);
    $doc$jscomp$49$$.body && ($opt_initParams$jscomp$3$$ = $importShadowBody$$module$src$shadow_embed$$($opt_initParams$jscomp$3$$, $doc$jscomp$49$$.body, !0), $opt_initParams$jscomp$3$$.classList.add("amp-shadow"), _.$JSCompiler_StaticMethods_setBody$$($ampdoc$jscomp$79$$, $opt_initParams$jscomp$3$$));
    (0,window.setTimeout)(function() {
      _.$JSCompiler_StaticMethods_signal$$($ampdoc$jscomp$79$$.signals(), "render-start");
      _.$setStyle$$module$src$style$$($hostElement$jscomp$3$$, "visibility", "visible");
    }, 50);
    return window.Promise.resolve();
  });
};
_.$MultidocManager$$module$src$runtime$$.prototype.attachShadowDocAsStream = function($hostElement$jscomp$4$$, $url$jscomp$94$$, $opt_initParams$jscomp$4$$) {
  var $$jscomp$this$jscomp$172$$ = this;
  "runtime";
  return $JSCompiler_StaticMethods_MultidocManager$$module$src$runtime_prototype$attachShadowDoc_$$(this, $hostElement$jscomp$4$$, $url$jscomp$94$$, $opt_initParams$jscomp$4$$, function($url$jscomp$94$$, $opt_initParams$jscomp$4$$, $ampdoc$jscomp$80$$) {
    var $amp$jscomp$3$$ = !1, $shadowRoot$jscomp$8$$ = $createShadowDomWriter$$module$src$shadow_embed$$($$jscomp$this$jscomp$172$$.$win$);
    $url$jscomp$94$$.writer = $shadowRoot$jscomp$8$$;
    $shadowRoot$jscomp$8$$.$onBody$(function($hostElement$jscomp$4$$) {
      var $url$jscomp$94$$ = $JSCompiler_StaticMethods_mergeShadowHead_$$($$jscomp$this$jscomp$172$$, $ampdoc$jscomp$80$$, $opt_initParams$jscomp$4$$, $hostElement$jscomp$4$$);
      $JSCompiler_StaticMethods_installExtensionsInDoc$$($$jscomp$this$jscomp$172$$.$extensions_$, $ampdoc$jscomp$80$$, $url$jscomp$94$$);
      $hostElement$jscomp$4$$ = $importShadowBody$$module$src$shadow_embed$$($opt_initParams$jscomp$4$$, $hostElement$jscomp$4$$.body, !1);
      $hostElement$jscomp$4$$.classList.add("amp-shadow");
      _.$JSCompiler_StaticMethods_setBody$$($ampdoc$jscomp$80$$, $hostElement$jscomp$4$$);
      return $hostElement$jscomp$4$$;
    });
    $shadowRoot$jscomp$8$$.$onBodyChunk$(function() {
      $amp$jscomp$3$$ || ($amp$jscomp$3$$ = !0, (0,window.setTimeout)(function() {
        _.$JSCompiler_StaticMethods_signal$$($ampdoc$jscomp$80$$.signals(), "render-start");
        _.$setStyle$$module$src$style$$($hostElement$jscomp$4$$, "visibility", "visible");
      }, 50));
    });
    return new window.Promise(function($hostElement$jscomp$4$$) {
      $shadowRoot$jscomp$8$$.$onEnd$(function() {
        $hostElement$jscomp$4$$();
        $url$jscomp$94$$.$writer$ = null;
      });
    });
  });
};
$AmpDocService$$module$src$service$ampdoc_impl$$.prototype.$isSingleDoc$ = function() {
  return !!this.$F$;
};
$AmpDocService$$module$src$service$ampdoc_impl$$.prototype.$getAmpDoc$ = function($opt_node$jscomp$1$$, $ampdoc$jscomp$84_opt_options$jscomp$82$$) {
  $ampdoc$jscomp$84_opt_options$jscomp$82$$ = $JSCompiler_StaticMethods_getAmpDocIfAvailable$$(this, $opt_node$jscomp$1$$, $ampdoc$jscomp$84_opt_options$jscomp$82$$);
  if (!$ampdoc$jscomp$84_opt_options$jscomp$82$$) {
    throw _.$dev$$module$src$log$$().$createError$("No ampdoc found for", $opt_node$jscomp$1$$);
  }
  return $ampdoc$jscomp$84_opt_options$jscomp$82$$;
};
_.$JSCompiler_prototypeAlias$$ = _.$AmpDoc$$module$src$service$ampdoc_impl$$.prototype;
_.$JSCompiler_prototypeAlias$$.$isSingleDoc$ = function() {
  return null;
};
_.$JSCompiler_prototypeAlias$$.$getWin$ = _.$JSCompiler_stubMethod$$(4);
_.$JSCompiler_prototypeAlias$$.signals = function() {
  return this.$K$;
};
_.$JSCompiler_prototypeAlias$$.getRootNode = function() {
  return null;
};
_.$JSCompiler_prototypeAlias$$.$isBodyAvailable$ = _.$JSCompiler_stubMethod$$(45);
_.$JSCompiler_prototypeAlias$$.$getBody$ = function() {
  return null;
};
_.$JSCompiler_prototypeAlias$$.$whenBodyAvailable$ = function() {
  return null;
};
_.$JSCompiler_prototypeAlias$$.$AmpDoc$$module$src$service$ampdoc_impl_prototype$isReady$ = _.$JSCompiler_stubMethod$$(48);
_.$JSCompiler_prototypeAlias$$.$whenReady$ = function() {
  return null;
};
_.$JSCompiler_prototypeAlias$$.$AmpDoc$$module$src$service$ampdoc_impl_prototype$getUrl$ = function() {
  return null;
};
_.$JSCompiler_prototypeAlias$$.getElementById = function($id$jscomp$40$$) {
  return this.getRootNode().getElementById($id$jscomp$40$$);
};
_.$JSCompiler_prototypeAlias$$.contains = function($node$jscomp$48$$) {
  return this.getRootNode().contains($node$jscomp$48$$);
};
_.$$jscomp$inherits$$(_.$AmpDocSingle$$module$src$service$ampdoc_impl$$, _.$AmpDoc$$module$src$service$ampdoc_impl$$);
_.$JSCompiler_prototypeAlias$$ = _.$AmpDocSingle$$module$src$service$ampdoc_impl$$.prototype;
_.$JSCompiler_prototypeAlias$$.$isSingleDoc$ = function() {
  return !0;
};
_.$JSCompiler_prototypeAlias$$.getRootNode = function() {
  return this.$win$.document;
};
_.$JSCompiler_prototypeAlias$$.$AmpDoc$$module$src$service$ampdoc_impl_prototype$getUrl$ = function() {
  return this.$win$.location.href;
};
_.$JSCompiler_prototypeAlias$$.$getHeadNode$ = function() {
  return this.$win$.document.head;
};
_.$JSCompiler_prototypeAlias$$.$isBodyAvailable$ = _.$JSCompiler_stubMethod$$(44);
_.$JSCompiler_prototypeAlias$$.$getBody$ = function() {
  return this.$win$.document.body;
};
_.$JSCompiler_prototypeAlias$$.$whenBodyAvailable$ = function() {
  return this.$F$;
};
_.$JSCompiler_prototypeAlias$$.$AmpDoc$$module$src$service$ampdoc_impl_prototype$isReady$ = _.$JSCompiler_stubMethod$$(47);
_.$JSCompiler_prototypeAlias$$.$whenReady$ = function() {
  return this.$G$;
};
_.$$jscomp$inherits$$(_.$AmpDocShadow$$module$src$service$ampdoc_impl$$, _.$AmpDoc$$module$src$service$ampdoc_impl$$);
_.$JSCompiler_prototypeAlias$$ = _.$AmpDocShadow$$module$src$service$ampdoc_impl$$.prototype;
_.$JSCompiler_prototypeAlias$$.$isSingleDoc$ = function() {
  return !1;
};
_.$JSCompiler_prototypeAlias$$.getRootNode = function() {
  return this.$I$;
};
_.$JSCompiler_prototypeAlias$$.$AmpDoc$$module$src$service$ampdoc_impl_prototype$getUrl$ = function() {
  return this.$url_$;
};
_.$JSCompiler_prototypeAlias$$.$getHeadNode$ = function() {
  return this.$I$;
};
_.$JSCompiler_prototypeAlias$$.$isBodyAvailable$ = _.$JSCompiler_stubMethod$$(43);
_.$JSCompiler_prototypeAlias$$.$getBody$ = function() {
  return this.$G$;
};
_.$JSCompiler_prototypeAlias$$.$whenBodyAvailable$ = function() {
  return this.$O$;
};
_.$JSCompiler_prototypeAlias$$.$AmpDoc$$module$src$service$ampdoc_impl_prototype$isReady$ = _.$JSCompiler_stubMethod$$(46);
_.$JSCompiler_prototypeAlias$$.$whenReady$ = function() {
  return this.$P$;
};
$Performance$$module$src$service$performance_impl$$.prototype.$D$ = function($label$jscomp$4$$, $opt_delta$$) {
  var $storedVal_value$jscomp$141$$ = void 0 == $opt_delta$$ ? this.$win$.Date.now() : void 0, $data$jscomp$68$$ = _.$dict$$module$src$utils$object$$({label:$label$jscomp$4$$, value:$storedVal_value$jscomp$141$$, delta:null != $opt_delta$$ ? Math.max($opt_delta$$, 0) : void 0});
  this.$K$ && this.$G$ ? _.$JSCompiler_StaticMethods_Viewer$$module$src$service$viewer_impl_prototype$sendMessage$$(this.$viewer_$, "tick", $data$jscomp$68$$) : (50 <= this.$I$.length && this.$I$.shift(), this.$I$.push($data$jscomp$68$$));
  1 == arguments.length && this.mark($label$jscomp$4$$);
  $storedVal_value$jscomp$141$$ = Math.round(null != $opt_delta$$ ? Math.max($opt_delta$$, 0) : $storedVal_value$jscomp$141$$ - this.$J$);
  switch($label$jscomp$4$$) {
    case "fcp":
      this.$U$ = $storedVal_value$jscomp$141$$;
      break;
    case "pc":
      this.$V$ = $storedVal_value$jscomp$141$$;
      break;
    case "mbv":
      this.$W$ = $storedVal_value$jscomp$141$$;
  }
};
$Performance$$module$src$service$performance_impl$$.prototype.mark = function($label$jscomp$5$$) {
  this.$win$.performance && this.$win$.performance.mark && 1 == arguments.length && this.$win$.performance.mark($label$jscomp$5$$);
};
$Performance$$module$src$service$performance_impl$$.prototype.$F$ = function() {
  this.$K$ && this.$G$ && _.$JSCompiler_StaticMethods_Viewer$$module$src$service$viewer_impl_prototype$sendMessage$$(this.$viewer_$, "sendCsi", _.$dict$$module$src$utils$object$$({ampexp:this.$P$}), !0);
};
if (!window.self.IS_AMP_ALT) {
  window.self.location && (window.self.location.$D$ = window.self.location.hash);
  var $ampdocService$$;
  try {
    _.$installErrorReporting$$module$src$error$$(), _.$installDocService$$module$src$service$ampdoc_impl$$(!0), $ampdocService$$ = _.$Services$$module$src$services$ampdocServiceFor$$(window.self);
  } catch ($e$jscomp$95$$) {
    throw _.$makeBodyVisibleRecovery$$module$src$style_installer$$(window.self.document), $e$jscomp$95$$;
  }
  _.$startupChunk$$module$src$chunk$$(window.self.document, function() {
    var $ampdoc$jscomp$86$$ = $ampdocService$$.$getAmpDoc$(window.self.document);
    _.$installPerformanceService$$module$src$service$performance_impl$$();
    var $perf$jscomp$3$$ = _.$Services$$module$src$services$performanceFor$$(window.self);
    window.self.document.documentElement.hasAttribute("i-amphtml-no-boilerplate") && $JSCompiler_StaticMethods_addEnabledExperiment$$($perf$jscomp$3$$, "no-boilerplate");
    _.$registerServiceBuilder$$module$src$service$$(window.self, "platform", $Platform$$module$src$service$platform_impl$$);
    _.$fontStylesheetTimeout$$module$src$font_stylesheet_timeout$$();
    $perf$jscomp$3$$.$D$("is");
    _.$installStylesForDoc$$module$src$style_installer$$($ampdoc$jscomp$86$$, "html{overflow-x:hidden!important}body,html{height:auto!important}html.i-amphtml-fie{height:100%!important;width:100%!important}body{margin:0!important;-webkit-text-size-adjust:100%;-moz-text-size-adjust:100%;-ms-text-size-adjust:100%;text-size-adjust:100%}[hidden]{display:none!important}html.i-amphtml-singledoc.i-amphtml-embedded{-ms-touch-action:pan-y;touch-action:pan-y}html.i-amphtml-fie>body,html.i-amphtml-singledoc>body{overflow:visible!important}html.i-amphtml-fie:not(.i-amphtml-inabox)>body,html.i-amphtml-singledoc:not(.i-amphtml-inabox)>body{position:relative!important}html.i-amphtml-webview>body{overflow-x:hidden!important;overflow-y:visible!important;min-height:100vh!important}html.i-amphtml-ios-embed-legacy>body{overflow-x:hidden!important;overflow-y:auto!important;position:absolute!important}html.i-amphtml-ios-embed{overflow-y:auto!important;position:static}#i-amphtml-wrapper{overflow-x:hidden!important;overflow-y:auto!important;position:absolute!important;top:0!important;left:0!important;right:0!important;bottom:0!important;margin:0!important;display:block!important}html.i-amphtml-ios-embed.i-amphtml-ios-overscroll,html.i-amphtml-ios-embed.i-amphtml-ios-overscroll>#i-amphtml-wrapper{-webkit-overflow-scrolling:touch!important}#i-amphtml-wrapper>body{position:relative!important;border-top:1px solid transparent!important}html.i-amphtml-ios-embed-sd{overflow:hidden!important;position:static!important}html.i-amphtml-ios-embed-sd>body,html.i-amphtml-singledoc.i-amphtml-ios-embed-sd>body{position:absolute!important;top:0!important;left:0!important;right:0!important;bottom:0!important;overflow:hidden!important}.i-amphtml-body-minheight>body{min-height:calc(100vh + 1px)}.i-amphtml-element{display:inline-block}.i-amphtml-blurry-placeholder{-webkit-transition:opacity 0.3s cubic-bezier(0.0,0.0,0.2,1)!important;transition:opacity 0.3s cubic-bezier(0.0,0.0,0.2,1)!important}[layout=nodisplay]:not(.i-amphtml-element){display:none!important}.i-amphtml-layout-fixed,[layout=fixed][width][height]:not(.i-amphtml-layout-fixed){display:inline-block;position:relative}.i-amphtml-layout-responsive,[layout=responsive][width][height]:not(.i-amphtml-layout-responsive),[width][height][sizes]:not(.i-amphtml-layout-responsive){display:block;position:relative}.i-amphtml-layout-intrinsic{display:inline-block;position:relative;max-width:100%}.i-amphtml-intrinsic-sizer{max-width:100%;display:block!important}.i-amphtml-layout-container,.i-amphtml-layout-fixed-height,[layout=container],[layout=fixed-height][height]{display:block;position:relative}.i-amphtml-layout-fill,[layout=fill]:not(.i-amphtml-layout-fill){display:block;overflow:hidden!important;position:absolute;top:0;left:0;bottom:0;right:0}.i-amphtml-layout-flex-item,[layout=flex-item]:not(.i-amphtml-layout-flex-item){display:block;position:relative;-webkit-box-flex:1;-ms-flex:1 1 auto;flex:1 1 auto}.i-amphtml-layout-fluid{position:relative}.i-amphtml-layout-size-defined{overflow:hidden!important}.i-amphtml-layout-awaiting-size{position:absolute!important;top:auto!important;bottom:auto!important}i-amphtml-sizer{display:block!important}.i-amphtml-blurry-placeholder,.i-amphtml-fill-content{display:block;height:0;max-height:100%;max-width:100%;min-height:100%;min-width:100%;width:0;margin:auto}.i-amphtml-layout-size-defined .i-amphtml-fill-content{position:absolute;top:0;left:0;bottom:0;right:0}.i-amphtml-layout-intrinsic .i-amphtml-sizer{max-width:100%}.i-amphtml-replaced-content,.i-amphtml-screen-reader{padding:0!important;border:none!important}.i-amphtml-screen-reader{position:fixed!important;top:0px!important;left:0px!important;width:4px!important;height:4px!important;opacity:0!important;overflow:hidden!important;margin:0!important;display:block!important;visibility:visible!important}.i-amphtml-screen-reader~.i-amphtml-screen-reader{left:8px!important}.i-amphtml-screen-reader~.i-amphtml-screen-reader~.i-amphtml-screen-reader{left:12px!important}.i-amphtml-screen-reader~.i-amphtml-screen-reader~.i-amphtml-screen-reader~.i-amphtml-screen-reader{left:16px!important}.i-amphtml-unresolved{position:relative;overflow:hidden!important}#i-amphtml-wrapper.i-amphtml-scroll-disabled,.i-amphtml-scroll-disabled{overflow-x:hidden!important;overflow-y:hidden!important}.i-amphtml-select-disabled{-webkit-user-select:none!important;-moz-user-select:none!important;-ms-user-select:none!important;user-select:none!important}.i-amphtml-notbuilt,[layout]:not(.i-amphtml-element){position:relative;overflow:hidden!important;color:transparent!important}.i-amphtml-notbuilt:not(.i-amphtml-layout-container)>*,[layout]:not([layout=container]):not(.i-amphtml-element)>*{display:none}.i-amphtml-ghost{visibility:hidden!important}.i-amphtml-element>[placeholder],[layout]:not(.i-amphtml-element)>[placeholder]{display:block}.i-amphtml-element>[placeholder].amp-hidden,.i-amphtml-element>[placeholder].hidden{visibility:hidden}.i-amphtml-element:not(.amp-notsupported)>[fallback],.i-amphtml-layout-container>[placeholder].amp-hidden,.i-amphtml-layout-container>[placeholder].hidden{display:none}.i-amphtml-layout-size-defined>[fallback],.i-amphtml-layout-size-defined>[placeholder]{position:absolute!important;top:0!important;left:0!important;right:0!important;bottom:0!important;z-index:1}.i-amphtml-notbuilt>[placeholder]{display:block!important}.i-amphtml-hidden-by-media-query{display:none!important}.i-amphtml-element-error{background:red!important;color:#fff!important;position:relative!important}.i-amphtml-element-error:before{content:attr(error-message)}i-amp-scroll-container,i-amphtml-scroll-container{position:absolute;top:0;left:0;right:0;bottom:0;display:block}i-amp-scroll-container.amp-active,i-amphtml-scroll-container.amp-active{overflow:auto;-webkit-overflow-scrolling:touch}.i-amphtml-loading-container{display:block!important;pointer-events:none;z-index:1}.i-amphtml-notbuilt>.i-amphtml-loading-container{display:block!important}.i-amphtml-loading-container.amp-hidden{visibility:hidden}.i-amphtml-loader-line{position:absolute;top:0;left:0;right:0;height:1px;overflow:hidden!important;background-color:hsla(0,0%,59.2%,0.2);display:block}.i-amphtml-loader-moving-line{display:block;position:absolute;width:100%;height:100%!important;background-color:hsla(0,0%,59.2%,0.65);z-index:2}@-webkit-keyframes i-amphtml-loader-line-moving{0%{-webkit-transform:translateX(-100%);transform:translateX(-100%)}to{-webkit-transform:translateX(100%);transform:translateX(100%)}}@keyframes i-amphtml-loader-line-moving{0%{-webkit-transform:translateX(-100%);transform:translateX(-100%)}to{-webkit-transform:translateX(100%);transform:translateX(100%)}}.i-amphtml-loader-line.amp-active .i-amphtml-loader-moving-line{-webkit-animation:i-amphtml-loader-line-moving 4s ease infinite;animation:i-amphtml-loader-line-moving 4s ease infinite}.i-amphtml-loader{position:absolute;display:block;height:10px;top:50%;left:50%;-webkit-transform:translateX(-50%) translateY(-50%);transform:translateX(-50%) translateY(-50%);-webkit-transform-origin:50% 50%;transform-origin:50% 50%;white-space:nowrap}.i-amphtml-loader.amp-active .i-amphtml-loader-dot{-webkit-animation:i-amphtml-loader-dots 2s infinite;animation:i-amphtml-loader-dots 2s infinite}.i-amphtml-loader-dot{position:relative;display:inline-block;height:10px;width:10px;margin:2px;border-radius:100%;background-color:rgba(0,0,0,0.3);box-shadow:2px 2px 2px 1px rgba(0,0,0,0.2);will-change:transform}.i-amphtml-loader .i-amphtml-loader-dot:first-child{-webkit-animation-delay:0s;animation-delay:0s}.i-amphtml-loader .i-amphtml-loader-dot:nth-child(2){-webkit-animation-delay:.1s;animation-delay:.1s}.i-amphtml-loader .i-amphtml-loader-dot:nth-child(3){-webkit-animation-delay:.2s;animation-delay:.2s}@-webkit-keyframes i-amphtml-loader-dots{0%,to{-webkit-transform:scale(.7);transform:scale(.7);background-color:rgba(0,0,0,0.3)}50%{-webkit-transform:scale(.8);transform:scale(.8);background-color:rgba(0,0,0,0.5)}}@keyframes i-amphtml-loader-dots{0%,to{-webkit-transform:scale(.7);transform:scale(.7);background-color:rgba(0,0,0,0.3)}50%{-webkit-transform:scale(.8);transform:scale(.8);background-color:rgba(0,0,0,0.5)}}.i-amphtml-element>[overflow]{cursor:pointer;position:relative;z-index:2;visibility:hidden}.i-amphtml-element>[overflow].amp-visible{visibility:visible}template{display:none!important}.amp-border-box,.amp-border-box *,.amp-border-box :after,.amp-border-box :before{box-sizing:border-box}amp-pixel{display:none!important}amp-instagram{padding:64px 0px 0px!important;background-color:#fff}amp-analytics,amp-story-auto-ads{position:fixed!important;top:0!important;width:1px!important;height:1px!important;overflow:hidden!important;visibility:hidden}html.i-amphtml-fie>amp-analytics{position:initial!important}amp-iframe iframe{box-sizing:border-box!important}[amp-access][amp-access-hide]{display:none}[subscriptions-dialog],body:not(.i-amphtml-subs-ready) [subscriptions-action],body:not(.i-amphtml-subs-ready) [subscriptions-section]{display:none!important}[visible-when-invalid]:not(.visible),amp-experiment,amp-live-list>[update],amp-share-tracking,form [submit-error],form [submit-success],form [submitting]{display:none}.i-amphtml-jank-meter{position:fixed;background-color:rgba(232,72,95,0.5);bottom:0;right:0;color:#fff;font-size:16px;z-index:1000;padding:5px}amp-accordion{display:block!important}amp-accordion>section{float:none!important}amp-accordion>section>*{float:none!important;display:block!important;overflow:hidden!important;position:relative!important}.i-amphtml-accordion-content,.i-amphtml-accordion-header,amp-accordion,amp-accordion>section{margin:0}.i-amphtml-accordion-header{cursor:pointer;background-color:#efefef;padding-right:20px;border:1px solid #dfdfdf}amp-accordion>section>:last-child{display:none!important}amp-accordion>section[expanded]>:last-child{display:block!important}amp-list[resizable-children]>.i-amphtml-loading-container.amp-hidden{display:none!important}amp-list[load-more] [load-more-button],amp-list[load-more] [load-more-end],amp-list[load-more] [load-more-failed],amp-list[load-more] [load-more-loading]{display:none}amp-story-page,amp-story[standalone]{display:block!important;height:100%!important;margin:0!important;padding:0!important;overflow:hidden!important;width:100%!important}amp-story[standalone]{background-color:#fff!important;position:relative!important}amp-story-page{background-color:#757575}amp-story .i-amphtml-loader{display:none!important}[amp-fx^=fly-in]{visibility:hidden}amp-addthis[data-widget-type=floating]{position:fixed!important;width:100%!important;height:50px;bottom:0}\n/*# sourceURL=/css/amp.css*/", 
    function() {
      _.$startupChunk$$module$src$chunk$$(window.self.document, function() {
        _.$installRuntimeServices$$module$src$runtime$$(window.self);
        _.$installAmpdocServices$$module$src$runtime$$($ampdoc$jscomp$86$$);
        _.$JSCompiler_StaticMethods_coreServicesAvailable$$($perf$jscomp$3$$);
        _.$maybeTrackImpression$$module$src$impression$$();
      });
      _.$startupChunk$$module$src$chunk$$(window.self.document, function() {
        _.$adopt$$module$src$runtime$$();
      });
      _.$startupChunk$$module$src$chunk$$(window.self.document, function() {
        _.$installBuiltins$$module$src$runtime$$();
      });
      _.$startupChunk$$module$src$chunk$$(window.self.document, function() {
        _.$stubElementsForDoc$$module$src$service$custom_element_registry$$($ampdoc$jscomp$86$$);
      });
      _.$startupChunk$$module$src$chunk$$(window.self.document, function() {
        var $ampdoc$jscomp$86$$ = window.self, $perf$jscomp$3$$ = $ampdoc$jscomp$86$$.document.documentElement;
        "0" == _.$JSCompiler_StaticMethods_getParam$$(_.$Services$$module$src$services$viewerForDoc$$($perf$jscomp$3$$), "p2r") && _.$JSCompiler_StaticMethods_isChrome$$(_.$Services$$module$src$services$platformFor$$($ampdoc$jscomp$86$$)) && new $PullToRefreshBlocker$$module$src$pull_to_refresh$$($ampdoc$jscomp$86$$.document, _.$Services$$module$src$services$viewportForDoc$$($perf$jscomp$3$$));
        _.$maybeValidate$$module$src$validator_integration$$();
        _.$makeBodyVisible$$module$src$style_installer$$();
      });
      _.$startupChunk$$module$src$chunk$$(window.self.document, function() {
        $perf$jscomp$3$$.$D$("e_is");
        var $JSCompiler_StaticMethods_ampInitComplete$self$jscomp$inline_1791$$ = _.$Services$$module$src$services$resourcesForDoc$$($ampdoc$jscomp$86$$);
        $JSCompiler_StaticMethods_ampInitComplete$self$jscomp$inline_1791$$.$V$ = !0;
        _.$JSCompiler_StaticMethods_schedulePass$$($JSCompiler_StaticMethods_ampInitComplete$self$jscomp$inline_1791$$);
        $perf$jscomp$3$$.$F$();
      });
    }, !0, "amp-runtime");
  });
  window.self.console && (window.console.info || window.console.log).call(window.console, "Powered by AMP \u26a1 HTML \u2013 Version 1901181729101", window.self.location.href);
  window.self.document.documentElement.setAttribute("amp-version", "1901181729101");
}
;
})(AMP._=AMP._||{})}catch(e){setTimeout(function(){var s=document.body.style;s.opacity=1;s.visibility="visible";s.animation="none";s.WebkitAnimation="none;"},1000);throw e};