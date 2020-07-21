(self.AMP=self.AMP||[]).push({n:"amp-addthis",v:"2007210308000",f:(function(AMP,_){
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
    var $JSCompiler_x$jscomp$inline_44$$ = {a:!0}, $JSCompiler_y$jscomp$inline_45$$ = {};
    try {
      $JSCompiler_y$jscomp$inline_45$$.__proto__ = $JSCompiler_x$jscomp$inline_44$$;
      $JSCompiler_inline_result$jscomp$20$$ = $JSCompiler_y$jscomp$inline_45$$.a;
      break a;
    } catch ($JSCompiler_e$jscomp$inline_46$$) {
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
var $$jscomp$setPrototypeOf$$ = $JSCompiler_temp$jscomp$19$$, $SHARE_CONFIG_KEYS$$module$extensions$amp_addthis$0_1$constants$$ = "url title media description email_template email_vars passthrough url_transforms".split(" "), $AT_CONFIG_KEYS$$module$extensions$amp_addthis$0_1$constants$$ = "services_exclude services_compact services_expanded services_custom ui_click ui_disable ui_delay ui_hover_direction ui_language ui_offset_top ui_offset_left ui_tabindex track_addressbar track_clickback ga_property ga_social".split(" "), 
$RE_ALPHA$$module$extensions$amp_addthis$0_1$constants$$ = /[A-Z]/gi, $RE_NONALPHA$$module$extensions$amp_addthis$0_1$constants$$ = /[^a-zA-Z]/g, $RE_WHITESPACE$$module$extensions$amp_addthis$0_1$constants$$ = /\s/g;
var $RE_NUMDASH$$module$extensions$amp_addthis$0_1$addthis_utils$monitors$active_tools_monitor$$ = /[0-9\-].*/;
function $ActiveToolsMonitor$$module$extensions$amp_addthis$0_1$addthis_utils$monitors$active_tools_monitor$$() {
  this.$activePcos_$ = {};
}
$ActiveToolsMonitor$$module$extensions$amp_addthis$0_1$addthis_utils$monitors$active_tools_monitor$$.prototype.record = function($widget$$) {
  var $pco$$ = ($widget$$.id || $widget$$.pco || "").replace($RE_NUMDASH$$module$extensions$amp_addthis$0_1$addthis_utils$monitors$active_tools_monitor$$, "");
  $pco$$ && !this.$activePcos_$[$pco$$] && $RE_ALPHA$$module$extensions$amp_addthis$0_1$constants$$.test($pco$$) && (this.$activePcos_$[$pco$$] = $pco$$);
};
$ActiveToolsMonitor$$module$extensions$amp_addthis$0_1$addthis_utils$monitors$active_tools_monitor$$.prototype.recordProductCode = function($productCode$$) {
  $productCode$$ && !this.$activePcos_$[$productCode$$] && $RE_ALPHA$$module$extensions$amp_addthis$0_1$constants$$.test($productCode$$) && (this.$activePcos_$[$productCode$$] = $productCode$$);
};
$ActiveToolsMonitor$$module$extensions$amp_addthis$0_1$addthis_utils$monitors$active_tools_monitor$$.prototype.getActivePcos = function() {
  return Object.keys(this.$activePcos_$);
};
var $optsSupported$$module$src$event_helper_listen$$;
function $internalListenImplementation$$module$src$event_helper_listen$$($element$jscomp$13$$, $eventType$jscomp$3$$, $listener$jscomp$64$$) {
  var $optsSupported$$ = $detectEvtListenerOptsSupport$$module$src$event_helper_listen$$();
  $element$jscomp$13$$.addEventListener($eventType$jscomp$3$$, function($element$jscomp$13$$) {
    try {
      return $listener$jscomp$64$$($element$jscomp$13$$);
    } catch ($e$jscomp$8$$) {
      throw self.__AMP_REPORT_ERROR($e$jscomp$8$$), $e$jscomp$8$$;
    }
  }, $optsSupported$$ ? void 0 : !1);
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
;/*
 https://mths.be/cssescape v1.5.1 by @mathias | MIT license */
var $toString_$$module$src$types$$ = Object.prototype.toString;
function $toArray$$module$src$types$$($arrayLike$jscomp$1$$) {
  return $arrayLike$jscomp$1$$ ? Array.prototype.slice.call($arrayLike$jscomp$1$$) : [];
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
function $userAssert$$module$src$log$$($shouldBeTrueish$jscomp$3$$, $opt_message$jscomp$15$$, $opt_1$jscomp$1$$) {
  if (!$logs$$module$src$log$$.user) {
    throw Error("failed to call initLogConstructor");
  }
  $logs$$module$src$log$$.user.assert($shouldBeTrueish$jscomp$3$$, $opt_message$jscomp$15$$, $opt_1$jscomp$1$$, void 0, void 0, void 0, void 0, void 0, void 0, void 0, void 0);
}
;function $dict$$module$src$utils$object$$($opt_initial$jscomp$1$$) {
  return $opt_initial$jscomp$1$$ || {};
}
;function $startsWith$$module$src$string$$($string$jscomp$6$$, $prefix$jscomp$4$$) {
  return $prefix$jscomp$4$$.length > $string$jscomp$6$$.length ? !1 : 0 == $string$jscomp$6$$.lastIndexOf($prefix$jscomp$4$$, 0);
}
;function $createElementWithAttributes$$module$src$dom$$($doc$jscomp$4_element$jscomp$18$$, $tagName$jscomp$4$$, $attributes$jscomp$2$$) {
  $doc$jscomp$4_element$jscomp$18$$ = $doc$jscomp$4_element$jscomp$18$$.createElement($tagName$jscomp$4$$);
  for (var $JSCompiler_attr$jscomp$inline_52$$ in $attributes$jscomp$2$$) {
    $doc$jscomp$4_element$jscomp$18$$.setAttribute($JSCompiler_attr$jscomp$inline_52$$, $attributes$jscomp$2$$[$JSCompiler_attr$jscomp$inline_52$$]);
  }
  return $doc$jscomp$4_element$jscomp$18$$;
}
;function $listen$$module$src$event_helper$$($element$jscomp$34$$, $listener$jscomp$65$$) {
  $internalListenImplementation$$module$src$event_helper_listen$$($element$jscomp$34$$, "pagehide", $listener$jscomp$65$$);
}
;function $ClickMonitor$$module$extensions$amp_addthis$0_1$addthis_utils$monitors$click_monitor$$() {
  this.$iframeClickMap_$ = {};
  this.$pageClicks_$ = 0;
  this.$win_$ = this.$lastSelection_$ = null;
}
$JSCompiler_prototypeAlias$$ = $ClickMonitor$$module$extensions$amp_addthis$0_1$addthis_utils$monitors$click_monitor$$.prototype;
$JSCompiler_prototypeAlias$$.startForDoc = function($ampDoc$$) {
  this.$win_$ = $ampDoc$$.win;
  this.$lastSelection_$ = this.$win_$.document.activeElement;
  var $JSCompiler_listener$jscomp$inline_159_JSCompiler_listener$jscomp$inline_163$$ = this.$checkSelection_$.bind(this);
  $internalListenImplementation$$module$src$event_helper_listen$$(this.$win_$, "blur", $JSCompiler_listener$jscomp$inline_159_JSCompiler_listener$jscomp$inline_163$$);
  $JSCompiler_listener$jscomp$inline_159_JSCompiler_listener$jscomp$inline_163$$ = this.$onPageClick_$.bind(this);
  $internalListenImplementation$$module$src$event_helper_listen$$(this.$win_$, "click", $JSCompiler_listener$jscomp$inline_159_JSCompiler_listener$jscomp$inline_163$$);
};
$JSCompiler_prototypeAlias$$.$checkSelection_$ = function() {
  var $activeElement$$ = this.$win_$.document.activeElement;
  if ($activeElement$$) {
    var $changeOccurred$$ = $activeElement$$ !== this.$lastSelection_$;
    if ("IFRAME" === $activeElement$$.tagName && $changeOccurred$$) {
      var $JSCompiler_trimSrc$jscomp$inline_56$$ = $activeElement$$.src.split("://").pop();
      this.$iframeClickMap_$[$JSCompiler_trimSrc$jscomp$inline_56$$] ? this.$iframeClickMap_$[$JSCompiler_trimSrc$jscomp$inline_56$$]++ : this.$iframeClickMap_$[$JSCompiler_trimSrc$jscomp$inline_56$$] = 1;
    }
    this.$lastSelection_$ = $activeElement$$;
  }
};
$JSCompiler_prototypeAlias$$.$onPageClick_$ = function() {
  this.$pageClicks_$++;
  this.$lastSelection_$ = this.$win_$.document.activeElement;
};
$JSCompiler_prototypeAlias$$.getPageClicks = function() {
  return this.$pageClicks_$;
};
$JSCompiler_prototypeAlias$$.getIframeClickString = function() {
  var $$jscomp$this$jscomp$2$$ = this;
  return Object.keys(this.$iframeClickMap_$).map(function($key$jscomp$46$$) {
    return $key$jscomp$46$$ + "|" + $$jscomp$this$jscomp$2$$.$iframeClickMap_$[$key$jscomp$46$$];
  }).join(",");
};
function $getAddThisMode$$module$extensions$amp_addthis$0_1$addthis_utils$mode$$($_$$) {
  var $JSCompiler_object_inline_hasWidgetId_140_JSCompiler_widgetId$jscomp$inline_59$$ = $_$$.widgetId;
  var $JSCompiler_productCode$jscomp$inline_60$$ = $_$$.productCode, $JSCompiler_hasPubId$jscomp$inline_61$$ = $isPubId$$module$extensions$amp_addthis$0_1$addthis_utils$mode$$($_$$.pubId);
  $JSCompiler_object_inline_hasWidgetId_140_JSCompiler_widgetId$jscomp$inline_59$$ = $isWidgetId$$module$extensions$amp_addthis$0_1$addthis_utils$mode$$($JSCompiler_object_inline_hasWidgetId_140_JSCompiler_widgetId$jscomp$inline_59$$);
  var $hasProductCode$$ = "string" === typeof $JSCompiler_productCode$jscomp$inline_60$$ && ("shin" === $JSCompiler_productCode$jscomp$inline_60$$ || "shfs" === $JSCompiler_productCode$jscomp$inline_60$$);
  if ($JSCompiler_hasPubId$jscomp$inline_61$$) {
    if ($JSCompiler_object_inline_hasWidgetId_140_JSCompiler_widgetId$jscomp$inline_59$$ && !$hasProductCode$$) {
      return 1;
    }
    if (!$JSCompiler_object_inline_hasWidgetId_140_JSCompiler_widgetId$jscomp$inline_59$$ && $hasProductCode$$) {
      return 2;
    }
  } else {
    if (!$JSCompiler_object_inline_hasWidgetId_140_JSCompiler_widgetId$jscomp$inline_59$$ && $hasProductCode$$) {
      return 3;
    }
  }
  return -1;
}
function $isPubId$$module$extensions$amp_addthis$0_1$addthis_utils$mode$$($candidate$jscomp$1$$) {
  return "string" === typeof $candidate$jscomp$1$$ && 0 < $candidate$jscomp$1$$.length;
}
function $isWidgetId$$module$extensions$amp_addthis$0_1$addthis_utils$mode$$($candidate$jscomp$2$$) {
  return "string" === typeof $candidate$jscomp$2$$ && 4 === $candidate$jscomp$2$$.length;
}
;function $ConfigManager$$module$extensions$amp_addthis$0_1$config_manager$$() {
  this.$dataForPubId_$ = {};
  this.$configProviderIframes_$ = [];
  this.$activeToolsMonitor_$ = null;
}
$ConfigManager$$module$extensions$amp_addthis$0_1$config_manager$$.prototype.receiveConfiguration = function($data$jscomp$77$$) {
  var $$jscomp$this$jscomp$3$$ = this, $config$jscomp$2$$ = $data$jscomp$77$$.config, $pubId$jscomp$1$$ = $data$jscomp$77$$.pubId, $source$jscomp$14$$ = $data$jscomp$77$$.source;
  if (this.$configProviderIframes_$.some(function($data$jscomp$77$$) {
    return $data$jscomp$77$$.contentWindow === $source$jscomp$14$$;
  })) {
    var $pubData$$ = this.$dataForPubId_$[$pubId$jscomp$1$$];
    $pubData$$.config = $config$jscomp$2$$;
    $pubData$$.requestStatus = 2;
    $pubData$$.iframeData.forEach(function($data$jscomp$77$$) {
      $JSCompiler_StaticMethods_sendConfiguration_$$($$jscomp$this$jscomp$3$$, {iframe:$data$jscomp$77$$.iframe, widgetId:$data$jscomp$77$$.widgetId, pubId:$pubId$jscomp$1$$, shareConfig:$data$jscomp$77$$.shareConfig, atConfig:$data$jscomp$77$$.atConfig, productCode:$data$jscomp$77$$.productCode, containerClassName:$data$jscomp$77$$.containerClassName});
    });
  }
};
function $JSCompiler_StaticMethods_sendConfiguration_$$($JSCompiler_StaticMethods_sendConfiguration_$self$$, $input$jscomp$9$$) {
  var $iframe$jscomp$2$$ = $input$jscomp$9$$.iframe, $widgetId$jscomp$2$$ = $input$jscomp$9$$.widgetId, $pubId$jscomp$2$$ = $input$jscomp$9$$.pubId, $productCode$jscomp$3$$ = $input$jscomp$9$$.productCode, $pubData$jscomp$1$$ = $JSCompiler_StaticMethods_sendConfiguration_$self$$.$dataForPubId_$[$pubId$jscomp$2$$], $dashboardConfig$$ = $pubData$jscomp$1$$.config, $configRequestStatus$$ = $pubData$jscomp$1$$.requestStatus, $jsonToSend$$ = $dict$$module$src$utils$object$$({event:"addthis.amp.configuration", 
  shareConfig:$input$jscomp$9$$.shareConfig, atConfig:$input$jscomp$9$$.atConfig, pubId:$pubId$jscomp$2$$, widgetId:$widgetId$jscomp$2$$, productCode:$productCode$jscomp$3$$, containerClassName:$input$jscomp$9$$.containerClassName, configRequestStatus:$configRequestStatus$$, dashboardConfig:$dashboardConfig$$});
  if ($dashboardConfig$$ && $dashboardConfig$$.widgets && 0 < Object.keys($dashboardConfig$$.widgets).length) {
    switch($getAddThisMode$$module$extensions$amp_addthis$0_1$addthis_utils$mode$$({pubId:$pubId$jscomp$2$$, widgetId:$widgetId$jscomp$2$$, productCode:$productCode$jscomp$3$$})) {
      case 1:
        $widgetId$jscomp$2$$ && $dashboardConfig$$.widgets[$widgetId$jscomp$2$$] && $JSCompiler_StaticMethods_sendConfiguration_$self$$.$activeToolsMonitor_$.record($dashboardConfig$$.widgets[$widgetId$jscomp$2$$]);
        break;
      case 2:
        $productCode$jscomp$3$$ && $JSCompiler_StaticMethods_sendConfiguration_$self$$.$activeToolsMonitor_$.recordProductCode($productCode$jscomp$3$$);
        break;
      case 3:
        $productCode$jscomp$3$$ && $JSCompiler_StaticMethods_sendConfiguration_$self$$.$activeToolsMonitor_$.recordProductCode($productCode$jscomp$3$$);
        return;
      default:
        return;
    }
  }
  $iframe$jscomp$2$$.contentWindow.postMessage(JSON.stringify($jsonToSend$$), "https://s7.addthis.com");
  0 === $configRequestStatus$$ && ($JSCompiler_StaticMethods_sendConfiguration_$self$$.$configProviderIframes_$.push($iframe$jscomp$2$$), $pubData$jscomp$1$$.requestStatus = 1);
}
$ConfigManager$$module$extensions$amp_addthis$0_1$config_manager$$.prototype.register = function($config$jscomp$3_pubData$jscomp$2$$) {
  var $$jscomp$this$jscomp$4$$ = this, $pubId$jscomp$3$$ = $config$jscomp$3_pubData$jscomp$2$$.pubId, $widgetId$jscomp$3$$ = $config$jscomp$3_pubData$jscomp$2$$.widgetId, $productCode$jscomp$4$$ = $config$jscomp$3_pubData$jscomp$2$$.productCode, $containerClassName$jscomp$2$$ = $config$jscomp$3_pubData$jscomp$2$$.containerClassName, $iframe$jscomp$3$$ = $config$jscomp$3_pubData$jscomp$2$$.iframe, $iframeLoadPromise$$ = $config$jscomp$3_pubData$jscomp$2$$.iframeLoadPromise, $shareConfig$jscomp$2$$ = 
  $config$jscomp$3_pubData$jscomp$2$$.shareConfig, $atConfig$jscomp$2$$ = $config$jscomp$3_pubData$jscomp$2$$.atConfig, $activeToolsMonitor$$ = $config$jscomp$3_pubData$jscomp$2$$.activeToolsMonitor;
  this.$activeToolsMonitor_$ || (this.$activeToolsMonitor_$ = $activeToolsMonitor$$);
  this.$dataForPubId_$[$pubId$jscomp$3$$] || (this.$dataForPubId_$[$pubId$jscomp$3$$] = {});
  $config$jscomp$3_pubData$jscomp$2$$ = this.$dataForPubId_$[$pubId$jscomp$3$$];
  $config$jscomp$3_pubData$jscomp$2$$.requestStatus || ($config$jscomp$3_pubData$jscomp$2$$.requestStatus = 0);
  $config$jscomp$3_pubData$jscomp$2$$.iframeData || ($config$jscomp$3_pubData$jscomp$2$$.iframeData = []);
  $config$jscomp$3_pubData$jscomp$2$$.iframeData.push({iframe:$iframe$jscomp$3$$, shareConfig:$shareConfig$jscomp$2$$, atConfig:$atConfig$jscomp$2$$, widgetId:$widgetId$jscomp$3$$, productCode:$productCode$jscomp$4$$, containerClassName:$containerClassName$jscomp$2$$});
  $iframeLoadPromise$$.then(function() {
    return $JSCompiler_StaticMethods_sendConfiguration_$$($$jscomp$this$jscomp$4$$, {iframe:$iframe$jscomp$3$$, pubId:$pubId$jscomp$3$$, widgetId:$widgetId$jscomp$3$$, shareConfig:$shareConfig$jscomp$2$$, atConfig:$atConfig$jscomp$2$$, productCode:$productCode$jscomp$4$$, containerClassName:$containerClassName$jscomp$2$$});
  });
};
$ConfigManager$$module$extensions$amp_addthis$0_1$config_manager$$.prototype.unregister = function($param$jscomp$7_pubData$jscomp$3$$) {
  var $pubId$jscomp$4$$ = $param$jscomp$7_pubData$jscomp$3$$.pubId, $iframe$jscomp$4$$ = $param$jscomp$7_pubData$jscomp$3$$.iframe;
  this.$configProviderIframes_$ = this.$configProviderIframes_$.filter(function($param$jscomp$7_pubData$jscomp$3$$) {
    return $param$jscomp$7_pubData$jscomp$3$$ !== $iframe$jscomp$4$$;
  });
  $param$jscomp$7_pubData$jscomp$3$$ = this.$dataForPubId_$[$pubId$jscomp$4$$] || {};
  $param$jscomp$7_pubData$jscomp$3$$.iframeData && ($param$jscomp$7_pubData$jscomp$3$$.iframeData = $param$jscomp$7_pubData$jscomp$3$$.iframeData.filter(function($param$jscomp$7_pubData$jscomp$3$$) {
    return $param$jscomp$7_pubData$jscomp$3$$.iframe !== $iframe$jscomp$4$$;
  }));
};
function $DwellMonitor$$module$extensions$amp_addthis$0_1$addthis_utils$monitors$dwell_monitor$$() {
  this.$dwellTime_$ = 0;
  this.$ampdoc_$ = null;
}
$DwellMonitor$$module$extensions$amp_addthis$0_1$addthis_utils$monitors$dwell_monitor$$.prototype.startForDoc = function($ampDoc$jscomp$1$$) {
  this.$ampdoc_$ = $ampDoc$jscomp$1$$;
  this.$ampdoc_$.onVisibilityChanged(this.listener.bind(this));
};
$DwellMonitor$$module$extensions$amp_addthis$0_1$addthis_utils$monitors$dwell_monitor$$.prototype.listener = function() {
  if (!this.$ampdoc_$.isVisible()) {
    var $lastVisibleTime$$ = this.$ampdoc_$.getLastVisibleTime() || 0;
    this.$dwellTime_$ += Date.now() - $lastVisibleTime$$;
  }
};
$DwellMonitor$$module$extensions$amp_addthis$0_1$addthis_utils$monitors$dwell_monitor$$.prototype.getDwellTime = function() {
  return this.$dwellTime_$;
};
function $PostMessageDispatcher$$module$extensions$amp_addthis$0_1$post_message_dispatcher$$() {
  this.$listeners_$ = {};
}
$PostMessageDispatcher$$module$extensions$amp_addthis$0_1$post_message_dispatcher$$.prototype.on = function($eventType$jscomp$7$$, $listener$jscomp$67$$) {
  this.$listeners_$[$eventType$jscomp$7$$] || (this.$listeners_$[$eventType$jscomp$7$$] = []);
  this.$listeners_$[$eventType$jscomp$7$$].push($listener$jscomp$67$$);
};
function $JSCompiler_StaticMethods_emit_$$($JSCompiler_StaticMethods_emit_$self$$, $eventType$jscomp$8$$, $eventData$$) {
  $JSCompiler_StaticMethods_emit_$self$$.$listeners_$[$eventType$jscomp$8$$] && $JSCompiler_StaticMethods_emit_$self$$.$listeners_$[$eventType$jscomp$8$$].forEach(function($JSCompiler_StaticMethods_emit_$self$$) {
    return $JSCompiler_StaticMethods_emit_$self$$($eventData$$);
  });
}
$PostMessageDispatcher$$module$extensions$amp_addthis$0_1$post_message_dispatcher$$.prototype.handleAddThisMessage = function($event$jscomp$10$$) {
  if ("https://s7.addthis.com" === $event$jscomp$10$$.origin && $event$jscomp$10$$.data) {
    var $JSCompiler_data$jscomp$inline_66_JSCompiler_temp$jscomp$145_data$jscomp$79$$ = $event$jscomp$10$$.data;
    if ("[object Object]" !== $toString_$$module$src$types$$.call($JSCompiler_data$jscomp$inline_66_JSCompiler_temp$jscomp$145_data$jscomp$79$$)) {
      if ("string" === typeof $JSCompiler_data$jscomp$inline_66_JSCompiler_temp$jscomp$145_data$jscomp$79$$ && $startsWith$$module$src$string$$($JSCompiler_data$jscomp$inline_66_JSCompiler_temp$jscomp$145_data$jscomp$79$$, "{")) {
        try {
          var $JSCompiler_temp$jscomp$146$$ = JSON.parse($JSCompiler_data$jscomp$inline_66_JSCompiler_temp$jscomp$145_data$jscomp$79$$);
        } catch ($JSCompiler_e$jscomp$inline_166$$) {
          $JSCompiler_temp$jscomp$146$$ = null;
        }
      } else {
        $JSCompiler_temp$jscomp$146$$ = void 0;
      }
      $JSCompiler_data$jscomp$inline_66_JSCompiler_temp$jscomp$145_data$jscomp$79$$ = $JSCompiler_temp$jscomp$146$$;
    }
    $JSCompiler_data$jscomp$inline_66_JSCompiler_temp$jscomp$145_data$jscomp$79$$ = $JSCompiler_data$jscomp$inline_66_JSCompiler_temp$jscomp$145_data$jscomp$79$$ || {};
    switch($JSCompiler_data$jscomp$inline_66_JSCompiler_temp$jscomp$145_data$jscomp$79$$.event) {
      case "addthis.amp.configuration":
        $JSCompiler_StaticMethods_emit_$$(this, "addthis.amp.configuration", Object.assign({}, $JSCompiler_data$jscomp$inline_66_JSCompiler_temp$jscomp$145_data$jscomp$79$$, {source:$event$jscomp$10$$.source}));
        break;
      case "addthis.share":
        $JSCompiler_StaticMethods_emit_$$(this, "addthis.share", $JSCompiler_data$jscomp$inline_66_JSCompiler_temp$jscomp$145_data$jscomp$79$$);
    }
  }
};
function $LruCache$$module$src$utils$lru_cache$$() {
  this.$capacity_$ = 100;
  this.$access_$ = this.$size_$ = 0;
  this.$cache_$ = Object.create(null);
}
$LruCache$$module$src$utils$lru_cache$$.prototype.has = function($key$jscomp$48$$) {
  return !!this.$cache_$[$key$jscomp$48$$];
};
$LruCache$$module$src$utils$lru_cache$$.prototype.get = function($key$jscomp$49$$) {
  var $cacheable$$ = this.$cache_$[$key$jscomp$49$$];
  if ($cacheable$$) {
    return $cacheable$$.access = ++this.$access_$, $cacheable$$.payload;
  }
};
$LruCache$$module$src$utils$lru_cache$$.prototype.put = function($JSCompiler_cache$jscomp$inline_69_JSCompiler_inline_result$jscomp$142_key$jscomp$50$$, $payload$$) {
  this.has($JSCompiler_cache$jscomp$inline_69_JSCompiler_inline_result$jscomp$142_key$jscomp$50$$) || this.$size_$++;
  this.$cache_$[$JSCompiler_cache$jscomp$inline_69_JSCompiler_inline_result$jscomp$142_key$jscomp$50$$] = {payload:$payload$$, access:this.$access_$};
  if (!(this.$size_$ <= this.$capacity_$)) {
    if ($logs$$module$src$log$$.dev) {
      $JSCompiler_cache$jscomp$inline_69_JSCompiler_inline_result$jscomp$142_key$jscomp$50$$ = $logs$$module$src$log$$.dev;
    } else {
      throw Error("failed to call initLogConstructor");
    }
    $JSCompiler_cache$jscomp$inline_69_JSCompiler_inline_result$jscomp$142_key$jscomp$50$$.warn("lru-cache", "Trimming LRU cache");
    $JSCompiler_cache$jscomp$inline_69_JSCompiler_inline_result$jscomp$142_key$jscomp$50$$ = this.$cache_$;
    var $JSCompiler_oldest$jscomp$inline_70$$ = this.$access_$ + 1, $JSCompiler_key$jscomp$inline_72$$;
    for ($JSCompiler_key$jscomp$inline_72$$ in $JSCompiler_cache$jscomp$inline_69_JSCompiler_inline_result$jscomp$142_key$jscomp$50$$) {
      var $JSCompiler_access$jscomp$inline_73$$ = $JSCompiler_cache$jscomp$inline_69_JSCompiler_inline_result$jscomp$142_key$jscomp$50$$[$JSCompiler_key$jscomp$inline_72$$].access;
      if ($JSCompiler_access$jscomp$inline_73$$ < $JSCompiler_oldest$jscomp$inline_70$$) {
        $JSCompiler_oldest$jscomp$inline_70$$ = $JSCompiler_access$jscomp$inline_73$$;
        var $JSCompiler_oldestKey$jscomp$inline_71$$ = $JSCompiler_key$jscomp$inline_72$$;
      }
    }
    void 0 !== $JSCompiler_oldestKey$jscomp$inline_71$$ && (delete $JSCompiler_cache$jscomp$inline_69_JSCompiler_inline_result$jscomp$142_key$jscomp$50$$[$JSCompiler_oldestKey$jscomp$inline_71$$], this.$size_$--);
  }
};
$dict$$module$src$utils$object$$({c:!0, v:!0, a:!0, ad:!0, action:!0});
var $a$$module$src$url$$, $cache$$module$src$url$$;
function $parseUrlDeprecated$$module$src$url$$($JSCompiler_inline_result$jscomp$27_url$jscomp$25$$) {
  $a$$module$src$url$$ || ($a$$module$src$url$$ = self.document.createElement("a"), $cache$$module$src$url$$ = self.__AMP_URL_CACHE || (self.__AMP_URL_CACHE = new $LruCache$$module$src$utils$lru_cache$$));
  var $JSCompiler_opt_cache$jscomp$inline_76$$ = $cache$$module$src$url$$, $JSCompiler_a$jscomp$inline_77$$ = $a$$module$src$url$$;
  if ($JSCompiler_opt_cache$jscomp$inline_76$$ && $JSCompiler_opt_cache$jscomp$inline_76$$.has($JSCompiler_inline_result$jscomp$27_url$jscomp$25$$)) {
    $JSCompiler_inline_result$jscomp$27_url$jscomp$25$$ = $JSCompiler_opt_cache$jscomp$inline_76$$.get($JSCompiler_inline_result$jscomp$27_url$jscomp$25$$);
  } else {
    $JSCompiler_a$jscomp$inline_77$$.href = $JSCompiler_inline_result$jscomp$27_url$jscomp$25$$;
    $JSCompiler_a$jscomp$inline_77$$.protocol || ($JSCompiler_a$jscomp$inline_77$$.href = $JSCompiler_a$jscomp$inline_77$$.href);
    var $JSCompiler_info$jscomp$inline_78$$ = {href:$JSCompiler_a$jscomp$inline_77$$.href, protocol:$JSCompiler_a$jscomp$inline_77$$.protocol, host:$JSCompiler_a$jscomp$inline_77$$.host, hostname:$JSCompiler_a$jscomp$inline_77$$.hostname, port:"0" == $JSCompiler_a$jscomp$inline_77$$.port ? "" : $JSCompiler_a$jscomp$inline_77$$.port, pathname:$JSCompiler_a$jscomp$inline_77$$.pathname, search:$JSCompiler_a$jscomp$inline_77$$.search, hash:$JSCompiler_a$jscomp$inline_77$$.hash, origin:null};
    "/" !== $JSCompiler_info$jscomp$inline_78$$.pathname[0] && ($JSCompiler_info$jscomp$inline_78$$.pathname = "/" + $JSCompiler_info$jscomp$inline_78$$.pathname);
    if ("http:" == $JSCompiler_info$jscomp$inline_78$$.protocol && 80 == $JSCompiler_info$jscomp$inline_78$$.port || "https:" == $JSCompiler_info$jscomp$inline_78$$.protocol && 443 == $JSCompiler_info$jscomp$inline_78$$.port) {
      $JSCompiler_info$jscomp$inline_78$$.port = "", $JSCompiler_info$jscomp$inline_78$$.host = $JSCompiler_info$jscomp$inline_78$$.hostname;
    }
    $JSCompiler_info$jscomp$inline_78$$.origin = $JSCompiler_a$jscomp$inline_77$$.origin && "null" != $JSCompiler_a$jscomp$inline_77$$.origin ? $JSCompiler_a$jscomp$inline_77$$.origin : "data:" != $JSCompiler_info$jscomp$inline_78$$.protocol && $JSCompiler_info$jscomp$inline_78$$.host ? $JSCompiler_info$jscomp$inline_78$$.protocol + "//" + $JSCompiler_info$jscomp$inline_78$$.host : $JSCompiler_info$jscomp$inline_78$$.href;
    $JSCompiler_opt_cache$jscomp$inline_76$$ && $JSCompiler_opt_cache$jscomp$inline_76$$.put($JSCompiler_inline_result$jscomp$27_url$jscomp$25$$, $JSCompiler_info$jscomp$inline_78$$);
    $JSCompiler_inline_result$jscomp$27_url$jscomp$25$$ = $JSCompiler_info$jscomp$inline_78$$;
  }
  return $JSCompiler_inline_result$jscomp$27_url$jscomp$25$$;
}
function $appendEncodedParamStringToUrl$$module$src$url$$($url$jscomp$27$$, $paramString$$) {
  if (!$paramString$$) {
    return $url$jscomp$27$$;
  }
  var $mainAndFragment$$ = $url$jscomp$27$$.split("#", 2), $mainAndQuery$$ = $mainAndFragment$$[0].split("?", 2), $newUrl$$ = $mainAndQuery$$[0] + ($mainAndQuery$$[1] ? "?" + $mainAndQuery$$[1] + "&" + $paramString$$ : "?" + $paramString$$);
  return $newUrl$$ += $mainAndFragment$$[1] ? "#" + $mainAndFragment$$[1] : "";
}
function $serializeQueryString$$module$src$url$$($params$jscomp$5$$) {
  var $s$jscomp$8$$ = [], $k$jscomp$4$$;
  for ($k$jscomp$4$$ in $params$jscomp$5$$) {
    var $sv$6_v$jscomp$1$$ = $params$jscomp$5$$[$k$jscomp$4$$];
    if (null != $sv$6_v$jscomp$1$$) {
      if (Array.isArray($sv$6_v$jscomp$1$$)) {
        for (var $i$jscomp$17$$ = 0; $i$jscomp$17$$ < $sv$6_v$jscomp$1$$.length; $i$jscomp$17$$++) {
          var $sv$$ = $sv$6_v$jscomp$1$$[$i$jscomp$17$$];
          $s$jscomp$8$$.push(encodeURIComponent($k$jscomp$4$$) + "=" + encodeURIComponent($sv$$));
        }
      } else {
        $s$jscomp$8$$.push(encodeURIComponent($k$jscomp$4$$) + "=" + encodeURIComponent($sv$6_v$jscomp$1$$));
      }
    }
  }
  return $s$jscomp$8$$.join("&");
}
;function $getService$$module$src$service$$($win$jscomp$31$$, $id$jscomp$13$$) {
  $win$jscomp$31$$ = $win$jscomp$31$$.__AMP_TOP || ($win$jscomp$31$$.__AMP_TOP = $win$jscomp$31$$);
  return $getServiceInternal$$module$src$service$$($win$jscomp$31$$, $id$jscomp$13$$);
}
function $getServiceForDoc$$module$src$service$$($elementOrAmpDoc$$, $id$jscomp$17$$) {
  var $JSCompiler_ampdoc$jscomp$inline_81_JSCompiler_inline_result$jscomp$28_ampdoc$jscomp$3$$ = $getAmpdoc$$module$src$service$$($elementOrAmpDoc$$);
  $JSCompiler_ampdoc$jscomp$inline_81_JSCompiler_inline_result$jscomp$28_ampdoc$jscomp$3$$ = $getAmpdoc$$module$src$service$$($JSCompiler_ampdoc$jscomp$inline_81_JSCompiler_inline_result$jscomp$28_ampdoc$jscomp$3$$);
  $JSCompiler_ampdoc$jscomp$inline_81_JSCompiler_inline_result$jscomp$28_ampdoc$jscomp$3$$ = $JSCompiler_ampdoc$jscomp$inline_81_JSCompiler_inline_result$jscomp$28_ampdoc$jscomp$3$$.isSingleDoc() ? $JSCompiler_ampdoc$jscomp$inline_81_JSCompiler_inline_result$jscomp$28_ampdoc$jscomp$3$$.win : $JSCompiler_ampdoc$jscomp$inline_81_JSCompiler_inline_result$jscomp$28_ampdoc$jscomp$3$$;
  return $getServiceInternal$$module$src$service$$($JSCompiler_ampdoc$jscomp$inline_81_JSCompiler_inline_result$jscomp$28_ampdoc$jscomp$3$$, $id$jscomp$17$$);
}
function $getAmpdoc$$module$src$service$$($nodeOrDoc$jscomp$2$$) {
  return $nodeOrDoc$jscomp$2$$.nodeType ? $getService$$module$src$service$$(($nodeOrDoc$jscomp$2$$.ownerDocument || $nodeOrDoc$jscomp$2$$).defaultView, "ampdoc").getAmpDoc($nodeOrDoc$jscomp$2$$) : $nodeOrDoc$jscomp$2$$;
}
function $getServiceInternal$$module$src$service$$($holder$jscomp$4_s$jscomp$9$$, $id$jscomp$21$$) {
  var $JSCompiler_services$jscomp$inline_88$$ = $holder$jscomp$4_s$jscomp$9$$.__AMP_SERVICES;
  $JSCompiler_services$jscomp$inline_88$$ || ($JSCompiler_services$jscomp$inline_88$$ = $holder$jscomp$4_s$jscomp$9$$.__AMP_SERVICES = {});
  $holder$jscomp$4_s$jscomp$9$$ = $JSCompiler_services$jscomp$inline_88$$[$id$jscomp$21$$];
  $holder$jscomp$4_s$jscomp$9$$.obj || ($holder$jscomp$4_s$jscomp$9$$.obj = new $holder$jscomp$4_s$jscomp$9$$.ctor($holder$jscomp$4_s$jscomp$9$$.context), $holder$jscomp$4_s$jscomp$9$$.ctor = null, $holder$jscomp$4_s$jscomp$9$$.context = null, $holder$jscomp$4_s$jscomp$9$$.resolve && $holder$jscomp$4_s$jscomp$9$$.resolve($holder$jscomp$4_s$jscomp$9$$.obj));
  return $holder$jscomp$4_s$jscomp$9$$.obj;
}
;function $ScrollMonitor$$module$extensions$amp_addthis$0_1$addthis_utils$monitors$scroll_monitor$$() {
  this.$viewport_$ = null;
  this.$maxScrollPlusHeight_$ = this.$maxScrollTop_$ = this.$initialViewHeight_$ = 0;
}
$ScrollMonitor$$module$extensions$amp_addthis$0_1$addthis_utils$monitors$scroll_monitor$$.prototype.startForDoc = function($ampDoc$jscomp$2$$) {
  this.$viewport_$ = $getServiceForDoc$$module$src$service$$($ampDoc$jscomp$2$$, "viewport");
  this.$initialViewHeight_$ = this.$viewport_$.getHeight() || 0;
  this.$maxScrollTop_$ = this.$viewport_$.getScrollTop() || 0;
  this.$maxScrollPlusHeight_$ = this.$maxScrollTop_$ + this.$initialViewHeight_$;
  this.$viewport_$.onScroll(this.listener.bind(this));
};
$ScrollMonitor$$module$extensions$amp_addthis$0_1$addthis_utils$monitors$scroll_monitor$$.prototype.listener = function() {
  var $scrollTop$$ = this.$viewport_$.getScrollTop() || 0;
  this.$maxScrollTop_$ = Math.max(this.$maxScrollTop_$, $scrollTop$$);
  this.$maxScrollPlusHeight_$ = Math.max(this.$maxScrollPlusHeight_$, (this.$viewport_$.getHeight() || 0) + $scrollTop$$);
};
$ScrollMonitor$$module$extensions$amp_addthis$0_1$addthis_utils$monitors$scroll_monitor$$.prototype.getInitialViewHeight = function() {
  return this.$initialViewHeight_$;
};
$ScrollMonitor$$module$extensions$amp_addthis$0_1$addthis_utils$monitors$scroll_monitor$$.prototype.getScrollHeight = function() {
  return this.$maxScrollPlusHeight_$ - this.$maxScrollTop_$;
};
var $RE_CUID$$module$extensions$amp_addthis$0_1$addthis_utils$cuid$$ = /^[0-9a-f]{16}$/, $CUID_SESSION_TIME$$module$extensions$amp_addthis$0_1$addthis_utils$cuid$$ = Date.now();
var $sessionId$$module$extensions$amp_addthis$0_1$addthis_utils$session$$ = function() {
  return ($CUID_SESSION_TIME$$module$extensions$amp_addthis$0_1$addthis_utils$cuid$$ / 1000 & 4294967295).toString(16) + ("00000000" + Math.floor(4294967296 * Math.random()).toString(16)).slice(-8);
}();
var $propertyNameCache$$module$src$style$$, $vendorPrefixes$$module$src$style$$ = "Webkit webkit Moz moz ms O o".split(" ");
function $setStyle$$module$src$style$$($element$jscomp$68$$, $JSCompiler_inline_result$jscomp$31_property$jscomp$7_propertyName$jscomp$10$$, $value$jscomp$100$$) {
  var $JSCompiler_style$jscomp$inline_90$$ = $element$jscomp$68$$.style;
  if (!$startsWith$$module$src$string$$($JSCompiler_inline_result$jscomp$31_property$jscomp$7_propertyName$jscomp$10$$, "--")) {
    $propertyNameCache$$module$src$style$$ || ($propertyNameCache$$module$src$style$$ = Object.create(null));
    var $JSCompiler_propertyName$jscomp$inline_93$$ = $propertyNameCache$$module$src$style$$[$JSCompiler_inline_result$jscomp$31_property$jscomp$7_propertyName$jscomp$10$$];
    if (!$JSCompiler_propertyName$jscomp$inline_93$$) {
      $JSCompiler_propertyName$jscomp$inline_93$$ = $JSCompiler_inline_result$jscomp$31_property$jscomp$7_propertyName$jscomp$10$$;
      if (void 0 === $JSCompiler_style$jscomp$inline_90$$[$JSCompiler_inline_result$jscomp$31_property$jscomp$7_propertyName$jscomp$10$$]) {
        var $JSCompiler_inline_result$jscomp$147_JSCompiler_inline_result$jscomp$148_JSCompiler_prefixedPropertyName$jscomp$inline_95$$ = $JSCompiler_inline_result$jscomp$31_property$jscomp$7_propertyName$jscomp$10$$.charAt(0).toUpperCase() + $JSCompiler_inline_result$jscomp$31_property$jscomp$7_propertyName$jscomp$10$$.slice(1);
        b: {
          for (var $JSCompiler_i$jscomp$inline_175$$ = 0; $JSCompiler_i$jscomp$inline_175$$ < $vendorPrefixes$$module$src$style$$.length; $JSCompiler_i$jscomp$inline_175$$++) {
            var $JSCompiler_propertyName$jscomp$inline_176$$ = $vendorPrefixes$$module$src$style$$[$JSCompiler_i$jscomp$inline_175$$] + $JSCompiler_inline_result$jscomp$147_JSCompiler_inline_result$jscomp$148_JSCompiler_prefixedPropertyName$jscomp$inline_95$$;
            if (void 0 !== $JSCompiler_style$jscomp$inline_90$$[$JSCompiler_propertyName$jscomp$inline_176$$]) {
              $JSCompiler_inline_result$jscomp$147_JSCompiler_inline_result$jscomp$148_JSCompiler_prefixedPropertyName$jscomp$inline_95$$ = $JSCompiler_propertyName$jscomp$inline_176$$;
              break b;
            }
          }
          $JSCompiler_inline_result$jscomp$147_JSCompiler_inline_result$jscomp$148_JSCompiler_prefixedPropertyName$jscomp$inline_95$$ = "";
        }
        void 0 !== $JSCompiler_style$jscomp$inline_90$$[$JSCompiler_inline_result$jscomp$147_JSCompiler_inline_result$jscomp$148_JSCompiler_prefixedPropertyName$jscomp$inline_95$$] && ($JSCompiler_propertyName$jscomp$inline_93$$ = $JSCompiler_inline_result$jscomp$147_JSCompiler_inline_result$jscomp$148_JSCompiler_prefixedPropertyName$jscomp$inline_95$$);
      }
      $propertyNameCache$$module$src$style$$[$JSCompiler_inline_result$jscomp$31_property$jscomp$7_propertyName$jscomp$10$$] = $JSCompiler_propertyName$jscomp$inline_93$$;
    }
    $JSCompiler_inline_result$jscomp$31_property$jscomp$7_propertyName$jscomp$10$$ = $JSCompiler_propertyName$jscomp$inline_93$$;
  }
  $JSCompiler_inline_result$jscomp$31_property$jscomp$7_propertyName$jscomp$10$$ && ($startsWith$$module$src$string$$($JSCompiler_inline_result$jscomp$31_property$jscomp$7_propertyName$jscomp$10$$, "--") ? $element$jscomp$68$$.style.setProperty($JSCompiler_inline_result$jscomp$31_property$jscomp$7_propertyName$jscomp$10$$, $value$jscomp$100$$) : $element$jscomp$68$$.style[$JSCompiler_inline_result$jscomp$31_property$jscomp$7_propertyName$jscomp$10$$] = $value$jscomp$100$$);
}
;var $RE_IFRAME$$module$extensions$amp_addthis$0_1$addthis_utils$pixel$$ = /#iframe$/;
function $groupPixelsByTime$$module$extensions$amp_addthis$0_1$addthis_utils$pixel$$($pixelList$$) {
  var $delayMap$$ = $pixelList$$.map(function($pixelList$$) {
    var $delayMap$$ = $pixelList$$.delay;
    return Object.assign({}, $pixelList$$, {delay:Array.isArray($delayMap$$) && $delayMap$$.length ? $delayMap$$ : [0]});
  }).map(function($pixelList$$) {
    return $pixelList$$.delay.map(function($delayMap$$) {
      return {delay:$delayMap$$, pixels:[$pixelList$$]};
    });
  }).reduce(function($pixelList$$, $delayMap$$) {
    return $pixelList$$.concat($delayMap$$);
  }, []).reduce(function($pixelList$$, $delayMap$$) {
    var $currentDelayMap$$ = $delayMap$$.delay, $curDelay$$ = $delayMap$$.pixels;
    $pixelList$$[$currentDelayMap$$] || ($pixelList$$[$currentDelayMap$$] = []);
    $pixelList$$[$currentDelayMap$$] = $pixelList$$[$currentDelayMap$$].concat($curDelay$$);
    return $pixelList$$;
  }, {});
  return Object.keys($delayMap$$).map(function($pixelList$$) {
    return {delay:Number($pixelList$$), pixels:$delayMap$$[$pixelList$$]};
  });
}
function $pixelDrop$$module$extensions$amp_addthis$0_1$addthis_utils$pixel$$($url$jscomp$45$$, $ampDoc$jscomp$3_doc$jscomp$6$$) {
  $ampDoc$jscomp$3_doc$jscomp$6$$ = $ampDoc$jscomp$3_doc$jscomp$6$$.win.document;
  var $ampPixel$$ = $createElementWithAttributes$$module$src$dom$$($ampDoc$jscomp$3_doc$jscomp$6$$, "amp-pixel", $dict$$module$src$utils$object$$({layout:"nodisplay", referrerpolicy:"no-referrer", src:$url$jscomp$45$$}));
  $ampDoc$jscomp$3_doc$jscomp$6$$.body.appendChild($ampPixel$$);
}
function $dropPixelGroups$$module$extensions$amp_addthis$0_1$addthis_utils$pixel$$($pixels$jscomp$2$$, $options$jscomp$35$$) {
  var $sid$$ = $options$jscomp$35$$.sid, $ampDoc$jscomp$6$$ = $options$jscomp$35$$.ampDoc;
  $groupPixelsByTime$$module$extensions$amp_addthis$0_1$addthis_utils$pixel$$($pixels$jscomp$2$$).forEach(function($pixels$jscomp$2$$) {
    var $options$jscomp$35$$ = $pixels$jscomp$2$$.delay, $pixelGroup$$ = $pixels$jscomp$2$$.pixels;
    setTimeout(function() {
      var $pixels$jscomp$2$$ = $pixelGroup$$.map(function($pixels$jscomp$2$$) {
        var $options$jscomp$35$$ = $pixels$jscomp$2$$.url, $sid$$ = $RE_IFRAME$$module$extensions$amp_addthis$0_1$addthis_utils$pixel$$.test($options$jscomp$35$$);
        if (-1 !== $options$jscomp$35$$.indexOf("//")) {
          if ($sid$$) {
            var $pixelGroup$$ = $parseUrlDeprecated$$module$src$url$$($options$jscomp$35$$).host.split(".").concat("pxltr frame".replace(/\s/, "_"));
            $sid$$ = $ampDoc$jscomp$6$$.win.document;
            $options$jscomp$35$$ = $createElementWithAttributes$$module$src$dom$$($sid$$, "iframe", $dict$$module$src$utils$object$$({frameborder:0, width:0, height:0, name:$pixelGroup$$, title:"Pxltr Frame", src:$options$jscomp$35$$}));
            $pixelGroup$$ = !1;
            void 0 === $pixelGroup$$ && ($pixelGroup$$ = $options$jscomp$35$$.hasAttribute("hidden"));
            $pixelGroup$$ ? $options$jscomp$35$$.removeAttribute("hidden") : $options$jscomp$35$$.setAttribute("hidden", "");
            $pixelGroup$$ = {position:"absolute", clip:"rect(0px 0px 0px 0px)"};
            for (var $delay$jscomp$4$$ in $pixelGroup$$) {
              $setStyle$$module$src$style$$($options$jscomp$35$$, $delay$jscomp$4$$, $pixelGroup$$[$delay$jscomp$4$$]);
            }
            $sid$$.body.appendChild($options$jscomp$35$$);
          } else {
            $pixelDrop$$module$extensions$amp_addthis$0_1$addthis_utils$pixel$$($options$jscomp$35$$, $ampDoc$jscomp$6$$);
          }
        }
        return $pixels$jscomp$2$$.id;
      }), $delay$jscomp$4$$ = $dict$$module$src$utils$object$$({delay:"" + $options$jscomp$35$$, ids:$pixels$jscomp$2$$.join("-"), sid:$sid$$});
      $delay$jscomp$4$$ = $appendEncodedParamStringToUrl$$module$src$url$$("https://m.addthisedge.com/live/prender", $serializeQueryString$$module$src$url$$($delay$jscomp$4$$));
      $ampDoc$jscomp$6$$.win.navigator.sendBeacon ? $ampDoc$jscomp$6$$.win.navigator.sendBeacon($delay$jscomp$4$$, "{}") : $pixelDrop$$module$extensions$amp_addthis$0_1$addthis_utils$pixel$$($delay$jscomp$4$$, $ampDoc$jscomp$6$$);
    }, 1000 * $options$jscomp$35$$);
  });
}
function $getJsonObject_$$module$extensions$amp_addthis$0_1$addthis_utils$pixel$$($object$jscomp$1$$) {
  var $params$jscomp$7$$ = {};
  if (void 0 === $object$jscomp$1$$ || null === $object$jscomp$1$$) {
    return $params$jscomp$7$$;
  }
  var $stringifiedObject$$ = "string" === typeof $object$jscomp$1$$ ? $object$jscomp$1$$ : JSON.stringify($object$jscomp$1$$);
  try {
    var $parsedObject$$ = JSON.parse($stringifiedObject$$);
    if ("[object Object]" === $toString_$$module$src$types$$.call($parsedObject$$)) {
      for (var $key$jscomp$53$$ in $parsedObject$$) {
        $params$jscomp$7$$[$key$jscomp$53$$] = $parsedObject$$[$key$jscomp$53$$];
      }
    }
  } catch ($error$jscomp$14$$) {
  }
  return $params$jscomp$7$$;
}
function $callPixelEndpoint$$module$extensions$amp_addthis$0_1$addthis_utils$pixel$$($event$jscomp$11_url$jscomp$50$$) {
  var $ampDoc$jscomp$7$$ = $event$jscomp$11_url$jscomp$50$$.ampDoc, $endpoint$$ = $event$jscomp$11_url$jscomp$50$$.endpoint, $eventData$jscomp$1$$ = $getJsonObject_$$module$extensions$amp_addthis$0_1$addthis_utils$pixel$$($event$jscomp$11_url$jscomp$50$$.data);
  $event$jscomp$11_url$jscomp$50$$ = $appendEncodedParamStringToUrl$$module$src$url$$($endpoint$$, $serializeQueryString$$module$src$url$$($eventData$jscomp$1$$));
  $getService$$module$src$service$$($ampDoc$jscomp$7$$.win, "xhr").fetchJson($event$jscomp$11_url$jscomp$50$$, {mode:"cors", method:"GET", ampCors:!1, credentials:"include"}).then(function($event$jscomp$11_url$jscomp$50$$) {
    return $event$jscomp$11_url$jscomp$50$$.json();
  }).then(function($event$jscomp$11_url$jscomp$50$$) {
    $event$jscomp$11_url$jscomp$50$$ = void 0 === $event$jscomp$11_url$jscomp$50$$.pixels ? [] : $event$jscomp$11_url$jscomp$50$$.pixels;
    0 < $event$jscomp$11_url$jscomp$50$$.length && $dropPixelGroups$$module$extensions$amp_addthis$0_1$addthis_utils$pixel$$($event$jscomp$11_url$jscomp$50$$, {sid:$eventData$jscomp$1$$.sid, ampDoc:$ampDoc$jscomp$7$$});
  }, function() {
  });
}
;function $getDetailsForMeta$$module$extensions$amp_addthis$0_1$addthis_utils$meta$$($meta$jscomp$1$$) {
  return {name:($meta$jscomp$1$$.getAttribute("property") || $meta$jscomp$1$$.name || "").toLowerCase(), content:$meta$jscomp$1$$.content || ""};
}
;function $rot13$$module$extensions$amp_addthis$0_1$addthis_utils$rot13$$($input$jscomp$10$$) {
  return $input$jscomp$10$$.replace($RE_ALPHA$$module$extensions$amp_addthis$0_1$constants$$, function($input$jscomp$10$$) {
    $input$jscomp$10$$ = $input$jscomp$10$$.charCodeAt(0);
    return String.fromCharCode((90 >= $input$jscomp$10$$ ? 90 : 122) >= $input$jscomp$10$$ + 13 ? $input$jscomp$10$$ + 13 : $input$jscomp$10$$ - 13);
  });
}
function $rot13Array$$module$extensions$amp_addthis$0_1$addthis_utils$rot13$$($input$jscomp$11$$) {
  return $input$jscomp$11$$.reduce(function($input$jscomp$11$$, $str$jscomp$10$$) {
    $input$jscomp$11$$[$rot13$$module$extensions$amp_addthis$0_1$addthis_utils$rot13$$($str$jscomp$10$$)] = 1;
    return $input$jscomp$11$$;
  }, {});
}
;var $RE_SEARCH_TERMS$$module$extensions$amp_addthis$0_1$addthis_utils$classify$$ = /^(?:q|search|bs|wd|p|kw|keyword|query|qry|querytext|text|searchcriteria|searchstring|searchtext|sp_q)=(.*)/i, $RE_SEARCH_REFERRER$$module$extensions$amp_addthis$0_1$addthis_utils$classify$$ = /ws\/results\/(web|images|video|news)/, $RE_SEARCH_GOOGLE$$module$extensions$amp_addthis$0_1$addthis_utils$classify$$ = /google.*\/(search|url|aclk|m\?)/, $RE_SEARCH_AOL$$module$extensions$amp_addthis$0_1$addthis_utils$classify$$ = 
/aol.*\/aol/, $pornHash$$module$extensions$amp_addthis$0_1$addthis_utils$classify$$ = $rot13Array$$module$extensions$amp_addthis$0_1$addthis_utils$rot13$$("cbea cbeab kkk zvys gvgf shpxf chfflyvcf pernzcvr svfgvat wvmm fcybbtr flovna".split(" ")), $strictPornHash$$module$extensions$amp_addthis$0_1$addthis_utils$classify$$ = $rot13Array$$module$extensions$amp_addthis$0_1$addthis_utils$rot13$$(["phz"]);
function $classifyString$$module$extensions$amp_addthis$0_1$addthis_utils$classify$$($keywordString$$, $nonStrictMatch$$) {
  $keywordString$$ = void 0 === $keywordString$$ ? "" : $keywordString$$;
  $nonStrictMatch$$ = void 0 === $nonStrictMatch$$ ? !1 : $nonStrictMatch$$;
  for (var $classification$$ = 0, $keywords$$ = $keywordString$$.toLowerCase().split($RE_NONALPHA$$module$extensions$amp_addthis$0_1$constants$$), $i$jscomp$24$$ = 0; $i$jscomp$24$$ < $keywords$$.length; $i$jscomp$24$$++) {
    var $keyword$$ = $keywords$$[$i$jscomp$24$$];
    if ($pornHash$$module$extensions$amp_addthis$0_1$addthis_utils$classify$$[$keyword$$] || !$nonStrictMatch$$ && $strictPornHash$$module$extensions$amp_addthis$0_1$addthis_utils$classify$$[$keyword$$]) {
      $classification$$ |= 1;
      break;
    }
  }
  return $classification$$;
}
function $classifyPage$$module$extensions$amp_addthis$0_1$addthis_utils$classify$$($pageInfo$$, $metaElements$$) {
  var $bitmask$$ = $classifyString$$module$extensions$amp_addthis$0_1$addthis_utils$classify$$($pageInfo$$.title) | $classifyString$$module$extensions$amp_addthis$0_1$addthis_utils$classify$$($pageInfo$$.hostname, !0);
  $metaElements$$.forEach(function($pageInfo$$) {
    var $metaElements$$ = $getDetailsForMeta$$module$extensions$amp_addthis$0_1$addthis_utils$meta$$($pageInfo$$), $metaElement$$ = $metaElements$$.name;
    $metaElements$$ = $metaElements$$.content;
    if ("description" === $metaElement$$ || "keywords" === $metaElement$$) {
      $bitmask$$ |= $classifyString$$module$extensions$amp_addthis$0_1$addthis_utils$classify$$($metaElements$$);
    }
    if ("rating" === $metaElement$$) {
      $metaElement$$ = $bitmask$$;
      var $JSCompiler_classification$jscomp$inline_103$$ = 0;
      $metaElements$$ = (void 0 === $metaElements$$ ? "" : $metaElements$$).toLowerCase().replace($RE_WHITESPACE$$module$extensions$amp_addthis$0_1$constants$$, "");
      if ("mature" === $metaElements$$ || "adult" === $metaElements$$ || "rta-5042-1996-1400-1577-rta" === $metaElements$$) {
        $JSCompiler_classification$jscomp$inline_103$$ |= 1;
      }
      $bitmask$$ = $metaElement$$ | $JSCompiler_classification$jscomp$inline_103$$;
    }
  });
  return $bitmask$$;
}
function $classifyReferrer$$module$extensions$amp_addthis$0_1$addthis_utils$classify$$($referrerString$$, $parsedReferrer$$, $parsedHref$$) {
  var $bitmask$jscomp$1$$ = 0;
  if ($referrerString$$ && $parsedReferrer$$) {
    $bitmask$jscomp$1$$ = $parsedReferrer$$.host === $parsedHref$$.host ? $bitmask$jscomp$1$$ | 2 : $bitmask$jscomp$1$$ | 4;
    var $JSCompiler_inline_result$jscomp$151_JSCompiler_terms$jscomp$inline_185_JSCompiler_url$jscomp$inline_105$$ = $referrerString$$;
    $JSCompiler_inline_result$jscomp$151_JSCompiler_terms$jscomp$inline_185_JSCompiler_url$jscomp$inline_105$$ = void 0 === $JSCompiler_inline_result$jscomp$151_JSCompiler_terms$jscomp$inline_185_JSCompiler_url$jscomp$inline_105$$ ? "" : $JSCompiler_inline_result$jscomp$151_JSCompiler_terms$jscomp$inline_185_JSCompiler_url$jscomp$inline_105$$;
    var $JSCompiler_lowerUrl$jscomp$inline_106_JSCompiler_temp$jscomp$150$$ = $JSCompiler_inline_result$jscomp$151_JSCompiler_terms$jscomp$inline_185_JSCompiler_url$jscomp$inline_105$$.toLowerCase();
    if ($JSCompiler_lowerUrl$jscomp$inline_106_JSCompiler_temp$jscomp$150$$.match($RE_SEARCH_REFERRER$$module$extensions$amp_addthis$0_1$addthis_utils$classify$$)) {
      $JSCompiler_lowerUrl$jscomp$inline_106_JSCompiler_temp$jscomp$150$$ = !0;
    } else {
      a: {
        $JSCompiler_inline_result$jscomp$151_JSCompiler_terms$jscomp$inline_185_JSCompiler_url$jscomp$inline_105$$ = $JSCompiler_inline_result$jscomp$151_JSCompiler_terms$jscomp$inline_185_JSCompiler_url$jscomp$inline_105$$.split("?").pop().toLowerCase().split("&");
        for (var $JSCompiler_matches$jscomp$inline_186$$, $JSCompiler_i$jscomp$inline_187$$ = 0; $JSCompiler_i$jscomp$inline_187$$ < $JSCompiler_inline_result$jscomp$151_JSCompiler_terms$jscomp$inline_185_JSCompiler_url$jscomp$inline_105$$.length; $JSCompiler_i$jscomp$inline_187$$++) {
          if ($JSCompiler_matches$jscomp$inline_186$$ = $RE_SEARCH_TERMS$$module$extensions$amp_addthis$0_1$addthis_utils$classify$$.exec($JSCompiler_inline_result$jscomp$151_JSCompiler_terms$jscomp$inline_185_JSCompiler_url$jscomp$inline_105$$[$JSCompiler_i$jscomp$inline_187$$])) {
            $JSCompiler_inline_result$jscomp$151_JSCompiler_terms$jscomp$inline_185_JSCompiler_url$jscomp$inline_105$$ = $JSCompiler_matches$jscomp$inline_186$$[1];
            break a;
          }
        }
        $JSCompiler_inline_result$jscomp$151_JSCompiler_terms$jscomp$inline_185_JSCompiler_url$jscomp$inline_105$$ = void 0;
      }
      $JSCompiler_lowerUrl$jscomp$inline_106_JSCompiler_temp$jscomp$150$$ = void 0 === $JSCompiler_inline_result$jscomp$151_JSCompiler_terms$jscomp$inline_185_JSCompiler_url$jscomp$inline_105$$ ? !1 : -1 === $JSCompiler_lowerUrl$jscomp$inline_106_JSCompiler_temp$jscomp$150$$.indexOf("addthis") && ($RE_SEARCH_GOOGLE$$module$extensions$amp_addthis$0_1$addthis_utils$classify$$.test($JSCompiler_lowerUrl$jscomp$inline_106_JSCompiler_temp$jscomp$150$$) || $RE_SEARCH_AOL$$module$extensions$amp_addthis$0_1$addthis_utils$classify$$.test($JSCompiler_lowerUrl$jscomp$inline_106_JSCompiler_temp$jscomp$150$$) || 
      -1 < $JSCompiler_lowerUrl$jscomp$inline_106_JSCompiler_temp$jscomp$150$$.indexOf("/pagead/aclk?") || -1 < $JSCompiler_lowerUrl$jscomp$inline_106_JSCompiler_temp$jscomp$150$$.indexOf(".com/url") || -1 < $JSCompiler_lowerUrl$jscomp$inline_106_JSCompiler_temp$jscomp$150$$.indexOf(".com/l.php") || -1 < $JSCompiler_lowerUrl$jscomp$inline_106_JSCompiler_temp$jscomp$150$$.indexOf("/search?") || -1 < $JSCompiler_lowerUrl$jscomp$inline_106_JSCompiler_temp$jscomp$150$$.indexOf("/search/?") || -1 < $JSCompiler_lowerUrl$jscomp$inline_106_JSCompiler_temp$jscomp$150$$.indexOf("search?") || 
      -1 < $JSCompiler_lowerUrl$jscomp$inline_106_JSCompiler_temp$jscomp$150$$.indexOf("yandex.ru/clck/jsredir?") || -1 < $JSCompiler_lowerUrl$jscomp$inline_106_JSCompiler_temp$jscomp$150$$.indexOf(".com/search") || -1 < $JSCompiler_lowerUrl$jscomp$inline_106_JSCompiler_temp$jscomp$150$$.indexOf(".org/search") || -1 < $JSCompiler_lowerUrl$jscomp$inline_106_JSCompiler_temp$jscomp$150$$.indexOf("/search.html?") || -1 < $JSCompiler_lowerUrl$jscomp$inline_106_JSCompiler_temp$jscomp$150$$.indexOf("search/results.") || 
      -1 < $JSCompiler_lowerUrl$jscomp$inline_106_JSCompiler_temp$jscomp$150$$.indexOf(".com/s?bs") || -1 < $JSCompiler_lowerUrl$jscomp$inline_106_JSCompiler_temp$jscomp$150$$.indexOf(".com/s?wd") || -1 < $JSCompiler_lowerUrl$jscomp$inline_106_JSCompiler_temp$jscomp$150$$.indexOf(".com/mb?search") || -1 < $JSCompiler_lowerUrl$jscomp$inline_106_JSCompiler_temp$jscomp$150$$.indexOf(".com/mvc/search") || -1 < $JSCompiler_lowerUrl$jscomp$inline_106_JSCompiler_temp$jscomp$150$$.indexOf(".com/web") || 
      -1 < $JSCompiler_lowerUrl$jscomp$inline_106_JSCompiler_temp$jscomp$150$$.indexOf("hotbot.com/"));
    }
    $JSCompiler_lowerUrl$jscomp$inline_106_JSCompiler_temp$jscomp$150$$ && ($bitmask$jscomp$1$$ |= 1);
  }
  return $bitmask$jscomp$1$$;
}
function $isProductPage$$module$extensions$amp_addthis$0_1$addthis_utils$classify$$($doc$jscomp$10$$, $metaElements$jscomp$1$$) {
  return $doc$jscomp$10$$.getElementById("product") || 0 < ($doc$jscomp$10$$.getElementsByClassName("product") || []).length || $doc$jscomp$10$$.getElementById("productDescription") || $doc$jscomp$10$$.getElementById("page-product") || $doc$jscomp$10$$.getElementById("vm_cart_products") || window.Virtuemart ? !0 : "product" === $metaElements$jscomp$1$$.reduce(function($doc$jscomp$10$$, $metaElements$jscomp$1$$) {
    var $tags$$ = $getDetailsForMeta$$module$extensions$amp_addthis$0_1$addthis_utils$meta$$($metaElements$jscomp$1$$);
    $metaElements$jscomp$1$$ = $tags$$.name;
    $tags$$ = $tags$$.content;
    if ($startsWith$$module$src$string$$($metaElements$jscomp$1$$, "og:")) {
      var $metaElement$jscomp$1_name$jscomp$82$$ = $metaElements$jscomp$1$$.split(":").pop();
      $doc$jscomp$10$$[$metaElement$jscomp$1_name$jscomp$82$$] = $tags$$;
    }
    return $doc$jscomp$10$$;
  }, {}).type;
}
function $getKeywordsString$$module$extensions$amp_addthis$0_1$addthis_utils$classify$$($metaElements$jscomp$2$$) {
  return $metaElements$jscomp$2$$.filter(function($metaElements$jscomp$2$$) {
    return "keywords" === $getDetailsForMeta$$module$extensions$amp_addthis$0_1$addthis_utils$meta$$($metaElements$jscomp$2$$).name.toLowerCase();
  }).map(function($metaElements$jscomp$2$$) {
    var $JSCompiler_contentSplit$jscomp$inline_110_meta$jscomp$3$$ = [];
    $metaElements$jscomp$2$$ = $getDetailsForMeta$$module$extensions$amp_addthis$0_1$addthis_utils$meta$$($metaElements$jscomp$2$$).content.split(",");
    for (var $JSCompiler_keywordsSize$jscomp$inline_111$$ = 0, $JSCompiler_i$jscomp$inline_112$$ = 0; $JSCompiler_i$jscomp$inline_112$$ < $metaElements$jscomp$2$$.length; $JSCompiler_i$jscomp$inline_112$$++) {
      var $JSCompiler_keyword$jscomp$inline_113$$ = ($metaElements$jscomp$2$$[$JSCompiler_i$jscomp$inline_112$$] || "").trim();
      if ($JSCompiler_keyword$jscomp$inline_113$$) {
        if (200 <= $JSCompiler_keyword$jscomp$inline_113$$.length + $JSCompiler_keywordsSize$jscomp$inline_111$$ + 1) {
          break;
        }
        $JSCompiler_contentSplit$jscomp$inline_110_meta$jscomp$3$$.push($JSCompiler_keyword$jscomp$inline_113$$);
        $JSCompiler_keywordsSize$jscomp$inline_111$$ += $JSCompiler_keyword$jscomp$inline_113$$.length + 1;
      }
    }
    return $JSCompiler_contentSplit$jscomp$inline_110_meta$jscomp$3$$;
  }).reduce(function($metaElements$jscomp$2$$, $subKeywords$$) {
    return $metaElements$jscomp$2$$.concat($subKeywords$$);
  }, []).join(",");
}
;var $RE_ADDTHIS_FRAGMENT$$module$extensions$amp_addthis$0_1$addthis_utils$fragment$$ = /^\.[a-z0-9\-_]{11}(\.[a-z0-9_]+)?$/i;
function $getModernFragment$$module$extensions$amp_addthis$0_1$addthis_utils$fragment$$($frag$jscomp$1_url$jscomp$54$$) {
  $frag$jscomp$1_url$jscomp$54$$ = $frag$jscomp$1_url$jscomp$54$$.split("#").pop();
  $frag$jscomp$1_url$jscomp$54$$ = $frag$jscomp$1_url$jscomp$54$$.split(";").shift();
  if ($RE_ADDTHIS_FRAGMENT$$module$extensions$amp_addthis$0_1$addthis_utils$fragment$$.test($frag$jscomp$1_url$jscomp$54$$)) {
    return $frag$jscomp$1_url$jscomp$54$$;
  }
}
;var $nonTrackedDomainMatcher$$module$extensions$amp_addthis$0_1$addthis_utils$lojson$$ = /\.gov|\.mil/;
var $overrideKeys$$module$extensions$amp_addthis$0_1$addthis_utils$get_widget_id_overloaded_with_json_for_anonymous_mode$$ = "backgroundColor borderRadius counterColor counts countsFontSize desktopPosition elements hideDevice hideEmailSharingConfirmation hideLabel iconColor label mobilePosition numPreferredServices offset originalServices postShareFollowMsg postShareRecommendedMsg postShareTitle responsive shareCountThreshold size style textColor thankyou titleFontSize __hideOnHomepage originalServices services".split(" ");
function $getWidgetOverload$$module$extensions$amp_addthis$0_1$addthis_utils$get_widget_id_overloaded_with_json_for_anonymous_mode$$($self$jscomp$1$$) {
  var $override$$ = $dict$$module$src$utils$object$$({});
  $overrideKeys$$module$extensions$amp_addthis$0_1$addthis_utils$get_widget_id_overloaded_with_json_for_anonymous_mode$$.forEach(function($overrideString$$) {
    var $item$jscomp$1$$ = $self$jscomp$1$$.element.getAttribute("data-attr-" + $overrideString$$);
    if ("string" === typeof $item$jscomp$1$$ || "number" === typeof $item$jscomp$1$$ || "boolean" === typeof $item$jscomp$1$$) {
      $override$$[String($overrideString$$)] = $item$jscomp$1$$;
    }
  });
  var $overrideString$$ = JSON.stringify($override$$);
  return "{}" === $overrideString$$ ? "" : $overrideString$$;
}
;var $configManager$$module$extensions$amp_addthis$0_1$amp_addthis$$ = new $ConfigManager$$module$extensions$amp_addthis$0_1$config_manager$$, $scrollMonitor$$module$extensions$amp_addthis$0_1$amp_addthis$$ = new $ScrollMonitor$$module$extensions$amp_addthis$0_1$addthis_utils$monitors$scroll_monitor$$, $dwellMonitor$$module$extensions$amp_addthis$0_1$amp_addthis$$ = new $DwellMonitor$$module$extensions$amp_addthis$0_1$addthis_utils$monitors$dwell_monitor$$, $clickMonitor$$module$extensions$amp_addthis$0_1$amp_addthis$$ = 
new $ClickMonitor$$module$extensions$amp_addthis$0_1$addthis_utils$monitors$click_monitor$$, $activeToolsMonitor$$module$extensions$amp_addthis$0_1$amp_addthis$$ = new $ActiveToolsMonitor$$module$extensions$amp_addthis$0_1$addthis_utils$monitors$active_tools_monitor$$, $shouldRegisterView$$module$extensions$amp_addthis$0_1$amp_addthis$$ = !0;
function $AmpAddThis$$module$extensions$amp_addthis$0_1$amp_addthis$$($$jscomp$super$this_element$jscomp$77$$) {
  $$jscomp$super$this_element$jscomp$77$$ = AMP.BaseElement.call(this, $$jscomp$super$this_element$jscomp$77$$) || this;
  $$jscomp$super$this_element$jscomp$77$$.$iframe_$ = null;
  $$jscomp$super$this_element$jscomp$77$$.$pubId_$ = "";
  $$jscomp$super$this_element$jscomp$77$$.$widgetId_$ = "";
  $$jscomp$super$this_element$jscomp$77$$.$productCode_$ = "";
  $$jscomp$super$this_element$jscomp$77$$.$canonicalUrl_$ = "";
  $$jscomp$super$this_element$jscomp$77$$.$canonicalTitle_$ = "";
  $$jscomp$super$this_element$jscomp$77$$.$referrer_$ = "";
  $$jscomp$super$this_element$jscomp$77$$.$shareConfig_$ = null;
  $$jscomp$super$this_element$jscomp$77$$.$atConfig_$ = null;
  $$jscomp$super$this_element$jscomp$77$$.$widgetType_$ = "";
  $$jscomp$super$this_element$jscomp$77$$.$mode_$ = -1;
  $$jscomp$super$this_element$jscomp$77$$.$containerClassName_$ = "";
  return $$jscomp$super$this_element$jscomp$77$$;
}
var $JSCompiler_parentCtor$jscomp$inline_116$$ = AMP.BaseElement;
$AmpAddThis$$module$extensions$amp_addthis$0_1$amp_addthis$$.prototype = $$jscomp$objectCreate$$($JSCompiler_parentCtor$jscomp$inline_116$$.prototype);
$AmpAddThis$$module$extensions$amp_addthis$0_1$amp_addthis$$.prototype.constructor = $AmpAddThis$$module$extensions$amp_addthis$0_1$amp_addthis$$;
if ($$jscomp$setPrototypeOf$$) {
  $$jscomp$setPrototypeOf$$($AmpAddThis$$module$extensions$amp_addthis$0_1$amp_addthis$$, $JSCompiler_parentCtor$jscomp$inline_116$$);
} else {
  for (var $JSCompiler_p$jscomp$inline_117$$ in $JSCompiler_parentCtor$jscomp$inline_116$$) {
    if ("prototype" != $JSCompiler_p$jscomp$inline_117$$) {
      if (Object.defineProperties) {
        var $JSCompiler_descriptor$jscomp$inline_118$$ = Object.getOwnPropertyDescriptor($JSCompiler_parentCtor$jscomp$inline_116$$, $JSCompiler_p$jscomp$inline_117$$);
        $JSCompiler_descriptor$jscomp$inline_118$$ && Object.defineProperty($AmpAddThis$$module$extensions$amp_addthis$0_1$amp_addthis$$, $JSCompiler_p$jscomp$inline_117$$, $JSCompiler_descriptor$jscomp$inline_118$$);
      } else {
        $AmpAddThis$$module$extensions$amp_addthis$0_1$amp_addthis$$[$JSCompiler_p$jscomp$inline_117$$] = $JSCompiler_parentCtor$jscomp$inline_116$$[$JSCompiler_p$jscomp$inline_117$$];
      }
    }
  }
}
$AmpAddThis$$module$extensions$amp_addthis$0_1$amp_addthis$$.$superClass_$ = $JSCompiler_parentCtor$jscomp$inline_116$$.prototype;
$JSCompiler_prototypeAlias$$ = $AmpAddThis$$module$extensions$amp_addthis$0_1$amp_addthis$$.prototype;
$JSCompiler_prototypeAlias$$.buildCallback = function() {
  var $$jscomp$this$jscomp$5$$ = this, $pubId$jscomp$8$$ = this.element.getAttribute("data-pub-id") || "", $widgetId$jscomp$4$$ = this.element.getAttribute("data-widget-id") || "", $productCode$jscomp$5$$ = this.element.getAttribute("data-product-code") || "";
  this.$mode_$ = $getAddThisMode$$module$extensions$amp_addthis$0_1$addthis_utils$mode$$({pubId:$pubId$jscomp$8$$, widgetId:$widgetId$jscomp$4$$, productCode:$productCode$jscomp$5$$});
  -1 === this.$mode_$ && ($isPubId$$module$extensions$amp_addthis$0_1$addthis_utils$mode$$($pubId$jscomp$8$$) ? "shin" === $productCode$jscomp$5$$ || "shfs" === $productCode$jscomp$5$$ || $isWidgetId$$module$extensions$amp_addthis$0_1$addthis_utils$mode$$($widgetId$jscomp$4$$) ? ("shin" === $productCode$jscomp$5$$ || "shfs" === $productCode$jscomp$5$$) && $isWidgetId$$module$extensions$amp_addthis$0_1$addthis_utils$mode$$($widgetId$jscomp$4$$) && $userAssert$$module$src$log$$($productCode$jscomp$5$$, 
  "Only widget id or product code is required <amp-addthis> %s", this.element) : $userAssert$$module$src$log$$($widgetId$jscomp$4$$, "Widget id or product code is required for <amp-addthis> %s", this.element) : $userAssert$$module$src$log$$($pubId$jscomp$8$$, "The data-pub-id attribute is required for <amp-addthis> %s", this.element));
  this.$containerClassName_$ = this.element.getAttribute("data-class-name") || "";
  this.$pubId_$ = $pubId$jscomp$8$$;
  this.$widgetId_$ = 3 === this.$mode_$ ? $getWidgetOverload$$module$extensions$amp_addthis$0_1$addthis_utils$get_widget_id_overloaded_with_json_for_anonymous_mode$$(this) : $widgetId$jscomp$4$$;
  this.$productCode_$ = $productCode$jscomp$5$$;
  "shfs" === this.$productCode_$ && this.element.setAttribute("data-widget-type", "floating");
  var $ampDoc$jscomp$12$$ = this.getAmpDoc();
  this.$canonicalUrl_$ = this.element.getAttribute("data-canonical-url") || $getServiceForDoc$$module$src$service$$(this.element, "documentInfo").get().canonicalUrl || $ampDoc$jscomp$12$$.getUrl();
  this.$canonicalTitle_$ = this.element.getAttribute("data-canonical-title") || $ampDoc$jscomp$12$$.win.document.title;
  this.$widgetType_$ = this.element.getAttribute("data-widget-type");
  this.$shareConfig_$ = $JSCompiler_StaticMethods_getShareConfigAsJsonObject_$$(this);
  this.$atConfig_$ = $JSCompiler_StaticMethods_getATConfig_$$(this, $ampDoc$jscomp$12$$);
  if ($shouldRegisterView$$module$extensions$amp_addthis$0_1$amp_addthis$$) {
    $shouldRegisterView$$module$extensions$amp_addthis$0_1$amp_addthis$$ = !1;
    var $viewer$$ = $getServiceForDoc$$module$src$service$$($ampDoc$jscomp$12$$, "viewer"), $loc$jscomp$3$$ = $parseUrlDeprecated$$module$src$url$$(this.$canonicalUrl_$);
    $ampDoc$jscomp$12$$.whenFirstVisible().then(function() {
      return $viewer$$.getReferrerUrl();
    }).then(function($pubId$jscomp$8$$) {
      $$jscomp$this$jscomp$5$$.$referrer_$ = $pubId$jscomp$8$$;
      var $widgetId$jscomp$4$$ = $$jscomp$this$jscomp$5$$.$canonicalTitle_$, $productCode$jscomp$5$$ = $$jscomp$this$jscomp$5$$.$pubId_$, $viewer$$ = $$jscomp$this$jscomp$5$$.$atConfig_$, $closeButton$$ = $loc$jscomp$3$$.href, $JSCompiler_inline_result$jscomp$152_referrer$jscomp$2$$ = $loc$jscomp$3$$.hostname, $JSCompiler_host$jscomp$inline_198$$ = $loc$jscomp$3$$.host, $JSCompiler_langWithoutLocale$jscomp$inline_207_JSCompiler_search$jscomp$inline_199$$ = $loc$jscomp$3$$.search, $JSCompiler_langParts$jscomp$inline_206_JSCompiler_locale$jscomp$inline_208_JSCompiler_pathname$jscomp$inline_200$$ = 
      $loc$jscomp$3$$.pathname, $JSCompiler_fragment$jscomp$inline_300_JSCompiler_hash$jscomp$inline_201_JSCompiler_inline_result$jscomp$291$$ = $loc$jscomp$3$$.hash, $JSCompiler_protocol$jscomp$inline_202_JSCompiler_win$jscomp$inline_210$$ = $loc$jscomp$3$$.protocol, $JSCompiler_metaElements$jscomp$inline_211_JSCompiler_port$jscomp$inline_203$$ = $loc$jscomp$3$$.port;
      $widgetId$jscomp$4$$ = {du:$closeButton$$.split("#").shift(), hostname:$JSCompiler_inline_result$jscomp$152_referrer$jscomp$2$$, href:$closeButton$$, referrer:$pubId$jscomp$8$$, search:$JSCompiler_langWithoutLocale$jscomp$inline_207_JSCompiler_search$jscomp$inline_199$$, pathname:$JSCompiler_langParts$jscomp$inline_206_JSCompiler_locale$jscomp$inline_208_JSCompiler_pathname$jscomp$inline_200$$, title:$widgetId$jscomp$4$$, hash:$JSCompiler_fragment$jscomp$inline_300_JSCompiler_hash$jscomp$inline_201_JSCompiler_inline_result$jscomp$291$$, 
      protocol:$JSCompiler_protocol$jscomp$inline_202_JSCompiler_win$jscomp$inline_210$$, port:$JSCompiler_metaElements$jscomp$inline_211_JSCompiler_port$jscomp$inline_203$$};
      $closeButton$$ = $pubId$jscomp$8$$ ? $parseUrlDeprecated$$module$src$url$$($pubId$jscomp$8$$) : {};
      $JSCompiler_langParts$jscomp$inline_206_JSCompiler_locale$jscomp$inline_208_JSCompiler_pathname$jscomp$inline_200$$ = $viewer$$.ui_language.split("-");
      $JSCompiler_langWithoutLocale$jscomp$inline_207_JSCompiler_search$jscomp$inline_199$$ = $JSCompiler_langParts$jscomp$inline_206_JSCompiler_locale$jscomp$inline_208_JSCompiler_pathname$jscomp$inline_200$$[0];
      $JSCompiler_langParts$jscomp$inline_206_JSCompiler_locale$jscomp$inline_208_JSCompiler_pathname$jscomp$inline_200$$ = $JSCompiler_langParts$jscomp$inline_206_JSCompiler_locale$jscomp$inline_208_JSCompiler_pathname$jscomp$inline_200$$.slice(1);
      $JSCompiler_fragment$jscomp$inline_300_JSCompiler_hash$jscomp$inline_201_JSCompiler_inline_result$jscomp$291$$ = ($JSCompiler_fragment$jscomp$inline_300_JSCompiler_hash$jscomp$inline_201_JSCompiler_inline_result$jscomp$291$$ = $getModernFragment$$module$extensions$amp_addthis$0_1$addthis_utils$fragment$$($widgetId$jscomp$4$$.du)) ? $JSCompiler_fragment$jscomp$inline_300_JSCompiler_hash$jscomp$inline_201_JSCompiler_inline_result$jscomp$291$$.split(".").slice(2).shift() : void 0;
      $JSCompiler_protocol$jscomp$inline_202_JSCompiler_win$jscomp$inline_210$$ = $ampDoc$jscomp$12$$.win;
      $JSCompiler_metaElements$jscomp$inline_211_JSCompiler_port$jscomp$inline_203$$ = $toArray$$module$src$types$$($JSCompiler_protocol$jscomp$inline_202_JSCompiler_win$jscomp$inline_210$$.document.head.querySelectorAll("meta"));
      var $JSCompiler_isDNTEnabled$jscomp$inline_212$$ = $JSCompiler_protocol$jscomp$inline_202_JSCompiler_win$jscomp$inline_210$$.navigator.doNotTrack && "unspecified" !== $JSCompiler_protocol$jscomp$inline_202_JSCompiler_win$jscomp$inline_210$$.navigator.doNotTrack && "no" !== $JSCompiler_protocol$jscomp$inline_202_JSCompiler_win$jscomp$inline_210$$.navigator.doNotTrack && "0" !== $JSCompiler_protocol$jscomp$inline_202_JSCompiler_win$jscomp$inline_210$$.navigator.doNotTrack, $JSCompiler_temp_const$jscomp$288$$ = 
      0 | (!1 !== $viewer$$.use_cookies ? 1 : 0) | (!0 === $viewer$$.track_textcopy ? 2 : 0) | (!0 === $viewer$$.track_addressbar ? 4 : 0), $JSCompiler_temp_const$jscomp$287$$ = $classifyPage$$module$extensions$amp_addthis$0_1$addthis_utils$classify$$($widgetId$jscomp$4$$, $JSCompiler_metaElements$jscomp$inline_211_JSCompiler_port$jscomp$inline_203$$), $JSCompiler_temp_const$jscomp$286$$ = Date.now();
      $viewer$$ = !1 !== $viewer$$.track_clickback && !1 !== $viewer$$.track_linkback ? 1 : 0;
      var $JSCompiler_temp_const$jscomp$284$$ = $JSCompiler_host$jscomp$inline_198$$ === $closeButton$$.host ? void 0 : $closeButton$$.host;
      var $JSCompiler_fragment$jscomp$inline_303_JSCompiler_temp$jscomp$290_JSCompiler_temp_const$jscomp$283$$ = $JSCompiler_fragment$jscomp$inline_300_JSCompiler_hash$jscomp$inline_201_JSCompiler_inline_result$jscomp$291$$ ? "" : ($JSCompiler_fragment$jscomp$inline_303_JSCompiler_temp$jscomp$290_JSCompiler_temp_const$jscomp$283$$ = $getModernFragment$$module$extensions$amp_addthis$0_1$addthis_utils$fragment$$($widgetId$jscomp$4$$.du)) ? $JSCompiler_fragment$jscomp$inline_303_JSCompiler_temp$jscomp$290_JSCompiler_temp_const$jscomp$283$$.split(".").slice(1).shift() : 
      void 0;
      var $JSCompiler_inline_result$jscomp$289_JSCompiler_url$jscomp$inline_305$$ = $widgetId$jscomp$4$$.du;
      if ($getModernFragment$$module$extensions$amp_addthis$0_1$addthis_utils$fragment$$($JSCompiler_inline_result$jscomp$289_JSCompiler_url$jscomp$inline_305$$)) {
        var $JSCompiler_frag$jscomp$inline_315_JSCompiler_inline_result$jscomp$312_JSCompiler_inline_result$jscomp$318_JSCompiler_yearIsLater$jscomp$inline_329$$ = !0;
      } else {
        $JSCompiler_frag$jscomp$inline_315_JSCompiler_inline_result$jscomp$312_JSCompiler_inline_result$jscomp$318_JSCompiler_yearIsLater$jscomp$inline_329$$ = $JSCompiler_inline_result$jscomp$289_JSCompiler_url$jscomp$inline_305$$.split("#").pop();
        var $JSCompiler_date$jscomp$inline_324_JSCompiler_temp$jscomp$317_JSCompiler_yearIsSame$jscomp$inline_330$$;
        if ($JSCompiler_date$jscomp$inline_324_JSCompiler_temp$jscomp$317_JSCompiler_yearIsSame$jscomp$inline_330$$ = $JSCompiler_frag$jscomp$inline_315_JSCompiler_inline_result$jscomp$312_JSCompiler_inline_result$jscomp$318_JSCompiler_yearIsLater$jscomp$inline_329$$ && $JSCompiler_frag$jscomp$inline_315_JSCompiler_inline_result$jscomp$312_JSCompiler_inline_result$jscomp$318_JSCompiler_yearIsLater$jscomp$inline_329$$.match($RE_CUID$$module$extensions$amp_addthis$0_1$addthis_utils$cuid$$)) {
          $JSCompiler_date$jscomp$inline_324_JSCompiler_temp$jscomp$317_JSCompiler_yearIsSame$jscomp$inline_330$$ = new Date;
          try {
            $JSCompiler_date$jscomp$inline_324_JSCompiler_temp$jscomp$317_JSCompiler_yearIsSame$jscomp$inline_330$$ = new Date(1000 * parseInt($JSCompiler_frag$jscomp$inline_315_JSCompiler_inline_result$jscomp$312_JSCompiler_inline_result$jscomp$318_JSCompiler_yearIsLater$jscomp$inline_329$$.substr(0, 8), 16));
          } catch ($JSCompiler_e$jscomp$inline_325$$) {
          }
          var $JSCompiler_date$jscomp$inline_320_JSCompiler_dateIsLater$jscomp$inline_333$$ = $JSCompiler_date$jscomp$inline_324_JSCompiler_temp$jscomp$317_JSCompiler_yearIsSame$jscomp$inline_330$$;
          $JSCompiler_date$jscomp$inline_320_JSCompiler_dateIsLater$jscomp$inline_333$$.setDate($JSCompiler_date$jscomp$inline_320_JSCompiler_dateIsLater$jscomp$inline_333$$.getDate() - 1);
          var $JSCompiler_now$jscomp$inline_328$$ = new Date;
          if ($JSCompiler_date$jscomp$inline_320_JSCompiler_dateIsLater$jscomp$inline_333$$.getFullYear() < $JSCompiler_now$jscomp$inline_328$$.getFullYear()) {
            $JSCompiler_frag$jscomp$inline_315_JSCompiler_inline_result$jscomp$312_JSCompiler_inline_result$jscomp$318_JSCompiler_yearIsLater$jscomp$inline_329$$ = !1;
          } else {
            $JSCompiler_frag$jscomp$inline_315_JSCompiler_inline_result$jscomp$312_JSCompiler_inline_result$jscomp$318_JSCompiler_yearIsLater$jscomp$inline_329$$ = $JSCompiler_date$jscomp$inline_320_JSCompiler_dateIsLater$jscomp$inline_333$$.getFullYear() > $JSCompiler_now$jscomp$inline_328$$.getFullYear();
            $JSCompiler_date$jscomp$inline_324_JSCompiler_temp$jscomp$317_JSCompiler_yearIsSame$jscomp$inline_330$$ = $JSCompiler_date$jscomp$inline_320_JSCompiler_dateIsLater$jscomp$inline_333$$.getFullYear() === $JSCompiler_now$jscomp$inline_328$$.getFullYear();
            var $JSCompiler_monthIsLater$jscomp$inline_331$$ = $JSCompiler_date$jscomp$inline_320_JSCompiler_dateIsLater$jscomp$inline_333$$.getMonth() > $JSCompiler_now$jscomp$inline_328$$.getMonth(), $JSCompiler_monthIsSame$jscomp$inline_332$$ = $JSCompiler_date$jscomp$inline_320_JSCompiler_dateIsLater$jscomp$inline_333$$.getMonth() === $JSCompiler_now$jscomp$inline_328$$.getMonth();
            $JSCompiler_date$jscomp$inline_320_JSCompiler_dateIsLater$jscomp$inline_333$$ = $JSCompiler_date$jscomp$inline_320_JSCompiler_dateIsLater$jscomp$inline_333$$.getDate() > $JSCompiler_now$jscomp$inline_328$$.getDate();
            $JSCompiler_frag$jscomp$inline_315_JSCompiler_inline_result$jscomp$312_JSCompiler_inline_result$jscomp$318_JSCompiler_yearIsLater$jscomp$inline_329$$ = $JSCompiler_frag$jscomp$inline_315_JSCompiler_inline_result$jscomp$312_JSCompiler_inline_result$jscomp$318_JSCompiler_yearIsLater$jscomp$inline_329$$ || $JSCompiler_date$jscomp$inline_324_JSCompiler_temp$jscomp$317_JSCompiler_yearIsSame$jscomp$inline_330$$ && $JSCompiler_monthIsLater$jscomp$inline_331$$ || $JSCompiler_date$jscomp$inline_324_JSCompiler_temp$jscomp$317_JSCompiler_yearIsSame$jscomp$inline_330$$ && 
            $JSCompiler_monthIsSame$jscomp$inline_332$$ && $JSCompiler_date$jscomp$inline_320_JSCompiler_dateIsLater$jscomp$inline_333$$;
          }
          $JSCompiler_date$jscomp$inline_324_JSCompiler_temp$jscomp$317_JSCompiler_yearIsSame$jscomp$inline_330$$ = !$JSCompiler_frag$jscomp$inline_315_JSCompiler_inline_result$jscomp$312_JSCompiler_inline_result$jscomp$318_JSCompiler_yearIsLater$jscomp$inline_329$$;
        }
        $JSCompiler_frag$jscomp$inline_315_JSCompiler_inline_result$jscomp$312_JSCompiler_inline_result$jscomp$318_JSCompiler_yearIsLater$jscomp$inline_329$$ = $JSCompiler_date$jscomp$inline_324_JSCompiler_temp$jscomp$317_JSCompiler_yearIsSame$jscomp$inline_330$$ || -1 < $JSCompiler_inline_result$jscomp$289_JSCompiler_url$jscomp$inline_305$$.indexOf("#at_pco=") ? !0 : !1;
      }
      $JSCompiler_inline_result$jscomp$289_JSCompiler_url$jscomp$inline_305$$ = $JSCompiler_frag$jscomp$inline_315_JSCompiler_inline_result$jscomp$312_JSCompiler_inline_result$jscomp$318_JSCompiler_yearIsLater$jscomp$inline_329$$ ? $JSCompiler_inline_result$jscomp$289_JSCompiler_url$jscomp$inline_305$$.split("#").shift() : $JSCompiler_inline_result$jscomp$289_JSCompiler_url$jscomp$inline_305$$;
      $pubId$jscomp$8$$ = $dict$$module$src$utils$object$$({amp:1, bl:$JSCompiler_temp_const$jscomp$288$$, cb:$JSCompiler_temp_const$jscomp$287$$, colc:$JSCompiler_temp_const$jscomp$286$$, ct:$viewer$$, dc:1, dp:$JSCompiler_host$jscomp$inline_198$$, dr:$JSCompiler_temp_const$jscomp$284$$, fcu:$JSCompiler_fragment$jscomp$inline_303_JSCompiler_temp$jscomp$290_JSCompiler_temp_const$jscomp$283$$, fp:$parseUrlDeprecated$$module$src$url$$($JSCompiler_inline_result$jscomp$289_JSCompiler_url$jscomp$inline_305$$).pathname, 
      fr:$closeButton$$.pathname || "", gen:100, ln:$JSCompiler_langWithoutLocale$jscomp$inline_207_JSCompiler_search$jscomp$inline_199$$, lnlc:$JSCompiler_langParts$jscomp$inline_206_JSCompiler_locale$jscomp$inline_208_JSCompiler_pathname$jscomp$inline_200$$, mk:$getKeywordsString$$module$extensions$amp_addthis$0_1$addthis_utils$classify$$($JSCompiler_metaElements$jscomp$inline_211_JSCompiler_port$jscomp$inline_203$$), of:$JSCompiler_isDNTEnabled$jscomp$inline_212$$ ? 4 : $nonTrackedDomainMatcher$$module$extensions$amp_addthis$0_1$addthis_utils$lojson$$.test($JSCompiler_inline_result$jscomp$152_referrer$jscomp$2$$) ? 
      1 : 0, pd:$isProductPage$$module$extensions$amp_addthis$0_1$addthis_utils$classify$$($JSCompiler_protocol$jscomp$inline_202_JSCompiler_win$jscomp$inline_210$$.document, $JSCompiler_metaElements$jscomp$inline_211_JSCompiler_port$jscomp$inline_203$$) ? 1 : 0, pub:$productCode$jscomp$5$$, rb:$classifyReferrer$$module$extensions$amp_addthis$0_1$addthis_utils$classify$$($pubId$jscomp$8$$, $closeButton$$, $parseUrlDeprecated$$module$src$url$$($widgetId$jscomp$4$$.du)), sid:$sessionId$$module$extensions$amp_addthis$0_1$addthis_utils$session$$, 
      skipb:1, sr:$JSCompiler_fragment$jscomp$inline_300_JSCompiler_hash$jscomp$inline_201_JSCompiler_inline_result$jscomp$291$$});
      $callPixelEndpoint$$module$extensions$amp_addthis$0_1$addthis_utils$pixel$$({ampDoc:$ampDoc$jscomp$12$$, endpoint:"https://m.addthis.com/live/red_lojson/300lo.json", data:$pubId$jscomp$8$$});
      $dwellMonitor$$module$extensions$amp_addthis$0_1$amp_addthis$$.startForDoc($ampDoc$jscomp$12$$);
      $scrollMonitor$$module$extensions$amp_addthis$0_1$amp_addthis$$.startForDoc($ampDoc$jscomp$12$$);
      $clickMonitor$$module$extensions$amp_addthis$0_1$amp_addthis$$.startForDoc($ampDoc$jscomp$12$$);
    });
    $JSCompiler_StaticMethods_setupListeners_$$(this, {ampDoc:$ampDoc$jscomp$12$$, loc:$loc$jscomp$3$$, pubId:this.$pubId_$});
    if ("messages" === this.element.getAttribute("data-widget-type")) {
      var $closeButton$$ = $createElementWithAttributes$$module$src$dom$$(this.win.document, "button", $dict$$module$src$utils$object$$({"class":"i-amphtml-addthis-close"}));
      $closeButton$$.onclick = function() {
        var $pubId$jscomp$8$$ = $$jscomp$this$jscomp$5$$.element;
        $pubId$jscomp$8$$.parentElement && $pubId$jscomp$8$$.parentElement.removeChild($pubId$jscomp$8$$);
      };
      this.element.appendChild($closeButton$$);
    }
  }
};
$JSCompiler_prototypeAlias$$.preconnectCallback = function($opt_onLayout$$) {
  var $preconnect$$ = $getService$$module$src$service$$(this.win, "preconnect"), $ampdoc$jscomp$12$$ = this.getAmpDoc();
  $preconnect$$.url($ampdoc$jscomp$12$$, "https://s7.addthis.com", $opt_onLayout$$);
  $preconnect$$.url($ampdoc$jscomp$12$$, "https://m.addthis.com", $opt_onLayout$$);
  $preconnect$$.url($ampdoc$jscomp$12$$, "https://m.addthisedge.com", $opt_onLayout$$);
  $preconnect$$.url($ampdoc$jscomp$12$$, "https://api-public.addthis.com", $opt_onLayout$$);
  $preconnect$$.url($ampdoc$jscomp$12$$, "https://cache.addthiscdn.com", $opt_onLayout$$);
  $preconnect$$.url($ampdoc$jscomp$12$$, "https://su.addthis.com", $opt_onLayout$$);
};
$JSCompiler_prototypeAlias$$.isAlwaysFixed = function() {
  return "floating" === this.$widgetType_$;
};
$JSCompiler_prototypeAlias$$.createPlaceholderCallback = function() {
  var $placeholder$$ = $createElementWithAttributes$$module$src$dom$$(this.win.document, "div", $dict$$module$src$utils$object$$({placeholder:""}));
  $setStyle$$module$src$style$$($placeholder$$, "background-color", "#fff");
  var $image$jscomp$3$$ = $createElementWithAttributes$$module$src$dom$$(this.win.document, "amp-img", $dict$$module$src$utils$object$$({src:"https://cache.addthiscdn.com/icons/v3/thumbs/32x32/addthis.png", layout:"fixed", width:"32", height:"32", referrerpolicy:"origin", alt:"AddThis Website Tools"}));
  $placeholder$$.appendChild($image$jscomp$3$$);
  return $placeholder$$;
};
$JSCompiler_prototypeAlias$$.layoutCallback = function() {
  var $iframe$jscomp$6$$ = $createElementWithAttributes$$module$src$dom$$(this.element.ownerDocument, "iframe", $dict$$module$src$utils$object$$({frameborder:0, title:"AddThis Website Tools", src:"https://s7.addthis.com/dc/amp-addthis.html?_amp_=2007210308000", id:this.$widgetId_$, pco:this.$productCode_$, containerClassName:this.$containerClassName_$})), $iframeLoadPromise$jscomp$1$$ = this.loadPromise($iframe$jscomp$6$$);
  this.applyFillContent($iframe$jscomp$6$$);
  this.element.appendChild($iframe$jscomp$6$$);
  this.$iframe_$ = $iframe$jscomp$6$$;
  $configManager$$module$extensions$amp_addthis$0_1$amp_addthis$$.register({pubId:this.$pubId_$, widgetId:this.$widgetId_$, productCode:this.$productCode_$, shareConfig:this.$shareConfig_$, atConfig:this.$atConfig_$, containerClassName:this.$containerClassName_$, iframe:$iframe$jscomp$6$$, iframeLoadPromise:$iframeLoadPromise$jscomp$1$$, activeToolsMonitor:$activeToolsMonitor$$module$extensions$amp_addthis$0_1$amp_addthis$$});
  return $iframeLoadPromise$jscomp$1$$;
};
$JSCompiler_prototypeAlias$$.isLayoutSupported = function($layout$jscomp$4$$) {
  return "fixed" == $layout$jscomp$4$$ || "fixed-height" == $layout$jscomp$4$$ || "responsive" == $layout$jscomp$4$$ || "fill" == $layout$jscomp$4$$ || "flex-item" == $layout$jscomp$4$$ || "fluid" == $layout$jscomp$4$$ || "intrinsic" == $layout$jscomp$4$$;
};
$JSCompiler_prototypeAlias$$.unlayoutCallback = function() {
  if (this.$iframe_$) {
    var $JSCompiler_element$jscomp$inline_125$$ = this.$iframe_$;
    $JSCompiler_element$jscomp$inline_125$$.parentElement && $JSCompiler_element$jscomp$inline_125$$.parentElement.removeChild($JSCompiler_element$jscomp$inline_125$$);
    $configManager$$module$extensions$amp_addthis$0_1$amp_addthis$$.unregister({pubId:this.$pubId_$, iframe:this.$iframe_$});
    this.$iframe_$ = null;
  }
  return !0;
};
function $JSCompiler_StaticMethods_getShareConfigAsJsonObject_$$($JSCompiler_StaticMethods_getShareConfigAsJsonObject_$self$$) {
  var $params$jscomp$9$$ = {};
  $SHARE_CONFIG_KEYS$$module$extensions$amp_addthis$0_1$constants$$.map(function($key$jscomp$54$$) {
    var $JSCompiler_ogImage$jscomp$inline_128_value$jscomp$107$$ = $JSCompiler_StaticMethods_getShareConfigAsJsonObject_$self$$.element.getAttribute("data-" + $key$jscomp$54$$);
    $JSCompiler_ogImage$jscomp$inline_128_value$jscomp$107$$ ? $params$jscomp$9$$[$key$jscomp$54$$] = $JSCompiler_ogImage$jscomp$inline_128_value$jscomp$107$$ : "url" === $key$jscomp$54$$ ? $params$jscomp$9$$[$key$jscomp$54$$] = $JSCompiler_StaticMethods_getShareConfigAsJsonObject_$self$$.getAmpDoc().getUrl() : "title" === $key$jscomp$54$$ ? $params$jscomp$9$$[$key$jscomp$54$$] = $JSCompiler_StaticMethods_getShareConfigAsJsonObject_$self$$.getAmpDoc().win.document.title : "media" === $key$jscomp$54$$ && 
    ($JSCompiler_ogImage$jscomp$inline_128_value$jscomp$107$$ = $JSCompiler_StaticMethods_getShareConfigAsJsonObject_$self$$.getAmpDoc().win.document.head.querySelector('meta[property="og:image"]'), $params$jscomp$9$$[$key$jscomp$54$$] = $JSCompiler_ogImage$jscomp$inline_128_value$jscomp$107$$ ? $JSCompiler_ogImage$jscomp$inline_128_value$jscomp$107$$.content : "");
  });
  return $params$jscomp$9$$;
}
function $JSCompiler_StaticMethods_getATConfig_$$($JSCompiler_StaticMethods_getATConfig_$self$$, $ampDoc$jscomp$13$$) {
  return $AT_CONFIG_KEYS$$module$extensions$amp_addthis$0_1$constants$$.reduce(function($config$jscomp$4$$, $key$jscomp$55$$) {
    var $value$jscomp$108_win$jscomp$59$$ = $JSCompiler_StaticMethods_getATConfig_$self$$.element.getAttribute("data-" + $key$jscomp$55$$);
    $value$jscomp$108_win$jscomp$59$$ ? $config$jscomp$4$$[$key$jscomp$55$$] = $value$jscomp$108_win$jscomp$59$$ : ($value$jscomp$108_win$jscomp$59$$ = $ampDoc$jscomp$13$$.win, "ui_language" === $key$jscomp$55$$ && ($config$jscomp$4$$[$key$jscomp$55$$] = $value$jscomp$108_win$jscomp$59$$.document.documentElement.lang || $value$jscomp$108_win$jscomp$59$$.navigator.language || $value$jscomp$108_win$jscomp$59$$.navigator.userLanguage || "en"));
    return $config$jscomp$4$$;
  }, {});
}
function $JSCompiler_StaticMethods_setupListeners_$$($JSCompiler_StaticMethods_setupListeners_$self$$, $input$jscomp$12$$) {
  var $ampDoc$jscomp$14$$ = $input$jscomp$12$$.ampDoc, $loc$jscomp$4$$ = $input$jscomp$12$$.loc, $pubId$jscomp$9$$ = $input$jscomp$12$$.pubId;
  $listen$$module$src$event_helper$$($ampDoc$jscomp$14$$.win, function() {
    var $JSCompiler_StaticMethods_setupListeners_$self$$ = $loc$jscomp$4$$.host;
    var $input$jscomp$12$$ = $loc$jscomp$4$$.pathname;
    var $postMessageDispatcher$$ = $loc$jscomp$4$$.hash;
    var $pmHandler$$ = $getServiceForDoc$$module$src$service$$($ampDoc$jscomp$14$$, "viewport");
    var $JSCompiler_data$jscomp$inline_132_JSCompiler_object_inline_al_262_JSCompiler_url$jscomp$inline_133$$ = $activeToolsMonitor$$module$extensions$amp_addthis$0_1$amp_addthis$$.getActivePcos().join(",") || void 0;
    var $JSCompiler_object_inline_dt_266$$ = $dwellMonitor$$module$extensions$amp_addthis$0_1$amp_addthis$$.getDwellTime();
    $input$jscomp$12$$ = $input$jscomp$12$$.replace($postMessageDispatcher$$, "");
    $postMessageDispatcher$$ = $clickMonitor$$module$extensions$amp_addthis$0_1$amp_addthis$$.getIframeClickString();
    var $JSCompiler_object_inline_ivh_269$$ = $scrollMonitor$$module$extensions$amp_addthis$0_1$amp_addthis$$.getInitialViewHeight();
    var $JSCompiler_object_inline_pct_270$$ = $clickMonitor$$module$extensions$amp_addthis$0_1$amp_addthis$$.getPageClicks();
    var $JSCompiler_object_inline_pfm_271$$ = $ampDoc$jscomp$14$$.win.navigator.sendBeacon ? 0 : 1;
    $pmHandler$$ = $pmHandler$$.getHeight();
    var $JSCompiler_object_inline_sh_274$$ = $scrollMonitor$$module$extensions$amp_addthis$0_1$amp_addthis$$.getScrollHeight();
    $JSCompiler_data$jscomp$inline_132_JSCompiler_object_inline_al_262_JSCompiler_url$jscomp$inline_133$$ = $dict$$module$src$utils$object$$({al:$JSCompiler_data$jscomp$inline_132_JSCompiler_object_inline_al_262_JSCompiler_url$jscomp$inline_133$$, amp:1, dc:1, dp:$JSCompiler_StaticMethods_setupListeners_$self$$, dt:$JSCompiler_object_inline_dt_266$$, fp:$input$jscomp$12$$, ict:$postMessageDispatcher$$, ivh:$JSCompiler_object_inline_ivh_269$$, pct:$JSCompiler_object_inline_pct_270$$, pfm:$JSCompiler_object_inline_pfm_271$$, 
    ph:$pmHandler$$, pub:$pubId$jscomp$9$$, sh:$JSCompiler_object_inline_sh_274$$, sid:$sessionId$$module$extensions$amp_addthis$0_1$addthis_utils$session$$});
    $JSCompiler_data$jscomp$inline_132_JSCompiler_object_inline_al_262_JSCompiler_url$jscomp$inline_133$$ = $appendEncodedParamStringToUrl$$module$src$url$$("https://m.addthis.com/live/red_lojson/100eng.json", $serializeQueryString$$module$src$url$$($JSCompiler_data$jscomp$inline_132_JSCompiler_object_inline_al_262_JSCompiler_url$jscomp$inline_133$$));
    $ampDoc$jscomp$14$$.win.navigator.sendBeacon ? $ampDoc$jscomp$14$$.win.navigator.sendBeacon($JSCompiler_data$jscomp$inline_132_JSCompiler_object_inline_al_262_JSCompiler_url$jscomp$inline_133$$, "{}") : $pixelDrop$$module$extensions$amp_addthis$0_1$addthis_utils$pixel$$($JSCompiler_data$jscomp$inline_132_JSCompiler_object_inline_al_262_JSCompiler_url$jscomp$inline_133$$, $ampDoc$jscomp$14$$);
  });
  var $postMessageDispatcher$$ = new $PostMessageDispatcher$$module$extensions$amp_addthis$0_1$post_message_dispatcher$$, $pmHandler$$ = $postMessageDispatcher$$.handleAddThisMessage.bind($postMessageDispatcher$$);
  $internalListenImplementation$$module$src$event_helper_listen$$($ampDoc$jscomp$14$$.win, "message", $pmHandler$$);
  $postMessageDispatcher$$.on("addthis.share", function($input$jscomp$12$$) {
    var $postMessageDispatcher$$ = $JSCompiler_StaticMethods_setupListeners_$self$$.$referrer_$, $pmHandler$$ = $JSCompiler_StaticMethods_setupListeners_$self$$.$canonicalTitle_$, $JSCompiler_inline_result$jscomp$153_data$jscomp$87$$ = $loc$jscomp$4$$.href, $JSCompiler_hostname$jscomp$inline_240_JSCompiler_metaElements$jscomp$inline_248$$ = $loc$jscomp$4$$.hostname, $JSCompiler_search$jscomp$inline_241$$ = $loc$jscomp$4$$.search, $JSCompiler_pathname$jscomp$inline_242$$ = $loc$jscomp$4$$.pathname, 
    $JSCompiler_hash$jscomp$inline_243$$ = $loc$jscomp$4$$.hash, $JSCompiler_protocol$jscomp$inline_244$$ = $loc$jscomp$4$$.protocol, $JSCompiler_port$jscomp$inline_245$$ = $loc$jscomp$4$$.port;
    $pmHandler$$ = {du:$JSCompiler_inline_result$jscomp$153_data$jscomp$87$$.split("#").shift(), hostname:$JSCompiler_hostname$jscomp$inline_240_JSCompiler_metaElements$jscomp$inline_248$$, href:$JSCompiler_inline_result$jscomp$153_data$jscomp$87$$, referrer:$postMessageDispatcher$$, search:$JSCompiler_search$jscomp$inline_241$$, pathname:$JSCompiler_pathname$jscomp$inline_242$$, title:$pmHandler$$, hash:$JSCompiler_hash$jscomp$inline_243$$, protocol:$JSCompiler_protocol$jscomp$inline_244$$, port:$JSCompiler_port$jscomp$inline_245$$};
    $JSCompiler_inline_result$jscomp$153_data$jscomp$87$$ = $postMessageDispatcher$$ ? $parseUrlDeprecated$$module$src$url$$($postMessageDispatcher$$) : {};
    $JSCompiler_hostname$jscomp$inline_240_JSCompiler_metaElements$jscomp$inline_248$$ = $toArray$$module$src$types$$($ampDoc$jscomp$14$$.win.document.head.querySelectorAll("meta"));
    $input$jscomp$12$$ = {amp:1, cb:$classifyPage$$module$extensions$amp_addthis$0_1$addthis_utils$classify$$($pmHandler$$, $JSCompiler_hostname$jscomp$inline_240_JSCompiler_metaElements$jscomp$inline_248$$), dc:1, dest:$input$jscomp$12$$.service, gen:300, mk:$getKeywordsString$$module$extensions$amp_addthis$0_1$addthis_utils$classify$$($JSCompiler_hostname$jscomp$inline_240_JSCompiler_metaElements$jscomp$inline_248$$), pub:$pubId$jscomp$9$$, rb:$classifyReferrer$$module$extensions$amp_addthis$0_1$addthis_utils$classify$$($postMessageDispatcher$$, 
    $JSCompiler_inline_result$jscomp$153_data$jscomp$87$$, $parseUrlDeprecated$$module$src$url$$($pmHandler$$.du)), sid:$sessionId$$module$extensions$amp_addthis$0_1$addthis_utils$session$$, url:$input$jscomp$12$$.url};
    $callPixelEndpoint$$module$extensions$amp_addthis$0_1$addthis_utils$pixel$$({ampDoc:$ampDoc$jscomp$14$$, endpoint:"https://m.addthis.com/live/red_pjson", data:$input$jscomp$12$$});
  });
  $postMessageDispatcher$$.on("addthis.amp.configuration", $configManager$$module$extensions$amp_addthis$0_1$amp_addthis$$.receiveConfiguration.bind($configManager$$module$extensions$amp_addthis$0_1$amp_addthis$$));
}
(function($AMP$jscomp$1$$) {
  $AMP$jscomp$1$$.registerElement("amp-addthis", $AmpAddThis$$module$extensions$amp_addthis$0_1$amp_addthis$$, 'amp-addthis[data-widget-type=messages]{position:fixed!important;width:100%!important;top:0}amp-addthis .i-amphtml-addthis-close{right:10px!important;top:10px!important;width:32px!important;height:32px!important;opacity:0.5!important;float:right!important;cursor:pointer!important;position:relative!important;z-index:1!important;background-color:transparent!important;border:none!important}amp-addthis .i-amphtml-addthis-close:hover{opacity:1!important}.i-amphtml-addthis-close:after,amp-addthis .i-amphtml-addthis-close:before{position:absolute;content:" ";height:20px;width:2px;background-color:#fff}amp-addthis .i-amphtml-addthis-close:before{transform:rotate(45deg)}amp-addthis .i-amphtml-addthis-close:after{transform:rotate(-45deg)}@media only screen and (max-width:979px){amp-addthis[data-widget-type=floating]{position:fixed!important;width:100%!important;height:50px;bottom:0}}@media only screen and (min-width:979px){amp-addthis[data-widget-type=floating]{position:fixed!important;width:70px!important;height:320px!important;top:200px}}\n/*# sourceURL=/extensions/amp-addthis/0.1/amp-addthis.css*/');
})(self.AMP);

})});

//# sourceMappingURL=amp-addthis-0.1.js.map
