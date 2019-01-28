(self.AMP=self.AMP||[]).push({n:"amp-vk",i:["_base_i","_base_misc"],v:"1901181729101",f:(function(AMP,_){
var $AmpVk$$module$extensions$amp_vk$0_1$amp_vk$$ = function($$jscomp$super$this$jscomp$118_element$jscomp$701$$) {
  $$jscomp$super$this$jscomp$118_element$jscomp$701$$ = window.AMP.BaseElement.call(this, $$jscomp$super$this$jscomp$118_element$jscomp$701$$) || this;
  $$jscomp$super$this$jscomp$118_element$jscomp$701$$.$iframe_$ = null;
  $$jscomp$super$this$jscomp$118_element$jscomp$701$$.$widgetHeight_$ = 0;
  $$jscomp$super$this$jscomp$118_element$jscomp$701$$.$unlistenMessage_$ = null;
  $$jscomp$super$this$jscomp$118_element$jscomp$701$$.$embedType_$ = null;
  $$jscomp$super$this$jscomp$118_element$jscomp$701$$.$ownerId_$ = null;
  $$jscomp$super$this$jscomp$118_element$jscomp$701$$.$postId_$ = null;
  $$jscomp$super$this$jscomp$118_element$jscomp$701$$.$hash_$ = null;
  $$jscomp$super$this$jscomp$118_element$jscomp$701$$.$apiId_$ = null;
  $$jscomp$super$this$jscomp$118_element$jscomp$701$$.$pollId_$ = null;
  return $$jscomp$super$this$jscomp$118_element$jscomp$701$$;
}, $JSCompiler_StaticMethods_getIFrameSrc_$$ = function($JSCompiler_StaticMethods_getIFrameSrc_$self$$) {
  var $createdTime$jscomp$2$$ = Date.now().toString(16), $iframeSrcPromise$$;
  "post" === $JSCompiler_StaticMethods_getIFrameSrc_$self$$.$embedType_$ ? $iframeSrcPromise$$ = $JSCompiler_StaticMethods_getVkPostIFrameSrc_$$($JSCompiler_StaticMethods_getIFrameSrc_$self$$) : "poll" === $JSCompiler_StaticMethods_getIFrameSrc_$self$$.$embedType_$ && ($iframeSrcPromise$$ = $JSCompiler_StaticMethods_getVkPollIFrameSrc_$$($JSCompiler_StaticMethods_getIFrameSrc_$self$$));
  return $iframeSrcPromise$$.then(function($JSCompiler_StaticMethods_getIFrameSrc_$self$$) {
    return _.$appendEncodedParamStringToUrl$$module$src$url$$($JSCompiler_StaticMethods_getIFrameSrc_$self$$, $createdTime$jscomp$2$$);
  });
}, $JSCompiler_StaticMethods_getVkPostIFrameSrc_$$ = function($JSCompiler_StaticMethods_getVkPostIFrameSrc_$self$$) {
  return _.$Services$$module$src$services$viewerForDoc$$($JSCompiler_StaticMethods_getVkPostIFrameSrc_$self$$.element).$I$.then(function($ref$jscomp$4$$) {
    var $startWidth$$ = $JSCompiler_StaticMethods_getVkPostIFrameSrc_$self$$.element.offsetWidth, $pageUrl$jscomp$6$$ = $JSCompiler_StaticMethods_getVkPostIFrameSrc_$self$$.$getAmpDoc$().$AmpDoc$$module$src$service$ampdoc_impl_prototype$getUrl$();
    return _.$addParamsToUrl$$module$src$url$$("https://vk.com/widget_post.php", _.$dict$$module$src$utils$object$$({app:"0", width:"100%", _ver:"1", owner_id:$JSCompiler_StaticMethods_getVkPostIFrameSrc_$self$$.$ownerId_$, post_id:$JSCompiler_StaticMethods_getVkPostIFrameSrc_$self$$.$postId_$, hash:$JSCompiler_StaticMethods_getVkPostIFrameSrc_$self$$.$hash_$, amp:"1", startWidth:$startWidth$$, url:$pageUrl$jscomp$6$$, referrer:$ref$jscomp$4$$, title:"AMP Post"}));
  });
}, $JSCompiler_StaticMethods_getVkPollIFrameSrc_$$ = function($JSCompiler_StaticMethods_getVkPollIFrameSrc_$self$$) {
  return _.$Services$$module$src$services$viewerForDoc$$($JSCompiler_StaticMethods_getVkPollIFrameSrc_$self$$.element).$I$.then(function($ref$jscomp$5$$) {
    var $pageUrl$jscomp$7$$ = $JSCompiler_StaticMethods_getVkPollIFrameSrc_$self$$.$getAmpDoc$().$AmpDoc$$module$src$service$ampdoc_impl_prototype$getUrl$();
    return _.$addParamsToUrl$$module$src$url$$("https://vk.com/al_widget_poll.php", _.$dict$$module$src$utils$object$$({app:$JSCompiler_StaticMethods_getVkPollIFrameSrc_$self$$.$apiId_$, width:"100%", _ver:"1", poll_id:$JSCompiler_StaticMethods_getVkPollIFrameSrc_$self$$.$pollId_$, amp:"1", url:$pageUrl$jscomp$7$$, title:"AMP Poll", description:"", referrer:$ref$jscomp$5$$}));
  });
}, $EmbedType$$module$extensions$amp_vk$0_1$amp_vk$$ = {$POST$:"post", $POLL$:"poll"};
_.$$jscomp$inherits$$($AmpVk$$module$extensions$amp_vk$0_1$amp_vk$$, window.AMP.BaseElement);
_.$JSCompiler_prototypeAlias$$ = $AmpVk$$module$extensions$amp_vk$0_1$amp_vk$$.prototype;
_.$JSCompiler_prototypeAlias$$.$preconnectCallback$ = function($opt_onLayout$jscomp$31$$) {
  this.$preconnect$.url("https://vk.com", $opt_onLayout$jscomp$31$$);
};
_.$JSCompiler_prototypeAlias$$.$buildCallback$ = function() {
  this.$embedType_$ = this.element.getAttribute("data-embedtype");
  _.$JSCompiler_StaticMethods_assertEnumValue$$(_.$user$$module$src$log$$(), $EmbedType$$module$extensions$amp_vk$0_1$amp_vk$$, this.$embedType_$, "data-embedtype");
  "post" === this.$embedType_$ ? (this.$ownerId_$ = this.element.getAttribute("data-owner-id"), this.$postId_$ = this.element.getAttribute("data-post-id"), this.$hash_$ = this.element.getAttribute("data-hash")) : "poll" === this.$embedType_$ && (this.$apiId_$ = this.element.getAttribute("data-api-id"), this.$pollId_$ = this.element.getAttribute("data-poll-id"));
};
_.$JSCompiler_prototypeAlias$$.$layoutCallback$ = function() {
  var $$jscomp$this$jscomp$1336$$ = this, $iframe$jscomp$99$$ = this.element.ownerDocument.createElement("iframe");
  this.$iframe_$ = $iframe$jscomp$99$$;
  this.$unlistenMessage_$ = _.$listen$$module$src$event_helper$$(this.$win$, "message", this.$handleVkIframeMessage_$.bind(this));
  return $JSCompiler_StaticMethods_getIFrameSrc_$$(this).then(function($src$jscomp$74$$) {
    $iframe$jscomp$99$$.src = $src$jscomp$74$$;
    $iframe$jscomp$99$$.setAttribute("name", "fXD");
    $iframe$jscomp$99$$.setAttribute("scrolling", "no");
    $iframe$jscomp$99$$.setAttribute("frameborder", "0");
    $iframe$jscomp$99$$.setAttribute("allowfullscreen", "true");
    _.$JSCompiler_StaticMethods_applyFillContent$$($iframe$jscomp$99$$);
    $$jscomp$this$jscomp$1336$$.element.appendChild($iframe$jscomp$99$$);
    return $$jscomp$this$jscomp$1336$$.$loadPromise$($iframe$jscomp$99$$);
  });
};
_.$JSCompiler_prototypeAlias$$.$handleVkIframeMessage_$ = function($e$jscomp$357_eventData$jscomp$23_matches$jscomp$24_newHeight$jscomp$17$$) {
  "https://vk.com" === $e$jscomp$357_eventData$jscomp$23_matches$jscomp$24_newHeight$jscomp$17$$.origin && $e$jscomp$357_eventData$jscomp$23_matches$jscomp$24_newHeight$jscomp$17$$.source === this.$iframe_$.contentWindow && ($e$jscomp$357_eventData$jscomp$23_matches$jscomp$24_newHeight$jscomp$17$$ = $e$jscomp$357_eventData$jscomp$23_matches$jscomp$24_newHeight$jscomp$17$$.data) && ($e$jscomp$357_eventData$jscomp$23_matches$jscomp$24_newHeight$jscomp$17$$ = /\["resize",\[(\d+)\]]/.exec($e$jscomp$357_eventData$jscomp$23_matches$jscomp$24_newHeight$jscomp$17$$)) && 
  $e$jscomp$357_eventData$jscomp$23_matches$jscomp$24_newHeight$jscomp$17$$[1] && ($e$jscomp$357_eventData$jscomp$23_matches$jscomp$24_newHeight$jscomp$17$$ = (0,window.parseInt)($e$jscomp$357_eventData$jscomp$23_matches$jscomp$24_newHeight$jscomp$17$$[1], 10), this.$widgetHeight_$ !== $e$jscomp$357_eventData$jscomp$23_matches$jscomp$24_newHeight$jscomp$17$$ && (this.$widgetHeight_$ = $e$jscomp$357_eventData$jscomp$23_matches$jscomp$24_newHeight$jscomp$17$$, _.$JSCompiler_StaticMethods_changeHeight$$(this, 
  $e$jscomp$357_eventData$jscomp$23_matches$jscomp$24_newHeight$jscomp$17$$)));
};
_.$JSCompiler_prototypeAlias$$.$isLayoutSupported$ = function($layout$jscomp$113$$) {
  return "responsive" === $layout$jscomp$113$$ || "flex-item" === $layout$jscomp$113$$ || "fixed" === $layout$jscomp$113$$;
};
_.$JSCompiler_prototypeAlias$$.$unlayoutOnPause$ = function() {
  return !0;
};
_.$JSCompiler_prototypeAlias$$.$unlayoutCallback$ = function() {
  this.$iframe_$ && (_.$removeElement$$module$src$dom$$(this.$iframe_$), this.$iframe_$ = null);
  this.$unlistenMessage_$ && this.$unlistenMessage_$();
  return !0;
};
window.self.AMP.registerElement("amp-vk", $AmpVk$$module$extensions$amp_vk$0_1$amp_vk$$);

})});
