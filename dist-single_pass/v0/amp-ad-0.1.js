(self.AMP=self.AMP||[]).push({n:"amp-ad",i:["_base_i","_base_ad"],v:"1901181729101",f:(function(AMP,_){
var $JSCompiler_StaticMethods_loadElementClass$$ = function($JSCompiler_StaticMethods_loadElementClass$self$$, $elementName$jscomp$6$$) {
  return _.$JSCompiler_StaticMethods_preloadExtension$$($JSCompiler_StaticMethods_loadElementClass$self$$, $elementName$jscomp$6$$).then(function($JSCompiler_StaticMethods_loadElementClass$self$$) {
    return $JSCompiler_StaticMethods_loadElementClass$self$$.elements[$elementName$jscomp$6$$].$implementationClass$;
  });
}, $JSCompiler_StaticMethods_maybeSelectExperiment$$ = function($win$jscomp$269$$, $selectionBranches$$, $experimentName$jscomp$3$$) {
  var $experimentInfoMap$$ = {};
  $experimentInfoMap$$[$experimentName$jscomp$3$$] = {$isTrafficEligible$:function() {
    return !0;
  }, $branches$:$selectionBranches$$};
  _.$randomlySelectUnsetExperiments$$module$src$experiments$$($win$jscomp$269$$, $experimentInfoMap$$);
  return _.$getExperimentBranch$$module$src$experiments$$($win$jscomp$269$$, $experimentName$jscomp$3$$);
}, $forceExperimentBranch$$module$src$experiments$$ = function($win$jscomp$28$$, $experimentName$jscomp$2$$, $branchId$$) {
  $win$jscomp$28$$.$experimentBranches$ = $win$jscomp$28$$.$experimentBranches$ || {};
  _.$toggleExperiment$$module$src$experiments$$($win$jscomp$28$$, $experimentName$jscomp$2$$, !!$branchId$$, !0);
  $win$jscomp$28$$.$experimentBranches$[$experimentName$jscomp$2$$] = $branchId$$;
}, $getConsentPolicySharedData$$module$src$consent$$ = function($element$jscomp$87$$, $policyId$jscomp$2$$) {
  return _.$Services$$module$src$services$consentPolicyServiceForDocOrNull$$($element$jscomp$87$$).then(function($element$jscomp$87$$) {
    return $element$jscomp$87$$ ? $element$jscomp$87$$.$Y$($policyId$jscomp$2$$) : null;
  });
}, $getConsentPolicyInfo$$module$src$consent$$ = function($element$jscomp$88$$, $policyId$jscomp$3$$) {
  return _.$Services$$module$src$services$consentPolicyServiceForDocOrNull$$($element$jscomp$88$$).then(function($element$jscomp$88$$) {
    return $element$jscomp$88$$ ? $element$jscomp$88$$.$W$($policyId$jscomp$3$$) : null;
  });
}, $listenForOncePromise$$module$src$iframe_helper$$ = function($iframe$jscomp$2$$, $typeOfMessages$$) {
  var $unlistenList$$ = [];
  "string" == typeof $typeOfMessages$$ && ($typeOfMessages$$ = [$typeOfMessages$$]);
  return new window.Promise(function($resolve$jscomp$22$$) {
    for (var $i$jscomp$71$$ = 0; $i$jscomp$71$$ < $typeOfMessages$$.length; $i$jscomp$71$$++) {
      var $unlisten$jscomp$5$$ = _.$listenFor$$module$src$iframe_helper$$($iframe$jscomp$2$$, $typeOfMessages$$[$i$jscomp$71$$], function($iframe$jscomp$2$$, $typeOfMessages$$, $i$jscomp$71$$) {
        for (var $unlisten$jscomp$5$$ = 0; $unlisten$jscomp$5$$ < $unlistenList$$.length; $unlisten$jscomp$5$$++) {
          $unlistenList$$[$unlisten$jscomp$5$$]();
        }
        $resolve$jscomp$22$$({data:$iframe$jscomp$2$$, source:$typeOfMessages$$, origin:$i$jscomp$71$$});
      }, !0);
      $unlistenList$$.push($unlisten$jscomp$5$$);
    }
  });
}, $getAdContainer$$module$src$ad_helper$$ = function($element$jscomp$237$$) {
  if (void 0 === $element$jscomp$237$$.__AMP__AD_CONTAINER) {
    for (var $el$jscomp$26$$ = $element$jscomp$237$$.parentElement; $el$jscomp$26$$ && "BODY" != $el$jscomp$26$$.tagName;) {
      if (_.$CONTAINERS$$module$src$ad_helper$$[$el$jscomp$26$$.tagName]) {
        return $element$jscomp$237$$.__AMP__AD_CONTAINER = $el$jscomp$26$$.tagName;
      }
      $el$jscomp$26$$ = $el$jscomp$26$$.parentElement;
    }
    $element$jscomp$237$$.__AMP__AD_CONTAINER = null;
  }
  return $element$jscomp$237$$.__AMP__AD_CONTAINER;
}, $getAdCid$$module$src$ad_cid$$ = function($adElement$$) {
  var $config$jscomp$5$$ = $adConfig$$module$ads$_config$$[$adElement$$.element.getAttribute("type")];
  return $config$jscomp$5$$ && $config$jscomp$5$$.$clientIdScope$ ? _.$getOrCreateAdCid$$module$src$ad_cid$$($adElement$$.$getAmpDoc$(), $config$jscomp$5$$.$clientIdScope$, $config$jscomp$5$$.$clientIdCookieName$) : window.Promise.resolve();
}, $adsenseIsA4AEnabled$$module$extensions$amp_ad_network_adsense_impl$0_1$adsense_a4a_config$$ = function($win$jscomp$271$$, $element$jscomp$249$$, $experimentId$jscomp$inline_5943_experimentId$jscomp$inline_5949_urlExperimentId$jscomp$inline_2331_useRemoteHtml$$) {
  if ($experimentId$jscomp$inline_5943_experimentId$jscomp$inline_5949_urlExperimentId$jscomp$inline_2331_useRemoteHtml$$ || !$element$jscomp$249$$.getAttribute("data-ad-client")) {
    return !1;
  }
  if ($experimentId$jscomp$inline_5943_experimentId$jscomp$inline_5949_urlExperimentId$jscomp$inline_2331_useRemoteHtml$$ = $JSCompiler_StaticMethods_maybeSelectExperiment$$($win$jscomp$271$$, ["21062154", "21062155"], "expAdsenseUnconditionedCanonical")) {
    _.$addExperimentIdToElement$$module$ads$google$a4a$traffic_experiments$$($experimentId$jscomp$inline_5943_experimentId$jscomp$inline_5949_urlExperimentId$jscomp$inline_2331_useRemoteHtml$$, $element$jscomp$249$$), $forceExperimentBranch$$module$src$experiments$$($win$jscomp$271$$, "expAdsenseUnconditionedCanonical", $experimentId$jscomp$inline_5943_experimentId$jscomp$inline_5949_urlExperimentId$jscomp$inline_2331_useRemoteHtml$$);
  }
  $experimentId$jscomp$inline_5943_experimentId$jscomp$inline_5949_urlExperimentId$jscomp$inline_2331_useRemoteHtml$$ = _.$extractUrlExperimentId$$module$ads$google$a4a$traffic_experiments$$($win$jscomp$271$$, $element$jscomp$249$$);
  var $experimentId$jscomp$inline_2332$$ = $URL_EXPERIMENT_MAPPING$$module$extensions$amp_ad_network_adsense_impl$0_1$adsense_a4a_config$$[$experimentId$jscomp$inline_5943_experimentId$jscomp$inline_5949_urlExperimentId$jscomp$inline_2331_useRemoteHtml$$ || ""];
  $experimentId$jscomp$inline_2332$$ && (_.$addExperimentIdToElement$$module$ads$google$a4a$traffic_experiments$$($experimentId$jscomp$inline_2332$$, $element$jscomp$249$$), $forceExperimentBranch$$module$src$experiments$$($win$jscomp$271$$, "expAdsenseA4A", $experimentId$jscomp$inline_2332$$), _.$dev$$module$src$log$$().$Log$$module$src$log_prototype$info$("amp-ad-network-adsense-impl", "url experiment selection " + $experimentId$jscomp$inline_5943_experimentId$jscomp$inline_5949_urlExperimentId$jscomp$inline_2331_useRemoteHtml$$ + 
  ": " + $experimentId$jscomp$inline_2332$$ + "."));
  _.$getExperimentBranch$$module$src$experiments$$($win$jscomp$271$$, "expAdsenseUnconditionedCanonical") || _.$isCdnProxy$$module$ads$google$a4a$utils$$($win$jscomp$271$$) || !($experimentId$jscomp$inline_5943_experimentId$jscomp$inline_5949_urlExperimentId$jscomp$inline_2331_useRemoteHtml$$ = $JSCompiler_StaticMethods_maybeSelectExperiment$$($win$jscomp$271$$, ["21062158", "21062159"], "expAdsenseCanonical")) || (_.$addExperimentIdToElement$$module$ads$google$a4a$traffic_experiments$$($experimentId$jscomp$inline_5943_experimentId$jscomp$inline_5949_urlExperimentId$jscomp$inline_2331_useRemoteHtml$$, 
  $element$jscomp$249$$), $forceExperimentBranch$$module$src$experiments$$($win$jscomp$271$$, "expAdsenseCanonical", $experimentId$jscomp$inline_5943_experimentId$jscomp$inline_5949_urlExperimentId$jscomp$inline_2331_useRemoteHtml$$));
  return $win$jscomp$271$$.crypto && ($win$jscomp$271$$.crypto.subtle || $win$jscomp$271$$.crypto.$D$) && (!!_.$isCdnProxy$$module$ads$google$a4a$utils$$($win$jscomp$271$$) || !1) || "21062154" == _.$getExperimentBranch$$module$src$experiments$$($win$jscomp$271$$, "expAdsenseUnconditionedCanonical") || "21062158" == _.$getExperimentBranch$$module$src$experiments$$($win$jscomp$271$$, "expAdsenseCanonical");
}, $cloudflareIsA4AEnabled$$module$extensions$amp_ad_network_cloudflare_impl$0_1$cloudflare_a4a_config$$ = function($win$jscomp$272$$, $element$jscomp$250$$, $useRemoteHtml$jscomp$1$$) {
  return !$useRemoteHtml$jscomp$1$$;
}, $tripleliftIsA4AEnabled$$module$extensions$amp_ad_network_triplelift_impl$0_1$triplelift_a4a_config$$ = function($win$jscomp$273$$, $element$jscomp$251$$, $useRemoteHtml$jscomp$2$$) {
  var $src$jscomp$11$$;
  return !$useRemoteHtml$jscomp$2$$ && !!$element$jscomp$251$$.getAttribute("data-use-a4a") && !!($src$jscomp$11$$ = $element$jscomp$251$$.getAttribute("src")) && 0 == $src$jscomp$11$$.indexOf("https://ib.3lift.com/");
}, $gmosspIsA4AEnabled$$module$extensions$amp_ad_network_gmossp_impl$0_1$gmossp_a4a_config$$ = function($win$jscomp$274$$, $element$jscomp$252$$, $useRemoteHtml$jscomp$3$$) {
  var $src$jscomp$12$$;
  return !$useRemoteHtml$jscomp$3$$ && !!($src$jscomp$12$$ = $element$jscomp$252$$.getAttribute("src")) && !!$element$jscomp$252$$.getAttribute("data-use-a4a") && (_.$startsWith$$module$src$string$$($src$jscomp$12$$, "https://sp.gmossp-sp.jp/") || _.$startsWith$$module$src$string$$($src$jscomp$12$$, "https://amp.sp.gmossp-sp.jp/_a4a/"));
}, $getA4ARegistry$$module$ads$_a4a_config$$ = function() {
  $a4aRegistry$$module$ads$_a4a_config$$ || ($a4aRegistry$$module$ads$_a4a_config$$ = _.$map$$module$src$utils$object$$({adsense:$adsenseIsA4AEnabled$$module$extensions$amp_ad_network_adsense_impl$0_1$adsense_a4a_config$$, adzerk:function() {
    return !0;
  }, doubleclick:function() {
    return !0;
  }, triplelift:$tripleliftIsA4AEnabled$$module$extensions$amp_ad_network_triplelift_impl$0_1$triplelift_a4a_config$$, cloudflare:$cloudflareIsA4AEnabled$$module$extensions$amp_ad_network_cloudflare_impl$0_1$cloudflare_a4a_config$$, gmossp:$gmosspIsA4AEnabled$$module$extensions$amp_ad_network_gmossp_impl$0_1$gmossp_a4a_config$$, fake:function() {
    return !0;
  }}));
  return $a4aRegistry$$module$ads$_a4a_config$$;
}, $IntersectionObserver$$module$src$intersection_observer$$ = function($baseElement$jscomp$2$$, $iframe$jscomp$24$$) {
  var $$jscomp$this$jscomp$348$$ = this;
  this.$F$ = $baseElement$jscomp$2$$;
  this.$timer_$ = _.$Services$$module$src$services$timerFor$$($baseElement$jscomp$2$$.$win$);
  this.$inViewport_$ = this.$K$ = !1;
  this.$D$ = [];
  this.$G$ = 0;
  this.$O$ = this.$J$.bind(this);
  this.$I$ = new _.$SubscriptionApi$$module$src$iframe_helper$$($iframe$jscomp$24$$, "send-intersections", !0, function() {
    return $JSCompiler_StaticMethods_startSendingIntersectionChanges_$$($$jscomp$this$jscomp$348$$);
  });
  this.$unlistenViewportChanges_$ = null;
}, $JSCompiler_StaticMethods_startSendingIntersectionChanges_$$ = function($JSCompiler_StaticMethods_startSendingIntersectionChanges_$self$$) {
  $JSCompiler_StaticMethods_startSendingIntersectionChanges_$self$$.$K$ = !0;
  _.$JSCompiler_StaticMethods_getVsync$$($JSCompiler_StaticMethods_startSendingIntersectionChanges_$self$$.$F$).measure(function() {
    $JSCompiler_StaticMethods_startSendingIntersectionChanges_$self$$.$F$.$isInViewport$() && $JSCompiler_StaticMethods_startSendingIntersectionChanges_$self$$.$onViewportCallback$(!0);
    $JSCompiler_StaticMethods_startSendingIntersectionChanges_$self$$.$fire$();
  });
}, $appendToResult$$module$src$get_html$$ = function($child$jscomp$11_node$jscomp$59$$, $allowedAttrs_attrs$jscomp$2$$, $result$jscomp$30$$) {
  var $stack$jscomp$4$$ = [$child$jscomp$11_node$jscomp$59$$];
  for ($allowedAttrs_attrs$jscomp$2$$ = $allowedAttrs_attrs$jscomp$2$$.filter(function($child$jscomp$11_node$jscomp$59$$) {
    return $allowedAttributes$$module$src$get_html$$.includes($child$jscomp$11_node$jscomp$59$$);
  }); 0 < $stack$jscomp$4$$.length;) {
    if ($child$jscomp$11_node$jscomp$59$$ = $stack$jscomp$4$$.pop(), "string" === typeof $child$jscomp$11_node$jscomp$59$$) {
      $result$jscomp$30$$.push($child$jscomp$11_node$jscomp$59$$);
    } else {
      if ($child$jscomp$11_node$jscomp$59$$.nodeType === window.Node.TEXT_NODE) {
        $result$jscomp$30$$.push($child$jscomp$11_node$jscomp$59$$.textContent);
      } else {
        if ($child$jscomp$11_node$jscomp$59$$.nodeType === window.Node.ELEMENT_NODE && $isApplicableNode$$module$src$get_html$$($child$jscomp$11_node$jscomp$59$$)) {
          for ($appendOpenTag$$module$src$get_html$$($child$jscomp$11_node$jscomp$59$$, $allowedAttrs_attrs$jscomp$2$$, $result$jscomp$30$$), $stack$jscomp$4$$.push("</" + $child$jscomp$11_node$jscomp$59$$.tagName.toLowerCase() + ">"), $child$jscomp$11_node$jscomp$59$$ = $child$jscomp$11_node$jscomp$59$$.lastChild; $child$jscomp$11_node$jscomp$59$$; $child$jscomp$11_node$jscomp$59$$ = $child$jscomp$11_node$jscomp$59$$.previousSibling) {
            $stack$jscomp$4$$.push($child$jscomp$11_node$jscomp$59$$);
          }
        }
      }
    }
  }
}, $isApplicableNode$$module$src$get_html$$ = function($node$jscomp$60$$) {
  var $tagName$jscomp$29$$ = $node$jscomp$60$$.tagName.toLowerCase();
  return _.$startsWith$$module$src$string$$($tagName$jscomp$29$$, "amp-") ? !(!$allowedAmpTags$$module$src$get_html$$.includes($tagName$jscomp$29$$) || !$node$jscomp$60$$.textContent) : !($excludedTags$$module$src$get_html$$.includes($tagName$jscomp$29$$) || !$node$jscomp$60$$.textContent);
}, $appendOpenTag$$module$src$get_html$$ = function($node$jscomp$61$$, $attrs$jscomp$3$$, $result$jscomp$31$$) {
  $result$jscomp$31$$.push("<" + $node$jscomp$61$$.tagName.toLowerCase());
  $attrs$jscomp$3$$.forEach(function($attrs$jscomp$3$$) {
    $node$jscomp$61$$.hasAttribute($attrs$jscomp$3$$) && $result$jscomp$31$$.push(" " + $attrs$jscomp$3$$ + '="' + $node$jscomp$61$$.getAttribute($attrs$jscomp$3$$) + '"');
  });
  $result$jscomp$31$$.push(">");
}, $AmpAdUIHandler$$module$extensions$amp_ad$0_1$amp_ad_ui$$ = function($baseInstance$jscomp$3_fallback$jscomp$1$$) {
  this.$D$ = $baseInstance$jscomp$3_fallback$jscomp$1$$;
  this.$element_$ = $baseInstance$jscomp$3_fallback$jscomp$1$$.element;
  this.$doc_$ = $baseInstance$jscomp$3_fallback$jscomp$1$$.$win$.document;
  this.$J$ = null;
  if (this.$element_$.hasAttribute("data-ad-container-id")) {
    var $container$jscomp$8_id$jscomp$49$$ = this.$element_$.getAttribute("data-ad-container-id");
    ($container$jscomp$8_id$jscomp$49$$ = this.$doc_$.getElementById($container$jscomp$8_id$jscomp$49$$)) && "AMP-LAYOUT" == $container$jscomp$8_id$jscomp$49$$.tagName && $container$jscomp$8_id$jscomp$49$$.contains(this.$element_$) && (this.$J$ = $container$jscomp$8_id$jscomp$49$$);
  }
  $baseInstance$jscomp$3_fallback$jscomp$1$$.$getFallback$() || ($baseInstance$jscomp$3_fallback$jscomp$1$$ = $JSCompiler_StaticMethods_addDefaultUiComponent_$$(this, "fallback")) && this.$D$.element.appendChild($baseInstance$jscomp$3_fallback$jscomp$1$$);
}, $JSCompiler_StaticMethods_addDefaultUiComponent_$$ = function($JSCompiler_StaticMethods_addDefaultUiComponent_$self_content$jscomp$10$$, $name$jscomp$185$$) {
  if ("AMP-EMBED" == $JSCompiler_StaticMethods_addDefaultUiComponent_$self_content$jscomp$10$$.$element_$.tagName) {
    return null;
  }
  var $uiComponent$$ = $JSCompiler_StaticMethods_addDefaultUiComponent_$self_content$jscomp$10$$.$doc_$.createElement("div");
  $uiComponent$$.setAttribute($name$jscomp$185$$, "");
  $JSCompiler_StaticMethods_addDefaultUiComponent_$self_content$jscomp$10$$ = $JSCompiler_StaticMethods_addDefaultUiComponent_$self_content$jscomp$10$$.$doc_$.createElement("div");
  $JSCompiler_StaticMethods_addDefaultUiComponent_$self_content$jscomp$10$$.classList.add("i-amphtml-ad-default-holder");
  $JSCompiler_StaticMethods_addDefaultUiComponent_$self_content$jscomp$10$$.setAttribute("data-ad-holder-text", "Ad");
  $uiComponent$$.appendChild($JSCompiler_StaticMethods_addDefaultUiComponent_$self_content$jscomp$10$$);
  return $uiComponent$$;
}, $JSCompiler_StaticMethods_updateSize$$ = function($JSCompiler_StaticMethods_updateSize$self$$, $height$jscomp$31$$, $width$jscomp$34$$, $iframeHeight$jscomp$1$$, $iframeWidth$$) {
  var $newHeight$jscomp$12$$, $newWidth$jscomp$8$$;
  $height$jscomp$31$$ = (0,window.parseInt)($height$jscomp$31$$, 10);
  (0,window.isNaN)($height$jscomp$31$$) || ($newHeight$jscomp$12$$ = Math.max($JSCompiler_StaticMethods_updateSize$self$$.$element_$.offsetHeight + $height$jscomp$31$$ - $iframeHeight$jscomp$1$$, $height$jscomp$31$$));
  $width$jscomp$34$$ = (0,window.parseInt)($width$jscomp$34$$, 10);
  (0,window.isNaN)($width$jscomp$34$$) || ($newWidth$jscomp$8$$ = Math.max($JSCompiler_StaticMethods_updateSize$self$$.$element_$.offsetWidth + $width$jscomp$34$$ - $iframeWidth$$, $width$jscomp$34$$));
  var $resizeInfo$$ = {$success$:!0, $newWidth$:$newWidth$jscomp$8$$, $newHeight$:$newHeight$jscomp$12$$};
  return $newHeight$jscomp$12$$ || $newWidth$jscomp$8$$ ? "AMP-STICKY-AD" == $getAdContainer$$module$src$ad_helper$$($JSCompiler_StaticMethods_updateSize$self$$.$element_$) ? ($resizeInfo$$.$success$ = !1, window.Promise.resolve($resizeInfo$$)) : $JSCompiler_StaticMethods_updateSize$self$$.$D$.$attemptChangeSize$($newHeight$jscomp$12$$, $newWidth$jscomp$8$$).then(function() {
    return $resizeInfo$$;
  }, function() {
    $resizeInfo$$.$success$ = !1;
    return $resizeInfo$$;
  }) : window.Promise.reject(Error("undefined width and height"));
}, $AmpAdXOriginIframeHandler$$module$extensions$amp_ad$0_1$amp_ad_xorigin_iframe_handler$$ = function($baseInstance$jscomp$4$$) {
  this.$I$ = $baseInstance$jscomp$4$$.$win$;
  this.$D$ = $baseInstance$jscomp$4$$;
  this.$element_$ = $baseInstance$jscomp$4$$.element;
  this.$O$ = $baseInstance$jscomp$4$$.$uiHandler$;
  this.$F$ = this.$G$ = this.$intersectionObserver_$ = this.iframe = null;
  this.$K$ = !1;
  this.$unlisteners_$ = [];
  this.$viewer_$ = _.$Services$$module$src$services$viewerForDoc$$(this.$D$.$getAmpDoc$());
  this.$viewport_$ = _.$Services$$module$src$services$viewportForDoc$$(this.$D$.$getAmpDoc$());
  this.$J$ = !1;
}, $JSCompiler_StaticMethods_handleOneTimeRequest_$$ = function($JSCompiler_StaticMethods_handleOneTimeRequest_$self$$, $requestType$$, $getter$jscomp$5$$) {
  $JSCompiler_StaticMethods_handleOneTimeRequest_$self$$.$unlisteners_$.push(_.$listenFor$$module$src$iframe_helper$$($JSCompiler_StaticMethods_handleOneTimeRequest_$self$$.iframe, $requestType$$, function($info$jscomp$9$$, $source$jscomp$37$$, $origin$jscomp$22$$) {
    if ($JSCompiler_StaticMethods_handleOneTimeRequest_$self$$.iframe) {
      var $messageId$$ = $info$jscomp$9$$.messageId;
      $getter$jscomp$5$$($info$jscomp$9$$.payload).then(function($getter$jscomp$5$$) {
        var $info$jscomp$9$$ = {messageId:$messageId$$};
        $info$jscomp$9$$.content = $getter$jscomp$5$$;
        _.$postMessageToWindows$$module$src$iframe_helper$$($JSCompiler_StaticMethods_handleOneTimeRequest_$self$$.iframe, [{$win$:$source$jscomp$37$$, origin:$origin$jscomp$22$$}], $requestType$$ + "-result", $info$jscomp$9$$, !0);
      });
    }
  }, !0, !1));
}, $JSCompiler_StaticMethods_renderStart_$$ = function($JSCompiler_StaticMethods_renderStart_$self$$, $opt_info$$) {
  $JSCompiler_StaticMethods_renderStart_$self$$.$D$.$renderStarted$();
  if ($opt_info$$) {
    var $data$jscomp$96$$ = $opt_info$$.data;
    $JSCompiler_StaticMethods_AmpAdXOriginIframeHandler$$module$extensions$amp_ad$0_1$amp_ad_xorigin_iframe_handler_prototype$handleResize_$$($JSCompiler_StaticMethods_renderStart_$self$$, $data$jscomp$96$$.height, $data$jscomp$96$$.width, $opt_info$$.source, $opt_info$$.origin);
  }
}, $JSCompiler_StaticMethods_noContent_$$ = function($JSCompiler_StaticMethods_noContent_$self$$) {
  $JSCompiler_StaticMethods_noContent_$self$$.iframe && ($JSCompiler_StaticMethods_noContent_$self$$.$freeXOriginIframe$(0 <= $JSCompiler_StaticMethods_noContent_$self$$.iframe.name.indexOf("_master")), $JSCompiler_StaticMethods_noContent_$self$$.$O$.$F$());
}, $JSCompiler_StaticMethods_AmpAdXOriginIframeHandler$$module$extensions$amp_ad$0_1$amp_ad_xorigin_iframe_handler_prototype$cleanup_$$ = function($JSCompiler_StaticMethods_AmpAdXOriginIframeHandler$$module$extensions$amp_ad$0_1$amp_ad_xorigin_iframe_handler_prototype$cleanup_$self$$) {
  $JSCompiler_StaticMethods_AmpAdXOriginIframeHandler$$module$extensions$amp_ad$0_1$amp_ad_xorigin_iframe_handler_prototype$cleanup_$self$$.$unlisteners_$.forEach(function($JSCompiler_StaticMethods_AmpAdXOriginIframeHandler$$module$extensions$amp_ad$0_1$amp_ad_xorigin_iframe_handler_prototype$cleanup_$self$$) {
    return $JSCompiler_StaticMethods_AmpAdXOriginIframeHandler$$module$extensions$amp_ad$0_1$amp_ad_xorigin_iframe_handler_prototype$cleanup_$self$$();
  });
  $JSCompiler_StaticMethods_AmpAdXOriginIframeHandler$$module$extensions$amp_ad$0_1$amp_ad_xorigin_iframe_handler_prototype$cleanup_$self$$.$unlisteners_$.length = 0;
  $JSCompiler_StaticMethods_AmpAdXOriginIframeHandler$$module$extensions$amp_ad$0_1$amp_ad_xorigin_iframe_handler_prototype$cleanup_$self$$.$G$ && ($JSCompiler_StaticMethods_AmpAdXOriginIframeHandler$$module$extensions$amp_ad$0_1$amp_ad_xorigin_iframe_handler_prototype$cleanup_$self$$.$G$.$destroy$(), $JSCompiler_StaticMethods_AmpAdXOriginIframeHandler$$module$extensions$amp_ad$0_1$amp_ad_xorigin_iframe_handler_prototype$cleanup_$self$$.$G$ = null);
  $JSCompiler_StaticMethods_AmpAdXOriginIframeHandler$$module$extensions$amp_ad$0_1$amp_ad_xorigin_iframe_handler_prototype$cleanup_$self$$.$F$ && ($JSCompiler_StaticMethods_AmpAdXOriginIframeHandler$$module$extensions$amp_ad$0_1$amp_ad_xorigin_iframe_handler_prototype$cleanup_$self$$.$F$.$destroy$(), $JSCompiler_StaticMethods_AmpAdXOriginIframeHandler$$module$extensions$amp_ad$0_1$amp_ad_xorigin_iframe_handler_prototype$cleanup_$self$$.$F$ = null);
  $JSCompiler_StaticMethods_AmpAdXOriginIframeHandler$$module$extensions$amp_ad$0_1$amp_ad_xorigin_iframe_handler_prototype$cleanup_$self$$.$intersectionObserver_$ && ($JSCompiler_StaticMethods_AmpAdXOriginIframeHandler$$module$extensions$amp_ad$0_1$amp_ad_xorigin_iframe_handler_prototype$cleanup_$self$$.$intersectionObserver_$.$destroy$(), $JSCompiler_StaticMethods_AmpAdXOriginIframeHandler$$module$extensions$amp_ad$0_1$amp_ad_xorigin_iframe_handler_prototype$cleanup_$self$$.$intersectionObserver_$ = 
  null);
}, $JSCompiler_StaticMethods_AmpAdXOriginIframeHandler$$module$extensions$amp_ad$0_1$amp_ad_xorigin_iframe_handler_prototype$handleResize_$$ = function($JSCompiler_StaticMethods_AmpAdXOriginIframeHandler$$module$extensions$amp_ad$0_1$amp_ad_xorigin_iframe_handler_prototype$handleResize_$self$$, $height$jscomp$32$$, $width$jscomp$35$$, $source$jscomp$38$$, $origin$jscomp$23$$) {
  _.$JSCompiler_StaticMethods_getVsync$$($JSCompiler_StaticMethods_AmpAdXOriginIframeHandler$$module$extensions$amp_ad$0_1$amp_ad_xorigin_iframe_handler_prototype$handleResize_$self$$.$D$).$mutate$(function() {
    $JSCompiler_StaticMethods_AmpAdXOriginIframeHandler$$module$extensions$amp_ad$0_1$amp_ad_xorigin_iframe_handler_prototype$handleResize_$self$$.iframe && $JSCompiler_StaticMethods_updateSize$$($JSCompiler_StaticMethods_AmpAdXOriginIframeHandler$$module$extensions$amp_ad$0_1$amp_ad_xorigin_iframe_handler_prototype$handleResize_$self$$.$O$, $height$jscomp$32$$, $width$jscomp$35$$, $JSCompiler_StaticMethods_AmpAdXOriginIframeHandler$$module$extensions$amp_ad$0_1$amp_ad_xorigin_iframe_handler_prototype$handleResize_$self$$.iframe.offsetHeight, 
    $JSCompiler_StaticMethods_AmpAdXOriginIframeHandler$$module$extensions$amp_ad$0_1$amp_ad_xorigin_iframe_handler_prototype$handleResize_$self$$.iframe.offsetWidth).then(function($height$jscomp$32$$) {
      $JSCompiler_StaticMethods_AmpAdXOriginIframeHandler$$module$extensions$amp_ad$0_1$amp_ad_xorigin_iframe_handler_prototype$handleResize_$self$$.iframe && _.$postMessageToWindows$$module$src$iframe_helper$$($JSCompiler_StaticMethods_AmpAdXOriginIframeHandler$$module$extensions$amp_ad$0_1$amp_ad_xorigin_iframe_handler_prototype$handleResize_$self$$.iframe, [{$win$:$source$jscomp$38$$, origin:$origin$jscomp$23$$}], $height$jscomp$32$$.$success$ ? "embed-size-changed" : "embed-size-denied", _.$dict$$module$src$utils$object$$({requestedWidth:$height$jscomp$32$$.$newWidth$, 
      requestedHeight:$height$jscomp$32$$.$newHeight$}), !0);
    }, function() {
    });
  });
}, $JSCompiler_StaticMethods_sendEmbedInfo_$$ = function($JSCompiler_StaticMethods_sendEmbedInfo_$self$$, $inViewport$jscomp$10$$) {
  $JSCompiler_StaticMethods_sendEmbedInfo_$self$$.$G$ && _.$JSCompiler_StaticMethods_SubscriptionApi$$module$src$iframe_helper_prototype$send$$($JSCompiler_StaticMethods_sendEmbedInfo_$self$$.$G$, "embed-state", _.$dict$$module$src$utils$object$$({inViewport:$inViewport$jscomp$10$$, pageHidden:!_.$JSCompiler_StaticMethods_Viewer$$module$src$service$viewer_impl_prototype$isVisible$$($JSCompiler_StaticMethods_sendEmbedInfo_$self$$.$viewer_$)}));
}, $JSCompiler_StaticMethods_getIframePositionPromise_$$ = function($JSCompiler_StaticMethods_getIframePositionPromise_$self$$) {
  return _.$JSCompiler_StaticMethods_getClientRectAsync$$($JSCompiler_StaticMethods_getIframePositionPromise_$self$$.$viewport_$, $JSCompiler_StaticMethods_getIframePositionPromise_$self$$.iframe).then(function($position$jscomp$9$$) {
    var $viewport$jscomp$13$$ = _.$JSCompiler_StaticMethods_getRect$$($JSCompiler_StaticMethods_getIframePositionPromise_$self$$.$viewport_$);
    return _.$dict$$module$src$utils$object$$({targetRect:$position$jscomp$9$$, viewportRect:$viewport$jscomp$13$$});
  });
}, $JSCompiler_StaticMethods_sendPosition_$$ = function($JSCompiler_StaticMethods_sendPosition_$self$$) {
  $JSCompiler_StaticMethods_sendPosition_$self$$.$J$ || ($JSCompiler_StaticMethods_sendPosition_$self$$.$J$ = !0, $JSCompiler_StaticMethods_getIframePositionPromise_$$($JSCompiler_StaticMethods_sendPosition_$self$$).then(function($position$jscomp$10$$) {
    $JSCompiler_StaticMethods_sendPosition_$self$$.$J$ = !1;
    _.$JSCompiler_StaticMethods_SubscriptionApi$$module$src$iframe_helper_prototype$send$$($JSCompiler_StaticMethods_sendPosition_$self$$.$F$, "position", $position$jscomp$10$$);
  }));
}, $JSCompiler_StaticMethods_registerPosition_$$ = function($JSCompiler_StaticMethods_registerPosition_$self$$) {
  $JSCompiler_StaticMethods_registerPosition_$self$$.$K$ || ($JSCompiler_StaticMethods_registerPosition_$self$$.$K$ = !0, $JSCompiler_StaticMethods_registerPosition_$self$$.$unlisteners_$.push(_.$JSCompiler_StaticMethods_Viewport$$module$src$service$viewport$viewport_impl_prototype$onScroll$$($JSCompiler_StaticMethods_registerPosition_$self$$.$viewport_$, _.$throttle$$module$src$utils$rate_limit$$($JSCompiler_StaticMethods_registerPosition_$self$$.$I$, function() {
    $JSCompiler_StaticMethods_getIframePositionPromise_$$($JSCompiler_StaticMethods_registerPosition_$self$$).then(function($position$jscomp$11$$) {
      _.$JSCompiler_StaticMethods_SubscriptionApi$$module$src$iframe_helper_prototype$send$$($JSCompiler_StaticMethods_registerPosition_$self$$.$F$, "position", $position$jscomp$11$$);
    });
  }, 100))), $JSCompiler_StaticMethods_registerPosition_$self$$.$unlisteners_$.push(_.$JSCompiler_StaticMethods_Viewport$$module$src$service$viewport$viewport_impl_prototype$onResize$$($JSCompiler_StaticMethods_registerPosition_$self$$.$viewport_$, function() {
    $JSCompiler_StaticMethods_getIframePositionPromise_$$($JSCompiler_StaticMethods_registerPosition_$self$$).then(function($position$jscomp$12$$) {
      _.$JSCompiler_StaticMethods_SubscriptionApi$$module$src$iframe_helper_prototype$send$$($JSCompiler_StaticMethods_registerPosition_$self$$.$F$, "position", $position$jscomp$12$$);
    });
  })));
}, $AmpAd3PImpl$$module$extensions$amp_ad$0_1$amp_ad_3p_impl$$ = function($$jscomp$super$this$jscomp$12_element$jscomp$301$$) {
  $$jscomp$super$this$jscomp$12_element$jscomp$301$$ = window.AMP.BaseElement.call(this, $$jscomp$super$this$jscomp$12_element$jscomp$301$$) || this;
  $$jscomp$super$this$jscomp$12_element$jscomp$301$$.$iframe_$ = null;
  $$jscomp$super$this$jscomp$12_element$jscomp$301$$.config = null;
  $$jscomp$super$this$jscomp$12_element$jscomp$301$$.$uiHandler$ = null;
  $$jscomp$super$this$jscomp$12_element$jscomp$301$$.$xOriginIframeHandler_$ = null;
  $$jscomp$super$this$jscomp$12_element$jscomp$301$$.$placeholder_$ = null;
  $$jscomp$super$this$jscomp$12_element$jscomp$301$$.$fallback_$ = null;
  $$jscomp$super$this$jscomp$12_element$jscomp$301$$.$isInFixedContainer_$ = !1;
  $$jscomp$super$this$jscomp$12_element$jscomp$301$$.$iframeLayoutBox_$ = null;
  $$jscomp$super$this$jscomp$12_element$jscomp$301$$.$unlistenViewportChanges_$ = null;
  $$jscomp$super$this$jscomp$12_element$jscomp$301$$.$intersectionObserver_$ = null;
  $$jscomp$super$this$jscomp$12_element$jscomp$301$$.$container_$ = void 0;
  $$jscomp$super$this$jscomp$12_element$jscomp$301$$.$layoutPromise_$ = null;
  $$jscomp$super$this$jscomp$12_element$jscomp$301$$.$type_$ = void 0;
  $$jscomp$super$this$jscomp$12_element$jscomp$301$$.$isFullWidthAligned_$ = !1;
  $$jscomp$super$this$jscomp$12_element$jscomp$301$$.$isFullWidthRequested_$ = !1;
  return $$jscomp$super$this$jscomp$12_element$jscomp$301$$;
}, $JSCompiler_StaticMethods_AmpAd3PImpl$$module$extensions$amp_ad$0_1$amp_ad_3p_impl_prototype$measureIframeLayoutBox_$$ = function($JSCompiler_StaticMethods_AmpAd3PImpl$$module$extensions$amp_ad$0_1$amp_ad_3p_impl_prototype$measureIframeLayoutBox_$self$$) {
  if ($JSCompiler_StaticMethods_AmpAd3PImpl$$module$extensions$amp_ad$0_1$amp_ad_3p_impl_prototype$measureIframeLayoutBox_$self$$.$xOriginIframeHandler_$ && $JSCompiler_StaticMethods_AmpAd3PImpl$$module$extensions$amp_ad$0_1$amp_ad_3p_impl_prototype$measureIframeLayoutBox_$self$$.$xOriginIframeHandler_$.iframe) {
    var $iframeBox$jscomp$4$$ = $JSCompiler_StaticMethods_AmpAd3PImpl$$module$extensions$amp_ad$0_1$amp_ad_3p_impl_prototype$measureIframeLayoutBox_$self$$.$getViewport$().$getLayoutRect$($JSCompiler_StaticMethods_AmpAd3PImpl$$module$extensions$amp_ad$0_1$amp_ad_3p_impl_prototype$measureIframeLayoutBox_$self$$.$xOriginIframeHandler_$.iframe), $box$jscomp$14$$ = $JSCompiler_StaticMethods_AmpAd3PImpl$$module$extensions$amp_ad$0_1$amp_ad_3p_impl_prototype$measureIframeLayoutBox_$self$$.$getLayoutBox$();
    $JSCompiler_StaticMethods_AmpAd3PImpl$$module$extensions$amp_ad$0_1$amp_ad_3p_impl_prototype$measureIframeLayoutBox_$self$$.$iframeLayoutBox_$ = _.$moveLayoutRect$$module$src$layout_rect$$($iframeBox$jscomp$4$$, -$box$jscomp$14$$.left, -$box$jscomp$14$$.top);
  }
}, $JSCompiler_StaticMethods_getConsentState$$ = function($JSCompiler_StaticMethods_getConsentState$self$$) {
  var $consentPolicyId$jscomp$3$$ = window.AMP.BaseElement.prototype.$getConsentPolicy$.call($JSCompiler_StaticMethods_getConsentState$self$$);
  return $consentPolicyId$jscomp$3$$ ? _.$getConsentPolicyState$$module$src$consent$$($JSCompiler_StaticMethods_getConsentState$self$$.element, $consentPolicyId$jscomp$3$$) : window.Promise.resolve(null);
}, $JSCompiler_StaticMethods_attemptFullWidthSizeChange_$$ = function($JSCompiler_StaticMethods_attemptFullWidthSizeChange_$self$$) {
  var $viewportSize$jscomp$9$$ = $JSCompiler_StaticMethods_attemptFullWidthSizeChange_$self$$.$getViewport$().$getSize$(), $width$jscomp$36$$ = $viewportSize$jscomp$9$$.width, $height$jscomp$33$$ = $JSCompiler_StaticMethods_getFullWidthHeight_$$($JSCompiler_StaticMethods_attemptFullWidthSizeChange_$self$$, $width$jscomp$36$$, Math.min(500, $viewportSize$jscomp$9$$.height));
  return $JSCompiler_StaticMethods_attemptFullWidthSizeChange_$self$$.$attemptChangeSize$($height$jscomp$33$$, $width$jscomp$36$$).then(function() {
    _.$dev$$module$src$log$$().$Log$$module$src$log_prototype$info$("amp-ad-3p-impl", "Size change accepted: " + $width$jscomp$36$$ + "x" + $height$jscomp$33$$);
  }, function() {
    _.$dev$$module$src$log$$().$Log$$module$src$log_prototype$info$("amp-ad-3p-impl", "Size change rejected: " + $width$jscomp$36$$ + "x" + $height$jscomp$33$$);
  });
}, $JSCompiler_StaticMethods_getFullWidthHeight_$$ = function($JSCompiler_StaticMethods_getFullWidthHeight_$self$$, $width$jscomp$37$$, $maxHeight$jscomp$2$$) {
  return "mcrspv" == $JSCompiler_StaticMethods_getFullWidthHeight_$self$$.element.getAttribute("data-auto-format") ? _.$getMatchedContentResponsiveHeight$$module$ads$google$utils$$($width$jscomp$37$$) : _.$clamp$$module$src$utils$math$$(Math.round($width$jscomp$37$$ / $JSCompiler_StaticMethods_getFullWidthHeight_$self$$.config.$fullWidthHeightRatio$), 100, $maxHeight$jscomp$2$$);
}, $AmpAdCustom$$module$extensions$amp_ad$0_1$amp_ad_custom$$ = function($$jscomp$super$this$jscomp$13_element$jscomp$302$$) {
  $$jscomp$super$this$jscomp$13_element$jscomp$302$$ = window.AMP.BaseElement.call(this, $$jscomp$super$this$jscomp$13_element$jscomp$302$$) || this;
  $$jscomp$super$this$jscomp$13_element$jscomp$302$$.$url_$ = null;
  $$jscomp$super$this$jscomp$13_element$jscomp$302$$.$slot_$ = null;
  $$jscomp$super$this$jscomp$13_element$jscomp$302$$.$uiHandler$ = null;
  return $$jscomp$super$this$jscomp$13_element$jscomp$302$$;
}, $JSCompiler_StaticMethods_handleTemplateData_$$ = function($JSCompiler_StaticMethods_handleTemplateData_$self$$, $templateData$jscomp$2$$) {
  if (_.$childElementByTag$$module$src$dom$$($JSCompiler_StaticMethods_handleTemplateData_$self$$.element, "template")) {
    return $templateData$jscomp$2$$;
  }
  $JSCompiler_StaticMethods_handleTemplateData_$self$$.element.setAttribute("template", $templateData$jscomp$2$$.templateId);
  if ($templateData$jscomp$2$$.vars && "object" == typeof $templateData$jscomp$2$$.vars) {
    for (var $vars$jscomp$11$$ = $templateData$jscomp$2$$.vars, $keys$jscomp$6$$ = Object.keys($vars$jscomp$11$$), $i$jscomp$191$$ = 0; $i$jscomp$191$$ < $keys$jscomp$6$$.length; $i$jscomp$191$$++) {
      var $attrName$jscomp$10$$ = "data-vars-" + $keys$jscomp$6$$[$i$jscomp$191$$];
      try {
        $JSCompiler_StaticMethods_handleTemplateData_$self$$.element.setAttribute($attrName$jscomp$10$$, $vars$jscomp$11$$[$keys$jscomp$6$$[$i$jscomp$191$$]]);
      } catch ($e$212$$) {
        $JSCompiler_StaticMethods_handleTemplateData_$self$$.$user$().error("amp-ad-custom", "Fail to set attribute: ", $e$212$$);
      }
    }
  }
  return $templateData$jscomp$2$$.data;
}, $JSCompiler_StaticMethods_getFullUrl_$$ = function($JSCompiler_StaticMethods_getFullUrl_$self$$) {
  if (null === $JSCompiler_StaticMethods_getFullUrl_$self$$.$slot_$) {
    return $JSCompiler_StaticMethods_getFullUrl_$self$$.$url_$;
  }
  if (null === $ampCustomadFullUrls$$module$extensions$amp_ad$0_1$amp_ad_custom$$) {
    $ampCustomadFullUrls$$module$extensions$amp_ad$0_1$amp_ad_custom$$ = {};
    for (var $slots$$ = {}, $elements$jscomp$18$$ = _.$ancestorElementsByTag$$module$src$dom$$($JSCompiler_StaticMethods_getFullUrl_$self$$.element, "BODY")[0].querySelectorAll("amp-ad[type=custom]"), $index$jscomp$87$$ = 0; $index$jscomp$87$$ < $elements$jscomp$18$$.length; $index$jscomp$87$$++) {
      var $elem$jscomp$3_slotId$jscomp$3$$ = $elements$jscomp$18$$[$index$jscomp$87$$], $url$jscomp$151$$ = $elem$jscomp$3_slotId$jscomp$3$$.getAttribute("data-url");
      $elem$jscomp$3_slotId$jscomp$3$$ = $elem$jscomp$3_slotId$jscomp$3$$.getAttribute("data-slot");
      null !== $elem$jscomp$3_slotId$jscomp$3$$ && ($url$jscomp$151$$ in $slots$$ || ($slots$$[$url$jscomp$151$$] = []), $slots$$[$url$jscomp$151$$].push((0,window.encodeURIComponent)($elem$jscomp$3_slotId$jscomp$3$$)));
    }
    for (var $baseUrl$jscomp$8$$ in $slots$$) {
      $ampCustomadFullUrls$$module$extensions$amp_ad$0_1$amp_ad_custom$$[$baseUrl$jscomp$8$$] = _.$addParamToUrl$$module$src$url$$($baseUrl$jscomp$8$$, "ampslots", $slots$$[$baseUrl$jscomp$8$$].join(","));
    }
  }
  return $ampCustomadFullUrls$$module$extensions$amp_ad$0_1$amp_ad_custom$$[$JSCompiler_StaticMethods_getFullUrl_$self$$.$url_$];
}, $AmpAd$$module$extensions$amp_ad$0_1$amp_ad$$ = function($var_args$jscomp$67$$) {
  return window.AMP.BaseElement.apply(this, arguments) || this;
}, $adConfig$$module$ads$_config$$ = {_ping_:{$renderStartImplemented$:!0, $clientIdScope$:"_PING_", $consentHandlingOverride$:!0}, "24smi":{$prefetch$:"https://jsn.24smi.net/smi.js", $preconnect$:"https://data.24smi.net"}, a8:{$prefetch$:"https://statics.a8.net/amp/ad.js", $renderStartImplemented$:!0}, a9:{$prefetch$:"https://z-na.amazon-adsystem.com/widgets/onejs?MarketPlace=US"}, accesstrade:{$prefetch$:"https://h.accesstrade.net/js/amp/amp.js"}, adagio:{$prefetch$:"https://js-ssl.neodatagroup.com/adagio_amp.js", 
$preconnect$:["https://ad-aws-it.neodatagroup.com", "https://tracker.neodatagroup.com"], $renderStartImplemented$:!0}, adblade:{$prefetch$:"https://web.adblade.com/js/ads/async/show.js", $preconnect$:["https://staticd.cdn.adblade.com", "https://static.adblade.com"], $renderStartImplemented$:!0}, adbutler:{$prefetch$:"https://servedbyadbutler.com/app.js"}, adform:{}, adfox:{$prefetch$:"https://yastatic.net/pcode/adfox/loader.js", $renderStartImplemented$:!0}, adgeneration:{$prefetch$:"https://i.socdm.com/sdk/js/adg-script-loader.js"}, 
adhese:{$renderStartImplemented$:!0}, adincube:{$renderStartImplemented$:!0}, adition:{}, adman:{}, admanmedia:{$renderStartImplemented$:!0}, admixer:{$renderStartImplemented$:!0, $preconnect$:["https://inv-nets.admixer.net", "https://cdn.admixer.net"]}, adocean:{}, adpicker:{$renderStartImplemented$:!0}, adplugg:{$prefetch$:"https://www.adplugg.com/serve/js/ad.js", $renderStartImplemented$:!0}, adpon:{$prefetch$:"https://ad.adpon.jp/amp.js", $clientIdScope$:"AMP_ECID_ADPON"}, adreactor:{}, adsense:{$prefetch$:"https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js", 
$preconnect$:"https://googleads.g.doubleclick.net", $clientIdScope$:"AMP_ECID_GOOGLE", $clientIdCookieName$:"_ga", $remoteHTMLDisabled$:!0, $masterFrameAccessibleType$:"google_network", $fullWidthHeightRatio$:1.2, $consentHandlingOverride$:!0}, adsnative:{$prefetch$:"https://static.adsnative.com/static/js/render.v1.js", $preconnect$:"https://api.adsnative.com"}, adspeed:{$preconnect$:"https://g.adspeed.net", $renderStartImplemented$:!0}, adspirit:{}, adstir:{$prefetch$:"https://js.ad-stir.com/js/adstir_async.js", 
$preconnect$:"https://ad.ad-stir.com"}, adtech:{$prefetch$:"https://s.aolcdn.com/os/ads/adsWrapper3.js", $preconnect$:["https://mads.at.atwola.com", "https://aka-cdn.adtechus.com"]}, adthrive:{$prefetch$:["https://www.googletagservices.com/tag/js/gpt.js"], $preconnect$:["https://partner.googleadservices.com", "https://securepubads.g.doubleclick.net", "https://tpc.googlesyndication.com"], $renderStartImplemented$:!0}, adunity:{$preconnect$:["https://content.adunity.com"], $renderStartImplemented$:!0}, 
aduptech:{$prefetch$:"https://s.d.adup-tech.com/jsapi", $preconnect$:["https://d.adup-tech.com", "https://m.adup-tech.com"], $renderStartImplemented$:!0}, adventive:{$preconnect$:["https://ads.adventive.com", "https://amp.adventivedev.com"], $renderStartImplemented$:!0}, adverline:{$prefetch$:"https://ads.adverline.com/richmedias/amp.js", $preconnect$:["https://adnext.fr"], $renderStartImplemented$:!0}, adverticum:{}, advertserve:{$renderStartImplemented$:!0}, adyoulike:{$consentHandlingOverride$:!0, 
$prefetch$:"https://pixels.omnitagjs.com/amp.js", $renderStartImplemented$:!0}, adzerk:{}, affiliateb:{$prefetch$:"https://track.affiliate-b.com/amp/a.js", $renderStartImplemented$:!0}, aja:{$renderStartImplemented$:!0, $prefetch$:"https://cdn.as.amanad.adtdp.com/sdk/asot-v2.js"}, appvador:{$prefetch$:["https://cdn.apvdr.com/js/VastAdUnit.min.js", "https://cdn.apvdr.com/js/VideoAd.min.js", "https://cdn.apvdr.com/js/VideoAd3PAS.min.js", "https://cdn.apvdr.com/js/VideoAdAutoPlay.min.js", "https://cdn.apvdr.com/js/VideoAdNative.min.js"], 
$renderStartImplemented$:!0}, amoad:{$prefetch$:["https://j.amoad.com/js/a.js", "https://j.amoad.com/js/n.js"], $preconnect$:["https://d.amoad.com", "https://i.amoad.com", "https://m.amoad.com", "https://v.amoad.com"]}, appnexus:{$prefetch$:"https://acdn.adnxs.com/ast/ast.js", $preconnect$:"https://ib.adnxs.com", $renderStartImplemented$:!0}, atomx:{$prefetch$:"https://s.ato.mx/p.js"}, beopinion:{$prefetch$:"https://widget.beopinion.com/sdk.js", $preconnect$:["https://t.beopinion.com", "https://s.beopinion.com", 
"https://data.beopinion.com"], $renderStartImplemented$:!0}, bidtellect:{}, brainy:{}, bringhub:{$renderStartImplemented$:!0, $preconnect$:["https://static.bh-cdn.com", "https://core-api.bringhub.io"]}, broadstreetads:{$prefetch$:"https://cdn.broadstreetads.com/init-2.min.js"}, caajainfeed:{$prefetch$:["https://cdn.amanad.adtdp.com/sdk/ajaamp.js"], $preconnect$:["https://ad.amanad.adtdp.com"]}, capirs:{$renderStartImplemented$:!0}, caprofitx:{$prefetch$:["https://cdn.caprofitx.com/pfx.min.js", "https://cdn.caprofitx.com/tags/amp/profitx_amp.js"], 
$preconnect$:"https://ad.caprofitx.adtdp.com"}, cedato:{$renderStartImplemented$:!0}, chargeads:{}, colombia:{$prefetch$:"https://static.clmbtech.com/ad/commons/js/colombia-amp.js"}, connatix:{$renderStartImplemented$:!0}, contentad:{}, criteo:{$prefetch$:"https://static.criteo.net/js/ld/publishertag.js", $preconnect$:"https://cas.criteo.com"}, csa:{$prefetch$:"https://www.google.com/adsense/search/ads.js"}, dable:{$preconnect$:["https://static.dable.io", "https://api.dable.io", "https://images.dable.io"], 
$renderStartImplemented$:!0}, directadvert:{$renderStartImplemented$:!0}, distroscale:{$preconnect$:["https://c.jsrdn.com", "https://s.jsrdn.com", "https://i.jsrdn.com"], $renderStartImplemented$:!0}, dotandads:{$prefetch$:"https://amp.ad.dotandad.com/dotandadsAmp.js", $preconnect$:"https://bal.ad.dotandad.com"}, eadv:{$renderStartImplemented$:!0, $clientIdScope$:"AMP_ECID_EADV", $prefetch$:["https://www.eadv.it/track/esr.min.js", "https://www.eadv.it/track/ead.min.js"]}, eas:{$prefetch$:"https://amp.emediate.eu/amp.v0.js", 
$renderStartImplemented$:!0}, engageya:{}, epeex:{}, eplanning:{$prefetch$:"https://us.img.e-planning.net/layers/epl-amp.js"}, ezoic:{$prefetch$:["https://www.googletagservices.com/tag/js/gpt.js", "https://g.ezoic.net/ezoic/ampad.js"], $clientIdScope$:"AMP_ECID_EZOIC", $consentHandlingOverride$:!0}, f1e:{$prefetch$:"https://img.ak.impact-ad.jp/util/f1e_amp.min.js"}, f1h:{$preconnect$:"https://img.ak.impact-ad.jp", $renderStartImplemented$:!0}, fake:{}, felmat:{$prefetch$:"https://t.felmat.net/js/fmamp.js", 
$renderStartImplemented$:!0}, flite:{}, fluct:{$preconnect$:["https://cdn-fluct.sh.adingo.jp", "https://s.sh.adingo.jp", "https://i.adingo.jp"]}, freewheel:{$prefetch$:"https://cdn.stickyadstv.com/prime-time/fw-amp.min.js", $renderStartImplemented$:!0}, fusion:{$prefetch$:"https://assets.adtomafusion.net/fusion/latest/fusion-amp.min.js"}, genieessp:{$prefetch$:"https://js.gsspcln.jp/l/amp.js"}, giraff:{$renderStartImplemented$:!0}, gmossp:{$prefetch$:"https://cdn.gmossp-sp.jp/ads/amp.js"}, gumgum:{$prefetch$:"https://g2.gumgum.com/javascripts/ad.js", 
$renderStartImplemented$:!0}, holder:{$prefetch$:"https://i.holder.com.ua/js2/holder/ajax/ampv1.js", $preconnect$:"https://h.holder.com.ua", $renderStartImplemented$:!0}, ibillboard:{}, imedia:{$prefetch$:"https://i.imedia.cz/js/im3.js", $renderStartImplemented$:!0}, imobile:{$prefetch$:"https://spamp.i-mobile.co.jp/script/amp.js", $preconnect$:"https://spad.i-mobile.co.jp"}, imonomy:{$renderStartImplemented$:!0}, improvedigital:{}, industrybrains:{$prefetch$:"https://web.industrybrains.com/js/ads/async/show.js", 
$preconnect$:["https://staticd.cdn.industrybrains.com", "https://static.industrybrains.com"], $renderStartImplemented$:!0}, inmobi:{$prefetch$:"https://cf.cdn.inmobi.com/ad/inmobi.secure.js", $renderStartImplemented$:!0}, innity:{$prefetch$:"https://cdn.innity.net/admanager.js", $preconnect$:"https://as.innity.com", $renderStartImplemented$:!0}, ix:{$prefetch$:["https://js-sec.indexww.com/apl/amp.js"], $preconnect$:"https://as-sec.casalemedia.com", $renderStartImplemented$:!0}, kargo:{}, kiosked:{$renderStartImplemented$:!0}, 
kixer:{$prefetch$:"https://cdn.kixer.com/ad/load.js", $renderStartImplemented$:!0}, kuadio:{}, ligatus:{$prefetch$:"https://ssl.ligatus.com/render/ligrend.js", $renderStartImplemented$:!0}, lockerdome:{$prefetch$:"https://cdn2.lockerdomecdn.com/_js/amp.js", $renderStartImplemented$:!0}, loka:{$prefetch$:"https://loka-cdn.akamaized.net/scene/amp.js", $preconnect$:["https://scene-front.lokaplatform.com", "https://loka-materials.akamaized.net"], $renderStartImplemented$:!0}, mads:{$prefetch$:"https://eu2.madsone.com/js/tags.js"}, 
"mantis-display":{$prefetch$:"https://assets.mantisadnetwork.com/mantodea.min.js", $preconnect$:["https://mantodea.mantisadnetwork.com", "https://res.cloudinary.com", "https://resize.mantisadnetwork.com"]}, "mantis-recommend":{$prefetch$:"https://assets.mantisadnetwork.com/recommend.min.js", $preconnect$:["https://mantodea.mantisadnetwork.com", "https://resize.mantisadnetwork.com"]}, mediaimpact:{$prefetch$:"https://ec-ns.sascdn.com/diff/251/pages/amp_default.js", $preconnect$:["https://ww251.smartadserver.com", 
"https://static.sascdn.com/"], $renderStartImplemented$:!0}, medianet:{$preconnect$:"https://contextual.media.net", $renderStartImplemented$:!0}, mediavine:{$prefetch$:"https://amp.mediavine.com/wrapper.min.js", $preconnect$:["https://partner.googleadservices.com", "https://securepubads.g.doubleclick.net", "https://tpc.googlesyndication.com"], $renderStartImplemented$:!0, $consentHandlingOverride$:!0}, medyanet:{$renderStartImplemented$:!0}, meg:{$renderStartImplemented$:!0}, microad:{$prefetch$:"https://j.microad.net/js/camp.js", 
$preconnect$:["https://s-rtb.send.microad.jp", "https://s-rtb.send.microadinc.com", "https://cache.send.microad.jp", "https://cache.send.microadinc.com", "https://deb.send.microad.jp"]}, miximedia:{$renderStartImplemented$:!0}, mixpo:{$prefetch$:"https://cdn.mixpo.com/js/loader.js", $preconnect$:["https://player1.mixpo.com", "https://player2.mixpo.com"]}, monetizer101:{$renderStartImplemented$:!0}, mox:{$prefetch$:["https://ad.mox.tv/js/amp.min.js", "https://ad.mox.tv/mox/mwayss_invocation.min.js"], 
$renderStartImplemented$:!0}, mytarget:{$prefetch$:"https://ad.mail.ru/static/ads-async.js", $renderStartImplemented$:!0}, mywidget:{$preconnect$:"https://likemore-fe.go.mail.ru", $prefetch$:"https://likemore-go.imgsmail.ru/widget_amp.js", $renderStartImplemented$:!0}, nativo:{$prefetch$:"https://s.ntv.io/serve/load.js"}, navegg:{$renderStartImplemented$:!0}, nend:{$prefetch$:"https://js1.nend.net/js/amp.js", $preconnect$:["https://output.nend.net", "https://img1.nend.net"]}, netletix:{$preconnect$:["https://call.netzathleten-media.de"], 
$renderStartImplemented$:!0}, noddus:{$prefetch$:"https://noddus.com/amp_loader.js", $renderStartImplemented$:!0}, nokta:{$prefetch$:"https://static.virgul.com/theme/mockups/noktaamp/ampjs.js", $renderStartImplemented$:!0}, onead:{$prefetch$:"https://ad-specs.guoshipartners.com/static/js/onead-amp.min.js", $renderStartImplemented$:!0}, onnetwork:{$renderStartImplemented$:!0}, openadstream:{}, openx:{$prefetch$:"https://www.googletagservices.com/tag/js/gpt.js", $preconnect$:["https://partner.googleadservices.com", 
"https://securepubads.g.doubleclick.net", "https://tpc.googlesyndication.com"], $renderStartImplemented$:!0}, outbrain:{$renderStartImplemented$:!0, $prefetch$:"https://widgets.outbrain.com/widgetAMP/outbrainAMP.min.js", $preconnect$:["https://odb.outbrain.com"], $consentHandlingOverride$:!0}, pixels:{$prefetch$:"https://cdn.adsfactor.net/amp/pixels-amp.min.js", $clientIdCookieName$:"__AF", $renderStartImplemented$:!0}, plista:{}, polymorphicads:{$prefetch$:"https://www.polymorphicads.jp/js/amp.js", 
$preconnect$:["https://img.polymorphicads.jp", "https://ad.polymorphicads.jp"], $renderStartImplemented$:!0}, popin:{$renderStartImplemented$:!0}, postquare:{}, pressboard:{$renderStartImplemented$:!0}, pubexchange:{}, pubguru:{$renderStartImplemented$:!0}, pubmatic:{$prefetch$:"https://ads.pubmatic.com/AdServer/js/amp.js"}, pubmine:{$prefetch$:["https://s.pubmine.com/head.js", "https://s.pubmine.com/showad.js"], $preconnect$:"https://delivery.g.switchadhub.com", $renderStartImplemented$:!0}, pulsepoint:{$prefetch$:"https://ads.contextweb.com/TagPublish/getjs.static.js", 
$preconnect$:"https://tag.contextweb.com"}, purch:{$prefetch$:"https://ramp.purch.com/serve/creative_amp.js", $renderStartImplemented$:!0}, quoraad:{$prefetch$:"https://a.quora.com/amp_ad.js", $preconnect$:"https://ampad.quora.com", $renderStartImplemented$:!0}, realclick:{$renderStartImplemented$:!0}, recomad:{$renderStartImplemented$:!0}, relap:{$renderStartImplemented$:!0}, revcontent:{$prefetch$:"https://labs-cdn.revcontent.com/build/amphtml/revcontent.amp.min.js", $preconnect$:["https://trends.revcontent.com", 
"https://cdn.revcontent.com", "https://img.revcontent.com"], $renderStartImplemented$:!0}, revjet:{$prefetch$:"https://cdn.revjet.com/~cdn/JS/03/amp.js", $renderStartImplemented$:!0}, rfp:{$prefetch$:"https://js.rfp.fout.jp/rfp-amp.js", $preconnect$:"https://ad.rfp.fout.jp", $renderStartImplemented$:!0}, rubicon:{}, runative:{$prefetch$:"https://cdn.run-syndicate.com/sdk/v1/n.js", $renderStartImplemented$:!0}, sekindo:{$renderStartImplemented$:!0}, sharethrough:{$renderStartImplemented$:!0}, sklik:{$prefetch$:"https://c.imedia.cz/js/amp.js"}, 
slimcutmedia:{$preconnect$:["https://sb.freeskreen.com", "https://static.freeskreen.com", "https://video.freeskreen.com"], $renderStartImplemented$:!0}, smartadserver:{$prefetch$:"https://ec-ns.sascdn.com/diff/js/amp.v0.js", $preconnect$:"https://static.sascdn.com", $renderStartImplemented$:!0}, smartclip:{$prefetch$:"https://cdn.smartclip.net/amp/amp.v0.js", $preconnect$:"https://des.smartclip.net", $renderStartImplemented$:!0}, smi2:{$renderStartImplemented$:!0}, sogouad:{$prefetch$:"https://theta.sogoucdn.com/wap/js/aw.js", 
$renderStartImplemented$:!0}, sortable:{$prefetch$:"https://www.googletagservices.com/tag/js/gpt.js", $preconnect$:["https://tags-cdn.deployads.com", "https://partner.googleadservices.com", "https://securepubads.g.doubleclick.net", "https://tpc.googlesyndication.com"], $renderStartImplemented$:!0}, sovrn:{$prefetch$:"https://ap.lijit.com/www/sovrn_amp/sovrn_ads.js"}, speakol:{$renderStartImplemented$:!0}, spotx:{$preconnect$:"https://js.spotx.tv", $renderStartImplemented$:!0}, sunmedia:{$prefetch$:"https://vod.addevweb.com/sunmedia/amp/ads/sunmedia.js", 
$preconnect$:"https://static.addevweb.com", $renderStartImplemented$:!0}, swoop:{$prefetch$:"https://www.swoop-amp.com/amp.js", $preconnect$:["https://www.swpsvc.com", "https://client.swpcld.com"], $renderStartImplemented$:!0}, taboola:{}, teads:{$prefetch$:"https://a.teads.tv/media/format/v3/teads-format.min.js", $preconnect$:["https://cdn2.teads.tv", "https://t.teads.tv", "https://r.teads.tv"], $consentHandlingOverride$:!0}, triplelift:{}, trugaze:{$clientIdScope$:"__tg_amp", $renderStartImplemented$:!0}, 
uas:{$prefetch$:"https://ads.pubmatic.com/AdServer/js/phoenix.js"}, uzou:{$preconnect$:["https://speee-ad.akamaized.net"], $renderStartImplemented$:!0}, unruly:{$prefetch$:"https://video.unrulymedia.com/native/native-loader.js", $renderStartImplemented$:!0}, valuecommerce:{$prefetch$:"https://amp.valuecommerce.com/amp_bridge.js", $preconnect$:["https://ad.jp.ap.valuecommerce.com", "https://ad.omks.valuecommerce.com"], $renderStartImplemented$:!0}, videointelligence:{$preconnect$:"https://s.vi-serve.com", 
$renderStartImplemented$:!0}, videonow:{$renderStartImplemented$:!0}, viralize:{$renderStartImplemented$:!0}, vmfive:{$prefetch$:"https://man.vm5apis.com/dist/adn-web-sdk.js", $preconnect$:["https://vawpro.vm5apis.com", "https://vahfront.vm5apis.com"], $renderStartImplemented$:!0}, webediads:{$prefetch$:"https://eu1.wbdds.com/amp.min.js", $preconnect$:["https://goutee.top", "https://mediaathay.org.uk"], $renderStartImplemented$:!0}, "weborama-display":{$prefetch$:["https://cstatic.weborama.fr/js/advertiserv2/adperf_launch_1.0.0_scrambled.js", 
"https://cstatic.weborama.fr/js/advertiserv2/adperf_core_1.0.0_scrambled.js"]}, widespace:{}, wisteria:{$renderStartImplemented$:!0}, wpmedia:{$prefetch$:"https://std.wpcdn.pl/wpjslib/wpjslib-amp.js", $preconnect$:["https://www.wp.pl", "https://v.wpimg.pl"], $renderStartImplemented$:!0}, xlift:{$prefetch$:"https://cdn.x-lift.jp/resources/common/xlift_amp.js", $renderStartImplemented$:!0}, yahoo:{$prefetch$:"https://s.yimg.com/os/ampad/display.js", $preconnect$:"https://us.adserver.yahoo.com"}, yahoojp:{$prefetch$:["https://s.yimg.jp/images/listing/tool/yads/ydn/amp/amp.js", 
"https://yads.c.yimg.jp/js/yads.js"], $preconnect$:"https://yads.yahoo.co.jp"}, yandex:{$prefetch$:"https://yastatic.net/partner-code/loaders/context_amp.js", $renderStartImplemented$:!0}, yengo:{$renderStartImplemented$:!0}, yieldbot:{$prefetch$:["https://cdn.yldbt.com/js/yieldbot.intent.amp.js", "https://msg.yldbt.com/js/ybmsg.html"], $preconnect$:"https://i.yldbt.com"}, yieldmo:{$prefetch$:"https://static.yieldmo.com/ym.1.js", $preconnect$:["https://s.yieldmo.com", "https://ads.yieldmo.com"], 
$renderStartImplemented$:!0}, yieldone:{$prefetch$:"https://img.ak.impact-ad.jp/ic/pone/commonjs/yone-amp.js"}, yieldpro:{$preconnect$:"https://creatives.yieldpro.eu", $renderStartImplemented$:!0}, zedo:{$prefetch$:"https://ss3.zedo.com/gecko/tag/Gecko.amp.min.js", $renderStartImplemented$:!0}, zen:{$prefetch$:"https://zen.yandex.ru/widget-loader", $preconnect$:["https://yastatic.net/"], $renderStartImplemented$:!0}, zergnet:{}, zucks:{$preconnect$:["https://j.zucks.net.zimg.jp", "https://sh.zucks.net", 
"https://k.zucks.net", "https://static.zucks.net.zimg.jp"]}, baidu:{$prefetch$:"https://dup.baidustatic.com/js/dm.js", $renderStartImplemented$:!0}}, $URL_EXPERIMENT_MAPPING$$module$extensions$amp_ad_network_adsense_impl$0_1$adsense_a4a_config$$ = {"-1":"117152632", 0:null}, $a4aRegistry$$module$ads$_a4a_config$$;
$IntersectionObserver$$module$src$intersection_observer$$.prototype.$fire$ = function() {
  if (this.$K$) {
    var $change$jscomp$inline_2335$$ = this.$F$.element.$I$();
    0 < this.$D$.length && this.$D$[this.$D$.length - 1].time == $change$jscomp$inline_2335$$.time || (this.$D$.push($change$jscomp$inline_2335$$), this.$G$ || (this.$J$(), this.$G$ = this.$timer_$.delay(this.$O$, 100)));
  }
};
$IntersectionObserver$$module$src$intersection_observer$$.prototype.$onViewportCallback$ = function($inViewport$jscomp$9_send$jscomp$2$$) {
  if (this.$inViewport_$ != $inViewport$jscomp$9_send$jscomp$2$$) {
    if (this.$inViewport_$ = $inViewport$jscomp$9_send$jscomp$2$$, this.$fire$(), $inViewport$jscomp$9_send$jscomp$2$$) {
      $inViewport$jscomp$9_send$jscomp$2$$ = this.$fire$.bind(this);
      var $unlistenScroll$$ = _.$JSCompiler_StaticMethods_Viewport$$module$src$service$viewport$viewport_impl_prototype$onScroll$$(this.$F$.$getViewport$(), $inViewport$jscomp$9_send$jscomp$2$$), $unlistenChanged$$ = _.$JSCompiler_StaticMethods_onChanged$$(this.$F$.$getViewport$(), $inViewport$jscomp$9_send$jscomp$2$$);
      this.$unlistenViewportChanges_$ = function() {
        $unlistenScroll$$();
        $unlistenChanged$$();
      };
    } else {
      this.$unlistenViewportChanges_$ && (this.$unlistenViewportChanges_$(), this.$unlistenViewportChanges_$ = null);
    }
  }
};
$IntersectionObserver$$module$src$intersection_observer$$.prototype.$J$ = function() {
  this.$G$ = 0;
  this.$D$.length && (_.$JSCompiler_StaticMethods_SubscriptionApi$$module$src$iframe_helper_prototype$send$$(this.$I$, "intersection", _.$dict$$module$src$utils$object$$({changes:this.$D$})), this.$D$.length = 0);
};
$IntersectionObserver$$module$src$intersection_observer$$.prototype.$destroy$ = function() {
  this.$timer_$.cancel(this.$G$);
  this.$unlistenViewportChanges_$ && (this.$unlistenViewportChanges_$(), this.$unlistenViewportChanges_$ = null);
  this.$I$.$destroy$();
};
var $excludedTags$$module$src$get_html$$ = ["script", "style"], $allowedAmpTags$$module$src$get_html$$ = "amp-accordion amp-app-banner amp-carousel amp-fit-text amp-form amp-selector amp-sidebar".split(" "), $allowedAttributes$$module$src$get_html$$ = "action alt class disabled height href id name placeholder readonly src tabindex title type value width".split(" ");
$AmpAdUIHandler$$module$extensions$amp_ad$0_1$amp_ad_ui$$.prototype.$G$ = function() {
  return $JSCompiler_StaticMethods_addDefaultUiComponent_$$(this, "placeholder");
};
$AmpAdUIHandler$$module$extensions$amp_ad$0_1$amp_ad_ui$$.prototype.$F$ = function() {
  var $$jscomp$this$jscomp$350$$ = this;
  if ("AMP-STICKY-AD" === $getAdContainer$$module$src$ad_helper$$(this.$element_$)) {
    this.$D$.collapse();
  } else {
    if ("AMP-FX-FLYING-CARPET" === $getAdContainer$$module$src$ad_helper$$(this.$element_$)) {
      _.$ancestorElementsByTag$$module$src$dom$$(this.$element_$, "amp-fx-flying-carpet")[0].$getImpl$().then(function($attemptCollapsePromise$$) {
        $attemptCollapsePromise$$ = $attemptCollapsePromise$$.$children_$;
        1 === $attemptCollapsePromise$$.length && $attemptCollapsePromise$$[0] === $$jscomp$this$jscomp$350$$.$element_$ && $$jscomp$this$jscomp$350$$.$D$.collapse();
      });
    } else {
      if (this.$J$) {
        var $attemptCollapsePromise$$ = this.$element_$.$getResources$().$attemptCollapse$(this.$J$);
        $attemptCollapsePromise$$.then(function() {
        });
      } else {
        $attemptCollapsePromise$$ = this.$D$.$attemptCollapse$();
      }
      $attemptCollapsePromise$$.catch(function() {
        $$jscomp$this$jscomp$350$$.$D$.$mutateElement$(function() {
          $$jscomp$this$jscomp$350$$.$D$.$togglePlaceholder$(!1);
          $$jscomp$this$jscomp$350$$.$D$.$toggleFallback$(!0);
        });
      });
    }
  }
};
$AmpAdUIHandler$$module$extensions$amp_ad$0_1$amp_ad_ui$$.prototype.$I$ = function() {
  var $$jscomp$this$jscomp$351$$ = this;
  this.$D$.$mutateElement$(function() {
    $$jscomp$this$jscomp$351$$.$D$.$toggleFallback$(!1);
  });
};
window.AMP.AmpAdUIHandler = $AmpAdUIHandler$$module$extensions$amp_ad$0_1$amp_ad_ui$$;
$AmpAdXOriginIframeHandler$$module$extensions$amp_ad$0_1$amp_ad_xorigin_iframe_handler$$.prototype.init = function($iframe$jscomp$25_iframeLoadPromise$$, $opt_isA4A$$) {
  var $$jscomp$this$jscomp$352$$ = this;
  this.iframe = $iframe$jscomp$25_iframeLoadPromise$$;
  this.iframe.setAttribute("scrolling", "no");
  _.$JSCompiler_StaticMethods_applyFillContent$$(this.iframe);
  var $timer$jscomp$2$$ = _.$Services$$module$src$services$timerFor$$(this.$D$.$win$);
  this.$intersectionObserver_$ = new $IntersectionObserver$$module$src$intersection_observer$$(this.$D$, this.iframe);
  this.$G$ = new _.$SubscriptionApi$$module$src$iframe_helper$$(this.iframe, "send-embed-state", !0, function() {
    return $JSCompiler_StaticMethods_sendEmbedInfo_$$($$jscomp$this$jscomp$352$$, $$jscomp$this$jscomp$352$$.$D$.$isInViewport$());
  });
  if ("21062154" == _.$getExperimentBranch$$module$src$experiments$$(this.$I$, "expAdsenseUnconditionedCanonical") || "21062158" == _.$getExperimentBranch$$module$src$experiments$$(this.$I$, "expAdsenseCanonical") || _.$isExperimentOn$$module$src$experiments$$(this.$I$, "inabox-position-api")) {
    this.$F$ = new _.$SubscriptionApi$$module$src$iframe_helper$$(this.iframe, "send-positions", !0, function() {
      $JSCompiler_StaticMethods_sendPosition_$$($$jscomp$this$jscomp$352$$);
      $JSCompiler_StaticMethods_registerPosition_$$($$jscomp$this$jscomp$352$$);
    });
  }
  $listenForOncePromise$$module$src$iframe_helper$$(this.iframe, "entity-id").then(function($iframe$jscomp$25_iframeLoadPromise$$) {
    $$jscomp$this$jscomp$352$$.$element_$.$creativeId$ = $iframe$jscomp$25_iframeLoadPromise$$.data.id;
  });
  $JSCompiler_StaticMethods_handleOneTimeRequest_$$(this, "get-html", function($iframe$jscomp$25_iframeLoadPromise$$) {
    var $opt_isA4A$$ = $iframe$jscomp$25_iframeLoadPromise$$.selector;
    $iframe$jscomp$25_iframeLoadPromise$$ = $iframe$jscomp$25_iframeLoadPromise$$.attributes;
    var $timer$jscomp$2$$ = "";
    $$jscomp$this$jscomp$352$$.$element_$.hasAttribute("data-html-access-allowed") && ($opt_isA4A$$ = $$jscomp$this$jscomp$352$$.$D$.$win$.document.querySelector($opt_isA4A$$), $timer$jscomp$2$$ = [], $opt_isA4A$$ && $appendToResult$$module$src$get_html$$($opt_isA4A$$, $iframe$jscomp$25_iframeLoadPromise$$, $timer$jscomp$2$$), $timer$jscomp$2$$ = $timer$jscomp$2$$.join("").replace(/\s{2,}/g, " "));
    return window.Promise.resolve($timer$jscomp$2$$);
  });
  $JSCompiler_StaticMethods_handleOneTimeRequest_$$(this, "get-consent-state", function() {
    return $JSCompiler_StaticMethods_getConsentState$$($$jscomp$this$jscomp$352$$.$D$).then(function($iframe$jscomp$25_iframeLoadPromise$$) {
      return {$consentState$:$iframe$jscomp$25_iframeLoadPromise$$};
    });
  });
  this.$unlisteners_$.push(_.$listenFor$$module$src$iframe_helper$$(this.iframe, "embed-size", function($iframe$jscomp$25_iframeLoadPromise$$, $opt_isA4A$$, $timer$jscomp$2$$) {
    $iframe$jscomp$25_iframeLoadPromise$$.hasOverflow && ($$jscomp$this$jscomp$352$$.$element_$.$Pa$ = !1);
    $JSCompiler_StaticMethods_AmpAdXOriginIframeHandler$$module$extensions$amp_ad$0_1$amp_ad_xorigin_iframe_handler_prototype$handleResize_$$($$jscomp$this$jscomp$352$$, $iframe$jscomp$25_iframeLoadPromise$$.height, $iframe$jscomp$25_iframeLoadPromise$$.width, $opt_isA4A$$, $timer$jscomp$2$$);
  }, !0, !0));
  this.$unlisteners_$.push(_.$JSCompiler_StaticMethods_Viewer$$module$src$service$viewer_impl_prototype$onVisibilityChanged$$(this.$viewer_$, function() {
    $JSCompiler_StaticMethods_sendEmbedInfo_$$($$jscomp$this$jscomp$352$$, $$jscomp$this$jscomp$352$$.$D$.$isInViewport$());
  }));
  this.$unlisteners_$.push(_.$listenFor$$module$src$iframe_helper$$(this.iframe, "user-error-in-iframe", function($iframe$jscomp$25_iframeLoadPromise$$) {
    $iframe$jscomp$25_iframeLoadPromise$$ = $iframe$jscomp$25_iframeLoadPromise$$.message;
    "string" == typeof $iframe$jscomp$25_iframeLoadPromise$$ && ($iframe$jscomp$25_iframeLoadPromise$$ = Error($iframe$jscomp$25_iframeLoadPromise$$), $iframe$jscomp$25_iframeLoadPromise$$.name = "3pError", _.$reportErrorToAnalytics$$module$src$error$$($iframe$jscomp$25_iframeLoadPromise$$, $$jscomp$this$jscomp$352$$.$D$.$win$));
  }, !0, !0));
  $iframe$jscomp$25_iframeLoadPromise$$ = this.$D$.$loadPromise$(this.iframe).then(function() {
    $$jscomp$this$jscomp$352$$.iframe && ($$jscomp$this$jscomp$352$$.iframe.readyState = "complete");
    return $timer$jscomp$2$$.$promise$(10);
  });
  var $$jscomp$destructuring$var247_$jscomp$destructuring$var248$$ = new _.$Deferred$$module$src$utils$promise$$, $renderStartPromise$$ = $$jscomp$destructuring$var247_$jscomp$destructuring$var248$$.$promise$, $renderStartResolve$$ = $$jscomp$destructuring$var247_$jscomp$destructuring$var248$$.resolve;
  $$jscomp$destructuring$var247_$jscomp$destructuring$var248$$ = new _.$Deferred$$module$src$utils$promise$$;
  var $noContentPromise$$ = $$jscomp$destructuring$var247_$jscomp$destructuring$var248$$.$promise$, $noContentResolve$$ = $$jscomp$destructuring$var247_$jscomp$destructuring$var248$$.resolve;
  this.$D$.config && this.$D$.config.$renderStartImplemented$ ? $listenForOncePromise$$module$src$iframe_helper$$(this.iframe, ["render-start", "no-content"]).then(function($iframe$jscomp$25_iframeLoadPromise$$) {
    "render-start" == $iframe$jscomp$25_iframeLoadPromise$$.data.type ? ($JSCompiler_StaticMethods_renderStart_$$($$jscomp$this$jscomp$352$$, $iframe$jscomp$25_iframeLoadPromise$$), $renderStartResolve$$()) : ($JSCompiler_StaticMethods_noContent_$$($$jscomp$this$jscomp$352$$), $noContentResolve$$());
  }) : ($listenForOncePromise$$module$src$iframe_helper$$(this.iframe, "bootstrap-loaded").then(function() {
    $JSCompiler_StaticMethods_renderStart_$$($$jscomp$this$jscomp$352$$);
    $renderStartResolve$$();
  }), $listenForOncePromise$$module$src$iframe_helper$$(this.iframe, "no-content").then(function() {
    $JSCompiler_StaticMethods_noContent_$$($$jscomp$this$jscomp$352$$);
    $noContentResolve$$();
  }));
  $listenForOncePromise$$module$src$iframe_helper$$(this.iframe, "ini-load").then(function() {
    _.$JSCompiler_StaticMethods_signal$$($$jscomp$this$jscomp$352$$.$D$.signals(), "ini-load");
  });
  this.$element_$.appendChild(this.iframe);
  $opt_isA4A$$ ? ($JSCompiler_StaticMethods_renderStart_$$(this), $renderStartResolve$$()) : _.$setStyle$$module$src$style$$(this.iframe, "visibility", "hidden");
  window.Promise.race([$renderStartPromise$$, $iframe$jscomp$25_iframeLoadPromise$$, $timer$jscomp$2$$.$promise$(10000)]).then(function() {
    $$jscomp$this$jscomp$352$$.iframe && _.$setStyle$$module$src$style$$($$jscomp$this$jscomp$352$$.iframe, "visibility", "");
  });
  return window.Promise.race([$iframe$jscomp$25_iframeLoadPromise$$, $noContentPromise$$]);
};
$AmpAdXOriginIframeHandler$$module$extensions$amp_ad$0_1$amp_ad_xorigin_iframe_handler$$.prototype.$freeXOriginIframe$ = function($opt_keep$$) {
  $JSCompiler_StaticMethods_AmpAdXOriginIframeHandler$$module$extensions$amp_ad$0_1$amp_ad_xorigin_iframe_handler_prototype$cleanup_$$(this);
  !$opt_keep$$ && this.iframe && (_.$removeElement$$module$src$dom$$(this.iframe), this.iframe = null);
};
$AmpAdXOriginIframeHandler$$module$extensions$amp_ad$0_1$amp_ad_xorigin_iframe_handler$$.prototype.$viewportCallback$ = function($inViewport$jscomp$11$$) {
  this.$intersectionObserver_$ && this.$intersectionObserver_$.$onViewportCallback$($inViewport$jscomp$11$$);
  $JSCompiler_StaticMethods_sendEmbedInfo_$$(this, $inViewport$jscomp$11$$);
};
$AmpAdXOriginIframeHandler$$module$extensions$amp_ad$0_1$amp_ad_xorigin_iframe_handler$$.prototype.$onLayoutMeasure$ = function() {
  this.$intersectionObserver_$ && this.$intersectionObserver_$.$fire$();
};
window.AMP.AmpAdXOriginIframeHandler = $AmpAdXOriginIframeHandler$$module$extensions$amp_ad$0_1$amp_ad_xorigin_iframe_handler$$;
_.$$jscomp$inherits$$($AmpAd3PImpl$$module$extensions$amp_ad$0_1$amp_ad_3p_impl$$, window.AMP.BaseElement);
_.$JSCompiler_prototypeAlias$$ = $AmpAd3PImpl$$module$extensions$amp_ad$0_1$amp_ad_3p_impl$$.prototype;
_.$JSCompiler_prototypeAlias$$.$getLayoutPriority$ = function() {
  return this.element.$getAmpDoc$().$isSingleDoc$() ? 2 : 1;
};
_.$JSCompiler_prototypeAlias$$.$renderOutsideViewport$ = function() {
  if (this.$win$["3pla"]) {
    return !1;
  }
  var $elementCheck$jscomp$1$$ = _.$getAmpAdRenderOutsideViewport$$module$extensions$amp_ad$0_1$concurrent_load$$(this.element);
  return null !== $elementCheck$jscomp$1$$ ? $elementCheck$jscomp$1$$ : window.AMP.BaseElement.prototype.$renderOutsideViewport$.call(this);
};
_.$JSCompiler_prototypeAlias$$.$isLayoutSupported$ = function($layout$jscomp$30$$) {
  return _.$isLayoutSizeDefined$$module$src$layout$$($layout$jscomp$30$$);
};
_.$JSCompiler_prototypeAlias$$.$getConsentPolicy$ = function() {
  var $config$jscomp$25_type$jscomp$158$$ = this.element.getAttribute("type");
  return ($config$jscomp$25_type$jscomp$158$$ = $adConfig$$module$ads$_config$$[$config$jscomp$25_type$jscomp$158$$]) && $config$jscomp$25_type$jscomp$158$$.consentHandlingOverride ? null : window.AMP.BaseElement.prototype.$getConsentPolicy$.call(this);
};
_.$JSCompiler_prototypeAlias$$.$buildCallback$ = function() {
  this.$type_$ = this.element.getAttribute("type");
  var $JSCompiler_inline_result$jscomp$623_upgradeDelayMs$jscomp$1$$ = Math.round(_.$Resource$$module$src$service$resource$forElementOptional$$(this.element).element.$Ca$);
  _.$dev$$module$src$log$$().$Log$$module$src$log_prototype$info$("amp-ad-3p-impl", "upgradeDelay " + this.$type_$ + ": " + $JSCompiler_inline_result$jscomp$623_upgradeDelayMs$jscomp$1$$);
  this.$placeholder_$ = this.$getPlaceholder$();
  this.$fallback_$ = this.$getFallback$();
  this.config = $adConfig$$module$ads$_config$$[this.$type_$];
  this.$uiHandler$ = new $AmpAdUIHandler$$module$extensions$amp_ad$0_1$amp_ad_ui$$(this);
  this.element.hasAttribute("data-full-width") ? (_.$dev$$module$src$log$$().$Log$$module$src$log_prototype$info$("amp-ad-3p-impl", "#${this.getResource().getId()} Full width requested"), $JSCompiler_inline_result$jscomp$623_upgradeDelayMs$jscomp$1$$ = !0) : $JSCompiler_inline_result$jscomp$623_upgradeDelayMs$jscomp$1$$ = !1;
  if (this.$isFullWidthRequested_$ = $JSCompiler_inline_result$jscomp$623_upgradeDelayMs$jscomp$1$$) {
    return $JSCompiler_StaticMethods_attemptFullWidthSizeChange_$$(this);
  }
};
_.$JSCompiler_prototypeAlias$$.$preconnectCallback$ = function($opt_onLayout$jscomp$3$$) {
  var $$jscomp$this$jscomp$358$$ = this;
  _.$preloadBootstrap$$module$src$3p_frame$$(this.$win$, this.$preconnect$, this.config.$remoteHTMLDisabled$);
  "string" == typeof this.config.$prefetch$ ? this.$preconnect$.$preload$(this.config.$prefetch$, "script") : this.config.$prefetch$ && this.config.$prefetch$.forEach(function($opt_onLayout$jscomp$3$$) {
    $$jscomp$this$jscomp$358$$.$preconnect$.$preload$($opt_onLayout$jscomp$3$$, "script");
  });
  "string" == typeof this.config.$preconnect$ ? this.$preconnect$.url(this.config.$preconnect$, $opt_onLayout$jscomp$3$$) : this.config.$preconnect$ && this.config.$preconnect$.forEach(function($src$jscomp$20$$) {
    $$jscomp$this$jscomp$358$$.$preconnect$.url($src$jscomp$20$$, $opt_onLayout$jscomp$3$$);
  });
  var $src$jscomp$20$$ = this.element.getAttribute("src");
  $src$jscomp$20$$ && this.$preconnect$.url($src$jscomp$20$$);
};
_.$JSCompiler_prototypeAlias$$.$onLayoutMeasure$ = function() {
  var $$jscomp$this$jscomp$359$$ = this;
  this.$isInFixedContainer_$ = !_.$isAdPositionAllowed$$module$src$ad_helper$$(this.element, this.$win$);
  void 0 === this.$container_$ && (this.$container_$ = $getAdContainer$$module$src$ad_helper$$(this.element));
  $JSCompiler_StaticMethods_AmpAd3PImpl$$module$extensions$amp_ad$0_1$amp_ad_3p_impl_prototype$measureIframeLayoutBox_$$(this);
  this.$xOriginIframeHandler_$ && this.$xOriginIframeHandler_$.$onLayoutMeasure$();
  if (this.$isFullWidthRequested_$ && !this.$isFullWidthAligned_$) {
    this.$isFullWidthAligned_$ = !0;
    var $layoutBox$jscomp$5$$ = this.$getLayoutBox$();
    _.$JSCompiler_StaticMethods_Vsync$$module$src$service$vsync_impl_prototype$run$$(_.$JSCompiler_StaticMethods_getVsync$$(this), {measure:function($layoutBox$jscomp$5$$) {
      $layoutBox$jscomp$5$$.direction = _.$computedStyle$$module$src$style$$($$jscomp$this$jscomp$359$$.$win$, $$jscomp$this$jscomp$359$$.element).direction;
    }, $mutate$:function($state$jscomp$42$$) {
      "rtl" == $state$jscomp$42$$.direction ? _.$setStyle$$module$src$style$$($$jscomp$this$jscomp$359$$.element, "marginRight", $layoutBox$jscomp$5$$.left, "px") : _.$setStyle$$module$src$style$$($$jscomp$this$jscomp$359$$.element, "marginLeft", -$layoutBox$jscomp$5$$.left, "px");
    }}, {direction:""});
  }
};
_.$JSCompiler_prototypeAlias$$.$getIntersectionElementLayoutBox$ = function() {
  if (!this.$xOriginIframeHandler_$ || !this.$xOriginIframeHandler_$.iframe) {
    return window.AMP.BaseElement.prototype.$getIntersectionElementLayoutBox$.call(this);
  }
  var $box$jscomp$15$$ = this.$getLayoutBox$();
  this.$iframeLayoutBox_$ || $JSCompiler_StaticMethods_AmpAd3PImpl$$module$extensions$amp_ad$0_1$amp_ad_3p_impl_prototype$measureIframeLayoutBox_$$(this);
  return _.$moveLayoutRect$$module$src$layout_rect$$(this.$iframeLayoutBox_$, $box$jscomp$15$$.left, $box$jscomp$15$$.top);
};
_.$JSCompiler_prototypeAlias$$.$layoutCallback$ = function() {
  var $$jscomp$this$jscomp$360$$ = this;
  if (this.$layoutPromise_$) {
    return this.$layoutPromise_$;
  }
  var $consentPromise$$ = $JSCompiler_StaticMethods_getConsentState$$(this), $consentPolicyId$jscomp$2_sharedDataPromise$$ = window.AMP.BaseElement.prototype.$getConsentPolicy$.call(this), $isConsentV2Experiment$$ = _.$isExperimentOn$$module$src$experiments$$(this.$win$, "amp-consent-v2"), $consentStringPromise$$ = $consentPolicyId$jscomp$2_sharedDataPromise$$ && $isConsentV2Experiment$$ ? $getConsentPolicyInfo$$module$src$consent$$(this.element, $consentPolicyId$jscomp$2_sharedDataPromise$$) : window.Promise.resolve(null);
  $consentPolicyId$jscomp$2_sharedDataPromise$$ = $consentPolicyId$jscomp$2_sharedDataPromise$$ ? $getConsentPolicySharedData$$module$src$consent$$(this.element, $consentPolicyId$jscomp$2_sharedDataPromise$$) : window.Promise.resolve(null);
  this.$layoutPromise_$ = window.Promise.all([$getAdCid$$module$src$ad_cid$$(this), $consentPromise$$, $consentPolicyId$jscomp$2_sharedDataPromise$$, $consentStringPromise$$]).then(function($consentPromise$$) {
    var $consentPolicyId$jscomp$2_sharedDataPromise$$ = _.$dict$$module$src$utils$object$$({clientId:$consentPromise$$[0] || null, container:$$jscomp$this$jscomp$360$$.$container_$, initialConsentState:$consentPromise$$[1], consentSharedData:$consentPromise$$[2]});
    $isConsentV2Experiment$$ && ($consentPolicyId$jscomp$2_sharedDataPromise$$.initialConsentValue = $consentPromise$$[3]);
    $consentPromise$$ = _.$getIframe$$module$src$3p_frame$$($$jscomp$this$jscomp$360$$.element.ownerDocument.defaultView, $$jscomp$this$jscomp$360$$.element, $$jscomp$this$jscomp$360$$.$type_$, $consentPolicyId$jscomp$2_sharedDataPromise$$, {$disallowCustom$:$$jscomp$this$jscomp$360$$.config.$remoteHTMLDisabled$});
    $$jscomp$this$jscomp$360$$.$xOriginIframeHandler_$ = new $AmpAdXOriginIframeHandler$$module$extensions$amp_ad$0_1$amp_ad_xorigin_iframe_handler$$($$jscomp$this$jscomp$360$$);
    return $$jscomp$this$jscomp$360$$.$xOriginIframeHandler_$.init($consentPromise$$);
  });
  _.$incrementLoadingAds$$module$extensions$amp_ad$0_1$concurrent_load$$(this.$win$, this.$layoutPromise_$);
  return this.$layoutPromise_$;
};
_.$JSCompiler_prototypeAlias$$.$viewportCallback$ = function($inViewport$jscomp$12$$) {
  this.$xOriginIframeHandler_$ && this.$xOriginIframeHandler_$.$viewportCallback$($inViewport$jscomp$12$$);
};
_.$JSCompiler_prototypeAlias$$.$unlayoutCallback$ = function() {
  this.$layoutPromise_$ = null;
  this.$uiHandler$.$I$();
  this.$xOriginIframeHandler_$ && (this.$xOriginIframeHandler_$.$freeXOriginIframe$(), this.$xOriginIframeHandler_$ = null);
  return !0;
};
_.$JSCompiler_prototypeAlias$$.$createPlaceholderCallback$ = function() {
  return this.$uiHandler$.$G$();
};
var $ampCustomadXhrPromises$$module$extensions$amp_ad$0_1$amp_ad_custom$$ = {}, $ampCustomadFullUrls$$module$extensions$amp_ad$0_1$amp_ad_custom$$ = null;
_.$$jscomp$inherits$$($AmpAdCustom$$module$extensions$amp_ad$0_1$amp_ad_custom$$, window.AMP.BaseElement);
_.$JSCompiler_prototypeAlias$$ = $AmpAdCustom$$module$extensions$amp_ad$0_1$amp_ad_custom$$.prototype;
_.$JSCompiler_prototypeAlias$$.$getLayoutPriority$ = function() {
  return 0;
};
_.$JSCompiler_prototypeAlias$$.$isLayoutSupported$ = function($layout$jscomp$31$$) {
  return _.$isLayoutSizeDefined$$module$src$layout$$($layout$jscomp$31$$);
};
_.$JSCompiler_prototypeAlias$$.$buildCallback$ = function() {
  this.$url_$ = this.element.getAttribute("data-url");
  this.$slot_$ = this.element.getAttribute("data-slot");
  this.$uiHandler$ = new $AmpAdUIHandler$$module$extensions$amp_ad$0_1$amp_ad_ui$$(this);
};
_.$JSCompiler_prototypeAlias$$.$layoutCallback$ = function() {
  var $$jscomp$this$jscomp$361$$ = this, $fullUrl$$ = $JSCompiler_StaticMethods_getFullUrl_$$(this), $responsePromise$jscomp$3$$ = $ampCustomadXhrPromises$$module$extensions$amp_ad$0_1$amp_ad_custom$$[$fullUrl$$] || _.$JSCompiler_StaticMethods_fetchJson$$(_.$Services$$module$src$services$xhrFor$$(this.$win$), $fullUrl$$).then(function($$jscomp$this$jscomp$361$$) {
    return $$jscomp$this$jscomp$361$$.json();
  });
  null !== this.$slot_$ && ($ampCustomadXhrPromises$$module$extensions$amp_ad$0_1$amp_ad_custom$$[$fullUrl$$] = $responsePromise$jscomp$3$$);
  return $responsePromise$jscomp$3$$.then(function($fullUrl$$) {
    var $responsePromise$jscomp$3$$ = $fullUrl$$;
    null !== $$jscomp$this$jscomp$361$$.$slot_$ && ($responsePromise$jscomp$3$$ = _.$hasOwn$$module$src$utils$object$$($fullUrl$$, $$jscomp$this$jscomp$361$$.$slot_$) ? $fullUrl$$[$$jscomp$this$jscomp$361$$.$slot_$] : null);
    if ($responsePromise$jscomp$3$$ && "object" == typeof $responsePromise$jscomp$3$$) {
      $responsePromise$jscomp$3$$ = $JSCompiler_StaticMethods_handleTemplateData_$$($$jscomp$this$jscomp$361$$, $responsePromise$jscomp$3$$);
      $$jscomp$this$jscomp$361$$.$renderStarted$();
      try {
        _.$JSCompiler_StaticMethods_findAndRenderTemplate$$(_.$Services$$module$src$services$templatesFor$$($$jscomp$this$jscomp$361$$.$win$), $$jscomp$this$jscomp$361$$.element, $responsePromise$jscomp$3$$).then(function($fullUrl$$) {
          _.$removeChildren$$module$src$dom$$($$jscomp$this$jscomp$361$$.element);
          $$jscomp$this$jscomp$361$$.element.appendChild($fullUrl$$);
          _.$JSCompiler_StaticMethods_signal$$($$jscomp$this$jscomp$361$$.signals(), "ini-load");
        });
      } catch ($e$211$$) {
        $$jscomp$this$jscomp$361$$.$uiHandler$.$F$();
      }
    } else {
      $$jscomp$this$jscomp$361$$.$uiHandler$.$F$();
    }
  });
};
_.$JSCompiler_prototypeAlias$$.$unlayoutCallback$ = function() {
  this.$uiHandler$.$I$();
  return !0;
};
_.$JSCompiler_prototypeAlias$$.$createPlaceholderCallback$ = function() {
  return this.$uiHandler$.$G$();
};
_.$$jscomp$inherits$$($AmpAd$$module$extensions$amp_ad$0_1$amp_ad$$, window.AMP.BaseElement);
$AmpAd$$module$extensions$amp_ad$0_1$amp_ad$$.prototype.$isLayoutSupported$ = function() {
  return !0;
};
$AmpAd$$module$extensions$amp_ad$0_1$amp_ad$$.prototype.$upgradeCallback$ = function() {
  var $$jscomp$this$jscomp$362$$ = this, $a4aRegistry$$ = $getA4ARegistry$$module$ads$_a4a_config$$(), $consentId$$ = this.element.getAttribute("data-consent-notification-id"), $consent$jscomp$4$$ = $consentId$$ ? _.$Services$$module$src$services$userNotificationManagerForDoc$$(this.element).then(function($$jscomp$this$jscomp$362$$) {
    return $$jscomp$this$jscomp$362$$.get($consentId$$);
  }) : window.Promise.resolve(), $type$jscomp$160$$ = this.element.getAttribute("type");
  return $consent$jscomp$4$$.then(function() {
    if ("custom" === $type$jscomp$160$$) {
      return new $AmpAdCustom$$module$extensions$amp_ad$0_1$amp_ad_custom$$($$jscomp$this$jscomp$362$$.element);
    }
    $$jscomp$this$jscomp$362$$.$win$.$ampAdSlotIdCounter$ = $$jscomp$this$jscomp$362$$.$win$.$ampAdSlotIdCounter$ || 0;
    var $consentId$$ = $$jscomp$this$jscomp$362$$.$win$.$ampAdSlotIdCounter$++;
    return new window.Promise(function($consent$jscomp$4$$) {
      _.$JSCompiler_StaticMethods_getVsync$$($$jscomp$this$jscomp$362$$).$mutate$(function() {
        $$jscomp$this$jscomp$362$$.element.setAttribute("data-amp-slot-index", $consentId$$);
        var $slotId$jscomp$4$$ = !($adConfig$$module$ads$_config$$[$type$jscomp$160$$] || {}).$remoteHTMLDisabled$ && $$jscomp$this$jscomp$362$$.$win$.document.querySelector("meta[name=amp-3p-iframe-src]");
        if (!$a4aRegistry$$[$type$jscomp$160$$] || !$a4aRegistry$$[$type$jscomp$160$$]($$jscomp$this$jscomp$362$$.$win$, $$jscomp$this$jscomp$362$$.element, $slotId$jscomp$4$$)) {
          return $consent$jscomp$4$$(new $AmpAd3PImpl$$module$extensions$amp_ad$0_1$amp_ad_3p_impl$$($$jscomp$this$jscomp$362$$.element));
        }
        $slotId$jscomp$4$$ = "amp-ad-network-" + $type$jscomp$160$$ + "-impl";
        $$jscomp$this$jscomp$362$$.element.setAttribute("data-a4a-upgrade-type", $slotId$jscomp$4$$);
        $consent$jscomp$4$$($JSCompiler_StaticMethods_loadElementClass$$(_.$Services$$module$src$services$extensionsFor$$($$jscomp$this$jscomp$362$$.$win$), $slotId$jscomp$4$$).then(function($a4aRegistry$$) {
          return new $a4aRegistry$$($$jscomp$this$jscomp$362$$.element);
        }).catch(function($a4aRegistry$$) {
          var $consentId$$ = $$jscomp$this$jscomp$362$$.element.tagName;
          $$jscomp$this$jscomp$362$$.$user$().error($consentId$$, "Unable to load ad implementation for type ", $type$jscomp$160$$, ", falling back to 3p, error: ", $a4aRegistry$$);
          return new $AmpAd3PImpl$$module$extensions$amp_ad$0_1$amp_ad_3p_impl$$($$jscomp$this$jscomp$362$$.element);
        }));
      });
    });
  });
};
var $AMP$jscomp$inline_2360$$ = window.self.AMP;
$AMP$jscomp$inline_2360$$.registerElement("amp-ad", $AmpAd$$module$extensions$amp_ad$0_1$amp_ad$$, 'amp-ad iframe,amp-embed iframe{border:0!important;margin:0!important;padding:0!important}.i-amphtml-ad-default-holder{position:absolute;left:0;right:0;top:0;bottom:0;display:-webkit-box;display:-ms-flexbox;display:flex;-webkit-box-align:center;-ms-flex-align:center;align-items:center;-webkit-box-pack:center;-ms-flex-pack:center;justify-content:center;background-color:hsla(0,0%,78.4%,0.05)}.i-amphtml-ad-default-holder:after{content:"Ad";content:attr(data-ad-holder-text);background-color:transparent;border-radius:2px;color:#696969;font-size:10px;line-height:1;font-family:Arial,sans-serif;padding:3px 4px 1px;border:1px solid #696969}amp-ad[data-a4a-upgrade-type=amp-ad-network-doubleclick-impl]>iframe,amp-ad[type=adsense]>iframe{top:50%!important;left:50%!important;-webkit-transform:translate(-50%,-50%);transform:translate(-50%,-50%)}amp-ad[type=adsense],amp-ad[type=doubleclick]{direction:ltr}amp-ad[data-a4a-upgrade-type=amp-ad-network-adsense-impl]>iframe,amp-ad[data-a4a-upgrade-type=amp-ad-network-doubleclick-impl]>iframe{min-height:0;min-width:0}amp-ad[data-a4a-upgrade-type=amp-ad-network-doubleclick-impl][height=fluid]>iframe{height:100%!important;width:100%!important;position:relative}amp-ad[data-a4a-upgrade-type=amp-ad-network-doubleclick-impl][height=fluid]{width:100%!important}\n/*# sourceURL=/extensions/amp-ad/0.1/amp-ad.css*/');
$AMP$jscomp$inline_2360$$.registerElement("amp-embed", $AmpAd$$module$extensions$amp_ad$0_1$amp_ad$$);

})});
