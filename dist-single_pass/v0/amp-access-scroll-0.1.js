(self.AMP=self.AMP||[]).push({n:"amp-access-scroll",i:["_base_i","_base_misc"],v:"1901181729101",f:(function(AMP,_){
var $accessConfig$$module$extensions$amp_access_scroll$0_1$scroll_impl$$ = function($connectHostname$$) {
  return {authorization:$connectHostname$$ + "/amp/access?rid=READER_ID&cid=CLIENT_ID(scroll1)&c=CANONICAL_URL&o=AMPDOC_URL&x=QUERY_PARAM(scrollx)", pingback:$connectHostname$$ + "/amp/pingback?rid=READER_ID&cid=CLIENT_ID(scroll1)&c=CANONICAL_URL&o=AMPDOC_URL&r=DOCUMENT_REFERRER&x=QUERY_PARAM(scrollx)&d=AUTHDATA(scroll)&v=AUTHDATA(visitId)", namespace:"scroll"};
}, $devEtld$$module$extensions$amp_access_scroll$0_1$scroll_impl$$ = function($config$jscomp$14$$) {
  return _.$getMode$$module$src$mode$$().$development$ && $config$jscomp$14$$.etld ? $config$jscomp$14$$.etld : "";
}, $connectHostname$$module$extensions$amp_access_scroll$0_1$scroll_impl$$ = function($config$jscomp$15$$) {
  return "https://connect" + ($devEtld$$module$extensions$amp_access_scroll$0_1$scroll_impl$$($config$jscomp$15$$) || ".scroll.com");
}, $scrollHostname$$module$extensions$amp_access_scroll$0_1$scroll_impl$$ = function($config$jscomp$16_devScrollEtld$$) {
  return ($config$jscomp$16_devScrollEtld$$ = $devEtld$$module$extensions$amp_access_scroll$0_1$scroll_impl$$($config$jscomp$16_devScrollEtld$$)) ? "https://scroll" + $config$jscomp$16_devScrollEtld$$ : "https://scroll.com";
}, $ScrollAccessVendor$$module$extensions$amp_access_scroll$0_1$scroll_impl$$ = function($ampdoc$jscomp$112$$, $accessSource$jscomp$3$$) {
  _.$AccessClientAdapter$$module$extensions$amp_access$0_1$amp_access_client$$.call(this, $ampdoc$jscomp$112$$, $accessConfig$$module$extensions$amp_access_scroll$0_1$scroll_impl$$($connectHostname$$module$extensions$amp_access_scroll$0_1$scroll_impl$$($accessSource$jscomp$3$$.$getAdapterConfig$())), {$buildUrl$:$accessSource$jscomp$3$$.$buildUrl$.bind($accessSource$jscomp$3$$), $collectUrlVars$:$accessSource$jscomp$3$$.$collectUrlVars$.bind($accessSource$jscomp$3$$)});
  this.$F$ = $accessSource$jscomp$3$$;
}, $ScrollContentBlocker$$module$extensions$amp_access_scroll$0_1$scroll_impl$$ = function($ampdoc$jscomp$113$$, $accessSource$jscomp$4$$) {
  this.$ampdoc_$ = $ampdoc$jscomp$113$$;
  this.$D$ = $accessSource$jscomp$4$$;
}, $JSCompiler_StaticMethods_ScrollContentBlocker$$module$extensions$amp_access_scroll$0_1$scroll_impl_prototype$check$$ = function($JSCompiler_StaticMethods_ScrollContentBlocker$$module$extensions$amp_access_scroll$0_1$scroll_impl_prototype$check$self$$) {
  _.$JSCompiler_StaticMethods_fetchJson$$(_.$Services$$module$src$services$xhrFor$$($JSCompiler_StaticMethods_ScrollContentBlocker$$module$extensions$amp_access_scroll$0_1$scroll_impl_prototype$check$self$$.$ampdoc_$.$win$), "https://block.scroll.com/check.json").then(function() {
    return !1;
  }, function($JSCompiler_StaticMethods_ScrollContentBlocker$$module$extensions$amp_access_scroll$0_1$scroll_impl_prototype$check$self$$) {
    return 0 === $JSCompiler_StaticMethods_ScrollContentBlocker$$module$extensions$amp_access_scroll$0_1$scroll_impl_prototype$check$self$$.message.indexOf("XHR Failed fetching (https://block.scroll.com/...): Resource blocked by content blocker");
  }).then(function($blockedByScrollApp$$) {
    !0 === $blockedByScrollApp$$ && $JSCompiler_StaticMethods_addActivateButton$$(new $ScrollElement$$module$extensions$amp_access_scroll$0_1$scroll_impl$$($JSCompiler_StaticMethods_ScrollContentBlocker$$module$extensions$amp_access_scroll$0_1$scroll_impl_prototype$check$self$$.$ampdoc_$), $JSCompiler_StaticMethods_ScrollContentBlocker$$module$extensions$amp_access_scroll$0_1$scroll_impl_prototype$check$self$$.$D$, $JSCompiler_StaticMethods_ScrollContentBlocker$$module$extensions$amp_access_scroll$0_1$scroll_impl_prototype$check$self$$.$D$.$getAdapterConfig$());
  });
}, $ScrollElement$$module$extensions$amp_access_scroll$0_1$scroll_impl$$ = function($ampdoc$jscomp$115$$) {
  _.$installStylesForDoc$$module$src$style_installer$$($ampdoc$jscomp$115$$, ".amp-access-scroll-bar{height:44px;position:fixed;left:0;width:100%;background:transparent;z-index:2147483647;bottom:0}.amp-access-scroll-placeholder{padding-top:7px;padding-left:8px;background-color:#fff;border-top:1px solid #eee;border-bottom:1px solid #eee;box-sizing:border-box}\n/*# sourceURL=/extensions/amp-access-scroll/0.1/amp-access-scroll.css*/", function() {
  }, !1, "amp-access-scroll-elt");
  this.$ampdoc_$ = $ampdoc$jscomp$115$$;
  this.$D$ = window.document.createElement("div");
  this.$D$.classList.add("amp-access-scroll-bar");
  this.$iframe_$ = window.document.createElement("iframe");
  this.$iframe_$.setAttribute("scrolling", "no");
  this.$iframe_$.setAttribute("frameborder", "0");
  this.$iframe_$.setAttribute("allowtransparency", "true");
  this.$iframe_$.setAttribute("title", "Scroll");
  this.$iframe_$.setAttribute("width", "100%");
  this.$iframe_$.setAttribute("height", "100%");
  this.$iframe_$.setAttribute("sandbox", "allow-scripts allow-same-origin allow-top-navigation allow-popups allow-popups-to-escape-sandbox");
  this.$D$.appendChild(this.$iframe_$);
  $ampdoc$jscomp$115$$.$getBody$().appendChild(this.$D$);
  _.$JSCompiler_StaticMethods_addToFixedLayer$$(_.$Services$$module$src$services$viewportForDoc$$($ampdoc$jscomp$115$$), this.$D$);
}, $JSCompiler_StaticMethods_handleScrollUser$$ = function($JSCompiler_StaticMethods_handleScrollUser$self$$, $accessSource$jscomp$5$$, $vendorConfig$$) {
  var $placeholder$jscomp$5$$ = window.document.createElement("div");
  $placeholder$jscomp$5$$.classList.add("amp-access-scroll-bar");
  $placeholder$jscomp$5$$.classList.add("amp-access-scroll-placeholder");
  var $img$jscomp$4$$ = window.document.createElement("img");
  $img$jscomp$4$$.setAttribute("src", "https://static.scroll.com/assets/icn-scroll-logo.svg");
  $img$jscomp$4$$.setAttribute("layout", "fixed");
  $img$jscomp$4$$.setAttribute("width", 26);
  $img$jscomp$4$$.setAttribute("height", 26);
  $placeholder$jscomp$5$$.appendChild($img$jscomp$4$$);
  $JSCompiler_StaticMethods_handleScrollUser$self$$.$ampdoc_$.$getBody$().appendChild($placeholder$jscomp$5$$);
  $accessSource$jscomp$5$$.$buildUrl$($connectHostname$$module$extensions$amp_access_scroll$0_1$scroll_impl$$($vendorConfig$$) + "/amp/scrollbar?rid=READER_ID&cid=CLIENT_ID(scroll1)&c=CANONICAL_URL&o=AMPDOC_URL", !1).then(function($accessSource$jscomp$5$$) {
    $JSCompiler_StaticMethods_handleScrollUser$self$$.$iframe_$.onload = function() {
      $JSCompiler_StaticMethods_handleScrollUser$self$$.$ampdoc_$.$getBody$().removeChild($placeholder$jscomp$5$$);
    };
    $JSCompiler_StaticMethods_handleScrollUser$self$$.$iframe_$.setAttribute("src", $accessSource$jscomp$5$$);
  });
}, $JSCompiler_StaticMethods_addActivateButton$$ = function($JSCompiler_StaticMethods_addActivateButton$self$$, $accessSource$jscomp$6$$, $vendorConfig$jscomp$1$$) {
  $accessSource$jscomp$6$$.$buildUrl$($scrollHostname$$module$extensions$amp_access_scroll$0_1$scroll_impl$$($vendorConfig$jscomp$1$$) + "/activateamp?rid=READER_ID&cid=CLIENT_ID(scroll1)&c=CANONICAL_URL&o=AMPDOC_URL&x=QUERY_PARAM(scrollx)", !1).then(function($accessSource$jscomp$6$$) {
    $JSCompiler_StaticMethods_addActivateButton$self$$.$iframe_$.setAttribute("src", $accessSource$jscomp$6$$);
  });
};
_.$$jscomp$inherits$$($ScrollAccessVendor$$module$extensions$amp_access_scroll$0_1$scroll_impl$$, _.$AccessClientAdapter$$module$extensions$amp_access$0_1$amp_access_client$$);
$ScrollAccessVendor$$module$extensions$amp_access_scroll$0_1$scroll_impl$$.prototype.$authorize$ = function() {
  var $$jscomp$this$jscomp$262$$ = this;
  return _.$AccessClientAdapter$$module$extensions$amp_access$0_1$amp_access_client$$.prototype.$authorize$.call(this).then(function($response$jscomp$32$$) {
    var $ampdoc$jscomp$inline_2124_isStory$$ = $$jscomp$this$jscomp$262$$.ampdoc.getRootNode().querySelector("amp-story[standalone]");
    if ($response$jscomp$32$$ && $response$jscomp$32$$.scroll) {
      if (!$ampdoc$jscomp$inline_2124_isStory$$) {
        var $ANALYTICS_CONFIG$jscomp$inline_2130_config$jscomp$17$$ = $$jscomp$this$jscomp$262$$.$F$.$getAdapterConfig$();
        $JSCompiler_StaticMethods_handleScrollUser$$(new $ScrollElement$$module$extensions$amp_access_scroll$0_1$scroll_impl$$($$jscomp$this$jscomp$262$$.ampdoc), $$jscomp$this$jscomp$262$$.$F$, $ANALYTICS_CONFIG$jscomp$inline_2130_config$jscomp$17$$);
        $ampdoc$jscomp$inline_2124_isStory$$ = $$jscomp$this$jscomp$262$$.ampdoc;
        if (!$ANALYTICS_CONFIG$jscomp$inline_2130_config$jscomp$17$$.disableAnalytics) {
          var $doc$jscomp$inline_2126_scriptElem$jscomp$inline_2129$$ = $ampdoc$jscomp$inline_2124_isStory$$.$win$.document, $analyticsElem$jscomp$inline_2128_attributes$jscomp$inline_2127$$ = _.$dict$$module$src$utils$object$$({trigger:"immediate"});
          $ANALYTICS_CONFIG$jscomp$inline_2130_config$jscomp$17$$.dataConsentId && ($analyticsElem$jscomp$inline_2128_attributes$jscomp$inline_2127$$["data-block-on-consent"] = "");
          $analyticsElem$jscomp$inline_2128_attributes$jscomp$inline_2127$$ = _.$createElementWithAttributes$$module$src$dom$$($doc$jscomp$inline_2126_scriptElem$jscomp$inline_2129$$, "amp-analytics", $analyticsElem$jscomp$inline_2128_attributes$jscomp$inline_2127$$);
          $doc$jscomp$inline_2126_scriptElem$jscomp$inline_2129$$ = _.$createElementWithAttributes$$module$src$dom$$($doc$jscomp$inline_2126_scriptElem$jscomp$inline_2129$$, "script", _.$dict$$module$src$utils$object$$({type:"application/json"}));
          $ANALYTICS_CONFIG$jscomp$inline_2130_config$jscomp$17$$ = {requests:{scroll:$connectHostname$$module$extensions$amp_access_scroll$0_1$scroll_impl$$($ANALYTICS_CONFIG$jscomp$inline_2130_config$jscomp$17$$) + "/amp/analytics?rid=ACCESS_READER_ID&cid=CLIENT_ID(scroll1)&c=CANONICAL_URL&o=AMPDOC_URL&r=DOCUMENT_REFERRER&x=QUERY_PARAM(scrollx)&d=AUTHDATA(scroll.scroll)&v=AUTHDATA(scroll.visitId)&h=SOURCE_HOSTNAME&s=${totalEngagedTime}"}, triggers:{trackInterval:{on:"timer", timerSpec:{interval:15, 
          maxTimerLength:7200}, request:"scroll"}}};
          $doc$jscomp$inline_2126_scriptElem$jscomp$inline_2129$$.textContent = JSON.stringify($ANALYTICS_CONFIG$jscomp$inline_2130_config$jscomp$17$$);
          $analyticsElem$jscomp$inline_2128_attributes$jscomp$inline_2127$$.appendChild($doc$jscomp$inline_2126_scriptElem$jscomp$inline_2129$$);
          $analyticsElem$jscomp$inline_2128_attributes$jscomp$inline_2127$$.$ra$ = $ANALYTICS_CONFIG$jscomp$inline_2130_config$jscomp$17$$;
          _.$JSCompiler_StaticMethods_installExtensionForDoc$$(_.$Services$$module$src$services$extensionsFor$$($ampdoc$jscomp$inline_2124_isStory$$.$win$), $ampdoc$jscomp$inline_2124_isStory$$, "amp-analytics");
          $ampdoc$jscomp$inline_2124_isStory$$.$getBody$().appendChild($analyticsElem$jscomp$inline_2128_attributes$jscomp$inline_2127$$);
        }
      }
    } else {
      $response$jscomp$32$$ && $response$jscomp$32$$.$blocker$ && !_.$parseQueryString_$$module$src$url_parse_query_string$$($$jscomp$this$jscomp$262$$.ampdoc.$win$.location.search).scrollnoblockerrefresh && $JSCompiler_StaticMethods_ScrollContentBlocker$$module$extensions$amp_access_scroll$0_1$scroll_impl_prototype$check$$(new $ScrollContentBlocker$$module$extensions$amp_access_scroll$0_1$scroll_impl$$($$jscomp$this$jscomp$262$$.ampdoc, $$jscomp$this$jscomp$262$$.$F$));
    }
    return $response$jscomp$32$$;
  });
};
(function($AMP$jscomp$6$$) {
  $AMP$jscomp$6$$.registerServiceForDoc("scroll", function($AMP$jscomp$6$$) {
    return _.$Services$$module$src$services$accessServiceForDoc$$($AMP$jscomp$6$$.$getHeadNode$()).then(function($ampdoc$jscomp$117$$) {
      $ampdoc$jscomp$117$$ = $ampdoc$jscomp$117$$.$getVendorSource$("scroll");
      var $accessService$jscomp$8_source$jscomp$29$$ = new $ScrollAccessVendor$$module$extensions$amp_access_scroll$0_1$scroll_impl$$($AMP$jscomp$6$$, $ampdoc$jscomp$117$$);
      $ampdoc$jscomp$117$$.$D$.$registerVendor$($accessService$jscomp$8_source$jscomp$29$$);
      return $accessService$jscomp$8_source$jscomp$29$$;
    });
  });
})(window.self.AMP);

})});
