(self.AMP=self.AMP||[]).push({n:"amp-ad-exit",i:["_base_i","_base_ad"],v:"1901181729101",f:(function(AMP,_){
var $JSCompiler_StaticMethods_expandStringSync$$ = function($JSCompiler_StaticMethods_expandStringSync$self$$, $source$jscomp$20$$, $opt_bindings$jscomp$2$$) {
  return (new _.$Expander$$module$src$service$url_expander$expander$$($JSCompiler_StaticMethods_expandStringSync$self$$.$D$, $opt_bindings$jscomp$2$$, void 0, !0, void 0, !0)).expand($source$jscomp$20$$);
}, $Filter$$module$extensions$amp_ad_exit$0_1$filters$filter$$ = function($name$jscomp$173$$, $type$jscomp$157$$) {
  this.name = $name$jscomp$173$$;
  this.type = $type$jscomp$157$$;
}, $InactiveElementFilter$$module$extensions$amp_ad_exit$0_1$filters$inactive_element$$ = function($name$jscomp$174$$, $spec$jscomp$4$$) {
  $Filter$$module$extensions$amp_ad_exit$0_1$filters$filter$$.call(this, $name$jscomp$174$$, $spec$jscomp$4$$.type);
  this.$D$ = $spec$jscomp$4$$.selector;
}, $ClickDelayFilter$$module$extensions$amp_ad_exit$0_1$filters$click_delay$$ = function($name$jscomp$175$$, $spec$jscomp$6$$, $win$jscomp$291$$) {
  $Filter$$module$extensions$amp_ad_exit$0_1$filters$filter$$.call(this, $name$jscomp$175$$, $spec$jscomp$6$$.type);
  this.spec = $spec$jscomp$6$$;
  this.$D$ = Date.now();
  $spec$jscomp$6$$.$startTimingEvent$ && ($win$jscomp$291$$.performance && $win$jscomp$291$$.performance.timing ? void 0 == $win$jscomp$291$$.performance.timing[$spec$jscomp$6$$.$startTimingEvent$] ? _.$dev$$module$src$log$$().$Log$$module$src$log_prototype$warn$("amp-ad-exit", "Invalid performance timing event type " + $spec$jscomp$6$$.$startTimingEvent$ + ", falling back to now") : this.$D$ = $win$jscomp$291$$.performance.timing[$spec$jscomp$6$$.$startTimingEvent$] : _.$dev$$module$src$log$$().$Log$$module$src$log_prototype$warn$("amp-ad-exit", 
  "Browser does not support performance timing, falling back to now"));
}, $makeClickDelaySpec$$module$extensions$amp_ad_exit$0_1$filters$click_delay$$ = function($startTimingEvent$$) {
  return {type:"clickDelay", delay:1000, $startTimingEvent$:$startTimingEvent$$};
}, $ClickLocationFilter$$module$extensions$amp_ad_exit$0_1$filters$click_location$$ = function($name$jscomp$176$$, $spec$jscomp$7$$, $adExitElement$$) {
  $Filter$$module$extensions$amp_ad_exit$0_1$filters$filter$$.call(this, $name$jscomp$176$$, $spec$jscomp$7$$.type);
  this.$J$ = $spec$jscomp$7$$.left || 0;
  this.$K$ = $spec$jscomp$7$$.right || 0;
  this.$O$ = $spec$jscomp$7$$.top || 0;
  this.$I$ = $spec$jscomp$7$$.bottom || 0;
  this.$G$ = $spec$jscomp$7$$.$relativeTo$;
  this.$F$ = $adExitElement$$;
  this.$D$ = {};
}, $createFilter$$module$extensions$amp_ad_exit$0_1$filters$factory$$ = function($name$jscomp$177$$, $spec$jscomp$9$$, $adExitInstance$$) {
  switch($spec$jscomp$9$$.type) {
    case "clickDelay":
      return new $ClickDelayFilter$$module$extensions$amp_ad_exit$0_1$filters$click_delay$$($name$jscomp$177$$, $spec$jscomp$9$$, $adExitInstance$$.$win$);
    case "clickLocation":
      return new $ClickLocationFilter$$module$extensions$amp_ad_exit$0_1$filters$click_location$$($name$jscomp$177$$, $spec$jscomp$9$$, $adExitInstance$$);
    case "inactiveElement":
      return new $InactiveElementFilter$$module$extensions$amp_ad_exit$0_1$filters$inactive_element$$($name$jscomp$177$$, $spec$jscomp$9$$);
  }
}, $assertConfig$$module$extensions$amp_ad_exit$0_1$config$$ = function($config$jscomp$18$$) {
  $config$jscomp$18$$.filters || ($config$jscomp$18$$.filters = {});
  $config$jscomp$18$$.transport || ($config$jscomp$18$$.transport = {});
  var $targets$jscomp$inline_2231$$ = $config$jscomp$18$$.targets, $target$jscomp$inline_2233$$;
  for ($target$jscomp$inline_2233$$ in $targets$jscomp$inline_2231$$) {
    $assertTarget$$module$extensions$amp_ad_exit$0_1$config$$($targets$jscomp$inline_2231$$[$target$jscomp$inline_2233$$]);
  }
  return $config$jscomp$18$$;
}, $assertTarget$$module$extensions$amp_ad_exit$0_1$config$$ = function($target$jscomp$106$$) {
  $target$jscomp$106$$.filters && $target$jscomp$106$$.filters.forEach(function() {
  });
  if ($target$jscomp$106$$.vars) {
    for (var $variable$jscomp$1$$ in $target$jscomp$106$$.vars) {
    }
  }
}, $assertVendor$$module$extensions$amp_ad_exit$0_1$config$$ = function($vendor$jscomp$7$$) {
  return _.$JSCompiler_StaticMethods_assertString$$(_.$user$$module$src$log$$(), _.$IFRAME_TRANSPORTS$$module$extensions$amp_analytics$0_1$iframe_transport_vendors$$[$vendor$jscomp$7$$], "Unknown or invalid vendor " + $vendor$jscomp$7$$ + ", note that vendor must use transport: iframe");
}, $AmpAdExit$$module$extensions$amp_ad_exit$0_1$amp_ad_exit$$ = function($$jscomp$super$this$jscomp$8_element$jscomp$288$$) {
  $$jscomp$super$this$jscomp$8_element$jscomp$288$$ = window.AMP.BaseElement.call(this, $$jscomp$super$this$jscomp$8_element$jscomp$288$$) || this;
  $$jscomp$super$this$jscomp$8_element$jscomp$288$$.$targets_$ = {};
  $$jscomp$super$this$jscomp$8_element$jscomp$288$$.$defaultFilters_$ = [];
  $$jscomp$super$this$jscomp$8_element$jscomp$288$$.$transport_$ = {$beacon$:!0, $image$:!0};
  $$jscomp$super$this$jscomp$8_element$jscomp$288$$.$userFilters_$ = {};
  _.$JSCompiler_StaticMethods_registerAction$$($$jscomp$super$this$jscomp$8_element$jscomp$288$$, "exit", $$jscomp$super$this$jscomp$8_element$jscomp$288$$.$exit$.bind($$jscomp$super$this$jscomp$8_element$jscomp$288$$));
  $$jscomp$super$this$jscomp$8_element$jscomp$288$$.$vendorResponses_$ = {};
  $$jscomp$super$this$jscomp$8_element$jscomp$288$$.$unlisten_$ = null;
  $$jscomp$super$this$jscomp$8_element$jscomp$288$$.$ampAdResourceId_$ = null;
  $$jscomp$super$this$jscomp$8_element$jscomp$288$$.$expectedOriginToVendor_$ = {};
  return $$jscomp$super$this$jscomp$8_element$jscomp$288$$;
}, $JSCompiler_StaticMethods_getUrlVariableRewriter_$$ = function($JSCompiler_StaticMethods_getUrlVariableRewriter_$self$$, $args$jscomp$20$$, $event$jscomp$66$$, $target$jscomp$108$$) {
  var $substitutionFunctions$$ = {CLICK_X:function() {
    return $event$jscomp$66$$.clientX;
  }, CLICK_Y:function() {
    return $event$jscomp$66$$.clientY;
  }}, $replacements$$ = _.$Services$$module$src$services$urlReplacementsForDoc$$($JSCompiler_StaticMethods_getUrlVariableRewriter_$self$$.element), $whitelist$jscomp$8$$ = {RANDOM:!0, CLICK_X:!0, CLICK_Y:!0};
  if ($target$jscomp$108$$.vars) {
    var $$jscomp$loop$396$$ = {}, $customVarName$$;
    for ($customVarName$$ in $target$jscomp$108$$.vars) {
      $$jscomp$loop$396$$.$customVarName$ = $customVarName$$, "_" == $$jscomp$loop$396$$.$customVarName$[0] && ($$jscomp$loop$396$$.$customVar$ = $target$jscomp$108$$.vars[$$jscomp$loop$396$$.$customVarName$], $$jscomp$loop$396$$.$customVar$ && ($substitutionFunctions$$[$$jscomp$loop$396$$.$customVarName$] = function($event$jscomp$66$$) {
        return function() {
          if ($event$jscomp$66$$.$customVar$.$iframeTransportSignal$) {
            var $target$jscomp$108$$ = $JSCompiler_StaticMethods_expandStringSync$$($replacements$$, $event$jscomp$66$$.$customVar$.$iframeTransportSignal$, {IFRAME_TRANSPORT_SIGNAL:function($args$jscomp$20$$, $event$jscomp$66$$) {
              if (!$args$jscomp$20$$ || !$event$jscomp$66$$) {
                return "";
              }
              if (($args$jscomp$20$$ = $JSCompiler_StaticMethods_getUrlVariableRewriter_$self$$.$vendorResponses_$[$args$jscomp$20$$]) && $event$jscomp$66$$ in $args$jscomp$20$$) {
                return $args$jscomp$20$$[$event$jscomp$66$$];
              }
            }});
            if ($event$jscomp$66$$.$customVar$.$iframeTransportSignal$ == "IFRAME_TRANSPORT_SIGNAL" + $target$jscomp$108$$) {
              _.$dev$$module$src$log$$().error("amp-ad-exit", "Invalid IFRAME_TRANSPORT_SIGNAL format:" + $target$jscomp$108$$ + " (perhaps there is a space after a comma?)");
            } else {
              if ("" != $target$jscomp$108$$) {
                return $target$jscomp$108$$;
              }
            }
          }
          return $event$jscomp$66$$.$customVarName$ in $args$jscomp$20$$ ? $args$jscomp$20$$[$event$jscomp$66$$.$customVarName$] : $event$jscomp$66$$.$customVar$.defaultValue;
        };
      }($$jscomp$loop$396$$), $whitelist$jscomp$8$$[$$jscomp$loop$396$$.$customVarName$] = !0, $$jscomp$loop$396$$ = {$customVar$:$$jscomp$loop$396$$.$customVar$, $customVarName$:$$jscomp$loop$396$$.$customVarName$}));
    }
  }
  return function($JSCompiler_StaticMethods_getUrlVariableRewriter_$self$$) {
    return _.$JSCompiler_StaticMethods_expandUrlSync$$($replacements$$, $JSCompiler_StaticMethods_getUrlVariableRewriter_$self$$, $substitutionFunctions$$, void 0, $whitelist$jscomp$8$$);
  };
}, $JSCompiler_StaticMethods_filter_$$ = function($filters$jscomp$1$$, $event$jscomp$67$$) {
  return $filters$jscomp$1$$.every(function($filters$jscomp$1$$) {
    var $filter$jscomp$4$$ = $filters$jscomp$1$$.filter($event$jscomp$67$$);
    _.$user$$module$src$log$$().$Log$$module$src$log_prototype$info$("amp-ad-exit", "Filter '" + $filters$jscomp$1$$.name + "': " + ($filter$jscomp$4$$ ? "pass" : "fail"));
    return $filter$jscomp$4$$;
  });
}, $JSCompiler_StaticMethods_init3pResponseListener_$$ = function($JSCompiler_StaticMethods_init3pResponseListener_$self$$) {
  "inabox" != _.$getMode$$module$src$mode$$().runtime && ($JSCompiler_StaticMethods_init3pResponseListener_$self$$.$ampAdResourceId_$ = $JSCompiler_StaticMethods_init3pResponseListener_$self$$.$ampAdResourceId_$ || _.$getAmpAdResourceId$$module$src$ad_helper$$($JSCompiler_StaticMethods_init3pResponseListener_$self$$.element, _.$getTopWindow$$module$src$service$$($JSCompiler_StaticMethods_init3pResponseListener_$self$$.$win$)), $JSCompiler_StaticMethods_init3pResponseListener_$self$$.$ampAdResourceId_$ ? 
  $JSCompiler_StaticMethods_init3pResponseListener_$self$$.$unlisten_$ = _.$listen$$module$src$3p_frame_messaging$$($JSCompiler_StaticMethods_init3pResponseListener_$self$$.$getAmpDoc$().$win$, function($event$jscomp$68_responseMsg$$) {
    $JSCompiler_StaticMethods_init3pResponseListener_$self$$.$expectedOriginToVendor_$[$event$jscomp$68_responseMsg$$.origin] && ($event$jscomp$68_responseMsg$$ = _.$deserializeMessage$$module$src$3p_frame_messaging$$($event$jscomp$68_responseMsg$$.data)) && "iframe-transport-response" == $event$jscomp$68_responseMsg$$.type && (_.$parseUrlDeprecated$$module$src$url$$($assertVendor$$module$extensions$amp_ad_exit$0_1$config$$($event$jscomp$68_responseMsg$$.vendor)), $event$jscomp$68_responseMsg$$.creativeId == 
    $JSCompiler_StaticMethods_init3pResponseListener_$self$$.$ampAdResourceId_$ && ($JSCompiler_StaticMethods_init3pResponseListener_$self$$.$vendorResponses_$[$event$jscomp$68_responseMsg$$.vendor] = $event$jscomp$68_responseMsg$$.message));
  }) : _.$user$$module$src$log$$().$Log$$module$src$log_prototype$warn$("amp-ad-exit", "No friendly parent amp-ad element was found for amp-ad-exit; not in inabox case."));
};
$Filter$$module$extensions$amp_ad_exit$0_1$filters$filter$$.prototype.filter = function() {
};
$Filter$$module$extensions$amp_ad_exit$0_1$filters$filter$$.prototype.$onLayoutMeasure$ = function() {
};
_.$$jscomp$inherits$$($InactiveElementFilter$$module$extensions$amp_ad_exit$0_1$filters$inactive_element$$, $Filter$$module$extensions$amp_ad_exit$0_1$filters$filter$$);
$InactiveElementFilter$$module$extensions$amp_ad_exit$0_1$filters$inactive_element$$.prototype.filter = function($event$jscomp$63$$) {
  return !_.$matches$$module$src$dom$$($event$jscomp$63$$.target, this.$D$);
};
_.$$jscomp$inherits$$($ClickDelayFilter$$module$extensions$amp_ad_exit$0_1$filters$click_delay$$, $Filter$$module$extensions$amp_ad_exit$0_1$filters$filter$$);
$ClickDelayFilter$$module$extensions$amp_ad_exit$0_1$filters$click_delay$$.prototype.filter = function() {
  return Date.now() - this.$D$ >= this.spec.delay;
};
_.$$jscomp$inherits$$($ClickLocationFilter$$module$extensions$amp_ad_exit$0_1$filters$click_location$$, $Filter$$module$extensions$amp_ad_exit$0_1$filters$filter$$);
$ClickLocationFilter$$module$extensions$amp_ad_exit$0_1$filters$click_location$$.prototype.filter = function($event$jscomp$64$$) {
  return $event$jscomp$64$$.clientX >= this.$D$.left && $event$jscomp$64$$.clientX <= this.$D$.right && $event$jscomp$64$$.clientY >= this.$D$.top && $event$jscomp$64$$.clientY <= this.$D$.bottom ? !0 : !1;
};
$ClickLocationFilter$$module$extensions$amp_ad_exit$0_1$filters$click_location$$.prototype.$onLayoutMeasure$ = function() {
  var $$jscomp$this$jscomp$308$$ = this;
  _.$JSCompiler_StaticMethods_getVsync$$(this.$F$).measure(function() {
    var $rect$jscomp$13_win$jscomp$292$$ = $$jscomp$this$jscomp$308$$.$F$.$win$;
    $$jscomp$this$jscomp$308$$.$G$ ? ($rect$jscomp$13_win$jscomp$292$$ = $rect$jscomp$13_win$jscomp$292$$.document.querySelector($$jscomp$this$jscomp$308$$.$G$).getBoundingClientRect(), $$jscomp$this$jscomp$308$$.$D$.left = $rect$jscomp$13_win$jscomp$292$$.left, $$jscomp$this$jscomp$308$$.$D$.top = $rect$jscomp$13_win$jscomp$292$$.top, $$jscomp$this$jscomp$308$$.$D$.bottom = $rect$jscomp$13_win$jscomp$292$$.bottom, $$jscomp$this$jscomp$308$$.$D$.right = $rect$jscomp$13_win$jscomp$292$$.right) : ($$jscomp$this$jscomp$308$$.$D$.left = 
    0, $$jscomp$this$jscomp$308$$.$D$.top = 0, $$jscomp$this$jscomp$308$$.$D$.bottom = $rect$jscomp$13_win$jscomp$292$$.innerHeight, $$jscomp$this$jscomp$308$$.$D$.right = $rect$jscomp$13_win$jscomp$292$$.innerWidth);
    $$jscomp$this$jscomp$308$$.$D$.left += $$jscomp$this$jscomp$308$$.$J$;
    $$jscomp$this$jscomp$308$$.$D$.top += $$jscomp$this$jscomp$308$$.$O$;
    $$jscomp$this$jscomp$308$$.$D$.right -= $$jscomp$this$jscomp$308$$.$K$;
    $$jscomp$this$jscomp$308$$.$D$.bottom -= $$jscomp$this$jscomp$308$$.$I$;
  });
};
_.$$jscomp$inherits$$($AmpAdExit$$module$extensions$amp_ad_exit$0_1$amp_ad_exit$$, window.AMP.BaseElement);
_.$JSCompiler_prototypeAlias$$ = $AmpAdExit$$module$extensions$amp_ad_exit$0_1$amp_ad_exit$$.prototype;
_.$JSCompiler_prototypeAlias$$.$exit$ = function($invocation$jscomp$23_target$jscomp$107$$) {
  var $$jscomp$this$jscomp$309$$ = this, $args$jscomp$19_substituteVariables$$ = $invocation$jscomp$23_target$jscomp$107$$.args, $event$jscomp$65$$ = $invocation$jscomp$23_target$jscomp$107$$.event;
  $invocation$jscomp$23_target$jscomp$107$$ = this.$targets_$[$args$jscomp$19_substituteVariables$$.target];
  $JSCompiler_StaticMethods_filter_$$(this.$defaultFilters_$, $event$jscomp$65$$) && $JSCompiler_StaticMethods_filter_$$($invocation$jscomp$23_target$jscomp$107$$.filters, $event$jscomp$65$$) && ($event$jscomp$65$$.preventDefault(), $args$jscomp$19_substituteVariables$$ = $JSCompiler_StaticMethods_getUrlVariableRewriter_$$(this, $args$jscomp$19_substituteVariables$$, $event$jscomp$65$$, $invocation$jscomp$23_target$jscomp$107$$), $invocation$jscomp$23_target$jscomp$107$$.$trackingUrls$ && $invocation$jscomp$23_target$jscomp$107$$.$trackingUrls$.map($args$jscomp$19_substituteVariables$$).forEach(function($invocation$jscomp$23_target$jscomp$107$$) {
    "amp-ad-exit";
    $$jscomp$this$jscomp$309$$.$transport_$.$beacon$ && $$jscomp$this$jscomp$309$$.$win$.navigator.sendBeacon && $$jscomp$this$jscomp$309$$.$win$.navigator.sendBeacon($invocation$jscomp$23_target$jscomp$107$$, "") || !$$jscomp$this$jscomp$309$$.$transport_$.$image$ || ($$jscomp$this$jscomp$309$$.$win$.document.createElement("img").src = $invocation$jscomp$23_target$jscomp$107$$);
  }), _.$openWindowDialog$$module$src$dom$$(this.$win$, $args$jscomp$19_substituteVariables$$($invocation$jscomp$23_target$jscomp$107$$.$finalUrl$), "_blank"));
};
_.$JSCompiler_prototypeAlias$$.$buildCallback$ = function() {
  var $$jscomp$this$jscomp$311$$ = this;
  this.element.setAttribute("aria-hidden", "true");
  this.$defaultFilters_$.push($createFilter$$module$extensions$amp_ad_exit$0_1$filters$factory$$("minDelay", $makeClickDelaySpec$$module$extensions$amp_ad_exit$0_1$filters$click_delay$$(), this));
  this.$defaultFilters_$.push($createFilter$$module$extensions$amp_ad_exit$0_1$filters$factory$$("carouselBtns", {type:"inactiveElement", selector:".amp-carousel-button"}, this));
  var $child$jscomp$10$$ = this.element.children[0];
  try {
    var $config$jscomp$21$$ = $assertConfig$$module$extensions$amp_ad_exit$0_1$config$$(_.$parseJson$$module$src$json$$($child$jscomp$10$$.textContent));
    if (_.$isObject$$module$src$types$$($config$jscomp$21$$.options) && "string" === typeof $config$jscomp$21$$.options.startTimingEvent) {
      var $defaultClickStartTimingEvent$$ = $config$jscomp$21$$.options.startTimingEvent;
      this.$defaultFilters_$.splice(0, 1, $createFilter$$module$extensions$amp_ad_exit$0_1$filters$factory$$("minDelay", $makeClickDelaySpec$$module$extensions$amp_ad_exit$0_1$filters$click_delay$$($config$jscomp$21$$.options.startTimingEvent), this));
    }
    for (var $name$jscomp$180$$ in $config$jscomp$21$$.filters) {
      var $spec$jscomp$10$$ = $config$jscomp$21$$.filters[$name$jscomp$180$$];
      "clickDelay" == $spec$jscomp$10$$.type && ($spec$jscomp$10$$.$startTimingEvent$ = $spec$jscomp$10$$.$startTimingEvent$ || $defaultClickStartTimingEvent$$);
      this.$userFilters_$[$name$jscomp$180$$] = $createFilter$$module$extensions$amp_ad_exit$0_1$filters$factory$$($name$jscomp$180$$, $spec$jscomp$10$$, this);
    }
    for (var $name$206$$ in $config$jscomp$21$$.targets) {
      var $target$jscomp$109$$ = $config$jscomp$21$$.targets[$name$206$$];
      this.$targets_$[$name$206$$] = {$finalUrl$:$target$jscomp$109$$.finalUrl, $trackingUrls$:$target$jscomp$109$$.trackingUrls || [], $vars$:$target$jscomp$109$$.vars || {}, filters:($target$jscomp$109$$.filters || []).map(function($child$jscomp$10$$) {
        return $$jscomp$this$jscomp$311$$.$userFilters_$[$child$jscomp$10$$];
      }).filter(function($$jscomp$this$jscomp$311$$) {
        return $$jscomp$this$jscomp$311$$;
      })};
      for (var $customVar$$ in $target$jscomp$109$$.vars) {
        if ($target$jscomp$109$$.vars[$customVar$$].$iframeTransportSignal$) {
          var $matches$jscomp$10$$ = $target$jscomp$109$$.vars[$customVar$$].$iframeTransportSignal$.match(/IFRAME_TRANSPORT_SIGNAL\(([^,]+)/);
          if ($matches$jscomp$10$$ && !(2 > $matches$jscomp$10$$.length)) {
            var $vendor$jscomp$9$$ = $matches$jscomp$10$$[1], $origin$jscomp$20$$ = _.$parseUrlDeprecated$$module$src$url$$($assertVendor$$module$extensions$amp_ad_exit$0_1$config$$($vendor$jscomp$9$$)).origin;
            this.$expectedOriginToVendor_$[$origin$jscomp$20$$] = this.$expectedOriginToVendor_$[$origin$jscomp$20$$] || $vendor$jscomp$9$$;
          }
        }
      }
    }
    this.$transport_$.$beacon$ = !1 !== $config$jscomp$21$$.transport.beacon;
    this.$transport_$.$image$ = !1 !== $config$jscomp$21$$.transport.image;
  } catch ($e$207$$) {
    throw this.$user$().error("amp-ad-exit", "Invalid JSON config", $e$207$$), $e$207$$;
  }
  $JSCompiler_StaticMethods_init3pResponseListener_$$(this);
};
_.$JSCompiler_prototypeAlias$$.$resumeCallback$ = function() {
  $JSCompiler_StaticMethods_init3pResponseListener_$$(this);
};
_.$JSCompiler_prototypeAlias$$.$unlayoutCallback$ = function() {
  this.$unlisten_$ && (this.$unlisten_$(), this.$unlisten_$ = null);
  return window.AMP.BaseElement.prototype.$unlayoutCallback$.call(this);
};
_.$JSCompiler_prototypeAlias$$.$isLayoutSupported$ = function() {
  return !0;
};
_.$JSCompiler_prototypeAlias$$.$onLayoutMeasure$ = function() {
  for (var $name$jscomp$181$$ in this.$userFilters_$) {
    this.$userFilters_$[$name$jscomp$181$$].$onLayoutMeasure$();
  }
};
window.self.AMP.registerElement("amp-ad-exit", $AmpAdExit$$module$extensions$amp_ad_exit$0_1$amp_ad_exit$$);

})});
