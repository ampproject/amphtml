(self.AMP=self.AMP||[]).push({n:"amp-live-list",i:["_base_i","_base_misc"],v:"1901181729101",f:(function(AMP,_){
var $Poller$$module$extensions$amp_live_list$0_1$poller$$ = function($win$jscomp$363$$, $wait$jscomp$2$$, $work$jscomp$2$$) {
  this.$win$ = $win$jscomp$363$$;
  this.$I$ = $wait$jscomp$2$$;
  this.$J$ = $work$jscomp$2$$;
  this.$G$ = null;
  this.$F$ = !1;
  this.$K$ = this.$D$ = null;
}, $JSCompiler_StaticMethods_Poller$$module$extensions$amp_live_list$0_1$poller_prototype$getTimeout_$$ = function($JSCompiler_StaticMethods_Poller$$module$extensions$amp_live_list$0_1$poller_prototype$getTimeout_$self$$) {
  return $JSCompiler_StaticMethods_Poller$$module$extensions$amp_live_list$0_1$poller_prototype$getTimeout_$self$$.$D$ ? $JSCompiler_StaticMethods_Poller$$module$extensions$amp_live_list$0_1$poller_prototype$getTimeout_$self$$.$D$() : $JSCompiler_StaticMethods_Poller$$module$extensions$amp_live_list$0_1$poller_prototype$getTimeout_$self$$.$I$ + _.$getJitter$$module$src$exponential_backoff$$($JSCompiler_StaticMethods_Poller$$module$extensions$amp_live_list$0_1$poller_prototype$getTimeout_$self$$.$I$, 
  0.2);
}, $JSCompiler_StaticMethods_poll_$$ = function($JSCompiler_StaticMethods_poll_$self$$, $opt_immediate$jscomp$1$$) {
  if ($JSCompiler_StaticMethods_poll_$self$$.$F$) {
    var $work$jscomp$3$$ = function() {
      $JSCompiler_StaticMethods_poll_$self$$.$K$ = $JSCompiler_StaticMethods_poll_$self$$.$J$().then(function() {
        $JSCompiler_StaticMethods_poll_$self$$.$D$ && ($JSCompiler_StaticMethods_poll_$self$$.$D$ = null);
        $JSCompiler_StaticMethods_poll_$$($JSCompiler_StaticMethods_poll_$self$$);
      }).catch(function($opt_immediate$jscomp$1$$) {
        if ($opt_immediate$jscomp$1$$.$retriable$) {
          $JSCompiler_StaticMethods_poll_$self$$.$D$ || ($JSCompiler_StaticMethods_poll_$self$$.$D$ = _.$exponentialBackoffClock$$module$src$exponential_backoff$$()), $JSCompiler_StaticMethods_poll_$$($JSCompiler_StaticMethods_poll_$self$$);
        } else {
          throw $opt_immediate$jscomp$1$$;
        }
      });
    };
    $opt_immediate$jscomp$1$$ ? $work$jscomp$3$$() : $JSCompiler_StaticMethods_poll_$self$$.$G$ = _.$Services$$module$src$services$timerFor$$($JSCompiler_StaticMethods_poll_$self$$.$win$).delay($work$jscomp$3$$, $JSCompiler_StaticMethods_Poller$$module$extensions$amp_live_list$0_1$poller_prototype$getTimeout_$$($JSCompiler_StaticMethods_poll_$self$$));
  }
}, $LiveListManager$$module$extensions$amp_live_list$0_1$live_list_manager$$ = function($ampdoc$jscomp$186$$) {
  var $$jscomp$this$jscomp$754$$ = this;
  this.ampdoc = $ampdoc$jscomp$186$$;
  this.$D$ = Object.create(null);
  this.$viewer_$ = _.$Services$$module$src$services$viewerForDoc$$(this.ampdoc);
  this.$extensions_$ = _.$Services$$module$src$services$extensionsFor$$(this.ampdoc.$win$);
  this.$I$ = 15000;
  this.$J$ = [this.$I$];
  this.$F$ = null;
  this.$url_$ = this.ampdoc.$AmpDoc$$module$src$service$ampdoc_impl_prototype$getUrl$();
  this.$G$ = 0;
  this.$K$ = this.$fetchDocument_$.bind(this);
  this.ampdoc.$whenReady$().then(function() {
    $$jscomp$this$jscomp$754$$.$I$ = Math.min.apply(Math, $$jscomp$this$jscomp$754$$.$J$);
    var $ampdoc$jscomp$186$$ = Object.keys($$jscomp$this$jscomp$754$$.$D$).map(function($ampdoc$jscomp$186$$) {
      return $$jscomp$this$jscomp$754$$.$D$[$ampdoc$jscomp$186$$].$updateTime_$;
    });
    $$jscomp$this$jscomp$754$$.$G$ = Math.max.apply(Math, $ampdoc$jscomp$186$$);
    $$jscomp$this$jscomp$754$$.$F$ = new $Poller$$module$extensions$amp_live_list$0_1$poller$$($$jscomp$this$jscomp$754$$.ampdoc.$win$, $$jscomp$this$jscomp$754$$.$I$, $$jscomp$this$jscomp$754$$.$K$);
    _.$JSCompiler_StaticMethods_Viewer$$module$src$service$viewer_impl_prototype$isVisible$$($$jscomp$this$jscomp$754$$.$viewer_$) && $JSCompiler_StaticMethods_hasActiveLiveLists_$$($$jscomp$this$jscomp$754$$) && $$jscomp$this$jscomp$754$$.$F$.start();
    $JSCompiler_StaticMethods_setupVisibilityHandler_$$($$jscomp$this$jscomp$754$$);
  });
}, $JSCompiler_StaticMethods_hasActiveLiveLists_$$ = function($JSCompiler_StaticMethods_hasActiveLiveLists_$self$$) {
  return Object.keys($JSCompiler_StaticMethods_hasActiveLiveLists_$self$$.$D$).some(function($key$jscomp$133$$) {
    return !$JSCompiler_StaticMethods_hasActiveLiveLists_$self$$.$D$[$key$jscomp$133$$].element.hasAttribute("disabled");
  });
}, $JSCompiler_StaticMethods_setupVisibilityHandler_$$ = function($JSCompiler_StaticMethods_setupVisibilityHandler_$self$$) {
  _.$JSCompiler_StaticMethods_Viewer$$module$src$service$viewer_impl_prototype$onVisibilityChanged$$($JSCompiler_StaticMethods_setupVisibilityHandler_$self$$.$viewer_$, function() {
    _.$JSCompiler_StaticMethods_Viewer$$module$src$service$viewer_impl_prototype$isVisible$$($JSCompiler_StaticMethods_setupVisibilityHandler_$self$$.$viewer_$) ? $JSCompiler_StaticMethods_setupVisibilityHandler_$self$$.$F$.start(!0) : $JSCompiler_StaticMethods_setupVisibilityHandler_$self$$.$F$.stop();
  });
}, $JSCompiler_StaticMethods_installExtensionsForDoc_$$ = function($JSCompiler_StaticMethods_installExtensionsForDoc_$self$$, $doc$jscomp$101$$) {
  _.$toArray$$module$src$types$$($doc$jscomp$101$$.querySelectorAll("script[custom-element], script[custom-template]")).forEach(function($doc$jscomp$101$$) {
    $doc$jscomp$101$$ = $doc$jscomp$101$$.getAttribute("custom-element") || $doc$jscomp$101$$.getAttribute("custom-template");
    _.$JSCompiler_StaticMethods_installExtensionForDoc$$($JSCompiler_StaticMethods_installExtensionsForDoc_$self$$.$extensions_$, $JSCompiler_StaticMethods_installExtensionsForDoc_$self$$.ampdoc, $doc$jscomp$101$$);
  });
}, $liveListManagerForDoc$$module$extensions$amp_live_list$0_1$live_list_manager$$ = function($ampdoc$jscomp$188$$) {
  _.$registerServiceBuilderForDoc$$module$src$service$$($ampdoc$jscomp$188$$, "liveListManager", $LiveListManager$$module$extensions$amp_live_list$0_1$live_list_manager$$, !0);
  return _.$getServiceForDoc$$module$src$service$$($ampdoc$jscomp$188$$, "liveListManager");
}, $getNumberMaxOrDefault$$module$extensions$amp_live_list$0_1$amp_live_list$$ = function($value$jscomp$264$$, $defaultValue$jscomp$7$$) {
  return Math.max((0,window.parseInt)($value$jscomp$264$$, 10) || 0, $defaultValue$jscomp$7$$);
}, $AmpLiveList$$module$extensions$amp_live_list$0_1$amp_live_list$$ = function($$jscomp$super$this$jscomp$72_element$jscomp$493$$) {
  $$jscomp$super$this$jscomp$72_element$jscomp$493$$ = window.AMP.BaseElement.call(this, $$jscomp$super$this$jscomp$72_element$jscomp$493$$) || this;
  $$jscomp$super$this$jscomp$72_element$jscomp$493$$.$viewport_$ = null;
  $$jscomp$super$this$jscomp$72_element$jscomp$493$$.$manager_$ = null;
  $$jscomp$super$this$jscomp$72_element$jscomp$493$$.$updateSlot_$ = null;
  $$jscomp$super$this$jscomp$72_element$jscomp$493$$.$itemsSlot_$ = null;
  $$jscomp$super$this$jscomp$72_element$jscomp$493$$.$paginationSlot_$ = null;
  $$jscomp$super$this$jscomp$72_element$jscomp$493$$.$liveListId_$ = "";
  $$jscomp$super$this$jscomp$72_element$jscomp$493$$.$pollInterval_$ = 0;
  $$jscomp$super$this$jscomp$72_element$jscomp$493$$.$maxItemsPerPage_$ = 0;
  $$jscomp$super$this$jscomp$72_element$jscomp$493$$.$updateTime_$ = 0;
  $$jscomp$super$this$jscomp$72_element$jscomp$493$$.$isReverseOrder_$ = !1;
  $$jscomp$super$this$jscomp$72_element$jscomp$493$$.$knownItems_$ = Object.create(null);
  $$jscomp$super$this$jscomp$72_element$jscomp$493$$.$pendingItemsInsert_$ = [];
  $$jscomp$super$this$jscomp$72_element$jscomp$493$$.$pendingItemsReplace_$ = [];
  $$jscomp$super$this$jscomp$72_element$jscomp$493$$.$pendingItemsTombstone_$ = [];
  $$jscomp$super$this$jscomp$72_element$jscomp$493$$.$pendingPagination_$ = null;
  $$jscomp$super$this$jscomp$72_element$jscomp$493$$.$curNumOfLiveItems_$ = 0;
  $$jscomp$super$this$jscomp$72_element$jscomp$493$$.$comparator_$ = $$jscomp$super$this$jscomp$72_element$jscomp$493$$.$sortByDataSortTime_$.bind($$jscomp$super$this$jscomp$72_element$jscomp$493$$);
  return $$jscomp$super$this$jscomp$72_element$jscomp$493$$;
}, $JSCompiler_StaticMethods_toggleUpdateButton_$$ = function($JSCompiler_StaticMethods_toggleUpdateButton_$self$$, $visible$jscomp$10$$) {
  $JSCompiler_StaticMethods_toggleUpdateButton_$self$$.$updateSlot_$.classList.toggle("amp-hidden", !$visible$jscomp$10$$);
  $JSCompiler_StaticMethods_toggleUpdateButton_$self$$.$updateSlot_$.classList.toggle("amp-active", $visible$jscomp$10$$);
}, $JSCompiler_StaticMethods_insert_$$ = function($JSCompiler_StaticMethods_insert_$self$$, $orphans$$) {
  var $count$jscomp$22$$ = 0;
  $orphans$$.forEach(function($orphans$$) {
    if (0 == $JSCompiler_StaticMethods_insert_$self$$.$itemsSlot_$.childElementCount) {
      $JSCompiler_StaticMethods_insert_$self$$.$itemsSlot_$.appendChild($orphans$$);
    } else {
      var $orphan$$ = $JSCompiler_StaticMethods_getSortTime_$$($orphans$$);
      if ($JSCompiler_StaticMethods_insert_$self$$.$isReverseOrder_$) {
        for (var $child$265_child$jscomp$29$$ = $JSCompiler_StaticMethods_insert_$self$$.$itemsSlot_$.lastElementChild; $child$265_child$jscomp$29$$; $child$265_child$jscomp$29$$ = $child$265_child$jscomp$29$$.previousElementSibling) {
          var $childSortTime_childSortTime$266$$ = $JSCompiler_StaticMethods_getSortTime_$$($child$265_child$jscomp$29$$);
          if ($orphan$$ >= $childSortTime_childSortTime$266$$) {
            $child$265_child$jscomp$29$$.nextElementSibling ? $JSCompiler_StaticMethods_insert_$self$$.$itemsSlot_$.insertBefore($orphans$$, $child$265_child$jscomp$29$$.nextElementSibling) : $JSCompiler_StaticMethods_insert_$self$$.$itemsSlot_$.appendChild($orphans$$);
            $count$jscomp$22$$++;
            break;
          } else {
            if (!$child$265_child$jscomp$29$$.previousElementSibling) {
              $JSCompiler_StaticMethods_insert_$self$$.$itemsSlot_$.insertBefore($orphans$$, $child$265_child$jscomp$29$$);
              $count$jscomp$22$$++;
              break;
            }
          }
        }
      } else {
        for ($child$265_child$jscomp$29$$ = $JSCompiler_StaticMethods_insert_$self$$.$itemsSlot_$.firstElementChild; $child$265_child$jscomp$29$$; $child$265_child$jscomp$29$$ = $child$265_child$jscomp$29$$.nextElementSibling) {
          if ($childSortTime_childSortTime$266$$ = $JSCompiler_StaticMethods_getSortTime_$$($child$265_child$jscomp$29$$), $orphan$$ >= $childSortTime_childSortTime$266$$) {
            $JSCompiler_StaticMethods_insert_$self$$.$itemsSlot_$.insertBefore($orphans$$, $child$265_child$jscomp$29$$);
            $count$jscomp$22$$++;
            break;
          } else {
            if (!$child$265_child$jscomp$29$$.nextElementSibling) {
              $JSCompiler_StaticMethods_insert_$self$$.$itemsSlot_$.appendChild($orphans$$);
              $count$jscomp$22$$++;
              break;
            }
          }
        }
      }
    }
  });
  return $count$jscomp$22$$;
}, $JSCompiler_StaticMethods_replace_$$ = function($parent$jscomp$47$$, $orphans$jscomp$1$$) {
  var $count$jscomp$23$$ = 0;
  $orphans$jscomp$1$$.forEach(function($orphans$jscomp$1$$) {
    var $orphan$jscomp$1$$ = $orphans$jscomp$1$$.getAttribute("id");
    if ($orphan$jscomp$1$$ = $parent$jscomp$47$$.querySelector("#" + $orphan$jscomp$1$$)) {
      $parent$jscomp$47$$.replaceChild($orphans$jscomp$1$$, $orphan$jscomp$1$$), $count$jscomp$23$$++;
    }
  });
}, $JSCompiler_StaticMethods_tombstone_$$ = function($parent$jscomp$48$$, $orphans$jscomp$2$$) {
  var $count$jscomp$24$$ = 0;
  $orphans$jscomp$2$$.forEach(function($orphans$jscomp$2$$) {
    $orphans$jscomp$2$$ = $orphans$jscomp$2$$.getAttribute("id");
    if ($orphans$jscomp$2$$ = $parent$jscomp$48$$.querySelector("#" + $orphans$jscomp$2$$)) {
      $orphans$jscomp$2$$.setAttribute("data-tombstone", ""), $orphans$jscomp$2$$.textContent = "", $count$jscomp$24$$++;
    }
  });
  return $count$jscomp$24$$;
}, $JSCompiler_StaticMethods_removeOverflowItems_$$ = function($JSCompiler_StaticMethods_removeOverflowItems_$self$$, $parent$jscomp$49$$) {
  var $numOfItemsToDelete$$ = $JSCompiler_StaticMethods_removeOverflowItems_$self$$.$curNumOfLiveItems_$ - $JSCompiler_StaticMethods_removeOverflowItems_$self$$.$maxItemsPerPage_$;
  if (1 > $numOfItemsToDelete$$) {
    return window.Promise.resolve();
  }
  var $deleteItemsCandidates$$ = [], $actualDeleteItems$$ = [];
  if ($JSCompiler_StaticMethods_removeOverflowItems_$self$$.$isReverseOrder_$) {
    for (var $child$267_child$jscomp$30$$ = $parent$jscomp$49$$.firstElementChild; $child$267_child$jscomp$30$$ && !($deleteItemsCandidates$$.length >= $numOfItemsToDelete$$); $child$267_child$jscomp$30$$ = $child$267_child$jscomp$30$$.nextElementSibling) {
      $child$267_child$jscomp$30$$.hasAttribute("data-tombstone") || $deleteItemsCandidates$$.push($child$267_child$jscomp$30$$);
    }
  } else {
    for ($child$267_child$jscomp$30$$ = $parent$jscomp$49$$.lastElementChild; $child$267_child$jscomp$30$$ && !($deleteItemsCandidates$$.length >= $numOfItemsToDelete$$); $child$267_child$jscomp$30$$ = $child$267_child$jscomp$30$$.previousElementSibling) {
      $child$267_child$jscomp$30$$.hasAttribute("data-tombstone") || $deleteItemsCandidates$$.push($child$267_child$jscomp$30$$);
    }
  }
  return _.$JSCompiler_StaticMethods_runPromise$$(_.$JSCompiler_StaticMethods_getVsync$$($JSCompiler_StaticMethods_removeOverflowItems_$self$$), {measure:function() {
    for (var $parent$jscomp$49$$ = 0; $parent$jscomp$49$$ < $deleteItemsCandidates$$.length; $parent$jscomp$49$$++) {
      var $numOfItemsToDelete$$ = $deleteItemsCandidates$$[$parent$jscomp$49$$];
      if ($JSCompiler_StaticMethods_removeOverflowItems_$self$$.$isReverseOrder_$) {
        if (!($JSCompiler_StaticMethods_removeOverflowItems_$self$$.$viewport_$.$getLayoutRect$($numOfItemsToDelete$$).bottom < _.$JSCompiler_StaticMethods_Viewport$$module$src$service$viewport$viewport_impl_prototype$getScrollTop$$($JSCompiler_StaticMethods_removeOverflowItems_$self$$.$viewport_$))) {
          break;
        }
      } else {
        if (!(_.$isExperimentOn$$module$src$experiments$$($JSCompiler_StaticMethods_removeOverflowItems_$self$$.$win$, "layers") ? 0 < $JSCompiler_StaticMethods_removeOverflowItems_$self$$.$viewport_$.$getLayoutRect$($numOfItemsToDelete$$).top : $JSCompiler_StaticMethods_removeOverflowItems_$self$$.$viewport_$.$getLayoutRect$($numOfItemsToDelete$$).top > _.$JSCompiler_StaticMethods_Viewport$$module$src$service$viewport$viewport_impl_prototype$getScrollTop$$($JSCompiler_StaticMethods_removeOverflowItems_$self$$.$viewport_$) + 
        $JSCompiler_StaticMethods_removeOverflowItems_$self$$.$viewport_$.$getSize$().height)) {
          break;
        }
      }
      $actualDeleteItems$$.push($numOfItemsToDelete$$);
    }
  }, $mutate$:function() {
    $actualDeleteItems$$.forEach(function($numOfItemsToDelete$$) {
      $parent$jscomp$49$$.removeChild($numOfItemsToDelete$$);
      $JSCompiler_StaticMethods_removeOverflowItems_$self$$.$curNumOfLiveItems_$--;
    });
  }});
}, $JSCompiler_StaticMethods_preparePendingItemsInsert_$$ = function($JSCompiler_StaticMethods_preparePendingItemsInsert_$self$$, $items$jscomp$4$$) {
  $items$jscomp$4$$.sort($JSCompiler_StaticMethods_preparePendingItemsInsert_$self$$.$comparator_$).forEach(function($JSCompiler_StaticMethods_preparePendingItemsInsert_$self$$) {
    $JSCompiler_StaticMethods_preparePendingItemsInsert_$self$$.classList.add("amp-live-list-item");
    $JSCompiler_StaticMethods_preparePendingItemsInsert_$self$$.classList.add("amp-live-list-item-new");
  });
  $JSCompiler_StaticMethods_preparePendingItemsInsert_$self$$.$pendingItemsInsert_$.push.apply($JSCompiler_StaticMethods_preparePendingItemsInsert_$self$$.$pendingItemsInsert_$, $items$jscomp$4$$);
}, $JSCompiler_StaticMethods_preparePendingItemsReplace_$$ = function($JSCompiler_StaticMethods_preparePendingItemsReplace_$self$$, $items$jscomp$5$$) {
  $items$jscomp$5$$.forEach(function($items$jscomp$5$$) {
    a: {
      var $elem$jscomp$23$$ = $JSCompiler_StaticMethods_preparePendingItemsReplace_$self$$.$pendingItemsReplace_$;
      for (var $i$jscomp$inline_3661$$ = 0; $i$jscomp$inline_3661$$ < $elem$jscomp$23$$.length; $i$jscomp$inline_3661$$++) {
        if ($elem$jscomp$23$$[$i$jscomp$inline_3661$$].getAttribute("id") == $items$jscomp$5$$.getAttribute("id")) {
          $elem$jscomp$23$$ = $i$jscomp$inline_3661$$;
          break a;
        }
      }
      $elem$jscomp$23$$ = -1;
    }
    $items$jscomp$5$$.classList.add("amp-live-list-item");
    -1 == $elem$jscomp$23$$ ? $JSCompiler_StaticMethods_preparePendingItemsReplace_$self$$.$pendingItemsReplace_$.push($items$jscomp$5$$) : $JSCompiler_StaticMethods_preparePendingItemsReplace_$self$$.$pendingItemsReplace_$[$elem$jscomp$23$$] = $items$jscomp$5$$;
  });
}, $JSCompiler_StaticMethods_getUpdates_$$ = function($JSCompiler_StaticMethods_getUpdates_$self$$, $child$jscomp$32_updatedElement$jscomp$1$$) {
  var $insert$$ = [], $replace$$ = [], $tombstone$$ = [];
  for ($child$jscomp$32_updatedElement$jscomp$1$$ = $child$jscomp$32_updatedElement$jscomp$1$$.firstElementChild; $child$jscomp$32_updatedElement$jscomp$1$$; $child$jscomp$32_updatedElement$jscomp$1$$ = $child$jscomp$32_updatedElement$jscomp$1$$.nextElementSibling) {
    var $id$jscomp$82_orphan$269_orphan$jscomp$3$$ = $child$jscomp$32_updatedElement$jscomp$1$$.getAttribute("id"), $JSCompiler_StaticMethods_isChildNew_$self$jscomp$inline_3663_JSCompiler_StaticMethods_isChildUpdate_$self$jscomp$inline_3667_JSCompiler_inline_result$jscomp$804_updateTime$$ = $JSCompiler_StaticMethods_getUpdates_$self$$, $elem$jscomp$inline_3664_id$jscomp$inline_3669$$ = $child$jscomp$32_updatedElement$jscomp$1$$, $elem$jscomp$inline_3668_id$jscomp$inline_3665_updateTime$jscomp$inline_3670$$ = 
    $elem$jscomp$inline_3664_id$jscomp$inline_3669$$.getAttribute("id");
    $elem$jscomp$inline_3664_id$jscomp$inline_3669$$.hasAttribute("data-tombstone") || $elem$jscomp$inline_3668_id$jscomp$inline_3665_updateTime$jscomp$inline_3670$$ in $JSCompiler_StaticMethods_isChildNew_$self$jscomp$inline_3663_JSCompiler_StaticMethods_isChildUpdate_$self$jscomp$inline_3667_JSCompiler_inline_result$jscomp$804_updateTime$$.$knownItems_$ ? ($JSCompiler_StaticMethods_isChildNew_$self$jscomp$inline_3663_JSCompiler_StaticMethods_isChildUpdate_$self$jscomp$inline_3667_JSCompiler_inline_result$jscomp$804_updateTime$$ = 
    $JSCompiler_StaticMethods_getUpdates_$self$$, $elem$jscomp$inline_3668_id$jscomp$inline_3665_updateTime$jscomp$inline_3670$$ = $child$jscomp$32_updatedElement$jscomp$1$$, !$elem$jscomp$inline_3668_id$jscomp$inline_3665_updateTime$jscomp$inline_3670$$.hasAttribute("data-update-time") || $elem$jscomp$inline_3668_id$jscomp$inline_3665_updateTime$jscomp$inline_3670$$.hasAttribute("data-tombstone") ? $JSCompiler_StaticMethods_isChildNew_$self$jscomp$inline_3663_JSCompiler_StaticMethods_isChildUpdate_$self$jscomp$inline_3667_JSCompiler_inline_result$jscomp$804_updateTime$$ = 
    !1 : ($elem$jscomp$inline_3664_id$jscomp$inline_3669$$ = $elem$jscomp$inline_3668_id$jscomp$inline_3665_updateTime$jscomp$inline_3670$$.getAttribute("id"), $elem$jscomp$inline_3668_id$jscomp$inline_3665_updateTime$jscomp$inline_3670$$ = $JSCompiler_StaticMethods_getUpdateTime_$$($elem$jscomp$inline_3668_id$jscomp$inline_3665_updateTime$jscomp$inline_3670$$), $JSCompiler_StaticMethods_isChildNew_$self$jscomp$inline_3663_JSCompiler_StaticMethods_isChildUpdate_$self$jscomp$inline_3667_JSCompiler_inline_result$jscomp$804_updateTime$$ = 
    $elem$jscomp$inline_3664_id$jscomp$inline_3669$$ in $JSCompiler_StaticMethods_isChildNew_$self$jscomp$inline_3663_JSCompiler_StaticMethods_isChildUpdate_$self$jscomp$inline_3667_JSCompiler_inline_result$jscomp$804_updateTime$$.$knownItems_$ && -1 != $JSCompiler_StaticMethods_isChildNew_$self$jscomp$inline_3663_JSCompiler_StaticMethods_isChildUpdate_$self$jscomp$inline_3667_JSCompiler_inline_result$jscomp$804_updateTime$$.$knownItems_$[$elem$jscomp$inline_3664_id$jscomp$inline_3669$$] && $elem$jscomp$inline_3668_id$jscomp$inline_3665_updateTime$jscomp$inline_3670$$ > 
    $JSCompiler_StaticMethods_isChildNew_$self$jscomp$inline_3663_JSCompiler_StaticMethods_isChildUpdate_$self$jscomp$inline_3667_JSCompiler_inline_result$jscomp$804_updateTime$$.$knownItems_$[$elem$jscomp$inline_3664_id$jscomp$inline_3669$$]), $JSCompiler_StaticMethods_isChildNew_$self$jscomp$inline_3663_JSCompiler_StaticMethods_isChildUpdate_$self$jscomp$inline_3667_JSCompiler_inline_result$jscomp$804_updateTime$$ ? ($JSCompiler_StaticMethods_isChildNew_$self$jscomp$inline_3663_JSCompiler_StaticMethods_isChildUpdate_$self$jscomp$inline_3667_JSCompiler_inline_result$jscomp$804_updateTime$$ = 
    $JSCompiler_StaticMethods_getUpdateTime_$$($child$jscomp$32_updatedElement$jscomp$1$$), $JSCompiler_StaticMethods_getUpdates_$self$$.$knownItems_$[$id$jscomp$82_orphan$269_orphan$jscomp$3$$] = $JSCompiler_StaticMethods_isChildNew_$self$jscomp$inline_3663_JSCompiler_StaticMethods_isChildUpdate_$self$jscomp$inline_3667_JSCompiler_inline_result$jscomp$804_updateTime$$, $id$jscomp$82_orphan$269_orphan$jscomp$3$$ = $JSCompiler_StaticMethods_getUpdates_$self$$.$win$.document.importNode($child$jscomp$32_updatedElement$jscomp$1$$, 
    !0), $JSCompiler_StaticMethods_isChildNew_$self$jscomp$inline_3663_JSCompiler_StaticMethods_isChildUpdate_$self$jscomp$inline_3667_JSCompiler_inline_result$jscomp$804_updateTime$$ > $JSCompiler_StaticMethods_getUpdates_$self$$.$updateTime_$ && ($JSCompiler_StaticMethods_getUpdates_$self$$.$updateTime_$ = $JSCompiler_StaticMethods_isChildNew_$self$jscomp$inline_3663_JSCompiler_StaticMethods_isChildUpdate_$self$jscomp$inline_3667_JSCompiler_inline_result$jscomp$804_updateTime$$), $replace$$.push($id$jscomp$82_orphan$269_orphan$jscomp$3$$)) : 
    $child$jscomp$32_updatedElement$jscomp$1$$.hasAttribute("data-tombstone") && -1 != $JSCompiler_StaticMethods_getUpdates_$self$$.$knownItems_$[$id$jscomp$82_orphan$269_orphan$jscomp$3$$] && ($JSCompiler_StaticMethods_getUpdates_$self$$.$knownItems_$[$id$jscomp$82_orphan$269_orphan$jscomp$3$$] = -1, $tombstone$$.push($child$jscomp$32_updatedElement$jscomp$1$$))) : ($id$jscomp$82_orphan$269_orphan$jscomp$3$$ = $JSCompiler_StaticMethods_getUpdates_$self$$.$win$.document.importNode($child$jscomp$32_updatedElement$jscomp$1$$, 
    !0), $insert$$.push($id$jscomp$82_orphan$269_orphan$jscomp$3$$), $JSCompiler_StaticMethods_cacheChild_$$($JSCompiler_StaticMethods_getUpdates_$self$$, $child$jscomp$32_updatedElement$jscomp$1$$));
  }
  return {$insert$:$insert$$, replace:$replace$$, $tombstone$:$tombstone$$};
}, $JSCompiler_StaticMethods_cacheChild_$$ = function($JSCompiler_StaticMethods_cacheChild_$self$$, $child$jscomp$33_updateTime$jscomp$2$$) {
  var $id$jscomp$85$$ = $child$jscomp$33_updateTime$jscomp$2$$.getAttribute("id");
  $child$jscomp$33_updateTime$jscomp$2$$ = $JSCompiler_StaticMethods_getUpdateTime_$$($child$jscomp$33_updateTime$jscomp$2$$);
  $child$jscomp$33_updateTime$jscomp$2$$ > $JSCompiler_StaticMethods_cacheChild_$self$$.$updateTime_$ && ($JSCompiler_StaticMethods_cacheChild_$self$$.$updateTime_$ = $child$jscomp$33_updateTime$jscomp$2$$);
  $JSCompiler_StaticMethods_cacheChild_$self$$.$knownItems_$[$id$jscomp$85$$] = $child$jscomp$33_updateTime$jscomp$2$$;
}, $JSCompiler_StaticMethods_validateLiveListItems_$$ = function($JSCompiler_StaticMethods_validateLiveListItems_$self$$, $element$jscomp$494$$, $opt_cacheIds$$) {
  var $numItems$$ = 0;
  $JSCompiler_StaticMethods_eachChildElement_$$($element$jscomp$494$$, function($element$jscomp$494$$) {
    $element$jscomp$494$$.hasAttribute("id") && 0 < Number($element$jscomp$494$$.getAttribute("data-sort-time")) && $opt_cacheIds$$ && $JSCompiler_StaticMethods_cacheChild_$$($JSCompiler_StaticMethods_validateLiveListItems_$self$$, $element$jscomp$494$$);
    $numItems$$++;
  });
  return $numItems$$;
}, $JSCompiler_StaticMethods_eachChildElement_$$ = function($child$jscomp$36_parent$jscomp$50$$, $cb$jscomp$11$$) {
  for ($child$jscomp$36_parent$jscomp$50$$ = $child$jscomp$36_parent$jscomp$50$$.firstElementChild; $child$jscomp$36_parent$jscomp$50$$; $child$jscomp$36_parent$jscomp$50$$ = $child$jscomp$36_parent$jscomp$50$$.nextElementSibling) {
    $cb$jscomp$11$$($child$jscomp$36_parent$jscomp$50$$);
  }
}, $JSCompiler_StaticMethods_getSortTime_$$ = function($elem$jscomp$28$$) {
  return Number($elem$jscomp$28$$.getAttribute("data-sort-time"));
}, $JSCompiler_StaticMethods_getUpdateTime_$$ = function($elem$jscomp$29$$) {
  return $elem$jscomp$29$$.hasAttribute("data-update-time") ? Number($elem$jscomp$29$$.getAttribute("data-update-time")) : $JSCompiler_StaticMethods_getSortTime_$$($elem$jscomp$29$$);
};
$Poller$$module$extensions$amp_live_list$0_1$poller$$.prototype.start = function($opt_immediate$$) {
  this.$F$ || (this.$F$ = !0, $JSCompiler_StaticMethods_poll_$$(this, $opt_immediate$$));
};
$Poller$$module$extensions$amp_live_list$0_1$poller$$.prototype.stop = function() {
  this.$F$ && (this.$F$ = !1, this.$G$ && (_.$Services$$module$src$services$timerFor$$(this.$win$).cancel(this.$G$), this.$G$ = null));
};
_.$JSCompiler_prototypeAlias$$ = $LiveListManager$$module$extensions$amp_live_list$0_1$live_list_manager$$.prototype;
_.$JSCompiler_prototypeAlias$$.$dispose$ = function() {
  this.$F$.stop();
};
_.$JSCompiler_prototypeAlias$$.$fetchDocument_$ = function() {
  var $url$jscomp$188$$ = this.$url_$;
  0 < this.$G$ && ($url$jscomp$188$$ = _.$addParamToUrl$$module$src$url$$($url$jscomp$188$$, "amp_latest_update_time", String(this.$G$)));
  return _.$fetchDocument$$module$src$document_fetcher$$(this.ampdoc.$win$, $url$jscomp$188$$, {requireAmpResponseSourceOrigin:!1}).then(this.$getLiveLists_$.bind(this));
};
_.$JSCompiler_prototypeAlias$$.$getLiveLists_$ = function($doc$jscomp$100_latestUpdateTime_updateTimes$$) {
  $JSCompiler_StaticMethods_installExtensionsForDoc_$$(this, $doc$jscomp$100_latestUpdateTime_updateTimes$$);
  $doc$jscomp$100_latestUpdateTime_updateTimes$$ = Array.prototype.slice.call($doc$jscomp$100_latestUpdateTime_updateTimes$$.getElementsByTagName("amp-live-list")).map(this.$updateLiveList_$.bind(this));
  $doc$jscomp$100_latestUpdateTime_updateTimes$$ = Math.max.apply(Math, [0].concat($doc$jscomp$100_latestUpdateTime_updateTimes$$));
  0 < $doc$jscomp$100_latestUpdateTime_updateTimes$$ && (this.$G$ = $doc$jscomp$100_latestUpdateTime_updateTimes$$);
  $JSCompiler_StaticMethods_hasActiveLiveLists_$$(this) || this.$F$.stop();
};
_.$JSCompiler_prototypeAlias$$.$updateLiveList_$ = function($liveList$$) {
  var $id$jscomp$80_inClientDomLiveList$$ = $liveList$$.getAttribute("id");
  $id$jscomp$80_inClientDomLiveList$$ = this.$D$[$id$jscomp$80_inClientDomLiveList$$];
  $id$jscomp$80_inClientDomLiveList$$.toggle(!$liveList$$.hasAttribute("disabled"));
  return $id$jscomp$80_inClientDomLiveList$$.element.hasAttribute("disabled") ? 0 : $id$jscomp$80_inClientDomLiveList$$.update($liveList$$);
};
_.$JSCompiler_prototypeAlias$$.register = function($id$jscomp$81$$, $liveList$jscomp$1$$) {
  $id$jscomp$81$$ in this.$D$ || (this.$D$[$id$jscomp$81$$] = $liveList$jscomp$1$$, this.$J$.push($liveList$jscomp$1$$.$pollInterval_$));
};
_.$$jscomp$inherits$$($AmpLiveList$$module$extensions$amp_live_list$0_1$amp_live_list$$, window.AMP.BaseElement);
_.$JSCompiler_prototypeAlias$$ = $AmpLiveList$$module$extensions$amp_live_list$0_1$amp_live_list$$.prototype;
_.$JSCompiler_prototypeAlias$$.$isLayoutSupported$ = function($layout$jscomp$76$$) {
  return "container" == $layout$jscomp$76$$ || "fixed-height" == $layout$jscomp$76$$;
};
_.$JSCompiler_prototypeAlias$$.$buildCallback$ = function() {
  this.$viewport_$ = this.$getViewport$();
  this.$manager_$ = $liveListManagerForDoc$$module$extensions$amp_live_list$0_1$live_list_manager$$(this.$getAmpDoc$());
  this.$updateSlot_$ = _.$childElementByAttr$$module$src$dom$$(this.element, "update");
  this.$itemsSlot_$ = _.$childElementByAttr$$module$src$dom$$(this.element, "items");
  this.$paginationSlot_$ = _.$childElementByAttr$$module$src$dom$$(this.element, "pagination");
  this.$liveListId_$ = this.element.getAttribute("id");
  this.$pollInterval_$ = $getNumberMaxOrDefault$$module$extensions$amp_live_list$0_1$amp_live_list$$(this.element.getAttribute("data-poll-interval"), 15000);
  var $maxItems$$ = this.element.getAttribute("data-max-items-per-page"), $actualCount$$ = [].slice.call(this.$itemsSlot_$.children).filter(function($maxItems$$) {
    return !$maxItems$$.hasAttribute("data-tombstone");
  }).length;
  this.$maxItemsPerPage_$ = Math.max($getNumberMaxOrDefault$$module$extensions$amp_live_list$0_1$amp_live_list$$($maxItems$$, 1), $actualCount$$);
  _.$isExperimentOn$$module$src$experiments$$(this.$win$, "amp-live-list-sorting") && (this.$isReverseOrder_$ = "ascending" === this.element.getAttribute("sort"));
  this.$manager_$.register(this.$liveListId_$, this);
  $JSCompiler_StaticMethods_toggleUpdateButton_$$(this, !1);
  $JSCompiler_StaticMethods_eachChildElement_$$(this.$itemsSlot_$, function($maxItems$$) {
    $maxItems$$.classList.add("amp-live-list-item");
  });
  this.$curNumOfLiveItems_$ = $JSCompiler_StaticMethods_validateLiveListItems_$$(this, this.$itemsSlot_$, !0);
  _.$JSCompiler_StaticMethods_registerDefaultAction$$(this, this.$updateAction_$.bind(this), "update");
  this.element.hasAttribute("aria-live") || this.element.setAttribute("aria-live", "polite");
};
_.$JSCompiler_prototypeAlias$$.toggle = function($value$jscomp$265$$) {
  $value$jscomp$265$$ ? this.element.removeAttribute("disabled") : this.element.setAttribute("disabled", "");
};
_.$JSCompiler_prototypeAlias$$.update = function($updatedElement$$) {
  var $$jscomp$this$jscomp$758$$ = this, $container$jscomp$23_mutateItems$$ = _.$childElementByAttr$$module$src$dom$$($updatedElement$$, "items");
  if (!$container$jscomp$23_mutateItems$$) {
    return this.$updateTime_$;
  }
  $JSCompiler_StaticMethods_validateLiveListItems_$$(this, $container$jscomp$23_mutateItems$$);
  $container$jscomp$23_mutateItems$$ = $JSCompiler_StaticMethods_getUpdates_$$(this, $container$jscomp$23_mutateItems$$);
  $JSCompiler_StaticMethods_preparePendingItemsInsert_$$(this, $container$jscomp$23_mutateItems$$.$insert$);
  $JSCompiler_StaticMethods_preparePendingItemsReplace_$$(this, $container$jscomp$23_mutateItems$$.replace);
  this.$pendingItemsTombstone_$.push.apply(this.$pendingItemsTombstone_$, $container$jscomp$23_mutateItems$$.$tombstone$);
  this.$pendingPagination_$ = _.$childElementByAttr$$module$src$dom$$($updatedElement$$, "pagination");
  0 < this.$pendingItemsInsert_$.length ? this.$mutateElement$(function() {
    $JSCompiler_StaticMethods_toggleUpdateButton_$$($$jscomp$this$jscomp$758$$, !0);
    $$jscomp$this$jscomp$758$$.$viewport_$.$G$.update();
  }) : (0 < this.$pendingItemsReplace_$.length || 0 < this.$pendingItemsTombstone_$.length) && this.$updateAction_$();
  return this.$updateTime_$;
};
_.$JSCompiler_prototypeAlias$$.$updateAction_$ = function() {
  var $$jscomp$this$jscomp$759$$ = this, $hasInsertItems$$ = 0 < this.$pendingItemsInsert_$.length, $hasTombstoneItems$$ = 0 < this.$pendingItemsTombstone_$.length, $hasReplaceItems_updateHasNewItems$$ = 0 < this.$pendingItemsReplace_$.length;
  $hasReplaceItems_updateHasNewItems$$ = $hasInsertItems$$ || $hasReplaceItems_updateHasNewItems$$;
  var $promise$jscomp$50$$ = this.$mutateElement$(function() {
    var $hasReplaceItems_updateHasNewItems$$ = _.$JSCompiler_StaticMethods_assertElement$$(_.$user$$module$src$log$$(), $$jscomp$this$jscomp$759$$.$itemsSlot_$);
    $hasInsertItems$$ && ($JSCompiler_StaticMethods_eachChildElement_$$($hasReplaceItems_updateHasNewItems$$, function($$jscomp$this$jscomp$759$$) {
      $$jscomp$this$jscomp$759$$.classList.remove("amp-live-list-item-new");
    }), $$jscomp$this$jscomp$759$$.$curNumOfLiveItems_$ += $JSCompiler_StaticMethods_insert_$$($$jscomp$this$jscomp$759$$, $$jscomp$this$jscomp$759$$.$pendingItemsInsert_$), $$jscomp$this$jscomp$759$$.$pendingItemsInsert_$.length = 0);
    0 < $$jscomp$this$jscomp$759$$.$pendingItemsReplace_$.length && ($JSCompiler_StaticMethods_replace_$$($hasReplaceItems_updateHasNewItems$$, $$jscomp$this$jscomp$759$$.$pendingItemsReplace_$), $$jscomp$this$jscomp$759$$.$pendingItemsReplace_$.length = 0);
    0 < $$jscomp$this$jscomp$759$$.$pendingItemsTombstone_$.length && ($$jscomp$this$jscomp$759$$.$curNumOfLiveItems_$ -= $JSCompiler_StaticMethods_tombstone_$$($hasReplaceItems_updateHasNewItems$$, $$jscomp$this$jscomp$759$$.$pendingItemsTombstone_$), $$jscomp$this$jscomp$759$$.$pendingItemsTombstone_$.length = 0);
    ($hasInsertItems$$ || $hasTombstoneItems$$) && $$jscomp$this$jscomp$759$$.$paginationSlot_$ && $$jscomp$this$jscomp$759$$.$pendingPagination_$ && ($$jscomp$this$jscomp$759$$.element.replaceChild($$jscomp$this$jscomp$759$$.$pendingPagination_$, $$jscomp$this$jscomp$759$$.$paginationSlot_$), $$jscomp$this$jscomp$759$$.$paginationSlot_$ = _.$childElementByAttr$$module$src$dom$$($$jscomp$this$jscomp$759$$.element, "pagination"));
    $JSCompiler_StaticMethods_toggleUpdateButton_$$($$jscomp$this$jscomp$759$$, !1);
    $$jscomp$this$jscomp$759$$.$pendingPagination_$ = null;
    return $JSCompiler_StaticMethods_removeOverflowItems_$$($$jscomp$this$jscomp$759$$, $hasReplaceItems_updateHasNewItems$$);
  });
  $hasReplaceItems_updateHasNewItems$$ && ($promise$jscomp$50$$ = $promise$jscomp$50$$.then(function() {
    var $hasInsertItems$$ = $$jscomp$this$jscomp$759$$.$win$.document.createEvent("Event");
    $hasInsertItems$$.initEvent("amp:dom-update", !0, !0);
    $$jscomp$this$jscomp$759$$.$itemsSlot_$.dispatchEvent($hasInsertItems$$);
  }));
  $hasInsertItems$$ && ($promise$jscomp$50$$ = $promise$jscomp$50$$.then(function() {
    return _.$JSCompiler_StaticMethods_animateScrollIntoView$$($$jscomp$this$jscomp$759$$.$viewport_$, $$jscomp$this$jscomp$759$$.$isReverseOrder_$ && $$jscomp$this$jscomp$759$$.$itemsSlot_$.lastElementChild ? $$jscomp$this$jscomp$759$$.$itemsSlot_$.lastElementChild : $$jscomp$this$jscomp$759$$.element, 500, "ease-in", $$jscomp$this$jscomp$759$$.$isReverseOrder_$ ? "bottom" : "top");
  }));
  return $promise$jscomp$50$$;
};
_.$JSCompiler_prototypeAlias$$.$sortByDataSortTime_$ = function($a$jscomp$257$$, $b$jscomp$227$$) {
  return $JSCompiler_StaticMethods_getSortTime_$$($a$jscomp$257$$) - $JSCompiler_StaticMethods_getSortTime_$$($b$jscomp$227$$);
};
window.self.AMP.registerElement("amp-live-list", $AmpLiveList$$module$extensions$amp_live_list$0_1$amp_live_list$$, "amp-live-list>[update]{position:relative;z-index:1000}amp-live-list>.amp-active[update]{display:block}amp-live-list>[items]>[data-tombstone]{display:none}@-webkit-keyframes amp-live-list-item-highlight{0%{box-shadow:0 0 5px 2px #51cbee}to{box-shadow:0}}@keyframes amp-live-list-item-highlight{0%{box-shadow:0 0 5px 2px #51cbee}to{box-shadow:0}}\n/*# sourceURL=/extensions/amp-live-list/0.1/amp-live-list.css*/");

})});
