(self.AMP=self.AMP||[]).push({n:"amp-geo",i:["_base_i","_base_misc"],v:"1901181729101",f:(function(AMP,_){
var $AmpGeo$$module$extensions$amp_geo$0_1$amp_geo$$ = function($$jscomp$super$this$jscomp$51_element$jscomp$425$$) {
  $$jscomp$super$this$jscomp$51_element$jscomp$425$$ = window.AMP.BaseElement.call(this, $$jscomp$super$this$jscomp$51_element$jscomp$425$$) || this;
  $$jscomp$super$this$jscomp$51_element$jscomp$425$$.$mode_$ = 0;
  $$jscomp$super$this$jscomp$51_element$jscomp$425$$.$error_$ = !1;
  $$jscomp$super$this$jscomp$51_element$jscomp$425$$.$country_$ = "unknown";
  $$jscomp$super$this$jscomp$51_element$jscomp$425$$.$matchedGroups_$ = [];
  $$jscomp$super$this$jscomp$51_element$jscomp$425$$.$definedGroups_$ = [];
  return $$jscomp$super$this$jscomp$51_element$jscomp$425$$;
}, $JSCompiler_StaticMethods_assertWithErrorReturn_$$ = function($shouldBeTrueish$jscomp$4$$) {
  $shouldBeTrueish$jscomp$4$$ || $geoDeferred$$module$extensions$amp_geo$0_1$amp_geo$$.resolve(null);
  return $shouldBeTrueish$jscomp$4$$;
}, $JSCompiler_StaticMethods_findCountry_$$ = function($JSCompiler_StaticMethods_findCountry_$self$$, $doc$jscomp$93$$) {
  var $preRenderMatch$$ = $doc$jscomp$93$$.body.className.match($PRE_RENDER_REGEX$$module$extensions$amp_geo$0_1$amp_geo$$), $trimmedCountry$$ = "{{AMP_ISO_COUNTRY_HOTPATCH}}".trim();
  _.$getMode$$module$src$mode$$($JSCompiler_StaticMethods_findCountry_$self$$.$win$).$geoOverride$ && _.$isCanary$$module$src$experiments$$($JSCompiler_StaticMethods_findCountry_$self$$.$win$) && /^\w+$/.test(_.$getMode$$module$src$mode$$($JSCompiler_StaticMethods_findCountry_$self$$.$win$).$geoOverride$) ? ($JSCompiler_StaticMethods_findCountry_$self$$.$mode_$ = 2, $JSCompiler_StaticMethods_findCountry_$self$$.$country_$ = _.$getMode$$module$src$mode$$($JSCompiler_StaticMethods_findCountry_$self$$.$win$).$geoOverride$.toLowerCase()) : 
  $preRenderMatch$$ && !_.$JSCompiler_StaticMethods_Url$$module$src$service$url_impl_prototype$isProxyOrigin$$(_.$Services$$module$src$services$urlForDoc$$($JSCompiler_StaticMethods_findCountry_$self$$.element), $doc$jscomp$93$$.location) ? ($JSCompiler_StaticMethods_findCountry_$self$$.$mode_$ = 1, $JSCompiler_StaticMethods_findCountry_$self$$.$country_$ = $preRenderMatch$$[1]) : 2 == $trimmedCountry$$.length ? ($JSCompiler_StaticMethods_findCountry_$self$$.$mode_$ = 0, $JSCompiler_StaticMethods_findCountry_$self$$.$country_$ = 
  $trimmedCountry$$) : 2 < $trimmedCountry$$.length && ($JSCompiler_StaticMethods_findCountry_$self$$.$error_$ = !0, _.$dev$$module$src$log$$().error("amp-geo", "GEONOTPATCHED: amp-geo served unpatched, ISO country not set"));
}, $JSCompiler_StaticMethods_matchCountryGroups_$$ = function($JSCompiler_StaticMethods_matchCountryGroups_$self$$, $config$jscomp$70$$) {
  var $ISOCountryGroups$$ = $config$jscomp$70$$.ISOCountryGroups;
  $ISOCountryGroups$$ && ($JSCompiler_StaticMethods_assertWithErrorReturn_$$(_.$isObject$$module$src$types$$($ISOCountryGroups$$)), $JSCompiler_StaticMethods_matchCountryGroups_$self$$.$definedGroups_$ = Object.keys($ISOCountryGroups$$), $JSCompiler_StaticMethods_matchCountryGroups_$self$$.$definedGroups_$.forEach(function($config$jscomp$70$$) {
    $JSCompiler_StaticMethods_assertWithErrorReturn_$$(/^[a-z]+[a-z0-9]*$/i.test($config$jscomp$70$$) && !/^amp/.test($config$jscomp$70$$));
    $JSCompiler_StaticMethods_assertWithErrorReturn_$$(_.$isArray$$module$src$types$$($ISOCountryGroups$$[$config$jscomp$70$$]));
    $JSCompiler_StaticMethods_checkGroup_$$($JSCompiler_StaticMethods_matchCountryGroups_$self$$, $ISOCountryGroups$$[$config$jscomp$70$$]) && $JSCompiler_StaticMethods_matchCountryGroups_$self$$.$matchedGroups_$.push($config$jscomp$70$$);
  }));
}, $JSCompiler_StaticMethods_checkGroup_$$ = function($JSCompiler_StaticMethods_checkGroup_$self$$, $countryGroup$$) {
  return $countryGroup$$.reduce(function($JSCompiler_StaticMethods_checkGroup_$self$$, $countryGroup$$) {
    if (/^preset-/.test($countryGroup$$)) {
      return $JSCompiler_StaticMethods_assertWithErrorReturn_$$(_.$isArray$$module$src$types$$($ampGeoPresets$$module$extensions$amp_geo$0_1$amp_geo_presets$$[$countryGroup$$])), $JSCompiler_StaticMethods_checkGroup_$self$$.concat($ampGeoPresets$$module$extensions$amp_geo$0_1$amp_geo_presets$$[$countryGroup$$]);
    }
    $JSCompiler_StaticMethods_checkGroup_$self$$.push($countryGroup$$);
    return $JSCompiler_StaticMethods_checkGroup_$self$$;
  }, []).map(function($JSCompiler_StaticMethods_checkGroup_$self$$) {
    return $JSCompiler_StaticMethods_checkGroup_$self$$.toLowerCase();
  }).includes($JSCompiler_StaticMethods_checkGroup_$self$$.$country_$);
}, $JSCompiler_StaticMethods_clearPreRender_$$ = function($classList$jscomp$8_doc$jscomp$94$$) {
  $classList$jscomp$8_doc$jscomp$94$$ = $classList$jscomp$8_doc$jscomp$94$$.body.classList;
  for (var $classesToRemove$$ = [], $stripRe$$ = /^amp-iso-country-|^amp-geo-group-/i, $i$jscomp$321$$ = $classList$jscomp$8_doc$jscomp$94$$.length - 1; 0 < $i$jscomp$321$$; $i$jscomp$321$$--) {
    $stripRe$$.test($classList$jscomp$8_doc$jscomp$94$$[$i$jscomp$321$$]) && $classesToRemove$$.push($classList$jscomp$8_doc$jscomp$94$$[$i$jscomp$321$$]);
  }
  return $classesToRemove$$;
}, $JSCompiler_StaticMethods_AmpGeo$$module$extensions$amp_geo$0_1$amp_geo_prototype$addToBody_$$ = function($JSCompiler_StaticMethods_AmpGeo$$module$extensions$amp_geo$0_1$amp_geo_prototype$addToBody_$self$$, $config$jscomp$71$$) {
  var $doc$jscomp$95$$ = $JSCompiler_StaticMethods_AmpGeo$$module$extensions$amp_geo$0_1$amp_geo_prototype$addToBody_$self$$.$win$.document, $states$jscomp$1$$ = {};
  return _.$waitForBodyPromise$$module$src$dom$$($doc$jscomp$95$$).then(function() {
    $JSCompiler_StaticMethods_findCountry_$$($JSCompiler_StaticMethods_AmpGeo$$module$extensions$amp_geo$0_1$amp_geo_prototype$addToBody_$self$$, $doc$jscomp$95$$);
    $JSCompiler_StaticMethods_matchCountryGroups_$$($JSCompiler_StaticMethods_AmpGeo$$module$extensions$amp_geo$0_1$amp_geo_prototype$addToBody_$self$$, $config$jscomp$71$$);
    var $classesToRemove$jscomp$1$$ = [];
    switch($JSCompiler_StaticMethods_AmpGeo$$module$extensions$amp_geo$0_1$amp_geo_prototype$addToBody_$self$$.$mode_$) {
      case 2:
        $classesToRemove$jscomp$1$$ = $JSCompiler_StaticMethods_clearPreRender_$$($doc$jscomp$95$$);
      case 0:
        $states$jscomp$1$$.$ISOCountry$ = $JSCompiler_StaticMethods_AmpGeo$$module$extensions$amp_geo$0_1$amp_geo_prototype$addToBody_$self$$.$country_$;
        var $classesToAdd$$ = $JSCompiler_StaticMethods_AmpGeo$$module$extensions$amp_geo$0_1$amp_geo_prototype$addToBody_$self$$.$matchedGroups_$.map(function($JSCompiler_StaticMethods_AmpGeo$$module$extensions$amp_geo$0_1$amp_geo_prototype$addToBody_$self$$) {
          $states$jscomp$1$$[$JSCompiler_StaticMethods_AmpGeo$$module$extensions$amp_geo$0_1$amp_geo_prototype$addToBody_$self$$] = !0;
          return "amp-geo-group-" + $JSCompiler_StaticMethods_AmpGeo$$module$extensions$amp_geo$0_1$amp_geo_prototype$addToBody_$self$$;
        });
        $JSCompiler_StaticMethods_AmpGeo$$module$extensions$amp_geo$0_1$amp_geo_prototype$addToBody_$self$$.$matchedGroups_$.length || $classesToAdd$$.push("amp-geo-no-group");
        $JSCompiler_StaticMethods_AmpGeo$$module$extensions$amp_geo$0_1$amp_geo_prototype$addToBody_$self$$.$error_$ && $classesToAdd$$.push("amp-geo-error");
        $states$jscomp$1$$.$ISOCountryGroups$ = $JSCompiler_StaticMethods_AmpGeo$$module$extensions$amp_geo$0_1$amp_geo_prototype$addToBody_$self$$.$matchedGroups_$;
        $classesToAdd$$.push("amp-iso-country-" + $JSCompiler_StaticMethods_AmpGeo$$module$extensions$amp_geo$0_1$amp_geo_prototype$addToBody_$self$$.$country_$);
        $JSCompiler_StaticMethods_AmpGeo$$module$extensions$amp_geo$0_1$amp_geo_prototype$addToBody_$self$$.$mutateElement$(function() {
          var $JSCompiler_StaticMethods_AmpGeo$$module$extensions$amp_geo$0_1$amp_geo_prototype$addToBody_$self$$ = $doc$jscomp$95$$.body.classList;
          $classesToRemove$jscomp$1$$.push("amp-geo-pending");
          $classesToRemove$jscomp$1$$.forEach(function($config$jscomp$71$$) {
            return $JSCompiler_StaticMethods_AmpGeo$$module$extensions$amp_geo$0_1$amp_geo_prototype$addToBody_$self$$.remove($config$jscomp$71$$);
          });
          $classesToAdd$$.forEach(function($config$jscomp$71$$) {
            return $JSCompiler_StaticMethods_AmpGeo$$module$extensions$amp_geo$0_1$amp_geo_prototype$addToBody_$self$$.add($config$jscomp$71$$);
          });
          if ($config$jscomp$71$$.AmpBind) {
            var $geoState_state$jscomp$68$$ = $doc$jscomp$95$$.getElementById("ampGeo");
            $geoState_state$jscomp$68$$ && $geoState_state$jscomp$68$$.parentNode.removeChild($geoState_state$jscomp$68$$);
            $geoState_state$jscomp$68$$ = $doc$jscomp$95$$.createElement("amp-state");
            var $confScript$$ = $doc$jscomp$95$$.createElement("script");
            $confScript$$.setAttribute("type", "application/json");
            $confScript$$.textContent = JSON.stringify($states$jscomp$1$$);
            $geoState_state$jscomp$68$$.appendChild($confScript$$);
            $geoState_state$jscomp$68$$.id = "ampGeo";
            $doc$jscomp$95$$.body.appendChild($geoState_state$jscomp$68$$);
          }
        }, $doc$jscomp$95$$.body);
    }
    return {$ISOCountry$:$JSCompiler_StaticMethods_AmpGeo$$module$extensions$amp_geo$0_1$amp_geo_prototype$addToBody_$self$$.$country_$, $matchedISOCountryGroups$:$JSCompiler_StaticMethods_AmpGeo$$module$extensions$amp_geo$0_1$amp_geo_prototype$addToBody_$self$$.$matchedGroups_$, $allISOCountryGroups$:$JSCompiler_StaticMethods_AmpGeo$$module$extensions$amp_geo$0_1$amp_geo_prototype$addToBody_$self$$.$definedGroups_$, $isInCountryGroup$:$JSCompiler_StaticMethods_AmpGeo$$module$extensions$amp_geo$0_1$amp_geo_prototype$addToBody_$self$$.$isInCountryGroup$.bind($JSCompiler_StaticMethods_AmpGeo$$module$extensions$amp_geo$0_1$amp_geo_prototype$addToBody_$self$$)};
  });
}, $ampGeoPresets$$module$extensions$amp_geo$0_1$amp_geo_presets$$ = {"preset-eea":"AT BE BG HR CY CZ DK EE FI FR DE GR HU IS IE IT LV LI LT LU MT NL NO PL PT RO SK SI ES SE GB AX IC EA GF PF TF GI GP GG JE MQ YT NC RE BL MF PM SJ VA WF EZ CH".split(" ")};
var $PRE_RENDER_REGEX$$module$extensions$amp_geo$0_1$amp_geo$$ = /amp-iso-country-(\w+)/;
_.$$jscomp$inherits$$($AmpGeo$$module$extensions$amp_geo$0_1$amp_geo$$, window.AMP.BaseElement);
$AmpGeo$$module$extensions$amp_geo$0_1$amp_geo$$.prototype.$buildCallback$ = function() {
  var $children$jscomp$136_config$jscomp$69_geo$jscomp$2$$ = this.element.children;
  $children$jscomp$136_config$jscomp$69_geo$jscomp$2$$.length && $JSCompiler_StaticMethods_assertWithErrorReturn_$$(1 === $children$jscomp$136_config$jscomp$69_geo$jscomp$2$$.length && _.$isJsonScriptTag$$module$src$dom$$($children$jscomp$136_config$jscomp$69_geo$jscomp$2$$[0]));
  $children$jscomp$136_config$jscomp$69_geo$jscomp$2$$ = $children$jscomp$136_config$jscomp$69_geo$jscomp$2$$.length ? _.$tryParseJson$$module$src$json$$($children$jscomp$136_config$jscomp$69_geo$jscomp$2$$[0].textContent, function() {
    return $JSCompiler_StaticMethods_assertWithErrorReturn_$$(!1);
  }) : {};
  $children$jscomp$136_config$jscomp$69_geo$jscomp$2$$ = $JSCompiler_StaticMethods_AmpGeo$$module$extensions$amp_geo$0_1$amp_geo_prototype$addToBody_$$(this, $children$jscomp$136_config$jscomp$69_geo$jscomp$2$$ || {});
  $geoDeferred$$module$extensions$amp_geo$0_1$amp_geo$$.resolve($children$jscomp$136_config$jscomp$69_geo$jscomp$2$$);
};
$AmpGeo$$module$extensions$amp_geo$0_1$amp_geo$$.prototype.$isInCountryGroup$ = function($targetGroup_targets$jscomp$5$$) {
  var $$jscomp$this$jscomp$636$$ = this;
  $targetGroup_targets$jscomp$5$$ = $targetGroup_targets$jscomp$5$$.trim().split(/,\s*/);
  return $targetGroup_targets$jscomp$5$$.filter(function($targetGroup_targets$jscomp$5$$) {
    return 0 <= $$jscomp$this$jscomp$636$$.$definedGroups_$.indexOf($targetGroup_targets$jscomp$5$$);
  }).length !== $targetGroup_targets$jscomp$5$$.length ? 1 : 0 < $targetGroup_targets$jscomp$5$$.filter(function($targetGroup_targets$jscomp$5$$) {
    return 0 <= $$jscomp$this$jscomp$636$$.$matchedGroups_$.indexOf($targetGroup_targets$jscomp$5$$);
  }).length ? 2 : 3;
};
var $geoDeferred$$module$extensions$amp_geo$0_1$amp_geo$$ = null;
(function($AMP$jscomp$54$$) {
  $geoDeferred$$module$extensions$amp_geo$0_1$amp_geo$$ = new _.$Deferred$$module$src$utils$promise$$;
  $AMP$jscomp$54$$.registerElement("amp-geo", $AmpGeo$$module$extensions$amp_geo$0_1$amp_geo$$);
  $AMP$jscomp$54$$.registerServiceForDoc("geo", function() {
    return $geoDeferred$$module$extensions$amp_geo$0_1$amp_geo$$.$promise$;
  });
})(window.self.AMP);

})});
