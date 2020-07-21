(self.AMP=self.AMP||[]).push({n:"amp-twitter",v:"2007210308000",f:(function(AMP,_){
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
var $JSCompiler_temp$jscomp$20$$;
if ("function" == typeof Object.setPrototypeOf) {
  $JSCompiler_temp$jscomp$20$$ = Object.setPrototypeOf;
} else {
  var $JSCompiler_inline_result$jscomp$21$$;
  a: {
    var $JSCompiler_x$jscomp$inline_37$$ = {a:!0}, $JSCompiler_y$jscomp$inline_38$$ = {};
    try {
      $JSCompiler_y$jscomp$inline_38$$.__proto__ = $JSCompiler_x$jscomp$inline_37$$;
      $JSCompiler_inline_result$jscomp$21$$ = $JSCompiler_y$jscomp$inline_38$$.a;
      break a;
    } catch ($JSCompiler_e$jscomp$inline_39$$) {
    }
    $JSCompiler_inline_result$jscomp$21$$ = !1;
  }
  $JSCompiler_temp$jscomp$20$$ = $JSCompiler_inline_result$jscomp$21$$ ? function($target$jscomp$95$$, $proto$jscomp$3$$) {
    $target$jscomp$95$$.__proto__ = $proto$jscomp$3$$;
    if ($target$jscomp$95$$.__proto__ !== $proto$jscomp$3$$) {
      throw new TypeError($target$jscomp$95$$ + " is not extensible");
    }
    return $target$jscomp$95$$;
  } : null;
}
var $$jscomp$setPrototypeOf$$ = $JSCompiler_temp$jscomp$20$$;
function $tryDecodeUriComponent_$$module$src$url_try_decode_uri_component$$($component$jscomp$4$$, $fallback$$) {
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
    var $name$jscomp$71$$ = $tryDecodeUriComponent_$$module$src$url_try_decode_uri_component$$($match$$[1], $match$$[1]), $value$jscomp$88$$ = $match$$[2] ? $tryDecodeUriComponent_$$module$src$url_try_decode_uri_component$$($match$$[2].replace(/\+/g, " "), $match$$[2]) : "";
    $params$jscomp$1$$[$name$jscomp$71$$] = $value$jscomp$88$$;
  }
  return $params$jscomp$1$$;
}
;var $rtvVersion$$module$src$mode$$ = "";
function $getMode$$module$src$mode$$() {
  var $win$$ = self;
  if ($win$$.__AMP_MODE) {
    var $JSCompiler_hashQuery$jscomp$inline_42_JSCompiler_inline_result$jscomp$23_JSCompiler_temp$jscomp$22$$ = $win$$.__AMP_MODE;
  } else {
    $JSCompiler_hashQuery$jscomp$inline_42_JSCompiler_inline_result$jscomp$23_JSCompiler_temp$jscomp$22$$ = $parseQueryString_$$module$src$url_parse_query_string$$($win$$.location.originalHash || $win$$.location.hash);
    var $JSCompiler_searchQuery$jscomp$inline_43$$ = $parseQueryString_$$module$src$url_parse_query_string$$($win$$.location.search);
    $rtvVersion$$module$src$mode$$ || ($rtvVersion$$module$src$mode$$ = $win$$.AMP_CONFIG && $win$$.AMP_CONFIG.v ? $win$$.AMP_CONFIG.v : "012007210308000");
    $JSCompiler_hashQuery$jscomp$inline_42_JSCompiler_inline_result$jscomp$23_JSCompiler_temp$jscomp$22$$ = {localDev:!1, development:!!(0 <= ["1", "actions", "amp", "amp4ads", "amp4email"].indexOf($JSCompiler_hashQuery$jscomp$inline_42_JSCompiler_inline_result$jscomp$23_JSCompiler_temp$jscomp$22$$.development) || $win$$.AMP_DEV_MODE), examiner:"2" == $JSCompiler_hashQuery$jscomp$inline_42_JSCompiler_inline_result$jscomp$23_JSCompiler_temp$jscomp$22$$.development, esm:!1, geoOverride:$JSCompiler_hashQuery$jscomp$inline_42_JSCompiler_inline_result$jscomp$23_JSCompiler_temp$jscomp$22$$["amp-geo"], 
    minified:!0, lite:void 0 != $JSCompiler_searchQuery$jscomp$inline_43$$.amp_lite, test:!1, log:$JSCompiler_hashQuery$jscomp$inline_42_JSCompiler_inline_result$jscomp$23_JSCompiler_temp$jscomp$22$$.log, version:"2007210308000", rtvVersion:$rtvVersion$$module$src$mode$$};
    $JSCompiler_hashQuery$jscomp$inline_42_JSCompiler_inline_result$jscomp$23_JSCompiler_temp$jscomp$22$$ = $win$$.__AMP_MODE = $JSCompiler_hashQuery$jscomp$inline_42_JSCompiler_inline_result$jscomp$23_JSCompiler_temp$jscomp$22$$;
  }
  return $JSCompiler_hashQuery$jscomp$inline_42_JSCompiler_inline_result$jscomp$23_JSCompiler_temp$jscomp$22$$;
}
;var $env$$module$src$config$$ = self.AMP_CONFIG || {}, $cdnProxyRegex$$module$src$config$$ = ("string" == typeof $env$$module$src$config$$.cdnProxyRegex ? new RegExp($env$$module$src$config$$.cdnProxyRegex) : $env$$module$src$config$$.cdnProxyRegex) || /^https:\/\/([a-zA-Z0-9_-]+\.)?cdn\.ampproject\.org$/;
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
;function $dict$$module$src$utils$object$$($opt_initial$jscomp$1$$) {
  return $opt_initial$jscomp$1$$ || {};
}
;/*
 https://mths.be/cssescape v1.5.1 by @mathias | MIT license */
function $startsWith$$module$src$string$$($string$jscomp$6$$, $prefix$jscomp$4$$) {
  return $prefix$jscomp$4$$.length > $string$jscomp$6$$.length ? !1 : 0 == $string$jscomp$6$$.lastIndexOf($prefix$jscomp$4$$, 0);
}
;function $tryParseJson$$module$src$json$$($json$jscomp$1$$, $opt_onFailed$$) {
  try {
    return JSON.parse($json$jscomp$1$$);
  } catch ($e$jscomp$15$$) {
    return $opt_onFailed$$ && $opt_onFailed$$($e$jscomp$15$$), null;
  }
}
;function $deserializeMessage$$module$src$3p_frame_messaging$$($message$jscomp$36$$) {
  if (!$isAmpMessage$$module$src$3p_frame_messaging$$($message$jscomp$36$$)) {
    return null;
  }
  var $startPos$$ = $message$jscomp$36$$.indexOf("{");
  try {
    return JSON.parse($message$jscomp$36$$.substr($startPos$$));
  } catch ($e$jscomp$16$$) {
    return $dev$$module$src$log$$().error("MESSAGING", "Failed to parse message: " + $message$jscomp$36$$, $e$jscomp$16$$), null;
  }
}
function $isAmpMessage$$module$src$3p_frame_messaging$$($message$jscomp$37$$) {
  return "string" == typeof $message$jscomp$37$$ && 0 == $message$jscomp$37$$.indexOf("amp-") && -1 != $message$jscomp$37$$.indexOf("{");
}
;function $LruCache$$module$src$utils$lru_cache$$() {
  this.$capacity_$ = 100;
  this.$access_$ = this.$size_$ = 0;
  this.$cache_$ = Object.create(null);
}
$LruCache$$module$src$utils$lru_cache$$.prototype.has = function($key$jscomp$47$$) {
  return !!this.$cache_$[$key$jscomp$47$$];
};
$LruCache$$module$src$utils$lru_cache$$.prototype.get = function($key$jscomp$48$$) {
  var $cacheable$$ = this.$cache_$[$key$jscomp$48$$];
  if ($cacheable$$) {
    return $cacheable$$.access = ++this.$access_$, $cacheable$$.payload;
  }
};
$LruCache$$module$src$utils$lru_cache$$.prototype.put = function($JSCompiler_cache$jscomp$inline_49_key$jscomp$49$$, $payload$$) {
  this.has($JSCompiler_cache$jscomp$inline_49_key$jscomp$49$$) || this.$size_$++;
  this.$cache_$[$JSCompiler_cache$jscomp$inline_49_key$jscomp$49$$] = {payload:$payload$$, access:this.$access_$};
  if (!(this.$size_$ <= this.$capacity_$)) {
    $dev$$module$src$log$$().warn("lru-cache", "Trimming LRU cache");
    $JSCompiler_cache$jscomp$inline_49_key$jscomp$49$$ = this.$cache_$;
    var $JSCompiler_oldest$jscomp$inline_50$$ = this.$access_$ + 1, $JSCompiler_key$jscomp$inline_52$$;
    for ($JSCompiler_key$jscomp$inline_52$$ in $JSCompiler_cache$jscomp$inline_49_key$jscomp$49$$) {
      var $JSCompiler_access$jscomp$inline_53$$ = $JSCompiler_cache$jscomp$inline_49_key$jscomp$49$$[$JSCompiler_key$jscomp$inline_52$$].access;
      if ($JSCompiler_access$jscomp$inline_53$$ < $JSCompiler_oldest$jscomp$inline_50$$) {
        $JSCompiler_oldest$jscomp$inline_50$$ = $JSCompiler_access$jscomp$inline_53$$;
        var $JSCompiler_oldestKey$jscomp$inline_51$$ = $JSCompiler_key$jscomp$inline_52$$;
      }
    }
    void 0 !== $JSCompiler_oldestKey$jscomp$inline_51$$ && (delete $JSCompiler_cache$jscomp$inline_49_key$jscomp$49$$[$JSCompiler_oldestKey$jscomp$inline_51$$], this.$size_$--);
  }
};
$dict$$module$src$utils$object$$({c:!0, v:!0, a:!0, ad:!0, action:!0});
var $a$$module$src$url$$, $cache$$module$src$url$$;
function $parseUrlDeprecated$$module$src$url$$($JSCompiler_inline_result$jscomp$25_url$jscomp$25$$) {
  $a$$module$src$url$$ || ($a$$module$src$url$$ = self.document.createElement("a"), $cache$$module$src$url$$ = self.__AMP_URL_CACHE || (self.__AMP_URL_CACHE = new $LruCache$$module$src$utils$lru_cache$$));
  var $JSCompiler_opt_cache$jscomp$inline_56$$ = $cache$$module$src$url$$, $JSCompiler_a$jscomp$inline_57$$ = $a$$module$src$url$$;
  if ($JSCompiler_opt_cache$jscomp$inline_56$$ && $JSCompiler_opt_cache$jscomp$inline_56$$.has($JSCompiler_inline_result$jscomp$25_url$jscomp$25$$)) {
    $JSCompiler_inline_result$jscomp$25_url$jscomp$25$$ = $JSCompiler_opt_cache$jscomp$inline_56$$.get($JSCompiler_inline_result$jscomp$25_url$jscomp$25$$);
  } else {
    $JSCompiler_a$jscomp$inline_57$$.href = $JSCompiler_inline_result$jscomp$25_url$jscomp$25$$;
    $JSCompiler_a$jscomp$inline_57$$.protocol || ($JSCompiler_a$jscomp$inline_57$$.href = $JSCompiler_a$jscomp$inline_57$$.href);
    var $JSCompiler_info$jscomp$inline_58$$ = {href:$JSCompiler_a$jscomp$inline_57$$.href, protocol:$JSCompiler_a$jscomp$inline_57$$.protocol, host:$JSCompiler_a$jscomp$inline_57$$.host, hostname:$JSCompiler_a$jscomp$inline_57$$.hostname, port:"0" == $JSCompiler_a$jscomp$inline_57$$.port ? "" : $JSCompiler_a$jscomp$inline_57$$.port, pathname:$JSCompiler_a$jscomp$inline_57$$.pathname, search:$JSCompiler_a$jscomp$inline_57$$.search, hash:$JSCompiler_a$jscomp$inline_57$$.hash, origin:null};
    "/" !== $JSCompiler_info$jscomp$inline_58$$.pathname[0] && ($JSCompiler_info$jscomp$inline_58$$.pathname = "/" + $JSCompiler_info$jscomp$inline_58$$.pathname);
    if ("http:" == $JSCompiler_info$jscomp$inline_58$$.protocol && 80 == $JSCompiler_info$jscomp$inline_58$$.port || "https:" == $JSCompiler_info$jscomp$inline_58$$.protocol && 443 == $JSCompiler_info$jscomp$inline_58$$.port) {
      $JSCompiler_info$jscomp$inline_58$$.port = "", $JSCompiler_info$jscomp$inline_58$$.host = $JSCompiler_info$jscomp$inline_58$$.hostname;
    }
    $JSCompiler_info$jscomp$inline_58$$.origin = $JSCompiler_a$jscomp$inline_57$$.origin && "null" != $JSCompiler_a$jscomp$inline_57$$.origin ? $JSCompiler_a$jscomp$inline_57$$.origin : "data:" != $JSCompiler_info$jscomp$inline_58$$.protocol && $JSCompiler_info$jscomp$inline_58$$.host ? $JSCompiler_info$jscomp$inline_58$$.protocol + "//" + $JSCompiler_info$jscomp$inline_58$$.host : $JSCompiler_info$jscomp$inline_58$$.href;
    $JSCompiler_opt_cache$jscomp$inline_56$$ && $JSCompiler_opt_cache$jscomp$inline_56$$.put($JSCompiler_inline_result$jscomp$25_url$jscomp$25$$, $JSCompiler_info$jscomp$inline_58$$);
    $JSCompiler_inline_result$jscomp$25_url$jscomp$25$$ = $JSCompiler_info$jscomp$inline_58$$;
  }
  return $JSCompiler_inline_result$jscomp$25_url$jscomp$25$$;
}
;function $getExperimentToggles$$module$src$experiments$$($toggles$jscomp$3_win$jscomp$19$$) {
  var $experimentsString$$ = "";
  try {
    "localStorage" in $toggles$jscomp$3_win$jscomp$19$$ && ($experimentsString$$ = $toggles$jscomp$3_win$jscomp$19$$.localStorage.getItem("amp-experiment-toggles"));
  } catch ($e$jscomp$17$$) {
    $dev$$module$src$log$$().warn("EXPERIMENTS", "Failed to retrieve experiments from localStorage.");
  }
  var $tokens$$ = $experimentsString$$ ? $experimentsString$$.split(/\s*,\s*/g) : [];
  $toggles$jscomp$3_win$jscomp$19$$ = Object.create(null);
  for (var $i$jscomp$19$$ = 0; $i$jscomp$19$$ < $tokens$$.length; $i$jscomp$19$$++) {
    0 != $tokens$$[$i$jscomp$19$$].length && ("-" == $tokens$$[$i$jscomp$19$$][0] ? $toggles$jscomp$3_win$jscomp$19$$[$tokens$$[$i$jscomp$19$$].substr(1)] = !1 : $toggles$jscomp$3_win$jscomp$19$$[$tokens$$[$i$jscomp$19$$]] = !0);
  }
  return $toggles$jscomp$3_win$jscomp$19$$;
}
;function $getService$$module$src$service$$($win$jscomp$30$$, $id$jscomp$13$$) {
  $win$jscomp$30$$ = $win$jscomp$30$$.__AMP_TOP || ($win$jscomp$30$$.__AMP_TOP = $win$jscomp$30$$);
  return $getServiceInternal$$module$src$service$$($win$jscomp$30$$, $id$jscomp$13$$);
}
function $getServiceForDoc$$module$src$service$$($elementOrAmpDoc$$, $id$jscomp$17$$) {
  var $JSCompiler_ampdoc$jscomp$inline_61_JSCompiler_inline_result$jscomp$26_ampdoc$jscomp$3$$ = $getAmpdoc$$module$src$service$$($elementOrAmpDoc$$);
  $JSCompiler_ampdoc$jscomp$inline_61_JSCompiler_inline_result$jscomp$26_ampdoc$jscomp$3$$ = $getAmpdoc$$module$src$service$$($JSCompiler_ampdoc$jscomp$inline_61_JSCompiler_inline_result$jscomp$26_ampdoc$jscomp$3$$);
  $JSCompiler_ampdoc$jscomp$inline_61_JSCompiler_inline_result$jscomp$26_ampdoc$jscomp$3$$ = $JSCompiler_ampdoc$jscomp$inline_61_JSCompiler_inline_result$jscomp$26_ampdoc$jscomp$3$$.isSingleDoc() ? $JSCompiler_ampdoc$jscomp$inline_61_JSCompiler_inline_result$jscomp$26_ampdoc$jscomp$3$$.win : $JSCompiler_ampdoc$jscomp$inline_61_JSCompiler_inline_result$jscomp$26_ampdoc$jscomp$3$$;
  return $getServiceInternal$$module$src$service$$($JSCompiler_ampdoc$jscomp$inline_61_JSCompiler_inline_result$jscomp$26_ampdoc$jscomp$3$$, $id$jscomp$17$$);
}
function $getAmpdoc$$module$src$service$$($nodeOrDoc$jscomp$2$$) {
  return $nodeOrDoc$jscomp$2$$.nodeType ? $getService$$module$src$service$$(($nodeOrDoc$jscomp$2$$.ownerDocument || $nodeOrDoc$jscomp$2$$).defaultView, "ampdoc").getAmpDoc($nodeOrDoc$jscomp$2$$) : $nodeOrDoc$jscomp$2$$;
}
function $getServiceInternal$$module$src$service$$($holder$jscomp$4_s$jscomp$9$$, $id$jscomp$21$$) {
  var $JSCompiler_services$jscomp$inline_68$$ = $holder$jscomp$4_s$jscomp$9$$.__AMP_SERVICES;
  $JSCompiler_services$jscomp$inline_68$$ || ($JSCompiler_services$jscomp$inline_68$$ = $holder$jscomp$4_s$jscomp$9$$.__AMP_SERVICES = {});
  $holder$jscomp$4_s$jscomp$9$$ = $JSCompiler_services$jscomp$inline_68$$[$id$jscomp$21$$];
  $holder$jscomp$4_s$jscomp$9$$.obj || ($holder$jscomp$4_s$jscomp$9$$.obj = new $holder$jscomp$4_s$jscomp$9$$.ctor($holder$jscomp$4_s$jscomp$9$$.context), $holder$jscomp$4_s$jscomp$9$$.ctor = null, $holder$jscomp$4_s$jscomp$9$$.context = null, $holder$jscomp$4_s$jscomp$9$$.resolve && $holder$jscomp$4_s$jscomp$9$$.resolve($holder$jscomp$4_s$jscomp$9$$.obj));
  return $holder$jscomp$4_s$jscomp$9$$.obj;
}
;function $indexWithinParent$$module$src$utils$dom_fingerprint$$($element$jscomp$67$$) {
  for (var $nodeName$jscomp$1$$ = $element$jscomp$67$$.nodeName, $i$jscomp$22$$ = 0, $count$jscomp$40$$ = 0, $sibling$$ = $element$jscomp$67$$.previousElementSibling; $sibling$$ && 25 > $count$jscomp$40$$ && 100 > $i$jscomp$22$$;) {
    $sibling$$.nodeName == $nodeName$jscomp$1$$ && $count$jscomp$40$$++, $i$jscomp$22$$++, $sibling$$ = $sibling$$.previousElementSibling;
  }
  return 25 > $count$jscomp$40$$ && 100 > $i$jscomp$22$$ ? "." + $count$jscomp$40$$ : "";
}
;var $htmlContainer$$module$src$static_template$$;
var $propertyNameCache$$module$src$style$$, $vendorPrefixes$$module$src$style$$ = "Webkit webkit Moz moz ms O o".split(" ");
function $setStyle$$module$src$style$$($element$jscomp$70$$) {
  var $JSCompiler_inline_result$jscomp$31_JSCompiler_style$jscomp$inline_74_propertyName$jscomp$10$$ = $element$jscomp$70$$.style;
  if ($startsWith$$module$src$string$$("border", "--")) {
    $JSCompiler_inline_result$jscomp$31_JSCompiler_style$jscomp$inline_74_propertyName$jscomp$10$$ = "border";
  } else {
    $propertyNameCache$$module$src$style$$ || ($propertyNameCache$$module$src$style$$ = Object.create(null));
    var $JSCompiler_propertyName$jscomp$inline_77$$ = $propertyNameCache$$module$src$style$$.border;
    if (!$JSCompiler_propertyName$jscomp$inline_77$$) {
      $JSCompiler_propertyName$jscomp$inline_77$$ = "border";
      if (void 0 === $JSCompiler_inline_result$jscomp$31_JSCompiler_style$jscomp$inline_74_propertyName$jscomp$10$$.border) {
        var $JSCompiler_i$jscomp$inline_176_JSCompiler_inline_result$jscomp$166_JSCompiler_prefixedPropertyName$jscomp$inline_79$$;
        b: {
          for ($JSCompiler_i$jscomp$inline_176_JSCompiler_inline_result$jscomp$166_JSCompiler_prefixedPropertyName$jscomp$inline_79$$ = 0; $JSCompiler_i$jscomp$inline_176_JSCompiler_inline_result$jscomp$166_JSCompiler_prefixedPropertyName$jscomp$inline_79$$ < $vendorPrefixes$$module$src$style$$.length; $JSCompiler_i$jscomp$inline_176_JSCompiler_inline_result$jscomp$166_JSCompiler_prefixedPropertyName$jscomp$inline_79$$++) {
            var $JSCompiler_propertyName$jscomp$inline_177$$ = $vendorPrefixes$$module$src$style$$[$JSCompiler_i$jscomp$inline_176_JSCompiler_inline_result$jscomp$166_JSCompiler_prefixedPropertyName$jscomp$inline_79$$] + "Border";
            if (void 0 !== $JSCompiler_inline_result$jscomp$31_JSCompiler_style$jscomp$inline_74_propertyName$jscomp$10$$[$JSCompiler_propertyName$jscomp$inline_177$$]) {
              $JSCompiler_i$jscomp$inline_176_JSCompiler_inline_result$jscomp$166_JSCompiler_prefixedPropertyName$jscomp$inline_79$$ = $JSCompiler_propertyName$jscomp$inline_177$$;
              break b;
            }
          }
          $JSCompiler_i$jscomp$inline_176_JSCompiler_inline_result$jscomp$166_JSCompiler_prefixedPropertyName$jscomp$inline_79$$ = "";
        }
        void 0 !== $JSCompiler_inline_result$jscomp$31_JSCompiler_style$jscomp$inline_74_propertyName$jscomp$10$$[$JSCompiler_i$jscomp$inline_176_JSCompiler_inline_result$jscomp$166_JSCompiler_prefixedPropertyName$jscomp$inline_79$$] && ($JSCompiler_propertyName$jscomp$inline_77$$ = $JSCompiler_i$jscomp$inline_176_JSCompiler_inline_result$jscomp$166_JSCompiler_prefixedPropertyName$jscomp$inline_79$$);
      }
      $propertyNameCache$$module$src$style$$.border = $JSCompiler_propertyName$jscomp$inline_77$$;
    }
    $JSCompiler_inline_result$jscomp$31_JSCompiler_style$jscomp$inline_74_propertyName$jscomp$10$$ = $JSCompiler_propertyName$jscomp$inline_77$$;
  }
  $JSCompiler_inline_result$jscomp$31_JSCompiler_style$jscomp$inline_74_propertyName$jscomp$10$$ && ($startsWith$$module$src$string$$($JSCompiler_inline_result$jscomp$31_JSCompiler_style$jscomp$inline_74_propertyName$jscomp$10$$, "--") ? $element$jscomp$70$$.style.setProperty($JSCompiler_inline_result$jscomp$31_JSCompiler_style$jscomp$inline_74_propertyName$jscomp$10$$, "none") : $element$jscomp$70$$.style[$JSCompiler_inline_result$jscomp$31_JSCompiler_style$jscomp$inline_74_propertyName$jscomp$10$$] = 
  "none");
}
;function $getLengthNumeral$$module$src$layout$$($length$jscomp$21_res$jscomp$2$$) {
  $length$jscomp$21_res$jscomp$2$$ = parseFloat($length$jscomp$21_res$jscomp$2$$);
  return "number" === typeof $length$jscomp$21_res$jscomp$2$$ && isFinite($length$jscomp$21_res$jscomp$2$$) ? $length$jscomp$21_res$jscomp$2$$ : void 0;
}
;var $count$$module$src$3p_frame$$ = {};
function $getFrameAttributes$$module$src$3p_frame$$($JSCompiler_inline_result$jscomp$163_JSCompiler_params$jscomp$inline_188_parentWindow$jscomp$1$$, $JSCompiler_adSrc$jscomp$inline_105_element$jscomp$79$$) {
  $userAssert$$module$src$log$$("twitter", "Attribute type required for <amp-ad>: %s", $JSCompiler_adSrc$jscomp$inline_105_element$jscomp$79$$);
  var $JSCompiler_inline_result$jscomp$34_JSCompiler_windowDepth$jscomp$inline_82$$ = 0;
  for (var $JSCompiler_startTime$jscomp$inline_97_JSCompiler_win$jscomp$inline_83_attributes$jscomp$4$$ = $JSCompiler_inline_result$jscomp$163_JSCompiler_params$jscomp$inline_188_parentWindow$jscomp$1$$; $JSCompiler_startTime$jscomp$inline_97_JSCompiler_win$jscomp$inline_83_attributes$jscomp$4$$ && $JSCompiler_startTime$jscomp$inline_97_JSCompiler_win$jscomp$inline_83_attributes$jscomp$4$$ != $JSCompiler_startTime$jscomp$inline_97_JSCompiler_win$jscomp$inline_83_attributes$jscomp$4$$.parent; $JSCompiler_startTime$jscomp$inline_97_JSCompiler_win$jscomp$inline_83_attributes$jscomp$4$$ = 
  $JSCompiler_startTime$jscomp$inline_97_JSCompiler_win$jscomp$inline_83_attributes$jscomp$4$$.parent) {
    $JSCompiler_inline_result$jscomp$34_JSCompiler_windowDepth$jscomp$inline_82$$++;
  }
  $JSCompiler_inline_result$jscomp$34_JSCompiler_windowDepth$jscomp$inline_82$$ = String($JSCompiler_inline_result$jscomp$34_JSCompiler_windowDepth$jscomp$inline_82$$) + "-" + $getRandom$$module$src$3p_frame$$($JSCompiler_inline_result$jscomp$163_JSCompiler_params$jscomp$inline_188_parentWindow$jscomp$1$$);
  var $JSCompiler_attributes$jscomp$inline_86_JSCompiler_referrer$jscomp$inline_103_JSCompiler_width$jscomp$inline_98$$ = $JSCompiler_startTime$jscomp$inline_97_JSCompiler_win$jscomp$inline_83_attributes$jscomp$4$$ = {}, $JSCompiler_dataset$jscomp$inline_87_JSCompiler_temp_const$jscomp$161$$ = $JSCompiler_adSrc$jscomp$inline_105_element$jscomp$79$$.dataset, $JSCompiler_height$jscomp$inline_99_JSCompiler_json$jscomp$inline_89_JSCompiler_name$jscomp$inline_88_JSCompiler_obj$jscomp$inline_90_JSCompiler_temp_const$jscomp$162$$;
  for ($JSCompiler_height$jscomp$inline_99_JSCompiler_json$jscomp$inline_89_JSCompiler_name$jscomp$inline_88_JSCompiler_obj$jscomp$inline_90_JSCompiler_temp_const$jscomp$162$$ in $JSCompiler_dataset$jscomp$inline_87_JSCompiler_temp_const$jscomp$161$$) {
    $startsWith$$module$src$string$$($JSCompiler_height$jscomp$inline_99_JSCompiler_json$jscomp$inline_89_JSCompiler_name$jscomp$inline_88_JSCompiler_obj$jscomp$inline_90_JSCompiler_temp_const$jscomp$162$$, "vars") || ($JSCompiler_attributes$jscomp$inline_86_JSCompiler_referrer$jscomp$inline_103_JSCompiler_width$jscomp$inline_98$$[$JSCompiler_height$jscomp$inline_99_JSCompiler_json$jscomp$inline_89_JSCompiler_name$jscomp$inline_88_JSCompiler_obj$jscomp$inline_90_JSCompiler_temp_const$jscomp$162$$] = 
    $JSCompiler_dataset$jscomp$inline_87_JSCompiler_temp_const$jscomp$161$$[$JSCompiler_height$jscomp$inline_99_JSCompiler_json$jscomp$inline_89_JSCompiler_name$jscomp$inline_88_JSCompiler_obj$jscomp$inline_90_JSCompiler_temp_const$jscomp$162$$]);
  }
  if ($JSCompiler_height$jscomp$inline_99_JSCompiler_json$jscomp$inline_89_JSCompiler_name$jscomp$inline_88_JSCompiler_obj$jscomp$inline_90_JSCompiler_temp_const$jscomp$162$$ = $JSCompiler_adSrc$jscomp$inline_105_element$jscomp$79$$.getAttribute("json")) {
    $JSCompiler_height$jscomp$inline_99_JSCompiler_json$jscomp$inline_89_JSCompiler_name$jscomp$inline_88_JSCompiler_obj$jscomp$inline_90_JSCompiler_temp_const$jscomp$162$$ = $tryParseJson$$module$src$json$$($JSCompiler_height$jscomp$inline_99_JSCompiler_json$jscomp$inline_89_JSCompiler_name$jscomp$inline_88_JSCompiler_obj$jscomp$inline_90_JSCompiler_temp_const$jscomp$162$$);
    if (void 0 === $JSCompiler_height$jscomp$inline_99_JSCompiler_json$jscomp$inline_89_JSCompiler_name$jscomp$inline_88_JSCompiler_obj$jscomp$inline_90_JSCompiler_temp_const$jscomp$162$$) {
      throw $user$$module$src$log$$().createError("Error parsing JSON in json attribute in element %s", $JSCompiler_adSrc$jscomp$inline_105_element$jscomp$79$$);
    }
    for (var $JSCompiler_attributes$jscomp$inline_96_JSCompiler_key$jscomp$inline_91$$ in $JSCompiler_height$jscomp$inline_99_JSCompiler_json$jscomp$inline_89_JSCompiler_name$jscomp$inline_88_JSCompiler_obj$jscomp$inline_90_JSCompiler_temp_const$jscomp$162$$) {
      $JSCompiler_attributes$jscomp$inline_86_JSCompiler_referrer$jscomp$inline_103_JSCompiler_width$jscomp$inline_98$$[$JSCompiler_attributes$jscomp$inline_96_JSCompiler_key$jscomp$inline_91$$] = $JSCompiler_height$jscomp$inline_99_JSCompiler_json$jscomp$inline_89_JSCompiler_name$jscomp$inline_88_JSCompiler_obj$jscomp$inline_90_JSCompiler_temp_const$jscomp$162$$[$JSCompiler_attributes$jscomp$inline_96_JSCompiler_key$jscomp$inline_91$$];
    }
  }
  $JSCompiler_attributes$jscomp$inline_96_JSCompiler_key$jscomp$inline_91$$ = $JSCompiler_startTime$jscomp$inline_97_JSCompiler_win$jscomp$inline_83_attributes$jscomp$4$$;
  $JSCompiler_startTime$jscomp$inline_97_JSCompiler_win$jscomp$inline_83_attributes$jscomp$4$$ = Date.now();
  $JSCompiler_attributes$jscomp$inline_86_JSCompiler_referrer$jscomp$inline_103_JSCompiler_width$jscomp$inline_98$$ = $JSCompiler_adSrc$jscomp$inline_105_element$jscomp$79$$.getAttribute("width");
  $JSCompiler_height$jscomp$inline_99_JSCompiler_json$jscomp$inline_89_JSCompiler_name$jscomp$inline_88_JSCompiler_obj$jscomp$inline_90_JSCompiler_temp_const$jscomp$162$$ = $JSCompiler_adSrc$jscomp$inline_105_element$jscomp$79$$.getAttribute("height");
  $JSCompiler_attributes$jscomp$inline_96_JSCompiler_key$jscomp$inline_91$$ = $JSCompiler_attributes$jscomp$inline_96_JSCompiler_key$jscomp$inline_91$$ ? $JSCompiler_attributes$jscomp$inline_96_JSCompiler_key$jscomp$inline_91$$ : {};
  $JSCompiler_attributes$jscomp$inline_96_JSCompiler_key$jscomp$inline_91$$.width = $getLengthNumeral$$module$src$layout$$($JSCompiler_attributes$jscomp$inline_86_JSCompiler_referrer$jscomp$inline_103_JSCompiler_width$jscomp$inline_98$$);
  $JSCompiler_attributes$jscomp$inline_96_JSCompiler_key$jscomp$inline_91$$.height = $getLengthNumeral$$module$src$layout$$($JSCompiler_height$jscomp$inline_99_JSCompiler_json$jscomp$inline_89_JSCompiler_name$jscomp$inline_88_JSCompiler_obj$jscomp$inline_90_JSCompiler_temp_const$jscomp$162$$);
  $JSCompiler_adSrc$jscomp$inline_105_element$jscomp$79$$.getAttribute("title") && ($JSCompiler_attributes$jscomp$inline_96_JSCompiler_key$jscomp$inline_91$$.title = $JSCompiler_adSrc$jscomp$inline_105_element$jscomp$79$$.getAttribute("title"));
  var $JSCompiler_locationHref$jscomp$inline_100_JSCompiler_temp_const$jscomp$157$$ = $JSCompiler_inline_result$jscomp$163_JSCompiler_params$jscomp$inline_188_parentWindow$jscomp$1$$.location.href;
  "about:srcdoc" == $JSCompiler_locationHref$jscomp$inline_100_JSCompiler_temp_const$jscomp$157$$ && ($JSCompiler_locationHref$jscomp$inline_100_JSCompiler_temp_const$jscomp$157$$ = $JSCompiler_inline_result$jscomp$163_JSCompiler_params$jscomp$inline_188_parentWindow$jscomp$1$$.parent.location.href);
  var $JSCompiler_ampdoc$jscomp$inline_101_JSCompiler_temp_const$jscomp$153$$ = $getAmpdoc$$module$src$service$$($JSCompiler_adSrc$jscomp$inline_105_element$jscomp$79$$), $JSCompiler_docInfo$jscomp$inline_102_JSCompiler_temp_const$jscomp$158$$ = $getServiceForDoc$$module$src$service$$($JSCompiler_adSrc$jscomp$inline_105_element$jscomp$79$$, "documentInfo").get();
  $JSCompiler_attributes$jscomp$inline_86_JSCompiler_referrer$jscomp$inline_103_JSCompiler_width$jscomp$inline_98$$ = $getServiceForDoc$$module$src$service$$($JSCompiler_adSrc$jscomp$inline_105_element$jscomp$79$$, "viewer").getUnconfirmedReferrerUrl();
  var $JSCompiler_layoutRect$jscomp$inline_104_JSCompiler_temp_const$jscomp$152$$ = $JSCompiler_adSrc$jscomp$inline_105_element$jscomp$79$$.getPageLayoutBox();
  $JSCompiler_height$jscomp$inline_99_JSCompiler_json$jscomp$inline_89_JSCompiler_name$jscomp$inline_88_JSCompiler_obj$jscomp$inline_90_JSCompiler_temp_const$jscomp$162$$ = $JSCompiler_attributes$jscomp$inline_96_JSCompiler_key$jscomp$inline_91$$;
  $JSCompiler_dataset$jscomp$inline_87_JSCompiler_temp_const$jscomp$161$$ = $urls$$module$src$config$$.thirdParty + "/2007210308000/ampcontext-v0.js";
  var $JSCompiler_temp_const$jscomp$160$$ = $JSCompiler_docInfo$jscomp$inline_102_JSCompiler_temp_const$jscomp$158$$.sourceUrl, $JSCompiler_temp_const$jscomp$159$$ = $JSCompiler_docInfo$jscomp$inline_102_JSCompiler_temp_const$jscomp$158$$.canonicalUrl;
  $JSCompiler_docInfo$jscomp$inline_102_JSCompiler_temp_const$jscomp$158$$ = $JSCompiler_docInfo$jscomp$inline_102_JSCompiler_temp_const$jscomp$158$$.pageViewId;
  $JSCompiler_locationHref$jscomp$inline_100_JSCompiler_temp_const$jscomp$157$$ = {href:$JSCompiler_locationHref$jscomp$inline_100_JSCompiler_temp_const$jscomp$157$$};
  var $JSCompiler_temp_const$jscomp$156$$ = $JSCompiler_adSrc$jscomp$inline_105_element$jscomp$79$$.tagName, $JSCompiler_temp_const$jscomp$155$$ = {localDev:!1, development:$getMode$$module$src$mode$$().development, esm:!1, minified:!0, lite:$getMode$$module$src$mode$$().lite, test:!1, log:$getMode$$module$src$mode$$().log, version:$getMode$$module$src$mode$$().version, rtvVersion:$getMode$$module$src$mode$$().rtvVersion}, $JSCompiler_temp_const$jscomp$154$$ = !(!$JSCompiler_inline_result$jscomp$163_JSCompiler_params$jscomp$inline_188_parentWindow$jscomp$1$$.AMP_CONFIG || 
  !$JSCompiler_inline_result$jscomp$163_JSCompiler_params$jscomp$inline_188_parentWindow$jscomp$1$$.AMP_CONFIG.canary);
  $JSCompiler_ampdoc$jscomp$inline_101_JSCompiler_temp_const$jscomp$153$$ = !$JSCompiler_ampdoc$jscomp$inline_101_JSCompiler_temp_const$jscomp$153$$.isVisible();
  $JSCompiler_layoutRect$jscomp$inline_104_JSCompiler_temp_const$jscomp$152$$ = $JSCompiler_layoutRect$jscomp$inline_104_JSCompiler_temp_const$jscomp$152$$ ? {left:$JSCompiler_layoutRect$jscomp$inline_104_JSCompiler_temp_const$jscomp$152$$.left, top:$JSCompiler_layoutRect$jscomp$inline_104_JSCompiler_temp_const$jscomp$152$$.top, width:$JSCompiler_layoutRect$jscomp$inline_104_JSCompiler_temp_const$jscomp$152$$.width, height:$JSCompiler_layoutRect$jscomp$inline_104_JSCompiler_temp_const$jscomp$152$$.height} : 
  null;
  var $JSCompiler_temp_const$jscomp$151$$ = $JSCompiler_adSrc$jscomp$inline_105_element$jscomp$79$$.getIntersectionChangeEntry();
  var $JSCompiler_element$jscomp$inline_207_JSCompiler_inline_result$jscomp$205_JSCompiler_temp_const$jscomp$150$$ = $JSCompiler_adSrc$jscomp$inline_105_element$jscomp$79$$;
  for (var $JSCompiler_ids$jscomp$inline_208_JSCompiler_length$jscomp$inline_214_JSCompiler_toggles$jscomp$inline_180$$ = [], $JSCompiler_frequency$jscomp$inline_182_JSCompiler_hash$jscomp$inline_215_JSCompiler_level$jscomp$inline_209_JSCompiler_meta$jscomp$inline_184_JSCompiler_optedInExperiments$jscomp$inline_185_i$8$jscomp$inline_189$$ = 0; $JSCompiler_element$jscomp$inline_207_JSCompiler_inline_result$jscomp$205_JSCompiler_temp_const$jscomp$150$$ && 1 == $JSCompiler_element$jscomp$inline_207_JSCompiler_inline_result$jscomp$205_JSCompiler_temp_const$jscomp$150$$.nodeType && 
  25 > $JSCompiler_frequency$jscomp$inline_182_JSCompiler_hash$jscomp$inline_215_JSCompiler_level$jscomp$inline_209_JSCompiler_meta$jscomp$inline_184_JSCompiler_optedInExperiments$jscomp$inline_185_i$8$jscomp$inline_189$$;) {
    var $JSCompiler_i$jscomp$inline_186_JSCompiler_i$jscomp$inline_216_JSCompiler_id$jscomp$inline_210_JSCompiler_param$jscomp$inline_190$$ = "";
    $JSCompiler_element$jscomp$inline_207_JSCompiler_inline_result$jscomp$205_JSCompiler_temp_const$jscomp$150$$.id && ($JSCompiler_i$jscomp$inline_186_JSCompiler_i$jscomp$inline_216_JSCompiler_id$jscomp$inline_210_JSCompiler_param$jscomp$inline_190$$ = "/" + $JSCompiler_element$jscomp$inline_207_JSCompiler_inline_result$jscomp$205_JSCompiler_temp_const$jscomp$150$$.id);
    var $JSCompiler_nodeName$jscomp$inline_211$$ = $JSCompiler_element$jscomp$inline_207_JSCompiler_inline_result$jscomp$205_JSCompiler_temp_const$jscomp$150$$.nodeName.toLowerCase();
    $JSCompiler_ids$jscomp$inline_208_JSCompiler_length$jscomp$inline_214_JSCompiler_toggles$jscomp$inline_180$$.push("" + $JSCompiler_nodeName$jscomp$inline_211$$ + $JSCompiler_i$jscomp$inline_186_JSCompiler_i$jscomp$inline_216_JSCompiler_id$jscomp$inline_210_JSCompiler_param$jscomp$inline_190$$ + $indexWithinParent$$module$src$utils$dom_fingerprint$$($JSCompiler_element$jscomp$inline_207_JSCompiler_inline_result$jscomp$205_JSCompiler_temp_const$jscomp$150$$));
    $JSCompiler_frequency$jscomp$inline_182_JSCompiler_hash$jscomp$inline_215_JSCompiler_level$jscomp$inline_209_JSCompiler_meta$jscomp$inline_184_JSCompiler_optedInExperiments$jscomp$inline_185_i$8$jscomp$inline_189$$++;
    $JSCompiler_element$jscomp$inline_207_JSCompiler_inline_result$jscomp$205_JSCompiler_temp_const$jscomp$150$$ = $JSCompiler_element$jscomp$inline_207_JSCompiler_inline_result$jscomp$205_JSCompiler_temp_const$jscomp$150$$.parentElement;
  }
  $JSCompiler_element$jscomp$inline_207_JSCompiler_inline_result$jscomp$205_JSCompiler_temp_const$jscomp$150$$ = $JSCompiler_ids$jscomp$inline_208_JSCompiler_length$jscomp$inline_214_JSCompiler_toggles$jscomp$inline_180$$.join();
  $JSCompiler_ids$jscomp$inline_208_JSCompiler_length$jscomp$inline_214_JSCompiler_toggles$jscomp$inline_180$$ = $JSCompiler_element$jscomp$inline_207_JSCompiler_inline_result$jscomp$205_JSCompiler_temp_const$jscomp$150$$.length;
  $JSCompiler_frequency$jscomp$inline_182_JSCompiler_hash$jscomp$inline_215_JSCompiler_level$jscomp$inline_209_JSCompiler_meta$jscomp$inline_184_JSCompiler_optedInExperiments$jscomp$inline_185_i$8$jscomp$inline_189$$ = 5381;
  for ($JSCompiler_i$jscomp$inline_186_JSCompiler_i$jscomp$inline_216_JSCompiler_id$jscomp$inline_210_JSCompiler_param$jscomp$inline_190$$ = 0; $JSCompiler_i$jscomp$inline_186_JSCompiler_i$jscomp$inline_216_JSCompiler_id$jscomp$inline_210_JSCompiler_param$jscomp$inline_190$$ < $JSCompiler_ids$jscomp$inline_208_JSCompiler_length$jscomp$inline_214_JSCompiler_toggles$jscomp$inline_180$$; $JSCompiler_i$jscomp$inline_186_JSCompiler_i$jscomp$inline_216_JSCompiler_id$jscomp$inline_210_JSCompiler_param$jscomp$inline_190$$++) {
    $JSCompiler_frequency$jscomp$inline_182_JSCompiler_hash$jscomp$inline_215_JSCompiler_level$jscomp$inline_209_JSCompiler_meta$jscomp$inline_184_JSCompiler_optedInExperiments$jscomp$inline_185_i$8$jscomp$inline_189$$ = 33 * $JSCompiler_frequency$jscomp$inline_182_JSCompiler_hash$jscomp$inline_215_JSCompiler_level$jscomp$inline_209_JSCompiler_meta$jscomp$inline_184_JSCompiler_optedInExperiments$jscomp$inline_185_i$8$jscomp$inline_189$$ ^ $JSCompiler_element$jscomp$inline_207_JSCompiler_inline_result$jscomp$205_JSCompiler_temp_const$jscomp$150$$.charCodeAt($JSCompiler_i$jscomp$inline_186_JSCompiler_i$jscomp$inline_216_JSCompiler_id$jscomp$inline_210_JSCompiler_param$jscomp$inline_190$$);
  }
  $JSCompiler_element$jscomp$inline_207_JSCompiler_inline_result$jscomp$205_JSCompiler_temp_const$jscomp$150$$ = String($JSCompiler_frequency$jscomp$inline_182_JSCompiler_hash$jscomp$inline_215_JSCompiler_level$jscomp$inline_209_JSCompiler_meta$jscomp$inline_184_JSCompiler_optedInExperiments$jscomp$inline_185_i$8$jscomp$inline_189$$ >>> 0);
  if ($JSCompiler_inline_result$jscomp$163_JSCompiler_params$jscomp$inline_188_parentWindow$jscomp$1$$.__AMP__EXPERIMENT_TOGGLES) {
    $JSCompiler_inline_result$jscomp$163_JSCompiler_params$jscomp$inline_188_parentWindow$jscomp$1$$ = $JSCompiler_inline_result$jscomp$163_JSCompiler_params$jscomp$inline_188_parentWindow$jscomp$1$$.__AMP__EXPERIMENT_TOGGLES;
  } else {
    $JSCompiler_inline_result$jscomp$163_JSCompiler_params$jscomp$inline_188_parentWindow$jscomp$1$$.__AMP__EXPERIMENT_TOGGLES = Object.create(null);
    $JSCompiler_ids$jscomp$inline_208_JSCompiler_length$jscomp$inline_214_JSCompiler_toggles$jscomp$inline_180$$ = $JSCompiler_inline_result$jscomp$163_JSCompiler_params$jscomp$inline_188_parentWindow$jscomp$1$$.__AMP__EXPERIMENT_TOGGLES;
    if ($JSCompiler_inline_result$jscomp$163_JSCompiler_params$jscomp$inline_188_parentWindow$jscomp$1$$.AMP_CONFIG) {
      for (var $JSCompiler_allowed$jscomp$inline_183_JSCompiler_experimentId$jscomp$inline_181_allowed$7$jscomp$inline_187$$ in $JSCompiler_inline_result$jscomp$163_JSCompiler_params$jscomp$inline_188_parentWindow$jscomp$1$$.AMP_CONFIG) {
        $JSCompiler_frequency$jscomp$inline_182_JSCompiler_hash$jscomp$inline_215_JSCompiler_level$jscomp$inline_209_JSCompiler_meta$jscomp$inline_184_JSCompiler_optedInExperiments$jscomp$inline_185_i$8$jscomp$inline_189$$ = $JSCompiler_inline_result$jscomp$163_JSCompiler_params$jscomp$inline_188_parentWindow$jscomp$1$$.AMP_CONFIG[$JSCompiler_allowed$jscomp$inline_183_JSCompiler_experimentId$jscomp$inline_181_allowed$7$jscomp$inline_187$$], "number" === typeof $JSCompiler_frequency$jscomp$inline_182_JSCompiler_hash$jscomp$inline_215_JSCompiler_level$jscomp$inline_209_JSCompiler_meta$jscomp$inline_184_JSCompiler_optedInExperiments$jscomp$inline_185_i$8$jscomp$inline_189$$ && 
        0 <= $JSCompiler_frequency$jscomp$inline_182_JSCompiler_hash$jscomp$inline_215_JSCompiler_level$jscomp$inline_209_JSCompiler_meta$jscomp$inline_184_JSCompiler_optedInExperiments$jscomp$inline_185_i$8$jscomp$inline_189$$ && 1 >= $JSCompiler_frequency$jscomp$inline_182_JSCompiler_hash$jscomp$inline_215_JSCompiler_level$jscomp$inline_209_JSCompiler_meta$jscomp$inline_184_JSCompiler_optedInExperiments$jscomp$inline_185_i$8$jscomp$inline_189$$ && ($JSCompiler_ids$jscomp$inline_208_JSCompiler_length$jscomp$inline_214_JSCompiler_toggles$jscomp$inline_180$$[$JSCompiler_allowed$jscomp$inline_183_JSCompiler_experimentId$jscomp$inline_181_allowed$7$jscomp$inline_187$$] = 
        Math.random() < $JSCompiler_frequency$jscomp$inline_182_JSCompiler_hash$jscomp$inline_215_JSCompiler_level$jscomp$inline_209_JSCompiler_meta$jscomp$inline_184_JSCompiler_optedInExperiments$jscomp$inline_185_i$8$jscomp$inline_189$$);
      }
    }
    if ($JSCompiler_inline_result$jscomp$163_JSCompiler_params$jscomp$inline_188_parentWindow$jscomp$1$$.AMP_CONFIG && Array.isArray($JSCompiler_inline_result$jscomp$163_JSCompiler_params$jscomp$inline_188_parentWindow$jscomp$1$$.AMP_CONFIG["allow-doc-opt-in"]) && 0 < $JSCompiler_inline_result$jscomp$163_JSCompiler_params$jscomp$inline_188_parentWindow$jscomp$1$$.AMP_CONFIG["allow-doc-opt-in"].length && ($JSCompiler_allowed$jscomp$inline_183_JSCompiler_experimentId$jscomp$inline_181_allowed$7$jscomp$inline_187$$ = 
    $JSCompiler_inline_result$jscomp$163_JSCompiler_params$jscomp$inline_188_parentWindow$jscomp$1$$.AMP_CONFIG["allow-doc-opt-in"], $JSCompiler_frequency$jscomp$inline_182_JSCompiler_hash$jscomp$inline_215_JSCompiler_level$jscomp$inline_209_JSCompiler_meta$jscomp$inline_184_JSCompiler_optedInExperiments$jscomp$inline_185_i$8$jscomp$inline_189$$ = $JSCompiler_inline_result$jscomp$163_JSCompiler_params$jscomp$inline_188_parentWindow$jscomp$1$$.document.head.querySelector('meta[name="amp-experiments-opt-in"]'))) {
      for ($JSCompiler_frequency$jscomp$inline_182_JSCompiler_hash$jscomp$inline_215_JSCompiler_level$jscomp$inline_209_JSCompiler_meta$jscomp$inline_184_JSCompiler_optedInExperiments$jscomp$inline_185_i$8$jscomp$inline_189$$ = $JSCompiler_frequency$jscomp$inline_182_JSCompiler_hash$jscomp$inline_215_JSCompiler_level$jscomp$inline_209_JSCompiler_meta$jscomp$inline_184_JSCompiler_optedInExperiments$jscomp$inline_185_i$8$jscomp$inline_189$$.getAttribute("content").split(","), $JSCompiler_i$jscomp$inline_186_JSCompiler_i$jscomp$inline_216_JSCompiler_id$jscomp$inline_210_JSCompiler_param$jscomp$inline_190$$ = 
      0; $JSCompiler_i$jscomp$inline_186_JSCompiler_i$jscomp$inline_216_JSCompiler_id$jscomp$inline_210_JSCompiler_param$jscomp$inline_190$$ < $JSCompiler_frequency$jscomp$inline_182_JSCompiler_hash$jscomp$inline_215_JSCompiler_level$jscomp$inline_209_JSCompiler_meta$jscomp$inline_184_JSCompiler_optedInExperiments$jscomp$inline_185_i$8$jscomp$inline_189$$.length; $JSCompiler_i$jscomp$inline_186_JSCompiler_i$jscomp$inline_216_JSCompiler_id$jscomp$inline_210_JSCompiler_param$jscomp$inline_190$$++) {
        -1 != $JSCompiler_allowed$jscomp$inline_183_JSCompiler_experimentId$jscomp$inline_181_allowed$7$jscomp$inline_187$$.indexOf($JSCompiler_frequency$jscomp$inline_182_JSCompiler_hash$jscomp$inline_215_JSCompiler_level$jscomp$inline_209_JSCompiler_meta$jscomp$inline_184_JSCompiler_optedInExperiments$jscomp$inline_185_i$8$jscomp$inline_189$$[$JSCompiler_i$jscomp$inline_186_JSCompiler_i$jscomp$inline_216_JSCompiler_id$jscomp$inline_210_JSCompiler_param$jscomp$inline_190$$]) && ($JSCompiler_ids$jscomp$inline_208_JSCompiler_length$jscomp$inline_214_JSCompiler_toggles$jscomp$inline_180$$[$JSCompiler_frequency$jscomp$inline_182_JSCompiler_hash$jscomp$inline_215_JSCompiler_level$jscomp$inline_209_JSCompiler_meta$jscomp$inline_184_JSCompiler_optedInExperiments$jscomp$inline_185_i$8$jscomp$inline_189$$[$JSCompiler_i$jscomp$inline_186_JSCompiler_i$jscomp$inline_216_JSCompiler_id$jscomp$inline_210_JSCompiler_param$jscomp$inline_190$$]] = 
        !0);
      }
    }
    Object.assign($JSCompiler_ids$jscomp$inline_208_JSCompiler_length$jscomp$inline_214_JSCompiler_toggles$jscomp$inline_180$$, $getExperimentToggles$$module$src$experiments$$($JSCompiler_inline_result$jscomp$163_JSCompiler_params$jscomp$inline_188_parentWindow$jscomp$1$$));
    if ($JSCompiler_inline_result$jscomp$163_JSCompiler_params$jscomp$inline_188_parentWindow$jscomp$1$$.AMP_CONFIG && Array.isArray($JSCompiler_inline_result$jscomp$163_JSCompiler_params$jscomp$inline_188_parentWindow$jscomp$1$$.AMP_CONFIG["allow-url-opt-in"]) && 0 < $JSCompiler_inline_result$jscomp$163_JSCompiler_params$jscomp$inline_188_parentWindow$jscomp$1$$.AMP_CONFIG["allow-url-opt-in"].length) {
      for ($JSCompiler_allowed$jscomp$inline_183_JSCompiler_experimentId$jscomp$inline_181_allowed$7$jscomp$inline_187$$ = $JSCompiler_inline_result$jscomp$163_JSCompiler_params$jscomp$inline_188_parentWindow$jscomp$1$$.AMP_CONFIG["allow-url-opt-in"], $JSCompiler_inline_result$jscomp$163_JSCompiler_params$jscomp$inline_188_parentWindow$jscomp$1$$ = $parseQueryString_$$module$src$url_parse_query_string$$($JSCompiler_inline_result$jscomp$163_JSCompiler_params$jscomp$inline_188_parentWindow$jscomp$1$$.location.originalHash || 
      $JSCompiler_inline_result$jscomp$163_JSCompiler_params$jscomp$inline_188_parentWindow$jscomp$1$$.location.hash), $JSCompiler_frequency$jscomp$inline_182_JSCompiler_hash$jscomp$inline_215_JSCompiler_level$jscomp$inline_209_JSCompiler_meta$jscomp$inline_184_JSCompiler_optedInExperiments$jscomp$inline_185_i$8$jscomp$inline_189$$ = 0; $JSCompiler_frequency$jscomp$inline_182_JSCompiler_hash$jscomp$inline_215_JSCompiler_level$jscomp$inline_209_JSCompiler_meta$jscomp$inline_184_JSCompiler_optedInExperiments$jscomp$inline_185_i$8$jscomp$inline_189$$ < 
      $JSCompiler_allowed$jscomp$inline_183_JSCompiler_experimentId$jscomp$inline_181_allowed$7$jscomp$inline_187$$.length; $JSCompiler_frequency$jscomp$inline_182_JSCompiler_hash$jscomp$inline_215_JSCompiler_level$jscomp$inline_209_JSCompiler_meta$jscomp$inline_184_JSCompiler_optedInExperiments$jscomp$inline_185_i$8$jscomp$inline_189$$++) {
        $JSCompiler_i$jscomp$inline_186_JSCompiler_i$jscomp$inline_216_JSCompiler_id$jscomp$inline_210_JSCompiler_param$jscomp$inline_190$$ = $JSCompiler_inline_result$jscomp$163_JSCompiler_params$jscomp$inline_188_parentWindow$jscomp$1$$["e-" + $JSCompiler_allowed$jscomp$inline_183_JSCompiler_experimentId$jscomp$inline_181_allowed$7$jscomp$inline_187$$[$JSCompiler_frequency$jscomp$inline_182_JSCompiler_hash$jscomp$inline_215_JSCompiler_level$jscomp$inline_209_JSCompiler_meta$jscomp$inline_184_JSCompiler_optedInExperiments$jscomp$inline_185_i$8$jscomp$inline_189$$]], 
        "1" == $JSCompiler_i$jscomp$inline_186_JSCompiler_i$jscomp$inline_216_JSCompiler_id$jscomp$inline_210_JSCompiler_param$jscomp$inline_190$$ && ($JSCompiler_ids$jscomp$inline_208_JSCompiler_length$jscomp$inline_214_JSCompiler_toggles$jscomp$inline_180$$[$JSCompiler_allowed$jscomp$inline_183_JSCompiler_experimentId$jscomp$inline_181_allowed$7$jscomp$inline_187$$[$JSCompiler_frequency$jscomp$inline_182_JSCompiler_hash$jscomp$inline_215_JSCompiler_level$jscomp$inline_209_JSCompiler_meta$jscomp$inline_184_JSCompiler_optedInExperiments$jscomp$inline_185_i$8$jscomp$inline_189$$]] = 
        !0), "0" == $JSCompiler_i$jscomp$inline_186_JSCompiler_i$jscomp$inline_216_JSCompiler_id$jscomp$inline_210_JSCompiler_param$jscomp$inline_190$$ && ($JSCompiler_ids$jscomp$inline_208_JSCompiler_length$jscomp$inline_214_JSCompiler_toggles$jscomp$inline_180$$[$JSCompiler_allowed$jscomp$inline_183_JSCompiler_experimentId$jscomp$inline_181_allowed$7$jscomp$inline_187$$[$JSCompiler_frequency$jscomp$inline_182_JSCompiler_hash$jscomp$inline_215_JSCompiler_level$jscomp$inline_209_JSCompiler_meta$jscomp$inline_184_JSCompiler_optedInExperiments$jscomp$inline_185_i$8$jscomp$inline_189$$]] = 
        !1);
      }
    }
    $JSCompiler_inline_result$jscomp$163_JSCompiler_params$jscomp$inline_188_parentWindow$jscomp$1$$ = $JSCompiler_ids$jscomp$inline_208_JSCompiler_length$jscomp$inline_214_JSCompiler_toggles$jscomp$inline_180$$;
  }
  $JSCompiler_height$jscomp$inline_99_JSCompiler_json$jscomp$inline_89_JSCompiler_name$jscomp$inline_88_JSCompiler_obj$jscomp$inline_90_JSCompiler_temp_const$jscomp$162$$._context = $dict$$module$src$utils$object$$({ampcontextVersion:"2007210308000", ampcontextFilepath:$JSCompiler_dataset$jscomp$inline_87_JSCompiler_temp_const$jscomp$161$$, sourceUrl:$JSCompiler_temp_const$jscomp$160$$, referrer:$JSCompiler_attributes$jscomp$inline_86_JSCompiler_referrer$jscomp$inline_103_JSCompiler_width$jscomp$inline_98$$, 
  canonicalUrl:$JSCompiler_temp_const$jscomp$159$$, pageViewId:$JSCompiler_docInfo$jscomp$inline_102_JSCompiler_temp_const$jscomp$158$$, location:$JSCompiler_locationHref$jscomp$inline_100_JSCompiler_temp_const$jscomp$157$$, startTime:$JSCompiler_startTime$jscomp$inline_97_JSCompiler_win$jscomp$inline_83_attributes$jscomp$4$$, tagName:$JSCompiler_temp_const$jscomp$156$$, mode:$JSCompiler_temp_const$jscomp$155$$, canary:$JSCompiler_temp_const$jscomp$154$$, hidden:$JSCompiler_ampdoc$jscomp$inline_101_JSCompiler_temp_const$jscomp$153$$, 
  initialLayoutRect:$JSCompiler_layoutRect$jscomp$inline_104_JSCompiler_temp_const$jscomp$152$$, initialIntersection:$JSCompiler_temp_const$jscomp$151$$, domFingerprint:$JSCompiler_element$jscomp$inline_207_JSCompiler_inline_result$jscomp$205_JSCompiler_temp_const$jscomp$150$$, experimentToggles:$JSCompiler_inline_result$jscomp$163_JSCompiler_params$jscomp$inline_188_parentWindow$jscomp$1$$, sentinel:$JSCompiler_inline_result$jscomp$34_JSCompiler_windowDepth$jscomp$inline_82$$});
  ($JSCompiler_adSrc$jscomp$inline_105_element$jscomp$79$$ = $JSCompiler_adSrc$jscomp$inline_105_element$jscomp$79$$.getAttribute("src")) && ($JSCompiler_attributes$jscomp$inline_96_JSCompiler_key$jscomp$inline_91$$.src = $JSCompiler_adSrc$jscomp$inline_105_element$jscomp$79$$);
  $JSCompiler_startTime$jscomp$inline_97_JSCompiler_win$jscomp$inline_83_attributes$jscomp$4$$ = $JSCompiler_attributes$jscomp$inline_96_JSCompiler_key$jscomp$inline_91$$;
  $JSCompiler_startTime$jscomp$inline_97_JSCompiler_win$jscomp$inline_83_attributes$jscomp$4$$.type = "twitter";
  Object.assign($JSCompiler_startTime$jscomp$inline_97_JSCompiler_win$jscomp$inline_83_attributes$jscomp$4$$._context, null);
  return $JSCompiler_startTime$jscomp$inline_97_JSCompiler_win$jscomp$inline_83_attributes$jscomp$4$$;
}
function $getIframe$$module$src$3p_frame$$($baseUrl$jscomp$2_parentWindow$jscomp$2$$, $parentElement$$) {
  var $$jscomp$destructuring$var15_$jscomp$destructuring$var16_attributes$jscomp$5$$ = {allowFullscreen:!0};
  $$jscomp$destructuring$var15_$jscomp$destructuring$var16_attributes$jscomp$5$$ = void 0 === $$jscomp$destructuring$var15_$jscomp$destructuring$var16_attributes$jscomp$5$$ ? {} : $$jscomp$destructuring$var15_$jscomp$destructuring$var16_attributes$jscomp$5$$;
  var $disallowCustom$$ = $$jscomp$destructuring$var15_$jscomp$destructuring$var16_attributes$jscomp$5$$.disallowCustom, $allowFullscreen$$ = $$jscomp$destructuring$var15_$jscomp$destructuring$var16_attributes$jscomp$5$$.allowFullscreen;
  $$jscomp$destructuring$var15_$jscomp$destructuring$var16_attributes$jscomp$5$$ = $getFrameAttributes$$module$src$3p_frame$$($baseUrl$jscomp$2_parentWindow$jscomp$2$$, $parentElement$$);
  var $iframe$$ = $baseUrl$jscomp$2_parentWindow$jscomp$2$$.document.createElement("iframe");
  $count$$module$src$3p_frame$$[$$jscomp$destructuring$var15_$jscomp$destructuring$var16_attributes$jscomp$5$$.type] || ($count$$module$src$3p_frame$$[$$jscomp$destructuring$var15_$jscomp$destructuring$var16_attributes$jscomp$5$$.type] = 0);
  $count$$module$src$3p_frame$$[$$jscomp$destructuring$var15_$jscomp$destructuring$var16_attributes$jscomp$5$$.type] += 1;
  var $ampdoc$jscomp$13_name$jscomp$78$$ = $parentElement$$.getAmpDoc();
  $baseUrl$jscomp$2_parentWindow$jscomp$2$$ = $getBootstrapBaseUrl$$module$src$3p_frame$$($baseUrl$jscomp$2_parentWindow$jscomp$2$$, $ampdoc$jscomp$13_name$jscomp$78$$, $disallowCustom$$);
  var $host$$ = $parseUrlDeprecated$$module$src$url$$($baseUrl$jscomp$2_parentWindow$jscomp$2$$).hostname;
  $ampdoc$jscomp$13_name$jscomp$78$$ = JSON.stringify($dict$$module$src$utils$object$$({host:$host$$, type:$$jscomp$destructuring$var15_$jscomp$destructuring$var16_attributes$jscomp$5$$.type, count:$count$$module$src$3p_frame$$[$$jscomp$destructuring$var15_$jscomp$destructuring$var16_attributes$jscomp$5$$.type], attributes:$$jscomp$destructuring$var15_$jscomp$destructuring$var16_attributes$jscomp$5$$}));
  $iframe$$.src = $baseUrl$jscomp$2_parentWindow$jscomp$2$$;
  $iframe$$.ampLocation = $parseUrlDeprecated$$module$src$url$$($baseUrl$jscomp$2_parentWindow$jscomp$2$$);
  $iframe$$.name = $ampdoc$jscomp$13_name$jscomp$78$$;
  $$jscomp$destructuring$var15_$jscomp$destructuring$var16_attributes$jscomp$5$$.width && ($iframe$$.width = $$jscomp$destructuring$var15_$jscomp$destructuring$var16_attributes$jscomp$5$$.width);
  $$jscomp$destructuring$var15_$jscomp$destructuring$var16_attributes$jscomp$5$$.height && ($iframe$$.height = $$jscomp$destructuring$var15_$jscomp$destructuring$var16_attributes$jscomp$5$$.height);
  $$jscomp$destructuring$var15_$jscomp$destructuring$var16_attributes$jscomp$5$$.title && ($iframe$$.title = $$jscomp$destructuring$var15_$jscomp$destructuring$var16_attributes$jscomp$5$$.title);
  $allowFullscreen$$ && $iframe$$.setAttribute("allowfullscreen", "true");
  $iframe$$.setAttribute("scrolling", "no");
  $setStyle$$module$src$style$$($iframe$$);
  $iframe$$.onload = function() {
    this.readyState = "complete";
  };
  $iframe$$.setAttribute("allow", "sync-xhr 'none';");
  ["facebook"].includes("twitter") || $applySandbox$$module$src$3p_frame$$($iframe$$);
  $iframe$$.setAttribute("data-amp-3p-sentinel", $$jscomp$destructuring$var15_$jscomp$destructuring$var16_attributes$jscomp$5$$._context.sentinel);
  return $iframe$$;
}
function $getBootstrapBaseUrl$$module$src$3p_frame$$($parentWindow$jscomp$3$$, $JSCompiler_meta$jscomp$inline_110_ampdoc$jscomp$15$$, $JSCompiler_string$jscomp$inline_221_JSCompiler_url$jscomp$inline_218_opt_disallowCustom$jscomp$1$$) {
  if ($JSCompiler_string$jscomp$inline_221_JSCompiler_url$jscomp$inline_218_opt_disallowCustom$jscomp$1$$) {
    var $JSCompiler_parsed$jscomp$inline_112_JSCompiler_sourceName$jscomp$inline_193_JSCompiler_temp$jscomp$32_JSCompiler_temp$jscomp$33$$ = null;
  } else {
    if ($JSCompiler_meta$jscomp$inline_110_ampdoc$jscomp$15$$ = $JSCompiler_meta$jscomp$inline_110_ampdoc$jscomp$15$$.getMetaByName("amp-3p-iframe-src")) {
      $JSCompiler_parsed$jscomp$inline_112_JSCompiler_sourceName$jscomp$inline_193_JSCompiler_temp$jscomp$32_JSCompiler_temp$jscomp$33$$ = void 0 === $JSCompiler_parsed$jscomp$inline_112_JSCompiler_sourceName$jscomp$inline_193_JSCompiler_temp$jscomp$32_JSCompiler_temp$jscomp$33$$ ? "source" : $JSCompiler_parsed$jscomp$inline_112_JSCompiler_sourceName$jscomp$inline_193_JSCompiler_temp$jscomp$32_JSCompiler_temp$jscomp$33$$;
      $userAssert$$module$src$log$$(null != $JSCompiler_meta$jscomp$inline_110_ampdoc$jscomp$15$$, "%s %s must be available", 'meta[name="amp-3p-iframe-src"]', $JSCompiler_parsed$jscomp$inline_112_JSCompiler_sourceName$jscomp$inline_193_JSCompiler_temp$jscomp$32_JSCompiler_temp$jscomp$33$$);
      $JSCompiler_string$jscomp$inline_221_JSCompiler_url$jscomp$inline_218_opt_disallowCustom$jscomp$1$$ = $JSCompiler_meta$jscomp$inline_110_ampdoc$jscomp$15$$;
      "string" == typeof $JSCompiler_string$jscomp$inline_221_JSCompiler_url$jscomp$inline_218_opt_disallowCustom$jscomp$1$$ && ($JSCompiler_string$jscomp$inline_221_JSCompiler_url$jscomp$inline_218_opt_disallowCustom$jscomp$1$$ = $parseUrlDeprecated$$module$src$url$$($JSCompiler_string$jscomp$inline_221_JSCompiler_url$jscomp$inline_218_opt_disallowCustom$jscomp$1$$));
      var $JSCompiler_index$jscomp$inline_222_JSCompiler_temp$jscomp$220$$;
      ($JSCompiler_index$jscomp$inline_222_JSCompiler_temp$jscomp$220$$ = "https:" == $JSCompiler_string$jscomp$inline_221_JSCompiler_url$jscomp$inline_218_opt_disallowCustom$jscomp$1$$.protocol || "localhost" == $JSCompiler_string$jscomp$inline_221_JSCompiler_url$jscomp$inline_218_opt_disallowCustom$jscomp$1$$.hostname || "127.0.0.1" == $JSCompiler_string$jscomp$inline_221_JSCompiler_url$jscomp$inline_218_opt_disallowCustom$jscomp$1$$.hostname) || ($JSCompiler_string$jscomp$inline_221_JSCompiler_url$jscomp$inline_218_opt_disallowCustom$jscomp$1$$ = 
      $JSCompiler_string$jscomp$inline_221_JSCompiler_url$jscomp$inline_218_opt_disallowCustom$jscomp$1$$.hostname, $JSCompiler_index$jscomp$inline_222_JSCompiler_temp$jscomp$220$$ = $JSCompiler_string$jscomp$inline_221_JSCompiler_url$jscomp$inline_218_opt_disallowCustom$jscomp$1$$.length - 10, $JSCompiler_index$jscomp$inline_222_JSCompiler_temp$jscomp$220$$ = 0 <= $JSCompiler_index$jscomp$inline_222_JSCompiler_temp$jscomp$220$$ && $JSCompiler_string$jscomp$inline_221_JSCompiler_url$jscomp$inline_218_opt_disallowCustom$jscomp$1$$.indexOf(".localhost", 
      $JSCompiler_index$jscomp$inline_222_JSCompiler_temp$jscomp$220$$) == $JSCompiler_index$jscomp$inline_222_JSCompiler_temp$jscomp$220$$);
      $userAssert$$module$src$log$$($JSCompiler_index$jscomp$inline_222_JSCompiler_temp$jscomp$220$$ || /^(\/\/)/.test($JSCompiler_meta$jscomp$inline_110_ampdoc$jscomp$15$$), '%s %s must start with "https://" or "//" or be relative and served from either https or from localhost. Invalid value: %s', 'meta[name="amp-3p-iframe-src"]', $JSCompiler_parsed$jscomp$inline_112_JSCompiler_sourceName$jscomp$inline_193_JSCompiler_temp$jscomp$32_JSCompiler_temp$jscomp$33$$, $JSCompiler_meta$jscomp$inline_110_ampdoc$jscomp$15$$);
      $userAssert$$module$src$log$$(-1 == $JSCompiler_meta$jscomp$inline_110_ampdoc$jscomp$15$$.indexOf("?"), "3p iframe url must not include query string %s in element %s.", $JSCompiler_meta$jscomp$inline_110_ampdoc$jscomp$15$$, $JSCompiler_meta$jscomp$inline_110_ampdoc$jscomp$15$$);
      $JSCompiler_parsed$jscomp$inline_112_JSCompiler_sourceName$jscomp$inline_193_JSCompiler_temp$jscomp$32_JSCompiler_temp$jscomp$33$$ = $parseUrlDeprecated$$module$src$url$$($JSCompiler_meta$jscomp$inline_110_ampdoc$jscomp$15$$);
      $userAssert$$module$src$log$$("localhost" == $JSCompiler_parsed$jscomp$inline_112_JSCompiler_sourceName$jscomp$inline_193_JSCompiler_temp$jscomp$32_JSCompiler_temp$jscomp$33$$.hostname && !0 || $JSCompiler_parsed$jscomp$inline_112_JSCompiler_sourceName$jscomp$inline_193_JSCompiler_temp$jscomp$32_JSCompiler_temp$jscomp$33$$.origin != $parseUrlDeprecated$$module$src$url$$($parentWindow$jscomp$3$$.location.href).origin, "3p iframe url must not be on the same origin as the current document %s (%s) in element %s. See https://github.com/ampproject/amphtml/blob/master/spec/amp-iframe-origin-policy.md for details.", 
      $JSCompiler_meta$jscomp$inline_110_ampdoc$jscomp$15$$, $JSCompiler_parsed$jscomp$inline_112_JSCompiler_sourceName$jscomp$inline_193_JSCompiler_temp$jscomp$32_JSCompiler_temp$jscomp$33$$.origin, $JSCompiler_meta$jscomp$inline_110_ampdoc$jscomp$15$$);
      $JSCompiler_parsed$jscomp$inline_112_JSCompiler_sourceName$jscomp$inline_193_JSCompiler_temp$jscomp$32_JSCompiler_temp$jscomp$33$$ = $JSCompiler_meta$jscomp$inline_110_ampdoc$jscomp$15$$ + "?2007210308000";
    } else {
      $JSCompiler_parsed$jscomp$inline_112_JSCompiler_sourceName$jscomp$inline_193_JSCompiler_temp$jscomp$32_JSCompiler_temp$jscomp$33$$ = null;
    }
  }
  $JSCompiler_parsed$jscomp$inline_112_JSCompiler_sourceName$jscomp$inline_193_JSCompiler_temp$jscomp$32_JSCompiler_temp$jscomp$33$$ || ($parentWindow$jscomp$3$$.__AMP_DEFAULT_BOOTSTRAP_SUBDOMAIN = $parentWindow$jscomp$3$$.__AMP_DEFAULT_BOOTSTRAP_SUBDOMAIN || "d-" + $getRandom$$module$src$3p_frame$$($parentWindow$jscomp$3$$), $JSCompiler_parsed$jscomp$inline_112_JSCompiler_sourceName$jscomp$inline_193_JSCompiler_temp$jscomp$32_JSCompiler_temp$jscomp$33$$ = "https://" + $parentWindow$jscomp$3$$.__AMP_DEFAULT_BOOTSTRAP_SUBDOMAIN + 
  ("." + $urls$$module$src$config$$.thirdPartyFrameHost + "/2007210308000/frame.html"));
  return $JSCompiler_parsed$jscomp$inline_112_JSCompiler_sourceName$jscomp$inline_193_JSCompiler_temp$jscomp$32_JSCompiler_temp$jscomp$33$$;
}
function $getRandom$$module$src$3p_frame$$($win$jscomp$60$$) {
  if ($win$jscomp$60$$.crypto && $win$jscomp$60$$.crypto.getRandomValues) {
    var $uint32array$$ = new Uint32Array(2);
    $win$jscomp$60$$.crypto.getRandomValues($uint32array$$);
    var $rand$$ = String($uint32array$$[0]) + $uint32array$$[1];
  } else {
    $rand$$ = String($win$jscomp$60$$.Math.random()).substr(2) + "0";
  }
  return $rand$$;
}
function $applySandbox$$module$src$3p_frame$$($iframe$jscomp$1$$) {
  if ($iframe$jscomp$1$$.sandbox && $iframe$jscomp$1$$.sandbox.supports) {
    for (var $requiredFlags$$ = ["allow-top-navigation-by-user-activation", "allow-popups-to-escape-sandbox"], $i$jscomp$26$$ = 0; $i$jscomp$26$$ < $requiredFlags$$.length; $i$jscomp$26$$++) {
      var $flag$jscomp$1$$ = $requiredFlags$$[$i$jscomp$26$$];
      if (!$iframe$jscomp$1$$.sandbox.supports($flag$jscomp$1$$)) {
        $dev$$module$src$log$$().info("3p-frame", "Iframe doesn't support %s", $flag$jscomp$1$$);
        return;
      }
    }
    $iframe$jscomp$1$$.sandbox = $requiredFlags$$.join(" ") + " allow-forms allow-modals allow-pointer-lock allow-popups allow-same-origin allow-scripts";
  }
}
;function $getListenForSentinel$$module$src$iframe_helper$$($JSCompiler_inline_result$jscomp$35_parentWin$jscomp$2$$, $sentinel$jscomp$3$$, $opt_create$jscomp$1$$) {
  var $JSCompiler_listeningFors$jscomp$inline_120$$ = $JSCompiler_inline_result$jscomp$35_parentWin$jscomp$2$$.listeningFors;
  !$JSCompiler_listeningFors$jscomp$inline_120$$ && $opt_create$jscomp$1$$ && ($JSCompiler_listeningFors$jscomp$inline_120$$ = $JSCompiler_inline_result$jscomp$35_parentWin$jscomp$2$$.listeningFors = Object.create(null));
  $JSCompiler_inline_result$jscomp$35_parentWin$jscomp$2$$ = $JSCompiler_listeningFors$jscomp$inline_120$$ || null;
  if (!$JSCompiler_inline_result$jscomp$35_parentWin$jscomp$2$$) {
    return $JSCompiler_inline_result$jscomp$35_parentWin$jscomp$2$$;
  }
  var $listenSentinel$$ = $JSCompiler_inline_result$jscomp$35_parentWin$jscomp$2$$[$sentinel$jscomp$3$$];
  !$listenSentinel$$ && $opt_create$jscomp$1$$ && ($listenSentinel$$ = $JSCompiler_inline_result$jscomp$35_parentWin$jscomp$2$$[$sentinel$jscomp$3$$] = []);
  return $listenSentinel$$ || null;
}
function $getOrCreateListenForEvents$$module$src$iframe_helper$$($listenSentinel$jscomp$1_parentWin$jscomp$3$$, $iframe$jscomp$2$$) {
  var $i$jscomp$30_sentinel$jscomp$4$$ = $iframe$jscomp$2$$.getAttribute("data-amp-3p-sentinel");
  $listenSentinel$jscomp$1_parentWin$jscomp$3$$ = $getListenForSentinel$$module$src$iframe_helper$$($listenSentinel$jscomp$1_parentWin$jscomp$3$$, $i$jscomp$30_sentinel$jscomp$4$$, !0);
  for ($i$jscomp$30_sentinel$jscomp$4$$ = 0; $i$jscomp$30_sentinel$jscomp$4$$ < $listenSentinel$jscomp$1_parentWin$jscomp$3$$.length; $i$jscomp$30_sentinel$jscomp$4$$++) {
    var $we$$ = $listenSentinel$jscomp$1_parentWin$jscomp$3$$[$i$jscomp$30_sentinel$jscomp$4$$];
    if ($we$$.frame === $iframe$jscomp$2$$) {
      var $windowEvents$$ = $we$$;
      break;
    }
  }
  $windowEvents$$ || ($windowEvents$$ = {frame:$iframe$jscomp$2$$, events:Object.create(null)}, $listenSentinel$jscomp$1_parentWin$jscomp$3$$.push($windowEvents$$));
  return $windowEvents$$.events;
}
function $dropListenSentinel$$module$src$iframe_helper$$($listenSentinel$jscomp$3$$) {
  for (var $noopData$$ = $dict$$module$src$utils$object$$({sentinel:"unlisten"}), $i$jscomp$32$$ = $listenSentinel$jscomp$3$$.length - 1; 0 <= $i$jscomp$32$$; $i$jscomp$32$$--) {
    var $windowEvents$jscomp$2$$ = $listenSentinel$jscomp$3$$[$i$jscomp$32$$];
    if (!$windowEvents$jscomp$2$$.frame.contentWindow) {
      $listenSentinel$jscomp$3$$.splice($i$jscomp$32$$, 1);
      var $events$$ = $windowEvents$jscomp$2$$.events, $name$jscomp$80$$;
      for ($name$jscomp$80$$ in $events$$) {
        $events$$[$name$jscomp$80$$].splice(0, Infinity).forEach(function($listenSentinel$jscomp$3$$) {
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
        var $JSCompiler_inline_result$jscomp$36_JSCompiler_triggerWin$jscomp$inline_124_i$jscomp$33$$ = $event$jscomp$10$$.source;
        var $JSCompiler_listenSentinel$jscomp$inline_125$$ = $getListenForSentinel$$module$src$iframe_helper$$($parentWin$jscomp$5$$, $data$jscomp$78$$.sentinel);
        if ($JSCompiler_listenSentinel$jscomp$inline_125$$) {
          for (var $JSCompiler_windowEvents$jscomp$inline_126$$, $JSCompiler_i$jscomp$inline_127$$ = 0; $JSCompiler_i$jscomp$inline_127$$ < $JSCompiler_listenSentinel$jscomp$inline_125$$.length; $JSCompiler_i$jscomp$inline_127$$++) {
            var $JSCompiler_we$jscomp$inline_128$$ = $JSCompiler_listenSentinel$jscomp$inline_125$$[$JSCompiler_i$jscomp$inline_127$$], $JSCompiler_contentWindow$jscomp$inline_129$$ = $JSCompiler_we$jscomp$inline_128$$.frame.contentWindow;
            if ($JSCompiler_contentWindow$jscomp$inline_129$$) {
              var $JSCompiler_temp$jscomp$167_JSCompiler_win$jscomp$inline_197$$;
              if (!($JSCompiler_temp$jscomp$167_JSCompiler_win$jscomp$inline_197$$ = $JSCompiler_inline_result$jscomp$36_JSCompiler_triggerWin$jscomp$inline_124_i$jscomp$33$$ == $JSCompiler_contentWindow$jscomp$inline_129$$)) {
                b: {
                  for ($JSCompiler_temp$jscomp$167_JSCompiler_win$jscomp$inline_197$$ = $JSCompiler_inline_result$jscomp$36_JSCompiler_triggerWin$jscomp$inline_124_i$jscomp$33$$; $JSCompiler_temp$jscomp$167_JSCompiler_win$jscomp$inline_197$$ && $JSCompiler_temp$jscomp$167_JSCompiler_win$jscomp$inline_197$$ != $JSCompiler_temp$jscomp$167_JSCompiler_win$jscomp$inline_197$$.parent; $JSCompiler_temp$jscomp$167_JSCompiler_win$jscomp$inline_197$$ = $JSCompiler_temp$jscomp$167_JSCompiler_win$jscomp$inline_197$$.parent) {
                    if ($JSCompiler_temp$jscomp$167_JSCompiler_win$jscomp$inline_197$$ == $JSCompiler_contentWindow$jscomp$inline_129$$) {
                      $JSCompiler_temp$jscomp$167_JSCompiler_win$jscomp$inline_197$$ = !0;
                      break b;
                    }
                  }
                  $JSCompiler_temp$jscomp$167_JSCompiler_win$jscomp$inline_197$$ = !1;
                }
              }
              if ($JSCompiler_temp$jscomp$167_JSCompiler_win$jscomp$inline_197$$) {
                $JSCompiler_windowEvents$jscomp$inline_126$$ = $JSCompiler_we$jscomp$inline_128$$;
                break;
              }
            } else {
              setTimeout($dropListenSentinel$$module$src$iframe_helper$$, 0, $JSCompiler_listenSentinel$jscomp$inline_125$$);
            }
          }
          $JSCompiler_inline_result$jscomp$36_JSCompiler_triggerWin$jscomp$inline_124_i$jscomp$33$$ = $JSCompiler_windowEvents$jscomp$inline_126$$ ? $JSCompiler_windowEvents$jscomp$inline_126$$.events : null;
        } else {
          $JSCompiler_inline_result$jscomp$36_JSCompiler_triggerWin$jscomp$inline_124_i$jscomp$33$$ = $JSCompiler_listenSentinel$jscomp$inline_125$$;
        }
        var $listenForEvents$$ = $JSCompiler_inline_result$jscomp$36_JSCompiler_triggerWin$jscomp$inline_124_i$jscomp$33$$;
        if ($listenForEvents$$) {
          var $listeners$$ = $listenForEvents$$[$data$jscomp$78$$.type];
          if ($listeners$$) {
            for ($listeners$$ = $listeners$$.slice(), $JSCompiler_inline_result$jscomp$36_JSCompiler_triggerWin$jscomp$inline_124_i$jscomp$33$$ = 0; $JSCompiler_inline_result$jscomp$36_JSCompiler_triggerWin$jscomp$inline_124_i$jscomp$33$$ < $listeners$$.length; $JSCompiler_inline_result$jscomp$36_JSCompiler_triggerWin$jscomp$inline_124_i$jscomp$33$$++) {
              (0,$listeners$$[$JSCompiler_inline_result$jscomp$36_JSCompiler_triggerWin$jscomp$inline_124_i$jscomp$33$$])($data$jscomp$78$$, $event$jscomp$10$$.source, $event$jscomp$10$$.origin, $event$jscomp$10$$);
            }
          }
        }
      }
    }
  });
}
function $listenFor$$module$src$iframe_helper$$($iframe$jscomp$3$$, $typeOfMessage$$, $callback$jscomp$59$$) {
  function $listener$jscomp$69$$($typeOfMessage$$, $listener$jscomp$69$$, $listenForEvents$jscomp$1_parentWin$jscomp$6$$, $events$jscomp$1$$) {
    if ("amp" == $typeOfMessage$$.sentinel) {
      if ($listener$jscomp$69$$ != $iframe$jscomp$3$$.contentWindow) {
        return;
      }
      var $source$jscomp$14$$ = "null" == $listenForEvents$jscomp$1_parentWin$jscomp$6$$ && void 0;
      if ($iframeOrigin$$ != $listenForEvents$jscomp$1_parentWin$jscomp$6$$ && !$source$jscomp$14$$) {
        return;
      }
    }
    $listener$jscomp$69$$ == $iframe$jscomp$3$$.contentWindow && ("unlisten" == $typeOfMessage$$.sentinel ? $unlisten$jscomp$2$$() : $callback$jscomp$59$$($typeOfMessage$$, $listener$jscomp$69$$, $listenForEvents$jscomp$1_parentWin$jscomp$6$$, $events$jscomp$1$$));
  }
  var $listenForEvents$jscomp$1_parentWin$jscomp$6$$ = $iframe$jscomp$3$$.ownerDocument.defaultView;
  $registerGlobalListenerIfNeeded$$module$src$iframe_helper$$($listenForEvents$jscomp$1_parentWin$jscomp$6$$);
  $listenForEvents$jscomp$1_parentWin$jscomp$6$$ = $getOrCreateListenForEvents$$module$src$iframe_helper$$($listenForEvents$jscomp$1_parentWin$jscomp$6$$, $iframe$jscomp$3$$);
  var $iframeOrigin$$ = $parseUrlDeprecated$$module$src$url$$($iframe$jscomp$3$$.src).origin, $events$jscomp$1$$ = $listenForEvents$jscomp$1_parentWin$jscomp$6$$[$typeOfMessage$$] || ($listenForEvents$jscomp$1_parentWin$jscomp$6$$[$typeOfMessage$$] = []);
  $events$jscomp$1$$.push($listener$jscomp$69$$);
  var $unlisten$jscomp$2$$ = function() {
    if ($listener$jscomp$69$$) {
      var $iframe$jscomp$3$$ = $events$jscomp$1$$.indexOf($listener$jscomp$69$$);
      -1 < $iframe$jscomp$3$$ && $events$jscomp$1$$.splice($iframe$jscomp$3$$, 1);
      $callback$jscomp$59$$ = $events$jscomp$1$$ = $listener$jscomp$69$$ = null;
    }
  };
}
function $parseIfNeeded$$module$src$iframe_helper$$($data$jscomp$81$$) {
  "string" == typeof $data$jscomp$81$$ && ($data$jscomp$81$$ = "{" == $data$jscomp$81$$.charAt(0) ? $tryParseJson$$module$src$json$$($data$jscomp$81$$, function($data$jscomp$81$$) {
    $dev$$module$src$log$$().warn("IFRAME-HELPER", "Postmessage could not be parsed. Is it in a valid JSON format?", $data$jscomp$81$$);
  }) || null : $isAmpMessage$$module$src$3p_frame_messaging$$($data$jscomp$81$$) ? $deserializeMessage$$module$src$3p_frame_messaging$$($data$jscomp$81$$) : null);
  return $data$jscomp$81$$;
}
;var $_template$$module$extensions$amp_twitter$0_1$amp_twitter$$ = ['<svg viewBox="0 0 72 72"><path fill=currentColor d="M32.29,44.13c7.55,0,11.67-6.25,11.67-11.67c0-0.18,0-0.35-0.01-0.53c0.8-0.58,1.5-1.3,2.05-2.12\n    c-0.74,0.33-1.53,0.55-2.36,0.65c0.85-0.51,1.5-1.31,1.8-2.27c-0.79,0.47-1.67,0.81-2.61,1c-0.75-0.8-1.82-1.3-3-1.3\n    c-2.27,0-4.1,1.84-4.1,4.1c0,0.32,0.04,0.64,0.11,0.94c-3.41-0.17-6.43-1.8-8.46-4.29c-0.35,0.61-0.56,1.31-0.56,2.06\n    c0,1.42,0.72,2.68,1.83,3.42c-0.67-0.02-1.31-0.21-1.86-0.51c0,0.02,0,0.03,0,0.05c0,1.99,1.41,3.65,3.29,4.02\n    c-0.34,0.09-0.71,0.14-1.08,0.14c-0.26,0-0.52-0.03-0.77-0.07c0.52,1.63,2.04,2.82,3.83,2.85c-1.4,1.1-3.17,1.76-5.1,1.76\n    c-0.33,0-0.66-0.02-0.98-0.06C27.82,43.45,29.97,44.13,32.29,44.13"/></svg>'];
function $AmpTwitter$$module$extensions$amp_twitter$0_1$amp_twitter$$($$jscomp$super$this_element$jscomp$87$$) {
  $$jscomp$super$this_element$jscomp$87$$ = AMP.BaseElement.call(this, $$jscomp$super$this_element$jscomp$87$$) || this;
  $$jscomp$super$this_element$jscomp$87$$.$iframe_$ = null;
  $$jscomp$super$this_element$jscomp$87$$.$userPlaceholder_$ = null;
  return $$jscomp$super$this_element$jscomp$87$$;
}
var $JSCompiler_parentCtor$jscomp$inline_132$$ = AMP.BaseElement;
$AmpTwitter$$module$extensions$amp_twitter$0_1$amp_twitter$$.prototype = $$jscomp$objectCreate$$($JSCompiler_parentCtor$jscomp$inline_132$$.prototype);
$AmpTwitter$$module$extensions$amp_twitter$0_1$amp_twitter$$.prototype.constructor = $AmpTwitter$$module$extensions$amp_twitter$0_1$amp_twitter$$;
if ($$jscomp$setPrototypeOf$$) {
  $$jscomp$setPrototypeOf$$($AmpTwitter$$module$extensions$amp_twitter$0_1$amp_twitter$$, $JSCompiler_parentCtor$jscomp$inline_132$$);
} else {
  for (var $JSCompiler_p$jscomp$inline_133$$ in $JSCompiler_parentCtor$jscomp$inline_132$$) {
    if ("prototype" != $JSCompiler_p$jscomp$inline_133$$) {
      if (Object.defineProperties) {
        var $JSCompiler_descriptor$jscomp$inline_134$$ = Object.getOwnPropertyDescriptor($JSCompiler_parentCtor$jscomp$inline_132$$, $JSCompiler_p$jscomp$inline_133$$);
        $JSCompiler_descriptor$jscomp$inline_134$$ && Object.defineProperty($AmpTwitter$$module$extensions$amp_twitter$0_1$amp_twitter$$, $JSCompiler_p$jscomp$inline_133$$, $JSCompiler_descriptor$jscomp$inline_134$$);
      } else {
        $AmpTwitter$$module$extensions$amp_twitter$0_1$amp_twitter$$[$JSCompiler_p$jscomp$inline_133$$] = $JSCompiler_parentCtor$jscomp$inline_132$$[$JSCompiler_p$jscomp$inline_133$$];
      }
    }
  }
}
$AmpTwitter$$module$extensions$amp_twitter$0_1$amp_twitter$$.$superClass_$ = $JSCompiler_parentCtor$jscomp$inline_132$$.prototype;
$JSCompiler_prototypeAlias$$ = $AmpTwitter$$module$extensions$amp_twitter$0_1$amp_twitter$$.prototype;
$JSCompiler_prototypeAlias$$.buildCallback = function() {
  this.$userPlaceholder_$ = this.getPlaceholder();
};
$JSCompiler_prototypeAlias$$.preconnectCallback = function($opt_onLayout$$) {
  var $preconnect$jscomp$1$$ = $getService$$module$src$service$$(this.win, "preconnect"), $ampdoc$jscomp$17$$ = this.getAmpDoc(), $JSCompiler_url$jscomp$inline_140$$ = $getBootstrapBaseUrl$$module$src$3p_frame$$(this.win, $ampdoc$jscomp$17$$, void 0);
  $preconnect$jscomp$1$$.preload($ampdoc$jscomp$17$$, $JSCompiler_url$jscomp$inline_140$$, "document");
  $preconnect$jscomp$1$$.preload($ampdoc$jscomp$17$$, $urls$$module$src$config$$.thirdParty + "/2007210308000/f.js", "script");
  $preconnect$jscomp$1$$.preload($ampdoc$jscomp$17$$, "https://platform.twitter.com/widgets.js", "script");
  $preconnect$jscomp$1$$.url($ampdoc$jscomp$17$$, "https://syndication.twitter.com", $opt_onLayout$$);
  $preconnect$jscomp$1$$.url($ampdoc$jscomp$17$$, "https://pbs.twimg.com", $opt_onLayout$$);
  $preconnect$jscomp$1$$.url($ampdoc$jscomp$17$$, "https://cdn.syndication.twimg.com", $opt_onLayout$$);
};
$JSCompiler_prototypeAlias$$.isLayoutSupported = function($layout$jscomp$4$$) {
  return "fixed" == $layout$jscomp$4$$ || "fixed-height" == $layout$jscomp$4$$ || "responsive" == $layout$jscomp$4$$ || "fill" == $layout$jscomp$4$$ || "flex-item" == $layout$jscomp$4$$ || "fluid" == $layout$jscomp$4$$ || "intrinsic" == $layout$jscomp$4$$;
};
$JSCompiler_prototypeAlias$$.firstLayoutCompleted = function() {
};
$JSCompiler_prototypeAlias$$.layoutCallback = function() {
  var $$jscomp$this$jscomp$3$$ = this, $iframe$jscomp$14$$ = $getIframe$$module$src$3p_frame$$(this.win, this.element);
  this.applyFillContent($iframe$jscomp$14$$);
  $JSCompiler_StaticMethods_updateForLoadingState_$$(this);
  $listenFor$$module$src$iframe_helper$$($iframe$jscomp$14$$, "embed-size", function($iframe$jscomp$14$$) {
    $JSCompiler_StaticMethods_updateForSuccessState_$$($$jscomp$this$jscomp$3$$, $iframe$jscomp$14$$.height);
  });
  $listenFor$$module$src$iframe_helper$$($iframe$jscomp$14$$, "no-content", function() {
    $JSCompiler_StaticMethods_updateForFailureState_$$($$jscomp$this$jscomp$3$$);
  });
  this.element.appendChild($iframe$jscomp$14$$);
  this.$iframe_$ = $iframe$jscomp$14$$;
  return this.loadPromise($iframe$jscomp$14$$);
};
function $JSCompiler_StaticMethods_updateForLoadingState_$$($JSCompiler_StaticMethods_updateForLoadingState_$self$$) {
  var $height$jscomp$29$$;
  $JSCompiler_StaticMethods_updateForLoadingState_$self$$.measureMutateElement(function() {
    $height$jscomp$29$$ = $JSCompiler_StaticMethods_updateForLoadingState_$self$$.element.getBoundingClientRect().height;
  }, function() {
    $JSCompiler_StaticMethods_updateForLoadingState_$self$$.forceChangeHeight($height$jscomp$29$$);
  });
}
function $JSCompiler_StaticMethods_updateForSuccessState_$$($JSCompiler_StaticMethods_updateForSuccessState_$self$$, $height$jscomp$30$$) {
  $JSCompiler_StaticMethods_updateForSuccessState_$self$$.mutateElement(function() {
    $JSCompiler_StaticMethods_updateForSuccessState_$self$$.toggleLoading(!1);
    $JSCompiler_StaticMethods_updateForSuccessState_$self$$.$userPlaceholder_$ && $JSCompiler_StaticMethods_updateForSuccessState_$self$$.togglePlaceholder(!1);
    $JSCompiler_StaticMethods_updateForSuccessState_$self$$.forceChangeHeight($height$jscomp$30$$);
  });
}
function $JSCompiler_StaticMethods_updateForFailureState_$$($JSCompiler_StaticMethods_updateForFailureState_$self$$) {
  var $fallback$jscomp$1$$ = $JSCompiler_StaticMethods_updateForFailureState_$self$$.getFallback(), $content$jscomp$1$$ = $fallback$jscomp$1$$ || $JSCompiler_StaticMethods_updateForFailureState_$self$$.$userPlaceholder_$;
  $JSCompiler_StaticMethods_updateForFailureState_$self$$.mutateElement(function() {
    $JSCompiler_StaticMethods_updateForFailureState_$self$$.toggleLoading(!1);
    $fallback$jscomp$1$$ && ($JSCompiler_StaticMethods_updateForFailureState_$self$$.togglePlaceholder(!1), $JSCompiler_StaticMethods_updateForFailureState_$self$$.toggleFallback(!0));
    $content$jscomp$1$$ && $JSCompiler_StaticMethods_updateForFailureState_$self$$.forceChangeHeight($content$jscomp$1$$.offsetHeight);
  });
}
$JSCompiler_prototypeAlias$$.isLoadingReused = function() {
  return !0;
};
$JSCompiler_prototypeAlias$$.createLoaderLogoCallback = function() {
  var $JSCompiler_container$jscomp$inline_200_JSCompiler_doc$jscomp$inline_143_JSCompiler_nodeOrDoc$jscomp$inline_142$$ = this.element;
  $JSCompiler_container$jscomp$inline_200_JSCompiler_doc$jscomp$inline_143_JSCompiler_nodeOrDoc$jscomp$inline_142$$ = $JSCompiler_container$jscomp$inline_200_JSCompiler_doc$jscomp$inline_143_JSCompiler_nodeOrDoc$jscomp$inline_142$$.ownerDocument || $JSCompiler_container$jscomp$inline_200_JSCompiler_doc$jscomp$inline_143_JSCompiler_nodeOrDoc$jscomp$inline_142$$;
  $htmlContainer$$module$src$static_template$$ && $htmlContainer$$module$src$static_template$$.ownerDocument === $JSCompiler_container$jscomp$inline_200_JSCompiler_doc$jscomp$inline_143_JSCompiler_nodeOrDoc$jscomp$inline_142$$ || ($htmlContainer$$module$src$static_template$$ = $JSCompiler_container$jscomp$inline_200_JSCompiler_doc$jscomp$inline_143_JSCompiler_nodeOrDoc$jscomp$inline_142$$.createElement("div"));
  $JSCompiler_container$jscomp$inline_200_JSCompiler_doc$jscomp$inline_143_JSCompiler_nodeOrDoc$jscomp$inline_142$$ = $htmlContainer$$module$src$static_template$$;
  $JSCompiler_container$jscomp$inline_200_JSCompiler_doc$jscomp$inline_143_JSCompiler_nodeOrDoc$jscomp$inline_142$$.innerHTML = $_template$$module$extensions$amp_twitter$0_1$amp_twitter$$[0];
  var $JSCompiler_el$jscomp$inline_201$$ = $JSCompiler_container$jscomp$inline_200_JSCompiler_doc$jscomp$inline_143_JSCompiler_nodeOrDoc$jscomp$inline_142$$.firstElementChild;
  $JSCompiler_container$jscomp$inline_200_JSCompiler_doc$jscomp$inline_143_JSCompiler_nodeOrDoc$jscomp$inline_142$$.removeChild($JSCompiler_el$jscomp$inline_201$$);
  return {color:"#1DA1F2", content:$JSCompiler_el$jscomp$inline_201$$};
};
$JSCompiler_prototypeAlias$$.unlayoutOnPause = function() {
  return !0;
};
$JSCompiler_prototypeAlias$$.unlayoutCallback = function() {
  if (this.$iframe_$) {
    var $JSCompiler_element$jscomp$inline_145$$ = this.$iframe_$;
    $JSCompiler_element$jscomp$inline_145$$.parentElement && $JSCompiler_element$jscomp$inline_145$$.parentElement.removeChild($JSCompiler_element$jscomp$inline_145$$);
    this.$iframe_$ = null;
  }
  return !0;
};
$JSCompiler_prototypeAlias$$.mutatedAttributesCallback = function($mutations$$) {
  this.$iframe_$ && null != $mutations$$["data-tweetid"] && (this.unlayoutCallback(), this.toggleLoading(!0), this.layoutCallback());
};
(function($AMP$jscomp$1$$) {
  $AMP$jscomp$1$$.registerElement("amp-twitter", $AmpTwitter$$module$extensions$amp_twitter$0_1$amp_twitter$$);
})(self.AMP);

})});

//# sourceMappingURL=amp-twitter-0.1.js.map
