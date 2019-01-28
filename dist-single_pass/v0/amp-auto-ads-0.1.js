(self.AMP=self.AMP||[]).push({n:"amp-auto-ads",i:["_base_i","_base_ad"],v:"1901181729101",f:(function(AMP,_){
var $JSCompiler_StaticMethods_getElementLayoutBox$$ = function($JSCompiler_StaticMethods_getElementLayoutBox$self$$, $element$jscomp$124$$) {
  var $resource$$ = _.$Resource$$module$src$service$resource$forElementOptional$$($element$jscomp$124$$);
  return $resource$$ ? _.$JSCompiler_StaticMethods_ensuredMeasured_$$($JSCompiler_StaticMethods_getElementLayoutBox$self$$, $resource$$) : _.$JSCompiler_StaticMethods_measurePromise$$($JSCompiler_StaticMethods_getElementLayoutBox$self$$.$vsync_$, function() {
    return $JSCompiler_StaticMethods_getElementLayoutBox$self$$.$getViewport$().$getLayoutRect$($element$jscomp$124$$);
  });
}, $cloneLayoutMarginsChangeDef$$module$src$layout_rect$$ = function($marginsChange$$) {
  return $marginsChange$$ ? {top:$marginsChange$$.top, bottom:$marginsChange$$.bottom, left:$marginsChange$$.left, right:$marginsChange$$.right} : $marginsChange$$;
}, $AnchorAdStrategy$$module$extensions$amp_auto_ads$0_1$anchor_ad_strategy$$ = function($ampdoc$jscomp$139$$, $baseAttributes$$, $configObj$$) {
  this.ampdoc = $ampdoc$jscomp$139$$;
  this.$D$ = $baseAttributes$$;
  this.$F$ = $configObj$$;
}, $getAttributesFromConfigObj$$module$extensions$amp_auto_ads$0_1$attributes$$ = function($attributeObject$jscomp$inline_2814_configObj$jscomp$1$$) {
  if (!$attributeObject$jscomp$inline_2814_configObj$jscomp$1$$.attributes) {
    return {};
  }
  if (!_.$isObject$$module$src$types$$($attributeObject$jscomp$inline_2814_configObj$jscomp$1$$.attributes) || _.$isArray$$module$src$types$$($attributeObject$jscomp$inline_2814_configObj$jscomp$1$$.attributes)) {
    return _.$user$$module$src$log$$().$Log$$module$src$log_prototype$warn$("amp-auto-ads", "attributes property not an object"), {};
  }
  $attributeObject$jscomp$inline_2814_configObj$jscomp$1$$ = $attributeObject$jscomp$inline_2814_configObj$jscomp$1$$.attributes;
  var $attributes$jscomp$inline_2815$$ = {}, $key$jscomp$inline_2816$$;
  for ($key$jscomp$inline_2816$$ in $attributeObject$jscomp$inline_2814_configObj$jscomp$1$$) {
    if ($NON_DATA_ATTRIBUTE_WHITELIST$$module$extensions$amp_auto_ads$0_1$attributes$$[$key$jscomp$inline_2816$$] || _.$startsWith$$module$src$string$$($key$jscomp$inline_2816$$, "data-")) {
      var $valueType$jscomp$inline_2817$$ = typeof $attributeObject$jscomp$inline_2814_configObj$jscomp$1$$[$key$jscomp$inline_2816$$];
      "number" != $valueType$jscomp$inline_2817$$ && "string" != $valueType$jscomp$inline_2817$$ && "boolean" != $valueType$jscomp$inline_2817$$ ? _.$user$$module$src$log$$().$Log$$module$src$log_prototype$warn$("amp-auto-ads", "Attribute type not supported: " + $valueType$jscomp$inline_2817$$) : $attributes$jscomp$inline_2815$$[$key$jscomp$inline_2816$$] = String($attributeObject$jscomp$inline_2814_configObj$jscomp$1$$[$key$jscomp$inline_2816$$]);
    } else {
      _.$user$$module$src$log$$().$Log$$module$src$log_prototype$warn$("amp-auto-ads", "Attribute not whitlisted: " + $key$jscomp$inline_2816$$);
    }
  }
  return $attributes$jscomp$inline_2815$$;
}, $Placement$$module$extensions$amp_auto_ads$0_1$placement$$ = function($ampdoc$jscomp$140$$, $resources$jscomp$10$$, $anchorElement$jscomp$4$$, $position$jscomp$13$$, $injector$$, $attributes$jscomp$19$$, $opt_margins$$) {
  this.ampdoc = $ampdoc$jscomp$140$$;
  this.$G$ = $resources$jscomp$10$$;
  this.$F$ = $anchorElement$jscomp$4$$;
  this.$J$ = $position$jscomp$13$$;
  this.$O$ = $injector$$;
  this.$K$ = $attributes$jscomp$19$$;
  this.$I$ = $opt_margins$$;
  this.$D$ = null;
  this.$state_$ = 0;
}, $JSCompiler_StaticMethods_getEstimatedPosition$$ = function($JSCompiler_StaticMethods_getEstimatedPosition$self$$) {
  return $JSCompiler_StaticMethods_getElementLayoutBox$$($JSCompiler_StaticMethods_getEstimatedPosition$self$$.$G$, $JSCompiler_StaticMethods_getEstimatedPosition$self$$.$F$).then(function($JSCompiler_inline_result$jscomp$697_layoutBox$jscomp$7$$) {
    a: {
      switch($JSCompiler_StaticMethods_getEstimatedPosition$self$$.$J$) {
        case 1:
        case 2:
          $JSCompiler_inline_result$jscomp$697_layoutBox$jscomp$7$$ = $JSCompiler_inline_result$jscomp$697_layoutBox$jscomp$7$$.top;
          break a;
        case 3:
        case 4:
          $JSCompiler_inline_result$jscomp$697_layoutBox$jscomp$7$$ = $JSCompiler_inline_result$jscomp$697_layoutBox$jscomp$7$$.bottom;
          break a;
        default:
          throw Error("Unknown position");
      }
    }
    return $JSCompiler_inline_result$jscomp$697_layoutBox$jscomp$7$$;
  });
}, $JSCompiler_StaticMethods_placeAd$$ = function($JSCompiler_StaticMethods_placeAd$self$$, $baseAttributes$jscomp$1$$, $sizing$jscomp$1$$, $adTracker$$, $isResponsiveEnabled$$) {
  return $JSCompiler_StaticMethods_getEstimatedPosition$$($JSCompiler_StaticMethods_placeAd$self$$).then(function($yPosition$$) {
    return $JSCompiler_StaticMethods_isWithinMinDistanceOfAd_$$($adTracker$$, $yPosition$$, 0).then(function($adTracker$$) {
      if ($adTracker$$) {
        return $JSCompiler_StaticMethods_placeAd$self$$.$state_$ = 3, $JSCompiler_StaticMethods_placeAd$self$$.$state_$;
      }
      $JSCompiler_StaticMethods_placeAd$self$$.$D$ = $JSCompiler_StaticMethods_Placement$$module$extensions$amp_auto_ads$0_1$placement_prototype$createAdElement_$$($JSCompiler_StaticMethods_placeAd$self$$, $baseAttributes$jscomp$1$$, $sizing$jscomp$1$$.width);
      $JSCompiler_StaticMethods_placeAd$self$$.$O$($JSCompiler_StaticMethods_placeAd$self$$.$F$, $JSCompiler_StaticMethods_placeAd$self$$.$D$);
      return $JSCompiler_StaticMethods_getPlacementSizing_$$($JSCompiler_StaticMethods_placeAd$self$$, $sizing$jscomp$1$$, $isResponsiveEnabled$$).then(function($baseAttributes$jscomp$1$$) {
        return _.$whenUpgradedToCustomElement$$module$src$dom$$($JSCompiler_StaticMethods_placeAd$self$$.$D$).then(function() {
          return $JSCompiler_StaticMethods_placeAd$self$$.$D$.$K$();
        }).then(function() {
          return $JSCompiler_StaticMethods_placeAd$self$$.$G$.$attemptChangeSize$($JSCompiler_StaticMethods_placeAd$self$$.$D$, $baseAttributes$jscomp$1$$.height, $baseAttributes$jscomp$1$$.width, $baseAttributes$jscomp$1$$.$margins$);
        }).then(function() {
          $JSCompiler_StaticMethods_placeAd$self$$.$state_$ = 2;
          return $JSCompiler_StaticMethods_placeAd$self$$.$state_$;
        }, function() {
          $JSCompiler_StaticMethods_placeAd$self$$.$state_$ = 1;
          return $JSCompiler_StaticMethods_placeAd$self$$.$state_$;
        });
      });
    });
  });
}, $JSCompiler_StaticMethods_getPlacementSizing_$$ = function($JSCompiler_StaticMethods_getPlacementSizing_$self$$, $sizing$jscomp$2_viewportHeight$jscomp$3$$, $isResponsiveEnabled$jscomp$1$$) {
  var $viewport$jscomp$16$$ = $JSCompiler_StaticMethods_getPlacementSizing_$self$$.$G$.$getViewport$(), $viewportWidth$jscomp$1$$ = $viewport$jscomp$16$$.getWidth();
  if ($isResponsiveEnabled$jscomp$1$$ && 1200 >= $viewportWidth$jscomp$1$$) {
    $sizing$jscomp$2_viewportHeight$jscomp$3$$ = _.$JSCompiler_StaticMethods_getHeight$$($viewport$jscomp$16$$);
    var $responsiveHeight$$ = _.$clamp$$module$src$utils$math$$(Math.round($viewportWidth$jscomp$1$$ / 1.2), 100, Math.min(300, $sizing$jscomp$2_viewportHeight$jscomp$3$$)), $margins$jscomp$2$$ = $cloneLayoutMarginsChangeDef$$module$src$layout_rect$$($JSCompiler_StaticMethods_getPlacementSizing_$self$$.$I$);
    return $JSCompiler_StaticMethods_getElementLayoutBox$$(_.$Services$$module$src$services$resourcesForDoc$$($JSCompiler_StaticMethods_getPlacementSizing_$self$$.$F$), $JSCompiler_StaticMethods_getPlacementSizing_$self$$.$F$).then(function($sizing$jscomp$2_viewportHeight$jscomp$3$$) {
      var $isResponsiveEnabled$jscomp$1$$ = _.$computedStyle$$module$src$style$$($JSCompiler_StaticMethods_getPlacementSizing_$self$$.ampdoc.$win$, $JSCompiler_StaticMethods_getPlacementSizing_$self$$.$F$).direction;
      0 !== $sizing$jscomp$2_viewportHeight$jscomp$3$$.left && ($margins$jscomp$2$$ = $margins$jscomp$2$$ || {}, "rtl" == $isResponsiveEnabled$jscomp$1$$ ? $margins$jscomp$2$$.right = $sizing$jscomp$2_viewportHeight$jscomp$3$$.left : $margins$jscomp$2$$.left = -$sizing$jscomp$2_viewportHeight$jscomp$3$$.left);
    }).then(function() {
      return window.Promise.resolve({width:$viewportWidth$jscomp$1$$, height:$responsiveHeight$$, $margins$:$margins$jscomp$2$$});
    });
  }
  return window.Promise.resolve({height:$sizing$jscomp$2_viewportHeight$jscomp$3$$.height || 250, $margins$:$JSCompiler_StaticMethods_getPlacementSizing_$self$$.$I$});
}, $JSCompiler_StaticMethods_Placement$$module$extensions$amp_auto_ads$0_1$placement_prototype$createAdElement_$$ = function($JSCompiler_StaticMethods_Placement$$module$extensions$amp_auto_ads$0_1$placement_prototype$createAdElement_$self$$, $attributes$jscomp$20_baseAttributes$jscomp$2$$, $width$jscomp$39$$) {
  $attributes$jscomp$20_baseAttributes$jscomp$2$$ = Object.assign(_.$dict$$module$src$utils$object$$({layout:$width$jscomp$39$$ ? "fixed" : "fixed-height", height:"0", width:$width$jscomp$39$$ ? $width$jscomp$39$$ : "auto", "class":"i-amphtml-layout-awaiting-size"}), $attributes$jscomp$20_baseAttributes$jscomp$2$$, $JSCompiler_StaticMethods_Placement$$module$extensions$amp_auto_ads$0_1$placement_prototype$createAdElement_$self$$.$K$);
  return _.$createElementWithAttributes$$module$src$dom$$($JSCompiler_StaticMethods_Placement$$module$extensions$amp_auto_ads$0_1$placement_prototype$createAdElement_$self$$.ampdoc.$win$.document, "amp-ad", $attributes$jscomp$20_baseAttributes$jscomp$2$$);
}, $getPlacementsFromConfigObj$$module$extensions$amp_auto_ads$0_1$placement$$ = function($ampdoc$jscomp$141$$, $configObj$jscomp$2_placementObjs$$) {
  $configObj$jscomp$2_placementObjs$$ = $configObj$jscomp$2_placementObjs$$.placements;
  if (!$configObj$jscomp$2_placementObjs$$) {
    return _.$user$$module$src$log$$().$Log$$module$src$log_prototype$info$("amp-auto-ads", "No placements in config"), [];
  }
  var $placements$$ = [];
  $configObj$jscomp$2_placementObjs$$.forEach(function($configObj$jscomp$2_placementObjs$$) {
    $getPlacementsFromObject$$module$extensions$amp_auto_ads$0_1$placement$$($ampdoc$jscomp$141$$, $configObj$jscomp$2_placementObjs$$, $placements$$);
  });
  return $placements$$;
}, $getPlacementsFromObject$$module$extensions$amp_auto_ads$0_1$placement$$ = function($ampdoc$jscomp$142$$, $placementObj$jscomp$1$$, $placements$jscomp$1$$) {
  var $injector$jscomp$1$$ = $INJECTORS$$module$extensions$amp_auto_ads$0_1$placement$$[$placementObj$jscomp$1$$.pos];
  if ($injector$jscomp$1$$) {
    var $anchor_anchorElements$$ = $placementObj$jscomp$1$$.anchor;
    if ($anchor_anchorElements$$) {
      if ($anchor_anchorElements$$ = $getAnchorElements$$module$extensions$amp_auto_ads$0_1$placement$$($ampdoc$jscomp$142$$.getRootNode(), $anchor_anchorElements$$), $anchor_anchorElements$$.length) {
        var $margins$jscomp$3$$ = void 0;
        if ($placementObj$jscomp$1$$.style) {
          var $marginTop$$ = (0,window.parseInt)($placementObj$jscomp$1$$.style.top_m, 10), $marginBottom$$ = (0,window.parseInt)($placementObj$jscomp$1$$.style.bot_m, 10);
          if ($marginTop$$ || $marginBottom$$) {
            $margins$jscomp$3$$ = {top:$marginTop$$ || void 0, bottom:$marginBottom$$ || void 0};
          }
        }
        $anchor_anchorElements$$.forEach(function($anchor_anchorElements$$) {
          if ($isPositionValid$$module$extensions$amp_auto_ads$0_1$placement$$($anchor_anchorElements$$, $placementObj$jscomp$1$$.pos)) {
            var $marginTop$$ = $getAttributesFromConfigObj$$module$extensions$amp_auto_ads$0_1$attributes$$($placementObj$jscomp$1$$);
            $placements$jscomp$1$$.push(new $Placement$$module$extensions$amp_auto_ads$0_1$placement$$($ampdoc$jscomp$142$$, _.$Services$$module$src$services$resourcesForDoc$$($anchor_anchorElements$$), $anchor_anchorElements$$, $placementObj$jscomp$1$$.pos, $injector$jscomp$1$$, $marginTop$$, $margins$jscomp$3$$));
          }
        });
      } else {
        _.$user$$module$src$log$$().$Log$$module$src$log_prototype$warn$("amp-auto-ads", "No anchor element found");
      }
    } else {
      _.$user$$module$src$log$$().$Log$$module$src$log_prototype$warn$("amp-auto-ads", "No anchor in placement");
    }
  } else {
    _.$user$$module$src$log$$().$Log$$module$src$log_prototype$warn$("amp-auto-ads", "No injector for position");
  }
}, $getAnchorElements$$module$extensions$amp_auto_ads$0_1$placement$$ = function($element$jscomp$344_elements$jscomp$19_rootElement$jscomp$6$$, $anchorObj$$) {
  var $selector$jscomp$35$$ = $anchorObj$$.selector;
  if (!$selector$jscomp$35$$) {
    return _.$user$$module$src$log$$().$Log$$module$src$log_prototype$warn$("amp-auto-ads", "No selector in anchor"), [];
  }
  $element$jscomp$344_elements$jscomp$19_rootElement$jscomp$6$$ = [].slice.call(_.$scopedQuerySelectorAll$$module$src$dom$$($element$jscomp$344_elements$jscomp$19_rootElement$jscomp$6$$.documentElement || $element$jscomp$344_elements$jscomp$19_rootElement$jscomp$6$$, $selector$jscomp$35$$));
  var $minChars$$ = $anchorObj$$.min_c || 0;
  0 < $minChars$$ && ($element$jscomp$344_elements$jscomp$19_rootElement$jscomp$6$$ = $element$jscomp$344_elements$jscomp$19_rootElement$jscomp$6$$.filter(function($element$jscomp$344_elements$jscomp$19_rootElement$jscomp$6$$) {
    return $element$jscomp$344_elements$jscomp$19_rootElement$jscomp$6$$.textContent.length >= $minChars$$;
  }));
  "number" != typeof $anchorObj$$.index && $anchorObj$$.all || ($element$jscomp$344_elements$jscomp$19_rootElement$jscomp$6$$ = ($element$jscomp$344_elements$jscomp$19_rootElement$jscomp$6$$ = $element$jscomp$344_elements$jscomp$19_rootElement$jscomp$6$$[$anchorObj$$.index || 0]) ? [$element$jscomp$344_elements$jscomp$19_rootElement$jscomp$6$$] : []);
  if (0 == $element$jscomp$344_elements$jscomp$19_rootElement$jscomp$6$$.length) {
    return [];
  }
  if ($anchorObj$$.sub) {
    var $subElements$jscomp$8$$ = [];
    $element$jscomp$344_elements$jscomp$19_rootElement$jscomp$6$$.forEach(function($element$jscomp$344_elements$jscomp$19_rootElement$jscomp$6$$) {
      $subElements$jscomp$8$$ = $subElements$jscomp$8$$.concat($getAnchorElements$$module$extensions$amp_auto_ads$0_1$placement$$($element$jscomp$344_elements$jscomp$19_rootElement$jscomp$6$$, $anchorObj$$.sub));
    });
    return $subElements$jscomp$8$$;
  }
  return $element$jscomp$344_elements$jscomp$19_rootElement$jscomp$6$$;
}, $isPositionValid$$module$extensions$amp_auto_ads$0_1$placement$$ = function($anchorElement$jscomp$6$$, $position$jscomp$14$$) {
  var $elementToCheckOrNull$$ = 1 == $position$jscomp$14$$ || 4 == $position$jscomp$14$$ ? $anchorElement$jscomp$6$$.parentElement : $anchorElement$jscomp$6$$;
  return $elementToCheckOrNull$$ ? !$BLACKLISTED_ANCESTOR_TAGS$$module$extensions$amp_auto_ads$0_1$placement$$.some(function($anchorElement$jscomp$6$$) {
    return _.$closestByTag$$module$src$dom$$($elementToCheckOrNull$$, $anchorElement$jscomp$6$$) ? (_.$user$$module$src$log$$().$Log$$module$src$log_prototype$warn$("amp-auto-ads", "Placement inside blacklisted ancestor: " + $anchorElement$jscomp$6$$), !0) : !1;
  }) : (_.$user$$module$src$log$$().$Log$$module$src$log_prototype$warn$("amp-auto-ads", "Parentless anchor with BEFORE/AFTER position."), !1);
}, $AdTracker$$module$extensions$amp_auto_ads$0_1$ad_tracker$$ = function($ads$$, $adConstraints$$) {
  this.$D$ = $ads$$;
  this.$I$ = $adConstraints$$.$initialMinSpacing$;
  this.$G$ = $adConstraints$$.$subsequentMinSpacing$.slice(0).sort(function($ads$$, $adConstraints$$) {
    return $ads$$.$adCount$ - $adConstraints$$.$adCount$;
  });
  this.$J$ = $adConstraints$$.$maxAdCount$;
  this.$F$ = $JSCompiler_StaticMethods_getMinAdSpacing_$$(this);
}, $JSCompiler_StaticMethods_isMaxAdCountReached$$ = function($JSCompiler_StaticMethods_isMaxAdCountReached$self$$) {
  return $JSCompiler_StaticMethods_isMaxAdCountReached$self$$.$D$.length >= $JSCompiler_StaticMethods_isMaxAdCountReached$self$$.$J$;
}, $JSCompiler_StaticMethods_isWithinMinDistanceOfAd_$$ = function($JSCompiler_StaticMethods_isWithinMinDistanceOfAd_$self$$, $yPosition$jscomp$2$$, $adIndex$$) {
  return $adIndex$$ >= $JSCompiler_StaticMethods_isWithinMinDistanceOfAd_$self$$.$D$.length ? window.Promise.resolve(!1) : $JSCompiler_StaticMethods_getDistanceFromAd_$$($yPosition$jscomp$2$$, $JSCompiler_StaticMethods_isWithinMinDistanceOfAd_$self$$.$D$[$adIndex$$]).then(function($distance$jscomp$6$$) {
    return $distance$jscomp$6$$ < $JSCompiler_StaticMethods_isWithinMinDistanceOfAd_$self$$.$F$ ? !0 : $JSCompiler_StaticMethods_isWithinMinDistanceOfAd_$$($JSCompiler_StaticMethods_isWithinMinDistanceOfAd_$self$$, $yPosition$jscomp$2$$, $adIndex$$ + 1);
  });
}, $JSCompiler_StaticMethods_getDistanceFromAd_$$ = function($yPosition$jscomp$3$$, $ad$jscomp$1$$) {
  return $JSCompiler_StaticMethods_getElementLayoutBox$$(_.$Services$$module$src$services$resourcesForDoc$$($ad$jscomp$1$$), $ad$jscomp$1$$).then(function($ad$jscomp$1$$) {
    return $yPosition$jscomp$3$$ >= $ad$jscomp$1$$.top && $yPosition$jscomp$3$$ <= $ad$jscomp$1$$.bottom ? 0 : Math.min(Math.abs($yPosition$jscomp$3$$ - $ad$jscomp$1$$.top), Math.abs($yPosition$jscomp$3$$ - $ad$jscomp$1$$.bottom));
  });
}, $JSCompiler_StaticMethods_getMinAdSpacing_$$ = function($JSCompiler_StaticMethods_getMinAdSpacing_$self$$) {
  for (var $adCount$$ = $JSCompiler_StaticMethods_getMinAdSpacing_$self$$.$D$.length, $spacing$$ = $JSCompiler_StaticMethods_getMinAdSpacing_$self$$.$I$, $i$jscomp$257$$ = 0; $i$jscomp$257$$ < $JSCompiler_StaticMethods_getMinAdSpacing_$self$$.$G$.length; $i$jscomp$257$$++) {
    var $item$jscomp$13$$ = $JSCompiler_StaticMethods_getMinAdSpacing_$self$$.$G$[$i$jscomp$257$$];
    $item$jscomp$13$$.$adCount$ <= $adCount$$ && ($spacing$$ = $item$jscomp$13$$.spacing);
  }
  return $spacing$$;
}, $getExistingAds$$module$extensions$amp_auto_ads$0_1$ad_tracker$$ = function($ampdoc$jscomp$143$$) {
  return [].slice.call($ampdoc$jscomp$143$$.getRootNode().getElementsByTagName("AMP-AD")).filter(function($ampdoc$jscomp$143$$) {
    return $ampdoc$jscomp$143$$.parentElement && "AMP-STICKY-AD" == $ampdoc$jscomp$143$$.parentElement.tagName ? !1 : !0;
  });
}, $getAdConstraintsFromConfigObj$$module$extensions$amp_auto_ads$0_1$ad_tracker$$ = function($ampdoc$jscomp$144_initialMinSpacing$$, $configObj$jscomp$3_obj$jscomp$43$$) {
  $configObj$jscomp$3_obj$jscomp$43$$ = $configObj$jscomp$3_obj$jscomp$43$$.adConstraints;
  if (!$configObj$jscomp$3_obj$jscomp$43$$) {
    return null;
  }
  var $viewportHeight$jscomp$5$$ = _.$JSCompiler_StaticMethods_getHeight$$(_.$Services$$module$src$services$viewportForDoc$$($ampdoc$jscomp$144_initialMinSpacing$$));
  $ampdoc$jscomp$144_initialMinSpacing$$ = $getValueFromString$$module$extensions$amp_auto_ads$0_1$ad_tracker$$($configObj$jscomp$3_obj$jscomp$43$$.initialMinSpacing, $viewportHeight$jscomp$5$$);
  if (null == $ampdoc$jscomp$144_initialMinSpacing$$) {
    return _.$user$$module$src$log$$().$Log$$module$src$log_prototype$warn$("amp-auto-ads", "Invalid initial min spacing"), null;
  }
  var $subsequentMinSpacing$$ = ($configObj$jscomp$3_obj$jscomp$43$$.subsequentMinSpacing || []).map(function($ampdoc$jscomp$144_initialMinSpacing$$) {
    var $configObj$jscomp$3_obj$jscomp$43$$ = $ampdoc$jscomp$144_initialMinSpacing$$.adCount;
    if (null == $configObj$jscomp$3_obj$jscomp$43$$) {
      return _.$user$$module$src$log$$().$Log$$module$src$log_prototype$warn$("amp-auto-ads", "No subsequentMinSpacing adCount specified"), null;
    }
    $ampdoc$jscomp$144_initialMinSpacing$$ = $getValueFromString$$module$extensions$amp_auto_ads$0_1$ad_tracker$$($ampdoc$jscomp$144_initialMinSpacing$$.spacing, $viewportHeight$jscomp$5$$);
    return null == $ampdoc$jscomp$144_initialMinSpacing$$ ? (_.$user$$module$src$log$$().$Log$$module$src$log_prototype$warn$("amp-auto-ads", "Invalid subsequent min spacing"), null) : {$adCount$:$configObj$jscomp$3_obj$jscomp$43$$, spacing:$ampdoc$jscomp$144_initialMinSpacing$$};
  });
  return -1 != $subsequentMinSpacing$$.indexOf(null) ? null : null == $configObj$jscomp$3_obj$jscomp$43$$.maxAdCount ? (_.$user$$module$src$log$$().$Log$$module$src$log_prototype$warn$("amp-auto-ads", "No maxAdCount specified"), null) : {$initialMinSpacing$:$ampdoc$jscomp$144_initialMinSpacing$$, $subsequentMinSpacing$:$subsequentMinSpacing$$, $maxAdCount$:$configObj$jscomp$3_obj$jscomp$43$$.maxAdCount};
}, $getValueFromString$$module$extensions$amp_auto_ads$0_1$ad_tracker$$ = function($strValue$$, $viewportHeight$jscomp$6$$) {
  if (!$strValue$$) {
    return null;
  }
  var $numValue$$ = (0,window.parseFloat)($strValue$$);
  return (0,window.isNaN)($numValue$$) || 0 > $numValue$$ ? null : _.$endsWith$$module$src$string$$($strValue$$, "px") ? $numValue$$ : _.$endsWith$$module$src$string$$($strValue$$, "vp") ? $numValue$$ * $viewportHeight$jscomp$6$$ : null;
}, $getAdNetworkConfig$$module$extensions$amp_auto_ads$0_1$ad_network_config$$ = function($type$jscomp$174$$, $autoAmpAdsElement$$) {
  return "adsense" == $type$jscomp$174$$ ? new $AdSenseNetworkConfig$$module$extensions$amp_auto_ads$0_1$ad_network_config$$($autoAmpAdsElement$$) : "doubleclick" == $type$jscomp$174$$ ? new $DoubleclickNetworkConfig$$module$extensions$amp_auto_ads$0_1$ad_network_config$$($autoAmpAdsElement$$) : null;
}, $AdSenseNetworkConfig$$module$extensions$amp_auto_ads$0_1$ad_network_config$$ = function($autoAmpAdsElement$jscomp$2$$) {
  this.$D$ = $autoAmpAdsElement$jscomp$2$$;
}, $DoubleclickNetworkConfig$$module$extensions$amp_auto_ads$0_1$ad_network_config$$ = function($autoAmpAdsElement$jscomp$3$$) {
  this.$D$ = $autoAmpAdsElement$jscomp$3$$;
}, $AdStrategy$$module$extensions$amp_auto_ads$0_1$ad_strategy$$ = function($placements$jscomp$2$$, $baseAttributes$jscomp$3$$, $sizing$jscomp$3$$, $adTracker$jscomp$1$$, $isResponsiveEnabled$jscomp$2$$) {
  this.$G$ = $placements$jscomp$2$$.slice(0);
  this.$F$ = $baseAttributes$jscomp$3$$;
  this.$J$ = $sizing$jscomp$3$$;
  this.$D$ = $adTracker$jscomp$1$$;
  this.$adsPlaced_$ = 0;
  this.$I$ = void 0 === $isResponsiveEnabled$jscomp$2$$ ? !1 : $isResponsiveEnabled$jscomp$2$$;
}, $JSCompiler_StaticMethods_AdStrategy$$module$extensions$amp_auto_ads$0_1$ad_strategy_prototype$run$$ = function($JSCompiler_StaticMethods_AdStrategy$$module$extensions$amp_auto_ads$0_1$ad_strategy_prototype$run$self$$) {
  return $JSCompiler_StaticMethods_isMaxAdCountReached$$($JSCompiler_StaticMethods_AdStrategy$$module$extensions$amp_auto_ads$0_1$ad_strategy_prototype$run$self$$.$D$) ? _.$tryResolve$$module$src$utils$promise$$(function() {
    return $JSCompiler_StaticMethods_getStrategyResult_$$($JSCompiler_StaticMethods_AdStrategy$$module$extensions$amp_auto_ads$0_1$ad_strategy_prototype$run$self$$);
  }) : $JSCompiler_StaticMethods_placeNextAd_$$($JSCompiler_StaticMethods_AdStrategy$$module$extensions$amp_auto_ads$0_1$ad_strategy_prototype$run$self$$).then(function($success$jscomp$11$$) {
    return $success$jscomp$11$$ ? $JSCompiler_StaticMethods_AdStrategy$$module$extensions$amp_auto_ads$0_1$ad_strategy_prototype$run$$($JSCompiler_StaticMethods_AdStrategy$$module$extensions$amp_auto_ads$0_1$ad_strategy_prototype$run$self$$) : $JSCompiler_StaticMethods_getStrategyResult_$$($JSCompiler_StaticMethods_AdStrategy$$module$extensions$amp_auto_ads$0_1$ad_strategy_prototype$run$self$$);
  });
}, $JSCompiler_StaticMethods_getStrategyResult_$$ = function($JSCompiler_StaticMethods_getStrategyResult_$self$$) {
  return {$adsPlaced$:$JSCompiler_StaticMethods_getStrategyResult_$self$$.$adsPlaced_$, $totalAdsOnPage$:$JSCompiler_StaticMethods_getStrategyResult_$self$$.$D$.$D$.length};
}, $JSCompiler_StaticMethods_placeNextAd_$$ = function($JSCompiler_StaticMethods_placeNextAd_$self$$) {
  var $nextPlacement$$ = $JSCompiler_StaticMethods_placeNextAd_$self$$.$G$.shift();
  return $nextPlacement$$ ? $JSCompiler_StaticMethods_placeAd$$($nextPlacement$$, $JSCompiler_StaticMethods_placeNextAd_$self$$.$F$, $JSCompiler_StaticMethods_placeNextAd_$self$$.$J$, $JSCompiler_StaticMethods_placeNextAd_$self$$.$D$, $JSCompiler_StaticMethods_placeNextAd_$self$$.$I$).then(function($JSCompiler_StaticMethods_addAd$self$jscomp$inline_2822_state$jscomp$50$$) {
    return 2 == $JSCompiler_StaticMethods_addAd$self$jscomp$inline_2822_state$jscomp$50$$ ? ($JSCompiler_StaticMethods_addAd$self$jscomp$inline_2822_state$jscomp$50$$ = $JSCompiler_StaticMethods_placeNextAd_$self$$.$D$, $JSCompiler_StaticMethods_addAd$self$jscomp$inline_2822_state$jscomp$50$$.$D$.push($nextPlacement$$.$D$), $JSCompiler_StaticMethods_addAd$self$jscomp$inline_2822_state$jscomp$50$$.$F$ = $JSCompiler_StaticMethods_getMinAdSpacing_$$($JSCompiler_StaticMethods_addAd$self$jscomp$inline_2822_state$jscomp$50$$), 
    $JSCompiler_StaticMethods_placeNextAd_$self$$.$adsPlaced_$++, !0) : $JSCompiler_StaticMethods_placeNextAd_$$($JSCompiler_StaticMethods_placeNextAd_$self$$);
  }) : (_.$user$$module$src$log$$().$Log$$module$src$log_prototype$info$("amp-auto-ads", "unable to fulfill ad strategy"), window.Promise.resolve(!1));
}, $AmpAutoAds$$module$extensions$amp_auto_ads$0_1$amp_auto_ads$$ = function($var_args$jscomp$68$$) {
  return window.AMP.BaseElement.apply(this, arguments) || this;
}, $JSCompiler_StaticMethods_AmpAutoAds$$module$extensions$amp_auto_ads$0_1$amp_auto_ads_prototype$getConfig_$$ = function($JSCompiler_StaticMethods_AmpAutoAds$$module$extensions$amp_auto_ads$0_1$amp_auto_ads_prototype$getConfig_$self$$, $configUrl$$) {
  return _.$JSCompiler_StaticMethods_fetchJson$$(_.$Services$$module$src$services$xhrFor$$($JSCompiler_StaticMethods_AmpAutoAds$$module$extensions$amp_auto_ads$0_1$amp_auto_ads_prototype$getConfig_$self$$.$win$), $configUrl$$, {mode:"cors", method:"GET", credentials:"omit", requireAmpResponseSourceOrigin:!1}).then(function($JSCompiler_StaticMethods_AmpAutoAds$$module$extensions$amp_auto_ads$0_1$amp_auto_ads_prototype$getConfig_$self$$) {
    return $JSCompiler_StaticMethods_AmpAutoAds$$module$extensions$amp_auto_ads$0_1$amp_auto_ads_prototype$getConfig_$self$$.json();
  }).catch(function($configUrl$$) {
    $JSCompiler_StaticMethods_AmpAutoAds$$module$extensions$amp_auto_ads$0_1$amp_auto_ads_prototype$getConfig_$self$$.$user$().error("amp-auto-ads", "amp-auto-ads config xhr failed: " + $configUrl$$);
    return null;
  });
};
var $NON_DATA_ATTRIBUTE_WHITELIST$$module$extensions$amp_auto_ads$0_1$attributes$$ = {type:!0};
var $BLACKLISTED_ANCESTOR_TAGS$$module$extensions$amp_auto_ads$0_1$placement$$ = ["AMP-SIDEBAR", "AMP-APP-BANNER"], $INJECTORS$$module$extensions$amp_auto_ads$0_1$placement$$ = {1:function($anchorElement$$, $elementToInject$$) {
  $anchorElement$$.parentNode.insertBefore($elementToInject$$, $anchorElement$$);
}, 4:function($anchorElement$jscomp$1$$, $elementToInject$jscomp$1$$) {
  $anchorElement$jscomp$1$$.parentNode.insertBefore($elementToInject$jscomp$1$$, $anchorElement$jscomp$1$$.nextSibling);
}, 2:function($anchorElement$jscomp$2$$, $elementToInject$jscomp$2$$) {
  $anchorElement$jscomp$2$$.insertBefore($elementToInject$jscomp$2$$, $anchorElement$jscomp$2$$.firstChild);
}, 3:function($anchorElement$jscomp$3$$, $elementToInject$jscomp$3$$) {
  $anchorElement$jscomp$3$$.appendChild($elementToInject$jscomp$3$$);
}};
_.$JSCompiler_prototypeAlias$$ = $AdSenseNetworkConfig$$module$extensions$amp_auto_ads$0_1$ad_network_config$$.prototype;
_.$JSCompiler_prototypeAlias$$.$AdNetworkConfigDef$$module$extensions$amp_auto_ads$0_1$ad_network_config_prototype$isEnabled$ = function($win$jscomp$331$$) {
  return "3782001" != _.$getAdSenseAmpAutoAdsExpBranch$$module$ads$google$adsense_amp_auto_ads$$($win$jscomp$331$$);
};
_.$JSCompiler_prototypeAlias$$.$isResponsiveEnabled$ = function($win$jscomp$332$$) {
  return "19861210" != _.$getAdSenseAmpAutoAdsResponsiveExperimentBranch$$module$ads$google$adsense_amp_auto_ads_responsive$$($win$jscomp$332$$);
};
_.$JSCompiler_prototypeAlias$$.$getConfigUrl$ = function() {
  var $docInfo$jscomp$3$$ = _.$Services$$module$src$services$documentInfoForDoc$$(this.$D$), $canonicalHostname$$ = _.$parseUrlDeprecated$$module$src$url$$($docInfo$jscomp$3$$.canonicalUrl).hostname;
  return _.$buildUrl$$module$ads$google$a4a$url_builder$$("//pagead2.googlesyndication.com/getconfig/ama", {client:this.$D$.getAttribute("data-ad-client"), plah:$canonicalHostname$$, ama_t:"amp", url:$docInfo$jscomp$3$$.canonicalUrl}, 4096);
};
_.$JSCompiler_prototypeAlias$$.$getAttributes$ = function() {
  return _.$dict$$module$src$utils$object$$({type:"adsense", "data-ad-client":this.$D$.getAttribute("data-ad-client")});
};
_.$JSCompiler_prototypeAlias$$.$getDefaultAdConstraints$ = function() {
  var $viewportHeight$jscomp$8$$ = _.$Services$$module$src$services$viewportForDoc$$(this.$D$).$getSize$().height;
  return {$initialMinSpacing$:$viewportHeight$jscomp$8$$, $subsequentMinSpacing$:[{$adCount$:3, spacing:2 * $viewportHeight$jscomp$8$$}, {$adCount$:6, spacing:3 * $viewportHeight$jscomp$8$$}], $maxAdCount$:8};
};
_.$JSCompiler_prototypeAlias$$.$getSizing$ = function() {
  return {};
};
_.$JSCompiler_prototypeAlias$$ = $DoubleclickNetworkConfig$$module$extensions$amp_auto_ads$0_1$ad_network_config$$.prototype;
_.$JSCompiler_prototypeAlias$$.$AdNetworkConfigDef$$module$extensions$amp_auto_ads$0_1$ad_network_config_prototype$isEnabled$ = function() {
  return !0;
};
_.$JSCompiler_prototypeAlias$$.$isResponsiveEnabled$ = function() {
  return !1;
};
_.$JSCompiler_prototypeAlias$$.$getConfigUrl$ = function() {
  var $docInfo$jscomp$4$$ = _.$Services$$module$src$services$documentInfoForDoc$$(this.$D$), $canonicalHostname$jscomp$1$$ = _.$parseUrlDeprecated$$module$src$url$$($docInfo$jscomp$4$$.canonicalUrl).hostname;
  return _.$buildUrl$$module$ads$google$a4a$url_builder$$("//pagead2.googlesyndication.com/getconfig/ama", {client:this.$D$.getAttribute("data-ad-legacy-client"), plah:$canonicalHostname$jscomp$1$$, ama_t:"amp", url:$docInfo$jscomp$4$$.canonicalUrl}, 4096);
};
_.$JSCompiler_prototypeAlias$$.$getAttributes$ = function() {
  return _.$dict$$module$src$utils$object$$({type:"doubleclick", "data-slot":this.$D$.getAttribute("data-slot"), json:this.$D$.getAttribute("data-json")});
};
_.$JSCompiler_prototypeAlias$$.$getDefaultAdConstraints$ = function() {
  var $viewportHeight$jscomp$9$$ = _.$Services$$module$src$services$viewportForDoc$$(this.$D$).$getSize$().height;
  return {$initialMinSpacing$:$viewportHeight$jscomp$9$$, $subsequentMinSpacing$:[{$adCount$:3, spacing:2 * $viewportHeight$jscomp$9$$}, {$adCount$:6, spacing:3 * $viewportHeight$jscomp$9$$}], $maxAdCount$:8};
};
_.$JSCompiler_prototypeAlias$$.$getSizing$ = function() {
  var $experimentJson$$ = _.$tryParseJson$$module$src$json$$(this.$D$.getAttribute("data-experiment"));
  return $experimentJson$$ ? {height:$experimentJson$$.height ? Number($experimentJson$$.height) : 250, width:$experimentJson$$.width ? Number($experimentJson$$.width) : void 0} : {};
};
_.$$jscomp$inherits$$($AmpAutoAds$$module$extensions$amp_auto_ads$0_1$amp_auto_ads$$, window.AMP.BaseElement);
$AmpAutoAds$$module$extensions$amp_auto_ads$0_1$amp_auto_ads$$.prototype.$buildCallback$ = function() {
  var $$jscomp$this$jscomp$459$$ = this, $type$jscomp$175$$ = this.element.getAttribute("type"), $adNetwork$$ = $getAdNetworkConfig$$module$extensions$amp_auto_ads$0_1$ad_network_config$$($type$jscomp$175$$, this.element);
  if ($adNetwork$$.$AdNetworkConfigDef$$module$extensions$amp_auto_ads$0_1$ad_network_config_prototype$isEnabled$(this.$win$)) {
    var $ampdoc$jscomp$145$$ = this.$getAmpDoc$();
    _.$JSCompiler_StaticMethods_installExtensionForDoc$$(_.$Services$$module$src$services$extensionsFor$$(this.$win$), $ampdoc$jscomp$145$$, "amp-ad");
    _.$Services$$module$src$services$viewerForDoc$$(this.$getAmpDoc$()).$D$.then(function() {
      return $JSCompiler_StaticMethods_AmpAutoAds$$module$extensions$amp_auto_ads$0_1$amp_auto_ads_prototype$getConfig_$$($$jscomp$this$jscomp$459$$, $adNetwork$$.$getConfigUrl$());
    }).then(function($type$jscomp$175$$) {
      if ($type$jscomp$175$$) {
        var $JSCompiler_StaticMethods_AnchorAdStrategy$$module$extensions$amp_auto_ads$0_1$anchor_ad_strategy_prototype$run$self$jscomp$inline_2825_body$jscomp$inline_6106_configObj$jscomp$4$$ = $type$jscomp$175$$.noConfigReason;
        if ($JSCompiler_StaticMethods_AnchorAdStrategy$$module$extensions$amp_auto_ads$0_1$anchor_ad_strategy_prototype$run$self$jscomp$inline_2825_body$jscomp$inline_6106_configObj$jscomp$4$$) {
          $$jscomp$this$jscomp$459$$.$user$().$Log$$module$src$log_prototype$warn$("amp-auto-ads", $JSCompiler_StaticMethods_AnchorAdStrategy$$module$extensions$amp_auto_ads$0_1$anchor_ad_strategy_prototype$run$self$jscomp$inline_2825_body$jscomp$inline_6106_configObj$jscomp$4$$);
        } else {
          $JSCompiler_StaticMethods_AnchorAdStrategy$$module$extensions$amp_auto_ads$0_1$anchor_ad_strategy_prototype$run$self$jscomp$inline_2825_body$jscomp$inline_6106_configObj$jscomp$4$$ = $getPlacementsFromConfigObj$$module$extensions$amp_auto_ads$0_1$placement$$($ampdoc$jscomp$145$$, $type$jscomp$175$$);
          var $ampAd$jscomp$inline_6104_attributes$jscomp$23_attributes$jscomp$inline_6102_i$jscomp$inline_6098$$ = Object.assign($adNetwork$$.$getAttributes$(), $getAttributesFromConfigObj$$module$extensions$amp_auto_ads$0_1$attributes$$($type$jscomp$175$$)), $sizing$jscomp$4$$ = $adNetwork$$.$getSizing$(), $adConstraints$jscomp$1_adTracker$jscomp$2$$ = $getAdConstraintsFromConfigObj$$module$extensions$amp_auto_ads$0_1$ad_tracker$$($ampdoc$jscomp$145$$, $type$jscomp$175$$) || $adNetwork$$.$getDefaultAdConstraints$();
          $adConstraints$jscomp$1_adTracker$jscomp$2$$ = new $AdTracker$$module$extensions$amp_auto_ads$0_1$ad_tracker$$($getExistingAds$$module$extensions$amp_auto_ads$0_1$ad_tracker$$($ampdoc$jscomp$145$$), $adConstraints$jscomp$1_adTracker$jscomp$2$$);
          $JSCompiler_StaticMethods_AdStrategy$$module$extensions$amp_auto_ads$0_1$ad_strategy_prototype$run$$(new $AdStrategy$$module$extensions$amp_auto_ads$0_1$ad_strategy$$($JSCompiler_StaticMethods_AnchorAdStrategy$$module$extensions$amp_auto_ads$0_1$anchor_ad_strategy_prototype$run$self$jscomp$inline_2825_body$jscomp$inline_6106_configObj$jscomp$4$$, $ampAd$jscomp$inline_6104_attributes$jscomp$23_attributes$jscomp$inline_6102_i$jscomp$inline_6098$$, $sizing$jscomp$4$$, $adConstraints$jscomp$1_adTracker$jscomp$2$$, 
          $adNetwork$$.$isResponsiveEnabled$($$jscomp$this$jscomp$459$$.$win$)));
          $type$jscomp$175$$ = new $AnchorAdStrategy$$module$extensions$amp_auto_ads$0_1$anchor_ad_strategy$$($ampdoc$jscomp$145$$, $ampAd$jscomp$inline_6104_attributes$jscomp$23_attributes$jscomp$inline_6102_i$jscomp$inline_6098$$, $type$jscomp$175$$);
          b: {
            if ($JSCompiler_StaticMethods_AnchorAdStrategy$$module$extensions$amp_auto_ads$0_1$anchor_ad_strategy_prototype$run$self$jscomp$inline_2825_body$jscomp$inline_6106_configObj$jscomp$4$$ = $type$jscomp$175$$.$F$.optInStatus) {
              for ($ampAd$jscomp$inline_6104_attributes$jscomp$23_attributes$jscomp$inline_6102_i$jscomp$inline_6098$$ = 0; $ampAd$jscomp$inline_6104_attributes$jscomp$23_attributes$jscomp$inline_6102_i$jscomp$inline_6098$$ < $JSCompiler_StaticMethods_AnchorAdStrategy$$module$extensions$amp_auto_ads$0_1$anchor_ad_strategy_prototype$run$self$jscomp$inline_2825_body$jscomp$inline_6106_configObj$jscomp$4$$.length; $ampAd$jscomp$inline_6104_attributes$jscomp$23_attributes$jscomp$inline_6102_i$jscomp$inline_6098$$++) {
                if (2 == $JSCompiler_StaticMethods_AnchorAdStrategy$$module$extensions$amp_auto_ads$0_1$anchor_ad_strategy_prototype$run$self$jscomp$inline_2825_body$jscomp$inline_6106_configObj$jscomp$4$$[$ampAd$jscomp$inline_6104_attributes$jscomp$23_attributes$jscomp$inline_6102_i$jscomp$inline_6098$$]) {
                  $JSCompiler_StaticMethods_AnchorAdStrategy$$module$extensions$amp_auto_ads$0_1$anchor_ad_strategy_prototype$run$self$jscomp$inline_2825_body$jscomp$inline_6106_configObj$jscomp$4$$ = !0;
                  break b;
                }
              }
            }
            $JSCompiler_StaticMethods_AnchorAdStrategy$$module$extensions$amp_auto_ads$0_1$anchor_ad_strategy_prototype$run$self$jscomp$inline_2825_body$jscomp$inline_6106_configObj$jscomp$4$$ = !1;
          }
          $JSCompiler_StaticMethods_AnchorAdStrategy$$module$extensions$amp_auto_ads$0_1$anchor_ad_strategy_prototype$run$self$jscomp$inline_2825_body$jscomp$inline_6106_configObj$jscomp$4$$ ? 0 < $type$jscomp$175$$.ampdoc.getRootNode().getElementsByTagName("AMP-STICKY-AD").length ? (_.$user$$module$src$log$$().$Log$$module$src$log_prototype$warn$("amp-auto-ads", "exists <amp-sticky-ad>"), window.Promise.resolve(!1)) : (_.$JSCompiler_StaticMethods_installExtensionForDoc$$(_.$Services$$module$src$services$extensionsFor$$($type$jscomp$175$$.ampdoc.$win$), 
          $type$jscomp$175$$.ampdoc, "amp-sticky-ad"), $JSCompiler_StaticMethods_AnchorAdStrategy$$module$extensions$amp_auto_ads$0_1$anchor_ad_strategy_prototype$run$self$jscomp$inline_2825_body$jscomp$inline_6106_configObj$jscomp$4$$ = _.$Services$$module$src$services$viewportForDoc$$($type$jscomp$175$$.ampdoc).getWidth(), $ampAd$jscomp$inline_6104_attributes$jscomp$23_attributes$jscomp$inline_6102_i$jscomp$inline_6098$$ = Object.assign({}, $type$jscomp$175$$.$D$, _.$dict$$module$src$utils$object$$({width:String($JSCompiler_StaticMethods_AnchorAdStrategy$$module$extensions$amp_auto_ads$0_1$anchor_ad_strategy_prototype$run$self$jscomp$inline_2825_body$jscomp$inline_6106_configObj$jscomp$4$$), 
          height:"100"})), $JSCompiler_StaticMethods_AnchorAdStrategy$$module$extensions$amp_auto_ads$0_1$anchor_ad_strategy_prototype$run$self$jscomp$inline_2825_body$jscomp$inline_6106_configObj$jscomp$4$$ = $type$jscomp$175$$.ampdoc.$win$.document, $ampAd$jscomp$inline_6104_attributes$jscomp$23_attributes$jscomp$inline_6102_i$jscomp$inline_6098$$ = _.$createElementWithAttributes$$module$src$dom$$($JSCompiler_StaticMethods_AnchorAdStrategy$$module$extensions$amp_auto_ads$0_1$anchor_ad_strategy_prototype$run$self$jscomp$inline_2825_body$jscomp$inline_6106_configObj$jscomp$4$$, 
          "amp-ad", $ampAd$jscomp$inline_6104_attributes$jscomp$23_attributes$jscomp$inline_6102_i$jscomp$inline_6098$$), $JSCompiler_StaticMethods_AnchorAdStrategy$$module$extensions$amp_auto_ads$0_1$anchor_ad_strategy_prototype$run$self$jscomp$inline_2825_body$jscomp$inline_6106_configObj$jscomp$4$$ = _.$createElementWithAttributes$$module$src$dom$$($JSCompiler_StaticMethods_AnchorAdStrategy$$module$extensions$amp_auto_ads$0_1$anchor_ad_strategy_prototype$run$self$jscomp$inline_2825_body$jscomp$inline_6106_configObj$jscomp$4$$, 
          "amp-sticky-ad", _.$dict$$module$src$utils$object$$({layout:"nodisplay"})), $JSCompiler_StaticMethods_AnchorAdStrategy$$module$extensions$amp_auto_ads$0_1$anchor_ad_strategy_prototype$run$self$jscomp$inline_2825_body$jscomp$inline_6106_configObj$jscomp$4$$.appendChild($ampAd$jscomp$inline_6104_attributes$jscomp$23_attributes$jscomp$inline_6102_i$jscomp$inline_6098$$), $type$jscomp$175$$ = $type$jscomp$175$$.ampdoc.$getBody$(), $type$jscomp$175$$.insertBefore($JSCompiler_StaticMethods_AnchorAdStrategy$$module$extensions$amp_auto_ads$0_1$anchor_ad_strategy_prototype$run$self$jscomp$inline_2825_body$jscomp$inline_6106_configObj$jscomp$4$$, 
          $type$jscomp$175$$.firstChild), window.Promise.resolve(!0)) : window.Promise.resolve(!1);
        }
      }
    });
  }
};
$AmpAutoAds$$module$extensions$amp_auto_ads$0_1$amp_auto_ads$$.prototype.$isLayoutSupported$ = function() {
  return !0;
};
window.self.AMP.registerElement("amp-auto-ads", $AmpAutoAds$$module$extensions$amp_auto_ads$0_1$amp_auto_ads$$);

})});
