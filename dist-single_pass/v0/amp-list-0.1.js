(self.AMP=self.AMP||[]).push({n:"amp-list",i:["_base_i","_base_misc"],v:"1901181729101",f:(function(AMP,_){
var $JSCompiler_StaticMethods_renderTemplateArray$$ = function($JSCompiler_StaticMethods_renderTemplateArray$self$$, $templateElement$jscomp$2$$, $array$jscomp$13$$) {
  return 0 == $array$jscomp$13$$.length ? window.Promise.resolve([]) : _.$JSCompiler_StaticMethods_getImplementation_$$($JSCompiler_StaticMethods_renderTemplateArray$self$$, $templateElement$jscomp$2$$).then(function($JSCompiler_StaticMethods_renderTemplateArray$self$$) {
    return $array$jscomp$13$$.map(function($templateElement$jscomp$2$$) {
      return $JSCompiler_StaticMethods_renderTemplateArray$self$$.render($templateElement$jscomp$2$$);
    });
  });
}, $JSCompiler_StaticMethods_findAndRenderTemplateArray$$ = function($JSCompiler_StaticMethods_findAndRenderTemplateArray$self$$, $parent$jscomp$17$$, $array$jscomp$14$$) {
  return $JSCompiler_StaticMethods_renderTemplateArray$$($JSCompiler_StaticMethods_findAndRenderTemplateArray$self$$, _.$JSCompiler_StaticMethods_maybeFindTemplate$$($parent$jscomp$17$$, void 0), $array$jscomp$14$$);
}, $JSCompiler_StaticMethods_setHtmlForTemplate$$ = function($JSCompiler_StaticMethods_setHtmlForTemplate$self$$, $templateElement$$, $html$jscomp$1$$) {
  return _.$JSCompiler_StaticMethods_getImplementation_$$($JSCompiler_StaticMethods_setHtmlForTemplate$self$$, $templateElement$$).then(function($JSCompiler_StaticMethods_setHtmlForTemplate$self$$) {
    return $JSCompiler_StaticMethods_setHtmlForTemplate$self$$.$D$($html$jscomp$1$$);
  });
}, $JSCompiler_StaticMethods_findAndSetHtmlForTemplate$$ = function($JSCompiler_StaticMethods_findAndSetHtmlForTemplate$self$$, $parent$jscomp$16$$, $html$jscomp$2$$) {
  return $JSCompiler_StaticMethods_setHtmlForTemplate$$($JSCompiler_StaticMethods_findAndSetHtmlForTemplate$self$$, _.$JSCompiler_StaticMethods_maybeFindTemplate$$($parent$jscomp$16$$, void 0), $html$jscomp$2$$);
}, $DOMParserParse$$module$set_dom$src$parse_html$$ = function($markup$$, $rootName$$) {
  var $doc$jscomp$98$$ = $parser$$module$set_dom$src$parse_html$$.parseFromString($markup$$, "text/html");
  return $doc$jscomp$98$$.body ? "HTML" === $rootName$$ ? $doc$jscomp$98$$.documentElement : $doc$jscomp$98$$.body.firstChild : $fallbackParse$$module$set_dom$src$parse_html$$($markup$$, $rootName$$);
}, $fallbackParse$$module$set_dom$src$parse_html$$ = function($doc$jscomp$99_markup$jscomp$1$$, $body$jscomp$30_bodyContent_rootName$jscomp$1$$) {
  if ("HTML" === $body$jscomp$30_bodyContent_rootName$jscomp$1$$) {
    if ($supportsInnerHTML$$module$set_dom$src$parse_html$$) {
      return $mockHTML$$module$set_dom$src$parse_html$$.innerHTML = $doc$jscomp$99_markup$jscomp$1$$, $mockHTML$$module$set_dom$src$parse_html$$;
    }
    var $bodyMatch_startBody$$ = $doc$jscomp$99_markup$jscomp$1$$.match($bodyReg$$module$set_dom$src$parse_html$$);
    $bodyMatch_startBody$$ && ($body$jscomp$30_bodyContent_rootName$jscomp$1$$ = $bodyMatch_startBody$$[2], $bodyMatch_startBody$$ = $bodyMatch_startBody$$.index + $bodyMatch_startBody$$[1].length, $doc$jscomp$99_markup$jscomp$1$$ = $doc$jscomp$99_markup$jscomp$1$$.slice(0, $bodyMatch_startBody$$) + $doc$jscomp$99_markup$jscomp$1$$.slice($bodyMatch_startBody$$ + $body$jscomp$30_bodyContent_rootName$jscomp$1$$.length), $mockBody$$module$set_dom$src$parse_html$$.innerHTML = $body$jscomp$30_bodyContent_rootName$jscomp$1$$);
    $doc$jscomp$99_markup$jscomp$1$$ = $parser$$module$set_dom$src$parse_html$$.parseFromString($doc$jscomp$99_markup$jscomp$1$$, "application/xhtml+xml");
    for ($body$jscomp$30_bodyContent_rootName$jscomp$1$$ = $doc$jscomp$99_markup$jscomp$1$$.body; $mockBody$$module$set_dom$src$parse_html$$.firstChild;) {
      $body$jscomp$30_bodyContent_rootName$jscomp$1$$.appendChild($mockBody$$module$set_dom$src$parse_html$$.firstChild);
    }
    return $doc$jscomp$99_markup$jscomp$1$$.documentElement;
  }
  $mockBody$$module$set_dom$src$parse_html$$.innerHTML = $doc$jscomp$99_markup$jscomp$1$$;
  return $mockBody$$module$set_dom$src$parse_html$$.firstChild;
}, $setDOM$$module$set_dom$src$index$$ = function($oldNode$jscomp$1$$, $newNode$jscomp$1$$) {
  if (!$oldNode$jscomp$1$$ || !$oldNode$jscomp$1$$.nodeType) {
    throw Error("set-dom: You must provide a valid node to update.");
  }
  $oldNode$jscomp$1$$.nodeType === $DOCUMENT_TYPE$$module$set_dom$src$index$$ && ($oldNode$jscomp$1$$ = $oldNode$jscomp$1$$.documentElement);
  $newNode$jscomp$1$$.nodeType === $DOCUMENT_FRAGMENT_TYPE$$module$set_dom$src$index$$ ? $setChildNodes$$module$set_dom$src$index$$($oldNode$jscomp$1$$, $newNode$jscomp$1$$) : $setNode$$module$set_dom$src$index$$($oldNode$jscomp$1$$, "string" === typeof $newNode$jscomp$1$$ ? $$jscompDefaultExport$$module$set_dom$src$parse_html$$($newNode$jscomp$1$$, $oldNode$jscomp$1$$.nodeName) : $newNode$jscomp$1$$);
  $oldNode$jscomp$1$$[$NODE_MOUNTED$$module$set_dom$src$index$$] || ($oldNode$jscomp$1$$[$NODE_MOUNTED$$module$set_dom$src$index$$] = !0, $mount$$module$set_dom$src$index$$($oldNode$jscomp$1$$));
}, $setNode$$module$set_dom$src$index$$ = function($oldAttributes$jscomp$inline_3601_oldNode$jscomp$2$$, $newAttributes$jscomp$inline_3602_newNode$jscomp$2_newPrev$$) {
  if ($oldAttributes$jscomp$inline_3601_oldNode$jscomp$2$$.nodeType === $newAttributes$jscomp$inline_3602_newNode$jscomp$2_newPrev$$.nodeType) {
    if ($oldAttributes$jscomp$inline_3601_oldNode$jscomp$2$$.nodeType === $ELEMENT_TYPE$$module$set_dom$src$index$$) {
      if (!(null != $oldAttributes$jscomp$inline_3601_oldNode$jscomp$2$$.getAttribute($setDOM$$module$set_dom$src$index$$.$F$) && null != $newAttributes$jscomp$inline_3602_newNode$jscomp$2_newPrev$$.getAttribute($setDOM$$module$set_dom$src$index$$.$F$) || ($oldAttributes$jscomp$inline_3601_oldNode$jscomp$2$$.getAttribute($setDOM$$module$set_dom$src$index$$.$D$) || window.NaN) === ($newAttributes$jscomp$inline_3602_newNode$jscomp$2_newPrev$$.getAttribute($setDOM$$module$set_dom$src$index$$.$D$) || 
      window.NaN) || $oldAttributes$jscomp$inline_3601_oldNode$jscomp$2$$.isEqualNode($newAttributes$jscomp$inline_3602_newNode$jscomp$2_newPrev$$))) {
        if ($setChildNodes$$module$set_dom$src$index$$($oldAttributes$jscomp$inline_3601_oldNode$jscomp$2$$, $newAttributes$jscomp$inline_3602_newNode$jscomp$2_newPrev$$), $oldAttributes$jscomp$inline_3601_oldNode$jscomp$2$$.nodeName === $newAttributes$jscomp$inline_3602_newNode$jscomp$2_newPrev$$.nodeName) {
          $oldAttributes$jscomp$inline_3601_oldNode$jscomp$2$$ = $oldAttributes$jscomp$inline_3601_oldNode$jscomp$2$$.attributes;
          $newAttributes$jscomp$inline_3602_newNode$jscomp$2_newPrev$$ = $newAttributes$jscomp$inline_3602_newNode$jscomp$2_newPrev$$.attributes;
          var $i$jscomp$inline_3603$$, $b$jscomp$inline_3605$$;
          for ($i$jscomp$inline_3603$$ = $oldAttributes$jscomp$inline_3601_oldNode$jscomp$2$$.length; $i$jscomp$inline_3603$$--;) {
            var $a$jscomp$inline_3604$$ = $oldAttributes$jscomp$inline_3601_oldNode$jscomp$2$$[$i$jscomp$inline_3603$$];
            var $ns$jscomp$inline_3606$$ = $a$jscomp$inline_3604$$.namespaceURI;
            var $name$jscomp$inline_3607$$ = $a$jscomp$inline_3604$$.localName;
            ($b$jscomp$inline_3605$$ = $newAttributes$jscomp$inline_3602_newNode$jscomp$2_newPrev$$.$D$($ns$jscomp$inline_3606$$, $name$jscomp$inline_3607$$)) || $oldAttributes$jscomp$inline_3601_oldNode$jscomp$2$$.$F$($ns$jscomp$inline_3606$$, $name$jscomp$inline_3607$$);
          }
          for ($i$jscomp$inline_3603$$ = $newAttributes$jscomp$inline_3602_newNode$jscomp$2_newPrev$$.length; $i$jscomp$inline_3603$$--;) {
            ($a$jscomp$inline_3604$$ = $newAttributes$jscomp$inline_3602_newNode$jscomp$2_newPrev$$[$i$jscomp$inline_3603$$], $ns$jscomp$inline_3606$$ = $a$jscomp$inline_3604$$.namespaceURI, $name$jscomp$inline_3607$$ = $a$jscomp$inline_3604$$.localName, $b$jscomp$inline_3605$$ = $oldAttributes$jscomp$inline_3601_oldNode$jscomp$2$$.$D$($ns$jscomp$inline_3606$$, $name$jscomp$inline_3607$$), $b$jscomp$inline_3605$$) ? $b$jscomp$inline_3605$$.value !== $a$jscomp$inline_3604$$.value && ($b$jscomp$inline_3605$$.value = 
            $a$jscomp$inline_3604$$.value) : ($newAttributes$jscomp$inline_3602_newNode$jscomp$2_newPrev$$.$F$($ns$jscomp$inline_3606$$, $name$jscomp$inline_3607$$), $oldAttributes$jscomp$inline_3601_oldNode$jscomp$2$$.$G$($a$jscomp$inline_3604$$));
          }
        } else {
          for ($newAttributes$jscomp$inline_3602_newNode$jscomp$2_newPrev$$ = $newAttributes$jscomp$inline_3602_newNode$jscomp$2_newPrev$$.cloneNode(); $oldAttributes$jscomp$inline_3601_oldNode$jscomp$2$$.firstChild;) {
            $newAttributes$jscomp$inline_3602_newNode$jscomp$2_newPrev$$.appendChild($oldAttributes$jscomp$inline_3601_oldNode$jscomp$2$$.firstChild);
          }
          $oldAttributes$jscomp$inline_3601_oldNode$jscomp$2$$.parentNode.replaceChild($newAttributes$jscomp$inline_3602_newNode$jscomp$2_newPrev$$, $oldAttributes$jscomp$inline_3601_oldNode$jscomp$2$$);
        }
      }
    } else {
      $oldAttributes$jscomp$inline_3601_oldNode$jscomp$2$$.nodeValue !== $newAttributes$jscomp$inline_3602_newNode$jscomp$2_newPrev$$.nodeValue && ($oldAttributes$jscomp$inline_3601_oldNode$jscomp$2$$.nodeValue = $newAttributes$jscomp$inline_3602_newNode$jscomp$2_newPrev$$.nodeValue);
    }
  } else {
    $oldAttributes$jscomp$inline_3601_oldNode$jscomp$2$$.parentNode.replaceChild($newAttributes$jscomp$inline_3602_newNode$jscomp$2_newPrev$$, $dispatch$$module$set_dom$src$index$$($oldAttributes$jscomp$inline_3601_oldNode$jscomp$2$$, "dismount")), $mount$$module$set_dom$src$index$$($newAttributes$jscomp$inline_3602_newNode$jscomp$2_newPrev$$);
  }
}, $setChildNodes$$module$set_dom$src$index$$ = function($oldParent$$, $checkOld_newParent$jscomp$1$$) {
  for (var $oldKey$$, $checkNew$$, $newKey$$, $foundNode$$, $keyedNodes$$, $oldNode$jscomp$3$$ = $oldParent$$.firstChild, $newNode$jscomp$3$$ = $checkOld_newParent$jscomp$1$$.firstChild, $extra$jscomp$1$$ = 0; $oldNode$jscomp$3$$;) {
    $extra$jscomp$1$$++, $checkOld_newParent$jscomp$1$$ = $oldNode$jscomp$3$$, $oldKey$$ = $getKey$$module$set_dom$src$index$$($checkOld_newParent$jscomp$1$$), $oldNode$jscomp$3$$ = $oldNode$jscomp$3$$.nextSibling, $oldKey$$ && ($keyedNodes$$ || ($keyedNodes$$ = {}), $keyedNodes$$[$oldKey$$] = $checkOld_newParent$jscomp$1$$);
  }
  for ($oldNode$jscomp$3$$ = $oldParent$$.firstChild; $newNode$jscomp$3$$;) {
    $extra$jscomp$1$$--, $checkNew$$ = $newNode$jscomp$3$$, $newNode$jscomp$3$$ = $newNode$jscomp$3$$.nextSibling, $keyedNodes$$ && ($newKey$$ = $getKey$$module$set_dom$src$index$$($checkNew$$)) && ($foundNode$$ = $keyedNodes$$[$newKey$$]) ? (delete $keyedNodes$$[$newKey$$], $foundNode$$ !== $oldNode$jscomp$3$$ ? $oldParent$$.insertBefore($foundNode$$, $oldNode$jscomp$3$$) : $oldNode$jscomp$3$$ = $oldNode$jscomp$3$$.nextSibling, $setNode$$module$set_dom$src$index$$($foundNode$$, $checkNew$$)) : $oldNode$jscomp$3$$ ? 
    ($checkOld_newParent$jscomp$1$$ = $oldNode$jscomp$3$$, $oldNode$jscomp$3$$ = $oldNode$jscomp$3$$.nextSibling, $getKey$$module$set_dom$src$index$$($checkOld_newParent$jscomp$1$$) ? ($oldParent$$.insertBefore($checkNew$$, $checkOld_newParent$jscomp$1$$), $mount$$module$set_dom$src$index$$($checkNew$$)) : $setNode$$module$set_dom$src$index$$($checkOld_newParent$jscomp$1$$, $checkNew$$)) : ($oldParent$$.appendChild($checkNew$$), $mount$$module$set_dom$src$index$$($checkNew$$));
  }
  for ($oldKey$$ in $keyedNodes$$) {
    $extra$jscomp$1$$--, $oldParent$$.removeChild($dispatch$$module$set_dom$src$index$$($keyedNodes$$[$oldKey$$], "dismount"));
  }
  for (; 0 <= --$extra$jscomp$1$$;) {
    $oldParent$$.removeChild($dispatch$$module$set_dom$src$index$$($oldParent$$.lastChild, "dismount"));
  }
}, $getKey$$module$set_dom$src$index$$ = function($key$jscomp$131_node$jscomp$79$$) {
  if ($key$jscomp$131_node$jscomp$79$$.nodeType === $ELEMENT_TYPE$$module$set_dom$src$index$$ && ($key$jscomp$131_node$jscomp$79$$ = $key$jscomp$131_node$jscomp$79$$.getAttribute($setDOM$$module$set_dom$src$index$$.$G$) || $key$jscomp$131_node$jscomp$79$$.id)) {
    return $KEY_PREFIX$$module$set_dom$src$index$$ + $key$jscomp$131_node$jscomp$79$$;
  }
}, $mount$$module$set_dom$src$index$$ = function($node$jscomp$82$$) {
  $dispatch$$module$set_dom$src$index$$($node$jscomp$82$$, "mount");
}, $dispatch$$module$set_dom$src$index$$ = function($node$jscomp$84$$, $type$jscomp$185$$) {
  if ($getKey$$module$set_dom$src$index$$($node$jscomp$84$$)) {
    var $child$jscomp$26_ev$jscomp$17$$ = window.document.createEvent("Event"), $prop$jscomp$10$$ = {value:$node$jscomp$84$$};
    $child$jscomp$26_ev$jscomp$17$$.initEvent($type$jscomp$185$$, !1, !1);
    Object.defineProperty($child$jscomp$26_ev$jscomp$17$$, "target", $prop$jscomp$10$$);
    Object.defineProperty($child$jscomp$26_ev$jscomp$17$$, "srcElement", $prop$jscomp$10$$);
    $node$jscomp$84$$.dispatchEvent($child$jscomp$26_ev$jscomp$17$$);
  }
  for ($child$jscomp$26_ev$jscomp$17$$ = $node$jscomp$84$$.firstChild; $child$jscomp$26_ev$jscomp$17$$;) {
    $child$jscomp$26_ev$jscomp$17$$ = $dispatch$$module$set_dom$src$index$$($child$jscomp$26_ev$jscomp$17$$, $type$jscomp$185$$).nextSibling;
  }
  return $node$jscomp$84$$;
}, $AmpList$$module$extensions$amp_list$0_1$amp_list$$ = function($element$jscomp$490$$) {
  var $$jscomp$super$this$jscomp$71$$ = window.AMP.BaseElement.call(this, $element$jscomp$490$$) || this;
  $$jscomp$super$this$jscomp$71$$.$container_$ = null;
  $$jscomp$super$this$jscomp$71$$.$viewport_$ = null;
  $$jscomp$super$this$jscomp$71$$.$fallbackDisplayed_$ = !1;
  $$jscomp$super$this$jscomp$71$$.$renderPass_$ = new _.$Pass$$module$src$pass$$($$jscomp$super$this$jscomp$71$$.$win$, function() {
    return $JSCompiler_StaticMethods_doRenderPass_$$($$jscomp$super$this$jscomp$71$$);
  });
  $$jscomp$super$this$jscomp$71$$.$renderItems_$ = null;
  $$jscomp$super$this$jscomp$71$$.$renderedItems_$ = null;
  $$jscomp$super$this$jscomp$71$$.$templates_$ = _.$Services$$module$src$services$templatesFor$$($$jscomp$super$this$jscomp$71$$.$win$);
  $$jscomp$super$this$jscomp$71$$.$layoutCompleted_$ = !1;
  $$jscomp$super$this$jscomp$71$$.$initialSrc_$ = null;
  $$jscomp$super$this$jscomp$71$$.$bind_$ = null;
  $$jscomp$super$this$jscomp$71$$.$loadMoreEnabled_$ = _.$isExperimentOn$$module$src$experiments$$($$jscomp$super$this$jscomp$71$$.$win$, "amp-list-load-more") && $element$jscomp$490$$.hasAttribute("load-more");
  $$jscomp$super$this$jscomp$71$$.$loadMoreSrc_$ = null;
  $$jscomp$super$this$jscomp$71$$.$loadMoreButton_$ = null;
  $$jscomp$super$this$jscomp$71$$.$loadMoreButtonClickable_$ = null;
  $$jscomp$super$this$jscomp$71$$.$loadMoreLoadingElement_$ = null;
  $$jscomp$super$this$jscomp$71$$.$loadMoreFailedElement_$ = null;
  $$jscomp$super$this$jscomp$71$$.$loadMoreFailedClickable_$ = null;
  $$jscomp$super$this$jscomp$71$$.$loadMoreEndElement_$ = null;
  $$jscomp$super$this$jscomp$71$$.$unlistenLoadMore_$ = null;
  $$jscomp$super$this$jscomp$71$$.$loadMoreShown_$ = !1;
  _.$JSCompiler_StaticMethods_registerAction$$($$jscomp$super$this$jscomp$71$$, "refresh", function() {
    if ($$jscomp$super$this$jscomp$71$$.$layoutCompleted_$) {
      return $JSCompiler_StaticMethods_resetIfNecessary_$$($$jscomp$super$this$jscomp$71$$), $JSCompiler_StaticMethods_fetchList_$$($$jscomp$super$this$jscomp$71$$, !1, !0);
    }
  }, 100);
  _.$isExperimentOn$$module$src$experiments$$($$jscomp$super$this$jscomp$71$$.$win$, "amp-list-resizable-children") && _.$JSCompiler_StaticMethods_registerAction$$($$jscomp$super$this$jscomp$71$$, "changeToLayoutContainer", function() {
    return $JSCompiler_StaticMethods_changeToLayoutContainer_$$($$jscomp$super$this$jscomp$71$$);
  }, 100);
  $$jscomp$super$this$jscomp$71$$.$ssrTemplateHelper_$ = null;
  return $$jscomp$super$this$jscomp$71$$;
}, $JSCompiler_StaticMethods_getLoadMoreButton_$$ = function($JSCompiler_StaticMethods_getLoadMoreButton_$self$$) {
  $JSCompiler_StaticMethods_getLoadMoreButton_$self$$.$loadMoreButton_$ || ($JSCompiler_StaticMethods_getLoadMoreButton_$self$$.$loadMoreButton_$ = _.$childElementByAttr$$module$src$dom$$($JSCompiler_StaticMethods_getLoadMoreButton_$self$$.element, "load-more-button"), $JSCompiler_StaticMethods_getLoadMoreButton_$self$$.$loadMoreButton_$ || ($JSCompiler_StaticMethods_getLoadMoreButton_$self$$.$loadMoreButton_$ = _.$htmlFor$$module$src$static_template$$($JSCompiler_StaticMethods_getLoadMoreButton_$self$$.$win$.document)($_template$$module$extensions$amp_list$0_1$amp_list$$)));
  return $JSCompiler_StaticMethods_getLoadMoreButton_$self$$.$loadMoreButton_$;
}, $JSCompiler_StaticMethods_getLoadMoreButtonClickable_$$ = function($JSCompiler_StaticMethods_getLoadMoreButtonClickable_$self$$) {
  if (!$JSCompiler_StaticMethods_getLoadMoreButtonClickable_$self$$.$loadMoreButtonClickable_$) {
    var $loadMoreButton$$ = $JSCompiler_StaticMethods_getLoadMoreButton_$$($JSCompiler_StaticMethods_getLoadMoreButtonClickable_$self$$);
    $JSCompiler_StaticMethods_getLoadMoreButtonClickable_$self$$.$loadMoreButtonClickable_$ = _.$childElementByAttr$$module$src$dom$$($loadMoreButton$$, "load-more-clickable") || $loadMoreButton$$;
  }
  return $JSCompiler_StaticMethods_getLoadMoreButtonClickable_$self$$.$loadMoreButtonClickable_$;
}, $JSCompiler_StaticMethods_createContainer_$$ = function($JSCompiler_StaticMethods_createContainer_$self_container$jscomp$19$$) {
  $JSCompiler_StaticMethods_createContainer_$self_container$jscomp$19$$ = $JSCompiler_StaticMethods_createContainer_$self_container$jscomp$19$$.$win$.document.createElement("div");
  $JSCompiler_StaticMethods_createContainer_$self_container$jscomp$19$$.setAttribute("role", "list");
  _.$JSCompiler_StaticMethods_applyFillContent$$($JSCompiler_StaticMethods_createContainer_$self_container$jscomp$19$$, !0);
  return $JSCompiler_StaticMethods_createContainer_$self_container$jscomp$19$$;
}, $JSCompiler_StaticMethods_addElementsToContainer_$$ = function($elements$jscomp$32$$, $container$jscomp$20$$) {
  $elements$jscomp$32$$.forEach(function($elements$jscomp$32$$) {
    $elements$jscomp$32$$.hasAttribute("role") || $elements$jscomp$32$$.setAttribute("role", "listitem");
    $container$jscomp$20$$.appendChild($elements$jscomp$32$$);
  });
}, $JSCompiler_StaticMethods_toggleFallback_$$ = function($JSCompiler_StaticMethods_toggleFallback_$self$$, $show$jscomp$4$$) {
  if ($show$jscomp$4$$ || $JSCompiler_StaticMethods_toggleFallback_$self$$.$fallbackDisplayed_$) {
    $JSCompiler_StaticMethods_toggleFallback_$self$$.$toggleFallback$($show$jscomp$4$$), $JSCompiler_StaticMethods_toggleFallback_$self$$.$fallbackDisplayed_$ = $show$jscomp$4$$;
  }
}, $JSCompiler_StaticMethods_resetIfNecessary_$$ = function($JSCompiler_StaticMethods_resetIfNecessary_$self$$, $isFetch$$) {
  if ((void 0 === $isFetch$$ || $isFetch$$) && $JSCompiler_StaticMethods_resetIfNecessary_$self$$.element.hasAttribute("reset-on-refresh") || "always" === $JSCompiler_StaticMethods_resetIfNecessary_$self$$.element.getAttribute("reset-on-refresh")) {
    $JSCompiler_StaticMethods_resetIfNecessary_$self$$.$togglePlaceholder$(!0), $JSCompiler_StaticMethods_resetIfNecessary_$self$$.$toggleLoading$(!0, !0), $JSCompiler_StaticMethods_resetIfNecessary_$self$$.$mutateElement$(function() {
      $JSCompiler_StaticMethods_toggleFallback_$$($JSCompiler_StaticMethods_resetIfNecessary_$self$$, !1);
      _.$removeChildren$$module$src$dom$$($JSCompiler_StaticMethods_resetIfNecessary_$self$$.$container_$);
    });
  }
}, $JSCompiler_StaticMethods_fetchList_$$ = function($JSCompiler_StaticMethods_fetchList_$self$$, $opt_append$$, $fetch$jscomp$1_opt_refresh$jscomp$4$$) {
  $opt_append$$ = void 0 === $opt_append$$ ? !1 : $opt_append$$;
  $fetch$jscomp$1_opt_refresh$jscomp$4$$ = void 0 === $fetch$jscomp$1_opt_refresh$jscomp$4$$ ? !1 : $fetch$jscomp$1_opt_refresh$jscomp$4$$;
  if (!$JSCompiler_StaticMethods_fetchList_$self$$.element.getAttribute("src")) {
    return window.Promise.resolve();
  }
  if ($JSCompiler_StaticMethods_fetchList_$self$$.$ssrTemplateHelper_$.isSupported()) {
    $fetch$jscomp$1_opt_refresh$jscomp$4$$ = $JSCompiler_StaticMethods_ssrTemplate_$$($JSCompiler_StaticMethods_fetchList_$self$$, $fetch$jscomp$1_opt_refresh$jscomp$4$$);
  } else {
    var $itemsExpr$$ = $JSCompiler_StaticMethods_fetchList_$self$$.element.getAttribute("items") || "items";
    $fetch$jscomp$1_opt_refresh$jscomp$4$$ = $JSCompiler_StaticMethods_AmpList$$module$extensions$amp_list$0_1$amp_list_prototype$fetch_$$($JSCompiler_StaticMethods_fetchList_$self$$, $fetch$jscomp$1_opt_refresh$jscomp$4$$).then(function($fetch$jscomp$1_opt_refresh$jscomp$4$$) {
      var $data$jscomp$140$$ = $fetch$jscomp$1_opt_refresh$jscomp$4$$;
      "." != $itemsExpr$$ && ($data$jscomp$140$$ = _.$getValueForExpr$$module$src$json$$($fetch$jscomp$1_opt_refresh$jscomp$4$$, $itemsExpr$$));
      $JSCompiler_StaticMethods_fetchList_$self$$.element.hasAttribute("single-item") && !_.$isArray$$module$src$types$$($data$jscomp$140$$) && ($data$jscomp$140$$ = [$data$jscomp$140$$]);
      var $JSCompiler_StaticMethods_assertArray$self$jscomp$inline_3609_maxLen$jscomp$inline_3615_nextExpr$jscomp$inline_3619$$ = _.$user$$module$src$log$$();
      $JSCompiler_StaticMethods_assertArray$self$jscomp$inline_3609_maxLen$jscomp$inline_3615_nextExpr$jscomp$inline_3619$$.$Log$$module$src$log_prototype$assert$(Array.isArray($data$jscomp$140$$), "Array expected: %s", $data$jscomp$140$$);
      $JSCompiler_StaticMethods_fetchList_$self$$.element.hasAttribute("max-items") && ($JSCompiler_StaticMethods_assertArray$self$jscomp$inline_3609_maxLen$jscomp$inline_3615_nextExpr$jscomp$inline_3619$$ = (0,window.parseInt)($JSCompiler_StaticMethods_fetchList_$self$$.element.getAttribute("max-items"), 10), $JSCompiler_StaticMethods_assertArray$self$jscomp$inline_3609_maxLen$jscomp$inline_3615_nextExpr$jscomp$inline_3619$$ < $data$jscomp$140$$.length && ($data$jscomp$140$$ = $data$jscomp$140$$.slice(0, 
      $JSCompiler_StaticMethods_assertArray$self$jscomp$inline_3609_maxLen$jscomp$inline_3615_nextExpr$jscomp$inline_3619$$)));
      $JSCompiler_StaticMethods_fetchList_$self$$.$loadMoreEnabled_$ && ($JSCompiler_StaticMethods_assertArray$self$jscomp$inline_3609_maxLen$jscomp$inline_3615_nextExpr$jscomp$inline_3619$$ = $JSCompiler_StaticMethods_fetchList_$self$$.element.getAttribute("load-more-bookmark") || "load-more-src", $JSCompiler_StaticMethods_fetchList_$self$$.$loadMoreSrc_$ = _.$getValueForExpr$$module$src$json$$($fetch$jscomp$1_opt_refresh$jscomp$4$$, $JSCompiler_StaticMethods_assertArray$self$jscomp$inline_3609_maxLen$jscomp$inline_3615_nextExpr$jscomp$inline_3619$$));
      return $JSCompiler_StaticMethods_scheduleRender_$$($JSCompiler_StaticMethods_fetchList_$self$$, $data$jscomp$140$$, !!$opt_append$$, $fetch$jscomp$1_opt_refresh$jscomp$4$$);
    });
  }
  return $fetch$jscomp$1_opt_refresh$jscomp$4$$.catch(function($fetch$jscomp$1_opt_refresh$jscomp$4$$) {
    if ($opt_append$$) {
      throw $fetch$jscomp$1_opt_refresh$jscomp$4$$;
    }
    $JSCompiler_StaticMethods_fetchList_$self$$.$toggleLoading$(!1);
    if ($JSCompiler_StaticMethods_fetchList_$self$$.$getFallback$()) {
      $JSCompiler_StaticMethods_toggleFallback_$$($JSCompiler_StaticMethods_fetchList_$self$$, !0), $JSCompiler_StaticMethods_fetchList_$self$$.$togglePlaceholder$(!1);
    } else {
      throw $fetch$jscomp$1_opt_refresh$jscomp$4$$;
    }
  });
}, $JSCompiler_StaticMethods_ssrTemplate_$$ = function($JSCompiler_StaticMethods_ssrTemplate_$self$$, $refresh$jscomp$3$$) {
  var $request$jscomp$35$$;
  return _.$requestForBatchFetch$$module$src$batched_json$$($JSCompiler_StaticMethods_ssrTemplate_$self$$.element, $JSCompiler_StaticMethods_getPolicy_$$($JSCompiler_StaticMethods_ssrTemplate_$self$$), $refresh$jscomp$3$$).then(function($refresh$jscomp$3$$) {
    $request$jscomp$35$$ = $refresh$jscomp$3$$;
    $request$jscomp$35$$.xhrUrl = _.$setupInput$$module$src$utils$xhr_utils$$($JSCompiler_StaticMethods_ssrTemplate_$self$$.$win$, $request$jscomp$35$$.xhrUrl, $request$jscomp$35$$.fetchOpt);
    $request$jscomp$35$$.fetchOpt = _.$setupAMPCors$$module$src$utils$xhr_utils$$($JSCompiler_StaticMethods_ssrTemplate_$self$$.$win$, $request$jscomp$35$$.xhrUrl, $request$jscomp$35$$.fetchOpt);
    _.$setupJsonFetchInit$$module$src$utils$xhr_utils$$($refresh$jscomp$3$$.fetchOpt);
    $refresh$jscomp$3$$ = _.$dict$$module$src$utils$object$$({ampListAttributes:{items:$JSCompiler_StaticMethods_ssrTemplate_$self$$.element.getAttribute("items") || "items", singleItem:$JSCompiler_StaticMethods_ssrTemplate_$self$$.element.hasAttribute("single-item"), maxItems:$JSCompiler_StaticMethods_ssrTemplate_$self$$.element.getAttribute("max-items")}});
    return _.$JSCompiler_StaticMethods_fetchAndRenderTemplate$$($JSCompiler_StaticMethods_ssrTemplate_$self$$.$ssrTemplateHelper_$, $JSCompiler_StaticMethods_ssrTemplate_$self$$.element, $request$jscomp$35$$, null, $refresh$jscomp$3$$);
  }).then(function($refresh$jscomp$3$$) {
    $request$jscomp$35$$.fetchOpt.responseType = "application/json";
    _.$verifyAmpCORSHeaders$$module$src$utils$xhr_utils$$($JSCompiler_StaticMethods_ssrTemplate_$self$$.$win$, _.$fromStructuredCloneable$$module$src$utils$xhr_utils$$($refresh$jscomp$3$$, $request$jscomp$35$$.fetchOpt.responseType));
    return $refresh$jscomp$3$$.html;
  }, function($JSCompiler_StaticMethods_ssrTemplate_$self$$) {
    throw _.$user$$module$src$log$$().$createError$("Error proxying amp-list templates", $JSCompiler_StaticMethods_ssrTemplate_$self$$);
  }).then(function($refresh$jscomp$3$$) {
    return $JSCompiler_StaticMethods_scheduleRender_$$($JSCompiler_StaticMethods_ssrTemplate_$self$$, $refresh$jscomp$3$$, !1);
  });
}, $JSCompiler_StaticMethods_scheduleRender_$$ = function($JSCompiler_StaticMethods_scheduleRender_$self$$, $data$jscomp$142$$, $append$$, $opt_payload$jscomp$3$$) {
  _.$dev$$module$src$log$$().$Log$$module$src$log_prototype$info$("amp-list", "schedule:", $data$jscomp$142$$);
  var $$jscomp$destructuring$var445_rejecter$$ = new _.$Deferred$$module$src$utils$promise$$, $promise$jscomp$49$$ = $$jscomp$destructuring$var445_rejecter$$.$promise$, $resolver$jscomp$5$$ = $$jscomp$destructuring$var445_rejecter$$.resolve;
  $$jscomp$destructuring$var445_rejecter$$ = $$jscomp$destructuring$var445_rejecter$$.reject;
  $JSCompiler_StaticMethods_scheduleRender_$self$$.$renderItems_$ || _.$JSCompiler_StaticMethods_schedule$$($JSCompiler_StaticMethods_scheduleRender_$self$$.$renderPass_$);
  $JSCompiler_StaticMethods_scheduleRender_$self$$.$renderItems_$ = {data:$data$jscomp$142$$, append:$append$$, $resolver$:$resolver$jscomp$5$$, $rejecter$:$$jscomp$destructuring$var445_rejecter$$, $payload$:$opt_payload$jscomp$3$$};
  $JSCompiler_StaticMethods_scheduleRender_$self$$.$renderedItems_$ && $append$$ && ($JSCompiler_StaticMethods_scheduleRender_$self$$.$renderItems_$.$payload$ = $opt_payload$jscomp$3$$ || {});
  return $promise$jscomp$49$$;
}, $JSCompiler_StaticMethods_doRenderPass_$$ = function($JSCompiler_StaticMethods_doRenderPass_$self$$) {
  function $onRejectedCallback$$() {
    $scheduleNextPass$$();
    $current$jscomp$6$$.$rejecter$();
  }
  function $onFulfilledCallback$$() {
    $scheduleNextPass$$();
    $current$jscomp$6$$.$resolver$();
  }
  function $scheduleNextPass$$() {
    $JSCompiler_StaticMethods_doRenderPass_$self$$.$renderItems_$ !== $current$jscomp$6$$ ? _.$JSCompiler_StaticMethods_schedule$$($JSCompiler_StaticMethods_doRenderPass_$self$$.$renderPass_$, 1) : ($JSCompiler_StaticMethods_doRenderPass_$self$$.$renderedItems_$ = $JSCompiler_StaticMethods_doRenderPass_$self$$.$renderItems_$.data, $JSCompiler_StaticMethods_doRenderPass_$self$$.$renderItems_$ = null);
  }
  var $current$jscomp$6$$ = $JSCompiler_StaticMethods_doRenderPass_$self$$.$renderItems_$;
  _.$dev$$module$src$log$$().$Log$$module$src$log_prototype$info$("amp-list", "pass:", $current$jscomp$6$$);
  if ($JSCompiler_StaticMethods_doRenderPass_$self$$.$ssrTemplateHelper_$.isSupported()) {
    $JSCompiler_StaticMethods_findAndSetHtmlForTemplate$$($JSCompiler_StaticMethods_doRenderPass_$self$$.$templates_$, $JSCompiler_StaticMethods_doRenderPass_$self$$.element, $current$jscomp$6$$.data).then(function($onRejectedCallback$$) {
      return $JSCompiler_StaticMethods_updateBindings_$$($JSCompiler_StaticMethods_doRenderPass_$self$$, [$onRejectedCallback$$]);
    }).then(function($onRejectedCallback$$) {
      return $JSCompiler_StaticMethods_AmpList$$module$extensions$amp_list$0_1$amp_list_prototype$render_$$($JSCompiler_StaticMethods_doRenderPass_$self$$, $onRejectedCallback$$, $current$jscomp$6$$.append);
    }).then($onFulfilledCallback$$, $onRejectedCallback$$);
  } else {
    var $payload$jscomp$19$$ = $current$jscomp$6$$.$payload$;
    $JSCompiler_StaticMethods_findAndRenderTemplateArray$$($JSCompiler_StaticMethods_doRenderPass_$self$$.$templates_$, $JSCompiler_StaticMethods_doRenderPass_$self$$.element, $current$jscomp$6$$.data).then(function($onRejectedCallback$$) {
      return $JSCompiler_StaticMethods_updateBindings_$$($JSCompiler_StaticMethods_doRenderPass_$self$$, $onRejectedCallback$$);
    }).then(function($onRejectedCallback$$) {
      return $JSCompiler_StaticMethods_AmpList$$module$extensions$amp_list$0_1$amp_list_prototype$render_$$($JSCompiler_StaticMethods_doRenderPass_$self$$, $onRejectedCallback$$, $current$jscomp$6$$.append);
    }).then(function() {
      if ($JSCompiler_StaticMethods_doRenderPass_$self$$.$loadMoreEnabled_$) {
        var $onRejectedCallback$$ = [];
        $onRejectedCallback$$.push($JSCompiler_StaticMethods_maybeRenderLoadMoreElement_$$($JSCompiler_StaticMethods_doRenderPass_$self$$, $JSCompiler_StaticMethods_getLoadMoreButton_$$($JSCompiler_StaticMethods_doRenderPass_$self$$), $payload$jscomp$19$$));
        $onRejectedCallback$$.push($JSCompiler_StaticMethods_maybeRenderLoadMoreElement_$$($JSCompiler_StaticMethods_doRenderPass_$self$$, $JSCompiler_StaticMethods_getLoadMoreEndElement_$$($JSCompiler_StaticMethods_doRenderPass_$self$$), $payload$jscomp$19$$));
        $onRejectedCallback$$ = window.Promise.all($onRejectedCallback$$);
      } else {
        $onRejectedCallback$$ = window.Promise.resolve();
      }
      return $onRejectedCallback$$;
    }).then(function() {
      return $JSCompiler_StaticMethods_maybeSetLoadMore_$$($JSCompiler_StaticMethods_doRenderPass_$self$$);
    }).then($onFulfilledCallback$$, $onRejectedCallback$$);
  }
}, $JSCompiler_StaticMethods_maybeRenderLoadMoreElement_$$ = function($JSCompiler_StaticMethods_maybeRenderLoadMoreElement_$self$$, $elem$jscomp$21$$, $data$jscomp$144$$) {
  return $elem$jscomp$21$$ && _.$JSCompiler_StaticMethods_maybeFindTemplate$$($elem$jscomp$21$$, void 0) ? _.$JSCompiler_StaticMethods_findAndRenderTemplate$$($JSCompiler_StaticMethods_maybeRenderLoadMoreElement_$self$$.$templates_$, $elem$jscomp$21$$, $data$jscomp$144$$).then(function($data$jscomp$144$$) {
    return $JSCompiler_StaticMethods_maybeRenderLoadMoreElement_$self$$.$mutateElement$(function() {
      _.$removeChildren$$module$src$dom$$($elem$jscomp$21$$);
      $elem$jscomp$21$$.appendChild($data$jscomp$144$$);
    });
  }) : window.Promise.resolve();
}, $JSCompiler_StaticMethods_updateBindings_$$ = function($JSCompiler_StaticMethods_updateBindings_$self$$, $elements$jscomp$34$$) {
  function $updateWith$$($updateWith$$) {
    return $updateWith$$.$scanAndApply$($elements$jscomp$34$$, [$JSCompiler_StaticMethods_updateBindings_$self$$.$container_$]).then(function() {
      return $elements$jscomp$34$$;
    }, function() {
      return $elements$jscomp$34$$;
    });
  }
  var $binding$jscomp$10$$ = $JSCompiler_StaticMethods_updateBindings_$self$$.element.getAttribute("binding");
  return "no" === $binding$jscomp$10$$ ? window.Promise.resolve($elements$jscomp$34$$) : "refresh" === $binding$jscomp$10$$ ? $JSCompiler_StaticMethods_updateBindings_$self$$.$bind_$ && $JSCompiler_StaticMethods_updateBindings_$self$$.$bind_$.signals().get("FIRST_MUTATE") ? $updateWith$$($JSCompiler_StaticMethods_updateBindings_$self$$.$bind_$) : window.Promise.resolve($elements$jscomp$34$$) : _.$getElementServiceIfAvailableForDocInEmbedScope$$module$src$element_service$$($JSCompiler_StaticMethods_updateBindings_$self$$.element).then(function($JSCompiler_StaticMethods_updateBindings_$self$$) {
    return $JSCompiler_StaticMethods_updateBindings_$self$$ ? $updateWith$$($JSCompiler_StaticMethods_updateBindings_$self$$) : window.Promise.resolve($elements$jscomp$34$$);
  });
}, $JSCompiler_StaticMethods_AmpList$$module$extensions$amp_list$0_1$amp_list_prototype$render_$$ = function($JSCompiler_StaticMethods_AmpList$$module$extensions$amp_list$0_1$amp_list_prototype$render_$self$$, $elements$jscomp$35$$, $opt_append$jscomp$1$$) {
  $opt_append$jscomp$1$$ = void 0 === $opt_append$jscomp$1$$ ? !1 : $opt_append$jscomp$1$$;
  _.$dev$$module$src$log$$().$Log$$module$src$log_prototype$info$("amp-list", "render:", $elements$jscomp$35$$);
  var $container$jscomp$21$$ = $JSCompiler_StaticMethods_AmpList$$module$extensions$amp_list$0_1$amp_list_prototype$render_$self$$.$container_$;
  return $JSCompiler_StaticMethods_AmpList$$module$extensions$amp_list$0_1$amp_list_prototype$render_$self$$.$mutateElement$(function() {
    $JSCompiler_StaticMethods_AmpList$$module$extensions$amp_list$0_1$amp_list_prototype$render_$self$$.$toggleLoading$(!1);
    $JSCompiler_StaticMethods_AmpList$$module$extensions$amp_list$0_1$amp_list_prototype$render_$self$$.$getFallback$() && $JSCompiler_StaticMethods_toggleFallback_$$($JSCompiler_StaticMethods_AmpList$$module$extensions$amp_list$0_1$amp_list_prototype$render_$self$$, !1);
    $JSCompiler_StaticMethods_AmpList$$module$extensions$amp_list$0_1$amp_list_prototype$render_$self$$.$togglePlaceholder$(!1);
    if (_.$isExperimentOn$$module$src$experiments$$($JSCompiler_StaticMethods_AmpList$$module$extensions$amp_list$0_1$amp_list_prototype$render_$self$$.$win$, "amp-list-diffing") && $container$jscomp$21$$.hasChildNodes()) {
      var $event$jscomp$154_loadMoreEndElement$jscomp$inline_3637_newContainer$$ = $JSCompiler_StaticMethods_createContainer_$$($JSCompiler_StaticMethods_AmpList$$module$extensions$amp_list$0_1$amp_list_prototype$render_$self$$);
      $JSCompiler_StaticMethods_addElementsToContainer_$$($elements$jscomp$35$$, $event$jscomp$154_loadMoreEndElement$jscomp$inline_3637_newContainer$$);
      var $diff$jscomp$2$$ = $module$set_dom$src$index$$.default || $module$set_dom$src$index$$;
      $diff$jscomp$2$$.$G$ = "i-amphtml-key";
      $diff$jscomp$2$$($container$jscomp$21$$, $event$jscomp$154_loadMoreEndElement$jscomp$inline_3637_newContainer$$);
    } else {
      $opt_append$jscomp$1$$ || _.$removeChildren$$module$src$dom$$($container$jscomp$21$$), $JSCompiler_StaticMethods_addElementsToContainer_$$($elements$jscomp$35$$, $container$jscomp$21$$), $JSCompiler_StaticMethods_AmpList$$module$extensions$amp_list$0_1$amp_list_prototype$render_$self$$.$loadMoreEnabled_$ && ($container$jscomp$21$$.appendChild($JSCompiler_StaticMethods_getLoadMoreButton_$$($JSCompiler_StaticMethods_AmpList$$module$extensions$amp_list$0_1$amp_list_prototype$render_$self$$)), 
      $container$jscomp$21$$.appendChild($JSCompiler_StaticMethods_getLoadMoreFailedElement_$$($JSCompiler_StaticMethods_AmpList$$module$extensions$amp_list$0_1$amp_list_prototype$render_$self$$)), $container$jscomp$21$$.appendChild($JSCompiler_StaticMethods_getLoadMoreLoadingElement_$$($JSCompiler_StaticMethods_AmpList$$module$extensions$amp_list$0_1$amp_list_prototype$render_$self$$)), ($event$jscomp$154_loadMoreEndElement$jscomp$inline_3637_newContainer$$ = $JSCompiler_StaticMethods_getLoadMoreEndElement_$$($JSCompiler_StaticMethods_AmpList$$module$extensions$amp_list$0_1$amp_list_prototype$render_$self$$)) && 
      $container$jscomp$21$$.appendChild($event$jscomp$154_loadMoreEndElement$jscomp$inline_3637_newContainer$$));
    }
    $event$jscomp$154_loadMoreEndElement$jscomp$inline_3637_newContainer$$ = _.$createCustomEvent$$module$src$event_helper$$($JSCompiler_StaticMethods_AmpList$$module$extensions$amp_list$0_1$amp_list_prototype$render_$self$$.$win$, "amp:dom-update", null, {bubbles:!0});
    $JSCompiler_StaticMethods_AmpList$$module$extensions$amp_list$0_1$amp_list_prototype$render_$self$$.$container_$.dispatchEvent($event$jscomp$154_loadMoreEndElement$jscomp$inline_3637_newContainer$$);
    _.$Resource$$module$src$service$resource$forElementOptional$$($JSCompiler_StaticMethods_AmpList$$module$extensions$amp_list$0_1$amp_list_prototype$render_$self$$.element).$P$ = void 0;
    $JSCompiler_StaticMethods_attemptToFit_$$($JSCompiler_StaticMethods_AmpList$$module$extensions$amp_list$0_1$amp_list_prototype$render_$self$$, $JSCompiler_StaticMethods_AmpList$$module$extensions$amp_list$0_1$amp_list_prototype$render_$self$$.$container_$);
  });
}, $JSCompiler_StaticMethods_attemptToFit_$$ = function($JSCompiler_StaticMethods_attemptToFit_$self$$, $target$jscomp$155$$) {
  "container" != $JSCompiler_StaticMethods_attemptToFit_$self$$.element.getAttribute("layout") && $JSCompiler_StaticMethods_attemptToFit_$self$$.$measureElement$(function() {
    var $scrollHeight$jscomp$2$$ = $target$jscomp$155$$.scrollHeight;
    $scrollHeight$jscomp$2$$ > $JSCompiler_StaticMethods_attemptToFit_$self$$.element.offsetHeight && _.$JSCompiler_StaticMethods_attemptChangeHeight$$($JSCompiler_StaticMethods_attemptToFit_$self$$, $scrollHeight$jscomp$2$$).then(function() {
      $JSCompiler_StaticMethods_attemptToFit_$self$$.$loadMoreEnabled_$ && $JSCompiler_StaticMethods_attemptToFit_$self$$.$mutateElement$(function() {
        $JSCompiler_StaticMethods_attemptToFit_$self$$.$loadMoreButton_$.classList.remove("i-amphtml-list-load-more-overflow");
      });
    }).catch(function() {
      $JSCompiler_StaticMethods_attemptToFit_$self$$.$loadMoreEnabled_$ && $JSCompiler_StaticMethods_attemptToFit_$self$$.$mutateElement$(function() {
        $JSCompiler_StaticMethods_attemptToFit_$self$$.$loadMoreButton_$.classList.add("i-amphtml-list-load-more-overflow");
        $JSCompiler_StaticMethods_attemptToFit_$self$$.element.appendChild($JSCompiler_StaticMethods_attemptToFit_$self$$.$loadMoreButton_$);
      });
    });
  });
}, $JSCompiler_StaticMethods_changeToLayoutContainer_$$ = function($JSCompiler_StaticMethods_changeToLayoutContainer_$self$$) {
  var $previousLayout$jscomp$1$$ = $JSCompiler_StaticMethods_changeToLayoutContainer_$self$$.element.getAttribute("layout");
  return "container" == $previousLayout$jscomp$1$$ ? window.Promise.resolve() : $JSCompiler_StaticMethods_changeToLayoutContainer_$self$$.$mutateElement$(function() {
    switch($previousLayout$jscomp$1$$) {
      case "responsive":
        $JSCompiler_StaticMethods_changeToLayoutContainer_$self$$.element.classList.remove("i-amphtml-layout-responsive");
        _.$setStyles$$module$src$style$$($JSCompiler_StaticMethods_changeToLayoutContainer_$self$$.element, {height:"", width:""});
        break;
      case "flex-item":
        _.$setStyles$$module$src$style$$($JSCompiler_StaticMethods_changeToLayoutContainer_$self$$.element, {height:"", width:""});
        break;
      case "fixed":
        $JSCompiler_StaticMethods_changeToLayoutContainer_$self$$.element.classList.remove("i-amphtml-layout-fixed");
        _.$setStyles$$module$src$style$$($JSCompiler_StaticMethods_changeToLayoutContainer_$self$$.element, {height:""});
        break;
      case "fixed-height":
        $JSCompiler_StaticMethods_changeToLayoutContainer_$self$$.element.classList.remove("i-amphtml-layout-fixed-height");
        _.$setStyles$$module$src$style$$($JSCompiler_StaticMethods_changeToLayoutContainer_$self$$.element, {height:"", width:""});
        break;
      case "intrinsic":
        $JSCompiler_StaticMethods_changeToLayoutContainer_$self$$.element.classList.remove("i-amphtml-layout-intrinsic");
    }
    $JSCompiler_StaticMethods_changeToLayoutContainer_$self$$.element.$changeSize$();
    $JSCompiler_StaticMethods_changeToLayoutContainer_$self$$.element.classList.remove("i-amphtml-layout-size-defined");
    $JSCompiler_StaticMethods_changeToLayoutContainer_$self$$.$container_$.classList.remove("i-amphtml-fill-content", "i-amphtml-replaced-content");
    var $overflowElement$jscomp$1$$ = $JSCompiler_StaticMethods_changeToLayoutContainer_$self$$.$getOverflowElement$();
    $overflowElement$jscomp$1$$ && _.$toggle$$module$src$style$$($overflowElement$jscomp$1$$, !1);
    $JSCompiler_StaticMethods_changeToLayoutContainer_$self$$.element.classList.add("i-amphtml-layout-container");
    $JSCompiler_StaticMethods_changeToLayoutContainer_$self$$.element.setAttribute("layout", "container");
  });
}, $JSCompiler_StaticMethods_maybeSetLoadMore_$$ = function($JSCompiler_StaticMethods_maybeSetLoadMore_$self$$) {
  if (!$JSCompiler_StaticMethods_maybeSetLoadMore_$self$$.$loadMoreEnabled_$ || !$JSCompiler_StaticMethods_maybeSetLoadMore_$self$$.$loadMoreSrc_$) {
    return window.Promise.resolve();
  }
  "auto" === $JSCompiler_StaticMethods_maybeSetLoadMore_$self$$.element.getAttribute("load-more") && $JSCompiler_StaticMethods_setupLoadMoreAuto_$$($JSCompiler_StaticMethods_maybeSetLoadMore_$self$$);
  var $loadMoreEndElement$$ = $JSCompiler_StaticMethods_getLoadMoreEndElement_$$($JSCompiler_StaticMethods_maybeSetLoadMore_$self$$), $loadMoreButtonClickable$$ = $JSCompiler_StaticMethods_getLoadMoreButtonClickable_$$($JSCompiler_StaticMethods_maybeSetLoadMore_$self$$);
  return $JSCompiler_StaticMethods_maybeSetLoadMore_$self$$.$mutateElement$(function() {
    $JSCompiler_StaticMethods_getLoadMoreButton_$$($JSCompiler_StaticMethods_maybeSetLoadMore_$self$$).classList.toggle("amp-visible", !0);
    $JSCompiler_StaticMethods_getLoadMoreFailedElement_$$($JSCompiler_StaticMethods_maybeSetLoadMore_$self$$).classList.toggle("amp-visible", !1);
    $loadMoreEndElement$$ && $loadMoreEndElement$$.classList.toggle("amp-visible", !1);
    $JSCompiler_StaticMethods_maybeSetLoadMore_$self$$.$unlistenLoadMore_$ = _.$listen$$module$src$event_helper$$($loadMoreButtonClickable$$, "click", function() {
      return $JSCompiler_StaticMethods_loadMoreCallback_$$($JSCompiler_StaticMethods_maybeSetLoadMore_$self$$);
    });
  }).then(function() {
    $JSCompiler_StaticMethods_maybeSetLoadMore_$self$$.$loadMoreShown_$ || ($JSCompiler_StaticMethods_attemptToFit_$$($JSCompiler_StaticMethods_maybeSetLoadMore_$self$$, $JSCompiler_StaticMethods_maybeSetLoadMore_$self$$.$container_$), $JSCompiler_StaticMethods_maybeSetLoadMore_$self$$.$loadMoreShown_$ = !0);
  });
}, $JSCompiler_StaticMethods_loadMoreCallback_$$ = function($JSCompiler_StaticMethods_loadMoreCallback_$self$$) {
  $JSCompiler_StaticMethods_loadMoreCallback_$self$$.$loadMoreSrc_$ && ($JSCompiler_StaticMethods_loadMoreCallback_$self$$.element.setAttribute("src", $JSCompiler_StaticMethods_loadMoreCallback_$self$$.$loadMoreSrc_$), $JSCompiler_StaticMethods_loadMoreCallback_$self$$.$loadMoreSrc_$ = null);
  $JSCompiler_StaticMethods_toggleLoadMoreLoading_$$($JSCompiler_StaticMethods_loadMoreCallback_$self$$, !0);
  return $JSCompiler_StaticMethods_fetchList_$$($JSCompiler_StaticMethods_loadMoreCallback_$self$$, !0).then(function() {
    $JSCompiler_StaticMethods_loadMoreCallback_$self$$.$loadMoreSrc_$ ? $JSCompiler_StaticMethods_toggleLoadMoreLoading_$$($JSCompiler_StaticMethods_loadMoreCallback_$self$$, !1) : $JSCompiler_StaticMethods_setLoadMoreEnded_$$($JSCompiler_StaticMethods_loadMoreCallback_$self$$);
    $JSCompiler_StaticMethods_loadMoreCallback_$self$$.$unlistenLoadMore_$ && ($JSCompiler_StaticMethods_loadMoreCallback_$self$$.$unlistenLoadMore_$(), $JSCompiler_StaticMethods_loadMoreCallback_$self$$.$unlistenLoadMore_$ = null);
  }).catch(function() {
    $JSCompiler_StaticMethods_setLoadMoreFailed_$$($JSCompiler_StaticMethods_loadMoreCallback_$self$$);
  });
}, $JSCompiler_StaticMethods_getLoadMoreLoadingElement_$$ = function($JSCompiler_StaticMethods_getLoadMoreLoadingElement_$self$$) {
  $JSCompiler_StaticMethods_getLoadMoreLoadingElement_$self$$.$loadMoreLoadingElement_$ || ($JSCompiler_StaticMethods_getLoadMoreLoadingElement_$self$$.$loadMoreLoadingElement_$ = _.$childElementByAttr$$module$src$dom$$($JSCompiler_StaticMethods_getLoadMoreLoadingElement_$self$$.element, "load-more-loading"), $JSCompiler_StaticMethods_getLoadMoreLoadingElement_$self$$.$loadMoreLoadingElement_$ || ($JSCompiler_StaticMethods_getLoadMoreLoadingElement_$self$$.$loadMoreLoadingElement_$ = _.$htmlFor$$module$src$static_template$$($JSCompiler_StaticMethods_getLoadMoreLoadingElement_$self$$.$win$.document)($_template2$$module$extensions$amp_list$0_1$amp_list$$)));
  return $JSCompiler_StaticMethods_getLoadMoreLoadingElement_$self$$.$loadMoreLoadingElement_$;
}, $JSCompiler_StaticMethods_setLoadMoreEnded_$$ = function($JSCompiler_StaticMethods_setLoadMoreEnded_$self$$) {
  $JSCompiler_StaticMethods_setLoadMoreEnded_$self$$.$mutateElement$(function() {
    $JSCompiler_StaticMethods_getLoadMoreFailedElement_$$($JSCompiler_StaticMethods_setLoadMoreEnded_$self$$).classList.toggle("amp-visible", !1);
    $JSCompiler_StaticMethods_getLoadMoreButton_$$($JSCompiler_StaticMethods_setLoadMoreEnded_$self$$).classList.toggle("amp-visible", !1);
    $JSCompiler_StaticMethods_getLoadMoreLoadingElement_$$($JSCompiler_StaticMethods_setLoadMoreEnded_$self$$).classList.toggle("amp-visible", !1);
    var $loadMoreEndElement$jscomp$2$$ = $JSCompiler_StaticMethods_getLoadMoreEndElement_$$($JSCompiler_StaticMethods_setLoadMoreEnded_$self$$);
    $loadMoreEndElement$jscomp$2$$ && $loadMoreEndElement$jscomp$2$$.classList.toggle("amp-visible", !0);
  });
}, $JSCompiler_StaticMethods_toggleLoadMoreLoading_$$ = function($JSCompiler_StaticMethods_toggleLoadMoreLoading_$self$$, $state$jscomp$71$$) {
  $JSCompiler_StaticMethods_toggleLoadMoreLoading_$self$$.$mutateElement$(function() {
    if ($state$jscomp$71$$) {
      $JSCompiler_StaticMethods_getLoadMoreFailedElement_$$($JSCompiler_StaticMethods_toggleLoadMoreLoading_$self$$).classList.toggle("amp-visible", !1);
      var $loadMoreEndElement$jscomp$3$$ = $JSCompiler_StaticMethods_getLoadMoreEndElement_$$($JSCompiler_StaticMethods_toggleLoadMoreLoading_$self$$);
      $loadMoreEndElement$jscomp$3$$ && $loadMoreEndElement$jscomp$3$$.classList.toggle("amp-visible", !1);
    }
    $JSCompiler_StaticMethods_getLoadMoreButton_$$($JSCompiler_StaticMethods_toggleLoadMoreLoading_$self$$).classList.toggle("amp-visible", !$state$jscomp$71$$);
    $JSCompiler_StaticMethods_getLoadMoreLoadingElement_$$($JSCompiler_StaticMethods_toggleLoadMoreLoading_$self$$).classList.toggle("amp-visible", $state$jscomp$71$$);
  });
}, $JSCompiler_StaticMethods_setLoadMoreFailed_$$ = function($JSCompiler_StaticMethods_setLoadMoreFailed_$self$$) {
  var $loadMoreFailedElement$$ = $JSCompiler_StaticMethods_getLoadMoreFailedElement_$$($JSCompiler_StaticMethods_setLoadMoreFailed_$self$$), $loadMoreButton$jscomp$1$$ = $JSCompiler_StaticMethods_getLoadMoreButton_$$($JSCompiler_StaticMethods_setLoadMoreFailed_$self$$);
  if ($loadMoreFailedElement$$ || $loadMoreButton$jscomp$1$$) {
    var $loadMoreFailedClickable$$ = $JSCompiler_StaticMethods_getLoadMoreFailedClickable_$$($JSCompiler_StaticMethods_setLoadMoreFailed_$self$$);
    $JSCompiler_StaticMethods_setLoadMoreFailed_$self$$.$mutateElement$(function() {
      $loadMoreFailedElement$$.classList.toggle("amp-visible", !0);
      $JSCompiler_StaticMethods_setLoadMoreFailed_$self$$.$unlistenLoadMore_$ = _.$listen$$module$src$event_helper$$($loadMoreFailedClickable$$, "click", function() {
        return $JSCompiler_StaticMethods_loadMoreCallback_$$($JSCompiler_StaticMethods_setLoadMoreFailed_$self$$);
      });
      $loadMoreButton$jscomp$1$$.classList.toggle("amp-visible", !1);
      $JSCompiler_StaticMethods_getLoadMoreLoadingElement_$$($JSCompiler_StaticMethods_setLoadMoreFailed_$self$$).classList.toggle("amp-visible", !1);
    });
  }
}, $JSCompiler_StaticMethods_getLoadMoreFailedElement_$$ = function($JSCompiler_StaticMethods_getLoadMoreFailedElement_$self$$) {
  $JSCompiler_StaticMethods_getLoadMoreFailedElement_$self$$.$loadMoreFailedElement_$ || ($JSCompiler_StaticMethods_getLoadMoreFailedElement_$self$$.$loadMoreFailedElement_$ = _.$childElementByAttr$$module$src$dom$$($JSCompiler_StaticMethods_getLoadMoreFailedElement_$self$$.element, "load-more-failed"), $JSCompiler_StaticMethods_getLoadMoreFailedElement_$self$$.$loadMoreFailedElement_$ || ($JSCompiler_StaticMethods_getLoadMoreFailedElement_$self$$.$loadMoreFailedElement_$ = _.$htmlFor$$module$src$static_template$$($JSCompiler_StaticMethods_getLoadMoreFailedElement_$self$$.$win$.document)($_template3$$module$extensions$amp_list$0_1$amp_list$$)));
  return $JSCompiler_StaticMethods_getLoadMoreFailedElement_$self$$.$loadMoreFailedElement_$;
}, $JSCompiler_StaticMethods_getLoadMoreFailedClickable_$$ = function($JSCompiler_StaticMethods_getLoadMoreFailedClickable_$self$$) {
  if (!$JSCompiler_StaticMethods_getLoadMoreFailedClickable_$self$$.$loadMoreFailedClickable_$) {
    var $loadFailedElement$$ = $JSCompiler_StaticMethods_getLoadMoreFailedElement_$$($JSCompiler_StaticMethods_getLoadMoreFailedClickable_$self$$);
    $JSCompiler_StaticMethods_getLoadMoreFailedClickable_$self$$.$loadMoreFailedClickable_$ = _.$childElementByAttr$$module$src$dom$$($loadFailedElement$$, "load-more-clickable") || $loadFailedElement$$;
  }
  return $JSCompiler_StaticMethods_getLoadMoreFailedClickable_$self$$.$loadMoreFailedClickable_$;
}, $JSCompiler_StaticMethods_getLoadMoreEndElement_$$ = function($JSCompiler_StaticMethods_getLoadMoreEndElement_$self$$) {
  $JSCompiler_StaticMethods_getLoadMoreEndElement_$self$$.$loadMoreEndElement_$ || ($JSCompiler_StaticMethods_getLoadMoreEndElement_$self$$.$loadMoreEndElement_$ = _.$childElementByAttr$$module$src$dom$$($JSCompiler_StaticMethods_getLoadMoreEndElement_$self$$.element, "load-more-end"));
  return $JSCompiler_StaticMethods_getLoadMoreEndElement_$self$$.$loadMoreEndElement_$;
}, $JSCompiler_StaticMethods_AmpList$$module$extensions$amp_list$0_1$amp_list_prototype$fetch_$$ = function($JSCompiler_StaticMethods_AmpList$$module$extensions$amp_list$0_1$amp_list_prototype$fetch_$self$$, $opt_refresh$jscomp$5$$) {
  $opt_refresh$jscomp$5$$ = void 0 === $opt_refresh$jscomp$5$$ ? !1 : $opt_refresh$jscomp$5$$;
  return _.$batchFetchJsonFor$$module$src$batched_json$$($JSCompiler_StaticMethods_AmpList$$module$extensions$amp_list$0_1$amp_list_prototype$fetch_$self$$.$getAmpDoc$(), $JSCompiler_StaticMethods_AmpList$$module$extensions$amp_list$0_1$amp_list_prototype$fetch_$self$$.element, ".", $JSCompiler_StaticMethods_getPolicy_$$($JSCompiler_StaticMethods_AmpList$$module$extensions$amp_list$0_1$amp_list_prototype$fetch_$self$$), $opt_refresh$jscomp$5$$);
}, $JSCompiler_StaticMethods_setupLoadMoreAuto_$$ = function($JSCompiler_StaticMethods_setupLoadMoreAuto_$self$$) {
  var $loadMoreButton$jscomp$2$$ = $JSCompiler_StaticMethods_setupLoadMoreAuto_$self$$.$loadMoreButton_$;
  _.$JSCompiler_StaticMethods_Viewport$$module$src$service$viewport$viewport_impl_prototype$onScroll$$($JSCompiler_StaticMethods_setupLoadMoreAuto_$self$$.$viewport_$, function() {
    _.$JSCompiler_StaticMethods_getClientRectAsync$$($JSCompiler_StaticMethods_setupLoadMoreAuto_$self$$.$viewport_$, $loadMoreButton$jscomp$2$$).then(function($loadMoreButton$jscomp$2$$) {
      var $positionRect$jscomp$1$$ = _.$JSCompiler_StaticMethods_getRect$$($JSCompiler_StaticMethods_setupLoadMoreAuto_$self$$.$viewport_$);
      $positionRect$jscomp$1$$.bottom + 3 * $positionRect$jscomp$1$$.height > $loadMoreButton$jscomp$2$$.bottom && $JSCompiler_StaticMethods_loadMoreCallback_$$($JSCompiler_StaticMethods_setupLoadMoreAuto_$self$$);
    });
  });
}, $JSCompiler_StaticMethods_getPolicy_$$ = function($JSCompiler_StaticMethods_getPolicy_$self$$) {
  var $src$jscomp$54$$ = $JSCompiler_StaticMethods_getPolicy_$self$$.element.getAttribute("src"), $policy$jscomp$2$$ = 1;
  if ($src$jscomp$54$$ == $JSCompiler_StaticMethods_getPolicy_$self$$.$initialSrc_$ || _.$getSourceOrigin$$module$src$url$$($src$jscomp$54$$) == _.$getSourceOrigin$$module$src$url$$($JSCompiler_StaticMethods_getPolicy_$self$$.$getAmpDoc$().$win$.location)) {
    $policy$jscomp$2$$ = 2;
  }
  return $policy$jscomp$2$$;
};
_.$BaseTemplate$$module$src$service$template_impl$$.prototype.$D$ = _.$JSCompiler_unstubMethod$$(33, function() {
  throw Error("Not implemented");
});
var $parser$$module$set_dom$src$parse_html$$ = window.DOMParser && new window.DOMParser, $supportsHTMLType$$module$set_dom$src$parse_html$$ = !1, $supportsInnerHTML$$module$set_dom$src$parse_html$$ = !1;
try {
  var $parsed$$module$set_dom$src$parse_html$$ = $parser$$module$set_dom$src$parse_html$$.parseFromString('<wbr class="A"/>', "text/html").body.firstChild, $d$$module$set_dom$src$parse_html$$ = window.document.createElement("div");
  $d$$module$set_dom$src$parse_html$$.appendChild($parsed$$module$set_dom$src$parse_html$$);
  if ("A" !== $d$$module$set_dom$src$parse_html$$.firstChild.classList[0]) {
    throw Error();
  }
  $supportsHTMLType$$module$set_dom$src$parse_html$$ = !0;
} catch ($e$262$$) {
}
var $mockDoc$$module$set_dom$src$parse_html$$ = window.document.implementation.createHTMLDocument(""), $mockHTML$$module$set_dom$src$parse_html$$ = $mockDoc$$module$set_dom$src$parse_html$$.documentElement, $mockBody$$module$set_dom$src$parse_html$$ = $mockDoc$$module$set_dom$src$parse_html$$.body;
try {
  $mockHTML$$module$set_dom$src$parse_html$$.innerHTML = $mockHTML$$module$set_dom$src$parse_html$$.innerHTML, $supportsInnerHTML$$module$set_dom$src$parse_html$$ = !0;
} catch ($e$263$$) {
  $parser$$module$set_dom$src$parse_html$$.parseFromString('<wbr class="A"/>', "application/xhtml+xml");
  var $bodyReg$$module$set_dom$src$parse_html$$ = /(<body[^>]*>)([\s\S]*)<\/body>/;
}
var $$jscompDefaultExport$$module$set_dom$src$parse_html$$ = $supportsHTMLType$$module$set_dom$src$parse_html$$ ? $DOMParserParse$$module$set_dom$src$parse_html$$ : $fallbackParse$$module$set_dom$src$parse_html$$;
var $module$set_dom$src$index$$ = {};
$setDOM$$module$set_dom$src$index$$.$G$ = "data-key";
$setDOM$$module$set_dom$src$index$$.$F$ = "data-ignore";
$setDOM$$module$set_dom$src$index$$.$D$ = "data-checksum";
var $KEY_PREFIX$$module$set_dom$src$index$$ = "_set-dom-", $NODE_MOUNTED$$module$set_dom$src$index$$ = $KEY_PREFIX$$module$set_dom$src$index$$ + "mounted", $ELEMENT_TYPE$$module$set_dom$src$index$$ = 1, $DOCUMENT_TYPE$$module$set_dom$src$index$$ = 9, $DOCUMENT_FRAGMENT_TYPE$$module$set_dom$src$index$$ = 11;
$module$set_dom$src$index$$.default = $setDOM$$module$set_dom$src$index$$;
var $_template$$module$extensions$amp_list$0_1$amp_list$$ = ["<amp-list-load-more load-more-button class=i-amphtml-default-ui><button load-more-clickable class=i-amphtml-list-load-more-button><label>See More</label></button></amp-list-load-more>"], $_template2$$module$extensions$amp_list$0_1$amp_list$$ = ["<amp-list-load-more load-more-loading class=i-amphtml-default-ui><div class=i-amphtml-list-load-more-spinner></div></amp-list-load-more>"], $_template3$$module$extensions$amp_list$0_1$amp_list$$ = 
['<amp-list-load-more load-more-failed class=i-amphtml-default-ui><div class=i-amphtml-list-load-more-message>Unable to Load More</div><button load-more-clickable class="i-amphtml-list-load-more-button i-amphtml-list-load-more-button-has-icon i-amphtml-list-load-more-button-small"><div class=i-amphtml-list-load-more-icon></div><label>Retry</label></button></amp-list-load-more>'];
_.$$jscomp$inherits$$($AmpList$$module$extensions$amp_list$0_1$amp_list$$, window.AMP.BaseElement);
_.$JSCompiler_prototypeAlias$$ = $AmpList$$module$extensions$amp_list$0_1$amp_list$$.prototype;
_.$JSCompiler_prototypeAlias$$.$isLayoutSupported$ = function($layout$jscomp$75$$) {
  return _.$isLayoutSizeDefined$$module$src$layout$$($layout$jscomp$75$$);
};
_.$JSCompiler_prototypeAlias$$.$buildCallback$ = function() {
  var $$jscomp$this$jscomp$736$$ = this;
  this.$viewport_$ = this.$getViewport$();
  var $overflowElement_viewer$jscomp$44$$ = _.$Services$$module$src$services$viewerForDoc$$(this.$getAmpDoc$());
  this.$ssrTemplateHelper_$ = new _.$SsrTemplateHelper$$module$src$ssr_template_helper$$("amp-list", $overflowElement_viewer$jscomp$44$$, this.$templates_$);
  this.$initialSrc_$ = this.element.getAttribute("src");
  this.$container_$ = $JSCompiler_StaticMethods_createContainer_$$(this);
  this.element.appendChild(this.$container_$);
  this.element.hasAttribute("aria-live") || this.element.setAttribute("aria-live", "polite");
  this.element.hasAttribute("auto-resize") && _.$user$$module$src$log$$().$Log$$module$src$log_prototype$warn$("amp-list", "auto-resize attribute is deprecated and its behavior is disabled. This feature will be relaunched under a new name soon. Please see https://github.com/ampproject/amphtml/issues/18849");
  _.$getElementServiceIfAvailableForDocInEmbedScope$$module$src$element_service$$(this.element).then(function($overflowElement_viewer$jscomp$44$$) {
    $$jscomp$this$jscomp$736$$.$bind_$ = $overflowElement_viewer$jscomp$44$$;
  });
  this.$loadMoreEnabled_$ && ($JSCompiler_StaticMethods_getLoadMoreButton_$$(this), $JSCompiler_StaticMethods_getLoadMoreLoadingElement_$$(this), $JSCompiler_StaticMethods_getLoadMoreFailedElement_$$(this), $JSCompiler_StaticMethods_getLoadMoreEndElement_$$(this), $JSCompiler_StaticMethods_getLoadMoreButtonClickable_$$(this), $JSCompiler_StaticMethods_getLoadMoreFailedClickable_$$(this), ($overflowElement_viewer$jscomp$44$$ = this.$getOverflowElement$()) && _.$toggle$$module$src$style$$($overflowElement_viewer$jscomp$44$$, 
  !1));
};
_.$JSCompiler_prototypeAlias$$.$reconstructWhenReparented$ = function() {
  return !1;
};
_.$JSCompiler_prototypeAlias$$.$layoutCallback$ = function() {
  var $$jscomp$this$jscomp$737$$ = this;
  this.$layoutCompleted_$ = !0;
  var $placeholder$jscomp$18$$ = this.$getPlaceholder$();
  $placeholder$jscomp$18$$ && $JSCompiler_StaticMethods_attemptToFit_$$(this, $placeholder$jscomp$18$$);
  _.$isExperimentOn$$module$src$experiments$$(this.$win$, "amp-list-viewport-resize") && _.$JSCompiler_StaticMethods_Viewport$$module$src$service$viewport$viewport_impl_prototype$onResize$$(this.$viewport_$, function() {
    $JSCompiler_StaticMethods_attemptToFit_$$($$jscomp$this$jscomp$737$$, $$jscomp$this$jscomp$737$$.$container_$);
  });
  return $JSCompiler_StaticMethods_fetchList_$$(this);
};
_.$JSCompiler_prototypeAlias$$.$mutatedAttributesCallback$ = function($isLayoutContainer_mutations$jscomp$12$$) {
  _.$dev$$module$src$log$$().$Log$$module$src$log_prototype$info$("amp-list", "mutate:", $isLayoutContainer_mutations$jscomp$12$$);
  var $data$264_data$jscomp$139_src$jscomp$53$$ = $isLayoutContainer_mutations$jscomp$12$$.src, $state$jscomp$70$$ = $isLayoutContainer_mutations$jscomp$12$$.state;
  $isLayoutContainer_mutations$jscomp$12$$ = $isLayoutContainer_mutations$jscomp$12$$["is-layout-container"];
  void 0 !== $data$264_data$jscomp$139_src$jscomp$53$$ ? "string" === typeof $data$264_data$jscomp$139_src$jscomp$53$$ ? this.$layoutCompleted_$ && ($JSCompiler_StaticMethods_resetIfNecessary_$$(this), $JSCompiler_StaticMethods_fetchList_$$(this)) : "object" === typeof $data$264_data$jscomp$139_src$jscomp$53$$ ? (this.element.setAttribute("src", ""), $JSCompiler_StaticMethods_resetIfNecessary_$$(this, !1), $data$264_data$jscomp$139_src$jscomp$53$$ = _.$isArray$$module$src$types$$($data$264_data$jscomp$139_src$jscomp$53$$) ? 
  $data$264_data$jscomp$139_src$jscomp$53$$ : [$data$264_data$jscomp$139_src$jscomp$53$$], $JSCompiler_StaticMethods_scheduleRender_$$(this, $data$264_data$jscomp$139_src$jscomp$53$$, !1)) : this.$user$().error("amp-list", 'Unexpected "src" type: ' + $data$264_data$jscomp$139_src$jscomp$53$$) : void 0 !== $state$jscomp$70$$ && (_.$user$$module$src$log$$().error("amp-list", "[state] is deprecated, please use [src] instead."), $JSCompiler_StaticMethods_resetIfNecessary_$$(this, !1), $data$264_data$jscomp$139_src$jscomp$53$$ = 
  _.$isArray$$module$src$types$$($state$jscomp$70$$) ? $state$jscomp$70$$ : [$state$jscomp$70$$], $JSCompiler_StaticMethods_scheduleRender_$$(this, $data$264_data$jscomp$139_src$jscomp$53$$, !1));
  $isLayoutContainer_mutations$jscomp$12$$ && $JSCompiler_StaticMethods_changeToLayoutContainer_$$(this);
};
_.$JSCompiler_prototypeAlias$$.$isLoadingReused$ = function() {
  return this.element.hasAttribute("reset-on-refresh");
};
window.self.AMP.registerElement("amp-list", $AmpList$$module$extensions$amp_list$0_1$amp_list$$, "amp-list[load-more] [load-more-button].amp-visible,amp-list[load-more] [load-more-end].amp-visible,amp-list[load-more] [load-more-failed].amp-visible,amp-list[load-more] [load-more-loading].amp-visible{display:block;width:100%}amp-list[load-more] [load-more-button].i-amphtml-default-ui,amp-list[load-more] [load-more-failed].i-amphtml-default-ui,amp-list[load-more] [load-more-loading].i-amphtml-default-ui{height:80px;padding:12px 0px;box-sizing:border-box}.i-amphtml-list-load-more-button,amp-list[load-more] [load-more-button].i-amphtml-default-ui,amp-list[load-more] [load-more-failed].i-amphtml-default-ui,amp-list[load-more] [load-more-loading].i-amphtml-default-ui{font-family:-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,Oxygen-Sans,Ubuntu,Cantarell,Helvetica Neue,sans-serif;font-weight:700;font-size:14px;text-transform:uppercase;letter-spacing:.1em;color:#333;text-align:center}[load-more-button].i-amphtml-list-load-more-overflow{position:absolute;bottom:0}amp-list[load-more] [load-more-loading].i-amphtml-default-ui .i-amphtml-list-load-more-spinner{display:inline-block;width:40px;height:40px;margin:8px 0px;background-image:url(\"data:image/svg+xml;charset=utf-8,%3Csvg viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cdefs%3E%3ClinearGradient id='a'%3E%3Cstop stop-color='%23333' stop-opacity='.75'/%3E%3Cstop offset='100%25' stop-color='%23333' stop-opacity='0'/%3E%3C/linearGradient%3E%3C/defs%3E%3Cpath d='M11 4.4A18 18 0 1 0 38 20' fill='none' stroke='url(%23a)' stroke-width='1.725'/%3E%3C/svg%3E\");-webkit-animation:amp-list-load-more-spinner 1000ms linear infinite;animation:amp-list-load-more-spinner 1000ms linear infinite}@-webkit-keyframes amp-list-load-more-spinner{0%{-webkit-transform:rotate(0deg);transform:rotate(0deg)}to{-webkit-transform:rotate(360deg);transform:rotate(360deg)}}@keyframes amp-list-load-more-spinner{0%{-webkit-transform:rotate(0deg);transform:rotate(0deg)}to{-webkit-transform:rotate(360deg);transform:rotate(360deg)}}.i-amphtml-list-load-more-button{border:none;display:inline-block;background-color:rgba(51,51,51,0.75);color:#fff;margin:4px 0px;padding:0px 32px;box-sizing:border-box;height:48px;border-radius:24px}.i-amphtml-list-load-more-button,.i-amphtml-list-load-more-button label,.i-amphtml-list-load-more-icon{cursor:pointer}.i-amphtml-list-load-more-button:hover{background-color:#333}.i-amphtml-list-load-more-button.i-amphtml-list-load-more-button-small{margin:0px;padding:4px 16px;height:32px}.i-amphtml-list-load-more-button label{display:inline-block;vertical-align:middle;line-height:24px}amp-list[load-more] [load-more-failed].i-amphtml-default-ui .i-amphtml-list-load-more-message{line-height:24px}amp-list[load-more] [load-more-failed].i-amphtml-default-ui .i-amphtml-list-load-more-icon{height:24px;width:24px;display:inline-block;vertical-align:middle;background-image:url(\"data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24'%3E%3Cpath fill='%23fff' d='M17.65 6.35A7.958 7.958 0 0 0 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08A5.99 5.99 0 0 1 12 18c-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z'/%3E%3C/svg%3E\")}\n/*# sourceURL=/extensions/amp-list/0.1/amp-list.css*/");

})});
