(self.AMP=self.AMP||[]).push({n:"amp-dynamic-css-classes",v:"2007210308000",f:(function(AMP,_){
var $resolved$$module$src$resolved_promise$$;
function $tryDecodeUriComponent_$$module$src$url_try_decode_uri_component$$($component$jscomp$4$$, $fallback$$) {
  $fallback$$ = void 0 === $fallback$$ ? "" : $fallback$$;
  try {
    return decodeURIComponent($component$jscomp$4$$);
  } catch ($e$jscomp$7$$) {
    return $fallback$$;
  }
}
;var $regex$$module$src$url_parse_query_string$$ = /(?:^[#?]?|&)([^=&]+)(?:=([^&]*))?/g;
var $env$$module$src$config$$ = self.AMP_CONFIG || {}, $cdnProxyRegex$$module$src$config$$ = ("string" == typeof $env$$module$src$config$$.cdnProxyRegex ? new RegExp($env$$module$src$config$$.cdnProxyRegex) : $env$$module$src$config$$.cdnProxyRegex) || /^https:\/\/([a-zA-Z0-9_-]+\.)?cdn\.ampproject\.org$/;
function $getMetaUrl$$module$src$config$$($name$jscomp$72$$) {
  if (self.document && self.document.head && (!self.location || !$cdnProxyRegex$$module$src$config$$.test(self.location.origin))) {
    var $metaEl$$ = self.document.head.querySelector('meta[name="' + $name$jscomp$72$$ + '"]');
    $metaEl$$ && $metaEl$$.getAttribute("content");
  }
}
$env$$module$src$config$$.cdnUrl || $getMetaUrl$$module$src$config$$("runtime-host");
$env$$module$src$config$$.geoApiUrl || $getMetaUrl$$module$src$config$$("amp-geo-api");
self.__AMP_LOG = self.__AMP_LOG || {user:null, dev:null, userForEmbed:null};
var $logs$$module$src$log$$ = self.__AMP_LOG;
var $hasOwn_$$module$src$utils$object$$ = Object.prototype.hasOwnProperty;
(function($opt_initial$jscomp$1$$) {
  return $opt_initial$jscomp$1$$ || {};
})({c:!0, v:!0, a:!0, ad:!0, action:!0});
function $experimentToggles$$module$src$experiments$$($JSCompiler_params$jscomp$inline_29_win$jscomp$12$$) {
  if ($JSCompiler_params$jscomp$inline_29_win$jscomp$12$$.__AMP__EXPERIMENT_TOGGLES) {
    return $JSCompiler_params$jscomp$inline_29_win$jscomp$12$$.__AMP__EXPERIMENT_TOGGLES;
  }
  $JSCompiler_params$jscomp$inline_29_win$jscomp$12$$.__AMP__EXPERIMENT_TOGGLES = Object.create(null);
  var $toggles$jscomp$2$$ = $JSCompiler_params$jscomp$inline_29_win$jscomp$12$$.__AMP__EXPERIMENT_TOGGLES;
  if ($JSCompiler_params$jscomp$inline_29_win$jscomp$12$$.AMP_CONFIG) {
    for (var $allowed$3_experimentId$jscomp$2_i$jscomp$11$$ in $JSCompiler_params$jscomp$inline_29_win$jscomp$12$$.AMP_CONFIG) {
      var $frequency$$ = $JSCompiler_params$jscomp$inline_29_win$jscomp$12$$.AMP_CONFIG[$allowed$3_experimentId$jscomp$2_i$jscomp$11$$];
      "number" === typeof $frequency$$ && 0 <= $frequency$$ && 1 >= $frequency$$ && ($toggles$jscomp$2$$[$allowed$3_experimentId$jscomp$2_i$jscomp$11$$] = Math.random() < $frequency$$);
    }
  }
  if ($JSCompiler_params$jscomp$inline_29_win$jscomp$12$$.AMP_CONFIG && Array.isArray($JSCompiler_params$jscomp$inline_29_win$jscomp$12$$.AMP_CONFIG["allow-doc-opt-in"]) && 0 < $JSCompiler_params$jscomp$inline_29_win$jscomp$12$$.AMP_CONFIG["allow-doc-opt-in"].length) {
    var $allowed$$ = $JSCompiler_params$jscomp$inline_29_win$jscomp$12$$.AMP_CONFIG["allow-doc-opt-in"], $meta$$ = $JSCompiler_params$jscomp$inline_29_win$jscomp$12$$.document.head.querySelector('meta[name="amp-experiments-opt-in"]');
    if ($meta$$) {
      var $optedInExperiments$$ = $meta$$.getAttribute("content").split(",");
      for ($allowed$3_experimentId$jscomp$2_i$jscomp$11$$ = 0; $allowed$3_experimentId$jscomp$2_i$jscomp$11$$ < $optedInExperiments$$.length; $allowed$3_experimentId$jscomp$2_i$jscomp$11$$++) {
        -1 != $allowed$$.indexOf($optedInExperiments$$[$allowed$3_experimentId$jscomp$2_i$jscomp$11$$]) && ($toggles$jscomp$2$$[$optedInExperiments$$[$allowed$3_experimentId$jscomp$2_i$jscomp$11$$]] = !0);
      }
    }
  }
  Object.assign($toggles$jscomp$2$$, $getExperimentToggles$$module$src$experiments$$($JSCompiler_params$jscomp$inline_29_win$jscomp$12$$));
  if ($JSCompiler_params$jscomp$inline_29_win$jscomp$12$$.AMP_CONFIG && Array.isArray($JSCompiler_params$jscomp$inline_29_win$jscomp$12$$.AMP_CONFIG["allow-url-opt-in"]) && 0 < $JSCompiler_params$jscomp$inline_29_win$jscomp$12$$.AMP_CONFIG["allow-url-opt-in"].length) {
    $allowed$3_experimentId$jscomp$2_i$jscomp$11$$ = $JSCompiler_params$jscomp$inline_29_win$jscomp$12$$.AMP_CONFIG["allow-url-opt-in"];
    var $JSCompiler_queryString$jscomp$inline_28_i$4$$ = $JSCompiler_params$jscomp$inline_29_win$jscomp$12$$.location.originalHash || $JSCompiler_params$jscomp$inline_29_win$jscomp$12$$.location.hash;
    $JSCompiler_params$jscomp$inline_29_win$jscomp$12$$ = Object.create(null);
    if ($JSCompiler_queryString$jscomp$inline_28_i$4$$) {
      for (var $JSCompiler_match$jscomp$inline_30_JSCompiler_value$jscomp$inline_32$$; $JSCompiler_match$jscomp$inline_30_JSCompiler_value$jscomp$inline_32$$ = $regex$$module$src$url_parse_query_string$$.exec($JSCompiler_queryString$jscomp$inline_28_i$4$$);) {
        var $JSCompiler_name$jscomp$inline_31_param$jscomp$6$$ = $tryDecodeUriComponent_$$module$src$url_try_decode_uri_component$$($JSCompiler_match$jscomp$inline_30_JSCompiler_value$jscomp$inline_32$$[1], $JSCompiler_match$jscomp$inline_30_JSCompiler_value$jscomp$inline_32$$[1]);
        $JSCompiler_match$jscomp$inline_30_JSCompiler_value$jscomp$inline_32$$ = $JSCompiler_match$jscomp$inline_30_JSCompiler_value$jscomp$inline_32$$[2] ? $tryDecodeUriComponent_$$module$src$url_try_decode_uri_component$$($JSCompiler_match$jscomp$inline_30_JSCompiler_value$jscomp$inline_32$$[2].replace(/\+/g, " "), $JSCompiler_match$jscomp$inline_30_JSCompiler_value$jscomp$inline_32$$[2]) : "";
        $JSCompiler_params$jscomp$inline_29_win$jscomp$12$$[$JSCompiler_name$jscomp$inline_31_param$jscomp$6$$] = $JSCompiler_match$jscomp$inline_30_JSCompiler_value$jscomp$inline_32$$;
      }
    }
    for ($JSCompiler_queryString$jscomp$inline_28_i$4$$ = 0; $JSCompiler_queryString$jscomp$inline_28_i$4$$ < $allowed$3_experimentId$jscomp$2_i$jscomp$11$$.length; $JSCompiler_queryString$jscomp$inline_28_i$4$$++) {
      $JSCompiler_name$jscomp$inline_31_param$jscomp$6$$ = $JSCompiler_params$jscomp$inline_29_win$jscomp$12$$["e-" + $allowed$3_experimentId$jscomp$2_i$jscomp$11$$[$JSCompiler_queryString$jscomp$inline_28_i$4$$]], "1" == $JSCompiler_name$jscomp$inline_31_param$jscomp$6$$ && ($toggles$jscomp$2$$[$allowed$3_experimentId$jscomp$2_i$jscomp$11$$[$JSCompiler_queryString$jscomp$inline_28_i$4$$]] = !0), "0" == $JSCompiler_name$jscomp$inline_31_param$jscomp$6$$ && ($toggles$jscomp$2$$[$allowed$3_experimentId$jscomp$2_i$jscomp$11$$[$JSCompiler_queryString$jscomp$inline_28_i$4$$]] = 
      !1);
    }
  }
  return $toggles$jscomp$2$$;
}
function $getExperimentToggles$$module$src$experiments$$($JSCompiler_inline_result$jscomp$14_toggles$jscomp$3_win$jscomp$14$$) {
  var $experimentsString$$ = "";
  try {
    "localStorage" in $JSCompiler_inline_result$jscomp$14_toggles$jscomp$3_win$jscomp$14$$ && ($experimentsString$$ = $JSCompiler_inline_result$jscomp$14_toggles$jscomp$3_win$jscomp$14$$.localStorage.getItem("amp-experiment-toggles"));
  } catch ($e$jscomp$10$$) {
    if ($logs$$module$src$log$$.dev) {
      $JSCompiler_inline_result$jscomp$14_toggles$jscomp$3_win$jscomp$14$$ = $logs$$module$src$log$$.dev;
    } else {
      throw Error("failed to call initLogConstructor");
    }
    $JSCompiler_inline_result$jscomp$14_toggles$jscomp$3_win$jscomp$14$$.warn("EXPERIMENTS", "Failed to retrieve experiments from localStorage.");
  }
  var $tokens$$ = $experimentsString$$ ? $experimentsString$$.split(/\s*,\s*/g) : [];
  $JSCompiler_inline_result$jscomp$14_toggles$jscomp$3_win$jscomp$14$$ = Object.create(null);
  for (var $i$jscomp$12$$ = 0; $i$jscomp$12$$ < $tokens$$.length; $i$jscomp$12$$++) {
    0 != $tokens$$[$i$jscomp$12$$].length && ("-" == $tokens$$[$i$jscomp$12$$][0] ? $JSCompiler_inline_result$jscomp$14_toggles$jscomp$3_win$jscomp$14$$[$tokens$$[$i$jscomp$12$$].substr(1)] = !1 : $JSCompiler_inline_result$jscomp$14_toggles$jscomp$3_win$jscomp$14$$[$tokens$$[$i$jscomp$12$$]] = !0);
  }
  return $JSCompiler_inline_result$jscomp$14_toggles$jscomp$3_win$jscomp$14$$;
}
;var $EXPERIMENT_INFO_LIST$$module$src$ampdoc_fie$$ = [{experimentId:"ampdoc-fie", isTrafficEligible:function() {
  return !0;
}, branches:["21065001", "21065002"]}];
function $getService$$module$src$service$$($win$jscomp$25$$, $id$jscomp$13$$) {
  $win$jscomp$25$$ = $win$jscomp$25$$.__AMP_TOP || ($win$jscomp$25$$.__AMP_TOP = $win$jscomp$25$$);
  return $getServiceInternal$$module$src$service$$($win$jscomp$25$$, $id$jscomp$13$$);
}
function $getServiceForDoc$$module$src$service$$($elementOrAmpDoc$$) {
  var $ampdoc$jscomp$3_holder$jscomp$2$$ = $getAmpdoc$$module$src$service$$($elementOrAmpDoc$$);
  $ampdoc$jscomp$3_holder$jscomp$2$$ = $getAmpdocServiceHolder$$module$src$service$$($ampdoc$jscomp$3_holder$jscomp$2$$);
  return $getServiceInternal$$module$src$service$$($ampdoc$jscomp$3_holder$jscomp$2$$, "viewer");
}
function $getAmpdoc$$module$src$service$$($nodeOrDoc$jscomp$2$$) {
  return $nodeOrDoc$jscomp$2$$.nodeType ? $getService$$module$src$service$$(($nodeOrDoc$jscomp$2$$.ownerDocument || $nodeOrDoc$jscomp$2$$).defaultView, "ampdoc").getAmpDoc($nodeOrDoc$jscomp$2$$) : $nodeOrDoc$jscomp$2$$;
}
function $getAmpdocServiceHolder$$module$src$service$$($ampdoc$jscomp$5_nodeOrDoc$jscomp$3$$) {
  $ampdoc$jscomp$5_nodeOrDoc$jscomp$3$$ = $getAmpdoc$$module$src$service$$($ampdoc$jscomp$5_nodeOrDoc$jscomp$3$$);
  return $ampdoc$jscomp$5_nodeOrDoc$jscomp$3$$.isSingleDoc() ? $ampdoc$jscomp$5_nodeOrDoc$jscomp$3$$.win : $ampdoc$jscomp$5_nodeOrDoc$jscomp$3$$;
}
function $getServiceInternal$$module$src$service$$($holder$jscomp$4_s$jscomp$9$$, $id$jscomp$21$$) {
  $isServiceRegistered$$module$src$service$$($holder$jscomp$4_s$jscomp$9$$, $id$jscomp$21$$);
  var $JSCompiler_services$jscomp$inline_19$$ = $holder$jscomp$4_s$jscomp$9$$.__AMP_SERVICES;
  $JSCompiler_services$jscomp$inline_19$$ || ($JSCompiler_services$jscomp$inline_19$$ = $holder$jscomp$4_s$jscomp$9$$.__AMP_SERVICES = {});
  $holder$jscomp$4_s$jscomp$9$$ = $JSCompiler_services$jscomp$inline_19$$[$id$jscomp$21$$];
  $holder$jscomp$4_s$jscomp$9$$.obj || ($holder$jscomp$4_s$jscomp$9$$.obj = new $holder$jscomp$4_s$jscomp$9$$.ctor($holder$jscomp$4_s$jscomp$9$$.context), $holder$jscomp$4_s$jscomp$9$$.ctor = null, $holder$jscomp$4_s$jscomp$9$$.context = null, $holder$jscomp$4_s$jscomp$9$$.resolve && $holder$jscomp$4_s$jscomp$9$$.resolve($holder$jscomp$4_s$jscomp$9$$.obj));
  return $holder$jscomp$4_s$jscomp$9$$.obj;
}
function $isServiceRegistered$$module$src$service$$($holder$jscomp$12_service$jscomp$5$$, $id$jscomp$30$$) {
  $holder$jscomp$12_service$jscomp$5$$ = $holder$jscomp$12_service$jscomp$5$$.__AMP_SERVICES && $holder$jscomp$12_service$jscomp$5$$.__AMP_SERVICES[$id$jscomp$30$$];
  return !(!$holder$jscomp$12_service$jscomp$5$$ || !$holder$jscomp$12_service$jscomp$5$$.ctor && !$holder$jscomp$12_service$jscomp$5$$.obj);
}
;/*
 https://mths.be/cssescape v1.5.1 by @mathias | MIT license */
function $referrers_$$module$extensions$amp_dynamic_css_classes$0_1$amp_dynamic_css_classes$$($referrer$jscomp$1$$) {
  var $domainBase$$ = "";
  return $referrer$jscomp$1$$.split(".").reduceRight(function($referrer$jscomp$1$$, $domain$jscomp$2$$) {
    $domainBase$$ && ($domain$jscomp$2$$ += "." + $domainBase$$);
    $domainBase$$ = $domain$jscomp$2$$;
    $referrer$jscomp$1$$.push($domain$jscomp$2$$);
    return $referrer$jscomp$1$$;
  }, []);
}
function $normalizedReferrers$$module$extensions$amp_dynamic_css_classes$0_1$amp_dynamic_css_classes$$($ampdoc$jscomp$13$$) {
  var $JSCompiler_inline_result$jscomp$16_JSCompiler_referrer$jscomp$inline_22_JSCompiler_temp$jscomp$36$$;
  if ($JSCompiler_inline_result$jscomp$16_JSCompiler_referrer$jscomp$inline_22_JSCompiler_temp$jscomp$36$$ = $getServiceForDoc$$module$src$service$$($ampdoc$jscomp$13$$).getUnconfirmedReferrerUrl()) {
    var $JSCompiler_ampdoc$jscomp$inline_49_JSCompiler_element$jscomp$inline_38_JSCompiler_holder$jscomp$inline_50_JSCompiler_temp$jscomp$45$$ = $ampdoc$jscomp$13$$.getHeadNode(), $JSCompiler_win$jscomp$inline_39$$ = $JSCompiler_ampdoc$jscomp$inline_49_JSCompiler_element$jscomp$inline_38_JSCompiler_holder$jscomp$inline_50_JSCompiler_temp$jscomp$45$$.ownerDocument.defaultView, $JSCompiler_inline_result$jscomp$44_JSCompiler_topWin$jscomp$inline_40$$ = $JSCompiler_win$jscomp$inline_39$$.__AMP_TOP || 
    ($JSCompiler_win$jscomp$inline_39$$.__AMP_TOP = $JSCompiler_win$jscomp$inline_39$$), $JSCompiler_isEmbed$jscomp$inline_41$$ = $JSCompiler_win$jscomp$inline_39$$ != $JSCompiler_inline_result$jscomp$44_JSCompiler_topWin$jscomp$inline_40$$;
    if ($experimentToggles$$module$src$experiments$$($JSCompiler_inline_result$jscomp$44_JSCompiler_topWin$jscomp$inline_40$$)["ampdoc-fie"]) {
      $JSCompiler_inline_result$jscomp$44_JSCompiler_topWin$jscomp$inline_40$$.__AMP_EXPERIMENT_BRANCHES = $JSCompiler_inline_result$jscomp$44_JSCompiler_topWin$jscomp$inline_40$$.__AMP_EXPERIMENT_BRANCHES || {};
      for (var $JSCompiler_i$jscomp$inline_54$$ = 0; $JSCompiler_i$jscomp$inline_54$$ < $EXPERIMENT_INFO_LIST$$module$src$ampdoc_fie$$.length; $JSCompiler_i$jscomp$inline_54$$++) {
        var $JSCompiler_arr$jscomp$inline_63_JSCompiler_experiment$jscomp$inline_55$$ = $EXPERIMENT_INFO_LIST$$module$src$ampdoc_fie$$[$JSCompiler_i$jscomp$inline_54$$], $JSCompiler_experimentName$jscomp$inline_56$$ = $JSCompiler_arr$jscomp$inline_63_JSCompiler_experiment$jscomp$inline_55$$.experimentId;
        $hasOwn_$$module$src$utils$object$$.call($JSCompiler_inline_result$jscomp$44_JSCompiler_topWin$jscomp$inline_40$$.__AMP_EXPERIMENT_BRANCHES, $JSCompiler_experimentName$jscomp$inline_56$$) || ($JSCompiler_arr$jscomp$inline_63_JSCompiler_experiment$jscomp$inline_55$$.isTrafficEligible && $JSCompiler_arr$jscomp$inline_63_JSCompiler_experiment$jscomp$inline_55$$.isTrafficEligible($JSCompiler_inline_result$jscomp$44_JSCompiler_topWin$jscomp$inline_40$$) ? !$JSCompiler_inline_result$jscomp$44_JSCompiler_topWin$jscomp$inline_40$$.__AMP_EXPERIMENT_BRANCHES[$JSCompiler_experimentName$jscomp$inline_56$$] && 
        $experimentToggles$$module$src$experiments$$($JSCompiler_inline_result$jscomp$44_JSCompiler_topWin$jscomp$inline_40$$)[$JSCompiler_experimentName$jscomp$inline_56$$] && ($JSCompiler_arr$jscomp$inline_63_JSCompiler_experiment$jscomp$inline_55$$ = $JSCompiler_arr$jscomp$inline_63_JSCompiler_experiment$jscomp$inline_55$$.branches, $JSCompiler_inline_result$jscomp$44_JSCompiler_topWin$jscomp$inline_40$$.__AMP_EXPERIMENT_BRANCHES[$JSCompiler_experimentName$jscomp$inline_56$$] = $JSCompiler_arr$jscomp$inline_63_JSCompiler_experiment$jscomp$inline_55$$[Math.floor(Math.random() * 
        $JSCompiler_arr$jscomp$inline_63_JSCompiler_experiment$jscomp$inline_55$$.length)] || null) : $JSCompiler_inline_result$jscomp$44_JSCompiler_topWin$jscomp$inline_40$$.__AMP_EXPERIMENT_BRANCHES[$JSCompiler_experimentName$jscomp$inline_56$$] = null);
      }
      $JSCompiler_inline_result$jscomp$44_JSCompiler_topWin$jscomp$inline_40$$ = "21065002" === ($JSCompiler_inline_result$jscomp$44_JSCompiler_topWin$jscomp$inline_40$$.__AMP_EXPERIMENT_BRANCHES ? $JSCompiler_inline_result$jscomp$44_JSCompiler_topWin$jscomp$inline_40$$.__AMP_EXPERIMENT_BRANCHES["ampdoc-fie"] : null);
    } else {
      $JSCompiler_inline_result$jscomp$44_JSCompiler_topWin$jscomp$inline_40$$ = !1;
    }
    $JSCompiler_isEmbed$jscomp$inline_41$$ && !$JSCompiler_inline_result$jscomp$44_JSCompiler_topWin$jscomp$inline_40$$ ? $JSCompiler_ampdoc$jscomp$inline_49_JSCompiler_element$jscomp$inline_38_JSCompiler_holder$jscomp$inline_50_JSCompiler_temp$jscomp$45$$ = $isServiceRegistered$$module$src$service$$($JSCompiler_win$jscomp$inline_39$$, "url") ? $getServiceInternal$$module$src$service$$($JSCompiler_win$jscomp$inline_39$$, "url") : null : ($JSCompiler_ampdoc$jscomp$inline_49_JSCompiler_element$jscomp$inline_38_JSCompiler_holder$jscomp$inline_50_JSCompiler_temp$jscomp$45$$ = 
    $getAmpdoc$$module$src$service$$($JSCompiler_ampdoc$jscomp$inline_49_JSCompiler_element$jscomp$inline_38_JSCompiler_holder$jscomp$inline_50_JSCompiler_temp$jscomp$45$$), $JSCompiler_ampdoc$jscomp$inline_49_JSCompiler_element$jscomp$inline_38_JSCompiler_holder$jscomp$inline_50_JSCompiler_temp$jscomp$45$$ = $getAmpdocServiceHolder$$module$src$service$$($JSCompiler_ampdoc$jscomp$inline_49_JSCompiler_element$jscomp$inline_38_JSCompiler_holder$jscomp$inline_50_JSCompiler_temp$jscomp$45$$), $JSCompiler_ampdoc$jscomp$inline_49_JSCompiler_element$jscomp$inline_38_JSCompiler_holder$jscomp$inline_50_JSCompiler_temp$jscomp$45$$ = 
    $isServiceRegistered$$module$src$service$$($JSCompiler_ampdoc$jscomp$inline_49_JSCompiler_element$jscomp$inline_38_JSCompiler_holder$jscomp$inline_50_JSCompiler_temp$jscomp$45$$, "url") ? $getServiceInternal$$module$src$service$$($JSCompiler_ampdoc$jscomp$inline_49_JSCompiler_element$jscomp$inline_38_JSCompiler_holder$jscomp$inline_50_JSCompiler_temp$jscomp$45$$, "url") : null);
    $JSCompiler_inline_result$jscomp$16_JSCompiler_referrer$jscomp$inline_22_JSCompiler_temp$jscomp$36$$ = $JSCompiler_ampdoc$jscomp$inline_49_JSCompiler_element$jscomp$inline_38_JSCompiler_holder$jscomp$inline_50_JSCompiler_temp$jscomp$45$$.parse($JSCompiler_inline_result$jscomp$16_JSCompiler_referrer$jscomp$inline_22_JSCompiler_temp$jscomp$36$$).hostname;
  } else {
    $JSCompiler_inline_result$jscomp$16_JSCompiler_referrer$jscomp$inline_22_JSCompiler_temp$jscomp$36$$ = "";
  }
  return "t.co" === $JSCompiler_inline_result$jscomp$16_JSCompiler_referrer$jscomp$inline_22_JSCompiler_temp$jscomp$36$$ ? $referrers_$$module$extensions$amp_dynamic_css_classes$0_1$amp_dynamic_css_classes$$("twitter.com") : !$JSCompiler_inline_result$jscomp$16_JSCompiler_referrer$jscomp$inline_22_JSCompiler_temp$jscomp$36$$ && /Pinterest/.test($ampdoc$jscomp$13$$.win.navigator.userAgent) ? $referrers_$$module$extensions$amp_dynamic_css_classes$0_1$amp_dynamic_css_classes$$("www.pinterest.com") : 
  $referrers_$$module$extensions$amp_dynamic_css_classes$0_1$amp_dynamic_css_classes$$($JSCompiler_inline_result$jscomp$16_JSCompiler_referrer$jscomp$inline_22_JSCompiler_temp$jscomp$36$$);
}
function $addDynamicCssClasses$$module$extensions$amp_dynamic_css_classes$0_1$amp_dynamic_css_classes$$($ampdoc$jscomp$14$$, $classes$$) {
  $ampdoc$jscomp$14$$.isBodyAvailable() ? $addCssClassesToBody$$module$extensions$amp_dynamic_css_classes$0_1$amp_dynamic_css_classes$$($ampdoc$jscomp$14$$.getBody(), $classes$$) : $ampdoc$jscomp$14$$.waitForBodyOpen().then(function($ampdoc$jscomp$14$$) {
    return $addCssClassesToBody$$module$extensions$amp_dynamic_css_classes$0_1$amp_dynamic_css_classes$$($ampdoc$jscomp$14$$, $classes$$);
  });
}
function $addCssClassesToBody$$module$extensions$amp_dynamic_css_classes$0_1$amp_dynamic_css_classes$$($body$jscomp$2_i$jscomp$16$$, $classes$jscomp$1$$) {
  var $classList$$ = $body$jscomp$2_i$jscomp$16$$.classList;
  for ($body$jscomp$2_i$jscomp$16$$ = 0; $body$jscomp$2_i$jscomp$16$$ < $classes$jscomp$1$$.length; $body$jscomp$2_i$jscomp$16$$++) {
    $classList$$.add($classes$jscomp$1$$[$body$jscomp$2_i$jscomp$16$$]);
  }
}
function $addReferrerClasses$$module$extensions$amp_dynamic_css_classes$0_1$amp_dynamic_css_classes$$($ampdoc$jscomp$15$$) {
  var $classes$jscomp$2$$ = $normalizedReferrers$$module$extensions$amp_dynamic_css_classes$0_1$amp_dynamic_css_classes$$($ampdoc$jscomp$15$$).map(function($ampdoc$jscomp$15$$) {
    return "amp-referrer-" + $ampdoc$jscomp$15$$.replace(/\./g, "-");
  });
  $getService$$module$src$service$$($ampdoc$jscomp$15$$.win, "vsync").mutate(function() {
    $addDynamicCssClasses$$module$extensions$amp_dynamic_css_classes$0_1$amp_dynamic_css_classes$$($ampdoc$jscomp$15$$, $classes$jscomp$2$$);
  });
}
function $addViewerClass$$module$extensions$amp_dynamic_css_classes$0_1$amp_dynamic_css_classes$$($ampdoc$jscomp$16$$) {
  $getServiceForDoc$$module$src$service$$($ampdoc$jscomp$16$$).isEmbedded() && $getService$$module$src$service$$($ampdoc$jscomp$16$$.win, "vsync").mutate(function() {
    $addDynamicCssClasses$$module$extensions$amp_dynamic_css_classes$0_1$amp_dynamic_css_classes$$($ampdoc$jscomp$16$$, ["amp-viewer"]);
  });
}
function $AmpDynamicCssClasses$$module$extensions$amp_dynamic_css_classes$0_1$amp_dynamic_css_classes$$($ampdoc$jscomp$18$$) {
  $addReferrerClasses$$module$extensions$amp_dynamic_css_classes$0_1$amp_dynamic_css_classes$$($ampdoc$jscomp$18$$);
  $addViewerClass$$module$extensions$amp_dynamic_css_classes$0_1$amp_dynamic_css_classes$$($ampdoc$jscomp$18$$);
}
$AmpDynamicCssClasses$$module$extensions$amp_dynamic_css_classes$0_1$amp_dynamic_css_classes$$.prototype.whenReady = function() {
  $resolved$$module$src$resolved_promise$$ || ($resolved$$module$src$resolved_promise$$ = Promise.resolve(void 0));
  var $JSCompiler_inline_result$jscomp$13$$ = $resolved$$module$src$resolved_promise$$;
  return $JSCompiler_inline_result$jscomp$13$$;
};
(function($AMP$jscomp$1$$) {
  $AMP$jscomp$1$$.registerServiceForDoc("amp-dynamic-css-classes", $AmpDynamicCssClasses$$module$extensions$amp_dynamic_css_classes$0_1$amp_dynamic_css_classes$$);
})(self.AMP);

})});

//# sourceMappingURL=amp-dynamic-css-classes-0.1.js.map
