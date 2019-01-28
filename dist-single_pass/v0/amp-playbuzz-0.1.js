(self.AMP=self.AMP||[]).push({n:"amp-playbuzz",i:["_base_i","_base_media"],v:"1901181729101",f:(function(AMP,_){
var $debounce$$module$extensions$amp_playbuzz$0_1$utils$$ = function($func$jscomp$6$$) {
  var $timeout$jscomp$15$$;
  return function() {
    var $context$jscomp$58$$ = this, $args$jscomp$49$$ = arguments;
    (0,window.clearTimeout)($timeout$jscomp$15$$);
    $timeout$jscomp$15$$ = (0,window.setTimeout)(function() {
      $timeout$jscomp$15$$ = null;
      $func$jscomp$6$$.apply($context$jscomp$58$$, $args$jscomp$49$$);
    }, 100);
  };
}, $getElementCreator$$module$extensions$amp_playbuzz$0_1$utils$$ = function($document$jscomp$12$$) {
  return function($element$jscomp$515_name$jscomp$250$$, $className$jscomp$8$$, $children$jscomp$142$$) {
    $element$jscomp$515_name$jscomp$250$$ = $document$jscomp$12$$.createElement($element$jscomp$515_name$jscomp$250$$);
    $element$jscomp$515_name$jscomp$250$$.className = $className$jscomp$8$$;
    $appendChildren$$module$extensions$amp_playbuzz$0_1$utils$$($element$jscomp$515_name$jscomp$250$$, $children$jscomp$142$$);
    return $element$jscomp$515_name$jscomp$250$$;
  };
}, $appendChildren$$module$extensions$amp_playbuzz$0_1$utils$$ = function($element$jscomp$516$$, $children$jscomp$143$$) {
  $children$jscomp$143$$ = $children$jscomp$143$$ ? Array.isArray($children$jscomp$143$$) ? $children$jscomp$143$$ : [$children$jscomp$143$$] : [];
  $children$jscomp$143$$.forEach(function($children$jscomp$143$$) {
    return $element$jscomp$516$$.appendChild($children$jscomp$143$$);
  });
}, $parsePlaybuzzEventData$$module$extensions$amp_playbuzz$0_1$utils$$ = function($data$jscomp$157$$) {
  if ("object" === typeof $data$jscomp$157$$) {
    return $data$jscomp$157$$;
  }
  var $err$jscomp$46$$ = "error parsing json message from playbuzz item: " + $data$jscomp$157$$;
  try {
    if ("string" === typeof $data$jscomp$157$$) {
      return _.$parseJson$$module$src$json$$($data$jscomp$157$$);
    }
  } catch ($e$282$$) {
    return _.$rethrowAsync$$module$src$log$$("amp-playbuzz", $err$jscomp$46$$, $e$282$$), _.$dict$$module$src$utils$object$$({});
  }
  _.$rethrowAsync$$module$src$log$$("amp-playbuzz", $err$jscomp$46$$, $data$jscomp$157$$);
  return _.$dict$$module$src$utils$object$$({});
}, $AmpPlaybuzz$$module$extensions$amp_playbuzz$0_1$amp_playbuzz$$ = function($$jscomp$super$this$jscomp$82_element$jscomp$518$$) {
  $$jscomp$super$this$jscomp$82_element$jscomp$518$$ = window.AMP.BaseElement.call(this, $$jscomp$super$this$jscomp$82_element$jscomp$518$$) || this;
  $$jscomp$super$this$jscomp$82_element$jscomp$518$$.$iframe_$ = null;
  $$jscomp$super$this$jscomp$82_element$jscomp$518$$.$iframePromise_$ = null;
  $$jscomp$super$this$jscomp$82_element$jscomp$518$$.$itemHeight_$ = 300;
  $$jscomp$super$this$jscomp$82_element$jscomp$518$$.$displayItemInfo_$ = !1;
  $$jscomp$super$this$jscomp$82_element$jscomp$518$$.$displayShareBar_$ = !1;
  $$jscomp$super$this$jscomp$82_element$jscomp$518$$.$displayComments_$ = !1;
  $$jscomp$super$this$jscomp$82_element$jscomp$518$$.$iframeLoaded_$ = !1;
  $$jscomp$super$this$jscomp$82_element$jscomp$518$$.$unlisteners_$ = [];
  $$jscomp$super$this$jscomp$82_element$jscomp$518$$.$iframeSrcUrl_$ = "";
  return $$jscomp$super$this$jscomp$82_element$jscomp$518$$;
}, $JSCompiler_StaticMethods_AmpPlaybuzz$$module$extensions$amp_playbuzz$0_1$amp_playbuzz_prototype$getOverflowElement_$$ = function($JSCompiler_StaticMethods_AmpPlaybuzz$$module$extensions$amp_playbuzz$0_1$amp_playbuzz_prototype$getOverflowElement_$self_overflow$jscomp$3$$) {
  var $arrow$jscomp$1_createElement$jscomp$4$$ = $getElementCreator$$module$extensions$amp_playbuzz$0_1$utils$$($JSCompiler_StaticMethods_AmpPlaybuzz$$module$extensions$amp_playbuzz$0_1$amp_playbuzz_prototype$getOverflowElement_$self_overflow$jscomp$3$$.element.ownerDocument);
  $JSCompiler_StaticMethods_AmpPlaybuzz$$module$extensions$amp_playbuzz$0_1$amp_playbuzz_prototype$getOverflowElement_$self_overflow$jscomp$3$$ = $arrow$jscomp$1_createElement$jscomp$4$$("div", "pb-overflow");
  $JSCompiler_StaticMethods_AmpPlaybuzz$$module$extensions$amp_playbuzz$0_1$amp_playbuzz_prototype$getOverflowElement_$self_overflow$jscomp$3$$.setAttribute("overflow", "");
  var $overflowButton$jscomp$1$$ = $arrow$jscomp$1_createElement$jscomp$4$$("button");
  $overflowButton$jscomp$1$$.textContent = "Show More";
  $arrow$jscomp$1_createElement$jscomp$4$$ = $arrow$jscomp$1_createElement$jscomp$4$$("img", "pb-arrow-down");
  $arrow$jscomp$1_createElement$jscomp$4$$.src = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAQCAYAAAAMJL+VAAAAm0lEQVR4AZ3ORxXCABBF0VGBAfYooaOEXp2kxwOKwg4D9E/vLS9zzt/eN3Y7V/3DEvNUtqznqXXYzALV7elcTQ7TZatMEV+9B2N9MBqPn+tpnpbXCMWfIoFKx0BymH5GOH7d1E6Iq9XfCMfnFqlgh+MRhJvxCMZJhOMosuH4l8hhy3eE4zzCcR7hOI9wHEYoDiIA5xcqb7FyBm4P6hrNHZK+MqYAAAAASUVORK5CYII=";
  $overflowButton$jscomp$1$$.appendChild($arrow$jscomp$1_createElement$jscomp$4$$);
  $JSCompiler_StaticMethods_AmpPlaybuzz$$module$extensions$amp_playbuzz$0_1$amp_playbuzz_prototype$getOverflowElement_$self_overflow$jscomp$3$$.appendChild($overflowButton$jscomp$1$$);
  return $JSCompiler_StaticMethods_AmpPlaybuzz$$module$extensions$amp_playbuzz$0_1$amp_playbuzz_prototype$getOverflowElement_$self_overflow$jscomp$3$$;
}, $JSCompiler_StaticMethods_createPlaybuzzLoader_$$ = function($JSCompiler_StaticMethods_createPlaybuzzLoader_$self_createElement$jscomp$5$$) {
  $JSCompiler_StaticMethods_createPlaybuzzLoader_$self_createElement$jscomp$5$$ = $getElementCreator$$module$extensions$amp_playbuzz$0_1$utils$$($JSCompiler_StaticMethods_createPlaybuzzLoader_$self_createElement$jscomp$5$$.element.ownerDocument);
  var $loaderImage$$ = $JSCompiler_StaticMethods_createPlaybuzzLoader_$self_createElement$jscomp$5$$("img", "pb_feed_anim_mask");
  $loaderImage$$.src = "data:image/png;base64,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";
  return $JSCompiler_StaticMethods_createPlaybuzzLoader_$self_createElement$jscomp$5$$("div", "pb_feed_placeholder_container", $JSCompiler_StaticMethods_createPlaybuzzLoader_$self_createElement$jscomp$5$$("div", "pb_feed_placeholder_inner", $JSCompiler_StaticMethods_createPlaybuzzLoader_$self_createElement$jscomp$5$$("div", "pb_feed_placeholder_content", $JSCompiler_StaticMethods_createPlaybuzzLoader_$self_createElement$jscomp$5$$("div", "pb_feed_placeholder_preloader", $loaderImage$$))));
}, $JSCompiler_StaticMethods_listenToPlaybuzzItemMessage_$$ = function($JSCompiler_StaticMethods_listenToPlaybuzzItemMessage_$self$$, $handler$jscomp$55$$) {
  var $unlisten$jscomp$19$$ = _.$listen$$module$src$event_helper$$($JSCompiler_StaticMethods_listenToPlaybuzzItemMessage_$self$$.$win$, "message", function($unlisten$jscomp$19$$) {
    $JSCompiler_StaticMethods_listenToPlaybuzzItemMessage_$self$$.$iframe_$.contentWindow === $unlisten$jscomp$19$$.source && ($unlisten$jscomp$19$$ = $parsePlaybuzzEventData$$module$extensions$amp_playbuzz$0_1$utils$$($unlisten$jscomp$19$$.data), $unlisten$jscomp$19$$.resize_height && $handler$jscomp$55$$($unlisten$jscomp$19$$.resize_height));
  });
  $JSCompiler_StaticMethods_listenToPlaybuzzItemMessage_$self$$.$unlisteners_$.push($unlisten$jscomp$19$$);
}, $JSCompiler_StaticMethods_generateEmbedSourceUrl_$$ = function($JSCompiler_StaticMethods_generateEmbedSourceUrl_$self$$) {
  var $canonicalUrl$jscomp$9_parsedPageUrl$$ = _.$Services$$module$src$services$documentInfoForDoc$$($JSCompiler_StaticMethods_generateEmbedSourceUrl_$self$$.element).canonicalUrl;
  $canonicalUrl$jscomp$9_parsedPageUrl$$ = _.$parseUrlDeprecated$$module$src$url$$($canonicalUrl$jscomp$9_parsedPageUrl$$);
  var $JSCompiler_object_inline_itemUrl_5559$$ = $JSCompiler_StaticMethods_generateEmbedSourceUrl_$self$$.$iframeSrcUrl_$, $JSCompiler_object_inline_relativeUrl_5560$$ = _.$parseUrlDeprecated$$module$src$url$$($JSCompiler_StaticMethods_generateEmbedSourceUrl_$self$$.$iframeSrcUrl_$).pathname;
  return $JSCompiler_object_inline_itemUrl_5559$$ + "?" + _.$serializeQueryString$$module$src$url$$(_.$dict$$module$src$utils$object$$({feed:!0, implementation:"amp", src:$JSCompiler_object_inline_itemUrl_5559$$, embedBy:"00000000-0000-0000-0000-000000000000", game:$JSCompiler_object_inline_relativeUrl_5560$$, comments:void 0, useComments:$JSCompiler_StaticMethods_generateEmbedSourceUrl_$self$$.$displayComments_$, gameInfo:$JSCompiler_StaticMethods_generateEmbedSourceUrl_$self$$.$displayItemInfo_$, 
  useShares:$JSCompiler_StaticMethods_generateEmbedSourceUrl_$self$$.$displayShareBar_$, socialReferrer:!1, height:"auto", parentUrl:_.$removeFragment$$module$src$url$$($canonicalUrl$jscomp$9_parsedPageUrl$$.href), parentHost:$canonicalUrl$jscomp$9_parsedPageUrl$$.host}));
};
_.$$jscomp$inherits$$($AmpPlaybuzz$$module$extensions$amp_playbuzz$0_1$amp_playbuzz$$, window.AMP.BaseElement);
_.$JSCompiler_prototypeAlias$$ = $AmpPlaybuzz$$module$extensions$amp_playbuzz$0_1$amp_playbuzz$$.prototype;
_.$JSCompiler_prototypeAlias$$.$preconnectCallback$ = function() {
  this.$preconnect$.url(this.$iframeSrcUrl_$);
};
_.$JSCompiler_prototypeAlias$$.$renderOutsideViewport$ = function() {
  return !1;
};
_.$JSCompiler_prototypeAlias$$.$buildCallback$ = function() {
  var $e$jscomp$283$$ = this.element, $JSCompiler_temp$jscomp$5644_localtion$jscomp$inline_6311_src$jscomp$61$$ = $e$jscomp$283$$.getAttribute("src"), $itemId$jscomp$1$$ = $e$jscomp$283$$.getAttribute("data-item");
  $JSCompiler_temp$jscomp$5644_localtion$jscomp$inline_6311_src$jscomp$61$$ && _.$parseUrlDeprecated$$module$src$url$$($JSCompiler_temp$jscomp$5644_localtion$jscomp$inline_6311_src$jscomp$61$$);
  var $parsedHeight$$ = (0,window.parseInt)($e$jscomp$283$$.getAttribute("height"), 10);
  $itemId$jscomp$1$$ ? $JSCompiler_temp$jscomp$5644_localtion$jscomp$inline_6311_src$jscomp$61$$ = "//www.playbuzz.com/item/" + $itemId$jscomp$1$$ : ($JSCompiler_temp$jscomp$5644_localtion$jscomp$inline_6311_src$jscomp$61$$ = _.$parseUrlDeprecated$$module$src$url$$($JSCompiler_temp$jscomp$5644_localtion$jscomp$inline_6311_src$jscomp$61$$), $JSCompiler_temp$jscomp$5644_localtion$jscomp$inline_6311_src$jscomp$61$$ = _.$removeFragment$$module$src$url$$($JSCompiler_temp$jscomp$5644_localtion$jscomp$inline_6311_src$jscomp$61$$.href).replace($JSCompiler_temp$jscomp$5644_localtion$jscomp$inline_6311_src$jscomp$61$$.protocol, 
  ""));
  this.$iframeSrcUrl_$ = $JSCompiler_temp$jscomp$5644_localtion$jscomp$inline_6311_src$jscomp$61$$;
  this.$itemHeight_$ = (0,window.isNaN)($parsedHeight$$) ? this.$itemHeight_$ : $parsedHeight$$;
  this.$displayItemInfo_$ = "true" === $e$jscomp$283$$.getAttribute("data-item-info");
  this.$displayShareBar_$ = "true" === $e$jscomp$283$$.getAttribute("data-share-buttons");
  this.$displayComments_$ = "true" === $e$jscomp$283$$.getAttribute("data-comments");
};
_.$JSCompiler_prototypeAlias$$.$isLayoutSupported$ = function($layout$jscomp$85$$) {
  return "responsive" === $layout$jscomp$85$$ || "fixed-height" === $layout$jscomp$85$$;
};
_.$JSCompiler_prototypeAlias$$.$createPlaceholderCallback$ = function() {
  var $placeholder$jscomp$19$$ = this.$win$.document.createElement("div");
  this.element.hasAttribute("aria-label") ? $placeholder$jscomp$19$$.setAttribute("aria-label", "Loading - " + this.element.getAttribute("aria-label")) : $placeholder$jscomp$19$$.setAttribute("aria-label", "Loading interactive element");
  $placeholder$jscomp$19$$.setAttribute("placeholder", "");
  $placeholder$jscomp$19$$.appendChild($JSCompiler_StaticMethods_createPlaybuzzLoader_$$(this));
  return $placeholder$jscomp$19$$;
};
_.$JSCompiler_prototypeAlias$$.$layoutCallback$ = function() {
  var $iframe$jscomp$74$$ = this.element.ownerDocument.createElement("iframe");
  this.$iframe_$ = $iframe$jscomp$74$$;
  $iframe$jscomp$74$$.setAttribute("scrolling", "no");
  $iframe$jscomp$74$$.setAttribute("frameborder", "0");
  $iframe$jscomp$74$$.setAttribute("allowtransparency", "true");
  $iframe$jscomp$74$$.setAttribute("allowfullscreen", "true");
  $iframe$jscomp$74$$.src = $JSCompiler_StaticMethods_generateEmbedSourceUrl_$$(this);
  $JSCompiler_StaticMethods_listenToPlaybuzzItemMessage_$$(this, $debounce$$module$extensions$amp_playbuzz$0_1$utils$$(this.$itemHeightChanged_$.bind(this)));
  this.element.appendChild($JSCompiler_StaticMethods_AmpPlaybuzz$$module$extensions$amp_playbuzz$0_1$amp_playbuzz_prototype$getOverflowElement_$$(this));
  _.$JSCompiler_StaticMethods_applyFillContent$$($iframe$jscomp$74$$);
  this.element.appendChild($iframe$jscomp$74$$);
  return this.$iframePromise_$ = this.$loadPromise$($iframe$jscomp$74$$).then(function() {
    this.$iframeLoaded_$ = !0;
    _.$JSCompiler_StaticMethods_attemptChangeHeight$$(this, this.$itemHeight_$).catch(function() {
    });
    var $iframe$jscomp$74$$ = _.$JSCompiler_StaticMethods_onChanged$$(this.$getViewport$(), this.$sendScrollDataToItem_$.bind(this));
    this.$unlisteners_$.push($iframe$jscomp$74$$);
  }.bind(this));
};
_.$JSCompiler_prototypeAlias$$.$itemHeightChanged_$ = function($height$jscomp$54$$) {
  (0,window.isNaN)($height$jscomp$54$$) || $height$jscomp$54$$ === this.$itemHeight_$ || (this.$itemHeight_$ = $height$jscomp$54$$, this.$iframeLoaded_$ && _.$JSCompiler_StaticMethods_attemptChangeHeight$$(this, this.$itemHeight_$).catch(function() {
  }));
};
_.$JSCompiler_prototypeAlias$$.$sendScrollDataToItem_$ = function($changeEvent_data$jscomp$inline_3840_scrollingData$$) {
  this.$isInViewport$() && ($changeEvent_data$jscomp$inline_3840_scrollingData$$ = _.$dict$$module$src$utils$object$$({event:"scroll", windowHeight:$changeEvent_data$jscomp$inline_3840_scrollingData$$.height, scroll:$changeEvent_data$jscomp$inline_3840_scrollingData$$.top, offsetTop:this.$getLayoutBox$().top}), $changeEvent_data$jscomp$inline_3840_scrollingData$$ = JSON.stringify($changeEvent_data$jscomp$inline_3840_scrollingData$$), this.$iframe_$.contentWindow.postMessage($changeEvent_data$jscomp$inline_3840_scrollingData$$, 
  "*"));
};
_.$JSCompiler_prototypeAlias$$.$unlayoutOnPause$ = function() {
  return !0;
};
_.$JSCompiler_prototypeAlias$$.$unlayoutCallback$ = function() {
  this.$unlisteners_$.forEach(function($unlisten$jscomp$20$$) {
    return $unlisten$jscomp$20$$();
  });
  this.$unlisteners_$.length = 0;
  this.$iframe_$ && (_.$removeElement$$module$src$dom$$(this.$iframe_$), this.$iframePromise_$ = this.$iframe_$ = null);
  return !0;
};
window.self.AMP.registerElement("amp-playbuzz", $AmpPlaybuzz$$module$extensions$amp_playbuzz$0_1$amp_playbuzz$$, ".pb-overflow[overflow]{width:100%;height:150px;position:absolute;bottom:0;text-align:center;background:-webkit-linear-gradient(top,hsla(0,0%,100%,0),#fff 75%);background:linear-gradient(180deg,hsla(0,0%,100%,0) 0%,#fff 75%)}.pb-overflow button{width:140px;height:37px;position:absolute;bottom:0;left:50%;margin-left:-70px;border-radius:4px;background-color:#fff;border:1px solid #009cff;color:#009cff;font-weight:700;font-family:Helvetica,Roboto,Arial,sans-serif;cursor:pointer}.pb-arrow-down{height:8px;margin-left:10px}.pb_feed_placeholder_container{width:100%;height:100%}.pb_feed_placeholder_container{direction:ltr}.pb_feed_placeholder_inner{position:relative;width:100%;height:100%;margin:auto}.pb_feed_placeholder_content{width:100%;height:100%;background-color:#f2f2f2;border-radius:5px}.pb_feed_placeholder_preloader{position:absolute;top:47%;left:50%;width:29px;height:38px;margin-top:-36px;margin-left:-15px;overflow:hidden;box-sizing:border-box}@media screen and (max-width:568px){.pb_feed_placeholder_preloader{top:46%}}@media screen and (min-width:569px) and (max-width:992px){.pb_feed_placeholder_preloader{top:48%}}.pb_feed_anim_mask{position:absolute;width:30px;top:0;left:0}.pb_feed_loading_text{position:absolute;font-family:arial;font-size:11px;color:#aaa;text-align:center;width:100%;top:51%;direction:ltr}\n/*# sourceURL=/extensions/amp-playbuzz/0.1/amp-playbuzz.css*/");

})});
