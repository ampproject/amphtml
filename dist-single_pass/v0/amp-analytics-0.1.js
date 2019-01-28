(self.AMP=self.AMP||[]).push({n:"amp-analytics",i:["_base_i","_base_misc"],v:"1901181729101",f:(function(AMP,_){
var $JSCompiler_StaticMethods_expandStringAsync$$ = function($JSCompiler_StaticMethods_expandStringAsync$self$$, $source$jscomp$21$$, $opt_bindings$jscomp$3$$, $opt_whiteList$jscomp$4$$) {
  return (new _.$Expander$$module$src$service$url_expander$expander$$($JSCompiler_StaticMethods_expandStringAsync$self$$.$D$, $opt_bindings$jscomp$3$$, void 0, void 0, $opt_whiteList$jscomp$4$$, !0)).expand($source$jscomp$21$$);
}, $expandTemplate$$module$src$string$$ = function($template$jscomp$1$$, $getter$$) {
  for (var $$jscomp$loop$385$$ = {}, $i$jscomp$6$$ = 0; 5 > $i$jscomp$6$$ && ($$jscomp$loop$385$$.matches = 0, $template$jscomp$1$$ = $template$jscomp$1$$.replace(/\${([^}]*)}/g, function($template$jscomp$1$$) {
    return function($$jscomp$loop$385$$, $i$jscomp$6$$) {
      $template$jscomp$1$$.matches++;
      return $getter$$($i$jscomp$6$$);
    };
  }($$jscomp$loop$385$$)), $$jscomp$loop$385$$.matches); $$jscomp$loop$385$$ = {matches:$$jscomp$loop$385$$.matches}, $i$jscomp$6$$++) {
  }
  return $template$jscomp$1$$;
}, $base64UrlEncodeFromString$$module$src$utils$base64$$ = function($bytes$jscomp$5_str$jscomp$12$$) {
  $bytes$jscomp$5_str$jscomp$12$$ = _.$utf8Encode$$module$src$utils$bytes$$($bytes$jscomp$5_str$jscomp$12$$);
  return _.$base64UrlEncodeFromBytes$$module$src$utils$base64$$($bytes$jscomp$5_str$jscomp$12$$);
}, $nativeIntersectionObserverSupported$$module$src$intersection_observer_polyfill$$ = function($win$jscomp$135$$) {
  return "IntersectionObserver" in $win$jscomp$135$$ && "IntersectionObserverEntry" in $win$jscomp$135$$ && "intersectionRatio" in $win$jscomp$135$$.IntersectionObserverEntry.prototype;
}, $findEngagedTimeBetween$$module$extensions$amp_analytics$0_1$activity_impl$$ = function($activityEvent$$, $time$jscomp$20$$) {
  var $engagementBonus$$ = 0;
  "active" === $activityEvent$$.type && ($engagementBonus$$ = 5);
  return Math.min($time$jscomp$20$$ - $activityEvent$$.time, $engagementBonus$$);
}, $ActivityHistory$$module$extensions$amp_analytics$0_1$activity_impl$$ = function() {
  this.$F$ = 0;
  this.$D$ = void 0;
}, $Activity$$module$extensions$amp_analytics$0_1$activity_impl$$ = function($ampdoc$jscomp$126$$) {
  this.ampdoc = $ampdoc$jscomp$126$$;
  this.$R$ = this.$stopIgnore_$.bind(this);
  this.$K$ = this.$handleActivity_$.bind(this);
  this.$P$ = this.$handleVisibilityChange_$.bind(this);
  this.$D$ = {};
  this.$F$ = [];
  this.$I$ = this.$G$ = !1;
  this.$J$ = new $ActivityHistory$$module$extensions$amp_analytics$0_1$activity_impl$$;
  this.$viewer_$ = _.$Services$$module$src$services$viewerForDoc$$(this.ampdoc);
  this.$viewport_$ = _.$Services$$module$src$services$viewportForDoc$$(this.ampdoc);
  this.$viewer_$.$D$.then(this.$Activity$$module$extensions$amp_analytics$0_1$activity_impl_prototype$start_$.bind(this));
}, $JSCompiler_StaticMethods_getTimeSinceStart_$$ = function($JSCompiler_StaticMethods_getTimeSinceStart_$self_timeSinceStart$jscomp$2$$) {
  $JSCompiler_StaticMethods_getTimeSinceStart_$self_timeSinceStart$jscomp$2$$ = Date.now() - $JSCompiler_StaticMethods_getTimeSinceStart_$self_timeSinceStart$jscomp$2$$.$O$;
  return 0 < $JSCompiler_StaticMethods_getTimeSinceStart_$self_timeSinceStart$jscomp$2$$ ? $JSCompiler_StaticMethods_getTimeSinceStart_$self_timeSinceStart$jscomp$2$$ : 0;
}, $JSCompiler_StaticMethods_handleActivityEvent_$$ = function($JSCompiler_StaticMethods_handleActivityEvent_$self$$, $type$jscomp$161$$) {
  var $timeSinceStart$jscomp$3$$ = $JSCompiler_StaticMethods_getTimeSinceStart_$$($JSCompiler_StaticMethods_handleActivityEvent_$self$$), $secondKey$$ = Math.floor($timeSinceStart$jscomp$3$$ / 1000);
  (0,window.setTimeout)($JSCompiler_StaticMethods_handleActivityEvent_$self$$.$R$, 1000 - $timeSinceStart$jscomp$3$$ % 1000);
  $JSCompiler_StaticMethods_handleActivityEvent_$self$$.$J$.push({type:$type$jscomp$161$$, time:$secondKey$$});
}, $JSCompiler_StaticMethods_generateBatchRequest$$ = function($baseUrl$jscomp$10$$, $segments$jscomp$1$$, $withPayload$jscomp$1$$) {
  return (void 0 === $withPayload$jscomp$1$$ ? 0 : $withPayload$jscomp$1$$) ? {url:$baseUrl$jscomp$10$$.replace("${extraUrlParams}", ""), $payload$:JSON.stringify($segments$jscomp$1$$.map(function($baseUrl$jscomp$10$$) {
    return $baseUrl$jscomp$10$$.extraUrlParams;
  }))} : {url:$defaultSerializer$$module$extensions$amp_analytics$0_1$transport_serializer$$($baseUrl$jscomp$10$$, $segments$jscomp$1$$)};
}, $defaultSerializer$$module$extensions$amp_analytics$0_1$transport_serializer$$ = function($baseUrl$jscomp$11$$, $batchSegments_extraUrlParamsStr$$) {
  $batchSegments_extraUrlParamsStr$$ = $batchSegments_extraUrlParamsStr$$.map(function($baseUrl$jscomp$11$$) {
    return _.$serializeQueryString$$module$src$url$$($baseUrl$jscomp$11$$.extraUrlParams);
  }).filter(function($baseUrl$jscomp$11$$) {
    return !!$baseUrl$jscomp$11$$;
  }).join("&");
  return 0 <= $baseUrl$jscomp$11$$.indexOf("${extraUrlParams}") ? $baseUrl$jscomp$11$$.replace("${extraUrlParams}", $batchSegments_extraUrlParamsStr$$) : _.$appendEncodedParamStringToUrl$$module$src$url$$($baseUrl$jscomp$11$$, $batchSegments_extraUrlParamsStr$$);
}, $AnalyticsConfig$$module$extensions$amp_analytics$0_1$config$$ = function($element$jscomp$304$$) {
  this.$element_$ = $element$jscomp$304$$;
  this.$F$ = null;
  this.$G$ = $ANALYTICS_CONFIG$$module$extensions$amp_analytics$0_1$vendors$$;
  this.$config_$ = {};
  this.$D$ = {};
  this.$isSandbox_$ = !1;
}, $JSCompiler_StaticMethods_AnalyticsConfig$$module$extensions$amp_analytics$0_1$config_prototype$loadConfig$$ = function($JSCompiler_StaticMethods_AnalyticsConfig$$module$extensions$amp_analytics$0_1$config_prototype$loadConfig$self$$) {
  $JSCompiler_StaticMethods_AnalyticsConfig$$module$extensions$amp_analytics$0_1$config_prototype$loadConfig$self$$.$F$ = $JSCompiler_StaticMethods_AnalyticsConfig$$module$extensions$amp_analytics$0_1$config_prototype$loadConfig$self$$.$element_$.ownerDocument.defaultView;
  $JSCompiler_StaticMethods_AnalyticsConfig$$module$extensions$amp_analytics$0_1$config_prototype$loadConfig$self$$.$isSandbox_$ = $JSCompiler_StaticMethods_AnalyticsConfig$$module$extensions$amp_analytics$0_1$config_prototype$loadConfig$self$$.$element_$.hasAttribute("sandbox");
  return $JSCompiler_StaticMethods_fetchRemoteConfig_$$($JSCompiler_StaticMethods_AnalyticsConfig$$module$extensions$amp_analytics$0_1$config_prototype$loadConfig$self$$).then($JSCompiler_StaticMethods_AnalyticsConfig$$module$extensions$amp_analytics$0_1$config_prototype$loadConfig$self$$.$I$.bind($JSCompiler_StaticMethods_AnalyticsConfig$$module$extensions$amp_analytics$0_1$config_prototype$loadConfig$self$$)).then(function() {
    return $JSCompiler_StaticMethods_AnalyticsConfig$$module$extensions$amp_analytics$0_1$config_prototype$loadConfig$self$$.$config_$;
  });
}, $JSCompiler_StaticMethods_fetchRemoteConfig_$$ = function($JSCompiler_StaticMethods_fetchRemoteConfig_$self$$) {
  var $remoteConfigUrl$$ = $JSCompiler_StaticMethods_fetchRemoteConfig_$self$$.$element_$.getAttribute("config");
  if (!$remoteConfigUrl$$ || $JSCompiler_StaticMethods_fetchRemoteConfig_$self$$.$isSandbox_$) {
    return window.Promise.resolve();
  }
  var $TAG$jscomp$4$$ = $JSCompiler_StaticMethods_AnalyticsConfig$$module$extensions$amp_analytics$0_1$config_prototype$getName_$$($JSCompiler_StaticMethods_fetchRemoteConfig_$self$$);
  $TAG$jscomp$4$$;
  var $fetchConfig$$ = {requireAmpResponseSourceOrigin:!1};
  $JSCompiler_StaticMethods_fetchRemoteConfig_$self$$.$element_$.hasAttribute("data-credentials") && ($fetchConfig$$.credentials = $JSCompiler_StaticMethods_fetchRemoteConfig_$self$$.$element_$.getAttribute("data-credentials"));
  return _.$JSCompiler_StaticMethods_expandUrlAsync$$(_.$Services$$module$src$services$urlReplacementsForDoc$$($JSCompiler_StaticMethods_fetchRemoteConfig_$self$$.$element_$), $remoteConfigUrl$$).then(function($TAG$jscomp$4$$) {
    $remoteConfigUrl$$ = $TAG$jscomp$4$$;
    return _.$JSCompiler_StaticMethods_fetchJson$$(_.$Services$$module$src$services$xhrFor$$($JSCompiler_StaticMethods_fetchRemoteConfig_$self$$.$F$), $remoteConfigUrl$$, $fetchConfig$$);
  }).then(function($JSCompiler_StaticMethods_fetchRemoteConfig_$self$$) {
    return $JSCompiler_StaticMethods_fetchRemoteConfig_$self$$.json();
  }).then(function($remoteConfigUrl$$) {
    $JSCompiler_StaticMethods_fetchRemoteConfig_$self$$.$D$ = $remoteConfigUrl$$;
    $TAG$jscomp$4$$;
  }, function($JSCompiler_StaticMethods_fetchRemoteConfig_$self$$) {
    _.$user$$module$src$log$$().error($TAG$jscomp$4$$, "Error loading remote config: ", $remoteConfigUrl$$, $JSCompiler_StaticMethods_fetchRemoteConfig_$self$$);
  });
}, $JSCompiler_StaticMethods_handleConfigRewriter_$$ = function($JSCompiler_StaticMethods_handleConfigRewriter_$self$$, $config$jscomp$30$$, $configRewriterUrl$jscomp$1$$) {
  var $TAG$jscomp$5$$ = $JSCompiler_StaticMethods_AnalyticsConfig$$module$extensions$amp_analytics$0_1$config_prototype$getName_$$($JSCompiler_StaticMethods_handleConfigRewriter_$self$$);
  $TAG$jscomp$5$$;
  return $JSCompiler_StaticMethods_handleVarGroups_$$($JSCompiler_StaticMethods_handleConfigRewriter_$self$$, $config$jscomp$30$$).then(function() {
    var $fetchConfig$jscomp$1$$ = {method:"POST", body:$config$jscomp$30$$, requireAmpResponseSourceOrigin:!1};
    $JSCompiler_StaticMethods_handleConfigRewriter_$self$$.$element_$.hasAttribute("data-credentials") && ($fetchConfig$jscomp$1$$.credentials = $JSCompiler_StaticMethods_handleConfigRewriter_$self$$.$element_$.getAttribute("data-credentials"));
    return _.$JSCompiler_StaticMethods_expandUrlAsync$$(_.$Services$$module$src$services$urlReplacementsForDoc$$($JSCompiler_StaticMethods_handleConfigRewriter_$self$$.$element_$), $configRewriterUrl$jscomp$1$$).then(function($config$jscomp$30$$) {
      return _.$JSCompiler_StaticMethods_fetchJson$$(_.$Services$$module$src$services$xhrFor$$($JSCompiler_StaticMethods_handleConfigRewriter_$self$$.$F$), $config$jscomp$30$$, $fetchConfig$jscomp$1$$);
    }).then(function($JSCompiler_StaticMethods_handleConfigRewriter_$self$$) {
      return $JSCompiler_StaticMethods_handleConfigRewriter_$self$$.json();
    }).then(function($config$jscomp$30$$) {
      $JSCompiler_StaticMethods_handleConfigRewriter_$self$$.$config_$ = $JSCompiler_StaticMethods_mergeConfigs_$$($JSCompiler_StaticMethods_handleConfigRewriter_$self$$, $config$jscomp$30$$);
      $TAG$jscomp$5$$;
    }, function($JSCompiler_StaticMethods_handleConfigRewriter_$self$$) {
      _.$user$$module$src$log$$().error($TAG$jscomp$5$$, "Error rewriting configuration: ", $configRewriterUrl$jscomp$1$$, $JSCompiler_StaticMethods_handleConfigRewriter_$self$$);
    });
  });
}, $JSCompiler_StaticMethods_handleVarGroups_$$ = function($JSCompiler_StaticMethods_handleVarGroups_$self$$, $pubConfig$$) {
  var $TAG$jscomp$6_pubRewriterConfig_vendorVarGroups$$ = $pubConfig$$.configRewriter, $pubVarGroups$$ = $TAG$jscomp$6_pubRewriterConfig_vendorVarGroups$$ && $TAG$jscomp$6_pubRewriterConfig_vendorVarGroups$$.varGroups;
  $TAG$jscomp$6_pubRewriterConfig_vendorVarGroups$$ = ($JSCompiler_StaticMethods_getTypeConfig_$$($JSCompiler_StaticMethods_handleVarGroups_$self$$).configRewriter || {}).varGroups;
  if (!$pubVarGroups$$ && !$TAG$jscomp$6_pubRewriterConfig_vendorVarGroups$$) {
    return window.Promise.resolve();
  }
  if ($pubVarGroups$$ && !$TAG$jscomp$6_pubRewriterConfig_vendorVarGroups$$) {
    return $TAG$jscomp$6_pubRewriterConfig_vendorVarGroups$$ = $JSCompiler_StaticMethods_AnalyticsConfig$$module$extensions$amp_analytics$0_1$config_prototype$getName_$$($JSCompiler_StaticMethods_handleVarGroups_$self$$), _.$user$$module$src$log$$().$Log$$module$src$log_prototype$warn$($TAG$jscomp$6_pubRewriterConfig_vendorVarGroups$$, "This analytics provider does not currently support varGroups"), window.Promise.resolve();
  }
  $pubConfig$$.configRewriter = $pubConfig$$.configRewriter || {};
  var $rewriterConfig$$ = $pubConfig$$.configRewriter;
  $rewriterConfig$$.vars = _.$dict$$module$src$utils$object$$({});
  var $allPromises$$ = [], $mergedConfig$$ = $pubVarGroups$$ || {};
  _.$deepMerge$$module$src$utils$object$$($mergedConfig$$, $TAG$jscomp$6_pubRewriterConfig_vendorVarGroups$$);
  Object.keys($mergedConfig$$).forEach(function($pubConfig$$) {
    $pubConfig$$ = $mergedConfig$$[$pubConfig$$];
    $pubConfig$$.enabled && ($pubConfig$$ = $shallowExpandObject$$module$extensions$amp_analytics$0_1$config$$($JSCompiler_StaticMethods_handleVarGroups_$self$$.$element_$, $pubConfig$$).then(function($JSCompiler_StaticMethods_handleVarGroups_$self$$) {
      delete $JSCompiler_StaticMethods_handleVarGroups_$self$$.enabled;
      Object.assign($rewriterConfig$$.vars, $JSCompiler_StaticMethods_handleVarGroups_$self$$);
    }), $allPromises$$.push($pubConfig$$));
  });
  return window.Promise.all($allPromises$$).then(function() {
    if (!Object.keys($rewriterConfig$$.vars).length) {
      return delete $pubConfig$$.configRewriter;
    }
    $pubVarGroups$$ && delete $rewriterConfig$$.varGroups;
  });
}, $JSCompiler_StaticMethods_mergeConfigs_$$ = function($JSCompiler_StaticMethods_mergeConfigs_$self$$, $rewrittenConfig$$) {
  var $config$jscomp$31$$ = _.$dict$$module$src$utils$object$$({vars:{requestCount:0}});
  $mergeObjects$$module$extensions$amp_analytics$0_1$config$$($expandConfigRequest$$module$extensions$amp_analytics$0_1$config$$($JSCompiler_StaticMethods_mergeConfigs_$self$$.$G$["default"] || {}), $config$jscomp$31$$);
  $mergeObjects$$module$extensions$amp_analytics$0_1$config$$($expandConfigRequest$$module$extensions$amp_analytics$0_1$config$$($JSCompiler_StaticMethods_getTypeConfig_$$($JSCompiler_StaticMethods_mergeConfigs_$self$$)), $config$jscomp$31$$, !0);
  $mergeObjects$$module$extensions$amp_analytics$0_1$config$$($expandConfigRequest$$module$extensions$amp_analytics$0_1$config$$($rewrittenConfig$$), $config$jscomp$31$$);
  return $config$jscomp$31$$;
}, $JSCompiler_StaticMethods_getTypeConfig_$$ = function($JSCompiler_StaticMethods_getTypeConfig_$self$$) {
  var $type$jscomp$162$$ = $JSCompiler_StaticMethods_getTypeConfig_$self$$.$element_$.getAttribute("type");
  return $JSCompiler_StaticMethods_getTypeConfig_$self$$.$G$[$type$jscomp$162$$] || {};
}, $JSCompiler_StaticMethods_AnalyticsConfig$$module$extensions$amp_analytics$0_1$config_prototype$getName_$$ = function($JSCompiler_StaticMethods_AnalyticsConfig$$module$extensions$amp_analytics$0_1$config_prototype$getName_$self$$) {
  return "AmpAnalytics " + ($JSCompiler_StaticMethods_AnalyticsConfig$$module$extensions$amp_analytics$0_1$config_prototype$getName_$self$$.$element_$.getAttribute("id") || "<unknown id>");
}, $mergeObjects$$module$extensions$amp_analytics$0_1$config$$ = function($from$jscomp$3$$, $to$jscomp$2$$, $opt_predefinedConfig$$) {
  if (null === $to$jscomp$2$$ || void 0 === $to$jscomp$2$$) {
    $to$jscomp$2$$ = {};
  }
  for (var $property$jscomp$13$$ in $from$jscomp$3$$) {
    _.$hasOwn$$module$src$utils$object$$($from$jscomp$3$$, $property$jscomp$13$$) && (_.$isArray$$module$src$types$$($from$jscomp$3$$[$property$jscomp$13$$]) ? (_.$isArray$$module$src$types$$($to$jscomp$2$$[$property$jscomp$13$$]) || ($to$jscomp$2$$[$property$jscomp$13$$] = []), $to$jscomp$2$$[$property$jscomp$13$$] = $mergeObjects$$module$extensions$amp_analytics$0_1$config$$($from$jscomp$3$$[$property$jscomp$13$$], $to$jscomp$2$$[$property$jscomp$13$$], $opt_predefinedConfig$$)) : _.$isObject$$module$src$types$$($from$jscomp$3$$[$property$jscomp$13$$]) ? 
    (_.$isObject$$module$src$types$$($to$jscomp$2$$[$property$jscomp$13$$]) || ($to$jscomp$2$$[$property$jscomp$13$$] = {}), $to$jscomp$2$$[$property$jscomp$13$$] = $mergeObjects$$module$extensions$amp_analytics$0_1$config$$($from$jscomp$3$$[$property$jscomp$13$$], $to$jscomp$2$$[$property$jscomp$13$$], $opt_predefinedConfig$$)) : $to$jscomp$2$$[$property$jscomp$13$$] = $from$jscomp$3$$[$property$jscomp$13$$]);
  }
  return $to$jscomp$2$$;
}, $expandConfigRequest$$module$extensions$amp_analytics$0_1$config$$ = function($config$jscomp$32$$) {
  if (!$config$jscomp$32$$.requests) {
    return $config$jscomp$32$$;
  }
  for (var $k$jscomp$21$$ in $config$jscomp$32$$.requests) {
    if (_.$hasOwn$$module$src$utils$object$$($config$jscomp$32$$.requests, $k$jscomp$21$$)) {
      var $JSCompiler_temp_const$jscomp$644$$ = $config$jscomp$32$$.requests;
      var $JSCompiler_inline_result$jscomp$645_request$jscomp$inline_2440$$ = $config$jscomp$32$$.requests[$k$jscomp$21$$];
      $JSCompiler_inline_result$jscomp$645_request$jscomp$inline_2440$$ = _.$isObject$$module$src$types$$($JSCompiler_inline_result$jscomp$645_request$jscomp$inline_2440$$) ? $JSCompiler_inline_result$jscomp$645_request$jscomp$inline_2440$$ : {baseUrl:$JSCompiler_inline_result$jscomp$645_request$jscomp$inline_2440$$};
      $JSCompiler_temp_const$jscomp$644$$[$k$jscomp$21$$] = $JSCompiler_inline_result$jscomp$645_request$jscomp$inline_2440$$;
    }
  }
  return $config$jscomp$32$$;
}, $shallowExpandObject$$module$extensions$amp_analytics$0_1$config$$ = function($element$jscomp$305$$, $obj$jscomp$42$$) {
  var $expandedObj$$ = {}, $keys$jscomp$7$$ = [], $expansionPromises$$ = [];
  Object.keys($obj$jscomp$42$$).forEach(function($expandedObj$$) {
    $keys$jscomp$7$$.push($expandedObj$$);
    $expandedObj$$ = $JSCompiler_StaticMethods_expandStringAsync$$(_.$Services$$module$src$services$urlReplacementsForDoc$$($element$jscomp$305$$), $obj$jscomp$42$$[$expandedObj$$]);
    $expansionPromises$$.push($expandedObj$$);
  });
  return window.Promise.all($expansionPromises$$).then(function($element$jscomp$305$$) {
    $keys$jscomp$7$$.forEach(function($obj$jscomp$42$$, $keys$jscomp$7$$) {
      return $expandedObj$$[$obj$jscomp$42$$] = $element$jscomp$305$$[$keys$jscomp$7$$];
    });
    return $expandedObj$$;
  });
}, $crc32$$module$extensions$amp_analytics$0_1$crc32$$ = function($bytes$jscomp$12_str$jscomp$20$$) {
  if (!$crcTable$$module$extensions$amp_analytics$0_1$crc32$$) {
    for (var $crc_crcTable$jscomp$inline_6019$$ = Array(256), $i$jscomp$198_i$jscomp$inline_6020$$ = 0; 256 > $i$jscomp$198_i$jscomp$inline_6020$$; $i$jscomp$198_i$jscomp$inline_6020$$++) {
      for (var $c$jscomp$inline_6021$$ = $i$jscomp$198_i$jscomp$inline_6020$$, $j$jscomp$inline_6022$$ = 0; 8 > $j$jscomp$inline_6022$$; $j$jscomp$inline_6022$$++) {
        $c$jscomp$inline_6021$$ = $c$jscomp$inline_6021$$ & 1 ? $c$jscomp$inline_6021$$ >>> 1 ^ 3988292384 : $c$jscomp$inline_6021$$ >>> 1;
      }
      $crc_crcTable$jscomp$inline_6019$$[$i$jscomp$198_i$jscomp$inline_6020$$] = $c$jscomp$inline_6021$$;
    }
    $crcTable$$module$extensions$amp_analytics$0_1$crc32$$ = $crc_crcTable$jscomp$inline_6019$$;
  }
  $bytes$jscomp$12_str$jscomp$20$$ = _.$utf8Encode$$module$src$utils$bytes$$($bytes$jscomp$12_str$jscomp$20$$);
  $crc_crcTable$jscomp$inline_6019$$ = 4294967295;
  for ($i$jscomp$198_i$jscomp$inline_6020$$ = 0; $i$jscomp$198_i$jscomp$inline_6020$$ < $bytes$jscomp$12_str$jscomp$20$$.length; $i$jscomp$198_i$jscomp$inline_6020$$++) {
    $crc_crcTable$jscomp$inline_6019$$ = $crc_crcTable$jscomp$inline_6019$$ >>> 8 ^ $crcTable$$module$extensions$amp_analytics$0_1$crc32$$[($crc_crcTable$jscomp$inline_6019$$ ^ $bytes$jscomp$12_str$jscomp$20$$[$i$jscomp$198_i$jscomp$inline_6020$$]) & 255];
  }
  return ($crc_crcTable$jscomp$inline_6019$$ ^ -1) >>> 0;
}, $createLinker$$module$extensions$amp_analytics$0_1$linker$$ = function($ids$jscomp$1_serializedIds$$) {
  $ids$jscomp$1_serializedIds$$ = $serialize$$module$extensions$amp_analytics$0_1$linker$$($ids$jscomp$1_serializedIds$$);
  return "" === $ids$jscomp$1_serializedIds$$ ? "" : ["1", $crc32$$module$extensions$amp_analytics$0_1$crc32$$([$getFingerprint$$module$extensions$amp_analytics$0_1$linker$$(), Math.floor(Date.now() / 60000), $ids$jscomp$1_serializedIds$$].join("*")).toString(36), $ids$jscomp$1_serializedIds$$].join("*");
}, $getFingerprint$$module$extensions$amp_analytics$0_1$linker$$ = function() {
  var $win$jscomp$inline_2444$$ = window;
  return [window.navigator.userAgent, (new Date).getTimezoneOffset(), $win$jscomp$inline_2444$$.navigator.$G$ || $win$jscomp$inline_2444$$.navigator.language].join("*");
}, $serialize$$module$extensions$amp_analytics$0_1$linker$$ = function($pairs$jscomp$1$$) {
  return $pairs$jscomp$1$$ ? Object.keys($pairs$jscomp$1$$).filter(function($pairs$jscomp$1$$) {
    var $key$jscomp$93$$ = $KEY_VALIDATOR$$module$extensions$amp_analytics$0_1$linker$$.test($pairs$jscomp$1$$);
    $key$jscomp$93$$ || _.$user$$module$src$log$$().error("amp-analytics/linker", "Invalid linker key: " + $pairs$jscomp$1$$);
    return $key$jscomp$93$$;
  }).map(function($key$jscomp$94$$) {
    return $key$jscomp$94$$ + "*" + $base64UrlEncodeFromString$$module$src$utils$base64$$(String($pairs$jscomp$1$$[$key$jscomp$94$$]));
  }).join("*") : "";
}, $LinkerReader$$module$extensions$amp_analytics$0_1$linker_reader$$ = function($win$jscomp$299$$) {
  this.$F$ = $win$jscomp$299$$;
  this.$D$ = {};
}, $ExpansionOptions$$module$extensions$amp_analytics$0_1$variables$$ = function($vars$jscomp$12$$, $opt_iterations$$, $opt_noEncode$jscomp$1$$) {
  this.$vars$ = $vars$jscomp$12$$;
  this.iterations = void 0 === $opt_iterations$$ ? 2 : $opt_iterations$$;
  this.$F$ = !!$opt_noEncode$jscomp$1$$;
  this.$D$ = {};
}, $substrMacro$$module$extensions$amp_analytics$0_1$variables$$ = function($str$jscomp$22$$, $s$jscomp$29_start$jscomp$13$$, $opt_l$$) {
  $s$jscomp$29_start$jscomp$13$$ = Number($s$jscomp$29_start$jscomp$13$$);
  var $length$jscomp$35$$ = $str$jscomp$22$$.length;
  $opt_l$$ && ($length$jscomp$35$$ = Number($opt_l$$));
  return $str$jscomp$22$$.substr($s$jscomp$29_start$jscomp$13$$, $length$jscomp$35$$);
}, $defaultMacro$$module$extensions$amp_analytics$0_1$variables$$ = function($value$jscomp$178$$, $defaultValue$jscomp$6$$) {
  return $value$jscomp$178$$ && $value$jscomp$178$$.length ? $value$jscomp$178$$ : _.$JSCompiler_StaticMethods_assertString$$(_.$user$$module$src$log$$(), $defaultValue$jscomp$6$$);
}, $replaceMacro$$module$extensions$amp_analytics$0_1$variables$$ = function($string$jscomp$17$$, $matchPattern$$, $opt_newSubStr$$) {
  $matchPattern$$ || _.$user$$module$src$log$$().$Log$$module$src$log_prototype$warn$("amp-analytics/variables", "REPLACE macro must have two or more arguments");
  $opt_newSubStr$$ || ($opt_newSubStr$$ = "");
  return $string$jscomp$17$$.replace(new RegExp($matchPattern$$, "g"), $opt_newSubStr$$);
}, $VariableService$$module$extensions$amp_analytics$0_1$variables$$ = function($window$jscomp$27$$) {
  this.$G$ = $window$jscomp$27$$;
  this.$D$ = {};
  this.$D$.$DEFAULT = $defaultMacro$$module$extensions$amp_analytics$0_1$variables$$;
  this.$D$.$SUBSTR = $substrMacro$$module$extensions$amp_analytics$0_1$variables$$;
  $JSCompiler_StaticMethods_VariableService$$module$extensions$amp_analytics$0_1$variables_prototype$register_$$(this, "$TRIM", function($window$jscomp$27$$) {
    return $window$jscomp$27$$.trim();
  });
  $JSCompiler_StaticMethods_VariableService$$module$extensions$amp_analytics$0_1$variables_prototype$register_$$(this, "$TOLOWERCASE", function($window$jscomp$27$$) {
    return $window$jscomp$27$$.toLowerCase();
  });
  $JSCompiler_StaticMethods_VariableService$$module$extensions$amp_analytics$0_1$variables_prototype$register_$$(this, "$TOUPPERCASE", function($window$jscomp$27$$) {
    return $window$jscomp$27$$.toUpperCase();
  });
  $JSCompiler_StaticMethods_VariableService$$module$extensions$amp_analytics$0_1$variables_prototype$register_$$(this, "$NOT", function($window$jscomp$27$$) {
    return String(!$window$jscomp$27$$);
  });
  $JSCompiler_StaticMethods_VariableService$$module$extensions$amp_analytics$0_1$variables_prototype$register_$$(this, "$BASE64", function($window$jscomp$27$$) {
    return $base64UrlEncodeFromString$$module$src$utils$base64$$($window$jscomp$27$$);
  });
  $JSCompiler_StaticMethods_VariableService$$module$extensions$amp_analytics$0_1$variables_prototype$register_$$(this, "$HASH", this.$I$.bind(this));
  $JSCompiler_StaticMethods_VariableService$$module$extensions$amp_analytics$0_1$variables_prototype$register_$$(this, "$IF", function($window$jscomp$27$$, $thenValue$$, $elseValue$$) {
    return $window$jscomp$27$$ ? $thenValue$$ : $elseValue$$;
  });
  this.$D$.$REPLACE = $replaceMacro$$module$extensions$amp_analytics$0_1$variables$$;
}, $JSCompiler_StaticMethods_VariableService$$module$extensions$amp_analytics$0_1$variables_prototype$register_$$ = function($JSCompiler_StaticMethods_VariableService$$module$extensions$amp_analytics$0_1$variables_prototype$register_$self$$, $name$jscomp$196$$, $macro$jscomp$1$$) {
  $JSCompiler_StaticMethods_VariableService$$module$extensions$amp_analytics$0_1$variables_prototype$register_$self$$.$D$[$name$jscomp$196$$] = $macro$jscomp$1$$;
}, $JSCompiler_StaticMethods_expandTemplate$$ = function($JSCompiler_StaticMethods_expandTemplate$self$$, $template$jscomp$14$$, $options$jscomp$28$$) {
  return _.$tryResolve$$module$src$utils$promise$$($JSCompiler_StaticMethods_expandTemplate$self$$.$F$.bind($JSCompiler_StaticMethods_expandTemplate$self$$, $template$jscomp$14$$, $options$jscomp$28$$));
}, $encodeVars$$module$extensions$amp_analytics$0_1$variables$$ = function($$jscomp$destructuring$var287_raw$jscomp$3$$) {
  if (null == $$jscomp$destructuring$var287_raw$jscomp$3$$) {
    return "";
  }
  if (_.$isArray$$module$src$types$$($$jscomp$destructuring$var287_raw$jscomp$3$$)) {
    return $$jscomp$destructuring$var287_raw$jscomp$3$$.map($encodeVars$$module$extensions$amp_analytics$0_1$variables$$).join(",");
  }
  $$jscomp$destructuring$var287_raw$jscomp$3$$ = $getNameArgs$$module$extensions$amp_analytics$0_1$variables$$(String($$jscomp$destructuring$var287_raw$jscomp$3$$));
  var $argList$jscomp$3$$ = $$jscomp$destructuring$var287_raw$jscomp$3$$.$argList$;
  return (0,window.encodeURIComponent)($$jscomp$destructuring$var287_raw$jscomp$3$$.name) + $argList$jscomp$3$$;
}, $getNameArgs$$module$extensions$amp_analytics$0_1$variables$$ = function($key$jscomp$97_match$jscomp$22$$) {
  if (!$key$jscomp$97_match$jscomp$22$$) {
    return {name:"", $argList$:""};
  }
  $key$jscomp$97_match$jscomp$22$$ = $key$jscomp$97_match$jscomp$22$$.match($VARIABLE_ARGS_REGEXP$$module$extensions$amp_analytics$0_1$variables$$);
  return {name:$key$jscomp$97_match$jscomp$22$$[1] || $key$jscomp$97_match$jscomp$22$$[0], $argList$:$key$jscomp$97_match$jscomp$22$$[2] || ""};
}, $variableServiceFor$$module$extensions$amp_analytics$0_1$variables$$ = function($win$jscomp$303$$) {
  return _.$getService$$module$src$service$$($win$jscomp$303$$, "amp-analytics-variables");
}, $CookieWriter$$module$extensions$amp_analytics$0_1$cookie_writer$$ = function($win$jscomp$304$$, $element$jscomp$306$$, $config$jscomp$33$$) {
  this.$D$ = $win$jscomp$304$$;
  this.$element_$ = $element$jscomp$306$$;
  this.$I$ = _.$Services$$module$src$services$urlReplacementsForDoc$$($element$jscomp$306$$);
  this.$J$ = _.$getService$$module$src$service$$($win$jscomp$304$$, "amp-analyitcs-linker-reader");
  this.$F$ = null;
  this.$config_$ = $config$jscomp$33$$;
  this.$G$ = {};
}, $JSCompiler_StaticMethods_CookieWriter$$module$extensions$amp_analytics$0_1$cookie_writer_prototype$init_$$ = function($JSCompiler_StaticMethods_CookieWriter$$module$extensions$amp_analytics$0_1$cookie_writer_prototype$init_$self$$) {
  if (_.$isInFie$$module$src$friendly_iframe_embed$$($JSCompiler_StaticMethods_CookieWriter$$module$extensions$amp_analytics$0_1$cookie_writer_prototype$init_$self$$.$element_$) || _.$isProxyOrigin$$module$src$url$$($JSCompiler_StaticMethods_CookieWriter$$module$extensions$amp_analytics$0_1$cookie_writer_prototype$init_$self$$.$D$.location) || "inabox" == _.$getMode$$module$src$mode$$($JSCompiler_StaticMethods_CookieWriter$$module$extensions$amp_analytics$0_1$cookie_writer_prototype$init_$self$$.$D$).runtime || 
  !_.$hasOwn$$module$src$utils$object$$($JSCompiler_StaticMethods_CookieWriter$$module$extensions$amp_analytics$0_1$cookie_writer_prototype$init_$self$$.$config_$, "cookies")) {
    return window.Promise.resolve();
  }
  if (!_.$isObject$$module$src$types$$($JSCompiler_StaticMethods_CookieWriter$$module$extensions$amp_analytics$0_1$cookie_writer_prototype$init_$self$$.$config_$.cookies)) {
    return _.$user$$module$src$log$$().error("amp-analytics/cookie-writer", "cookies config must be an object"), window.Promise.resolve();
  }
  $JSCompiler_StaticMethods_registerDynamicBinding_$$($JSCompiler_StaticMethods_CookieWriter$$module$extensions$amp_analytics$0_1$cookie_writer_prototype$init_$self$$);
  var $inputConfig$$ = $JSCompiler_StaticMethods_CookieWriter$$module$extensions$amp_analytics$0_1$cookie_writer_prototype$init_$self$$.$config_$.cookies;
  if (!1 === $inputConfig$$.enabled) {
    return window.Promise.resolve();
  }
  for (var $ids$jscomp$2$$ = Object.keys($inputConfig$$), $promises$jscomp$14$$ = [], $i$jscomp$202$$ = 0; $i$jscomp$202$$ < $ids$jscomp$2$$.length; $i$jscomp$202$$++) {
    var $cookieName$jscomp$3$$ = $ids$jscomp$2$$[$i$jscomp$202$$], $cookieObj$$ = $inputConfig$$[$cookieName$jscomp$3$$];
    $JSCompiler_StaticMethods_isValidCookieConfig_$$($cookieName$jscomp$3$$, $cookieObj$$) && $promises$jscomp$14$$.push($JSCompiler_StaticMethods_expandAndWrite_$$($JSCompiler_StaticMethods_CookieWriter$$module$extensions$amp_analytics$0_1$cookie_writer_prototype$init_$self$$, $cookieName$jscomp$3$$, $cookieObj$$.value));
  }
  return window.Promise.all($promises$jscomp$14$$);
}, $JSCompiler_StaticMethods_isValidCookieConfig_$$ = function($cookieName$jscomp$4_str$jscomp$23$$, $cookieConfig_name$jscomp$199$$) {
  if ($RESERVED_KEYS$$module$extensions$amp_analytics$0_1$cookie_writer$$[$cookieName$jscomp$4_str$jscomp$23$$]) {
    return !1;
  }
  if (!_.$isObject$$module$src$types$$($cookieConfig_name$jscomp$199$$)) {
    return _.$user$$module$src$log$$().error("amp-analytics/cookie-writer", "cookieValue must be configured in an object"), !1;
  }
  if (!_.$hasOwn$$module$src$utils$object$$($cookieConfig_name$jscomp$199$$, "value")) {
    return _.$user$$module$src$log$$().error("amp-analytics/cookie-writer", "value is required in the cookieValue object"), !1;
  }
  $cookieName$jscomp$4_str$jscomp$23$$ = $cookieConfig_name$jscomp$199$$.value;
  $cookieConfig_name$jscomp$199$$ = $getNameArgs$$module$extensions$amp_analytics$0_1$variables$$($cookieName$jscomp$4_str$jscomp$23$$).name;
  return $EXPAND_WHITELIST$$module$extensions$amp_analytics$0_1$cookie_writer$$[$cookieConfig_name$jscomp$199$$] ? !0 : (_.$user$$module$src$log$$().error("amp-analytics/cookie-writer", "cookie value " + $cookieName$jscomp$4_str$jscomp$23$$ + " not supported. Only QUERY_PARAM and LINKER_PARAM is supported"), !1);
}, $JSCompiler_StaticMethods_expandAndWrite_$$ = function($JSCompiler_StaticMethods_expandAndWrite_$self$$, $cookieName$jscomp$5$$, $cookieValue$$) {
  return $JSCompiler_StaticMethods_expandStringAsync$$($JSCompiler_StaticMethods_expandAndWrite_$self$$.$I$, $cookieValue$$, $JSCompiler_StaticMethods_expandAndWrite_$self$$.$G$, $EXPAND_WHITELIST$$module$extensions$amp_analytics$0_1$cookie_writer$$).then(function($cookieValue$$) {
    $cookieValue$$ && _.$setCookie$$module$src$cookies$$($JSCompiler_StaticMethods_expandAndWrite_$self$$.$D$, $cookieName$jscomp$5$$, $cookieValue$$, Date.now() + 31536E6);
  }).catch(function($JSCompiler_StaticMethods_expandAndWrite_$self$$) {
    _.$user$$module$src$log$$().error("amp-analytics/cookie-writer", "Error expanding cookie string", $JSCompiler_StaticMethods_expandAndWrite_$self$$);
  });
}, $JSCompiler_StaticMethods_registerDynamicBinding_$$ = function($JSCompiler_StaticMethods_registerDynamicBinding_$self$$) {
  $JSCompiler_StaticMethods_registerDynamicBinding_$self$$.$G$.LINKER_PARAM = function($name$jscomp$200$$, $id$jscomp$51$$) {
    return $JSCompiler_StaticMethods_registerDynamicBinding_$self$$.$J$.get($name$jscomp$200$$, $id$jscomp$51$$);
  };
}, $NO_UNLISTEN$$module$extensions$amp_analytics$0_1$events$$ = function() {
}, $getTrackerKeyName$$module$extensions$amp_analytics$0_1$events$$ = function($eventType$jscomp$32$$) {
  return _.$startsWith$$module$src$string$$($eventType$jscomp$32$$, "video") ? "video" : $TRACKER_TYPE$$module$extensions$amp_analytics$0_1$events$$[$eventType$jscomp$32$$] || _.$isEnumValue$$module$src$types$$($AnalyticsEventType$$module$extensions$amp_analytics$0_1$events$$, $eventType$jscomp$32$$) ? _.$hasOwn$$module$src$utils$object$$($TRACKER_TYPE$$module$extensions$amp_analytics$0_1$events$$, $eventType$jscomp$32$$) ? $TRACKER_TYPE$$module$extensions$amp_analytics$0_1$events$$[$eventType$jscomp$32$$].name : 
  $eventType$jscomp$32$$ : "custom";
}, $getTrackerTypesForParentType$$module$extensions$amp_analytics$0_1$events$$ = function($parentType$$) {
  var $filtered$$ = {};
  Object.keys($TRACKER_TYPE$$module$extensions$amp_analytics$0_1$events$$).forEach(function($key$jscomp$99$$) {
    _.$hasOwn$$module$src$utils$object$$($TRACKER_TYPE$$module$extensions$amp_analytics$0_1$events$$, $key$jscomp$99$$) && -1 != $TRACKER_TYPE$$module$extensions$amp_analytics$0_1$events$$[$key$jscomp$99$$].$allowedFor$.indexOf($parentType$$) && ($filtered$$[$key$jscomp$99$$] = $TRACKER_TYPE$$module$extensions$amp_analytics$0_1$events$$[$key$jscomp$99$$].$klass$);
  }, this);
  return $filtered$$;
}, $AnalyticsEvent$$module$extensions$amp_analytics$0_1$events$$ = function($target$jscomp$110$$, $type$jscomp$164$$, $opt_vars$jscomp$6$$) {
  this.target = $target$jscomp$110$$;
  this.type = $type$jscomp$164$$;
  this.vars = $opt_vars$jscomp$6$$ || {};
}, $EventTracker$$module$extensions$amp_analytics$0_1$events$$ = function($root$jscomp$40$$) {
  this.$D$ = $root$jscomp$40$$;
}, $CustomEventTracker$$module$extensions$amp_analytics$0_1$events$$ = function($root$jscomp$41$$) {
  this.$D$ = $root$jscomp$41$$;
  var $$jscomp$this$jscomp$377$$ = this;
  this.$I$ = {};
  this.$F$ = {};
  this.$G$ = {};
  (0,window.setTimeout)(function() {
    $$jscomp$this$jscomp$377$$.$F$ = void 0;
  }, 10000);
}, $ClickEventTracker$$module$extensions$amp_analytics$0_1$events$$ = function($root$jscomp$42$$) {
  this.$D$ = $root$jscomp$42$$;
  this.$F$ = new _.$Observable$$module$src$observable$$;
  this.$G$ = this.$F$.$fire$.bind(this.$F$);
  this.$D$.$AnalyticsRoot$$module$extensions$amp_analytics$0_1$analytics_root_prototype$getRoot$().addEventListener("click", this.$G$);
}, $ScrollEventTracker$$module$extensions$amp_analytics$0_1$events$$ = function($root$jscomp$43$$) {
  this.$G$ = this.$D$ = $root$jscomp$43$$;
  this.$F$ = null;
}, $JSCompiler_StaticMethods_normalizeBoundaries_$$ = function($bounds$$) {
  var $result$jscomp$33$$ = _.$dict$$module$src$utils$object$$({});
  if (!$bounds$$ || !Array.isArray($bounds$$)) {
    return $result$jscomp$33$$;
  }
  for (var $b$jscomp$12$$ = 0; $b$jscomp$12$$ < $bounds$$.length; $b$jscomp$12$$++) {
    var $bound$jscomp$2$$ = $bounds$$[$b$jscomp$12$$];
    if ("number" !== typeof $bound$jscomp$2$$ || !(0,window.isFinite)($bound$jscomp$2$$)) {
      _.$user$$module$src$log$$().error("amp-analytics/events", "Scroll trigger boundaries must be finite.");
      break;
    }
    $bound$jscomp$2$$ = Math.min(5 * Math.round($bound$jscomp$2$$ / 5), 100);
    $result$jscomp$33$$[$bound$jscomp$2$$] = !1;
  }
  return $result$jscomp$33$$;
}, $JSCompiler_StaticMethods_triggerScrollEvents_$$ = function($JSCompiler_StaticMethods_triggerScrollEvents_$self$$, $bounds$jscomp$1$$, $scrollPos$jscomp$1$$, $varName$jscomp$6$$, $listener$jscomp$71$$) {
  if ($scrollPos$jscomp$1$$) {
    for (var $b$jscomp$13$$ in $bounds$jscomp$1$$) {
      if (_.$hasOwn$$module$src$utils$object$$($bounds$jscomp$1$$, $b$jscomp$13$$)) {
        var $bound$jscomp$3_vars$jscomp$13$$ = (0,window.parseInt)($b$jscomp$13$$, 10);
        $bound$jscomp$3_vars$jscomp$13$$ > $scrollPos$jscomp$1$$ || $bounds$jscomp$1$$[$bound$jscomp$3_vars$jscomp$13$$] || ($bounds$jscomp$1$$[$bound$jscomp$3_vars$jscomp$13$$] = !0, $bound$jscomp$3_vars$jscomp$13$$ = {}, $bound$jscomp$3_vars$jscomp$13$$[$varName$jscomp$6$$] = $b$jscomp$13$$, $listener$jscomp$71$$(new $AnalyticsEvent$$module$extensions$amp_analytics$0_1$events$$($JSCompiler_StaticMethods_triggerScrollEvents_$self$$.$G$.$getRootElement$(), "scroll", $bound$jscomp$3_vars$jscomp$13$$)));
      }
    }
  }
}, $SignalTracker$$module$extensions$amp_analytics$0_1$events$$ = function($root$jscomp$44$$) {
  this.$D$ = $root$jscomp$44$$;
}, $IniLoadTracker$$module$extensions$amp_analytics$0_1$events$$ = function($root$jscomp$45$$) {
  this.$D$ = $root$jscomp$45$$;
}, $TimerEventHandler$$module$extensions$amp_analytics$0_1$events$$ = function($timerSpec$$, $opt_startBuilder$$, $opt_stopBuilder$$) {
  this.$D$ = void 0;
  this.$U$ = Number($timerSpec$$.interval) || 0;
  this.$W$ = "maxTimerLength" in $timerSpec$$ ? Number($timerSpec$$.maxTimerLength) : 7200;
  this.$V$ = "maxTimerLength" in $timerSpec$$;
  this.$R$ = "immediate" in $timerSpec$$ ? !!$timerSpec$$.immediate : !0;
  this.$F$ = this.$I$ = this.$P$ = null;
  this.$G$ = $opt_startBuilder$$ || null;
  this.$O$ = $opt_stopBuilder$$ || null;
  this.$K$ = this.$J$ = void 0;
}, $JSCompiler_StaticMethods_unlistenForStart_$$ = function($JSCompiler_StaticMethods_unlistenForStart_$self$$) {
  $JSCompiler_StaticMethods_unlistenForStart_$self$$.$I$ && ($JSCompiler_StaticMethods_unlistenForStart_$self$$.$I$(), $JSCompiler_StaticMethods_unlistenForStart_$self$$.$I$ = null);
}, $JSCompiler_StaticMethods_listenForStop_$$ = function($JSCompiler_StaticMethods_listenForStop_$self$$) {
  if ($JSCompiler_StaticMethods_listenForStop_$self$$.$O$) {
    try {
      $JSCompiler_StaticMethods_listenForStop_$self$$.$F$ = $JSCompiler_StaticMethods_listenForStop_$self$$.$O$();
    } catch ($e$214$$) {
      throw $JSCompiler_StaticMethods_listenForStop_$self$$.$dispose$(), $e$214$$;
    }
  }
}, $JSCompiler_StaticMethods_startIntervalInWindow$$ = function($JSCompiler_StaticMethods_startIntervalInWindow$self$$, $win$jscomp$305$$, $timerCallback$$, $timeoutCallback$$) {
  $JSCompiler_StaticMethods_startIntervalInWindow$self$$.$D$ || ($JSCompiler_StaticMethods_startIntervalInWindow$self$$.$J$ = Date.now(), $JSCompiler_StaticMethods_startIntervalInWindow$self$$.$K$ = void 0, $JSCompiler_StaticMethods_startIntervalInWindow$self$$.$P$ = $timerCallback$$, $JSCompiler_StaticMethods_startIntervalInWindow$self$$.$D$ = $win$jscomp$305$$.setInterval(function() {
    $timerCallback$$();
  }, 1000 * $JSCompiler_StaticMethods_startIntervalInWindow$self$$.$U$), (!$JSCompiler_StaticMethods_startIntervalInWindow$self$$.$O$ || $JSCompiler_StaticMethods_startIntervalInWindow$self$$.$O$ && $JSCompiler_StaticMethods_startIntervalInWindow$self$$.$V$) && $win$jscomp$305$$.setTimeout(function() {
    $timeoutCallback$$();
  }, 1000 * $JSCompiler_StaticMethods_startIntervalInWindow$self$$.$W$), $JSCompiler_StaticMethods_unlistenForStart_$$($JSCompiler_StaticMethods_startIntervalInWindow$self$$), $JSCompiler_StaticMethods_startIntervalInWindow$self$$.$R$ && $timerCallback$$(), $JSCompiler_StaticMethods_listenForStop_$$($JSCompiler_StaticMethods_startIntervalInWindow$self$$));
}, $JSCompiler_StaticMethods_TimerEventHandler$$module$extensions$amp_analytics$0_1$events_prototype$stopTimer_$$ = function($JSCompiler_StaticMethods_TimerEventHandler$$module$extensions$amp_analytics$0_1$events_prototype$stopTimer_$self$$, $win$jscomp$306$$) {
  $JSCompiler_StaticMethods_TimerEventHandler$$module$extensions$amp_analytics$0_1$events_prototype$stopTimer_$self$$.$D$ && ($JSCompiler_StaticMethods_TimerEventHandler$$module$extensions$amp_analytics$0_1$events_prototype$stopTimer_$self$$.$P$(), $JSCompiler_StaticMethods_TimerEventHandler$$module$extensions$amp_analytics$0_1$events_prototype$stopTimer_$self$$.$P$ = null, $win$jscomp$306$$.clearInterval($JSCompiler_StaticMethods_TimerEventHandler$$module$extensions$amp_analytics$0_1$events_prototype$stopTimer_$self$$.$D$), 
  $JSCompiler_StaticMethods_TimerEventHandler$$module$extensions$amp_analytics$0_1$events_prototype$stopTimer_$self$$.$D$ = void 0, $JSCompiler_StaticMethods_TimerEventHandler$$module$extensions$amp_analytics$0_1$events_prototype$stopTimer_$self$$.$K$ = void 0, $JSCompiler_StaticMethods_TimerEventHandler$$module$extensions$amp_analytics$0_1$events_prototype$stopTimer_$self$$.$F$ && ($JSCompiler_StaticMethods_TimerEventHandler$$module$extensions$amp_analytics$0_1$events_prototype$stopTimer_$self$$.$F$(), 
  $JSCompiler_StaticMethods_TimerEventHandler$$module$extensions$amp_analytics$0_1$events_prototype$stopTimer_$self$$.$F$ = null), $JSCompiler_StaticMethods_TimerEventHandler$$module$extensions$amp_analytics$0_1$events_prototype$stopTimer_$self$$.$G$ && ($JSCompiler_StaticMethods_TimerEventHandler$$module$extensions$amp_analytics$0_1$events_prototype$stopTimer_$self$$.$I$ = $JSCompiler_StaticMethods_TimerEventHandler$$module$extensions$amp_analytics$0_1$events_prototype$stopTimer_$self$$.$G$()));
}, $TimerEventTracker$$module$extensions$amp_analytics$0_1$events$$ = function($root$jscomp$46$$) {
  this.$D$ = $root$jscomp$46$$;
  this.$F$ = {};
  this.$G$ = 1;
}, $JSCompiler_StaticMethods_getTracker_$$ = function($JSCompiler_StaticMethods_getTracker_$self$$, $config$jscomp$40_eventType$jscomp$42_trackerKey$$) {
  $config$jscomp$40_eventType$jscomp$42_trackerKey$$ = _.$JSCompiler_StaticMethods_assertString$$(_.$user$$module$src$log$$(), $config$jscomp$40_eventType$jscomp$42_trackerKey$$.on);
  $config$jscomp$40_eventType$jscomp$42_trackerKey$$ = $getTrackerKeyName$$module$extensions$amp_analytics$0_1$events$$($config$jscomp$40_eventType$jscomp$42_trackerKey$$);
  return $JSCompiler_StaticMethods_getTrackerForWhitelist$$($JSCompiler_StaticMethods_getTracker_$self$$.$D$, $config$jscomp$40_eventType$jscomp$42_trackerKey$$, $getTrackerTypesForParentType$$module$extensions$amp_analytics$0_1$events$$("timer"));
}, $VideoEventTracker$$module$extensions$amp_analytics$0_1$events$$ = function($root$jscomp$47$$) {
  this.$D$ = $root$jscomp$47$$;
  var $$jscomp$this$jscomp$384$$ = this;
  this.$F$ = new _.$Observable$$module$src$observable$$;
  this.$G$ = this.$F$.$fire$.bind(this.$F$);
  Object.keys($VideoAnalyticsEvents$$module$src$video_interface$$).forEach(function($root$jscomp$47$$) {
    $$jscomp$this$jscomp$384$$.$D$.$AnalyticsRoot$$module$extensions$amp_analytics$0_1$analytics_root_prototype$getRoot$().addEventListener($VideoAnalyticsEvents$$module$src$video_interface$$[$root$jscomp$47$$], $$jscomp$this$jscomp$384$$.$G$);
  });
}, $VisibilityTracker$$module$extensions$amp_analytics$0_1$events$$ = function($root$jscomp$49$$) {
  this.$D$ = $root$jscomp$49$$;
  this.$F$ = {};
}, $JSCompiler_StaticMethods_VisibilityTracker$$module$extensions$amp_analytics$0_1$events_prototype$getReadyPromise$$ = function($JSCompiler_StaticMethods_VisibilityTracker$$module$extensions$amp_analytics$0_1$events_prototype$getReadyPromise$self$$, $waitForSpec$jscomp$1$$, $selector$jscomp$26_trackerWhitelist_waitForTracker$$, $opt_element$jscomp$17$$) {
  if (!$waitForSpec$jscomp$1$$) {
    if ($selector$jscomp$26_trackerWhitelist_waitForTracker$$) {
      $waitForSpec$jscomp$1$$ = "ini-load";
    } else {
      return null;
    }
  }
  $selector$jscomp$26_trackerWhitelist_waitForTracker$$ = $getTrackerTypesForParentType$$module$extensions$amp_analytics$0_1$events$$("visible");
  if ($selector$jscomp$26_trackerWhitelist_waitForTracker$$ = $JSCompiler_StaticMethods_VisibilityTracker$$module$extensions$amp_analytics$0_1$events_prototype$getReadyPromise$self$$.$F$[$waitForSpec$jscomp$1$$] || $JSCompiler_StaticMethods_getTrackerForWhitelist$$($JSCompiler_StaticMethods_VisibilityTracker$$module$extensions$amp_analytics$0_1$events_prototype$getReadyPromise$self$$.$D$, $waitForSpec$jscomp$1$$, $selector$jscomp$26_trackerWhitelist_waitForTracker$$)) {
    $JSCompiler_StaticMethods_VisibilityTracker$$module$extensions$amp_analytics$0_1$events_prototype$getReadyPromise$self$$.$F$[$waitForSpec$jscomp$1$$] = $selector$jscomp$26_trackerWhitelist_waitForTracker$$;
  } else {
    return null;
  }
  return $opt_element$jscomp$17$$ ? $selector$jscomp$26_trackerWhitelist_waitForTracker$$.$getElementSignal$($waitForSpec$jscomp$1$$, $opt_element$jscomp$17$$) : $selector$jscomp$26_trackerWhitelist_waitForTracker$$.$getRootSignal$($waitForSpec$jscomp$1$$);
}, $AnalyticsGroup$$module$extensions$amp_analytics$0_1$analytics_group$$ = function($root$jscomp$50$$, $analyticsElement$jscomp$1$$) {
  this.$F$ = $root$jscomp$50$$;
  this.$G$ = $analyticsElement$jscomp$1$$;
  this.$D$ = [];
}, $ScrollManager$$module$extensions$amp_analytics$0_1$scroll_manager$$ = function($ampdoc$jscomp$127$$) {
  this.$viewport_$ = _.$Services$$module$src$services$viewportForDoc$$($ampdoc$jscomp$127$$);
  this.$D$ = null;
  this.$F$ = new _.$Observable$$module$src$observable$$;
}, $getMinOpacity$$module$extensions$amp_analytics$0_1$opacity$$ = function($el$jscomp$37_minOpacityFound$$) {
  var $el$jscomp$inline_2514_i$jscomp$205_parent$jscomp$inline_2516$$ = $el$jscomp$37_minOpacityFound$$.parentElement, $nodeList$jscomp$inline_2515$$ = [];
  if ($el$jscomp$inline_2514_i$jscomp$205_parent$jscomp$inline_2516$$) {
    var $$jscomp$inline_2521_el$jscomp$inline_2520_element$jscomp$inline_2517_opacity$jscomp$1_opacityValue$jscomp$inline_2523$$ = $el$jscomp$inline_2514_i$jscomp$205_parent$jscomp$inline_2516$$;
    $nodeList$jscomp$inline_2515$$.push($$jscomp$inline_2521_el$jscomp$inline_2520_element$jscomp$inline_2517_opacity$jscomp$1_opacityValue$jscomp$inline_2523$$);
    for (var $i$jscomp$inline_2518_opacity$jscomp$inline_2522$$ = 0; 50 > $i$jscomp$inline_2518_opacity$jscomp$inline_2522$$; $i$jscomp$inline_2518_opacity$jscomp$inline_2522$$++) {
      if (($el$jscomp$inline_2514_i$jscomp$205_parent$jscomp$inline_2516$$ = $$jscomp$inline_2521_el$jscomp$inline_2520_element$jscomp$inline_2517_opacity$jscomp$1_opacityValue$jscomp$inline_2523$$.parentNode || $$jscomp$inline_2521_el$jscomp$inline_2520_element$jscomp$inline_2517_opacity$jscomp$1_opacityValue$jscomp$inline_2523$$.parentElement) && 1 == $el$jscomp$inline_2514_i$jscomp$205_parent$jscomp$inline_2516$$.nodeType) {
        $$jscomp$inline_2521_el$jscomp$inline_2520_element$jscomp$inline_2517_opacity$jscomp$1_opacityValue$jscomp$inline_2523$$ = $el$jscomp$inline_2514_i$jscomp$205_parent$jscomp$inline_2516$$, $nodeList$jscomp$inline_2515$$.push($$jscomp$inline_2521_el$jscomp$inline_2520_element$jscomp$inline_2517_opacity$jscomp$1_opacityValue$jscomp$inline_2523$$);
      } else {
        if ($el$jscomp$inline_2514_i$jscomp$205_parent$jscomp$inline_2516$$ && 9 == $el$jscomp$inline_2514_i$jscomp$205_parent$jscomp$inline_2516$$.nodeType) {
          if (($el$jscomp$inline_2514_i$jscomp$205_parent$jscomp$inline_2516$$ = $$jscomp$inline_2521_el$jscomp$inline_2520_element$jscomp$inline_2517_opacity$jscomp$1_opacityValue$jscomp$inline_2523$$.ownerDocument.defaultView.frameElement) && 1 == $el$jscomp$inline_2514_i$jscomp$205_parent$jscomp$inline_2516$$.nodeType) {
            $$jscomp$inline_2521_el$jscomp$inline_2520_element$jscomp$inline_2517_opacity$jscomp$1_opacityValue$jscomp$inline_2523$$ = $el$jscomp$inline_2514_i$jscomp$205_parent$jscomp$inline_2516$$, $nodeList$jscomp$inline_2515$$.push($$jscomp$inline_2521_el$jscomp$inline_2520_element$jscomp$inline_2517_opacity$jscomp$1_opacityValue$jscomp$inline_2523$$);
          } else {
            break;
          }
        } else {
          break;
        }
      }
    }
  }
  $nodeList$jscomp$inline_2515$$.push($el$jscomp$37_minOpacityFound$$);
  $el$jscomp$37_minOpacityFound$$ = 1;
  for ($el$jscomp$inline_2514_i$jscomp$205_parent$jscomp$inline_2516$$ = 0; $el$jscomp$inline_2514_i$jscomp$205_parent$jscomp$inline_2516$$ < $nodeList$jscomp$inline_2515$$.length && (($$jscomp$inline_2521_el$jscomp$inline_2520_element$jscomp$inline_2517_opacity$jscomp$1_opacityValue$jscomp$inline_2523$$ = $nodeList$jscomp$inline_2515$$[$el$jscomp$inline_2514_i$jscomp$205_parent$jscomp$inline_2516$$]) ? ($$jscomp$inline_2521_el$jscomp$inline_2520_element$jscomp$inline_2517_opacity$jscomp$1_opacityValue$jscomp$inline_2523$$ = 
  _.$computedStyle$$module$src$style$$(window, $$jscomp$inline_2521_el$jscomp$inline_2520_element$jscomp$inline_2517_opacity$jscomp$1_opacityValue$jscomp$inline_2523$$), $i$jscomp$inline_2518_opacity$jscomp$inline_2522$$ = $$jscomp$inline_2521_el$jscomp$inline_2520_element$jscomp$inline_2517_opacity$jscomp$1_opacityValue$jscomp$inline_2523$$.opacity, "hidden" === $$jscomp$inline_2521_el$jscomp$inline_2520_element$jscomp$inline_2517_opacity$jscomp$1_opacityValue$jscomp$inline_2523$$.visibility ? $$jscomp$inline_2521_el$jscomp$inline_2520_element$jscomp$inline_2517_opacity$jscomp$1_opacityValue$jscomp$inline_2523$$ = 
  0 : ($$jscomp$inline_2521_el$jscomp$inline_2520_element$jscomp$inline_2517_opacity$jscomp$1_opacityValue$jscomp$inline_2523$$ = "" === $i$jscomp$inline_2518_opacity$jscomp$inline_2522$$ ? 1 : (0,window.parseFloat)($i$jscomp$inline_2518_opacity$jscomp$inline_2522$$), $$jscomp$inline_2521_el$jscomp$inline_2520_element$jscomp$inline_2517_opacity$jscomp$1_opacityValue$jscomp$inline_2523$$ = (0,window.isNaN)($$jscomp$inline_2521_el$jscomp$inline_2520_element$jscomp$inline_2517_opacity$jscomp$1_opacityValue$jscomp$inline_2523$$) ? 
  1 : $$jscomp$inline_2521_el$jscomp$inline_2520_element$jscomp$inline_2517_opacity$jscomp$1_opacityValue$jscomp$inline_2523$$)) : $$jscomp$inline_2521_el$jscomp$inline_2520_element$jscomp$inline_2517_opacity$jscomp$1_opacityValue$jscomp$inline_2523$$ = 1, $$jscomp$inline_2521_el$jscomp$inline_2520_element$jscomp$inline_2517_opacity$jscomp$1_opacityValue$jscomp$inline_2523$$ < $el$jscomp$37_minOpacityFound$$ && ($el$jscomp$37_minOpacityFound$$ = $$jscomp$inline_2521_el$jscomp$inline_2520_element$jscomp$inline_2517_opacity$jscomp$1_opacityValue$jscomp$inline_2523$$), 
  0 !== $el$jscomp$37_minOpacityFound$$); $el$jscomp$inline_2514_i$jscomp$205_parent$jscomp$inline_2516$$++) {
  }
  return $el$jscomp$37_minOpacityFound$$;
}, $VisibilityModel$$module$extensions$amp_analytics$0_1$visibility_model$$ = function($deferred$jscomp$32_spec$jscomp$11$$, $calcVisibility$$) {
  var $$jscomp$this$jscomp$387$$ = this;
  this.$oa$ = $calcVisibility$$;
  this.$F$ = _.$dict$$module$src$utils$object$$({visiblePercentageMin:Number($deferred$jscomp$32_spec$jscomp$11$$.visiblePercentageMin) / 100 || 0, visiblePercentageMax:Number($deferred$jscomp$32_spec$jscomp$11$$.visiblePercentageMax) / 100 || 1, totalTimeMin:Number($deferred$jscomp$32_spec$jscomp$11$$.totalTimeMin) || 0, totalTimeMax:Number($deferred$jscomp$32_spec$jscomp$11$$.totalTimeMax) || window.Infinity, continuousTimeMin:Number($deferred$jscomp$32_spec$jscomp$11$$.continuousTimeMin) || 0, 
  continuousTimeMax:Number($deferred$jscomp$32_spec$jscomp$11$$.continuousTimeMax) || window.Infinity});
  "0" === String($deferred$jscomp$32_spec$jscomp$11$$.visiblePercentageMax).trim() && (this.$F$.visiblePercentageMax = 0);
  this.$ra$ = void 0 !== $deferred$jscomp$32_spec$jscomp$11$$.reportWhen;
  this.$na$ = !0 === $deferred$jscomp$32_spec$jscomp$11$$.repeat;
  this.$K$ = new _.$Observable$$module$src$observable$$;
  $deferred$jscomp$32_spec$jscomp$11$$ = new _.$Deferred$$module$src$utils$promise$$;
  this.$aa$ = $deferred$jscomp$32_spec$jscomp$11$$.$promise$;
  this.$O$ = $deferred$jscomp$32_spec$jscomp$11$$.resolve;
  this.$aa$.then(function() {
    $$jscomp$this$jscomp$387$$.$K$.$fire$();
  });
  this.$ga$ = [];
  this.$qa$ = Date.now();
  this.$la$ = this.$ready_$ = !0;
  this.$D$ = this.$Y$ = null;
  this.$ha$ = this.$P$ = !1;
  this.$R$ = this.$ea$ = this.$U$ = this.$ka$ = this.$W$ = this.$V$ = this.$ia$ = this.$ba$ = this.$G$ = this.$J$ = this.$I$ = 0;
  this.$ma$ = !1;
  this.$fa$ = null;
}, $JSCompiler_StaticMethods_VisibilityModel$$module$extensions$amp_analytics$0_1$visibility_model_prototype$reset_$$ = function($JSCompiler_StaticMethods_VisibilityModel$$module$extensions$amp_analytics$0_1$visibility_model_prototype$reset_$self$$) {
  var $deferred$jscomp$33$$ = new _.$Deferred$$module$src$utils$promise$$;
  $JSCompiler_StaticMethods_VisibilityModel$$module$extensions$amp_analytics$0_1$visibility_model_prototype$reset_$self$$.$aa$ = $deferred$jscomp$33$$.$promise$;
  $JSCompiler_StaticMethods_VisibilityModel$$module$extensions$amp_analytics$0_1$visibility_model_prototype$reset_$self$$.$O$ = $deferred$jscomp$33$$.resolve;
  $JSCompiler_StaticMethods_VisibilityModel$$module$extensions$amp_analytics$0_1$visibility_model_prototype$reset_$self$$.$aa$.then(function() {
    $JSCompiler_StaticMethods_VisibilityModel$$module$extensions$amp_analytics$0_1$visibility_model_prototype$reset_$self$$.$K$.$fire$();
  });
  $JSCompiler_StaticMethods_VisibilityModel$$module$extensions$amp_analytics$0_1$visibility_model_prototype$reset_$self$$.$fa$ = null;
  $JSCompiler_StaticMethods_VisibilityModel$$module$extensions$amp_analytics$0_1$visibility_model_prototype$reset_$self$$.$ha$ = !1;
  $JSCompiler_StaticMethods_VisibilityModel$$module$extensions$amp_analytics$0_1$visibility_model_prototype$reset_$self$$.$P$ = !1;
  $JSCompiler_StaticMethods_VisibilityModel$$module$extensions$amp_analytics$0_1$visibility_model_prototype$reset_$self$$.$I$ = 0;
  $JSCompiler_StaticMethods_VisibilityModel$$module$extensions$amp_analytics$0_1$visibility_model_prototype$reset_$self$$.$J$ = 0;
  $JSCompiler_StaticMethods_VisibilityModel$$module$extensions$amp_analytics$0_1$visibility_model_prototype$reset_$self$$.$G$ = 0;
  $JSCompiler_StaticMethods_VisibilityModel$$module$extensions$amp_analytics$0_1$visibility_model_prototype$reset_$self$$.$V$ = 0;
  $JSCompiler_StaticMethods_VisibilityModel$$module$extensions$amp_analytics$0_1$visibility_model_prototype$reset_$self$$.$ba$ = 0;
  $JSCompiler_StaticMethods_VisibilityModel$$module$extensions$amp_analytics$0_1$visibility_model_prototype$reset_$self$$.$ia$ = 0;
  $JSCompiler_StaticMethods_VisibilityModel$$module$extensions$amp_analytics$0_1$visibility_model_prototype$reset_$self$$.$W$ = 0;
  $JSCompiler_StaticMethods_VisibilityModel$$module$extensions$amp_analytics$0_1$visibility_model_prototype$reset_$self$$.$U$ = 0;
  $JSCompiler_StaticMethods_VisibilityModel$$module$extensions$amp_analytics$0_1$visibility_model_prototype$reset_$self$$.$ea$ = 0;
  $JSCompiler_StaticMethods_VisibilityModel$$module$extensions$amp_analytics$0_1$visibility_model_prototype$reset_$self$$.$R$ = 0;
  $JSCompiler_StaticMethods_VisibilityModel$$module$extensions$amp_analytics$0_1$visibility_model_prototype$reset_$self$$.$ma$ = !1;
}, $JSCompiler_StaticMethods_onTriggerEvent$$ = function($JSCompiler_StaticMethods_onTriggerEvent$self$$, $handler$jscomp$42$$) {
  $JSCompiler_StaticMethods_onTriggerEvent$self$$.$K$ && $JSCompiler_StaticMethods_onTriggerEvent$self$$.$K$.add($handler$jscomp$42$$);
  $JSCompiler_StaticMethods_onTriggerEvent$self$$.$aa$ && !$JSCompiler_StaticMethods_onTriggerEvent$self$$.$O$ && $handler$jscomp$42$$();
}, $JSCompiler_StaticMethods_VisibilityModel$$module$extensions$amp_analytics$0_1$visibility_model_prototype$setReady$$ = function($JSCompiler_StaticMethods_VisibilityModel$$module$extensions$amp_analytics$0_1$visibility_model_prototype$setReady$self$$, $ready$jscomp$2$$) {
  $JSCompiler_StaticMethods_VisibilityModel$$module$extensions$amp_analytics$0_1$visibility_model_prototype$setReady$self$$.$ready_$ = $ready$jscomp$2$$;
  $JSCompiler_StaticMethods_VisibilityModel$$module$extensions$amp_analytics$0_1$visibility_model_prototype$setReady$self$$.update();
}, $JSCompiler_StaticMethods_setReportReady$$ = function($JSCompiler_StaticMethods_setReportReady$self$$, $callback$jscomp$107$$) {
  $JSCompiler_StaticMethods_setReportReady$self$$.$la$ = !1;
  $JSCompiler_StaticMethods_setReportReady$self$$.$Y$ = $callback$jscomp$107$$;
}, $JSCompiler_StaticMethods_VisibilityModel$$module$extensions$amp_analytics$0_1$visibility_model_prototype$update_$$ = function($JSCompiler_StaticMethods_VisibilityModel$$module$extensions$amp_analytics$0_1$visibility_model_prototype$update_$self$$, $reportReadyPromise_timeToWait$jscomp$1_visibility$jscomp$1$$) {
  $JSCompiler_StaticMethods_VisibilityModel$$module$extensions$amp_analytics$0_1$visibility_model_prototype$update_$self$$.$ma$ ? $JSCompiler_StaticMethods_isVisibilityMatch_$$($JSCompiler_StaticMethods_VisibilityModel$$module$extensions$amp_analytics$0_1$visibility_model_prototype$update_$self$$, $reportReadyPromise_timeToWait$jscomp$1_visibility$jscomp$1$$) || $JSCompiler_StaticMethods_VisibilityModel$$module$extensions$amp_analytics$0_1$visibility_model_prototype$reset_$$($JSCompiler_StaticMethods_VisibilityModel$$module$extensions$amp_analytics$0_1$visibility_model_prototype$update_$self$$) : 
  $JSCompiler_StaticMethods_VisibilityModel$$module$extensions$amp_analytics$0_1$visibility_model_prototype$update_$self$$.$O$ && ($JSCompiler_StaticMethods_updateCounters_$$($JSCompiler_StaticMethods_VisibilityModel$$module$extensions$amp_analytics$0_1$visibility_model_prototype$update_$self$$, $reportReadyPromise_timeToWait$jscomp$1_visibility$jscomp$1$$) || $JSCompiler_StaticMethods_VisibilityModel$$module$extensions$amp_analytics$0_1$visibility_model_prototype$update_$self$$.$ra$ ? ($JSCompiler_StaticMethods_VisibilityModel$$module$extensions$amp_analytics$0_1$visibility_model_prototype$update_$self$$.$D$ && 
  ((0,window.clearTimeout)($JSCompiler_StaticMethods_VisibilityModel$$module$extensions$amp_analytics$0_1$visibility_model_prototype$update_$self$$.$D$), $JSCompiler_StaticMethods_VisibilityModel$$module$extensions$amp_analytics$0_1$visibility_model_prototype$update_$self$$.$D$ = null), $JSCompiler_StaticMethods_VisibilityModel$$module$extensions$amp_analytics$0_1$visibility_model_prototype$update_$self$$.$la$ ? ($JSCompiler_StaticMethods_VisibilityModel$$module$extensions$amp_analytics$0_1$visibility_model_prototype$update_$self$$.$O$(), 
  $JSCompiler_StaticMethods_VisibilityModel$$module$extensions$amp_analytics$0_1$visibility_model_prototype$update_$self$$.$O$ = null, $JSCompiler_StaticMethods_VisibilityModel$$module$extensions$amp_analytics$0_1$visibility_model_prototype$update_$self$$.$na$ && ($JSCompiler_StaticMethods_VisibilityModel$$module$extensions$amp_analytics$0_1$visibility_model_prototype$update_$self$$.$ma$ = !0, $JSCompiler_StaticMethods_VisibilityModel$$module$extensions$amp_analytics$0_1$visibility_model_prototype$update_$self$$.$I$ = 
  0)) : $JSCompiler_StaticMethods_VisibilityModel$$module$extensions$amp_analytics$0_1$visibility_model_prototype$update_$self$$.$Y$ && ($reportReadyPromise_timeToWait$jscomp$1_visibility$jscomp$1$$ = $JSCompiler_StaticMethods_VisibilityModel$$module$extensions$amp_analytics$0_1$visibility_model_prototype$update_$self$$.$Y$(), $JSCompiler_StaticMethods_VisibilityModel$$module$extensions$amp_analytics$0_1$visibility_model_prototype$update_$self$$.$Y$ = null, $reportReadyPromise_timeToWait$jscomp$1_visibility$jscomp$1$$.then(function() {
    $JSCompiler_StaticMethods_VisibilityModel$$module$extensions$amp_analytics$0_1$visibility_model_prototype$update_$self$$.$la$ = !0;
    $JSCompiler_StaticMethods_VisibilityModel$$module$extensions$amp_analytics$0_1$visibility_model_prototype$update_$self$$.update();
  }))) : $JSCompiler_StaticMethods_VisibilityModel$$module$extensions$amp_analytics$0_1$visibility_model_prototype$update_$self$$.$P$ && !$JSCompiler_StaticMethods_VisibilityModel$$module$extensions$amp_analytics$0_1$visibility_model_prototype$update_$self$$.$D$ ? ($reportReadyPromise_timeToWait$jscomp$1_visibility$jscomp$1$$ = $JSCompiler_StaticMethods_computeTimeToWait_$$($JSCompiler_StaticMethods_VisibilityModel$$module$extensions$amp_analytics$0_1$visibility_model_prototype$update_$self$$), 0 < 
  $reportReadyPromise_timeToWait$jscomp$1_visibility$jscomp$1$$ && ($JSCompiler_StaticMethods_VisibilityModel$$module$extensions$amp_analytics$0_1$visibility_model_prototype$update_$self$$.$D$ = (0,window.setTimeout)(function() {
    $JSCompiler_StaticMethods_VisibilityModel$$module$extensions$amp_analytics$0_1$visibility_model_prototype$update_$self$$.$D$ = null;
    $JSCompiler_StaticMethods_VisibilityModel$$module$extensions$amp_analytics$0_1$visibility_model_prototype$update_$self$$.update();
  }, $reportReadyPromise_timeToWait$jscomp$1_visibility$jscomp$1$$))) : !$JSCompiler_StaticMethods_VisibilityModel$$module$extensions$amp_analytics$0_1$visibility_model_prototype$update_$self$$.$P$ && $JSCompiler_StaticMethods_VisibilityModel$$module$extensions$amp_analytics$0_1$visibility_model_prototype$update_$self$$.$D$ && ((0,window.clearTimeout)($JSCompiler_StaticMethods_VisibilityModel$$module$extensions$amp_analytics$0_1$visibility_model_prototype$update_$self$$.$D$), $JSCompiler_StaticMethods_VisibilityModel$$module$extensions$amp_analytics$0_1$visibility_model_prototype$update_$self$$.$D$ = 
  null));
}, $JSCompiler_StaticMethods_isVisibilityMatch_$$ = function($JSCompiler_StaticMethods_isVisibilityMatch_$self$$, $visibility$jscomp$2$$) {
  return 1 == $JSCompiler_StaticMethods_isVisibilityMatch_$self$$.$F$.visiblePercentageMin ? 1 == $visibility$jscomp$2$$ : 0 == $JSCompiler_StaticMethods_isVisibilityMatch_$self$$.$F$.visiblePercentageMax ? 0 == $visibility$jscomp$2$$ : $visibility$jscomp$2$$ > $JSCompiler_StaticMethods_isVisibilityMatch_$self$$.$F$.visiblePercentageMin && $visibility$jscomp$2$$ <= $JSCompiler_StaticMethods_isVisibilityMatch_$self$$.$F$.visiblePercentageMax;
}, $JSCompiler_StaticMethods_updateCounters_$$ = function($JSCompiler_StaticMethods_updateCounters_$self$$, $visibility$jscomp$3$$) {
  var $now$jscomp$25$$ = Date.now();
  0 < $visibility$jscomp$3$$ && ($JSCompiler_StaticMethods_updateCounters_$self$$.$ba$ = $JSCompiler_StaticMethods_updateCounters_$self$$.$ba$ || $now$jscomp$25$$, $JSCompiler_StaticMethods_updateCounters_$self$$.$ia$ = $now$jscomp$25$$, !$JSCompiler_StaticMethods_updateCounters_$self$$.$ka$ && 300 > $now$jscomp$25$$ - $JSCompiler_StaticMethods_updateCounters_$self$$.$qa$ && ($JSCompiler_StaticMethods_updateCounters_$self$$.$ka$ = $visibility$jscomp$3$$));
  var $prevMatchesVisibility$$ = $JSCompiler_StaticMethods_updateCounters_$self$$.$P$, $timeSinceLastUpdate$$ = $JSCompiler_StaticMethods_updateCounters_$self$$.$R$ ? $now$jscomp$25$$ - $JSCompiler_StaticMethods_updateCounters_$self$$.$R$ : 0;
  $JSCompiler_StaticMethods_updateCounters_$self$$.$P$ = $JSCompiler_StaticMethods_isVisibilityMatch_$$($JSCompiler_StaticMethods_updateCounters_$self$$, $visibility$jscomp$3$$);
  $JSCompiler_StaticMethods_updateCounters_$self$$.$P$ ? ($JSCompiler_StaticMethods_updateCounters_$self$$.$ha$ = !0, $prevMatchesVisibility$$ ? ($JSCompiler_StaticMethods_updateCounters_$self$$.$G$ += $timeSinceLastUpdate$$, $JSCompiler_StaticMethods_updateCounters_$self$$.$I$ += $timeSinceLastUpdate$$, $JSCompiler_StaticMethods_updateCounters_$self$$.$J$ = Math.max($JSCompiler_StaticMethods_updateCounters_$self$$.$J$, $JSCompiler_StaticMethods_updateCounters_$self$$.$I$)) : $JSCompiler_StaticMethods_updateCounters_$self$$.$V$ = 
  $JSCompiler_StaticMethods_updateCounters_$self$$.$V$ || $now$jscomp$25$$, $JSCompiler_StaticMethods_updateCounters_$self$$.$R$ = $now$jscomp$25$$, $JSCompiler_StaticMethods_updateCounters_$self$$.$U$ = 0 < $JSCompiler_StaticMethods_updateCounters_$self$$.$U$ ? Math.min($JSCompiler_StaticMethods_updateCounters_$self$$.$U$, $visibility$jscomp$3$$) : $visibility$jscomp$3$$, $JSCompiler_StaticMethods_updateCounters_$self$$.$ea$ = Math.max($JSCompiler_StaticMethods_updateCounters_$self$$.$ea$, $visibility$jscomp$3$$), 
  $JSCompiler_StaticMethods_updateCounters_$self$$.$W$ = $now$jscomp$25$$) : $prevMatchesVisibility$$ && ($JSCompiler_StaticMethods_updateCounters_$self$$.$J$ = Math.max($JSCompiler_StaticMethods_updateCounters_$self$$.$J$, $JSCompiler_StaticMethods_updateCounters_$self$$.$I$ + $timeSinceLastUpdate$$), $JSCompiler_StaticMethods_updateCounters_$self$$.$R$ = 0, $JSCompiler_StaticMethods_updateCounters_$self$$.$G$ += $timeSinceLastUpdate$$, $JSCompiler_StaticMethods_updateCounters_$self$$.$I$ = 0, $JSCompiler_StaticMethods_updateCounters_$self$$.$W$ = 
  $now$jscomp$25$$);
  return $JSCompiler_StaticMethods_updateCounters_$self$$.$ha$ && $JSCompiler_StaticMethods_updateCounters_$self$$.$G$ >= $JSCompiler_StaticMethods_updateCounters_$self$$.$F$.totalTimeMin && $JSCompiler_StaticMethods_updateCounters_$self$$.$G$ <= $JSCompiler_StaticMethods_updateCounters_$self$$.$F$.totalTimeMax && $JSCompiler_StaticMethods_updateCounters_$self$$.$J$ >= $JSCompiler_StaticMethods_updateCounters_$self$$.$F$.continuousTimeMin && $JSCompiler_StaticMethods_updateCounters_$self$$.$J$ <= 
  $JSCompiler_StaticMethods_updateCounters_$self$$.$F$.continuousTimeMax;
}, $JSCompiler_StaticMethods_computeTimeToWait_$$ = function($JSCompiler_StaticMethods_computeTimeToWait_$self_waitForTotalTime$$) {
  var $waitForContinuousTime$$ = Math.max($JSCompiler_StaticMethods_computeTimeToWait_$self_waitForTotalTime$$.$F$.continuousTimeMin - $JSCompiler_StaticMethods_computeTimeToWait_$self_waitForTotalTime$$.$I$, 0);
  $JSCompiler_StaticMethods_computeTimeToWait_$self_waitForTotalTime$$ = Math.max($JSCompiler_StaticMethods_computeTimeToWait_$self_waitForTotalTime$$.$F$.totalTimeMin - $JSCompiler_StaticMethods_computeTimeToWait_$self_waitForTotalTime$$.$G$, 0);
  return Math.min(Math.max($waitForContinuousTime$$, $JSCompiler_StaticMethods_computeTimeToWait_$self_waitForTotalTime$$), $waitForContinuousTime$$ || window.Infinity, $JSCompiler_StaticMethods_computeTimeToWait_$self_waitForTotalTime$$ || window.Infinity);
}, $timeBase$$module$extensions$amp_analytics$0_1$visibility_model$$ = function($time$jscomp$22$$, $baseTime$$) {
  return $time$jscomp$22$$ >= $baseTime$$ ? $time$jscomp$22$$ - $baseTime$$ : 0;
}, $getElementId$$module$extensions$amp_analytics$0_1$visibility_manager$$ = function($element$jscomp$313$$) {
  var $id$jscomp$52$$ = $element$jscomp$313$$.__AMP_VIS_ID;
  $id$jscomp$52$$ || ($id$jscomp$52$$ = ++$visibilityIdCounter$$module$extensions$amp_analytics$0_1$visibility_manager$$, $element$jscomp$313$$.__AMP_VIS_ID = $id$jscomp$52$$);
  return $id$jscomp$52$$;
}, $VisibilityManager$$module$extensions$amp_analytics$0_1$visibility_manager$$ = function($JSCompiler_StaticMethods_addChild_$self$jscomp$inline_2525_parent$jscomp$40$$, $ampdoc$jscomp$128$$) {
  this.parent = $JSCompiler_StaticMethods_addChild_$self$jscomp$inline_2525_parent$jscomp$40$$;
  this.ampdoc = $ampdoc$jscomp$128$$;
  _.$Services$$module$src$services$resourcesForDoc$$($ampdoc$jscomp$128$$);
  this.$K$ = 0;
  this.$D$ = [];
  this.$children_$ = null;
  this.$J$ = [];
  this.parent && ($JSCompiler_StaticMethods_addChild_$self$jscomp$inline_2525_parent$jscomp$40$$ = this.parent, $JSCompiler_StaticMethods_addChild_$self$jscomp$inline_2525_parent$jscomp$40$$.$children_$ || ($JSCompiler_StaticMethods_addChild_$self$jscomp$inline_2525_parent$jscomp$40$$.$children_$ = []), $JSCompiler_StaticMethods_addChild_$self$jscomp$inline_2525_parent$jscomp$40$$.$children_$.push(this));
}, $JSCompiler_StaticMethods_removeChild_$$ = function($JSCompiler_StaticMethods_removeChild_$self$$, $child$jscomp$13_index$jscomp$88$$) {
  $JSCompiler_StaticMethods_removeChild_$self$$.$children_$ && ($child$jscomp$13_index$jscomp$88$$ = $JSCompiler_StaticMethods_removeChild_$self$$.$children_$.indexOf($child$jscomp$13_index$jscomp$88$$), -1 != $child$jscomp$13_index$jscomp$88$$ && $JSCompiler_StaticMethods_removeChild_$self$$.$children_$.splice($child$jscomp$13_index$jscomp$88$$, 1));
}, $JSCompiler_StaticMethods_updateModels_$$ = function($JSCompiler_StaticMethods_updateModels_$self$$) {
  for (var $i$jscomp$209$$ = 0; $i$jscomp$209$$ < $JSCompiler_StaticMethods_updateModels_$self$$.$D$.length; $i$jscomp$209$$++) {
    $JSCompiler_StaticMethods_updateModels_$self$$.$D$[$i$jscomp$209$$].update();
  }
}, $JSCompiler_StaticMethods_listenRoot$$ = function($JSCompiler_StaticMethods_listenRoot$self$$, $spec$jscomp$12$$, $readyPromise$jscomp$1$$, $createReportPromiseFunc$$, $callback$jscomp$108$$) {
  var $calcVisibility$jscomp$1$$ = $JSCompiler_StaticMethods_listenRoot$self$$.$G$.bind($JSCompiler_StaticMethods_listenRoot$self$$);
  return $JSCompiler_StaticMethods_createModelAndListen_$$($JSCompiler_StaticMethods_listenRoot$self$$, $calcVisibility$jscomp$1$$, $spec$jscomp$12$$, $readyPromise$jscomp$1$$, $createReportPromiseFunc$$, $callback$jscomp$108$$);
}, $JSCompiler_StaticMethods_createModelAndListen_$$ = function($JSCompiler_StaticMethods_createModelAndListen_$self$$, $calcVisibility$jscomp$3_model$$, $spec$jscomp$14$$, $readyPromise$jscomp$3$$, $createReportPromiseFunc$jscomp$2$$, $callback$jscomp$110$$, $opt_element$jscomp$18$$) {
  if ($spec$jscomp$14$$.visiblePercentageThresholds && void 0 == $spec$jscomp$14$$.visiblePercentageMin && void 0 == $spec$jscomp$14$$.visiblePercentageMax) {
    var $unlisteners$jscomp$3$$ = [], $ranges$jscomp$1$$ = $spec$jscomp$14$$.visiblePercentageThresholds;
    if (!$ranges$jscomp$1$$ || !_.$isArray$$module$src$types$$($ranges$jscomp$1$$)) {
      return _.$user$$module$src$log$$().error("amp-analytics/visibility-manager", "invalid visiblePercentageThresholds"), function() {
      };
    }
    for (var $i$jscomp$210$$ = 0; $i$jscomp$210$$ < $ranges$jscomp$1$$.length; $i$jscomp$210$$++) {
      var $max$jscomp$1_percents$$ = $ranges$jscomp$1$$[$i$jscomp$210$$];
      if (_.$isArray$$module$src$types$$($max$jscomp$1_percents$$) && 2 == $max$jscomp$1_percents$$.length) {
        if (_.$isFiniteNumber$$module$src$types$$($max$jscomp$1_percents$$[0]) && _.$isFiniteNumber$$module$src$types$$($max$jscomp$1_percents$$[1])) {
          var $min$jscomp$1_model$216$$ = Number($max$jscomp$1_percents$$[0]);
          $max$jscomp$1_percents$$ = Number($max$jscomp$1_percents$$[1]);
          if (0 > $min$jscomp$1_model$216$$ || 100 < $max$jscomp$1_percents$$ || $min$jscomp$1_model$216$$ > $max$jscomp$1_percents$$ || $min$jscomp$1_model$216$$ == $max$jscomp$1_percents$$ && 100 != $min$jscomp$1_model$216$$ && 0 != $max$jscomp$1_percents$$) {
            _.$user$$module$src$log$$().error("amp-analytics/visibility-manager", "visiblePercentageThresholds entry invalid min/max value");
          } else {
            var $newSpec$$ = $spec$jscomp$14$$;
            $newSpec$$.visiblePercentageMin = $min$jscomp$1_model$216$$;
            $newSpec$$.visiblePercentageMax = $max$jscomp$1_percents$$;
            $min$jscomp$1_model$216$$ = new $VisibilityModel$$module$extensions$amp_analytics$0_1$visibility_model$$($newSpec$$, $calcVisibility$jscomp$3_model$$);
            $unlisteners$jscomp$3$$.push($JSCompiler_StaticMethods_VisibilityManager$$module$extensions$amp_analytics$0_1$visibility_manager_prototype$listen_$$($JSCompiler_StaticMethods_createModelAndListen_$self$$, $min$jscomp$1_model$216$$, $readyPromise$jscomp$3$$, $createReportPromiseFunc$jscomp$2$$, $callback$jscomp$110$$, $opt_element$jscomp$18$$));
          }
        } else {
          _.$user$$module$src$log$$().error("amp-analytics/visibility-manager", "visiblePercentageThresholds entry is not valid number");
        }
      } else {
        _.$user$$module$src$log$$().error("amp-analytics/visibility-manager", "visiblePercentageThresholds entry length is not 2");
      }
    }
    return function() {
      $unlisteners$jscomp$3$$.forEach(function($JSCompiler_StaticMethods_createModelAndListen_$self$$) {
        return $JSCompiler_StaticMethods_createModelAndListen_$self$$();
      });
    };
  }
  $calcVisibility$jscomp$3_model$$ = new $VisibilityModel$$module$extensions$amp_analytics$0_1$visibility_model$$($spec$jscomp$14$$, $calcVisibility$jscomp$3_model$$);
  return $JSCompiler_StaticMethods_VisibilityManager$$module$extensions$amp_analytics$0_1$visibility_manager_prototype$listen_$$($JSCompiler_StaticMethods_createModelAndListen_$self$$, $calcVisibility$jscomp$3_model$$, $readyPromise$jscomp$3$$, $createReportPromiseFunc$jscomp$2$$, $callback$jscomp$110$$, $opt_element$jscomp$18$$);
}, $JSCompiler_StaticMethods_VisibilityManager$$module$extensions$amp_analytics$0_1$visibility_manager_prototype$listen_$$ = function($JSCompiler_StaticMethods_VisibilityManager$$module$extensions$amp_analytics$0_1$visibility_manager_prototype$listen_$self$$, $model$jscomp$1$$, $readyPromise$jscomp$4$$, $createReportPromiseFunc$jscomp$3$$, $callback$jscomp$111$$, $opt_element$jscomp$19$$) {
  $createReportPromiseFunc$jscomp$3$$ && $JSCompiler_StaticMethods_setReportReady$$($model$jscomp$1$$, $createReportPromiseFunc$jscomp$3$$);
  $readyPromise$jscomp$4$$ && ($JSCompiler_StaticMethods_VisibilityModel$$module$extensions$amp_analytics$0_1$visibility_model_prototype$setReady$$($model$jscomp$1$$, !1), $readyPromise$jscomp$4$$.then(function() {
    $JSCompiler_StaticMethods_VisibilityModel$$module$extensions$amp_analytics$0_1$visibility_model_prototype$setReady$$($model$jscomp$1$$, !0);
  }));
  $JSCompiler_StaticMethods_onTriggerEvent$$($model$jscomp$1$$, function() {
    var $readyPromise$jscomp$4$$ = $JSCompiler_StaticMethods_VisibilityManager$$module$extensions$amp_analytics$0_1$visibility_manager_prototype$listen_$self$$.$VisibilityManager$$module$extensions$amp_analytics$0_1$visibility_manager_prototype$getStartTime$(), $createReportPromiseFunc$jscomp$3$$ = _.$dict$$module$src$utils$object$$({firstSeenTime:$timeBase$$module$extensions$amp_analytics$0_1$visibility_model$$($model$jscomp$1$$.$ba$, $readyPromise$jscomp$4$$), lastSeenTime:$timeBase$$module$extensions$amp_analytics$0_1$visibility_model$$($model$jscomp$1$$.$ia$, 
    $readyPromise$jscomp$4$$), lastVisibleTime:$timeBase$$module$extensions$amp_analytics$0_1$visibility_model$$($model$jscomp$1$$.$W$, $readyPromise$jscomp$4$$), firstVisibleTime:$timeBase$$module$extensions$amp_analytics$0_1$visibility_model$$($model$jscomp$1$$.$V$, $readyPromise$jscomp$4$$), maxContinuousVisibleTime:$model$jscomp$1$$.$J$, totalVisibleTime:$model$jscomp$1$$.$G$, loadTimeVisibility:100 * $model$jscomp$1$$.$ka$ || 0, minVisiblePercentage:100 * $model$jscomp$1$$.$U$, maxVisiblePercentage:100 * 
    $model$jscomp$1$$.$ea$});
    $createReportPromiseFunc$jscomp$3$$.backgrounded = $JSCompiler_StaticMethods_VisibilityManager$$module$extensions$amp_analytics$0_1$visibility_manager_prototype$listen_$self$$.$isBackgrounded$() ? 1 : 0;
    $createReportPromiseFunc$jscomp$3$$.backgroundedAtStart = $JSCompiler_StaticMethods_VisibilityManager$$module$extensions$amp_analytics$0_1$visibility_manager_prototype$listen_$self$$.$isBackgroundedAtStart$() ? 1 : 0;
    $createReportPromiseFunc$jscomp$3$$.totalTime = Date.now() - $readyPromise$jscomp$4$$;
    if ($opt_element$jscomp$19$$) {
      $createReportPromiseFunc$jscomp$3$$.opacity = $getMinOpacity$$module$extensions$amp_analytics$0_1$opacity$$($opt_element$jscomp$19$$);
      $readyPromise$jscomp$4$$ = ($readyPromise$jscomp$4$$ = _.$Resource$$module$src$service$resource$forElementOptional$$($opt_element$jscomp$19$$)) ? $readyPromise$jscomp$4$$.$getLayoutBox$() : _.$Services$$module$src$services$viewportForDoc$$($JSCompiler_StaticMethods_VisibilityManager$$module$extensions$amp_analytics$0_1$visibility_manager_prototype$listen_$self$$.ampdoc).$getLayoutRect$($opt_element$jscomp$19$$);
      var $intersectionRatio$jscomp$1$$ = $JSCompiler_StaticMethods_VisibilityManager$$module$extensions$amp_analytics$0_1$visibility_manager_prototype$listen_$self$$.$getElementVisibility$($opt_element$jscomp$19$$), $intersectionRect$jscomp$2$$ = $JSCompiler_StaticMethods_VisibilityManager$$module$extensions$amp_analytics$0_1$visibility_manager_prototype$listen_$self$$.$getElementIntersectionRect$($opt_element$jscomp$19$$);
      Object.assign($createReportPromiseFunc$jscomp$3$$, _.$dict$$module$src$utils$object$$({intersectionRatio:$intersectionRatio$jscomp$1$$, intersectionRect:JSON.stringify($intersectionRect$jscomp$2$$)}));
    } else {
      $createReportPromiseFunc$jscomp$3$$.opacity = $JSCompiler_StaticMethods_VisibilityManager$$module$extensions$amp_analytics$0_1$visibility_manager_prototype$listen_$self$$.$getRootMinOpacity$(), $createReportPromiseFunc$jscomp$3$$.intersectionRatio = $JSCompiler_StaticMethods_VisibilityManager$$module$extensions$amp_analytics$0_1$visibility_manager_prototype$listen_$self$$.$G$(), $readyPromise$jscomp$4$$ = $JSCompiler_StaticMethods_VisibilityManager$$module$extensions$amp_analytics$0_1$visibility_manager_prototype$listen_$self$$.$getRootLayoutBox$();
    }
    $model$jscomp$1$$.$na$ || $model$jscomp$1$$.$dispose$();
    $readyPromise$jscomp$4$$ && Object.assign($createReportPromiseFunc$jscomp$3$$, _.$dict$$module$src$utils$object$$({elementX:$readyPromise$jscomp$4$$.left, elementY:$readyPromise$jscomp$4$$.top, elementWidth:$readyPromise$jscomp$4$$.width, elementHeight:$readyPromise$jscomp$4$$.height}));
    $callback$jscomp$111$$($createReportPromiseFunc$jscomp$3$$);
  });
  $JSCompiler_StaticMethods_VisibilityManager$$module$extensions$amp_analytics$0_1$visibility_manager_prototype$listen_$self$$.$D$.push($model$jscomp$1$$);
  $model$jscomp$1$$.unsubscribe(function() {
    var $readyPromise$jscomp$4$$ = $JSCompiler_StaticMethods_VisibilityManager$$module$extensions$amp_analytics$0_1$visibility_manager_prototype$listen_$self$$.$D$.indexOf($model$jscomp$1$$);
    -1 != $readyPromise$jscomp$4$$ && $JSCompiler_StaticMethods_VisibilityManager$$module$extensions$amp_analytics$0_1$visibility_manager_prototype$listen_$self$$.$D$.splice($readyPromise$jscomp$4$$, 1);
  });
  $opt_element$jscomp$19$$ && $model$jscomp$1$$.unsubscribe($JSCompiler_StaticMethods_VisibilityManager$$module$extensions$amp_analytics$0_1$visibility_manager_prototype$listen_$self$$.observe($opt_element$jscomp$19$$, function() {
    return $model$jscomp$1$$.update();
  }));
  $model$jscomp$1$$.update();
  return function() {
    $model$jscomp$1$$.$dispose$();
  };
}, $VisibilityManagerForDoc$$module$extensions$amp_analytics$0_1$visibility_manager$$ = function($ampdoc$jscomp$129_root$jscomp$51$$) {
  $VisibilityManager$$module$extensions$amp_analytics$0_1$visibility_manager$$.call(this, null, $ampdoc$jscomp$129_root$jscomp$51$$);
  var $$jscomp$this$jscomp$391$$ = this;
  this.$viewer_$ = _.$Services$$module$src$services$viewerForDoc$$($ampdoc$jscomp$129_root$jscomp$51$$);
  this.$viewport_$ = _.$Services$$module$src$services$viewportForDoc$$($ampdoc$jscomp$129_root$jscomp$51$$);
  this.$O$ = !_.$JSCompiler_StaticMethods_Viewer$$module$src$service$viewer_impl_prototype$isVisible$$(this.$viewer_$);
  this.$P$ = this.$isBackgrounded$();
  this.$F$ = _.$map$$module$src$utils$object$$();
  this.$intersectionObserver_$ = null;
  "inabox" == _.$getMode$$module$src$mode$$(this.ampdoc.$win$).runtime ? ($ampdoc$jscomp$129_root$jscomp$51$$ = this.ampdoc.getRootNode(), this.unsubscribe(this.observe($ampdoc$jscomp$129_root$jscomp$51$$.documentElement || $ampdoc$jscomp$129_root$jscomp$51$$.body || $ampdoc$jscomp$129_root$jscomp$51$$, this.$I$.bind(this)))) : (this.$I$(_.$JSCompiler_StaticMethods_Viewer$$module$src$service$viewer_impl_prototype$isVisible$$(this.$viewer_$) ? 1 : 0), this.unsubscribe(_.$JSCompiler_StaticMethods_Viewer$$module$src$service$viewer_impl_prototype$onVisibilityChanged$$(this.$viewer_$, 
  function() {
    var $ampdoc$jscomp$129_root$jscomp$51$$ = _.$JSCompiler_StaticMethods_Viewer$$module$src$service$viewer_impl_prototype$isVisible$$($$jscomp$this$jscomp$391$$.$viewer_$);
    $ampdoc$jscomp$129_root$jscomp$51$$ || ($$jscomp$this$jscomp$391$$.$O$ = !0);
    $$jscomp$this$jscomp$391$$.$I$($ampdoc$jscomp$129_root$jscomp$51$$ ? 1 : 0);
  })));
}, $JSCompiler_StaticMethods_createIntersectionObserver_$$ = function($JSCompiler_StaticMethods_createIntersectionObserver_$self$$) {
  function $ticker$$() {
    _.$JSCompiler_StaticMethods_IntersectionObserverPolyfill$$module$src$intersection_observer_polyfill_prototype$tick$$($intersectionObserverPolyfill$$, _.$JSCompiler_StaticMethods_getRect$$($JSCompiler_StaticMethods_createIntersectionObserver_$self$$.$viewport_$));
  }
  var $win$jscomp$309$$ = $JSCompiler_StaticMethods_createIntersectionObserver_$self$$.ampdoc.$win$;
  if ($nativeIntersectionObserverSupported$$module$src$intersection_observer_polyfill$$($win$jscomp$309$$)) {
    return new $win$jscomp$309$$.IntersectionObserver($JSCompiler_StaticMethods_createIntersectionObserver_$self$$.$onIntersectionChanges_$.bind($JSCompiler_StaticMethods_createIntersectionObserver_$self$$), {threshold:_.$DEFAULT_THRESHOLD$$module$src$intersection_observer_polyfill$$});
  }
  var $intersectionObserverPolyfill$$ = new _.$IntersectionObserverPolyfill$$module$src$intersection_observer_polyfill$$($JSCompiler_StaticMethods_createIntersectionObserver_$self$$.$onIntersectionChanges_$.bind($JSCompiler_StaticMethods_createIntersectionObserver_$self$$), {threshold:_.$DEFAULT_THRESHOLD$$module$src$intersection_observer_polyfill$$});
  $JSCompiler_StaticMethods_createIntersectionObserver_$self$$.unsubscribe(_.$JSCompiler_StaticMethods_Viewport$$module$src$service$viewport$viewport_impl_prototype$onScroll$$($JSCompiler_StaticMethods_createIntersectionObserver_$self$$.$viewport_$, $ticker$$));
  $JSCompiler_StaticMethods_createIntersectionObserver_$self$$.unsubscribe(_.$JSCompiler_StaticMethods_onChanged$$($JSCompiler_StaticMethods_createIntersectionObserver_$self$$.$viewport_$, $ticker$$));
  (0,window.setTimeout)($ticker$$);
  return $intersectionObserverPolyfill$$;
}, $JSCompiler_StaticMethods_polyfillAmpElementIfNeeded_$$ = function($JSCompiler_StaticMethods_polyfillAmpElementIfNeeded_$self$$, $element$jscomp$318$$) {
  $nativeIntersectionObserverSupported$$module$src$intersection_observer_polyfill$$($JSCompiler_StaticMethods_polyfillAmpElementIfNeeded_$self$$.ampdoc.$win$) || "function" == typeof $element$jscomp$318$$.$getLayoutBox$ || ($element$jscomp$318$$.$getLayoutBox$ = function() {
    return $JSCompiler_StaticMethods_polyfillAmpElementIfNeeded_$self$$.$viewport_$.$getLayoutRect$($element$jscomp$318$$);
  }, $element$jscomp$318$$.$getOwner$ = function() {
    return null;
  });
}, $VisibilityManagerForEmbed$$module$extensions$amp_analytics$0_1$visibility_manager$$ = function($parent$jscomp$41$$, $embed$jscomp$2$$) {
  $VisibilityManager$$module$extensions$amp_analytics$0_1$visibility_manager$$.call(this, $parent$jscomp$41$$, $parent$jscomp$41$$.ampdoc);
  this.embed = $embed$jscomp$2$$;
  this.$F$ = this.parent.$isBackgrounded$();
  this.unsubscribe(this.parent.observe($embed$jscomp$2$$.host, this.$I$.bind(this)));
}, $AnalyticsRoot$$module$extensions$amp_analytics$0_1$analytics_root$$ = function($ampdoc$jscomp$130$$, $parent$jscomp$42$$) {
  this.ampdoc = $ampdoc$jscomp$130$$;
  this.parent = $parent$jscomp$42$$;
  this.$D$ = _.$map$$module$src$utils$object$$();
  this.$F$ = this.$G$ = null;
}, $JSCompiler_StaticMethods_getTrackerForWhitelist$$ = function($JSCompiler_StaticMethods_getTrackerForWhitelist$self$$, $name$jscomp$201$$, $trackerProfile_whitelist$jscomp$12$$) {
  return ($trackerProfile_whitelist$jscomp$12$$ = $trackerProfile_whitelist$jscomp$12$$[$name$jscomp$201$$]) ? $JSCompiler_StaticMethods_getTracker$$($JSCompiler_StaticMethods_getTrackerForWhitelist$self$$, $name$jscomp$201$$, $trackerProfile_whitelist$jscomp$12$$) : null;
}, $JSCompiler_StaticMethods_getTracker$$ = function($JSCompiler_StaticMethods_getTracker$self$$, $name$jscomp$202$$, $klass$jscomp$2$$) {
  var $tracker$jscomp$1$$ = $JSCompiler_StaticMethods_getTracker$self$$.$D$[$name$jscomp$202$$];
  $tracker$jscomp$1$$ || ($tracker$jscomp$1$$ = new $klass$jscomp$2$$($JSCompiler_StaticMethods_getTracker$self$$), $JSCompiler_StaticMethods_getTracker$self$$.$D$[$name$jscomp$202$$] = $tracker$jscomp$1$$);
  return $tracker$jscomp$1$$;
}, $JSCompiler_StaticMethods_getAmpElement$$ = function($JSCompiler_StaticMethods_getAmpElement$self$$, $context$jscomp$32$$, $selector$jscomp$28$$, $selectionMethod$jscomp$7$$) {
  return $JSCompiler_StaticMethods_getAmpElement$self$$.$getElement$($context$jscomp$32$$, $selector$jscomp$28$$, $selectionMethod$jscomp$7$$).then(function($JSCompiler_StaticMethods_getAmpElement$self$$) {
    return $JSCompiler_StaticMethods_getAmpElement$self$$;
  });
}, $JSCompiler_StaticMethods_createSelectiveListener$$ = function($JSCompiler_StaticMethods_createSelectiveListener$self$$, $listener$jscomp$83$$, $context$jscomp$33$$, $selector$jscomp$29$$, $selectionMethod$jscomp$8$$) {
  $selectionMethod$jscomp$8$$ = void 0 === $selectionMethod$jscomp$8$$ ? null : $selectionMethod$jscomp$8$$;
  return function($event$jscomp$77$$) {
    if (":host" != $selector$jscomp$29$$) {
      for (var $rootElement$jscomp$5$$ = $JSCompiler_StaticMethods_createSelectiveListener$self$$.$getRootElement$(), $isSelectAny$$ = "*" == $selector$jscomp$29$$, $isSelectRoot$$ = ":root" == $selector$jscomp$29$$, $target$jscomp$119$$ = $event$jscomp$77$$.target; $target$jscomp$119$$ && $JSCompiler_StaticMethods_createSelectiveListener$self$$.contains($target$jscomp$119$$) && ("scope" != $selectionMethod$jscomp$8$$ || $isSelectRoot$$ || $context$jscomp$33$$.contains($target$jscomp$119$$));) {
        if ("closest" != $selectionMethod$jscomp$8$$ || $target$jscomp$119$$.contains($context$jscomp$33$$)) {
          var $JSCompiler_temp$jscomp$657$$;
          if (!($JSCompiler_temp$jscomp$657$$ = $isSelectAny$$ || $isSelectRoot$$ && $target$jscomp$119$$ == $rootElement$jscomp$5$$)) {
            var $selector$jscomp$inline_2541$$ = $selector$jscomp$29$$;
            try {
              $JSCompiler_temp$jscomp$657$$ = _.$matches$$module$src$dom$$($target$jscomp$119$$, $selector$jscomp$inline_2541$$);
            } catch ($e$218$jscomp$inline_2542$$) {
              _.$user$$module$src$log$$().error("amp-analytics/analytics-root", "Bad query selector.", $selector$jscomp$inline_2541$$, $e$218$jscomp$inline_2542$$), $JSCompiler_temp$jscomp$657$$ = !1;
            }
          }
          if ($JSCompiler_temp$jscomp$657$$) {
            $listener$jscomp$83$$($target$jscomp$119$$, $event$jscomp$77$$);
            break;
          }
        }
        $target$jscomp$119$$ = $target$jscomp$119$$.parentElement;
      }
    }
  };
}, $JSCompiler_StaticMethods_getVisibilityManager$$ = function($JSCompiler_StaticMethods_getVisibilityManager$self$$) {
  $JSCompiler_StaticMethods_getVisibilityManager$self$$.$G$ || ($JSCompiler_StaticMethods_getVisibilityManager$self$$.$G$ = $JSCompiler_StaticMethods_getVisibilityManager$self$$.$createVisibilityManager$());
  return $JSCompiler_StaticMethods_getVisibilityManager$self$$.$G$;
}, $JSCompiler_StaticMethods_getScrollManager$$ = function($JSCompiler_StaticMethods_getScrollManager$self$$) {
  $JSCompiler_StaticMethods_getScrollManager$self$$.$F$ || ($JSCompiler_StaticMethods_getScrollManager$self$$.$F$ = new $ScrollManager$$module$extensions$amp_analytics$0_1$scroll_manager$$($JSCompiler_StaticMethods_getScrollManager$self$$.ampdoc));
  return $JSCompiler_StaticMethods_getScrollManager$self$$.$F$;
}, $AmpdocAnalyticsRoot$$module$extensions$amp_analytics$0_1$analytics_root$$ = function($ampdoc$jscomp$131$$) {
  $AnalyticsRoot$$module$extensions$amp_analytics$0_1$analytics_root$$.call(this, $ampdoc$jscomp$131$$, null);
}, $EmbedAnalyticsRoot$$module$extensions$amp_analytics$0_1$analytics_root$$ = function($ampdoc$jscomp$132$$, $embed$jscomp$3$$, $parent$jscomp$43$$) {
  $AnalyticsRoot$$module$extensions$amp_analytics$0_1$analytics_root$$.call(this, $ampdoc$jscomp$132$$, $parent$jscomp$43$$);
  this.embed = $embed$jscomp$3$$;
}, $InstrumentationService$$module$extensions$amp_analytics$0_1$instrumentation$$ = function($ampdoc$jscomp$133$$) {
  this.ampdoc = $ampdoc$jscomp$133$$;
  this.$D$ = new $AmpdocAnalyticsRoot$$module$extensions$amp_analytics$0_1$analytics_root$$(this.ampdoc);
}, $JSCompiler_StaticMethods_createAnalyticsGroup$$ = function($JSCompiler_StaticMethods_createAnalyticsGroup$self_root$jscomp$55$$, $analyticsElement$jscomp$2$$) {
  $JSCompiler_StaticMethods_createAnalyticsGroup$self_root$jscomp$55$$ = $JSCompiler_StaticMethods_findRoot_$$($JSCompiler_StaticMethods_createAnalyticsGroup$self_root$jscomp$55$$, $analyticsElement$jscomp$2$$);
  return new $AnalyticsGroup$$module$extensions$amp_analytics$0_1$analytics_group$$($JSCompiler_StaticMethods_createAnalyticsGroup$self_root$jscomp$55$$, $analyticsElement$jscomp$2$$);
}, $JSCompiler_StaticMethods_findRoot_$$ = function($JSCompiler_StaticMethods_findRoot_$self$$, $context$jscomp$35_frame$jscomp$2$$) {
  if ($context$jscomp$35_frame$jscomp$2$$ = _.$getParentWindowFrameElement$$module$src$service$$($context$jscomp$35_frame$jscomp$2$$, $JSCompiler_StaticMethods_findRoot_$self$$.ampdoc.$win$)) {
    var $embed$jscomp$4$$ = _.$getFriendlyIframeEmbedOptional$$module$src$friendly_iframe_embed$$($context$jscomp$35_frame$jscomp$2$$);
    if ($embed$jscomp$4$$) {
      return $JSCompiler_StaticMethods_getOrCreateRoot_$$($embed$jscomp$4$$, function() {
        return new $EmbedAnalyticsRoot$$module$extensions$amp_analytics$0_1$analytics_root$$($JSCompiler_StaticMethods_findRoot_$self$$.ampdoc, $embed$jscomp$4$$, $JSCompiler_StaticMethods_findRoot_$self$$.$D$);
      });
    }
  }
  return $JSCompiler_StaticMethods_findRoot_$self$$.$D$;
}, $JSCompiler_StaticMethods_getOrCreateRoot_$$ = function($holder$jscomp$24$$, $factory$jscomp$3$$) {
  var $root$jscomp$57$$ = $holder$jscomp$24$$.__AMP_AN_ROOT;
  $root$jscomp$57$$ || ($root$jscomp$57$$ = $factory$jscomp$3$$(), $holder$jscomp$24$$.__AMP_AN_ROOT = $root$jscomp$57$$);
  return $root$jscomp$57$$;
}, $instrumentationServicePromiseForDoc$$module$extensions$amp_analytics$0_1$instrumentation$$ = function($elementOrAmpDoc$jscomp$23$$) {
  return _.$getServicePromiseForDoc$$module$src$service$$($elementOrAmpDoc$jscomp$23$$, "amp-analytics-instrumentation");
}, $LinkerManager$$module$extensions$amp_analytics$0_1$linker_manager$$ = function($ampdoc$jscomp$134$$, $config$jscomp$44$$, $type$jscomp$166$$, $element$jscomp$323$$) {
  this.$ampdoc_$ = $ampdoc$jscomp$134$$;
  this.$config_$ = $config$jscomp$44$$.linkers;
  this.$K$ = $config$jscomp$44$$.vars || {};
  this.$type_$ = $type$jscomp$166$$;
  this.$element_$ = $element$jscomp$323$$;
  this.$I$ = [];
  this.$F$ = {};
  this.$G$ = _.$Services$$module$src$services$urlForDoc$$(this.$element_$);
  this.$J$ = _.$getServicePromiseForDoc$$module$src$service$$($ampdoc$jscomp$134$$, "form-submit-service");
  this.$D$ = null;
}, $JSCompiler_StaticMethods_processConfig_$$ = function($JSCompiler_StaticMethods_processConfig_$self$$, $config$jscomp$45$$) {
  var $processedConfig$$ = {}, $defaultConfig$jscomp$1$$ = {enabled:$JSCompiler_StaticMethods_isLegacyOptIn_$$($JSCompiler_StaticMethods_processConfig_$self$$) && $JSCompiler_StaticMethods_isSafari12OrAbove_$$($JSCompiler_StaticMethods_processConfig_$self$$)}, $linkerNames$$ = Object.keys($config$jscomp$45$$).filter(function($JSCompiler_StaticMethods_processConfig_$self$$) {
    var $processedConfig$$ = $config$jscomp$45$$[$JSCompiler_StaticMethods_processConfig_$self$$], $linkerNames$$ = _.$isObject$$module$src$types$$($processedConfig$$);
    $linkerNames$$ || ($defaultConfig$jscomp$1$$[$JSCompiler_StaticMethods_processConfig_$self$$] = $processedConfig$$);
    return $linkerNames$$;
  }), $isProxyOrigin$$ = _.$isProxyOrigin$$module$src$url$$($JSCompiler_StaticMethods_processConfig_$self$$.$ampdoc_$.$win$.location);
  $linkerNames$$.forEach(function($JSCompiler_StaticMethods_processConfig_$self$$) {
    var $linkerNames$$ = Object.assign({}, $defaultConfig$jscomp$1$$, $config$jscomp$45$$[$JSCompiler_StaticMethods_processConfig_$self$$]);
    if (!0 !== $linkerNames$$.enabled) {
      _.$user$$module$src$log$$().$Log$$module$src$log_prototype$info$("amp-analytics/linker-manager", "linker config for %s is not enabled and will be ignored.", $JSCompiler_StaticMethods_processConfig_$self$$);
    } else {
      if ($isProxyOrigin$$ || !1 === $linkerNames$$.proxyOnly) {
        $linkerNames$$.ids ? $processedConfig$$[$JSCompiler_StaticMethods_processConfig_$self$$] = $linkerNames$$ : _.$user$$module$src$log$$().error("amp-analytics/linker-manager", '"ids" is a required field for use of "linkers".');
      }
    }
  });
  return $processedConfig$$;
}, $JSCompiler_StaticMethods_LinkerManager$$module$extensions$amp_analytics$0_1$linker_manager_prototype$expandTemplateWithUrlParams_$$ = function($JSCompiler_StaticMethods_LinkerManager$$module$extensions$amp_analytics$0_1$linker_manager_prototype$expandTemplateWithUrlParams_$self$$, $template$jscomp$16$$, $expansionOptions$jscomp$1$$) {
  return $JSCompiler_StaticMethods_expandTemplate$$($variableServiceFor$$module$extensions$amp_analytics$0_1$variables$$($JSCompiler_StaticMethods_LinkerManager$$module$extensions$amp_analytics$0_1$linker_manager_prototype$expandTemplateWithUrlParams_$self$$.$ampdoc_$.$win$), $template$jscomp$16$$, $expansionOptions$jscomp$1$$).then(function($template$jscomp$16$$) {
    return _.$JSCompiler_StaticMethods_expandUrlAsync$$(_.$Services$$module$src$services$urlReplacementsForDoc$$($JSCompiler_StaticMethods_LinkerManager$$module$extensions$amp_analytics$0_1$linker_manager_prototype$expandTemplateWithUrlParams_$self$$.$element_$), $template$jscomp$16$$);
  });
}, $JSCompiler_StaticMethods_isLegacyOptIn_$$ = function($JSCompiler_StaticMethods_isLegacyOptIn_$self$$) {
  var $optInMeta$jscomp$1$$ = $JSCompiler_StaticMethods_isLegacyOptIn_$self$$.$ampdoc_$.$win$.document.head.querySelector('meta[name="amp-google-client-id-api"][content="googleanalytics"]');
  if (!$optInMeta$jscomp$1$$ || $optInMeta$jscomp$1$$.hasAttribute("i-amphtml-linker-created") || "googleanalytics" !== $JSCompiler_StaticMethods_isLegacyOptIn_$self$$.$type_$) {
    return !1;
  }
  $optInMeta$jscomp$1$$.setAttribute("i-amphtml-linker-created", "");
  return !0;
}, $JSCompiler_StaticMethods_isSafari12OrAbove_$$ = function($JSCompiler_StaticMethods_isSafari12OrAbove_$self_platform$jscomp$5$$) {
  $JSCompiler_StaticMethods_isSafari12OrAbove_$self_platform$jscomp$5$$ = _.$Services$$module$src$services$platformFor$$($JSCompiler_StaticMethods_isSafari12OrAbove_$self_platform$jscomp$5$$.$ampdoc_$.$win$);
  return _.$JSCompiler_StaticMethods_isSafari$$($JSCompiler_StaticMethods_isSafari12OrAbove_$self_platform$jscomp$5$$) && 12 <= _.$JSCompiler_StaticMethods_getMajorVersion$$($JSCompiler_StaticMethods_isSafari12OrAbove_$self_platform$jscomp$5$$);
}, $JSCompiler_StaticMethods_isDomainMatch_$$ = function($JSCompiler_StaticMethods_isDomainMatch_$self_canonicalOrigin$$, $hostname$jscomp$3$$, $canonicalUrl$jscomp$6_name$jscomp$207$$, $$jscomp$destructuring$var296_domains$jscomp$1_sourceOrigin$jscomp$3$$) {
  if ($$jscomp$destructuring$var296_domains$jscomp$1_sourceOrigin$jscomp$3$$ && !Array.isArray($$jscomp$destructuring$var296_domains$jscomp$1_sourceOrigin$jscomp$3$$)) {
    return _.$user$$module$src$log$$().$Log$$module$src$log_prototype$warn$("amp-analytics/linker-manager", "%s destinationDomains must be an array.", $canonicalUrl$jscomp$6_name$jscomp$207$$), !1;
  }
  if ($$jscomp$destructuring$var296_domains$jscomp$1_sourceOrigin$jscomp$3$$ && !$$jscomp$destructuring$var296_domains$jscomp$1_sourceOrigin$jscomp$3$$.includes($hostname$jscomp$3$$)) {
    return !1;
  }
  if (!$$jscomp$destructuring$var296_domains$jscomp$1_sourceOrigin$jscomp$3$$) {
    if ($JSCompiler_StaticMethods_isDomainMatch_$self_canonicalOrigin$$.$ampdoc_$.$win$.location.hostname === $hostname$jscomp$3$$) {
      return !1;
    }
    $$jscomp$destructuring$var296_domains$jscomp$1_sourceOrigin$jscomp$3$$ = _.$Services$$module$src$services$documentInfoForDoc$$($JSCompiler_StaticMethods_isDomainMatch_$self_canonicalOrigin$$.$ampdoc_$);
    $canonicalUrl$jscomp$6_name$jscomp$207$$ = $$jscomp$destructuring$var296_domains$jscomp$1_sourceOrigin$jscomp$3$$.canonicalUrl;
    $$jscomp$destructuring$var296_domains$jscomp$1_sourceOrigin$jscomp$3$$ = $JSCompiler_StaticMethods_isDomainMatch_$self_canonicalOrigin$$.$G$.parse($$jscomp$destructuring$var296_domains$jscomp$1_sourceOrigin$jscomp$3$$.sourceUrl).hostname;
    $JSCompiler_StaticMethods_isDomainMatch_$self_canonicalOrigin$$ = $JSCompiler_StaticMethods_isDomainMatch_$self_canonicalOrigin$$.$G$.parse($canonicalUrl$jscomp$6_name$jscomp$207$$).hostname;
    if ($getBaseDomain$$module$extensions$amp_analytics$0_1$linker_manager$$($$jscomp$destructuring$var296_domains$jscomp$1_sourceOrigin$jscomp$3$$) !== $getBaseDomain$$module$extensions$amp_analytics$0_1$linker_manager$$($hostname$jscomp$3$$) && $getBaseDomain$$module$extensions$amp_analytics$0_1$linker_manager$$($JSCompiler_StaticMethods_isDomainMatch_$self_canonicalOrigin$$) !== $getBaseDomain$$module$extensions$amp_analytics$0_1$linker_manager$$($hostname$jscomp$3$$)) {
      return !1;
    }
  }
  return !0;
}, $JSCompiler_StaticMethods_enableFormSupport_$$ = function($JSCompiler_StaticMethods_enableFormSupport_$self$$) {
  $JSCompiler_StaticMethods_enableFormSupport_$self$$.$D$ || $JSCompiler_StaticMethods_enableFormSupport_$self$$.$J$.then(function($formService$$) {
    $JSCompiler_StaticMethods_enableFormSupport_$self$$.$D$ = $formService$$.$F$($JSCompiler_StaticMethods_enableFormSupport_$self$$.$P$.bind($JSCompiler_StaticMethods_enableFormSupport_$self$$));
  });
}, $getBaseDomain$$module$extensions$amp_analytics$0_1$linker_manager$$ = function($domain$jscomp$6$$) {
  return $domain$jscomp$6$$.replace(/^(?:www\.|m\.|amp\.)+/, "");
}, $yieldThread$$module$extensions$amp_analytics$0_1$resource_timing$$ = function($fn$jscomp$21$$) {
  return new window.Promise(function($resolve$jscomp$55$$) {
    (0,window.setTimeout)(function() {
      return $resolve$jscomp$55$$($fn$jscomp$21$$());
    });
  });
}, $validateResourceTimingSpec$$module$extensions$amp_analytics$0_1$resource_timing$$ = function($spec$jscomp$16$$) {
  return _.$isObject$$module$src$types$$($spec$jscomp$16$$.resources) ? $spec$jscomp$16$$.encoding && $spec$jscomp$16$$.encoding.entry && $spec$jscomp$16$$.encoding.delim ? 2 > $spec$jscomp$16$$.encoding.base || 36 < $spec$jscomp$16$$.encoding.base ? (_.$user$$module$src$log$$().$Log$$module$src$log_prototype$warn$("ANALYTICS", "resource timing variables only supports bases between 2 and 36"), !1) : null != $spec$jscomp$16$$.responseAfter && "number" != typeof $spec$jscomp$16$$.responseAfter ? (_.$user$$module$src$log$$().$Log$$module$src$log_prototype$warn$("ANALYTICS", 
  'resourceTimingSpec["responseAfter"] must be a number'), !1) : !0 : (_.$user$$module$src$log$$().$Log$$module$src$log_prototype$warn$("ANALYTICS", "resourceTimingSpec is missing or has incomplete encoding options"), !1) : (_.$user$$module$src$log$$().$Log$$module$src$log_prototype$warn$("ANALYTICS", 'resourceTimingSpec missing "resources" field'), !1);
}, $nameForEntry$$module$extensions$amp_analytics$0_1$resource_timing$$ = function($entry$jscomp$22_i$jscomp$213$$, $resourcesByHost$$) {
  var $url$jscomp$169$$ = _.$parseUrlDeprecated$$module$src$url$$($entry$jscomp$22_i$jscomp$213$$.name);
  for ($entry$jscomp$22_i$jscomp$213$$ = 0; $entry$jscomp$22_i$jscomp$213$$ < $resourcesByHost$$.length; ++$entry$jscomp$22_i$jscomp$213$$) {
    var $$jscomp$destructuring$var299_index$jscomp$91$$ = $resourcesByHost$$[$entry$jscomp$22_i$jscomp$213$$], $resources$jscomp$7$$ = $$jscomp$destructuring$var299_index$jscomp$91$$.$resources$;
    if ($$jscomp$destructuring$var299_index$jscomp$91$$.$hostPattern$.test($url$jscomp$169$$.host) && ($$jscomp$destructuring$var299_index$jscomp$91$$ = _.$findIndex$$module$src$utils$array$$($resources$jscomp$7$$, function($entry$jscomp$22_i$jscomp$213$$) {
      return $entry$jscomp$22_i$jscomp$213$$.$pathPattern$.test($url$jscomp$169$$.pathname) && $entry$jscomp$22_i$jscomp$213$$.$queryPattern$.test($url$jscomp$169$$.search);
    }), -1 != $$jscomp$destructuring$var299_index$jscomp$91$$)) {
      return $resources$jscomp$7$$[$$jscomp$destructuring$var299_index$jscomp$91$$].name;
    }
  }
  return null;
}, $groupSpecsByHost$$module$extensions$amp_analytics$0_1$resource_timing$$ = function($byHostArray_resourceDefs$$) {
  var $byHost$$ = {}, $name$jscomp$209$$;
  for ($name$jscomp$209$$ in $byHostArray_resourceDefs$$) {
    var $host$jscomp$6$$ = $byHostArray_resourceDefs$$[$name$jscomp$209$$].host || "", $pattern$jscomp$5$$ = {name:$name$jscomp$209$$, $pathPattern$:new RegExp($byHostArray_resourceDefs$$[$name$jscomp$209$$].path || ""), $queryPattern$:new RegExp($byHostArray_resourceDefs$$[$name$jscomp$209$$].query || "")};
    $byHost$$[$host$jscomp$6$$] ? $byHost$$[$host$jscomp$6$$].$resources$.push($pattern$jscomp$5$$) : $byHost$$[$host$jscomp$6$$] = {$hostPattern$:new RegExp($host$jscomp$6$$), $resources$:[$pattern$jscomp$5$$]};
  }
  $byHostArray_resourceDefs$$ = [];
  for (var $host$219$$ in $byHost$$) {
    $byHostArray_resourceDefs$$.push($byHost$$[$host$219$$]);
  }
  return $byHostArray_resourceDefs$$;
}, $filterEntries$$module$extensions$amp_analytics$0_1$resource_timing$$ = function($entries$jscomp$4$$, $resourceDefs$jscomp$1$$) {
  var $byHost$jscomp$1$$ = $groupSpecsByHost$$module$extensions$amp_analytics$0_1$resource_timing$$($resourceDefs$jscomp$1$$), $results$jscomp$5$$ = [];
  $entries$jscomp$4$$.forEach(function($entries$jscomp$4$$) {
    var $resourceDefs$jscomp$1$$ = $nameForEntry$$module$extensions$amp_analytics$0_1$resource_timing$$($entries$jscomp$4$$, $byHost$jscomp$1$$);
    $resourceDefs$jscomp$1$$ && $results$jscomp$5$$.push({$entry$:$entries$jscomp$4$$, name:$resourceDefs$jscomp$1$$});
  });
  return $results$jscomp$5$$;
}, $serialize$$module$extensions$amp_analytics$0_1$resource_timing$$ = function($entries$jscomp$5_promises$jscomp$15$$, $resourceTimingSpec$$, $win$jscomp$312$$) {
  function $format$jscomp$17$$($entries$jscomp$5_promises$jscomp$15$$, $resourceTimingSpec$$) {
    return Math.round($entries$jscomp$5_promises$jscomp$15$$ - (void 0 === $resourceTimingSpec$$ ? 0 : $resourceTimingSpec$$)).toString($encoding$jscomp$2$$.base || 10);
  }
  var $resources$jscomp$8$$ = $resourceTimingSpec$$.resources, $encoding$jscomp$2$$ = $resourceTimingSpec$$.encoding, $variableService$$ = $variableServiceFor$$module$extensions$amp_analytics$0_1$variables$$($win$jscomp$312$$);
  $entries$jscomp$5_promises$jscomp$15$$ = $filterEntries$$module$extensions$amp_analytics$0_1$resource_timing$$($entries$jscomp$5_promises$jscomp$15$$, $resources$jscomp$8$$).map(function($entries$jscomp$5_promises$jscomp$15$$) {
    var $resourceTimingSpec$$ = $entries$jscomp$5_promises$jscomp$15$$.$entry$;
    $entries$jscomp$5_promises$jscomp$15$$ = {key:$entries$jscomp$5_promises$jscomp$15$$.name, startTime:$format$jscomp$17$$($resourceTimingSpec$$.startTime), redirectTime:$format$jscomp$17$$($resourceTimingSpec$$.redirectEnd, $resourceTimingSpec$$.redirectStart), domainLookupTime:$format$jscomp$17$$($resourceTimingSpec$$.domainLookupEnd, $resourceTimingSpec$$.domainLookupStart), tcpConnectTime:$format$jscomp$17$$($resourceTimingSpec$$.connectEnd, $resourceTimingSpec$$.connectStart), serverResponseTime:$format$jscomp$17$$($resourceTimingSpec$$.responseStart, 
    $resourceTimingSpec$$.requestStart), networkTransferTime:$format$jscomp$17$$($resourceTimingSpec$$.responseEnd, $resourceTimingSpec$$.responseStart), transferSize:$format$jscomp$17$$($resourceTimingSpec$$.transferSize || 0), encodedBodySize:$format$jscomp$17$$($resourceTimingSpec$$.encodedBodySize || 0), decodedBodySize:$format$jscomp$17$$($resourceTimingSpec$$.decodedBodySize || 0), duration:$format$jscomp$17$$($resourceTimingSpec$$.duration), initiatorType:$resourceTimingSpec$$.initiatorType};
    return new $ExpansionOptions$$module$extensions$amp_analytics$0_1$variables$$($entries$jscomp$5_promises$jscomp$15$$, 1);
  }).map(function($entries$jscomp$5_promises$jscomp$15$$) {
    return $JSCompiler_StaticMethods_expandTemplate$$($variableService$$, $encoding$jscomp$2$$.entry, $entries$jscomp$5_promises$jscomp$15$$);
  });
  return window.Promise.all($entries$jscomp$5_promises$jscomp$15$$).then(function($entries$jscomp$5_promises$jscomp$15$$) {
    return $entries$jscomp$5_promises$jscomp$15$$.join($encoding$jscomp$2$$.delim);
  });
}, $serializeResourceTiming$$module$extensions$amp_analytics$0_1$resource_timing$$ = function($win$jscomp$313$$, $resourceTimingSpec$jscomp$1$$) {
  if ($resourceTimingSpec$jscomp$1$$.done || !$win$jscomp$313$$.performance || !$win$jscomp$313$$.performance.now || !$win$jscomp$313$$.performance.getEntriesByType || !$validateResourceTimingSpec$$module$extensions$amp_analytics$0_1$resource_timing$$($resourceTimingSpec$jscomp$1$$)) {
    return $resourceTimingSpec$jscomp$1$$.done = !0, window.Promise.resolve("");
  }
  var $entries$jscomp$6$$ = $win$jscomp$313$$.performance.getEntriesByType("resource");
  150 <= $entries$jscomp$6$$.length && ($resourceTimingSpec$jscomp$1$$.done = !0);
  var $responseAfter$$ = $resourceTimingSpec$jscomp$1$$.responseAfter || 0;
  $resourceTimingSpec$jscomp$1$$.responseAfter = Math.max($responseAfter$$, $win$jscomp$313$$.performance.now());
  $entries$jscomp$6$$ = $entries$jscomp$6$$.filter(function($win$jscomp$313$$) {
    return $win$jscomp$313$$.startTime + $win$jscomp$313$$.duration >= $responseAfter$$;
  });
  return $entries$jscomp$6$$.length ? $yieldThread$$module$extensions$amp_analytics$0_1$resource_timing$$(function() {
    return $serialize$$module$extensions$amp_analytics$0_1$resource_timing$$($entries$jscomp$6$$, $resourceTimingSpec$jscomp$1$$, $win$jscomp$313$$);
  }) : window.Promise.resolve("");
}, $getResourceTiming$$module$extensions$amp_analytics$0_1$resource_timing$$ = function($win$jscomp$314$$, $spec$jscomp$17$$, $startTime$jscomp$20$$) {
  return $spec$jscomp$17$$ && Date.now() < $startTime$jscomp$20$$ + 6E4 ? $serializeResourceTiming$$module$extensions$amp_analytics$0_1$resource_timing$$($win$jscomp$314$$, $spec$jscomp$17$$) : window.Promise.resolve("");
}, $RequestHandler$$module$extensions$amp_analytics$0_1$requests$$ = function($element$jscomp$325_i$jscomp$inline_2569$$, $interval$jscomp$inline_2570_request$jscomp$16$$, $preconnect$jscomp$3$$, $transport$jscomp$1$$, $isSandbox$$) {
  this.$ampdoc_$ = $element$jscomp$325_i$jscomp$inline_2569$$.$getAmpDoc$();
  this.$win$ = this.$ampdoc_$.$win$;
  this.$ba$ = $interval$jscomp$inline_2570_request$jscomp$16$$.baseUrl;
  this.$D$ = $interval$jscomp$inline_2570_request$jscomp$16$$.batchInterval;
  this.$Y$ = Number($interval$jscomp$inline_2570_request$jscomp$16$$.reportWindow) || null;
  this.$O$ = null;
  this.$variableService_$ = $variableServiceFor$$module$extensions$amp_analytics$0_1$variables$$(this.$win$);
  this.$U$ = _.$Services$$module$src$services$urlReplacementsForDoc$$($element$jscomp$325_i$jscomp$inline_2569$$);
  this.$J$ = this.$I$ = null;
  this.$P$ = [];
  this.$ea$ = $preconnect$jscomp$3$$;
  this.$transport_$ = $transport$jscomp$1$$;
  this.$V$ = $isSandbox$$ ? $SANDBOX_AVAILABLE_VARS$$module$extensions$amp_analytics$0_1$sandbox_vars_whitelist$$ : void 0;
  this.$K$ = this.$F$ = null;
  this.$W$ = !0;
  this.$R$ = null;
  this.$G$ = 0;
  this.$aa$ = Date.now();
  $JSCompiler_StaticMethods_initReportWindow_$$(this);
  if (this.$D$) {
    this.$D$ = _.$isArray$$module$src$types$$(this.$D$) ? this.$D$ : [this.$D$];
    for ($element$jscomp$325_i$jscomp$inline_2569$$ = 0; $element$jscomp$325_i$jscomp$inline_2569$$ < this.$D$.length; $element$jscomp$325_i$jscomp$inline_2569$$++) {
      $interval$jscomp$inline_2570_request$jscomp$16$$ = this.$D$[$element$jscomp$325_i$jscomp$inline_2569$$], $interval$jscomp$inline_2570_request$jscomp$16$$ = 1000 * Number($interval$jscomp$inline_2570_request$jscomp$16$$), this.$D$[$element$jscomp$325_i$jscomp$inline_2569$$] = $interval$jscomp$inline_2570_request$jscomp$16$$;
    }
    this.$O$ = 0;
    $JSCompiler_StaticMethods_refreshBatchInterval_$$(this);
  }
}, $JSCompiler_StaticMethods_RequestHandler$$module$extensions$amp_analytics$0_1$requests_prototype$send$$ = function($JSCompiler_StaticMethods_RequestHandler$$module$extensions$amp_analytics$0_1$requests_prototype$send$self$$, $configParams_params$jscomp$24$$, $trigger$$, $batchSegmentPromise_expansionOption$$) {
  var $isImportant$$ = !0 === $trigger$$.important;
  if ($JSCompiler_StaticMethods_RequestHandler$$module$extensions$amp_analytics$0_1$requests_prototype$send$self$$.$W$ || $isImportant$$) {
    $JSCompiler_StaticMethods_RequestHandler$$module$extensions$amp_analytics$0_1$requests_prototype$send$self$$.$G$++;
    $JSCompiler_StaticMethods_RequestHandler$$module$extensions$amp_analytics$0_1$requests_prototype$send$self$$.$R$ = $trigger$$;
    var $bindings$$ = $JSCompiler_StaticMethods_RequestHandler$$module$extensions$amp_analytics$0_1$requests_prototype$send$self$$.$variableService_$.$D$;
    $bindings$$.RESOURCE_TIMING = $getResourceTiming$$module$extensions$amp_analytics$0_1$resource_timing$$($JSCompiler_StaticMethods_RequestHandler$$module$extensions$amp_analytics$0_1$requests_prototype$send$self$$.$win$, $trigger$$.resourceTimingSpec, $JSCompiler_StaticMethods_RequestHandler$$module$extensions$amp_analytics$0_1$requests_prototype$send$self$$.$aa$);
    $JSCompiler_StaticMethods_RequestHandler$$module$extensions$amp_analytics$0_1$requests_prototype$send$self$$.$I$ || ($batchSegmentPromise_expansionOption$$.$D$.extraUrlParams = !0, $JSCompiler_StaticMethods_RequestHandler$$module$extensions$amp_analytics$0_1$requests_prototype$send$self$$.$J$ = $JSCompiler_StaticMethods_expandTemplate$$($JSCompiler_StaticMethods_RequestHandler$$module$extensions$amp_analytics$0_1$requests_prototype$send$self$$.$variableService_$, $JSCompiler_StaticMethods_RequestHandler$$module$extensions$amp_analytics$0_1$requests_prototype$send$self$$.$ba$, 
    $batchSegmentPromise_expansionOption$$), $JSCompiler_StaticMethods_RequestHandler$$module$extensions$amp_analytics$0_1$requests_prototype$send$self$$.$I$ = $JSCompiler_StaticMethods_RequestHandler$$module$extensions$amp_analytics$0_1$requests_prototype$send$self$$.$J$.then(function($configParams_params$jscomp$24$$) {
      return _.$JSCompiler_StaticMethods_expandUrlAsync$$($JSCompiler_StaticMethods_RequestHandler$$module$extensions$amp_analytics$0_1$requests_prototype$send$self$$.$U$, $configParams_params$jscomp$24$$, $bindings$$, $JSCompiler_StaticMethods_RequestHandler$$module$extensions$amp_analytics$0_1$requests_prototype$send$self$$.$V$);
    }));
    $configParams_params$jscomp$24$$ = Object.assign({}, $configParams_params$jscomp$24$$, $trigger$$.extraUrlParams);
    var $timestamp$jscomp$3$$ = $JSCompiler_StaticMethods_RequestHandler$$module$extensions$amp_analytics$0_1$requests_prototype$send$self$$.$win$.Date.now();
    $batchSegmentPromise_expansionOption$$ = $expandExtraUrlParams$$module$extensions$amp_analytics$0_1$requests$$($JSCompiler_StaticMethods_RequestHandler$$module$extensions$amp_analytics$0_1$requests_prototype$send$self$$.$variableService_$, $JSCompiler_StaticMethods_RequestHandler$$module$extensions$amp_analytics$0_1$requests_prototype$send$self$$.$U$, $configParams_params$jscomp$24$$, $batchSegmentPromise_expansionOption$$, $bindings$$, $JSCompiler_StaticMethods_RequestHandler$$module$extensions$amp_analytics$0_1$requests_prototype$send$self$$.$V$).then(function($JSCompiler_StaticMethods_RequestHandler$$module$extensions$amp_analytics$0_1$requests_prototype$send$self$$) {
      return _.$dict$$module$src$utils$object$$({trigger:$trigger$$.on, timestamp:$timestamp$jscomp$3$$, extraUrlParams:$JSCompiler_StaticMethods_RequestHandler$$module$extensions$amp_analytics$0_1$requests_prototype$send$self$$});
    });
    $JSCompiler_StaticMethods_RequestHandler$$module$extensions$amp_analytics$0_1$requests_prototype$send$self$$.$P$.push($batchSegmentPromise_expansionOption$$);
    0 == $JSCompiler_StaticMethods_RequestHandler$$module$extensions$amp_analytics$0_1$requests_prototype$send$self$$.$G$ || !$isImportant$$ && $JSCompiler_StaticMethods_RequestHandler$$module$extensions$amp_analytics$0_1$requests_prototype$send$self$$.$D$ || $JSCompiler_StaticMethods_RequestHandler$$module$extensions$amp_analytics$0_1$requests_prototype$fire_$$($JSCompiler_StaticMethods_RequestHandler$$module$extensions$amp_analytics$0_1$requests_prototype$send$self$$);
  }
}, $JSCompiler_StaticMethods_RequestHandler$$module$extensions$amp_analytics$0_1$requests_prototype$fire_$$ = function($JSCompiler_StaticMethods_RequestHandler$$module$extensions$amp_analytics$0_1$requests_prototype$fire_$self$$) {
  var $baseUrlTemplatePromise$$ = $JSCompiler_StaticMethods_RequestHandler$$module$extensions$amp_analytics$0_1$requests_prototype$fire_$self$$.$J$, $baseUrlPromise$$ = $JSCompiler_StaticMethods_RequestHandler$$module$extensions$amp_analytics$0_1$requests_prototype$fire_$self$$.$I$, $segmentPromises$$ = $JSCompiler_StaticMethods_RequestHandler$$module$extensions$amp_analytics$0_1$requests_prototype$fire_$self$$.$P$, $trigger$jscomp$1$$ = $JSCompiler_StaticMethods_RequestHandler$$module$extensions$amp_analytics$0_1$requests_prototype$fire_$self$$.$R$;
  $JSCompiler_StaticMethods_RequestHandler$$module$extensions$amp_analytics$0_1$requests_prototype$reset_$$($JSCompiler_StaticMethods_RequestHandler$$module$extensions$amp_analytics$0_1$requests_prototype$fire_$self$$);
  $baseUrlTemplatePromise$$.then(function($baseUrlTemplatePromise$$) {
    $JSCompiler_StaticMethods_RequestHandler$$module$extensions$amp_analytics$0_1$requests_prototype$fire_$self$$.$ea$.url($baseUrlTemplatePromise$$, !0);
    window.Promise.all([$baseUrlPromise$$, window.Promise.all($segmentPromises$$)]).then(function($baseUrlTemplatePromise$$) {
      var $baseUrlPromise$$ = $baseUrlTemplatePromise$$[0];
      $baseUrlTemplatePromise$$ = $baseUrlTemplatePromise$$[1];
      0 !== $baseUrlTemplatePromise$$.length && ($trigger$jscomp$1$$.iframePing ? $JSCompiler_StaticMethods_sendRequestUsingIframe$$($JSCompiler_StaticMethods_RequestHandler$$module$extensions$amp_analytics$0_1$requests_prototype$fire_$self$$.$transport_$, $baseUrlPromise$$, $baseUrlTemplatePromise$$[0]) : $JSCompiler_StaticMethods_Transport$$module$extensions$amp_analytics$0_1$transport_prototype$sendRequest$$($JSCompiler_StaticMethods_RequestHandler$$module$extensions$amp_analytics$0_1$requests_prototype$fire_$self$$.$transport_$, 
      $baseUrlPromise$$, $baseUrlTemplatePromise$$, !!$JSCompiler_StaticMethods_RequestHandler$$module$extensions$amp_analytics$0_1$requests_prototype$fire_$self$$.$D$));
    });
  });
}, $JSCompiler_StaticMethods_RequestHandler$$module$extensions$amp_analytics$0_1$requests_prototype$reset_$$ = function($JSCompiler_StaticMethods_RequestHandler$$module$extensions$amp_analytics$0_1$requests_prototype$reset_$self$$) {
  $JSCompiler_StaticMethods_RequestHandler$$module$extensions$amp_analytics$0_1$requests_prototype$reset_$self$$.$G$ = 0;
  $JSCompiler_StaticMethods_RequestHandler$$module$extensions$amp_analytics$0_1$requests_prototype$reset_$self$$.$I$ = null;
  $JSCompiler_StaticMethods_RequestHandler$$module$extensions$amp_analytics$0_1$requests_prototype$reset_$self$$.$J$ = null;
  $JSCompiler_StaticMethods_RequestHandler$$module$extensions$amp_analytics$0_1$requests_prototype$reset_$self$$.$P$ = [];
  $JSCompiler_StaticMethods_RequestHandler$$module$extensions$amp_analytics$0_1$requests_prototype$reset_$self$$.$R$ = null;
}, $JSCompiler_StaticMethods_initReportWindow_$$ = function($JSCompiler_StaticMethods_initReportWindow_$self$$) {
  $JSCompiler_StaticMethods_initReportWindow_$self$$.$Y$ && ($JSCompiler_StaticMethods_initReportWindow_$self$$.$K$ = $JSCompiler_StaticMethods_initReportWindow_$self$$.$win$.setTimeout(function() {
    0 != $JSCompiler_StaticMethods_initReportWindow_$self$$.$G$ && $JSCompiler_StaticMethods_RequestHandler$$module$extensions$amp_analytics$0_1$requests_prototype$fire_$$($JSCompiler_StaticMethods_initReportWindow_$self$$);
    $JSCompiler_StaticMethods_initReportWindow_$self$$.$W$ = !1;
    $JSCompiler_StaticMethods_initReportWindow_$self$$.$F$ && ($JSCompiler_StaticMethods_initReportWindow_$self$$.$win$.clearTimeout($JSCompiler_StaticMethods_initReportWindow_$self$$.$F$), $JSCompiler_StaticMethods_initReportWindow_$self$$.$F$ = null);
  }, 1000 * $JSCompiler_StaticMethods_initReportWindow_$self$$.$Y$));
}, $JSCompiler_StaticMethods_refreshBatchInterval_$$ = function($JSCompiler_StaticMethods_refreshBatchInterval_$self$$) {
  var $interval$jscomp$8$$ = $JSCompiler_StaticMethods_refreshBatchInterval_$self$$.$O$ < $JSCompiler_StaticMethods_refreshBatchInterval_$self$$.$D$.length ? $JSCompiler_StaticMethods_refreshBatchInterval_$self$$.$D$[$JSCompiler_StaticMethods_refreshBatchInterval_$self$$.$O$++] : $JSCompiler_StaticMethods_refreshBatchInterval_$self$$.$D$[$JSCompiler_StaticMethods_refreshBatchInterval_$self$$.$D$.length - 1];
  $JSCompiler_StaticMethods_refreshBatchInterval_$self$$.$F$ = $JSCompiler_StaticMethods_refreshBatchInterval_$self$$.$win$.setTimeout(function() {
    0 != $JSCompiler_StaticMethods_refreshBatchInterval_$self$$.$G$ && $JSCompiler_StaticMethods_RequestHandler$$module$extensions$amp_analytics$0_1$requests_prototype$fire_$$($JSCompiler_StaticMethods_refreshBatchInterval_$self$$);
    $JSCompiler_StaticMethods_refreshBatchInterval_$$($JSCompiler_StaticMethods_refreshBatchInterval_$self$$);
  }, $interval$jscomp$8$$);
}, $expandPostMessage$$module$extensions$amp_analytics$0_1$requests$$ = function($ampdoc$jscomp$135_basePromise$$, $msg$jscomp$1$$, $configParams$jscomp$1$$, $trigger$jscomp$2$$, $expansionOption$jscomp$1$$, $element$jscomp$326$$) {
  var $variableService$jscomp$1$$ = $variableServiceFor$$module$extensions$amp_analytics$0_1$variables$$($ampdoc$jscomp$135_basePromise$$.$win$), $urlReplacementService$$ = _.$Services$$module$src$services$urlReplacementsForDoc$$($element$jscomp$326$$), $bindings$jscomp$1$$ = $variableService$jscomp$1$$.$D$;
  $expansionOption$jscomp$1$$.$D$.extraUrlParams = !0;
  $ampdoc$jscomp$135_basePromise$$ = $JSCompiler_StaticMethods_expandTemplate$$($variableService$jscomp$1$$, $msg$jscomp$1$$, $expansionOption$jscomp$1$$).then(function($ampdoc$jscomp$135_basePromise$$) {
    return $JSCompiler_StaticMethods_expandStringAsync$$($urlReplacementService$$, $ampdoc$jscomp$135_basePromise$$, $bindings$jscomp$1$$);
  });
  return 0 > $msg$jscomp$1$$.indexOf("${extraUrlParams}") ? $ampdoc$jscomp$135_basePromise$$ : $ampdoc$jscomp$135_basePromise$$.then(function($ampdoc$jscomp$135_basePromise$$) {
    var $msg$jscomp$1$$ = Object.assign({}, $configParams$jscomp$1$$, $trigger$jscomp$2$$.extraUrlParams);
    return $expandExtraUrlParams$$module$extensions$amp_analytics$0_1$requests$$($variableService$jscomp$1$$, $urlReplacementService$$, $msg$jscomp$1$$, $expansionOption$jscomp$1$$, $bindings$jscomp$1$$).then(function($msg$jscomp$1$$) {
      return $defaultSerializer$$module$extensions$amp_analytics$0_1$transport_serializer$$($ampdoc$jscomp$135_basePromise$$, [_.$dict$$module$src$utils$object$$({extraUrlParams:$msg$jscomp$1$$})]);
    });
  });
}, $expandExtraUrlParams$$module$extensions$amp_analytics$0_1$requests$$ = function($variableService$jscomp$2$$, $urlReplacements$jscomp$4$$, $params$jscomp$27$$, $expansionOption$jscomp$2$$, $bindings$jscomp$2$$, $opt_whitelist$$) {
  function $expandObject$$($params$jscomp$27$$, $expansionOption$jscomp$2$$) {
    var $params$jscomp$28$$ = $params$jscomp$27$$[$expansionOption$jscomp$2$$];
    if ("string" === typeof $params$jscomp$28$$) {
      var $key$jscomp$105$$ = $JSCompiler_StaticMethods_expandTemplate$$($variableService$jscomp$2$$, $params$jscomp$28$$, $option$jscomp$11$$).then(function($variableService$jscomp$2$$) {
        return $JSCompiler_StaticMethods_expandStringAsync$$($urlReplacements$jscomp$4$$, $variableService$jscomp$2$$, $bindings$jscomp$2$$, $opt_whitelist$$);
      }).then(function($variableService$jscomp$2$$) {
        return $params$jscomp$27$$[$expansionOption$jscomp$2$$] = $variableService$jscomp$2$$;
      });
      $requestPromises$$.push($key$jscomp$105$$);
    } else {
      _.$isArray$$module$src$types$$($params$jscomp$28$$) ? $params$jscomp$28$$.forEach(function($variableService$jscomp$2$$, $urlReplacements$jscomp$4$$) {
        return $expandObject$$($params$jscomp$28$$, $urlReplacements$jscomp$4$$);
      }) : _.$isObject$$module$src$types$$($params$jscomp$28$$) && null !== $params$jscomp$28$$ && Object.keys($params$jscomp$28$$).forEach(function($variableService$jscomp$2$$) {
        return $expandObject$$($params$jscomp$28$$, $variableService$jscomp$2$$);
      });
    }
  }
  var $requestPromises$$ = [], $option$jscomp$11$$ = new $ExpansionOptions$$module$extensions$amp_analytics$0_1$variables$$($expansionOption$jscomp$2$$.$vars$, $expansionOption$jscomp$2$$.iterations, !0);
  Object.keys($params$jscomp$27$$).forEach(function($variableService$jscomp$2$$) {
    return $expandObject$$($params$jscomp$27$$, $variableService$jscomp$2$$);
  });
  return window.Promise.all($requestPromises$$).then(function() {
    return $params$jscomp$27$$;
  });
}, $IframeTransportMessageQueue$$module$extensions$amp_analytics$0_1$iframe_transport_message_queue$$ = function($frame$jscomp$3$$) {
  var $$jscomp$this$jscomp$406$$ = this;
  this.$I$ = $frame$jscomp$3$$;
  this.$F$ = !1;
  this.$D$ = [];
  this.$G$ = new _.$SubscriptionApi$$module$src$iframe_helper$$(this.$I$, "send-iframe-transport-events", !0, function() {
    $$jscomp$this$jscomp$406$$.$F$ = !0;
    $JSCompiler_StaticMethods_flushQueue_$$($$jscomp$this$jscomp$406$$);
  });
}, $JSCompiler_StaticMethods_flushQueue_$$ = function($JSCompiler_StaticMethods_flushQueue_$self$$) {
  $JSCompiler_StaticMethods_flushQueue_$self$$.$F$ && $JSCompiler_StaticMethods_flushQueue_$self$$.$D$.length && (_.$JSCompiler_StaticMethods_SubscriptionApi$$module$src$iframe_helper_prototype$send$$($JSCompiler_StaticMethods_flushQueue_$self$$.$G$, "iframe-transport-events", {events:$JSCompiler_StaticMethods_flushQueue_$self$$.$D$}), $JSCompiler_StaticMethods_flushQueue_$self$$.$D$ = []);
}, $getIframeTransportScriptUrl$$module$extensions$amp_analytics$0_1$iframe_transport$$ = function() {
  return _.$urls$$module$src$config$$.thirdParty + "/1901181729101/iframe-transport-client-v0.js";
}, $IframeTransport$$module$extensions$amp_analytics$0_1$iframe_transport$$ = function($ampWin$jscomp$1_frameData$jscomp$inline_2584_frameData$jscomp$inline_6069_sentinel$jscomp$inline_6066$$, $frame$jscomp$inline_6068_frameName$jscomp$inline_6067_type$jscomp$167$$, $config$jscomp$48$$, $id$jscomp$59$$) {
  this.$D$ = $ampWin$jscomp$1_frameData$jscomp$inline_2584_frameData$jscomp$inline_6069_sentinel$jscomp$inline_6066$$;
  this.$type_$ = $frame$jscomp$inline_6068_frameName$jscomp$inline_6067_type$jscomp$167$$;
  this.$G$ = $id$jscomp$59$$;
  this.$F$ = $config$jscomp$48$$.iframe;
  this.$I$ = 0;
  _.$hasOwn$$module$src$utils$object$$($IframeTransport$$module$extensions$amp_analytics$0_1$iframe_transport$crossDomainIframes_$$, this.$type_$) ? ($ampWin$jscomp$1_frameData$jscomp$inline_2584_frameData$jscomp$inline_6069_sentinel$jscomp$inline_6066$$ = $IframeTransport$$module$extensions$amp_analytics$0_1$iframe_transport$crossDomainIframes_$$[this.$type_$], ++$ampWin$jscomp$1_frameData$jscomp$inline_2584_frameData$jscomp$inline_6069_sentinel$jscomp$inline_6066$$.$usageCount$) : ($ampWin$jscomp$1_frameData$jscomp$inline_2584_frameData$jscomp$inline_6069_sentinel$jscomp$inline_6066$$ = 
  String(++$IframeTransport$$module$extensions$amp_analytics$0_1$iframe_transport$nextId_$$), $frame$jscomp$inline_6068_frameName$jscomp$inline_6067_type$jscomp$167$$ = JSON.stringify({$scriptSrc$:$getIframeTransportScriptUrl$$module$extensions$amp_analytics$0_1$iframe_transport$$(), sentinel:$ampWin$jscomp$1_frameData$jscomp$inline_2584_frameData$jscomp$inline_6069_sentinel$jscomp$inline_6066$$, type:this.$type_$}), $frame$jscomp$inline_6068_frameName$jscomp$inline_6067_type$jscomp$167$$ = _.$createElementWithAttributes$$module$src$dom$$(this.$D$.document, 
  "iframe", {sandbox:"allow-scripts allow-same-origin", name:$frame$jscomp$inline_6068_frameName$jscomp$inline_6067_type$jscomp$167$$, "data-amp-3p-sentinel":$ampWin$jscomp$1_frameData$jscomp$inline_2584_frameData$jscomp$inline_6069_sentinel$jscomp$inline_6066$$}), $frame$jscomp$inline_6068_frameName$jscomp$inline_6067_type$jscomp$167$$.sentinel = $ampWin$jscomp$1_frameData$jscomp$inline_2584_frameData$jscomp$inline_6069_sentinel$jscomp$inline_6066$$, _.$toggle$$module$src$style$$($frame$jscomp$inline_6068_frameName$jscomp$inline_6067_type$jscomp$167$$, 
  !1), $frame$jscomp$inline_6068_frameName$jscomp$inline_6067_type$jscomp$167$$.src = this.$F$, $ampWin$jscomp$1_frameData$jscomp$inline_2584_frameData$jscomp$inline_6069_sentinel$jscomp$inline_6066$$ = {frame:$frame$jscomp$inline_6068_frameName$jscomp$inline_6067_type$jscomp$167$$, $usageCount$:1, $queue$:new $IframeTransportMessageQueue$$module$extensions$amp_analytics$0_1$iframe_transport_message_queue$$($frame$jscomp$inline_6068_frameName$jscomp$inline_6067_type$jscomp$167$$)}, $IframeTransport$$module$extensions$amp_analytics$0_1$iframe_transport$crossDomainIframes_$$[this.$type_$] = 
  $ampWin$jscomp$1_frameData$jscomp$inline_2584_frameData$jscomp$inline_6069_sentinel$jscomp$inline_6066$$, this.$D$.document.body.appendChild($ampWin$jscomp$1_frameData$jscomp$inline_2584_frameData$jscomp$inline_6069_sentinel$jscomp$inline_6066$$.frame), $JSCompiler_StaticMethods_createPerformanceObserver_$$(this));
}, $JSCompiler_StaticMethods_createPerformanceObserver_$$ = function($JSCompiler_StaticMethods_createPerformanceObserver_$self$$) {
  _.$isLongTaskApiSupported$$module$src$service$jank_meter$$($JSCompiler_StaticMethods_createPerformanceObserver_$self$$.$D$) && ($IframeTransport$$module$extensions$amp_analytics$0_1$iframe_transport$performanceObservers_$$[$JSCompiler_StaticMethods_createPerformanceObserver_$self$$.$type_$] = new $JSCompiler_StaticMethods_createPerformanceObserver_$self$$.$D$.PerformanceObserver(function($entryList$jscomp$1$$) {
    $entryList$jscomp$1$$ && $entryList$jscomp$1$$.getEntries().forEach(function($entryList$jscomp$1$$) {
      $entryList$jscomp$1$$ && "longtask" == $entryList$jscomp$1$$.entryType && "cross-origin-descendant" == $entryList$jscomp$1$$.name && $entryList$jscomp$1$$.attribution && $entryList$jscomp$1$$.attribution.forEach(function($entryList$jscomp$1$$) {
        $JSCompiler_StaticMethods_createPerformanceObserver_$self$$.$F$ == $entryList$jscomp$1$$.containerSrc && 0 == ++$JSCompiler_StaticMethods_createPerformanceObserver_$self$$.$I$ % 5 && _.$user$$module$src$log$$().error("amp-analytics/iframe-transport", 'Long Task: Vendor: "' + $JSCompiler_StaticMethods_createPerformanceObserver_$self$$.$type_$ + '"');
      });
    });
  }), $IframeTransport$$module$extensions$amp_analytics$0_1$iframe_transport$performanceObservers_$$[$JSCompiler_StaticMethods_createPerformanceObserver_$self$$.$type_$].observe({entryTypes:["longtask"]}));
}, $JSCompiler_StaticMethods_IframeTransport$$module$extensions$amp_analytics$0_1$iframe_transport_prototype$sendRequest$$ = function($JSCompiler_StaticMethods_IframeTransport$$module$extensions$amp_analytics$0_1$iframe_transport_prototype$sendRequest$self_event$jscomp$inline_2587$$, $event$jscomp$82$$) {
  var $JSCompiler_StaticMethods_IframeTransportMessageQueue$$module$extensions$amp_analytics$0_1$iframe_transport_message_queue_prototype$enqueue$self$jscomp$inline_2586$$ = $IframeTransport$$module$extensions$amp_analytics$0_1$iframe_transport$crossDomainIframes_$$[$JSCompiler_StaticMethods_IframeTransport$$module$extensions$amp_analytics$0_1$iframe_transport_prototype$sendRequest$self_event$jscomp$inline_2587$$.$type_$].$queue$;
  $JSCompiler_StaticMethods_IframeTransport$$module$extensions$amp_analytics$0_1$iframe_transport_prototype$sendRequest$self_event$jscomp$inline_2587$$ = {$creativeId$:$JSCompiler_StaticMethods_IframeTransport$$module$extensions$amp_analytics$0_1$iframe_transport_prototype$sendRequest$self_event$jscomp$inline_2587$$.$G$, message:$event$jscomp$82$$};
  $JSCompiler_StaticMethods_IframeTransportMessageQueue$$module$extensions$amp_analytics$0_1$iframe_transport_message_queue_prototype$enqueue$self$jscomp$inline_2586$$.$D$.push($JSCompiler_StaticMethods_IframeTransport$$module$extensions$amp_analytics$0_1$iframe_transport_prototype$sendRequest$self_event$jscomp$inline_2587$$);
  100 <= $JSCompiler_StaticMethods_IframeTransportMessageQueue$$module$extensions$amp_analytics$0_1$iframe_transport_message_queue_prototype$enqueue$self$jscomp$inline_2586$$.$D$.length && (_.$dev$$module$src$log$$().$Log$$module$src$log_prototype$warn$("amp-analytics/iframe-transport-message-queue", "Exceeded maximum size of queue for: " + $JSCompiler_StaticMethods_IframeTransport$$module$extensions$amp_analytics$0_1$iframe_transport_prototype$sendRequest$self_event$jscomp$inline_2587$$.$creativeId$), 
  $JSCompiler_StaticMethods_IframeTransportMessageQueue$$module$extensions$amp_analytics$0_1$iframe_transport_message_queue_prototype$enqueue$self$jscomp$inline_2586$$.$D$.shift());
  $JSCompiler_StaticMethods_flushQueue_$$($JSCompiler_StaticMethods_IframeTransportMessageQueue$$module$extensions$amp_analytics$0_1$iframe_transport_message_queue_prototype$enqueue$self$jscomp$inline_2586$$);
}, $Transport$$module$extensions$amp_analytics$0_1$transport$$ = function($win$jscomp$316$$, $options$jscomp$30$$) {
  $options$jscomp$30$$ = void 0 === $options$jscomp$30$$ ? {} : $options$jscomp$30$$;
  this.$G$ = $win$jscomp$316$$;
  this.$D$ = $options$jscomp$30$$;
  this.$I$ = this.$D$.referrerPolicy;
  "no-referrer" === this.$I$ && (this.$D$.beacon = !1, this.$D$.xhrpost = !1);
  this.$J$ = !!this.$D$.useBody;
  this.$F$ = null;
  this.$isInabox_$ = "inabox" == _.$getMode$$module$src$mode$$($win$jscomp$316$$).runtime;
}, $JSCompiler_StaticMethods_Transport$$module$extensions$amp_analytics$0_1$transport_prototype$sendRequest$$ = function($JSCompiler_StaticMethods_Transport$$module$extensions$amp_analytics$0_1$transport_prototype$sendRequest$self$$, $url$jscomp$170$$, $segments$jscomp$2$$, $inBatch$$) {
  if ($url$jscomp$170$$ && 0 !== $segments$jscomp$2$$.length) {
    var $getRequest$$ = $cacheFuncResult$$module$extensions$amp_analytics$0_1$transport$$(function($JSCompiler_StaticMethods_Transport$$module$extensions$amp_analytics$0_1$transport_prototype$sendRequest$self$$) {
      if ($inBatch$$) {
        $JSCompiler_StaticMethods_Transport$$module$extensions$amp_analytics$0_1$transport_prototype$sendRequest$self$$ = $JSCompiler_StaticMethods_generateBatchRequest$$($url$jscomp$170$$, $segments$jscomp$2$$, $JSCompiler_StaticMethods_Transport$$module$extensions$amp_analytics$0_1$transport_prototype$sendRequest$self$$);
      } else {
        var $getRequest$$ = $segments$jscomp$2$$[0];
        $JSCompiler_StaticMethods_Transport$$module$extensions$amp_analytics$0_1$transport_prototype$sendRequest$self$$ = (void 0 === $JSCompiler_StaticMethods_Transport$$module$extensions$amp_analytics$0_1$transport_prototype$sendRequest$self$$ ? 0 : $JSCompiler_StaticMethods_Transport$$module$extensions$amp_analytics$0_1$transport_prototype$sendRequest$self$$) ? {url:$url$jscomp$170$$.replace("${extraUrlParams}", ""), $payload$:JSON.stringify($getRequest$$.extraUrlParams)} : {url:$defaultSerializer$$module$extensions$amp_analytics$0_1$transport_serializer$$($url$jscomp$170$$, 
        [$getRequest$$])};
      }
      _.$checkCorsUrl$$module$src$url$$($JSCompiler_StaticMethods_Transport$$module$extensions$amp_analytics$0_1$transport_prototype$sendRequest$self$$.url);
      return $JSCompiler_StaticMethods_Transport$$module$extensions$amp_analytics$0_1$transport_prototype$sendRequest$self$$;
    });
    if ($JSCompiler_StaticMethods_Transport$$module$extensions$amp_analytics$0_1$transport_prototype$sendRequest$self$$.$D$.iframe) {
      $JSCompiler_StaticMethods_Transport$$module$extensions$amp_analytics$0_1$transport_prototype$sendRequest$self$$.$F$ ? $JSCompiler_StaticMethods_IframeTransport$$module$extensions$amp_analytics$0_1$iframe_transport_prototype$sendRequest$$($JSCompiler_StaticMethods_Transport$$module$extensions$amp_analytics$0_1$transport_prototype$sendRequest$self$$.$F$, $getRequest$$(!1).url) : _.$dev$$module$src$log$$().error("amp-analytics/transport", "iframe transport was inadvertently deleted");
    } else {
      if (!$JSCompiler_StaticMethods_Transport$$module$extensions$amp_analytics$0_1$transport_prototype$sendRequest$self$$.$D$.beacon || !$Transport$$module$extensions$amp_analytics$0_1$transport$sendRequestUsingBeacon$$($JSCompiler_StaticMethods_Transport$$module$extensions$amp_analytics$0_1$transport_prototype$sendRequest$self$$.$G$, $getRequest$$($JSCompiler_StaticMethods_Transport$$module$extensions$amp_analytics$0_1$transport_prototype$sendRequest$self$$.$J$))) {
        if (!$JSCompiler_StaticMethods_Transport$$module$extensions$amp_analytics$0_1$transport_prototype$sendRequest$self$$.$D$.xhrpost || !$Transport$$module$extensions$amp_analytics$0_1$transport$sendRequestUsingXhr$$($JSCompiler_StaticMethods_Transport$$module$extensions$amp_analytics$0_1$transport_prototype$sendRequest$self$$.$G$, $getRequest$$($JSCompiler_StaticMethods_Transport$$module$extensions$amp_analytics$0_1$transport_prototype$sendRequest$self$$.$J$))) {
          var $image$jscomp$5_suppressWarnings$$ = $JSCompiler_StaticMethods_Transport$$module$extensions$amp_analytics$0_1$transport_prototype$sendRequest$self$$.$D$.image;
          $image$jscomp$5_suppressWarnings$$ ? ($image$jscomp$5_suppressWarnings$$ = "object" == typeof $image$jscomp$5_suppressWarnings$$ && $image$jscomp$5_suppressWarnings$$.suppressWarnings, $Transport$$module$extensions$amp_analytics$0_1$transport$sendRequestUsingImage$$($JSCompiler_StaticMethods_Transport$$module$extensions$amp_analytics$0_1$transport_prototype$sendRequest$self$$.$G$, $getRequest$$(!1), $image$jscomp$5_suppressWarnings$$, $JSCompiler_StaticMethods_Transport$$module$extensions$amp_analytics$0_1$transport_prototype$sendRequest$self$$.$I$)) : 
          _.$user$$module$src$log$$().$Log$$module$src$log_prototype$warn$("amp-analytics/transport", "Failed to send request", $url$jscomp$170$$, $JSCompiler_StaticMethods_Transport$$module$extensions$amp_analytics$0_1$transport_prototype$sendRequest$self$$.$D$);
        }
      }
    }
  } else {
    _.$dev$$module$src$log$$().$Log$$module$src$log_prototype$info$("amp-analytics/transport", "Empty request not sent: ", $url$jscomp$170$$);
  }
}, $JSCompiler_StaticMethods_maybeInitIframeTransport$$ = function($JSCompiler_StaticMethods_maybeInitIframeTransport$self$$, $win$jscomp$317$$, $ampAdResourceId_element$jscomp$327$$, $opt_preconnect_type$jscomp$171$$) {
  $JSCompiler_StaticMethods_maybeInitIframeTransport$self$$.$D$.iframe && !$JSCompiler_StaticMethods_maybeInitIframeTransport$self$$.$F$ && ($opt_preconnect_type$jscomp$171$$ && $opt_preconnect_type$jscomp$171$$.$preload$($getIframeTransportScriptUrl$$module$extensions$amp_analytics$0_1$iframe_transport$$(), "script"), $opt_preconnect_type$jscomp$171$$ = $ampAdResourceId_element$jscomp$327$$.getAttribute("type"), $ampAdResourceId_element$jscomp$327$$ = $JSCompiler_StaticMethods_maybeInitIframeTransport$self$$.$isInabox_$ ? 
  "1" : _.$JSCompiler_StaticMethods_assertString$$(_.$user$$module$src$log$$(), _.$getAmpAdResourceId$$module$src$ad_helper$$($ampAdResourceId_element$jscomp$327$$, _.$getTopWindow$$module$src$service$$($win$jscomp$317$$)), "No friendly amp-ad ancestor element was found for amp-analytics tag with iframe transport."), $JSCompiler_StaticMethods_maybeInitIframeTransport$self$$.$F$ = new $IframeTransport$$module$extensions$amp_analytics$0_1$iframe_transport$$($win$jscomp$317$$, $opt_preconnect_type$jscomp$171$$, 
  $JSCompiler_StaticMethods_maybeInitIframeTransport$self$$.$D$, $ampAdResourceId_element$jscomp$327$$));
}, $JSCompiler_StaticMethods_sendRequestUsingIframe$$ = function($JSCompiler_StaticMethods_sendRequestUsingIframe$self$$, $request$jscomp$19_url$jscomp$171$$, $segment$jscomp$5$$) {
  if ($request$jscomp$19_url$jscomp$171$$ = $defaultSerializer$$module$extensions$amp_analytics$0_1$transport_serializer$$($request$jscomp$19_url$jscomp$171$$, [$segment$jscomp$5$$])) {
    var $iframe$jscomp$35$$ = $JSCompiler_StaticMethods_sendRequestUsingIframe$self$$.$G$.document.createElement("iframe");
    _.$toggle$$module$src$style$$($iframe$jscomp$35$$, !1);
    $iframe$jscomp$35$$.onload = $iframe$jscomp$35$$.onerror = function() {
      _.$Services$$module$src$services$timerFor$$($JSCompiler_StaticMethods_sendRequestUsingIframe$self$$.$G$).delay(function() {
        _.$removeElement$$module$src$dom$$($iframe$jscomp$35$$);
      }, 5000);
    };
    $iframe$jscomp$35$$.setAttribute("amp-analytics", "");
    $iframe$jscomp$35$$.setAttribute("sandbox", "allow-scripts allow-same-origin");
    $iframe$jscomp$35$$.src = $request$jscomp$19_url$jscomp$171$$;
    $JSCompiler_StaticMethods_sendRequestUsingIframe$self$$.$G$.document.body.appendChild($iframe$jscomp$35$$);
  } else {
    _.$user$$module$src$log$$().error("amp-analytics/transport", "Request not sent. Contents empty.");
  }
}, $Transport$$module$extensions$amp_analytics$0_1$transport$sendRequestUsingImage$$ = function($image$jscomp$6_win$jscomp$318$$, $request$jscomp$20$$, $suppressWarnings$jscomp$1$$, $referrerPolicy$jscomp$1$$) {
  $image$jscomp$6_win$jscomp$318$$ = _.$createPixel$$module$src$pixel$$($image$jscomp$6_win$jscomp$318$$, $request$jscomp$20$$.url, $referrerPolicy$jscomp$1$$);
  _.$loadPromise$$module$src$event_helper$$($image$jscomp$6_win$jscomp$318$$).then(function() {
    "amp-analytics/transport";
  }).catch(function() {
    $suppressWarnings$jscomp$1$$ || _.$user$$module$src$log$$().$Log$$module$src$log_prototype$warn$("amp-analytics/transport", "Response unparseable or failed to send image request", $request$jscomp$20$$.url);
  });
}, $Transport$$module$extensions$amp_analytics$0_1$transport$sendRequestUsingBeacon$$ = function($JSCompiler_inline_result$jscomp$638_win$jscomp$319$$, $request$jscomp$21_result$jscomp$35$$) {
  $JSCompiler_inline_result$jscomp$638_win$jscomp$319$$ = $JSCompiler_inline_result$jscomp$638_win$jscomp$319$$.navigator.sendBeacon ? $JSCompiler_inline_result$jscomp$638_win$jscomp$319$$.navigator.sendBeacon.bind($JSCompiler_inline_result$jscomp$638_win$jscomp$319$$.navigator) : void 0;
  if (!$JSCompiler_inline_result$jscomp$638_win$jscomp$319$$) {
    return !1;
  }
  ($request$jscomp$21_result$jscomp$35$$ = $JSCompiler_inline_result$jscomp$638_win$jscomp$319$$($request$jscomp$21_result$jscomp$35$$.url, $request$jscomp$21_result$jscomp$35$$.$payload$ || "")) && "amp-analytics/transport";
  return $request$jscomp$21_result$jscomp$35$$;
}, $Transport$$module$extensions$amp_analytics$0_1$transport$sendRequestUsingXhr$$ = function($XMLHttpRequest$jscomp$1_win$jscomp$320$$, $request$jscomp$22$$) {
  $XMLHttpRequest$jscomp$1_win$jscomp$320$$ = $XMLHttpRequest$jscomp$1_win$jscomp$320$$.XMLHttpRequest;
  if (!$XMLHttpRequest$jscomp$1_win$jscomp$320$$) {
    return !1;
  }
  var $xhr$jscomp$9$$ = new $XMLHttpRequest$jscomp$1_win$jscomp$320$$;
  if (!("withCredentials" in $xhr$jscomp$9$$)) {
    return !1;
  }
  $xhr$jscomp$9$$.open("POST", $request$jscomp$22$$.url, !0);
  $xhr$jscomp$9$$.withCredentials = !0;
  $xhr$jscomp$9$$.setRequestHeader("Content-Type", "text/plain");
  $xhr$jscomp$9$$.onreadystatechange = function() {
    4 == $xhr$jscomp$9$$.readyState && "amp-analytics/transport";
  };
  $xhr$jscomp$9$$.send($request$jscomp$22$$.$payload$ || "");
  return !0;
}, $cacheFuncResult$$module$extensions$amp_analytics$0_1$transport$$ = function($func$jscomp$5$$) {
  var $cachedValue$$ = {};
  return function($arg$jscomp$11$$) {
    var $key$jscomp$108$$ = String($arg$jscomp$11$$);
    void 0 === $cachedValue$$[$key$jscomp$108$$] && ($cachedValue$$[$key$jscomp$108$$] = $func$jscomp$5$$($arg$jscomp$11$$));
    return $cachedValue$$[$key$jscomp$108$$];
  };
}, $AmpAnalytics$$module$extensions$amp_analytics$0_1$amp_analytics$$ = function($$jscomp$super$this$jscomp$15_element$jscomp$328$$) {
  $$jscomp$super$this$jscomp$15_element$jscomp$328$$ = window.AMP.BaseElement.call(this, $$jscomp$super$this$jscomp$15_element$jscomp$328$$) || this;
  $$jscomp$super$this$jscomp$15_element$jscomp$328$$.$consentPromise_$ = window.Promise.resolve();
  $$jscomp$super$this$jscomp$15_element$jscomp$328$$.$consentNotificationId_$ = null;
  $$jscomp$super$this$jscomp$15_element$jscomp$328$$.$isSandbox_$ = !1;
  $$jscomp$super$this$jscomp$15_element$jscomp$328$$.$requests_$ = {};
  $$jscomp$super$this$jscomp$15_element$jscomp$328$$.$config_$ = {};
  $$jscomp$super$this$jscomp$15_element$jscomp$328$$.$instrumentation_$ = null;
  $$jscomp$super$this$jscomp$15_element$jscomp$328$$.$analyticsGroup_$ = null;
  $$jscomp$super$this$jscomp$15_element$jscomp$328$$.$variableService_$ = $variableServiceFor$$module$extensions$amp_analytics$0_1$variables$$($$jscomp$super$this$jscomp$15_element$jscomp$328$$.$win$);
  $$jscomp$super$this$jscomp$15_element$jscomp$328$$.$cryptoService_$ = _.$Services$$module$src$services$cryptoFor$$($$jscomp$super$this$jscomp$15_element$jscomp$328$$.$win$);
  $$jscomp$super$this$jscomp$15_element$jscomp$328$$.$iniPromise_$ = null;
  $$jscomp$super$this$jscomp$15_element$jscomp$328$$.$transport_$ = null;
  $$jscomp$super$this$jscomp$15_element$jscomp$328$$.$isInabox_$ = "inabox" == _.$getMode$$module$src$mode$$($$jscomp$super$this$jscomp$15_element$jscomp$328$$.$win$).runtime;
  $$jscomp$super$this$jscomp$15_element$jscomp$328$$.$linkerManager_$ = null;
  return $$jscomp$super$this$jscomp$15_element$jscomp$328$$;
}, $JSCompiler_StaticMethods_ensureInitialized_$$ = function($JSCompiler_StaticMethods_ensureInitialized_$self$$) {
  if ($JSCompiler_StaticMethods_ensureInitialized_$self$$.$iniPromise_$) {
    return $JSCompiler_StaticMethods_ensureInitialized_$self$$.$iniPromise_$;
  }
  _.$toggle$$module$src$style$$($JSCompiler_StaticMethods_ensureInitialized_$self$$.element, !1);
  $JSCompiler_StaticMethods_ensureInitialized_$self$$.$iniPromise_$ = _.$Services$$module$src$services$viewerForDoc$$($JSCompiler_StaticMethods_ensureInitialized_$self$$.$getAmpDoc$()).$D$.then(function() {
    return _.$Services$$module$src$services$timerFor$$($JSCompiler_StaticMethods_ensureInitialized_$self$$.$win$).$promise$(1);
  }).then(function() {
    return $JSCompiler_StaticMethods_ensureInitialized_$self$$.$consentPromise_$;
  }).then(function() {
    return _.$Services$$module$src$services$ampdocServiceFor$$($JSCompiler_StaticMethods_ensureInitialized_$self$$.$win$);
  }).then(function($ampDocService$$) {
    return $ampDocService$$.$getAmpDoc$($JSCompiler_StaticMethods_ensureInitialized_$self$$.element, {$closestAmpDoc$:!0});
  }).then($instrumentationServicePromiseForDoc$$module$extensions$amp_analytics$0_1$instrumentation$$).then(function($instrumentation$$) {
    $JSCompiler_StaticMethods_ensureInitialized_$self$$.$instrumentation_$ = $instrumentation$$;
    return $JSCompiler_StaticMethods_AnalyticsConfig$$module$extensions$amp_analytics$0_1$config_prototype$loadConfig$$(new $AnalyticsConfig$$module$extensions$amp_analytics$0_1$config$$($JSCompiler_StaticMethods_ensureInitialized_$self$$.element));
  }).then(function($config$jscomp$49$$) {
    $JSCompiler_StaticMethods_ensureInitialized_$self$$.$config_$ = $config$jscomp$49$$;
    return (new $CookieWriter$$module$extensions$amp_analytics$0_1$cookie_writer$$($JSCompiler_StaticMethods_ensureInitialized_$self$$.$win$, $JSCompiler_StaticMethods_ensureInitialized_$self$$.element, $JSCompiler_StaticMethods_ensureInitialized_$self$$.$config_$)).write();
  }).then(function() {
    $JSCompiler_StaticMethods_ensureInitialized_$self$$.$transport_$ = new $Transport$$module$extensions$amp_analytics$0_1$transport$$($JSCompiler_StaticMethods_ensureInitialized_$self$$.$win$, $JSCompiler_StaticMethods_ensureInitialized_$self$$.$config_$.transport || {});
  }).then($JSCompiler_StaticMethods_ensureInitialized_$self$$.$registerTriggers_$.bind($JSCompiler_StaticMethods_ensureInitialized_$self$$)).then($JSCompiler_StaticMethods_ensureInitialized_$self$$.$initializeLinker_$.bind($JSCompiler_StaticMethods_ensureInitialized_$self$$));
  return $JSCompiler_StaticMethods_ensureInitialized_$self$$.$iniPromise_$;
}, $JSCompiler_StaticMethods_addTriggerNoInline_$$ = function($JSCompiler_StaticMethods_addTriggerNoInline_$self_TAG$jscomp$10$$, $config$jscomp$50$$) {
  if ($JSCompiler_StaticMethods_addTriggerNoInline_$self_TAG$jscomp$10$$.$analyticsGroup_$) {
    try {
      var $JSCompiler_StaticMethods_addTrigger$self$jscomp$inline_2598$$ = $JSCompiler_StaticMethods_addTriggerNoInline_$self_TAG$jscomp$10$$.$analyticsGroup_$, $handler$jscomp$inline_2600$$ = $JSCompiler_StaticMethods_addTriggerNoInline_$self_TAG$jscomp$10$$.$AmpAnalytics$$module$extensions$amp_analytics$0_1$amp_analytics_prototype$handleEvent_$.bind($JSCompiler_StaticMethods_addTriggerNoInline_$self_TAG$jscomp$10$$, $config$jscomp$50$$), $eventType$jscomp$inline_2601$$ = $config$jscomp$50$$.on, 
      $trackerKey$jscomp$inline_2602$$ = $getTrackerKeyName$$module$extensions$amp_analytics$0_1$events$$($eventType$jscomp$inline_2601$$), $trackerWhitelist$jscomp$inline_2603$$ = $getTrackerTypesForParentType$$module$extensions$amp_analytics$0_1$events$$($JSCompiler_StaticMethods_addTrigger$self$jscomp$inline_2598$$.$F$.$getType$()), $unlisten$jscomp$inline_2604$$ = $JSCompiler_StaticMethods_getTrackerForWhitelist$$($JSCompiler_StaticMethods_addTrigger$self$jscomp$inline_2598$$.$F$, $trackerKey$jscomp$inline_2602$$, 
      $trackerWhitelist$jscomp$inline_2603$$).add($JSCompiler_StaticMethods_addTrigger$self$jscomp$inline_2598$$.$G$, $eventType$jscomp$inline_2601$$, $config$jscomp$50$$, $handler$jscomp$inline_2600$$);
      $JSCompiler_StaticMethods_addTrigger$self$jscomp$inline_2598$$.$D$.push($unlisten$jscomp$inline_2604$$);
    } catch ($e$222$$) {
      $JSCompiler_StaticMethods_addTriggerNoInline_$self_TAG$jscomp$10$$ = $JSCompiler_StaticMethods_AmpAnalytics$$module$extensions$amp_analytics$0_1$amp_analytics_prototype$getName_$$($JSCompiler_StaticMethods_addTriggerNoInline_$self_TAG$jscomp$10$$), _.$rethrowAsync$$module$src$log$$($JSCompiler_StaticMethods_addTriggerNoInline_$self_TAG$jscomp$10$$, 'Failed to process trigger "' + $config$jscomp$50$$.on + '"', $e$222$$);
    }
  }
}, $JSCompiler_StaticMethods_processExtraUrlParams_$$ = function($JSCompiler_StaticMethods_processExtraUrlParams_$self$$, $TAG$jscomp$11_params$jscomp$29$$, $replaceMap$$) {
  if ($TAG$jscomp$11_params$jscomp$29$$ && $replaceMap$$) {
    var $count$jscomp$17$$ = 0, $replaceMapKey$$;
    for ($replaceMapKey$$ in $replaceMap$$) {
      if (16 < ++$count$jscomp$17$$) {
        $TAG$jscomp$11_params$jscomp$29$$ = $JSCompiler_StaticMethods_AmpAnalytics$$module$extensions$amp_analytics$0_1$amp_analytics_prototype$getName_$$($JSCompiler_StaticMethods_processExtraUrlParams_$self$$);
        $JSCompiler_StaticMethods_processExtraUrlParams_$self$$.$user$().error($TAG$jscomp$11_params$jscomp$29$$, "More than 16 extraUrlParamsReplaceMap rules aren't allowed; Skipping the rest");
        break;
      }
      for (var $extraUrlParamsKey$$ in $TAG$jscomp$11_params$jscomp$29$$) {
        var $newkey$$ = $extraUrlParamsKey$$.replace($replaceMapKey$$, $replaceMap$$[$replaceMapKey$$]);
        if ($extraUrlParamsKey$$ != $newkey$$) {
          var $value$jscomp$193$$ = $TAG$jscomp$11_params$jscomp$29$$[$extraUrlParamsKey$$];
          delete $TAG$jscomp$11_params$jscomp$29$$[$extraUrlParamsKey$$];
          $TAG$jscomp$11_params$jscomp$29$$[$newkey$$] = $value$jscomp$193$$;
        }
      }
    }
  }
}, $JSCompiler_StaticMethods_hasOptedOut_$$ = function($JSCompiler_StaticMethods_hasOptedOut_$self_k$jscomp$25$$) {
  if (!$JSCompiler_StaticMethods_hasOptedOut_$self_k$jscomp$25$$.$config_$.optout) {
    return !1;
  }
  var $props$jscomp$136$$ = $JSCompiler_StaticMethods_hasOptedOut_$self_k$jscomp$25$$.$config_$.optout.split(".");
  $JSCompiler_StaticMethods_hasOptedOut_$self_k$jscomp$25$$ = $JSCompiler_StaticMethods_hasOptedOut_$self_k$jscomp$25$$.$win$;
  for (var $i$jscomp$216$$ = 0; $i$jscomp$216$$ < $props$jscomp$136$$.length; $i$jscomp$216$$++) {
    if (!$JSCompiler_StaticMethods_hasOptedOut_$self_k$jscomp$25$$) {
      return !1;
    }
    $JSCompiler_StaticMethods_hasOptedOut_$self_k$jscomp$25$$ = $JSCompiler_StaticMethods_hasOptedOut_$self_k$jscomp$25$$[$props$jscomp$136$$[$i$jscomp$216$$]];
  }
  return $JSCompiler_StaticMethods_hasOptedOut_$self_k$jscomp$25$$();
}, $JSCompiler_StaticMethods_generateRequests_$$ = function($JSCompiler_StaticMethods_generateRequests_$self$$) {
  if (!$JSCompiler_StaticMethods_generateRequests_$self$$.$config_$.requests) {
    if (!$JSCompiler_StaticMethods_generateRequests_$self$$.$isInabox_$) {
      var $TAG$jscomp$12_k$224$$ = $JSCompiler_StaticMethods_AmpAnalytics$$module$extensions$amp_analytics$0_1$amp_analytics_prototype$getName_$$($JSCompiler_StaticMethods_generateRequests_$self$$);
      $JSCompiler_StaticMethods_generateRequests_$self$$.$user$().error($TAG$jscomp$12_k$224$$, "No request strings defined. Analytics data will not be sent from this page.");
    }
  } else {
    if ($JSCompiler_StaticMethods_generateRequests_$self$$.$config_$.requests) {
      for (var $k$jscomp$26_requests$jscomp$2$$ in $JSCompiler_StaticMethods_generateRequests_$self$$.$config_$.requests) {
        _.$hasOwn$$module$src$utils$object$$($JSCompiler_StaticMethods_generateRequests_$self$$.$config_$.requests, $k$jscomp$26_requests$jscomp$2$$) && !$JSCompiler_StaticMethods_generateRequests_$self$$.$config_$.requests[$k$jscomp$26_requests$jscomp$2$$].baseUrl && ($JSCompiler_StaticMethods_generateRequests_$self$$.$user$().error("amp-analytics", "request must have a baseUrl"), delete $JSCompiler_StaticMethods_generateRequests_$self$$.$config_$.requests[$k$jscomp$26_requests$jscomp$2$$]);
      }
      for (var $k$223$$ in $JSCompiler_StaticMethods_generateRequests_$self$$.$config_$.requests) {
        $JSCompiler_StaticMethods_generateRequests_$self$$.$config_$.requests[$k$223$$].baseUrl = $expandTemplate$$module$src$string$$($JSCompiler_StaticMethods_generateRequests_$self$$.$config_$.requests[$k$223$$].baseUrl, function($TAG$jscomp$12_k$224$$) {
          var $k$jscomp$26_requests$jscomp$2$$ = $JSCompiler_StaticMethods_generateRequests_$self$$.$config_$.requests[$TAG$jscomp$12_k$224$$];
          return $k$jscomp$26_requests$jscomp$2$$ && $k$jscomp$26_requests$jscomp$2$$.baseUrl || "${" + $TAG$jscomp$12_k$224$$ + "}";
        });
      }
      $k$jscomp$26_requests$jscomp$2$$ = {};
      for ($TAG$jscomp$12_k$224$$ in $JSCompiler_StaticMethods_generateRequests_$self$$.$config_$.requests) {
        _.$hasOwn$$module$src$utils$object$$($JSCompiler_StaticMethods_generateRequests_$self$$.$config_$.requests, $TAG$jscomp$12_k$224$$) && ($k$jscomp$26_requests$jscomp$2$$[$TAG$jscomp$12_k$224$$] = new $RequestHandler$$module$extensions$amp_analytics$0_1$requests$$($JSCompiler_StaticMethods_generateRequests_$self$$.element, $JSCompiler_StaticMethods_generateRequests_$self$$.$config_$.requests[$TAG$jscomp$12_k$224$$], $JSCompiler_StaticMethods_generateRequests_$self$$.$preconnect$, $JSCompiler_StaticMethods_generateRequests_$self$$.$transport_$, 
        $JSCompiler_StaticMethods_generateRequests_$self$$.$isSandbox_$));
      }
      $JSCompiler_StaticMethods_generateRequests_$self$$.$requests_$ = $k$jscomp$26_requests$jscomp$2$$;
    }
  }
}, $JSCompiler_StaticMethods_handleRequestForEvent_$$ = function($JSCompiler_StaticMethods_handleRequestForEvent_$self$$, $TAG$226_requestName$jscomp$2$$, $trigger$jscomp$4$$, $event$jscomp$84$$) {
  if (!$JSCompiler_StaticMethods_handleRequestForEvent_$self$$.element.ownerDocument.defaultView) {
    var $TAG$jscomp$13_hasPostMessage$$ = $JSCompiler_StaticMethods_AmpAnalytics$$module$extensions$amp_analytics$0_1$amp_analytics_prototype$getName_$$($JSCompiler_StaticMethods_handleRequestForEvent_$self$$);
    _.$dev$$module$src$log$$().$Log$$module$src$log_prototype$warn$($TAG$jscomp$13_hasPostMessage$$, "request against destroyed embed: ", $trigger$jscomp$4$$.on);
  }
  var $request$jscomp$25$$ = $JSCompiler_StaticMethods_handleRequestForEvent_$self$$.$requests_$[$TAG$226_requestName$jscomp$2$$];
  $TAG$jscomp$13_hasPostMessage$$ = $JSCompiler_StaticMethods_handleRequestForEvent_$self$$.$isInabox_$ && $trigger$jscomp$4$$.parentPostMessage;
  if (void 0 != $TAG$226_requestName$jscomp$2$$ && !$request$jscomp$25$$ && ($TAG$226_requestName$jscomp$2$$ = $JSCompiler_StaticMethods_AmpAnalytics$$module$extensions$amp_analytics$0_1$amp_analytics_prototype$getName_$$($JSCompiler_StaticMethods_handleRequestForEvent_$self$$), $JSCompiler_StaticMethods_handleRequestForEvent_$self$$.$user$().error($TAG$226_requestName$jscomp$2$$, "Ignoring request for event. Request string not found: ", $trigger$jscomp$4$$.request), !$TAG$jscomp$13_hasPostMessage$$)) {
    return;
  }
  $JSCompiler_StaticMethods_checkTriggerEnabled_$$($JSCompiler_StaticMethods_handleRequestForEvent_$self$$, $trigger$jscomp$4$$, $event$jscomp$84$$).then(function($TAG$226_requestName$jscomp$2$$) {
    $TAG$226_requestName$jscomp$2$$ && ($request$jscomp$25$$ && ($JSCompiler_StaticMethods_handleRequestForEvent_$self$$.$config_$.vars.requestCount++, $TAG$226_requestName$jscomp$2$$ = $JSCompiler_StaticMethods_expansionOptions_$$($JSCompiler_StaticMethods_handleRequestForEvent_$self$$, $event$jscomp$84$$, $trigger$jscomp$4$$), $JSCompiler_StaticMethods_RequestHandler$$module$extensions$amp_analytics$0_1$requests_prototype$send$$($request$jscomp$25$$, $JSCompiler_StaticMethods_handleRequestForEvent_$self$$.$config_$.extraUrlParams, 
    $trigger$jscomp$4$$, $TAG$226_requestName$jscomp$2$$)), $JSCompiler_StaticMethods_expandAndPostMessage_$$($JSCompiler_StaticMethods_handleRequestForEvent_$self$$, $trigger$jscomp$4$$, $event$jscomp$84$$));
  });
}, $JSCompiler_StaticMethods_expandAndPostMessage_$$ = function($JSCompiler_StaticMethods_expandAndPostMessage_$self$$, $trigger$jscomp$6$$, $event$jscomp$86_expansionOptions$jscomp$3$$) {
  var $msg$jscomp$2$$ = $trigger$jscomp$6$$.parentPostMessage;
  $msg$jscomp$2$$ && $JSCompiler_StaticMethods_expandAndPostMessage_$self$$.$isInabox_$ && ($event$jscomp$86_expansionOptions$jscomp$3$$ = $JSCompiler_StaticMethods_expansionOptions_$$($JSCompiler_StaticMethods_expandAndPostMessage_$self$$, $event$jscomp$86_expansionOptions$jscomp$3$$, $trigger$jscomp$6$$), $expandPostMessage$$module$extensions$amp_analytics$0_1$requests$$($JSCompiler_StaticMethods_expandAndPostMessage_$self$$.$getAmpDoc$(), $msg$jscomp$2$$, $JSCompiler_StaticMethods_expandAndPostMessage_$self$$.$config_$.extraUrlParams, 
  $trigger$jscomp$6$$, $event$jscomp$86_expansionOptions$jscomp$3$$, $JSCompiler_StaticMethods_expandAndPostMessage_$self$$.element).then(function($trigger$jscomp$6$$) {
    _.$isIframed$$module$src$dom$$($JSCompiler_StaticMethods_expandAndPostMessage_$self$$.$win$) && $JSCompiler_StaticMethods_expandAndPostMessage_$self$$.$win$.parent.postMessage($trigger$jscomp$6$$, "*");
  }));
}, $JSCompiler_StaticMethods_isSampledIn_$$ = function($JSCompiler_StaticMethods_isSampledIn_$self$$, $expansionOptions$jscomp$4_trigger$jscomp$7$$) {
  var $spec$jscomp$18$$ = $expansionOptions$jscomp$4_trigger$jscomp$7$$.sampleSpec, $resolve$jscomp$56$$ = window.Promise.resolve(!0), $TAG$jscomp$14$$ = $JSCompiler_StaticMethods_AmpAnalytics$$module$extensions$amp_analytics$0_1$amp_analytics_prototype$getName_$$($JSCompiler_StaticMethods_isSampledIn_$self$$);
  if (!$spec$jscomp$18$$) {
    return $resolve$jscomp$56$$;
  }
  var $sampleOn$$ = $spec$jscomp$18$$.sampleOn;
  if (!$sampleOn$$) {
    return $JSCompiler_StaticMethods_isSampledIn_$self$$.$user$().error($TAG$jscomp$14$$, "Invalid sampleOn value."), $resolve$jscomp$56$$;
  }
  var $threshold$jscomp$4$$ = (0,window.parseFloat)($spec$jscomp$18$$.threshold);
  if (0 <= $threshold$jscomp$4$$ && 100 >= $threshold$jscomp$4$$) {
    return $expansionOptions$jscomp$4_trigger$jscomp$7$$ = $JSCompiler_StaticMethods_expansionOptions_$$($JSCompiler_StaticMethods_isSampledIn_$self$$, _.$dict$$module$src$utils$object$$({}), $expansionOptions$jscomp$4_trigger$jscomp$7$$), $JSCompiler_StaticMethods_AmpAnalytics$$module$extensions$amp_analytics$0_1$amp_analytics_prototype$expandTemplateWithUrlParams_$$($JSCompiler_StaticMethods_isSampledIn_$self$$, $sampleOn$$, $expansionOptions$jscomp$4_trigger$jscomp$7$$).then(function($expansionOptions$jscomp$4_trigger$jscomp$7$$) {
      return _.$JSCompiler_StaticMethods_uniform$$($JSCompiler_StaticMethods_isSampledIn_$self$$.$cryptoService_$, $expansionOptions$jscomp$4_trigger$jscomp$7$$);
    }).then(function($JSCompiler_StaticMethods_isSampledIn_$self$$) {
      return 100 * $JSCompiler_StaticMethods_isSampledIn_$self$$ < $threshold$jscomp$4$$;
    });
  }
  _.$user$$module$src$log$$().error($TAG$jscomp$14$$, "Invalid threshold for sampling.");
  return $resolve$jscomp$56$$;
}, $JSCompiler_StaticMethods_checkTriggerEnabled_$$ = function($JSCompiler_StaticMethods_checkTriggerEnabled_$self_enabledOnTriggerLevel$$, $trigger$jscomp$8$$, $enabledOnTagLevel_event$jscomp$87$$) {
  var $expansionOptions$jscomp$5$$ = $JSCompiler_StaticMethods_expansionOptions_$$($JSCompiler_StaticMethods_checkTriggerEnabled_$self_enabledOnTriggerLevel$$, $enabledOnTagLevel_event$jscomp$87$$, $trigger$jscomp$8$$);
  $enabledOnTagLevel_event$jscomp$87$$ = $JSCompiler_StaticMethods_checkSpecEnabled_$$($JSCompiler_StaticMethods_checkTriggerEnabled_$self_enabledOnTriggerLevel$$, $JSCompiler_StaticMethods_checkTriggerEnabled_$self_enabledOnTriggerLevel$$.$config_$.enabled, $expansionOptions$jscomp$5$$);
  $JSCompiler_StaticMethods_checkTriggerEnabled_$self_enabledOnTriggerLevel$$ = $JSCompiler_StaticMethods_checkSpecEnabled_$$($JSCompiler_StaticMethods_checkTriggerEnabled_$self_enabledOnTriggerLevel$$, $trigger$jscomp$8$$.enabled, $expansionOptions$jscomp$5$$);
  return window.Promise.all([$enabledOnTagLevel_event$jscomp$87$$, $JSCompiler_StaticMethods_checkTriggerEnabled_$self_enabledOnTriggerLevel$$]).then(function($JSCompiler_StaticMethods_checkTriggerEnabled_$self_enabledOnTriggerLevel$$) {
    return $JSCompiler_StaticMethods_checkTriggerEnabled_$self_enabledOnTriggerLevel$$[0] && $JSCompiler_StaticMethods_checkTriggerEnabled_$self_enabledOnTriggerLevel$$[1];
  });
}, $JSCompiler_StaticMethods_checkSpecEnabled_$$ = function($JSCompiler_StaticMethods_checkSpecEnabled_$self$$, $spec$jscomp$19$$, $expansionOptions$jscomp$6$$) {
  return void 0 === $spec$jscomp$19$$ ? window.Promise.resolve(!0) : "boolean" === typeof $spec$jscomp$19$$ ? window.Promise.resolve($spec$jscomp$19$$) : $JSCompiler_StaticMethods_AmpAnalytics$$module$extensions$amp_analytics$0_1$amp_analytics_prototype$expandTemplateWithUrlParams_$$($JSCompiler_StaticMethods_checkSpecEnabled_$self$$, $spec$jscomp$19$$, $expansionOptions$jscomp$6$$).then(function($JSCompiler_StaticMethods_checkSpecEnabled_$self$$) {
    return "" !== $JSCompiler_StaticMethods_checkSpecEnabled_$self$$ && "0" !== $JSCompiler_StaticMethods_checkSpecEnabled_$self$$ && "false" !== $JSCompiler_StaticMethods_checkSpecEnabled_$self$$ && "null" !== $JSCompiler_StaticMethods_checkSpecEnabled_$self$$ && "NaN" !== $JSCompiler_StaticMethods_checkSpecEnabled_$self$$ && "undefined" !== $JSCompiler_StaticMethods_checkSpecEnabled_$self$$;
  });
}, $JSCompiler_StaticMethods_AmpAnalytics$$module$extensions$amp_analytics$0_1$amp_analytics_prototype$expandTemplateWithUrlParams_$$ = function($JSCompiler_StaticMethods_AmpAnalytics$$module$extensions$amp_analytics$0_1$amp_analytics_prototype$expandTemplateWithUrlParams_$self$$, $spec$jscomp$20$$, $expansionOptions$jscomp$7$$) {
  return $JSCompiler_StaticMethods_expandTemplate$$($JSCompiler_StaticMethods_AmpAnalytics$$module$extensions$amp_analytics$0_1$amp_analytics_prototype$expandTemplateWithUrlParams_$self$$.$variableService_$, $spec$jscomp$20$$, $expansionOptions$jscomp$7$$).then(function($spec$jscomp$20$$) {
    return _.$JSCompiler_StaticMethods_expandUrlAsync$$(_.$Services$$module$src$services$urlReplacementsForDoc$$($JSCompiler_StaticMethods_AmpAnalytics$$module$extensions$amp_analytics$0_1$amp_analytics_prototype$expandTemplateWithUrlParams_$self$$.element), $spec$jscomp$20$$);
  });
}, $JSCompiler_StaticMethods_AmpAnalytics$$module$extensions$amp_analytics$0_1$amp_analytics_prototype$getName_$$ = function($JSCompiler_StaticMethods_AmpAnalytics$$module$extensions$amp_analytics$0_1$amp_analytics_prototype$getName_$self$$) {
  return "AmpAnalytics " + ($JSCompiler_StaticMethods_AmpAnalytics$$module$extensions$amp_analytics$0_1$amp_analytics_prototype$getName_$self$$.element.getAttribute("id") || "<unknown id>");
}, $JSCompiler_StaticMethods_expansionOptions_$$ = function($JSCompiler_StaticMethods_expansionOptions_$self$$, $source1$$, $source2$$, $opt_iterations$jscomp$1$$, $opt_noEncode$jscomp$2$$) {
  var $vars$jscomp$16$$ = {};
  $mergeObjects$$module$extensions$amp_analytics$0_1$config$$($JSCompiler_StaticMethods_expansionOptions_$self$$.$config_$.vars, $vars$jscomp$16$$);
  $mergeObjects$$module$extensions$amp_analytics$0_1$config$$($source2$$.vars, $vars$jscomp$16$$);
  $mergeObjects$$module$extensions$amp_analytics$0_1$config$$($source1$$.vars, $vars$jscomp$16$$);
  return new $ExpansionOptions$$module$extensions$amp_analytics$0_1$variables$$($vars$jscomp$16$$, $opt_iterations$jscomp$1$$, $opt_noEncode$jscomp$2$$);
}, $VideoAnalyticsEvents$$module$src$video_interface$$ = {$ENDED$:"video-ended", $PAUSE$:"video-pause", $PLAY$:"video-play", $SESSION$:"video-session", $SESSION_VISIBLE$:"video-session-visible", $SECONDS_PLAYED$:"video-seconds-played", $CUSTOM$:"video-hosted-custom", $PERCENTAGE_PLAYED$:"video-percentage-played"};
var $SANDBOX_AVAILABLE_VARS$$module$extensions$amp_analytics$0_1$sandbox_vars_whitelist$$ = {RANDOM:!0, CANONICAL_URL:!0, CANONICAL_HOST:!0, CANONICAL_HOSTNAME:!0, CANONICAL_PATH:!0, AMPDOC_URL:!0, AMPDOC_HOST:!0, AMPDOC_HOSTNAME:!0, SOURCE_URL:!0, SOURCE_HOST:!0, SOURCE_HOSTNAME:!0, SOURCE_PATH:!0, TIMESTAMP:!0, TIMEZONE:!0, TIMEZONE_CODE:!0, VIEWPORT_HEIGHT:!0, VIEWPORT_WIDTH:!0, SCREEN_WIDTH:!0, SCREEN_HEIGHT:!0, AVAILABLE_SCREEN_HEIGHT:!0, AVAILABLE_SCREEN_WIDTH:!0, SCREEN_COLOR_DEPTH:!0, DOCUMENT_CHARSET:!0, 
BROWSER_LANGUAGE:!0, AMP_VERSION:!0, BACKGROUND_STATE:!0, USER_AGENT:!0, FIRST_CONTENTFUL_PAINT:!0, FIRST_VIEWPORT_READY:!0, MAKE_BODY_VISIBLE:!0};
$ActivityHistory$$module$extensions$amp_analytics$0_1$activity_impl$$.prototype.push = function($activityEvent$jscomp$1$$) {
  this.$D$ || (this.$D$ = $activityEvent$jscomp$1$$);
  this.$D$.time < $activityEvent$jscomp$1$$.time && (this.$F$ += $findEngagedTimeBetween$$module$extensions$amp_analytics$0_1$activity_impl$$(this.$D$, $activityEvent$jscomp$1$$.time), this.$D$ = $activityEvent$jscomp$1$$);
};
var $ACTIVE_EVENT_TYPES$$module$extensions$amp_analytics$0_1$activity_impl$$ = ["mousedown", "mouseup", "mousemove", "keydown", "keyup"];
_.$JSCompiler_prototypeAlias$$ = $Activity$$module$extensions$amp_analytics$0_1$activity_impl$$.prototype;
_.$JSCompiler_prototypeAlias$$.$Activity$$module$extensions$amp_analytics$0_1$activity_impl_prototype$start_$ = function() {
  this.$O$ = Date.now();
  this.$handleActivity_$();
  for (var $i$jscomp$inline_2417$$ = 0; $i$jscomp$inline_2417$$ < $ACTIVE_EVENT_TYPES$$module$extensions$amp_analytics$0_1$activity_impl$$.length; $i$jscomp$inline_2417$$++) {
    this.$F$.push(_.$listen$$module$src$event_helper$$(this.ampdoc.getRootNode(), $ACTIVE_EVENT_TYPES$$module$extensions$amp_analytics$0_1$activity_impl$$[$i$jscomp$inline_2417$$], this.$K$));
  }
  this.$F$.push(_.$JSCompiler_StaticMethods_Viewer$$module$src$service$viewer_impl_prototype$onVisibilityChanged$$(this.$viewer_$, this.$P$));
  _.$JSCompiler_StaticMethods_Viewport$$module$src$service$viewport$viewport_impl_prototype$onScroll$$(this.$viewport_$, this.$K$);
};
_.$JSCompiler_prototypeAlias$$.$stopIgnore_$ = function() {
  this.$I$ = this.$G$ = !1;
};
_.$JSCompiler_prototypeAlias$$.$handleActivity_$ = function() {
  this.$G$ || (this.$G$ = !0, this.$I$ = !1, $JSCompiler_StaticMethods_handleActivityEvent_$$(this, "active"));
};
_.$JSCompiler_prototypeAlias$$.$handleVisibilityChange_$ = function() {
  _.$JSCompiler_StaticMethods_Viewer$$module$src$service$viewer_impl_prototype$isVisible$$(this.$viewer_$) ? this.$handleActivity_$() : this.$I$ || (this.$I$ = !0, this.$G$ = !1, $JSCompiler_StaticMethods_handleActivityEvent_$$(this, "inactive"));
};
_.$JSCompiler_prototypeAlias$$.$unlisten_$ = function() {
  for (var $i$jscomp$196$$ = 0; $i$jscomp$196$$ < this.$F$.length; $i$jscomp$196$$++) {
    var $unlistenFunc$$ = this.$F$[$i$jscomp$196$$];
    "function" === typeof $unlistenFunc$$ && $unlistenFunc$$();
  }
  this.$F$ = [];
};
_.$JSCompiler_prototypeAlias$$.$Activity$$module$extensions$amp_analytics$0_1$activity_impl_prototype$getTotalEngagedTime$ = function() {
  var $JSCompiler_StaticMethods_ActivityHistory$$module$extensions$amp_analytics$0_1$activity_impl_prototype$getTotalEngagedTime$self$jscomp$inline_2421$$ = this.$J$, $totalEngagedTime$jscomp$inline_2423$$ = 0;
  void 0 !== $JSCompiler_StaticMethods_ActivityHistory$$module$extensions$amp_analytics$0_1$activity_impl_prototype$getTotalEngagedTime$self$jscomp$inline_2421$$.$D$ && ($totalEngagedTime$jscomp$inline_2423$$ = $JSCompiler_StaticMethods_ActivityHistory$$module$extensions$amp_analytics$0_1$activity_impl_prototype$getTotalEngagedTime$self$jscomp$inline_2421$$.$F$ + $findEngagedTimeBetween$$module$extensions$amp_analytics$0_1$activity_impl$$($JSCompiler_StaticMethods_ActivityHistory$$module$extensions$amp_analytics$0_1$activity_impl_prototype$getTotalEngagedTime$self$jscomp$inline_2421$$.$D$, 
  Math.floor($JSCompiler_StaticMethods_getTimeSinceStart_$$(this) / 1000)));
  return $totalEngagedTime$jscomp$inline_2423$$;
};
_.$JSCompiler_prototypeAlias$$.$Activity$$module$extensions$amp_analytics$0_1$activity_impl_prototype$getIncrementalEngagedTime$ = function($name$jscomp$191$$, $reset$jscomp$2$$) {
  $reset$jscomp$2$$ = void 0 === $reset$jscomp$2$$ ? !0 : $reset$jscomp$2$$;
  if (!_.$hasOwn$$module$src$utils$object$$(this.$D$, $name$jscomp$191$$)) {
    return $reset$jscomp$2$$ && (this.$D$[$name$jscomp$191$$] = this.$Activity$$module$extensions$amp_analytics$0_1$activity_impl_prototype$getTotalEngagedTime$()), this.$Activity$$module$extensions$amp_analytics$0_1$activity_impl_prototype$getTotalEngagedTime$();
  }
  var $currentIncrementalEngagedTime$$ = this.$D$[$name$jscomp$191$$];
  if (!1 === $reset$jscomp$2$$) {
    return this.$Activity$$module$extensions$amp_analytics$0_1$activity_impl_prototype$getTotalEngagedTime$() - $currentIncrementalEngagedTime$$;
  }
  this.$D$[$name$jscomp$191$$] = this.$Activity$$module$extensions$amp_analytics$0_1$activity_impl_prototype$getTotalEngagedTime$();
  return this.$D$[$name$jscomp$191$$] - $currentIncrementalEngagedTime$$;
};
var $ANALYTICS_CONFIG$$module$extensions$amp_analytics$0_1$vendors$$ = {"default":{transport:{beacon:!0, xhrpost:!0, image:!0}, vars:{accessReaderId:"ACCESS_READER_ID", adNavTiming:"AD_NAV_TIMING", adNavType:"AD_NAV_TYPE", adRedirectCount:"AD_NAV_REDIRECT_COUNT", ampdocHost:"AMPDOC_HOST", ampdocHostname:"AMPDOC_HOSTNAME", ampdocUrl:"AMPDOC_URL", ampGeo:"AMP_GEO", ampState:"AMP_STATE", ampVersion:"AMP_VERSION", ancestorOrigin:"ANCESTOR_ORIGIN", authdata:"AUTHDATA", availableScreenHeight:"AVAILABLE_SCREEN_HEIGHT", 
availableScreenWidth:"AVAILABLE_SCREEN_WIDTH", backgroundState:"BACKGROUND_STATE", browserLanguage:"BROWSER_LANGUAGE", canonicalHost:"CANONICAL_HOST", canonicalHostname:"CANONICAL_HOSTNAME", canonicalPath:"CANONICAL_PATH", canonicalUrl:"CANONICAL_URL", clientId:"CLIENT_ID", contentLoadTime:"CONTENT_LOAD_TIME", counter:"COUNTER", documentCharset:"DOCUMENT_CHARSET", documentReferrer:"DOCUMENT_REFERRER", domainLookupTime:"DOMAIN_LOOKUP_TIME", domInteractiveTime:"DOM_INTERACTIVE_TIME", externalReferrer:"EXTERNAL_REFERRER", 
firstContentfulPaint:"FIRST_CONTENTFUL_PAINT", firstViewportReady:"FIRST_VIEWPORT_READY", fragmentParam:"FRAGMENT_PARAM", makeBodyVisible:"MAKE_BODY_VISIBLE", htmlAttr:"HTML_ATTR", incrementalEngagedTime:"INCREMENTAL_ENGAGED_TIME", navRedirectCount:"NAV_REDIRECT_COUNT", navTiming:"NAV_TIMING", navType:"NAV_TYPE", pageDownloadTime:"PAGE_DOWNLOAD_TIME", pageLoadTime:"PAGE_LOAD_TIME", pageViewId:"PAGE_VIEW_ID", queryParam:"QUERY_PARAM", random:"RANDOM", redirectTime:"REDIRECT_TIME", resourceTiming:"RESOURCE_TIMING", 
screenColorDepth:"SCREEN_COLOR_DEPTH", screenHeight:"SCREEN_HEIGHT", screenWidth:"SCREEN_WIDTH", scrollHeight:"SCROLL_HEIGHT", scrollLeft:"SCROLL_LEFT", scrollTop:"SCROLL_TOP", scrollWidth:"SCROLL_WIDTH", serverResponseTime:"SERVER_RESPONSE_TIME", sourceUrl:"SOURCE_URL", sourceHost:"SOURCE_HOST", sourceHostname:"SOURCE_HOSTNAME", sourcePath:"SOURCE_PATH", tcpConnectTime:"TCP_CONNECT_TIME", timestamp:"TIMESTAMP", timezone:"TIMEZONE", timezoneCode:"TIMEZONE_CODE", title:"TITLE", totalEngagedTime:"TOTAL_ENGAGED_TIME", 
userAgent:"USER_AGENT", viewer:"VIEWER", viewportHeight:"VIEWPORT_HEIGHT", viewportWidth:"VIEWPORT_WIDTH"}}, acquialift:{vars:{decisionApiUrl:"us-east-1-decisionapi.lift.acquia.com", accountId:"xxxxxxxx", siteId:"xxxxxxxx"}, transport:{beacon:!0, xhrpost:!0, image:!1}, requests:{base:"https://${decisionApiUrl}/capture?account_id=${accountId}&site_id=${siteId}", basicCapture:"${base}&ident=${clientId(tc_ptid)}&identsrc=amp&es=Amp&url=${canonicalUrl}&rurl=${documentReferrer}&cttl=${title}", pageview:"${basicCapture}&en=Content View", 
click:"${basicCapture}&en=Click-Through"}, triggers:{defaultPageview:{on:"visible", request:"pageview"}}}, adobeanalytics:{transport:{xhrpost:!1, beacon:!1, image:!0}, vars:{pageName:"TITLE", host:"", reportSuites:"", linkType:"o", linkUrl:"", linkName:""}, requests:{requestPath:"/b/ss/${reportSuites}/0/amp-1.0/s${random}", basePrefix:"vid=z${clientId(adobe_amp_id)}&ndh=0&ce=${documentCharset}&pageName=${pageName}&g=${ampdocUrl}&r=${documentReferrer}&bh=${availableScreenHeight}&bw=${availableScreenWidth}&c=${screenColorDepth}&j=amp&s=${screenWidth}x${screenHeight}", 
pageview:"https://${host}${requestPath}?${basePrefix}", click:"https://${host}${requestPath}?${basePrefix}&pe=lnk_${linkType}&pev1=${linkUrl}&pev2=${linkName}"}}, adobeanalytics_nativeConfig:{triggers:{pageLoad:{on:"visible", request:"iframeMessage"}}}, afsanalytics:{vars:{server:"www", websiteid:"xxxxxxxx", event:"click", clicklabel:"clicked from AMP page"}, transport:{beacon:!1, xhrpost:!1, image:!0}, requests:{host:"//${server}.afsanalytics.com", base:"${host}/cgi_bin/", pageview:"${base}connect.cgi?usr=${websiteid}Pauto&js=1&amp=1&title=${title}&url=${canonicalUrl}&refer=${documentReferrer}&resolution=${screenWidth}x${screenHeight}&color=${screenColorDepth}&Tips=${random}", 
click:"${base}click.cgi?usr=${websiteid}&event=${event}&exit=${clicklabel}"}, triggers:{defaultPageview:{on:"visible", request:"pageview"}}}, alexametrics:{requests:{base:"https://${ampAtrkHost}/atrk.gif?account=${atrk_acct}&domain=${domain}", pageview:"${base}&jsv=amp-${ampVersion}&frame_height=${viewportHeight}&frame_width=${viewportWidth}&title=${title}&time=${timestamp}&time_zone_offset=${timezone}&screen_params=${screenWidth}x${screenHeight}x${screenColorDepth}&ref_url=${documentReferrer}&host_url=${sourceUrl}&random_number=${random}&user_cookie=${clientId(__auc)}&user_cookie_flag=0&user_lang=${browserLanguage}&amp_doc_url=${ampdocUrl}"}, 
vars:{atrk_acct:"", domain:"", ampAtrkHost:"certify-amp.alexametrics.com"}, triggers:{trackPageview:{on:"visible", request:"pageview"}}, transport:{xhrpost:!1, beacon:!1, image:!0}}, amplitude:{transport:{beacon:!0, xhrpost:!0, useBody:!0, image:!1}, vars:{deviceId:"CLIENT_ID(amplitude_amp_id)"}, requests:{host:"https://api.amplitude.com", event:{baseUrl:"${host}/amp/event"}}, extraUrlParams:{api_key:"${apiKey}", device_id:"${deviceId}", library:"amp/${ampVersion}", time:"${timestamp}", language:"${browserLanguage}", 
user_agent:"${userAgent}"}, linkers:{amplitude:{ids:{amplitude_amp_id:"${deviceId}"}, proxyOnly:!1}}, cookies:{amplitude_amp_id:{value:"LINKER_PARAM(amplitude, amplitude_amp_id)"}}}, atinternet:{transport:{beacon:!1, xhrpost:!1, image:!0}, vars:{pixelPath:"hit.xiti", domain:".xiti.com"}, requests:{base:"https://${log}${domain}/${pixelPath}?s=${site}&ts=${timestamp}&r=${screenWidth}x${screenHeight}x${screenColorDepth}&re=${availableScreenWidth}x${availableScreenHeight}", suffix:"&medium=amp&${extraUrlParams}&ref=${documentReferrer}", 
pageview:"${base}&p=${title}&s2=${level2}${suffix}", click:"${base}&pclick=${title}&s2click=${level2}&p=${label}&s2=${level2Click}&type=click&click=${type}${suffix}"}}, baiduanalytics:{requests:{host:"https://hm.baidu.com", base:"${host}/hm.gif?si=${token}&nv=0&st=4&v=pixel-1.0&rnd=${timestamp}", pageview:"${base}&et=0", event:"${base}&ep=${category}*${action}*${label}*${value}&et=4&api=8_0"}, transport:{beacon:!1, xhrpost:!1, image:!0}}, bg:{}, burt:{vars:{trackingKey:"ignore", category:"", subCategory:""}, 
requests:{host:"//${trackingKey}.c.richmetrics.com/", base:"${host}imglog?e=${trackingKey}&pi=${trackingKey}|${pageViewId}|${canonicalPath}|${clientId(burt-amp-user-id)}&ui=${clientId(burt-amp-user-id)}&v=amp&ts=${timestamp}&sn=${requestCount}&", pageview:"${base}type=page&ca=${category}&sc=${subCategory}&ln=${browserLanguage}&lr=${documentReferrer}&eu=${sourceUrl}&tz=${timezone}&pd=${scrollWidth}x${scrollHeight}&sd=${screenWidth}x${screenHeight}&wd=${availableScreenWidth}x${availableScreenHeight}&ws=${scrollLeft}x${scrollTop}", 
pageping:"${base}type=pageping"}, triggers:{pageview:{on:"visible", request:"pageview"}, pageping:{on:"timer", timerSpec:{interval:15, maxTimerLength:1200}, request:"pageping"}}, transport:{beacon:!1, xhrpost:!1, image:!0}}, byside:{vars:{webcareZone:"webcare", webcareId:"", channel:"", fid:"", lang:"pt"}, requests:{host:"//${webcareZone}.byside.com/", base:"${host}BWA${webcareId}/amp/", pageview:"${base}pixel.php", event:"${base}signal.php?event_id=${eventId}&event_label=${eventLabel}&fields=${fields}"}, 
extraUrlParams:{webcare_id:"${webcareId}", bwch:"${channel}", lang:"${lang}", fid:"${fid}", bwit:"A", tuid:"${clientId(byside_webcare_tuid)}", suid:"", puid:"${pageViewId}p${timestamp}", referrer:"${documentReferrer}", page:"${sourceUrl}", amppage:"${ampdocUrl}", bwpt:"${title}", bres:"${viewportWidth}x${viewportHeight}", res:"${screenWidth}x${screenHeight}", v:"v20171116a", ampv:"${ampVersion}", viewer:"${viewer}", ua:"${userAgent}", r:"${random}"}, triggers:{pageview:{on:"visible", request:"pageview"}}, 
transport:{beacon:!1, xhrpost:!1, image:!0}}, chartbeat:{requests:{host:"https://ping.chartbeat.net", basePrefix:"/ping?h=${domain}&p=${canonicalPath}&u=${clientId(_cb)}&d=${canonicalHost}&g=${uid}&g0=${sections}&g1=${authors}&g2=${zone}&g3=${sponsorName}&g4=${contentType}&c=120&x=${scrollTop}&y=${scrollHeight}&j=${decayTime}&R=1&W=0&I=0&E=${totalEngagedTime}&r=${documentReferrer}&t=${pageViewId}${clientId(_cb)}&b=${pageLoadTime}&i=${title}&T=${timestamp}&tz=${timezone}&C=2", baseSuffix:"&_", interval:"${host}${basePrefix}${baseSuffix}", 
anchorClick:"${host}${basePrefix}${baseSuffix}"}, triggers:{trackInterval:{on:"timer", timerSpec:{interval:15, maxTimerLength:7200}, request:"interval", vars:{decayTime:30}}, trackAnchorClick:{on:"click", selector:"a", request:"anchorClick", vars:{decayTime:30}}}, transport:{beacon:!1, xhrpost:!1, image:!0}}, clicky:{vars:{site_id:""}, requests:{base:"https://in.getclicky.com/in.php?site_id=${site_id}", baseSuffix:"&mime=${contentType}&x=${random}", pageview:"${base}&res=${screenWidth}x${screenHeight}&lang=${browserLanguage}&secure=1&type=pageview&href=${canonicalPath}&title=${title}${baseSuffix}", 
interval:"${base}&type=ping${baseSuffix}"}, triggers:{defaultPageview:{on:"visible", request:"pageview"}, interval:{on:"timer", timerSpec:{interval:60, maxTimerLength:600}, request:"interval"}}, transport:{beacon:!1, xhrpost:!1, image:!0}}, colanalytics:{requests:{host:"https://ase.clmbtech.com", base:"${host}/message", pageview:"${base}?cid=${id}&val_101=${id}&val_101=${canonicalPath}&ch=${canonicalHost}&uuid=${uid}&au=${authors}&zo=${zone}&sn=${sponsorName}&ct=${contentType}&st=${scrollTop}&sh=${scrollHeight}&dct=${decayTime}&tet=${totalEngagedTime}&dr=${documentReferrer}&plt=${pageLoadTime}&val_108=${title}&val_120=3"}, 
triggers:{defaultPageview:{on:"visible", request:"pageview"}}, transport:{beacon:!1, xhrpost:!1, image:!0}}, comscore:{vars:{c2:"1000001"}, requests:{host:"https://sb.scorecardresearch.com", base:"${host}/b?", pageview:"${base}c1=2&c2=${c2}&cs_pv=${pageViewId}&c12=${clientId(comScore)}&rn=${random}&c8=${title}&c7=${canonicalUrl}&c9=${documentReferrer}&cs_c7amp=${ampdocUrl}"}, triggers:{defaultPageview:{on:"visible", request:"pageview"}}, transport:{beacon:!1, xhrpost:!1, image:!0}}, cxense:{requests:{host:"https://scomcluster.cxense.com", 
base:"${host}/Repo/rep.gif", pageview:"${base}?ver=1&typ=pgv&sid=${siteId}&ckp=${clientId(cX_P)}&loc=${sourceUrl}&rnd=${random}&ref=${documentReferrer}&ltm=${timestamp}&wsz=${screenWidth}x${screenHeight}&bln=${browserLanguage}&chs=${documentCharset}&col=${screenColorDepth}&tzo=${timezone}&cp_cx_channel=amp"}, triggers:{defaultPageview:{on:"visible", request:"pageview"}}, transport:{beacon:!1, xhrpost:!1, image:!0}}, dynatrace:{requests:{endpoint:"${protocol}://${tenant}${separator}${environment}:${port}/ampbf/${tenantpath}", 
pageview:"${endpoint}?type=js&flavor=amp&v=1&a=1%7C1%7C_load_%7C_load_%7C-%7C${navTiming(navigationStart)}%7C${navTiming(domContentLoadedEventEnd)}%7C0%2C2%7C2%7C_onload_%7C_load_%7C-%7C${navTiming(domContentLoadedEventStart)}%7C${navTiming(domContentLoadedEventEnd)}%7C0&fId=${pageViewId}&vID=${clientId(rxVisitor)}&url=${sourceUrl}&title=${title}&sw=${screenWidth}&sh=${screenHeight}&w=${viewportWidth}&h=${viewportHeight}&nt=a${navType}b${navTiming(navigationStart)}c${navTiming(navigationStart,redirectStart)}d${navTiming(navigationStart,redirectEnd)}e${navTiming(navigationStart,fetchStart)}f${navTiming(navigationStart,domainLookupStart)}g${navTiming(navigationStart,domainLookupEnd)}h${navTiming(navigationStart,connectStart)}i${navTiming(navigationStart,connectEnd)}j${navTiming(navigationStart,secureConnectionStart)}k${navTiming(navigationStart,requestStart)}l${navTiming(navigationStart,responseStart)}m${navTiming(navigationStart,responseEnd)}n${navTiming(navigationStart,domLoading)}o${navTiming(navigationStart,domInteractive)}p${navTiming(navigationStart,domContentLoadedEventStart)}q${navTiming(navigationStart,domContentLoadedEventEnd)}r${navTiming(navigationStart,domComplete)}s${navTiming(navigationStart,loadEventStart)}t${navTiming(navigationStart,loadEventEnd)}&app=${app}&time=${timestamp}"}, 
triggers:{trackPageview:{on:"visible", request:"pageview"}}, transport:{beacon:!1, xhrpost:!1, image:!0}, vars:{app:"ampapp", protocol:"https", tenant:"", environment:"live.dynatrace.com", port:"443", separator:"."}}, epica:{transport:{beacon:!1, xhrpost:!1, image:!0}, vars:{anonymousId:"CLIENT_ID(epica_amp_id)"}, requests:{host:"https://cat.poder.io/api/v1/pixel", base:"?writeKey=${writeKey}&context.library.name=amp&anonymousId=${anonymousId}&context.locale=${browserLanguage}&context.page.path=${canonicalPath}&context.page.url=${canonicalUrl}&context.page.referrer=${documentReferrer}&context.page.title=${title}&context.screen.width=${screenWidth}&context.screen.height=${screenHeight}", 
page:"${host}/page${base}&name=${name}", track:"${host}/track${base}&event=${event}"}, triggers:{page:{on:"visible", request:"page"}}}, euleriananalytics:{vars:{analyticsHost:"", documentLocation:"SOURCE_URL"}, requests:{base:"https://${analyticsHost}", basePrefix:"-/${random}?euid-amp=${clientId(etuix)}&url=${documentLocation}&", pageview:"${base}/col2/${basePrefix}rf=${externalReferrer}&urlp=${pagePath}&ss=${screenWidth}x${screenHeight}&sd=${screenColorDepth}", action:"${base}/action/${basePrefix}eact=${actionCode}&actr=${actionRef}", 
user:"${base}/uparam/${basePrefix}euk${userParamKey}=${userParamVal}", contextflag:"${base}/cflag2/${basePrefix}ecf0k=${cflagKey}&ecf0v=${cflagVal}"}, transport:{beacon:!1, xhrpost:!1, image:!0}}, facebookpixel:{vars:{pixelId:"PIXEL-ID"}, requests:{host:"https://www.facebook.com", base:"${host}/tr?noscript=1", pageview:"${base}&ev=PageView&id=${pixelId}", event:"${base}&ev=${eventName}&id=${pixelId}&cd[content_name]=${content_name}", eventViewContent:"${base}&ev=ViewContent&id=${pixelId}&cd[value]=${value}&cd[currency]=${currency}&cd[content_name]=${content_name}&cd[content_type]=${content_type}&cd[content_ids]=${content_ids}", 
eventSearch:"${base}&ev=Search&id=${pixelId}&cd[value]=${value}&cd[currency]=${currency}&cd[content_category]=${content_category}&cd[content_ids]=${content_ids}&cd[search_string]=${search_string}", eventAddToCart:"${base}&ev=AddToCart&id=${pixelId}&cd[value]=${value}&cd[currency]=${currency}&cd[content_name]=${content_name}&cd[content_type]=${content_type}&cd[content_ids]=${content_ids}", eventAddToWishlist:"${base}&ev=AddToWishlist&id=${pixelId}&cd[value]=${value}&cd[currency]=${currency}&cd[content_name]=${content_name}&cd[content_category]=${content_category}&cd[content_ids]=${content_ids}", 
eventInitiateCheckout:"${base}&ev=InitiateCheckout&id=${pixelId}&cd[value]=${value}&cd[currency]=${currency}&cd[content_name]=${content_name}&cd[content_category]=${content_category}&cd[num_items]=${num_items}&cd[content_ids]=${content_ids}", eventAddPaymentInfo:"${base}&ev=AddPaymentInfo&id=${pixelId}&cd[value]=${value}&cd[currency]=${currency}&cd[content_category]=${content_category}&cd[content_ids]=${content_ids}", eventPurchase:"${base}&ev=Purchase&id=${pixelId}&cd[value]=${value}&cd[currency]=${currency}&cd[content_name]=${content_name}&cd[content_type]=${content_type}&cd[content_ids]=${content_ids}&cd[num_items]=${num_items}", 
eventLead:"${base}&ev=Lead&id=${pixelId}&cd[value]=${value}&cd[currency]=${currency}&cd[content_name]=${content_name}&cd[content_category]=${content_category}", eventCompleteRegistration:"${base}&ev=CompleteRegistration&id=${pixelId}&cd[value]=${value}&cd[currency]=${currency}&cd[content_name]=${content_name}&cd[status]=${status}"}, triggers:{trackPageview:{on:"visible", request:"pageview"}}}, gemius:{vars:{dnt:"0"}, requests:{base:"https://${prefix}.hit.gemius.pl/_${timestamp}/redot.gif?l=91&id=${identifier}&screen=${screenWidth}x${screenHeight}&window=${viewportWidth}x${viewportHeight}&fr=1&href=${sourceUrl}&ref=${documentReferrer}&extra=gemamp%3D1%7Campid%3D${clientId(gemius)}%7C${extraparams}&nc=${dnt}", 
pageview:"${base}&et=view&hsrc=1", event:"${base}&et=action&hsrc=3"}, triggers:{defaultPageview:{on:"visible", request:"pageview"}}, transport:{beacon:!1, xhrpost:!1, image:!0}}, googleadwords:{requests:{conversion_prefix:"https://www.googleadservices.com/pagead/conversion/", remarketing_prefix:"https://googleads.g.doubleclick.net/pagead/viewthroughconversion/", common_params:"${googleConversionId}/?cv=amp2&label=${googleConversionLabel}&random=${random}&url=${sourceUrl}&ref=${documentReferrer}&fst=${pageViewId}&num=${counter(googleadwords)}&fmt=3&async=1&u_h=${screenHeight}&u_w=${screenWidth}&u_ah=${availableScreenHeight}&u_aw=${availableScreenWidth}&u_cd=${screenColorDepth}&u_tz=${timezone}&tiba=${title}&guid=ON&script=0", 
conversion_params:"value=${googleConversionValue}&currency_code=${googleConversionCurrency}&bg=${googleConversionColor}&hl=${googleConversionLanguage}", conversion:"${conversion_prefix}${common_params}&${conversion_params}", remarketing:"${remarketing_prefix}${common_params}"}, transport:{beacon:!1, xhrpost:!1, image:!0}}, googleanalytics:{vars:{eventValue:"0", documentLocation:"SOURCE_URL", clientId:"CLIENT_ID(AMP_ECID_GOOGLE,,_ga)", dataSource:"AMP", anonymizeIP:"aip", errorParam:"${errorName}-${errorMessage}"}, 
requests:{host:"https://www.google-analytics.com", basePrefix:"v=1&_v=a1&ds=${dataSource}&${anonymizeIP}&_s=${requestCount}&dt=${title}&sr=${screenWidth}x${screenHeight}&_utmht=${timestamp}&cid=${clientId}&tid=${account}&dl=${documentLocation}&dr=${externalReferrer}&sd=${screenColorDepth}&ul=${browserLanguage}&de=${documentCharset}", baseSuffix:"&a=${pageViewId}&z=${random}", pageview:"${host}/r/collect?${basePrefix}&t=pageview&jid=${random}&_r=1${baseSuffix}", event:"${host}/collect?${basePrefix}&t=event&jid=&ec=${eventCategory}&ea=${eventAction}&el=${eventLabel}&ev=${eventValue}${baseSuffix}", 
social:"${host}/collect?${basePrefix}&t=social&jid=&sa=${socialAction}&sn=${socialNetwork}&st=${socialTarget}${baseSuffix}", timing:"${host}/collect?${basePrefix}&t=${timingRequestType}&jid=&plt=${pageLoadTime}&dns=${domainLookupTime}&tcp=${tcpConnectTime}&rrt=${redirectTime}&srt=${serverResponseTime}&pdt=${pageDownloadTime}&clt=${contentLoadTime}&dit=${domInteractiveTime}${baseSuffix}", error:"${host}/collect?${basePrefix}&t=exception&exd=${errorParam}${baseSuffix}"}, triggers:{performanceTiming:{on:"visible", 
request:"timing", sampleSpec:{sampleOn:"${clientId}", threshold:1}, vars:{timingRequestType:"timing"}}, adwordsTiming:{on:"visible", request:"timing", enabled:"${queryParam(gclid)}", vars:{timingRequestType:"adtiming"}}}, extraUrlParamsReplaceMap:{dimension:"cd", metric:"cm"}, optout:"_gaUserPrefs.ioo", linkers:{_gl:{ids:{_ga:"${clientId}"}}}, cookies:{_ga:{value:"LINKER_PARAM(_gl, _ga)"}}}, gtag:{configRewriter:{url:"https://www.googletagmanager.com/gtag/amp"}, vars:{eventValue:"0", clientId:"CLIENT_ID(AMP_ECID_GOOGLE,,_ga)", 
dataSource:"AMP", anonymizeIP:"aip", errorParam:"${errorName}-${errorMessage}"}, requests:{uaHost:"https://www.google-analytics.com", uaBasePrefix:"v=1&_v=a1&ds=${dataSource}&${anonymizeIP}&_s=${requestCount}&dt=${title}&sr=${screenWidth}x${screenHeight}&cid=${clientId}&tid=${trackingId}&dl=${sourceUrl}&dr=${externalReferrer}&sd=${screenColorDepth}&ul=${browserLanguage}&de=${documentCharset}", uaBaseSuffix:"&a=${pageViewId}&z=${random}", uaPageviewCommon:"&t=pageview&jid=${random}&gjid=${random}&_r=1", 
uaPageview:"${uaHost}/r/collect?${uaBasePrefix}${uaPageviewCommon}${uaBaseSuffix}", uaPageviewNpa:"${uaHost}/collect?${uaBasePrefix}${uaPageviewCommon}${uaBaseSuffix}", uaEvent:"${uaHost}/collect?${uaBasePrefix}&t=event&jid=${uaBaseSuffix}", uaTiming:"${uaHost}/collect?${uaBasePrefix}&jid=&plt=${pageLoadTime}&dns=${domainLookupTime}&tcp=${tcpConnectTime}&rrt=${redirectTime}&srt=${serverResponseTime}&pdt=${pageDownloadTime}&clt=${contentLoadTime}&dit=${domInteractiveTime}${uaBaseSuffix}", uaError:"${uaHost}/collect?${uaBasePrefix}&t=exception&exd=${errorParam}${uaBaseSuffix}", 
awConversionPrefix:"https://www.googleadservices.com/pagead/conversion/", awRemarketingPrefix:"https://googleads.g.doubleclick.net/pagead/viewthroughconversion/", awCommonParams:"${conversionId}/?cv=amp3&label=${conversionLabel}&random=${random}&url=${sourceUrl}&ref=${documentReferrer}&fst=${pageViewId}&num=${counter(googleadwords)}&fmt=3&async=1&u_h=${screenHeight}&u_w=${screenWidth}&u_ah=${availableScreenHeight}&u_aw=${availableScreenWidth}&u_cd=${screenColorDepth}&u_tz=${timezone}&tiba=${title}&guid=ON&script=0", 
awConversion:"${awConversionPrefix}${awCommonParams}", awRemarketing:"${awRemarketingPrefix}${awCommonParams}", flBase:"https://ad.doubleclick.net/activity;src=${flSrc};type=${flType};cat=${flCat}"}, transport:{beacon:!1, xhrpost:!1, image:!0}}, ibeatanalytics:{requests:{host:"https://ibeat.indiatimes.com", base:"https://ibeat.indiatimes.com/iBeat/pageTrendlogAmp.html", pageview:"${base}?&h=${h}&d=${h}&url=${url}&k=${key}&ts=${time}&ch=${channel}&sid=${uid}&at=${agentType}&ref=${documentReferrer}&aid=${aid}&loc=1&ct=1&cat=${cat}&scat=${scat}&ac=1&tg=${tags}&ctids=${catIds}&pts=${pagePublishTime}&auth=${author}&pos=${position}&iBeatField=${ibeatFields}&cid=${clientId(MSCSAuthDetails)}"}, 
triggers:{defaultPageview:{on:"visible", request:"pageview"}}}, infonline:{vars:{sv:"ke", ap:"1"}, transport:{beacon:!1, xhrpost:!1, image:!0}, requests:{pageview:"${url}?st=${st}&sv=${sv}&ap=${ap}&co=${co}&cp=${cp}&ps=${ps}&host=${canonicalHost}&path=${canonicalPath}"}, triggers:{pageview:{on:"visible", request:"pageview"}}}, iplabel:{requests:{collectorUrl:"m.col.ip-label.net", endpoint:"https://${collectorUrl}/coll/", onload:"${endpoint}?T=${trackerId}&m=2502|${navTiming(navigationStart)}|2508|${navTiming(domainLookupStart)}|2509|${navTiming(domainLookupEnd)}|2510|${navTiming(connectStart)}|2512|${navTiming(connectEnd)}|2514|${navTiming(responseStart)}|2515|${navTiming(responseEnd)}|2517|${navTiming(domInteractive)}|2520|${navTiming(loadEventStart)}&ts=${timestamp}&ua=${userAgent}&d=${ipldim}&i=${clientip}&d[1]=${customdim}&d[2]=${business}&d[3]=${abtesting}&d[4]=${infrastructure}&d[5]=${customer}&u=${urlgroup}&w=${availableScreenWidth}&h=${availableScreenHeight}&r=${documentReferrer}&l=${browserLanguage}"}, 
triggers:{trackPageview:{on:"visible", request:"onload"}}, transport:{beacon:!0, xhrpost:!0, image:{suppressWarnings:!0}}, vars:{trackerId:"notrackerID", customdim:"", business:"", abtesting:"", infrastructure:"", customer:"", clientip:"", urlgroup:""}}, keen:{requests:{base:"https://api.keen.io/3.0/projects/${projectId}/events", pageview:"${base}/pageviews?api_key=${writeKey}", click:"${base}/clicks?api_key=${writeKey}", custom:"${base}/${collection}?api_key=${writeKey}"}, triggers:{trackPageview:{on:"visible", 
request:"pageview"}}, extraUrlParams:{amp:!0, ampdocHostname:"${ampdocHostname}", ampdocUrl:"${ampdocUrl}", ampVersion:"${ampVersion}", backgroundState:"${backgroundState}", backgroundedAtStart:"${backgroundedAtStart}", browserLanguage:"${browserLanguage}", canonicalHost:"${canonicalHost}", canonicalHostname:"${canonicalHostname}", canonicalPath:"${canonicalPath}", canonicalUrl:"${canonicalUrl}", clientId:"CLIENT_ID(cid)", contentLoadTime:"${contentLoadTime}", documentReferrer:"${documentReferrer}", 
domainLookupTime:"${domainLookupTime}", domInteractiveTime:"${domInteractiveTime}", externalReferrer:"${externalReferrer}", incrementalEngagedTime:"${incrementalEngagedTime}", pageDownloadTime:"${pageDownloadTime}", pageLoadTime:"${pageLoadTime}", screenHeight:"${screenHeight}", screenWidth:"${screenWidth}", screenColorDepth:"${screenColorDepth}", scrollHeight:"${scrollHeight}", scrollWidth:"${scrollWidth}", scrollTop:"${scrollTop}", scrollLeft:"${scrollLeft}", serverResponseTime:"${serverResponseTime}", 
timestamp:"${timestamp}", timezone:"${timezone}", title:"${title}", totalEngagedTime:"${totalEngagedTime}", totalTime:"${totalTime}", userAgent:"${userAgent}", viewportHeight:"${viewportHeight}", viewportWidth:"${viewportWidth}"}, transport:{beacon:!0, xhrpost:!0, img:!1, useBody:!0}}, krux:{requests:{beaconHost:"https://beacon.krxd.net", timing:"t_navigation_type=0&t_dns=${domainLookupTime}&t_tcp=${tcpConnectTime}&t_http_request=${serverResponseTime}&t_http_response=${pageDownloadTime}&t_content_ready=${contentLoadTime}&t_window_load=${pageLoadTime}&t_redirect=${redirectTime}", 
common:"source=amp&confid=${confid}&_kpid=${pubid}&_kcp_s=${site}&_kcp_sc=${section}&_kcp_ssc=${subsection}&_kcp_d=${canonicalHost}&_kpref_=${documentReferrer}&_kua_kx_amp_client_id=${clientId(_kuid_)}&_kua_kx_lang=${browserLanguage}&_kua_kx_tech_browser_language=${browserLanguage}&_kua_kx_tz=${timezone}", pageview:"${beaconHost}/pixel.gif?${common}&${timing}", event:"${beaconHost}/event.gif?${common}&${timing}&pageview=false"}, transport:{beacon:!1, xhrpost:!1, image:!0}, extraUrlParamsReplaceMap:{"user.":"_kua_", 
"page.":"_kpa_"}}, linkpulse:{vars:{id:"", pageUrl:"CANONICAL_URL", title:"TITLE", section:"", channel:"amp", type:"", host:"pp.lp4.io", empty:""}, requests:{base:"https://${host}", pageview:"${base}/p?i=${id}&r=${documentReferrer}&p=${pageUrl}&s=${section}&t=${type}&c=${channel}&mt=${title}&_t=amp&_r=${random}", pageload:"${base}/pl?i=${id}&ct=${domInteractiveTime}&rt=${pageDownloadTime}&pt=${pageLoadTime}&p=${pageUrl}&c=${channel}&t=${type}&s=${section}&_t=amp&_r=${random}", ping:"${base}/u?i=${id}&u=${clientId(_lp4_u)}&p=${pageUrl}&uActive=true&isPing=yes&c=${channel}&t=${type}&s=${section}&_t=amp&_r=${random}"}, 
triggers:{pageview:{on:"visible", request:"pageview"}, pageload:{on:"visible", request:"pageload"}, ping:{on:"timer", timerSpec:{interval:30, maxTimerLength:7200}, request:"ping"}}, transport:{beacon:!1, xhrpost:!1, image:!0}}, lotame:{requests:{pageview:"https://bcp.crwdcntrl.net/amp?c=${account}&pv=y"}, triggers:{"track pageview":{on:"visible", request:"pageview"}}, transport:{beacon:!1, xhrpost:!1, image:!0}}, marinsoftware:{requests:{base:"https://tracker.marinsm.com/tp", baseParams:"cid=${trackerId}&ampVersion=${ampVersion}&ds=AMP&ref=${externalReferrer}&page=${sourceUrl}&uuid=${clientId(marin_amp_id)}&rnd=${random}", 
pageView:"${base}?${baseParams}&act=1", conversion:"${base}?${baseParams}&act=2&trans=UTM:I|${orderId}|${marinConversionType}|${productName}|${category}|${price}|${quantity}"}, transport:{beacon:!0, xhrpost:!1, image:!0}}, mediametrie:{requests:{host:"https://prof.estat.com/m/web", pageview:"${host}/${serial}?c=${level1}&dom=${ampdocUrl}&enc=${documentCharset}&l3=${level3}&l4=${level4}&n=${random}&p=${level2}&r=${documentReferrer}&sch=${screenHeight}&scw=${screenWidth}&tn=amp&v=1&vh=${availableScreenHeight}&vw=${availableScreenWidth}"}, 
triggers:{trackPageview:{on:"visible", request:"pageview"}}, transport:{beacon:!1, xhrpost:!1, image:!0}}, mediarithmics:{vars:{domain:"events.mediarithmics.com", url:"SOURCE_URL", event_name:"$page_view", referrer:"DOCUMENT_REFERRER"}, requests:{host:"https://${domain}", pageview:"${host}/v1/visits/pixel?$site_token=${site_token}&$url=${url}&$ev=${event_name}&$referrer=${referrer}"}, triggers:{trackPageview:{on:"visible", request:"pageview"}}, transport:{beacon:!1, xhrpost:!1, image:!0}}, mediator:{requests:{host:"//collector.mediator.media/script/${mediator_id}/amp/", 
renderstart:"${host}init/?url=${canonicalUrl}", prefix:"${host}register/?url=${canonicalUrl}&ref=${documentReferrer}&", suffix:"vh=${viewportHeight}&sh=${scrollHeight}&st=${scrollTop}", pageview:"${prefix}e=v", timer:"${prefix}e=t&${suffix}", s0:"${prefix}e=s0", s1:"${prefix}e=s1", s2:"${prefix}e=s2", s3:"${prefix}e=s3"}, vars:{mediator_id:""}, triggers:{renderStart:{on:"render-start", request:"renderstart"}, trackPageview:{on:"visible", request:"pageview"}, scrollPing0:{on:"scroll", scrollSpec:{verticalBoundaries:[5]}, 
request:"s0"}, scrollPing1:{on:"scroll", scrollSpec:{verticalBoundaries:[35]}, request:"s1"}, scrollPing2:{on:"scroll", scrollSpec:{verticalBoundaries:[65]}, request:"s2"}, scrollPing3:{on:"scroll", scrollSpec:{verticalBoundaries:[95]}, request:"s3"}, pageTimer:{on:"timer", timerSpec:{interval:5, maxTimerLength:600, immediate:!1}, request:"timer"}}}, metrika:{transport:{beacon:!0, xhrpost:!0, image:!1}, requests:{pageview:"${_watch}?browser-info=${_brInfo}&${_siteInfo}&${_suffix}", notBounce:"${_watch}?browser-info=ar%3A1%3Anb%3A1%3A${_brInfo}&${_suffix}", 
externalLink:"${_watch}?browser-info=ln%3A1%3A${_brInfo}&${_suffix}", reachGoal:"${_watch}?browser-info=ar%3A1%3A${_brInfo}&${_siteInfo}&${_goalSuffix}", _domain:"https://mc.yandex.ru", _watch:"${_domain}/watch/${counterId}", _suffix:"page-url=${sourceUrl}&page-ref=${documentReferrer}", _goalSuffix:"page-url=goal%3A%2F%2F${sourceHost}%2F${goalId}&page-ref=${sourceUrl}", _techInfo:"amp%3A1%3Az%3A${timezone}%3Ai%3A${timestamp}%3Arn%3A${random}%3Ala%3A${browserLanguage}%3Aen%3A${documentCharset}%3Arqn%3A${requestCount}%3As%3A${screenWidth}x${screenHeight}x${screenColorDepth}%3Aw%3A${availableScreenWidth}x${availableScreenHeight}%3Ads%3A${_timings}%3Auid%3A${clientId(_ym_uid)}%3Apvid%3A${pageViewId}", 
_timings:"${domainLookupTime}%2C${tcpConnectTime}%2C${serverResponseTime}%2C${pageDownloadTime}%2C${redirectTime}%2C${navTiming(redirectStart,redirectEnd)}%2C${navRedirectCount}%2C${navTiming(domLoading,domInteractive)}%2C${navTiming(domContentLoadedEventStart,domContentLoadedEventEnd)}%2C${navTiming(navigationStart,domComplete)}%2C${pageLoadTime}%2C${navTiming(loadEventStart,loadEventEnd)}%2C${contentLoadTime}", _brInfo:"${_techInfo}%3A${_title}", _title:"t%3A${title}", _siteInfo:"site-info=${yaParams}"}, 
triggers:{pageview:{on:"visible", request:"pageview"}}}, moat:{vars:{element:":root"}, requests:{load:JSON.stringify({type:"load", pcode:"${pcode}", l0t:"${l0t}", acctType:"${acctType}", adType:"${adType}", qs:"${qs}", element:{src:"${htmlAttr(img,src,width)}", viewer:"${viewer}"}, document:{AMPDocumentHostname:"${ampdocHostname}", AMPDocumentURL:"${ampdocUrl}", canonicalHost:"${canonicalHost}", canonicalHostname:"${canonicalHostname}", canonicalPath:"${canonicalPath}", canonicalURL:"${canonicalUrl}", 
documentCharset:"${documentCharset}", documentReferrer:"${documentReferrer}", externalReferrer:"${externalReferrer}", sourceURL:"${sourceUrl}", sourceHost:"${sourceHost}", sourceHostname:"${sourceHostname}", sourcePath:"${sourcePath}", title:"${title}", viewer:"${viewer}"}, device:{availableScreenHeight:"${availableScreenHeight}", availableScreenWidth:"${availableScreenWidth}", browserLanguage:"${browserLanguage}", screenColorDepth:"${screenColorDepth}", screenHeight:"${screenHeight}", screenWidth:"${screenWidth}", 
scrollHeight:"${scrollHeight}", scrollWidth:"${scrollWidth}", scrollLeft:"${scrollLeft}", scrollTop:"${scrollTop}", timezone:"${timezone}", userAgent:"${userAgent}", viewportHeight:"${viewportHeight}", viewportWidth:"${viewportWidth}"}, requestCount:"${requestCount}", timeStamp:"${timestamp}"}), unload:JSON.stringify({type:"unload", pcode:"${pcode}", l0t:"${l0t}", requestCount:"${requestCount}", timeStamp:"${timestamp}"}), click:JSON.stringify({type:"click", pcode:"${pcode}", l0t:"${l0t}", requestCount:"${requestCount}", 
timeStamp:"${timestamp}"}), viewability:JSON.stringify({type:"viewability", pcode:"${pcode}", l0t:"${l0t}", backgroundState:"${backgroundState}", intersectionRect:"${intersectionRect}", intersectionRatio:"${intersectionRatio}", maxVisiblePercentage:"${maxVisiblePercentage}", minVisiblePercentage:"${minVisiblePercentage}", x:"${elementX}", y:"${elementY}", height:"${elementHeight}", width:"${elementWidth}", viewportHeight:"${viewportHeight}", viewportWidth:"${viewportWidth}", opacity:"${opacity}", 
timeStamp:"${timestamp}", requestCount:"${requestCount}"}), iframe:JSON.stringify({type:"iframe", pcode:"${pcode}", height:"${elementHeight}", width:"${elementWidth}", x:"${elementX}", y:"${elementY}", requestCount:"${requestCount}"})}, triggers:{load:{on:"ini-load", request:"load"}, unload:{on:"ad-refresh", selector:"${element}", request:"unload"}, click:{on:"click", selector:"${element}", request:"click"}, viewability:{on:"visible", selector:"${element}", request:"viewability", visibilitySpec:{repeat:!0, 
visiblePercentageThresholds:[[0, 0], [0, 5], [5, 10], [10, 15], [15, 20], [20, 25], [25, 30], [30, 35], [35, 40], [40, 45], [45, 50], [50, 55], [55, 60], [60, 65], [65, 70], [70, 75], [75, 80], [80, 85], [85, 90], [90, 95], [95, 100], [100, 100]]}}, iframe:{on:"visible", selector:":root", request:"iframe", visibilitySpec:{repeat:!0, visiblePercentageThresholds:[[0, 0]]}}}}, mobify:{vars:{projectSlug:"mobify-project-id", templateName:"page-type"}, requests:{_host:"https://engagement-collector.mobify.net", 
_dimensions:"%22platform%22%3a%22AMP%22%2c%22client_id%22%3a%22${clientId(sandy-client-id)}%22%2c%22title%22%3a%22${title}%22%2c%22location%22%3a%22${sourceUrl}%22%2c%22page%22%3a%22${sourcePath}%22%2c%22src_location%22%3a%22${ampdocUrl}%22%2c%22referrer%22%3a%22${documentReferrer}%22%2c%22templateName%22%3a%22${templateName}%22", _basePrefix:"${_host}/s.gif?slug=${projectSlug}&timestamp_local=${timestamp}&channel=web&dimensions=%7b${_dimensions}%7d", ampstart:"${_basePrefix}&data=%7b%22category%22%3a%22timing%22%2c%22action%22%3a%22ampStart%22%2c%22value%22%3a${navTiming(navigationStart,domLoading)}%7d", 
pageview:"${_basePrefix}&data=%7b%22action%22%3a%22pageview%22%7d", pageload:"${_basePrefix}&data=%7b%22category%22%3a%22timing%22%2c%22action%22%3a%22load%22%2c%22value%22%3a${pageLoadTime}%7d", pagedcl:"${_basePrefix}&data=%7b%22category%22%3a%22timing%22%2c%22action%22%3a%22DOMContentLoaded%22%2c%22value%22%3a${contentLoadTime}%7d"}, triggers:{triggerName:{on:"visible", request:["ampstart", "pageload", "pagedcl"]}, pageview:{on:"ini-load", request:"pageview"}}, transport:{beacon:!0, xhrpost:!1, 
image:!0}}, mparticle:{vars:{eventType:"Unknown", debug:!1, amp_clientId:"CLIENT_ID(mparticle_amp_id)"}, requests:{host:"https://pixels.mparticle.com", endpointPath:"/v1/${apiKey}/Pixel", baseParams:"et=${eventType}&amp_id=${amp_clientId}&attrs_k=${eventAttributes_Keys}&attrs_v=${eventAttributes_Values}&ua_k=${userAttributes_Keys}&ua_v=${userAttributes_Values}&ui_t=${userIdentities_Types}&ui_v=${userIdentities_Values}&flags_k=${customFlags_Keys}&flags_v=${customFlags_Values}&ct=${timestamp}&dbg=${debug}&lc=${location}&av=${appVersion}", 
pageview:"${host}${endpointPath}?dt=ScreenView&n=${pageName}&hn=${ampdocUrl}&ttl=${title}&path=${canonicalPath}&${baseParams}", event:"${host}${endpointPath}?dt=AppEvent&n=${eventName}&${baseParams}"}, transport:{beacon:!1, xhrpost:!1, image:!0}}, mpulse:{requests:{onvisible:"https://${beacon_url}?h.d=${h.d}&h.key=${h.key}&h.t=${h.t}&h.cr=${h.cr}&rt.start=navigation&rt.si=${clientId(amp_mpulse)}&rt.ss=${timestamp}&rt.end=${timestamp}&t_resp=${navTiming(navigationStart,responseStart)}&t_page=${navTiming(responseStart,loadEventStart)}&t_done=${navTiming(navigationStart,loadEventStart)}&nt_nav_type=${navType}&nt_red_cnt=${navRedirectCount}&nt_nav_st=${navTiming(navigationStart)}&nt_red_st=${navTiming(redirectStart)}&nt_red_end=${navTiming(redirectEnd)}&nt_fet_st=${navTiming(fetchStart)}&nt_dns_st=${navTiming(domainLookupStart)}&nt_dns_end=${navTiming(domainLookupEnd)}&nt_con_st=${navTiming(connectStart)}&nt_ssl_st=${navTiming(secureConnectionStart)}&nt_con_end=${navTiming(connectEnd)}&nt_req_st=${navTiming(requestStart)}&nt_res_st=${navTiming(responseStart)}&nt_unload_st=${navTiming(unloadEventStart)}&nt_unload_end=${navTiming(unloadEventEnd)}&nt_domloading=${navTiming(domLoading)}&nt_res_end=${navTiming(responseEnd)}&nt_domint=${navTiming(domInteractive)}&nt_domcontloaded_st=${navTiming(domContentLoadedEventStart)}&nt_domcontloaded_end=${navTiming(domContentLoadedEventEnd)}&nt_domcomp=${navTiming(domComplete)}&nt_load_st=${navTiming(loadEventStart)}&nt_load_end=${navTiming(loadEventEnd)}&v=1&http.initiator=amp&u=${sourceUrl}&amp.u=${ampdocUrl}&r2=${documentReferrer}&scr.xy=${screenWidth}x${screenHeight}"}, 
triggers:{onvisible:{on:"visible", request:"onvisible"}}, transport:{beacon:!1, xhrpost:!1, image:!0}, extraUrlParamsReplaceMap:{ab_test:"h.ab", page_group:"h.pg", "custom_dimension.":"cdim.", "custom_metric.":"cmet."}}, newrelic:{requests:{pageview:"https://${beacon}/amp?appId=${appId}&licenseKey=${licenseKey}&ampUrl=${ampdocUrl}&canonicalUrl=${canonicalUrl}&timeToDomContentLoadedEventEnd=${navTiming(domContentLoadedEventEnd)}&timeToDomInteractive=${navTiming(domInteractive)}&timeToDomComplete=${navTiming(domComplete)}&timeToDomLoading=${navTiming(domLoading)}&timeToResponseStart=${navTiming(responseStart)}&timeToResponseEnd=${navTiming(responseEnd)}&timeToLoadEventStart=${navTiming(loadEventStart)}&timeToLoadEventEnd=${navTiming(loadEventEnd)}&timeToConnectStart=${navTiming(connectStart)}&timeToConnectEnd=${navTiming(connectEnd)}&timeToFetchStart=${navTiming(fetchStart)}&timeToRequestStart=${navTiming(requestStart)}&timeToUnloadEventStart=${navTiming(unloadEventStart)}&timeToUnloadEventEnd=${navTiming(unloadEventEnd)}&timeToDomainLookupStart=${navTiming(domainLookupStart)}&timeToDomainLookupEnd=${navTiming(domainLookupEnd)}&timeToRedirectStart=${navTiming(redirectStart)}&timeToRedirectEnd=${navTiming(redirectEnd)}&timeToSecureConnection=${navTiming(secureConnectionStart)}&timestamp=${timestamp}&ampVersion=${ampVersion}&pageLoadTime=${pageLoadTime}"}, 
vars:{beacon:"bam.nr-data.net", appId:[], licenseKey:""}, triggers:{trackPageview:{on:"ini-load", request:"pageview"}}}, nielsen:{vars:{sessionId:"CLIENT_ID(imrworldwide)", prefix:""}, requests:{session:"https://${prefix}uaid-linkage.imrworldwide.com/cgi-bin/gn?prd=session&c13=asid,P${apid}&sessionId=${sessionId}_${pageViewId}&pingtype=4&enc=false&c61=createtm,${timestamp}&rnd=${random}", cloudapi:"https://${prefix}cloudapi.imrworldwide.com/nmapi/v2/${apid}/${sessionId}_${pageViewId}/a?b=%7B%22devInfo%22%3A%7B%22devId%22%3A%22${sessionId}_${pageViewId}%22%2C%22apn%22%3A%22${apn}%22%2C%22apv%22%3A%22${apv}%22%2C%22apid%22%3A%22${apid}%22%7D%2C%22metadata%22%3A%7B%22static%22%3A%7B%22type%22%3A%22static%22%2C%22section%22%3A%22${section}%22%2C%22assetid%22%3A%22${pageViewId}%22%2C%22segA%22%3A%22${segA}%22%2C%22segB%22%3A%22${segB}%22%2C%22segC%22%3A%22${segC}%22%2C%22adModel%22%3A%220%22%2C%22dataSrc%22%3A%22cms%22%7D%2C%22content%22%3A%7B%7D%2C%22ad%22%3A%7B%7D%7D%2C%22event%22%3A%22playhead%22%2C%22position%22%3A%22${timestamp}%22%2C%22data%22%3A%7B%22hidden%22%3A%22${backgroundState}%22%2C%22blur%22%3A%22${backgroundState}%22%2C%22position%22%3A%22${timestamp}%22%7D%2C%22type%22%3A%22static%22%2C%22utc%22%3A%22${timestamp}%22%2C%22index%22%3A%22${requestCount}%22%7D"}, 
triggers:{visible:{on:"visible", request:["session", "cloudapi"]}, hidden:{on:"hidden", request:"cloudapi"}, duration:{on:"timer", timerSpec:{interval:10, maxTimerLength:86400, immediate:!1}, request:"cloudapi"}}, transport:{beacon:!1, xhrpost:!1, image:!0, referrerPolicy:"no-referrer"}}, "nielsen-marketing-cloud":{transport:{beacon:!1, xhrpost:!1, image:!0}, vars:{pubId:"", siteId:""}, requests:{host:"loadeu.exelator.com", pathPrefix:"load/", trackurl:"https://${host}/${pathPrefix}?p=${pubId}&g=${siteId}&j=0"}, 
triggers:{defaultPageview:{on:"visible", request:"trackurl"}}}, oewa:{transport:{beacon:!1, xhrpost:!1, image:!0}, requests:{pageview:"${url}?s=${s}&amp=1&cp=${cp}&host=${canonicalHost}&path=${canonicalPath}"}, triggers:{pageview:{on:"visible", request:"pageview"}}}, oewadirect:{transport:{beacon:!1, xhrpost:!1, image:!0}, requests:{pageview:"https://${s}.oewabox.at/j0=,,,r=${canonicalUrl};+,amp=1+cp=${cp}+ssl=1+hn=${canonicalHost};;;?lt=${pageViewId}&x=${screenWidth}x${screenHeight}x24&c=CLIENT_ID(oewa)"}, 
triggers:{pageview:{on:"visible", request:"pageview"}}}, oracleInfinityAnalytics:{transport:{beacon:!1, xhrpost:!1, image:!0}, requests:{host:"https://dc.oracleinfinity.io/${guid}/dcs.gif?", baseUrl:"dcssip=${dcssip}&dcsuri=${dcsuri}", baseRef:"&dcsref=${documentReferrer}", baseEs:"&WT.es=${sourceHost}${sourcePath}", baseTi:"&WT.ti=${ti}&dcsdat=${timestamp}", basePrefix:"${baseUrl}${baseTi}${baseRef}${baseEs}", screenBs:"&WT.bs=${availableScreenWidth}x${availableScreenHeight}", screenSr:"&WT.sr=${screenWidth}x${screenHeight}", 
screenDc:"&WT.cd=${screenColorDepth}", screenMeasures:"${screenBs}${screenSr}${screenDc}", browserUl:"&WT.ul=${browserLanguage}", browserLe:"&WT.le=${documentCharset}", browserMeasures:"${browserUl}${browserLe}&WT.js=Yes", sessCof:"&WT.co_f=${clientId(WT_AMP)}", sessVer:"&ora.tv_amp=1.0.0&ora.amp_ver=${ampVersion}", sessionization:"${sessCof}${sessVer}&dcscfg=3", baseP1:"${host}${basePrefix}", baseP2:"${screenMeasures}${browserMeasures}${sessionization}", baseDl:"&WT.dl=${dl}", pageview:"${baseP1}${baseP2}${baseDl}", 
event:"${baseP1}${baseP2}${baseDl}", dlPdf:'a[href$=".pdf"]', dlXls:',a[href$=".xls"]', dlPpt:',a[href$=".ppt"]', dlZip:',a[href$=".zip"]', dlTxt:',a[href$=".txt"]', dlRtf:',a[href$=".rtf"]', dlXml:',a[href$=".xml"]', downLoad:"${dlPdf}${dlXls}${dlPpt}${dlZip}${dlTxt}${dlRtf}${dlXml}"}, vars:{dcssip:"${sourceHost}", dcsuri:"${sourcePath}", dl:"0", ti:"${title}"}, triggers:{trackPageview:{on:"visible", request:"pageview"}, trackAnchorClicks:{on:"click", selector:"a", request:"event", vars:{dl:"99", 
ti:"Link Click"}}}, trackDownloadClicks:{on:"click", selector:"${downLoad}", request:"event", vars:{dl:"20", ti:"Download Click"}}}, parsely:{requests:{host:"https://srv.pixel.parsely.com", basePrefix:"${host}/plogger/?rand=${timestamp}&idsite=${apikey}&url=${ampdocUrl}&urlref=${documentReferrer}&screen=${screenWidth}x${screenHeight}%7C${availableScreenWidth}x${availableScreenHeight}%7C${screenColorDepth}&title=${title}&date=${timestamp}&ampid=${clientId(_parsely_visitor)}", pageview:'${basePrefix}&action=pageview&metadata={"canonical_url":"${canonicalUrl}"}', 
heartbeat:"${basePrefix}&action=heartbeat&tt=${totalEngagedTime}&inc=${incrementalEngagedTime(parsely-js)}"}, triggers:{defaultPageview:{on:"visible", request:"pageview"}, defaultHeartbeat:{on:"timer", enabled:"${incrementalEngagedTime(parsely-js,false)}", timerSpec:{interval:10, maxTimerLength:7200}, request:"heartbeat"}}, transport:{beacon:!1, xhrpost:!1, image:!0}}, piStats:{requests:{host:"https://events.pi-stats.com", basePrefix:"${host}/eventsamp/?e=PageLoad&pid=${property}&url=${ampdocUrl}&cnt=${cntId}&lang=${language}&ref=${documentReferrer}&id=${clientId(piStatsDEVICEID)}&ua=${userAgent}&ctype=web&blang=${browserLanguage}&v=2.0&dist=Javascript", 
pageview:"${basePrefix}&eventtype=pageview"}, triggers:{defaultPageview:{on:"visible", request:"pageview"}}, transport:{beacon:!1, xhrpost:!1, image:!0}}, permutive:{vars:{identity:"${clientId(_ga)}"}, requests:{track:"https://${namespace}.amp.permutive.com/track?k=${key}&i=${identity}&it=amp", pageview:"${track}&e=Pageview&_ep_isp_info=%24ip_isp_info&_ep_geo_info=%24ip_geo_info", engagement:"${track}&e=PageviewEngagement&_ep_engaged_time=5", completion:"${track}&e=PageviewEngagement&_ep_completion=0.25"}, 
triggers:{trackPageview:{on:"visible", request:"pageview"}, trackEngagement:{on:"visible", timerSpec:{interval:5, maxTimerLength:600, immediate:!1}, request:"engagement"}, trackCompletion:{on:"scroll", scrollSpec:{verticalBoundaries:[25, 50, 75, 100]}, request:"completion"}}, transport:{beacon:!1, xhrpost:!1, image:!0}, extraUrlParams:{"properties.client.type":"amp", "properties.client.title":"${title}", "properties.client.domain":"${canonicalHost}", "properties.client.url":"${canonicalUrl}", "properties.client.referrer":"${documentReferrer}", 
"properties.client.user_agent":"${userAgent}"}, extraUrlParamsReplaceMap:{"properties.":"_ep_"}}, piano:{requests:{host:"https://api-v3.tinypass.com", basePrefix:"/api/v3", baseSuffix:"&pageview_id=${pageViewId}&rand=${random}&amp_client_id=${clientId}&aid=${aid}", pageview:"${host}${basePrefix}/page/track?url=${canonicalUrl}&referer=${documentReferrer}&content_created=${contentCreated}&content_author=${contentAuthor}&content_section=${contentSection}&timezone_offset=${timezone}&tags=${tags}&amp_url=${ampdocUrl}&screen=${screenWidth}x${screenHeight}${baseSuffix}"}}, 
pinpoll:{requests:{pageview:"${protocol}://${host}/${version}?url=${sourceUrl}&sourceHost=${sourceHost}&sourceHostname=${sourceHostname}&sourcePath=${sourcePath}&canonicalUrl=${canonicalUrl}&platform=AMP&title=${title}&referrer=${documentReferrer}&screenHeight=${screenHeight}&screenWidth=${screenWidth}&screenColorDepth=${screenColorDepth}&ua=${userAgent}&clientId=${clientId(pinpoll)}"}, triggers:{pageview:{on:"visible", request:"pageview"}}, vars:{version:"v1", protocol:"https", host:"pa.pinpoll.com"}}, 
pressboard:{vars:{mediaId:"", campaignId:"", storyRequestId:"", geoNameId:"", country:"", region:"", city:"", dbInstance:"", timeZoneOffset:"", clientId:"CLIENT_ID(_pressboardmedia)"}, requests:{host:"https://adserver.pressboard.ca", common_params:"&amp=1&url=${canonicalUrl}&referrer=${documentReferrer}&ts=${timestamp}&ua=${userAgent}&rand=${random}&uid=${clientId}&mid=${mediaId}&cid=${campaignId}&sid=${storyRequestId}&geoid=${geoNameId}&cn=${country}&rg=${region}&ct=${city}&dbi=${dbInstance}&tz=${timeZoneOffset}", 
conversion_params:"&hbt=${requestCount}&pvid=${pageViewId}&asurl=${sourceUrl}&ash=${scrollHeight}&asnh=${screenHeight}&aasnh=${availableScreenHeight}&avh=${viewportHeight}&ast=${scrollTop}&atet=${totalEngagedTime}", conversion:"${host}/track/attention-amp?${common_params}${conversion_params}"}, triggers:{pageTimer:{on:"timer", timerSpec:{interval:1, startSpec:{on:"visible"}, stopSpec:{on:"hidden"}}, request:"conversion"}}, transport:{beacon:!1, xhrpost:!1, image:!0}}, quantcast:{vars:{labels:""}, 
requests:{host:"https://pixel.quantserve.com/pixel", pageview:"${host};r=${random};a=${pcode};labels=${labels};fpan=;fpa=${clientId(__qca)};ns=0;ce=1;cm=;je=0;sr=${screenWidth}x${screenHeight}x${screenColorDepth};enc=n;et=${timestamp};ref=${documentReferrer};url=${canonicalUrl}"}, triggers:{defaultPageview:{on:"visible", request:"pageview"}}, transport:{beacon:!1, xhrpost:!1, image:!0}}, retargetly:{requests:{host:"https://api.retargetly.com", page:"${host}/api?id=${accountId}&src=${sourceId}&url=${sourceUrl}&n=${title}&ref=${documentReferrer}&ua=${userAgent}&random=${random}&bl=${browserLanguage}&source=amp"}, 
transport:{beacon:!1, xhrpost:!1, image:!0}, triggers:{trackPageview:{on:"visible", request:"page"}}}, rakam:{vars:{deviceId:"CLIENT_ID(rakam_device_id)"}, requests:{base:"?api.api_key=${writeKey}&prop._platform=amp&prop._device_id=${deviceId}&prop.locale=${browserLanguage}&prop.path=${canonicalPath}&prop.url=${canonicalUrl}&prop.color_depth=${screenColorDepth}&prop._referrer=${documentReferrer}&prop.title=${title}&prop.timezone=${timezone}&prop._time=${timestamp}&prop.resolution=${screenWidth} \u00d7 ${screenHeight}", 
pageview:"https://${apiEndpoint}/event/pixel${base}&collection=${pageViewName}", custom:"https://${apiEndpoint}/event/pixel${base}&collection=${collection}"}}, segment:{transport:{beacon:!1, xhrpost:!1, image:!0}, vars:{anonymousId:"CLIENT_ID(AMP_ECID_GOOGLE,,_ga)"}, requests:{host:"https://api.segment.io/v1/pixel", base:"?writeKey=${writeKey}&context.library.name=amp&anonymousId=${anonymousId}&context.locale=${browserLanguage}&context.page.path=${canonicalPath}&context.page.url=${canonicalUrl}&context.page.referrer=${documentReferrer}&context.page.title=${title}&context.screen.width=${screenWidth}&context.screen.height=${screenHeight}", 
page:"${host}/page${base}&name=${name}", track:"${host}/track${base}&event=${event}"}, triggers:{page:{on:"visible", request:"page"}}, linkers:{segment:{ids:{s_amp_id:"${anonymousId}"}, proxyOnly:!1}}, cookies:{_ga:{value:"LINKER_PARAM(segment, s_amp_id)"}}}, shinystat:{transport:{beacon:!1, xhrpost:!1, image:!0}, requests:{base:"https://amp.shinystat.com/cgi-bin/shinyamp.cgi", commpar:"AMP=1&RM=${random}&USER=${account}&PAG=${page}&HR=${sourceUrl}&REFER=${documentReferrer}&RES=${screenWidth}X${screenHeight}&COLOR=${screenColorDepth}&CID=${clientId(AMP_CID)}&PAGID=${pageViewId}&TITL=${title}&RQC=${requestCount}", 
pagepar:"&VIE=${viewer}&PLT=${pageLoadTime}", eventpar:"&SSXL=1", linkpar:"&LINK=${outboundLink}", pageview:"${base}?${commpar}${pagepar}", event:"${base}?${commpar}${eventpar}", link:"${base}?${commpar}${linkpar}"}, triggers:{pageview:{on:"visible", request:"pageview"}}}, simplereach:{vars:{pid:"", published_at:"", authors:[], channels:[], tags:[]}, requests:{host:"https://edge.simplereach.com", baseParams:"amp=true&pid=${pid}&title=${title}&url=${canonicalUrl}&date=${published_at}&authors=${authors}&channels=${categories}&tags=${tags}&referrer=${documentReferrer}&page_url=${sourceUrl}&user_id=${clientId(sr_amp_id)}&domain=${canonicalHost}&article_id=${article_id}&ignore_metadata=${ignore_metadata}", 
visible:"${host}/n?${baseParams}", timer:"${host}/t?${baseParams}&t=5000&e=5000"}, triggers:{visible:{on:"visible", request:"visible"}, timer:{on:"timer", timerSpec:{interval:5, maxTimerLength:1200}, request:"timer"}}}, snowplow:{vars:{duid:"CLIENT_ID(_sp_id)"}, requests:{aaVersion:"amp-0.2", basePrefix:"https://${collectorHost}/i?url=${canonicalUrl}&page=${title}&res=${screenWidth}x${screenHeight}&stm=${timestamp}&tz=${timezone}&aid=${appId}&p=web&tv=${aaVersion}&cd=${screenColorDepth}&cs=${documentCharset}&duid=${duid}&lang=${browserLanguage}&refr=${documentReferrer}&stm=${timezone}&vp=${viewportWidth}x${viewportHeight}", 
pageView:"${basePrefix}&e=pv", structEvent:"${basePrefix}&e=se&se_ca=${structEventCategory}&se_ac=${structEventAction}&se_la=${structEventLabel}&se_pr=${structEventProperty}&se_va=${structEventValue}"}, transport:{beacon:!1, xhrpost:!1, image:!0}}, teaanalytics:{$vars$:{$userUniqueId$:"${clientId(__tea_sdk__user_unique_id)}", debug:0}, $requests$:{domain:"https://${channel}/v1/amp", $commonParams$:"user.user_unique_id=${userUniqueId}&header.app_id=${app_id}&header.language=${browserLanguage}&header.screen_height=${screenHeight}&header.screen_width=${screenWidth}&header.resolution=${screenHeight}x${screenWidth}&header.tz_offset=${timezone}&header.tz_name=${timezoneCode}&header.referrer=${documentReferrer}&header.custom.user_agent=${userAgent}&event.local_time_ms=${timestamp}&event.params._staging_flag=${debug}&verbose=${debug}", 
base:"${domain}?${commonParams}&rnd=${random}", $pageview$:"${base}&event=predefine_pageview&event.params.url=${sourceUrl}&event.params.url_path=${sourcePath}&event.params.title=${title}", event:"${base}"}}, tealiumcollect:{transport:{beacon:!1, xhrpost:!1, image:!0}, vars:{account:"TEALIUM_ACCOUNT", profile:"TEALIUM_PROFILE", datasource:"TEALIUM_DATASOURCE", visitor_id:"CLIENT_ID(AMP_ECID_GOOGLE,,_ga)"}, requests:{host:"https://collect.tealiumiq.com", base:"${host}/event?${tealium}&${dom1}&${dom2}&${datetime}&tealium_event=${tealium_event}&amp_version=${ampVersion}&amp_request_count=${requestCount}", 
tealium:"tealium_account=${account}&tealium_profile=${profile}&tealium_datasource=${datasource}&tealium_visitor_id=${visitor_id}", dom1:"url=${sourceUrl}&ampdoc_url=${ampdocUrl}&domain=${sourceHost}&pathname=${sourcePath}&amp_hostname=${ampdocHostname}&canonical_hostname=${canonicalHostname}", dom2:"title=${title}&viewport_width=${availableScreenWidth}&viewport_height=${availableScreenHeight}", datetime:"timestamp=${timestamp}&tz=${timezone}&lang=${browserLanguage}", pageview:"${base}&referrer=${documentReferrer}&screen_size=${screenWidth}x${screenHeight}&content_load_ms=${contentLoadTime}&page_view_id=${pageViewId}", 
event:"${base}&scroll_y=${scrollTop}&scroll_x=${scrollLeft}"}, triggers:{defaultPageview:{on:"visible", request:"pageview", vars:{tealium_event:"screen_view"}}}}, top100:{vars:{pid:"", rid:"PAGE_VIEW_ID", ruid:"CLIENT_ID(ruid)", version:"1.0.0"}, requests:{host:"https://kraken.rambler.ru", base:"${host}/cnt/?pid=${pid}&rid=${rid}&v=${version}&rn=${random}&ruid=${ruid}&ct=amp", pageview:"${base}&et=pv${_pageData}${_screenData}", _screenData:"&sr=${screenWidth}x${screenHeight}&cd=${screenColorDepth}-bit&bs=${scrollWidth}x${scrollHeight}", 
_pageData:"&pt=${title}&rf=${documentReferrer}&en=${documentCharset}&la=${browserLanguage}&tz=${timezone}"}, triggers:{trackPageview:{on:"visible", request:"pageview"}}, transport:{beacon:!1, xhrpost:!1, image:!0}}, topmailru:{transport:{beacon:!1, xhrpost:!1, image:!0}, vars:{url:"${sourceUrl}", referrer:"${documentReferrer}"}, requests:{pageView:"${_domain}/counter?${_basicMessage};title=${title}", reachGoal:"${_domain}/tracker?${_basicMessage};title=${title};e=RG%3A${value}%2F${goal}", sendEvent:"${_domain}/tracker?${_basicMessage};e=CE%3A${value}%2F${category}%3B${action}%3B${label}", 
_domain:"https://top-fwz1.mail.ru", _basicMessage:"js=13;id=${id};u=${url};r=${referrer};s=${screenWidth}*${screenHeight};vp=${viewportWidth}*${viewportHeight};st=${start};gender=${gender};age=${age};pid=${pid};userid=${userid};device=${device};params=${params};_=${random}"}, triggers:{pageView:{on:"visible", request:"pageView"}}}, treasuredata:{vars:{host:"in.treasuredata.com", writeKey:"", database:"", table:"events"}, requests:{base:"https://${host}/postback/v3/event/${database}", baseParams:"td_write_key=${writeKey}&td_global_id=td_global_id&td_client_id=CLIENT_ID(_td)&td_charset=DOCUMENT_CHARSET&td_language=BROWSER_LANGUAGE&td_color=SCREEN_COLOR_DEPTH&td_screen=${screenWidth}x${scrollHeight}&td_viewport=${availableScreenWidth}x${availableScreenHeight}&td_title=TITLE&td_url=SOURCE_URL&td_user_agent=USER_AGENT&td_host=SOURCE_HOST&td_path=SOURCE_PATH&td_referrer=DOCUMENT_REFERRER&td_ip=td_ip", 
pageview:"${base}/${table}?${baseParams}", event:"${base}/${table}?${baseParams}"}}, umenganalytics:{vars:{siteid:"", initial_view_time:"", eventName:"", eventProps:""}, requests:{base:"https://b.cnzz.com/utrack?&_siteid=${siteid}&_distinct_id=${clientId(umeng_amp_id)}&_t=${timestamp}&_s=google&_b=web&_r=${externalReferrer}&_h=${screenHeight}&_w=${screenWidth}&_ivt=${initial_view_time}", pageview:"${base}&_ename=$w_page_view&_eprops=${eventProps}", event:"${base}&_ename=${eventName}&_eprops=${eventProps}"}, 
triggers:{defaultPageview:{on:"visible", request:"pageview"}}, transport:{beacon:!1, xhrpost:!1, image:!0}}, upscore:{requests:{host:"https://hit-pool.upscore.com/amp?", basePrefix:"u_id=${clientId(upscore)}&hit_id=${pageViewId}&scTop=${scrollTop}&scHeight=${scrollHeight}&vHeight=${viewportHeight}&domain=${domain}&load=${domInteractiveTime}&timespent=${totalEngagedTime}", initialHit:"author=${author}&creator=${creator}&o_id=${object_id}&o_type=${object_type}&pubdate=${pubdate}&ref=${documentReferrer}&section=${section}&url=${ampdocUrl}&agent=${userAgent}&location=${ampGeo(ISOCountry)}", 
finalbeat:"${host}${basePrefix}&type=final", heartbeat:"${host}${basePrefix}&type=pulse", pageview:"${host}${basePrefix}&${initialHit}&type=init"}, triggers:{initHit:{on:"visible", request:"pageview"}, pulse:{on:"timer", timerSpec:{interval:10, immediate:!1, stopSpec:{on:"hidden"}}, request:"heartbeat"}, "final":{on:"hidden", visibilitySpec:{totalTimeMin:5000}, request:"finalbeat"}}, transport:{beacon:!0, xhrpost:!0, image:!1}}, webtrekk:{requests:{trackURL:"https://${trackDomain}/${trackId}/wt", 
parameterPrefix:"?p=432,${contentId},1,${screenWidth}x${screenHeight},${screenColorDepth},1,${timestamp},${documentReferrer},${viewportWidth}x${viewportHeight},0&tz=${timezone}&eid=${clientId(amp-wt3-eid)}&la=${browserLanguage}", parameterSuffix:"&pu=${sourceUrl}", pageParameter:"&cp1=${pageParameter1}&cp2=${pageParameter2}&cp3=${pageParameter3}&cp4=${pageParameter4}&cp5=${pageParameter5}&cp6=${pageParameter6}&cp7=${pageParameter7}&cp8=${pageParameter8}&cp9=${pageParameter9}&cp10=${pageParameter10}", 
pageCategories:"&cg1=${pageCategory1}&cg2=${pageCategory2}&cg3=${pageCategory3}&cg4=${pageCategory4}&cg5=${pageCategory5}&cg6=${pageCategory6}&cg7=${pageCategory7}&cg8=${pageCategory8}&cg9=${pageCategory9}&cg10=${pageCategory10}", pageview:"${trackURL}${parameterPrefix}${pageParameter}${pageCategories}${parameterSuffix}", actionParameter:"&ck1=${actionParameter1}&ck2=${actionParameter2}&ck3=${actionParameter3}&ck4=${actionParameter4}&ck5=${actionParameter5}", event:"${trackURL}${parameterPrefix}&ct=${actionName}${actionParameter}${parameterSuffix}"}, 
transport:{beacon:!1, xhrpost:!1, image:!0}}, webtrekk_v2:{vars:{actionName:"webtrekk_ignore", contentId:"${title}", mediaName:"${id}", everId:"${clientId(amp-wt3-eid)}"}, requests:{trackURL:"https://${trackDomain}/${trackId}/wt", basePrefix:"?p=440,${contentId},1,${screenWidth}x${screenHeight},${screenColorDepth},1,", baseSuffix:",${documentReferrer},${viewportWidth}x${viewportHeight},0&tz=${timezone}&eid=${everId}&la=${browserLanguage}", parameterPrefix:"${basePrefix}${timestamp}${baseSuffix}", 
parameterSuffix:"&pu=${sourceUrl}&eor=1", pageview:"${trackURL}${parameterPrefix}&${extraUrlParams}&cp570=${pageLoadTime}${parameterSuffix}", event:"${trackURL}${parameterPrefix}&ct=${actionName}&${extraUrlParams}${parameterSuffix}", scroll:"${trackURL}${parameterPrefix}&ct=${actionName}&ck540=${verticalScrollBoundary}${parameterSuffix}", mediaPrefix:"${trackURL}${basePrefix}${baseSuffix}&mi=${mediaName}", mediaSuffix:"&mt1=${currentTime}&mt2=${duration}&${extraUrlParams}${parameterSuffix}&x=${playedTotal}", 
mediaPlay:"${mediaPrefix}&mk=play${mediaSuffix}", mediaPause:"${mediaPrefix}&mk=pause${mediaSuffix}", mediaPosition:"${mediaPrefix}&mk=pos${mediaSuffix}", mediaEnded:"${mediaPrefix}&mk=eof${mediaSuffix}"}, extraUrlParamsReplaceMap:{pageParameter:"cp", contentGroup:"cg", actionParameter:"ck", sessionParameter:"cs", ecommerceParameter:"cb", urmCategory:"uc", campaignParameter:"cc", mediaCategory:"mg"}, transport:{beacon:!1, xhrpost:!1, image:!0}}};
$ANALYTICS_CONFIG$$module$extensions$amp_analytics$0_1$vendors$$.infonline.triggers.pageview.iframePing = !0;
$ANALYTICS_CONFIG$$module$extensions$amp_analytics$0_1$vendors$$.adobeanalytics_nativeConfig.triggers.pageLoad.iframePing = !0;
$ANALYTICS_CONFIG$$module$extensions$amp_analytics$0_1$vendors$$.oewa.triggers.pageview.iframePing = !0;
for (var $vendor$jscomp$inline_2427$$ in _.$IFRAME_TRANSPORTS$$module$extensions$amp_analytics$0_1$iframe_transport_vendors$$) {
  _.$hasOwn$$module$src$utils$object$$(_.$IFRAME_TRANSPORTS$$module$extensions$amp_analytics$0_1$iframe_transport_vendors$$, $vendor$jscomp$inline_2427$$) && ($ANALYTICS_CONFIG$$module$extensions$amp_analytics$0_1$vendors$$[$vendor$jscomp$inline_2427$$].transport = Object.assign({}, $ANALYTICS_CONFIG$$module$extensions$amp_analytics$0_1$vendors$$[$vendor$jscomp$inline_2427$$].transport, {iframe:_.$IFRAME_TRANSPORTS$$module$extensions$amp_analytics$0_1$iframe_transport_vendors$$[$vendor$jscomp$inline_2427$$]}));
}
;$AnalyticsConfig$$module$extensions$amp_analytics$0_1$config$$.prototype.$I$ = function() {
  var $configRewriterUrl$$ = ($JSCompiler_StaticMethods_getTypeConfig_$$(this).configRewriter || {}).url, $config$jscomp$29$$ = _.$dict$$module$src$utils$object$$({});
  if (this.$element_$.$ra$) {
    var $JSCompiler_inline_result$jscomp$642_inlineConfig_inlineConfig$jscomp$inline_2430$$ = this.$element_$.$ra$;
  } else {
    $JSCompiler_inline_result$jscomp$642_inlineConfig_inlineConfig$jscomp$inline_2430$$ = {};
    var $TAG$jscomp$inline_2431_TAG$jscomp$inline_2438_type$jscomp$inline_2437$$ = $JSCompiler_StaticMethods_AnalyticsConfig$$module$extensions$amp_analytics$0_1$config_prototype$getName_$$(this);
    try {
      var $children$jscomp$inline_2432$$ = this.$element_$.children;
      1 == $children$jscomp$inline_2432$$.length ? $JSCompiler_inline_result$jscomp$642_inlineConfig_inlineConfig$jscomp$inline_2430$$ = _.$getChildJsonConfig$$module$src$json$$(this.$element_$) : 1 < $children$jscomp$inline_2432$$.length && _.$user$$module$src$log$$().error($TAG$jscomp$inline_2431_TAG$jscomp$inline_2438_type$jscomp$inline_2437$$, "The tag should contain only one <script> child.");
    } catch ($er$jscomp$inline_2433$$) {
      _.$user$$module$src$log$$().error($TAG$jscomp$inline_2431_TAG$jscomp$inline_2438_type$jscomp$inline_2437$$, $er$jscomp$inline_2433$$.message);
    }
  }
  $TAG$jscomp$inline_2431_TAG$jscomp$inline_2438_type$jscomp$inline_2437$$ = this.$element_$.getAttribute("type");
  this.$G$[$TAG$jscomp$inline_2431_TAG$jscomp$inline_2438_type$jscomp$inline_2437$$] && ($JSCompiler_inline_result$jscomp$642_inlineConfig_inlineConfig$jscomp$inline_2430$$.transport || this.$D$.transport) && ($TAG$jscomp$inline_2431_TAG$jscomp$inline_2438_type$jscomp$inline_2437$$ = $JSCompiler_StaticMethods_AnalyticsConfig$$module$extensions$amp_analytics$0_1$config_prototype$getName_$$(this), _.$user$$module$src$log$$().error($TAG$jscomp$inline_2431_TAG$jscomp$inline_2438_type$jscomp$inline_2437$$, 
  "Inline or remote config should not overwrite vendor transport settings"));
  $JSCompiler_inline_result$jscomp$642_inlineConfig_inlineConfig$jscomp$inline_2430$$.transport && $JSCompiler_inline_result$jscomp$642_inlineConfig_inlineConfig$jscomp$inline_2430$$.transport.iframe && (_.$user$$module$src$log$$().error("amp-analytics/config", "Inline configs are not allowed to specify transport iframe"), $JSCompiler_inline_result$jscomp$642_inlineConfig_inlineConfig$jscomp$inline_2430$$.transport.iframe = void 0);
  this.$D$.transport && this.$D$.transport.iframe && (_.$user$$module$src$log$$().error("amp-analytics/config", "Remote configs are not allowed to specify transport iframe"), this.$D$.transport.iframe = void 0);
  $mergeObjects$$module$extensions$amp_analytics$0_1$config$$($JSCompiler_inline_result$jscomp$642_inlineConfig_inlineConfig$jscomp$inline_2430$$, $config$jscomp$29$$);
  $mergeObjects$$module$extensions$amp_analytics$0_1$config$$(this.$D$, $config$jscomp$29$$);
  return !$configRewriterUrl$$ || this.$isSandbox_$ ? (this.$config_$ = $JSCompiler_StaticMethods_mergeConfigs_$$(this, $config$jscomp$29$$), window.Promise.resolve()) : $JSCompiler_StaticMethods_handleConfigRewriter_$$(this, $config$jscomp$29$$, $configRewriterUrl$$);
};
var $crcTable$$module$extensions$amp_analytics$0_1$crc32$$ = null;
var $KEY_VALIDATOR$$module$extensions$amp_analytics$0_1$linker$$ = /^[a-zA-Z0-9\-_.]+$/;
$LinkerReader$$module$extensions$amp_analytics$0_1$linker_reader$$.prototype.get = function($name$jscomp$192$$, $id$jscomp$50$$) {
  if (!$name$jscomp$192$$ || !$id$jscomp$50$$) {
    return _.$user$$module$src$log$$().error("amp-analytics/linker-reader", "LINKER_PARAM requires two params, name and id"), null;
  }
  if (!_.$hasOwn$$module$src$utils$object$$(this.$D$, $name$jscomp$192$$)) {
    var $JSCompiler_temp_const$jscomp$647_value$jscomp$175$$ = this.$D$;
    var $params$jscomp$inline_6750_parsedUrl$jscomp$inline_2448_parts$jscomp$inline_6740_serializedIds$jscomp$inline_6037$$ = _.$parseUrlDeprecated$$module$src$url$$(this.$F$.location.href);
    var $JSCompiler_inline_result$jscomp$648_JSCompiler_inline_result$jscomp$6672_JSCompiler_inline_result$jscomp$6673_checksum$jscomp$inline_6745_keyValuePairs$jscomp$inline_6749_linkerObj$jscomp$inline_6036_params$jscomp$inline_2449_value$jscomp$inline_2450_version$jscomp$inline_6742$$ = _.$parseQueryString_$$module$src$url_parse_query_string$$($params$jscomp$inline_6750_parsedUrl$jscomp$inline_2448_parts$jscomp$inline_6740_serializedIds$jscomp$inline_6037$$.search);
    if (_.$hasOwn$$module$src$utils$object$$($JSCompiler_inline_result$jscomp$648_JSCompiler_inline_result$jscomp$6672_JSCompiler_inline_result$jscomp$6673_checksum$jscomp$inline_6745_keyValuePairs$jscomp$inline_6749_linkerObj$jscomp$inline_6036_params$jscomp$inline_2449_value$jscomp$inline_2450_version$jscomp$inline_6742$$, $name$jscomp$192$$)) {
      $JSCompiler_inline_result$jscomp$648_JSCompiler_inline_result$jscomp$6672_JSCompiler_inline_result$jscomp$6673_checksum$jscomp$inline_6745_keyValuePairs$jscomp$inline_6749_linkerObj$jscomp$inline_6036_params$jscomp$inline_2449_value$jscomp$inline_2450_version$jscomp$inline_6742$$ = $JSCompiler_inline_result$jscomp$648_JSCompiler_inline_result$jscomp$6672_JSCompiler_inline_result$jscomp$6673_checksum$jscomp$inline_6745_keyValuePairs$jscomp$inline_6749_linkerObj$jscomp$inline_6036_params$jscomp$inline_2449_value$jscomp$inline_2450_version$jscomp$inline_6742$$[$name$jscomp$192$$];
      if (this.$F$.history.replaceState) {
        var $JSCompiler_inline_result$jscomp$inline_6030_i$jscomp$inline_6746_i$jscomp$inline_6751_isEven$jscomp$inline_6741_search$jscomp$inline_6032_urlSearch$jscomp$inline_6031$$;
        $JSCompiler_inline_result$jscomp$inline_6030_i$jscomp$inline_6746_i$jscomp$inline_6751_isEven$jscomp$inline_6741_search$jscomp$inline_6032_urlSearch$jscomp$inline_6031$$ = ($JSCompiler_inline_result$jscomp$inline_6030_i$jscomp$inline_6746_i$jscomp$inline_6751_isEven$jscomp$inline_6741_search$jscomp$inline_6032_urlSearch$jscomp$inline_6031$$ = $params$jscomp$inline_6750_parsedUrl$jscomp$inline_2448_parts$jscomp$inline_6740_serializedIds$jscomp$inline_6037$$.search) && "?" != $JSCompiler_inline_result$jscomp$inline_6030_i$jscomp$inline_6746_i$jscomp$inline_6751_isEven$jscomp$inline_6741_search$jscomp$inline_6032_urlSearch$jscomp$inline_6031$$ ? 
        ($JSCompiler_inline_result$jscomp$inline_6030_i$jscomp$inline_6746_i$jscomp$inline_6751_isEven$jscomp$inline_6741_search$jscomp$inline_6032_urlSearch$jscomp$inline_6031$$ = $JSCompiler_inline_result$jscomp$inline_6030_i$jscomp$inline_6746_i$jscomp$inline_6751_isEven$jscomp$inline_6741_search$jscomp$inline_6032_urlSearch$jscomp$inline_6031$$.replace(new RegExp("[?&]" + $name$jscomp$192$$ + "=[^&]*", "g"), "").replace(/^[?&]/, "")) ? "?" + $JSCompiler_inline_result$jscomp$inline_6030_i$jscomp$inline_6746_i$jscomp$inline_6751_isEven$jscomp$inline_6741_search$jscomp$inline_6032_urlSearch$jscomp$inline_6031$$ : 
        "" : "";
        this.$F$.history.replaceState(null, "", $params$jscomp$inline_6750_parsedUrl$jscomp$inline_2448_parts$jscomp$inline_6740_serializedIds$jscomp$inline_6037$$.origin + $params$jscomp$inline_6750_parsedUrl$jscomp$inline_2448_parts$jscomp$inline_6740_serializedIds$jscomp$inline_6037$$.pathname + $JSCompiler_inline_result$jscomp$inline_6030_i$jscomp$inline_6746_i$jscomp$inline_6751_isEven$jscomp$inline_6741_search$jscomp$inline_6032_urlSearch$jscomp$inline_6031$$ + ($params$jscomp$inline_6750_parsedUrl$jscomp$inline_2448_parts$jscomp$inline_6740_serializedIds$jscomp$inline_6037$$.hash || 
        ""));
      }
      $params$jscomp$inline_6750_parsedUrl$jscomp$inline_2448_parts$jscomp$inline_6740_serializedIds$jscomp$inline_6037$$ = $JSCompiler_inline_result$jscomp$648_JSCompiler_inline_result$jscomp$6672_JSCompiler_inline_result$jscomp$6673_checksum$jscomp$inline_6745_keyValuePairs$jscomp$inline_6749_linkerObj$jscomp$inline_6036_params$jscomp$inline_2449_value$jscomp$inline_2450_version$jscomp$inline_6742$$.split("*");
      $JSCompiler_inline_result$jscomp$inline_6030_i$jscomp$inline_6746_i$jscomp$inline_6751_isEven$jscomp$inline_6741_search$jscomp$inline_6032_urlSearch$jscomp$inline_6031$$ = 0 == $params$jscomp$inline_6750_parsedUrl$jscomp$inline_2448_parts$jscomp$inline_6740_serializedIds$jscomp$inline_6037$$.length % 2;
      4 > $params$jscomp$inline_6750_parsedUrl$jscomp$inline_2448_parts$jscomp$inline_6740_serializedIds$jscomp$inline_6037$$.length || !$JSCompiler_inline_result$jscomp$inline_6030_i$jscomp$inline_6746_i$jscomp$inline_6751_isEven$jscomp$inline_6741_search$jscomp$inline_6032_urlSearch$jscomp$inline_6031$$ ? (_.$user$$module$src$log$$().error("amp-analytics/linker", "Invalid linker_param value " + $JSCompiler_inline_result$jscomp$648_JSCompiler_inline_result$jscomp$6672_JSCompiler_inline_result$jscomp$6673_checksum$jscomp$inline_6745_keyValuePairs$jscomp$inline_6749_linkerObj$jscomp$inline_6036_params$jscomp$inline_2449_value$jscomp$inline_2450_version$jscomp$inline_6742$$), 
      $JSCompiler_inline_result$jscomp$648_JSCompiler_inline_result$jscomp$6672_JSCompiler_inline_result$jscomp$6673_checksum$jscomp$inline_6745_keyValuePairs$jscomp$inline_6749_linkerObj$jscomp$inline_6036_params$jscomp$inline_2449_value$jscomp$inline_2450_version$jscomp$inline_6742$$ = null) : ($JSCompiler_inline_result$jscomp$648_JSCompiler_inline_result$jscomp$6672_JSCompiler_inline_result$jscomp$6673_checksum$jscomp$inline_6745_keyValuePairs$jscomp$inline_6749_linkerObj$jscomp$inline_6036_params$jscomp$inline_2449_value$jscomp$inline_2450_version$jscomp$inline_6742$$ = 
      Number($params$jscomp$inline_6750_parsedUrl$jscomp$inline_2448_parts$jscomp$inline_6740_serializedIds$jscomp$inline_6037$$.shift()), 1 !== $JSCompiler_inline_result$jscomp$648_JSCompiler_inline_result$jscomp$6672_JSCompiler_inline_result$jscomp$6673_checksum$jscomp$inline_6745_keyValuePairs$jscomp$inline_6749_linkerObj$jscomp$inline_6036_params$jscomp$inline_2449_value$jscomp$inline_2450_version$jscomp$inline_6742$$ ? (_.$user$$module$src$log$$().error("amp-analytics/linker", "Invalid version number " + 
      $JSCompiler_inline_result$jscomp$648_JSCompiler_inline_result$jscomp$6672_JSCompiler_inline_result$jscomp$6673_checksum$jscomp$inline_6745_keyValuePairs$jscomp$inline_6749_linkerObj$jscomp$inline_6036_params$jscomp$inline_2449_value$jscomp$inline_2450_version$jscomp$inline_6742$$), $JSCompiler_inline_result$jscomp$648_JSCompiler_inline_result$jscomp$6672_JSCompiler_inline_result$jscomp$6673_checksum$jscomp$inline_6745_keyValuePairs$jscomp$inline_6749_linkerObj$jscomp$inline_6036_params$jscomp$inline_2449_value$jscomp$inline_2450_version$jscomp$inline_6742$$ = 
      null) : $JSCompiler_inline_result$jscomp$648_JSCompiler_inline_result$jscomp$6672_JSCompiler_inline_result$jscomp$6673_checksum$jscomp$inline_6745_keyValuePairs$jscomp$inline_6749_linkerObj$jscomp$inline_6036_params$jscomp$inline_2449_value$jscomp$inline_2450_version$jscomp$inline_6742$$ = {$checksum$:$params$jscomp$inline_6750_parsedUrl$jscomp$inline_2448_parts$jscomp$inline_6740_serializedIds$jscomp$inline_6037$$.shift(), $serializedIds$:$params$jscomp$inline_6750_parsedUrl$jscomp$inline_2448_parts$jscomp$inline_6740_serializedIds$jscomp$inline_6037$$.join("*")});
      if ($JSCompiler_inline_result$jscomp$648_JSCompiler_inline_result$jscomp$6672_JSCompiler_inline_result$jscomp$6673_checksum$jscomp$inline_6745_keyValuePairs$jscomp$inline_6749_linkerObj$jscomp$inline_6036_params$jscomp$inline_2449_value$jscomp$inline_2450_version$jscomp$inline_6742$$) {
        $params$jscomp$inline_6750_parsedUrl$jscomp$inline_2448_parts$jscomp$inline_6740_serializedIds$jscomp$inline_6037$$ = $JSCompiler_inline_result$jscomp$648_JSCompiler_inline_result$jscomp$6672_JSCompiler_inline_result$jscomp$6673_checksum$jscomp$inline_6745_keyValuePairs$jscomp$inline_6749_linkerObj$jscomp$inline_6036_params$jscomp$inline_2449_value$jscomp$inline_2450_version$jscomp$inline_6742$$.$serializedIds$;
        c: {
          $JSCompiler_inline_result$jscomp$648_JSCompiler_inline_result$jscomp$6672_JSCompiler_inline_result$jscomp$6673_checksum$jscomp$inline_6745_keyValuePairs$jscomp$inline_6749_linkerObj$jscomp$inline_6036_params$jscomp$inline_2449_value$jscomp$inline_2450_version$jscomp$inline_6742$$ = $JSCompiler_inline_result$jscomp$648_JSCompiler_inline_result$jscomp$6672_JSCompiler_inline_result$jscomp$6673_checksum$jscomp$inline_6745_keyValuePairs$jscomp$inline_6749_linkerObj$jscomp$inline_6036_params$jscomp$inline_2449_value$jscomp$inline_2450_version$jscomp$inline_6742$$.$checksum$;
          for ($JSCompiler_inline_result$jscomp$inline_6030_i$jscomp$inline_6746_i$jscomp$inline_6751_isEven$jscomp$inline_6741_search$jscomp$inline_6032_urlSearch$jscomp$inline_6031$$ = 0; 1 >= $JSCompiler_inline_result$jscomp$inline_6030_i$jscomp$inline_6746_i$jscomp$inline_6751_isEven$jscomp$inline_6741_search$jscomp$inline_6032_urlSearch$jscomp$inline_6031$$; $JSCompiler_inline_result$jscomp$inline_6030_i$jscomp$inline_6746_i$jscomp$inline_6751_isEven$jscomp$inline_6741_search$jscomp$inline_6032_urlSearch$jscomp$inline_6031$$++) {
            if ($crc32$$module$extensions$amp_analytics$0_1$crc32$$([$getFingerprint$$module$extensions$amp_analytics$0_1$linker$$(), Math.floor(Date.now() / 60000) - ($JSCompiler_inline_result$jscomp$inline_6030_i$jscomp$inline_6746_i$jscomp$inline_6751_isEven$jscomp$inline_6741_search$jscomp$inline_6032_urlSearch$jscomp$inline_6031$$ || 0), $params$jscomp$inline_6750_parsedUrl$jscomp$inline_2448_parts$jscomp$inline_6740_serializedIds$jscomp$inline_6037$$].join("*")).toString(36) == $JSCompiler_inline_result$jscomp$648_JSCompiler_inline_result$jscomp$6672_JSCompiler_inline_result$jscomp$6673_checksum$jscomp$inline_6745_keyValuePairs$jscomp$inline_6749_linkerObj$jscomp$inline_6036_params$jscomp$inline_2449_value$jscomp$inline_2450_version$jscomp$inline_6742$$) {
              $JSCompiler_inline_result$jscomp$648_JSCompiler_inline_result$jscomp$6672_JSCompiler_inline_result$jscomp$6673_checksum$jscomp$inline_6745_keyValuePairs$jscomp$inline_6749_linkerObj$jscomp$inline_6036_params$jscomp$inline_2449_value$jscomp$inline_2450_version$jscomp$inline_6742$$ = !0;
              break c;
            }
          }
          $JSCompiler_inline_result$jscomp$648_JSCompiler_inline_result$jscomp$6672_JSCompiler_inline_result$jscomp$6673_checksum$jscomp$inline_6745_keyValuePairs$jscomp$inline_6749_linkerObj$jscomp$inline_6036_params$jscomp$inline_2449_value$jscomp$inline_2450_version$jscomp$inline_6742$$ = !1;
        }
        if ($JSCompiler_inline_result$jscomp$648_JSCompiler_inline_result$jscomp$6672_JSCompiler_inline_result$jscomp$6673_checksum$jscomp$inline_6745_keyValuePairs$jscomp$inline_6749_linkerObj$jscomp$inline_6036_params$jscomp$inline_2449_value$jscomp$inline_2450_version$jscomp$inline_6742$$) {
          for ($JSCompiler_inline_result$jscomp$648_JSCompiler_inline_result$jscomp$6672_JSCompiler_inline_result$jscomp$6673_checksum$jscomp$inline_6745_keyValuePairs$jscomp$inline_6749_linkerObj$jscomp$inline_6036_params$jscomp$inline_2449_value$jscomp$inline_2450_version$jscomp$inline_6742$$ = {}, $params$jscomp$inline_6750_parsedUrl$jscomp$inline_2448_parts$jscomp$inline_6740_serializedIds$jscomp$inline_6037$$ = $params$jscomp$inline_6750_parsedUrl$jscomp$inline_2448_parts$jscomp$inline_6740_serializedIds$jscomp$inline_6037$$.split("*"), 
          $JSCompiler_inline_result$jscomp$inline_6030_i$jscomp$inline_6746_i$jscomp$inline_6751_isEven$jscomp$inline_6741_search$jscomp$inline_6032_urlSearch$jscomp$inline_6031$$ = 0; $JSCompiler_inline_result$jscomp$inline_6030_i$jscomp$inline_6746_i$jscomp$inline_6751_isEven$jscomp$inline_6741_search$jscomp$inline_6032_urlSearch$jscomp$inline_6031$$ < $params$jscomp$inline_6750_parsedUrl$jscomp$inline_2448_parts$jscomp$inline_6740_serializedIds$jscomp$inline_6037$$.length; $JSCompiler_inline_result$jscomp$inline_6030_i$jscomp$inline_6746_i$jscomp$inline_6751_isEven$jscomp$inline_6741_search$jscomp$inline_6032_urlSearch$jscomp$inline_6031$$ += 
          2) {
            var $key$jscomp$inline_6752$$ = $params$jscomp$inline_6750_parsedUrl$jscomp$inline_2448_parts$jscomp$inline_6740_serializedIds$jscomp$inline_6037$$[$JSCompiler_inline_result$jscomp$inline_6030_i$jscomp$inline_6746_i$jscomp$inline_6751_isEven$jscomp$inline_6741_search$jscomp$inline_6032_urlSearch$jscomp$inline_6031$$];
            if ($KEY_VALIDATOR$$module$extensions$amp_analytics$0_1$linker$$.test($key$jscomp$inline_6752$$)) {
              var $JSCompiler_inline_result$jscomp$inline_6753_bytes$jscomp$inline_6754$$ = _.$base64UrlDecodeToBytes$$module$src$utils$base64$$(String($params$jscomp$inline_6750_parsedUrl$jscomp$inline_2448_parts$jscomp$inline_6740_serializedIds$jscomp$inline_6037$$[$JSCompiler_inline_result$jscomp$inline_6030_i$jscomp$inline_6746_i$jscomp$inline_6751_isEven$jscomp$inline_6741_search$jscomp$inline_6032_urlSearch$jscomp$inline_6031$$ + 1]));
              $JSCompiler_inline_result$jscomp$inline_6753_bytes$jscomp$inline_6754$$ = _.$utf8Decode$$module$src$utils$bytes$$($JSCompiler_inline_result$jscomp$inline_6753_bytes$jscomp$inline_6754$$);
              $JSCompiler_inline_result$jscomp$648_JSCompiler_inline_result$jscomp$6672_JSCompiler_inline_result$jscomp$6673_checksum$jscomp$inline_6745_keyValuePairs$jscomp$inline_6749_linkerObj$jscomp$inline_6036_params$jscomp$inline_2449_value$jscomp$inline_2450_version$jscomp$inline_6742$$[$key$jscomp$inline_6752$$] = $JSCompiler_inline_result$jscomp$inline_6753_bytes$jscomp$inline_6754$$;
            } else {
              _.$user$$module$src$log$$().error("amp-analytics/linker", "Invalid linker key " + $key$jscomp$inline_6752$$ + ", value ignored");
            }
          }
        } else {
          _.$user$$module$src$log$$().error("amp-analytics/linker", "LINKER_PARAM value checksum not valid"), $JSCompiler_inline_result$jscomp$648_JSCompiler_inline_result$jscomp$6672_JSCompiler_inline_result$jscomp$6673_checksum$jscomp$inline_6745_keyValuePairs$jscomp$inline_6749_linkerObj$jscomp$inline_6036_params$jscomp$inline_2449_value$jscomp$inline_2450_version$jscomp$inline_6742$$ = null;
        }
      } else {
        $JSCompiler_inline_result$jscomp$648_JSCompiler_inline_result$jscomp$6672_JSCompiler_inline_result$jscomp$6673_checksum$jscomp$inline_6745_keyValuePairs$jscomp$inline_6749_linkerObj$jscomp$inline_6036_params$jscomp$inline_2449_value$jscomp$inline_2450_version$jscomp$inline_6742$$ = null;
      }
    } else {
      $JSCompiler_inline_result$jscomp$648_JSCompiler_inline_result$jscomp$6672_JSCompiler_inline_result$jscomp$6673_checksum$jscomp$inline_6745_keyValuePairs$jscomp$inline_6749_linkerObj$jscomp$inline_6036_params$jscomp$inline_2449_value$jscomp$inline_2450_version$jscomp$inline_6742$$ = null;
    }
    $JSCompiler_temp_const$jscomp$647_value$jscomp$175$$[$name$jscomp$192$$] = $JSCompiler_inline_result$jscomp$648_JSCompiler_inline_result$jscomp$6672_JSCompiler_inline_result$jscomp$6673_checksum$jscomp$inline_6745_keyValuePairs$jscomp$inline_6749_linkerObj$jscomp$inline_6036_params$jscomp$inline_2449_value$jscomp$inline_2450_version$jscomp$inline_6742$$;
  }
  return this.$D$[$name$jscomp$192$$] && this.$D$[$name$jscomp$192$$][$id$jscomp$50$$] ? ($JSCompiler_temp_const$jscomp$647_value$jscomp$175$$ = this.$D$[$name$jscomp$192$$][$id$jscomp$50$$], delete this.$D$[$name$jscomp$192$$][$id$jscomp$50$$], $JSCompiler_temp_const$jscomp$647_value$jscomp$175$$) : null;
};
var $VARIABLE_ARGS_REGEXP$$module$extensions$amp_analytics$0_1$variables$$ = /^(?:([^\s]*)(\([^)]*\))|[^]+)$/;
$VariableService$$module$extensions$amp_analytics$0_1$variables$$.prototype.$F$ = function($template$jscomp$15$$, $options$jscomp$29$$) {
  var $$jscomp$this$jscomp$374$$ = this;
  return $template$jscomp$15$$.replace(/\${([^}]*)}/g, function($template$jscomp$15$$, $$jscomp$destructuring$var286_argList$jscomp$2_key$jscomp$96$$) {
    if (0 > $options$jscomp$29$$.iterations) {
      return _.$user$$module$src$log$$().error("amp-analytics/variables", "Maximum depth reached while expanding variables. Please ensure that the variables are not recursive."), $template$jscomp$15$$;
    }
    if (!$$jscomp$destructuring$var286_argList$jscomp$2_key$jscomp$96$$) {
      return "";
    }
    $$jscomp$destructuring$var286_argList$jscomp$2_key$jscomp$96$$ = $getNameArgs$$module$extensions$amp_analytics$0_1$variables$$($$jscomp$destructuring$var286_argList$jscomp$2_key$jscomp$96$$);
    var $match$jscomp$21_value$jscomp$185_value$jscomp$inline_2470$$ = $$jscomp$destructuring$var286_argList$jscomp$2_key$jscomp$96$$.name;
    $$jscomp$destructuring$var286_argList$jscomp$2_key$jscomp$96$$ = $$jscomp$destructuring$var286_argList$jscomp$2_key$jscomp$96$$.$argList$;
    if ($options$jscomp$29$$.$D$[$match$jscomp$21_value$jscomp$185_value$jscomp$inline_2470$$]) {
      return $template$jscomp$15$$;
    }
    $template$jscomp$15$$ = $options$jscomp$29$$.$vars$[$match$jscomp$21_value$jscomp$185_value$jscomp$inline_2470$$];
    null == $template$jscomp$15$$ && ($template$jscomp$15$$ = "");
    "string" == typeof $template$jscomp$15$$ && ($template$jscomp$15$$ = $$jscomp$this$jscomp$374$$.$F$($template$jscomp$15$$, new $ExpansionOptions$$module$extensions$amp_analytics$0_1$variables$$($options$jscomp$29$$.$vars$, $options$jscomp$29$$.iterations - 1, !0)));
    $options$jscomp$29$$.$F$ || ($template$jscomp$15$$ = $encodeVars$$module$extensions$amp_analytics$0_1$variables$$($template$jscomp$15$$));
    $template$jscomp$15$$ && ($template$jscomp$15$$ += $$jscomp$destructuring$var286_argList$jscomp$2_key$jscomp$96$$);
    return $template$jscomp$15$$;
  });
};
$VariableService$$module$extensions$amp_analytics$0_1$variables$$.prototype.$I$ = function($value$jscomp$186$$) {
  return _.$JSCompiler_StaticMethods_sha384Base64$$(_.$Services$$module$src$services$cryptoFor$$(this.$G$), $value$jscomp$186$$);
};
var $EXPAND_WHITELIST$$module$extensions$amp_analytics$0_1$cookie_writer$$ = {QUERY_PARAM:!0, LINKER_PARAM:!0}, $RESERVED_KEYS$$module$extensions$amp_analytics$0_1$cookie_writer$$ = {referrerDomains:!0, enabled:!0, cookiePath:!0, cookieMaxAge:!0, cookieSecure:!0, cookieDomain:!0};
$CookieWriter$$module$extensions$amp_analytics$0_1$cookie_writer$$.prototype.write = function() {
  this.$F$ || (this.$F$ = $JSCompiler_StaticMethods_CookieWriter$$module$extensions$amp_analytics$0_1$cookie_writer_prototype$init_$$(this));
  return this.$F$;
};
var $VARIABLE_DATA_ATTRIBUTE_KEY$$module$extensions$amp_analytics$0_1$events$$ = /^vars(.+)/, $AnalyticsEventType$$module$extensions$amp_analytics$0_1$events$$ = {$VISIBLE$:"visible", $CLICK$:"click", $TIMER$:"timer", $SCROLL$:"scroll", $HIDDEN$:"hidden"}, $ALLOWED_FOR_ALL_ROOT_TYPES$$module$extensions$amp_analytics$0_1$events$$ = ["ampdoc", "embed"], $TRACKER_TYPE$$module$extensions$amp_analytics$0_1$events$$ = Object.freeze({click:{name:"click", $allowedFor$:$ALLOWED_FOR_ALL_ROOT_TYPES$$module$extensions$amp_analytics$0_1$events$$.concat(["timer"]), 
$klass$:function($root$jscomp$31$$) {
  return new $ClickEventTracker$$module$extensions$amp_analytics$0_1$events$$($root$jscomp$31$$);
}}, scroll:{name:"scroll", $allowedFor$:$ALLOWED_FOR_ALL_ROOT_TYPES$$module$extensions$amp_analytics$0_1$events$$.concat(["timer"]), $klass$:function($root$jscomp$32$$) {
  return new $ScrollEventTracker$$module$extensions$amp_analytics$0_1$events$$($root$jscomp$32$$);
}}, custom:{name:"custom", $allowedFor$:$ALLOWED_FOR_ALL_ROOT_TYPES$$module$extensions$amp_analytics$0_1$events$$.concat(["timer"]), $klass$:function($root$jscomp$33$$) {
  return new $CustomEventTracker$$module$extensions$amp_analytics$0_1$events$$($root$jscomp$33$$);
}}, "render-start":{name:"render-start", $allowedFor$:$ALLOWED_FOR_ALL_ROOT_TYPES$$module$extensions$amp_analytics$0_1$events$$.concat(["timer", "visible"]), $klass$:function($root$jscomp$34$$) {
  return new $SignalTracker$$module$extensions$amp_analytics$0_1$events$$($root$jscomp$34$$);
}}, "ini-load":{name:"ini-load", $allowedFor$:$ALLOWED_FOR_ALL_ROOT_TYPES$$module$extensions$amp_analytics$0_1$events$$.concat(["timer", "visible"]), $klass$:function($root$jscomp$35$$) {
  return new $IniLoadTracker$$module$extensions$amp_analytics$0_1$events$$($root$jscomp$35$$);
}}, timer:{name:"timer", $allowedFor$:$ALLOWED_FOR_ALL_ROOT_TYPES$$module$extensions$amp_analytics$0_1$events$$, $klass$:function($root$jscomp$36$$) {
  return new $TimerEventTracker$$module$extensions$amp_analytics$0_1$events$$($root$jscomp$36$$);
}}, visible:{name:"visible", $allowedFor$:$ALLOWED_FOR_ALL_ROOT_TYPES$$module$extensions$amp_analytics$0_1$events$$.concat(["timer"]), $klass$:function($root$jscomp$37$$) {
  return new $VisibilityTracker$$module$extensions$amp_analytics$0_1$events$$($root$jscomp$37$$);
}}, hidden:{name:"visible", $allowedFor$:$ALLOWED_FOR_ALL_ROOT_TYPES$$module$extensions$amp_analytics$0_1$events$$.concat(["timer"]), $klass$:function($root$jscomp$38$$) {
  return new $VisibilityTracker$$module$extensions$amp_analytics$0_1$events$$($root$jscomp$38$$);
}}, video:{name:"video", $allowedFor$:$ALLOWED_FOR_ALL_ROOT_TYPES$$module$extensions$amp_analytics$0_1$events$$.concat(["timer"]), $klass$:function($root$jscomp$39$$) {
  return new $VideoEventTracker$$module$extensions$amp_analytics$0_1$events$$($root$jscomp$39$$);
}}});
_.$$jscomp$inherits$$($CustomEventTracker$$module$extensions$amp_analytics$0_1$events$$, $EventTracker$$module$extensions$amp_analytics$0_1$events$$);
$CustomEventTracker$$module$extensions$amp_analytics$0_1$events$$.prototype.$dispose$ = function() {
  this.$G$ = this.$F$ = void 0;
  for (var $k$jscomp$22$$ in this.$I$) {
    _.$JSCompiler_StaticMethods_removeAll$$(this.$I$[$k$jscomp$22$$]);
  }
};
$CustomEventTracker$$module$extensions$amp_analytics$0_1$events$$.prototype.add = function($context$jscomp$23_observables$$, $eventType$jscomp$33$$, $config$jscomp$34$$, $listener$jscomp$66$$) {
  var $$jscomp$this$jscomp$378$$ = this, $selector$jscomp$20$$ = $config$jscomp$34$$.selector;
  $selector$jscomp$20$$ || ($selector$jscomp$20$$ = ":root");
  var $targetReady$$ = this.$D$.$getElement$($context$jscomp$23_observables$$, $selector$jscomp$20$$, $config$jscomp$34$$.selectionMethod || null), $isSandboxEvent$$ = _.$startsWith$$module$src$string$$($eventType$jscomp$33$$, "sandbox-"), $buffer$jscomp$14$$ = $isSandboxEvent$$ ? this.$G$ && this.$G$[$eventType$jscomp$33$$] : this.$F$ && this.$F$[$eventType$jscomp$33$$];
  if ($buffer$jscomp$14$$) {
    var $bufferLength$$ = $buffer$jscomp$14$$.length;
    $targetReady$$.then(function($context$jscomp$23_observables$$) {
      (0,window.setTimeout)(function() {
        for (var $config$jscomp$34$$ = 0; $config$jscomp$34$$ < $bufferLength$$; $config$jscomp$34$$++) {
          var $selector$jscomp$20$$ = $buffer$jscomp$14$$[$config$jscomp$34$$];
          $context$jscomp$23_observables$$.contains($selector$jscomp$20$$.target) && $listener$jscomp$66$$($selector$jscomp$20$$);
        }
        $isSandboxEvent$$ && ($$jscomp$this$jscomp$378$$.$G$[$eventType$jscomp$33$$] = void 0);
      }, 1);
    });
  }
  $context$jscomp$23_observables$$ = this.$I$[$eventType$jscomp$33$$];
  $context$jscomp$23_observables$$ || ($context$jscomp$23_observables$$ = new _.$Observable$$module$src$observable$$, this.$I$[$eventType$jscomp$33$$] = $context$jscomp$23_observables$$);
  return this.$I$[$eventType$jscomp$33$$].add(function($context$jscomp$23_observables$$) {
    $targetReady$$.then(function($eventType$jscomp$33$$) {
      $eventType$jscomp$33$$.contains($context$jscomp$23_observables$$.target) && $listener$jscomp$66$$($context$jscomp$23_observables$$);
    });
  });
};
$CustomEventTracker$$module$extensions$amp_analytics$0_1$events$$.prototype.$trigger$ = function($event$jscomp$75$$) {
  var $eventType$jscomp$34$$ = $event$jscomp$75$$.type, $isSandboxEvent$jscomp$1$$ = _.$startsWith$$module$src$string$$($eventType$jscomp$34$$, "sandbox-"), $observables$jscomp$1$$ = this.$I$[$eventType$jscomp$34$$];
  if ($observables$jscomp$1$$ && ($observables$jscomp$1$$.$fire$($event$jscomp$75$$), $isSandboxEvent$jscomp$1$$)) {
    return;
  }
  $isSandboxEvent$jscomp$1$$ ? (this.$G$[$eventType$jscomp$34$$] = this.$G$[$eventType$jscomp$34$$] || [], this.$G$[$eventType$jscomp$34$$].push($event$jscomp$75$$)) : this.$F$ && (this.$F$[$eventType$jscomp$34$$] = this.$F$[$eventType$jscomp$34$$] || [], this.$F$[$eventType$jscomp$34$$].push($event$jscomp$75$$));
};
_.$$jscomp$inherits$$($ClickEventTracker$$module$extensions$amp_analytics$0_1$events$$, $EventTracker$$module$extensions$amp_analytics$0_1$events$$);
$ClickEventTracker$$module$extensions$amp_analytics$0_1$events$$.prototype.$dispose$ = function() {
  this.$D$.$AnalyticsRoot$$module$extensions$amp_analytics$0_1$analytics_root_prototype$getRoot$().removeEventListener("click", this.$G$);
  _.$JSCompiler_StaticMethods_removeAll$$(this.$F$);
};
$ClickEventTracker$$module$extensions$amp_analytics$0_1$events$$.prototype.add = function($context$jscomp$24$$, $eventType$jscomp$35_selector$jscomp$21$$, $config$jscomp$35_selectionMethod$jscomp$1$$, $listener$jscomp$67$$) {
  $eventType$jscomp$35_selector$jscomp$21$$ = $config$jscomp$35_selectionMethod$jscomp$1$$.selector;
  $config$jscomp$35_selectionMethod$jscomp$1$$ = $config$jscomp$35_selectionMethod$jscomp$1$$.selectionMethod || null;
  return this.$F$.add($JSCompiler_StaticMethods_createSelectiveListener$$(this.$D$, this.$I$.bind(this, $listener$jscomp$67$$), $context$jscomp$24$$.parentElement || $context$jscomp$24$$, $eventType$jscomp$35_selector$jscomp$21$$, $config$jscomp$35_selectionMethod$jscomp$1$$));
};
$ClickEventTracker$$module$extensions$amp_analytics$0_1$events$$.prototype.$I$ = function($listener$jscomp$68$$, $target$jscomp$113$$) {
  var $params$jscomp$22$$ = _.$getDataParamsFromAttributes$$module$src$dom$$($target$jscomp$113$$, void 0, $VARIABLE_DATA_ATTRIBUTE_KEY$$module$extensions$amp_analytics$0_1$events$$);
  $listener$jscomp$68$$(new $AnalyticsEvent$$module$extensions$amp_analytics$0_1$events$$($target$jscomp$113$$, "click", $params$jscomp$22$$));
};
_.$$jscomp$inherits$$($ScrollEventTracker$$module$extensions$amp_analytics$0_1$events$$, $EventTracker$$module$extensions$amp_analytics$0_1$events$$);
$ScrollEventTracker$$module$extensions$amp_analytics$0_1$events$$.prototype.$dispose$ = function() {
  if (null !== this.$F$) {
    var $JSCompiler_StaticMethods_removeScrollHandler$self$jscomp$inline_2478$$ = $JSCompiler_StaticMethods_getScrollManager$$(this.$G$);
    $JSCompiler_StaticMethods_removeScrollHandler$self$jscomp$inline_2478$$.$F$.remove(this.$F$);
    0 >= _.$JSCompiler_StaticMethods_getHandlerCount$$($JSCompiler_StaticMethods_removeScrollHandler$self$jscomp$inline_2478$$.$F$) && $JSCompiler_StaticMethods_removeScrollHandler$self$jscomp$inline_2478$$.$D$ && ($JSCompiler_StaticMethods_removeScrollHandler$self$jscomp$inline_2478$$.$D$(), $JSCompiler_StaticMethods_removeScrollHandler$self$jscomp$inline_2478$$.$D$ = null);
    this.$F$ = null;
  }
};
$ScrollEventTracker$$module$extensions$amp_analytics$0_1$events$$.prototype.add = function($boundsV_context$jscomp$25_scrollEvent$jscomp$inline_2484_size$jscomp$inline_2483$$, $eventType$jscomp$36$$, $boundsH_config$jscomp$36_handler$jscomp$inline_2482$$, $JSCompiler_StaticMethods_addScrollHandler$self$jscomp$inline_2481_listener$jscomp$69$$) {
  if (!$boundsH_config$jscomp$36_handler$jscomp$inline_2482$$.scrollSpec) {
    return _.$user$$module$src$log$$().error("amp-analytics/events", "Missing scrollSpec on scroll trigger."), $NO_UNLISTEN$$module$extensions$amp_analytics$0_1$events$$;
  }
  if (!Array.isArray($boundsH_config$jscomp$36_handler$jscomp$inline_2482$$.scrollSpec.verticalBoundaries) && !Array.isArray($boundsH_config$jscomp$36_handler$jscomp$inline_2482$$.scrollSpec.horizontalBoundaries)) {
    return _.$user$$module$src$log$$().error("amp-analytics/events", "Boundaries are required for the scroll trigger to work."), $NO_UNLISTEN$$module$extensions$amp_analytics$0_1$events$$;
  }
  $boundsV_context$jscomp$25_scrollEvent$jscomp$inline_2484_size$jscomp$inline_2483$$ = $JSCompiler_StaticMethods_normalizeBoundaries_$$($boundsH_config$jscomp$36_handler$jscomp$inline_2482$$.scrollSpec.verticalBoundaries);
  $boundsH_config$jscomp$36_handler$jscomp$inline_2482$$ = $JSCompiler_StaticMethods_normalizeBoundaries_$$($boundsH_config$jscomp$36_handler$jscomp$inline_2482$$.scrollSpec.horizontalBoundaries);
  this.$F$ = this.$I$.bind(this, $boundsV_context$jscomp$25_scrollEvent$jscomp$inline_2484_size$jscomp$inline_2483$$, $boundsH_config$jscomp$36_handler$jscomp$inline_2482$$, $JSCompiler_StaticMethods_addScrollHandler$self$jscomp$inline_2481_listener$jscomp$69$$);
  $JSCompiler_StaticMethods_addScrollHandler$self$jscomp$inline_2481_listener$jscomp$69$$ = $JSCompiler_StaticMethods_getScrollManager$$(this.$G$);
  $boundsH_config$jscomp$36_handler$jscomp$inline_2482$$ = this.$F$;
  $boundsV_context$jscomp$25_scrollEvent$jscomp$inline_2484_size$jscomp$inline_2483$$ = $JSCompiler_StaticMethods_addScrollHandler$self$jscomp$inline_2481_listener$jscomp$69$$.$viewport_$.$getSize$();
  $boundsV_context$jscomp$25_scrollEvent$jscomp$inline_2484_size$jscomp$inline_2483$$ = {top:_.$JSCompiler_StaticMethods_Viewport$$module$src$service$viewport$viewport_impl_prototype$getScrollTop$$($JSCompiler_StaticMethods_addScrollHandler$self$jscomp$inline_2481_listener$jscomp$69$$.$viewport_$), left:$JSCompiler_StaticMethods_addScrollHandler$self$jscomp$inline_2481_listener$jscomp$69$$.$viewport_$.getScrollLeft(), width:$boundsV_context$jscomp$25_scrollEvent$jscomp$inline_2484_size$jscomp$inline_2483$$.width, 
  height:$boundsV_context$jscomp$25_scrollEvent$jscomp$inline_2484_size$jscomp$inline_2483$$.height, scrollWidth:$JSCompiler_StaticMethods_addScrollHandler$self$jscomp$inline_2481_listener$jscomp$69$$.$viewport_$.getScrollWidth(), scrollHeight:$JSCompiler_StaticMethods_addScrollHandler$self$jscomp$inline_2481_listener$jscomp$69$$.$viewport_$.$getScrollHeight$()};
  $boundsH_config$jscomp$36_handler$jscomp$inline_2482$$($boundsV_context$jscomp$25_scrollEvent$jscomp$inline_2484_size$jscomp$inline_2483$$);
  0 === _.$JSCompiler_StaticMethods_getHandlerCount$$($JSCompiler_StaticMethods_addScrollHandler$self$jscomp$inline_2481_listener$jscomp$69$$.$F$) && ($JSCompiler_StaticMethods_addScrollHandler$self$jscomp$inline_2481_listener$jscomp$69$$.$D$ = _.$JSCompiler_StaticMethods_onChanged$$($JSCompiler_StaticMethods_addScrollHandler$self$jscomp$inline_2481_listener$jscomp$69$$.$viewport_$, $JSCompiler_StaticMethods_addScrollHandler$self$jscomp$inline_2481_listener$jscomp$69$$.$G$.bind($JSCompiler_StaticMethods_addScrollHandler$self$jscomp$inline_2481_listener$jscomp$69$$)));
  return $JSCompiler_StaticMethods_addScrollHandler$self$jscomp$inline_2481_listener$jscomp$69$$.$F$.add($boundsH_config$jscomp$36_handler$jscomp$inline_2482$$);
};
$ScrollEventTracker$$module$extensions$amp_analytics$0_1$events$$.prototype.$I$ = function($boundsV$jscomp$1$$, $boundsH$jscomp$1$$, $listener$jscomp$70$$, $e$jscomp$122$$) {
  $JSCompiler_StaticMethods_triggerScrollEvents_$$(this, $boundsV$jscomp$1$$, 100 * ($e$jscomp$122$$.top + $e$jscomp$122$$.height) / $e$jscomp$122$$.scrollHeight, "verticalScrollBoundary", $listener$jscomp$70$$);
  $JSCompiler_StaticMethods_triggerScrollEvents_$$(this, $boundsH$jscomp$1$$, 100 * ($e$jscomp$122$$.left + $e$jscomp$122$$.width) / $e$jscomp$122$$.scrollWidth, "horizontalScrollBoundary", $listener$jscomp$70$$);
};
_.$$jscomp$inherits$$($SignalTracker$$module$extensions$amp_analytics$0_1$events$$, $EventTracker$$module$extensions$amp_analytics$0_1$events$$);
$SignalTracker$$module$extensions$amp_analytics$0_1$events$$.prototype.$dispose$ = function() {
};
$SignalTracker$$module$extensions$amp_analytics$0_1$events$$.prototype.add = function($context$jscomp$26_signalsPromise$$, $eventType$jscomp$37$$, $config$jscomp$37$$, $listener$jscomp$72$$) {
  var $$jscomp$this$jscomp$379$$ = this, $selector$jscomp$22$$ = $config$jscomp$37$$.selector || ":root";
  if (":root" == $selector$jscomp$22$$ || ":host" == $selector$jscomp$22$$) {
    var $target$jscomp$114$$ = this.$D$.$getRootElement$();
    $context$jscomp$26_signalsPromise$$ = this.$getRootSignal$($eventType$jscomp$37$$);
  } else {
    $context$jscomp$26_signalsPromise$$ = $JSCompiler_StaticMethods_getAmpElement$$(this.$D$, $context$jscomp$26_signalsPromise$$.parentElement || $context$jscomp$26_signalsPromise$$, $selector$jscomp$22$$, $config$jscomp$37$$.selectionMethod).then(function($context$jscomp$26_signalsPromise$$) {
      $target$jscomp$114$$ = $context$jscomp$26_signalsPromise$$;
      return $$jscomp$this$jscomp$379$$.$getElementSignal$($eventType$jscomp$37$$, $target$jscomp$114$$);
    });
  }
  $context$jscomp$26_signalsPromise$$.then(function() {
    $listener$jscomp$72$$(new $AnalyticsEvent$$module$extensions$amp_analytics$0_1$events$$($target$jscomp$114$$, $eventType$jscomp$37$$));
  });
  return $NO_UNLISTEN$$module$extensions$amp_analytics$0_1$events$$;
};
$SignalTracker$$module$extensions$amp_analytics$0_1$events$$.prototype.$getRootSignal$ = function($eventType$jscomp$38$$) {
  return this.$D$.signals().whenSignal($eventType$jscomp$38$$);
};
$SignalTracker$$module$extensions$amp_analytics$0_1$events$$.prototype.$getElementSignal$ = function($eventType$jscomp$39$$, $element$jscomp$308$$) {
  return "function" != typeof $element$jscomp$308$$.signals ? window.Promise.resolve() : $element$jscomp$308$$.signals().whenSignal($eventType$jscomp$39$$);
};
_.$$jscomp$inherits$$($IniLoadTracker$$module$extensions$amp_analytics$0_1$events$$, $EventTracker$$module$extensions$amp_analytics$0_1$events$$);
$IniLoadTracker$$module$extensions$amp_analytics$0_1$events$$.prototype.$dispose$ = function() {
};
$IniLoadTracker$$module$extensions$amp_analytics$0_1$events$$.prototype.add = function($context$jscomp$27_promise$jscomp$35$$, $eventType$jscomp$40$$, $config$jscomp$38$$, $listener$jscomp$73$$) {
  var $$jscomp$this$jscomp$380$$ = this, $selector$jscomp$23$$ = $config$jscomp$38$$.selector || ":root";
  if (":root" == $selector$jscomp$23$$ || ":host" == $selector$jscomp$23$$) {
    var $target$jscomp$115$$ = this.$D$.$getRootElement$();
    $context$jscomp$27_promise$jscomp$35$$ = this.$getRootSignal$();
  } else {
    $context$jscomp$27_promise$jscomp$35$$ = $JSCompiler_StaticMethods_getAmpElement$$(this.$D$, $context$jscomp$27_promise$jscomp$35$$.parentElement || $context$jscomp$27_promise$jscomp$35$$, $selector$jscomp$23$$, $config$jscomp$38$$.selectionMethod).then(function($context$jscomp$27_promise$jscomp$35$$) {
      $target$jscomp$115$$ = $context$jscomp$27_promise$jscomp$35$$;
      return $$jscomp$this$jscomp$380$$.$getElementSignal$("ini-load", $target$jscomp$115$$);
    });
  }
  $context$jscomp$27_promise$jscomp$35$$.then(function() {
    $listener$jscomp$73$$(new $AnalyticsEvent$$module$extensions$amp_analytics$0_1$events$$($target$jscomp$115$$, $eventType$jscomp$40$$));
  });
  return $NO_UNLISTEN$$module$extensions$amp_analytics$0_1$events$$;
};
$IniLoadTracker$$module$extensions$amp_analytics$0_1$events$$.prototype.$getRootSignal$ = function() {
  return this.$D$.$AnalyticsRoot$$module$extensions$amp_analytics$0_1$analytics_root_prototype$whenIniLoaded$();
};
$IniLoadTracker$$module$extensions$amp_analytics$0_1$events$$.prototype.$getElementSignal$ = function($signals$jscomp$3_unusedEventType$jscomp$3$$, $element$jscomp$310$$) {
  if ("function" != typeof $element$jscomp$310$$.signals) {
    return window.Promise.resolve();
  }
  $signals$jscomp$3_unusedEventType$jscomp$3$$ = $element$jscomp$310$$.signals();
  return window.Promise.race([$signals$jscomp$3_unusedEventType$jscomp$3$$.whenSignal("ini-load"), $signals$jscomp$3_unusedEventType$jscomp$3$$.whenSignal("load-end")]);
};
$TimerEventHandler$$module$extensions$amp_analytics$0_1$events$$.prototype.init = function($startTimer$$) {
  this.$G$ ? this.$G$ && (this.$I$ = this.$G$()) : $startTimer$$();
};
$TimerEventHandler$$module$extensions$amp_analytics$0_1$events$$.prototype.$dispose$ = function() {
  this.$F$ && (this.$F$(), this.$F$ = null);
  $JSCompiler_StaticMethods_unlistenForStart_$$(this);
};
_.$$jscomp$inherits$$($TimerEventTracker$$module$extensions$amp_analytics$0_1$events$$, $EventTracker$$module$extensions$amp_analytics$0_1$events$$);
_.$JSCompiler_prototypeAlias$$ = $TimerEventTracker$$module$extensions$amp_analytics$0_1$events$$.prototype;
_.$JSCompiler_prototypeAlias$$.$dispose$ = function() {
  var $$jscomp$this$jscomp$381$$ = this;
  Object.keys(this.$F$).forEach(function($timerId$$) {
    $$jscomp$this$jscomp$381$$.$removeTracker_$($timerId$$);
  });
};
_.$JSCompiler_prototypeAlias$$.add = function($context$jscomp$28_timerHandler$$, $eventType$jscomp$41$$, $config$jscomp$39_timerSpec$jscomp$1$$, $listener$jscomp$74$$) {
  var $$jscomp$this$jscomp$382$$ = this;
  $config$jscomp$39_timerSpec$jscomp$1$$ = $config$jscomp$39_timerSpec$jscomp$1$$.timerSpec;
  var $timerStart$$ = "startSpec" in $config$jscomp$39_timerSpec$jscomp$1$$ ? $config$jscomp$39_timerSpec$jscomp$1$$.startSpec : null, $timerStop$$ = "stopSpec" in $config$jscomp$39_timerSpec$jscomp$1$$ ? $config$jscomp$39_timerSpec$jscomp$1$$.stopSpec : null, $timerId$jscomp$1$$ = ++this.$G$;
  if ($timerStart$$) {
    var $startBuilder_startTracker$$ = $JSCompiler_StaticMethods_getTracker_$$(this, $timerStart$$);
    $startBuilder_startTracker$$ = $startBuilder_startTracker$$.add.bind($startBuilder_startTracker$$, $context$jscomp$28_timerHandler$$, $timerStart$$.on, $timerStart$$, this.$handleTimerToggle_$.bind(this, $timerId$jscomp$1$$, $eventType$jscomp$41$$, $listener$jscomp$74$$));
  }
  if ($timerStop$$) {
    var $stopBuilder_stopTracker$$ = $JSCompiler_StaticMethods_getTracker_$$(this, $timerStop$$);
    $stopBuilder_stopTracker$$ = $stopBuilder_stopTracker$$.add.bind($stopBuilder_stopTracker$$, $context$jscomp$28_timerHandler$$, $timerStop$$.on, $timerStop$$, this.$handleTimerToggle_$.bind(this, $timerId$jscomp$1$$, $eventType$jscomp$41$$, $listener$jscomp$74$$));
  }
  $context$jscomp$28_timerHandler$$ = new $TimerEventHandler$$module$extensions$amp_analytics$0_1$events$$($config$jscomp$39_timerSpec$jscomp$1$$, $startBuilder_startTracker$$, $stopBuilder_stopTracker$$);
  this.$F$[$timerId$jscomp$1$$] = $context$jscomp$28_timerHandler$$;
  $context$jscomp$28_timerHandler$$.init(this.$startTimer_$.bind(this, $timerId$jscomp$1$$, $eventType$jscomp$41$$, $listener$jscomp$74$$));
  return function() {
    $$jscomp$this$jscomp$382$$.$removeTracker_$($timerId$jscomp$1$$);
  };
};
_.$JSCompiler_prototypeAlias$$.$handleTimerToggle_$ = function($timerId$jscomp$2$$, $eventType$jscomp$43$$, $listener$jscomp$75$$) {
  var $timerHandler$jscomp$1$$ = this.$F$[$timerId$jscomp$2$$];
  $timerHandler$jscomp$1$$ && ($timerHandler$jscomp$1$$.$D$ ? $JSCompiler_StaticMethods_TimerEventHandler$$module$extensions$amp_analytics$0_1$events_prototype$stopTimer_$$(this.$F$[$timerId$jscomp$2$$], this.$D$.ampdoc.$win$) : this.$startTimer_$($timerId$jscomp$2$$, $eventType$jscomp$43$$, $listener$jscomp$75$$));
};
_.$JSCompiler_prototypeAlias$$.$startTimer_$ = function($timerId$jscomp$3$$, $eventType$jscomp$44$$, $listener$jscomp$76$$) {
  var $$jscomp$this$jscomp$383$$ = this;
  $JSCompiler_StaticMethods_startIntervalInWindow$$(this.$F$[$timerId$jscomp$3$$], this.$D$.ampdoc.$win$, function() {
    var $JSCompiler_temp_const$jscomp$5618$$ = $$jscomp$this$jscomp$383$$.$D$.$getRootElement$(), $JSCompiler_StaticMethods_getTimerVars$self$jscomp$inline_6051$$ = $$jscomp$this$jscomp$383$$.$F$[$timerId$jscomp$3$$], $timerDuration$jscomp$inline_6052$$ = 0;
    $JSCompiler_StaticMethods_getTimerVars$self$jscomp$inline_6051$$.$D$ && ($timerDuration$jscomp$inline_6052$$ = $JSCompiler_StaticMethods_getTimerVars$self$jscomp$inline_6051$$.$J$ ? Date.now() - ($JSCompiler_StaticMethods_getTimerVars$self$jscomp$inline_6051$$.$K$ || $JSCompiler_StaticMethods_getTimerVars$self$jscomp$inline_6051$$.$J$) : 0, $JSCompiler_StaticMethods_getTimerVars$self$jscomp$inline_6051$$.$K$ = Date.now());
    $listener$jscomp$76$$(new $AnalyticsEvent$$module$extensions$amp_analytics$0_1$events$$($JSCompiler_temp_const$jscomp$5618$$, $eventType$jscomp$44$$, _.$dict$$module$src$utils$object$$({timerDuration:$timerDuration$jscomp$inline_6052$$, timerStart:$JSCompiler_StaticMethods_getTimerVars$self$jscomp$inline_6051$$.$J$ || 0})));
  }, this.$removeTracker_$.bind(this, $timerId$jscomp$3$$));
};
_.$JSCompiler_prototypeAlias$$.$removeTracker_$ = function($timerId$jscomp$6$$) {
  this.$F$[$timerId$jscomp$6$$] && ($JSCompiler_StaticMethods_TimerEventHandler$$module$extensions$amp_analytics$0_1$events_prototype$stopTimer_$$(this.$F$[$timerId$jscomp$6$$], this.$D$.ampdoc.$win$), this.$F$[$timerId$jscomp$6$$].$dispose$(), delete this.$F$[$timerId$jscomp$6$$]);
};
_.$$jscomp$inherits$$($VideoEventTracker$$module$extensions$amp_analytics$0_1$events$$, $EventTracker$$module$extensions$amp_analytics$0_1$events$$);
$VideoEventTracker$$module$extensions$amp_analytics$0_1$events$$.prototype.$dispose$ = function() {
  var $$jscomp$this$jscomp$385$$ = this, $root$jscomp$48$$ = this.$D$.$AnalyticsRoot$$module$extensions$amp_analytics$0_1$analytics_root_prototype$getRoot$();
  Object.keys($VideoAnalyticsEvents$$module$src$video_interface$$).forEach(function($key$jscomp$101$$) {
    $root$jscomp$48$$.removeEventListener($VideoAnalyticsEvents$$module$src$video_interface$$[$key$jscomp$101$$], $$jscomp$this$jscomp$385$$.$G$);
  });
  this.$F$ = this.$G$ = null;
};
$VideoEventTracker$$module$extensions$amp_analytics$0_1$events$$.prototype.add = function($context$jscomp$29$$, $eventType$jscomp$46_videoSpec$$, $config$jscomp$41$$, $listener$jscomp$77$$) {
  $eventType$jscomp$46_videoSpec$$ = $config$jscomp$41$$.videoSpec || {};
  var $targetReady$jscomp$1$$ = this.$D$.$getElement$($context$jscomp$29$$, $config$jscomp$41$$.selector || $eventType$jscomp$46_videoSpec$$.selector, $config$jscomp$41$$.selectionMethod || null), $endSessionWhenInvisible$$ = $eventType$jscomp$46_videoSpec$$["end-session-when-invisible"], $excludeAutoplay$$ = $eventType$jscomp$46_videoSpec$$["exclude-autoplay"], $interval$jscomp$6$$ = $eventType$jscomp$46_videoSpec$$.interval, $percentages$$ = $eventType$jscomp$46_videoSpec$$.percentages, $on$jscomp$7$$ = 
  $config$jscomp$41$$.on, $intervalCounter$$ = 0, $lastPercentage$$ = 0;
  return this.$F$.add(function($context$jscomp$29$$) {
    var $eventType$jscomp$46_videoSpec$$ = $context$jscomp$29$$.type, $config$jscomp$41$$ = "video-session-visible" === $eventType$jscomp$46_videoSpec$$, $normalizedType$$ = $config$jscomp$41$$ ? "video-session" : $eventType$jscomp$46_videoSpec$$, $event$jscomp$76$$ = $context$jscomp$29$$.data;
    if ($normalizedType$$ === $on$jscomp$7$$) {
      if ("video-seconds-played" !== $normalizedType$$ || $interval$jscomp$6$$) {
        if ("video-seconds-played" === $normalizedType$$ && ($intervalCounter$$++, 0 !== $intervalCounter$$ % $interval$jscomp$6$$)) {
          return;
        }
        if ("video-percentage-played" === $normalizedType$$) {
          if (!$percentages$$) {
            _.$user$$module$src$log$$().error("amp-analytics/events", "video-percentage-played requires percentages spec.");
            return;
          }
          for ($eventType$jscomp$46_videoSpec$$ = 0; $eventType$jscomp$46_videoSpec$$ < $percentages$$.length; $eventType$jscomp$46_videoSpec$$++) {
            var $percentage$jscomp$1$$ = $percentages$$[$eventType$jscomp$46_videoSpec$$];
            if (0 >= $percentage$jscomp$1$$ || 0 != $percentage$jscomp$1$$ % 5) {
              _.$user$$module$src$log$$().error("amp-analytics/events", "Percentages must be set in increments of %s with non-zero values", 5);
              return;
            }
          }
          $eventType$jscomp$46_videoSpec$$ = (0,window.parseInt)($event$jscomp$76$$.normalizedPercentage, 10);
          if ($lastPercentage$$ == $eventType$jscomp$46_videoSpec$$ || 0 > $percentages$$.indexOf($eventType$jscomp$46_videoSpec$$)) {
            return;
          }
          $lastPercentage$$ = $eventType$jscomp$46_videoSpec$$;
        }
        if (!$config$jscomp$41$$ || $endSessionWhenInvisible$$) {
          if (!$excludeAutoplay$$ || "playing_auto" !== $event$jscomp$76$$.state) {
            var $el$jscomp$36$$ = $context$jscomp$29$$.target;
            $targetReady$jscomp$1$$.then(function($context$jscomp$29$$) {
              $context$jscomp$29$$.contains($el$jscomp$36$$) && $listener$jscomp$77$$(new $AnalyticsEvent$$module$extensions$amp_analytics$0_1$events$$($context$jscomp$29$$, $normalizedType$$, $event$jscomp$76$$));
            });
          }
        }
      } else {
        _.$user$$module$src$log$$().error("amp-analytics/events", "video-seconds-played requires interval spec with non-zero value");
      }
    }
  });
};
_.$$jscomp$inherits$$($VisibilityTracker$$module$extensions$amp_analytics$0_1$events$$, $EventTracker$$module$extensions$amp_analytics$0_1$events$$);
_.$JSCompiler_prototypeAlias$$ = $VisibilityTracker$$module$extensions$amp_analytics$0_1$events$$.prototype;
_.$JSCompiler_prototypeAlias$$.$dispose$ = function() {
};
_.$JSCompiler_prototypeAlias$$.add = function($context$jscomp$30$$, $eventType$jscomp$47$$, $config$jscomp$42$$, $listener$jscomp$78$$) {
  var $$jscomp$this$jscomp$386$$ = this, $visibilitySpec$$ = $config$jscomp$42$$.visibilitySpec || {}, $selector$jscomp$25$$ = $config$jscomp$42$$.selector || $visibilitySpec$$.selector, $waitForSpec$$ = $visibilitySpec$$.waitFor, $reportWhenSpec$$ = $visibilitySpec$$.reportWhen, $visibilityManager$$ = $JSCompiler_StaticMethods_getVisibilityManager$$(this.$D$), $createReportReadyPromiseFunc$$ = null;
  "hidden" == $eventType$jscomp$47$$ && ($reportWhenSpec$$ && _.$user$$module$src$log$$().error("amp-analytics/events", 'ReportWhen should not be defined when eventType is "hidden"'), $reportWhenSpec$$ = "documentHidden");
  "documentHidden" == $reportWhenSpec$$ ? $createReportReadyPromiseFunc$$ = this.$createReportReadyPromiseForDocumentHidden_$.bind(this) : "documentExit" == $reportWhenSpec$$ && ($createReportReadyPromiseFunc$$ = this.$createReportReadyPromiseForDocumentExit_$.bind(this));
  if (!$selector$jscomp$25$$ || ":root" == $selector$jscomp$25$$ || ":host" == $selector$jscomp$25$$) {
    return $JSCompiler_StaticMethods_listenRoot$$($visibilityManager$$, $visibilitySpec$$, $JSCompiler_StaticMethods_VisibilityTracker$$module$extensions$amp_analytics$0_1$events_prototype$getReadyPromise$$(this, $waitForSpec$$, $selector$jscomp$25$$), $createReportReadyPromiseFunc$$, this.$onEvent_$.bind(this, $eventType$jscomp$47$$, $listener$jscomp$78$$, this.$D$.$getRootElement$()));
  }
  var $unlistenPromise$$ = $JSCompiler_StaticMethods_getAmpElement$$(this.$D$, $context$jscomp$30$$.parentElement || $context$jscomp$30$$, $selector$jscomp$25$$, $config$jscomp$42$$.selectionMethod || $visibilitySpec$$.selectionMethod).then(function($context$jscomp$30$$) {
    var $config$jscomp$42$$ = $JSCompiler_StaticMethods_VisibilityTracker$$module$extensions$amp_analytics$0_1$events_prototype$getReadyPromise$$($$jscomp$this$jscomp$386$$, $waitForSpec$$, $selector$jscomp$25$$, $context$jscomp$30$$), $reportWhenSpec$$ = $createReportReadyPromiseFunc$$, $callback$jscomp$inline_2511$$ = $$jscomp$this$jscomp$386$$.$onEvent_$.bind($$jscomp$this$jscomp$386$$, $eventType$jscomp$47$$, $listener$jscomp$78$$, $context$jscomp$30$$), $unlistenPromise$$ = $visibilityManager$$.$getElementVisibility$.bind($visibilityManager$$, 
    $context$jscomp$30$$);
    return $JSCompiler_StaticMethods_createModelAndListen_$$($visibilityManager$$, $unlistenPromise$$, $visibilitySpec$$, $config$jscomp$42$$, $reportWhenSpec$$, $callback$jscomp$inline_2511$$, $context$jscomp$30$$);
  });
  return function() {
    $unlistenPromise$$.then(function($context$jscomp$30$$) {
      $context$jscomp$30$$();
    });
  };
};
_.$JSCompiler_prototypeAlias$$.$createReportReadyPromiseForDocumentHidden_$ = function() {
  var $viewer$jscomp$34$$ = _.$Services$$module$src$services$viewerForDoc$$(this.$D$.ampdoc);
  return _.$JSCompiler_StaticMethods_Viewer$$module$src$service$viewer_impl_prototype$isVisible$$($viewer$jscomp$34$$) ? new window.Promise(function($resolve$jscomp$53$$) {
    _.$JSCompiler_StaticMethods_Viewer$$module$src$service$viewer_impl_prototype$onVisibilityChanged$$($viewer$jscomp$34$$, function() {
      _.$JSCompiler_StaticMethods_Viewer$$module$src$service$viewer_impl_prototype$isVisible$$($viewer$jscomp$34$$) || $resolve$jscomp$53$$();
    });
  }) : window.Promise.resolve();
};
_.$JSCompiler_prototypeAlias$$.$createReportReadyPromiseForDocumentExit_$ = function() {
  var $deferred$jscomp$31$$ = new _.$Deferred$$module$src$utils$promise$$, $win$jscomp$307$$ = this.$D$.ampdoc.$win$, $unloadListener$$, $pageHideListener$$;
  $win$jscomp$307$$.addEventListener("unload", $unloadListener$$ = function() {
    $win$jscomp$307$$.removeEventListener("unload", $unloadListener$$);
    $deferred$jscomp$31$$.resolve();
  });
  $win$jscomp$307$$.addEventListener("pagehide", $pageHideListener$$ = function() {
    $win$jscomp$307$$.removeEventListener("pagehide", $pageHideListener$$);
    $deferred$jscomp$31$$.resolve();
  });
  return $deferred$jscomp$31$$.$promise$;
};
_.$JSCompiler_prototypeAlias$$.$onEvent_$ = function($eventType$jscomp$48$$, $listener$jscomp$79$$, $target$jscomp$117$$, $state$jscomp$43$$) {
  var $attr$jscomp$13$$ = _.$getDataParamsFromAttributes$$module$src$dom$$($target$jscomp$117$$, void 0, $VARIABLE_DATA_ATTRIBUTE_KEY$$module$extensions$amp_analytics$0_1$events$$), $key$jscomp$102$$;
  for ($key$jscomp$102$$ in $attr$jscomp$13$$) {
    $state$jscomp$43$$[$key$jscomp$102$$] = $attr$jscomp$13$$[$key$jscomp$102$$];
  }
  $listener$jscomp$79$$(new $AnalyticsEvent$$module$extensions$amp_analytics$0_1$events$$($target$jscomp$117$$, $eventType$jscomp$48$$, $state$jscomp$43$$));
};
$AnalyticsGroup$$module$extensions$amp_analytics$0_1$analytics_group$$.prototype.$dispose$ = function() {
  this.$D$.forEach(function($listener$jscomp$80$$) {
    $listener$jscomp$80$$();
  });
};
$ScrollManager$$module$extensions$amp_analytics$0_1$scroll_manager$$.prototype.$dispose$ = function() {
  _.$JSCompiler_StaticMethods_removeAll$$(this.$F$);
  this.$D$ && (this.$D$(), this.$D$ = null);
};
$ScrollManager$$module$extensions$amp_analytics$0_1$scroll_manager$$.prototype.$G$ = function($e$jscomp$123_scrollEvent$jscomp$1$$) {
  $e$jscomp$123_scrollEvent$jscomp$1$$ = {top:$e$jscomp$123_scrollEvent$jscomp$1$$.top, left:$e$jscomp$123_scrollEvent$jscomp$1$$.left, width:$e$jscomp$123_scrollEvent$jscomp$1$$.width, height:$e$jscomp$123_scrollEvent$jscomp$1$$.height, scrollWidth:this.$viewport_$.getScrollWidth(), scrollHeight:this.$viewport_$.$getScrollHeight$()};
  this.$F$.$fire$($e$jscomp$123_scrollEvent$jscomp$1$$);
};
$VisibilityModel$$module$extensions$amp_analytics$0_1$visibility_model$$.prototype.$dispose$ = function() {
  this.$D$ && ((0,window.clearTimeout)(this.$D$), this.$D$ = null);
  this.$fa$ && ((0,window.clearTimeout)(this.$fa$), this.$fa$ = null);
  this.$ga$.forEach(function($unsubscribe$$) {
    $unsubscribe$$();
  });
  this.$ga$.length = 0;
  this.$O$ = null;
  this.$K$ && (_.$JSCompiler_StaticMethods_removeAll$$(this.$K$), this.$K$ = null);
};
$VisibilityModel$$module$extensions$amp_analytics$0_1$visibility_model$$.prototype.unsubscribe = function($handler$jscomp$41$$) {
  this.$ga$.push($handler$jscomp$41$$);
};
$VisibilityModel$$module$extensions$amp_analytics$0_1$visibility_model$$.prototype.update = function() {
  $JSCompiler_StaticMethods_VisibilityModel$$module$extensions$amp_analytics$0_1$visibility_model_prototype$update_$$(this, this.$ready_$ ? this.$oa$() : 0);
};
var $visibilityIdCounter$$module$extensions$amp_analytics$0_1$visibility_manager$$ = 1;
$VisibilityManager$$module$extensions$amp_analytics$0_1$visibility_manager$$.prototype.$dispose$ = function() {
  this.$I$(0);
  for (var $i$215_i$jscomp$207$$ = this.$D$.length - 1; 0 <= $i$215_i$jscomp$207$$; $i$215_i$jscomp$207$$--) {
    this.$D$[$i$215_i$jscomp$207$$].$dispose$();
  }
  this.$J$.forEach(function($i$215_i$jscomp$207$$) {
    $i$215_i$jscomp$207$$();
  });
  this.$J$.length = 0;
  this.parent && $JSCompiler_StaticMethods_removeChild_$$(this.parent, this);
  if (this.$children_$) {
    for ($i$215_i$jscomp$207$$ = 0; $i$215_i$jscomp$207$$ < this.$children_$.length; $i$215_i$jscomp$207$$++) {
      this.$children_$[$i$215_i$jscomp$207$$].$dispose$();
    }
  }
};
$VisibilityManager$$module$extensions$amp_analytics$0_1$visibility_manager$$.prototype.unsubscribe = function($handler$jscomp$43$$) {
  this.$J$.push($handler$jscomp$43$$);
};
$VisibilityManager$$module$extensions$amp_analytics$0_1$visibility_manager$$.prototype.$G$ = function() {
  return this.parent ? 0 < this.parent.$G$() ? this.$K$ : 0 : this.$K$;
};
$VisibilityManager$$module$extensions$amp_analytics$0_1$visibility_manager$$.prototype.$I$ = function($i$jscomp$208_visibility$jscomp$4$$) {
  this.$K$ = $i$jscomp$208_visibility$jscomp$4$$;
  $JSCompiler_StaticMethods_updateModels_$$(this);
  if (this.$children_$) {
    for ($i$jscomp$208_visibility$jscomp$4$$ = 0; $i$jscomp$208_visibility$jscomp$4$$ < this.$children_$.length; $i$jscomp$208_visibility$jscomp$4$$++) {
      $JSCompiler_StaticMethods_updateModels_$$(this.$children_$[$i$jscomp$208_visibility$jscomp$4$$]);
    }
  }
};
_.$$jscomp$inherits$$($VisibilityManagerForDoc$$module$extensions$amp_analytics$0_1$visibility_manager$$, $VisibilityManager$$module$extensions$amp_analytics$0_1$visibility_manager$$);
_.$JSCompiler_prototypeAlias$$ = $VisibilityManagerForDoc$$module$extensions$amp_analytics$0_1$visibility_manager$$.prototype;
_.$JSCompiler_prototypeAlias$$.$dispose$ = function() {
  $VisibilityManager$$module$extensions$amp_analytics$0_1$visibility_manager$$.prototype.$dispose$.call(this);
  this.$intersectionObserver_$ && (this.$intersectionObserver_$.disconnect(), this.$intersectionObserver_$ = null);
};
_.$JSCompiler_prototypeAlias$$.$VisibilityManager$$module$extensions$amp_analytics$0_1$visibility_manager_prototype$getStartTime$ = function() {
  return this.$viewer_$.$Y$;
};
_.$JSCompiler_prototypeAlias$$.$isBackgrounded$ = function() {
  return this.$O$;
};
_.$JSCompiler_prototypeAlias$$.$isBackgroundedAtStart$ = function() {
  return this.$P$;
};
_.$JSCompiler_prototypeAlias$$.$getRootMinOpacity$ = function() {
  var $root$jscomp$52$$ = this.ampdoc.getRootNode();
  return $getMinOpacity$$module$extensions$amp_analytics$0_1$opacity$$($root$jscomp$52$$.documentElement || $root$jscomp$52$$.body || $root$jscomp$52$$);
};
_.$JSCompiler_prototypeAlias$$.$getRootLayoutBox$ = function() {
  var $root$jscomp$53$$ = this.ampdoc.getRootNode();
  return this.$viewport_$.$getLayoutRect$($root$jscomp$53$$.documentElement || $root$jscomp$53$$.body || $root$jscomp$53$$);
};
_.$JSCompiler_prototypeAlias$$.observe = function($element$jscomp$315$$, $listener$jscomp$81$$) {
  var $$jscomp$this$jscomp$392$$ = this;
  $JSCompiler_StaticMethods_polyfillAmpElementIfNeeded_$$(this, $element$jscomp$315$$);
  var $id$jscomp$53$$ = $getElementId$$module$extensions$amp_analytics$0_1$visibility_manager$$($element$jscomp$315$$), $trackedElement$$ = this.$F$[$id$jscomp$53$$];
  $trackedElement$$ ? 0 < $trackedElement$$.intersectionRatio && $listener$jscomp$81$$($trackedElement$$.intersectionRatio) : ($trackedElement$$ = {element:$element$jscomp$315$$, intersectionRatio:0, intersectionRect:null, $listeners$:[]}, this.$F$[$id$jscomp$53$$] = $trackedElement$$);
  $trackedElement$$.$listeners$.push($listener$jscomp$81$$);
  this.$intersectionObserver_$ || (this.$intersectionObserver_$ = $JSCompiler_StaticMethods_createIntersectionObserver_$$(this));
  this.$intersectionObserver_$.observe($element$jscomp$315$$);
  return function() {
    var $trackedElement$$ = $$jscomp$this$jscomp$392$$.$F$[$id$jscomp$53$$];
    if ($trackedElement$$) {
      var $index$jscomp$90$$ = $trackedElement$$.$listeners$.indexOf($listener$jscomp$81$$);
      -1 != $index$jscomp$90$$ && $trackedElement$$.$listeners$.splice($index$jscomp$90$$, 1);
      0 == $trackedElement$$.$listeners$.length && ($$jscomp$this$jscomp$392$$.$intersectionObserver_$.unobserve($element$jscomp$315$$), delete $$jscomp$this$jscomp$392$$.$F$[$id$jscomp$53$$]);
    }
  };
};
_.$JSCompiler_prototypeAlias$$.$getElementVisibility$ = function($element$jscomp$316_id$jscomp$54_trackedElement$jscomp$2$$) {
  if (0 == this.$G$()) {
    return 0;
  }
  $element$jscomp$316_id$jscomp$54_trackedElement$jscomp$2$$ = $getElementId$$module$extensions$amp_analytics$0_1$visibility_manager$$($element$jscomp$316_id$jscomp$54_trackedElement$jscomp$2$$);
  return ($element$jscomp$316_id$jscomp$54_trackedElement$jscomp$2$$ = this.$F$[$element$jscomp$316_id$jscomp$54_trackedElement$jscomp$2$$]) && $element$jscomp$316_id$jscomp$54_trackedElement$jscomp$2$$.intersectionRatio || 0;
};
_.$JSCompiler_prototypeAlias$$.$getElementIntersectionRect$ = function($element$jscomp$317_id$jscomp$55_trackedElement$jscomp$3$$) {
  if (0 >= this.$getElementVisibility$($element$jscomp$317_id$jscomp$55_trackedElement$jscomp$3$$)) {
    return null;
  }
  $element$jscomp$317_id$jscomp$55_trackedElement$jscomp$3$$ = $getElementId$$module$extensions$amp_analytics$0_1$visibility_manager$$($element$jscomp$317_id$jscomp$55_trackedElement$jscomp$3$$);
  return ($element$jscomp$317_id$jscomp$55_trackedElement$jscomp$3$$ = this.$F$[$element$jscomp$317_id$jscomp$55_trackedElement$jscomp$3$$]) ? $element$jscomp$317_id$jscomp$55_trackedElement$jscomp$3$$.intersectionRect : null;
};
_.$JSCompiler_prototypeAlias$$.$onIntersectionChanges_$ = function($entries$jscomp$3$$) {
  var $$jscomp$this$jscomp$395$$ = this;
  $entries$jscomp$3$$.forEach(function($entries$jscomp$3$$) {
    var $change$jscomp$4_id$jscomp$inline_2536_trackedElement$jscomp$inline_2537$$ = $entries$jscomp$3$$.intersectionRect;
    $change$jscomp$4_id$jscomp$inline_2536_trackedElement$jscomp$inline_2537$$ = _.$layoutRectLtwh$$module$src$layout_rect$$(Number($change$jscomp$4_id$jscomp$inline_2536_trackedElement$jscomp$inline_2537$$.left), Number($change$jscomp$4_id$jscomp$inline_2536_trackedElement$jscomp$inline_2537$$.top), Number($change$jscomp$4_id$jscomp$inline_2536_trackedElement$jscomp$inline_2537$$.width), Number($change$jscomp$4_id$jscomp$inline_2536_trackedElement$jscomp$inline_2537$$.height));
    var $intersectionRatio$jscomp$inline_2534$$ = $entries$jscomp$3$$.intersectionRatio;
    $intersectionRatio$jscomp$inline_2534$$ = Math.min(Math.max($intersectionRatio$jscomp$inline_2534$$, 0), 1);
    $entries$jscomp$3$$ = $getElementId$$module$extensions$amp_analytics$0_1$visibility_manager$$($entries$jscomp$3$$.target);
    if ($entries$jscomp$3$$ = $$jscomp$this$jscomp$395$$.$F$[$entries$jscomp$3$$]) {
      for ($entries$jscomp$3$$.intersectionRatio = $intersectionRatio$jscomp$inline_2534$$, $entries$jscomp$3$$.intersectionRect = $change$jscomp$4_id$jscomp$inline_2536_trackedElement$jscomp$inline_2537$$, $change$jscomp$4_id$jscomp$inline_2536_trackedElement$jscomp$inline_2537$$ = 0; $change$jscomp$4_id$jscomp$inline_2536_trackedElement$jscomp$inline_2537$$ < $entries$jscomp$3$$.$listeners$.length; $change$jscomp$4_id$jscomp$inline_2536_trackedElement$jscomp$inline_2537$$++) {
        $entries$jscomp$3$$.$listeners$[$change$jscomp$4_id$jscomp$inline_2536_trackedElement$jscomp$inline_2537$$]($intersectionRatio$jscomp$inline_2534$$);
      }
    }
  });
};
_.$$jscomp$inherits$$($VisibilityManagerForEmbed$$module$extensions$amp_analytics$0_1$visibility_manager$$, $VisibilityManager$$module$extensions$amp_analytics$0_1$visibility_manager$$);
_.$JSCompiler_prototypeAlias$$ = $VisibilityManagerForEmbed$$module$extensions$amp_analytics$0_1$visibility_manager$$.prototype;
_.$JSCompiler_prototypeAlias$$.$VisibilityManager$$module$extensions$amp_analytics$0_1$visibility_manager_prototype$getStartTime$ = function() {
  return this.embed.$G$;
};
_.$JSCompiler_prototypeAlias$$.$isBackgrounded$ = function() {
  return this.parent.$isBackgrounded$();
};
_.$JSCompiler_prototypeAlias$$.$isBackgroundedAtStart$ = function() {
  return this.$F$;
};
_.$JSCompiler_prototypeAlias$$.$getRootMinOpacity$ = function() {
  return $getMinOpacity$$module$extensions$amp_analytics$0_1$opacity$$(this.embed.iframe);
};
_.$JSCompiler_prototypeAlias$$.$getRootLayoutBox$ = function() {
  var $rootElement$jscomp$4$$ = this.embed.iframe;
  return _.$Services$$module$src$services$viewportForDoc$$(this.ampdoc).$getLayoutRect$($rootElement$jscomp$4$$);
};
_.$JSCompiler_prototypeAlias$$.observe = function($element$jscomp$319$$, $listener$jscomp$82$$) {
  return this.parent.observe($element$jscomp$319$$, $listener$jscomp$82$$);
};
_.$JSCompiler_prototypeAlias$$.$getElementVisibility$ = function($element$jscomp$320$$) {
  return 0 == this.$G$() ? 0 : this.parent.$getElementVisibility$($element$jscomp$320$$);
};
_.$JSCompiler_prototypeAlias$$.$getElementIntersectionRect$ = function($element$jscomp$321$$) {
  return 0 == this.$G$() ? null : this.parent.$getElementIntersectionRect$($element$jscomp$321$$);
};
$AnalyticsRoot$$module$extensions$amp_analytics$0_1$analytics_root$$.prototype.$dispose$ = function() {
  for (var $k$jscomp$23$$ in this.$D$) {
    this.$D$[$k$jscomp$23$$].$dispose$(), delete this.$D$[$k$jscomp$23$$];
  }
  this.$G$ && this.$G$.$dispose$();
  this.$F$ && this.$F$.$dispose$();
};
$AnalyticsRoot$$module$extensions$amp_analytics$0_1$analytics_root$$.prototype.$getRootElement$ = function() {
  var $root$jscomp$54$$ = this.$AnalyticsRoot$$module$extensions$amp_analytics$0_1$analytics_root_prototype$getRoot$();
  return $root$jscomp$54$$.documentElement || $root$jscomp$54$$.body || $root$jscomp$54$$;
};
$AnalyticsRoot$$module$extensions$amp_analytics$0_1$analytics_root$$.prototype.contains = function($node$jscomp$63$$) {
  return this.$AnalyticsRoot$$module$extensions$amp_analytics$0_1$analytics_root_prototype$getRoot$().contains($node$jscomp$63$$);
};
$AnalyticsRoot$$module$extensions$amp_analytics$0_1$analytics_root$$.prototype.$getElement$ = function($context$jscomp$31$$, $selector$jscomp$27$$, $selectionMethod$jscomp$6$$) {
  var $$jscomp$this$jscomp$396$$ = this;
  $selectionMethod$jscomp$6$$ = void 0 === $selectionMethod$jscomp$6$$ ? null : $selectionMethod$jscomp$6$$;
  return ":root" == $selector$jscomp$27$$ ? _.$tryResolve$$module$src$utils$promise$$(function() {
    return $$jscomp$this$jscomp$396$$.$getRootElement$();
  }) : ":host" == $selector$jscomp$27$$ ? new window.Promise(function($context$jscomp$31$$) {
    $context$jscomp$31$$(_.$JSCompiler_StaticMethods_assertElement$$(_.$user$$module$src$log$$(), $$jscomp$this$jscomp$396$$.$getHostElement$(), 'Element "' + $selector$jscomp$27$$ + '" not found'));
  }) : this.ampdoc.$whenReady$().then(function() {
    var $result$jscomp$34$$ = null;
    try {
      var $found$jscomp$2$$ = "scope" == $selectionMethod$jscomp$6$$ ? _.$scopedQuerySelector$$module$src$dom$$($context$jscomp$31$$, $selector$jscomp$27$$) : "closest" == $selectionMethod$jscomp$6$$ ? _.$closestBySelector$$module$src$dom$$($context$jscomp$31$$, $selector$jscomp$27$$) : $$jscomp$this$jscomp$396$$.$AnalyticsRoot$$module$extensions$amp_analytics$0_1$analytics_root_prototype$getRoot$().querySelector($selector$jscomp$27$$);
    } catch ($e$217$$) {
    }
    $found$jscomp$2$$ && $$jscomp$this$jscomp$396$$.contains($found$jscomp$2$$) && ($result$jscomp$34$$ = $found$jscomp$2$$);
    return _.$JSCompiler_StaticMethods_assertElement$$(_.$user$$module$src$log$$(), $result$jscomp$34$$, 'Element "' + $selector$jscomp$27$$ + '" not found');
  });
};
_.$$jscomp$inherits$$($AmpdocAnalyticsRoot$$module$extensions$amp_analytics$0_1$analytics_root$$, $AnalyticsRoot$$module$extensions$amp_analytics$0_1$analytics_root$$);
_.$JSCompiler_prototypeAlias$$ = $AmpdocAnalyticsRoot$$module$extensions$amp_analytics$0_1$analytics_root$$.prototype;
_.$JSCompiler_prototypeAlias$$.$getType$ = function() {
  return "ampdoc";
};
_.$JSCompiler_prototypeAlias$$.$AnalyticsRoot$$module$extensions$amp_analytics$0_1$analytics_root_prototype$getRoot$ = function() {
  return this.ampdoc.getRootNode();
};
_.$JSCompiler_prototypeAlias$$.$getHostElement$ = function() {
  return null;
};
_.$JSCompiler_prototypeAlias$$.signals = function() {
  return this.ampdoc.signals();
};
_.$JSCompiler_prototypeAlias$$.getElementById = function($id$jscomp$57$$) {
  return this.ampdoc.getElementById($id$jscomp$57$$);
};
_.$JSCompiler_prototypeAlias$$.$AnalyticsRoot$$module$extensions$amp_analytics$0_1$analytics_root_prototype$whenIniLoaded$ = function() {
  var $rect$jscomp$15_size$jscomp$26_viewport$jscomp$15$$ = _.$Services$$module$src$services$viewportForDoc$$(this.ampdoc);
  "inabox" == _.$getMode$$module$src$mode$$(this.ampdoc.$win$).runtime ? $rect$jscomp$15_size$jscomp$26_viewport$jscomp$15$$ = $rect$jscomp$15_size$jscomp$26_viewport$jscomp$15$$.$getLayoutRect$(this.$getRootElement$()) : ($rect$jscomp$15_size$jscomp$26_viewport$jscomp$15$$ = $rect$jscomp$15_size$jscomp$26_viewport$jscomp$15$$.$getSize$(), $rect$jscomp$15_size$jscomp$26_viewport$jscomp$15$$ = _.$layoutRectLtwh$$module$src$layout_rect$$(0, 0, $rect$jscomp$15_size$jscomp$26_viewport$jscomp$15$$.width, 
  $rect$jscomp$15_size$jscomp$26_viewport$jscomp$15$$.height));
  return _.$whenContentIniLoad$$module$src$friendly_iframe_embed$$(this.ampdoc, this.ampdoc.$win$, $rect$jscomp$15_size$jscomp$26_viewport$jscomp$15$$);
};
_.$JSCompiler_prototypeAlias$$.$createVisibilityManager$ = function() {
  return new $VisibilityManagerForDoc$$module$extensions$amp_analytics$0_1$visibility_manager$$(this.ampdoc);
};
_.$$jscomp$inherits$$($EmbedAnalyticsRoot$$module$extensions$amp_analytics$0_1$analytics_root$$, $AnalyticsRoot$$module$extensions$amp_analytics$0_1$analytics_root$$);
_.$JSCompiler_prototypeAlias$$ = $EmbedAnalyticsRoot$$module$extensions$amp_analytics$0_1$analytics_root$$.prototype;
_.$JSCompiler_prototypeAlias$$.$getType$ = function() {
  return "embed";
};
_.$JSCompiler_prototypeAlias$$.$AnalyticsRoot$$module$extensions$amp_analytics$0_1$analytics_root_prototype$getRoot$ = function() {
  return this.embed.$win$.document;
};
_.$JSCompiler_prototypeAlias$$.$getHostElement$ = function() {
  return this.embed.iframe;
};
_.$JSCompiler_prototypeAlias$$.signals = function() {
  return this.embed.signals();
};
_.$JSCompiler_prototypeAlias$$.getElementById = function($id$jscomp$58$$) {
  return this.embed.$win$.document.getElementById($id$jscomp$58$$);
};
_.$JSCompiler_prototypeAlias$$.$AnalyticsRoot$$module$extensions$amp_analytics$0_1$analytics_root_prototype$whenIniLoaded$ = function() {
  return this.embed.$FriendlyIframeEmbed$$module$src$friendly_iframe_embed_prototype$whenIniLoaded$();
};
_.$JSCompiler_prototypeAlias$$.$createVisibilityManager$ = function() {
  return new $VisibilityManagerForEmbed$$module$extensions$amp_analytics$0_1$visibility_manager$$($JSCompiler_StaticMethods_getVisibilityManager$$(this.parent), this.embed);
};
$InstrumentationService$$module$extensions$amp_analytics$0_1$instrumentation$$.prototype.$dispose$ = function() {
  this.$D$.$dispose$();
};
$InstrumentationService$$module$extensions$amp_analytics$0_1$instrumentation$$.prototype.$F$ = function($target$jscomp$120$$, $event$jscomp$78_eventType$jscomp$50$$, $opt_vars$jscomp$7$$) {
  $event$jscomp$78_eventType$jscomp$50$$ = new $AnalyticsEvent$$module$extensions$amp_analytics$0_1$events$$($target$jscomp$120$$, $event$jscomp$78_eventType$jscomp$50$$, $opt_vars$jscomp$7$$);
  $JSCompiler_StaticMethods_getTracker$$($JSCompiler_StaticMethods_findRoot_$$(this, $target$jscomp$120$$), "custom", $CustomEventTracker$$module$extensions$amp_analytics$0_1$events$$).$trigger$($event$jscomp$78_eventType$jscomp$50$$);
};
$LinkerManager$$module$extensions$amp_analytics$0_1$linker_manager$$.prototype.init = function() {
  var $$jscomp$this$jscomp$399$$ = this;
  if (_.$isObject$$module$src$types$$(this.$config_$)) {
    return this.$config_$ = $JSCompiler_StaticMethods_processConfig_$$(this, this.$config_$), this.$I$ = Object.keys(this.$config_$).map(function($name$jscomp$204$$) {
      var $ids$jscomp$3$$ = $$jscomp$this$jscomp$399$$.$config_$[$name$jscomp$204$$].ids, $keys$jscomp$8$$ = Object.keys($ids$jscomp$3$$), $valuePromises$$ = $keys$jscomp$8$$.map(function($name$jscomp$204$$) {
        return $JSCompiler_StaticMethods_LinkerManager$$module$extensions$amp_analytics$0_1$linker_manager_prototype$expandTemplateWithUrlParams_$$($$jscomp$this$jscomp$399$$, $ids$jscomp$3$$[$name$jscomp$204$$], new $ExpansionOptions$$module$extensions$amp_analytics$0_1$variables$$($$jscomp$this$jscomp$399$$.$K$, void 0, !0));
      });
      return window.Promise.all($valuePromises$$).then(function($ids$jscomp$3$$) {
        var $valuePromises$$ = {};
        $ids$jscomp$3$$.forEach(function($$jscomp$this$jscomp$399$$, $name$jscomp$204$$) {
          $$jscomp$this$jscomp$399$$ && ($valuePromises$$[$keys$jscomp$8$$[$name$jscomp$204$$]] = $$jscomp$this$jscomp$399$$);
        });
        $$jscomp$this$jscomp$399$$.$F$[$name$jscomp$204$$] = $valuePromises$$;
      });
    }), this.$I$.length && _.$JSCompiler_StaticMethods_registerAnchorMutator$$(_.$Services$$module$src$services$navigationForDoc$$(this.$ampdoc_$), this.$O$.bind(this), 2), _.$isExperimentOn$$module$src$experiments$$(this.$ampdoc_$.$win$, "linker-form") && $JSCompiler_StaticMethods_enableFormSupport_$$(this), window.Promise.all(this.$I$);
  }
};
$LinkerManager$$module$extensions$amp_analytics$0_1$linker_manager$$.prototype.$dispose$ = function() {
  this.$D$ && this.$D$();
};
$LinkerManager$$module$extensions$amp_analytics$0_1$linker_manager$$.prototype.$O$ = function($element$jscomp$324$$, $event$jscomp$79_linkerConfigs$$) {
  if ($element$jscomp$324$$.href && "click" === $event$jscomp$79_linkerConfigs$$.type) {
    $event$jscomp$79_linkerConfigs$$ = this.$config_$;
    for (var $linkerName$$ in $event$jscomp$79_linkerConfigs$$) {
      if (this.$F$[$linkerName$$]) {
        var $el$jscomp$inline_2547$$ = $element$jscomp$324$$, $name$jscomp$inline_2548$$ = $linkerName$$, $href$jscomp$inline_2550$$ = $el$jscomp$inline_2547$$.href;
        if ($JSCompiler_StaticMethods_isDomainMatch_$$(this, $el$jscomp$inline_2547$$.hostname, $name$jscomp$inline_2548$$, $event$jscomp$79_linkerConfigs$$[$linkerName$$].destinationDomains)) {
          var $linkerValue$jscomp$inline_2551$$ = $createLinker$$module$extensions$amp_analytics$0_1$linker$$(this.$F$[$name$jscomp$inline_2548$$]);
          if ($linkerValue$jscomp$inline_2551$$) {
            var $params$jscomp$inline_2552$$ = {};
            $params$jscomp$inline_2552$$[$name$jscomp$inline_2548$$] = $linkerValue$jscomp$inline_2551$$;
            $el$jscomp$inline_2547$$.href = _.$addMissingParamsToUrl$$module$src$url$$($href$jscomp$inline_2550$$, $params$jscomp$inline_2552$$);
          }
        }
      }
    }
  }
};
$LinkerManager$$module$extensions$amp_analytics$0_1$linker_manager$$.prototype.$P$ = function($actionXhrMutator_event$jscomp$80$$) {
  var $form$jscomp$3$$ = $actionXhrMutator_event$jscomp$80$$.form;
  $actionXhrMutator_event$jscomp$80$$ = $actionXhrMutator_event$jscomp$80$$.$actionXhrMutator$;
  for (var $linkerName$jscomp$1$$ in this.$config_$) {
    var $decoratedUrl$jscomp$inline_2561_domains$jscomp$2_inputEl$jscomp$inline_6059_linkerName$jscomp$inline_2557$$ = this.$config_$[$linkerName$jscomp$1$$].destinationDomains, $hostname$jscomp$4_ids$jscomp$inline_2558_linkerValue$jscomp$inline_2559_url$jscomp$168$$ = $form$jscomp$3$$.getAttribute("action-xhr") || $form$jscomp$3$$.getAttribute("action");
    $hostname$jscomp$4_ids$jscomp$inline_2558_linkerValue$jscomp$inline_2559_url$jscomp$168$$ = this.$G$.parse($hostname$jscomp$4_ids$jscomp$inline_2558_linkerValue$jscomp$inline_2559_url$jscomp$168$$).hostname;
    if ($JSCompiler_StaticMethods_isDomainMatch_$$(this, $hostname$jscomp$4_ids$jscomp$inline_2558_linkerValue$jscomp$inline_2559_url$jscomp$168$$, $linkerName$jscomp$1$$, $decoratedUrl$jscomp$inline_2561_domains$jscomp$2_inputEl$jscomp$inline_6059_linkerName$jscomp$inline_2557$$) && ($decoratedUrl$jscomp$inline_2561_domains$jscomp$2_inputEl$jscomp$inline_6059_linkerName$jscomp$inline_2557$$ = $linkerName$jscomp$1$$, $hostname$jscomp$4_ids$jscomp$inline_2558_linkerValue$jscomp$inline_2559_url$jscomp$168$$ = 
    this.$F$[$decoratedUrl$jscomp$inline_2561_domains$jscomp$2_inputEl$jscomp$inline_6059_linkerName$jscomp$inline_2557$$])) {
      $hostname$jscomp$4_ids$jscomp$inline_2558_linkerValue$jscomp$inline_2559_url$jscomp$168$$ = $createLinker$$module$extensions$amp_analytics$0_1$linker$$($hostname$jscomp$4_ids$jscomp$inline_2558_linkerValue$jscomp$inline_2559_url$jscomp$168$$);
      var $actionXhrUrl$jscomp$inline_2560$$ = $form$jscomp$3$$.getAttribute("action-xhr");
      $actionXhrUrl$jscomp$inline_2560$$ ? ($decoratedUrl$jscomp$inline_2561_domains$jscomp$2_inputEl$jscomp$inline_6059_linkerName$jscomp$inline_2557$$ = _.$addParamToUrl$$module$src$url$$($actionXhrUrl$jscomp$inline_2560$$, $decoratedUrl$jscomp$inline_2561_domains$jscomp$2_inputEl$jscomp$inline_6059_linkerName$jscomp$inline_2557$$, $hostname$jscomp$4_ids$jscomp$inline_2558_linkerValue$jscomp$inline_2559_url$jscomp$168$$), $actionXhrMutator_event$jscomp$80$$($decoratedUrl$jscomp$inline_2561_domains$jscomp$2_inputEl$jscomp$inline_6059_linkerName$jscomp$inline_2557$$)) : 
      ($decoratedUrl$jscomp$inline_2561_domains$jscomp$2_inputEl$jscomp$inline_6059_linkerName$jscomp$inline_2557$$ = _.$createElementWithAttributes$$module$src$dom$$($form$jscomp$3$$.ownerDocument, "input", _.$dict$$module$src$utils$object$$({type:"hidden", name:$decoratedUrl$jscomp$inline_2561_domains$jscomp$2_inputEl$jscomp$inline_6059_linkerName$jscomp$inline_2557$$, value:$hostname$jscomp$4_ids$jscomp$inline_2558_linkerValue$jscomp$inline_2559_url$jscomp$168$$})), $form$jscomp$3$$.appendChild($decoratedUrl$jscomp$inline_2561_domains$jscomp$2_inputEl$jscomp$inline_6059_linkerName$jscomp$inline_2557$$));
    }
  }
};
$RequestHandler$$module$extensions$amp_analytics$0_1$requests$$.prototype.$dispose$ = function() {
  $JSCompiler_StaticMethods_RequestHandler$$module$extensions$amp_analytics$0_1$requests_prototype$reset_$$(this);
  this.$F$ && (this.$win$.clearTimeout(this.$F$), this.$F$ = null);
  this.$K$ && (this.$win$.clearTimeout(this.$K$), this.$K$ = null);
};
$IframeTransport$$module$extensions$amp_analytics$0_1$iframe_transport$$.prototype.$getType$ = function() {
  return this.$type_$;
};
var $IframeTransport$$module$extensions$amp_analytics$0_1$iframe_transport$crossDomainIframes_$$ = {}, $IframeTransport$$module$extensions$amp_analytics$0_1$iframe_transport$nextId_$$ = 0, $IframeTransport$$module$extensions$amp_analytics$0_1$iframe_transport$performanceObservers_$$ = {};
var $WHITELIST_EVENT_IN_SANDBOX$$module$extensions$amp_analytics$0_1$amp_analytics$$ = ["visible", "hidden"];
_.$$jscomp$inherits$$($AmpAnalytics$$module$extensions$amp_analytics$0_1$amp_analytics$$, window.AMP.BaseElement);
_.$JSCompiler_prototypeAlias$$ = $AmpAnalytics$$module$extensions$amp_analytics$0_1$amp_analytics$$.prototype;
_.$JSCompiler_prototypeAlias$$.$getLayoutPriority$ = function() {
  return this.$isInabox_$ ? 0 : 1;
};
_.$JSCompiler_prototypeAlias$$.$isAlwaysFixed$ = function() {
  return !_.$isInFie$$module$src$friendly_iframe_embed$$(this.element);
};
_.$JSCompiler_prototypeAlias$$.$isLayoutSupported$ = function() {
  return !0;
};
_.$JSCompiler_prototypeAlias$$.$buildCallback$ = function() {
  var $$jscomp$this$jscomp$409$$ = this;
  this.$isSandbox_$ = this.element.hasAttribute("sandbox");
  this.element.setAttribute("aria-hidden", "true");
  this.$consentNotificationId_$ = this.element.getAttribute("data-consent-notification-id");
  null != this.$consentNotificationId_$ && (this.$consentPromise_$ = _.$Services$$module$src$services$userNotificationManagerForDoc$$(this.element).then(function($service$jscomp$26$$) {
    return $service$jscomp$26$$.get($$jscomp$this$jscomp$409$$.$consentNotificationId_$);
  }));
  "immediate" == this.element.getAttribute("trigger") && $JSCompiler_StaticMethods_ensureInitialized_$$(this);
};
_.$JSCompiler_prototypeAlias$$.$layoutCallback$ = function() {
  return $JSCompiler_StaticMethods_ensureInitialized_$$(this);
};
_.$JSCompiler_prototypeAlias$$.detachedCallback = function() {
  this.$analyticsGroup_$ && (this.$analyticsGroup_$.$dispose$(), this.$analyticsGroup_$ = null);
  this.$linkerManager_$ && (this.$linkerManager_$.$dispose$(), this.$linkerManager_$ = null);
  for (var $i$jscomp$215$$ = 0; $i$jscomp$215$$ < this.$requests_$.length; $i$jscomp$215$$++) {
    this.$requests_$[$i$jscomp$215$$].$dispose$(), delete this.$requests_$[$i$jscomp$215$$];
  }
};
_.$JSCompiler_prototypeAlias$$.$resumeCallback$ = function() {
  var $$jscomp$this$jscomp$410$$ = this;
  this.$iniPromise_$ && this.$iniPromise_$.then(function() {
    $JSCompiler_StaticMethods_maybeInitIframeTransport$$($$jscomp$this$jscomp$410$$.$transport_$, $$jscomp$this$jscomp$410$$.$getAmpDoc$().$win$, $$jscomp$this$jscomp$410$$.element);
  });
};
_.$JSCompiler_prototypeAlias$$.$unlayoutCallback$ = function() {
  var $$jscomp$this$jscomp$411$$ = this;
  if (_.$JSCompiler_StaticMethods_Viewer$$module$src$service$viewer_impl_prototype$isVisible$$(_.$Services$$module$src$services$viewerForDoc$$(this.$getAmpDoc$()))) {
    return !1;
  }
  this.$iniPromise_$ && this.$iniPromise_$.then(function() {
    var $JSCompiler_StaticMethods_deleteIframeTransport$self$jscomp$inline_2596$$ = $$jscomp$this$jscomp$411$$.$transport_$;
    if ($JSCompiler_StaticMethods_deleteIframeTransport$self$jscomp$inline_2596$$.$F$) {
      var $JSCompiler_StaticMethods_IframeTransport$$module$extensions$amp_analytics$0_1$iframe_transport_prototype$detach$self$jscomp$inline_6071_type$jscomp$inline_6757$$ = $JSCompiler_StaticMethods_deleteIframeTransport$self$jscomp$inline_2596$$.$F$, $ampDoc$jscomp$inline_6756$$ = $JSCompiler_StaticMethods_IframeTransport$$module$extensions$amp_analytics$0_1$iframe_transport_prototype$detach$self$jscomp$inline_6071_type$jscomp$inline_6757$$.$D$.document;
      $JSCompiler_StaticMethods_IframeTransport$$module$extensions$amp_analytics$0_1$iframe_transport_prototype$detach$self$jscomp$inline_6071_type$jscomp$inline_6757$$ = $JSCompiler_StaticMethods_IframeTransport$$module$extensions$amp_analytics$0_1$iframe_transport_prototype$detach$self$jscomp$inline_6071_type$jscomp$inline_6757$$.$type_$;
      var $frameData$jscomp$inline_6758$$ = $IframeTransport$$module$extensions$amp_analytics$0_1$iframe_transport$crossDomainIframes_$$[$JSCompiler_StaticMethods_IframeTransport$$module$extensions$amp_analytics$0_1$iframe_transport_prototype$detach$self$jscomp$inline_6071_type$jscomp$inline_6757$$];
      --$frameData$jscomp$inline_6758$$.$usageCount$ || ($ampDoc$jscomp$inline_6756$$.body.removeChild($frameData$jscomp$inline_6758$$.frame), delete $IframeTransport$$module$extensions$amp_analytics$0_1$iframe_transport$crossDomainIframes_$$[$JSCompiler_StaticMethods_IframeTransport$$module$extensions$amp_analytics$0_1$iframe_transport_prototype$detach$self$jscomp$inline_6071_type$jscomp$inline_6757$$], $IframeTransport$$module$extensions$amp_analytics$0_1$iframe_transport$performanceObservers_$$[$JSCompiler_StaticMethods_IframeTransport$$module$extensions$amp_analytics$0_1$iframe_transport_prototype$detach$self$jscomp$inline_6071_type$jscomp$inline_6757$$] && 
      ($IframeTransport$$module$extensions$amp_analytics$0_1$iframe_transport$performanceObservers_$$[$JSCompiler_StaticMethods_IframeTransport$$module$extensions$amp_analytics$0_1$iframe_transport_prototype$detach$self$jscomp$inline_6071_type$jscomp$inline_6757$$].disconnect(), $IframeTransport$$module$extensions$amp_analytics$0_1$iframe_transport$performanceObservers_$$[$JSCompiler_StaticMethods_IframeTransport$$module$extensions$amp_analytics$0_1$iframe_transport_prototype$detach$self$jscomp$inline_6071_type$jscomp$inline_6757$$] = 
      null));
      $JSCompiler_StaticMethods_deleteIframeTransport$self$jscomp$inline_2596$$.$F$ = null;
    }
  });
  return window.AMP.BaseElement.prototype.$unlayoutCallback$.call(this);
};
_.$JSCompiler_prototypeAlias$$.$registerTriggers_$ = function() {
  var $$jscomp$this$jscomp$413$$ = this;
  if ($JSCompiler_StaticMethods_hasOptedOut_$$(this)) {
    var $TAG$220_TAG$jscomp$9_promises$jscomp$16$$ = $JSCompiler_StaticMethods_AmpAnalytics$$module$extensions$amp_analytics$0_1$amp_analytics_prototype$getName_$$(this);
    $TAG$220_TAG$jscomp$9_promises$jscomp$16$$;
    return window.Promise.resolve();
  }
  $JSCompiler_StaticMethods_generateRequests_$$(this);
  if (!this.$config_$.triggers) {
    return $TAG$220_TAG$jscomp$9_promises$jscomp$16$$ = $JSCompiler_StaticMethods_AmpAnalytics$$module$extensions$amp_analytics$0_1$amp_analytics_prototype$getName_$$(this), this.$user$().error($TAG$220_TAG$jscomp$9_promises$jscomp$16$$, "No triggers were found in the config. No analytics data will be sent."), window.Promise.resolve();
  }
  $JSCompiler_StaticMethods_processExtraUrlParams_$$(this, this.$config_$.extraUrlParams, this.$config_$.extraUrlParamsReplaceMap);
  this.$analyticsGroup_$ = $JSCompiler_StaticMethods_createAnalyticsGroup$$(this.$instrumentation_$, this.element);
  $JSCompiler_StaticMethods_maybeInitIframeTransport$$(this.$transport_$, this.$getAmpDoc$().$win$, this.element, this.$preconnect$);
  $TAG$220_TAG$jscomp$9_promises$jscomp$16$$ = [];
  var $$jscomp$loop$397$$ = {}, $k$jscomp$24$$;
  for ($k$jscomp$24$$ in this.$config_$.triggers) {
    if (_.$hasOwn$$module$src$utils$object$$(this.$config_$.triggers, $k$jscomp$24$$)) {
      $$jscomp$loop$397$$.$trigger$ = this.$config_$.triggers[$k$jscomp$24$$];
      $$jscomp$loop$397$$.$expansionOptions$ = $JSCompiler_StaticMethods_expansionOptions_$$(this, _.$dict$$module$src$utils$object$$({}), $$jscomp$loop$397$$.$trigger$, void 0, !0);
      var $TAG$221$$ = $JSCompiler_StaticMethods_AmpAnalytics$$module$extensions$amp_analytics$0_1$amp_analytics_prototype$getName_$$(this);
      if (!$$jscomp$loop$397$$.$trigger$) {
        this.$user$().error($TAG$221$$, "Trigger should be an object: ", $k$jscomp$24$$);
        continue;
      }
      var $errorMsgSeg_eventType$jscomp$51_hasRequestOrPostMessage$$ = $$jscomp$loop$397$$.$trigger$.request || $$jscomp$loop$397$$.$trigger$.parentPostMessage && this.$isInabox_$;
      if (!$$jscomp$loop$397$$.$trigger$.on || !$errorMsgSeg_eventType$jscomp$51_hasRequestOrPostMessage$$) {
        $errorMsgSeg_eventType$jscomp$51_hasRequestOrPostMessage$$ = this.$isInabox_$ ? '/"parentPostMessage"' : "";
        this.$user$().error($TAG$221$$, '"on" and "request"' + $errorMsgSeg_eventType$jscomp$51_hasRequestOrPostMessage$$ + " attributes are required for data to be collected.");
        continue;
      }
      if (this.$isSandbox_$ && ($errorMsgSeg_eventType$jscomp$51_hasRequestOrPostMessage$$ = $$jscomp$loop$397$$.$trigger$.on, _.$isEnumValue$$module$src$types$$($AnalyticsEventType$$module$extensions$amp_analytics$0_1$events$$, $errorMsgSeg_eventType$jscomp$51_hasRequestOrPostMessage$$) && !$WHITELIST_EVENT_IN_SANDBOX$$module$extensions$amp_analytics$0_1$amp_analytics$$.includes($errorMsgSeg_eventType$jscomp$51_hasRequestOrPostMessage$$))) {
        this.$user$().error($TAG$221$$, $errorMsgSeg_eventType$jscomp$51_hasRequestOrPostMessage$$ + " is not supported for amp-analytics in scope");
        continue;
      }
      $JSCompiler_StaticMethods_processExtraUrlParams_$$(this, $$jscomp$loop$397$$.$trigger$.extraUrlParams, this.$config_$.extraUrlParamsReplaceMap);
      $TAG$220_TAG$jscomp$9_promises$jscomp$16$$.push($JSCompiler_StaticMethods_isSampledIn_$$(this, $$jscomp$loop$397$$.$trigger$).then(function($TAG$220_TAG$jscomp$9_promises$jscomp$16$$) {
        return function($$jscomp$loop$397$$) {
          if ($$jscomp$loop$397$$) {
            if ($$jscomp$this$jscomp$413$$.$isSandbox_$) {
              $$jscomp$this$jscomp$413$$.element.parentElement && ($TAG$220_TAG$jscomp$9_promises$jscomp$16$$.$trigger$.selector = $$jscomp$this$jscomp$413$$.element.parentElement.tagName, $TAG$220_TAG$jscomp$9_promises$jscomp$16$$.$trigger$.selectionMethod = "closest", $JSCompiler_StaticMethods_addTriggerNoInline_$$($$jscomp$this$jscomp$413$$, $TAG$220_TAG$jscomp$9_promises$jscomp$16$$.$trigger$));
            } else {
              if ($TAG$220_TAG$jscomp$9_promises$jscomp$16$$.$trigger$.selector) {
                return $JSCompiler_StaticMethods_expandTemplate$$($$jscomp$this$jscomp$413$$.$variableService_$, $TAG$220_TAG$jscomp$9_promises$jscomp$16$$.$trigger$.selector, $TAG$220_TAG$jscomp$9_promises$jscomp$16$$.$expansionOptions$).then(function($$jscomp$loop$397$$) {
                  $TAG$220_TAG$jscomp$9_promises$jscomp$16$$.$trigger$.selector = $$jscomp$loop$397$$;
                  $JSCompiler_StaticMethods_addTriggerNoInline_$$($$jscomp$this$jscomp$413$$, $TAG$220_TAG$jscomp$9_promises$jscomp$16$$.$trigger$);
                });
              }
              $JSCompiler_StaticMethods_addTriggerNoInline_$$($$jscomp$this$jscomp$413$$, $TAG$220_TAG$jscomp$9_promises$jscomp$16$$.$trigger$);
            }
          }
        };
      }($$jscomp$loop$397$$)));
    }
    $$jscomp$loop$397$$ = {$trigger$:$$jscomp$loop$397$$.$trigger$, $expansionOptions$:$$jscomp$loop$397$$.$expansionOptions$};
  }
  return window.Promise.all($TAG$220_TAG$jscomp$9_promises$jscomp$16$$);
};
_.$JSCompiler_prototypeAlias$$.$preload$ = function($url$jscomp$172$$, $opt_preloadAs$jscomp$2$$) {
  this.$preconnect$.$preload$($url$jscomp$172$$, $opt_preloadAs$jscomp$2$$);
};
_.$JSCompiler_prototypeAlias$$.$initializeLinker_$ = function() {
  var $type$jscomp$172$$ = this.element.getAttribute("type");
  this.$linkerManager_$ = new $LinkerManager$$module$extensions$amp_analytics$0_1$linker_manager$$(this.$getAmpDoc$(), this.$config_$, $type$jscomp$172$$, this.element);
  this.$linkerManager_$.init();
};
_.$JSCompiler_prototypeAlias$$.$AmpAnalytics$$module$extensions$amp_analytics$0_1$amp_analytics_prototype$handleEvent_$ = function($trigger$jscomp$3$$, $event$jscomp$83$$) {
  for (var $requests$jscomp$3$$ = _.$isArray$$module$src$types$$($trigger$jscomp$3$$.request) ? $trigger$jscomp$3$$.request : [$trigger$jscomp$3$$.request], $r$jscomp$25$$ = 0; $r$jscomp$25$$ < $requests$jscomp$3$$.length; $r$jscomp$25$$++) {
    $JSCompiler_StaticMethods_handleRequestForEvent_$$(this, $requests$jscomp$3$$[$r$jscomp$25$$], $trigger$jscomp$3$$, $event$jscomp$83$$);
  }
};
var $AMP$jscomp$inline_2612$$ = window.self.AMP;
$AMP$jscomp$inline_2612$$.registerServiceForDoc("amp-analytics-instrumentation", $InstrumentationService$$module$extensions$amp_analytics$0_1$instrumentation$$);
$AMP$jscomp$inline_2612$$.registerServiceForDoc("activity", $Activity$$module$extensions$amp_analytics$0_1$activity_impl$$);
_.$registerServiceBuilder$$module$src$service$$($AMP$jscomp$inline_2612$$.$win$, "amp-analytics-variables", $VariableService$$module$extensions$amp_analytics$0_1$variables$$);
_.$registerServiceBuilder$$module$src$service$$($AMP$jscomp$inline_2612$$.$win$, "amp-analyitcs-linker-reader", $LinkerReader$$module$extensions$amp_analytics$0_1$linker_reader$$);
$AMP$jscomp$inline_2612$$.registerElement("amp-analytics", $AmpAnalytics$$module$extensions$amp_analytics$0_1$amp_analytics$$);

})});
