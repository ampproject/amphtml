(self.AMP=self.AMP||[]).push({n:"amp-byside-content",i:["_base_i","_base_misc"],v:"1901181729101",f:(function(AMP,_){
var $AmpBysideContent$$module$extensions$amp_byside_content$0_1$amp_byside_content$$ = function($element$jscomp$371$$) {
  var $$jscomp$super$this$jscomp$27$$ = window.AMP.BaseElement.call(this, $element$jscomp$371$$) || this;
  $$jscomp$super$this$jscomp$27$$.$unlisteners_$ = [];
  $$jscomp$super$this$jscomp$27$$.$iframeSrc_$ = null;
  $$jscomp$super$this$jscomp$27$$.$iframe_$ = null;
  $$jscomp$super$this$jscomp$27$$.$iframePromise_$ = null;
  $$jscomp$super$this$jscomp$27$$.$webcareZone_$ = "main";
  $$jscomp$super$this$jscomp$27$$.$webcareId_$ = "";
  $$jscomp$super$this$jscomp$27$$.$channel_$ = "";
  $$jscomp$super$this$jscomp$27$$.$lang_$ = "";
  $$jscomp$super$this$jscomp$27$$.$fid_$ = "";
  $$jscomp$super$this$jscomp$27$$.$label_$ = "";
  $$jscomp$super$this$jscomp$27$$.$origin_$ = "";
  $$jscomp$super$this$jscomp$27$$.$baseUrl_$ = "";
  $$jscomp$super$this$jscomp$27$$.$boundUpdateSize_$ = _.$debounce$$module$src$utils$rate_limit$$($$jscomp$super$this$jscomp$27$$.$win$, function($element$jscomp$371$$) {
    $$jscomp$super$this$jscomp$27$$.$updateSize_$($element$jscomp$371$$);
  }, 100);
  return $$jscomp$super$this$jscomp$27$$;
}, $JSCompiler_StaticMethods_composeSrcUrl_$$ = function($JSCompiler_StaticMethods_composeSrcUrl_$self$$) {
  var $url$jscomp$180$$ = _.$addParamsToUrl$$module$src$url$$($JSCompiler_StaticMethods_composeSrcUrl_$self$$.$baseUrl_$ + "placeholder.php", _.$dict$$module$src$utils$object$$({label:$JSCompiler_StaticMethods_composeSrcUrl_$self$$.$label_$, webcare_id:$JSCompiler_StaticMethods_composeSrcUrl_$self$$.$webcareId_$, bwch:$JSCompiler_StaticMethods_composeSrcUrl_$self$$.$channel_$ || "", lang:$JSCompiler_StaticMethods_composeSrcUrl_$self$$.$lang_$ || "", fid:$JSCompiler_StaticMethods_composeSrcUrl_$self$$.$fid_$ || 
  "", bwit:$JSCompiler_StaticMethods_composeSrcUrl_$self$$.$fid_$ ? "I" : "A", tuid:"CLIENT_ID(byside_webcare_tuid)", suid:"", puid:"PAGE_VIEW_IDpTIMESTAMP", referrer:"DOCUMENT_REFERRER", page:"SOURCE_URL", amppage:"AMPDOC_URL", bwpt:"TITLE", bres:"VIEWPORT_WIDTHxVIEWPORT_HEIGHT", res:"SCREEN_WIDTHxSCREEN_HEIGHT", v:"v20171116a", ampv:"AMP_VERSION", viewer:"VIEWER", ua:"USER_AGENT", r:"RANDOM", _resize:"1"}));
  return _.$JSCompiler_StaticMethods_expandUrlAsync$$(_.$Services$$module$src$services$urlReplacementsForDoc$$($JSCompiler_StaticMethods_composeSrcUrl_$self$$.element), $url$jscomp$180$$);
}, $JSCompiler_StaticMethods_AmpBysideContent$$module$extensions$amp_byside_content$0_1$amp_byside_content_prototype$getOverflowElement_$$ = function($JSCompiler_StaticMethods_AmpBysideContent$$module$extensions$amp_byside_content$0_1$amp_byside_content_prototype$getOverflowElement_$self_overflow$jscomp$2$$) {
  var $arrow_doc$jscomp$84$$ = $JSCompiler_StaticMethods_AmpBysideContent$$module$extensions$amp_byside_content$0_1$amp_byside_content_prototype$getOverflowElement_$self_overflow$jscomp$2$$.element.ownerDocument;
  $JSCompiler_StaticMethods_AmpBysideContent$$module$extensions$amp_byside_content$0_1$amp_byside_content_prototype$getOverflowElement_$self_overflow$jscomp$2$$ = _.$createElementWithAttributes$$module$src$dom$$($arrow_doc$jscomp$84$$, "div", _.$dict$$module$src$utils$object$$({"class":"i-amphtml-byside-content-overflow", overflow:""}));
  var $overflowContent$$ = _.$createElementWithAttributes$$module$src$dom$$($arrow_doc$jscomp$84$$, "div", _.$dict$$module$src$utils$object$$({"class":"i-amphtml-byside-content-overflow-content"}));
  $arrow_doc$jscomp$84$$ = _.$createElementWithAttributes$$module$src$dom$$($arrow_doc$jscomp$84$$, "div", _.$dict$$module$src$utils$object$$({"class":"i-amphtml-byside-content-arrow-down"}));
  $overflowContent$$.appendChild($arrow_doc$jscomp$84$$);
  $JSCompiler_StaticMethods_AmpBysideContent$$module$extensions$amp_byside_content$0_1$amp_byside_content_prototype$getOverflowElement_$self_overflow$jscomp$2$$.appendChild($overflowContent$$);
  return $JSCompiler_StaticMethods_AmpBysideContent$$module$extensions$amp_byside_content$0_1$amp_byside_content_prototype$getOverflowElement_$self_overflow$jscomp$2$$;
}, $JSCompiler_StaticMethods_createBySideLoader_$$ = function($JSCompiler_StaticMethods_createBySideLoader_$self_loadingContainer$jscomp$1$$) {
  var $doc$jscomp$85_loadingAnimation$$ = $JSCompiler_StaticMethods_createBySideLoader_$self_loadingContainer$jscomp$1$$.element.ownerDocument;
  $JSCompiler_StaticMethods_createBySideLoader_$self_loadingContainer$jscomp$1$$ = _.$createElementWithAttributes$$module$src$dom$$($doc$jscomp$85_loadingAnimation$$, "div", _.$dict$$module$src$utils$object$$({"class":"i-amphtml-byside-content-loading-container"}));
  $doc$jscomp$85_loadingAnimation$$ = _.$createElementWithAttributes$$module$src$dom$$($doc$jscomp$85_loadingAnimation$$, "div", _.$dict$$module$src$utils$object$$({"class":"i-amphtml-byside-content-loading-animation"}));
  $JSCompiler_StaticMethods_createBySideLoader_$self_loadingContainer$jscomp$1$$.appendChild($doc$jscomp$85_loadingAnimation$$);
  return $JSCompiler_StaticMethods_createBySideLoader_$self_loadingContainer$jscomp$1$$;
};
var $iframeCount_$$module$extensions$amp_byside_content$0_1$amp_byside_content$$ = 0;
_.$$jscomp$inherits$$($AmpBysideContent$$module$extensions$amp_byside_content$0_1$amp_byside_content$$, window.AMP.BaseElement);
_.$JSCompiler_prototypeAlias$$ = $AmpBysideContent$$module$extensions$amp_byside_content$0_1$amp_byside_content$$.prototype;
_.$JSCompiler_prototypeAlias$$.$isLayoutSupported$ = function($layout$jscomp$42$$) {
  return _.$isLayoutSizeDefined$$module$src$layout$$($layout$jscomp$42$$);
};
_.$JSCompiler_prototypeAlias$$.$preconnectCallback$ = function($onLayout$jscomp$3$$) {
  this.$origin_$ && this.$preconnect$.url(this.$origin_$, $onLayout$jscomp$3$$);
};
_.$JSCompiler_prototypeAlias$$.$buildCallback$ = function() {
  this.$webcareId_$ = this.element.getAttribute("data-webcare-id");
  this.$label_$ = this.element.getAttribute("data-label");
  this.$webcareZone_$ = this.element.getAttribute("data-webcare-zone") || "main";
  this.$channel_$ = this.element.getAttribute("data-channel") || "";
  this.$lang_$ = this.element.getAttribute("data-lang") || "pt";
  this.$fid_$ = this.element.getAttribute("data-fid") || "";
  this.$origin_$ = "https://" + (0,window.encodeURIComponent)("main" === this.$webcareZone_$ ? "webcare" : this.$webcareZone_$) + ".byside.com";
  this.$baseUrl_$ = this.$origin_$ + "/BWA" + (0,window.encodeURIComponent)(this.$webcareId_$) + "/amp/";
};
_.$JSCompiler_prototypeAlias$$.$createPlaceholderCallback$ = function() {
  var $placeholder$jscomp$9$$ = this.$win$.document.createElement("div");
  $placeholder$jscomp$9$$.setAttribute("placeholder", "");
  $placeholder$jscomp$9$$.appendChild($JSCompiler_StaticMethods_createBySideLoader_$$(this));
  _.$JSCompiler_StaticMethods_applyFillContent$$($placeholder$jscomp$9$$);
  return $placeholder$jscomp$9$$;
};
_.$JSCompiler_prototypeAlias$$.$layoutCallback$ = function() {
  var $$jscomp$this$jscomp$498$$ = this, $iframe$jscomp$43$$ = this.element.ownerDocument.createElement("iframe");
  this.$iframe_$ = $iframe$jscomp$43$$;
  $iframe$jscomp$43$$.name = "amp_byside_content_iframe" + $iframeCount_$$module$extensions$amp_byside_content$0_1$amp_byside_content$$++;
  $iframe$jscomp$43$$.setAttribute("title", this.element.getAttribute("title") || "");
  $iframe$jscomp$43$$.setAttribute("scrolling", "no");
  $iframe$jscomp$43$$.setAttribute("frameborder", "0");
  $iframe$jscomp$43$$.setAttribute("allowtransparency", "true");
  $iframe$jscomp$43$$.setAttribute("allowfullscreen", "true");
  $iframe$jscomp$43$$.setAttribute("sandbox", "allow-scripts allow-same-origin allow-popups");
  _.$setStyles$$module$src$style$$($iframe$jscomp$43$$, {opacity:0});
  this.element.appendChild($JSCompiler_StaticMethods_AmpBysideContent$$module$extensions$amp_byside_content$0_1$amp_byside_content_prototype$getOverflowElement_$$(this));
  _.$JSCompiler_StaticMethods_applyFillContent$$($iframe$jscomp$43$$);
  return $JSCompiler_StaticMethods_composeSrcUrl_$$(this).then(function($src$jscomp$28_unlisten$jscomp$15$$) {
    $$jscomp$this$jscomp$498$$.$iframeSrc_$ = $src$jscomp$28_unlisten$jscomp$15$$;
    $iframe$jscomp$43$$.src = $$jscomp$this$jscomp$498$$.$iframeSrc_$;
    $src$jscomp$28_unlisten$jscomp$15$$ = _.$listenFor$$module$src$iframe_helper$$($iframe$jscomp$43$$, "embed-size", $$jscomp$this$jscomp$498$$.$boundUpdateSize_$);
    $$jscomp$this$jscomp$498$$.$unlisteners_$.push($src$jscomp$28_unlisten$jscomp$15$$);
    $$jscomp$this$jscomp$498$$.element.appendChild($iframe$jscomp$43$$);
    return $$jscomp$this$jscomp$498$$.$iframePromise_$ = $$jscomp$this$jscomp$498$$.$loadPromise$($iframe$jscomp$43$$);
  }).then(function() {
    _.$JSCompiler_StaticMethods_getVsync$$($$jscomp$this$jscomp$498$$).$mutate$(function() {
      _.$setStyles$$module$src$style$$($iframe$jscomp$43$$, {opacity:1});
    });
  });
};
_.$JSCompiler_prototypeAlias$$.$updateSize_$ = function($data$jscomp$116$$) {
  var $$jscomp$this$jscomp$499$$ = this;
  _.$JSCompiler_StaticMethods_getVsync$$(this).measure(function() {
    var $newHeight$jscomp$13$$, $newWidth$jscomp$9$$, $height$jscomp$37_width$jscomp$41$$ = (0,window.parseInt)($data$jscomp$116$$.height, 10);
    (0,window.isNaN)($height$jscomp$37_width$jscomp$41$$) || ($newHeight$jscomp$13$$ = Math.max($height$jscomp$37_width$jscomp$41$$ + ($$jscomp$this$jscomp$499$$.element.offsetHeight - $$jscomp$this$jscomp$499$$.$iframe_$.offsetHeight), $height$jscomp$37_width$jscomp$41$$));
    $height$jscomp$37_width$jscomp$41$$ = (0,window.parseInt)($data$jscomp$116$$.width, 10);
    (0,window.isNaN)($height$jscomp$37_width$jscomp$41$$) || ($newWidth$jscomp$9$$ = Math.max($height$jscomp$37_width$jscomp$41$$ + ($$jscomp$this$jscomp$499$$.element.offsetWidth - $$jscomp$this$jscomp$499$$.$iframe_$.offsetWidth), $height$jscomp$37_width$jscomp$41$$));
    void 0 !== $newHeight$jscomp$13$$ || void 0 !== $newWidth$jscomp$9$$ ? $$jscomp$this$jscomp$499$$.$attemptChangeSize$($newHeight$jscomp$13$$, $newWidth$jscomp$9$$).then(function() {
      void 0 !== $newHeight$jscomp$13$$ && $$jscomp$this$jscomp$499$$.element.setAttribute("height", $newHeight$jscomp$13$$);
      void 0 !== $newWidth$jscomp$9$$ && $$jscomp$this$jscomp$499$$.element.setAttribute("width", $newWidth$jscomp$9$$);
    }, function() {
    }) : _.$user$$module$src$log$$().$Log$$module$src$log_prototype$warn$("amp-byside-content", "Ignoring embed-size request because no width or height value is provided", $$jscomp$this$jscomp$499$$.element);
  });
};
_.$JSCompiler_prototypeAlias$$.$unlayoutCallback$ = function() {
  this.$unlisteners_$.forEach(function($unlisten$jscomp$16$$) {
    return $unlisten$jscomp$16$$();
  });
  this.$unlisteners_$.length = 0;
  this.$iframe_$ && (_.$removeElement$$module$src$dom$$(this.$iframe_$), this.$iframePromise_$ = this.$iframe_$ = null);
  return !0;
};
window.self.AMP.registerElement("amp-byside-content", $AmpBysideContent$$module$extensions$amp_byside_content$0_1$amp_byside_content$$, '.i-amphtml-byside-content-overflow{position:relative;top:100%;width:100%;height:100px;margin-top:-100px;text-align:center;background:-webkit-linear-gradient(top,hsla(0,0%,100%,0),#fff 75%);background:linear-gradient(180deg,hsla(0,0%,100%,0) 0%,#fff 75%)}.i-amphtml-byside-content-overflow,.i-amphtml-byside-content-overflow .i-amphtml-byside-content-overflow-content{display:-webkit-box;display:-ms-flexbox;display:flex;-webkit-box-pack:center;-ms-flex-pack:center;justify-content:center;-webkit-box-align:center;-ms-flex-align:center;align-items:center}.i-amphtml-byside-content-overflow .i-amphtml-byside-content-overflow-content{width:100px;height:30px;border-radius:15px;background-color:#093c71;border:1px solid #093c71;color:#fff}.i-amphtml-byside-content-arrow-down{width:0;height:0;border-left:10px solid transparent;border-right:10px solid transparent;border-top:10px solid #fff}.i-amphtml-byside-content-loading-container{background-color:rgba(0,0,0,0.02);display:-webkit-box;display:-ms-flexbox;display:flex;width:100%;height:100%;-webkit-box-pack:center;-ms-flex-pack:center;justify-content:center;-webkit-box-align:center;-ms-flex-align:center;align-items:center;position:absolute!important;top:0!important;left:0!important;right:0!important;bottom:0!important}.i-amphtml-byside-content-loading-container .i-amphtml-byside-content-loading-animation{display:block;text-align:center;position:relative;height:16px;width:40px;margin:4px auto;background:transparent}.i-amphtml-byside-content-loading-container .i-amphtml-byside-content-loading-animation:after,.i-amphtml-byside-content-loading-container .i-amphtml-byside-content-loading-animation:before{content:"";position:absolute;top:0;left:0;z-index:9;width:16px;height:16px;border-radius:50%;opacity:0.95;-webkit-animation-name:i-amphtml-byside-content-loading-translate,i-amphtml-byside-content-loading-zindex;animation-name:i-amphtml-byside-content-loading-translate,i-amphtml-byside-content-loading-zindex;-webkit-animation-delay:0;animation-delay:0;-webkit-animation-duration:0.8s;animation-duration:0.8s;-webkit-animation-direction:alternate;animation-direction:alternate;-webkit-animation-timing-function:linear;animation-timing-function:linear;-webkit-animation-iteration-count:infinite;animation-iteration-count:infinite}.i-amphtml-byside-content-loading-container .i-amphtml-byside-content-loading-animation:before{background:#093c71}.i-amphtml-byside-content-loading-container .i-amphtml-byside-content-loading-animation:after{background:#e75204;z-index:0;-webkit-animation-name:i-amphtml-byside-content-loading-translate-inverse,i-amphtml-byside-content-loading-zindex-inverse;animation-name:i-amphtml-byside-content-loading-translate-inverse,i-amphtml-byside-content-loading-zindex-inverse;-webkit-animation-delay:0s,0.6s;animation-delay:0s,0.6s}@-webkit-keyframes i-amphtml-byside-content-loading-translate{0%{-webkit-transform:translate(-12px);transform:translate(-12px)}to{-webkit-transform:translate(12px);transform:translate(12px)}}@keyframes i-amphtml-byside-content-loading-translate{0%{-webkit-transform:translate(-12px);transform:translate(-12px)}to{-webkit-transform:translate(12px);transform:translate(12px)}}@-webkit-keyframes i-amphtml-byside-content-loading-zindex{0%{z-index:9}to{z-index:0}}@keyframes i-amphtml-byside-content-loading-zindex{0%{z-index:9}to{z-index:0}}@-webkit-keyframes i-amphtml-byside-content-loading-translate-inverse{0%{-webkit-transform:translate(12px);transform:translate(12px)}to{-webkit-transform:translate(-12px);transform:translate(-12px)}}@keyframes i-amphtml-byside-content-loading-translate-inverse{0%{-webkit-transform:translate(12px);transform:translate(12px)}to{-webkit-transform:translate(-12px);transform:translate(-12px)}}@-webkit-keyframes i-amphtml-byside-content-loading-zindex-inverse{0%{z-index:0}to{z-index:9}}@keyframes i-amphtml-byside-content-loading-zindex-inverse{0%{z-index:0}to{z-index:9}}\n/*# sourceURL=/extensions/amp-byside-content/0.1/amp-byside-content.css*/');

})});
