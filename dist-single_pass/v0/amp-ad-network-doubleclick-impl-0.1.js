(self.AMP=self.AMP||[]).push({n:"amp-ad-network-doubleclick-impl",i:["_base_i","_base_ad"],v:"1901181729101",f:(function(AMP,_){
var $validateDimensions$$module$ads$google$utils$$ = function($width$jscomp$21$$, $height$jscomp$20$$, $widthCond$$, $heightCond$$, $errorBuilder$$) {
  var $badParams$jscomp$3$$ = [];
  $widthCond$$($width$jscomp$21$$) && $badParams$jscomp$3$$.push({$dim$:"width", $val$:$width$jscomp$21$$});
  $heightCond$$($height$jscomp$20$$) && $badParams$jscomp$3$$.push({$dim$:"height", $val$:$height$jscomp$20$$});
  $badParams$jscomp$3$$.length && _.$user$$module$src$log$$().$Log$$module$src$log_prototype$warn$("AMP-AD", $errorBuilder$$($badParams$jscomp$3$$));
  return !$badParams$jscomp$3$$.length;
}, $getMultiSizeDimensions$$module$ads$google$utils$$ = function($arrayOfSizeStrs_multiSizeDataStr$$, $primaryWidth$$, $primaryHeight$$, $multiSizeValidation$$, $isFluidPrimary$$) {
  $isFluidPrimary$$ = void 0 === $isFluidPrimary$$ ? !1 : $isFluidPrimary$$;
  var $dimensions$jscomp$1$$ = [];
  $arrayOfSizeStrs_multiSizeDataStr$$ = $arrayOfSizeStrs_multiSizeDataStr$$.split(",");
  for (var $$jscomp$loop$393$$ = {}, $i$jscomp$144$$ = 0; $i$jscomp$144$$ < $arrayOfSizeStrs_multiSizeDataStr$$.length; $$jscomp$loop$393$$ = {minWidth:$$jscomp$loop$393$$.minWidth, minHeight:$$jscomp$loop$393$$.minHeight}, $i$jscomp$144$$++) {
    var $sizeStr$jscomp$1_width$jscomp$20$$ = $arrayOfSizeStrs_multiSizeDataStr$$[$i$jscomp$144$$];
    if ("fluid" == $sizeStr$jscomp$1_width$jscomp$20$$.toLowerCase()) {
      $isFluidPrimary$$ || $dimensions$jscomp$1$$.push(_.$DUMMY_FLUID_SIZE_ARR$$module$ads$google$utils$$);
    } else {
      var $height$jscomp$19_size$jscomp$18$$ = $sizeStr$jscomp$1_width$jscomp$20$$.split("x");
      if (2 != $height$jscomp$19_size$jscomp$18$$.length) {
        _.$user$$module$src$log$$().error("AMP-AD", "Invalid multi-size data format '" + $sizeStr$jscomp$1_width$jscomp$20$$ + "'.");
      } else {
        if ($sizeStr$jscomp$1_width$jscomp$20$$ = Number($height$jscomp$19_size$jscomp$18$$[0]), $height$jscomp$19_size$jscomp$18$$ = Number($height$jscomp$19_size$jscomp$18$$[1]), $validateDimensions$$module$ads$google$utils$$($sizeStr$jscomp$1_width$jscomp$20$$, $height$jscomp$19_size$jscomp$18$$, function($arrayOfSizeStrs_multiSizeDataStr$$) {
          return (0,window.isNaN)($arrayOfSizeStrs_multiSizeDataStr$$) || 0 >= $arrayOfSizeStrs_multiSizeDataStr$$;
        }, function($arrayOfSizeStrs_multiSizeDataStr$$) {
          return (0,window.isNaN)($arrayOfSizeStrs_multiSizeDataStr$$) || 0 >= $arrayOfSizeStrs_multiSizeDataStr$$;
        }, function($arrayOfSizeStrs_multiSizeDataStr$$) {
          return $arrayOfSizeStrs_multiSizeDataStr$$.map(function($arrayOfSizeStrs_multiSizeDataStr$$) {
            return "Invalid " + $arrayOfSizeStrs_multiSizeDataStr$$.$dim$ + " of " + $arrayOfSizeStrs_multiSizeDataStr$$.$val$ + " given for secondary size.";
          }).join(" ");
        }) && ($isFluidPrimary$$ || $validateDimensions$$module$ads$google$utils$$($sizeStr$jscomp$1_width$jscomp$20$$, $height$jscomp$19_size$jscomp$18$$, function($arrayOfSizeStrs_multiSizeDataStr$$) {
          return $arrayOfSizeStrs_multiSizeDataStr$$ > $primaryWidth$$;
        }, function($arrayOfSizeStrs_multiSizeDataStr$$) {
          return $arrayOfSizeStrs_multiSizeDataStr$$ > $primaryHeight$$;
        }, function($arrayOfSizeStrs_multiSizeDataStr$$) {
          return $arrayOfSizeStrs_multiSizeDataStr$$.map(function($arrayOfSizeStrs_multiSizeDataStr$$) {
            return "Secondary " + $arrayOfSizeStrs_multiSizeDataStr$$.$dim$ + " " + $arrayOfSizeStrs_multiSizeDataStr$$.$val$ + " " + ("can't be larger than the primary " + $arrayOfSizeStrs_multiSizeDataStr$$.$dim$ + ".");
          }).join(" ");
        }))) {
          if ($multiSizeValidation$$) {
            var $minRatio$$ = 2 / 3;
            $$jscomp$loop$393$$.minWidth = $minRatio$$ * $primaryWidth$$;
            $$jscomp$loop$393$$.minHeight = $minRatio$$ * $primaryHeight$$;
            if (!$validateDimensions$$module$ads$google$utils$$($sizeStr$jscomp$1_width$jscomp$20$$, $height$jscomp$19_size$jscomp$18$$, function($arrayOfSizeStrs_multiSizeDataStr$$) {
              return function($primaryWidth$$) {
                return $primaryWidth$$ < $arrayOfSizeStrs_multiSizeDataStr$$.minWidth;
              };
            }($$jscomp$loop$393$$), function($arrayOfSizeStrs_multiSizeDataStr$$) {
              return function($primaryWidth$$) {
                return $primaryWidth$$ < $arrayOfSizeStrs_multiSizeDataStr$$.minHeight;
              };
            }($$jscomp$loop$393$$), function($arrayOfSizeStrs_multiSizeDataStr$$) {
              return $arrayOfSizeStrs_multiSizeDataStr$$.map(function($arrayOfSizeStrs_multiSizeDataStr$$) {
                return "Secondary " + $arrayOfSizeStrs_multiSizeDataStr$$.$dim$ + " " + $arrayOfSizeStrs_multiSizeDataStr$$.$val$ + " is " + ("smaller than 2/3rds of the primary " + $arrayOfSizeStrs_multiSizeDataStr$$.$dim$ + ".");
              }).join(" ");
            })) {
              continue;
            }
          }
          $dimensions$jscomp$1$$.push([$sizeStr$jscomp$1_width$jscomp$20$$, $height$jscomp$19_size$jscomp$18$$]);
        }
      }
    }
  }
  return $dimensions$jscomp$1$$;
}, $groupAmpAdsByType$$module$ads$google$a4a$utils$$ = function($win$jscomp$250$$, $type$jscomp$136$$) {
  var $groupFn$$ = $getNetworkId$$module$extensions$amp_ad_network_doubleclick_impl$0_1$amp_ad_network_doubleclick_impl$$;
  return _.$JSCompiler_StaticMethods_getMeasuredResources$$(_.$Services$$module$src$services$resourcesForDoc$$($win$jscomp$250$$.document.documentElement), $win$jscomp$250$$, function($win$jscomp$250$$) {
    return "AMP-AD" == $win$jscomp$250$$.element.tagName && $win$jscomp$250$$.element.getAttribute("type") == $type$jscomp$136$$ ? !0 : Object.keys(_.$ValidAdContainerTypes$$module$ads$google$a4a$utils$$).includes($win$jscomp$250$$.element.tagName) && !!$win$jscomp$250$$.element.querySelector("amp-ad[type=" + $type$jscomp$136$$ + "]");
  }).then(function($win$jscomp$250$$) {
    return window.Promise.all($win$jscomp$250$$.map(function($win$jscomp$250$$) {
      return "AMP-AD" == $win$jscomp$250$$.element.tagName ? $win$jscomp$250$$.element : _.$whenUpgradedToCustomElement$$module$src$dom$$($win$jscomp$250$$.element.querySelector("amp-ad[type=" + $type$jscomp$136$$ + "]"));
    }));
  }).then(function($win$jscomp$250$$) {
    return $win$jscomp$250$$.reduce(function($win$jscomp$250$$, $type$jscomp$136$$) {
      var $elements$jscomp$14$$ = $groupFn$$($type$jscomp$136$$);
      ($win$jscomp$250$$[$elements$jscomp$14$$] || ($win$jscomp$250$$[$elements$jscomp$14$$] = [])).push($type$jscomp$136$$.$getImpl$());
      return $win$jscomp$250$$;
    }, {});
  });
}, $lineDelimitedStreamer$$module$ads$google$a4a$line_delimited_response_handler$$ = function($win$jscomp$293$$, $response$jscomp$42$$, $lineCallback$$) {
  function $streamer$$($win$jscomp$293$$, $response$jscomp$42$$) {
    for (var $streamer$$ = /([^\n]*)(\n)?/g, $decoder$$; ($decoder$$ = $streamer$$.exec($win$jscomp$293$$)) && ($line$jscomp$4$$ += $decoder$$[1], $decoder$$[2] && ($lineCallback$$($line$jscomp$4$$, $response$jscomp$42$$ && $streamer$$.lastIndex === $win$jscomp$293$$.length), $line$jscomp$4$$ = ""), $streamer$$.lastIndex !== $win$jscomp$293$$.length);) {
    }
  }
  var $line$jscomp$4$$ = "";
  if ($response$jscomp$42$$.body && $win$jscomp$293$$.TextDecoder) {
    var $decoder$$ = new window.TextDecoder("utf-8"), $reader$$ = $response$jscomp$42$$.body.getReader();
    $reader$$.read().then(function $chunk$jscomp$7$$($win$jscomp$293$$) {
      $win$jscomp$293$$.value && $streamer$$($decoder$$.decode($win$jscomp$293$$.value, {stream:!0}), $win$jscomp$293$$.done);
      $win$jscomp$293$$.done || $reader$$.read().then($chunk$jscomp$7$$);
    });
  } else {
    $response$jscomp$42$$.text().then(function($win$jscomp$293$$) {
      return $streamer$$($win$jscomp$293$$, !0);
    });
  }
}, $metaJsonCreativeGrouper$$module$ads$google$a4a$line_delimited_response_handler$$ = function($callback$jscomp$105$$) {
  var $first$jscomp$9$$;
  return function($line$jscomp$5$$, $done$jscomp$2$$) {
    if ($first$jscomp$9$$) {
      var $metadata$jscomp$2$$ = _.$tryParseJson$$module$src$json$$($first$jscomp$9$$) || {}, $lowerCasedMetadata$$ = Object.keys($metadata$jscomp$2$$).reduce(function($callback$jscomp$105$$, $first$jscomp$9$$) {
        $callback$jscomp$105$$[$first$jscomp$9$$.toLowerCase()] = $metadata$jscomp$2$$[$first$jscomp$9$$];
        return $callback$jscomp$105$$;
      }, {});
      $callback$jscomp$105$$($unescapeLineDelimitedHtml_$$module$ads$google$a4a$line_delimited_response_handler$$($line$jscomp$5$$), $lowerCasedMetadata$$, $done$jscomp$2$$);
      $first$jscomp$9$$ = null;
    } else {
      $first$jscomp$9$$ = $line$jscomp$5$$;
    }
  };
}, $unescapeLineDelimitedHtml_$$module$ads$google$a4a$line_delimited_response_handler$$ = function($html$jscomp$7$$) {
  return $html$jscomp$7$$.replace(/\\(n|r|\\)/g, function($html$jscomp$7$$, $match$jscomp$19$$) {
    return "n" == $match$jscomp$19$$ ? "\n" : "r" == $match$jscomp$19$$ ? "\r" : "\\";
  });
}, $RealTimeConfigManager$$module$extensions$amp_a4a$0_1$real_time_config_manager$$ = function($a4aElement$$) {
  this.$F$ = $a4aElement$$;
  this.$I$ = this.$F$.$win$;
  this.$O$ = {};
  this.$K$ = null;
  this.$J$ = [];
  this.$D$ = null;
  this.$ampDoc_$ = this.$F$.$getAmpDoc$();
  this.$G$ = null;
}, $JSCompiler_StaticMethods_buildErrorResponse_$$ = function($JSCompiler_StaticMethods_buildErrorResponse_$self$$, $error$jscomp$47$$, $callout$$, $errorReportingUrl_url$jscomp$inline_2266$$, $opt_rtcTime$$) {
  _.$dev$$module$src$log$$().$Log$$module$src$log_prototype$warn$("real-time-config", "RTC callout to " + $callout$$ + " caused " + $error$jscomp$47$$);
  if ($errorReportingUrl_url$jscomp$inline_2266$$ && $ERROR_REPORTING_ENABLED$$module$extensions$amp_a4a$0_1$real_time_config_manager$$) {
    var $macros$jscomp$inline_2265$$ = {$ERROR_TYPE$:$error$jscomp$47$$, $HREF$:$JSCompiler_StaticMethods_buildErrorResponse_$self$$.$I$.location.href};
    $errorReportingUrl_url$jscomp$inline_2266$$ = _.$JSCompiler_StaticMethods_expandUrlSync$$(_.$Services$$module$src$services$urlReplacementsForDoc$$($JSCompiler_StaticMethods_buildErrorResponse_$self$$.$F$.element), $errorReportingUrl_url$jscomp$inline_2266$$, $macros$jscomp$inline_2265$$, {$ERROR_TYPE$:!0, $HREF$:!0});
    (new $JSCompiler_StaticMethods_buildErrorResponse_$self$$.$I$.Image).src = $errorReportingUrl_url$jscomp$inline_2266$$;
  }
  return window.Promise.resolve({error:$error$jscomp$47$$, callout:$callout$$, rtcTime:$opt_rtcTime$$ || 0});
}, $JSCompiler_StaticMethods_getCalloutParam_$$ = function($JSCompiler_StaticMethods_getCalloutParam_$self_parsedUrl$jscomp$1$$, $url$jscomp$141$$) {
  $JSCompiler_StaticMethods_getCalloutParam_$self_parsedUrl$jscomp$1$$ = _.$Services$$module$src$services$urlForDoc$$($JSCompiler_StaticMethods_getCalloutParam_$self_parsedUrl$jscomp$1$$.$F$.element).parse($url$jscomp$141$$);
  return ($JSCompiler_StaticMethods_getCalloutParam_$self_parsedUrl$jscomp$1$$.hostname + $JSCompiler_StaticMethods_getCalloutParam_$self_parsedUrl$jscomp$1$$.pathname).substr(0, 50);
}, $JSCompiler_StaticMethods_isValidCalloutForConsentState$$ = function($JSCompiler_StaticMethods_isValidCalloutForConsentState$self$$, $calloutConfig_i$jscomp$186$$, $optIsGloballyValid$$) {
  var $sendRegardlessOfConsentState$$ = $calloutConfig_i$jscomp$186$$.$sendRegardlessOfConsentState$;
  if (!_.$isObject$$module$src$types$$($calloutConfig_i$jscomp$186$$) || !$sendRegardlessOfConsentState$$) {
    return !!$optIsGloballyValid$$;
  }
  if ("boolean" == typeof $sendRegardlessOfConsentState$$) {
    return $sendRegardlessOfConsentState$$;
  }
  if (_.$isArray$$module$src$types$$($sendRegardlessOfConsentState$$)) {
    for ($calloutConfig_i$jscomp$186$$ = 0; $calloutConfig_i$jscomp$186$$ < $sendRegardlessOfConsentState$$.length; $calloutConfig_i$jscomp$186$$++) {
      if ($JSCompiler_StaticMethods_isValidCalloutForConsentState$self$$.$G$ == $CONSENT_POLICY_STATE$$module$src$consent_state$$[$sendRegardlessOfConsentState$$[$calloutConfig_i$jscomp$186$$]]) {
        return !0;
      }
      $CONSENT_POLICY_STATE$$module$src$consent_state$$[$sendRegardlessOfConsentState$$[$calloutConfig_i$jscomp$186$$]] || _.$dev$$module$src$log$$().$Log$$module$src$log_prototype$warn$("real-time-config", "Invalid RTC consent state given: " + $sendRegardlessOfConsentState$$[$calloutConfig_i$jscomp$186$$]);
    }
    return !1;
  }
  _.$user$$module$src$log$$().$Log$$module$src$log_prototype$warn$("real-time-config", "Invalid value for sendRegardlessOfConsentState:" + $sendRegardlessOfConsentState$$);
  return !!$optIsGloballyValid$$;
}, $JSCompiler_StaticMethods_modifyRtcConfigForConsentStateSettings$$ = function($JSCompiler_StaticMethods_modifyRtcConfigForConsentStateSettings$self$$) {
  if (void 0 != $JSCompiler_StaticMethods_modifyRtcConfigForConsentStateSettings$self$$.$G$ && 1 != $JSCompiler_StaticMethods_modifyRtcConfigForConsentStateSettings$self$$.$G$ && 3 != $JSCompiler_StaticMethods_modifyRtcConfigForConsentStateSettings$self$$.$G$) {
    var $isGloballyValid$$ = $JSCompiler_StaticMethods_isValidCalloutForConsentState$$($JSCompiler_StaticMethods_modifyRtcConfigForConsentStateSettings$self$$, $JSCompiler_StaticMethods_modifyRtcConfigForConsentStateSettings$self$$.$D$);
    $JSCompiler_StaticMethods_modifyRtcConfigForConsentStateSettings$self$$.$D$.urls = ($JSCompiler_StaticMethods_modifyRtcConfigForConsentStateSettings$self$$.$D$.urls || []).filter(function($url$jscomp$142$$) {
      return $JSCompiler_StaticMethods_isValidCalloutForConsentState$$($JSCompiler_StaticMethods_modifyRtcConfigForConsentStateSettings$self$$, $url$jscomp$142$$, $isGloballyValid$$);
    });
    Object.keys($JSCompiler_StaticMethods_modifyRtcConfigForConsentStateSettings$self$$.$D$.$vendors$ || {}).forEach(function($vendor$jscomp$10$$) {
      $JSCompiler_StaticMethods_isValidCalloutForConsentState$$($JSCompiler_StaticMethods_modifyRtcConfigForConsentStateSettings$self$$, $JSCompiler_StaticMethods_modifyRtcConfigForConsentStateSettings$self$$.$D$.$vendors$[$vendor$jscomp$10$$], $isGloballyValid$$) || delete $JSCompiler_StaticMethods_modifyRtcConfigForConsentStateSettings$self$$.$D$.$vendors$[$vendor$jscomp$10$$];
    });
  }
}, $JSCompiler_StaticMethods_assignMacros$$ = function($JSCompiler_StaticMethods_assignMacros$self$$, $macros$jscomp$1$$) {
  $macros$jscomp$1$$.TIMEOUT = function() {
    return $JSCompiler_StaticMethods_assignMacros$self$$.$D$.$timeoutMillis$;
  };
  $macros$jscomp$1$$.CONSENT_STATE = function() {
    return $JSCompiler_StaticMethods_assignMacros$self$$.$G$;
  };
  return $macros$jscomp$1$$;
}, $JSCompiler_StaticMethods_handleRtcForCustomUrls$$ = function($JSCompiler_StaticMethods_handleRtcForCustomUrls$self$$, $customMacros$jscomp$1$$) {
  ($JSCompiler_StaticMethods_handleRtcForCustomUrls$self$$.$D$.urls || []).forEach(function($urlObj$$) {
    if (_.$isObject$$module$src$types$$($urlObj$$)) {
      var $url$jscomp$143$$ = $urlObj$$.url;
      var $errorReportingUrl$jscomp$2$$ = $urlObj$$.errorReportingUrl;
    } else {
      "string" == typeof $urlObj$$ ? $url$jscomp$143$$ = $urlObj$$ : _.$dev$$module$src$log$$().$Log$$module$src$log_prototype$warn$("real-time-config", "Invalid url: " + $urlObj$$);
    }
    $JSCompiler_StaticMethods_inflateAndSendRtc_$$($JSCompiler_StaticMethods_handleRtcForCustomUrls$self$$, $url$jscomp$143$$, $customMacros$jscomp$1$$, $errorReportingUrl$jscomp$2$$);
  });
}, $JSCompiler_StaticMethods_handleRtcForVendorUrls$$ = function($JSCompiler_StaticMethods_handleRtcForVendorUrls$self$$, $customMacros$jscomp$2$$) {
  Object.keys($JSCompiler_StaticMethods_handleRtcForVendorUrls$self$$.$D$.$vendors$ || []).forEach(function($vendor$jscomp$11$$) {
    var $vendorObject$$ = $RTC_VENDORS$$module$extensions$amp_a4a$0_1$callout_vendors$$[$vendor$jscomp$11$$.toLowerCase()], $url$jscomp$144$$ = $vendorObject$$ ? $vendorObject$$.url : "", $errorReportingUrl$jscomp$3$$ = $vendorObject$$ && $vendorObject$$.errorReportingUrl ? $vendorObject$$.errorReportingUrl : "";
    if (!$url$jscomp$144$$) {
      return $JSCompiler_StaticMethods_handleRtcForVendorUrls$self$$.$J$.push($JSCompiler_StaticMethods_buildErrorResponse_$$($JSCompiler_StaticMethods_handleRtcForVendorUrls$self$$, "9", $vendor$jscomp$11$$, $errorReportingUrl$jscomp$3$$));
    }
    var $vendorMacros$$ = _.$isObject$$module$src$types$$($JSCompiler_StaticMethods_handleRtcForVendorUrls$self$$.$D$.$vendors$[$vendor$jscomp$11$$].macros) ? $JSCompiler_StaticMethods_handleRtcForVendorUrls$self$$.$D$.$vendors$[$vendor$jscomp$11$$].macros : $JSCompiler_StaticMethods_handleRtcForVendorUrls$self$$.$D$.$vendors$[$vendor$jscomp$11$$], $validVendorMacros$$ = {};
    Object.keys($vendorMacros$$).forEach(function($JSCompiler_StaticMethods_handleRtcForVendorUrls$self$$) {
      if ($vendorObject$$.$macros$ && $vendorObject$$.$macros$.includes($JSCompiler_StaticMethods_handleRtcForVendorUrls$self$$)) {
        var $customMacros$jscomp$2$$ = $vendorMacros$$[$JSCompiler_StaticMethods_handleRtcForVendorUrls$self$$];
        $validVendorMacros$$[$JSCompiler_StaticMethods_handleRtcForVendorUrls$self$$] = _.$isObject$$module$src$types$$($customMacros$jscomp$2$$) || _.$isArray$$module$src$types$$($customMacros$jscomp$2$$) ? JSON.stringify($customMacros$jscomp$2$$) : $customMacros$jscomp$2$$;
      } else {
        _.$user$$module$src$log$$().error("real-time-config", "Unknown macro: " + $JSCompiler_StaticMethods_handleRtcForVendorUrls$self$$ + " for vendor: " + $vendor$jscomp$11$$);
      }
    });
    var $macros$jscomp$2$$ = Object.assign($validVendorMacros$$, $customMacros$jscomp$2$$);
    $JSCompiler_StaticMethods_inflateAndSendRtc_$$($JSCompiler_StaticMethods_handleRtcForVendorUrls$self$$, $url$jscomp$144$$, $macros$jscomp$2$$, $errorReportingUrl$jscomp$3$$, $vendor$jscomp$11$$.toLowerCase());
  });
}, $JSCompiler_StaticMethods_inflateAndSendRtc_$$ = function($JSCompiler_StaticMethods_inflateAndSendRtc_$self$$, $url$jscomp$145$$, $macros$jscomp$3$$, $errorReportingUrl$jscomp$4$$, $opt_vendor$$) {
  function $send$jscomp$1$$($url$jscomp$145$$) {
    if (5 == Object.keys($JSCompiler_StaticMethods_inflateAndSendRtc_$self$$.$O$).length) {
      return $JSCompiler_StaticMethods_buildErrorResponse_$$($JSCompiler_StaticMethods_inflateAndSendRtc_$self$$, "7", $callout$jscomp$1$$, $errorReportingUrl$jscomp$4$$);
    }
    if (!_.$JSCompiler_StaticMethods_isSecure$$(_.$Services$$module$src$services$urlForDoc$$($JSCompiler_StaticMethods_inflateAndSendRtc_$self$$.$F$.element), $url$jscomp$145$$)) {
      return $JSCompiler_StaticMethods_buildErrorResponse_$$($JSCompiler_StaticMethods_inflateAndSendRtc_$self$$, "6", $callout$jscomp$1$$, $errorReportingUrl$jscomp$4$$);
    }
    if ($JSCompiler_StaticMethods_inflateAndSendRtc_$self$$.$O$[$url$jscomp$145$$]) {
      return $JSCompiler_StaticMethods_buildErrorResponse_$$($JSCompiler_StaticMethods_inflateAndSendRtc_$self$$, "5", $callout$jscomp$1$$, $errorReportingUrl$jscomp$4$$);
    }
    $JSCompiler_StaticMethods_inflateAndSendRtc_$self$$.$O$[$url$jscomp$145$$] = !0;
    16384 < $url$jscomp$145$$.length && ($url$jscomp$145$$ = $url$jscomp$145$$.substr(0, 16372).replace(/%\w?$/, ""), $url$jscomp$145$$ += "&__trunc__=1");
    return $JSCompiler_StaticMethods_sendRtcCallout_$$($JSCompiler_StaticMethods_inflateAndSendRtc_$self$$, $url$jscomp$145$$, $timeoutMillis$$, $callout$jscomp$1$$, $checkStillCurrent$jscomp$6$$, $errorReportingUrl$jscomp$4$$);
  }
  var $timeoutMillis$$ = $JSCompiler_StaticMethods_inflateAndSendRtc_$self$$.$D$.$timeoutMillis$, $callout$jscomp$1$$ = $opt_vendor$$ || $JSCompiler_StaticMethods_getCalloutParam_$$($JSCompiler_StaticMethods_inflateAndSendRtc_$self$$, $url$jscomp$145$$), $checkStillCurrent$jscomp$6$$ = $JSCompiler_StaticMethods_inflateAndSendRtc_$self$$.$F$.$verifyStillCurrent$.bind($JSCompiler_StaticMethods_inflateAndSendRtc_$self$$.$F$)(), $whitelist$jscomp$10$$ = {};
  Object.keys($macros$jscomp$3$$).forEach(function($JSCompiler_StaticMethods_inflateAndSendRtc_$self$$) {
    return $whitelist$jscomp$10$$[$JSCompiler_StaticMethods_inflateAndSendRtc_$self$$] = !0;
  });
  var $urlReplacementStartTime$$ = Date.now();
  $JSCompiler_StaticMethods_inflateAndSendRtc_$self$$.$J$.push(_.$JSCompiler_StaticMethods_timeoutPromise$$(_.$Services$$module$src$services$timerFor$$($JSCompiler_StaticMethods_inflateAndSendRtc_$self$$.$I$), $timeoutMillis$$, _.$JSCompiler_StaticMethods_expandUrlAsync$$(_.$Services$$module$src$services$urlReplacementsForDoc$$($JSCompiler_StaticMethods_inflateAndSendRtc_$self$$.$F$.element), $url$jscomp$145$$, $macros$jscomp$3$$, $whitelist$jscomp$10$$)).then(function($JSCompiler_StaticMethods_inflateAndSendRtc_$self$$) {
    $checkStillCurrent$jscomp$6$$();
    $timeoutMillis$$ -= $urlReplacementStartTime$$ - Date.now();
    return $send$jscomp$1$$($JSCompiler_StaticMethods_inflateAndSendRtc_$self$$);
  }).catch(function($url$jscomp$145$$) {
    return _.$isCancellation$$module$src$error$$($url$jscomp$145$$) ? void 0 : $JSCompiler_StaticMethods_buildErrorResponse_$$($JSCompiler_StaticMethods_inflateAndSendRtc_$self$$, "11", $callout$jscomp$1$$, $errorReportingUrl$jscomp$4$$);
  }));
}, $JSCompiler_StaticMethods_sendRtcCallout_$$ = function($JSCompiler_StaticMethods_sendRtcCallout_$self$$, $url$jscomp$149$$, $timeoutMillis$jscomp$1$$, $callout$jscomp$2$$, $checkStillCurrent$jscomp$7$$, $errorReportingUrl$jscomp$5$$) {
  return _.$JSCompiler_StaticMethods_timeoutPromise$$(_.$Services$$module$src$services$timerFor$$($JSCompiler_StaticMethods_sendRtcCallout_$self$$.$I$), $timeoutMillis$jscomp$1$$, _.$JSCompiler_StaticMethods_fetchJson$$(_.$Services$$module$src$services$xhrFor$$($JSCompiler_StaticMethods_sendRtcCallout_$self$$.$I$), $url$jscomp$149$$, {credentials:"include"}).then(function($url$jscomp$149$$) {
    $checkStillCurrent$jscomp$7$$();
    return $url$jscomp$149$$.text().then(function($url$jscomp$149$$) {
      $checkStillCurrent$jscomp$7$$();
      var $timeoutMillis$jscomp$1$$ = Date.now() - $JSCompiler_StaticMethods_sendRtcCallout_$self$$.$K$;
      return $url$jscomp$149$$ ? ($url$jscomp$149$$ = _.$tryParseJson$$module$src$json$$($url$jscomp$149$$)) ? {response:$url$jscomp$149$$, rtcTime:$timeoutMillis$jscomp$1$$, callout:$callout$jscomp$2$$} : $JSCompiler_StaticMethods_buildErrorResponse_$$($JSCompiler_StaticMethods_sendRtcCallout_$self$$, "4", $callout$jscomp$2$$, $errorReportingUrl$jscomp$5$$, $timeoutMillis$jscomp$1$$) : {rtcTime:$timeoutMillis$jscomp$1$$, callout:$callout$jscomp$2$$};
    });
  })).catch(function($url$jscomp$149$$) {
    return _.$isCancellation$$module$src$error$$($url$jscomp$149$$) ? void 0 : $JSCompiler_StaticMethods_buildErrorResponse_$$($JSCompiler_StaticMethods_sendRtcCallout_$self$$, /^timeout/.test($url$jscomp$149$$.message) ? "10" : "8", $callout$jscomp$2$$, $errorReportingUrl$jscomp$5$$, Date.now() - $JSCompiler_StaticMethods_sendRtcCallout_$self$$.$K$);
  });
}, $JSCompiler_StaticMethods_validateRtcConfig_$$ = function($JSCompiler_StaticMethods_validateRtcConfig_$self$$, $element$jscomp$292_unparsedRtcConfig$$) {
  $element$jscomp$292_unparsedRtcConfig$$ = $element$jscomp$292_unparsedRtcConfig$$.getAttribute("rtc-config");
  if (!$element$jscomp$292_unparsedRtcConfig$$) {
    return !1;
  }
  var $rtcConfig$$ = _.$tryParseJson$$module$src$json$$($element$jscomp$292_unparsedRtcConfig$$);
  if (!$rtcConfig$$) {
    return _.$user$$module$src$log$$().$Log$$module$src$log_prototype$warn$("real-time-config", "Could not JSON parse rtc-config attribute"), !1;
  }
  var $timeout$jscomp$9$$;
  try {
    Object.keys($rtcConfig$$).forEach(function($JSCompiler_StaticMethods_validateRtcConfig_$self$$) {
      switch($JSCompiler_StaticMethods_validateRtcConfig_$self$$) {
        case "vendors":
          break;
        case "urls":
          break;
        case "timeoutMillis":
          $timeout$jscomp$9$$ = (0,window.parseInt)($rtcConfig$$[$JSCompiler_StaticMethods_validateRtcConfig_$self$$], 10);
          if ((0,window.isNaN)($timeout$jscomp$9$$)) {
            _.$user$$module$src$log$$().$Log$$module$src$log_prototype$warn$("real-time-config", "Invalid RTC timeout is NaN, using default timeout 1000ms"), $timeout$jscomp$9$$ = void 0;
          } else {
            if (1000 <= $timeout$jscomp$9$$ || 0 > $timeout$jscomp$9$$) {
              _.$user$$module$src$log$$().$Log$$module$src$log_prototype$warn$("real-time-config", "Invalid RTC timeout: " + $timeout$jscomp$9$$ + "ms, using default timeout 1000ms"), $timeout$jscomp$9$$ = void 0;
            }
          }
          break;
        default:
          _.$user$$module$src$log$$().$Log$$module$src$log_prototype$warn$("real-time-config", "Unknown RTC Config key: " + $JSCompiler_StaticMethods_validateRtcConfig_$self$$);
      }
    });
    if (!Object.keys($rtcConfig$$.vendors || {}).length && !($rtcConfig$$.urls || []).length) {
      return !1;
    }
    var $validateErrorReportingUrl$$ = function($element$jscomp$292_unparsedRtcConfig$$) {
      var $rtcConfig$$ = $element$jscomp$292_unparsedRtcConfig$$.errorReportingUrl;
      $rtcConfig$$ && !_.$JSCompiler_StaticMethods_isSecure$$(_.$Services$$module$src$services$urlForDoc$$($JSCompiler_StaticMethods_validateRtcConfig_$self$$.$F$.element), $rtcConfig$$) && (_.$dev$$module$src$log$$().$Log$$module$src$log_prototype$warn$("real-time-config", "Insecure RTC errorReportingUrl: " + $rtcConfig$$), $element$jscomp$292_unparsedRtcConfig$$.errorReportingUrl = void 0);
    };
    ($rtcConfig$$.urls || []).forEach(function($JSCompiler_StaticMethods_validateRtcConfig_$self$$) {
      _.$isObject$$module$src$types$$($JSCompiler_StaticMethods_validateRtcConfig_$self$$) && $validateErrorReportingUrl$$($JSCompiler_StaticMethods_validateRtcConfig_$self$$);
    });
    $validateErrorReportingUrl$$($rtcConfig$$);
  } catch ($unusedErr$jscomp$2$$) {
    return !1;
  }
  $rtcConfig$$.timeoutMillis = void 0 !== $timeout$jscomp$9$$ ? $timeout$jscomp$9$$ : 1000;
  $JSCompiler_StaticMethods_validateRtcConfig_$self$$.$D$ = $rtcConfig$$;
  return !0;
}, $RefreshIntersectionObserverWrapper$$module$extensions$amp_a4a$0_1$refresh_intersection_observer_wrapper$$ = function($callback$jscomp$106$$, $baseElement$jscomp$1$$, $config$jscomp$22$$) {
  this.$intersectionObserver_$ = new _.$IntersectionObserverPolyfill$$module$src$intersection_observer_polyfill$$($callback$jscomp$106$$, $config$jscomp$22$$);
  this.$F$ = {};
  this.$viewport_$ = $baseElement$jscomp$1$$.$getViewport$();
  this.$D$ = !1;
}, $getPublisherSpecifiedRefreshInterval$$module$extensions$amp_a4a$0_1$refresh_manager$$ = function($element$jscomp$295$$, $i$jscomp$187_metaTagContent_win$jscomp$294$$) {
  var $pair$jscomp$2_refreshInterval$$ = $element$jscomp$295$$.getAttribute("data-enable-refresh");
  if ($pair$jscomp$2_refreshInterval$$) {
    return $checkAndSanitizeRefreshInterval$$module$extensions$amp_a4a$0_1$refresh_manager$$($pair$jscomp$2_refreshInterval$$);
  }
  var $metaTag$jscomp$1_networkIntervalPairs$$;
  $i$jscomp$187_metaTagContent_win$jscomp$294$$ = ($metaTag$jscomp$1_networkIntervalPairs$$ = $i$jscomp$187_metaTagContent_win$jscomp$294$$.document.getElementsByName("amp-ad-enable-refresh")) && $metaTag$jscomp$1_networkIntervalPairs$$[0] && $metaTag$jscomp$1_networkIntervalPairs$$[0].getAttribute("content");
  if (!$i$jscomp$187_metaTagContent_win$jscomp$294$$) {
    return null;
  }
  $metaTag$jscomp$1_networkIntervalPairs$$ = $i$jscomp$187_metaTagContent_win$jscomp$294$$.split(",");
  for ($i$jscomp$187_metaTagContent_win$jscomp$294$$ = 0; $i$jscomp$187_metaTagContent_win$jscomp$294$$ < $metaTag$jscomp$1_networkIntervalPairs$$.length; $i$jscomp$187_metaTagContent_win$jscomp$294$$++) {
    if ($pair$jscomp$2_refreshInterval$$ = $metaTag$jscomp$1_networkIntervalPairs$$[$i$jscomp$187_metaTagContent_win$jscomp$294$$].split("="), $pair$jscomp$2_refreshInterval$$[0].toLowerCase() == $element$jscomp$295$$.getAttribute("type").toLowerCase()) {
      return $checkAndSanitizeRefreshInterval$$module$extensions$amp_a4a$0_1$refresh_manager$$($pair$jscomp$2_refreshInterval$$[1]);
    }
  }
  return null;
}, $checkAndSanitizeRefreshInterval$$module$extensions$amp_a4a$0_1$refresh_manager$$ = function($refreshInterval$jscomp$1$$) {
  var $refreshIntervalNum$$ = Number($refreshInterval$jscomp$1$$);
  return (0,window.isNaN)($refreshIntervalNum$$) || 30 > $refreshIntervalNum$$ ? (_.$user$$module$src$log$$().$Log$$module$src$log_prototype$warn$("AMP-AD", "invalid refresh interval, must be a number no less than 30: " + $refreshInterval$jscomp$1$$), null) : 1000 * $refreshIntervalNum$$;
}, $getRefreshManager$$module$extensions$amp_a4a$0_1$refresh_manager$$ = function($a4a$jscomp$6$$, $opt_predicate$$) {
  var $refreshInterval$jscomp$2$$ = $getPublisherSpecifiedRefreshInterval$$module$extensions$amp_a4a$0_1$refresh_manager$$($a4a$jscomp$6$$.element, $a4a$jscomp$6$$.$win$);
  return !$refreshInterval$jscomp$2$$ || $opt_predicate$$ && !$opt_predicate$$() ? null : new $RefreshManager$$module$extensions$amp_a4a$0_1$refresh_manager$$($a4a$jscomp$6$$, $refreshInterval$jscomp$2$$);
}, $RefreshManager$$module$extensions$amp_a4a$0_1$refresh_manager$$ = function($a4a$jscomp$7_managerId$$, $refreshInterval$jscomp$3$$) {
  var $config$jscomp$23$$ = _.$dict$$module$src$utils$object$$({visiblePercentageMin:50, continuousTimeMin:1});
  this.$state_$ = "initial";
  this.$G$ = $a4a$jscomp$7_managerId$$;
  this.$D$ = $a4a$jscomp$7_managerId$$.$win$;
  this.$element_$ = $a4a$jscomp$7_managerId$$.element;
  this.$element_$.getAttribute("type");
  this.$J$ = $refreshInterval$jscomp$3$$;
  $config$jscomp$23$$.continuousTimeMin *= 1000;
  $config$jscomp$23$$.visiblePercentageMin /= 100;
  this.$config_$ = $config$jscomp$23$$;
  this.$timer_$ = _.$Services$$module$src$services$timerFor$$(this.$D$);
  this.$F$ = this.$K$ = null;
  $a4a$jscomp$7_managerId$$ = String($refreshManagerIdCounter$$module$extensions$amp_a4a$0_1$refresh_manager$$++);
  this.$element_$.setAttribute("data-amp-ad-refresh-id", $a4a$jscomp$7_managerId$$);
  $managers$$module$extensions$amp_a4a$0_1$refresh_manager$$[$a4a$jscomp$7_managerId$$] = this;
  $JSCompiler_StaticMethods_initiateRefreshCycle$$(this);
}, $JSCompiler_StaticMethods_getIntersectionObserverWithThreshold_$$ = function($JSCompiler_StaticMethods_getIntersectionObserverWithThreshold_$self$$, $threshold$jscomp$3$$) {
  var $thresholdString$$ = String($threshold$jscomp$3$$);
  return $observers$$module$extensions$amp_a4a$0_1$refresh_manager$$[$thresholdString$$] || ($observers$$module$extensions$amp_a4a$0_1$refresh_manager$$[$thresholdString$$] = "IntersectionObserver" in $JSCompiler_StaticMethods_getIntersectionObserverWithThreshold_$self$$.$D$ ? new $JSCompiler_StaticMethods_getIntersectionObserverWithThreshold_$self$$.$D$.IntersectionObserver($JSCompiler_StaticMethods_getIntersectionObserverWithThreshold_$self$$.$I$, {threshold:$threshold$jscomp$3$$}) : new $RefreshIntersectionObserverWrapper$$module$extensions$amp_a4a$0_1$refresh_intersection_observer_wrapper$$($JSCompiler_StaticMethods_getIntersectionObserverWithThreshold_$self$$.$I$, 
  $JSCompiler_StaticMethods_getIntersectionObserverWithThreshold_$self$$.$G$, {threshold:$threshold$jscomp$3$$}));
}, $JSCompiler_StaticMethods_initiateRefreshCycle$$ = function($JSCompiler_StaticMethods_initiateRefreshCycle$self$$) {
  switch($JSCompiler_StaticMethods_initiateRefreshCycle$self$$.$state_$) {
    case "initial":
      $JSCompiler_StaticMethods_getIntersectionObserverWithThreshold_$$($JSCompiler_StaticMethods_initiateRefreshCycle$self$$, $JSCompiler_StaticMethods_initiateRefreshCycle$self$$.$config_$.visiblePercentageMin).observe($JSCompiler_StaticMethods_initiateRefreshCycle$self$$.$element_$);
  }
}, $JSCompiler_StaticMethods_startRefreshTimer_$$ = function($JSCompiler_StaticMethods_startRefreshTimer_$self$$) {
  new window.Promise(function($resolve$jscomp$51$$) {
    $JSCompiler_StaticMethods_startRefreshTimer_$self$$.$K$ = $JSCompiler_StaticMethods_startRefreshTimer_$self$$.$timer_$.delay(function() {
      $JSCompiler_StaticMethods_startRefreshTimer_$self$$.$state_$ = "initial";
      $JSCompiler_StaticMethods_startRefreshTimer_$self$$.unobserve();
      $JSCompiler_StaticMethods_startRefreshTimer_$self$$.$G$.$AmpA4A$$module$extensions$amp_a4a$0_1$amp_a4a_prototype$refresh$(function() {
        return $JSCompiler_StaticMethods_initiateRefreshCycle$$($JSCompiler_StaticMethods_startRefreshTimer_$self$$);
      });
      $resolve$jscomp$51$$(!0);
    }, $JSCompiler_StaticMethods_startRefreshTimer_$self$$.$J$);
  });
}, $safeframeListener$$module$extensions$amp_ad_network_doubleclick_impl$0_1$safeframe_host$$ = function($event$jscomp$69_safeframeHost$$) {
  var $data$jscomp$92_expandHeight$jscomp$inline_5924_resizeHeight$jscomp$inline_5931$$ = _.$tryParseJson$$module$src$json$$($event$jscomp$69_safeframeHost$$.data);
  if ("https://tpc.googlesyndication.com" == $event$jscomp$69_safeframeHost$$.origin && $data$jscomp$92_expandHeight$jscomp$inline_5924_resizeHeight$jscomp$inline_5931$$) {
    var $channel$jscomp$inline_2279_payload$jscomp$7_resizeWidth$jscomp$inline_5932$$ = _.$tryParseJson$$module$src$json$$($data$jscomp$92_expandHeight$jscomp$inline_5924_resizeHeight$jscomp$inline_5931$$.p) || {}, $expandWidth$jscomp$inline_5925_sentinel$jscomp$6$$ = $data$jscomp$92_expandHeight$jscomp$inline_5924_resizeHeight$jscomp$inline_5931$$.e || $channel$jscomp$inline_2279_payload$jscomp$7_resizeWidth$jscomp$inline_5932$$.sentinel;
    if ($event$jscomp$69_safeframeHost$$ = $safeframeHosts$$module$extensions$amp_ad_network_doubleclick_impl$0_1$safeframe_host$$[$expandWidth$jscomp$inline_5925_sentinel$jscomp$6$$]) {
      if ($event$jscomp$69_safeframeHost$$.$F$) {
        if ($channel$jscomp$inline_2279_payload$jscomp$7_resizeWidth$jscomp$inline_5932$$) {
          switch($data$jscomp$92_expandHeight$jscomp$inline_5924_resizeHeight$jscomp$inline_5931$$.s) {
            case "creative_geometry_update":
              $JSCompiler_StaticMethods_handleFluidMessage_$$($event$jscomp$69_safeframeHost$$, $channel$jscomp$inline_2279_payload$jscomp$7_resizeWidth$jscomp$inline_5932$$);
              break;
            case "expand_request":
              $event$jscomp$69_safeframeHost$$.$P$ && ($data$jscomp$92_expandHeight$jscomp$inline_5924_resizeHeight$jscomp$inline_5931$$ = Number($event$jscomp$69_safeframeHost$$.$creativeSize_$.height) + $channel$jscomp$inline_2279_payload$jscomp$7_resizeWidth$jscomp$inline_5932$$.expand_b + $channel$jscomp$inline_2279_payload$jscomp$7_resizeWidth$jscomp$inline_5932$$.expand_t, $expandWidth$jscomp$inline_5925_sentinel$jscomp$6$$ = Number($event$jscomp$69_safeframeHost$$.$creativeSize_$.width) + 
              $channel$jscomp$inline_2279_payload$jscomp$7_resizeWidth$jscomp$inline_5932$$.expand_r + $channel$jscomp$inline_2279_payload$jscomp$7_resizeWidth$jscomp$inline_5932$$.expand_l, (0,window.isNaN)($data$jscomp$92_expandHeight$jscomp$inline_5924_resizeHeight$jscomp$inline_5931$$) || (0,window.isNaN)($expandWidth$jscomp$inline_5925_sentinel$jscomp$6$$) || $channel$jscomp$inline_2279_payload$jscomp$7_resizeWidth$jscomp$inline_5932$$.push && !$event$jscomp$69_safeframeHost$$.$V$ || !$channel$jscomp$inline_2279_payload$jscomp$7_resizeWidth$jscomp$inline_5932$$.push && 
              !$event$jscomp$69_safeframeHost$$.$U$ && ($expandWidth$jscomp$inline_5925_sentinel$jscomp$6$$ > $event$jscomp$69_safeframeHost$$.$creativeSize_$.width || $data$jscomp$92_expandHeight$jscomp$inline_5924_resizeHeight$jscomp$inline_5931$$ > $event$jscomp$69_safeframeHost$$.$creativeSize_$.height) ? (_.$dev$$module$src$log$$().error("AMP-DOUBLECLICK-SAFEFRAME", "Invalid expand values."), $JSCompiler_StaticMethods_sendResizeResponse$$($event$jscomp$69_safeframeHost$$, !1, "expand_response")) : 
              $data$jscomp$92_expandHeight$jscomp$inline_5924_resizeHeight$jscomp$inline_5931$$ > $event$jscomp$69_safeframeHost$$.$viewport_$.$getSize$().height || $expandWidth$jscomp$inline_5925_sentinel$jscomp$6$$ > $event$jscomp$69_safeframeHost$$.$viewport_$.$getSize$().width ? $JSCompiler_StaticMethods_sendResizeResponse$$($event$jscomp$69_safeframeHost$$, !1, "expand_response") : $JSCompiler_StaticMethods_handleSizeChange$$($event$jscomp$69_safeframeHost$$, $data$jscomp$92_expandHeight$jscomp$inline_5924_resizeHeight$jscomp$inline_5931$$, 
              $expandWidth$jscomp$inline_5925_sentinel$jscomp$6$$, "expand_response"));
              break;
            case "register_done":
              $event$jscomp$69_safeframeHost$$.$P$ = !0;
              break;
            case "collapse_request":
              $event$jscomp$69_safeframeHost$$.$isCollapsed_$ || !$event$jscomp$69_safeframeHost$$.$P$ ? $JSCompiler_StaticMethods_sendResizeResponse$$($event$jscomp$69_safeframeHost$$, !1, "collapse_response") : $JSCompiler_StaticMethods_handleSizeChange$$($event$jscomp$69_safeframeHost$$, $event$jscomp$69_safeframeHost$$.$O$.height, $event$jscomp$69_safeframeHost$$.$O$.width, "collapse_response", !0);
              break;
            case "resize_request":
              $event$jscomp$69_safeframeHost$$.$P$ && ($data$jscomp$92_expandHeight$jscomp$inline_5924_resizeHeight$jscomp$inline_5931$$ = Number($event$jscomp$69_safeframeHost$$.$creativeSize_$.height) + ($channel$jscomp$inline_2279_payload$jscomp$7_resizeWidth$jscomp$inline_5932$$.resize_b + $channel$jscomp$inline_2279_payload$jscomp$7_resizeWidth$jscomp$inline_5932$$.resize_t), $channel$jscomp$inline_2279_payload$jscomp$7_resizeWidth$jscomp$inline_5932$$ = Number($event$jscomp$69_safeframeHost$$.$creativeSize_$.width) + 
              ($channel$jscomp$inline_2279_payload$jscomp$7_resizeWidth$jscomp$inline_5932$$.resize_r + $channel$jscomp$inline_2279_payload$jscomp$7_resizeWidth$jscomp$inline_5932$$.resize_l), (0,window.isNaN)($channel$jscomp$inline_2279_payload$jscomp$7_resizeWidth$jscomp$inline_5932$$) || (0,window.isNaN)($data$jscomp$92_expandHeight$jscomp$inline_5924_resizeHeight$jscomp$inline_5931$$) ? _.$dev$$module$src$log$$().error("AMP-DOUBLECLICK-SAFEFRAME", "Invalid resize values.") : $JSCompiler_StaticMethods_resizeAmpAdAndSafeframe$$($event$jscomp$69_safeframeHost$$, 
              $data$jscomp$92_expandHeight$jscomp$inline_5924_resizeHeight$jscomp$inline_5931$$, $channel$jscomp$inline_2279_payload$jscomp$7_resizeWidth$jscomp$inline_5932$$, "resize_response", !0));
          }
        }
      } else {
        $channel$jscomp$inline_2279_payload$jscomp$7_resizeWidth$jscomp$inline_5932$$ = $data$jscomp$92_expandHeight$jscomp$inline_5924_resizeHeight$jscomp$inline_5931$$.c, $event$jscomp$69_safeframeHost$$.$iframe_$ = $event$jscomp$69_safeframeHost$$.$D$.iframe, $event$jscomp$69_safeframeHost$$.$F$ = $channel$jscomp$inline_2279_payload$jscomp$7_resizeWidth$jscomp$inline_5932$$, $JSCompiler_StaticMethods_setupGeom_$$($event$jscomp$69_safeframeHost$$), $event$jscomp$69_safeframeHost$$.$sendMessage_$({message:"connect", 
        c:$event$jscomp$69_safeframeHost$$.$F$}, "");
      }
    } else {
      _.$dev$$module$src$log$$().$Log$$module$src$log_prototype$warn$("AMP-DOUBLECLICK-SAFEFRAME", "Safeframe Host for sentinel: " + $expandWidth$jscomp$inline_5925_sentinel$jscomp$6$$ + " not found.");
    }
  }
}, $SafeframeHostApi$$module$extensions$amp_ad_network_doubleclick_impl$0_1$safeframe_host$$ = function($baseInstance$jscomp$2_sfConfig$$, $isFluid$jscomp$1$$, $creativeSize$$) {
  this.$D$ = $baseInstance$jscomp$2_sfConfig$$;
  this.$K$ = this.$D$.$verifyStillCurrent$.bind(this.$D$)();
  this.$J$ = this.$D$.$win$;
  this.$G$ = this.$D$.sentinel;
  this.$I$ = this.$F$ = this.$iframe_$ = null;
  this.$Y$ = Math.random();
  this.$R$ = Math.random();
  this.$aa$ = $isFluid$jscomp$1$$;
  this.$creativeSize_$ = $creativeSize$$;
  this.$O$ = Object.assign({}, $creativeSize$$);
  this.$viewport_$ = this.$D$.$getViewport$();
  this.$isCollapsed_$ = !0;
  this.$P$ = !1;
  $baseInstance$jscomp$2_sfConfig$$ = Object(_.$tryParseJson$$module$src$json$$(this.$D$.element.getAttribute("data-safeframe-config")) || {});
  this.$U$ = _.$hasOwn$$module$src$utils$object$$($baseInstance$jscomp$2_sfConfig$$, "expandByOverlay") ? $baseInstance$jscomp$2_sfConfig$$.expandByOverlay : !0;
  this.$V$ = _.$hasOwn$$module$src$utils$object$$($baseInstance$jscomp$2_sfConfig$$, "expandByPush") ? $baseInstance$jscomp$2_sfConfig$$.expandByPush : !0;
  this.$unlisten_$ = null;
  $safeframeHosts$$module$extensions$amp_ad_network_doubleclick_impl$0_1$safeframe_host$$[this.$G$] = $safeframeHosts$$module$extensions$amp_ad_network_doubleclick_impl$0_1$safeframe_host$$[this.$G$] || this;
  $safeframeListenerCreated_$$module$extensions$amp_ad_network_doubleclick_impl$0_1$safeframe_host$$ || ($safeframeListenerCreated_$$module$extensions$amp_ad_network_doubleclick_impl$0_1$safeframe_host$$ = !0, this.$J$.addEventListener("message", $safeframeListener$$module$extensions$amp_ad_network_doubleclick_impl$0_1$safeframe_host$$, !1));
}, $JSCompiler_StaticMethods_maybeGetCanonicalUrl$$ = function($JSCompiler_StaticMethods_maybeGetCanonicalUrl$self_metaReferrer$$) {
  var $canonicalUrl$jscomp$5$$ = _.$Services$$module$src$services$documentInfoForDoc$$($JSCompiler_StaticMethods_maybeGetCanonicalUrl$self_metaReferrer$$.$D$.$getAmpDoc$()).canonicalUrl;
  $JSCompiler_StaticMethods_maybeGetCanonicalUrl$self_metaReferrer$$ = $JSCompiler_StaticMethods_maybeGetCanonicalUrl$self_metaReferrer$$.$J$.document.querySelector("meta[name='referrer']");
  if (!$JSCompiler_StaticMethods_maybeGetCanonicalUrl$self_metaReferrer$$) {
    return $canonicalUrl$jscomp$5$$;
  }
  switch($JSCompiler_StaticMethods_maybeGetCanonicalUrl$self_metaReferrer$$.getAttribute("content")) {
    case "same-origin":
      return;
    case "no-referrer":
      return;
    case "origin":
      return _.$parseUrlDeprecated$$module$src$url$$($canonicalUrl$jscomp$5$$).origin;
  }
  return $canonicalUrl$jscomp$5$$;
}, $JSCompiler_StaticMethods_setupGeom_$$ = function($JSCompiler_StaticMethods_setupGeom_$self$$) {
  var $throttledUpdate$$ = _.$throttle$$module$src$utils$rate_limit$$($JSCompiler_StaticMethods_setupGeom_$self$$.$J$, $JSCompiler_StaticMethods_setupGeom_$self$$.$W$.bind($JSCompiler_StaticMethods_setupGeom_$self$$), 1000), $scrollUnlistener$$ = _.$JSCompiler_StaticMethods_Viewport$$module$src$service$viewport$viewport_impl_prototype$onScroll$$($JSCompiler_StaticMethods_setupGeom_$self$$.$viewport_$, $throttledUpdate$$), $changedUnlistener$$ = _.$JSCompiler_StaticMethods_onChanged$$($JSCompiler_StaticMethods_setupGeom_$self$$.$viewport_$, 
  $throttledUpdate$$);
  $JSCompiler_StaticMethods_setupGeom_$self$$.$unlisten_$ = function() {
    $scrollUnlistener$$();
    $changedUnlistener$$();
  };
  $JSCompiler_StaticMethods_setupGeom_$self$$.$W$();
}, $JSCompiler_StaticMethods_formatGeom_$$ = function($JSCompiler_StaticMethods_formatGeom_$self$$, $currentGeometry_iframeBox$jscomp$2$$) {
  var $viewportSize$jscomp$8$$ = $JSCompiler_StaticMethods_formatGeom_$self$$.$viewport_$.$getSize$(), $scrollLeft$jscomp$7$$ = $JSCompiler_StaticMethods_formatGeom_$self$$.$viewport_$.getScrollLeft(), $scrollTop$jscomp$12$$ = _.$JSCompiler_StaticMethods_Viewport$$module$src$service$viewport$viewport_impl_prototype$getScrollTop$$($JSCompiler_StaticMethods_formatGeom_$self$$.$viewport_$);
  $currentGeometry_iframeBox$jscomp$2$$ = {windowCoords_t:0, windowCoords_r:$viewportSize$jscomp$8$$.width, windowCoords_b:$viewportSize$jscomp$8$$.height, windowCoords_l:0, frameCoords_t:$currentGeometry_iframeBox$jscomp$2$$.top + $scrollTop$jscomp$12$$, frameCoords_r:$currentGeometry_iframeBox$jscomp$2$$.right + $scrollLeft$jscomp$7$$, frameCoords_b:$currentGeometry_iframeBox$jscomp$2$$.bottom + $scrollTop$jscomp$12$$, frameCoords_l:$currentGeometry_iframeBox$jscomp$2$$.left + $scrollLeft$jscomp$7$$, 
  posCoords_t:$currentGeometry_iframeBox$jscomp$2$$.top, posCoords_b:$currentGeometry_iframeBox$jscomp$2$$.bottom, posCoords_r:$currentGeometry_iframeBox$jscomp$2$$.right, posCoords_l:$currentGeometry_iframeBox$jscomp$2$$.left, styleZIndex:_.$getStyle$$module$src$style$$($JSCompiler_StaticMethods_formatGeom_$self$$.$D$.element, "zIndex"), allowedExpansion_r:$viewportSize$jscomp$8$$.width - $currentGeometry_iframeBox$jscomp$2$$.width, allowedExpansion_b:$viewportSize$jscomp$8$$.height - $currentGeometry_iframeBox$jscomp$2$$.height, 
  allowedExpansion_t:0, allowedExpansion_l:0, yInView:$JSCompiler_StaticMethods_getPercInView$$($viewportSize$jscomp$8$$.height, $currentGeometry_iframeBox$jscomp$2$$.top, $currentGeometry_iframeBox$jscomp$2$$.bottom), xInView:$JSCompiler_StaticMethods_getPercInView$$($viewportSize$jscomp$8$$.width, $currentGeometry_iframeBox$jscomp$2$$.left, $currentGeometry_iframeBox$jscomp$2$$.right)};
  $JSCompiler_StaticMethods_formatGeom_$self$$.$I$ = $currentGeometry_iframeBox$jscomp$2$$;
  return JSON.stringify($currentGeometry_iframeBox$jscomp$2$$);
}, $JSCompiler_StaticMethods_getPercInView$$ = function($rootBoundEnd$$, $boundingRectStart$$, $boundingRectEnd$$) {
  return Math.max(0, Math.min(1, ($boundingRectEnd$$ >= $rootBoundEnd$$ ? $rootBoundEnd$$ - $boundingRectStart$$ : $boundingRectEnd$$) / ($boundingRectEnd$$ - $boundingRectStart$$))) || 0;
}, $JSCompiler_StaticMethods_resizeSafeframe$$ = function($JSCompiler_StaticMethods_resizeSafeframe$self$$, $height$jscomp$25$$, $width$jscomp$28$$, $messageType$$) {
  $JSCompiler_StaticMethods_resizeSafeframe$self$$.$isCollapsed_$ = "collapse_response" == $messageType$$;
  $JSCompiler_StaticMethods_resizeSafeframe$self$$.$D$.$measureMutateElement$(function() {
    _.$Resource$$module$src$service$resource$forElementOptional$$($JSCompiler_StaticMethods_resizeSafeframe$self$$.$D$.element).measure();
  }, function() {
    $JSCompiler_StaticMethods_resizeSafeframe$self$$.$iframe_$ && (_.$setStyles$$module$src$style$$($JSCompiler_StaticMethods_resizeSafeframe$self$$.$iframe_$, {height:$height$jscomp$25$$ + "px", width:$width$jscomp$28$$ + "px"}), $JSCompiler_StaticMethods_resizeSafeframe$self$$.$creativeSize_$.height = $height$jscomp$25$$, $JSCompiler_StaticMethods_resizeSafeframe$self$$.$creativeSize_$.width = $width$jscomp$28$$);
    $JSCompiler_StaticMethods_sendResizeResponse$$($JSCompiler_StaticMethods_resizeSafeframe$self$$, !0, $messageType$$);
  }, $JSCompiler_StaticMethods_resizeSafeframe$self$$.$iframe_$);
}, $JSCompiler_StaticMethods_handleSizeChange$$ = function($JSCompiler_StaticMethods_handleSizeChange$self$$, $height$jscomp$26$$, $width$jscomp$29$$, $messageType$jscomp$1$$, $optIsCollapse$$) {
  _.$JSCompiler_StaticMethods_getClientRectAsync$$($JSCompiler_StaticMethods_handleSizeChange$self$$.$viewport_$, $JSCompiler_StaticMethods_handleSizeChange$self$$.$D$.element).then(function($box$jscomp$13$$) {
    !$optIsCollapse$$ && $width$jscomp$29$$ <= $box$jscomp$13$$.width && $height$jscomp$26$$ <= $box$jscomp$13$$.height ? $JSCompiler_StaticMethods_resizeSafeframe$$($JSCompiler_StaticMethods_handleSizeChange$self$$, $height$jscomp$26$$, $width$jscomp$29$$, $messageType$jscomp$1$$) : $JSCompiler_StaticMethods_resizeAmpAdAndSafeframe$$($JSCompiler_StaticMethods_handleSizeChange$self$$, $height$jscomp$26$$, $width$jscomp$29$$, $messageType$jscomp$1$$, $optIsCollapse$$);
  });
}, $JSCompiler_StaticMethods_sendResizeResponse$$ = function($JSCompiler_StaticMethods_sendResizeResponse$self$$, $success$jscomp$9$$, $messageType$jscomp$2$$) {
  $JSCompiler_StaticMethods_sendResizeResponse$self$$.$iframe_$ && _.$JSCompiler_StaticMethods_getClientRectAsync$$($JSCompiler_StaticMethods_sendResizeResponse$self$$.$viewport_$, $JSCompiler_StaticMethods_sendResizeResponse$self$$.$iframe_$).then(function($formattedGeom$jscomp$1_iframeBox$jscomp$3$$) {
    $JSCompiler_StaticMethods_sendResizeResponse$self$$.$K$();
    $formattedGeom$jscomp$1_iframeBox$jscomp$3$$ = $JSCompiler_StaticMethods_formatGeom_$$($JSCompiler_StaticMethods_sendResizeResponse$self$$, $formattedGeom$jscomp$1_iframeBox$jscomp$3$$);
    $JSCompiler_StaticMethods_sendResizeResponse$self$$.$sendMessage_$({uid:$JSCompiler_StaticMethods_sendResizeResponse$self$$.$R$, $success$:$success$jscomp$9$$, $newGeometry$:$formattedGeom$jscomp$1_iframeBox$jscomp$3$$, expand_t:$JSCompiler_StaticMethods_sendResizeResponse$self$$.$I$.allowedExpansion_t, expand_b:$JSCompiler_StaticMethods_sendResizeResponse$self$$.$I$.allowedExpansion_b, expand_r:$JSCompiler_StaticMethods_sendResizeResponse$self$$.$I$.allowedExpansion_r, expand_l:$JSCompiler_StaticMethods_sendResizeResponse$self$$.$I$.allowedExpansion_l, 
    push:!0}, $messageType$jscomp$2$$);
  }).catch(function($JSCompiler_StaticMethods_sendResizeResponse$self$$) {
    return _.$dev$$module$src$log$$().error("AMP-DOUBLECLICK-SAFEFRAME", $JSCompiler_StaticMethods_sendResizeResponse$self$$);
  });
}, $JSCompiler_StaticMethods_resizeAmpAdAndSafeframe$$ = function($JSCompiler_StaticMethods_resizeAmpAdAndSafeframe$self$$, $height$jscomp$27$$, $width$jscomp$30$$, $messageType$jscomp$3$$, $opt_isShrinking$$) {
  $JSCompiler_StaticMethods_resizeAmpAdAndSafeframe$self$$.$D$.$attemptChangeSize$($height$jscomp$27$$, $width$jscomp$30$$).then(function() {
    $JSCompiler_StaticMethods_resizeAmpAdAndSafeframe$self$$.$K$();
    $JSCompiler_StaticMethods_resizeSafeframe$$($JSCompiler_StaticMethods_resizeAmpAdAndSafeframe$self$$, $height$jscomp$27$$, $width$jscomp$30$$, $messageType$jscomp$3$$);
  }, function() {
    _.$Resource$$module$src$service$resource$forElementOptional$$($JSCompiler_StaticMethods_resizeAmpAdAndSafeframe$self$$.$D$.element).$P$ = void 0;
    $opt_isShrinking$$ ? $JSCompiler_StaticMethods_resizeSafeframe$$($JSCompiler_StaticMethods_resizeAmpAdAndSafeframe$self$$, $height$jscomp$27$$, $width$jscomp$30$$, $messageType$jscomp$3$$) : $JSCompiler_StaticMethods_sendResizeResponse$$($JSCompiler_StaticMethods_resizeAmpAdAndSafeframe$self$$, !1, $messageType$jscomp$3$$);
  }).catch(function($height$jscomp$27$$) {
    "CANCELLED" == $height$jscomp$27$$.message ? _.$dev$$module$src$log$$().error("AMP-DOUBLECLICK-SAFEFRAME", $height$jscomp$27$$) : (_.$dev$$module$src$log$$().error("AMP-DOUBLECLICK-SAFEFRAME", "Resizing failed: " + $height$jscomp$27$$), $JSCompiler_StaticMethods_sendResizeResponse$$($JSCompiler_StaticMethods_resizeAmpAdAndSafeframe$self$$, !1, $messageType$jscomp$3$$));
  });
}, $JSCompiler_StaticMethods_handleFluidMessage_$$ = function($JSCompiler_StaticMethods_handleFluidMessage_$self$$, $payload$jscomp$12$$) {
  var $newHeight$jscomp$10$$;
  $payload$jscomp$12$$ && ($newHeight$jscomp$10$$ = (0,window.parseInt)($payload$jscomp$12$$.height, 10)) && _.$JSCompiler_StaticMethods_attemptChangeHeight$$($JSCompiler_StaticMethods_handleFluidMessage_$self$$.$D$, $newHeight$jscomp$10$$).then(function() {
    $JSCompiler_StaticMethods_handleFluidMessage_$self$$.$K$();
    var $payload$jscomp$12$$ = $newHeight$jscomp$10$$, $iframe$jscomp$inline_2287$$ = $JSCompiler_StaticMethods_handleFluidMessage_$self$$.$D$.iframe;
    ((0,window.parseInt)(_.$getStyle$$module$src$style$$($iframe$jscomp$inline_2287$$, "height"), 10) || 0) != $payload$jscomp$12$$ && _.$setStyles$$module$src$style$$($iframe$jscomp$inline_2287$$, {height:$payload$jscomp$12$$ + "px"});
    $JSCompiler_StaticMethods_fireFluidDelayedImpression$$($JSCompiler_StaticMethods_handleFluidMessage_$self$$.$D$);
    $JSCompiler_StaticMethods_handleFluidMessage_$self$$.$iframe_$.contentWindow.postMessage(JSON.stringify(_.$dict$$module$src$utils$object$$({message:"resize-complete", c:$JSCompiler_StaticMethods_handleFluidMessage_$self$$.$F$})), "https://tpc.googlesyndication.com");
  }).catch(function($JSCompiler_StaticMethods_handleFluidMessage_$self$$) {
    "CANCELLED" == $JSCompiler_StaticMethods_handleFluidMessage_$self$$.message && _.$dev$$module$src$log$$().error("AMP-DOUBLECLICK-SAFEFRAME", $JSCompiler_StaticMethods_handleFluidMessage_$self$$);
  });
}, $constructSRABlockParameters$$module$extensions$amp_ad_network_doubleclick_impl$0_1$sra_utils$$ = function($impls$$) {
  var $parameters$jscomp$3$$ = {output:"ldjh", impl:"fifs"};
  $SRA_JOINERS$$module$extensions$amp_ad_network_doubleclick_impl$0_1$sra_utils$$.forEach(function($joiner$$) {
    return Object.assign($parameters$jscomp$3$$, $joiner$$($impls$$));
  });
  return $parameters$jscomp$3$$;
}, $getFirstInstanceValue_$$module$extensions$amp_ad_network_doubleclick_impl$0_1$sra_utils$$ = function($impls$jscomp$1$$, $extractFn$$) {
  for (var $i$jscomp$188$$ = 0; $i$jscomp$188$$ < $impls$jscomp$1$$.length; $i$jscomp$188$$++) {
    var $val$jscomp$13$$ = $extractFn$$($impls$jscomp$1$$[$i$jscomp$188$$]);
    if ($val$jscomp$13$$) {
      return $val$jscomp$13$$;
    }
  }
  return null;
}, $combineInventoryUnits$$module$extensions$amp_ad_network_doubleclick_impl$0_1$sra_utils$$ = function($impls$jscomp$2$$) {
  var $uniqueIuNames$$ = {}, $iuNamesOutput$$ = [], $uniqueIuNamesCount$$ = 0, $prevIusEncoded$$ = [];
  $impls$jscomp$2$$.forEach(function($impls$jscomp$2$$) {
    $impls$jscomp$2$$ = $impls$jscomp$2$$.element.getAttribute("data-slot").split("/");
    for (var $componentNames_instance$jscomp$2$$ = [], $i$jscomp$189$$ = 0; $i$jscomp$189$$ < $impls$jscomp$2$$.length; $i$jscomp$189$$++) {
      if ("" != $impls$jscomp$2$$[$i$jscomp$189$$]) {
        var $index$jscomp$86$$ = $uniqueIuNames$$[$impls$jscomp$2$$[$i$jscomp$189$$]];
        void 0 == $index$jscomp$86$$ && ($iuNamesOutput$$.push($impls$jscomp$2$$[$i$jscomp$189$$]), $uniqueIuNames$$[$impls$jscomp$2$$[$i$jscomp$189$$]] = $index$jscomp$86$$ = $uniqueIuNamesCount$$++);
        $componentNames_instance$jscomp$2$$.push($index$jscomp$86$$);
      }
    }
    $prevIusEncoded$$.push($componentNames_instance$jscomp$2$$.join("/"));
  });
  return {iu_parts:$iuNamesOutput$$.join(), enc_prev_ius:$prevIusEncoded$$.join()};
}, $getCookieOptOut$$module$extensions$amp_ad_network_doubleclick_impl$0_1$sra_utils$$ = function($impls$jscomp$3$$) {
  return $getFirstInstanceValue_$$module$extensions$amp_ad_network_doubleclick_impl$0_1$sra_utils$$($impls$jscomp$3$$, function($impls$jscomp$3$$) {
    return $impls$jscomp$3$$.$jsonTargeting$ && $impls$jscomp$3$$.$jsonTargeting$.cookieOptOut ? {co:"1"} : null;
  });
}, $getAdks$$module$extensions$amp_ad_network_doubleclick_impl$0_1$sra_utils$$ = function($impls$jscomp$4$$) {
  return {adks:$impls$jscomp$4$$.map(function($impls$jscomp$4$$) {
    return $impls$jscomp$4$$.$adKey$;
  }).join()};
}, $getSizes$$module$extensions$amp_ad_network_doubleclick_impl$0_1$sra_utils$$ = function($impls$jscomp$5$$) {
  return {prev_iu_szs:$impls$jscomp$5$$.map(function($impls$jscomp$5$$) {
    return $impls$jscomp$5$$.$parameterSize$;
  }).join()};
}, $getTfcd$$module$extensions$amp_ad_network_doubleclick_impl$0_1$sra_utils$$ = function($impls$jscomp$6$$) {
  return $getFirstInstanceValue_$$module$extensions$amp_ad_network_doubleclick_impl$0_1$sra_utils$$($impls$jscomp$6$$, function($impls$jscomp$6$$) {
    return $impls$jscomp$6$$.$jsonTargeting$ && $impls$jscomp$6$$.$jsonTargeting$.tagForChildDirectedTreatment ? {tfcd:$impls$jscomp$6$$.$jsonTargeting$.tagForChildDirectedTreatment} : null;
  });
}, $isAdTest$$module$extensions$amp_ad_network_doubleclick_impl$0_1$sra_utils$$ = function($impls$jscomp$7$$) {
  return $getFirstInstanceValue_$$module$extensions$amp_ad_network_doubleclick_impl$0_1$sra_utils$$($impls$jscomp$7$$, function($impls$jscomp$7$$) {
    return _.$isInExperiment$$module$ads$google$a4a$traffic_experiments$$($impls$jscomp$7$$.element) ? {adtest:"on"} : null;
  });
}, $getTargetingAndExclusions$$module$extensions$amp_ad_network_doubleclick_impl$0_1$sra_utils$$ = function($impls$jscomp$8$$) {
  var $hasScp$$ = !1, $scps$$ = [];
  $impls$jscomp$8$$.forEach(function($impls$jscomp$8$$) {
    $impls$jscomp$8$$.$jsonTargeting$ && ($impls$jscomp$8$$.$jsonTargeting$.targeting || $impls$jscomp$8$$.$jsonTargeting$.categoryExclusions) ? ($hasScp$$ = !0, $scps$$.push($serializeTargeting$$module$extensions$amp_ad_network_doubleclick_impl$0_1$sra_utils$$($impls$jscomp$8$$.$jsonTargeting$.targeting || null, $impls$jscomp$8$$.$jsonTargeting$.categoryExclusions || null))) : $scps$$.push("");
  });
  return $hasScp$$ ? {prev_scp:$scps$$.join("|")} : null;
}, $getExperimentIds$$module$extensions$amp_ad_network_doubleclick_impl$0_1$sra_utils$$ = function($eidKeys_impls$jscomp$9$$) {
  var $eids$jscomp$2$$ = {};
  (($eidKeys_impls$jscomp$9$$.length && /(?:#|,)deid=([\d,]+)/i.exec($eidKeys_impls$jscomp$9$$[0].$win$.location.hash) || [])[1] || "").split(",").forEach(function($eidKeys_impls$jscomp$9$$) {
    return $eidKeys_impls$jscomp$9$$ && ($eids$jscomp$2$$[$eidKeys_impls$jscomp$9$$] = 1);
  });
  $eidKeys_impls$jscomp$9$$.forEach(function($eidKeys_impls$jscomp$9$$) {
    return $eidKeys_impls$jscomp$9$$.$experimentIds$.forEach(function($eidKeys_impls$jscomp$9$$) {
      return $eids$jscomp$2$$[$eidKeys_impls$jscomp$9$$] = 1;
    });
  });
  return ($eidKeys_impls$jscomp$9$$ = Object.keys($eids$jscomp$2$$).join()) ? {eid:$eidKeys_impls$jscomp$9$$} : null;
}, $getIdentity$$module$extensions$amp_ad_network_doubleclick_impl$0_1$sra_utils$$ = function($impls$jscomp$10$$) {
  return $getFirstInstanceValue_$$module$extensions$amp_ad_network_doubleclick_impl$0_1$sra_utils$$($impls$jscomp$10$$, function($impls$jscomp$10$$) {
    return $JSCompiler_StaticMethods_buildIdentityParams$$($impls$jscomp$10$$);
  });
}, $getForceSafeframe$$module$extensions$amp_ad_network_doubleclick_impl$0_1$sra_utils$$ = function($impls$jscomp$11$$) {
  var $safeframeForced$$ = !1, $forceSafeframes$$ = [];
  $impls$jscomp$11$$.forEach(function($impls$jscomp$11$$) {
    $safeframeForced$$ = $safeframeForced$$ || $impls$jscomp$11$$.$forceSafeframe$;
    $forceSafeframes$$.push(Number($impls$jscomp$11$$.$forceSafeframe$));
  });
  return $safeframeForced$$ ? {fsfs:$forceSafeframes$$.join()} : null;
}, $getPageOffsets$$module$extensions$amp_ad_network_doubleclick_impl$0_1$sra_utils$$ = function($impls$jscomp$12$$) {
  var $adxs$$ = [], $adys$$ = [];
  $impls$jscomp$12$$.forEach(function($impls$jscomp$12$$) {
    $impls$jscomp$12$$ = $impls$jscomp$12$$.$getPageLayoutBox$();
    $adxs$$.push($impls$jscomp$12$$.left);
    $adys$$.push($impls$jscomp$12$$.top);
  });
  return {adxs:$adxs$$.join(), adys:$adys$$.join()};
}, $getContainers$$module$extensions$amp_ad_network_doubleclick_impl$0_1$sra_utils$$ = function($impls$jscomp$13$$) {
  var $hasAmpContainer$$ = !1, $result$jscomp$27$$ = [];
  $impls$jscomp$13$$.forEach(function($impls$jscomp$13$$) {
    $impls$jscomp$13$$ = _.$getEnclosingContainerTypes$$module$ads$google$a4a$utils$$($impls$jscomp$13$$.element);
    $result$jscomp$27$$.push($impls$jscomp$13$$.join());
    $hasAmpContainer$$ = $hasAmpContainer$$ || !!$impls$jscomp$13$$.length;
  });
  return $hasAmpContainer$$ ? {acts:$result$jscomp$27$$.join("|")} : null;
}, $getIsFluid$$module$extensions$amp_ad_network_doubleclick_impl$0_1$sra_utils$$ = function($impls$jscomp$14$$) {
  var $hasFluid$$ = !1, $result$jscomp$28$$ = [];
  $impls$jscomp$14$$.forEach(function($impls$jscomp$14$$) {
    $impls$jscomp$14$$.$isFluidRequest_$ ? ($hasFluid$$ = !0, $result$jscomp$28$$.push("height")) : $result$jscomp$28$$.push("0");
  });
  return $hasFluid$$ ? {fluid:$result$jscomp$28$$.join()} : null;
}, $serializeTargeting$$module$extensions$amp_ad_network_doubleclick_impl$0_1$sra_utils$$ = function($targeting$$, $categoryExclusions$$) {
  var $serialized$$ = $targeting$$ ? Object.keys($targeting$$).map(function($categoryExclusions$$) {
    return $serializeItem_$$module$extensions$amp_ad_network_doubleclick_impl$0_1$sra_utils$$($categoryExclusions$$, $targeting$$[$categoryExclusions$$]);
  }) : [];
  $categoryExclusions$$ && $serialized$$.push($serializeItem_$$module$extensions$amp_ad_network_doubleclick_impl$0_1$sra_utils$$("excl_cat", $categoryExclusions$$));
  return $serialized$$.length ? $serialized$$.join("&") : null;
}, $serializeItem_$$module$extensions$amp_ad_network_doubleclick_impl$0_1$sra_utils$$ = function($key$jscomp$83$$, $serializedValue_value$jscomp$167$$) {
  $serializedValue_value$jscomp$167$$ = (Array.isArray($serializedValue_value$jscomp$167$$) ? $serializedValue_value$jscomp$167$$ : [$serializedValue_value$jscomp$167$$]).map(window.encodeURIComponent).join();
  return (0,window.encodeURIComponent)($key$jscomp$83$$) + "=" + $serializedValue_value$jscomp$167$$;
}, $sraBlockCallbackHandler$$module$extensions$amp_ad_network_doubleclick_impl$0_1$sra_utils$$ = function($creative$jscomp$8$$, $headersObj$$, $done$jscomp$3$$, $sraRequestAdUrlResolvers$$, $sraUrl$$) {
  var $headerNames$$ = Object.keys($headersObj$$);
  1 == $headerNames$$.length && _.$isObject$$module$src$types$$($headersObj$$[$headerNames$$[0]]) && ($headersObj$$ = $headersObj$$[$headerNames$$[0]], $headersObj$$ = Object.keys($headersObj$$).reduce(function($creative$jscomp$8$$, $done$jscomp$3$$) {
    $creative$jscomp$8$$[$done$jscomp$3$$.toLowerCase()] = $headersObj$$[$done$jscomp$3$$];
    return $creative$jscomp$8$$;
  }, {}));
  $headersObj$$["x-ampadrender"] = "safeframe";
  $sraRequestAdUrlResolvers$$.shift()({headers:{get:function($creative$jscomp$8$$) {
    ($creative$jscomp$8$$ = $headersObj$$[$creative$jscomp$8$$.toLowerCase()]) && "string" != typeof $creative$jscomp$8$$ && ($creative$jscomp$8$$ = JSON.stringify($creative$jscomp$8$$));
    return $creative$jscomp$8$$;
  }, has:function($creative$jscomp$8$$) {
    return !!$headersObj$$[$creative$jscomp$8$$.toLowerCase()];
  }}, arrayBuffer:function() {
    return _.$tryResolve$$module$src$utils$promise$$(function() {
      return _.$utf8Encode$$module$src$utils$bytes$$($creative$jscomp$8$$);
    });
  }});
  $done$jscomp$3$$ && $sraRequestAdUrlResolvers$$.length && _.$dev$$module$src$log$$().$Log$$module$src$log_prototype$warn$("amp-ad-network-doubleclick-impl", "Premature end of SRA response", $sraRequestAdUrlResolvers$$.length, $sraUrl$$);
}, $AmpAdNetworkDoubleclickImpl$$module$extensions$amp_ad_network_doubleclick_impl$0_1$amp_ad_network_doubleclick_impl$$ = function($$jscomp$super$this$jscomp$11_element$jscomp$296$$) {
  $$jscomp$super$this$jscomp$11_element$jscomp$296$$ = _.$AmpA4A$$module$extensions$amp_a4a$0_1$amp_a4a$$.call(this, $$jscomp$super$this$jscomp$11_element$jscomp$296$$) || this;
  $$jscomp$super$this$jscomp$11_element$jscomp$296$$.$ampAnalyticsConfig_$ = null;
  $$jscomp$super$this$jscomp$11_element$jscomp$296$$.$extensions_$ = _.$Services$$module$src$services$extensionsFor$$($$jscomp$super$this$jscomp$11_element$jscomp$296$$.$win$);
  $$jscomp$super$this$jscomp$11_element$jscomp$296$$.$qqid_$ = null;
  $$jscomp$super$this$jscomp$11_element$jscomp$296$$.$initialSize_$ = null;
  $$jscomp$super$this$jscomp$11_element$jscomp$296$$.$parameterSize$ = null;
  $$jscomp$super$this$jscomp$11_element$jscomp$296$$.$returnedSize_$ = null;
  $$jscomp$super$this$jscomp$11_element$jscomp$296$$.$ampAnalyticsElement_$ = null;
  $$jscomp$super$this$jscomp$11_element$jscomp$296$$.$jsonTargeting$ = null;
  $$jscomp$super$this$jscomp$11_element$jscomp$296$$.$adKey$ = 0;
  $$jscomp$super$this$jscomp$11_element$jscomp$296$$.$experimentIds$ = [];
  $$jscomp$super$this$jscomp$11_element$jscomp$296$$.$useSra$ = !1;
  $$jscomp$super$this$jscomp$11_element$jscomp$296$$.$sraDeferred$ = null;
  $$jscomp$super$this$jscomp$11_element$jscomp$296$$.$refreshManager_$ = null;
  $$jscomp$super$this$jscomp$11_element$jscomp$296$$.$refreshCount_$ = 0;
  $$jscomp$super$this$jscomp$11_element$jscomp$296$$.$ifi_$ = 0;
  $$jscomp$super$this$jscomp$11_element$jscomp$296$$.$isFluidRequest_$ = !1;
  $$jscomp$super$this$jscomp$11_element$jscomp$296$$.$isFluidPrimaryRequest_$ = !1;
  $$jscomp$super$this$jscomp$11_element$jscomp$296$$.$fluidImpressionUrl_$ = null;
  $$jscomp$super$this$jscomp$11_element$jscomp$296$$.$identityTokenPromise_$ = null;
  $$jscomp$super$this$jscomp$11_element$jscomp$296$$.$identityToken$ = null;
  $$jscomp$super$this$jscomp$11_element$jscomp$296$$.$troubleshootData_$ = {};
  $$jscomp$super$this$jscomp$11_element$jscomp$296$$.$isAmpCreative_$ = null;
  $$jscomp$super$this$jscomp$11_element$jscomp$296$$.$isIdleRender_$ = !1;
  $$jscomp$super$this$jscomp$11_element$jscomp$296$$.$safeframeApi_$ = null;
  $$jscomp$super$this$jscomp$11_element$jscomp$296$$.$forceSafeframe$ = !1;
  "forceSafeframe" in $$jscomp$super$this$jscomp$11_element$jscomp$296$$.element.dataset && (/^(1|(true))$/i.test($$jscomp$super$this$jscomp$11_element$jscomp$296$$.element.dataset.forceSafeframe) ? $$jscomp$super$this$jscomp$11_element$jscomp$296$$.$forceSafeframe$ = !0 : _.$user$$module$src$log$$().$Log$$module$src$log_prototype$warn$("amp-ad-network-doubleclick-impl", "Ignoring invalid data-force-safeframe attribute: " + $$jscomp$super$this$jscomp$11_element$jscomp$296$$.element.dataset.forceSafeframe));
  $$jscomp$super$this$jscomp$11_element$jscomp$296$$.$consentState$ = null;
  $$jscomp$super$this$jscomp$11_element$jscomp$296$$.$getAdUrlDeferred$ = new _.$Deferred$$module$src$utils$promise$$;
  $$jscomp$super$this$jscomp$11_element$jscomp$296$$.$reattemptToExpandFluidCreative_$ = !1;
  $$jscomp$super$this$jscomp$11_element$jscomp$296$$.$shouldSandbox_$ = !1;
  return $$jscomp$super$this$jscomp$11_element$jscomp$296$$;
}, $JSCompiler_StaticMethods_getIdleRenderEnabled_$$ = function($JSCompiler_StaticMethods_getIdleRenderEnabled_$self_expVal$$) {
  if ($JSCompiler_StaticMethods_getIdleRenderEnabled_$self_expVal$$.$isIdleRender_$) {
    return $JSCompiler_StaticMethods_getIdleRenderEnabled_$self_expVal$$.$isIdleRender_$;
  }
  if ($JSCompiler_StaticMethods_getIdleRenderEnabled_$self_expVal$$.element.getAttribute("data-loading-strategy")) {
    return !1;
  }
  $JSCompiler_StaticMethods_getIdleRenderEnabled_$self_expVal$$ = $JSCompiler_StaticMethods_getIdleRenderEnabled_$self_expVal$$.$postAdResponseExperimentFeatures$["render-idle-vp"];
  var $vpRange$$ = (0,window.parseInt)($JSCompiler_StaticMethods_getIdleRenderEnabled_$self_expVal$$, 10);
  return $JSCompiler_StaticMethods_getIdleRenderEnabled_$self_expVal$$ && (0,window.isNaN)($vpRange$$) ? !1 : $vpRange$$ || 12;
}, $JSCompiler_StaticMethods_setPageLevelExperiments$$ = function($JSCompiler_StaticMethods_setPageLevelExperiments$self$$, $$jscomp$compprop28_experimentInfoMap$jscomp$2_urlExperimentId$jscomp$1$$) {
  _.$isCdnProxy$$module$ads$google$a4a$utils$$($JSCompiler_StaticMethods_setPageLevelExperiments$self$$.$win$) || _.$isExperimentOn$$module$src$experiments$$($JSCompiler_StaticMethods_setPageLevelExperiments$self$$.$win$, "expDfpInvOrigDeprecated") || $JSCompiler_StaticMethods_setPageLevelExperiments$self$$.$experimentIds$.push("21060933");
  var $forcedExperimentId$$;
  $$jscomp$compprop28_experimentInfoMap$jscomp$2_urlExperimentId$jscomp$1$$ && ($forcedExperimentId$$ = {7:"117152666", 8:"117152667", 9:"21062235"}[$$jscomp$compprop28_experimentInfoMap$jscomp$2_urlExperimentId$jscomp$1$$]) && $JSCompiler_StaticMethods_setPageLevelExperiments$self$$.$experimentIds$.push($forcedExperimentId$$);
  $$jscomp$compprop28_experimentInfoMap$jscomp$2_urlExperimentId$jscomp$1$$ = {};
  $$jscomp$compprop28_experimentInfoMap$jscomp$2_urlExperimentId$jscomp$1$$ = ($$jscomp$compprop28_experimentInfoMap$jscomp$2_urlExperimentId$jscomp$1$$.doubleclickSraExp = {$isTrafficEligible$:function() {
    return !$forcedExperimentId$$ && !$JSCompiler_StaticMethods_setPageLevelExperiments$self$$.$win$.document.querySelector("meta[name=amp-ad-enable-refresh], amp-ad[type=doubleclick][data-enable-refresh], meta[name=amp-ad-doubleclick-sra]");
  }, $branches$:Object.keys($DOUBLECLICK_SRA_EXP_BRANCHES$$module$extensions$amp_ad_network_doubleclick_impl$0_1$amp_ad_network_doubleclick_impl$$).map(function($JSCompiler_StaticMethods_setPageLevelExperiments$self$$) {
    return $DOUBLECLICK_SRA_EXP_BRANCHES$$module$extensions$amp_ad_network_doubleclick_impl$0_1$amp_ad_network_doubleclick_impl$$[$JSCompiler_StaticMethods_setPageLevelExperiments$self$$];
  })}, $$jscomp$compprop28_experimentInfoMap$jscomp$2_urlExperimentId$jscomp$1$$);
  var $setExps$jscomp$1$$ = _.$randomlySelectUnsetExperiments$$module$src$experiments$$($JSCompiler_StaticMethods_setPageLevelExperiments$self$$.$win$, $$jscomp$compprop28_experimentInfoMap$jscomp$2_urlExperimentId$jscomp$1$$);
  Object.keys($setExps$jscomp$1$$).forEach(function($$jscomp$compprop28_experimentInfoMap$jscomp$2_urlExperimentId$jscomp$1$$) {
    return $setExps$jscomp$1$$[$$jscomp$compprop28_experimentInfoMap$jscomp$2_urlExperimentId$jscomp$1$$] && $JSCompiler_StaticMethods_setPageLevelExperiments$self$$.$experimentIds$.push($setExps$jscomp$1$$[$$jscomp$compprop28_experimentInfoMap$jscomp$2_urlExperimentId$jscomp$1$$]);
  });
}, $JSCompiler_StaticMethods_maybeDeprecationWarn_$$ = function($JSCompiler_StaticMethods_maybeDeprecationWarn_$self$$) {
  function $warnDeprecation$$($JSCompiler_StaticMethods_maybeDeprecationWarn_$self$$) {
    return _.$user$$module$src$log$$().$Log$$module$src$log_prototype$warn$("amp-ad-network-doubleclick-impl", $JSCompiler_StaticMethods_maybeDeprecationWarn_$self$$ + " is no longer supported for DoubleClick.Please refer to https://github.com/ampproject/amphtml/issues/11834 for more information");
  }
  ("useSameDomainRenderingUntilDeprecated" in $JSCompiler_StaticMethods_maybeDeprecationWarn_$self$$.element.dataset || (_.$tryParseJson$$module$src$json$$($JSCompiler_StaticMethods_maybeDeprecationWarn_$self$$.element.getAttribute("json")) || {}).useSameDomainRenderingUntilDeprecated) && $warnDeprecation$$("useSameDomainRenderingUntilDeprecated");
  $JSCompiler_StaticMethods_maybeDeprecationWarn_$self$$.$win$.document.querySelector("meta[name=amp-3p-iframe-src]") && $warnDeprecation$$("remote.html");
}, $JSCompiler_StaticMethods_getPageParameters$$ = function($JSCompiler_StaticMethods_getPageParameters$self$$, $consentState$jscomp$5$$, $instances_pageviewStateTokensInAdRequest$jscomp$inline_2291$$) {
  var $instancesInAdRequest$jscomp$inline_2290$$ = $instances_pageviewStateTokensInAdRequest$jscomp$inline_2291$$ = $instances_pageviewStateTokensInAdRequest$jscomp$inline_2291$$ || [$JSCompiler_StaticMethods_getPageParameters$self$$];
  $instances_pageviewStateTokensInAdRequest$jscomp$inline_2291$$ = [];
  for (var $JSCompiler_temp_const$jscomp$617_token$jscomp$inline_2292$$ in $tokensToInstances$$module$extensions$amp_ad_network_doubleclick_impl$0_1$amp_ad_network_doubleclick_impl$$) {
    $instancesInAdRequest$jscomp$inline_2290$$.includes($tokensToInstances$$module$extensions$amp_ad_network_doubleclick_impl$0_1$amp_ad_network_doubleclick_impl$$[$JSCompiler_temp_const$jscomp$617_token$jscomp$inline_2292$$]) || $instances_pageviewStateTokensInAdRequest$jscomp$inline_2291$$.push($JSCompiler_temp_const$jscomp$617_token$jscomp$inline_2292$$);
  }
  $JSCompiler_temp_const$jscomp$617_token$jscomp$inline_2292$$ = $JSCompiler_StaticMethods_getPageParameters$self$$.$win$.devicePixelRatio;
  $windowLocationQueryParameters$$module$extensions$amp_ad_network_doubleclick_impl$0_1$amp_ad_network_doubleclick_impl$$ = $windowLocationQueryParameters$$module$extensions$amp_ad_network_doubleclick_impl$0_1$amp_ad_network_doubleclick_impl$$ || _.$parseQueryString_$$module$src$url_parse_query_string$$($JSCompiler_StaticMethods_getPageParameters$self$$.$win$.location && $JSCompiler_StaticMethods_getPageParameters$self$$.$win$.location.search || "");
  return {npa:2 == $consentState$jscomp$5$$ || 4 == $consentState$jscomp$5$$ ? 1 : null, gdfp_req:"1", sfv:"1-0-23", u_sd:$JSCompiler_temp_const$jscomp$617_token$jscomp$inline_2292$$, gct:$windowLocationQueryParameters$$module$extensions$amp_ad_network_doubleclick_impl$0_1$amp_ad_network_doubleclick_impl$$.google_preview || null, psts:$instances_pageviewStateTokensInAdRequest$jscomp$inline_2291$$.length ? $instances_pageviewStateTokensInAdRequest$jscomp$inline_2291$$ : null};
}, $JSCompiler_StaticMethods_getBlockParameters_$$ = function($JSCompiler_StaticMethods_getBlockParameters_$self$$) {
  var $tfcd$$ = $JSCompiler_StaticMethods_getBlockParameters_$self$$.$jsonTargeting$ && $JSCompiler_StaticMethods_getBlockParameters_$self$$.$jsonTargeting$.tagForChildDirectedTreatment;
  $JSCompiler_StaticMethods_getBlockParameters_$self$$.$win$.ampAdGoogleIfiCounter = $JSCompiler_StaticMethods_getBlockParameters_$self$$.$win$.ampAdGoogleIfiCounter || 1;
  $JSCompiler_StaticMethods_getBlockParameters_$self$$.$ifi_$ = $JSCompiler_StaticMethods_getBlockParameters_$self$$.$isRefreshing$ && $JSCompiler_StaticMethods_getBlockParameters_$self$$.$ifi_$ || $JSCompiler_StaticMethods_getBlockParameters_$self$$.$win$.ampAdGoogleIfiCounter++;
  var $pageLayoutBox$$ = $JSCompiler_StaticMethods_getBlockParameters_$self$$.$isSinglePageStoryAd$ ? $JSCompiler_StaticMethods_getBlockParameters_$self$$.element.$getPageLayoutBox$() : null;
  return Object.assign({iu:$JSCompiler_StaticMethods_getBlockParameters_$self$$.element.getAttribute("data-slot"), co:$JSCompiler_StaticMethods_getBlockParameters_$self$$.$jsonTargeting$ && $JSCompiler_StaticMethods_getBlockParameters_$self$$.$jsonTargeting$.cookieOptOut ? "1" : null, adk:$JSCompiler_StaticMethods_getBlockParameters_$self$$.$adKey$, sz:$JSCompiler_StaticMethods_getBlockParameters_$self$$.$isSinglePageStoryAd$ ? "1x1" : $JSCompiler_StaticMethods_getBlockParameters_$self$$.$parameterSize$, 
  output:"html", impl:"ifr", tfcd:void 0 == $tfcd$$ ? null : $tfcd$$, adtest:_.$isInExperiment$$module$ads$google$a4a$traffic_experiments$$($JSCompiler_StaticMethods_getBlockParameters_$self$$.element) ? "on" : null, ifi:$JSCompiler_StaticMethods_getBlockParameters_$self$$.$ifi_$, rc:$JSCompiler_StaticMethods_getBlockParameters_$self$$.$refreshCount_$ || null, frc:Number($JSCompiler_StaticMethods_getBlockParameters_$self$$.$fromResumeCallback$) || null, fluid:$JSCompiler_StaticMethods_getBlockParameters_$self$$.$isFluidRequest_$ ? 
  "height" : null, fsf:$JSCompiler_StaticMethods_getBlockParameters_$self$$.$forceSafeframe$ ? "1" : null, scp:$serializeTargeting$$module$extensions$amp_ad_network_doubleclick_impl$0_1$sra_utils$$($JSCompiler_StaticMethods_getBlockParameters_$self$$.$jsonTargeting$ && $JSCompiler_StaticMethods_getBlockParameters_$self$$.$jsonTargeting$.targeting || null, $JSCompiler_StaticMethods_getBlockParameters_$self$$.$jsonTargeting$ && $JSCompiler_StaticMethods_getBlockParameters_$self$$.$jsonTargeting$.categoryExclusions || 
  null), spsa:$JSCompiler_StaticMethods_getBlockParameters_$self$$.$isSinglePageStoryAd$ ? $pageLayoutBox$$.width + "x" + $pageLayoutBox$$.height : null}, _.$googleBlockParameters$$module$ads$google$a4a$utils$$($JSCompiler_StaticMethods_getBlockParameters_$self$$));
}, $JSCompiler_StaticMethods_populateAdUrlState$$ = function($JSCompiler_StaticMethods_populateAdUrlState$self$$, $consentState$jscomp$6_dimensions$jscomp$2_multiSizeDataStr$jscomp$1_width$jscomp$31$$) {
  $JSCompiler_StaticMethods_populateAdUrlState$self$$.$consentState$ = $consentState$jscomp$6_dimensions$jscomp$2_multiSizeDataStr$jscomp$1_width$jscomp$31$$;
  $consentState$jscomp$6_dimensions$jscomp$2_multiSizeDataStr$jscomp$1_width$jscomp$31$$ = Number($JSCompiler_StaticMethods_populateAdUrlState$self$$.element.getAttribute("data-override-width")) || Number($JSCompiler_StaticMethods_populateAdUrlState$self$$.element.getAttribute("width"));
  var $height$jscomp$28_multiSizeValidation$jscomp$1$$ = Number($JSCompiler_StaticMethods_populateAdUrlState$self$$.element.getAttribute("data-override-height")) || Number($JSCompiler_StaticMethods_populateAdUrlState$self$$.element.getAttribute("height"));
  $JSCompiler_StaticMethods_populateAdUrlState$self$$.$initialSize_$ = $JSCompiler_StaticMethods_populateAdUrlState$self$$.$isFluidPrimaryRequest_$ ? {width:0, height:0} : $consentState$jscomp$6_dimensions$jscomp$2_multiSizeDataStr$jscomp$1_width$jscomp$31$$ && $height$jscomp$28_multiSizeValidation$jscomp$1$$ ? {width:$consentState$jscomp$6_dimensions$jscomp$2_multiSizeDataStr$jscomp$1_width$jscomp$31$$, height:$height$jscomp$28_multiSizeValidation$jscomp$1$$} : $JSCompiler_StaticMethods_populateAdUrlState$self$$.$getIntersectionElementLayoutBox$();
  $JSCompiler_StaticMethods_populateAdUrlState$self$$.$jsonTargeting$ = _.$tryParseJson$$module$src$json$$($JSCompiler_StaticMethods_populateAdUrlState$self$$.element.getAttribute("json")) || {};
  $JSCompiler_StaticMethods_populateAdUrlState$self$$.$adKey$ = $JSCompiler_StaticMethods_generateAdKey_$$($JSCompiler_StaticMethods_populateAdUrlState$self$$, $JSCompiler_StaticMethods_populateAdUrlState$self$$.$initialSize_$.width + "x" + $JSCompiler_StaticMethods_populateAdUrlState$self$$.$initialSize_$.height);
  $JSCompiler_StaticMethods_populateAdUrlState$self$$.$parameterSize$ = $JSCompiler_StaticMethods_populateAdUrlState$self$$.$isFluidPrimaryRequest_$ ? "320x50" : $JSCompiler_StaticMethods_populateAdUrlState$self$$.$initialSize_$.width + "x" + $JSCompiler_StaticMethods_populateAdUrlState$self$$.$initialSize_$.height;
  if ($consentState$jscomp$6_dimensions$jscomp$2_multiSizeDataStr$jscomp$1_width$jscomp$31$$ = $JSCompiler_StaticMethods_populateAdUrlState$self$$.element.getAttribute("data-multi-size")) {
    $height$jscomp$28_multiSizeValidation$jscomp$1$$ = $JSCompiler_StaticMethods_populateAdUrlState$self$$.element.getAttribute("data-multi-size-validation") || "true", $consentState$jscomp$6_dimensions$jscomp$2_multiSizeDataStr$jscomp$1_width$jscomp$31$$ = $getMultiSizeDimensions$$module$ads$google$utils$$($consentState$jscomp$6_dimensions$jscomp$2_multiSizeDataStr$jscomp$1_width$jscomp$31$$, $JSCompiler_StaticMethods_populateAdUrlState$self$$.$initialSize_$.width, $JSCompiler_StaticMethods_populateAdUrlState$self$$.$initialSize_$.height, 
    "true" == $height$jscomp$28_multiSizeValidation$jscomp$1$$, $JSCompiler_StaticMethods_populateAdUrlState$self$$.$isFluidPrimaryRequest_$), $consentState$jscomp$6_dimensions$jscomp$2_multiSizeDataStr$jscomp$1_width$jscomp$31$$.length && ($JSCompiler_StaticMethods_populateAdUrlState$self$$.$parameterSize$ += "|" + $consentState$jscomp$6_dimensions$jscomp$2_multiSizeDataStr$jscomp$1_width$jscomp$31$$.map(function($JSCompiler_StaticMethods_populateAdUrlState$self$$) {
      return $JSCompiler_StaticMethods_populateAdUrlState$self$$.join("x");
    }).join("|"));
  }
}, $JSCompiler_StaticMethods_buildIdentityParams$$ = function($JSCompiler_StaticMethods_buildIdentityParams$self$$) {
  return $JSCompiler_StaticMethods_buildIdentityParams$self$$.$identityToken$ ? {$adsid$:$JSCompiler_StaticMethods_buildIdentityParams$self$$.$identityToken$.$token$ || null, $jar$:$JSCompiler_StaticMethods_buildIdentityParams$self$$.$identityToken$.$jar$ || null, $pucrd$:$JSCompiler_StaticMethods_buildIdentityParams$self$$.$identityToken$.$pucrd$ || null} : {};
}, $JSCompiler_StaticMethods_mergeRtcResponses_$$ = function($JSCompiler_StaticMethods_mergeRtcResponses_$self$$, $rtcResponseArray$$) {
  if (!$rtcResponseArray$$) {
    return null;
  }
  var $artc$$ = [], $ati$$ = [], $ard$$ = [], $exclusions$$;
  $rtcResponseArray$$.forEach(function($rtcResponseArray$$) {
    if ($rtcResponseArray$$ && ($artc$$.push($rtcResponseArray$$.rtcTime), $ati$$.push($rtcResponseArray$$.error || "2"), $ard$$.push($rtcResponseArray$$.callout), $rtcResponseArray$$.response)) {
      if ($rtcResponseArray$$.response.targeting) {
        var $rtcResponse$$ = $JSCompiler_StaticMethods_rewriteRtcKeys_$$($rtcResponseArray$$.response.targeting, $rtcResponseArray$$.callout);
        $JSCompiler_StaticMethods_mergeRtcResponses_$self$$.$jsonTargeting$.targeting = $JSCompiler_StaticMethods_mergeRtcResponses_$self$$.$jsonTargeting$.targeting ? _.$deepMerge$$module$src$utils$object$$($JSCompiler_StaticMethods_mergeRtcResponses_$self$$.$jsonTargeting$.targeting, $rtcResponse$$) : $rtcResponse$$;
      }
      $rtcResponseArray$$.response.categoryExclusions && ($exclusions$$ || ($exclusions$$ = {}, $JSCompiler_StaticMethods_mergeRtcResponses_$self$$.$jsonTargeting$.categoryExclusions && $JSCompiler_StaticMethods_mergeRtcResponses_$self$$.$jsonTargeting$.categoryExclusions.forEach(function($JSCompiler_StaticMethods_mergeRtcResponses_$self$$) {
        $exclusions$$[$JSCompiler_StaticMethods_mergeRtcResponses_$self$$] = !0;
      })), $rtcResponseArray$$.response.categoryExclusions.forEach(function($JSCompiler_StaticMethods_mergeRtcResponses_$self$$) {
        $exclusions$$[$JSCompiler_StaticMethods_mergeRtcResponses_$self$$] = !0;
      }));
    }
  });
  $exclusions$$ && ($JSCompiler_StaticMethods_mergeRtcResponses_$self$$.$jsonTargeting$.categoryExclusions = Object.keys($exclusions$$));
  return {artc:$artc$$.join() || null, ati:$ati$$.join(), ard:$ard$$.join()};
}, $JSCompiler_StaticMethods_AmpAdNetworkDoubleclickImpl$$module$extensions$amp_ad_network_doubleclick_impl$0_1$amp_ad_network_doubleclick_impl_prototype$getReferrer_$$ = function($JSCompiler_StaticMethods_AmpAdNetworkDoubleclickImpl$$module$extensions$amp_ad_network_doubleclick_impl$0_1$amp_ad_network_doubleclick_impl_prototype$getReferrer_$self$$, $opt_timeout$jscomp$5_timeoutInt$$) {
  $opt_timeout$jscomp$5_timeoutInt$$ = (0,window.parseInt)($opt_timeout$jscomp$5_timeoutInt$$, 10);
  var $referrerPromise$jscomp$1$$ = _.$Services$$module$src$services$viewerForDoc$$($JSCompiler_StaticMethods_AmpAdNetworkDoubleclickImpl$$module$extensions$amp_ad_network_doubleclick_impl$0_1$amp_ad_network_doubleclick_impl_prototype$getReferrer_$self$$.$getAmpDoc$()).$I$;
  return (0,window.isNaN)($opt_timeout$jscomp$5_timeoutInt$$) || 0 > $opt_timeout$jscomp$5_timeoutInt$$ ? $referrerPromise$jscomp$1$$ : _.$JSCompiler_StaticMethods_timeoutPromise$$(_.$Services$$module$src$services$timerFor$$($JSCompiler_StaticMethods_AmpAdNetworkDoubleclickImpl$$module$extensions$amp_ad_network_doubleclick_impl$0_1$amp_ad_network_doubleclick_impl_prototype$getReferrer_$self$$.$win$), $opt_timeout$jscomp$5_timeoutInt$$, $referrerPromise$jscomp$1$$).catch(function() {
  });
}, $JSCompiler_StaticMethods_rewriteRtcKeys_$$ = function($response$jscomp$44$$, $callout$jscomp$3$$) {
  if (!$RTC_VENDORS$$module$extensions$amp_a4a$0_1$callout_vendors$$[$callout$jscomp$3$$] || $RTC_VENDORS$$module$extensions$amp_a4a$0_1$callout_vendors$$[$callout$jscomp$3$$].$disableKeyAppend$) {
    return $response$jscomp$44$$;
  }
  var $newResponse$$ = {};
  Object.keys($response$jscomp$44$$).forEach(function($key$jscomp$86$$) {
    $newResponse$$[$key$jscomp$86$$ + "_" + $callout$jscomp$3$$] = $response$jscomp$44$$[$key$jscomp$86$$];
  });
  return $newResponse$$;
}, $JSCompiler_StaticMethods_getSlotSize$$ = function($JSCompiler_StaticMethods_getSlotSize$self$$) {
  var $width$jscomp$32$$ = Number($JSCompiler_StaticMethods_getSlotSize$self$$.element.getAttribute("width")), $height$jscomp$29$$ = Number($JSCompiler_StaticMethods_getSlotSize$self$$.element.getAttribute("height"));
  return $width$jscomp$32$$ && $height$jscomp$29$$ ? {width:$width$jscomp$32$$, height:$height$jscomp$29$$} : $JSCompiler_StaticMethods_getSlotSize$self$$.$getIntersectionElementLayoutBox$();
}, $JSCompiler_StaticMethods_expandFluidCreative_$$ = function($JSCompiler_StaticMethods_expandFluidCreative_$self$$) {
  $JSCompiler_StaticMethods_expandFluidCreative_$self$$.$isFluidRequest_$ && !$JSCompiler_StaticMethods_expandFluidCreative_$self$$.$returnedSize_$ && $JSCompiler_StaticMethods_expandFluidCreative_$self$$.$isVerifiedAmpCreative_$ ? $JSCompiler_StaticMethods_expandFluidCreative_$self$$.iframe && $JSCompiler_StaticMethods_expandFluidCreative_$self$$.iframe.contentWindow && $JSCompiler_StaticMethods_expandFluidCreative_$self$$.iframe.contentWindow.document && $JSCompiler_StaticMethods_expandFluidCreative_$self$$.iframe.contentWindow.document.body ? 
  _.$JSCompiler_StaticMethods_attemptChangeHeight$$($JSCompiler_StaticMethods_expandFluidCreative_$self$$, $JSCompiler_StaticMethods_expandFluidCreative_$self$$.iframe.contentWindow.document.body.clientHeight).then(function() {
    $JSCompiler_StaticMethods_fireFluidDelayedImpression$$($JSCompiler_StaticMethods_expandFluidCreative_$self$$);
    $JSCompiler_StaticMethods_expandFluidCreative_$self$$.$reattemptToExpandFluidCreative_$ = !1;
  }).catch(function() {
    $JSCompiler_StaticMethods_expandFluidCreative_$self$$.$reattemptToExpandFluidCreative_$ = !0;
  }) : (_.$dev$$module$src$log$$().error("amp-ad-network-doubleclick-impl", "Attempting to expand fluid creative without a properly set up friendly frame. Slot id: " + $JSCompiler_StaticMethods_expandFluidCreative_$self$$.element.getAttribute("data-amp-slot-index")), window.Promise.reject("Cannot access body of friendly frame")) : window.Promise.resolve();
}, $JSCompiler_StaticMethods_generateAdKey_$$ = function($JSCompiler_StaticMethods_generateAdKey_$self_domFingerprint$$, $size$jscomp$24$$) {
  var $element$jscomp$297_multiSize$$ = $JSCompiler_StaticMethods_generateAdKey_$self_domFingerprint$$.element;
  $JSCompiler_StaticMethods_generateAdKey_$self_domFingerprint$$ = _.$domFingerprintPlain$$module$src$utils$dom_fingerprint$$($element$jscomp$297_multiSize$$);
  var $slot$jscomp$4$$ = $element$jscomp$297_multiSize$$.getAttribute("data-slot") || "";
  $element$jscomp$297_multiSize$$ = $element$jscomp$297_multiSize$$.getAttribute("data-multi-size") || "";
  return _.$stringHash32$$module$src$string$$($slot$jscomp$4$$ + ":" + $size$jscomp$24$$ + ":" + $element$jscomp$297_multiSize$$ + ":" + $JSCompiler_StaticMethods_generateAdKey_$self_domFingerprint$$);
}, $JSCompiler_StaticMethods_AmpAdNetworkDoubleclickImpl$$module$extensions$amp_ad_network_doubleclick_impl$0_1$amp_ad_network_doubleclick_impl_prototype$handleResize_$$ = function($JSCompiler_StaticMethods_AmpAdNetworkDoubleclickImpl$$module$extensions$amp_ad_network_doubleclick_impl$0_1$amp_ad_network_doubleclick_impl_prototype$handleResize_$self$$, $width$jscomp$33$$, $height$jscomp$30$$) {
  var $pWidth$$ = $JSCompiler_StaticMethods_AmpAdNetworkDoubleclickImpl$$module$extensions$amp_ad_network_doubleclick_impl$0_1$amp_ad_network_doubleclick_impl_prototype$handleResize_$self$$.element.getAttribute("width"), $pHeight$$ = $JSCompiler_StaticMethods_AmpAdNetworkDoubleclickImpl$$module$extensions$amp_ad_network_doubleclick_impl$0_1$amp_ad_network_doubleclick_impl_prototype$handleResize_$self$$.element.getAttribute("height");
  ($JSCompiler_StaticMethods_AmpAdNetworkDoubleclickImpl$$module$extensions$amp_ad_network_doubleclick_impl$0_1$amp_ad_network_doubleclick_impl_prototype$handleResize_$self$$.$isFluidRequest_$ && $width$jscomp$33$$ && $height$jscomp$30$$ || ($width$jscomp$33$$ != $pWidth$$ || $height$jscomp$30$$ != $pHeight$$) && $width$jscomp$33$$ <= $pWidth$$ && $height$jscomp$30$$ <= $pHeight$$) && $JSCompiler_StaticMethods_AmpAdNetworkDoubleclickImpl$$module$extensions$amp_ad_network_doubleclick_impl$0_1$amp_ad_network_doubleclick_impl_prototype$handleResize_$self$$.$attemptChangeSize$($height$jscomp$30$$, 
  $width$jscomp$33$$).catch(function() {
  });
}, $JSCompiler_StaticMethods_fireDelayedImpressions$$ = function($JSCompiler_StaticMethods_fireDelayedImpressions$self$$, $impressions$$) {
  $impressions$$ && $impressions$$.split(",").forEach(function($impressions$$) {
    try {
      _.$JSCompiler_StaticMethods_isSecure$$(_.$Services$$module$src$services$urlForDoc$$($JSCompiler_StaticMethods_fireDelayedImpressions$self$$.element), $impressions$$) ? $JSCompiler_StaticMethods_fireDelayedImpressions$self$$.$win$.document.body.appendChild(_.$createElementWithAttributes$$module$src$dom$$($JSCompiler_StaticMethods_fireDelayedImpressions$self$$.$win$.document, "amp-pixel", _.$dict$$module$src$utils$object$$({src:$impressions$$, referrerpolicy:""}))) : _.$dev$$module$src$log$$().$Log$$module$src$log_prototype$warn$("amp-ad-network-doubleclick-impl", 
      "insecure impression url: " + $impressions$$);
    } catch ($unusedError$jscomp$4$$) {
    }
  });
}, $JSCompiler_StaticMethods_fireFluidDelayedImpression$$ = function($JSCompiler_StaticMethods_fireFluidDelayedImpression$self$$) {
  $JSCompiler_StaticMethods_fireFluidDelayedImpression$self$$.$fluidImpressionUrl_$ && ($JSCompiler_StaticMethods_fireDelayedImpressions$$($JSCompiler_StaticMethods_fireFluidDelayedImpression$self$$, $JSCompiler_StaticMethods_fireFluidDelayedImpression$self$$.$fluidImpressionUrl_$), $JSCompiler_StaticMethods_fireFluidDelayedImpression$self$$.$fluidImpressionUrl_$ = null);
}, $JSCompiler_StaticMethods_initiateSraRequests$$ = function($JSCompiler_StaticMethods_initiateSraRequests$self$$) {
  var $checkStillCurrent$jscomp$10$$ = $JSCompiler_StaticMethods_initiateSraRequests$self$$.$verifyStillCurrent$(), $noFallbackExp$$ = $JSCompiler_StaticMethods_initiateSraRequests$self$$.$experimentIds$.includes("21062235");
  return $sraRequests$$module$extensions$amp_ad_network_doubleclick_impl$0_1$amp_ad_network_doubleclick_impl$$ = $sraRequests$$module$extensions$amp_ad_network_doubleclick_impl$0_1$amp_ad_network_doubleclick_impl$$ || $groupAmpAdsByType$$module$ads$google$a4a$utils$$($JSCompiler_StaticMethods_initiateSraRequests$self$$.$win$, $JSCompiler_StaticMethods_initiateSraRequests$self$$.element.getAttribute("type")).then(function($groupIdToBlocksAry$$) {
    $checkStillCurrent$jscomp$10$$();
    var $sraRequestPromises$$ = [];
    Object.keys($groupIdToBlocksAry$$).forEach(function($networkId$$) {
      $sraRequestPromises$$.push(window.Promise.all($groupIdToBlocksAry$$[$networkId$$]).then(function($groupIdToBlocksAry$$) {
        $checkStillCurrent$jscomp$10$$();
        var $sraRequestPromises$$ = $groupIdToBlocksAry$$.filter(function($JSCompiler_StaticMethods_initiateSraRequests$self$$) {
          var $checkStillCurrent$jscomp$10$$ = !!$JSCompiler_StaticMethods_initiateSraRequests$self$$.$adPromise_$;
          $checkStillCurrent$jscomp$10$$ || _.$dev$$module$src$log$$().$Log$$module$src$log_prototype$info$("amp-ad-network-doubleclick-impl", "Ignoring instance without ad promise as likely invalid", $JSCompiler_StaticMethods_initiateSraRequests$self$$.element);
          return $checkStillCurrent$jscomp$10$$;
        });
        if ($sraRequestPromises$$.length) {
          if ($noFallbackExp$$ || 1 != $sraRequestPromises$$.length) {
            var $instances$jscomp$1$$;
            return $constructSRARequest_$$module$extensions$amp_ad_network_doubleclick_impl$0_1$amp_ad_network_doubleclick_impl$$($JSCompiler_StaticMethods_initiateSraRequests$self$$, $sraRequestPromises$$).then(function($noFallbackExp$$) {
              $checkStillCurrent$jscomp$10$$();
              $instances$jscomp$1$$ = $noFallbackExp$$;
              return _.$Services$$module$src$services$xhrFor$$($JSCompiler_StaticMethods_initiateSraRequests$self$$.$win$).fetch($instances$jscomp$1$$, {mode:"cors", method:"GET", credentials:"include"});
            }).then(function($noFallbackExp$$) {
              $checkStillCurrent$jscomp$10$$();
              var $groupIdToBlocksAry$$ = $sraRequestPromises$$.map(function($JSCompiler_StaticMethods_initiateSraRequests$self$$) {
                return $JSCompiler_StaticMethods_initiateSraRequests$self$$.$sraDeferred$.resolve;
              });
              $lineDelimitedStreamer$$module$ads$google$a4a$line_delimited_response_handler$$($JSCompiler_StaticMethods_initiateSraRequests$self$$.$win$, $noFallbackExp$$, $metaJsonCreativeGrouper$$module$ads$google$a4a$line_delimited_response_handler$$(function($JSCompiler_StaticMethods_initiateSraRequests$self$$, $noFallbackExp$$, $sraRequestPromises$$) {
                $checkStillCurrent$jscomp$10$$();
                $sraBlockCallbackHandler$$module$extensions$amp_ad_network_doubleclick_impl$0_1$sra_utils$$($JSCompiler_StaticMethods_initiateSraRequests$self$$, $noFallbackExp$$, $sraRequestPromises$$, $groupIdToBlocksAry$$, $instances$jscomp$1$$);
              }));
              return window.Promise.all($sraRequestPromises$$.map(function($JSCompiler_StaticMethods_initiateSraRequests$self$$) {
                return $JSCompiler_StaticMethods_initiateSraRequests$self$$.$sraDeferred$.$promise$;
              }));
            }).catch(function($checkStillCurrent$jscomp$10$$) {
              _.$isCancellation$$module$src$error$$($checkStillCurrent$jscomp$10$$) ? $sraRequestPromises$$.forEach(function($JSCompiler_StaticMethods_initiateSraRequests$self$$) {
                return $JSCompiler_StaticMethods_initiateSraRequests$self$$.$sraDeferred$ && $JSCompiler_StaticMethods_initiateSraRequests$self$$.$sraDeferred$.reject($checkStillCurrent$jscomp$10$$);
              }) : $noFallbackExp$$ || $JSCompiler_StaticMethods_initiateSraRequests$self$$.$win$.document.querySelector("meta[name=amp-ad-doubleclick-sra]") ? (_.$assignAdUrlToError$$module$extensions$amp_a4a$0_1$amp_a4a$$($checkStillCurrent$jscomp$10$$, $instances$jscomp$1$$), $JSCompiler_StaticMethods_warnOnError$$($checkStillCurrent$jscomp$10$$), $sraRequestPromises$$.forEach(function($JSCompiler_StaticMethods_initiateSraRequests$self$$) {
                $JSCompiler_StaticMethods_initiateSraRequests$self$$.$adUrl_$ = null;
                $JSCompiler_StaticMethods_initiateSraRequests$self$$.$attemptCollapse$();
                $JSCompiler_StaticMethods_initiateSraRequests$self$$.$sraDeferred$.reject($checkStillCurrent$jscomp$10$$);
              })) : $sraRequestPromises$$.forEach(function($JSCompiler_StaticMethods_initiateSraRequests$self$$) {
                return $JSCompiler_StaticMethods_initiateSraRequests$self$$.$sraDeferred$.resolve(null);
              });
            });
          }
          _.$dev$$module$src$log$$().$Log$$module$src$log_prototype$info$("amp-ad-network-doubleclick-impl", "single block in network " + $networkId$$);
          $sraRequestPromises$$[0].$sraDeferred$ = $sraRequestPromises$$[0].$sraDeferred$ || new _.$Deferred$$module$src$utils$promise$$;
          $sraRequestPromises$$[0].$sraDeferred$.resolve(null);
        }
      }));
    });
    return window.Promise.all($sraRequestPromises$$);
  });
}, $JSCompiler_StaticMethods_warnOnError$$ = function($error$jscomp$52$$) {
  _.$dev$$module$src$log$$().$Log$$module$src$log_prototype$warn$("amp-ad-network-doubleclick-impl", "SRA request failure", $error$jscomp$52$$);
}, $JSCompiler_StaticMethods_postTroubleshootMessage$$ = function($JSCompiler_StaticMethods_postTroubleshootMessage$self$$) {
  $JSCompiler_StaticMethods_postTroubleshootMessage$self$$.$win$.opener && /[?|&]dfpdeb/.test($JSCompiler_StaticMethods_postTroubleshootMessage$self$$.$win$.location.search) && $JSCompiler_StaticMethods_postTroubleshootMessage$self$$.$troubleshootData_$.$adUrl$.then(function($adUrl$jscomp$11_payload$jscomp$13$$) {
    var $slotId$jscomp$2$$ = $JSCompiler_StaticMethods_postTroubleshootMessage$self$$.$troubleshootData_$.$slotId$ + "_" + $JSCompiler_StaticMethods_postTroubleshootMessage$self$$.$troubleshootData_$.$slotIndex$;
    $adUrl$jscomp$11_payload$jscomp$13$$ = _.$dict$$module$src$utils$object$$({gutData:JSON.stringify(_.$dict$$module$src$utils$object$$({events:[{timestamp:Date.now(), slotid:$slotId$jscomp$2$$, messageId:4}], slots:[{contentUrl:$adUrl$jscomp$11_payload$jscomp$13$$ || "", id:$slotId$jscomp$2$$, leafAdUnitName:$JSCompiler_StaticMethods_postTroubleshootMessage$self$$.$troubleshootData_$.$slotId$, domId:$slotId$jscomp$2$$, lineItemId:$JSCompiler_StaticMethods_postTroubleshootMessage$self$$.$troubleshootData_$.$lineItemId$, 
    creativeId:$JSCompiler_StaticMethods_postTroubleshootMessage$self$$.$troubleshootData_$.$creativeId$}]})), userAgent:window.navigator.userAgent, referrer:$JSCompiler_StaticMethods_postTroubleshootMessage$self$$.$win$.location.href, messageType:"LOAD"});
    $JSCompiler_StaticMethods_postTroubleshootMessage$self$$.$win$.opener.postMessage($adUrl$jscomp$11_payload$jscomp$13$$, "*");
  });
}, $JSCompiler_StaticMethods_removePageviewStateToken$$ = function($JSCompiler_StaticMethods_removePageviewStateToken$self$$) {
  for (var $token$jscomp$22$$ in $tokensToInstances$$module$extensions$amp_ad_network_doubleclick_impl$0_1$amp_ad_network_doubleclick_impl$$) {
    if ($tokensToInstances$$module$extensions$amp_ad_network_doubleclick_impl$0_1$amp_ad_network_doubleclick_impl$$[$token$jscomp$22$$] == $JSCompiler_StaticMethods_removePageviewStateToken$self$$) {
      delete $tokensToInstances$$module$extensions$amp_ad_network_doubleclick_impl$0_1$amp_ad_network_doubleclick_impl$$[$token$jscomp$22$$];
      break;
    }
  }
}, $getNetworkId$$module$extensions$amp_ad_network_doubleclick_impl$0_1$amp_ad_network_doubleclick_impl$$ = function($element$jscomp$298_networkId$jscomp$1$$) {
  return ($element$jscomp$298_networkId$jscomp$1$$ = /^(?:\/)?(\d+)/.exec($element$jscomp$298_networkId$jscomp$1$$.getAttribute("data-slot"))) ? $element$jscomp$298_networkId$jscomp$1$$[1] : "";
}, $constructSRARequest_$$module$extensions$amp_ad_network_doubleclick_impl$0_1$amp_ad_network_doubleclick_impl$$ = function($a4a$jscomp$8$$, $instances$jscomp$2$$) {
  var $startTime$jscomp$17$$ = Date.now();
  return window.Promise.all($instances$jscomp$2$$.map(function($a4a$jscomp$8$$) {
    return $a4a$jscomp$8$$.$getAdUrlDeferred$.$promise$;
  })).then(function() {
    return _.$googlePageParameters$$module$ads$google$a4a$utils$$($a4a$jscomp$8$$, $startTime$jscomp$17$$);
  }).then(function($a4a$jscomp$8$$) {
    var $googPageLevelParameters$$ = $constructSRABlockParameters$$module$extensions$amp_ad_network_doubleclick_impl$0_1$sra_utils$$($instances$jscomp$2$$);
    return _.$truncAndTimeUrl$$module$ads$google$a4a$utils$$("https://securepubads.g.doubleclick.net/gampad/ads", Object.assign($googPageLevelParameters$$, $a4a$jscomp$8$$, $JSCompiler_StaticMethods_getPageParameters$$($instances$jscomp$2$$[0], $instances$jscomp$2$$[0].$consentState$, $instances$jscomp$2$$)), $startTime$jscomp$17$$);
  });
};
_.$AmpA4A$$module$extensions$amp_a4a$0_1$amp_a4a$$.prototype.$AmpA4A$$module$extensions$amp_a4a$0_1$amp_a4a_prototype$refresh$ = _.$JSCompiler_unstubMethod$$(52, function($refreshEndCallback$$) {
  var $$jscomp$this$jscomp$219$$ = this;
  this.$isRefreshing$ = !0;
  this.$tearDownSlot$();
  _.$JSCompiler_StaticMethods_initiateAdRequest$$(this);
  if (!this.$adPromise_$) {
    return window.Promise.resolve();
  }
  var $promiseId$$ = this.$promiseId_$;
  return this.$adPromise_$.then(function() {
    if ($$jscomp$this$jscomp$219$$.$isRefreshing$ && $promiseId$$ == $$jscomp$this$jscomp$219$$.$promiseId_$) {
      return $$jscomp$this$jscomp$219$$.$mutateElement$(function() {
        _.$triggerAnalyticsEvent$$module$src$analytics$$($$jscomp$this$jscomp$219$$.element, "ad-refresh");
        $$jscomp$this$jscomp$219$$.$togglePlaceholder$(!0);
        return _.$Services$$module$src$services$timerFor$$($$jscomp$this$jscomp$219$$.$win$).$promise$(1000).then(function() {
          $$jscomp$this$jscomp$219$$.$isRelayoutNeededFlag$ = !0;
          _.$JSCompiler_StaticMethods_layoutCanceled$$(_.$Resource$$module$src$service$resource$forElementOptional$$($$jscomp$this$jscomp$219$$.element));
          _.$JSCompiler_StaticMethods_whenNextVisible$$(_.$Services$$module$src$services$viewerForDoc$$($$jscomp$this$jscomp$219$$.$getAmpDoc$())).then(function() {
            _.$JSCompiler_StaticMethods_Resources$$module$src$service$resources_impl_prototype$requireLayout$$(_.$Services$$module$src$services$resourcesForDoc$$($$jscomp$this$jscomp$219$$.$getAmpDoc$()), $$jscomp$this$jscomp$219$$.element);
          });
        });
      });
    }
    $refreshEndCallback$$();
  });
});
var $CONSENT_POLICY_STATE$$module$src$consent_state$$ = {$SUFFICIENT$:1, $INSUFFICIENT$:2, $UNKNOWN_NOT_REQUIRED$:3, $UNKNOWN$:4};
var $RTC_VENDORS$$module$extensions$amp_a4a$0_1$callout_vendors$$ = {$medianet$:{url:"https://amprtc.media.net/rtb/getrtc?cid=CID&w=ATTR(width)&h=ATTR(height)&ow=ATTR(data-override-width)&oh=ATTR(data-override-height)&ms=ATTR(data-multi-size)&slot=ATTR(data-slot)&tgt=TGT&curl=CANONICAL_URL&to=TIMEOUT&purl=HREF", $macros$:["CID"], errorReportingUrl:"https://qsearch-a.akamaihd.net/log?logid=kfk&evtid=projectevents&project=amprtc_error&error=ERROR_TYPE&rd=HREF", $disableKeyAppend$:!0}, $prebidappnexus$:{url:"https://prebid.adnxs.com/pbs/v1/openrtb2/amp?tag_id=PLACEMENT_ID&w=ATTR(width)&h=ATTR(height)&ow=ATTR(data-override-width)&oh=ATTR(data-override-height)&ms=ATTR(data-multi-size)&slot=ATTR(data-slot)&targeting=TGT&curl=CANONICAL_URL&timeout=TIMEOUT&adcid=ADCID&purl=HREF", 
$macros$:["PLACEMENT_ID"], $disableKeyAppend$:!0}, $prebidrubicon$:{url:"https://prebid-server.rubiconproject.com/openrtb2/amp?tag_id=REQUEST_ID&w=ATTR(width)&h=ATTR(height)&ow=ATTR(data-override-width)&oh=ATTR(data-override-height)&ms=ATTR(data-multi-size)&slot=ATTR(data-slot)&targeting=TGT&curl=CANONICAL_URL&timeout=TIMEOUT&adc=ADCID&purl=HREF", $macros$:["REQUEST_ID"], $disableKeyAppend$:!0}, $indexexchange$:{url:"https://amp.casalemedia.com/amprtc?v=1&w=ATTR(width)&h=ATTR(height)&ow=ATTR(data-override-width)&oh=ATTR(data-override-height)&ms=ATTR(data-multi-size)&s=SITE_ID&p=CANONICAL_URL", 
$macros$:["SITE_ID"], $disableKeyAppend$:!0}, $lotame$:{url:"https://ad.crwdcntrl.net/5/pe=y/c=CLIENT_ID/an=AD_NETWORK", $macros$:["CLIENT_ID", "AD_NETWORK"], $disableKeyAppend$:!0}, $yieldbot$:{url:"https://i.yldbt.com/m/YB_PSN/v1/amp/init?curl=CANONICAL_URL&sn=YB_SLOT&w=ATTR(width)&h=ATTR(height)&ow=ATTR(data-override-width)&oh=ATTR(data-override-height)&ms=ATTR(data-multi-size)&aup=ATTR(data-slot)&pvi=PAGEVIEWID&tgt=TGT&adcid=ADCID&href=HREF", $macros$:["YB_PSN", "YB_SLOT"], $disableKeyAppend$:!0}, 
$salesforcedmp$:{url:"https://cdn.krxd.net/userdata/v2/amp/ORGANIZATION_ID?segments_key=SEGMENTS_KEY&kuid_key=USER_KEY", $macros$:["ORGANIZATION_ID", "SEGMENTS_KEY", "USER_KEY"], $disableKeyAppend$:!0}, $purch$:{url:"https://ads.servebom.com/tmntag.js?v=1.2&fmt=amp&o={%22p%22%3APLACEMENT_ID}&div_id=DIV_ID", $macros$:["PLACEMENT_ID", "DIV_ID"], $disableKeyAppend$:!0}, $aps$:{url:"https://aax.amazon-adsystem.com/e/dtb/bid?src=PUB_ID&pubid=PUB_UUID&amp=1&u=CANONICAL_URL&slots=%5B%7B%22sd%22%3A%22ATTR(data-slot)%22%2C%22s%22%3A%5B%22ATTR(width)xATTR(height)%22%5D%7D%5D&pj=PARAMS", 
$macros$:["PUB_ID", "PARAMS", "PUB_UUID"], $disableKeyAppend$:!0}, $openwrap$:{url:"https://ow.pubmatic.com/amp?v=1&w=ATTR(width)&h=ATTR(height)&ms=ATTR(data-multi-size)&auId=ATTR(data-slot)&purl=HREF&pubId=PUB_ID&profId=PROFILE_ID", $macros$:["PUB_ID", "PROFILE_ID"], errorReportingUrl:"https://ow.pubmatic.com/amp_error?e=ERROR_TYPE&h=HREF", $disableKeyAppend$:!0}, $criteo$:{url:"https://bidder.criteo.com/amp/rtc?zid=ZONE_ID&nid=NETWORK_ID&psubid=PUBLISHER_SUB_ID&lir=LINE_ITEM_RANGES&w=ATTR(width)&h=ATTR(height)&ow=ATTR(data-override-width)&oh=ATTR(data-override-height)&ms=ATTR(data-multi-size)&slot=ATTR(data-slot)&timeout=TIMEOUT&curl=CANONICAL_URL&href=HREF", 
$macros$:["ZONE_ID", "NETWORK_ID", "PUBLISHER_SUB_ID", "LINE_ITEM_RANGES"], $disableKeyAppend$:!0}, $navegg$:{url:"https://amp.navdmp.com/usr?acc=NVG_ACC&wst=0&v=10", $macros$:["NVG_ACC"]}, $sonobi$:{url:"https://apex.go.sonobi.com/trinity.json?key_maker=%7B%22_DIVIDER_ATTR(data-slot)%7C1%22%3A%22PLACEMENT_ID_DIVIDER_ATTR(width)xATTR(height)%2CATTR(data-multi-size)%22%7D&ref=CANONICAL_URL&lib_name=amp&lib_v=0.1&pv=PAGEVIEWID&amp=1", $disableKeyAppend$:!0, $macros$:["PLACEMENT_ID", "_DIVIDER_"]}};
var $ERROR_REPORTING_ENABLED$$module$extensions$amp_a4a$0_1$real_time_config_manager$$ = 0.01 > Math.random();
$RealTimeConfigManager$$module$extensions$amp_a4a$0_1$real_time_config_manager$$.prototype.$maybeExecuteRealTimeConfig$ = function($customMacros$$, $consentState$jscomp$4$$) {
  if ($JSCompiler_StaticMethods_validateRtcConfig_$$(this, this.$F$.element)) {
    return this.$G$ = $consentState$jscomp$4$$, $JSCompiler_StaticMethods_modifyRtcConfigForConsentStateSettings$$(this), $customMacros$$ = $JSCompiler_StaticMethods_assignMacros$$(this, $customMacros$$), this.$K$ = Date.now(), $JSCompiler_StaticMethods_handleRtcForCustomUrls$$(this, $customMacros$$), $JSCompiler_StaticMethods_handleRtcForVendorUrls$$(this, $customMacros$$), window.Promise.all(this.$J$);
  }
};
window.AMP.RealTimeConfigManager = $RealTimeConfigManager$$module$extensions$amp_a4a$0_1$real_time_config_manager$$;
$RefreshIntersectionObserverWrapper$$module$extensions$amp_a4a$0_1$refresh_intersection_observer_wrapper$$.prototype.observe = function($element$jscomp$293$$) {
  var $$jscomp$this$jscomp$326$$ = this, $refreshId$$ = $element$jscomp$293$$.getAttribute("data-amp-ad-refresh-id");
  if (!this.$F$[$refreshId$$]) {
    var $viewportCallback$$ = $element$jscomp$293$$.$viewportCallback$.bind($element$jscomp$293$$);
    this.$F$[$refreshId$$] = $viewportCallback$$;
    $element$jscomp$293$$.$viewportCallback$ = function($element$jscomp$293$$) {
      $$jscomp$this$jscomp$326$$.$D$ && _.$JSCompiler_StaticMethods_IntersectionObserverPolyfill$$module$src$intersection_observer_polyfill_prototype$tick$$($$jscomp$this$jscomp$326$$.$intersectionObserver_$, _.$JSCompiler_StaticMethods_getRect$$($$jscomp$this$jscomp$326$$.$viewport_$));
      $viewportCallback$$($element$jscomp$293$$);
    };
  }
  this.$D$ = !0;
  this.$intersectionObserver_$.observe($element$jscomp$293$$);
  _.$JSCompiler_StaticMethods_IntersectionObserverPolyfill$$module$src$intersection_observer_polyfill_prototype$tick$$(this.$intersectionObserver_$, _.$JSCompiler_StaticMethods_getRect$$(this.$viewport_$));
};
$RefreshIntersectionObserverWrapper$$module$extensions$amp_a4a$0_1$refresh_intersection_observer_wrapper$$.prototype.unobserve = function($element$jscomp$294$$) {
  _.$JSCompiler_StaticMethods_IntersectionObserverPolyfill$$module$src$intersection_observer_polyfill_prototype$tick$$(this.$intersectionObserver_$, _.$JSCompiler_StaticMethods_getRect$$(this.$viewport_$));
  this.$intersectionObserver_$.unobserve($element$jscomp$294$$);
  this.$D$ = !1;
};
var $observers$$module$extensions$amp_a4a$0_1$refresh_manager$$ = {}, $managers$$module$extensions$amp_a4a$0_1$refresh_manager$$ = {}, $refreshManagerIdCounter$$module$extensions$amp_a4a$0_1$refresh_manager$$ = 0;
$RefreshManager$$module$extensions$amp_a4a$0_1$refresh_manager$$.prototype.$I$ = function($entries$jscomp$2$$) {
  $entries$jscomp$2$$.forEach(function($entries$jscomp$2$$) {
    var $entry$jscomp$20$$ = $entries$jscomp$2$$.target.getAttribute("data-amp-ad-refresh-id"), $refreshManager$$ = $managers$$module$extensions$amp_a4a$0_1$refresh_manager$$[$entry$jscomp$20$$];
    if ($entries$jscomp$2$$.target == $refreshManager$$.$element_$) {
      switch($refreshManager$$.$state_$) {
        case "initial":
          $entries$jscomp$2$$.intersectionRatio >= $refreshManager$$.$config_$.visiblePercentageMin && ($refreshManager$$.$state_$ = "view_pending", $refreshManager$$.$F$ = $refreshManager$$.$timer_$.delay(function() {
            $refreshManager$$.$state_$ = "refresh_pending";
            $JSCompiler_StaticMethods_startRefreshTimer_$$($refreshManager$$);
          }, $refreshManager$$.$config_$.continuousTimeMin));
          break;
        case "view_pending":
          $entries$jscomp$2$$.intersectionRatio < $refreshManager$$.$config_$.visiblePercentageMin && ($refreshManager$$.$timer_$.cancel($refreshManager$$.$F$), $refreshManager$$.$F$ = null, $refreshManager$$.$state_$ = "initial");
      }
    }
  });
};
$RefreshManager$$module$extensions$amp_a4a$0_1$refresh_manager$$.prototype.unobserve = function() {
  $JSCompiler_StaticMethods_getIntersectionObserverWithThreshold_$$(this, this.$config_$.visiblePercentageMin).unobserve(this.$element_$);
};
var $safeframeHosts$$module$extensions$amp_ad_network_doubleclick_impl$0_1$safeframe_host$$ = {}, $safeframeListenerCreated_$$module$extensions$amp_ad_network_doubleclick_impl$0_1$safeframe_host$$ = !1;
$SafeframeHostApi$$module$extensions$amp_ad_network_doubleclick_impl$0_1$safeframe_host$$.prototype.$W$ = function() {
  var $$jscomp$this$jscomp$328$$ = this;
  this.$iframe_$ && _.$JSCompiler_StaticMethods_getClientRectAsync$$(this.$viewport_$, this.$iframe_$).then(function($formattedGeom_iframeBox$jscomp$1$$) {
    $$jscomp$this$jscomp$328$$.$K$();
    $formattedGeom_iframeBox$jscomp$1$$ = $JSCompiler_StaticMethods_formatGeom_$$($$jscomp$this$jscomp$328$$, $formattedGeom_iframeBox$jscomp$1$$);
    $$jscomp$this$jscomp$328$$.$sendMessage_$({$newGeometry$:$formattedGeom_iframeBox$jscomp$1$$, uid:$$jscomp$this$jscomp$328$$.$R$}, "geometry_update");
  }).catch(function($$jscomp$this$jscomp$328$$) {
    return _.$dev$$module$src$log$$().error("AMP-DOUBLECLICK-SAFEFRAME", $$jscomp$this$jscomp$328$$);
  });
};
$SafeframeHostApi$$module$extensions$amp_ad_network_doubleclick_impl$0_1$safeframe_host$$.prototype.$sendMessage_$ = function($payload$jscomp$8$$, $serviceName$$) {
  if (this.$iframe_$.contentWindow) {
    var $message$jscomp$52$$ = {};
    $message$jscomp$52$$.c = this.$F$;
    $message$jscomp$52$$.p = JSON.stringify($payload$jscomp$8$$);
    $message$jscomp$52$$.s = $serviceName$$;
    $message$jscomp$52$$.e = this.$G$;
    $message$jscomp$52$$.i = this.$Y$;
    this.$iframe_$.contentWindow.postMessage(JSON.stringify($message$jscomp$52$$), "https://tpc.googlesyndication.com");
  } else {
    _.$dev$$module$src$log$$().error("AMP-DOUBLECLICK-SAFEFRAME", "Frame contentWindow unavailable.");
  }
};
$SafeframeHostApi$$module$extensions$amp_ad_network_doubleclick_impl$0_1$safeframe_host$$.prototype.$destroy$ = function() {
  this.$iframe_$ = null;
  delete $safeframeHosts$$module$extensions$amp_ad_network_doubleclick_impl$0_1$safeframe_host$$[this.$G$];
  this.$unlisten_$ && this.$unlisten_$();
  0 == Object.keys($safeframeHosts$$module$extensions$amp_ad_network_doubleclick_impl$0_1$safeframe_host$$).length && (window.removeEventListener("message", $safeframeListener$$module$extensions$amp_ad_network_doubleclick_impl$0_1$safeframe_host$$, !1), $safeframeListenerCreated_$$module$extensions$amp_ad_network_doubleclick_impl$0_1$safeframe_host$$ = !1);
};
var $SRA_JOINERS$$module$extensions$amp_ad_network_doubleclick_impl$0_1$sra_utils$$ = [$combineInventoryUnits$$module$extensions$amp_ad_network_doubleclick_impl$0_1$sra_utils$$, $getCookieOptOut$$module$extensions$amp_ad_network_doubleclick_impl$0_1$sra_utils$$, $getAdks$$module$extensions$amp_ad_network_doubleclick_impl$0_1$sra_utils$$, $getSizes$$module$extensions$amp_ad_network_doubleclick_impl$0_1$sra_utils$$, $getTfcd$$module$extensions$amp_ad_network_doubleclick_impl$0_1$sra_utils$$, $isAdTest$$module$extensions$amp_ad_network_doubleclick_impl$0_1$sra_utils$$, 
$getTargetingAndExclusions$$module$extensions$amp_ad_network_doubleclick_impl$0_1$sra_utils$$, $getExperimentIds$$module$extensions$amp_ad_network_doubleclick_impl$0_1$sra_utils$$, $getIdentity$$module$extensions$amp_ad_network_doubleclick_impl$0_1$sra_utils$$, $getForceSafeframe$$module$extensions$amp_ad_network_doubleclick_impl$0_1$sra_utils$$, $getPageOffsets$$module$extensions$amp_ad_network_doubleclick_impl$0_1$sra_utils$$, $getContainers$$module$extensions$amp_ad_network_doubleclick_impl$0_1$sra_utils$$, 
$getIsFluid$$module$extensions$amp_ad_network_doubleclick_impl$0_1$sra_utils$$];
var $DOUBLECLICK_SRA_EXP_BRANCHES$$module$extensions$amp_ad_network_doubleclick_impl$0_1$amp_ad_network_doubleclick_impl$$ = {$SRA_CONTROL$:"117152666", $SRA$:"117152667", $SRA_NO_RECOVER$:"21062235"}, $tokensToInstances$$module$extensions$amp_ad_network_doubleclick_impl$0_1$amp_ad_network_doubleclick_impl$$ = {}, $sraRequests$$module$extensions$amp_ad_network_doubleclick_impl$0_1$amp_ad_network_doubleclick_impl$$ = null, $windowLocationQueryParameters$$module$extensions$amp_ad_network_doubleclick_impl$0_1$amp_ad_network_doubleclick_impl$$;
_.$$jscomp$inherits$$($AmpAdNetworkDoubleclickImpl$$module$extensions$amp_ad_network_doubleclick_impl$0_1$amp_ad_network_doubleclick_impl$$, _.$AmpA4A$$module$extensions$amp_a4a$0_1$amp_a4a$$);
_.$JSCompiler_prototypeAlias$$ = $AmpAdNetworkDoubleclickImpl$$module$extensions$amp_ad_network_doubleclick_impl$0_1$amp_ad_network_doubleclick_impl$$.prototype;
_.$JSCompiler_prototypeAlias$$.$idleRenderOutsideViewport$ = function() {
  var $$jscomp$this$jscomp$334$$ = this, $vpRange$jscomp$1$$ = $JSCompiler_StaticMethods_getIdleRenderEnabled_$$(this);
  if (!1 === $vpRange$jscomp$1$$) {
    return $vpRange$jscomp$1$$;
  }
  var $renderOutsideViewport$$ = this.$renderOutsideViewport$();
  if ("boolean" === typeof $renderOutsideViewport$$) {
    return $renderOutsideViewport$$;
  }
  this.$isIdleRender_$ = !0;
  _.$JSCompiler_StaticMethods_whenWithinViewport$$(_.$Resource$$module$src$service$resource$forElementOptional$$(this.element), $renderOutsideViewport$$).then(function() {
    return $$jscomp$this$jscomp$334$$.$isIdleRender_$ = !1;
  });
  return $vpRange$jscomp$1$$;
};
_.$JSCompiler_prototypeAlias$$.$isLayoutSupported$ = function($layout$jscomp$29$$) {
  this.$isFluidPrimaryRequest_$ = "fluid" == $layout$jscomp$29$$;
  this.$isFluidRequest_$ = this.$isFluidRequest_$ || this.$isFluidPrimaryRequest_$;
  return this.$isFluidPrimaryRequest_$ || _.$isLayoutSizeDefined$$module$src$layout$$($layout$jscomp$29$$);
};
_.$JSCompiler_prototypeAlias$$.isValidElement = function() {
  return _.$JSCompiler_StaticMethods_isAmpAdElement$$(this);
};
_.$JSCompiler_prototypeAlias$$.$buildCallback$ = function() {
  var $$jscomp$this$jscomp$336$$ = this;
  _.$AmpA4A$$module$extensions$amp_a4a$0_1$amp_a4a$$.prototype.$buildCallback$.call(this);
  $JSCompiler_StaticMethods_maybeDeprecationWarn_$$(this);
  $JSCompiler_StaticMethods_setPageLevelExperiments$$(this, _.$extractUrlExperimentId$$module$ads$google$a4a$traffic_experiments$$(this.$win$, this.element));
  this.$useSra$ = !!this.$win$.document.querySelector("meta[name=amp-ad-doubleclick-sra]") || ["117152667", "21062235"].some(function($multiSizeStr$$) {
    return 0 <= $$jscomp$this$jscomp$336$$.$experimentIds$.indexOf($multiSizeStr$$);
  });
  this.$identityTokenPromise_$ = _.$Services$$module$src$services$viewerForDoc$$(this.$getAmpDoc$()).$D$.then(function() {
    return _.$getIdentityToken$$module$ads$google$a4a$utils$$($$jscomp$this$jscomp$336$$.$win$, $$jscomp$this$jscomp$336$$.$getAmpDoc$(), _.$AmpA4A$$module$extensions$amp_a4a$0_1$amp_a4a$$.prototype.$getConsentPolicy$.call($$jscomp$this$jscomp$336$$));
  });
  this.$troubleshootData_$.$slotId$ = this.element.getAttribute("data-slot");
  this.$troubleshootData_$.$slotIndex$ = this.element.getAttribute("data-amp-slot-index");
  if (!this.$isFluidRequest_$) {
    var $multiSizeStr$$ = this.element.getAttribute("data-multi-size");
    this.$isFluidRequest_$ = !!$multiSizeStr$$ && -1 != $multiSizeStr$$.indexOf("fluid");
  }
};
_.$JSCompiler_prototypeAlias$$.$shouldPreferentialRenderWithoutCrypto$ = function() {
  _.$isCdnProxy$$module$ads$google$a4a$utils$$(this.$win$);
  return !0;
};
_.$JSCompiler_prototypeAlias$$.$getConsentPolicy$ = function() {
  return null;
};
_.$JSCompiler_prototypeAlias$$.$getAdUrl$ = function($consentState$jscomp$7$$, $opt_rtcResponsesPromise$jscomp$1$$) {
  var $$jscomp$this$jscomp$337$$ = this;
  this.$useSra$ && (this.$sraDeferred$ = this.$sraDeferred$ || new _.$Deferred$$module$src$utils$promise$$);
  if (4 == $consentState$jscomp$7$$ && "true" != this.element.getAttribute("data-npa-on-unknown-consent")) {
    return _.$user$$module$src$log$$().$Log$$module$src$log_prototype$info$("amp-ad-network-doubleclick-impl", "Ad request suppressed due to unknown consent"), this.$getAdUrlDeferred$.resolve(""), window.Promise.resolve("");
  }
  if (this.iframe && !this.$isRefreshing$) {
    return _.$dev$$module$src$log$$().$Log$$module$src$log_prototype$warn$("amp-ad-network-doubleclick-impl", "Frame already exists, sra: " + this.$useSra$), this.$getAdUrlDeferred$.resolve(""), window.Promise.resolve("");
  }
  $opt_rtcResponsesPromise$jscomp$1$$ = $opt_rtcResponsesPromise$jscomp$1$$ || window.Promise.resolve();
  $JSCompiler_StaticMethods_populateAdUrlState$$(this, $consentState$jscomp$7$$);
  var $startTime$jscomp$16$$ = Date.now(), $identityPromise$jscomp$1$$ = _.$JSCompiler_StaticMethods_timeoutPromise$$(_.$Services$$module$src$services$timerFor$$(this.$win$), 1000, this.$identityTokenPromise_$).catch(function() {
    return {};
  }), $checkStillCurrent$jscomp$8$$ = this.$verifyStillCurrent$();
  window.Promise.all([$opt_rtcResponsesPromise$jscomp$1$$, $identityPromise$jscomp$1$$]).then(function($opt_rtcResponsesPromise$jscomp$1$$) {
    $checkStillCurrent$jscomp$8$$();
    var $identityPromise$jscomp$1$$ = $JSCompiler_StaticMethods_mergeRtcResponses_$$($$jscomp$this$jscomp$337$$, $opt_rtcResponsesPromise$jscomp$1$$[0]);
    $$jscomp$this$jscomp$337$$.$identityToken$ = $opt_rtcResponsesPromise$jscomp$1$$[1];
    _.$googleAdUrl$$module$ads$google$a4a$utils$$($$jscomp$this$jscomp$337$$, "https://securepubads.g.doubleclick.net/gampad/ads", $startTime$jscomp$16$$, Object.assign($JSCompiler_StaticMethods_getBlockParameters_$$($$jscomp$this$jscomp$337$$), $JSCompiler_StaticMethods_buildIdentityParams$$($$jscomp$this$jscomp$337$$), $JSCompiler_StaticMethods_getPageParameters$$($$jscomp$this$jscomp$337$$, $consentState$jscomp$7$$), $identityPromise$jscomp$1$$), $$jscomp$this$jscomp$337$$.$experimentIds$).then(function($consentState$jscomp$7$$) {
      return $$jscomp$this$jscomp$337$$.$getAdUrlDeferred$.resolve($consentState$jscomp$7$$);
    });
  });
  return this.$troubleshootData_$.$adUrl$ = this.$getAdUrlDeferred$.$promise$;
};
_.$JSCompiler_prototypeAlias$$.$getCustomRealTimeConfigMacros_$ = function() {
  var $$jscomp$this$jscomp$339$$ = this, $whitelist$jscomp$11$$ = {height:!0, width:!0, "data-slot":!0, "data-multi-size":!0, "data-multi-size-validation":!0, "data-override-width":!0, "data-override-height":!0};
  return {$PAGEVIEWID$:function() {
    return _.$Services$$module$src$services$documentInfoForDoc$$($$jscomp$this$jscomp$339$$.element).pageViewId;
  }, $HREF$:function() {
    return $$jscomp$this$jscomp$339$$.$win$.location.href;
  }, $REFERRER$:function($whitelist$jscomp$11$$) {
    return $JSCompiler_StaticMethods_AmpAdNetworkDoubleclickImpl$$module$extensions$amp_ad_network_doubleclick_impl$0_1$amp_ad_network_doubleclick_impl_prototype$getReferrer_$$($$jscomp$this$jscomp$339$$, $whitelist$jscomp$11$$);
  }, $TGT$:function() {
    return JSON.stringify((_.$tryParseJson$$module$src$json$$($$jscomp$this$jscomp$339$$.element.getAttribute("json")) || {}).targeting);
  }, $ADCID$:function($whitelist$jscomp$11$$) {
    return _.$getOrCreateAdCid$$module$src$ad_cid$$($$jscomp$this$jscomp$339$$.$getAmpDoc$(), "AMP_ECID_GOOGLE", "_ga", (0,window.parseInt)($whitelist$jscomp$11$$, 10));
  }, $ATTR$:function($name$jscomp$184$$) {
    if ($whitelist$jscomp$11$$[$name$jscomp$184$$.toLowerCase()]) {
      return $$jscomp$this$jscomp$339$$.element.getAttribute($name$jscomp$184$$);
    }
    _.$dev$$module$src$log$$().$Log$$module$src$log_prototype$warn$("TAG", "Invalid attribute " + $name$jscomp$184$$);
  }, $CANONICAL_URL$:function() {
    return _.$Services$$module$src$services$documentInfoForDoc$$($$jscomp$this$jscomp$339$$.element).canonicalUrl;
  }};
};
_.$JSCompiler_prototypeAlias$$.$onNetworkFailure$ = function($error$jscomp$50$$, $adUrl$jscomp$9$$) {
  _.$dev$$module$src$log$$().$Log$$module$src$log_prototype$info$("amp-ad-network-doubleclick-impl", "network error, attempt adding of error parameter", $error$jscomp$50$$);
  return {$adUrl$:_.$maybeAppendErrorParameter$$module$ads$google$a4a$utils$$($adUrl$jscomp$9$$)};
};
_.$JSCompiler_prototypeAlias$$.$extractSize$ = function($responseHeaders$jscomp$3_token$jscomp$inline_2298$$) {
  this.$ampAnalyticsConfig_$ = _.$extractAmpAnalyticsConfig$$module$ads$google$a4a$utils$$($responseHeaders$jscomp$3_token$jscomp$inline_2298$$);
  this.$qqid_$ = $responseHeaders$jscomp$3_token$jscomp$inline_2298$$.get("X-QQID");
  this.$shouldSandbox_$ = "true" == $responseHeaders$jscomp$3_token$jscomp$inline_2298$$.get("amp-ff-sandbox");
  this.$troubleshootData_$.$creativeId$ = $responseHeaders$jscomp$3_token$jscomp$inline_2298$$.get("google-creative-id") || "-1";
  this.$troubleshootData_$.$lineItemId$ = $responseHeaders$jscomp$3_token$jscomp$inline_2298$$.get("google-lineitem-id") || "-1";
  this.$ampAnalyticsConfig_$ && _.$JSCompiler_StaticMethods_installExtensionForDoc$$(this.$extensions_$, this.$getAmpDoc$(), "amp-analytics");
  var $size$jscomp$22$$ = _.$AmpA4A$$module$extensions$amp_a4a$0_1$amp_a4a$$.prototype.$extractSize$.call(this, $responseHeaders$jscomp$3_token$jscomp$inline_2298$$);
  $size$jscomp$22$$ ? (this.$returnedSize_$ = $size$jscomp$22$$, $JSCompiler_StaticMethods_AmpAdNetworkDoubleclickImpl$$module$extensions$amp_ad_network_doubleclick_impl$0_1$amp_ad_network_doubleclick_impl_prototype$handleResize_$$(this, $size$jscomp$22$$.width, $size$jscomp$22$$.height)) : $size$jscomp$22$$ = $JSCompiler_StaticMethods_getSlotSize$$(this);
  this.$isFluidRequest_$ && !this.$returnedSize_$ && (this.$fluidImpressionUrl_$ = $responseHeaders$jscomp$3_token$jscomp$inline_2298$$.get("X-AmpImps"));
  $responseHeaders$jscomp$3_token$jscomp$inline_2298$$.get("amp-ff-pageview-tokens") && ($JSCompiler_StaticMethods_removePageviewStateToken$$(this), $responseHeaders$jscomp$3_token$jscomp$inline_2298$$ = $responseHeaders$jscomp$3_token$jscomp$inline_2298$$.get("amp-ff-pageview-tokens"), $tokensToInstances$$module$extensions$amp_ad_network_doubleclick_impl$0_1$amp_ad_network_doubleclick_impl$$[$responseHeaders$jscomp$3_token$jscomp$inline_2298$$] = this);
  return $size$jscomp$22$$;
};
_.$JSCompiler_prototypeAlias$$.$sandboxHTMLCreativeFrame$ = function() {
  return this.$shouldSandbox_$;
};
_.$JSCompiler_prototypeAlias$$.$tearDownSlot$ = function() {
  _.$AmpA4A$$module$extensions$amp_a4a$0_1$amp_a4a$$.prototype.$tearDownSlot$.call(this);
  this.element.setAttribute("data-amp-slot-index", this.$win$.$ampAdSlotIdCounter$++);
  this.$ampAnalyticsElement_$ && (_.$removeElement$$module$src$dom$$(this.$ampAnalyticsElement_$), this.$ampAnalyticsElement_$ = null);
  this.$isAmpCreative_$ = this.$jsonTargeting$ = this.$ampAnalyticsConfig_$ = null;
  this.$isIdleRender_$ = !1;
  this.$qqid_$ = this.$sraDeferred$ = $sraRequests$$module$extensions$amp_ad_network_doubleclick_impl$0_1$amp_ad_network_doubleclick_impl$$ = this.$returnedSize_$ = this.$parameterSize$ = null;
  this.$shouldSandbox_$ = !1;
  this.$consentState$ = null;
  this.$getAdUrlDeferred$ = new _.$Deferred$$module$src$utils$promise$$;
  $JSCompiler_StaticMethods_removePageviewStateToken$$(this);
};
_.$JSCompiler_prototypeAlias$$.$renderNonAmpCreative$ = function() {
  var $$jscomp$this$jscomp$340$$ = this;
  if (this.$postAdResponseExperimentFeatures$["render-idle-throttle"] && this.$isIdleRender_$) {
    if (this.$win$["3pla"]) {
      return (_.$throttlePromise_$$module$extensions$amp_ad$0_1$concurrent_load$$ || window.Promise.resolve()).then(function() {
        return _.$AmpA4A$$module$extensions$amp_a4a$0_1$amp_a4a$$.prototype.$renderNonAmpCreative$.call($$jscomp$this$jscomp$340$$);
      });
    }
    _.$incrementLoadingAds$$module$extensions$amp_ad$0_1$concurrent_load$$(this.$win$);
    return _.$AmpA4A$$module$extensions$amp_a4a$0_1$amp_a4a$$.prototype.$renderNonAmpCreative$.call(this, !0);
  }
  return _.$AmpA4A$$module$extensions$amp_a4a$0_1$amp_a4a$$.prototype.$renderNonAmpCreative$.call(this);
};
_.$JSCompiler_prototypeAlias$$.$viewportCallback$ = function($inViewport$jscomp$8$$) {
  _.$AmpA4A$$module$extensions$amp_a4a$0_1$amp_a4a$$.prototype.$viewportCallback$.call(this, $inViewport$jscomp$8$$);
  this.$reattemptToExpandFluidCreative_$ && !$inViewport$jscomp$8$$ && $JSCompiler_StaticMethods_expandFluidCreative_$$(this);
};
_.$JSCompiler_prototypeAlias$$.$unlayoutCallback$ = function() {
  this.$refreshManager_$ && this.$refreshManager_$.unobserve();
  if (!this.$useSra$ && this.$isAmpCreative_$) {
    return !1;
  }
  this.$safeframeApi_$ && (this.$safeframeApi_$.$destroy$(), this.$safeframeApi_$ = null);
  return _.$AmpA4A$$module$extensions$amp_a4a$0_1$amp_a4a$$.prototype.$unlayoutCallback$.call(this);
};
_.$JSCompiler_prototypeAlias$$.$AmpA4A$$module$extensions$amp_a4a$0_1$amp_a4a_prototype$refresh$ = function($refreshEndCallback$jscomp$1$$) {
  this.$refreshCount_$++;
  return _.$AmpA4A$$module$extensions$amp_a4a$0_1$amp_a4a$$.prototype.$AmpA4A$$module$extensions$amp_a4a$0_1$amp_a4a_prototype$refresh$.call(this, $refreshEndCallback$jscomp$1$$);
};
_.$JSCompiler_prototypeAlias$$.$onCreativeRender$ = function($creativeMetaData$jscomp$4_size$jscomp$23$$, $opt_onLoadPromise$jscomp$1$$) {
  var $$jscomp$this$jscomp$341$$ = this;
  _.$AmpA4A$$module$extensions$amp_a4a$0_1$amp_a4a$$.prototype.$onCreativeRender$.call(this, $creativeMetaData$jscomp$4_size$jscomp$23$$);
  this.$isAmpCreative_$ = !!$creativeMetaData$jscomp$4_size$jscomp$23$$;
  $creativeMetaData$jscomp$4_size$jscomp$23$$ && !$creativeMetaData$jscomp$4_size$jscomp$23$$.$customElementExtensions$.includes("amp-ad-exit") && _.$Navigation$$module$src$service$navigation$installAnchorClickInterceptor$$(this.$getAmpDoc$(), this.iframe.contentWindow);
  this.$ampAnalyticsConfig_$ && (_.$isReportingEnabled$$module$ads$google$a4a$utils$$(this) && _.$addCsiSignalsToAmpAnalyticsConfig$$module$ads$google$a4a$utils$$(this.$win$, this.element, this.$ampAnalyticsConfig_$, this.$qqid_$, !!$creativeMetaData$jscomp$4_size$jscomp$23$$), this.$ampAnalyticsElement_$ = _.$insertAnalyticsElement$$module$src$extension_analytics$$(this.element, this.$ampAnalyticsConfig_$, !!this.$postAdResponseExperimentFeatures$.avr_disable_immediate));
  this.$isRefreshing$ && ($JSCompiler_StaticMethods_initiateRefreshCycle$$(this.$refreshManager_$), this.$isRelayoutNeededFlag$ = this.$isRefreshing$ = !1);
  $creativeMetaData$jscomp$4_size$jscomp$23$$ = this.$returnedSize_$ || $JSCompiler_StaticMethods_getSlotSize$$(this);
  var $isMultiSizeFluid$$ = this.$isFluidRequest_$ && this.$returnedSize_$ && !(0 == $creativeMetaData$jscomp$4_size$jscomp$23$$.width && 0 == $creativeMetaData$jscomp$4_size$jscomp$23$$.height);
  _.$setStyles$$module$src$style$$(this.iframe, {width:$creativeMetaData$jscomp$4_size$jscomp$23$$.width + "px", height:$creativeMetaData$jscomp$4_size$jscomp$23$$.height + "px", position:$isMultiSizeFluid$$ ? "relative" : null});
  this.$qqid_$ && this.element.setAttribute("data-google-query-id", this.$qqid_$);
  this.iframe.id = "google_ads_iframe_" + this.$ifi_$;
  $isMultiSizeFluid$$ && (this.element.removeAttribute("height"), _.$setStyles$$module$src$style$$(this.element, {width:$creativeMetaData$jscomp$4_size$jscomp$23$$.width + "px"}));
  $opt_onLoadPromise$jscomp$1$$ && $opt_onLoadPromise$jscomp$1$$.then(function() {
    $JSCompiler_StaticMethods_expandFluidCreative_$$($$jscomp$this$jscomp$341$$);
  });
  this.$refreshManager_$ = this.$refreshManager_$ || $getRefreshManager$$module$extensions$amp_a4a$0_1$refresh_manager$$(this, function() {
    return $$jscomp$this$jscomp$341$$.$useSra$ ? (_.$user$$module$src$log$$().$Log$$module$src$log_prototype$warn$("amp-ad-network-doubleclick-impl", "Refresh not compatible with SRA."), !1) : _.$getEnclosingContainerTypes$$module$ads$google$a4a$utils$$($$jscomp$this$jscomp$341$$.element).filter(function($creativeMetaData$jscomp$4_size$jscomp$23$$) {
      return $creativeMetaData$jscomp$4_size$jscomp$23$$ != _.$ValidAdContainerTypes$$module$ads$google$a4a$utils$$["AMP-CAROUSEL"] && $creativeMetaData$jscomp$4_size$jscomp$23$$ != _.$ValidAdContainerTypes$$module$ads$google$a4a$utils$$["AMP-STICKY-AD"];
    }).length ? (_.$user$$module$src$log$$().$Log$$module$src$log_prototype$warn$("amp-ad-network-doubleclick-impl", "Refresh not compatible with ad-containers, except for AMP-CAROUSEL and AMP-STICKY-AD"), !1) : !0;
  });
  $JSCompiler_StaticMethods_postTroubleshootMessage$$(this);
};
_.$JSCompiler_prototypeAlias$$.$sendXhrRequest$ = function($adUrl$jscomp$10$$) {
  var $$jscomp$this$jscomp$343$$ = this;
  if (!this.$useSra$) {
    return _.$AmpA4A$$module$extensions$amp_a4a$0_1$amp_a4a$$.prototype.$sendXhrRequest$.call(this, $adUrl$jscomp$10$$);
  }
  var $checkStillCurrent$jscomp$9$$ = this.$verifyStillCurrent$();
  $JSCompiler_StaticMethods_initiateSraRequests$$(this).then(function() {
    $checkStillCurrent$jscomp$9$$();
    $$jscomp$this$jscomp$343$$.$sraDeferred$ || (_.$dev$$module$src$log$$().$Log$$module$src$log_prototype$warn$("amp-ad-network-doubleclick-impl", "SRA failed to include element " + $$jscomp$this$jscomp$343$$.$ifi_$), _.$isExperimentOn$$module$src$experiments$$($$jscomp$this$jscomp$343$$.$win$, "doubleclickSraReportExcludedBlock") && $$jscomp$this$jscomp$343$$.$getAmpDoc$().$getBody$().appendChild(_.$createElementWithAttributes$$module$src$dom$$($$jscomp$this$jscomp$343$$.$win$.document, "amp-pixel", 
    _.$dict$$module$src$utils$object$$({src:"https://pagead2.googlesyndication.com/pagead/gen_204?" + ("id=" + (0,window.encodeURIComponent)("a4a::sra") + "&ifi=" + $$jscomp$this$jscomp$343$$.$ifi_$)}))));
  });
  return this.$sraDeferred$.$promise$.then(function($response$jscomp$45$$) {
    $checkStillCurrent$jscomp$9$$();
    $$jscomp$this$jscomp$343$$.$sraDeferred$ = null;
    return $response$jscomp$45$$ || _.$AmpA4A$$module$extensions$amp_a4a$0_1$amp_a4a$$.prototype.$sendXhrRequest$.call($$jscomp$this$jscomp$343$$, $adUrl$jscomp$10$$);
  });
};
_.$JSCompiler_prototypeAlias$$.$getPreconnectUrls$ = function() {
  return ["https://securepubads.g.doubleclick.net/"];
};
_.$JSCompiler_prototypeAlias$$.$getNonAmpCreativeRenderingMethod$ = function($headerValue$jscomp$5$$) {
  return this.$forceSafeframe$ || this.$isFluidRequest_$ ? "safeframe" : _.$AmpA4A$$module$extensions$amp_a4a$0_1$amp_a4a$$.prototype.$getNonAmpCreativeRenderingMethod$.call(this, $headerValue$jscomp$5$$);
};
_.$JSCompiler_prototypeAlias$$.$getAdditionalContextMetadata$ = function($JSCompiler_StaticMethods_getSafeframeNameAttr$self$jscomp$inline_2304_creativeSize$jscomp$1_isSafeFrame$$) {
  if (this.$isFluidRequest_$ || (void 0 === $JSCompiler_StaticMethods_getSafeframeNameAttr$self$jscomp$inline_2304_creativeSize$jscomp$1_isSafeFrame$$ ? 0 : $JSCompiler_StaticMethods_getSafeframeNameAttr$self$jscomp$inline_2304_creativeSize$jscomp$1_isSafeFrame$$)) {
    $JSCompiler_StaticMethods_getSafeframeNameAttr$self$jscomp$inline_2304_creativeSize$jscomp$1_isSafeFrame$$ = this.$creativeSize_$;
    $JSCompiler_StaticMethods_getSafeframeNameAttr$self$jscomp$inline_2304_creativeSize$jscomp$1_isSafeFrame$$ = this.$safeframeApi_$ = this.$safeframeApi_$ || new $SafeframeHostApi$$module$extensions$amp_ad_network_doubleclick_impl$0_1$safeframe_host$$(this, this.$isFluidRequest_$, $JSCompiler_StaticMethods_getSafeframeNameAttr$self$jscomp$inline_2304_creativeSize$jscomp$1_isSafeFrame$$);
    var $attributes$jscomp$inline_2305$$ = _.$dict$$module$src$utils$object$$({});
    $attributes$jscomp$inline_2305$$.uid = $JSCompiler_StaticMethods_getSafeframeNameAttr$self$jscomp$inline_2304_creativeSize$jscomp$1_isSafeFrame$$.$R$;
    $attributes$jscomp$inline_2305$$.hostPeerName = $JSCompiler_StaticMethods_getSafeframeNameAttr$self$jscomp$inline_2304_creativeSize$jscomp$1_isSafeFrame$$.$J$.location.origin;
    var $JSCompiler_inline_result$jscomp$5608_ampAdBox$jscomp$inline_5935$$ = $JSCompiler_StaticMethods_getSafeframeNameAttr$self$jscomp$inline_2304_creativeSize$jscomp$1_isSafeFrame$$.$D$.$getPageLayoutBox$();
    var $heightOffset$jscomp$inline_5936$$ = ($JSCompiler_inline_result$jscomp$5608_ampAdBox$jscomp$inline_5935$$.height - $JSCompiler_StaticMethods_getSafeframeNameAttr$self$jscomp$inline_2304_creativeSize$jscomp$1_isSafeFrame$$.$creativeSize_$.height) / 2, $widthOffset$jscomp$inline_5937$$ = ($JSCompiler_inline_result$jscomp$5608_ampAdBox$jscomp$inline_5935$$.width - $JSCompiler_StaticMethods_getSafeframeNameAttr$self$jscomp$inline_2304_creativeSize$jscomp$1_isSafeFrame$$.$creativeSize_$.width) / 
    2;
    $JSCompiler_inline_result$jscomp$5608_ampAdBox$jscomp$inline_5935$$ = $JSCompiler_StaticMethods_formatGeom_$$($JSCompiler_StaticMethods_getSafeframeNameAttr$self$jscomp$inline_2304_creativeSize$jscomp$1_isSafeFrame$$, {top:$JSCompiler_inline_result$jscomp$5608_ampAdBox$jscomp$inline_5935$$.top + $heightOffset$jscomp$inline_5936$$, bottom:$JSCompiler_inline_result$jscomp$5608_ampAdBox$jscomp$inline_5935$$.bottom - $heightOffset$jscomp$inline_5936$$, left:$JSCompiler_inline_result$jscomp$5608_ampAdBox$jscomp$inline_5935$$.left + 
    $widthOffset$jscomp$inline_5937$$, right:$JSCompiler_inline_result$jscomp$5608_ampAdBox$jscomp$inline_5935$$.right - $widthOffset$jscomp$inline_5937$$, height:$JSCompiler_StaticMethods_getSafeframeNameAttr$self$jscomp$inline_2304_creativeSize$jscomp$1_isSafeFrame$$.$O$.height, width:$JSCompiler_StaticMethods_getSafeframeNameAttr$self$jscomp$inline_2304_creativeSize$jscomp$1_isSafeFrame$$.$O$.width});
    $attributes$jscomp$inline_2305$$.initialGeometry = $JSCompiler_inline_result$jscomp$5608_ampAdBox$jscomp$inline_5935$$;
    $attributes$jscomp$inline_2305$$.permissions = JSON.stringify(_.$dict$$module$src$utils$object$$({expandByOverlay:$JSCompiler_StaticMethods_getSafeframeNameAttr$self$jscomp$inline_2304_creativeSize$jscomp$1_isSafeFrame$$.$U$, expandByPush:$JSCompiler_StaticMethods_getSafeframeNameAttr$self$jscomp$inline_2304_creativeSize$jscomp$1_isSafeFrame$$.$V$, readCookie:!1, writeCookie:!1}));
    $attributes$jscomp$inline_2305$$.metadata = JSON.stringify(_.$dict$$module$src$utils$object$$({shared:{sf_ver:$JSCompiler_StaticMethods_getSafeframeNameAttr$self$jscomp$inline_2304_creativeSize$jscomp$1_isSafeFrame$$.$D$.$safeframeVersion$, ck_on:1, flash_ver:"26.0.0", canonical_url:$JSCompiler_StaticMethods_maybeGetCanonicalUrl$$($JSCompiler_StaticMethods_getSafeframeNameAttr$self$jscomp$inline_2304_creativeSize$jscomp$1_isSafeFrame$$), amp:{canonical_url:$JSCompiler_StaticMethods_maybeGetCanonicalUrl$$($JSCompiler_StaticMethods_getSafeframeNameAttr$self$jscomp$inline_2304_creativeSize$jscomp$1_isSafeFrame$$)}}}));
    $attributes$jscomp$inline_2305$$.reportCreativeGeometry = $JSCompiler_StaticMethods_getSafeframeNameAttr$self$jscomp$inline_2304_creativeSize$jscomp$1_isSafeFrame$$.$aa$;
    $attributes$jscomp$inline_2305$$.isDifferentSourceWindow = !1;
    $attributes$jscomp$inline_2305$$.sentinel = $JSCompiler_StaticMethods_getSafeframeNameAttr$self$jscomp$inline_2304_creativeSize$jscomp$1_isSafeFrame$$.$G$;
    return $attributes$jscomp$inline_2305$$;
  }
};
_.$JSCompiler_prototypeAlias$$.$getA4aAnalyticsVars$ = function($analyticsTrigger$jscomp$2$$) {
  return _.$getCsiAmpAnalyticsVariables$$module$ads$google$a4a$utils$$($analyticsTrigger$jscomp$2$$, this, this.$qqid_$);
};
_.$JSCompiler_prototypeAlias$$.$getA4aAnalyticsConfig$ = function() {
  return _.$getCsiAmpAnalyticsConfig$$module$ads$google$a4a$utils$$();
};
window.self.AMP.registerElement("amp-ad-network-doubleclick-impl", $AmpAdNetworkDoubleclickImpl$$module$extensions$amp_ad_network_doubleclick_impl$0_1$amp_ad_network_doubleclick_impl$$);

})});
