(self.AMP=self.AMP||[]).push({n:"amp-image-lightbox",v:"2007210308000",f:(function(AMP,_){
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
var $JSCompiler_temp$jscomp$19$$;
if ("function" == typeof Object.setPrototypeOf) {
  $JSCompiler_temp$jscomp$19$$ = Object.setPrototypeOf;
} else {
  var $JSCompiler_inline_result$jscomp$20$$;
  a: {
    var $JSCompiler_x$jscomp$inline_41$$ = {a:!0}, $JSCompiler_y$jscomp$inline_42$$ = {};
    try {
      $JSCompiler_y$jscomp$inline_42$$.__proto__ = $JSCompiler_x$jscomp$inline_41$$;
      $JSCompiler_inline_result$jscomp$20$$ = $JSCompiler_y$jscomp$inline_42$$.a;
      break a;
    } catch ($JSCompiler_e$jscomp$inline_43$$) {
    }
    $JSCompiler_inline_result$jscomp$20$$ = !1;
  }
  $JSCompiler_temp$jscomp$19$$ = $JSCompiler_inline_result$jscomp$20$$ ? function($target$jscomp$95$$, $proto$jscomp$3$$) {
    $target$jscomp$95$$.__proto__ = $proto$jscomp$3$$;
    if ($target$jscomp$95$$.__proto__ !== $proto$jscomp$3$$) {
      throw new TypeError($target$jscomp$95$$ + " is not extensible");
    }
    return $target$jscomp$95$$;
  } : null;
}
var $$jscomp$setPrototypeOf$$ = $JSCompiler_temp$jscomp$19$$;
function $$jscomp$inherits$$($childCtor$$, $parentCtor$$) {
  $childCtor$$.prototype = $$jscomp$objectCreate$$($parentCtor$$.prototype);
  $childCtor$$.prototype.constructor = $childCtor$$;
  if ($$jscomp$setPrototypeOf$$) {
    $$jscomp$setPrototypeOf$$($childCtor$$, $parentCtor$$);
  } else {
    for (var $p$$ in $parentCtor$$) {
      if ("prototype" != $p$$) {
        if (Object.defineProperties) {
          var $descriptor$jscomp$2$$ = Object.getOwnPropertyDescriptor($parentCtor$$, $p$$);
          $descriptor$jscomp$2$$ && Object.defineProperty($childCtor$$, $p$$, $descriptor$jscomp$2$$);
        } else {
          $childCtor$$[$p$$] = $parentCtor$$[$p$$];
        }
      }
    }
  }
  $childCtor$$.$superClass_$ = $parentCtor$$.prototype;
}
var $resolved$$module$src$resolved_promise$$;
function $resolvedPromise$$module$src$resolved_promise$$() {
  return $resolved$$module$src$resolved_promise$$ ? $resolved$$module$src$resolved_promise$$ : $resolved$$module$src$resolved_promise$$ = Promise.resolve(void 0);
}
;function $Deferred$$module$src$utils$promise$$() {
  var $resolve$$, $reject$$;
  this.promise = new Promise(function($res$$, $rej$$) {
    $resolve$$ = $res$$;
    $reject$$ = $rej$$;
  });
  this.resolve = $resolve$$;
  this.reject = $reject$$;
}
;/*
 https://mths.be/cssescape v1.5.1 by @mathias | MIT license */
function $tryDecodeUriComponent_$$module$src$url_try_decode_uri_component$$($component$jscomp$4$$, $fallback$$) {
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
  if (self.document && self.document.head && (!self.location || !$cdnProxyRegex$$module$src$config$$.test(self.location.origin))) {
    var $metaEl$$ = self.document.head.querySelector('meta[name="' + $name$jscomp$72$$ + '"]');
    $metaEl$$ && $metaEl$$.getAttribute("content");
  }
}
$env$$module$src$config$$.cdnUrl || $getMetaUrl$$module$src$config$$("runtime-host");
$env$$module$src$config$$.geoApiUrl || $getMetaUrl$$module$src$config$$("amp-geo-api");
self.__AMP_LOG = self.__AMP_LOG || {user:null, dev:null, userForEmbed:null};
var $logs$$module$src$log$$ = self.__AMP_LOG;
function $dev$$module$src$log$$() {
  if ($logs$$module$src$log$$.dev) {
    return $logs$$module$src$log$$.dev;
  }
  throw Error("failed to call initLogConstructor");
}
function $userAssert$$module$src$log$$($shouldBeTrueish$jscomp$3$$, $opt_message$jscomp$15$$, $opt_1$jscomp$1$$) {
  if (!$logs$$module$src$log$$.user) {
    throw Error("failed to call initLogConstructor");
  }
  return $logs$$module$src$log$$.user.assert($shouldBeTrueish$jscomp$3$$, $opt_message$jscomp$15$$, $opt_1$jscomp$1$$, void 0, void 0, void 0, void 0, void 0, void 0, void 0, void 0);
}
;var $scopeSelectorSupported$$module$src$css$$;
var $hasOwn_$$module$src$utils$object$$ = Object.prototype.hasOwnProperty;
function $startsWith$$module$src$string$$($string$jscomp$6$$, $prefix$jscomp$4$$) {
  return $prefix$jscomp$4$$.length > $string$jscomp$6$$.length ? !1 : 0 == $string$jscomp$6$$.lastIndexOf($prefix$jscomp$4$$, 0);
}
;function $closest$$module$src$dom$$($el$jscomp$2_element$jscomp$18$$, $callback$jscomp$53$$) {
  for (; $el$jscomp$2_element$jscomp$18$$ && void 0 !== $el$jscomp$2_element$jscomp$18$$; $el$jscomp$2_element$jscomp$18$$ = $el$jscomp$2_element$jscomp$18$$.parentElement) {
    if ($callback$jscomp$53$$($el$jscomp$2_element$jscomp$18$$)) {
      return $el$jscomp$2_element$jscomp$18$$;
    }
  }
  return null;
}
function $closestAncestorElementBySelector$$module$src$dom$$($element$jscomp$19$$) {
  return $element$jscomp$19$$.closest ? $element$jscomp$19$$.closest("figure") : $closest$$module$src$dom$$($element$jscomp$19$$, function($element$jscomp$19$$) {
    var $el$jscomp$3$$ = $element$jscomp$19$$.matches || $element$jscomp$19$$.webkitMatchesSelector || $element$jscomp$19$$.mozMatchesSelector || $element$jscomp$19$$.msMatchesSelector || $element$jscomp$19$$.oMatchesSelector;
    return $el$jscomp$3$$ ? $el$jscomp$3$$.call($element$jscomp$19$$, "figure") : !1;
  });
}
;var $propertyNameCache$$module$src$style$$, $vendorPrefixes$$module$src$style$$ = "Webkit webkit Moz moz ms O o".split(" ");
function $setStyle$$module$src$style$$($element$jscomp$34$$, $JSCompiler_inline_result$jscomp$28_property$jscomp$7_propertyName$jscomp$10$$, $value$jscomp$96$$) {
  var $JSCompiler_style$jscomp$inline_56$$ = $element$jscomp$34$$.style;
  if (!$startsWith$$module$src$string$$($JSCompiler_inline_result$jscomp$28_property$jscomp$7_propertyName$jscomp$10$$, "--")) {
    $propertyNameCache$$module$src$style$$ || ($propertyNameCache$$module$src$style$$ = Object.create(null));
    var $JSCompiler_propertyName$jscomp$inline_59$$ = $propertyNameCache$$module$src$style$$[$JSCompiler_inline_result$jscomp$28_property$jscomp$7_propertyName$jscomp$10$$];
    if (!$JSCompiler_propertyName$jscomp$inline_59$$) {
      $JSCompiler_propertyName$jscomp$inline_59$$ = $JSCompiler_inline_result$jscomp$28_property$jscomp$7_propertyName$jscomp$10$$;
      if (void 0 === $JSCompiler_style$jscomp$inline_56$$[$JSCompiler_inline_result$jscomp$28_property$jscomp$7_propertyName$jscomp$10$$]) {
        var $JSCompiler_inline_result$jscomp$170_JSCompiler_inline_result$jscomp$171_JSCompiler_prefixedPropertyName$jscomp$inline_61$$ = $JSCompiler_inline_result$jscomp$28_property$jscomp$7_propertyName$jscomp$10$$.charAt(0).toUpperCase() + $JSCompiler_inline_result$jscomp$28_property$jscomp$7_propertyName$jscomp$10$$.slice(1);
        b: {
          for (var $JSCompiler_i$jscomp$inline_185$$ = 0; $JSCompiler_i$jscomp$inline_185$$ < $vendorPrefixes$$module$src$style$$.length; $JSCompiler_i$jscomp$inline_185$$++) {
            var $JSCompiler_propertyName$jscomp$inline_186$$ = $vendorPrefixes$$module$src$style$$[$JSCompiler_i$jscomp$inline_185$$] + $JSCompiler_inline_result$jscomp$170_JSCompiler_inline_result$jscomp$171_JSCompiler_prefixedPropertyName$jscomp$inline_61$$;
            if (void 0 !== $JSCompiler_style$jscomp$inline_56$$[$JSCompiler_propertyName$jscomp$inline_186$$]) {
              $JSCompiler_inline_result$jscomp$170_JSCompiler_inline_result$jscomp$171_JSCompiler_prefixedPropertyName$jscomp$inline_61$$ = $JSCompiler_propertyName$jscomp$inline_186$$;
              break b;
            }
          }
          $JSCompiler_inline_result$jscomp$170_JSCompiler_inline_result$jscomp$171_JSCompiler_prefixedPropertyName$jscomp$inline_61$$ = "";
        }
        void 0 !== $JSCompiler_style$jscomp$inline_56$$[$JSCompiler_inline_result$jscomp$170_JSCompiler_inline_result$jscomp$171_JSCompiler_prefixedPropertyName$jscomp$inline_61$$] && ($JSCompiler_propertyName$jscomp$inline_59$$ = $JSCompiler_inline_result$jscomp$170_JSCompiler_inline_result$jscomp$171_JSCompiler_prefixedPropertyName$jscomp$inline_61$$);
      }
      $propertyNameCache$$module$src$style$$[$JSCompiler_inline_result$jscomp$28_property$jscomp$7_propertyName$jscomp$10$$] = $JSCompiler_propertyName$jscomp$inline_59$$;
    }
    $JSCompiler_inline_result$jscomp$28_property$jscomp$7_propertyName$jscomp$10$$ = $JSCompiler_propertyName$jscomp$inline_59$$;
  }
  $JSCompiler_inline_result$jscomp$28_property$jscomp$7_propertyName$jscomp$10$$ && ($startsWith$$module$src$string$$($JSCompiler_inline_result$jscomp$28_property$jscomp$7_propertyName$jscomp$10$$, "--") ? $element$jscomp$34$$.style.setProperty($JSCompiler_inline_result$jscomp$28_property$jscomp$7_propertyName$jscomp$10$$, $value$jscomp$96$$) : $element$jscomp$34$$.style[$JSCompiler_inline_result$jscomp$28_property$jscomp$7_propertyName$jscomp$10$$] = $value$jscomp$96$$);
}
function $setStyles$$module$src$style$$($element$jscomp$36$$, $styles$jscomp$1$$) {
  for (var $k$jscomp$3$$ in $styles$jscomp$1$$) {
    $setStyle$$module$src$style$$($element$jscomp$36$$, $k$jscomp$3$$, $styles$jscomp$1$$[$k$jscomp$3$$]);
  }
}
function $toggle$$module$src$style$$($element$jscomp$37$$) {
  var $opt_display$$ = !0;
  void 0 === $opt_display$$ && ($opt_display$$ = $element$jscomp$37$$.hasAttribute("hidden"));
  $opt_display$$ ? $element$jscomp$37$$.removeAttribute("hidden") : $element$jscomp$37$$.setAttribute("hidden", "");
}
;function $bezierCurve$$module$src$curve$$($x1$jscomp$5$$, $y1$jscomp$5$$, $x2$jscomp$3$$, $y2$jscomp$3$$) {
  var $bezier$$ = new $Bezier$$module$src$curve$$($x1$jscomp$5$$, $y1$jscomp$5$$, $x2$jscomp$3$$, $y2$jscomp$3$$);
  return $bezier$$.solveYValueFromXValue.bind($bezier$$);
}
function $Bezier$$module$src$curve$$($x1$jscomp$6$$, $y1$jscomp$6$$, $x2$jscomp$4$$, $y2$jscomp$4$$) {
  this.y0 = this.x0 = 0;
  this.x1 = $x1$jscomp$6$$;
  this.y1 = $y1$jscomp$6$$;
  this.x2 = $x2$jscomp$4$$;
  this.y2 = $y2$jscomp$4$$;
  this.y3 = this.x3 = 1;
}
$JSCompiler_prototypeAlias$$ = $Bezier$$module$src$curve$$.prototype;
$JSCompiler_prototypeAlias$$.solveYValueFromXValue = function($xVal$$) {
  return this.getPointY(this.solvePositionFromXValue($xVal$$));
};
$JSCompiler_prototypeAlias$$.solvePositionFromXValue = function($xVal$jscomp$1$$) {
  var $t$$ = ($xVal$jscomp$1$$ - this.x0) / (this.x3 - this.x0);
  if (0 >= $t$$) {
    return 0;
  }
  if (1 <= $t$$) {
    return 1;
  }
  for (var $tMin$$ = 0, $tMax$$ = 1, $value$jscomp$103$$ = 0, $i$2_i$jscomp$16$$ = 0; 8 > $i$2_i$jscomp$16$$; $i$2_i$jscomp$16$$++) {
    $value$jscomp$103$$ = this.getPointX($t$$);
    var $derivative$$ = (this.getPointX($t$$ + 1e-6) - $value$jscomp$103$$) / 1e-6;
    if (1e-6 > Math.abs($value$jscomp$103$$ - $xVal$jscomp$1$$)) {
      return $t$$;
    }
    if (1e-6 > Math.abs($derivative$$)) {
      break;
    } else {
      $value$jscomp$103$$ < $xVal$jscomp$1$$ ? $tMin$$ = $t$$ : $tMax$$ = $t$$, $t$$ -= ($value$jscomp$103$$ - $xVal$jscomp$1$$) / $derivative$$;
    }
  }
  for ($i$2_i$jscomp$16$$ = 0; 1e-6 < Math.abs($value$jscomp$103$$ - $xVal$jscomp$1$$) && 8 > $i$2_i$jscomp$16$$; $i$2_i$jscomp$16$$++) {
    $value$jscomp$103$$ < $xVal$jscomp$1$$ ? ($tMin$$ = $t$$, $t$$ = ($t$$ + $tMax$$) / 2) : ($tMax$$ = $t$$, $t$$ = ($t$$ + $tMin$$) / 2), $value$jscomp$103$$ = this.getPointX($t$$);
  }
  return $t$$;
};
$JSCompiler_prototypeAlias$$.getPointX = function($t$jscomp$1$$) {
  if (0 == $t$jscomp$1$$) {
    return this.x0;
  }
  if (1 == $t$jscomp$1$$) {
    return this.x3;
  }
  var $ix0$$ = this.lerp(this.x0, this.x1, $t$jscomp$1$$), $ix1$$ = this.lerp(this.x1, this.x2, $t$jscomp$1$$), $ix2$$ = this.lerp(this.x2, this.x3, $t$jscomp$1$$);
  $ix0$$ = this.lerp($ix0$$, $ix1$$, $t$jscomp$1$$);
  $ix1$$ = this.lerp($ix1$$, $ix2$$, $t$jscomp$1$$);
  return this.lerp($ix0$$, $ix1$$, $t$jscomp$1$$);
};
$JSCompiler_prototypeAlias$$.getPointY = function($t$jscomp$2$$) {
  if (0 == $t$jscomp$2$$) {
    return this.y0;
  }
  if (1 == $t$jscomp$2$$) {
    return this.y3;
  }
  var $iy0$$ = this.lerp(this.y0, this.y1, $t$jscomp$2$$), $iy1$$ = this.lerp(this.y1, this.y2, $t$jscomp$2$$), $iy2$$ = this.lerp(this.y2, this.y3, $t$jscomp$2$$);
  $iy0$$ = this.lerp($iy0$$, $iy1$$, $t$jscomp$2$$);
  $iy1$$ = this.lerp($iy1$$, $iy2$$, $t$jscomp$2$$);
  return this.lerp($iy0$$, $iy1$$, $t$jscomp$2$$);
};
$JSCompiler_prototypeAlias$$.lerp = function($a$jscomp$2$$, $b$jscomp$3$$, $x$jscomp$84$$) {
  return $a$jscomp$2$$ + $x$jscomp$84$$ * ($b$jscomp$3$$ - $a$jscomp$2$$);
};
var $Curves$$module$src$curve$EASE$$ = $bezierCurve$$module$src$curve$$(0.25, 0.1, 0.25, 1.0), $Curves$$module$src$curve$EASE_IN$$ = $bezierCurve$$module$src$curve$$(0.42, 0.0, 1.0, 1.0), $Curves$$module$src$curve$EASE_OUT$$ = $bezierCurve$$module$src$curve$$(0.0, 0.0, 0.58, 1.0), $Curves$$module$src$curve$EASE_IN_OUT$$ = $bezierCurve$$module$src$curve$$(0.42, 0.0, 0.58, 1.0), $NAME_MAP$$module$src$curve$$ = {linear:function($n$jscomp$6$$) {
  return $n$jscomp$6$$;
}, ease:$Curves$$module$src$curve$EASE$$, "ease-in":$Curves$$module$src$curve$EASE_IN$$, "ease-out":$Curves$$module$src$curve$EASE_OUT$$, "ease-in-out":$Curves$$module$src$curve$EASE_IN_OUT$$};
function $getCurve$$module$src$curve$$($curve$$) {
  if (!$curve$$) {
    return null;
  }
  if ("string" == typeof $curve$$) {
    if (-1 != $curve$$.indexOf("cubic-bezier")) {
      var $match$jscomp$4_values$jscomp$11$$ = $curve$$.match(/cubic-bezier\((.+)\)/);
      if ($match$jscomp$4_values$jscomp$11$$ && ($match$jscomp$4_values$jscomp$11$$ = $match$jscomp$4_values$jscomp$11$$[1].split(",").map(parseFloat), 4 == $match$jscomp$4_values$jscomp$11$$.length)) {
        for (var $i$jscomp$17$$ = 0; 4 > $i$jscomp$17$$; $i$jscomp$17$$++) {
          if (isNaN($match$jscomp$4_values$jscomp$11$$[$i$jscomp$17$$])) {
            return null;
          }
        }
        return $bezierCurve$$module$src$curve$$($match$jscomp$4_values$jscomp$11$$[0], $match$jscomp$4_values$jscomp$11$$[1], $match$jscomp$4_values$jscomp$11$$[2], $match$jscomp$4_values$jscomp$11$$[3]);
      }
      return null;
    }
    return $NAME_MAP$$module$src$curve$$[$curve$$];
  }
  return $curve$$;
}
;function $concat$$module$src$transition$$($transitions$jscomp$1$$) {
  var $opt_delimiter$$ = void 0 === $opt_delimiter$$ ? " " : $opt_delimiter$$;
  return function($time$jscomp$2$$, $complete$jscomp$1$$) {
    for (var $results$$ = [], $i$jscomp$19$$ = 0; $i$jscomp$19$$ < $transitions$jscomp$1$$.length; $i$jscomp$19$$++) {
      var $result$jscomp$2$$ = (0,$transitions$jscomp$1$$[$i$jscomp$19$$])($time$jscomp$2$$, $complete$jscomp$1$$);
      "string" == typeof $result$jscomp$2$$ && $results$$.push($result$jscomp$2$$);
    }
    return $results$$.join($opt_delimiter$$);
  };
}
function $setStyles$$module$src$transition$$($element$jscomp$39$$, $styles$jscomp$3$$) {
  return function($time$jscomp$4$$, $complete$jscomp$3$$) {
    for (var $k$jscomp$4$$ in $styles$jscomp$3$$) {
      var $JSCompiler_style$jscomp$inline_63$$ = $k$jscomp$4$$;
      "display" === $JSCompiler_style$jscomp$inline_63$$ && $dev$$module$src$log$$().error("STYLE", "`display` style detected. You must use toggle instead.");
      $setStyle$$module$src$style$$($element$jscomp$39$$, $JSCompiler_style$jscomp$inline_63$$, $styles$jscomp$3$$[$k$jscomp$4$$]($time$jscomp$4$$, $complete$jscomp$3$$));
    }
  };
}
function $numeric$$module$src$transition$$($start$jscomp$12$$, $end$jscomp$7$$) {
  return function($time$jscomp$5$$) {
    return $start$jscomp$12$$ + ($end$jscomp$7$$ - $start$jscomp$12$$) * $time$jscomp$5$$;
  };
}
function $translate$$module$src$transition$$($transitionX$$, $opt_transitionY$$) {
  return function($time$jscomp$11_y$jscomp$68$$) {
    var $x$jscomp$85$$ = $transitionX$$($time$jscomp$11_y$jscomp$68$$);
    "number" == typeof $x$jscomp$85$$ && ($x$jscomp$85$$ += "px");
    if (!$opt_transitionY$$) {
      return "translate(" + $x$jscomp$85$$ + ")";
    }
    $time$jscomp$11_y$jscomp$68$$ = $opt_transitionY$$($time$jscomp$11_y$jscomp$68$$);
    "number" == typeof $time$jscomp$11_y$jscomp$68$$ && ($time$jscomp$11_y$jscomp$68$$ += "px");
    return "translate(" + $x$jscomp$85$$ + "," + $time$jscomp$11_y$jscomp$68$$ + ")";
  };
}
function $scale$$module$src$transition$$($transition$jscomp$4$$) {
  return function($time$jscomp$12$$) {
    return "scale(" + $transition$jscomp$4$$($time$jscomp$12$$) + ")";
  };
}
;(function($opt_initial$jscomp$1$$) {
  return $opt_initial$jscomp$1$$ || {};
})({c:!0, v:!0, a:!0, ad:!0, action:!0});
function $experimentToggles$$module$src$experiments$$($JSCompiler_params$jscomp$inline_189_win$jscomp$17$$) {
  if ($JSCompiler_params$jscomp$inline_189_win$jscomp$17$$.__AMP__EXPERIMENT_TOGGLES) {
    return $JSCompiler_params$jscomp$inline_189_win$jscomp$17$$.__AMP__EXPERIMENT_TOGGLES;
  }
  $JSCompiler_params$jscomp$inline_189_win$jscomp$17$$.__AMP__EXPERIMENT_TOGGLES = Object.create(null);
  var $toggles$jscomp$2$$ = $JSCompiler_params$jscomp$inline_189_win$jscomp$17$$.__AMP__EXPERIMENT_TOGGLES;
  if ($JSCompiler_params$jscomp$inline_189_win$jscomp$17$$.AMP_CONFIG) {
    for (var $allowed$4_experimentId$jscomp$2_i$jscomp$22$$ in $JSCompiler_params$jscomp$inline_189_win$jscomp$17$$.AMP_CONFIG) {
      var $frequency$$ = $JSCompiler_params$jscomp$inline_189_win$jscomp$17$$.AMP_CONFIG[$allowed$4_experimentId$jscomp$2_i$jscomp$22$$];
      "number" === typeof $frequency$$ && 0 <= $frequency$$ && 1 >= $frequency$$ && ($toggles$jscomp$2$$[$allowed$4_experimentId$jscomp$2_i$jscomp$22$$] = Math.random() < $frequency$$);
    }
  }
  if ($JSCompiler_params$jscomp$inline_189_win$jscomp$17$$.AMP_CONFIG && Array.isArray($JSCompiler_params$jscomp$inline_189_win$jscomp$17$$.AMP_CONFIG["allow-doc-opt-in"]) && 0 < $JSCompiler_params$jscomp$inline_189_win$jscomp$17$$.AMP_CONFIG["allow-doc-opt-in"].length) {
    var $allowed$$ = $JSCompiler_params$jscomp$inline_189_win$jscomp$17$$.AMP_CONFIG["allow-doc-opt-in"], $meta$$ = $JSCompiler_params$jscomp$inline_189_win$jscomp$17$$.document.head.querySelector('meta[name="amp-experiments-opt-in"]');
    if ($meta$$) {
      var $optedInExperiments$$ = $meta$$.getAttribute("content").split(",");
      for ($allowed$4_experimentId$jscomp$2_i$jscomp$22$$ = 0; $allowed$4_experimentId$jscomp$2_i$jscomp$22$$ < $optedInExperiments$$.length; $allowed$4_experimentId$jscomp$2_i$jscomp$22$$++) {
        -1 != $allowed$$.indexOf($optedInExperiments$$[$allowed$4_experimentId$jscomp$2_i$jscomp$22$$]) && ($toggles$jscomp$2$$[$optedInExperiments$$[$allowed$4_experimentId$jscomp$2_i$jscomp$22$$]] = !0);
      }
    }
  }
  Object.assign($toggles$jscomp$2$$, $getExperimentToggles$$module$src$experiments$$($JSCompiler_params$jscomp$inline_189_win$jscomp$17$$));
  if ($JSCompiler_params$jscomp$inline_189_win$jscomp$17$$.AMP_CONFIG && Array.isArray($JSCompiler_params$jscomp$inline_189_win$jscomp$17$$.AMP_CONFIG["allow-url-opt-in"]) && 0 < $JSCompiler_params$jscomp$inline_189_win$jscomp$17$$.AMP_CONFIG["allow-url-opt-in"].length) {
    $allowed$4_experimentId$jscomp$2_i$jscomp$22$$ = $JSCompiler_params$jscomp$inline_189_win$jscomp$17$$.AMP_CONFIG["allow-url-opt-in"];
    var $JSCompiler_queryString$jscomp$inline_188_i$5$$ = $JSCompiler_params$jscomp$inline_189_win$jscomp$17$$.location.originalHash || $JSCompiler_params$jscomp$inline_189_win$jscomp$17$$.location.hash;
    $JSCompiler_params$jscomp$inline_189_win$jscomp$17$$ = Object.create(null);
    if ($JSCompiler_queryString$jscomp$inline_188_i$5$$) {
      for (var $JSCompiler_match$jscomp$inline_190_JSCompiler_value$jscomp$inline_192$$; $JSCompiler_match$jscomp$inline_190_JSCompiler_value$jscomp$inline_192$$ = $regex$$module$src$url_parse_query_string$$.exec($JSCompiler_queryString$jscomp$inline_188_i$5$$);) {
        var $JSCompiler_name$jscomp$inline_191_param$jscomp$7$$ = $tryDecodeUriComponent_$$module$src$url_try_decode_uri_component$$($JSCompiler_match$jscomp$inline_190_JSCompiler_value$jscomp$inline_192$$[1], $JSCompiler_match$jscomp$inline_190_JSCompiler_value$jscomp$inline_192$$[1]);
        $JSCompiler_match$jscomp$inline_190_JSCompiler_value$jscomp$inline_192$$ = $JSCompiler_match$jscomp$inline_190_JSCompiler_value$jscomp$inline_192$$[2] ? $tryDecodeUriComponent_$$module$src$url_try_decode_uri_component$$($JSCompiler_match$jscomp$inline_190_JSCompiler_value$jscomp$inline_192$$[2].replace(/\+/g, " "), $JSCompiler_match$jscomp$inline_190_JSCompiler_value$jscomp$inline_192$$[2]) : "";
        $JSCompiler_params$jscomp$inline_189_win$jscomp$17$$[$JSCompiler_name$jscomp$inline_191_param$jscomp$7$$] = $JSCompiler_match$jscomp$inline_190_JSCompiler_value$jscomp$inline_192$$;
      }
    }
    for ($JSCompiler_queryString$jscomp$inline_188_i$5$$ = 0; $JSCompiler_queryString$jscomp$inline_188_i$5$$ < $allowed$4_experimentId$jscomp$2_i$jscomp$22$$.length; $JSCompiler_queryString$jscomp$inline_188_i$5$$++) {
      $JSCompiler_name$jscomp$inline_191_param$jscomp$7$$ = $JSCompiler_params$jscomp$inline_189_win$jscomp$17$$["e-" + $allowed$4_experimentId$jscomp$2_i$jscomp$22$$[$JSCompiler_queryString$jscomp$inline_188_i$5$$]], "1" == $JSCompiler_name$jscomp$inline_191_param$jscomp$7$$ && ($toggles$jscomp$2$$[$allowed$4_experimentId$jscomp$2_i$jscomp$22$$[$JSCompiler_queryString$jscomp$inline_188_i$5$$]] = !0), "0" == $JSCompiler_name$jscomp$inline_191_param$jscomp$7$$ && ($toggles$jscomp$2$$[$allowed$4_experimentId$jscomp$2_i$jscomp$22$$[$JSCompiler_queryString$jscomp$inline_188_i$5$$]] = 
      !1);
    }
  }
  return $toggles$jscomp$2$$;
}
function $getExperimentToggles$$module$src$experiments$$($toggles$jscomp$3_win$jscomp$19$$) {
  var $experimentsString$$ = "";
  try {
    "localStorage" in $toggles$jscomp$3_win$jscomp$19$$ && ($experimentsString$$ = $toggles$jscomp$3_win$jscomp$19$$.localStorage.getItem("amp-experiment-toggles"));
  } catch ($e$jscomp$14$$) {
    $dev$$module$src$log$$().warn("EXPERIMENTS", "Failed to retrieve experiments from localStorage.");
  }
  var $tokens$$ = $experimentsString$$ ? $experimentsString$$.split(/\s*,\s*/g) : [];
  $toggles$jscomp$3_win$jscomp$19$$ = Object.create(null);
  for (var $i$jscomp$23$$ = 0; $i$jscomp$23$$ < $tokens$$.length; $i$jscomp$23$$++) {
    0 != $tokens$$[$i$jscomp$23$$].length && ("-" == $tokens$$[$i$jscomp$23$$][0] ? $toggles$jscomp$3_win$jscomp$19$$[$tokens$$[$i$jscomp$23$$].substr(1)] = !1 : $toggles$jscomp$3_win$jscomp$19$$[$tokens$$[$i$jscomp$23$$]] = !0);
  }
  return $toggles$jscomp$3_win$jscomp$19$$;
}
;var $EXPERIMENT_INFO_LIST$$module$src$ampdoc_fie$$ = [{experimentId:"ampdoc-fie", isTrafficEligible:function() {
  return !0;
}, branches:["21065001", "21065002"]}];
function $getService$$module$src$service$$($win$jscomp$30$$, $id$jscomp$13$$) {
  $win$jscomp$30$$ = $win$jscomp$30$$.__AMP_TOP || ($win$jscomp$30$$.__AMP_TOP = $win$jscomp$30$$);
  return $getServiceInternal$$module$src$service$$($win$jscomp$30$$, $id$jscomp$13$$);
}
function $getServiceForDoc$$module$src$service$$($elementOrAmpDoc$$) {
  var $ampdoc$jscomp$3_holder$jscomp$2$$ = $getAmpdoc$$module$src$service$$($elementOrAmpDoc$$);
  $ampdoc$jscomp$3_holder$jscomp$2$$ = $getAmpdocServiceHolder$$module$src$service$$($ampdoc$jscomp$3_holder$jscomp$2$$);
  return $getServiceInternal$$module$src$service$$($ampdoc$jscomp$3_holder$jscomp$2$$, "history");
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
  var $JSCompiler_services$jscomp$inline_66$$ = $holder$jscomp$4_s$jscomp$9$$.__AMP_SERVICES;
  $JSCompiler_services$jscomp$inline_66$$ || ($JSCompiler_services$jscomp$inline_66$$ = $holder$jscomp$4_s$jscomp$9$$.__AMP_SERVICES = {});
  $holder$jscomp$4_s$jscomp$9$$ = $JSCompiler_services$jscomp$inline_66$$[$id$jscomp$21$$];
  $holder$jscomp$4_s$jscomp$9$$.obj || ($holder$jscomp$4_s$jscomp$9$$.obj = new $holder$jscomp$4_s$jscomp$9$$.ctor($holder$jscomp$4_s$jscomp$9$$.context), $holder$jscomp$4_s$jscomp$9$$.ctor = null, $holder$jscomp$4_s$jscomp$9$$.context = null, $holder$jscomp$4_s$jscomp$9$$.resolve && $holder$jscomp$4_s$jscomp$9$$.resolve($holder$jscomp$4_s$jscomp$9$$.obj));
  return $holder$jscomp$4_s$jscomp$9$$.obj;
}
function $isServiceRegistered$$module$src$service$$($holder$jscomp$12_service$jscomp$5$$, $id$jscomp$30$$) {
  $holder$jscomp$12_service$jscomp$5$$ = $holder$jscomp$12_service$jscomp$5$$.__AMP_SERVICES && $holder$jscomp$12_service$jscomp$5$$.__AMP_SERVICES[$id$jscomp$30$$];
  return !(!$holder$jscomp$12_service$jscomp$5$$ || !$holder$jscomp$12_service$jscomp$5$$.ctor && !$holder$jscomp$12_service$jscomp$5$$.obj);
}
;function $NOOP_CALLBACK$$module$src$animation$$() {
}
function $Animation$$module$src$animation$$($contextNode$jscomp$2$$) {
  this.$contextNode_$ = $contextNode$jscomp$2$$;
  this.$vsync_$ = $getService$$module$src$service$$(self, "vsync");
  this.$curve_$ = null;
  this.$segments_$ = [];
}
function $Animation$$module$src$animation$animate$$($contextNode$jscomp$3$$, $transition$jscomp$5$$, $duration$jscomp$1$$) {
  var $opt_curve$$ = $PAN_ZOOM_CURVE_$$module$extensions$amp_image_lightbox$0_1$amp_image_lightbox$$;
  return (new $Animation$$module$src$animation$$($contextNode$jscomp$3$$)).setCurve($opt_curve$$).add(0, $transition$jscomp$5$$, 1).start($duration$jscomp$1$$);
}
$Animation$$module$src$animation$$.prototype.setCurve = function($curve$jscomp$2$$) {
  $curve$jscomp$2$$ && (this.$curve_$ = $getCurve$$module$src$curve$$($curve$jscomp$2$$));
  return this;
};
$Animation$$module$src$animation$$.prototype.add = function($delay$$, $transition$jscomp$6$$, $duration$jscomp$2$$, $opt_curve$jscomp$1$$) {
  this.$segments_$.push({delay:$delay$$, func:$transition$jscomp$6$$, duration:$duration$jscomp$2$$, curve:$getCurve$$module$src$curve$$($opt_curve$jscomp$1$$)});
  return this;
};
$Animation$$module$src$animation$$.prototype.start = function($duration$jscomp$3$$) {
  return new $AnimationPlayer$$module$src$animation$$(this.$vsync_$, this.$contextNode_$, this.$segments_$, this.$curve_$, $duration$jscomp$3$$);
};
function $AnimationPlayer$$module$src$animation$$($vsync$$, $contextNode$jscomp$4_i$jscomp$26$$, $deferred$jscomp$2_segments$jscomp$2$$, $defaultCurve$$, $duration$jscomp$4$$) {
  this.$vsync_$ = $vsync$$;
  this.$contextNode_$ = $contextNode$jscomp$4_i$jscomp$26$$;
  this.$segments_$ = [];
  for ($contextNode$jscomp$4_i$jscomp$26$$ = 0; $contextNode$jscomp$4_i$jscomp$26$$ < $deferred$jscomp$2_segments$jscomp$2$$.length; $contextNode$jscomp$4_i$jscomp$26$$++) {
    var $segment$$ = $deferred$jscomp$2_segments$jscomp$2$$[$contextNode$jscomp$4_i$jscomp$26$$];
    this.$segments_$.push({delay:$segment$$.delay, func:$segment$$.func, duration:$segment$$.duration, curve:$segment$$.curve || $defaultCurve$$, started:!1, completed:!1});
  }
  this.$duration_$ = $duration$jscomp$4$$;
  this.$startTime_$ = Date.now();
  this.$running_$ = !0;
  this.$state_$ = {};
  $deferred$jscomp$2_segments$jscomp$2$$ = new $Deferred$$module$src$utils$promise$$;
  this.$promise_$ = $deferred$jscomp$2_segments$jscomp$2$$.promise;
  this.$resolve_$ = $deferred$jscomp$2_segments$jscomp$2$$.resolve;
  this.$reject_$ = $deferred$jscomp$2_segments$jscomp$2$$.reject;
  this.$task_$ = this.$vsync_$.createAnimTask(this.$contextNode_$, {mutate:this.$stepMutate_$.bind(this)});
  this.$vsync_$.canAnimate(this.$contextNode_$) ? this.$task_$(this.$state_$) : ($dev$$module$src$log$$().warn("Animation", "cannot animate"), $JSCompiler_StaticMethods_complete_$$(this, !1, 0));
}
$AnimationPlayer$$module$src$animation$$.prototype.then = function($opt_resolve$jscomp$1$$, $opt_reject$jscomp$1$$) {
  return $opt_resolve$jscomp$1$$ || $opt_reject$jscomp$1$$ ? this.$promise_$.then($opt_resolve$jscomp$1$$, $opt_reject$jscomp$1$$) : this.$promise_$;
};
$AnimationPlayer$$module$src$animation$$.prototype.thenAlways = function($callback$jscomp$59_opt_callback$jscomp$5$$) {
  $callback$jscomp$59_opt_callback$jscomp$5$$ = $callback$jscomp$59_opt_callback$jscomp$5$$ || $NOOP_CALLBACK$$module$src$animation$$;
  return this.then($callback$jscomp$59_opt_callback$jscomp$5$$, $callback$jscomp$59_opt_callback$jscomp$5$$);
};
$AnimationPlayer$$module$src$animation$$.prototype.halt = function($opt_dir$$) {
  $JSCompiler_StaticMethods_complete_$$(this, !1, $opt_dir$$ || 0);
};
function $JSCompiler_StaticMethods_complete_$$($JSCompiler_StaticMethods_complete_$self$$, $success$$, $dir$jscomp$1_i$jscomp$27$$) {
  if ($JSCompiler_StaticMethods_complete_$self$$.$running_$) {
    $JSCompiler_StaticMethods_complete_$self$$.$running_$ = !1;
    if (0 != $dir$jscomp$1_i$jscomp$27$$) {
      1 < $JSCompiler_StaticMethods_complete_$self$$.$segments_$.length && $JSCompiler_StaticMethods_complete_$self$$.$segments_$.sort(function($JSCompiler_StaticMethods_complete_$self$$, $success$$) {
        return $JSCompiler_StaticMethods_complete_$self$$.delay + $JSCompiler_StaticMethods_complete_$self$$.duration - ($success$$.delay + $success$$.duration);
      });
      try {
        if (0 < $dir$jscomp$1_i$jscomp$27$$) {
          for ($dir$jscomp$1_i$jscomp$27$$ = 0; $dir$jscomp$1_i$jscomp$27$$ < $JSCompiler_StaticMethods_complete_$self$$.$segments_$.length; $dir$jscomp$1_i$jscomp$27$$++) {
            $JSCompiler_StaticMethods_complete_$self$$.$segments_$[$dir$jscomp$1_i$jscomp$27$$].func(1, !0);
          }
        } else {
          for (var $i$6$$ = $JSCompiler_StaticMethods_complete_$self$$.$segments_$.length - 1; 0 <= $i$6$$; $i$6$$--) {
            $JSCompiler_StaticMethods_complete_$self$$.$segments_$[$i$6$$].func(0, !1);
          }
        }
      } catch ($e$jscomp$18$$) {
        $dev$$module$src$log$$().error("Animation", "completion failed: " + $e$jscomp$18$$, $e$jscomp$18$$), $success$$ = !1;
      }
    }
    $success$$ ? $JSCompiler_StaticMethods_complete_$self$$.$resolve_$() : $JSCompiler_StaticMethods_complete_$self$$.$reject_$();
  }
}
$AnimationPlayer$$module$src$animation$$.prototype.$stepMutate_$ = function() {
  if (this.$running_$) {
    for (var $currentTime$$ = Date.now(), $normLinearTime$$ = Math.min(($currentTime$$ - this.$startTime_$) / this.$duration_$, 1), $i$7_i$jscomp$28$$ = 0; $i$7_i$jscomp$28$$ < this.$segments_$.length; $i$7_i$jscomp$28$$++) {
      var $segment$8_segment$jscomp$1$$ = this.$segments_$[$i$7_i$jscomp$28$$];
      !$segment$8_segment$jscomp$1$$.started && $normLinearTime$$ >= $segment$8_segment$jscomp$1$$.delay && ($segment$8_segment$jscomp$1$$.started = !0);
    }
    for ($i$7_i$jscomp$28$$ = 0; $i$7_i$jscomp$28$$ < this.$segments_$.length; $i$7_i$jscomp$28$$++) {
      if ($segment$8_segment$jscomp$1$$ = this.$segments_$[$i$7_i$jscomp$28$$], $segment$8_segment$jscomp$1$$.started && !$segment$8_segment$jscomp$1$$.completed) {
        a: {
          var $JSCompiler_normLinearTime$jscomp$inline_71$$;
          if (0 < $segment$8_segment$jscomp$1$$.duration) {
            var $JSCompiler_normTime$jscomp$inline_72$$ = $JSCompiler_normLinearTime$jscomp$inline_71$$ = Math.min(($normLinearTime$$ - $segment$8_segment$jscomp$1$$.delay) / $segment$8_segment$jscomp$1$$.duration, 1);
            if ($segment$8_segment$jscomp$1$$.curve && 1 != $JSCompiler_normTime$jscomp$inline_72$$) {
              try {
                $JSCompiler_normTime$jscomp$inline_72$$ = $segment$8_segment$jscomp$1$$.curve($JSCompiler_normLinearTime$jscomp$inline_71$$);
              } catch ($JSCompiler_e$jscomp$inline_73$$) {
                $dev$$module$src$log$$().error("Animation", "step curve failed: " + $JSCompiler_e$jscomp$inline_73$$, $JSCompiler_e$jscomp$inline_73$$);
                $JSCompiler_StaticMethods_complete_$$(this, !1, 0);
                break a;
              }
            }
          } else {
            $JSCompiler_normTime$jscomp$inline_72$$ = $JSCompiler_normLinearTime$jscomp$inline_71$$ = 1;
          }
          1 == $JSCompiler_normLinearTime$jscomp$inline_71$$ && ($segment$8_segment$jscomp$1$$.completed = !0);
          try {
            $segment$8_segment$jscomp$1$$.func($JSCompiler_normTime$jscomp$inline_72$$, $segment$8_segment$jscomp$1$$.completed);
          } catch ($e$9$jscomp$inline_74$$) {
            $dev$$module$src$log$$().error("Animation", "step mutate failed: " + $e$9$jscomp$inline_74$$, $e$9$jscomp$inline_74$$), $JSCompiler_StaticMethods_complete_$$(this, !1, 0);
          }
        }
      }
    }
    1 == $normLinearTime$$ ? $JSCompiler_StaticMethods_complete_$$(this, !0, 0) : this.$vsync_$.canAnimate(this.$contextNode_$) ? this.$task_$(this.$state_$) : ($dev$$module$src$log$$().warn("Animation", "cancel animation"), $JSCompiler_StaticMethods_complete_$$(this, !1, 0));
  }
};
function $Observable$$module$src$observable$$() {
  this.$handlers_$ = null;
}
$JSCompiler_prototypeAlias$$ = $Observable$$module$src$observable$$.prototype;
$JSCompiler_prototypeAlias$$.add = function($handler$jscomp$3$$) {
  var $$jscomp$this$jscomp$2$$ = this;
  this.$handlers_$ || (this.$handlers_$ = []);
  this.$handlers_$.push($handler$jscomp$3$$);
  return function() {
    $$jscomp$this$jscomp$2$$.remove($handler$jscomp$3$$);
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
    for (var $handlers$$ = this.$handlers_$, $i$jscomp$29$$ = 0; $i$jscomp$29$$ < $handlers$$.length; $i$jscomp$29$$++) {
      (0,$handlers$$[$i$jscomp$29$$])($opt_event$$);
    }
  }
};
$JSCompiler_prototypeAlias$$.getHandlerCount = function() {
  return this.$handlers_$ ? this.$handlers_$.length : 0;
};
function $Pass$$module$src$pass$$($win$jscomp$55$$, $handler$jscomp$6$$) {
  var $$jscomp$this$jscomp$3$$ = this;
  this.$timer_$ = $getService$$module$src$service$$($win$jscomp$55$$, "timer");
  this.$handler_$ = $handler$jscomp$6$$;
  this.$defaultDelay_$ = 0;
  this.$scheduled_$ = -1;
  this.$nextTime_$ = 0;
  this.$running_$ = !1;
  this.$boundPass_$ = function() {
    $$jscomp$this$jscomp$3$$.$pass_$();
  };
}
$Pass$$module$src$pass$$.prototype.isPending = function() {
  return -1 != this.$scheduled_$;
};
$Pass$$module$src$pass$$.prototype.schedule = function($delay$jscomp$1_opt_delay$jscomp$2$$) {
  $delay$jscomp$1_opt_delay$jscomp$2$$ = $delay$jscomp$1_opt_delay$jscomp$2$$ || this.$defaultDelay_$;
  this.$running_$ && 10 > $delay$jscomp$1_opt_delay$jscomp$2$$ && ($delay$jscomp$1_opt_delay$jscomp$2$$ = 10);
  var $nextTime$$ = Date.now() + $delay$jscomp$1_opt_delay$jscomp$2$$;
  return !this.isPending() || -10 > $nextTime$$ - this.$nextTime_$ ? (this.cancel(), this.$nextTime_$ = $nextTime$$, this.$scheduled_$ = this.$timer_$.delay(this.$boundPass_$, $delay$jscomp$1_opt_delay$jscomp$2$$), !0) : !1;
};
$Pass$$module$src$pass$$.prototype.$pass_$ = function() {
  this.$scheduled_$ = -1;
  this.$nextTime_$ = 0;
  this.$running_$ = !0;
  this.$handler_$();
  this.$running_$ = !1;
};
$Pass$$module$src$pass$$.prototype.cancel = function() {
  this.isPending() && (this.$timer_$.cancel(this.$scheduled_$), this.$scheduled_$ = -1);
};
function $findIndex$$module$src$utils$array$$($array$jscomp$10$$, $predicate$jscomp$1$$) {
  for (var $i$jscomp$32$$ = 0; $i$jscomp$32$$ < $array$jscomp$10$$.length; $i$jscomp$32$$++) {
    if ($predicate$jscomp$1$$($array$jscomp$10$$[$i$jscomp$32$$], $i$jscomp$32$$, $array$jscomp$10$$)) {
      return $i$jscomp$32$$;
    }
  }
  return -1;
}
;var $passiveSupported$$module$src$event_helper_listen$$;
function $supportsPassiveEventListener$$module$src$event_helper_listen$$($win$jscomp$56$$) {
  if (void 0 !== $passiveSupported$$module$src$event_helper_listen$$) {
    return $passiveSupported$$module$src$event_helper_listen$$;
  }
  $passiveSupported$$module$src$event_helper_listen$$ = !1;
  try {
    var $options$jscomp$34$$ = {get passive() {
      $passiveSupported$$module$src$event_helper_listen$$ = !0;
      return !1;
    }};
    $win$jscomp$56$$.addEventListener("test-options", null, $options$jscomp$34$$);
    $win$jscomp$56$$.removeEventListener("test-options", null, $options$jscomp$34$$);
  } catch ($err$jscomp$4$$) {
  }
  return $passiveSupported$$module$src$event_helper_listen$$;
}
;function $Gesture$$module$src$gesture$$($type$jscomp$148$$, $data$jscomp$77$$, $time$jscomp$13$$, $event$jscomp$6$$) {
  this.type = $type$jscomp$148$$;
  this.data = $data$jscomp$77$$;
  this.time = $time$jscomp$13$$;
  this.event = $event$jscomp$6$$;
}
function $Gestures$$module$src$gesture$$($element$jscomp$70$$, $shouldNotPreventDefault$$, $shouldStopPropagation$$) {
  this.$element_$ = $element$jscomp$70$$;
  this.$recognizers_$ = [];
  this.$tracking_$ = [];
  this.$ready_$ = [];
  this.$pending_$ = [];
  this.$eventing_$ = null;
  this.$shouldNotPreventDefault_$ = $shouldNotPreventDefault$$;
  this.$shouldStopPropagation_$ = $shouldStopPropagation$$;
  this.$wasEventing_$ = !1;
  this.$pass_$ = new $Pass$$module$src$pass$$($element$jscomp$70$$.ownerDocument.defaultView, this.$doPass_$.bind(this));
  this.$pointerDownObservable_$ = new $Observable$$module$src$observable$$;
  this.$overservers_$ = Object.create(null);
  this.$boundOnTouchStart_$ = this.$onTouchStart_$.bind(this);
  this.$boundOnTouchEnd_$ = this.$onTouchEnd_$.bind(this);
  this.$boundOnTouchMove_$ = this.$onTouchMove_$.bind(this);
  this.$boundOnTouchCancel_$ = this.$onTouchCancel_$.bind(this);
  var $passiveSupported$$ = $supportsPassiveEventListener$$module$src$event_helper_listen$$($element$jscomp$70$$.ownerDocument.defaultView);
  this.$element_$.addEventListener("touchstart", this.$boundOnTouchStart_$, $passiveSupported$$ ? {passive:!0} : !1);
  this.$element_$.addEventListener("touchend", this.$boundOnTouchEnd_$);
  this.$element_$.addEventListener("touchmove", this.$boundOnTouchMove_$, $passiveSupported$$ ? {passive:!0} : !1);
  this.$element_$.addEventListener("touchcancel", this.$boundOnTouchCancel_$);
  this.$passAfterEvent_$ = !1;
}
function $Gestures$$module$src$gesture$get$$($element$jscomp$71$$) {
  var $opt_shouldNotPreventDefault$$ = void 0 === $opt_shouldNotPreventDefault$$ ? !1 : $opt_shouldNotPreventDefault$$;
  var $opt_shouldStopPropagation$$ = void 0 === $opt_shouldStopPropagation$$ ? !1 : $opt_shouldStopPropagation$$;
  var $res$jscomp$4$$ = $element$jscomp$71$$.__AMP_Gestures;
  $res$jscomp$4$$ || ($res$jscomp$4$$ = new $Gestures$$module$src$gesture$$($element$jscomp$71$$, $opt_shouldNotPreventDefault$$, $opt_shouldStopPropagation$$), $element$jscomp$71$$.__AMP_Gestures = $res$jscomp$4$$);
  return $res$jscomp$4$$;
}
$JSCompiler_prototypeAlias$$ = $Gestures$$module$src$gesture$$.prototype;
$JSCompiler_prototypeAlias$$.cleanup = function() {
  this.$element_$.removeEventListener("touchstart", this.$boundOnTouchStart_$);
  this.$element_$.removeEventListener("touchend", this.$boundOnTouchEnd_$);
  this.$element_$.removeEventListener("touchmove", this.$boundOnTouchMove_$);
  this.$element_$.removeEventListener("touchcancel", this.$boundOnTouchCancel_$);
  delete this.$element_$.__AMP_Gestures;
  this.$pass_$.cancel();
};
$JSCompiler_prototypeAlias$$.onGesture = function($recognizerConstr$$, $handler$jscomp$7$$) {
  var $recognizer$$ = new $recognizerConstr$$(this), $type$jscomp$149$$ = $recognizer$$.getType(), $overserver$$ = this.$overservers_$[$type$jscomp$149$$];
  $overserver$$ || (this.$recognizers_$.push($recognizer$$), $overserver$$ = new $Observable$$module$src$observable$$, this.$overservers_$[$type$jscomp$149$$] = $overserver$$);
  return $overserver$$.add($handler$jscomp$7$$);
};
$JSCompiler_prototypeAlias$$.removeGesture = function($index$jscomp$81_overserver$jscomp$1_recognizerConstr$jscomp$1$$) {
  var $type$jscomp$150$$ = (new $index$jscomp$81_overserver$jscomp$1_recognizerConstr$jscomp$1$$(this)).getType();
  if ($index$jscomp$81_overserver$jscomp$1_recognizerConstr$jscomp$1$$ = this.$overservers_$[$type$jscomp$150$$]) {
    $index$jscomp$81_overserver$jscomp$1_recognizerConstr$jscomp$1$$.removeAll();
    $index$jscomp$81_overserver$jscomp$1_recognizerConstr$jscomp$1$$ = $findIndex$$module$src$utils$array$$(this.$recognizers_$, function($index$jscomp$81_overserver$jscomp$1_recognizerConstr$jscomp$1$$) {
      return $index$jscomp$81_overserver$jscomp$1_recognizerConstr$jscomp$1$$.getType() == $type$jscomp$150$$;
    });
    if (0 > $index$jscomp$81_overserver$jscomp$1_recognizerConstr$jscomp$1$$) {
      return !1;
    }
    this.$recognizers_$.splice($index$jscomp$81_overserver$jscomp$1_recognizerConstr$jscomp$1$$, 1);
    this.$ready_$.splice($index$jscomp$81_overserver$jscomp$1_recognizerConstr$jscomp$1$$, 1);
    this.$pending_$.splice($index$jscomp$81_overserver$jscomp$1_recognizerConstr$jscomp$1$$, 1);
    this.$tracking_$.splice($index$jscomp$81_overserver$jscomp$1_recognizerConstr$jscomp$1$$, 1);
    delete this.$overservers_$[$type$jscomp$150$$];
    return !0;
  }
  return !1;
};
$JSCompiler_prototypeAlias$$.onPointerDown = function($handler$jscomp$8$$) {
  return this.$pointerDownObservable_$.add($handler$jscomp$8$$);
};
$JSCompiler_prototypeAlias$$.$onTouchStart_$ = function($event$jscomp$7$$) {
  var $now$$ = Date.now();
  this.$wasEventing_$ = !1;
  this.$pointerDownObservable_$.fire($event$jscomp$7$$);
  for (var $i$jscomp$33$$ = 0; $i$jscomp$33$$ < this.$recognizers_$.length; $i$jscomp$33$$++) {
    if (!this.$ready_$[$i$jscomp$33$$] && (this.$pending_$[$i$jscomp$33$$] && this.$pending_$[$i$jscomp$33$$] < $now$$ && $JSCompiler_StaticMethods_stopTracking_$$(this, $i$jscomp$33$$), this.$recognizers_$[$i$jscomp$33$$].onTouchStart($event$jscomp$7$$))) {
      var $JSCompiler_index$jscomp$inline_77$$ = $i$jscomp$33$$;
      this.$tracking_$[$JSCompiler_index$jscomp$inline_77$$] = !0;
      this.$pending_$[$JSCompiler_index$jscomp$inline_77$$] = 0;
    }
  }
  $JSCompiler_StaticMethods_afterEvent_$$(this, $event$jscomp$7$$);
};
$JSCompiler_prototypeAlias$$.$onTouchMove_$ = function($event$jscomp$8$$) {
  for (var $now$jscomp$1$$ = Date.now(), $i$jscomp$34$$ = 0; $i$jscomp$34$$ < this.$recognizers_$.length; $i$jscomp$34$$++) {
    this.$tracking_$[$i$jscomp$34$$] && (this.$pending_$[$i$jscomp$34$$] && this.$pending_$[$i$jscomp$34$$] < $now$jscomp$1$$ ? $JSCompiler_StaticMethods_stopTracking_$$(this, $i$jscomp$34$$) : this.$recognizers_$[$i$jscomp$34$$].onTouchMove($event$jscomp$8$$) || $JSCompiler_StaticMethods_stopTracking_$$(this, $i$jscomp$34$$));
  }
  $JSCompiler_StaticMethods_afterEvent_$$(this, $event$jscomp$8$$);
};
$JSCompiler_prototypeAlias$$.$onTouchEnd_$ = function($event$jscomp$9$$) {
  for (var $now$jscomp$2$$ = Date.now(), $i$jscomp$35$$ = 0; $i$jscomp$35$$ < this.$recognizers_$.length; $i$jscomp$35$$++) {
    if (this.$tracking_$[$i$jscomp$35$$]) {
      if (this.$pending_$[$i$jscomp$35$$] && this.$pending_$[$i$jscomp$35$$] < $now$jscomp$2$$) {
        $JSCompiler_StaticMethods_stopTracking_$$(this, $i$jscomp$35$$);
      } else {
        this.$recognizers_$[$i$jscomp$35$$].onTouchEnd($event$jscomp$9$$);
        var $isReady$$ = !this.$pending_$[$i$jscomp$35$$], $isExpired$$ = this.$pending_$[$i$jscomp$35$$] < $now$jscomp$2$$;
        this.$eventing_$ != this.$recognizers_$[$i$jscomp$35$$] && ($isReady$$ || $isExpired$$) && $JSCompiler_StaticMethods_stopTracking_$$(this, $i$jscomp$35$$);
      }
    }
  }
  $JSCompiler_StaticMethods_afterEvent_$$(this, $event$jscomp$9$$);
};
$JSCompiler_prototypeAlias$$.$onTouchCancel_$ = function($event$jscomp$10$$) {
  for (var $i$jscomp$36$$ = 0; $i$jscomp$36$$ < this.$recognizers_$.length; $i$jscomp$36$$++) {
    var $JSCompiler_index$jscomp$inline_197$$ = $i$jscomp$36$$;
    this.$ready_$[$JSCompiler_index$jscomp$inline_197$$] = 0;
    $JSCompiler_StaticMethods_stopTracking_$$(this, $JSCompiler_index$jscomp$inline_197$$);
  }
  $JSCompiler_StaticMethods_afterEvent_$$(this, $event$jscomp$10$$);
};
function $JSCompiler_StaticMethods_afterEvent_$$($JSCompiler_StaticMethods_afterEvent_$self$$, $event$jscomp$12$$) {
  var $cancelEvent$$ = !!$JSCompiler_StaticMethods_afterEvent_$self$$.$eventing_$ || $JSCompiler_StaticMethods_afterEvent_$self$$.$wasEventing_$;
  $JSCompiler_StaticMethods_afterEvent_$self$$.$wasEventing_$ = !1;
  if (!$cancelEvent$$) {
    for (var $now$jscomp$5$$ = Date.now(), $i$jscomp$39$$ = 0; $i$jscomp$39$$ < $JSCompiler_StaticMethods_afterEvent_$self$$.$recognizers_$.length; $i$jscomp$39$$++) {
      if ($JSCompiler_StaticMethods_afterEvent_$self$$.$ready_$[$i$jscomp$39$$] || $JSCompiler_StaticMethods_afterEvent_$self$$.$pending_$[$i$jscomp$39$$] && $JSCompiler_StaticMethods_afterEvent_$self$$.$pending_$[$i$jscomp$39$$] >= $now$jscomp$5$$) {
        $cancelEvent$$ = !0;
        break;
      }
    }
  }
  $cancelEvent$$ ? ($event$jscomp$12$$.stopPropagation(), $JSCompiler_StaticMethods_afterEvent_$self$$.$shouldNotPreventDefault_$ || $event$jscomp$12$$.preventDefault()) : $JSCompiler_StaticMethods_afterEvent_$self$$.$shouldStopPropagation_$ && $event$jscomp$12$$.stopPropagation();
  $JSCompiler_StaticMethods_afterEvent_$self$$.$passAfterEvent_$ && ($JSCompiler_StaticMethods_afterEvent_$self$$.$passAfterEvent_$ = !1, $JSCompiler_StaticMethods_afterEvent_$self$$.$doPass_$());
}
$JSCompiler_prototypeAlias$$.$doPass_$ = function() {
  for (var $JSCompiler_index$jscomp$inline_80_now$jscomp$6$$ = Date.now(), $readyIndex$$ = -1, $JSCompiler_recognizer$jscomp$inline_81_i$10_i$jscomp$40$$ = 0; $JSCompiler_recognizer$jscomp$inline_81_i$10_i$jscomp$40$$ < this.$recognizers_$.length; $JSCompiler_recognizer$jscomp$inline_81_i$10_i$jscomp$40$$++) {
    if (!this.$ready_$[$JSCompiler_recognizer$jscomp$inline_81_i$10_i$jscomp$40$$]) {
      this.$pending_$[$JSCompiler_recognizer$jscomp$inline_81_i$10_i$jscomp$40$$] && this.$pending_$[$JSCompiler_recognizer$jscomp$inline_81_i$10_i$jscomp$40$$] < $JSCompiler_index$jscomp$inline_80_now$jscomp$6$$ && $JSCompiler_StaticMethods_stopTracking_$$(this, $JSCompiler_recognizer$jscomp$inline_81_i$10_i$jscomp$40$$);
    } else {
      if (-1 == $readyIndex$$ || this.$ready_$[$JSCompiler_recognizer$jscomp$inline_81_i$10_i$jscomp$40$$] > this.$ready_$[$readyIndex$$]) {
        $readyIndex$$ = $JSCompiler_recognizer$jscomp$inline_81_i$10_i$jscomp$40$$;
      }
    }
  }
  if (-1 != $readyIndex$$) {
    var $waitTime$$ = 0;
    for ($JSCompiler_recognizer$jscomp$inline_81_i$10_i$jscomp$40$$ = 0; $JSCompiler_recognizer$jscomp$inline_81_i$10_i$jscomp$40$$ < this.$recognizers_$.length; $JSCompiler_recognizer$jscomp$inline_81_i$10_i$jscomp$40$$++) {
      !this.$ready_$[$JSCompiler_recognizer$jscomp$inline_81_i$10_i$jscomp$40$$] && this.$tracking_$[$JSCompiler_recognizer$jscomp$inline_81_i$10_i$jscomp$40$$] && ($waitTime$$ = Math.max($waitTime$$, this.$pending_$[$JSCompiler_recognizer$jscomp$inline_81_i$10_i$jscomp$40$$] - $JSCompiler_index$jscomp$inline_80_now$jscomp$6$$));
    }
    if (2 > $waitTime$$) {
      $JSCompiler_index$jscomp$inline_80_now$jscomp$6$$ = $readyIndex$$;
      $JSCompiler_recognizer$jscomp$inline_81_i$10_i$jscomp$40$$ = this.$recognizers_$[$JSCompiler_index$jscomp$inline_80_now$jscomp$6$$];
      for (var $JSCompiler_i$jscomp$inline_82$$ = 0; $JSCompiler_i$jscomp$inline_82$$ < this.$recognizers_$.length; $JSCompiler_i$jscomp$inline_82$$++) {
        if ($JSCompiler_i$jscomp$inline_82$$ != $JSCompiler_index$jscomp$inline_80_now$jscomp$6$$) {
          var $JSCompiler_index$jscomp$inline_200$$ = $JSCompiler_i$jscomp$inline_82$$;
          this.$ready_$[$JSCompiler_index$jscomp$inline_200$$] = 0;
          $JSCompiler_StaticMethods_stopTracking_$$(this, $JSCompiler_index$jscomp$inline_200$$);
        }
      }
      this.$ready_$[$JSCompiler_index$jscomp$inline_80_now$jscomp$6$$] = 0;
      this.$pending_$[$JSCompiler_index$jscomp$inline_80_now$jscomp$6$$] = 0;
      this.$eventing_$ = $JSCompiler_recognizer$jscomp$inline_81_i$10_i$jscomp$40$$;
      $JSCompiler_recognizer$jscomp$inline_81_i$10_i$jscomp$40$$.acceptStart();
    } else {
      this.$pass_$.schedule($waitTime$$);
    }
  }
};
function $JSCompiler_StaticMethods_stopTracking_$$($JSCompiler_StaticMethods_stopTracking_$self$$, $index$jscomp$84$$) {
  $JSCompiler_StaticMethods_stopTracking_$self$$.$tracking_$[$index$jscomp$84$$] = !1;
  $JSCompiler_StaticMethods_stopTracking_$self$$.$pending_$[$index$jscomp$84$$] = 0;
  $JSCompiler_StaticMethods_stopTracking_$self$$.$ready_$[$index$jscomp$84$$] || $JSCompiler_StaticMethods_stopTracking_$self$$.$recognizers_$[$index$jscomp$84$$].acceptCancel();
}
function $GestureRecognizer$$module$src$gesture$$($type$jscomp$151$$, $manager$$) {
  this.$type_$ = $type$jscomp$151$$;
  this.$manager_$ = $manager$$;
}
$JSCompiler_prototypeAlias$$ = $GestureRecognizer$$module$src$gesture$$.prototype;
$JSCompiler_prototypeAlias$$.getType = function() {
  return this.$type_$;
};
$JSCompiler_prototypeAlias$$.signalReady = function($offset$jscomp$27$$) {
  var $JSCompiler_StaticMethods_signalReady_$self$jscomp$inline_84$$ = this.$manager_$;
  if ($JSCompiler_StaticMethods_signalReady_$self$jscomp$inline_84$$.$eventing_$) {
    this.acceptCancel();
  } else {
    for (var $JSCompiler_now$jscomp$inline_87$$ = Date.now(), $JSCompiler_i$jscomp$inline_88$$ = 0; $JSCompiler_i$jscomp$inline_88$$ < $JSCompiler_StaticMethods_signalReady_$self$jscomp$inline_84$$.$recognizers_$.length; $JSCompiler_i$jscomp$inline_88$$++) {
      $JSCompiler_StaticMethods_signalReady_$self$jscomp$inline_84$$.$recognizers_$[$JSCompiler_i$jscomp$inline_88$$] == this && ($JSCompiler_StaticMethods_signalReady_$self$jscomp$inline_84$$.$ready_$[$JSCompiler_i$jscomp$inline_88$$] = $JSCompiler_now$jscomp$inline_87$$ + $offset$jscomp$27$$, $JSCompiler_StaticMethods_signalReady_$self$jscomp$inline_84$$.$pending_$[$JSCompiler_i$jscomp$inline_88$$] = 0);
    }
    $JSCompiler_StaticMethods_signalReady_$self$jscomp$inline_84$$.$passAfterEvent_$ = !0;
  }
};
$JSCompiler_prototypeAlias$$.signalPending = function($timeLeft$jscomp$1$$) {
  var $JSCompiler_StaticMethods_signalPending_$self$jscomp$inline_90$$ = this.$manager_$;
  if ($JSCompiler_StaticMethods_signalPending_$self$jscomp$inline_90$$.$eventing_$) {
    this.acceptCancel();
  } else {
    for (var $JSCompiler_now$jscomp$inline_93$$ = Date.now(), $JSCompiler_i$jscomp$inline_94$$ = 0; $JSCompiler_i$jscomp$inline_94$$ < $JSCompiler_StaticMethods_signalPending_$self$jscomp$inline_90$$.$recognizers_$.length; $JSCompiler_i$jscomp$inline_94$$++) {
      $JSCompiler_StaticMethods_signalPending_$self$jscomp$inline_90$$.$recognizers_$[$JSCompiler_i$jscomp$inline_94$$] == this && ($JSCompiler_StaticMethods_signalPending_$self$jscomp$inline_90$$.$pending_$[$JSCompiler_i$jscomp$inline_94$$] = $JSCompiler_now$jscomp$inline_93$$ + $timeLeft$jscomp$1$$);
    }
  }
};
$JSCompiler_prototypeAlias$$.signalEnd = function() {
  var $JSCompiler_StaticMethods_signalEnd_$self$jscomp$inline_96$$ = this.$manager_$;
  $JSCompiler_StaticMethods_signalEnd_$self$jscomp$inline_96$$.$eventing_$ == this && ($JSCompiler_StaticMethods_signalEnd_$self$jscomp$inline_96$$.$eventing_$ = null, $JSCompiler_StaticMethods_signalEnd_$self$jscomp$inline_96$$.$wasEventing_$ = !0);
};
$JSCompiler_prototypeAlias$$.signalEmit = function($data$jscomp$79$$, $event$jscomp$13$$) {
  var $JSCompiler_overserver$jscomp$inline_103$$ = this.$manager_$.$overservers_$[this.getType()];
  $JSCompiler_overserver$jscomp$inline_103$$ && $JSCompiler_overserver$jscomp$inline_103$$.fire(new $Gesture$$module$src$gesture$$(this.getType(), $data$jscomp$79$$, Date.now(), $event$jscomp$13$$));
};
$JSCompiler_prototypeAlias$$.acceptStart = function() {
};
$JSCompiler_prototypeAlias$$.acceptCancel = function() {
};
$JSCompiler_prototypeAlias$$.onTouchStart = function() {
  return !1;
};
$JSCompiler_prototypeAlias$$.onTouchMove = function() {
  return !1;
};
$JSCompiler_prototypeAlias$$.onTouchEnd = function() {
};
function $NOOP_CALLBACK_$$module$src$motion$$() {
}
var $EXP_FRAME_CONST_$$module$src$motion$$ = Math.round(-16.67 / Math.log(0.95));
function $calcVelocity$$module$src$motion$$($deltaV$$, $deltaTime$$, $prevVelocity$$) {
  1 > $deltaTime$$ && ($deltaTime$$ = 1);
  var $depr$$ = 0.5 + Math.min($deltaTime$$ / 33.34, 0.5);
  return $deltaV$$ / $deltaTime$$ * $depr$$ + $prevVelocity$$ * (1 - $depr$$);
}
function $continueMotion$$module$src$motion$$($contextNode$jscomp$5$$, $startX$$, $startY$$, $veloX$$, $veloY$$, $callback$jscomp$60$$) {
  return (new $Motion$$module$src$motion$$($contextNode$jscomp$5$$, $startX$$, $startY$$, $veloX$$, $veloY$$, $callback$jscomp$60$$)).start();
}
function $Motion$$module$src$motion$$($contextNode$jscomp$6_deferred$jscomp$3$$, $startX$jscomp$1$$, $startY$jscomp$1$$, $veloX$jscomp$1$$, $veloY$jscomp$1$$, $callback$jscomp$61$$) {
  this.$vsync_$ = $getService$$module$src$service$$(self, "vsync");
  this.$contextNode_$ = $contextNode$jscomp$6_deferred$jscomp$3$$;
  this.$callback_$ = $callback$jscomp$61$$;
  this.$lastX_$ = $startX$jscomp$1$$;
  this.$lastY_$ = $startY$jscomp$1$$;
  this.$maxVelocityX_$ = $veloX$jscomp$1$$;
  this.$maxVelocityY_$ = $veloY$jscomp$1$$;
  this.$velocityY_$ = this.$velocityX_$ = 0;
  $contextNode$jscomp$6_deferred$jscomp$3$$ = new $Deferred$$module$src$utils$promise$$;
  this.$promise_$ = $contextNode$jscomp$6_deferred$jscomp$3$$.promise;
  this.$resolve_$ = $contextNode$jscomp$6_deferred$jscomp$3$$.resolve;
  this.$reject_$ = $contextNode$jscomp$6_deferred$jscomp$3$$.reject;
  this.$continuing_$ = !1;
}
$JSCompiler_prototypeAlias$$ = $Motion$$module$src$motion$$.prototype;
$JSCompiler_prototypeAlias$$.start = function() {
  this.$continuing_$ = !0;
  if (0.02 >= Math.abs(this.$maxVelocityX_$) && 0.02 >= Math.abs(this.$maxVelocityY_$)) {
    this.$callback_$(this.$lastX_$, this.$lastY_$), this.$completeContinue_$(!0);
  } else {
    this.$velocityX_$ = this.$maxVelocityX_$;
    this.$velocityY_$ = this.$maxVelocityY_$;
    var $JSCompiler_boundStep$jscomp$inline_106$$ = this.$stepContinue_$.bind(this), $JSCompiler_boundComplete$jscomp$inline_107$$ = this.$completeContinue_$.bind(this, !0);
    this.$vsync_$.runAnimMutateSeries(this.$contextNode_$, $JSCompiler_boundStep$jscomp$inline_106$$, 5000).then($JSCompiler_boundComplete$jscomp$inline_107$$, $JSCompiler_boundComplete$jscomp$inline_107$$);
  }
  return this;
};
$JSCompiler_prototypeAlias$$.halt = function() {
  this.$continuing_$ && this.$completeContinue_$(!1);
};
$JSCompiler_prototypeAlias$$.then = function($opt_resolve$jscomp$2$$, $opt_reject$jscomp$2$$) {
  return $opt_resolve$jscomp$2$$ || $opt_reject$jscomp$2$$ ? this.$promise_$.then($opt_resolve$jscomp$2$$, $opt_reject$jscomp$2$$) : this.$promise_$;
};
$JSCompiler_prototypeAlias$$.thenAlways = function($callback$jscomp$62_opt_callback$jscomp$6$$) {
  $callback$jscomp$62_opt_callback$jscomp$6$$ = $callback$jscomp$62_opt_callback$jscomp$6$$ || $NOOP_CALLBACK_$$module$src$motion$$;
  return this.then($callback$jscomp$62_opt_callback$jscomp$6$$, $callback$jscomp$62_opt_callback$jscomp$6$$);
};
$JSCompiler_prototypeAlias$$.$stepContinue_$ = function($timeSinceStart$$, $timeSincePrev$$) {
  if (!this.$continuing_$) {
    return !1;
  }
  this.$lastX_$ += $timeSincePrev$$ * this.$velocityX_$;
  this.$lastY_$ += $timeSincePrev$$ * this.$velocityY_$;
  if (!this.$callback_$(this.$lastX_$, this.$lastY_$)) {
    return !1;
  }
  var $decel$$ = Math.exp(-$timeSinceStart$$ / $EXP_FRAME_CONST_$$module$src$motion$$);
  this.$velocityX_$ = this.$maxVelocityX_$ * $decel$$;
  this.$velocityY_$ = this.$maxVelocityY_$ * $decel$$;
  return 0.02 < Math.abs(this.$velocityX_$) || 0.02 < Math.abs(this.$velocityY_$);
};
$JSCompiler_prototypeAlias$$.$completeContinue_$ = function($success$jscomp$1$$) {
  this.$continuing_$ && (this.$continuing_$ = !1, this.$callback_$(this.$lastX_$, this.$lastY_$), $success$jscomp$1$$ ? this.$resolve_$() : this.$reject_$());
};
function $TapRecognizer$$module$src$gesture_recognizers$$($manager$jscomp$1$$) {
  $GestureRecognizer$$module$src$gesture$$.call(this, "tap", $manager$jscomp$1$$);
  this.$lastY_$ = this.$lastX_$ = this.$startY_$ = this.$startX_$ = 0;
  this.$target_$ = null;
}
$$jscomp$inherits$$($TapRecognizer$$module$src$gesture_recognizers$$, $GestureRecognizer$$module$src$gesture$$);
$TapRecognizer$$module$src$gesture_recognizers$$.prototype.onTouchStart = function($e$jscomp$23$$) {
  var $touches$jscomp$2$$ = $e$jscomp$23$$.touches;
  this.$target_$ = $e$jscomp$23$$.target;
  return $touches$jscomp$2$$ && 1 == $touches$jscomp$2$$.length ? (this.$startX_$ = $touches$jscomp$2$$[0].clientX, this.$startY_$ = $touches$jscomp$2$$[0].clientY, !0) : !1;
};
$TapRecognizer$$module$src$gesture_recognizers$$.prototype.onTouchMove = function($dy$jscomp$4_e$jscomp$24_touches$jscomp$3$$) {
  return ($dy$jscomp$4_e$jscomp$24_touches$jscomp$3$$ = $dy$jscomp$4_e$jscomp$24_touches$jscomp$3$$.changedTouches || $dy$jscomp$4_e$jscomp$24_touches$jscomp$3$$.touches) && 1 == $dy$jscomp$4_e$jscomp$24_touches$jscomp$3$$.length && (this.$lastX_$ = $dy$jscomp$4_e$jscomp$24_touches$jscomp$3$$[0].clientX, this.$lastY_$ = $dy$jscomp$4_e$jscomp$24_touches$jscomp$3$$[0].clientY, $dy$jscomp$4_e$jscomp$24_touches$jscomp$3$$ = 8 <= Math.abs(this.$lastY_$ - this.$startY_$), 8 <= Math.abs(this.$lastX_$ - 
  this.$startX_$) || $dy$jscomp$4_e$jscomp$24_touches$jscomp$3$$) ? !1 : !0;
};
$TapRecognizer$$module$src$gesture_recognizers$$.prototype.onTouchEnd = function() {
  this.signalReady(0);
};
$TapRecognizer$$module$src$gesture_recognizers$$.prototype.acceptStart = function() {
  this.signalEmit({clientX:this.$lastX_$, clientY:this.$lastY_$, target:this.$target_$}, null);
  this.signalEnd();
};
function $DoubletapRecognizer$$module$src$gesture_recognizers$$($manager$jscomp$2$$) {
  $GestureRecognizer$$module$src$gesture$$.call(this, "doubletap", $manager$jscomp$2$$);
  this.$tapCount_$ = this.$lastY_$ = this.$lastX_$ = this.$startY_$ = this.$startX_$ = 0;
  this.$event_$ = null;
}
$$jscomp$inherits$$($DoubletapRecognizer$$module$src$gesture_recognizers$$, $GestureRecognizer$$module$src$gesture$$);
$JSCompiler_prototypeAlias$$ = $DoubletapRecognizer$$module$src$gesture_recognizers$$.prototype;
$JSCompiler_prototypeAlias$$.onTouchStart = function($e$jscomp$25_touches$jscomp$4$$) {
  return 1 < this.$tapCount_$ ? !1 : ($e$jscomp$25_touches$jscomp$4$$ = $e$jscomp$25_touches$jscomp$4$$.touches) && 1 == $e$jscomp$25_touches$jscomp$4$$.length ? (this.$startX_$ = $e$jscomp$25_touches$jscomp$4$$[0].clientX, this.$startY_$ = $e$jscomp$25_touches$jscomp$4$$[0].clientY, this.$lastX_$ = $e$jscomp$25_touches$jscomp$4$$[0].clientX, this.$lastY_$ = $e$jscomp$25_touches$jscomp$4$$[0].clientY, !0) : !1;
};
$JSCompiler_prototypeAlias$$.onTouchMove = function($dy$jscomp$5_e$jscomp$26_touches$jscomp$5$$) {
  return ($dy$jscomp$5_e$jscomp$26_touches$jscomp$5$$ = $dy$jscomp$5_e$jscomp$26_touches$jscomp$5$$.touches) && 1 == $dy$jscomp$5_e$jscomp$26_touches$jscomp$5$$.length ? (this.$lastX_$ = $dy$jscomp$5_e$jscomp$26_touches$jscomp$5$$[0].clientX, this.$lastY_$ = $dy$jscomp$5_e$jscomp$26_touches$jscomp$5$$[0].clientY, $dy$jscomp$5_e$jscomp$26_touches$jscomp$5$$ = 8 <= Math.abs(this.$lastY_$ - this.$startY_$), 8 <= Math.abs(this.$lastX_$ - this.$startX_$) || $dy$jscomp$5_e$jscomp$26_touches$jscomp$5$$ ? 
  (this.acceptCancel(), !1) : !0) : !1;
};
$JSCompiler_prototypeAlias$$.onTouchEnd = function($e$jscomp$27$$) {
  this.$tapCount_$++;
  2 > this.$tapCount_$ ? this.signalPending(200) : (this.$event_$ = $e$jscomp$27$$, this.signalReady(0));
};
$JSCompiler_prototypeAlias$$.acceptStart = function() {
  this.$tapCount_$ = 0;
  this.signalEmit({clientX:this.$lastX_$, clientY:this.$lastY_$}, this.$event_$);
  this.signalEnd();
};
$JSCompiler_prototypeAlias$$.acceptCancel = function() {
  this.$tapCount_$ = 0;
};
function $SwipeRecognizer$$module$src$gesture_recognizers$$($type$jscomp$152$$, $manager$jscomp$3$$, $horiz$$, $vert$$) {
  $GestureRecognizer$$module$src$gesture$$.call(this, $type$jscomp$152$$, $manager$jscomp$3$$);
  this.$horiz_$ = $horiz$$;
  this.$vert_$ = $vert$$;
  this.$eventing_$ = !1;
  this.$velocityY_$ = this.$velocityX_$ = this.$prevTime_$ = this.$lastTime_$ = this.$startTime_$ = this.$prevY_$ = this.$prevX_$ = this.$lastY_$ = this.$lastX_$ = this.$startY_$ = this.$startX_$ = 0;
}
$$jscomp$inherits$$($SwipeRecognizer$$module$src$gesture_recognizers$$, $GestureRecognizer$$module$src$gesture$$);
$JSCompiler_prototypeAlias$$ = $SwipeRecognizer$$module$src$gesture_recognizers$$.prototype;
$JSCompiler_prototypeAlias$$.onTouchStart = function($e$jscomp$28_touches$jscomp$6$$) {
  $e$jscomp$28_touches$jscomp$6$$ = $e$jscomp$28_touches$jscomp$6$$.touches;
  return this.$eventing_$ && $e$jscomp$28_touches$jscomp$6$$ && 1 < $e$jscomp$28_touches$jscomp$6$$.length ? !0 : $e$jscomp$28_touches$jscomp$6$$ && 1 == $e$jscomp$28_touches$jscomp$6$$.length ? (this.$startTime_$ = Date.now(), this.$startX_$ = $e$jscomp$28_touches$jscomp$6$$[0].clientX, this.$startY_$ = $e$jscomp$28_touches$jscomp$6$$[0].clientY, !0) : !1;
};
$JSCompiler_prototypeAlias$$.onTouchMove = function($dx$jscomp$6_e$jscomp$29$$) {
  var $dy$jscomp$6_touches$jscomp$7_x$jscomp$86$$ = $dx$jscomp$6_e$jscomp$29$$.touches;
  if ($dy$jscomp$6_touches$jscomp$7_x$jscomp$86$$ && 1 <= $dy$jscomp$6_touches$jscomp$7_x$jscomp$86$$.length) {
    var $$jscomp$destructuring$var18_y$jscomp$69$$ = $dy$jscomp$6_touches$jscomp$7_x$jscomp$86$$[0];
    $dy$jscomp$6_touches$jscomp$7_x$jscomp$86$$ = $$jscomp$destructuring$var18_y$jscomp$69$$.clientX;
    $$jscomp$destructuring$var18_y$jscomp$69$$ = $$jscomp$destructuring$var18_y$jscomp$69$$.clientY;
    this.$lastX_$ = $dy$jscomp$6_touches$jscomp$7_x$jscomp$86$$;
    this.$lastY_$ = $$jscomp$destructuring$var18_y$jscomp$69$$;
    if (this.$eventing_$) {
      this.$emit_$(!1, !1, $dx$jscomp$6_e$jscomp$29$$);
    } else {
      if ($dx$jscomp$6_e$jscomp$29$$ = Math.abs($dy$jscomp$6_touches$jscomp$7_x$jscomp$86$$ - this.$startX_$), $dy$jscomp$6_touches$jscomp$7_x$jscomp$86$$ = Math.abs($$jscomp$destructuring$var18_y$jscomp$69$$ - this.$startY_$), this.$horiz_$ && this.$vert_$) {
        (8 <= $dx$jscomp$6_e$jscomp$29$$ || 8 <= $dy$jscomp$6_touches$jscomp$7_x$jscomp$86$$) && this.signalReady(-10);
      } else {
        if (this.$horiz_$) {
          if (8 <= $dx$jscomp$6_e$jscomp$29$$ && $dx$jscomp$6_e$jscomp$29$$ > $dy$jscomp$6_touches$jscomp$7_x$jscomp$86$$) {
            this.signalReady(-10);
          } else {
            if (8 <= $dy$jscomp$6_touches$jscomp$7_x$jscomp$86$$) {
              return !1;
            }
          }
        } else {
          if (this.$vert_$) {
            if (8 <= $dy$jscomp$6_touches$jscomp$7_x$jscomp$86$$ && $dy$jscomp$6_touches$jscomp$7_x$jscomp$86$$ > $dx$jscomp$6_e$jscomp$29$$) {
              this.signalReady(-10);
            } else {
              if (8 <= $dx$jscomp$6_e$jscomp$29$$) {
                return !1;
              }
            }
          } else {
            return !1;
          }
        }
      }
    }
    return !0;
  }
  return !1;
};
$JSCompiler_prototypeAlias$$.onTouchEnd = function($e$jscomp$30$$) {
  var $touches$jscomp$8$$ = $e$jscomp$30$$.touches;
  $touches$jscomp$8$$ && 0 == $touches$jscomp$8$$.length && this.$end_$($e$jscomp$30$$);
};
$JSCompiler_prototypeAlias$$.acceptStart = function() {
  this.$eventing_$ = !0;
  this.$prevX_$ = this.$startX_$;
  this.$prevY_$ = this.$startY_$;
  this.$prevTime_$ = this.$startTime_$;
  this.$startX_$ = this.$lastX_$;
  this.$startY_$ = this.$lastY_$;
  this.$emit_$(!0, !1, null);
};
$JSCompiler_prototypeAlias$$.acceptCancel = function() {
  this.$eventing_$ = !1;
};
$JSCompiler_prototypeAlias$$.$emit_$ = function($first$jscomp$6$$, $last$$, $event$jscomp$14$$) {
  this.$lastTime_$ = Date.now();
  var $deltaTime$jscomp$1$$ = this.$lastTime_$ - this.$prevTime_$;
  if (!$last$$ && 4 < $deltaTime$jscomp$1$$ || $last$$ && 16 < $deltaTime$jscomp$1$$) {
    var $velocityX$$ = $calcVelocity$$module$src$motion$$(this.$lastX_$ - this.$prevX_$, $deltaTime$jscomp$1$$, this.$velocityX_$), $velocityY$$ = $calcVelocity$$module$src$motion$$(this.$lastY_$ - this.$prevY_$, $deltaTime$jscomp$1$$, this.$velocityY_$);
    if (!$last$$ || 32 < $deltaTime$jscomp$1$$ || 0 != $velocityX$$ || 0 != $velocityY$$) {
      this.$velocityX_$ = 1e-4 < Math.abs($velocityX$$) ? $velocityX$$ : 0, this.$velocityY_$ = 1e-4 < Math.abs($velocityY$$) ? $velocityY$$ : 0;
    }
    this.$prevX_$ = this.$lastX_$;
    this.$prevY_$ = this.$lastY_$;
    this.$prevTime_$ = this.$lastTime_$;
  }
  this.signalEmit({first:$first$jscomp$6$$, last:$last$$, time:this.$lastTime_$, deltaX:this.$lastX_$ - this.$startX_$, deltaY:this.$lastY_$ - this.$startY_$, startX:this.$startX_$, startY:this.$startY_$, lastX:this.$lastX_$, lastY:this.$lastY_$, velocityX:this.$velocityX_$, velocityY:this.$velocityY_$}, $event$jscomp$14$$);
};
$JSCompiler_prototypeAlias$$.$end_$ = function($event$jscomp$15$$) {
  this.$eventing_$ && (this.$eventing_$ = !1, this.$emit_$(!1, !0, $event$jscomp$15$$), this.signalEnd());
};
function $SwipeXYRecognizer$$module$src$gesture_recognizers$$($manager$jscomp$4$$) {
  $SwipeRecognizer$$module$src$gesture_recognizers$$.call(this, "swipe-xy", $manager$jscomp$4$$, !0, !0);
}
$$jscomp$inherits$$($SwipeXYRecognizer$$module$src$gesture_recognizers$$, $SwipeRecognizer$$module$src$gesture_recognizers$$);
function $TapzoomRecognizer$$module$src$gesture_recognizers$$($manager$jscomp$7$$) {
  $GestureRecognizer$$module$src$gesture$$.call(this, "tapzoom", $manager$jscomp$7$$);
  this.$eventing_$ = !1;
  this.$velocityY_$ = this.$velocityX_$ = this.$prevTime_$ = this.$lastTime_$ = this.$prevY_$ = this.$prevX_$ = this.$tapCount_$ = this.$lastY_$ = this.$lastX_$ = this.$startY_$ = this.$startX_$ = 0;
}
$$jscomp$inherits$$($TapzoomRecognizer$$module$src$gesture_recognizers$$, $GestureRecognizer$$module$src$gesture$$);
$JSCompiler_prototypeAlias$$ = $TapzoomRecognizer$$module$src$gesture_recognizers$$.prototype;
$JSCompiler_prototypeAlias$$.onTouchStart = function($e$jscomp$31_touches$jscomp$9$$) {
  return this.$eventing_$ ? !1 : ($e$jscomp$31_touches$jscomp$9$$ = $e$jscomp$31_touches$jscomp$9$$.touches) && 1 == $e$jscomp$31_touches$jscomp$9$$.length ? (this.$startX_$ = $e$jscomp$31_touches$jscomp$9$$[0].clientX, this.$startY_$ = $e$jscomp$31_touches$jscomp$9$$[0].clientY, !0) : !1;
};
$JSCompiler_prototypeAlias$$.onTouchMove = function($dy$jscomp$7_e$jscomp$32$$) {
  var $touches$jscomp$10$$ = $dy$jscomp$7_e$jscomp$32$$.touches;
  if ($touches$jscomp$10$$ && 1 == $touches$jscomp$10$$.length) {
    this.$lastX_$ = $touches$jscomp$10$$[0].clientX;
    this.$lastY_$ = $touches$jscomp$10$$[0].clientY;
    if (this.$eventing_$) {
      this.$emit_$(!1, !1, $dy$jscomp$7_e$jscomp$32$$);
    } else {
      if ($dy$jscomp$7_e$jscomp$32$$ = 8 <= Math.abs(this.$lastY_$ - this.$startY_$), 8 <= Math.abs(this.$lastX_$ - this.$startX_$) || $dy$jscomp$7_e$jscomp$32$$) {
        if (0 == this.$tapCount_$) {
          return this.acceptCancel(), !1;
        }
        this.signalReady(0);
      }
    }
    return !0;
  }
  return !1;
};
$JSCompiler_prototypeAlias$$.onTouchEnd = function($e$jscomp$33$$) {
  this.$eventing_$ ? this.$end_$($e$jscomp$33$$) : (this.$tapCount_$++, 1 == this.$tapCount_$ ? this.signalPending(400) : this.acceptCancel());
};
$JSCompiler_prototypeAlias$$.acceptStart = function() {
  this.$tapCount_$ = 0;
  this.$eventing_$ = !0;
  this.$emit_$(!0, !1, null);
};
$JSCompiler_prototypeAlias$$.acceptCancel = function() {
  this.$tapCount_$ = 0;
  this.$eventing_$ = !1;
};
$JSCompiler_prototypeAlias$$.$emit_$ = function($first$jscomp$7$$, $last$jscomp$1$$, $event$jscomp$16$$) {
  this.$lastTime_$ = Date.now();
  $first$jscomp$7$$ ? this.$velocityX_$ = this.$velocityY_$ = 0 : 2 < this.$lastTime_$ - this.$prevTime_$ && (this.$velocityX_$ = $calcVelocity$$module$src$motion$$(this.$lastX_$ - this.$prevX_$, this.$lastTime_$ - this.$prevTime_$, this.$velocityX_$), this.$velocityY_$ = $calcVelocity$$module$src$motion$$(this.$lastY_$ - this.$prevY_$, this.$lastTime_$ - this.$prevTime_$, this.$velocityY_$));
  this.$prevX_$ = this.$lastX_$;
  this.$prevY_$ = this.$lastY_$;
  this.$prevTime_$ = this.$lastTime_$;
  this.signalEmit({first:$first$jscomp$7$$, last:$last$jscomp$1$$, centerClientX:this.$startX_$, centerClientY:this.$startY_$, deltaX:this.$lastX_$ - this.$startX_$, deltaY:this.$lastY_$ - this.$startY_$, velocityX:this.$velocityX_$, velocityY:this.$velocityY_$}, $event$jscomp$16$$);
};
$JSCompiler_prototypeAlias$$.$end_$ = function($event$jscomp$17$$) {
  this.$eventing_$ && (this.$eventing_$ = !1, this.$emit_$(!1, !0, $event$jscomp$17$$), this.signalEnd());
};
function $clamp$$module$src$utils$math$$($val$jscomp$6$$, $min$$, $max$$) {
  return Math.min(Math.max($val$jscomp$6$$, $min$$), $max$$);
}
function $magnitude$$module$src$utils$math$$($deltaX$jscomp$1$$, $deltaY$jscomp$1$$) {
  return Math.sqrt($deltaX$jscomp$1$$ * $deltaX$jscomp$1$$ + $deltaY$jscomp$1$$ * $deltaY$jscomp$1$$);
}
;function $isLoaded$$module$src$event_helper$$($eleOrWindow$$) {
  var $JSCompiler_temp$jscomp$36$$;
  ($JSCompiler_temp$jscomp$36$$ = $eleOrWindow$$.complete || "complete" == $eleOrWindow$$.readyState) || ($JSCompiler_temp$jscomp$36$$ = ("AUDIO" === $eleOrWindow$$.tagName || "VIDEO" === $eleOrWindow$$.tagName) && 0 < $eleOrWindow$$.readyState);
  return !!($JSCompiler_temp$jscomp$36$$ || $eleOrWindow$$.document && "complete" == $eleOrWindow$$.document.readyState);
}
;function $layoutRectLtwh$$module$src$layout_rect$$($left$jscomp$2$$, $top$jscomp$3$$, $width$jscomp$26$$, $height$jscomp$25$$) {
  return {left:$left$jscomp$2$$, top:$top$jscomp$3$$, width:$width$jscomp$26$$, height:$height$jscomp$25$$, bottom:$top$jscomp$3$$ + $height$jscomp$25$$, right:$left$jscomp$2$$ + $width$jscomp$26$$, x:$left$jscomp$2$$, y:$top$jscomp$3$$};
}
function $layoutRectFromDomRect$$module$src$layout_rect$$($rect$$) {
  return $layoutRectLtwh$$module$src$layout_rect$$(Number($rect$$.left), Number($rect$$.top), Number($rect$$.width), Number($rect$$.height));
}
;var $srcsetRegex$$module$src$srcset$$ = /(\S+)(?:\s+(?:(-?\d+(?:\.\d+)?)([a-zA-Z]*)))?\s*(?:,|$)/g;
function $srcsetFromElement$$module$src$srcset$$($JSCompiler_sources$jscomp$inline_112_element$jscomp$75$$) {
  var $srcsetAttr$$ = $JSCompiler_sources$jscomp$inline_112_element$jscomp$75$$.getAttribute("srcset");
  if ($srcsetAttr$$) {
    $JSCompiler_sources$jscomp$inline_112_element$jscomp$75$$ = [];
    for (var $JSCompiler_match$jscomp$inline_113$$; $JSCompiler_match$jscomp$inline_113$$ = $srcsetRegex$$module$src$srcset$$.exec($srcsetAttr$$);) {
      var $JSCompiler_url$jscomp$inline_114$$ = $JSCompiler_match$jscomp$inline_113$$[1], $JSCompiler_width$jscomp$inline_115$$ = void 0, $JSCompiler_dpr$jscomp$inline_116$$ = void 0;
      if ($JSCompiler_match$jscomp$inline_113$$[2]) {
        var $JSCompiler_type$jscomp$inline_117$$ = $JSCompiler_match$jscomp$inline_113$$[3].toLowerCase();
        if ("w" == $JSCompiler_type$jscomp$inline_117$$) {
          $JSCompiler_width$jscomp$inline_115$$ = parseInt($JSCompiler_match$jscomp$inline_113$$[2], 10);
        } else {
          if ("x" == $JSCompiler_type$jscomp$inline_117$$) {
            $JSCompiler_dpr$jscomp$inline_116$$ = parseFloat($JSCompiler_match$jscomp$inline_113$$[2]);
          } else {
            continue;
          }
        }
      } else {
        $JSCompiler_dpr$jscomp$inline_116$$ = 1;
      }
      $JSCompiler_sources$jscomp$inline_112_element$jscomp$75$$.push({url:$JSCompiler_url$jscomp$inline_114$$, width:$JSCompiler_width$jscomp$inline_115$$, dpr:$JSCompiler_dpr$jscomp$inline_116$$});
    }
    return new $Srcset$$module$src$srcset$$($JSCompiler_sources$jscomp$inline_112_element$jscomp$75$$);
  }
  var $srcAttr$$ = $userAssert$$module$src$log$$($JSCompiler_sources$jscomp$inline_112_element$jscomp$75$$.getAttribute("src"), 'Either non-empty "srcset" or "src" attribute must be specified: %s', $JSCompiler_sources$jscomp$inline_112_element$jscomp$75$$);
  return new $Srcset$$module$src$srcset$$([{url:$srcAttr$$, width:void 0, dpr:1}]);
}
function $Srcset$$module$src$srcset$$($sources$jscomp$1$$) {
  $userAssert$$module$src$log$$(0 < $sources$jscomp$1$$.length, "Srcset must have at least one source");
  this.$sources_$ = $sources$jscomp$1$$;
  for (var $hasWidth$$ = !1, $hasDpr$$ = !1, $i$jscomp$43$$ = 0; $i$jscomp$43$$ < $sources$jscomp$1$$.length; $i$jscomp$43$$++) {
    var $source$jscomp$14$$ = $sources$jscomp$1$$[$i$jscomp$43$$];
    $hasWidth$$ = $hasWidth$$ || !!$source$jscomp$14$$.width;
    $hasDpr$$ = $hasDpr$$ || !!$source$jscomp$14$$.dpr;
  }
  $userAssert$$module$src$log$$(!!($hasWidth$$ ^ $hasDpr$$), "Srcset must have width or dpr sources, but not both");
  $sources$jscomp$1$$.sort($hasWidth$$ ? $sortByWidth$$module$src$srcset$$ : $sortByDpr$$module$src$srcset$$);
  this.$widthBased_$ = $hasWidth$$;
}
$Srcset$$module$src$srcset$$.prototype.select = function($JSCompiler_sources$jscomp$inline_121_JSCompiler_sources$jscomp$inline_131_width$jscomp$28$$, $JSCompiler_temp$jscomp$40_JSCompiler_width$jscomp$inline_120_dpr$jscomp$1$$) {
  if (this.$widthBased_$) {
    $JSCompiler_temp$jscomp$40_JSCompiler_width$jscomp$inline_120_dpr$jscomp$1$$ *= $JSCompiler_sources$jscomp$inline_121_JSCompiler_sources$jscomp$inline_131_width$jscomp$28$$;
    $JSCompiler_sources$jscomp$inline_121_JSCompiler_sources$jscomp$inline_131_width$jscomp$28$$ = this.$sources_$;
    for (var $JSCompiler_minIndex$jscomp$inline_122_JSCompiler_minIndex$jscomp$inline_132$$ = 0, $JSCompiler_minScore$jscomp$inline_123_JSCompiler_minScore$jscomp$inline_133$$ = Infinity, $JSCompiler_i$jscomp$inline_134_JSCompiler_minWidth$jscomp$inline_124$$ = Infinity, $JSCompiler_i$jscomp$inline_125_JSCompiler_score$jscomp$inline_135$$ = 0; $JSCompiler_i$jscomp$inline_125_JSCompiler_score$jscomp$inline_135$$ < $JSCompiler_sources$jscomp$inline_121_JSCompiler_sources$jscomp$inline_131_width$jscomp$28$$.length; $JSCompiler_i$jscomp$inline_125_JSCompiler_score$jscomp$inline_135$$++) {
      var $JSCompiler_sWidth$jscomp$inline_126$$ = $JSCompiler_sources$jscomp$inline_121_JSCompiler_sources$jscomp$inline_131_width$jscomp$28$$[$JSCompiler_i$jscomp$inline_125_JSCompiler_score$jscomp$inline_135$$].width, $JSCompiler_score$jscomp$inline_127$$ = Math.abs($JSCompiler_sWidth$jscomp$inline_126$$ - $JSCompiler_temp$jscomp$40_JSCompiler_width$jscomp$inline_120_dpr$jscomp$1$$);
      if ($JSCompiler_score$jscomp$inline_127$$ <= 1.1 * $JSCompiler_minScore$jscomp$inline_123_JSCompiler_minScore$jscomp$inline_133$$ || 1.2 < $JSCompiler_temp$jscomp$40_JSCompiler_width$jscomp$inline_120_dpr$jscomp$1$$ / $JSCompiler_i$jscomp$inline_134_JSCompiler_minWidth$jscomp$inline_124$$) {
        $JSCompiler_minIndex$jscomp$inline_122_JSCompiler_minIndex$jscomp$inline_132$$ = $JSCompiler_i$jscomp$inline_125_JSCompiler_score$jscomp$inline_135$$, $JSCompiler_minScore$jscomp$inline_123_JSCompiler_minScore$jscomp$inline_133$$ = $JSCompiler_score$jscomp$inline_127$$, $JSCompiler_i$jscomp$inline_134_JSCompiler_minWidth$jscomp$inline_124$$ = $JSCompiler_sWidth$jscomp$inline_126$$;
      } else {
        break;
      }
    }
    $JSCompiler_temp$jscomp$40_JSCompiler_width$jscomp$inline_120_dpr$jscomp$1$$ = $JSCompiler_minIndex$jscomp$inline_122_JSCompiler_minIndex$jscomp$inline_132$$;
  } else {
    $JSCompiler_sources$jscomp$inline_121_JSCompiler_sources$jscomp$inline_131_width$jscomp$28$$ = this.$sources_$;
    $JSCompiler_minIndex$jscomp$inline_122_JSCompiler_minIndex$jscomp$inline_132$$ = 0;
    $JSCompiler_minScore$jscomp$inline_123_JSCompiler_minScore$jscomp$inline_133$$ = Infinity;
    for ($JSCompiler_i$jscomp$inline_134_JSCompiler_minWidth$jscomp$inline_124$$ = 0; $JSCompiler_i$jscomp$inline_134_JSCompiler_minWidth$jscomp$inline_124$$ < $JSCompiler_sources$jscomp$inline_121_JSCompiler_sources$jscomp$inline_131_width$jscomp$28$$.length; $JSCompiler_i$jscomp$inline_134_JSCompiler_minWidth$jscomp$inline_124$$++) {
      if ($JSCompiler_i$jscomp$inline_125_JSCompiler_score$jscomp$inline_135$$ = Math.abs($JSCompiler_sources$jscomp$inline_121_JSCompiler_sources$jscomp$inline_131_width$jscomp$28$$[$JSCompiler_i$jscomp$inline_134_JSCompiler_minWidth$jscomp$inline_124$$].dpr - $JSCompiler_temp$jscomp$40_JSCompiler_width$jscomp$inline_120_dpr$jscomp$1$$), $JSCompiler_i$jscomp$inline_125_JSCompiler_score$jscomp$inline_135$$ <= $JSCompiler_minScore$jscomp$inline_123_JSCompiler_minScore$jscomp$inline_133$$) {
        $JSCompiler_minIndex$jscomp$inline_122_JSCompiler_minIndex$jscomp$inline_132$$ = $JSCompiler_i$jscomp$inline_134_JSCompiler_minWidth$jscomp$inline_124$$, $JSCompiler_minScore$jscomp$inline_123_JSCompiler_minScore$jscomp$inline_133$$ = $JSCompiler_i$jscomp$inline_125_JSCompiler_score$jscomp$inline_135$$;
      } else {
        break;
      }
    }
    $JSCompiler_temp$jscomp$40_JSCompiler_width$jscomp$inline_120_dpr$jscomp$1$$ = $JSCompiler_minIndex$jscomp$inline_122_JSCompiler_minIndex$jscomp$inline_132$$;
  }
  return this.$sources_$[$JSCompiler_temp$jscomp$40_JSCompiler_width$jscomp$inline_120_dpr$jscomp$1$$].url;
};
$Srcset$$module$src$srcset$$.prototype.getUrls = function() {
  return this.$sources_$.map(function($s$jscomp$17$$) {
    return $s$jscomp$17$$.url;
  });
};
$Srcset$$module$src$srcset$$.prototype.stringify = function($opt_mapper$$) {
  for (var $res$jscomp$5$$ = [], $sources$jscomp$4$$ = this.$sources_$, $i$jscomp$46$$ = 0; $i$jscomp$46$$ < $sources$jscomp$4$$.length; $i$jscomp$46$$++) {
    var $source$jscomp$15$$ = $sources$jscomp$4$$[$i$jscomp$46$$], $src$jscomp$5$$ = $source$jscomp$15$$.url;
    $opt_mapper$$ && ($src$jscomp$5$$ = $opt_mapper$$($src$jscomp$5$$));
    $src$jscomp$5$$ = this.$widthBased_$ ? $src$jscomp$5$$ + (" " + $source$jscomp$15$$.width + "w") : $src$jscomp$5$$ + (" " + $source$jscomp$15$$.dpr + "x");
    $res$jscomp$5$$.push($src$jscomp$5$$);
  }
  return $res$jscomp$5$$.join(", ");
};
function $sortByWidth$$module$src$srcset$$($s1$jscomp$1$$, $s2$jscomp$1$$) {
  $userAssert$$module$src$log$$($s1$jscomp$1$$.width != $s2$jscomp$1$$.width, "Duplicate width: %s", $s1$jscomp$1$$.width);
  return $s1$jscomp$1$$.width - $s2$jscomp$1$$.width;
}
function $sortByDpr$$module$src$srcset$$($s1$jscomp$2$$, $s2$jscomp$2$$) {
  $userAssert$$module$src$log$$($s1$jscomp$2$$.dpr != $s2$jscomp$2$$.dpr, "Duplicate dpr: %s", $s1$jscomp$2$$.dpr);
  return $s1$jscomp$2$$.dpr - $s2$jscomp$2$$.dpr;
}
;var $SUPPORTED_ELEMENTS_$$module$extensions$amp_image_lightbox$0_1$amp_image_lightbox$$ = {"amp-img":!0, "amp-anim":!0}, $ARIA_ATTRIBUTES$$module$extensions$amp_image_lightbox$0_1$amp_image_lightbox$$ = ["aria-label", "aria-describedby", "aria-labelledby"], $ENTER_CURVE_$$module$extensions$amp_image_lightbox$0_1$amp_image_lightbox$$ = $bezierCurve$$module$src$curve$$(0.4, 0, 0.2, 1), $EXIT_CURVE_$$module$extensions$amp_image_lightbox$0_1$amp_image_lightbox$$ = $bezierCurve$$module$src$curve$$(0.4, 
0, 0.2, 1), $PAN_ZOOM_CURVE_$$module$extensions$amp_image_lightbox$0_1$amp_image_lightbox$$ = $bezierCurve$$module$src$curve$$(0.4, 0, 0.2, 1.4);
function $ImageViewer$$module$extensions$amp_image_lightbox$0_1$amp_image_lightbox$$($lightbox$$, $win$jscomp$68$$, $loadPromise$$) {
  this.$lightbox_$ = $lightbox$$;
  this.win = $win$jscomp$68$$;
  this.$loadPromise_$ = $loadPromise$$;
  this.$viewer_$ = $lightbox$$.element.ownerDocument.createElement("div");
  this.$viewer_$.classList.add("i-amphtml-image-lightbox-viewer");
  this.$image_$ = $lightbox$$.element.ownerDocument.createElement("img");
  this.$image_$.classList.add("i-amphtml-image-lightbox-viewer-image");
  this.$viewer_$.appendChild(this.$image_$);
  this.$srcset_$ = null;
  this.$sourceHeight_$ = this.$sourceWidth_$ = 0;
  this.$viewerBox_$ = $layoutRectLtwh$$module$src$layout_rect$$(0, 0, 0, 0);
  this.$imageBox_$ = $layoutRectLtwh$$module$src$layout_rect$$(0, 0, 0, 0);
  this.$minScale_$ = this.$maxSeenScale_$ = this.$startScale_$ = this.$scale_$ = 1;
  this.$maxScale_$ = 2;
  this.$maxY_$ = this.$maxX_$ = this.$minY_$ = this.$minX_$ = this.$posY_$ = this.$posX_$ = this.$startY_$ = this.$startX_$ = 0;
  this.$motion_$ = null;
  $JSCompiler_StaticMethods_setupGestures_$$(this);
}
$JSCompiler_prototypeAlias$$ = $ImageViewer$$module$extensions$amp_image_lightbox$0_1$amp_image_lightbox$$.prototype;
$JSCompiler_prototypeAlias$$.getElement = function() {
  return this.$viewer_$;
};
$JSCompiler_prototypeAlias$$.getImage = function() {
  return this.$image_$;
};
$JSCompiler_prototypeAlias$$.getViewerBox = function() {
  return this.$viewerBox_$;
};
$JSCompiler_prototypeAlias$$.getImageBox = function() {
  return this.$imageBox_$;
};
$JSCompiler_prototypeAlias$$.getImageBoxWithOffset = function() {
  if (0 == this.$posX_$ && 0 == this.$posY_$) {
    var $JSCompiler_rect$jscomp$inline_137_JSCompiler_temp$jscomp$38$$ = this.$imageBox_$;
  } else {
    $JSCompiler_rect$jscomp$inline_137_JSCompiler_temp$jscomp$38$$ = this.$imageBox_$;
    var $JSCompiler_dx$jscomp$inline_138$$ = this.$posX_$, $JSCompiler_dy$jscomp$inline_139$$ = this.$posY_$;
    $JSCompiler_rect$jscomp$inline_137_JSCompiler_temp$jscomp$38$$ = 0 == $JSCompiler_dx$jscomp$inline_138$$ && 0 == $JSCompiler_dy$jscomp$inline_139$$ || 0 == $JSCompiler_rect$jscomp$inline_137_JSCompiler_temp$jscomp$38$$.width && 0 == $JSCompiler_rect$jscomp$inline_137_JSCompiler_temp$jscomp$38$$.height ? $JSCompiler_rect$jscomp$inline_137_JSCompiler_temp$jscomp$38$$ : $layoutRectLtwh$$module$src$layout_rect$$($JSCompiler_rect$jscomp$inline_137_JSCompiler_temp$jscomp$38$$.left + $JSCompiler_dx$jscomp$inline_138$$, 
    $JSCompiler_rect$jscomp$inline_137_JSCompiler_temp$jscomp$38$$.top + $JSCompiler_dy$jscomp$inline_139$$, $JSCompiler_rect$jscomp$inline_137_JSCompiler_temp$jscomp$38$$.width, $JSCompiler_rect$jscomp$inline_137_JSCompiler_temp$jscomp$38$$.height);
  }
  return $JSCompiler_rect$jscomp$inline_137_JSCompiler_temp$jscomp$38$$;
};
$JSCompiler_prototypeAlias$$.reset = function() {
  var $$jscomp$this$jscomp$4$$ = this;
  this.$image_$.setAttribute("src", "");
  $ARIA_ATTRIBUTES$$module$extensions$amp_image_lightbox$0_1$amp_image_lightbox$$.forEach(function($key$jscomp$51$$) {
    $$jscomp$this$jscomp$4$$.$image_$.removeAttribute($key$jscomp$51$$);
  });
  this.$image_$.removeAttribute("aria-describedby");
  this.$srcset_$ = null;
  this.$imageBox_$ = $layoutRectLtwh$$module$src$layout_rect$$(0, 0, 0, 0);
  this.$sourceHeight_$ = this.$sourceWidth_$ = 0;
  this.$startScale_$ = this.$scale_$ = this.$maxSeenScale_$ = 1;
  this.$maxScale_$ = 2;
  this.$maxY_$ = this.$maxX_$ = this.$minY_$ = this.$minX_$ = this.$posY_$ = this.$posX_$ = this.$startY_$ = this.$startX_$ = 0;
  this.$motion_$ && this.$motion_$.halt();
  this.$motion_$ = null;
};
function $JSCompiler_StaticMethods_setSourceDimensions_$$($JSCompiler_StaticMethods_setSourceDimensions_$self$$, $ampImg$$, $img$jscomp$2$$) {
  $img$jscomp$2$$ ? ($JSCompiler_StaticMethods_setSourceDimensions_$self$$.$sourceWidth_$ = $img$jscomp$2$$.naturalWidth || $ampImg$$.offsetWidth, $JSCompiler_StaticMethods_setSourceDimensions_$self$$.$sourceHeight_$ = $img$jscomp$2$$.naturalHeight || $ampImg$$.offsetHeight) : ($JSCompiler_StaticMethods_setSourceDimensions_$self$$.$sourceWidth_$ = $ampImg$$.offsetWidth, $JSCompiler_StaticMethods_setSourceDimensions_$self$$.$sourceHeight_$ = $ampImg$$.offsetHeight);
}
$JSCompiler_prototypeAlias$$.init = function($sourceElement$$, $sourceImage$$) {
  var $$jscomp$this$jscomp$5$$ = this;
  $JSCompiler_StaticMethods_setSourceDimensions_$$(this, $sourceElement$$, $sourceImage$$);
  this.$srcset_$ = $srcsetFromElement$$module$src$srcset$$($sourceElement$$);
  $sourceElement$$.getImpl().then(function($sourceElement$$) {
    $sourceElement$$.propagateAttributes($ARIA_ATTRIBUTES$$module$extensions$amp_image_lightbox$0_1$amp_image_lightbox$$, $$jscomp$this$jscomp$5$$.$image_$);
  });
  $sourceImage$$ && $isLoaded$$module$src$event_helper$$($sourceImage$$) && $sourceImage$$.src && this.$image_$.setAttribute("src", $sourceImage$$.src);
};
$JSCompiler_prototypeAlias$$.measure = function() {
  this.$viewerBox_$ = $layoutRectFromDomRect$$module$src$layout_rect$$(this.$viewer_$.getBoundingClientRect());
  var $sourceAspectRatio$$ = this.$sourceWidth_$ / this.$sourceHeight_$, $height$jscomp$26$$ = Math.min(this.$viewerBox_$.width / $sourceAspectRatio$$, this.$viewerBox_$.height), $width$jscomp$30$$ = Math.min(this.$viewerBox_$.height * $sourceAspectRatio$$, this.$viewerBox_$.width);
  16 >= Math.abs($width$jscomp$30$$ - this.$sourceWidth_$) && 16 >= Math.abs($height$jscomp$26$$ - this.$sourceHeight_$) && ($width$jscomp$30$$ = this.$sourceWidth_$, $height$jscomp$26$$ = this.$sourceHeight_$);
  this.$imageBox_$ = $layoutRectLtwh$$module$src$layout_rect$$(Math.round((this.$viewerBox_$.width - $width$jscomp$30$$) / 2), Math.round((this.$viewerBox_$.height - $height$jscomp$26$$) / 2), Math.round($width$jscomp$30$$), Math.round($height$jscomp$26$$));
  $setStyles$$module$src$style$$(this.$image_$, {top:this.$imageBox_$.top + "px", left:this.$imageBox_$.left + "px", width:this.$imageBox_$.width + "px", height:this.$imageBox_$.height + "px"});
  var $viewerBoxRatio$$ = this.$viewerBox_$.width / this.$viewerBox_$.height;
  this.$maxScale_$ = Math.max(2, Math.max($viewerBoxRatio$$ / $sourceAspectRatio$$, $sourceAspectRatio$$ / $viewerBoxRatio$$));
  this.$startScale_$ = this.$scale_$ = 1;
  this.$startY_$ = this.$posY_$ = this.$startX_$ = this.$posX_$ = 0;
  $JSCompiler_StaticMethods_updatePanZoomBounds_$$(this, this.$scale_$);
  $JSCompiler_StaticMethods_updatePanZoom_$$(this);
  return $JSCompiler_StaticMethods_updateSrc_$$(this);
};
function $JSCompiler_StaticMethods_updateSrc_$$($JSCompiler_StaticMethods_updateSrc_$self$$) {
  if (!$JSCompiler_StaticMethods_updateSrc_$self$$.$srcset_$) {
    return $resolvedPromise$$module$src$resolved_promise$$();
  }
  $JSCompiler_StaticMethods_updateSrc_$self$$.$maxSeenScale_$ = Math.max($JSCompiler_StaticMethods_updateSrc_$self$$.$maxSeenScale_$, $JSCompiler_StaticMethods_updateSrc_$self$$.$scale_$);
  var $src$jscomp$6$$ = $JSCompiler_StaticMethods_updateSrc_$self$$.$srcset_$.select($JSCompiler_StaticMethods_updateSrc_$self$$.$imageBox_$.width * $JSCompiler_StaticMethods_updateSrc_$self$$.$maxSeenScale_$, self.devicePixelRatio || 1);
  return $src$jscomp$6$$ == $JSCompiler_StaticMethods_updateSrc_$self$$.$image_$.getAttribute("src") ? $resolvedPromise$$module$src$resolved_promise$$() : $getService$$module$src$service$$($JSCompiler_StaticMethods_updateSrc_$self$$.win, "timer").promise(1).then(function() {
    $JSCompiler_StaticMethods_updateSrc_$self$$.$image_$.setAttribute("src", $src$jscomp$6$$);
    return $JSCompiler_StaticMethods_updateSrc_$self$$.$loadPromise_$($JSCompiler_StaticMethods_updateSrc_$self$$.$image_$);
  });
}
function $JSCompiler_StaticMethods_setupGestures_$$($JSCompiler_StaticMethods_setupGestures_$self$$) {
  var $gestures$$ = $Gestures$$module$src$gesture$get$$($JSCompiler_StaticMethods_setupGestures_$self$$.$image_$);
  $gestures$$.onGesture($TapRecognizer$$module$src$gesture_recognizers$$, function() {
    $JSCompiler_StaticMethods_setupGestures_$self$$.$lightbox_$.toggleViewMode();
  });
  $gestures$$.onGesture($SwipeXYRecognizer$$module$src$gesture_recognizers$$, function($gestures$$) {
    var $e$jscomp$38$$ = $gestures$$.data.deltaY, $JSCompiler_newPosX$jscomp$inline_145$$ = $JSCompiler_StaticMethods_boundX_$$($JSCompiler_StaticMethods_setupGestures_$self$$, $JSCompiler_StaticMethods_setupGestures_$self$$.$startX_$ + $gestures$$.data.deltaX, !0);
    $e$jscomp$38$$ = $JSCompiler_StaticMethods_boundY_$$($JSCompiler_StaticMethods_setupGestures_$self$$, $JSCompiler_StaticMethods_setupGestures_$self$$.$startY_$ + $e$jscomp$38$$, !0);
    $JSCompiler_StaticMethods_set_$$($JSCompiler_StaticMethods_setupGestures_$self$$, $JSCompiler_StaticMethods_setupGestures_$self$$.$scale_$, $JSCompiler_newPosX$jscomp$inline_145$$, $e$jscomp$38$$, !1);
    $gestures$$.data.last && $JSCompiler_StaticMethods_onMoveRelease_$$($JSCompiler_StaticMethods_setupGestures_$self$$, $gestures$$.data.velocityX, $gestures$$.data.velocityY);
  });
  $gestures$$.onPointerDown(function() {
    $JSCompiler_StaticMethods_setupGestures_$self$$.$motion_$ && $JSCompiler_StaticMethods_setupGestures_$self$$.$motion_$.halt();
  });
  $gestures$$.onGesture($DoubletapRecognizer$$module$src$gesture_recognizers$$, function($gestures$$) {
    $JSCompiler_StaticMethods_onZoom_$$($JSCompiler_StaticMethods_setupGestures_$self$$, 1 == $JSCompiler_StaticMethods_setupGestures_$self$$.$scale_$ ? $JSCompiler_StaticMethods_setupGestures_$self$$.$maxScale_$ : $JSCompiler_StaticMethods_setupGestures_$self$$.$minScale_$, $JSCompiler_StaticMethods_setupGestures_$self$$.$viewerBox_$.width / 2 - $gestures$$.data.clientX, $JSCompiler_StaticMethods_setupGestures_$self$$.$viewerBox_$.height / 2 - $gestures$$.data.clientY, !0).then(function() {
      return $JSCompiler_StaticMethods_onZoomRelease_$$($JSCompiler_StaticMethods_setupGestures_$self$$, 0, 0, 0, 0, 0, 0);
    });
  });
  $gestures$$.onGesture($TapzoomRecognizer$$module$src$gesture_recognizers$$, function($gestures$$) {
    $JSCompiler_StaticMethods_onZoomInc_$$($JSCompiler_StaticMethods_setupGestures_$self$$, $gestures$$.data.centerClientX, $gestures$$.data.centerClientY, $gestures$$.data.deltaX, $gestures$$.data.deltaY);
    $gestures$$.data.last && $JSCompiler_StaticMethods_onZoomRelease_$$($JSCompiler_StaticMethods_setupGestures_$self$$, $gestures$$.data.centerClientX, $gestures$$.data.centerClientY, $gestures$$.data.deltaX, $gestures$$.data.deltaY, $gestures$$.data.velocityY, $gestures$$.data.velocityY);
  });
}
function $JSCompiler_StaticMethods_boundX_$$($JSCompiler_StaticMethods_boundX_$self$$, $x$jscomp$87$$, $JSCompiler_extent$jscomp$inline_227_allowExtent$jscomp$1$$) {
  $JSCompiler_extent$jscomp$inline_227_allowExtent$jscomp$1$$ = $JSCompiler_extent$jscomp$inline_227_allowExtent$jscomp$1$$ && 1 < $JSCompiler_StaticMethods_boundX_$self$$.$scale_$ ? 0.25 * $JSCompiler_StaticMethods_boundX_$self$$.$viewerBox_$.width : 0;
  return $clamp$$module$src$utils$math$$($x$jscomp$87$$, $JSCompiler_StaticMethods_boundX_$self$$.$minX_$ - $JSCompiler_extent$jscomp$inline_227_allowExtent$jscomp$1$$, $JSCompiler_StaticMethods_boundX_$self$$.$maxX_$ + $JSCompiler_extent$jscomp$inline_227_allowExtent$jscomp$1$$);
}
function $JSCompiler_StaticMethods_boundY_$$($JSCompiler_StaticMethods_boundY_$self$$, $y$jscomp$70$$, $JSCompiler_extent$jscomp$inline_232_allowExtent$jscomp$2$$) {
  $JSCompiler_extent$jscomp$inline_232_allowExtent$jscomp$2$$ = $JSCompiler_extent$jscomp$inline_232_allowExtent$jscomp$2$$ ? 0.25 * $JSCompiler_StaticMethods_boundY_$self$$.$viewerBox_$.height : 0;
  return $clamp$$module$src$utils$math$$($y$jscomp$70$$, $JSCompiler_StaticMethods_boundY_$self$$.$minY_$ - $JSCompiler_extent$jscomp$inline_232_allowExtent$jscomp$2$$, $JSCompiler_StaticMethods_boundY_$self$$.$maxY_$ + $JSCompiler_extent$jscomp$inline_232_allowExtent$jscomp$2$$);
}
function $JSCompiler_StaticMethods_updatePanZoomBounds_$$($JSCompiler_StaticMethods_updatePanZoomBounds_$self$$, $dw$jscomp$1_scale$jscomp$2$$) {
  var $maxY$$ = 0, $minY$$ = 0, $dh$jscomp$1$$ = $JSCompiler_StaticMethods_updatePanZoomBounds_$self$$.$viewerBox_$.height - $JSCompiler_StaticMethods_updatePanZoomBounds_$self$$.$imageBox_$.height * $dw$jscomp$1_scale$jscomp$2$$;
  0 <= $dh$jscomp$1$$ ? $minY$$ = $maxY$$ = 0 : ($minY$$ = $dh$jscomp$1$$ / 2, $maxY$$ = -$minY$$);
  var $maxX$$ = 0, $minX$$ = 0;
  $dw$jscomp$1_scale$jscomp$2$$ = $JSCompiler_StaticMethods_updatePanZoomBounds_$self$$.$viewerBox_$.width - $JSCompiler_StaticMethods_updatePanZoomBounds_$self$$.$imageBox_$.width * $dw$jscomp$1_scale$jscomp$2$$;
  0 <= $dw$jscomp$1_scale$jscomp$2$$ ? $minX$$ = $maxX$$ = 0 : ($minX$$ = $dw$jscomp$1_scale$jscomp$2$$ / 2, $maxX$$ = -$minX$$);
  $JSCompiler_StaticMethods_updatePanZoomBounds_$self$$.$minX_$ = $minX$$;
  $JSCompiler_StaticMethods_updatePanZoomBounds_$self$$.$minY_$ = $minY$$;
  $JSCompiler_StaticMethods_updatePanZoomBounds_$self$$.$maxX_$ = $maxX$$;
  $JSCompiler_StaticMethods_updatePanZoomBounds_$self$$.$maxY_$ = $maxY$$;
}
function $JSCompiler_StaticMethods_updatePanZoom_$$($JSCompiler_StaticMethods_updatePanZoom_$self$$) {
  var $JSCompiler_temp_const$jscomp$30$$ = $JSCompiler_StaticMethods_updatePanZoom_$self$$.$image_$;
  var $JSCompiler_inline_result$jscomp$31_JSCompiler_x$jscomp$inline_148$$ = $JSCompiler_StaticMethods_updatePanZoom_$self$$.$posX_$;
  var $JSCompiler_opt_y$jscomp$inline_149$$ = $JSCompiler_StaticMethods_updatePanZoom_$self$$.$posY_$;
  "number" == typeof $JSCompiler_inline_result$jscomp$31_JSCompiler_x$jscomp$inline_148$$ && ($JSCompiler_inline_result$jscomp$31_JSCompiler_x$jscomp$inline_148$$ += "px");
  void 0 === $JSCompiler_opt_y$jscomp$inline_149$$ ? $JSCompiler_inline_result$jscomp$31_JSCompiler_x$jscomp$inline_148$$ = "translate(" + $JSCompiler_inline_result$jscomp$31_JSCompiler_x$jscomp$inline_148$$ + ")" : ("number" == typeof $JSCompiler_opt_y$jscomp$inline_149$$ && ($JSCompiler_opt_y$jscomp$inline_149$$ += "px"), $JSCompiler_inline_result$jscomp$31_JSCompiler_x$jscomp$inline_148$$ = "translate(" + $JSCompiler_inline_result$jscomp$31_JSCompiler_x$jscomp$inline_148$$ + ", " + $JSCompiler_opt_y$jscomp$inline_149$$ + 
  ")");
  $setStyles$$module$src$style$$($JSCompiler_temp_const$jscomp$30$$, {transform:$JSCompiler_inline_result$jscomp$31_JSCompiler_x$jscomp$inline_148$$ + " scale(" + ($JSCompiler_StaticMethods_updatePanZoom_$self$$.$scale_$ + ")")});
  1 != $JSCompiler_StaticMethods_updatePanZoom_$self$$.$scale_$ && $JSCompiler_StaticMethods_updatePanZoom_$self$$.$lightbox_$.toggleViewMode(!0);
}
function $JSCompiler_StaticMethods_onMoveRelease_$$($JSCompiler_StaticMethods_onMoveRelease_$self$$, $veloX$jscomp$2$$, $veloY$jscomp$2$$) {
  var $deltaY$jscomp$4$$ = $JSCompiler_StaticMethods_onMoveRelease_$self$$.$posY_$ - $JSCompiler_StaticMethods_onMoveRelease_$self$$.$startY_$;
  1 == $JSCompiler_StaticMethods_onMoveRelease_$self$$.$scale_$ && 10 < Math.abs($deltaY$jscomp$4$$) ? $JSCompiler_StaticMethods_onMoveRelease_$self$$.$lightbox_$.close() : ($JSCompiler_StaticMethods_onMoveRelease_$self$$.$motion_$ = $continueMotion$$module$src$motion$$($JSCompiler_StaticMethods_onMoveRelease_$self$$.$image_$, $JSCompiler_StaticMethods_onMoveRelease_$self$$.$posX_$, $JSCompiler_StaticMethods_onMoveRelease_$self$$.$posY_$, $veloX$jscomp$2$$, $veloY$jscomp$2$$, function($veloX$jscomp$2$$, 
  $veloY$jscomp$2$$) {
    $veloX$jscomp$2$$ = $JSCompiler_StaticMethods_boundX_$$($JSCompiler_StaticMethods_onMoveRelease_$self$$, $veloX$jscomp$2$$, !0);
    $veloY$jscomp$2$$ = $JSCompiler_StaticMethods_boundY_$$($JSCompiler_StaticMethods_onMoveRelease_$self$$, $veloY$jscomp$2$$, !0);
    if (1 > Math.abs($veloX$jscomp$2$$ - $JSCompiler_StaticMethods_onMoveRelease_$self$$.$posX_$) && 1 > Math.abs($veloY$jscomp$2$$ - $JSCompiler_StaticMethods_onMoveRelease_$self$$.$posY_$)) {
      return !1;
    }
    $JSCompiler_StaticMethods_set_$$($JSCompiler_StaticMethods_onMoveRelease_$self$$, $JSCompiler_StaticMethods_onMoveRelease_$self$$.$scale_$, $veloX$jscomp$2$$, $veloY$jscomp$2$$, !1);
    return !0;
  }), $JSCompiler_StaticMethods_onMoveRelease_$self$$.$motion_$.thenAlways(function() {
    $JSCompiler_StaticMethods_onMoveRelease_$self$$.$motion_$ = null;
    return $JSCompiler_StaticMethods_release_$$($JSCompiler_StaticMethods_onMoveRelease_$self$$);
  }));
}
function $JSCompiler_StaticMethods_onZoomInc_$$($JSCompiler_StaticMethods_onZoomInc_$self$$, $centerClientX$$, $centerClientY$$, $deltaX$jscomp$4$$, $deltaY$jscomp$5$$) {
  var $dist$$ = $magnitude$$module$src$utils$math$$($deltaX$jscomp$4$$, $deltaY$jscomp$5$$), $zoomSign$$ = Math.abs($deltaY$jscomp$5$$) > Math.abs($deltaX$jscomp$4$$) ? Math.sign($deltaY$jscomp$5$$) : Math.sign(-$deltaX$jscomp$4$$);
  if (0 != $zoomSign$$) {
    var $newScale$jscomp$1$$ = $JSCompiler_StaticMethods_onZoomInc_$self$$.$startScale_$ * (1 + $zoomSign$$ * $dist$$ / 100), $deltaCenterX$$ = $JSCompiler_StaticMethods_onZoomInc_$self$$.$viewerBox_$.width / 2 - $centerClientX$$, $deltaCenterY$$ = $JSCompiler_StaticMethods_onZoomInc_$self$$.$viewerBox_$.height / 2 - $centerClientY$$;
    $deltaX$jscomp$4$$ = Math.min($deltaCenterX$$, $dist$$ / 100 * $deltaCenterX$$);
    $deltaY$jscomp$5$$ = Math.min($deltaCenterY$$, $dist$$ / 100 * $deltaCenterY$$);
    $JSCompiler_StaticMethods_onZoom_$$($JSCompiler_StaticMethods_onZoomInc_$self$$, $newScale$jscomp$1$$, $deltaX$jscomp$4$$, $deltaY$jscomp$5$$, !1);
  }
}
function $JSCompiler_StaticMethods_onZoom_$$($JSCompiler_StaticMethods_onZoom_$self$$, $newScale$jscomp$2_scale$jscomp$3$$, $deltaX$jscomp$5_newPosX$jscomp$2$$, $deltaY$jscomp$6_newPosY$jscomp$2$$, $animate$jscomp$1$$) {
  $newScale$jscomp$2_scale$jscomp$3$$ = $clamp$$module$src$utils$math$$($newScale$jscomp$2_scale$jscomp$3$$, $JSCompiler_StaticMethods_onZoom_$self$$.$minScale_$ - 0.25, $JSCompiler_StaticMethods_onZoom_$self$$.$maxScale_$ + 0.25);
  if ($newScale$jscomp$2_scale$jscomp$3$$ != $JSCompiler_StaticMethods_onZoom_$self$$.$scale_$) {
    return $JSCompiler_StaticMethods_updatePanZoomBounds_$$($JSCompiler_StaticMethods_onZoom_$self$$, $newScale$jscomp$2_scale$jscomp$3$$), $deltaX$jscomp$5_newPosX$jscomp$2$$ = $JSCompiler_StaticMethods_boundX_$$($JSCompiler_StaticMethods_onZoom_$self$$, $JSCompiler_StaticMethods_onZoom_$self$$.$startX_$ + $deltaX$jscomp$5_newPosX$jscomp$2$$ * $newScale$jscomp$2_scale$jscomp$3$$, !1), $deltaY$jscomp$6_newPosY$jscomp$2$$ = $JSCompiler_StaticMethods_boundY_$$($JSCompiler_StaticMethods_onZoom_$self$$, 
    $JSCompiler_StaticMethods_onZoom_$self$$.$startY_$ + $deltaY$jscomp$6_newPosY$jscomp$2$$ * $newScale$jscomp$2_scale$jscomp$3$$, !1), $JSCompiler_StaticMethods_set_$$($JSCompiler_StaticMethods_onZoom_$self$$, $newScale$jscomp$2_scale$jscomp$3$$, $deltaX$jscomp$5_newPosX$jscomp$2$$, $deltaY$jscomp$6_newPosY$jscomp$2$$, $animate$jscomp$1$$);
  }
}
function $JSCompiler_StaticMethods_onZoomRelease_$$($JSCompiler_StaticMethods_onZoomRelease_$self$$, $centerClientX$jscomp$1$$, $centerClientY$jscomp$1$$, $deltaX$jscomp$6_promise$jscomp$2$$, $deltaY$jscomp$7$$, $veloX$jscomp$3$$, $veloY$jscomp$3$$) {
  $deltaX$jscomp$6_promise$jscomp$2$$ = 0 == $veloX$jscomp$3$$ && 0 == $veloY$jscomp$3$$ ? $resolvedPromise$$module$src$resolved_promise$$() : $continueMotion$$module$src$motion$$($JSCompiler_StaticMethods_onZoomRelease_$self$$.$image_$, $deltaX$jscomp$6_promise$jscomp$2$$, $deltaY$jscomp$7$$, $veloX$jscomp$3$$, $veloY$jscomp$3$$, function($deltaX$jscomp$6_promise$jscomp$2$$, $deltaY$jscomp$7$$) {
    $JSCompiler_StaticMethods_onZoomInc_$$($JSCompiler_StaticMethods_onZoomRelease_$self$$, $centerClientX$jscomp$1$$, $centerClientY$jscomp$1$$, $deltaX$jscomp$6_promise$jscomp$2$$, $deltaY$jscomp$7$$);
    return !0;
  }).thenAlways();
  var $relayout$$ = $JSCompiler_StaticMethods_onZoomRelease_$self$$.$scale_$ > $JSCompiler_StaticMethods_onZoomRelease_$self$$.$startScale_$;
  return $deltaX$jscomp$6_promise$jscomp$2$$.then(function() {
    return $JSCompiler_StaticMethods_release_$$($JSCompiler_StaticMethods_onZoomRelease_$self$$);
  }).then(function() {
    $relayout$$ && $JSCompiler_StaticMethods_updateSrc_$$($JSCompiler_StaticMethods_onZoomRelease_$self$$);
  });
}
function $JSCompiler_StaticMethods_set_$$($JSCompiler_StaticMethods_set_$self$$, $newScale$jscomp$3$$, $newPosX$jscomp$3$$, $newPosY$jscomp$3$$, $animate$jscomp$2_promise$jscomp$3$$) {
  var $ds$$ = $newScale$jscomp$3$$ - $JSCompiler_StaticMethods_set_$self$$.$scale_$, $dist$jscomp$1$$ = $magnitude$$module$src$utils$math$$($newPosX$jscomp$3$$ - $JSCompiler_StaticMethods_set_$self$$.$posX_$, $newPosY$jscomp$3$$ - $JSCompiler_StaticMethods_set_$self$$.$posY_$), $dur$$ = 0;
  $animate$jscomp$2_promise$jscomp$3$$ && ($dur$$ = Math.min(250, Math.max(2.5 * $dist$jscomp$1$$, 250 * Math.abs($ds$$))));
  if (16 < $dur$$ && $animate$jscomp$2_promise$jscomp$3$$) {
    var $scaleFunc$$ = $numeric$$module$src$transition$$($JSCompiler_StaticMethods_set_$self$$.$scale_$, $newScale$jscomp$3$$), $xFunc$$ = $numeric$$module$src$transition$$($JSCompiler_StaticMethods_set_$self$$.$posX_$, $newPosX$jscomp$3$$), $yFunc$$ = $numeric$$module$src$transition$$($JSCompiler_StaticMethods_set_$self$$.$posY_$, $newPosY$jscomp$3$$);
    $animate$jscomp$2_promise$jscomp$3$$ = $Animation$$module$src$animation$animate$$($JSCompiler_StaticMethods_set_$self$$.$image_$, function($newScale$jscomp$3$$) {
      $JSCompiler_StaticMethods_set_$self$$.$scale_$ = $scaleFunc$$($newScale$jscomp$3$$);
      $JSCompiler_StaticMethods_set_$self$$.$posX_$ = $xFunc$$($newScale$jscomp$3$$);
      $JSCompiler_StaticMethods_set_$self$$.$posY_$ = $yFunc$$($newScale$jscomp$3$$);
      $JSCompiler_StaticMethods_updatePanZoom_$$($JSCompiler_StaticMethods_set_$self$$);
    }, $dur$$).thenAlways(function() {
      $JSCompiler_StaticMethods_set_$self$$.$scale_$ = $newScale$jscomp$3$$;
      $JSCompiler_StaticMethods_set_$self$$.$posX_$ = $newPosX$jscomp$3$$;
      $JSCompiler_StaticMethods_set_$self$$.$posY_$ = $newPosY$jscomp$3$$;
      $JSCompiler_StaticMethods_updatePanZoom_$$($JSCompiler_StaticMethods_set_$self$$);
    });
  } else {
    $JSCompiler_StaticMethods_set_$self$$.$scale_$ = $newScale$jscomp$3$$, $JSCompiler_StaticMethods_set_$self$$.$posX_$ = $newPosX$jscomp$3$$, $JSCompiler_StaticMethods_set_$self$$.$posY_$ = $newPosY$jscomp$3$$, $JSCompiler_StaticMethods_updatePanZoom_$$($JSCompiler_StaticMethods_set_$self$$), $animate$jscomp$2_promise$jscomp$3$$ = $animate$jscomp$2_promise$jscomp$3$$ ? $resolvedPromise$$module$src$resolved_promise$$() : void 0;
  }
  return $animate$jscomp$2_promise$jscomp$3$$;
}
function $JSCompiler_StaticMethods_release_$$($JSCompiler_StaticMethods_release_$self$$) {
  var $newScale$jscomp$4$$ = $clamp$$module$src$utils$math$$($JSCompiler_StaticMethods_release_$self$$.$scale_$, $JSCompiler_StaticMethods_release_$self$$.$minScale_$ - 0, $JSCompiler_StaticMethods_release_$self$$.$maxScale_$ + 0);
  $newScale$jscomp$4$$ != $JSCompiler_StaticMethods_release_$self$$.$scale_$ && $JSCompiler_StaticMethods_updatePanZoomBounds_$$($JSCompiler_StaticMethods_release_$self$$, $newScale$jscomp$4$$);
  var $newPosX$jscomp$4$$ = $JSCompiler_StaticMethods_boundX_$$($JSCompiler_StaticMethods_release_$self$$, $JSCompiler_StaticMethods_release_$self$$.$posX_$ / $JSCompiler_StaticMethods_release_$self$$.$scale_$ * $newScale$jscomp$4$$, !1), $newPosY$jscomp$4$$ = $JSCompiler_StaticMethods_boundY_$$($JSCompiler_StaticMethods_release_$self$$, $JSCompiler_StaticMethods_release_$self$$.$posY_$ / $JSCompiler_StaticMethods_release_$self$$.$scale_$ * $newScale$jscomp$4$$, !1);
  return $JSCompiler_StaticMethods_set_$$($JSCompiler_StaticMethods_release_$self$$, $newScale$jscomp$4$$, $newPosX$jscomp$4$$, $newPosY$jscomp$4$$, !0).then(function() {
    $JSCompiler_StaticMethods_release_$self$$.$startScale_$ = $JSCompiler_StaticMethods_release_$self$$.$scale_$;
    $JSCompiler_StaticMethods_release_$self$$.$startX_$ = $JSCompiler_StaticMethods_release_$self$$.$posX_$;
    $JSCompiler_StaticMethods_release_$self$$.$startY_$ = $JSCompiler_StaticMethods_release_$self$$.$posY_$;
  });
}
function $AmpImageLightbox$$module$extensions$amp_image_lightbox$0_1$amp_image_lightbox$$($element$jscomp$76$$) {
  var $$jscomp$super$this$$ = AMP.BaseElement.call(this, $element$jscomp$76$$) || this;
  $$jscomp$super$this$$.$historyId_$ = -1;
  $$jscomp$super$this$$.$active_$ = !1;
  $$jscomp$super$this$$.$entering_$ = !1;
  $$jscomp$super$this$$.$sourceElement_$ = null;
  $$jscomp$super$this$$.$sourceImage_$ = null;
  $$jscomp$super$this$$.$unlistenViewport_$ = null;
  $$jscomp$super$this$$.$container_$ = null;
  $$jscomp$super$this$$.$imageViewer_$ = null;
  $$jscomp$super$this$$.$captionElement_$ = null;
  $$jscomp$super$this$$.$boundCloseOnEscape_$ = $$jscomp$super$this$$.$closeOnEscape_$.bind($$jscomp$super$this$$);
  $$jscomp$super$this$$.registerDefaultAction(function($element$jscomp$76$$) {
    return $JSCompiler_StaticMethods_open_$$($$jscomp$super$this$$, $element$jscomp$76$$);
  }, "open");
  return $$jscomp$super$this$$;
}
$$jscomp$inherits$$($AmpImageLightbox$$module$extensions$amp_image_lightbox$0_1$amp_image_lightbox$$, AMP.BaseElement);
$AmpImageLightbox$$module$extensions$amp_image_lightbox$0_1$amp_image_lightbox$$.prototype.buildCallback = function() {
  var $JSCompiler_ampdoc$jscomp$inline_237_JSCompiler_element$jscomp$inline_202_JSCompiler_holder$jscomp$inline_238_JSCompiler_temp$jscomp$221$$ = this.element, $JSCompiler_win$jscomp$inline_203$$ = $JSCompiler_ampdoc$jscomp$inline_237_JSCompiler_element$jscomp$inline_202_JSCompiler_holder$jscomp$inline_238_JSCompiler_temp$jscomp$221$$.ownerDocument.defaultView, $JSCompiler_inline_result$jscomp$220_JSCompiler_topWin$jscomp$inline_204$$ = $JSCompiler_win$jscomp$inline_203$$.__AMP_TOP || ($JSCompiler_win$jscomp$inline_203$$.__AMP_TOP = 
  $JSCompiler_win$jscomp$inline_203$$), $JSCompiler_isEmbed$jscomp$inline_205$$ = $JSCompiler_win$jscomp$inline_203$$ != $JSCompiler_inline_result$jscomp$220_JSCompiler_topWin$jscomp$inline_204$$;
  if ($experimentToggles$$module$src$experiments$$($JSCompiler_inline_result$jscomp$220_JSCompiler_topWin$jscomp$inline_204$$)["ampdoc-fie"]) {
    $JSCompiler_inline_result$jscomp$220_JSCompiler_topWin$jscomp$inline_204$$.__AMP_EXPERIMENT_BRANCHES = $JSCompiler_inline_result$jscomp$220_JSCompiler_topWin$jscomp$inline_204$$.__AMP_EXPERIMENT_BRANCHES || {};
    for (var $JSCompiler_i$jscomp$inline_254$$ = 0; $JSCompiler_i$jscomp$inline_254$$ < $EXPERIMENT_INFO_LIST$$module$src$ampdoc_fie$$.length; $JSCompiler_i$jscomp$inline_254$$++) {
      var $JSCompiler_arr$jscomp$inline_263_JSCompiler_experiment$jscomp$inline_255$$ = $EXPERIMENT_INFO_LIST$$module$src$ampdoc_fie$$[$JSCompiler_i$jscomp$inline_254$$], $JSCompiler_experimentName$jscomp$inline_256$$ = $JSCompiler_arr$jscomp$inline_263_JSCompiler_experiment$jscomp$inline_255$$.experimentId;
      $hasOwn_$$module$src$utils$object$$.call($JSCompiler_inline_result$jscomp$220_JSCompiler_topWin$jscomp$inline_204$$.__AMP_EXPERIMENT_BRANCHES, $JSCompiler_experimentName$jscomp$inline_256$$) || ($JSCompiler_arr$jscomp$inline_263_JSCompiler_experiment$jscomp$inline_255$$.isTrafficEligible && $JSCompiler_arr$jscomp$inline_263_JSCompiler_experiment$jscomp$inline_255$$.isTrafficEligible($JSCompiler_inline_result$jscomp$220_JSCompiler_topWin$jscomp$inline_204$$) ? !$JSCompiler_inline_result$jscomp$220_JSCompiler_topWin$jscomp$inline_204$$.__AMP_EXPERIMENT_BRANCHES[$JSCompiler_experimentName$jscomp$inline_256$$] && 
      $experimentToggles$$module$src$experiments$$($JSCompiler_inline_result$jscomp$220_JSCompiler_topWin$jscomp$inline_204$$)[$JSCompiler_experimentName$jscomp$inline_256$$] && ($JSCompiler_arr$jscomp$inline_263_JSCompiler_experiment$jscomp$inline_255$$ = $JSCompiler_arr$jscomp$inline_263_JSCompiler_experiment$jscomp$inline_255$$.branches, $JSCompiler_inline_result$jscomp$220_JSCompiler_topWin$jscomp$inline_204$$.__AMP_EXPERIMENT_BRANCHES[$JSCompiler_experimentName$jscomp$inline_256$$] = $JSCompiler_arr$jscomp$inline_263_JSCompiler_experiment$jscomp$inline_255$$[Math.floor(Math.random() * 
      $JSCompiler_arr$jscomp$inline_263_JSCompiler_experiment$jscomp$inline_255$$.length)] || null) : $JSCompiler_inline_result$jscomp$220_JSCompiler_topWin$jscomp$inline_204$$.__AMP_EXPERIMENT_BRANCHES[$JSCompiler_experimentName$jscomp$inline_256$$] = null);
    }
    $JSCompiler_inline_result$jscomp$220_JSCompiler_topWin$jscomp$inline_204$$ = "21065002" === ($JSCompiler_inline_result$jscomp$220_JSCompiler_topWin$jscomp$inline_204$$.__AMP_EXPERIMENT_BRANCHES ? $JSCompiler_inline_result$jscomp$220_JSCompiler_topWin$jscomp$inline_204$$.__AMP_EXPERIMENT_BRANCHES["ampdoc-fie"] : null);
  } else {
    $JSCompiler_inline_result$jscomp$220_JSCompiler_topWin$jscomp$inline_204$$ = !1;
  }
  $JSCompiler_isEmbed$jscomp$inline_205$$ && !$JSCompiler_inline_result$jscomp$220_JSCompiler_topWin$jscomp$inline_204$$ ? $JSCompiler_ampdoc$jscomp$inline_237_JSCompiler_element$jscomp$inline_202_JSCompiler_holder$jscomp$inline_238_JSCompiler_temp$jscomp$221$$ = $isServiceRegistered$$module$src$service$$($JSCompiler_win$jscomp$inline_203$$, "action") ? $getServiceInternal$$module$src$service$$($JSCompiler_win$jscomp$inline_203$$, "action") : null : ($JSCompiler_ampdoc$jscomp$inline_237_JSCompiler_element$jscomp$inline_202_JSCompiler_holder$jscomp$inline_238_JSCompiler_temp$jscomp$221$$ = 
  $getAmpdoc$$module$src$service$$($JSCompiler_ampdoc$jscomp$inline_237_JSCompiler_element$jscomp$inline_202_JSCompiler_holder$jscomp$inline_238_JSCompiler_temp$jscomp$221$$), $JSCompiler_ampdoc$jscomp$inline_237_JSCompiler_element$jscomp$inline_202_JSCompiler_holder$jscomp$inline_238_JSCompiler_temp$jscomp$221$$ = $getAmpdocServiceHolder$$module$src$service$$($JSCompiler_ampdoc$jscomp$inline_237_JSCompiler_element$jscomp$inline_202_JSCompiler_holder$jscomp$inline_238_JSCompiler_temp$jscomp$221$$), 
  $JSCompiler_ampdoc$jscomp$inline_237_JSCompiler_element$jscomp$inline_202_JSCompiler_holder$jscomp$inline_238_JSCompiler_temp$jscomp$221$$ = $isServiceRegistered$$module$src$service$$($JSCompiler_ampdoc$jscomp$inline_237_JSCompiler_element$jscomp$inline_202_JSCompiler_holder$jscomp$inline_238_JSCompiler_temp$jscomp$221$$, "action") ? $getServiceInternal$$module$src$service$$($JSCompiler_ampdoc$jscomp$inline_237_JSCompiler_element$jscomp$inline_202_JSCompiler_holder$jscomp$inline_238_JSCompiler_temp$jscomp$221$$, 
  "action") : null);
  $JSCompiler_ampdoc$jscomp$inline_237_JSCompiler_element$jscomp$inline_202_JSCompiler_holder$jscomp$inline_238_JSCompiler_temp$jscomp$221$$.addToAllowlist("AMP-IMAGE-LIGHTBOX", "open", ["email"]);
};
function $JSCompiler_StaticMethods_buildLightbox_$$($JSCompiler_StaticMethods_buildLightbox_$self$$) {
  if (!$JSCompiler_StaticMethods_buildLightbox_$self$$.$container_$) {
    $JSCompiler_StaticMethods_buildLightbox_$self$$.$container_$ = $JSCompiler_StaticMethods_buildLightbox_$self$$.element.ownerDocument.createElement("div");
    $JSCompiler_StaticMethods_buildLightbox_$self$$.$container_$.classList.add("i-amphtml-image-lightbox-container");
    $JSCompiler_StaticMethods_buildLightbox_$self$$.element.appendChild($JSCompiler_StaticMethods_buildLightbox_$self$$.$container_$);
    $JSCompiler_StaticMethods_buildLightbox_$self$$.$imageViewer_$ = new $ImageViewer$$module$extensions$amp_image_lightbox$0_1$amp_image_lightbox$$($JSCompiler_StaticMethods_buildLightbox_$self$$, $JSCompiler_StaticMethods_buildLightbox_$self$$.win, $JSCompiler_StaticMethods_buildLightbox_$self$$.loadPromise.bind($JSCompiler_StaticMethods_buildLightbox_$self$$));
    $JSCompiler_StaticMethods_buildLightbox_$self$$.$container_$.appendChild($JSCompiler_StaticMethods_buildLightbox_$self$$.$imageViewer_$.getElement());
    $JSCompiler_StaticMethods_buildLightbox_$self$$.$captionElement_$ = $JSCompiler_StaticMethods_buildLightbox_$self$$.element.ownerDocument.createElement("div");
    $JSCompiler_StaticMethods_buildLightbox_$self$$.$captionElement_$.setAttribute("id", $JSCompiler_StaticMethods_buildLightbox_$self$$.element.getAttribute("id") + "-caption");
    $JSCompiler_StaticMethods_buildLightbox_$self$$.$captionElement_$.classList.add("amp-image-lightbox-caption");
    $JSCompiler_StaticMethods_buildLightbox_$self$$.$captionElement_$.classList.add("i-amphtml-image-lightbox-caption");
    $JSCompiler_StaticMethods_buildLightbox_$self$$.$container_$.appendChild($JSCompiler_StaticMethods_buildLightbox_$self$$.$captionElement_$);
    var $screenReaderCloseButton$$ = $JSCompiler_StaticMethods_buildLightbox_$self$$.element.ownerDocument.createElement("button"), $ariaLabel$$ = $JSCompiler_StaticMethods_buildLightbox_$self$$.element.getAttribute("data-close-button-aria-label") || "Close the lightbox";
    $screenReaderCloseButton$$.textContent = $ariaLabel$$;
    $screenReaderCloseButton$$.classList.add("i-amphtml-screen-reader");
    $screenReaderCloseButton$$.tabIndex = -1;
    $screenReaderCloseButton$$.addEventListener("click", function() {
      $JSCompiler_StaticMethods_buildLightbox_$self$$.close();
    });
    $JSCompiler_StaticMethods_buildLightbox_$self$$.element.appendChild($screenReaderCloseButton$$);
    var $gestures$jscomp$1$$ = $Gestures$$module$src$gesture$get$$($JSCompiler_StaticMethods_buildLightbox_$self$$.element);
    $JSCompiler_StaticMethods_buildLightbox_$self$$.element.addEventListener("click", function($screenReaderCloseButton$$) {
      $JSCompiler_StaticMethods_buildLightbox_$self$$.$entering_$ || $JSCompiler_StaticMethods_buildLightbox_$self$$.$imageViewer_$.getImage().contains($screenReaderCloseButton$$.target) || $JSCompiler_StaticMethods_buildLightbox_$self$$.close();
    });
    $gestures$jscomp$1$$.onGesture($TapRecognizer$$module$src$gesture_recognizers$$, function() {
      $JSCompiler_StaticMethods_buildLightbox_$self$$.$entering_$ || $JSCompiler_StaticMethods_buildLightbox_$self$$.close();
    });
    $gestures$jscomp$1$$.onGesture($SwipeXYRecognizer$$module$src$gesture_recognizers$$, function() {
    });
  }
}
function $JSCompiler_StaticMethods_open_$$($JSCompiler_StaticMethods_open_$self$$, $invocation$jscomp$1_source$jscomp$16$$) {
  $JSCompiler_StaticMethods_open_$self$$.$active_$ || ($JSCompiler_StaticMethods_buildLightbox_$$($JSCompiler_StaticMethods_open_$self$$), $invocation$jscomp$1_source$jscomp$16$$ = $invocation$jscomp$1_source$jscomp$16$$.caller, $userAssert$$module$src$log$$($invocation$jscomp$1_source$jscomp$16$$ && $SUPPORTED_ELEMENTS_$$module$extensions$amp_image_lightbox$0_1$amp_image_lightbox$$[$invocation$jscomp$1_source$jscomp$16$$.tagName.toLowerCase()], "Unsupported element: %s", $invocation$jscomp$1_source$jscomp$16$$.tagName), 
  $JSCompiler_StaticMethods_open_$self$$.$active_$ = !0, $JSCompiler_StaticMethods_reset_$$($JSCompiler_StaticMethods_open_$self$$), $JSCompiler_StaticMethods_init_$$($JSCompiler_StaticMethods_open_$self$$, $invocation$jscomp$1_source$jscomp$16$$), $JSCompiler_StaticMethods_open_$self$$.win.document.documentElement.addEventListener("keydown", $JSCompiler_StaticMethods_open_$self$$.$boundCloseOnEscape_$), $JSCompiler_StaticMethods_open_$self$$.getViewport().enterLightboxMode(), $JSCompiler_StaticMethods_enter_$$($JSCompiler_StaticMethods_open_$self$$), 
  $JSCompiler_StaticMethods_open_$self$$.$unlistenViewport_$ = $JSCompiler_StaticMethods_open_$self$$.getViewport().onChanged(function() {
    $JSCompiler_StaticMethods_open_$self$$.$active_$ && ($startsWith$$module$src$string$$($getService$$module$src$service$$($JSCompiler_StaticMethods_open_$self$$.win, "platform").getIosVersionString(), "10.3") ? $getService$$module$src$service$$($JSCompiler_StaticMethods_open_$self$$.win, "timer").delay(function() {
      $JSCompiler_StaticMethods_open_$self$$.$imageViewer_$.measure();
    }, 500) : $JSCompiler_StaticMethods_open_$self$$.$imageViewer_$.measure());
  }), $getServiceForDoc$$module$src$service$$($JSCompiler_StaticMethods_open_$self$$.getAmpDoc()).push($JSCompiler_StaticMethods_open_$self$$.close.bind($JSCompiler_StaticMethods_open_$self$$)).then(function($invocation$jscomp$1_source$jscomp$16$$) {
    $JSCompiler_StaticMethods_open_$self$$.$historyId_$ = $invocation$jscomp$1_source$jscomp$16$$;
  }));
}
$AmpImageLightbox$$module$extensions$amp_image_lightbox$0_1$amp_image_lightbox$$.prototype.$closeOnEscape_$ = function($event$jscomp$23$$) {
  "Escape" == $event$jscomp$23$$.key && ($event$jscomp$23$$.preventDefault(), this.close());
};
$AmpImageLightbox$$module$extensions$amp_image_lightbox$0_1$amp_image_lightbox$$.prototype.close = function() {
  if (this.$active_$ && (this.$entering_$ = this.$active_$ = !1, $JSCompiler_StaticMethods_exit_$$(this), this.$unlistenViewport_$ && (this.$unlistenViewport_$(), this.$unlistenViewport_$ = null), this.getViewport().leaveLightboxMode(), -1 != this.$historyId_$ && $getServiceForDoc$$module$src$service$$(this.getAmpDoc()).pop(this.$historyId_$), this.win.document.documentElement.removeEventListener("keydown", this.$boundCloseOnEscape_$), this.$sourceElement_$)) {
    try {
      this.$sourceElement_$.focus();
    } catch ($JSCompiler_e$jscomp$inline_152$$) {
    }
  }
};
$AmpImageLightbox$$module$extensions$amp_image_lightbox$0_1$amp_image_lightbox$$.prototype.toggleViewMode = function($opt_on$jscomp$1$$) {
  void 0 !== $opt_on$jscomp$1$$ ? this.$container_$.classList.toggle("i-amphtml-image-lightbox-view-mode", $opt_on$jscomp$1$$) : this.$container_$.classList.toggle("i-amphtml-image-lightbox-view-mode");
};
function $JSCompiler_StaticMethods_init_$$($JSCompiler_StaticMethods_init_$self$$, $JSCompiler_to$jscomp$inline_161_sourceElement$jscomp$1$$) {
  $JSCompiler_StaticMethods_init_$self$$.$sourceElement_$ = $JSCompiler_to$jscomp$inline_161_sourceElement$jscomp$1$$;
  /^[\w-]+$/.test("img");
  if (void 0 !== $scopeSelectorSupported$$module$src$css$$) {
    var $JSCompiler_elements$jscomp$inline_214_JSCompiler_frag$jscomp$inline_162_JSCompiler_inline_result$jscomp$219_JSCompiler_inline_result$jscomp$23_JSCompiler_scopedSelector$jscomp$inline_213_JSCompiler_temp$jscomp$218$$ = $scopeSelectorSupported$$module$src$css$$;
  } else {
    try {
      var $JSCompiler_doc$jscomp$inline_243_JSCompiler_from$jscomp$inline_160_JSCompiler_n$jscomp$inline_163$$ = $JSCompiler_to$jscomp$inline_161_sourceElement$jscomp$1$$.ownerDocument, $JSCompiler_testElement$jscomp$inline_244$$ = $JSCompiler_doc$jscomp$inline_243_JSCompiler_from$jscomp$inline_160_JSCompiler_n$jscomp$inline_163$$.createElement("div"), $JSCompiler_testChild$jscomp$inline_245$$ = $JSCompiler_doc$jscomp$inline_243_JSCompiler_from$jscomp$inline_160_JSCompiler_n$jscomp$inline_163$$.createElement("div");
      $JSCompiler_testElement$jscomp$inline_244$$.appendChild($JSCompiler_testChild$jscomp$inline_245$$);
      $JSCompiler_elements$jscomp$inline_214_JSCompiler_frag$jscomp$inline_162_JSCompiler_inline_result$jscomp$219_JSCompiler_inline_result$jscomp$23_JSCompiler_scopedSelector$jscomp$inline_213_JSCompiler_temp$jscomp$218$$ = $JSCompiler_testElement$jscomp$inline_244$$.querySelector(":scope div") === $JSCompiler_testChild$jscomp$inline_245$$;
    } catch ($JSCompiler_e$jscomp$inline_246$$) {
      $JSCompiler_elements$jscomp$inline_214_JSCompiler_frag$jscomp$inline_162_JSCompiler_inline_result$jscomp$219_JSCompiler_inline_result$jscomp$23_JSCompiler_scopedSelector$jscomp$inline_213_JSCompiler_temp$jscomp$218$$ = !1;
    }
    $JSCompiler_elements$jscomp$inline_214_JSCompiler_frag$jscomp$inline_162_JSCompiler_inline_result$jscomp$219_JSCompiler_inline_result$jscomp$23_JSCompiler_scopedSelector$jscomp$inline_213_JSCompiler_temp$jscomp$218$$ = $scopeSelectorSupported$$module$src$css$$ = $JSCompiler_elements$jscomp$inline_214_JSCompiler_frag$jscomp$inline_162_JSCompiler_inline_result$jscomp$219_JSCompiler_inline_result$jscomp$23_JSCompiler_scopedSelector$jscomp$inline_213_JSCompiler_temp$jscomp$218$$;
  }
  $JSCompiler_elements$jscomp$inline_214_JSCompiler_frag$jscomp$inline_162_JSCompiler_inline_result$jscomp$219_JSCompiler_inline_result$jscomp$23_JSCompiler_scopedSelector$jscomp$inline_213_JSCompiler_temp$jscomp$218$$ ? $JSCompiler_elements$jscomp$inline_214_JSCompiler_frag$jscomp$inline_162_JSCompiler_inline_result$jscomp$219_JSCompiler_inline_result$jscomp$23_JSCompiler_scopedSelector$jscomp$inline_213_JSCompiler_temp$jscomp$218$$ = $JSCompiler_to$jscomp$inline_161_sourceElement$jscomp$1$$.querySelector("> img".replace(/^|,/g, 
  "$&:scope ")) : ($JSCompiler_to$jscomp$inline_161_sourceElement$jscomp$1$$.classList.add("i-amphtml-scoped"), $JSCompiler_elements$jscomp$inline_214_JSCompiler_frag$jscomp$inline_162_JSCompiler_inline_result$jscomp$219_JSCompiler_inline_result$jscomp$23_JSCompiler_scopedSelector$jscomp$inline_213_JSCompiler_temp$jscomp$218$$ = "> img".replace(/^|,/g, "$&.i-amphtml-scoped "), $JSCompiler_elements$jscomp$inline_214_JSCompiler_frag$jscomp$inline_162_JSCompiler_inline_result$jscomp$219_JSCompiler_inline_result$jscomp$23_JSCompiler_scopedSelector$jscomp$inline_213_JSCompiler_temp$jscomp$218$$ = 
  $JSCompiler_to$jscomp$inline_161_sourceElement$jscomp$1$$.querySelectorAll($JSCompiler_elements$jscomp$inline_214_JSCompiler_frag$jscomp$inline_162_JSCompiler_inline_result$jscomp$219_JSCompiler_inline_result$jscomp$23_JSCompiler_scopedSelector$jscomp$inline_213_JSCompiler_temp$jscomp$218$$), $JSCompiler_to$jscomp$inline_161_sourceElement$jscomp$1$$.classList.remove("i-amphtml-scoped"), $JSCompiler_elements$jscomp$inline_214_JSCompiler_frag$jscomp$inline_162_JSCompiler_inline_result$jscomp$219_JSCompiler_inline_result$jscomp$23_JSCompiler_scopedSelector$jscomp$inline_213_JSCompiler_temp$jscomp$218$$ = 
  void 0 === $JSCompiler_elements$jscomp$inline_214_JSCompiler_frag$jscomp$inline_162_JSCompiler_inline_result$jscomp$219_JSCompiler_inline_result$jscomp$23_JSCompiler_scopedSelector$jscomp$inline_213_JSCompiler_temp$jscomp$218$$[0] ? null : $JSCompiler_elements$jscomp$inline_214_JSCompiler_frag$jscomp$inline_162_JSCompiler_inline_result$jscomp$219_JSCompiler_inline_result$jscomp$23_JSCompiler_scopedSelector$jscomp$inline_213_JSCompiler_temp$jscomp$218$$[0]);
  $JSCompiler_StaticMethods_init_$self$$.$sourceImage_$ = $JSCompiler_elements$jscomp$inline_214_JSCompiler_frag$jscomp$inline_162_JSCompiler_inline_result$jscomp$219_JSCompiler_inline_result$jscomp$23_JSCompiler_scopedSelector$jscomp$inline_213_JSCompiler_temp$jscomp$218$$;
  $JSCompiler_StaticMethods_init_$self$$.$imageViewer_$.init($JSCompiler_StaticMethods_init_$self$$.$sourceElement_$, $JSCompiler_StaticMethods_init_$self$$.$sourceImage_$);
  var $caption$$ = null, $figure$$ = $closestAncestorElementBySelector$$module$src$dom$$($JSCompiler_to$jscomp$inline_161_sourceElement$jscomp$1$$);
  $figure$$ && (/^[\w-]+$/.test("figcaption"), $caption$$ = $figure$$.querySelector("figcaption"));
  if (!$caption$$) {
    var $describedBy$$ = $JSCompiler_to$jscomp$inline_161_sourceElement$jscomp$1$$.getAttribute("aria-describedby");
    $caption$$ = $JSCompiler_StaticMethods_init_$self$$.element.ownerDocument.getElementById($describedBy$$);
  }
  if ($caption$$) {
    $JSCompiler_doc$jscomp$inline_243_JSCompiler_from$jscomp$inline_160_JSCompiler_n$jscomp$inline_163$$ = $caption$$;
    $JSCompiler_to$jscomp$inline_161_sourceElement$jscomp$1$$ = $JSCompiler_StaticMethods_init_$self$$.$captionElement_$;
    $JSCompiler_elements$jscomp$inline_214_JSCompiler_frag$jscomp$inline_162_JSCompiler_inline_result$jscomp$219_JSCompiler_inline_result$jscomp$23_JSCompiler_scopedSelector$jscomp$inline_213_JSCompiler_temp$jscomp$218$$ = $JSCompiler_to$jscomp$inline_161_sourceElement$jscomp$1$$.ownerDocument.createDocumentFragment();
    for ($JSCompiler_doc$jscomp$inline_243_JSCompiler_from$jscomp$inline_160_JSCompiler_n$jscomp$inline_163$$ = $JSCompiler_doc$jscomp$inline_243_JSCompiler_from$jscomp$inline_160_JSCompiler_n$jscomp$inline_163$$.firstChild; $JSCompiler_doc$jscomp$inline_243_JSCompiler_from$jscomp$inline_160_JSCompiler_n$jscomp$inline_163$$; $JSCompiler_doc$jscomp$inline_243_JSCompiler_from$jscomp$inline_160_JSCompiler_n$jscomp$inline_163$$ = $JSCompiler_doc$jscomp$inline_243_JSCompiler_from$jscomp$inline_160_JSCompiler_n$jscomp$inline_163$$.nextSibling) {
      $JSCompiler_elements$jscomp$inline_214_JSCompiler_frag$jscomp$inline_162_JSCompiler_inline_result$jscomp$219_JSCompiler_inline_result$jscomp$23_JSCompiler_scopedSelector$jscomp$inline_213_JSCompiler_temp$jscomp$218$$.appendChild($JSCompiler_doc$jscomp$inline_243_JSCompiler_from$jscomp$inline_160_JSCompiler_n$jscomp$inline_163$$.cloneNode(!0));
    }
    $JSCompiler_to$jscomp$inline_161_sourceElement$jscomp$1$$.appendChild($JSCompiler_elements$jscomp$inline_214_JSCompiler_frag$jscomp$inline_162_JSCompiler_inline_result$jscomp$219_JSCompiler_inline_result$jscomp$23_JSCompiler_scopedSelector$jscomp$inline_213_JSCompiler_temp$jscomp$218$$);
    $JSCompiler_StaticMethods_init_$self$$.$imageViewer_$.getImage().setAttribute("aria-describedby", $JSCompiler_StaticMethods_init_$self$$.$captionElement_$.getAttribute("id"));
  }
  $JSCompiler_StaticMethods_init_$self$$.$captionElement_$.classList.toggle("i-amphtml-empty", !$caption$$);
}
function $JSCompiler_StaticMethods_reset_$$($JSCompiler_StaticMethods_reset_$self$$) {
  $JSCompiler_StaticMethods_reset_$self$$.$imageViewer_$.reset();
  for (var $JSCompiler_parent$jscomp$inline_165$$ = $JSCompiler_StaticMethods_reset_$self$$.$captionElement_$; $JSCompiler_parent$jscomp$inline_165$$.firstChild;) {
    $JSCompiler_parent$jscomp$inline_165$$.removeChild($JSCompiler_parent$jscomp$inline_165$$.firstChild);
  }
  $JSCompiler_StaticMethods_reset_$self$$.$sourceElement_$ = null;
  $JSCompiler_StaticMethods_reset_$self$$.$sourceImage_$ = null;
  $JSCompiler_StaticMethods_reset_$self$$.toggleViewMode(!1);
}
function $JSCompiler_StaticMethods_enter_$$($JSCompiler_StaticMethods_enter_$self$$) {
  $JSCompiler_StaticMethods_enter_$self$$.$entering_$ = !0;
  $toggle$$module$src$style$$($JSCompiler_StaticMethods_enter_$self$$.element);
  $setStyles$$module$src$style$$($JSCompiler_StaticMethods_enter_$self$$.element, {opacity:0});
  $JSCompiler_StaticMethods_enter_$self$$.$imageViewer_$.measure();
  var $anim$$ = new $Animation$$module$src$animation$$($JSCompiler_StaticMethods_enter_$self$$.element);
  $anim$$.add(0, $setStyles$$module$src$transition$$($JSCompiler_StaticMethods_enter_$self$$.element, {opacity:$numeric$$module$src$transition$$(0, 1)}), 0.6, $ENTER_CURVE_$$module$extensions$amp_image_lightbox$0_1$amp_image_lightbox$$);
  var $transLayer$$ = null;
  if ($JSCompiler_StaticMethods_enter_$self$$.$sourceImage_$ && $isLoaded$$module$src$event_helper$$($JSCompiler_StaticMethods_enter_$self$$.$sourceImage_$) && $JSCompiler_StaticMethods_enter_$self$$.$sourceImage_$.src) {
    $transLayer$$ = $JSCompiler_StaticMethods_enter_$self$$.element.ownerDocument.createElement("div");
    $transLayer$$.classList.add("i-amphtml-image-lightbox-trans");
    $JSCompiler_StaticMethods_enter_$self$$.getAmpDoc().getBody().appendChild($transLayer$$);
    var $rect$jscomp$3$$ = $layoutRectFromDomRect$$module$src$layout_rect$$($JSCompiler_StaticMethods_enter_$self$$.$sourceImage_$.getBoundingClientRect()), $imageBox$$ = $JSCompiler_StaticMethods_enter_$self$$.$imageViewer_$.getImageBox(), $clone$$ = $JSCompiler_StaticMethods_enter_$self$$.$sourceImage_$.cloneNode(!0);
    $clone$$.className = "";
    $setStyles$$module$src$style$$($clone$$, {position:"absolute", top:$rect$jscomp$3$$.top + "px", left:$rect$jscomp$3$$.left + "px", width:$rect$jscomp$3$$.width + "px", height:$rect$jscomp$3$$.height + "px", transformOrigin:"top left", willChange:"transform"});
    $transLayer$$.appendChild($clone$$);
    $JSCompiler_StaticMethods_enter_$self$$.$sourceImage_$.classList.add("i-amphtml-ghost");
    var $dx$jscomp$9$$ = $imageBox$$.left - $rect$jscomp$3$$.left, $dy$jscomp$9$$ = $imageBox$$.top - $rect$jscomp$3$$.top, $scaleX$$ = 0 != $rect$jscomp$3$$.width ? $imageBox$$.width / $rect$jscomp$3$$.width : 1, $motionTime$$ = $clamp$$module$src$utils$math$$(Math.abs($dy$jscomp$9$$) / 250 * 0.8, 0.2, 0.8);
    $anim$$.add(0, $setStyles$$module$src$transition$$($clone$$, {transform:$concat$$module$src$transition$$([$translate$$module$src$transition$$($numeric$$module$src$transition$$(0, $dx$jscomp$9$$), $numeric$$module$src$transition$$(0, $dy$jscomp$9$$)), $scale$$module$src$transition$$($numeric$$module$src$transition$$(1, $scaleX$$))])}), $motionTime$$, $ENTER_CURVE_$$module$extensions$amp_image_lightbox$0_1$amp_image_lightbox$$);
    $setStyles$$module$src$style$$($JSCompiler_StaticMethods_enter_$self$$.$container_$, {opacity:0});
    $anim$$.add(0.8, $setStyles$$module$src$transition$$($JSCompiler_StaticMethods_enter_$self$$.$container_$, {opacity:$numeric$$module$src$transition$$(0, 1)}), 0.1, $ENTER_CURVE_$$module$extensions$amp_image_lightbox$0_1$amp_image_lightbox$$);
    $anim$$.add(0.9, $setStyles$$module$src$transition$$($transLayer$$, {opacity:$numeric$$module$src$transition$$(1, 0.01)}), 0.1, $EXIT_CURVE_$$module$extensions$amp_image_lightbox$0_1$amp_image_lightbox$$);
  }
  $anim$$.start(500).thenAlways(function() {
    $JSCompiler_StaticMethods_enter_$self$$.$entering_$ = !1;
    $setStyles$$module$src$style$$($JSCompiler_StaticMethods_enter_$self$$.element, {opacity:""});
    $setStyles$$module$src$style$$($JSCompiler_StaticMethods_enter_$self$$.$container_$, {opacity:""});
    $transLayer$$ && $JSCompiler_StaticMethods_enter_$self$$.getAmpDoc().getBody().removeChild($transLayer$$);
  });
}
function $JSCompiler_StaticMethods_exit_$$($JSCompiler_StaticMethods_exit_$self$$) {
  var $dy$jscomp$10_image$jscomp$3$$ = $JSCompiler_StaticMethods_exit_$self$$.$imageViewer_$.getImage(), $imageBox$jscomp$1_motionTime$jscomp$1$$ = $JSCompiler_StaticMethods_exit_$self$$.$imageViewer_$.getImageBoxWithOffset(), $anim$jscomp$1$$ = new $Animation$$module$src$animation$$($JSCompiler_StaticMethods_exit_$self$$.element), $dur$jscomp$2$$ = 500;
  $anim$jscomp$1$$.add(0, $setStyles$$module$src$transition$$($JSCompiler_StaticMethods_exit_$self$$.element, {opacity:$numeric$$module$src$transition$$(1, 0)}), 0.9, $EXIT_CURVE_$$module$extensions$amp_image_lightbox$0_1$amp_image_lightbox$$);
  var $transLayer$jscomp$1$$ = null;
  if ($isLoaded$$module$src$event_helper$$($dy$jscomp$10_image$jscomp$3$$) && $dy$jscomp$10_image$jscomp$3$$.src && $JSCompiler_StaticMethods_exit_$self$$.$sourceImage_$) {
    $transLayer$jscomp$1$$ = $JSCompiler_StaticMethods_exit_$self$$.element.ownerDocument.createElement("div");
    $transLayer$jscomp$1$$.classList.add("i-amphtml-image-lightbox-trans");
    $JSCompiler_StaticMethods_exit_$self$$.getAmpDoc().getBody().appendChild($transLayer$jscomp$1$$);
    var $rect$jscomp$4$$ = $layoutRectFromDomRect$$module$src$layout_rect$$($JSCompiler_StaticMethods_exit_$self$$.$sourceImage_$.getBoundingClientRect()), $clone$jscomp$1$$ = $dy$jscomp$10_image$jscomp$3$$.cloneNode(!0);
    $setStyles$$module$src$style$$($clone$jscomp$1$$, {position:"absolute", top:$imageBox$jscomp$1_motionTime$jscomp$1$$.top + "px", left:$imageBox$jscomp$1_motionTime$jscomp$1$$.left + "px", width:$imageBox$jscomp$1_motionTime$jscomp$1$$.width + "px", height:$imageBox$jscomp$1_motionTime$jscomp$1$$.height + "px", transform:"", transformOrigin:"top left", willChange:"transform"});
    $transLayer$jscomp$1$$.appendChild($clone$jscomp$1$$);
    $anim$jscomp$1$$.add(0, $setStyles$$module$src$transition$$($JSCompiler_StaticMethods_exit_$self$$.$container_$, {opacity:$numeric$$module$src$transition$$(1, 0)}), 0.1, $EXIT_CURVE_$$module$extensions$amp_image_lightbox$0_1$amp_image_lightbox$$);
    $dy$jscomp$10_image$jscomp$3$$ = $rect$jscomp$4$$.top - $imageBox$jscomp$1_motionTime$jscomp$1$$.top;
    var $scaleX$jscomp$1$$ = 0 != $imageBox$jscomp$1_motionTime$jscomp$1$$.width ? $rect$jscomp$4$$.width / $imageBox$jscomp$1_motionTime$jscomp$1$$.width : 1, $moveAndScale$$ = $setStyles$$module$src$transition$$($clone$jscomp$1$$, {transform:$concat$$module$src$transition$$([$translate$$module$src$transition$$($numeric$$module$src$transition$$(0, $rect$jscomp$4$$.left - $imageBox$jscomp$1_motionTime$jscomp$1$$.left), $numeric$$module$src$transition$$(0, $dy$jscomp$10_image$jscomp$3$$)), $scale$$module$src$transition$$($numeric$$module$src$transition$$(1, 
    $scaleX$jscomp$1$$))])});
    $imageBox$jscomp$1_motionTime$jscomp$1$$ = $clamp$$module$src$utils$math$$(Math.abs($dy$jscomp$10_image$jscomp$3$$) / 250 * 0.8, 0.2, 0.8);
    $anim$jscomp$1$$.add(Math.min(0.8 - $imageBox$jscomp$1_motionTime$jscomp$1$$, 0.2), function($dy$jscomp$10_image$jscomp$3$$, $imageBox$jscomp$1_motionTime$jscomp$1$$) {
      $moveAndScale$$($dy$jscomp$10_image$jscomp$3$$);
      $imageBox$jscomp$1_motionTime$jscomp$1$$ && $JSCompiler_StaticMethods_exit_$self$$.$sourceImage_$.classList.remove("i-amphtml-ghost");
    }, $imageBox$jscomp$1_motionTime$jscomp$1$$, $EXIT_CURVE_$$module$extensions$amp_image_lightbox$0_1$amp_image_lightbox$$);
    $anim$jscomp$1$$.add(0.8, $setStyles$$module$src$transition$$($transLayer$jscomp$1$$, {opacity:$numeric$$module$src$transition$$(1, 0.01)}), 0.2, $EXIT_CURVE_$$module$extensions$amp_image_lightbox$0_1$amp_image_lightbox$$);
    $dur$jscomp$2$$ = $clamp$$module$src$utils$math$$(Math.abs($dy$jscomp$10_image$jscomp$3$$) / 250 * $dur$jscomp$2$$, 300, $dur$jscomp$2$$);
  }
  $anim$jscomp$1$$.start($dur$jscomp$2$$).thenAlways(function() {
    $JSCompiler_StaticMethods_exit_$self$$.$sourceImage_$ && $JSCompiler_StaticMethods_exit_$self$$.$sourceImage_$.classList.remove("i-amphtml-ghost");
    $JSCompiler_StaticMethods_exit_$self$$.collapse();
    $setStyles$$module$src$style$$($JSCompiler_StaticMethods_exit_$self$$.element, {opacity:""});
    $setStyles$$module$src$style$$($JSCompiler_StaticMethods_exit_$self$$.$container_$, {opacity:""});
    $transLayer$jscomp$1$$ && $JSCompiler_StaticMethods_exit_$self$$.getAmpDoc().getBody().removeChild($transLayer$jscomp$1$$);
    $JSCompiler_StaticMethods_reset_$$($JSCompiler_StaticMethods_exit_$self$$);
  });
}
(function($AMP$jscomp$1$$) {
  $AMP$jscomp$1$$.registerElement("amp-image-lightbox", $AmpImageLightbox$$module$extensions$amp_image_lightbox$0_1$amp_image_lightbox$$, "amp-image-lightbox{position:fixed!important;top:0!important;left:0!important;bottom:0!important;right:0!important;margin:0!important;padding:0!important;overflow:hidden!important;transform:translateZ(0)!important;-ms-touch-action:none!important;touch-action:none!important;z-index:1000;background:rgba(0,0,0,0.95);color:#f2f2f2}.i-amphtml-image-lightbox-container{position:absolute;z-index:0;top:0;left:0;right:0;bottom:0;overflow:hidden;transform:translateZ(0)}.i-amphtml-image-lightbox-trans{pointer-events:none!important;position:fixed;z-index:1001;top:0;left:0;bottom:0;right:0}.i-amphtml-image-lightbox-caption{position:absolute!important;z-index:2;bottom:0!important;left:0!important;right:0!important}.i-amphtml-image-lightbox-caption.i-amphtml-empty,.i-amphtml-image-lightbox-view-mode .i-amphtml-image-lightbox-caption{visibility:hidden}.amp-image-lightbox-caption{background:rgba(0,0,0,0.5);max-height:25%;padding:8px}.i-amphtml-image-lightbox-viewer{position:absolute;z-index:1;top:0;left:0;right:0;bottom:0;overflow:hidden;transform:translateZ(0)}.i-amphtml-image-lightbox-viewer-image{position:absolute;z-index:1;display:block;transform-origin:50% 50%}\n/*# sourceURL=/extensions/amp-image-lightbox/0.1/amp-image-lightbox.css*/");
})(self.AMP);

})});

//# sourceMappingURL=amp-image-lightbox-0.1.js.map
