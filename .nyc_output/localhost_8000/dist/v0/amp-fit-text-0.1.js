(self.AMP=self.AMP||[]).push({n:"amp-fit-text",v:"2007210308000",f:(function(AMP,_){
var $$jscomp$objectCreate$$ = "function" == typeof Object.create ? Object.create : function($prototype$$) {
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
var $JSCompiler_temp$jscomp$10$$;
if ("function" == typeof Object.setPrototypeOf) {
  $JSCompiler_temp$jscomp$10$$ = Object.setPrototypeOf;
} else {
  var $JSCompiler_inline_result$jscomp$11$$;
  a: {
    var $JSCompiler_x$jscomp$inline_15$$ = {a:!0}, $JSCompiler_y$jscomp$inline_16$$ = {};
    try {
      $JSCompiler_y$jscomp$inline_16$$.__proto__ = $JSCompiler_x$jscomp$inline_15$$;
      $JSCompiler_inline_result$jscomp$11$$ = $JSCompiler_y$jscomp$inline_16$$.a;
      break a;
    } catch ($JSCompiler_e$jscomp$inline_17$$) {
    }
    $JSCompiler_inline_result$jscomp$11$$ = !1;
  }
  $JSCompiler_temp$jscomp$10$$ = $JSCompiler_inline_result$jscomp$11$$ ? function($target$jscomp$95$$, $proto$jscomp$3$$) {
    $target$jscomp$95$$.__proto__ = $proto$jscomp$3$$;
    if ($target$jscomp$95$$.__proto__ !== $proto$jscomp$3$$) {
      throw new TypeError($target$jscomp$95$$ + " is not extensible");
    }
    return $target$jscomp$95$$;
  } : null;
}
var $$jscomp$setPrototypeOf$$ = $JSCompiler_temp$jscomp$10$$;
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
var $propertyNameCache$$module$src$style$$, $vendorPrefixes$$module$src$style$$ = "Webkit webkit Moz moz ms O o".split(" ");
function $setStyle$$module$src$style$$($element$jscomp$15$$, $JSCompiler_inline_result$jscomp$13_property$jscomp$7_propertyName$jscomp$10$$, $value$jscomp$93$$) {
  var $JSCompiler_style$jscomp$inline_19$$ = $element$jscomp$15$$.style;
  if (2 > $JSCompiler_inline_result$jscomp$13_property$jscomp$7_propertyName$jscomp$10$$.length || 0 != $JSCompiler_inline_result$jscomp$13_property$jscomp$7_propertyName$jscomp$10$$.lastIndexOf("--", 0)) {
    $propertyNameCache$$module$src$style$$ || ($propertyNameCache$$module$src$style$$ = Object.create(null));
    var $JSCompiler_propertyName$jscomp$inline_22$$ = $propertyNameCache$$module$src$style$$[$JSCompiler_inline_result$jscomp$13_property$jscomp$7_propertyName$jscomp$10$$];
    if (!$JSCompiler_propertyName$jscomp$inline_22$$) {
      $JSCompiler_propertyName$jscomp$inline_22$$ = $JSCompiler_inline_result$jscomp$13_property$jscomp$7_propertyName$jscomp$10$$;
      if (void 0 === $JSCompiler_style$jscomp$inline_19$$[$JSCompiler_inline_result$jscomp$13_property$jscomp$7_propertyName$jscomp$10$$]) {
        var $JSCompiler_inline_result$jscomp$54_JSCompiler_inline_result$jscomp$55_JSCompiler_prefixedPropertyName$jscomp$inline_24$$ = $JSCompiler_inline_result$jscomp$13_property$jscomp$7_propertyName$jscomp$10$$.charAt(0).toUpperCase() + $JSCompiler_inline_result$jscomp$13_property$jscomp$7_propertyName$jscomp$10$$.slice(1);
        b: {
          for (var $JSCompiler_i$jscomp$inline_62$$ = 0; $JSCompiler_i$jscomp$inline_62$$ < $vendorPrefixes$$module$src$style$$.length; $JSCompiler_i$jscomp$inline_62$$++) {
            var $JSCompiler_propertyName$jscomp$inline_63$$ = $vendorPrefixes$$module$src$style$$[$JSCompiler_i$jscomp$inline_62$$] + $JSCompiler_inline_result$jscomp$54_JSCompiler_inline_result$jscomp$55_JSCompiler_prefixedPropertyName$jscomp$inline_24$$;
            if (void 0 !== $JSCompiler_style$jscomp$inline_19$$[$JSCompiler_propertyName$jscomp$inline_63$$]) {
              $JSCompiler_inline_result$jscomp$54_JSCompiler_inline_result$jscomp$55_JSCompiler_prefixedPropertyName$jscomp$inline_24$$ = $JSCompiler_propertyName$jscomp$inline_63$$;
              break b;
            }
          }
          $JSCompiler_inline_result$jscomp$54_JSCompiler_inline_result$jscomp$55_JSCompiler_prefixedPropertyName$jscomp$inline_24$$ = "";
        }
        void 0 !== $JSCompiler_style$jscomp$inline_19$$[$JSCompiler_inline_result$jscomp$54_JSCompiler_inline_result$jscomp$55_JSCompiler_prefixedPropertyName$jscomp$inline_24$$] && ($JSCompiler_propertyName$jscomp$inline_22$$ = $JSCompiler_inline_result$jscomp$54_JSCompiler_inline_result$jscomp$55_JSCompiler_prefixedPropertyName$jscomp$inline_24$$);
      }
      $propertyNameCache$$module$src$style$$[$JSCompiler_inline_result$jscomp$13_property$jscomp$7_propertyName$jscomp$10$$] = $JSCompiler_propertyName$jscomp$inline_22$$;
    }
    $JSCompiler_inline_result$jscomp$13_property$jscomp$7_propertyName$jscomp$10$$ = $JSCompiler_propertyName$jscomp$inline_22$$;
  }
  $JSCompiler_inline_result$jscomp$13_property$jscomp$7_propertyName$jscomp$10$$ && ((2 > $JSCompiler_inline_result$jscomp$13_property$jscomp$7_propertyName$jscomp$10$$.length ? 0 : 0 == $JSCompiler_inline_result$jscomp$13_property$jscomp$7_propertyName$jscomp$10$$.lastIndexOf("--", 0)) ? $element$jscomp$15$$.style.setProperty($JSCompiler_inline_result$jscomp$13_property$jscomp$7_propertyName$jscomp$10$$, $value$jscomp$93$$) : $element$jscomp$15$$.style[$JSCompiler_inline_result$jscomp$13_property$jscomp$7_propertyName$jscomp$10$$] = 
  $value$jscomp$93$$);
}
function $setStyles$$module$src$style$$($element$jscomp$17$$, $styles$jscomp$1$$) {
  for (var $k$jscomp$3$$ in $styles$jscomp$1$$) {
    $setStyle$$module$src$style$$($element$jscomp$17$$, $k$jscomp$3$$, $styles$jscomp$1$$[$k$jscomp$3$$]);
  }
}
;function $getLengthNumeral$$module$src$layout$$($length$jscomp$20$$) {
  var $res$$ = parseFloat($length$jscomp$20$$);
  return "number" === typeof $res$$ && isFinite($res$$) ? $res$$ : void 0;
}
;function $AmpFitText$$module$extensions$amp_fit_text$0_1$amp_fit_text$$($$jscomp$super$this_element$jscomp$23$$) {
  $$jscomp$super$this_element$jscomp$23$$ = AMP.BaseElement.call(this, $$jscomp$super$this_element$jscomp$23$$) || this;
  $$jscomp$super$this_element$jscomp$23$$.$content_$ = null;
  $$jscomp$super$this_element$jscomp$23$$.$contentWrapper_$ = null;
  $$jscomp$super$this_element$jscomp$23$$.$measurer_$ = null;
  $$jscomp$super$this_element$jscomp$23$$.$minFontSize_$ = -1;
  $$jscomp$super$this_element$jscomp$23$$.$maxFontSize_$ = -1;
  $$jscomp$super$this_element$jscomp$23$$.$textContent_$ = "";
  return $$jscomp$super$this_element$jscomp$23$$;
}
var $JSCompiler_parentCtor$jscomp$inline_29$$ = AMP.BaseElement;
$AmpFitText$$module$extensions$amp_fit_text$0_1$amp_fit_text$$.prototype = $$jscomp$objectCreate$$($JSCompiler_parentCtor$jscomp$inline_29$$.prototype);
$AmpFitText$$module$extensions$amp_fit_text$0_1$amp_fit_text$$.prototype.constructor = $AmpFitText$$module$extensions$amp_fit_text$0_1$amp_fit_text$$;
if ($$jscomp$setPrototypeOf$$) {
  $$jscomp$setPrototypeOf$$($AmpFitText$$module$extensions$amp_fit_text$0_1$amp_fit_text$$, $JSCompiler_parentCtor$jscomp$inline_29$$);
} else {
  for (var $JSCompiler_p$jscomp$inline_30$$ in $JSCompiler_parentCtor$jscomp$inline_29$$) {
    if ("prototype" != $JSCompiler_p$jscomp$inline_30$$) {
      if (Object.defineProperties) {
        var $JSCompiler_descriptor$jscomp$inline_31$$ = Object.getOwnPropertyDescriptor($JSCompiler_parentCtor$jscomp$inline_29$$, $JSCompiler_p$jscomp$inline_30$$);
        $JSCompiler_descriptor$jscomp$inline_31$$ && Object.defineProperty($AmpFitText$$module$extensions$amp_fit_text$0_1$amp_fit_text$$, $JSCompiler_p$jscomp$inline_30$$, $JSCompiler_descriptor$jscomp$inline_31$$);
      } else {
        $AmpFitText$$module$extensions$amp_fit_text$0_1$amp_fit_text$$[$JSCompiler_p$jscomp$inline_30$$] = $JSCompiler_parentCtor$jscomp$inline_29$$[$JSCompiler_p$jscomp$inline_30$$];
      }
    }
  }
}
$AmpFitText$$module$extensions$amp_fit_text$0_1$amp_fit_text$$.$superClass_$ = $JSCompiler_parentCtor$jscomp$inline_29$$.prototype;
$AmpFitText$$module$extensions$amp_fit_text$0_1$amp_fit_text$$.prototype.isLayoutSupported = function($layout$jscomp$4$$) {
  return "fixed" == $layout$jscomp$4$$ || "fixed-height" == $layout$jscomp$4$$ || "responsive" == $layout$jscomp$4$$ || "fill" == $layout$jscomp$4$$ || "flex-item" == $layout$jscomp$4$$ || "fluid" == $layout$jscomp$4$$ || "intrinsic" == $layout$jscomp$4$$;
};
$AmpFitText$$module$extensions$amp_fit_text$0_1$amp_fit_text$$.prototype.buildCallback = function() {
  var $$jscomp$this$jscomp$1$$ = this;
  this.$content_$ = this.element.ownerDocument.createElement("div");
  this.applyFillContent(this.$content_$);
  this.$content_$.classList.add("i-amphtml-fit-text-content");
  $setStyles$$module$src$style$$(this.$content_$, {zIndex:2});
  this.$contentWrapper_$ = this.element.ownerDocument.createElement("div");
  $setStyles$$module$src$style$$(this.$contentWrapper_$, {lineHeight:"1.15em"});
  this.$content_$.appendChild(this.$contentWrapper_$);
  this.$measurer_$ = this.element.ownerDocument.createElement("div");
  $setStyles$$module$src$style$$(this.$measurer_$, {position:"absolute", top:0, left:0, zIndex:1, visibility:"hidden", lineHeight:"1.15em"});
  this.getRealChildNodes().forEach(function($node$jscomp$5$$) {
    $$jscomp$this$jscomp$1$$.$contentWrapper_$.appendChild($node$jscomp$5$$);
  });
  this.$measurer_$.innerHTML = this.$contentWrapper_$.innerHTML;
  this.element.appendChild(this.$content_$);
  this.element.appendChild(this.$measurer_$);
  this.$minFontSize_$ = $getLengthNumeral$$module$src$layout$$(this.element.getAttribute("min-font-size")) || 6;
  this.$maxFontSize_$ = $getLengthNumeral$$module$src$layout$$(this.element.getAttribute("max-font-size")) || 72;
  Object.defineProperty(this.element, "textContent", {set:function($v$$) {
    $$jscomp$this$jscomp$1$$.$textContent_$ = $v$$;
    $$jscomp$this$jscomp$1$$.mutateElement(function() {
      $$jscomp$this$jscomp$1$$.$contentWrapper_$.textContent = $v$$;
      $$jscomp$this$jscomp$1$$.$measurer_$.innerHTML = $$jscomp$this$jscomp$1$$.$contentWrapper_$.innerHTML;
      $JSCompiler_StaticMethods_updateFontSize_$$($$jscomp$this$jscomp$1$$);
    });
  }, get:function() {
    return $$jscomp$this$jscomp$1$$.$textContent_$ || $$jscomp$this$jscomp$1$$.$contentWrapper_$.textContent;
  }});
};
$AmpFitText$$module$extensions$amp_fit_text$0_1$amp_fit_text$$.prototype.prerenderAllowed = function() {
  return !0;
};
$AmpFitText$$module$extensions$amp_fit_text$0_1$amp_fit_text$$.prototype.isRelayoutNeeded = function() {
  return !0;
};
$AmpFitText$$module$extensions$amp_fit_text$0_1$amp_fit_text$$.prototype.layoutCallback = function() {
  var $$jscomp$this$jscomp$2$$ = this;
  return this.mutateElement(function() {
    $JSCompiler_StaticMethods_updateFontSize_$$($$jscomp$this$jscomp$2$$);
  });
};
function $JSCompiler_StaticMethods_updateFontSize_$$($JSCompiler_StaticMethods_updateFontSize_$self_JSCompiler_measurer$jscomp$inline_46_JSCompiler_overflown$jscomp$inline_49$$) {
  var $maxHeight$$ = $JSCompiler_StaticMethods_updateFontSize_$self_JSCompiler_measurer$jscomp$inline_46_JSCompiler_overflown$jscomp$inline_49$$.$content_$.offsetHeight, $JSCompiler_content$jscomp$inline_45_JSCompiler_measurer$jscomp$inline_37$$ = $JSCompiler_StaticMethods_updateFontSize_$self_JSCompiler_measurer$jscomp$inline_46_JSCompiler_overflown$jscomp$inline_49$$.$measurer_$;
  var $JSCompiler_expectedWidth$jscomp$inline_39_JSCompiler_inline_result$jscomp$14_JSCompiler_lineHeight$jscomp$inline_50$$ = $JSCompiler_StaticMethods_updateFontSize_$self_JSCompiler_measurer$jscomp$inline_46_JSCompiler_overflown$jscomp$inline_49$$.$content_$.offsetWidth;
  var $JSCompiler_minFontSize$jscomp$inline_40_JSCompiler_numberOfLines$jscomp$inline_51$$ = $JSCompiler_StaticMethods_updateFontSize_$self_JSCompiler_measurer$jscomp$inline_46_JSCompiler_overflown$jscomp$inline_49$$.$minFontSize_$, $JSCompiler_maxFontSize$jscomp$inline_41$$ = $JSCompiler_StaticMethods_updateFontSize_$self_JSCompiler_measurer$jscomp$inline_46_JSCompiler_overflown$jscomp$inline_49$$.$maxFontSize_$;
  for ($JSCompiler_maxFontSize$jscomp$inline_41$$++; 1 < $JSCompiler_maxFontSize$jscomp$inline_41$$ - $JSCompiler_minFontSize$jscomp$inline_40_JSCompiler_numberOfLines$jscomp$inline_51$$;) {
    var $JSCompiler_mid$jscomp$inline_42$$ = Math.floor(($JSCompiler_minFontSize$jscomp$inline_40_JSCompiler_numberOfLines$jscomp$inline_51$$ + $JSCompiler_maxFontSize$jscomp$inline_41$$) / 2);
    $setStyle$$module$src$style$$($JSCompiler_content$jscomp$inline_45_JSCompiler_measurer$jscomp$inline_37$$, "fontSize", $JSCompiler_mid$jscomp$inline_42$$ + "px");
    var $JSCompiler_width$jscomp$inline_43$$ = $JSCompiler_content$jscomp$inline_45_JSCompiler_measurer$jscomp$inline_37$$.offsetWidth;
    $JSCompiler_content$jscomp$inline_45_JSCompiler_measurer$jscomp$inline_37$$.offsetHeight > $maxHeight$$ || $JSCompiler_width$jscomp$inline_43$$ > $JSCompiler_expectedWidth$jscomp$inline_39_JSCompiler_inline_result$jscomp$14_JSCompiler_lineHeight$jscomp$inline_50$$ ? $JSCompiler_maxFontSize$jscomp$inline_41$$ = $JSCompiler_mid$jscomp$inline_42$$ : $JSCompiler_minFontSize$jscomp$inline_40_JSCompiler_numberOfLines$jscomp$inline_51$$ = $JSCompiler_mid$jscomp$inline_42$$;
  }
  $JSCompiler_expectedWidth$jscomp$inline_39_JSCompiler_inline_result$jscomp$14_JSCompiler_lineHeight$jscomp$inline_50$$ = $JSCompiler_minFontSize$jscomp$inline_40_JSCompiler_numberOfLines$jscomp$inline_51$$;
  $setStyle$$module$src$style$$($JSCompiler_StaticMethods_updateFontSize_$self_JSCompiler_measurer$jscomp$inline_46_JSCompiler_overflown$jscomp$inline_49$$.$contentWrapper_$, "fontSize", $JSCompiler_expectedWidth$jscomp$inline_39_JSCompiler_inline_result$jscomp$14_JSCompiler_lineHeight$jscomp$inline_50$$ + "px");
  $JSCompiler_content$jscomp$inline_45_JSCompiler_measurer$jscomp$inline_37$$ = $JSCompiler_StaticMethods_updateFontSize_$self_JSCompiler_measurer$jscomp$inline_46_JSCompiler_overflown$jscomp$inline_49$$.$contentWrapper_$;
  $JSCompiler_StaticMethods_updateFontSize_$self_JSCompiler_measurer$jscomp$inline_46_JSCompiler_overflown$jscomp$inline_49$$ = $JSCompiler_StaticMethods_updateFontSize_$self_JSCompiler_measurer$jscomp$inline_46_JSCompiler_overflown$jscomp$inline_49$$.$measurer_$;
  $setStyle$$module$src$style$$($JSCompiler_StaticMethods_updateFontSize_$self_JSCompiler_measurer$jscomp$inline_46_JSCompiler_overflown$jscomp$inline_49$$, "fontSize", $JSCompiler_expectedWidth$jscomp$inline_39_JSCompiler_inline_result$jscomp$14_JSCompiler_lineHeight$jscomp$inline_50$$ + "px");
  $JSCompiler_StaticMethods_updateFontSize_$self_JSCompiler_measurer$jscomp$inline_46_JSCompiler_overflown$jscomp$inline_49$$ = $JSCompiler_StaticMethods_updateFontSize_$self_JSCompiler_measurer$jscomp$inline_46_JSCompiler_overflown$jscomp$inline_49$$.offsetHeight > $maxHeight$$;
  $JSCompiler_expectedWidth$jscomp$inline_39_JSCompiler_inline_result$jscomp$14_JSCompiler_lineHeight$jscomp$inline_50$$ *= 1.15;
  $JSCompiler_minFontSize$jscomp$inline_40_JSCompiler_numberOfLines$jscomp$inline_51$$ = Math.floor($maxHeight$$ / $JSCompiler_expectedWidth$jscomp$inline_39_JSCompiler_inline_result$jscomp$14_JSCompiler_lineHeight$jscomp$inline_50$$);
  $JSCompiler_content$jscomp$inline_45_JSCompiler_measurer$jscomp$inline_37$$.classList.toggle("i-amphtml-fit-text-content-overflown", $JSCompiler_StaticMethods_updateFontSize_$self_JSCompiler_measurer$jscomp$inline_46_JSCompiler_overflown$jscomp$inline_49$$);
  $setStyles$$module$src$style$$($JSCompiler_content$jscomp$inline_45_JSCompiler_measurer$jscomp$inline_37$$, {lineClamp:$JSCompiler_StaticMethods_updateFontSize_$self_JSCompiler_measurer$jscomp$inline_46_JSCompiler_overflown$jscomp$inline_49$$ ? $JSCompiler_minFontSize$jscomp$inline_40_JSCompiler_numberOfLines$jscomp$inline_51$$ : "", maxHeight:$JSCompiler_StaticMethods_updateFontSize_$self_JSCompiler_measurer$jscomp$inline_46_JSCompiler_overflown$jscomp$inline_49$$ ? $JSCompiler_expectedWidth$jscomp$inline_39_JSCompiler_inline_result$jscomp$14_JSCompiler_lineHeight$jscomp$inline_50$$ * 
  $JSCompiler_minFontSize$jscomp$inline_40_JSCompiler_numberOfLines$jscomp$inline_51$$ + "px" : ""});
}
(function($AMP$jscomp$1$$) {
  $AMP$jscomp$1$$.registerElement("amp-fit-text", $AmpFitText$$module$extensions$amp_fit_text$0_1$amp_fit_text$$, ".i-amphtml-fit-text-content,.i-amphtml-fit-text-content.i-amphtml-fill-content{display:block;display:-ms-flexbox;display:flex;-ms-flex-direction:column;flex-direction:column;-ms-flex-wrap:nowrap;flex-wrap:nowrap;-ms-flex-pack:center;justify-content:center}.i-amphtml-fit-text-content-overflown{display:block;display:-webkit-box;-webkit-box-orient:vertical;overflow:hidden}\n/*# sourceURL=/extensions/amp-fit-text/0.1/amp-fit-text.css*/");
})(self.AMP);

})});

//# sourceMappingURL=amp-fit-text-0.1.js.map
