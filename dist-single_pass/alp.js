(function(){var $JSCompiler_prototypeAlias$$, $$jscomp$objectCreate$$ = "function" == typeof Object.create ? Object.create : function($prototype$$) {
  function $ctor$$() {
  }
  $ctor$$.prototype = $prototype$$;
  return new $ctor$$;
}, $JSCompiler_temp$jscomp$18$$;
if ("function" == typeof Object.setPrototypeOf) {
  $JSCompiler_temp$jscomp$18$$ = Object.setPrototypeOf;
} else {
  var $JSCompiler_inline_result$jscomp$19$$;
  a: {
    var $JSCompiler_x$jscomp$inline_44$$ = {a:!0}, $JSCompiler_y$jscomp$inline_45$$ = {};
    try {
      $JSCompiler_y$jscomp$inline_45$$.__proto__ = $JSCompiler_x$jscomp$inline_44$$;
      $JSCompiler_inline_result$jscomp$19$$ = $JSCompiler_y$jscomp$inline_45$$.a;
      break a;
    } catch ($JSCompiler_e$jscomp$inline_46$$) {
    }
    $JSCompiler_inline_result$jscomp$19$$ = !1;
  }
  $JSCompiler_temp$jscomp$18$$ = $JSCompiler_inline_result$jscomp$19$$ ? function($target$jscomp$55$$, $proto$jscomp$3$$) {
    $target$jscomp$55$$.__proto__ = $proto$jscomp$3$$;
    if ($target$jscomp$55$$.__proto__ !== $proto$jscomp$3$$) {
      throw new TypeError($target$jscomp$55$$ + " is not extensible");
    }
    return $target$jscomp$55$$;
  } : null;
}
var $$jscomp$setPrototypeOf$$ = $JSCompiler_temp$jscomp$18$$;
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
    var $name$jscomp$65$$ = $tryDecodeUriComponent_$$module$src$url_try_decode_uri_component$$($match$$[1], $match$$[1]), $value$jscomp$84$$ = $match$$[2] ? $tryDecodeUriComponent_$$module$src$url_try_decode_uri_component$$($match$$[2], $match$$[2]) : "";
    $params$jscomp$1$$[$name$jscomp$65$$] = $value$jscomp$84$$;
  }
  return $params$jscomp$1$$;
}
;var $rtvVersion$$module$src$mode$$ = "";
function $getMode$$module$src$mode$$($opt_win$$) {
  var $win$$ = $opt_win$$ || self;
  if ($win$$.AMP_MODE) {
    var $JSCompiler_temp$jscomp$20_JSCompiler_win$jscomp$inline_48$$ = $win$$.AMP_MODE;
  } else {
    $JSCompiler_temp$jscomp$20_JSCompiler_win$jscomp$inline_48$$ = $win$$;
    var $JSCompiler_AMP_CONFIG$jscomp$inline_49_JSCompiler_singlePassType$jscomp$inline_56$$ = self.AMP_CONFIG || {}, $JSCompiler_runningTests$jscomp$inline_53$$ = !!$JSCompiler_AMP_CONFIG$jscomp$inline_49_JSCompiler_singlePassType$jscomp$inline_56$$.test || !1, $JSCompiler_hashQuery$jscomp$inline_55$$ = $parseQueryString_$$module$src$url_parse_query_string$$($JSCompiler_temp$jscomp$20_JSCompiler_win$jscomp$inline_48$$.location.originalHash || $JSCompiler_temp$jscomp$20_JSCompiler_win$jscomp$inline_48$$.location.hash);
    $JSCompiler_AMP_CONFIG$jscomp$inline_49_JSCompiler_singlePassType$jscomp$inline_56$$ = $JSCompiler_AMP_CONFIG$jscomp$inline_49_JSCompiler_singlePassType$jscomp$inline_56$$.spt;
    var $JSCompiler_searchQuery$jscomp$inline_57$$ = $parseQueryString_$$module$src$url_parse_query_string$$($JSCompiler_temp$jscomp$20_JSCompiler_win$jscomp$inline_48$$.location.search);
    $rtvVersion$$module$src$mode$$ || ($rtvVersion$$module$src$mode$$ = $JSCompiler_temp$jscomp$20_JSCompiler_win$jscomp$inline_48$$.AMP_CONFIG && $JSCompiler_temp$jscomp$20_JSCompiler_win$jscomp$inline_48$$.AMP_CONFIG.v ? $JSCompiler_temp$jscomp$20_JSCompiler_win$jscomp$inline_48$$.AMP_CONFIG.v : "011901181729101");
    $JSCompiler_temp$jscomp$20_JSCompiler_win$jscomp$inline_48$$ = $win$$.AMP_MODE = {localDev:!1, development:!("1" != $JSCompiler_hashQuery$jscomp$inline_55$$.development && !$JSCompiler_temp$jscomp$20_JSCompiler_win$jscomp$inline_48$$.AMP_DEV_MODE), examiner:"2" == $JSCompiler_hashQuery$jscomp$inline_55$$.development, filter:$JSCompiler_hashQuery$jscomp$inline_55$$.filter, geoOverride:$JSCompiler_hashQuery$jscomp$inline_55$$["amp-geo"], minified:!0, lite:void 0 != $JSCompiler_searchQuery$jscomp$inline_57$$.amp_lite, 
    test:$JSCompiler_runningTests$jscomp$inline_53$$, log:$JSCompiler_hashQuery$jscomp$inline_55$$.log, version:"1901181729101", rtvVersion:$rtvVersion$$module$src$mode$$, singlePassType:$JSCompiler_AMP_CONFIG$jscomp$inline_49_JSCompiler_singlePassType$jscomp$inline_56$$};
  }
  return $JSCompiler_temp$jscomp$20_JSCompiler_win$jscomp$inline_48$$;
}
;var $toString_$$module$src$types$$ = Object.prototype.toString;
function $Log$$module$src$log$$($win$jscomp$4$$, $levelFunc$$, $opt_suffix$$) {
  this.win = $win$jscomp$4$$;
  this.$levelFunc_$ = $levelFunc$$;
  this.$level_$ = this.win.console && this.win.console.log && "0" != $getMode$$module$src$mode$$().log ? this.$levelFunc_$({localDev:!1, development:$getMode$$module$src$mode$$(void 0).development, filter:$getMode$$module$src$mode$$(void 0).filter, minified:!0, lite:$getMode$$module$src$mode$$(void 0).lite, test:!1, log:$getMode$$module$src$mode$$(void 0).log, version:$getMode$$module$src$mode$$(void 0).version, rtvVersion:$getMode$$module$src$mode$$(void 0).rtvVersion, singlePassType:$getMode$$module$src$mode$$(void 0).singlePassType}) : 
  0;
  this.$suffix_$ = $opt_suffix$$ || "";
}
function $JSCompiler_StaticMethods_msg_$$($JSCompiler_StaticMethods_msg_$self$$, $level$jscomp$8$$, $messages$$) {
  if (0 != $JSCompiler_StaticMethods_msg_$self$$.$level_$) {
    var $fn$jscomp$1$$ = $JSCompiler_StaticMethods_msg_$self$$.win.console.log;
    "ERROR" == $level$jscomp$8$$ ? $fn$jscomp$1$$ = $JSCompiler_StaticMethods_msg_$self$$.win.console.error || $fn$jscomp$1$$ : "INFO" == $level$jscomp$8$$ ? $fn$jscomp$1$$ = $JSCompiler_StaticMethods_msg_$self$$.win.console.info || $fn$jscomp$1$$ : "WARN" == $level$jscomp$8$$ && ($fn$jscomp$1$$ = $JSCompiler_StaticMethods_msg_$self$$.win.console.warn || $fn$jscomp$1$$);
    $fn$jscomp$1$$.apply($JSCompiler_StaticMethods_msg_$self$$.win.console, $messages$$);
  }
}
$JSCompiler_prototypeAlias$$ = $Log$$module$src$log$$.prototype;
$JSCompiler_prototypeAlias$$.isEnabled = function() {
  return 0 != this.$level_$;
};
$JSCompiler_prototypeAlias$$.fine = function($tag$jscomp$2$$, $var_args$jscomp$47$$) {
  4 <= this.$level_$ && $JSCompiler_StaticMethods_msg_$$(this, "FINE", Array.prototype.slice.call(arguments, 1));
};
$JSCompiler_prototypeAlias$$.info = function($tag$jscomp$3$$, $var_args$jscomp$48$$) {
  3 <= this.$level_$ && $JSCompiler_StaticMethods_msg_$$(this, "INFO", Array.prototype.slice.call(arguments, 1));
};
$JSCompiler_prototypeAlias$$.warn = function($tag$jscomp$4$$, $var_args$jscomp$49$$) {
  2 <= this.$level_$ && $JSCompiler_StaticMethods_msg_$$(this, "WARN", Array.prototype.slice.call(arguments, 1));
};
$JSCompiler_prototypeAlias$$.$error_$ = function($tag$jscomp$5$$, $var_args$jscomp$50$$) {
  if (1 <= this.$level_$) {
    $JSCompiler_StaticMethods_msg_$$(this, "ERROR", Array.prototype.slice.call(arguments, 1));
  } else {
    var $error$jscomp$2$$ = $createErrorVargs$$module$src$log$$.apply(null, Array.prototype.slice.call(arguments, 1));
    $JSCompiler_StaticMethods_prepareError_$$(this, $error$jscomp$2$$);
    return $error$jscomp$2$$;
  }
};
$JSCompiler_prototypeAlias$$.error = function($tag$jscomp$6$$, $var_args$jscomp$51$$) {
  var $error$jscomp$3$$ = this.$error_$.apply(this, arguments);
  $error$jscomp$3$$ && ($error$jscomp$3$$.name = $tag$jscomp$6$$ || $error$jscomp$3$$.name, self.reportError($error$jscomp$3$$));
};
$JSCompiler_prototypeAlias$$.expectedError = function($unusedTag$$, $var_args$jscomp$52$$) {
  var $error$jscomp$4$$ = this.$error_$.apply(this, arguments);
  $error$jscomp$4$$ && ($error$jscomp$4$$.expected = !0, self.reportError($error$jscomp$4$$));
};
$JSCompiler_prototypeAlias$$.createError = function($var_args$jscomp$53$$) {
  var $error$jscomp$5$$ = $createErrorVargs$$module$src$log$$.apply(null, arguments);
  $JSCompiler_StaticMethods_prepareError_$$(this, $error$jscomp$5$$);
  return $error$jscomp$5$$;
};
$JSCompiler_prototypeAlias$$.createExpectedError = function($var_args$jscomp$54$$) {
  var $error$jscomp$6$$ = $createErrorVargs$$module$src$log$$.apply(null, arguments);
  $JSCompiler_StaticMethods_prepareError_$$(this, $error$jscomp$6$$);
  $error$jscomp$6$$.expected = !0;
  return $error$jscomp$6$$;
};
$JSCompiler_prototypeAlias$$.assert = function($shouldBeTrueish$$, $opt_message$jscomp$7$$, $var_args$jscomp$55$$) {
  var $firstElement$$;
  if (!$shouldBeTrueish$$) {
    var $splitMessage$$ = ($opt_message$jscomp$7$$ || "Assertion failed").split("%s"), $JSCompiler_val$jscomp$inline_63_JSCompiler_val$jscomp$inline_65_first$jscomp$4$$ = $splitMessage$$.shift(), $formatted$$ = $JSCompiler_val$jscomp$inline_63_JSCompiler_val$jscomp$inline_65_first$jscomp$4$$, $messageArray$$ = [], $e$jscomp$9_i$jscomp$3$$ = 2;
    for ("" != $JSCompiler_val$jscomp$inline_63_JSCompiler_val$jscomp$inline_65_first$jscomp$4$$ && $messageArray$$.push($JSCompiler_val$jscomp$inline_63_JSCompiler_val$jscomp$inline_65_first$jscomp$4$$); 0 < $splitMessage$$.length;) {
      var $nextConstant$$ = $splitMessage$$.shift(), $val$$ = arguments[$e$jscomp$9_i$jscomp$3$$++];
      $val$$ && $val$$.tagName && ($firstElement$$ = $val$$);
      $messageArray$$.push($val$$);
      $JSCompiler_val$jscomp$inline_63_JSCompiler_val$jscomp$inline_65_first$jscomp$4$$ = $nextConstant$$.trim();
      "" != $JSCompiler_val$jscomp$inline_63_JSCompiler_val$jscomp$inline_65_first$jscomp$4$$ && $messageArray$$.push($JSCompiler_val$jscomp$inline_63_JSCompiler_val$jscomp$inline_65_first$jscomp$4$$);
      $JSCompiler_val$jscomp$inline_63_JSCompiler_val$jscomp$inline_65_first$jscomp$4$$ = $val$$;
      $formatted$$ += ($JSCompiler_val$jscomp$inline_63_JSCompiler_val$jscomp$inline_65_first$jscomp$4$$ && 1 == $JSCompiler_val$jscomp$inline_63_JSCompiler_val$jscomp$inline_65_first$jscomp$4$$.nodeType ? $JSCompiler_val$jscomp$inline_63_JSCompiler_val$jscomp$inline_65_first$jscomp$4$$.tagName.toLowerCase() + ($JSCompiler_val$jscomp$inline_63_JSCompiler_val$jscomp$inline_65_first$jscomp$4$$.id ? "#" + $JSCompiler_val$jscomp$inline_63_JSCompiler_val$jscomp$inline_65_first$jscomp$4$$.id : "") : $JSCompiler_val$jscomp$inline_63_JSCompiler_val$jscomp$inline_65_first$jscomp$4$$) + 
      $nextConstant$$;
    }
    $e$jscomp$9_i$jscomp$3$$ = Error($formatted$$);
    $e$jscomp$9_i$jscomp$3$$.fromAssert = !0;
    $e$jscomp$9_i$jscomp$3$$.associatedElement = $firstElement$$;
    $e$jscomp$9_i$jscomp$3$$.messageArray = $messageArray$$;
    $JSCompiler_StaticMethods_prepareError_$$(this, $e$jscomp$9_i$jscomp$3$$);
    self.reportError($e$jscomp$9_i$jscomp$3$$);
    throw $e$jscomp$9_i$jscomp$3$$;
  }
  return $shouldBeTrueish$$;
};
$JSCompiler_prototypeAlias$$.assertElement = function($shouldBeElement$$, $opt_message$jscomp$8$$) {
  this.assert($shouldBeElement$$ && 1 == $shouldBeElement$$.nodeType, ($opt_message$jscomp$8$$ || "Element expected") + ": %s", $shouldBeElement$$);
  return $shouldBeElement$$;
};
$JSCompiler_prototypeAlias$$.assertString = function($shouldBeString$$, $opt_message$jscomp$9$$) {
  this.assert("string" == typeof $shouldBeString$$, ($opt_message$jscomp$9$$ || "String expected") + ": %s", $shouldBeString$$);
  return $shouldBeString$$;
};
$JSCompiler_prototypeAlias$$.assertNumber = function($shouldBeNumber$$, $opt_message$jscomp$10$$) {
  this.assert("number" == typeof $shouldBeNumber$$, ($opt_message$jscomp$10$$ || "Number expected") + ": %s", $shouldBeNumber$$);
  return $shouldBeNumber$$;
};
$JSCompiler_prototypeAlias$$.assertArray = function($shouldBeArray$$, $opt_message$jscomp$11$$) {
  this.assert(Array.isArray($shouldBeArray$$), ($opt_message$jscomp$11$$ || "Array expected") + ": %s", $shouldBeArray$$);
  return $shouldBeArray$$;
};
$JSCompiler_prototypeAlias$$.assertBoolean = function($shouldBeBoolean$$, $opt_message$jscomp$12$$) {
  this.assert(!!$shouldBeBoolean$$ === $shouldBeBoolean$$, ($opt_message$jscomp$12$$ || "Boolean expected") + ": %s", $shouldBeBoolean$$);
  return $shouldBeBoolean$$;
};
$JSCompiler_prototypeAlias$$.assertEnumValue = function($JSCompiler_inline_result$jscomp$22_enumObj$jscomp$1$$, $s$jscomp$3$$, $opt_enumName$$) {
  a: {
    for (var $JSCompiler_k$jscomp$inline_69$$ in $JSCompiler_inline_result$jscomp$22_enumObj$jscomp$1$$) {
      if ($JSCompiler_inline_result$jscomp$22_enumObj$jscomp$1$$[$JSCompiler_k$jscomp$inline_69$$] === $s$jscomp$3$$) {
        $JSCompiler_inline_result$jscomp$22_enumObj$jscomp$1$$ = !0;
        break a;
      }
    }
    $JSCompiler_inline_result$jscomp$22_enumObj$jscomp$1$$ = !1;
  }
  if ($JSCompiler_inline_result$jscomp$22_enumObj$jscomp$1$$) {
    return $s$jscomp$3$$;
  }
  this.assert(!1, 'Unknown %s value: "%s"', $opt_enumName$$ || "enum", $s$jscomp$3$$);
};
function $JSCompiler_StaticMethods_prepareError_$$($JSCompiler_StaticMethods_prepareError_$self$$, $error$jscomp$7$$) {
  $error$jscomp$7$$ = $duplicateErrorIfNecessary$$module$src$log$$($error$jscomp$7$$);
  $JSCompiler_StaticMethods_prepareError_$self$$.$suffix_$ ? $error$jscomp$7$$.message ? -1 == $error$jscomp$7$$.message.indexOf($JSCompiler_StaticMethods_prepareError_$self$$.$suffix_$) && ($error$jscomp$7$$.message += $JSCompiler_StaticMethods_prepareError_$self$$.$suffix_$) : $error$jscomp$7$$.message = $JSCompiler_StaticMethods_prepareError_$self$$.$suffix_$ : 0 <= $error$jscomp$7$$.message.indexOf("\u200b\u200b\u200b") && ($error$jscomp$7$$.message = $error$jscomp$7$$.message.replace("\u200b\u200b\u200b", 
  ""));
}
function $duplicateErrorIfNecessary$$module$src$log$$($error$jscomp$8$$) {
  var $messageProperty$$ = Object.getOwnPropertyDescriptor($error$jscomp$8$$, "message");
  if ($messageProperty$$ && $messageProperty$$.writable) {
    return $error$jscomp$8$$;
  }
  var $stack$$ = $error$jscomp$8$$.stack, $e$jscomp$10$$ = Error($error$jscomp$8$$.message), $prop$jscomp$4$$;
  for ($prop$jscomp$4$$ in $error$jscomp$8$$) {
    $e$jscomp$10$$[$prop$jscomp$4$$] = $error$jscomp$8$$[$prop$jscomp$4$$];
  }
  $e$jscomp$10$$.stack = $stack$$;
  return $e$jscomp$10$$;
}
function $createErrorVargs$$module$src$log$$($var_args$jscomp$56$$) {
  for (var $error$jscomp$9$$ = null, $message$jscomp$27$$ = "", $i$jscomp$4$$ = 0; $i$jscomp$4$$ < arguments.length; $i$jscomp$4$$++) {
    var $arg$jscomp$6$$ = arguments[$i$jscomp$4$$];
    $arg$jscomp$6$$ instanceof Error && !$error$jscomp$9$$ ? $error$jscomp$9$$ = $duplicateErrorIfNecessary$$module$src$log$$($arg$jscomp$6$$) : ($message$jscomp$27$$ && ($message$jscomp$27$$ += " "), $message$jscomp$27$$ += $arg$jscomp$6$$);
  }
  $error$jscomp$9$$ ? $message$jscomp$27$$ && ($error$jscomp$9$$.message = $message$jscomp$27$$ + ": " + $error$jscomp$9$$.message) : $error$jscomp$9$$ = Error($message$jscomp$27$$);
  return $error$jscomp$9$$;
}
self.log = self.log || {user:null, dev:null, userForEmbed:null};
var $logs$$module$src$log$$ = self.log, $logConstructor$$module$src$log$$ = null;
function $user$$module$src$log$$() {
  $logs$$module$src$log$$.user || ($logs$$module$src$log$$.user = $getUserLogger$$module$src$log$$());
  return $logs$$module$src$log$$.user;
}
function $getUserLogger$$module$src$log$$() {
  var $suffix$$ = "\u200b\u200b\u200b";
  if (!$logConstructor$$module$src$log$$) {
    throw Error("failed to call initLogConstructor");
  }
  return new $logConstructor$$module$src$log$$(self, function($suffix$$) {
    var $mode$jscomp$10$$ = parseInt($suffix$$.log, 10);
    return $suffix$$.development || 1 <= $mode$jscomp$10$$ ? 4 : 2;
  }, $suffix$$);
}
function $dev$$module$src$log$$() {
  if ($logs$$module$src$log$$.dev) {
    return $logs$$module$src$log$$.dev;
  }
  if (!$logConstructor$$module$src$log$$) {
    throw Error("failed to call initLogConstructor");
  }
  return $logs$$module$src$log$$.dev = new $logConstructor$$module$src$log$$(self, function($logNum$jscomp$1_mode$jscomp$11$$) {
    $logNum$jscomp$1_mode$jscomp$11$$ = parseInt($logNum$jscomp$1_mode$jscomp$11$$.log, 10);
    return 3 <= $logNum$jscomp$1_mode$jscomp$11$$ ? 4 : 2 <= $logNum$jscomp$1_mode$jscomp$11$$ ? 3 : 0;
  });
}
;function $LruCache$$module$src$utils$lru_cache$$() {
  var $capacity$$ = 100;
  this.$capacity_$ = $capacity$$;
  this.$access_$ = this.$size_$ = 0;
  this.$cache_$ = Object.create(null);
}
$LruCache$$module$src$utils$lru_cache$$.prototype.has = function($key$jscomp$35$$) {
  return !!this.$cache_$[$key$jscomp$35$$];
};
$LruCache$$module$src$utils$lru_cache$$.prototype.get = function($key$jscomp$36$$) {
  var $cacheable$$ = this.$cache_$[$key$jscomp$36$$];
  if ($cacheable$$) {
    return $cacheable$$.access = ++this.$access_$, $cacheable$$.payload;
  }
};
$LruCache$$module$src$utils$lru_cache$$.prototype.put = function($JSCompiler_cache$jscomp$inline_75_key$jscomp$37$$, $payload$$) {
  this.has($JSCompiler_cache$jscomp$inline_75_key$jscomp$37$$) || this.$size_$++;
  this.$cache_$[$JSCompiler_cache$jscomp$inline_75_key$jscomp$37$$] = {payload:$payload$$, access:this.$access_$};
  if (!(this.$size_$ <= this.$capacity_$)) {
    $dev$$module$src$log$$().warn("lru-cache", "Trimming LRU cache");
    $JSCompiler_cache$jscomp$inline_75_key$jscomp$37$$ = this.$cache_$;
    var $JSCompiler_oldest$jscomp$inline_76$$ = this.$access_$ + 1, $JSCompiler_key$jscomp$inline_78$$;
    for ($JSCompiler_key$jscomp$inline_78$$ in $JSCompiler_cache$jscomp$inline_75_key$jscomp$37$$) {
      var $JSCompiler_access$jscomp$inline_79$$ = $JSCompiler_cache$jscomp$inline_75_key$jscomp$37$$[$JSCompiler_key$jscomp$inline_78$$].access;
      if ($JSCompiler_access$jscomp$inline_79$$ < $JSCompiler_oldest$jscomp$inline_76$$) {
        $JSCompiler_oldest$jscomp$inline_76$$ = $JSCompiler_access$jscomp$inline_79$$;
        var $JSCompiler_oldestKey$jscomp$inline_77$$ = $JSCompiler_key$jscomp$inline_78$$;
      }
    }
    void 0 !== $JSCompiler_oldestKey$jscomp$inline_77$$ && (delete $JSCompiler_cache$jscomp$inline_75_key$jscomp$37$$[$JSCompiler_oldestKey$jscomp$inline_77$$], this.$size_$--);
  }
};
var $hasOwn_$$module$src$utils$object$$ = Object.prototype.hasOwnProperty;
function $map$$module$src$utils$object$$() {
  var $opt_initial$$, $obj$jscomp$25$$ = Object.create(null);
  $opt_initial$$ && Object.assign($obj$jscomp$25$$, $opt_initial$$);
  return $obj$jscomp$25$$;
}
function $dict$$module$src$utils$object$$($opt_initial$jscomp$1$$) {
  return $opt_initial$jscomp$1$$ || {};
}
;function $startsWith$$module$src$string$$($string$jscomp$6$$, $prefix$jscomp$2$$) {
  return $prefix$jscomp$2$$.length > $string$jscomp$6$$.length ? !1 : 0 == $string$jscomp$6$$.lastIndexOf($prefix$jscomp$2$$, 0);
}
;var $env$$module$src$config$$ = self.AMP_CONFIG || {}, $urls$$module$src$config$$ = {thirdParty:$env$$module$src$config$$.thirdPartyUrl || "https://3p.ampproject.net", thirdPartyFrameHost:$env$$module$src$config$$.thirdPartyFrameHost || "ampproject.net", thirdPartyFrameRegex:("string" == typeof $env$$module$src$config$$.thirdPartyFrameRegex ? new RegExp($env$$module$src$config$$.thirdPartyFrameRegex) : $env$$module$src$config$$.thirdPartyFrameRegex) || /^d-\d+\.ampproject\.net$/, cdn:$env$$module$src$config$$.cdnUrl || 
"https://cdn.ampproject.org", cdnProxyRegex:("string" == typeof $env$$module$src$config$$.cdnProxyRegex ? new RegExp($env$$module$src$config$$.cdnProxyRegex) : $env$$module$src$config$$.cdnProxyRegex) || /^https:\/\/([a-zA-Z0-9_-]+\.)?cdn\.ampproject\.org$/, localhostRegex:/^https?:\/\/localhost(:\d+)?$/, errorReporting:$env$$module$src$config$$.errorReportingUrl || "https://amp-error-reporting.appspot.com/r", localDev:$env$$module$src$config$$.localDev || !1};
$dict$$module$src$utils$object$$({c:!0, v:!0, a:!0, ad:!0});
var $a$$module$src$url$$, $cache$$module$src$url$$;
function $parseUrlDeprecated$$module$src$url$$($JSCompiler_inline_result$jscomp$26_url$jscomp$21$$) {
  var $opt_nocache$$;
  $a$$module$src$url$$ || ($a$$module$src$url$$ = self.document.createElement("a"), $cache$$module$src$url$$ = self.UrlCache || (self.UrlCache = new $LruCache$$module$src$utils$lru_cache$$));
  var $JSCompiler_opt_cache$jscomp$inline_82$$ = $opt_nocache$$ ? null : $cache$$module$src$url$$, $JSCompiler_a$jscomp$inline_83$$ = $a$$module$src$url$$;
  if ($JSCompiler_opt_cache$jscomp$inline_82$$ && $JSCompiler_opt_cache$jscomp$inline_82$$.has($JSCompiler_inline_result$jscomp$26_url$jscomp$21$$)) {
    $JSCompiler_inline_result$jscomp$26_url$jscomp$21$$ = $JSCompiler_opt_cache$jscomp$inline_82$$.get($JSCompiler_inline_result$jscomp$26_url$jscomp$21$$);
  } else {
    $JSCompiler_a$jscomp$inline_83$$.href = $JSCompiler_inline_result$jscomp$26_url$jscomp$21$$;
    $JSCompiler_a$jscomp$inline_83$$.protocol || ($JSCompiler_a$jscomp$inline_83$$.href = $JSCompiler_a$jscomp$inline_83$$.href);
    var $JSCompiler_info$jscomp$inline_84$$ = {href:$JSCompiler_a$jscomp$inline_83$$.href, protocol:$JSCompiler_a$jscomp$inline_83$$.protocol, host:$JSCompiler_a$jscomp$inline_83$$.host, hostname:$JSCompiler_a$jscomp$inline_83$$.hostname, port:"0" == $JSCompiler_a$jscomp$inline_83$$.port ? "" : $JSCompiler_a$jscomp$inline_83$$.port, pathname:$JSCompiler_a$jscomp$inline_83$$.pathname, search:$JSCompiler_a$jscomp$inline_83$$.search, hash:$JSCompiler_a$jscomp$inline_83$$.hash, origin:null};
    "/" !== $JSCompiler_info$jscomp$inline_84$$.pathname[0] && ($JSCompiler_info$jscomp$inline_84$$.pathname = "/" + $JSCompiler_info$jscomp$inline_84$$.pathname);
    if ("http:" == $JSCompiler_info$jscomp$inline_84$$.protocol && 80 == $JSCompiler_info$jscomp$inline_84$$.port || "https:" == $JSCompiler_info$jscomp$inline_84$$.protocol && 443 == $JSCompiler_info$jscomp$inline_84$$.port) {
      $JSCompiler_info$jscomp$inline_84$$.port = "", $JSCompiler_info$jscomp$inline_84$$.host = $JSCompiler_info$jscomp$inline_84$$.hostname;
    }
    $JSCompiler_info$jscomp$inline_84$$.origin = $JSCompiler_a$jscomp$inline_83$$.origin && "null" != $JSCompiler_a$jscomp$inline_83$$.origin ? $JSCompiler_a$jscomp$inline_83$$.origin : "data:" != $JSCompiler_info$jscomp$inline_84$$.protocol && $JSCompiler_info$jscomp$inline_84$$.host ? $JSCompiler_info$jscomp$inline_84$$.protocol + "//" + $JSCompiler_info$jscomp$inline_84$$.host : $JSCompiler_info$jscomp$inline_84$$.href;
    $JSCompiler_opt_cache$jscomp$inline_82$$ && $JSCompiler_opt_cache$jscomp$inline_82$$.put($JSCompiler_inline_result$jscomp$26_url$jscomp$21$$, $JSCompiler_info$jscomp$inline_84$$);
    $JSCompiler_inline_result$jscomp$26_url$jscomp$21$$ = $JSCompiler_info$jscomp$inline_84$$;
  }
  return $JSCompiler_inline_result$jscomp$26_url$jscomp$21$$;
}
function $isProxyOrigin$$module$src$url$$($url$jscomp$30$$) {
  "string" == typeof $url$jscomp$30$$ && ($url$jscomp$30$$ = $parseUrlDeprecated$$module$src$url$$($url$jscomp$30$$));
  return $urls$$module$src$config$$.cdnProxyRegex.test($url$jscomp$30$$.origin);
}
;/*
 https://mths.be/cssescape v1.5.1 by @mathias | MIT license */
function $closest$$module$src$dom$$($element$jscomp$14$$, $callback$jscomp$53$$) {
  for (var $opt_stopAt$$, $el$$ = $element$jscomp$14$$; $el$$ && $el$$ !== $opt_stopAt$$; $el$$ = $el$$.parentElement) {
    if ($callback$jscomp$53$$($el$$)) {
      return $el$$;
    }
  }
  return null;
}
;function $handleClick$$module$ads$alp$handler$$($JSCompiler_url$jscomp$inline_95_e$jscomp$14$$, $opt_viewerNavigate$$) {
  if (!($JSCompiler_url$jscomp$inline_95_e$jscomp$14$$.defaultPrevented || 0 != $JSCompiler_url$jscomp$inline_95_e$jscomp$14$$.buttons && 1 != $JSCompiler_url$jscomp$inline_95_e$jscomp$14$$.buttons || $JSCompiler_url$jscomp$inline_95_e$jscomp$14$$.ctrlKey || $JSCompiler_url$jscomp$inline_95_e$jscomp$14$$.altKey || $JSCompiler_url$jscomp$inline_95_e$jscomp$14$$.shiftKey || $JSCompiler_url$jscomp$inline_95_e$jscomp$14$$.metaKey)) {
    var $link$$ = $getLinkInfo$$module$ads$alp$handler$$($JSCompiler_url$jscomp$inline_95_e$jscomp$14$$);
    if ($link$$ && $link$$.eventualUrl && !1 !== $JSCompiler_url$jscomp$inline_95_e$jscomp$14$$.isTrusted) {
      var $JSCompiler_temp_const$jscomp$27_fragment$jscomp$1_win$jscomp$12$$ = encodeURIComponent, $JSCompiler_a2aAncestor$jscomp$inline_97_JSCompiler_inline_result$jscomp$193_JSCompiler_mainAndFragment$jscomp$inline_200_JSCompiler_origins$jscomp$inline_205_JSCompiler_temp$jscomp$inline_209_JSCompiler_url$jscomp$inline_87_ancestors$jscomp$1$$ = $link$$.a.href;
      var $JSCompiler_field$jscomp$inline_91_JSCompiler_inline_result$jscomp$28_JSCompiler_newUrl$jscomp$inline_202_JSCompiler_target$jscomp$inline_96_destination$jscomp$3$$ = encodeURIComponent("amp") + "=" + encodeURIComponent("1");
      if ($JSCompiler_field$jscomp$inline_91_JSCompiler_inline_result$jscomp$28_JSCompiler_newUrl$jscomp$inline_202_JSCompiler_target$jscomp$inline_96_destination$jscomp$3$$) {
        $JSCompiler_a2aAncestor$jscomp$inline_97_JSCompiler_inline_result$jscomp$193_JSCompiler_mainAndFragment$jscomp$inline_200_JSCompiler_origins$jscomp$inline_205_JSCompiler_temp$jscomp$inline_209_JSCompiler_url$jscomp$inline_87_ancestors$jscomp$1$$ = $JSCompiler_a2aAncestor$jscomp$inline_97_JSCompiler_inline_result$jscomp$193_JSCompiler_mainAndFragment$jscomp$inline_200_JSCompiler_origins$jscomp$inline_205_JSCompiler_temp$jscomp$inline_209_JSCompiler_url$jscomp$inline_87_ancestors$jscomp$1$$.split("#", 
        2);
        var $JSCompiler_amp$jscomp$inline_206_JSCompiler_mainAndQuery$jscomp$inline_201$$ = $JSCompiler_a2aAncestor$jscomp$inline_97_JSCompiler_inline_result$jscomp$193_JSCompiler_mainAndFragment$jscomp$inline_200_JSCompiler_origins$jscomp$inline_205_JSCompiler_temp$jscomp$inline_209_JSCompiler_url$jscomp$inline_87_ancestors$jscomp$1$$[0].split("?", 2);
        $JSCompiler_field$jscomp$inline_91_JSCompiler_inline_result$jscomp$28_JSCompiler_newUrl$jscomp$inline_202_JSCompiler_target$jscomp$inline_96_destination$jscomp$3$$ = $JSCompiler_amp$jscomp$inline_206_JSCompiler_mainAndQuery$jscomp$inline_201$$[0] + ($JSCompiler_amp$jscomp$inline_206_JSCompiler_mainAndQuery$jscomp$inline_201$$[1] ? "?" + $JSCompiler_field$jscomp$inline_91_JSCompiler_inline_result$jscomp$28_JSCompiler_newUrl$jscomp$inline_202_JSCompiler_target$jscomp$inline_96_destination$jscomp$3$$ + 
        "&" + $JSCompiler_amp$jscomp$inline_206_JSCompiler_mainAndQuery$jscomp$inline_201$$[1] : "?" + $JSCompiler_field$jscomp$inline_91_JSCompiler_inline_result$jscomp$28_JSCompiler_newUrl$jscomp$inline_202_JSCompiler_target$jscomp$inline_96_destination$jscomp$3$$);
        $JSCompiler_field$jscomp$inline_91_JSCompiler_inline_result$jscomp$28_JSCompiler_newUrl$jscomp$inline_202_JSCompiler_target$jscomp$inline_96_destination$jscomp$3$$ += $JSCompiler_a2aAncestor$jscomp$inline_97_JSCompiler_inline_result$jscomp$193_JSCompiler_mainAndFragment$jscomp$inline_200_JSCompiler_origins$jscomp$inline_205_JSCompiler_temp$jscomp$inline_209_JSCompiler_url$jscomp$inline_87_ancestors$jscomp$1$$[1] ? "#" + $JSCompiler_a2aAncestor$jscomp$inline_97_JSCompiler_inline_result$jscomp$193_JSCompiler_mainAndFragment$jscomp$inline_200_JSCompiler_origins$jscomp$inline_205_JSCompiler_temp$jscomp$inline_209_JSCompiler_url$jscomp$inline_87_ancestors$jscomp$1$$[1] : 
        "";
      } else {
        $JSCompiler_field$jscomp$inline_91_JSCompiler_inline_result$jscomp$28_JSCompiler_newUrl$jscomp$inline_202_JSCompiler_target$jscomp$inline_96_destination$jscomp$3$$ = $JSCompiler_a2aAncestor$jscomp$inline_97_JSCompiler_inline_result$jscomp$193_JSCompiler_mainAndFragment$jscomp$inline_200_JSCompiler_origins$jscomp$inline_205_JSCompiler_temp$jscomp$inline_209_JSCompiler_url$jscomp$inline_87_ancestors$jscomp$1$$;
      }
      $JSCompiler_temp_const$jscomp$27_fragment$jscomp$1_win$jscomp$12$$ = "click=" + $JSCompiler_temp_const$jscomp$27_fragment$jscomp$1_win$jscomp$12$$($JSCompiler_field$jscomp$inline_91_JSCompiler_inline_result$jscomp$28_JSCompiler_newUrl$jscomp$inline_202_JSCompiler_target$jscomp$inline_96_destination$jscomp$3$$);
      $JSCompiler_field$jscomp$inline_91_JSCompiler_inline_result$jscomp$28_JSCompiler_newUrl$jscomp$inline_202_JSCompiler_target$jscomp$inline_96_destination$jscomp$3$$ = $link$$.eventualUrl;
      $JSCompiler_field$jscomp$inline_91_JSCompiler_inline_result$jscomp$28_JSCompiler_newUrl$jscomp$inline_202_JSCompiler_target$jscomp$inline_96_destination$jscomp$3$$ = -1 == $link$$.eventualUrl.indexOf("#") ? $JSCompiler_field$jscomp$inline_91_JSCompiler_inline_result$jscomp$28_JSCompiler_newUrl$jscomp$inline_202_JSCompiler_target$jscomp$inline_96_destination$jscomp$3$$ + ("#" + $JSCompiler_temp_const$jscomp$27_fragment$jscomp$1_win$jscomp$12$$) : $JSCompiler_field$jscomp$inline_91_JSCompiler_inline_result$jscomp$28_JSCompiler_newUrl$jscomp$inline_202_JSCompiler_target$jscomp$inline_96_destination$jscomp$3$$ + 
      ("&" + $JSCompiler_temp_const$jscomp$27_fragment$jscomp$1_win$jscomp$12$$);
      $JSCompiler_temp_const$jscomp$27_fragment$jscomp$1_win$jscomp$12$$ = $link$$.a.ownerDocument.defaultView;
      ($JSCompiler_a2aAncestor$jscomp$inline_97_JSCompiler_inline_result$jscomp$193_JSCompiler_mainAndFragment$jscomp$inline_200_JSCompiler_origins$jscomp$inline_205_JSCompiler_temp$jscomp$inline_209_JSCompiler_url$jscomp$inline_87_ancestors$jscomp$1$$ = $JSCompiler_temp_const$jscomp$27_fragment$jscomp$1_win$jscomp$12$$.location.ancestorOrigins) && "http://localhost:8000" == $JSCompiler_a2aAncestor$jscomp$inline_97_JSCompiler_inline_result$jscomp$193_JSCompiler_mainAndFragment$jscomp$inline_200_JSCompiler_origins$jscomp$inline_205_JSCompiler_temp$jscomp$inline_209_JSCompiler_url$jscomp$inline_87_ancestors$jscomp$1$$[$JSCompiler_a2aAncestor$jscomp$inline_97_JSCompiler_inline_result$jscomp$193_JSCompiler_mainAndFragment$jscomp$inline_200_JSCompiler_origins$jscomp$inline_205_JSCompiler_temp$jscomp$inline_209_JSCompiler_url$jscomp$inline_87_ancestors$jscomp$1$$.length - 
      1] && ($JSCompiler_field$jscomp$inline_91_JSCompiler_inline_result$jscomp$28_JSCompiler_newUrl$jscomp$inline_202_JSCompiler_target$jscomp$inline_96_destination$jscomp$3$$ = $JSCompiler_field$jscomp$inline_91_JSCompiler_inline_result$jscomp$28_JSCompiler_newUrl$jscomp$inline_202_JSCompiler_target$jscomp$inline_96_destination$jscomp$3$$.replace($parseUrlDeprecated$$module$src$url$$($link$$.eventualUrl).host + "/c/", "http://localhost:8000/max/"));
      $JSCompiler_url$jscomp$inline_95_e$jscomp$14$$.preventDefault();
      if ($opt_viewerNavigate$$) {
        $opt_viewerNavigate$$($JSCompiler_field$jscomp$inline_91_JSCompiler_inline_result$jscomp$28_JSCompiler_newUrl$jscomp$inline_202_JSCompiler_target$jscomp$inline_96_destination$jscomp$3$$);
      } else {
        $JSCompiler_url$jscomp$inline_95_e$jscomp$14$$ = $JSCompiler_field$jscomp$inline_91_JSCompiler_inline_result$jscomp$28_JSCompiler_newUrl$jscomp$inline_202_JSCompiler_target$jscomp$inline_96_destination$jscomp$3$$;
        $JSCompiler_field$jscomp$inline_91_JSCompiler_inline_result$jscomp$28_JSCompiler_newUrl$jscomp$inline_202_JSCompiler_target$jscomp$inline_96_destination$jscomp$3$$ = ($link$$.a.target || "_top").toLowerCase();
        if ($JSCompiler_temp_const$jscomp$27_fragment$jscomp$1_win$jscomp$12$$.location.ancestorOrigins) {
          if ($JSCompiler_a2aAncestor$jscomp$inline_97_JSCompiler_inline_result$jscomp$193_JSCompiler_mainAndFragment$jscomp$inline_200_JSCompiler_origins$jscomp$inline_205_JSCompiler_temp$jscomp$inline_209_JSCompiler_url$jscomp$inline_87_ancestors$jscomp$1$$ = $JSCompiler_temp_const$jscomp$27_fragment$jscomp$1_win$jscomp$12$$.location.ancestorOrigins, 2 > $JSCompiler_a2aAncestor$jscomp$inline_97_JSCompiler_inline_result$jscomp$193_JSCompiler_mainAndFragment$jscomp$inline_200_JSCompiler_origins$jscomp$inline_205_JSCompiler_temp$jscomp$inline_209_JSCompiler_url$jscomp$inline_87_ancestors$jscomp$1$$.length || 
          -1 == $JSCompiler_a2aAncestor$jscomp$inline_97_JSCompiler_inline_result$jscomp$193_JSCompiler_mainAndFragment$jscomp$inline_200_JSCompiler_origins$jscomp$inline_205_JSCompiler_temp$jscomp$inline_209_JSCompiler_url$jscomp$inline_87_ancestors$jscomp$1$$[$JSCompiler_a2aAncestor$jscomp$inline_97_JSCompiler_inline_result$jscomp$193_JSCompiler_mainAndFragment$jscomp$inline_200_JSCompiler_origins$jscomp$inline_205_JSCompiler_temp$jscomp$inline_209_JSCompiler_url$jscomp$inline_87_ancestors$jscomp$1$$.length - 
          1].indexOf(".google.")) {
            $JSCompiler_a2aAncestor$jscomp$inline_97_JSCompiler_inline_result$jscomp$193_JSCompiler_mainAndFragment$jscomp$inline_200_JSCompiler_origins$jscomp$inline_205_JSCompiler_temp$jscomp$inline_209_JSCompiler_url$jscomp$inline_87_ancestors$jscomp$1$$ = null;
          } else {
            $JSCompiler_amp$jscomp$inline_206_JSCompiler_mainAndQuery$jscomp$inline_201$$ = $JSCompiler_a2aAncestor$jscomp$inline_97_JSCompiler_inline_result$jscomp$193_JSCompiler_mainAndFragment$jscomp$inline_200_JSCompiler_origins$jscomp$inline_205_JSCompiler_temp$jscomp$inline_209_JSCompiler_url$jscomp$inline_87_ancestors$jscomp$1$$[$JSCompiler_a2aAncestor$jscomp$inline_97_JSCompiler_inline_result$jscomp$193_JSCompiler_mainAndFragment$jscomp$inline_200_JSCompiler_origins$jscomp$inline_205_JSCompiler_temp$jscomp$inline_209_JSCompiler_url$jscomp$inline_87_ancestors$jscomp$1$$.length - 
            2];
            var $JSCompiler_parent$jscomp$inline_211_JSCompiler_temp$jscomp$inline_207_JSCompiler_url$jscomp$inline_208$$;
            ($JSCompiler_parent$jscomp$inline_211_JSCompiler_temp$jscomp$inline_207_JSCompiler_url$jscomp$inline_208$$ = $isProxyOrigin$$module$src$url$$($JSCompiler_amp$jscomp$inline_206_JSCompiler_mainAndQuery$jscomp$inline_201$$)) || ($JSCompiler_parent$jscomp$inline_211_JSCompiler_temp$jscomp$inline_207_JSCompiler_url$jscomp$inline_208$$ = $JSCompiler_amp$jscomp$inline_206_JSCompiler_mainAndQuery$jscomp$inline_201$$, "string" == typeof $JSCompiler_parent$jscomp$inline_211_JSCompiler_temp$jscomp$inline_207_JSCompiler_url$jscomp$inline_208$$ && 
            ($JSCompiler_parent$jscomp$inline_211_JSCompiler_temp$jscomp$inline_207_JSCompiler_url$jscomp$inline_208$$ = $parseUrlDeprecated$$module$src$url$$($JSCompiler_parent$jscomp$inline_211_JSCompiler_temp$jscomp$inline_207_JSCompiler_url$jscomp$inline_208$$)), $JSCompiler_parent$jscomp$inline_211_JSCompiler_temp$jscomp$inline_207_JSCompiler_url$jscomp$inline_208$$ = $urls$$module$src$config$$.localhostRegex.test($JSCompiler_parent$jscomp$inline_211_JSCompiler_temp$jscomp$inline_207_JSCompiler_url$jscomp$inline_208$$.origin));
            if ($JSCompiler_parent$jscomp$inline_211_JSCompiler_temp$jscomp$inline_207_JSCompiler_url$jscomp$inline_208$$) {
              $JSCompiler_parent$jscomp$inline_211_JSCompiler_temp$jscomp$inline_207_JSCompiler_url$jscomp$inline_208$$ = $JSCompiler_temp_const$jscomp$27_fragment$jscomp$1_win$jscomp$12$$;
              for (var $JSCompiler_i$jscomp$inline_212$$ = 0; $JSCompiler_i$jscomp$inline_212$$ < $JSCompiler_a2aAncestor$jscomp$inline_97_JSCompiler_inline_result$jscomp$193_JSCompiler_mainAndFragment$jscomp$inline_200_JSCompiler_origins$jscomp$inline_205_JSCompiler_temp$jscomp$inline_209_JSCompiler_url$jscomp$inline_87_ancestors$jscomp$1$$.length - 1; $JSCompiler_i$jscomp$inline_212$$++) {
                $JSCompiler_parent$jscomp$inline_211_JSCompiler_temp$jscomp$inline_207_JSCompiler_url$jscomp$inline_208$$ = $JSCompiler_parent$jscomp$inline_211_JSCompiler_temp$jscomp$inline_207_JSCompiler_url$jscomp$inline_208$$.parent;
              }
              $JSCompiler_a2aAncestor$jscomp$inline_97_JSCompiler_inline_result$jscomp$193_JSCompiler_mainAndFragment$jscomp$inline_200_JSCompiler_origins$jscomp$inline_205_JSCompiler_temp$jscomp$inline_209_JSCompiler_url$jscomp$inline_87_ancestors$jscomp$1$$ = {win:$JSCompiler_parent$jscomp$inline_211_JSCompiler_temp$jscomp$inline_207_JSCompiler_url$jscomp$inline_208$$, origin:$JSCompiler_amp$jscomp$inline_206_JSCompiler_mainAndQuery$jscomp$inline_201$$};
            } else {
              $JSCompiler_a2aAncestor$jscomp$inline_97_JSCompiler_inline_result$jscomp$193_JSCompiler_mainAndFragment$jscomp$inline_200_JSCompiler_origins$jscomp$inline_205_JSCompiler_temp$jscomp$inline_209_JSCompiler_url$jscomp$inline_87_ancestors$jscomp$1$$ = null;
            }
          }
        } else {
          $JSCompiler_a2aAncestor$jscomp$inline_97_JSCompiler_inline_result$jscomp$193_JSCompiler_mainAndFragment$jscomp$inline_200_JSCompiler_origins$jscomp$inline_205_JSCompiler_temp$jscomp$inline_209_JSCompiler_url$jscomp$inline_87_ancestors$jscomp$1$$ = null;
        }
        if ($JSCompiler_a2aAncestor$jscomp$inline_97_JSCompiler_inline_result$jscomp$193_JSCompiler_mainAndFragment$jscomp$inline_200_JSCompiler_origins$jscomp$inline_205_JSCompiler_temp$jscomp$inline_209_JSCompiler_url$jscomp$inline_87_ancestors$jscomp$1$$) {
          $JSCompiler_a2aAncestor$jscomp$inline_97_JSCompiler_inline_result$jscomp$193_JSCompiler_mainAndFragment$jscomp$inline_200_JSCompiler_origins$jscomp$inline_205_JSCompiler_temp$jscomp$inline_209_JSCompiler_url$jscomp$inline_87_ancestors$jscomp$1$$.win.postMessage("a2a;" + JSON.stringify($dict$$module$src$utils$object$$({url:$JSCompiler_url$jscomp$inline_95_e$jscomp$14$$})), $JSCompiler_a2aAncestor$jscomp$inline_97_JSCompiler_inline_result$jscomp$193_JSCompiler_mainAndFragment$jscomp$inline_200_JSCompiler_origins$jscomp$inline_205_JSCompiler_temp$jscomp$inline_209_JSCompiler_url$jscomp$inline_87_ancestors$jscomp$1$$.origin);
        } else {
          try {
            var $JSCompiler_res$jscomp$inline_218$$ = $JSCompiler_temp_const$jscomp$27_fragment$jscomp$1_win$jscomp$12$$.open($JSCompiler_url$jscomp$inline_95_e$jscomp$14$$, $JSCompiler_field$jscomp$inline_91_JSCompiler_inline_result$jscomp$28_JSCompiler_newUrl$jscomp$inline_202_JSCompiler_target$jscomp$inline_96_destination$jscomp$3$$, void 0);
          } catch ($JSCompiler_e$jscomp$inline_219$$) {
            $dev$$module$src$log$$().error("DOM", "Failed to open url on target: ", $JSCompiler_field$jscomp$inline_91_JSCompiler_inline_result$jscomp$28_JSCompiler_newUrl$jscomp$inline_202_JSCompiler_target$jscomp$inline_96_destination$jscomp$3$$, $JSCompiler_e$jscomp$inline_219$$);
          }
          $JSCompiler_res$jscomp$inline_218$$ || "_top" == $JSCompiler_field$jscomp$inline_91_JSCompiler_inline_result$jscomp$28_JSCompiler_newUrl$jscomp$inline_202_JSCompiler_target$jscomp$inline_96_destination$jscomp$3$$ || $JSCompiler_temp_const$jscomp$27_fragment$jscomp$1_win$jscomp$12$$.open($JSCompiler_url$jscomp$inline_95_e$jscomp$14$$, "_top");
        }
      }
    }
  }
}
function $getLinkInfo$$module$ads$alp$handler$$($a$jscomp$2_e$jscomp$15$$) {
  if ($a$jscomp$2_e$jscomp$15$$ = $closest$$module$src$dom$$($a$jscomp$2_e$jscomp$15$$.target, function($a$jscomp$2_e$jscomp$15$$) {
    return "A" == $a$jscomp$2_e$jscomp$15$$.tagName && $a$jscomp$2_e$jscomp$15$$.href;
  })) {
    return {eventualUrl:$getEventualUrl$$module$ads$alp$handler$$($a$jscomp$2_e$jscomp$15$$), a:$a$jscomp$2_e$jscomp$15$$};
  }
}
function $getEventualUrl$$module$ads$alp$handler$$($a$jscomp$3$$) {
  var $urlParamName$$ = $a$jscomp$3$$.getAttribute("data-url-param-name") || "adurl", $eventualUrl$$ = $parseQueryString_$$module$src$url_parse_query_string$$($a$jscomp$3$$.search)[$urlParamName$$];
  if ($eventualUrl$$ && $isProxyOrigin$$module$src$url$$($eventualUrl$$) && $startsWith$$module$src$string$$($parseUrlDeprecated$$module$src$url$$($eventualUrl$$).pathname, "/c/")) {
    return $eventualUrl$$;
  }
}
function $warmupDynamic$$module$ads$alp$handler$$($e$jscomp$16$$) {
  var $link$jscomp$1$$ = $getLinkInfo$$module$ads$alp$handler$$($e$jscomp$16$$);
  if ($link$jscomp$1$$ && $link$jscomp$1$$.eventualUrl) {
    var $linkRel0$$ = document.createElement("link");
    $linkRel0$$.rel = "preload";
    $linkRel0$$.href = $link$jscomp$1$$.eventualUrl;
    var $linkRel1$$ = document.createElement("link");
    $linkRel1$$.rel = "preload";
    $linkRel1$$.as = "fetch";
    $linkRel1$$.href = $link$jscomp$1$$.eventualUrl;
    var $head$$ = $getHeadOrFallback$$module$ads$alp$handler$$($e$jscomp$16$$.target.ownerDocument);
    $head$$.appendChild($linkRel0$$);
    $head$$.appendChild($linkRel1$$);
  }
}
function $getHeadOrFallback$$module$ads$alp$handler$$($doc$jscomp$6$$) {
  return $doc$jscomp$6$$.head || $doc$jscomp$6$$.documentElement;
}
;function $includes$$module$src$polyfills$array_includes$$($value$jscomp$92$$, $i$jscomp$13_opt_fromIndex$jscomp$10$$) {
  var $fromIndex$$ = $i$jscomp$13_opt_fromIndex$jscomp$10$$ || 0, $len$$ = this.length;
  for ($i$jscomp$13_opt_fromIndex$jscomp$10$$ = 0 <= $fromIndex$$ ? $fromIndex$$ : Math.max($len$$ + $fromIndex$$, 0); $i$jscomp$13_opt_fromIndex$jscomp$10$$ < $len$$; $i$jscomp$13_opt_fromIndex$jscomp$10$$++) {
    var $other$jscomp$4$$ = this[$i$jscomp$13_opt_fromIndex$jscomp$10$$];
    if ($other$jscomp$4$$ === $value$jscomp$92$$ || $value$jscomp$92$$ !== $value$jscomp$92$$ && $other$jscomp$4$$ !== $other$jscomp$4$$) {
      return !0;
    }
  }
  return !1;
}
;var $VALID_NAME$$module$src$polyfills$custom_elements$$ = /^[a-z][a-z0-9._]*-[a-z0-9._-]*$/, $INVALID_NAMES$$module$src$polyfills$custom_elements$$ = "annotation-xml color-profile font-face font-face-src font-face-uri font-face-format font-face-name missing-glyph".split(" "), $TRACK_SUBTREE$$module$src$polyfills$custom_elements$$ = {childList:!0, subtree:!0};
function $assertValidName$$module$src$polyfills$custom_elements$$($SyntaxError$jscomp$1$$, $name$jscomp$68$$) {
  if (!$VALID_NAME$$module$src$polyfills$custom_elements$$.test($name$jscomp$68$$) || $INVALID_NAMES$$module$src$polyfills$custom_elements$$.includes($name$jscomp$68$$)) {
    throw new $SyntaxError$jscomp$1$$('invalid custom element name "' + $name$jscomp$68$$ + '"');
  }
}
function $rethrowAsync$$module$src$polyfills$custom_elements$$($error$jscomp$12$$) {
  new Promise(function() {
    throw $error$jscomp$12$$;
  });
}
function $CustomElementRegistry$$module$src$polyfills$custom_elements$$($win$jscomp$20$$, $registry$$) {
  this.$win_$ = $win$jscomp$20$$;
  this.$registry_$ = $registry$$;
  this.$pendingDefines_$ = $win$jscomp$20$$.Object.create(null);
}
$CustomElementRegistry$$module$src$polyfills$custom_elements$$.prototype.define = function($name$jscomp$69$$, $ctor$jscomp$1_deferred$jscomp$1$$, $options$jscomp$13$$) {
  this.$registry_$.define($name$jscomp$69$$, $ctor$jscomp$1_deferred$jscomp$1$$, $options$jscomp$13$$);
  var $pending$$ = this.$pendingDefines_$;
  if ($ctor$jscomp$1_deferred$jscomp$1$$ = $pending$$[$name$jscomp$69$$]) {
    $ctor$jscomp$1_deferred$jscomp$1$$.resolve(), delete $pending$$[$name$jscomp$69$$];
  }
};
$CustomElementRegistry$$module$src$polyfills$custom_elements$$.prototype.get = function($name$jscomp$70$$) {
  var $def$$ = this.$registry_$.getByName($name$jscomp$70$$);
  if ($def$$) {
    return $def$$.ctor;
  }
};
$CustomElementRegistry$$module$src$polyfills$custom_elements$$.prototype.whenDefined = function($name$jscomp$71$$) {
  var $$jscomp$destructuring$var7_pending$jscomp$1$$ = this.$win_$, $Promise$jscomp$1_promise$jscomp$1$$ = $$jscomp$destructuring$var7_pending$jscomp$1$$.Promise;
  $assertValidName$$module$src$polyfills$custom_elements$$($$jscomp$destructuring$var7_pending$jscomp$1$$.SyntaxError, $name$jscomp$71$$);
  if (this.$registry_$.getByName($name$jscomp$71$$)) {
    return $Promise$jscomp$1_promise$jscomp$1$$.resolve();
  }
  $$jscomp$destructuring$var7_pending$jscomp$1$$ = this.$pendingDefines_$;
  var $deferred$jscomp$2$$ = $$jscomp$destructuring$var7_pending$jscomp$1$$[$name$jscomp$71$$];
  if ($deferred$jscomp$2$$) {
    return $deferred$jscomp$2$$.promise;
  }
  var $resolve$jscomp$6$$;
  $Promise$jscomp$1_promise$jscomp$1$$ = new $Promise$jscomp$1_promise$jscomp$1$$(function($name$jscomp$71$$) {
    return $resolve$jscomp$6$$ = $name$jscomp$71$$;
  });
  $$jscomp$destructuring$var7_pending$jscomp$1$$[$name$jscomp$71$$] = {promise:$Promise$jscomp$1_promise$jscomp$1$$, resolve:$resolve$jscomp$6$$};
  return $Promise$jscomp$1_promise$jscomp$1$$;
};
$CustomElementRegistry$$module$src$polyfills$custom_elements$$.prototype.upgrade = function($root$jscomp$6$$) {
  this.$registry_$.upgrade($root$jscomp$6$$);
};
function $Registry$$module$src$polyfills$custom_elements$$($win$jscomp$21$$) {
  this.$win_$ = $win$jscomp$21$$;
  this.$doc_$ = $win$jscomp$21$$.document;
  this.$definitions_$ = $win$jscomp$21$$.Object.create(null);
  this.$query_$ = "";
  this.$mutationObserver_$ = this.$current_$ = null;
  this.$observed_$ = [$win$jscomp$21$$.document];
}
$JSCompiler_prototypeAlias$$ = $Registry$$module$src$polyfills$custom_elements$$.prototype;
$JSCompiler_prototypeAlias$$.current = function() {
  var $current$$ = this.$current_$;
  this.$current_$ = null;
  return $current$$;
};
$JSCompiler_prototypeAlias$$.getByName = function($name$jscomp$72$$) {
  var $definition$$ = this.$definitions_$[$name$jscomp$72$$];
  if ($definition$$) {
    return $definition$$;
  }
};
$JSCompiler_prototypeAlias$$.getByConstructor = function($ctor$jscomp$2$$) {
  var $definitions$$ = this.$definitions_$, $name$jscomp$73$$;
  for ($name$jscomp$73$$ in $definitions$$) {
    var $def$jscomp$1$$ = $definitions$$[$name$jscomp$73$$];
    if ($def$jscomp$1$$.ctor === $ctor$jscomp$2$$) {
      return $def$jscomp$1$$;
    }
  }
};
$JSCompiler_prototypeAlias$$.define = function($name$jscomp$74$$, $ctor$jscomp$3$$, $options$jscomp$14$$) {
  var $$jscomp$destructuring$var8_SyntaxError$jscomp$3$$ = this.$win_$, $Error$jscomp$1$$ = $$jscomp$destructuring$var8_SyntaxError$jscomp$3$$.Error;
  $$jscomp$destructuring$var8_SyntaxError$jscomp$3$$ = $$jscomp$destructuring$var8_SyntaxError$jscomp$3$$.SyntaxError;
  if ($options$jscomp$14$$) {
    throw new $Error$jscomp$1$$("Extending native custom elements is not supported");
  }
  $assertValidName$$module$src$polyfills$custom_elements$$($$jscomp$destructuring$var8_SyntaxError$jscomp$3$$, $name$jscomp$74$$);
  if (this.getByName($name$jscomp$74$$) || this.getByConstructor($ctor$jscomp$3$$)) {
    throw new $Error$jscomp$1$$('duplicate definition "' + $name$jscomp$74$$ + '"');
  }
  this.$definitions_$[$name$jscomp$74$$] = {name:$name$jscomp$74$$, ctor:$ctor$jscomp$3$$};
  $JSCompiler_StaticMethods_observe_$$(this, $name$jscomp$74$$);
  this.upgrade(this.$doc_$, $name$jscomp$74$$);
};
$JSCompiler_prototypeAlias$$.upgrade = function($i$jscomp$14_root$jscomp$7$$, $opt_query$$) {
  var $newlyDefined$$ = !!$opt_query$$, $upgradeCandidates$$ = $JSCompiler_StaticMethods_queryAll_$$($i$jscomp$14_root$jscomp$7$$, $opt_query$$ || this.$query_$);
  for ($i$jscomp$14_root$jscomp$7$$ = 0; $i$jscomp$14_root$jscomp$7$$ < $upgradeCandidates$$.length; $i$jscomp$14_root$jscomp$7$$++) {
    var $candidate$jscomp$1$$ = $upgradeCandidates$$[$i$jscomp$14_root$jscomp$7$$];
    $newlyDefined$$ ? $JSCompiler_StaticMethods_connectedCallback_$$(this, $candidate$jscomp$1$$) : this.upgradeSelf($candidate$jscomp$1$$);
  }
};
$JSCompiler_prototypeAlias$$.upgradeSelf = function($node$jscomp$5$$) {
  var $def$jscomp$2$$ = this.getByName($node$jscomp$5$$.localName);
  $def$jscomp$2$$ && $JSCompiler_StaticMethods_upgradeSelf_$$(this, $node$jscomp$5$$, $def$jscomp$2$$);
};
function $JSCompiler_StaticMethods_queryAll_$$($root$jscomp$8$$, $query$jscomp$10$$) {
  return $query$jscomp$10$$ && $root$jscomp$8$$.querySelectorAll ? $root$jscomp$8$$.querySelectorAll($query$jscomp$10$$) : [];
}
function $JSCompiler_StaticMethods_upgradeSelf_$$($JSCompiler_StaticMethods_upgradeSelf_$self$$, $node$jscomp$6$$, $ctor$jscomp$4_def$jscomp$3$$) {
  $ctor$jscomp$4_def$jscomp$3$$ = $ctor$jscomp$4_def$jscomp$3$$.ctor;
  if (!($node$jscomp$6$$ instanceof $ctor$jscomp$4_def$jscomp$3$$)) {
    $JSCompiler_StaticMethods_upgradeSelf_$self$$.$current_$ = $node$jscomp$6$$;
    try {
      if (new $ctor$jscomp$4_def$jscomp$3$$ !== $node$jscomp$6$$) {
        throw new $JSCompiler_StaticMethods_upgradeSelf_$self$$.$win_$.Error("Constructor illegally returned a different instance.");
      }
    } catch ($e$jscomp$17$$) {
      $rethrowAsync$$module$src$polyfills$custom_elements$$($e$jscomp$17$$);
    }
  }
}
function $JSCompiler_StaticMethods_connectedCallback_$$($JSCompiler_StaticMethods_connectedCallback_$self$$, $node$jscomp$7$$) {
  var $def$jscomp$4$$ = $JSCompiler_StaticMethods_connectedCallback_$self$$.getByName($node$jscomp$7$$.localName);
  if ($def$jscomp$4$$ && ($JSCompiler_StaticMethods_upgradeSelf_$$($JSCompiler_StaticMethods_connectedCallback_$self$$, $node$jscomp$7$$, $def$jscomp$4$$), $node$jscomp$7$$.connectedCallback)) {
    try {
      $node$jscomp$7$$.connectedCallback();
    } catch ($e$jscomp$18$$) {
      $rethrowAsync$$module$src$polyfills$custom_elements$$($e$jscomp$18$$);
    }
  }
}
function $JSCompiler_StaticMethods_observe_$$($JSCompiler_StaticMethods_observe_$self$$, $name$jscomp$75$$) {
  if ($JSCompiler_StaticMethods_observe_$self$$.$query_$) {
    $JSCompiler_StaticMethods_observe_$self$$.$query_$ += "," + $name$jscomp$75$$;
  } else {
    $JSCompiler_StaticMethods_observe_$self$$.$query_$ = $name$jscomp$75$$;
    var $mo$$ = new $JSCompiler_StaticMethods_observe_$self$$.$win_$.MutationObserver(function($name$jscomp$75$$) {
      $name$jscomp$75$$ && $JSCompiler_StaticMethods_handleRecords_$$($JSCompiler_StaticMethods_observe_$self$$, $name$jscomp$75$$);
    });
    $JSCompiler_StaticMethods_observe_$self$$.$mutationObserver_$ = $mo$$;
    $JSCompiler_StaticMethods_observe_$self$$.$observed_$.forEach(function($JSCompiler_StaticMethods_observe_$self$$) {
      $mo$$.observe($JSCompiler_StaticMethods_observe_$self$$, $TRACK_SUBTREE$$module$src$polyfills$custom_elements$$);
    });
    $JSCompiler_StaticMethods_observe_$self$$.$observed_$.length = 0;
    $installPatches$$module$src$polyfills$custom_elements$$($JSCompiler_StaticMethods_observe_$self$$.$win_$, $JSCompiler_StaticMethods_observe_$self$$);
  }
}
$JSCompiler_prototypeAlias$$.observe = function($tree$jscomp$1$$) {
  this.$mutationObserver_$ ? this.$mutationObserver_$.observe($tree$jscomp$1$$, $TRACK_SUBTREE$$module$src$polyfills$custom_elements$$) : this.$observed_$.push($tree$jscomp$1$$);
};
$JSCompiler_prototypeAlias$$.sync = function() {
  this.$mutationObserver_$ && $JSCompiler_StaticMethods_handleRecords_$$(this, this.$mutationObserver_$.takeRecords());
};
function $JSCompiler_StaticMethods_handleRecords_$$($JSCompiler_StaticMethods_handleRecords_$self$$, $records$jscomp$1$$) {
  for (var $i$jscomp$15$$ = 0; $i$jscomp$15$$ < $records$jscomp$1$$.length; $i$jscomp$15$$++) {
    var $record$$ = $records$jscomp$1$$[$i$jscomp$15$$];
    if ($record$$) {
      var $$jscomp$destructuring$var10_i$1_i$3$$ = $record$$, $addedNodes$$ = $$jscomp$destructuring$var10_i$1_i$3$$.addedNodes, $removedNodes$$ = $$jscomp$destructuring$var10_i$1_i$3$$.removedNodes;
      for ($$jscomp$destructuring$var10_i$1_i$3$$ = 0; $$jscomp$destructuring$var10_i$1_i$3$$ < $addedNodes$$.length; $$jscomp$destructuring$var10_i$1_i$3$$++) {
        var $i$2_i$5_node$4_node$jscomp$9$$ = $addedNodes$$[$$jscomp$destructuring$var10_i$1_i$3$$], $connectedCandidates$$ = $JSCompiler_StaticMethods_queryAll_$$($i$2_i$5_node$4_node$jscomp$9$$, $JSCompiler_StaticMethods_handleRecords_$self$$.$query_$);
        $JSCompiler_StaticMethods_connectedCallback_$$($JSCompiler_StaticMethods_handleRecords_$self$$, $i$2_i$5_node$4_node$jscomp$9$$);
        for ($i$2_i$5_node$4_node$jscomp$9$$ = 0; $i$2_i$5_node$4_node$jscomp$9$$ < $connectedCandidates$$.length; $i$2_i$5_node$4_node$jscomp$9$$++) {
          $JSCompiler_StaticMethods_connectedCallback_$$($JSCompiler_StaticMethods_handleRecords_$self$$, $connectedCandidates$$[$i$2_i$5_node$4_node$jscomp$9$$]);
        }
      }
      for ($$jscomp$destructuring$var10_i$1_i$3$$ = 0; $$jscomp$destructuring$var10_i$1_i$3$$ < $removedNodes$$.length; $$jscomp$destructuring$var10_i$1_i$3$$++) {
        $i$2_i$5_node$4_node$jscomp$9$$ = $removedNodes$$[$$jscomp$destructuring$var10_i$1_i$3$$];
        var $disconnectedCandidates$$ = $JSCompiler_StaticMethods_queryAll_$$($i$2_i$5_node$4_node$jscomp$9$$, $JSCompiler_StaticMethods_handleRecords_$self$$.$query_$);
        if ($i$2_i$5_node$4_node$jscomp$9$$.disconnectedCallback) {
          try {
            $i$2_i$5_node$4_node$jscomp$9$$.disconnectedCallback();
          } catch ($JSCompiler_e$jscomp$inline_108$$) {
            $rethrowAsync$$module$src$polyfills$custom_elements$$($JSCompiler_e$jscomp$inline_108$$);
          }
        }
        for ($i$2_i$5_node$4_node$jscomp$9$$ = 0; $i$2_i$5_node$4_node$jscomp$9$$ < $disconnectedCandidates$$.length; $i$2_i$5_node$4_node$jscomp$9$$++) {
          var $JSCompiler_node$jscomp$inline_111$$ = $disconnectedCandidates$$[$i$2_i$5_node$4_node$jscomp$9$$];
          if ($JSCompiler_node$jscomp$inline_111$$.disconnectedCallback) {
            try {
              $JSCompiler_node$jscomp$inline_111$$.disconnectedCallback();
            } catch ($JSCompiler_e$jscomp$inline_112$$) {
              $rethrowAsync$$module$src$polyfills$custom_elements$$($JSCompiler_e$jscomp$inline_112$$);
            }
          }
        }
      }
    }
  }
}
function $installPatches$$module$src$polyfills$custom_elements$$($$jscomp$destructuring$var12_$jscomp$destructuring$var13_win$jscomp$22$$, $registry$jscomp$1$$) {
  var $Object$jscomp$1$$ = $$jscomp$destructuring$var12_$jscomp$destructuring$var13_win$jscomp$22$$.Object, $docProto$$ = $$jscomp$destructuring$var12_$jscomp$destructuring$var13_win$jscomp$22$$.Document.prototype, $elProto$$ = $$jscomp$destructuring$var12_$jscomp$destructuring$var13_win$jscomp$22$$.Element.prototype, $nodeProto$$ = $$jscomp$destructuring$var12_$jscomp$destructuring$var13_win$jscomp$22$$.Node.prototype;
  $$jscomp$destructuring$var12_$jscomp$destructuring$var13_win$jscomp$22$$ = $docProto$$;
  var $createElement$$ = $$jscomp$destructuring$var12_$jscomp$destructuring$var13_win$jscomp$22$$.createElement, $importNode$$ = $$jscomp$destructuring$var12_$jscomp$destructuring$var13_win$jscomp$22$$.importNode;
  $$jscomp$destructuring$var12_$jscomp$destructuring$var13_win$jscomp$22$$ = $nodeProto$$;
  var $appendChild$$ = $$jscomp$destructuring$var12_$jscomp$destructuring$var13_win$jscomp$22$$.appendChild, $cloneNode$$ = $$jscomp$destructuring$var12_$jscomp$destructuring$var13_win$jscomp$22$$.cloneNode, $insertBefore$$ = $$jscomp$destructuring$var12_$jscomp$destructuring$var13_win$jscomp$22$$.insertBefore, $removeChild$$ = $$jscomp$destructuring$var12_$jscomp$destructuring$var13_win$jscomp$22$$.removeChild, $replaceChild$$ = $$jscomp$destructuring$var12_$jscomp$destructuring$var13_win$jscomp$22$$.replaceChild;
  $docProto$$.createElement = function($$jscomp$destructuring$var12_$jscomp$destructuring$var13_win$jscomp$22$$) {
    var $Object$jscomp$1$$ = $registry$jscomp$1$$.getByName($$jscomp$destructuring$var12_$jscomp$destructuring$var13_win$jscomp$22$$);
    return $Object$jscomp$1$$ ? new $Object$jscomp$1$$.ctor : $createElement$$.apply(this, arguments);
  };
  $docProto$$.importNode = function() {
    var $$jscomp$destructuring$var12_$jscomp$destructuring$var13_win$jscomp$22$$ = $importNode$$.apply(this, arguments);
    $$jscomp$destructuring$var12_$jscomp$destructuring$var13_win$jscomp$22$$ && ($registry$jscomp$1$$.upgradeSelf($$jscomp$destructuring$var12_$jscomp$destructuring$var13_win$jscomp$22$$), $registry$jscomp$1$$.upgrade($$jscomp$destructuring$var12_$jscomp$destructuring$var13_win$jscomp$22$$));
    return $$jscomp$destructuring$var12_$jscomp$destructuring$var13_win$jscomp$22$$;
  };
  $nodeProto$$.appendChild = function() {
    var $$jscomp$destructuring$var12_$jscomp$destructuring$var13_win$jscomp$22$$ = $appendChild$$.apply(this, arguments);
    $registry$jscomp$1$$.sync();
    return $$jscomp$destructuring$var12_$jscomp$destructuring$var13_win$jscomp$22$$;
  };
  $nodeProto$$.insertBefore = function() {
    var $$jscomp$destructuring$var12_$jscomp$destructuring$var13_win$jscomp$22$$ = $insertBefore$$.apply(this, arguments);
    $registry$jscomp$1$$.sync();
    return $$jscomp$destructuring$var12_$jscomp$destructuring$var13_win$jscomp$22$$;
  };
  $nodeProto$$.removeChild = function() {
    var $$jscomp$destructuring$var12_$jscomp$destructuring$var13_win$jscomp$22$$ = $removeChild$$.apply(this, arguments);
    $registry$jscomp$1$$.sync();
    return $$jscomp$destructuring$var12_$jscomp$destructuring$var13_win$jscomp$22$$;
  };
  $nodeProto$$.replaceChild = function() {
    var $$jscomp$destructuring$var12_$jscomp$destructuring$var13_win$jscomp$22$$ = $replaceChild$$.apply(this, arguments);
    $registry$jscomp$1$$.sync();
    return $$jscomp$destructuring$var12_$jscomp$destructuring$var13_win$jscomp$22$$;
  };
  $nodeProto$$.cloneNode = function() {
    var $$jscomp$destructuring$var12_$jscomp$destructuring$var13_win$jscomp$22$$ = $cloneNode$$.apply(this, arguments);
    $registry$jscomp$1$$.upgradeSelf($$jscomp$destructuring$var12_$jscomp$destructuring$var13_win$jscomp$22$$);
    $registry$jscomp$1$$.upgrade($$jscomp$destructuring$var12_$jscomp$destructuring$var13_win$jscomp$22$$);
    return $$jscomp$destructuring$var12_$jscomp$destructuring$var13_win$jscomp$22$$;
  };
  var $innerHTMLDesc$$ = $Object$jscomp$1$$.getOwnPropertyDescriptor($elProto$$, "innerHTML"), $innerHTMLSetter$$ = $innerHTMLDesc$$.set;
  $innerHTMLDesc$$.set = function($$jscomp$destructuring$var12_$jscomp$destructuring$var13_win$jscomp$22$$) {
    $innerHTMLSetter$$.call(this, $$jscomp$destructuring$var12_$jscomp$destructuring$var13_win$jscomp$22$$);
    $registry$jscomp$1$$.upgrade(this);
  };
  $Object$jscomp$1$$.defineProperty($elProto$$, "innerHTML", $innerHTMLDesc$$);
}
function $polyfill$$module$src$polyfills$custom_elements$$() {
  var $win$jscomp$23$$ = $JSCompiler_win$jscomp$inline_158$$;
  function $HTMLElementPolyfill$$() {
    var $win$jscomp$23$$ = this.constructor, $HTMLElementPolyfill$$ = $registry$jscomp$2$$.current();
    $HTMLElementPolyfill$$ || ($HTMLElementPolyfill$$ = $registry$jscomp$2$$.getByConstructor($win$jscomp$23$$), $HTMLElementPolyfill$$ = $createElement$jscomp$1$$.call($document$jscomp$1$$, $HTMLElementPolyfill$$.name));
    $Object$jscomp$2$$.setPrototypeOf($HTMLElementPolyfill$$, $win$jscomp$23$$.prototype);
    return $HTMLElementPolyfill$$;
  }
  var $Element$jscomp$2_elProto$jscomp$1$$ = $win$jscomp$23$$.Element, $HTMLElement$jscomp$1$$ = $win$jscomp$23$$.HTMLElement, $Object$jscomp$2$$ = $win$jscomp$23$$.Object, $document$jscomp$1$$ = $win$jscomp$23$$.document, $createElement$jscomp$1$$ = $document$jscomp$1$$.createElement, $registry$jscomp$2$$ = new $Registry$$module$src$polyfills$custom_elements$$($win$jscomp$23$$), $customElements$jscomp$2$$ = new $CustomElementRegistry$$module$src$polyfills$custom_elements$$($win$jscomp$23$$, $registry$jscomp$2$$);
  $Object$jscomp$2$$.defineProperty($win$jscomp$23$$, "customElements", {enumerable:!0, configurable:!0, value:$customElements$jscomp$2$$});
  $Element$jscomp$2_elProto$jscomp$1$$ = $Element$jscomp$2_elProto$jscomp$1$$.prototype;
  var $attachShadow$$ = $Element$jscomp$2_elProto$jscomp$1$$.attachShadow, $createShadowRoot$$ = $Element$jscomp$2_elProto$jscomp$1$$.createShadowRoot;
  $attachShadow$$ && ($Element$jscomp$2_elProto$jscomp$1$$.attachShadow = function($win$jscomp$23$$) {
    var $HTMLElementPolyfill$$ = $attachShadow$$.apply(this, arguments);
    $registry$jscomp$2$$.observe($HTMLElementPolyfill$$);
    return $HTMLElementPolyfill$$;
  }, $Element$jscomp$2_elProto$jscomp$1$$.attachShadow.toString = function() {
    return $attachShadow$$.toString();
  });
  $createShadowRoot$$ && ($Element$jscomp$2_elProto$jscomp$1$$.createShadowRoot = function() {
    var $win$jscomp$23$$ = $createShadowRoot$$.apply(this, arguments);
    $registry$jscomp$2$$.observe($win$jscomp$23$$);
    return $win$jscomp$23$$;
  }, $Element$jscomp$2_elProto$jscomp$1$$.createShadowRoot.toString = function() {
    return $createShadowRoot$$.toString();
  });
  $subClass$$module$src$polyfills$custom_elements$$($Object$jscomp$2$$, $HTMLElement$jscomp$1$$, $HTMLElementPolyfill$$);
  $win$jscomp$23$$.HTMLElement = $HTMLElementPolyfill$$;
}
function $subClass$$module$src$polyfills$custom_elements$$($Object$jscomp$4$$, $superClass$$, $subClass$$) {
  $subClass$$.prototype = $Object$jscomp$4$$.create($superClass$$.prototype, {constructor:{configurable:!0, writable:!0, value:$subClass$$}});
}
;function $domTokenListTogglePolyfill$$module$src$polyfills$domtokenlist_toggle$$($token$jscomp$2$$, $opt_force$jscomp$1$$) {
  var $remove$$ = void 0 === $opt_force$jscomp$1$$ ? this.contains($token$jscomp$2$$) : !$opt_force$jscomp$1$$;
  if ($remove$$) {
    return this.remove($token$jscomp$2$$), !1;
  }
  this.add($token$jscomp$2$$);
  return !0;
}
;function $documentContainsPolyfill$$module$src$polyfills$document_contains$$($node$jscomp$10$$) {
  return $node$jscomp$10$$ == this || this.documentElement.contains($node$jscomp$10$$);
}
;function $parseJson$$module$src$json$$($json$$) {
  return JSON.parse($json$$);
}
;function $utf8Encode$$module$src$utils$bytes$$($JSCompiler_str$jscomp$inline_114_JSCompiler_temp$jscomp$34_string$jscomp$7$$) {
  if ("undefined" !== typeof TextEncoder) {
    $JSCompiler_str$jscomp$inline_114_JSCompiler_temp$jscomp$34_string$jscomp$7$$ = (new TextEncoder("utf-8")).encode($JSCompiler_str$jscomp$inline_114_JSCompiler_temp$jscomp$34_string$jscomp$7$$);
  } else {
    $JSCompiler_str$jscomp$inline_114_JSCompiler_temp$jscomp$34_string$jscomp$7$$ = unescape(encodeURIComponent($JSCompiler_str$jscomp$inline_114_JSCompiler_temp$jscomp$34_string$jscomp$7$$));
    for (var $JSCompiler_bytes$jscomp$inline_115$$ = new Uint8Array($JSCompiler_str$jscomp$inline_114_JSCompiler_temp$jscomp$34_string$jscomp$7$$.length), $JSCompiler_i$jscomp$inline_116$$ = 0; $JSCompiler_i$jscomp$inline_116$$ < $JSCompiler_str$jscomp$inline_114_JSCompiler_temp$jscomp$34_string$jscomp$7$$.length; $JSCompiler_i$jscomp$inline_116$$++) {
      $JSCompiler_bytes$jscomp$inline_115$$[$JSCompiler_i$jscomp$inline_116$$] = $JSCompiler_str$jscomp$inline_114_JSCompiler_temp$jscomp$34_string$jscomp$7$$.charCodeAt($JSCompiler_i$jscomp$inline_116$$);
    }
    $JSCompiler_str$jscomp$inline_114_JSCompiler_temp$jscomp$34_string$jscomp$7$$ = $JSCompiler_bytes$jscomp$inline_115$$;
  }
  return $JSCompiler_str$jscomp$inline_114_JSCompiler_temp$jscomp$34_string$jscomp$7$$;
}
;var $allowedFetchTypes$$module$src$polyfills$fetch$$ = {document:1, text:2}, $allowedMethods$$module$src$polyfills$fetch$$ = ["GET", "POST"];
function $fetchPolyfill$$module$src$polyfills$fetch$$($input$jscomp$9$$, $init$jscomp$1$$) {
  $init$jscomp$1$$ = void 0 === $init$jscomp$1$$ ? {} : $init$jscomp$1$$;
  return new Promise(function($resolve$jscomp$7$$, $reject$jscomp$3$$) {
    var $requestMethod$$ = $normalizeMethod$$module$src$polyfills$fetch$$($init$jscomp$1$$.method || "GET"), $xhr$$ = $createXhrRequest$$module$src$polyfills$fetch$$($requestMethod$$, $input$jscomp$9$$);
    "include" == $init$jscomp$1$$.credentials && ($xhr$$.withCredentials = !0);
    $init$jscomp$1$$.responseType in $allowedFetchTypes$$module$src$polyfills$fetch$$ && ($xhr$$.responseType = $init$jscomp$1$$.responseType);
    $init$jscomp$1$$.headers && Object.keys($init$jscomp$1$$.headers).forEach(function($input$jscomp$9$$) {
      $xhr$$.setRequestHeader($input$jscomp$9$$, $init$jscomp$1$$.headers[$input$jscomp$9$$]);
    });
    $xhr$$.onreadystatechange = function() {
      2 > $xhr$$.readyState || (100 > $xhr$$.status || 599 < $xhr$$.status ? ($xhr$$.onreadystatechange = null, $reject$jscomp$3$$($user$$module$src$log$$().createExpectedError("Unknown HTTP status " + $xhr$$.status))) : 4 == $xhr$$.readyState && $resolve$jscomp$7$$(new $FetchResponse$$module$src$polyfills$fetch$$($xhr$$)));
    };
    $xhr$$.onerror = function() {
      $reject$jscomp$3$$($user$$module$src$log$$().createExpectedError("Network failure"));
    };
    $xhr$$.onabort = function() {
      $reject$jscomp$3$$($user$$module$src$log$$().createExpectedError("Request aborted"));
    };
    "POST" == $requestMethod$$ ? $xhr$$.send($init$jscomp$1$$.body) : $xhr$$.send();
  });
}
function $createXhrRequest$$module$src$polyfills$fetch$$($method$jscomp$1$$, $url$jscomp$42$$) {
  var $xhr$jscomp$1$$ = new XMLHttpRequest;
  if ("withCredentials" in $xhr$jscomp$1$$) {
    $xhr$jscomp$1$$.open($method$jscomp$1$$, $url$jscomp$42$$, !0);
  } else {
    throw $dev$$module$src$log$$().createExpectedError("CORS is not supported");
  }
  return $xhr$jscomp$1$$;
}
function $FetchResponse$$module$src$polyfills$fetch$$($xhr$jscomp$2$$) {
  this.$xhr_$ = $xhr$jscomp$2$$;
  this.status = this.$xhr_$.status;
  this.statusText = this.$xhr_$.statusText;
  this.ok = 200 <= this.status && 300 > this.status;
  this.headers = new $FetchResponseHeaders$$module$src$polyfills$fetch$$($xhr$jscomp$2$$);
  this.bodyUsed = !1;
  this.body = null;
}
$FetchResponse$$module$src$polyfills$fetch$$.prototype.clone = function() {
  return new $FetchResponse$$module$src$polyfills$fetch$$(this.$xhr_$);
};
function $JSCompiler_StaticMethods_drainText_$$($JSCompiler_StaticMethods_drainText_$self$$) {
  $JSCompiler_StaticMethods_drainText_$self$$.bodyUsed = !0;
  return Promise.resolve($JSCompiler_StaticMethods_drainText_$self$$.$xhr_$.responseText);
}
$FetchResponse$$module$src$polyfills$fetch$$.prototype.text = function() {
  return $JSCompiler_StaticMethods_drainText_$$(this);
};
$FetchResponse$$module$src$polyfills$fetch$$.prototype.json = function() {
  return $JSCompiler_StaticMethods_drainText_$$(this).then($parseJson$$module$src$json$$);
};
$FetchResponse$$module$src$polyfills$fetch$$.prototype.arrayBuffer = function() {
  return $JSCompiler_StaticMethods_drainText_$$(this).then($utf8Encode$$module$src$utils$bytes$$);
};
function $normalizeMethod$$module$src$polyfills$fetch$$($method$jscomp$2$$) {
  if (void 0 === $method$jscomp$2$$) {
    return "GET";
  }
  $method$jscomp$2$$ = $method$jscomp$2$$.toUpperCase();
  $allowedMethods$$module$src$polyfills$fetch$$.includes($method$jscomp$2$$);
  return $method$jscomp$2$$;
}
function $FetchResponseHeaders$$module$src$polyfills$fetch$$($xhr$jscomp$3$$) {
  this.$xhr_$ = $xhr$jscomp$3$$;
}
$FetchResponseHeaders$$module$src$polyfills$fetch$$.prototype.get = function($name$jscomp$77$$) {
  return this.$xhr_$.getResponseHeader($name$jscomp$77$$);
};
$FetchResponseHeaders$$module$src$polyfills$fetch$$.prototype.has = function($name$jscomp$78$$) {
  return null != this.$xhr_$.getResponseHeader($name$jscomp$78$$);
};
function $Response$$module$src$polyfills$fetch$$($body$jscomp$1_data$jscomp$33$$, $init$jscomp$2$$) {
  $init$jscomp$2$$ = void 0 === $init$jscomp$2$$ ? {} : $init$jscomp$2$$;
  var $lowercasedHeaders$$ = $map$$module$src$utils$object$$();
  $body$jscomp$1_data$jscomp$33$$ = Object.assign({status:200, statusText:"OK", responseText:$body$jscomp$1_data$jscomp$33$$ ? String($body$jscomp$1_data$jscomp$33$$) : "", getResponseHeader:function($body$jscomp$1_data$jscomp$33$$) {
    var $init$jscomp$2$$ = String($body$jscomp$1_data$jscomp$33$$).toLowerCase();
    return $hasOwn_$$module$src$utils$object$$.call($lowercasedHeaders$$, $init$jscomp$2$$) ? $lowercasedHeaders$$[$init$jscomp$2$$] : null;
  }}, $init$jscomp$2$$);
  $body$jscomp$1_data$jscomp$33$$.status = void 0 === $init$jscomp$2$$.status ? 200 : parseInt($init$jscomp$2$$.status, 10);
  if (Array.isArray($init$jscomp$2$$.headers)) {
    $init$jscomp$2$$.headers.forEach(function($body$jscomp$1_data$jscomp$33$$) {
      var $init$jscomp$2$$ = $body$jscomp$1_data$jscomp$33$$[1];
      $lowercasedHeaders$$[String($body$jscomp$1_data$jscomp$33$$[0]).toLowerCase()] = String($init$jscomp$2$$);
    });
  } else {
    if ("[object Object]" === $toString_$$module$src$types$$.call($init$jscomp$2$$.headers)) {
      for (var $key$jscomp$47$$ in $init$jscomp$2$$.headers) {
        $lowercasedHeaders$$[String($key$jscomp$47$$).toLowerCase()] = String($init$jscomp$2$$.headers[$key$jscomp$47$$]);
      }
    }
  }
  $init$jscomp$2$$.statusText && ($body$jscomp$1_data$jscomp$33$$.statusText = String($init$jscomp$2$$.statusText));
  $FetchResponse$$module$src$polyfills$fetch$$.call(this, $body$jscomp$1_data$jscomp$33$$);
}
var $JSCompiler_parentCtor$jscomp$inline_120$$ = $FetchResponse$$module$src$polyfills$fetch$$;
$Response$$module$src$polyfills$fetch$$.prototype = $$jscomp$objectCreate$$($JSCompiler_parentCtor$jscomp$inline_120$$.prototype);
$Response$$module$src$polyfills$fetch$$.prototype.constructor = $Response$$module$src$polyfills$fetch$$;
if ($$jscomp$setPrototypeOf$$) {
  $$jscomp$setPrototypeOf$$($Response$$module$src$polyfills$fetch$$, $JSCompiler_parentCtor$jscomp$inline_120$$);
} else {
  for (var $JSCompiler_p$jscomp$inline_121$$ in $JSCompiler_parentCtor$jscomp$inline_120$$) {
    if ("prototype" != $JSCompiler_p$jscomp$inline_121$$) {
      if (Object.defineProperties) {
        var $JSCompiler_descriptor$jscomp$inline_122$$ = Object.getOwnPropertyDescriptor($JSCompiler_parentCtor$jscomp$inline_120$$, $JSCompiler_p$jscomp$inline_121$$);
        $JSCompiler_descriptor$jscomp$inline_122$$ && Object.defineProperty($Response$$module$src$polyfills$fetch$$, $JSCompiler_p$jscomp$inline_121$$, $JSCompiler_descriptor$jscomp$inline_122$$);
      } else {
        $Response$$module$src$polyfills$fetch$$[$JSCompiler_p$jscomp$inline_121$$] = $JSCompiler_parentCtor$jscomp$inline_120$$[$JSCompiler_p$jscomp$inline_121$$];
      }
    }
  }
}
$Response$$module$src$polyfills$fetch$$.$superClass_$ = $JSCompiler_parentCtor$jscomp$inline_120$$.prototype;
function $sign$$module$src$polyfills$math_sign$$($x$jscomp$75$$) {
  return ($x$jscomp$75$$ = Number($x$jscomp$75$$)) ? 0 < $x$jscomp$75$$ ? 1 : -1 : $x$jscomp$75$$;
}
;var $hasOwnProperty$$module$src$polyfills$object_assign$$ = Object.prototype.hasOwnProperty;
function $assign$$module$src$polyfills$object_assign$$($target$jscomp$59$$, $var_args$jscomp$58$$) {
  if (null == $target$jscomp$59$$) {
    throw new TypeError("Cannot convert undefined or null to object");
  }
  for (var $output$jscomp$2$$ = Object($target$jscomp$59$$), $i$jscomp$20$$ = 1; $i$jscomp$20$$ < arguments.length; $i$jscomp$20$$++) {
    var $source$jscomp$13$$ = arguments[$i$jscomp$20$$];
    if (null != $source$jscomp$13$$) {
      for (var $key$jscomp$48$$ in $source$jscomp$13$$) {
        $hasOwnProperty$$module$src$polyfills$object_assign$$.call($source$jscomp$13$$, $key$jscomp$48$$) && ($output$jscomp$2$$[$key$jscomp$48$$] = $source$jscomp$13$$[$key$jscomp$48$$]);
      }
    }
  }
  return $output$jscomp$2$$;
}
;function $values$$module$src$polyfills$object_values$$($target$jscomp$60$$) {
  return Object.keys($target$jscomp$60$$).map(function($k$jscomp$4$$) {
    return $target$jscomp$60$$[$k$jscomp$4$$];
  });
}
;function $module$node_modules$promise_pjs$promise$default$$($resolver$jscomp$1$$) {
  if (!(this instanceof $module$node_modules$promise_pjs$promise$default$$)) {
    throw new TypeError("Constructor Promise requires `new`");
  }
  if (!$isFunction$$module$node_modules$promise_pjs$promise$$($resolver$jscomp$1$$)) {
    throw new TypeError("Must pass resolver function");
  }
  this._state = $PendingPromise$$module$node_modules$promise_pjs$promise$$;
  this._value = [];
  this._isChainEnd = !0;
  $doResolve$$module$node_modules$promise_pjs$promise$$(this, $adopter$$module$node_modules$promise_pjs$promise$$(this, $FulfilledPromise$$module$node_modules$promise_pjs$promise$$), $adopter$$module$node_modules$promise_pjs$promise$$(this, $RejectedPromise$$module$node_modules$promise_pjs$promise$$), {then:$resolver$jscomp$1$$});
}
$module$node_modules$promise_pjs$promise$default$$.prototype.then = function($onFulfilled$jscomp$1$$, $onRejected$jscomp$2$$) {
  $onFulfilled$jscomp$1$$ = $isFunction$$module$node_modules$promise_pjs$promise$$($onFulfilled$jscomp$1$$) ? $onFulfilled$jscomp$1$$ : void 0;
  $onRejected$jscomp$2$$ = $isFunction$$module$node_modules$promise_pjs$promise$$($onRejected$jscomp$2$$) ? $onRejected$jscomp$2$$ : void 0;
  if ($onFulfilled$jscomp$1$$ || $onRejected$jscomp$2$$) {
    this._isChainEnd = !1;
  }
  return this._state(this._value, $onFulfilled$jscomp$1$$, $onRejected$jscomp$2$$);
};
$module$node_modules$promise_pjs$promise$default$$.prototype.catch = function($onRejected$jscomp$3$$) {
  return this.then(void 0, $onRejected$jscomp$3$$);
};
function $module$node_modules$promise_pjs$promise$default$resolve$$($value$jscomp$94$$) {
  var $Constructor$$ = this;
  return $value$jscomp$94$$ === Object($value$jscomp$94$$) && $value$jscomp$94$$ instanceof this ? $value$jscomp$94$$ : new $Constructor$$(function($Constructor$$) {
    $Constructor$$($value$jscomp$94$$);
  });
}
function $module$node_modules$promise_pjs$promise$default$reject$$($reason$jscomp$6$$) {
  return new this(function($_$$, $reject$jscomp$4$$) {
    $reject$jscomp$4$$($reason$jscomp$6$$);
  });
}
function $module$node_modules$promise_pjs$promise$default$all$$($promises$jscomp$1$$) {
  var $Constructor$jscomp$2$$ = this;
  return new $Constructor$jscomp$2$$(function($resolve$jscomp$9$$, $reject$jscomp$5$$) {
    var $length$jscomp$19$$ = $promises$jscomp$1$$.length, $values$jscomp$6$$ = Array($length$jscomp$19$$);
    if (0 === $length$jscomp$19$$) {
      return $resolve$jscomp$9$$($values$jscomp$6$$);
    }
    $each$$module$node_modules$promise_pjs$promise$$($promises$jscomp$1$$, function($promises$jscomp$1$$, $index$jscomp$58$$) {
      $Constructor$jscomp$2$$.resolve($promises$jscomp$1$$).then(function($promises$jscomp$1$$) {
        $values$jscomp$6$$[$index$jscomp$58$$] = $promises$jscomp$1$$;
        0 === --$length$jscomp$19$$ && $resolve$jscomp$9$$($values$jscomp$6$$);
      }, $reject$jscomp$5$$);
    });
  });
}
function $module$node_modules$promise_pjs$promise$default$race$$($promises$jscomp$2$$) {
  var $Constructor$jscomp$3$$ = this;
  return new $Constructor$jscomp$3$$(function($resolve$jscomp$10$$, $reject$jscomp$6$$) {
    for (var $i$jscomp$21$$ = 0; $i$jscomp$21$$ < $promises$jscomp$2$$.length; $i$jscomp$21$$++) {
      $Constructor$jscomp$3$$.resolve($promises$jscomp$2$$[$i$jscomp$21$$]).then($resolve$jscomp$10$$, $reject$jscomp$6$$);
    }
  });
}
function $FulfilledPromise$$module$node_modules$promise_pjs$promise$$($value$jscomp$96$$, $JSCompiler_promise$jscomp$inline_127_onFulfilled$jscomp$2$$, $unused$jscomp$1$$, $deferred$jscomp$3$$) {
  if (!$JSCompiler_promise$jscomp$inline_127_onFulfilled$jscomp$2$$) {
    return $deferred$jscomp$3$$ && ($JSCompiler_promise$jscomp$inline_127_onFulfilled$jscomp$2$$ = $deferred$jscomp$3$$.promise, $JSCompiler_promise$jscomp$inline_127_onFulfilled$jscomp$2$$._state = $FulfilledPromise$$module$node_modules$promise_pjs$promise$$, $JSCompiler_promise$jscomp$inline_127_onFulfilled$jscomp$2$$._value = $value$jscomp$96$$), this;
  }
  $deferred$jscomp$3$$ || ($deferred$jscomp$3$$ = new $Deferred$$module$node_modules$promise_pjs$promise$$(this.constructor));
  $defer$$module$node_modules$promise_pjs$promise$$($tryCatchDeferred$$module$node_modules$promise_pjs$promise$$($deferred$jscomp$3$$, $JSCompiler_promise$jscomp$inline_127_onFulfilled$jscomp$2$$, $value$jscomp$96$$));
  return $deferred$jscomp$3$$.promise;
}
function $RejectedPromise$$module$node_modules$promise_pjs$promise$$($reason$jscomp$8$$, $JSCompiler_promise$jscomp$inline_132_unused$jscomp$2$$, $onRejected$jscomp$4$$, $deferred$jscomp$4$$) {
  if (!$onRejected$jscomp$4$$) {
    return $deferred$jscomp$4$$ && ($JSCompiler_promise$jscomp$inline_132_unused$jscomp$2$$ = $deferred$jscomp$4$$.promise, $JSCompiler_promise$jscomp$inline_132_unused$jscomp$2$$._state = $RejectedPromise$$module$node_modules$promise_pjs$promise$$, $JSCompiler_promise$jscomp$inline_132_unused$jscomp$2$$._value = $reason$jscomp$8$$), this;
  }
  $deferred$jscomp$4$$ || ($deferred$jscomp$4$$ = new $Deferred$$module$node_modules$promise_pjs$promise$$(this.constructor));
  $defer$$module$node_modules$promise_pjs$promise$$($tryCatchDeferred$$module$node_modules$promise_pjs$promise$$($deferred$jscomp$4$$, $onRejected$jscomp$4$$, $reason$jscomp$8$$));
  return $deferred$jscomp$4$$.promise;
}
function $PendingPromise$$module$node_modules$promise_pjs$promise$$($queue$jscomp$2$$, $onFulfilled$jscomp$3$$, $onRejected$jscomp$5$$, $deferred$jscomp$5$$) {
  if (!$deferred$jscomp$5$$) {
    if (!$onFulfilled$jscomp$3$$ && !$onRejected$jscomp$5$$) {
      return this;
    }
    $deferred$jscomp$5$$ = new $Deferred$$module$node_modules$promise_pjs$promise$$(this.constructor);
  }
  $queue$jscomp$2$$.push({deferred:$deferred$jscomp$5$$, onFulfilled:$onFulfilled$jscomp$3$$ || $deferred$jscomp$5$$.resolve, onRejected:$onRejected$jscomp$5$$ || $deferred$jscomp$5$$.reject});
  return $deferred$jscomp$5$$.promise;
}
function $Deferred$$module$node_modules$promise_pjs$promise$$($Promise$jscomp$2$$) {
  var $deferred$jscomp$6$$ = this;
  this.promise = new $Promise$jscomp$2$$(function($Promise$jscomp$2$$, $reject$jscomp$7$$) {
    $deferred$jscomp$6$$.resolve = $Promise$jscomp$2$$;
    $deferred$jscomp$6$$.reject = $reject$jscomp$7$$;
  });
  return $deferred$jscomp$6$$;
}
function $adopt$$module$node_modules$promise_pjs$promise$$($promise$jscomp$8$$, $state$$, $value$jscomp$97$$, $adoptee$$) {
  var $queue$jscomp$3$$ = $promise$jscomp$8$$._value;
  $promise$jscomp$8$$._state = $state$$;
  $promise$jscomp$8$$._value = $value$jscomp$97$$;
  $adoptee$$ && $state$$ === $PendingPromise$$module$node_modules$promise_pjs$promise$$ && $adoptee$$._state($value$jscomp$97$$, void 0, void 0, {promise:$promise$jscomp$8$$, resolve:void 0, reject:void 0});
  for (var $i$jscomp$22$$ = 0; $i$jscomp$22$$ < $queue$jscomp$3$$.length; $i$jscomp$22$$++) {
    var $next$$ = $queue$jscomp$3$$[$i$jscomp$22$$];
    $promise$jscomp$8$$._state($value$jscomp$97$$, $next$$.onFulfilled, $next$$.onRejected, $next$$.deferred);
  }
  $queue$jscomp$3$$.length = 0;
  $state$$ === $RejectedPromise$$module$node_modules$promise_pjs$promise$$ && $promise$jscomp$8$$._isChainEnd && setTimeout(function() {
    if ($promise$jscomp$8$$._isChainEnd) {
      throw $value$jscomp$97$$;
    }
  }, 0);
}
function $adopter$$module$node_modules$promise_pjs$promise$$($promise$jscomp$9$$, $state$jscomp$1$$) {
  return function($value$jscomp$98$$) {
    $adopt$$module$node_modules$promise_pjs$promise$$($promise$jscomp$9$$, $state$jscomp$1$$, $value$jscomp$98$$);
  };
}
function $noop$$module$node_modules$promise_pjs$promise$$() {
}
function $isFunction$$module$node_modules$promise_pjs$promise$$($fn$jscomp$3$$) {
  return "function" === typeof $fn$jscomp$3$$;
}
function $each$$module$node_modules$promise_pjs$promise$$($collection$$, $iterator$jscomp$6$$) {
  for (var $i$jscomp$23$$ = 0; $i$jscomp$23$$ < $collection$$.length; $i$jscomp$23$$++) {
    $iterator$jscomp$6$$($collection$$[$i$jscomp$23$$], $i$jscomp$23$$);
  }
}
function $tryCatchDeferred$$module$node_modules$promise_pjs$promise$$($deferred$jscomp$8$$, $fn$jscomp$4$$, $arg$jscomp$7$$) {
  var $promise$jscomp$11$$ = $deferred$jscomp$8$$.promise, $resolve$jscomp$12$$ = $deferred$jscomp$8$$.resolve, $reject$jscomp$8$$ = $deferred$jscomp$8$$.reject;
  return function() {
    try {
      var $deferred$jscomp$8$$ = $fn$jscomp$4$$($arg$jscomp$7$$);
      $doResolve$$module$node_modules$promise_pjs$promise$$($promise$jscomp$11$$, $resolve$jscomp$12$$, $reject$jscomp$8$$, $deferred$jscomp$8$$, $deferred$jscomp$8$$);
    } catch ($e$jscomp$22$$) {
      $reject$jscomp$8$$($e$jscomp$22$$);
    }
  };
}
var $defer$$module$node_modules$promise_pjs$promise$$ = function() {
  function $flush$$() {
    for (var $flush$$ = 0; $flush$$ < $length$jscomp$20$$; $flush$$++) {
      var $defer$$ = $queue$jscomp$4$$[$flush$$];
      $queue$jscomp$4$$[$flush$$] = null;
      $defer$$();
    }
    $length$jscomp$20$$ = 0;
  }
  function $defer$$($flush$$) {
    0 === $length$jscomp$20$$ && $scheduleFlush$$();
    $queue$jscomp$4$$[$length$jscomp$20$$++] = $flush$$;
  }
  if ("undefined" !== typeof window && window.postMessage) {
    window.addEventListener("message", $flush$$);
    var $scheduleFlush$$ = function() {
      window.postMessage("macro-task", "*");
    };
  } else {
    $scheduleFlush$$ = function() {
      setTimeout($flush$$, 0);
    };
  }
  var $queue$jscomp$4$$ = Array(16), $length$jscomp$20$$ = 0;
  return $defer$$;
}();
function $doResolve$$module$node_modules$promise_pjs$promise$$($promise$jscomp$12$$, $resolve$jscomp$13$$, $reject$jscomp$9$$, $value$jscomp$100$$, $context$$) {
  var $_reject$$ = $reject$jscomp$9$$, $then$$;
  try {
    if ($value$jscomp$100$$ === $promise$jscomp$12$$) {
      throw new TypeError("Cannot fulfill promise with itself");
    }
    var $isObj$$ = $value$jscomp$100$$ === Object($value$jscomp$100$$);
    if ($isObj$$ && $value$jscomp$100$$ instanceof $promise$jscomp$12$$.constructor) {
      $adopt$$module$node_modules$promise_pjs$promise$$($promise$jscomp$12$$, $value$jscomp$100$$._state, $value$jscomp$100$$._value, $value$jscomp$100$$);
    } else {
      if ($isObj$$ && ($then$$ = $value$jscomp$100$$.then) && $isFunction$$module$node_modules$promise_pjs$promise$$($then$$)) {
        var $_resolve$$ = function($value$jscomp$100$$) {
          $_resolve$$ = $_reject$$ = $noop$$module$node_modules$promise_pjs$promise$$;
          $doResolve$$module$node_modules$promise_pjs$promise$$($promise$jscomp$12$$, $resolve$jscomp$13$$, $reject$jscomp$9$$, $value$jscomp$100$$, $value$jscomp$100$$);
        };
        $_reject$$ = function($promise$jscomp$12$$) {
          $_resolve$$ = $_reject$$ = $noop$$module$node_modules$promise_pjs$promise$$;
          $reject$jscomp$9$$($promise$jscomp$12$$);
        };
        $then$$.call($context$$, function($promise$jscomp$12$$) {
          $_resolve$$($promise$jscomp$12$$);
        }, function($promise$jscomp$12$$) {
          $_reject$$($promise$jscomp$12$$);
        });
      } else {
        $resolve$jscomp$13$$($value$jscomp$100$$);
      }
    }
  } catch ($e$jscomp$23$$) {
    $_reject$$($e$jscomp$23$$);
  }
}
;/*
 Copyright (C) 2014-2016 by Andrea Giammarchi - @WebReflection

Use of this source code is governed by a MIT-style
license that can be found in the LICENSE file or at
https://opensource.org/licenses/MIT.

*/
function $installCustomElements$$module$node_modules$document_register_element$build$document_register_element_patched$$() {
  function $secondArgument$$($secondArgument$$) {
    return $secondArgument$$.toLowerCase();
  }
  var $window$jscomp$1$$ = self, $polyfill$$ = "auto";
  function $ASAP$$() {
    var $secondArgument$$ = $asapQueue$$.splice(0, $asapQueue$$.length);
    for ($asapTimer$$ = 0; $secondArgument$$.length;) {
      $secondArgument$$.shift().call(null, $secondArgument$$.shift());
    }
  }
  function $loopAndVerify$$($secondArgument$$, $window$jscomp$1$$) {
    for (var $polyfill$$ = 0, $ASAP$$ = $secondArgument$$.length; $polyfill$$ < $ASAP$$; $polyfill$$++) {
      $verifyAndSetupAndAction$$($secondArgument$$[$polyfill$$], $window$jscomp$1$$);
    }
  }
  function $loopAndSetup$$($secondArgument$$) {
    for (var $window$jscomp$1$$ = 0, $polyfill$$ = $secondArgument$$.length, $ASAP$$; $window$jscomp$1$$ < $polyfill$$; $window$jscomp$1$$++) {
      $ASAP$$ = $secondArgument$$[$window$jscomp$1$$], $patch$$($ASAP$$, $protos$$[$getTypeIndex$$($ASAP$$)]);
    }
  }
  function $executeAction$$($secondArgument$$) {
    return function($window$jscomp$1$$) {
      $isValidNode$$($window$jscomp$1$$) && ($verifyAndSetupAndAction$$($window$jscomp$1$$, $secondArgument$$), $query$jscomp$11$$.length && $loopAndVerify$$($window$jscomp$1$$.querySelectorAll($query$jscomp$11$$), $secondArgument$$));
    };
  }
  function $getTypeIndex$$($secondArgument$$) {
    var $window$jscomp$1$$ = $getAttribute$$.call($secondArgument$$, "is"), $polyfill$$ = $secondArgument$$.nodeName.toUpperCase();
    $secondArgument$$ = $indexOf$$.call($types$$, $window$jscomp$1$$ ? $PREFIX_IS$$ + $window$jscomp$1$$.toUpperCase() : $PREFIX_TAG$$ + $polyfill$$);
    return $window$jscomp$1$$ && -1 < $secondArgument$$ && !$isInQSA$$($polyfill$$, $window$jscomp$1$$) ? -1 : $secondArgument$$;
  }
  function $isInQSA$$($secondArgument$$, $window$jscomp$1$$) {
    return -1 < $query$jscomp$11$$.indexOf($secondArgument$$ + '[is="' + $window$jscomp$1$$ + '"]');
  }
  function $onDOMAttrModified$$($secondArgument$$) {
    var $window$jscomp$1$$ = $secondArgument$$.currentTarget, $polyfill$$ = $secondArgument$$.attrChange, $ASAP$$ = $secondArgument$$.attrName, $loopAndVerify$$ = $secondArgument$$.target, $loopAndSetup$$ = $secondArgument$$[$ADDITION$$] || 2, $executeAction$$ = $secondArgument$$[$REMOVAL$$] || 3;
    if ($notFromInnerHTMLHelper$$ && (!$loopAndVerify$$ || $loopAndVerify$$ === $window$jscomp$1$$) && $window$jscomp$1$$[$ATTRIBUTE_CHANGED_CALLBACK$$] && "style" !== $ASAP$$ && ($secondArgument$$.prevValue !== $secondArgument$$.newValue || "" === $secondArgument$$.newValue && ($polyfill$$ === $loopAndSetup$$ || $polyfill$$ === $executeAction$$))) {
      $window$jscomp$1$$[$ATTRIBUTE_CHANGED_CALLBACK$$]($ASAP$$, $polyfill$$ === $loopAndSetup$$ ? null : $secondArgument$$.prevValue, $polyfill$$ === $executeAction$$ ? null : $secondArgument$$.newValue);
    }
  }
  function $onDOMNode$$($secondArgument$$) {
    var $window$jscomp$1$$ = $executeAction$$($secondArgument$$);
    return function($secondArgument$$) {
      $asapQueue$$.push($window$jscomp$1$$, $secondArgument$$.target);
      $asapTimer$$ && clearTimeout($asapTimer$$);
      $asapTimer$$ = setTimeout($ASAP$$, 1);
    };
  }
  function $onReadyStateChange$$($secondArgument$$) {
    $dropDomContentLoaded$$ && ($dropDomContentLoaded$$ = !1, $secondArgument$$.currentTarget.removeEventListener($DOM_CONTENT_LOADED$$, $onReadyStateChange$$));
    $query$jscomp$11$$.length && $loopAndVerify$$(($secondArgument$$.target || $document$jscomp$2$$).querySelectorAll($query$jscomp$11$$), $secondArgument$$.detail === $DETACHED$$ ? $DETACHED$$ : $ATTACHED$$);
    $IE8$$ && $purge$$();
  }
  function $patchedSetAttribute$$($secondArgument$$, $window$jscomp$1$$) {
    $setAttribute$$.call(this, $secondArgument$$, $window$jscomp$1$$);
    $onSubtreeModified$$.call(this, {target:this});
  }
  function $setupNode$$($secondArgument$$, $window$jscomp$1$$) {
    $setPrototype$$($secondArgument$$, $window$jscomp$1$$);
    $observer$jscomp$1$$ ? $observer$jscomp$1$$.observe($secondArgument$$, $attributesObserver$$) : ($doesNotSupportDOMAttrModified$$ && ($secondArgument$$.setAttribute = $patchedSetAttribute$$, $secondArgument$$[$EXPANDO_UID$$] = $getAttributesMirror$$($secondArgument$$), $secondArgument$$[$ADD_EVENT_LISTENER$$]($DOM_SUBTREE_MODIFIED$$, $onSubtreeModified$$)), $secondArgument$$[$ADD_EVENT_LISTENER$$]($DOM_ATTR_MODIFIED$$, $onDOMAttrModified$$));
    $secondArgument$$[$CREATED_CALLBACK$$] && $notFromInnerHTMLHelper$$ && ($secondArgument$$.created = !0, $secondArgument$$[$CREATED_CALLBACK$$](), $secondArgument$$.created = !1);
  }
  function $purge$$() {
    for (var $secondArgument$$, $window$jscomp$1$$ = 0, $polyfill$$ = $targets$$.length; $window$jscomp$1$$ < $polyfill$$; $window$jscomp$1$$++) {
      $secondArgument$$ = $targets$$[$window$jscomp$1$$], $documentElement$$.contains($secondArgument$$) || ($polyfill$$--, $targets$$.splice($window$jscomp$1$$--, 1), $verifyAndSetupAndAction$$($secondArgument$$, $DETACHED$$));
    }
  }
  function $throwTypeError$$($secondArgument$$) {
    throw Error("A " + $secondArgument$$ + " type is already registered");
  }
  function $verifyAndSetupAndAction$$($secondArgument$$, $window$jscomp$1$$) {
    var $polyfill$$, $ASAP$$ = $getTypeIndex$$($secondArgument$$);
    -1 < $ASAP$$ && ($patchIfNotAlready$$($secondArgument$$, $protos$$[$ASAP$$]), $ASAP$$ = 0, $window$jscomp$1$$ !== $ATTACHED$$ || $secondArgument$$[$ATTACHED$$] ? $window$jscomp$1$$ !== $DETACHED$$ || $secondArgument$$[$DETACHED$$] || ($secondArgument$$[$ATTACHED$$] = !1, $secondArgument$$[$DETACHED$$] = !0, $ASAP$$ = 1) : ($secondArgument$$[$DETACHED$$] = !1, $secondArgument$$[$ATTACHED$$] = !0, $ASAP$$ = 1, $IE8$$ && 0 > $indexOf$$.call($targets$$, $secondArgument$$) && $targets$$.push($secondArgument$$)), 
    $ASAP$$ && ($polyfill$$ = $secondArgument$$[$window$jscomp$1$$ + $CALLBACK$$]) && $polyfill$$.call($secondArgument$$));
  }
  function $CustomElementRegistry$jscomp$1$$() {
  }
  function $CERDefine$$($window$jscomp$1$$, $polyfill$$, $ASAP$$) {
    $ASAP$$ = $ASAP$$ && $ASAP$$[$EXTENDS$$] || "";
    var $loopAndVerify$$ = $polyfill$$.prototype, $loopAndSetup$$ = $create$$($loopAndVerify$$), $executeAction$$ = $polyfill$$.observedAttributes || $empty$$, $Class$$ = {prototype:$loopAndSetup$$};
    $safeProperty$$($loopAndSetup$$, $CREATED_CALLBACK$$, {value:function() {
      if ($justCreated$$) {
        $justCreated$$ = !1;
      } else {
        if (!this[$DRECEV1$$]) {
          this[$DRECEV1$$] = !0;
          new $polyfill$$(this);
          $loopAndVerify$$[$CREATED_CALLBACK$$] && $loopAndVerify$$[$CREATED_CALLBACK$$].call(this);
          var $secondArgument$$ = $constructors$$[$nodeNames$$.get($polyfill$$)];
          (!$usableCustomElements$$ || 1 < $secondArgument$$.create.length) && $notifyAttributes$$(this);
        }
      }
    }});
    $safeProperty$$($loopAndSetup$$, $ATTRIBUTE_CHANGED_CALLBACK$$, {value:function($secondArgument$$) {
      -1 < $indexOf$$.call($executeAction$$, $secondArgument$$) && $loopAndVerify$$[$ATTRIBUTE_CHANGED_CALLBACK$$].apply(this, arguments);
    }});
    $loopAndVerify$$[$CONNECTED_CALLBACK$$] && $safeProperty$$($loopAndSetup$$, $ATTACHED_CALLBACK$$, {value:$loopAndVerify$$[$CONNECTED_CALLBACK$$]});
    $loopAndVerify$$[$DISCONNECTED_CALLBACK$$] && $safeProperty$$($loopAndSetup$$, $DETACHED_CALLBACK$$, {value:$loopAndVerify$$[$DISCONNECTED_CALLBACK$$]});
    $ASAP$$ && ($Class$$[$EXTENDS$$] = $ASAP$$);
    $window$jscomp$1$$ = $window$jscomp$1$$.toUpperCase();
    $constructors$$[$window$jscomp$1$$] = {constructor:$polyfill$$, create:$ASAP$$ ? [$ASAP$$, $secondArgument$$($window$jscomp$1$$)] : [$window$jscomp$1$$]};
    $nodeNames$$.set($polyfill$$, $window$jscomp$1$$);
    $document$jscomp$2$$[$REGISTER_ELEMENT$$]($window$jscomp$1$$.toLowerCase(), $Class$$);
    $whenDefined$$($window$jscomp$1$$);
    $waitingList$$[$window$jscomp$1$$].r();
  }
  function $get$$($secondArgument$$) {
    return ($secondArgument$$ = $constructors$$[$secondArgument$$.toUpperCase()]) && $secondArgument$$.constructor;
  }
  function $getIs$$($secondArgument$$) {
    return "string" === typeof $secondArgument$$ ? $secondArgument$$ : $secondArgument$$ && $secondArgument$$.is || "";
  }
  function $notifyAttributes$$($secondArgument$$) {
    for (var $window$jscomp$1$$ = $secondArgument$$[$ATTRIBUTE_CHANGED_CALLBACK$$], $polyfill$$ = $window$jscomp$1$$ ? $secondArgument$$.attributes : $empty$$, $ASAP$$ = $polyfill$$.length, $loopAndVerify$$; $ASAP$$--;) {
      $loopAndVerify$$ = $polyfill$$[$ASAP$$], $window$jscomp$1$$.call($secondArgument$$, $loopAndVerify$$.name || $loopAndVerify$$.nodeName, null, $loopAndVerify$$.value || $loopAndVerify$$.nodeValue);
    }
  }
  function $whenDefined$$($secondArgument$$) {
    $secondArgument$$ = $secondArgument$$.toUpperCase();
    $secondArgument$$ in $waitingList$$ || ($waitingList$$[$secondArgument$$] = {}, $waitingList$$[$secondArgument$$].p = new $Promise$jscomp$3$$(function($window$jscomp$1$$) {
      $waitingList$$[$secondArgument$$].r = $window$jscomp$1$$;
    }));
    return $waitingList$$[$secondArgument$$].p;
  }
  function $polyfillV1$$() {
    function $polyfill$$($secondArgument$$) {
      var $polyfill$$ = $window$jscomp$1$$[$secondArgument$$];
      if ($polyfill$$) {
        $window$jscomp$1$$[$secondArgument$$] = function($secondArgument$$) {
          var $window$jscomp$1$$;
          $secondArgument$$ || ($secondArgument$$ = this);
          $secondArgument$$[$DRECEV1$$] || ($justCreated$$ = !0, $secondArgument$$ = $constructors$$[$nodeNames$$.get($secondArgument$$.constructor)], $secondArgument$$ = ($window$jscomp$1$$ = $usableCustomElements$$ && 1 === $secondArgument$$.create.length) ? Reflect.construct($polyfill$$, $empty$$, $secondArgument$$.constructor) : $document$jscomp$2$$.createElement.apply($document$jscomp$2$$, $secondArgument$$.create), $secondArgument$$[$DRECEV1$$] = !0, $justCreated$$ = !1, $window$jscomp$1$$ || 
          $notifyAttributes$$($secondArgument$$));
          return $secondArgument$$;
        };
        $window$jscomp$1$$[$secondArgument$$].prototype = $polyfill$$.prototype;
        try {
          $polyfill$$.prototype.constructor = $window$jscomp$1$$[$secondArgument$$];
        } catch ($WebKit$$) {
          $defineProperty$$($polyfill$$, $DRECEV1$$, {value:$window$jscomp$1$$[$secondArgument$$]});
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
    $V0$$ || ($justSetup$$ = !0, $document$jscomp$2$$[$REGISTER_ELEMENT$$](""));
  }
  var $document$jscomp$2$$ = $window$jscomp$1$$.document, $Object$jscomp$5$$ = $window$jscomp$1$$.Object, $htmlClass$$ = function($secondArgument$$) {
    function $window$jscomp$1$$($secondArgument$$, $window$jscomp$1$$) {
      $window$jscomp$1$$ = $window$jscomp$1$$.toLowerCase();
      $window$jscomp$1$$ in $loopAndVerify$$ || ($loopAndVerify$$[$secondArgument$$] = ($loopAndVerify$$[$secondArgument$$] || []).concat($window$jscomp$1$$), $loopAndVerify$$[$window$jscomp$1$$] = $loopAndVerify$$[$window$jscomp$1$$.toUpperCase()] = $secondArgument$$);
    }
    function $polyfill$$($secondArgument$$) {
      var $window$jscomp$1$$ = [], $polyfill$$;
      for ($polyfill$$ in $loopAndVerify$$) {
        $secondArgument$$.test($polyfill$$) && $window$jscomp$1$$.push($polyfill$$);
      }
      return $window$jscomp$1$$;
    }
    var $ASAP$$ = /^[A-Z]+[a-z]/, $loopAndVerify$$ = ($Object$jscomp$5$$.create || $Object$jscomp$5$$)(null), $loopAndSetup$$ = {}, $executeAction$$, $getTypeIndex$$, $isInQSA$$;
    for ($getTypeIndex$$ in $secondArgument$$) {
      for ($isInQSA$$ in $secondArgument$$[$getTypeIndex$$]) {
        var $onDOMNode$$ = $secondArgument$$[$getTypeIndex$$][$isInQSA$$];
        $loopAndVerify$$[$isInQSA$$] = $onDOMNode$$;
        for ($executeAction$$ = 0; $executeAction$$ < $onDOMNode$$.length; $executeAction$$++) {
          $loopAndVerify$$[$onDOMNode$$[$executeAction$$].toLowerCase()] = $loopAndVerify$$[$onDOMNode$$[$executeAction$$].toUpperCase()] = $isInQSA$$;
        }
      }
    }
    $loopAndSetup$$.get = function($secondArgument$$) {
      return "string" === typeof $secondArgument$$ ? $loopAndVerify$$[$secondArgument$$] || ($ASAP$$.test($secondArgument$$) ? [] : "") : $polyfill$$($secondArgument$$);
    };
    $loopAndSetup$$.set = function($secondArgument$$, $polyfill$$) {
      return $ASAP$$.test($secondArgument$$) ? $window$jscomp$1$$($secondArgument$$, $polyfill$$) : $window$jscomp$1$$($polyfill$$, $secondArgument$$), $loopAndSetup$$;
    };
    return $loopAndSetup$$;
  }({collections:{HTMLAllCollection:["all"], HTMLCollection:["forms"], HTMLFormControlsCollection:["elements"], HTMLOptionsCollection:["options"]}, elements:{Element:["element"], HTMLAnchorElement:["a"], HTMLAppletElement:["applet"], HTMLAreaElement:["area"], HTMLAttachmentElement:["attachment"], HTMLAudioElement:["audio"], HTMLBRElement:["br"], HTMLBaseElement:["base"], HTMLBodyElement:["body"], HTMLButtonElement:["button"], HTMLCanvasElement:["canvas"], HTMLContentElement:["content"], HTMLDListElement:["dl"], 
  HTMLDataElement:["data"], HTMLDataListElement:["datalist"], HTMLDetailsElement:["details"], HTMLDialogElement:["dialog"], HTMLDirectoryElement:["dir"], HTMLDivElement:["div"], HTMLDocument:["document"], HTMLElement:"element abbr address article aside b bdi bdo cite code command dd dfn dt em figcaption figure footer header i kbd mark nav noscript rp rt ruby s samp section small strong sub summary sup u var wbr".split(" "), HTMLEmbedElement:["embed"], HTMLFieldSetElement:["fieldset"], HTMLFontElement:["font"], 
  HTMLFormElement:["form"], HTMLFrameElement:["frame"], HTMLFrameSetElement:["frameset"], HTMLHRElement:["hr"], HTMLHeadElement:["head"], HTMLHeadingElement:"h1 h2 h3 h4 h5 h6".split(" "), HTMLHtmlElement:["html"], HTMLIFrameElement:["iframe"], HTMLImageElement:["img"], HTMLInputElement:["input"], HTMLKeygenElement:["keygen"], HTMLLIElement:["li"], HTMLLabelElement:["label"], HTMLLegendElement:["legend"], HTMLLinkElement:["link"], HTMLMapElement:["map"], HTMLMarqueeElement:["marquee"], HTMLMediaElement:["media"], 
  HTMLMenuElement:["menu"], HTMLMenuItemElement:["menuitem"], HTMLMetaElement:["meta"], HTMLMeterElement:["meter"], HTMLModElement:["del", "ins"], HTMLOListElement:["ol"], HTMLObjectElement:["object"], HTMLOptGroupElement:["optgroup"], HTMLOptionElement:["option"], HTMLOutputElement:["output"], HTMLParagraphElement:["p"], HTMLParamElement:["param"], HTMLPictureElement:["picture"], HTMLPreElement:["pre"], HTMLProgressElement:["progress"], HTMLQuoteElement:["blockquote", "q", "quote"], HTMLScriptElement:["script"], 
  HTMLSelectElement:["select"], HTMLShadowElement:["shadow"], HTMLSlotElement:["slot"], HTMLSourceElement:["source"], HTMLSpanElement:["span"], HTMLStyleElement:["style"], HTMLTableCaptionElement:["caption"], HTMLTableCellElement:["td", "th"], HTMLTableColElement:["col", "colgroup"], HTMLTableElement:["table"], HTMLTableRowElement:["tr"], HTMLTableSectionElement:["thead", "tbody", "tfoot"], HTMLTemplateElement:["template"], HTMLTextAreaElement:["textarea"], HTMLTimeElement:["time"], HTMLTitleElement:["title"], 
  HTMLTrackElement:["track"], HTMLUListElement:["ul"], HTMLUnknownElement:["unknown", "vhgroupv", "vkeygen"], HTMLVideoElement:["video"]}, nodes:{Attr:["node"], Audio:["audio"], CDATASection:["node"], CharacterData:["node"], Comment:["#comment"], Document:["#document"], DocumentFragment:["#document-fragment"], DocumentType:["node"], HTMLDocument:["#document"], Image:["img"], Option:["option"], ProcessingInstruction:["node"], ShadowRoot:["#shadow-root"], Text:["#text"], XMLDocument:["xml"]}});
  $polyfill$$ || ($polyfill$$ = "auto");
  var $REGISTER_ELEMENT$$ = "registerElement", $EXPANDO_UID$$ = "__" + $REGISTER_ELEMENT$$ + (10e4 * $window$jscomp$1$$.Math.random() >> 0), $ADD_EVENT_LISTENER$$ = "addEventListener", $ATTACHED$$ = "attached", $CALLBACK$$ = "Callback", $DETACHED$$ = "detached", $EXTENDS$$ = "extends", $ATTRIBUTE_CHANGED_CALLBACK$$ = "attributeChanged" + $CALLBACK$$, $ATTACHED_CALLBACK$$ = $ATTACHED$$ + $CALLBACK$$, $CONNECTED_CALLBACK$$ = "connected" + $CALLBACK$$, $DISCONNECTED_CALLBACK$$ = "disconnected" + $CALLBACK$$, 
  $CREATED_CALLBACK$$ = "created" + $CALLBACK$$, $DETACHED_CALLBACK$$ = $DETACHED$$ + $CALLBACK$$, $ADDITION$$ = "ADDITION", $MODIFICATION$$ = "MODIFICATION", $REMOVAL$$ = "REMOVAL", $DOM_ATTR_MODIFIED$$ = "DOMAttrModified", $DOM_CONTENT_LOADED$$ = "DOMContentLoaded", $DOM_SUBTREE_MODIFIED$$ = "DOMSubtreeModified", $PREFIX_TAG$$ = "<", $PREFIX_IS$$ = "=", $validName$$ = /^[A-Z][A-Z0-9]*(?:-[A-Z0-9]+)+$/, $invalidNames$$ = "ANNOTATION-XML COLOR-PROFILE FONT-FACE FONT-FACE-SRC FONT-FACE-URI FONT-FACE-FORMAT FONT-FACE-NAME MISSING-GLYPH".split(" "), 
  $types$$ = [], $protos$$ = [], $query$jscomp$11$$ = "", $documentElement$$ = $document$jscomp$2$$.documentElement, $indexOf$$ = $types$$.indexOf || function($secondArgument$$) {
    for (var $window$jscomp$1$$ = this.length; $window$jscomp$1$$-- && this[$window$jscomp$1$$] !== $secondArgument$$;) {
    }
    return $window$jscomp$1$$;
  }, $OP$$ = $Object$jscomp$5$$.prototype, $hOP$$ = $OP$$.hasOwnProperty, $iPO$$ = $OP$$.isPrototypeOf, $defineProperty$$ = $Object$jscomp$5$$.defineProperty, $empty$$ = [], $gOPD$$ = $Object$jscomp$5$$.getOwnPropertyDescriptor, $gOPN$$ = $Object$jscomp$5$$.getOwnPropertyNames, $gPO$$ = $Object$jscomp$5$$.getPrototypeOf, $sPO$$ = $Object$jscomp$5$$.setPrototypeOf, $hasProto$$ = !!$Object$jscomp$5$$.__proto__, $DRECEV1$$ = "__dreCEv1", $customElements$jscomp$3$$ = $window$jscomp$1$$.customElements, 
  $usableCustomElements$$ = "force" !== $polyfill$$ && !!($customElements$jscomp$3$$ && $customElements$jscomp$3$$.define && $customElements$jscomp$3$$.get && $customElements$jscomp$3$$.whenDefined), $Dict$$ = $Object$jscomp$5$$.create || $Object$jscomp$5$$, $Map$jscomp$1$$ = $window$jscomp$1$$.Map || function() {
    var $secondArgument$$ = [], $window$jscomp$1$$ = [], $polyfill$$;
    return {get:function($polyfill$$) {
      return $window$jscomp$1$$[$indexOf$$.call($secondArgument$$, $polyfill$$)];
    }, set:function($ASAP$$, $loopAndVerify$$) {
      $polyfill$$ = $indexOf$$.call($secondArgument$$, $ASAP$$);
      0 > $polyfill$$ ? $window$jscomp$1$$[$secondArgument$$.push($ASAP$$) - 1] = $loopAndVerify$$ : $window$jscomp$1$$[$polyfill$$] = $loopAndVerify$$;
    }};
  }, $Promise$jscomp$3$$ = $window$jscomp$1$$.Promise || function($secondArgument$$) {
    function $window$jscomp$1$$($secondArgument$$) {
      for ($ASAP$$ = !0; $polyfill$$.length;) {
        $polyfill$$.shift()($secondArgument$$);
      }
    }
    var $polyfill$$ = [], $ASAP$$ = !1, $loopAndVerify$$ = {"catch":function() {
      return $loopAndVerify$$;
    }, then:function($secondArgument$$) {
      $polyfill$$.push($secondArgument$$);
      $ASAP$$ && setTimeout($window$jscomp$1$$, 1);
      return $loopAndVerify$$;
    }};
    $secondArgument$$($window$jscomp$1$$);
    return $loopAndVerify$$;
  }, $justCreated$$ = !1, $constructors$$ = $Dict$$(null), $waitingList$$ = $Dict$$(null), $nodeNames$$ = new $Map$jscomp$1$$, $create$$ = $Object$jscomp$5$$.create || function $Bridge$$($secondArgument$$) {
    return $secondArgument$$ ? ($Bridge$$.prototype = $secondArgument$$, new $Bridge$$) : this;
  }, $setPrototype$$ = $sPO$$ || ($hasProto$$ ? function($secondArgument$$, $window$jscomp$1$$) {
    $secondArgument$$.__proto__ = $window$jscomp$1$$;
    return $secondArgument$$;
  } : $gOPN$$ && $gOPD$$ ? function() {
    function $secondArgument$$($secondArgument$$, $window$jscomp$1$$) {
      for (var $polyfill$$, $ASAP$$ = $gOPN$$($window$jscomp$1$$), $loopAndVerify$$ = 0, $loopAndSetup$$ = $ASAP$$.length; $loopAndVerify$$ < $loopAndSetup$$; $loopAndVerify$$++) {
        $polyfill$$ = $ASAP$$[$loopAndVerify$$], $hOP$$.call($secondArgument$$, $polyfill$$) || $defineProperty$$($secondArgument$$, $polyfill$$, $gOPD$$($window$jscomp$1$$, $polyfill$$));
      }
    }
    return function($window$jscomp$1$$, $polyfill$$) {
      do {
        $secondArgument$$($window$jscomp$1$$, $polyfill$$);
      } while (($polyfill$$ = $gPO$$($polyfill$$)) && !$iPO$$.call($polyfill$$, $window$jscomp$1$$));
      return $window$jscomp$1$$;
    };
  }() : function($secondArgument$$, $window$jscomp$1$$) {
    for (var $polyfill$$ in $window$jscomp$1$$) {
      $secondArgument$$[$polyfill$$] = $window$jscomp$1$$[$polyfill$$];
    }
    return $secondArgument$$;
  }), $MutationObserver$jscomp$1$$ = $window$jscomp$1$$.MutationObserver || $window$jscomp$1$$.WebKitMutationObserver, $HTMLElementPrototype$$ = ($window$jscomp$1$$.HTMLElement || $window$jscomp$1$$.Element || $window$jscomp$1$$.Node).prototype, $IE8$$ = !$iPO$$.call($HTMLElementPrototype$$, $documentElement$$), $safeProperty$$ = $IE8$$ ? function($secondArgument$$, $window$jscomp$1$$, $polyfill$$) {
    $secondArgument$$[$window$jscomp$1$$] = $polyfill$$.value;
    return $secondArgument$$;
  } : $defineProperty$$, $isValidNode$$ = $IE8$$ ? function($secondArgument$$) {
    return 1 === $secondArgument$$.nodeType;
  } : function($secondArgument$$) {
    return $iPO$$.call($HTMLElementPrototype$$, $secondArgument$$);
  }, $targets$$ = $IE8$$ && [], $attachShadow$jscomp$1$$ = $HTMLElementPrototype$$.attachShadow, $cloneNode$jscomp$1$$ = $HTMLElementPrototype$$.cloneNode, $dispatchEvent$$ = $HTMLElementPrototype$$.dispatchEvent, $getAttribute$$ = $HTMLElementPrototype$$.getAttribute, $hasAttribute$$ = $HTMLElementPrototype$$.hasAttribute, $removeAttribute$$ = $HTMLElementPrototype$$.removeAttribute, $setAttribute$$ = $HTMLElementPrototype$$.setAttribute, $createElement$jscomp$2$$ = $document$jscomp$2$$.createElement, 
  $patchedCreateElement$$ = $createElement$jscomp$2$$, $attributesObserver$$ = $MutationObserver$jscomp$1$$ && {attributes:!0, characterData:!0, attributeOldValue:!0}, $DOMAttrModified$$ = $MutationObserver$jscomp$1$$ || function() {
    $doesNotSupportDOMAttrModified$$ = !1;
    $documentElement$$.removeEventListener($DOM_ATTR_MODIFIED$$, $DOMAttrModified$$);
  }, $asapQueue$$, $asapTimer$$ = 0, $V0$$ = $REGISTER_ELEMENT$$ in $document$jscomp$2$$, $setListener$$ = !0, $justSetup$$ = !1, $doesNotSupportDOMAttrModified$$ = !0, $dropDomContentLoaded$$ = !0, $notFromInnerHTMLHelper$$ = !0, $observer$jscomp$1$$, $observe$$;
  if (!$V0$$) {
    if ($sPO$$ || $hasProto$$) {
      var $patchIfNotAlready$$ = function($secondArgument$$, $window$jscomp$1$$) {
        $iPO$$.call($window$jscomp$1$$, $secondArgument$$) || $setupNode$$($secondArgument$$, $window$jscomp$1$$);
      };
      var $patch$$ = $setupNode$$;
    } else {
      $patch$$ = $patchIfNotAlready$$ = function($secondArgument$$, $window$jscomp$1$$) {
        $secondArgument$$[$EXPANDO_UID$$] || ($secondArgument$$[$EXPANDO_UID$$] = $Object$jscomp$5$$(!0), $setupNode$$($secondArgument$$, $window$jscomp$1$$));
      };
    }
    if ($IE8$$) {
      $doesNotSupportDOMAttrModified$$ = !1, function() {
        function $secondArgument$$($secondArgument$$) {
          var $window$jscomp$1$$ = $secondArgument$$.currentTarget, $polyfill$$ = $window$jscomp$1$$[$EXPANDO_UID$$];
          $secondArgument$$ = $secondArgument$$.propertyName;
          if ($polyfill$$.hasOwnProperty($secondArgument$$)) {
            $polyfill$$ = $polyfill$$[$secondArgument$$];
            var $ASAP$$ = new CustomEvent($DOM_ATTR_MODIFIED$$, {bubbles:!0});
            $ASAP$$.attrName = $polyfill$$.name;
            $ASAP$$.prevValue = $polyfill$$.value || null;
            $ASAP$$.newValue = $polyfill$$.value = $window$jscomp$1$$[$secondArgument$$] || null;
            null == $ASAP$$.prevValue ? $ASAP$$[$ADDITION$$] = $ASAP$$.attrChange = 0 : $ASAP$$[$MODIFICATION$$] = $ASAP$$.attrChange = 1;
            $dispatchEvent$$.call($window$jscomp$1$$, $ASAP$$);
          }
        }
        function $window$jscomp$1$$($secondArgument$$, $window$jscomp$1$$) {
          var $polyfill$$ = $hasAttribute$$.call(this, $secondArgument$$), $ASAP$$ = $polyfill$$ && $getAttribute$$.call(this, $secondArgument$$), $loopAndVerify$$ = new CustomEvent($DOM_ATTR_MODIFIED$$, {bubbles:!0});
          $setAttribute$$.call(this, $secondArgument$$, $window$jscomp$1$$);
          $loopAndVerify$$.attrName = $secondArgument$$;
          $loopAndVerify$$.prevValue = $polyfill$$ ? $ASAP$$ : null;
          $loopAndVerify$$.newValue = $window$jscomp$1$$;
          $polyfill$$ ? $loopAndVerify$$[$MODIFICATION$$] = $loopAndVerify$$.attrChange = 1 : $loopAndVerify$$[$ADDITION$$] = $loopAndVerify$$.attrChange = 0;
          $dispatchEvent$$.call(this, $loopAndVerify$$);
        }
        function $polyfill$$($secondArgument$$) {
          var $window$jscomp$1$$ = new CustomEvent($DOM_ATTR_MODIFIED$$, {bubbles:!0});
          $window$jscomp$1$$.attrName = $secondArgument$$;
          $window$jscomp$1$$.prevValue = $getAttribute$$.call(this, $secondArgument$$);
          $window$jscomp$1$$.newValue = null;
          $window$jscomp$1$$[$REMOVAL$$] = $window$jscomp$1$$.attrChange = 2;
          $removeAttribute$$.call(this, $secondArgument$$);
          $dispatchEvent$$.call(this, $window$jscomp$1$$);
        }
        var $ASAP$$ = $gOPD$$($HTMLElementPrototype$$, $ADD_EVENT_LISTENER$$), $loopAndVerify$$ = $ASAP$$.value;
        $ASAP$$.value = function($ASAP$$, $loopAndSetup$$, $executeAction$$) {
          $ASAP$$ === $DOM_ATTR_MODIFIED$$ && this[$ATTRIBUTE_CHANGED_CALLBACK$$] && this.setAttribute !== $window$jscomp$1$$ && (this[$EXPANDO_UID$$] = {className:{name:"class", value:this.className}}, this.setAttribute = $window$jscomp$1$$, this.removeAttribute = $polyfill$$, $loopAndVerify$$.call(this, "propertychange", $secondArgument$$));
          $loopAndVerify$$.call(this, $ASAP$$, $loopAndSetup$$, $executeAction$$);
        };
        $defineProperty$$($HTMLElementPrototype$$, $ADD_EVENT_LISTENER$$, $ASAP$$);
      }();
    } else {
      if (!$MutationObserver$jscomp$1$$ && ($documentElement$$[$ADD_EVENT_LISTENER$$]($DOM_ATTR_MODIFIED$$, $DOMAttrModified$$), $documentElement$$.setAttribute($EXPANDO_UID$$, 1), $documentElement$$.removeAttribute($EXPANDO_UID$$), $doesNotSupportDOMAttrModified$$)) {
        var $onSubtreeModified$$ = function($secondArgument$$) {
          var $window$jscomp$1$$, $polyfill$$;
          if (this === $secondArgument$$.target) {
            var $ASAP$$ = this[$EXPANDO_UID$$];
            this[$EXPANDO_UID$$] = $window$jscomp$1$$ = $getAttributesMirror$$(this);
            for ($polyfill$$ in $window$jscomp$1$$) {
              if (!($polyfill$$ in $ASAP$$)) {
                return $callDOMAttrModified$$(0, this, $polyfill$$, $ASAP$$[$polyfill$$], $window$jscomp$1$$[$polyfill$$], $ADDITION$$);
              }
              if ($window$jscomp$1$$[$polyfill$$] !== $ASAP$$[$polyfill$$]) {
                return $callDOMAttrModified$$(1, this, $polyfill$$, $ASAP$$[$polyfill$$], $window$jscomp$1$$[$polyfill$$], $MODIFICATION$$);
              }
            }
            for ($polyfill$$ in $ASAP$$) {
              if (!($polyfill$$ in $window$jscomp$1$$)) {
                return $callDOMAttrModified$$(2, this, $polyfill$$, $ASAP$$[$polyfill$$], $window$jscomp$1$$[$polyfill$$], $REMOVAL$$);
              }
            }
          }
        };
        var $callDOMAttrModified$$ = function($secondArgument$$, $window$jscomp$1$$, $polyfill$$, $ASAP$$, $loopAndVerify$$, $loopAndSetup$$) {
          $polyfill$$ = {attrChange:$secondArgument$$, currentTarget:$window$jscomp$1$$, attrName:$polyfill$$, prevValue:$ASAP$$, newValue:$loopAndVerify$$};
          $polyfill$$[$loopAndSetup$$] = $secondArgument$$;
          $onDOMAttrModified$$($polyfill$$);
        };
        var $getAttributesMirror$$ = function($secondArgument$$) {
          for (var $window$jscomp$1$$, $polyfill$$ = {}, $ASAP$$ = $secondArgument$$.attributes, $loopAndVerify$$ = 0, $loopAndSetup$$ = $ASAP$$.length; $loopAndVerify$$ < $loopAndSetup$$; $loopAndVerify$$++) {
            $secondArgument$$ = $ASAP$$[$loopAndVerify$$], $window$jscomp$1$$ = $secondArgument$$.name, "setAttribute" !== $window$jscomp$1$$ && ($polyfill$$[$window$jscomp$1$$] = $secondArgument$$.value);
          }
          return $polyfill$$;
        };
      }
    }
    $document$jscomp$2$$[$REGISTER_ELEMENT$$] = function($secondArgument$$, $window$jscomp$1$$) {
      function $polyfill$$() {
        return $type$jscomp$119$$ ? $document$jscomp$2$$.createElement($onDOMAttrModified$$, $ASAP$$) : $document$jscomp$2$$.createElement($onDOMAttrModified$$);
      }
      var $ASAP$$ = $secondArgument$$.toUpperCase();
      $setListener$$ && ($setListener$$ = !1, $MutationObserver$jscomp$1$$ ? ($observer$jscomp$1$$ = function($secondArgument$$, $window$jscomp$1$$) {
        function $polyfill$$($secondArgument$$, $window$jscomp$1$$) {
          for (var $polyfill$$ = 0, $ASAP$$ = $secondArgument$$.length; $polyfill$$ < $ASAP$$; $window$jscomp$1$$($secondArgument$$[$polyfill$$++])) {
          }
        }
        return new $MutationObserver$jscomp$1$$(function($ASAP$$) {
          for (var $loopAndVerify$$, $loopAndSetup$$, $executeAction$$, $getTypeIndex$$ = 0, $isInQSA$$ = $ASAP$$.length; $getTypeIndex$$ < $isInQSA$$; $getTypeIndex$$++) {
            if ($loopAndVerify$$ = $ASAP$$[$getTypeIndex$$], "childList" === $loopAndVerify$$.type) {
              $polyfill$$($loopAndVerify$$.addedNodes, $secondArgument$$), $polyfill$$($loopAndVerify$$.removedNodes, $window$jscomp$1$$);
            } else {
              if ($loopAndSetup$$ = $loopAndVerify$$.target, $notFromInnerHTMLHelper$$ && $loopAndSetup$$[$ATTRIBUTE_CHANGED_CALLBACK$$] && "style" !== $loopAndVerify$$.attributeName && ($executeAction$$ = $getAttribute$$.call($loopAndSetup$$, $loopAndVerify$$.attributeName), $executeAction$$ !== $loopAndVerify$$.oldValue)) {
                $loopAndSetup$$[$ATTRIBUTE_CHANGED_CALLBACK$$]($loopAndVerify$$.attributeName, $loopAndVerify$$.oldValue, $executeAction$$);
              }
            }
          }
        });
      }($executeAction$$($ATTACHED$$), $executeAction$$($DETACHED$$)), $observe$$ = function($secondArgument$$) {
        $observer$jscomp$1$$.observe($secondArgument$$, {childList:!0, subtree:!0});
        return $secondArgument$$;
      }, $observe$$($document$jscomp$2$$), $attachShadow$jscomp$1$$ && ($HTMLElementPrototype$$.attachShadow = function() {
        return $observe$$($attachShadow$jscomp$1$$.apply(this, arguments));
      })) : ($asapQueue$$ = [], $document$jscomp$2$$[$ADD_EVENT_LISTENER$$]("DOMNodeInserted", $onDOMNode$$($ATTACHED$$)), $document$jscomp$2$$[$ADD_EVENT_LISTENER$$]("DOMNodeRemoved", $onDOMNode$$($DETACHED$$))), $document$jscomp$2$$[$ADD_EVENT_LISTENER$$]($DOM_CONTENT_LOADED$$, $onReadyStateChange$$), $document$jscomp$2$$[$ADD_EVENT_LISTENER$$]("readystatechange", $onReadyStateChange$$), $HTMLElementPrototype$$.cloneNode = function($secondArgument$$) {
        var $window$jscomp$1$$ = $cloneNode$jscomp$1$$.call(this, !!$secondArgument$$), $polyfill$$ = $getTypeIndex$$($window$jscomp$1$$);
        -1 < $polyfill$$ && $patch$$($window$jscomp$1$$, $protos$$[$polyfill$$]);
        $secondArgument$$ && $query$jscomp$11$$.length && $loopAndSetup$$($window$jscomp$1$$.querySelectorAll($query$jscomp$11$$));
        return $window$jscomp$1$$;
      });
      if ($justSetup$$) {
        return $justSetup$$ = !1;
      }
      -2 < $indexOf$$.call($types$$, $PREFIX_IS$$ + $ASAP$$) + $indexOf$$.call($types$$, $PREFIX_TAG$$ + $ASAP$$) && $throwTypeError$$($secondArgument$$);
      if (!$validName$$.test($ASAP$$) || -1 < $indexOf$$.call($invalidNames$$, $ASAP$$)) {
        throw Error("The type " + $secondArgument$$ + " is invalid");
      }
      var $isInQSA$$ = $window$jscomp$1$$ || $OP$$, $type$jscomp$119$$ = $hOP$$.call($isInQSA$$, $EXTENDS$$), $onDOMAttrModified$$ = $type$jscomp$119$$ ? $window$jscomp$1$$[$EXTENDS$$].toUpperCase() : $ASAP$$;
      $type$jscomp$119$$ && -1 < $indexOf$$.call($types$$, $PREFIX_TAG$$ + $onDOMAttrModified$$) && $throwTypeError$$($onDOMAttrModified$$);
      $window$jscomp$1$$ = $types$$.push(($type$jscomp$119$$ ? $PREFIX_IS$$ : $PREFIX_TAG$$) + $ASAP$$) - 1;
      $query$jscomp$11$$ = $query$jscomp$11$$.concat($query$jscomp$11$$.length ? "," : "", $type$jscomp$119$$ ? $onDOMAttrModified$$ + '[is="' + $secondArgument$$.toLowerCase() + '"]' : $onDOMAttrModified$$);
      $polyfill$$.prototype = $protos$$[$window$jscomp$1$$] = $hOP$$.call($isInQSA$$, "prototype") ? $isInQSA$$.prototype : $create$$($HTMLElementPrototype$$);
      $query$jscomp$11$$.length && $loopAndVerify$$($document$jscomp$2$$.querySelectorAll($query$jscomp$11$$), $ATTACHED$$);
      return $polyfill$$;
    };
    $document$jscomp$2$$.createElement = $patchedCreateElement$$ = function($window$jscomp$1$$, $polyfill$$) {
      var $ASAP$$ = $getIs$$($polyfill$$), $loopAndVerify$$ = $ASAP$$ ? $createElement$jscomp$2$$.call($document$jscomp$2$$, $window$jscomp$1$$, $secondArgument$$($ASAP$$)) : $createElement$jscomp$2$$.call($document$jscomp$2$$, $window$jscomp$1$$);
      $window$jscomp$1$$ = "" + $window$jscomp$1$$;
      var $loopAndSetup$$ = $indexOf$$.call($types$$, ($ASAP$$ ? $PREFIX_IS$$ : $PREFIX_TAG$$) + ($ASAP$$ || $window$jscomp$1$$).toUpperCase()), $executeAction$$ = -1 < $loopAndSetup$$;
      $ASAP$$ && ($loopAndVerify$$.setAttribute("is", $ASAP$$ = $ASAP$$.toLowerCase()), $executeAction$$ && ($executeAction$$ = $isInQSA$$($window$jscomp$1$$.toUpperCase(), $ASAP$$)));
      $notFromInnerHTMLHelper$$ = !$document$jscomp$2$$.createElement.innerHTMLHelper;
      $executeAction$$ && $patch$$($loopAndVerify$$, $protos$$[$loopAndSetup$$]);
      return $loopAndVerify$$;
    };
  }
  $CustomElementRegistry$jscomp$1$$.prototype = {constructor:$CustomElementRegistry$jscomp$1$$, define:$usableCustomElements$$ ? function($secondArgument$$, $window$jscomp$1$$, $polyfill$$) {
    if ($polyfill$$) {
      $CERDefine$$($secondArgument$$, $window$jscomp$1$$, $polyfill$$);
    } else {
      var $ASAP$$ = $secondArgument$$.toUpperCase();
      $constructors$$[$ASAP$$] = {constructor:$window$jscomp$1$$, create:[$ASAP$$]};
      $nodeNames$$.set($window$jscomp$1$$, $ASAP$$);
      $customElements$jscomp$3$$.define($secondArgument$$, $window$jscomp$1$$);
    }
  } : $CERDefine$$, get:$usableCustomElements$$ ? function($secondArgument$$) {
    return $customElements$jscomp$3$$.get($secondArgument$$) || $get$$($secondArgument$$);
  } : $get$$, whenDefined:$usableCustomElements$$ ? function($secondArgument$$) {
    return $Promise$jscomp$3$$.race([$customElements$jscomp$3$$.whenDefined($secondArgument$$), $whenDefined$$($secondArgument$$)]);
  } : $whenDefined$$};
  if ($customElements$jscomp$3$$ && "force" !== $polyfill$$) {
    try {
      (function($secondArgument$$, $polyfill$$, $ASAP$$) {
        $polyfill$$[$EXTENDS$$] = "a";
        $secondArgument$$.prototype = $create$$(HTMLAnchorElement.prototype);
        $secondArgument$$.prototype.constructor = $secondArgument$$;
        $window$jscomp$1$$.customElements.define($ASAP$$, $secondArgument$$, $polyfill$$);
        if ($getAttribute$$.call($document$jscomp$2$$.createElement("a", {is:$ASAP$$}), "is") !== $ASAP$$ || $usableCustomElements$$ && $getAttribute$$.call(new $secondArgument$$, "is") !== $ASAP$$) {
          throw $polyfill$$;
        }
      })(function $DRE$jscomp$1$$() {
        return Reflect.construct(HTMLAnchorElement, [], $DRE$jscomp$1$$);
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
    $secondArgument$$ = function($secondArgument$$) {
      return {is:$secondArgument$$.toLowerCase()};
    };
  }
}
;function $getExperimentTogglesFromCookie$$module$src$experiments$$($JSCompiler_cookieString$jscomp$inline_138_JSCompiler_cookies$jscomp$inline_139_JSCompiler_inline_result$jscomp$36_JSCompiler_value$jscomp$inline_143_toggles$jscomp$3_win$jscomp$46$$) {
  a: {
    try {
      var $JSCompiler_i$jscomp$inline_140_JSCompiler_inline_result$jscomp$195_i$jscomp$45$$ = $JSCompiler_cookieString$jscomp$inline_138_JSCompiler_cookies$jscomp$inline_139_JSCompiler_inline_result$jscomp$36_JSCompiler_value$jscomp$inline_143_toggles$jscomp$3_win$jscomp$46$$.document.cookie;
    } catch ($JSCompiler_e$jscomp$inline_222$$) {
      $JSCompiler_i$jscomp$inline_140_JSCompiler_inline_result$jscomp$195_i$jscomp$45$$ = "";
    }
    if ($JSCompiler_cookieString$jscomp$inline_138_JSCompiler_cookies$jscomp$inline_139_JSCompiler_inline_result$jscomp$36_JSCompiler_value$jscomp$inline_143_toggles$jscomp$3_win$jscomp$46$$ = $JSCompiler_i$jscomp$inline_140_JSCompiler_inline_result$jscomp$195_i$jscomp$45$$) {
      for ($JSCompiler_cookieString$jscomp$inline_138_JSCompiler_cookies$jscomp$inline_139_JSCompiler_inline_result$jscomp$36_JSCompiler_value$jscomp$inline_143_toggles$jscomp$3_win$jscomp$46$$ = $JSCompiler_cookieString$jscomp$inline_138_JSCompiler_cookies$jscomp$inline_139_JSCompiler_inline_result$jscomp$36_JSCompiler_value$jscomp$inline_143_toggles$jscomp$3_win$jscomp$46$$.split(";"), $JSCompiler_i$jscomp$inline_140_JSCompiler_inline_result$jscomp$195_i$jscomp$45$$ = 0; $JSCompiler_i$jscomp$inline_140_JSCompiler_inline_result$jscomp$195_i$jscomp$45$$ < 
      $JSCompiler_cookieString$jscomp$inline_138_JSCompiler_cookies$jscomp$inline_139_JSCompiler_inline_result$jscomp$36_JSCompiler_value$jscomp$inline_143_toggles$jscomp$3_win$jscomp$46$$.length; $JSCompiler_i$jscomp$inline_140_JSCompiler_inline_result$jscomp$195_i$jscomp$45$$++) {
        var $JSCompiler_cookie$jscomp$inline_141$$ = $JSCompiler_cookieString$jscomp$inline_138_JSCompiler_cookies$jscomp$inline_139_JSCompiler_inline_result$jscomp$36_JSCompiler_value$jscomp$inline_143_toggles$jscomp$3_win$jscomp$46$$[$JSCompiler_i$jscomp$inline_140_JSCompiler_inline_result$jscomp$195_i$jscomp$45$$].trim(), $JSCompiler_eq$jscomp$inline_142$$ = $JSCompiler_cookie$jscomp$inline_141$$.indexOf("=");
        if (-1 != $JSCompiler_eq$jscomp$inline_142$$ && "AMP_EXP" == $tryDecodeUriComponent_$$module$src$url_try_decode_uri_component$$($JSCompiler_cookie$jscomp$inline_141$$.substring(0, $JSCompiler_eq$jscomp$inline_142$$).trim(), void 0)) {
          $JSCompiler_cookieString$jscomp$inline_138_JSCompiler_cookies$jscomp$inline_139_JSCompiler_inline_result$jscomp$36_JSCompiler_value$jscomp$inline_143_toggles$jscomp$3_win$jscomp$46$$ = $JSCompiler_cookie$jscomp$inline_141$$.substring($JSCompiler_eq$jscomp$inline_142$$ + 1).trim();
          $JSCompiler_cookieString$jscomp$inline_138_JSCompiler_cookies$jscomp$inline_139_JSCompiler_inline_result$jscomp$36_JSCompiler_value$jscomp$inline_143_toggles$jscomp$3_win$jscomp$46$$ = $tryDecodeUriComponent_$$module$src$url_try_decode_uri_component$$($JSCompiler_cookieString$jscomp$inline_138_JSCompiler_cookies$jscomp$inline_139_JSCompiler_inline_result$jscomp$36_JSCompiler_value$jscomp$inline_143_toggles$jscomp$3_win$jscomp$46$$, $JSCompiler_cookieString$jscomp$inline_138_JSCompiler_cookies$jscomp$inline_139_JSCompiler_inline_result$jscomp$36_JSCompiler_value$jscomp$inline_143_toggles$jscomp$3_win$jscomp$46$$);
          break a;
        }
      }
    }
    $JSCompiler_cookieString$jscomp$inline_138_JSCompiler_cookies$jscomp$inline_139_JSCompiler_inline_result$jscomp$36_JSCompiler_value$jscomp$inline_143_toggles$jscomp$3_win$jscomp$46$$ = null;
  }
  var $experimentCookie$$ = $JSCompiler_cookieString$jscomp$inline_138_JSCompiler_cookies$jscomp$inline_139_JSCompiler_inline_result$jscomp$36_JSCompiler_value$jscomp$inline_143_toggles$jscomp$3_win$jscomp$46$$, $tokens$$ = $experimentCookie$$ ? $experimentCookie$$.split(/\s*,\s*/g) : [];
  $JSCompiler_cookieString$jscomp$inline_138_JSCompiler_cookies$jscomp$inline_139_JSCompiler_inline_result$jscomp$36_JSCompiler_value$jscomp$inline_143_toggles$jscomp$3_win$jscomp$46$$ = Object.create(null);
  for ($JSCompiler_i$jscomp$inline_140_JSCompiler_inline_result$jscomp$195_i$jscomp$45$$ = 0; $JSCompiler_i$jscomp$inline_140_JSCompiler_inline_result$jscomp$195_i$jscomp$45$$ < $tokens$$.length; $JSCompiler_i$jscomp$inline_140_JSCompiler_inline_result$jscomp$195_i$jscomp$45$$++) {
    0 != $tokens$$[$JSCompiler_i$jscomp$inline_140_JSCompiler_inline_result$jscomp$195_i$jscomp$45$$].length && ("-" == $tokens$$[$JSCompiler_i$jscomp$inline_140_JSCompiler_inline_result$jscomp$195_i$jscomp$45$$][0] ? $JSCompiler_cookieString$jscomp$inline_138_JSCompiler_cookies$jscomp$inline_139_JSCompiler_inline_result$jscomp$36_JSCompiler_value$jscomp$inline_143_toggles$jscomp$3_win$jscomp$46$$[$tokens$$[$JSCompiler_i$jscomp$inline_140_JSCompiler_inline_result$jscomp$195_i$jscomp$45$$].substr(1)] = 
    !1 : $JSCompiler_cookieString$jscomp$inline_138_JSCompiler_cookies$jscomp$inline_139_JSCompiler_inline_result$jscomp$36_JSCompiler_value$jscomp$inline_143_toggles$jscomp$3_win$jscomp$46$$[$tokens$$[$JSCompiler_i$jscomp$inline_140_JSCompiler_inline_result$jscomp$195_i$jscomp$45$$]] = !0);
  }
  return $JSCompiler_cookieString$jscomp$inline_138_JSCompiler_cookies$jscomp$inline_139_JSCompiler_inline_result$jscomp$36_JSCompiler_value$jscomp$inline_143_toggles$jscomp$3_win$jscomp$46$$;
}
;(function($win$jscomp$26$$) {
  /Trident|MSIE|IEMobile/i.test($win$jscomp$26$$.navigator.userAgent) && $win$jscomp$26$$.DOMTokenList && $win$jscomp$26$$.Object.defineProperty($win$jscomp$26$$.DOMTokenList.prototype, "toggle", {enumerable:!1, configurable:!0, writable:!0, value:$domTokenListTogglePolyfill$$module$src$polyfills$domtokenlist_toggle$$});
})(self);
(function($win$jscomp$30$$) {
  $win$jscomp$30$$.fetch || (Object.defineProperty($win$jscomp$30$$, "fetch", {value:$fetchPolyfill$$module$src$polyfills$fetch$$, writable:!0, enumerable:!0, configurable:!0}), Object.defineProperty($win$jscomp$30$$, "Response", {value:$Response$$module$src$polyfills$fetch$$, writable:!0, enumerable:!1, configurable:!0}));
})(self);
(function($win$jscomp$31$$) {
  $win$jscomp$31$$.Math.sign || $win$jscomp$31$$.Object.defineProperty($win$jscomp$31$$.Math, "sign", {enumerable:!1, configurable:!0, writable:!0, value:$sign$$module$src$polyfills$math_sign$$});
})(self);
(function($win$jscomp$32$$) {
  $win$jscomp$32$$.Object.assign || $win$jscomp$32$$.Object.defineProperty($win$jscomp$32$$.Object, "assign", {enumerable:!1, configurable:!0, writable:!0, value:$assign$$module$src$polyfills$object_assign$$});
})(self);
(function($win$jscomp$33$$) {
  $win$jscomp$33$$.Object.values || $win$jscomp$33$$.Object.defineProperty($win$jscomp$33$$.Object, "values", {configurable:!0, writable:!0, value:$values$$module$src$polyfills$object_values$$});
})(self);
(function($win$jscomp$34$$) {
  $win$jscomp$34$$.Promise || ($win$jscomp$34$$.Promise = $module$node_modules$promise_pjs$promise$default$$, $module$node_modules$promise_pjs$promise$default$$.default && ($win$jscomp$34$$.Promise = $module$node_modules$promise_pjs$promise$default$$.default), $win$jscomp$34$$.Promise.resolve = $module$node_modules$promise_pjs$promise$default$resolve$$, $win$jscomp$34$$.Promise.reject = $module$node_modules$promise_pjs$promise$default$reject$$, $win$jscomp$34$$.Promise.all = $module$node_modules$promise_pjs$promise$default$all$$, 
  $win$jscomp$34$$.Promise.race = $module$node_modules$promise_pjs$promise$default$race$$);
})(self);
(function($win$jscomp$28$$) {
  var $documentClass$$ = $win$jscomp$28$$.HTMLDocument || $win$jscomp$28$$.Document;
  $documentClass$$.prototype.contains || $win$jscomp$28$$.Object.defineProperty($documentClass$$.prototype, "contains", {enumerable:!1, configurable:!0, writable:!0, value:$documentContainsPolyfill$$module$src$polyfills$document_contains$$});
})(self);
(function($win$jscomp$17$$) {
  $win$jscomp$17$$.Array.prototype.includes || $win$jscomp$17$$.Object.defineProperty(Array.prototype, "includes", {enumerable:!1, configurable:!0, writable:!0, value:$includes$$module$src$polyfills$array_includes$$});
})(self);
if (function($JSCompiler_params$jscomp$inline_154_win$jscomp$42$$, $experimentId$$) {
  if ($JSCompiler_params$jscomp$inline_154_win$jscomp$42$$.__AMP__EXPERIMENT_TOGGLES) {
    var $JSCompiler_inline_result$jscomp$39_JSCompiler_toggles$jscomp$inline_146$$ = $JSCompiler_params$jscomp$inline_154_win$jscomp$42$$.__AMP__EXPERIMENT_TOGGLES;
  } else {
    $JSCompiler_params$jscomp$inline_154_win$jscomp$42$$.__AMP__EXPERIMENT_TOGGLES = Object.create(null);
    $JSCompiler_inline_result$jscomp$39_JSCompiler_toggles$jscomp$inline_146$$ = $JSCompiler_params$jscomp$inline_154_win$jscomp$42$$.__AMP__EXPERIMENT_TOGGLES;
    if ($JSCompiler_params$jscomp$inline_154_win$jscomp$42$$.AMP_CONFIG) {
      for (var $JSCompiler_allowed$jscomp$inline_149_JSCompiler_experimentId$jscomp$inline_147_allowed$13$jscomp$inline_153$$ in $JSCompiler_params$jscomp$inline_154_win$jscomp$42$$.AMP_CONFIG) {
        var $JSCompiler_frequency$jscomp$inline_148_JSCompiler_meta$jscomp$inline_150_JSCompiler_optedInExperiments$jscomp$inline_151_i$14$jscomp$inline_155$$ = $JSCompiler_params$jscomp$inline_154_win$jscomp$42$$.AMP_CONFIG[$JSCompiler_allowed$jscomp$inline_149_JSCompiler_experimentId$jscomp$inline_147_allowed$13$jscomp$inline_153$$];
        "number" === typeof $JSCompiler_frequency$jscomp$inline_148_JSCompiler_meta$jscomp$inline_150_JSCompiler_optedInExperiments$jscomp$inline_151_i$14$jscomp$inline_155$$ && 0 <= $JSCompiler_frequency$jscomp$inline_148_JSCompiler_meta$jscomp$inline_150_JSCompiler_optedInExperiments$jscomp$inline_151_i$14$jscomp$inline_155$$ && 1 >= $JSCompiler_frequency$jscomp$inline_148_JSCompiler_meta$jscomp$inline_150_JSCompiler_optedInExperiments$jscomp$inline_151_i$14$jscomp$inline_155$$ && ($JSCompiler_inline_result$jscomp$39_JSCompiler_toggles$jscomp$inline_146$$[$JSCompiler_allowed$jscomp$inline_149_JSCompiler_experimentId$jscomp$inline_147_allowed$13$jscomp$inline_153$$] = 
        Math.random() < $JSCompiler_frequency$jscomp$inline_148_JSCompiler_meta$jscomp$inline_150_JSCompiler_optedInExperiments$jscomp$inline_151_i$14$jscomp$inline_155$$);
      }
    }
    if ($JSCompiler_params$jscomp$inline_154_win$jscomp$42$$.AMP_CONFIG && Array.isArray($JSCompiler_params$jscomp$inline_154_win$jscomp$42$$.AMP_CONFIG["allow-doc-opt-in"]) && 0 < $JSCompiler_params$jscomp$inline_154_win$jscomp$42$$.AMP_CONFIG["allow-doc-opt-in"].length && ($JSCompiler_allowed$jscomp$inline_149_JSCompiler_experimentId$jscomp$inline_147_allowed$13$jscomp$inline_153$$ = $JSCompiler_params$jscomp$inline_154_win$jscomp$42$$.AMP_CONFIG["allow-doc-opt-in"], $JSCompiler_frequency$jscomp$inline_148_JSCompiler_meta$jscomp$inline_150_JSCompiler_optedInExperiments$jscomp$inline_151_i$14$jscomp$inline_155$$ = 
    $JSCompiler_params$jscomp$inline_154_win$jscomp$42$$.document.head.querySelector('meta[name="amp-experiments-opt-in"]'))) {
      $JSCompiler_frequency$jscomp$inline_148_JSCompiler_meta$jscomp$inline_150_JSCompiler_optedInExperiments$jscomp$inline_151_i$14$jscomp$inline_155$$ = $JSCompiler_frequency$jscomp$inline_148_JSCompiler_meta$jscomp$inline_150_JSCompiler_optedInExperiments$jscomp$inline_151_i$14$jscomp$inline_155$$.getAttribute("content").split(",");
      for (var $JSCompiler_i$jscomp$inline_152_JSCompiler_param$jscomp$inline_156$$ = 0; $JSCompiler_i$jscomp$inline_152_JSCompiler_param$jscomp$inline_156$$ < $JSCompiler_frequency$jscomp$inline_148_JSCompiler_meta$jscomp$inline_150_JSCompiler_optedInExperiments$jscomp$inline_151_i$14$jscomp$inline_155$$.length; $JSCompiler_i$jscomp$inline_152_JSCompiler_param$jscomp$inline_156$$++) {
        -1 != $JSCompiler_allowed$jscomp$inline_149_JSCompiler_experimentId$jscomp$inline_147_allowed$13$jscomp$inline_153$$.indexOf($JSCompiler_frequency$jscomp$inline_148_JSCompiler_meta$jscomp$inline_150_JSCompiler_optedInExperiments$jscomp$inline_151_i$14$jscomp$inline_155$$[$JSCompiler_i$jscomp$inline_152_JSCompiler_param$jscomp$inline_156$$]) && ($JSCompiler_inline_result$jscomp$39_JSCompiler_toggles$jscomp$inline_146$$[$JSCompiler_frequency$jscomp$inline_148_JSCompiler_meta$jscomp$inline_150_JSCompiler_optedInExperiments$jscomp$inline_151_i$14$jscomp$inline_155$$[$JSCompiler_i$jscomp$inline_152_JSCompiler_param$jscomp$inline_156$$]] = 
        !0);
      }
    }
    Object.assign($JSCompiler_inline_result$jscomp$39_JSCompiler_toggles$jscomp$inline_146$$, $getExperimentTogglesFromCookie$$module$src$experiments$$($JSCompiler_params$jscomp$inline_154_win$jscomp$42$$));
    if ($JSCompiler_params$jscomp$inline_154_win$jscomp$42$$.AMP_CONFIG && Array.isArray($JSCompiler_params$jscomp$inline_154_win$jscomp$42$$.AMP_CONFIG["allow-url-opt-in"]) && 0 < $JSCompiler_params$jscomp$inline_154_win$jscomp$42$$.AMP_CONFIG["allow-url-opt-in"].length) {
      for ($JSCompiler_allowed$jscomp$inline_149_JSCompiler_experimentId$jscomp$inline_147_allowed$13$jscomp$inline_153$$ = $JSCompiler_params$jscomp$inline_154_win$jscomp$42$$.AMP_CONFIG["allow-url-opt-in"], $JSCompiler_params$jscomp$inline_154_win$jscomp$42$$ = $parseQueryString_$$module$src$url_parse_query_string$$($JSCompiler_params$jscomp$inline_154_win$jscomp$42$$.location.originalHash || $JSCompiler_params$jscomp$inline_154_win$jscomp$42$$.location.hash), $JSCompiler_frequency$jscomp$inline_148_JSCompiler_meta$jscomp$inline_150_JSCompiler_optedInExperiments$jscomp$inline_151_i$14$jscomp$inline_155$$ = 
      0; $JSCompiler_frequency$jscomp$inline_148_JSCompiler_meta$jscomp$inline_150_JSCompiler_optedInExperiments$jscomp$inline_151_i$14$jscomp$inline_155$$ < $JSCompiler_allowed$jscomp$inline_149_JSCompiler_experimentId$jscomp$inline_147_allowed$13$jscomp$inline_153$$.length; $JSCompiler_frequency$jscomp$inline_148_JSCompiler_meta$jscomp$inline_150_JSCompiler_optedInExperiments$jscomp$inline_151_i$14$jscomp$inline_155$$++) {
        $JSCompiler_i$jscomp$inline_152_JSCompiler_param$jscomp$inline_156$$ = $JSCompiler_params$jscomp$inline_154_win$jscomp$42$$["e-" + $JSCompiler_allowed$jscomp$inline_149_JSCompiler_experimentId$jscomp$inline_147_allowed$13$jscomp$inline_153$$[$JSCompiler_frequency$jscomp$inline_148_JSCompiler_meta$jscomp$inline_150_JSCompiler_optedInExperiments$jscomp$inline_151_i$14$jscomp$inline_155$$]], "1" == $JSCompiler_i$jscomp$inline_152_JSCompiler_param$jscomp$inline_156$$ && ($JSCompiler_inline_result$jscomp$39_JSCompiler_toggles$jscomp$inline_146$$[$JSCompiler_allowed$jscomp$inline_149_JSCompiler_experimentId$jscomp$inline_147_allowed$13$jscomp$inline_153$$[$JSCompiler_frequency$jscomp$inline_148_JSCompiler_meta$jscomp$inline_150_JSCompiler_optedInExperiments$jscomp$inline_151_i$14$jscomp$inline_155$$]] = 
        !0), "0" == $JSCompiler_i$jscomp$inline_152_JSCompiler_param$jscomp$inline_156$$ && ($JSCompiler_inline_result$jscomp$39_JSCompiler_toggles$jscomp$inline_146$$[$JSCompiler_allowed$jscomp$inline_149_JSCompiler_experimentId$jscomp$inline_147_allowed$13$jscomp$inline_153$$[$JSCompiler_frequency$jscomp$inline_148_JSCompiler_meta$jscomp$inline_150_JSCompiler_optedInExperiments$jscomp$inline_151_i$14$jscomp$inline_155$$]] = !1);
      }
    }
  }
  var $toggles$$ = $JSCompiler_inline_result$jscomp$39_JSCompiler_toggles$jscomp$inline_146$$;
  return !!$toggles$$[$experimentId$$];
}(self, "custom-elements-v1")) {
  var $JSCompiler_win$jscomp$inline_158$$ = self;
  -1 === $JSCompiler_win$jscomp$inline_158$$.HTMLElement.toString().indexOf("[native code]") || $polyfill$$module$src$polyfills$custom_elements$$();
} else {
  $installCustomElements$$module$node_modules$document_register_element$build$document_register_element_patched$$();
}
;function $getService$$module$src$service$$($win$jscomp$55$$) {
  $win$jscomp$55$$ = $win$jscomp$55$$.__AMP_TOP || $win$jscomp$55$$;
  return $getServiceInternal$$module$src$service$$($win$jscomp$55$$, "ampdoc");
}
function $getServiceForDoc$$module$src$service$$($elementOrAmpDoc$$) {
  var $JSCompiler_ampdoc$jscomp$inline_227_JSCompiler_inline_result$jscomp$196_ampdoc$jscomp$1$$ = $getAmpdoc$$module$src$service$$($elementOrAmpDoc$$);
  $JSCompiler_ampdoc$jscomp$inline_227_JSCompiler_inline_result$jscomp$196_ampdoc$jscomp$1$$ = $getAmpdoc$$module$src$service$$($JSCompiler_ampdoc$jscomp$inline_227_JSCompiler_inline_result$jscomp$196_ampdoc$jscomp$1$$);
  $JSCompiler_ampdoc$jscomp$inline_227_JSCompiler_inline_result$jscomp$196_ampdoc$jscomp$1$$ = $JSCompiler_ampdoc$jscomp$inline_227_JSCompiler_inline_result$jscomp$196_ampdoc$jscomp$1$$.isSingleDoc() ? $JSCompiler_ampdoc$jscomp$inline_227_JSCompiler_inline_result$jscomp$196_ampdoc$jscomp$1$$.win : $JSCompiler_ampdoc$jscomp$inline_227_JSCompiler_inline_result$jscomp$196_ampdoc$jscomp$1$$;
  return $getServiceInternal$$module$src$service$$($JSCompiler_ampdoc$jscomp$inline_227_JSCompiler_inline_result$jscomp$196_ampdoc$jscomp$1$$, "viewer");
}
function $getAmpdoc$$module$src$service$$($nodeOrDoc$jscomp$1$$) {
  return $nodeOrDoc$jscomp$1$$.nodeType ? $getService$$module$src$service$$(($nodeOrDoc$jscomp$1$$.ownerDocument || $nodeOrDoc$jscomp$1$$).defaultView).getAmpDoc($nodeOrDoc$jscomp$1$$) : $nodeOrDoc$jscomp$1$$;
}
function $getServiceInternal$$module$src$service$$($holder$jscomp$3_s$jscomp$5$$, $id$jscomp$18$$) {
  var $JSCompiler_services$jscomp$inline_171$$ = $holder$jscomp$3_s$jscomp$5$$.services;
  $JSCompiler_services$jscomp$inline_171$$ || ($JSCompiler_services$jscomp$inline_171$$ = $holder$jscomp$3_s$jscomp$5$$.services = {});
  var $services$$ = $JSCompiler_services$jscomp$inline_171$$;
  $holder$jscomp$3_s$jscomp$5$$ = $services$$[$id$jscomp$18$$];
  $holder$jscomp$3_s$jscomp$5$$.obj || ($holder$jscomp$3_s$jscomp$5$$.obj = new $holder$jscomp$3_s$jscomp$5$$.ctor($holder$jscomp$3_s$jscomp$5$$.context), $holder$jscomp$3_s$jscomp$5$$.ctor = null, $holder$jscomp$3_s$jscomp$5$$.context = null, $holder$jscomp$3_s$jscomp$5$$.resolve && $holder$jscomp$3_s$jscomp$5$$.resolve($holder$jscomp$3_s$jscomp$5$$.obj));
  return $holder$jscomp$3_s$jscomp$5$$.obj;
}
;function $exponentialBackoff$$module$src$exponential_backoff$$() {
  var $getTimeout$$ = $exponentialBackoffClock$$module$src$exponential_backoff$$();
  return function($work$$) {
    return setTimeout($work$$, $getTimeout$$());
  };
}
function $exponentialBackoffClock$$module$src$exponential_backoff$$() {
  var $count$jscomp$15$$ = 0;
  return function() {
    var $wait$$ = Math.pow(1.5, $count$jscomp$15$$++);
    var $JSCompiler_jitter$jscomp$inline_175_JSCompiler_opt_perc$jscomp$inline_174$$ = $wait$$ * ($JSCompiler_jitter$jscomp$inline_175_JSCompiler_opt_perc$jscomp$inline_174$$ || .3) * Math.random();
    .5 < Math.random() && ($JSCompiler_jitter$jscomp$inline_175_JSCompiler_opt_perc$jscomp$inline_174$$ *= -1);
    $wait$$ += $JSCompiler_jitter$jscomp$inline_175_JSCompiler_opt_perc$jscomp$inline_174$$;
    return 1000 * $wait$$;
  };
}
;var $propertyNameCache$$module$src$style$$, $vendorPrefixes$$module$src$style$$ = "Webkit webkit Moz moz ms O o".split(" ");
var $bodyMadeVisible$$module$src$style_installer$$ = !1;
function $makeBodyVisibleRecovery$$module$src$style_installer$$($JSCompiler_element$jscomp$inline_229_doc$jscomp$11$$) {
  if (!$bodyMadeVisible$$module$src$style_installer$$) {
    $bodyMadeVisible$$module$src$style_installer$$ = !0;
    $JSCompiler_element$jscomp$inline_229_doc$jscomp$11$$ = $JSCompiler_element$jscomp$inline_229_doc$jscomp$11$$.body;
    var $JSCompiler_styles$jscomp$inline_230$$ = {opacity:1, visibility:"visible", animation:"none"}, $JSCompiler_k$jscomp$inline_231$$;
    for ($JSCompiler_k$jscomp$inline_231$$ in $JSCompiler_styles$jscomp$inline_230$$) {
      var $JSCompiler_element$jscomp$inline_233$$ = $JSCompiler_element$jscomp$inline_229_doc$jscomp$11$$, $JSCompiler_value$jscomp$inline_235$$ = $JSCompiler_styles$jscomp$inline_230$$[$JSCompiler_k$jscomp$inline_231$$];
      var $JSCompiler_propertyName$jscomp$inline_237_JSCompiler_style$jscomp$inline_239$$ = $JSCompiler_element$jscomp$inline_233$$.style;
      var $JSCompiler_camelCase$jscomp$inline_240$$ = $JSCompiler_k$jscomp$inline_231$$;
      if ($startsWith$$module$src$string$$($JSCompiler_camelCase$jscomp$inline_240$$, "--")) {
        $JSCompiler_propertyName$jscomp$inline_237_JSCompiler_style$jscomp$inline_239$$ = $JSCompiler_camelCase$jscomp$inline_240$$;
      } else {
        $propertyNameCache$$module$src$style$$ || ($propertyNameCache$$module$src$style$$ = $map$$module$src$utils$object$$());
        var $JSCompiler_propertyName$jscomp$inline_242$$ = $propertyNameCache$$module$src$style$$[$JSCompiler_camelCase$jscomp$inline_240$$];
        if (!$JSCompiler_propertyName$jscomp$inline_242$$) {
          $JSCompiler_propertyName$jscomp$inline_242$$ = $JSCompiler_camelCase$jscomp$inline_240$$;
          if (void 0 === $JSCompiler_propertyName$jscomp$inline_237_JSCompiler_style$jscomp$inline_239$$[$JSCompiler_camelCase$jscomp$inline_240$$]) {
            var $JSCompiler_prefixedPropertyName$jscomp$inline_244_JSCompiler_titleCase$jscomp$inline_243$$ = $JSCompiler_camelCase$jscomp$inline_240$$.charAt(0).toUpperCase() + $JSCompiler_camelCase$jscomp$inline_240$$.slice(1);
            b: {
              for (var $JSCompiler_i$jscomp$inline_248$$ = 0; $JSCompiler_i$jscomp$inline_248$$ < $vendorPrefixes$$module$src$style$$.length; $JSCompiler_i$jscomp$inline_248$$++) {
                var $JSCompiler_propertyName$jscomp$inline_249$$ = $vendorPrefixes$$module$src$style$$[$JSCompiler_i$jscomp$inline_248$$] + $JSCompiler_prefixedPropertyName$jscomp$inline_244_JSCompiler_titleCase$jscomp$inline_243$$;
                if (void 0 !== $JSCompiler_propertyName$jscomp$inline_237_JSCompiler_style$jscomp$inline_239$$[$JSCompiler_propertyName$jscomp$inline_249$$]) {
                  $JSCompiler_prefixedPropertyName$jscomp$inline_244_JSCompiler_titleCase$jscomp$inline_243$$ = $JSCompiler_propertyName$jscomp$inline_249$$;
                  break b;
                }
              }
              $JSCompiler_prefixedPropertyName$jscomp$inline_244_JSCompiler_titleCase$jscomp$inline_243$$ = "";
            }
            void 0 !== $JSCompiler_propertyName$jscomp$inline_237_JSCompiler_style$jscomp$inline_239$$[$JSCompiler_prefixedPropertyName$jscomp$inline_244_JSCompiler_titleCase$jscomp$inline_243$$] && ($JSCompiler_propertyName$jscomp$inline_242$$ = $JSCompiler_prefixedPropertyName$jscomp$inline_244_JSCompiler_titleCase$jscomp$inline_243$$);
          }
          $propertyNameCache$$module$src$style$$[$JSCompiler_camelCase$jscomp$inline_240$$] = $JSCompiler_propertyName$jscomp$inline_242$$;
        }
        $JSCompiler_propertyName$jscomp$inline_237_JSCompiler_style$jscomp$inline_239$$ = $JSCompiler_propertyName$jscomp$inline_242$$;
      }
      $JSCompiler_propertyName$jscomp$inline_237_JSCompiler_style$jscomp$inline_239$$ && ($JSCompiler_element$jscomp$inline_233$$.style[$JSCompiler_propertyName$jscomp$inline_237_JSCompiler_style$jscomp$inline_239$$] = $JSCompiler_value$jscomp$inline_235$$);
    }
  }
}
;var $accumulatedErrorMessages$$module$src$error$$ = self.AMPErrors || [];
self.AMPErrors = $accumulatedErrorMessages$$module$src$error$$;
function $reportingBackoff$$module$src$error$$($work$jscomp$1$$) {
  $reportingBackoff$$module$src$error$$ = $exponentialBackoff$$module$src$exponential_backoff$$();
  return $reportingBackoff$$module$src$error$$($work$jscomp$1$$);
}
function $tryJsonStringify$$module$src$error$$($value$jscomp$117$$) {
  try {
    return JSON.stringify($value$jscomp$117$$);
  } catch ($e$jscomp$40$$) {
    return String($value$jscomp$117$$);
  }
}
var $detectedJsEngine$$module$src$error$$;
function $onError$$module$src$error$$($message$jscomp$29$$, $filename$$, $line$$, $col$$, $error$jscomp$15$$) {
  var $$jscomp$this$jscomp$2$$ = this;
  this && this.document && $makeBodyVisibleRecovery$$module$src$style_installer$$(this.document);
  if (!$getMode$$module$src$mode$$().development) {
    var $hasNonAmpJs$$ = !1;
    try {
      $hasNonAmpJs$$ = $detectNonAmpJs$$module$src$error$$();
    } catch ($ignore$jscomp$1$$) {
    }
    if (!($hasNonAmpJs$$ && 0.01 < Math.random())) {
      var $data$jscomp$34$$ = $getErrorReportData$$module$src$error$$($message$jscomp$29$$, $filename$$, $line$$, $col$$, $error$jscomp$15$$, $hasNonAmpJs$$);
      $data$jscomp$34$$ && $reportingBackoff$$module$src$error$$(function() {
        return $reportErrorToServerOrViewer$$module$src$error$$($$jscomp$this$jscomp$2$$, $data$jscomp$34$$);
      });
    }
  }
}
function $reportErrorToServerOrViewer$$module$src$error$$($win$jscomp$91$$, $data$jscomp$35$$) {
  return $maybeReportErrorToViewer$$module$src$error$$($win$jscomp$91$$, $data$jscomp$35$$).then(function($win$jscomp$91$$) {
    if (!$win$jscomp$91$$) {
      var $reportedErrorToViewer$$ = new XMLHttpRequest;
      $reportedErrorToViewer$$.open("POST", $urls$$module$src$config$$.errorReporting, !0);
      $reportedErrorToViewer$$.send(JSON.stringify($data$jscomp$35$$));
    }
  });
}
function $maybeReportErrorToViewer$$module$src$error$$($win$jscomp$92$$, $data$jscomp$36$$) {
  var $ampdocService$$ = $getService$$module$src$service$$($win$jscomp$92$$);
  if (!$ampdocService$$.isSingleDoc()) {
    return Promise.resolve(!1);
  }
  var $ampdocSingle$$ = $ampdocService$$.getAmpDoc(), $htmlElement$$ = $ampdocSingle$$.getRootNode().documentElement, $docOptedIn$$ = $htmlElement$$.hasAttribute("report-errors-to-viewer");
  if (!$docOptedIn$$) {
    return Promise.resolve(!1);
  }
  var $viewer$$ = $getServiceForDoc$$module$src$service$$($ampdocSingle$$);
  return $viewer$$.hasCapability("errorReporter") ? $viewer$$.isTrustedViewer().then(function($win$jscomp$92$$) {
    if (!$win$jscomp$92$$) {
      return !1;
    }
    $viewer$$.sendMessage("error", $dict$$module$src$utils$object$$({m:$data$jscomp$36$$.m, a:$data$jscomp$36$$.a, s:$data$jscomp$36$$.s, el:$data$jscomp$36$$.el, v:$data$jscomp$36$$.v, jse:$data$jscomp$36$$.jse}));
    return !0;
  }) : Promise.resolve(!1);
}
function $getErrorReportData$$module$src$error$$($message$jscomp$31$$, $JSCompiler_element$jscomp$inline_188_filename$jscomp$1$$, $line$jscomp$1$$, $col$jscomp$1$$, $error$jscomp$17$$, $JSCompiler_inline_result$jscomp$40_JSCompiler_win$jscomp$inline_182_JSCompiler_win$jscomp$inline_184_hasNonAmpJs$jscomp$1$$) {
  var $JSCompiler_message$jscomp$inline_179_data$jscomp$37$$ = $message$jscomp$31$$;
  $error$jscomp$17$$ && ($JSCompiler_message$jscomp$inline_179_data$jscomp$37$$ = $error$jscomp$17$$.message ? $error$jscomp$17$$.message : String($error$jscomp$17$$));
  $JSCompiler_message$jscomp$inline_179_data$jscomp$37$$ || ($JSCompiler_message$jscomp$inline_179_data$jscomp$37$$ = "Unknown error");
  $message$jscomp$31$$ = $JSCompiler_message$jscomp$inline_179_data$jscomp$37$$;
  var $expected$$ = !(!$error$jscomp$17$$ || !$error$jscomp$17$$.expected);
  if (!/_reported_/.test($message$jscomp$31$$) && "CANCELLED" != $message$jscomp$31$$) {
    var $detachedWindow$$ = !(self && self.window), $throttleBase$$ = Math.random();
    if (-1 != $message$jscomp$31$$.indexOf("Failed to load:") || "Script error." == $message$jscomp$31$$ || $detachedWindow$$) {
      if ($expected$$ = !0, 0.001 < $throttleBase$$) {
        return;
      }
    }
    var $isUserError$$ = 0 <= $message$jscomp$31$$.indexOf("\u200b\u200b\u200b");
    if (!($isUserError$$ && 0.1 < $throttleBase$$)) {
      $JSCompiler_message$jscomp$inline_179_data$jscomp$37$$ = Object.create(null);
      $JSCompiler_message$jscomp$inline_179_data$jscomp$37$$.v = $getMode$$module$src$mode$$().rtvVersion;
      $JSCompiler_message$jscomp$inline_179_data$jscomp$37$$.noAmp = $JSCompiler_inline_result$jscomp$40_JSCompiler_win$jscomp$inline_182_JSCompiler_win$jscomp$inline_184_hasNonAmpJs$jscomp$1$$ ? "1" : "0";
      $JSCompiler_message$jscomp$inline_179_data$jscomp$37$$.m = $message$jscomp$31$$.replace("\u200b\u200b\u200b", "");
      $JSCompiler_message$jscomp$inline_179_data$jscomp$37$$.a = $isUserError$$ ? "1" : "0";
      $JSCompiler_message$jscomp$inline_179_data$jscomp$37$$.ex = $expected$$ ? "1" : "0";
      $JSCompiler_message$jscomp$inline_179_data$jscomp$37$$.dw = $detachedWindow$$ ? "1" : "0";
      var $runtime$$ = "1p";
      self.context && self.context.location ? ($JSCompiler_message$jscomp$inline_179_data$jscomp$37$$["3p"] = "1", $runtime$$ = "3p") : $getMode$$module$src$mode$$().runtime && ($runtime$$ = $getMode$$module$src$mode$$().runtime);
      $getMode$$module$src$mode$$().singlePassType && ($JSCompiler_message$jscomp$inline_179_data$jscomp$37$$.spt = $getMode$$module$src$mode$$().singlePassType);
      $JSCompiler_message$jscomp$inline_179_data$jscomp$37$$.rt = $runtime$$;
      "inabox" === $runtime$$ && ($JSCompiler_message$jscomp$inline_179_data$jscomp$37$$.adid = $getMode$$module$src$mode$$().a4aId);
      $JSCompiler_inline_result$jscomp$40_JSCompiler_win$jscomp$inline_182_JSCompiler_win$jscomp$inline_184_hasNonAmpJs$jscomp$1$$ = self;
      $JSCompiler_message$jscomp$inline_179_data$jscomp$37$$.ca = $JSCompiler_inline_result$jscomp$40_JSCompiler_win$jscomp$inline_182_JSCompiler_win$jscomp$inline_184_hasNonAmpJs$jscomp$1$$.AMP_CONFIG && $JSCompiler_inline_result$jscomp$40_JSCompiler_win$jscomp$inline_182_JSCompiler_win$jscomp$inline_184_hasNonAmpJs$jscomp$1$$.AMP_CONFIG.canary ? "1" : "0";
      $JSCompiler_inline_result$jscomp$40_JSCompiler_win$jscomp$inline_182_JSCompiler_win$jscomp$inline_184_hasNonAmpJs$jscomp$1$$ = self;
      $JSCompiler_message$jscomp$inline_179_data$jscomp$37$$.bt = $JSCompiler_inline_result$jscomp$40_JSCompiler_win$jscomp$inline_182_JSCompiler_win$jscomp$inline_184_hasNonAmpJs$jscomp$1$$.AMP_CONFIG && $JSCompiler_inline_result$jscomp$40_JSCompiler_win$jscomp$inline_182_JSCompiler_win$jscomp$inline_184_hasNonAmpJs$jscomp$1$$.AMP_CONFIG.type ? $JSCompiler_inline_result$jscomp$40_JSCompiler_win$jscomp$inline_182_JSCompiler_win$jscomp$inline_184_hasNonAmpJs$jscomp$1$$.AMP_CONFIG.type : "unknown";
      self.location.ancestorOrigins && self.location.ancestorOrigins[0] && ($JSCompiler_message$jscomp$inline_179_data$jscomp$37$$.or = self.location.ancestorOrigins[0]);
      self.viewerState && ($JSCompiler_message$jscomp$inline_179_data$jscomp$37$$.vs = self.viewerState);
      self.parent && self.parent != self && ($JSCompiler_message$jscomp$inline_179_data$jscomp$37$$.iem = "1");
      if (self.AMP && self.AMP.viewer) {
        var $resolvedViewerUrl$$ = self.AMP.viewer.getResolvedViewerUrl(), $messagingOrigin$$ = self.AMP.viewer.maybeGetMessagingOrigin();
        $resolvedViewerUrl$$ && ($JSCompiler_message$jscomp$inline_179_data$jscomp$37$$.rvu = $resolvedViewerUrl$$);
        $messagingOrigin$$ && ($JSCompiler_message$jscomp$inline_179_data$jscomp$37$$.mso = $messagingOrigin$$);
      }
      $detectedJsEngine$$module$src$error$$ || ($detectedJsEngine$$module$src$error$$ = $detectJsEngineFromStack$$module$src$error$$());
      $JSCompiler_message$jscomp$inline_179_data$jscomp$37$$.jse = $detectedJsEngine$$module$src$error$$;
      var $exps$$ = [];
      $JSCompiler_inline_result$jscomp$40_JSCompiler_win$jscomp$inline_182_JSCompiler_win$jscomp$inline_184_hasNonAmpJs$jscomp$1$$ = self.__AMP__EXPERIMENT_TOGGLES || null;
      for (var $exp$$ in $JSCompiler_inline_result$jscomp$40_JSCompiler_win$jscomp$inline_182_JSCompiler_win$jscomp$inline_184_hasNonAmpJs$jscomp$1$$) {
        $exps$$.push($exp$$ + "=" + ($JSCompiler_inline_result$jscomp$40_JSCompiler_win$jscomp$inline_182_JSCompiler_win$jscomp$inline_184_hasNonAmpJs$jscomp$1$$[$exp$$] ? "1" : "0"));
      }
      $JSCompiler_message$jscomp$inline_179_data$jscomp$37$$.exps = $exps$$.join(",");
      $error$jscomp$17$$ ? ($JSCompiler_message$jscomp$inline_179_data$jscomp$37$$.el = $error$jscomp$17$$.associatedElement ? $error$jscomp$17$$.associatedElement.tagName : "u", $error$jscomp$17$$.args && ($JSCompiler_message$jscomp$inline_179_data$jscomp$37$$.args = JSON.stringify($error$jscomp$17$$.args)), $isUserError$$ || $error$jscomp$17$$.ignoreStack || !$error$jscomp$17$$.stack || ($JSCompiler_message$jscomp$inline_179_data$jscomp$37$$.s = $error$jscomp$17$$.stack), $error$jscomp$17$$.message && 
      ($error$jscomp$17$$.message += " _reported_")) : ($JSCompiler_message$jscomp$inline_179_data$jscomp$37$$.f = $JSCompiler_element$jscomp$inline_188_filename$jscomp$1$$ || "", $JSCompiler_message$jscomp$inline_179_data$jscomp$37$$.l = $line$jscomp$1$$ || "", $JSCompiler_message$jscomp$inline_179_data$jscomp$37$$.c = $col$jscomp$1$$ || "");
      $JSCompiler_message$jscomp$inline_179_data$jscomp$37$$.r = self.document.referrer;
      $JSCompiler_message$jscomp$inline_179_data$jscomp$37$$.ae = $accumulatedErrorMessages$$module$src$error$$.join(",");
      $JSCompiler_message$jscomp$inline_179_data$jscomp$37$$.fr = self.location.originalHash || self.location.hash;
      $JSCompiler_element$jscomp$inline_188_filename$jscomp$1$$ = $message$jscomp$31$$;
      25 <= $accumulatedErrorMessages$$module$src$error$$.length && $accumulatedErrorMessages$$module$src$error$$.splice(0, $accumulatedErrorMessages$$module$src$error$$.length - 25 + 1);
      $accumulatedErrorMessages$$module$src$error$$.push($JSCompiler_element$jscomp$inline_188_filename$jscomp$1$$);
      return $JSCompiler_message$jscomp$inline_179_data$jscomp$37$$;
    }
  }
}
function $detectNonAmpJs$$module$src$error$$() {
  for (var $scripts$jscomp$2$$ = self.document.querySelectorAll("script[src]"), $i$jscomp$50$$ = 0; $i$jscomp$50$$ < $scripts$jscomp$2$$.length; $i$jscomp$50$$++) {
    if (!$isProxyOrigin$$module$src$url$$($scripts$jscomp$2$$[$i$jscomp$50$$].src.toLowerCase())) {
      return !0;
    }
  }
  return !1;
}
function $detectJsEngineFromStack$$module$src$error$$() {
  function $Fn$$() {
  }
  $Fn$$.prototype.t = function() {
    throw Error("message");
  };
  var $object$jscomp$1_stack$jscomp$1$$ = new $Fn$$;
  try {
    $object$jscomp$1_stack$jscomp$1$$.t();
  } catch ($e$jscomp$41$$) {
    $object$jscomp$1_stack$jscomp$1$$ = $e$jscomp$41$$.stack;
    if ($startsWith$$module$src$string$$($object$jscomp$1_stack$jscomp$1$$, "t@")) {
      return "Safari";
    }
    if (-1 < $object$jscomp$1_stack$jscomp$1$$.indexOf(".prototype.t@")) {
      return "Firefox";
    }
    var $last$$ = $object$jscomp$1_stack$jscomp$1$$.split("\n").pop();
    if (/\bat .* \(/i.test($last$$)) {
      return "IE";
    }
    if ($startsWith$$module$src$string$$($object$jscomp$1_stack$jscomp$1$$, "Error: message")) {
      return "Chrome";
    }
  }
  return "unknown";
}
;(function() {
  $logConstructor$$module$src$log$$ = $Log$$module$src$log$$;
  $dev$$module$src$log$$();
  $user$$module$src$log$$();
})();
(function($fn$$) {
  self.reportError = $fn$$;
})(function($error$jscomp$14$$, $opt_associatedElement$jscomp$1$$) {
  try {
    if ($error$jscomp$14$$) {
      if (void 0 !== $error$jscomp$14$$.message) {
        $error$jscomp$14$$ = $duplicateErrorIfNecessary$$module$src$log$$($error$jscomp$14$$);
      } else {
        var $origError$$ = $error$jscomp$14$$;
        $error$jscomp$14$$ = Error($tryJsonStringify$$module$src$error$$($origError$$));
        $error$jscomp$14$$.origError = $origError$$;
      }
    } else {
      $error$jscomp$14$$ = Error("Unknown error");
    }
    if ($error$jscomp$14$$.reported) {
      return $error$jscomp$14$$;
    }
    $error$jscomp$14$$.reported = !0;
    var $element$jscomp$66$$ = $opt_associatedElement$jscomp$1$$ || $error$jscomp$14$$.associatedElement;
    $element$jscomp$66$$ && $element$jscomp$66$$.classList && ($element$jscomp$66$$.classList.add("i-amphtml-error"), $getMode$$module$src$mode$$().development && ($element$jscomp$66$$.classList.add("i-amphtml-element-error"), $element$jscomp$66$$.setAttribute("error-message", $error$jscomp$14$$.message)));
    if (self.console) {
      var $output$jscomp$3$$ = console.error || console.log;
      $error$jscomp$14$$.messageArray ? $output$jscomp$3$$.apply(console, $error$jscomp$14$$.messageArray) : $element$jscomp$66$$ ? $output$jscomp$3$$.call(console, $error$jscomp$14$$.message, $element$jscomp$66$$) : $output$jscomp$3$$.call(console, $error$jscomp$14$$.message);
    }
    $element$jscomp$66$$ && $element$jscomp$66$$.$dispatchCustomEventForTesting$ && $element$jscomp$66$$.$dispatchCustomEventForTesting$("amp:error", $error$jscomp$14$$.message);
    $onError$$module$src$error$$.call(void 0, void 0, void 0, void 0, void 0, $error$jscomp$14$$);
  } catch ($errorReportingError$$) {
    setTimeout(function() {
      throw $errorReportingError$$;
    });
  }
  return $error$jscomp$14$$;
});
(function($win$jscomp$11$$) {
  $win$jscomp$11$$.document.documentElement.addEventListener("click", $handleClick$$module$ads$alp$handler$$);
  $win$jscomp$11$$.document.documentElement.addEventListener("touchstart", $warmupDynamic$$module$ads$alp$handler$$);
})(window);
(function($win$jscomp$14$$) {
  (new $win$jscomp$14$$.Image).src = $urls$$module$src$config$$.cdn + "/preconnect.gif";
  var $linkRel$$ = document.createElement("link");
  $linkRel$$.rel = "preload";
  $linkRel$$.setAttribute("as", "script");
  $linkRel$$.href = $urls$$module$src$config$$.cdn + "/v0.js";
  $getHeadOrFallback$$module$ads$alp$handler$$($win$jscomp$14$$.document).appendChild($linkRel$$);
})(window);
})();
//# sourceMappingURL=alp.js.map

