(self.AMP=self.AMP||[]).push({n:"amp-apester-media",i:["_base_i","_base_media"],v:"1901181729101",f:(function(AMP,_){
var $getPlatform$$module$extensions$amp_apester_media$0_1$utils$$ = function() {
  var $JSCompiler_inline_result$jscomp$689$$ = !!window.navigator.userAgent.match($webviewRegExp$$module$extensions$amp_apester_media$0_1$utils$$);
  var $userAgent$jscomp$inline_2771$$ = window.navigator.userAgent || window.navigator.vendor || window.opera;
  return /(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino|android|ipad|playbook|silk/i.test($userAgent$jscomp$inline_2771$$) || /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test($userAgent$jscomp$inline_2771$$.substr(0, 
  4)) ? "mobile" + ($JSCompiler_inline_result$jscomp$689$$ ? "-webview" : "") : "desktop";
}, $extractElementTags$$module$extensions$amp_apester_media$0_1$utils$$ = function($element$jscomp$332_tagsAttribute$$) {
  return ($element$jscomp$332_tagsAttribute$$ = $element$jscomp$332_tagsAttribute$$ && $element$jscomp$332_tagsAttribute$$.getAttribute("data-apester-tags")) ? $element$jscomp$332_tagsAttribute$$.split(",").map(function($element$jscomp$332_tagsAttribute$$) {
    return $element$jscomp$332_tagsAttribute$$.trim();
  }) || [] : [];
}, $extratctTitle$$module$extensions$amp_apester_media$0_1$utils$$ = function($root$jscomp$58$$) {
  return _.$toArray$$module$src$types$$($root$jscomp$58$$.querySelectorAll('script[type="application/ld+json"]')).map(function($root$jscomp$58$$) {
    return $root$jscomp$58$$ && _.$isJsonLdScriptTag$$module$src$dom$$($root$jscomp$58$$) ? _.$tryParseJson$$module$src$json$$($root$jscomp$58$$.textContent) || {} : {};
  }).map(function($root$jscomp$58$$) {
    return $root$jscomp$58$$ && $root$jscomp$58$$.headline;
  }).filter(function($root$jscomp$58$$) {
    return "string" === typeof $root$jscomp$58$$;
  }).map(function($root$jscomp$58$$) {
    return $root$jscomp$58$$.trim().split(" ").filter(function($root$jscomp$58$$) {
      return 2 < $root$jscomp$58$$.length;
    });
  }).reduce(function($root$jscomp$58$$, $headline$$) {
    return $root$jscomp$58$$.concat($headline$$);
  }, []).slice(0, 5);
}, $extractArticleTags$$module$extensions$amp_apester_media$0_1$utils$$ = function($root$jscomp$59$$) {
  return ($root$jscomp$59$$.querySelector('meta[name="keywords"]') || {content:""}).content.trim().split(",").filter(function($root$jscomp$59$$) {
    return $root$jscomp$59$$;
  }).map(function($root$jscomp$59$$) {
    return $root$jscomp$59$$.trim();
  });
}, $extractTags$$module$extensions$amp_apester_media$0_1$utils$$ = function($root$jscomp$60$$, $element$jscomp$333_extractedTags$$) {
  $element$jscomp$333_extractedTags$$ = $extractElementTags$$module$extensions$amp_apester_media$0_1$utils$$($element$jscomp$333_extractedTags$$) || [];
  var $articleMetaTags$$ = $extractArticleTags$$module$extensions$amp_apester_media$0_1$utils$$($root$jscomp$60$$);
  return $element$jscomp$333_extractedTags$$.concat($articleMetaTags$$.length ? $articleMetaTags$$ : $extratctTitle$$module$extensions$amp_apester_media$0_1$utils$$($root$jscomp$60$$) || []).map(function($root$jscomp$60$$) {
    return $root$jscomp$60$$.toLowerCase().trim();
  }).filter(function($root$jscomp$60$$, $element$jscomp$333_extractedTags$$, $articleMetaTags$$) {
    return $articleMetaTags$$.indexOf($root$jscomp$60$$) === $element$jscomp$333_extractedTags$$;
  });
}, $registerEvent$$module$extensions$amp_apester_media$0_1$utils$$ = function($eventName$$, $callback$jscomp$116$$, $unlisten$jscomp$13_win$jscomp$329$$, $iframe$jscomp$36$$, $unlisteners$jscomp$4$$) {
  $unlisten$jscomp$13_win$jscomp$329$$ = _.$listen$$module$src$event_helper$$($unlisten$jscomp$13_win$jscomp$329$$, "message", function($unlisten$jscomp$13_win$jscomp$329$$) {
    var $unlisteners$jscomp$4$$ = $iframe$jscomp$36$$.contentWindow === $unlisten$jscomp$13_win$jscomp$329$$.source;
    $unlisten$jscomp$13_win$jscomp$329$$.data.type === $eventName$$ && $unlisteners$jscomp$4$$ && $callback$jscomp$116$$($unlisten$jscomp$13_win$jscomp$329$$.data);
  });
  $unlisteners$jscomp$4$$.push($unlisten$jscomp$13_win$jscomp$329$$);
}, $generatePixelURL$$module$extensions$amp_apester_media$0_1$utils$$ = function($publisherId$$, $affiliateId$$) {
  var $qsObj$$ = {offer_id:2, aff_id:$affiliateId$$, aff_sub:$publisherId$$, aff_sub2:window.location.hostname, aff_sub3:"amp"};
  return "https://apester.go2cloud.org/aff_i?" + Object.keys($qsObj$$).map(function($publisherId$$) {
    return $publisherId$$ + "=" + $qsObj$$[$publisherId$$];
  }).join("&");
}, $AmpApesterMedia$$module$extensions$amp_apester_media$0_1$amp_apester_media$$ = function($$jscomp$super$this$jscomp$18_element$jscomp$336$$) {
  $$jscomp$super$this$jscomp$18_element$jscomp$336$$ = window.AMP.BaseElement.call(this, $$jscomp$super$this$jscomp$18_element$jscomp$336$$) || this;
  $$jscomp$super$this$jscomp$18_element$jscomp$336$$.$rendererBaseUrl_$ = "https://renderer.apester.com";
  $$jscomp$super$this$jscomp$18_element$jscomp$336$$.$displayBaseUrl_$ = "https://display.apester.com";
  $$jscomp$super$this$jscomp$18_element$jscomp$336$$.$staticContent_$ = "https://static.qmerce.com";
  $$jscomp$super$this$jscomp$18_element$jscomp$336$$.$loaderUrl_$ = "https://static.apester.com/js/assets/loader.gif";
  $$jscomp$super$this$jscomp$18_element$jscomp$336$$.$seen_$ = !1;
  $$jscomp$super$this$jscomp$18_element$jscomp$336$$.$iframe_$ = null;
  $$jscomp$super$this$jscomp$18_element$jscomp$336$$.$placeholder_$ = null;
  $$jscomp$super$this$jscomp$18_element$jscomp$336$$.$ready_$ = !1;
  $$jscomp$super$this$jscomp$18_element$jscomp$336$$.$width_$ = null;
  $$jscomp$super$this$jscomp$18_element$jscomp$336$$.$height_$ = null;
  $$jscomp$super$this$jscomp$18_element$jscomp$336$$.$random_$ = !1;
  $$jscomp$super$this$jscomp$18_element$jscomp$336$$.$mediaAttribute_$ = null;
  $$jscomp$super$this$jscomp$18_element$jscomp$336$$.$embedOptions_$ = {};
  $$jscomp$super$this$jscomp$18_element$jscomp$336$$.$mediaId_$ = null;
  $$jscomp$super$this$jscomp$18_element$jscomp$336$$.$unlisteners_$ = [];
  $$jscomp$super$this$jscomp$18_element$jscomp$336$$.$intersectionObserverApi_$ = null;
  return $$jscomp$super$this$jscomp$18_element$jscomp$336$$;
}, $JSCompiler_StaticMethods_buildUrl_$$ = function($JSCompiler_StaticMethods_buildUrl_$self$$) {
  var $$jscomp$destructuring$var311_tags$jscomp$5$$ = $JSCompiler_StaticMethods_buildUrl_$self$$.$embedOptions_$, $idOrToken$$ = $$jscomp$destructuring$var311_tags$jscomp$5$$.$idOrToken$, $playlist$$ = $$jscomp$destructuring$var311_tags$jscomp$5$$.$playlist$, $inative$$ = $$jscomp$destructuring$var311_tags$jscomp$5$$.$inative$, $distributionChannelId$$ = $$jscomp$destructuring$var311_tags$jscomp$5$$.$distributionChannelId$, $fallback$jscomp$2$$ = $$jscomp$destructuring$var311_tags$jscomp$5$$.$fallback$;
  $$jscomp$destructuring$var311_tags$jscomp$5$$ = $$jscomp$destructuring$var311_tags$jscomp$5$$.$tags$;
  var $encodedMediaAttribute$$ = (0,window.encodeURIComponent)($JSCompiler_StaticMethods_buildUrl_$self$$.$mediaAttribute_$), $suffix$jscomp$5$$ = "", $queryParams$jscomp$3$$ = {renderer:!1};
  $queryParams$jscomp$3$$.platform = $getPlatform$$module$extensions$amp_apester_media$0_1$utils$$();
  $inative$$ ? $idOrToken$$ ? $suffix$jscomp$5$$ = "/inatives/" + $idOrToken$$ : $distributionChannelId$$ && ($suffix$jscomp$5$$ = "/channels/" + $distributionChannelId$$ + "/inatives") : $playlist$$ && $$jscomp$destructuring$var311_tags$jscomp$5$$ ? ($suffix$jscomp$5$$ = "/tokens/" + $encodedMediaAttribute$$ + "/interactions/random", $queryParams$jscomp$3$$.tags = $$jscomp$destructuring$var311_tags$jscomp$5$$, $queryParams$jscomp$3$$.fallback = !!$fallback$jscomp$2$$) : $suffix$jscomp$5$$ = $playlist$$ ? 
  "/tokens/" + $encodedMediaAttribute$$ + "/interactions/random" : "/interactions/" + $encodedMediaAttribute$$ + "/display";
  return _.$addParamsToUrl$$module$src$url$$($JSCompiler_StaticMethods_buildUrl_$self$$.$displayBaseUrl_$ + $suffix$jscomp$5$$, $queryParams$jscomp$3$$);
}, $JSCompiler_StaticMethods_queryMedia_$$ = function($JSCompiler_StaticMethods_queryMedia_$self$$) {
  var $url$jscomp$176$$ = $JSCompiler_StaticMethods_buildUrl_$$($JSCompiler_StaticMethods_queryMedia_$self$$);
  return _.$JSCompiler_StaticMethods_fetchJson$$(_.$Services$$module$src$services$xhrFor$$($JSCompiler_StaticMethods_queryMedia_$self$$.$win$), $url$jscomp$176$$, {requireAmpResponseSourceOrigin:!1}).then(function($JSCompiler_StaticMethods_queryMedia_$self$$) {
    return 200 === $JSCompiler_StaticMethods_queryMedia_$self$$.status ? $JSCompiler_StaticMethods_queryMedia_$self$$.json() : $JSCompiler_StaticMethods_queryMedia_$self$$;
  });
}, $JSCompiler_StaticMethods_constructUrlFromMedia_$$ = function($JSCompiler_StaticMethods_constructUrlFromMedia_$self$$, $id$jscomp$61$$, $usePlayer$$) {
  var $queryParams$jscomp$4$$ = {};
  $queryParams$jscomp$4$$.channelId = $JSCompiler_StaticMethods_constructUrlFromMedia_$self$$.$embedOptions_$.$distributionChannelId$;
  $queryParams$jscomp$4$$.type = $JSCompiler_StaticMethods_constructUrlFromMedia_$self$$.$embedOptions_$.$playlist$ ? "playlist" : "editorial";
  $queryParams$jscomp$4$$.platform = $getPlatform$$module$extensions$amp_apester_media$0_1$utils$$();
  $queryParams$jscomp$4$$.cannonicalUrl = _.$Services$$module$src$services$documentInfoForDoc$$($JSCompiler_StaticMethods_constructUrlFromMedia_$self$$.element).canonicalUrl;
  $queryParams$jscomp$4$$.sdk = "amp";
  return _.$addParamsToUrl$$module$src$url$$($JSCompiler_StaticMethods_constructUrlFromMedia_$self$$.$rendererBaseUrl_$ + "/" + ($usePlayer$$ ? "v2" : "interaction") + "/" + (0,window.encodeURIComponent)($id$jscomp$61$$), $queryParams$jscomp$4$$);
}, $JSCompiler_StaticMethods_constructIframe_$$ = function($JSCompiler_StaticMethods_constructIframe_$self$$, $src$jscomp$21$$) {
  var $iframe$jscomp$37$$ = $JSCompiler_StaticMethods_constructIframe_$self$$.element.ownerDocument.createElement("iframe");
  $iframe$jscomp$37$$.setAttribute("frameborder", "0");
  $iframe$jscomp$37$$.setAttribute("allowtransparency", "true");
  $iframe$jscomp$37$$.setAttribute("scrolling", "no");
  $iframe$jscomp$37$$.src = $src$jscomp$21$$;
  $iframe$jscomp$37$$.name = $JSCompiler_StaticMethods_constructIframe_$self$$.$win$.location.href;
  $iframe$jscomp$37$$.height = $JSCompiler_StaticMethods_constructIframe_$self$$.$height_$;
  $iframe$jscomp$37$$.width = $JSCompiler_StaticMethods_constructIframe_$self$$.$width_$;
  $iframe$jscomp$37$$.classList.add("amp-apester-iframe");
  _.$JSCompiler_StaticMethods_applyFillContent$$($iframe$jscomp$37$$);
  return $iframe$jscomp$37$$;
}, $JSCompiler_StaticMethods_registerToApesterEvents_$$ = function($JSCompiler_StaticMethods_registerToApesterEvents_$self$$) {
  $registerEvent$$module$extensions$amp_apester_media$0_1$utils$$("fullscreen_on", function($data$jscomp$107$$) {
    $JSCompiler_StaticMethods_registerToApesterEvents_$self$$.$mediaId_$ === $data$jscomp$107$$.id && $JSCompiler_StaticMethods_registerToApesterEvents_$self$$.element.classList.add("amp-apester-fullscreen");
  }, $JSCompiler_StaticMethods_registerToApesterEvents_$self$$.$win$, $JSCompiler_StaticMethods_registerToApesterEvents_$self$$.$iframe_$, $JSCompiler_StaticMethods_registerToApesterEvents_$self$$.$unlisteners_$);
  $registerEvent$$module$extensions$amp_apester_media$0_1$utils$$("fullscreen_off", function($data$jscomp$108$$) {
    $JSCompiler_StaticMethods_registerToApesterEvents_$self$$.$mediaId_$ === $data$jscomp$108$$.id && $JSCompiler_StaticMethods_registerToApesterEvents_$self$$.element.classList.remove("amp-apester-fullscreen");
  }, $JSCompiler_StaticMethods_registerToApesterEvents_$self$$.$win$, $JSCompiler_StaticMethods_registerToApesterEvents_$self$$.$iframe_$, $JSCompiler_StaticMethods_registerToApesterEvents_$self$$.$unlisteners_$);
  $registerEvent$$module$extensions$amp_apester_media$0_1$utils$$("apester_resize_unit", function($data$jscomp$109$$) {
    $JSCompiler_StaticMethods_registerToApesterEvents_$self$$.$mediaId_$ === $data$jscomp$109$$.id && $data$jscomp$109$$.height && _.$JSCompiler_StaticMethods_attemptChangeHeight$$($JSCompiler_StaticMethods_registerToApesterEvents_$self$$, $data$jscomp$109$$.height);
  }, $JSCompiler_StaticMethods_registerToApesterEvents_$self$$.$win$, $JSCompiler_StaticMethods_registerToApesterEvents_$self$$.$iframe_$, $JSCompiler_StaticMethods_registerToApesterEvents_$self$$.$unlisteners_$);
};
var $webviewRegExp$$module$extensions$amp_apester_media$0_1$utils$$ = /(WebView|(iPhone|iPod|iPad)(?!.*Safari)|Android.*(wv|.0.0.0)|Linux; U; Android)/ig;
_.$$jscomp$inherits$$($AmpApesterMedia$$module$extensions$amp_apester_media$0_1$amp_apester_media$$, window.AMP.BaseElement);
_.$JSCompiler_prototypeAlias$$ = $AmpApesterMedia$$module$extensions$amp_apester_media$0_1$amp_apester_media$$.prototype;
_.$JSCompiler_prototypeAlias$$.$preconnectCallback$ = function($onLayout$jscomp$2$$) {
  this.$preconnect$.url(this.$displayBaseUrl_$, $onLayout$jscomp$2$$);
  this.$preconnect$.url(this.$rendererBaseUrl_$, $onLayout$jscomp$2$$);
  this.$preconnect$.url(this.$staticContent_$, $onLayout$jscomp$2$$);
};
_.$JSCompiler_prototypeAlias$$.$isLayoutSupported$ = function($layout$jscomp$34$$) {
  return _.$isLayoutSizeDefined$$module$src$layout$$($layout$jscomp$34$$);
};
_.$JSCompiler_prototypeAlias$$.$viewportCallback$ = function($inViewport$jscomp$14$$) {
  this.$intersectionObserverApi_$ && this.$intersectionObserverApi_$.$onViewportCallback$($inViewport$jscomp$14$$);
  $inViewport$jscomp$14$$ && !this.$seen_$ && this.$iframe_$ && this.$iframe_$.contentWindow && ("amp-apester-media", this.$seen_$ = !0, this.$iframe_$.contentWindow.postMessage("interaction seen", "*"));
  this.$getPlaceholder$() && !this.$ready_$ && this.$togglePlaceholder$($inViewport$jscomp$14$$);
};
_.$JSCompiler_prototypeAlias$$.$buildCallback$ = function() {
  var $width$jscomp$38$$ = this.element.getAttribute("width"), $height$jscomp$34$$ = this.element.getAttribute("height");
  this.$width_$ = _.$getLengthNumeral$$module$src$layout$$($width$jscomp$38$$);
  this.$height_$ = _.$getLengthNumeral$$module$src$layout$$($height$jscomp$34$$);
  this.$random_$ = !1;
  this.$mediaAttribute_$ = this.element.getAttribute("data-apester-media-id") || (this.$random_$ = this.element.getAttribute("data-apester-channel-token"));
  this.$embedOptions_$ = {$playlist$:this.$random_$, $idOrToken$:this.$mediaAttribute_$, $inative$:"true" === this.element.getAttribute("data-apester-inative"), $fallback$:this.element.getAttribute("data-apester-fallback"), $distributionChannelId$:this.element.getAttribute("data-apester-channel-id"), $renderer$:!0, $tags$:$extractTags$$module$extensions$amp_apester_media$0_1$utils$$(this.$getAmpDoc$().getRootNode(), this.element)};
};
_.$JSCompiler_prototypeAlias$$.$firstLayoutCompleted$ = function() {
  this.$viewportCallback$(this.$isInViewport$());
};
_.$JSCompiler_prototypeAlias$$.$onLayoutMeasure$ = function() {
  this.$intersectionObserverApi_$ && this.$intersectionObserverApi_$.$fire$();
};
_.$JSCompiler_prototypeAlias$$.$layoutCallback$ = function() {
  var $$jscomp$this$jscomp$443$$ = this;
  this.element.classList.add("amp-apester-container");
  var $vsync$jscomp$3$$ = _.$Services$$module$src$services$vsyncFor$$(this.$win$);
  return $JSCompiler_StaticMethods_queryMedia_$$(this).then(function($interactionId_payload$jscomp$16_response$jscomp$48$$) {
    if (!$interactionId_payload$jscomp$16_response$jscomp$48$$ || 204 === $interactionId_payload$jscomp$16_response$jscomp$48$$.status) {
      return _.$dev$$module$src$log$$().error("amp-apester-media", "Display", "No Content for provided tag"), $$jscomp$this$jscomp$443$$.$unlayoutCallback$();
    }
    $interactionId_payload$jscomp$16_response$jscomp$48$$ = $interactionId_payload$jscomp$16_response$jscomp$48$$.payload;
    var $media$jscomp$1$$ = $$jscomp$this$jscomp$443$$.$embedOptions_$.$playlist$ ? $interactionId_payload$jscomp$16_response$jscomp$48$$[Math.floor(Math.random() * $interactionId_payload$jscomp$16_response$jscomp$48$$.length)] : $interactionId_payload$jscomp$16_response$jscomp$48$$;
    $interactionId_payload$jscomp$16_response$jscomp$48$$ = $media$jscomp$1$$.interactionId;
    var $src$jscomp$22$$ = $JSCompiler_StaticMethods_constructUrlFromMedia_$$($$jscomp$this$jscomp$443$$, $interactionId_payload$jscomp$16_response$jscomp$48$$, $media$jscomp$1$$.usePlayer), $iframe$jscomp$38$$ = $JSCompiler_StaticMethods_constructIframe_$$($$jscomp$this$jscomp$443$$, $src$jscomp$22$$);
    $$jscomp$this$jscomp$443$$.$intersectionObserverApi_$ = new _.$IntersectionObserverApi$$module$src$intersection_observer_polyfill$$($$jscomp$this$jscomp$443$$, $iframe$jscomp$38$$);
    $$jscomp$this$jscomp$443$$.$mediaId_$ = $interactionId_payload$jscomp$16_response$jscomp$48$$;
    $$jscomp$this$jscomp$443$$.$iframe_$ = $iframe$jscomp$38$$;
    $JSCompiler_StaticMethods_registerToApesterEvents_$$($$jscomp$this$jscomp$443$$);
    return _.$JSCompiler_StaticMethods_mutatePromise$$($vsync$jscomp$3$$, function() {
      var $vsync$jscomp$3$$ = $$jscomp$this$jscomp$443$$.element.ownerDocument.createElement("div");
      $vsync$jscomp$3$$.setAttribute("overflow", "");
      $vsync$jscomp$3$$.className = "amp-apester-overflow";
      var $interactionId_payload$jscomp$16_response$jscomp$48$$ = $$jscomp$this$jscomp$443$$.element.ownerDocument.createElement("button");
      $interactionId_payload$jscomp$16_response$jscomp$48$$.textContent = "Full Size";
      $vsync$jscomp$3$$.appendChild($interactionId_payload$jscomp$16_response$jscomp$48$$);
      $$jscomp$this$jscomp$443$$.element.appendChild($vsync$jscomp$3$$);
      $$jscomp$this$jscomp$443$$.element.appendChild($iframe$jscomp$38$$);
    }).then(function() {
      return $$jscomp$this$jscomp$443$$.$loadPromise$($iframe$jscomp$38$$).then(function() {
        return _.$JSCompiler_StaticMethods_mutatePromise$$($vsync$jscomp$3$$, function() {
          $$jscomp$this$jscomp$443$$.$iframe_$ && ($$jscomp$this$jscomp$443$$.$iframe_$.classList.add("i-amphtml-apester-iframe-ready"), $media$jscomp$1$$.campaignData && $$jscomp$this$jscomp$443$$.$iframe_$.contentWindow.postMessage({type:"campaigns", data:$media$jscomp$1$$.campaignData}, "*"));
          $$jscomp$this$jscomp$443$$.$togglePlaceholder$(!1);
          var $vsync$jscomp$3$$ = $media$jscomp$1$$.publisher;
          if ($vsync$jscomp$3$$ && $vsync$jscomp$3$$.trackingPixel) {
            var $interactionId_payload$jscomp$16_response$jscomp$48$$ = $vsync$jscomp$3$$.trackingPixel.affiliateId;
            $vsync$jscomp$3$$ = $vsync$jscomp$3$$.publisherId;
            if ($interactionId_payload$jscomp$16_response$jscomp$48$$) {
              var $src$jscomp$22$$ = new _.$CustomEventReporterBuilder$$module$src$extension_analytics$$($$jscomp$this$jscomp$443$$.element);
              $src$jscomp$22$$.track("interactionLoaded", $generatePixelURL$$module$extensions$amp_apester_media$0_1$utils$$($vsync$jscomp$3$$, $interactionId_payload$jscomp$16_response$jscomp$48$$));
              $src$jscomp$22$$.$build$().$trigger$("interactionLoaded");
            }
          }
          $$jscomp$this$jscomp$443$$.$ready_$ = !0;
          $interactionId_payload$jscomp$16_response$jscomp$48$$ = 0;
          $media$jscomp$1$$ && $media$jscomp$1$$.data && $media$jscomp$1$$.data.size && ($interactionId_payload$jscomp$16_response$jscomp$48$$ = $media$jscomp$1$$.data.size.height);
          $interactionId_payload$jscomp$16_response$jscomp$48$$ != $$jscomp$this$jscomp$443$$.$height_$ && ($$jscomp$this$jscomp$443$$.$height_$ = $interactionId_payload$jscomp$16_response$jscomp$48$$, $$jscomp$this$jscomp$443$$.$random_$ ? _.$JSCompiler_StaticMethods_attemptChangeHeight$$($$jscomp$this$jscomp$443$$, $interactionId_payload$jscomp$16_response$jscomp$48$$) : _.$JSCompiler_StaticMethods_changeHeight$$($$jscomp$this$jscomp$443$$, $interactionId_payload$jscomp$16_response$jscomp$48$$));
        });
      });
    }).catch(function($$jscomp$this$jscomp$443$$) {
      _.$dev$$module$src$log$$().error("amp-apester-media", "Display", $$jscomp$this$jscomp$443$$);
    });
  }, function($$jscomp$this$jscomp$443$$) {
    _.$dev$$module$src$log$$().error("amp-apester-media", "Display", $$jscomp$this$jscomp$443$$);
  });
};
_.$JSCompiler_prototypeAlias$$.$createPlaceholderCallback$ = function() {
  var $placeholder$jscomp$7$$ = this.element.ownerDocument.createElement("div"), $img$jscomp$inline_2784$$ = this.element.ownerDocument.createElement("amp-img");
  $img$jscomp$inline_2784$$.setAttribute("src", this.$loaderUrl_$);
  $img$jscomp$inline_2784$$.setAttribute("layout", "fixed");
  $img$jscomp$inline_2784$$.setAttribute("width", "100");
  $img$jscomp$inline_2784$$.setAttribute("height", "100");
  this.element.hasAttribute("aria-label") ? $placeholder$jscomp$7$$.setAttribute("aria-label", "Loading - " + this.element.getAttribute("aria-label")) : $placeholder$jscomp$7$$.setAttribute("aria-label", "Loading Apester Media");
  $placeholder$jscomp$7$$.setAttribute("placeholder", "");
  $placeholder$jscomp$7$$.className = "amp-apester-loader";
  _.$setStyles$$module$src$style$$($img$jscomp$inline_2784$$, {top:"50%", left:"50%", transform:"translate(-50%, -50%)"});
  $placeholder$jscomp$7$$.appendChild($img$jscomp$inline_2784$$);
  return this.$placeholder_$ = $placeholder$jscomp$7$$;
};
_.$JSCompiler_prototypeAlias$$.$unlayoutOnPause$ = function() {
  return !0;
};
_.$JSCompiler_prototypeAlias$$.$unlayoutCallback$ = function() {
  this.$iframe_$ && (this.$intersectionObserverApi_$.$destroy$(), this.$intersectionObserverApi_$ = null, this.$unlisteners_$.forEach(function($unlisten$jscomp$14$$) {
    return $unlisten$jscomp$14$$();
  }), _.$removeElement$$module$src$dom$$(this.$iframe_$), this.$iframe_$ = null);
  this.$placeholder_$ && (_.$removeElement$$module$src$dom$$(this.$placeholder_$), this.$placeholder_$ = null);
  return !1;
};
window.self.AMP.registerElement("amp-apester-media", $AmpApesterMedia$$module$extensions$amp_apester_media$0_1$amp_apester_media$$, ".amp-apester-iframe{-webkit-transition:opacity 0.4s;transition:opacity 0.4s;opacity:0}.i-amphtml-apester-iframe-ready{-webkit-transition:opacity 1s ease-out;transition:opacity 1s ease-out;opacity:1!important}.amp-apester-loader{height:100%;width:100%;background-color:#fff}.amp-apester-container{max-width:700px;margin:0 auto;display:block;position:relative;width:100%}.amp-apester-overflow{position:absolute;margin:auto;top:50%;left:50%;-webkit-transform:translate(-50%,-50%);transform:translate(-50%,-50%)}.amp-apester-overflow button{border:none;background:#fff;cursor:pointer;padding:25px 80px;text-transform:uppercase;letter-spacing:1px;font-weight:700;outline:none;position:relative}.amp-apester-fullscreen{background:rgba(34,36,38,0.97)!important;position:fixed!important;width:100vw!important;height:100vh!important;z-index:2147483646!important;top:0;zoom:1;-webkit-overflow-scrolling:touch!important}\n/*# sourceURL=/extensions/amp-apester-media/0.1/amp-apester-media.css*/");

})});
