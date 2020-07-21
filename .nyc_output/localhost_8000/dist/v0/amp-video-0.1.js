(self.AMP=self.AMP||[]).push({n:"amp-video",v:"2007210308000",f:(function(AMP,_){
var $JSCompiler_prototypeAlias$$, $$jscomp$objectCreate$$ = "function" == typeof Object.create ? Object.create : function($prototype$$) {
  function $ctor$$() {
  }
  $ctor$$.prototype = $prototype$$;
  return new $ctor$$;
};
function $$jscomp$getGlobal$$($passedInThis$$) {
  for (var $possibleGlobals$$ = ["object" == typeof globalThis && globalThis, $passedInThis$$, "object" == typeof window && window, "object" == typeof self && self, "object" == typeof global && global, ], $i$jscomp$4$$ = 0; $i$jscomp$4$$ < $possibleGlobals$$.length; ++$i$jscomp$4$$) {
    var $maybeGlobal$$ = $possibleGlobals$$[$i$jscomp$4$$];
    if ($maybeGlobal$$ && $maybeGlobal$$.Math == Math) {
      return;
    }
  }
  (function() {
    throw Error("Cannot find global object");
  })();
}
$$jscomp$getGlobal$$(this);
"function" === typeof Symbol && Symbol("x");
var $JSCompiler_temp$jscomp$21$$;
if ("function" == typeof Object.setPrototypeOf) {
  $JSCompiler_temp$jscomp$21$$ = Object.setPrototypeOf;
} else {
  var $JSCompiler_inline_result$jscomp$22$$;
  a: {
    var $JSCompiler_x$jscomp$inline_50$$ = {a:!0}, $JSCompiler_y$jscomp$inline_51$$ = {};
    try {
      $JSCompiler_y$jscomp$inline_51$$.__proto__ = $JSCompiler_x$jscomp$inline_50$$;
      $JSCompiler_inline_result$jscomp$22$$ = $JSCompiler_y$jscomp$inline_51$$.a;
      break a;
    } catch ($JSCompiler_e$jscomp$inline_52$$) {
    }
    $JSCompiler_inline_result$jscomp$22$$ = !1;
  }
  $JSCompiler_temp$jscomp$21$$ = $JSCompiler_inline_result$jscomp$22$$ ? function($target$jscomp$95$$, $proto$jscomp$3$$) {
    $target$jscomp$95$$.__proto__ = $proto$jscomp$3$$;
    if ($target$jscomp$95$$.__proto__ !== $proto$jscomp$3$$) {
      throw new TypeError($target$jscomp$95$$ + " is not extensible");
    }
    return $target$jscomp$95$$;
  } : null;
}
var $$jscomp$setPrototypeOf$$ = $JSCompiler_temp$jscomp$21$$, $resolved$$module$src$resolved_promise$$;
function $resolvedPromise$$module$src$resolved_promise$$() {
  return $resolved$$module$src$resolved_promise$$ ? $resolved$$module$src$resolved_promise$$ : $resolved$$module$src$resolved_promise$$ = Promise.resolve(void 0);
}
;function $tryDecodeUriComponent_$$module$src$url_try_decode_uri_component$$($component$jscomp$4$$, $fallback$$) {
  $fallback$$ = void 0 === $fallback$$ ? "" : $fallback$$;
  try {
    return decodeURIComponent($component$jscomp$4$$);
  } catch ($e$jscomp$8$$) {
    return $fallback$$;
  }
}
;var $regex$$module$src$url_parse_query_string$$ = /(?:^[#?]?|&)([^=&]+)(?:=([^&]*))?/g;
function $parseQueryString_$$module$src$url_parse_query_string$$($queryString$$) {
  var $params$jscomp$1$$ = Object.create(null);
  if (!$queryString$$) {
    return $params$jscomp$1$$;
  }
  for (var $match$$; $match$$ = $regex$$module$src$url_parse_query_string$$.exec($queryString$$);) {
    var $name$jscomp$71$$ = $tryDecodeUriComponent_$$module$src$url_try_decode_uri_component$$($match$$[1], $match$$[1]), $value$jscomp$89$$ = $match$$[2] ? $tryDecodeUriComponent_$$module$src$url_try_decode_uri_component$$($match$$[2].replace(/\+/g, " "), $match$$[2]) : "";
    $params$jscomp$1$$[$name$jscomp$71$$] = $value$jscomp$89$$;
  }
  return $params$jscomp$1$$;
}
;var $rtvVersion$$module$src$mode$$ = "";
function $getMode$$module$src$mode$$($opt_win$$) {
  var $win$$ = $opt_win$$ || self;
  if ($win$$.__AMP_MODE) {
    var $JSCompiler_hashQuery$jscomp$inline_55_JSCompiler_inline_result$jscomp$24_JSCompiler_temp$jscomp$23$$ = $win$$.__AMP_MODE;
  } else {
    $JSCompiler_hashQuery$jscomp$inline_55_JSCompiler_inline_result$jscomp$24_JSCompiler_temp$jscomp$23$$ = $parseQueryString_$$module$src$url_parse_query_string$$($win$$.location.originalHash || $win$$.location.hash);
    var $JSCompiler_searchQuery$jscomp$inline_56$$ = $parseQueryString_$$module$src$url_parse_query_string$$($win$$.location.search);
    $rtvVersion$$module$src$mode$$ || ($rtvVersion$$module$src$mode$$ = $win$$.AMP_CONFIG && $win$$.AMP_CONFIG.v ? $win$$.AMP_CONFIG.v : "012007210308000");
    $JSCompiler_hashQuery$jscomp$inline_55_JSCompiler_inline_result$jscomp$24_JSCompiler_temp$jscomp$23$$ = {localDev:!1, development:!!(0 <= ["1", "actions", "amp", "amp4ads", "amp4email"].indexOf($JSCompiler_hashQuery$jscomp$inline_55_JSCompiler_inline_result$jscomp$24_JSCompiler_temp$jscomp$23$$.development) || $win$$.AMP_DEV_MODE), examiner:"2" == $JSCompiler_hashQuery$jscomp$inline_55_JSCompiler_inline_result$jscomp$24_JSCompiler_temp$jscomp$23$$.development, esm:!1, geoOverride:$JSCompiler_hashQuery$jscomp$inline_55_JSCompiler_inline_result$jscomp$24_JSCompiler_temp$jscomp$23$$["amp-geo"], 
    minified:!0, lite:void 0 != $JSCompiler_searchQuery$jscomp$inline_56$$.amp_lite, test:!1, log:$JSCompiler_hashQuery$jscomp$inline_55_JSCompiler_inline_result$jscomp$24_JSCompiler_temp$jscomp$23$$.log, version:"2007210308000", rtvVersion:$rtvVersion$$module$src$mode$$};
    $JSCompiler_hashQuery$jscomp$inline_55_JSCompiler_inline_result$jscomp$24_JSCompiler_temp$jscomp$23$$ = $win$$.__AMP_MODE = $JSCompiler_hashQuery$jscomp$inline_55_JSCompiler_inline_result$jscomp$24_JSCompiler_temp$jscomp$23$$;
  }
  return $JSCompiler_hashQuery$jscomp$inline_55_JSCompiler_inline_result$jscomp$24_JSCompiler_temp$jscomp$23$$;
}
;var $toString_$$module$src$types$$ = Object.prototype.toString;
function $toArray$$module$src$types$$($arrayLike$jscomp$1$$) {
  return $arrayLike$jscomp$1$$ ? Array.prototype.slice.call($arrayLike$jscomp$1$$) : [];
}
function $isFiniteNumber$$module$src$types$$($value$jscomp$93$$) {
  return "number" === typeof $value$jscomp$93$$ && isFinite($value$jscomp$93$$);
}
;function $once$$module$src$utils$function$$($fn$jscomp$1$$) {
  var $evaluated$$ = !1, $retValue$$ = null, $callback$jscomp$50$$ = $fn$jscomp$1$$;
  return function($fn$jscomp$1$$) {
    for (var $args$$ = [], $$jscomp$restIndex$$ = 0; $$jscomp$restIndex$$ < arguments.length; ++$$jscomp$restIndex$$) {
      $args$$[$$jscomp$restIndex$$ - 0] = arguments[$$jscomp$restIndex$$];
    }
    $evaluated$$ || ($retValue$$ = $callback$jscomp$50$$.apply(self, $args$$), $evaluated$$ = !0, $callback$jscomp$50$$ = null);
    return $retValue$$;
  };
}
;var $env$$module$src$config$$ = self.AMP_CONFIG || {}, $cdnProxyRegex$$module$src$config$$ = ("string" == typeof $env$$module$src$config$$.cdnProxyRegex ? new RegExp($env$$module$src$config$$.cdnProxyRegex) : $env$$module$src$config$$.cdnProxyRegex) || /^https:\/\/([a-zA-Z0-9_-]+\.)?cdn\.ampproject\.org$/;
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
function $user$$module$src$log$$() {
  if (!$logs$$module$src$log$$.user) {
    throw Error("failed to call initLogConstructor");
  }
  return $logs$$module$src$log$$.user;
}
function $dev$$module$src$log$$() {
  if ($logs$$module$src$log$$.dev) {
    return $logs$$module$src$log$$.dev;
  }
  throw Error("failed to call initLogConstructor");
}
function $userAssert$$module$src$log$$($shouldBeTrueish$jscomp$3$$, $opt_message$jscomp$15$$, $opt_1$jscomp$1$$) {
  return $user$$module$src$log$$().assert($shouldBeTrueish$jscomp$3$$, $opt_message$jscomp$15$$, $opt_1$jscomp$1$$, void 0, void 0, void 0, void 0, void 0, void 0, void 0, void 0);
}
;var $hasOwn_$$module$src$utils$object$$ = Object.prototype.hasOwnProperty;
function $map$$module$src$utils$object$$($opt_initial$$) {
  var $obj$jscomp$28$$ = Object.create(null);
  $opt_initial$$ && Object.assign($obj$jscomp$28$$, $opt_initial$$);
  return $obj$jscomp$28$$;
}
function $dict$$module$src$utils$object$$($opt_initial$jscomp$1$$) {
  return $opt_initial$jscomp$1$$ || {};
}
;function $startsWith$$module$src$string$$($string$jscomp$6$$, $prefix$jscomp$4$$) {
  return $prefix$jscomp$4$$.length > $string$jscomp$6$$.length ? !1 : 0 == $string$jscomp$6$$.lastIndexOf($prefix$jscomp$4$$, 0);
}
;$dict$$module$src$utils$object$$({c:!0, v:!0, a:!0, ad:!0, action:!0});
function $experimentToggles$$module$src$experiments$$($params$jscomp$5_win$jscomp$12$$) {
  if ($params$jscomp$5_win$jscomp$12$$.__AMP__EXPERIMENT_TOGGLES) {
    return $params$jscomp$5_win$jscomp$12$$.__AMP__EXPERIMENT_TOGGLES;
  }
  $params$jscomp$5_win$jscomp$12$$.__AMP__EXPERIMENT_TOGGLES = Object.create(null);
  var $toggles$jscomp$2$$ = $params$jscomp$5_win$jscomp$12$$.__AMP__EXPERIMENT_TOGGLES;
  if ($params$jscomp$5_win$jscomp$12$$.AMP_CONFIG) {
    for (var $allowed$4_experimentId$jscomp$2_i$jscomp$15$$ in $params$jscomp$5_win$jscomp$12$$.AMP_CONFIG) {
      var $frequency$$ = $params$jscomp$5_win$jscomp$12$$.AMP_CONFIG[$allowed$4_experimentId$jscomp$2_i$jscomp$15$$];
      "number" === typeof $frequency$$ && 0 <= $frequency$$ && 1 >= $frequency$$ && ($toggles$jscomp$2$$[$allowed$4_experimentId$jscomp$2_i$jscomp$15$$] = Math.random() < $frequency$$);
    }
  }
  if ($params$jscomp$5_win$jscomp$12$$.AMP_CONFIG && Array.isArray($params$jscomp$5_win$jscomp$12$$.AMP_CONFIG["allow-doc-opt-in"]) && 0 < $params$jscomp$5_win$jscomp$12$$.AMP_CONFIG["allow-doc-opt-in"].length) {
    var $allowed$$ = $params$jscomp$5_win$jscomp$12$$.AMP_CONFIG["allow-doc-opt-in"], $meta$$ = $params$jscomp$5_win$jscomp$12$$.document.head.querySelector('meta[name="amp-experiments-opt-in"]');
    if ($meta$$) {
      var $optedInExperiments$$ = $meta$$.getAttribute("content").split(",");
      for ($allowed$4_experimentId$jscomp$2_i$jscomp$15$$ = 0; $allowed$4_experimentId$jscomp$2_i$jscomp$15$$ < $optedInExperiments$$.length; $allowed$4_experimentId$jscomp$2_i$jscomp$15$$++) {
        -1 != $allowed$$.indexOf($optedInExperiments$$[$allowed$4_experimentId$jscomp$2_i$jscomp$15$$]) && ($toggles$jscomp$2$$[$optedInExperiments$$[$allowed$4_experimentId$jscomp$2_i$jscomp$15$$]] = !0);
      }
    }
  }
  Object.assign($toggles$jscomp$2$$, $getExperimentToggles$$module$src$experiments$$($params$jscomp$5_win$jscomp$12$$));
  if ($params$jscomp$5_win$jscomp$12$$.AMP_CONFIG && Array.isArray($params$jscomp$5_win$jscomp$12$$.AMP_CONFIG["allow-url-opt-in"]) && 0 < $params$jscomp$5_win$jscomp$12$$.AMP_CONFIG["allow-url-opt-in"].length) {
    $allowed$4_experimentId$jscomp$2_i$jscomp$15$$ = $params$jscomp$5_win$jscomp$12$$.AMP_CONFIG["allow-url-opt-in"];
    $params$jscomp$5_win$jscomp$12$$ = $parseQueryString_$$module$src$url_parse_query_string$$($params$jscomp$5_win$jscomp$12$$.location.originalHash || $params$jscomp$5_win$jscomp$12$$.location.hash);
    for (var $i$5$$ = 0; $i$5$$ < $allowed$4_experimentId$jscomp$2_i$jscomp$15$$.length; $i$5$$++) {
      var $param$jscomp$6$$ = $params$jscomp$5_win$jscomp$12$$["e-" + $allowed$4_experimentId$jscomp$2_i$jscomp$15$$[$i$5$$]];
      "1" == $param$jscomp$6$$ && ($toggles$jscomp$2$$[$allowed$4_experimentId$jscomp$2_i$jscomp$15$$[$i$5$$]] = !0);
      "0" == $param$jscomp$6$$ && ($toggles$jscomp$2$$[$allowed$4_experimentId$jscomp$2_i$jscomp$15$$[$i$5$$]] = !1);
    }
  }
  return $toggles$jscomp$2$$;
}
function $getExperimentToggles$$module$src$experiments$$($toggles$jscomp$3_win$jscomp$14$$) {
  var $experimentsString$$ = "";
  try {
    "localStorage" in $toggles$jscomp$3_win$jscomp$14$$ && ($experimentsString$$ = $toggles$jscomp$3_win$jscomp$14$$.localStorage.getItem("amp-experiment-toggles"));
  } catch ($e$jscomp$11$$) {
    $dev$$module$src$log$$().warn("EXPERIMENTS", "Failed to retrieve experiments from localStorage.");
  }
  var $tokens$$ = $experimentsString$$ ? $experimentsString$$.split(/\s*,\s*/g) : [];
  $toggles$jscomp$3_win$jscomp$14$$ = Object.create(null);
  for (var $i$jscomp$16$$ = 0; $i$jscomp$16$$ < $tokens$$.length; $i$jscomp$16$$++) {
    0 != $tokens$$[$i$jscomp$16$$].length && ("-" == $tokens$$[$i$jscomp$16$$][0] ? $toggles$jscomp$3_win$jscomp$14$$[$tokens$$[$i$jscomp$16$$].substr(1)] = !1 : $toggles$jscomp$3_win$jscomp$14$$[$tokens$$[$i$jscomp$16$$]] = !0);
  }
  return $toggles$jscomp$3_win$jscomp$14$$;
}
;var $EXPERIMENT_INFO_LIST$$module$src$ampdoc_fie$$ = [{experimentId:"ampdoc-fie", isTrafficEligible:function() {
  return !0;
}, branches:["21065001", "21065002"]}];
function $getExistingServiceForDocInEmbedScope$$module$src$service$$($JSCompiler_ampdoc$jscomp$inline_65_JSCompiler_holder$jscomp$inline_66_element$jscomp$13$$, $JSCompiler_temp$jscomp$27_id$jscomp$8$$) {
  var $win$jscomp$23$$ = $JSCompiler_ampdoc$jscomp$inline_65_JSCompiler_holder$jscomp$inline_66_element$jscomp$13$$.ownerDocument.defaultView, $topWin$$ = $win$jscomp$23$$.__AMP_TOP || ($win$jscomp$23$$.__AMP_TOP = $win$jscomp$23$$), $isEmbed$$ = $win$jscomp$23$$ != $topWin$$, $JSCompiler_i$jscomp$inline_203_JSCompiler_inline_result$jscomp$26$$;
  if ($experimentToggles$$module$src$experiments$$($topWin$$)["ampdoc-fie"]) {
    $topWin$$.__AMP_EXPERIMENT_BRANCHES = $topWin$$.__AMP_EXPERIMENT_BRANCHES || {};
    for ($JSCompiler_i$jscomp$inline_203_JSCompiler_inline_result$jscomp$26$$ = 0; $JSCompiler_i$jscomp$inline_203_JSCompiler_inline_result$jscomp$26$$ < $EXPERIMENT_INFO_LIST$$module$src$ampdoc_fie$$.length; $JSCompiler_i$jscomp$inline_203_JSCompiler_inline_result$jscomp$26$$++) {
      var $JSCompiler_arr$jscomp$inline_265_JSCompiler_experiment$jscomp$inline_204$$ = $EXPERIMENT_INFO_LIST$$module$src$ampdoc_fie$$[$JSCompiler_i$jscomp$inline_203_JSCompiler_inline_result$jscomp$26$$], $JSCompiler_experimentName$jscomp$inline_205$$ = $JSCompiler_arr$jscomp$inline_265_JSCompiler_experiment$jscomp$inline_204$$.experimentId;
      $hasOwn_$$module$src$utils$object$$.call($topWin$$.__AMP_EXPERIMENT_BRANCHES, $JSCompiler_experimentName$jscomp$inline_205$$) || ($JSCompiler_arr$jscomp$inline_265_JSCompiler_experiment$jscomp$inline_204$$.isTrafficEligible && $JSCompiler_arr$jscomp$inline_265_JSCompiler_experiment$jscomp$inline_204$$.isTrafficEligible($topWin$$) ? !$topWin$$.__AMP_EXPERIMENT_BRANCHES[$JSCompiler_experimentName$jscomp$inline_205$$] && $experimentToggles$$module$src$experiments$$($topWin$$)[$JSCompiler_experimentName$jscomp$inline_205$$] && 
      ($JSCompiler_arr$jscomp$inline_265_JSCompiler_experiment$jscomp$inline_204$$ = $JSCompiler_arr$jscomp$inline_265_JSCompiler_experiment$jscomp$inline_204$$.branches, $topWin$$.__AMP_EXPERIMENT_BRANCHES[$JSCompiler_experimentName$jscomp$inline_205$$] = $JSCompiler_arr$jscomp$inline_265_JSCompiler_experiment$jscomp$inline_204$$[Math.floor(Math.random() * $JSCompiler_arr$jscomp$inline_265_JSCompiler_experiment$jscomp$inline_204$$.length)] || null) : $topWin$$.__AMP_EXPERIMENT_BRANCHES[$JSCompiler_experimentName$jscomp$inline_205$$] = 
      null);
    }
    $JSCompiler_i$jscomp$inline_203_JSCompiler_inline_result$jscomp$26$$ = "21065002" === ($topWin$$.__AMP_EXPERIMENT_BRANCHES ? $topWin$$.__AMP_EXPERIMENT_BRANCHES["ampdoc-fie"] : null);
  } else {
    $JSCompiler_i$jscomp$inline_203_JSCompiler_inline_result$jscomp$26$$ = !1;
  }
  var $ampdocFieExperimentOn$$ = $JSCompiler_i$jscomp$inline_203_JSCompiler_inline_result$jscomp$26$$;
  $isEmbed$$ && !$ampdocFieExperimentOn$$ ? $JSCompiler_temp$jscomp$27_id$jscomp$8$$ = $isServiceRegistered$$module$src$service$$($win$jscomp$23$$, $JSCompiler_temp$jscomp$27_id$jscomp$8$$) ? $getServiceInternal$$module$src$service$$($win$jscomp$23$$, $JSCompiler_temp$jscomp$27_id$jscomp$8$$) : null : ($JSCompiler_ampdoc$jscomp$inline_65_JSCompiler_holder$jscomp$inline_66_element$jscomp$13$$ = $getAmpdoc$$module$src$service$$($JSCompiler_ampdoc$jscomp$inline_65_JSCompiler_holder$jscomp$inline_66_element$jscomp$13$$), 
  $JSCompiler_ampdoc$jscomp$inline_65_JSCompiler_holder$jscomp$inline_66_element$jscomp$13$$ = $getAmpdocServiceHolder$$module$src$service$$($JSCompiler_ampdoc$jscomp$inline_65_JSCompiler_holder$jscomp$inline_66_element$jscomp$13$$), $JSCompiler_temp$jscomp$27_id$jscomp$8$$ = $isServiceRegistered$$module$src$service$$($JSCompiler_ampdoc$jscomp$inline_65_JSCompiler_holder$jscomp$inline_66_element$jscomp$13$$, $JSCompiler_temp$jscomp$27_id$jscomp$8$$) ? $getServiceInternal$$module$src$service$$($JSCompiler_ampdoc$jscomp$inline_65_JSCompiler_holder$jscomp$inline_66_element$jscomp$13$$, 
  $JSCompiler_temp$jscomp$27_id$jscomp$8$$) : null);
  return $JSCompiler_temp$jscomp$27_id$jscomp$8$$;
}
function $getService$$module$src$service$$($win$jscomp$25$$, $id$jscomp$13$$) {
  $win$jscomp$25$$ = $win$jscomp$25$$.__AMP_TOP || ($win$jscomp$25$$.__AMP_TOP = $win$jscomp$25$$);
  return $getServiceInternal$$module$src$service$$($win$jscomp$25$$, $id$jscomp$13$$);
}
function $getServiceForDoc$$module$src$service$$($elementOrAmpDoc$$, $id$jscomp$17$$) {
  var $ampdoc$jscomp$3_holder$jscomp$2$$ = $getAmpdoc$$module$src$service$$($elementOrAmpDoc$$);
  $ampdoc$jscomp$3_holder$jscomp$2$$ = $getAmpdocServiceHolder$$module$src$service$$($ampdoc$jscomp$3_holder$jscomp$2$$);
  return $getServiceInternal$$module$src$service$$($ampdoc$jscomp$3_holder$jscomp$2$$, $id$jscomp$17$$);
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
  $holder$jscomp$4_s$jscomp$9$$ = $getServices$$module$src$service$$($holder$jscomp$4_s$jscomp$9$$)[$id$jscomp$21$$];
  $holder$jscomp$4_s$jscomp$9$$.obj || ($holder$jscomp$4_s$jscomp$9$$.obj = new $holder$jscomp$4_s$jscomp$9$$.ctor($holder$jscomp$4_s$jscomp$9$$.context), $holder$jscomp$4_s$jscomp$9$$.ctor = null, $holder$jscomp$4_s$jscomp$9$$.context = null, $holder$jscomp$4_s$jscomp$9$$.resolve && $holder$jscomp$4_s$jscomp$9$$.resolve($holder$jscomp$4_s$jscomp$9$$.obj));
  return $holder$jscomp$4_s$jscomp$9$$.obj;
}
function $getServices$$module$src$service$$($holder$jscomp$9$$) {
  var $services$jscomp$5$$ = $holder$jscomp$9$$.__AMP_SERVICES;
  $services$jscomp$5$$ || ($services$jscomp$5$$ = $holder$jscomp$9$$.__AMP_SERVICES = {});
  return $services$jscomp$5$$;
}
function $isServiceRegistered$$module$src$service$$($holder$jscomp$12_service$jscomp$5$$, $id$jscomp$30$$) {
  $holder$jscomp$12_service$jscomp$5$$ = $holder$jscomp$12_service$jscomp$5$$.__AMP_SERVICES && $holder$jscomp$12_service$jscomp$5$$.__AMP_SERVICES[$id$jscomp$30$$];
  return !(!$holder$jscomp$12_service$jscomp$5$$ || !$holder$jscomp$12_service$jscomp$5$$.ctor && !$holder$jscomp$12_service$jscomp$5$$.obj);
}
;/*
 https://mths.be/cssescape v1.5.1 by @mathias | MIT license */
var $scopeSelectorSupported$$module$src$css$$;
function $testScopeSelector$$module$src$css$$($el$jscomp$1$$) {
  try {
    var $doc$jscomp$1$$ = $el$jscomp$1$$.ownerDocument, $testElement$$ = $doc$jscomp$1$$.createElement("div"), $testChild$$ = $doc$jscomp$1$$.createElement("div");
    $testElement$$.appendChild($testChild$$);
    return $testElement$$.querySelector(":scope div") === $testChild$$;
  } catch ($e$jscomp$15$$) {
    return !1;
  }
}
;function $removeElement$$module$src$dom$$($element$jscomp$15$$) {
  $element$jscomp$15$$.parentElement && $element$jscomp$15$$.parentElement.removeChild($element$jscomp$15$$);
}
function $insertAfterOrAtStart$$module$src$dom$$($root$jscomp$4$$, $element$jscomp$16$$, $after$$) {
  ($after$$ = void 0 === $after$$ ? null : $after$$) ? $root$jscomp$4$$.insertBefore($element$jscomp$16$$, $after$$.nextSibling) : $root$jscomp$4$$.insertBefore($element$jscomp$16$$, $root$jscomp$4$$.firstChild);
}
function $closest$$module$src$dom$$($el$jscomp$2_element$jscomp$20$$, $callback$jscomp$53$$) {
  for (; $el$jscomp$2_element$jscomp$20$$ && void 0 !== $el$jscomp$2_element$jscomp$20$$; $el$jscomp$2_element$jscomp$20$$ = $el$jscomp$2_element$jscomp$20$$.parentElement) {
    if ($callback$jscomp$53$$($el$jscomp$2_element$jscomp$20$$)) {
      return $el$jscomp$2_element$jscomp$20$$;
    }
  }
  return null;
}
function $closestAncestorElementBySelector$$module$src$dom$$($element$jscomp$21$$) {
  return $element$jscomp$21$$.closest ? $element$jscomp$21$$.closest("amp-story") : $closest$$module$src$dom$$($element$jscomp$21$$, function($element$jscomp$21$$) {
    var $el$jscomp$3$$ = $element$jscomp$21$$.matches || $element$jscomp$21$$.webkitMatchesSelector || $element$jscomp$21$$.mozMatchesSelector || $element$jscomp$21$$.msMatchesSelector || $element$jscomp$21$$.oMatchesSelector;
    return $el$jscomp$3$$ ? $el$jscomp$3$$.call($element$jscomp$21$$, "amp-story") : !1;
  });
}
function $childElement$$module$src$dom$$($child$jscomp$2_parent$jscomp$7$$, $callback$jscomp$55$$) {
  for ($child$jscomp$2_parent$jscomp$7$$ = $child$jscomp$2_parent$jscomp$7$$.firstElementChild; $child$jscomp$2_parent$jscomp$7$$; $child$jscomp$2_parent$jscomp$7$$ = $child$jscomp$2_parent$jscomp$7$$.nextElementSibling) {
    if ($callback$jscomp$55$$($child$jscomp$2_parent$jscomp$7$$)) {
      return $child$jscomp$2_parent$jscomp$7$$;
    }
  }
  return null;
}
function $childElementsByTag$$module$src$dom$$($parent$jscomp$15$$, $JSCompiler_selector$jscomp$inline_76_tagName$jscomp$7$$) {
  /^[\w-]+$/.test($JSCompiler_selector$jscomp$inline_76_tagName$jscomp$7$$);
  $JSCompiler_selector$jscomp$inline_76_tagName$jscomp$7$$ = "> " + $JSCompiler_selector$jscomp$inline_76_tagName$jscomp$7$$;
  return (void 0 !== $scopeSelectorSupported$$module$src$css$$ ? $scopeSelectorSupported$$module$src$css$$ : $scopeSelectorSupported$$module$src$css$$ = $testScopeSelector$$module$src$css$$($parent$jscomp$15$$)) ? $parent$jscomp$15$$.querySelectorAll($JSCompiler_selector$jscomp$inline_76_tagName$jscomp$7$$.replace(/^|,/g, "$&:scope ")) : $scopedQuerySelectionFallback$$module$src$dom$$($parent$jscomp$15$$, $JSCompiler_selector$jscomp$inline_76_tagName$jscomp$7$$);
}
function $scopedQuerySelectionFallback$$module$src$dom$$($root$jscomp$6$$, $selector$jscomp$4$$) {
  $root$jscomp$6$$.classList.add("i-amphtml-scoped");
  var $scopedSelector$$ = $selector$jscomp$4$$.replace(/^|,/g, "$&.i-amphtml-scoped "), $elements$$ = $root$jscomp$6$$.querySelectorAll($scopedSelector$$);
  $root$jscomp$6$$.classList.remove("i-amphtml-scoped");
  return $elements$$;
}
;function $Services$$module$src$services$platformFor$$($window$jscomp$7$$) {
  return $getService$$module$src$service$$($window$jscomp$7$$, "platform");
}
;var $EMPTY_METADATA$$module$src$mediasession_helper$$ = {title:"", artist:"", album:"", artwork:[{src:""}]};
function $parseSchemaImage$$module$src$mediasession_helper$$($doc$jscomp$6$$) {
  var $schema$$ = $doc$jscomp$6$$.querySelector('script[type="application/ld+json"]');
  if ($schema$$) {
    try {
      var $JSCompiler_inline_result$jscomp$33$$ = JSON.parse($schema$$.textContent);
    } catch ($JSCompiler_e$jscomp$inline_80$$) {
      $JSCompiler_inline_result$jscomp$33$$ = null;
    }
    var $schemaJson$$ = $JSCompiler_inline_result$jscomp$33$$;
    if ($schemaJson$$ && $schemaJson$$.image) {
      if ("string" === typeof $schemaJson$$.image) {
        return $schemaJson$$.image;
      }
      if ($schemaJson$$.image["@list"] && "string" === typeof $schemaJson$$.image["@list"][0]) {
        return $schemaJson$$.image["@list"][0];
      }
      if ("string" === typeof $schemaJson$$.image.url) {
        return $schemaJson$$.image.url;
      }
      if ("string" === typeof $schemaJson$$.image[0]) {
        return $schemaJson$$.image[0];
      }
    }
  }
}
function $validateMetadata$$module$src$mediasession_helper$$($element$jscomp$64$$, $metadata$jscomp$1$$) {
  var $urlService$$ = $getExistingServiceForDocInEmbedScope$$module$src$service$$($element$jscomp$64$$, "url");
  if ($metadata$jscomp$1$$ && $metadata$jscomp$1$$.artwork) {
    var $artwork$$ = $metadata$jscomp$1$$.artwork;
    Array.isArray($artwork$$);
    $artwork$$.forEach(function($element$jscomp$64$$) {
      $element$jscomp$64$$ && ($element$jscomp$64$$ = "[object Object]" === $toString_$$module$src$types$$.call($element$jscomp$64$$) ? $element$jscomp$64$$.src : $element$jscomp$64$$, $userAssert$$module$src$log$$($urlService$$.isProtocolValid($element$jscomp$64$$)));
    });
  }
}
;function $userInteractedWith$$module$src$video_interface$$($video$jscomp$1$$) {
  $video$jscomp$1$$.signals().signal("user-interacted");
}
;var $optsSupported$$module$src$event_helper_listen$$;
function $internalListenImplementation$$module$src$event_helper_listen$$($element$jscomp$68$$, $eventType$jscomp$3$$, $listener$jscomp$64$$, $opt_evtListenerOpts$$) {
  var $localElement$$ = $element$jscomp$68$$, $localListener$$ = $listener$jscomp$64$$;
  var $wrapped$$ = function($element$jscomp$68$$) {
    try {
      return $localListener$$($element$jscomp$68$$);
    } catch ($e$jscomp$19$$) {
      throw self.__AMP_REPORT_ERROR($e$jscomp$19$$), $e$jscomp$19$$;
    }
  };
  var $optsSupported$$ = $detectEvtListenerOptsSupport$$module$src$event_helper_listen$$(), $capture$$ = !1;
  $opt_evtListenerOpts$$ && ($capture$$ = $opt_evtListenerOpts$$.capture);
  $localElement$$.addEventListener($eventType$jscomp$3$$, $wrapped$$, $optsSupported$$ ? $opt_evtListenerOpts$$ : $capture$$);
  return function() {
    $localElement$$ && $localElement$$.removeEventListener($eventType$jscomp$3$$, $wrapped$$, $optsSupported$$ ? $opt_evtListenerOpts$$ : $capture$$);
    $wrapped$$ = $localElement$$ = $localListener$$ = null;
  };
}
function $detectEvtListenerOptsSupport$$module$src$event_helper_listen$$() {
  if (void 0 !== $optsSupported$$module$src$event_helper_listen$$) {
    return $optsSupported$$module$src$event_helper_listen$$;
  }
  $optsSupported$$module$src$event_helper_listen$$ = !1;
  try {
    var $options$jscomp$33$$ = {get capture() {
      $optsSupported$$module$src$event_helper_listen$$ = !0;
    }};
    self.addEventListener("test-options", null, $options$jscomp$33$$);
    self.removeEventListener("test-options", null, $options$jscomp$33$$);
  } catch ($err$jscomp$3$$) {
  }
  return $optsSupported$$module$src$event_helper_listen$$;
}
;function $createCustomEvent$$module$src$event_helper$$($e$jscomp$20_win$jscomp$56$$, $type$jscomp$148$$, $detail$jscomp$3$$) {
  var $eventInit$jscomp$1$$ = {detail:$detail$jscomp$3$$};
  Object.assign($eventInit$jscomp$1$$, void 0);
  if ("function" == typeof $e$jscomp$20_win$jscomp$56$$.CustomEvent) {
    return new $e$jscomp$20_win$jscomp$56$$.CustomEvent($type$jscomp$148$$, $eventInit$jscomp$1$$);
  }
  $e$jscomp$20_win$jscomp$56$$ = $e$jscomp$20_win$jscomp$56$$.document.createEvent("CustomEvent");
  $e$jscomp$20_win$jscomp$56$$.initCustomEvent($type$jscomp$148$$, !!$eventInit$jscomp$1$$.bubbles, !!$eventInit$jscomp$1$$.cancelable, $detail$jscomp$3$$);
  return $e$jscomp$20_win$jscomp$56$$;
}
function $listen$$module$src$event_helper$$($element$jscomp$69$$, $eventType$jscomp$4$$, $listener$jscomp$65$$) {
  return $internalListenImplementation$$module$src$event_helper_listen$$($element$jscomp$69$$, $eventType$jscomp$4$$, $listener$jscomp$65$$, void 0);
}
function $listenOnce$$module$src$event_helper$$($element$jscomp$70$$, $eventType$jscomp$5$$, $listener$jscomp$66$$, $opt_evtListenerOpts$jscomp$2$$) {
  var $localListener$jscomp$1$$ = $listener$jscomp$66$$, $unlisten$$ = $internalListenImplementation$$module$src$event_helper_listen$$($element$jscomp$70$$, $eventType$jscomp$5$$, function($element$jscomp$70$$) {
    try {
      $localListener$jscomp$1$$($element$jscomp$70$$);
    } finally {
      $localListener$jscomp$1$$ = null, $unlisten$$();
    }
  }, $opt_evtListenerOpts$jscomp$2$$);
  return $unlisten$$;
}
function $listenOncePromise$$module$src$event_helper$$($element$jscomp$71$$) {
  var $unlisten$jscomp$1$$, $eventPromise$$ = new Promise(function($eventPromise$$) {
    $unlisten$jscomp$1$$ = $listenOnce$$module$src$event_helper$$($element$jscomp$71$$, "load", $eventPromise$$, void 0);
  });
  $eventPromise$$.then($unlisten$jscomp$1$$, $unlisten$jscomp$1$$);
  return $eventPromise$$;
}
;var $BITRATE_BY_EFFECTIVE_TYPE$$module$extensions$amp_video$0_1$flexible_bitrate$$ = {"slow-2g":50, "2g":50, "3g":1000, "4g":2500, "5g":5000}, $instance$$module$extensions$amp_video$0_1$flexible_bitrate$$;
function $BitrateManager$$module$extensions$amp_video$0_1$flexible_bitrate$$($win$jscomp$58$$) {
  this.win = $win$jscomp$58$$;
  this.$effectiveConnectionType_$ = "";
  this.$acceptableBitrate_$ = $JSCompiler_StaticMethods_getAcceptableBitrate_$$(this);
}
$BitrateManager$$module$extensions$amp_video$0_1$flexible_bitrate$$.prototype.manage = function($video$jscomp$2$$) {
  var $$jscomp$this$jscomp$2$$ = this;
  $onNontrivialWait$$module$extensions$amp_video$0_1$flexible_bitrate$$($video$jscomp$2$$, function() {
    var $current$$ = $currentSource$$module$extensions$amp_video$0_1$flexible_bitrate$$($video$jscomp$2$$);
    $$jscomp$this$jscomp$2$$.$acceptableBitrate_$ = $current$$.$bitrate_$ - 1;
    $JSCompiler_StaticMethods_switchToLowerBitrate_$$($$jscomp$this$jscomp$2$$, $video$jscomp$2$$, $current$$.$bitrate_$);
  });
  $video$jscomp$2$$.changedSources = function() {
    $JSCompiler_StaticMethods_sortSources_$$($$jscomp$this$jscomp$2$$, $video$jscomp$2$$);
  };
};
function $JSCompiler_StaticMethods_getCurrentEffectiveConnectionType_$$($JSCompiler_StaticMethods_getCurrentEffectiveConnectionType_$self$$) {
  var $connection$$ = $JSCompiler_StaticMethods_getCurrentEffectiveConnectionType_$self$$.win.navigator.connection;
  return $connection$$ && $connection$$.effectiveType ? $connection$$.effectiveType : "4g";
}
function $JSCompiler_StaticMethods_getAcceptableBitrate_$$($JSCompiler_StaticMethods_getAcceptableBitrate_$self$$) {
  $JSCompiler_StaticMethods_getAcceptableBitrate_$self$$.$effectiveConnectionType_$ != $JSCompiler_StaticMethods_getCurrentEffectiveConnectionType_$$($JSCompiler_StaticMethods_getAcceptableBitrate_$self$$) && ($JSCompiler_StaticMethods_getAcceptableBitrate_$self$$.$effectiveConnectionType_$ = $JSCompiler_StaticMethods_getCurrentEffectiveConnectionType_$$($JSCompiler_StaticMethods_getAcceptableBitrate_$self$$), $JSCompiler_StaticMethods_getAcceptableBitrate_$self$$.$acceptableBitrate_$ = $BITRATE_BY_EFFECTIVE_TYPE$$module$extensions$amp_video$0_1$flexible_bitrate$$[$JSCompiler_StaticMethods_getAcceptableBitrate_$self$$.$effectiveConnectionType_$] || 
  $BITRATE_BY_EFFECTIVE_TYPE$$module$extensions$amp_video$0_1$flexible_bitrate$$["4g"]);
  return $JSCompiler_StaticMethods_getAcceptableBitrate_$self$$.$acceptableBitrate_$;
}
function $JSCompiler_StaticMethods_sortSources_$$($JSCompiler_StaticMethods_sortSources_$self$$, $video$jscomp$3$$) {
  var $sources$$ = $toArray$$module$src$types$$($childElementsByTag$$module$src$dom$$($video$jscomp$3$$, "source"));
  $sources$$.forEach(function($JSCompiler_StaticMethods_sortSources_$self$$) {
    if (!$JSCompiler_StaticMethods_sortSources_$self$$.$bitrate_$) {
      var $video$jscomp$3$$ = $JSCompiler_StaticMethods_sortSources_$self$$.getAttribute("data-bitrate");
      $JSCompiler_StaticMethods_sortSources_$self$$.$bitrate_$ = $video$jscomp$3$$ ? parseInt($video$jscomp$3$$, 10) : Number.POSITIVE_INFINITY;
    }
  });
  $sources$$.sort(function($video$jscomp$3$$, $sources$$) {
    return $JSCompiler_StaticMethods_getBitrateForComparison_$$($JSCompiler_StaticMethods_sortSources_$self$$, $sources$$) - $JSCompiler_StaticMethods_getBitrateForComparison_$$($JSCompiler_StaticMethods_sortSources_$self$$, $video$jscomp$3$$);
  });
  $sources$$.forEach(function($JSCompiler_StaticMethods_sortSources_$self$$) {
    $video$jscomp$3$$.appendChild($JSCompiler_StaticMethods_sortSources_$self$$);
  });
}
function $JSCompiler_StaticMethods_getBitrateForComparison_$$($JSCompiler_StaticMethods_getBitrateForComparison_$self$$, $rate$jscomp$1_source$jscomp$16$$) {
  $rate$jscomp$1_source$jscomp$16$$ = $rate$jscomp$1_source$jscomp$16$$.$bitrate_$;
  $rate$jscomp$1_source$jscomp$16$$ > $JSCompiler_StaticMethods_getAcceptableBitrate_$$($JSCompiler_StaticMethods_getBitrateForComparison_$self$$) && ($rate$jscomp$1_source$jscomp$16$$ *= -1);
  return $rate$jscomp$1_source$jscomp$16$$;
}
function $JSCompiler_StaticMethods_hasLowerBitrate_$$($video$jscomp$4$$, $bitrate$jscomp$1$$) {
  return !!$sources$$module$extensions$amp_video$0_1$flexible_bitrate$$($video$jscomp$4$$, function($video$jscomp$4$$) {
    return $video$jscomp$4$$.$bitrate_$ < $bitrate$jscomp$1$$;
  });
}
function $JSCompiler_StaticMethods_switchToLowerBitrate_$$($JSCompiler_StaticMethods_switchToLowerBitrate_$self$$, $video$jscomp$5$$, $currentBitrate$$) {
  if ($JSCompiler_StaticMethods_hasLowerBitrate_$$($video$jscomp$5$$, $currentBitrate$$)) {
    var $currentTime$$ = $video$jscomp$5$$.currentTime;
    $video$jscomp$5$$.pause();
    $JSCompiler_StaticMethods_sortSources_$$($JSCompiler_StaticMethods_switchToLowerBitrate_$self$$, $video$jscomp$5$$);
    $video$jscomp$5$$.load();
    $listenOnce$$module$src$event_helper$$($video$jscomp$5$$, "loadedmetadata", function() {
      $video$jscomp$5$$.currentTime = $currentTime$$;
      $video$jscomp$5$$.play();
      $dev$$module$src$log$$().fine("amp-video", "Playing at lower bitrate %s", $video$jscomp$5$$.currentSrc);
    });
  } else {
    $dev$$module$src$log$$().fine("amp-video", "No lower bitrate available");
  }
}
function $onNontrivialWait$$module$extensions$amp_video$0_1$flexible_bitrate$$($video$jscomp$6$$, $callback$jscomp$59$$) {
  $listen$$module$src$event_helper$$($video$jscomp$6$$, "waiting", function() {
    var $timer$$ = null, $unlisten$jscomp$2$$ = $listenOnce$$module$src$event_helper$$($video$jscomp$6$$, "playing", function() {
      clearTimeout($timer$$);
    });
    $timer$$ = setTimeout(function() {
      $unlisten$jscomp$2$$();
      $callback$jscomp$59$$();
    }, 100);
  });
}
function $sources$$module$extensions$amp_video$0_1$flexible_bitrate$$($video$jscomp$7$$, $fn$jscomp$4$$) {
  return $childElement$$module$src$dom$$($video$jscomp$7$$, function($video$jscomp$7$$) {
    return "SOURCE" != $video$jscomp$7$$.tagName ? !1 : $fn$jscomp$4$$($video$jscomp$7$$);
  });
}
function $currentSource$$module$extensions$amp_video$0_1$flexible_bitrate$$($video$jscomp$8$$) {
  return $sources$$module$extensions$amp_video$0_1$flexible_bitrate$$($video$jscomp$8$$, function($source$jscomp$19$$) {
    return $source$jscomp$19$$.src == $video$jscomp$8$$.currentSrc;
  });
}
;var $htmlContainer$$module$src$static_template$$;
function $htmlFor$$module$src$static_template$$($doc$jscomp$9_nodeOrDoc$jscomp$4$$) {
  $doc$jscomp$9_nodeOrDoc$jscomp$4$$ = $doc$jscomp$9_nodeOrDoc$jscomp$4$$.ownerDocument || $doc$jscomp$9_nodeOrDoc$jscomp$4$$;
  $htmlContainer$$module$src$static_template$$ && $htmlContainer$$module$src$static_template$$.ownerDocument === $doc$jscomp$9_nodeOrDoc$jscomp$4$$ || ($htmlContainer$$module$src$static_template$$ = $doc$jscomp$9_nodeOrDoc$jscomp$4$$.createElement("div"));
  return $html$$module$src$static_template$$;
}
function $html$$module$src$static_template$$($JSCompiler_el$jscomp$inline_84_strings$jscomp$1$$) {
  var $JSCompiler_container$jscomp$inline_83$$ = $htmlContainer$$module$src$static_template$$;
  $JSCompiler_container$jscomp$inline_83$$.innerHTML = $JSCompiler_el$jscomp$inline_84_strings$jscomp$1$$[0];
  $JSCompiler_el$jscomp$inline_84_strings$jscomp$1$$ = $JSCompiler_container$jscomp$inline_83$$.firstElementChild;
  $JSCompiler_container$jscomp$inline_83$$.removeChild($JSCompiler_el$jscomp$inline_84_strings$jscomp$1$$);
  return $JSCompiler_el$jscomp$inline_84_strings$jscomp$1$$;
}
;function $Observable$$module$src$observable$$() {
  this.$handlers_$ = null;
}
$JSCompiler_prototypeAlias$$ = $Observable$$module$src$observable$$.prototype;
$JSCompiler_prototypeAlias$$.add = function($handler$jscomp$3$$) {
  var $$jscomp$this$jscomp$4$$ = this;
  this.$handlers_$ || (this.$handlers_$ = []);
  this.$handlers_$.push($handler$jscomp$3$$);
  return function() {
    $$jscomp$this$jscomp$4$$.remove($handler$jscomp$3$$);
  };
};
$JSCompiler_prototypeAlias$$.remove = function($handler$jscomp$4_index$jscomp$78$$) {
  this.$handlers_$ && ($handler$jscomp$4_index$jscomp$78$$ = this.$handlers_$.indexOf($handler$jscomp$4_index$jscomp$78$$), -1 < $handler$jscomp$4_index$jscomp$78$$ && this.$handlers_$.splice($handler$jscomp$4_index$jscomp$78$$, 1));
};
$JSCompiler_prototypeAlias$$.removeAll = function() {
  this.$handlers_$ && (this.$handlers_$.length = 0);
};
$JSCompiler_prototypeAlias$$.fire = function($opt_event$$) {
  if (this.$handlers_$) {
    for (var $handlers$$ = this.$handlers_$, $i$jscomp$23$$ = 0; $i$jscomp$23$$ < $handlers$$.length; $i$jscomp$23$$++) {
      (0,$handlers$$[$i$jscomp$23$$])($opt_event$$);
    }
  }
};
$JSCompiler_prototypeAlias$$.getHandlerCount = function() {
  return this.$handlers_$ ? this.$handlers_$.length : 0;
};
function $VideoSessionManager$$module$src$service$video_session_manager$$() {
  this.$isSessionActive_$ = !1;
  this.$endSessionObservable_$ = new $Observable$$module$src$observable$$;
}
$VideoSessionManager$$module$src$service$video_session_manager$$.prototype.onSessionEnd = function($listener$jscomp$67$$) {
  this.$endSessionObservable_$.add($listener$jscomp$67$$);
};
$VideoSessionManager$$module$src$service$video_session_manager$$.prototype.beginSession = function() {
  this.$isSessionActive_$ = !0;
};
$VideoSessionManager$$module$src$service$video_session_manager$$.prototype.endSession = function() {
  this.$isSessionActive_$ && this.$endSessionObservable_$.fire();
  this.$isSessionActive_$ = !1;
};
$VideoSessionManager$$module$src$service$video_session_manager$$.prototype.isSessionActive = function() {
  return this.$isSessionActive_$;
};
var $propertyNameCache$$module$src$style$$, $vendorPrefixes$$module$src$style$$ = "Webkit webkit Moz moz ms O o".split(" ");
function $getVendorJsPropertyName$$module$src$style$$($style$jscomp$1$$, $camelCase$jscomp$1$$, $opt_bypassCache$$) {
  if ($startsWith$$module$src$string$$($camelCase$jscomp$1$$, "--")) {
    return $camelCase$jscomp$1$$;
  }
  $propertyNameCache$$module$src$style$$ || ($propertyNameCache$$module$src$style$$ = $map$$module$src$utils$object$$());
  var $propertyName$jscomp$9$$ = $propertyNameCache$$module$src$style$$[$camelCase$jscomp$1$$];
  if (!$propertyName$jscomp$9$$ || $opt_bypassCache$$) {
    $propertyName$jscomp$9$$ = $camelCase$jscomp$1$$;
    if (void 0 === $style$jscomp$1$$[$camelCase$jscomp$1$$]) {
      var $JSCompiler_inline_result$jscomp$35_JSCompiler_inline_result$jscomp$36$$ = $camelCase$jscomp$1$$.charAt(0).toUpperCase() + $camelCase$jscomp$1$$.slice(1);
      a: {
        for (var $JSCompiler_i$jscomp$inline_90$$ = 0; $JSCompiler_i$jscomp$inline_90$$ < $vendorPrefixes$$module$src$style$$.length; $JSCompiler_i$jscomp$inline_90$$++) {
          var $JSCompiler_propertyName$jscomp$inline_91$$ = $vendorPrefixes$$module$src$style$$[$JSCompiler_i$jscomp$inline_90$$] + $JSCompiler_inline_result$jscomp$35_JSCompiler_inline_result$jscomp$36$$;
          if (void 0 !== $style$jscomp$1$$[$JSCompiler_propertyName$jscomp$inline_91$$]) {
            $JSCompiler_inline_result$jscomp$35_JSCompiler_inline_result$jscomp$36$$ = $JSCompiler_propertyName$jscomp$inline_91$$;
            break a;
          }
        }
        $JSCompiler_inline_result$jscomp$35_JSCompiler_inline_result$jscomp$36$$ = "";
      }
      var $prefixedPropertyName$$ = $JSCompiler_inline_result$jscomp$35_JSCompiler_inline_result$jscomp$36$$;
      void 0 !== $style$jscomp$1$$[$prefixedPropertyName$$] && ($propertyName$jscomp$9$$ = $prefixedPropertyName$$);
    }
    $opt_bypassCache$$ || ($propertyNameCache$$module$src$style$$[$camelCase$jscomp$1$$] = $propertyName$jscomp$9$$);
  }
  return $propertyName$jscomp$9$$;
}
function $setStyle$$module$src$style$$($element$jscomp$74$$, $property$jscomp$7_propertyName$jscomp$10$$, $value$jscomp$100$$) {
  ($property$jscomp$7_propertyName$jscomp$10$$ = $getVendorJsPropertyName$$module$src$style$$($element$jscomp$74$$.style, $property$jscomp$7_propertyName$jscomp$10$$, void 0)) && ($startsWith$$module$src$string$$($property$jscomp$7_propertyName$jscomp$10$$, "--") ? $element$jscomp$74$$.style.setProperty($property$jscomp$7_propertyName$jscomp$10$$, $value$jscomp$100$$) : $element$jscomp$74$$.style[$property$jscomp$7_propertyName$jscomp$10$$] = $value$jscomp$100$$);
}
function $setStyles$$module$src$style$$($element$jscomp$76$$, $styles$jscomp$1$$) {
  for (var $k$jscomp$6$$ in $styles$jscomp$1$$) {
    $setStyle$$module$src$style$$($element$jscomp$76$$, $k$jscomp$6$$, $styles$jscomp$1$$[$k$jscomp$6$$]);
  }
}
;function $isAutoplaySupportedImpl$$module$src$utils$video$$($win$jscomp$60$$, $isLiteViewer$$) {
  if ($isLiteViewer$$) {
    return Promise.resolve(!1);
  }
  var $detectionElement$$ = $win$jscomp$60$$.document.createElement("video");
  $detectionElement$$.setAttribute("muted", "");
  $detectionElement$$.setAttribute("playsinline", "");
  $detectionElement$$.setAttribute("webkit-playsinline", "");
  $detectionElement$$.setAttribute("height", "0");
  $detectionElement$$.setAttribute("width", "0");
  $detectionElement$$.muted = !0;
  $detectionElement$$.playsinline = !0;
  $detectionElement$$.webkitPlaysinline = !0;
  $setStyles$$module$src$style$$($detectionElement$$, {position:"fixed", top:"0", width:"0", height:"0", opacity:"0"});
  (new Promise(function($win$jscomp$60$$) {
    return $win$jscomp$60$$($detectionElement$$.play());
  })).catch(function() {
  });
  return Promise.resolve(!$detectionElement$$.paused);
}
var $isAutoplaySupported$$module$src$utils$video$$ = null;
function $getExistingStyleElement$$module$src$style_installer$$($cssRoot$jscomp$2_existing$jscomp$1$$, $styleMap$jscomp$1$$, $key$jscomp$53$$) {
  return $styleMap$jscomp$1$$[$key$jscomp$53$$] ? $styleMap$jscomp$1$$[$key$jscomp$53$$] : ($cssRoot$jscomp$2_existing$jscomp$1$$ = $cssRoot$jscomp$2_existing$jscomp$1$$.querySelector("style[" + $key$jscomp$53$$ + "]")) ? $styleMap$jscomp$1$$[$key$jscomp$53$$] = $cssRoot$jscomp$2_existing$jscomp$1$$ : null;
}
;var $cssText$$module$build$video_autoplay_css$$ = "i-amphtml-video-mask{display:block;z-index:1}.amp-video-eq{display:none}.i-amphtml-video-interface:not(amp-video) .amp-video-eq,amp-story .amp-video-eq,amp-video[controls] .amp-video-eq{display:-ms-flexbox;display:flex}[noaudio] .amp-video-eq{display:none!important}.amp-video-eq{pointer-events:none!important;-ms-flex-align:end;align-items:flex-end;bottom:7px;height:12px;opacity:0.8;overflow:hidden;position:absolute;right:7px;width:20px;z-index:1}.amp-video-eq .amp-video-eq-col{-ms-flex:1;flex:1;height:100%;margin-right:1px;position:relative}.amp-video-eq .amp-video-eq-col div{animation-name:amp-video-eq-animation;animation-timing-function:linear;animation-iteration-count:infinite;animation-direction:alternate;background-color:#fafafa;height:100%;position:absolute;width:100%;will-change:transform;animation-play-state:paused}.amp-video-eq[unpausable] .amp-video-eq-col div{animation-name:none}.amp-video-eq[unpausable].amp-video-eq-play .amp-video-eq-col div{animation-name:amp-video-eq-animation}.amp-video-eq.amp-video-eq-play .amp-video-eq-col div{animation-play-state:running}.amp-video-eq-1-1{animation-duration:0.3s;transform:translateY(60%)}.amp-video-eq-1-2{animation-duration:0.45s;transform:translateY(60%)}.amp-video-eq-2-1{animation-duration:0.5s;transform:translateY(30%)}.amp-video-eq-2-2{animation-duration:0.4s;transform:translateY(30%)}.amp-video-eq-3-1{animation-duration:0.3s;transform:translateY(70%)}.amp-video-eq-3-2{animation-duration:0.35s;transform:translateY(70%)}.amp-video-eq-4-1{animation-duration:0.4s;transform:translateY(50%)}.amp-video-eq-4-2{animation-duration:0.25s;transform:translateY(50%)}@keyframes amp-video-eq-animation{0%{transform:translateY(100%)}to{transform:translateY(0)}}\n/*# sourceURL=/css/video-autoplay.css*/";
var $_template$$module$src$service$video$autoplay$$ = ["<i-amphtml-video-mask class=i-amphtml-fill-content role=button></i-amphtml-video-mask>"], $_template2$$module$src$service$video$autoplay$$ = ["<i-amphtml-video-icon class=amp-video-eq><div class=amp-video-eq-col><div class=amp-video-eq-filler></div><div class=amp-video-eq-filler></div></div></i-amphtml-video-icon>"];
function $renderIcon$$module$src$service$video$autoplay$$($win$jscomp$66$$, $elOrDoc$jscomp$1_i$jscomp$27$$) {
  var $icon$$ = $htmlFor$$module$src$static_template$$($elOrDoc$jscomp$1_i$jscomp$27$$)($_template2$$module$src$service$video$autoplay$$), $firstCol$$ = $icon$$.firstElementChild;
  for ($elOrDoc$jscomp$1_i$jscomp$27$$ = 0; 4 > $elOrDoc$jscomp$1_i$jscomp$27$$; $elOrDoc$jscomp$1_i$jscomp$27$$++) {
    for (var $col$$ = $firstCol$$.cloneNode(!0), $fillers$$ = $col$$.children, $j$$ = 0; $j$$ < $fillers$$.length; $j$$++) {
      $fillers$$[$j$$].classList.add("amp-video-eq-" + ($elOrDoc$jscomp$1_i$jscomp$27$$ + 1) + "-" + ($j$$ + 1));
    }
    $icon$$.appendChild($col$$);
  }
  $removeElement$$module$src$dom$$($firstCol$$);
  $Services$$module$src$services$platformFor$$($win$jscomp$66$$).isIos() && $icon$$.setAttribute("unpausable", "");
  return $icon$$;
}
;function $VideoManager$$module$src$service$video_manager_impl$$($ampdoc$jscomp$16$$) {
  var $$jscomp$this$jscomp$5$$ = this;
  this.ampdoc = $ampdoc$jscomp$16$$;
  this.installAutoplayStyles = $once$$module$src$utils$function$$(function() {
    var $ampdoc$jscomp$16$$ = $cssText$$module$build$video_autoplay_css$$, $JSCompiler_cssRoot$jscomp$inline_215$$ = $$jscomp$this$jscomp$5$$.ampdoc.getHeadNode();
    var $JSCompiler_afterElement$jscomp$inline_279_JSCompiler_inline_result$jscomp$263_JSCompiler_transformer$jscomp$inline_270$$ = ($JSCompiler_afterElement$jscomp$inline_279_JSCompiler_inline_result$jscomp$263_JSCompiler_transformer$jscomp$inline_270$$ = $JSCompiler_cssRoot$jscomp$inline_215$$.__AMP_CSS_TR) ? $JSCompiler_afterElement$jscomp$inline_279_JSCompiler_inline_result$jscomp$263_JSCompiler_transformer$jscomp$inline_270$$($ampdoc$jscomp$16$$) : $ampdoc$jscomp$16$$;
    ($ampdoc$jscomp$16$$ = $JSCompiler_cssRoot$jscomp$inline_215$$.__AMP_CSS_SM) || ($ampdoc$jscomp$16$$ = $JSCompiler_cssRoot$jscomp$inline_215$$.__AMP_CSS_SM = $map$$module$src$utils$object$$());
    var $JSCompiler_existing$jscomp$inline_277_JSCompiler_style$jscomp$inline_278$$ = $getExistingStyleElement$$module$src$style_installer$$($JSCompiler_cssRoot$jscomp$inline_215$$, $ampdoc$jscomp$16$$, "amp-extension=amp-video-autoplay");
    $JSCompiler_existing$jscomp$inline_277_JSCompiler_style$jscomp$inline_278$$ ? $JSCompiler_existing$jscomp$inline_277_JSCompiler_style$jscomp$inline_278$$.textContent !== $JSCompiler_afterElement$jscomp$inline_279_JSCompiler_inline_result$jscomp$263_JSCompiler_transformer$jscomp$inline_270$$ && ($JSCompiler_existing$jscomp$inline_277_JSCompiler_style$jscomp$inline_278$$.textContent = $JSCompiler_afterElement$jscomp$inline_279_JSCompiler_inline_result$jscomp$263_JSCompiler_transformer$jscomp$inline_270$$) : 
    ($JSCompiler_existing$jscomp$inline_277_JSCompiler_style$jscomp$inline_278$$ = ($JSCompiler_cssRoot$jscomp$inline_215$$.ownerDocument || $JSCompiler_cssRoot$jscomp$inline_215$$).createElement("style"), $JSCompiler_existing$jscomp$inline_277_JSCompiler_style$jscomp$inline_278$$.textContent = $JSCompiler_afterElement$jscomp$inline_279_JSCompiler_inline_result$jscomp$263_JSCompiler_transformer$jscomp$inline_270$$, $JSCompiler_existing$jscomp$inline_277_JSCompiler_style$jscomp$inline_278$$.setAttribute("amp-extension", 
    "amp-video-autoplay"), $JSCompiler_afterElement$jscomp$inline_279_JSCompiler_inline_result$jscomp$263_JSCompiler_transformer$jscomp$inline_270$$ = $getExistingStyleElement$$module$src$style_installer$$($JSCompiler_cssRoot$jscomp$inline_215$$, $ampdoc$jscomp$16$$, "amp-runtime"), $insertAfterOrAtStart$$module$src$dom$$($JSCompiler_cssRoot$jscomp$inline_215$$, $JSCompiler_existing$jscomp$inline_277_JSCompiler_style$jscomp$inline_278$$, $JSCompiler_afterElement$jscomp$inline_279_JSCompiler_inline_result$jscomp$263_JSCompiler_transformer$jscomp$inline_270$$), 
    $ampdoc$jscomp$16$$["amp-extension=amp-video-autoplay"] = $JSCompiler_existing$jscomp$inline_277_JSCompiler_style$jscomp$inline_278$$);
  });
  this.$viewport_$ = $getServiceForDoc$$module$src$service$$(this.ampdoc, "viewport");
  this.$lastFoundEntry_$ = this.$entries_$ = null;
  this.$scrollListenerInstalled_$ = !1;
  this.$timer_$ = $getService$$module$src$service$$($ampdoc$jscomp$16$$.win, "timer");
  this.$actions_$ = $getExistingServiceForDocInEmbedScope$$module$src$service$$($ampdoc$jscomp$16$$.getHeadNode(), "action");
  this.$boundSecondsPlaying_$ = function() {
    for (var $ampdoc$jscomp$16$$ = 0; $ampdoc$jscomp$16$$ < $$jscomp$this$jscomp$5$$.$entries_$.length; $ampdoc$jscomp$16$$++) {
      var $JSCompiler_entry$jscomp$inline_97$$ = $$jscomp$this$jscomp$5$$.$entries_$[$ampdoc$jscomp$16$$];
      if ("paused" !== $JSCompiler_entry$jscomp$inline_97$$.getPlayingState()) {
        $analyticsEvent$$module$src$service$video_manager_impl$$($JSCompiler_entry$jscomp$inline_97$$, "video-seconds-played");
        var $JSCompiler_currentTime$jscomp$inline_220_JSCompiler_event$jscomp$inline_222$$ = $JSCompiler_entry$jscomp$inline_97$$.video.getCurrentTime(), $JSCompiler_duration$jscomp$inline_221$$ = $JSCompiler_entry$jscomp$inline_97$$.video.getDuration();
        $isFiniteNumber$$module$src$types$$($JSCompiler_currentTime$jscomp$inline_220_JSCompiler_event$jscomp$inline_222$$) && $isFiniteNumber$$module$src$types$$($JSCompiler_duration$jscomp$inline_221$$) && 0 < $JSCompiler_duration$jscomp$inline_221$$ && ($JSCompiler_currentTime$jscomp$inline_220_JSCompiler_event$jscomp$inline_222$$ = $createCustomEvent$$module$src$event_helper$$($$jscomp$this$jscomp$5$$.ampdoc.win, "video-manager.timeUpdate", $dict$$module$src$utils$object$$({time:$JSCompiler_currentTime$jscomp$inline_220_JSCompiler_event$jscomp$inline_222$$, 
        percent:$JSCompiler_currentTime$jscomp$inline_220_JSCompiler_event$jscomp$inline_222$$ / $JSCompiler_duration$jscomp$inline_221$$})), $$jscomp$this$jscomp$5$$.$actions_$.trigger($JSCompiler_entry$jscomp$inline_97$$.video.element, "timeUpdate", $JSCompiler_currentTime$jscomp$inline_220_JSCompiler_event$jscomp$inline_222$$, 1));
      }
    }
    $$jscomp$this$jscomp$5$$.$timer_$.delay($$jscomp$this$jscomp$5$$.$boundSecondsPlaying_$, 1000);
  };
  this.$getAutoFullscreenManager_$ = $once$$module$src$utils$function$$(function() {
    return new $AutoFullscreenManager$$module$src$service$video_manager_impl$$($$jscomp$this$jscomp$5$$.ampdoc, $$jscomp$this$jscomp$5$$);
  });
  this.$timer_$.delay(this.$boundSecondsPlaying_$, 1000);
}
$JSCompiler_prototypeAlias$$ = $VideoManager$$module$src$service$video_manager_impl$$.prototype;
$JSCompiler_prototypeAlias$$.dispose = function() {
  this.$getAutoFullscreenManager_$().dispose();
  if (this.$entries_$) {
    for (var $i$jscomp$28$$ = 0; $i$jscomp$28$$ < this.$entries_$.length; $i$jscomp$28$$++) {
      this.$entries_$[$i$jscomp$28$$].dispose();
    }
  }
};
$JSCompiler_prototypeAlias$$.register = function($video$jscomp$9$$) {
  $JSCompiler_StaticMethods_registerCommonActions_$$($video$jscomp$9$$);
  if ($video$jscomp$9$$.supportsPlatform()) {
    this.$entries_$ = this.$entries_$ || [];
    var $element$jscomp$80_entry$jscomp$3$$ = new $VideoEntry$$module$src$service$video_manager_impl$$(this, $video$jscomp$9$$);
    $JSCompiler_StaticMethods_maybeInstallVisibilityObserver_$$(this, $element$jscomp$80_entry$jscomp$3$$);
    this.$entries_$.push($element$jscomp$80_entry$jscomp$3$$);
    $element$jscomp$80_entry$jscomp$3$$ = $element$jscomp$80_entry$jscomp$3$$.video.element;
    $element$jscomp$80_entry$jscomp$3$$.dispatchCustomEvent("registered");
    $element$jscomp$80_entry$jscomp$3$$.classList.add("i-amphtml-media-component");
    $video$jscomp$9$$.signals().signal("registered");
    $element$jscomp$80_entry$jscomp$3$$.classList.add("i-amphtml-video-interface");
  }
};
function $JSCompiler_StaticMethods_registerCommonActions_$$($video$jscomp$10$$) {
  function $fullscreenEnter$$() {
    return $video$jscomp$10$$.fullscreenEnter();
  }
  function $registerAction$$($fullscreenEnter$$, $registerAction$$) {
    $video$jscomp$10$$.registerAction($fullscreenEnter$$, function() {
      $userInteractedWith$$module$src$video_interface$$($video$jscomp$10$$);
      $registerAction$$();
    }, 1);
  }
  $registerAction$$("play", function() {
    return $video$jscomp$10$$.play(!1);
  });
  $registerAction$$("pause", function() {
    return $video$jscomp$10$$.pause();
  });
  $registerAction$$("mute", function() {
    return $video$jscomp$10$$.mute();
  });
  $registerAction$$("unmute", function() {
    return $video$jscomp$10$$.unmute();
  });
  $registerAction$$("fullscreenenter", $fullscreenEnter$$);
  $registerAction$$("fullscreen", $fullscreenEnter$$);
}
function $JSCompiler_StaticMethods_maybeInstallVisibilityObserver_$$($JSCompiler_StaticMethods_maybeInstallVisibilityObserver_$self$$, $entry$jscomp$4$$) {
  var $element$jscomp$81$$ = $entry$jscomp$4$$.video.element;
  $listen$$module$src$event_helper$$($element$jscomp$81$$, "amp:video:visibility", function($JSCompiler_StaticMethods_maybeInstallVisibilityObserver_$self$$) {
    ($JSCompiler_StaticMethods_maybeInstallVisibilityObserver_$self$$ = $JSCompiler_StaticMethods_maybeInstallVisibilityObserver_$self$$.data) && 1 == $JSCompiler_StaticMethods_maybeInstallVisibilityObserver_$self$$.visible ? $entry$jscomp$4$$.updateVisibility(!0) : $entry$jscomp$4$$.updateVisibility();
  });
  $listen$$module$src$event_helper$$($element$jscomp$81$$, "reloaded", function() {
    $entry$jscomp$4$$.videoLoaded();
  });
  if (!$JSCompiler_StaticMethods_maybeInstallVisibilityObserver_$self$$.$scrollListenerInstalled_$) {
    var $scrollListener$$ = function() {
      for (var $entry$jscomp$4$$ = 0; $entry$jscomp$4$$ < $JSCompiler_StaticMethods_maybeInstallVisibilityObserver_$self$$.$entries_$.length; $entry$jscomp$4$$++) {
        $JSCompiler_StaticMethods_maybeInstallVisibilityObserver_$self$$.$entries_$[$entry$jscomp$4$$].updateVisibility();
      }
    };
    $JSCompiler_StaticMethods_maybeInstallVisibilityObserver_$self$$.$viewport_$.onScroll($scrollListener$$);
    $JSCompiler_StaticMethods_maybeInstallVisibilityObserver_$self$$.$viewport_$.onChanged($scrollListener$$);
    $JSCompiler_StaticMethods_maybeInstallVisibilityObserver_$self$$.$scrollListenerInstalled_$ = !0;
  }
}
function $JSCompiler_StaticMethods_getEntry_$$($JSCompiler_StaticMethods_getEntry_$self$$, $videoOrElement$$) {
  if ($isEntryFor$$module$src$service$video_manager_impl$$($JSCompiler_StaticMethods_getEntry_$self$$.$lastFoundEntry_$, $videoOrElement$$)) {
    return $JSCompiler_StaticMethods_getEntry_$self$$.$lastFoundEntry_$;
  }
  for (var $i$jscomp$31$$ = 0; $i$jscomp$31$$ < $JSCompiler_StaticMethods_getEntry_$self$$.$entries_$.length; $i$jscomp$31$$++) {
    var $entry$jscomp$5$$ = $JSCompiler_StaticMethods_getEntry_$self$$.$entries_$[$i$jscomp$31$$];
    if ($isEntryFor$$module$src$service$video_manager_impl$$($entry$jscomp$5$$, $videoOrElement$$)) {
      return $JSCompiler_StaticMethods_getEntry_$self$$.$lastFoundEntry_$ = $entry$jscomp$5$$;
    }
  }
  return null;
}
$JSCompiler_prototypeAlias$$.registerForAutoFullscreen = function($entry$jscomp$6$$) {
  this.$getAutoFullscreenManager_$().register($entry$jscomp$6$$);
};
$JSCompiler_prototypeAlias$$.$getAutoFullscreenManagerForTesting_$ = function() {
  return this.$getAutoFullscreenManager_$();
};
$JSCompiler_prototypeAlias$$.getVideoStateProperty = function($entry$jscomp$7_id$jscomp$38$$, $property$jscomp$10$$) {
  var $root$jscomp$10$$ = this.ampdoc.getRootNode(), $videoElement$$ = $user$$module$src$log$$().assertElement($root$jscomp$10$$.getElementById($entry$jscomp$7_id$jscomp$38$$), 'Could not find an element with id="' + $entry$jscomp$7_id$jscomp$38$$ + '" for VIDEO_STATE');
  $entry$jscomp$7_id$jscomp$38$$ = $JSCompiler_StaticMethods_getEntry_$$(this, $videoElement$$);
  return ($entry$jscomp$7_id$jscomp$38$$ ? $entry$jscomp$7_id$jscomp$38$$.getAnalyticsDetails() : $resolvedPromise$$module$src$resolved_promise$$()).then(function($entry$jscomp$7_id$jscomp$38$$) {
    return $entry$jscomp$7_id$jscomp$38$$ ? $entry$jscomp$7_id$jscomp$38$$[$property$jscomp$10$$] : "";
  });
};
$JSCompiler_prototypeAlias$$.getPlayingState = function($videoOrElement$jscomp$1$$) {
  return $JSCompiler_StaticMethods_getEntry_$$(this, $videoOrElement$jscomp$1$$).getPlayingState();
};
$JSCompiler_prototypeAlias$$.isMuted = function($videoOrElement$jscomp$2$$) {
  return $JSCompiler_StaticMethods_getEntry_$$(this, $videoOrElement$jscomp$2$$).isMuted();
};
$JSCompiler_prototypeAlias$$.userInteracted = function($videoOrElement$jscomp$3$$) {
  return $JSCompiler_StaticMethods_getEntry_$$(this, $videoOrElement$jscomp$3$$).userInteracted();
};
$JSCompiler_prototypeAlias$$.isRollingAd = function($videoOrElement$jscomp$4$$) {
  return $JSCompiler_StaticMethods_getEntry_$$(this, $videoOrElement$jscomp$4$$).isRollingAd();
};
$JSCompiler_prototypeAlias$$.pauseOtherVideos = function($entryBeingPlayed$$) {
  this.$entries_$.forEach(function($entry$jscomp$8$$) {
    $entry$jscomp$8$$.isPlaybackManaged() && $entry$jscomp$8$$ !== $entryBeingPlayed$$ && "playing_manual" == $entry$jscomp$8$$.getPlayingState() && $entry$jscomp$8$$.video.pause();
  });
};
function $isEntryFor$$module$src$service$video_manager_impl$$($entry$jscomp$9$$, $videoOrElement$jscomp$5$$) {
  return !!$entry$jscomp$9$$ && ($entry$jscomp$9$$.video === $videoOrElement$jscomp$5$$ || $entry$jscomp$9$$.video.element === $videoOrElement$jscomp$5$$);
}
function $VideoEntry$$module$src$service$video_manager_impl$$($manager$$, $video$jscomp$11$$) {
  var $$jscomp$this$jscomp$7$$ = this;
  this.$manager_$ = $manager$$;
  this.$ampdoc_$ = $manager$$.ampdoc;
  this.video = $video$jscomp$11$$;
  this.$managePlayback_$ = !0;
  this.$isVisible_$ = this.$isRollingAd_$ = this.$isPlaying_$ = this.$loaded_$ = !1;
  this.$actionSessionManager_$ = new $VideoSessionManager$$module$src$service$video_session_manager$$;
  this.$actionSessionManager_$.onSessionEnd(function() {
    return $analyticsEvent$$module$src$service$video_manager_impl$$($$jscomp$this$jscomp$7$$, "video-session");
  });
  this.$visibilitySessionManager_$ = new $VideoSessionManager$$module$src$service$video_session_manager$$;
  this.$visibilitySessionManager_$.onSessionEnd(function() {
    return $analyticsEvent$$module$src$service$video_manager_impl$$($$jscomp$this$jscomp$7$$, "video-session-visible");
  });
  this.$supportsAutoplay_$ = function() {
    var $manager$$ = $$jscomp$this$jscomp$7$$.$ampdoc_$.win, $video$jscomp$11$$ = $getMode$$module$src$mode$$($manager$$).lite;
    $isAutoplaySupported$$module$src$utils$video$$ || ($isAutoplaySupported$$module$src$utils$video$$ = $once$$module$src$utils$function$$($isAutoplaySupportedImpl$$module$src$utils$video$$));
    return $isAutoplaySupported$$module$src$utils$video$$($manager$$, $video$jscomp$11$$);
  };
  this.$getAnalyticsPercentageTracker_$ = $once$$module$src$utils$function$$(function() {
    return new $AnalyticsPercentageTracker$$module$src$service$video_manager_impl$$($$jscomp$this$jscomp$7$$.$ampdoc_$.win, $$jscomp$this$jscomp$7$$);
  });
  this.$pauseCalledByAutoplay_$ = this.$playCalledByAutoplay_$ = !1;
  this.$internalElement_$ = null;
  this.$hasSeenPlayEvent_$ = this.$muted_$ = !1;
  (this.hasAutoplay = $video$jscomp$11$$.element.hasAttribute("autoplay")) && this.$manager_$.installAutoplayStyles();
  this.$metadata_$ = $EMPTY_METADATA$$module$src$mediasession_helper$$;
  this.$boundMediasessionPlay_$ = function() {
    $$jscomp$this$jscomp$7$$.video.play(!1);
  };
  this.$boundMediasessionPause_$ = function() {
    $$jscomp$this$jscomp$7$$.video.pause();
  };
  $listenOncePromise$$module$src$event_helper$$($video$jscomp$11$$.element).then(function() {
    return $$jscomp$this$jscomp$7$$.videoLoaded();
  });
  $listen$$module$src$event_helper$$($video$jscomp$11$$.element, "pause", function() {
    $analyticsEvent$$module$src$service$video_manager_impl$$($$jscomp$this$jscomp$7$$, "video-pause");
    $$jscomp$this$jscomp$7$$.$isPlaying_$ = !1;
    $$jscomp$this$jscomp$7$$.$pauseCalledByAutoplay_$ ? $$jscomp$this$jscomp$7$$.$pauseCalledByAutoplay_$ = !1 : $$jscomp$this$jscomp$7$$.$actionSessionManager_$.endSession();
  });
  $listen$$module$src$event_helper$$($video$jscomp$11$$.element, "play", function() {
    $$jscomp$this$jscomp$7$$.$hasSeenPlayEvent_$ = !0;
    $analyticsEvent$$module$src$service$video_manager_impl$$($$jscomp$this$jscomp$7$$, "video-play");
  });
  $listen$$module$src$event_helper$$($video$jscomp$11$$.element, "playing", function() {
    $$jscomp$this$jscomp$7$$.$isPlaying_$ = !0;
    "playing_manual" == $$jscomp$this$jscomp$7$$.getPlayingState() && ($$jscomp$this$jscomp$7$$.$firstPlayEventOrNoop_$(), $$jscomp$this$jscomp$7$$.$manager_$.pauseOtherVideos($$jscomp$this$jscomp$7$$));
    var $manager$$ = $$jscomp$this$jscomp$7$$.video, $video$jscomp$11$$ = $manager$$.element;
    if (!$manager$$.preimplementsMediaSessionAPI() && !$video$jscomp$11$$.classList.contains("i-amphtml-disable-mediasession")) {
      $manager$$ = $$jscomp$this$jscomp$7$$.$ampdoc_$.win;
      var $JSCompiler_metadata$jscomp$inline_227$$ = $$jscomp$this$jscomp$7$$.$metadata_$, $JSCompiler_playHandler$jscomp$inline_228$$ = $$jscomp$this$jscomp$7$$.$boundMediasessionPlay_$, $JSCompiler_pauseHandler$jscomp$inline_229$$ = $$jscomp$this$jscomp$7$$.$boundMediasessionPause_$, $JSCompiler_navigator$jscomp$inline_230$$ = $manager$$.navigator;
      "mediaSession" in $JSCompiler_navigator$jscomp$inline_230$$ && $manager$$.MediaMetadata && ($JSCompiler_navigator$jscomp$inline_230$$.mediaSession.metadata = new $manager$$.MediaMetadata($EMPTY_METADATA$$module$src$mediasession_helper$$), $validateMetadata$$module$src$mediasession_helper$$($video$jscomp$11$$, $JSCompiler_metadata$jscomp$inline_227$$), $JSCompiler_navigator$jscomp$inline_230$$.mediaSession.metadata = new $manager$$.MediaMetadata($JSCompiler_metadata$jscomp$inline_227$$), $JSCompiler_navigator$jscomp$inline_230$$.mediaSession.setActionHandler("play", 
      $JSCompiler_playHandler$jscomp$inline_228$$), $JSCompiler_navigator$jscomp$inline_230$$.mediaSession.setActionHandler("pause", $JSCompiler_pauseHandler$jscomp$inline_229$$));
    }
    $$jscomp$this$jscomp$7$$.$actionSessionManager_$.beginSession();
    $$jscomp$this$jscomp$7$$.$isVisible_$ && $$jscomp$this$jscomp$7$$.$visibilitySessionManager_$.beginSession();
    $$jscomp$this$jscomp$7$$.$hasSeenPlayEvent_$ || $analyticsEvent$$module$src$service$video_manager_impl$$($$jscomp$this$jscomp$7$$, "video-play");
  });
  $listen$$module$src$event_helper$$($video$jscomp$11$$.element, "muted", function() {
    return $$jscomp$this$jscomp$7$$.$muted_$ = !0;
  });
  $listen$$module$src$event_helper$$($video$jscomp$11$$.element, "unmuted", function() {
    $$jscomp$this$jscomp$7$$.$muted_$ = !1;
    $$jscomp$this$jscomp$7$$.$manager_$.pauseOtherVideos($$jscomp$this$jscomp$7$$);
  });
  $listen$$module$src$event_helper$$($video$jscomp$11$$.element, "amp:video:tick", function($manager$$) {
    $manager$$ = $manager$$.data;
    var $video$jscomp$11$$ = $manager$$.eventType;
    $video$jscomp$11$$ && $JSCompiler_StaticMethods_logCustomAnalytics_$$($$jscomp$this$jscomp$7$$, $video$jscomp$11$$, $manager$$.vars);
  });
  $listen$$module$src$event_helper$$($video$jscomp$11$$.element, "ended", function() {
    $$jscomp$this$jscomp$7$$.$isRollingAd_$ = !1;
    $analyticsEvent$$module$src$service$video_manager_impl$$($$jscomp$this$jscomp$7$$, "video-ended");
  });
  $listen$$module$src$event_helper$$($video$jscomp$11$$.element, "ad_start", function() {
    $$jscomp$this$jscomp$7$$.$isRollingAd_$ = !0;
    $analyticsEvent$$module$src$service$video_manager_impl$$($$jscomp$this$jscomp$7$$, "video-ad-start");
  });
  $listen$$module$src$event_helper$$($video$jscomp$11$$.element, "ad_end", function() {
    $$jscomp$this$jscomp$7$$.$isRollingAd_$ = !1;
    $analyticsEvent$$module$src$service$video_manager_impl$$($$jscomp$this$jscomp$7$$, "video-ad-end");
  });
  $video$jscomp$11$$.signals().whenSignal("registered").then(function() {
    var $manager$$ = $$jscomp$this$jscomp$7$$.video.element;
    ($$jscomp$this$jscomp$7$$.video.preimplementsAutoFullscreen() || !$manager$$.hasAttribute("rotate-to-fullscreen") ? 0 : $userAssert$$module$src$log$$($$jscomp$this$jscomp$7$$.video.isInteractive(), "Only interactive videos are allowed to enter fullscreen on rotate. Set the `controls` attribute on %s to enable.", $manager$$)) && $$jscomp$this$jscomp$7$$.$manager_$.registerForAutoFullscreen($$jscomp$this$jscomp$7$$);
    $$jscomp$this$jscomp$7$$.updateVisibility();
    $$jscomp$this$jscomp$7$$.hasAutoplay && $JSCompiler_StaticMethods_autoplayVideoBuilt_$$($$jscomp$this$jscomp$7$$);
  });
  this.$firstPlayEventOrNoop_$ = $once$$module$src$utils$function$$(function() {
    var $manager$$ = $createCustomEvent$$module$src$event_helper$$($$jscomp$this$jscomp$7$$.$ampdoc_$.win, "firstPlay", $dict$$module$src$utils$object$$({})), $video$jscomp$11$$ = $$jscomp$this$jscomp$7$$.video.element;
    $getExistingServiceForDocInEmbedScope$$module$src$service$$($video$jscomp$11$$, "action").trigger($video$jscomp$11$$, "firstPlay", $manager$$, 1);
  });
  $JSCompiler_StaticMethods_listenForPlaybackDelegation_$$(this);
}
$JSCompiler_prototypeAlias$$ = $VideoEntry$$module$src$service$video_manager_impl$$.prototype;
$JSCompiler_prototypeAlias$$.dispose = function() {
  this.$getAnalyticsPercentageTracker_$().stop();
};
function $JSCompiler_StaticMethods_logCustomAnalytics_$$($JSCompiler_StaticMethods_logCustomAnalytics_$self$$, $eventType$jscomp$8$$, $vars$$) {
  var $$jscomp$compprop0$$ = {}, $prefixedVars$$ = ($$jscomp$compprop0$$["__amp:eventType"] = $eventType$jscomp$8$$, $$jscomp$compprop0$$);
  Object.keys($vars$$).forEach(function($JSCompiler_StaticMethods_logCustomAnalytics_$self$$) {
    $prefixedVars$$["custom_" + $JSCompiler_StaticMethods_logCustomAnalytics_$self$$] = $vars$$[$JSCompiler_StaticMethods_logCustomAnalytics_$self$$];
  });
  $analyticsEvent$$module$src$service$video_manager_impl$$($JSCompiler_StaticMethods_logCustomAnalytics_$self$$, "video-hosted-custom", $prefixedVars$$);
}
function $JSCompiler_StaticMethods_listenForPlaybackDelegation_$$($JSCompiler_StaticMethods_listenForPlaybackDelegation_$self$$) {
  $JSCompiler_StaticMethods_listenForPlaybackDelegation_$self$$.video.signals().whenSignal("playback-delegated").then(function() {
    $JSCompiler_StaticMethods_listenForPlaybackDelegation_$self$$.$managePlayback_$ = !1;
    $JSCompiler_StaticMethods_listenForPlaybackDelegation_$self$$.$isPlaying_$ && $JSCompiler_StaticMethods_listenForPlaybackDelegation_$self$$.video.pause();
  });
}
$JSCompiler_prototypeAlias$$.isMuted = function() {
  return this.$muted_$;
};
$JSCompiler_prototypeAlias$$.isPlaybackManaged = function() {
  return this.$managePlayback_$;
};
$JSCompiler_prototypeAlias$$.videoLoaded = function() {
  this.$loaded_$ = !0;
  this.$internalElement_$ = this.video.element.querySelector("video, iframe");
  if (!this.video.preimplementsMediaSessionAPI()) {
    this.video.getMetadata() && (this.$metadata_$ = $map$$module$src$utils$object$$(this.video.getMetadata()));
    var $JSCompiler_doc$jscomp$inline_113_JSCompiler_title$jscomp$inline_115$$ = this.$ampdoc_$.win.document;
    if (!this.$metadata_$.artwork || 0 == this.$metadata_$.artwork.length) {
      var $JSCompiler_linkTag$jscomp$inline_239_JSCompiler_metaTag$jscomp$inline_236_JSCompiler_posterUrl$jscomp$inline_114_JSCompiler_temp$jscomp$192_JSCompiler_temp$jscomp$193$$;
      ($JSCompiler_linkTag$jscomp$inline_239_JSCompiler_metaTag$jscomp$inline_236_JSCompiler_posterUrl$jscomp$inline_114_JSCompiler_temp$jscomp$192_JSCompiler_temp$jscomp$193$$ = $parseSchemaImage$$module$src$mediasession_helper$$($JSCompiler_doc$jscomp$inline_113_JSCompiler_title$jscomp$inline_115$$)) || ($JSCompiler_linkTag$jscomp$inline_239_JSCompiler_metaTag$jscomp$inline_236_JSCompiler_posterUrl$jscomp$inline_114_JSCompiler_temp$jscomp$192_JSCompiler_temp$jscomp$193$$ = ($JSCompiler_linkTag$jscomp$inline_239_JSCompiler_metaTag$jscomp$inline_236_JSCompiler_posterUrl$jscomp$inline_114_JSCompiler_temp$jscomp$192_JSCompiler_temp$jscomp$193$$ = 
      $JSCompiler_doc$jscomp$inline_113_JSCompiler_title$jscomp$inline_115$$.querySelector('meta[property="og:image"]')) ? $JSCompiler_linkTag$jscomp$inline_239_JSCompiler_metaTag$jscomp$inline_236_JSCompiler_posterUrl$jscomp$inline_114_JSCompiler_temp$jscomp$192_JSCompiler_temp$jscomp$193$$.getAttribute("content") : void 0);
      $JSCompiler_linkTag$jscomp$inline_239_JSCompiler_metaTag$jscomp$inline_236_JSCompiler_posterUrl$jscomp$inline_114_JSCompiler_temp$jscomp$192_JSCompiler_temp$jscomp$193$$ || ($JSCompiler_linkTag$jscomp$inline_239_JSCompiler_metaTag$jscomp$inline_236_JSCompiler_posterUrl$jscomp$inline_114_JSCompiler_temp$jscomp$192_JSCompiler_temp$jscomp$193$$ = ($JSCompiler_linkTag$jscomp$inline_239_JSCompiler_metaTag$jscomp$inline_236_JSCompiler_posterUrl$jscomp$inline_114_JSCompiler_temp$jscomp$192_JSCompiler_temp$jscomp$193$$ = 
      $JSCompiler_doc$jscomp$inline_113_JSCompiler_title$jscomp$inline_115$$.querySelector('link[rel="shortcut icon"]') || $JSCompiler_doc$jscomp$inline_113_JSCompiler_title$jscomp$inline_115$$.querySelector('link[rel="icon"]')) ? $JSCompiler_linkTag$jscomp$inline_239_JSCompiler_metaTag$jscomp$inline_236_JSCompiler_posterUrl$jscomp$inline_114_JSCompiler_temp$jscomp$192_JSCompiler_temp$jscomp$193$$.getAttribute("href") : void 0);
      $JSCompiler_linkTag$jscomp$inline_239_JSCompiler_metaTag$jscomp$inline_236_JSCompiler_posterUrl$jscomp$inline_114_JSCompiler_temp$jscomp$192_JSCompiler_temp$jscomp$193$$ && (this.$metadata_$.artwork = [{src:$JSCompiler_linkTag$jscomp$inline_239_JSCompiler_metaTag$jscomp$inline_236_JSCompiler_posterUrl$jscomp$inline_114_JSCompiler_temp$jscomp$192_JSCompiler_temp$jscomp$193$$}]);
    }
    !this.$metadata_$.title && ($JSCompiler_doc$jscomp$inline_113_JSCompiler_title$jscomp$inline_115$$ = this.video.element.getAttribute("title") || this.video.element.getAttribute("aria-label") || this.$internalElement_$.getAttribute("title") || this.$internalElement_$.getAttribute("aria-label") || $JSCompiler_doc$jscomp$inline_113_JSCompiler_title$jscomp$inline_115$$.title) && (this.$metadata_$.title = $JSCompiler_doc$jscomp$inline_113_JSCompiler_title$jscomp$inline_115$$);
  }
  this.$getAnalyticsPercentageTracker_$().start();
  this.updateVisibility();
  this.$isVisible_$ && $JSCompiler_StaticMethods_loadedVideoVisibilityChanged_$$(this);
};
function $JSCompiler_StaticMethods_loadedVideoVisibilityChanged_$$($JSCompiler_StaticMethods_loadedVideoVisibilityChanged_$self$$) {
  $JSCompiler_StaticMethods_loadedVideoVisibilityChanged_$self$$.$ampdoc_$.isVisible() && $JSCompiler_StaticMethods_loadedVideoVisibilityChanged_$self$$.$supportsAutoplay_$().then(function($supportsAutoplay$$) {
    $JSCompiler_StaticMethods_loadedVideoVisibilityChanged_$self$$.hasAutoplay && !$JSCompiler_StaticMethods_loadedVideoVisibilityChanged_$self$$.userInteracted() && $supportsAutoplay$$ ? $JSCompiler_StaticMethods_loadedVideoVisibilityChanged_$self$$.$managePlayback_$ && ($JSCompiler_StaticMethods_loadedVideoVisibilityChanged_$self$$.$isVisible_$ ? ($JSCompiler_StaticMethods_loadedVideoVisibilityChanged_$self$$.$visibilitySessionManager_$.beginSession(), $JSCompiler_StaticMethods_loadedVideoVisibilityChanged_$self$$.video.play(!0), 
    $JSCompiler_StaticMethods_loadedVideoVisibilityChanged_$self$$.$playCalledByAutoplay_$ = !0) : ($JSCompiler_StaticMethods_loadedVideoVisibilityChanged_$self$$.$isPlaying_$ && $JSCompiler_StaticMethods_loadedVideoVisibilityChanged_$self$$.$visibilitySessionManager_$.endSession(), $JSCompiler_StaticMethods_loadedVideoVisibilityChanged_$self$$.video.pause(), $JSCompiler_StaticMethods_loadedVideoVisibilityChanged_$self$$.$pauseCalledByAutoplay_$ = !0)) : $JSCompiler_StaticMethods_loadedVideoVisibilityChanged_$self$$.$isVisible_$ ? 
    $JSCompiler_StaticMethods_loadedVideoVisibilityChanged_$self$$.$visibilitySessionManager_$.beginSession() : $JSCompiler_StaticMethods_loadedVideoVisibilityChanged_$self$$.$isPlaying_$ && $JSCompiler_StaticMethods_loadedVideoVisibilityChanged_$self$$.$visibilitySessionManager_$.endSession();
  });
}
function $JSCompiler_StaticMethods_autoplayVideoBuilt_$$($JSCompiler_StaticMethods_autoplayVideoBuilt_$self$$) {
  $JSCompiler_StaticMethods_autoplayVideoBuilt_$self$$.video.isInteractive() && $JSCompiler_StaticMethods_autoplayVideoBuilt_$self$$.video.hideControls();
  $JSCompiler_StaticMethods_autoplayVideoBuilt_$self$$.$supportsAutoplay_$().then(function($supportsAutoplay$jscomp$1$$) {
    !$supportsAutoplay$jscomp$1$$ && $JSCompiler_StaticMethods_autoplayVideoBuilt_$self$$.video.isInteractive() ? $JSCompiler_StaticMethods_autoplayVideoBuilt_$self$$.video.showControls() : ($JSCompiler_StaticMethods_autoplayVideoBuilt_$self$$.video.mute(), $JSCompiler_StaticMethods_installAutoplayArtifacts_$$($JSCompiler_StaticMethods_autoplayVideoBuilt_$self$$));
  });
}
function $JSCompiler_StaticMethods_installAutoplayArtifacts_$$($JSCompiler_StaticMethods_installAutoplayArtifacts_$self$$) {
  var $video$jscomp$13$$ = $JSCompiler_StaticMethods_installAutoplayArtifacts_$self$$.video, $$jscomp$destructuring$var26_win$jscomp$68$$ = $JSCompiler_StaticMethods_installAutoplayArtifacts_$self$$.video, $element$jscomp$85$$ = $$jscomp$destructuring$var26_win$jscomp$68$$.element;
  $$jscomp$destructuring$var26_win$jscomp$68$$ = $$jscomp$destructuring$var26_win$jscomp$68$$.win;
  if (!$element$jscomp$85$$.hasAttribute("noaudio") && !$element$jscomp$85$$.signals().get("user-interacted")) {
    var $animation$$ = $renderIcon$$module$src$service$video$autoplay$$($$jscomp$destructuring$var26_win$jscomp$68$$, $element$jscomp$85$$), $toggleAnimation$$ = function($JSCompiler_StaticMethods_installAutoplayArtifacts_$self$$) {
      $video$jscomp$13$$.mutateElementSkipRemeasure(function() {
        return $animation$$.classList.toggle("amp-video-eq-play", $JSCompiler_StaticMethods_installAutoplayArtifacts_$self$$);
      });
    };
    $video$jscomp$13$$.mutateElementSkipRemeasure(function() {
      return $element$jscomp$85$$.appendChild($animation$$);
    });
    var $unlisteners$$ = [$listen$$module$src$event_helper$$($element$jscomp$85$$, "pause", function() {
      return $toggleAnimation$$(!1);
    }), $listen$$module$src$event_helper$$($element$jscomp$85$$, "playing", function() {
      return $toggleAnimation$$(!0);
    })];
    $video$jscomp$13$$.signals().whenSignal("user-interacted").then(function() {
      var $video$jscomp$13$$ = $JSCompiler_StaticMethods_installAutoplayArtifacts_$self$$.video, $$jscomp$destructuring$var26_win$jscomp$68$$ = $video$jscomp$13$$.element;
      $JSCompiler_StaticMethods_installAutoplayArtifacts_$self$$.$firstPlayEventOrNoop_$();
      $video$jscomp$13$$.isInteractive() && $video$jscomp$13$$.showControls();
      $video$jscomp$13$$.unmute();
      $unlisteners$$.forEach(function($JSCompiler_StaticMethods_installAutoplayArtifacts_$self$$) {
        $JSCompiler_StaticMethods_installAutoplayArtifacts_$self$$();
      });
      $video$jscomp$13$$ = $$jscomp$destructuring$var26_win$jscomp$68$$.querySelector(".amp-video-eq");
      $$jscomp$destructuring$var26_win$jscomp$68$$ = $$jscomp$destructuring$var26_win$jscomp$68$$.querySelector("i-amphtml-video-mask");
      $video$jscomp$13$$ && $removeElement$$module$src$dom$$($video$jscomp$13$$);
      $$jscomp$destructuring$var26_win$jscomp$68$$ && $removeElement$$module$src$dom$$($$jscomp$destructuring$var26_win$jscomp$68$$);
    });
    if ($video$jscomp$13$$.isInteractive()) {
      var $mask$jscomp$7$$ = $htmlFor$$module$src$static_template$$($element$jscomp$85$$)($_template$$module$src$service$video$autoplay$$), $setMaskDisplay$$ = function($JSCompiler_StaticMethods_installAutoplayArtifacts_$self$$) {
        $video$jscomp$13$$.mutateElementSkipRemeasure(function() {
          var $video$jscomp$13$$ = $JSCompiler_StaticMethods_installAutoplayArtifacts_$self$$;
          void 0 === $video$jscomp$13$$ && ($video$jscomp$13$$ = $mask$jscomp$7$$.hasAttribute("hidden"));
          $video$jscomp$13$$ ? $mask$jscomp$7$$.removeAttribute("hidden") : $mask$jscomp$7$$.setAttribute("hidden", "");
        });
      };
      $video$jscomp$13$$.hideControls();
      $video$jscomp$13$$.mutateElementSkipRemeasure(function() {
        return $element$jscomp$85$$.appendChild($mask$jscomp$7$$);
      });
      [$listen$$module$src$event_helper$$($mask$jscomp$7$$, "click", function() {
        return $userInteractedWith$$module$src$video_interface$$($video$jscomp$13$$);
      }), $listen$$module$src$event_helper$$($element$jscomp$85$$, "ad_start", function() {
        $setMaskDisplay$$(!1);
        $video$jscomp$13$$.showControls();
      }), $listen$$module$src$event_helper$$($element$jscomp$85$$, "ad_end", function() {
        $setMaskDisplay$$(!0);
        $video$jscomp$13$$.hideControls();
      }), $listen$$module$src$event_helper$$($element$jscomp$85$$, "unmuted", function() {
        return $userInteractedWith$$module$src$video_interface$$($video$jscomp$13$$);
      })].forEach(function($JSCompiler_StaticMethods_installAutoplayArtifacts_$self$$) {
        return $unlisteners$$.push($JSCompiler_StaticMethods_installAutoplayArtifacts_$self$$);
      });
    }
  }
}
$JSCompiler_prototypeAlias$$.updateVisibility = function($opt_forceVisible$$) {
  var $wasVisible$$ = this.$isVisible_$;
  if ($opt_forceVisible$$) {
    this.$isVisible_$ = !0;
  } else {
    var $ratio$$ = this.video.element.getIntersectionChangeEntry().intersectionRatio;
    this.$isVisible_$ = 0.5 <= ($isFiniteNumber$$module$src$types$$($ratio$$) ? $ratio$$ : 0);
  }
  this.$isVisible_$ != $wasVisible$$ && this.$loaded_$ && $JSCompiler_StaticMethods_loadedVideoVisibilityChanged_$$(this);
};
$JSCompiler_prototypeAlias$$.getPlayingState = function() {
  return this.$isPlaying_$ ? this.$isPlaying_$ && this.$playCalledByAutoplay_$ && !this.userInteracted() ? "playing_auto" : "playing_manual" : "paused";
};
$JSCompiler_prototypeAlias$$.isRollingAd = function() {
  return this.$isRollingAd_$;
};
$JSCompiler_prototypeAlias$$.userInteracted = function() {
  return null != this.video.signals().get("user-interacted");
};
$JSCompiler_prototypeAlias$$.getAnalyticsDetails = function() {
  var $$jscomp$this$jscomp$12$$ = this, $video$jscomp$15$$ = this.video;
  return this.$supportsAutoplay_$().then(function($supportsAutoplay$jscomp$2$$) {
    var $$jscomp$destructuring$var31_height$jscomp$25$$ = $video$jscomp$15$$.element.getLayoutBox(), $width$jscomp$26$$ = $$jscomp$destructuring$var31_height$jscomp$25$$.width;
    $$jscomp$destructuring$var31_height$jscomp$25$$ = $$jscomp$destructuring$var31_height$jscomp$25$$.height;
    var $autoplay$$ = $$jscomp$this$jscomp$12$$.hasAutoplay && $supportsAutoplay$jscomp$2$$, $playedRanges$$ = $video$jscomp$15$$.getPlayedRanges(), $playedTotal$$ = $playedRanges$$.reduce(function($$jscomp$this$jscomp$12$$, $video$jscomp$15$$) {
      return $$jscomp$this$jscomp$12$$ + $video$jscomp$15$$[1] - $video$jscomp$15$$[0];
    }, 0);
    return {autoplay:$autoplay$$, currentTime:$video$jscomp$15$$.getCurrentTime(), duration:$video$jscomp$15$$.getDuration(), height:$$jscomp$destructuring$var31_height$jscomp$25$$, id:$video$jscomp$15$$.element.id, muted:$$jscomp$this$jscomp$12$$.$muted_$, playedTotal:$playedTotal$$, playedRangesJson:JSON.stringify($playedRanges$$), state:$$jscomp$this$jscomp$12$$.getPlayingState(), width:$width$jscomp$26$$};
  });
};
function $AutoFullscreenManager$$module$src$service$video_manager_impl$$($ampdoc$jscomp$17$$, $manager$jscomp$1$$) {
  var $$jscomp$this$jscomp$13$$ = this;
  this.$manager_$ = $manager$jscomp$1$$;
  this.$ampdoc_$ = $ampdoc$jscomp$17$$;
  this.$currentlyCentered_$ = this.$currentlyInFullscreen_$ = null;
  this.$entries_$ = [];
  this.$unlisteners_$ = [];
  this.$boundSelectBestCentered_$ = function() {
    return $JSCompiler_StaticMethods_selectBestCenteredInPortrait_$$($$jscomp$this$jscomp$13$$);
  };
  this.$boundIncludeOnlyPlaying_$ = function($ampdoc$jscomp$17$$) {
    return "playing_manual" == $$jscomp$this$jscomp$13$$.$manager_$.getPlayingState($ampdoc$jscomp$17$$);
  };
  this.$boundCompareEntries_$ = function($ampdoc$jscomp$17$$, $manager$jscomp$1$$) {
    $ampdoc$jscomp$17$$ = $ampdoc$jscomp$17$$.element.getIntersectionChangeEntry();
    var $JSCompiler_$jscomp$inline_129_JSCompiler_inline_result$jscomp$48_JSCompiler_rectA$jscomp$inline_131_a$jscomp$7$$ = $ampdoc$jscomp$17$$.intersectionRatio;
    $ampdoc$jscomp$17$$ = $ampdoc$jscomp$17$$.boundingClientRect;
    var $JSCompiler_rectB$jscomp$inline_133_b$jscomp$7$$ = $manager$jscomp$1$$.element.getIntersectionChangeEntry();
    $manager$jscomp$1$$ = $JSCompiler_rectB$jscomp$inline_133_b$jscomp$7$$.boundingClientRect;
    $JSCompiler_$jscomp$inline_129_JSCompiler_inline_result$jscomp$48_JSCompiler_rectA$jscomp$inline_131_a$jscomp$7$$ -= $JSCompiler_rectB$jscomp$inline_133_b$jscomp$7$$.intersectionRatio;
    0.1 < Math.abs($JSCompiler_$jscomp$inline_129_JSCompiler_inline_result$jscomp$48_JSCompiler_rectA$jscomp$inline_131_a$jscomp$7$$) ? $ampdoc$jscomp$17$$ = $JSCompiler_$jscomp$inline_129_JSCompiler_inline_result$jscomp$48_JSCompiler_rectA$jscomp$inline_131_a$jscomp$7$$ : ($JSCompiler_rectB$jscomp$inline_133_b$jscomp$7$$ = $getServiceForDoc$$module$src$service$$($$jscomp$this$jscomp$13$$.$ampdoc_$, "viewport"), $JSCompiler_$jscomp$inline_129_JSCompiler_inline_result$jscomp$48_JSCompiler_rectA$jscomp$inline_131_a$jscomp$7$$ = 
    $centerDist$$module$src$service$video_manager_impl$$($JSCompiler_rectB$jscomp$inline_133_b$jscomp$7$$, $ampdoc$jscomp$17$$), $JSCompiler_rectB$jscomp$inline_133_b$jscomp$7$$ = $centerDist$$module$src$service$video_manager_impl$$($JSCompiler_rectB$jscomp$inline_133_b$jscomp$7$$, $manager$jscomp$1$$), $ampdoc$jscomp$17$$ = $JSCompiler_$jscomp$inline_129_JSCompiler_inline_result$jscomp$48_JSCompiler_rectA$jscomp$inline_131_a$jscomp$7$$ < $JSCompiler_rectB$jscomp$inline_133_b$jscomp$7$$ || $JSCompiler_$jscomp$inline_129_JSCompiler_inline_result$jscomp$48_JSCompiler_rectA$jscomp$inline_131_a$jscomp$7$$ > 
    $JSCompiler_rectB$jscomp$inline_133_b$jscomp$7$$ ? $JSCompiler_$jscomp$inline_129_JSCompiler_inline_result$jscomp$48_JSCompiler_rectA$jscomp$inline_131_a$jscomp$7$$ - $JSCompiler_rectB$jscomp$inline_133_b$jscomp$7$$ : $ampdoc$jscomp$17$$.top - $manager$jscomp$1$$.top);
    return $ampdoc$jscomp$17$$;
  };
  $JSCompiler_StaticMethods_installOrientationObserver_$$(this);
  $JSCompiler_StaticMethods_installFullscreenListener_$$(this);
}
$AutoFullscreenManager$$module$src$service$video_manager_impl$$.prototype.dispose = function() {
  this.$unlisteners_$.forEach(function($unlisten$jscomp$3$$) {
    return $unlisten$jscomp$3$$();
  });
  this.$unlisteners_$.length = 0;
};
$AutoFullscreenManager$$module$src$service$video_manager_impl$$.prototype.register = function($entry$jscomp$10_video$jscomp$18$$) {
  $entry$jscomp$10_video$jscomp$18$$ = $entry$jscomp$10_video$jscomp$18$$.video;
  var $element$jscomp$88$$ = $entry$jscomp$10_video$jscomp$18$$.element;
  if ("video" == $element$jscomp$88$$.querySelector("video, iframe").tagName.toLowerCase()) {
    var $JSCompiler_inline_result$jscomp$46_JSCompiler_platform$jscomp$inline_141$$ = !0;
  } else {
    $JSCompiler_inline_result$jscomp$46_JSCompiler_platform$jscomp$inline_141$$ = $Services$$module$src$services$platformFor$$(this.$ampdoc_$.win), $JSCompiler_inline_result$jscomp$46_JSCompiler_platform$jscomp$inline_141$$ = $JSCompiler_inline_result$jscomp$46_JSCompiler_platform$jscomp$inline_141$$.isIos() || $JSCompiler_inline_result$jscomp$46_JSCompiler_platform$jscomp$inline_141$$.isSafari() ? !!{"amp-dailymotion":!0, "amp-ima-video":!0}[$element$jscomp$88$$.tagName.toLowerCase()] : !0;
  }
  $JSCompiler_inline_result$jscomp$46_JSCompiler_platform$jscomp$inline_141$$ && (this.$entries_$.push($entry$jscomp$10_video$jscomp$18$$), $listen$$module$src$event_helper$$($element$jscomp$88$$, "pause", this.$boundSelectBestCentered_$), $listen$$module$src$event_helper$$($element$jscomp$88$$, "playing", this.$boundSelectBestCentered_$), $listen$$module$src$event_helper$$($element$jscomp$88$$, "ended", this.$boundSelectBestCentered_$), $entry$jscomp$10_video$jscomp$18$$.signals().whenSignal("user-interacted").then(this.$boundSelectBestCentered_$), 
  $JSCompiler_StaticMethods_selectBestCenteredInPortrait_$$(this));
};
function $JSCompiler_StaticMethods_installFullscreenListener_$$($JSCompiler_StaticMethods_installFullscreenListener_$self$$) {
  function $exitHandler$$() {
    $JSCompiler_StaticMethods_installFullscreenListener_$self$$.$currentlyInFullscreen_$ = null;
  }
  var $root$jscomp$11$$ = $JSCompiler_StaticMethods_installFullscreenListener_$self$$.$ampdoc_$.getRootNode();
  $JSCompiler_StaticMethods_installFullscreenListener_$self$$.$unlisteners_$.push($listen$$module$src$event_helper$$($root$jscomp$11$$, "webkitfullscreenchange", $exitHandler$$), $listen$$module$src$event_helper$$($root$jscomp$11$$, "mozfullscreenchange", $exitHandler$$), $listen$$module$src$event_helper$$($root$jscomp$11$$, "fullscreenchange", $exitHandler$$), $listen$$module$src$event_helper$$($root$jscomp$11$$, "MSFullscreenChange", $exitHandler$$));
}
$AutoFullscreenManager$$module$src$service$video_manager_impl$$.prototype.isInLandscape = function() {
  var $JSCompiler_win$jscomp$inline_145$$ = this.$ampdoc_$.win;
  return $JSCompiler_win$jscomp$inline_145$$.screen && "orientation" in $JSCompiler_win$jscomp$inline_145$$.screen ? $startsWith$$module$src$string$$($JSCompiler_win$jscomp$inline_145$$.screen.orientation.type, "landscape") : 90 == Math.abs($JSCompiler_win$jscomp$inline_145$$.orientation);
};
function $JSCompiler_StaticMethods_installOrientationObserver_$$($JSCompiler_StaticMethods_installOrientationObserver_$self$$) {
  var $win$jscomp$69$$ = $JSCompiler_StaticMethods_installOrientationObserver_$self$$.$ampdoc_$.win, $screen$jscomp$1$$ = $win$jscomp$69$$.screen;
  $screen$jscomp$1$$ && "orientation" in $screen$jscomp$1$$ && $JSCompiler_StaticMethods_installOrientationObserver_$self$$.$unlisteners_$.push($listen$$module$src$event_helper$$($screen$jscomp$1$$.orientation, "change", function() {
    return $JSCompiler_StaticMethods_onRotation_$$($JSCompiler_StaticMethods_installOrientationObserver_$self$$);
  }));
  $JSCompiler_StaticMethods_installOrientationObserver_$self$$.$unlisteners_$.push($listen$$module$src$event_helper$$($win$jscomp$69$$, "orientationchange", function() {
    return $JSCompiler_StaticMethods_onRotation_$$($JSCompiler_StaticMethods_installOrientationObserver_$self$$);
  }));
}
function $JSCompiler_StaticMethods_onRotation_$$($JSCompiler_StaticMethods_onRotation_$self$$) {
  $JSCompiler_StaticMethods_onRotation_$self$$.isInLandscape() ? null != $JSCompiler_StaticMethods_onRotation_$self$$.$currentlyCentered_$ && $JSCompiler_StaticMethods_enter_$$($JSCompiler_StaticMethods_onRotation_$self$$, $JSCompiler_StaticMethods_onRotation_$self$$.$currentlyCentered_$) : $JSCompiler_StaticMethods_onRotation_$self$$.$currentlyInFullscreen_$ && $JSCompiler_StaticMethods_exit_$$($JSCompiler_StaticMethods_onRotation_$self$$, $JSCompiler_StaticMethods_onRotation_$self$$.$currentlyInFullscreen_$);
}
function $JSCompiler_StaticMethods_enter_$$($JSCompiler_StaticMethods_enter_$self$$, $video$jscomp$20$$) {
  var $platform$jscomp$1$$ = $Services$$module$src$services$platformFor$$($JSCompiler_StaticMethods_enter_$self$$.$ampdoc_$.win);
  $JSCompiler_StaticMethods_enter_$self$$.$currentlyInFullscreen_$ = $video$jscomp$20$$;
  $platform$jscomp$1$$.isAndroid() && $platform$jscomp$1$$.isChrome() ? $video$jscomp$20$$.fullscreenEnter() : $JSCompiler_StaticMethods_scrollIntoIfNotVisible_$$($JSCompiler_StaticMethods_enter_$self$$, $video$jscomp$20$$).then(function() {
    return $video$jscomp$20$$.fullscreenEnter();
  });
}
function $JSCompiler_StaticMethods_exit_$$($JSCompiler_StaticMethods_exit_$self$$, $video$jscomp$21$$) {
  $JSCompiler_StaticMethods_exit_$self$$.$currentlyInFullscreen_$ = null;
  $JSCompiler_StaticMethods_scrollIntoIfNotVisible_$$($JSCompiler_StaticMethods_exit_$self$$, $video$jscomp$21$$, "center").then(function() {
    return $video$jscomp$21$$.fullscreenExit();
  });
}
function $JSCompiler_StaticMethods_scrollIntoIfNotVisible_$$($JSCompiler_StaticMethods_scrollIntoIfNotVisible_$self$$, $video$jscomp$22$$, $optPos$$) {
  $optPos$$ = void 0 === $optPos$$ ? null : $optPos$$;
  var $element$jscomp$89$$ = $video$jscomp$22$$.element, $viewport$$ = $getServiceForDoc$$module$src$service$$($JSCompiler_StaticMethods_scrollIntoIfNotVisible_$self$$.$ampdoc_$, "viewport");
  return $getService$$module$src$service$$($JSCompiler_StaticMethods_scrollIntoIfNotVisible_$self$$.$ampdoc_$.win, "timer").promise(330).then(function() {
    var $JSCompiler_StaticMethods_scrollIntoIfNotVisible_$self$$ = $element$jscomp$89$$.getIntersectionChangeEntry().boundingClientRect, $video$jscomp$22$$ = $JSCompiler_StaticMethods_scrollIntoIfNotVisible_$self$$.top;
    $JSCompiler_StaticMethods_scrollIntoIfNotVisible_$self$$ = $JSCompiler_StaticMethods_scrollIntoIfNotVisible_$self$$.bottom;
    var $vh$$ = $viewport$$.getSize().height;
    return 0 <= $video$jscomp$22$$ && $JSCompiler_StaticMethods_scrollIntoIfNotVisible_$self$$ <= $vh$$ ? $resolvedPromise$$module$src$resolved_promise$$() : $viewport$$.animateScrollIntoView($element$jscomp$89$$, $optPos$$ ? $optPos$$ : $JSCompiler_StaticMethods_scrollIntoIfNotVisible_$self$$ > $vh$$ ? "bottom" : "top");
  });
}
function $JSCompiler_StaticMethods_selectBestCenteredInPortrait_$$($JSCompiler_StaticMethods_selectBestCenteredInPortrait_$self$$) {
  if ($JSCompiler_StaticMethods_selectBestCenteredInPortrait_$self$$.isInLandscape()) {
    return $JSCompiler_StaticMethods_selectBestCenteredInPortrait_$self$$.$currentlyCentered_$;
  }
  $JSCompiler_StaticMethods_selectBestCenteredInPortrait_$self$$.$currentlyCentered_$ = null;
  var $selected$$ = $JSCompiler_StaticMethods_selectBestCenteredInPortrait_$self$$.$entries_$.filter($JSCompiler_StaticMethods_selectBestCenteredInPortrait_$self$$.$boundIncludeOnlyPlaying_$).sort($JSCompiler_StaticMethods_selectBestCenteredInPortrait_$self$$.$boundCompareEntries_$)[0];
  $selected$$ && 0.5 <= $selected$$.element.getIntersectionChangeEntry().intersectionRatio && ($JSCompiler_StaticMethods_selectBestCenteredInPortrait_$self$$.$currentlyCentered_$ = $selected$$);
  return $JSCompiler_StaticMethods_selectBestCenteredInPortrait_$self$$.$currentlyCentered_$;
}
function $centerDist$$module$src$service$video_manager_impl$$($viewport$jscomp$2$$, $rect$$) {
  var $centerY$jscomp$1$$ = $rect$$.top + $rect$$.height / 2, $centerViewport$$ = $viewport$jscomp$2$$.getSize().height / 2;
  return Math.abs($centerY$jscomp$1$$ - $centerViewport$$);
}
function $AnalyticsPercentageTracker$$module$src$service$video_manager_impl$$($win$jscomp$71$$, $entry$jscomp$11$$) {
  this.$timer_$ = $getService$$module$src$service$$($win$jscomp$71$$, "timer");
  this.$entry_$ = $entry$jscomp$11$$;
  this.$unlisteners_$ = null;
  this.$triggerId_$ = this.$last_$ = 0;
}
$AnalyticsPercentageTracker$$module$src$service$video_manager_impl$$.prototype.start = function() {
  var $$jscomp$this$jscomp$16$$ = this, $element$jscomp$90$$ = this.$entry_$.video.element;
  this.stop();
  this.$unlisteners_$ = this.$unlisteners_$ || [];
  $JSCompiler_StaticMethods_hasDuration_$$(this) ? $JSCompiler_StaticMethods_calculate_$$(this, this.$triggerId_$) : this.$unlisteners_$.push($listenOnce$$module$src$event_helper$$($element$jscomp$90$$, "loadedmetadata", function() {
    $JSCompiler_StaticMethods_hasDuration_$$($$jscomp$this$jscomp$16$$) && $JSCompiler_StaticMethods_calculate_$$($$jscomp$this$jscomp$16$$, $$jscomp$this$jscomp$16$$.$triggerId_$);
  }));
  this.$unlisteners_$.push($listen$$module$src$event_helper$$($element$jscomp$90$$, "ended", function() {
    $JSCompiler_StaticMethods_hasDuration_$$($$jscomp$this$jscomp$16$$) && $JSCompiler_StaticMethods_maybeTrigger_$$($$jscomp$this$jscomp$16$$, 100);
  }));
};
$AnalyticsPercentageTracker$$module$src$service$video_manager_impl$$.prototype.stop = function() {
  if (this.$unlisteners_$) {
    for (; 0 < this.$unlisteners_$.length;) {
      this.$unlisteners_$.pop()();
    }
    this.$triggerId_$++;
  }
};
function $JSCompiler_StaticMethods_hasDuration_$$($JSCompiler_StaticMethods_hasDuration_$self$$) {
  var $video$jscomp$24$$ = $JSCompiler_StaticMethods_hasDuration_$self$$.$entry_$.video, $duration$jscomp$3$$ = $video$jscomp$24$$.getDuration();
  if (!($duration$jscomp$3$$ && !isNaN($duration$jscomp$3$$) && 1 < $duration$jscomp$3$$)) {
    return !1;
  }
  250 > 50 * $duration$jscomp$3$$ && $JSCompiler_StaticMethods_hasDuration_$self$$.$warnForTesting_$("This video is too short for `video-percentage-played`. Reports may be innacurate. For best results, use videos over", 5, "seconds long.", $video$jscomp$24$$.element);
  return !0;
}
$AnalyticsPercentageTracker$$module$src$service$video_manager_impl$$.prototype.$warnForTesting_$ = function($args$jscomp$3$$) {
  for (var $$jscomp$restParams$jscomp$1$$ = [], $$jscomp$restIndex$jscomp$1$$ = 0; $$jscomp$restIndex$jscomp$1$$ < arguments.length; ++$$jscomp$restIndex$jscomp$1$$) {
    $$jscomp$restParams$jscomp$1$$[$$jscomp$restIndex$jscomp$1$$ - 0] = arguments[$$jscomp$restIndex$jscomp$1$$];
  }
  $user$$module$src$log$$().warn.apply($user$$module$src$log$$(), ["video-manager"].concat($$jscomp$restParams$jscomp$1$$));
};
function $JSCompiler_StaticMethods_calculate_$$($JSCompiler_StaticMethods_calculate_$self$$, $triggerId$$) {
  if ($triggerId$$ == $JSCompiler_StaticMethods_calculate_$self$$.$triggerId_$) {
    var $duration$jscomp$4_entry$jscomp$12$$ = $JSCompiler_StaticMethods_calculate_$self$$.$entry_$, $timer$jscomp$1$$ = $JSCompiler_StaticMethods_calculate_$self$$.$timer_$, $video$jscomp$25$$ = $duration$jscomp$4_entry$jscomp$12$$.video, $calculateAgain$$ = function() {
      return $JSCompiler_StaticMethods_calculate_$$($JSCompiler_StaticMethods_calculate_$self$$, $triggerId$$);
    };
    if ("paused" == $duration$jscomp$4_entry$jscomp$12$$.getPlayingState()) {
      $timer$jscomp$1$$.delay($calculateAgain$$, 500);
    } else {
      if (($duration$jscomp$4_entry$jscomp$12$$ = $video$jscomp$25$$.getDuration()) && !isNaN($duration$jscomp$4_entry$jscomp$12$$) && 1 < $duration$jscomp$4_entry$jscomp$12$$) {
        var $frequencyMs$$ = Math.min(Math.max(50 * $duration$jscomp$4_entry$jscomp$12$$, 250), 4000), $percentage$$ = $video$jscomp$25$$.getCurrentTime() / $duration$jscomp$4_entry$jscomp$12$$ * 100, $normalizedPercentage$$ = 5 * Math.floor($percentage$$ / 5);
        $isFiniteNumber$$module$src$types$$($normalizedPercentage$$);
        $JSCompiler_StaticMethods_maybeTrigger_$$($JSCompiler_StaticMethods_calculate_$self$$, $normalizedPercentage$$);
        $timer$jscomp$1$$.delay($calculateAgain$$, $frequencyMs$$);
      } else {
        $timer$jscomp$1$$.delay($calculateAgain$$, 500);
      }
    }
  }
}
function $JSCompiler_StaticMethods_maybeTrigger_$$($JSCompiler_StaticMethods_maybeTrigger_$self$$, $normalizedPercentage$jscomp$1$$) {
  0 >= $normalizedPercentage$jscomp$1$$ || $JSCompiler_StaticMethods_maybeTrigger_$self$$.$last_$ == $normalizedPercentage$jscomp$1$$ || ($JSCompiler_StaticMethods_maybeTrigger_$self$$.$last_$ = $normalizedPercentage$jscomp$1$$, $analyticsEvent$$module$src$service$video_manager_impl$$($JSCompiler_StaticMethods_maybeTrigger_$self$$.$entry_$, "video-percentage-played", {normalizedPercentage:$normalizedPercentage$jscomp$1$$.toString()}));
}
function $analyticsEvent$$module$src$service$video_manager_impl$$($entry$jscomp$13$$, $eventType$jscomp$9$$, $opt_vars$$) {
  var $video$jscomp$26$$ = $entry$jscomp$13$$.video;
  $entry$jscomp$13$$.getAnalyticsDetails().then(function($entry$jscomp$13$$) {
    $opt_vars$$ && Object.assign($entry$jscomp$13$$, $opt_vars$$);
    $video$jscomp$26$$.element.dispatchCustomEvent($eventType$jscomp$9$$, $entry$jscomp$13$$);
  });
}
;var $_template$$module$extensions$amp_video$0_1$amp_video$$ = ["<i-amphtml-poster></i-amphtml-poster>"], $ATTRS_TO_PROPAGATE_ON_BUILD$$module$extensions$amp_video$0_1$amp_video$$ = "aria-describedby aria-label aria-labelledby controls crossorigin disableremoteplayback controlsList".split(" "), $ATTRS_TO_PROPAGATE_ON_LAYOUT$$module$extensions$amp_video$0_1$amp_video$$ = ["loop", "poster", "preload"], $ATTRS_TO_PROPAGATE$$module$extensions$amp_video$0_1$amp_video$$ = $ATTRS_TO_PROPAGATE_ON_BUILD$$module$extensions$amp_video$0_1$amp_video$$.concat($ATTRS_TO_PROPAGATE_ON_LAYOUT$$module$extensions$amp_video$0_1$amp_video$$);
function $AmpVideo$$module$extensions$amp_video$0_1$amp_video$$($$jscomp$super$this_element$jscomp$96$$) {
  $$jscomp$super$this_element$jscomp$96$$ = AMP.BaseElement.call(this, $$jscomp$super$this_element$jscomp$96$$) || this;
  $$jscomp$super$this_element$jscomp$96$$.$video_$ = null;
  $$jscomp$super$this_element$jscomp$96$$.$muted_$ = !1;
  $$jscomp$super$this_element$jscomp$96$$.$prerenderAllowed_$ = !1;
  $$jscomp$super$this_element$jscomp$96$$.$metadata_$ = $EMPTY_METADATA$$module$src$mediasession_helper$$;
  $$jscomp$super$this_element$jscomp$96$$.$unlisteners_$ = [];
  $$jscomp$super$this_element$jscomp$96$$.$posterDummyImageForTesting_$ = null;
  return $$jscomp$super$this_element$jscomp$96$$;
}
var $JSCompiler_parentCtor$jscomp$inline_151$$ = AMP.BaseElement;
$AmpVideo$$module$extensions$amp_video$0_1$amp_video$$.prototype = $$jscomp$objectCreate$$($JSCompiler_parentCtor$jscomp$inline_151$$.prototype);
$AmpVideo$$module$extensions$amp_video$0_1$amp_video$$.prototype.constructor = $AmpVideo$$module$extensions$amp_video$0_1$amp_video$$;
if ($$jscomp$setPrototypeOf$$) {
  $$jscomp$setPrototypeOf$$($AmpVideo$$module$extensions$amp_video$0_1$amp_video$$, $JSCompiler_parentCtor$jscomp$inline_151$$);
} else {
  for (var $JSCompiler_p$jscomp$inline_152$$ in $JSCompiler_parentCtor$jscomp$inline_151$$) {
    if ("prototype" != $JSCompiler_p$jscomp$inline_152$$) {
      if (Object.defineProperties) {
        var $JSCompiler_descriptor$jscomp$inline_153$$ = Object.getOwnPropertyDescriptor($JSCompiler_parentCtor$jscomp$inline_151$$, $JSCompiler_p$jscomp$inline_152$$);
        $JSCompiler_descriptor$jscomp$inline_153$$ && Object.defineProperty($AmpVideo$$module$extensions$amp_video$0_1$amp_video$$, $JSCompiler_p$jscomp$inline_152$$, $JSCompiler_descriptor$jscomp$inline_153$$);
      } else {
        $AmpVideo$$module$extensions$amp_video$0_1$amp_video$$[$JSCompiler_p$jscomp$inline_152$$] = $JSCompiler_parentCtor$jscomp$inline_151$$[$JSCompiler_p$jscomp$inline_152$$];
      }
    }
  }
}
$AmpVideo$$module$extensions$amp_video$0_1$amp_video$$.$superClass_$ = $JSCompiler_parentCtor$jscomp$inline_151$$.prototype;
$JSCompiler_prototypeAlias$$ = $AmpVideo$$module$extensions$amp_video$0_1$amp_video$$.prototype;
$JSCompiler_prototypeAlias$$.preconnectCallback = function($opt_onLayout$$) {
  var $$jscomp$this$jscomp$18$$ = this;
  $JSCompiler_StaticMethods_getVideoSourcesForPreconnect_$$(this).forEach(function($videoSrc$$) {
    $getService$$module$src$service$$($$jscomp$this$jscomp$18$$.win, "preconnect").url($$jscomp$this$jscomp$18$$.getAmpDoc(), $videoSrc$$, $opt_onLayout$$);
  });
};
$JSCompiler_prototypeAlias$$.firstAttachedCallback = function() {
  var $JSCompiler_inline_result$jscomp$197_JSCompiler_sources$jscomp$inline_243_JSCompiler_temp$jscomp$196$$;
  if (!($JSCompiler_inline_result$jscomp$197_JSCompiler_sources$jscomp$inline_243_JSCompiler_temp$jscomp$196$$ = !!this.element.getAttribute("poster"))) {
    a: {
      var $JSCompiler_element$jscomp$inline_242_JSCompiler_i$jscomp$inline_244$$ = this.element;
      $JSCompiler_inline_result$jscomp$197_JSCompiler_sources$jscomp$inline_243_JSCompiler_temp$jscomp$196$$ = $toArray$$module$src$types$$($childElementsByTag$$module$src$dom$$($JSCompiler_element$jscomp$inline_242_JSCompiler_i$jscomp$inline_244$$, "source"));
      $JSCompiler_inline_result$jscomp$197_JSCompiler_sources$jscomp$inline_243_JSCompiler_temp$jscomp$196$$.push($JSCompiler_element$jscomp$inline_242_JSCompiler_i$jscomp$inline_244$$);
      for ($JSCompiler_element$jscomp$inline_242_JSCompiler_i$jscomp$inline_244$$ = 0; $JSCompiler_element$jscomp$inline_242_JSCompiler_i$jscomp$inline_244$$ < $JSCompiler_inline_result$jscomp$197_JSCompiler_sources$jscomp$inline_243_JSCompiler_temp$jscomp$196$$.length; $JSCompiler_element$jscomp$inline_242_JSCompiler_i$jscomp$inline_244$$++) {
        if ($JSCompiler_StaticMethods_isCachedByCDN_$$(this, $JSCompiler_inline_result$jscomp$197_JSCompiler_sources$jscomp$inline_243_JSCompiler_temp$jscomp$196$$[$JSCompiler_element$jscomp$inline_242_JSCompiler_i$jscomp$inline_244$$])) {
          $JSCompiler_inline_result$jscomp$197_JSCompiler_sources$jscomp$inline_243_JSCompiler_temp$jscomp$196$$ = $JSCompiler_inline_result$jscomp$197_JSCompiler_sources$jscomp$inline_243_JSCompiler_temp$jscomp$196$$[$JSCompiler_element$jscomp$inline_242_JSCompiler_i$jscomp$inline_244$$];
          break a;
        }
      }
      $JSCompiler_inline_result$jscomp$197_JSCompiler_sources$jscomp$inline_243_JSCompiler_temp$jscomp$196$$ = null;
    }
    $JSCompiler_inline_result$jscomp$197_JSCompiler_sources$jscomp$inline_243_JSCompiler_temp$jscomp$196$$ = !!$JSCompiler_inline_result$jscomp$197_JSCompiler_sources$jscomp$inline_243_JSCompiler_temp$jscomp$196$$;
  }
  this.$prerenderAllowed_$ = $JSCompiler_inline_result$jscomp$197_JSCompiler_sources$jscomp$inline_243_JSCompiler_temp$jscomp$196$$;
};
$JSCompiler_prototypeAlias$$.prerenderAllowed = function() {
  return this.$prerenderAllowed_$;
};
function $JSCompiler_StaticMethods_getVideoSourcesForPreconnect_$$($JSCompiler_StaticMethods_getVideoSourcesForPreconnect_$self$$) {
  var $videoSrc$jscomp$1$$ = $JSCompiler_StaticMethods_getVideoSourcesForPreconnect_$self$$.element.getAttribute("src");
  if ($videoSrc$jscomp$1$$) {
    return [$videoSrc$jscomp$1$$];
  }
  var $srcs$$ = [];
  $toArray$$module$src$types$$($childElementsByTag$$module$src$dom$$($JSCompiler_StaticMethods_getVideoSourcesForPreconnect_$self$$.element, "source")).forEach(function($JSCompiler_StaticMethods_getVideoSourcesForPreconnect_$self$$) {
    var $videoSrc$jscomp$1$$ = $JSCompiler_StaticMethods_getVideoSourcesForPreconnect_$self$$.getAttribute("src");
    $videoSrc$jscomp$1$$ && $srcs$$.push($videoSrc$jscomp$1$$);
    var $source$jscomp$20$$ = $JSCompiler_StaticMethods_getVideoSourcesForPreconnect_$self$$.getAttribute("amp-orig-src");
    $source$jscomp$20$$ && $srcs$$.push($source$jscomp$20$$);
  });
  return $srcs$$;
}
$JSCompiler_prototypeAlias$$.isLayoutSupported = function($layout$jscomp$4$$) {
  return "fixed" == $layout$jscomp$4$$ || "fixed-height" == $layout$jscomp$4$$ || "responsive" == $layout$jscomp$4$$ || "fill" == $layout$jscomp$4$$ || "flex-item" == $layout$jscomp$4$$ || "fluid" == $layout$jscomp$4$$ || "intrinsic" == $layout$jscomp$4$$;
};
$JSCompiler_prototypeAlias$$.buildCallback = function() {
  var $element$jscomp$97$$ = this.element;
  $JSCompiler_StaticMethods_configure_$$(this);
  this.$video_$ = $element$jscomp$97$$.ownerDocument.createElement("video");
  this.element.querySelector("source[data-bitrate]") && ($instance$$module$extensions$amp_video$0_1$flexible_bitrate$$ ? $instance$$module$extensions$amp_video$0_1$flexible_bitrate$$ : $instance$$module$extensions$amp_video$0_1$flexible_bitrate$$ = new $BitrateManager$$module$extensions$amp_video$0_1$flexible_bitrate$$(this.win)).manage(this.$video_$);
  var $poster$$ = $element$jscomp$97$$.getAttribute("poster");
  !$poster$$ && $getMode$$module$src$mode$$().development && console.error('No "poster" attribute has been provided for amp-video.');
  this.$video_$.setAttribute("playsinline", "");
  this.$video_$.setAttribute("webkit-playsinline", "");
  this.$video_$.setAttribute("preload", "none");
  this.propagateAttributes($ATTRS_TO_PROPAGATE_ON_BUILD$$module$extensions$amp_video$0_1$amp_video$$, this.$video_$, !0);
  $JSCompiler_StaticMethods_installEventHandlers_$$(this);
  this.applyFillContent(this.$video_$, !0);
  var $JSCompiler_ampdoc$jscomp$inline_248_JSCompiler_fromEl$jscomp$inline_155_title$jscomp$13$$ = this.element, $JSCompiler_holder$jscomp$inline_249_JSCompiler_toEl$jscomp$inline_156_artwork$jscomp$1$$ = this.$video_$;
  $JSCompiler_ampdoc$jscomp$inline_248_JSCompiler_fromEl$jscomp$inline_155_title$jscomp$13$$.hasAttribute("object-fit") && $setStyle$$module$src$style$$($JSCompiler_holder$jscomp$inline_249_JSCompiler_toEl$jscomp$inline_156_artwork$jscomp$1$$, "object-fit", $JSCompiler_ampdoc$jscomp$inline_248_JSCompiler_fromEl$jscomp$inline_155_title$jscomp$13$$.getAttribute("object-fit"));
  $JSCompiler_ampdoc$jscomp$inline_248_JSCompiler_fromEl$jscomp$inline_155_title$jscomp$13$$.hasAttribute("object-position") && $setStyle$$module$src$style$$($JSCompiler_holder$jscomp$inline_249_JSCompiler_toEl$jscomp$inline_156_artwork$jscomp$1$$, "object-position", $JSCompiler_ampdoc$jscomp$inline_248_JSCompiler_fromEl$jscomp$inline_155_title$jscomp$13$$.getAttribute("object-position"));
  $element$jscomp$97$$.appendChild(this.$video_$);
  var $artist$$ = $element$jscomp$97$$.getAttribute("artist");
  $JSCompiler_ampdoc$jscomp$inline_248_JSCompiler_fromEl$jscomp$inline_155_title$jscomp$13$$ = $element$jscomp$97$$.getAttribute("title");
  var $album$$ = $element$jscomp$97$$.getAttribute("album");
  $JSCompiler_holder$jscomp$inline_249_JSCompiler_toEl$jscomp$inline_156_artwork$jscomp$1$$ = $element$jscomp$97$$.getAttribute("artwork");
  this.$metadata_$ = {title:$JSCompiler_ampdoc$jscomp$inline_248_JSCompiler_fromEl$jscomp$inline_155_title$jscomp$13$$ || "", artist:$artist$$ || "", album:$album$$ || "", artwork:[{src:$JSCompiler_holder$jscomp$inline_249_JSCompiler_toEl$jscomp$inline_156_artwork$jscomp$1$$ || $poster$$ || ""}]};
  $JSCompiler_ampdoc$jscomp$inline_248_JSCompiler_fromEl$jscomp$inline_155_title$jscomp$13$$ = $getAmpdoc$$module$src$service$$($element$jscomp$97$$);
  $JSCompiler_holder$jscomp$inline_249_JSCompiler_toEl$jscomp$inline_156_artwork$jscomp$1$$ = $getAmpdocServiceHolder$$module$src$service$$($JSCompiler_ampdoc$jscomp$inline_248_JSCompiler_fromEl$jscomp$inline_155_title$jscomp$13$$);
  var $JSCompiler_services$jscomp$inline_284$$ = $getServices$$module$src$service$$($JSCompiler_holder$jscomp$inline_249_JSCompiler_toEl$jscomp$inline_156_artwork$jscomp$1$$), $JSCompiler_s$jscomp$inline_285$$ = $JSCompiler_services$jscomp$inline_284$$["video-manager"];
  $JSCompiler_s$jscomp$inline_285$$ || ($JSCompiler_s$jscomp$inline_285$$ = $JSCompiler_services$jscomp$inline_284$$["video-manager"] = {obj:null, promise:null, resolve:null, reject:null, context:null, ctor:null});
  $JSCompiler_s$jscomp$inline_285$$.ctor || $JSCompiler_s$jscomp$inline_285$$.obj || ($JSCompiler_s$jscomp$inline_285$$.ctor = $VideoManager$$module$src$service$video_manager_impl$$, $JSCompiler_s$jscomp$inline_285$$.context = $JSCompiler_ampdoc$jscomp$inline_248_JSCompiler_fromEl$jscomp$inline_155_title$jscomp$13$$, $JSCompiler_s$jscomp$inline_285$$.resolve && $getServiceInternal$$module$src$service$$($JSCompiler_holder$jscomp$inline_249_JSCompiler_toEl$jscomp$inline_156_artwork$jscomp$1$$, "video-manager"));
  $getServiceForDoc$$module$src$service$$($element$jscomp$97$$, "video-manager").register(this);
};
function $JSCompiler_StaticMethods_configure_$$($JSCompiler_StaticMethods_configure_$self$$) {
  var $element$jscomp$98$$ = $JSCompiler_StaticMethods_configure_$self$$.element;
  $closestAncestorElementBySelector$$module$src$dom$$($element$jscomp$98$$) && ["i-amphtml-disable-mediasession", "i-amphtml-poolbound"].forEach(function($JSCompiler_StaticMethods_configure_$self$$) {
    $element$jscomp$98$$.classList.add($JSCompiler_StaticMethods_configure_$self$$);
  });
}
$JSCompiler_prototypeAlias$$.mutatedAttributesCallback = function($mutations$$) {
  if (this.$video_$) {
    var $artist$jscomp$1_element$jscomp$99$$ = this.element;
    $mutations$$.src && ($getExistingServiceForDocInEmbedScope$$module$src$service$$(this.element, "url").assertHttpsUrl($artist$jscomp$1_element$jscomp$99$$.getAttribute("src"), $artist$jscomp$1_element$jscomp$99$$), this.propagateAttributes(["src"], this.$video_$));
    var $attrs$$ = $ATTRS_TO_PROPAGATE$$module$extensions$amp_video$0_1$amp_video$$.filter(function($artist$jscomp$1_element$jscomp$99$$) {
      return void 0 !== $mutations$$[$artist$jscomp$1_element$jscomp$99$$];
    });
    this.propagateAttributes($attrs$$, this.$video_$, !0);
    $mutations$$.src && $artist$jscomp$1_element$jscomp$99$$.dispatchCustomEvent("reloaded");
    if ($mutations$$.artwork || $mutations$$.poster) {
      var $album$jscomp$1_artwork$jscomp$2_title$jscomp$14$$ = $artist$jscomp$1_element$jscomp$99$$.getAttribute("artwork"), $poster$jscomp$1$$ = $artist$jscomp$1_element$jscomp$99$$.getAttribute("poster");
      this.$metadata_$.artwork = [{src:$album$jscomp$1_artwork$jscomp$2_title$jscomp$14$$ || $poster$jscomp$1$$ || ""}];
    }
    $mutations$$.album && ($album$jscomp$1_artwork$jscomp$2_title$jscomp$14$$ = $artist$jscomp$1_element$jscomp$99$$.getAttribute("album"), this.$metadata_$.album = $album$jscomp$1_artwork$jscomp$2_title$jscomp$14$$ || "");
    $mutations$$.title && ($album$jscomp$1_artwork$jscomp$2_title$jscomp$14$$ = $artist$jscomp$1_element$jscomp$99$$.getAttribute("title"), this.$metadata_$.title = $album$jscomp$1_artwork$jscomp$2_title$jscomp$14$$ || "");
    $mutations$$.artist && ($artist$jscomp$1_element$jscomp$99$$ = $artist$jscomp$1_element$jscomp$99$$.getAttribute("artist"), this.$metadata_$.artist = $artist$jscomp$1_element$jscomp$99$$ || "");
  }
};
$JSCompiler_prototypeAlias$$.viewportCallback = function($visible$$) {
  this.element.dispatchCustomEvent("amp:video:visibility", {visible:$visible$$});
};
$JSCompiler_prototypeAlias$$.layoutCallback = function() {
  var $$jscomp$this$jscomp$19$$ = this;
  this.$video_$ = this.$video_$;
  if (!this.$video_$.play) {
    return this.toggleFallback(!0), $resolvedPromise$$module$src$resolved_promise$$();
  }
  this.propagateAttributes($ATTRS_TO_PROPAGATE_ON_LAYOUT$$module$extensions$amp_video$0_1$amp_video$$, this.$video_$, !0);
  $JSCompiler_StaticMethods_createPosterForAndroidBug_$$(this);
  $JSCompiler_StaticMethods_onPosterLoaded_$$(this, function() {
    return $JSCompiler_StaticMethods_hideBlurryPlaceholder_$$($$jscomp$this$jscomp$19$$);
  });
  $JSCompiler_StaticMethods_propagateCachedSources_$$(this);
  if ("prerender" == this.getAmpDoc().getVisibilityState()) {
    this.element.hasAttribute("preload") || this.$video_$.setAttribute("preload", "auto");
    var $pendingOriginPromise$$ = this.getAmpDoc().whenFirstVisible().then(function() {
      $JSCompiler_StaticMethods_propagateLayoutChildren_$$($$jscomp$this$jscomp$19$$);
      return $getService$$module$src$service$$($$jscomp$this$jscomp$19$$.win, "timer").promise(1).then(function() {
        if (!$JSCompiler_StaticMethods_isManagedByPool_$$($$jscomp$this$jscomp$19$$)) {
          return $$jscomp$this$jscomp$19$$.loadPromise($$jscomp$this$jscomp$19$$.$video_$);
        }
      });
    });
  } else {
    $JSCompiler_StaticMethods_propagateLayoutChildren_$$(this);
  }
  var $promise$jscomp$2$$ = this.loadPromise(this.$video_$).then(null, function($$jscomp$this$jscomp$19$$) {
    if ($pendingOriginPromise$$) {
      return $pendingOriginPromise$$;
    }
    throw $$jscomp$this$jscomp$19$$;
  }).then(function() {
    $$jscomp$this$jscomp$19$$.element.dispatchCustomEvent("load");
  });
  if ("none" !== this.element.getAttribute("preload")) {
    return $JSCompiler_StaticMethods_isManagedByPool_$$(this) ? $pendingOriginPromise$$ : $promise$jscomp$2$$;
  }
};
function $JSCompiler_StaticMethods_handleMediaError_$$($JSCompiler_StaticMethods_handleMediaError_$self$$, $event$jscomp$13$$) {
  if ($JSCompiler_StaticMethods_handleMediaError_$self$$.$video_$.error && $JSCompiler_StaticMethods_handleMediaError_$self$$.$video_$.error.code == MediaError.MEDIA_ERR_DECODE && ($user$$module$src$log$$().error("amp-video", "Decode error in " + $JSCompiler_StaticMethods_handleMediaError_$self$$.$video_$.currentSrc, $JSCompiler_StaticMethods_handleMediaError_$self$$.element), !$JSCompiler_StaticMethods_handleMediaError_$self$$.$video_$.src)) {
    var $sourceCount$$ = 0, $currentSource$$ = $childElement$$module$src$dom$$($JSCompiler_StaticMethods_handleMediaError_$self$$.$video_$, function($event$jscomp$13$$) {
      if ("SOURCE" != $event$jscomp$13$$.tagName) {
        return !1;
      }
      $sourceCount$$++;
      return $event$jscomp$13$$.src == $JSCompiler_StaticMethods_handleMediaError_$self$$.$video_$.currentSrc;
    });
    0 != $sourceCount$$ && ($currentSource$$, $removeElement$$module$src$dom$$($currentSource$$), $event$jscomp$13$$.stopImmediatePropagation(), $JSCompiler_StaticMethods_handleMediaError_$self$$.$video_$.load(), $JSCompiler_StaticMethods_handleMediaError_$self$$.play(!1));
  }
}
function $JSCompiler_StaticMethods_propagateCachedSources_$$($JSCompiler_StaticMethods_propagateCachedSources_$self$$) {
  var $sources$jscomp$1$$ = $toArray$$module$src$types$$($childElementsByTag$$module$src$dom$$($JSCompiler_StaticMethods_propagateCachedSources_$self$$.element, "source"));
  if ($JSCompiler_StaticMethods_propagateCachedSources_$self$$.element.hasAttribute("src") && $JSCompiler_StaticMethods_isCachedByCDN_$$($JSCompiler_StaticMethods_propagateCachedSources_$self$$, $JSCompiler_StaticMethods_propagateCachedSources_$self$$.element)) {
    var $src$jscomp$7$$ = $JSCompiler_StaticMethods_propagateCachedSources_$self$$.element.getAttribute("src"), $type$jscomp$149$$ = $JSCompiler_StaticMethods_propagateCachedSources_$self$$.element.getAttribute("type"), $srcSource$$ = $JSCompiler_StaticMethods_createSourceElement_$$($JSCompiler_StaticMethods_propagateCachedSources_$self$$, $src$jscomp$7$$, $type$jscomp$149$$), $ampOrigSrc$$ = $JSCompiler_StaticMethods_propagateCachedSources_$self$$.element.getAttribute("amp-orig-src");
    $srcSource$$.setAttribute("amp-orig-src", $ampOrigSrc$$);
    $JSCompiler_StaticMethods_propagateCachedSources_$self$$.element.removeAttribute("src");
    $JSCompiler_StaticMethods_propagateCachedSources_$self$$.element.removeAttribute("type");
    $sources$jscomp$1$$.unshift($srcSource$$);
  }
  $sources$jscomp$1$$.forEach(function($sources$jscomp$1$$) {
    $JSCompiler_StaticMethods_isCachedByCDN_$$($JSCompiler_StaticMethods_propagateCachedSources_$self$$, $sources$jscomp$1$$) && $JSCompiler_StaticMethods_propagateCachedSources_$self$$.$video_$.appendChild($sources$jscomp$1$$);
  });
  $JSCompiler_StaticMethods_propagateCachedSources_$self$$.$video_$.changedSources && $JSCompiler_StaticMethods_propagateCachedSources_$self$$.$video_$.changedSources();
}
function $JSCompiler_StaticMethods_propagateLayoutChildren_$$($JSCompiler_StaticMethods_propagateLayoutChildren_$self$$) {
  var $sources$jscomp$2$$ = $toArray$$module$src$types$$($childElementsByTag$$module$src$dom$$($JSCompiler_StaticMethods_propagateLayoutChildren_$self$$.element, "source")), $element$jscomp$100$$ = $JSCompiler_StaticMethods_propagateLayoutChildren_$self$$.element, $urlService$jscomp$2$$ = $getExistingServiceForDocInEmbedScope$$module$src$service$$($JSCompiler_StaticMethods_propagateLayoutChildren_$self$$.element, "url");
  $element$jscomp$100$$.hasAttribute("src") && !$JSCompiler_StaticMethods_isCachedByCDN_$$($JSCompiler_StaticMethods_propagateLayoutChildren_$self$$, $element$jscomp$100$$) && ($urlService$jscomp$2$$.assertHttpsUrl($element$jscomp$100$$.getAttribute("src"), $element$jscomp$100$$), $JSCompiler_StaticMethods_propagateLayoutChildren_$self$$.propagateAttributes(["src"], $JSCompiler_StaticMethods_propagateLayoutChildren_$self$$.$video_$));
  $sources$jscomp$2$$.forEach(function($sources$jscomp$2$$) {
    $JSCompiler_StaticMethods_isCachedByCDN_$$($JSCompiler_StaticMethods_propagateLayoutChildren_$self$$, $sources$jscomp$2$$);
    $urlService$jscomp$2$$.assertHttpsUrl($sources$jscomp$2$$.getAttribute("src"), $sources$jscomp$2$$);
    $JSCompiler_StaticMethods_propagateLayoutChildren_$self$$.$video_$.appendChild($sources$jscomp$2$$);
  });
  $toArray$$module$src$types$$($JSCompiler_StaticMethods_propagateLayoutChildren_$self$$.$video_$.querySelectorAll("[amp-orig-src]")).forEach(function($sources$jscomp$2$$) {
    var $element$jscomp$100$$ = $sources$jscomp$2$$.getAttribute("amp-orig-src"), $urlService$jscomp$2$$ = $sources$jscomp$2$$.getAttribute("type"), $cachedSource$$ = $JSCompiler_StaticMethods_createSourceElement_$$($JSCompiler_StaticMethods_propagateLayoutChildren_$self$$, $element$jscomp$100$$, $urlService$jscomp$2$$);
    ($element$jscomp$100$$ = $sources$jscomp$2$$.getAttribute("data-bitrate")) && $cachedSource$$.setAttribute("data-bitrate", $element$jscomp$100$$);
    $insertAfterOrAtStart$$module$src$dom$$($JSCompiler_StaticMethods_propagateLayoutChildren_$self$$.$video_$, $cachedSource$$, $sources$jscomp$2$$);
  });
  $toArray$$module$src$types$$($childElementsByTag$$module$src$dom$$($element$jscomp$100$$, "track")).forEach(function($sources$jscomp$2$$) {
    $JSCompiler_StaticMethods_propagateLayoutChildren_$self$$.$video_$.appendChild($sources$jscomp$2$$);
  });
  $JSCompiler_StaticMethods_propagateLayoutChildren_$self$$.$video_$.changedSources && $JSCompiler_StaticMethods_propagateLayoutChildren_$self$$.$video_$.changedSources();
}
function $JSCompiler_StaticMethods_isCachedByCDN_$$($JSCompiler_StaticMethods_isCachedByCDN_$self$$, $element$jscomp$101$$) {
  var $src$jscomp$8$$ = $element$jscomp$101$$.getAttribute("src");
  return $element$jscomp$101$$.hasAttribute("amp-orig-src") && $getExistingServiceForDocInEmbedScope$$module$src$service$$($JSCompiler_StaticMethods_isCachedByCDN_$self$$.element, "url").isProxyOrigin($src$jscomp$8$$);
}
function $JSCompiler_StaticMethods_createSourceElement_$$($JSCompiler_StaticMethods_createSourceElement_$self_source$jscomp$24$$, $src$jscomp$9$$, $type$jscomp$150$$) {
  var $element$jscomp$102$$ = $JSCompiler_StaticMethods_createSourceElement_$self_source$jscomp$24$$.element;
  $getExistingServiceForDocInEmbedScope$$module$src$service$$($JSCompiler_StaticMethods_createSourceElement_$self_source$jscomp$24$$.element, "url").assertHttpsUrl($src$jscomp$9$$, $element$jscomp$102$$);
  $JSCompiler_StaticMethods_createSourceElement_$self_source$jscomp$24$$ = $element$jscomp$102$$.ownerDocument.createElement("source");
  $JSCompiler_StaticMethods_createSourceElement_$self_source$jscomp$24$$.setAttribute("src", $src$jscomp$9$$);
  $type$jscomp$150$$ && $JSCompiler_StaticMethods_createSourceElement_$self_source$jscomp$24$$.setAttribute("type", $type$jscomp$150$$);
  return $JSCompiler_StaticMethods_createSourceElement_$self_source$jscomp$24$$;
}
function $JSCompiler_StaticMethods_installEventHandlers_$$($JSCompiler_StaticMethods_installEventHandlers_$self$$) {
  var $video$jscomp$28$$ = $JSCompiler_StaticMethods_installEventHandlers_$self$$.$video_$;
  $video$jscomp$28$$.addEventListener("error", function($video$jscomp$28$$) {
    return $JSCompiler_StaticMethods_handleMediaError_$$($JSCompiler_StaticMethods_installEventHandlers_$self$$, $video$jscomp$28$$);
  });
  var $forwardEventsUnlisten$$ = $JSCompiler_StaticMethods_installEventHandlers_$self$$.forwardEvents(["ended", "loadedmetadata", "pause", "playing", "play"], $video$jscomp$28$$), $mutedOrUnmutedEventUnlisten$$ = $listen$$module$src$event_helper$$($video$jscomp$28$$, "volumechange", function() {
    var $video$jscomp$28$$ = $JSCompiler_StaticMethods_installEventHandlers_$self$$.$video_$.muted;
    $JSCompiler_StaticMethods_installEventHandlers_$self$$.$muted_$ != $video$jscomp$28$$ && ($JSCompiler_StaticMethods_installEventHandlers_$self$$.$muted_$ = $video$jscomp$28$$, $JSCompiler_StaticMethods_installEventHandlers_$self$$.element.dispatchCustomEvent($JSCompiler_StaticMethods_installEventHandlers_$self$$.$muted_$ ? "muted" : "unmuted"));
  });
  $JSCompiler_StaticMethods_installEventHandlers_$self$$.$unlisteners_$.push($forwardEventsUnlisten$$, $mutedOrUnmutedEventUnlisten$$);
}
$JSCompiler_prototypeAlias$$.resetOnDomChange = function() {
  var $JSCompiler_fallbackResult$jscomp$inline_255_JSCompiler_inline_result$jscomp$29_JSCompiler_parent$jscomp$inline_160$$ = this.element;
  /^[\w-]+$/.test("video");
  (void 0 !== $scopeSelectorSupported$$module$src$css$$ ? $scopeSelectorSupported$$module$src$css$$ : $scopeSelectorSupported$$module$src$css$$ = $testScopeSelector$$module$src$css$$($JSCompiler_fallbackResult$jscomp$inline_255_JSCompiler_inline_result$jscomp$29_JSCompiler_parent$jscomp$inline_160$$)) ? $JSCompiler_fallbackResult$jscomp$inline_255_JSCompiler_inline_result$jscomp$29_JSCompiler_parent$jscomp$inline_160$$ = $JSCompiler_fallbackResult$jscomp$inline_255_JSCompiler_inline_result$jscomp$29_JSCompiler_parent$jscomp$inline_160$$.querySelector("> video".replace(/^|,/g, 
  "$&:scope ")) : ($JSCompiler_fallbackResult$jscomp$inline_255_JSCompiler_inline_result$jscomp$29_JSCompiler_parent$jscomp$inline_160$$ = $scopedQuerySelectionFallback$$module$src$dom$$($JSCompiler_fallbackResult$jscomp$inline_255_JSCompiler_inline_result$jscomp$29_JSCompiler_parent$jscomp$inline_160$$, "> video"), $JSCompiler_fallbackResult$jscomp$inline_255_JSCompiler_inline_result$jscomp$29_JSCompiler_parent$jscomp$inline_160$$ = void 0 === $JSCompiler_fallbackResult$jscomp$inline_255_JSCompiler_inline_result$jscomp$29_JSCompiler_parent$jscomp$inline_160$$[0] ? 
  null : $JSCompiler_fallbackResult$jscomp$inline_255_JSCompiler_inline_result$jscomp$29_JSCompiler_parent$jscomp$inline_160$$[0]);
  for (this.$video_$ = $JSCompiler_fallbackResult$jscomp$inline_255_JSCompiler_inline_result$jscomp$29_JSCompiler_parent$jscomp$inline_160$$; this.$unlisteners_$.length;) {
    this.$unlisteners_$.pop().call();
  }
  $JSCompiler_StaticMethods_installEventHandlers_$$(this);
};
$JSCompiler_prototypeAlias$$.pauseCallback = function() {
  this.$video_$ && this.$video_$.pause();
};
$JSCompiler_prototypeAlias$$.supportsPlatform = function() {
  return !!this.$video_$.play;
};
$JSCompiler_prototypeAlias$$.isInteractive = function() {
  return this.element.hasAttribute("controls");
};
$JSCompiler_prototypeAlias$$.play = function() {
  var $ret$$ = this.$video_$.play();
  $ret$$ && $ret$$.catch && $ret$$.catch(function() {
  });
};
function $JSCompiler_StaticMethods_createPosterForAndroidBug_$$($JSCompiler_StaticMethods_createPosterForAndroidBug_$self$$) {
  if ($Services$$module$src$services$platformFor$$($JSCompiler_StaticMethods_createPosterForAndroidBug_$self$$.win).isAndroid()) {
    var $element$jscomp$104$$ = $JSCompiler_StaticMethods_createPosterForAndroidBug_$self$$.element;
    if (!$element$jscomp$104$$.querySelector("i-amphtml-poster")) {
      var $poster$jscomp$2$$ = $htmlFor$$module$src$static_template$$($element$jscomp$104$$)($_template$$module$extensions$amp_video$0_1$amp_video$$), $src$jscomp$10$$ = $element$jscomp$104$$.getAttribute("poster");
      $poster$jscomp$2$$.style.display = "block";
      $setStyles$$module$src$style$$($poster$jscomp$2$$, {"background-image":"url(" + $src$jscomp$10$$ + ")", "background-size":"cover", "background-position":"center"});
      $poster$jscomp$2$$.classList.add("i-amphtml-android-poster-bug");
      $JSCompiler_StaticMethods_createPosterForAndroidBug_$self$$.applyFillContent($poster$jscomp$2$$);
      $element$jscomp$104$$.appendChild($poster$jscomp$2$$);
    }
  }
}
$JSCompiler_prototypeAlias$$.pause = function() {
  this.$video_$.pause();
};
$JSCompiler_prototypeAlias$$.mute = function() {
  $JSCompiler_StaticMethods_isManagedByPool_$$(this) || (this.$video_$.muted = !0);
};
$JSCompiler_prototypeAlias$$.unmute = function() {
  $JSCompiler_StaticMethods_isManagedByPool_$$(this) || (this.$video_$.muted = !1);
};
function $JSCompiler_StaticMethods_isManagedByPool_$$($JSCompiler_StaticMethods_isManagedByPool_$self$$) {
  return $JSCompiler_StaticMethods_isManagedByPool_$self$$.element.classList.contains("i-amphtml-poolbound");
}
$JSCompiler_prototypeAlias$$.showControls = function() {
  this.$video_$.controls = !0;
};
$JSCompiler_prototypeAlias$$.hideControls = function() {
  this.$video_$.controls = !1;
};
$JSCompiler_prototypeAlias$$.fullscreenEnter = function() {
  var $JSCompiler_element$jscomp$inline_169$$ = this.$video_$, $JSCompiler_requestFs$jscomp$inline_170$$ = $JSCompiler_element$jscomp$inline_169$$.requestFullscreen || $JSCompiler_element$jscomp$inline_169$$.requestFullScreen || $JSCompiler_element$jscomp$inline_169$$.webkitRequestFullscreen || $JSCompiler_element$jscomp$inline_169$$.webkitEnterFullscreen || $JSCompiler_element$jscomp$inline_169$$.msRequestFullscreen || $JSCompiler_element$jscomp$inline_169$$.mozRequestFullScreen;
  $JSCompiler_requestFs$jscomp$inline_170$$ && $JSCompiler_requestFs$jscomp$inline_170$$.call($JSCompiler_element$jscomp$inline_169$$);
};
$JSCompiler_prototypeAlias$$.fullscreenExit = function() {
  var $JSCompiler_element$jscomp$inline_172_JSCompiler_ownerDocument$jscomp$inline_174$$ = this.$video_$, $JSCompiler_docBoundExit$jscomp$inline_175_JSCompiler_elementBoundExit$jscomp$inline_173$$ = $JSCompiler_element$jscomp$inline_172_JSCompiler_ownerDocument$jscomp$inline_174$$.cancelFullScreen || $JSCompiler_element$jscomp$inline_172_JSCompiler_ownerDocument$jscomp$inline_174$$.exitFullscreen || $JSCompiler_element$jscomp$inline_172_JSCompiler_ownerDocument$jscomp$inline_174$$.webkitExitFullscreen || 
  $JSCompiler_element$jscomp$inline_172_JSCompiler_ownerDocument$jscomp$inline_174$$.webkitCancelFullScreen || $JSCompiler_element$jscomp$inline_172_JSCompiler_ownerDocument$jscomp$inline_174$$.mozCancelFullScreen || $JSCompiler_element$jscomp$inline_172_JSCompiler_ownerDocument$jscomp$inline_174$$.msExitFullscreen;
  $JSCompiler_docBoundExit$jscomp$inline_175_JSCompiler_elementBoundExit$jscomp$inline_173$$ ? $JSCompiler_docBoundExit$jscomp$inline_175_JSCompiler_elementBoundExit$jscomp$inline_173$$.call($JSCompiler_element$jscomp$inline_172_JSCompiler_ownerDocument$jscomp$inline_174$$) : ($JSCompiler_element$jscomp$inline_172_JSCompiler_ownerDocument$jscomp$inline_174$$ = $JSCompiler_element$jscomp$inline_172_JSCompiler_ownerDocument$jscomp$inline_174$$.ownerDocument) && ($JSCompiler_docBoundExit$jscomp$inline_175_JSCompiler_elementBoundExit$jscomp$inline_173$$ = 
  $JSCompiler_element$jscomp$inline_172_JSCompiler_ownerDocument$jscomp$inline_174$$.cancelFullScreen || $JSCompiler_element$jscomp$inline_172_JSCompiler_ownerDocument$jscomp$inline_174$$.exitFullscreen || $JSCompiler_element$jscomp$inline_172_JSCompiler_ownerDocument$jscomp$inline_174$$.webkitExitFullscreen || $JSCompiler_element$jscomp$inline_172_JSCompiler_ownerDocument$jscomp$inline_174$$.webkitCancelFullScreen || $JSCompiler_element$jscomp$inline_172_JSCompiler_ownerDocument$jscomp$inline_174$$.mozCancelFullScreen || 
  $JSCompiler_element$jscomp$inline_172_JSCompiler_ownerDocument$jscomp$inline_174$$.msExitFullscreen) && $JSCompiler_docBoundExit$jscomp$inline_175_JSCompiler_elementBoundExit$jscomp$inline_173$$.call($JSCompiler_element$jscomp$inline_172_JSCompiler_ownerDocument$jscomp$inline_174$$);
};
$JSCompiler_prototypeAlias$$.isFullscreen = function() {
  var $JSCompiler_element$jscomp$inline_177_JSCompiler_inline_result$jscomp$32$$ = this.$video_$;
  var $JSCompiler_ownerDocument$jscomp$inline_179_JSCompiler_webkitDisplayingFullscreen$jscomp$inline_178$$ = $JSCompiler_element$jscomp$inline_177_JSCompiler_inline_result$jscomp$32$$.webkitDisplayingFullscreen;
  $JSCompiler_element$jscomp$inline_177_JSCompiler_inline_result$jscomp$32$$ = void 0 !== $JSCompiler_ownerDocument$jscomp$inline_179_JSCompiler_webkitDisplayingFullscreen$jscomp$inline_178$$ ? $JSCompiler_ownerDocument$jscomp$inline_179_JSCompiler_webkitDisplayingFullscreen$jscomp$inline_178$$ : ($JSCompiler_ownerDocument$jscomp$inline_179_JSCompiler_webkitDisplayingFullscreen$jscomp$inline_178$$ = $JSCompiler_element$jscomp$inline_177_JSCompiler_inline_result$jscomp$32$$.ownerDocument) ? ($JSCompiler_ownerDocument$jscomp$inline_179_JSCompiler_webkitDisplayingFullscreen$jscomp$inline_178$$.fullscreenElement || 
  $JSCompiler_ownerDocument$jscomp$inline_179_JSCompiler_webkitDisplayingFullscreen$jscomp$inline_178$$.webkitFullscreenElement || $JSCompiler_ownerDocument$jscomp$inline_179_JSCompiler_webkitDisplayingFullscreen$jscomp$inline_178$$.mozFullScreenElement || $JSCompiler_ownerDocument$jscomp$inline_179_JSCompiler_webkitDisplayingFullscreen$jscomp$inline_178$$.webkitCurrentFullScreenElement) == $JSCompiler_element$jscomp$inline_177_JSCompiler_inline_result$jscomp$32$$ : !1;
  return $JSCompiler_element$jscomp$inline_177_JSCompiler_inline_result$jscomp$32$$;
};
$JSCompiler_prototypeAlias$$.getMetadata = function() {
  return this.$metadata_$;
};
$JSCompiler_prototypeAlias$$.preimplementsMediaSessionAPI = function() {
  return !1;
};
$JSCompiler_prototypeAlias$$.preimplementsAutoFullscreen = function() {
  return !1;
};
$JSCompiler_prototypeAlias$$.getCurrentTime = function() {
  return this.$video_$.currentTime;
};
$JSCompiler_prototypeAlias$$.getDuration = function() {
  return this.$video_$.duration;
};
$JSCompiler_prototypeAlias$$.getPlayedRanges = function() {
  for (var $played$$ = this.$video_$.played, $length$jscomp$22$$ = $played$$.length, $ranges$$ = [], $i$jscomp$33$$ = 0; $i$jscomp$33$$ < $length$jscomp$22$$; $i$jscomp$33$$++) {
    $ranges$$.push([$played$$.start($i$jscomp$33$$), $played$$.end($i$jscomp$33$$)]);
  }
  return $ranges$$;
};
$JSCompiler_prototypeAlias$$.firstLayoutCompleted = function() {
  $JSCompiler_StaticMethods_hideBlurryPlaceholder_$$(this) || this.togglePlaceholder(!1);
  var $JSCompiler_poster$jscomp$inline_182$$ = this.element.querySelector("i-amphtml-poster");
  $JSCompiler_poster$jscomp$inline_182$$ && $removeElement$$module$src$dom$$($JSCompiler_poster$jscomp$inline_182$$);
};
function $JSCompiler_StaticMethods_hideBlurryPlaceholder_$$($JSCompiler_StaticMethods_hideBlurryPlaceholder_$self_JSCompiler_styles$jscomp$inline_185$$) {
  var $placeholder$$ = $JSCompiler_StaticMethods_hideBlurryPlaceholder_$self_JSCompiler_styles$jscomp$inline_185$$.getPlaceholder();
  if ($placeholder$$ && $placeholder$$.classList.contains("i-amphtml-blurry-placeholder")) {
    $JSCompiler_StaticMethods_hideBlurryPlaceholder_$self_JSCompiler_styles$jscomp$inline_185$$ = {opacity:0.0};
    var $JSCompiler_style$jscomp$inline_186$$ = $placeholder$$.style, $JSCompiler_k$jscomp$inline_187$$;
    for ($JSCompiler_k$jscomp$inline_187$$ in $JSCompiler_StaticMethods_hideBlurryPlaceholder_$self_JSCompiler_styles$jscomp$inline_185$$) {
      $JSCompiler_style$jscomp$inline_186$$.setProperty($getVendorJsPropertyName$$module$src$style$$($JSCompiler_style$jscomp$inline_186$$, $JSCompiler_k$jscomp$inline_187$$), $JSCompiler_StaticMethods_hideBlurryPlaceholder_$self_JSCompiler_styles$jscomp$inline_185$$[$JSCompiler_k$jscomp$inline_187$$].toString(), "important");
    }
    return !0;
  }
  return !1;
}
function $JSCompiler_StaticMethods_onPosterLoaded_$$($JSCompiler_StaticMethods_onPosterLoaded_$self_poster$jscomp$4$$, $callback$jscomp$60$$) {
  if ($JSCompiler_StaticMethods_onPosterLoaded_$self_poster$jscomp$4$$ = $JSCompiler_StaticMethods_onPosterLoaded_$self_poster$jscomp$4$$.$video_$.getAttribute("poster")) {
    var $posterImg$$ = new Image;
    $posterImg$$.onload = $callback$jscomp$60$$;
    $posterImg$$.src = $JSCompiler_StaticMethods_onPosterLoaded_$self_poster$jscomp$4$$;
  }
}
$JSCompiler_prototypeAlias$$.seekTo = function($timeSeconds$$) {
  this.$video_$.currentTime = $timeSeconds$$;
};
(function($AMP$jscomp$1$$) {
  $AMP$jscomp$1$$.registerElement("amp-video", $AmpVideo$$module$extensions$amp_video$0_1$amp_video$$);
})(self.AMP);

})});

//# sourceMappingURL=amp-video-0.1.js.map
