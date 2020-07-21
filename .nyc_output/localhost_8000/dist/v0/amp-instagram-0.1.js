(self.AMP=self.AMP||[]).push({n:"amp-instagram",v:"2007210308000",f:(function(AMP,_){
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
    var $JSCompiler_x$jscomp$inline_24$$ = {a:!0}, $JSCompiler_y$jscomp$inline_25$$ = {};
    try {
      $JSCompiler_y$jscomp$inline_25$$.__proto__ = $JSCompiler_x$jscomp$inline_24$$;
      $JSCompiler_inline_result$jscomp$20$$ = $JSCompiler_y$jscomp$inline_25$$.a;
      break a;
    } catch ($JSCompiler_e$jscomp$inline_26$$) {
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
var $toString_$$module$src$types$$ = Object.prototype.toString;
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
function $startsWith$$module$src$string$$($string$jscomp$6$$, $prefix$jscomp$4$$) {
  return $prefix$jscomp$4$$.length > $string$jscomp$6$$.length ? !1 : 0 == $string$jscomp$6$$.lastIndexOf($prefix$jscomp$4$$, 0);
}
;(function($opt_initial$jscomp$1$$) {
  return $opt_initial$jscomp$1$$ || {};
})({c:!0, v:!0, a:!0, ad:!0, action:!0});
function $getService$$module$src$service$$($JSCompiler_holder$jscomp$inline_65_JSCompiler_s$jscomp$inline_71_win$jscomp$25$$) {
  $JSCompiler_holder$jscomp$inline_65_JSCompiler_s$jscomp$inline_71_win$jscomp$25$$ = $JSCompiler_holder$jscomp$inline_65_JSCompiler_s$jscomp$inline_71_win$jscomp$25$$.__AMP_TOP || ($JSCompiler_holder$jscomp$inline_65_JSCompiler_s$jscomp$inline_71_win$jscomp$25$$.__AMP_TOP = $JSCompiler_holder$jscomp$inline_65_JSCompiler_s$jscomp$inline_71_win$jscomp$25$$);
  var $JSCompiler_services$jscomp$inline_70$$ = $JSCompiler_holder$jscomp$inline_65_JSCompiler_s$jscomp$inline_71_win$jscomp$25$$.__AMP_SERVICES;
  $JSCompiler_services$jscomp$inline_70$$ || ($JSCompiler_services$jscomp$inline_70$$ = $JSCompiler_holder$jscomp$inline_65_JSCompiler_s$jscomp$inline_71_win$jscomp$25$$.__AMP_SERVICES = {});
  $JSCompiler_holder$jscomp$inline_65_JSCompiler_s$jscomp$inline_71_win$jscomp$25$$ = $JSCompiler_services$jscomp$inline_70$$.preconnect;
  $JSCompiler_holder$jscomp$inline_65_JSCompiler_s$jscomp$inline_71_win$jscomp$25$$.obj || ($JSCompiler_holder$jscomp$inline_65_JSCompiler_s$jscomp$inline_71_win$jscomp$25$$.obj = new $JSCompiler_holder$jscomp$inline_65_JSCompiler_s$jscomp$inline_71_win$jscomp$25$$.ctor($JSCompiler_holder$jscomp$inline_65_JSCompiler_s$jscomp$inline_71_win$jscomp$25$$.context), $JSCompiler_holder$jscomp$inline_65_JSCompiler_s$jscomp$inline_71_win$jscomp$25$$.ctor = null, $JSCompiler_holder$jscomp$inline_65_JSCompiler_s$jscomp$inline_71_win$jscomp$25$$.context = 
  null, $JSCompiler_holder$jscomp$inline_65_JSCompiler_s$jscomp$inline_71_win$jscomp$25$$.resolve && $JSCompiler_holder$jscomp$inline_65_JSCompiler_s$jscomp$inline_71_win$jscomp$25$$.resolve($JSCompiler_holder$jscomp$inline_65_JSCompiler_s$jscomp$inline_71_win$jscomp$25$$.obj));
  return $JSCompiler_holder$jscomp$inline_65_JSCompiler_s$jscomp$inline_71_win$jscomp$25$$.obj;
}
;/*
 https://mths.be/cssescape v1.5.1 by @mathias | MIT license */
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
;function $listen$$module$src$event_helper$$($element$jscomp$63$$, $listener$jscomp$65$$) {
  return $internalListenImplementation$$module$src$event_helper_listen$$($element$jscomp$63$$, $listener$jscomp$65$$);
}
;var $propertyNameCache$$module$src$style$$, $vendorPrefixes$$module$src$style$$ = "Webkit webkit Moz moz ms O o".split(" ");
function $setStyles$$module$src$style$$($element$jscomp$70$$, $styles$jscomp$1$$) {
  for (var $k$jscomp$4$$ in $styles$jscomp$1$$) {
    var $JSCompiler_element$jscomp$inline_35$$ = $element$jscomp$70$$, $JSCompiler_styleValue$jscomp$inline_41_JSCompiler_value$jscomp$inline_37$$ = $styles$jscomp$1$$[$k$jscomp$4$$];
    var $JSCompiler_propertyName$jscomp$inline_40_JSCompiler_style$jscomp$inline_73$$ = $JSCompiler_element$jscomp$inline_35$$.style;
    var $JSCompiler_camelCase$jscomp$inline_74$$ = $k$jscomp$4$$;
    if ($startsWith$$module$src$string$$($JSCompiler_camelCase$jscomp$inline_74$$, "--")) {
      $JSCompiler_propertyName$jscomp$inline_40_JSCompiler_style$jscomp$inline_73$$ = $JSCompiler_camelCase$jscomp$inline_74$$;
    } else {
      $propertyNameCache$$module$src$style$$ || ($propertyNameCache$$module$src$style$$ = Object.create(null));
      var $JSCompiler_propertyName$jscomp$inline_76$$ = $propertyNameCache$$module$src$style$$[$JSCompiler_camelCase$jscomp$inline_74$$];
      if (!$JSCompiler_propertyName$jscomp$inline_76$$) {
        $JSCompiler_propertyName$jscomp$inline_76$$ = $JSCompiler_camelCase$jscomp$inline_74$$;
        if (void 0 === $JSCompiler_propertyName$jscomp$inline_40_JSCompiler_style$jscomp$inline_73$$[$JSCompiler_camelCase$jscomp$inline_74$$]) {
          var $JSCompiler_camelCase$jscomp$inline_85_JSCompiler_prefixedPropertyName$jscomp$inline_78_JSCompiler_titleCase$jscomp$inline_77$$ = $JSCompiler_camelCase$jscomp$inline_74$$;
          $JSCompiler_camelCase$jscomp$inline_85_JSCompiler_prefixedPropertyName$jscomp$inline_78_JSCompiler_titleCase$jscomp$inline_77$$ = $JSCompiler_camelCase$jscomp$inline_85_JSCompiler_prefixedPropertyName$jscomp$inline_78_JSCompiler_titleCase$jscomp$inline_77$$.charAt(0).toUpperCase() + $JSCompiler_camelCase$jscomp$inline_85_JSCompiler_prefixedPropertyName$jscomp$inline_78_JSCompiler_titleCase$jscomp$inline_77$$.slice(1);
          b: {
            for (var $JSCompiler_i$jscomp$inline_89$$ = 0; $JSCompiler_i$jscomp$inline_89$$ < $vendorPrefixes$$module$src$style$$.length; $JSCompiler_i$jscomp$inline_89$$++) {
              var $JSCompiler_propertyName$jscomp$inline_90$$ = $vendorPrefixes$$module$src$style$$[$JSCompiler_i$jscomp$inline_89$$] + $JSCompiler_camelCase$jscomp$inline_85_JSCompiler_prefixedPropertyName$jscomp$inline_78_JSCompiler_titleCase$jscomp$inline_77$$;
              if (void 0 !== $JSCompiler_propertyName$jscomp$inline_40_JSCompiler_style$jscomp$inline_73$$[$JSCompiler_propertyName$jscomp$inline_90$$]) {
                $JSCompiler_camelCase$jscomp$inline_85_JSCompiler_prefixedPropertyName$jscomp$inline_78_JSCompiler_titleCase$jscomp$inline_77$$ = $JSCompiler_propertyName$jscomp$inline_90$$;
                break b;
              }
            }
            $JSCompiler_camelCase$jscomp$inline_85_JSCompiler_prefixedPropertyName$jscomp$inline_78_JSCompiler_titleCase$jscomp$inline_77$$ = "";
          }
          void 0 !== $JSCompiler_propertyName$jscomp$inline_40_JSCompiler_style$jscomp$inline_73$$[$JSCompiler_camelCase$jscomp$inline_85_JSCompiler_prefixedPropertyName$jscomp$inline_78_JSCompiler_titleCase$jscomp$inline_77$$] && ($JSCompiler_propertyName$jscomp$inline_76$$ = $JSCompiler_camelCase$jscomp$inline_85_JSCompiler_prefixedPropertyName$jscomp$inline_78_JSCompiler_titleCase$jscomp$inline_77$$);
        }
        $propertyNameCache$$module$src$style$$[$JSCompiler_camelCase$jscomp$inline_74$$] = $JSCompiler_propertyName$jscomp$inline_76$$;
      }
      $JSCompiler_propertyName$jscomp$inline_40_JSCompiler_style$jscomp$inline_73$$ = $JSCompiler_propertyName$jscomp$inline_76$$;
    }
    $JSCompiler_propertyName$jscomp$inline_40_JSCompiler_style$jscomp$inline_73$$ && ($startsWith$$module$src$string$$($JSCompiler_propertyName$jscomp$inline_40_JSCompiler_style$jscomp$inline_73$$, "--") ? $JSCompiler_element$jscomp$inline_35$$.style.setProperty($JSCompiler_propertyName$jscomp$inline_40_JSCompiler_style$jscomp$inline_73$$, $JSCompiler_styleValue$jscomp$inline_41_JSCompiler_value$jscomp$inline_37$$) : $JSCompiler_element$jscomp$inline_35$$.style[$JSCompiler_propertyName$jscomp$inline_40_JSCompiler_style$jscomp$inline_73$$] = 
    $JSCompiler_styleValue$jscomp$inline_41_JSCompiler_value$jscomp$inline_37$$);
  }
}
;function $AmpInstagram$$module$extensions$amp_instagram$0_1$amp_instagram$$($$jscomp$super$this_element$jscomp$77$$) {
  $$jscomp$super$this_element$jscomp$77$$ = AMP.BaseElement.call(this, $$jscomp$super$this_element$jscomp$77$$) || this;
  $$jscomp$super$this_element$jscomp$77$$.$iframe_$ = null;
  $$jscomp$super$this_element$jscomp$77$$.$shortcode_$ = "";
  $$jscomp$super$this_element$jscomp$77$$.$unlistenMessage_$ = null;
  $$jscomp$super$this_element$jscomp$77$$.$captioned_$ = "";
  $$jscomp$super$this_element$jscomp$77$$.$iframePromise_$ = null;
  return $$jscomp$super$this_element$jscomp$77$$;
}
var $JSCompiler_parentCtor$jscomp$inline_44$$ = AMP.BaseElement;
$AmpInstagram$$module$extensions$amp_instagram$0_1$amp_instagram$$.prototype = $$jscomp$objectCreate$$($JSCompiler_parentCtor$jscomp$inline_44$$.prototype);
$AmpInstagram$$module$extensions$amp_instagram$0_1$amp_instagram$$.prototype.constructor = $AmpInstagram$$module$extensions$amp_instagram$0_1$amp_instagram$$;
if ($$jscomp$setPrototypeOf$$) {
  $$jscomp$setPrototypeOf$$($AmpInstagram$$module$extensions$amp_instagram$0_1$amp_instagram$$, $JSCompiler_parentCtor$jscomp$inline_44$$);
} else {
  for (var $JSCompiler_p$jscomp$inline_45$$ in $JSCompiler_parentCtor$jscomp$inline_44$$) {
    if ("prototype" != $JSCompiler_p$jscomp$inline_45$$) {
      if (Object.defineProperties) {
        var $JSCompiler_descriptor$jscomp$inline_46$$ = Object.getOwnPropertyDescriptor($JSCompiler_parentCtor$jscomp$inline_44$$, $JSCompiler_p$jscomp$inline_45$$);
        $JSCompiler_descriptor$jscomp$inline_46$$ && Object.defineProperty($AmpInstagram$$module$extensions$amp_instagram$0_1$amp_instagram$$, $JSCompiler_p$jscomp$inline_45$$, $JSCompiler_descriptor$jscomp$inline_46$$);
      } else {
        $AmpInstagram$$module$extensions$amp_instagram$0_1$amp_instagram$$[$JSCompiler_p$jscomp$inline_45$$] = $JSCompiler_parentCtor$jscomp$inline_44$$[$JSCompiler_p$jscomp$inline_45$$];
      }
    }
  }
}
$AmpInstagram$$module$extensions$amp_instagram$0_1$amp_instagram$$.$superClass_$ = $JSCompiler_parentCtor$jscomp$inline_44$$.prototype;
$JSCompiler_prototypeAlias$$ = $AmpInstagram$$module$extensions$amp_instagram$0_1$amp_instagram$$.prototype;
$JSCompiler_prototypeAlias$$.preconnectCallback = function($opt_onLayout$$) {
  $getService$$module$src$service$$(this.win).url(this.getAmpDoc(), "https://www.instagram.com", $opt_onLayout$$);
  $getService$$module$src$service$$(this.win).url(this.getAmpDoc(), "https://instagram.fsnc1-1.fna.fbcdn.net", $opt_onLayout$$);
};
$JSCompiler_prototypeAlias$$.renderOutsideViewport = function() {
  return !1;
};
$JSCompiler_prototypeAlias$$.buildCallback = function() {
  var $JSCompiler_shouldBeTrueish$jscomp$inline_48$$ = this.element.getAttribute("data-shortcode") || this.element.getAttribute("shortcode"), $JSCompiler_opt_1$jscomp$inline_49$$ = this.element;
  if (!$logs$$module$src$log$$.user) {
    throw Error("failed to call initLogConstructor");
  }
  this.$shortcode_$ = $logs$$module$src$log$$.user.assert($JSCompiler_shouldBeTrueish$jscomp$inline_48$$, "The data-shortcode attribute is required for <amp-instagram> %s", $JSCompiler_opt_1$jscomp$inline_49$$, void 0, void 0, void 0, void 0, void 0, void 0, void 0, void 0);
  this.$captioned_$ = this.element.hasAttribute("data-captioned") ? "captioned/" : "";
};
$JSCompiler_prototypeAlias$$.createPlaceholderCallback = function() {
  var $$jscomp$this$jscomp$2$$ = this, $placeholder$$ = this.win.document.createElement("div");
  $placeholder$$.setAttribute("placeholder", "");
  var $image$jscomp$3$$ = this.win.document.createElement("img");
  this.getAmpDoc().whenFirstVisible().then(function() {
    $image$jscomp$3$$.setAttribute("src", "https://www.instagram.com/p/" + encodeURIComponent($$jscomp$this$jscomp$2$$.$shortcode_$) + "/media/?size=l");
  });
  $image$jscomp$3$$.setAttribute("referrerpolicy", "origin");
  $setStyles$$module$src$style$$($image$jscomp$3$$, {overflow:"hidden", "max-width":"100%"});
  this.propagateAttributes(["alt"], $image$jscomp$3$$);
  this.element.hasAttribute("data-default-framing") && this.element.classList.add("amp-instagram-default-framing");
  $placeholder$$.appendChild($image$jscomp$3$$);
  $setStyles$$module$src$style$$($placeholder$$, {marginTop:"54px"});
  return $placeholder$$;
};
$JSCompiler_prototypeAlias$$.isLayoutSupported = function($layout$jscomp$4$$) {
  return "fixed" == $layout$jscomp$4$$ || "fixed-height" == $layout$jscomp$4$$ || "responsive" == $layout$jscomp$4$$ || "fill" == $layout$jscomp$4$$ || "flex-item" == $layout$jscomp$4$$ || "fluid" == $layout$jscomp$4$$ || "intrinsic" == $layout$jscomp$4$$;
};
$JSCompiler_prototypeAlias$$.layoutCallback = function() {
  var $$jscomp$this$jscomp$3$$ = this, $iframe$$ = this.element.ownerDocument.createElement("iframe");
  this.$iframe_$ = $iframe$$;
  this.$unlistenMessage_$ = $listen$$module$src$event_helper$$(this.win, this.$handleInstagramMessages_$.bind(this));
  $iframe$$.setAttribute("scrolling", "no");
  $iframe$$.setAttribute("frameborder", "0");
  $iframe$$.setAttribute("allowtransparency", "true");
  $iframe$$.setAttribute("title", "Instagram: " + this.element.getAttribute("alt"));
  $iframe$$.src = "https://www.instagram.com/p/" + encodeURIComponent(this.$shortcode_$) + "/embed/" + this.$captioned_$ + "?cr=1&v=12";
  this.applyFillContent($iframe$$);
  this.element.appendChild($iframe$$);
  $setStyles$$module$src$style$$($iframe$$, {opacity:0});
  return this.$iframePromise_$ = this.loadPromise($iframe$$).then(function() {
    $$jscomp$this$jscomp$3$$.getVsync().mutate(function() {
      $setStyles$$module$src$style$$($iframe$$, {opacity:1});
    });
  });
};
$JSCompiler_prototypeAlias$$.$handleInstagramMessages_$ = function($data$jscomp$77_event$jscomp$9$$) {
  var $$jscomp$this$jscomp$4$$ = this;
  if ("https://www.instagram.com" == $data$jscomp$77_event$jscomp$9$$.origin && $data$jscomp$77_event$jscomp$9$$.source == this.$iframe_$.contentWindow) {
    var $eventData$$ = $data$jscomp$77_event$jscomp$9$$.data;
    if ($eventData$$ && ("[object Object]" === $toString_$$module$src$types$$.call($eventData$$) || $startsWith$$module$src$string$$($eventData$$, "{"))) {
      if ("[object Object]" === $toString_$$module$src$types$$.call($eventData$$)) {
        var $JSCompiler_temp$jscomp$64$$ = $eventData$$;
      } else {
        try {
          $JSCompiler_temp$jscomp$64$$ = JSON.parse($eventData$$);
        } catch ($JSCompiler_e$jscomp$inline_82$$) {
          $JSCompiler_temp$jscomp$64$$ = null;
        }
      }
      $data$jscomp$77_event$jscomp$9$$ = $JSCompiler_temp$jscomp$64$$;
      if (void 0 !== $data$jscomp$77_event$jscomp$9$$ && "MEASURE" == $data$jscomp$77_event$jscomp$9$$.type && $data$jscomp$77_event$jscomp$9$$.details) {
        var $height$jscomp$27$$ = $data$jscomp$77_event$jscomp$9$$.details.height;
        this.getVsync().measure(function() {
          $$jscomp$this$jscomp$4$$.$iframe_$ && $$jscomp$this$jscomp$4$$.$iframe_$.offsetHeight !== $height$jscomp$27$$ && $$jscomp$this$jscomp$4$$.forceChangeHeight($height$jscomp$27$$);
        });
      }
    }
  }
};
$JSCompiler_prototypeAlias$$.unlayoutOnPause = function() {
  return !0;
};
$JSCompiler_prototypeAlias$$.unlayoutCallback = function() {
  if (this.$iframe_$) {
    var $JSCompiler_element$jscomp$inline_60$$ = this.$iframe_$;
    $JSCompiler_element$jscomp$inline_60$$.parentElement && $JSCompiler_element$jscomp$inline_60$$.parentElement.removeChild($JSCompiler_element$jscomp$inline_60$$);
    this.$iframePromise_$ = this.$iframe_$ = null;
  }
  this.$unlistenMessage_$ && this.$unlistenMessage_$();
  return !0;
};
(function($AMP$jscomp$1$$) {
  $AMP$jscomp$1$$.registerElement("amp-instagram", $AmpInstagram$$module$extensions$amp_instagram$0_1$amp_instagram$$, "amp-instagram.amp-instagram-default-framing{border:1px solid #dbdbdb!important}\n/*# sourceURL=/extensions/amp-instagram/0.1/amp-instagram.css*/");
})(self.AMP);

})});

//# sourceMappingURL=amp-instagram-0.1.js.map
