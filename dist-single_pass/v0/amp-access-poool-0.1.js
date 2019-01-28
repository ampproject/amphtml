(self.AMP=self.AMP||[]).push({n:"amp-access-poool",i:["_base_i","_base_misc"],v:"1901181729101",f:(function(AMP,_){
var $PooolVendor$$module$extensions$amp_access_poool$0_1$poool_impl$$ = function($accessService$jscomp$6$$, $accessSource$jscomp$2$$) {
  this.ampdoc = $accessService$jscomp$6$$.ampdoc;
  this.$F$ = $accessSource$jscomp$2$$;
  this.$I$ = $ACCESS_CONFIG$$module$extensions$amp_access_poool$0_1$poool_impl$$.authorization;
  this.$J$ = $ACCESS_CONFIG$$module$extensions$amp_access_poool$0_1$poool_impl$$.iframe;
  this.$timer_$ = _.$Services$$module$src$services$timerFor$$(this.ampdoc.$win$);
  this.$xhr_$ = _.$Services$$module$src$services$xhrFor$$(this.ampdoc.$win$);
  this.$D$ = this.$F$.$getAdapterConfig$();
  this.$K$ = this.$D$.itemID || "";
  this.$iframe_$ = window.document.createElement("iframe");
  this.$iframe_$.setAttribute("id", "poool-iframe");
  this.$iframe_$.setAttribute("scrolling", "no");
  this.$iframe_$.setAttribute("frameborder", "0");
  _.$setStyle$$module$src$style$$(this.$iframe_$, "width", "100%");
  "unlock" == this.$D$.forceWidget ? _.$setStyles$$module$src$style$$(this.$iframe_$, {height:"250px", position:"fixed", bottom:"0"}) : _.$setStyles$$module$src$style$$(this.$iframe_$, {height:"500px", transform:"translateY(-70px)"});
}, $JSCompiler_StaticMethods_getPooolAccess_$$ = function($JSCompiler_StaticMethods_getPooolAccess_$self$$) {
  var $url$jscomp$122$$ = _.$addParamToUrl$$module$src$url$$($JSCompiler_StaticMethods_getPooolAccess_$self$$.$I$, "iid", $JSCompiler_StaticMethods_getPooolAccess_$self$$.$K$);
  return $JSCompiler_StaticMethods_getPooolAccess_$self$$.$F$.$buildUrl$($url$jscomp$122$$, !1).then(function($url$jscomp$122$$) {
    return $JSCompiler_StaticMethods_getPooolAccess_$self$$.$F$.$AccessSource$$module$extensions$amp_access$0_1$amp_access_source_prototype$getLoginUrl$($url$jscomp$122$$);
  }).then(function($url$jscomp$122$$) {
    _.$dev$$module$src$log$$().$Log$$module$src$log_prototype$info$("amp-access-poool", "Authorization URL: ", $url$jscomp$122$$);
    return _.$JSCompiler_StaticMethods_timeoutPromise$$($JSCompiler_StaticMethods_getPooolAccess_$self$$.$timer_$, 3000, _.$JSCompiler_StaticMethods_fetchJson$$($JSCompiler_StaticMethods_getPooolAccess_$self$$.$xhr_$, $url$jscomp$122$$)).then(function($JSCompiler_StaticMethods_getPooolAccess_$self$$) {
      return $JSCompiler_StaticMethods_getPooolAccess_$self$$.json();
    });
  });
}, $JSCompiler_StaticMethods_renderPoool_$$ = function($JSCompiler_StaticMethods_renderPoool_$self$$) {
  var $pooolContainer$$ = window.document.getElementById("poool");
  $JSCompiler_StaticMethods_renderPoool_$self$$.$F$.$buildUrl$(_.$addParamsToUrl$$module$src$url$$($JSCompiler_StaticMethods_renderPoool_$self$$.$J$, _.$dict$$module$src$utils$object$$({bi:$JSCompiler_StaticMethods_renderPoool_$self$$.$D$.bundleID, iid:$JSCompiler_StaticMethods_renderPoool_$self$$.$D$.itemID, ce:$JSCompiler_StaticMethods_renderPoool_$self$$.$D$.cookiesEnabled, d:"undefined" !== typeof $JSCompiler_StaticMethods_renderPoool_$self$$.$D$.debug && null !== $JSCompiler_StaticMethods_renderPoool_$self$$.$D$.debug ? 
  $JSCompiler_StaticMethods_renderPoool_$self$$.$D$.debug : _.$getMode$$module$src$mode$$().$development$ || !1, fw:$JSCompiler_StaticMethods_renderPoool_$self$$.$D$.forceWidget, cs:$JSCompiler_StaticMethods_renderPoool_$self$$.$D$.customSegment})), !1).then(function($url$jscomp$125$$) {
    $JSCompiler_StaticMethods_renderPoool_$self$$.$iframe_$.src = $url$jscomp$125$$;
    _.$listenFor$$module$src$iframe_helper$$($JSCompiler_StaticMethods_renderPoool_$self$$.$iframe_$, "release", $JSCompiler_StaticMethods_renderPoool_$self$$.$O$.bind($JSCompiler_StaticMethods_renderPoool_$self$$));
    _.$listenFor$$module$src$iframe_helper$$($JSCompiler_StaticMethods_renderPoool_$self$$.$iframe_$, "resize", $JSCompiler_StaticMethods_renderPoool_$self$$.$G$.bind($JSCompiler_StaticMethods_renderPoool_$self$$));
    $pooolContainer$$.appendChild($JSCompiler_StaticMethods_renderPoool_$self$$.$iframe_$);
  });
}, $ACCESS_CONFIG$$module$extensions$amp_access_poool$0_1$poool_impl$$ = {authorization:"https://api.poool.fr/api/v2/amp/access?rid=READER_ID", iframe:"https://assets.poool.fr/amp.html?rid=READER_ID&c=CANONICAL_URL&o=AMPDOC_URL&r=DOCUMENT_REFERRER"};
$PooolVendor$$module$extensions$amp_access_poool$0_1$poool_impl$$.prototype.$authorize$ = function() {
  var $$jscomp$this$jscomp$259$$ = this;
  return $JSCompiler_StaticMethods_getPooolAccess_$$(this).then(function($$jscomp$this$jscomp$259$$) {
    return {$access$:$$jscomp$this$jscomp$259$$.$access$};
  }, function($err$jscomp$30$$) {
    if (!$err$jscomp$30$$ || !$err$jscomp$30$$.response) {
      throw $err$jscomp$30$$;
    }
    if (402 !== $err$jscomp$30$$.response.status) {
      throw $err$jscomp$30$$;
    }
    $JSCompiler_StaticMethods_renderPoool_$$($$jscomp$this$jscomp$259$$);
    return {$access$:!1};
  });
};
$PooolVendor$$module$extensions$amp_access_poool$0_1$poool_impl$$.prototype.$O$ = function() {
  window.document.querySelector("[poool-access-preview]").setAttribute("amp-access-hide", "");
  window.document.querySelector("[poool-access-content]").removeAttribute("amp-access-hide");
  _.$resetStyles$$module$src$style$$(this.$iframe_$, ["transform"]);
};
$PooolVendor$$module$extensions$amp_access_poool$0_1$poool_impl$$.prototype.$G$ = function($msg$$) {
  _.$setStyle$$module$src$style$$(this.$iframe_$, "height", $msg$$.height);
};
$PooolVendor$$module$extensions$amp_access_poool$0_1$poool_impl$$.prototype.$AccessClientAdapter$$module$extensions$amp_access$0_1$amp_access_client_prototype$pingback$ = function() {
  return window.Promise.resolve();
};
(function($AMP$jscomp$5$$) {
  $AMP$jscomp$5$$.registerServiceForDoc("poool", function($AMP$jscomp$5$$) {
    return _.$Services$$module$src$services$accessServiceForDoc$$($AMP$jscomp$5$$.$getHeadNode$()).then(function($AMP$jscomp$5$$) {
      var $ampdoc$jscomp$111$$ = $AMP$jscomp$5$$.$getVendorSource$("poool");
      $AMP$jscomp$5$$ = new $PooolVendor$$module$extensions$amp_access_poool$0_1$poool_impl$$($AMP$jscomp$5$$, $ampdoc$jscomp$111$$);
      $ampdoc$jscomp$111$$.$D$.$registerVendor$($AMP$jscomp$5$$);
      return $AMP$jscomp$5$$;
    });
  });
})(window.self.AMP);

})});
