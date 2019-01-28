(function(){var $JSCompiler_prototypeAlias$$;
function $layoutRectLtwh$$module$src$layout_rect$$($left$jscomp$2$$, $top$jscomp$2$$, $width$jscomp$12$$, $height$jscomp$11$$) {
  return {left:$left$jscomp$2$$, top:$top$jscomp$2$$, width:$width$jscomp$12$$, height:$height$jscomp$11$$, bottom:$top$jscomp$2$$ + $height$jscomp$11$$, right:$left$jscomp$2$$ + $width$jscomp$12$$, x:$left$jscomp$2$$, y:$top$jscomp$2$$};
}
function $layoutRectFromDomRect$$module$src$layout_rect$$($rect$$) {
  return $layoutRectLtwh$$module$src$layout_rect$$(Number($rect$$.left), Number($rect$$.top), Number($rect$$.width), Number($rect$$.height));
}
;function $tryDecodeUriComponent_$$module$src$url_try_decode_uri_component$$($component$jscomp$4$$, $fallback$$) {
  $fallback$$ = void 0 === $fallback$$ ? "" : $fallback$$;
  try {
    return decodeURIComponent($component$jscomp$4$$);
  } catch ($e$jscomp$7$$) {
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
    var $JSCompiler_temp$jscomp$13_JSCompiler_win$jscomp$inline_39$$ = $win$$.AMP_MODE;
  } else {
    $JSCompiler_temp$jscomp$13_JSCompiler_win$jscomp$inline_39$$ = $win$$;
    var $JSCompiler_AMP_CONFIG$jscomp$inline_40_JSCompiler_singlePassType$jscomp$inline_47$$ = self.AMP_CONFIG || {}, $JSCompiler_runningTests$jscomp$inline_44$$ = !!$JSCompiler_AMP_CONFIG$jscomp$inline_40_JSCompiler_singlePassType$jscomp$inline_47$$.test || !1, $JSCompiler_hashQuery$jscomp$inline_46$$ = $parseQueryString_$$module$src$url_parse_query_string$$($JSCompiler_temp$jscomp$13_JSCompiler_win$jscomp$inline_39$$.location.originalHash || $JSCompiler_temp$jscomp$13_JSCompiler_win$jscomp$inline_39$$.location.hash);
    $JSCompiler_AMP_CONFIG$jscomp$inline_40_JSCompiler_singlePassType$jscomp$inline_47$$ = $JSCompiler_AMP_CONFIG$jscomp$inline_40_JSCompiler_singlePassType$jscomp$inline_47$$.spt;
    var $JSCompiler_searchQuery$jscomp$inline_48$$ = $parseQueryString_$$module$src$url_parse_query_string$$($JSCompiler_temp$jscomp$13_JSCompiler_win$jscomp$inline_39$$.location.search);
    $rtvVersion$$module$src$mode$$ || ($rtvVersion$$module$src$mode$$ = $JSCompiler_temp$jscomp$13_JSCompiler_win$jscomp$inline_39$$.AMP_CONFIG && $JSCompiler_temp$jscomp$13_JSCompiler_win$jscomp$inline_39$$.AMP_CONFIG.v ? $JSCompiler_temp$jscomp$13_JSCompiler_win$jscomp$inline_39$$.AMP_CONFIG.v : "011901181729101");
    $JSCompiler_temp$jscomp$13_JSCompiler_win$jscomp$inline_39$$ = $win$$.AMP_MODE = {localDev:!1, development:!("1" != $JSCompiler_hashQuery$jscomp$inline_46$$.development && !$JSCompiler_temp$jscomp$13_JSCompiler_win$jscomp$inline_39$$.AMP_DEV_MODE), examiner:"2" == $JSCompiler_hashQuery$jscomp$inline_46$$.development, filter:$JSCompiler_hashQuery$jscomp$inline_46$$.filter, geoOverride:$JSCompiler_hashQuery$jscomp$inline_46$$["amp-geo"], minified:!0, lite:void 0 != $JSCompiler_searchQuery$jscomp$inline_48$$.amp_lite, 
    test:$JSCompiler_runningTests$jscomp$inline_44$$, log:$JSCompiler_hashQuery$jscomp$inline_46$$.log, version:"1901181729101", rtvVersion:$rtvVersion$$module$src$mode$$, singlePassType:$JSCompiler_AMP_CONFIG$jscomp$inline_40_JSCompiler_singlePassType$jscomp$inline_47$$};
  }
  return $JSCompiler_temp$jscomp$13_JSCompiler_win$jscomp$inline_39$$;
}
;function $setReportError$$module$src$log$$() {
  var $fn$$ = $reportError$$module$src$error$$;
  self.reportError = $fn$$;
}
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
$JSCompiler_prototypeAlias$$.fine = function($tag$jscomp$2$$, $var_args$jscomp$48$$) {
  4 <= this.$level_$ && $JSCompiler_StaticMethods_msg_$$(this, "FINE", Array.prototype.slice.call(arguments, 1));
};
$JSCompiler_prototypeAlias$$.info = function($tag$jscomp$3$$, $var_args$jscomp$49$$) {
  3 <= this.$level_$ && $JSCompiler_StaticMethods_msg_$$(this, "INFO", Array.prototype.slice.call(arguments, 1));
};
$JSCompiler_prototypeAlias$$.warn = function($tag$jscomp$4$$, $var_args$jscomp$50$$) {
  2 <= this.$level_$ && $JSCompiler_StaticMethods_msg_$$(this, "WARN", Array.prototype.slice.call(arguments, 1));
};
$JSCompiler_prototypeAlias$$.$error_$ = function($tag$jscomp$5$$, $var_args$jscomp$51$$) {
  if (1 <= this.$level_$) {
    $JSCompiler_StaticMethods_msg_$$(this, "ERROR", Array.prototype.slice.call(arguments, 1));
  } else {
    var $error$jscomp$2$$ = $createErrorVargs$$module$src$log$$.apply(null, Array.prototype.slice.call(arguments, 1));
    $JSCompiler_StaticMethods_prepareError_$$(this, $error$jscomp$2$$);
    return $error$jscomp$2$$;
  }
};
$JSCompiler_prototypeAlias$$.error = function($tag$jscomp$6$$, $var_args$jscomp$52$$) {
  var $error$jscomp$3$$ = this.$error_$.apply(this, arguments);
  $error$jscomp$3$$ && ($error$jscomp$3$$.name = $tag$jscomp$6$$ || $error$jscomp$3$$.name, self.reportError($error$jscomp$3$$));
};
$JSCompiler_prototypeAlias$$.expectedError = function($unusedTag$$, $var_args$jscomp$53$$) {
  var $error$jscomp$4$$ = this.$error_$.apply(this, arguments);
  $error$jscomp$4$$ && ($error$jscomp$4$$.expected = !0, self.reportError($error$jscomp$4$$));
};
$JSCompiler_prototypeAlias$$.createError = function($var_args$jscomp$54$$) {
  var $error$jscomp$5$$ = $createErrorVargs$$module$src$log$$.apply(null, arguments);
  $JSCompiler_StaticMethods_prepareError_$$(this, $error$jscomp$5$$);
  return $error$jscomp$5$$;
};
$JSCompiler_prototypeAlias$$.createExpectedError = function($var_args$jscomp$55$$) {
  var $error$jscomp$6$$ = $createErrorVargs$$module$src$log$$.apply(null, arguments);
  $JSCompiler_StaticMethods_prepareError_$$(this, $error$jscomp$6$$);
  $error$jscomp$6$$.expected = !0;
  return $error$jscomp$6$$;
};
$JSCompiler_prototypeAlias$$.assert = function($shouldBeTrueish$$, $opt_message$jscomp$7$$, $var_args$jscomp$56$$) {
  var $firstElement$$;
  if (!$shouldBeTrueish$$) {
    var $splitMessage$$ = ($opt_message$jscomp$7$$ || "Assertion failed").split("%s"), $JSCompiler_val$jscomp$inline_54_JSCompiler_val$jscomp$inline_56_first$jscomp$4$$ = $splitMessage$$.shift(), $formatted$$ = $JSCompiler_val$jscomp$inline_54_JSCompiler_val$jscomp$inline_56_first$jscomp$4$$, $messageArray$$ = [], $e$jscomp$8_i$jscomp$4$$ = 2;
    for ("" != $JSCompiler_val$jscomp$inline_54_JSCompiler_val$jscomp$inline_56_first$jscomp$4$$ && $messageArray$$.push($JSCompiler_val$jscomp$inline_54_JSCompiler_val$jscomp$inline_56_first$jscomp$4$$); 0 < $splitMessage$$.length;) {
      var $nextConstant$$ = $splitMessage$$.shift(), $val$$ = arguments[$e$jscomp$8_i$jscomp$4$$++];
      $val$$ && $val$$.tagName && ($firstElement$$ = $val$$);
      $messageArray$$.push($val$$);
      $JSCompiler_val$jscomp$inline_54_JSCompiler_val$jscomp$inline_56_first$jscomp$4$$ = $nextConstant$$.trim();
      "" != $JSCompiler_val$jscomp$inline_54_JSCompiler_val$jscomp$inline_56_first$jscomp$4$$ && $messageArray$$.push($JSCompiler_val$jscomp$inline_54_JSCompiler_val$jscomp$inline_56_first$jscomp$4$$);
      $JSCompiler_val$jscomp$inline_54_JSCompiler_val$jscomp$inline_56_first$jscomp$4$$ = $val$$;
      $formatted$$ += ($JSCompiler_val$jscomp$inline_54_JSCompiler_val$jscomp$inline_56_first$jscomp$4$$ && 1 == $JSCompiler_val$jscomp$inline_54_JSCompiler_val$jscomp$inline_56_first$jscomp$4$$.nodeType ? $JSCompiler_val$jscomp$inline_54_JSCompiler_val$jscomp$inline_56_first$jscomp$4$$.tagName.toLowerCase() + ($JSCompiler_val$jscomp$inline_54_JSCompiler_val$jscomp$inline_56_first$jscomp$4$$.id ? "#" + $JSCompiler_val$jscomp$inline_54_JSCompiler_val$jscomp$inline_56_first$jscomp$4$$.id : "") : $JSCompiler_val$jscomp$inline_54_JSCompiler_val$jscomp$inline_56_first$jscomp$4$$) + 
      $nextConstant$$;
    }
    $e$jscomp$8_i$jscomp$4$$ = Error($formatted$$);
    $e$jscomp$8_i$jscomp$4$$.fromAssert = !0;
    $e$jscomp$8_i$jscomp$4$$.associatedElement = $firstElement$$;
    $e$jscomp$8_i$jscomp$4$$.messageArray = $messageArray$$;
    $JSCompiler_StaticMethods_prepareError_$$(this, $e$jscomp$8_i$jscomp$4$$);
    self.reportError($e$jscomp$8_i$jscomp$4$$);
    throw $e$jscomp$8_i$jscomp$4$$;
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
$JSCompiler_prototypeAlias$$.assertEnumValue = function($JSCompiler_inline_result$jscomp$15_enumObj$jscomp$1$$, $s$jscomp$3$$, $opt_enumName$$) {
  a: {
    for (var $JSCompiler_k$jscomp$inline_60$$ in $JSCompiler_inline_result$jscomp$15_enumObj$jscomp$1$$) {
      if ($JSCompiler_inline_result$jscomp$15_enumObj$jscomp$1$$[$JSCompiler_k$jscomp$inline_60$$] === $s$jscomp$3$$) {
        $JSCompiler_inline_result$jscomp$15_enumObj$jscomp$1$$ = !0;
        break a;
      }
    }
    $JSCompiler_inline_result$jscomp$15_enumObj$jscomp$1$$ = !1;
  }
  if ($JSCompiler_inline_result$jscomp$15_enumObj$jscomp$1$$) {
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
  var $stack$$ = $error$jscomp$8$$.stack, $e$jscomp$9$$ = Error($error$jscomp$8$$.message), $prop$jscomp$4$$;
  for ($prop$jscomp$4$$ in $error$jscomp$8$$) {
    $e$jscomp$9$$[$prop$jscomp$4$$] = $error$jscomp$8$$[$prop$jscomp$4$$];
  }
  $e$jscomp$9$$.stack = $stack$$;
  return $e$jscomp$9$$;
}
function $createErrorVargs$$module$src$log$$($var_args$jscomp$57$$) {
  for (var $error$jscomp$9$$ = null, $message$jscomp$27$$ = "", $i$jscomp$5$$ = 0; $i$jscomp$5$$ < arguments.length; $i$jscomp$5$$++) {
    var $arg$jscomp$6$$ = arguments[$i$jscomp$5$$];
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
;function $dict$$module$src$utils$object$$($opt_initial$jscomp$1$$) {
  return $opt_initial$jscomp$1$$ || {};
}
;function $startsWith$$module$src$string$$($string$jscomp$6$$, $prefix$jscomp$2$$) {
  return $prefix$jscomp$2$$.length > $string$jscomp$6$$.length ? !1 : 0 == $string$jscomp$6$$.lastIndexOf($prefix$jscomp$2$$, 0);
}
;var $propertyNameCache$$module$src$style$$, $vendorPrefixes$$module$src$style$$ = "Webkit webkit Moz moz ms O o".split(" ");
function $getVendorJsPropertyName$$module$src$style$$($style$jscomp$1$$, $camelCase$jscomp$1$$, $opt_bypassCache$$) {
  if ($startsWith$$module$src$string$$($camelCase$jscomp$1$$, "--")) {
    return $camelCase$jscomp$1$$;
  }
  $propertyNameCache$$module$src$style$$ || ($propertyNameCache$$module$src$style$$ = Object.create(null));
  var $propertyName$jscomp$9$$ = $propertyNameCache$$module$src$style$$[$camelCase$jscomp$1$$];
  if (!$propertyName$jscomp$9$$ || $opt_bypassCache$$) {
    $propertyName$jscomp$9$$ = $camelCase$jscomp$1$$;
    if (void 0 === $style$jscomp$1$$[$camelCase$jscomp$1$$]) {
      var $JSCompiler_inline_result$jscomp$20_titleCase$jscomp$1$$ = $camelCase$jscomp$1$$.charAt(0).toUpperCase() + $camelCase$jscomp$1$$.slice(1);
      a: {
        for (var $JSCompiler_i$jscomp$inline_70$$ = 0; $JSCompiler_i$jscomp$inline_70$$ < $vendorPrefixes$$module$src$style$$.length; $JSCompiler_i$jscomp$inline_70$$++) {
          var $JSCompiler_propertyName$jscomp$inline_71$$ = $vendorPrefixes$$module$src$style$$[$JSCompiler_i$jscomp$inline_70$$] + $JSCompiler_inline_result$jscomp$20_titleCase$jscomp$1$$;
          if (void 0 !== $style$jscomp$1$$[$JSCompiler_propertyName$jscomp$inline_71$$]) {
            $JSCompiler_inline_result$jscomp$20_titleCase$jscomp$1$$ = $JSCompiler_propertyName$jscomp$inline_71$$;
            break a;
          }
        }
        $JSCompiler_inline_result$jscomp$20_titleCase$jscomp$1$$ = "";
      }
      var $prefixedPropertyName$$ = $JSCompiler_inline_result$jscomp$20_titleCase$jscomp$1$$;
      void 0 !== $style$jscomp$1$$[$prefixedPropertyName$$] && ($propertyName$jscomp$9$$ = $prefixedPropertyName$$);
    }
    $opt_bypassCache$$ || ($propertyNameCache$$module$src$style$$[$camelCase$jscomp$1$$] = $propertyName$jscomp$9$$);
  }
  return $propertyName$jscomp$9$$;
}
function $setImportantStyles$$module$src$style$$($element$jscomp$10_style$jscomp$2$$) {
  var $styles$$ = {"pointer-events":"none"};
  $element$jscomp$10_style$jscomp$2$$ = $element$jscomp$10_style$jscomp$2$$.style;
  for (var $k$jscomp$1$$ in $styles$$) {
    $element$jscomp$10_style$jscomp$2$$.setProperty($getVendorJsPropertyName$$module$src$style$$($element$jscomp$10_style$jscomp$2$$, $k$jscomp$1$$), $styles$$[$k$jscomp$1$$].toString(), "important");
  }
}
function $setStyle$$module$src$style$$($element$jscomp$11$$, $property$jscomp$4_propertyName$jscomp$10$$, $value$jscomp$89$$) {
  var $opt_units$$;
  ($property$jscomp$4_propertyName$jscomp$10$$ = $getVendorJsPropertyName$$module$src$style$$($element$jscomp$11$$.style, $property$jscomp$4_propertyName$jscomp$10$$, void 0)) && ($element$jscomp$11$$.style[$property$jscomp$4_propertyName$jscomp$10$$] = $opt_units$$ ? $value$jscomp$89$$ + $opt_units$$ : $value$jscomp$89$$);
}
function $setStyles$$module$src$style$$($element$jscomp$13$$, $styles$jscomp$1$$) {
  for (var $k$jscomp$2$$ in $styles$jscomp$1$$) {
    $setStyle$$module$src$style$$($element$jscomp$13$$, $k$jscomp$2$$, $styles$jscomp$1$$[$k$jscomp$2$$]);
  }
}
function $resetStyles$$module$src$style$$($element$jscomp$15$$, $properties$$) {
  for (var $i$jscomp$9$$ = 0; $i$jscomp$9$$ < $properties$$.length; $i$jscomp$9$$++) {
    $setStyle$$module$src$style$$($element$jscomp$15$$, $properties$$[$i$jscomp$9$$], null);
  }
}
;function $centerFrameUnderVsyncMutate$$module$src$full_overlay_frame_helper$$($iframe$$, $iframeRect$$, $viewportSize$$) {
  var $transitionTimeMs$$ = 150, $translateX$$ = $viewportSize$$.width / 2 - $iframeRect$$.width / 2 - $iframeRect$$.left + "px", $translateY$$ = $viewportSize$$.height / 2 - $iframeRect$$.height / 2 - $iframeRect$$.top + "px", $JSCompiler_temp_const$jscomp$26$$ = $iframeRect$$.top + "px", $JSCompiler_temp_const$jscomp$25$$ = $viewportSize$$.width - ($iframeRect$$.left + $iframeRect$$.width) + "px", $JSCompiler_temp_const$jscomp$24$$ = $iframeRect$$.left + "px", $JSCompiler_temp_const$jscomp$23$$ = 
  $viewportSize$$.height - ($iframeRect$$.top + $iframeRect$$.height) + "px", $JSCompiler_temp_const$jscomp$22$$ = $iframeRect$$.height + "px", $JSCompiler_temp_const$jscomp$21$$ = $iframeRect$$.width + "px";
  var $JSCompiler_inline_result$jscomp$27_JSCompiler_x$jscomp$inline_73$$ = $translateX$$;
  var $JSCompiler_opt_y$jscomp$inline_74$$ = $translateY$$;
  "number" == typeof $JSCompiler_inline_result$jscomp$27_JSCompiler_x$jscomp$inline_73$$ && ($JSCompiler_inline_result$jscomp$27_JSCompiler_x$jscomp$inline_73$$ += "px");
  void 0 === $JSCompiler_opt_y$jscomp$inline_74$$ ? $JSCompiler_inline_result$jscomp$27_JSCompiler_x$jscomp$inline_73$$ = "translate(" + $JSCompiler_inline_result$jscomp$27_JSCompiler_x$jscomp$inline_73$$ + ")" : ("number" == typeof $JSCompiler_opt_y$jscomp$inline_74$$ && ($JSCompiler_opt_y$jscomp$inline_74$$ += "px"), $JSCompiler_inline_result$jscomp$27_JSCompiler_x$jscomp$inline_73$$ = "translate(" + $JSCompiler_inline_result$jscomp$27_JSCompiler_x$jscomp$inline_73$$ + ", " + $JSCompiler_opt_y$jscomp$inline_74$$ + 
  ")");
  $setStyles$$module$src$style$$($iframe$$, {position:"fixed", top:$JSCompiler_temp_const$jscomp$26$$, right:$JSCompiler_temp_const$jscomp$25$$, left:$JSCompiler_temp_const$jscomp$24$$, bottom:$JSCompiler_temp_const$jscomp$23$$, height:$JSCompiler_temp_const$jscomp$22$$, width:$JSCompiler_temp_const$jscomp$21$$, transition:"transform " + $transitionTimeMs$$ + "ms ease", transform:$JSCompiler_inline_result$jscomp$27_JSCompiler_x$jscomp$inline_73$$, margin:0});
}
;function $restrictedVsync$$module$ads$inabox$util$$($win$jscomp$7$$, $task$$, $opt_state$$) {
  $win$jscomp$7$$.requestAnimationFrame(function() {
    $task$$.measure && $task$$.measure($opt_state$$);
    $task$$.mutate && $task$$.mutate($opt_state$$);
  });
}
function $timer$$module$ads$inabox$util$$($callback$jscomp$51$$) {
  var $timeMs$$ = 200;
  setTimeout($callback$jscomp$51$$, $timeMs$$);
}
;function $module$ads$inabox$frame_overlay_helper$expandFrame$$($win$jscomp$8$$, $iframe$jscomp$3$$, $onFinish$$) {
  $restrictedVsync$$module$ads$inabox$util$$($win$jscomp$8$$, {measure:function($onFinish$$) {
    $onFinish$$.viewportSize = {width:$win$jscomp$8$$.innerWidth, height:$win$jscomp$8$$.innerHeight};
    $onFinish$$.rect = $layoutRectFromDomRect$$module$src$layout_rect$$($iframe$jscomp$3$$.getBoundingClientRect());
  }, mutate:function($state$jscomp$1$$) {
    var $$jscomp$destructuring$var5$$ = $state$jscomp$1$$.viewportSize, $expandedRect$$ = $layoutRectLtwh$$module$src$layout_rect$$(0, 0, $$jscomp$destructuring$var5$$.width, $$jscomp$destructuring$var5$$.height);
    $centerFrameUnderVsyncMutate$$module$src$full_overlay_frame_helper$$($iframe$jscomp$3$$, $state$jscomp$1$$.rect, $state$jscomp$1$$.viewportSize);
    $setImportantStyles$$module$src$style$$($iframe$jscomp$3$$);
    $timer$$module$ads$inabox$util$$(function() {
      $restrictedVsync$$module$ads$inabox$util$$($win$jscomp$8$$, {mutate:function() {
        $resetStyles$$module$src$style$$($iframe$jscomp$3$$, ["pointer-events"]);
        $setStyles$$module$src$style$$($iframe$jscomp$3$$, {position:"fixed", "z-index":1000, left:0, right:0, top:0, bottom:0, width:"100vw", height:"100vh", transition:null, transform:null, margin:0, border:0});
        $onFinish$$($state$jscomp$1$$.rect, $expandedRect$$);
      }});
    });
  }}, {});
}
function $module$ads$inabox$frame_overlay_helper$collapseFrame$$($win$jscomp$9$$, $iframe$jscomp$4$$, $onFinish$jscomp$1$$, $onMeasure$$) {
  $restrictedVsync$$module$ads$inabox$util$$($win$jscomp$9$$, {mutate:function() {
    $resetStyles$$module$src$style$$($iframe$jscomp$4$$, "position z-index left right top bottom width height margin border".split(" "));
    $onFinish$jscomp$1$$();
    $restrictedVsync$$module$ads$inabox$util$$($win$jscomp$9$$, {measure:function() {
      $onMeasure$$($layoutRectFromDomRect$$module$src$layout_rect$$($iframe$jscomp$4$$.getBoundingClientRect()));
    }});
  }});
}
;function $FrameOverlayManager$$module$ads$inabox$frame_overlay_manager$$($win$jscomp$10$$) {
  this.$win_$ = $win$jscomp$10$$;
  this.$viewportChangedSinceExpand_$ = this.$isExpanded_$ = !1;
  this.$collapsedRect_$ = null;
  $JSCompiler_StaticMethods_listenToViewportChanges_$$(this);
}
function $JSCompiler_StaticMethods_listenToViewportChanges_$$($JSCompiler_StaticMethods_listenToViewportChanges_$self$$) {
  $JSCompiler_StaticMethods_listenToViewportChanges_$self$$.$win_$.addEventListener("resize", function() {
    return $JSCompiler_StaticMethods_listenToViewportChanges_$self$$.onWindowResize();
  });
}
$FrameOverlayManager$$module$ads$inabox$frame_overlay_manager$$.prototype.onWindowResize = function() {
  this.$isExpanded_$ && (this.$viewportChangedSinceExpand_$ = !0);
};
$FrameOverlayManager$$module$ads$inabox$frame_overlay_manager$$.prototype.expandFrame = function($iframe$jscomp$5$$, $callback$jscomp$52$$) {
  var $$jscomp$this$jscomp$1$$ = this;
  $module$ads$inabox$frame_overlay_helper$expandFrame$$(this.$win_$, $iframe$jscomp$5$$, function($iframe$jscomp$5$$, $expandedRect$jscomp$1$$) {
    $$jscomp$this$jscomp$1$$.$isExpanded_$ = !0;
    $$jscomp$this$jscomp$1$$.$viewportChangedSinceExpand_$ = !1;
    $$jscomp$this$jscomp$1$$.$collapsedRect_$ = $iframe$jscomp$5$$;
    $callback$jscomp$52$$($expandedRect$jscomp$1$$);
  });
};
$FrameOverlayManager$$module$ads$inabox$frame_overlay_manager$$.prototype.collapseFrame = function($iframe$jscomp$6$$, $callback$jscomp$53$$) {
  var $$jscomp$this$jscomp$2$$ = this;
  $module$ads$inabox$frame_overlay_helper$collapseFrame$$(this.$win_$, $iframe$jscomp$6$$, function() {
    $$jscomp$this$jscomp$2$$.$isExpanded_$ = !1;
    $$jscomp$this$jscomp$2$$.$viewportChangedSinceExpand_$ || $callback$jscomp$53$$($$jscomp$this$jscomp$2$$.$collapsedRect_$);
  }, function($iframe$jscomp$6$$) {
    $$jscomp$this$jscomp$2$$.$collapsedRect_$ = $iframe$jscomp$6$$;
    $$jscomp$this$jscomp$2$$.$viewportChangedSinceExpand_$ && $callback$jscomp$53$$($$jscomp$this$jscomp$2$$.$collapsedRect_$);
  });
};
/*
 https://mths.be/cssescape v1.5.1 by @mathias | MIT license */
function $serializeMessage$$module$src$3p_frame_messaging$$($type$jscomp$116$$, $sentinel$$, $data$jscomp$33_message$jscomp$28$$) {
  $data$jscomp$33_message$jscomp$28$$ = void 0 === $data$jscomp$33_message$jscomp$28$$ ? {} : $data$jscomp$33_message$jscomp$28$$;
  var $rtvVersion$$ = void 0 === $rtvVersion$$ ? null : $rtvVersion$$;
  $data$jscomp$33_message$jscomp$28$$.type = $type$jscomp$116$$;
  $data$jscomp$33_message$jscomp$28$$.sentinel = $sentinel$$;
  return "amp-" + ($rtvVersion$$ || "") + JSON.stringify($data$jscomp$33_message$jscomp$28$$);
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
$JSCompiler_prototypeAlias$$.remove = function($handler$jscomp$4_index$jscomp$55$$) {
  this.$handlers_$ && ($handler$jscomp$4_index$jscomp$55$$ = this.$handlers_$.indexOf($handler$jscomp$4_index$jscomp$55$$), -1 < $handler$jscomp$4_index$jscomp$55$$ && this.$handlers_$.splice($handler$jscomp$4_index$jscomp$55$$, 1));
};
$JSCompiler_prototypeAlias$$.removeAll = function() {
  this.$handlers_$ && (this.$handlers_$.length = 0);
};
$JSCompiler_prototypeAlias$$.fire = function($opt_event$$) {
  if (this.$handlers_$) {
    for (var $handlers$$ = this.$handlers_$, $i$jscomp$15$$ = 0; $i$jscomp$15$$ < $handlers$$.length; $i$jscomp$15$$++) {
      (0,$handlers$$[$i$jscomp$15$$])($opt_event$$);
    }
  }
};
$JSCompiler_prototypeAlias$$.getHandlerCount = function() {
  return this.$handlers_$ ? this.$handlers_$.length : 0;
};
function $throttle$$module$src$utils$rate_limit$$($win$jscomp$14$$, $callback$jscomp$62$$) {
  var $minInterval$$ = 100;
  function $fire$$($fire$$) {
    $nextCallArgs$$ = null;
    $locker$$ = $win$jscomp$14$$.setTimeout($waiter$$, $minInterval$$);
    $callback$jscomp$62$$.apply(null, $fire$$);
  }
  function $waiter$$() {
    $locker$$ = 0;
    $nextCallArgs$$ && $fire$$($nextCallArgs$$);
  }
  var $locker$$ = 0, $nextCallArgs$$ = null;
  return function($win$jscomp$14$$) {
    for (var $callback$jscomp$62$$ = [], $minInterval$$ = 0; $minInterval$$ < arguments.length; ++$minInterval$$) {
      $callback$jscomp$62$$[$minInterval$$ - 0] = arguments[$minInterval$$];
    }
    $locker$$ ? $nextCallArgs$$ = $callback$jscomp$62$$ : $fire$$($callback$jscomp$62$$);
  };
}
;function $PositionObserver$$module$ads$inabox$position_observer$$($JSCompiler_doc$jscomp$inline_81_JSCompiler_temp$jscomp$140_win$jscomp$16$$) {
  this.$win_$ = $JSCompiler_doc$jscomp$inline_81_JSCompiler_temp$jscomp$140_win$jscomp$16$$;
  this.$positionObservable_$ = null;
  var $JSCompiler_ua$jscomp$inline_144_JSCompiler_win$jscomp$inline_80$$ = this.$win_$;
  $JSCompiler_doc$jscomp$inline_81_JSCompiler_temp$jscomp$140_win$jscomp$16$$ = $JSCompiler_ua$jscomp$inline_144_JSCompiler_win$jscomp$inline_80$$.document;
  if ($JSCompiler_doc$jscomp$inline_81_JSCompiler_temp$jscomp$140_win$jscomp$16$$.scrollingElement) {
    $JSCompiler_doc$jscomp$inline_81_JSCompiler_temp$jscomp$140_win$jscomp$16$$ = $JSCompiler_doc$jscomp$inline_81_JSCompiler_temp$jscomp$140_win$jscomp$16$$.scrollingElement;
  } else {
    var $JSCompiler_temp$jscomp$141$$;
    if ($JSCompiler_temp$jscomp$141$$ = $JSCompiler_doc$jscomp$inline_81_JSCompiler_temp$jscomp$140_win$jscomp$16$$.body) {
      $JSCompiler_ua$jscomp$inline_144_JSCompiler_win$jscomp$inline_80$$ = $JSCompiler_ua$jscomp$inline_144_JSCompiler_win$jscomp$inline_80$$.navigator.userAgent, $JSCompiler_temp$jscomp$141$$ = /WebKit/i.test($JSCompiler_ua$jscomp$inline_144_JSCompiler_win$jscomp$inline_80$$) && !/Edge/i.test($JSCompiler_ua$jscomp$inline_144_JSCompiler_win$jscomp$inline_80$$);
    }
    $JSCompiler_doc$jscomp$inline_81_JSCompiler_temp$jscomp$140_win$jscomp$16$$ = $JSCompiler_temp$jscomp$141$$ ? $JSCompiler_doc$jscomp$inline_81_JSCompiler_temp$jscomp$140_win$jscomp$16$$.body : $JSCompiler_doc$jscomp$inline_81_JSCompiler_temp$jscomp$140_win$jscomp$16$$.documentElement;
  }
  this.$scrollingElement_$ = $JSCompiler_doc$jscomp$inline_81_JSCompiler_temp$jscomp$140_win$jscomp$16$$;
  this.$viewportRect_$ = null;
}
$PositionObserver$$module$ads$inabox$position_observer$$.prototype.observe = function($element$jscomp$39$$, $callback$jscomp$64$$) {
  var $$jscomp$this$jscomp$5$$ = this;
  if (!this.$positionObservable_$) {
    this.$positionObservable_$ = new $Observable$$module$src$observable$$;
    var $listener$jscomp$58$$ = $throttle$$module$src$utils$rate_limit$$(this.$win_$, function() {
      $$jscomp$this$jscomp$5$$.$viewportRect_$ = $$jscomp$this$jscomp$5$$.getViewportRect();
      $$jscomp$this$jscomp$5$$.$positionObservable_$.fire();
    });
    this.$viewportRect_$ = this.getViewportRect();
    this.$win_$.addEventListener("scroll", $listener$jscomp$58$$, !0);
    this.$win_$.addEventListener("resize", $listener$jscomp$58$$, !0);
  }
  $callback$jscomp$64$$({viewportRect:this.$viewportRect_$, targetRect:$layoutRectFromDomRect$$module$src$layout_rect$$($element$jscomp$39$$.getBoundingClientRect())});
  return this.$positionObservable_$.add(function() {
    $callback$jscomp$64$$({viewportRect:$$jscomp$this$jscomp$5$$.$viewportRect_$, targetRect:$layoutRectFromDomRect$$module$src$layout_rect$$($element$jscomp$39$$.getBoundingClientRect())});
  });
};
$PositionObserver$$module$ads$inabox$position_observer$$.prototype.getViewportRect = function() {
  var $scrollingElement$$ = this.$scrollingElement_$, $win$jscomp$17$$ = this.$win_$, $scrollLeft$$ = $scrollingElement$$.scrollLeft || $win$jscomp$17$$.pageXOffset, $scrollTop$$ = $scrollingElement$$.scrollTop || $win$jscomp$17$$.pageYOffset;
  return $layoutRectLtwh$$module$src$layout_rect$$(Math.round($scrollLeft$$), Math.round($scrollTop$$), $win$jscomp$17$$.innerWidth, $win$jscomp$17$$.innerHeight);
};
function $NamedObservable$$module$ads$inabox$inabox_messaging_host$$() {
  this.$map_$ = {};
}
$NamedObservable$$module$ads$inabox$inabox_messaging_host$$.prototype.listen = function($key$jscomp$42$$, $callback$jscomp$65$$) {
  this.$map_$[$key$jscomp$42$$] = $callback$jscomp$65$$;
};
$NamedObservable$$module$ads$inabox$inabox_messaging_host$$.prototype.fire = function($key$jscomp$43$$, $thisArg$jscomp$1$$, $args$jscomp$4$$) {
  return $key$jscomp$43$$ in this.$map_$ ? this.$map_$[$key$jscomp$43$$].apply($thisArg$jscomp$1$$, $args$jscomp$4$$) : !1;
};
function $InaboxMessagingHost$$module$ads$inabox$inabox_messaging_host$$($win$jscomp$20$$, $iframes$$) {
  this.$iframes_$ = $iframes$$;
  this.$iframeMap_$ = Object.create(null);
  this.$positionObserver_$ = new $PositionObserver$$module$ads$inabox$position_observer$$($win$jscomp$20$$);
  this.$msgObservable_$ = new $NamedObservable$$module$ads$inabox$inabox_messaging_host$$;
  this.$frameOverlayManager_$ = new $FrameOverlayManager$$module$ads$inabox$frame_overlay_manager$$($win$jscomp$20$$);
  this.$msgObservable_$.listen("send-positions", this.$handleSendPositions_$);
  this.$msgObservable_$.listen("full-overlay-frame", this.$handleEnterFullOverlay_$);
  this.$msgObservable_$.listen("cancel-full-overlay-frame", this.$handleCancelFullOverlay_$);
}
$JSCompiler_prototypeAlias$$ = $InaboxMessagingHost$$module$ads$inabox$inabox_messaging_host$$.prototype;
$JSCompiler_prototypeAlias$$.processMessage = function($message$jscomp$32$$) {
  var $JSCompiler_inline_result$jscomp$30_JSCompiler_message$jscomp$inline_87_JSCompiler_sentinel$jscomp$inline_93$$ = $message$jscomp$32$$.data;
  if ("string" == typeof $JSCompiler_inline_result$jscomp$30_JSCompiler_message$jscomp$inline_87_JSCompiler_sentinel$jscomp$inline_93$$ && 0 == $JSCompiler_inline_result$jscomp$30_JSCompiler_message$jscomp$inline_87_JSCompiler_sentinel$jscomp$inline_93$$.indexOf("amp-") && -1 != $JSCompiler_inline_result$jscomp$30_JSCompiler_message$jscomp$inline_87_JSCompiler_sentinel$jscomp$inline_93$$.indexOf("{")) {
    var $JSCompiler_measurableFrame$jscomp$inline_94_JSCompiler_startPos$jscomp$inline_88$$ = $JSCompiler_inline_result$jscomp$30_JSCompiler_message$jscomp$inline_87_JSCompiler_sentinel$jscomp$inline_93$$.indexOf("{");
    try {
      var $JSCompiler_inline_result$jscomp$28_request$jscomp$5$$ = JSON.parse($JSCompiler_inline_result$jscomp$30_JSCompiler_message$jscomp$inline_87_JSCompiler_sentinel$jscomp$inline_93$$.substr($JSCompiler_measurableFrame$jscomp$inline_94_JSCompiler_startPos$jscomp$inline_88$$));
    } catch ($JSCompiler_e$jscomp$inline_89$$) {
      $dev$$module$src$log$$().error("MESSAGING", "Failed to parse message: " + $JSCompiler_inline_result$jscomp$30_JSCompiler_message$jscomp$inline_87_JSCompiler_sentinel$jscomp$inline_93$$, $JSCompiler_e$jscomp$inline_89$$), $JSCompiler_inline_result$jscomp$28_request$jscomp$5$$ = null;
    }
  } else {
    $JSCompiler_inline_result$jscomp$28_request$jscomp$5$$ = null;
  }
  if (!$JSCompiler_inline_result$jscomp$28_request$jscomp$5$$ || !$JSCompiler_inline_result$jscomp$28_request$jscomp$5$$.sentinel) {
    return !1;
  }
  a: {
    if ($JSCompiler_inline_result$jscomp$30_JSCompiler_message$jscomp$inline_87_JSCompiler_sentinel$jscomp$inline_93$$ = $JSCompiler_inline_result$jscomp$28_request$jscomp$5$$.sentinel, this.$iframeMap_$[$JSCompiler_inline_result$jscomp$30_JSCompiler_message$jscomp$inline_87_JSCompiler_sentinel$jscomp$inline_93$$]) {
      $JSCompiler_inline_result$jscomp$30_JSCompiler_message$jscomp$inline_87_JSCompiler_sentinel$jscomp$inline_93$$ = this.$iframeMap_$[$JSCompiler_inline_result$jscomp$30_JSCompiler_message$jscomp$inline_87_JSCompiler_sentinel$jscomp$inline_93$$];
    } else {
      if ($JSCompiler_measurableFrame$jscomp$inline_94_JSCompiler_startPos$jscomp$inline_88$$ = this.getMeasureableFrame($message$jscomp$32$$.source)) {
        for (var $JSCompiler_measurableWin$jscomp$inline_95$$ = $JSCompiler_measurableFrame$jscomp$inline_94_JSCompiler_startPos$jscomp$inline_88$$.contentWindow, $JSCompiler_i$jscomp$inline_96$$ = 0; $JSCompiler_i$jscomp$inline_96$$ < this.$iframes_$.length; $JSCompiler_i$jscomp$inline_96$$++) {
          for (var $JSCompiler_iframe$jscomp$inline_97$$ = this.$iframes_$[$JSCompiler_i$jscomp$inline_96$$], $JSCompiler_j$jscomp$inline_98$$ = 0, $JSCompiler_tempWin$jscomp$inline_99$$ = $JSCompiler_measurableWin$jscomp$inline_95$$; 10 > $JSCompiler_j$jscomp$inline_98$$; $JSCompiler_j$jscomp$inline_98$$++, $JSCompiler_tempWin$jscomp$inline_99$$ = $JSCompiler_tempWin$jscomp$inline_99$$.parent) {
            if ($JSCompiler_iframe$jscomp$inline_97$$.contentWindow == $JSCompiler_tempWin$jscomp$inline_99$$) {
              this.$iframeMap_$[$JSCompiler_inline_result$jscomp$30_JSCompiler_message$jscomp$inline_87_JSCompiler_sentinel$jscomp$inline_93$$] = {iframe:$JSCompiler_iframe$jscomp$inline_97$$, measurableFrame:$JSCompiler_measurableFrame$jscomp$inline_94_JSCompiler_startPos$jscomp$inline_88$$};
              $JSCompiler_inline_result$jscomp$30_JSCompiler_message$jscomp$inline_87_JSCompiler_sentinel$jscomp$inline_93$$ = this.$iframeMap_$[$JSCompiler_inline_result$jscomp$30_JSCompiler_message$jscomp$inline_87_JSCompiler_sentinel$jscomp$inline_93$$];
              break a;
            }
            if ($JSCompiler_tempWin$jscomp$inline_99$$ == window.top) {
              break;
            }
          }
        }
      }
      $JSCompiler_inline_result$jscomp$30_JSCompiler_message$jscomp$inline_87_JSCompiler_sentinel$jscomp$inline_93$$ = null;
    }
  }
  var $adFrame$$ = $JSCompiler_inline_result$jscomp$30_JSCompiler_message$jscomp$inline_87_JSCompiler_sentinel$jscomp$inline_93$$;
  if (!$adFrame$$) {
    return $dev$$module$src$log$$().info("InaboxMessagingHost", "Ignored message from untrusted iframe:", $message$jscomp$32$$), !1;
  }
  var $allowedTypes$$ = $adFrame$$.iframe.dataset.ampAllowed;
  return $allowedTypes$$ && !$allowedTypes$$.split(/\s*,\s*/).includes($JSCompiler_inline_result$jscomp$28_request$jscomp$5$$.type) ? ($dev$$module$src$log$$().info("InaboxMessagingHost", "Ignored non-whitelisted message type:", $message$jscomp$32$$), !1) : this.$msgObservable_$.fire($JSCompiler_inline_result$jscomp$28_request$jscomp$5$$.type, this, [$adFrame$$.measurableFrame, $JSCompiler_inline_result$jscomp$28_request$jscomp$5$$, $message$jscomp$32$$.source, $message$jscomp$32$$.origin]) ? !0 : 
  ($dev$$module$src$log$$().warn("InaboxMessagingHost", "Unprocessed AMP message:", $message$jscomp$32$$), !1);
};
$JSCompiler_prototypeAlias$$.$handleSendPositions_$ = function($iframe$jscomp$7$$, $request$jscomp$6$$, $source$jscomp$13$$, $origin$$) {
  var $viewportRect$$ = this.$positionObserver_$.getViewportRect(), $targetRect$$ = $layoutRectFromDomRect$$module$src$layout_rect$$($iframe$jscomp$7$$.getBoundingClientRect());
  $JSCompiler_StaticMethods_sendPosition_$$($request$jscomp$6$$, $source$jscomp$13$$, $origin$$, $dict$$module$src$utils$object$$({viewportRect:$viewportRect$$, targetRect:$targetRect$$}));
  this.$iframeMap_$[$request$jscomp$6$$.sentinel].observeUnregisterFn = this.$iframeMap_$[$request$jscomp$6$$.sentinel].observeUnregisterFn || this.$positionObserver_$.observe($iframe$jscomp$7$$, function($iframe$jscomp$7$$) {
    return $JSCompiler_StaticMethods_sendPosition_$$($request$jscomp$6$$, $source$jscomp$13$$, $origin$$, $iframe$jscomp$7$$);
  });
  return !0;
};
function $JSCompiler_StaticMethods_sendPosition_$$($request$jscomp$7$$, $source$jscomp$14$$, $origin$jscomp$1$$, $data$jscomp$35$$) {
  $source$jscomp$14$$.postMessage($serializeMessage$$module$src$3p_frame_messaging$$("position", $request$jscomp$7$$.sentinel, $data$jscomp$35$$), $origin$jscomp$1$$);
}
$JSCompiler_prototypeAlias$$.$handleEnterFullOverlay_$ = function($iframe$jscomp$8$$, $request$jscomp$8$$, $source$jscomp$15$$, $origin$jscomp$2$$) {
  this.$frameOverlayManager_$.expandFrame($iframe$jscomp$8$$, function($iframe$jscomp$8$$) {
    $source$jscomp$15$$.postMessage($serializeMessage$$module$src$3p_frame_messaging$$("full-overlay-frame-response", $request$jscomp$8$$.sentinel, $dict$$module$src$utils$object$$({success:!0, boxRect:$iframe$jscomp$8$$})), $origin$jscomp$2$$);
  });
  return !0;
};
$JSCompiler_prototypeAlias$$.$handleCancelFullOverlay_$ = function($iframe$jscomp$9$$, $request$jscomp$9$$, $source$jscomp$16$$, $origin$jscomp$3$$) {
  this.$frameOverlayManager_$.collapseFrame($iframe$jscomp$9$$, function($iframe$jscomp$9$$) {
    $source$jscomp$16$$.postMessage($serializeMessage$$module$src$3p_frame_messaging$$("cancel-full-overlay-frame-response", $request$jscomp$9$$.sentinel, $dict$$module$src$utils$object$$({success:!0, boxRect:$iframe$jscomp$9$$})), $origin$jscomp$3$$);
  });
  return !0;
};
$JSCompiler_prototypeAlias$$.getMeasureableFrame = function($win$jscomp$21$$) {
  if (!$win$jscomp$21$$) {
    return null;
  }
  for (var $topXDomainWin$$, $iframes$jscomp$1_j$jscomp$1$$ = 0, $k$jscomp$5_tempWin$jscomp$1$$ = $win$jscomp$21$$; 10 > $iframes$jscomp$1_j$jscomp$1$$ && $k$jscomp$5_tempWin$jscomp$1$$ != $k$jscomp$5_tempWin$jscomp$1$$.top && !$canInspectWindow_$$module$ads$inabox$inabox_messaging_host$$($k$jscomp$5_tempWin$jscomp$1$$); $iframes$jscomp$1_j$jscomp$1$$++, $topXDomainWin$$ = $k$jscomp$5_tempWin$jscomp$1$$, $k$jscomp$5_tempWin$jscomp$1$$ = $k$jscomp$5_tempWin$jscomp$1$$.parent) {
  }
  if ($topXDomainWin$$) {
    $iframes$jscomp$1_j$jscomp$1$$ = $topXDomainWin$$.parent.document.querySelectorAll("iframe");
    $k$jscomp$5_tempWin$jscomp$1$$ = 0;
    for (var $frame$$ = $iframes$jscomp$1_j$jscomp$1$$[$k$jscomp$5_tempWin$jscomp$1$$]; $k$jscomp$5_tempWin$jscomp$1$$ < $iframes$jscomp$1_j$jscomp$1$$.length; $k$jscomp$5_tempWin$jscomp$1$$++, $frame$$ = $iframes$jscomp$1_j$jscomp$1$$[$k$jscomp$5_tempWin$jscomp$1$$]) {
      if ($frame$$.contentWindow == $topXDomainWin$$) {
        return $frame$$;
      }
    }
  }
  return $win$jscomp$21$$.frameElement;
};
$JSCompiler_prototypeAlias$$.unregisterIframe = function($iframe$jscomp$11$$) {
  var $iframeIndex$$ = this.$iframes_$.indexOf($iframe$jscomp$11$$);
  -1 != $iframeIndex$$ && this.$iframes_$.splice($iframeIndex$$, 1);
  for (var $sentinel$jscomp$2$$ in this.$iframeMap_$) {
    this.$iframeMap_$[$sentinel$jscomp$2$$].iframe == $iframe$jscomp$11$$ && (this.$iframeMap_$[$sentinel$jscomp$2$$].observeUnregisterFn && this.$iframeMap_$[$sentinel$jscomp$2$$].observeUnregisterFn(), delete this.$iframeMap_$[$sentinel$jscomp$2$$]);
  }
};
function $canInspectWindow_$$module$ads$inabox$inabox_messaging_host$$($win$jscomp$22$$) {
  try {
    return !!$win$jscomp$22$$.location.href && ($win$jscomp$22$$.test || !0);
  } catch ($unusedErr$$) {
    return !1;
  }
}
;function $getService$$module$src$service$$($win$jscomp$25$$) {
  $win$jscomp$25$$ = $win$jscomp$25$$.__AMP_TOP || $win$jscomp$25$$;
  return $getServiceInternal$$module$src$service$$($win$jscomp$25$$, "ampdoc");
}
function $getServiceForDoc$$module$src$service$$($elementOrAmpDoc$$) {
  var $JSCompiler_ampdoc$jscomp$inline_147_JSCompiler_inline_result$jscomp$142_ampdoc$jscomp$1$$ = $getAmpdoc$$module$src$service$$($elementOrAmpDoc$$);
  $JSCompiler_ampdoc$jscomp$inline_147_JSCompiler_inline_result$jscomp$142_ampdoc$jscomp$1$$ = $getAmpdoc$$module$src$service$$($JSCompiler_ampdoc$jscomp$inline_147_JSCompiler_inline_result$jscomp$142_ampdoc$jscomp$1$$);
  $JSCompiler_ampdoc$jscomp$inline_147_JSCompiler_inline_result$jscomp$142_ampdoc$jscomp$1$$ = $JSCompiler_ampdoc$jscomp$inline_147_JSCompiler_inline_result$jscomp$142_ampdoc$jscomp$1$$.isSingleDoc() ? $JSCompiler_ampdoc$jscomp$inline_147_JSCompiler_inline_result$jscomp$142_ampdoc$jscomp$1$$.win : $JSCompiler_ampdoc$jscomp$inline_147_JSCompiler_inline_result$jscomp$142_ampdoc$jscomp$1$$;
  return $getServiceInternal$$module$src$service$$($JSCompiler_ampdoc$jscomp$inline_147_JSCompiler_inline_result$jscomp$142_ampdoc$jscomp$1$$, "viewer");
}
function $getAmpdoc$$module$src$service$$($nodeOrDoc$jscomp$1$$) {
  return $nodeOrDoc$jscomp$1$$.nodeType ? $getService$$module$src$service$$(($nodeOrDoc$jscomp$1$$.ownerDocument || $nodeOrDoc$jscomp$1$$).defaultView).getAmpDoc($nodeOrDoc$jscomp$1$$) : $nodeOrDoc$jscomp$1$$;
}
function $getServiceInternal$$module$src$service$$($holder$jscomp$3_s$jscomp$4$$, $id$jscomp$18$$) {
  var $JSCompiler_services$jscomp$inline_106$$ = $holder$jscomp$3_s$jscomp$4$$.services;
  $JSCompiler_services$jscomp$inline_106$$ || ($JSCompiler_services$jscomp$inline_106$$ = $holder$jscomp$3_s$jscomp$4$$.services = {});
  var $services$$ = $JSCompiler_services$jscomp$inline_106$$;
  $holder$jscomp$3_s$jscomp$4$$ = $services$$[$id$jscomp$18$$];
  $holder$jscomp$3_s$jscomp$4$$.obj || ($holder$jscomp$3_s$jscomp$4$$.obj = new $holder$jscomp$3_s$jscomp$4$$.ctor($holder$jscomp$3_s$jscomp$4$$.context), $holder$jscomp$3_s$jscomp$4$$.ctor = null, $holder$jscomp$3_s$jscomp$4$$.context = null, $holder$jscomp$3_s$jscomp$4$$.resolve && $holder$jscomp$3_s$jscomp$4$$.resolve($holder$jscomp$3_s$jscomp$4$$.obj));
  return $holder$jscomp$3_s$jscomp$4$$.obj;
}
;function $LruCache$$module$src$utils$lru_cache$$() {
  var $capacity$$ = 100;
  this.$capacity_$ = $capacity$$;
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
$LruCache$$module$src$utils$lru_cache$$.prototype.put = function($JSCompiler_cache$jscomp$inline_109_key$jscomp$46$$, $payload$$) {
  this.has($JSCompiler_cache$jscomp$inline_109_key$jscomp$46$$) || this.$size_$++;
  this.$cache_$[$JSCompiler_cache$jscomp$inline_109_key$jscomp$46$$] = {payload:$payload$$, access:this.$access_$};
  if (!(this.$size_$ <= this.$capacity_$)) {
    $dev$$module$src$log$$().warn("lru-cache", "Trimming LRU cache");
    $JSCompiler_cache$jscomp$inline_109_key$jscomp$46$$ = this.$cache_$;
    var $JSCompiler_oldest$jscomp$inline_110$$ = this.$access_$ + 1, $JSCompiler_key$jscomp$inline_112$$;
    for ($JSCompiler_key$jscomp$inline_112$$ in $JSCompiler_cache$jscomp$inline_109_key$jscomp$46$$) {
      var $JSCompiler_access$jscomp$inline_113$$ = $JSCompiler_cache$jscomp$inline_109_key$jscomp$46$$[$JSCompiler_key$jscomp$inline_112$$].access;
      if ($JSCompiler_access$jscomp$inline_113$$ < $JSCompiler_oldest$jscomp$inline_110$$) {
        $JSCompiler_oldest$jscomp$inline_110$$ = $JSCompiler_access$jscomp$inline_113$$;
        var $JSCompiler_oldestKey$jscomp$inline_111$$ = $JSCompiler_key$jscomp$inline_112$$;
      }
    }
    void 0 !== $JSCompiler_oldestKey$jscomp$inline_111$$ && (delete $JSCompiler_cache$jscomp$inline_109_key$jscomp$46$$[$JSCompiler_oldestKey$jscomp$inline_111$$], this.$size_$--);
  }
};
var $env$$module$src$config$$ = self.AMP_CONFIG || {}, $urls$$module$src$config$$ = {thirdParty:$env$$module$src$config$$.thirdPartyUrl || "https://3p.ampproject.net", thirdPartyFrameHost:$env$$module$src$config$$.thirdPartyFrameHost || "ampproject.net", thirdPartyFrameRegex:("string" == typeof $env$$module$src$config$$.thirdPartyFrameRegex ? new RegExp($env$$module$src$config$$.thirdPartyFrameRegex) : $env$$module$src$config$$.thirdPartyFrameRegex) || /^d-\d+\.ampproject\.net$/, cdn:$env$$module$src$config$$.cdnUrl || 
"https://cdn.ampproject.org", cdnProxyRegex:("string" == typeof $env$$module$src$config$$.cdnProxyRegex ? new RegExp($env$$module$src$config$$.cdnProxyRegex) : $env$$module$src$config$$.cdnProxyRegex) || /^https:\/\/([a-zA-Z0-9_-]+\.)?cdn\.ampproject\.org$/, localhostRegex:/^https?:\/\/localhost(:\d+)?$/, errorReporting:$env$$module$src$config$$.errorReportingUrl || "https://amp-error-reporting.appspot.com/r", localDev:$env$$module$src$config$$.localDev || !1};
$dict$$module$src$utils$object$$({c:!0, v:!0, a:!0, ad:!0});
var $a$$module$src$url$$, $cache$$module$src$url$$;
function $exponentialBackoff$$module$src$exponential_backoff$$() {
  var $getTimeout$$ = $exponentialBackoffClock$$module$src$exponential_backoff$$();
  return function($work$$) {
    return setTimeout($work$$, $getTimeout$$());
  };
}
function $exponentialBackoffClock$$module$src$exponential_backoff$$() {
  var $count$jscomp$15$$ = 0;
  return function() {
    var $wait$$ = Math.pow(1.5, $count$jscomp$15$$++);
    var $JSCompiler_jitter$jscomp$inline_117_JSCompiler_opt_perc$jscomp$inline_116$$ = $wait$$ * ($JSCompiler_jitter$jscomp$inline_117_JSCompiler_opt_perc$jscomp$inline_116$$ || .3) * Math.random();
    .5 < Math.random() && ($JSCompiler_jitter$jscomp$inline_117_JSCompiler_opt_perc$jscomp$inline_116$$ *= -1);
    $wait$$ += $JSCompiler_jitter$jscomp$inline_117_JSCompiler_opt_perc$jscomp$inline_116$$;
    return 1000 * $wait$$;
  };
}
;var $bodyMadeVisible$$module$src$style_installer$$ = !1;
function $makeBodyVisibleRecovery$$module$src$style_installer$$($doc$jscomp$11$$) {
  $bodyMadeVisible$$module$src$style_installer$$ || ($bodyMadeVisible$$module$src$style_installer$$ = !0, $setStyles$$module$src$style$$($doc$jscomp$11$$.body, {opacity:1, visibility:"visible", animation:"none"}));
}
;var $accumulatedErrorMessages$$module$src$error$$ = self.AMPErrors || [];
self.AMPErrors = $accumulatedErrorMessages$$module$src$error$$;
function $reportingBackoff$$module$src$error$$($work$jscomp$1$$) {
  $reportingBackoff$$module$src$error$$ = $exponentialBackoff$$module$src$exponential_backoff$$();
  return $reportingBackoff$$module$src$error$$($work$jscomp$1$$);
}
function $tryJsonStringify$$module$src$error$$($value$jscomp$104$$) {
  try {
    return JSON.stringify($value$jscomp$104$$);
  } catch ($e$jscomp$22$$) {
    return String($value$jscomp$104$$);
  }
}
var $detectedJsEngine$$module$src$error$$;
function $reportError$$module$src$error$$($error$jscomp$13$$, $opt_associatedElement$jscomp$1$$) {
  try {
    if ($error$jscomp$13$$) {
      if (void 0 !== $error$jscomp$13$$.message) {
        $error$jscomp$13$$ = $duplicateErrorIfNecessary$$module$src$log$$($error$jscomp$13$$);
      } else {
        var $origError$$ = $error$jscomp$13$$;
        $error$jscomp$13$$ = Error($tryJsonStringify$$module$src$error$$($origError$$));
        $error$jscomp$13$$.origError = $origError$$;
      }
    } else {
      $error$jscomp$13$$ = Error("Unknown error");
    }
    if ($error$jscomp$13$$.reported) {
      return $error$jscomp$13$$;
    }
    $error$jscomp$13$$.reported = !0;
    var $element$jscomp$68$$ = $opt_associatedElement$jscomp$1$$ || $error$jscomp$13$$.associatedElement;
    $element$jscomp$68$$ && $element$jscomp$68$$.classList && ($element$jscomp$68$$.classList.add("i-amphtml-error"), $getMode$$module$src$mode$$().development && ($element$jscomp$68$$.classList.add("i-amphtml-element-error"), $element$jscomp$68$$.setAttribute("error-message", $error$jscomp$13$$.message)));
    if (self.console) {
      var $output$jscomp$2$$ = console.error || console.log;
      $error$jscomp$13$$.messageArray ? $output$jscomp$2$$.apply(console, $error$jscomp$13$$.messageArray) : $element$jscomp$68$$ ? $output$jscomp$2$$.call(console, $error$jscomp$13$$.message, $element$jscomp$68$$) : $output$jscomp$2$$.call(console, $error$jscomp$13$$.message);
    }
    $element$jscomp$68$$ && $element$jscomp$68$$.$dispatchCustomEventForTesting$ && $element$jscomp$68$$.$dispatchCustomEventForTesting$("amp:error", $error$jscomp$13$$.message);
    $onError$$module$src$error$$.call(void 0, void 0, void 0, void 0, void 0, $error$jscomp$13$$);
  } catch ($errorReportingError$$) {
    setTimeout(function() {
      throw $errorReportingError$$;
    });
  }
  return $error$jscomp$13$$;
}
function $onError$$module$src$error$$($message$jscomp$33$$, $filename$$, $line$$, $col$$, $error$jscomp$14$$) {
  var $$jscomp$this$jscomp$7$$ = this;
  this && this.document && $makeBodyVisibleRecovery$$module$src$style_installer$$(this.document);
  if (!$getMode$$module$src$mode$$().development) {
    var $hasNonAmpJs$$ = !1;
    try {
      $hasNonAmpJs$$ = $detectNonAmpJs$$module$src$error$$();
    } catch ($ignore$jscomp$1$$) {
    }
    if (!($hasNonAmpJs$$ && 0.01 < Math.random())) {
      var $data$jscomp$36$$ = $getErrorReportData$$module$src$error$$($message$jscomp$33$$, $filename$$, $line$$, $col$$, $error$jscomp$14$$, $hasNonAmpJs$$);
      $data$jscomp$36$$ && $reportingBackoff$$module$src$error$$(function() {
        return $reportErrorToServerOrViewer$$module$src$error$$($$jscomp$this$jscomp$7$$, $data$jscomp$36$$);
      });
    }
  }
}
function $reportErrorToServerOrViewer$$module$src$error$$($win$jscomp$79$$, $data$jscomp$37$$) {
  return $maybeReportErrorToViewer$$module$src$error$$($win$jscomp$79$$, $data$jscomp$37$$).then(function($win$jscomp$79$$) {
    if (!$win$jscomp$79$$) {
      var $reportedErrorToViewer$$ = new XMLHttpRequest;
      $reportedErrorToViewer$$.open("POST", $urls$$module$src$config$$.errorReporting, !0);
      $reportedErrorToViewer$$.send(JSON.stringify($data$jscomp$37$$));
    }
  });
}
function $maybeReportErrorToViewer$$module$src$error$$($win$jscomp$80$$, $data$jscomp$38$$) {
  var $ampdocService$$ = $getService$$module$src$service$$($win$jscomp$80$$);
  if (!$ampdocService$$.isSingleDoc()) {
    return Promise.resolve(!1);
  }
  var $ampdocSingle$$ = $ampdocService$$.getAmpDoc(), $htmlElement$$ = $ampdocSingle$$.getRootNode().documentElement, $docOptedIn$$ = $htmlElement$$.hasAttribute("report-errors-to-viewer");
  if (!$docOptedIn$$) {
    return Promise.resolve(!1);
  }
  var $viewer$$ = $getServiceForDoc$$module$src$service$$($ampdocSingle$$);
  return $viewer$$.hasCapability("errorReporter") ? $viewer$$.isTrustedViewer().then(function($win$jscomp$80$$) {
    if (!$win$jscomp$80$$) {
      return !1;
    }
    $viewer$$.sendMessage("error", $dict$$module$src$utils$object$$({m:$data$jscomp$38$$.m, a:$data$jscomp$38$$.a, s:$data$jscomp$38$$.s, el:$data$jscomp$38$$.el, v:$data$jscomp$38$$.v, jse:$data$jscomp$38$$.jse}));
    return !0;
  }) : Promise.resolve(!1);
}
function $getErrorReportData$$module$src$error$$($message$jscomp$35$$, $JSCompiler_element$jscomp$inline_130_filename$jscomp$1$$, $JSCompiler_array$jscomp$inline_131_line$jscomp$1$$, $col$jscomp$1$$, $error$jscomp$16$$, $JSCompiler_inline_result$jscomp$35_JSCompiler_win$jscomp$inline_124_JSCompiler_win$jscomp$inline_126_hasNonAmpJs$jscomp$1$$) {
  var $JSCompiler_message$jscomp$inline_121_data$jscomp$39$$ = $message$jscomp$35$$;
  $error$jscomp$16$$ && ($JSCompiler_message$jscomp$inline_121_data$jscomp$39$$ = $error$jscomp$16$$.message ? $error$jscomp$16$$.message : String($error$jscomp$16$$));
  $JSCompiler_message$jscomp$inline_121_data$jscomp$39$$ || ($JSCompiler_message$jscomp$inline_121_data$jscomp$39$$ = "Unknown error");
  $message$jscomp$35$$ = $JSCompiler_message$jscomp$inline_121_data$jscomp$39$$;
  var $expected$$ = !(!$error$jscomp$16$$ || !$error$jscomp$16$$.expected);
  if (!/_reported_/.test($message$jscomp$35$$) && "CANCELLED" != $message$jscomp$35$$) {
    var $detachedWindow$$ = !(self && self.window), $throttleBase$$ = Math.random();
    if (-1 != $message$jscomp$35$$.indexOf("Failed to load:") || "Script error." == $message$jscomp$35$$ || $detachedWindow$$) {
      if ($expected$$ = !0, 0.001 < $throttleBase$$) {
        return;
      }
    }
    var $isUserError$$ = 0 <= $message$jscomp$35$$.indexOf("\u200b\u200b\u200b");
    if (!($isUserError$$ && 0.1 < $throttleBase$$)) {
      $JSCompiler_message$jscomp$inline_121_data$jscomp$39$$ = Object.create(null);
      $JSCompiler_message$jscomp$inline_121_data$jscomp$39$$.v = $getMode$$module$src$mode$$().rtvVersion;
      $JSCompiler_message$jscomp$inline_121_data$jscomp$39$$.noAmp = $JSCompiler_inline_result$jscomp$35_JSCompiler_win$jscomp$inline_124_JSCompiler_win$jscomp$inline_126_hasNonAmpJs$jscomp$1$$ ? "1" : "0";
      $JSCompiler_message$jscomp$inline_121_data$jscomp$39$$.m = $message$jscomp$35$$.replace("\u200b\u200b\u200b", "");
      $JSCompiler_message$jscomp$inline_121_data$jscomp$39$$.a = $isUserError$$ ? "1" : "0";
      $JSCompiler_message$jscomp$inline_121_data$jscomp$39$$.ex = $expected$$ ? "1" : "0";
      $JSCompiler_message$jscomp$inline_121_data$jscomp$39$$.dw = $detachedWindow$$ ? "1" : "0";
      var $runtime$$ = "1p";
      self.context && self.context.location ? ($JSCompiler_message$jscomp$inline_121_data$jscomp$39$$["3p"] = "1", $runtime$$ = "3p") : $getMode$$module$src$mode$$().runtime && ($runtime$$ = $getMode$$module$src$mode$$().runtime);
      $getMode$$module$src$mode$$().singlePassType && ($JSCompiler_message$jscomp$inline_121_data$jscomp$39$$.spt = $getMode$$module$src$mode$$().singlePassType);
      $JSCompiler_message$jscomp$inline_121_data$jscomp$39$$.rt = $runtime$$;
      "inabox" === $runtime$$ && ($JSCompiler_message$jscomp$inline_121_data$jscomp$39$$.adid = $getMode$$module$src$mode$$().a4aId);
      $JSCompiler_inline_result$jscomp$35_JSCompiler_win$jscomp$inline_124_JSCompiler_win$jscomp$inline_126_hasNonAmpJs$jscomp$1$$ = self;
      $JSCompiler_message$jscomp$inline_121_data$jscomp$39$$.ca = $JSCompiler_inline_result$jscomp$35_JSCompiler_win$jscomp$inline_124_JSCompiler_win$jscomp$inline_126_hasNonAmpJs$jscomp$1$$.AMP_CONFIG && $JSCompiler_inline_result$jscomp$35_JSCompiler_win$jscomp$inline_124_JSCompiler_win$jscomp$inline_126_hasNonAmpJs$jscomp$1$$.AMP_CONFIG.canary ? "1" : "0";
      $JSCompiler_inline_result$jscomp$35_JSCompiler_win$jscomp$inline_124_JSCompiler_win$jscomp$inline_126_hasNonAmpJs$jscomp$1$$ = self;
      $JSCompiler_message$jscomp$inline_121_data$jscomp$39$$.bt = $JSCompiler_inline_result$jscomp$35_JSCompiler_win$jscomp$inline_124_JSCompiler_win$jscomp$inline_126_hasNonAmpJs$jscomp$1$$.AMP_CONFIG && $JSCompiler_inline_result$jscomp$35_JSCompiler_win$jscomp$inline_124_JSCompiler_win$jscomp$inline_126_hasNonAmpJs$jscomp$1$$.AMP_CONFIG.type ? $JSCompiler_inline_result$jscomp$35_JSCompiler_win$jscomp$inline_124_JSCompiler_win$jscomp$inline_126_hasNonAmpJs$jscomp$1$$.AMP_CONFIG.type : "unknown";
      self.location.ancestorOrigins && self.location.ancestorOrigins[0] && ($JSCompiler_message$jscomp$inline_121_data$jscomp$39$$.or = self.location.ancestorOrigins[0]);
      self.viewerState && ($JSCompiler_message$jscomp$inline_121_data$jscomp$39$$.vs = self.viewerState);
      self.parent && self.parent != self && ($JSCompiler_message$jscomp$inline_121_data$jscomp$39$$.iem = "1");
      if (self.AMP && self.AMP.viewer) {
        var $resolvedViewerUrl$$ = self.AMP.viewer.getResolvedViewerUrl(), $messagingOrigin$$ = self.AMP.viewer.maybeGetMessagingOrigin();
        $resolvedViewerUrl$$ && ($JSCompiler_message$jscomp$inline_121_data$jscomp$39$$.rvu = $resolvedViewerUrl$$);
        $messagingOrigin$$ && ($JSCompiler_message$jscomp$inline_121_data$jscomp$39$$.mso = $messagingOrigin$$);
      }
      $detectedJsEngine$$module$src$error$$ || ($detectedJsEngine$$module$src$error$$ = $detectJsEngineFromStack$$module$src$error$$());
      $JSCompiler_message$jscomp$inline_121_data$jscomp$39$$.jse = $detectedJsEngine$$module$src$error$$;
      var $exps$$ = [];
      $JSCompiler_inline_result$jscomp$35_JSCompiler_win$jscomp$inline_124_JSCompiler_win$jscomp$inline_126_hasNonAmpJs$jscomp$1$$ = self.__AMP__EXPERIMENT_TOGGLES || null;
      for (var $exp$$ in $JSCompiler_inline_result$jscomp$35_JSCompiler_win$jscomp$inline_124_JSCompiler_win$jscomp$inline_126_hasNonAmpJs$jscomp$1$$) {
        $exps$$.push($exp$$ + "=" + ($JSCompiler_inline_result$jscomp$35_JSCompiler_win$jscomp$inline_124_JSCompiler_win$jscomp$inline_126_hasNonAmpJs$jscomp$1$$[$exp$$] ? "1" : "0"));
      }
      $JSCompiler_message$jscomp$inline_121_data$jscomp$39$$.exps = $exps$$.join(",");
      $error$jscomp$16$$ ? ($JSCompiler_message$jscomp$inline_121_data$jscomp$39$$.el = $error$jscomp$16$$.associatedElement ? $error$jscomp$16$$.associatedElement.tagName : "u", $error$jscomp$16$$.args && ($JSCompiler_message$jscomp$inline_121_data$jscomp$39$$.args = JSON.stringify($error$jscomp$16$$.args)), $isUserError$$ || $error$jscomp$16$$.ignoreStack || !$error$jscomp$16$$.stack || ($JSCompiler_message$jscomp$inline_121_data$jscomp$39$$.s = $error$jscomp$16$$.stack), $error$jscomp$16$$.message && 
      ($error$jscomp$16$$.message += " _reported_")) : ($JSCompiler_message$jscomp$inline_121_data$jscomp$39$$.f = $JSCompiler_element$jscomp$inline_130_filename$jscomp$1$$ || "", $JSCompiler_message$jscomp$inline_121_data$jscomp$39$$.l = $JSCompiler_array$jscomp$inline_131_line$jscomp$1$$ || "", $JSCompiler_message$jscomp$inline_121_data$jscomp$39$$.c = $col$jscomp$1$$ || "");
      $JSCompiler_message$jscomp$inline_121_data$jscomp$39$$.r = self.document.referrer;
      $JSCompiler_message$jscomp$inline_121_data$jscomp$39$$.ae = $accumulatedErrorMessages$$module$src$error$$.join(",");
      $JSCompiler_message$jscomp$inline_121_data$jscomp$39$$.fr = self.location.originalHash || self.location.hash;
      $JSCompiler_element$jscomp$inline_130_filename$jscomp$1$$ = $message$jscomp$35$$;
      $JSCompiler_array$jscomp$inline_131_line$jscomp$1$$ = $accumulatedErrorMessages$$module$src$error$$;
      25 <= $JSCompiler_array$jscomp$inline_131_line$jscomp$1$$.length && $JSCompiler_array$jscomp$inline_131_line$jscomp$1$$.splice(0, $JSCompiler_array$jscomp$inline_131_line$jscomp$1$$.length - 25 + 1);
      $JSCompiler_array$jscomp$inline_131_line$jscomp$1$$.push($JSCompiler_element$jscomp$inline_130_filename$jscomp$1$$);
      return $JSCompiler_message$jscomp$inline_121_data$jscomp$39$$;
    }
  }
}
function $detectNonAmpJs$$module$src$error$$() {
  for (var $scripts$jscomp$2$$ = self.document.querySelectorAll("script[src]"), $i$jscomp$25$$ = 0; $i$jscomp$25$$ < $scripts$jscomp$2$$.length; $i$jscomp$25$$++) {
    var $JSCompiler_url$jscomp$inline_134_JSCompiler_url$jscomp$inline_149_JSCompiler_url$jscomp$inline_152$$ = $scripts$jscomp$2$$[$i$jscomp$25$$].src.toLowerCase();
    if ("string" == typeof $JSCompiler_url$jscomp$inline_134_JSCompiler_url$jscomp$inline_149_JSCompiler_url$jscomp$inline_152$$) {
      $a$$module$src$url$$ || ($a$$module$src$url$$ = self.document.createElement("a"), $cache$$module$src$url$$ = self.UrlCache || (self.UrlCache = new $LruCache$$module$src$utils$lru_cache$$));
      var $JSCompiler_opt_cache$jscomp$inline_153$$ = $cache$$module$src$url$$, $JSCompiler_a$jscomp$inline_154_JSCompiler_frozen$jscomp$inline_156$$ = $a$$module$src$url$$;
      if ($JSCompiler_opt_cache$jscomp$inline_153$$ && $JSCompiler_opt_cache$jscomp$inline_153$$.has($JSCompiler_url$jscomp$inline_134_JSCompiler_url$jscomp$inline_149_JSCompiler_url$jscomp$inline_152$$)) {
        $JSCompiler_url$jscomp$inline_134_JSCompiler_url$jscomp$inline_149_JSCompiler_url$jscomp$inline_152$$ = $JSCompiler_opt_cache$jscomp$inline_153$$.get($JSCompiler_url$jscomp$inline_134_JSCompiler_url$jscomp$inline_149_JSCompiler_url$jscomp$inline_152$$);
      } else {
        $JSCompiler_a$jscomp$inline_154_JSCompiler_frozen$jscomp$inline_156$$.href = $JSCompiler_url$jscomp$inline_134_JSCompiler_url$jscomp$inline_149_JSCompiler_url$jscomp$inline_152$$;
        $JSCompiler_a$jscomp$inline_154_JSCompiler_frozen$jscomp$inline_156$$.protocol || ($JSCompiler_a$jscomp$inline_154_JSCompiler_frozen$jscomp$inline_156$$.href = $JSCompiler_a$jscomp$inline_154_JSCompiler_frozen$jscomp$inline_156$$.href);
        var $JSCompiler_info$jscomp$inline_155$$ = {href:$JSCompiler_a$jscomp$inline_154_JSCompiler_frozen$jscomp$inline_156$$.href, protocol:$JSCompiler_a$jscomp$inline_154_JSCompiler_frozen$jscomp$inline_156$$.protocol, host:$JSCompiler_a$jscomp$inline_154_JSCompiler_frozen$jscomp$inline_156$$.host, hostname:$JSCompiler_a$jscomp$inline_154_JSCompiler_frozen$jscomp$inline_156$$.hostname, port:"0" == $JSCompiler_a$jscomp$inline_154_JSCompiler_frozen$jscomp$inline_156$$.port ? "" : $JSCompiler_a$jscomp$inline_154_JSCompiler_frozen$jscomp$inline_156$$.port, 
        pathname:$JSCompiler_a$jscomp$inline_154_JSCompiler_frozen$jscomp$inline_156$$.pathname, search:$JSCompiler_a$jscomp$inline_154_JSCompiler_frozen$jscomp$inline_156$$.search, hash:$JSCompiler_a$jscomp$inline_154_JSCompiler_frozen$jscomp$inline_156$$.hash, origin:null};
        "/" !== $JSCompiler_info$jscomp$inline_155$$.pathname[0] && ($JSCompiler_info$jscomp$inline_155$$.pathname = "/" + $JSCompiler_info$jscomp$inline_155$$.pathname);
        if ("http:" == $JSCompiler_info$jscomp$inline_155$$.protocol && 80 == $JSCompiler_info$jscomp$inline_155$$.port || "https:" == $JSCompiler_info$jscomp$inline_155$$.protocol && 443 == $JSCompiler_info$jscomp$inline_155$$.port) {
          $JSCompiler_info$jscomp$inline_155$$.port = "", $JSCompiler_info$jscomp$inline_155$$.host = $JSCompiler_info$jscomp$inline_155$$.hostname;
        }
        $JSCompiler_info$jscomp$inline_155$$.origin = $JSCompiler_a$jscomp$inline_154_JSCompiler_frozen$jscomp$inline_156$$.origin && "null" != $JSCompiler_a$jscomp$inline_154_JSCompiler_frozen$jscomp$inline_156$$.origin ? $JSCompiler_a$jscomp$inline_154_JSCompiler_frozen$jscomp$inline_156$$.origin : "data:" != $JSCompiler_info$jscomp$inline_155$$.protocol && $JSCompiler_info$jscomp$inline_155$$.host ? $JSCompiler_info$jscomp$inline_155$$.protocol + "//" + $JSCompiler_info$jscomp$inline_155$$.host : 
        $JSCompiler_info$jscomp$inline_155$$.href;
        $JSCompiler_a$jscomp$inline_154_JSCompiler_frozen$jscomp$inline_156$$ = $JSCompiler_info$jscomp$inline_155$$;
        $JSCompiler_opt_cache$jscomp$inline_153$$ && $JSCompiler_opt_cache$jscomp$inline_153$$.put($JSCompiler_url$jscomp$inline_134_JSCompiler_url$jscomp$inline_149_JSCompiler_url$jscomp$inline_152$$, $JSCompiler_a$jscomp$inline_154_JSCompiler_frozen$jscomp$inline_156$$);
        $JSCompiler_url$jscomp$inline_134_JSCompiler_url$jscomp$inline_149_JSCompiler_url$jscomp$inline_152$$ = $JSCompiler_a$jscomp$inline_154_JSCompiler_frozen$jscomp$inline_156$$;
      }
    }
    if (!$urls$$module$src$config$$.cdnProxyRegex.test($JSCompiler_url$jscomp$inline_134_JSCompiler_url$jscomp$inline_149_JSCompiler_url$jscomp$inline_152$$.origin)) {
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
  } catch ($e$jscomp$23$$) {
    $object$jscomp$1_stack$jscomp$1$$ = $e$jscomp$23$$.stack;
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
;new function($win$jscomp$84$$) {
  if ($win$jscomp$84$$.ampInaboxInitialized) {
    $dev$$module$src$log$$().info("inabox-host", "Skip a 2nd attempt of initializing AMP inabox host.");
  } else {
    $win$jscomp$84$$.ampInaboxInitialized = !0;
    $logConstructor$$module$src$log$$ = $Log$$module$src$log$$;
    $dev$$module$src$log$$();
    $user$$module$src$log$$();
    $setReportError$$module$src$log$$();
    $win$jscomp$84$$.ampInaboxIframes && !Array.isArray($win$jscomp$84$$.ampInaboxIframes) && ($dev$$module$src$log$$().info("inabox-host", "Invalid %s. %s", "ampInaboxIframes", $win$jscomp$84$$.ampInaboxIframes), $win$jscomp$84$$.ampInaboxIframes = []);
    var $host$$ = new $InaboxMessagingHost$$module$ads$inabox$inabox_messaging_host$$($win$jscomp$84$$, $win$jscomp$84$$.ampInaboxIframes);
    $win$jscomp$84$$.AMP = $win$jscomp$84$$.AMP || {};
    $win$jscomp$84$$.AMP.inaboxUnregisterIframe ? $dev$$module$src$log$$().info("inabox-host", "win.AMP[inaboxUnregisterIframe] already defined}") : $win$jscomp$84$$.AMP.inaboxUnregisterIframe = $host$$.unregisterIframe.bind($host$$);
    var $queuedMsgs$$ = $win$jscomp$84$$.ampInaboxPendingMessages, $processMessageFn$$ = function($win$jscomp$84$$) {
      try {
        $host$$.processMessage($win$jscomp$84$$);
      } catch ($err$jscomp$4$$) {
        $dev$$module$src$log$$().error("inabox-host", "Error processing inabox message", $win$jscomp$84$$, $err$jscomp$4$$);
      }
    };
    $queuedMsgs$$ && (Array.isArray($queuedMsgs$$) ? $queuedMsgs$$.forEach(function($win$jscomp$84$$) {
      var $host$$ = !(!$win$jscomp$84$$.source || !$win$jscomp$84$$.source.postMessage);
      $host$$ || $user$$module$src$log$$().error("inabox-host", "Missing message.source. message.data=" + JSON.stringify($win$jscomp$84$$.data));
      $host$$ && $processMessageFn$$($win$jscomp$84$$);
    }) : $dev$$module$src$log$$().info("inabox-host", "Invalid %s %s", "ampInaboxPendingMessages", $queuedMsgs$$));
    $win$jscomp$84$$.ampInaboxPendingMessages = [];
    $win$jscomp$84$$.ampInaboxPendingMessages.push = function() {
    };
    $win$jscomp$84$$.addEventListener("message", $processMessageFn$$.bind($host$$));
  }
}(self);
})();
//# sourceMappingURL=amp4ads-host-v0.js.map

