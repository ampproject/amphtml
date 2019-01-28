(self.AMP=self.AMP||[]).push({n:"amp-share-tracking",i:["_base_i","_base_misc"],v:"1901181729101",f:(function(AMP,_){
var $AmpShareTracking$$module$extensions$amp_share_tracking$0_1$amp_share_tracking$$ = function($$jscomp$super$this$jscomp$89_element$jscomp$531$$) {
  $$jscomp$super$this$jscomp$89_element$jscomp$531$$ = window.AMP.BaseElement.call(this, $$jscomp$super$this$jscomp$89_element$jscomp$531$$) || this;
  $$jscomp$super$this$jscomp$89_element$jscomp$531$$.$vendorHref_$ = "";
  $$jscomp$super$this$jscomp$89_element$jscomp$531$$.$originalViewerFragment_$ = "";
  return $$jscomp$super$this$jscomp$89_element$jscomp$531$$;
}, $JSCompiler_StaticMethods_getIncomingFragment_$$ = function($JSCompiler_StaticMethods_getIncomingFragment_$self$$) {
  return $JSCompiler_StaticMethods_getOriginalViewerFragment_$$($JSCompiler_StaticMethods_getIncomingFragment_$self$$).then(function($JSCompiler_StaticMethods_getIncomingFragment_$self$$) {
    return ($JSCompiler_StaticMethods_getIncomingFragment_$self$$ = $JSCompiler_StaticMethods_getIncomingFragment_$self$$.match(/^\.([^&]*)/)) ? $JSCompiler_StaticMethods_getIncomingFragment_$self$$[1] : "";
  });
}, $JSCompiler_StaticMethods_getOriginalViewerFragment_$$ = function($JSCompiler_StaticMethods_getOriginalViewerFragment_$self$$) {
  return _.$Services$$module$src$services$historyForDoc$$($JSCompiler_StaticMethods_getOriginalViewerFragment_$self$$.$getAmpDoc$()).$D$.$HistoryBindingInterface$$module$src$service$history_impl_prototype$getFragment$().then(function($fragment$jscomp$12$$) {
    return $JSCompiler_StaticMethods_getOriginalViewerFragment_$self$$.$originalViewerFragment_$ = $fragment$jscomp$12$$;
  });
}, $JSCompiler_StaticMethods_getOutgoingFragment_$$ = function($JSCompiler_StaticMethods_getOutgoingFragment_$self$$) {
  return $JSCompiler_StaticMethods_getOutgoingFragment_$self$$.$vendorHref_$ ? $JSCompiler_StaticMethods_getOutgoingFragmentFromVendor_$$($JSCompiler_StaticMethods_getOutgoingFragment_$self$$, $JSCompiler_StaticMethods_getOutgoingFragment_$self$$.$vendorHref_$) : _.$tryResolve$$module$src$utils$promise$$(function() {
    var $bytes$jscomp$inline_3985$$ = _.$getCryptoRandomBytesArray$$module$src$utils$bytes$$($JSCompiler_StaticMethods_getOutgoingFragment_$self$$.$win$, 6);
    if (!$bytes$jscomp$inline_3985$$) {
      $bytes$jscomp$inline_3985$$ = new window.Uint8Array(6);
      for (var $random$jscomp$inline_3986$$ = Math.random(), $i$286$jscomp$inline_3987$$ = 0; 6 > $i$286$jscomp$inline_3987$$; $i$286$jscomp$inline_3987$$++) {
        $random$jscomp$inline_3986$$ *= 256, $bytes$jscomp$inline_3985$$[$i$286$jscomp$inline_3987$$] = Math.floor($random$jscomp$inline_3986$$), $random$jscomp$inline_3986$$ -= $bytes$jscomp$inline_3985$$[$i$286$jscomp$inline_3987$$];
      }
    }
    return _.$base64UrlEncodeFromBytes$$module$src$utils$base64$$($bytes$jscomp$inline_3985$$);
  });
}, $JSCompiler_StaticMethods_getOutgoingFragmentFromVendor_$$ = function($JSCompiler_StaticMethods_getOutgoingFragmentFromVendor_$self$$, $vendorUrl$$) {
  return _.$JSCompiler_StaticMethods_fetchJson$$(_.$Services$$module$src$services$xhrFor$$($JSCompiler_StaticMethods_getOutgoingFragmentFromVendor_$self$$.$win$), $vendorUrl$$, {method:"POST", credentials:"include", body:{}}).then(function($JSCompiler_StaticMethods_getOutgoingFragmentFromVendor_$self$$) {
    return $JSCompiler_StaticMethods_getOutgoingFragmentFromVendor_$self$$.json();
  }).then(function($json$jscomp$21$$) {
    if ($json$jscomp$21$$.$fragment$) {
      return $json$jscomp$21$$.$fragment$;
    }
    $JSCompiler_StaticMethods_getOutgoingFragmentFromVendor_$self$$.$user$().error("amp-share-tracking", "The response from [" + $vendorUrl$$ + "] does not have a fragment value.");
    return "";
  }, function($vendorUrl$$) {
    $JSCompiler_StaticMethods_getOutgoingFragmentFromVendor_$self$$.$user$().error("amp-share-tracking", "The request to share-tracking endpoint failed:", $vendorUrl$$);
    return "";
  });
};
_.$HistoryBindingNatural_$$module$src$service$history_impl$$.prototype.$HistoryBindingInterface$$module$src$service$history_impl_prototype$updateFragment$ = _.$JSCompiler_unstubMethod$$(32, function($fragment$jscomp$2$$) {
  this.replace({$fragment$:$fragment$jscomp$2$$});
});
_.$HistoryBindingVirtual_$$module$src$service$history_impl$$.prototype.$HistoryBindingInterface$$module$src$service$history_impl_prototype$updateFragment$ = _.$JSCompiler_unstubMethod$$(31, function($fragment$jscomp$3$$) {
  _.$JSCompiler_StaticMethods_hasCapability$$(this.$viewer_$, "fragment") ? _.$JSCompiler_StaticMethods_sendMessageAwaitResponse$$(this.$viewer_$, "replaceHistory", _.$dict$$module$src$utils$object$$({fragment:$fragment$jscomp$3$$}), !0) : window.Promise.resolve();
});
_.$HistoryBindingNatural_$$module$src$service$history_impl$$.prototype.$HistoryBindingInterface$$module$src$service$history_impl_prototype$getFragment$ = _.$JSCompiler_unstubMethod$$(30, function() {
  var $hash$jscomp$2$$ = this.$win$.location.hash;
  $hash$jscomp$2$$ = $hash$jscomp$2$$.substr(1);
  return window.Promise.resolve($hash$jscomp$2$$);
});
_.$HistoryBindingVirtual_$$module$src$service$history_impl$$.prototype.$HistoryBindingInterface$$module$src$service$history_impl_prototype$getFragment$ = _.$JSCompiler_unstubMethod$$(29, function() {
  return _.$JSCompiler_StaticMethods_hasCapability$$(this.$viewer_$, "fragment") ? _.$JSCompiler_StaticMethods_sendMessageAwaitResponse$$(this.$viewer_$, "getFragment", void 0, !0).then(function($data$jscomp$55_hash$jscomp$3$$) {
    if (!$data$jscomp$55_hash$jscomp$3$$) {
      return "";
    }
    "#" == $data$jscomp$55_hash$jscomp$3$$[0] && ($data$jscomp$55_hash$jscomp$3$$ = $data$jscomp$55_hash$jscomp$3$$.substr(1));
    return $data$jscomp$55_hash$jscomp$3$$;
  }) : window.Promise.resolve("");
});
_.$$jscomp$inherits$$($AmpShareTracking$$module$extensions$amp_share_tracking$0_1$amp_share_tracking$$, window.AMP.BaseElement);
$AmpShareTracking$$module$extensions$amp_share_tracking$0_1$amp_share_tracking$$.prototype.$isLayoutSupported$ = function($layout$jscomp$92$$) {
  return "nodisplay" == $layout$jscomp$92$$ || "container" == $layout$jscomp$92$$;
};
$AmpShareTracking$$module$extensions$amp_share_tracking$0_1$amp_share_tracking$$.prototype.$buildCallback$ = function() {
  var $$jscomp$this$jscomp$816$$ = this;
  _.$isExperimentOn$$module$src$experiments$$(this.$win$, "amp-share-tracking") || _.$registerServiceBuilder$$module$src$service$$(this.$win$, "share-tracking", function() {
    return window.Promise.reject(_.$user$$module$src$log$$().$createError$("%s disabled", "amp-share-tracking"));
  });
  this.$vendorHref_$ = this.element.getAttribute("data-href");
  "amp-share-tracking";
  var $shareTrackingFragments$$ = window.Promise.all([$JSCompiler_StaticMethods_getIncomingFragment_$$(this), $JSCompiler_StaticMethods_getOutgoingFragment_$$(this)]).then(function($shareTrackingFragments$$) {
    var $outgoingFragment_results$jscomp$23$$ = $shareTrackingFragments$$[0];
    $shareTrackingFragments$$ = $shareTrackingFragments$$[1];
    "amp-share-tracking";
    "amp-share-tracking";
    if ($shareTrackingFragments$$ && "" != $shareTrackingFragments$$) {
      var $JSCompiler_StaticMethods_History$$module$src$service$history_impl_prototype$updateFragment$self$jscomp$inline_3981_fragmentResidual$jscomp$inline_3978$$ = $outgoingFragment_results$jscomp$23$$ ? $$jscomp$this$jscomp$816$$.$originalViewerFragment_$.substr($outgoingFragment_results$jscomp$23$$.length + 1) : $$jscomp$this$jscomp$816$$.$originalViewerFragment_$;
      var $JSCompiler_inline_result$jscomp$840_fragment$jscomp$inline_3982_result$jscomp$inline_3979$$ = "." + $shareTrackingFragments$$;
      $JSCompiler_StaticMethods_History$$module$src$service$history_impl_prototype$updateFragment$self$jscomp$inline_3981_fragmentResidual$jscomp$inline_3978$$ && ("&" != $JSCompiler_StaticMethods_History$$module$src$service$history_impl_prototype$updateFragment$self$jscomp$inline_3981_fragmentResidual$jscomp$inline_3978$$[0] && ($JSCompiler_inline_result$jscomp$840_fragment$jscomp$inline_3982_result$jscomp$inline_3979$$ += "&"), $JSCompiler_inline_result$jscomp$840_fragment$jscomp$inline_3982_result$jscomp$inline_3979$$ += 
      $JSCompiler_StaticMethods_History$$module$src$service$history_impl_prototype$updateFragment$self$jscomp$inline_3981_fragmentResidual$jscomp$inline_3978$$);
      $JSCompiler_StaticMethods_History$$module$src$service$history_impl_prototype$updateFragment$self$jscomp$inline_3981_fragmentResidual$jscomp$inline_3978$$ = _.$Services$$module$src$services$historyForDoc$$($$jscomp$this$jscomp$816$$.$getAmpDoc$());
      "#" == $JSCompiler_inline_result$jscomp$840_fragment$jscomp$inline_3982_result$jscomp$inline_3979$$[0] && ($JSCompiler_inline_result$jscomp$840_fragment$jscomp$inline_3982_result$jscomp$inline_3979$$ = $JSCompiler_inline_result$jscomp$840_fragment$jscomp$inline_3982_result$jscomp$inline_3979$$.substr(1));
      $JSCompiler_StaticMethods_History$$module$src$service$history_impl_prototype$updateFragment$self$jscomp$inline_3981_fragmentResidual$jscomp$inline_3978$$.$D$.$HistoryBindingInterface$$module$src$service$history_impl_prototype$updateFragment$($JSCompiler_inline_result$jscomp$840_fragment$jscomp$inline_3982_result$jscomp$inline_3979$$);
    }
    return {$incomingFragment$:$outgoingFragment_results$jscomp$23$$, $outgoingFragment$:$shareTrackingFragments$$};
  });
  _.$registerServiceBuilder$$module$src$service$$(this.$win$, "share-tracking", function() {
    return $shareTrackingFragments$$;
  });
};
window.self.AMP.registerElement("amp-share-tracking", $AmpShareTracking$$module$extensions$amp_share_tracking$0_1$amp_share_tracking$$);

})});
