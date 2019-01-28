(self.AMP=self.AMP||[]).push({n:"amp-addthis",i:["_base_i","_base_misc"],v:"1901181729101",f:(function(AMP,_){
var $groupPixelsByTime$$module$extensions$amp_addthis$0_1$addthis_utils$pixel$$ = function($pixelList$$) {
  var $delayMap$$ = $pixelList$$.map(function($pixelList$$) {
    var $delayMap$$ = $pixelList$$.delay;
    return Object.assign({}, $pixelList$$, {delay:Array.isArray($delayMap$$) && $delayMap$$.length ? $delayMap$$ : [0]});
  }).map(function($pixelList$$) {
    return $pixelList$$.delay.map(function($delayMap$$) {
      return {delay:$delayMap$$, $pixels$:[$pixelList$$]};
    });
  }).reduce(function($pixelList$$, $delayMap$$) {
    return $pixelList$$.concat($delayMap$$);
  }, []).reduce(function($pixelList$$, $delayMap$$) {
    var $currentDelayMap$$ = $delayMap$$.delay;
    $delayMap$$ = $delayMap$$.$pixels$;
    $pixelList$$[$currentDelayMap$$] || ($pixelList$$[$currentDelayMap$$] = []);
    $pixelList$$[$currentDelayMap$$] = $pixelList$$[$currentDelayMap$$].concat($delayMap$$);
    return $pixelList$$;
  }, {});
  return Object.keys($delayMap$$).map(function($pixelList$$) {
    return {delay:Number($pixelList$$), $pixels$:$delayMap$$[$pixelList$$]};
  });
}, $pixelDrop$$module$extensions$amp_addthis$0_1$addthis_utils$pixel$$ = function($ampPixel_url$jscomp$152$$, $ampDoc$jscomp$6_doc$jscomp$78$$) {
  $ampDoc$jscomp$6_doc$jscomp$78$$ = $ampDoc$jscomp$6_doc$jscomp$78$$.$win$.document;
  $ampPixel_url$jscomp$152$$ = _.$createElementWithAttributes$$module$src$dom$$($ampDoc$jscomp$6_doc$jscomp$78$$, "amp-pixel", _.$dict$$module$src$utils$object$$({layout:"nodisplay", referrerpolicy:"no-referrer", src:$ampPixel_url$jscomp$152$$}));
  $ampDoc$jscomp$6_doc$jscomp$78$$.body.appendChild($ampPixel_url$jscomp$152$$);
}, $dropPixelGroups$$module$extensions$amp_addthis$0_1$addthis_utils$pixel$$ = function($pixels$jscomp$2$$, $options$jscomp$27$$) {
  var $sid$$ = $options$jscomp$27$$.$sid$, $ampDoc$jscomp$9$$ = $options$jscomp$27$$.$ampDoc$;
  $groupPixelsByTime$$module$extensions$amp_addthis$0_1$addthis_utils$pixel$$($pixels$jscomp$2$$).forEach(function($pixels$jscomp$2$$) {
    var $options$jscomp$27$$ = $pixels$jscomp$2$$.delay, $$jscomp$destructuring$var257$$ = $pixels$jscomp$2$$.$pixels$;
    (0,window.setTimeout)(function() {
      var $pixels$jscomp$2$$ = $$jscomp$destructuring$var257$$.map(function($pixels$jscomp$2$$) {
        var $options$jscomp$27$$ = $pixels$jscomp$2$$.url, $sid$$ = $RE_IFRAME$$module$extensions$amp_addthis$0_1$addthis_utils$pixel$$.test($options$jscomp$27$$);
        if (-1 !== $options$jscomp$27$$.indexOf("//")) {
          if ($sid$$) {
            var $$jscomp$destructuring$var257$$ = _.$parseUrlDeprecated$$module$src$url$$($options$jscomp$27$$).host.split(".").concat("pxltr frame".replace(/\s/, "_"));
            $sid$$ = $ampDoc$jscomp$9$$.$win$.document;
            $options$jscomp$27$$ = _.$createElementWithAttributes$$module$src$dom$$($sid$$, "iframe", _.$dict$$module$src$utils$object$$({frameborder:0, width:0, height:0, name:$$jscomp$destructuring$var257$$, title:"Pxltr Frame", src:$options$jscomp$27$$}));
            _.$toggle$$module$src$style$$($options$jscomp$27$$, !1);
            _.$setStyles$$module$src$style$$($options$jscomp$27$$, {position:"absolute", clip:"rect(0px 0px 0px 0px)"});
            $sid$$.body.appendChild($options$jscomp$27$$);
          } else {
            $pixelDrop$$module$extensions$amp_addthis$0_1$addthis_utils$pixel$$($options$jscomp$27$$, $ampDoc$jscomp$9$$);
          }
        }
        return $pixels$jscomp$2$$.id;
      });
      $pixels$jscomp$2$$ = _.$addParamsToUrl$$module$src$url$$("https://m.addthisedge.com/live/prender", _.$dict$$module$src$utils$object$$({delay:"" + $options$jscomp$27$$, ids:$pixels$jscomp$2$$.join("-"), sid:$sid$$}));
      $ampDoc$jscomp$9$$.$win$.navigator.sendBeacon ? $ampDoc$jscomp$9$$.$win$.navigator.sendBeacon($pixels$jscomp$2$$, "{}") : $pixelDrop$$module$extensions$amp_addthis$0_1$addthis_utils$pixel$$($pixels$jscomp$2$$, $ampDoc$jscomp$9$$);
    }, 1000 * $options$jscomp$27$$);
  });
}, $getJsonObject_$$module$extensions$amp_addthis$0_1$addthis_utils$pixel$$ = function($object$jscomp$7_stringifiedObject$$) {
  var $params$jscomp$17$$ = {};
  if (void 0 === $object$jscomp$7_stringifiedObject$$ || null === $object$jscomp$7_stringifiedObject$$) {
    return $params$jscomp$17$$;
  }
  $object$jscomp$7_stringifiedObject$$ = "string" === typeof $object$jscomp$7_stringifiedObject$$ ? $object$jscomp$7_stringifiedObject$$ : JSON.stringify($object$jscomp$7_stringifiedObject$$);
  try {
    var $parsedObject$$ = _.$parseJson$$module$src$json$$($object$jscomp$7_stringifiedObject$$);
    if (_.$isObject$$module$src$types$$($parsedObject$$)) {
      for (var $key$jscomp$87$$ in $parsedObject$$) {
        $params$jscomp$17$$[$key$jscomp$87$$] = $parsedObject$$[$key$jscomp$87$$];
      }
    }
  } catch ($error$jscomp$54$$) {
  }
  return $params$jscomp$17$$;
}, $callPixelEndpoint$$module$extensions$amp_addthis$0_1$addthis_utils$pixel$$ = function($event$jscomp$70_url$jscomp$157$$) {
  var $ampDoc$jscomp$10$$ = $event$jscomp$70_url$jscomp$157$$.$ampDoc$, $endpoint$$ = $event$jscomp$70_url$jscomp$157$$.endpoint, $eventData$$ = $getJsonObject_$$module$extensions$amp_addthis$0_1$addthis_utils$pixel$$($event$jscomp$70_url$jscomp$157$$.data);
  $event$jscomp$70_url$jscomp$157$$ = _.$addParamsToUrl$$module$src$url$$($endpoint$$, $eventData$$);
  _.$JSCompiler_StaticMethods_fetchJson$$(_.$Services$$module$src$services$xhrFor$$($ampDoc$jscomp$10$$.$win$), $event$jscomp$70_url$jscomp$157$$, {mode:"cors", method:"GET", ampCors:!1, credentials:"include"}).then(function($event$jscomp$70_url$jscomp$157$$) {
    return $event$jscomp$70_url$jscomp$157$$.json();
  }).then(function($event$jscomp$70_url$jscomp$157$$) {
    $event$jscomp$70_url$jscomp$157$$ = void 0 === $event$jscomp$70_url$jscomp$157$$.$pixels$ ? [] : $event$jscomp$70_url$jscomp$157$$.$pixels$;
    0 < $event$jscomp$70_url$jscomp$157$$.length && $dropPixelGroups$$module$extensions$amp_addthis$0_1$addthis_utils$pixel$$($event$jscomp$70_url$jscomp$157$$, {$sid$:$eventData$$.sid, $ampDoc$:$ampDoc$jscomp$10$$});
  });
}, $getDateFromCuid$$module$extensions$amp_addthis$0_1$addthis_utils$cuid$$ = function($cuid$$) {
  var $date$jscomp$2$$ = new Date;
  try {
    $date$jscomp$2$$ = new Date(1000 * (0,window.parseInt)($cuid$$.substr(0, 8), 16));
  } catch ($e$213$$) {
  }
  return $date$jscomp$2$$;
}, $isCuidInFuture$$module$extensions$amp_addthis$0_1$addthis_utils$cuid$$ = function($cuid$jscomp$1_date$jscomp$3$$) {
  $cuid$jscomp$1_date$jscomp$3$$ = $getDateFromCuid$$module$extensions$amp_addthis$0_1$addthis_utils$cuid$$($cuid$jscomp$1_date$jscomp$3$$);
  $cuid$jscomp$1_date$jscomp$3$$.setDate($cuid$jscomp$1_date$jscomp$3$$.getDate() - 1);
  return $isDateInFuture$$module$extensions$amp_addthis$0_1$addthis_utils$cuid$$($cuid$jscomp$1_date$jscomp$3$$);
}, $isDateInFuture$$module$extensions$amp_addthis$0_1$addthis_utils$cuid$$ = function($date$jscomp$4$$) {
  var $now$jscomp$24$$ = new Date;
  if ($date$jscomp$4$$.getFullYear() < $now$jscomp$24$$.getFullYear()) {
    return !1;
  }
  var $yearIsSame$$ = $date$jscomp$4$$.getFullYear() === $now$jscomp$24$$.getFullYear(), $monthIsLater$$ = $date$jscomp$4$$.getMonth() > $now$jscomp$24$$.getMonth(), $monthIsSame$$ = $date$jscomp$4$$.getMonth() === $now$jscomp$24$$.getMonth(), $dateIsLater$$ = $date$jscomp$4$$.getDate() > $now$jscomp$24$$.getDate();
  return $date$jscomp$4$$.getFullYear() > $now$jscomp$24$$.getFullYear() || $yearIsSame$$ && $monthIsLater$$ || $yearIsSame$$ && $monthIsSame$$ && $dateIsLater$$;
}, $ScrollMonitor$$module$extensions$amp_addthis$0_1$addthis_utils$monitors$scroll_monitor$$ = function() {
  this.$viewport_$ = null;
  this.$F$ = this.$D$ = this.$G$ = 0;
}, $ClickMonitor$$module$extensions$amp_addthis$0_1$addthis_utils$monitors$click_monitor$$ = function() {
  this.$F$ = {};
  this.$I$ = 0;
  this.$D$ = this.$G$ = null;
}, $JSCompiler_StaticMethods_getIframeClickString$$ = function($JSCompiler_StaticMethods_getIframeClickString$self$$) {
  return Object.keys($JSCompiler_StaticMethods_getIframeClickString$self$$.$F$).map(function($key$jscomp$88$$) {
    return $key$jscomp$88$$ + "|" + $JSCompiler_StaticMethods_getIframeClickString$self$$.$F$[$key$jscomp$88$$];
  }).join(",");
}, $DwellMonitor$$module$extensions$amp_addthis$0_1$addthis_utils$monitors$dwell_monitor$$ = function() {
  this.$D$ = 0;
  this.$viewer_$ = null;
}, $getDetailsForMeta$$module$extensions$amp_addthis$0_1$addthis_utils$meta$$ = function($meta$jscomp$7$$) {
  return {name:($meta$jscomp$7$$.getAttribute("property") || $meta$jscomp$7$$.name || "").toLowerCase(), content:$meta$jscomp$7$$.content || ""};
}, $rot13$$module$extensions$amp_addthis$0_1$addthis_utils$rot13$$ = function($input$jscomp$35$$) {
  return $input$jscomp$35$$.replace($RE_ALPHA$$module$extensions$amp_addthis$0_1$constants$$, function($input$jscomp$35$$) {
    $input$jscomp$35$$ = $input$jscomp$35$$.charCodeAt(0);
    return String.fromCharCode((90 >= $input$jscomp$35$$ ? 90 : 122) >= $input$jscomp$35$$ + 13 ? $input$jscomp$35$$ + 13 : $input$jscomp$35$$ - 13);
  });
}, $rot13Array$$module$extensions$amp_addthis$0_1$addthis_utils$rot13$$ = function($input$jscomp$36$$) {
  return $input$jscomp$36$$.reduce(function($input$jscomp$36$$, $str$jscomp$19$$) {
    $input$jscomp$36$$[$rot13$$module$extensions$amp_addthis$0_1$addthis_utils$rot13$$($str$jscomp$19$$)] = 1;
    return $input$jscomp$36$$;
  }, {});
}, $classifyString$$module$extensions$amp_addthis$0_1$addthis_utils$classify$$ = function($keywordString_keywords$$, $nonStrictMatch$$) {
  $nonStrictMatch$$ = void 0 === $nonStrictMatch$$ ? !1 : $nonStrictMatch$$;
  var $classification$$ = 0;
  $keywordString_keywords$$ = (void 0 === $keywordString_keywords$$ ? "" : $keywordString_keywords$$).toLowerCase().split($RE_NONALPHA$$module$extensions$amp_addthis$0_1$constants$$);
  for (var $i$jscomp$192$$ = 0; $i$jscomp$192$$ < $keywordString_keywords$$.length; $i$jscomp$192$$++) {
    var $keyword$$ = $keywordString_keywords$$[$i$jscomp$192$$];
    if ($pornHash$$module$extensions$amp_addthis$0_1$addthis_utils$classify$$[$keyword$$] || !$nonStrictMatch$$ && $strictPornHash$$module$extensions$amp_addthis$0_1$addthis_utils$classify$$[$keyword$$]) {
      $classification$$ |= 1;
      break;
    }
  }
  return $classification$$;
}, $classifyPage$$module$extensions$amp_addthis$0_1$addthis_utils$classify$$ = function($pageInfo$$, $metaElements$$) {
  var $bitmask$$ = $classifyString$$module$extensions$amp_addthis$0_1$addthis_utils$classify$$($pageInfo$$.title) | $classifyString$$module$extensions$amp_addthis$0_1$addthis_utils$classify$$($pageInfo$$.hostname, !0);
  $metaElements$$.forEach(function($pageInfo$$) {
    var $metaElements$$ = $getDetailsForMeta$$module$extensions$amp_addthis$0_1$addthis_utils$meta$$($pageInfo$$);
    $pageInfo$$ = $metaElements$$.name;
    $metaElements$$ = $metaElements$$.content;
    if ("description" === $pageInfo$$ || "keywords" === $pageInfo$$) {
      $bitmask$$ |= $classifyString$$module$extensions$amp_addthis$0_1$addthis_utils$classify$$($metaElements$$);
    }
    if ("rating" === $pageInfo$$) {
      $pageInfo$$ = $bitmask$$;
      var $JSCompiler_temp_const$jscomp$629_metaElement_name$jscomp$189$$ = 0;
      $metaElements$$ = (void 0 === $metaElements$$ ? "" : $metaElements$$).toLowerCase().replace($RE_WHITESPACE$$module$extensions$amp_addthis$0_1$constants$$, "");
      if ("mature" === $metaElements$$ || "adult" === $metaElements$$ || "rta-5042-1996-1400-1577-rta" === $metaElements$$) {
        $JSCompiler_temp_const$jscomp$629_metaElement_name$jscomp$189$$ |= 1;
      }
      $bitmask$$ = $pageInfo$$ | $JSCompiler_temp_const$jscomp$629_metaElement_name$jscomp$189$$;
    }
  });
  return $bitmask$$;
}, $classifyReferrer$$module$extensions$amp_addthis$0_1$addthis_utils$classify$$ = function($JSCompiler_temp$jscomp$5611_lowerUrl$jscomp$inline_2377_referrerString$$, $JSCompiler_inline_result$jscomp$5612_parsedReferrer_terms$jscomp$inline_5958_url$jscomp$inline_2376$$, $matches$jscomp$inline_5959_parsedHref$$) {
  var $bitmask$jscomp$1$$ = 0;
  if ($JSCompiler_temp$jscomp$5611_lowerUrl$jscomp$inline_2377_referrerString$$ && $JSCompiler_inline_result$jscomp$5612_parsedReferrer_terms$jscomp$inline_5958_url$jscomp$inline_2376$$) {
    $bitmask$jscomp$1$$ = $JSCompiler_inline_result$jscomp$5612_parsedReferrer_terms$jscomp$inline_5958_url$jscomp$inline_2376$$.host === $matches$jscomp$inline_5959_parsedHref$$.host ? $bitmask$jscomp$1$$ | 2 : $bitmask$jscomp$1$$ | 4;
    $JSCompiler_inline_result$jscomp$5612_parsedReferrer_terms$jscomp$inline_5958_url$jscomp$inline_2376$$ = $JSCompiler_temp$jscomp$5611_lowerUrl$jscomp$inline_2377_referrerString$$;
    $JSCompiler_inline_result$jscomp$5612_parsedReferrer_terms$jscomp$inline_5958_url$jscomp$inline_2376$$ = void 0 === $JSCompiler_inline_result$jscomp$5612_parsedReferrer_terms$jscomp$inline_5958_url$jscomp$inline_2376$$ ? "" : $JSCompiler_inline_result$jscomp$5612_parsedReferrer_terms$jscomp$inline_5958_url$jscomp$inline_2376$$;
    $JSCompiler_temp$jscomp$5611_lowerUrl$jscomp$inline_2377_referrerString$$ = $JSCompiler_inline_result$jscomp$5612_parsedReferrer_terms$jscomp$inline_5958_url$jscomp$inline_2376$$.toLowerCase();
    if ($JSCompiler_temp$jscomp$5611_lowerUrl$jscomp$inline_2377_referrerString$$.match($RE_SEARCH_REFERRER$$module$extensions$amp_addthis$0_1$addthis_utils$classify$$)) {
      $JSCompiler_temp$jscomp$5611_lowerUrl$jscomp$inline_2377_referrerString$$ = !0;
    } else {
      a: {
        $JSCompiler_inline_result$jscomp$5612_parsedReferrer_terms$jscomp$inline_5958_url$jscomp$inline_2376$$ = $JSCompiler_inline_result$jscomp$5612_parsedReferrer_terms$jscomp$inline_5958_url$jscomp$inline_2376$$.split("?").pop().toLowerCase().split("&");
        for (var $i$jscomp$inline_5960$$ = 0; $i$jscomp$inline_5960$$ < $JSCompiler_inline_result$jscomp$5612_parsedReferrer_terms$jscomp$inline_5958_url$jscomp$inline_2376$$.length; $i$jscomp$inline_5960$$++) {
          if ($matches$jscomp$inline_5959_parsedHref$$ = $RE_SEARCH_TERMS$$module$extensions$amp_addthis$0_1$addthis_utils$classify$$.exec($JSCompiler_inline_result$jscomp$5612_parsedReferrer_terms$jscomp$inline_5958_url$jscomp$inline_2376$$[$i$jscomp$inline_5960$$])) {
            $JSCompiler_inline_result$jscomp$5612_parsedReferrer_terms$jscomp$inline_5958_url$jscomp$inline_2376$$ = $matches$jscomp$inline_5959_parsedHref$$[1];
            break a;
          }
        }
        $JSCompiler_inline_result$jscomp$5612_parsedReferrer_terms$jscomp$inline_5958_url$jscomp$inline_2376$$ = void 0;
      }
      $JSCompiler_temp$jscomp$5611_lowerUrl$jscomp$inline_2377_referrerString$$ = void 0 === $JSCompiler_inline_result$jscomp$5612_parsedReferrer_terms$jscomp$inline_5958_url$jscomp$inline_2376$$ ? !1 : -1 === $JSCompiler_temp$jscomp$5611_lowerUrl$jscomp$inline_2377_referrerString$$.indexOf("addthis") && ($RE_SEARCH_GOOGLE$$module$extensions$amp_addthis$0_1$addthis_utils$classify$$.test($JSCompiler_temp$jscomp$5611_lowerUrl$jscomp$inline_2377_referrerString$$) || $RE_SEARCH_AOL$$module$extensions$amp_addthis$0_1$addthis_utils$classify$$.test($JSCompiler_temp$jscomp$5611_lowerUrl$jscomp$inline_2377_referrerString$$) || 
      -1 < $JSCompiler_temp$jscomp$5611_lowerUrl$jscomp$inline_2377_referrerString$$.indexOf("/pagead/aclk?") || -1 < $JSCompiler_temp$jscomp$5611_lowerUrl$jscomp$inline_2377_referrerString$$.indexOf(".com/url") || -1 < $JSCompiler_temp$jscomp$5611_lowerUrl$jscomp$inline_2377_referrerString$$.indexOf(".com/l.php") || -1 < $JSCompiler_temp$jscomp$5611_lowerUrl$jscomp$inline_2377_referrerString$$.indexOf("/search?") || -1 < $JSCompiler_temp$jscomp$5611_lowerUrl$jscomp$inline_2377_referrerString$$.indexOf("/search/?") || 
      -1 < $JSCompiler_temp$jscomp$5611_lowerUrl$jscomp$inline_2377_referrerString$$.indexOf("search?") || -1 < $JSCompiler_temp$jscomp$5611_lowerUrl$jscomp$inline_2377_referrerString$$.indexOf("yandex.ru/clck/jsredir?") || -1 < $JSCompiler_temp$jscomp$5611_lowerUrl$jscomp$inline_2377_referrerString$$.indexOf(".com/search") || -1 < $JSCompiler_temp$jscomp$5611_lowerUrl$jscomp$inline_2377_referrerString$$.indexOf(".org/search") || -1 < $JSCompiler_temp$jscomp$5611_lowerUrl$jscomp$inline_2377_referrerString$$.indexOf("/search.html?") || 
      -1 < $JSCompiler_temp$jscomp$5611_lowerUrl$jscomp$inline_2377_referrerString$$.indexOf("search/results.") || -1 < $JSCompiler_temp$jscomp$5611_lowerUrl$jscomp$inline_2377_referrerString$$.indexOf(".com/s?bs") || -1 < $JSCompiler_temp$jscomp$5611_lowerUrl$jscomp$inline_2377_referrerString$$.indexOf(".com/s?wd") || -1 < $JSCompiler_temp$jscomp$5611_lowerUrl$jscomp$inline_2377_referrerString$$.indexOf(".com/mb?search") || -1 < $JSCompiler_temp$jscomp$5611_lowerUrl$jscomp$inline_2377_referrerString$$.indexOf(".com/mvc/search") || 
      -1 < $JSCompiler_temp$jscomp$5611_lowerUrl$jscomp$inline_2377_referrerString$$.indexOf(".com/web") || -1 < $JSCompiler_temp$jscomp$5611_lowerUrl$jscomp$inline_2377_referrerString$$.indexOf("hotbot.com/"));
    }
    $JSCompiler_temp$jscomp$5611_lowerUrl$jscomp$inline_2377_referrerString$$ && ($bitmask$jscomp$1$$ |= 1);
  }
  return $bitmask$jscomp$1$$;
}, $isProductPage$$module$extensions$amp_addthis$0_1$addthis_utils$classify$$ = function($doc$jscomp$81$$, $metaElements$jscomp$1$$) {
  return $doc$jscomp$81$$.getElementById("product") || 0 < ($doc$jscomp$81$$.getElementsByClassName("product") || []).length || $doc$jscomp$81$$.getElementById("productDescription") || $doc$jscomp$81$$.getElementById("page-product") || $doc$jscomp$81$$.getElementById("vm_cart_products") || window.Virtuemart ? !0 : "product" === $metaElements$jscomp$1$$.reduce(function($doc$jscomp$81$$, $metaElements$jscomp$1$$) {
    var $tags$jscomp$4$$ = $getDetailsForMeta$$module$extensions$amp_addthis$0_1$addthis_utils$meta$$($metaElements$jscomp$1$$);
    $metaElements$jscomp$1$$ = $tags$jscomp$4$$.name;
    $tags$jscomp$4$$ = $tags$jscomp$4$$.content;
    _.$startsWith$$module$src$string$$($metaElements$jscomp$1$$, "og:") && ($metaElements$jscomp$1$$ = $metaElements$jscomp$1$$.split(":").pop(), $doc$jscomp$81$$[$metaElements$jscomp$1$$] = $tags$jscomp$4$$);
    return $doc$jscomp$81$$;
  }, {}).type;
}, $getKeywordsString$$module$extensions$amp_addthis$0_1$addthis_utils$classify$$ = function($metaElements$jscomp$2$$) {
  return $metaElements$jscomp$2$$.filter(function($metaElements$jscomp$2$$) {
    return "keywords" === $getDetailsForMeta$$module$extensions$amp_addthis$0_1$addthis_utils$meta$$($metaElements$jscomp$2$$).name.toLowerCase();
  }).map(function($metaElements$jscomp$2$$) {
    var $contentSplit$jscomp$inline_2381_meta$jscomp$9$$ = [];
    $metaElements$jscomp$2$$ = $getDetailsForMeta$$module$extensions$amp_addthis$0_1$addthis_utils$meta$$($metaElements$jscomp$2$$).content.split(",");
    for (var $keywordsSize$jscomp$inline_2382$$ = 0, $i$jscomp$inline_2383$$ = 0; $i$jscomp$inline_2383$$ < $metaElements$jscomp$2$$.length; $i$jscomp$inline_2383$$++) {
      var $keyword$jscomp$inline_2384$$ = ($metaElements$jscomp$2$$[$i$jscomp$inline_2383$$] || "").trim();
      if ($keyword$jscomp$inline_2384$$) {
        if (200 <= $keyword$jscomp$inline_2384$$.length + $keywordsSize$jscomp$inline_2382$$ + 1) {
          break;
        }
        $contentSplit$jscomp$inline_2381_meta$jscomp$9$$.push($keyword$jscomp$inline_2384$$);
        $keywordsSize$jscomp$inline_2382$$ += $keyword$jscomp$inline_2384$$.length + 1;
      }
    }
    return $contentSplit$jscomp$inline_2381_meta$jscomp$9$$;
  }).reduce(function($metaElements$jscomp$2$$, $subKeywords$$) {
    return $metaElements$jscomp$2$$.concat($subKeywords$$);
  }, []).join(",");
}, $getModernFragment$$module$extensions$amp_addthis$0_1$addthis_utils$fragment$$ = function($frag$jscomp$1_url$jscomp$161$$) {
  $frag$jscomp$1_url$jscomp$161$$ = $frag$jscomp$1_url$jscomp$161$$.split("#").pop();
  $frag$jscomp$1_url$jscomp$161$$ = $frag$jscomp$1_url$jscomp$161$$.split(";").shift();
  if ($RE_ADDTHIS_FRAGMENT$$module$extensions$amp_addthis$0_1$addthis_utils$fragment$$.test($frag$jscomp$1_url$jscomp$161$$)) {
    return $frag$jscomp$1_url$jscomp$161$$;
  }
}, $ConfigManager$$module$extensions$amp_addthis$0_1$config_manager$$ = function() {
  this.$D$ = {};
  this.$F$ = [];
  this.$G$ = null;
}, $JSCompiler_StaticMethods_sendConfiguration_$$ = function($JSCompiler_StaticMethods_sendConfiguration_$self$$, $jsonToSend_param1$jscomp$1$$) {
  var $iframe$jscomp$31$$ = $jsonToSend_param1$jscomp$1$$.iframe, $JSCompiler_StaticMethods_record$self$jscomp$inline_2386_pubId$jscomp$4$$ = $jsonToSend_param1$jscomp$1$$.$pubId$, $pubData$jscomp$1$$ = $JSCompiler_StaticMethods_sendConfiguration_$self$$.$D$[$JSCompiler_StaticMethods_record$self$jscomp$inline_2386_pubId$jscomp$4$$], $dashboardConfig_pco$jscomp$inline_2388_widget$jscomp$inline_2387$$ = $pubData$jscomp$1$$.config, $configRequestStatus$$ = $pubData$jscomp$1$$.$requestStatus$;
  $jsonToSend_param1$jscomp$1$$ = _.$dict$$module$src$utils$object$$({event:"addthis.amp.configuration", shareConfig:$jsonToSend_param1$jscomp$1$$.$shareConfig$, atConfig:$jsonToSend_param1$jscomp$1$$.$atConfig$, pubId:$JSCompiler_StaticMethods_record$self$jscomp$inline_2386_pubId$jscomp$4$$, widgetId:$jsonToSend_param1$jscomp$1$$.$widgetId$, configRequestStatus:$configRequestStatus$$, dashboardConfig:$dashboardConfig_pco$jscomp$inline_2388_widget$jscomp$inline_2387$$});
  $dashboardConfig_pco$jscomp$inline_2388_widget$jscomp$inline_2387$$ && $dashboardConfig_pco$jscomp$inline_2388_widget$jscomp$inline_2387$$.widgets && 0 < Object.keys($dashboardConfig_pco$jscomp$inline_2388_widget$jscomp$inline_2387$$.widgets).length && ($JSCompiler_StaticMethods_record$self$jscomp$inline_2386_pubId$jscomp$4$$ = $JSCompiler_StaticMethods_sendConfiguration_$self$$.$G$, $dashboardConfig_pco$jscomp$inline_2388_widget$jscomp$inline_2387$$ = {$widget$:$dashboardConfig_pco$jscomp$inline_2388_widget$jscomp$inline_2387$$}, 
  $dashboardConfig_pco$jscomp$inline_2388_widget$jscomp$inline_2387$$ = $dashboardConfig_pco$jscomp$inline_2388_widget$jscomp$inline_2387$$.$widget$, ($dashboardConfig_pco$jscomp$inline_2388_widget$jscomp$inline_2387$$ = ($dashboardConfig_pco$jscomp$inline_2388_widget$jscomp$inline_2387$$.id || $dashboardConfig_pco$jscomp$inline_2388_widget$jscomp$inline_2387$$.$pco$ || "").replace($RE_NUMDASH$$module$extensions$amp_addthis$0_1$addthis_utils$monitors$active_tools_monitor$$, "")) && !$JSCompiler_StaticMethods_record$self$jscomp$inline_2386_pubId$jscomp$4$$.$D$[$dashboardConfig_pco$jscomp$inline_2388_widget$jscomp$inline_2387$$] && 
  $RE_ALPHA$$module$extensions$amp_addthis$0_1$constants$$.test($dashboardConfig_pco$jscomp$inline_2388_widget$jscomp$inline_2387$$) && ($JSCompiler_StaticMethods_record$self$jscomp$inline_2386_pubId$jscomp$4$$.$D$[$dashboardConfig_pco$jscomp$inline_2388_widget$jscomp$inline_2387$$] = $dashboardConfig_pco$jscomp$inline_2388_widget$jscomp$inline_2387$$));
  $iframe$jscomp$31$$.contentWindow.postMessage(JSON.stringify($jsonToSend_param1$jscomp$1$$), "https://s7.addthis.com");
  0 === $configRequestStatus$$ && ($JSCompiler_StaticMethods_sendConfiguration_$self$$.$F$.push($iframe$jscomp$31$$), $pubData$jscomp$1$$.$requestStatus$ = 1);
}, $JSCompiler_StaticMethods_ConfigManager$$module$extensions$amp_addthis$0_1$config_manager_prototype$unregister$$ = function($param$jscomp$11_pubData$jscomp$3$$) {
  var $JSCompiler_StaticMethods_ConfigManager$$module$extensions$amp_addthis$0_1$config_manager_prototype$unregister$self$$ = $configManager$$module$extensions$amp_addthis$0_1$amp_addthis$$, $pubId$jscomp$6$$ = $param$jscomp$11_pubData$jscomp$3$$.$pubId$, $iframe$jscomp$33$$ = $param$jscomp$11_pubData$jscomp$3$$.iframe;
  $JSCompiler_StaticMethods_ConfigManager$$module$extensions$amp_addthis$0_1$config_manager_prototype$unregister$self$$.$F$ = $JSCompiler_StaticMethods_ConfigManager$$module$extensions$amp_addthis$0_1$config_manager_prototype$unregister$self$$.$F$.filter(function($param$jscomp$11_pubData$jscomp$3$$) {
    return $param$jscomp$11_pubData$jscomp$3$$ !== $iframe$jscomp$33$$;
  });
  $param$jscomp$11_pubData$jscomp$3$$ = $JSCompiler_StaticMethods_ConfigManager$$module$extensions$amp_addthis$0_1$config_manager_prototype$unregister$self$$.$D$[$pubId$jscomp$6$$] || {};
  $param$jscomp$11_pubData$jscomp$3$$.$iframeData$ && ($param$jscomp$11_pubData$jscomp$3$$.$iframeData$ = $param$jscomp$11_pubData$jscomp$3$$.$iframeData$.filter(function($param$jscomp$11_pubData$jscomp$3$$) {
    return $param$jscomp$11_pubData$jscomp$3$$.iframe !== $iframe$jscomp$33$$;
  }));
}, $PostMessageDispatcher$$module$extensions$amp_addthis$0_1$post_message_dispatcher$$ = function() {
  this.$D$ = {};
}, $JSCompiler_StaticMethods_PostMessageDispatcher$$module$extensions$amp_addthis$0_1$post_message_dispatcher_prototype$emit_$$ = function($JSCompiler_StaticMethods_PostMessageDispatcher$$module$extensions$amp_addthis$0_1$post_message_dispatcher_prototype$emit_$self$$, $eventType$jscomp$31$$, $eventData$jscomp$1$$) {
  $JSCompiler_StaticMethods_PostMessageDispatcher$$module$extensions$amp_addthis$0_1$post_message_dispatcher_prototype$emit_$self$$.$D$[$eventType$jscomp$31$$] && $JSCompiler_StaticMethods_PostMessageDispatcher$$module$extensions$amp_addthis$0_1$post_message_dispatcher_prototype$emit_$self$$.$D$[$eventType$jscomp$31$$].forEach(function($JSCompiler_StaticMethods_PostMessageDispatcher$$module$extensions$amp_addthis$0_1$post_message_dispatcher_prototype$emit_$self$$) {
    return $JSCompiler_StaticMethods_PostMessageDispatcher$$module$extensions$amp_addthis$0_1$post_message_dispatcher_prototype$emit_$self$$($eventData$jscomp$1$$);
  });
}, $AmpAddThis$$module$extensions$amp_addthis$0_1$amp_addthis$$ = function($$jscomp$super$this$jscomp$14_element$jscomp$303$$) {
  $$jscomp$super$this$jscomp$14_element$jscomp$303$$ = window.AMP.BaseElement.call(this, $$jscomp$super$this$jscomp$14_element$jscomp$303$$) || this;
  $$jscomp$super$this$jscomp$14_element$jscomp$303$$.$iframe_$ = null;
  $$jscomp$super$this$jscomp$14_element$jscomp$303$$.$pubId_$ = "";
  $$jscomp$super$this$jscomp$14_element$jscomp$303$$.$widgetId_$ = "";
  $$jscomp$super$this$jscomp$14_element$jscomp$303$$.$canonicalUrl_$ = "";
  $$jscomp$super$this$jscomp$14_element$jscomp$303$$.$canonicalTitle_$ = "";
  $$jscomp$super$this$jscomp$14_element$jscomp$303$$.$referrer_$ = "";
  $$jscomp$super$this$jscomp$14_element$jscomp$303$$.$shareConfig_$ = null;
  $$jscomp$super$this$jscomp$14_element$jscomp$303$$.$atConfig_$ = null;
  $$jscomp$super$this$jscomp$14_element$jscomp$303$$.$widgetType_$ = "";
  return $$jscomp$super$this$jscomp$14_element$jscomp$303$$;
}, $JSCompiler_StaticMethods_getShareConfigAsJsonObject_$$ = function($JSCompiler_StaticMethods_getShareConfigAsJsonObject_$self$$) {
  var $params$jscomp$19$$ = {};
  $SHARE_CONFIG_KEYS$$module$extensions$amp_addthis$0_1$constants$$.map(function($key$jscomp$89$$) {
    var $value$jscomp$168$$ = $JSCompiler_StaticMethods_getShareConfigAsJsonObject_$self$$.element.getAttribute("data-" + $key$jscomp$89$$);
    $value$jscomp$168$$ ? $params$jscomp$19$$[$key$jscomp$89$$] = $value$jscomp$168$$ : "url" === $key$jscomp$89$$ ? $params$jscomp$19$$[$key$jscomp$89$$] = $JSCompiler_StaticMethods_getShareConfigAsJsonObject_$self$$.$getAmpDoc$().$AmpDoc$$module$src$service$ampdoc_impl_prototype$getUrl$() : "title" === $key$jscomp$89$$ && ($params$jscomp$19$$[$key$jscomp$89$$] = $JSCompiler_StaticMethods_getShareConfigAsJsonObject_$self$$.$getAmpDoc$().$win$.document.title);
  });
  return $params$jscomp$19$$;
}, $JSCompiler_StaticMethods_getATConfig_$$ = function($JSCompiler_StaticMethods_getATConfig_$self$$, $ampDoc$jscomp$19$$) {
  return $AT_CONFIG_KEYS$$module$extensions$amp_addthis$0_1$constants$$.reduce(function($config$jscomp$27$$, $key$jscomp$90$$) {
    var $value$jscomp$169_win$jscomp$298$$ = $JSCompiler_StaticMethods_getATConfig_$self$$.element.getAttribute("data-" + $key$jscomp$90$$);
    $value$jscomp$169_win$jscomp$298$$ ? $config$jscomp$27$$[$key$jscomp$90$$] = $value$jscomp$169_win$jscomp$298$$ : ($value$jscomp$169_win$jscomp$298$$ = $ampDoc$jscomp$19$$.$win$, "ui_language" === $key$jscomp$90$$ && ($config$jscomp$27$$[$key$jscomp$90$$] = $value$jscomp$169_win$jscomp$298$$.document.documentElement.lang || $value$jscomp$169_win$jscomp$298$$.navigator.language || $value$jscomp$169_win$jscomp$298$$.navigator.$G$ || "en"));
    return $config$jscomp$27$$;
  }, {});
}, $JSCompiler_StaticMethods_AmpAddThis$$module$extensions$amp_addthis$0_1$amp_addthis_prototype$setupListeners_$$ = function($JSCompiler_StaticMethods_AmpAddThis$$module$extensions$amp_addthis$0_1$amp_addthis_prototype$setupListeners_$self$$, $input$jscomp$37_postMessageDispatcher$$) {
  var $ampDoc$jscomp$20$$ = $input$jscomp$37_postMessageDispatcher$$.$ampDoc$, $loc$jscomp$8$$ = $input$jscomp$37_postMessageDispatcher$$.$loc$, $pubId$jscomp$8$$ = $input$jscomp$37_postMessageDispatcher$$.$pubId$;
  _.$listen$$module$src$event_helper$$($ampDoc$jscomp$20$$.$win$, "pagehide", function() {
    var $JSCompiler_StaticMethods_AmpAddThis$$module$extensions$amp_addthis$0_1$amp_addthis_prototype$setupListeners_$self$$ = $loc$jscomp$8$$.host;
    var $input$jscomp$37_postMessageDispatcher$$ = $loc$jscomp$8$$.pathname;
    var $pmHandler$$ = $loc$jscomp$8$$.hash;
    var $JSCompiler_object_inline_ph_6646_viewport$jscomp$inline_5999$$ = _.$Services$$module$src$services$viewportForDoc$$($ampDoc$jscomp$20$$);
    var $JSCompiler_object_inline_al_6636_url$jscomp$inline_2408$$ = Object.keys($activeToolsMonitor$$module$extensions$amp_addthis$0_1$amp_addthis$$.$D$).join(",") || void 0;
    var $JSCompiler_object_inline_dt_6640$$ = $dwellMonitor$$module$extensions$amp_addthis$0_1$amp_addthis$$.$D$;
    $input$jscomp$37_postMessageDispatcher$$ = $input$jscomp$37_postMessageDispatcher$$.replace($pmHandler$$, "");
    $pmHandler$$ = $JSCompiler_StaticMethods_getIframeClickString$$($clickMonitor$$module$extensions$amp_addthis$0_1$amp_addthis$$);
    var $JSCompiler_object_inline_ivh_6643$$ = $scrollMonitor$$module$extensions$amp_addthis$0_1$amp_addthis$$.$G$;
    var $JSCompiler_object_inline_pct_6644$$ = $clickMonitor$$module$extensions$amp_addthis$0_1$amp_addthis$$.$I$;
    var $JSCompiler_object_inline_pfm_6645$$ = $ampDoc$jscomp$20$$.$win$.navigator.sendBeacon ? 0 : 1;
    $JSCompiler_object_inline_ph_6646_viewport$jscomp$inline_5999$$ = _.$JSCompiler_StaticMethods_getHeight$$($JSCompiler_object_inline_ph_6646_viewport$jscomp$inline_5999$$);
    $JSCompiler_object_inline_al_6636_url$jscomp$inline_2408$$ = _.$addParamsToUrl$$module$src$url$$("https://m.addthis.com/live/red_lojson/100eng.json", _.$dict$$module$src$utils$object$$({al:$JSCompiler_object_inline_al_6636_url$jscomp$inline_2408$$, amp:1, dc:1, dp:$JSCompiler_StaticMethods_AmpAddThis$$module$extensions$amp_addthis$0_1$amp_addthis_prototype$setupListeners_$self$$, dt:$JSCompiler_object_inline_dt_6640$$, fp:$input$jscomp$37_postMessageDispatcher$$, ict:$pmHandler$$, ivh:$JSCompiler_object_inline_ivh_6643$$, 
    pct:$JSCompiler_object_inline_pct_6644$$, pfm:$JSCompiler_object_inline_pfm_6645$$, ph:$JSCompiler_object_inline_ph_6646_viewport$jscomp$inline_5999$$, pub:$pubId$jscomp$8$$, sh:$scrollMonitor$$module$extensions$amp_addthis$0_1$amp_addthis$$.$getScrollHeight$(), sid:$JSCompiler_inline_result$jscomp$624$$}));
    $ampDoc$jscomp$20$$.$win$.navigator.sendBeacon ? $ampDoc$jscomp$20$$.$win$.navigator.sendBeacon($JSCompiler_object_inline_al_6636_url$jscomp$inline_2408$$, "{}") : $pixelDrop$$module$extensions$amp_addthis$0_1$addthis_utils$pixel$$($JSCompiler_object_inline_al_6636_url$jscomp$inline_2408$$, $ampDoc$jscomp$20$$);
  });
  $input$jscomp$37_postMessageDispatcher$$ = new $PostMessageDispatcher$$module$extensions$amp_addthis$0_1$post_message_dispatcher$$;
  var $pmHandler$$ = $input$jscomp$37_postMessageDispatcher$$.$F$.bind($input$jscomp$37_postMessageDispatcher$$);
  _.$internalListenImplementation$$module$src$event_helper_listen$$($ampDoc$jscomp$20$$.$win$, "message", $pmHandler$$, void 0);
  $input$jscomp$37_postMessageDispatcher$$.$on$("addthis.share", function($input$jscomp$37_postMessageDispatcher$$) {
    var $pmHandler$$ = $JSCompiler_StaticMethods_AmpAddThis$$module$extensions$amp_addthis$0_1$amp_addthis_prototype$setupListeners_$self$$.$referrer_$, $JSCompiler_inline_result$jscomp$5614_data$jscomp$106$$ = $JSCompiler_StaticMethods_AmpAddThis$$module$extensions$amp_addthis$0_1$amp_addthis_prototype$setupListeners_$self$$.$canonicalTitle_$, $href$jscomp$inline_6008_parsedReferrer$jscomp$inline_6016$$ = $loc$jscomp$8$$.href, $hostname$jscomp$inline_6009_metaElements$jscomp$inline_6017$$ = $loc$jscomp$8$$.hostname, 
    $search$jscomp$inline_6010$$ = $loc$jscomp$8$$.search, $pathname$jscomp$inline_6011$$ = $loc$jscomp$8$$.pathname, $hash$jscomp$inline_6012$$ = $loc$jscomp$8$$.hash, $protocol$jscomp$inline_6013$$ = $loc$jscomp$8$$.protocol, $port$jscomp$inline_6014$$ = $loc$jscomp$8$$.port;
    $JSCompiler_inline_result$jscomp$5614_data$jscomp$106$$ = {$du$:$href$jscomp$inline_6008_parsedReferrer$jscomp$inline_6016$$.split("#").shift(), hostname:$hostname$jscomp$inline_6009_metaElements$jscomp$inline_6017$$, href:$href$jscomp$inline_6008_parsedReferrer$jscomp$inline_6016$$, referrer:$pmHandler$$, search:$search$jscomp$inline_6010$$, pathname:$pathname$jscomp$inline_6011$$, title:$JSCompiler_inline_result$jscomp$5614_data$jscomp$106$$, hash:$hash$jscomp$inline_6012$$, protocol:$protocol$jscomp$inline_6013$$, 
    port:$port$jscomp$inline_6014$$};
    $href$jscomp$inline_6008_parsedReferrer$jscomp$inline_6016$$ = $pmHandler$$ ? _.$parseUrlDeprecated$$module$src$url$$($pmHandler$$) : {};
    $hostname$jscomp$inline_6009_metaElements$jscomp$inline_6017$$ = _.$toArray$$module$src$types$$($ampDoc$jscomp$20$$.$win$.document.head.querySelectorAll("meta"));
    $input$jscomp$37_postMessageDispatcher$$ = {amp:1, $cb$:$classifyPage$$module$extensions$amp_addthis$0_1$addthis_utils$classify$$($JSCompiler_inline_result$jscomp$5614_data$jscomp$106$$, $hostname$jscomp$inline_6009_metaElements$jscomp$inline_6017$$), $dc$:1, $dest$:$input$jscomp$37_postMessageDispatcher$$.$service$, $gen$:300, $mk$:$getKeywordsString$$module$extensions$amp_addthis$0_1$addthis_utils$classify$$($hostname$jscomp$inline_6009_metaElements$jscomp$inline_6017$$), $pub$:$pubId$jscomp$8$$, 
    $rb$:$classifyReferrer$$module$extensions$amp_addthis$0_1$addthis_utils$classify$$($pmHandler$$, $href$jscomp$inline_6008_parsedReferrer$jscomp$inline_6016$$, _.$parseUrlDeprecated$$module$src$url$$($JSCompiler_inline_result$jscomp$5614_data$jscomp$106$$.$du$)), $sid$:$JSCompiler_inline_result$jscomp$624$$, url:$input$jscomp$37_postMessageDispatcher$$.url};
    $callPixelEndpoint$$module$extensions$amp_addthis$0_1$addthis_utils$pixel$$({$ampDoc$:$ampDoc$jscomp$20$$, endpoint:"https://m.addthis.com/live/red_pjson", data:$input$jscomp$37_postMessageDispatcher$$});
  });
  $input$jscomp$37_postMessageDispatcher$$.$on$("addthis.amp.configuration", $configManager$$module$extensions$amp_addthis$0_1$amp_addthis$$.$I$.bind($configManager$$module$extensions$amp_addthis$0_1$amp_addthis$$));
}, $SHARE_CONFIG_KEYS$$module$extensions$amp_addthis$0_1$constants$$ = "url title media description email_template email_vars passthrough url_transforms".split(" "), $AT_CONFIG_KEYS$$module$extensions$amp_addthis$0_1$constants$$ = "services_exclude services_compact services_expanded services_custom ui_click ui_disable ui_delay ui_hover_direction ui_language ui_offset_top ui_offset_left ui_tabindex track_addressbar track_clickback ga_property ga_social".split(" "), $RE_ALPHA$$module$extensions$amp_addthis$0_1$constants$$ = 
/[A-Z]/gi, $RE_NONALPHA$$module$extensions$amp_addthis$0_1$constants$$ = /[^a-zA-Z]/g, $RE_WHITESPACE$$module$extensions$amp_addthis$0_1$constants$$ = /\s/g;
var $RE_IFRAME$$module$extensions$amp_addthis$0_1$addthis_utils$pixel$$ = /#iframe$/;
var $RE_CUID$$module$extensions$amp_addthis$0_1$addthis_utils$cuid$$ = /^[0-9a-f]{16}$/, $CUID_SESSION_TIME$$module$extensions$amp_addthis$0_1$addthis_utils$cuid$$ = Date.now();
var $JSCompiler_inline_result$jscomp$624$$, $suffix$jscomp$inline_2367$$ = "00000000" + Math.floor(4294967296 * Math.random()).toString(16).slice(-8);
$JSCompiler_inline_result$jscomp$624$$ = ($CUID_SESSION_TIME$$module$extensions$amp_addthis$0_1$addthis_utils$cuid$$ / 1000 & 4294967295).toString(16) + $suffix$jscomp$inline_2367$$;
$ScrollMonitor$$module$extensions$amp_addthis$0_1$addthis_utils$monitors$scroll_monitor$$.prototype.$I$ = function() {
  var $scrollTop$jscomp$13$$ = _.$JSCompiler_StaticMethods_Viewport$$module$src$service$viewport$viewport_impl_prototype$getScrollTop$$(this.$viewport_$) || 0;
  this.$D$ = Math.max(this.$D$, $scrollTop$jscomp$13$$);
  this.$F$ = Math.max(this.$F$, (_.$JSCompiler_StaticMethods_getHeight$$(this.$viewport_$) || 0) + $scrollTop$jscomp$13$$);
};
$ScrollMonitor$$module$extensions$amp_addthis$0_1$addthis_utils$monitors$scroll_monitor$$.prototype.$getScrollHeight$ = function() {
  return this.$F$ - this.$D$;
};
$ClickMonitor$$module$extensions$amp_addthis$0_1$addthis_utils$monitors$click_monitor$$.prototype.$J$ = function() {
  var $activeElement$$ = this.$D$.document.activeElement;
  if ($activeElement$$) {
    var $changeOccurred_trimSrc$jscomp$inline_2371$$ = $activeElement$$ !== this.$G$;
    "IFRAME" === $activeElement$$.tagName && $changeOccurred_trimSrc$jscomp$inline_2371$$ && ($changeOccurred_trimSrc$jscomp$inline_2371$$ = $activeElement$$.src.split("://").pop(), this.$F$[$changeOccurred_trimSrc$jscomp$inline_2371$$] ? this.$F$[$changeOccurred_trimSrc$jscomp$inline_2371$$]++ : this.$F$[$changeOccurred_trimSrc$jscomp$inline_2371$$] = 1);
    this.$G$ = $activeElement$$;
  }
};
$ClickMonitor$$module$extensions$amp_addthis$0_1$addthis_utils$monitors$click_monitor$$.prototype.$K$ = function() {
  this.$I$++;
  this.$G$ = this.$D$.document.activeElement;
};
$DwellMonitor$$module$extensions$amp_addthis$0_1$addthis_utils$monitors$dwell_monitor$$.prototype.$F$ = function() {
  _.$JSCompiler_StaticMethods_Viewer$$module$src$service$viewer_impl_prototype$isVisible$$(this.$viewer_$) || (this.$D$ += Date.now() - (this.$viewer_$.$ga$ || 0));
};
var $RE_NUMDASH$$module$extensions$amp_addthis$0_1$addthis_utils$monitors$active_tools_monitor$$ = /[0-9\-].*/;
var $RE_SEARCH_TERMS$$module$extensions$amp_addthis$0_1$addthis_utils$classify$$ = /^(?:q|search|bs|wd|p|kw|keyword|query|qry|querytext|text|searchcriteria|searchstring|searchtext|sp_q)=(.*)/i, $RE_SEARCH_REFERRER$$module$extensions$amp_addthis$0_1$addthis_utils$classify$$ = /ws\/results\/(web|images|video|news)/, $RE_SEARCH_GOOGLE$$module$extensions$amp_addthis$0_1$addthis_utils$classify$$ = /google.*\/(search|url|aclk|m\?)/, $RE_SEARCH_AOL$$module$extensions$amp_addthis$0_1$addthis_utils$classify$$ = 
/aol.*\/aol/, $pornHash$$module$extensions$amp_addthis$0_1$addthis_utils$classify$$ = $rot13Array$$module$extensions$amp_addthis$0_1$addthis_utils$rot13$$("cbea cbeab kkk zvys gvgf shpxf chfflyvcf pernzcvr svfgvat wvmm fcybbtr flovna".split(" ")), $strictPornHash$$module$extensions$amp_addthis$0_1$addthis_utils$classify$$ = $rot13Array$$module$extensions$amp_addthis$0_1$addthis_utils$rot13$$(["phz"]);
var $RE_ADDTHIS_FRAGMENT$$module$extensions$amp_addthis$0_1$addthis_utils$fragment$$ = /^\.[a-z0-9\-_]{11}(\.[a-z0-9_]+)?$/i;
var $nonTrackedDomainMatcher$$module$extensions$amp_addthis$0_1$addthis_utils$lojson$$ = /\.gov|\.mil/;
$ConfigManager$$module$extensions$amp_addthis$0_1$config_manager$$.prototype.$I$ = function($data$jscomp$103_pubData$$) {
  var $$jscomp$this$jscomp$364$$ = this, $config$jscomp$26$$ = $data$jscomp$103_pubData$$.config, $pubId$jscomp$3$$ = $data$jscomp$103_pubData$$.pubId, $source$jscomp$40$$ = $data$jscomp$103_pubData$$.source;
  this.$F$.some(function($data$jscomp$103_pubData$$) {
    return $data$jscomp$103_pubData$$.contentWindow === $source$jscomp$40$$;
  }) && ($data$jscomp$103_pubData$$ = this.$D$[$pubId$jscomp$3$$], $data$jscomp$103_pubData$$.config = $config$jscomp$26$$, $data$jscomp$103_pubData$$.$requestStatus$ = 2, $data$jscomp$103_pubData$$.$iframeData$.forEach(function($data$jscomp$103_pubData$$) {
    $JSCompiler_StaticMethods_sendConfiguration_$$($$jscomp$this$jscomp$364$$, {iframe:$data$jscomp$103_pubData$$.iframe, $widgetId$:$data$jscomp$103_pubData$$.$widgetId$, $pubId$:$pubId$jscomp$3$$, $shareConfig$:$data$jscomp$103_pubData$$.$shareConfig$, $atConfig$:$data$jscomp$103_pubData$$.$atConfig$});
  }));
};
$ConfigManager$$module$extensions$amp_addthis$0_1$config_manager$$.prototype.register = function($_$jscomp$2_activeToolsMonitor$jscomp$1_pubData$jscomp$2$$) {
  var $$jscomp$this$jscomp$365$$ = this, $pubId$jscomp$5$$ = $_$jscomp$2_activeToolsMonitor$jscomp$1_pubData$jscomp$2$$.$pubId$, $widgetId$jscomp$2$$ = $_$jscomp$2_activeToolsMonitor$jscomp$1_pubData$jscomp$2$$.$widgetId$, $iframe$jscomp$32$$ = $_$jscomp$2_activeToolsMonitor$jscomp$1_pubData$jscomp$2$$.iframe, $iframeLoadPromise$jscomp$1$$ = $_$jscomp$2_activeToolsMonitor$jscomp$1_pubData$jscomp$2$$.$iframeLoadPromise$, $shareConfig$jscomp$2$$ = $_$jscomp$2_activeToolsMonitor$jscomp$1_pubData$jscomp$2$$.$shareConfig$, 
  $atConfig$jscomp$3$$ = $_$jscomp$2_activeToolsMonitor$jscomp$1_pubData$jscomp$2$$.$atConfig$;
  $_$jscomp$2_activeToolsMonitor$jscomp$1_pubData$jscomp$2$$ = $_$jscomp$2_activeToolsMonitor$jscomp$1_pubData$jscomp$2$$.$activeToolsMonitor$;
  this.$G$ || (this.$G$ = $_$jscomp$2_activeToolsMonitor$jscomp$1_pubData$jscomp$2$$);
  this.$D$[$pubId$jscomp$5$$] || (this.$D$[$pubId$jscomp$5$$] = {});
  $_$jscomp$2_activeToolsMonitor$jscomp$1_pubData$jscomp$2$$ = this.$D$[$pubId$jscomp$5$$];
  $_$jscomp$2_activeToolsMonitor$jscomp$1_pubData$jscomp$2$$.$requestStatus$ || ($_$jscomp$2_activeToolsMonitor$jscomp$1_pubData$jscomp$2$$.$requestStatus$ = 0);
  $_$jscomp$2_activeToolsMonitor$jscomp$1_pubData$jscomp$2$$.$iframeData$ || ($_$jscomp$2_activeToolsMonitor$jscomp$1_pubData$jscomp$2$$.$iframeData$ = []);
  $_$jscomp$2_activeToolsMonitor$jscomp$1_pubData$jscomp$2$$.$iframeData$.push({iframe:$iframe$jscomp$32$$, $shareConfig$:$shareConfig$jscomp$2$$, $atConfig$:$atConfig$jscomp$3$$, $widgetId$:$widgetId$jscomp$2$$});
  $iframeLoadPromise$jscomp$1$$.then(function() {
    return $JSCompiler_StaticMethods_sendConfiguration_$$($$jscomp$this$jscomp$365$$, {iframe:$iframe$jscomp$32$$, $pubId$:$pubId$jscomp$5$$, $widgetId$:$widgetId$jscomp$2$$, $shareConfig$:$shareConfig$jscomp$2$$, $atConfig$:$atConfig$jscomp$3$$});
  });
};
$PostMessageDispatcher$$module$extensions$amp_addthis$0_1$post_message_dispatcher$$.prototype.$on$ = function($eventType$jscomp$30$$, $listener$jscomp$64$$) {
  this.$D$[$eventType$jscomp$30$$] || (this.$D$[$eventType$jscomp$30$$] = []);
  this.$D$[$eventType$jscomp$30$$].push($listener$jscomp$64$$);
};
$PostMessageDispatcher$$module$extensions$amp_addthis$0_1$post_message_dispatcher$$.prototype.$F$ = function($event$jscomp$72$$) {
  if ("https://s7.addthis.com" === $event$jscomp$72$$.origin && $event$jscomp$72$$.data) {
    var $JSCompiler_inline_result$jscomp$634_data$jscomp$105_data$jscomp$inline_2392$$ = $event$jscomp$72$$.data;
    $JSCompiler_inline_result$jscomp$634_data$jscomp$105_data$jscomp$inline_2392$$ = _.$isObject$$module$src$types$$($JSCompiler_inline_result$jscomp$634_data$jscomp$105_data$jscomp$inline_2392$$) ? $JSCompiler_inline_result$jscomp$634_data$jscomp$105_data$jscomp$inline_2392$$ : "string" === typeof $JSCompiler_inline_result$jscomp$634_data$jscomp$105_data$jscomp$inline_2392$$ && _.$startsWith$$module$src$string$$($JSCompiler_inline_result$jscomp$634_data$jscomp$105_data$jscomp$inline_2392$$, "{") ? 
    _.$tryParseJson$$module$src$json$$($JSCompiler_inline_result$jscomp$634_data$jscomp$105_data$jscomp$inline_2392$$) : void 0;
    $JSCompiler_inline_result$jscomp$634_data$jscomp$105_data$jscomp$inline_2392$$ = $JSCompiler_inline_result$jscomp$634_data$jscomp$105_data$jscomp$inline_2392$$ || {};
    switch($JSCompiler_inline_result$jscomp$634_data$jscomp$105_data$jscomp$inline_2392$$.event) {
      case "addthis.amp.configuration":
        $JSCompiler_StaticMethods_PostMessageDispatcher$$module$extensions$amp_addthis$0_1$post_message_dispatcher_prototype$emit_$$(this, "addthis.amp.configuration", Object.assign({}, $JSCompiler_inline_result$jscomp$634_data$jscomp$105_data$jscomp$inline_2392$$, {source:$event$jscomp$72$$.source}));
        break;
      case "addthis.share":
        $JSCompiler_StaticMethods_PostMessageDispatcher$$module$extensions$amp_addthis$0_1$post_message_dispatcher_prototype$emit_$$(this, "addthis.share", $JSCompiler_inline_result$jscomp$634_data$jscomp$105_data$jscomp$inline_2392$$);
    }
  }
};
var $configManager$$module$extensions$amp_addthis$0_1$amp_addthis$$ = new $ConfigManager$$module$extensions$amp_addthis$0_1$config_manager$$, $scrollMonitor$$module$extensions$amp_addthis$0_1$amp_addthis$$ = new $ScrollMonitor$$module$extensions$amp_addthis$0_1$addthis_utils$monitors$scroll_monitor$$, $dwellMonitor$$module$extensions$amp_addthis$0_1$amp_addthis$$ = new $DwellMonitor$$module$extensions$amp_addthis$0_1$addthis_utils$monitors$dwell_monitor$$, $clickMonitor$$module$extensions$amp_addthis$0_1$amp_addthis$$ = 
new $ClickMonitor$$module$extensions$amp_addthis$0_1$addthis_utils$monitors$click_monitor$$, $activeToolsMonitor$$module$extensions$amp_addthis$0_1$amp_addthis$$ = new function() {
  this.$D$ = {};
}, $shouldRegisterView$$module$extensions$amp_addthis$0_1$amp_addthis$$ = !0;
_.$$jscomp$inherits$$($AmpAddThis$$module$extensions$amp_addthis$0_1$amp_addthis$$, window.AMP.BaseElement);
_.$JSCompiler_prototypeAlias$$ = $AmpAddThis$$module$extensions$amp_addthis$0_1$amp_addthis$$.prototype;
_.$JSCompiler_prototypeAlias$$.$buildCallback$ = function() {
  var $$jscomp$this$jscomp$366$$ = this, $pubId$jscomp$7$$ = this.element.getAttribute("data-pub-id"), $widgetId$jscomp$3$$ = this.element.getAttribute("data-widget-id");
  this.$pubId_$ = $pubId$jscomp$7$$;
  this.$widgetId_$ = $widgetId$jscomp$3$$;
  var $ampDoc$jscomp$18$$ = this.$getAmpDoc$();
  this.$canonicalUrl_$ = this.element.getAttribute("data-canonical-url") || $ampDoc$jscomp$18$$.$AmpDoc$$module$src$service$ampdoc_impl_prototype$getUrl$();
  this.$canonicalTitle_$ = this.element.getAttribute("data-canonical-title") || $ampDoc$jscomp$18$$.$win$.document.title;
  this.$widgetType_$ = this.element.getAttribute("data-widget-type");
  this.$shareConfig_$ = $JSCompiler_StaticMethods_getShareConfigAsJsonObject_$$(this);
  this.$atConfig_$ = $JSCompiler_StaticMethods_getATConfig_$$(this, $ampDoc$jscomp$18$$);
  if ($shouldRegisterView$$module$extensions$amp_addthis$0_1$amp_addthis$$) {
    $shouldRegisterView$$module$extensions$amp_addthis$0_1$amp_addthis$$ = !1;
    var $viewer$jscomp$33$$ = _.$Services$$module$src$services$viewerForDoc$$($ampDoc$jscomp$18$$), $loc$jscomp$7$$ = _.$parseUrlDeprecated$$module$src$url$$(this.$canonicalUrl_$);
    $viewer$jscomp$33$$.$D$.then(function() {
      return $viewer$jscomp$33$$.$I$;
    }).then(function($pubId$jscomp$7$$) {
      $$jscomp$this$jscomp$366$$.$referrer_$ = $pubId$jscomp$7$$;
      var $widgetId$jscomp$3$$ = $$jscomp$this$jscomp$366$$.$canonicalTitle_$, $viewer$jscomp$33$$ = $$jscomp$this$jscomp$366$$.$pubId_$, $JSCompiler_inline_result$jscomp$5613_referrer$jscomp$7$$ = $$jscomp$this$jscomp$366$$.$atConfig_$, $href$jscomp$inline_5969_parsedReferrer$jscomp$inline_5978$$ = $loc$jscomp$7$$.href, $hostname$jscomp$inline_5970$$ = $loc$jscomp$7$$.hostname, $host$jscomp$inline_5971$$ = $loc$jscomp$7$$.host, $langWithoutLocale$jscomp$inline_5980_search$jscomp$inline_5972$$ = 
      $loc$jscomp$7$$.search, $langParts$jscomp$inline_5979_locale$jscomp$inline_5981_pathname$jscomp$inline_5973$$ = $loc$jscomp$7$$.pathname, $JSCompiler_inline_result$jscomp$6671_fragment$jscomp$inline_6732_hash$jscomp$inline_5974$$ = $loc$jscomp$7$$.hash, $protocol$jscomp$inline_5975_win$jscomp$inline_5983$$ = $loc$jscomp$7$$.protocol, $metaElements$jscomp$inline_5984_port$jscomp$inline_5976$$ = $loc$jscomp$7$$.port;
      $widgetId$jscomp$3$$ = {$du$:$href$jscomp$inline_5969_parsedReferrer$jscomp$inline_5978$$.split("#").shift(), hostname:$hostname$jscomp$inline_5970$$, href:$href$jscomp$inline_5969_parsedReferrer$jscomp$inline_5978$$, referrer:$pubId$jscomp$7$$, search:$langWithoutLocale$jscomp$inline_5980_search$jscomp$inline_5972$$, pathname:$langParts$jscomp$inline_5979_locale$jscomp$inline_5981_pathname$jscomp$inline_5973$$, title:$widgetId$jscomp$3$$, hash:$JSCompiler_inline_result$jscomp$6671_fragment$jscomp$inline_6732_hash$jscomp$inline_5974$$, 
      protocol:$protocol$jscomp$inline_5975_win$jscomp$inline_5983$$, port:$metaElements$jscomp$inline_5984_port$jscomp$inline_5976$$};
      $href$jscomp$inline_5969_parsedReferrer$jscomp$inline_5978$$ = $pubId$jscomp$7$$ ? _.$parseUrlDeprecated$$module$src$url$$($pubId$jscomp$7$$) : {};
      $langParts$jscomp$inline_5979_locale$jscomp$inline_5981_pathname$jscomp$inline_5973$$ = $JSCompiler_inline_result$jscomp$5613_referrer$jscomp$7$$.ui_language.split("-");
      $langWithoutLocale$jscomp$inline_5980_search$jscomp$inline_5972$$ = $langParts$jscomp$inline_5979_locale$jscomp$inline_5981_pathname$jscomp$inline_5973$$[0];
      $langParts$jscomp$inline_5979_locale$jscomp$inline_5981_pathname$jscomp$inline_5973$$ = $langParts$jscomp$inline_5979_locale$jscomp$inline_5981_pathname$jscomp$inline_5973$$.slice(1);
      $JSCompiler_inline_result$jscomp$6671_fragment$jscomp$inline_6732_hash$jscomp$inline_5974$$ = ($JSCompiler_inline_result$jscomp$6671_fragment$jscomp$inline_6732_hash$jscomp$inline_5974$$ = $getModernFragment$$module$extensions$amp_addthis$0_1$addthis_utils$fragment$$($widgetId$jscomp$3$$.$du$)) ? $JSCompiler_inline_result$jscomp$6671_fragment$jscomp$inline_6732_hash$jscomp$inline_5974$$.split(".").slice(2).shift() : void 0;
      $protocol$jscomp$inline_5975_win$jscomp$inline_5983$$ = $ampDoc$jscomp$18$$.$win$;
      $metaElements$jscomp$inline_5984_port$jscomp$inline_5976$$ = _.$toArray$$module$src$types$$($protocol$jscomp$inline_5975_win$jscomp$inline_5983$$.document.head.querySelectorAll("meta"));
      var $isDNTEnabled$jscomp$inline_5985$$ = $protocol$jscomp$inline_5975_win$jscomp$inline_5983$$.navigator.$D$ && "unspecified" !== $protocol$jscomp$inline_5975_win$jscomp$inline_5983$$.navigator.$D$ && "no" !== $protocol$jscomp$inline_5975_win$jscomp$inline_5983$$.navigator.$D$ && "0" !== $protocol$jscomp$inline_5975_win$jscomp$inline_5983$$.navigator.$D$, $JSCompiler_temp_const$jscomp$6668$$ = 0 | (!1 !== $JSCompiler_inline_result$jscomp$5613_referrer$jscomp$7$$.use_cookies ? 1 : 0) | (!0 === 
      $JSCompiler_inline_result$jscomp$5613_referrer$jscomp$7$$.track_textcopy ? 2 : 0) | (!0 === $JSCompiler_inline_result$jscomp$5613_referrer$jscomp$7$$.track_addressbar ? 4 : 0), $JSCompiler_temp_const$jscomp$6667$$ = $classifyPage$$module$extensions$amp_addthis$0_1$addthis_utils$classify$$($widgetId$jscomp$3$$, $metaElements$jscomp$inline_5984_port$jscomp$inline_5976$$), $JSCompiler_temp_const$jscomp$6666$$ = Date.now();
      $JSCompiler_inline_result$jscomp$5613_referrer$jscomp$7$$ = !1 !== $JSCompiler_inline_result$jscomp$5613_referrer$jscomp$7$$.track_clickback && !1 !== $JSCompiler_inline_result$jscomp$5613_referrer$jscomp$7$$.track_linkback ? 1 : 0;
      var $JSCompiler_temp_const$jscomp$6664$$ = $host$jscomp$inline_5971$$ === $href$jscomp$inline_5969_parsedReferrer$jscomp$inline_5978$$.host ? void 0 : $href$jscomp$inline_5969_parsedReferrer$jscomp$inline_5978$$.host;
      var $JSCompiler_temp$jscomp$6670_JSCompiler_temp_const$jscomp$6663_fragment$jscomp$inline_6735$$ = $JSCompiler_inline_result$jscomp$6671_fragment$jscomp$inline_6732_hash$jscomp$inline_5974$$ ? "" : ($JSCompiler_temp$jscomp$6670_JSCompiler_temp_const$jscomp$6663_fragment$jscomp$inline_6735$$ = $getModernFragment$$module$extensions$amp_addthis$0_1$addthis_utils$fragment$$($widgetId$jscomp$3$$.$du$)) ? $JSCompiler_temp$jscomp$6670_JSCompiler_temp_const$jscomp$6663_fragment$jscomp$inline_6735$$.split(".").slice(1).shift() : 
      void 0;
      var $JSCompiler_inline_result$jscomp$6669_url$jscomp$inline_6737$$ = $widgetId$jscomp$3$$.$du$;
      var $JSCompiler_inline_result$jscomp$6829_frag$jscomp$inline_6851$$ = $getModernFragment$$module$extensions$amp_addthis$0_1$addthis_utils$fragment$$($JSCompiler_inline_result$jscomp$6669_url$jscomp$inline_6737$$) ? !0 : ($JSCompiler_inline_result$jscomp$6829_frag$jscomp$inline_6851$$ = $JSCompiler_inline_result$jscomp$6669_url$jscomp$inline_6737$$.split("#").pop()) && $JSCompiler_inline_result$jscomp$6829_frag$jscomp$inline_6851$$.match($RE_CUID$$module$extensions$amp_addthis$0_1$addthis_utils$cuid$$) && 
      !$isCuidInFuture$$module$extensions$amp_addthis$0_1$addthis_utils$cuid$$($JSCompiler_inline_result$jscomp$6829_frag$jscomp$inline_6851$$) || -1 < $JSCompiler_inline_result$jscomp$6669_url$jscomp$inline_6737$$.indexOf("#at_pco=") ? !0 : !1;
      $JSCompiler_inline_result$jscomp$6669_url$jscomp$inline_6737$$ = $JSCompiler_inline_result$jscomp$6829_frag$jscomp$inline_6851$$ ? $JSCompiler_inline_result$jscomp$6669_url$jscomp$inline_6737$$.split("#").shift() : $JSCompiler_inline_result$jscomp$6669_url$jscomp$inline_6737$$;
      $pubId$jscomp$7$$ = _.$dict$$module$src$utils$object$$({amp:1, bl:$JSCompiler_temp_const$jscomp$6668$$, cb:$JSCompiler_temp_const$jscomp$6667$$, colc:$JSCompiler_temp_const$jscomp$6666$$, ct:$JSCompiler_inline_result$jscomp$5613_referrer$jscomp$7$$, dc:1, dp:$host$jscomp$inline_5971$$, dr:$JSCompiler_temp_const$jscomp$6664$$, fcu:$JSCompiler_temp$jscomp$6670_JSCompiler_temp_const$jscomp$6663_fragment$jscomp$inline_6735$$, fp:_.$parseUrlDeprecated$$module$src$url$$($JSCompiler_inline_result$jscomp$6669_url$jscomp$inline_6737$$).pathname, 
      fr:$href$jscomp$inline_5969_parsedReferrer$jscomp$inline_5978$$.pathname || "", gen:100, ln:$langWithoutLocale$jscomp$inline_5980_search$jscomp$inline_5972$$, lnlc:$langParts$jscomp$inline_5979_locale$jscomp$inline_5981_pathname$jscomp$inline_5973$$, mk:$getKeywordsString$$module$extensions$amp_addthis$0_1$addthis_utils$classify$$($metaElements$jscomp$inline_5984_port$jscomp$inline_5976$$), of:$isDNTEnabled$jscomp$inline_5985$$ ? 4 : $nonTrackedDomainMatcher$$module$extensions$amp_addthis$0_1$addthis_utils$lojson$$.test($hostname$jscomp$inline_5970$$) ? 
      1 : 0, pd:$isProductPage$$module$extensions$amp_addthis$0_1$addthis_utils$classify$$($protocol$jscomp$inline_5975_win$jscomp$inline_5983$$.document, $metaElements$jscomp$inline_5984_port$jscomp$inline_5976$$) ? 1 : 0, pub:$viewer$jscomp$33$$, rb:$classifyReferrer$$module$extensions$amp_addthis$0_1$addthis_utils$classify$$($pubId$jscomp$7$$, $href$jscomp$inline_5969_parsedReferrer$jscomp$inline_5978$$, _.$parseUrlDeprecated$$module$src$url$$($widgetId$jscomp$3$$.$du$)), sid:$JSCompiler_inline_result$jscomp$624$$, 
      skipb:1, sr:$JSCompiler_inline_result$jscomp$6671_fragment$jscomp$inline_6732_hash$jscomp$inline_5974$$});
      $callPixelEndpoint$$module$extensions$amp_addthis$0_1$addthis_utils$pixel$$({$ampDoc$:$ampDoc$jscomp$18$$, endpoint:"https://m.addthis.com/live/red_lojson/300lo.json", data:$pubId$jscomp$7$$});
      $dwellMonitor$$module$extensions$amp_addthis$0_1$amp_addthis$$.$viewer_$ = _.$Services$$module$src$services$viewerForDoc$$($ampDoc$jscomp$18$$);
      _.$JSCompiler_StaticMethods_Viewer$$module$src$service$viewer_impl_prototype$onVisibilityChanged$$($dwellMonitor$$module$extensions$amp_addthis$0_1$amp_addthis$$.$viewer_$, $dwellMonitor$$module$extensions$amp_addthis$0_1$amp_addthis$$.$F$.bind($dwellMonitor$$module$extensions$amp_addthis$0_1$amp_addthis$$));
      $scrollMonitor$$module$extensions$amp_addthis$0_1$amp_addthis$$.$viewport_$ = _.$Services$$module$src$services$viewportForDoc$$($ampDoc$jscomp$18$$);
      $scrollMonitor$$module$extensions$amp_addthis$0_1$amp_addthis$$.$G$ = _.$JSCompiler_StaticMethods_getHeight$$($scrollMonitor$$module$extensions$amp_addthis$0_1$amp_addthis$$.$viewport_$) || 0;
      $scrollMonitor$$module$extensions$amp_addthis$0_1$amp_addthis$$.$D$ = _.$JSCompiler_StaticMethods_Viewport$$module$src$service$viewport$viewport_impl_prototype$getScrollTop$$($scrollMonitor$$module$extensions$amp_addthis$0_1$amp_addthis$$.$viewport_$) || 0;
      $scrollMonitor$$module$extensions$amp_addthis$0_1$amp_addthis$$.$F$ = $scrollMonitor$$module$extensions$amp_addthis$0_1$amp_addthis$$.$D$ + $scrollMonitor$$module$extensions$amp_addthis$0_1$amp_addthis$$.$G$;
      _.$JSCompiler_StaticMethods_Viewport$$module$src$service$viewport$viewport_impl_prototype$onScroll$$($scrollMonitor$$module$extensions$amp_addthis$0_1$amp_addthis$$.$viewport_$, $scrollMonitor$$module$extensions$amp_addthis$0_1$amp_addthis$$.$I$.bind($scrollMonitor$$module$extensions$amp_addthis$0_1$amp_addthis$$));
      $clickMonitor$$module$extensions$amp_addthis$0_1$amp_addthis$$.$D$ = $ampDoc$jscomp$18$$.$win$;
      $clickMonitor$$module$extensions$amp_addthis$0_1$amp_addthis$$.$G$ = $clickMonitor$$module$extensions$amp_addthis$0_1$amp_addthis$$.$D$.document.activeElement;
      _.$listen$$module$src$event_helper$$($clickMonitor$$module$extensions$amp_addthis$0_1$amp_addthis$$.$D$, "blur", $clickMonitor$$module$extensions$amp_addthis$0_1$amp_addthis$$.$J$.bind($clickMonitor$$module$extensions$amp_addthis$0_1$amp_addthis$$));
      _.$listen$$module$src$event_helper$$($clickMonitor$$module$extensions$amp_addthis$0_1$amp_addthis$$.$D$, "click", $clickMonitor$$module$extensions$amp_addthis$0_1$amp_addthis$$.$K$.bind($clickMonitor$$module$extensions$amp_addthis$0_1$amp_addthis$$));
    });
    $JSCompiler_StaticMethods_AmpAddThis$$module$extensions$amp_addthis$0_1$amp_addthis_prototype$setupListeners_$$(this, {$ampDoc$:$ampDoc$jscomp$18$$, $loc$:$loc$jscomp$7$$, $pubId$:this.$pubId_$});
  }
};
_.$JSCompiler_prototypeAlias$$.$preconnectCallback$ = function($opt_onLayout$jscomp$4$$) {
  this.$preconnect$.url("https://s7.addthis.com", $opt_onLayout$jscomp$4$$);
  this.$preconnect$.url("https://m.addthis.com", $opt_onLayout$jscomp$4$$);
  this.$preconnect$.url("https://m.addthisedge.com", $opt_onLayout$jscomp$4$$);
  this.$preconnect$.url("https://api-public.addthis.com", $opt_onLayout$jscomp$4$$);
  this.$preconnect$.url("https://cache.addthiscdn.com", $opt_onLayout$jscomp$4$$);
  this.$preconnect$.url("https://su.addthis.com", $opt_onLayout$jscomp$4$$);
};
_.$JSCompiler_prototypeAlias$$.$isAlwaysFixed$ = function() {
  return "floating" === this.$widgetType_$;
};
_.$JSCompiler_prototypeAlias$$.$createPlaceholderCallback$ = function() {
  var $placeholder$jscomp$6$$ = _.$createElementWithAttributes$$module$src$dom$$(this.$win$.document, "div", _.$dict$$module$src$utils$object$$({placeholder:""}));
  _.$setStyle$$module$src$style$$($placeholder$jscomp$6$$, "background-color", "#fff");
  var $image$jscomp$4$$ = _.$createElementWithAttributes$$module$src$dom$$(this.$win$.document, "amp-img", _.$dict$$module$src$utils$object$$({src:"https://cache.addthiscdn.com/icons/v3/thumbs/32x32/addthis.png", layout:"fixed", width:"32", height:"32", referrerpolicy:"origin", alt:"AddThis Website Tools"}));
  $placeholder$jscomp$6$$.appendChild($image$jscomp$4$$);
  return $placeholder$jscomp$6$$;
};
_.$JSCompiler_prototypeAlias$$.$layoutCallback$ = function() {
  var $iframe$jscomp$34$$ = _.$createElementWithAttributes$$module$src$dom$$(this.element.ownerDocument, "iframe", _.$dict$$module$src$utils$object$$({frameborder:0, title:"AddThis Website Tools", src:"https://s7.addthis.com/dc/amp-addthis.html", id:this.$widgetId_$})), $iframeLoadPromise$jscomp$2$$ = this.$loadPromise$($iframe$jscomp$34$$);
  _.$setStyle$$module$src$style$$($iframe$jscomp$34$$, "margin-bottom", "-5px");
  _.$JSCompiler_StaticMethods_applyFillContent$$($iframe$jscomp$34$$);
  this.element.appendChild($iframe$jscomp$34$$);
  this.$iframe_$ = $iframe$jscomp$34$$;
  $configManager$$module$extensions$amp_addthis$0_1$amp_addthis$$.register({$pubId$:this.$pubId_$, $widgetId$:this.$widgetId_$, $shareConfig$:this.$shareConfig_$, $atConfig$:this.$atConfig_$, iframe:$iframe$jscomp$34$$, $iframeLoadPromise$:$iframeLoadPromise$jscomp$2$$, $activeToolsMonitor$:$activeToolsMonitor$$module$extensions$amp_addthis$0_1$amp_addthis$$});
  return $iframeLoadPromise$jscomp$2$$;
};
_.$JSCompiler_prototypeAlias$$.$isLayoutSupported$ = function($layout$jscomp$32$$) {
  return _.$isLayoutSizeDefined$$module$src$layout$$($layout$jscomp$32$$);
};
_.$JSCompiler_prototypeAlias$$.$unlayoutCallback$ = function() {
  this.$iframe_$ && (_.$removeElement$$module$src$dom$$(this.$iframe_$), $JSCompiler_StaticMethods_ConfigManager$$module$extensions$amp_addthis$0_1$config_manager_prototype$unregister$$({$pubId$:this.$pubId_$, iframe:this.$iframe_$}), this.$iframe_$ = null);
  return !0;
};
window.self.AMP.registerElement("amp-addthis", $AmpAddThis$$module$extensions$amp_addthis$0_1$amp_addthis$$);

})});
