(self.AMP=self.AMP||[]).push({n:"amp-iframe",v:"2007210308000",f:(function(AMP,_){
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
    var $JSCompiler_x$jscomp$inline_49$$ = {a:!0}, $JSCompiler_y$jscomp$inline_50$$ = {};
    try {
      $JSCompiler_y$jscomp$inline_50$$.__proto__ = $JSCompiler_x$jscomp$inline_49$$;
      $JSCompiler_inline_result$jscomp$22$$ = $JSCompiler_y$jscomp$inline_50$$.a;
      break a;
    } catch ($JSCompiler_e$jscomp$inline_51$$) {
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
var $env$$module$src$config$$ = self.AMP_CONFIG || {}, $cdnProxyRegex$$module$src$config$$ = ("string" == typeof $env$$module$src$config$$.cdnProxyRegex ? new RegExp($env$$module$src$config$$.cdnProxyRegex) : $env$$module$src$config$$.cdnProxyRegex) || /^https:\/\/([a-zA-Z0-9_-]+\.)?cdn\.ampproject\.org$/;
function $getMetaUrl$$module$src$config$$($name$jscomp$72$$) {
  if (!self.document || !self.document.head || self.location && $cdnProxyRegex$$module$src$config$$.test(self.location.origin)) {
    return null;
  }
  var $metaEl$$ = self.document.head.querySelector('meta[name="' + $name$jscomp$72$$ + '"]');
  return $metaEl$$ && $metaEl$$.getAttribute("content") || null;
}
var $urls$$module$src$config$$ = {thirdParty:$env$$module$src$config$$.thirdPartyUrl || "https://3p.ampproject.net", thirdPartyFrameHost:$env$$module$src$config$$.thirdPartyFrameHost || "ampproject.net", thirdPartyFrameRegex:("string" == typeof $env$$module$src$config$$.thirdPartyFrameRegex ? new RegExp($env$$module$src$config$$.thirdPartyFrameRegex) : $env$$module$src$config$$.thirdPartyFrameRegex) || /^d-\d+\.ampproject\.net$/, cdn:$env$$module$src$config$$.cdnUrl || $getMetaUrl$$module$src$config$$("runtime-host") || 
"https://cdn.ampproject.org", cdnProxyRegex:$cdnProxyRegex$$module$src$config$$, localhostRegex:/^https?:\/\/localhost(:\d+)?$/, errorReporting:$env$$module$src$config$$.errorReportingUrl || "https://us-central1-amp-error-reporting.cloudfunctions.net/r", betaErrorReporting:$env$$module$src$config$$.betaErrorReportingUrl || "https://us-central1-amp-error-reporting.cloudfunctions.net/r-beta", localDev:$env$$module$src$config$$.localDev || !1, trustedViewerHosts:[/(^|\.)google\.(com?|[a-z]{2}|com?\.[a-z]{2}|cat)$/, 
/(^|\.)gmail\.(com|dev)$/], geoApi:$env$$module$src$config$$.geoApiUrl || $getMetaUrl$$module$src$config$$("amp-geo-api")};
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
function $userAssert$$module$src$log$$($shouldBeTrueish$jscomp$3$$, $opt_message$jscomp$15$$, $opt_1$jscomp$1$$, $opt_2$jscomp$1$$, $opt_3$jscomp$1$$) {
  $user$$module$src$log$$().assert($shouldBeTrueish$jscomp$3$$, $opt_message$jscomp$15$$, $opt_1$jscomp$1$$, $opt_2$jscomp$1$$, $opt_3$jscomp$1$$, void 0, void 0, void 0, void 0, void 0, void 0);
}
;var $hasOwn_$$module$src$utils$object$$ = Object.prototype.hasOwnProperty;
function $dict$$module$src$utils$object$$($opt_initial$jscomp$1$$) {
  return $opt_initial$jscomp$1$$ || {};
}
;function $LruCache$$module$src$utils$lru_cache$$() {
  this.$capacity_$ = 100;
  this.$access_$ = this.$size_$ = 0;
  this.$cache_$ = Object.create(null);
}
$LruCache$$module$src$utils$lru_cache$$.prototype.has = function($key$jscomp$44$$) {
  return !!this.$cache_$[$key$jscomp$44$$];
};
$LruCache$$module$src$utils$lru_cache$$.prototype.get = function($key$jscomp$45$$) {
  var $cacheable$$ = this.$cache_$[$key$jscomp$45$$];
  if ($cacheable$$) {
    return $cacheable$$.access = ++this.$access_$, $cacheable$$.payload;
  }
};
$LruCache$$module$src$utils$lru_cache$$.prototype.put = function($JSCompiler_cache$jscomp$inline_57_key$jscomp$46$$, $payload$$) {
  this.has($JSCompiler_cache$jscomp$inline_57_key$jscomp$46$$) || this.$size_$++;
  this.$cache_$[$JSCompiler_cache$jscomp$inline_57_key$jscomp$46$$] = {payload:$payload$$, access:this.$access_$};
  if (!(this.$size_$ <= this.$capacity_$)) {
    $dev$$module$src$log$$().warn("lru-cache", "Trimming LRU cache");
    $JSCompiler_cache$jscomp$inline_57_key$jscomp$46$$ = this.$cache_$;
    var $JSCompiler_oldest$jscomp$inline_58$$ = this.$access_$ + 1, $JSCompiler_key$jscomp$inline_60$$;
    for ($JSCompiler_key$jscomp$inline_60$$ in $JSCompiler_cache$jscomp$inline_57_key$jscomp$46$$) {
      var $JSCompiler_access$jscomp$inline_61$$ = $JSCompiler_cache$jscomp$inline_57_key$jscomp$46$$[$JSCompiler_key$jscomp$inline_60$$].access;
      if ($JSCompiler_access$jscomp$inline_61$$ < $JSCompiler_oldest$jscomp$inline_58$$) {
        $JSCompiler_oldest$jscomp$inline_58$$ = $JSCompiler_access$jscomp$inline_61$$;
        var $JSCompiler_oldestKey$jscomp$inline_59$$ = $JSCompiler_key$jscomp$inline_60$$;
      }
    }
    void 0 !== $JSCompiler_oldestKey$jscomp$inline_59$$ && (delete $JSCompiler_cache$jscomp$inline_57_key$jscomp$46$$[$JSCompiler_oldestKey$jscomp$inline_59$$], this.$size_$--);
  }
};
function $endsWith$$module$src$string$$($string$jscomp$5$$, $suffix$jscomp$1$$) {
  var $index$jscomp$74$$ = $string$jscomp$5$$.length - $suffix$jscomp$1$$.length;
  return 0 <= $index$jscomp$74$$ && $string$jscomp$5$$.indexOf($suffix$jscomp$1$$, $index$jscomp$74$$) == $index$jscomp$74$$;
}
function $startsWith$$module$src$string$$($string$jscomp$6$$, $prefix$jscomp$4$$) {
  return $prefix$jscomp$4$$.length > $string$jscomp$6$$.length ? !1 : 0 == $string$jscomp$6$$.lastIndexOf($prefix$jscomp$4$$, 0);
}
;$dict$$module$src$utils$object$$({c:!0, v:!0, a:!0, ad:!0, action:!0});
var $a$$module$src$url$$, $cache$$module$src$url$$;
function $parseUrlDeprecated$$module$src$url$$($JSCompiler_inline_result$jscomp$25_url$jscomp$24$$) {
  $a$$module$src$url$$ || ($a$$module$src$url$$ = self.document.createElement("a"), $cache$$module$src$url$$ = self.__AMP_URL_CACHE || (self.__AMP_URL_CACHE = new $LruCache$$module$src$utils$lru_cache$$));
  var $JSCompiler_opt_cache$jscomp$inline_64$$ = $cache$$module$src$url$$, $JSCompiler_a$jscomp$inline_65$$ = $a$$module$src$url$$;
  if ($JSCompiler_opt_cache$jscomp$inline_64$$ && $JSCompiler_opt_cache$jscomp$inline_64$$.has($JSCompiler_inline_result$jscomp$25_url$jscomp$24$$)) {
    $JSCompiler_inline_result$jscomp$25_url$jscomp$24$$ = $JSCompiler_opt_cache$jscomp$inline_64$$.get($JSCompiler_inline_result$jscomp$25_url$jscomp$24$$);
  } else {
    $JSCompiler_a$jscomp$inline_65$$.href = $JSCompiler_inline_result$jscomp$25_url$jscomp$24$$;
    $JSCompiler_a$jscomp$inline_65$$.protocol || ($JSCompiler_a$jscomp$inline_65$$.href = $JSCompiler_a$jscomp$inline_65$$.href);
    var $JSCompiler_info$jscomp$inline_66$$ = {href:$JSCompiler_a$jscomp$inline_65$$.href, protocol:$JSCompiler_a$jscomp$inline_65$$.protocol, host:$JSCompiler_a$jscomp$inline_65$$.host, hostname:$JSCompiler_a$jscomp$inline_65$$.hostname, port:"0" == $JSCompiler_a$jscomp$inline_65$$.port ? "" : $JSCompiler_a$jscomp$inline_65$$.port, pathname:$JSCompiler_a$jscomp$inline_65$$.pathname, search:$JSCompiler_a$jscomp$inline_65$$.search, hash:$JSCompiler_a$jscomp$inline_65$$.hash, origin:null};
    "/" !== $JSCompiler_info$jscomp$inline_66$$.pathname[0] && ($JSCompiler_info$jscomp$inline_66$$.pathname = "/" + $JSCompiler_info$jscomp$inline_66$$.pathname);
    if ("http:" == $JSCompiler_info$jscomp$inline_66$$.protocol && 80 == $JSCompiler_info$jscomp$inline_66$$.port || "https:" == $JSCompiler_info$jscomp$inline_66$$.protocol && 443 == $JSCompiler_info$jscomp$inline_66$$.port) {
      $JSCompiler_info$jscomp$inline_66$$.port = "", $JSCompiler_info$jscomp$inline_66$$.host = $JSCompiler_info$jscomp$inline_66$$.hostname;
    }
    $JSCompiler_info$jscomp$inline_66$$.origin = $JSCompiler_a$jscomp$inline_65$$.origin && "null" != $JSCompiler_a$jscomp$inline_65$$.origin ? $JSCompiler_a$jscomp$inline_65$$.origin : "data:" != $JSCompiler_info$jscomp$inline_66$$.protocol && $JSCompiler_info$jscomp$inline_66$$.host ? $JSCompiler_info$jscomp$inline_66$$.protocol + "//" + $JSCompiler_info$jscomp$inline_66$$.host : $JSCompiler_info$jscomp$inline_66$$.href;
    $JSCompiler_opt_cache$jscomp$inline_64$$ && $JSCompiler_opt_cache$jscomp$inline_64$$.put($JSCompiler_inline_result$jscomp$25_url$jscomp$24$$, $JSCompiler_info$jscomp$inline_66$$);
    $JSCompiler_inline_result$jscomp$25_url$jscomp$24$$ = $JSCompiler_info$jscomp$inline_66$$;
  }
  return $JSCompiler_inline_result$jscomp$25_url$jscomp$24$$;
}
;function $experimentToggles$$module$src$experiments$$($JSCompiler_params$jscomp$inline_192_win$jscomp$12$$) {
  if ($JSCompiler_params$jscomp$inline_192_win$jscomp$12$$.__AMP__EXPERIMENT_TOGGLES) {
    return $JSCompiler_params$jscomp$inline_192_win$jscomp$12$$.__AMP__EXPERIMENT_TOGGLES;
  }
  $JSCompiler_params$jscomp$inline_192_win$jscomp$12$$.__AMP__EXPERIMENT_TOGGLES = Object.create(null);
  var $toggles$jscomp$2$$ = $JSCompiler_params$jscomp$inline_192_win$jscomp$12$$.__AMP__EXPERIMENT_TOGGLES;
  if ($JSCompiler_params$jscomp$inline_192_win$jscomp$12$$.AMP_CONFIG) {
    for (var $allowed$3_experimentId$jscomp$2_i$jscomp$15$$ in $JSCompiler_params$jscomp$inline_192_win$jscomp$12$$.AMP_CONFIG) {
      var $frequency$$ = $JSCompiler_params$jscomp$inline_192_win$jscomp$12$$.AMP_CONFIG[$allowed$3_experimentId$jscomp$2_i$jscomp$15$$];
      "number" === typeof $frequency$$ && 0 <= $frequency$$ && 1 >= $frequency$$ && ($toggles$jscomp$2$$[$allowed$3_experimentId$jscomp$2_i$jscomp$15$$] = Math.random() < $frequency$$);
    }
  }
  if ($JSCompiler_params$jscomp$inline_192_win$jscomp$12$$.AMP_CONFIG && Array.isArray($JSCompiler_params$jscomp$inline_192_win$jscomp$12$$.AMP_CONFIG["allow-doc-opt-in"]) && 0 < $JSCompiler_params$jscomp$inline_192_win$jscomp$12$$.AMP_CONFIG["allow-doc-opt-in"].length) {
    var $allowed$$ = $JSCompiler_params$jscomp$inline_192_win$jscomp$12$$.AMP_CONFIG["allow-doc-opt-in"], $meta$$ = $JSCompiler_params$jscomp$inline_192_win$jscomp$12$$.document.head.querySelector('meta[name="amp-experiments-opt-in"]');
    if ($meta$$) {
      var $optedInExperiments$$ = $meta$$.getAttribute("content").split(",");
      for ($allowed$3_experimentId$jscomp$2_i$jscomp$15$$ = 0; $allowed$3_experimentId$jscomp$2_i$jscomp$15$$ < $optedInExperiments$$.length; $allowed$3_experimentId$jscomp$2_i$jscomp$15$$++) {
        -1 != $allowed$$.indexOf($optedInExperiments$$[$allowed$3_experimentId$jscomp$2_i$jscomp$15$$]) && ($toggles$jscomp$2$$[$optedInExperiments$$[$allowed$3_experimentId$jscomp$2_i$jscomp$15$$]] = !0);
      }
    }
  }
  Object.assign($toggles$jscomp$2$$, $getExperimentToggles$$module$src$experiments$$($JSCompiler_params$jscomp$inline_192_win$jscomp$12$$));
  if ($JSCompiler_params$jscomp$inline_192_win$jscomp$12$$.AMP_CONFIG && Array.isArray($JSCompiler_params$jscomp$inline_192_win$jscomp$12$$.AMP_CONFIG["allow-url-opt-in"]) && 0 < $JSCompiler_params$jscomp$inline_192_win$jscomp$12$$.AMP_CONFIG["allow-url-opt-in"].length) {
    $allowed$3_experimentId$jscomp$2_i$jscomp$15$$ = $JSCompiler_params$jscomp$inline_192_win$jscomp$12$$.AMP_CONFIG["allow-url-opt-in"];
    var $JSCompiler_queryString$jscomp$inline_191_i$4$$ = $JSCompiler_params$jscomp$inline_192_win$jscomp$12$$.location.originalHash || $JSCompiler_params$jscomp$inline_192_win$jscomp$12$$.location.hash;
    $JSCompiler_params$jscomp$inline_192_win$jscomp$12$$ = Object.create(null);
    if ($JSCompiler_queryString$jscomp$inline_191_i$4$$) {
      for (var $JSCompiler_match$jscomp$inline_193_JSCompiler_value$jscomp$inline_195$$; $JSCompiler_match$jscomp$inline_193_JSCompiler_value$jscomp$inline_195$$ = $regex$$module$src$url_parse_query_string$$.exec($JSCompiler_queryString$jscomp$inline_191_i$4$$);) {
        var $JSCompiler_name$jscomp$inline_194_param$jscomp$6$$ = $tryDecodeUriComponent_$$module$src$url_try_decode_uri_component$$($JSCompiler_match$jscomp$inline_193_JSCompiler_value$jscomp$inline_195$$[1], $JSCompiler_match$jscomp$inline_193_JSCompiler_value$jscomp$inline_195$$[1]);
        $JSCompiler_match$jscomp$inline_193_JSCompiler_value$jscomp$inline_195$$ = $JSCompiler_match$jscomp$inline_193_JSCompiler_value$jscomp$inline_195$$[2] ? $tryDecodeUriComponent_$$module$src$url_try_decode_uri_component$$($JSCompiler_match$jscomp$inline_193_JSCompiler_value$jscomp$inline_195$$[2].replace(/\+/g, " "), $JSCompiler_match$jscomp$inline_193_JSCompiler_value$jscomp$inline_195$$[2]) : "";
        $JSCompiler_params$jscomp$inline_192_win$jscomp$12$$[$JSCompiler_name$jscomp$inline_194_param$jscomp$6$$] = $JSCompiler_match$jscomp$inline_193_JSCompiler_value$jscomp$inline_195$$;
      }
    }
    for ($JSCompiler_queryString$jscomp$inline_191_i$4$$ = 0; $JSCompiler_queryString$jscomp$inline_191_i$4$$ < $allowed$3_experimentId$jscomp$2_i$jscomp$15$$.length; $JSCompiler_queryString$jscomp$inline_191_i$4$$++) {
      $JSCompiler_name$jscomp$inline_194_param$jscomp$6$$ = $JSCompiler_params$jscomp$inline_192_win$jscomp$12$$["e-" + $allowed$3_experimentId$jscomp$2_i$jscomp$15$$[$JSCompiler_queryString$jscomp$inline_191_i$4$$]], "1" == $JSCompiler_name$jscomp$inline_194_param$jscomp$6$$ && ($toggles$jscomp$2$$[$allowed$3_experimentId$jscomp$2_i$jscomp$15$$[$JSCompiler_queryString$jscomp$inline_191_i$4$$]] = !0), "0" == $JSCompiler_name$jscomp$inline_194_param$jscomp$6$$ && ($toggles$jscomp$2$$[$allowed$3_experimentId$jscomp$2_i$jscomp$15$$[$JSCompiler_queryString$jscomp$inline_191_i$4$$]] = 
      !1);
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
function $getExistingServiceForDocInEmbedScope$$module$src$service$$($JSCompiler_ampdoc$jscomp$inline_72_JSCompiler_holder$jscomp$inline_73_element$jscomp$13$$, $JSCompiler_temp$jscomp$29_id$jscomp$8$$) {
  var $win$jscomp$23$$ = $JSCompiler_ampdoc$jscomp$inline_72_JSCompiler_holder$jscomp$inline_73_element$jscomp$13$$.ownerDocument.defaultView, $topWin$$ = $win$jscomp$23$$.__AMP_TOP || ($win$jscomp$23$$.__AMP_TOP = $win$jscomp$23$$), $isEmbed$$ = $win$jscomp$23$$ != $topWin$$, $JSCompiler_i$jscomp$inline_200_JSCompiler_inline_result$jscomp$28$$;
  if ($experimentToggles$$module$src$experiments$$($topWin$$)["ampdoc-fie"]) {
    $topWin$$.__AMP_EXPERIMENT_BRANCHES = $topWin$$.__AMP_EXPERIMENT_BRANCHES || {};
    for ($JSCompiler_i$jscomp$inline_200_JSCompiler_inline_result$jscomp$28$$ = 0; $JSCompiler_i$jscomp$inline_200_JSCompiler_inline_result$jscomp$28$$ < $EXPERIMENT_INFO_LIST$$module$src$ampdoc_fie$$.length; $JSCompiler_i$jscomp$inline_200_JSCompiler_inline_result$jscomp$28$$++) {
      var $JSCompiler_arr$jscomp$inline_233_JSCompiler_experiment$jscomp$inline_201$$ = $EXPERIMENT_INFO_LIST$$module$src$ampdoc_fie$$[$JSCompiler_i$jscomp$inline_200_JSCompiler_inline_result$jscomp$28$$], $JSCompiler_experimentName$jscomp$inline_202$$ = $JSCompiler_arr$jscomp$inline_233_JSCompiler_experiment$jscomp$inline_201$$.experimentId;
      $hasOwn_$$module$src$utils$object$$.call($topWin$$.__AMP_EXPERIMENT_BRANCHES, $JSCompiler_experimentName$jscomp$inline_202$$) || ($JSCompiler_arr$jscomp$inline_233_JSCompiler_experiment$jscomp$inline_201$$.isTrafficEligible && $JSCompiler_arr$jscomp$inline_233_JSCompiler_experiment$jscomp$inline_201$$.isTrafficEligible($topWin$$) ? !$topWin$$.__AMP_EXPERIMENT_BRANCHES[$JSCompiler_experimentName$jscomp$inline_202$$] && $experimentToggles$$module$src$experiments$$($topWin$$)[$JSCompiler_experimentName$jscomp$inline_202$$] && 
      ($JSCompiler_arr$jscomp$inline_233_JSCompiler_experiment$jscomp$inline_201$$ = $JSCompiler_arr$jscomp$inline_233_JSCompiler_experiment$jscomp$inline_201$$.branches, $topWin$$.__AMP_EXPERIMENT_BRANCHES[$JSCompiler_experimentName$jscomp$inline_202$$] = $JSCompiler_arr$jscomp$inline_233_JSCompiler_experiment$jscomp$inline_201$$[Math.floor(Math.random() * $JSCompiler_arr$jscomp$inline_233_JSCompiler_experiment$jscomp$inline_201$$.length)] || null) : $topWin$$.__AMP_EXPERIMENT_BRANCHES[$JSCompiler_experimentName$jscomp$inline_202$$] = 
      null);
    }
    $JSCompiler_i$jscomp$inline_200_JSCompiler_inline_result$jscomp$28$$ = "21065002" === ($topWin$$.__AMP_EXPERIMENT_BRANCHES ? $topWin$$.__AMP_EXPERIMENT_BRANCHES["ampdoc-fie"] : null);
  } else {
    $JSCompiler_i$jscomp$inline_200_JSCompiler_inline_result$jscomp$28$$ = !1;
  }
  var $ampdocFieExperimentOn$$ = $JSCompiler_i$jscomp$inline_200_JSCompiler_inline_result$jscomp$28$$;
  $isEmbed$$ && !$ampdocFieExperimentOn$$ ? $JSCompiler_temp$jscomp$29_id$jscomp$8$$ = $isServiceRegistered$$module$src$service$$($win$jscomp$23$$, $JSCompiler_temp$jscomp$29_id$jscomp$8$$) ? $getServiceInternal$$module$src$service$$($win$jscomp$23$$, $JSCompiler_temp$jscomp$29_id$jscomp$8$$) : null : ($JSCompiler_ampdoc$jscomp$inline_72_JSCompiler_holder$jscomp$inline_73_element$jscomp$13$$ = $getAmpdoc$$module$src$service$$($JSCompiler_ampdoc$jscomp$inline_72_JSCompiler_holder$jscomp$inline_73_element$jscomp$13$$), 
  $JSCompiler_ampdoc$jscomp$inline_72_JSCompiler_holder$jscomp$inline_73_element$jscomp$13$$ = $getAmpdocServiceHolder$$module$src$service$$($JSCompiler_ampdoc$jscomp$inline_72_JSCompiler_holder$jscomp$inline_73_element$jscomp$13$$), $JSCompiler_temp$jscomp$29_id$jscomp$8$$ = $isServiceRegistered$$module$src$service$$($JSCompiler_ampdoc$jscomp$inline_72_JSCompiler_holder$jscomp$inline_73_element$jscomp$13$$, $JSCompiler_temp$jscomp$29_id$jscomp$8$$) ? $getServiceInternal$$module$src$service$$($JSCompiler_ampdoc$jscomp$inline_72_JSCompiler_holder$jscomp$inline_73_element$jscomp$13$$, 
  $JSCompiler_temp$jscomp$29_id$jscomp$8$$) : null);
  return $JSCompiler_temp$jscomp$29_id$jscomp$8$$;
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
  var $JSCompiler_services$jscomp$inline_76$$ = $holder$jscomp$4_s$jscomp$9$$.__AMP_SERVICES;
  $JSCompiler_services$jscomp$inline_76$$ || ($JSCompiler_services$jscomp$inline_76$$ = $holder$jscomp$4_s$jscomp$9$$.__AMP_SERVICES = {});
  $holder$jscomp$4_s$jscomp$9$$ = $JSCompiler_services$jscomp$inline_76$$[$id$jscomp$21$$];
  $holder$jscomp$4_s$jscomp$9$$.obj || ($holder$jscomp$4_s$jscomp$9$$.obj = new $holder$jscomp$4_s$jscomp$9$$.ctor($holder$jscomp$4_s$jscomp$9$$.context), $holder$jscomp$4_s$jscomp$9$$.ctor = null, $holder$jscomp$4_s$jscomp$9$$.context = null, $holder$jscomp$4_s$jscomp$9$$.resolve && $holder$jscomp$4_s$jscomp$9$$.resolve($holder$jscomp$4_s$jscomp$9$$.obj));
  return $holder$jscomp$4_s$jscomp$9$$.obj;
}
function $isServiceRegistered$$module$src$service$$($holder$jscomp$12_service$jscomp$5$$, $id$jscomp$30$$) {
  $holder$jscomp$12_service$jscomp$5$$ = $holder$jscomp$12_service$jscomp$5$$.__AMP_SERVICES && $holder$jscomp$12_service$jscomp$5$$.__AMP_SERVICES[$id$jscomp$30$$];
  return !(!$holder$jscomp$12_service$jscomp$5$$ || !$holder$jscomp$12_service$jscomp$5$$.ctor && !$holder$jscomp$12_service$jscomp$5$$.obj);
}
;/*
 https://mths.be/cssescape v1.5.1 by @mathias | MIT license */
function $closest$$module$src$dom$$($el$jscomp$2_element$jscomp$20$$, $callback$jscomp$53$$) {
  for (; $el$jscomp$2_element$jscomp$20$$ && void 0 !== $el$jscomp$2_element$jscomp$20$$; $el$jscomp$2_element$jscomp$20$$ = $el$jscomp$2_element$jscomp$20$$.parentElement) {
    if ($callback$jscomp$53$$($el$jscomp$2_element$jscomp$20$$)) {
      return $el$jscomp$2_element$jscomp$20$$;
    }
  }
  return null;
}
function $closestAncestorElementBySelector$$module$src$dom$$($element$jscomp$21$$) {
  return $element$jscomp$21$$.closest ? $element$jscomp$21$$.closest(".i-amphtml-overlay") : $closest$$module$src$dom$$($element$jscomp$21$$, function($element$jscomp$21$$) {
    var $el$jscomp$3$$ = $element$jscomp$21$$.matches || $element$jscomp$21$$.webkitMatchesSelector || $element$jscomp$21$$.mozMatchesSelector || $element$jscomp$21$$.msMatchesSelector || $element$jscomp$21$$.oMatchesSelector;
    return $el$jscomp$3$$ ? $el$jscomp$3$$.call($element$jscomp$21$$, ".i-amphtml-overlay") : !1;
  });
}
;function $Pass$$module$src$pass$$($win$jscomp$54$$, $handler$jscomp$3$$) {
  var $$jscomp$this$jscomp$2$$ = this;
  this.$timer_$ = $getService$$module$src$service$$($win$jscomp$54$$, "timer");
  this.$handler_$ = $handler$jscomp$3$$;
  this.$defaultDelay_$ = 0;
  this.$scheduled_$ = -1;
  this.$nextTime_$ = 0;
  this.$running_$ = !1;
  this.$boundPass_$ = function() {
    $$jscomp$this$jscomp$2$$.$scheduled_$ = -1;
    $$jscomp$this$jscomp$2$$.$nextTime_$ = 0;
    $$jscomp$this$jscomp$2$$.$running_$ = !0;
    $$jscomp$this$jscomp$2$$.$handler_$();
    $$jscomp$this$jscomp$2$$.$running_$ = !1;
  };
}
$Pass$$module$src$pass$$.prototype.isPending = function() {
  return -1 != this.$scheduled_$;
};
$Pass$$module$src$pass$$.prototype.schedule = function($opt_delay$jscomp$2$$) {
  var $delay$$ = $opt_delay$jscomp$2$$ || this.$defaultDelay_$;
  this.$running_$ && 10 > $delay$$ && ($delay$$ = 10);
  var $nextTime$$ = Date.now() + $delay$$;
  return !this.isPending() || -10 > $nextTime$$ - this.$nextTime_$ ? (this.cancel(), this.$nextTime_$ = $nextTime$$, this.$scheduled_$ = this.$timer_$.delay(this.$boundPass_$, $delay$$), !0) : !1;
};
$Pass$$module$src$pass$$.prototype.cancel = function() {
  this.isPending() && (this.$timer_$.cancel(this.$scheduled_$), this.$scheduled_$ = -1);
};
var $optsSupported$$module$src$event_helper_listen$$;
function $internalListenImplementation$$module$src$event_helper_listen$$($element$jscomp$62$$, $listener$jscomp$64$$) {
  var $localElement$$ = $element$jscomp$62$$, $localListener$$ = $listener$jscomp$64$$;
  var $wrapped$$ = function($element$jscomp$62$$) {
    try {
      return $localListener$$($element$jscomp$62$$);
    } catch ($e$jscomp$18$$) {
      throw self.__AMP_REPORT_ERROR($e$jscomp$18$$), $e$jscomp$18$$;
    }
  };
  var $optsSupported$$ = $detectEvtListenerOptsSupport$$module$src$event_helper_listen$$();
  $localElement$$.addEventListener("message", $wrapped$$, $optsSupported$$ ? void 0 : !1);
  return function() {
    $localElement$$ && $localElement$$.removeEventListener("message", $wrapped$$, $optsSupported$$ ? void 0 : !1);
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
;function $tryParseJson$$module$src$json$$($json$jscomp$1$$, $opt_onFailed$$) {
  try {
    return JSON.parse($json$jscomp$1$$);
  } catch ($e$jscomp$19$$) {
    return $opt_onFailed$$ && $opt_onFailed$$($e$jscomp$19$$), null;
  }
}
;function $deserializeMessage$$module$src$3p_frame_messaging$$($message$jscomp$36$$) {
  if (!$isAmpMessage$$module$src$3p_frame_messaging$$($message$jscomp$36$$)) {
    return null;
  }
  var $startPos$$ = $message$jscomp$36$$.indexOf("{");
  try {
    return JSON.parse($message$jscomp$36$$.substr($startPos$$));
  } catch ($e$jscomp$20$$) {
    return $dev$$module$src$log$$().error("MESSAGING", "Failed to parse message: " + $message$jscomp$36$$, $e$jscomp$20$$), null;
  }
}
function $isAmpMessage$$module$src$3p_frame_messaging$$($message$jscomp$37$$) {
  return "string" == typeof $message$jscomp$37$$ && 0 == $message$jscomp$37$$.indexOf("amp-") && -1 != $message$jscomp$37$$.indexOf("{");
}
;function $listen$$module$src$event_helper$$($element$jscomp$65$$, $listener$jscomp$66$$) {
  return $internalListenImplementation$$module$src$event_helper_listen$$($element$jscomp$65$$, $listener$jscomp$66$$);
}
;function $remove$$module$src$utils$array$$($array$jscomp$9$$, $shouldRemove$$) {
  for (var $removed$$ = [], $index$jscomp$78$$ = 0, $i$jscomp$23$$ = 0; $i$jscomp$23$$ < $array$jscomp$9$$.length; $i$jscomp$23$$++) {
    var $item$jscomp$1$$ = $array$jscomp$9$$[$i$jscomp$23$$];
    $shouldRemove$$($item$jscomp$1$$, $i$jscomp$23$$, $array$jscomp$9$$) ? $removed$$.push($item$jscomp$1$$) : ($index$jscomp$78$$ < $i$jscomp$23$$ && ($array$jscomp$9$$[$index$jscomp$78$$] = $item$jscomp$1$$), $index$jscomp$78$$++);
  }
  $index$jscomp$78$$ < $array$jscomp$9$$.length && ($array$jscomp$9$$.length = $index$jscomp$78$$);
}
;var $propertyNameCache$$module$src$style$$, $vendorPrefixes$$module$src$style$$ = "Webkit webkit Moz moz ms O o".split(" ");
function $setStyle$$module$src$style$$($element$jscomp$69$$, $value$jscomp$100$$) {
  var $JSCompiler_inline_result$jscomp$33_JSCompiler_style$jscomp$inline_84_propertyName$jscomp$10$$ = $element$jscomp$69$$.style;
  if ($startsWith$$module$src$string$$("zIndex", "--")) {
    $JSCompiler_inline_result$jscomp$33_JSCompiler_style$jscomp$inline_84_propertyName$jscomp$10$$ = "zIndex";
  } else {
    $propertyNameCache$$module$src$style$$ || ($propertyNameCache$$module$src$style$$ = Object.create(null));
    var $JSCompiler_propertyName$jscomp$inline_87$$ = $propertyNameCache$$module$src$style$$.zIndex;
    if (!$JSCompiler_propertyName$jscomp$inline_87$$) {
      $JSCompiler_propertyName$jscomp$inline_87$$ = "zIndex";
      if (void 0 === $JSCompiler_inline_result$jscomp$33_JSCompiler_style$jscomp$inline_84_propertyName$jscomp$10$$.zIndex) {
        var $JSCompiler_i$jscomp$inline_210_JSCompiler_inline_result$jscomp$186_JSCompiler_prefixedPropertyName$jscomp$inline_89$$;
        b: {
          for ($JSCompiler_i$jscomp$inline_210_JSCompiler_inline_result$jscomp$186_JSCompiler_prefixedPropertyName$jscomp$inline_89$$ = 0; $JSCompiler_i$jscomp$inline_210_JSCompiler_inline_result$jscomp$186_JSCompiler_prefixedPropertyName$jscomp$inline_89$$ < $vendorPrefixes$$module$src$style$$.length; $JSCompiler_i$jscomp$inline_210_JSCompiler_inline_result$jscomp$186_JSCompiler_prefixedPropertyName$jscomp$inline_89$$++) {
            var $JSCompiler_propertyName$jscomp$inline_211$$ = $vendorPrefixes$$module$src$style$$[$JSCompiler_i$jscomp$inline_210_JSCompiler_inline_result$jscomp$186_JSCompiler_prefixedPropertyName$jscomp$inline_89$$] + "ZIndex";
            if (void 0 !== $JSCompiler_inline_result$jscomp$33_JSCompiler_style$jscomp$inline_84_propertyName$jscomp$10$$[$JSCompiler_propertyName$jscomp$inline_211$$]) {
              $JSCompiler_i$jscomp$inline_210_JSCompiler_inline_result$jscomp$186_JSCompiler_prefixedPropertyName$jscomp$inline_89$$ = $JSCompiler_propertyName$jscomp$inline_211$$;
              break b;
            }
          }
          $JSCompiler_i$jscomp$inline_210_JSCompiler_inline_result$jscomp$186_JSCompiler_prefixedPropertyName$jscomp$inline_89$$ = "";
        }
        void 0 !== $JSCompiler_inline_result$jscomp$33_JSCompiler_style$jscomp$inline_84_propertyName$jscomp$10$$[$JSCompiler_i$jscomp$inline_210_JSCompiler_inline_result$jscomp$186_JSCompiler_prefixedPropertyName$jscomp$inline_89$$] && ($JSCompiler_propertyName$jscomp$inline_87$$ = $JSCompiler_i$jscomp$inline_210_JSCompiler_inline_result$jscomp$186_JSCompiler_prefixedPropertyName$jscomp$inline_89$$);
      }
      $propertyNameCache$$module$src$style$$.zIndex = $JSCompiler_propertyName$jscomp$inline_87$$;
    }
    $JSCompiler_inline_result$jscomp$33_JSCompiler_style$jscomp$inline_84_propertyName$jscomp$10$$ = $JSCompiler_propertyName$jscomp$inline_87$$;
  }
  $JSCompiler_inline_result$jscomp$33_JSCompiler_style$jscomp$inline_84_propertyName$jscomp$10$$ && ($startsWith$$module$src$string$$($JSCompiler_inline_result$jscomp$33_JSCompiler_style$jscomp$inline_84_propertyName$jscomp$10$$, "--") ? $element$jscomp$69$$.style.setProperty($JSCompiler_inline_result$jscomp$33_JSCompiler_style$jscomp$inline_84_propertyName$jscomp$10$$, $value$jscomp$100$$) : $element$jscomp$69$$.style[$JSCompiler_inline_result$jscomp$33_JSCompiler_style$jscomp$inline_84_propertyName$jscomp$10$$] = 
  $value$jscomp$100$$);
}
function $toggle$$module$src$style$$($element$jscomp$72$$, $opt_display$$) {
  void 0 === $opt_display$$ && ($opt_display$$ = $element$jscomp$72$$.hasAttribute("hidden"));
  $opt_display$$ ? $element$jscomp$72$$.removeAttribute("hidden") : $element$jscomp$72$$.setAttribute("hidden", "");
}
;function $getListenForSentinel$$module$src$iframe_helper$$($JSCompiler_inline_result$jscomp$34_parentWin$jscomp$2$$, $sentinel$jscomp$1$$, $opt_create$jscomp$1$$) {
  var $JSCompiler_listeningFors$jscomp$inline_93$$ = $JSCompiler_inline_result$jscomp$34_parentWin$jscomp$2$$.listeningFors;
  !$JSCompiler_listeningFors$jscomp$inline_93$$ && $opt_create$jscomp$1$$ && ($JSCompiler_listeningFors$jscomp$inline_93$$ = $JSCompiler_inline_result$jscomp$34_parentWin$jscomp$2$$.listeningFors = Object.create(null));
  $JSCompiler_inline_result$jscomp$34_parentWin$jscomp$2$$ = $JSCompiler_listeningFors$jscomp$inline_93$$ || null;
  if (!$JSCompiler_inline_result$jscomp$34_parentWin$jscomp$2$$) {
    return $JSCompiler_inline_result$jscomp$34_parentWin$jscomp$2$$;
  }
  var $listenSentinel$$ = $JSCompiler_inline_result$jscomp$34_parentWin$jscomp$2$$[$sentinel$jscomp$1$$];
  !$listenSentinel$$ && $opt_create$jscomp$1$$ && ($listenSentinel$$ = $JSCompiler_inline_result$jscomp$34_parentWin$jscomp$2$$[$sentinel$jscomp$1$$] = []);
  return $listenSentinel$$ || null;
}
function $getOrCreateListenForEvents$$module$src$iframe_helper$$($listenSentinel$jscomp$1_parentWin$jscomp$3$$, $iframe$$, $opt_is3P$$) {
  var $i$jscomp$27_sentinel$jscomp$2$$ = $opt_is3P$$ ? $iframe$$.getAttribute("data-amp-3p-sentinel") : "amp";
  $listenSentinel$jscomp$1_parentWin$jscomp$3$$ = $getListenForSentinel$$module$src$iframe_helper$$($listenSentinel$jscomp$1_parentWin$jscomp$3$$, $i$jscomp$27_sentinel$jscomp$2$$, !0);
  for ($i$jscomp$27_sentinel$jscomp$2$$ = 0; $i$jscomp$27_sentinel$jscomp$2$$ < $listenSentinel$jscomp$1_parentWin$jscomp$3$$.length; $i$jscomp$27_sentinel$jscomp$2$$++) {
    var $we$$ = $listenSentinel$jscomp$1_parentWin$jscomp$3$$[$i$jscomp$27_sentinel$jscomp$2$$];
    if ($we$$.frame === $iframe$$) {
      var $windowEvents$$ = $we$$;
      break;
    }
  }
  $windowEvents$$ || ($windowEvents$$ = {frame:$iframe$$, events:Object.create(null)}, $listenSentinel$jscomp$1_parentWin$jscomp$3$$.push($windowEvents$$));
  return $windowEvents$$.events;
}
function $dropListenSentinel$$module$src$iframe_helper$$($listenSentinel$jscomp$3$$) {
  for (var $noopData$$ = $dict$$module$src$utils$object$$({sentinel:"unlisten"}), $i$jscomp$29$$ = $listenSentinel$jscomp$3$$.length - 1; 0 <= $i$jscomp$29$$; $i$jscomp$29$$--) {
    var $windowEvents$jscomp$2$$ = $listenSentinel$jscomp$3$$[$i$jscomp$29$$];
    if (!$windowEvents$jscomp$2$$.frame.contentWindow) {
      $listenSentinel$jscomp$3$$.splice($i$jscomp$29$$, 1);
      var $events$$ = $windowEvents$jscomp$2$$.events, $name$jscomp$78$$;
      for ($name$jscomp$78$$ in $events$$) {
        $events$$[$name$jscomp$78$$].splice(0, Infinity).forEach(function($listenSentinel$jscomp$3$$) {
          $listenSentinel$jscomp$3$$($noopData$$);
        });
      }
    }
  }
}
function $registerGlobalListenerIfNeeded$$module$src$iframe_helper$$($parentWin$jscomp$5$$) {
  $parentWin$jscomp$5$$.listeningFors || $parentWin$jscomp$5$$.addEventListener("message", function($event$jscomp$10$$) {
    if ($event$jscomp$10$$.data) {
      var $data$jscomp$78$$ = $parseIfNeeded$$module$src$iframe_helper$$($event$jscomp$10$$.data);
      if ($data$jscomp$78$$ && $data$jscomp$78$$.sentinel) {
        var $JSCompiler_inline_result$jscomp$35_JSCompiler_triggerWin$jscomp$inline_97_i$jscomp$30$$ = $event$jscomp$10$$.source;
        var $JSCompiler_listenSentinel$jscomp$inline_98$$ = $getListenForSentinel$$module$src$iframe_helper$$($parentWin$jscomp$5$$, $data$jscomp$78$$.sentinel);
        if ($JSCompiler_listenSentinel$jscomp$inline_98$$) {
          for (var $JSCompiler_windowEvents$jscomp$inline_99$$, $JSCompiler_i$jscomp$inline_100$$ = 0; $JSCompiler_i$jscomp$inline_100$$ < $JSCompiler_listenSentinel$jscomp$inline_98$$.length; $JSCompiler_i$jscomp$inline_100$$++) {
            var $JSCompiler_we$jscomp$inline_101$$ = $JSCompiler_listenSentinel$jscomp$inline_98$$[$JSCompiler_i$jscomp$inline_100$$], $JSCompiler_contentWindow$jscomp$inline_102$$ = $JSCompiler_we$jscomp$inline_101$$.frame.contentWindow;
            if ($JSCompiler_contentWindow$jscomp$inline_102$$) {
              var $JSCompiler_temp$jscomp$187_JSCompiler_win$jscomp$inline_215$$;
              if (!($JSCompiler_temp$jscomp$187_JSCompiler_win$jscomp$inline_215$$ = $JSCompiler_inline_result$jscomp$35_JSCompiler_triggerWin$jscomp$inline_97_i$jscomp$30$$ == $JSCompiler_contentWindow$jscomp$inline_102$$)) {
                b: {
                  for ($JSCompiler_temp$jscomp$187_JSCompiler_win$jscomp$inline_215$$ = $JSCompiler_inline_result$jscomp$35_JSCompiler_triggerWin$jscomp$inline_97_i$jscomp$30$$; $JSCompiler_temp$jscomp$187_JSCompiler_win$jscomp$inline_215$$ && $JSCompiler_temp$jscomp$187_JSCompiler_win$jscomp$inline_215$$ != $JSCompiler_temp$jscomp$187_JSCompiler_win$jscomp$inline_215$$.parent; $JSCompiler_temp$jscomp$187_JSCompiler_win$jscomp$inline_215$$ = $JSCompiler_temp$jscomp$187_JSCompiler_win$jscomp$inline_215$$.parent) {
                    if ($JSCompiler_temp$jscomp$187_JSCompiler_win$jscomp$inline_215$$ == $JSCompiler_contentWindow$jscomp$inline_102$$) {
                      $JSCompiler_temp$jscomp$187_JSCompiler_win$jscomp$inline_215$$ = !0;
                      break b;
                    }
                  }
                  $JSCompiler_temp$jscomp$187_JSCompiler_win$jscomp$inline_215$$ = !1;
                }
              }
              if ($JSCompiler_temp$jscomp$187_JSCompiler_win$jscomp$inline_215$$) {
                $JSCompiler_windowEvents$jscomp$inline_99$$ = $JSCompiler_we$jscomp$inline_101$$;
                break;
              }
            } else {
              setTimeout($dropListenSentinel$$module$src$iframe_helper$$, 0, $JSCompiler_listenSentinel$jscomp$inline_98$$);
            }
          }
          $JSCompiler_inline_result$jscomp$35_JSCompiler_triggerWin$jscomp$inline_97_i$jscomp$30$$ = $JSCompiler_windowEvents$jscomp$inline_99$$ ? $JSCompiler_windowEvents$jscomp$inline_99$$.events : null;
        } else {
          $JSCompiler_inline_result$jscomp$35_JSCompiler_triggerWin$jscomp$inline_97_i$jscomp$30$$ = $JSCompiler_listenSentinel$jscomp$inline_98$$;
        }
        var $listenForEvents$$ = $JSCompiler_inline_result$jscomp$35_JSCompiler_triggerWin$jscomp$inline_97_i$jscomp$30$$;
        if ($listenForEvents$$) {
          var $listeners$$ = $listenForEvents$$[$data$jscomp$78$$.type];
          if ($listeners$$) {
            for ($listeners$$ = $listeners$$.slice(), $JSCompiler_inline_result$jscomp$35_JSCompiler_triggerWin$jscomp$inline_97_i$jscomp$30$$ = 0; $JSCompiler_inline_result$jscomp$35_JSCompiler_triggerWin$jscomp$inline_97_i$jscomp$30$$ < $listeners$$.length; $JSCompiler_inline_result$jscomp$35_JSCompiler_triggerWin$jscomp$inline_97_i$jscomp$30$$++) {
              (0,$listeners$$[$JSCompiler_inline_result$jscomp$35_JSCompiler_triggerWin$jscomp$inline_97_i$jscomp$30$$])($data$jscomp$78$$, $event$jscomp$10$$.source, $event$jscomp$10$$.origin, $event$jscomp$10$$);
            }
          }
        }
      }
    }
  });
}
function $listenFor$$module$src$iframe_helper$$($iframe$jscomp$1$$, $typeOfMessage$$, $callback$jscomp$59$$, $listenForEvents$jscomp$1_opt_is3P$jscomp$1$$, $opt_includingNestedWindows$$, $opt_allowOpaqueOrigin$$) {
  function $listener$jscomp$69$$($typeOfMessage$$, $listenForEvents$jscomp$1_opt_is3P$jscomp$1$$, $listener$jscomp$69$$, $events$jscomp$1$$) {
    if ("amp" == $typeOfMessage$$.sentinel) {
      if ($listenForEvents$jscomp$1_opt_is3P$jscomp$1$$ != $iframe$jscomp$1$$.contentWindow) {
        return;
      }
      var $parentWin$jscomp$6$$ = "null" == $listener$jscomp$69$$ && $opt_allowOpaqueOrigin$$;
      if ($iframeOrigin$$ != $listener$jscomp$69$$ && !$parentWin$jscomp$6$$) {
        return;
      }
    }
    if ($opt_includingNestedWindows$$ || $listenForEvents$jscomp$1_opt_is3P$jscomp$1$$ == $iframe$jscomp$1$$.contentWindow) {
      "unlisten" == $typeOfMessage$$.sentinel ? $unlisten$jscomp$2$$() : $callback$jscomp$59$$($typeOfMessage$$, $listenForEvents$jscomp$1_opt_is3P$jscomp$1$$, $listener$jscomp$69$$, $events$jscomp$1$$);
    }
  }
  var $parentWin$jscomp$6$$ = $iframe$jscomp$1$$.ownerDocument.defaultView;
  $registerGlobalListenerIfNeeded$$module$src$iframe_helper$$($parentWin$jscomp$6$$);
  $listenForEvents$jscomp$1_opt_is3P$jscomp$1$$ = $getOrCreateListenForEvents$$module$src$iframe_helper$$($parentWin$jscomp$6$$, $iframe$jscomp$1$$, $listenForEvents$jscomp$1_opt_is3P$jscomp$1$$);
  var $iframeOrigin$$ = $parseUrlDeprecated$$module$src$url$$($iframe$jscomp$1$$.src).origin, $events$jscomp$1$$ = $listenForEvents$jscomp$1_opt_is3P$jscomp$1$$[$typeOfMessage$$] || ($listenForEvents$jscomp$1_opt_is3P$jscomp$1$$[$typeOfMessage$$] = []), $unlisten$jscomp$2$$;
  $events$jscomp$1$$.push($listener$jscomp$69$$);
  return $unlisten$jscomp$2$$ = function() {
    if ($listener$jscomp$69$$) {
      var $iframe$jscomp$1$$ = $events$jscomp$1$$.indexOf($listener$jscomp$69$$);
      -1 < $iframe$jscomp$1$$ && $events$jscomp$1$$.splice($iframe$jscomp$1$$, 1);
      $callback$jscomp$59$$ = $events$jscomp$1$$ = $listener$jscomp$69$$ = null;
    }
  };
}
function $postMessageToWindows$$module$src$iframe_helper$$($iframe$jscomp$4_payload$jscomp$1$$, $targets$$, $type$jscomp$151$$, $i$jscomp$32_object$jscomp$2$$, $opt_is3P$jscomp$4_target$jscomp$99$$) {
  if ($iframe$jscomp$4_payload$jscomp$1$$.contentWindow) {
    for ($i$jscomp$32_object$jscomp$2$$.type = $type$jscomp$151$$, $i$jscomp$32_object$jscomp$2$$.sentinel = $opt_is3P$jscomp$4_target$jscomp$99$$ ? $iframe$jscomp$4_payload$jscomp$1$$.getAttribute("data-amp-3p-sentinel") : "amp", $iframe$jscomp$4_payload$jscomp$1$$ = $i$jscomp$32_object$jscomp$2$$, $opt_is3P$jscomp$4_target$jscomp$99$$ && ($iframe$jscomp$4_payload$jscomp$1$$ = "amp-" + JSON.stringify($i$jscomp$32_object$jscomp$2$$)), $i$jscomp$32_object$jscomp$2$$ = 0; $i$jscomp$32_object$jscomp$2$$ < 
    $targets$$.length; $i$jscomp$32_object$jscomp$2$$++) {
      $opt_is3P$jscomp$4_target$jscomp$99$$ = $targets$$[$i$jscomp$32_object$jscomp$2$$], $opt_is3P$jscomp$4_target$jscomp$99$$.win.postMessage($iframe$jscomp$4_payload$jscomp$1$$, $opt_is3P$jscomp$4_target$jscomp$99$$.origin);
    }
  }
}
function $parseIfNeeded$$module$src$iframe_helper$$($data$jscomp$81$$) {
  "string" == typeof $data$jscomp$81$$ && ($data$jscomp$81$$ = "{" == $data$jscomp$81$$.charAt(0) ? $tryParseJson$$module$src$json$$($data$jscomp$81$$, function($data$jscomp$81$$) {
    $dev$$module$src$log$$().warn("IFRAME-HELPER", "Postmessage could not be parsed. Is it in a valid JSON format?", $data$jscomp$81$$);
  }) || null : $isAmpMessage$$module$src$3p_frame_messaging$$($data$jscomp$81$$) ? $deserializeMessage$$module$src$3p_frame_messaging$$($data$jscomp$81$$) : null);
  return $data$jscomp$81$$;
}
function $SubscriptionApi$$module$src$iframe_helper$$($iframe$jscomp$6$$, $requestCallback$$) {
  var $$jscomp$this$jscomp$3$$ = this;
  this.$iframe_$ = $iframe$jscomp$6$$;
  this.$is3p_$ = !1;
  this.$clientWindows_$ = [];
  this.$unlisten_$ = $listenFor$$module$src$iframe_helper$$(this.$iframe_$, "send-intersections", function($iframe$jscomp$6$$, $source$jscomp$16$$, $origin$jscomp$5$$) {
    $$jscomp$this$jscomp$3$$.$clientWindows_$.some(function($iframe$jscomp$6$$) {
      return $iframe$jscomp$6$$.win == $source$jscomp$16$$;
    }) || $$jscomp$this$jscomp$3$$.$clientWindows_$.push({win:$source$jscomp$16$$, origin:$origin$jscomp$5$$});
    $requestCallback$$($iframe$jscomp$6$$, $source$jscomp$16$$, $origin$jscomp$5$$);
  }, this.$is3p_$, this.$is3p_$);
}
$SubscriptionApi$$module$src$iframe_helper$$.prototype.send = function($type$jscomp$153$$, $data$jscomp$83$$) {
  $remove$$module$src$utils$array$$(this.$clientWindows_$, function($type$jscomp$153$$) {
    return !$type$jscomp$153$$.win.parent;
  });
  $postMessageToWindows$$module$src$iframe_helper$$(this.$iframe_$, this.$clientWindows_$, $type$jscomp$153$$, $data$jscomp$83$$, this.$is3p_$);
};
$SubscriptionApi$$module$src$iframe_helper$$.prototype.destroy = function() {
  this.$unlisten_$();
  this.$clientWindows_$.length = 0;
};
var $adSizes$$module$src$iframe_helper$$ = [[300, 250], [320, 50], [300, 50], [320, 100]];
function $makePausable$$module$src$iframe_helper$$($iframe$jscomp$9$$) {
  var $oldAllow$$ = ($iframe$jscomp$9$$.getAttribute("allow") || "").trim();
  $iframe$jscomp$9$$.setAttribute("allow", "execution-while-not-rendered 'none';" + $oldAllow$$);
}
;function $layoutRectLtwh$$module$src$layout_rect$$($left$jscomp$2$$, $top$jscomp$3$$, $width$jscomp$27$$, $height$jscomp$26$$) {
  return {left:$left$jscomp$2$$, top:$top$jscomp$3$$, width:$width$jscomp$27$$, height:$height$jscomp$26$$, bottom:$top$jscomp$3$$ + $height$jscomp$26$$, right:$left$jscomp$2$$ + $width$jscomp$27$$, x:$left$jscomp$2$$, y:$top$jscomp$3$$};
}
function $rectIntersection$$module$src$layout_rect$$($var_args$jscomp$45$$) {
  for (var $x0$jscomp$2$$ = -Infinity, $x1$jscomp$5$$ = Infinity, $y0$jscomp$2$$ = -Infinity, $y1$jscomp$5$$ = Infinity, $i$jscomp$34$$ = 0; $i$jscomp$34$$ < arguments.length; $i$jscomp$34$$++) {
    var $current$$ = arguments[$i$jscomp$34$$];
    if ($current$$ && ($x0$jscomp$2$$ = Math.max($x0$jscomp$2$$, $current$$.left), $x1$jscomp$5$$ = Math.min($x1$jscomp$5$$, $current$$.left + $current$$.width), $y0$jscomp$2$$ = Math.max($y0$jscomp$2$$, $current$$.top), $y1$jscomp$5$$ = Math.min($y1$jscomp$5$$, $current$$.top + $current$$.height), $x1$jscomp$5$$ < $x0$jscomp$2$$ || $y1$jscomp$5$$ < $y0$jscomp$2$$)) {
      return null;
    }
  }
  return Infinity == $x1$jscomp$5$$ ? null : $layoutRectLtwh$$module$src$layout_rect$$($x0$jscomp$2$$, $y0$jscomp$2$$, $x1$jscomp$5$$ - $x0$jscomp$2$$, $y1$jscomp$5$$ - $y0$jscomp$2$$);
}
function $moveLayoutRect$$module$src$layout_rect$$($rect$jscomp$2$$, $dx$jscomp$4$$, $dy$jscomp$4$$) {
  return 0 == $dx$jscomp$4$$ && 0 == $dy$jscomp$4$$ || 0 == $rect$jscomp$2$$.width && 0 == $rect$jscomp$2$$.height ? $rect$jscomp$2$$ : $layoutRectLtwh$$module$src$layout_rect$$($rect$jscomp$2$$.left + $dx$jscomp$4$$, $rect$jscomp$2$$.top + $dy$jscomp$4$$, $rect$jscomp$2$$.width, $rect$jscomp$2$$.height);
}
;var $DEFAULT_THRESHOLD$$module$src$utils$intersection_observer_polyfill$$ = [0, 0.05, 0.1, 0.15, 0.2, 0.25, 0.3, 0.35, 0.4, 0.45, 0.5, 0.55, 0.6, 0.65, 0.7, 0.75, 0.8, 0.85, 0.9, 0.95, 1], $INIT_TIME$$module$src$utils$intersection_observer_polyfill$$ = Date.now();
function $IntersectionObserverHostApi$$module$src$utils$intersection_observer_polyfill$$($baseElement$$, $iframe$jscomp$12$$) {
  var $$jscomp$this$jscomp$4$$ = this;
  this.$baseElement_$ = $baseElement$$;
  this.$intersectionObserver_$ = null;
  this.$isInViewport_$ = this.$shouldObserve_$ = !1;
  this.$unlistenOnDestroy_$ = null;
  this.$viewport_$ = $baseElement$$.getViewport();
  this.$subscriptionApi_$ = new $SubscriptionApi$$module$src$iframe_helper$$($iframe$jscomp$12$$, function() {
    $JSCompiler_StaticMethods_startSendingIntersection_$$($$jscomp$this$jscomp$4$$);
  });
  this.$intersectionObserver_$ = new $IntersectionObserverPolyfill$$module$src$utils$intersection_observer_polyfill$$(function($baseElement$$) {
    for (var $iframe$jscomp$12$$ = 0; $iframe$jscomp$12$$ < $baseElement$$.length; $iframe$jscomp$12$$++) {
      delete $baseElement$$[$iframe$jscomp$12$$].target;
    }
    $$jscomp$this$jscomp$4$$.$subscriptionApi_$.send("intersection", $dict$$module$src$utils$object$$({changes:$baseElement$$}));
  });
  this.$intersectionObserver_$.tick(this.$viewport_$.getRect());
  this.fire = function() {
    $$jscomp$this$jscomp$4$$.$shouldObserve_$ && $$jscomp$this$jscomp$4$$.$isInViewport_$ && $$jscomp$this$jscomp$4$$.$intersectionObserver_$.tick($$jscomp$this$jscomp$4$$.$viewport_$.getRect());
  };
}
function $JSCompiler_StaticMethods_startSendingIntersection_$$($JSCompiler_StaticMethods_startSendingIntersection_$self$$) {
  $JSCompiler_StaticMethods_startSendingIntersection_$self$$.$shouldObserve_$ = !0;
  $JSCompiler_StaticMethods_startSendingIntersection_$self$$.$intersectionObserver_$.observe($JSCompiler_StaticMethods_startSendingIntersection_$self$$.$baseElement_$.element);
  $JSCompiler_StaticMethods_startSendingIntersection_$self$$.$baseElement_$.getVsync().measure(function() {
    $JSCompiler_StaticMethods_startSendingIntersection_$self$$.$isInViewport_$ = $JSCompiler_StaticMethods_startSendingIntersection_$self$$.$baseElement_$.isInViewport();
    $JSCompiler_StaticMethods_startSendingIntersection_$self$$.fire();
  });
  var $unlistenViewportScroll$$ = $JSCompiler_StaticMethods_startSendingIntersection_$self$$.$viewport_$.onScroll($JSCompiler_StaticMethods_startSendingIntersection_$self$$.fire), $unlistenViewportChange$$ = $JSCompiler_StaticMethods_startSendingIntersection_$self$$.$viewport_$.onChanged($JSCompiler_StaticMethods_startSendingIntersection_$self$$.fire);
  $JSCompiler_StaticMethods_startSendingIntersection_$self$$.$unlistenOnDestroy_$ = function() {
    $unlistenViewportScroll$$();
    $unlistenViewportChange$$();
  };
}
$IntersectionObserverHostApi$$module$src$utils$intersection_observer_polyfill$$.prototype.onViewportCallback = function($inViewport$$) {
  this.$isInViewport_$ = $inViewport$$;
};
$IntersectionObserverHostApi$$module$src$utils$intersection_observer_polyfill$$.prototype.destroy = function() {
  this.$shouldObserve_$ = !1;
  this.$intersectionObserver_$.disconnect();
  this.$intersectionObserver_$ = null;
  this.$unlistenOnDestroy_$ && (this.$unlistenOnDestroy_$(), this.$unlistenOnDestroy_$ = null);
  this.$subscriptionApi_$.destroy();
  this.$subscriptionApi_$ = null;
};
function $IntersectionObserverPolyfill$$module$src$utils$intersection_observer_polyfill$$($callback$jscomp$60_i$jscomp$36$$) {
  var $opt_option$$ = {threshold:$DEFAULT_THRESHOLD$$module$src$utils$intersection_observer_polyfill$$};
  this.$callback_$ = $callback$jscomp$60_i$jscomp$36$$;
  var $threshold$$ = $opt_option$$ && $opt_option$$.threshold;
  $threshold$$ = $threshold$$ ? Array.isArray($threshold$$) ? $threshold$$ : [$threshold$$] : [0];
  for ($callback$jscomp$60_i$jscomp$36$$ = 0; $callback$jscomp$60_i$jscomp$36$$ < $threshold$$.length; $callback$jscomp$60_i$jscomp$36$$++) {
    var $JSCompiler_value$jscomp$inline_104$$ = $threshold$$[$callback$jscomp$60_i$jscomp$36$$];
    "number" === typeof $JSCompiler_value$jscomp$inline_104$$ && isFinite($JSCompiler_value$jscomp$inline_104$$);
  }
  this.$threshold_$ = $threshold$$.sort();
  this.$lastViewportRect_$ = null;
  this.$observeEntries_$ = [];
  this.$mutationPass_$ = this.$hiddenObserverUnlistener_$ = null;
}
$JSCompiler_prototypeAlias$$ = $IntersectionObserverPolyfill$$module$src$utils$intersection_observer_polyfill$$.prototype;
$JSCompiler_prototypeAlias$$.disconnect = function() {
  this.$observeEntries_$.length = 0;
  $JSCompiler_StaticMethods_disconnectMutationObserver_$$(this);
};
$JSCompiler_prototypeAlias$$.observe = function($element$jscomp$78$$) {
  for (var $ampdoc$jscomp$12_change$jscomp$1_i$jscomp$37$$ = 0; $ampdoc$jscomp$12_change$jscomp$1_i$jscomp$37$$ < this.$observeEntries_$.length; $ampdoc$jscomp$12_change$jscomp$1_i$jscomp$37$$++) {
    if (this.$observeEntries_$[$ampdoc$jscomp$12_change$jscomp$1_i$jscomp$37$$].element === $element$jscomp$78$$) {
      $dev$$module$src$log$$().warn("INTERSECTION-OBSERVER", "should observe same element once");
      return;
    }
  }
  var $newState$$ = {element:$element$jscomp$78$$, currentThresholdSlot:0};
  this.$lastViewportRect_$ && ($ampdoc$jscomp$12_change$jscomp$1_i$jscomp$37$$ = $JSCompiler_StaticMethods_getValidIntersectionChangeEntry_$$(this, $newState$$, this.$lastViewportRect_$)) && this.$callback_$([$ampdoc$jscomp$12_change$jscomp$1_i$jscomp$37$$]);
  $ampdoc$jscomp$12_change$jscomp$1_i$jscomp$37$$ = $getAmpdoc$$module$src$service$$($element$jscomp$78$$);
  $ampdoc$jscomp$12_change$jscomp$1_i$jscomp$37$$.win.MutationObserver && !this.$hiddenObserverUnlistener_$ && (this.$mutationPass_$ = new $Pass$$module$src$pass$$($ampdoc$jscomp$12_change$jscomp$1_i$jscomp$37$$.win, this.$handleMutationObserverPass_$.bind(this, $element$jscomp$78$$)), this.$hiddenObserverUnlistener_$ = $getExistingServiceForDocInEmbedScope$$module$src$service$$($element$jscomp$78$$, "hidden-observer").add(this.$handleMutationObserverNotification_$.bind(this)));
  this.$observeEntries_$.push($newState$$);
};
$JSCompiler_prototypeAlias$$.unobserve = function($element$jscomp$79$$) {
  for (var $i$jscomp$38$$ = 0; $i$jscomp$38$$ < this.$observeEntries_$.length; $i$jscomp$38$$++) {
    if (this.$observeEntries_$[$i$jscomp$38$$].element === $element$jscomp$79$$) {
      this.$observeEntries_$.splice($i$jscomp$38$$, 1);
      0 >= this.$observeEntries_$.length && $JSCompiler_StaticMethods_disconnectMutationObserver_$$(this);
      return;
    }
  }
  $dev$$module$src$log$$().warn("INTERSECTION-OBSERVER", "unobserve non-observed element");
};
$JSCompiler_prototypeAlias$$.tick = function($hostViewport$jscomp$1$$) {
  this.$lastViewportRect_$ = $hostViewport$jscomp$1$$;
  for (var $changes$$ = [], $i$jscomp$39$$ = 0; $i$jscomp$39$$ < this.$observeEntries_$.length; $i$jscomp$39$$++) {
    var $change$jscomp$2$$ = $JSCompiler_StaticMethods_getValidIntersectionChangeEntry_$$(this, this.$observeEntries_$[$i$jscomp$39$$], $hostViewport$jscomp$1$$);
    $change$jscomp$2$$ && $changes$$.push($change$jscomp$2$$);
  }
  $changes$$.length && this.$callback_$($changes$$);
};
function $JSCompiler_StaticMethods_getValidIntersectionChangeEntry_$$($JSCompiler_StaticMethods_getValidIntersectionChangeEntry_$self_JSCompiler_inline_result$jscomp$41_JSCompiler_intersection$jscomp$inline_119_JSCompiler_sortedThreshold$jscomp$inline_111$$, $state$$, $hostViewport$jscomp$2$$) {
  var $element$jscomp$80$$ = $state$$.element, $elementRect$$ = $element$jscomp$80$$.getLayoutBox(), $JSCompiler_inline_result$jscomp$40_JSCompiler_smallerBoxArea$jscomp$inline_108_owner$jscomp$1$$ = $element$jscomp$80$$.getOwner(), $ownerRect$$ = $JSCompiler_inline_result$jscomp$40_JSCompiler_smallerBoxArea$jscomp$inline_108_owner$jscomp$1$$ && $JSCompiler_inline_result$jscomp$40_JSCompiler_smallerBoxArea$jscomp$inline_108_owner$jscomp$1$$.getLayoutBox(), $intersectionRect$$ = $rectIntersection$$module$src$layout_rect$$($elementRect$$, 
  $ownerRect$$, $hostViewport$jscomp$2$$) || $layoutRectLtwh$$module$src$layout_rect$$(0, 0, 0, 0);
  $JSCompiler_inline_result$jscomp$40_JSCompiler_smallerBoxArea$jscomp$inline_108_owner$jscomp$1$$ = $intersectionRect$$.width * $intersectionRect$$.height;
  var $JSCompiler_boundingClientRect$jscomp$inline_121_JSCompiler_largerBoxArea$jscomp$inline_109_JSCompiler_startIdx$jscomp$inline_113$$ = $elementRect$$.width * $elementRect$$.height;
  $JSCompiler_inline_result$jscomp$40_JSCompiler_smallerBoxArea$jscomp$inline_108_owner$jscomp$1$$ = 0 === $JSCompiler_boundingClientRect$jscomp$inline_121_JSCompiler_largerBoxArea$jscomp$inline_109_JSCompiler_startIdx$jscomp$inline_113$$ ? 0 : $JSCompiler_inline_result$jscomp$40_JSCompiler_smallerBoxArea$jscomp$inline_108_owner$jscomp$1$$ / $JSCompiler_boundingClientRect$jscomp$inline_121_JSCompiler_largerBoxArea$jscomp$inline_109_JSCompiler_startIdx$jscomp$inline_113$$;
  $JSCompiler_StaticMethods_getValidIntersectionChangeEntry_$self_JSCompiler_inline_result$jscomp$41_JSCompiler_intersection$jscomp$inline_119_JSCompiler_sortedThreshold$jscomp$inline_111$$ = $JSCompiler_StaticMethods_getValidIntersectionChangeEntry_$self_JSCompiler_inline_result$jscomp$41_JSCompiler_intersection$jscomp$inline_119_JSCompiler_sortedThreshold$jscomp$inline_111$$.$threshold_$;
  $JSCompiler_boundingClientRect$jscomp$inline_121_JSCompiler_largerBoxArea$jscomp$inline_109_JSCompiler_startIdx$jscomp$inline_113$$ = 0;
  var $JSCompiler_endIdx$jscomp$inline_114_JSCompiler_rootBounds$jscomp$inline_122$$ = $JSCompiler_StaticMethods_getValidIntersectionChangeEntry_$self_JSCompiler_inline_result$jscomp$41_JSCompiler_intersection$jscomp$inline_119_JSCompiler_sortedThreshold$jscomp$inline_111$$.length;
  if (0 == $JSCompiler_inline_result$jscomp$40_JSCompiler_smallerBoxArea$jscomp$inline_108_owner$jscomp$1$$) {
    $JSCompiler_StaticMethods_getValidIntersectionChangeEntry_$self_JSCompiler_inline_result$jscomp$41_JSCompiler_intersection$jscomp$inline_119_JSCompiler_sortedThreshold$jscomp$inline_111$$ = 0;
  } else {
    for (var $JSCompiler_mid$jscomp$inline_115$$ = ($JSCompiler_boundingClientRect$jscomp$inline_121_JSCompiler_largerBoxArea$jscomp$inline_109_JSCompiler_startIdx$jscomp$inline_113$$ + $JSCompiler_endIdx$jscomp$inline_114_JSCompiler_rootBounds$jscomp$inline_122$$) / 2 | 0; $JSCompiler_boundingClientRect$jscomp$inline_121_JSCompiler_largerBoxArea$jscomp$inline_109_JSCompiler_startIdx$jscomp$inline_113$$ < $JSCompiler_mid$jscomp$inline_115$$;) {
      $JSCompiler_inline_result$jscomp$40_JSCompiler_smallerBoxArea$jscomp$inline_108_owner$jscomp$1$$ < $JSCompiler_StaticMethods_getValidIntersectionChangeEntry_$self_JSCompiler_inline_result$jscomp$41_JSCompiler_intersection$jscomp$inline_119_JSCompiler_sortedThreshold$jscomp$inline_111$$[$JSCompiler_mid$jscomp$inline_115$$] ? $JSCompiler_endIdx$jscomp$inline_114_JSCompiler_rootBounds$jscomp$inline_122$$ = $JSCompiler_mid$jscomp$inline_115$$ : $JSCompiler_boundingClientRect$jscomp$inline_121_JSCompiler_largerBoxArea$jscomp$inline_109_JSCompiler_startIdx$jscomp$inline_113$$ = 
      $JSCompiler_mid$jscomp$inline_115$$, $JSCompiler_mid$jscomp$inline_115$$ = ($JSCompiler_boundingClientRect$jscomp$inline_121_JSCompiler_largerBoxArea$jscomp$inline_109_JSCompiler_startIdx$jscomp$inline_113$$ + $JSCompiler_endIdx$jscomp$inline_114_JSCompiler_rootBounds$jscomp$inline_122$$) / 2 | 0;
    }
    $JSCompiler_StaticMethods_getValidIntersectionChangeEntry_$self_JSCompiler_inline_result$jscomp$41_JSCompiler_intersection$jscomp$inline_119_JSCompiler_sortedThreshold$jscomp$inline_111$$ = $JSCompiler_endIdx$jscomp$inline_114_JSCompiler_rootBounds$jscomp$inline_122$$;
  }
  var $newThresholdSlot$$ = $JSCompiler_StaticMethods_getValidIntersectionChangeEntry_$self_JSCompiler_inline_result$jscomp$41_JSCompiler_intersection$jscomp$inline_119_JSCompiler_sortedThreshold$jscomp$inline_111$$;
  if ($newThresholdSlot$$ == $state$$.currentThresholdSlot) {
    return null;
  }
  $state$$.currentThresholdSlot = $newThresholdSlot$$;
  $JSCompiler_StaticMethods_getValidIntersectionChangeEntry_$self_JSCompiler_inline_result$jscomp$41_JSCompiler_intersection$jscomp$inline_119_JSCompiler_sortedThreshold$jscomp$inline_111$$ = $intersectionRect$$;
  $JSCompiler_boundingClientRect$jscomp$inline_121_JSCompiler_largerBoxArea$jscomp$inline_109_JSCompiler_startIdx$jscomp$inline_113$$ = $elementRect$$;
  if ($JSCompiler_endIdx$jscomp$inline_114_JSCompiler_rootBounds$jscomp$inline_122$$ = $hostViewport$jscomp$2$$) {
    $JSCompiler_StaticMethods_getValidIntersectionChangeEntry_$self_JSCompiler_inline_result$jscomp$41_JSCompiler_intersection$jscomp$inline_119_JSCompiler_sortedThreshold$jscomp$inline_111$$ = $moveLayoutRect$$module$src$layout_rect$$($JSCompiler_StaticMethods_getValidIntersectionChangeEntry_$self_JSCompiler_inline_result$jscomp$41_JSCompiler_intersection$jscomp$inline_119_JSCompiler_sortedThreshold$jscomp$inline_111$$, -$hostViewport$jscomp$2$$.left, -$hostViewport$jscomp$2$$.top), $JSCompiler_boundingClientRect$jscomp$inline_121_JSCompiler_largerBoxArea$jscomp$inline_109_JSCompiler_startIdx$jscomp$inline_113$$ = 
    $moveLayoutRect$$module$src$layout_rect$$($JSCompiler_boundingClientRect$jscomp$inline_121_JSCompiler_largerBoxArea$jscomp$inline_109_JSCompiler_startIdx$jscomp$inline_113$$, -$hostViewport$jscomp$2$$.left, -$hostViewport$jscomp$2$$.top), $JSCompiler_endIdx$jscomp$inline_114_JSCompiler_rootBounds$jscomp$inline_122$$ = $moveLayoutRect$$module$src$layout_rect$$($JSCompiler_endIdx$jscomp$inline_114_JSCompiler_rootBounds$jscomp$inline_122$$, -$hostViewport$jscomp$2$$.left, -$hostViewport$jscomp$2$$.top);
  }
  return {time:"undefined" !== typeof performance && performance.now ? performance.now() : Date.now() - $INIT_TIME$$module$src$utils$intersection_observer_polyfill$$, rootBounds:$JSCompiler_endIdx$jscomp$inline_114_JSCompiler_rootBounds$jscomp$inline_122$$, boundingClientRect:$JSCompiler_boundingClientRect$jscomp$inline_121_JSCompiler_largerBoxArea$jscomp$inline_109_JSCompiler_startIdx$jscomp$inline_113$$, intersectionRect:$JSCompiler_StaticMethods_getValidIntersectionChangeEntry_$self_JSCompiler_inline_result$jscomp$41_JSCompiler_intersection$jscomp$inline_119_JSCompiler_sortedThreshold$jscomp$inline_111$$, 
  intersectionRatio:$JSCompiler_inline_result$jscomp$40_JSCompiler_smallerBoxArea$jscomp$inline_108_owner$jscomp$1$$, target:$element$jscomp$80$$};
}
$JSCompiler_prototypeAlias$$.$handleMutationObserverNotification_$ = function() {
  this.$mutationPass_$.isPending() || this.$mutationPass_$.schedule(16);
};
$JSCompiler_prototypeAlias$$.$handleMutationObserverPass_$ = function($element$jscomp$81$$) {
  var $$jscomp$this$jscomp$6$$ = this, $viewport$jscomp$1$$ = $getServiceForDoc$$module$src$service$$($element$jscomp$81$$, "viewport");
  $getServiceForDoc$$module$src$service$$($element$jscomp$81$$, "resources").onNextPass(function() {
    $$jscomp$this$jscomp$6$$.tick($viewport$jscomp$1$$.getRect());
  });
};
function $JSCompiler_StaticMethods_disconnectMutationObserver_$$($JSCompiler_StaticMethods_disconnectMutationObserver_$self$$) {
  $JSCompiler_StaticMethods_disconnectMutationObserver_$self$$.$hiddenObserverUnlistener_$ && $JSCompiler_StaticMethods_disconnectMutationObserver_$self$$.$hiddenObserverUnlistener_$();
  $JSCompiler_StaticMethods_disconnectMutationObserver_$self$$.$hiddenObserverUnlistener_$ = null;
  $JSCompiler_StaticMethods_disconnectMutationObserver_$self$$.$mutationPass_$ && $JSCompiler_StaticMethods_disconnectMutationObserver_$self$$.$mutationPass_$.cancel();
  $JSCompiler_StaticMethods_disconnectMutationObserver_$self$$.$mutationPass_$ = null;
}
;var $CONTAINERS$$module$src$ad_helper$$ = {"AMP-FX-FLYING-CARPET":!0, "AMP-LIGHTBOX":!0, "AMP-STICKY-AD":!0, "AMP-LIGHTBOX-GALLERY":!0};
var $ATTRIBUTES_TO_PROPAGATE$$module$extensions$amp_iframe$0_1$amp_iframe$$ = "allowfullscreen allowpaymentrequest allowtransparency allow frameborder referrerpolicy scrolling tabindex title".split(" "), $count$$module$extensions$amp_iframe$0_1$amp_iframe$$ = 0;
function $AmpIframe$$module$extensions$amp_iframe$0_1$amp_iframe$$($$jscomp$super$this_element$jscomp$89$$) {
  $$jscomp$super$this_element$jscomp$89$$ = AMP.BaseElement.call(this, $$jscomp$super$this_element$jscomp$89$$) || this;
  $$jscomp$super$this_element$jscomp$89$$.$placeholder_$ = null;
  $$jscomp$super$this_element$jscomp$89$$.$isClickToPlay_$ = !1;
  $$jscomp$super$this_element$jscomp$89$$.$isAdLike_$ = !1;
  $$jscomp$super$this_element$jscomp$89$$.$isTrackingFrame_$ = !1;
  $$jscomp$super$this_element$jscomp$89$$.$isDisallowedAsAd_$ = !1;
  $$jscomp$super$this_element$jscomp$89$$.$iframeLayoutBox_$ = null;
  $$jscomp$super$this_element$jscomp$89$$.$iframe_$ = null;
  $$jscomp$super$this_element$jscomp$89$$.$isResizable_$ = !1;
  $$jscomp$super$this_element$jscomp$89$$.$intersectionObserverHostApi_$ = null;
  $$jscomp$super$this_element$jscomp$89$$.$sandbox_$ = "";
  $$jscomp$super$this_element$jscomp$89$$.$unlistenPym_$ = null;
  $$jscomp$super$this_element$jscomp$89$$.iframeSrc = null;
  $$jscomp$super$this_element$jscomp$89$$.$container_$ = null;
  $$jscomp$super$this_element$jscomp$89$$.$targetOrigin_$ = null;
  $$jscomp$super$this_element$jscomp$89$$.$hasErroredEmbedSize_$ = !1;
  return $$jscomp$super$this_element$jscomp$89$$;
}
var $JSCompiler_parentCtor$jscomp$inline_125$$ = AMP.BaseElement;
$AmpIframe$$module$extensions$amp_iframe$0_1$amp_iframe$$.prototype = $$jscomp$objectCreate$$($JSCompiler_parentCtor$jscomp$inline_125$$.prototype);
$AmpIframe$$module$extensions$amp_iframe$0_1$amp_iframe$$.prototype.constructor = $AmpIframe$$module$extensions$amp_iframe$0_1$amp_iframe$$;
if ($$jscomp$setPrototypeOf$$) {
  $$jscomp$setPrototypeOf$$($AmpIframe$$module$extensions$amp_iframe$0_1$amp_iframe$$, $JSCompiler_parentCtor$jscomp$inline_125$$);
} else {
  for (var $JSCompiler_p$jscomp$inline_126$$ in $JSCompiler_parentCtor$jscomp$inline_125$$) {
    if ("prototype" != $JSCompiler_p$jscomp$inline_126$$) {
      if (Object.defineProperties) {
        var $JSCompiler_descriptor$jscomp$inline_127$$ = Object.getOwnPropertyDescriptor($JSCompiler_parentCtor$jscomp$inline_125$$, $JSCompiler_p$jscomp$inline_126$$);
        $JSCompiler_descriptor$jscomp$inline_127$$ && Object.defineProperty($AmpIframe$$module$extensions$amp_iframe$0_1$amp_iframe$$, $JSCompiler_p$jscomp$inline_126$$, $JSCompiler_descriptor$jscomp$inline_127$$);
      } else {
        $AmpIframe$$module$extensions$amp_iframe$0_1$amp_iframe$$[$JSCompiler_p$jscomp$inline_126$$] = $JSCompiler_parentCtor$jscomp$inline_125$$[$JSCompiler_p$jscomp$inline_126$$];
      }
    }
  }
}
$AmpIframe$$module$extensions$amp_iframe$0_1$amp_iframe$$.$superClass_$ = $JSCompiler_parentCtor$jscomp$inline_125$$.prototype;
$JSCompiler_prototypeAlias$$ = $AmpIframe$$module$extensions$amp_iframe$0_1$amp_iframe$$.prototype;
$JSCompiler_prototypeAlias$$.isLayoutSupported = function($layout$jscomp$4$$) {
  return "fixed" == $layout$jscomp$4$$ || "fixed-height" == $layout$jscomp$4$$ || "responsive" == $layout$jscomp$4$$ || "fill" == $layout$jscomp$4$$ || "flex-item" == $layout$jscomp$4$$ || "fluid" == $layout$jscomp$4$$ || "intrinsic" == $layout$jscomp$4$$;
};
function $JSCompiler_StaticMethods_assertSource_$$($JSCompiler_StaticMethods_assertSource_$self_element$jscomp$90$$, $src$jscomp$4$$, $sandbox$$) {
  var $containerSrc$$ = window.location.href;
  $sandbox$$ = void 0 === $sandbox$$ ? "" : $sandbox$$;
  $JSCompiler_StaticMethods_assertSource_$self_element$jscomp$90$$ = $JSCompiler_StaticMethods_assertSource_$self_element$jscomp$90$$.element;
  var $urlService$$ = $getExistingServiceForDocInEmbedScope$$module$src$service$$($JSCompiler_StaticMethods_assertSource_$self_element$jscomp$90$$, "url"), $$jscomp$destructuring$var21_origin$jscomp$6$$ = $urlService$$.parse($src$jscomp$4$$), $hostname$$ = $$jscomp$destructuring$var21_origin$jscomp$6$$.hostname, $protocol$jscomp$1$$ = $$jscomp$destructuring$var21_origin$jscomp$6$$.protocol;
  $$jscomp$destructuring$var21_origin$jscomp$6$$ = $$jscomp$destructuring$var21_origin$jscomp$6$$.origin;
  $userAssert$$module$src$log$$($urlService$$.isSecure($src$jscomp$4$$) || "data:" == $protocol$jscomp$1$$, "Invalid <amp-iframe> src. Must start with https://. Found %s", $JSCompiler_StaticMethods_assertSource_$self_element$jscomp$90$$);
  var $containerUrl$$ = $urlService$$.parse($containerSrc$$);
  $userAssert$$module$src$log$$(!/\sallow-same-origin\s/i.test(" " + $sandbox$$ + " ") || $$jscomp$destructuring$var21_origin$jscomp$6$$ != $containerUrl$$.origin && "data:" != $protocol$jscomp$1$$, "Origin of <amp-iframe> must not be equal to container %sif allow-same-origin is set. See https://github.com/ampproject/amphtml/blob/master/spec/amp-iframe-origin-policy.md for details.", $JSCompiler_StaticMethods_assertSource_$self_element$jscomp$90$$);
  $userAssert$$module$src$log$$(!($endsWith$$module$src$string$$($hostname$$, "." + $urls$$module$src$config$$.thirdPartyFrameHost) || $endsWith$$module$src$string$$($hostname$$, ".ampproject.org")), "amp-iframe does not allow embedding of frames from ampproject.*: %s", $src$jscomp$4$$);
  return $src$jscomp$4$$;
}
function $JSCompiler_StaticMethods_assertPosition_$$($JSCompiler_StaticMethods_assertPosition_$self$$) {
  var $pos$jscomp$1$$ = $JSCompiler_StaticMethods_assertPosition_$self$$.element.getLayoutBox(), $minTop$$ = Math.min(600, 0.75 * $JSCompiler_StaticMethods_assertPosition_$self$$.getViewport().getSize().height);
  $userAssert$$module$src$log$$($pos$jscomp$1$$.top >= $minTop$$, "<amp-iframe> elements must be positioned outside the first 75% of the viewport or 600px from the top (whichever is smaller): %s  Current position %s. Min: %sPositioning rules don't apply for iframes that use `placeholder`.See https://github.com/ampproject/amphtml/blob/master/extensions/amp-iframe/amp-iframe.md#iframe-with-placeholder for details.", $JSCompiler_StaticMethods_assertPosition_$self$$.element, $pos$jscomp$1$$.top, $minTop$$);
}
function $JSCompiler_StaticMethods_transformSrc_$$($$jscomp$destructuring$var22_JSCompiler_StaticMethods_transformSrc_$self_JSCompiler_index$jscomp$inline_130$$, $JSCompiler_temp$jscomp$26_src$jscomp$5$$) {
  if ($JSCompiler_temp$jscomp$26_src$jscomp$5$$) {
    $$jscomp$destructuring$var22_JSCompiler_StaticMethods_transformSrc_$self_JSCompiler_index$jscomp$inline_130$$ = $getExistingServiceForDocInEmbedScope$$module$src$service$$($$jscomp$destructuring$var22_JSCompiler_StaticMethods_transformSrc_$self_JSCompiler_index$jscomp$inline_130$$.element, "url").parse($JSCompiler_temp$jscomp$26_src$jscomp$5$$);
    var $hash$jscomp$2$$ = $$jscomp$destructuring$var22_JSCompiler_StaticMethods_transformSrc_$self_JSCompiler_index$jscomp$inline_130$$.hash;
    "data:" == $$jscomp$destructuring$var22_JSCompiler_StaticMethods_transformSrc_$self_JSCompiler_index$jscomp$inline_130$$.protocol || $hash$jscomp$2$$ && "#" != $hash$jscomp$2$$ || ($$jscomp$destructuring$var22_JSCompiler_StaticMethods_transformSrc_$self_JSCompiler_index$jscomp$inline_130$$ = $JSCompiler_temp$jscomp$26_src$jscomp$5$$.indexOf("#"), $JSCompiler_temp$jscomp$26_src$jscomp$5$$ = (-1 == $$jscomp$destructuring$var22_JSCompiler_StaticMethods_transformSrc_$self_JSCompiler_index$jscomp$inline_130$$ ? 
    $JSCompiler_temp$jscomp$26_src$jscomp$5$$ : $JSCompiler_temp$jscomp$26_src$jscomp$5$$.substring(0, $$jscomp$destructuring$var22_JSCompiler_StaticMethods_transformSrc_$self_JSCompiler_index$jscomp$inline_130$$)) + "#amp=1");
    return $JSCompiler_temp$jscomp$26_src$jscomp$5$$;
  }
}
$JSCompiler_prototypeAlias$$.firstAttachedCallback = function() {
  this.$sandbox_$ = this.element.getAttribute("sandbox");
  var $JSCompiler_srcdoc$jscomp$inline_133_JSCompiler_str$jscomp$inline_236_JSCompiler_temp$jscomp$45_JSCompiler_temp_const$jscomp$230$$;
  if (!($JSCompiler_srcdoc$jscomp$inline_133_JSCompiler_str$jscomp$inline_236_JSCompiler_temp$jscomp$45_JSCompiler_temp_const$jscomp$230$$ = $JSCompiler_StaticMethods_transformSrc_$$(this, this.element.getAttribute("src")))) {
    if ($JSCompiler_srcdoc$jscomp$inline_133_JSCompiler_str$jscomp$inline_236_JSCompiler_temp$jscomp$45_JSCompiler_temp_const$jscomp$230$$ = this.element.getAttribute("srcdoc")) {
      $userAssert$$module$src$log$$(!(" " + this.$sandbox_$ + " ").match(/\s+allow-same-origin\s+/i), "allow-same-origin is not allowed with the srcdoc attribute %s.", this.element);
      if ("undefined" !== typeof TextEncoder) {
        var $JSCompiler_bytes$jscomp$inline_237_JSCompiler_bytes$jscomp$inline_241_JSCompiler_inline_result$jscomp$231_JSCompiler_temp$jscomp$229$$ = (new TextEncoder("utf-8")).encode($JSCompiler_srcdoc$jscomp$inline_133_JSCompiler_str$jscomp$inline_236_JSCompiler_temp$jscomp$45_JSCompiler_temp_const$jscomp$230$$);
      } else {
        $JSCompiler_srcdoc$jscomp$inline_133_JSCompiler_str$jscomp$inline_236_JSCompiler_temp$jscomp$45_JSCompiler_temp_const$jscomp$230$$ = unescape(encodeURIComponent($JSCompiler_srcdoc$jscomp$inline_133_JSCompiler_str$jscomp$inline_236_JSCompiler_temp$jscomp$45_JSCompiler_temp_const$jscomp$230$$));
        $JSCompiler_bytes$jscomp$inline_237_JSCompiler_bytes$jscomp$inline_241_JSCompiler_inline_result$jscomp$231_JSCompiler_temp$jscomp$229$$ = new Uint8Array($JSCompiler_srcdoc$jscomp$inline_133_JSCompiler_str$jscomp$inline_236_JSCompiler_temp$jscomp$45_JSCompiler_temp_const$jscomp$230$$.length);
        for (var $JSCompiler_array$jscomp$inline_242_JSCompiler_i$jscomp$inline_238$$ = 0; $JSCompiler_array$jscomp$inline_242_JSCompiler_i$jscomp$inline_238$$ < $JSCompiler_srcdoc$jscomp$inline_133_JSCompiler_str$jscomp$inline_236_JSCompiler_temp$jscomp$45_JSCompiler_temp_const$jscomp$230$$.length; $JSCompiler_array$jscomp$inline_242_JSCompiler_i$jscomp$inline_238$$++) {
          var $JSCompiler_charCode$jscomp$inline_239_JSCompiler_i$jscomp$inline_243$$ = $JSCompiler_srcdoc$jscomp$inline_133_JSCompiler_str$jscomp$inline_236_JSCompiler_temp$jscomp$45_JSCompiler_temp_const$jscomp$230$$.charCodeAt($JSCompiler_array$jscomp$inline_242_JSCompiler_i$jscomp$inline_238$$);
          $JSCompiler_bytes$jscomp$inline_237_JSCompiler_bytes$jscomp$inline_241_JSCompiler_inline_result$jscomp$231_JSCompiler_temp$jscomp$229$$[$JSCompiler_array$jscomp$inline_242_JSCompiler_i$jscomp$inline_238$$] = $JSCompiler_charCode$jscomp$inline_239_JSCompiler_i$jscomp$inline_243$$;
        }
      }
      $JSCompiler_srcdoc$jscomp$inline_133_JSCompiler_str$jscomp$inline_236_JSCompiler_temp$jscomp$45_JSCompiler_temp_const$jscomp$230$$ = btoa;
      $JSCompiler_array$jscomp$inline_242_JSCompiler_i$jscomp$inline_238$$ = Array($JSCompiler_bytes$jscomp$inline_237_JSCompiler_bytes$jscomp$inline_241_JSCompiler_inline_result$jscomp$231_JSCompiler_temp$jscomp$229$$.length);
      for ($JSCompiler_charCode$jscomp$inline_239_JSCompiler_i$jscomp$inline_243$$ = 0; $JSCompiler_charCode$jscomp$inline_239_JSCompiler_i$jscomp$inline_243$$ < $JSCompiler_bytes$jscomp$inline_237_JSCompiler_bytes$jscomp$inline_241_JSCompiler_inline_result$jscomp$231_JSCompiler_temp$jscomp$229$$.length; $JSCompiler_charCode$jscomp$inline_239_JSCompiler_i$jscomp$inline_243$$++) {
        $JSCompiler_array$jscomp$inline_242_JSCompiler_i$jscomp$inline_238$$[$JSCompiler_charCode$jscomp$inline_239_JSCompiler_i$jscomp$inline_243$$] = String.fromCharCode($JSCompiler_bytes$jscomp$inline_237_JSCompiler_bytes$jscomp$inline_241_JSCompiler_inline_result$jscomp$231_JSCompiler_temp$jscomp$229$$[$JSCompiler_charCode$jscomp$inline_239_JSCompiler_i$jscomp$inline_243$$]);
      }
      $JSCompiler_bytes$jscomp$inline_237_JSCompiler_bytes$jscomp$inline_241_JSCompiler_inline_result$jscomp$231_JSCompiler_temp$jscomp$229$$ = $JSCompiler_array$jscomp$inline_242_JSCompiler_i$jscomp$inline_238$$.join("");
      $JSCompiler_srcdoc$jscomp$inline_133_JSCompiler_str$jscomp$inline_236_JSCompiler_temp$jscomp$45_JSCompiler_temp_const$jscomp$230$$ = "data:text/html;charset=utf-8;base64," + $JSCompiler_srcdoc$jscomp$inline_133_JSCompiler_str$jscomp$inline_236_JSCompiler_temp$jscomp$45_JSCompiler_temp_const$jscomp$230$$($JSCompiler_bytes$jscomp$inline_237_JSCompiler_bytes$jscomp$inline_241_JSCompiler_inline_result$jscomp$231_JSCompiler_temp$jscomp$229$$);
    } else {
      $JSCompiler_srcdoc$jscomp$inline_133_JSCompiler_str$jscomp$inline_236_JSCompiler_temp$jscomp$45_JSCompiler_temp_const$jscomp$230$$ = void 0;
    }
  }
  this.iframeSrc = $JSCompiler_StaticMethods_assertSource_$$(this, $JSCompiler_srcdoc$jscomp$inline_133_JSCompiler_str$jscomp$inline_236_JSCompiler_temp$jscomp$45_JSCompiler_temp_const$jscomp$230$$, this.$sandbox_$);
};
$JSCompiler_prototypeAlias$$.preconnectCallback = function($onLayout$$) {
  this.iframeSrc && $getService$$module$src$service$$(this.win, "preconnect").url(this.getAmpDoc(), this.iframeSrc, $onLayout$$);
};
$JSCompiler_prototypeAlias$$.buildCallback = function() {
  this.$placeholder_$ = this.getPlaceholder();
  this.$isClickToPlay_$ = !!this.$placeholder_$;
  (this.$isResizable_$ = this.element.hasAttribute("resizable")) && this.element.setAttribute("scrolling", "no");
  this.element.hasAttribute("frameborder") || this.element.setAttribute("frameborder", "0");
  var $JSCompiler_element$jscomp$inline_136_JSCompiler_inline_result$jscomp$48$$ = this.element;
  if ("no" != $JSCompiler_element$jscomp$inline_136_JSCompiler_inline_result$jscomp$48$$.getAttribute("scrolling")) {
    var $JSCompiler_wrapper$jscomp$inline_137$$ = $JSCompiler_element$jscomp$inline_136_JSCompiler_inline_result$jscomp$48$$.ownerDocument.createElement("i-amphtml-scroll-container");
    $JSCompiler_element$jscomp$inline_136_JSCompiler_inline_result$jscomp$48$$.appendChild($JSCompiler_wrapper$jscomp$inline_137$$);
    $JSCompiler_element$jscomp$inline_136_JSCompiler_inline_result$jscomp$48$$ = $JSCompiler_wrapper$jscomp$inline_137$$;
  }
  this.$container_$ = $JSCompiler_element$jscomp$inline_136_JSCompiler_inline_result$jscomp$48$$;
  $JSCompiler_StaticMethods_registerIframeMessaging_$$(this);
};
$JSCompiler_prototypeAlias$$.onLayoutMeasure = function() {
  $JSCompiler_StaticMethods_measureIframeLayoutBox_$$(this);
  var $JSCompiler_el$jscomp$inline_151_element$jscomp$91$$ = this.element;
  a: {
    var $JSCompiler_$jscomp$inline_140_JSCompiler_box$jscomp$inline_220_JSCompiler_hasFixedAncestor$jscomp$inline_149_JSCompiler_width$jscomp$inline_142$$ = $JSCompiler_el$jscomp$inline_151_element$jscomp$91$$.getLayoutBox();
    var $JSCompiler_element$jscomp$inline_219_JSCompiler_height$jscomp$inline_141_JSCompiler_inline_result$jscomp$36_JSCompiler_temp$jscomp$43_JSCompiler_win$jscomp$inline_148$$ = $JSCompiler_$jscomp$inline_140_JSCompiler_box$jscomp$inline_220_JSCompiler_hasFixedAncestor$jscomp$inline_149_JSCompiler_width$jscomp$inline_142$$.height;
    $JSCompiler_$jscomp$inline_140_JSCompiler_box$jscomp$inline_220_JSCompiler_hasFixedAncestor$jscomp$inline_149_JSCompiler_width$jscomp$inline_142$$ = $JSCompiler_$jscomp$inline_140_JSCompiler_box$jscomp$inline_220_JSCompiler_hasFixedAncestor$jscomp$inline_149_JSCompiler_width$jscomp$inline_142$$.width;
    for (var $JSCompiler_containers$jscomp$inline_150_JSCompiler_i$jscomp$inline_143$$ = 0; $JSCompiler_containers$jscomp$inline_150_JSCompiler_i$jscomp$inline_143$$ < $adSizes$$module$src$iframe_helper$$.length; $JSCompiler_containers$jscomp$inline_150_JSCompiler_i$jscomp$inline_143$$++) {
      var $JSCompiler_position$jscomp$inline_224_JSCompiler_refWidth$jscomp$inline_144$$ = $adSizes$$module$src$iframe_helper$$[$JSCompiler_containers$jscomp$inline_150_JSCompiler_i$jscomp$inline_143$$][0], $JSCompiler_refHeight$jscomp$inline_145$$ = $adSizes$$module$src$iframe_helper$$[$JSCompiler_containers$jscomp$inline_150_JSCompiler_i$jscomp$inline_143$$][1];
      if (!($JSCompiler_refHeight$jscomp$inline_145$$ > $JSCompiler_element$jscomp$inline_219_JSCompiler_height$jscomp$inline_141_JSCompiler_inline_result$jscomp$36_JSCompiler_temp$jscomp$43_JSCompiler_win$jscomp$inline_148$$ || $JSCompiler_position$jscomp$inline_224_JSCompiler_refWidth$jscomp$inline_144$$ > $JSCompiler_$jscomp$inline_140_JSCompiler_box$jscomp$inline_220_JSCompiler_hasFixedAncestor$jscomp$inline_149_JSCompiler_width$jscomp$inline_142$$) && 20 >= $JSCompiler_element$jscomp$inline_219_JSCompiler_height$jscomp$inline_141_JSCompiler_inline_result$jscomp$36_JSCompiler_temp$jscomp$43_JSCompiler_win$jscomp$inline_148$$ - 
      $JSCompiler_refHeight$jscomp$inline_145$$ && 20 >= $JSCompiler_$jscomp$inline_140_JSCompiler_box$jscomp$inline_220_JSCompiler_hasFixedAncestor$jscomp$inline_149_JSCompiler_width$jscomp$inline_142$$ - $JSCompiler_position$jscomp$inline_224_JSCompiler_refWidth$jscomp$inline_144$$) {
        $JSCompiler_element$jscomp$inline_219_JSCompiler_height$jscomp$inline_141_JSCompiler_inline_result$jscomp$36_JSCompiler_temp$jscomp$43_JSCompiler_win$jscomp$inline_148$$ = !0;
        break a;
      }
    }
    $JSCompiler_element$jscomp$inline_219_JSCompiler_height$jscomp$inline_141_JSCompiler_inline_result$jscomp$36_JSCompiler_temp$jscomp$43_JSCompiler_win$jscomp$inline_148$$ = !1;
  }
  this.$isAdLike_$ = $JSCompiler_element$jscomp$inline_219_JSCompiler_height$jscomp$inline_141_JSCompiler_inline_result$jscomp$36_JSCompiler_temp$jscomp$43_JSCompiler_win$jscomp$inline_148$$;
  $JSCompiler_element$jscomp$inline_219_JSCompiler_height$jscomp$inline_141_JSCompiler_inline_result$jscomp$36_JSCompiler_temp$jscomp$43_JSCompiler_win$jscomp$inline_148$$ = this.element;
  $JSCompiler_$jscomp$inline_140_JSCompiler_box$jscomp$inline_220_JSCompiler_hasFixedAncestor$jscomp$inline_149_JSCompiler_width$jscomp$inline_142$$ = $JSCompiler_element$jscomp$inline_219_JSCompiler_height$jscomp$inline_141_JSCompiler_inline_result$jscomp$36_JSCompiler_temp$jscomp$43_JSCompiler_win$jscomp$inline_148$$.getLayoutBox();
  this.$isTrackingFrame_$ = 10 < $JSCompiler_$jscomp$inline_140_JSCompiler_box$jscomp$inline_220_JSCompiler_hasFixedAncestor$jscomp$inline_149_JSCompiler_width$jscomp$inline_142$$.width || 10 < $JSCompiler_$jscomp$inline_140_JSCompiler_box$jscomp$inline_220_JSCompiler_hasFixedAncestor$jscomp$inline_149_JSCompiler_width$jscomp$inline_142$$.height ? !1 : !$closestAncestorElementBySelector$$module$src$dom$$($JSCompiler_element$jscomp$inline_219_JSCompiler_height$jscomp$inline_141_JSCompiler_inline_result$jscomp$36_JSCompiler_temp$jscomp$43_JSCompiler_win$jscomp$inline_148$$);
  if ($JSCompiler_element$jscomp$inline_219_JSCompiler_height$jscomp$inline_141_JSCompiler_inline_result$jscomp$36_JSCompiler_temp$jscomp$43_JSCompiler_win$jscomp$inline_148$$ = this.$isAdLike_$) {
    $JSCompiler_element$jscomp$inline_219_JSCompiler_height$jscomp$inline_141_JSCompiler_inline_result$jscomp$36_JSCompiler_temp$jscomp$43_JSCompiler_win$jscomp$inline_148$$ = this.win;
    $JSCompiler_$jscomp$inline_140_JSCompiler_box$jscomp$inline_220_JSCompiler_hasFixedAncestor$jscomp$inline_149_JSCompiler_width$jscomp$inline_142$$ = !1;
    $JSCompiler_containers$jscomp$inline_150_JSCompiler_i$jscomp$inline_143$$ = 0;
    do {
      $CONTAINERS$$module$src$ad_helper$$[$JSCompiler_el$jscomp$inline_151_element$jscomp$91$$.tagName] ? ($JSCompiler_containers$jscomp$inline_150_JSCompiler_i$jscomp$inline_143$$++, $JSCompiler_$jscomp$inline_140_JSCompiler_box$jscomp$inline_220_JSCompiler_hasFixedAncestor$jscomp$inline_149_JSCompiler_width$jscomp$inline_142$$ = !1) : ($JSCompiler_position$jscomp$inline_224_JSCompiler_refWidth$jscomp$inline_144$$ = ($JSCompiler_element$jscomp$inline_219_JSCompiler_height$jscomp$inline_141_JSCompiler_inline_result$jscomp$36_JSCompiler_temp$jscomp$43_JSCompiler_win$jscomp$inline_148$$.getComputedStyle($JSCompiler_el$jscomp$inline_151_element$jscomp$91$$) || 
      Object.create(null)).position, "fixed" != $JSCompiler_position$jscomp$inline_224_JSCompiler_refWidth$jscomp$inline_144$$ && "sticky" != $JSCompiler_position$jscomp$inline_224_JSCompiler_refWidth$jscomp$inline_144$$ || ($JSCompiler_$jscomp$inline_140_JSCompiler_box$jscomp$inline_220_JSCompiler_hasFixedAncestor$jscomp$inline_149_JSCompiler_width$jscomp$inline_142$$ = !0)), $JSCompiler_el$jscomp$inline_151_element$jscomp$91$$ = $JSCompiler_el$jscomp$inline_151_element$jscomp$91$$.parentElement;
    } while ($JSCompiler_el$jscomp$inline_151_element$jscomp$91$$ && "BODY" != $JSCompiler_el$jscomp$inline_151_element$jscomp$91$$.tagName);
    $JSCompiler_element$jscomp$inline_219_JSCompiler_height$jscomp$inline_141_JSCompiler_inline_result$jscomp$36_JSCompiler_temp$jscomp$43_JSCompiler_win$jscomp$inline_148$$ = !(!$JSCompiler_$jscomp$inline_140_JSCompiler_box$jscomp$inline_220_JSCompiler_hasFixedAncestor$jscomp$inline_149_JSCompiler_width$jscomp$inline_142$$ && 1 >= $JSCompiler_containers$jscomp$inline_150_JSCompiler_i$jscomp$inline_143$$);
  }
  this.$isDisallowedAsAd_$ = $JSCompiler_element$jscomp$inline_219_JSCompiler_height$jscomp$inline_141_JSCompiler_inline_result$jscomp$36_JSCompiler_temp$jscomp$43_JSCompiler_win$jscomp$inline_148$$;
  this.$intersectionObserverHostApi_$ && this.$intersectionObserverHostApi_$.fire();
};
function $JSCompiler_StaticMethods_measureIframeLayoutBox_$$($JSCompiler_StaticMethods_measureIframeLayoutBox_$self$$) {
  if ($JSCompiler_StaticMethods_measureIframeLayoutBox_$self$$.$iframe_$) {
    var $iframeBox$$ = $JSCompiler_StaticMethods_measureIframeLayoutBox_$self$$.getViewport().getLayoutRect($JSCompiler_StaticMethods_measureIframeLayoutBox_$self$$.$iframe_$), $box$jscomp$2$$ = $JSCompiler_StaticMethods_measureIframeLayoutBox_$self$$.getLayoutBox();
    $JSCompiler_StaticMethods_measureIframeLayoutBox_$self$$.$iframeLayoutBox_$ = $moveLayoutRect$$module$src$layout_rect$$($iframeBox$$, -$box$jscomp$2$$.left, -$box$jscomp$2$$.top);
  }
}
$JSCompiler_prototypeAlias$$.getIntersectionElementLayoutBox = function() {
  if (!this.$iframe_$) {
    return AMP.BaseElement.prototype.getIntersectionElementLayoutBox.call(this);
  }
  var $box$jscomp$3$$ = this.getLayoutBox();
  this.$iframeLayoutBox_$ || $JSCompiler_StaticMethods_measureIframeLayoutBox_$$(this);
  return $moveLayoutRect$$module$src$layout_rect$$(this.$iframeLayoutBox_$, $box$jscomp$3$$.left, $box$jscomp$3$$.top);
};
$JSCompiler_prototypeAlias$$.layoutCallback = function() {
  var $$jscomp$this$jscomp$7$$ = this;
  $userAssert$$module$src$log$$(!this.$isDisallowedAsAd_$, "amp-iframe is not used for displaying fixed ad. Please use amp-sticky-ad and amp-ad instead.");
  this.$isClickToPlay_$ || $JSCompiler_StaticMethods_assertPosition_$$(this);
  this.$isResizable_$ && $userAssert$$module$src$log$$(this.getOverflowElement(), "Overflow element must be defined for resizable frames: %s", this.element);
  if (!this.iframeSrc) {
    return $resolvedPromise$$module$src$resolved_promise$$();
  }
  if (this.$isTrackingFrame_$ && !this.getAmpDoc().registerSingleton(1)) {
    return console.error("Only 1 analytics/tracking iframe allowed per page. Please use amp-analytics instead or file a GitHub issue for your use case: https://github.com/ampproject/amphtml/issues/new"), $resolvedPromise$$module$src$resolved_promise$$();
  }
  var $iframe$jscomp$14$$ = this.element.ownerDocument.createElement("iframe");
  this.$iframe_$ = $iframe$jscomp$14$$;
  this.applyFillContent($iframe$jscomp$14$$);
  $iframe$jscomp$14$$.name = "amp_iframe" + $count$$module$extensions$amp_iframe$0_1$amp_iframe$$++;
  this.$isClickToPlay_$ && $setStyle$$module$src$style$$($iframe$jscomp$14$$, -1);
  this.propagateAttributes($ATTRIBUTES_TO_PROPAGATE$$module$extensions$amp_iframe$0_1$amp_iframe$$, $iframe$jscomp$14$$);
  var $allowVal$$ = $iframe$jscomp$14$$.getAttribute("allow") || "";
  $allowVal$$ = $allowVal$$.replace("autoplay", "autoplay-disabled");
  $iframe$jscomp$14$$.setAttribute("allow", $allowVal$$);
  $iframe$jscomp$14$$.setAttribute("sandbox", this.$sandbox_$ || "");
  $experimentToggles$$module$src$experiments$$(this.win)["pausable-iframe"] && $makePausable$$module$src$iframe_helper$$(this.$iframe_$);
  $iframe$jscomp$14$$.src = this.iframeSrc;
  this.$isTrackingFrame_$ || (this.$intersectionObserverHostApi_$ = new $IntersectionObserverHostApi$$module$src$utils$intersection_observer_polyfill$$(this, $iframe$jscomp$14$$));
  $iframe$jscomp$14$$.onload = function() {
    $iframe$jscomp$14$$.readyState = "complete";
    $$jscomp$this$jscomp$7$$.$activateIframe_$();
    $$jscomp$this$jscomp$7$$.$isTrackingFrame_$ && ($$jscomp$this$jscomp$7$$.iframeSrc = null, $getService$$module$src$service$$($$jscomp$this$jscomp$7$$.win, "timer").promise(5000).then(function() {
      $iframe$jscomp$14$$.parentElement && $iframe$jscomp$14$$.parentElement.removeChild($iframe$jscomp$14$$);
      $$jscomp$this$jscomp$7$$.element.setAttribute("amp-removed", "");
      $$jscomp$this$jscomp$7$$.$iframe_$ = null;
    }));
  };
  $listenFor$$module$src$iframe_helper$$($iframe$jscomp$14$$, "embed-size", function($iframe$jscomp$14$$) {
    $JSCompiler_StaticMethods_updateSize_$$($$jscomp$this$jscomp$7$$, $iframe$jscomp$14$$.height, $iframe$jscomp$14$$.width);
  }, void 0, void 0, !0);
  this.$unlistenPym_$ = $listen$$module$src$event_helper$$(this.win, function($iframe$jscomp$14$$) {
    if ($$jscomp$this$jscomp$7$$.$iframe_$ && $iframe$jscomp$14$$.source === $$jscomp$this$jscomp$7$$.$iframe_$.contentWindow && ($iframe$jscomp$14$$ = $iframe$jscomp$14$$.data, "string" === typeof $iframe$jscomp$14$$ && $startsWith$$module$src$string$$($iframe$jscomp$14$$, "pym"))) {
      var $allowVal$$ = $iframe$jscomp$14$$.split(/xPYMx/);
      "height" === $allowVal$$[2] ? $JSCompiler_StaticMethods_updateSize_$$($$jscomp$this$jscomp$7$$, parseInt($allowVal$$[3], 10), void 0) : "width" === $allowVal$$[2] ? $JSCompiler_StaticMethods_updateSize_$$($$jscomp$this$jscomp$7$$, void 0, parseInt($allowVal$$[3], 10)) : $user$$module$src$log$$().warn("amp-iframe", "Unsupported Pym.js message: " + $iframe$jscomp$14$$);
    }
  });
  this.$isClickToPlay_$ && $listenFor$$module$src$iframe_helper$$($iframe$jscomp$14$$, "embed-ready", this.$activateIframe_$.bind(this));
  this.$container_$.appendChild($iframe$jscomp$14$$);
  return this.loadPromise($iframe$jscomp$14$$).then(function() {
    $$jscomp$this$jscomp$7$$.$container_$ != $$jscomp$this$jscomp$7$$.element && $getService$$module$src$service$$($$jscomp$this$jscomp$7$$.win, "timer").delay(function() {
      $$jscomp$this$jscomp$7$$.mutateElement(function() {
        $$jscomp$this$jscomp$7$$.$container_$.classList.add("amp-active");
      });
    }, 1000);
  });
};
$JSCompiler_prototypeAlias$$.unlayoutOnPause = function() {
  return !$JSCompiler_StaticMethods_isPausable_$$(this);
};
$JSCompiler_prototypeAlias$$.pauseCallback = function() {
  $JSCompiler_StaticMethods_isPausable_$$(this) && $toggle$$module$src$style$$(this.$iframe_$, !1);
};
$JSCompiler_prototypeAlias$$.resumeCallback = function() {
  $JSCompiler_StaticMethods_isPausable_$$(this) && $toggle$$module$src$style$$(this.$iframe_$, !0);
};
function $JSCompiler_StaticMethods_isPausable_$$($JSCompiler_StaticMethods_isPausable_$self_JSCompiler_iframe$jscomp$inline_169$$) {
  var $JSCompiler_temp$jscomp$37$$;
  if ($JSCompiler_temp$jscomp$37$$ = !!$experimentToggles$$module$src$experiments$$($JSCompiler_StaticMethods_isPausable_$self_JSCompiler_iframe$jscomp$inline_169$$.win)["pausable-iframe"] && !!$JSCompiler_StaticMethods_isPausable_$self_JSCompiler_iframe$jscomp$inline_169$$.$iframe_$) {
    $JSCompiler_StaticMethods_isPausable_$self_JSCompiler_iframe$jscomp$inline_169$$ = $JSCompiler_StaticMethods_isPausable_$self_JSCompiler_iframe$jscomp$inline_169$$.$iframe_$, $JSCompiler_temp$jscomp$37$$ = !!$JSCompiler_StaticMethods_isPausable_$self_JSCompiler_iframe$jscomp$inline_169$$.featurePolicy && -1 != $JSCompiler_StaticMethods_isPausable_$self_JSCompiler_iframe$jscomp$inline_169$$.featurePolicy.features().indexOf("execution-while-not-rendered") && !$JSCompiler_StaticMethods_isPausable_$self_JSCompiler_iframe$jscomp$inline_169$$.featurePolicy.allowsFeature("execution-while-not-rendered");
  }
  return $JSCompiler_temp$jscomp$37$$;
}
$JSCompiler_prototypeAlias$$.unlayoutCallback = function() {
  this.$unlistenPym_$ && (this.$unlistenPym_$(), this.$unlistenPym_$ = null);
  if (this.$iframe_$) {
    var $JSCompiler_element$jscomp$inline_171$$ = this.$iframe_$;
    $JSCompiler_element$jscomp$inline_171$$.parentElement && $JSCompiler_element$jscomp$inline_171$$.parentElement.removeChild($JSCompiler_element$jscomp$inline_171$$);
    this.$placeholder_$ && this.togglePlaceholder(!0);
    this.$iframe_$ = null;
    this.$intersectionObserverHostApi_$ && (this.$intersectionObserverHostApi_$.destroy(), this.$intersectionObserverHostApi_$ = null);
  }
  return !0;
};
$JSCompiler_prototypeAlias$$.viewportCallback = function($inViewport$jscomp$1$$) {
  if (this.$intersectionObserverHostApi_$) {
    this.$intersectionObserverHostApi_$.onViewportCallback($inViewport$jscomp$1$$);
  }
};
$JSCompiler_prototypeAlias$$.getLayoutPriority = function() {
  return this.$isAdLike_$ ? 2 : this.$isTrackingFrame_$ ? 1 : AMP.BaseElement.prototype.getLayoutPriority.call(this);
};
$JSCompiler_prototypeAlias$$.mutatedAttributesCallback = function($mutations$$) {
  var $src$jscomp$6$$ = $mutations$$.src;
  void 0 !== $src$jscomp$6$$ && (this.iframeSrc = $JSCompiler_StaticMethods_transformSrc_$$(this, $src$jscomp$6$$), this.$iframe_$ && (this.$iframe_$.src = $JSCompiler_StaticMethods_assertSource_$$(this, this.iframeSrc, this.$sandbox_$)));
  this.$iframe_$ && $mutations$$.title && this.propagateAttributes(["title"], this.$iframe_$);
};
$JSCompiler_prototypeAlias$$.$activateIframe_$ = function() {
  var $$jscomp$this$jscomp$8$$ = this;
  this.$placeholder_$ && this.getVsync().mutate(function() {
    $$jscomp$this$jscomp$8$$.$iframe_$ && ($setStyle$$module$src$style$$($$jscomp$this$jscomp$8$$.$iframe_$, 0), $$jscomp$this$jscomp$8$$.togglePlaceholder(!1));
  });
};
$JSCompiler_prototypeAlias$$.firstLayoutCompleted = function() {
};
$JSCompiler_prototypeAlias$$.throwIfCannotNavigate = function() {
  if (!/\sallow-top-navigation\s/i.test(" " + this.$sandbox_$ + " ")) {
    throw $user$$module$src$log$$().createError('"AMP.navigateTo" is only allowed on <amp-iframe> when its "sandbox" attribute contains "allow-top-navigation".');
  }
};
function $JSCompiler_StaticMethods_updateSize_$$($JSCompiler_StaticMethods_updateSize_$self$$, $height$jscomp$29$$, $width$jscomp$30$$) {
  if ($JSCompiler_StaticMethods_updateSize_$self$$.$isResizable_$) {
    if (100 > $height$jscomp$29$$) {
      $JSCompiler_StaticMethods_updateSize_$self$$.user().error("amp-iframe", "Ignoring embed-size request because the resize height is less than 100px. If you are using amp-iframe to display ads, consider using amp-ad instead.", $JSCompiler_StaticMethods_updateSize_$self$$.element);
    } else {
      var $newHeight$$, $newWidth$$;
      $height$jscomp$29$$ = parseInt($height$jscomp$29$$, 10);
      isNaN($height$jscomp$29$$) || ($newHeight$$ = Math.max($height$jscomp$29$$ + ($JSCompiler_StaticMethods_updateSize_$self$$.element.offsetHeight - $JSCompiler_StaticMethods_updateSize_$self$$.$iframe_$.offsetHeight), $height$jscomp$29$$));
      $width$jscomp$30$$ = parseInt($width$jscomp$30$$, 10);
      isNaN($width$jscomp$30$$) || ($newWidth$$ = Math.max($width$jscomp$30$$ + ($JSCompiler_StaticMethods_updateSize_$self$$.element.offsetWidth - $JSCompiler_StaticMethods_updateSize_$self$$.$iframe_$.offsetWidth), $width$jscomp$30$$));
      void 0 !== $newHeight$$ || void 0 !== $newWidth$$ ? $JSCompiler_StaticMethods_updateSize_$self$$.attemptChangeSize($newHeight$$, $newWidth$$).then(function() {
        void 0 !== $newHeight$$ && $JSCompiler_StaticMethods_updateSize_$self$$.element.setAttribute("height", $newHeight$$);
        void 0 !== $newWidth$$ && $JSCompiler_StaticMethods_updateSize_$self$$.element.setAttribute("width", $newWidth$$);
      }, function() {
      }) : $JSCompiler_StaticMethods_updateSize_$self$$.user().error("amp-iframe", "Ignoring embed-size request because no width or height value is provided", $JSCompiler_StaticMethods_updateSize_$self$$.element);
    }
  } else {
    $JSCompiler_StaticMethods_updateSize_$self$$.$hasErroredEmbedSize_$ || ($JSCompiler_StaticMethods_updateSize_$self$$.user().error("amp-iframe", "Ignoring embed-size request because this iframe is not resizable", $JSCompiler_StaticMethods_updateSize_$self$$.element), $JSCompiler_StaticMethods_updateSize_$self$$.$hasErroredEmbedSize_$ = !0);
  }
}
function $JSCompiler_StaticMethods_registerIframeMessaging_$$($JSCompiler_StaticMethods_registerIframeMessaging_$self$$) {
  if ($experimentToggles$$module$src$experiments$$($JSCompiler_StaticMethods_registerIframeMessaging_$self$$.win)["iframe-messaging"]) {
    var $element$jscomp$92$$ = $JSCompiler_StaticMethods_registerIframeMessaging_$self$$.element, $src$jscomp$7$$ = $element$jscomp$92$$.getAttribute("src");
    $src$jscomp$7$$ && ($JSCompiler_StaticMethods_registerIframeMessaging_$self$$.$targetOrigin_$ = $getExistingServiceForDocInEmbedScope$$module$src$service$$($element$jscomp$92$$, "url").parse($src$jscomp$7$$).origin);
    $JSCompiler_StaticMethods_registerIframeMessaging_$self$$.registerAction("postMessage", function($element$jscomp$92$$) {
      $JSCompiler_StaticMethods_registerIframeMessaging_$self$$.$targetOrigin_$ ? $JSCompiler_StaticMethods_registerIframeMessaging_$self$$.$iframe_$.contentWindow.postMessage($element$jscomp$92$$.args, $JSCompiler_StaticMethods_registerIframeMessaging_$self$$.$targetOrigin_$) : $user$$module$src$log$$().error("amp-iframe", '"postMessage" action is only allowed with "src"attribute with an origin.');
    });
    if ($JSCompiler_StaticMethods_registerIframeMessaging_$self$$.$targetOrigin_$) {
      var $unexpectedMessages$$ = 0, $listener$jscomp$70$$ = function($element$jscomp$92$$) {
        if ($element$jscomp$92$$.source === $JSCompiler_StaticMethods_registerIframeMessaging_$self$$.$iframe_$.contentWindow) {
          if ($element$jscomp$92$$.origin !== $JSCompiler_StaticMethods_registerIframeMessaging_$self$$.$targetOrigin_$) {
            $user$$module$src$log$$().error("amp-iframe", '"message" received from unexpected origin: ' + $element$jscomp$92$$.origin + ". Only allowed from: " + $JSCompiler_StaticMethods_registerIframeMessaging_$self$$.$targetOrigin_$);
          } else {
            if ($JSCompiler_StaticMethods_registerIframeMessaging_$self$$.getAmpDoc().getRootNode().activeElement !== $JSCompiler_StaticMethods_registerIframeMessaging_$self$$.$iframe_$) {
              var $src$jscomp$7$$ = !1;
            } else {
              $src$jscomp$7$$ = $JSCompiler_StaticMethods_registerIframeMessaging_$self$$.win.document.createElement("audio"), $src$jscomp$7$$.play(), $src$jscomp$7$$ = $src$jscomp$7$$.paused ? !1 : !0;
            }
            if ($src$jscomp$7$$) {
              var $JSCompiler_detail$jscomp$inline_177_JSCompiler_inline_result$jscomp$32_e$jscomp$25_event$jscomp$15$$ = $element$jscomp$92$$.data;
              try {
                var $sanitized$$ = JSON.parse(JSON.stringify($JSCompiler_detail$jscomp$inline_177_JSCompiler_inline_result$jscomp$32_e$jscomp$25_event$jscomp$15$$));
              } catch ($e$12$$) {
                $user$$module$src$log$$().error("amp-iframe", 'Data from "message" event must be JSON.');
                return;
              }
              var $JSCompiler_e$jscomp$inline_181_JSCompiler_win$jscomp$inline_176$$ = $JSCompiler_StaticMethods_registerIframeMessaging_$self$$.win;
              $element$jscomp$92$$ = $dict$$module$src$utils$object$$({data:$sanitized$$});
              $src$jscomp$7$$ = {detail:$element$jscomp$92$$};
              Object.assign($src$jscomp$7$$, void 0);
              "function" == typeof $JSCompiler_e$jscomp$inline_181_JSCompiler_win$jscomp$inline_176$$.CustomEvent ? $element$jscomp$92$$ = new $JSCompiler_e$jscomp$inline_181_JSCompiler_win$jscomp$inline_176$$.CustomEvent("amp-iframe:message", $src$jscomp$7$$) : ($JSCompiler_e$jscomp$inline_181_JSCompiler_win$jscomp$inline_176$$ = $JSCompiler_e$jscomp$inline_181_JSCompiler_win$jscomp$inline_176$$.document.createEvent("CustomEvent"), $JSCompiler_e$jscomp$inline_181_JSCompiler_win$jscomp$inline_176$$.initCustomEvent("amp-iframe:message", 
              !!$src$jscomp$7$$.bubbles, !!$src$jscomp$7$$.cancelable, $element$jscomp$92$$), $element$jscomp$92$$ = $JSCompiler_e$jscomp$inline_181_JSCompiler_win$jscomp$inline_176$$);
              $getExistingServiceForDocInEmbedScope$$module$src$service$$($JSCompiler_StaticMethods_registerIframeMessaging_$self$$.element, "action").trigger($JSCompiler_StaticMethods_registerIframeMessaging_$self$$.element, "message", $element$jscomp$92$$, 3);
            } else {
              $unexpectedMessages$$++, $user$$module$src$log$$().error("amp-iframe", '"message" event may only be triggered from a user gesture.'), 10 <= $unexpectedMessages$$ && ($user$$module$src$log$$().error("amp-iframe", 'Too many non-gesture-triggered "message" events; detaching event listener.'), $JSCompiler_StaticMethods_registerIframeMessaging_$self$$.win.removeEventListener("message", $listener$jscomp$70$$));
            }
          }
        }
      };
      $JSCompiler_StaticMethods_registerIframeMessaging_$self$$.win.addEventListener("message", $listener$jscomp$70$$);
    }
  }
}
$JSCompiler_prototypeAlias$$.$setTargetOriginForTesting$ = function($value$jscomp$107$$) {
  this.$targetOrigin_$ = $value$jscomp$107$$;
};
(function($AMP$jscomp$1$$) {
  $AMP$jscomp$1$$.registerElement("amp-iframe", $AmpIframe$$module$extensions$amp_iframe$0_1$amp_iframe$$);
})(self.AMP);

})});

//# sourceMappingURL=amp-iframe-0.1.js.map
