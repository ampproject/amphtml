(self.AMP=self.AMP||[]).push({n:"amp-next-page",i:["_base_i","_base_misc"],v:"1901181729101",f:(function(AMP,_){
var $assertConfig$$module$extensions$amp_next_page$0_1$config$$ = function($context$jscomp$54$$, $config$jscomp$73$$, $documentUrl$$) {
  $assertRecos$$module$extensions$amp_next_page$0_1$config$$($context$jscomp$54$$, $config$jscomp$73$$.$pages$, $documentUrl$$);
  "hideSelectors" in $config$jscomp$73$$ && $assertSelectors$$module$extensions$amp_next_page$0_1$config$$($config$jscomp$73$$.hideSelectors);
  return $config$jscomp$73$$;
}, $assertRecos$$module$extensions$amp_next_page$0_1$config$$ = function($context$jscomp$55$$, $recos$$, $documentUrl$jscomp$1$$) {
  $recos$$.forEach(function($recos$$) {
    _.$JSCompiler_StaticMethods_assertString$$(_.$user$$module$src$log$$(), $recos$$.$ampUrl$, "ampUrl must be a string");
    var $reco$$ = _.$getSourceUrl$$module$src$url$$($documentUrl$jscomp$1$$);
    $recos$$.$ampUrl$ = _.$resolveRelativeUrl$$module$src$url$$($recos$$.$ampUrl$, $reco$$);
    var $origin$jscomp$inline_3727_urlService$jscomp$inline_3725$$ = _.$Services$$module$src$services$urlForDoc$$($context$jscomp$55$$);
    $reco$$ = $origin$jscomp$inline_3727_urlService$jscomp$inline_3725$$.parse($recos$$.$ampUrl$);
    $origin$jscomp$inline_3727_urlService$jscomp$inline_3725$$ = $origin$jscomp$inline_3727_urlService$jscomp$inline_3725$$.parse($documentUrl$jscomp$1$$).origin;
    var $sourceOrigin$jscomp$inline_3728$$ = _.$getSourceOrigin$$module$src$url$$($documentUrl$jscomp$1$$);
    _.$JSCompiler_StaticMethods_assertString$$(_.$user$$module$src$log$$(), $recos$$.$image$, "image must be a string");
    _.$JSCompiler_StaticMethods_assertString$$(_.$user$$module$src$log$$(), $recos$$.title, "title must be a string");
    $sourceOrigin$jscomp$inline_3728$$ !== $origin$jscomp$inline_3727_urlService$jscomp$inline_3725$$ && $reco$$.origin === $sourceOrigin$jscomp$inline_3728$$ && ($recos$$.$ampUrl$ = $origin$jscomp$inline_3727_urlService$jscomp$inline_3725$$ + "/c/" + ("https:" === $reco$$.protocol ? "s/" : "") + (0,window.encodeURIComponent)($reco$$.host) + $reco$$.pathname + ($reco$$.search || "") + ($reco$$.hash || ""));
  });
}, $assertSelectors$$module$extensions$amp_next_page$0_1$config$$ = function($selectors$jscomp$11$$) {
  $selectors$jscomp$11$$.forEach(function($selectors$jscomp$11$$) {
    $BANNED_SELECTOR_PATTERNS$$module$extensions$amp_next_page$0_1$config$$.forEach(function() {
      _.$JSCompiler_StaticMethods_assertString$$(_.$user$$module$src$log$$(), $selectors$jscomp$11$$, "amp-next-page hideSelector value should be a string");
    });
  });
}, $NextPageService$$module$extensions$amp_next_page$0_1$next_page_service$$ = function() {
  this.$U$ = this.$O$ = this.$W$ = this.$config_$ = this.$xhr_$ = this.$element_$ = this.$D$ = null;
  this.$G$ = 0;
  this.$J$ = !1;
  this.$positionObserver_$ = this.$viewport_$ = this.$V$ = null;
  this.$F$ = [];
  this.$K$ = null;
  this.$P$ = function() {
  };
  this.$I$ = null;
  this.$origin_$ = "";
}, $JSCompiler_StaticMethods_setAppendPageHandler$$ = function($JSCompiler_StaticMethods_setAppendPageHandler$self$$, $handler$jscomp$52$$) {
  $JSCompiler_StaticMethods_setAppendPageHandler$self$$.$P$ = $handler$jscomp$52$$;
}, $JSCompiler_StaticMethods_createDefaultSeparator_$$ = function($JSCompiler_StaticMethods_createDefaultSeparator_$self_separator$jscomp$2$$) {
  $JSCompiler_StaticMethods_createDefaultSeparator_$self_separator$jscomp$2$$ = $JSCompiler_StaticMethods_createDefaultSeparator_$self_separator$jscomp$2$$.$D$.document.createElement("div");
  $JSCompiler_StaticMethods_createDefaultSeparator_$self_separator$jscomp$2$$.classList.add("amp-next-page-default-separator");
  return $JSCompiler_StaticMethods_createDefaultSeparator_$self_separator$jscomp$2$$;
}, $JSCompiler_StaticMethods_appendNextArticle_$$ = function($JSCompiler_StaticMethods_appendNextArticle_$self$$) {
  if ($JSCompiler_StaticMethods_appendNextArticle_$self$$.$G$ < $JSCompiler_StaticMethods_appendNextArticle_$self$$.$config_$.$pages$.length) {
    var $next$jscomp$6$$ = $JSCompiler_StaticMethods_appendNextArticle_$self$$.$config_$.$pages$[$JSCompiler_StaticMethods_appendNextArticle_$self$$.$G$], $documentRef$jscomp$1$$ = $createDocumentRef$$module$extensions$amp_next_page$0_1$next_page_service$$($next$jscomp$6$$.$ampUrl$);
    $JSCompiler_StaticMethods_appendNextArticle_$self$$.$F$.push($documentRef$jscomp$1$$);
    var $container$jscomp$26$$ = $JSCompiler_StaticMethods_appendNextArticle_$self$$.$D$.document.createElement("div"), $separator$jscomp$3$$ = $JSCompiler_StaticMethods_appendNextArticle_$self$$.$W$.cloneNode(!0);
    $separator$jscomp$3$$.removeAttribute("separator");
    $container$jscomp$26$$.appendChild($separator$jscomp$3$$);
    var $articleLinks$$ = $JSCompiler_StaticMethods_createArticleLinks_$$($JSCompiler_StaticMethods_appendNextArticle_$self$$, $JSCompiler_StaticMethods_appendNextArticle_$self$$.$G$);
    $container$jscomp$26$$.appendChild($articleLinks$$);
    $documentRef$jscomp$1$$.$recUnit$.$el$ = $articleLinks$$;
    var $shadowRoot$jscomp$19$$ = $JSCompiler_StaticMethods_appendNextArticle_$self$$.$D$.document.createElement("div");
    $container$jscomp$26$$.appendChild($shadowRoot$jscomp$19$$);
    var $page$$ = $JSCompiler_StaticMethods_appendNextArticle_$self$$.$G$;
    $JSCompiler_StaticMethods_appendNextArticle_$self$$.$P$($container$jscomp$26$$).then(function() {
      $JSCompiler_StaticMethods_appendNextArticle_$self$$.$positionObserver_$.observe($separator$jscomp$3$$, 0, function($next$jscomp$6$$) {
        if ($next$jscomp$6$$ && null === $next$jscomp$6$$.$positionRect$) {
          var $documentRef$jscomp$1$$ = "";
          if ("top" === $next$jscomp$6$$.$relativePos$) {
            var $container$jscomp$26$$ = $JSCompiler_StaticMethods_appendNextArticle_$self$$.$F$[$page$$ + 1];
            $documentRef$jscomp$1$$ = "amp-next-page-scroll";
          } else {
            "bottom" === $next$jscomp$6$$.$relativePos$ && ($container$jscomp$26$$ = $JSCompiler_StaticMethods_appendNextArticle_$self$$.$F$[$page$$], $documentRef$jscomp$1$$ = "amp-next-page-scroll-back");
          }
          $container$jscomp$26$$ && $container$jscomp$26$$.amp && (_.$triggerAnalyticsEvent$$module$src$analytics$$($JSCompiler_StaticMethods_appendNextArticle_$self$$.$element_$, $documentRef$jscomp$1$$, _.$dict$$module$src$utils$object$$({toURL:$container$jscomp$26$$.$ampUrl$, fromURL:$JSCompiler_StaticMethods_appendNextArticle_$self$$.$K$.$ampUrl$ || ""})), $JSCompiler_StaticMethods_appendNextArticle_$self$$.$D$.document.title = $container$jscomp$26$$.amp.title || "", $JSCompiler_StaticMethods_appendNextArticle_$self$$.$K$ = 
          $container$jscomp$26$$, $JSCompiler_StaticMethods_appendNextArticle_$self$$.$D$.history && $JSCompiler_StaticMethods_appendNextArticle_$self$$.$D$.history.replaceState && ($next$jscomp$6$$ = $container$jscomp$26$$.amp.title, $container$jscomp$26$$ = $JSCompiler_StaticMethods_appendNextArticle_$self$$.$I$.parse($container$jscomp$26$$.$ampUrl$), $JSCompiler_StaticMethods_appendNextArticle_$self$$.$D$.history.replaceState({}, $next$jscomp$6$$, $container$jscomp$26$$.pathname + $container$jscomp$26$$.search)));
        }
      });
      $JSCompiler_StaticMethods_appendNextArticle_$self$$.$positionObserver_$.observe($articleLinks$$, 0, function() {
        $documentRef$jscomp$1$$.$cancelled$ = !0;
        $documentRef$jscomp$1$$.$recUnit$.$isObserving$ && ($JSCompiler_StaticMethods_appendNextArticle_$self$$.$positionObserver_$.unobserve($documentRef$jscomp$1$$.$recUnit$.$el$), $documentRef$jscomp$1$$.$recUnit$.$isObserving$ = !1);
      });
    });
    2 <= $JSCompiler_StaticMethods_appendNextArticle_$self$$.$G$ || ($JSCompiler_StaticMethods_appendNextArticle_$self$$.$G$++, $JSCompiler_StaticMethods_appendNextArticle_$self$$.$xhr_$.fetch($next$jscomp$6$$.$ampUrl$, {ampCors:!1}).then(function($next$jscomp$6$$) {
      $documentRef$jscomp$1$$.$ampUrl$ = $next$jscomp$6$$.url;
      $JSCompiler_StaticMethods_appendNextArticle_$self$$.$I$.parse($next$jscomp$6$$.url);
      return $next$jscomp$6$$.text();
    }).then(function($next$jscomp$6$$) {
      var $documentRef$jscomp$1$$ = $JSCompiler_StaticMethods_appendNextArticle_$self$$.$D$.document.implementation.createHTMLDocument("");
      $documentRef$jscomp$1$$.open();
      $documentRef$jscomp$1$$.write($next$jscomp$6$$);
      $documentRef$jscomp$1$$.close();
      return $documentRef$jscomp$1$$;
    }).then(function($next$jscomp$6$$) {
      return new window.Promise(function($separator$jscomp$3$$, $page$$) {
        $documentRef$jscomp$1$$.$cancelled$ ? $separator$jscomp$3$$() : ($documentRef$jscomp$1$$.$recUnit$.$isObserving$ && ($JSCompiler_StaticMethods_appendNextArticle_$self$$.$positionObserver_$.unobserve($articleLinks$$), $documentRef$jscomp$1$$.$recUnit$.$isObserving$ = !0), $JSCompiler_StaticMethods_appendNextArticle_$self$$.$O$.$mutateElement$($container$jscomp$26$$, function() {
          try {
            if ($JSCompiler_StaticMethods_appendNextArticle_$self$$.$R$) {
              for (var $container$jscomp$26$$ = $next$jscomp$6$$.querySelectorAll($JSCompiler_StaticMethods_appendNextArticle_$self$$.$R$), $articleLinks$$ = 0; $articleLinks$$ < $container$jscomp$26$$.length; $articleLinks$$++) {
                $container$jscomp$26$$[$articleLinks$$].classList.add("i-amphtml-next-page-hidden");
              }
            }
            var $doc$jscomp$104$$ = $next$jscomp$6$$.querySelectorAll("amp-analytics");
            for ($container$jscomp$26$$ = 0; $container$jscomp$26$$ < $doc$jscomp$104$$.length; $container$jscomp$26$$++) {
              _.$removeElement$$module$src$dom$$($doc$jscomp$104$$[$container$jscomp$26$$]);
            }
            var $resolve$jscomp$62$$ = $JSCompiler_StaticMethods_appendNextArticle_$self$$.$U$.attachShadowDoc($shadowRoot$jscomp$19$$, $next$jscomp$6$$, "", {});
            _.$installStylesForDoc$$module$src$style_installer$$($resolve$jscomp$62$$.ampdoc, ".amp-next-page-default-separator{border-bottom:1px solid rgba(0,0,0,0.12)}.amp-next-page-links{border-top:1px solid rgba(0,0,0,0.12)}.amp-next-page-link{border-bottom:1px solid rgba(0,0,0,0.12)}.amp-next-page-text{color:#3c4043;font-size:17px}.i-amphtml-next-page-document{overflow-y:hidden}.i-amphtml-next-page-document>[i-amphtml-fixedid]{display:none}.i-amphtml-next-page-hidden{display:none!important}.i-amphtml-next-page{background:#fff}.i-amphtml-next-page>[separator]{display:none}.i-amphtml-reco-holder-article{display:block;overflow:auto;padding:10px 0;text-decoration:none}.i-amphtml-next-article-image{width:72px;height:72px;float:left;margin:0 10px;background-size:cover;background-position:50%}.i-amphtml-next-article-title{position:relative;margin:5px 30px 5px 0}\n/*# sourceURL=/extensions/amp-next-page/0.1/amp-next-page.css*/", 
            null, !1, "amp-next-page");
            $resolve$jscomp$62$$.ampdoc.$getBody$().classList.add("i-amphtml-next-page-document");
            $documentRef$jscomp$1$$.amp = $resolve$jscomp$62$$;
            _.$toggle$$module$src$style$$($documentRef$jscomp$1$$.$recUnit$.$el$, !1);
            $JSCompiler_StaticMethods_appendNextArticle_$self$$.$J$ = !1;
            $separator$jscomp$3$$();
          } catch ($e$278$$) {
            $page$$($e$278$$);
          }
        }));
      });
    }, function($JSCompiler_StaticMethods_appendNextArticle_$self$$) {
      return _.$dev$$module$src$log$$().error("amp-next-page", "failed to fetch %s", $next$jscomp$6$$.$ampUrl$, $JSCompiler_StaticMethods_appendNextArticle_$self$$);
    }).catch(function($JSCompiler_StaticMethods_appendNextArticle_$self$$) {
      return _.$dev$$module$src$log$$().error("amp-next-page", "failed to attach shadow document for %s", $next$jscomp$6$$.$ampUrl$, $JSCompiler_StaticMethods_appendNextArticle_$self$$);
    }).then(function() {
      return $JSCompiler_StaticMethods_NextPageService$$module$extensions$amp_next_page$0_1$next_page_service_prototype$scrollHandler_$$($JSCompiler_StaticMethods_appendNextArticle_$self$$);
    }));
  }
}, $JSCompiler_StaticMethods_createArticleLinks_$$ = function($JSCompiler_StaticMethods_createArticleLinks_$self$$, $nextPage$$) {
  var $doc$jscomp$105$$ = $JSCompiler_StaticMethods_createArticleLinks_$self$$.$D$.document, $currentArticle_element$jscomp$503$$ = $nextPage$$ - 1, $article$$ = $nextPage$$, $currentAmpUrl$$ = "";
  0 < $nextPage$$ && ($currentAmpUrl$$ = $JSCompiler_StaticMethods_createArticleLinks_$self$$.$F$[$currentArticle_element$jscomp$503$$].$ampUrl$);
  $currentArticle_element$jscomp$503$$ = $doc$jscomp$105$$.createElement("div");
  $currentArticle_element$jscomp$503$$.classList.add("amp-next-page-links");
  for (var $$jscomp$loop$402$$ = {}; $article$$ < $JSCompiler_StaticMethods_createArticleLinks_$self$$.$config_$.$pages$.length && 3 > $article$$ - $nextPage$$;) {
    $$jscomp$loop$402$$.next = $JSCompiler_StaticMethods_createArticleLinks_$self$$.$config_$.$pages$[$article$$];
    $article$$++;
    var $articleHolder$$ = $doc$jscomp$105$$.createElement("a");
    $articleHolder$$.href = $$jscomp$loop$402$$.next.$ampUrl$;
    $articleHolder$$.classList.add("i-amphtml-reco-holder-article", "amp-next-page-link");
    $articleHolder$$.addEventListener("click", function($nextPage$$) {
      return function($doc$jscomp$105$$) {
        _.$triggerAnalyticsEvent$$module$src$analytics$$($JSCompiler_StaticMethods_createArticleLinks_$self$$.$element_$, "amp-next-page-click", _.$dict$$module$src$utils$object$$({toURL:$nextPage$$.next.$ampUrl$, fromURL:$currentAmpUrl$$ || ""}));
        _.$JSCompiler_StaticMethods_navigateToAmpUrl$$($JSCompiler_StaticMethods_createArticleLinks_$self$$.$V$, $nextPage$$.next.$ampUrl$, "content-discovery") && $doc$jscomp$105$$.preventDefault();
      };
    }($$jscomp$loop$402$$));
    var $imageElement_titleElement$$ = $doc$jscomp$105$$.createElement("div");
    $imageElement_titleElement$$.classList.add("i-amphtml-next-article-image", "amp-next-page-image");
    _.$setStyle$$module$src$style$$($imageElement_titleElement$$, "background-image", "url(" + $$jscomp$loop$402$$.next.$image$ + ")");
    $articleHolder$$.appendChild($imageElement_titleElement$$);
    $imageElement_titleElement$$ = $doc$jscomp$105$$.createElement("div");
    $imageElement_titleElement$$.classList.add("i-amphtml-next-article-title", "amp-next-page-text");
    $imageElement_titleElement$$.textContent = $$jscomp$loop$402$$.next.title;
    $articleHolder$$.appendChild($imageElement_titleElement$$);
    $currentArticle_element$jscomp$503$$.appendChild($articleHolder$$);
    $$jscomp$loop$402$$ = {next:$$jscomp$loop$402$$.next};
  }
  return $currentArticle_element$jscomp$503$$;
}, $JSCompiler_StaticMethods_NextPageService$$module$extensions$amp_next_page$0_1$next_page_service_prototype$scrollHandler_$$ = function($JSCompiler_StaticMethods_NextPageService$$module$extensions$amp_next_page$0_1$next_page_service_prototype$scrollHandler_$self$$) {
  if (!$JSCompiler_StaticMethods_NextPageService$$module$extensions$amp_next_page$0_1$next_page_service_prototype$scrollHandler_$self$$.$J$) {
    var $viewportSize$jscomp$10$$ = $JSCompiler_StaticMethods_NextPageService$$module$extensions$amp_next_page$0_1$next_page_service_prototype$scrollHandler_$self$$.$viewport_$.$getSize$(), $viewportBox$jscomp$3$$ = _.$layoutRectLtwh$$module$src$layout_rect$$(0, 0, $viewportSize$jscomp$10$$.width, $viewportSize$jscomp$10$$.height);
    _.$JSCompiler_StaticMethods_getClientRectAsync$$($JSCompiler_StaticMethods_NextPageService$$module$extensions$amp_next_page$0_1$next_page_service_prototype$scrollHandler_$self$$.$viewport_$, $JSCompiler_StaticMethods_NextPageService$$module$extensions$amp_next_page$0_1$next_page_service_prototype$scrollHandler_$self$$.$element_$).then(function($elementBox$jscomp$1$$) {
      !$JSCompiler_StaticMethods_NextPageService$$module$extensions$amp_next_page$0_1$next_page_service_prototype$scrollHandler_$self$$.$J$ && $elementBox$jscomp$1$$.bottom - $viewportBox$jscomp$3$$.bottom < 3 * $viewportSize$jscomp$10$$.height && ($JSCompiler_StaticMethods_NextPageService$$module$extensions$amp_next_page$0_1$next_page_service_prototype$scrollHandler_$self$$.$J$ = !0, $JSCompiler_StaticMethods_appendNextArticle_$$($JSCompiler_StaticMethods_NextPageService$$module$extensions$amp_next_page$0_1$next_page_service_prototype$scrollHandler_$self$$));
    });
  }
}, $createDocumentRef$$module$extensions$amp_next_page$0_1$next_page_service$$ = function($ampUrl$$, $title$jscomp$23$$) {
  return {$ampUrl$:$ampUrl$$, amp:$title$jscomp$23$$ ? {title:$title$jscomp$23$$} : null, $recUnit$:{$el$:null, $isObserving$:!1}, $cancelled$:!1};
}, $AmpNextPage$$module$extensions$amp_next_page$0_1$amp_next_page$$ = function($var_args$jscomp$80$$) {
  return window.AMP.BaseElement.apply(this, arguments) || this;
}, $JSCompiler_StaticMethods_AmpNextPage$$module$extensions$amp_next_page$0_1$amp_next_page_prototype$getInlineConfig_$$ = function($JSCompiler_StaticMethods_AmpNextPage$$module$extensions$amp_next_page$0_1$amp_next_page_prototype$getInlineConfig_$self_scriptElements$$) {
  $JSCompiler_StaticMethods_AmpNextPage$$module$extensions$amp_next_page$0_1$amp_next_page_prototype$getInlineConfig_$self_scriptElements$$ = _.$childElementsByTag$$module$src$dom$$($JSCompiler_StaticMethods_AmpNextPage$$module$extensions$amp_next_page$0_1$amp_next_page_prototype$getInlineConfig_$self_scriptElements$$.element, "SCRIPT");
  return $JSCompiler_StaticMethods_AmpNextPage$$module$extensions$amp_next_page$0_1$amp_next_page_prototype$getInlineConfig_$self_scriptElements$$.length ? _.$tryParseJson$$module$src$json$$($JSCompiler_StaticMethods_AmpNextPage$$module$extensions$amp_next_page$0_1$amp_next_page_prototype$getInlineConfig_$self_scriptElements$$[0].textContent, function($JSCompiler_StaticMethods_AmpNextPage$$module$extensions$amp_next_page$0_1$amp_next_page_prototype$getInlineConfig_$self_scriptElements$$) {
    _.$user$$module$src$log$$().error("amp-next-page", "failed to parse config", $JSCompiler_StaticMethods_AmpNextPage$$module$extensions$amp_next_page$0_1$amp_next_page_prototype$getInlineConfig_$self_scriptElements$$);
  }) : null;
}, $JSCompiler_StaticMethods_fetchAdSensePages_$$ = function($JSCompiler_StaticMethods_fetchAdSensePages_$self$$, $adUrl$jscomp$13_client$jscomp$3$$, $slot$jscomp$6$$, $personalized$$) {
  $adUrl$jscomp$13_client$jscomp$3$$ = "https://googleads.g.doubleclick.net/pagead/ads?client=" + $adUrl$jscomp$13_client$jscomp$3$$ + "&slotname=" + $slot$jscomp$6$$ + ("&url=" + (0,window.encodeURIComponent)($JSCompiler_StaticMethods_fetchAdSensePages_$self$$.$getAmpDoc$().$AmpDoc$$module$src$service$ampdoc_impl_prototype$getUrl$())) + "&ecr=1&crui=title&is_amp=3&output=xml";
  return _.$fetchDocument$$module$src$document_fetcher$$($JSCompiler_StaticMethods_fetchAdSensePages_$self$$.$win$, $adUrl$jscomp$13_client$jscomp$3$$, {credentials:$personalized$$ ? "include" : "omit"}).then(function($adUrl$jscomp$13_client$jscomp$3$$) {
    var $slot$jscomp$6$$ = _.$Services$$module$src$services$urlForDoc$$($JSCompiler_StaticMethods_fetchAdSensePages_$self$$.element), $personalized$$ = $slot$jscomp$6$$.parse($JSCompiler_StaticMethods_fetchAdSensePages_$self$$.$getAmpDoc$().$AmpDoc$$module$src$service$ampdoc_impl_prototype$getUrl$()).origin, $ads$jscomp$1_doc$jscomp$106$$ = [];
    $adUrl$jscomp$13_client$jscomp$3$$ = $adUrl$jscomp$13_client$jscomp$3$$.getElementsByTagName("AD");
    for (var $i$jscomp$364$$ = 0; $i$jscomp$364$$ < $adUrl$jscomp$13_client$jscomp$3$$.length; $i$jscomp$364$$++) {
      var $ad$jscomp$3_url$jscomp$193$$ = $adUrl$jscomp$13_client$jscomp$3$$[$i$jscomp$364$$], $title$jscomp$24_titleEl$$ = _.$elementByTag$$module$src$dom$$($ad$jscomp$3_url$jscomp$193$$, "LINE1"), $image$jscomp$11_mediaEl$$ = _.$elementByTag$$module$src$dom$$($ad$jscomp$3_url$jscomp$193$$, "MEDIA_TEMPLATE_DATA"), $visibleUrl$$ = $ad$jscomp$3_url$jscomp$193$$.getAttribute("visible_url");
      $ad$jscomp$3_url$jscomp$193$$ = $ad$jscomp$3_url$jscomp$193$$.getAttribute("url");
      $title$jscomp$24_titleEl$$ = ($title$jscomp$24_titleEl$$ && $title$jscomp$24_titleEl$$.textContent || "").trim();
      try {
        var $JSCompiler_inline_result$jscomp$814$$ = _.$parseJson$$module$src$json$$($image$jscomp$11_mediaEl$$.textContent.trim().slice(0, -1))[0].core_image_url;
      } catch ($e$279$jscomp$inline_3754$$) {
        $JSCompiler_inline_result$jscomp$814$$ = "";
      }
      $image$jscomp$11_mediaEl$$ = $JSCompiler_inline_result$jscomp$814$$;
      $slot$jscomp$6$$.parse($visibleUrl$$).origin === $personalized$$ && $ad$jscomp$3_url$jscomp$193$$ && $title$jscomp$24_titleEl$$ && $image$jscomp$11_mediaEl$$ && $ads$jscomp$1_doc$jscomp$106$$.push({title:$title$jscomp$24_titleEl$$, $image$:$image$jscomp$11_mediaEl$$, $ampUrl$:$ad$jscomp$3_url$jscomp$193$$});
    }
    return $ads$jscomp$1_doc$jscomp$106$$;
  });
}, $JSCompiler_StaticMethods_AmpNextPage$$module$extensions$amp_next_page$0_1$amp_next_page_prototype$register_$$ = function($JSCompiler_StaticMethods_AmpNextPage$$module$extensions$amp_next_page$0_1$amp_next_page_prototype$register_$self$$, $service$jscomp$29$$, $config$jscomp$76_configJson$jscomp$14$$, $separator$jscomp$5$$) {
  var $element$jscomp$505$$ = $JSCompiler_StaticMethods_AmpNextPage$$module$extensions$amp_next_page$0_1$amp_next_page_prototype$register_$self$$.element;
  $config$jscomp$76_configJson$jscomp$14$$ = $assertConfig$$module$extensions$amp_next_page$0_1$config$$($element$jscomp$505$$, $config$jscomp$76_configJson$jscomp$14$$, $JSCompiler_StaticMethods_AmpNextPage$$module$extensions$amp_next_page$0_1$amp_next_page_prototype$register_$self$$.$getAmpDoc$().$AmpDoc$$module$src$service$ampdoc_impl_prototype$getUrl$());
  $service$jscomp$29$$.register($element$jscomp$505$$, $config$jscomp$76_configJson$jscomp$14$$, $separator$jscomp$5$$);
  $JSCompiler_StaticMethods_setAppendPageHandler$$($service$jscomp$29$$, function($service$jscomp$29$$) {
    return $JSCompiler_StaticMethods_appendPage_$$($JSCompiler_StaticMethods_AmpNextPage$$module$extensions$amp_next_page$0_1$amp_next_page_prototype$register_$self$$, $service$jscomp$29$$);
  });
}, $JSCompiler_StaticMethods_appendPage_$$ = function($JSCompiler_StaticMethods_appendPage_$self$$, $element$jscomp$507$$) {
  return $JSCompiler_StaticMethods_appendPage_$self$$.$mutateElement$(function() {
    return $JSCompiler_StaticMethods_appendPage_$self$$.element.appendChild($element$jscomp$507$$);
  });
}, $JSCompiler_StaticMethods_fetchConfig_$$ = function($JSCompiler_StaticMethods_fetchConfig_$self$$) {
  var $ampdoc$jscomp$189$$ = $JSCompiler_StaticMethods_fetchConfig_$self$$.$getAmpDoc$();
  return _.$batchFetchJsonFor$$module$src$batched_json$$($ampdoc$jscomp$189$$, $JSCompiler_StaticMethods_fetchConfig_$self$$.element, void 0, 2);
}, $BANNED_SELECTOR_PATTERNS$$module$extensions$amp_next_page$0_1$config$$ = [/(^|\W)i-amphtml-/];
$NextPageService$$module$extensions$amp_next_page$0_1$next_page_service$$.prototype.register = function($element$jscomp$502$$, $config$jscomp$74$$, $separator$jscomp$1$$) {
  var $$jscomp$this$jscomp$771$$ = this;
  if (null === this.$config_$) {
    var $ampDoc$jscomp$23$$ = _.$getAmpdoc$$module$src$service$$($element$jscomp$502$$), $win$jscomp$366$$ = $ampDoc$jscomp$23$$.$win$;
    this.$config_$ = $config$jscomp$74$$;
    this.$D$ = $win$jscomp$366$$;
    this.$W$ = $separator$jscomp$1$$ || $JSCompiler_StaticMethods_createDefaultSeparator_$$(this);
    this.$element_$ = $element$jscomp$502$$;
    this.$xhr_$ = _.$Services$$module$src$services$xhrFor$$($win$jscomp$366$$);
    this.$config_$.$hideSelectors$ && (this.$R$ = this.$config_$.$hideSelectors$.join(","));
    this.$V$ = _.$Services$$module$src$services$navigationForDoc$$($ampDoc$jscomp$23$$);
    this.$viewport_$ = _.$Services$$module$src$services$viewportForDoc$$($ampDoc$jscomp$23$$);
    this.$O$ = _.$Services$$module$src$services$resourcesForDoc$$($ampDoc$jscomp$23$$);
    this.$U$ = new _.$MultidocManager$$module$src$runtime$$($win$jscomp$366$$, _.$Services$$module$src$services$ampdocServiceFor$$($win$jscomp$366$$), _.$Services$$module$src$services$extensionsFor$$($win$jscomp$366$$), _.$Services$$module$src$services$timerFor$$($win$jscomp$366$$));
    this.$I$ = _.$Services$$module$src$services$urlForDoc$$(this.$element_$);
    this.$origin_$ = this.$I$.parse($ampDoc$jscomp$23$$.$AmpDoc$$module$src$service$ampdoc_impl_prototype$getUrl$()).origin;
    _.$installPositionObserverServiceForDoc$$module$src$service$position_observer$position_observer_impl$$($ampDoc$jscomp$23$$);
    this.$positionObserver_$ = _.$getServiceForDoc$$module$src$service$$($ampDoc$jscomp$23$$, "position-observer");
    this.$F$.push($createDocumentRef$$module$extensions$amp_next_page$0_1$next_page_service$$($win$jscomp$366$$.document.location.href, $win$jscomp$366$$.document.title));
    this.$K$ = this.$F$[0];
    _.$JSCompiler_StaticMethods_Viewport$$module$src$service$viewport$viewport_impl_prototype$onScroll$$(this.$viewport_$, function() {
      return $JSCompiler_StaticMethods_NextPageService$$module$extensions$amp_next_page$0_1$next_page_service_prototype$scrollHandler_$$($$jscomp$this$jscomp$771$$);
    });
    _.$JSCompiler_StaticMethods_Viewport$$module$src$service$viewport$viewport_impl_prototype$onResize$$(this.$viewport_$, function() {
      return $JSCompiler_StaticMethods_NextPageService$$module$extensions$amp_next_page$0_1$next_page_service_prototype$scrollHandler_$$($$jscomp$this$jscomp$771$$);
    });
    $JSCompiler_StaticMethods_NextPageService$$module$extensions$amp_next_page$0_1$next_page_service_prototype$scrollHandler_$$(this);
  }
};
_.$$jscomp$inherits$$($AmpNextPage$$module$extensions$amp_next_page$0_1$amp_next_page$$, window.AMP.BaseElement);
$AmpNextPage$$module$extensions$amp_next_page$0_1$amp_next_page$$.prototype.$isLayoutSupported$ = function($layout$jscomp$79$$) {
  return "container" == $layout$jscomp$79$$;
};
$AmpNextPage$$module$extensions$amp_next_page$0_1$amp_next_page$$.prototype.$buildCallback$ = function() {
  var $$jscomp$this$jscomp$775$$ = this, $separatorElements$$ = _.$scopedQuerySelectorAll$$module$src$dom$$(this.element, "> [separator]"), $separator$jscomp$4$$ = null;
  1 === $separatorElements$$.length && ($separator$jscomp$4$$ = $separatorElements$$[0], _.$removeElement$$module$src$dom$$($separator$jscomp$4$$));
  return _.$getServicePromiseForDoc$$module$src$service$$(this.$getAmpDoc$(), "next-page").then(function($separatorElements$$) {
    if (null === $separatorElements$$.$config_$) {
      var $service$jscomp$28$$ = $$jscomp$this$jscomp$775$$.element;
      $service$jscomp$28$$.classList.add("i-amphtml-next-page");
      var $src$jscomp$56$$ = $service$jscomp$28$$.getAttribute("src"), $configPromise$jscomp$1$$, $consentPolicyId$jscomp$5_pagesPromise$$ = window.Promise.resolve([]);
      if ($service$jscomp$28$$.getAttribute("type")) {
        var $client$jscomp$2$$ = $service$jscomp$28$$.getAttribute("data-client"), $slot$jscomp$5$$ = $service$jscomp$28$$.getAttribute("data-slot");
        $consentPolicyId$jscomp$5_pagesPromise$$ = $$jscomp$this$jscomp$775$$.$getConsentPolicy$();
        $consentPolicyId$jscomp$5_pagesPromise$$ = ($consentPolicyId$jscomp$5_pagesPromise$$ ? _.$getConsentPolicyState$$module$src$consent$$($service$jscomp$28$$, $consentPolicyId$jscomp$5_pagesPromise$$).catch(function($$jscomp$this$jscomp$775$$) {
          _.$user$$module$src$log$$().error("amp-next-page", "Error determining consent state", $$jscomp$this$jscomp$775$$);
          return 4;
        }) : window.Promise.resolve(1)).then(function($separatorElements$$) {
          return $JSCompiler_StaticMethods_fetchAdSensePages_$$($$jscomp$this$jscomp$775$$, $client$jscomp$2$$, $slot$jscomp$5$$, 1 === $separatorElements$$ || 3 === $separatorElements$$);
        }).catch(function($$jscomp$this$jscomp$775$$) {
          _.$user$$module$src$log$$().$Log$$module$src$log_prototype$warn$("amp-next-page", "error fetching recommendations from AdSense", $$jscomp$this$jscomp$775$$);
          return [];
        });
      }
      $service$jscomp$28$$ = $JSCompiler_StaticMethods_AmpNextPage$$module$extensions$amp_next_page$0_1$amp_next_page_prototype$getInlineConfig_$$($$jscomp$this$jscomp$775$$);
      $src$jscomp$56$$ ? $configPromise$jscomp$1$$ = $JSCompiler_StaticMethods_fetchConfig_$$($$jscomp$this$jscomp$775$$).catch(function($$jscomp$this$jscomp$775$$) {
        return _.$user$$module$src$log$$().error("amp-next-page", "error fetching config", $$jscomp$this$jscomp$775$$);
      }) : $configPromise$jscomp$1$$ = window.Promise.resolve($service$jscomp$28$$);
      return window.Promise.all([$configPromise$jscomp$1$$, $consentPolicyId$jscomp$5_pagesPromise$$]).then(function($service$jscomp$28$$) {
        var $element$jscomp$504_inlineConfig$jscomp$4$$ = $service$jscomp$28$$[0] || {};
        $element$jscomp$504_inlineConfig$jscomp$4$$.$pages$ = ($service$jscomp$28$$[1] || []).concat($element$jscomp$504_inlineConfig$jscomp$4$$.$pages$ || []);
        $JSCompiler_StaticMethods_AmpNextPage$$module$extensions$amp_next_page$0_1$amp_next_page_prototype$register_$$($$jscomp$this$jscomp$775$$, $separatorElements$$, $element$jscomp$504_inlineConfig$jscomp$4$$, $separator$jscomp$4$$);
      });
    }
  });
};
(function($AMP$jscomp$81$$) {
  var $service$jscomp$30$$ = new $NextPageService$$module$extensions$amp_next_page$0_1$next_page_service$$;
  $AMP$jscomp$81$$.registerServiceForDoc("next-page", function() {
    return $service$jscomp$30$$;
  });
  $AMP$jscomp$81$$.registerElement("amp-next-page", $AmpNextPage$$module$extensions$amp_next_page$0_1$amp_next_page$$, ".amp-next-page-default-separator{border-bottom:1px solid rgba(0,0,0,0.12)}.amp-next-page-links{border-top:1px solid rgba(0,0,0,0.12)}.amp-next-page-link{border-bottom:1px solid rgba(0,0,0,0.12)}.amp-next-page-text{color:#3c4043;font-size:17px}.i-amphtml-next-page-document{overflow-y:hidden}.i-amphtml-next-page-document>[i-amphtml-fixedid]{display:none}.i-amphtml-next-page-hidden{display:none!important}.i-amphtml-next-page{background:#fff}.i-amphtml-next-page>[separator]{display:none}.i-amphtml-reco-holder-article{display:block;overflow:auto;padding:10px 0;text-decoration:none}.i-amphtml-next-article-image{width:72px;height:72px;float:left;margin:0 10px;background-size:cover;background-position:50%}.i-amphtml-next-article-title{position:relative;margin:5px 30px 5px 0}\n/*# sourceURL=/extensions/amp-next-page/0.1/amp-next-page.css*/");
})(window.self.AMP);

})});
