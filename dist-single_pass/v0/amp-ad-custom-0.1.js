(self.AMP=self.AMP||[]).push({n:"amp-ad-custom",i:["_base_i","_base_ad"],v:"1901181729101",f:(function(AMP,_){
var $pushIfNotExist$$module$src$utils$array$$ = function($array$jscomp$11$$, $item$jscomp$1$$) {
  0 > $array$jscomp$11$$.indexOf($item$jscomp$1$$) && $array$jscomp$11$$.push($item$jscomp$1$$);
}, $Validator$$module$extensions$amp_a4a$0_1$amp_ad_type_defs$$ = function() {
}, $Renderer$$module$extensions$amp_a4a$0_1$amp_ad_type_defs$$ = function() {
}, $getAmpAdMetadata$$module$extensions$amp_a4a$0_1$amp_ad_utils$$ = function($creative$jscomp$5$$) {
  for (var $metadataStart$jscomp$1$$ = -1, $metadataString$jscomp$1$$, $i$jscomp$184_metadataEnd$jscomp$1$$ = 0; $i$jscomp$184_metadataEnd$jscomp$1$$ < $METADATA_STRINGS$$module$extensions$amp_a4a$0_1$amp_ad_utils$$.length && !($metadataString$jscomp$1$$ = $METADATA_STRINGS$$module$extensions$amp_a4a$0_1$amp_ad_utils$$[$i$jscomp$184_metadataEnd$jscomp$1$$], $metadataStart$jscomp$1$$ = $creative$jscomp$5$$.lastIndexOf($metadataString$jscomp$1$$), 0 <= $metadataStart$jscomp$1$$); $i$jscomp$184_metadataEnd$jscomp$1$$++) {
  }
  if (0 > $metadataStart$jscomp$1$$) {
    return _.$dev$$module$src$log$$().$Log$$module$src$log_prototype$warn$("amp-ad-util", "Could not locate start index for amp meta data in: " + $creative$jscomp$5$$), null;
  }
  $i$jscomp$184_metadataEnd$jscomp$1$$ = $creative$jscomp$5$$.lastIndexOf("\x3c/script>");
  if (0 > $i$jscomp$184_metadataEnd$jscomp$1$$) {
    return _.$dev$$module$src$log$$().$Log$$module$src$log_prototype$warn$("amp-ad-util", "Could not locate closing script tag for amp meta data in: %s", $creative$jscomp$5$$), null;
  }
  try {
    var $metaDataObj$jscomp$1$$ = _.$parseJson$$module$src$json$$($creative$jscomp$5$$.slice($metadataStart$jscomp$1$$ + $metadataString$jscomp$1$$.length, $i$jscomp$184_metadataEnd$jscomp$1$$)), $ampRuntimeUtf16CharOffsets$jscomp$1$$ = $metaDataObj$jscomp$1$$.ampRuntimeUtf16CharOffsets;
    if (!_.$isArray$$module$src$types$$($ampRuntimeUtf16CharOffsets$jscomp$1$$) || 2 != $ampRuntimeUtf16CharOffsets$jscomp$1$$.length || "number" !== typeof $ampRuntimeUtf16CharOffsets$jscomp$1$$[0] || "number" !== typeof $ampRuntimeUtf16CharOffsets$jscomp$1$$[1]) {
      throw Error("Invalid runtime offsets");
    }
    var $metaData$jscomp$1$$ = {};
    if ($metaDataObj$jscomp$1$$.customElementExtensions) {
      if ($metaData$jscomp$1$$.$customElementExtensions$ = $metaDataObj$jscomp$1$$.customElementExtensions, !_.$isArray$$module$src$types$$($metaData$jscomp$1$$.$customElementExtensions$)) {
        throw Error("Invalid extensions", $metaData$jscomp$1$$.$customElementExtensions$);
      }
    } else {
      $metaData$jscomp$1$$.$customElementExtensions$ = [];
    }
    if ($metaDataObj$jscomp$1$$.customStylesheets) {
      $metaData$jscomp$1$$.$customStylesheets$ = $metaDataObj$jscomp$1$$.customStylesheets;
      if (!_.$isArray$$module$src$types$$($metaData$jscomp$1$$.$customStylesheets$)) {
        throw Error("Invalid custom stylesheets");
      }
      $metaData$jscomp$1$$.$customStylesheets$.forEach(function($creative$jscomp$5$$) {
        if (!_.$isObject$$module$src$types$$($creative$jscomp$5$$) || !$creative$jscomp$5$$.href || "string" !== typeof $creative$jscomp$5$$.href || !_.$isSecureUrlDeprecated$$module$src$url$$($creative$jscomp$5$$.href)) {
          throw Error("Invalid custom stylesheets");
        }
      });
    }
    _.$isArray$$module$src$types$$($metaDataObj$jscomp$1$$.images) && ($metaData$jscomp$1$$.images = $metaDataObj$jscomp$1$$.images.splice(0, 5));
    $metaData$jscomp$1$$.$minifiedCreative$ = $creative$jscomp$5$$.slice(0, $ampRuntimeUtf16CharOffsets$jscomp$1$$[0]) + $creative$jscomp$5$$.slice($ampRuntimeUtf16CharOffsets$jscomp$1$$[1], $metadataStart$jscomp$1$$) + $creative$jscomp$5$$.slice($i$jscomp$184_metadataEnd$jscomp$1$$ + 9);
    return $metaData$jscomp$1$$;
  } catch ($err$jscomp$31$$) {
    return _.$dev$$module$src$log$$().$Log$$module$src$log_prototype$warn$("amp-ad-util", "Invalid amp metadata: %s", $creative$jscomp$5$$.slice($metadataStart$jscomp$1$$ + $metadataString$jscomp$1$$.length, $i$jscomp$184_metadataEnd$jscomp$1$$)), null;
  }
}, $AmpAdNetworkBase$$module$extensions$amp_a4a$0_1$amp_ad_network_base$$ = function($$jscomp$super$this$jscomp$6_element$jscomp$282$$) {
  $$jscomp$super$this$jscomp$6_element$jscomp$282$$ = window.AMP.BaseElement.call(this, $$jscomp$super$this$jscomp$6_element$jscomp$282$$) || this;
  $$jscomp$super$this$jscomp$6_element$jscomp$282$$.$adResponsePromise_$ = null;
  $$jscomp$super$this$jscomp$6_element$jscomp$282$$.$validators_$ = _.$map$$module$src$utils$object$$();
  $$jscomp$super$this$jscomp$6_element$jscomp$282$$.$renderers_$ = _.$map$$module$src$utils$object$$();
  $$jscomp$super$this$jscomp$6_element$jscomp$282$$.$recoveryModes_$ = _.$map$$module$src$utils$object$$();
  $$jscomp$super$this$jscomp$6_element$jscomp$282$$.$context_$ = {};
  for (var $failureType$$ in $FailureType$$module$extensions$amp_a4a$0_1$amp_ad_type_defs$$) {
    $$jscomp$super$this$jscomp$6_element$jscomp$282$$.$recoveryModes_$[$failureType$$] = "COLLAPSE";
  }
  $$jscomp$super$this$jscomp$6_element$jscomp$282$$.$retryLimit_$ = 0;
  return $$jscomp$super$this$jscomp$6_element$jscomp$282$$;
}, $JSCompiler_StaticMethods_registerRenderer$$ = function($JSCompiler_StaticMethods_registerRenderer$self$$, $renderer$$, $type$jscomp$156$$) {
  $JSCompiler_StaticMethods_registerRenderer$self$$.$renderers_$[$type$jscomp$156$$] && _.$dev$$module$src$log$$().$Log$$module$src$log_prototype$warn$("amp-ad-network-base", "Rendering mode already registered for type '" + $type$jscomp$156$$ + "'");
  $JSCompiler_StaticMethods_registerRenderer$self$$.$renderers_$[$type$jscomp$156$$] = $renderer$$;
}, $JSCompiler_StaticMethods_sendRequest_$$ = function($JSCompiler_StaticMethods_sendRequest_$self$$) {
  _.$Services$$module$src$services$viewerForDoc$$($JSCompiler_StaticMethods_sendRequest_$self$$.$getAmpDoc$()).$D$.then(function() {
    var $url$jscomp$134$$ = $JSCompiler_StaticMethods_getRequestUrl$$($JSCompiler_StaticMethods_sendRequest_$self$$);
    $JSCompiler_StaticMethods_sendRequest_$self$$.$adResponsePromise_$ = _.$Services$$module$src$services$xhrFor$$($JSCompiler_StaticMethods_sendRequest_$self$$.$win$).fetch($url$jscomp$134$$, {mode:"cors", method:"GET", credentials:"include"});
  });
}, $JSCompiler_StaticMethods_invokeValidator_$$ = function($JSCompiler_StaticMethods_invokeValidator_$self$$, $response$jscomp$41$$) {
  return $response$jscomp$41$$.arrayBuffer ? $response$jscomp$41$$.arrayBuffer().then(function($unvalidatedBytes$$) {
    var $validatorType$$ = $response$jscomp$41$$.headers.get("AMP-Ad-Response-Type") || "default";
    return $JSCompiler_StaticMethods_invokeValidator_$self$$.$validators_$[$validatorType$$].$validate$($JSCompiler_StaticMethods_invokeValidator_$self$$.$context_$, $unvalidatedBytes$$, $response$jscomp$41$$.headers).catch(function($JSCompiler_StaticMethods_invokeValidator_$self$$) {
      return window.Promise.reject({type:"VALIDATOR_ERROR", $msg$:$JSCompiler_StaticMethods_invokeValidator_$self$$});
    });
  }) : window.Promise.reject($JSCompiler_StaticMethods_handleFailure_$$($JSCompiler_StaticMethods_invokeValidator_$self$$, "INVALID_RESPONSE"));
}, $JSCompiler_StaticMethods_invokeRenderer_$$ = function($JSCompiler_StaticMethods_invokeRenderer_$self$$, $validatorOutput$$) {
  return $JSCompiler_StaticMethods_invokeRenderer_$self$$.$renderers_$[$validatorOutput$$.type].render($JSCompiler_StaticMethods_invokeRenderer_$self$$.$context_$, $JSCompiler_StaticMethods_invokeRenderer_$self$$.element, $validatorOutput$$.$creativeData$).catch(function($JSCompiler_StaticMethods_invokeRenderer_$self$$) {
    return window.Promise.reject({type:"RENDERER_ERROR", $msg$:$JSCompiler_StaticMethods_invokeRenderer_$self$$});
  });
}, $JSCompiler_StaticMethods_handleFailure_$$ = function($JSCompiler_StaticMethods_handleFailure_$self$$, $failureType$jscomp$1_recoveryMode$$, $error$jscomp$44$$) {
  $failureType$jscomp$1_recoveryMode$$ = $JSCompiler_StaticMethods_handleFailure_$self$$.$recoveryModes_$[$failureType$jscomp$1_recoveryMode$$];
  $error$jscomp$44$$ && _.$dev$$module$src$log$$().$Log$$module$src$log_prototype$warn$("amp-ad-network-base", $error$jscomp$44$$);
  switch($failureType$jscomp$1_recoveryMode$$) {
    case "COLLAPSE":
      $JSCompiler_StaticMethods_handleFailure_$self$$.$attemptChangeSize$(0, 0);
      break;
    case "RETRY":
      $JSCompiler_StaticMethods_handleFailure_$self$$.$retryLimit_$-- && $JSCompiler_StaticMethods_sendRequest_$$($JSCompiler_StaticMethods_handleFailure_$self$$);
      break;
    default:
      _.$dev$$module$src$log$$().error("amp-ad-network-base", "Invalid recovery mode!");
  }
}, $NameFrameRenderer$$module$extensions$amp_a4a$0_1$name_frame_renderer$$ = function() {
}, $renderCreativeIntoFriendlyFrame$$module$extensions$amp_a4a$0_1$friendly_frame_util$$ = function($adUrl$jscomp$5$$, $size$jscomp$20$$, $element$jscomp$284$$, $creativeMetadata$$) {
  var $iframe$jscomp$21$$ = _.$createElementWithAttributes$$module$src$dom$$($element$jscomp$284$$.ownerDocument, "iframe", _.$dict$$module$src$utils$object$$({height:$size$jscomp$20$$.height, width:$size$jscomp$20$$.width, frameborder:"0", allowfullscreen:"", allowtransparency:"", scrolling:"no"})), $fontsArray$jscomp$1$$ = [];
  $creativeMetadata$$.$customStylesheets$ && $creativeMetadata$$.$customStylesheets$.forEach(function($adUrl$jscomp$5$$) {
    ($adUrl$jscomp$5$$ = $adUrl$jscomp$5$$.href) && $fontsArray$jscomp$1$$.push($adUrl$jscomp$5$$);
  });
  return _.$installFriendlyIframeEmbed$$module$src$friendly_iframe_embed$$($iframe$jscomp$21$$, $element$jscomp$284$$, {host:$element$jscomp$284$$, url:$adUrl$jscomp$5$$, html:$creativeMetadata$$.$minifiedCreative$, $extensionIds$:$creativeMetadata$$.$customElementExtensions$ || [], fonts:$fontsArray$jscomp$1$$}, function($adUrl$jscomp$5$$) {
    var $size$jscomp$20$$ = $element$jscomp$284$$.$getAmpDoc$(), $creativeMetadata$$ = new _.$A4AVariableSource$$module$extensions$amp_a4a$0_1$a4a_variable_source$$($element$jscomp$284$$.$getAmpDoc$(), $adUrl$jscomp$5$$);
    _.$installServiceInEmbedScope$$module$src$service$$($adUrl$jscomp$5$$, "url-replace", new _.$UrlReplacements$$module$src$service$url_replacements_impl$$($size$jscomp$20$$, $creativeMetadata$$));
  }).then(function($adUrl$jscomp$5$$) {
    var $size$jscomp$20$$ = $element$jscomp$284$$.$isInViewport$();
    _.$JSCompiler_StaticMethods_FriendlyIframeEmbed$$module$src$friendly_iframe_embed_prototype$setVisible_$$($adUrl$jscomp$5$$, $size$jscomp$20$$);
    _.$setStyle$$module$src$style$$(($adUrl$jscomp$5$$.iframe.contentDocument || $adUrl$jscomp$5$$.$win$.document).body, "visibility", "visible");
    return $iframe$jscomp$21$$;
  });
}, $TemplateValidator$$module$extensions$amp_a4a$0_1$template_validator$$ = function() {
}, $TemplateRenderer$$module$extensions$amp_a4a$0_1$template_renderer$$ = function() {
}, $AmpAdTemplate$$module$extensions$amp_ad_custom$0_1$amp_ad_custom$$ = function($$jscomp$super$this$jscomp$7_element$jscomp$286$$) {
  $$jscomp$super$this$jscomp$7_element$jscomp$286$$ = $AmpAdNetworkBase$$module$extensions$amp_a4a$0_1$amp_ad_network_base$$.call(this, $$jscomp$super$this$jscomp$7_element$jscomp$286$$) || this;
  var $type$jscomp$inline_2227$$ = "template";
  $type$jscomp$inline_2227$$ = void 0 === $type$jscomp$inline_2227$$ ? "default" : $type$jscomp$inline_2227$$;
  $$jscomp$super$this$jscomp$7_element$jscomp$286$$.$validators_$[$type$jscomp$inline_2227$$] && _.$dev$$module$src$log$$().$Log$$module$src$log_prototype$warn$("amp-ad-network-base", $type$jscomp$inline_2227$$ + " validator already registered.");
  $$jscomp$super$this$jscomp$7_element$jscomp$286$$.$validators_$[$type$jscomp$inline_2227$$] = $validator$$module$extensions$amp_ad_custom$0_1$amp_ad_custom$$;
  $JSCompiler_StaticMethods_registerRenderer$$($$jscomp$super$this$jscomp$7_element$jscomp$286$$, new $TemplateRenderer$$module$extensions$amp_a4a$0_1$template_renderer$$, "AMP");
  $JSCompiler_StaticMethods_registerRenderer$$($$jscomp$super$this$jscomp$7_element$jscomp$286$$, $nameFrameRenderer$$module$extensions$amp_ad_custom$0_1$amp_ad_custom$$, "NON_AMP");
  $$jscomp$super$this$jscomp$7_element$jscomp$286$$.$baseRequestUrl_$ = $$jscomp$super$this$jscomp$7_element$jscomp$286$$.element.getAttribute("src");
  $$jscomp$super$this$jscomp$7_element$jscomp$286$$.getContext().$win$ = $$jscomp$super$this$jscomp$7_element$jscomp$286$$.$win$;
  return $$jscomp$super$this$jscomp$7_element$jscomp$286$$;
}, $JSCompiler_StaticMethods_getRequestUrl$$ = function($JSCompiler_StaticMethods_getRequestUrl$self$$) {
  var $url$jscomp$135$$ = $JSCompiler_StaticMethods_getRequestUrl$self$$.$baseRequestUrl_$;
  Object.keys($JSCompiler_StaticMethods_getRequestUrl$self$$.element.dataset).forEach(function($dataField$$) {
    if (_.$startsWith$$module$src$string$$($dataField$$, "requestParam")) {
      var $requestParamName$$ = $dataField$$.slice(12, $dataField$$.length);
      $requestParamName$$ && ($url$jscomp$135$$ = _.$addParamToUrl$$module$src$url$$($url$jscomp$135$$, $requestParamName$$.charAt(0).toLowerCase() + $requestParamName$$.slice(1), $JSCompiler_StaticMethods_getRequestUrl$self$$.element.dataset[$dataField$$]));
    }
  });
  return $JSCompiler_StaticMethods_getRequestUrl$self$$.getContext().$adUrl$ = $url$jscomp$135$$;
}, $FailureType$$module$extensions$amp_a4a$0_1$amp_ad_type_defs$$ = {$REQUEST_ERROR$:"REQUEST_ERROR", $INVALID_RESPONSE$:"INVALID_RESPONSE", $EMPTY_RESPONSE$:"EMPTY_RESPONSE", $VALIDATOR_ERROR$:"VALIDATOR_ERROR", $RENDERER_ERROR$:"RENDERER_ERROR"}, $METADATA_STRINGS$$module$extensions$amp_a4a$0_1$amp_ad_utils$$ = ["<script amp-ad-metadata type=application/json>", '<script type="application/json" amp-ad-metadata>', "<script type=application/json amp-ad-metadata>"];
_.$$jscomp$inherits$$($AmpAdNetworkBase$$module$extensions$amp_a4a$0_1$amp_ad_network_base$$, window.AMP.BaseElement);
$AmpAdNetworkBase$$module$extensions$amp_a4a$0_1$amp_ad_network_base$$.prototype.$isLayoutSupported$ = function($layout$jscomp$28$$) {
  return _.$isLayoutSizeDefined$$module$src$layout$$($layout$jscomp$28$$);
};
$AmpAdNetworkBase$$module$extensions$amp_a4a$0_1$amp_ad_network_base$$.prototype.$onLayoutMeasure$ = function() {
  $JSCompiler_StaticMethods_sendRequest_$$(this);
};
$AmpAdNetworkBase$$module$extensions$amp_a4a$0_1$amp_ad_network_base$$.prototype.$layoutCallback$ = function() {
  var $$jscomp$this$jscomp$304$$ = this;
  return this.$adResponsePromise_$.then(function($response$jscomp$40$$) {
    return $JSCompiler_StaticMethods_invokeValidator_$$($$jscomp$this$jscomp$304$$, $response$jscomp$40$$);
  }).then(function($validatorResult$$) {
    return $JSCompiler_StaticMethods_invokeRenderer_$$($$jscomp$this$jscomp$304$$, $validatorResult$$);
  }).catch(function($error$jscomp$43$$) {
    return $JSCompiler_StaticMethods_handleFailure_$$($$jscomp$this$jscomp$304$$, $error$jscomp$43$$.type, $error$jscomp$43$$.$msg$);
  });
};
$AmpAdNetworkBase$$module$extensions$amp_a4a$0_1$amp_ad_network_base$$.prototype.getContext = function() {
  return this.$context_$;
};
_.$$jscomp$inherits$$($NameFrameRenderer$$module$extensions$amp_a4a$0_1$name_frame_renderer$$, $Renderer$$module$extensions$amp_a4a$0_1$amp_ad_type_defs$$);
$NameFrameRenderer$$module$extensions$amp_a4a$0_1$name_frame_renderer$$.prototype.render = function($attributes$jscomp$14_context$jscomp$20$$, $element$jscomp$283$$, $crossDomainData_iframe$jscomp$20$$) {
  if (!$crossDomainData_iframe$jscomp$20$$.$creative$ && !$crossDomainData_iframe$jscomp$20$$.$rawCreativeBytes$) {
    return window.Promise.resolve();
  }
  var $creative$jscomp$6$$ = $crossDomainData_iframe$jscomp$20$$.$creative$ || _.$utf8Decode$$module$src$utils$bytes$$($crossDomainData_iframe$jscomp$20$$.$rawCreativeBytes$), $srcPath$jscomp$1$$ = _.$getDefaultBootstrapBaseUrl$$module$src$3p_frame$$($attributes$jscomp$14_context$jscomp$20$$.$win$, "nameframe"), $contextMetadata$jscomp$1$$ = _.$getContextMetadata$$module$src$iframe_attributes$$($attributes$jscomp$14_context$jscomp$20$$.$win$, $element$jscomp$283$$, $attributes$jscomp$14_context$jscomp$20$$.sentinel, 
  $crossDomainData_iframe$jscomp$20$$.$additionalContextMetadata$);
  $contextMetadata$jscomp$1$$.creative = $creative$jscomp$6$$;
  $attributes$jscomp$14_context$jscomp$20$$ = _.$dict$$module$src$utils$object$$({src:$srcPath$jscomp$1$$, name:JSON.stringify($contextMetadata$jscomp$1$$), height:$attributes$jscomp$14_context$jscomp$20$$.size.height, width:$attributes$jscomp$14_context$jscomp$20$$.size.width, frameborder:"0", allowfullscreen:"", allowtransparency:"", scrolling:"no", marginwidth:"0", marginheight:"0"});
  $crossDomainData_iframe$jscomp$20$$.sentinel && ($attributes$jscomp$14_context$jscomp$20$$["data-amp-3p-sentinel"] = $crossDomainData_iframe$jscomp$20$$.sentinel);
  $crossDomainData_iframe$jscomp$20$$ = _.$createElementWithAttributes$$module$src$dom$$($element$jscomp$283$$.ownerDocument, "iframe", $attributes$jscomp$14_context$jscomp$20$$);
  $element$jscomp$283$$.appendChild($crossDomainData_iframe$jscomp$20$$);
  return window.Promise.resolve();
};
var $ampAdTemplateHelper$$module$extensions$amp_a4a$0_1$template_validator$$;
_.$$jscomp$inherits$$($TemplateValidator$$module$extensions$amp_a4a$0_1$template_validator$$, $Validator$$module$extensions$amp_a4a$0_1$amp_ad_type_defs$$);
$TemplateValidator$$module$extensions$amp_a4a$0_1$template_validator$$.prototype.$validate$ = function($context$jscomp$21$$, $body$jscomp$18_unvalidatedBytes$jscomp$1$$, $headers$jscomp$5$$) {
  $body$jscomp$18_unvalidatedBytes$jscomp$1$$ = _.$utf8Decode$$module$src$utils$bytes$$($body$jscomp$18_unvalidatedBytes$jscomp$1$$);
  var $parsedResponseBody$$ = _.$tryParseJson$$module$src$json$$($body$jscomp$18_unvalidatedBytes$jscomp$1$$);
  return !$parsedResponseBody$$ || !$headers$jscomp$5$$ || "amp-mustache" !== $headers$jscomp$5$$.get("AMP-Ad-Template-Extension") && "amp-mustache" !== $headers$jscomp$5$$.get("AMP-template-amp-creative") ? window.Promise.resolve({$creativeData$:{$creative$:$body$jscomp$18_unvalidatedBytes$jscomp$1$$}, $adResponseType$:"template", type:"NON_AMP"}) : ($ampAdTemplateHelper$$module$extensions$amp_a4a$0_1$template_validator$$ || ($ampAdTemplateHelper$$module$extensions$amp_a4a$0_1$template_validator$$ = 
  new _.$AmpAdTemplateHelper$$module$extensions$amp_a4a$0_1$amp_ad_template_helper$$($context$jscomp$21$$.$win$))).fetch($parsedResponseBody$$.$templateUrl$).then(function($body$jscomp$18_unvalidatedBytes$jscomp$1$$) {
    $body$jscomp$18_unvalidatedBytes$jscomp$1$$ = $getAmpAdMetadata$$module$extensions$amp_a4a$0_1$amp_ad_utils$$($body$jscomp$18_unvalidatedBytes$jscomp$1$$);
    $parsedResponseBody$$.$analytics$ && $pushIfNotExist$$module$src$utils$array$$($body$jscomp$18_unvalidatedBytes$jscomp$1$$.customElementExtensions, "amp-analytics");
    $pushIfNotExist$$module$src$utils$array$$($body$jscomp$18_unvalidatedBytes$jscomp$1$$.customElementExtensions, "amp-mustache");
    var $headers$jscomp$5$$ = _.$Services$$module$src$services$extensionsFor$$($context$jscomp$21$$.$win$);
    $body$jscomp$18_unvalidatedBytes$jscomp$1$$.$customElementExtensions$.forEach(function($context$jscomp$21$$) {
      return _.$JSCompiler_StaticMethods_preloadExtension$$($headers$jscomp$5$$, $context$jscomp$21$$);
    });
    return window.Promise.resolve({$creativeData$:{$templateData$:$parsedResponseBody$$, $creativeMetadata$:$body$jscomp$18_unvalidatedBytes$jscomp$1$$}, $adResponseType$:"template", type:"AMP"});
  });
};
_.$$jscomp$inherits$$($TemplateRenderer$$module$extensions$amp_a4a$0_1$template_renderer$$, $Renderer$$module$extensions$amp_a4a$0_1$amp_ad_type_defs$$);
$TemplateRenderer$$module$extensions$amp_a4a$0_1$template_renderer$$.prototype.render = function($context$jscomp$22$$, $element$jscomp$285$$, $creativeData$$) {
  return $renderCreativeIntoFriendlyFrame$$module$extensions$amp_a4a$0_1$friendly_frame_util$$($context$jscomp$22$$.$adUrl$, $context$jscomp$22$$.size, $element$jscomp$285$$, $creativeData$$.$creativeMetadata$).then(function($element$jscomp$285$$) {
    var $iframe$jscomp$22$$ = $creativeData$$.$templateData$, $data$jscomp$90$$ = $iframe$jscomp$22$$.data;
    return $data$jscomp$90$$ ? ($ampAdTemplateHelper$$module$extensions$amp_a4a$0_1$template_validator$$ || ($ampAdTemplateHelper$$module$extensions$amp_a4a$0_1$template_validator$$ = new _.$AmpAdTemplateHelper$$module$extensions$amp_a4a$0_1$amp_ad_template_helper$$($context$jscomp$22$$.$win$))).render($data$jscomp$90$$, $element$jscomp$285$$.contentWindow.document.body).then(function($context$jscomp$22$$) {
      var $creativeData$$ = $iframe$jscomp$22$$.$analytics$;
      $creativeData$$ && _.$JSCompiler_StaticMethods_insertAnalytics$$($context$jscomp$22$$, $creativeData$$);
      $creativeData$$ = $element$jscomp$285$$.contentWindow.document.querySelector("template");
      $creativeData$$.parentNode.replaceChild($context$jscomp$22$$, $creativeData$$);
    }) : window.Promise.resolve();
  });
};
var $validator$$module$extensions$amp_ad_custom$0_1$amp_ad_custom$$ = new $TemplateValidator$$module$extensions$amp_a4a$0_1$template_validator$$, $nameFrameRenderer$$module$extensions$amp_ad_custom$0_1$amp_ad_custom$$ = new $NameFrameRenderer$$module$extensions$amp_a4a$0_1$name_frame_renderer$$;
_.$$jscomp$inherits$$($AmpAdTemplate$$module$extensions$amp_ad_custom$0_1$amp_ad_custom$$, $AmpAdNetworkBase$$module$extensions$amp_a4a$0_1$amp_ad_network_base$$);
$AmpAdTemplate$$module$extensions$amp_ad_custom$0_1$amp_ad_custom$$.prototype.$buildCallback$ = function() {
  this.getContext().size = {width:this.element.getAttribute("width"), height:this.element.getAttribute("height"), $layout$:this.element.getAttribute("layout")};
};
window.self.AMP.registerElement("amp-ad-custom", $AmpAdTemplate$$module$extensions$amp_ad_custom$0_1$amp_ad_custom$$);

})});
